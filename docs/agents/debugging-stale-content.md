# Debugging stale content

Runbook for: "I edited a pad on padm.us, Render deployed, but the change isn't appearing on blog.beeminder.com."

Read `docs/agents/build-pipeline.md` first if you don't already know the topology.

## Caching layers (in fetch order)

There are at least seven places content can be stale. Cheapest checks first.

| #   | Layer                                                   | Where                               | TTL / bust trigger                                                                                                       |
| --- | ------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1   | Browser cache                                           | local                               | `cache-control: max-age=0` on HTML; hard reload busts                                                                    |
| 2   | Cloudflare / Render edge                                | in front of blog.beeminder.com      | `s-maxage=300` (5 min). `cf-cache-status` header tells you HIT/MISS                                                      |
| 3   | Render build cache: `.cache/posts-processed.json`       | inside the build container          | bypassed when `RENDER=true` (see `src/lib/getPosts.ts`). Keyed on `posts.json` hash, **does not bust on pad body edits** |
| 4   | Render build cache: `.cache/parsed-markdown/`           | inside the build container          | keyed on markdown content hash, busts naturally on pad edits — safe                                                      |
| 5   | `node-fetch-cache`                                      | local disk only                     | bypassed when `RENDER=true` (see `src/lib/fetchPost.ts`)                                                                 |
| 6   | Astro image cache (`node_modules/.astro/assets/*.json`) | local + Render `node_modules` cache | extended weekly by `scripts/image-cache.mjs`. Only affects images                                                        |
| 7   | Etherpad export endpoint                                | padm.us                             | no cache headers as of last check — fresh per request                                                                    |

## Decision tree

Walk this top to bottom. Each step has a one-line diagnostic.

### 1. Is the pad actually saved?

```bash
curl -s "https://padm.us/<pad>/export/txt" | grep -F "<a distinctive string you just typed>"
```

If your change isn't here, the pad hasn't been saved (Etherpad autosave hiccup or you're looking at a different pad). Stop.

### 2. Is the deployed page genuinely stale, or just your browser?

```bash
curl -sI "https://blog.beeminder.com/<slug>/?bust=$(date +%s)" | grep -iE 'last-modified|etag|cf-cache-status'
curl -s  "https://blog.beeminder.com/<slug>/?bust=$(date +%s)" | grep -F "<your distinctive string>"
```

- `cf-cache-status: HIT` and stale → wait out the 5-min `s-maxage` or purge in Cloudflare. Verify with another `?bust=…` query.
- `cf-cache-status: MISS` and still stale → the origin (Render) is serving stale content. Continue.

### 3. Did Render actually rebuild?

Check `last-modified` on the deployed page. If it predates your "Deploy" click, the build didn't run / didn't write fresh output. Look at the Render dashboard's deploy history.

### 4. Is Render's build cache serving stale processed posts?

This is the case that bit us (PR [#651](https://github.com/beeminder/blog/pull/651)). Symptoms:

- `last-modified` updates per deploy (build is running)
- Deployed HTML still matches an old version of the pad
- Comparing deployed HTML to a months-old local `.cache/posts-processed.json` shows the **same** content

Confirm by clicking **"Clear build cache & deploy"** in the Render dashboard. If the change appears, the disk cache was the culprit.

The root cause is that `hashCache` keys may not bust on pad body changes. `src/lib/getPosts.ts` is keyed on `md5(posts.json)`, so pure body edits don't bust it. The fix is the `RENDER` / `FILE_SYSTEM_CACHE` bypass already in place there and in `src/lib/fetchPost.ts`.

If you add a _new_ `hashCache` caller, decide consciously whether its key actually busts when pad content changes. If not, add the same bypass.

### 5. None of the above

Look for new persisted caches that don't yet have an `IS_RENDER` bypass, or for a build script that copies a stale artifact into `dist/`.

## Useful sentinel test

If you don't have a real edit to test with, type a unique sentinel into the pad:

```bash
SENTINEL="SENTINEL-$(date +%Y%m%d-%H%M)-$$"
# 1. add $SENTINEL to padm.us/<pad>, save
curl -s "https://padm.us/<pad>/export/txt" | grep -F "$SENTINEL"     # confirm pad has it
# 2. trigger Render deploy, wait for "live"
curl -s "https://blog.beeminder.com/<slug>/?bust=$(date +%s)" | grep -c "$SENTINEL"
```

A `0` on the last line means the deployed output is missing the sentinel — proceed to step 4.

## Snapshot drift after pad edits

When pads are edited upstream, `test-snapshot` will fail on the next PR because snapshot test names embed `md5(p.md)`. Old hash becomes obsolete, new hash is unknown.

To regenerate snapshots cleanly:

```bash
pnpm cache:clear
FILE_SYSTEM_CACHE=false pnpm test:snapshot:update
git diff src/lib/__snapshots__/   # sanity check — typically tiny
```

If you skip `cache:clear`, the local `.cache/parsed-markdown/` may bake old rendering into the snapshot, producing a noisy diff that won't match CI.

## Fix patterns to mirror

- Always-fresh fetch on Render: `src/lib/fetchPost.ts` checks `env("RENDER") || env("FILE_SYSTEM_CACHE") === "false"`.
- Always-fresh post processing on Render: `src/lib/getPosts.ts` does the same (added in [#651](https://github.com/beeminder/blog/pull/651)).
- Regression test pattern: prime a "valid" disk cache via `vi.mocked(readFileSync).mockImplementation(() => …)`, set `vi.stubEnv("RENDER", "true")`, assert `fetchPost` is still called. See the `disk cache bypass` describe block in `src/lib/getPosts.spec.ts`.

## Caches that look suspicious but are safe

- `src/lib/cachedParseMarkdown.ts` — `hashCache` keyed on the markdown content itself, so it busts naturally on edits.
- `scripts/image-cache.mjs` — deliberately extends image-processing cache TTL. Affects images only; not a source of stale pad text.
