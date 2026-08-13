#!/usr/bin/env python3
"""Create the required labeled north-star vs production evidence sheet."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def fit(image: Image.Image, width: int, height: int) -> Image.Image:
    scale = min(width / image.width, height / image.height)
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (width, height), (9, 20, 17))
    canvas.paste(resized, ((width - resized.width) // 2, (height - resized.height) // 2))
    return canvas


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--northstar", type=Path, required=True)
    parser.add_argument("--production", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    northstar = Image.open(args.northstar).convert("RGB")
    production = Image.open(args.production).convert("RGB")
    pane_w, pane_h, header_h, notes_h, gutter = 900, 563, 82, 108, 18
    sheet = Image.new("RGB", (pane_w * 2 + gutter, header_h + pane_h + notes_h), (8, 21, 17))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=24)
    small = ImageFont.load_default(size=16)
    gold = (216, 184, 111)
    cream = (241, 226, 192)
    muted = (166, 179, 165)
    draw.text((24, 17), "OPERATION HOLLYWOOD · ENGINE PARITY", fill=cream, font=font)
    draw.text((24, 51), "Same district promise; authored richness preserved, simulation selectively layered.", fill=muted, font=small)
    sheet.paste(fit(northstar, pane_w, pane_h), (0, header_h))
    sheet.paste(fit(production, pane_w, pane_h), (pane_w + gutter, header_h))
    draw.rectangle((0, header_h, pane_w, header_h + 38), fill=(10, 32, 26))
    draw.rectangle((pane_w + gutter, header_h, pane_w * 2 + gutter, header_h + 38), fill=(10, 32, 26))
    draw.text((16, header_h + 9), "NORTH STAR · AUTHORED CONCEPT", fill=gold, font=small)
    draw.text((pane_w + gutter + 16, header_h + 9), "PRODUCTION · PHASER + ENGINE TRUTH", fill=gold, font=small)
    notes_y = header_h + pane_h + 14
    notes = [
        "PRESERVED  Stage 7 composition · Moderne publicity building · gate/service depth · period material richness",
        "PROVED      Mara route behind truck/camera · Stage hold -> clear -> Take 12 · real $1.2M publicity action",
        "MEASURED    59-60 FPS · 30 display objects · 15 dynamic actors · 8.7 MB decoded district textures",
        "OPEN GAPS   dynamic-actor fidelity · interior transition · construction/era variants · richer close-zoom animation",
    ]
    for index, line in enumerate(notes):
        draw.text((24, notes_y + index * 22), line, fill=cream if index < 3 else (222, 167, 101), font=small)
    draw.line((pane_w + gutter // 2, header_h, pane_w + gutter // 2, header_h + pane_h), fill=gold, width=2)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(args.output, optimize=True)


if __name__ == "__main__":
    main()
