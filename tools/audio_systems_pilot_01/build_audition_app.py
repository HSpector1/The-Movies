#!/usr/bin/env python3
"""Build a hash-verified, localhost-only Audio Systems Pilot audition desk."""

from __future__ import annotations

import argparse
import csv
import io
import json
import os
import shutil
from pathlib import Path
from typing import Any

from common import PILOT_ROOT, atomic_write_json, atomic_write_text, canonical_contained, materialize_verified, probe_audio, sha256_file, utc_now


SOURCE_ROOT = Path(__file__).resolve().parent / "audition_app_source"
DEFAULT_REGISTER = PILOT_ROOT / "11_return-package/AUDITION-SOURCE-REGISTER.json"
OUTPUT_ROOT = PILOT_ROOT / "08_audition-app"
REQUIRED_COLLECTIONS = {
    "ERA_LIBRARY",
    "RESPONSIVE_MUSIC",
    "ERA_TRANSITIONS",
    "LIVING_LOT",
    "MANAGEMENT_SFX",
    "STUDIO_RADIO",
    "ACCESSIBILITY",
    "AUDIO_ORACLE",
}
RATING_FIELDS = (
    "musicalQuality", "eraFit", "studioIdentity", "managementSuitability",
    "irritation", "repetition", "transitionQuality", "ambienceQuality",
    "radioCopyCredibility", "voicePerformance", "ducking", "uiSoundRestraint",
    "accessibility",
)


def _copy_text_asset(source: Path, destination: Path, mode: int = 0o644) -> dict[str, Any]:
    payload = source.read_text(encoding="utf-8")
    atomic_write_text(destination, payload, mode=mode)
    return {"relative_path": str(destination.relative_to(OUTPUT_ROOT)), "bytes": destination.stat().st_size, "sha256": sha256_file(destination)}


def _asset_destination(item: dict[str, Any]) -> Path:
    source = Path(item["source_path"])
    suffix = source.suffix.lower()
    if suffix not in {".wav", ".m4a", ".mp3", ".aac", ".flac", ".ogg"}:
        raise RuntimeError(f"unsupported audition format for {item['id']}: {suffix}")
    safe_id = "".join(character if character.isalnum() or character in "-_" else "-" for character in item["id"])
    return OUTPUT_ROOT / "assets" / item["collection"].lower().replace("_", "-") / f"{safe_id}{suffix}"


def _related_destination(item: dict[str, Any], relation: str, source: Path) -> Path:
    safe_id = "".join(character if character.isalnum() or character in "-_" else "-" for character in item["id"])
    return OUTPUT_ROOT / "assets" / "radio-text" / f"{safe_id}--{relation}{source.suffix.lower()}"


def build(register_path: Path) -> dict[str, Any]:
    register = json.loads(register_path.read_text(encoding="utf-8"))
    if register.get("schema") != "project-studio-audio-systems-audition-source/v1":
        raise RuntimeError("unexpected audition source-register schema")
    if register.get("status") not in {"PROTOTYPE_ONLY", "PROTOTYPE_READY_FOR_OWNER_AUDITION"}:
        raise RuntimeError("audition source register has a prohibited status")
    items = register.get("items")
    if not isinstance(items, list) or not items:
        raise RuntimeError("audition source register is empty")
    ids = [item.get("id") for item in items]
    if len(ids) != len(set(ids)) or any(not value for value in ids):
        raise RuntimeError("audition source IDs must be non-empty and unique")
    collections = {item.get("collection") for item in items}
    missing_collections = sorted(REQUIRED_COLLECTIONS - collections)
    if missing_collections:
        raise RuntimeError(f"audition source register is missing collections: {missing_collections}")
    if sum(item["collection"] == "ERA_LIBRARY" for item in items) != 27:
        raise RuntimeError("audition desk requires exactly 27 current provisional era picks")

    manifest_assets: list[dict[str, Any]] = []
    public_items: list[dict[str, Any]] = []
    for item in items:
        status = item.get("rights_status")
        if status not in {"PROTOTYPE_ONLY", "PROTOTYPE_READY_FOR_OWNER_AUDITION"}:
            raise RuntimeError(f"prohibited rights status for {item['id']}: {status}")
        source = canonical_contained(PILOT_ROOT, Path(item["source_path"]))
        lowered = str(source).lower()
        if any(fragment in lowered for fragment in ("/candidates/", "/models/", "/weights/", "/02_raw/")):
            raise RuntimeError(f"raw candidate/model material may not enter audition app: {source}")
        expected_hash = item.get("sha256")
        if not isinstance(expected_hash, str) or len(expected_hash) != 64:
            raise RuntimeError(f"missing exact hash for {item['id']}")
        destination = _asset_destination(item)
        materialized = materialize_verified(source, destination, expected_hash)
        probe = probe_audio(destination)
        if abs(probe["duration_seconds"] - float(item["duration_seconds"])) > 0.1:
            raise RuntimeError(f"duration mismatch for {item['id']}")
        manifest_assets.append({
            "id": item["id"], "relative_path": str(destination.relative_to(OUTPUT_ROOT)),
            "sha256": expected_hash, "bytes": materialized["bytes"], "source_path": str(source),
        })
        related_public: dict[str, str | None] = {"captionTrack": None, "transcript": None}
        for source_key, public_key in (("caption_track", "captionTrack"), ("transcript", "transcript")):
            relation = item.get(source_key)
            if relation is None:
                continue
            related_source = canonical_contained(PILOT_ROOT, Path(relation["path"]))
            related_destination = _related_destination(item, source_key, related_source)
            related_materialized = materialize_verified(related_source, related_destination, relation["sha256"])
            relative_path = str(related_destination.relative_to(OUTPUT_ROOT))
            manifest_assets.append({
                "id": f"{item['id']}--{source_key}", "relative_path": relative_path,
                "sha256": relation["sha256"], "bytes": related_materialized["bytes"],
                "source_path": str(related_source),
            })
            related_public[public_key] = relative_path
        public_items.append({
            "id": item["id"], "title": item["title"], "collection": item["collection"],
            "epoch": item.get("epoch"), "context": item.get("context"),
            "classification": item.get("classification"), "bus": item.get("bus"),
            "captionText": item.get("caption_text"), "importantSoundCaption": item.get("important_sound_caption"),
            "durationSeconds": probe["duration_seconds"], "audio": str(destination.relative_to(OUTPUT_ROOT)),
            "sha256": expected_hash, "rightsStatus": status,
            "status": item.get("status", "PENDING_OWNER_AUDITION"),
            **related_public,
        })

    static_assets = [
        _copy_text_asset(SOURCE_ROOT / "index.html", OUTPUT_ROOT / "index.html"),
        _copy_text_asset(SOURCE_ROOT / "styles.css", OUTPUT_ROOT / "styles.css"),
        _copy_text_asset(SOURCE_ROOT / "app.js", OUTPUT_ROOT / "app.js"),
        _copy_text_asset(SOURCE_ROOT / "serve_audition.py", OUTPUT_ROOT / "serve_audition.py", mode=0o755),
        _copy_text_asset(SOURCE_ROOT / "START-AUDITION.command", OUTPUT_ROOT / "START-AUDITION.command", mode=0o755),
    ]
    source_register_hash = sha256_file(register_path)
    public_catalogue = {
        "schema": "project-studio-audio-systems-audition/v1",
        "generatedUtc": utc_now(),
        "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "humanAcceptance": "NONE_RECORDED",
        "networkRequired": False,
        "telemetry": False,
        "catalogueSha256": source_register_hash,
        "items": public_items,
    }
    catalogue_path = OUTPUT_ROOT / "data/catalogue.json"
    atomic_write_json(catalogue_path, public_catalogue)
    manifest = {
        "schema": "project-studio-audio-systems-audition-build/v1",
        "generated_utc": utc_now(),
        "machine_verdict": "PASS",
        "source_register": {"path": str(register_path), "sha256": source_register_hash},
        "catalogue": {"path": str(catalogue_path), "sha256": sha256_file(catalogue_path)},
        "counts": {
            "items": len(public_items),
            "collections": {name: sum(item["collection"] == name for item in items) for name in sorted(REQUIRED_COLLECTIONS)},
        },
        "policy": {"network_required": False, "telemetry": False, "raw_audio": False, "ratings_storage": "LOCAL_BROWSER_ONLY"},
        "static_assets": static_assets,
        "audio_assets": manifest_assets,
        "limitations": ["Machine verification does not constitute listening acceptance.", "Owner ratings remain local until explicitly exported."],
    }
    manifest_path = OUTPUT_ROOT / "AUDITION-BUILD-MANIFEST.json"
    atomic_write_json(manifest_path, manifest)
    return manifest


def verify() -> dict[str, Any]:
    manifest_path = OUTPUT_ROOT / "AUDITION-BUILD-MANIFEST.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    for record in [*manifest["static_assets"], *manifest["audio_assets"]]:
        target = canonical_contained(OUTPUT_ROOT, OUTPUT_ROOT / record["relative_path"])
        if sha256_file(target) != record["sha256"]:
            raise RuntimeError(f"audition app hash mismatch: {target}")
    catalogue = Path(manifest["catalogue"]["path"])
    if sha256_file(catalogue) != manifest["catalogue"]["sha256"]:
        raise RuntimeError("audition catalogue hash mismatch")
    return {"machine_verdict": "PASS", "items": manifest["counts"]["items"], "audio_assets": len(manifest["audio_assets"])}


def write_blank_feedback(path: Path) -> None:
    output = io.StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow(["item_id", "collection", "epoch", "context", *RATING_FIELDS, "verdict", "notes", "saved_at"])
    atomic_write_text(path, output.getvalue())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-register", type=Path, default=DEFAULT_REGISTER)
    parser.add_argument("--verify-only", action="store_true")
    args = parser.parse_args()
    result = verify() if args.verify_only else build(args.source_register)
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
