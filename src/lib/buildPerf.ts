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
 * Record that a fetch is being attempted. Always called before the
 * request starts so failed/rejected fetches are counted too.
 */
export function recordFetchAttempt() {
  fetchCallCount++;
}

/**
 * Record that a fetch attempt missed the cache. Called once the
 * response is in hand and known not to have come from cache.
 */
export function recordCacheMiss() {
  cacheMissCount++;
}

export function __resetForTests() {
  fetchCallCount = 0;
  cacheMissCount = 0;
}

export function __getCountsForTests() {
  return { fetchCallCount, cacheMissCount };
}
