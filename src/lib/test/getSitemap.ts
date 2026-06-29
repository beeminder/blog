export default async function getSitemap(
  base = "http://localhost:4321",
): Promise<string[]> {
  const response = await fetch(`${base}/sitemap-0.xml`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.statusText}`);
  }
  const xml: string = await response.text();

  return xml.match(/<loc>(.*?)<\/loc>/g)?.map((url) => url.slice(5, -6)) ?? [];
}
