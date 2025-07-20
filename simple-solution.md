# 간단한 해결 방법

## 옵션 1: RLS 완전 비활성화 (개발/테스트용)

```sql
-- Supabase SQL Editor에서 실행
ALTER TABLE test_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE test_answers DISABLE ROW LEVEL SECURITY;
```

⚠️ 주의: 이렇게 하면 누구나 모든 데이터를 읽고 쓸 수 있습니다.

## 옵션 2: 새 프로젝트 생성

1. Supabase에서 새 프로젝트 생성
2. 테이블만 생성하고 RLS는 비활성화 상태로 두기
3. 나중에 보안이 필요하면 RLS 추가

## 옵션 3: 오프라인 모드로만 진행

현재 코드는 Supabase 연결 실패 시 자동으로 오프라인 모드로 전환됩니다.
`.env` 파일을 비워두거나 잘못된 키를 넣으면 오프라인 모드로 작동합니다.

## 권장사항

지금은 **옵션 1**을 사용해서 개발을 완료하고, 
나중에 필요하면 RLS를 다시 설정하는 것을 추천합니다.

```sql
-- 개발 완료 후 RLS 재활성화
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_insert" ON test_sessions FOR INSERT WITH CHECK (true);
```