import { describe, it, expect, vi, beforeEach } from "vitest";
import makePost from "./makePost";
import fetchPost from "./fetchPost";
import loadLegacyData from "./test/loadLegacyData";

describe("makePost", () => {
  beforeEach(() => {
    loadLegacyData([
      {
        expost_source_url: "https://padm.us/psychpricing",
        ID: "14",
        Slug: "psychpricing",
        Date: "2021-09-01",
        Status: "publish",
      },
    ]);
  });

  it("sets disqus id", async () => {
    const result = await makePost("https://padm.us/psychpricing");

    expect(result.disqus.id).toBe("14 https://blog.beeminder.com/?p=14");
  });

  it("sets disqus url", async () => {
    const result = await makePost("https://padm.us/psychpricing");

    expect(result.disqus.url).toBe("https://blog.beeminder.com/psychpricing/");
  });

  it("includes date_string", async () => {
    const result = await makePost("https://padm.us/psychpricing");

    expect(result.date_string).toEqual("2021-09-01");
  });

  it("extracts image url", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      '<img src="https://example.com/image.png" />'
    );

    const result = await makePost("https://padm.us/psychpricing");

    expect(result.image?.src).toEqual("https://example.com/image.png");
  });

  it("uses frontmatter title", async () => {
    vi.mocked(fetchPost).mockResolvedValue("---\ntitle: Hello\n---\n\n# World");

    const result = await makePost("https://padm.us/psychpricing");

    expect(result.title).toEqual("Hello");
  });

  it("uses frontmatter author", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      "---\nauthor: Alice\n---\n\n# World"
    );

    const result = await makePost("https://padm.us/psychpricing");

    expect(result.author).toEqual("Alice");
  });

  it("uses frontmatter excerpt", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      "---\nexcerpt: Hello\n---\n\n# World"
    );

    const result = await makePost("https://padm.us/psychpricing");

    expect(result.excerpt).toEqual("Hello");
  });

  it("uses frontmatter tags", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      "---\ntags:\n- a\n- b\n- c\n---\n\n# World"
    );

    const result = await makePost("https://padm.us/psychpricing");

    expect(result.tags).toEqual(expect.arrayContaining(["a", "b", "c"]));
  });

  it("uses frontmatter date", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      "---\ndate: 2021-09-02\n---\n\n# World"
    );

    const result = await makePost("https://padm.us/psychpricing");

    expect(result.date_string).toEqual("2021-09-02");
  });

  it("uses frontmatter slug", async () => {
    vi.mocked(fetchPost).mockResolvedValue("---\nslug: hello\n---\n\n# World");

    const result = await makePost("https://padm.us/psychpricing");

    expect(result.slug).toEqual("hello");
  });

  it("uses frontmatter image", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      "---\nimage:\n  src: https://example.com/image.png\n---\n\n# World"
    );

    const result = await makePost("https://padm.us/psychpricing");

    expect(result.image?.src).toEqual("https://example.com/image.png");
  });

  it("uses legacy status", async () => {
    const result = await makePost("https://padm.us/psychpricing");

    expect(result.status).toEqual("publish");
  });

  it("uses frontmatter status", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      "---\nstatus: publish\n---\n\n# World"
    );

    const result = await makePost("https://padm.us/psychpricing");

    expect(result.status).toEqual("publish");
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

    vi.mocked(fetchPost).mockResolvedValue("BEGIN_MAGIC[magic_title]");

    const result = await makePost("https://padm.us/psychpricing");

    expect(result.title).toEqual("wp_title");
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
      "---\ntitle: frontmatter_title\n---\n\n# World"
    );

    const result = await makePost("https://padm.us/psychpricing");

    expect(result.title).toEqual("frontmatter_title");
  });

  it("returns html", async () => {
    vi.mocked(fetchPost).mockResolvedValue("hello world");

    const { content } = await makePost("https://padm.us/psychpricing");

    expect(content).toBe("<p>hello world</p>\n");
  });

  it("uses smartypants", async () => {
    vi.mocked(fetchPost).mockResolvedValue('"hello world"');

    const { content } = await makePost("https://padm.us/psychpricing");

    expect(content).toBe("<p>&#8220;hello world&#8221;</p>\n");
  });

  it("does not require new line after html element", async () => {
    vi.mocked(fetchPost).mockResolvedValue(`
<h1>heading</h1>
paragraph
`);

    const { content } = await makePost("https://padm.us/psychpricing");

    expect(content).toContain("<p>");
  });

  it("allows for PHP Markdown Extra-style IDs", async () => {
    vi.mocked(fetchPost).mockResolvedValue("# heading {#id}");

    const { content } = await makePost("https://padm.us/psychpricing");

    expect(content).toContain('<h1 id="id">heading</h1>');
  });

  it("handles id properly", async () => {
    vi.mocked(fetchPost).mockResolvedValue(
      "## More Real-World Commitment Devices  {#AUG}"
    );

    const { content } = await makePost("https://padm.us/psychpricing");

    expect(content).toContain('id="AUG"');
  });

  it("handles multiple IDs", async () => {
    vi.mocked(fetchPost).mockResolvedValue(`
## What Commitment Devices Have You Used on Yourself? {#POL}

## More Real-World Commitment Devices  {#AUG}
`);

    const { content } = await makePost("https://padm.us/psychpricing");

    expect(content).toContain('id="POL"');
    expect(content).toContain('id="AUG"');
  });

  it("supports link nonsense", async () => {
    vi.mocked(fetchPost).mockResolvedValue(`
[paying is not punishment](
  https://blog.beeminder.com/depunish
  "Our paying-is-not-punishment post is also a prequel to our announcement of No-Excuses Mode"
) because
`);

    const { content } = await makePost("https://padm.us/psychpricing");

    expect(content).toContain('href="https://blog.beeminder.com/depunish"');
  });

  it("links footnotes", async () => {
    vi.mocked(fetchPost).mockResolvedValue("$FN[foo] $FN[foo]");

    const { content } = await makePost("https://padm.us/psychpricing");

    expect(content).toContain(
      '<a class="footnote" id="foo1" href="#foo">[1]</a>'
    );
  });

  it("expands refs", async () => {
    vi.mocked(fetchPost).mockResolvedValue("$REF[foo] $REF[bar]");

    const { content } = await makePost("https://padm.us/psychpricing");

    expect(content).toContain("2");
  });

  it("parses frontmatter", async () => {
    vi.mocked(fetchPost).mockResolvedValue("---\nslug: val\n---");

    const { slug } = await makePost("https://padm.us/psychpricing");

    expect(slug).toEqual("val");
  });

  it("parses frontmatter with magic present", async () => {
    vi.mocked(fetchPost).mockResolvedValue(`---
slug: val
---
BEGIN_MAGIC
`);

    const { slug } = await makePost("https://padm.us/psychpricing");

    expect(slug).toEqual("val");
  });
});
