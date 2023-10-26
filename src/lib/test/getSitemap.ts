export default async function getSitemap(): Promise<string[]> {
  console.log("getSitemap");

  const response = await fetch(`http://localhost:4321/sitemap-0.xml`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.statusText}`);
  }
  const xml = await response.text();

  console.log(xml);
  return xml.match(/<loc>(.*?)<\/loc>/g)?.map((url) => url.slice(5, -6)) ?? [];
}
