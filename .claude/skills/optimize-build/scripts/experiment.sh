#!/usr/bin/env bash
# Run a single build performance experiment: benchmark 5 builds, record the
# result, and automatically revert if performance did not improve.
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
NUM_RUNS=5

# --- Benchmark ---

TIMES=()

echo "=== Starting benchmark ($NUM_RUNS runs) ==="

for i in $(seq 1 $NUM_RUNS); do
  echo "--- Run $i/$NUM_RUNS ---"
  pnpm cache:clear 2>/dev/null || true

  START=$(date +%s%N)
  pnpm build
  END=$(date +%s%N)

  ELAPSED=$(echo "scale=2; ($END - $START) / 1000000000" | bc)
  TIMES+=("$ELAPSED")

  echo "Run $i: ${ELAPSED}s"
done

AVG=$(echo "scale=2; (${TIMES[0]} + ${TIMES[1]} + ${TIMES[2]} + ${TIMES[3]} + ${TIMES[4]}) / 5" | bc)

echo ""
echo "=== Benchmark Results ==="
echo "Times: ${TIMES[*]}"
echo "Average: ${AVG}s"

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
   --arg ts "$TIMESTAMP" \
   '. + [{
     experiment: $num,
     commit: $commit,
     description: $desc,
     build_times: [$t1, $t2, $t3, $t4, $t5],
     average: $avg,
     timestamp: $ts,
     kept: true
   }]' "$JSON_FILE" > "${JSON_FILE}.tmp" && mv "${JSON_FILE}.tmp" "$JSON_FILE"

echo "Recorded experiment $EXPERIMENT_NUM: $DESC"

# --- Evaluate & possibly revert ---

# Baseline (experiment 0) is never reverted
if [ "$EXPERIMENT_NUM" -eq 0 ]; then
  echo "=== Baseline recorded: ${AVG}s ==="
  exit 0
fi

# Compare to the best average among previously kept experiments
BEST_AVG=$(jq '[.[] | select(.kept == true and .experiment < '"$EXPERIMENT_NUM"')] | min_by(.average) | .average' "$JSON_FILE")

IMPROVED=$(echo "$AVG < $BEST_AVG" | bc)

if [ "$IMPROVED" -eq 1 ]; then
  echo "=== IMPROVED: ${AVG}s vs previous best ${BEST_AVG}s ==="
else
  echo "=== NO IMPROVEMENT: ${AVG}s vs previous best ${BEST_AVG}s ==="
  echo "=== Reverting experiment (commit $(git rev-parse --short HEAD)) ==="

  git revert HEAD --no-edit
  jq '.[-1].kept = false' "$JSON_FILE" > "${JSON_FILE}.tmp" && mv "${JSON_FILE}.tmp" "$JSON_FILE"

  echo "=== Reverted. Ready for next experiment. ==="
fi
