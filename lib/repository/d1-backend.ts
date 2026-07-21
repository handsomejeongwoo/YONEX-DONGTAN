import "server-only";
import type { Content } from "@/lib/types";

// D1 백엔드 — items(컬렉션 항목) + settings(단일 오브젝트) 두 테이블에 매핑한다.
// 스키마는 migrations/0001_init.sql 참고.

/** content.json 의 배열 키 = items.collection 값 */
export const COLLECTION_KEYS = [
  "records",
  "youtube",
  "instagram",
  "shopPicks",
  "products",
  "banners",
] as const;
export type CollectionKey = (typeof COLLECTION_KEYS)[number];

/** settings 테이블에 저장하는 단일 오브젝트 키 */
const SETTING_KEYS = ["meta", "store", "owner"] as const;

type Row = { collection: string; id: string; sort_order: number; visible: number; data: string };
type SettingRow = { key: string; data: string };

type Item = Record<string, unknown> & { id?: string; order?: number; visible?: boolean };

/**
 * Cloudflare D1 바인딩을 가져온다. 바인딩이 없으면(순수 `next dev`,
 * 스크립트 실행 등) null 을 돌려주고 호출측이 파일 백엔드로 폴백한다.
 */
export async function getDb(): Promise<D1Database | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    return (ctx?.env as { DB?: D1Database } | undefined)?.DB ?? null;
  } catch {
    return null;
  }
}

function parseItem(row: Row): Item {
  const data = JSON.parse(row.data) as Item;
  // 컬럼이 원본. data 안 값과 어긋나면 컬럼을 신뢰한다.
  return { ...data, id: row.id, order: row.sort_order, visible: row.visible === 1 };
}

function itemColumns(item: Item, fallbackOrder: number) {
  return {
    id: String(item.id ?? ""),
    sort_order: Number.isFinite(item.order) ? Number(item.order) : fallbackOrder,
    visible: item.visible === false ? 0 : 1,
    data: JSON.stringify(item),
  };
}

/** 전체 콘텐츠를 D1에서 조립한다. */
export async function d1ReadContent(db: D1Database): Promise<Content> {
  const [itemsRes, settingsRes] = await Promise.all([
    db.prepare("SELECT collection, id, sort_order, visible, data FROM items ORDER BY collection, sort_order, id").all<Row>(),
    db.prepare("SELECT key, data FROM settings").all<SettingRow>(),
  ]);

  const content = {} as Record<string, unknown>;
  for (const k of COLLECTION_KEYS) content[k] = [];
  for (const row of itemsRes.results ?? []) {
    if (!Array.isArray(content[row.collection])) content[row.collection] = [];
    (content[row.collection] as Item[]).push(parseItem(row));
  }
  for (const row of settingsRes.results ?? []) {
    content[row.key] = JSON.parse(row.data);
  }
  return content as unknown as Content;
}

/** 전체 콘텐츠를 D1에 덮어쓴다(항목 수가 적어 전량 재기록). */
export async function d1WriteContent(db: D1Database, next: Content): Promise<void> {
  const src = next as unknown as Record<string, unknown>;
  const stmts: D1PreparedStatement[] = [db.prepare("DELETE FROM items")];

  const insert = db.prepare(
    "INSERT INTO items (collection, id, sort_order, visible, data) VALUES (?, ?, ?, ?, ?)",
  );
  for (const key of COLLECTION_KEYS) {
    const arr = (src[key] as Item[] | undefined) ?? [];
    arr.forEach((item, i) => {
      const c = itemColumns(item, i + 1);
      if (!c.id) return; // id 없는 항목은 저장하지 않는다
      stmts.push(insert.bind(key, c.id, c.sort_order, c.visible, c.data));
    });
  }

  const upsert = db.prepare(
    "INSERT INTO settings (key, data, updated_at) VALUES (?, ?, datetime('now')) " +
      "ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at",
  );
  for (const key of SETTING_KEYS) {
    if (src[key] !== undefined) stmts.push(upsert.bind(key, JSON.stringify(src[key])));
  }

  await db.batch(stmts);
}

export async function d1ListCollection(db: D1Database, key: CollectionKey): Promise<Item[]> {
  const res = await db
    .prepare("SELECT collection, id, sort_order, visible, data FROM items WHERE collection = ? ORDER BY sort_order, id")
    .bind(key)
    .all<Row>();
  return (res.results ?? []).map(parseItem);
}

export async function d1AddItem(db: D1Database, key: CollectionKey, item: Item): Promise<Item> {
  const maxRow = await db
    .prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM items WHERE collection = ?")
    .bind(key)
    .first<{ m: number }>();
  const c = itemColumns(item, (maxRow?.m ?? 0) + 1);
  await db
    .prepare("INSERT INTO items (collection, id, sort_order, visible, data) VALUES (?, ?, ?, ?, ?)")
    .bind(key, c.id, c.sort_order, c.visible, c.data)
    .run();
  return { ...item, order: c.sort_order };
}

export async function d1UpdateItem(
  db: D1Database,
  key: CollectionKey,
  id: string,
  patch: Partial<Item>,
): Promise<Item | null> {
  const row = await db
    .prepare("SELECT collection, id, sort_order, visible, data FROM items WHERE collection = ? AND id = ?")
    .bind(key, id)
    .first<Row>();
  if (!row) return null;

  const merged: Item = { ...parseItem(row), ...patch, id };
  const c = itemColumns(merged, row.sort_order);
  await db
    .prepare("UPDATE items SET sort_order = ?, visible = ?, data = ?, updated_at = datetime('now') WHERE collection = ? AND id = ?")
    .bind(c.sort_order, c.visible, c.data, key, id)
    .run();
  return merged;
}

export async function d1RemoveItem(db: D1Database, key: CollectionKey, id: string): Promise<boolean> {
  const res = await db
    .prepare("DELETE FROM items WHERE collection = ? AND id = ?")
    .bind(key, id)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function d1Reorder(
  db: D1Database,
  key: CollectionKey,
  orderedIds: string[],
): Promise<Item[]> {
  const current = await d1ListCollection(db, key);
  const known = new Set(current.map((i) => String(i.id)));
  const seen = new Set<string>();
  const finalOrder: string[] = [];
  for (const id of orderedIds) {
    if (known.has(id) && !seen.has(id)) {
      seen.add(id);
      finalOrder.push(id);
    }
  }
  // 목록에 없던 항목은 기존 순서대로 뒤에 붙인다.
  for (const item of current) {
    const id = String(item.id);
    if (!seen.has(id)) finalOrder.push(id);
  }

  const stmt = db.prepare(
    "UPDATE items SET sort_order = ?, updated_at = datetime('now') WHERE collection = ? AND id = ?",
  );
  await db.batch(finalOrder.map((id, i) => stmt.bind(i + 1, key, id)));
  return d1ListCollection(db, key);
}

/** settings 단일 오브젝트 갱신. */
export async function d1PutSetting(db: D1Database, key: string, value: unknown): Promise<void> {
  await db
    .prepare(
      "INSERT INTO settings (key, data, updated_at) VALUES (?, ?, datetime('now')) " +
        "ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at",
    )
    .bind(key, JSON.stringify(value))
    .run();
}

/** 데이터가 하나라도 있는지(시드 여부 판단용). */
export async function d1HasData(db: D1Database): Promise<boolean> {
  try {
    const row = await db.prepare("SELECT COUNT(*) AS n FROM settings").first<{ n: number }>();
    return (row?.n ?? 0) > 0;
  } catch {
    return false; // 테이블 자체가 없으면 마이그레이션 전
  }
}
