import { describe, it, expect, vi } from "vitest";

describe("readLegacyData", () => {
  it("associates users with posts", async () => {
    const module = await vi.importActual<{
      default: () => Array<Record<string, unknown>>;
    }>("./readLegacyData");

    const posts = module.default();

    expect(posts[0]).toEqual(
      expect.objectContaining({
        user: expect.objectContaining({
          display_name: "dreeves",
        }),
      }),
    );
  });
});
