## Agent skills

### Issue tracker

Issues live in GitHub Issues for this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses GitHub labels with two custom overrides: `ADO` (needs-info) and `nix` (wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Build pipeline

Padm.us (Etherpad CMS) → `posts.json` manifest → Astro build → Render → Cloudflare → blog.beeminder.com. See `docs/agents/build-pipeline.md`.

### User-facing strings

All chrome copy lives in the `src/i18n` catalog; an ESLint rule blocks literal user-facing text in `.astro` markup so AI-authored copy can't ship. **Do not write the wording for any new string — stub it with `tk("description of what's needed")` and leave the copy for a human;** CI (`check:i18n`) fails while any `tk(...)` placeholder remains, and `check:strings` fails any PR where an agent-co-authored commit edits real copy in the catalog (agents may only add `tk()` stubs). Post content (from `posts.json`) is exempt. See `docs/agents/i18n.md`.

### Debugging stale content

When pad edits don't appear on blog.beeminder.com, walk the cache-layer decision tree in `docs/agents/debugging-stale-content.md`. Also covers regenerating snapshots after upstream pad edits.
