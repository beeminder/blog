## Agent skills

### Issue tracker

Issues live in GitHub Issues for this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses GitHub labels with two custom overrides: `ADO` (needs-info) and `nix` (wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Build pipeline

Padm.us (Etherpad CMS) → `posts.json` manifest → Astro build → Render → Cloudflare → blog.beeminder.com. See `docs/agents/build-pipeline.md`.

### Debugging stale content

When pad edits don't appear on blog.beeminder.com, walk the cache-layer decision tree in `docs/agents/debugging-stale-content.md`. Also covers regenerating snapshots after upstream pad edits.
