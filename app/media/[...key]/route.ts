import { getMediaBucket } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /media/<key...>  → R2 에 저장된 이미지를 공개 서빙.
// 버킷을 public 으로 열지 않고 워커를 통해 내보내므로 접근 경로를 통제할 수 있다.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key: parts } = await params;
  const key = (parts ?? []).join("/");
  if (!key) return new Response("Not found", { status: 404 });

  const bucket = await getMediaBucket();
  if (!bucket) return new Response("Storage unavailable", { status: 503 });

  const object = await bucket.get(key);
  if (!object) return new Response("Not found", { status: 404 });

  // writeHttpMetadata(headers) 는 로컬 개발 프록시에서 Headers 를 직렬화하지 못해
  // 실패한다. 메타데이터를 직접 읽어 헤더를 구성한다.
  const meta = object.httpMetadata;
  const headers = new Headers();
  headers.set("content-type", meta?.contentType || "application/octet-stream");
  headers.set(
    "cache-control",
    meta?.cacheControl || "public, max-age=31536000, immutable",
  );
  headers.set("etag", object.httpEtag);

  return new Response(object.body, { headers });
}
