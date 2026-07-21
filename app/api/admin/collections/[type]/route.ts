import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getCollection, normalize, type CollectionType } from "@/lib/admin/collections";
import { listCollection, addItem } from "@/lib/repository/content-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "인증이 필요합니다." }, { status: 401 });
}

// GET /api/admin/collections/:type  → 목록
export async function GET(
  _req: Request,
  { params }: { params: { type: string } },
) {
  if (!isAdmin()) return unauthorized();
  const def = getCollection(params.type);
  if (!def) return NextResponse.json({ ok: false, error: "알 수 없는 타입" }, { status: 404 });
  const items = await listCollection(def.key);
  return NextResponse.json({ ok: true, items });
}

// POST /api/admin/collections/:type  → 생성
export async function POST(
  req: Request,
  { params }: { params: { type: string } },
) {
  if (!isAdmin()) return unauthorized();
  const def = getCollection(params.type);
  if (!def) return NextResponse.json({ ok: false, error: "알 수 없는 타입" }, { status: 404 });

  const raw = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!raw || typeof raw !== "object")
    return NextResponse.json({ ok: false, error: "본문이 올바르지 않습니다." }, { status: 400 });

  const result = normalize(params.type as CollectionType, raw, "create");
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });

  // 중복 id 방지(유튜브/인스타는 원본 id 사용)
  const existing = await listCollection(def.key);
  const newId = result.value.id as string | undefined;
  if (newId && (existing as Array<{ id?: string }>).some((it) => it.id === newId))
    return NextResponse.json({ ok: false, error: "이미 등록된 항목입니다." }, { status: 409 });

  // order 자동 부여(맨 뒤)
  const orders = (existing as Array<{ order?: number }>).map((it) => it.order ?? 0);
  result.value.order = (orders.length ? Math.max(...orders) : 0) + 1;

  const created = await addItem(def.key, result.value as never);
  return NextResponse.json({ ok: true, item: created }, { status: 201 });
}
