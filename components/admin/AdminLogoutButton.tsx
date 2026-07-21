"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/admin/logout/", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      style={{
        height: 38,
        padding: "0 16px",
        border: "1px solid #d7dee2",
        borderRadius: 4,
        background: "#fff",
        color: "#10222c",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {loading ? "…" : "로그아웃"}
    </button>
  );
}
