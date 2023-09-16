import { describe, it, expect } from "vitest";
import { post } from "./post";
import padm from "../lib/test/padm";

describe("post", () => {
  it("requires disqus id", () => {
    const md = padm({
      frontmatter: {
        title: "Test Post",
        excerpt: "This is a test post",
        slug: "test-post",
        date: new Date("2021-01-01"),
        author: "dreeves",
      },
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
      frontmatter: {
        title: "Test Post",
        excerpt: "This is a test post",
        slug: "test-post",
        date: new Date("2021-01-01"),
        author: "dreeves",
        disqus_id: "test-post",
      },
      content: "body",
    });

    const p = post.parse({
      source: "the_url",
      md,
    });

    expect(p.disqus_id).toEqual("test-post");
  });

  it("does not include private notes in excerpts", async () => {
    const md = padm({
      frontmatter: {
        title: "Test Post",
        excerpt: "This is a test post",
        slug: "test-post",
        date: new Date("2021-01-01"),
        author: "dreeves",
        disqus_id: "test-post",
      },
      before: "private notes",
      content: "content",
    });

    const p = post.parse({
      source: "the_url",
      md,
    });

    expect(p.excerpt).not.toContain("private notes");
  });

  it("does not include raw markdown in excerpts", async () => {
    const md = padm({
      frontmatter: {
        title: "Test Post",
        excerpt: "This is a test post",
        slug: "test-post",
        date: new Date("2021-01-01"),
        author: "dreeves",
        disqus_id: "test-post",
      },
      content: "[link](#)",
    });

    const p = post.parse({
      source: "the_url",
      md,
    });

    expect(p.excerpt).not.toContain("(#)");
  });

  it("does not use image from private notes", async () => {
    const md = padm({
      frontmatter: {
        title: "Test Post",
        excerpt: "This is a test post",
        slug: "test-post",
        date: new Date("2021-01-01"),
        author: "dreeves",
        disqus_id: "test-post",
      },
      before: "<img src='/private' />",
      content: "content",
    });

    const p = post.parse({
      source: "the_url",
      md,
    });

    expect(p.image).toBeUndefined();
  });
});
