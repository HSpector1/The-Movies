#!/usr/bin/env python3
"""Assemble the immutable Owner return package for Audio Systems Pilot 01."""

from __future__ import annotations

import argparse
import ctypes
import csv
import hashlib
import io
import json
import os
import plistlib
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import wave
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

from build_audio_oracle import verify as verify_oracle
from build_audition_app import verify as verify_audition, verify_derivative_projection
from build_complete_audio_file_register import (
    AUDIO_SUFFIXES as COMPLETE_AUDIO_SUFFIXES,
    GENERATOR_BINDINGS,
    MEDIA_ROOT_NAMES as COMPLETE_MEDIA_ROOT_NAMES,
    collect_declarations,
)
from build_hostile_review_index import verify as verify_hostile_reviews
from common import (
    DOC_REPO, PILOT_ROOT, atomic_write_json, atomic_write_text, canonical_contained,
    probe_audio, read_contained_regular_bytes, require_contained_regular_file,
    sha256_file, utc_now,
)
from publish_metadata_status_remedies import catalogue_bytes, catalogue_for_binding


RETURN_ROOT = Path("/Users/bruce/Desktop/Project-Studio-Audio-Systems-Pilot-01")
UNITY_REPO = Path("/Users/bruce/Project Studio - Audio Systems Pilot 01 Client")
DOC_BASE = "c457c3a35a66b2ab4b72b0ca379f118b2f1fa1bf"
UNITY_BASE = "29aea89a706a7f0961f5a460afc5bdb4d38d8395"
AUDITION_SOURCE = PILOT_ROOT / "11_return-package/AUDITION-SOURCE-REGISTER.v2.json"
SYSTEM_REGISTER = PILOT_ROOT / "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v5.json"
MANAGEMENT_CATALOGUE = PILOT_ROOT / "05_management-sfx/semantic-pack/management-semantic-catalogue.v4.json"
MANAGEMENT_SOURCE_CATALOGUE = PILOT_ROOT / "05_management-sfx/semantic-pack/management-semantic-catalogue.v3.json"
MANAGEMENT_HISTORY_ROOT = PILOT_ROOT / "05_management-sfx/semantic-pack/history"
MANAGEMENT_HISTORY_REGISTER = PILOT_ROOT / "05_management-sfx/semantic-pack/MANAGEMENT-METADATA-HISTORY.v1.json"
ORACLE_ROOT = PILOT_ROOT / "07_audio-oracle"
ORACLE_SUITE = ORACLE_ROOT / "AUDIO-ORACLE-SUITE.v1.json"
ORACLE_ARCHIVE_REGISTER = ORACLE_ROOT / "AUDIO-ORACLE-EVIDENCE-ARCHIVE-REGISTER.v1.json"
AUDITION_APP = PILOT_ROOT / "08_audition-app/v2"
AUDITION_APP_HISTORY = PILOT_ROOT / "08_audition-app/AUDITION-APP-HISTORY.v1.json"
AUDITION_PREVIEW_HISTORY = PILOT_ROOT / "11_return-package/audition-previews-v2/AUDITION-PREVIEW-HISTORY.v1.json"
UNITY_VALIDATION = PILOT_ROOT / "09_unity-lab/UNITY-AUDIO-LAB-VALIDATION.json"
UNITY_CURRENT_RUN = PILOT_ROOT / "09_unity-lab/CURRENT-VALIDATION-RUN.json"
BUILD_RECEIPT = PILOT_ROOT / "09_unity-lab/Builds/macOS/Project Studio Audio Systems Pilot.app.build-receipt.json"
LAB_APP = PILOT_ROOT / "09_unity-lab/Builds/macOS/Project Studio Audio Systems Pilot.app"
COMPLETE_AUDIO = PILOT_ROOT / "10_provenance/COMPLETE-AUDIO-FILE-REGISTER.v1.json"
COMPLETE_HISTORY_ROOT = PILOT_ROOT / "10_provenance/complete-register-history"
PREPACKAGE_VALIDATION = PILOT_ROOT / "10_provenance/PREPACKAGE-VALIDATION.v1.json"
STATE = PILOT_ROOT / "00_state/AUDIO-SYSTEMS-PILOT-STATE.json"
AUDIO_SUFFIXES = {".wav", ".m4a", ".mp3", ".aac", ".flac", ".ogg", ".aif", ".aiff"}
PROHIBITED_COMMITTED_SUFFIXES = {
    ".bin", ".ckpt", ".gguf", ".h5", ".hdf5", ".onnx", ".pb", ".pt", ".pth", ".safetensors",
    ".tar", ".tgz", ".whl", ".zip",
}
PROHIBITED_COMMITTED_PARTS = {
    ".mypy_cache", ".pytest_cache", ".ruff_cache", ".tox", ".venv", "__pycache__", "node_modules",
    "private-legal-evidence", "private_legal_evidence", "terms-acceptance", "terms_acceptance", "venv",
}
PROHIBITED_COMMITTED_NAMES = {
    ".env", ".env.local", "account.json", "credentials.json", "huggingface-token", "private-key",
    "private_key", "token.txt",
}
MAX_COMMITTED_BLOB_BYTES = 1_048_576
SECRET_PATTERN = re.compile(
    r"(?:"
    r"hf_[A-Za-z0-9]{20,}"
    r"|(?:Bearer|Basic)\s+[A-Za-z0-9+/._=-]{20,}"
    r"|BEGIN (?:(?:RSA|OPENSSH|EC|DSA|PGP)\s+)?PRIVATE KEY"
    r"|(?:AKIA|ASIA)[A-Z0-9]{16}"
    r"|AIza[0-9A-Za-z_-]{30,}"
    r"|github_pat_[0-9A-Za-z_]{20,}"
    r"|gh[pousr]_[0-9A-Za-z]{20,}"
    r"|xox[baprs]-[0-9A-Za-z-]{10,}"
    r"|sk-(?:proj-)?[0-9A-Za-z_-]{20,}"
    r"|(?:sk|rk)_(?:live|test)_[0-9A-Za-z]{16,}"
    r"|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}"
    r"|[A-Za-z][A-Za-z0-9+.-]*://[^\s/:@]{1,128}:[^\s/@]{8,128}@"
    r"|(?:api[_-]?key|access[_-]?token|auth[_-]?token|refresh[_-]?token|session[_-]?token|"
    r"client[_-]?secret|private[_-]?key|secret(?:[_-]?(?:key|token))?|password|passwd)"
    r"\s*[\"']?\s*[:=]\s*[\"']?[A-Za-z0-9+/._=-]{12,}"
    r")",
    re.IGNORECASE,
)
STAGED_TEXT_SUFFIXES = {
    ".command", ".conf", ".css", ".csv", ".html", ".ini", ".js", ".json", ".log",
    ".md", ".plist", ".py", ".sh", ".toml", ".ts", ".txt", ".xml", ".yaml", ".yml",
}
PROHIBITED_STAGED_NAMES = {
    ".env", ".env.local", ".env.production", "account.json", "credentials.json", "credentials.ini",
    "huggingface-token", "private-key", "private_key", "secrets.json", "token.txt",
}
PROHIBITED_STAGED_PARTS = {
    "private-legal-evidence", "private_legal_evidence", "terms-acceptance", "terms_acceptance",
    "license-acceptance", "license_acceptance", "account-evidence", "account_evidence",
}
COMPLETE_ROLE_TAG_FRAGMENTS = (
    ("responsive", "RESPONSIVE_MUSIC"),
    ("library", "ERA_PICK_LIBRARY"),
    ("transitions", "ERA_TRANSITION"),
    ("living-lot", "LIVING_LOT"),
    ("management", "MANAGEMENT_SFX"),
    ("lot-detail", "LOT_DETAIL_SFX"),
    ("radio", "STUDIO_RADIO"),
    ("voice", "VOICE"),
    ("accessibility", "ACCESSIBILITY_RENDER"),
    ("audio-oracle", "AUDIO_ORACLE"),
    ("milestone-sting", "MILESTONE_STING"),
)
COMPLETE_ERA_BEARING_TAGS = frozenset({
    "RESPONSIVE_MUSIC", "ERA_PICK_LIBRARY", "ERA_TRANSITION", "STUDIO_RADIO",
})
REQUIRED_DIRS = (
    "AUDIO-LAB", "MUSIC/EARLY", "MUSIC/MID", "MUSIC/MODERN", "TRANSITIONS", "LIVING-LOT",
    "MANAGEMENT-SFX", "RADIO/EARLY", "RADIO/POSTWAR", "RADIO/DIGITAL", "ACCESSIBILITY",
    "AUDIO-ORACLE", "AUDITION", "CATALOGUE", "PROVENANCE",
)
DOC_NAMES = (
    "CODEX-AUDIO-SYSTEMS-PILOT-01-REPORT.md",
    "CODEX-AUDIO-SYSTEMS-PILOT-01-BUILDER-ANNEX.md",
    "CODEX-RESPONSIVE-MUSIC-BUNDLES-01.md",
    "CODEX-ERA-TRANSITION-ATLAS-01.md",
    "CODEX-LIVING-LOT-SOUNDSCAPE-01.md",
    "CODEX-MANAGEMENT-AUDIO-LANGUAGE-01.md",
    "CODEX-STUDIO-RADIO-RUNTIME-01.md",
    "CODEX-AUDIO-ACCESSIBILITY-01.md",
    "CODEX-AUDIO-ORACLE-01.md",
    "CODEX-AUDIO-SYSTEMS-PILOT-01-INTEGRATION-HANDOFF.md",
    "CODEX-AUDIO-SYSTEMS-PILOT-01-RESUME.md",
)
CATALOGUE_SOURCES = (
    PILOT_ROOT / "01_catalogue/AudioPrototypeCatalogue.v1.json",
    PILOT_ROOT / "01_catalogue/AudioPrototypeCatalogue.identity-closure.v3.json",
    SYSTEM_REGISTER,
    AUDITION_SOURCE,
    PILOT_ROOT / "10_provenance/audio-assets-index.v4.json",
    PILOT_ROOT / "02_music-bundles/responsive/responsive-anchor-authority.v2.json",
    PILOT_ROOT / "02_music-bundles/responsive/responsive-generation-register.v2.json",
    PILOT_ROOT / "02_music-bundles/responsive/responsive-bundle-catalogue.v2.json",
    PILOT_ROOT / "02_music-bundles/simulations/FOUR-HOUR-DENSITY-SIMULATIONS.v2.json",
    PILOT_ROOT / "03_transitions/rendered-transition-catalogue.v4.json",
    PILOT_ROOT / "04_living-lot/living-lot-soundscape-catalogue.v3.json",
    PILOT_ROOT / "05_management-sfx/generated-lot-detail/lot-detail-sfx-catalogue.json",
    MANAGEMENT_CATALOGUE,
    PILOT_ROOT / "06_radio/STUDIO-RADIO-RUNTIME-INDEX.v2.json",
    PILOT_ROOT / "06_radio/script-bank/STUDIO-RADIO-SCRIPT-BANK-01-CLEAN.v2.json",
    PILOT_ROOT / "06_radio/script-bank/RADIO-COPY-LINT.v2.json",
    PILOT_ROOT / "06_radio/functional-fixtures.v2.json",
    PILOT_ROOT / "06_radio/presenter-ensemble.v2.json",
    PILOT_ROOT / "06_radio/scheduler-evidence/RADIO-SCHEDULER-EVIDENCE.v2.json",
    PILOT_ROOT / "06_radio/scheduler-evidence/RADIO-SCHEDULER-INPUT.v2.json",
    PILOT_ROOT / "07_audio-oracle/accessibility-renders-v4/ACCESSIBILITY-PRESETS.v4.json",
    PILOT_ROOT / "07_audio-oracle/accessibility-renders-v4/ACCESSIBILITY-BUS-CONTRIBUTIONS.v4.json",
    ORACLE_SUITE,
)
PROVENANCE_SOURCES = (
    PILOT_ROOT / "10_provenance/phase-a-reconciliation.json",
    PILOT_ROOT / "10_provenance/source-authority-hashes.json",
    PILOT_ROOT / "10_provenance/sfx-route-gate.v2.json",
    PILOT_ROOT / "10_provenance/audio-assets-validation.v4.json",
    PILOT_ROOT / "10_provenance/audio-derivative-source-register.v4.json",
    MANAGEMENT_HISTORY_REGISTER,
    COMPLETE_AUDIO,
    PILOT_ROOT / "11_return-package/audition-previews-v2/AUDITION-PREVIEW-DERIVATIVES.json",
    AUDITION_PREVIEW_HISTORY,
    AUDITION_APP_HISTORY,
    PREPACKAGE_VALIDATION,
)
FEEDBACK_FIELDS = (
    "item_id", "source_register_sha256", "item_audio_sha256", "collection", "epoch", "context",
    "musicalQuality", "eraFit", "studioIdentity",
    "managementSuitability", "irritation", "repetition", "transitionQuality", "ambienceQuality",
    "radioCopyCredibility", "voicePerformance", "ducking", "uiSoundRestraint", "accessibility",
    "verdict", "notes", "saved_at",
)

BOUND_SOURCE_PATHS = (
    *(f"docs/audio/{name}" for name in DOC_NAMES),
    "tools/audio_systems_pilot_01/build_audio_oracle.py",
    "tools/audio_systems_pilot_01/build_audition_app.py",
    "tools/audio_systems_pilot_01/build_audition_source_register.py",
    "tools/audio_systems_pilot_01/audition_app_source/index.html",
    "tools/audio_systems_pilot_01/audition_app_source/styles.css",
    "tools/audio_systems_pilot_01/audition_app_source/app.js",
    "tools/audio_systems_pilot_01/audition_app_source/serve_audition.py",
    "tools/audio_systems_pilot_01/audition_app_source/START-AUDITION.command",
    "tools/audio_systems_pilot_01/build_complete_audio_file_register.py",
    "tools/audio_systems_pilot_01/build_hostile_review_index.py",
    "tools/audio_systems_pilot_01/build_system_asset_register.py",
    "tools/audio_systems_pilot_01/common.py",
    "tools/audio_systems_pilot_01/reconcile_catalogue.py",
    "tools/audio_systems_pilot_01/sfx_route.py",
    "tools/audio_systems_pilot_01/package_owner_return.py",
    "tools/audio_systems_pilot_01/repair_unity_validation_archives.py",
    "tools/audio_systems_pilot_01/run_unity_lab_validation.zsh",
    "tools/audio_systems_pilot_01/snapshot_unity_validation_run.py",
    "tools/audio_systems_pilot_01/update_final_state.py",
    "tools/audio_systems_pilot_01/validate_audio_systems_pilot.py",
)
UNITY_ARTIFACT_PATHS = {
    "09_unity-lab/Logs/compile-final.log",
    "09_unity-lab/Logs/editmode-final.log",
    "09_unity-lab/Logs/playmode-final.log",
    "09_unity-lab/Logs/build-final.log",
    "09_unity-lab/Logs/oracle-final.log",
    "09_unity-lab/Logs/process-gate-compile-final.log",
    "09_unity-lab/Logs/process-gate-editmode-final.log",
    "09_unity-lab/Logs/process-gate-playmode-final.log",
    "09_unity-lab/Logs/process-gate-build-final.log",
    "09_unity-lab/Logs/process-gate-oracle-final.log",
    "09_unity-lab/Logs/process-gate-validation-summary-final.log",
    "09_unity-lab/TestResults/editmode-final.xml",
    "09_unity-lab/TestResults/playmode-final.xml",
    "09_unity-lab/Builds/macOS/Project Studio Audio Systems Pilot.app.build-receipt.json",
    "09_unity-lab/RuntimeEvidence/audio-oracle-runtime-observations.json",
    "07_audio-oracle/AUDIO-ORACLE-SUITE.v1.json",
    "07_audio-oracle/AUDIO-ORACLE-EVIDENCE-ARCHIVE-REGISTER.v1.json",
    "05_management-sfx/semantic-pack/management-semantic-catalogue.v4.json",
}
AUTHORIZED_UNITY_ARCHIVE_REPAIRS = {
    "20260903T133507Z-30281": {
        "archive_manifest_sha256": "3edf36502e18c360adf47aa42cca9a7cac0f94c3402f1d327f9f0de89aed3c33",
        "current_pointer_sha256": "d48d7c50fe15a901dde2806371b89e94b7baaee66a77e944768d7f4dfd924187",
        "validation_sha256": "a2ea55aa0f49dcfb1e3775b7c7ea19ef0f88b685881560229180818882459db8",
        "relative_path": "05_management-sfx/semantic-pack/management-semantic-catalogue.v4.json",
        "archived_bytes": 139_956,
        "archived_sha256": "6aaff305fd6d843f1334c8cf17164589de31d378858fe779c5732c286184c9fb",
        "expected_bytes": 139_956,
        "expected_sha256": "af47f60155e7e5453093174f375878e36536b95a2f591065b5a4ae4a06044ba8",
        "pointer_documentation_sha": "14d1b412555e53e79b7b63efaf5f1f506a8ab298",
        "archive_creation_documentation_sha": "df7c81e68e89655772ab645eb2af8aefd028e80c",
        "historical_outcome": "FAIL",
    },
}
IMMUTABLE_SOURCE_REFS = {
    "era_aware_audio_marathon_remote_tip": "c457c3a35a66b2ab4b72b0ca379f118b2f1fa1bf",
    "era_aware_music_direction": "f803164357ad417cea3162cb2c329890868f2b19",
    "era_aware_music_pilot_remote_tip": "65596e47f9e7b9de33bd9530ee573390416d329e",
    "p13_p15_binding_commit": "2a7ff0d973391f9433d19ec2cb7f6c5582d1e44f",
    "unity_pre_p05_baseline": UNITY_BASE,
}
CORE_STATE_COUNTS = {
    "catalogue_entries": 203,
    "catalogue_entries_identity_closed": 203,
    "source_catalogue_raws_rehashed": 203,
    "motif_no_randomness_seed_dispositions": 12,
    "responsive_bundles": 3,
    "responsive_candidates": 36,
    "responsive_eligible": 32,
    "responsive_excluded": 4,
    "responsive_selected": 12,
    "responsive_variants": 12,
    "transition_atlas_boundaries": 8,
    "transition_prototypes_current": 9,
    "living_lot_layers": 3,
    "living_lot_fixtures": 5,
    "management_semantic_families": 15,
    "management_candidates": 45,
    "management_provisional_picks": 15,
    "management_alternates": 15,
    "radio_units_audited": 126,
    "radio_units_runtime_decorative": 108,
    "radio_units_functional_withheld": 18,
    "radio_demo_programs": 3,
    "radio_thirty_minute_simulations": 3,
    "accessibility_demo_renders": 6,
    "four_hour_density_traces": 12,
    "system_register_items": 147,
    "master_index_audio_assets": 152,
    "derivative_source_relationships": 80,
    "phase_asset_generated_audio_files": 124,
    "phase_asset_derived_audio_files": 113,
    "oracle_offline_processor_marker_renders": 2,
    "audio_oracle_scenarios": 20,
    "hostile_review_lanes": 8,
}
STATE_COUNT_SCOPES = {
    "phase_asset_generated_audio_files": "Bounded content-generation phase outputs before Unity Oracle markers and audition-preview materialization.",
    "phase_asset_derived_audio_files": "Bounded content-generation phase derivatives before Unity Oracle markers and audition-preview materialization.",
    "oracle_offline_processor_marker_renders": "Exactly the two current Unity Editor offline processor marker WAVs; not runtime mix captures.",
    "audition_preview_derivative_files": "Current AAC audition derivatives whose conversion register explicitly reports AAC_AUDITION_DERIVATIVE.",
    "bounded_audio_files": "All current and preserved audio files under the complete register's bounded media roots.",
}
PACKAGING_NEXT_ACTION = "Create and independently verify the immutable Owner return package."
VALIDATION_NEXT_ACTION = "Run fail-closed final validation against the immutable Owner return package."
OWNER_NEXT_ACTION = "Owner launches the isolated Audio Lab, listens and rates the prototype, then chooses revisions or a separately authorized post-P05 integration checkpoint."


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def rename_directory_exclusive(source: Path, destination: Path) -> None:
    """Atomically publish a same-filesystem directory without replacing anything."""
    require(source.parent.resolve(strict=True) == destination.parent.resolve(strict=True),
            "return package staging and destination are not same-parent entries")
    libc = ctypes.CDLL(None, use_errno=True)
    rename_exclusive = libc.renameatx_np
    rename_exclusive.argtypes = [
        ctypes.c_int, ctypes.c_char_p, ctypes.c_int, ctypes.c_char_p, ctypes.c_uint,
    ]
    rename_exclusive.restype = ctypes.c_int
    if rename_exclusive(
        -2, os.fsencode(source), -2, os.fsencode(destination), 0x00000004
    ) != 0:
        error = ctypes.get_errno()
        raise OSError(error, os.strerror(error), str(destination))


def git(repo: Path, *arguments: str) -> str:
    return subprocess.run(["git", *arguments], cwd=repo, check=True, capture_output=True, text=True).stdout.strip()


def pilot_path(value: str) -> Path:
    candidate = Path(value)
    if not candidate.is_absolute():
        candidate = PILOT_ROOT / candidate
    return canonical_contained(PILOT_ROOT, candidate)


def expected_complete_file_policy(relative_path: str) -> dict[str, Any]:
    """Recompute policy fields from the canonical path, independently of the publisher."""
    candidate = Path(relative_path)
    require(not candidate.is_absolute() and candidate.as_posix() == relative_path
            and "." not in candidate.parts and ".." not in candidate.parts,
            f"complete-register relative path is not canonical: {relative_path}")
    lowered = relative_path.lower()
    tags = sorted({tag for fragment, tag in COMPLETE_ROLE_TAG_FRAGMENTS if fragment in lowered}
                  or {"UNCLASSIFIED_AUDIO"})
    era_bearing = bool(set(tags) & COMPLETE_ERA_BEARING_TAGS)
    return {
        "role_tags": tags,
        "historical_review": "PENDING" if era_bearing else "NOT_APPLICABLE_OR_NOT_ERA_BEARING",
        "cultural_review": "PENDING" if era_bearing else "NOT_APPLICABLE_OR_NOT_ERA_BEARING",
        "redistribution_status": (
            "UNRESOLVED_LOCAL_SCRATCH_DO_NOT_DISTRIBUTE"
            if "VOICE" in tags else "NOT_CLEARED_PROTOTYPE_ONLY"
        ),
    }


def verify_complete_file_policy(row: dict[str, Any]) -> None:
    expected = expected_complete_file_policy(row.get("relative_path", ""))
    for field, value in expected.items():
        require(row.get(field) == value,
                f"complete-register {field} is stale or permissive: {row.get('relative_path')}")


def staged_path_is_prohibited(relative: Path) -> bool:
    lowered_parts = tuple(part.lower() for part in relative.parts)
    if any(part in PROHIBITED_STAGED_PARTS for part in lowered_parts):
        return True
    name = relative.name.lower()
    if name in PROHIBITED_STAGED_NAMES or name.startswith(".env."):
        return True
    normalized_parts = tuple(re.sub(r"[^a-z0-9]+", "-", part).strip("-") for part in lowered_parts)
    prohibited_phrases = (
        "private-legal-evidence", "terms-acceptance", "license-acceptance", "account-evidence",
        "credentials", "credential", "secrets", "secret", "private-key", "auth-token", "api-key",
        "token", "tokens", "password", "passwd",
    )
    if any(any(f"-{phrase}-" in f"-{part}-" for phrase in prohibited_phrases)
           for part in normalized_parts):
        return True
    return False


def verify_staged_external_hygiene(root: Path) -> dict[str, int]:
    """Scan staged evidence text and every staged name for private/credential material."""
    root = root.resolve(strict=True)
    paths_scanned = 0
    text_files_scanned = 0
    for path in sorted(root.rglob("*"), key=lambda candidate: str(candidate)):
        relative = path.relative_to(root)
        paths_scanned += 1
        require(not staged_path_is_prohibited(relative),
                f"return package contains a prohibited private-evidence/credential path: {relative}")
        if path.is_symlink() or not path.is_file() or path.suffix.lower() not in STAGED_TEXT_SUFFIXES:
            continue
        raw = path.read_bytes()
        if path.suffix.lower() == ".plist" and raw.startswith(b"bplist"):
            continue
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError:
            # Some signed Unity/Mono support text is legacy single-byte encoded.
            # Latin-1 preserves every byte for credential-pattern inspection.
            text = raw.decode("latin-1")
        text_files_scanned += 1
        match = SECRET_PATTERN.search(text)
        require(match is None, f"credential/key-like content found in staged external evidence: {relative}")
    return {"paths_scanned": paths_scanned, "text_files_scanned": text_files_scanned}


def verify_committed_delta_policy(repo: Path, revision: str, paths: list[str]) -> None:
    """Reject committed audio, weights, caches, environments, secrets-by-name, and large blobs."""
    for relative in paths:
        normalized_parts = {part.lower() for part in Path(relative).parts}
        name = Path(relative).name.lower()
        suffix = Path(relative).suffix.lower()
        require(not (normalized_parts & PROHIBITED_COMMITTED_PARTS), f"prohibited cache/environment/legal-evidence path committed: {relative}")
        require(name not in PROHIBITED_COMMITTED_NAMES, f"credential/account path committed: {relative}")
        require(suffix not in AUDIO_SUFFIXES, f"audio binary committed to pilot branch: {relative}")
        require(suffix not in PROHIBITED_COMMITTED_SUFFIXES, f"weight/archive binary committed to pilot branch: {relative}")
        identity = f"{revision}:{relative}"
        exists = subprocess.run(["git", "cat-file", "-e", identity], cwd=repo, check=False, capture_output=True)
        # A deleted path has no blob at this revision; its earlier blob is audited
        # at the commit that introduced or modified it.
        if exists.returncode != 0:
            continue
        size = int(git(repo, "cat-file", "-s", identity))
        require(size <= MAX_COMMITTED_BLOB_BYTES, f"committed pilot blob exceeds small-source limit: {relative}")
        blob = subprocess.run(["git", "show", identity], cwd=repo, check=True, capture_output=True).stdout
        try:
            text = blob.decode("utf-8")
        except UnicodeDecodeError:
            text = ""
        require(SECRET_PATTERN.search(text) is None, f"credential-like content committed: {relative} at {revision}")


def verify_committed_history_policy(
    repo: Path,
    base: str,
    head: str,
    *,
    allowed_prefixes: tuple[str, ...],
    allowed_exact: tuple[str, ...] = (),
    prohibited_path_tokens: tuple[str, ...] = (),
) -> dict[str, Any]:
    """Audit every commit/blob in base..head, including paths later deleted."""
    commits = [row for row in git(repo, "rev-list", "--reverse", "--topo-order", f"{base}..{head}").splitlines() if row]
    all_paths: set[str] = set()
    for revision in commits:
        completed = subprocess.run(
            ["git", "diff-tree", "-m", "--root", "--no-commit-id", "--name-only", "-r", "-z", revision],
            cwd=repo, check=True, capture_output=True,
        )
        paths = sorted({row.decode("utf-8") for row in completed.stdout.split(b"\0") if row})
        for relative in paths:
            require(relative in allowed_exact or relative.startswith(allowed_prefixes),
                    f"committed history escaped owned paths at {revision}: {relative}")
            lowered = relative.lower()
            require(not any(token in lowered for token in prohibited_path_tokens),
                    f"committed history touched a prohibited collision path at {revision}: {relative}")
        verify_committed_delta_policy(repo, revision, paths)
        all_paths.update(paths)
    return {"commits_audited": len(commits), "paths": sorted(all_paths)}


def bundle_file_content_tree_sha256(app: Path) -> str:
    root = app.resolve(strict=True)
    entries = list(root.rglob("*"))
    require(not any(path.is_symlink() for path in entries), "Audio Lab bundle contains a refused symlink")
    lines: list[str] = []
    for path in sorted((path for path in entries if path.is_file()), key=lambda value: str(value)):
        relative = str(path.relative_to(root))
        lines.append(f"{relative}\0{path.stat().st_size}\0{sha256_file(path)}\n")
    return hashlib.sha256("".join(lines).encode("utf-8")).hexdigest()


def verify_clean_pushed_sources() -> dict[str, str]:
    require(git(DOC_REPO, "branch", "--show-current") == "codex/audio-systems-pilot-01", "wrong documentation branch")
    require(git(UNITY_REPO, "branch", "--show-current") == "wip/audio-systems-pilot-01-client", "wrong Unity branch")
    require(git(DOC_REPO, "status", "--porcelain", "--untracked-files=all") == "", "documentation worktree is not clean")
    require(git(UNITY_REPO, "status", "--porcelain", "--untracked-files=all") == "", "Unity worktree is not clean")
    doc_sha = git(DOC_REPO, "rev-parse", "HEAD")
    unity_sha = git(UNITY_REPO, "rev-parse", "HEAD")
    subprocess.run(["git", "merge-base", "--is-ancestor", DOC_BASE, doc_sha], cwd=DOC_REPO, check=True)
    subprocess.run(["git", "merge-base", "--is-ancestor", UNITY_BASE, unity_sha], cwd=UNITY_REPO, check=True)
    require(doc_sha == git(DOC_REPO, "rev-parse", "@{upstream}"), "documentation branch is not fully pushed")
    require(unity_sha == git(UNITY_REPO, "rev-parse", "@{upstream}"), "Unity branch is not fully pushed")
    doc_paths = [row for row in git(DOC_REPO, "diff", "--name-only", f"{DOC_BASE}..{doc_sha}").splitlines() if row]
    unity_paths = [row for row in git(UNITY_REPO, "diff", "--name-only", f"{UNITY_BASE}..{unity_sha}").splitlines() if row]
    require(all(row.startswith(("docs/audio/", "tools/audio_systems_pilot_01/")) for row in doc_paths), "documentation branch escaped owned paths")
    require(all(row == "Assets/ProjectStudioAudioLab.meta" or row.startswith("Assets/ProjectStudioAudioLab/") for row in unity_paths), "Unity branch escaped additive root")
    verify_committed_history_policy(
        DOC_REPO, DOC_BASE, doc_sha, allowed_prefixes=("docs/audio/", "tools/audio_systems_pilot_01/"),
    )
    verify_committed_history_policy(
        UNITY_REPO, UNITY_BASE, unity_sha, allowed_prefixes=("Assets/ProjectStudioAudioLab/",),
        allowed_exact=("Assets/ProjectStudioAudioLab.meta",),
        prohibited_path_tokens=("studiolot", "campaign/living-lot", "generated bridge", "generated dto"),
    )
    for relative in BOUND_SOURCE_PATHS:
        working = DOC_REPO / relative
        require(working.is_file(), f"required committed source missing: {relative}")
        committed = subprocess.run(
            ["git", "show", f"{doc_sha}:{relative}"], cwd=DOC_REPO, check=False, capture_output=True
        )
        require(committed.returncode == 0, f"required source is not tracked at current HEAD: {relative}")
        require(hashlib.sha256(committed.stdout).hexdigest() == sha256_file(working), f"working source differs from HEAD: {relative}")
    return {"documentation_sha": doc_sha, "unity_sha": unity_sha}


def _resolve_preserved_complete_audio(row: dict[str, Any]) -> Path:
    original = PILOT_ROOT / row["relative_path"]
    if original.exists():
        return original
    try:
        suffix = Path(row["relative_path"]).relative_to("08_audition-app/v2")
    except ValueError as error:
        raise RuntimeError(f"complete-register predecessor audio disappeared: {row['relative_path']}") from error
    matches = [
        candidate for candidate in (PILOT_ROOT / "08_audition-app/archive").glob(f"v2-*/{suffix}")
        if (candidate.is_file() and not candidate.is_symlink() and candidate.stat().st_size == row.get("bytes")
            and sha256_file(candidate) == row.get("sha256"))
    ]
    require(matches, f"complete-register predecessor app relocation is missing: {row['relative_path']}")
    return sorted(matches, key=lambda value: str(value))[0]


def verify_complete_predecessor_chain(payload: dict[str, Any]) -> dict[str, Any]:
    predecessor = payload.get("predecessor")
    require(isinstance(predecessor, dict), "complete register lacks its required predecessor chain")
    seen: set[Path] = set()
    child_count = payload.get("counts", {}).get("audio_files", -1)
    digests: list[str] = []
    while predecessor is not None:
        lexical = Path(predecessor.get("path", ""))
        require(not lexical.is_symlink(), f"complete-register predecessor path is a symlink: {lexical}")
        path = canonical_contained(COMPLETE_HISTORY_ROOT, lexical)
        require(path.parent == COMPLETE_HISTORY_ROOT.resolve(strict=True), "nested complete-register predecessor path is prohibited")
        digest = predecessor.get("sha256")
        require(path.name == f"COMPLETE-AUDIO-FILE-REGISTER.v1-{digest}.json"
                and path not in seen and path.is_file() and not path.is_symlink()
                and path.stat().st_size == predecessor.get("bytes") and sha256_file(path) == digest,
                f"complete-register predecessor identity failed: {path}")
        prior = json.loads(path.read_text(encoding="utf-8"))
        records = prior.get("files", [])
        prior_count = prior.get("counts", {}).get("audio_files")
        require(prior.get("schema") == "project-studio-complete-audio-file-register/v1"
                and prior.get("status") == "PROTOTYPE_ONLY" and prior.get("machine_verdict") == "PASS"
                and isinstance(records, list) and prior_count == len(records)
                and predecessor.get("audio_files") == prior_count and child_count >= prior_count,
                f"complete-register predecessor contract/count regression failed: {path}")
        for row in records:
            verify_complete_file_policy(row)
            audio = _resolve_preserved_complete_audio(row)
            require(audio.is_file() and not audio.is_symlink() and audio.stat().st_size == row.get("bytes")
                    and sha256_file(audio) == row.get("sha256") and probe_audio(audio) == row.get("format"),
                    f"complete-register predecessor audio is not preserved: {row.get('relative_path')}")
        seen.add(path)
        digests.append(digest)
        child_count = prior_count
        predecessor = prior.get("predecessor")
    actual = set(COMPLETE_HISTORY_ROOT.iterdir())
    require(all(path.is_file() and not path.is_symlink()
                and re.fullmatch(r"COMPLETE-AUDIO-FILE-REGISTER\.v1-[0-9a-f]{64}\.json", path.name)
                for path in actual), "complete-register history contains an invalid entry")
    require(actual == seen, "complete-register history contains an orphaned or missing predecessor")
    aggregate = hashlib.sha256("\n".join(digests).encode("ascii")).hexdigest()
    return {"predecessor_registers": len(seen), "predecessor_chain_sha256": aggregate}


def verify_complete_audio_register(doc_sha: str, unity_sha: str) -> dict[str, Any]:
    payload = json.loads(COMPLETE_AUDIO.read_text(encoding="utf-8"))
    require(payload.get("schema") == "project-studio-complete-audio-file-register/v1", "complete register schema mismatch")
    require(payload.get("status") == "PROTOTYPE_ONLY", "complete register top-level rights status mismatch")
    require(payload.get("machine_verdict") == "PASS" and all(payload.get("checks", {}).values()), "complete register failed")
    require(payload.get("undeclared_files") == [] and payload.get("declaration_hash_mismatches") == [], "complete register records an undeclared/hash-mismatched file")
    require(payload.get("inventory_scope", {}).get("root") == str(PILOT_ROOT)
            and payload["inventory_scope"].get("bounded_media_roots") == list(COMPLETE_MEDIA_ROOT_NAMES)
            and set(payload["inventory_scope"].get("audio_suffixes", [])) == COMPLETE_AUDIO_SUFFIXES
            and payload["inventory_scope"].get("symlink_policy") == "REJECT_EVERY_SYMLINK_BEFORE_RESOLUTION",
            "complete register inventory scope is stale")
    source = payload.get("source_code", {})
    require(source.get("branch") == "codex/audio-systems-pilot-01", "complete register documentation branch binding is stale")
    require(source.get("artifact_generation_commit") == doc_sha, "complete register documentation binding is stale")
    require(source.get("unity_lab_commit") == unity_sha and source.get("unity_lab_branch") == "wip/audio-systems-pilot-01-client", "complete register Unity binding is stale")
    bindings = source.get("bindings", {})
    require(set(bindings) == set(GENERATOR_BINDINGS), "complete register binding groups are missing or extra")
    for group, expected_paths in GENERATOR_BINDINGS.items():
        rows = bindings.get(group, [])
        require([row.get("path") for row in rows] == expected_paths, f"complete register binding path set/order failed: {group}")
        for row in rows:
            relative = row["path"]
            working = DOC_REPO / relative
            committed = subprocess.run(
                ["git", "show", f"{doc_sha}:{relative}"], cwd=DOC_REPO, check=False, capture_output=True
            )
            require(committed.returncode == 0 and working.is_file(), f"complete register bound source unavailable: {relative}")
            committed_hash = hashlib.sha256(committed.stdout).hexdigest()
            working_hash = sha256_file(working)
            require(row.get("commit") == doc_sha and row.get("matches_bound_commit") is True
                    and row.get("committed_blob_sha256") == committed_hash
                    and row.get("working_file_sha256") == working_hash
                    and committed_hash == working_hash, f"complete register source binding failed: {relative}")
    records = payload.get("files", [])
    registered = {row.get("relative_path") for row in records}
    require(None not in registered and len(registered) == len(records), "complete register paths are duplicate or missing")
    actual: set[str] = set()
    actual_symlinks: list[str] = []
    for root_name in payload["inventory_scope"]["bounded_media_roots"]:
        root = PILOT_ROOT / root_name
        root_resolved = root.resolve(strict=True)
        for path in root.rglob("*"):
            if path.is_symlink():
                actual_symlinks.append(str(path.relative_to(PILOT_ROOT)))
                continue
            if not path.is_file() or path.suffix.lower() not in AUDIO_SUFFIXES:
                continue
            try:
                path.resolve(strict=True).relative_to(root_resolved)
            except ValueError as error:
                raise RuntimeError(f"bounded audio escaped its exact media root: {path}") from error
            actual.add(str(path.relative_to(PILOT_ROOT)))
    require(not actual_symlinks and payload.get("symlink_paths") == [], "complete-register bounded roots contain or record a symlink")
    require(registered == actual, "complete register does not equal the bounded audio filesystem")
    require(len({row.get("file_id") for row in records}) == len(records), "complete register file IDs are not unique")
    declarations, declaration_mismatches = collect_declarations()
    require(not declaration_mismatches, "live audio declarations contain a hash mismatch")
    for row in records:
        lexical_path = PILOT_ROOT / row["relative_path"]
        require(not lexical_path.is_symlink(), f"complete-register lexical path is a symlink: {lexical_path}")
        path = canonical_contained(PILOT_ROOT, lexical_path)
        expected_file_id = "APS01-FILE-" + hashlib.sha256(row["relative_path"].encode("utf-8")).hexdigest()[:24].upper()
        require(row.get("file_id") == expected_file_id and row.get("absolute_path") == str(path)
                and row.get("content_id") == f"SHA256:{row['sha256']}", f"complete-register path/content identity is stale: {path}")
        require(path.is_file() and not path.is_symlink() and row.get("absolute_path") == str(path), f"complete-register file is not regular or absolute identity changed: {path}")
        require(path.stat().st_size == row["bytes"] and sha256_file(path) == row["sha256"], f"complete-register file changed: {path}")
        require(probe_audio(path) == row.get("format"), f"complete-register format probe changed: {path}")
        require(row.get("rights_status") == "PROTOTYPE_ONLY" and row.get("human_disposition") == "PENDING", "complete-register status boundary violated")
        verify_complete_file_policy(row)
        expected_declarations = declarations.get(path, [])
        require(expected_declarations and row.get("declarations") == expected_declarations,
                f"complete-register declaration projection is empty or stale: {path}")
        expected_current = any(record.get("current_manifest") for record in expected_declarations)
        require(row.get("evidence_status") == ("CURRENT_CANONICAL_SOURCE_OR_DERIVATIVE" if expected_current else "PRESERVED_SUPERSEDED_OR_NONCANONICAL_EVIDENCE"),
                f"complete-register evidence status is stale: {path}")
    counts = payload.get("counts", {})
    grouped: dict[str, list[dict[str, Any]]] = {}
    for row in records:
        grouped.setdefault(row["sha256"], []).append(row)
    duplicate_groups = [
        {
            "content_sha256": digest,
            "file_count": len(rows),
            "file_ids": [row["file_id"] for row in rows],
            "relative_paths": [row["relative_path"] for row in rows],
            "disposition": "ACKNOWLEDGED_IDENTICAL_CONTENT; DISTINCT FILE IDENTITY; NO CLAIM OF DISTINCT AUDIO",
        }
        for digest, rows in sorted(grouped.items()) if len(rows) > 1
    ]
    require(payload.get("duplicate_content_groups") == duplicate_groups, "complete-register duplicate-content projection is stale")
    expected_counts = {
        "audio_files": len(records),
        "unique_file_ids": len({row["file_id"] for row in records}),
        "unique_content_sha256": len(grouped),
        "duplicate_content_groups": len(duplicate_groups),
        "files_in_duplicate_content_groups": sum(row["file_count"] for row in duplicate_groups),
        "current_files": sum(row["evidence_status"].startswith("CURRENT") for row in records),
        "preserved_files": sum(row["evidence_status"].startswith("PRESERVED") for row in records),
    }
    require(counts == expected_counts, "complete-register counts are stale")
    return {**counts, **verify_complete_predecessor_chain(payload)}


def _verify_test_xml(component: dict[str, Any], expected_relative: str) -> None:
    path = pilot_path(component.get("path", ""))
    require(str(path.relative_to(PILOT_ROOT.resolve())) == expected_relative, f"Unity test component path mismatch: {expected_relative}")
    root = ET.parse(path).getroot()
    values = {name: int(root.attrib.get(name, 0)) for name in ("total", "passed", "failed", "skipped")}
    require(values["passed"] > 0 and values["failed"] == 0, f"Unity test XML is not green: {expected_relative}")
    require(component.get("test_count") == values["total"] and component.get("passed") == values["passed"]
            and component.get("failed") == values["failed"] and component.get("skipped") == values["skipped"],
            f"Unity test summary differs from XML: {expected_relative}")
    require(component.get("sha256") == sha256_file(path), f"Unity test component hash mismatch: {expected_relative}")


def verify_oracle_archive_register() -> dict[str, int]:
    register = json.loads(ORACLE_ARCHIVE_REGISTER.read_text(encoding="utf-8"))
    require(register.get("schema") == "project-studio-audio-oracle-evidence-archive-register/v1"
            and register.get("status") == "PROTOTYPE_ONLY", "Oracle archive-register schema/status mismatch")
    archived = register.get("archived_suites", [])
    require(register.get("archived_suite_count") == len(archived), "Oracle archive-register count mismatch")
    suite_hashes: set[str] = set()
    archive_root = (ORACLE_ROOT / "archive").resolve()
    trace_root = (ORACLE_ROOT / "traces").resolve()
    capture_root = (ORACLE_ROOT / "captures").resolve()
    registered_suite_files: set[Path] = set()
    reachable_trace_files: set[Path] = set()
    reachable_capture_files: set[Path] = set()

    def register_evidence(record: dict[str, Any], expected_root: Path, destination: set[Path], label: str) -> Path:
        path = pilot_path(record.get("path", ""))
        try:
            path.relative_to(expected_root)
        except ValueError as error:
            raise RuntimeError(f"{label} escaped its exact evidence root: {path}") from error
        require(path.is_file() and not path.is_symlink() and sha256_file(path) == record.get("sha256"),
                f"{label} changed: {path}")
        destination.add(path)
        return path

    current_suite = json.loads(ORACLE_SUITE.read_text(encoding="utf-8"))
    require(current_suite.get("schema") == "project-studio-audio-oracle-suite/v1", "current Oracle suite schema mismatch")
    for scenario in current_suite.get("scenarios", []):
        register_evidence(scenario.get("trace", {}), trace_root, reachable_trace_files, "current Oracle trace")
        if scenario.get("capture") is not None:
            register_evidence(scenario["capture"], capture_root, reachable_capture_files, "current Oracle capture")
    for archived_row in archived:
        suite_record = archived_row.get("suite", {})
        suite_path = pilot_path(suite_record.get("path", ""))
        try:
            suite_path.relative_to((ORACLE_ROOT / "archive").resolve(strict=True))
        except ValueError as error:
            raise RuntimeError(f"archived Oracle suite escaped archive root: {suite_path}") from error
        require(suite_path.is_file() and not suite_path.is_symlink()
                and sha256_file(suite_path) == suite_record.get("sha256"), "archived Oracle suite hash mismatch")
        require(suite_path.parent == archive_root
                and suite_path.name == f"AUDIO-ORACLE-SUITE.v1-{suite_record['sha256']}.json",
                "archived Oracle suite filename/content identity mismatch")
        registered_suite_files.add(suite_path)
        require(suite_record["sha256"] not in suite_hashes, "duplicate archived Oracle suite hash")
        suite_hashes.add(suite_record["sha256"])
        suite = json.loads(suite_path.read_text(encoding="utf-8"))
        require(suite.get("schema") == "project-studio-audio-oracle-suite/v1", "archived Oracle suite schema mismatch")
        require(archived_row.get("source_git_shas") == suite.get("source_git_shas"), "archived Oracle source Git identity mismatch")
        relationships = archived_row.get("trace_capture_relationships", [])
        suite_scenarios = suite.get("scenarios", [])
        require(len(relationships) == len(suite_scenarios), "archived Oracle trace/capture relationship count mismatch")
        scenarios = {row.get("scenario"): row for row in suite_scenarios}
        require(None not in scenarios and len(scenarios) == len(suite_scenarios), "archived Oracle scenario IDs are duplicate/missing")
        require([row.get("scenario") for row in relationships] == [row.get("scenario") for row in suite_scenarios],
                "archived Oracle relationship scenario identities/order mismatch")
        for relationship in relationships:
            scenario = relationship.get("scenario")
            suite_scenario = scenarios.get(scenario)
            require(suite_scenario is not None and relationship.get("trace") == suite_scenario.get("trace")
                    and relationship.get("capture") == suite_scenario.get("capture"), f"archived Oracle suite projection mismatch: {scenario}")
            trace_record = relationship["trace"]
            trace_path = register_evidence(trace_record, trace_root, reachable_trace_files, f"archived Oracle trace {scenario}")
            trace = json.loads(trace_path.read_text(encoding="utf-8"))
            require(trace.get("schema") == "project-studio-audio-oracle-trace/v1" and trace.get("scenario") == scenario,
                    f"archived Oracle trace identity mismatch: {scenario}")
            capture = relationship.get("capture")
            if capture is None:
                require(trace.get("capture_path") is None and trace.get("capture_sha256") is None,
                        f"archived Oracle trace has an undeclared capture: {scenario}")
                continue
            capture_path = register_evidence(capture, capture_root, reachable_capture_files, f"archived Oracle capture {scenario}")
            require(trace.get("capture_path") == capture.get("path") and trace.get("capture_sha256") == capture.get("sha256"),
                    f"archived Oracle trace/capture identity mismatch: {scenario}")
            require(capture.get("runtime_mix_capture") is False
                    and capture.get("evidence_class") == "UNITY_EDITOR_OFFLINE_OUTPUT_PROCESSOR_MARKER_RENDER",
                    f"archived Oracle capture evidence class overclaims runtime evidence: {scenario}")
            require(capture.get("probe") == probe_audio(capture_path), f"archived Oracle capture probe mismatch: {scenario}")
    actual_archive_files = {path.resolve() for path in archive_root.rglob("*") if path.is_file()} if archive_root.is_dir() else set()
    actual_trace_files = {path.resolve() for path in trace_root.rglob("*") if path.is_file()} if trace_root.is_dir() else set()
    actual_capture_files = {path.resolve() for path in capture_root.rglob("*") if path.is_file()} if capture_root.is_dir() else set()
    require(actual_archive_files == registered_suite_files, "Oracle archive suite tree contains orphaned or missing files")
    require(actual_trace_files == reachable_trace_files, "Oracle trace tree differs from current-plus-archived reachability")
    require(actual_capture_files == reachable_capture_files, "Oracle capture tree differs from current-plus-archived reachability")
    return {"archived_suite_count": len(archived)}


def verify_management_metadata_history(required_hashes: set[str]) -> dict[str, Any]:
    """Verify the exact registered set of immutable commit-bound management catalogues."""
    register_payload, register_mode = read_contained_regular_bytes(
        PILOT_ROOT, MANAGEMENT_HISTORY_REGISTER
    )
    register = json.loads(register_payload.decode("utf-8"))
    entries = register.get("entries")
    source_binding = register.get("source_code", {})
    source_path = "tools/audio_systems_pilot_01/publish_metadata_status_remedies.py"
    source_commit = source_binding.get("commit")
    committed_source = subprocess.run(
        ["git", "show", f"{source_commit}:{source_path}"],
        cwd=DOC_REPO, check=False, capture_output=True,
    )
    current_doc_sha = git(DOC_REPO, "rev-parse", "HEAD")
    require(register_mode == 0o644
            and register.get("schema") == "project-studio-management-metadata-history/v1"
            and register.get("status") == "PRESERVED_D_BOUND_METADATA_BYTES"
            and register.get("machine_verdict") == "PASS"
            and isinstance(entries, list) and entries
            and register.get("counts") == {"catalogues": len(entries)},
            "management metadata history register contract failed")
    require(source_binding.get("path") == source_path
            and source_binding.get("working_file_matches_commit") is True
            and source_commit == current_doc_sha
            and committed_source.returncode == 0
            and hashlib.sha256(committed_source.stdout).hexdigest() == source_binding.get("blob_sha256")
            and sha256_file(DOC_REPO / source_path) == source_binding.get("blob_sha256"),
            "management metadata history register source binding failed")
    require(os.path.lexists(MANAGEMENT_HISTORY_ROOT)
            and MANAGEMENT_HISTORY_ROOT.is_dir()
            and not MANAGEMENT_HISTORY_ROOT.is_symlink(),
            "management metadata history root is unavailable or unsafe")
    source_payload, _ = read_contained_regular_bytes(PILOT_ROOT, MANAGEMENT_SOURCE_CATALOGUE)
    source_sha = hashlib.sha256(source_payload).hexdigest()
    source_catalogue = json.loads(source_payload.decode("utf-8"))
    source_candidates = source_catalogue.get("candidates")
    require(source_catalogue.get("schema") == "project-studio-management-audio-language/v3"
            and source_catalogue.get("rights_status") == "PROTOTYPE_ONLY"
            and isinstance(source_candidates, list) and source_candidates
            and source_catalogue.get("candidate_count") == len(source_candidates),
            "management metadata history v3 source contract failed")
    for candidate in source_candidates:
        audio_path = require_contained_regular_file(PILOT_ROOT, Path(candidate["audio"]["path"]))
        audio_payload, _ = read_contained_regular_bytes(PILOT_ROOT, audio_path)
        require(hashlib.sha256(audio_payload).hexdigest() == candidate["audio"]["sha256"]
                and candidate.get("human_disposition") == "PENDING"
                and candidate.get("rights_status") == "PROTOTYPE_ONLY",
                f"management metadata history candidate identity failed: {audio_path}")
    registered_hashes: set[str] = set()
    registered_names: set[str] = set()
    for row in entries:
        digest = row.get("sha256")
        expected_name = f"management-semantic-catalogue.v4-{digest}.json"
        expected_path = MANAGEMENT_HISTORY_ROOT / expected_name
        require(re.fullmatch(r"[0-9a-f]{64}", str(digest)) is not None
                and row.get("absolute_path") == str(expected_path)
                and row.get("relative_path") == str(expected_path.relative_to(PILOT_ROOT))
                and row.get("mode") == 0o444
                and digest not in registered_hashes,
                "management metadata history register contains a malformed or duplicate row")
        payload, mode = read_contained_regular_bytes(PILOT_ROOT, expected_path)
        catalogue = json.loads(payload.decode("utf-8"))
        catalogue_binding = catalogue.get("source_code", {})
        historical_commit = catalogue_binding.get("commit")
        historical_source = subprocess.run(
            ["git", "show", f"{historical_commit}:{source_path}"],
            cwd=DOC_REPO, check=False, capture_output=True,
        )
        require(len(payload) == row.get("bytes")
                and hashlib.sha256(payload).hexdigest() == digest
                and mode == row.get("mode") == 0o444,
                f"management metadata history bytes changed: {expected_name}")
        require(row.get("catalogue_source_code") == catalogue_binding
                and catalogue_binding.get("path") == source_path
                and catalogue_binding.get("working_file_matches_commit") is True
                and re.fullmatch(r"[0-9a-f]{40}", str(historical_commit)) is not None
                and historical_source.returncode == 0
                and hashlib.sha256(historical_source.stdout).hexdigest()
                    == catalogue_binding.get("blob_sha256"),
                f"management metadata history Git binding failed: {expected_name}")
        expected_catalogue_payload = catalogue_bytes(
            catalogue_for_binding(source_catalogue, source_sha, catalogue_binding)
        )
        require(payload == expected_catalogue_payload,
                f"management metadata history is not the exact deterministic v3-to-v4 projection: {expected_name}")
        registered_hashes.add(str(digest))
        registered_names.add(expected_name)
    actual_names: set[str] = set()
    for path in MANAGEMENT_HISTORY_ROOT.iterdir():
        mode = os.lstat(path).st_mode
        require(not path.is_symlink() and stat.S_ISREG(mode)
                and re.fullmatch(r"management-semantic-catalogue\.v4-[0-9a-f]{64}\.json", path.name) is not None,
                f"management metadata history contains a linked, special, or malformed entry: {path}")
        actual_names.add(path.name)
    require(actual_names == registered_names,
            "management metadata history differs from its exact register")
    require(required_hashes.issubset(registered_hashes),
            "management metadata history is missing a Unity-referenced identity")
    return {
        "registered_management_metadata_count": len(registered_hashes),
        "management_metadata_history_register_sha256": hashlib.sha256(register_payload).hexdigest(),
    }


def verify_unity_run_archives() -> dict[str, Any]:
    archive_root = PILOT_ROOT / "09_unity-lab/ArchivedRuns"
    supplement_root = PILOT_ROOT / "09_unity-lab/ArchiveSupplements"
    management_relative = "05_management-sfx/semantic-pack/management-semantic-catalogue.v4.json"
    management_history_root = MANAGEMENT_HISTORY_ROOT
    repair_tool_path = "tools/audio_systems_pilot_01/repair_unity_validation_archives.py"
    required_management_history_hashes: set[str] = set()
    if not os.path.lexists(archive_root):
        require(not os.path.lexists(supplement_root), "Unity archive supplements exist without archived runs")
        run_roots: list[Path] = []
    else:
        require(archive_root.is_dir() and not archive_root.is_symlink(), "Unity run archive root is not a regular directory")
        run_roots = sorted(archive_root.iterdir())
        require(all(path.is_dir() and not path.is_symlink() for path in run_roots), "Unity run archive root contains a non-directory entry")
    supplements: dict[str, dict[str, Any]] = {}
    supplement_manifest_identities: list[str] = []
    if os.path.lexists(supplement_root):
        require(supplement_root.is_dir() and not supplement_root.is_symlink(), "Unity archive supplement root is unsafe")
        for run_supplement_root in sorted(supplement_root.iterdir()):
            require(run_supplement_root.is_dir() and not run_supplement_root.is_symlink(),
                    "Unity archive supplement root contains a non-directory entry")
            supplement_manifest_path = run_supplement_root / "SUPPLEMENT-MANIFEST.json"
            supplement_manifest_payload, _ = read_contained_regular_bytes(
                PILOT_ROOT, supplement_manifest_path
            )
            supplement = json.loads(supplement_manifest_payload.decode("utf-8"))
            run_id = supplement.get("run_id")
            require(supplement.get("schema") == "project-studio-unity-validation-run-archive-supplement/v1"
                    and supplement.get("status") == "NONDESTRUCTIVE_POINTER_PROJECTION_REPAIR"
                    and supplement.get("reason") == "The original run archive remains byte-for-byte intact; exact pointer-named metadata is supplied separately."
                    and supplement.get("pointer_status_semantics") == "LEGACY_UNCONDITIONAL_STATUS_NOT_USED_AS_HISTORICAL_OUTCOME"
                    and supplement.get("historical_run_outcome") in {"PASS", "FAIL"}
                    and supplement.get("source_root") == str(PILOT_ROOT)
                    and run_id == run_supplement_root.name
                    and isinstance(run_id, str)
                    and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,127}", run_id) is not None
                    and run_id not in supplements,
                    f"Unity archive supplement identity is malformed: {run_supplement_root}")
            authorization = AUTHORIZED_UNITY_ARCHIVE_REPAIRS.get(run_id)
            require(authorization is not None and supplement.get("authorization") == authorization
                    and supplement.get("disposition") == "HASH_AUTHENTICATED_DETERMINISTIC_RECONSTRUCTION_NOT_ORIGINAL_PRESERVED_BYTES; NOT_A_REVALIDATION; HISTORICAL_RUN_REMAINS_FAIL",
                    f"Unity archive supplement lacks the exact committed authorization: {run_id}")
            original_manifest_path = archive_root / run_id / "ARCHIVE-MANIFEST.json"
            archived_pointer_path = archive_root / run_id / "09_unity-lab/CURRENT-VALIDATION-RUN.json"
            archived_validation_path = archive_root / run_id / "09_unity-lab/UNITY-AUDIO-LAB-VALIDATION.json"
            original_manifest_payload, _ = read_contained_regular_bytes(PILOT_ROOT, original_manifest_path)
            archived_pointer_payload, _ = read_contained_regular_bytes(PILOT_ROOT, archived_pointer_path)
            archived_validation_payload, _ = read_contained_regular_bytes(PILOT_ROOT, archived_validation_path)
            require(supplement.get("original_archive_manifest") == {
                        "path": str(original_manifest_path.relative_to(PILOT_ROOT)),
                        "bytes": len(original_manifest_payload),
                        "sha256": authorization["archive_manifest_sha256"],
                    }
                    and hashlib.sha256(original_manifest_payload).hexdigest() == authorization["archive_manifest_sha256"]
                    and supplement.get("archived_current_run_pointer") == {
                        "path": str(archived_pointer_path.relative_to(PILOT_ROOT)),
                        "bytes": len(archived_pointer_payload),
                        "sha256": authorization["current_pointer_sha256"],
                    }
                    and hashlib.sha256(archived_pointer_payload).hexdigest() == authorization["current_pointer_sha256"]
                    and supplement.get("archived_validation") == {
                        "path": str(archived_validation_path.relative_to(PILOT_ROOT)),
                        "bytes": len(archived_validation_payload),
                        "sha256": authorization["validation_sha256"],
                    }
                    and hashlib.sha256(archived_validation_payload).hexdigest() == authorization["validation_sha256"],
                    f"Unity archive supplement does not bind the untouched original evidence: {run_id}")
            repairs = supplement.get("repairs")
            require(isinstance(repairs, list) and repairs, f"Unity archive supplement contains no repairs: {run_id}")
            repaired_paths = [row.get("relative_path") for row in repairs]
            require(None not in repaired_paths and len(set(repaired_paths)) == len(repaired_paths)
                    and set(repaired_paths) == {management_relative},
                    f"Unity archive supplement exceeds the one supported metadata repair: {run_id}")
            expected_blob_paths = {row.get("supplement_blob", {}).get("relative_path") for row in repairs}
            require(None not in expected_blob_paths and len(expected_blob_paths) == len(repairs),
                    f"Unity archive supplement blob paths are missing or duplicated: {run_id}")
            actual_blob_files = {
                str(path.relative_to(run_supplement_root)) for path in run_supplement_root.rglob("*")
                if path.is_file() and not path.is_symlink() and path != supplement_manifest_path
            }
            actual_links = [path for path in run_supplement_root.rglob("*") if path.is_symlink()]
            actual_directories = {
                str(path.relative_to(run_supplement_root)) for path in run_supplement_root.rglob("*")
                if path.is_dir() and not path.is_symlink()
            }
            expected_directories = {
                str(parent)
                for relative in expected_blob_paths
                for parent in Path(str(relative)).parents
                if str(parent) != "."
            }
            actual_specials = [
                path for path in run_supplement_root.rglob("*")
                if not (stat.S_ISREG(os.lstat(path).st_mode) or stat.S_ISDIR(os.lstat(path).st_mode)
                        or stat.S_ISLNK(os.lstat(path).st_mode))
            ]
            require(not actual_links and not actual_specials and actual_blob_files == expected_blob_paths
                    and actual_directories == expected_directories,
                    f"Unity archive supplement tree contains orphaned, missing, or linked files: {run_id}")
            for row in repairs:
                expected = row.get("expected_pointer", {})
                required_management_history_hashes.add(str(expected.get("sha256")))
                blob = row.get("supplement_blob", {})
                expected_blob_relative = f"blobs/{expected.get('sha256')}.json"
                blob_path = require_contained_regular_file(
                    PILOT_ROOT, run_supplement_root / str(blob.get("relative_path"))
                )
                blob_payload, blob_mode = read_contained_regular_bytes(PILOT_ROOT, blob_path)
                require(blob.get("relative_path") == expected_blob_relative
                        and len(blob_payload) == blob.get("bytes") == expected.get("bytes")
                        and blob_mode == blob.get("mode") == 0o444
                        and hashlib.sha256(blob_payload).hexdigest() == blob.get("sha256") == expected.get("sha256"),
                        f"Unity archive supplement blob identity failed: {run_id}")
                require(row.get("relative_path") == authorization["relative_path"]
                        and expected == {
                            "bytes": authorization["expected_bytes"],
                            "sha256": authorization["expected_sha256"],
                        }
                        and row.get("original_archive") == {
                            "bytes": authorization["archived_bytes"],
                            "sha256": authorization["archived_sha256"],
                        },
                        f"Unity archive supplement row exceeds its committed authorization: {run_id}")
                history = row.get("content_addressed_history", {})
                history_lexical = Path(str(history.get("path")))
                expected_history = management_history_root / f"management-semantic-catalogue.v4-{expected.get('sha256')}.json"
                require(history_lexical == expected_history,
                        f"Unity archive supplement history path is not the exact authorized path: {run_id}")
                history_path = require_contained_regular_file(PILOT_ROOT, history_lexical)
                history_payload, history_mode = read_contained_regular_bytes(PILOT_ROOT, history_path)
                require(len(history_payload) == history.get("bytes") == expected.get("bytes")
                        and history_mode == 0o444
                        and hashlib.sha256(history_payload).hexdigest() == history.get("sha256") == expected.get("sha256"),
                        f"Unity archive supplement history identity failed: {run_id}")
                reconstruction = row.get("reconstruction", {})
                historical_sha = reconstruction.get("documentation_sha")
                generator_path = reconstruction.get("generator_path")
                generator = subprocess.run(
                    ["git", "show", f"{historical_sha}:{generator_path}"], cwd=DOC_REPO,
                    check=False, capture_output=True,
                )
                require(reconstruction.get("type") == "DETERMINISTIC_METADATA_RECONSTRUCTION_FROM_ARCHIVED_DOCUMENTATION_SHA"
                        and re.fullmatch(r"[0-9a-f]{40}", str(historical_sha)) is not None
                        and generator_path == "tools/audio_systems_pilot_01/publish_metadata_status_remedies.py"
                        and generator.returncode == 0
                        and hashlib.sha256(generator.stdout).hexdigest() == reconstruction.get("generator_blob_sha256")
                        and reconstruction.get("source_path") == str(PILOT_ROOT / "05_management-sfx/semantic-pack/management-semantic-catalogue.v3.json")
                        and reconstruction.get("source_sha256") == sha256_file(PILOT_ROOT / "05_management-sfx/semantic-pack/management-semantic-catalogue.v3.json")
                        and reconstruction.get("serializer") == "json.dumps(indent=2,sort_keys=True,ensure_ascii=False)+LF"
                        and reconstruction.get("authorized_json_pointer_delta") == ["/source_code/commit"],
                        f"Unity archive supplement reconstruction provenance failed: {run_id}")
                archived_metadata_path = require_contained_regular_file(
                    PILOT_ROOT, archive_root / run_id / management_relative
                )
                archived_metadata_payload, _ = read_contained_regular_bytes(PILOT_ROOT, archived_metadata_path)
                archived_metadata = json.loads(archived_metadata_payload.decode("utf-8"))
                require(len(archived_metadata_payload) == authorization["archived_bytes"]
                        and hashlib.sha256(archived_metadata_payload).hexdigest() == authorization["archived_sha256"]
                        and archived_metadata.get("source_code", {}).get("commit") == authorization["archive_creation_documentation_sha"],
                        f"Unity archive supplement displaced metadata identity failed: {run_id}")
                normalized_metadata = json.loads(json.dumps(archived_metadata))
                normalized_metadata["source_code"]["commit"] = authorization["pointer_documentation_sha"]
                reconstructed_bytes = (
                    json.dumps(normalized_metadata, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
                ).encode("utf-8")
                require(reconstructed_bytes == blob_payload,
                        f"Unity archive supplement changes more than the authorized JSON pointer: {run_id}")
            repair_tool = supplement.get("repair_tool", {})
            tool_commit = repair_tool.get("commit")
            tool_content = subprocess.run(
                ["git", "show", f"{tool_commit}:{repair_tool_path}"], cwd=DOC_REPO,
                check=False, capture_output=True,
            )
            require(re.fullmatch(r"[0-9a-f]{40}", str(tool_commit)) is not None
                    and repair_tool.get("path") == repair_tool_path
                    and repair_tool.get("working_file_matches_commit") is True
                    and tool_content.returncode == 0
                    and hashlib.sha256(tool_content.stdout).hexdigest() == repair_tool.get("blob_sha256"),
                    f"Unity archive supplement tool binding failed: {run_id}")
            supplements[run_id] = supplement
            supplement_manifest_identities.append(
                f"supplement:{run_id}:{hashlib.sha256(supplement_manifest_payload).hexdigest()}"
            )
    completed_root = PILOT_ROOT / "09_unity-lab/CompletedRuns"
    completed_runs: dict[str, dict[str, Any]] = {}
    completed_manifest_identities: list[str] = []
    if os.path.lexists(completed_root):
        require(completed_root.is_dir() and not completed_root.is_symlink(), "Unity completed-run root is unsafe")
        for completed_run_root in sorted(completed_root.iterdir()):
            require(completed_run_root.is_dir() and not completed_run_root.is_symlink(),
                    "Unity completed-run root contains a non-directory entry")
            completed_manifest_path = completed_run_root / "COMPLETED-RUN-MANIFEST.json"
            completed_manifest_payload, _ = read_contained_regular_bytes(
                PILOT_ROOT, completed_manifest_path
            )
            completed = json.loads(completed_manifest_payload.decode("utf-8"))
            run_id = completed.get("run_id")
            rows = completed.get("files")
            require(completed.get("schema") == "project-studio-unity-validation-completed-run/v1"
                    and completed.get("status") == "VERIFIED_SUCCESSFUL_RUN_BYTES"
                    and completed.get("validation_outcome") == "PASS"
                    and completed.get("superseded_app_disposition") == "REPLACEABLE_DERIVED_APP_NOT_PRESERVED; BUILD_RECEIPT_PRESERVED"
                    and run_id == completed_run_root.name and run_id not in completed_runs
                    and isinstance(rows, list) and rows,
                    f"Unity completed-run manifest identity failed: {completed_run_root}")
            expected_files = {row.get("relative_path"): row for row in rows}
            require(None not in expected_files and len(expected_files) == len(rows),
                    f"Unity completed-run paths are duplicate or missing: {run_id}")
            actual_files: dict[str, tuple[int, str, int]] = {}
            actual_directories: set[str] = set()
            for path in completed_run_root.rglob("*"):
                mode = os.lstat(path).st_mode
                relative = str(path.relative_to(completed_run_root))
                if stat.S_ISLNK(mode):
                    raise RuntimeError(f"Unity completed-run snapshot contains a refused symlink: {path}")
                if stat.S_ISREG(mode):
                    if path != completed_manifest_path:
                        actual_files[relative] = (path.stat().st_size, sha256_file(path), path.stat().st_mode & 0o777)
                elif stat.S_ISDIR(mode):
                    actual_directories.add(relative)
                else:
                    raise RuntimeError(f"Unity completed-run snapshot contains a special node: {path}")
            expected_directories = {
                str(parent)
                for relative in expected_files
                for parent in Path(str(relative)).parents
                if str(parent) != "."
            }
            require(set(actual_files) == set(expected_files) and actual_directories == expected_directories,
                    f"Unity completed-run tree differs from manifest: {run_id}")
            for relative, row in expected_files.items():
                require(actual_files[relative] == (row.get("bytes"), row.get("sha256"), row.get("mode")),
                        f"Unity completed-run file changed: {run_id}:{relative}")
            pointer_relative = "09_unity-lab/CURRENT-VALIDATION-RUN.json"
            pointer_path = require_contained_regular_file(
                PILOT_ROOT, completed_run_root / pointer_relative
            )
            pointer_payload, _ = read_contained_regular_bytes(PILOT_ROOT, pointer_path)
            pointer = json.loads(pointer_payload.decode("utf-8"))
            source_pointer = completed.get("source_pointer", {})
            require(source_pointer == {
                        "relative_path": pointer_relative,
                        "bytes": len(pointer_payload),
                        "sha256": hashlib.sha256(pointer_payload).hexdigest(),
                    }
                    and pointer.get("schema") == "project-studio-unity-validation-current-run/v1"
                    and pointer.get("status") == "PASS" and pointer.get("run_id") == run_id
                    and pointer.get("documentation_sha") == completed.get("documentation_sha")
                    and pointer.get("unity_sha") == completed.get("unity_sha"),
                    f"Unity completed-run pointer identity failed: {run_id}")
            pointer_rows = pointer.get("files")
            pointer_paths = [row.get("relative_path") for row in pointer_rows] if isinstance(pointer_rows, list) else []
            expected_current_paths = UNITY_ARTIFACT_PATHS | {
                "09_unity-lab/Logs/validation-summary-final.log",
                "09_unity-lab/UNITY-AUDIO-LAB-VALIDATION.json",
            }
            require(pointer_rows and set(pointer_paths) == expected_current_paths
                    and len(pointer_paths) == len(set(pointer_paths))
                    and set(expected_files) == {pointer_relative, *expected_current_paths},
                    f"Unity completed-run pointer file set failed: {run_id}")
            for row in pointer_rows:
                preserved = require_contained_regular_file(
                    PILOT_ROOT, completed_run_root / row["relative_path"]
                )
                preserved_payload, _ = read_contained_regular_bytes(PILOT_ROOT, preserved)
                require(len(preserved_payload) == row.get("bytes")
                        and hashlib.sha256(preserved_payload).hexdigest() == row.get("sha256"),
                        f"Unity completed-run pointer projection failed: {run_id}:{row['relative_path']}")
            completed_validation_path = completed_run_root / "09_unity-lab/UNITY-AUDIO-LAB-VALIDATION.json"
            completed_validation_payload, _ = read_contained_regular_bytes(
                PILOT_ROOT, completed_validation_path
            )
            validation = json.loads(completed_validation_payload.decode("utf-8"))
            management_row = next(row for row in pointer_rows if row["relative_path"] == management_relative)
            required_management_history_hashes.add(str(management_row.get("sha256")))
            required_components = ("compile", "edit_mode", "play_mode", "build", "codesign", "audio_oracle", "process_gates")
            require(validation.get("schema") == "project-studio-unity-audio-lab-validation/v1"
                    and validation.get("machine_verdict") == "PASS"
                    and validation.get("unity_git_sha") == completed.get("unity_sha")
                    and validation.get("direct_pinned_management_sha256") == management_row.get("sha256")
                    and all(validation.get(name, {}).get("status") == "PASS" for name in required_components),
                    f"Unity completed-run validation outcome failed: {run_id}")
            snapshot_tool = completed.get("snapshot_tool", {})
            snapshot_commit = snapshot_tool.get("commit")
            snapshot_path = "tools/audio_systems_pilot_01/snapshot_unity_validation_run.py"
            snapshot_content = subprocess.run(
                ["git", "show", f"{snapshot_commit}:{snapshot_path}"], cwd=DOC_REPO,
                check=False, capture_output=True,
            )
            require(re.fullmatch(r"[0-9a-f]{40}", str(snapshot_commit)) is not None
                    and snapshot_tool.get("path") == snapshot_path
                    and snapshot_tool.get("working_file_matches_commit") is True
                    and snapshot_content.returncode == 0
                    and hashlib.sha256(snapshot_content.stdout).hexdigest() == snapshot_tool.get("blob_sha256"),
                    f"Unity completed-run snapshot tool binding failed: {run_id}")
            completed_runs[run_id] = completed
            completed_manifest_identities.append(
                f"completed:{run_id}:{hashlib.sha256(completed_manifest_payload).hexdigest()}"
            )
    archived_by_ids: set[str] = set()
    manifest_identities: list[str] = []
    successful_runs = 0
    failed_runs = 0
    unindexed_attempts = 0
    supplemented_pointer_files = 0
    for run_root in run_roots:
        manifest_path = run_root / "ARCHIVE-MANIFEST.json"
        manifest_payload, _ = read_contained_regular_bytes(PILOT_ROOT, manifest_path)
        manifest = json.loads(manifest_payload.decode("utf-8"))
        manifest_identities.append(
            f"archive:{run_root.name}:{hashlib.sha256(manifest_payload).hexdigest()}"
        )
        run_id = manifest.get("run_id")
        archived_by = manifest.get("archived_by_run_id")
        expected_attribution = ("UNINDEXED_PRIOR_BYTES_NO_CURRENT_RUN_INDEX"
                                if run_id and run_id.startswith("UNINDEXED-PRIOR-") else "PRIOR_CURRENT_RUN_INDEX")
        expected_status = ("PRESERVED_UNINDEXED_ATTEMPT_BYTES"
                           if expected_attribution.startswith("UNINDEXED") else "PRESERVED_PRIOR_CURRENT_EVIDENCE")
        require(manifest.get("schema") == "project-studio-unity-validation-run-archive/v1"
                and manifest.get("status") == expected_status
                and manifest.get("source_root") == str(PILOT_ROOT)
                and run_id == run_root.name
                and isinstance(archived_by, str)
                and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,127}", archived_by) is not None
                and archived_by != run_id,
                f"Unity run archive identity is malformed: {run_root}")
        require(manifest.get("superseded_app_disposition")
                == "REPLACEABLE_DERIVED_APP_NOT_PRESERVED; ARCHIVED_RECEIPT_IS_HISTORICAL_NONCURRENT_METADATA_AND_NOT_INDEPENDENTLY_REVERIFIABLE",
                f"Unity run archive overstates preservation of its superseded derived app: {run_id}")
        require(archived_by not in archived_by_ids, "multiple Unity archives claim the same replacement run")
        archived_by_ids.add(archived_by)
        require(manifest.get("attribution") == expected_attribution, f"Unity run archive attribution mismatch: {run_id}")

        file_rows = manifest.get("files", [])
        link_rows = manifest.get("symlinks", [])
        directory_rows = manifest.get("directories", [])
        file_paths = [row.get("relative_path") for row in file_rows]
        link_paths = [row.get("relative_path") for row in link_rows]
        directory_paths = [row.get("relative_path") for row in directory_rows]
        require(file_rows and None not in file_paths + link_paths + directory_paths
                and len(set(file_paths + link_paths + directory_paths)) == len(file_paths) + len(link_paths) + len(directory_paths),
                f"Unity run archive manifest paths are missing or duplicated: {run_id}")
        archived_management_rows = [
            row for row in file_rows if row.get("relative_path") == management_relative
        ]
        require(len(archived_management_rows) <= 1,
                f"Unity run archive duplicates management metadata: {run_id}")
        if archived_management_rows:
            required_management_history_hashes.add(
                str(archived_management_rows[0].get("sha256"))
            )
        for row in file_rows:
            path = canonical_contained(run_root, run_root / row["relative_path"])
            require(path.is_file() and not path.is_symlink() and path.stat().st_size == row.get("bytes")
                    and (path.stat().st_mode & 0o777) == row.get("mode") and sha256_file(path) == row.get("sha256"),
                    f"Unity run archived file changed: {path}")
        for row in link_rows:
            lexical = run_root / row["relative_path"]
            require(lexical.is_symlink() and os.readlink(lexical) == row.get("target"), f"Unity run archived symlink changed: {lexical}")
            try:
                lexical.resolve(strict=True).relative_to(run_root.resolve(strict=True))
            except ValueError as error:
                raise RuntimeError(f"Unity run archived symlink escapes its run: {lexical}") from error
        for row in directory_rows:
            path = canonical_contained(run_root, run_root / row["relative_path"])
            require(path.is_dir() and not path.is_symlink() and (path.stat().st_mode & 0o777) == row.get("mode"),
                    f"Unity run archived directory changed: {path}")
        special_nodes = [
            path for path in run_root.rglob("*")
            if not (stat.S_ISREG(os.lstat(path).st_mode) or stat.S_ISDIR(os.lstat(path).st_mode)
                    or stat.S_ISLNK(os.lstat(path).st_mode))
        ]
        require(not special_nodes, f"Unity run archive contains an undeclared special node: {run_id}")
        actual_files = {
            str(path.relative_to(run_root)) for path in run_root.rglob("*")
            if path.is_file() and not path.is_symlink() and path != manifest_path
        }
        actual_links = {str(path.relative_to(run_root)) for path in run_root.rglob("*") if path.is_symlink()}
        actual_directories = {
            str(path.relative_to(run_root)) for path in run_root.rglob("*") if path.is_dir() and not path.is_symlink()
        }
        require(actual_files == set(file_paths) and actual_links == set(link_paths)
                and actual_directories == set(directory_paths), f"Unity run archive tree differs from its manifest: {run_id}")

        prior_index = run_root / "09_unity-lab/CURRENT-VALIDATION-RUN.json"
        if expected_attribution == "PRIOR_CURRENT_RUN_INDEX":
            prior_payload, _ = read_contained_regular_bytes(PILOT_ROOT, prior_index)
            prior = json.loads(prior_payload.decode("utf-8"))
            require(prior.get("schema") == "project-studio-unity-validation-current-run/v1"
                    and prior.get("status") == "PASS"
                    and prior.get("run_id") == run_id, f"Unity archived prior pointer is missing or misattributed: {run_id}")
            prior_rows = prior.get("files", [])
            prior_paths = [row.get("relative_path") for row in prior_rows]
            expected_current_paths = UNITY_ARTIFACT_PATHS | {
                "09_unity-lab/Logs/validation-summary-final.log",
                "09_unity-lab/UNITY-AUDIO-LAB-VALIDATION.json",
            }
            require(prior_rows and None not in prior_paths and len(set(prior_paths)) == len(prior_paths)
                    and set(prior_paths) == expected_current_paths,
                    f"Unity archived prior pointer has duplicate/missing paths: {run_id}")
            supplement = supplements.get(run_id)
            repair_rows = {row["relative_path"]: row for row in supplement.get("repairs", [])} if supplement else {}
            used_repairs: set[str] = set()
            for row in prior_rows:
                archived_path = run_root / row["relative_path"]
                try:
                    archived_payload, _ = read_contained_regular_bytes(PILOT_ROOT, archived_path)
                except RuntimeError:
                    archived_payload = None
                if (archived_payload is not None
                        and len(archived_payload) == row.get("bytes")
                        and hashlib.sha256(archived_payload).hexdigest() == row.get("sha256")):
                    require(row["relative_path"] not in repair_rows,
                            f"Unity archive supplement claims an already exact pointer row: {run_id}:{row['relative_path']}")
                    continue
                repair = repair_rows.get(row["relative_path"])
                require(row["relative_path"] == management_relative and repair is not None,
                        f"Unity archived prior pointer lacks exact bytes or a bounded supplement: {run_id}:{row['relative_path']}")
                archive_row = next((item for item in file_rows if item.get("relative_path") == row["relative_path"]), None)
                require(repair.get("expected_pointer") == {"bytes": row.get("bytes"), "sha256": row.get("sha256")}
                        and archive_row is not None
                        and repair.get("original_archive") == {
                            "bytes": archive_row.get("bytes"), "sha256": archive_row.get("sha256")
                        }
                        and repair.get("reconstruction", {}).get("documentation_sha") == prior.get("documentation_sha"),
                        f"Unity archive supplement does not bind both sides of the discrepancy: {run_id}:{row['relative_path']}")
                used_repairs.add(row["relative_path"])
                supplemented_pointer_files += 1
            require(set(repair_rows) == used_repairs,
                    f"Unity archive supplement contains an unused pointer repair: {run_id}")
            validation_path = run_root / "09_unity-lab/UNITY-AUDIO-LAB-VALIDATION.json"
            validation_payload, _ = read_contained_regular_bytes(PILOT_ROOT, validation_path)
            validation = json.loads(validation_payload.decode("utf-8"))
            historical_verdict = validation.get("machine_verdict")
            management_pointer_row = next(row for row in prior_rows if row["relative_path"] == management_relative)
            required_management_history_hashes.add(str(management_pointer_row.get("sha256")))
            require(validation.get("schema") == "project-studio-unity-audio-lab-validation/v1"
                    and validation.get("unity_git_sha") == prior.get("unity_sha")
                    and validation.get("direct_pinned_management_sha256") == management_pointer_row.get("sha256")
                    and historical_verdict in {"PASS", "FAIL"},
                    f"archived Unity run outcome is unavailable or inconsistent: {run_id}")
            require(supplement is None or supplement.get("historical_run_outcome") == historical_verdict,
                    f"Unity archive supplement overstates the historical run outcome: {run_id}")
            if historical_verdict == "PASS":
                require(run_id in completed_runs,
                        f"successful archived Unity run lacks its eager completed-run snapshot: {run_id}")
                completed_pointer_path = (
                    completed_root / run_id / "09_unity-lab/CURRENT-VALIDATION-RUN.json"
                )
                completed_pointer_payload, _ = read_contained_regular_bytes(
                    PILOT_ROOT, completed_pointer_path
                )
                completed_source_pointer = completed_runs[run_id].get("source_pointer", {})
                require(prior_payload == completed_pointer_payload
                        and completed_source_pointer == {
                            "relative_path": "09_unity-lab/CURRENT-VALIDATION-RUN.json",
                            "bytes": len(prior_payload),
                            "sha256": hashlib.sha256(prior_payload).hexdigest(),
                        },
                        f"successful Unity archive does not equal its eager snapshot pointer: {run_id}")
                successful_runs += 1
            else:
                failed_runs += 1
        else:
            require(not os.path.lexists(prior_index), f"unindexed Unity archive unexpectedly contains a current-run pointer: {run_id}")
            require(run_id not in supplements, f"unindexed Unity archive may not have a pointer supplement: {run_id}")
            unindexed_attempts += 1

    require(set(supplements) == set(AUTHORIZED_UNITY_ARCHIVE_REPAIRS),
            "Unity archive supplements do not exactly satisfy committed repair authorizations")
    require(set(supplements).issubset({path.name for path in run_roots}),
            "Unity archive supplement refers to a missing archived run")
    current_run_id = None
    current_pointer_payload = None
    if os.path.lexists(UNITY_CURRENT_RUN):
        current_pointer_payload, _ = read_contained_regular_bytes(PILOT_ROOT, UNITY_CURRENT_RUN)
        current_pointer = json.loads(current_pointer_payload.decode("utf-8"))
        current_run_id = current_pointer.get("run_id")
        require(current_pointer.get("schema") == "project-studio-unity-validation-current-run/v1"
                and current_pointer.get("status") == "PASS"
                and isinstance(current_run_id, str)
                and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,127}", current_run_id) is not None,
                "current Unity pointer is malformed")
        current_pointer_rows = current_pointer.get("files")
        require(isinstance(current_pointer_rows, list) and current_pointer_rows,
                "current Unity pointer has no file rows")
        current_management_rows = [
            row for row in current_pointer_rows
            if row.get("relative_path") == management_relative
        ]
        require(len(current_management_rows) == 1,
                "current Unity pointer does not name exactly one management catalogue")
        required_management_history_hashes.add(
            str(current_management_rows[0].get("sha256"))
        )
    require(set(completed_runs).issubset({path.name for path in run_roots} | ({current_run_id} if current_run_id else set())),
            "Unity completed-run snapshot is neither current nor archived")
    if current_run_id is not None:
        require(current_run_id in completed_runs, "current successful Unity run lacks its eager completed-run snapshot")
        completed_pointer_path = (
            completed_root / current_run_id / "09_unity-lab/CURRENT-VALIDATION-RUN.json"
        )
        completed_pointer_payload, _ = read_contained_regular_bytes(
            PILOT_ROOT, completed_pointer_path
        )
        source_pointer = completed_runs[current_run_id].get("source_pointer", {})
        require(current_pointer_payload == completed_pointer_payload
                and source_pointer == {
                    "relative_path": "09_unity-lab/CURRENT-VALIDATION-RUN.json",
                    "bytes": len(current_pointer_payload),
                    "sha256": hashlib.sha256(current_pointer_payload).hexdigest(),
                }, "current Unity pointer does not equal its eager completed-run snapshot")
    require(required_management_history_hashes
            and all(re.fullmatch(r"[0-9a-f]{64}", digest) is not None
                    for digest in required_management_history_hashes),
            "Unity evidence contains malformed management-history identities")
    history_proof = verify_management_metadata_history(required_management_history_hashes)
    evidence_identities = sorted([
        *manifest_identities, *supplement_manifest_identities, *completed_manifest_identities,
    ])
    aggregate = hashlib.sha256(("\n".join(evidence_identities) + ("\n" if evidence_identities else "")).encode("utf-8")).hexdigest()
    return {
        "archived_unity_run_count": len(run_roots),
        "archived_successful_run_count": successful_runs,
        "archived_failed_run_count": failed_runs,
        "archived_unindexed_attempt_count": unindexed_attempts,
        "archive_supplement_count": len(supplements),
        "supplemented_pointer_file_count": supplemented_pointer_files,
        "completed_unity_run_snapshot_count": len(completed_runs),
        "archive_manifest_set_sha256": aggregate,
        **history_proof,
    }


def verify_current_lab_proof(lab_app: Path, unity_sha: str | None = None) -> dict[str, Any]:
    unity_sha = unity_sha or git(UNITY_REPO, "rev-parse", "HEAD")
    app = lab_app.resolve(strict=True)
    try:
        app.relative_to(PILOT_ROOT.resolve(strict=True))
    except ValueError as error:
        raise RuntimeError(f"lab application escaped pilot root: {app}") from error
    receipt = json.loads(BUILD_RECEIPT.read_text(encoding="utf-8"))
    require(receipt.get("schema") == "project-studio-audio-lab-build-receipt/v1", "build receipt schema mismatch")
    require(receipt.get("unity_git_sha") == unity_sha, "build receipt Unity SHA is stale")
    require(receipt.get("scene_asset_path") == "Assets/ProjectStudioAudioLab/Scenes/ProjectStudioAudioLab.unity", "build receipt scene mismatch")
    require(receipt.get("build_result") == "SUCCEEDED" and receipt.get("build_errors") == 0 and receipt.get("build_bytes", 0) > 0, "build receipt result failed")
    require(receipt.get("production_build_settings_mutated") is False and receipt.get("player_launched") is False, "build receipt isolation failed")
    expected_app_name = "Project Studio Audio Systems Pilot"
    expected_bundle_identifier = "com.projectstudio.prototype.audio-systems-pilot-01"
    require(receipt.get("project_settings_sha256_before_and_after") == sha256_file(UNITY_REPO / "ProjectSettings/ProjectSettings.asset")
            and receipt.get("project_settings_net_changed") is False, "build receipt does not prove byte-exact ProjectSettings restoration")
    require(receipt.get("executable_normalized_to_lab_name") is True
            and receipt.get("bundle_identifier") == expected_bundle_identifier
            and receipt.get("bundle_display_name") == expected_app_name
            and receipt.get("info_plist_lint_passed") is True
            and receipt.get("built_from_unique_temporary_bundle") is True
            and receipt.get("stale_bundle_resources_precluded") is True
            and receipt.get("ad_hoc_codesign_applied") is True, "build receipt isolated bundle identity/signing contract failed")
    require(isinstance(receipt.get("removed_staged_burst_debug_sidecar_count"), int)
            and receipt.get("removed_staged_burst_debug_sidecar_count") >= 0
            and receipt.get("staged_burst_debug_sidecars_remaining") == 0
            and receipt.get("staging_directory_removed_before_receipt") is True
            and receipt.get("preexisting_staging_residue_count") == 0
            and receipt.get("staging_residue_count_at_receipt") == 0
            and receipt.get("preexisting_transaction_residue_count") == 0
            and receipt.get("transaction_residue_count_expected_after_promotion") == 0,
            "build receipt does not prove scoped staging/Burst-sidecar cleanup")
    build_parent = PILOT_ROOT / "09_unity-lab/Builds/macOS"
    staging_residue = list(build_parent.glob("AudioLabBuild-*"))
    transaction_residue = [
        *build_parent.glob("Project Studio Audio Systems Pilot.app.replaced-*"),
        *build_parent.glob("Project Studio Audio Systems Pilot.app.build-receipt.json.replaced-*"),
        *build_parent.glob("Project Studio Audio Systems Pilot.app.build-receipt.json.tmp-*"),
    ]
    require(staging_residue == [] and transaction_residue == [],
            "lab-owned build staging/transaction residue remains after the canonical build")
    receipt_app = pilot_path(receipt["application_path"])
    executable = pilot_path(receipt["executable_relative_path"])
    require(receipt_app == app and app.name == f"{expected_app_name}.app"
            and executable.parent == app / "Contents/MacOS" and executable.name == expected_app_name,
            "requested app/executable identity differs from build receipt")
    require(executable.is_file() and sha256_file(executable) == receipt.get("executable_sha256"), "built executable hash mismatch")
    require(receipt.get("bundle_file_content_tree_scope")
            == "SORTED_REGULAR_FILE_RELATIVE_PATH_LENGTH_SHA256;SYMLINKS_REFUSED;DIRECTORY_METADATA_AND_POSIX_MODES_EXCLUDED"
            and receipt.get("bundle_file_content_tree_sha256") == bundle_file_content_tree_sha256(app)
            and receipt.get("executable_is_runnable") is True and bool(executable.stat().st_mode & 0o111),
            "built app content-tree or runnable-executable receipt proof failed")
    replaced_tree = receipt.get("replaced_prior_bundle_tree_sha256")
    require(replaced_tree is None or (isinstance(replaced_tree, str) and re.fullmatch(r"[0-9a-f]{64}", replaced_tree) is not None),
            "build receipt prior-bundle displacement identity is malformed")
    plist_path = app / "Contents/Info.plist"
    lint = subprocess.run(["/usr/bin/plutil", "-lint", str(plist_path)], check=False, capture_output=True, text=True)
    require(lint.returncode == 0, "built Info.plist does not pass independent plutil lint")
    with plist_path.open("rb") as handle:
        plist = plistlib.load(handle)
    require(plist.get("CFBundleIdentifier") == expected_bundle_identifier
            and plist.get("CFBundleExecutable") == expected_app_name
            and plist.get("CFBundleName") == expected_app_name
            and plist.get("CFBundleDisplayName") == expected_app_name,
            "built Info.plist does not preserve the isolated lab identity")

    summary = json.loads(UNITY_VALIDATION.read_text(encoding="utf-8"))
    archive = {**verify_oracle_archive_register(), **verify_unity_run_archives()}
    require(summary.get("schema") == "project-studio-unity-audio-lab-validation/v1", "Unity validation schema mismatch")
    require(summary.get("unity_version") == "6000.3.22f1" and summary.get("baseline_git_sha") == UNITY_BASE
            and summary.get("unity_git_sha") == unity_sha, "Unity validation identity is stale")
    require(summary.get("machine_verdict") == "PASS", "Unity validation verdict failed")
    require(summary.get("frozen_system_register_path") == "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v5.json"
            and summary.get("frozen_system_register_sha256") == sha256_file(SYSTEM_REGISTER), "Unity frozen system-register pin mismatch")
    require(summary.get("direct_pinned_management_path") == "05_management-sfx/semantic-pack/management-semantic-catalogue.v4.json"
            and summary.get("direct_pinned_management_sha256") == sha256_file(MANAGEMENT_CATALOGUE), "Unity management-v4 pin mismatch")
    components = ("compile", "edit_mode", "play_mode", "build", "codesign", "audio_oracle", "process_gates")
    require(all(summary.get(name, {}).get("status") == "PASS" for name in components), "one or more Unity validation components failed")
    require(summary.get("process_gates") == {
        "status": "PASS", "path": None, "sha256": None, "test_count": 6,
        "passed": 6, "failed": 0, "skipped": 0,
        "detail": "Six per-operation collision gates bind the current Unity/documentation SHAs, report PASS_NO_ACTIVE_UNITY, and precede their outputs.",
    }, "Unity process-gate summary contract is missing or stale")
    _verify_test_xml(summary["edit_mode"], "09_unity-lab/TestResults/editmode-final.xml")
    _verify_test_xml(summary["play_mode"], "09_unity-lab/TestResults/playmode-final.xml")
    compile_path = pilot_path(summary["compile"].get("path", ""))
    require(str(compile_path.relative_to(PILOT_ROOT.resolve())) == "09_unity-lab/Logs/compile-final.log"
            and summary["compile"].get("sha256") == sha256_file(compile_path)
            and "[Audio Lab] Additive lab scene and mixer validated under Assets/ProjectStudioAudioLab." in compile_path.read_text(encoding="utf-8", errors="replace"),
            "Unity compile marker/hash failed")
    require(pilot_path(summary["build"].get("path", "")) == app and summary["build"].get("sha256") == receipt["executable_sha256"], "Unity build component differs from receipt")
    require(pilot_path(summary["codesign"].get("path", "")) == app, "Unity codesign component path mismatch")
    require(pilot_path(summary["audio_oracle"].get("path", "")) == ORACLE_SUITE.resolve()
            and summary["audio_oracle"].get("sha256") == sha256_file(ORACLE_SUITE)
            and summary["audio_oracle"].get("test_count") == 20, "Unity Oracle component identity/count mismatch")
    isolation = summary.get("production_isolation", {})
    require(isolation.get("status") == "PASS" and isolation.get("baseline_sha") == UNITY_BASE
            and isolation.get("worktree_clean") is True and isolation.get("dirty_paths") == [], "Unity production-isolation cleanliness failed")
    require(all(isolation.get(key) is False for key in (
        "production_scene_changed", "build_settings_changed", "packages_changed", "bridge_schema_dto_changed", "p05_touched"
    )), "Unity production/P05 isolation flag failed")
    changed_paths = isolation.get("changed_paths", [])
    require(changed_paths and all(path == "Assets/ProjectStudioAudioLab.meta" or path.startswith("Assets/ProjectStudioAudioLab/") for path in changed_paths), "Unity changed paths escaped additive root")
    artifact_rows = summary.get("artifacts", [])
    artifact_paths: set[str] = set()
    for row in artifact_rows:
        path = pilot_path(row.get("path", ""))
        relative = str(path.relative_to(PILOT_ROOT.resolve()))
        require(relative not in artifact_paths, f"duplicate Unity validation artifact: {relative}")
        artifact_paths.add(relative)
        require(path.is_file() and not path.is_symlink() and path.stat().st_size == row.get("bytes")
                and sha256_file(path) == row.get("sha256"), f"Unity validation artifact changed: {relative}")
    require(artifact_paths == UNITY_ARTIFACT_PATHS, "Unity validation artifact set is missing, extra, or stale")
    gate_outputs = {
        "compile": PILOT_ROOT / "09_unity-lab/Logs/compile-final.log",
        "editmode": PILOT_ROOT / "09_unity-lab/Logs/editmode-final.log",
        "playmode": PILOT_ROOT / "09_unity-lab/Logs/playmode-final.log",
        "build": PILOT_ROOT / "09_unity-lab/Logs/build-final.log",
        "oracle": PILOT_ROOT / "09_unity-lab/Logs/oracle-final.log",
        "validation-summary": PILOT_ROOT / "09_unity-lab/Logs/validation-summary-final.log",
    }
    for label, output_path in gate_outputs.items():
        gate_path = PILOT_ROOT / f"09_unity-lab/Logs/process-gate-{label}-final.log"
        gate = dict(
            line.split("=", 1) for line in gate_path.read_text(encoding="utf-8").splitlines() if "=" in line
        )
        require(set(gate) == {"utc", "next_command", "unity_git_sha", "documentation_git_sha",
                              "unrelated_unity_process_count", "matching_processes", "status"}
                and gate.get("status") == "PASS_NO_ACTIVE_UNITY"
                and gate.get("unity_git_sha") == unity_sha
                and gate.get("documentation_git_sha") == git(DOC_REPO, "rev-parse", "HEAD")
                and gate.get("unrelated_unity_process_count") == "0"
                and gate.get("matching_processes") == "NONE"
                and isinstance(gate.get("next_command"), str) and unity_sha in gate["next_command"]
                and bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z", gate.get("utc", "")))
                and output_path.is_file() and output_path.stat().st_mtime_ns >= gate_path.stat().st_mtime_ns,
                f"Unity process collision gate is missing, stale, or not PASS: {label}")
    current_run_payload, _ = read_contained_regular_bytes(PILOT_ROOT, UNITY_CURRENT_RUN)
    current_run = json.loads(current_run_payload.decode("utf-8"))
    require(current_run.get("schema") == "project-studio-unity-validation-current-run/v1"
            and current_run.get("status") == "PASS"
            and current_run.get("documentation_sha") == git(DOC_REPO, "rev-parse", "HEAD")
            and current_run.get("unity_sha") == unity_sha, "Unity current-run index identity is stale")
    current_rows = current_run.get("files", [])
    current_paths: set[str] = set()
    for row in current_rows:
        path = pilot_path(row.get("relative_path", ""))
        relative = str(path.relative_to(PILOT_ROOT.resolve()))
        require(relative not in current_paths, f"duplicate Unity current-run artifact: {relative}")
        current_paths.add(relative)
        require(path.is_file() and not path.is_symlink() and path.stat().st_size == row.get("bytes")
                and sha256_file(path) == row.get("sha256"), f"Unity current-run artifact changed: {relative}")
    expected_current_paths = UNITY_ARTIFACT_PATHS | {
        "09_unity-lab/Logs/validation-summary-final.log",
        "09_unity-lab/UNITY-AUDIO-LAB-VALIDATION.json",
    }
    require(current_paths == expected_current_paths, "Unity current-run artifact set is missing, extra, or stale")
    subprocess.run(["codesign", "--verify", "--deep", "--strict", str(app)], check=True, capture_output=True, text=True)
    return {"unity_sha": unity_sha, "executable_sha256": receipt["executable_sha256"],
            "editmode_passed": summary["edit_mode"]["passed"], "playmode_passed": summary["play_mode"]["passed"],
            **archive}


def expected_state_counts(*, include_return_package: bool) -> dict[str, int]:
    complete = json.loads(COMPLETE_AUDIO.read_text(encoding="utf-8"))["counts"]
    audition_source = json.loads(AUDITION_SOURCE.read_text(encoding="utf-8"))
    audition_derivatives = verify_derivative_projection(audition_source)
    unity = json.loads(UNITY_VALIDATION.read_text(encoding="utf-8"))
    oracle = json.loads(ORACLE_SUITE.read_text(encoding="utf-8"))
    reviews = json.loads((PILOT_ROOT / "12_logs/hostile-review/HOSTILE-REVIEW-FINAL-INDEX.json").read_text(encoding="utf-8"))
    counts = dict(CORE_STATE_COUNTS)
    counts.update({
        "bounded_audio_files": complete["audio_files"],
        "current_and_preserved_new_audio_rehashed": complete["audio_files"],
        "unique_audio_file_ids": complete["unique_file_ids"],
        "unique_audio_content_hashes": complete["unique_content_sha256"],
        "audition_items": sum(audition_source["counts"].values()),
        "audition_preview_derivative_files": audition_derivatives["aac_derivatives"],
        "unity_editmode_passed": unity["edit_mode"]["passed"],
        "unity_playmode_passed": unity["play_mode"]["passed"],
        "audio_oracle_scenarios": oracle["scenario_count"],
        "hostile_review_lanes": reviews["lane_count"],
    })
    if include_return_package:
        package = json.loads((RETURN_ROOT / "RETURN-PACKAGE-MANIFEST.json").read_text(encoding="utf-8"))
        counts["return_package_files"] = package["counts"]["files"]
    return counts


def verify_state_record(doc_sha: str, unity_sha: str, allowed_pairs: set[tuple[str, str]]) -> dict[str, Any]:
    state = json.loads(STATE.read_text(encoding="utf-8"))
    state_pair = (state.get("status"), state.get("phase"))
    require(state_pair in allowed_pairs, f"state phase/status is not allowed here: {state_pair}")
    require(state.get("schema_version") == 1 and state.get("pilot_id") == "project-studio-audio-systems-pilot-01", "state identity/schema mismatch")
    require(state.get("git", {}).get("documentation_sha") == doc_sha and state.get("git", {}).get("unity_sha") == unity_sha, "packaging state Git binding is stale")
    refs = state.get("source_refs", {})
    require(all(refs.get(key) == value for key, value in IMMUTABLE_SOURCE_REFS.items()), "state starting-authority refs are missing or stale")
    counts = state.get("counts", {})
    include_return_package = state_pair != ("IN_PROGRESS", "READY_FOR_PACKAGING")
    require(counts == expected_state_counts(include_return_package=include_return_package),
            "state count key set or value differs from the canonical live projection")
    require(state.get("count_scopes") == STATE_COUNT_SCOPES, "state generated/derived count scopes are missing or ambiguous")
    errors = state.get("errors")
    require(isinstance(errors, list) and all(isinstance(error, dict) for error in errors), "state error ledger is malformed")
    error_ids = [error.get("id") for error in errors]
    require(len(error_ids) == len(set(error_ids)) and {f"ERR-{number:04d}" for number in range(1, 11)} <= set(error_ids), "state error ledger lost or duplicated recovery history")
    require(all(error.get("status") == "RESOLVED" for error in errors), "packaging state has an unresolved ordinary failure")
    decisions = state.get("decisions", [])
    require(isinstance(decisions, list) and all(isinstance(row, dict) for row in decisions), "state decision ledger is malformed")
    raw_decision_ids = [row.get("id") for row in decisions]
    require(len(raw_decision_ids) == len(set(raw_decision_ids)), "state decision IDs are duplicated")
    decision_ids = set(raw_decision_ids)
    require({f"DEC-{number:04d}" for number in range(1, 14)} <= decision_ids, "state is missing a recorded pilot decision")
    completed = state.get("completed_work", [])
    require(any("clean-SHA Unity" in row and "Audio Oracle" in row for row in completed), "state lacks final clean-SHA/Oracle completion record")
    next_action = state.get("next_resumable_action", "")
    if state_pair == ("IN_PROGRESS", "READY_FOR_PACKAGING"):
        require(next_action == PACKAGING_NEXT_ACTION, "packaging-ready state next action is not canonical")
    if state_pair == ("IN_PROGRESS", "READY_FOR_FINAL_VALIDATION"):
        require(next_action == VALIDATION_NEXT_ACTION, "validation-ready state next action is not canonical")
    if state_pair == ("COMPLETE", "FINAL_VALIDATION_COMPLETE"):
        require(next_action == OWNER_NEXT_ACTION, "completed state has an action beyond the canonical Owner listening gate")
    if state_pair != ("IN_PROGRESS", "READY_FOR_PACKAGING"):
        manifest_path = RETURN_ROOT / "RETURN-PACKAGE-MANIFEST.json"
        require(manifest_path.is_file(), "post-package state has no return-package manifest")
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        require(counts.get("return_package_files") == manifest.get("counts", {}).get("files"), "state return-package file count is stale")
    return state


def verify_prepackage_state(doc_sha: str, unity_sha: str) -> dict[str, Any]:
    return verify_state_record(doc_sha, unity_sha, {("IN_PROGRESS", "READY_FOR_PACKAGING")})


def clone_file(source: Path, destination: Path) -> None:
    if not source.is_file() or source.is_symlink():
        raise RuntimeError(f"required package source missing: {source}")
    expected_hash = sha256_file(source)
    expected_bytes = source.stat().st_size
    destination.parent.mkdir(parents=True, exist_ok=True)
    completed = subprocess.run(["cp", "-c", str(source), str(destination)], check=False, capture_output=True, text=True)
    if completed.returncode != 0:
        shutil.copy2(source, destination)
    if (not destination.is_file() or destination.is_symlink()
            or source.stat().st_size != expected_bytes or sha256_file(source) != expected_hash
            or destination.stat().st_size != expected_bytes or sha256_file(destination) != expected_hash):
        raise RuntimeError(f"package copy hash mismatch: {destination}")


def exact_tree_snapshot(root: Path) -> list[dict[str, Any]]:
    root = root.resolve(strict=True)
    rows: list[dict[str, Any]] = []
    for path in sorted(root.rglob("*")):
        relative = str(path.relative_to(root))
        if path.is_symlink():
            rows.append({"path": relative, "type": "symlink", "target": os.readlink(path)})
        elif path.is_file():
            rows.append({
                "path": relative, "type": "file", "bytes": path.stat().st_size,
                "mode": path.stat().st_mode & 0o777, "sha256": sha256_file(path),
            })
        elif path.is_dir():
            rows.append({"path": relative, "type": "directory", "mode": path.stat().st_mode & 0o777})
        else:
            raise RuntimeError(f"unsupported package source tree entry: {path}")
    return rows


def copy_tree(source: Path, destination: Path) -> None:
    if not source.is_dir() or source.is_symlink() or destination.exists():
        raise RuntimeError(f"required package directory missing: {source}")
    before = exact_tree_snapshot(source)
    completed = subprocess.run(["ditto", str(source), str(destination)], check=False, capture_output=True, text=True)
    if completed.returncode != 0:
        raise RuntimeError(f"ditto failed for {source}: {completed.stderr}")
    if exact_tree_snapshot(source) != before or exact_tree_snapshot(destination) != before:
        raise RuntimeError(f"package directory copy changed during materialization: {source}")


def write_markdown(path: Path, payload: str) -> None:
    atomic_write_text(path, payload.strip() + "\n")


def start_here() -> str:
    return """
# Project: Studio — Audio Systems Pilot 01

This is an isolated, offline prototype audition package. It is not the production game. Nothing here is final, Owner-approved, commercially cleared, cleared for import, or cleared for shipping. No human listening acceptance has occurred; your ratings are the next gate. You do not need music theory—rate whether each sound supports a clear, comfortable studio-management experience.

## Start the Unity Audio Lab

Open `AUDIO-LAB/START-AUDIO-LAB.command`. The launcher points this lab-only build to the preserved local pilot root through `PROJECT_STUDIO_AUDIO_PILOT_ROOT`. It does not launch a production scene or read the real Owner profile.

The lab lets you switch three responsive epochs and four cue contexts, test Full/Balanced/Sparse/Off density, trigger transitions and management sounds, move Wide/Medium/Close acoustic zoom, run radio schedules, inspect captions/history/diagnostics, change accessibility mixes, simulate 1×/2×/4×, pause, and device reset, then export local feedback.

## Start the larger audition desk

Open `AUDITION/START-AUDITION.command`. It starts a loopback-only local page and opens it in your browser. Ratings persist in that browser on this Mac and export to CSV/JSON. There is no login, telemetry, cloud, or external service.

## Listening order

1. Responsive `NORMAL`, `ACTIVE`, `BLOCKED`, and `WORKSPACE` variants for Early, Mid, and Modern.
2. Three treatments at each rendered era boundary.
3. Living Lot with Score off, then Wide/Medium/Close and the five activity fixtures.
4. Management sounds repeatedly, paying attention to irritation and restraint.
5. All three eleven-minute Studio Radio programs with captions.
6. Speech First, Night, Music Light, Music Off, and Force Mono.
7. Audio Oracle renders and traces.

Export feedback when finished. A later, separately authorized post-P05 checkpoint is required before any production integration.
"""


def known_limitations() -> str:
    return """
# Known limitations

- No Owner or human listening acceptance has occurred.
- Machine selection cannot establish musical quality, long-session comfort, historical correctness, cultural acceptance, copyrightability, exclusivity, non-infringement, or commercial clearance.
- Responsive cues are independently generated horizontal full mixes. They are not aligned stems and do not establish melodic continuity.
- Generated cue BPM/phrase estimates are low confidence. Runtime audio uses a safe crossfade unless an explicit trustworthy timing fixture is injected; the Oracle phrase test is labelled as a synthetic transport fixture.
- Era-transition crossfade edit points are audition estimates, not verified authored phrase boundaries.
- Living-lot activity and era variants are presentation-only lab fixtures. They do not prove or create authoritative activity or era truth.
- Generic local synthetic presenter voices are scratch prototypes. Names, casting, performance, pronunciation, historical delivery, and treatment need human review.
- Period treatment is not one universal “old radio” filter; nevertheless all three approaches remain provisional.
- Unity batch proof validates code, scene structure, schedules, files, and rendered signal properties. It cannot prove audibility on every device or subjective mix quality.
- The Audio Oracle contains scenario-labelled Unity evidence for all required scenarios: PlayMode observations where available, plus batch policy/validator execution and frozen-trace revalidation. Force Mono and Night carry Unity Editor-generated offline output-processor marker renders; these are not AudioSource, mixer, built-player, or hardware-output captures. No scenario is presented as a mixed listening demonstration.
- The v5 runtime register exposes 18 item-level Radio Voice files, six PA Voice files, and one milestone sting on independent buses. Missing or mismatched item audio fails visibly to caption/transcript-only presentation with no duck. The three whole-programme demos are baked full mixes, so Unity refuses their audible playback and keeps them in the offline audition desk with their caption/transcript files. Interrupted items retain whole-source rather than word-timed caption text and are explicitly marked interrupted.
- Radio, PA, score, ambience, SFX, and UI never mutate mechanics. Functional bulletins use typed lab fixture payloads until their future owner contracts exist.
- The Small-SFX path uses an exact public optimized prototype weight and existing approved shared components. It does not create commercial clearance.
- The Audio Lab APIs and integration proposal are provisional. Production integration was prepared but not executed.
"""


def audio_lab_readme() -> str:
    return """
# Isolated Unity Audio Lab

Use `START-AUDIO-LAB.command`. The application loads only explicit, SHA-256-bound local prototype files from `PROJECT_STUDIO_AUDIO_PILOT_ROOT`. It is not in production build settings and is not the production game.
"""


def provenance_readme() -> str:
    return """
# Provenance timing boundary

`STATE-AT-PACKAGING.json` is the atomic source-state snapshot taken immediately before this immutable package was assembled. It is deliberately not labelled as the final state because package verification and final validation occur afterward. The canonical current state remains `/Users/bruce/Project Studio Audio Systems Pilot 01/00_state/AUDIO-SYSTEMS-PILOT-STATE.json` on the Owner machine.

`unity-validation-evidence/` preserves the exact run archives, eager successful-run snapshots, and a separately labelled content-addressed supplement. The supplement restores one metadata pointer projection without modifying the original archive and does not rehabilitate that historical run: its preserved Unity verdict remains `FAIL`. Only the canonical current validation is the green authority.
"""


def launcher_text() -> str:
    return """#!/bin/zsh
set -euo pipefail
SCRIPT_DIR="${0:A:h}"
PILOT_ROOT_DEFAULT="/Users/bruce/Project Studio Audio Systems Pilot 01"
export PROJECT_STUDIO_AUDIO_PILOT_ROOT="${PROJECT_STUDIO_AUDIO_PILOT_ROOT:-$PILOT_ROOT_DEFAULT}"
if [[ ! -f "$PROJECT_STUDIO_AUDIO_PILOT_ROOT/10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v5.json" ]]; then
  print -u2 "Audio Lab refused: catalogue unavailable under $PROJECT_STUDIO_AUDIO_PILOT_ROOT"
  print -u2 "Set PROJECT_STUDIO_AUDIO_PILOT_ROOT to the preserved Audio Systems Pilot root and retry."
  exit 2
fi
LAB_EXECUTABLE="$SCRIPT_DIR/Project Studio Audio Systems Pilot.app/Contents/MacOS/Project Studio Audio Systems Pilot"
if [[ ! -x "$LAB_EXECUTABLE" ]]; then
  print -u2 "Audio Lab refused: packaged executable unavailable at $LAB_EXECUTABLE"
  exit 3
fi
exec "$LAB_EXECUTABLE"
"""


def safe_file_component(value: str) -> str:
    if not isinstance(value, str) or re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", value) is None:
        raise RuntimeError(f"unsafe package filename component: {value!r}")
    return value


def package_item_destination(item: dict[str, Any], root: Path) -> Path | None:
    source = canonical_contained(PILOT_ROOT, Path(item["source_path"]))
    safe_id = safe_file_component(item["id"])
    collection = item["collection"]
    if collection in {"ERA_LIBRARY", "RESPONSIVE_MUSIC"}:
        epoch_map = {
            "acoustic_electrical_1920_1932": "EARLY",
            "network_sound_1933_1945": "EARLY",
            "tape_hifi_1946_1959": "EARLY",
            "multitrack_fm_1960_1974": "MID",
            "format_plurality_1975_1986": "MID",
            "sampled_digital_1987_1999": "MID",
            "networked_hybrid_2000_2014": "MODERN",
            "streaming_plural_2015_2029": "MODERN",
            "legacy_future_2030_2040": "MODERN",
        }
        prefix = "ERA-PICK" if collection == "ERA_LIBRARY" else "RESPONSIVE"
        if item["epoch"] not in epoch_map:
            raise RuntimeError(f"unmapped audition epoch: {item['epoch']}")
        destination = root / "MUSIC" / epoch_map[item["epoch"]] / f"{prefix}--{safe_id}{source.suffix}"
    elif collection == "ERA_TRANSITIONS":
        destination = root / "TRANSITIONS" / f"{safe_id}{source.suffix}"
    elif collection == "LIVING_LOT":
        destination = root / "LIVING-LOT" / f"{safe_id}{source.suffix}"
    elif collection == "MANAGEMENT_SFX":
        destination = root / "MANAGEMENT-SFX" / f"{safe_id}{source.suffix}"
    elif collection == "ACCESSIBILITY":
        destination = root / "ACCESSIBILITY" / f"{safe_id}{source.suffix}"
    else:
        return None
    try:
        destination.resolve(strict=False).relative_to(root.resolve(strict=True))
    except ValueError as error:
        raise RuntimeError(f"package item destination escaped staging root: {destination}") from error
    return destination


def package_item(item: dict[str, Any], root: Path) -> None:
    destination = package_item_destination(item, root)
    if destination is None:
        return
    source = canonical_contained(PILOT_ROOT, Path(item["source_path"]))
    clone_file(source, destination)


def radio_copy_pairs(root: Path) -> list[tuple[Path, Path]]:
    mappings = {
        "EARLY": "EARLY-NETWORK-GOLDEN-STUDIO-V2",
        "POSTWAR": "POSTWAR-PERSONALITY-TAPE-HIFI-V2",
        "DIGITAL": "DIGITAL-NETWORKED-HYBRID-V2",
    }
    pairs: list[tuple[Path, Path]] = []
    for destination_name, slug in mappings.items():
        source_root = PILOT_ROOT / "06_radio/demos-v2" / slug
        destination_root = root / "RADIO" / destination_name
        expected_root_names = {
            f"{slug}-RUNTIME-DEMO.m4a", f"{slug}-RUNTIME-DEMO.wav", "CAPTIONS.v2.vtt",
            "TRANSCRIPT.v2.md", "SCHEDULE.v2.json", "METADATA.v2.json",
            "THIRTY-MINUTE-SIMULATION.v2.json", "voice",
        }
        require({path.name for path in source_root.iterdir()} == expected_root_names, f"radio demo root allowlist mismatch: {slug}")
        metadata = json.loads((source_root / "METADATA.v2.json").read_text(encoding="utf-8"))
        require(metadata.get("schema") == "project-studio-runtime-radio-demo/v2"
                and metadata.get("machine_verdict") == "PASS", f"radio demo metadata failed: {slug}")
        for key in ("master", "preview", "captions", "transcript"):
            record = metadata[key]
            source = canonical_contained(source_root, Path(record["path"]))
            require(sha256_file(source) == record["sha256"], f"radio demo source hash mismatch: {slug}:{key}")
        for name in sorted(expected_root_names - {"voice"}):
            pairs.append((source_root / name, destination_root / name))
        voice_root = source_root / "voice"
        role_names = {"OPENING", "FUNCTIONAL", "INTERRUPTIBLE", "PA"}
        require({path.name for path in voice_root.iterdir()} == role_names, f"radio voice role allowlist mismatch: {slug}")
        for role in sorted(role_names):
            role_root = voice_root / role
            require({path.name for path in role_root.iterdir()} == {"CLEAN.wav", "PERIOD-TREATED.wav", "metadata.v2.json"},
                    f"radio voice file allowlist mismatch: {slug}:{role}")
            voice_metadata = json.loads((role_root / "metadata.v2.json").read_text(encoding="utf-8"))
            require(voice_metadata.get("schema") == "project-studio-radio-voice-render/v2"
                    and voice_metadata.get("rights_status") == "PROTOTYPE_ONLY", f"radio voice metadata failed: {slug}:{role}")
            for key in ("clean", "period_treated"):
                record = voice_metadata[key]
                source = canonical_contained(role_root, Path(record["path"]))
                require(sha256_file(source) == record["sha256"] and probe_audio(source) == record["probe"],
                        f"radio voice source identity failed: {slug}:{role}:{key}")
            for name in ("CLEAN.wav", "PERIOD-TREATED.wav", "metadata.v2.json"):
                pairs.append((role_root / name, destination_root / "VOICE" / role / name))
    return pairs


def copy_radio(root: Path) -> None:
    for source, destination in radio_copy_pairs(root):
        clone_file(source, destination)


def hostile_review_copy_pairs(root: Path) -> list[tuple[Path, Path]]:
    index = json.loads((PILOT_ROOT / "12_logs/hostile-review/HOSTILE-REVIEW-FINAL-INDEX.json").read_text(encoding="utf-8"))
    destination = root / "PROVENANCE/HOSTILE-REVIEW"
    pairs = [(PILOT_ROOT / "12_logs/hostile-review/HOSTILE-REVIEW-FINAL-INDEX.json", destination / "HOSTILE-REVIEW-FINAL-INDEX.json")]
    for row in index["lanes"]:
        source = canonical_contained(PILOT_ROOT / "12_logs/hostile-review", Path(row["report"]["path"]))
        require(sha256_file(source) == row["report"]["sha256"], f"hostile-review source changed: {row['lane_id']}")
        pairs.append((source, destination / source.name))
    return pairs


def copy_hostile_reviews(root: Path) -> None:
    for source, destination in hostile_review_copy_pairs(root):
        clone_file(source, destination)


def four_hour_copy_pairs(root: Path) -> list[tuple[Path, Path]]:
    source_root = PILOT_ROOT / "02_music-bundles/simulations"
    suite_path = source_root / "FOUR-HOUR-DENSITY-SIMULATIONS.v2.json"
    suite = json.loads(suite_path.read_text(encoding="utf-8"))
    require(suite.get("schema") == "project-studio-four-hour-density-simulations/v2"
            and suite.get("machine_verdict") == "PASS" and suite.get("trace_count") == 12
            and len(suite.get("traces", [])) == 12, "four-hour suite failed before package copy")
    source_register = suite.get("source_register")
    require(isinstance(source_register, dict) and set(source_register) == {"path", "sha256"}
            and pilot_path(source_register.get("path", "")) == SYSTEM_REGISTER.resolve()
            and source_register.get("sha256") == sha256_file(SYSTEM_REGISTER),
            "four-hour suite source-register identity is stale before package copy")
    destination = root / "PROVENANCE/four-hour-density"
    pairs = [(suite_path, destination / suite_path.name)]
    copied: set[Path] = set()
    for record in suite["traces"]:
        source = canonical_contained(source_root, Path(record["path"]))
        require(source not in copied and sha256_file(source) == record["sha256"], "four-hour trace duplicate or hash mismatch")
        copied.add(source)
        pairs.append((source, destination / source.name))
    return pairs


def copy_four_hour_simulations(root: Path) -> None:
    for source, destination in four_hour_copy_pairs(root):
        clone_file(source, destination)


def current_oracle_copy_pairs(root: Path) -> list[tuple[Path, Path]]:
    """Package only current scenario-labelled Unity Oracle evidence, never superseded traces."""
    pairs = [(ORACLE_SUITE, root / "AUDIO-ORACLE" / ORACLE_SUITE.name)]
    suite = json.loads(ORACLE_SUITE.read_text(encoding="utf-8"))
    for scenario in suite["scenarios"]:
        for record, required_root in ((scenario["trace"], "07_audio-oracle/traces"), (scenario.get("capture"), "07_audio-oracle/captures")):
            if not record:
                continue
            relative = Path(record["path"])
            if relative.is_absolute() or ".." in relative.parts:
                raise RuntimeError(f"Oracle artifact is not a safe relative path: {relative}")
            exact_source_root = (PILOT_ROOT / required_root).resolve(strict=True)
            source = (PILOT_ROOT / relative).resolve(strict=True)
            try:
                source.relative_to(exact_source_root)
            except ValueError as error:
                raise RuntimeError(f"Oracle artifact escaped its exact evidence root: {relative}") from error
            if not source.is_file() or sha256_file(source) != record["sha256"]:
                raise RuntimeError(f"current Oracle artifact missing or hash-mismatched: {source}")
            if "bytes" in record and source.stat().st_size != record["bytes"]:
                raise RuntimeError(f"current Oracle artifact size mismatch: {source}")
            if "probe" in record:
                actual_probe = probe_audio(source)
                declared_probe = record["probe"]
                require(all(actual_probe.get(key) == declared_probe.get(key)
                            for key in ("codec", "sample_rate_hz", "channels", "bits_per_sample"))
                        and abs(float(actual_probe["duration_seconds"]) - float(declared_probe["duration_seconds"])) <= 0.001,
                        f"current Oracle capture probe mismatch: {source}")
            packaged_relative = source.relative_to(ORACLE_ROOT.resolve(strict=True))
            destination = root / "AUDIO-ORACLE" / packaged_relative
            try:
                destination.resolve(strict=False).relative_to((root / "AUDIO-ORACLE").resolve(strict=True))
            except ValueError as error:
                raise RuntimeError(f"packaged Oracle destination escaped its root: {destination}") from error
            pairs.append((source, destination))
    for relative in (
        "09_unity-lab/UNITY-AUDIO-LAB-VALIDATION.json",
        "09_unity-lab/RuntimeEvidence/audio-oracle-runtime-observations.json",
        "09_unity-lab/Builds/macOS/Project Studio Audio Systems Pilot.app.build-receipt.json",
    ):
        pairs.append((PILOT_ROOT / relative, root / "AUDIO-ORACLE" / Path(relative).name))
    return pairs


def copy_current_oracle(root: Path) -> None:
    for source, destination in current_oracle_copy_pairs(root):
        clone_file(source, destination)


def manifest_tree(root: Path) -> dict[str, Any]:
    files: list[dict[str, Any]] = []
    links: list[dict[str, Any]] = []
    directories: list[dict[str, Any]] = []
    for path in sorted(root.rglob("*")):
        if path == root / "RETURN-PACKAGE-MANIFEST.json":
            continue
        relative = str(path.relative_to(root))
        if path.is_symlink():
            target = path.resolve(strict=True)
            try:
                target.relative_to(root.resolve())
            except ValueError as error:
                raise RuntimeError(f"return-package symlink escapes root: {path}") from error
            links.append({"relative_path": relative, "target": os.readlink(path)})
        elif path.is_file():
            files.append({"relative_path": relative, "bytes": path.stat().st_size, "sha256": sha256_file(path), "mode": path.stat().st_mode & 0o777})
        elif path.is_dir():
            directories.append({"relative_path": relative, "mode": path.stat().st_mode & 0o777})
        else:
            raise RuntimeError(f"unsupported return-package tree entry: {path}")
    return {"files": files, "symlinks": links, "directories": directories}


def tree_snapshot_sha256(root: Path) -> str:
    payload = json.dumps(exact_tree_snapshot(root), sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def package_copy_specs(root: Path) -> dict[str, list[tuple[str, Path, Path, bool]]]:
    """Recompute every source-backed package projection from live authorities."""
    file_specs: list[tuple[str, Path, Path, bool]] = []

    def add_file(source: Path, destination: Path, live_current: bool = True) -> None:
        file_specs.append((f"FILE:{destination.relative_to(root)}", source, destination, live_current))

    source_register = json.loads(AUDITION_SOURCE.read_text(encoding="utf-8"))
    require(source_register.get("schema") == "project-studio-audio-systems-audition-source/v2",
            "package source projection has a stale audition register")
    for item in source_register.get("items", []):
        destination = package_item_destination(item, root)
        if destination is not None:
            add_file(canonical_contained(PILOT_ROOT, Path(item["source_path"])), destination)
    for source, destination in radio_copy_pairs(root):
        add_file(source, destination)
    for source, destination in current_oracle_copy_pairs(root):
        add_file(source, destination)
    for source in CATALOGUE_SOURCES:
        add_file(source, root / "CATALOGUE" / source.name)
    for source in PROVENANCE_SOURCES:
        add_file(source, root / "PROVENANCE" / source.name)
    derivative = json.loads((PILOT_ROOT / "11_return-package/audition-previews-v2/AUDITION-PREVIEW-DERIVATIVES.json").read_text(encoding="utf-8"))
    version_manifest = pilot_path(derivative["current_version"]["path"])
    add_file(version_manifest, root / "PROVENANCE" / f"CURRENT-{version_manifest.name}")
    add_file(STATE, root / "PROVENANCE/STATE-AT-PACKAGING.json", False)
    for source, destination in hostile_review_copy_pairs(root):
        add_file(source, destination)
    for source, destination in four_hour_copy_pairs(root):
        add_file(source, destination)
    for name in DOC_NAMES:
        add_file(DOC_REPO / "docs/audio" / name, root / "PROVENANCE" / name)
    for source, destination in (
        (DOC_REPO / "docs/audio/CODEX-ERA-TRANSITION-ATLAS-01.md", root / "TRANSITIONS/ERA-TRANSITION-ATLAS.md"),
        (DOC_REPO / "docs/audio/CODEX-RESPONSIVE-MUSIC-BUNDLES-01.md", root / "MUSIC/README.md"),
        (DOC_REPO / "docs/audio/CODEX-LIVING-LOT-SOUNDSCAPE-01.md", root / "LIVING-LOT/README.md"),
        (DOC_REPO / "docs/audio/CODEX-MANAGEMENT-AUDIO-LANGUAGE-01.md", root / "MANAGEMENT-SFX/README.md"),
        (DOC_REPO / "docs/audio/CODEX-STUDIO-RADIO-RUNTIME-01.md", root / "RADIO/README.md"),
        (PILOT_ROOT / "07_audio-oracle/accessibility-renders-v4/ACCESSIBILITY-PRESETS.v4.json", root / "ACCESSIBILITY/ACCESSIBILITY-PRESETS.v4.json"),
    ):
        add_file(source, destination)

    file_specs.sort(key=lambda row: row[0])
    file_ids = [row[0] for row in file_specs]
    require(len(file_ids) == len(set(file_ids)), "package copy projection contains duplicate destination files")
    tree_specs = [
        ("TREE:AUDIO-LAB", LAB_APP, root / "AUDIO-LAB/Project Studio Audio Systems Pilot.app", True),
        ("TREE:AUDITION", AUDITION_APP, root / "AUDITION", True),
        ("TREE:COMPLETE-REGISTER-HISTORY", COMPLETE_HISTORY_ROOT, root / "PROVENANCE/complete-register-history", True),
        ("TREE:MANAGEMENT-METADATA-HISTORY", MANAGEMENT_HISTORY_ROOT, root / "PROVENANCE/management-metadata-history", True),
        ("TREE:UNITY-ARCHIVED-RUNS", PILOT_ROOT / "09_unity-lab/ArchivedRuns", root / "PROVENANCE/unity-validation-evidence/ArchivedRuns", True),
        ("TREE:UNITY-ARCHIVE-SUPPLEMENTS", PILOT_ROOT / "09_unity-lab/ArchiveSupplements", root / "PROVENANCE/unity-validation-evidence/ArchiveSupplements", True),
        ("TREE:UNITY-COMPLETED-RUNS", PILOT_ROOT / "09_unity-lab/CompletedRuns", root / "PROVENANCE/unity-validation-evidence/CompletedRuns", True),
    ]
    return {"files": file_specs, "trees": tree_specs}


def generated_package_files() -> dict[str, tuple[str, int]]:
    feedback = io.StringIO(newline="")
    csv.writer(feedback).writerow(FEEDBACK_FIELDS)
    return {
        "START-HERE.md": (start_here().strip() + "\n", 0o644),
        "KNOWN-LIMITATIONS.md": (known_limitations().strip() + "\n", 0o644),
        "OWNER-FEEDBACK.csv": (feedback.getvalue(), 0o644),
        "AUDIO-LAB/START-AUDIO-LAB.command": (launcher_text(), 0o755),
        "AUDIO-LAB/README.md": (audio_lab_readme().strip() + "\n", 0o644),
        "PROVENANCE/README.md": (provenance_readme().strip() + "\n", 0o644),
    }


def build_package_source_bindings(root: Path, refs: dict[str, str]) -> dict[str, Any]:
    specs = package_copy_specs(root)
    files: list[dict[str, Any]] = []
    for artifact_id, source, packaged, live_current in specs["files"]:
        require(source.is_file() and not source.is_symlink() and packaged.is_file() and not packaged.is_symlink(),
                f"package file binding endpoint missing: {artifact_id}")
        source_hash = sha256_file(source)
        require(packaged.stat().st_size == source.stat().st_size and sha256_file(packaged) == source_hash,
                f"package file binding source/destination mismatch: {artifact_id}")
        files.append({
            "id": artifact_id, "source_path": str(source), "source_bytes": source.stat().st_size,
            "source_sha256": source_hash, "package_relative_path": str(packaged.relative_to(root)),
            "package_bytes": packaged.stat().st_size, "package_sha256": source_hash,
            "source_mode": source.stat().st_mode & 0o777, "package_mode": packaged.stat().st_mode & 0o777,
            "compare_to_live_current": live_current,
        })
    trees: list[dict[str, Any]] = []
    for artifact_id, source, packaged, live_current in specs["trees"]:
        require(source.is_dir() and not source.is_symlink() and packaged.is_dir() and not packaged.is_symlink(),
                f"package tree binding endpoint missing: {artifact_id}")
        source_snapshot = exact_tree_snapshot(source)
        require(exact_tree_snapshot(packaged) == source_snapshot, f"package tree projection mismatch: {artifact_id}")
        digest = tree_snapshot_sha256(source)
        trees.append({
            "id": artifact_id, "source_path": str(source), "source_tree_sha256": digest,
            "source_entry_count": len(source_snapshot), "package_relative_path": str(packaged.relative_to(root)),
            "package_tree_sha256": digest, "package_entry_count": len(source_snapshot),
            "compare_to_live_current": live_current,
        })
    return {
        "schema": "project-studio-owner-return-source-bindings/v2",
        "documentation_sha": refs["documentation_sha"], "unity_sha": refs["unity_sha"],
        "documentation_branch": "codex/audio-systems-pilot-01",
        "unity_branch": "wip/audio-systems-pilot-01-client",
        "files": files, "trees": trees,
    }


def verify_package_source_bindings(root: Path, bindings: dict[str, Any]) -> dict[str, Any]:
    doc_sha = git(DOC_REPO, "rev-parse", "HEAD")
    unity_sha = git(UNITY_REPO, "rev-parse", "HEAD")
    require(set(bindings) == {"schema", "documentation_sha", "unity_sha", "documentation_branch", "unity_branch", "files", "trees"}
            and bindings.get("schema") == "project-studio-owner-return-source-bindings/v2"
            and bindings.get("documentation_sha") == doc_sha
            and bindings.get("unity_sha") == unity_sha
            and bindings.get("documentation_branch") == "codex/audio-systems-pilot-01"
            and bindings.get("unity_branch") == "wip/audio-systems-pilot-01-client",
            "return package D/U source binding is stale")
    specs = package_copy_specs(root)
    rows = bindings.get("files", [])
    require([row.get("id") for row in rows] == [row[0] for row in specs["files"]],
            "return package bound file identity set/order is stale")
    for row, (artifact_id, source, packaged, live_current) in zip(rows, specs["files"]):
        require(set(row) == {"id", "source_path", "source_bytes", "source_sha256", "package_relative_path",
                             "package_bytes", "package_sha256", "source_mode", "package_mode", "compare_to_live_current"}
                and row.get("source_path") == str(source)
                and row.get("package_relative_path") == str(packaged.relative_to(root))
                and row.get("compare_to_live_current") is live_current
                and packaged.is_file() and not packaged.is_symlink()
                and packaged.stat().st_size == row.get("package_bytes") == row.get("source_bytes")
                and (packaged.stat().st_mode & 0o777) == row.get("package_mode") == row.get("source_mode")
                and sha256_file(packaged) == row.get("package_sha256") == row.get("source_sha256"),
                f"return package bound file projection failed: {artifact_id}")
        if live_current:
            require(source.is_file() and not source.is_symlink() and source.stat().st_size == row.get("source_bytes")
                    and (source.stat().st_mode & 0o777) == row.get("source_mode")
                    and sha256_file(source) == row.get("source_sha256"),
                    f"return package no longer matches current source evidence: {artifact_id}")
    tree_rows = bindings.get("trees", [])
    require([row.get("id") for row in tree_rows] == [row[0] for row in specs["trees"]],
            "return package bound tree identity set/order is stale")
    for row, (artifact_id, source, packaged, live_current) in zip(tree_rows, specs["trees"]):
        require(set(row) == {"id", "source_path", "source_tree_sha256", "source_entry_count",
                             "package_relative_path", "package_tree_sha256", "package_entry_count", "compare_to_live_current"}
                and row.get("source_path") == str(source)
                and row.get("package_relative_path") == str(packaged.relative_to(root))
                and row.get("compare_to_live_current") is live_current
                and packaged.is_dir() and not packaged.is_symlink()
                and tree_snapshot_sha256(packaged) == row.get("package_tree_sha256") == row.get("source_tree_sha256")
                and len(exact_tree_snapshot(packaged)) == row.get("package_entry_count") == row.get("source_entry_count"),
                f"return package bound tree projection failed: {artifact_id}")
        if live_current:
            require(source.is_dir() and not source.is_symlink()
                    and tree_snapshot_sha256(source) == row.get("source_tree_sha256")
                    and len(exact_tree_snapshot(source)) == row.get("source_entry_count"),
                    f"return package no longer matches current source tree: {artifact_id}")
    state_snapshot = json.loads((root / "PROVENANCE/STATE-AT-PACKAGING.json").read_text(encoding="utf-8"))
    require(state_snapshot.get("status") == "IN_PROGRESS" and state_snapshot.get("phase") == "READY_FOR_PACKAGING"
            and state_snapshot.get("git", {}).get("documentation_sha") == doc_sha
            and state_snapshot.get("git", {}).get("unity_sha") == unity_sha
            and state_snapshot.get("schema_version") == 1
            and state_snapshot.get("pilot_id") == "project-studio-audio-systems-pilot-01"
            and all(state_snapshot.get("source_refs", {}).get(key) == value for key, value in IMMUTABLE_SOURCE_REFS.items())
            and state_snapshot.get("counts") == expected_state_counts(include_return_package=False)
            and state_snapshot.get("count_scopes") == STATE_COUNT_SCOPES
            and state_snapshot.get("next_resumable_action") == PACKAGING_NEXT_ACTION,
            "return package packaging-state snapshot identity/phase is stale")
    errors = state_snapshot.get("errors", [])
    decisions = state_snapshot.get("decisions", [])
    require(isinstance(errors, list) and all(isinstance(row, dict) for row in errors)
            and len({row.get("id") for row in errors}) == len(errors)
            and {f"ERR-{number:04d}" for number in range(1, 11)} <= {row.get("id") for row in errors}
            and all(row.get("status") == "RESOLVED" for row in errors),
            "return package packaging-state error ledger is malformed, duplicated, or unresolved")
    require(isinstance(decisions, list) and all(isinstance(row, dict) for row in decisions)
            and len({row.get("id") for row in decisions}) == len(decisions)
            and {f"DEC-{number:04d}" for number in range(1, 14)} <= {row.get("id") for row in decisions},
            "return package packaging-state decision ledger is malformed or duplicated")
    return {"bound_files": len(rows), "bound_trees": len(tree_rows), "documentation_sha": doc_sha, "unity_sha": unity_sha}


def verify_generated_package_files(root: Path) -> set[str]:
    expected = generated_package_files()
    for relative, (payload, mode) in expected.items():
        path = root / relative
        require(path.is_file() and not path.is_symlink()
                and path.read_bytes() == payload.encode("utf-8")
                and (path.stat().st_mode & 0o777) == mode,
                f"generated return-package file differs from its canonical generator: {relative}")
    return set(expected)


def verify_package_projection_coverage(root: Path, bindings: dict[str, Any], manifest: dict[str, Any]) -> None:
    expected_files = verify_generated_package_files(root)
    expected_links: set[str] = set()
    expected_directories = set(REQUIRED_DIRS)

    def add_parents(relative: str) -> None:
        parent = Path(relative).parent
        while str(parent) != ".":
            expected_directories.add(str(parent))
            parent = parent.parent

    for relative in REQUIRED_DIRS:
        add_parents(relative)

    for row in bindings["files"]:
        relative = row["package_relative_path"]
        expected_files.add(relative)
        add_parents(relative)
    for row in bindings["trees"]:
        prefix = row["package_relative_path"]
        expected_directories.add(prefix)
        add_parents(prefix)
        for entry in exact_tree_snapshot(root / prefix):
            relative = str(Path(prefix) / entry["path"])
            if entry["type"] == "file":
                expected_files.add(relative)
            elif entry["type"] == "symlink":
                expected_links.add(relative)
            elif entry["type"] == "directory":
                expected_directories.add(relative)
            add_parents(relative)
    actual_files = {row["relative_path"] for row in manifest["files"]}
    actual_links = {row["relative_path"] for row in manifest["symlinks"]}
    actual_directories = {row["relative_path"] for row in manifest["directories"]}
    require(actual_files == expected_files, "return package contains a missing, extra, or source-unbound file")
    require(actual_links == expected_links, "return package contains a missing, extra, or source-unbound symlink")
    require(actual_directories == expected_directories, "return package contains a missing or extra directory")


def build(lab_app: Path) -> dict[str, Any]:
    if os.path.lexists(RETURN_ROOT):
        raise RuntimeError(f"return package already exists; verify or preserve it instead of overwriting: {RETURN_ROOT}")
    require(lab_app.resolve(strict=True) == LAB_APP.resolve(strict=True), "packaging refuses a noncanonical Audio Lab bundle")
    refs = verify_clean_pushed_sources()
    verify_complete_audio_register(refs["documentation_sha"], refs["unity_sha"])
    verify_current_lab_proof(lab_app, refs["unity_sha"])
    completed = subprocess.run(
        [sys.executable, str(DOC_REPO / "tools/audio_systems_pilot_01/validate_audio_systems_pilot.py"),
         "--lab-app", str(lab_app), "--prepackage-only"],
        cwd=DOC_REPO, check=False, capture_output=True, text=True,
    )
    require(completed.returncode == 0, f"canonical prepackage semantic validation failed: {completed.stderr[-2000:]}")
    prepackage = json.loads(PREPACKAGE_VALIDATION.read_text(encoding="utf-8"))
    require(prepackage.get("schema") == "project-studio-audio-systems-prepackage-validation/v1"
            and prepackage.get("status") == "PASS", "prepackage semantic validation artifact failed")
    verify_prepackage_state(refs["documentation_sha"], refs["unity_sha"])
    oracle_verification = verify_oracle()
    if oracle_verification.get("machine_verdict") != "PASS" or oracle_verification.get("total_scenarios") != 20:
        raise RuntimeError("strict Audio Oracle verification failed before one-shot packaging")
    if verify_audition().get("machine_verdict") != "PASS":
        raise RuntimeError("offline audition application did not pass its independent verifier")
    if verify_hostile_reviews().get("machine_verdict") != "PASS":
        raise RuntimeError("hostile-review closure did not pass before one-shot packaging")
    source_register = json.loads(AUDITION_SOURCE.read_text(encoding="utf-8"))
    if source_register.get("schema") != "project-studio-audio-systems-audition-source/v2":
        raise RuntimeError("unexpected audition source register")
    for item in source_register["items"]:
        if sha256_file(canonical_contained(PILOT_ROOT, Path(item["source_path"]))) != item["sha256"]:
            raise RuntimeError(f"audition source changed before packaging: {item['id']}")
    oracle_index = json.loads(ORACLE_SUITE.read_text(encoding="utf-8"))
    if oracle_index.get("schema") != "project-studio-audio-oracle-suite/v1" or oracle_index.get("machine_verdict") != "PASS":
        raise RuntimeError("Audio Oracle is not a current scenario-labelled Unity machine pass")
    if int(oracle_index.get("required_scenario_count", 0)) != 18 or int(oracle_index.get("scenario_count", 0)) != 20:
        raise RuntimeError("Audio Oracle does not contain exactly 18 required and two supplemental scenarios")
    subprocess.run(["codesign", "--verify", "--deep", "--strict", str(lab_app)], check=True, capture_output=True, text=True)

    staging = Path(tempfile.mkdtemp(prefix=".Project-Studio-Audio-Systems-Pilot-01.", dir=RETURN_ROOT.parent))
    try:
        for relative in REQUIRED_DIRS:
            if relative == "AUDITION":
                # The verified tree copier owns creation of this exact root and
                # refuses a pre-existing destination.
                continue
            (staging / relative).mkdir(parents=True, exist_ok=True)
        write_markdown(staging / "START-HERE.md", start_here())
        write_markdown(staging / "KNOWN-LIMITATIONS.md", known_limitations())
        feedback = io.StringIO(newline="")
        csv.writer(feedback).writerow(FEEDBACK_FIELDS)
        atomic_write_text(staging / "OWNER-FEEDBACK.csv", feedback.getvalue())

        copy_tree(lab_app, staging / "AUDIO-LAB/Project Studio Audio Systems Pilot.app")
        atomic_write_text(staging / "AUDIO-LAB/START-AUDIO-LAB.command", launcher_text(), mode=0o755)
        write_markdown(staging / "AUDIO-LAB/README.md", audio_lab_readme())
        for item in source_register["items"]:
            package_item(item, staging)
        copy_radio(staging)
        copy_current_oracle(staging)
        copy_tree(AUDITION_APP, staging / "AUDITION")
        require(verify_audition(staging / "AUDITION").get("machine_verdict") == "PASS",
                "staged return-package audition application failed semantic verification")

        for source in CATALOGUE_SOURCES:
            clone_file(source, staging / "CATALOGUE" / source.name)
        for source in PROVENANCE_SOURCES:
            clone_file(source, staging / "PROVENANCE" / source.name)
        audition_derivative = json.loads((PILOT_ROOT / "11_return-package/audition-previews-v2/AUDITION-PREVIEW-DERIVATIVES.json").read_text(encoding="utf-8"))
        version_manifest = pilot_path(audition_derivative["current_version"]["path"])
        clone_file(version_manifest, staging / "PROVENANCE" / f"CURRENT-{version_manifest.name}")
        clone_file(PILOT_ROOT / "00_state/AUDIO-SYSTEMS-PILOT-STATE.json", staging / "PROVENANCE/STATE-AT-PACKAGING.json")
        write_markdown(staging / "PROVENANCE/README.md", provenance_readme())
        copy_hostile_reviews(staging)
        copy_four_hour_simulations(staging)
        copy_tree(COMPLETE_HISTORY_ROOT, staging / "PROVENANCE/complete-register-history")
        copy_tree(MANAGEMENT_HISTORY_ROOT, staging / "PROVENANCE/management-metadata-history")
        copy_tree(PILOT_ROOT / "09_unity-lab/ArchivedRuns", staging / "PROVENANCE/unity-validation-evidence/ArchivedRuns")
        copy_tree(PILOT_ROOT / "09_unity-lab/ArchiveSupplements", staging / "PROVENANCE/unity-validation-evidence/ArchiveSupplements")
        copy_tree(PILOT_ROOT / "09_unity-lab/CompletedRuns", staging / "PROVENANCE/unity-validation-evidence/CompletedRuns")
        for name in DOC_NAMES:
            clone_file(DOC_REPO / "docs/audio" / name, staging / "PROVENANCE" / name)
        clone_file(DOC_REPO / "docs/audio/CODEX-ERA-TRANSITION-ATLAS-01.md", staging / "TRANSITIONS/ERA-TRANSITION-ATLAS.md")
        clone_file(DOC_REPO / "docs/audio/CODEX-RESPONSIVE-MUSIC-BUNDLES-01.md", staging / "MUSIC/README.md")
        clone_file(DOC_REPO / "docs/audio/CODEX-LIVING-LOT-SOUNDSCAPE-01.md", staging / "LIVING-LOT/README.md")
        clone_file(DOC_REPO / "docs/audio/CODEX-MANAGEMENT-AUDIO-LANGUAGE-01.md", staging / "MANAGEMENT-SFX/README.md")
        clone_file(DOC_REPO / "docs/audio/CODEX-STUDIO-RADIO-RUNTIME-01.md", staging / "RADIO/README.md")
        clone_file(PILOT_ROOT / "07_audio-oracle/accessibility-renders-v4/ACCESSIBILITY-PRESETS.v4.json", staging / "ACCESSIBILITY/ACCESSIBILITY-PRESETS.v4.json")

        verify_staged_external_hygiene(staging)
        subprocess.run(["codesign", "--verify", "--deep", "--strict", str(staging / "AUDIO-LAB/Project Studio Audio Systems Pilot.app")], check=True, capture_output=True, text=True)
        tree = manifest_tree(staging)
        manifest = {
            "schema": "project-studio-audio-systems-owner-return/v1",
            "generated_utc": utc_now(),
            "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
            "human_acceptance": "NONE_RECORDED",
            "production_integration": "PREPARED_NOT_EXECUTED",
            "telemetry": False,
            "cloud": False,
            "source_bindings": build_package_source_bindings(staging, refs),
            "files": tree["files"],
            "symlinks": tree["symlinks"],
            "directories": tree["directories"],
            "counts": {"files": len(tree["files"]), "symlinks": len(tree["symlinks"]), "directories": len(tree["directories"]), "audition_items": len(source_register["items"]), "oracle_scenarios": oracle_index["scenario_count"], "required_oracle_scenarios": 18},
        }
        atomic_write_json(staging / "RETURN-PACKAGE-MANIFEST.json", manifest)
        verify_root(staging)
        rename_directory_exclusive(staging, RETURN_ROOT)
    except Exception:
        shutil.rmtree(staging, ignore_errors=True)
        raise
    return verify()


def verify_root(root: Path) -> dict[str, Any]:
    if root.is_symlink():
        raise RuntimeError(f"return-package root may not be a symlink: {root}")
    root = root.resolve(strict=True)
    manifest_path = root / "RETURN-PACKAGE-MANIFEST.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("schema") != "project-studio-audio-systems-owner-return/v1" or manifest.get("status") != "PROTOTYPE_READY_FOR_OWNER_AUDITION" or manifest.get("human_acceptance") != "NONE_RECORDED":
        raise RuntimeError("return package status/schema boundary mismatch")
    if manifest.get("telemetry") is not False or manifest.get("cloud") is not False or manifest.get("production_integration") != "PREPARED_NOT_EXECUTED":
        raise RuntimeError("return package offline/integration policy mismatch")
    verify_staged_external_hygiene(root)
    clean_refs = verify_clean_pushed_sources()
    source_binding_proof = verify_package_source_bindings(root, manifest.get("source_bindings", {}))
    require(source_binding_proof["documentation_sha"] == clean_refs["documentation_sha"]
            and source_binding_proof["unity_sha"] == clean_refs["unity_sha"],
            "return package source bindings differ from the clean pushed branches")
    verify_current_lab_proof(LAB_APP, source_binding_proof["unity_sha"])
    require(verify_oracle().get("machine_verdict") == "PASS", "current source-bound Audio Oracle failed strict semantic verification")
    require(exact_tree_snapshot(root / "PROVENANCE/complete-register-history")
            == exact_tree_snapshot(COMPLETE_HISTORY_ROOT),
            "return package complete-register predecessor history differs from current preserved chain")
    require(exact_tree_snapshot(root / "PROVENANCE/management-metadata-history")
            == exact_tree_snapshot(MANAGEMENT_HISTORY_ROOT),
            "return package management-metadata history differs from its registered preserved set")
    for relative in REQUIRED_DIRS:
        if not (root / relative).is_dir():
            raise RuntimeError(f"return package missing required directory: {relative}")
    for name in ("START-HERE.md", "KNOWN-LIMITATIONS.md", "OWNER-FEEDBACK.csv"):
        if not (root / name).is_file():
            raise RuntimeError(f"return package missing required file: {name}")
    file_paths = [record.get("relative_path") for record in manifest.get("files", [])]
    link_paths = [record.get("relative_path") for record in manifest.get("symlinks", [])]
    directory_paths = [record.get("relative_path") for record in manifest.get("directories", [])]
    if (None in file_paths or None in link_paths or None in directory_paths
            or len(set(file_paths + link_paths + directory_paths)) != len(file_paths) + len(link_paths) + len(directory_paths)):
        raise RuntimeError("return package manifest paths are missing or duplicate")
    for record in manifest["files"]:
        path = canonical_contained(root, root / record["relative_path"])
        if not path.is_file() or path.is_symlink() or path.stat().st_size != record["bytes"] or (path.stat().st_mode & 0o777) != record["mode"] or sha256_file(path) != record["sha256"]:
            raise RuntimeError(f"return package hash mismatch: {path}")
    current_tree = manifest_tree(root)
    if current_tree["files"] != manifest["files"] or current_tree["symlinks"] != manifest["symlinks"] or current_tree["directories"] != manifest.get("directories"):
        raise RuntimeError("return package tree differs from its immutable manifest")
    verify_package_projection_coverage(root, manifest["source_bindings"], manifest)
    counts = manifest.get("counts", {})
    if counts.get("files") != len(manifest["files"]) or counts.get("symlinks") != len(manifest["symlinks"]) or counts.get("directories") != len(manifest["directories"]):
        raise RuntimeError("return package tree counts are stale")
    audition_manifest = json.loads((root / "AUDITION/AUDITION-BUILD-MANIFEST.json").read_text(encoding="utf-8"))
    if verify_audition(root / "AUDITION").get("machine_verdict") != "PASS":
        raise RuntimeError("return-package audition application failed semantic verification")
    oracle_suite = json.loads((root / "AUDIO-ORACLE/AUDIO-ORACLE-SUITE.v1.json").read_text(encoding="utf-8"))
    if (counts.get("audition_items") != audition_manifest.get("counts", {}).get("items")
            or counts.get("oracle_scenarios") != 20 or counts.get("required_oracle_scenarios") != 18
            or oracle_suite.get("scenario_count") != 20 or oracle_suite.get("required_scenario_count") != 18):
        raise RuntimeError("return package audition/Oracle counts are stale")
    expected_collections = {
        "ERA_LIBRARY": 27, "RESPONSIVE_MUSIC": 12, "ERA_TRANSITIONS": 9,
        "LIVING_LOT": 11, "MANAGEMENT_SFX": 45, "STUDIO_RADIO": 3,
        "ACCESSIBILITY": 6, "AUDIO_ORACLE": 2,
    }
    if audition_manifest.get("counts", {}).get("collections") != expected_collections:
        raise RuntimeError("return package audition collection coverage is not exact")
    def count_audio(relative: str) -> int:
        return sum(path.is_file() and path.suffix.lower() in AUDIO_SUFFIXES for path in (root / relative).rglob("*"))
    exact_audio_counts = {
        "MUSIC": 39, "TRANSITIONS": 9, "LIVING-LOT": 11,
        "MANAGEMENT-SFX": 45, "ACCESSIBILITY": 6,
    }
    if any(count_audio(relative) != expected for relative, expected in exact_audio_counts.items()):
        raise RuntimeError("return package required audio-category coverage is not exact")
    if len(list((root / "RADIO").glob("*/*-RUNTIME-DEMO.m4a"))) != 3:
        raise RuntimeError("return package radio preview coverage is not exact")
    expected_trace_paths = {
        "AUDIO-ORACLE/" + str(Path(row["trace"]["path"]).relative_to("07_audio-oracle"))
        for row in oracle_suite.get("scenarios", [])
    }
    expected_capture_paths = {
        "AUDIO-ORACLE/" + str(Path(row["capture"]["path"]).relative_to("07_audio-oracle"))
        for row in oracle_suite.get("scenarios", []) if row.get("capture")
    }
    actual_trace_paths = {str(path.relative_to(root)) for path in (root / "AUDIO-ORACLE/traces").glob("*.json")}
    actual_capture_paths = {str(path.relative_to(root)) for path in (root / "AUDIO-ORACLE/captures").glob("*.wav")}
    if (len(expected_trace_paths) != 20 or len(expected_capture_paths) != 2
            or actual_trace_paths != expected_trace_paths or actual_capture_paths != expected_capture_paths):
        raise RuntimeError("return package Oracle trace/capture coverage differs from its suite")
    for launcher in (root / "AUDIO-LAB/START-AUDIO-LAB.command", root / "AUDITION/START-AUDITION.command"):
        if not launcher.is_file() or not (launcher.stat().st_mode & 0o111):
            raise RuntimeError(f"return package launcher is not executable: {launcher}")
    subprocess.run(["codesign", "--verify", "--deep", "--strict", str(root / "AUDIO-LAB/Project Studio Audio Systems Pilot.app")], check=True, capture_output=True, text=True)
    return {"machine_verdict": "PASS", "path": str(root), **counts, "manifest_sha256": sha256_file(manifest_path)}


def verify() -> dict[str, Any]:
    return verify_root(RETURN_ROOT)


def self_test() -> dict[str, int | str]:
    global PILOT_ROOT, COMPLETE_HISTORY_ROOT

    mutations = 0

    def expect_rejection(label: str, operation: Any) -> None:
        nonlocal mutations
        mutations += 1
        try:
            operation()
        except RuntimeError:
            return
        raise AssertionError(f"package/provenance mutation was accepted: {label}")

    voice_path = "06_radio/demos-v2/E02/voice/FUNCTIONAL/PERIOD.wav"
    voice = {"relative_path": voice_path, **expected_complete_file_policy(voice_path)}
    verify_complete_file_policy(voice)
    for field, replacement in (
        ("role_tags", ["STUDIO_RADIO"]),
        ("redistribution_status", "NOT_CLEARED_PROTOTYPE_ONLY"),
        ("historical_review", "NOT_APPLICABLE_OR_NOT_ERA_BEARING"),
        ("cultural_review", "APPROVED"),
    ):
        mutated = dict(voice)
        mutated[field] = replacement
        expect_rejection(f"voice {field}", lambda row=mutated: verify_complete_file_policy(row))

    predecessor_mutation = dict(voice)
    predecessor_mutation["redistribution_status"] = "NOT_CLEARED_PROTOTYPE_ONLY"
    expect_rejection(
        "predecessor voice redistribution",
        lambda: verify_complete_file_policy(predecessor_mutation),
    )

    original_pilot_root = PILOT_ROOT
    original_history_root = COMPLETE_HISTORY_ROOT
    with tempfile.TemporaryDirectory(prefix="package-predecessor-policy-self-test-") as temporary:
        PILOT_ROOT = Path(temporary)
        try:
            audio = PILOT_ROOT / voice_path
            audio.parent.mkdir(parents=True)
            with wave.open(str(audio), "wb") as output:
                output.setnchannels(1)
                output.setsampwidth(2)
                output.setframerate(48_000)
                output.writeframes(b"\0\0" * 480)
            valid_row = {
                "relative_path": voice_path,
                "bytes": audio.stat().st_size,
                "sha256": sha256_file(audio),
                "format": probe_audio(audio),
                **expected_complete_file_policy(voice_path),
            }

            def chain_for(row: dict[str, Any], history_name: str) -> dict[str, Any]:
                global COMPLETE_HISTORY_ROOT
                COMPLETE_HISTORY_ROOT = PILOT_ROOT / history_name
                COMPLETE_HISTORY_ROOT.mkdir(parents=True)
                COMPLETE_HISTORY_ROOT = COMPLETE_HISTORY_ROOT.resolve(strict=True)
                prior = {
                    "schema": "project-studio-complete-audio-file-register/v1",
                    "status": "PROTOTYPE_ONLY",
                    "machine_verdict": "PASS",
                    "counts": {"audio_files": 1},
                    "files": [row],
                }
                raw = (json.dumps(prior, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode("utf-8")
                digest = hashlib.sha256(raw).hexdigest()
                path = COMPLETE_HISTORY_ROOT / f"COMPLETE-AUDIO-FILE-REGISTER.v1-{digest}.json"
                path.write_bytes(raw)
                return {
                    "counts": {"audio_files": 1},
                    "predecessor": {
                        "path": str(path), "sha256": digest, "bytes": len(raw), "audio_files": 1,
                    },
                }

            verify_complete_predecessor_chain(chain_for(valid_row, "valid-history"))
            tampered_row = dict(valid_row)
            tampered_row["redistribution_status"] = "NOT_CLEARED_PROTOTYPE_ONLY"
            expect_rejection(
                "full predecessor-chain voice redistribution",
                lambda: verify_complete_predecessor_chain(chain_for(tampered_row, "tampered-history")),
            )
        finally:
            PILOT_ROOT = original_pilot_root
            COMPLETE_HISTORY_ROOT = original_history_root

    ambience_path = "04_living-lot/layers/WIDE.wav"
    ambience = {"relative_path": ambience_path, **expected_complete_file_policy(ambience_path)}
    mutated_ambience = dict(ambience)
    mutated_ambience["redistribution_status"] = "UNRESOLVED_LOCAL_SCRATCH_DO_NOT_DISTRIBUTE"
    expect_rejection("nonvoice redistribution", lambda: verify_complete_file_policy(mutated_ambience))

    with tempfile.TemporaryDirectory(prefix="audio-return-hygiene-self-test-") as temporary:
        root = Path(temporary)
        clean = root / "PROVENANCE/clean.json"
        clean.parent.mkdir(parents=True)
        clean.write_text('{"status":"PROTOTYPE_ONLY","cloud":false}\n', encoding="utf-8")
        verify_staged_external_hygiene(root)
        secret_samples = (
            "hf_" + "1234567890ABCDEFGHIJ1234567890",
            "Authorization: Bearer " + "abcdefghijklmnopqrstuvwxyz012345",
            "aws_access_key=" + "AKIA" + "1234567890ABCDEF",
            "api_key = '" + "abcdefghijklmnopqrstuvwx'",
            "-----BEGIN OPENSSH" + " PRIVATE KEY-----",
            "https://audio-user:" + "supersecretvalue@example.invalid/private",
        )
        for index, secret in enumerate(secret_samples):
            clean.write_text(secret + "\n", encoding="utf-8")
            expect_rejection(
                f"staged secret {index}",
                lambda: verify_staged_external_hygiene(root),
            )
        clean.write_text("clean\n", encoding="utf-8")
        for filename in (
            "private-legal-evidence.json",
            "backup Private Legal Evidence old.txt",
            "owner-auth-token-backup.txt",
        ):
            prohibited = root / "PROVENANCE" / filename
            prohibited.write_text("{}\n", encoding="utf-8")
            expect_rejection(
                f"private/credential filename {filename}",
                lambda: verify_staged_external_hygiene(root),
            )
            prohibited.unlink()

    return {"status": "PASSED", "mutation_tests": mutations}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--lab-app", type=Path)
    parser.add_argument("--verify-only", action="store_true")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        result = self_test()
    elif args.verify_only:
        result = verify()
    else:
        if args.lab_app is None:
            raise RuntimeError("--lab-app is required")
        result = build(args.lab_app)
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
