import "server-only";

// R2 이미지 저장소 접근 헬퍼.
// 업로드: /api/admin/upload (관리자 전용), 서빙: /media/<key>

/** 허용 이미지 타입 → 확장자 */
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/** 업로드 최대 크기(바이트). 매장 사진/배너 기준으로 넉넉히 8MB. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** R2 버킷 바인딩. 없으면 null(로컬에서 바인딩 없이 뜬 경우). */
export async function getMediaBucket(): Promise<R2Bucket | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    return (ctx?.env as unknown as { MEDIA?: R2Bucket } | undefined)?.MEDIA ?? null;
  } catch {
    return null;
  }
}

/** 원본 파일명을 안전한 슬러그로. */
function slugifyName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "image"
  );
}

/** 충돌하지 않는 저장 키 생성: <folder>/<slug>-<rand>.<ext> */
export function buildMediaKey(
  folder: string,
  originalName: string,
  ext: string,
): string {
  const rand = crypto.randomUUID().slice(0, 8);
  const safeFolder = /^[a-z0-9-]{1,20}$/.test(folder) ? folder : "misc";
  return `${safeFolder}/${slugifyName(originalName)}-${rand}.${ext}`;
}

/** 저장 키 → 사이트에서 쓰는 경로 */
export function mediaPath(key: string): string {
  return `/media/${key}`;
}
