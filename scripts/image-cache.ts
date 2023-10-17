// usage:
// pnpm dlx tsx ./scripts/image-cache.ts

import { readFileSync, readdirSync, writeFileSync } from "fs";

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

const folderPath = new URL("../node_modules/.astro/assets", import.meta.url)
  .pathname;
const files = readdirSync(folderPath, "utf8");

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
