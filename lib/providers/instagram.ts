// Instagram 연동 추상화 경계.
//
// 이번 단계: data/content.json 의 정적 링크 카드만 사용합니다.
// 공개 페이지 스크래핑은 로그인/정책/로딩 방식에 따라 깨지므로 하지 않습니다.
//
// 향후: Meta Instagram Graph API 를 붙이려면 아래 GraphInstagramProvider 를
// 구현하고 getInstagramProvider() 가 그것을 반환하도록 바꾸면 됩니다.
// 필요한 자격 증명(Business/Creator 계정, Facebook Page 연결, Access Token)은
// 절대 코드에 넣지 말고 환경변수로 주입합니다. (.env.example 참고)

import { content } from "@/lib/content";
import type { InstagramItem } from "@/lib/types";

export interface InstagramProvider {
  readonly kind: "static" | "graph";
  getPosts(): Promise<InstagramItem[]>;
}

/** 현재 사용하는 정적 프로바이더: content.json 의 데이터를 그대로 돌려줍니다. */
export const staticInstagramProvider: InstagramProvider = {
  kind: "static",
  async getPosts() {
    return content.instagram;
  },
};

/**
 * 향후 Meta Graph API 프로바이더(플레이스홀더).
 * INSTAGRAM_ACCESS_TOKEN / INSTAGRAM_BUSINESS_ACCOUNT_ID 가 있으면 여기서
 * https://graph.facebook.com/{ig-user-id}/media 를 호출하도록 구현합니다.
 */
export const graphInstagramProvider: InstagramProvider = {
  kind: "graph",
  async getPosts() {
    throw new Error(
      "graphInstagramProvider: 아직 구현되지 않았습니다. .env 에 Graph API 자격 증명을 설정한 뒤 구현하세요."
    );
  },
};

/** 환경변수에 따라 프로바이더를 선택합니다. 지금은 항상 정적. */
export function getInstagramProvider(): InstagramProvider {
  const hasGraphCreds =
    !!process.env.INSTAGRAM_ACCESS_TOKEN &&
    !!process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  // 자격 증명이 준비되고 graphInstagramProvider 를 구현하면 이 분기를 켭니다.
  if (hasGraphCreds && process.env.INSTAGRAM_PROVIDER === "graph") {
    return graphInstagramProvider;
  }
  return staticInstagramProvider;
}
