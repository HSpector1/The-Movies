#!/usr/bin/env python3
"""Export a Hollywood concept plate into runtime layers + a machine-readable manifest.

The source manifest owns semantic polygons and anchors. This deterministic exporter crops
occluders to their tight alpha bounds so Phaser does not allocate a full-screen texture for
every foreground mask. The base plate remains a single baked Tier-0 draw.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw


def bounds(polygons: list[list[list[int]]]) -> tuple[int, int, int, int]:
    xs = [point[0] for polygon in polygons for point in polygon]
    ys = [point[1] for polygon in polygons for point in polygon]
    return min(xs), min(ys), max(xs) + 1, max(ys) + 1


def export(source_image: Path, source_manifest: Path, output_dir: Path) -> None:
    manifest: dict[str, Any] = json.loads(source_manifest.read_text(encoding="utf-8"))
    image = Image.open(source_image).convert("RGBA")
    expected = (manifest["canvas"]["width"], manifest["canvas"]["height"])
    if image.size != expected:
        raise ValueError(f"Source size {image.size} does not match manifest canvas {expected}")

    output_dir.mkdir(parents=True, exist_ok=True)
    runtime_layers: list[dict[str, Any]] = []

    for layer in manifest["layers"]:
        runtime_layer = {key: value for key, value in layer.items() if key != "polygons"}
        if layer["kind"] == "baked":
            image.convert("RGB").save(output_dir / layer["output"], optimize=True)
            runtime_layer.update({"x": 0, "y": 0, "width": image.width, "height": image.height})
        else:
            polygons = layer["polygons"]
            left, top, right, bottom = bounds(polygons)
            mask = Image.new("L", image.size, 0)
            draw = ImageDraw.Draw(mask)
            for polygon in polygons:
                draw.polygon([tuple(point) for point in polygon], fill=255)
            rgba = Image.new("RGBA", image.size, (0, 0, 0, 0))
            rgba.paste(image, (0, 0), mask)
            cropped = rgba.crop((left, top, right, bottom))
            cropped.save(output_dir / layer["output"], optimize=True)
            runtime_layer.update({"x": left, "y": top, "width": cropped.width, "height": cropped.height})
        runtime_layers.append(runtime_layer)

    runtime_manifest = {
        key: value
        for key, value in manifest.items()
        if key not in {"source", "layers"}
    }
    runtime_manifest["source"] = manifest["source"]
    runtime_manifest["layers"] = runtime_layers
    runtime_manifest["textureMemoryBytes"] = sum(
        layer["width"] * layer["height"] * 4 for layer in runtime_layers
    )
    (output_dir / "district-manifest.json").write_text(
        json.dumps(runtime_manifest, indent=2) + "\n", encoding="utf-8"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    export(args.source, args.manifest, args.output)


if __name__ == "__main__":
    main()
