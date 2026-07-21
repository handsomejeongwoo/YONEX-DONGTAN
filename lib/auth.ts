import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// 관리자 세션 — HMAC 서명 쿠키. 진짜 권한 검증은 서버(이 코드)에서만 한다.
export const SESSION_COOKIE = "yd_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8시간(초)

function secret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_ACCESS_CODE ||
    ""
  );
}

function hmac(value: string): string {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/** 입력한 관리자 코드가 맞는지(상수 시간 비교). */
export function verifyAccessCode(code: unknown): boolean {
  const expected = process.env.ADMIN_ACCESS_CODE;
  if (!expected || typeof code !== "string" || code.length === 0) return false;
  return safeEqual(code, expected);
}

/** 로그인 성공 시 발급할 세션 토큰. */
export function createSessionToken(): string {
  const exp = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `admin.${exp}`;
  return `${payload}.${hmac(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  if (!safeEqual(hmac(payload), sig)) return false;
  const exp = Number(payload.split(".")[1]);
  return Number.isFinite(exp) && exp > Date.now();
}

/** 현재 요청이 관리자 세션인지. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** 관리자 전용 서버 컴포넌트 상단에서 호출. 비인증이면 로그인으로 리다이렉트. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
