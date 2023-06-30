import { describe, it, expect, vi, beforeEach } from "vitest";
import makePost from "./makePost";
import getLegacyData from "./getLegacyData";
import fetchPost from "./fetchPost";

describe("makePost", () => {
  beforeEach(() => {
    vi.mocked(getLegacyData).mockResolvedValue({
      ID: 14,
      Slug: "psychpricing",
      Date: "2021-09-01",
      Status: "publish",
    });
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

    expect(result.tags).toEqual(["a", "b", "c"]);
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
});
