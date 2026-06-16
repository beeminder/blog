// Tag-name canonicalisation, shared by the tag listing (getTags) and the
// redirect table (getRedirects). Both modules need the same two rules — tags
// are matched case-insensitively, and a space in a tag name is encoded as "+"
// in its URL — so they live here in one place and cannot drift apart.

/** Canonical, case-insensitive form of a tag name. */
export function normalizeTagName(tag: string): string {
  return tag.toLowerCase();
}

/**
 * The "+"-encoded slug for a tag, or `null` when the tag needs no encoding
 * (i.e. it contains no spaces, so its slug already equals its name).
 */
export function tagRedirectSlug(tag: string): string | null {
  return tag.includes(" ") ? tag.replace(/ /g, "+") : null;
}
