import { describe, expect, it } from "vitest";
import extractImage from "./extractImage";

describe("extractImage", () => {
  it("extracts src", () => {
    expect(
      extractImage('<img src="https://blog.beeminder.com/image.png" />'),
    ).toEqual({
      src: "https://blog.beeminder.com/image.png",
      alt: "",
      title: "",
      extracted: true,
    });
  });

  it("extracts title", () => {
    expect(
      extractImage(
        '<img src="https://blog.beeminder.com/image.png" title="the_title" />',
      ),
    ).toEqual(expect.objectContaining({ title: "the_title" }));
  });

  it("extracts alt", () => {
    expect(
      extractImage(
        '<img src="https://blog.beeminder.com/image.png" alt="the_alt" />',
      ),
    ).toEqual(expect.objectContaining({ alt: "the_alt" }));
  });

  it("extracts alt and title", () => {
    expect(
      extractImage(
        '<img src="https://blog.beeminder.com/image.png" alt="the_alt" title="the_title" />',
      ),
    ).toEqual(expect.objectContaining({ alt: "the_alt", title: "the_title" }));
  });

  it("keeps an apostrophe inside a double-quoted title", () => {
    expect(
      extractImage(
        '<img src="https://blog.beeminder.com/image.png" title="She\'s behind" />',
      ),
    ).toEqual(expect.objectContaining({ title: "She's behind" }));
  });

  it("keeps a double quote inside a single-quoted title", () => {
    expect(
      extractImage(
        `<img src="https://blog.beeminder.com/image.png" title='He said "hi"' />`,
      ),
    ).toEqual(expect.objectContaining({ title: 'He said "hi"' }));
  });

  it("keeps an apostrophe inside a double-quoted alt", () => {
    expect(
      extractImage(
        '<img src="https://blog.beeminder.com/image.png" alt="Editor\'s note" />',
      ),
    ).toEqual(expect.objectContaining({ alt: "Editor's note" }));
  });

  it("keeps an apostrophe inside a double-quoted src", () => {
    expect(
      extractImage('<img src="https://blog.beeminder.com/it\'s.png" />'),
    ).toEqual(
      expect.objectContaining({ src: "https://blog.beeminder.com/it's.png" }),
    );
  });

  it("keeps a title that spans multiple lines", () => {
    expect(
      extractImage(
        '<img src="https://blog.beeminder.com/image.png" title="line one\nline two" />',
      ),
    ).toEqual(expect.objectContaining({ title: "line one\nline two" }));
  });
});
