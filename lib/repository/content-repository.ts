import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Content } from "@/lib/types";
import {
  getDb,
  d1ReadContent,
  d1WriteContent,
  d1ListCollection,
  d1AddItem,
  d1UpdateItem,
  d1RemoveItem,
  d1Reorder,
  type CollectionKey,
} from "@/lib/repository/d1-backend";

// 콘텐츠 저장소 레이어.
// Cloudflare D1 바인딩(DB)이 있으면 D1을, 없으면 data/content.json 파일을 쓴다.
// 관리자 UI/API 는 이 모듈의 시그니처만 사용하므로 백엔드가 바뀌어도 영향이 없다.

const CONTENT_FILE = path.join(process.cwd(), "data", "content.json");

/** 하위호환/기본값 보정 — 두 백엔드 공통. */
function normalize(data: Content): Content {
  if (!Array.isArray(data.banners)) data.banners = [];
  if (!Array.isArray(data.products)) data.products = [];
  if (Array.isArray(data.records)) {
    data.records = data.records.map((r, i) => ({
      id: r.id || `rec-${r.date ?? "x"}-${String(i + 1).padStart(2, "0")}`,
      ...r,
    }));
  }
  return data;
}

// ===== 파일 백엔드 =====

async function fileRead(): Promise<Content> {
  const raw = await fs.readFile(CONTENT_FILE, "utf8");
  return normalize(JSON.parse(raw) as Content);
}

async function fileWrite(next: Content): Promise<void> {
  await fs.writeFile(CONTENT_FILE, JSON.stringify(next, null, 2) + "\n", "utf8");
}

// ===== 공개 API =====

/** 전체 콘텐츠를 읽는다(서버 전용). */
export async function readContent(): Promise<Content> {
  const db = await getDb();
  if (db) return normalize(await d1ReadContent(db));
  return fileRead();
}

/** 전체 콘텐츠를 저장한다(서버 전용). */
export async function writeContent(next: Content): Promise<void> {
  const db = await getDb();
  if (db) return d1WriteContent(db, next);
  return fileWrite(next);
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

// ===== 배열 컬렉션 공통 CRUD =====
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
  const db = await getDb();
  if (db) {
    return (await d1ListCollection(db, key as CollectionKey)) as unknown as Content[K];
  }
  return (await fileRead())[key];
}

/** 항목을 추가한다(맨 뒤). */
export async function addItem<K extends ArrayKeys>(
  key: K,
  item: ItemOf<K>,
): Promise<Content[K][number]> {
  const db = await getDb();
  if (db) {
    return (await d1AddItem(
      db,
      key as CollectionKey,
      item as unknown as Record<string, unknown>,
    )) as unknown as Content[K][number];
  }
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
  const db = await getDb();
  if (db) {
    return (await d1UpdateItem(db, key as CollectionKey, id, patch)) as unknown as
      | Content[K][number]
      | null;
  }
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
  const db = await getDb();
  if (db) return d1RemoveItem(db, key as CollectionKey, id);

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
  const db = await getDb();
  if (db) {
    return (await d1Reorder(db, key as CollectionKey, orderedIds)) as unknown as Content[K];
  }

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
