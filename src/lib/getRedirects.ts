import getPosts from "./getPosts";
import getTags from "./getTags";

export default async function getRedirects(): Promise<Record<string, string>> {
  const posts = await getPosts();
  const tags = await getTags();

  const postRedirects = posts.reduce<Record<string, string>>((acc, post) => {
    if (!post.redirects.length) return acc;
    post.redirects.forEach((r) => {
      acc[`/${r}`] = `/${post.slug}`;
    });
    return acc;
  }, {});

  const tagRedirects = tags.reduce<Record<string, string>>((acc, tag) => {
    if (tag.redirect) {
      acc[`/tags/${tag.redirect}`] = `/tags/${tag.name}`;
    }
    acc[`/tag/${tag.name}`] = `/tags/${tag.name}`;
    return acc;
  }, {});

  const authorRedirects: Record<string, string> = {
    "/authors/dreeves": "/authors/dreev",
  };

  return { ...postRedirects, ...tagRedirects, ...authorRedirects };
}
