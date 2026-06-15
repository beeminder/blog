import { describe, it, expect, afterEach, vi } from "vitest";
import { isPersistentCacheEnabled } from "./cachePolicy";

describe("isPersistentCacheEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is enabled when neither RENDER nor FILE_SYSTEM_CACHE is set", () => {
    vi.stubEnv("RENDER", "");
    vi.stubEnv("FILE_SYSTEM_CACHE", "");

    expect(isPersistentCacheEnabled()).toBe(true);
  });

  it("is disabled on Render", () => {
    vi.stubEnv("RENDER", "true");

    expect(isPersistentCacheEnabled()).toBe(false);
  });

  it("is disabled when FILE_SYSTEM_CACHE is false", () => {
    vi.stubEnv("FILE_SYSTEM_CACHE", "false");

    expect(isPersistentCacheEnabled()).toBe(false);
  });

  it("stays enabled for other FILE_SYSTEM_CACHE values", () => {
    vi.stubEnv("RENDER", "");
    vi.stubEnv("FILE_SYSTEM_CACHE", "true");

    expect(isPersistentCacheEnabled()).toBe(true);
  });
});
