export default function meta(
  fields: Record<string, unknown> = {},
): Record<string, unknown> {
  const id = Math.random().toString(36).slice(2, 9);
  const obj = {
    source: `doc.bmndr.co/the_source_${id}`,
    date: "2011-01-24",
    slug: `the_slug_${id}`,
    status: "publish",
    author: "the_author",
    excerpt: `the_excerpt_${id}`,
    disqus_id: `the_disqus_id_${id}`,
    redirects: [],
    tags: [],
    ...fields,
  };

  Object.keys(obj).forEach((key: any) =>
    (obj as any)[key] === undefined ? delete (obj as any)[key] : {},
  );

  return obj;
}
