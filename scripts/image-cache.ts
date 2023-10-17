// usage:
// pnpm dlx tsx ./scripts/image-cache.ts

import { readFileSync, readdirSync, writeFileSync } from "fs";
import findup from "findup-sync";

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

const nodeModules = findup("node_modules");

if (!nodeModules) {
  throw new Error("Could not find node_modules folder");
}

const folderPath = new URL(`${nodeModules}/.astro/assets`, import.meta.url)
  .pathname;

let files: string[] = [];

try {
  files = readdirSync(folderPath, "utf8");
} catch (e) {
  console.warn(e);
}

files.forEach((file) => {
  const path = new URL(
    `../node_modules/.astro/assets/${file}`,
    import.meta.url,
  );
  const content = readFileSync(path, "utf8");
  const json = JSON.parse(content);

  json.expires += ONE_WEEK;

  const newContent = JSON.stringify(json, null, 2);

  writeFileSync(path, newContent);
});
