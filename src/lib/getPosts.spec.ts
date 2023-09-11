import getPosts from "./getPosts";
import { describe, it, expect, vi, beforeEach } from "vitest";
import fetchPost from "./fetchPost";
import loadLegacyData from "./test/loadLegacyData";
import readSources from "./readSources";
import padm from "./test/padm";

describe("getPosts", () => {
  beforeEach(() => {
    vi.mocked(readSources).mockReturnValue(["https://padm.us/psychpricing"]);
    loadLegacyData([
      {
        expost_source_url: "https://padm.us/psychpricing",
        ID: "14",
        Slug: "psychpricing",
        Date: "2021-09-01",
        Status: "publish",
        Excerpt: undefined,
        dsq_thread_id: "14",
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
      "https://dtherpad.com/old",
      "https://dtherpad.com/new",
    ]);

    loadLegacyData([
      {
        ID: "1",
        expost_source_url: "https://dtherpad.com/old",
        Slug: "old",
        Date: "2020-01-01",
        Status: "publish",
      },
      {
        ID: "2",
        expost_source_url: "https://dtherpad.com/new",
        Slug: "new",
        Date: "2020-01-02",
        Status: "publish",
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
    loadLegacyData([
      {
        expost_source_url: "https://padm.us/psychpricing",
        Slug: "psychpricing",
        Date: "2021-09-01",
        Status: "draft",
      },
    ]);

    const posts = await getPosts();

    expect(posts).toHaveLength(0);
  });

  it("includes unpublished posts when requested", async () => {
    loadLegacyData([
      {
        expost_source_url: "https://padm.us/psychpricing",
        Slug: "psychpricing",
        Date: "2021-09-01",
        Status: "draft",
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
    loadLegacyData([
      {
        expost_source_url: "https://padm.us/psychpricing",
        ID: "14",
        Slug: "psychpricing",
        Date: "2021-09-01",
        Status: "publish",
        Title: "wp_title",
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
    loadLegacyData([
      {
        expost_source_url: "https://padm.us/psychpricing",
        ID: "14",
        Slug: "psychpricing",
        Date: "2021-09-01",
        Status: "publish",
        Title: "wp_title",
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

    expect(content).toBe("<p>&#8220;hello world&#8221;</p>\n");
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
    vi.mocked(readSources).mockReturnValue(["dtherpad.com/psychpricing"]);

    loadLegacyData([
      {
        expost_source_url: "dtherpad.com/psychpricing",
        Slug: "psychpricing",
        Date: "2021-09-01",
        Status: "publish",
        Excerpt: "wp excerpt",
      },
    ]);

    const posts = await getPosts();

    const { excerpt } = posts.find((p) => p.slug === "psychpricing") || {};

    expect(excerpt).toEqual("wp excerpt");
  });

  it("strips html from wp excerpts", async () => {
    vi.mocked(readSources).mockReturnValue(["dtherpad.com/psychpricing"]);

    loadLegacyData([
      {
        expost_source_url: "dtherpad.com/psychpricing",
        Slug: "psychpricing",
        Date: "2021-09-01",
        Status: "publish",
        Excerpt: "<strong>wp excerpt</strong>",
      },
    ]);

    const posts = await getPosts();

    const { excerpt } = posts.find((p) => p.slug === "psychpricing") || {};

    expect(excerpt).toEqual("wp excerpt");
  });

  it("throws on duplicate slugs", async () => {
    vi.mocked(readSources).mockReturnValue(["padm.us/a", "padm.us/b"]);

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
    vi.mocked(readSources).mockReturnValue(["padm.us/a", "padm.us/b"]);

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
