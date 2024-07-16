import url from "url";
import { createReport } from "pixelteer";

const port = 4321;
const base = `https://blog.beeminder.com`;
const compare = `http://localhost:${port}`;
const outPath = new URL("../shots/", import.meta.url);
const root = new URL("..", import.meta.url);

createReport({
  baseUrl1: base,
  baseUrl2: compare,
  shotsDir: url.fileURLToPath(outPath),
  outDir: url.fileURLToPath(root),
});
