import getPosts from "./getPosts";
import { describe, it, expect, vi, beforeEach } from "vitest";
import fetchPost from "./fetchPost";
import readSources from "./readSources";
import ether from "./test/ether";
import meta from "./test/meta";

describe("getPosts", () => {
  beforeEach(() => {
    vi.mocked(readSources).mockReturnValue([meta()]);
    vi.mocked(fetchPost).mockResolvedValue(ether());
  });

  it("only loads sources once", async () => {
    await getPosts();
    await getPosts();

    expect(readSources).toHaveBeenCalledTimes(1);
  });

  it("fetches post content", async () => {
    await getPosts();

    expect(fetchPost).toBeCalledWith(expect.stringContaining("the_source"));
  });

  it("sorts post by date descending", async () => {
    vi.mocked(readSources).mockReturnValue([
      meta({ source: "new", date: "2013-02-22" }),
      meta({ source: "old", date: "2013-02-21" }),
    ]);

    await getPosts();

    expect(fetchPost).toBeCalledWith(expect.stringContaining("new"));
  });

  it("includes excerpts", async () => {
    vi.mocked(readSources).mockReturnValue([
      meta({ excerpt: "MAGIC_AUTO_EXTRACT" }),
    ]);

    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        content: "word",
      }),
    );

    const posts = await getPosts();

    expect(posts[0]?.excerpt).toContain("word");
  });

  it("excludes unpublished posts by default", async () => {
    vi.mocked(readSources).mockReturnValue([meta({ status: "draft" })]);

    const posts = await getPosts();

    expect(posts).toHaveLength(0);
  });

  it("includes unpublished posts when requested", async () => {
    vi.mocked(readSources).mockReturnValue([meta({ status: "draft" })]);

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
    const result = posts[0];

    expect(result?.disqus_id).toContain("the_disqus_id");
  });

  it("includes date_string", async () => {
    const posts = await getPosts();
    const result = posts[0];

    expect(result?.date_string).toEqual("2011-01-24");
  });

  it("extracts image url", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      ether({
        content: '<img src="https://example.com/image.png" />',
      }),
    );

    const posts = await getPosts();
    const result = posts[0];

    expect(result?.image?.src).toEqual("https://example.com/image.png");
  });

  it("uses legacy status", async () => {
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
      meta({ source: "doc.bmndr.co/a", slug: "the_slug", date: "2020-01-01" }),
      meta({ source: "doc.bmndr.co/b", slug: "the_slug", date: "2020-01-01" }),
    ]);

    await expect(getPosts()).rejects.toThrow(/Duplicate slug/);
  });

  it("throws on duplicate disqus IDs", async () => {
    vi.mocked(readSources).mockReturnValue([
      meta({
        source: "doc.bmndr.co/a",
        date: "2020-01-01",
        disqus_id: "the_disqus_id",
      }),
      meta({
        source: "doc.bmndr.co/b",
        date: "2020-01-01",
        disqus_id: "the_disqus_id",
      }),
    ]);

    await expect(getPosts()).rejects.toThrow(/Duplicate disqus/);
  });
});
