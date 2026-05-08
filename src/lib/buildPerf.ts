import { writeFileSync } from "fs";
import env from "./env";

const IS_BUILD_PERF = !!env("BUILD_PERF");
const OUTPUT_PATH = ".build-perf-requests.txt";

let fetchCallCount = 0;
let cacheMissCount = 0;

export function flush() {
  try {
    writeFileSync(OUTPUT_PATH, `${fetchCallCount}\n${cacheMissCount}`);
  } catch {
    // Only used during benchmarking; ignore errors
  }
}

if (IS_BUILD_PERF) {
  process.on("exit", flush);
}

/**
 * Record a fetch attempt. Increments the total call count and, when the
 * response was not served from cache, the cache-miss count.
 */
export function recordFetch(fromCache: boolean) {
  fetchCallCount++;
  if (!fromCache) cacheMissCount++;
}

export function __resetForTests() {
  fetchCallCount = 0;
  cacheMissCount = 0;
}

export function __getCountsForTests() {
  return { fetchCallCount, cacheMissCount };
}
