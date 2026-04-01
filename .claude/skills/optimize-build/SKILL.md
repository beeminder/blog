# Optimize Build Performance

Run a series of experiments to optimize the project's build performance, recording results to a git-ignored JSON file.

## Arguments

- `$1` (optional): Number of experiments to run. Defaults to 10.

## Prerequisites

Shell scripts in `$SKILL_DIR/scripts/` handle repeatable operations. Always use these scripts rather than running commands manually.

- `$SKILL_DIR` refers to `.claude/skills/optimize-build/`

## Procedure

### 1. Setup

Run the setup script:

```bash
bash .claude/skills/optimize-build/scripts/setup.sh
```

This will:
- Create and checkout a new branch `build-perf-optimize-YYYYMMDD-HHMMSS`
- Run `pnpm install`
- Initialize `.build-perf.json` if it doesn't exist
- Warm the cache with an initial build

### 2. Baseline Experiment (Experiment 0)

Run the experiment script with no code changes:

```bash
bash .claude/skills/optimize-build/scripts/experiment.sh "Baseline - no changes"
```

This benchmarks 5 builds and records the baseline to `.build-perf.json`.

### 3. Experiments 1-N

Run up to N experiments, where N is the number passed as the skill argument (default 10).

For each experiment:

1. **Make ONE code change** that you predict will improve build performance. Use your knowledge of Astro, Vite, and general build optimization techniques. Consider:
   - Reducing the number of files processed
   - Optimizing image handling
   - Adjusting Vite/Rollup configuration
   - Reducing plugin overhead
   - Lazy loading or deferring expensive operations
   - Caching strategies
   - Reducing template complexity
   - Parallelization opportunities
   - Reducing the number of external fetch calls

2. **Commit the change:**
   ```bash
   git add -A && git commit -m "perf: <short description of the change>"
   ```

3. **Run the experiment:**
   ```bash
   bash .claude/skills/optimize-build/scripts/experiment.sh "<short description>"
   ```

   The script will:
   - Run 5 timed builds (cache is preserved between runs)
   - Record build time, fetch call count, and cache miss count to `.build-perf.json`
   - Show comparison to the best previous kept experiment

4. **Evaluate and decide:** The script does NOT auto-revert. You must evaluate the results and decide whether to keep or revert each experiment. Consider both metrics:
   - **Build time** — lower is better
   - **Fetch call count** — lower is better (fewer external service requests)

   There may be trade-offs between these metrics. Use your judgment:
   - If both metrics improve: **keep**
   - If both metrics regress: **revert**
   - If one improves and the other regresses: consider the magnitude of each change and make a judgment call

   To revert:
   ```bash
   git revert HEAD --no-edit
   ```
   Then update `.build-perf.json` to mark the experiment as not kept:
   ```bash
   jq '.[-1].kept = false' .build-perf.json > .build-perf.json.tmp && mv .build-perf.json.tmp .build-perf.json
   ```

5. **If you've completed N experiments**, stop and report a summary.

### 4. Summary Report

After all experiments (or after reaching the max), print a summary table showing:
- Experiment number
- Commit hash (short)
- Description
- Average build time
- Average fetch calls
- Delta from baseline (for both metrics)
- Whether it was kept or reverted

Read the data from `.build-perf.json` to generate this summary.

## Metrics

The experiment script tracks three metrics per build:

- **Build time** (seconds): Wall-clock time for `pnpm build`
- **Fetch calls**: Total number of `fetchPost()` invocations — the number of HTTP requests the build would make to external services with a cold cache
- **Cache misses**: Actual HTTP requests that went to external services (should be 0 with a warm cache)

The fetch metrics are written by instrumentation in `src/lib/fetchPost.ts` to `.build-perf-requests.txt` after each build.

## Important Notes

- Always use the shell scripts for repeatable operations.
- The `.build-perf.json` file is git-ignored and persists across runs.
- The cache is **not** cleared between builds to avoid unnecessary load on external services. The setup script warms the cache before experiments begin.
- Build times are measured in seconds with decimal precision.
- Do NOT modify the shell scripts or the fetchPost.ts instrumentation during experiments; they must remain consistent across all runs.
