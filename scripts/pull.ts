import fs from "fs";
import path from "path";
import "dotenv/config";
import fetchPosts from "../src/lib/fetchPosts";

const promises = fetchPosts();
const dir = "./src/content/posts";

console.log("Delete the directory if it does exist");
if (fs.existsSync(dir)) {
  fs.rmdirSync(dir, { recursive: true });
}

console.log("Create directory");
fs.mkdirSync(dir, { recursive: true });

promises.forEach((p) => {
  p.then((post) => {
    console.log(post.slug, post.source);
    if (!post.slug) {
      return;
    }
    fs.writeFileSync(
      path.join(dir, `${String(post.slug)}.md`),
      String(post.md),
    );
  });
});
