import { describe, it, expect } from "vitest";
import { processPost, rawPost, type RawPost } from "./post";
import ether from "../lib/test/ether";

// Builds a valid RawPost. Tests focus on processPost behavior and
// don't need to exercise validation, so we construct via the schema
// once to satisfy the type, then override fields directly.
function rawWith(overrides: Partial<RawPost> = {}): RawPost {
  const base = rawPost.parse({
    source: "the_url",
    date: "2020-01-01",
    excerpt: "the_excerpt",
    slug: "the_slug",
    tags: ["the_tag"],
    redirects: ["the_redirect"],
    author: "the_author",
    status: "publish",
    disqus_id: "the_disqus_id",
    md: ether(),
  });
  return { ...base, ...overrides };
}

describe("processPost", () => {
  it("parses markdown into HTML content", () => {
    const result = processPost(rawWith({ md: ether({ content: "hello" }) }));
    expect(result.content).toContain("hello");
  });

  it("extracts the title from BEGIN_MAGIC", () => {
    const result = processPost(rawWith({ md: ether({ title: "My Title" }) }));
    expect(result.title).toEqual("My Title");
  });

  it("rejects when markdown lacks a title", () => {
    expect(() =>
      processPost(rawWith({ md: ether({ title: null }) })),
    ).toThrow();
  });

  it("throws when title is set in frontmatter (posts.json)", () => {
    expect(() =>
      processPost(rawWith({ title: "from-posts-json" } as Partial<RawPost>)),
    ).toThrow(/Title is not allowed in posts.json/);
  });

  it("returns a custom excerpt unchanged", () => {
    const result = processPost(rawWith({ excerpt: "the excerpt" }));
    expect(result.excerpt).toEqual("the excerpt");
  });

  it("expands MAGIC_AUTO_EXTRACT into a generated excerpt", () => {
    const result = processPost(
      rawWith({
        excerpt: "MAGIC_AUTO_EXTRACT",
        md: ether({ content: "words" }),
      }),
    );
    expect(result.excerpt).toContain("word");
  });

  it("excludes private notes from auto-extracted excerpts", () => {
    const result = processPost(
      rawWith({
        excerpt: "MAGIC_AUTO_EXTRACT",
        md: ether({ before: "private notes", content: "public" }),
      }),
    );
    expect(result.excerpt).not.toContain("private notes");
  });

  it("does not include raw markdown in auto-extracted excerpts", () => {
    const result = processPost(
      rawWith({
        excerpt: "MAGIC_AUTO_EXTRACT",
        md: ether({ content: "[link](#)" }),
      }),
    );
    expect(result.excerpt).not.toContain("(#)");
  });

  it("extracts the first image from content", () => {
    const result = processPost(
      rawWith({
        md: ether({
          content: `<img src="https://example.com/image.png" alt="the_alt" title="the_title" />`,
        }),
      }),
    );
    expect(result.image).toEqual(
      expect.objectContaining({
        src: "https://example.com/image.png",
        alt: "the_alt",
        title: "the_title",
      }),
    );
  });

  it("does not use images from private notes", () => {
    const result = processPost(
      rawWith({
        md: ether({ before: "<img src='/private' />" }),
      }),
    );
    expect(result.image).toBeUndefined();
  });

  it("converts the date string to a Date object", () => {
    const result = processPost(rawWith({ date: "2020-01-01" }));
    expect(result.date).toBeInstanceOf(Date);
    expect(result.date_string).toEqual("2020-01-01");
  });

  it("throws on markdown with comment syntax errors", () => {
    expect(() =>
      processPost(
        rawWith({
          md: ether({
            content: `This is the paragraph in question
<!-- comment --> More text`,
          }),
        }),
      ),
    ).toThrow();
  });
});
