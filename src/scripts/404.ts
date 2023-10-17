import type { Post } from "../schemas/post";
import Levenshtein from "levenshtein";

const { posts } = window as unknown as {
  posts: Post[];
};

// en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance
function levenshtein(a: string, b: string): number {
  const l = new Levenshtein(a, b);
  return l.distance;
}

const sadslug = location.pathname.slice(1); // the thing that's 404ing
const links1 = posts.filter((p) => p.slug.startsWith(sadslug));
const links2 = posts.filter((p) => p.slug.endsWith(sadslug));
const ul = document.querySelector("#nearmisses");

if (!ul) {
  throw new Error("Couldn't find #nearmisses");
}

ul.appendChild(document.createElement("li")).innerHTML =
  `<code>blog.beeminder.com/${sadslug}</code> &nbsp; &mdash; &nbsp; ` +
  `what you typed or clicked on`;

for (const l of links1.concat(links2)) {
  ul.appendChild(document.createElement("li")).innerHTML =
    `<a href="${l.slug}" title="${l.excerpt}">` +
    `<code>blog.beeminder.com/${l.slug}</code>` +
    `</a> &nbsp; &mdash; &nbsp; ${l.title}`;
}

if (links1.length === 0 && links2.length === 0) {
  // Find the post with the closest slug to the sad one that's 404'ing
  let cpost;
  let edist = Infinity; // minimum edit distance across all slugs in the archive
  for (const p of posts) {
    const dist = levenshtein(sadslug, p.slug);
    if (dist <= edist) {
      edist = dist;
      cpost = p;
    } // break ties by recency
  }

  if (!cpost) {
    throw new Error("Couldn't find a closest post");
  }

  ul.appendChild(document.createElement("li")).innerHTML =
    `<a href="/${cpost.slug}" title="We're suggesting this because ` +
    `“${cpost.slug}” has a Levenshtein edit distance of ${edist} from ` +
    `“${sadslug}” -- the smallest in the archives. ` +
    `Excerpt: ${cpost.excerpt}">` +
    `<code>blog.beeminder.com/${cpost.slug}</code>` +
    `</a> &nbsp; &mdash; &nbsp; ${cpost.title}`;
  // Or maybe if cpost is too far away, do this instead:
  // ul.appendChild(document.createElement('li')).innerHTML =
  //   "(actually we've no idea what you might've meant here, sorry)";
}
