import type { Metadata } from "next";
import "./globals.css";
import { store } from "@/lib/content";
import ScrollTop from "@/components/ScrollTop";

export const metadata: Metadata = {
  title: "요넥스 동탄점 · 실전에서 검증한 선택",
  description: `${store.official}, ${store.name}. 전국 대회 다수 입상의 사장님이 내 플레이에 맞는 요넥스 장비를 함께 찾습니다.`,
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
