import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

const __dirname = dirname(fileURLToPath(import.meta.url));
const folderPath = join(__dirname, "..", "node_modules", ".astro", "assets");

let files = [];

try {
  files = readdirSync(folderPath, "utf8");
} catch (e) {
  console.warn(e);
}

for (const file of files.filter((f) => f.endsWith(".json"))) {
  const path = join(folderPath, file);
  const content = readFileSync(path, "utf8");
  const json = JSON.parse(content);
  json.expires += ONE_WEEK;
  writeFileSync(path, JSON.stringify(json, null, 2));
}
