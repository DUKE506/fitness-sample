# TODO - 구현 체크리스트

> 각 Phase 순서대로 진행. 하위 항목은 상위 완료를 위한 세부 작업.

---

## Phase 0: 프로젝트 기초 설정

- [x] 패키지 설치
  - [x] `@supabase/ssr` + `@supabase/supabase-js` 설치
  - [x] `zustand` 설치
  - [x] `date-fns` 설치
  - [x] `recharts` 설치
  - [x] `zod` 설치
  - [x] `@tanstack/react-table` 설치
  - [x] `serwist` + `@serwist/next` 설치
  - [x] `lucide-react` 설치
  - [x] `clsx` + `tailwind-merge` 설치
  - [x] `sonner` 설치
- [x] Supabase 프로젝트 생성 + 환경변수 설정
  - [x] Supabase 프로젝트 생성
  - [x] `.env.local` 파일 생성 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
  - [x] `.env.local`을 `.gitignore`에 추가 확인
- [x] Supabase 클라이언트 셋업
  - [x] `lib/supabase/client.ts` (브라우저용)
  - [x] `lib/supabase/server.ts` (서버 컴포넌트용, async cookies)
  - [x] `lib/supabase/admin.ts` (Service Role 클라이언트)
- [x] 유틸리티 함수
  - [x] `lib/utils/cn.ts` (clsx + tailwind-merge)
  - [x] `lib/utils/date.ts` (date-fns 래퍼)
  - [x] `lib/utils/format.ts` (금액 포맷 등)
  - [x] `lib/constants.ts` (역할, 상태값 상수)
- [x] 한국어 폰트 설정
  - [x] Noto Sans KR 웹폰트 적용 (Google Fonts, globals.css)
  - [x] 루트 layout.tsx에 폰트 설정
- [x] 자체 UI 컴포넌트 기초 개발
  - [x] Button 컴포넌트 (variant: primary, secondary, outline, ghost, danger)
  - [x] Input 컴포넌트 (text, password, search)
  - [x] Select 컴포넌트
  - [x] Dialog/Modal 컴포넌트
  - [x] Card 컴포넌트
  - [x] Badge 컴포넌트
  - [x] Toast 컴포넌트 (sonner 래핑)
  - [x] Table 컴포넌트 (@tanstack/react-table 래핑)
  - [x] Tabs 컴포넌트
  - [x] Spinner/Loading 컴포넌트
- [x] 레이아웃 스캐폴딩
  - [x] 루트 `app/layout.tsx` (폰트, Providers, 메타데이터)
  - [x] `app/(auth)/layout.tsx` (인증 페이지 공통)
  - [x] `app/(admin)/layout.tsx` (관리자 사이드바)
  - [x] `app/(user)/layout.tsx` (사용자 하단 탭바)
- [x] Zustand 스토어 기초
  - [x] `stores/use-auth-store.ts` (현재 유저, role)
  - [x] `stores/use-schedule-store.ts` (선택 날짜, 뷰 모드)
  - [x] `stores/use-reservation-store.ts` (PT 신청 플로우 상태)

---

## Phase 1: 데이터베이스 + 인증

- [x] Supabase 데이터베이스 구축 (참조: `docs/db-schema.md`)
  - [x] 전체 테이블 생성 SQL 실행
  - [x] RLS 정책 적용
  - [x] Database Functions (RPC) 생성
    - [x] `get_available_slots(trainer_id, date)`
    - [x] `create_reservation_with_session_decrement(...)`
    - [x] `cancel_reservation_with_session_restore(...)`
    - [x] `get_monthly_revenue(year, month)`
    - [x] `get_trainer_revenue(trainer_id, year, month)`
  - [x] DB Trigger: 회원가입 시 profiles 자동 생성
  - [x] DB Seed: admin 기본 계정 생성 (id: admin, pw: admin)
- [x] TypeScript 타입 생성
  - [x] `supabase gen types typescript` 실행
  - [x] `lib/types/database.ts` 생성
  - [x] `lib/types/index.ts` 앱 공통 타입 정의
- [x] 인증 구현
  - [ ] 카카오 OAuth 설정 (Kakao Developers 앱 등록 + Supabase Provider 설정)
  - [x] 로그인 페이지 개발 (`app/(auth)/login/page.tsx`)
    - [ ] 카카오 로그인 버튼 (회원용) — 추후 활성화
    - [x] 관리자 로그인 폼 (ID/PW 입력, admin/trainer용)
    - [x] 개발용 임시 회원가입 기능
  - [x] OAuth 콜백 Route Handler (`app/api/auth/callback/route.ts`)
  - [x] `proxy.ts` 인증 가드 구현
    - [x] 공개 경로 통과 처리
    - [x] 미인증 시 `/login` 리다이렉트
    - [x] admin 경로 role 체크
  - [x] Server Actions (`actions/auth.ts`)
    - [x] 관리자 ID/PW 로그인 액션
    - [x] 로그아웃 액션
- [x] Zod 유효성 검증 스키마
  - [x] `lib/validations/reservation.ts`
  - [x] `lib/validations/trainer.ts`
  - [x] `lib/validations/member.ts`
- [x] 개발용 mockup 데이터 시드 스크립트

---

## Phase 2: 관리자 - 트레이너 관리

<!-- 세션 2-A: 관리자 레이아웃 컴포넌트 ✅ -->
- [x] 관리자 레이아웃 컴포넌트
  - [x] `components/layout/admin-sidebar.tsx` (사이드바 네비게이션)
    - [x] 메뉴 항목: 대시보드, 트레이너관리, 회원관리, 전체스케줄, 매출관리
    - [x] 모바일: 햄버거 메뉴 토글
    - [x] 현재 경로 활성 상태 표시
  - [x] `components/layout/header.tsx` (상단 헤더)
    - [x] 사용자 정보 표시
    - [x] 로그아웃 버튼
<!-- 세션 2-B: 트레이너 목록 페이지 ✅ -->
- [x] 트레이너 목록 페이지 (`app/(admin)/admin/trainers/page.tsx`)
  - [x] 데이터 테이블 구현 (이름, 전문분야, 경력, 활성상태)
  - [ ] 검색 기능
  - [x] 트레이너 등록 버튼 → `/admin/trainers/new`
  - [x] Server Component에서 Supabase 직접 쿼리
<!-- 세션 2-C: 트레이너 등록 페이지 + actions/trainers.ts ✅ -->
- [x] 트레이너 등록 페이지 (`app/(admin)/admin/trainers/new/page.tsx`)
  - [x] `components/forms/trainer-form.tsx` 폼 컴포넌트
    - [x] 계정 정보 입력 (이메일, 비밀번호)
    - [x] 기본 정보 입력 (이름, 연락처, 소개글)
    - [x] 전문분야 태그 입력
    - [x] 자격증 목록 입력
    - [x] 경력 연수 입력
    - [x] 시간당 요금 입력
    - [ ] 프로필 사진 업로드 (Supabase Storage)
  - [x] `actions/trainers.ts` Server Action
    - [x] Supabase Admin API로 auth 계정 생성
    - [x] profiles 테이블에 role='trainer' 레코드 생성
    - [x] trainers 테이블에 상세 정보 저장
<!-- 세션 2-D: 트레이너 상세/수정 페이지 ✅ -->
- [x] 트레이너 상세/수정 페이지 (`app/(admin)/admin/trainers/[id]/page.tsx`)
  - [x] 트레이너 정보 조회 (Server Component)
  - [x] 수정 폼 (trainer-form.tsx 재사용)
  - [x] 비활성화(삭제) 기능
  - [x] 담당 회원 목록 표시
<!-- 세션 2-E: 트레이너 스케줄 설정 ✅ -->
- [x] 트레이너별 스케줄 설정 (`app/(admin)/admin/trainers/[id]/schedule/page.tsx`)
  - [x] `components/forms/schedule-form.tsx`
    - [x] 요일별 근무시간 토글 (on/off)
    - [x] 요일별 시작/종료 시간 설정
    - [x] 슬롯 단위(분) 설정
  - [x] 휴무일 관리
    - [x] 캘린더에서 휴무일 선택/해제
    - [x] 사유 입력
  - [x] `actions/schedules.ts` Server Action
    - [x] trainer_schedules CRUD
    - [x] trainer_day_offs CRUD

---

## Phase 3: 관리자 - 회원 관리

<!-- 세션 3-A: 회원 목록 페이지 ✅ -->
- [x] 회원 목록 페이지 (`app/(admin)/admin/members/page.tsx`)
  - [x] 데이터 테이블 (이름, 연락처, 회원유형, 담당트레이너, 활성상태)
  - [x] 검색 기능 (이름, 전화번호)
  - [x] 필터 (회원유형: 일반/PT, 상태: 활성/비활성)
  - [x] URL searchParams 기반 서버사이드 필터링
<!-- 세션 3-B: 회원 상세 - 기본정보 + actions/members.ts ✅ -->
- [x] 회원 상세 페이지 (`app/(admin)/admin/members/[id]/page.tsx`)
  - [x] 회원 기본정보 카드
  - [x] 회원 타입 변경 기능 (일반 ↔ PT)
  <!-- 세션 3-C: PT 패키지 섹션 + actions/payments.ts ✅ -->
  - [x] PT 패키지 섹션
    - [x] 현재 활성 패키지 (잔여횟수, 만료일)
    - [x] PT 패키지 등록 폼 (admin이 결제 처리)
      - [x] 트레이너 선택
      - [x] 세션 수 / 가격 입력
      - [x] 결제 수단 선택 (카드/현금/계좌이체)
    - [x] 패키지 이력 목록
  <!-- 세션 3-D: 예약 이력 섹션 ✅ -->
  - [x] 예약 이력 섹션
    - [x] 타임라인 형태 예약 이력
    - [x] 다음 예약 일정 D-day 표시
  - [x] `actions/members.ts` Server Action
    - [x] 회원 타입 변경
    - [x] 담당 트레이너 배정
  - [x] `actions/payments.ts` Server Action
    - [x] PT 패키지 등록 + 결제 내역 생성

---

## Phase 4: 사용자 - 트레이너 정보 + PT 신청

<!-- 세션 4-A: 사용자 레이아웃 + 트레이너 목록 ✅ -->
- [x] 사용자 레이아웃 컴포넌트
  - [x] `components/layout/user-tab-bar.tsx` (하단 탭바, floating 스타일)
    - [x] 탭: 트레이너, 내스케줄, PT신청, 프로필
    - [x] 아이콘 + 라벨
    - [x] 현재 경로 활성 상태
  - [x] `app/(user)/layout.tsx` 탭바 연결
- [x] 트레이너 목록 페이지 (`app/(user)/trainers/page.tsx`)
  - [x] `components/trainer/specialty-badge.tsx` 전문분야 배지
  - [x] `components/trainer/trainer-card.tsx` 카드 컴포넌트
    - [x] 프로필 사진
    - [x] 이름, 경력
    - [x] 전문분야 배지
  - [x] 카드 그리드 레이아웃 (모바일 1열, 태블릿+ 2열)
  - [x] 전문분야별 필터
<!-- 세션 4-B: 트레이너 상세 페이지 ✅ -->
- [x] 트레이너 상세 페이지 (`app/(user)/trainers/[id]/page.tsx`)
  - [x] 프로필 사진 + 소개글
  - [x] 전문분야, 자격증, 경력 상세
  - [x] 이번 주 가능 시간대 미리보기 (`get_available_slots` 활용)
  - [x] "PT 신청하기" CTA 버튼 → `/apply?trainer=[id]`
<!-- 세션 4-C: PT 신청 Step 1~2 (트레이너 선택 + 날짜/시간) ✅ -->
- [x] PT 신청 - Step 1: 트레이너 선택 (`app/(user)/apply/page.tsx`)
  - [x] `stores/use-reservation-store.ts` 상태 확인/보완
  - [x] 트레이너 카드 목록 (간략 버전)
  - [x] 선택 시 Zustand store에 저장 + `/apply/time` 이동
- [x] PT 신청 - Step 2: 날짜/시간 선택 (`app/(user)/apply/time/page.tsx`)
  - [x] `hooks/use-available-slots.ts` 가용 슬롯 조회 훅
  - [x] `components/schedule/calendar-view.tsx` 날짜 선택 캘린더
  - [x] `components/schedule/time-slot-picker.tsx` 시간 슬롯 선택
    - [x] `get_available_slots` RPC 호출
    - [x] 가용/불가 슬롯 시각적 구분
    - [x] 선택 상태 관리
<!-- 세션 4-D: PT 신청 Step 3 + actions/reservations.ts ✅ -->
- [x] PT 신청 - Step 3: 완료 (`app/(user)/apply/complete/page.tsx`)
  - [x] `actions/reservations.ts` Server Action (`create_reservation_with_session_decrement` RPC 호출)
  - [x] 선택 내역 요약 (트레이너, 날짜, 시간)
  - [x] "신청하기" 버튼
  - [x] 성공 화면 + 내 스케줄 이동 버튼
  - [x] 실패 시 에러 안내

---

## Phase 5: 스케줄 관리

<!-- 세션 5-A: 공유 컴포넌트 + Server Actions 보완 ✅ -->
- [x] 공유 컴포넌트
  - [x] `components/schedule/reservation-card.tsx` 예약 블록
    - [x] 회원명, 시간, 상태 배지
    - [x] 클릭 시 상세 모달
  - [x] `components/schedule/d-day-badge.tsx` 다음 세션 D-day
- [x] `actions/reservations.ts` 보완
  - [x] 예약 승인 액션 (status → 'confirmed')
  - [x] 예약 거부 액션 (status → 'rejected')
  - [x] 예약 취소 액션 (`cancel_reservation_with_session_restore` RPC 호출)
<!-- 세션 5-B: 관리자 전체 스케줄 페이지 ✅ -->
- [x] 관리자 전체 스케줄 페이지 (`app/(admin)/admin/schedule/page.tsx`)
  - [x] 일간 뷰: 시간대(세로) x 트레이너(가로) 그리드
  - [x] 주간 뷰: 날짜(가로) x 시간대(세로), 트레이너 필터
  - [x] 월간 뷰: 달력 형태, 날짜별 예약 건수
  - [x] 일/주/월 탭 전환
  - [x] 트레이너 버튼 필터 (주간 뷰)
  - [x] Supabase Realtime 실시간 업데이트
    - [x] `hooks/use-realtime-reservations.ts`
<!-- 세션 5-C: 트레이너 스케줄 + 예약 요청 페이지 ✅ -->
- [x] 트레이너 전용 스케줄 + 예약 요청 페이지 (`app/(admin)/admin/trainers/[id]/reservations/page.tsx`)
  - [x] 본인 스케줄 (일/주 뷰, reservation-card 재사용)
  - [x] PT 예약 요청 목록
    - [x] pending 상태 예약 리스트
    - [x] 승인/거부 버튼 (5-A 액션 연결)
<!-- 세션 5-D: 사용자 내 스케줄 페이지 ✅ -->
- [x] 사용자 내 스케줄 페이지 (`app/(user)/my-schedule/page.tsx`)
  - [x] 잔여 세션 프로그레스 바
  - [x] 예약 리스트 (가까운 순서, reservation-card 재사용)
    - [x] 상태 배지 (pending/confirmed/rejected)
  - [x] 예약 취소 기능
    - [x] 취소 확인 모달
    - [x] 5-A 취소 액션 연결 (세션 복구 포함)
  - [x] 예약 변경 기능
    - [x] 기존 예약 취소 + 새 예약 생성 플로우 (/apply로 이동)

---

## Phase 5.5: 플로우 개편 + 트레이너 전용 화면

> 기존 회원 주도 PT 신청 플로우를 트레이너 주도로 전환하고, 트레이너 전용 화면을 신규 구현

<!-- 세션 5.5-A: 기존 코드 제거 + 액션 개편 ✅ -->
- [x] 기존 회원 주도 플로우 제거
  - [x] `app/(user)/apply/` 디렉토리 전체 삭제
  - [x] 회원 탭바에서 "PT신청" 탭 제거 (`components/layout/user-tab-bar.tsx`)
  - [x] `actions/reservations.ts`에서 `approveReservation`, `rejectReservation` 제거
  - [x] 회원 `/my-schedule`에서 예약 취소/변경 버튼 제거
  - [x] `cancelReservation` 액션 — 트레이너/관리자만 호출 가능하도록 role 체크 추가
  - [x] 트레이너 상세 페이지 "PT 신청하기" 버튼 제거 (`app/(user)/trainers/[id]/page.tsx`)
- [x] 예약 생성 액션 개편
  - [x] `createReservation` — 세션 차감 없는 단순 생성으로 교체 (`create_reservation_with_session_decrement` → 직접 INSERT)
  - [x] `completeReservation` 신규 액션 — status → `completed` + `remaining_sessions` 1 차감

<!-- 세션 5.5-B: 트레이너 레이아웃 + 스케줄 화면 ✅ -->
- [x] 트레이너 레이아웃
  - [x] `app/(trainer)/layout.tsx` 트레이너 전용 라우트 그룹
  - [x] `components/layout/trainer-tab-bar.tsx` 하단 탭바 (스케줄, 회원, 프로필)
  - [x] proxy.ts — `/trainer` 경로 role 체크 확인 (이미 구현, 진입점 연결만)
- [x] 트레이너 스케줄 메인 (`app/(trainer)/trainer/schedule/page.tsx`)
  - [x] 월/주/일 뷰 탭 (관리자 전체 스케줄 컴포넌트 재사용)
  - [x] 본인 예약만 필터링
  - [x] 담당 회원 배정(생성) 버튼 → 날짜/시간 + 담당 회원 선택 모달
  - [x] `createReservation` 액션 연결

<!-- 세션 5.5-C: 오늘 PT 목록 + 완료 처리 ✅ -->
- [x] 오늘 PT 목록 (`app/(trainer)/trainer/schedule/_components/today-sessions.tsx`)
  - [x] 당일 예약 리스트
  - [x] 완료 처리 버튼 → `completeReservation` 액션 연결 → 세션 차감
  - [x] 완료 확인 모달

<!-- 세션 5.5-D: 담당 회원 목록 + 상세 ✅ -->
- [x] 담당 회원 목록 (`app/(trainer)/trainer/members/page.tsx`)
  - [x] 본인 담당 회원 리스트
  - [x] 회원 이름, 잔여 세션, 다음 예약일 표시
- [x] 담당 회원 상세 (`app/(trainer)/trainer/members/[id]/page.tsx`)
  - [x] 기본 정보 (이름, 연락처)
  - [x] PT 패키지 현황 (전체 세션, 잔여, 사용 횟수)
  - [x] 예약 이력

<!-- 세션 5.5-E: 트레이너 프로필 수정 ✅ -->
- [x] 트레이너 프로필 수정 (`app/(trainer)/trainer/profile/page.tsx`)
  - [x] 소개글, 전문분야, 자격증, 경력 수정
  - [x] `actions/trainers.ts` 수정 액션 재사용
- [x] 예약 생성 모달 가용 슬롯 연동 (`create-reservation-modal.tsx`)
  - [x] 날짜 선택 시 `get_available_slots` RPC 기반 슬롯 버튼 그리드 표시
  - [x] 자유 시간 입력 제거 → 슬롯 클릭으로 시작/종료 시간 자동 세팅

---

## Phase 6: 매출 관리

- [ ] 매출 관리 페이지 (`app/(admin)/admin/revenue/page.tsx`)
  - [ ] `components/charts/stats-card.tsx` 요약 카드
    - [ ] 이번 달 총 매출
    - [ ] 이번 달 결제 건수
    - [ ] 전월 대비 증감
  - [ ] `components/charts/revenue-chart.tsx` 월별 매출 차트
    - [ ] Recharts 막대/선 차트
    - [ ] 최근 12개월 데이터
    - [ ] `get_monthly_revenue` RPC 호출
  - [ ] 트레이너별 매출 비교 차트
    - [ ] 수평 막대 차트
    - [ ] `get_trainer_revenue` RPC 호출
  - [ ] 결제 이력 테이블
    - [ ] 페이지네이션
    - [ ] 컬럼: 날짜, 회원명, 트레이너, 금액, 결제수단, 상태
    - [ ] 월 선택 드롭다운 필터

---

## Phase 7: PWA + 마무리

- [ ] PWA 설정
  - [ ] `app/manifest.ts` 생성 (앱 이름, 아이콘, 테마, standalone)
  - [ ] PWA 아이콘 세트 (192x192, 512x512, maskable)
  - [ ] Serwist Service Worker 설정
    - [ ] 정적 자산 프리캐싱
    - [ ] API Network-first 전략
  - [ ] 오프라인 폴백 페이지
- [ ] 에러/로딩 페이지
  - [ ] `app/error.tsx` (글로벌 에러 바운더리)
  - [ ] `app/not-found.tsx` (404)
  - [ ] `app/loading.tsx` (글로벌 로딩)
  - [ ] 각 라우트 그룹별 `loading.tsx`
- [ ] 모바일 반응형 최종 점검
  - [ ] 관리자 페이지 모바일 레이아웃 확인
  - [ ] 사용자 페이지 모바일 레이아웃 확인
  - [ ] 터치 인터랙션 최적화
- [ ] 메타데이터/SEO
  - [ ] 루트 metadata (title, description, og:image)
  - [ ] 페이지별 동적 metadata

---

## Phase 8: 배포

- [ ] Vercel 배포 설정
  - [ ] Vercel 프로젝트 연결
  - [ ] 환경변수 프로덕션 설정
  - [ ] 빌드 확인
- [ ] 품질 확인
  - [ ] Lighthouse PWA 점수 90+ 확인
  - [ ] 전체 플로우 E2E 테스트
- [ ] 포트폴리오 README 작성
