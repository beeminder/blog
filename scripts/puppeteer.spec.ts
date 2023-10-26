import pixelmatch from "pixelmatch";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { run } from "./puppeteer.js";
import getSitemap from "../src/lib/test/getSitemap.js";
import readScreenshot from "../src/lib/test/readScreenshot.js";
import resizeImage from "../src/lib/test/resizeImage.js";
import fs from "fs";
import createReport from "../src/lib/test/createReport.js";

describe("puppeteer", () => {
  beforeEach(() => {
    vi.mocked(getSitemap).mockResolvedValue(["https://blog.beeminder.com"]);

    vi.mocked(readScreenshot)
      .mockReturnValueOnce({
        metadata: () => ({
          width: 1,
          height: 1,
        }),
        toBuffer: () => Buffer.from(""),
      } as any)
      .mockReturnValueOnce({
        metadata: () => ({
          width: 100,
          height: 100,
        }),
        toBuffer: () => Buffer.from(""),
      } as any);

    vi.mocked(fs.readdirSync).mockReturnValue([]);
  });

  it("uses max width and max height", async () => {
    await run();

    expect(pixelmatch).toBeCalledWith(
      undefined,
      undefined,
      undefined,
      100,
      100,
      expect.anything(),
    );
  });

  it("resizes images", async () => {
    await run();

    expect(resizeImage).toBeCalledTimes(2);
  });

  it("does not run if shots is not empty", async () => {
    vi.mocked(fs.readdirSync).mockReturnValue(["foo" as any]);

    await run();

    expect(resizeImage).toBeCalledTimes(0);
  });

  it("runs if shots is not empty and force arg provided", async () => {
    vi.mocked(fs.readdirSync).mockReturnValue(["foo" as any]);

    await run(["--force"]);

    expect(resizeImage).toBeCalledTimes(2);
  });

  it("creates report", async () => {
    await run();

    expect(createReport).toBeCalled();
  });
});
