"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

// 푸터 로고 5회 연속 클릭 시 관리자 로그인으로 이동(진입 편의, 보안 아님).
export default function FooterLogo() {
  const router = useRouter();
  const count = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onClick() {
    count.current += 1;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      count.current = 0;
    }, 1500);
    if (count.current >= 5) {
      count.current = 0;
      if (timer.current) clearTimeout(timer.current);
      router.push("/admin/login");
    }
  }

  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "#fff",
        borderRadius: 2,
        padding: "8px 12px",
        cursor: "default",
        userSelect: "none",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/yonex-dongtan-logo.png"
        alt="YONEX DONGTAN"
        style={{ height: 26, width: "auto", display: "block" }}
        draggable={false}
      />
    </span>
  );
}
