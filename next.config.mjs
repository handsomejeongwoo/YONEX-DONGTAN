import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 관리자(CMS) 로그인·세션·API 라우트가 필요하므로 서버 런타임으로 동작한다.
  // (정적 export 제거 — Cloudflare Workers/OpenNext 로 배포)
  images: { unoptimized: true },
  trailingSlash: true,
};

// `next dev` 에서도 Cloudflare 바인딩(D1 등)을 로컬 시뮬레이션으로 쓰기 위해 필요.
initOpenNextCloudflareForDev();

export default nextConfig;
