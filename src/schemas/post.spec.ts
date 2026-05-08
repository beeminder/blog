import { describe, it, expect } from "vitest";
import { rawPost, processPost } from "./post";
import ether from "../lib/test/ether";

// Minimal valid metadata for the rawPost schema. Tests that need to
// exercise validation should override individual fields rather than
// constructing full Etherpad-format markdown.
function meta(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    source: "the_url",
    date: "2020-01-01",
    excerpt: "the_excerpt",
    slug: "the_slug",
    tags: ["the_tag"],
    redirects: ["the_redirect"],
    author: "the_author",
    status: "publish",
    disqus_id: "the_disqus_id",
    md: "ignored by rawPost",
    ...overrides,
  };
}

describe("rawPost", () => {
  it("accepts a complete metadata object", () => {
    const result = rawPost.safeParse(meta());
    expect(result.success).toBe(true);
  });

  it("requires source", () => {
    const result = rawPost.safeParse(meta({ source: undefined }));
    expect(result.success).toBe(false);
  });

  it("requires non-empty source", () => {
    const result = rawPost.safeParse(meta({ source: "" }));
    expect(result.success).toBe(false);
  });

  it("requires slug", () => {
    const result = rawPost.safeParse(meta({ slug: "" }));
    expect(result.success).toBe(false);
  });

  it("requires author", () => {
    const result = rawPost.safeParse(meta({ author: "" }));
    expect(result.success).toBe(false);
  });

  it("requires disqus_id", () => {
    const result = rawPost.safeParse(meta({ disqus_id: "" }));
    expect(result.success).toBe(false);
  });

  it("requires date", () => {
    const result = rawPost.safeParse(meta({ date: "" }));
    expect(result.success).toBe(false);
  });

  it("requires status to be a known value", () => {
    const result = rawPost.safeParse(meta({ status: "" }));
    expect(result.success).toBe(false);
  });

  it("requires excerpt", () => {
    const result = rawPost.safeParse(meta({ excerpt: undefined }));
    expect(result.success).toBe(false);
  });

  it("requires tags", () => {
    const result = rawPost.safeParse(meta({ tags: undefined }));
    expect(result.success).toBe(false);
  });

  it("requires redirects", () => {
    const result = rawPost.safeParse(meta({ redirects: undefined }));
    expect(result.success).toBe(false);
  });

  it("requires md", () => {
    const result = rawPost.safeParse(meta({ md: undefined }));
    expect(result.success).toBe(false);
  });
});

// A small integration-style check: rawPost + processPost together
// reproduce the seam used by getPosts. Detailed processing assertions
// live in processPost.spec.ts.
describe("schema + processPost integration", () => {
  it("produces a Post when given valid input", () => {
    const raw = rawPost.parse(meta({ md: ether() }));
    const result = processPost(raw);
    expect(result.disqus_id).toEqual("the_disqus_id");
    expect(result.slug).toEqual("the_slug");
  });
});
