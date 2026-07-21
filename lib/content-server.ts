import "server-only";
import { cache } from "react";
import { readContent } from "@/lib/repository/content-repository";
import type {
  Content,
  YoutubeItem,
  InstagramItem,
  RecordItem,
  FeaturedProduct,
  Banner,
  StoreInfo,
  OwnerInfo,
} from "@/lib/types";

// 요청 시점에 콘텐츠를 읽는 로더.
// lib/content.ts 는 빌드 시점 정적 import 라 관리자 수정이 재빌드 전까지 반영되지 않는다.
// 페이지는 이 모듈을 쓰고 `export const dynamic = "force-dynamic"` 을 함께 선언한다.

/**
 * 한 요청 안에서 저장소를 한 번만 읽도록 묶는다.
 * 아래 헬퍼들이 각자 전체 콘텐츠를 필요로 하는데, 캐시가 없으면 페이지 1회
 * 렌더에 D1 조회가 6번 나가 읽기 행 수가 그만큼 배로 늘어난다.
 */
const loadContent = cache(async (): Promise<Content> => readContent());

/** 공개 여부: visible 이 명시적으로 false 인 것만 숨긴다(예전 데이터 호환). */
function isVisible(item: { visible?: boolean }): boolean {
  return item.visible !== false;
}

/** order 오름차순(없으면 뒤로). */
function byOrder(a: { order?: number }, b: { order?: number }): number {
  return (a.order ?? 9999) - (b.order ?? 9999);
}

/** "YYYY-MM-DD" 게시 기간 안에 있는지. 값이 없으면 상시 노출. */
function inWindow(startAt?: string | null, endAt?: string | null): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (startAt && today < startAt) return false;
  if (endAt && today > endAt) return false;
  return true;
}

export async function getContent(): Promise<Content> {
  return loadContent();
}

export async function getStore(): Promise<StoreInfo> {
  return (await loadContent()).store;
}

export async function getOwner(): Promise<OwnerInfo> {
  return (await loadContent()).owner;
}

/** 현재 노출할 홈 상단 공지(없으면 null). */
export async function getActiveNotice(): Promise<string | null> {
  const { store } = await loadContent();
  const text = (store.notice ?? "").trim();
  if (!text) return null;
  return inWindow(store.noticeStartAt, store.noticeEndAt) ? text : null;
}

/** 공개 + 게시기간 내 배너(order 순). */
export async function getActiveBanners(): Promise<Banner[]> {
  const { banners } = await loadContent();
  return [...(banners ?? [])]
    .filter((b) => isVisible(b) && inWindow(b.startAt, b.endAt))
    .sort(byOrder);
}

/** 공개 추천 상품(order 순). */
export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  const { products } = await loadContent();
  return [...(products ?? [])].filter(isVisible).sort(byOrder);
}

/** 공개 유튜브 영상 전체(관리 순서 우선, 없으면 최신순). */
async function visibleYoutube(): Promise<YoutubeItem[]> {
  const { youtube } = await loadContent();
  return youtube
    .filter(isVisible)
    .sort((a, b) => {
      const o = byOrder(a, b);
      if (o !== 0) return o;
      return a.publishedAt < b.publishedAt ? 1 : -1;
    });
}

export async function getYoutubeByTag(tag: string): Promise<YoutubeItem[]> {
  return (await visibleYoutube()).filter((v) => v.tags.includes(tag));
}

/** 홈 상단 영상: `home-latest` 우선, 모자라면 나머지로 채움. */
export async function getHomeVideos(count = 3): Promise<YoutubeItem[]> {
  const all = await visibleYoutube();
  const tagged = all.filter((v) => v.tags.includes("home-latest"));
  if (tagged.length >= count) return tagged.slice(0, count);
  const rest = all.filter((v) => !tagged.includes(v));
  return [...tagged, ...rest].slice(0, count);
}

/** 사장님 페이지 경기·대회 영상. */
export async function getOwnerMatchVideos(count = 4): Promise<YoutubeItem[]> {
  const all = await visibleYoutube();
  const tagged = all.filter((v) => v.tags.includes("owner-match"));
  if (tagged.length >= count) return tagged.slice(0, count);
  const rest = all.filter((v) => v.type === "video" && !tagged.includes(v));
  return [...tagged, ...rest].slice(0, count);
}

/** 사장님 페이지 장비 리뷰 영상. */
export async function getOwnerGearVideos(count = 2): Promise<YoutubeItem[]> {
  return (await getYoutubeByTag("owner-gear")).slice(0, count);
}

/** 공개 대회 기록(일자 내림차순). */
export async function getAllRecords(): Promise<RecordItem[]> {
  const { records } = await loadContent();
  return records.filter(isVisible).sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** 하이라이트 우승 기록. */
export async function getHighlightRecords(): Promise<RecordItem[]> {
  return (await getAllRecords()).filter((r) => r.highlight);
}

/** 사장님 페이지 인스타 그리드(공개 + featured, order 순). */
export async function getFeaturedInstagram(count = 6): Promise<InstagramItem[]> {
  const { instagram } = await loadContent();
  return instagram
    .filter((p) => isVisible(p) && p.featured)
    .sort(byOrder)
    .slice(0, count);
}
