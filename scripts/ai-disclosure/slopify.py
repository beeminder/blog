"""Bake a red AI-disclosure caption into an image, in place or to a new path.
By Fable under dreev's direction.

Usage: python3 slopify.py input.png [output.png]
"""

import sys
from PIL import Image, ImageDraw, ImageFont

# Text by dreev
CAPTION = "Disclosure: This image (but none of the surrounding words) is AI slop"
RED = (222, 32, 32)
STROKE = (255, 255, 255)

FONT_PATHS = [
    "/System/Library/Fonts/Supplemental/Courier New Bold.ttf",
    "/System/Library/Fonts/Menlo.ttc",
    "/System/Library/Fonts/Monaco.ttf",
]


def load_font(size: int) -> ImageFont.FreeTypeFont:
    for p in FONT_PATHS:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    raise AssertionError("No monospace font found; add one to FONT_PATHS")


def wrap(caption: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    line = ""
    for word in caption.split():
        trial = f"{line} {word}".strip()
        if font.getlength(trial) <= max_width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


def slopify(src: str, dst: str) -> None:
    im = Image.open(src)
    if im.mode == "P":
        im = im.convert("RGBA")
    assert im.mode in ("RGB", "RGBA"), f"Unhandled image mode {im.mode}: {src}"
    w, h = im.size
    size = max(12, w // 28)
    font = load_font(size)
    margin = size
    lines = wrap(CAPTION, font, w - 2 * margin)
    draw = ImageDraw.Draw(im)
    line_h = int(size * 1.6)
    y = h - margin // 2 - line_h * len(lines)
    assert y > 0, f"Image too short for caption: {w}x{h}: {src}"
    for line in lines:
        x = w - margin - int(font.getlength(line))
        draw.text((x, y), line, font=font, fill=RED,
                  stroke_width=max(1, size // 12), stroke_fill=STROKE)
        y += line_h
    im.save(dst)


if __name__ == "__main__":
    assert len(sys.argv) in (2, 3), __doc__
    slopify(sys.argv[1], sys.argv[-1])
