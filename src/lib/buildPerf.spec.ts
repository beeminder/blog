import { describe, it, expect, beforeEach, vi } from "vitest";
import { writeFileSync } from "fs";
import {
  recordFetchAttempt,
  recordCacheMiss,
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

  it("increments fetchCallCount on each recorded attempt", () => {
    recordFetchAttempt();
    recordFetchAttempt();
    recordFetchAttempt();

    expect(__getCountsForTests().fetchCallCount).toBe(3);
  });

  it("increments cacheMissCount only when recordCacheMiss is called", () => {
    recordFetchAttempt();
    recordFetchAttempt();
    recordCacheMiss();
    recordFetchAttempt();
    recordCacheMiss();

    expect(__getCountsForTests().cacheMissCount).toBe(2);
  });

  it("counts attempts that never report a miss as cache hits", () => {
    recordFetchAttempt();
    recordFetchAttempt();

    expect(__getCountsForTests().cacheMissCount).toBe(0);
  });

  it("writes counts to .build-perf-requests.txt on flush", () => {
    recordFetchAttempt();
    recordFetchAttempt();
    recordFetchAttempt();
    recordCacheMiss();
    recordCacheMiss();

    flush();

    expect(writeFileSync).toHaveBeenCalledWith(
      ".build-perf-requests.txt",
      "3\n2",
    );
  });

  it("formats output as fetchCallCount newline cacheMissCount", () => {
    recordFetchAttempt();
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
