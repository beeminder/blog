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
});
