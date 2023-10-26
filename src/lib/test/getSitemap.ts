export default async function getSitemap(): Promise<string[]> {
  console.log("getSitemap");

  const xml: string = await fetch(`http://localhost:4321/sitemap-0.xml`).then(
    (r) => r.text(),
  );

  return xml.match(/<loc>(.*?)<\/loc>/g)?.map((url) => url.slice(5, -6)) ?? [];
}
