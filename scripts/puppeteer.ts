import { preview } from "astro";
import getSitemap from "../src/lib/test/getSitemap";
import url from "url";
import { compareUrls, createReport } from "pixelteer";

const port = 4321;
const base = `https://blog.beeminder.com`;
const compare = `http://localhost:${port}`;
const outPath = new URL("../shots/", import.meta.url);
const root = new URL("..", import.meta.url);

const server = await preview({
  root: url.fileURLToPath(root),
  server: {
    port,
  },
});

const urls = await getSitemap();
const paths = urls.map((url) => new URL(url).pathname + "?snap");

await compareUrls({
  baseUrl1: base,
  baseUrl2: compare,
  paths,
  outDir: url.fileURLToPath(outPath),
  force: process.argv.includes("--force"),
  onSuccess: (data) => {
    console.log(data);
  },
  onError: (error) => {
    console.error(error);
  },
});

createReport({
  baseUrl1: base,
  baseUrl2: compare,
  shotsDir: url.fileURLToPath(outPath),
  outDir: url.fileURLToPath(root),
});

await server.stop();
