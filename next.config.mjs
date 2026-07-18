/** @type {import('next').NextConfig} */
const nextConfig = {
  // 정적 HTML로 내보냅니다(어떤 정적 호스팅에도 배포 가능).
  output: "export",
  // 정적 export에서는 next/image 최적화를 쓸 수 없으므로 비활성화합니다.
  images: { unoptimized: true },
  // /owner 를 /owner/index.html 로 만들어 정적 서버에서 바로 열리게 합니다.
  trailingSlash: true,
};

export default nextConfig;
