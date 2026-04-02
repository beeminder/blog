#!/usr/bin/env bash
# Run a single build performance experiment: benchmark 5 builds and record
# both build time and HTTP request metrics.
#
# Usage:
#   bash experiment.sh <description>
#
# The commit at HEAD is used as the experiment commit. For the baseline run,
# pass any description (e.g. "Baseline - no changes").

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [ $# -lt 1 ]; then
  echo "Usage: $0 <description>"
  exit 1
fi

DESC="$1"
JSON_FILE=".build-perf.json"
REQUESTS_FILE=".build-perf-requests.txt"
NUM_RUNS=5

# --- Preflight checks ---

for cmd in jq bc; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: required command '$cmd' not found. Please install it and re-run $0." >&2
    exit 1
  fi
done

if [ ! -f "$JSON_FILE" ]; then
  echo "Error: '$JSON_FILE' not found. Run setup.sh first." >&2
  exit 1
fi

# --- Benchmark ---

TIMES=()
FETCH_COUNTS=()
CACHE_MISS_COUNTS=()

echo "=== Starting benchmark ($NUM_RUNS runs) ==="

for i in $(seq 1 $NUM_RUNS); do
  echo "--- Run $i/$NUM_RUNS ---"

  START=$(date +%s%N)
  BUILD_PERF=1 pnpm build
  END=$(date +%s%N)

  ELAPSED=$(echo "scale=2; ($END - $START) / 1000000000" | bc)
  TIMES+=("$ELAPSED")

  # Read fetch metrics written by fetchPost.ts
  if [ -f "$REQUESTS_FILE" ]; then
    FETCH_COUNT=$(sed -n '1p' "$REQUESTS_FILE")
    CACHE_MISSES=$(sed -n '2p' "$REQUESTS_FILE")
  else
    FETCH_COUNT=0
    CACHE_MISSES=0
  fi
  FETCH_COUNTS+=("${FETCH_COUNT:-0}")
  CACHE_MISS_COUNTS+=("${CACHE_MISSES:-0}")

  echo "Run $i: ${ELAPSED}s | fetches: ${FETCH_COUNT:-0} | cache misses: ${CACHE_MISSES:-0}"
done

AVG=$(echo "scale=2; (${TIMES[0]} + ${TIMES[1]} + ${TIMES[2]} + ${TIMES[3]} + ${TIMES[4]}) / 5" | bc)
AVG_FETCHES=$(echo "scale=0; (${FETCH_COUNTS[0]} + ${FETCH_COUNTS[1]} + ${FETCH_COUNTS[2]} + ${FETCH_COUNTS[3]} + ${FETCH_COUNTS[4]}) / 5" | bc)
AVG_MISSES=$(echo "scale=0; (${CACHE_MISS_COUNTS[0]} + ${CACHE_MISS_COUNTS[1]} + ${CACHE_MISS_COUNTS[2]} + ${CACHE_MISS_COUNTS[3]} + ${CACHE_MISS_COUNTS[4]}) / 5" | bc)

echo ""
echo "=== Benchmark Results ==="
echo "Times: ${TIMES[*]}"
echo "Average build time: ${AVG}s"
echo "Average fetch calls: ${AVG_FETCHES}"
echo "Average cache misses: ${AVG_MISSES}"

# --- Record ---

COMMIT=$(git rev-parse HEAD)
TIMESTAMP=$(date -Iseconds)
EXPERIMENT_NUM=$(jq 'length' "$JSON_FILE")

jq --argjson num "$EXPERIMENT_NUM" \
   --arg commit "$COMMIT" \
   --arg desc "$DESC" \
   --argjson t1 "${TIMES[0]}" \
   --argjson t2 "${TIMES[1]}" \
   --argjson t3 "${TIMES[2]}" \
   --argjson t4 "${TIMES[3]}" \
   --argjson t5 "${TIMES[4]}" \
   --argjson avg "$AVG" \
   --argjson avg_fetches "$AVG_FETCHES" \
   --argjson avg_misses "$AVG_MISSES" \
   --arg ts "$TIMESTAMP" \
   '. + [{
     experiment: $num,
     commit: $commit,
     description: $desc,
     build_times: [$t1, $t2, $t3, $t4, $t5],
     average: $avg,
     avg_fetch_calls: $avg_fetches,
     avg_cache_misses: $avg_misses,
     timestamp: $ts,
     kept: true
   }]' "$JSON_FILE" > "${JSON_FILE}.tmp" && mv "${JSON_FILE}.tmp" "$JSON_FILE"

echo ""
echo "=== Recorded experiment $EXPERIMENT_NUM: $DESC ==="
echo "  Build time: ${AVG}s | Fetch calls: ${AVG_FETCHES} | Cache misses: ${AVG_MISSES}"

# --- Show comparison to previous best ---

if [ "$EXPERIMENT_NUM" -gt 0 ]; then
  BEST_TIME=$(jq '[.[] | select(.kept == true and .experiment < '"$EXPERIMENT_NUM"')] | min_by(.average) | .average' "$JSON_FILE")
  BEST_FETCHES=$(jq '[.[] | select(.kept == true and .experiment < '"$EXPERIMENT_NUM"')] | min_by(.avg_fetch_calls) | .avg_fetch_calls' "$JSON_FILE")

  echo ""
  echo "=== Comparison ==="
  echo "  Build time:  ${AVG}s  (best kept: ${BEST_TIME}s)"
  echo "  Fetch calls: ${AVG_FETCHES}  (best kept: ${BEST_FETCHES})"
fi
