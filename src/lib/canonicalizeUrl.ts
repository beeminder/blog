export default function canonicalizeUrl(url: string): string {
  // Start with basic cleanup canonicalization applicable to all URLs...
  url = url.trim(); // trim whitespace
  if (!url.match(/^https?:\/\//i)) url = "https://" + url // add protocol
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
    url = url.replace(regex, "https://" + "padm" + "." + "us" + "/" + "$2");
  }

  // Following is a special case for the raw padm.us URL just in case:
  url = url.replace(/^(https?:\/\/padm\.us)$/, "$1/public/export/txt");
  // And finally the key transformation: append /export/txt for etherpad:
  url = url.replace(/^(https?:\/\/padm\.us)\/([^\/]+)$/, "$1/$2/export/txt");
  return url;
}
