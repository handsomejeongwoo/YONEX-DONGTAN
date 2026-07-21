import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { parseYoutubeId, guessYoutubeType } from "@/lib/admin/collections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/youtube-info?url=...
// 유튜브 공개 oEmbed 로 제목을 가져온다(API 키 불필요).
export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "인증이 필요합니다." }, { status: 401 });
  }

  const url = new URL(req.url).searchParams.get("url") ?? "";
  const id = parseYoutubeId(url);
  if (!id) {
    return NextResponse.json({ ok: false, error: "유효한 유튜브 URL이 아닙니다." }, { status: 400 });
  }

  const watchUrl = `https://www.youtube.com/watch?v=${id}`;
  const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`;

  try {
    const res = await fetch(oembed, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "영상 정보를 가져오지 못했습니다. 비공개이거나 삭제된 영상일 수 있습니다." },
        { status: 502 },
      );
    }
    const data = (await res.json()) as { title?: string };
    return NextResponse.json({
      ok: true,
      id,
      title: data.title ?? "",
      type: guessYoutubeType(url),
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "영상 정보를 가져오지 못했습니다." },
      { status: 502 },
    );
  }
}
