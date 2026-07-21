import type { Metadata } from "next";
import "./globals.css";
import { store } from "@/lib/content";
import ScrollTop from "@/components/ScrollTop";

// 공유 미리보기(OG)와 canonical 에 쓰는 사이트 주소.
// 커스텀 도메인을 붙이면 NEXT_PUBLIC_SITE_URL 만 바꾸고 다시 배포하면 된다.
// (빌드 시점에 값이 박히므로 배포 환경에도 같은 변수를 넣어야 한다)
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.yonex-dongtan.workers.dev";
const SITE_DESC = `${store.official} ${store.name}. 경기 경험으로 고르고 정확한 작업으로 완성합니다. 라켓·스트링·신발·대회 장비 상담.`;
const OG_IMAGE = "/assets/og-image.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: store.name,
    template: `%s · ${store.name}`,
  },
  description: SITE_DESC,
  keywords: [
    "요넥스 동탄점",
    "요넥스 동탄",
    "동탄 배드민턴",
    "배드민턴 라켓",
    "스트링 작업",
    "요넥스 공식 대리점",
    "YONEX",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: store.name,
    url: SITE_URL,
    title: store.name,
    description: SITE_DESC,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${store.name} ${store.official}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: store.name,
    description: SITE_DESC,
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>
        {children}
        <ScrollTop />
      </body>
    </html>
  );
}
