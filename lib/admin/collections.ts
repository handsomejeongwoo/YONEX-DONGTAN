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
  | "checkbox"
  /** 파일 업로드(R2) + 미리보기. 값은 /media/... 경로 또는 외부 URL. */
  | "image";

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
  /**
   * 체크박스를 tags 배열의 특정 태그와 연결한다.
   * 저장은 tags 로 하되 관리 화면에서는 체크박스로 보여주기 위한 것.
   */
  fromTag?: string;
}

/**
 * 영상이 노출될 자리와 각 자리의 최대 노출 개수.
 * 등록 화면에서는 체크박스로 고르고, 실제 저장은 tags 로 한다.
 */
export const VIDEO_PLACEMENTS = [
  { field: "inHome", tag: "home-latest", label: "홈 최신 영상", section: "VIDEOS", limit: 6 },
  { field: "inMatch", tag: "owner-match", label: "경기·대회 영상", section: "MATCH FILM", limit: 6 },
  { field: "inGear", tag: "owner-gear", label: "장비 리뷰", section: "GEAR TALK", limit: 2 },
] as const;

/** 추천 상품이 홈에 노출되는 최대 개수. */
export const PRODUCT_LIMIT = 6;

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

/** "289,000원" / "289000" → 289000. 파싱 불가 시 0. */
export function toWon(v: unknown): number {
  const n = Number(String(v ?? "").replace(/[^0-9]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** 할인율을 0~99 정수로 보정. */
export function toPercent(v: unknown): number {
  const n = Math.round(Number(String(v ?? "").replace(/[^0-9.]/g, "")));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(n, 99);
}

/** 정가 + 할인율 → 최종 판매가(원 단위 반올림). */
export function finalPrice(price: number, discountPercent: number): number {
  const p = toWon(price);
  const d = toPercent(discountPercent);
  if (!p) return 0;
  return d > 0 ? Math.round(p * (1 - d / 100)) : p;
}

/** 130500 → "130,500원" */
export function formatWon(n: number): string {
  return `${toWon(n).toLocaleString("ko-KR")}원`;
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
      { name: "image", label: "상품 이미지", type: "image" },
      { name: "price", label: "판매가 (원)", type: "number", placeholder: "289000", primary: true },
      { name: "discountPercent", label: "할인율 (%)", type: "number", placeholder: "22" },
      { name: "blurb", label: "설명", type: "textarea" },
      { name: "specs", label: "스펙 태그 (쉼표로 구분)", type: "tags", placeholder: "Head Light, 4U · 20–28 lbs" },
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
      { name: "url", label: "유튜브 URL", type: "url", required: true, primary: true, placeholder: "https://youtube.com/watch?v=… 또는 /shorts/…", help: "붙여넣으면 제목·썸네일·쇼츠 여부를 자동으로 채웁니다" },
      { name: "title", label: "제목", type: "text", required: true, primary: true },
      { name: "category", label: "카테고리", type: "text", placeholder: "장비 리뷰 / 경기 영상 / 일상 브이로그 …" },
      // 어느 섹션에 띄울지 — 저장은 tags 로 되지만 화면에서는 체크박스로 고른다.
      ...VIDEO_PLACEMENTS.map((p) => ({
        name: p.field,
        label: `${p.label} (${p.section})`,
        type: "checkbox" as const,
        fromTag: p.tag,
      })),
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
      // 릴스 썸네일은 sync 스크립트가 인스타에서 받아 저장한다(업로드 대상 아님).
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
      { name: "date", label: "일자", type: "text", required: true, placeholder: "2025-10-26" },
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
      // 문구·버튼이 들어간 완성 이미지를 올리는 방식이라 텍스트 필드를 두지 않는다.
      { name: "image", label: "배너 이미지", type: "image" },
      { name: "href", label: "클릭 시 이동할 주소", type: "url", placeholder: "https://… 또는 /owner", help: "비우면 클릭되지 않습니다" },
      { name: "title", label: "배너 이름", type: "text", required: true, primary: true, placeholder: "나노플레어 111 프로모션", help: "관리 목록 표시용 · 이미지가 안 보일 때 대체 텍스트로도 쓰입니다" },
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
      // 가격은 숫자만 저장한다("원"/쉼표는 렌더링 시 부착).
      if (has("price")) out.price = toWon(raw.price);
      if (has("discountPercent")) out.discountPercent = toPercent(raw.discountPercent);
      if (has("blurb")) out.blurb = str(raw.blurb);
      if (has("specs")) out.specs = tags(raw.specs);
      if (has("badge")) out.badge = str(raw.badge);
      if (has("url")) out.url = str(raw.url);
      if (has("visible")) out.visible = bool(raw.visible);
      if (mode === "create") {
        out.id = slugId(str(raw.name), "prod");
        out.badge = out.badge ?? "";
        out.specs = out.specs ?? [];
        out.price = out.price ?? 0;
        out.discountPercent = out.discountPercent ?? 0;
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
      if (has("visible")) out.visible = bool(raw.visible);

      // 노출 위치 체크박스 → tags. 체크박스가 하나라도 오면 통째로 다시 만든다
      // (공개 토글처럼 체크박스가 안 온 요청에서는 기존 tags 를 건드리지 않는다).
      if (VIDEO_PLACEMENTS.some((p) => has(p.field))) {
        out.tags = VIDEO_PLACEMENTS.filter((p) => bool(raw[p.field])).map((p) => p.tag);
      } else if (has("tags")) {
        out.tags = tags(raw.tags);
      }

      if (mode === "create") {
        out.tags = out.tags ?? [];
        out.category = out.category ?? "";
        out.visible = has("visible") ? out.visible : true;
        // 배지·게시일은 입력받지 않고 자동으로 채운다.
        out.badge = out.type === "short" ? "SHORTS" : str(raw.badge);
        out.publishedAt = str(raw.publishedAt) || new Date().toISOString().slice(0, 10);
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
      if (has("image")) out.image = str(raw.image);
      if (has("href")) out.href = str(raw.href);
      if (has("startAt")) out.startAt = str(raw.startAt) || null;
      if (has("endAt")) out.endAt = str(raw.endAt) || null;
      if (has("visible")) out.visible = bool(raw.visible);
      if (mode === "create") {
        out.id = slugId(str(raw.title), "banner");
        out.image = out.image ?? "";
        out.href = out.href ?? "";
        out.visible = has("visible") ? out.visible : true;
      }
      break;
    }
  }

  return { ok: true, value: out };
}
