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
        status: "publish",
      },
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
      frontmatter: {
        title: "Test Post",
        excerpt: "This is a test post",
        slug: "test-post",
        date: new Date("2021-01-01"),
        author: "dreeves",
        disqus_id: "test-post",
        status: "publish",
      },
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
      frontmatter: {
        title: "Test Post",
        excerpt: "This is a test post",
        slug: "test-post",
        date: new Date("2021-01-01"),
        author: "dreeves",
        disqus_id: "test-post",
        status: "publish",
      },
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
      frontmatter: {
        title: "Test Post",
        excerpt: "This is a test post",
        slug: "test-post",
        date: new Date("2021-01-01"),
        author: "dreeves",
        disqus_id: "test-post",
        status: "publish",
      },
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
      frontmatter: {
        excerpt: "This is a test post",
        slug: "test-post",
        date: new Date("2021-01-01"),
        author: "dreeves",
        disqus_id: "test-post",
      },
    });

    const result = post.safeParse({
      source: "the_url",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires slug", async () => {
    const md = padm({
      frontmatter: {
        title: "Test Post",
        excerpt: "This is a test post",
        date: new Date("2021-01-01"),
        author: "dreeves",
        disqus_id: "test-post",
      },
    });

    const result = post.safeParse({
      source: "the_url",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires author", async () => {
    const md = padm({
      frontmatter: {
        title: "Test Post",
        excerpt: "This is a test post",
        date: new Date("2021-01-01"),
        slug: "test-post",
        disqus_id: "test-post",
      },
    });

    const result = post.safeParse({
      source: "the_url",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires disqus_id", async () => {
    const md = padm({
      frontmatter: {
        title: "Test Post",
        excerpt: "This is a test post",
        date: new Date("2021-01-01"),
        author: "dreeves",
        slug: "test-post",
      },
    });

    const result = post.safeParse({
      source: "the_url",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires redirects", async () => {
    const md = padm({
      frontmatter: {
        title: "Test Post",
        date: new Date("2021-01-01"),
        author: "dreeves",
        slug: "test-post",
        disqus_id: "test-post",
      },
    });

    const result = post.safeParse({
      source: "the_url",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires date", async () => {
    const md = padm({
      frontmatter: {
        title: "Test Post",
        author: "dreeves",
        slug: "test-post",
        disqus_id: "test-post",
        redirects: [],
      },
    });

    const result = post.safeParse({
      source: "the_url",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires tags", async () => {
    const md = padm({
      frontmatter: {
        title: "Test Post",
        date: new Date("2021-01-01"),
        author: "dreeves",
        slug: "test-post",
        disqus_id: "test-post",
        redirects: [],
      },
    });

    const result = post.safeParse({
      source: "the_url",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires status", async () => {
    const md = padm({
      frontmatter: {
        title: "Test Post",
        date: new Date("2021-01-01"),
        author: "dreeves",
        slug: "test-post",
        disqus_id: "test-post",
        redirects: [],
        tags: [],
      },
    });

    const result = post.safeParse({
      source: "the_url",
      md,
    });

    expect(result.success).toEqual(false);
  });

  it("requires source", async () => {
    const md = padm({
      frontmatter: {
        title: "Test Post",
        date: new Date("2021-01-01"),
        author: "dreeves",
        slug: "test-post",
        disqus_id: "test-post",
        redirects: [],
        tags: [],
        status: "publish",
      },
    });

    const result = post.safeParse({
      md,
    });

    expect(result.success).toEqual(false);
  });
});
