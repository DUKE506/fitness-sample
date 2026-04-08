# Issues

---

## [RESOLVED] 예약 취소 — RLS 미설정으로 회원의 cancelReservation 무응답

**발생 일자**: 2026-04-08
**해결 일자**: 2026-04-08

**재현 경로**: 내 스케줄(`/my-schedule`) → 예약 변경 → 확인 → `/apply` 이동 후 DB 확인

**증상**:

- `cancelReservation` Server Action이 `success: true`를 반환하고 `/apply`로 이동하지만, DB의 예약 `status`가 `confirmed` 그대로 유지됨
- 세션 복구도 일어나지 않음
- `/my-schedule` 복귀 시 예약이 여전히 예정된 예약 목록에 표시됨

**원인**: `reservations` 테이블 RLS 정책에 회원의 UPDATE 권한이 없었음.

- `cancel_reservation_with_session_restore` RPC 내부에서 `UPDATE reservations SET status = 'cancelled'` 실행 시 RLS에 막혀 0 rows affected
- RPC가 `returns void`라 에러 없이 정상 종료 → 액션에서 `success: true` 반환
- 기존 UPDATE 정책: 트레이너(`"Trainers can approve/reject reservations"`)와 어드민만 존재

**해결**: Supabase Dashboard에서 회원 전용 UPDATE 정책 추가.

```sql
create policy "Members cancel own reservations"
  on public.reservations for update
  using (
    member_id in (select id from public.members where profile_id = auth.uid())
  )
  with check (
    member_id in (select id from public.members where profile_id = auth.uid())
  );
```

---

## [RESOLVED] PT 신청 멀티스텝 — "트레이너 변경" 클릭 시 현재 페이지로 redirect 루프

**발생 일자**: 2026-04-08
**해결 일자**: 2026-04-08

**재현 경로**: 트레이너 상세(`/trainers/[id]`) → "PT 신청하기" → `/apply?trainer=[id]` → (자동 redirect) `/apply/time` → "트레이너 변경" 클릭

**증상**:

- "트레이너 변경" 클릭 시 `/apply` 트레이너 선택 화면으로 이동해야 하는데, 현재 페이지(`/apply/time`)로 재redirect됨
- 하단 플로팅 탭바에서 `/apply` 직접 진입 후 트레이너 선택 → `/apply/time` 경로에서는 정상 동작

**원인**: 히스토리 스택과 redirect 방식의 조합 문제

1. `trainer-select-list.tsx`가 `preselectedId` 감지 시 `router.push('/apply/time')`를 사용 → 히스토리에 `/apply?trainer=[id]`가 남음
2. `/apply/time`에서 "트레이너 변경"이 `router.back()` 사용 → `/apply?trainer=[id]`로 복귀
3. `/apply?trainer=[id]`에서 다시 `preselectedId` 감지 → `/apply/time`으로 redirect → 무한 루프

```
히스토리: /trainers/[id] → /apply?trainer=[id] → /apply/time
back() → /apply?trainer=[id] → (preselect 재발동) → /apply/time → 루프
```

**해결**:

1. `trainer-select-list.tsx`: preselect redirect를 `router.push` → `router.replace`로 변경 → `/apply?trainer=[id]`가 히스토리에서 제거됨
2. `apply/time/page.tsx`: `router.back()` → `router.push('/apply')`로 변경 → 어느 경로로 진입하든 명시적으로 트레이너 선택 페이지로 이동

```ts
// trainer-select-list.tsx
// 변경 전
router.push('/apply/time')
// 변경 후
router.replace('/apply/time')

// apply/time/page.tsx
// 변경 전
router.back()
// 변경 후
router.push('/apply')
```

**교훈**: 멀티스텝 플로우에서 특정 URL이 자동 redirect를 포함할 경우, `router.push` 대신 `router.replace`를 사용해 히스토리에서 제거해야 함. 또한 "뒤로가기" 버튼은 `router.back()` 대신 명시적 경로로 이동하는 것이 안전함.

---

## [OPEN] 개발용 회원가입 — naver.com 등 일부 이메일 도메인 차단

**발생 일자**: 2026-04-07

**재현 경로**: 로그인 페이지 > 임시 회원가입 폼 > `member1@naver.com` 입력 → 제출

**증상**:

- `signUpForDev` Server Action 실행 시 Supabase에서 에러 반환
- `supabase.auth.signUp()` (일반 클라이언트) 및 `admin.auth.admin.createUser()` (Admin 클라이언트) 모두 동일 에러
- 로그: `GET /login?error=Email+address+%22member1%40naver.com%22+is+invalid`

**원인**: Supabase 프로젝트 Auth 설정에서 이메일 도메인 제한 또는 이메일 검증 서비스가 특정 도메인을 차단. Admin API도 우회 불가.

**해결 방법**: Supabase Dashboard > Authentication > Settings > "Email provider" 항목에서 도메인 제한 설정 확인 및 해제. 또는 개발 시 `@test.com`, `@example.com` 등 허용 도메인 사용.

---

## [RESOLVED] 개발용 회원가입 — redirect 한국어 메시지로 인한 500 에러

**발생 일자**: 2026-04-07
**해결 일자**: 2026-04-07

**재현 경로**: `signUpForDev` 성공 시 `redirect("/login?message=가입이 완료되었습니다. 로그인해주세요.")` 호출

**증상**:

- `POST /login 500`
- `TypeError: Invalid character in header content ["x-action-redirect"]`
- `code: 'ERR_INVALID_CHAR'`

**원인**: Next.js 16 `redirect()`는 redirect 경로를 HTTP 헤더(`x-action-redirect`)로 전달하는데, 비ASCII(한국어) 문자가 포함된 URL을 그대로 헤더에 넣으면 Node.js가 `ERR_INVALID_CHAR`로 거부함.

**해결**: `encodeURIComponent()`로 인코딩. `src/actions/auth.ts` 수정.

```ts
// 변경 전
redirect("/login?message=가입이 완료되었습니다. 로그인해주세요.");

// 변경 후
redirect("/login?message=" + encodeURIComponent("가입이 완료되었습니다. 로그인해주세요."));
```

---

## [RESOLVED] 로그인 후 /trainers 대신 /login으로 redirect되는 문제

**발생 일자**: 2026-04-07
**해결 일자**: 2026-04-07

**재현 경로**: member 계정으로 로그인 → `signInWithPassword` → `redirect('/trainers')` 호출 → 브라우저가 `/login`에 도달

**증상**:

```
failed to get redirect response TypeError: fetch failed
  [cause]: Error: redirect count exceeded
POST /login 303 in 3.0s
GET /login 200
```

**원인**: `proxy.ts`의 trainer 경로 guard에서 `pathname.startsWith('/trainer')`가 `/trainers`도 매칭함. member가 `/trainers`에 접근하면 proxy가 role 체크 후 `/trainers`로 재redirect → 무한 루프 발생.

```ts
// 문제가 된 코드
if (pathname.startsWith('/trainer')) { ... }
// /trainers.startsWith('/trainer') === true → member도 걸림
```

**해결**: `src/proxy.ts`에서 `/trainer` 경로 매칭을 정확한 조건으로 수정.

```ts
// 변경 전
if (pathname.startsWith('/trainer')) {

// 변경 후
if (pathname === '/trainer' || pathname.startsWith('/trainer/')) {
```

---

## [RESOLVED] TrainerCard — profiles null로 인한 런타임 에러

**발생 일자**: 2026-04-07
**해결 일자**: 2026-04-07

**재현 경로**: member 로그인 → `/trainers` 페이지 진입 → TrainerCard 렌더링

**증상**:

```
Uncaught TypeError: Cannot read properties of null (reading 'name')
at TrainerCard (src/components/trainer/trainer-card.tsx:41:29)
```

**원인**: Supabase에서 `trainers`와 `profiles`를 조인 조회할 때 `profile_id`에 연결된 profiles row가 없거나 RLS로 인해 조회가 막히면 `profiles`가 `null`로 반환됨. 컴포넌트에서 null 가드 없이 `profiles.name`에 접근해서 에러 발생.

**해결**: `src/components/trainer/trainer-card.tsx`에 null 가드 추가.

```ts
if (!profiles) return null
```

---

## [RESOLVED] 개발용 회원가입 — signUpForDev에서 Admin API 미사용으로 도메인 차단

**발생 일자**: 2026-04-07
**해결 일자**: 2026-04-07

**재현 경로**: 임시 회원가입 폼 제출 → `supabase.auth.signUp()` 호출

**증상**: `test.com` 등 일부 도메인에서 이메일 검증 에러 발생. 이메일 인증 메일 발송으로 즉시 로그인 불가.

**원인**: `signUpForDev`가 일반 클라이언트의 `auth.signUp()`을 사용 → Supabase 이메일 검증 정책 적용, 이메일 인증 대기 상태로 생성.

**해결**: `admin.auth.admin.createUser()`로 교체 + `email_confirm: true` 설정. `src/actions/auth.ts` 수정.

```ts
// 변경 전
await supabase.auth.signUp({ email, password, options: { data: { name } } })

// 변경 후
await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { name },
})
```

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
