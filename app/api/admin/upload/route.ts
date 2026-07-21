import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  buildMediaKey,
  getMediaBucket,
  mediaPath,
} from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/admin/upload  (multipart: file, folder?)
// → { ok: true, path: "/media/products/xxx.jpg" }
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "인증이 필요합니다." }, { status: 401 });
  }

  const bucket = await getMediaBucket();
  if (!bucket) {
    return NextResponse.json(
      { ok: false, error: "이미지 저장소(R2)가 연결되지 않았습니다." },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "업로드 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "파일이 없습니다." }, { status: 400 });
  }

  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: "이미지 파일만 올릴 수 있습니다 (JPG·PNG·WEBP·GIF·AVIF)." },
      { status: 415 },
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = Math.round(MAX_UPLOAD_BYTES / 1024 / 1024);
    return NextResponse.json(
      { ok: false, error: `파일이 너무 큽니다. ${mb}MB 이하로 올려주세요.` },
      { status: 413 },
    );
  }

  const folder = String(form.get("folder") ?? "misc");
  const key = buildMediaKey(folder, file.name, ext);

  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type,
      // 키에 무작위 값이 들어가 내용이 바뀌면 키도 바뀐다 → 길게 캐시해도 안전.
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  return NextResponse.json({ ok: true, path: mediaPath(key), key });
}
