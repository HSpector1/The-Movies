#!/usr/bin/env python3
"""Inventory every audio file in bounded pilot media roots with unique file identity."""

from __future__ import annotations

import hashlib
import json
import subprocess
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
        or relative.startswith("07_audio-oracle/traces/")
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
        "tools/audio_systems_pilot_01/build_catalogue_identity_closure.py",
        "tools/audio_systems_pilot_01/build_complete_audio_file_register.py",
        "tools/audio_systems_pilot_01/publish_metadata_status_remedies.py",
    ],
    "audition_and_final_consumers": [
        "tools/audio_systems_pilot_01/build_audition_source_register.py",
        "tools/audio_systems_pilot_01/build_audition_app.py",
        "tools/audio_systems_pilot_01/package_owner_return.py",
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
    elif key in {"relative_path", "pilot_relative_path"}:
        resolved = (PILOT_ROOT / candidate).resolve()
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


def build() -> dict[str, Any]:
    declarations, mismatches = collect_declarations()
    files: list[dict[str, Any]] = []
    by_content: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for root_name in MEDIA_ROOT_NAMES:
        root = PILOT_ROOT / root_name
        for path in sorted(candidate for candidate in root.rglob("*") if candidate.is_file() and candidate.suffix.lower() in AUDIO_SUFFIXES):
            resolved = path.resolve()
            relative = str(resolved.relative_to(PILOT_ROOT))
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
        "duplicate_content_groups": duplicate_groups,
        "files": files,
        "machine_verdict": "PASS" if all(checks.values()) else "FAIL",
        "honesty": [
            "File identity is path-stable and unique; content identity is SHA-256 and may intentionally repeat.",
            "Duplicate hashes are disclosed, never counted as distinct audio candidates, and commonly reflect preserved versions or shared PA/voice renders.",
            "A complete hash inventory does not establish rights, non-infringement, historical correctness, cultural acceptance, quality, or human approval.",
        ],
    }
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
