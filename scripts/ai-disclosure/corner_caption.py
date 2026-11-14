# By Opus under dreev's direction.
# Bake the AI-disclosure caption into one corner of an image, smaller than slopify.py's default and kept
# entirely inside the solid-colour area of that corner.
# Usage: python3 corner_caption.py <in.png> <out.png> <corner: br|bl|tr|tl> [--no-stroke] [--max-size=N]
# The caption text, colour, and font come from scripts/ai-disclosure/slopify.py. Lines are right-aligned
# (left-aligned in a left corner) and filled from the corner outward, so the block follows the curve of
# whatever bounds the solid area. The largest font size whose every line, with padding, sits on pixels of
# the corner's colour wins; if none fits from 13 px down to 8 px, the script stops with an error.
import sys

sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from PIL import Image, ImageDraw  # noqa: E402
import slopify  # noqa: E402

src, dst, corner = sys.argv[1:4]
stroke = "--no-stroke" not in sys.argv[4:]
assert corner in ("br", "bl", "tr", "tl"), corner
im = Image.open(src).convert("RGBA")
w, h = im.size
px = im.convert("RGB").load()
cx = w - 2 if corner[1] == "r" else 1
cy = h - 2 if corner[0] == "b" else 1
base = px[cx, cy]
TOL = 24


def solid(x, y):
    return 0 <= x < w and 0 <= y < h and max(abs(a - b) for a, b in zip(px[x, y], base)) <= TOL


def free_extent(y0, y1, pad):
    """Width of solid colour, measured from the corner's side edge inward, over rows y0..y1 (with pad)."""
    rows = range(max(0, y0 - pad), min(h, y1 + pad + 1))
    xs = range(w - 1, -1, -1) if corner[1] == "r" else range(w)
    run = 0
    for x in xs:
        if all(solid(x, y) for y in rows):
            run += 1
        else:
            break
    return run


def layout(size):
    font = slopify.load_font(size)
    margin = max(3, size // 2)
    pad = 2 + max(1, size // 12)
    line_h = int(size * 1.25)
    words = slopify.CAPTION.split()
    lines = []  # filled from the corner outward
    edge = h - margin if corner[0] == "b" else margin
    while words:
        top = edge - line_h * (len(lines) + 1) if corner[0] == "b" else edge + line_h * len(lines)
        if top < 0 or top + line_h > h:
            return None
        room = free_extent(top, top + line_h, pad) - margin - pad
        take = []
        # Bottom corners fill from the end of the caption, top corners from its start, so it always reads top to bottom.
        source = list(reversed(words)) if corner[0] == "b" else list(words)
        for word in source:
            trial = ([word] + take) if corner[0] == "b" else (take + [word])
            if font.getlength(" ".join(trial)) <= room:
                take = trial
            else:
                break
        if not take:
            return None
        words = words[: len(words) - len(take)] if corner[0] == "b" else words[len(take):]
        lines.append((top, " ".join(take)))
    return font, margin, lines


# --max-size=N caps the font size (to trade size for nicer line breaks).
cap = int(next((a.split("=")[1] for a in sys.argv[4:] if a.startswith("--max-size=")), 13))
for size in range(cap, 7, -1):
    fit = layout(size)
    if fit:
        break
assert fit, "the caption does not fit in the solid corner at 8 px or more"
font, margin, lines = fit
draw = ImageDraw.Draw(im)
for top, text in lines:
    x = w - margin - int(font.getlength(text)) if corner[1] == "r" else margin
    draw.text((x, top), text, font=font, fill=slopify.RED,
              stroke_width=max(1, font.size // 12) if stroke else 0, stroke_fill=slopify.STROKE)
im.save(dst)
order = sorted(lines) if corner[0] == "b" else lines
print(f"{corner}: {font.size} px, corner colour {base}, lines: {[t for _, t in order]}")
