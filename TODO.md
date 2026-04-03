# TODO - 구현 체크리스트

> 각 Phase 순서대로 진행. 하위 항목은 상위 완료를 위한 세부 작업.

---

## Phase 0: 프로젝트 기초 설정

- [ ] 패키지 설치
  - [ ] `@supabase/ssr` + `@supabase/supabase-js` 설치
  - [ ] `zustand` 설치
  - [ ] `date-fns` 설치
  - [ ] `recharts` 설치
  - [ ] `zod` 설치
  - [ ] `@tanstack/react-table` 설치
  - [ ] `serwist` + `@serwist/next` 설치
  - [ ] `lucide-react` 설치
  - [ ] `clsx` + `tailwind-merge` 설치
  - [ ] `sonner` 설치
- [ ] Supabase 프로젝트 생성 + 환경변수 설정
  - [ ] Supabase 프로젝트 생성
  - [ ] `.env.local` 파일 생성 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
  - [ ] `.env.local`을 `.gitignore`에 추가 확인
- [ ] Supabase 클라이언트 셋업
  - [ ] `lib/supabase/client.ts` (브라우저용)
  - [ ] `lib/supabase/server.ts` (서버 컴포넌트용, async cookies)
  - [ ] `lib/supabase/admin.ts` (Service Role 클라이언트)
- [ ] 유틸리티 함수
  - [ ] `lib/utils/cn.ts` (clsx + tailwind-merge)
  - [ ] `lib/utils/date.ts` (date-fns 래퍼)
  - [ ] `lib/utils/format.ts` (금액 포맷 등)
  - [ ] `lib/constants.ts` (역할, 상태값 상수)
- [ ] 한국어 폰트 설정
  - [ ] Pretendard 웹폰트 적용
  - [ ] 루트 layout.tsx에 폰트 설정
- [ ] 자체 UI 컴포넌트 기초 개발
  - [ ] Button 컴포넌트 (variant: primary, secondary, outline, ghost, danger)
  - [ ] Input 컴포넌트 (text, password, search)
  - [ ] Select 컴포넌트
  - [ ] Dialog/Modal 컴포넌트
  - [ ] Card 컴포넌트
  - [ ] Badge 컴포넌트
  - [ ] Toast 컴포넌트 (sonner 래핑)
  - [ ] Table 컴포넌트 (@tanstack/react-table 래핑)
  - [ ] Tabs 컴포넌트
  - [ ] Spinner/Loading 컴포넌트
- [ ] 레이아웃 스캐폴딩
  - [ ] 루트 `app/layout.tsx` (폰트, Providers, 메타데이터)
  - [ ] `app/(auth)/layout.tsx` (인증 페이지 공통)
  - [ ] `app/(admin)/layout.tsx` (관리자 사이드바)
  - [ ] `app/(user)/layout.tsx` (사용자 하단 탭바)
- [ ] Zustand 스토어 기초
  - [ ] `stores/use-auth-store.ts` (현재 유저, role)
  - [ ] `stores/use-schedule-store.ts` (선택 날짜, 뷰 모드)
  - [ ] `stores/use-reservation-store.ts` (PT 신청 플로우 상태)

---

## Phase 1: 데이터베이스 + 인증

- [ ] Supabase 데이터베이스 구축 (참조: `docs/db-schema.md`)
  - [ ] 전체 테이블 생성 SQL 실행
  - [ ] RLS 정책 적용
  - [ ] Database Functions (RPC) 생성
    - [ ] `get_available_slots(trainer_id, date)`
    - [ ] `create_reservation_with_session_decrement(...)`
    - [ ] `cancel_reservation_with_session_restore(...)`
    - [ ] `get_monthly_revenue(year, month)`
    - [ ] `get_trainer_revenue(trainer_id, year, month)`
  - [ ] DB Trigger: 회원가입 시 profiles 자동 생성
  - [ ] DB Seed: admin 기본 계정 생성 (id: admin, pw: admin)
- [ ] TypeScript 타입 생성
  - [ ] `supabase gen types typescript` 실행
  - [ ] `lib/types/database.ts` 생성
  - [ ] `lib/types/index.ts` 앱 공통 타입 정의
- [ ] 인증 구현
  - [ ] 카카오 OAuth 설정 (Kakao Developers 앱 등록 + Supabase Provider 설정)
  - [ ] 로그인 페이지 개발 (`app/(auth)/login/page.tsx`)
    - [ ] 카카오 로그인 버튼 (회원용)
    - [ ] 관리자 로그인 폼 (ID/PW 입력, admin/trainer용)
    - [ ] 개발용 임시 회원가입 기능
  - [ ] OAuth 콜백 Route Handler (`app/api/auth/callback/route.ts`)
  - [ ] `proxy.ts` 인증 가드 구현
    - [ ] 공개 경로 통과 처리
    - [ ] 미인증 시 `/login` 리다이렉트
    - [ ] admin 경로 role 체크
  - [ ] Server Actions (`actions/auth.ts`)
    - [ ] 관리자 ID/PW 로그인 액션
    - [ ] 로그아웃 액션
- [ ] Zod 유효성 검증 스키마
  - [ ] `lib/validations/reservation.ts`
  - [ ] `lib/validations/trainer.ts`
  - [ ] `lib/validations/member.ts`
- [ ] 개발용 mockup 데이터 시드 스크립트

---

## Phase 2: 관리자 - 트레이너 관리

- [ ] 관리자 레이아웃 컴포넌트
  - [ ] `components/layout/admin-sidebar.tsx` (사이드바 네비게이션)
    - [ ] 메뉴 항목: 대시보드, 트레이너관리, 회원관리, 전체스케줄, 매출관리
    - [ ] 모바일: 햄버거 메뉴 토글
    - [ ] 현재 경로 활성 상태 표시
  - [ ] `components/layout/header.tsx` (상단 헤더)
    - [ ] 사용자 정보 표시
    - [ ] 로그아웃 버튼
- [ ] 트레이너 목록 페이지 (`app/(admin)/admin/trainers/page.tsx`)
  - [ ] 데이터 테이블 구현 (이름, 전문분야, 담당회원수, 활성상태)
  - [ ] 검색 기능
  - [ ] 트레이너 등록 버튼 → `/admin/trainers/new`
  - [ ] Server Component에서 Supabase 직접 쿼리
- [ ] 트레이너 등록 페이지 (`app/(admin)/admin/trainers/new/page.tsx`)
  - [ ] `components/forms/trainer-form.tsx` 폼 컴포넌트
    - [ ] 계정 정보 입력 (ID, 비밀번호)
    - [ ] 기본 정보 입력 (이름, 연락처, 소개글)
    - [ ] 전문분야 태그 입력
    - [ ] 자격증 목록 입력
    - [ ] 경력 연수 입력
    - [ ] 시간당 요금 입력
    - [ ] 프로필 사진 업로드 (Supabase Storage)
  - [ ] `actions/trainers.ts` Server Action
    - [ ] Supabase Admin API로 auth 계정 생성
    - [ ] profiles 테이블에 role='trainer' 레코드 생성
    - [ ] trainers 테이블에 상세 정보 저장
- [ ] 트레이너 상세/수정 페이지 (`app/(admin)/admin/trainers/[id]/page.tsx`)
  - [ ] 트레이너 정보 조회 (Server Component)
  - [ ] 수정 폼 (trainer-form.tsx 재사용)
  - [ ] 비활성화(삭제) 기능
  - [ ] 담당 회원 목록 표시
- [ ] 트레이너별 스케줄 설정 (`app/(admin)/admin/trainers/[id]/schedule/page.tsx`)
  - [ ] `components/forms/schedule-form.tsx`
    - [ ] 요일별 근무시간 토글 (on/off)
    - [ ] 요일별 시작/종료 시간 설정
    - [ ] 슬롯 단위(분) 설정
  - [ ] 휴무일 관리
    - [ ] 캘린더에서 휴무일 선택/해제
    - [ ] 사유 입력
  - [ ] `actions/schedules.ts` Server Action
    - [ ] trainer_schedules CRUD
    - [ ] trainer_day_offs CRUD

---

## Phase 3: 관리자 - 회원 관리

- [ ] 회원 목록 페이지 (`app/(admin)/admin/members/page.tsx`)
  - [ ] 데이터 테이블 (이름, 연락처, 회원유형, 담당트레이너, 활성상태)
  - [ ] 검색 기능 (이름, 전화번호)
  - [ ] 필터 (회원유형: 일반/PT, 상태: 활성/비활성)
  - [ ] URL searchParams 기반 서버사이드 필터링
- [ ] 회원 상세 페이지 (`app/(admin)/admin/members/[id]/page.tsx`)
  - [ ] 회원 기본정보 카드
  - [ ] 회원 타입 변경 기능 (일반 ↔ PT)
  - [ ] PT 패키지 섹션
    - [ ] 현재 활성 패키지 (잔여횟수, 만료일)
    - [ ] PT 패키지 등록 폼 (admin이 결제 처리)
      - [ ] 트레이너 선택
      - [ ] 세션 수 / 가격 입력
      - [ ] 결제 수단 선택 (카드/현금/계좌이체)
    - [ ] 패키지 이력 목록
  - [ ] 예약 이력 섹션
    - [ ] 타임라인 형태 예약 이력
    - [ ] 다음 예약 일정 D-day 표시
  - [ ] `actions/members.ts` Server Action
    - [ ] 회원 타입 변경
    - [ ] 담당 트레이너 배정
  - [ ] `actions/payments.ts` Server Action
    - [ ] PT 패키지 등록 + 결제 내역 생성

---

## Phase 4: 사용자 - 트레이너 정보 + PT 신청

- [ ] 사용자 레이아웃 컴포넌트
  - [ ] `components/layout/user-tab-bar.tsx` (하단 탭바)
    - [ ] 탭: 트레이너, 내스케줄, PT신청, 프로필
    - [ ] 아이콘 + 라벨
    - [ ] 현재 경로 활성 상태
- [ ] 트레이너 목록 페이지 (`app/(user)/trainers/page.tsx`)
  - [ ] `components/trainer/trainer-card.tsx` 카드 컴포넌트
    - [ ] 프로필 사진
    - [ ] 이름, 경력
    - [ ] `components/trainer/specialty-badge.tsx` 전문분야 배지
  - [ ] 카드 그리드 레이아웃 (모바일 1열, 태블릿+ 2열)
  - [ ] 전문분야별 필터
- [ ] 트레이너 상세 페이지 (`app/(user)/trainers/[id]/page.tsx`)
  - [ ] 프로필 사진 + 소개글
  - [ ] 전문분야, 자격증, 경력 상세
  - [ ] 이번 주 가능 시간대 미리보기
  - [ ] "PT 신청하기" CTA 버튼 → `/apply?trainer=[id]`
- [ ] PT 신청 - Step 1: 트레이너 선택 (`app/(user)/apply/page.tsx`)
  - [ ] 트레이너 카드 목록 (간략 버전)
  - [ ] 선택 시 Zustand store에 저장 + `/apply/time` 이동
- [ ] PT 신청 - Step 2: 날짜/시간 선택 (`app/(user)/apply/time/page.tsx`)
  - [ ] `components/schedule/calendar-view.tsx` 날짜 선택 캘린더
  - [ ] `components/schedule/time-slot-picker.tsx` 시간 슬롯 선택
    - [ ] `get_available_slots` RPC 호출
    - [ ] 가용/불가 슬롯 시각적 구분
    - [ ] 선택 상태 관리
  - [ ] `hooks/use-available-slots.ts` 가용 슬롯 조회 훅
- [ ] PT 신청 - Step 3: 완료 (`app/(user)/apply/complete/page.tsx`)
  - [ ] 선택 내역 요약 (트레이너, 날짜, 시간)
  - [ ] "신청하기" 버튼
  - [ ] `actions/reservations.ts` Server Action 호출 (status='pending')
  - [ ] 성공 화면 + 내 스케줄 이동 버튼
  - [ ] 실패 시 에러 안내

---

## Phase 5: 스케줄 관리

- [ ] 관리자 전체 스케줄 페이지 (`app/(admin)/admin/schedule/page.tsx`)
  - [ ] `components/schedule/calendar-view.tsx` 확장
    - [ ] 일간 뷰: 시간대(세로) x 트레이너(가로) 그리드
    - [ ] 주간 뷰: 날짜(가로) x 시간대(세로), 트레이너 필터
    - [ ] 월간 뷰: 달력 형태, 날짜별 예약 건수
  - [ ] `components/schedule/reservation-card.tsx` 예약 블록
    - [ ] 회원명, 시간, 상태 배지
    - [ ] 클릭 시 상세 모달
  - [ ] Tabs 컴포넌트로 일/주/월 전환
  - [ ] 트레이너 드롭다운 필터
  - [ ] Supabase Realtime 실시간 업데이트
    - [ ] `hooks/use-realtime-reservations.ts`
- [ ] 트레이너 전용 스케줄 + 예약 요청 페이지
  - [ ] 본인 스케줄 (일/주 뷰)
  - [ ] PT예약 요청 목록
    - [ ] pending 상태 예약 리스트
    - [ ] 승인/거부 버튼
    - [ ] `actions/reservations.ts`에 승인/거부 액션 추가
- [ ] 사용자 내 스케줄 페이지 (`app/(user)/my-schedule/page.tsx`)
  - [ ] `components/schedule/d-day-badge.tsx` 다음 세션 D-day
  - [ ] 잔여 세션 프로그레스 바
  - [ ] 예약 리스트 (가까운 순서)
    - [ ] `components/schedule/reservation-card.tsx` 재사용
    - [ ] 상태 배지 (pending/confirmed/rejected)
  - [ ] 예약 취소 기능
    - [ ] 취소 확인 모달
    - [ ] `actions/reservations.ts` 취소 액션 (세션 복구 포함)
  - [ ] 예약 변경 기능
    - [ ] 기존 예약 취소 + 새 예약 생성 플로우

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
