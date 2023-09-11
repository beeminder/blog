import { beforeEach, vi } from "vitest";
import fetch from "node-fetch-cache";
import fetchPost from "./src/lib/fetchPost";
import { __reset } from "./src/lib/memoize";
import loadLegacyData from "./src/lib/test/loadLegacyData";
import padm from "./src/lib/test/padm";

vi.mock("./src/lib/fetchPost");
vi.mock("./src/lib/readLegacyData");
vi.mock("./src/lib/readSources");
vi.mock("node-fetch-cache");

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({ text: vi.fn(async () => "") } as any),
  );

  vi.mocked(fetch).mockReturnValue(
    Promise.resolve({ text: vi.fn(async () => "") } as any),
  );

  vi.mocked(fetchPost).mockResolvedValue(padm());
  loadLegacyData();

  vi.stubGlobal("console", {
    ...console,
    info: vi.fn(),
    time: vi.fn(),
    timeEnd: vi.fn(),
  });

  __reset();
});
