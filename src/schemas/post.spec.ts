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

  it("does not include private notes in excerpts", async () => {
    const md = `---
title: "Test Post"
slug: "test-post"
date: 2021-01-01
author: "dreeves"
disqus_id: "test-post"
---

private notes

BEGIN_MAGIC
content`;

    const p = post.parse({
      url: "the_url",
      md,
    });

    expect(p.excerpt).not.toContain("private notes");
  });

  it("does not include raw markdown in excerpts", async () => {
    const md = `---
title: "Test Post"
slug: "test-post"
date: 2021-01-01
author: "dreeves"
disqus_id: "test-post"
---

[link](#)`;

    const p = post.parse({
      url: "the_url",
      md,
    });

    expect(p.excerpt).not.toContain("(#)");
  });

  it("does not use image from private notes", async () => {
    const md = `---
title: "Test Post"
slug: "test-post"
date: 2021-01-01
author: "dreeves"
disqus_id: "test-post"
---

<img src='/private' />

BEGIN_MAGIC
content`;

    const p = post.parse({
      url: "the_url",
      md,
    });

    expect(p.image).toBeUndefined();
  });
});
