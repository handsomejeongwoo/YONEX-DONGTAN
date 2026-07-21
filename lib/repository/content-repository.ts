import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Content } from "@/lib/types";

// 콘텐츠 저장소 레이어.
// 지금은 data/content.json 파일을 읽고 쓰지만, 이후 Cloudflare D1 로 교체해도
// 관리자 UI/API 는 이 인터페이스만 사용하므로 바뀌지 않는다.

const CONTENT_FILE = path.join(process.cwd(), "data", "content.json");

/** 전체 콘텐츠를 읽는다(서버 전용). */
export async function readContent(): Promise<Content> {
  const raw = await fs.readFile(CONTENT_FILE, "utf8");
  const data = JSON.parse(raw) as Content;
  // 하위호환: 예전 파일에 없을 수 있는 배열 백필.
  if (!Array.isArray(data.banners)) data.banners = [];
  if (!Array.isArray(data.products)) data.products = [];
  // records id 백필(예전 데이터).
  if (Array.isArray(data.records)) {
    data.records = data.records.map((r, i) => ({
      id: r.id || `rec-${r.date ?? "x"}-${String(i + 1).padStart(2, "0")}`,
      ...r,
    }));
  }
  return data;
}

// ===== 배열 컬렉션 공통 CRUD =====
// content 안의 "배열" 필드만 대상으로 한다(products/banners/youtube/instagram/records).
type ArrayKeys = {
  [K in keyof Content]: Content[K] extends unknown[] ? K : never;
}[keyof Content];

type ItemOf<K extends ArrayKeys> = Content[K][number] & {
  id?: string;
  order?: number;
};

/** 컬렉션 전체를 읽는다. */
export async function listCollection<K extends ArrayKeys>(
  key: K,
): Promise<Content[K]> {
  const c = await readContent();
  return c[key];
}

/** 항목을 추가한다(맨 뒤). */
export async function addItem<K extends ArrayKeys>(
  key: K,
  item: ItemOf<K>,
): Promise<Content[K][number]> {
  let created!: Content[K][number];
  await updateContent((c) => {
    const arr = c[key] as unknown as ItemOf<K>[];
    created = item as Content[K][number];
    arr.push(item);
  });
  return created;
}

/** id로 항목을 부분 갱신한다. 없으면 null. */
export async function updateItem<K extends ArrayKeys>(
  key: K,
  id: string,
  patch: Partial<ItemOf<K>>,
): Promise<Content[K][number] | null> {
  let updated: Content[K][number] | null = null;
  await updateContent((c) => {
    const arr = c[key] as unknown as ItemOf<K>[];
    const idx = arr.findIndex((it) => it.id === id);
    if (idx === -1) return;
    arr[idx] = { ...arr[idx], ...patch, id: arr[idx].id };
    updated = arr[idx] as Content[K][number];
  });
  return updated;
}

/** id로 항목을 삭제한다. 삭제 여부 반환. */
export async function removeItem<K extends ArrayKeys>(
  key: K,
  id: string,
): Promise<boolean> {
  let removed = false;
  await updateContent((c) => {
    const arr = c[key] as unknown as ItemOf<K>[];
    const idx = arr.findIndex((it) => it.id === id);
    if (idx === -1) return;
    arr.splice(idx, 1);
    removed = true;
  });
  return removed;
}

/** 주어진 id 순서대로 재정렬하고 order 값을 1..n 으로 다시 매긴다. */
export async function reorderCollection<K extends ArrayKeys>(
  key: K,
  orderedIds: string[],
): Promise<Content[K]> {
  let result!: Content[K];
  await updateContent((c) => {
    const arr = c[key] as unknown as ItemOf<K>[];
    const byId = new Map(arr.map((it) => [it.id, it]));
    const next: ItemOf<K>[] = [];
    orderedIds.forEach((id) => {
      const it = byId.get(id);
      if (it) {
        byId.delete(id);
        next.push(it);
      }
    });
    // 목록에 없던 항목은 뒤에 유지.
    byId.forEach((it) => next.push(it));
    next.forEach((it, i) => {
      if ("order" in it) it.order = i + 1;
    });
    arr.length = 0;
    arr.push(...next);
    result = arr as unknown as Content[K];
  });
  return result;
}

/** 전체 콘텐츠를 저장한다(서버 전용). */
export async function writeContent(next: Content): Promise<void> {
  const json = JSON.stringify(next, null, 2) + "\n";
  await fs.writeFile(CONTENT_FILE, json, "utf8");
}

/** 콘텐츠의 한 부분만 갱신한다. */
export async function updateContent(
  mutate: (draft: Content) => void | Content,
): Promise<Content> {
  const current = await readContent();
  const result = mutate(current) ?? current;
  await writeContent(result);
  return result;
}
