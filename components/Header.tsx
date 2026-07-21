"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * 같은 페이지 안의 앵커(#videos)는 그대로 <a> 로 두고,
 * 다른 페이지로 가는 주소만 Link 로 감싼다.
 * Link 는 전체 새로고침 없이 이동하고, 미리 받아둬서 체감이 빨라진다.
 */
function NavLink({
  href,
  children,
  ...rest
}: {
  href: string;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith("#")) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} prefetch {...rest}>
      {children}
    </Link>
  );
}

type Variant = "home" | "owner";

const S = {
  primary: "#0B50A1",
};

export default function Header({
  variant,
  smartStoreUrl,
}: {
  variant: Variant;
  smartStoreUrl: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const m = window.innerWidth <= 860;
      setIsMobile(m);
      if (!m) setMenuOpen(false);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 홈은 같은 페이지 앵커, 대표 페이지는 홈으로 이동하는 앵커.
  const p = variant === "home" ? "" : "/";
  const logoHref = variant === "home" ? "#top" : "/";
  const nav = [
    { label: "홈", href: variant === "home" ? "#top" : "/", active: variant === "home" },
    { label: "사장님 소개", href: "/owner", active: variant === "owner" },
    { label: "영상", href: `${p}#videos` },
    { label: "오시는 길", href: `${p}#visit` },
  ];

  return (
    <header
      data-header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 60,
        background: "#fff",
        borderBottom: "1px solid var(--line)",
        transition: "box-shadow .2s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 24px",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <NavLink
          href={logoHref}
          aria-label="요넥스 동탄점 홈"
          style={{ display: "flex", alignItems: "center" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/yonex-dongtan-logo.png"
            alt="YONEX DONGTAN"
            style={{ height: 38, width: "auto", display: "block" }}
          />
        </NavLink>

        {!isMobile && (
          <nav style={{ display: "flex", alignItems: "center", gap: 26 }}>
            {nav.map((n) => (
              <NavLink
                key={n.label}
                href={n.href}
                className="navlink"
                style={{
                  fontSize: 15,
                  fontWeight: n.active ? 600 : 500,
                  color: n.active ? S.primary : "#26383f",
                  whiteSpace: "nowrap",
                }}
              >
                {n.label}
              </NavLink>
            ))}
            <a
              href={smartStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-primary"
            >
              네이버 스마트 스토어 바로가기
            </a>
          </nav>
        )}

        {isMobile && (
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="메뉴 열기"
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "1px solid #d5dee0",
              borderRadius: 2,
              cursor: "pointer",
            }}
          >
            <span style={{ display: "block", width: 20, height: 14, position: "relative" }}>
              {[0, 6, 12].map((t) => (
                <span
                  key={t}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: t,
                    width: 20,
                    height: 2,
                    background: "#10222C",
                  }}
                />
              ))}
            </span>
          </button>
        )}
      </div>

      {isMobile && menuOpen && (
        <nav
          style={{
            background: "#fff",
            borderTop: "1px solid #E1E9EB",
            padding: "8px 20px 18px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {nav.map((n) => (
            <NavLink
              key={n.label}
              href={n.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                minHeight: 48,
                fontSize: 17,
                fontWeight: n.active ? 600 : 500,
                color: n.active ? S.primary : "#10222C",
                borderBottom: "1px solid #EEF3F4",
              }}
            >
              {n.label}
            </NavLink>
          ))}
          <a
            href={smartStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 50,
              marginTop: 14,
              background: S.primary,
              color: "#fff",
              fontWeight: 600,
              fontSize: 16,
              borderRadius: 2,
            }}
          >
            네이버 스마트 스토어 바로가기
          </a>
        </nav>
      )}
    </header>
  );
}
