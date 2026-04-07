import { redirect } from "next/navigation";

// 루트 접근 시 로그인으로 리다이렉트 (Phase 1에서 인증 상태 기반 분기 추가)
export default function RootPage() {
  redirect("/login");
}
