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
  date: string;
  year: string;
  title: string;
  category: string;
  partner: string;
  result: string;
  source: string;
  highlight?: boolean;
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

export interface Content {
  meta: ContentMeta;
  store: StoreInfo;
  owner: OwnerInfo;
  records: RecordItem[];
  youtube: YoutubeItem[];
  instagram: InstagramItem[];
  shopPicks: ShopPick[];
}
