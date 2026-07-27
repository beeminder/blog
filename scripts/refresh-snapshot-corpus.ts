import "dotenv/config";
import { writeFileSync } from "node:fs";
import fetchPosts from "../src/lib/fetchPosts";
import { rawPost } from "../src/schemas/post";

// Regenerate the frozen pad corpus that the getPosts snapshot test renders.
// Fetches every pad body live and writes the validated RawPost[] to a committed
// fixture, sorted by slug for diff-friendliness. Run deliberately (not in CI)
// when you want the snapshot to cover new/edited pad content, then follow with
// `pnpm test:snapshot:update` and commit both the fixture and the .snap diff.
//
// FILE_SYSTEM_CACHE=false forces a live refetch so a stale local cache can't
// freeze old content into the fixture. Safe to set here: fetchPosts reads the
// flag only when called, below.
process.env.FILE_SYSTEM_CACHE = "false";

const FIXTURE = "src/lib/__fixtures__/posts-corpus.json";

// Pad bodies can contain the secret ETHERPAD_DOMAIN (pasted export links).
// Redact it before committing, mirroring the canonicalizeUrl snapshot, so the
// check:secrets pre-commit hook stays green and no secret lands in the fixture
// or the rendered .snap. CI renders this same redacted fixture, so it matches.
const domain = process.env.ETHERPAD_DOMAIN;
if (!domain) {
  throw new Error("ETHERPAD_DOMAIN must be set to fetch and redact the corpus");
}

const fetched = await Promise.all(fetchPosts());
const corpus = fetched
  .map((p) => rawPost.parse(p))
  .sort((a, b) => a.slug.localeCompare(b.slug));

const json = JSON.stringify(corpus, null, 2)
  .split(domain)
  .join("the_source_domain");
writeFileSync(FIXTURE, json + "\n");
console.log(`Wrote ${corpus.length} posts to ${FIXTURE}`);
