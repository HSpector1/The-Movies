#!/usr/bin/env python3
"""Build a hash-verified, localhost-only Audio Systems Pilot audition desk."""

from __future__ import annotations

import argparse
import csv
import io
import json
import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from build_audition_source_register import verify_preview_history
from common import PILOT_ROOT, atomic_write_json, atomic_write_text, canonical_contained, materialize_verified, probe_audio, sha256_file, utc_now


SOURCE_ROOT = Path(__file__).resolve().parent / "audition_app_source"
DEFAULT_REGISTER = PILOT_ROOT / "11_return-package/AUDITION-SOURCE-REGISTER.v2.json"
OUTPUT_ROOT = PILOT_ROOT / "08_audition-app/v2"
HISTORY_PATH = PILOT_ROOT / "08_audition-app/AUDITION-APP-HISTORY.v1.json"
EXPECTED_SOURCE_MANIFESTS = (
    PILOT_ROOT / "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v5.json",
    PILOT_ROOT / "05_management-sfx/semantic-pack/management-semantic-catalogue.v4.json",
    PILOT_ROOT / "07_audio-oracle/accessibility-renders-v4/ACCESSIBILITY-PRESETS.v4.json",
    PILOT_ROOT / "07_audio-oracle/AUDIO-ORACLE-SUITE.v1.json",
)
EXPECTED_DERIVATIVE_MANIFEST = PILOT_ROOT / "11_return-package/audition-previews-v2/AUDITION-PREVIEW-DERIVATIVES.json"
PREVIEW_ROOT = PILOT_ROOT / "11_return-package/audition-previews-v2"
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


def _safe_id(value: str) -> str:
    if not isinstance(value, str) or re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", value) is None:
        raise RuntimeError(f"unsafe audition item ID: {value!r}")
    return value


def _copy_text_asset(source: Path, destination: Path, output_root: Path, mode: int = 0o644) -> dict[str, Any]:
    payload = source.read_text(encoding="utf-8")
    atomic_write_text(destination, payload, mode=mode)
    return {"relative_path": str(destination.relative_to(output_root)), "bytes": destination.stat().st_size, "sha256": sha256_file(destination)}


def _asset_destination(item: dict[str, Any], output_root: Path) -> Path:
    source = Path(item["source_path"])
    suffix = source.suffix.lower()
    if suffix not in {".wav", ".m4a", ".mp3", ".aac", ".flac", ".ogg"}:
        raise RuntimeError(f"unsupported audition format for {item['id']}: {suffix}")
    safe_id = _safe_id(item["id"])
    return output_root / "assets" / item["collection"].lower().replace("_", "-") / f"{safe_id}--{item['sha256'][:16]}{suffix}"


def _related_destination(item: dict[str, Any], relation: str, source: Path, expected_hash: str, output_root: Path) -> Path:
    safe_id = _safe_id(item["id"])
    return output_root / "assets" / "radio-text" / f"{safe_id}--{relation}--{expected_hash[:16]}{source.suffix.lower()}"


def _verify_build_tree(output_root: Path, *, require_source_snapshot: bool) -> tuple[dict[str, Any], dict[str, Any]]:
    """Verify one app tree without trusting a mutable external source-register path."""
    output_root = output_root.resolve(strict=True)
    manifest_path = output_root / "AUDITION-BUILD-MANIFEST.json"
    if not manifest_path.is_file() or manifest_path.is_symlink():
        raise RuntimeError(f"audition build manifest is not a regular file: {manifest_path}")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if (manifest.get("schema") != "project-studio-audio-systems-audition-build/v2"
            or manifest.get("machine_verdict") != "PASS"):
        raise RuntimeError("audition build manifest failed")
    static_assets = manifest.get("static_assets")
    audio_assets = manifest.get("audio_assets")
    if not isinstance(static_assets, list) or not isinstance(audio_assets, list):
        raise RuntimeError("audition build asset records are malformed")
    records = [*static_assets, *audio_assets]
    relative_paths = [record.get("relative_path") for record in records]
    asset_ids = [record.get("id") for record in audio_assets]
    if (None in relative_paths or len(relative_paths) != len(set(relative_paths))
            or None in asset_ids or len(asset_ids) != len(set(asset_ids))):
        raise RuntimeError("audition build asset paths/IDs are missing or duplicate")
    for record in records:
        target = canonical_contained(output_root, output_root / record["relative_path"])
        if (target.is_symlink() or not target.is_file()
                or target.stat().st_size != record["bytes"] or sha256_file(target) != record["sha256"]):
            raise RuntimeError(f"audition app asset identity mismatch: {target}")
    catalogue_record = manifest.get("catalogue", {})
    catalogue = canonical_contained(output_root, output_root / catalogue_record.get("path", ""))
    if catalogue.is_symlink() or sha256_file(catalogue) != catalogue_record.get("sha256"):
        raise RuntimeError("audition catalogue hash mismatch")
    expected_paths = {*relative_paths, str(catalogue.relative_to(output_root))}
    snapshot_record = manifest.get("source_register_snapshot")
    if snapshot_record is not None:
        snapshot = canonical_contained(output_root, output_root / snapshot_record.get("path", ""))
        if (snapshot.is_symlink() or not snapshot.is_file()
                or sha256_file(snapshot) != snapshot_record.get("sha256")
                or snapshot_record.get("sha256") != manifest.get("source_register", {}).get("sha256")):
            raise RuntimeError("audition embedded source-register snapshot identity mismatch")
        expected_paths.add(str(snapshot.relative_to(output_root)))
    elif require_source_snapshot:
        raise RuntimeError("current audition app lacks its embedded source-register snapshot")
    actual_entries = list(output_root.rglob("*"))
    actual_paths = {
        str(path.relative_to(output_root)) for path in actual_entries
        if path.is_file() and path != manifest_path
    }
    expected_directories = {
        str(parent)
        for relative in expected_paths
        for parent in Path(relative).parents
        if str(parent) != "."
    }
    actual_directories = {
        str(path.relative_to(output_root)) for path in actual_entries
        if path.is_dir() and not path.is_symlink()
    }
    if (any(path.is_symlink() for path in actual_entries)
            or actual_paths != expected_paths or actual_directories != expected_directories):
        raise RuntimeError("audition app tree contains missing, extra, or symlinked content")
    public = json.loads(catalogue.read_text(encoding="utf-8"))
    if (public.get("schema") != "project-studio-audio-systems-audition/v2"
            or public.get("status") != "PROTOTYPE_READY_FOR_OWNER_AUDITION"
            or public.get("humanAcceptance") != "NONE_RECORDED"
            or public.get("telemetry") is not False or public.get("networkRequired") is not False
            or public.get("sourceRegisterSha256") != manifest.get("source_register", {}).get("sha256")):
        raise RuntimeError("audition public policy/source identity mismatch")
    public_items = public.get("items")
    if not isinstance(public_items, list) or len(public_items) != manifest.get("counts", {}).get("items"):
        raise RuntimeError("audition public item count mismatch")
    public_ids = [item.get("id") for item in public_items]
    public_by_id = {item.get("id"): item for item in public_items}
    asset_by_id = {item.get("id"): item for item in audio_assets}
    if (None in public_ids or len(public_ids) != len(public_by_id)):
        raise RuntimeError("audition public item IDs are missing or duplicate")
    for item_id, item in public_by_id.items():
        primary = asset_by_id.get(item_id)
        if (primary is None or item.get("audio") != primary.get("relative_path")
                or item.get("sha256") != primary.get("sha256")):
            raise RuntimeError(f"audition public item lacks an exact asset binding: {item_id}")
        if str(item.get("audio", "")).startswith(("http://", "https://", "//")):
            raise RuntimeError("audition catalogue contains a network audio source")
    return manifest, public


def _same_verified_tree(left: Path, right: Path) -> bool:
    left_manifest, _ = _verify_build_tree(left, require_source_snapshot=False)
    right_manifest, _ = _verify_build_tree(right, require_source_snapshot=False)
    return (left_manifest == right_manifest
            and (left / "AUDITION-BUILD-MANIFEST.json").read_bytes()
            == (right / "AUDITION-BUILD-MANIFEST.json").read_bytes())


def _history_payload() -> dict[str, Any]:
    archive_root = OUTPUT_ROOT.parent / "archive"
    archives: list[dict[str, Any]] = []
    if archive_root.exists():
        if not archive_root.is_dir() or archive_root.is_symlink():
            raise RuntimeError("audition app archive root is not a regular directory")
        for root in sorted(archive_root.iterdir()):
            if not root.is_dir() or root.is_symlink() or re.fullmatch(r"v2-[0-9a-f]{64}", root.name) is None:
                raise RuntimeError(f"audition app archive contains an invalid entry: {root}")
            manifest, _ = _verify_build_tree(root, require_source_snapshot=False)
            digest = sha256_file(root / "AUDITION-BUILD-MANIFEST.json")
            if root.name != f"v2-{digest}":
                raise RuntimeError(f"audition app archive directory/content identity mismatch: {root}")
            archives.append({
                "path": str(root), "manifest_sha256": digest,
                "source_register_sha256": manifest["source_register"]["sha256"],
            })
    current, _ = _verify_build_tree(OUTPUT_ROOT, require_source_snapshot=True)
    return {
        "schema": "project-studio-audition-app-history/v1",
        "status": "PROTOTYPE_ONLY",
        "current": {
            "path": str(OUTPUT_ROOT),
            "manifest_sha256": sha256_file(OUTPUT_ROOT / "AUDITION-BUILD-MANIFEST.json"),
            "source_register_sha256": current["source_register"]["sha256"],
        },
        "archived_count": len(archives),
        "archives": archives,
        "preservation_law": "Content-addressed prior app trees are retained; the current pointer changes only after a staged tree passes full verification.",
    }


def _write_history() -> dict[str, Any]:
    output = _history_payload()
    atomic_write_json(HISTORY_PATH, output)
    return output


def _verify_history() -> dict[str, Any]:
    if not HISTORY_PATH.is_file() or HISTORY_PATH.is_symlink():
        raise RuntimeError("audition app history manifest is missing")
    recorded = json.loads(HISTORY_PATH.read_text(encoding="utf-8"))
    expected = _history_payload()
    if recorded != expected:
        raise RuntimeError("audition app history manifest is stale")
    return recorded


def verify_derivative_projection(register: dict[str, Any]) -> dict[str, int]:
    preview_history = verify_preview_history(write=False)
    derivative_record = register.get("derivative_manifest", {})
    derivative_path = canonical_contained(PILOT_ROOT, Path(derivative_record.get("path", "")))
    if (derivative_path != EXPECTED_DERIVATIVE_MANIFEST.resolve(strict=True)
            or sha256_file(derivative_path) != derivative_record.get("sha256")):
        raise RuntimeError("audition derivative-manifest identity is missing or stale")
    derivative = json.loads(derivative_path.read_text(encoding="utf-8"))
    if (derivative.get("schema") != "project-studio-audition-preview-derivatives/v2"
            or derivative.get("status") != "PROTOTYPE_READY_FOR_OWNER_AUDITION"
            or derivative.get("source_relationships_explicit") is not True):
        raise RuntimeError("audition derivative-manifest status/schema mismatch")
    records = derivative.get("records", [])
    items = register.get("items", [])
    if ([row.get("id") for row in records] != [row.get("id") for row in items]
            or len({row.get("id") for row in records}) != len(records)):
        raise RuntimeError("audition derivative records do not exactly project source-item identities/order")
    derived_records: list[dict[str, Any]] = []
    allowed_derivations = {"AAC_AUDITION_DERIVATIVE", "EXISTING_VERIFIED_AAC_PREVIEW", "SHORT_VERIFIED_PCM_SOURCE"}
    for row, item in zip(records, items):
        if (row.get("derivation") not in allowed_derivations
                or row.get("path") != item.get("source_path")
                or row.get("sha256") != item.get("sha256")
                or abs(float(row.get("duration_seconds", -1)) - float(item.get("duration_seconds", -2))) > 0.1):
            raise RuntimeError(f"audition derivative/source-item projection mismatch: {item.get('id')}")
        path = canonical_contained(PILOT_ROOT, Path(row["path"]))
        if path.is_symlink() or not path.is_file() or sha256_file(path) != row["sha256"]:
            raise RuntimeError(f"audition derivative source changed: {path}")
        probe = probe_audio(path)
        if abs(probe["duration_seconds"] - float(row["duration_seconds"])) > 0.1:
            raise RuntimeError(f"audition derivative duration changed: {path}")
        if row["derivation"] == "AAC_AUDITION_DERIVATIVE":
            source = canonical_contained(PILOT_ROOT, Path(row.get("source_path", "")))
            if (probe["codec"] != "aac" or sha256_file(source) != row.get("source_sha256")
                    or not str(path).startswith(str((PREVIEW_ROOT / "versions").resolve(strict=True)) + os.sep)):
                raise RuntimeError(f"audition AAC derivative provenance failed: {item.get('id')}")
            derived_records.append(row)
        elif "source_path" in row or "source_sha256" in row:
            raise RuntimeError(f"non-derived audition source carries a false derivative relationship: {item.get('id')}")
        elif row["derivation"] == "EXISTING_VERIFIED_AAC_PREVIEW":
            if path.suffix.lower() != ".m4a" or probe["codec"] != "aac":
                raise RuntimeError(f"existing AAC audition label does not match its source: {item.get('id')}")
        elif row["derivation"] == "SHORT_VERIFIED_PCM_SOURCE":
            if (path.suffix.lower() not in {".wav", ".aif", ".aiff"}
                    or not str(probe["codec"]).startswith("pcm_") or probe["duration_seconds"] > 2.1):
                raise RuntimeError(f"short PCM audition label does not match its source: {item.get('id')}")
    current_version = derivative.get("current_version", {})
    generation_key = current_version.get("generation_key")
    if not isinstance(generation_key, str) or re.fullmatch(r"[0-9a-f]{64}", generation_key) is None:
        raise RuntimeError("audition preview current-version key is malformed")
    version_path = canonical_contained(PREVIEW_ROOT, Path(current_version.get("path", "")))
    expected_version_path = (PREVIEW_ROOT / "versions" / generation_key / "VERSION-MANIFEST.json").resolve(strict=True)
    if version_path != expected_version_path or sha256_file(version_path) != current_version.get("sha256"):
        raise RuntimeError("audition preview current-version manifest identity failed")
    version = json.loads(version_path.read_text(encoding="utf-8"))
    if (version.get("schema") != "project-studio-audition-preview-version/v1"
            or version.get("status") != "PROTOTYPE_READY_FOR_OWNER_AUDITION"
            or version.get("human_acceptance") != "NONE_RECORDED"
            or version.get("generation_key") != generation_key
            or version.get("record_count") != len(derived_records)
            or version.get("records") != derived_records):
        raise RuntimeError("audition preview immutable version projection failed")
    version_root = version_path.parent
    if any(Path(row["path"]).resolve(strict=True).parent != version_root for row in derived_records):
        raise RuntimeError("audition AAC derivative is not a direct child of the declared current version")
    expected_files = {"VERSION-MANIFEST.json", *(Path(row["path"]).name for row in derived_records)}
    actual_entries = list(version_root.rglob("*"))
    if (any(path.is_symlink() for path in actual_entries)
            or {str(path.relative_to(version_root)) for path in actual_entries if path.is_file()} != expected_files
            or any(path.is_dir() for path in actual_entries)):
        raise RuntimeError("audition preview immutable version tree contains missing, extra, nested, or symlinked content")
    return {
        "records": len(records), "aac_derivatives": len(derived_records),
        "preview_versions": preview_history["version_count"],
    }


def build(register_path: Path) -> dict[str, Any]:
    if register_path.resolve(strict=True) != DEFAULT_REGISTER.resolve(strict=True):
        raise RuntimeError("audition build refuses a noncanonical source register")
    existing_manifest_path = OUTPUT_ROOT / "AUDITION-BUILD-MANIFEST.json"
    existing_manifest = json.loads(existing_manifest_path.read_text(encoding="utf-8")) if existing_manifest_path.is_file() else None
    OUTPUT_ROOT.parent.mkdir(parents=True, exist_ok=True)
    for stale_staging in OUTPUT_ROOT.parent.glob(".v2.staging-*"):
        if not stale_staging.is_dir() or stale_staging.is_symlink():
            raise RuntimeError(f"unsafe audition-app staging residue: {stale_staging}")
        shutil.rmtree(stale_staging)
    build_root = Path(tempfile.mkdtemp(prefix=".v2.staging-", dir=OUTPUT_ROOT.parent))
    register = json.loads(register_path.read_text(encoding="utf-8"))
    if register.get("schema") != "project-studio-audio-systems-audition-source/v2":
        raise RuntimeError("unexpected audition source-register schema")
    if (register.get("status") != "PROTOTYPE_READY_FOR_OWNER_AUDITION"
            or register.get("human_acceptance") != "NONE_RECORDED"
            or register.get("network_required") is not False or register.get("telemetry") is not False):
        raise RuntimeError("audition source register has a stale or prohibited status/policy")
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
        destination = _asset_destination(item, build_root)
        materialized = materialize_verified(source, destination, expected_hash)
        probe = probe_audio(destination)
        if abs(probe["duration_seconds"] - float(item["duration_seconds"])) > 0.1:
            raise RuntimeError(f"duration mismatch for {item['id']}")
        manifest_assets.append({
            "id": item["id"], "relative_path": str(destination.relative_to(build_root)),
            "sha256": expected_hash, "bytes": materialized["bytes"], "source_path": str(source),
        })
        related_public: dict[str, str | None] = {"captionTrack": None, "transcript": None}
        for source_key, public_key in (("caption_track", "captionTrack"), ("transcript", "transcript")):
            relation = item.get(source_key)
            if relation is None:
                continue
            related_source = canonical_contained(PILOT_ROOT, Path(relation["path"]))
            related_destination = _related_destination(item, source_key, related_source, relation["sha256"], build_root)
            related_materialized = materialize_verified(related_source, related_destination, relation["sha256"])
            relative_path = str(related_destination.relative_to(build_root))
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
            "durationSeconds": probe["duration_seconds"], "audio": str(destination.relative_to(build_root)),
            "sha256": expected_hash, "rightsStatus": status,
            "status": item.get("status", "PENDING_OWNER_AUDITION"),
            **related_public,
        })

    static_assets = [
        _copy_text_asset(SOURCE_ROOT / "index.html", build_root / "index.html", build_root),
        _copy_text_asset(SOURCE_ROOT / "styles.css", build_root / "styles.css", build_root),
        _copy_text_asset(SOURCE_ROOT / "app.js", build_root / "app.js", build_root),
        _copy_text_asset(SOURCE_ROOT / "serve_audition.py", build_root / "serve_audition.py", build_root, mode=0o755),
        _copy_text_asset(SOURCE_ROOT / "START-AUDITION.command", build_root / "START-AUDITION.command", build_root, mode=0o755),
    ]
    source_register_hash = sha256_file(register_path)
    snapshot_path = build_root / "data/source-register.json"
    snapshot = materialize_verified(register_path, snapshot_path, source_register_hash)
    public_catalogue = {
        "schema": "project-studio-audio-systems-audition/v2",
        "generatedUtc": existing_manifest.get("public_catalogue_generated_utc", utc_now()) if existing_manifest else utc_now(),
        "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "humanAcceptance": "NONE_RECORDED",
        "networkRequired": False,
        "telemetry": False,
        "sourceRegisterSha256": source_register_hash,
        "items": public_items,
    }
    catalogue_path = build_root / "data/catalogue.json"
    atomic_write_json(catalogue_path, public_catalogue)
    manifest = {
        "schema": "project-studio-audio-systems-audition-build/v2",
        "generated_utc": existing_manifest["generated_utc"] if existing_manifest else utc_now(),
        "public_catalogue_generated_utc": public_catalogue["generatedUtc"],
        "machine_verdict": "PASS",
        "source_register": {"path": str(register_path), "sha256": source_register_hash},
        "source_register_snapshot": {
            "path": str(snapshot_path.relative_to(build_root)),
            "bytes": snapshot["bytes"],
            "sha256": source_register_hash,
        },
        "catalogue": {"path": "data/catalogue.json", "sha256": sha256_file(catalogue_path)},
        "counts": {
            "items": len(public_items),
            "collections": {name: sum(item["collection"] == name for item in items) for name in sorted(REQUIRED_COLLECTIONS)},
        },
        "policy": {"network_required": False, "telemetry": False, "raw_audio": False, "ratings_storage": "LOCAL_BROWSER_ONLY"},
        "static_assets": static_assets,
        "audio_assets": manifest_assets,
        "limitations": ["Machine verification does not constitute listening acceptance.", "Owner ratings remain local until explicitly exported."],
    }
    manifest_path = build_root / "AUDITION-BUILD-MANIFEST.json"
    atomic_write_json(manifest_path, manifest)
    verify(build_root)
    if OUTPUT_ROOT.exists():
        current_manifest_path = OUTPUT_ROOT / "AUDITION-BUILD-MANIFEST.json"
        if current_manifest_path.is_file() and current_manifest_path.read_bytes() == manifest_path.read_bytes():
            _write_history()
            verify(OUTPUT_ROOT)
            shutil.rmtree(build_root)
            return json.loads(current_manifest_path.read_text(encoding="utf-8"))
        _verify_build_tree(OUTPUT_ROOT, require_source_snapshot=False)
        archive_root = OUTPUT_ROOT.parent / "archive"
        archive_root.mkdir(parents=True, exist_ok=True)
        current_hash = sha256_file(current_manifest_path)
        archived_root = archive_root / f"v2-{current_hash}"
        if archived_root.exists():
            if not _same_verified_tree(OUTPUT_ROOT, archived_root):
                raise RuntimeError(f"audition-app content-addressed archive collision: {archived_root}")
            shutil.rmtree(OUTPUT_ROOT)
        else:
            os.replace(OUTPUT_ROOT, archived_root)
    os.replace(build_root, OUTPUT_ROOT)
    _write_history()
    verify(OUTPUT_ROOT)
    return json.loads((OUTPUT_ROOT / "AUDITION-BUILD-MANIFEST.json").read_text(encoding="utf-8"))


def verify(output_root: Path = OUTPUT_ROOT) -> dict[str, Any]:
    output_root = output_root.resolve(strict=True)
    manifest, public = _verify_build_tree(output_root, require_source_snapshot=True)
    snapshot_record = manifest["source_register_snapshot"]
    snapshot_path = canonical_contained(output_root, output_root / snapshot_record["path"])
    expected_static = {
        "index.html": (SOURCE_ROOT / "index.html", 0o644),
        "styles.css": (SOURCE_ROOT / "styles.css", 0o644),
        "app.js": (SOURCE_ROOT / "app.js", 0o644),
        "serve_audition.py": (SOURCE_ROOT / "serve_audition.py", 0o755),
        "START-AUDITION.command": (SOURCE_ROOT / "START-AUDITION.command", 0o755),
    }
    if [row.get("relative_path") for row in manifest["static_assets"]] != list(expected_static):
        raise RuntimeError("audition static-asset path set/order is not exact")
    for record in manifest["static_assets"]:
        source, expected_mode = expected_static[record["relative_path"]]
        target = canonical_contained(output_root, output_root / record["relative_path"])
        if (not source.is_file() or source.is_symlink() or source.read_bytes() != target.read_bytes()
                or (target.stat().st_mode & 0o777) != expected_mode):
            raise RuntimeError(f"audition static asset differs from current committed source/mode: {target}")
    register_path = canonical_contained(PILOT_ROOT, Path(manifest["source_register"]["path"]))
    if (register_path != DEFAULT_REGISTER.resolve(strict=True)
            or sha256_file(register_path) != manifest["source_register"]["sha256"]):
        raise RuntimeError("audition source register changed")
    register = json.loads(register_path.read_text(encoding="utf-8"))
    if (register.get("schema") != "project-studio-audio-systems-audition-source/v2"
            or register.get("status") != "PROTOTYPE_READY_FOR_OWNER_AUDITION"
            or register.get("human_acceptance") != "NONE_RECORDED"
            or register.get("network_required") is not False or register.get("telemetry") is not False):
        raise RuntimeError("audition source-register identity/policy mismatch")
    if snapshot_path.read_bytes() != register_path.read_bytes():
        raise RuntimeError("audition embedded source-register snapshot differs from canonical bound bytes")
    register_items = register.get("items", [])
    public_items = public.get("items", [])
    register_by_id = {item.get("id"): item for item in register_items}
    public_by_id = {item.get("id"): item for item in public_items}
    asset_by_id = {item.get("id"): item for item in manifest.get("audio_assets", [])}
    if (len(register_by_id) != len(register_items) or len(public_by_id) != len(public_items)
            or len(asset_by_id) != len(manifest.get("audio_assets", []))
            or set(public_by_id) != set(register_by_id)):
        raise RuntimeError("audition item/asset IDs are duplicate or semantically incomplete")
    for item_id, source_item in register_by_id.items():
        public_item = public_by_id[item_id]
        primary_asset = asset_by_id.get(item_id)
        if primary_asset is None:
            raise RuntimeError(f"audition primary asset mapping missing: {item_id}")
        expected_public = {
            "title": source_item["title"], "collection": source_item["collection"],
            "epoch": source_item.get("epoch"), "context": source_item.get("context"),
            "classification": source_item.get("classification"), "bus": source_item.get("bus"),
            "captionText": source_item.get("caption_text"),
            "importantSoundCaption": source_item.get("important_sound_caption"),
            "audio": primary_asset["relative_path"], "sha256": source_item["sha256"],
            "rightsStatus": source_item["rights_status"],
            "status": source_item.get("status", "PENDING_OWNER_AUDITION"),
        }
        if any(public_item.get(key) != value for key, value in expected_public.items()):
            raise RuntimeError(f"audition public item projection mismatch: {item_id}")
        if (primary_asset.get("sha256") != source_item["sha256"]
                or Path(primary_asset.get("source_path", "")).resolve() != Path(source_item["source_path"]).resolve()):
            raise RuntimeError(f"audition primary asset/source mapping mismatch: {item_id}")
        if abs(float(public_item.get("durationSeconds", -1)) - float(source_item["duration_seconds"])) > 0.1:
            raise RuntimeError(f"audition public duration projection mismatch: {item_id}")
        for source_key, public_key in (("caption_track", "captionTrack"), ("transcript", "transcript")):
            relation = source_item.get(source_key)
            relation_id = f"{item_id}--{source_key}"
            if relation is None:
                if public_item.get(public_key) is not None or relation_id in asset_by_id:
                    raise RuntimeError(f"audition unexpected related asset: {relation_id}")
                continue
            related_asset = asset_by_id.get(relation_id)
            if (related_asset is None or public_item.get(public_key) != related_asset.get("relative_path")
                    or related_asset.get("sha256") != relation.get("sha256")
                    or Path(related_asset.get("source_path", "")).resolve() != Path(relation["path"]).resolve()):
                raise RuntimeError(f"audition related asset projection mismatch: {relation_id}")
    expected_asset_ids = set(register_by_id)
    for item_id, source_item in register_by_id.items():
        expected_asset_ids.update(
            f"{item_id}--{key}" for key in ("caption_track", "transcript") if source_item.get(key) is not None
        )
    if set(asset_by_id) != expected_asset_ids:
        raise RuntimeError("audition manifest contains an unbound or missing audio/text asset")
    expected_collections = {
        "ERA_LIBRARY": 27, "RESPONSIVE_MUSIC": 12, "ERA_TRANSITIONS": 9,
        "LIVING_LOT": 11, "MANAGEMENT_SFX": 45, "STUDIO_RADIO": 3,
        "ACCESSIBILITY": 6, "AUDIO_ORACLE": 2,
    }
    if manifest.get("counts", {}).get("collections") != expected_collections or register.get("counts") != expected_collections:
        raise RuntimeError("audition collection coverage is not exact")
    source_manifest_rows = register.get("source_manifests", [])
    if [canonical_contained(PILOT_ROOT, Path(row["path"])) for row in source_manifest_rows] != [path.resolve(strict=True) for path in EXPECTED_SOURCE_MANIFESTS]:
        raise RuntimeError("audition upstream manifest path set/order is not canonical")
    for record in source_manifest_rows:
        if sha256_file(canonical_contained(PILOT_ROOT, Path(record["path"]))) != record["sha256"]:
            raise RuntimeError(f"audition upstream manifest changed: {record['path']}")
    derivative_counts = verify_derivative_projection(register)
    app_history = _verify_history() if output_root == OUTPUT_ROOT.resolve(strict=False) else None
    javascript = output_root / "app.js"
    completed = subprocess.run(["node", "--check", str(javascript)], check=False, capture_output=True, text=True)
    if completed.returncode != 0:
        raise RuntimeError(f"audition JavaScript syntax failed: {completed.stderr}")
    source_text = javascript.read_text(encoding="utf-8")
    required_tokens = (
        "localStorage", "exportCsv", "exportJson", "getGamepads", "captions_enabled", "decision-marker",
        "sourceRegisterSha256", "itemAudioSha256", "source_register_sha256", "item_audio_sha256", ":archived:",
    )
    if not all(token in source_text for token in required_tokens):
        raise RuntimeError("audition local-rating/accessibility controls are incomplete")
    for executable in (output_root / "serve_audition.py", output_root / "START-AUDITION.command"):
        if not (executable.stat().st_mode & 0o111):
            raise RuntimeError(f"audition launcher is not executable: {executable}")
    return {
        "machine_verdict": "PASS", "items": manifest["counts"]["items"],
        "audio_assets": len(manifest["audio_assets"]), "javascript_syntax": "PASS",
        "network_audio_sources": 0, "telemetry": False,
        "archived_app_builds": app_history["archived_count"] if app_history else None,
        **derivative_counts,
    }


def write_blank_feedback(path: Path) -> None:
    output = io.StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow([
        "item_id", "source_register_sha256", "item_audio_sha256", "collection", "epoch", "context",
        *RATING_FIELDS, "verdict", "notes", "saved_at",
    ])
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
