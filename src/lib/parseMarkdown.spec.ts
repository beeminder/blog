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

  it("handles id properly", () => {
    const { content } = parseMarkdown(
      "## More Real-World Commitment Devices  {#AUG}"
    );

    expect(content).toContain('id="AUG"');
  });

  it("handles multiple IDs", () => {
    const { content } = parseMarkdown(`
## What Commitment Devices Have You Used on Yourself? {#POL}

## More Real-World Commitment Devices  {#AUG}
`);

    expect(content).toContain('id="POL"');
    expect(content).toContain('id="AUG"');
  });

  it("supports link nonsense", () => {
    const { content } = parseMarkdown(`
[paying is not punishment](
  https://blog.beeminder.com/depunish
  "Our paying-is-not-punishment post is also a prequel to our announcement of No-Excuses Mode"
) because
`);
    expect(content).toContain('href="https://blog.beeminder.com/depunish"');
  });

  it("links footnotes", () => {
    const { content } = parseMarkdown("$FN[foo] $FN[foo]");

    expect(content).toContain(
      '<a class="footnote" id="foo1" href="#foo">[1]</a>'
    );
  });

  it("expands refs", () => {
    const { content } = parseMarkdown("$REF[foo] $REF[bar]");

    expect(content).toContain("2");
  });
});
