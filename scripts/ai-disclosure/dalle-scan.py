# By Fable under dreev's direction

import os, sys
from PIL import Image

REF = [(255,254,102),(66,255,255),(80,218,76),(255,110,61),(61,70,255)]
TOL = 70

def close(a, b):
    return all(abs(x-y) <= TOL for x, y in zip(a, b))

def has_watermark(path):
    try:
        im = Image.open(path).convert("RGB")
    except Exception:
        return False
    w, h = im.size
    if w < 64 or h < 16:
        return False
    for sq in {max(1, round(w/64)), max(1, w//64), max(1, round(w/64))+1}:
        pts = []
        for i in range(5):
            x = w - sq*5 + sq*i + sq//2
            y = h - max(1, sq//2)
            if x < 0 or y < 0:
                break
            pts.append(im.getpixel((x, y)))
        if len(pts) == 5 and all(close(p, r) for p, r in zip(pts, REF)):
            return True
    return False

root = "/Users/dreeves/lab/beemblog/public/wp-content"
exts = (".png", ".jpg", ".jpeg", ".gif", ".webp")
hits = []
n = 0
for dirpath, _, files in os.walk(root):
    for f in sorted(files):
        if f.lower().endswith(exts):
            n += 1
            p = os.path.join(dirpath, f)
            if has_watermark(p):
                hits.append(p)
print(f"scanned {n} images")
for h in hits:
    print(h.replace(root + "/", ""))
