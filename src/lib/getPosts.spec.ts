import getPosts from "./getPosts";
import { describe, it, expect, vi, beforeEach } from "vitest";
import fetchPost from "./fetchPost";
import readSources from "./readSources";
import ether from "./test/ether";
import meta from "./test/meta";
import { getCollection } from "astro:content";

describe("getPosts", () => {
  beforeEach(() => {
    vi.mocked(getCollection).mockResolvedValue([
      {
        data: {
          ...meta(),
          md: ether(),
        },
      },
    ] as any);
  });

  it("includes excerpts", async () => {
    vi.mocked(getCollection).mockResolvedValue([
      {
        data: {
          ...meta({
            excerpt: undefined,
          }),
          md: ether({
            content: "word",
            frontmatter: {
              excerpt: "MAGIC_AUTO_EXTRACT",
            },
          }),
        },
      },
    ] as any);

    const posts = await getPosts();

    expect(posts[0]?.excerpt).toContain("word");
  });

  it("excludes unpublished posts by default", async () => {
    vi.mocked(getCollection).mockResolvedValue([
      {
        data: {
          ...meta({
            status: "draft",
          }),
          md: ether(),
        },
      },
    ] as any);

    const posts = await getPosts();

    expect(posts).toHaveLength(0);
  });

  it("includes unpublished posts when requested", async () => {
    vi.mocked(getCollection).mockResolvedValue([
      {
        data: {
          ...meta({
            status: "draft",
          }),
          md: ether(),
        },
      },
    ] as any);

    const posts = await getPosts({ includeUnpublished: true });

    expect(posts).toHaveLength(1);
  });

  it("sets disqus id", async () => {
    const posts = await getPosts();
    const result = posts[0];

    expect(result?.disqus_id).toContain("the_disqus_id");
  });

  it("includes date_string", async () => {
    const posts = await getPosts();
    const result = posts[0];

    expect(result?.date_string).toEqual("2011-01-24");
  });

  it("extracts image url", async () => {
    vi.mocked(getCollection).mockResolvedValue([
      {
        data: {
          ...meta(),
          md: ether({
            content: '<img src="https://example.com/image.png" />',
          }),
        },
      },
    ] as any);

    const posts = await getPosts();
    const result = posts[0];

    expect(result?.image?.src).toEqual("https://example.com/image.png");
  });

  it("uses frontmatter title", async () => {
    vi.mocked(readSources).mockReturnValue([meta({ title: undefined })]);

    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        frontmatter: {
          title: "Hello",
        },
      }),
    );

    const posts = await getPosts();
    const result = posts[0];

    expect(result?.title).toEqual("Hello");
  });

  it("uses frontmatter author", async () => {
    vi.mocked(readSources).mockReturnValue([meta({ author: undefined })]);

    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        frontmatter: {
          author: "Alice",
        },
      }),
    );

    const posts = await getPosts();
    const result = posts[0];

    expect(result?.author).toEqual("Alice");
  });

  it("uses frontmatter excerpt", async () => {
    vi.mocked(readSources).mockReturnValue([meta({ excerpt: undefined })]);
    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        frontmatter: {
          excerpt: "Hello",
        },
      }),
    );

    const posts = await getPosts();
    const result = posts[0];

    expect(result?.excerpt).toEqual("Hello");
  });

  it("uses frontmatter tags", async () => {
    vi.mocked(readSources).mockReturnValue([meta({ tags: undefined })]);
    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        frontmatter: {
          tags: ["a", "b", "c"],
        },
      }),
    );

    const posts = await getPosts();
    const result = posts[0];

    expect(result?.tags).toEqual(expect.arrayContaining(["a", "b", "c"]));
  });

  it("uses frontmatter date", async () => {
    vi.mocked(readSources).mockReturnValue([meta({ date: undefined })]);
    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        frontmatter: {
          date: new Date("2021-09-02"),
        },
      }),
    );

    const posts = await getPosts();
    const result = posts[0];

    expect(result?.date_string).toEqual("2021-09-02");
  });

  it("uses frontmatter slug", async () => {
    vi.mocked(readSources).mockReturnValue([meta({ slug: undefined })]);
    vi.mocked(fetchPost).mockResolvedValue(
      ether({
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
    const result = posts[0];

    expect(result?.status).toEqual("publish");
  });

  it("uses frontmatter status", async () => {
    vi.mocked(readSources).mockReturnValue([meta({ status: undefined })]);
    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        frontmatter: {
          status: "publish",
        },
      }),
    );

    const posts = await getPosts();
    const result = posts[0];

    expect(result?.status).toEqual("publish");
  });

  it("returns html", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        content: "hello world",
      }),
    );

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toBe("<p>hello world</p>\n");
  });

  it("uses smartypants", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        content: '"hello world"',
      }),
    );

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain("&#8220;hello world&#8221;");
  });

  it("does not require new line after html element", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        content: `
<h1>heading</h1>
paragraph
`,
      }),
    );

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain("<p>");
  });

  it("allows for PHP Markdown Extra-style IDs", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        content: "# heading {#id}",
      }),
    );

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain('<h1 id="id">heading</h1>');
  });

  it("handles id properly", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        content: "## More Real-World Commitment Devices  {#AUG}",
      }),
    );

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain('id="AUG"');
  });

  it("handles multiple IDs", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        content: `
## What Commitment Devices Have You Used on Yourself? {#POL}

## More Real-World Commitment Devices  {#AUG}
`,
      }),
    );

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain('id="POL"');
    expect(content).toContain('id="AUG"');
  });

  it("supports link nonsense", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        content: `
[paying is not punishment](
https://blog.beeminder.com/depunish
"Our paying-is-not-punishment post is also a prequel to our announcement of No-Excuses Mode"
) because
      `,
      }),
    );

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain('href="https://blog.beeminder.com/depunish"');
  });

  it("links footnotes", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        content: "$FN[foo] $FN[foo]",
      }),
    );

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain(
      '<a class="footnote" id="foo1" href="#foo">[1]</a>',
    );
  });

  it("links footnotes with trailing number", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        content: `$FN[foo]
        some text $DC2: some more text,
        
        $FN[DC2]
        some more text`,
      }),
    );

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain('<a class="footnote" id="DC21" href="#DC2">');
  });

  it("separately links subscring footnote ids", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        content: `$FN[DC]
        We computer scientists call this the principle of delayed commitment $DC2: commitment is bad, all else equal.
        Why do today what only might need to be done tomorrow?
        
        $FN[DC2]
        This is a footnote about commitment.`,
      }),
    );

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain('<a class="footnote" id="DC21" href="#DC2">');
  });

  it("expands refs", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        content: "$REF[foo] $REF[bar]",
      }),
    );

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain("2");
  });

  it("parses frontmatter", async () => {
    vi.mocked(readSources).mockReturnValue([meta({ slug: undefined })]);
    vi.mocked(fetchPost).mockResolvedValue(
      ether({
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
    vi.mocked(readSources).mockReturnValue([meta({ excerpt: "wp excerpt" })]);

    const posts = await getPosts();

    const { excerpt } = posts[0] || {};

    expect(excerpt).toEqual("wp excerpt");
  });

  it("strips html from wp excerpts", async () => {
    vi.mocked(readSources).mockReturnValue([
      meta({ excerpt: "<strong>wp excerpt</strong>" }),
    ]);

    const posts = await getPosts();

    const { excerpt } = posts[0] || {};

    expect(excerpt).toEqual("wp excerpt");
  });

  it("throws on duplicate slugs", async () => {
    vi.mocked(readSources).mockReturnValue([
      { source: "doc.bmndr.co/a" },
      { source: "doc.bmndr.co/b" },
    ]);

    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        frontmatter: meta({
          slug: "the_slug",
          date: new Date(),
        }),
      }),
    );

    await expect(getPosts()).rejects.toThrow(/Duplicate slug/);
  });

  it("throws on duplicate disqus IDs", async () => {
    vi.mocked(readSources).mockReturnValue([
      { source: "doc.bmndr.co/a" },
      { source: "doc.bmndr.co/b" },
    ]);

    vi.mocked(fetchPost).mockResolvedValueOnce(
      ether({
        frontmatter: meta({
          disqus_id: "the_disqus_id",
          date: new Date(),
        }),
      }),
    );

    vi.mocked(fetchPost).mockResolvedValueOnce(
      ether({
        frontmatter: meta({
          disqus_id: "the_disqus_id",
          date: new Date(),
        }),
      }),
    );

    await expect(getPosts()).rejects.toThrow(/Duplicate disqus/);
  });
  it("gets Collection", async () => {
    await getPosts();
    expect(getCollection).toBeCalled();
  });
});
