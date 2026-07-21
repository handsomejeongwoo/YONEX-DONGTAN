"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.ok && data.ok) {
        router.replace("/admin");
        router.refresh();
      } else {
        setError(data.error ?? "로그인에 실패했습니다.");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100svh",
        display: "grid",
        placeItems: "center",
        background: "#ffffff",
        padding: 24,
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 360,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/yonex-dongtan-logo.png"
            alt="요넥스 동탄점"
            style={{ height: 34, width: "auto", display: "block" }}
          />
        </span>
        <p style={{ fontSize: 14, color: "#5b6d73", margin: 0 }}>
          관리자 코드를 입력하세요.
        </p>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="관리자 코드"
          autoComplete="off"
          autoFocus
          style={{
            height: 48,
            padding: "0 14px",
            fontSize: 16,
            border: "1px solid #d7dee2",
            borderRadius: 4,
            outlineColor: "#0b50a1",
          }}
        />
        {error && (
          <p style={{ fontSize: 13, color: "#c0392b", margin: 0 }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || code.length === 0}
          style={{
            height: 48,
            border: "none",
            borderRadius: 4,
            background: "#0b50a1",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: loading ? "default" : "pointer",
            opacity: loading || code.length === 0 ? 0.6 : 1,
          }}
        >
          {loading ? "확인 중…" : "로그인"}
        </button>
      </form>
    </main>
  );
}
