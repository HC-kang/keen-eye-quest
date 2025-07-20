# Supabase 설정 및 테스트 가이드

## 1. Supabase Dashboard에서 SQL 실행

1. [Supabase Dashboard](https://supabase.com/dashboard) 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. 다음 SQL을 순서대로 실행:

### 옵션 A: 전체 설정 (권장)
`supabase-rls-setup.sql` 파일의 내용 전체를 복사해서 실행

### 옵션 B: 빠른 설정 (최소)
`supabase-quick-setup.sql` 파일의 내용을 복사해서 실행

## 2. Publishable Key 확인

1. Supabase Dashboard > Settings > API
2. **Project API keys** 섹션에서 `anon` `public` 키 복사
3. `.env` 파일 생성 (`.env.example` 참고):

```bash
VITE_SUPABASE_URL=https://tdedaytbckiqfmbsspxp.supabase.co
VITE_SUPABASE_ANON_KEY=여기에_publishable_key_붙여넣기
```

## 3. 연결 테스트

### 방법 1: HTML 테스트 파일 사용
1. `test-supabase.html` 파일을 열어서 14번째 줄의 `YOUR_KEY_HERE`를 실제 키로 교체
2. 브라우저에서 파일 열기
3. 결과 확인

### 방법 2: 앱에서 직접 테스트
```bash
npm run dev
```

개발자 콘솔을 열어서 다음 확인:
- Supabase URL이 올바르게 출력되는지
- 401 에러가 발생하지 않는지

## 4. 일반적인 문제 해결

### 401 Unauthorized 에러
- Publishable key가 올바른지 확인
- URL이 정확한지 확인 (https:// 포함)
- RLS 정책이 적용되었는지 확인

### RLS 정책 확인 SQL
```sql
-- RLS 활성화 상태 확인
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('test_sessions', 'test_answers');

-- 정책 목록 확인
SELECT * FROM pg_policies 
WHERE tablename IN ('test_sessions', 'test_answers');
```

### 테이블이 없다는 에러
- SQL Editor에서 테이블 생성 부분을 다시 실행

## 5. 배포 준비

1. `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
2. 배포 플랫폼(Vercel, Netlify 등)에서 환경 변수 설정:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 보안 참고사항

- Publishable (anon) key는 클라이언트에 노출되어도 안전
- RLS 정책으로 INSERT만 허용하도록 설정됨
- Secret key는 절대 클라이언트에 포함하지 말 것