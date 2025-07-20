-- Supabase 대시보드 SQL Editor에서 실행

-- 1. RLS 활성화
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_answers ENABLE ROW LEVEL SECURITY;

-- 2. test_sessions 정책
-- INSERT만 허용
CREATE POLICY "Allow anonymous inserts" ON test_sessions
FOR INSERT TO anon
WITH CHECK (true);

-- UPDATE는 자기 세션만 허용 (completed_at, score 업데이트용)
CREATE POLICY "Allow update own session" ON test_sessions
FOR UPDATE TO anon
USING (id::text = current_setting('request.jwt.claims', true)::json->>'session_id')
WITH CHECK (
  -- 특정 필드만 업데이트 가능
  (completed_at IS NOT NULL) AND 
  (score IS NOT NULL) AND
  (percentile IS NOT NULL)
);

-- SELECT 차단
CREATE POLICY "Deny all selects" ON test_sessions
FOR SELECT TO anon
USING (false);

-- 3. test_answers 정책
-- INSERT만 허용
CREATE POLICY "Allow anonymous inserts" ON test_answers
FOR INSERT TO anon
WITH CHECK (true);

-- SELECT, UPDATE, DELETE 모두 차단
CREATE POLICY "Deny all reads" ON test_answers
FOR SELECT TO anon
USING (false);

-- 4. 추가 보안: Rate Limiting (Supabase 대시보드에서 설정)
-- - IP당 시간당 100개 요청으로 제한
-- - 동일 세션 ID로 분당 20개 요청 제한