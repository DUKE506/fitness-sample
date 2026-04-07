# Issues

---

## [RESOLVED] Server Action 내 profiles 쿼리 null 반환

**발생 일자**: 2026-04-06 16:58
**해결 일자**: 2026-04-06

**재현 경로**: 로그인 폼 제출 → `signInWithPassword` Server Action

**증상**:

- `supabase.auth.signInWithPassword()` 성공
- `supabase.auth.getUser()` → user 정상 반환
- `supabase.from('profiles').select('role').eq('id', user.id).single()` → `null` 반환
- profiles 테이블에 해당 UUID row 존재 확인됨
- RLS 정책 존재 확인됨 (`Users can view own profile`: `auth.uid() = id`)

**로그**:

```
[auth.ts] user.id: 549ebe9c-75ff-4ea3-8e17-cacd92448689
[auth.ts] profile: null
[auth.ts] profileError: {"code":"42P17","details":null,"hint":null,"message":"infinite recursion detected in policy for relation \"profiles\""}
```

**원인**: `"Admin full access to profiles"` RLS 정책 무한 재귀

profiles 정책 안에서 다시 profiles를 조회하는 구조로 인해 무한 루프 발생.

```sql
-- 문제가 된 정책
EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
```

**해결**: `SECURITY DEFINER` 함수로 분리하여 RLS 우회

```sql
DROP POLICY "Admin full access to profiles" ON public.profiles;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

CREATE POLICY "Admin full access to profiles"
  ON public.profiles FOR ALL
  USING (public.get_my_role() = 'admin');
```
