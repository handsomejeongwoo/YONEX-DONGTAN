import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// 관리자 세션 — HMAC 서명 쿠키. 진짜 권한 검증은 서버(이 코드)에서만 한다.
export const SESSION_COOKIE = "yd_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8시간(초)

/**
 * 비밀값을 읽는다.
 *
 * 우선순위: Cloudflare 바인딩(env) → process.env
 * - 배포: `wrangler secret put` 으로 넣은 값이 바인딩으로 들어온다.
 * - 로컬: .dev.vars 의 값이 바인딩으로 들어온다.
 * .env.local 은 쓰지 않는다 — Next 빌드 시점에 읽혀 Workers 번들에
 * 구워질 수 있어 비밀값을 두면 유출된다.
 */
async function readSecret(name: string): Promise<string> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    const v = (ctx?.env as unknown as Record<string, unknown> | undefined)?.[
      name
    ];
    if (typeof v === "string" && v.length > 0) return v;
  } catch {
    // Cloudflare 컨텍스트가 없는 환경(스크립트 등) — process.env 로 폴백
  }
  return process.env[name] ?? "";
}

/** 관리자 코드가 설정되어 있는지. */
export async function hasAccessCode(): Promise<boolean> {
  return (await readSecret("ADMIN_ACCESS_CODE")).length > 0;
}

/** 세션 서명 키. 별도 값이 없으면 관리자 코드로 대체. */
async function signingKey(): Promise<string> {
  return (
    (await readSecret("ADMIN_SESSION_SECRET")) ||
    (await readSecret("ADMIN_ACCESS_CODE"))
  );
}

async function hmac(value: string): Promise<string> {
  return crypto
    .createHmac("sha256", await signingKey())
    .update(value)
    .digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/** 입력한 관리자 코드가 맞는지(상수 시간 비교). */
export async function verifyAccessCode(code: unknown): Promise<boolean> {
  const expected = await readSecret("ADMIN_ACCESS_CODE");
  if (!expected || typeof code !== "string" || code.length === 0) return false;
  return safeEqual(code, expected);
}

/** 로그인 성공 시 발급할 세션 토큰. */
export async function createSessionToken(): Promise<string> {
  const exp = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `admin.${exp}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  // 서명 키가 없으면 어떤 토큰도 신뢰하지 않는다.
  if (!(await signingKey())) return false;
  if (!safeEqual(await hmac(payload), sig)) return false;
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
