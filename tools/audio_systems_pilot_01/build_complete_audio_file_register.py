#!/usr/bin/env python3
"""Inventory every audio file in bounded pilot media roots with unique file identity."""

from __future__ import annotations

import hashlib
import json
import os
import subprocess
import tempfile
from collections import defaultdict
from pathlib import Path
from typing import Any, Iterator

from common import DOC_REPO, PILOT_ROOT, atomic_write_json, probe_audio, sha256_file


CREATED_AT = "2026-09-03T00:00:00Z"
MEDIA_ROOT_NAMES = (
    "02_music-bundles", "03_transitions", "04_living-lot", "05_management-sfx",
    "06_radio", "07_audio-oracle", "08_audition-app", "11_return-package",
)
DECLARATION_ROOT_NAMES = (
    "01_catalogue", "02_music-bundles", "03_transitions", "04_living-lot",
    "05_management-sfx", "06_radio", "07_audio-oracle", "08_audition-app",
    "09_unity-lab", "10_provenance", "11_return-package",
)
AUDIO_SUFFIXES = {".wav", ".m4a", ".mp3", ".aac", ".aif", ".aiff", ".flac", ".ogg"}
OUTPUT = PILOT_ROOT / "10_provenance/COMPLETE-AUDIO-FILE-REGISTER.v1.json"
HISTORY_ROOT = PILOT_ROOT / "10_provenance/complete-register-history"
UNITY_REPO = Path("/Users/bruce/Project Studio - Audio Systems Pilot 01 Client")

CURRENT_MANIFEST_PATHS = {
    "01_catalogue/AudioPrototypeCatalogue.v1.json",
    "01_catalogue/AudioPrototypeCatalogue.identity-closure.v3.json",
    "02_music-bundles/responsive/responsive-generation-register.v2.json",
    "02_music-bundles/responsive/responsive-bundle-catalogue.v2.json",
    "02_music-bundles/responsive/responsive-anchor-authority.v2.json",
    "02_music-bundles/simulations/FOUR-HOUR-DENSITY-SIMULATIONS.v2.json",
    "03_transitions/rendered-transition-catalogue.v4.json",
    "03_transitions/transition-legacy-quarantine.v1.json",
    "04_living-lot/living-lot-soundscape-catalogue.v3.json",
    "05_management-sfx/generated-lot-detail/lot-detail-sfx-catalogue.json",
    "05_management-sfx/semantic-pack/management-semantic-catalogue.v4.json",
    "06_radio/STUDIO-RADIO-RUNTIME-INDEX.v2.json",
    "06_radio/scheduler-evidence/RADIO-SCHEDULER-EVIDENCE.v2.json",
    "06_radio/scheduler-evidence/RADIO-SCHEDULER-INPUT.v2.json",
    "06_radio/script-bank/STUDIO-RADIO-SCRIPT-BANK-01-CLEAN.v2.json",
    "06_radio/script-bank/RADIO-COPY-LINT.v2.json",
    "06_radio/functional-fixtures.v2.json",
    "06_radio/presenter-ensemble.v2.json",
    "07_audio-oracle/AUDIO-ORACLE-SUITE.v1.json",
    "07_audio-oracle/accessibility-renders-v4/ACCESSIBILITY-PRESETS.v4.json",
    "07_audio-oracle/accessibility-renders-v4/ACCESSIBILITY-BUS-CONTRIBUTIONS.v4.json",
    "08_audition-app/v2/AUDITION-BUILD-MANIFEST.json",
    "08_audition-app/v2/data/catalogue.json",
    "09_unity-lab/RuntimeEvidence/audio-oracle-runtime-observations.json",
    "10_provenance/audio-assets-index.v4.json",
    "10_provenance/audio-derivative-source-register.v4.json",
    "10_provenance/audio-assets-validation.v4.json",
    "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v5.json",
    "11_return-package/AUDITION-SOURCE-REGISTER.v2.json",
    "11_return-package/audition-previews-v2/AUDITION-PREVIEW-DERIVATIVES.json",
}


def is_current_manifest(manifest: Path) -> bool:
    relative = str(manifest.relative_to(PILOT_ROOT))
    return (
        relative in CURRENT_MANIFEST_PATHS
        or relative.startswith("06_radio/demos-v2/")
    )

GENERATOR_BINDINGS = {
    "responsive_generation_and_asset_remedies": [
        "tools/audio_systems_pilot_01/generate_responsive_variants.py",
        "tools/audio_systems_pilot_01/publish_hostile_review_asset_remedies.py",
        "tools/audio_systems_pilot_01/build_audio_assets.py",
    ],
    "radio_runtime_v2": [
        "tools/audio_systems_pilot_01/radio_copy_linter_v2.py",
        "tools/audio_systems_pilot_01/radio-scheduler.ts",
        "tools/audio_systems_pilot_01/build-radio-schedule-evidence.ts",
        "tools/audio_systems_pilot_01/build_radio_runtime_v2.py",
    ],
    "playlist_simulation_v2": ["tools/audio_systems_pilot_01/build_playlist_simulations.py"],
    "accessibility_renders_v4": ["tools/audio_systems_pilot_01/build_accessibility_renders_v4.py"],
    "system_register_v5": ["tools/audio_systems_pilot_01/build_system_asset_register.py"],
    "identity_and_complete_provenance": [
        "tools/audio_systems_pilot_01/common.py",
        "tools/audio_systems_pilot_01/build_catalogue_identity_closure.py",
        "tools/audio_systems_pilot_01/build_complete_audio_file_register.py",
        "tools/audio_systems_pilot_01/publish_metadata_status_remedies.py",
    ],
    "audition_and_final_consumers": [
        "tools/audio_systems_pilot_01/build_audio_oracle.py",
        "tools/audio_systems_pilot_01/build_audition_source_register.py",
        "tools/audio_systems_pilot_01/build_audition_app.py",
        "tools/audio_systems_pilot_01/audition_app_source/index.html",
        "tools/audio_systems_pilot_01/audition_app_source/styles.css",
        "tools/audio_systems_pilot_01/audition_app_source/app.js",
        "tools/audio_systems_pilot_01/audition_app_source/serve_audition.py",
        "tools/audio_systems_pilot_01/audition_app_source/START-AUDITION.command",
        "tools/audio_systems_pilot_01/build_hostile_review_index.py",
        "tools/audio_systems_pilot_01/package_owner_return.py",
        "tools/audio_systems_pilot_01/repair_unity_validation_archives.py",
        "tools/audio_systems_pilot_01/run_unity_lab_validation.zsh",
        "tools/audio_systems_pilot_01/snapshot_unity_validation_run.py",
        "tools/audio_systems_pilot_01/update_final_state.py",
        "tools/audio_systems_pilot_01/validate_audio_systems_pilot.py",
    ],
}


def pointer_escape(value: str) -> str:
    return value.replace("~", "~0").replace("/", "~1")


def walk(value: Any, pointer: str = "") -> Iterator[tuple[str, Any]]:
    yield pointer or "/", value
    if isinstance(value, dict):
        for key, child in value.items():
            yield from walk(child, f"{pointer}/{pointer_escape(str(key))}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from walk(child, f"{pointer}/{index}")


def resolve_declared_path(manifest: Path, key: str, value: str) -> Path | None:
    candidate = Path(value)
    if candidate.is_absolute():
        resolved = candidate.resolve()
    elif key == "pilot_relative_path":
        resolved = (PILOT_ROOT / candidate).resolve()
    elif key == "relative_path":
        manifest_candidate = (manifest.parent / candidate).resolve()
        root_candidate = (PILOT_ROOT / candidate).resolve()
        resolved = manifest_candidate if manifest_candidate.exists() else root_candidate
    else:
        root_candidate = (PILOT_ROOT / candidate).resolve()
        resolved = root_candidate if root_candidate.exists() else (manifest.parent / candidate).resolve()
    try:
        resolved.relative_to(PILOT_ROOT)
    except ValueError:
        return None
    return resolved


def collect_declarations() -> tuple[dict[Path, list[dict[str, Any]]], list[dict[str, Any]]]:
    declarations: dict[Path, list[dict[str, Any]]] = defaultdict(list)
    mismatches: list[dict[str, Any]] = []
    for root_name in DECLARATION_ROOT_NAMES:
        root = PILOT_ROOT / root_name
        if not root.exists():
            continue
        for manifest in sorted(root.rglob("*.json")):
            if manifest.resolve() == OUTPUT.resolve():
                continue
            try:
                data = json.loads(manifest.read_text(encoding="utf-8"))
            except (OSError, UnicodeDecodeError, json.JSONDecodeError):
                continue
            manifest_sha256 = sha256_file(manifest)
            for pointer, node in walk(data):
                if not isinstance(node, dict) or not isinstance(node.get("sha256"), str):
                    continue
                for key in ("path", "relative_path", "pilot_relative_path"):
                    value = node.get(key)
                    if not isinstance(value, str):
                        continue
                    resolved = resolve_declared_path(manifest, key, value)
                    if resolved is None or resolved.suffix.lower() not in AUDIO_SUFFIXES or not resolved.is_file():
                        continue
                    actual = sha256_file(resolved)
                    record = {
                        "manifest": str(manifest),
                        "manifest_relative_path": str(manifest.relative_to(PILOT_ROOT)),
                        "manifest_sha256": manifest_sha256,
                        "json_pointer": pointer,
                        "declared_sha256": node["sha256"],
                        "current_manifest": is_current_manifest(manifest),
                    }
                    declarations[resolved].append(record)
                    if actual != node["sha256"]:
                        mismatches.append({**record, "audio_path": str(resolved), "actual_sha256": actual})
    return declarations, mismatches


def git_head(repo: Path) -> str:
    return subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=repo, check=True, capture_output=True, text=True
    ).stdout.strip()


def git_file_binding(commit: str, relative_path: str) -> dict[str, Any]:
    working = DOC_REPO / relative_path
    content = subprocess.run(
        ["git", "show", f"{commit}:{relative_path}"],
        cwd=DOC_REPO,
        check=True,
        capture_output=True,
    ).stdout
    committed_sha256 = hashlib.sha256(content).hexdigest()
    current_sha256 = sha256_file(working)
    if current_sha256 != committed_sha256:
        raise RuntimeError(f"generator working file differs from bound commit: {relative_path}")
    return {
        "path": relative_path,
        "commit": commit,
        "committed_blob_sha256": committed_sha256,
        "working_file_sha256": current_sha256,
        "matches_bound_commit": True,
    }


def role_tags(relative_path: str) -> list[str]:
    path = relative_path.lower()
    tags = []
    mapping = {
        "responsive": "RESPONSIVE_MUSIC",
        "library": "ERA_PICK_LIBRARY",
        "transitions": "ERA_TRANSITION",
        "living-lot": "LIVING_LOT",
        "management": "MANAGEMENT_SFX",
        "lot-detail": "LOT_DETAIL_SFX",
        "radio": "STUDIO_RADIO",
        "voice": "VOICE",
        "accessibility": "ACCESSIBILITY_RENDER",
        "audio-oracle": "AUDIO_ORACLE",
        "milestone-sting": "MILESTONE_STING",
    }
    for fragment, tag in mapping.items():
        if fragment in path:
            tags.append(tag)
    return sorted(set(tags or ["UNCLASSIFIED_AUDIO"]))


def _preserved_audio_path(row: dict[str, Any]) -> Path:
    original = PILOT_ROOT / row["relative_path"]
    if original.exists():
        return original
    relative = Path(row["relative_path"])
    prefix = Path("08_audition-app/v2")
    try:
        suffix = relative.relative_to(prefix)
    except ValueError as error:
        raise RuntimeError(f"prior complete-register audio disappeared outside the allowed app relocation: {relative}") from error
    candidates = []
    archive_root = PILOT_ROOT / "08_audition-app/archive"
    if archive_root.is_dir() and not archive_root.is_symlink():
        for build_root in archive_root.glob("v2-*"):
            candidate = build_root / suffix
            if (candidate.is_file() and not candidate.is_symlink()
                    and candidate.stat().st_size == row["bytes"] and sha256_file(candidate) == row["sha256"]):
                candidates.append(candidate)
    if not candidates:
        raise RuntimeError(f"prior app audio relocation is missing: {relative}")
    return sorted(candidates, key=lambda value: str(value))[0]


def _validate_prior_for_preservation(payload: dict[str, Any]) -> None:
    if (payload.get("schema") != "project-studio-complete-audio-file-register/v1"
            or payload.get("status") != "PROTOTYPE_ONLY" or payload.get("machine_verdict") != "PASS"):
        raise RuntimeError("refusing to archive a malformed or failed prior complete register")
    records = payload.get("files")
    if not isinstance(records, list) or payload.get("counts", {}).get("audio_files") != len(records):
        raise RuntimeError("prior complete register has inconsistent file counts")
    for row in records:
        path = _preserved_audio_path(row)
        if (not path.is_file() or path.is_symlink() or path.stat().st_size != row.get("bytes")
                or sha256_file(path) != row.get("sha256") or probe_audio(path) != row.get("format")):
            raise RuntimeError(f"prior complete-register audio is not preserved byte-exactly: {row.get('relative_path')}")


def _archive_prior(payload: dict[str, Any]) -> dict[str, Any]:
    _validate_prior_for_preservation(payload)
    raw = OUTPUT.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    HISTORY_ROOT.mkdir(parents=True, exist_ok=True)
    destination = HISTORY_ROOT / f"COMPLETE-AUDIO-FILE-REGISTER.v1-{digest}.json"
    if destination.exists():
        if not destination.is_file() or destination.is_symlink() or destination.read_bytes() != raw:
            raise RuntimeError(f"complete-register archive content-address collision: {destination}")
    else:
        descriptor, name = tempfile.mkstemp(prefix=".complete-register.", suffix=".tmp", dir=HISTORY_ROOT)
        try:
            with os.fdopen(descriptor, "wb") as handle:
                handle.write(raw)
                handle.flush()
                os.fsync(handle.fileno())
            os.chmod(name, 0o444)
            os.replace(name, destination)
        finally:
            Path(name).unlink(missing_ok=True)
    return {
        "path": str(destination), "sha256": digest, "bytes": len(raw),
        "audio_files": payload["counts"]["audio_files"],
    }


def build(_archived_predecessor: dict[str, Any] | None = None) -> dict[str, Any]:
    prior = json.loads(OUTPUT.read_text(encoding="utf-8")) if OUTPUT.is_file() else None
    declarations, mismatches = collect_declarations()
    files: list[dict[str, Any]] = []
    by_content: dict[str, list[dict[str, Any]]] = defaultdict(list)
    symlink_paths: list[str] = []
    for root_name in MEDIA_ROOT_NAMES:
        root = PILOT_ROOT / root_name
        root_resolved = root.resolve(strict=True)
        for candidate in sorted(root.rglob("*")):
            if candidate.is_symlink():
                symlink_paths.append(str(candidate.relative_to(PILOT_ROOT)))
                continue
            if not candidate.is_file() or candidate.suffix.lower() not in AUDIO_SUFFIXES:
                continue
            path = candidate
            resolved = path.resolve(strict=True)
            try:
                resolved.relative_to(root_resolved)
            except ValueError as error:
                raise RuntimeError(f"bounded audio file escaped its exact media root: {path}") from error
            relative = str(path.relative_to(PILOT_ROOT))
            digest = sha256_file(resolved)
            file_id = f"APS01-FILE-{hashlib.sha256(relative.encode('utf-8')).hexdigest()[:24].upper()}"
            source_declarations = declarations.get(resolved, [])
            current = any(row["current_manifest"] for row in source_declarations)
            record = {
                "file_id": file_id,
                "content_id": f"SHA256:{digest}",
                "relative_path": relative,
                "absolute_path": str(resolved),
                "bytes": resolved.stat().st_size,
                "sha256": digest,
                "format": probe_audio(resolved),
                "role_tags": role_tags(relative),
                "evidence_status": "CURRENT_CANONICAL_SOURCE_OR_DERIVATIVE" if current else "PRESERVED_SUPERSEDED_OR_NONCANONICAL_EVIDENCE",
                "rights_status": "PROTOTYPE_ONLY",
                "human_disposition": "PENDING",
                "historical_review": "PENDING" if any(tag in role_tags(relative) for tag in ("RESPONSIVE_MUSIC", "ERA_PICK_LIBRARY", "ERA_TRANSITION", "STUDIO_RADIO")) else "NOT_APPLICABLE_OR_NOT_ERA_BEARING",
                "cultural_review": "PENDING" if any(tag in role_tags(relative) for tag in ("RESPONSIVE_MUSIC", "ERA_PICK_LIBRARY", "ERA_TRANSITION", "STUDIO_RADIO")) else "NOT_APPLICABLE_OR_NOT_ERA_BEARING",
                "redistribution_status": "UNRESOLVED_LOCAL_SCRATCH_DO_NOT_DISTRIBUTE" if "VOICE" in role_tags(relative) else "NOT_CLEARED_PROTOTYPE_ONLY",
                "declarations": source_declarations,
            }
            files.append(record)
            by_content[digest].append(record)
    ids = [row["file_id"] for row in files]
    paths = [row["relative_path"] for row in files]
    duplicate_groups = [
        {
            "content_sha256": digest,
            "file_count": len(rows),
            "file_ids": [row["file_id"] for row in rows],
            "relative_paths": [row["relative_path"] for row in rows],
            "disposition": "ACKNOWLEDGED_IDENTICAL_CONTENT; DISTINCT FILE IDENTITY; NO CLAIM OF DISTINCT AUDIO",
        }
        for digest, rows in sorted(by_content.items())
        if len(rows) > 1
    ]
    undeclared = [row["relative_path"] for row in files if not row["declarations"]]
    checks = {
        "bounded_media_roots_only": True,
        "file_id_unique": len(ids) == len(set(ids)),
        "relative_path_unique": len(paths) == len(set(paths)),
        "every_audio_file_hashed": all(len(row["sha256"]) == 64 for row in files),
        "every_audio_file_has_unique_file_id": len(ids) == len(set(ids)) == len(files),
        "every_audio_file_has_prior_declaration": not undeclared,
        "no_declaration_hash_mismatch": not mismatches,
        "no_symlinks_in_bounded_media_roots": not symlink_paths,
        "duplicate_content_groups_explicit": sum(row["file_count"] for row in duplicate_groups) == sum(len(rows) for rows in by_content.values() if len(rows) > 1),
        "no_distinctness_claim_for_duplicate_content": True,
    }
    documentation_commit = git_head(DOC_REPO)
    unity_commit = git_head(UNITY_REPO)
    source_bindings = {
        lane: [git_file_binding(documentation_commit, path) for path in paths]
        for lane, paths in GENERATOR_BINDINGS.items()
    }
    output = {
        "schema": "project-studio-complete-audio-file-register/v1",
        "created_at": CREATED_AT,
        "status": "PROTOTYPE_ONLY",
        "inventory_scope": {
            "root": str(PILOT_ROOT),
            "bounded_media_roots": list(MEDIA_ROOT_NAMES),
            "audio_suffixes": sorted(AUDIO_SUFFIXES),
            "symlink_policy": "REJECT_EVERY_SYMLINK_BEFORE_RESOLUTION",
            "purpose": "Offline evidence/provenance inventory only; this is not a runtime loader and grants no recursive-loading permission.",
        },
        "source_code": {
            "artifact_generation_commit": documentation_commit,
            "branch": "codex/audio-systems-pilot-01",
            "unity_lab_commit": unity_commit,
            "unity_lab_branch": "wip/audio-systems-pilot-01-client",
            "bindings": source_bindings,
        },
        "counts": {
            "audio_files": len(files),
            "unique_file_ids": len(set(ids)),
            "unique_content_sha256": len(by_content),
            "duplicate_content_groups": len(duplicate_groups),
            "files_in_duplicate_content_groups": sum(row["file_count"] for row in duplicate_groups),
            "current_files": sum(row["evidence_status"].startswith("CURRENT") for row in files),
            "preserved_files": sum(row["evidence_status"].startswith("PRESERVED") for row in files),
        },
        "checks": checks,
        "undeclared_files": undeclared,
        "declaration_hash_mismatches": mismatches,
        "symlink_paths": symlink_paths,
        "duplicate_content_groups": duplicate_groups,
        "files": files,
        "machine_verdict": "PASS" if all(checks.values()) else "FAIL",
        "honesty": [
            "File identity is path-stable and unique; content identity is SHA-256 and may intentionally repeat.",
            "Duplicate hashes are disclosed, never counted as distinct audio candidates, and commonly reflect preserved versions or shared PA/voice renders.",
            "A complete hash inventory does not establish rights, non-infringement, historical correctness, cultural acceptance, quality, or human approval.",
        ],
    }
    predecessor = _archived_predecessor if _archived_predecessor is not None else (prior or {}).get("predecessor")
    if predecessor is not None:
        output["predecessor"] = predecessor
        if output["counts"]["audio_files"] < predecessor["audio_files"]:
            raise RuntimeError("complete audio inventory regressed below its preserved predecessor count")
    candidate_bytes = (json.dumps(output, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode("utf-8")
    if prior is not None and _archived_predecessor is None:
        if OUTPUT.read_bytes() == candidate_bytes:
            _validate_prior_for_preservation(prior)
            return prior
        return build(_archive_prior(prior))
    atomic_write_json(OUTPUT, output)
    return output


def main() -> None:
    output = build()
    print(json.dumps({
        "path": str(OUTPUT),
        "sha256": sha256_file(OUTPUT),
        "counts": output["counts"],
        "machine_verdict": output["machine_verdict"],
        "failed_checks": [key for key, value in output["checks"].items() if not value],
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
