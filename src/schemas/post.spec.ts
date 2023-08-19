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
---

body`;

    expect(() =>
      post.parse({
        url: "the_url",
        md,
      }),
    ).toThrowError();
  });

  it("uses disqus id", () => {
    const md = `---
title: "Test Post"
excerpt: "This is a test post"
slug: "test-post"
date: 2021-01-01
author: "dreeves"
disqus_id: "test-post"
---

body`;

    const p = post.parse({
      url: "the_url",
      md,
    });

    expect(p.disqus_id).toEqual("test-post");
  });
});
