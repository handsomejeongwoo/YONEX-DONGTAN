#!/usr/bin/env node
// data/content.json 을 D1 으로 시드한다.
//   npm run db:seed:local    (로컬 시뮬레이션 DB)
//   npm run db:seed:remote   (실제 Cloudflare D1)
//
// 기존 items/settings 를 지우고 content.json 기준으로 다시 채운다(멱등).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const DB_NAME = "yonex-dongtan-content";
const COLLECTIONS = ["records", "youtube", "instagram", "shopPicks", "products", "banners"];
const SETTINGS = ["meta", "store", "owner"];

const remote = process.argv.includes("--remote");
const root = process.cwd();
const content = JSON.parse(readFileSync(path.join(root, "data", "content.json"), "utf8"));

/** SQL 문자열 리터럴로 안전하게 감싼다. */
const q = (v) => `'${String(v).replace(/'/g, "''")}'`;

const lines = ["DELETE FROM items;", "DELETE FROM settings;"];

let total = 0;
for (const key of COLLECTIONS) {
  const arr = Array.isArray(content[key]) ? content[key] : [];
  arr.forEach((item, i) => {
    const id = item.id;
    if (!id) {
      console.warn(`  ! ${key}[${i}] id 없음 — 건너뜀`);
      return;
    }
    const order = Number.isFinite(item.order) ? item.order : i + 1;
    const visible = item.visible === false ? 0 : 1;
    lines.push(
      `INSERT INTO items (collection, id, sort_order, visible, data) VALUES (${q(key)}, ${q(id)}, ${order}, ${visible}, ${q(JSON.stringify(item))});`,
    );
    total++;
  });
}

for (const key of SETTINGS) {
  if (content[key] === undefined) continue;
  lines.push(
    `INSERT INTO settings (key, data) VALUES (${q(key)}, ${q(JSON.stringify(content[key]))});`,
  );
}

mkdirSync(path.join(root, ".tmp"), { recursive: true });
const sqlPath = path.join(root, ".tmp", "seed.sql");
writeFileSync(sqlPath, lines.join("\n") + "\n", "utf8");

console.log(`시드 대상: 항목 ${total}개 + 설정 ${SETTINGS.filter((k) => content[k] !== undefined).length}개`);
console.log(`대상 DB: ${remote ? "원격(Cloudflare)" : "로컬"}`);

execFileSync(
  "npx",
  ["wrangler", "d1", "execute", DB_NAME, remote ? "--remote" : "--local", `--file=${sqlPath}`, "-y"],
  { stdio: "inherit" },
);

console.log("시드 완료.");
