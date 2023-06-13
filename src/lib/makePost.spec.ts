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
});
