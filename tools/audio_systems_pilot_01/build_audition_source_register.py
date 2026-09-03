#!/usr/bin/env python3
"""Create the explicit, hash-bound source list for the offline audition desk."""

from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from common import PILOT_ROOT, atomic_write_json, canonical_contained, probe_audio, sha256_file, utc_now


SYSTEM_REGISTER = PILOT_ROOT / "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v5.json"
ACCESSIBILITY_INDEX = PILOT_ROOT / "07_audio-oracle/accessibility-renders-v4/ACCESSIBILITY-PRESETS.v4.json"
ORACLE_INDEX = PILOT_ROOT / "07_audio-oracle/AUDIO-ORACLE-SUITE.v1.json"
MANAGEMENT_CATALOGUE = PILOT_ROOT / "05_management-sfx/semantic-pack/management-semantic-catalogue.v4.json"
PREVIEW_ROOT = PILOT_ROOT / "11_return-package/audition-previews-v2"
OUTPUT_PATH = PILOT_ROOT / "11_return-package/AUDITION-SOURCE-REGISTER.v2.json"
CONVERSION_MANIFEST = PREVIEW_ROOT / "AUDITION-PREVIEW-DERIVATIVES.json"
HISTORY_MANIFEST = PREVIEW_ROOT / "AUDITION-PREVIEW-HISTORY.v1.json"
EXPECTED_SYSTEM_REGISTER_ITEMS = 147
ENCODING_PROFILE = {
    "container": "m4a",
    "codec": "aac",
    "sample_rate_hz": 48_000,
    "channels": 2,
    "target_bitrate": "160k",
    "metadata": "STRIPPED",
    "movflags": "+faststart",
}


def safe_id(value: str) -> str:
    if not isinstance(value, str) or re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", value) is None:
        raise RuntimeError(f"unsafe audition source ID: {value!r}")
    return value


def pilot_path(value: str | Path) -> Path:
    candidate = Path(value)
    if not candidate.is_absolute():
        candidate = PILOT_ROOT / candidate
    return canonical_contained(PILOT_ROOT, candidate)


def canonical_json_bytes(value: dict[str, Any]) -> bytes:
    return (json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode("utf-8")


def preserve_changed_manifest(path: Path, replacement: dict[str, Any], archive_root: Path, prefix: str) -> None:
    if not path.is_file() or path.read_bytes() == canonical_json_bytes(replacement):
        return
    payload = path.read_bytes()
    digest = hashlib.sha256(payload).hexdigest()
    archive_root.mkdir(parents=True, exist_ok=True)
    destination = archive_root / f"{prefix}-{digest}.json"
    if destination.exists():
        if destination.read_bytes() != payload:
            raise RuntimeError(f"manifest archive content-address collision: {destination}")
        return
    descriptor, name = tempfile.mkstemp(prefix=f".{prefix}.", suffix=".tmp", dir=archive_root)
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(name, 0o444)
        os.replace(name, destination)
    finally:
        Path(name).unlink(missing_ok=True)


def ffmpeg_executable() -> Path:
    executable_name = shutil.which("ffmpeg")
    if executable_name is None:
        raise RuntimeError("ffmpeg executable unavailable")
    return Path(executable_name).resolve(strict=True)


def ffmpeg_identity() -> dict[str, str]:
    executable = ffmpeg_executable()
    completed = subprocess.run(
        [str(executable), "-hide_banner", "-version"], check=False, capture_output=True, text=True,
    )
    if completed.returncode != 0 or not completed.stdout.strip():
        raise RuntimeError(f"ffmpeg identity unavailable: {completed.stderr[-1000:]}")
    return {
        "executable_path": str(executable),
        "executable_sha256": sha256_file(executable),
        "version_line": completed.stdout.splitlines()[0],
        "full_output_sha256": hashlib.sha256(completed.stdout.encode("utf-8")).hexdigest(),
    }


def current_generation_identity() -> dict[str, Any]:
    return {
        "generator": "AUDITION_PREVIEW_AAC_V2_CONTENT_ADDRESSED",
        "generator_blob_sha256": sha256_file(Path(__file__).resolve()),
        "encoding_profile": ENCODING_PROFILE,
        "ffmpeg": ffmpeg_identity(),
        "system_register_sha256": sha256_file(SYSTEM_REGISTER),
        "management_catalogue_sha256": sha256_file(MANAGEMENT_CATALOGUE),
        "accessibility_index_sha256": sha256_file(ACCESSIBILITY_INDEX),
        "oracle_index_sha256": sha256_file(ORACLE_INDEX),
    }


def generation_key_for(identity: dict[str, Any]) -> str:
    return hashlib.sha256(
        json.dumps(identity, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()


def verified(path: Path, expected_hash: str) -> Path:
    path = pilot_path(path)
    if not path.is_file() or sha256_file(path) != expected_hash:
        raise RuntimeError(f"audition source file missing or hash-mismatched: {path}")
    return path


def _manifest_set(current: Path, archive_root: Path, prefix: str) -> list[Path]:
    paths = [current]
    if archive_root.exists():
        if not archive_root.is_dir() or archive_root.is_symlink():
            raise RuntimeError(f"audition manifest archive is not a regular directory: {archive_root}")
        entries = sorted(archive_root.iterdir())
        if any(path.is_symlink() or not path.is_file() for path in entries):
            raise RuntimeError(f"audition manifest archive contains a non-regular entry: {archive_root}")
        expected = re.compile(rf"{re.escape(prefix)}-([0-9a-f]{{64}})\.json")
        for path in entries:
            match = expected.fullmatch(path.name)
            if match is None or sha256_file(path) != match.group(1):
                raise RuntimeError(f"audition manifest archive path/content identity failed: {path}")
        paths.extend(entries)
    if any(not path.is_file() or path.is_symlink() for path in paths):
        raise RuntimeError(f"audition current/archive manifest is missing: {current}")
    hashes = [sha256_file(path) for path in paths]
    if len(hashes) != len(set(hashes)):
        raise RuntimeError(f"audition current/archive manifest set contains duplicate content: {current}")
    return paths


def _verify_preview_version(version_root: Path) -> tuple[str, dict[str, Any]]:
    if (not version_root.is_dir() or version_root.is_symlink()
            or re.fullmatch(r"[0-9a-f]{64}", version_root.name) is None):
        raise RuntimeError(f"audition preview version root identity is malformed: {version_root}")
    manifest_path = version_root / "VERSION-MANIFEST.json"
    if not manifest_path.is_file() or manifest_path.is_symlink():
        raise RuntimeError(f"audition preview version manifest missing: {manifest_path}")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    records = manifest.get("records")
    identity = manifest.get("generation_identity")
    recomputed_key = generation_key_for(identity) if isinstance(identity, dict) else None
    if (manifest.get("schema") != "project-studio-audition-preview-version/v1"
            or manifest.get("status") != "PROTOTYPE_READY_FOR_OWNER_AUDITION"
            or manifest.get("human_acceptance") != "NONE_RECORDED"
            or manifest.get("generation_key") != version_root.name or recomputed_key != version_root.name
            or not isinstance(records, list) or manifest.get("record_count") != len(records)):
        raise RuntimeError(f"audition preview version manifest failed: {manifest_path}")
    ids = [row.get("id") for row in records]
    if None in ids or len(ids) != len(set(ids)):
        raise RuntimeError(f"audition preview version IDs are missing/duplicate: {manifest_path}")
    expected_files = {"VERSION-MANIFEST.json"}
    for row in records:
        if row.get("derivation") != "AAC_AUDITION_DERIVATIVE":
            raise RuntimeError(f"audition version carries a non-AAC record: {row.get('id')}")
        destination = Path(row.get("path", ""))
        if destination.parent.resolve(strict=True) != version_root.resolve(strict=True):
            raise RuntimeError(f"audition version derivative is not a direct child: {destination}")
        destination = verified(destination, row.get("sha256"))
        source = verified(Path(row.get("source_path", "")), row.get("source_sha256"))
        if (destination.name != f"{safe_id(row['id'])}--{row['source_sha256'][:16]}.m4a"
                or probe_audio(destination)["codec"] != "aac"
                or abs(probe_audio(destination)["duration_seconds"] - float(row.get("duration_seconds", -1))) > 0.1
                or abs(probe_audio(source)["duration_seconds"] - float(row.get("duration_seconds", -1))) > 0.1):
            raise RuntimeError(f"audition preview version provenance/format failed: {row['id']}")
        expected_files.add(destination.name)
    entries = list(version_root.rglob("*"))
    actual_files = {str(path.relative_to(version_root)) for path in entries if path.is_file()}
    if (any(path.is_symlink() for path in entries) or any(path.is_dir() for path in entries)
            or actual_files != expected_files):
        raise RuntimeError(f"audition preview version tree has missing/extra content: {version_root}")
    return sha256_file(manifest_path), manifest


def verify_preview_history(*, write: bool = True) -> dict[str, Any]:
    versions_root = PREVIEW_ROOT / "versions"
    if not versions_root.is_dir() or versions_root.is_symlink():
        raise RuntimeError("audition preview versions root is unavailable")
    version_by_manifest_hash: dict[str, tuple[Path, dict[str, Any]]] = {}
    for version_root in sorted(versions_root.iterdir()):
        digest, manifest = _verify_preview_version(version_root)
        if digest in version_by_manifest_hash:
            raise RuntimeError("audition preview versions contain duplicate manifest content")
        version_by_manifest_hash[digest] = (version_root, manifest)

    derivative_paths = _manifest_set(
        CONVERSION_MANIFEST, PREVIEW_ROOT / "archive", "AUDITION-PREVIEW-DERIVATIVES.v2"
    )
    derivative_by_hash: dict[str, tuple[Path, dict[str, Any]]] = {}
    referenced_versions: set[str] = set()
    for path in derivative_paths:
        digest = sha256_file(path)
        payload = json.loads(path.read_text(encoding="utf-8"))
        records = payload.get("records")
        if (payload.get("schema") != "project-studio-audition-preview-derivatives/v2"
                or payload.get("status") != "PROTOTYPE_READY_FOR_OWNER_AUDITION"
                or payload.get("source_relationships_explicit") is not True
                or not isinstance(records, list)):
            raise RuntimeError(f"audition derivative manifest failed: {path}")
        ids = [row.get("id") for row in records]
        if None in ids or len(ids) != len(set(ids)):
            raise RuntimeError(f"audition derivative IDs are missing/duplicate: {path}")
        current_version = payload.get("current_version", {})
        version_hash = current_version.get("sha256")
        version_pair = version_by_manifest_hash.get(version_hash)
        if version_pair is None:
            raise RuntimeError(f"audition derivative manifest references an unavailable version: {path}")
        version_root, version_manifest = version_pair
        if (current_version.get("generation_key") != version_root.name
                or Path(current_version.get("path", "")).resolve(strict=True) != version_root / "VERSION-MANIFEST.json"):
            raise RuntimeError(f"audition derivative/version pointer failed: {path}")
        referenced_versions.add(version_hash)
        version_records = {row["id"]: row for row in version_manifest["records"]}
        for row in records:
            audio = verified(Path(row.get("path", "")), row.get("sha256"))
            if abs(probe_audio(audio)["duration_seconds"] - float(row.get("duration_seconds", -1))) > 0.1:
                raise RuntimeError(f"audition derivative duration mismatch: {row.get('id')}")
            derivation = row.get("derivation")
            if derivation == "AAC_AUDITION_DERIVATIVE":
                if row.get("id") not in version_records or version_records[row["id"]] != row:
                    raise RuntimeError(f"audition derivative does not exactly project its version: {row.get('id')}")
            elif derivation == "EXISTING_VERIFIED_AAC_PREVIEW":
                if "source_path" in row or "source_sha256" in row:
                    raise RuntimeError(f"audition direct source carries a false derivative link: {row.get('id')}")
                if audio.suffix.lower() != ".m4a" or probe_audio(audio)["codec"] != "aac":
                    raise RuntimeError(f"audition existing AAC label does not match its format: {row.get('id')}")
            elif derivation == "SHORT_VERIFIED_PCM_SOURCE":
                if "source_path" in row or "source_sha256" in row:
                    raise RuntimeError(f"audition direct source carries a false derivative link: {row.get('id')}")
                audio_probe = probe_audio(audio)
                if (audio.suffix.lower() not in {".wav", ".aif", ".aiff"}
                        or not str(audio_probe["codec"]).startswith("pcm_")
                        or audio_probe["duration_seconds"] > 2.1):
                    raise RuntimeError(f"audition short PCM label does not match its format/duration: {row.get('id')}")
            else:
                raise RuntimeError(f"audition derivative class is unsupported: {derivation}")
        derivative_by_hash[digest] = (path, payload)

    source_paths = _manifest_set(
        OUTPUT_PATH, OUTPUT_PATH.parent / "archive/audition-source-registers", "AUDITION-SOURCE-REGISTER.v2"
    )
    sources: list[dict[str, Any]] = []
    referenced_derivatives: set[str] = set()
    for path in source_paths:
        digest = sha256_file(path)
        payload = json.loads(path.read_text(encoding="utf-8"))
        if (payload.get("schema") != "project-studio-audio-systems-audition-source/v2"
                or payload.get("status") != "PROTOTYPE_READY_FOR_OWNER_AUDITION"
                or payload.get("human_acceptance") != "NONE_RECORDED"
                or payload.get("network_required") is not False or payload.get("telemetry") is not False):
            raise RuntimeError(f"audition source-register archive failed: {path}")
        derivative_hash = payload.get("derivative_manifest", {}).get("sha256")
        derivative_pair = derivative_by_hash.get(derivative_hash)
        if derivative_pair is None:
            raise RuntimeError(f"audition source register references an unavailable derivative manifest: {path}")
        derivative_path, derivative_payload = derivative_pair
        item_rows = payload.get("items", [])
        derivative_rows = derivative_payload.get("records", [])
        if ([row.get("id") for row in item_rows] != [row.get("id") for row in derivative_rows]
                or any(item.get("source_path") != row.get("path") or item.get("sha256") != row.get("sha256")
                       for item, row in zip(item_rows, derivative_rows))):
            raise RuntimeError(f"audition source/derivative projection failed: {path}")
        referenced_derivatives.add(derivative_hash)
        sources.append({"path": str(path), "sha256": digest, "derivative_manifest_sha256": derivative_hash})

    if referenced_versions != set(version_by_manifest_hash):
        raise RuntimeError("audition preview version tree contains an orphaned or unreferenced generation")
    if referenced_derivatives != set(derivative_by_hash):
        raise RuntimeError("audition derivative archive contains an orphaned or unreferenced manifest")
    current_derivative_hash = sha256_file(CONVERSION_MANIFEST)
    current_derivative = derivative_by_hash[current_derivative_hash][1]
    current_version_hash = current_derivative["current_version"]["sha256"]
    current_version = version_by_manifest_hash[current_version_hash][1]
    expected_current_identity = current_generation_identity()
    if (current_version.get("generation_identity") != expected_current_identity
            or current_version.get("generation_key") != generation_key_for(expected_current_identity)):
        raise RuntimeError("audition current preview generation is stale for current code/profile/ffmpeg/upstreams")
    output = {
        "schema": "project-studio-audition-preview-history/v1",
        "status": "PROTOTYPE_ONLY",
        "current": {
            "source_register_sha256": sha256_file(OUTPUT_PATH),
            "derivative_manifest_sha256": sha256_file(CONVERSION_MANIFEST),
        },
        "version_count": len(version_by_manifest_hash),
        "derivative_manifest_count": len(derivative_by_hash),
        "source_register_count": len(sources),
        "versions": [
            {"path": str(root), "generation_key": root.name, "manifest_sha256": digest}
            for digest, (root, _) in sorted(version_by_manifest_hash.items(), key=lambda item: item[1][0].name)
        ],
        "derivative_manifests": [
            {"path": str(path), "sha256": digest, "version_manifest_sha256": payload["current_version"]["sha256"]}
            for digest, (path, payload) in sorted(derivative_by_hash.items(), key=lambda item: str(item[1][0]))
        ],
        "source_registers": sorted(sources, key=lambda row: row["path"]),
        "preservation_law": "Every current or archived source register resolves to a retained derivative manifest and immutable preview version; orphaned or mutated history fails.",
    }
    if write:
        atomic_write_json(HISTORY_MANIFEST, output)
    else:
        if not HISTORY_MANIFEST.is_file() or HISTORY_MANIFEST.is_symlink():
            raise RuntimeError("audition preview history manifest is missing")
        if json.loads(HISTORY_MANIFEST.read_text(encoding="utf-8")) != output:
            raise RuntimeError("audition preview history manifest is stale")
    return output


def preview(
    source: Path, expected_hash: str, stable_id: str, duration: float,
    prior_conversion: dict[str, Any] | None, version_root: Path, staging_root: Path | None,
) -> dict[str, Any]:
    source = verified(source, expected_hash)
    stable_id = safe_id(stable_id)
    if source.suffix.lower() not in {".wav", ".m4a", ".mp3", ".aac", ".flac", ".ogg", ".aif", ".aiff"}:
        raise RuntimeError(f"unsupported audition source format: {source}")
    source_probe = probe_audio(source)
    if abs(source_probe["duration_seconds"] - duration) > 0.1:
        raise RuntimeError(f"audition source duration mismatch for {stable_id}")
    if source.suffix.lower() == ".m4a" and source_probe["codec"] == "aac":
        return {"path": str(source), "sha256": expected_hash, "duration_seconds": source_probe["duration_seconds"], "derivation": "EXISTING_VERIFIED_AAC_PREVIEW"}
    if (duration <= 2 and source.suffix.lower() in {".wav", ".aif", ".aiff"}
            and str(source_probe["codec"]).startswith("pcm_")):
        return {"path": str(source), "sha256": expected_hash, "duration_seconds": source_probe["duration_seconds"], "derivation": "SHORT_VERIFIED_PCM_SOURCE"}
    destination = (version_root / f"{stable_id}--{expected_hash[:16]}.m4a").resolve(strict=False)
    try:
        destination.relative_to(PREVIEW_ROOT.resolve(strict=True))
    except ValueError as error:
        raise RuntimeError(f"audition preview destination escaped its root: {destination}") from error
    materialized = destination
    if not destination.exists():
        if staging_root is None:
            raise RuntimeError(f"audition preview version is missing an expected immutable derivative: {destination}")
        materialized = staging_root / destination.name
        materialized.parent.mkdir(parents=True, exist_ok=True)
        descriptor, name = tempfile.mkstemp(prefix=f".{stable_id}.", suffix=".m4a", dir=materialized.parent)
        os.close(descriptor)
        temporary = Path(name)
        temporary.unlink()
        try:
            completed = subprocess.run([
                str(ffmpeg_executable()), "-hide_banner", "-nostdin", "-v", "error", "-y", "-i", str(source),
                "-map_metadata", "-1", "-ar", "48000", "-ac", "2", "-c:a", "aac", "-b:a", "160k",
                "-movflags", "+faststart", str(temporary),
            ], check=False, capture_output=True, text=True)
            if completed.returncode != 0:
                raise RuntimeError(f"audition AAC derivation failed for {stable_id}: {completed.stderr[-2000:]}")
            temporary_probe = probe_audio(temporary)
            if (temporary_probe["codec"] != "aac" or temporary_probe["sample_rate_hz"] != 48_000
                    or temporary_probe["channels"] != 2
                    or abs(temporary_probe["duration_seconds"] - duration) > 0.1):
                raise RuntimeError(f"audition AAC temporary output failed format/duration validation: {stable_id}")
            os.chmod(temporary, 0o444)
            os.replace(temporary, materialized)
        finally:
            temporary.unlink(missing_ok=True)
    else:
        actual_hash = sha256_file(destination)
        if (prior_conversion is None or Path(prior_conversion.get("path", "")).resolve() != destination
                or prior_conversion.get("sha256") != actual_hash
                or Path(prior_conversion.get("source_path", "")).resolve() != source
                or prior_conversion.get("source_sha256") != expected_hash
                or prior_conversion.get("derivation") != "AAC_AUDITION_DERIVATIVE"):
            raise RuntimeError(f"existing audition preview lacks its exact prior source/hash binding: {destination}")
    probe = probe_audio(materialized)
    if abs(probe["duration_seconds"] - duration) > 0.1:
        raise RuntimeError(f"audition preview duration mismatch for {stable_id}")
    return {
        "path": str(destination), "sha256": sha256_file(materialized), "duration_seconds": probe["duration_seconds"],
        "derivation": "AAC_AUDITION_DERIVATIVE", "source_path": str(source), "source_sha256": expected_hash,
    }


def add_item(
    items: list[dict[str, Any]], *, source: dict[str, Any], item_id: str, title: str, collection: str,
    epoch: str | None = None, context: str | None = None, classification: str | None = None,
    bus: str | None = None, caption: str | None = None, status: str = "PENDING_OWNER_AUDITION",
    rights_status: str = "PROTOTYPE_ONLY", caption_track: dict[str, str] | None = None,
    transcript: dict[str, str] | None = None,
) -> None:
    items.append({
        "id": item_id,
        "title": title,
        "collection": collection,
        "epoch": epoch,
        "context": context,
        "classification": classification,
        "bus": bus,
        "caption_text": caption,
        "important_sound_caption": caption,
        "source_path": source["path"],
        "sha256": source["sha256"],
        "duration_seconds": source["duration_seconds"],
        "rights_status": rights_status,
        "status": status,
        "caption_track": caption_track,
        "transcript": transcript,
    })


def build() -> dict[str, Any]:
    existing_output = json.loads(OUTPUT_PATH.read_text(encoding="utf-8")) if OUTPUT_PATH.is_file() else None
    existing_conversion = json.loads(CONVERSION_MANIFEST.read_text(encoding="utf-8")) if CONVERSION_MANIFEST.is_file() else None
    system = json.loads(SYSTEM_REGISTER.read_text(encoding="utf-8"))
    if (system.get("schema") != "project-studio-system-audio-asset-register/v5"
            or system.get("status") not in {"PROTOTYPE_ONLY", "PROTOTYPE_READY_FOR_OWNER_AUDITION"}
            or len(system.get("items", [])) != EXPECTED_SYSTEM_REGISTER_ITEMS
            or sum(system.get("counts", {}).values()) != EXPECTED_SYSTEM_REGISTER_ITEMS):
        raise RuntimeError("unexpected systems register schema")
    source_items = system["items"]
    source_ids = [row.get("id") for row in source_items]
    if len(source_ids) != len(set(source_ids)) or any(not value for value in source_ids):
        raise RuntimeError("system register item IDs are missing or duplicate")
    for record in system.get("source_manifests", []):
        verified(Path(record["path"]), record["sha256"])
    PREVIEW_ROOT.mkdir(parents=True, exist_ok=True)
    for stale_staging in PREVIEW_ROOT.glob(".staging-*"):
        if not stale_staging.is_dir() or stale_staging.is_symlink():
            raise RuntimeError(f"unsafe audition-preview staging residue: {stale_staging}")
        shutil.rmtree(stale_staging)
    generation_identity = current_generation_identity()
    generation_key = generation_key_for(generation_identity)
    version_root = PREVIEW_ROOT / "versions" / generation_key
    staging_root: Path | None = None
    prior_records: dict[str, dict[str, Any]] = {}
    if existing_conversion is not None:
        if (existing_conversion.get("schema") != "project-studio-audition-preview-derivatives/v2"
                or not isinstance(existing_conversion.get("records"), list)):
            raise RuntimeError("existing audition conversion manifest is malformed")
        existing_ids = [row.get("id") for row in existing_conversion["records"]]
        if None in existing_ids or len(set(existing_ids)) != len(existing_ids):
            raise RuntimeError("existing audition conversion manifest has duplicate IDs")
    if version_root.exists():
        if not version_root.is_dir() or version_root.is_symlink():
            raise RuntimeError(f"audition preview version root is not a regular directory: {version_root}")
        version_manifest = json.loads((version_root / "VERSION-MANIFEST.json").read_text(encoding="utf-8"))
        if (version_manifest.get("schema") != "project-studio-audition-preview-version/v1"
                or version_manifest.get("status") != "PROTOTYPE_READY_FOR_OWNER_AUDITION"
                or version_manifest.get("generation_key") != generation_key
                or version_manifest.get("generation_identity") != generation_identity):
            raise RuntimeError("existing audition preview version manifest is stale or malformed")
        prior_records = {row.get("id"): row for row in version_manifest.get("records", [])}
        if None in prior_records or len(prior_records) != len(version_manifest.get("records", [])):
            raise RuntimeError("existing audition preview version records are duplicate or missing IDs")
    else:
        version_root.parent.mkdir(parents=True, exist_ok=True)
        staging_root = Path(tempfile.mkdtemp(prefix=f".staging-{generation_key}-", dir=PREVIEW_ROOT))

    def make_preview(source: Path, expected_hash: str, stable_id: str, duration: float) -> dict[str, Any]:
        return preview(source, expected_hash, stable_id, duration, prior_records.get(stable_id), version_root, staging_root)

    items: list[dict[str, Any]] = []
    conversions: list[dict[str, Any]] = []

    for item in [row for row in source_items if row["role"] == "ERA_PICK"]:
        source = make_preview(Path(item["path"]), item["sha256"], item["id"], item["duration_seconds"])
        add_item(items, source=source, item_id=item["id"], title=f"Era pick · {item['source_candidate_id']}", collection="ERA_LIBRARY", epoch=item["epoch"], classification=item["classification"], bus="SCORE", caption="Instrumental provisional era pick; no gameplay information.", rights_status=item["rights_status"])
        conversions.append({"id": item["id"], **source})

    for item in [row for row in source_items if row["role"] == "RESPONSIVE_VARIANT"]:
        source = make_preview(Path(item["preview"]["path"]), item["preview"]["sha256"], item["id"], item["preview"]["duration_seconds"])
        add_item(items, source=source, item_id=item["id"], title=f"Responsive {item['context'].title()} · {item['epoch']}", collection="RESPONSIVE_MUSIC", epoch=item["epoch"], context=item["context"], classification="HORIZONTAL_VARIANT_BUNDLE_NOT_STEMS", bus="SCORE", caption=f"Instrumental {item['context'].lower()} full-mix variant; no gameplay information.", rights_status=item["rights_status"])
        conversions.append({"id": item["id"], **source})

    for item in [row for row in source_items if row["role"] == "ERA_TRANSITION"]:
        source = make_preview(Path(item["path"]), item["sha256"], item["id"], item["duration_seconds"])
        add_item(items, source=source, item_id=item["id"], title=f"{item['boundary']} · {item['treatment'].replace('-', ' ').title()}", collection="ERA_TRANSITIONS", epoch=f"{item['outgoing_epoch']} → {item['incoming_epoch']}", context=item["treatment"], classification=item["classification"], bus="SCORE", caption="Adjacent-era transition audition; no authoritative era change is performed.", rights_status=item["rights_status"])
        conversions.append({"id": item["id"], **source})

    living_roles = {"LIVING_LAYER", "LIVING_MIX", "LIVING_ERA_PRESENTATION"}
    for item in [row for row in source_items if row["role"] in living_roles]:
        source = make_preview(Path(item["path"]), item["sha256"], item["id"], item["duration_seconds"])
        detail = item.get("fixture") or item.get("layer") or item.get("presentation")
        add_item(items, source=source, item_id=item["id"], title=f"Living Lot · {detail.replace('_', ' ').title()}", collection="LIVING_LOT", epoch=item.get("presentation"), context=detail, classification=item.get("classification", item["role"]), bus="AMBIENCE", caption=f"Living-lot ambience: {detail.replace('_', ' ').lower()}. Activity and era are explicit lab presentation fixtures only.", rights_status=item["rights_status"])
        conversions.append({"id": item["id"], **source})

    vocabulary = {row["id"]: row for row in json.loads(MANAGEMENT_CATALOGUE.read_text(encoding="utf-8"))["vocabulary"]}
    for item in [row for row in source_items if row["role"] == "MANAGEMENT_CANDIDATE"]:
        source = make_preview(Path(item["path"]), item["sha256"], item["id"], item["duration_seconds"])
        semantic = item["semantic_event"]
        meaning = vocabulary[semantic]["meaning"]
        add_item(items, source=source, item_id=item["id"], title=f"{semantic.replace('_', ' ').title()} · {item['selection_role'].replace('_', ' ').title()}", collection="MANAGEMENT_SFX", context=semantic, classification=f"{item['classification']} · {item['selection_role']}", bus=vocabulary[semantic]["bus"], caption=f"Important sound: {meaning}. A visible/text equivalent is required.", status="PROTOTYPE_ONLY_PENDING_OWNER_AUDITION", rights_status=item["rights_status"])
        conversions.append({"id": item["id"], **source})

    for item in [row for row in source_items if row["role"] == "RADIO_DEMO"]:
        source = make_preview(Path(item["path"]), item["sha256"], item["id"], item["duration_seconds"])
        for related in (item["caption_track"], item["transcript"]):
            verified(Path(related["path"]), related["sha256"])
        add_item(items, source=source, item_id=item["id"], title=item["id"].removeprefix("ASP01-RADIO-").replace("-", " ").title(), collection="STUDIO_RADIO", epoch=item["epoch"], classification=f"{item['classification']} · BAKED_FULL_MIX", bus="RADIO_MUSIC", caption=item["caption_text"], rights_status=item["rights_status"], caption_track=item["caption_track"], transcript=item["transcript"])
        conversions.append({"id": item["id"], **source})

    accessibility = json.loads(ACCESSIBILITY_INDEX.read_text(encoding="utf-8"))
    for render in accessibility["renders"]:
        source = make_preview(Path(render["path"]), render["sha256"], f"ASP01-ACCESSIBILITY-{render['preset']}", render["probe"]["duration_seconds"])
        add_item(items, source=source, item_id=f"ASP01-ACCESSIBILITY-{render['preset']}", title=f"Accessibility · {render['preset'].replace('_', ' ').title()}", collection="ACCESSIBILITY", context=render["preset"], classification="ACCESSIBILITY_MIX_DEMONSTRATION", bus="MASTER", caption=f"Mix demonstration: {render['preset'].replace('_', ' ').lower()}.", rights_status=accessibility["status"])
        conversions.append({"id": f"ASP01-ACCESSIBILITY-{render['preset']}", **source})

    oracle = json.loads(ORACLE_INDEX.read_text(encoding="utf-8"))
    if oracle.get("schema") != "project-studio-audio-oracle-suite/v1" or oracle.get("machine_verdict") != "PASS":
        raise RuntimeError("Unity-produced, scenario-labelled Audio Oracle suite unavailable or failed")
    for trace in oracle["scenarios"]:
        render = trace.get("capture")
        if not render:
            continue
        item_id = f"ASP01-ORACLE-{trace['number']:02d}"
        source = make_preview(pilot_path(render["path"]), render["sha256"], item_id, render["probe"]["duration_seconds"])
        add_item(items, source=source, item_id=item_id, title=f"Audio Oracle {trace['number']:02d} · {trace['scenario'].replace('_', ' ').title()}", collection="AUDIO_ORACLE", context=trace["scenario"], classification="UNITY_EDITOR_OFFLINE_OUTPUT_PROCESSOR_MARKER_RENDER_NOT_RUNTIME_MIX_CAPTURE", bus="MASTER", caption=f"Unity Editor offline output-processor marker render: {trace['scenario'].replace('_', ' ').lower()}; not a runtime mix capture.", rights_status=oracle["status"])
        conversions.append({"id": item_id, **source})

    ids = [item["id"] for item in items]
    if len(ids) != len(set(ids)):
        raise RuntimeError("audition source register contains duplicate IDs")
    counts = {collection: sum(item["collection"] == collection for item in items) for collection in sorted({item["collection"] for item in items})}
    expected = {"ERA_LIBRARY": 27, "RESPONSIVE_MUSIC": 12, "ERA_TRANSITIONS": 9, "LIVING_LOT": 11, "MANAGEMENT_SFX": 45, "STUDIO_RADIO": 3, "ACCESSIBILITY": 6, "AUDIO_ORACLE": 2}
    if counts != expected:
        raise RuntimeError(f"audition coverage incomplete: {counts}")
    derived_conversions = [row for row in conversions if row["derivation"] == "AAC_AUDITION_DERIVATIVE"]
    version_output = {
        "schema": "project-studio-audition-preview-version/v1",
        "generated_utc": (version_manifest["generated_utc"] if version_root.exists() else utc_now()),
        "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "human_acceptance": "NONE_RECORDED",
        "generation_key": generation_key,
        "generation_identity": generation_identity,
        "record_count": len(derived_conversions),
        "records": derived_conversions,
    }
    if staging_root is not None:
        atomic_write_json(staging_root / "VERSION-MANIFEST.json", version_output)
        os.replace(staging_root, version_root)
        staging_root = None
    elif version_manifest != version_output:
        raise RuntimeError("immutable audition preview version differs from the current deterministic projection")
    conversion_output = {
        "schema": "project-studio-audition-preview-derivatives/v2",
        "generated_utc": existing_conversion["generated_utc"] if existing_conversion else utc_now(),
        "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION", "records": conversions,
        "source_relationships_explicit": True,
        "current_version": {
            "generation_key": generation_key,
            "path": str(version_root / "VERSION-MANIFEST.json"),
            "sha256": sha256_file(version_root / "VERSION-MANIFEST.json"),
        },
    }
    preserve_changed_manifest(
        CONVERSION_MANIFEST, conversion_output, PREVIEW_ROOT / "archive", "AUDITION-PREVIEW-DERIVATIVES.v2"
    )
    atomic_write_json(CONVERSION_MANIFEST, conversion_output)
    conversion_hash = sha256_file(CONVERSION_MANIFEST)
    output = {
        "schema": "project-studio-audio-systems-audition-source/v2",
        "generated_utc": existing_output["generated_utc"] if existing_output else utc_now(),
        "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "human_acceptance": "NONE_RECORDED",
        "network_required": False,
        "telemetry": False,
        "counts": counts,
        "items": items,
        "source_manifests": [
            {"path": str(SYSTEM_REGISTER), "sha256": sha256_file(SYSTEM_REGISTER)},
            {"path": str(MANAGEMENT_CATALOGUE), "sha256": sha256_file(MANAGEMENT_CATALOGUE)},
            {"path": str(ACCESSIBILITY_INDEX), "sha256": sha256_file(ACCESSIBILITY_INDEX)},
            {"path": str(ORACLE_INDEX), "sha256": sha256_file(ORACLE_INDEX)},
        ],
        "derivative_manifest": {"path": str(CONVERSION_MANIFEST), "sha256": conversion_hash},
        "honesty": "Audio Oracle audition entries are bounded Unity Editor offline output-processor marker renders, not AudioSource, mixer, player, or hardware-output captures. PlayMode behavior is evidenced separately by the specifically labelled PlayMode traces; other traces disclose batch policy, validator, or frozen-trace revalidation sources.",
    }
    preserve_changed_manifest(
        OUTPUT_PATH, output, OUTPUT_PATH.parent / "archive/audition-source-registers", "AUDITION-SOURCE-REGISTER.v2"
    )
    atomic_write_json(OUTPUT_PATH, output)
    verify_preview_history()
    return output


def main() -> None:
    output = build()
    print(json.dumps({"path": str(OUTPUT_PATH), "sha256": sha256_file(OUTPUT_PATH), "counts": output["counts"]}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
