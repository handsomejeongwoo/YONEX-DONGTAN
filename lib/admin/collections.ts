// 관리자 컬렉션 레지스트리 — 필드 스키마와 정규화 로직을 한 곳에 정의한다.
// API 라우트(검증)와 관리자 UI(폼 렌더)가 모두 이 모듈을 사용한다.
// (server-only 아님: 필드 스키마는 클라이언트 폼에서도 필요)

export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "number"
  | "select"
  | "tags"
  | "checkbox";

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  help?: string;
  required?: boolean;
  /** 목록 테이블에 보일 대표 컬럼인지. */
  primary?: boolean;
}

export type CollectionType =
  | "products"
  | "youtube"
  | "reels"
  | "achievements"
  | "banners";

export interface CollectionDef {
  /** content.json 안의 배열 키. */
  key: "products" | "youtube" | "instagram" | "records" | "banners";
  label: string;
  singular: string;
  /** 목록에서 제목으로 쓸 필드. */
  titleField: string;
  fields: Field[];
}

// ---- 공통 파서/헬퍼 ----

/** 유튜브 URL/ID에서 영상 ID 추출. */
export function parseYoutubeId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  // 이미 ID(11자)만 들어온 경우
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1];
  }
  return null;
}

/** 유튜브 shorts URL 여부로 type 추정. */
export function guessYoutubeType(url: string): "video" | "short" {
  return /shorts\//.test(url) ? "short" : "video";
}

/** 인스타 URL에서 shortcode 추출. */
export function parseInstagramCode(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  const m = s.match(/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9_-]+$/.test(s)) return s;
  return null;
}

let idCounter = 0;
/** 슬러그 + 짧은 접미사로 안정적 id 생성. */
export function slugId(base: string, prefix = "item"): string {
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  idCounter = (idCounter + 1) % 1000;
  const suffix = Date.now().toString(36).slice(-4) + idCounter.toString(36);
  return `${slug || prefix}-${suffix}`;
}

/** "289,000원" / "289000" → 289000. 파싱 불가 시 null. */
export function toWon(v: string): number | null {
  const n = Number(String(v).replace(/[^0-9]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** 정가/판매가로 할인율(%) 계산. 불가하면 null. */
export function computeDiscount(
  original: string,
  price: string,
): number | null {
  const o = toWon(original);
  const p = toWon(price);
  if (o === null || p === null || o <= p) return null;
  return Math.round(((o - p) / o) * 100);
}

// ---- 컬렉션 정의 ----

const BADGE_OPTIONS = [
  { value: "", label: "없음" },
  { value: "NEW", label: "NEW" },
  { value: "PICK", label: "PICK" },
  { value: "SALE", label: "SALE" },
];

export const COLLECTIONS: Record<CollectionType, CollectionDef> = {
  products: {
    key: "products",
    label: "추천 상품",
    singular: "상품",
    titleField: "name",
    fields: [
      { name: "name", label: "상품명", type: "text", required: true, primary: true },
      { name: "category", label: "카테고리 라벨", type: "text", placeholder: "SPEED / POWER / CONTROL …" },
      { name: "image", label: "이미지 URL", type: "url", placeholder: "https://…", help: "스마트스토어 상품 이미지 주소" },
      { name: "originalPrice", label: "정가", type: "text", placeholder: "289,000원" },
      { name: "price", label: "판매가", type: "text", placeholder: "260,000원", primary: true },
      { name: "blurb", label: "설명", type: "textarea" },
      { name: "specs", label: "스펙 태그", type: "tags", help: "쉼표로 구분 (예: Head Light, 4U · 20–28 lbs)" },
      { name: "badge", label: "배지", type: "select", options: BADGE_OPTIONS },
      { name: "url", label: "스마트스토어 링크", type: "url", required: true, placeholder: "https://smartstore.naver.com/…" },
      { name: "visible", label: "공개", type: "checkbox" },
    ],
  },
  youtube: {
    key: "youtube",
    label: "유튜브 영상",
    singular: "영상",
    titleField: "title",
    fields: [
      { name: "url", label: "유튜브 URL", type: "url", required: true, primary: true, placeholder: "https://youtube.com/watch?v=… 또는 /shorts/…", help: "붙여넣으면 영상ID·썸네일·타입 자동 추출" },
      { name: "title", label: "제목", type: "text", required: true, primary: true },
      { name: "type", label: "타입", type: "select", options: [ { value: "video", label: "일반 영상" }, { value: "short", label: "쇼츠" } ] },
      { name: "category", label: "카테고리", type: "text", placeholder: "장비 리뷰 / 경기 영상 …" },
      { name: "badge", label: "배지", type: "text", placeholder: "GEAR REVIEW / MATCH …" },
      { name: "publishedAt", label: "게시일", type: "text", placeholder: "2026-07-14" },
      { name: "tags", label: "태그", type: "tags", help: "노출 위치 태그 (home-latest, owner-gear …)" },
      { name: "visible", label: "공개", type: "checkbox" },
    ],
  },
  reels: {
    key: "instagram",
    label: "인스타 릴스",
    singular: "릴스",
    titleField: "caption",
    fields: [
      { name: "url", label: "인스타 URL", type: "url", required: true, primary: true, placeholder: "https://instagram.com/reel/… 또는 /p/…", help: "붙여넣으면 shortcode(id) 자동 추출" },
      { name: "caption", label: "문구", type: "text", required: true, primary: true },
      { name: "image", label: "썸네일 경로/URL", type: "text", placeholder: "/assets/instagram/CODE.jpg", help: "비우면 그라디언트 카드로 폴백" },
      { name: "type", label: "타입", type: "select", options: [ { value: "reel", label: "릴스" }, { value: "image", label: "이미지" } ] },
      { name: "tags", label: "태그", type: "tags" },
      { name: "featured", label: "홈 노출", type: "checkbox" },
      { name: "pinned", label: "상단 고정", type: "checkbox" },
      { name: "visible", label: "공개", type: "checkbox" },
    ],
  },
  achievements: {
    key: "records",
    label: "대회 이력",
    singular: "대회 기록",
    titleField: "title",
    fields: [
      { name: "date", label: "일자", type: "text", required: true, placeholder: "2025-10-26", help: "YYYY-MM-DD" },
      { name: "title", label: "대회명", type: "text", required: true, primary: true },
      { name: "category", label: "종목/부수", type: "text", placeholder: "남복 준자강 (결승 21–18)", primary: true },
      { name: "partner", label: "파트너", type: "text" },
      { name: "result", label: "결과", type: "text", placeholder: "우승 / 준우승 / 3위", primary: true },
      { name: "source", label: "출처 링크", type: "url", placeholder: "https://…" },
      { name: "highlight", label: "상단 강조", type: "checkbox" },
      { name: "visible", label: "공개", type: "checkbox" },
    ],
  },
  banners: {
    key: "banners",
    label: "배너",
    singular: "배너",
    titleField: "title",
    fields: [
      { name: "title", label: "제목", type: "text", required: true, primary: true },
      { name: "category", label: "상단 라벨", type: "text", placeholder: "NEW ARRIVAL …" },
      { name: "description", label: "설명", type: "textarea" },
      { name: "image", label: "이미지 URL", type: "url", placeholder: "https://…" },
      { name: "theme", label: "테마", type: "select", options: [ { value: "blue", label: "블루" }, { value: "green", label: "그린" }, { value: "white", label: "화이트" } ] },
      { name: "imagePosition", label: "이미지 위치", type: "select", options: [ { value: "right", label: "오른쪽" }, { value: "left", label: "왼쪽" }, { value: "center", label: "가운데" } ] },
      { name: "buttonLabel", label: "버튼 문구", type: "text", placeholder: "자세히 보기" },
      { name: "href", label: "버튼 링크", type: "url", placeholder: "https://… 또는 /owner" },
      { name: "startAt", label: "게시 시작", type: "text", placeholder: "2026-07-01 (선택)" },
      { name: "endAt", label: "게시 종료", type: "text", placeholder: "2026-07-31 (선택)" },
      { name: "visible", label: "공개", type: "checkbox" },
    ],
  },
};

export function getCollection(type: string): CollectionDef | null {
  return (COLLECTIONS as Record<string, CollectionDef>)[type] ?? null;
}

// ---- 정규화(create/patch 공통) ----
// raw(임의 객체) → 해당 컬렉션의 유효한 항목/부분. 실패 시 error.

export type NormalizeResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; error: string };

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : v == null ? "" : String(v);
}
function bool(v: unknown): boolean {
  return v === true || v === "true" || v === "on" || v === 1;
}
function tags(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === "string")
    return v.split(",").map((x) => x.trim()).filter(Boolean);
  return [];
}

/**
 * @param type 컬렉션 타입
 * @param raw  입력 객체
 * @param mode "create" | "patch"
 * @param existing patch 시 기존 항목(id 유지용)
 */
export function normalize(
  type: CollectionType,
  raw: Record<string, unknown>,
  mode: "create" | "patch",
): NormalizeResult {
  const def = COLLECTIONS[type];
  const out: Record<string, unknown> = {};

  const has = (k: string) => Object.prototype.hasOwnProperty.call(raw, k);
  // 필수 필드 검사(create 시에만 전체 검사, patch는 넘어온 필드만)
  for (const f of def.fields) {
    if (mode === "create" && f.required && !str(raw[f.name])) {
      return { ok: false, error: `${f.label}은(는) 필수입니다.` };
    }
  }

  switch (type) {
    case "products": {
      if (has("name")) out.name = str(raw.name);
      if (has("category")) out.category = str(raw.category);
      if (has("image")) out.image = str(raw.image);
      if (has("originalPrice")) out.originalPrice = str(raw.originalPrice);
      if (has("price")) out.price = str(raw.price);
      if (has("blurb")) out.blurb = str(raw.blurb);
      if (has("specs")) out.specs = tags(raw.specs);
      if (has("badge")) out.badge = str(raw.badge);
      if (has("url")) out.url = str(raw.url);
      if (has("visible")) out.visible = bool(raw.visible);
      if (mode === "create") {
        out.id = slugId(str(raw.name), "prod");
        out.badge = out.badge ?? "";
        out.specs = out.specs ?? [];
        out.visible = has("visible") ? out.visible : true;
      }
      break;
    }
    case "youtube": {
      if (has("url")) {
        const url = str(raw.url);
        const vid = parseYoutubeId(url);
        if (mode === "create" && !vid)
          return { ok: false, error: "유효한 유튜브 URL이 아닙니다." };
        out.url = url;
        if (vid) {
          out.id = vid;
          out.thumbnail = `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
          if (!has("type")) out.type = guessYoutubeType(url);
        }
      }
      if (has("title")) out.title = str(raw.title);
      if (has("type")) out.type = str(raw.type) === "short" ? "short" : "video";
      if (has("category")) out.category = str(raw.category);
      if (has("badge")) out.badge = str(raw.badge);
      if (has("publishedAt")) out.publishedAt = str(raw.publishedAt);
      if (has("tags")) out.tags = tags(raw.tags);
      if (has("visible")) out.visible = bool(raw.visible);
      if (mode === "create") {
        out.tags = out.tags ?? [];
        out.badge = out.badge ?? "";
        out.category = out.category ?? "";
        out.visible = has("visible") ? out.visible : true;
      }
      break;
    }
    case "reels": {
      if (has("url")) {
        const url = str(raw.url);
        const code = parseInstagramCode(url);
        if (mode === "create" && !code)
          return { ok: false, error: "유효한 인스타그램 URL이 아닙니다." };
        out.url = url;
        if (code) out.id = code;
      }
      if (has("caption")) out.caption = str(raw.caption);
      if (has("image")) out.image = str(raw.image);
      if (has("type")) out.type = str(raw.type) === "image" ? "image" : "reel";
      if (has("tags")) out.tags = tags(raw.tags);
      if (has("featured")) out.featured = bool(raw.featured);
      if (has("pinned")) out.pinned = bool(raw.pinned);
      if (has("visible")) out.visible = bool(raw.visible);
      if (mode === "create") {
        out.type = out.type ?? "reel";
        out.tags = out.tags ?? [];
        out.postedAt = str(raw.postedAt) || "";
        out.visible = has("visible") ? out.visible : true;
      }
      break;
    }
    case "achievements": {
      if (has("date")) {
        out.date = str(raw.date);
        out.year = (str(raw.date).match(/^(\d{4})/) ?? [])[1] ?? str(raw.year);
      }
      if (has("title")) out.title = str(raw.title);
      if (has("category")) out.category = str(raw.category);
      if (has("partner")) out.partner = str(raw.partner);
      if (has("result")) out.result = str(raw.result);
      if (has("source")) out.source = str(raw.source);
      if (has("highlight")) out.highlight = bool(raw.highlight);
      if (has("visible")) out.visible = bool(raw.visible);
      if (mode === "create") {
        out.id = slugId(`${str(raw.date)}-${str(raw.title)}`, "rec");
        out.visible = has("visible") ? out.visible : true;
      }
      break;
    }
    case "banners": {
      if (has("title")) out.title = str(raw.title);
      if (has("category")) out.category = str(raw.category);
      if (has("description")) out.description = str(raw.description);
      if (has("image")) out.image = str(raw.image);
      if (has("theme")) {
        const t = str(raw.theme);
        out.theme = ["blue", "green", "white"].includes(t) ? t : "blue";
      }
      if (has("imagePosition")) {
        const p = str(raw.imagePosition);
        out.imagePosition = ["left", "center", "right"].includes(p) ? p : "right";
      }
      if (has("buttonLabel")) out.buttonLabel = str(raw.buttonLabel);
      if (has("href")) out.href = str(raw.href);
      if (has("startAt")) out.startAt = str(raw.startAt) || null;
      if (has("endAt")) out.endAt = str(raw.endAt) || null;
      if (has("visible")) out.visible = bool(raw.visible);
      if (mode === "create") {
        out.id = slugId(str(raw.title), "banner");
        out.theme = out.theme ?? "blue";
        out.imagePosition = out.imagePosition ?? "right";
        out.visible = has("visible") ? out.visible : true;
      }
      break;
    }
  }

  return { ok: true, value: out };
}
