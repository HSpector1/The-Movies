#!/usr/bin/env python3
"""Deterministically pack frozen Hollywood role turnarounds into the V1 runtime atlas.

This exporter is intentionally independent from export_district.py. The district source
manifest predates later Annex polygon corrections and must not be replayed by this pipeline.
Image generation is not part of export: committed source pixels are the sole art authority.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROLES = (
    "director",
    "talent",
    "grip",
    "stagehand",
    "electrician",
    "camera",
    "security",
    "publicity",
    "extra",
)
DIRECTIONS = ("south", "east", "north", "west")
AUTHORED_DIRECTIONS = DIRECTIONS[:3]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def chroma_to_alpha(image: Image.Image, policy: dict[str, int]) -> Image.Image:
    """Remove only high-confidence magenta pixels from an RGB source.

    Built-in generation produces a visually flat key with small encoded RGB variation.
    The governed predicate uses both magenta brightness and magenta-over-green excess;
    no global despill is applied because source inspection proved it damaged skin/paper.
    """

    rgba = image.convert("RGBA")
    minimum = policy["minimumRedBlue"]
    excess = policy["minimumMagentaExcess"]
    converted: list[tuple[int, int, int, int]] = []
    for red, green, blue, _alpha in rgba.get_flattened_data():
        magenta = min(red, blue)
        is_key = magenta >= minimum and magenta - green >= excess
        converted.append((0, 0, 0, 0) if is_key else (red, green, blue, 255))
    rgba.putdata(converted)
    radius = policy["edgeContractRadius"]
    if radius > 0:
        rgba.putalpha(rgba.getchannel("A").filter(ImageFilter.MinFilter(radius * 2 + 1)))
    return rgba


def resize_premultiplied(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    """Resize RGBA without leaking hidden chroma RGB into the reduced edge."""

    red, green, blue, alpha = image.split()
    premultiplied = Image.merge(
        "RGBA",
        (
            ImageChops.multiply(red, alpha),
            ImageChops.multiply(green, alpha),
            ImageChops.multiply(blue, alpha),
            alpha,
        ),
    ).resize(size, Image.Resampling.LANCZOS)
    output: list[tuple[int, int, int, int]] = []
    for red, green, blue, alpha in premultiplied.get_flattened_data():
        if alpha == 0:
            output.append((0, 0, 0, 0))
        else:
            output.append(
                (
                    min(255, round(red * 255 / alpha)),
                    min(255, round(green * 255 / alpha)),
                    min(255, round(blue * 255 / alpha)),
                    alpha,
                )
            )
    resized = Image.new("RGBA", size)
    resized.putdata(output)
    return resized


def normalize_view(
    source: Image.Image,
    crop_box: list[int],
    frame: dict[str, Any],
    chroma: dict[str, int],
    mirror: bool,
) -> tuple[Image.Image, dict[str, Any]]:
    cropped = chroma_to_alpha(source.crop(tuple(crop_box)), chroma)
    opaque_bounds = cropped.getchannel("A").getbbox()
    if opaque_bounds is None:
        raise ValueError(f"Crop {crop_box} contains no opaque source pixels")
    figure = cropped.crop(opaque_bounds)
    if mirror:
        figure = figure.transpose(Image.Transpose.FLIP_LEFT_RIGHT)

    max_width = frame["maxFigureWidth"]
    max_height = frame["maxFigureHeight"]
    ratio = min(max_width / figure.width, max_height / figure.height)
    target = (
        max(1, round(figure.width * ratio)),
        max(1, round(figure.height * ratio)),
    )
    figure = resize_premultiplied(figure, target)

    frame_image = Image.new("RGBA", (frame["width"], frame["height"]), (0, 0, 0, 0))
    shadow = frame["contactEllipse"]
    ImageDraw.Draw(frame_image, "RGBA").ellipse(
        tuple(shadow["box"]), fill=tuple(shadow["rgba"])
    )
    left = (frame["width"] - figure.width) // 2
    top = frame["groundLine"] - figure.height
    if left < 0 or top < 0:
        raise ValueError(f"Normalized figure {target} does not fit frame {frame}")
    frame_image.alpha_composite(figure, (left, top))
    figure_bounds = [left, top, left + figure.width, top + figure.height]
    return frame_image, {
        "sourceOpaqueBounds": list(opaque_bounds),
        "figureBounds": figure_bounds,
        "normalizedSize": list(target),
        "scale": round(ratio, 8),
    }


def validate_source_manifest(manifest: dict[str, Any], manifest_path: Path) -> None:
    if manifest.get("schemaVersion") != 1:
        raise ValueError("People atlas source manifest schemaVersion must be 1")
    roles = manifest.get("roles", [])
    if tuple(role.get("id") for role in roles) != ROLES:
        raise ValueError(f"Role order must be exactly {ROLES}")
    if [role.get("row") for role in roles] != list(range(len(ROLES))):
        raise ValueError("Role rows must be unique and contiguous from zero")
    if sum(role.get("mirrorSourceForEast") is True for role in roles) != 1:
        raise ValueError("Exactly one V1 source-direction normalization is governed")
    if next(role for role in roles if role["id"] == "camera").get("mirrorSourceForEast") is not True:
        raise ValueError("Only Camera may normalize its source profile")

    frame = manifest["frame"]
    atlas = manifest["atlas"]
    expected_dimensions = (
        frame["width"] * len(DIRECTIONS),
        frame["height"] * len(ROLES),
    )
    if tuple(atlas["dimensions"]) != expected_dimensions:
        raise ValueError(f"Atlas dimensions must be {expected_dimensions}")
    if frame["groundLine"] > frame["height"] or frame["maxFigureHeight"] > frame["groundLine"]:
        raise ValueError("Ground line and maximum figure height do not fit the frame")

    seen_hashes: set[str] = set()
    for role in roles:
        source_spec = role["source"]
        source_path = manifest_path.parent / source_spec["path"]
        if not source_path.is_file():
            raise ValueError(f"Missing source for {role['id']}: {source_path}")
        if sha256(source_path) != source_spec["sha256"]:
            raise ValueError(f"Source hash mismatch for {role['id']}")
        if source_path.stat().st_size != source_spec["encodedBytes"]:
            raise ValueError(f"Source encoded byte count mismatch for {role['id']}")
        if source_spec["sha256"] in seen_hashes:
            raise ValueError(f"Source hash reused by {role['id']}")
        seen_hashes.add(source_spec["sha256"])
        with Image.open(source_path) as image:
            if list(image.size) != source_spec["dimensions"]:
                raise ValueError(f"Source dimensions mismatch for {role['id']}")
        if tuple(role["views"].keys()) != AUTHORED_DIRECTIONS:
            raise ValueError(f"{role['id']} must declare South/East/North crops in order")
        for direction, crop in role["views"].items():
            if len(crop) != 4 or crop[0] < 0 or crop[1] < 0:
                raise ValueError(f"Invalid {role['id']} {direction} crop {crop}")
            if crop[2] > source_spec["dimensions"][0] or crop[3] > source_spec["dimensions"][1]:
                raise ValueError(f"Out-of-bounds {role['id']} {direction} crop {crop}")
            if crop[0] >= crop[2] or crop[1] >= crop[3]:
                raise ValueError(f"Empty {role['id']} {direction} crop {crop}")


def export(manifest_path: Path, output_dir: Path) -> tuple[Path, Path]:
    manifest: dict[str, Any] = json.loads(manifest_path.read_text(encoding="utf-8"))
    validate_source_manifest(manifest, manifest_path)
    frame = manifest["frame"]
    atlas_spec = manifest["atlas"]
    atlas = Image.new("RGBA", tuple(atlas_spec["dimensions"]), (0, 0, 0, 0))
    runtime_frames: dict[str, dict[str, Any]] = {}

    for role in manifest["roles"]:
        source_path = manifest_path.parent / role["source"]["path"]
        source = Image.open(source_path).convert("RGB")
        role_frames: dict[str, Any] = {}
        authored: dict[str, Image.Image] = {}
        authored_diagnostics: dict[str, dict[str, Any]] = {}
        for direction in AUTHORED_DIRECTIONS:
            normalize_east = direction == "east" and role["mirrorSourceForEast"] is True
            image, diagnostics = normalize_view(
                source,
                role["views"][direction],
                frame,
                manifest["backgroundRemoval"],
                normalize_east,
            )
            authored[direction] = image
            authored_diagnostics[direction] = diagnostics
        authored["west"] = authored["east"].transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        east_bounds = authored_diagnostics["east"]["figureBounds"]
        authored_diagnostics["west"] = {
            **authored_diagnostics["east"],
            "figureBounds": [
                frame["width"] - east_bounds[2],
                east_bounds[1],
                frame["width"] - east_bounds[0],
                east_bounds[3],
            ],
            "derivedFrom": "exact-horizontal-mirror-of-east-frame",
        }

        for column, direction in enumerate(DIRECTIONS):
            index = role["row"] * len(DIRECTIONS) + column
            x = column * frame["width"]
            y = role["row"] * frame["height"]
            atlas.alpha_composite(authored[direction], (x, y))
            role_frames[direction] = {
                "index": index,
                "x": x,
                "y": y,
                "width": frame["width"],
                "height": frame["height"],
                "sourceDirection": "east" if direction == "west" else direction,
                "sourceCrop": role["views"]["east" if direction == "west" else direction],
                **authored_diagnostics[direction],
            }
        runtime_frames[role["id"]] = role_frames

    output_dir.mkdir(parents=True, exist_ok=True)
    atlas_path = output_dir / atlas_spec["image"]
    atlas.save(atlas_path, format="PNG", optimize=False, compress_level=9)
    atlas_hash = sha256(atlas_path)
    expected_hash = atlas_spec.get("expectedSha256")
    expected_bytes = atlas_spec.get("expectedEncodedBytes")
    if expected_hash is not None and atlas_hash != expected_hash:
        raise ValueError(f"Atlas hash {atlas_hash} does not match expected {expected_hash}")
    if expected_bytes is not None and atlas_path.stat().st_size != expected_bytes:
        raise ValueError(
            f"Atlas bytes {atlas_path.stat().st_size} do not match expected {expected_bytes}"
        )

    runtime_manifest = {
        "schemaVersion": 1,
        "atlasId": manifest["atlasId"],
        "image": atlas_spec["image"],
        "width": atlas.width,
        "height": atlas.height,
        "frameWidth": frame["width"],
        "frameHeight": frame["height"],
        "frameCount": len(ROLES) * len(DIRECTIONS),
        "roles": list(ROLES),
        "directions": list(DIRECTIONS),
        "frames": runtime_frames,
        "sourceHashes": {role["id"]: role["source"]["sha256"] for role in manifest["roles"]},
        "atlasSha256": atlas_hash,
        "atlasEncodedBytes": atlas_path.stat().st_size,
        "atlasDecodedRgbaBytes": atlas.width * atlas.height * 4,
        "exportCommand": manifest["exportCommand"],
        "sourceAuthority": "committed-frozen-generated-pixels",
    }
    runtime_manifest_path = output_dir / atlas_spec["manifest"]
    runtime_manifest_path.write_text(
        json.dumps(runtime_manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return atlas_path, runtime_manifest_path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    atlas_path, runtime_manifest_path = export(args.manifest, args.output)
    print(f"exported {atlas_path}")
    print(f"exported {runtime_manifest_path}")


if __name__ == "__main__":
    main()
