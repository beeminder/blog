# AI-image disclosure tooling

> **Preface: this directory — code, ledger, and this README — was composed by
> Fable (Claude), an AI coding agent, in August 2026.** Which is fitting, since
> its whole purpose is honest labeling of AI-generated content. The humans
> vetted the process and the results; the words in this file are machine-made.

## What this is

Every AI-generated image on blog.beeminder.com gets a red caption baked into
its pixels:

> Disclosure: This image (but none of the surrounding words) is AI slop

Baking into pixels (rather than CSS overlays) means the disclosure travels
with the image into RSS readers, social-card previews, hotlinks, and
right-click-saves.

## How images were identified

1. **DALL-E watermark scan** (`dalle-scan.py`): DALL-E 2 stamps a 5-square
   rainbow strip in the bottom-right corner. The scan samples those squares
   (scale-invariant: square size = width/64) against reference colors with
   tolerance. This found 26 of the archive's images, machine-certain.
2. **Filenames**: DALL-E default download names (`DALL·E-2022-...`),
   `midjourney-*`, and Midjourney's `username_prompt_uuid` pattern.
3. **Visual judgment**: Midjourney doesn't watermark, so unmarked images were
   classified by eye — gibberish text is the most reliable tell, along with
   characteristic render styles. Keyword matching alone is NOT safe: one
   human-drawn image credits DALL-E in its title attribute.

## The pipeline for a confirmed AI image

1. `slopify.py input.png output.png` — bakes the caption (red Courier with a
   white stroke so it survives red/busy backgrounds; size scales with width).
2. The treated file goes in `public/wp-content/uploads/YYYY/MM/` matching the
   post's date, with an evocative greppable name (`ai-book-butterfly.png`).
3. If the pad hotlinked the image from GitHub's CDN, the pad's src URL is
   swapped to the blog copy: `node pad-swap.mjs <padID> <oldURL> <newURL>`.

## pad-swap.mjs: why a headless browser and not the API

The pad server is read from `ETHERPAD_DOMAIN` in the repo `.env` (the literal
domain must never appear in committed files; a pre-commit check enforces this).

The Etherpad HTTP API's `setText` replaces the whole pad as a single author,
**destroying every authorship color in the document** (this happened to /cbt;
it is not recoverable — the instance's Etherpad predates `restoreRevision`).
`pad-swap.mjs` instead drives a headless browser into the pad and calls the
editor's own `ace_performDocumentReplaceRange` on exactly the URL characters,
so authorship survives everywhere else. It refuses to run unless the old URL
appears exactly once, saves a full pre-edit backup to the system temp dir, and
verifies afterward that the export matches the original with only the URL
changed.

## The ledger

`ai-images.txt` lists every treated image, sectioned by how it was identified
(`[watermark]`, `[filename]`, `[visual]`), plus `[probable]` (flagged but
awaiting human confirmation — NOT treated) and `[rehosted]` (treated copies of
images that lived on GitHub's CDN, with their original URLs).

## Notes

- `slopify.py` resolves fonts from macOS paths; adjust `FONT_PATHS` elsewhere.
- Originals of every treated in-place archive image live in git history.
- The pads are world-editable, so `pad-swap.mjs` needs no credentials.
