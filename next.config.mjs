/** @type {import('next').NextConfig} */
const nextConfig = {
  // 관리자(CMS) 로그인·세션·API 라우트가 필요하므로 서버 런타임으로 동작한다.
  // (정적 export 제거 — 이후 Cloudflare Workers/OpenNext 로 배포)
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
