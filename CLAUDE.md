@AGENTS.md

---

## 프로젝트 개요

**피트니스 센터 PT 예약/관리 웹 애플리케이션**

외주개발 포트폴리오용 프로젝트. 헬스장 운영에 필요한 트레이너/회원 관리, PT 예약, 스케줄 관리, 매출 관리 기능을 제공한다.

- **대상 사용자**: 관리자(admin), 트레이너(trainer), 일반 회원(member)
- **핵심 플로우**: 회원이 PT 신청 → 트레이너 승인/거부 → 스케줄 관리
- **PT 구매 정책**: admin만 회원 상세 페이지에서 PT 패키지 등록 가능 (현장 결제 후 관리자 직접 입력)
- **로그인**: 회원은 카카오 OAuth, admin/trainer는 ID/PW 폼

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

## 작업 방식

- **Phase 단위 세션 분리**: 구현은 Phase 별로 세션을 나눠서 진행
- **화면 단위 세션 분리**: 실제 화면/UI 개발 단계부터는 각 화면(페이지)별로 세션을 분리
- **구현 시작 전 확인**: 세션 시작 시 해당 Phase/화면의 TODO 항목과 관련 문서를 먼저 확인
- **구현 금지 원칙**: 사용자가 명시적으로 "구현해"라고 하기 전까지 코드를 작성하지 않음
- **TODO 업데이트 금지 원칙**: 사용자가 명시적으로 지시하기 전까지 `TODO.md`를 수정하지 않음
- **세션 진행 의미**: "세션 X 진행해줘" = 관련 파일 파악 + 구현 계획 제시까지만. 파일 생성/수정/TODO 업데이트는 별도 지시 후에만

---

## 참조 문서

| 문서 | 경로 | 내용 |
|------|------|------|
| 기획서 | `PLAN.md` | 전체 설계 (DB 개요, 디렉토리 구조, 페이지별 설계, 인증 흐름, PWA) |
| 구현 체크리스트 | `TODO.md` | Phase 0~8 단계별 상세 TODO (부모/자식 태스크) |
| DB 스키마 상세 | `docs/db-schema.md` | CREATE TABLE SQL, RLS 정책, RPC 함수, Trigger, Seed |
| 디자인 시스템 | `docs/design-system.md` | 컬러, 타이포, glassmorphism 토큰, 컴포넌트 스타일 |
| 이슈 기록 | `docs/ISSUES.md` | 발생한 버그 및 해결 기록 |

