import { describe, expect, it } from "vitest";
import { image } from "./image";

describe("image", () => {
  it("accepts title", () => {
    const r = image.parse({
      src: "https://example.com/image.png",
      title: "title text",
    });

    expect(r).toEqual(
      expect.objectContaining({
        title: "title text",
      }),
    );
  });

  it("uses alt as default for title", () => {
    const r = image.parse({
      src: "https://example.com/image.png",
      alt: "alt text",
    });

    expect(r).toEqual(
      expect.objectContaining({
        title: "alt text",
      }),
    );
  });
});
