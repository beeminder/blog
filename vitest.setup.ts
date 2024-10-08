import { beforeEach, vi } from "vitest";
import fetch from "node-fetch-cache";
import fetchPost from "./src/lib/fetchPost";
import { __reset } from "./src/lib/memoize";
import ether from "./src/lib/test/ether";
import getSitemap from "./src/lib/test/getSitemap";

vi.mock("./src/lib/fetchPost");
vi.mock("./src/lib/readSources");
vi.mock("./src/lib/test/createReport");
vi.mock("./src/lib/test/saveScreenshot");
vi.mock("./src/lib/test/getSitemap");
vi.mock("./src/lib/test/readScreenshot");
vi.mock("./src/lib/test/resizeImage");
vi.mock("node-fetch-cache");
vi.mock("puppeteer", () => ({
  default: {
    launch: vi.fn(async () => ({
      newPage: vi.fn(async () => ({
        setViewport: vi.fn(),
        goto: vi.fn(),
        screenshot: vi.fn(),
        close: vi.fn(),
      })),
      close: vi.fn(),
    })),
  },
}));
vi.mock("fs");
vi.mock("astro", () => ({
  preview: vi.fn(async () => ({
    stop: vi.fn(),
  })),
}));
vi.mock("pixelmatch");
vi.mock("pngjs");
vi.mock("sharp");

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({ text: vi.fn(async () => "") } as any),
  );

  vi.mocked(fetch).mockReturnValue(
    Promise.resolve({ text: vi.fn(async () => "") } as any),
  );

  vi.mocked(fetchPost).mockResolvedValue(ether());
  vi.mocked(getSitemap).mockResolvedValue([]);

  vi.stubGlobal("console", {
    ...console,
    info: vi.fn(),
    time: vi.fn(),
    timeEnd: vi.fn(),
  });

  vi.stubGlobal("process", {
    ...process,
    env: { ...process.env, ETHERPAD_DOMAIN: "the_etherpad_domain" },
  });

  __reset();
});
