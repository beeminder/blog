import getPosts from "./getPosts";

export default async function getRedirects(): Promise<Record<string, string>> {
  const posts = await getPosts();

  return posts.reduce<Record<string, string>>((acc, post) => {
    if (!post.redirects.length) return acc;
    post.redirects.forEach((r) => {
      acc[`/${r}`] = `/${post.slug}`;
    });
    return acc;
  }, {});
}
