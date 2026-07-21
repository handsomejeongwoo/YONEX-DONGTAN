import { NextResponse } from "next/server";
import {
  createSessionToken,
  isAdmin,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/admin/refresh
// 관리 화면을 열 때마다 호출해 세션 만료 시각을 뒤로 민다.
// 계속 쓰는 동안에는 다시 로그인할 일이 없고, 손을 뗀 뒤에만 만료된다.
export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
