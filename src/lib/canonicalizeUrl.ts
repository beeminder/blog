import env from "./env";

const DOMAINS = [
  "etherpad",
  "doc.bmndr.co",
  "doc.bmndr.com",
  "doc.beeminder.com",
];

export default function canonicalizeUrl(url: string): string {
  const domain = env("ETHERPAD_DOMAIN");

  if (!domain) throw new Error("ETHERPAD_DOMAIN is not set");

  url = url.trim();

  if (!url.match(/^https?:\/\//i)) url = `https://${url}`;

  const _url = new URL(url);

  _url.pathname = _url.pathname.replace(/\/+$/, "");

  if (DOMAINS.includes(_url.hostname)) {
    _url.hostname = domain;
    _url.pathname = `${_url.pathname}/export/txt`;
  }

  return _url.toString();
}
