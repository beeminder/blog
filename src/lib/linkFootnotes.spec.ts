import { describe, it, expect } from "vitest";
import linkFootnotes from "./linkFootnotes";

describe("linkFootnotes", () => {
  it("links footnotes", () => {
    const result = linkFootnotes("$FN[foo] $FN[foo]");

    expect(result).toContain(
      '<a class="footnote" id="foo1" href="#foo">[1]</a>'
    );
  });

  it("links last to first", () => {
    const result = linkFootnotes("$FN[foo] $FN[foo]");

    expect(result).toContain(
      '<a class="footnote" id="foo" href="#foo1">[1]</a>'
    );
  });

  it("handles shortened syntax", () => {
    const result = linkFootnotes("$foo $FN[foo]");

    expect(result).toContain(
      '<a class="footnote" id="foo1" href="#foo">[1]</a>'
    );
  });

  it("handles shortened syntax for end note", () => {
    const result = linkFootnotes("$FN[foo] $foo");

    expect(result).toContain(
      '<a class="footnote" id="foo" href="#foo1">[1]</a>'
    );
  });

  it("numbers ref IDs", () => {
    const result = linkFootnotes("$FN[foo] $foo $foo");

    expect(result).toContain(
      '<a class="footnote" id="foo2" href="#foo">[1]</a>'
    );
  });

  it("increments visual ref identifier", () => {
    const result = linkFootnotes("$FN[foo] $foo $FN[bar] $bar");

    expect(result).toContain(
      '<a class="footnote" id="bar1" href="#bar">[2]</a>'
    );
  });
});
