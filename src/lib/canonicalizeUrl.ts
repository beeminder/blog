import env from "./env";

export default function canonicalizeUrl(url: string): string {
  const domain = env("ETHERPAD_DOMAIN");
  // Start with basic cleanup canonicalization applicable to all URLs...
  url = url.trim(); // trim whitespace
  if (!url.match(/^https?:\/\//i)) url = "https://" + url; // add protocol
  url = url.replace(/\/+$/, ""); // kill trailing slashes
  // TODO: fail loudly if the URL is mangled somehow

  // Now handle syntactic sugar for etherpad URLs:
  const sugarlist = [
    /^(https?:\/\/etherpad)\/([^/]+)$/,
    /^(https?:\/\/doc\.bmndr\.co)\/([^/]+)$/,
    /^(https?:\/\/doc\.bmndr\.com)\/([^/]+)$/,
    /^(https?:\/\/doc\.beeminder\.com)\/([^/]+)$/,
  ];

  for (const regex of sugarlist) {
    url = url.replace(regex, `https://${domain}/$2`);
  }

  // Following is a special case for the raw source URL just in case:
  url = url.replace(
    new RegExp(`^(https?://${domain})$`),
    "$1/public/export/txt",
  );
  // And finally the key transformation: append /export/txt for etherpad:
  url = url.replace(
    new RegExp(`^(https?://${domain})/([^/]+)$`),
    "$1/$2/export/txt",
  );

  return url;
}
