import { describe, it, expect, vi } from "vitest";
import makePost from "./makePost";
import getLegacyData from "./getLegacyData";

describe("makePost", () => {
  it("sets disqus id", async () => {
    vi.mocked(getLegacyData).mockResolvedValue({
      ID: 14,
      Slug: "psychpricing",
    });

    const result = await makePost("https://padm.us/psychpricing");

    expect(result.disqus.id).toBe("14 https://blog.beeminder.com/?p=14");
  });

  it("sets disqus url", async () => {
    vi.mocked(getLegacyData).mockResolvedValue({
      ID: 14,
      Slug: "psychpricing",
    });

    const result = await makePost("https://padm.us/psychpricing");

    expect(result.disqus.url).toBe("https://blog.beeminder.com/psychpricing/");
  });
});
