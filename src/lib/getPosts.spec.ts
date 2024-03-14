import getPosts from "./getPosts";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ether, { type Ether } from "./test/ether";
import meta from "./test/meta";
import { getCollection } from "astro:content";

const entry = ({
  meta: m = {},
  ether: e = {},
}: {
  meta?: Record<string, unknown>;
  ether?: Ether;
} = {}) => ({
  data: {
    ...meta(m),
    md: ether(e),
  },
});

function loadEntries(entries: Record<string, unknown>[]): void {
  vi.mocked(getCollection).mockResolvedValue(entries as any);
}

describe("getPosts", () => {
  beforeEach(() => {
    loadEntries([entry()]);
  });

  it("includes excerpts", async () => {
    loadEntries([
      entry({
        meta: {
          excerpt: undefined,
        },
        ether: {
          content: "word",
          frontmatter: {
            excerpt: "MAGIC_AUTO_EXTRACT",
          },
        },
      }),
    ]);

    const posts = await getPosts();

    expect(posts[0]?.excerpt).toContain("word");
  });

  it("excludes unpublished posts by default", async () => {
    loadEntries([
      entry({
        meta: {
          status: "draft",
        },
      }),
    ]);

    const posts = await getPosts();

    expect(posts).toHaveLength(0);
  });

  it("includes unpublished posts when requested", async () => {
    loadEntries([
      entry({
        meta: {
          status: "draft",
        },
      }),
    ]);

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
    loadEntries([
      entry({
        ether: {
          content: '<img src="https://example.com/image.png" />',
        },
      }),
    ]);

    const posts = await getPosts();
    const result = posts[0];

    expect(result?.image?.src).toEqual("https://example.com/image.png");
  });

  it("uses frontmatter title", async () => {
    loadEntries([
      entry({
        meta: { title: undefined },
        ether: { frontmatter: { title: "Hello" } },
      }),
    ]);

    const posts = await getPosts();
    const result = posts[0];

    expect(result?.title).toEqual("Hello");
  });

  it("uses frontmatter author", async () => {
    loadEntries([
      entry({
        meta: { author: undefined },
        ether: { frontmatter: { author: "Alice" } },
      }),
    ]);

    const posts = await getPosts();
    const result = posts[0];

    expect(result?.author).toEqual("Alice");
  });

  it("uses frontmatter excerpt", async () => {
    loadEntries([
      entry({
        meta: { excerpt: undefined },
        ether: { frontmatter: { excerpt: "Hello" } },
      }),
    ]);

    const posts = await getPosts();
    const result = posts[0];

    expect(result?.excerpt).toEqual("Hello");
  });

  it("uses frontmatter tags", async () => {
    loadEntries([
      entry({
        meta: { tags: undefined },
        ether: { frontmatter: { tags: ["a", "b", "c"] } },
      }),
    ]);

    const posts = await getPosts();
    const result = posts[0];

    expect(result?.tags).toEqual(expect.arrayContaining(["a", "b", "c"]));
  });

  it("uses frontmatter date", async () => {
    loadEntries([
      entry({
        meta: { date: undefined },
        ether: { frontmatter: { date: new Date("2021-09-02") } },
      }),
    ]);

    const posts = await getPosts();
    const result = posts[0];

    expect(result?.date_string).toEqual("2021-09-02");
  });

  it("uses frontmatter slug", async () => {
    loadEntries([
      entry({
        meta: { slug: undefined },
        ether: { frontmatter: { slug: "hello" } },
      }),
    ]);

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
    loadEntries([
      entry({
        meta: { status: undefined },
        ether: { frontmatter: { status: "publish" } },
      }),
    ]);

    const posts = await getPosts();
    const result = posts[0];

    expect(result?.status).toEqual("publish");
  });

  it("returns html", async () => {
    loadEntries([
      entry({
        ether: {
          content: "hello world",
        },
      }),
    ]);

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toBe("<p>hello world</p>\n");
  });

  it("uses smartypants", async () => {
    loadEntries([
      entry({
        ether: {
          content: '"hello world"',
        },
      }),
    ]);

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain("&#8220;hello world&#8221;");
  });

  it("does not require new line after html element", async () => {
    loadEntries([
      entry({
        ether: {
          content: `
<h1>heading</h1>
paragraph
`,
        },
      }),
    ]);

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain("<p>");
  });

  it("allows for PHP Markdown Extra-style IDs", async () => {
    loadEntries([
      entry({
        ether: {
          content: "# heading {#id}",
        },
      }),
    ]);

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain('<h1 id="id">heading</h1>');
  });

  it("handles id properly", async () => {
    loadEntries([
      entry({
        ether: {
          content: "## More Real-World Commitment Devices  {#AUG}",
        },
      }),
    ]);

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain('id="AUG"');
  });

  it("handles multiple IDs", async () => {
    loadEntries([
      entry({
        ether: {
          content: `
## What Commitment Devices Have You Used on Yourself? {#POL}

## More Real-World Commitment Devices  {#AUG}
`,
        },
      }),
    ]);

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain('id="POL"');
    expect(content).toContain('id="AUG"');
  });

  it("supports link nonsense", async () => {
    loadEntries([
      entry({
        ether: {
          content: `
[paying is not punishment](
https://blog.beeminder.com/depunish
"Our paying-is-not-punishment post is also a prequel to our announcement of No-Excuses Mode"
) because
      `,
        },
      }),
    ]);

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain('href="https://blog.beeminder.com/depunish"');
  });

  it("links footnotes", async () => {
    loadEntries([
      entry({
        ether: {
          content: "$FN[foo] $FN[foo]",
        },
      }),
    ]);

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain(
      '<a class="footnote" id="foo1" href="#foo">[1]</a>',
    );
  });

  it("links footnotes with trailing number", async () => {
    loadEntries([
      entry({
        ether: {
          content: `$FN[foo]
          some text $DC2: some more text,
          
          $FN[DC2]
          some more text`,
        },
      }),
    ]);

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain('<a class="footnote" id="DC21" href="#DC2">');
  });

  it("separately links subscring footnote ids", async () => {
    loadEntries([
      entry({
        ether: {
          content: `$FN[DC]
          We computer scientists call this the principle of delayed commitment $DC2: commitment is bad, all else equal.
          Why do today what only might need to be done tomorrow?
          
          $FN[DC2]
          This is a footnote about commitment.`,
        },
      }),
    ]);

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain('<a class="footnote" id="DC21" href="#DC2">');
  });

  it("expands refs", async () => {
    loadEntries([
      entry({
        ether: {
          content: "$REF[foo] $REF[bar]",
        },
      }),
    ]);

    const posts = await getPosts();
    const { content } = posts[0] || {};

    expect(content).toContain("2");
  });

  it("parses frontmatter", async () => {
    loadEntries([
      entry({
        meta: {
          slug: undefined,
        },
        ether: {
          frontmatter: {
            slug: "val",
          },
        },
      }),
    ]);

    const posts = await getPosts();
    const { slug } = posts.find((p) => p.slug === "val") || {};

    expect(slug).toEqual("val");
  });

  it("uses wordpress excerpt", async () => {
    loadEntries([
      entry({
        meta: {
          excerpt: "wp excerpt",
        },
      }),
    ]);

    const posts = await getPosts();

    const { excerpt } = posts[0] || {};

    expect(excerpt).toEqual("wp excerpt");
  });

  it("strips html from wp excerpts", async () => {
    loadEntries([
      entry({
        meta: {
          excerpt: "<strong>wp excerpt</strong>",
        },
      }),
    ]);

    const posts = await getPosts();

    const { excerpt } = posts[0] || {};

    expect(excerpt).toEqual("wp excerpt");
  });

  it("throws on duplicate slugs", async () => {
    loadEntries([
      entry({
        meta: {
          slug: undefined,
        },
        ether: {
          frontmatter: {
            slug: "the_slug",
          },
        },
      }),
      entry({
        meta: {
          slug: undefined,
        },
        ether: {
          frontmatter: {
            slug: "the_slug",
          },
        },
      }),
    ]);

    await expect(getPosts()).rejects.toThrow(/Duplicate slug/);
  });

  it("throws on duplicate disqus IDs", async () => {
    loadEntries([
      entry({
        meta: {
          disqus_id: undefined,
        },
        ether: { frontmatter: { disqus_id: "the_disqus_id" } },
      }),
      entry({
        meta: {
          disqus_id: undefined,
        },
        ether: { frontmatter: { disqus_id: "the_disqus_id" } },
      }),
    ]);

    await expect(getPosts()).rejects.toThrow(/Duplicate disqus/);
  });

  it("gets Collection", async () => {
    await getPosts();

    expect(getCollection).toBeCalled();
  });
});
