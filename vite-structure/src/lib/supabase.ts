import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 클라이언트 전용 - anon key만 사용
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 인증 불필요
    autoRefreshToken: false,
  }
})

// Insert 전용 함수들
export const insertTestSession = async (deviceInfo: any) => {
  const { data, error } = await supabase
    .from('test_sessions')
    .insert({
      device_info: deviceInfo,
      started_at: new Date().toISOString(),
    })
    .select()
    .single()
  
  return { data, error }
}

export const insertTestAnswer = async (answer: any) => {
  const { data, error } = await supabase
    .from('test_answers')
    .insert(answer)
  
  return { data, error }
}

export const updateTestSession = async (sessionId: string, updates: any) => {
  const { data, error } = await supabase
    .from('test_sessions')
    .update(updates)
    .eq('id', sessionId)
  
  return { data, error }
}