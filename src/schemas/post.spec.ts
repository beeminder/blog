import { describe, it, expect } from "vitest";
import { post } from "./post";

describe("post", () => {
  it("requires disqus id", () => {
    const md = `---
title: "Test Post"
excerpt: "This is a test post"
slug: "test-post"
date: 2021-01-01
author: "dreeves"
---`;

    expect(() =>
      post.parse({
        url: "the_url",
        md,
      }),
    ).toThrowError();
  });
});
