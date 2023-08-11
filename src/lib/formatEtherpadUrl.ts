export default function formatEtherpadUrl(url: string): string {
  url = url.replace("dtherpad.com", "<etherpad-host>");
  url = url.startsWith("http") ? url : `https://${url}`;
  return url;
}
