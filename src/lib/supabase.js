import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from './config'

const { url: supabaseUrl, anonKey: supabaseAnonKey } = supabaseConfig

// 개발 환경에서만 디버깅
if (import.meta.env.DEV) {
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Key exists:', !!supabaseAnonKey)
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 설정이 없습니다. 오프라인 모드로 작동합니다.')
}

// URL 유효성 검사
let isValidUrl = false
if (supabaseUrl) {
  try {
    new URL(supabaseUrl)
    isValidUrl = true
  } catch (e) {
    console.error('Invalid Supabase URL:', supabaseUrl)
  }
}

export const supabase = supabaseUrl && supabaseAnonKey && isValidUrl
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })
  : null

// Insert 전용 함수들
export const insertTestSession = async (deviceInfo) => {
  if (!supabase) {
    return { data: { id: `offline-${Date.now()}` }, error: null }
  }

  try {
    // 방법 1: 함수 호출
    const { data: sessionId, error: funcError } = await supabase
      .rpc('create_test_session', {
        p_device_info: deviceInfo
      })
    
    if (!funcError && sessionId) {
      console.log('Session created via function:', sessionId)
      return { data: { id: sessionId }, error: null }
    }
    
    // 방법 2: 직접 INSERT
    const { data, error } = await supabase
      .from('test_sessions')
      .insert({
        device_info: deviceInfo,
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single()
    
    if (error) {
      console.error('Supabase insert error:', error)
      // 오프라인 모드로 전환
      return { data: { id: `offline-${Date.now()}` }, error: null }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Session insert error:', error)
    return { data: { id: `offline-${Date.now()}` }, error }
  }
}

export const insertTestAnswer = async (answer) => {
  if (!supabase) return { success: true, error: null }

  try {
    const { error } = await supabase
      .from('test_answers')
      .insert({
        session_id: answer.session_id,
        question_number: answer.questionId,
        category: answer.category,
        left_resolution: answer.leftImage,
        right_resolution: answer.rightImage,
        correct_answer: answer.correctAnswer,
        user_answer: answer.userAnswer,
        response_time_ms: answer.responseTime,
        is_retest: answer.isRetest,
      })
    
    if (error) {
      console.error('Answer insert error:', error)
    }
    
    return { success: !error, error }
  } catch (error) {
    console.error('Answer insert error:', error)
    return { success: false, error }
  }
}

export const updateTestSession = async (sessionId, updateData) => {
  if (!supabase || sessionId.startsWith('offline-')) {
    return { success: true, error: null }
  }

  try {
    const { error } = await supabase
      .from('test_sessions')
      .update({
        completed_at: new Date().toISOString(),
        ...updateData
      })
      .eq('id', sessionId)
    
    if (error) {
      console.error('Session update error:', error)
    }
    
    return { success: !error, error }
  } catch (error) {
    console.error('Session update error:', error)
    return { success: false, error }
  }
}