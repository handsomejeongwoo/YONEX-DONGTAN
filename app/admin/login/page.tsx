import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "관리자 로그인 · 요넥스 동탄점",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // 이미 로그인된 상태에서 이 주소로 들어오면(푸터 로고 5번 클릭·북마크 등)
  // 코드를 다시 묻지 않고 바로 관리 화면으로 보낸다.
  if (await isAdmin()) redirect("/admin");
  return <LoginForm />;
}
