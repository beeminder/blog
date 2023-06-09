import { beforeEach, vi } from "vitest";
import fetch from "node-fetch-cache";
import fetchPost from "./src/lib/fetchPost";
import getLegacyData from "./src/lib/getLegacyData";
import { __reset } from "./src/lib/memoize";

vi.mock("./src/lib/fetchPost");
vi.mock("./src/lib/getLegacyData");
vi.mock("node-fetch-cache");

vi.mock("fs", () => {
  const readFileSync = vi.fn(() => "");

  return {
    __esModule: true,
    readFileSync,
    default: {
      readFileSync,
    },
  };
});

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({ text: vi.fn(async () => "") } as any)
  );

  vi.mocked(fetch).mockReturnValue(
    Promise.resolve({ text: vi.fn(async () => "") } as any)
  );

  vi.mocked(fetchPost).mockResolvedValue("");
  vi.mocked(getLegacyData).mockResolvedValue({});

  global.console.time = vi.fn();
  global.console.timeEnd = vi.fn();

  __reset();
});
