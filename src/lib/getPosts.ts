import meta from "../../wp-export.csv";
import fs from "fs";

function formatUrl(url: string) {
  const hasSchema = url.startsWith("http");
  const isDtherpad = url.includes("dtherpad.com");

  if (isDtherpad) {
    url = url.replace("dtherpad.com", "padm.us");
  }

  return hasSchema ? url : `https://${url}`;
}

export default function getPosts() {
  const sources = fs.readFileSync("sources.txt", "utf-8");
  const urls = sources.split("\n");

  return urls.map((url) => ({
    url: formatUrl(url),
    exportUrl: `${formatUrl(url)}/export/txt`,
    wp: meta.find((p) => p.expost_source_url === url),
  }));
}
