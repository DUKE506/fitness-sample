export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 min-h-0 overflow-y-auto pb-16">{children}</main>
      {/* Tab bar placeholder — Phase 4에서 UserTabBar 컴포넌트로 교체 */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-white/[0.12] bg-neutral-950/90 backdrop-blur-[15px]" />
    </div>
  );
}
