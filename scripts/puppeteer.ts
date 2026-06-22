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

// Optional flags for targeted runs (default behaviour: compare every sitemap URL):
//   --detail      restrict to blog post detail pages (single-segment slugs)
//   --limit=N     cap the number of paths compared
const detailOnly = process.argv.includes("--detail");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
let limit = Infinity;
if (limitArg) {
  const parsed = Number(limitArg.slice("--limit=".length));
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(
      `Invalid --limit value: "${limitArg.split("=")[1]}". Use a positive integer.`,
    );
  }
  limit = parsed;
}

const SECTION_ROOTS = new Set(["tags", "authors", "page"]);
const isDetailPage = (pathname: string): boolean => {
  const [segment, ...rest] = pathname.split("/").filter(Boolean);
  if (!segment || rest.length > 0) return false; // home, archives, /tags/x, etc.
  if (SECTION_ROOTS.has(segment)) return false; // /tags, /authors, /page
  if (/^\d{4}$/.test(segment)) return false; // /YYYY year archive
  return true;
};

const pathnames = urls.map((url) => new URL(url).pathname);
const selected = (
  detailOnly ? pathnames.filter(isDetailPage) : pathnames
).slice(0, limit);
const paths = selected.map((pathname) => pathname + "?snap");

console.log(
  `Comparing ${paths.length} path(s)${detailOnly ? " (detail pages only)" : ""}.`,
);

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
