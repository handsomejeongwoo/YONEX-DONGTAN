#!/usr/bin/env node
// 개발자도구에서 긁어온 릴스 페이지 덤프(HTML DOM 또는 GraphQL JSON)에서
// (shortcode, 커버이미지 URL) 쌍을 추출해, content.json 의 인스타 항목과 매칭하고,
// 커버를 로컬(public/assets/instagram/{id}.jpg)로 즉시 다운로드합니다.
//
// 사용법:
//   node scripts/import-instagram-dump.mjs <덤프파일경로>
//   예) node scripts/import-instagram-dump.mjs ./reels-dump.txt
//
// 덤프 만드는 법(둘 중 아무거나):
//   (A) https://www.instagram.com/yonex_dongtan/reels/ 접속 → 개발자도구 Elements 에서
//       릴스 그리드 영역을 우클릭 → Copy → Copy outerHTML → 파일로 저장.
//   (B) Network 탭에서 릴스 목록이 담긴 GraphQL 응답을 Copy Response → 파일로 저장.
//
// 주의: cdninstagram URL은 서명·만료되므로 덤프를 저장한 직후 바로 실행하세요.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT = join(ROOT, "data", "content.json");
const OUTDIR = join(ROOT, "public", "assets", "instagram");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

const log = (m) => console.log(`[import-ig] ${m}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 덤프 텍스트에서 (shortcode, coverUrl) 쌍을 위치 기준으로 추출.
function extractPairs(text) {
  const codeRe = /(?:\/reel\/|\/p\/|"(?:code|shortcode)"\s*:\s*")([A-Za-z0-9_-]{5,})/g;
  const urlRe =
    /https:\/\/[a-z0-9.-]*(?:cdninstagram\.com|fbcdn\.net)\/[^\s"'\\<>()]+?\.(?:jpg|jpeg|webp)[^\s"'\\<>()]*/gi;

  const tokens = [];
  for (const m of text.matchAll(codeRe)) tokens.push({ pos: m.index, type: "code", val: m[1] });
  for (const m of text.matchAll(urlRe)) tokens.push({ pos: m.index, type: "url", val: m[0] });
  tokens.sort((a, b) => a.pos - b.pos);

  const pairs = new Map(); // shortcode -> 첫 커버 URL
  let cur = null;
  for (const t of tokens) {
    if (t.type === "code") cur = t.val;
    else if (t.type === "url" && cur && !pairs.has(cur)) {
      pairs.set(cur, t.val.replace(/&amp;/g, "&"));
    }
  }
  return pairs;
}

async function download(url) {
  const res = await fetch(url, {
    headers: { "user-agent": UA, referer: "https://www.instagram.com/" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error(`너무 작음(${buf.length}B) — 만료/무효`);
  return buf;
}

async function main() {
  const dumpPath = process.argv[2];
  if (!dumpPath) {
    console.error("사용법: node scripts/import-instagram-dump.mjs <덤프파일>");
    process.exit(1);
  }
  const text = await readFile(dumpPath, "utf8");
  const content = JSON.parse(await readFile(CONTENT, "utf8"));
  await mkdir(OUTDIR, { recursive: true });

  const knownIds = new Set((content.instagram || []).map((p) => p.id));
  const pairs = extractPairs(text);
  log(`덤프에서 ${pairs.size}개 (shortcode→커버) 쌍 추출.`);

  let ok = 0;
  let unmatched = 0;
  let fail = 0;
  const matchedUnknown = [];

  for (const [code, url] of pairs) {
    if (!knownIds.has(code)) {
      matchedUnknown.push(code);
      continue;
    }
    try {
      const buf = await download(url);
      await writeFile(join(OUTDIR, `${code}.jpg`), buf);
      const item = content.instagram.find((p) => p.id === code);
      item.image = `/assets/instagram/${code}.jpg`;
      item.thumbnailSource = url; // 출처 기록(다음 재수집 시 우선 시도)
      ok++;
      log(`OK   ${code}  ${(buf.length / 1024).toFixed(0)}KB`);
    } catch (e) {
      fail++;
      log(`FAIL ${code}  (${e.message})`);
    }
    await sleep(400);
  }

  unmatched = matchedUnknown.length;
  await writeFile(CONTENT, JSON.stringify(content, null, 2) + "\n", "utf8");

  log(`완료: 반영 ${ok}, 실패 ${fail}, content.json에 없는 shortcode ${unmatched}개`);
  if (unmatched) {
    log(`(content.json에 없는 항목: ${matchedUnknown.slice(0, 20).join(", ")}${unmatched > 20 ? " …" : ""})`);
    log(`→ 이 게시물들도 넣고 싶으면 data/content.json 의 instagram[] 에 항목을 추가하세요.`);
  }
}

main().catch((e) => {
  console.error("[import-ig] 실패:", e);
  process.exit(1);
});
