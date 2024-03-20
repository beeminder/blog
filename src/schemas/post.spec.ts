import { describe, it, expect } from "vitest";
import { post } from "./post";
import ether from "../lib/test/ether";
import meta from "../lib/test/meta";

describe("post", () => {
  it("requires disqus id", () => {
    const md = ether({
      frontmatter: meta({
        disqus_id: "",
        date: new Date(),
      }),
      content: "body",
    });

    const data = {
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "",
      md,
    };

    expect(() => post.parse(data)).toThrowError();
  });

  it("uses disqus id", () => {
    const md = ether({
      content: "body",
    });

    const p = post.parse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "test-post",
      md,
    });

    expect(p.disqus_id).toEqual("test-post");
  });

  it("does not include private notes in excerpts", async () => {
    const md = ether({
      before: "private notes",
      content: "content",
    });

    const p = post.parse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(p.excerpt).not.toContain("private notes");
  });

  it("does not include raw markdown in excerpts", async () => {
    const md = ether({
      content: "[link](#)",
    });

    const p = post.parse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(p.excerpt).not.toContain("(#)");
  });

  it("does not use image from private notes", async () => {
    const md = ether({
      before: "<img src='/private' />",
      content: "content",
    });

    const p = post.parse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(p.image).toBeUndefined();
  });

  it("requires title", async () => {
    const md = ether({
      content: "content",
    });

    const result = post.safeParse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires slug", async () => {
    const md = ether({
      content: "content",
    });

    const result = post.safeParse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires author", async () => {
    const md = ether({
      content: "content",
    });

    const result = post.safeParse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires disqus_id", async () => {
    const md = ether({
      content: "content",
    });

    const result = post.safeParse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires redirects", async () => {
    const md = ether({
      content: "content",
    });

    const result = post.safeParse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: undefined,
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires date", async () => {
    const md = ether({
      content: "content",
    });

    const result = post.safeParse({
      source: "the_url",
      date: "",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires tags", async () => {
    const md = ether({
      content: "content",
    });

    const result = post.safeParse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: undefined,
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires status", async () => {
    const md = ether({
      content: "content",
    });

    const result = post.safeParse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires source", async () => {
    const md = ether({
      content: "content",
    });

    const result = post.safeParse({
      source: undefined,
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires new line preceeding HTML comments", async () => {
    const md = ether({
      content: `This is the paragraph in question
<!-- comment --> More text`,
    });

    const result = post.safeParse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("specifies error reason", async () => {
    const md = ether({
      content: `This is the paragraph in question
<!-- comment --> More text`,
    });

    const result = post.safeParse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    if (result.success) {
      throw new Error("Expected error");
    }
    expect(JSON.stringify(result.error)).toEqual(
      expect.stringMatching(/comment syntax error/),
    );
  });

  it("requires excerpt", async () => {
    const md = ether({
      content: "content",
    });

    const result = post.safeParse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: undefined,
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("expects excerpt from MAGIC_AUTO_EXTRACT to be Generated", async () => {
    const md = ether({
      content: "words",
    });

    const result = post.parse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "MAGIC_AUTO_EXTRACT",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(result.excerpt).toContain("word");
  });

  it("expects custom excerpt to return unchanged", async () => {
    const md = ether({
      content: "words",
    });

    const result = post.parse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(result.excerpt).toMatch("the excerpt");
  });

  it("extracts image title", async () => {
    const md = ether({
      content: `<img src="https://blog.beeminder.com/image.png" title="the_title" />`,
    });

    const result = post.parse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(result.image?.title).toMatch("the_title");
  });

  it("extracts image alt", async () => {
    const md = ether({
      content: `<img src="https://blog.beeminder.com/image.png" alt="the_alt" />`,
    });

    const result = post.parse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(result.image?.alt).toMatch("the_alt");
  });

  it("extracts image alt and title", async () => {
    const md = ether({
      content: `<img src="https://blog.beeminder.com/image.png" alt="the_alt" title="the_title" />`,
    });

    const result = post.parse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(result.image).toEqual(
      expect.objectContaining({ title: "the_title", alt: "the_alt" }),
    );
  });

  it("does not accept date from frontmatter", async () => {
    const md = ether({
      frontmatter: meta({
        date: "2020-01-01",
      }),
    });

    const result = post.safeParse({
      source: "the_url",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });
    expect(result.success).toEqual(false);
  });

  it("does not accept date_string from frontmatter", async () => {
    const md = ether({
      frontmatter: meta({
        date_string: "2020-01-01",
      }),
    });

    const result = post.safeParse({
      source: "the_url",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });
    expect(result.success).toEqual(false);
  });

  it("does not accept excerpt from frontmatter", async () => {
    const md = ether({
      frontmatter: meta({
        excerpt: "the_excerpt",
      }),
    });

    const result = post.safeParse({
      source: "the_url",
      date: "2020-01-01",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });
    expect(result.success).toEqual(false);
  });

  it("does not accept slug from frontmatter", async () => {
    const md = ether({
      frontmatter: meta({
        slug: "the_slug",
      }),
    });

    const result = post.safeParse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });
    expect(result.success).toEqual(false);
  });

  it("does not accept author from frontmatter", async () => {
    const md = ether({
      frontmatter: meta({
        author: "the_author",
      }),
    });

    const result = post.safeParse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("does not accept tags from frontmatter", async () => {
    const md = ether({
      frontmatter: meta({
        tags: ["the_tag"],
      }),
    });

    const result = post.safeParse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("does not accept disqus_id from frontmatter", async () => {
    const md = ether({
      frontmatter: meta({
        disqus_id: "the_disqus_id",
      }),
    });

    const result = post.safeParse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      status: "publish",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("does not accept status from frontmatter", async () => {
    const md = ether({
      frontmatter: meta({
        status: "publish",
      }),
    });

    const result = post.safeParse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      redirects: ["the_redirect"],
      author: "the_author",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("does not accept redirects from frontmatter", async () => {
    const md = ether({
      frontmatter: meta({
        redirects: ["the_redirect"],
      }),
    });

    const result = post.safeParse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("parses date correctly", async () => {
    const md = ether({
      content: "content",
    });

    const result = post.parse({
      source: "the_url",
      date: "2020-01-01",
      excerpt: "the_excerpt",
      slug: "the_slug",
      title: "the_title",
      tags: ["the_tag"],
      author: "the_author",
      status: "publish",
      disqus_id: "the_disqus_id",
      redirects: [],
      md,
    });

    expect(result.date.getFullYear()).toEqual(2020);
  });
});
