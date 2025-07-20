import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      // 추가 보안 헤더
      'X-Client-Info': 'keen-eye-quest/1.0',
    },
  },
})

// 안전한 Insert 함수들 (에러 처리 포함)
export const insertTestSession = async (deviceInfo: any) => {
  try {
    // 입력 검증
    if (!deviceInfo || typeof deviceInfo !== 'object') {
      throw new Error('Invalid device info')
    }

    const { data, error } = await supabase
      .from('test_sessions')
      .insert({
        device_info: deviceInfo,
        started_at: new Date().toISOString(),
      })
      .select('id') // ID만 반환
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Session insert error:', error)
    return { data: null, error }
  }
}

export const insertTestAnswer = async (answer: any) => {
  try {
    // 입력 검증
    const validatedAnswer = {
      session_id: answer.session_id,
      question_number: parseInt(answer.questionId),
      category: answer.category,
      left_resolution: answer.leftImage,
      right_resolution: answer.rightImage,
      correct_answer: answer.correctAnswer,
      user_answer: answer.userAnswer,
      response_time_ms: parseInt(answer.responseTime),
      is_retest: Boolean(answer.isRetest),
    }

    const { error } = await supabase
      .from('test_answers')
      .insert(validatedAnswer)
    
    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Answer insert error:', error)
    return { success: false, error }
  }
}

export const completeTestSession = async (
  sessionId: string, 
  score: number, 
  percentile: number
) => {
  try {
    // 입력 검증
    if (!sessionId || score < 0 || score > 100) {
      throw new Error('Invalid parameters')
    }

    const { error } = await supabase
      .from('test_sessions')
      .update({
        completed_at: new Date().toISOString(),
        score: Math.round(score),
        percentile: Math.round(percentile),
      })
      .eq('id', sessionId)
    
    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Session update error:', error)
    return { success: false, error }
  }
}

// Rate limiting helper
const requestCounts = new Map<string, number>()
const REQUEST_LIMIT = 50 // 분당 50개 요청

export const checkRateLimit = (key: string): boolean => {
  const now = Date.now()
  const minute = Math.floor(now / 60000)
  const rateLimitKey = `${key}-${minute}`
  
  const count = requestCounts.get(rateLimitKey) || 0
  if (count >= REQUEST_LIMIT) {
    return false
  }
  
  requestCounts.set(rateLimitKey, count + 1)
  
  // 오래된 엔트리 정리
  for (const [k] of requestCounts) {
    const keyMinute = parseInt(k.split('-').pop() || '0')
    if (minute - keyMinute > 1) {
      requestCounts.delete(k)
    }
  }
  
  return true
}