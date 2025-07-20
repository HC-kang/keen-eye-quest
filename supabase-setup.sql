-- Supabase 설정 (최종 버전)
-- SQL Editor에서 실행

-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS test_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_info JSONB NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_questions INTEGER,
  correct_count INTEGER,
  accuracy DECIMAL(5,4),
  consistency_score DECIMAL(5,4),
  detection_rates JSONB,
  category_scores JSONB,
  avg_response_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES test_sessions(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  left_resolution VARCHAR(10) NOT NULL,
  right_resolution VARCHAR(10) NOT NULL,
  correct_answer VARCHAR(10) NOT NULL,
  user_answer VARCHAR(10) NOT NULL,
  response_time_ms INTEGER NOT NULL,
  is_retest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS 활성화
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_answers ENABLE ROW LEVEL SECURITY;

-- 3. 기존 정책 삭제
DROP POLICY IF EXISTS "Enable insert for all users" ON test_sessions;
DROP POLICY IF EXISTS "Enable insert for all users" ON test_answers;

-- 4. INSERT 정책 생성
CREATE POLICY "Enable insert for all users" ON test_sessions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON test_answers
FOR INSERT WITH CHECK (true);

-- 5. 권한 부여
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON test_sessions TO anon;
GRANT INSERT ON test_answers TO anon;

-- 6. 함수 생성 (대체 방법)
CREATE OR REPLACE FUNCTION public.create_test_session(p_device_info jsonb)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO test_sessions (device_info)
  VALUES (p_device_info)
  RETURNING id;
$$;

GRANT EXECUTE ON FUNCTION public.create_test_session TO anon;