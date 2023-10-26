import { Browser } from "puppeteer";
import _url from "url";
import _path from "path";

type Options = {
  url: string;
  path: string;
  browser: Browser;
};

export default async function takeScreenshot({
  browser,
  url,
  path,
}: Options): Promise<void> {
  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(url, { waitUntil: "networkidle0" });

  await page.screenshot({
    path: _path.resolve(path),
    fullPage: true,
  });

  await page.close();
}
