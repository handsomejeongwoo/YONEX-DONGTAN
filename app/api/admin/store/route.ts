import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readContent, updateContent } from "@/lib/repository/content-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 편집 허용하는 매장 필드(화이트리스트)
const STRING_FIELDS = [
  "name",
  "official",
  "address",
  "smartStoreUrl",
  "instagramUrl",
  "youtubeChannelUrl",
  "naverMapUrl",
  "phone",
  "hours",
  "closedDay",
  "notice",
] as const;

function unauthorized() {
  return NextResponse.json({ ok: false, error: "인증이 필요합니다." }, { status: 401 });
}

// GET /api/admin/store
export async function GET() {
  if (!isAdmin()) return unauthorized();
  const c = await readContent();
  return NextResponse.json({ ok: true, store: c.store });
}

// PATCH /api/admin/store  → 매장 정보/공지 부분 수정
export async function PATCH(req: Request) {
  if (!isAdmin()) return unauthorized();
  const raw = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!raw || typeof raw !== "object")
    return NextResponse.json({ ok: false, error: "본문이 올바르지 않습니다." }, { status: 400 });

  const c = await updateContent((draft) => {
    for (const f of STRING_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(raw, f)) {
        (draft.store as unknown as Record<string, unknown>)[f] = String(raw[f] ?? "").trim();
      }
    }
    if (Object.prototype.hasOwnProperty.call(raw, "noticeStartAt"))
      draft.store.noticeStartAt = String(raw.noticeStartAt ?? "").trim() || null;
    if (Object.prototype.hasOwnProperty.call(raw, "noticeEndAt"))
      draft.store.noticeEndAt = String(raw.noticeEndAt ?? "").trim() || null;
  });

  return NextResponse.json({ ok: true, store: c.store });
}
