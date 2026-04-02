# Snapshot Tests

## Overview

Snapshot tests verify that changes don't break any posts in the blog's large backlog. They are slow, brittle, and fetch live external content — prefer unit tests whenever possible.

## Commands

```bash
pnpm run test:snapshot         # Run snapshot tests
pnpm run test:snapshot:update  # Update snapshots after verifying changes are correct
pnpm run cache:clear           # Clear local fetch cache to sync with upstream source changes
```

## How they work

- `getPosts.spec-snapshot.ts` fetches all posts, hashes their markdown source (MD5), and snapshots the rendered HTML. The test name includes the hash, so when source content changes the old snapshot becomes **obsolete** and a new one is created.
- `canonicalizeUrl.spec-snapshot.ts` snapshots the canonicalized URLs for all posts.
- Snapshots are committed to `src/lib/__snapshots__/`.

## Key behaviors

- **Obsolete snapshots**: When a post's source markdown changes, the hash in the test name changes. The old snapshot entry becomes obsolete and a new one is written. This is normal — run `pnpm run test:snapshots:update` to clean up obsolete entries.
- **Cache drift**: Your local file-system cache may have stale content. If snapshot tests fail as obsolete in CI but pass locally, run `pnpm run cache:clear` then re-run and update snapshots.
- **CI flakiness**: Since tests fetch live content, a post's rendered HTML can change between your local run and CI's run, causing a mismatch. This is inherent to the design. If CI fails on a snapshot you just updated, it likely means the external content changed in between.

## When modifying post rendering

1. Run `pnpm run test:snapshots` to see what changed
2. Review the diff to confirm changes are expected
3. Run `pnpm run test:snapshots:update` to accept the new snapshots
4. Commit the updated snapshot files
