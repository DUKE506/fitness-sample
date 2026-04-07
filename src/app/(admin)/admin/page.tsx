import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "대시보드",
};

export default function AdminDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white">대시보드</h1>
      <p className="mt-2 text-slate-400">Phase 2에서 구현 예정</p>
    </div>
  );
}
