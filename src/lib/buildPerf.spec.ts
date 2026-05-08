import { describe, it, expect, beforeEach, vi } from "vitest";
import { writeFileSync } from "fs";
import {
  recordFetch,
  flush,
  __resetForTests,
  __getCountsForTests,
} from "./buildPerf";

describe("buildPerf", () => {
  beforeEach(() => {
    __resetForTests();
  });

  it("starts with zero counts", () => {
    expect(__getCountsForTests()).toEqual({
      fetchCallCount: 0,
      cacheMissCount: 0,
    });
  });

  it("increments fetchCallCount on each recorded fetch", () => {
    recordFetch(true);
    recordFetch(true);
    recordFetch(false);

    expect(__getCountsForTests().fetchCallCount).toBe(3);
  });

  it("increments cacheMissCount only on cache misses", () => {
    recordFetch(true);
    recordFetch(false);
    recordFetch(false);

    expect(__getCountsForTests().cacheMissCount).toBe(2);
  });

  it("does not increment cacheMissCount on cache hits", () => {
    recordFetch(true);
    recordFetch(true);

    expect(__getCountsForTests().cacheMissCount).toBe(0);
  });

  it("writes counts to .build-perf-requests.txt on flush", () => {
    recordFetch(true);
    recordFetch(false);
    recordFetch(false);

    flush();

    expect(writeFileSync).toHaveBeenCalledWith(
      ".build-perf-requests.txt",
      "3\n2",
    );
  });

  it("formats output as fetchCallCount newline cacheMissCount", () => {
    recordFetch(true);
    flush();

    expect(writeFileSync).toHaveBeenCalledWith(
      ".build-perf-requests.txt",
      "1\n0",
    );
  });

  it("swallows errors when flush write fails", () => {
    vi.mocked(writeFileSync).mockImplementationOnce(() => {
      throw new Error("disk full");
    });

    expect(() => flush()).not.toThrow();
  });
});
