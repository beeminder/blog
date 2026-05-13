# Build pipeline

How a post gets from a pad to a published page. Read this before debugging anything content- or deploy-related.

## Topology

```
┌────────────────────┐          ┌──────────────────┐         ┌─────────────┐         ┌──────────────────────┐
│  <etherpad-host> (CMS)     │  fetch   │  this repo       │  push   │  Render     │  serve  │  blog.beeminder.com  │
│  Etherpad pads     │◀─────────┤  Astro build     ├────────▶│  static     ├────────▶│  (Cloudflare front)  │
│  /<pad>/export/txt │  per     │  scripts + lib   │  deploy │  site host  │  via    │                      │
└────────────────────┘  build   └──────────────────┘         └─────────────┘  CF     └──────────────────────┘
```

- **CMS** — pads live at `https://<etherpad-host>/<pad>` (a Beeminder-branded Etherpad called Beetherpad).
- **Manifest** — `posts.json` at the repo root lists every post and where to fetch it from (`source`, `slug`, `date`, `author`, `tags`, `status`, etc.). Adding a post = editing `posts.json`. Editing a pad's body does _not_ touch `posts.json`.
- **Build** — `pnpm run build` runs `scripts/image-cache.mjs` then `astro build`. Astro's pages call into `src/lib/getPosts.ts`, which reads `posts.json`, fetches each pad, and processes the result.
- **Deploy** — `render.yaml` defines a Render static site (`beeblog`) that builds on every push to a tracked branch and on manual "Deploy" clicks. Output is `./dist/`. Render serves it through Cloudflare.

## Source URL canonicalisation

`posts.json` `source` fields use legacy hostnames like `doc.bmndr.co/<pad>`. They're rewritten at fetch time by `src/lib/canonicalizeUrl.ts`:

- Any of `etherpad`, `doc.bmndr.co`, `doc.bmndr.com`, `doc.beeminder.com` → swapped for the `ETHERPAD_DOMAIN` env var.
- `/<pad>` → `/<pad>/export/txt` (Etherpad's plain-text export endpoint).

Production `ETHERPAD_DOMAIN` is `<etherpad-host>`. Only `<etherpad-host>` actually serves pad content — the other hostnames redirect or 404. If a build is succeeding, `ETHERPAD_DOMAIN` is set correctly.

## Where to look

| When you're investigating…       | Start here                                                            |
| -------------------------------- | --------------------------------------------------------------------- |
| What gets fetched and from where | `src/lib/canonicalizeUrl.ts`, `src/lib/fetchPost.ts`                  |
| How pad text becomes a `Post`    | `src/lib/getPosts.ts`, `src/lib/fetchPosts.ts`, `src/schemas/post.ts` |
| Markdown rendering               | `src/lib/cachedParseMarkdown.ts` (wraps `expost`'s `parseMarkdown`)   |
| Render service config            | `render.yaml`                                                         |
| Build-time perf                  | `src/lib/buildPerf.ts`, `pnpm run puppeteer:report`                   |

## Useful env vars

| Var                       | Effect                                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `ETHERPAD_DOMAIN`         | Host to fetch pads from. Required. `<etherpad-host>` in prod, `<etherpad-host>` locally if you want real content. |
| `RENDER`                  | Set by Render automatically. Triggers in-memory caching paths instead of disk.                                    |
| `FILE_SYSTEM_CACHE=false` | Manual override to disable disk caches when developing locally. Useful for snapshot regeneration after pad edits. |

## Manifest vs. body changes

Two distinct change types behave differently:

- **Manifest change** (new post, status flip, tag edit, redirect) — edit `posts.json` and commit. The hash of `posts.json` is what busts the disk cache (see `docs/agents/debugging-stale-content.md`).
- **Body change** (typo fix, content rewrite inside an existing pad) — edit on <etherpad-host>, no commit needed. Fresh build picks it up via the live fetch.

If you're "adding a post," you're doing the first kind. If you're "fixing a typo," you're doing the second.
