import { describe, it, expect } from "vitest";
import toDiffableHtml from "diffable-html";
import { rawPost, processPost, type RawPost } from "../schemas/post";
import corpus from "./__fixtures__/posts-corpus.json";

// Renders a frozen corpus of pad exports (committed in __fixtures__), not live
// pads. The input only changes when a dev runs `pnpm snapshot:refresh` and
// commits the result, so a stable slug key + changed value is exactly the
// pipeline-regression signal we want — no md5-in-name trick, no nightly job.
//
// The array parse is fixture-integrity (fail fast if the committed corpus is
// malformed); processPost runs inside each case so a pipeline error is
// attributed to its slug and doesn't take down the other posts' tests.
const posts = rawPost.array().parse(corpus);

describe("body", () => {
  it.each(posts.map((p): [string, RawPost] => [p.slug, p]))(
    "post %s",
    (_slug, post) => {
      expect(toDiffableHtml(processPost(post).content)).toMatchSnapshot();
    },
  );
});
