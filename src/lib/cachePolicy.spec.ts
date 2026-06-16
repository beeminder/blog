import { describe, it, expect, afterEach, vi } from "vitest";
import { isPersistentCacheEnabled } from "./cachePolicy";

describe("isPersistentCacheEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is enabled when RENDER and FILE_SYSTEM_CACHE are unset/empty", () => {
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

  it("disables on Render even when FILE_SYSTEM_CACHE is true", () => {
    vi.stubEnv("RENDER", "true");
    vi.stubEnv("FILE_SYSTEM_CACHE", "true");

    expect(isPersistentCacheEnabled()).toBe(false);
  });

  it("stays enabled when FILE_SYSTEM_CACHE is set to a non-false value", () => {
    vi.stubEnv("RENDER", "");
    vi.stubEnv("FILE_SYSTEM_CACHE", "true");

    expect(isPersistentCacheEnabled()).toBe(true);
  });
});
