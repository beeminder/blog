import { describe, it, expect } from "vitest";
import parseMarkdown from "./parseMarkdown";

describe("parseMarkdown", () => {
  it("returns html", () => {
    const { content } = parseMarkdown("hello world");

    expect(content).toBe("<p>hello world</p>\n");
  });

  it("uses smartypants", () => {
    const { content } = parseMarkdown('"hello world"');

    expect(content).toBe("<p>&#8220;hello world&#8221;</p>\n");
  });

  it("does not require new line after html element", () => {
    const { content } = parseMarkdown(`
<h1>heading</h1>
paragraph
`);

    expect(content).toContain("<p>");
  });

  it("allows for PHP Markdown Extra-style IDs", () => {
    const { content } = parseMarkdown("# heading {#id}");

    expect(content).toContain('<h1 id="id">heading</h1>');
  });
});
