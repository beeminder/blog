// usage:
// pnpm tsx ./scripts/puppeteer.ts
// pnpm puppeteer

import fs from "fs";
import { preview } from "astro";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import takeScreenshot from "../src/lib/test/saveScreenshot";
import getSitemap from "../src/lib/test/getSitemap";
import readScreenshot from "../src/lib/test/readScreenshot";
import resizeImage from "../src/lib/test/resizeImage";
import puppeteer, { Browser } from "puppeteer";
import createReport from "../src/lib/test/createReport";
import url from "url";

const port = 4321;
const base = `https://blog.beeminder.com`;
const compare = `http://localhost:${port}`;
const outPath = new URL("../shots/", import.meta.url);

function makeOutPath(url: string, suffix: string): URL {
  const p = new URL(url).pathname.replaceAll("/", "_");
  return new URL(`./${p}.${suffix}.png`, outPath);
}

async function snap(
  browser: Browser,
  url: string,
  suffix: string,
): Promise<URL> {
  const p = makeOutPath(url, suffix);

  await takeScreenshot({
    browser,
    url,
    path: p,
  });

  return p;
}

async function handleUrl(browser: Browser, url: string) {
  const pathname = new URL(url).pathname;
  console.time(pathname);

  const path1 = await snap(browser, url, "base");
  const path2 = await snap(browser, url.replace(base, compare), "compare");
  const img1 = readScreenshot(path1);
  const img2 = readScreenshot(path2);
  const meta1 = await img1.metadata();
  const meta2 = await img2.metadata();

  if (!meta1.width || !meta1.height || !meta2.width || !meta2.height) {
    throw new Error("Missing image size data");
  }

  const width = Math.max(meta1.width, meta2.width);
  const height = Math.max(meta1.height, meta2.height);
  const resized1 = await resizeImage({ image: img1, width, height });
  const resized2 = await resizeImage({ image: img2, width, height });
  const diff = new PNG({ width, height });

  const c = pixelmatch(resized1, resized2, diff.data, width, height, {
    threshold: 0.1,
  });

  fs.writeFileSync(makeOutPath(url, "diff"), PNG.sync.write(diff));

  console.timeEnd(pathname);
  console.log(c);
}

async function takeScreenshots() {
  const root = new URL("..", import.meta.url);
  const server = await preview({
    root: url.fileURLToPath(root),
    server: {
      port,
    },
  });
  const browser = await puppeteer.launch({
    headless: true,
  });
  const urls = await getSitemap();
  console.log(urls);

  console.time("Capturing screenshots");
  for (const url of urls) {
    await handleUrl(browser, url);
  }
  console.timeEnd("Capturing screenshots");

  await browser.close();
  await server.stop();
}

export async function run(argv: string[] = []) {
  if (!fs.existsSync(outPath)) {
    fs.mkdirSync(outPath);
  }

  const isEmpty = fs.readdirSync(outPath).length === 0;
  const isForced = argv.includes("--force");

  if (isEmpty || isForced) {
    await takeScreenshots();
  } else {
    console.log(
      "Skipping screenshots because shots is not empty. Use --force to override.",
    );
  }

  createReport();
}
const a = new URL(import.meta.url).pathname;
const b = new URL(`file://${process.argv[1]}`).pathname;
if (a === b) {
  console.log("Running puppeteer script");
  await run(process.argv);
}
