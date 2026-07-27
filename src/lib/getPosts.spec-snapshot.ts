import { describe, it, expect } from "vitest";
import toDiffableHtml from "diffable-html";
import { rawPost, processPost } from "../schemas/post";
import corpus from "./__fixtures__/posts-corpus.json";

// Renders a frozen corpus of pad exports (committed in __fixtures__), not live
// pads. The input only changes when a dev runs `pnpm snapshot:refresh` and
// commits the result, so a stable slug key + changed value is exactly the
// pipeline-regression signal we want — no md5-in-name trick, no nightly job.
const posts = rawPost.array().parse(corpus).map(processPost);

describe("body", () => {
  it.each(posts.map((p): [string, string] => [p.slug, p.content]))(
    "post %s",
    (_slug, content) => {
      expect(toDiffableHtml(content)).toMatchSnapshot();
    },
  );
});
