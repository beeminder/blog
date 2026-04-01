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
- Checkout master and pull latest
- Create and checkout a new branch `build-perf-optimize-YYYYMMDD-HHMMSS`
- Run `pnpm install`
- Initialize `.build-perf.json` if it doesn't exist

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

2. **Commit the change:**
   ```bash
   git add -A && git commit -m "perf: <short description of the change>"
   ```

3. **Run the experiment:**
   ```bash
   bash .claude/skills/optimize-build/scripts/experiment.sh "<short description>"
   ```

   The script will:
   - Clear cache and run 5 timed builds
   - Record the result to `.build-perf.json`
   - Compare to the best previous kept experiment
   - If no improvement: automatically revert the commit (keeping it in history) and mark it as not kept

4. **If you've completed N experiments**, stop and report a summary.

### 4. Summary Report

After all experiments (or after reaching the max of 10), print a summary table showing:
- Experiment number
- Commit hash (short)
- Description
- Average build time
- Delta from baseline
- Whether it was kept or reverted

Read the data from `.build-perf.json` to generate this summary.

## Important Notes

- Always use the shell scripts for repeatable operations.
- The `.build-perf.json` file is git-ignored and persists across runs.
- Each benchmark run clears the cache before building to ensure consistent results.
- Build times are measured in seconds with decimal precision.
- Do NOT modify the shell scripts during experiments; they must remain consistent across all runs.
