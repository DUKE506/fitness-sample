# 피트니스 센터 웹 애플리케이션 기획서

> 외주개발 포트폴리오용 프로젝트 | Next.js 16 + Supabase + PWA

---

## 기술 스택

| 분류       | 기술                                    | 비고                                  |
| ---------- | --------------------------------------- | ------------------------------------- |
| 프레임워크 | Next.js 16.2.2 (App Router)             | React Compiler 활성화, Turbopack 기본 |
| UI         | React 19.2.4 + Tailwind CSS v4          | 자체 컴포넌트 직접 개발               |
| 상태관리   | Zustand                                 | 클라이언트 전역 상태                  |
| 언어       | TypeScript 5                            | strict mode                           |
| DB / Auth  | Supabase (PostgreSQL + Auth + Realtime) | 카카오 OAuth                          |
| 차트       | Recharts                                | 매출 관리                             |
| 테이블     | @tanstack/react-table                   | 회원/결제 리스트                      |
| 폼 검증    | Zod                                     | 서버/클라이언트 양측                  |
| 날짜       | date-fns                                | 한국어 locale                         |
| PWA        | Serwist (@serwist/next)                 | 오프라인 + 홈화면 추가                |
| 아이콘     | Lucide React                            |                                       |
| 유틸       | clsx + tailwind-merge                   | 조건부 클래스                         |

---

## 데이터베이스 스키마

> 상세 SQL, RLS 정책, RPC 함수 코드: `docs/db-schema.md` 참조

### 테이블 목록

| 테이블 | 설명 |
|--------|------|
| profiles | 사용자 공통 프로필 (auth.users 1:1), role 구분 |
| trainers | 트레이너 상세 (전문분야, 자격증, 경력 등) |
| members | 회원 정보 (일반/PT 구분, 담당 트레이너) |
| pt_packages | PT 패키지 (세션수, 잔여횟수, 가격) |
| trainer_schedules | 트레이너 요일별 근무시간 |
| trainer_day_offs | 트레이너 휴무일 |
| reservations | 예약 (pending→confirmed/rejected→completed) |
| payments | 결제 내역 (admin만 등록) |

### ERD 개요

```
profiles (1) ──── (1) trainers
    │                    │
    │                    ├── trainer_schedules (1:N)
    │                    ├── trainer_day_offs (1:N)
    │                    │
profiles (1) ──── (1) members
                         │
                         ├── pt_packages (1:N) ── trainer (N:1)
                         ├── reservations (1:N) ── trainer (N:1)
                         └── payments (1:N)
```

---

## 앱 디렉토리 구조

```
src/
├── app/
│   ├── layout.tsx                    # 루트 레이아웃 (폰트, Providers)
│   ├── page.tsx                      # 랜딩 → 로그인/대시보드 리다이렉트
│   ├── manifest.ts                   # PWA 매니페스트
│   ├── globals.css                   # Tailwind v4 글로벌
│   │
│   ├── (auth)/                       # 인증 라우트 그룹
│   │   ├── layout.tsx                # 인증 공통 레이아웃
│   │   ├── login/page.tsx            # 카카오 로그인
│   │   └── callback/route.ts         # OAuth 콜백 핸들러
│   │
│   ├── (admin)/                      # 관리자 라우트 그룹
│   │   ├── layout.tsx                # 사이드바 레이아웃
│   │   └── admin/
│   │       ├── page.tsx              # 대시보드
│   │       ├── trainers/
│   │       │   ├── page.tsx          # 트레이너 목록
│   │       │   ├── new/page.tsx      # 트레이너 등록
│   │       │   └── [id]/
│   │       │       ├── page.tsx      # 트레이너 상세/수정
│   │       │       └── schedule/page.tsx  # 스케줄 설정
│   │       ├── members/
│   │       │   ├── page.tsx          # 회원 목록
│   │       │   └── [id]/page.tsx     # 회원 상세
│   │       ├── schedule/page.tsx     # 전체 스케줄
│   │       └── revenue/page.tsx      # 매출 관리
│   │
│   ├── (user)/                       # 일반 사용자 라우트 그룹
│   │   ├── layout.tsx                # 하단 탭바 레이아웃
│   │   ├── trainers/
│   │   │   ├── page.tsx              # 트레이너 목록
│   │   │   └── [id]/page.tsx         # 트레이너 상세
│   │   ├── my-schedule/page.tsx      # 내 스케줄
│   │   ├── apply/
│   │   │   ├── page.tsx              # Step 1: 트레이너 선택
│   │   │   ├── time/page.tsx         # Step 2: 날짜/시간 선택
│   │   │   └── complete/page.tsx     # Step 3: 완료
│   │   └── profile/page.tsx          # 내 프로필
│   │
│   └── api/
│       └── auth/callback/route.ts    # Supabase OAuth 콜백
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # 브라우저용 클라이언트
│   │   ├── server.ts                 # 서버용 클라이언트 (async cookies)
│   │   └── admin.ts                  # Service Role 클라이언트
│   ├── types/
│   │   ├── database.ts               # Supabase 자동생성 타입
│   │   └── index.ts                  # 앱 공통 타입
│   ├── utils/
│   │   ├── date.ts                   # 날짜 유틸
│   │   ├── format.ts                 # 포맷 유틸 (금액 등)
│   │   └── cn.ts                     # clsx + tailwind-merge
│   ├── validations/                  # Zod 스키마
│   │   ├── reservation.ts
│   │   ├── trainer.ts
│   │   └── member.ts
│   └── constants.ts                  # 상수 정의
│
├── components/
│   ├── ui/                           # 자체 공통 UI 컴포넌트 (Button, Input, Dialog, Card 등)
│   ├── layout/
│   │   ├── admin-sidebar.tsx         # 관리자 사이드바
│   │   ├── user-tab-bar.tsx          # 사용자 하단 탭바
│   │   └── header.tsx                # 공통 헤더
│   ├── schedule/
│   │   ├── calendar-view.tsx         # 캘린더 (일/주/월)
│   │   ├── time-slot-picker.tsx      # 시간 슬롯 선택
│   │   ├── reservation-card.tsx      # 예약 카드
│   │   └── d-day-badge.tsx           # D-day 배지
│   ├── trainer/
│   │   ├── trainer-card.tsx          # 트레이너 카드
│   │   └── specialty-badge.tsx       # 전문분야 배지
│   ├── charts/
│   │   ├── revenue-chart.tsx         # 매출 차트
│   │   └── stats-card.tsx            # 통계 카드
│   └── providers/
│       └── supabase-provider.tsx     # Supabase 세션 프로바이더
│
├── actions/                          # Server Actions
│   ├── auth.ts                       # 로그인/로그아웃
│   ├── reservations.ts               # 예약 CRUD
│   ├── trainers.ts                   # 트레이너 CRUD
│   ├── members.ts                    # 회원 관리
│   ├── schedules.ts                  # 스케줄 설정
│   └── payments.ts                   # 결제 관리
│
├── hooks/
│   ├── use-user.ts                   # 현재 사용자 정보
│   ├── use-realtime-reservations.ts  # 실시간 예약 구독
│   └── use-available-slots.ts        # 가용 슬롯 조회
│
├── stores/                           # Zustand 스토어
│   ├── use-auth-store.ts             # 인증 상태 (현재 유저, role)
│   ├── use-schedule-store.ts         # 스케줄 뷰 상태 (선택 날짜, 뷰 모드)
│   └── use-reservation-store.ts      # PT 신청 플로우 상태 (선택 트레이너, 시간)
│
└── proxy.ts                          # Next.js 16 Proxy (인증 가드)
```

---

## 페이지별 상세 설계

### 공통: 카카오 로그인

**경로**: `/login`

- **로그인 화면 구성**:
  - 상단: 카카오 로그인 버튼 → **회원(member) 전용**
  - 하단: 관리자 로그인 버튼 → ID/PW 입력 폼 → **admin, trainer 전용**
- **관리자 기본 계정**: 서버 최초 실행(DB 시딩) 시 admin 계정 자동 생성 (id: `admin`, pw: `admin`)
- **카카오 OAuth**: 실제 프로덕션에서 사용. Supabase Auth `signInWithOAuth({ provider: 'kakao' })`
- **개발 환경**: mockup 데이터 기반 테스트. 로그인 페이지에 임시 회원가입 기능 제공 (개발용)
- 최초 카카오 가입 시 DB Trigger로 `profiles` 자동 생성 (기본 role: 'member')
- 로그인 후 role에 따라 리다이렉트:
  - admin → `/admin`
  - trainer → 본인 스케줄 + PT예약 요청 목록
  - member → `/my-schedule`

### 트레이너 전용 페이지

> trainer로 로그인 시 접근하는 페이지

- **본인 스케줄**: 자신의 일별/주별 PT 일정 확인
- **PT예약 요청 목록**: 회원이 신청한 PT 예약을 승인/거부 처리

### 관리자 페이지

#### 트레이너 관리 (`/admin/trainers`)

- **목록**: 데이터 테이블 (이름, 전문분야, 담당회원수, 활성상태)
- **등록** (`/admin/trainers/new`): admin이 트레이너 계정(ID/PW) + 이름, 전문분야, 자격증, 프로필사진 등 입력하여 등록
- **수정** (`/admin/trainers/[id]`): 등록 폼과 동일 + 삭제(비활성화)
- **스케줄 설정** (`/admin/trainers/[id]/schedule`): 요일별 근무시간 토글, 휴무일 달력 지정

#### 회원 관리 (`/admin/members`)

- **목록**: 검색(이름/전화번호) + 필터(일반/PT, 활성/비활성)
- **상세** (`/admin/members/[id]`):
  - 회원 기본정보
  - PT 패키지 목록 (잔여횟수, 만료일)
  - 예약 이력 (타임라인 형태)
  - 다음 예약 일정 D-day

#### 전체 스케줄 (`/admin/schedule`)

- **일간**: 시간대(세로) x 트레이너(가로) 그리드 → 예약 블록 표시
- **주간**: 날짜(가로) x 시간대(세로), 트레이너 필터
- **월간**: 달력 형태, 날짜 셀에 예약 건수 표시 → 클릭 시 일간으로
- Supabase Realtime 구독으로 실시간 업데이트
- 예약 블록 클릭 시 상세 모달

#### 매출 관리 (`/admin/revenue`)

- **월별 수입 차트**: 최근 12개월 막대/선 차트 (Recharts)
- **트레이너별 매출**: 수평 막대 차트 비교
- **결제 내역**: 페이지네이션 테이블 (날짜, 회원, 금액, 결제수단, 상태)
- 월 선택 드롭다운으로 기간 변경

### 일반 사용자 페이지

#### 트레이너 정보 (`/trainers`)

> **참고**: 개발 착수 전 UI 이미지 참고 자료 첨부 예정

- **목록**: 카드 레이아웃 (사진, 이름, 전문분야 배지, 경력)
- **상세** (`/trainers/[id]`):
  - 프로필 사진 + 소개글
  - 전문분야, 자격증, 경력
  - 이번 주 가능 시간대 미리보기
  - "PT 신청하기" CTA 버튼 → `/apply?trainer=[id]`

#### 내 스케줄 (`/my-schedule`)

- **다음 세션 D-day**: 상단 강조 카드
- **잔여 세션**: 프로그레스 바 (사용/잔여)
- **예약 리스트**: 가까운 순서, 날짜/시간/트레이너
- **예약 취소/변경**: 스와이프 또는 버튼 → 확인 모달

> **PT 구매 정책**: 회원이 직접 PT를 구매하지 않음. admin이 회원 상세 페이지에서 PT 패키지를 등록/결제 처리. 현장에서 카드 결제를 받은 후 관리자가 시스템에 반영하는 방식. (계약서 확인, 설명 의무 등의 문제로 회원 직접 결제 제한)

#### PT 신청 (`/apply`)

3단계 스텝 플로우:

1. **트레이너 선택** (`/apply`):
   - 트레이너 카드 목록 (간략 버전)
   - 선택 시 `/apply/time?trainer=[id]`로 이동

2. **날짜/시간 선택** (`/apply/time?trainer=[id]`):
   - 달력에서 날짜 선택
   - `get_available_slots` RPC로 가용 시간 로드
   - 시간 슬롯 그리드에서 선택
   - 선택 완료 시 `/apply/complete`로 이동

3. **신청 완료** (`/apply/complete`):
   - 선택 내역 요약 (트레이너, 날짜, 시간)
   - "신청하기" 버튼 → Server Action 호출
   - 신청 후 status='pending' 상태로 생성
   - 성공 시 완료 화면 + 내 스케줄로 이동 버튼

> **승인 플로우**: 회원이 PT 신청 → 예약이 'pending' 상태로 생성 → 트레이너가 승인('confirmed') 또는 거부('rejected') → 회원에게 결과 반영

---

## 인증 흐름

### 카카오 OAuth + Supabase

```
[사용자] → 카카오 로그인 버튼 클릭
    ↓
[Supabase] → 카카오 OAuth 페이지로 리다이렉트
    ↓
[카카오] → 사용자 인증 → 콜백 URL로 code 전달
    ↓
[/api/auth/callback] → supabase.auth.exchangeCodeForSession(code)
    ↓
[DB Trigger] → 최초 로그인 시 profiles 테이블에 레코드 자동 생성
    ↓
[proxy.ts] → role 확인 → 적절한 페이지로 리다이렉트
```

### proxy.ts (인증 가드)

- **공개 경로**: `/login`, `/api/auth/*` → 통과
- **인증 필요**: 그 외 모든 경로 → 세션 없으면 `/login`으로 리다이렉트
- **admin 경로**: `/admin/*` → role이 'admin'이 아니면 `/`로 리다이렉트
- Next.js 16에서 `middleware.ts` 대신 `proxy.ts` 사용

---

## 모바일 반응형 + PWA

### 반응형 전략

| 뷰포트              | 관리자                 | 사용자               |
| ------------------- | ---------------------- | -------------------- |
| Desktop (1024px+)   | 사이드바 + 메인 콘텐츠 | 중앙 정렬 컨테이너   |
| Tablet (768~1023px) | 접이식 사이드바        | 동일                 |
| Mobile (~767px)     | 햄버거 메뉴 + 전체화면 | 하단 탭바 네비게이션 |

### PWA 구성

- **manifest.ts**: 앱 이름, 아이콘, 테마 색상, standalone 모드
- **Service Worker**: Serwist로 정적 자산 캐싱 + Network-first API 전략
- **오프라인**: 마지막 조회 데이터 캐시 + 오프라인 안내 페이지
- **Lighthouse PWA 점수**: 90+ 목표

---

## 구현 단계

> 세부 TODO 체크리스트: `TODO.md` 참조

| Phase | 내용 | 선행 |
|-------|------|------|
| 0 | 프로젝트 기초 설정 (패키지, Supabase 셋업, UI 컴포넌트, 레이아웃) | - |
| 1 | 데이터베이스 + 인증 (테이블, RLS, RPC, 카카오 OAuth, proxy.ts) | Phase 0 |
| 2 | 관리자 - 트레이너 관리 (목록, 등록/수정, 스케줄 설정) | Phase 1 |
| 3 | 관리자 - 회원 관리 (목록, 상세, PT 패키지 등록) | Phase 2 |
| 4 | 사용자 - 트레이너 정보 + PT 신청 (3단계 플로우) | Phase 2 |
| 5 | 스케줄 관리 (캘린더 뷰, 내 스케줄, 예약 취소/변경, Realtime) | Phase 4 |
| 6 | 매출 관리 (차트, 결제 이력) | Phase 3, 5 |
| 7 | PWA + 마무리 (manifest, Service Worker, 반응형, 에러 페이지) | Phase 5 |
| 8 | 배포 (Vercel, 환경변수, Lighthouse, README) | Phase 7 |

---

## Next.js 16 주의사항

1. **params/searchParams는 Promise** → `const { id } = await params` 패턴 필수
2. **proxy.ts 사용** → middleware.ts 아닌 proxy.ts (함수명도 `proxy`)
3. **async cookies()/headers()** → `const cookieStore = await cookies()`
4. **Server Components 기본** → 데이터 페칭은 서버 컴포넌트에서 직접, 인터랙션 시만 'use client'
5. **React Compiler 활성화** → useMemo/useCallback 수동 최적화 불필요
6. **구현 전 반드시 `node_modules/next/dist/docs/` 문서 참조**
