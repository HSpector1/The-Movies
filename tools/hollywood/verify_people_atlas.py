#!/usr/bin/env python3
"""Verify Hollywood Role Atlas V1 provenance, pixels, memory, and replay identity."""

from __future__ import annotations

import argparse
import json
import platform
from pathlib import Path
from tempfile import TemporaryDirectory
import zlib

import PIL
from PIL import Image, ImageChops, features

from export_people_atlas import DIRECTIONS, ROLES, export, sha256, validate_source_manifest


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def verify(
    source_manifest_path: Path,
    runtime_dir: Path,
    district_manifest_path: Path,
    replay_count: int,
) -> None:
    source = json.loads(source_manifest_path.read_text(encoding="utf-8"))
    validate_source_manifest(source, source_manifest_path)
    require(replay_count >= 3, "Role Atlas certification requires at least three replay exports")
    environment = source["exportEnvironment"]
    require(platform.python_version() == environment["python"], "Python export version mismatch")
    require(PIL.__version__ == environment["pillow"], "Pillow export version mismatch")
    require(
        f"macOS {platform.mac_ver()[0]} {platform.machine()}" == environment["platform"],
        "Platform export version mismatch",
    )
    require(zlib.ZLIB_VERSION == environment["pythonZlibCompile"], "Python zlib compile mismatch")
    require(zlib.ZLIB_RUNTIME_VERSION == environment["pythonZlibRuntime"], "Python zlib runtime mismatch")
    require(features.version("zlib") == environment["pillowZlib"], "Pillow zlib mismatch")
    atlas_spec = source["atlas"]
    frame_spec = source["frame"]
    atlas_path = runtime_dir / atlas_spec["image"]
    runtime_manifest_path = runtime_dir / atlas_spec["manifest"]
    runtime = json.loads(runtime_manifest_path.read_text(encoding="utf-8"))

    require(sha256(atlas_path) == atlas_spec["expectedSha256"], "Committed atlas hash mismatch")
    require(atlas_path.stat().st_size == atlas_spec["expectedEncodedBytes"], "Atlas bytes mismatch")
    require(runtime["atlasSha256"] == atlas_spec["expectedSha256"], "Runtime hash authority mismatch")
    require(runtime["atlasEncodedBytes"] == atlas_spec["expectedEncodedBytes"], "Runtime bytes mismatch")
    require(runtime["atlasDecodedRgbaBytes"] == atlas_spec["decodedRgbaBytes"], "Decoded bytes mismatch")
    require(tuple(runtime["roles"]) == ROLES, "Runtime role order mismatch")
    require(tuple(runtime["directions"]) == DIRECTIONS, "Runtime direction order mismatch")
    require(runtime["frameCount"] == len(ROLES) * len(DIRECTIONS), "Frame count mismatch")
    require(
        (runtime["width"], runtime["height"]) == tuple(atlas_spec["dimensions"]),
        "Runtime atlas dimensions mismatch",
    )

    prompts = source["prompts"]
    for role in source["roles"]:
        require(role["finalPromptId"] in prompts, f"Missing final prompt for {role['id']}")
        steps = role["provenanceSteps"]
        require(steps[-1]["promptId"] == role["finalPromptId"], f"Final prompt drift for {role['id']}")
        require(steps[-1]["outputSha256"] == role["source"]["sha256"], f"Final source drift for {role['id']}")
        for step in steps:
            require(step["promptId"] in prompts, f"Missing provenance prompt for {role['id']}")
            require(step["resultId"].startswith("exec-"), f"Missing built-in result id for {role['id']}")

    atlas = Image.open(atlas_path).convert("RGBA")
    require(atlas.size == tuple(atlas_spec["dimensions"]), "Decoded atlas dimensions mismatch")
    frame_width = frame_spec["width"]
    frame_height = frame_spec["height"]
    frame_addresses: set[int] = set()
    for row, role in enumerate(ROLES):
        cells: dict[str, Image.Image] = {}
        for column, direction in enumerate(DIRECTIONS):
            cell_spec = runtime["frames"][role][direction]
            expected_index = row * len(DIRECTIONS) + column
            require(cell_spec["index"] == expected_index, f"Frame index mismatch: {role}/{direction}")
            require(expected_index not in frame_addresses, f"Duplicate frame index {expected_index}")
            frame_addresses.add(expected_index)
            require(cell_spec["figureBounds"][3] == frame_spec["groundLine"], f"Foot registration drift: {role}/{direction}")
            cell = atlas.crop(
                (
                    column * frame_width,
                    row * frame_height,
                    (column + 1) * frame_width,
                    (row + 1) * frame_height,
                )
            )
            alpha = cell.getchannel("A")
            require(alpha.getbbox() is not None, f"Empty frame: {role}/{direction}")
            coverage = sum(1 for value in alpha.get_flattened_data() if value > 0) / (frame_width * frame_height)
            require(0.04 <= coverage <= 0.55, f"Opaque coverage out of bounds: {role}/{direction}={coverage}")
            for corner in ((0, 0), (frame_width - 1, 0), (0, frame_height - 1), (frame_width - 1, frame_height - 1)):
                require(alpha.getpixel(corner) == 0, f"Opaque corner: {role}/{direction}/{corner}")
            residue = sum(
                1
                for red, green, blue, alpha_value in cell.get_flattened_data()
                if alpha_value > 24 and min(red, blue) >= 70 and min(red, blue) - green >= 30
            )
            require(residue == 0, f"Chroma residue: {role}/{direction}={residue}")
            cells[direction] = cell
        mirrored = cells["east"].transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        require(ImageChops.difference(mirrored, cells["west"]).getbbox() is None, f"West is not exact East mirror: {role}")
    require(len(frame_addresses) == 36, "Atlas does not own exactly 36 unique frame addresses")

    district = json.loads(district_manifest_path.read_text(encoding="utf-8"))
    fallback_people_bytes = len(ROLES) * 54 * 74 * 4
    vehicle_bytes = 98 * 49 * 4
    total_decoded = (
        district["textureMemoryBytes"]
        + runtime["atlasDecodedRgbaBytes"]
        + fallback_people_bytes
        + vehicle_bytes
    )
    require(total_decoded < 12 * 1024 * 1024, f"Total decoded texture budget exceeded: {total_decoded}")

    committed_png = atlas_path.read_bytes()
    committed_json = runtime_manifest_path.read_bytes()
    with TemporaryDirectory(prefix="project-studio-role-atlas-verify-") as temporary:
        root = Path(temporary)
        for index in range(replay_count):
            output = root / str(index)
            replay_png, replay_json = export(source_manifest_path, output)
            require(replay_png.read_bytes() == committed_png, f"PNG replay {index + 1} differs")
            require(replay_json.read_bytes() == committed_json, f"JSON replay {index + 1} differs")

    print("Hollywood Role Atlas V1 verification PASS")
    print(f"roles={len(ROLES)} directions={len(DIRECTIONS)} frames={len(frame_addresses)}")
    print(f"atlas_sha256={runtime['atlasSha256']}")
    print(f"atlas_encoded_bytes={runtime['atlasEncodedBytes']}")
    print(f"atlas_decoded_rgba_bytes={runtime['atlasDecodedRgbaBytes']}")
    print(f"total_decoded_texture_bytes={total_decoded}")
    print(
        "encoder="
        f"Python-{environment['python']}/Pillow-{environment['pillow']}/"
        f"zlib-{environment['pythonZlibRuntime']}/Pillow-zlib-{environment['pillowZlib']}"
    )
    print(f"byte_identical_replays={replay_count}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--runtime", type=Path, required=True)
    parser.add_argument("--district-manifest", type=Path, required=True)
    parser.add_argument("--replay-count", type=int, default=3)
    args = parser.parse_args()
    verify(args.manifest, args.runtime, args.district_manifest, args.replay_count)


if __name__ == "__main__":
    main()
