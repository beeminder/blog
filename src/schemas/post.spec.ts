import { describe, it, expect } from "vitest";
import { post } from "./post";
import padm from "../lib/test/padm";
import meta from "../lib/test/meta";

describe("post", () => {
  it("requires disqus id", () => {
    const md = padm({
      frontmatter: meta({
        disqus_id: "",
        date: new Date(),
      }),
      content: "body",
    });

    expect(() =>
      post.parse({
        url: "the_url",
        md,
      }),
    ).toThrowError();
  });

  it("uses disqus id", () => {
    const md = padm({
      frontmatter: meta({
        disqus_id: "test-post",
        date: new Date(),
      }),
      content: "body",
    });

    const p = post.parse({
      source: "the_url",
      md,
      redirects: [],
      tags: [],
    });

    expect(p.disqus_id).toEqual("test-post");
  });

  it("does not include private notes in excerpts", async () => {
    const md = padm({
      frontmatter: meta({
        date: new Date(),
      }),
      before: "private notes",
      content: "content",
    });

    const p = post.parse({
      source: "the_url",
      md,
      redirects: [],
      tags: [],
    });

    expect(p.excerpt).not.toContain("private notes");
  });

  it("does not include raw markdown in excerpts", async () => {
    const md = padm({
      frontmatter: meta({
        date: new Date(),
        excerpt: "MAGIC_AUTO_EXTRACT",
      }),
      content: "[link](#)",
    });

    const p = post.parse({
      source: "the_url",
      md,
      redirects: [],
      tags: [],
    });

    expect(p.excerpt).not.toContain("(#)");
  });

  it("does not use image from private notes", async () => {
    const md = padm({
      frontmatter: meta({
        date: new Date(),
      }),
      before: "<img src='/private' />",
      content: "content",
    });

    const p = post.parse({
      source: "the_url",
      md,
      redirects: [],
      tags: [],
    });

    expect(p.image).toBeUndefined();
  });

  it("requires title", async () => {
    const md = padm({
      frontmatter: meta({
        title: "",
        date: new Date(),
      }),
    });

    const result = post.safeParse({
      source: "the_url",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires slug", async () => {
    const md = padm({
      frontmatter: meta({
        slug: "",
        date: new Date(),
      }),
    });

    const result = post.safeParse({
      source: "the_url",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires author", async () => {
    const md = padm({
      frontmatter: meta({
        author: "",
        date: new Date(),
      }),
    });

    const result = post.safeParse({
      source: "the_url",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires disqus_id", async () => {
    const md = padm({
      frontmatter: meta({
        disqus_id: "",
        date: new Date(),
      }),
    });

    const result = post.safeParse({
      source: "the_url",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires redirects", async () => {
    const md = padm({
      frontmatter: meta({
        redirects: undefined,
        date: new Date(),
      }),
    });

    const result = post.safeParse({
      source: "the_url",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires date", async () => {
    const md = padm({
      frontmatter: meta({
        date: undefined,
      }),
    });

    const result = post.safeParse({
      source: "the_url",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires tags", async () => {
    const md = padm({
      frontmatter: meta({
        tags: undefined,
        date: new Date(),
      }),
    });

    const result = post.safeParse({
      source: "the_url",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires status", async () => {
    const md = padm({
      frontmatter: meta({
        status: undefined,
        date: new Date(),
      }),
    });

    const result = post.safeParse({
      source: "the_url",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires source", async () => {
    const md = padm({
      frontmatter: meta({
        date: new Date(),
      }),
    });

    const result = post.safeParse({
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires new line preceeding HTML comments", async () => {
    const md = padm({
      frontmatter: meta({
        date: new Date(),
      }),
      content: `This is the paragraph in question
<!-- comment --> More text`,
    });

    const result = post.safeParse({
      source: "the_url",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("specifies error reason", async () => {
    const md = padm({
      frontmatter: meta({
        date: new Date(),
      }),
      content: `This is the paragraph in question
<!-- comment --> More text`,
    });

    const result = post.safeParse({
      source: "the_url",
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
    const md = padm({
      frontmatter: meta({
        excerpt: undefined,
        date: new Date(),
      }),
    });

    const result = post.safeParse({
      source: "the_url",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("expects excerpt from MAGIC_AUTO_EXTRACT to be Generated", async () => {
    const md = padm({
      content: "words",
      frontmatter: meta({
        excerpt: "MAGIC_AUTO_EXTRACT",
        date: new Date(),
      }),
    });

    const result = post.parse({
      source: "the_url",
      md,
    });

    expect(result.excerpt).toContain("word");
  });

  it("expects custom excerpt to return unchanged", async () => {
    const md = padm({
      content: "words",
      frontmatter: meta({
        excerpt: "the excerpt",
        date: new Date(),
      }),
    });

    const result = post.parse({
      source: "the_url",
      md,
    });

    expect(result.excerpt).toMatch("the excerpt");
  });
});
