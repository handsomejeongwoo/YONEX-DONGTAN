"use client";

import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "대시보드", exact: true },
  { href: "/admin/collections/products", label: "추천 상품" },
  { href: "/admin/collections/youtube", label: "유튜브" },
  { href: "/admin/collections/reels", label: "인스타 릴스" },
  { href: "/admin/collections/achievements", label: "대회 이력" },
  { href: "/admin/collections/banners", label: "배너" },
  { href: "/admin/store", label: "매장 정보" },
  { href: "/admin/docs", label: "사용 설명서" },
];

export default function AdminNav() {
  const pathname = usePathname() || "";

  return (
    <nav
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        background: "#fff",
        border: "1px solid #e4e9ee",
        borderRadius: 8,
        padding: 8,
      }}
    >
      {LINKS.map((l) => {
        const active = l.exact
          ? pathname === l.href || pathname === l.href + "/"
          : pathname.startsWith(l.href);
        return (
          <a
            key={l.href}
            href={l.href}
            style={{
              fontSize: 14,
              fontWeight: 600,
              padding: "8px 14px",
              borderRadius: 6,
              color: active ? "#fff" : "#3a4c54",
              background: active ? "#0b50a1" : "transparent",
            }}
          >
            {l.label}
          </a>
        );
      })}
    </nav>
  );
}
