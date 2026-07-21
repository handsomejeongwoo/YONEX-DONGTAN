// data/content.json 의 타입 정의 — 콘텐츠 단일 소스의 스키마입니다.

export interface StoreInfo {
  name: string;
  official: string;
  categories: string[];
  address: string;
  smartStoreUrl: string;
  instagramUrl: string;
  youtubeChannelUrl: string;
  naverMapUrl: string;
  naverMap: { lat: number; lng: number; zoom: number };
  /** 이하 관리자에서 편집(선택). */
  phone?: string;
  hours?: string;
  closedDay?: string;
  /** 홈 상단 공지(선택). */
  notice?: string;
  noticeStartAt?: string | null;
  noticeEndAt?: string | null;
}

export interface OwnerInfo {
  name: string;
  role: string;
  instagramName: string;
  tagline: string;
  summary: string;
  playstyle: string;
  playstyleSource: string;
  youtubeChannelUrl: string;
  instagramUrl: string;
}

export interface RecordItem {
  /** CRUD 식별자(관리자에서 부여). 예전 데이터엔 없을 수 있어 저장소에서 백필. */
  id?: string;
  date: string;
  year: string;
  title: string;
  category: string;
  partner: string;
  result: string;
  source: string;
  highlight?: boolean;
  /** 공개 여부(관리자 토글). 없으면 공개로 간주. */
  visible?: boolean;
  /** 정렬 순서(관리자). */
  order?: number;
}

export type YoutubeType = "video" | "short";

export interface YoutubeItem {
  id: string;
  title: string;
  publishedAt: string;
  type: YoutubeType;
  url: string;
  thumbnail: string;
  category: string;
  badge: string;
  tags: string[];
  /** 공개 여부(관리자 토글). 없으면 공개로 간주. */
  visible?: boolean;
  /** 정렬 순서(관리자). */
  order?: number;
}

export type InstagramType = "image" | "reel";

export interface InstagramItem {
  id: string;
  postedAt: string;
  type: InstagramType;
  caption: string;
  url: string;
  tags: string[];
  featured?: boolean;
  order?: number;
  pinned?: boolean;
  /** 공개 여부(관리자 토글). 없으면 공개로 간주. */
  visible?: boolean;
  /** 로컬 캐시된 썸네일 경로(scripts/sync-instagram.mjs 로 생성). 없으면 그라디언트 카드로 폴백. */
  image?: string;
  /**
   * (선택) 개발자도구에서 복사한 릴스 커버 URL. sync 시 이 URL을 우선 다운로드하고,
   * 만료/실패하면 자동으로 og:image 로 폴백합니다. cdninstagram URL은 서명·만료되므로
   * 붙여넣은 즉시 `npm run sync:instagram` 을 실행하세요.
   */
  thumbnailSource?: string;
}

export interface ShopPick {
  id: string;
  name: string;
  blurb: string;
  image: string;
  url: string;
  badge: string;
  category: string;
  visible: boolean;
}

export interface ContentMeta {
  updatedAt: string;
  youtube: {
    channelId: string;
    rssUrl: string;
    lastSyncedAt: string | null;
    note: string;
  };
}

// ===== 관리자(CMS) 콘텐츠 타입 =====

/**
 * 홈 자동 전환 배너.
 *
 * 문구·버튼이 이미 그려진 완성 이미지를 올리는 방식이라,
 * 웹에서 따로 텍스트를 얹지 않는다(이미지 + 링크가 전부).
 */
export interface Banner {
  id: string;
  image: string;
  /** 이미지를 못 볼 때의 대체 텍스트 겸 관리 목록 표시용 이름. */
  title: string;
  /** 클릭 시 이동할 주소. 비우면 클릭되지 않는다. */
  href: string;
  order: number;
  visible: boolean;
  /** 게시 기간(선택). null 이면 상시. */
  startAt?: string | null;
  endAt?: string | null;
}

export type ProductBadge = "" | "NEW" | "PICK" | "SALE";

/** 추천 상품(스마트스토어 링크 카드). */
export interface FeaturedProduct {
  id: string;
  name: string;
  image: string;
  /** 카드 좌상단 카테고리 라벨(예: "SPEED", "POWER"). */
  category: string;
  /**
   * 판매가(정가) — 숫자만 저장한다(예: 289000).
   * "원"과 천단위 쉼표는 화면에 그릴 때 붙인다.
   */
  price: number;
  /** 할인율(%). 0 이면 할인 표시 없음. 최종가 = price * (1 - discountPercent/100) */
  discountPercent: number;
  blurb: string;
  /** 스펙 태그(예: ["Head Light","4U · 20–28 lbs"]). */
  specs: string[];
  badge: ProductBadge;
  url: string;
  order: number;
  visible: boolean;
}

export interface Content {
  meta: ContentMeta;
  store: StoreInfo;
  owner: OwnerInfo;
  records: RecordItem[];
  youtube: YoutubeItem[];
  instagram: InstagramItem[];
  shopPicks: ShopPick[];
  /** 관리자에서 관리하는 추천 상품(없으면 빈 배열). */
  products: FeaturedProduct[];
  /** 관리자에서 관리하는 홈 배너(없으면 빈 배열). */
  banners: Banner[];
}
