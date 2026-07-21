import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getCollection } from "@/lib/admin/collections";
import { reorderCollection } from "@/lib/repository/content-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/admin/collections/:type/reorder  { ids: string[] }
export async function POST(
  req: Request,
  { params }: { params: { type: string } },
) {
  if (!isAdmin())
    return NextResponse.json({ ok: false, error: "인증이 필요합니다." }, { status: 401 });
  const def = getCollection(params.type);
  if (!def) return NextResponse.json({ ok: false, error: "알 수 없는 타입" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as { ids?: unknown } | null;
  if (!body || !Array.isArray(body.ids))
    return NextResponse.json({ ok: false, error: "ids 배열이 필요합니다." }, { status: 400 });

  const ids = body.ids.map((x) => String(x));
  const items = await reorderCollection(def.key, ids);
  return NextResponse.json({ ok: true, items });
}
