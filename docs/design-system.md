# FitnessCenter — Design System MASTER

> 모든 페이지의 글로벌 기준. 페이지별 오버라이드는 `design-system/pages/[page].md` 참조.

---

## Style

- **방향**: Monochrome Glassmorphism
- **분위기**: 다크, 고급스러움, 건강/활력 포인트
- **참고**: 짙은 배경 위에 frosted glass 카드, 에메랄드 포인트 컬러

---

## Color Palette

| 역할            | 토큰                    | Hex                      | 용도                      |
| --------------- | ----------------------- | ------------------------ | ------------------------- |
| Background      | `--color-bg`            | `#0F0F0F`                | 전체 배경                 |
| Surface         | `--color-surface`       | `rgba(255,255,255,0.08)` | 카드, 패널 (glass)        |
| Surface Hover   | `--color-surface-hover` | `rgba(255,255,255,0.13)` | 카드 호버 상태            |
| Border          | `--color-border`        | `rgba(255,255,255,0.12)` | 카드/인풋 테두리          |
| Primary (Point) | `--color-primary`       | `#10B981`                | CTA 버튼, 활성 상태, 뱃지 |
| Primary Hover   | `--color-primary-hover` | `#059669`                | 버튼 호버                 |
| Text Primary    | `--color-text`          | `#F8FAFC`                | 메인 텍스트               |
| Text Muted      | `--color-text-muted`    | `#94A3B8`                | 보조 텍스트, 라벨         |
| Text Disabled   | `--color-text-disabled` | `#475569`                | 비활성 텍스트             |
| Danger          | `--color-danger`        | `#EF4444`                | 에러, 삭제, 거부          |
| Warning         | `--color-warning`       | `#F59E0B`                | 경고, 대기 상태           |
| Success         | `--color-success`       | `#10B981`                | 성공 (Primary와 동일)     |

---

## Glassmorphism Card

```css
/* 기본 glass 카드 */
background: rgba(255, 255, 255, 0.08);
backdrop-filter: blur(15px);
-webkit-backdrop-filter: blur(15px);
border: 1px solid rgba(255, 255, 255, 0.12);
border-radius: 16px;

/* 호버 */
background: rgba(255, 255, 255, 0.13);
```

**Tailwind 클래스 조합**:

```
bg-white/[0.08] backdrop-blur-[15px] border border-white/[0.12] rounded-2xl
```

---

## Typography

| 항목               | 값                               |
| ------------------ | -------------------------------- |
| **폰트**           | Noto Sans KR                     |
| **Weight**         | 300, 400, 500, 700               |
| **Base size**      | 16px                             |
| **Line height**    | 1.6 (body), 1.2 (heading)        |
| **Letter spacing** | -0.01em (heading), normal (body) |

```css
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap");
```

### 사이즈 스케일

| 용도    | Size | Weight | Tailwind                |
| ------- | ---- | ------ | ----------------------- |
| H1      | 36px | 700    | `text-4xl font-bold`    |
| H2      | 28px | 700    | `text-3xl font-bold`    |
| H3      | 22px | 600    | `text-xl font-semibold` |
| H4      | 18px | 600    | `text-lg font-semibold` |
| Body    | 16px | 400    | `text-base`             |
| Small   | 14px | 400    | `text-sm`               |
| Caption | 12px | 400    | `text-xs`               |

---

## Spacing & Layout

| 항목               | 값                            | Tailwind       |
| ------------------ | ----------------------------- | -------------- |
| 컨테이너 최대 너비 | 1280px                        | `max-w-7xl`    |
| 페이지 좌우 패딩   | 24px (mobile), 32px (desktop) | `px-6 lg:px-8` |
| 카드 패딩          | 24px                          | `p-6`          |
| 섹션 간격          | 48px                          | `gap-12`       |
| 요소 간격          | 16px                          | `gap-4`        |

### 어드민 단일 컬럼 페이지 (상세/수정 등)

사이드바는 1024px(lg) 기준으로 탑 네브 ↔ 사이드바 전환.

```
w-full lg:max-w-3xl
```

- **1023px 이하**: 컨텐츠 영역 100% 너비 (패딩 제외)
- **1024px 이상**: 최대 768px(max-w-3xl) 캡 적용

페이지 래퍼 전체 패턴:

```
<div className="p-6 lg:p-8 w-full lg:max-w-3xl">
```

---

## Border Radius

| 용도        | 값     | Tailwind       |
| ----------- | ------ | -------------- |
| 카드, 패널  | 16px   | `rounded-2xl`  |
| 버튼        | 10px   | `rounded-xl`   |
| 인풋        | 10px   | `rounded-xl`   |
| 뱃지, 태그  | 9999px | `rounded-full` |
| 아이콘 버튼 | 10px   | `rounded-xl`   |

---

## Shadow

```css
/* 카드 기본 */
box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);

/* 카드 호버 */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);

/* 모달 */
box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
```

---

## Animation

| 항목              | 값                                                                  |
| ----------------- | ------------------------------------------------------------------- |
| 마이크로 인터랙션 | 150ms ease                                                          |
| 호버 전환         | 200ms ease                                                          |
| 페이지 전환       | 300ms ease                                                          |
| 사용 속성         | `transform`, `opacity`, `background-color` (layout shift 없는 것만) |

```css
transition:
  background-color 200ms ease,
  box-shadow 200ms ease,
  opacity 200ms ease;
```

---

## Component Tokens

### Button

```
Primary:  bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-4 py-2.5 font-medium cursor-pointer transition-colors duration-200
Ghost:    bg-white/[0.08] hover:bg-white/[0.13] text-white/80 border border-white/[0.12] rounded-xl
Danger:   bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl
```

### Input

```
bg-white/[0.06] border border-white/[0.12] rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500
focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30
```

### Badge / Status

```
pending:   bg-yellow-500/20 text-yellow-400 border border-yellow-500/30
confirmed: bg-emerald-500/20 text-emerald-400 border border-emerald-500/30
rejected:  bg-red-500/20 text-red-400 border border-red-500/30
cancelled: bg-slate-500/20 text-slate-400 border border-slate-500/30
completed: bg-blue-500/20 text-blue-400 border border-blue-500/30
```

---

## Icons

- **라이브러리**: Lucide React (구현 시 설치 필요)
- **기본 크기**: `w-5 h-5` (20px)
- **색상**: `text-slate-400` (기본), `text-emerald-400` (활성), `text-white` (강조)
- **금지**: 이모지를 아이콘으로 사용 금지

---

## Accessibility

- 텍스트 대비 최소 4.5:1 (WCAG AA)
- 모든 클릭 요소 `cursor-pointer`
- 포커스 링: `focus-visible:ring-2 focus-visible:ring-emerald-500`
- 터치 타겟 최소 44x44px
- `prefers-reduced-motion` 준수

---

## Anti-patterns (하지 말 것)

- 라이트 모드에서 `bg-white/10` 사용 (너무 투명)
- 레이아웃 shift 유발 `scale` 트랜지션
- 여러 포인트 컬러 혼용 (에메랄드 단일 유지)
- 이모지를 UI 아이콘으로 사용
- `width`, `height` 트랜지션 (transform 사용)
