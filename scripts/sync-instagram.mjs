#!/usr/bin/env node
// 인스타그램 공개 게시물의 썸네일(og:image)을 로컬에 내려받아 저장합니다.
//
// 실행: npm run sync:instagram            (전체)
//       npm run sync:instagram -- --featured  (대표 페이지 노출 6개만)
//
// 중요 원칙/한계:
// - 이것은 "런타임 스크래핑"이 아니라, 서버/CLI에서 가끔 돌리는 큐레이션 도우미입니다.
//   대상은 스토어 자기 계정(@yonex_dongtan)의 게시물입니다.
// - og:image 원본 URL은 서명·만료되므로 핫링크하지 않고 로컬로 저장합니다.
//   저장 위치: public/assets/instagram/{id}.jpg, content.json 의 image 필드에 경로 기록.
// - 인스타 마크업 변경/로그인 벽/레이트리밋으로 실패할 수 있습니다. 실패분은 건너뛰고
//   해당 카드는 그라디언트 폴백으로 표시됩니다(페이지는 깨지지 않음).
// - 장기적으로는 Meta Instagram Graph API 가 정식 경로입니다(.env.example 참고).

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT = join(ROOT, "data", "content.json");
const OUTDIR = join(ROOT, "public", "assets", "instagram");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

const log = (m) => console.log(`[sync-instagram] ${m}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchOgImage(shortcode) {
  const res = await fetch(`https://www.instagram.com/p/${shortcode}/`, {
    headers: { "user-agent": UA, "accept-language": "ko,en;q=0.8" },
  });
  if (!res.ok) throw new Error(`page HTTP ${res.status}`);
  const html = await res.text();
  const m = html.match(/property="og:image" content="([^"]+)"/);
  if (!m) throw new Error("og:image 없음 (로그인 벽 또는 마크업 변경)");
  return m[1].replace(/&amp;/g, "&");
}

async function download(url) {
  const res = await fetch(url.replace(/&amp;/g, "&"), {
    headers: { "user-agent": UA, referer: "https://www.instagram.com/" },
  });
  if (!res.ok) throw new Error(`img HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error(`이미지가 너무 작음(${buf.length}B) — 만료/무효 URL`);
  return buf;
}

async function main() {
  const content = JSON.parse(await readFile(CONTENT, "utf8"));
  await mkdir(OUTDIR, { recursive: true });

  const onlyFeatured = process.argv.includes("--featured");
  const items = (content.instagram || []).filter(
    (p) => !onlyFeatured || p.featured
  );
  log(`대상 ${items.length}개${onlyFeatured ? " (featured)" : ""}`);

  let ok = 0;
  let fail = 0;
  for (const item of items) {
    try {
      let buf;
      let source;
      // 1) 개발자도구에서 딴 커버 URL이 있으면 우선 사용(서명·만료라 즉시 다운로드).
      if (item.thumbnailSource) {
        try {
          buf = await download(item.thumbnailSource);
          source = "override";
        } catch (e) {
          log(`     override 실패(${e.message}) → og:image 폴백: ${item.id}`);
        }
      }
      // 2) 없거나 실패하면 게시물 og:image 로 폴백.
      if (!buf) {
        buf = await download(await fetchOgImage(item.id));
        source = "og:image";
      }
      await writeFile(join(OUTDIR, `${item.id}.jpg`), buf);
      item.image = `/assets/instagram/${item.id}.jpg`;
      ok++;
      log(`OK   [${source}] ${item.id}  ${(buf.length / 1024).toFixed(0)}KB  ${item.caption.slice(0, 22)}`);
    } catch (e) {
      fail++;
      log(`SKIP ${item.id}  (${e.message})`);
    }
    await sleep(900); // 레이트리밋 완화
  }

  content.meta = content.meta || {};
  content.meta.instagram = {
    lastFetchedAt: new Date().toISOString(),
    note: "og:image 로컬 캐시. 실패분은 그라디언트 카드로 폴백합니다.",
  };
  await writeFile(CONTENT, JSON.stringify(content, null, 2) + "\n", "utf8");
  log(`완료: 성공 ${ok}, 실패 ${fail}`);
}

main().catch((e) => {
  console.error("[sync-instagram] 실패:", e);
  process.exit(1);
});
