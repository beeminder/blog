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
});
