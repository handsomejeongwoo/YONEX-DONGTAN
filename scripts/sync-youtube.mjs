#!/usr/bin/env node
// YouTube 공식 RSS를 읽어 data/content.json 의 youtube 배열을 갱신합니다.
//
// 실행: npm run sync:youtube   (Node 18+ 필요, 서버/빌드 단계에서 실행)
//
// 원칙:
// - 브라우저에서 fetch 하지 않습니다(CORS). 이 스크립트는 서버/CLI에서만 돕니다.
// - RSS는 최신 15개만 제공합니다. 그 15개를 최신 목록으로 반영합니다.
// - 기존 항목의 수동 큐레이션 값(type / tags / category / badge)은 id로 매칭해
//   최대한 보존합니다. RSS는 쇼츠/일반을 구분하지 못하므로 type은 기존값 우선.
// - 네트워크 실패 시 content.json 을 건드리지 않고 경고만 출력합니다(빌드 유지).

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { XMLParser } from "fast-xml-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_PATH = join(__dirname, "..", "data", "content.json");

function log(msg) {
  console.log(`[sync-youtube] ${msg}`);
}

async function main() {
  const rawText = await readFile(CONTENT_PATH, "utf8");
  const content = JSON.parse(rawText);

  const rssUrl =
    content?.meta?.youtube?.rssUrl ||
    (content?.meta?.youtube?.channelId
      ? `https://www.youtube.com/feeds/videos.xml?channel_id=${content.meta.youtube.channelId}`
      : null);

  if (!rssUrl) {
    log("meta.youtube.rssUrl / channelId 가 없어 중단합니다.");
    process.exit(1);
  }

  log(`RSS fetch: ${rssUrl}`);
  let xml;
  try {
    const res = await fetch(rssUrl, {
      headers: { "user-agent": "yonex-dongtan-sync/1.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    xml = await res.text();
  } catch (err) {
    log(`RSS를 가져오지 못했습니다: ${err.message}`);
    log("content.json 은 변경하지 않았습니다. 기존 데이터로 계속 진행하세요.");
    process.exit(0);
  }

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const parsed = parser.parse(xml);
  const entriesRaw = parsed?.feed?.entry;
  const entries = Array.isArray(entriesRaw) ? entriesRaw : entriesRaw ? [entriesRaw] : [];

  if (entries.length === 0) {
    log("RSS에 항목이 없습니다. 중단합니다.");
    process.exit(0);
  }

  // 기존 항목을 id로 색인(수동 큐레이션 값 보존용).
  const prevById = new Map((content.youtube || []).map((v) => [v.id, v]));

  const badgeFor = (type) => (type === "short" ? "SHORTS" : "VIDEO");

  const nextItems = entries.map((e) => {
    const id = e["yt:videoId"];
    const prev = prevById.get(id) || {};
    const link = Array.isArray(e.link) ? e.link[0] : e.link;
    const url = prev.url || link?.["@_href"] || `https://www.youtube.com/watch?v=${id}`;
    const type = prev.type || "video"; // RSS는 쇼츠 구분 불가 → 기존값 우선, 신규는 video
    const publishedAt = (e.published || "").slice(0, 10) || prev.publishedAt || "";
    return {
      id,
      title: e.title ?? prev.title ?? "",
      publishedAt,
      type,
      url,
      thumbnail:
        prev.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      category: prev.category || (type === "short" ? "쇼츠" : "영상"),
      badge: prev.badge || badgeFor(type),
      tags: prev.tags || [],
    };
  });

  content.youtube = nextItems;
  content.meta = content.meta || {};
  content.meta.youtube = content.meta.youtube || {};
  content.meta.youtube.rssUrl = rssUrl;
  content.meta.youtube.lastSyncedAt = new Date().toISOString();

  const newIds = nextItems.filter((v) => !prevById.has(v.id)).map((v) => v.id);
  await writeFile(CONTENT_PATH, JSON.stringify(content, null, 2) + "\n", "utf8");

  log(`완료: ${nextItems.length}개 반영, 신규 ${newIds.length}개.`);
  if (newIds.length) {
    log(`신규 항목은 type/tags/category 를 손으로 확인하세요: ${newIds.join(", ")}`);
  }
}

main().catch((err) => {
  console.error("[sync-youtube] 실패:", err);
  process.exit(1);
});
