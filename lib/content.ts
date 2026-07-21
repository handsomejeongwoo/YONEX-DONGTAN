// 콘텐츠 단일 소스 로더 + 페이지에서 쓰는 선택 헬퍼.
// data/content.json 만 수정하면 두 페이지에 모두 반영됩니다.

import raw from "@/data/content.json";
import type {
  Content,
  YoutubeItem,
  InstagramItem,
  ShopPick,
  RecordItem,
  FeaturedProduct,
} from "@/lib/types";

export const content = raw as Content;

export const store = content.store;
export const owner = content.owner;

/** 태그로 YouTube 영상을 고릅니다(발행일 내림차순). */
export function youtubeByTag(tag: string): YoutubeItem[] {
  return content.youtube
    .filter((v) => v.tags.includes(tag))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

/** 홈 상단 영상: `home-latest` 태그 우선, 없으면 최신 3개로 폴백. */
export function homeVideos(count = 3): YoutubeItem[] {
  const tagged = youtubeByTag("home-latest");
  if (tagged.length >= count) return tagged.slice(0, count);
  const rest = content.youtube
    .filter((v) => !tagged.includes(v))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return [...tagged, ...rest].slice(0, count);
}

/** 대표 페이지 경기·대회 영상(태그 없으면 최신 영상으로 폴백). */
export function ownerMatchVideos(count = 4): YoutubeItem[] {
  const tagged = youtubeByTag("owner-match");
  if (tagged.length >= count) return tagged.slice(0, count);
  const rest = content.youtube
    .filter((v) => v.type === "video" && !tagged.includes(v))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return [...tagged, ...rest].slice(0, count);
}

/** 대표 페이지 장비 리뷰 영상. */
export function ownerGearVideos(count = 2): YoutubeItem[] {
  const tagged = youtubeByTag("owner-gear");
  return tagged.slice(0, count);
}

/** 노출 대상 대회 기록(연·일자 내림차순). */
export function allRecords(): RecordItem[] {
  return [...content.records].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** 대표 카드용 하이라이트 우승 기록. */
export function highlightRecords(): RecordItem[] {
  return allRecords().filter((r) => r.highlight);
}

/** 노출 여부가 켜진 스마트스토어 추천 카드. */
export function visibleShopPicks(): ShopPick[] {
  return content.shopPicks.filter((p) => p.visible);
}

/** 홈 추천 상품(공개 + order 순). */
export function featuredProducts(): FeaturedProduct[] {
  return [...(content.products ?? [])]
    .filter((p) => p.visible !== false)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/** 대표 페이지 인스타그램 6칸(featured, order 순). */
export function featuredInstagram(count = 6): InstagramItem[] {
  return content.instagram
    .filter((p) => p.featured)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    .slice(0, count);
}
