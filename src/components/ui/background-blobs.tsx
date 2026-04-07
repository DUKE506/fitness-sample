/**
 * 앱 전체 배경 장식 — glassmorphism backdrop-blur 효과가 보이려면
 * 카드 뒤에 색감이 있어야 합니다. 고정 위치로 화면 전체에 깔립니다.
 */
export function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      {/* 좌상단 에메랄드 */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
      {/* 우하단 에메랄드 (약하게) */}
      <div className="absolute -bottom-60 -right-40 w-[700px] h-[700px] rounded-full bg-emerald-600/8 blur-[140px]" />
      {/* 중앙 슬레이트 액센트 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-slate-700/20 blur-[100px]" />
    </div>
  );
}
