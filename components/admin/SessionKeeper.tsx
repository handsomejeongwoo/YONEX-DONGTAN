"use client";

import { useEffect } from "react";

/**
 * 관리 화면을 열 때마다 세션 만료 시각을 뒤로 민다.
 * 계속 사용하는 동안에는 로그인이 풀리지 않고,
 * 한동안 안 들어오면 그때부터 만료 시간이 흐른다.
 */
export default function SessionKeeper() {
  useEffect(() => {
    fetch("/api/admin/refresh/", { method: "POST" }).catch(() => {});
  }, []);

  return null;
}
