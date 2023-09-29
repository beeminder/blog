import getPosts from "./getPosts";
import { describe, it, expect, vi, beforeEach } from "vitest";
import fetchPost from "./fetchPost";
import readSources from "./readSources";
import padm from "./test/padm";

describe("getPosts", () => {
  beforeEach(() => {
    vi.mocked(readSources).mockReturnValue([
      {
        source: "https://padm.us/psychpricing",
        id: "14",
        slug: "psychpricing",
        date: "2021-09-01",
        status: "publish",
        disqus_id: "14 https://blog.beeminder.com/?p=14",
        author: "the_author",
      },
    ]);
  });

  it("only loads sources once", async () => {
    await getPosts();
    await getPosts();

    expect(readSources).toHaveBeenCalledTimes(1);
  });

  it("fetches post content", async () => {
    await getPosts();

    expect(fetchPost).toBeCalledWith("https://padm.us/psychpricing");
  });

  it("sorts post by date descending", async () => {
    vi.mocked(readSources).mockReturnValue([
      {
        source: "https://padm.us/old",
        id: "1",
        slug: "old",
        date: "2020-01-01",
        status: "publish",
        author: "the_author",
        disqus_id: "1 https://blog.beeminder.com/?p=1",
      },
      {
        source: "https://padm.us/new",
        id: "2",
        slug: "new",
        date: "2020-01-02",
        status: "publish",
        author: "the_author",
        disqus_id: "2 https://blog.beeminder.com/?p=2",
      },
    ]);

    await getPosts();

    expect(fetchPost).toBeCalledWith(expect.stringContaining("new"));
  });

  it("includes excerpts", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        content: "word",
      }),
    );

    const posts = await getPosts();

    expect(posts[0]?.excerpt).toContain("word");
  });

  it("excludes unpublished posts by default", async () => {
    vi.mocked(readSources).mockReturnValue([
      {
        source: "https://padm.us/psychpricing",
        id: "14",
        slug: "psychpricing",
        date: "2021-09-01",
        status: "draft",
        disqus_id: "14 https://blog.beeminder.com/?p=14",
        author: "the_author",
      },
    ]);

    const posts = await getPosts();

    expect(posts).toHaveLength(0);
  });

  it("includes unpublished posts when requested", async () => {
    vi.mocked(readSources).mockReturnValue([
      {
        source: "https://padm.us/psychpricing",
        id: "14",
        slug: "psychpricing",
        date: "2021-09-01",
        status: "draft",
        disqus_id: "14 https://blog.beeminder.com/?p=14",
        author: "the_author",
      },
    ]);

    const posts = await getPosts({ includeUnpublished: true });

    expect(posts).toHaveLength(1);
  });

  it('caches posts without reference to "includeUnpublished"', async () => {
    await getPosts();
    await getPosts({ includeUnpublished: true });

    expect(fetchPost).toHaveBeenCalledTimes(1);
  });

  it("sets disqus id", async () => {
    const posts = await getPosts();
    const result = posts.find((p) => p.slug === "psychpricing");

    expect(result?.disqus_id).toBe("14 https://blog.beeminder.com/?p=14");
  });

  it("includes date_string", async () => {
    const posts = await getPosts();
    const result = posts.find((p) => p.slug === "psychpricing");

    expect(result?.date_string).toEqual("2021-09-01");
  });

  it("extracts image url", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        content: '<img src="https://example.com/image.png" />',
      }),
    );

    const posts = await getPosts();
    const result = posts.find((p) => p.slug === "psychpricing");

    expect(result?.image?.src).toEqual("https://example.com/image.png");
  });

  it("uses frontmatter title", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        frontmatter: {
          title: "Hello",
        },
      }),
    );

    const posts = await getPosts();
    const result = posts.find((p) => p.slug === "psychpricing");

    expect(result?.title).toEqual("Hello");
  });

  it("uses frontmatter author", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        frontmatter: {
          author: "Alice",
        },
      }),
    );

    const posts = await getPosts();
    const result = posts.find((p) => p.slug === "psychpricing");

    expect(result?.author).toEqual("Alice");
  });

  it("uses frontmatter excerpt", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        frontmatter: {
          excerpt: "Hello",
        },
      }),
    );

    const posts = await getPosts();
    const result = posts.find((p) => p.slug === "psychpricing");

    expect(result?.excerpt).toEqual("Hello");
  });

  it("uses frontmatter tags", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        frontmatter: {
          tags: ["a", "b", "c"],
        },
      }),
    );

    const posts = await getPosts();
    const result = posts.find((p) => p.slug === "psychpricing");

    expect(result?.tags).toEqual(expect.arrayContaining(["a", "b", "c"]));
  });

  it("uses frontmatter date", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        frontmatter: {
          date: new Date("2021-09-02"),
        },
      }),
    );

    const posts = await getPosts();
    const result = posts.find((p) => p.slug === "psychpricing");

    expect(result?.date_string).toEqual("2021-09-02");
  });

  it("uses frontmatter slug", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        frontmatter: {
          slug: "hello",
        },
      }),
    );

    const posts = await getPosts();
    const result = posts.find((p) => p.slug === "hello");

    expect(result?.slug).toEqual("hello");
  });

  it("uses legacy status", async () => {
    const posts = await getPosts();
    const result = posts.find((p) => p.slug === "psychpricing");

    expect(result?.status).toEqual("publish");
  });

  it("uses frontmatter status", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        frontmatter: {
          status: "publish",
        },
      }),
    );

    const posts = await getPosts();
    const result = posts.find((p) => p.slug === "psychpricing");

    expect(result?.status).toEqual("publish");
  });

  it("uses wp title over magic title", async () => {
    vi.mocked(readSources).mockReturnValue([
      {
        source: "https://padm.us/psychpricing",
        id: "14",
        slug: "psychpricing",
        date: "2021-09-01",
        status: "publish",
        disqus_id: "14 https://blog.beeminder.com/?p=14",
        title: "wp_title",
        author: "the_author",
      },
    ]);

    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        title: "magic_title",
      }),
    );

    const posts = await getPosts();
    const result = posts.find((p) => p.slug === "psychpricing");

    expect(result?.title).toEqual("wp_title");
  });

  it("uses frontmatter title over wp title", async () => {
    vi.mocked(readSources).mockReturnValue([
      {
        source: "https://padm.us/psychpricing",
        id: "14",
        slug: "psychpricing",
        date: "2021-09-01",
        status: "publish",
        disqus_id: "14 https://blog.beeminder.com/?p=14",
        title: "wp_title",
        author: "the_author",
      },
    ]);

    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        frontmatter: {
          title: "frontmatter_title",
        },
      }),
    );

    const posts = await getPosts();
    const result = posts.find((p) => p.slug === "psychpricing");

    expect(result?.title).toEqual("frontmatter_title");
  });

  it("returns html", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        content: "hello world",
      }),
    );

    const posts = await getPosts();
    const { content } = posts.find((p) => p.slug === "psychpricing") || {};

    expect(content).toBe("<p>hello world</p>\n");
  });

  it("uses smartypants", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        content: '"hello world"',
      }),
    );

    const posts = await getPosts();
    const { content } = posts.find((p) => p.slug === "psychpricing") || {};

    expect(content).toContain("&#8220;hello world&#8221;");
  });

  it("does not require new line after html element", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        content: `
<h1>heading</h1>
paragraph
`,
      }),
    );

    const posts = await getPosts();
    const { content } = posts.find((p) => p.slug === "psychpricing") || {};

    expect(content).toContain("<p>");
  });

  it("allows for PHP Markdown Extra-style IDs", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        content: "# heading {#id}",
      }),
    );

    const posts = await getPosts();
    const { content } = posts.find((p) => p.slug === "psychpricing") || {};

    expect(content).toContain('<h1 id="id">heading</h1>');
  });

  it("handles id properly", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        content: "## More Real-World Commitment Devices  {#AUG}",
      }),
    );

    const posts = await getPosts();
    const { content } = posts.find((p) => p.slug === "psychpricing") || {};

    expect(content).toContain('id="AUG"');
  });

  it("handles multiple IDs", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        content: `
## What Commitment Devices Have You Used on Yourself? {#POL}

## More Real-World Commitment Devices  {#AUG}
`,
      }),
    );

    const posts = await getPosts();
    const { content } = posts.find((p) => p.slug === "psychpricing") || {};

    expect(content).toContain('id="POL"');
    expect(content).toContain('id="AUG"');
  });

  it("supports link nonsense", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        content: `
[paying is not punishment](
https://blog.beeminder.com/depunish
"Our paying-is-not-punishment post is also a prequel to our announcement of No-Excuses Mode"
) because
      `,
      }),
    );

    const posts = await getPosts();
    const { content } = posts.find((p) => p.slug === "psychpricing") || {};

    expect(content).toContain('href="https://blog.beeminder.com/depunish"');
  });

  it("links footnotes", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        content: "$FN[foo] $FN[foo]",
      }),
    );

    const posts = await getPosts();
    const { content } = posts.find((p) => p.slug === "psychpricing") || {};

    expect(content).toContain(
      '<a class="footnote" id="foo1" href="#foo">[1]</a>',
    );
  });

  it("expands refs", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        content: "$REF[foo] $REF[bar]",
      }),
    );

    const posts = await getPosts();
    const { content } = posts.find((p) => p.slug === "psychpricing") || {};

    expect(content).toContain("2");
  });

  it("parses frontmatter", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      padm({
        frontmatter: {
          slug: "val",
        },
      }),
    );

    const posts = await getPosts();
    const { slug } = posts.find((p) => p.slug === "val") || {};

    expect(slug).toEqual("val");
  });

  it("uses wordpress excerpt", async () => {
    vi.mocked(readSources).mockReturnValue([
      {
        source: "padm.us/psychpricing",
        slug: "psychpricing",
        date: "2021-09-01",
        status: "publish",
        excerpt: "wp excerpt",
        author: "the_author",
        disqus_id: "the_disqus_id",
      },
    ]);

    const posts = await getPosts();

    const { excerpt } = posts.find((p) => p.slug === "psychpricing") || {};

    expect(excerpt).toEqual("wp excerpt");
  });

  it("strips html from wp excerpts", async () => {
    vi.mocked(readSources).mockReturnValue([
      {
        source: "padm.us/psychpricing",
        slug: "psychpricing",
        date: "2021-09-01",
        status: "publish",
        excerpt: "<strong>wp excerpt</strong>",
        author: "the_author",
        disqus_id: "the_disqus_id",
      },
    ]);

    const posts = await getPosts();

    const { excerpt } = posts.find((p) => p.slug === "psychpricing") || {};

    expect(excerpt).toEqual("wp excerpt");
  });

  it("throws on duplicate slugs", async () => {
    vi.mocked(readSources).mockReturnValue([
      { source: "padm.us/a" },
      { source: "padm.us/b" },
    ]);

    vi.mocked(fetchPost).mockResolvedValue(`---
slug: the_slug
date: 2023-01-01
author: the_author
disqus_id: the_disqus_id
---

BEGIN_MAGIC
# content
END_MAGIC
`);

    await expect(getPosts()).rejects.toThrow(/Duplicate slug/);
  });

  it("throws on duplicate disqus IDs", async () => {
    vi.mocked(readSources).mockReturnValue([
      { source: "padm.us/a" },
      { source: "padm.us/b" },
    ]);

    vi.mocked(fetchPost).mockResolvedValueOnce(`---
slug: the_slug_a
date: 2023-01-01
author: the_author
disqus_id: the_disqus_id
---

BEGIN_MAGIC
# content
END_MAGIC
`);

    vi.mocked(fetchPost).mockResolvedValueOnce(`---
slug: the_slug_b
date: 2023-01-01
author: the_author
disqus_id: the_disqus_id
---

BEGIN_MAGIC
# content
END_MAGIC
`);

    await expect(getPosts()).rejects.toThrow(/Duplicate disqus/);
  });
});
