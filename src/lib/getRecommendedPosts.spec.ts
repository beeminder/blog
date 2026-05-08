import { describe, it, expect } from "vitest";
import getRecommendedPosts from "./getRecommendedPosts";
import type { Post } from "../schemas/post";

function makePost(overrides: Partial<Post> & { slug: string }): Post {
  return {
    slug: overrides.slug,
    title: overrides.title ?? `title-${overrides.slug}`,
    content: overrides.content ?? "",
    excerpt: overrides.excerpt ?? "",
    image: overrides.image,
    tags: overrides.tags ?? [],
    redirects: overrides.redirects ?? [],
    date: overrides.date ?? new Date("2020-01-01"),
    date_string: overrides.date_string ?? "2020-01-01",
    author: overrides.author ?? "the_author",
    status: overrides.status ?? "publish",
    disqus_id: overrides.disqus_id ?? `disqus-${overrides.slug}`,
    md: overrides.md ?? "",
  } as Post;
}

describe("getRecommendedPosts", () => {
  it("prefers posts with more shared tags", () => {
    const source = makePost({ slug: "source", tags: ["a", "b", "c"] });
    const oneShared = makePost({ slug: "one", tags: ["a"] });
    const twoShared = makePost({ slug: "two", tags: ["a", "b"] });
    const threeShared = makePost({ slug: "three", tags: ["a", "b", "c"] });

    const result = getRecommendedPosts(source, [
      source,
      oneShared,
      twoShared,
      threeShared,
    ]);

    expect(result.map((p) => p.slug)).toEqual(["three", "two", "one"]);
  });

  it("tiebreaks by most recent date when scores are equal", () => {
    const source = makePost({ slug: "source", tags: ["a"] });
    const older = makePost({
      slug: "older",
      tags: ["a"],
      date: new Date("2020-01-01"),
    });
    const newer = makePost({
      slug: "newer",
      tags: ["a"],
      date: new Date("2023-01-01"),
    });

    const result = getRecommendedPosts(source, [source, older, newer]);

    expect(result.map((p) => p.slug)).toEqual(["newer", "older"]);
  });

  it("caps at 6 posts", () => {
    const source = makePost({ slug: "source", tags: ["a"] });
    const others = Array.from({ length: 10 }, (_, i) =>
      makePost({ slug: `p${i}`, tags: ["a"] }),
    );

    const result = getRecommendedPosts(source, [source, ...others]);

    expect(result).toHaveLength(6);
  });

  it("excludes the source post itself", () => {
    const source = makePost({ slug: "source", tags: ["a", "b"] });
    const other = makePost({ slug: "other", tags: ["a"] });

    const result = getRecommendedPosts(source, [source, other]);

    expect(result.map((p) => p.slug)).not.toContain("source");
    expect(result.map((p) => p.slug)).toEqual(["other"]);
  });

  it("returns empty array when no posts share tags", () => {
    const source = makePost({ slug: "source", tags: ["a"] });
    const unrelated = makePost({ slug: "other", tags: ["b"] });

    const result = getRecommendedPosts(source, [source, unrelated]);

    expect(result).toEqual([]);
  });
});
