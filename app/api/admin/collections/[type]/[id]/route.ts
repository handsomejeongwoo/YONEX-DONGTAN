import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getCollection, normalize, type CollectionType } from "@/lib/admin/collections";
import { updateItem, removeItem } from "@/lib/repository/content-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "인증이 필요합니다." }, { status: 401 });
}

// PATCH /api/admin/collections/:type/:id  → 부분 수정
export async function PATCH(
  req: Request,
  { params }: { params: { type: string; id: string } },
) {
  if (!isAdmin()) return unauthorized();
  const def = getCollection(params.type);
  if (!def) return NextResponse.json({ ok: false, error: "알 수 없는 타입" }, { status: 404 });

  const raw = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!raw || typeof raw !== "object")
    return NextResponse.json({ ok: false, error: "본문이 올바르지 않습니다." }, { status: 400 });

  const result = normalize(params.type as CollectionType, raw, "patch");
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });

  // id는 변경 불가
  delete (result.value as Record<string, unknown>).id;

  const updated = await updateItem(def.key, params.id, result.value as never);
  if (!updated) return NextResponse.json({ ok: false, error: "항목을 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ ok: true, item: updated });
}

// DELETE /api/admin/collections/:type/:id
export async function DELETE(
  _req: Request,
  { params }: { params: { type: string; id: string } },
) {
  if (!isAdmin()) return unauthorized();
  const def = getCollection(params.type);
  if (!def) return NextResponse.json({ ok: false, error: "알 수 없는 타입" }, { status: 404 });

  const removed = await removeItem(def.key, params.id);
  if (!removed) return NextResponse.json({ ok: false, error: "항목을 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
