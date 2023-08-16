export default function canonicalizeUrl(url: string): string {
  url = url.trim();
  url = url.startsWith("http") ? url : `https://${url}`;
  // TODO: assert that the url now starts with http:// or https://
  // we want to fail loudly here if the URL is mangled somehow
  url = url.replace(/\/+$/, ""); // kill trailing slashes
  // following is a special case for the raw padm.us URL just in case
  url = url.replace(/^(https?:\/\/padm\.us)$/, "$1/public/export/txt");
  // following is the key transformation: append /export/txt to the URL
  url = url.replace(/^(https?:\/\/padm\.us)\/([^/]+)$/, "$1/$2/export/txt");
  return url;
}
