// 스마트스토어(Smart Store) 연동 추상화 경계.
//
// 이번 단계: data/content.json 의 shopPicks 수동 큐레이션 카드만 사용합니다.
// 네이버 스마트스토어 상품은 무단 크롤링하지 않습니다. 가격·재고·조회수 등
// 확인되지 않은 수치는 표기하지 않습니다.
//
// 향후: 공식 제휴/상품 API 자격 증명이 생기면 CommerceProvider 를 구현해
// getShopProvider() 가 그것을 반환하도록 확장합니다. 자격 증명은 환경변수로만
// 주입하고 코드에 하드코딩하지 않습니다. (.env.example 참고)

import { content } from "@/lib/content";
import type { ShopPick } from "@/lib/types";

export interface ShopProvider {
  readonly kind: "static" | "commerce-api";
  getPicks(): Promise<ShopPick[]>;
}

/** 현재 사용하는 정적 프로바이더: 노출 여부가 켜진 카드만 돌려줍니다. */
export const staticShopProvider: ShopProvider = {
  kind: "static",
  async getPicks() {
    return content.shopPicks.filter((p) => p.visible);
  },
};

/** 향후 공식 커머스 API 프로바이더(플레이스홀더). */
export const commerceShopProvider: ShopProvider = {
  kind: "commerce-api",
  async getPicks() {
    throw new Error(
      "commerceShopProvider: 아직 구현되지 않았습니다. 공식 상품 API 자격 증명 설정 후 구현하세요."
    );
  },
};

export function getShopProvider(): ShopProvider {
  const hasCommerceCreds =
    !!process.env.NAVER_COMMERCE_CLIENT_ID &&
    !!process.env.NAVER_COMMERCE_CLIENT_SECRET;
  if (hasCommerceCreds && process.env.SHOP_PROVIDER === "commerce-api") {
    return commerceShopProvider;
  }
  return staticShopProvider;
}
