import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "관리자 · 요넥스 동탄점",
  robots: { index: false, follow: false },
};

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div style={{ minHeight: "100svh", background: "#f4f6f8" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "#fff",
          borderBottom: "1px solid #e4e9ee",
          padding: "0 20px",
          height: 58,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/admin" prefetch style={{ fontSize: 15, fontWeight: 800, color: "#10222c" }}>
          요넥스 동탄점 · 관리자
        </Link>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 13, color: "#5b6d73", fontWeight: 600 }}
          >
            사이트 보기 ↗
          </a>
          <AdminLogoutButton />
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr)",
          maxWidth: 1160,
          margin: "0 auto",
          padding: "20px 16px 60px",
          gap: 20,
        }}
      >
        <AdminNav />
        <main style={{ minWidth: 0 }}>{children}</main>
      </div>
    </div>
  );
}
