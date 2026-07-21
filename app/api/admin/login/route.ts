import { NextResponse } from "next/server";
import {
  createSessionToken,
  verifyAccessCode,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { code?: unknown };

  if (!process.env.ADMIN_ACCESS_CODE) {
    return NextResponse.json(
      { ok: false, error: "서버에 관리자 코드가 설정되지 않았습니다." },
      { status: 500 },
    );
  }
  if (!verifyAccessCode(body.code)) {
    return NextResponse.json(
      { ok: false, error: "관리자 코드가 올바르지 않습니다." },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
