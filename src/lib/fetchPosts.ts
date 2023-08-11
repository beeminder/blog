import type { PostInput } from "../schemas/post";
import fetchPost from "./fetchPost";
import readSources from "./readSources";

export default async function fetchPosts(): Promise<PostInput[]> {
  const urls = readSources();
  const inputs: PostInput[] = [];

  console.time("Fetching markdown from Etherpad");
  for (const url of urls) {
    inputs.push({
      url,
      md: await fetchPost(url),
    });
  }
  console.timeEnd("Fetching markdown from Etherpad");

  return inputs;
}
