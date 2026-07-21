-- 요넥스 동탄점 콘텐츠 저장소 (D1)
--
-- 설계 메모:
-- 콘텐츠는 "정렬 가능한 항목의 컬렉션" 형태가 전부이고, 필드는 관리자 레지스트리
-- (lib/admin/collections.ts)에서 정의된다. 필드가 늘 때마다 ALTER TABLE 을 하지
-- 않도록 가변 필드는 data(JSON)에 담고, 조회·정렬에 쓰는 값만 컬럼으로 승격한다.

CREATE TABLE IF NOT EXISTS items (
  collection TEXT    NOT NULL,          -- products | youtube | instagram | records | banners | shopPicks
  id         TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible    INTEGER NOT NULL DEFAULT 1,-- 0/1
  data       TEXT    NOT NULL,          -- 항목 전체 JSON
  updated_at TEXT    NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (collection, id)
);

CREATE INDEX IF NOT EXISTS idx_items_collection_order
  ON items (collection, sort_order);

-- 단일 오브젝트(store / owner / meta)
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,          -- store | owner | meta
  data       TEXT NOT NULL,             -- JSON
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
