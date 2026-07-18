"use client";

import { useEffect, useState } from "react";

// 전 페이지 공통 — 오른쪽 아래 '맨 위로' 버튼. 스크롤 내리면 나타남.
export default function ScrollTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="맨 위로"
      style={{
        position: "fixed",
        right: "clamp(16px,3vw,28px)",
        bottom: "clamp(16px,3vw,28px)",
        zIndex: 55,
        width: 48,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--blue)",
        color: "#fff",
        border: "1px solid var(--blue)",
        borderRadius: 3,
        cursor: "pointer",
        boxShadow: "0 8px 24px rgba(7,31,58,.28)",
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(10px)",
        pointerEvents: show ? "auto" : "none",
        transition: "opacity .25s ease, transform .25s ease, background .2s ease",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 5 L12 19 M5 12 L12 5 L19 12"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
