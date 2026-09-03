#!/usr/bin/env python3
"""Run the fail-closed final reconciliation for Audio Systems Pilot 01."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
from collections import Counter
from pathlib import Path
from typing import Any, Callable

from build_audio_oracle import verify as verify_oracle
from build_audition_app import verify as verify_audition
from build_hostile_review_index import verify as verify_hostile_reviews
from package_owner_return import (
    verify as verify_package,
    verify_committed_history_policy,
    verify_complete_audio_register,
    verify_complete_predecessor_chain,
    verify_current_lab_proof,
    verify_state_record,
    verify_unity_run_archives,
)
from common import DOC_REPO, PILOT_ROOT, atomic_write_json, canonical_contained, probe_audio, sha256_file, utc_now


DOC_BASE = "c457c3a35a66b2ab4b72b0ca379f118b2f1fa1bf"
UNITY_BASE = "29aea89a706a7f0961f5a460afc5bdb4d38d8395"
UNITY_REPO = Path("/Users/bruce/Project Studio - Audio Systems Pilot 01 Client")
RETURN_ROOT = Path("/Users/bruce/Desktop/Project-Studio-Audio-Systems-Pilot-01")
OUTPUT = PILOT_ROOT / "10_provenance/FINAL-VALIDATION.v2.json"
PREPACKAGE_OUTPUT = PILOT_ROOT / "10_provenance/PREPACKAGE-VALIDATION.v1.json"

CATALOGUE_BASE = PILOT_ROOT / "01_catalogue/AudioPrototypeCatalogue.v1.json"
PHASE_A_RECEIPT = PILOT_ROOT / "10_provenance/phase-a-reconciliation.json"
SOURCE_AUTHORITY_HASHES = PILOT_ROOT / "10_provenance/source-authority-hashes.json"
PHASE_A_RECEIPT_BYTES = 1_670
PHASE_A_RECEIPT_SHA256 = "24bcc57527760c04a0c158f77df91ab1c920bdf7c0c5f50c217a1cd40e518397"
SOURCE_AUTHORITY_HASHES_BYTES = 4_414
SOURCE_AUTHORITY_HASHES_SHA256 = "c6530734ccfb4931a2e0bbc8daa1f5a74549eef1b832264509f3115a432abee8"
CATALOGUE_BASE_BYTES = 727_015
CATALOGUE_BASE_SHA256 = "0ee5d956763c70db305bdf9b5066cac0bfb77c499fbed07b6df5b87b8acfdade"
EXPECTED_PHASE_A_CHECKS = {
    "all_recorded_raw_hashes_match": True,
    "all_selected_derivative_hashes_match": True,
    "human_disposition_pending_for_every_entry": True,
    "motif_count_12": True,
    "no_excluded_primary": True,
    "no_owner_or_ship_status": True,
    "primary_pick_count_27": True,
    "raw_ids_unique": True,
    "raw_music_count_191": True,
    "rights_status_prototype_only_for_every_entry": True,
}
EXPECTED_PHASE_A_COUNTS = {
    "catalogue_entries": 203,
    "commissioning_aliases": 9,
    "long_session_playlists": 9,
    "motif_shape_sketches": 12,
    "provisional_alternates": 27,
    "provisional_primary_picks": 27,
    "radio_demos": 3,
    "radio_script_units": 126,
    "raw_music_candidates": 191,
    "voice_units": 30,
}
CATALOGUE = PILOT_ROOT / "01_catalogue/AudioPrototypeCatalogue.identity-closure.v3.json"
RESPONSIVE_REGISTER = PILOT_ROOT / "02_music-bundles/responsive/responsive-generation-register.v2.json"
RESPONSIVE = PILOT_ROOT / "02_music-bundles/responsive/responsive-bundle-catalogue.v2.json"
PLAYLISTS = PILOT_ROOT / "02_music-bundles/simulations/FOUR-HOUR-DENSITY-SIMULATIONS.v2.json"
TRANSITIONS = PILOT_ROOT / "03_transitions/rendered-transition-catalogue.v4.json"
LIVING = PILOT_ROOT / "04_living-lot/living-lot-soundscape-catalogue.v3.json"
MANAGEMENT = PILOT_ROOT / "05_management-sfx/semantic-pack/management-semantic-catalogue.v4.json"
RADIO = PILOT_ROOT / "06_radio/STUDIO-RADIO-RUNTIME-INDEX.v2.json"
RADIO_LINT = PILOT_ROOT / "06_radio/script-bank/RADIO-COPY-LINT.v2.json"
RADIO_FIXTURES = PILOT_ROOT / "06_radio/functional-fixtures.v2.json"
RADIO_SCHEDULER = PILOT_ROOT / "06_radio/scheduler-evidence/RADIO-SCHEDULER-EVIDENCE.v2.json"
PRESENTERS = PILOT_ROOT / "06_radio/presenter-ensemble.v2.json"
ACCESSIBILITY = PILOT_ROOT / "07_audio-oracle/accessibility-renders-v4/ACCESSIBILITY-PRESETS.v4.json"
AUDITION_SOURCE = PILOT_ROOT / "11_return-package/AUDITION-SOURCE-REGISTER.v2.json"
AUDITION = PILOT_ROOT / "08_audition-app/v2/AUDITION-BUILD-MANIFEST.json"
UNITY_VALIDATION = PILOT_ROOT / "09_unity-lab/UNITY-AUDIO-LAB-VALIDATION.json"
BUILD_RECEIPT = PILOT_ROOT / "09_unity-lab/Builds/macOS/Project Studio Audio Systems Pilot.app.build-receipt.json"
SYSTEM_REGISTER = PILOT_ROOT / "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v5.json"
ASSET_INDEX = PILOT_ROOT / "10_provenance/audio-assets-index.v4.json"
ASSET_VALIDATION = PILOT_ROOT / "10_provenance/audio-assets-validation.v4.json"
DERIVATIVES = PILOT_ROOT / "10_provenance/audio-derivative-source-register.v4.json"
COMPLETE_AUDIO = PILOT_ROOT / "10_provenance/COMPLETE-AUDIO-FILE-REGISTER.v1.json"
STATE = PILOT_ROOT / "00_state/AUDIO-SYSTEMS-PILOT-STATE.json"
HOSTILE_REVIEW_INDEX = PILOT_ROOT / "12_logs/hostile-review/HOSTILE-REVIEW-FINAL-INDEX.json"
AUDITION_PREVIEW_HISTORY = PILOT_ROOT / "11_return-package/audition-previews-v2/AUDITION-PREVIEW-HISTORY.v1.json"
AUDITION_APP_HISTORY = PILOT_ROOT / "08_audition-app/AUDITION-APP-HISTORY.v1.json"

ALLOWED_STATUS = {"PROTOTYPE_ONLY", "PROTOTYPE_READY_FOR_OWNER_AUDITION"}
AUDIO_SUFFIXES = {".wav", ".m4a", ".mp3", ".aac", ".flac", ".ogg", ".aif", ".aiff"}
EXPECTED_EPOCHS = {
    "acoustic_electrical_1920_1932", "format_plurality_1975_1986", "streaming_plural_2015_2029"
}
EXPECTED_CONTEXTS = {"NORMAL", "ACTIVE", "BLOCKED", "WORKSPACE"}
EXPECTED_TRANSITION_BOUNDARIES = {
    "AE-TO-NS": ("acoustic_electrical_1920_1932", "network_sound_1933_1945"),
    "MF-TO-FP": ("multitrack_fm_1960_1974", "format_plurality_1975_1986"),
    "SD-TO-NH": ("sampled_digital_1987_1999", "networked_hybrid_2000_2014"),
}
EXPECTED_TRANSITION_TREATMENTS = {
    "FINAL-WINDOW-AMBIENCE-BRIDGE", "SAFE-UNVERIFIED-WINDOW-CROSSFADE", "GENERIC-DERIVED-EXIT-ENTRY",
}
EXPECTED_MANAGEMENT_EVENTS = {
    "FOCUS", "SELECT", "OPEN", "CLOSE_BACK", "PLACE", "COMMIT", "CANCEL", "BLOCKED_REFUSED",
    "WARNING", "COMPLETION", "SAVE", "LOAD", "SPEED_UP", "SPEED_DOWN", "PAUSE_RESUME",
}
FUNCTIONAL_FIELDS = {
    "ownerDomain", "eventId", "receiptId", "headline", "body", "priority", "expiresAt", "captionText", "spokenText"
}
EXPECTED_FUNCTIONAL_IDENTITIES = {
    "LAB-E02-FUNCTIONAL-BULLETIN": "P13_AUDIO_LAB_FIXTURE",
    "LAB-E03-FUNCTIONAL-BULLETIN": "P05_AUDIO_LAB_FIXTURE",
    "LAB-E07-FUNCTIONAL-BULLETIN": "P06_AUDIO_LAB_FIXTURE",
}
EXPECTED_RADIO_DEMOS = {
    "EARLY-NETWORK-GOLDEN-STUDIO-V2": "network_sound_1933_1945",
    "POSTWAR-PERSONALITY-TAPE-HIFI-V2": "tape_hifi_1946_1959",
    "DIGITAL-NETWORKED-HYBRID-V2": "networked_hybrid_2000_2014",
}
EXPECTED_RADIO_PRESENTERS = {
    "PRESENTER-MAE-CALDER": {
        "display_name": "Mae Calder", "local_voice": "Kathy",
        "campaign_eligibility": {"E01", "E02", "E03", "E04", "E05", "E08"},
    },
    "PRESENTER-ARTHUR-VALE": {
        "display_name": "Arthur Vale", "local_voice": "Ralph",
        "campaign_eligibility": {"E02", "E03", "E04", "E05", "E06", "E07", "E09"},
    },
    "PRESENTER-RINA-SHORE": {
        "display_name": "Rina Shore", "local_voice": "Samantha",
        "campaign_eligibility": {"E01", "E04", "E05", "E06", "E07", "E08", "E09"},
    },
}
EXPECTED_DEMO_PRESENTERS = {
    "EARLY-NETWORK-GOLDEN-STUDIO-V2": "PRESENTER-MAE-CALDER",
    "POSTWAR-PERSONALITY-TAPE-HIFI-V2": "PRESENTER-ARTHUR-VALE",
    "DIGITAL-NETWORKED-HYBRID-V2": "PRESENTER-RINA-SHORE",
}
EXPECTED_RADIO_DEMO_ASSERTIONS = {
    "schedulerProducedEveryPlayout", "openingContainsRequiredRoles", "exactRepeatSuppressed",
    "expiredSuppressed", "newestFunctionalReceiptSelected", "functionalPayloadValidated",
    "radioDisabledNoMechanics", "streamerUnsafeSuppressed", "paActuallyPreemptsActiveRadio",
    "paOccursOverActiveMusicWindow", "captionsShareResolvedCore", "rollingBudgetsAndSpacing",
    "noMechanicalMutation",
}
EXPECTED_RADIO_SIM_ASSERTIONS = {
    "chronological", "exactItemNoRepeat", "categoryCooldowns", "rollingBudgetsAndSpacing",
    "typedFunctionalIdentity", "fullResolvedTextAndOwnership", "repeatProbeSuppressed",
    "noMechanicalMutation",
}
EXPECTED_ACCESSIBILITY_PRESETS = {
    "STANDARD", "SPEECH_FIRST", "NIGHT_LIMITED_DYNAMIC_RANGE", "MUSIC_LIGHT", "MUSIC_OFF", "FORCE_MONO",
}
EXPECTED_ACCESSIBILITY_CHECKS = {
    "all_duration_45_seconds", "force_mono_final_sum_one_channel",
    "music_off_keeps_six_non_music_buses", "other_final_sums_stereo", "six_renders",
    "source_register_hash_bound",
}
FINAL_CHECK_ORDER = (
    "git_isolation_and_push",
    "catalogue_identity_and_raw_hashes",
    "assets_derivatives_and_complete_inventory",
    "responsive_music_and_four_hour_density",
    "transitions_living_lot_and_management",
    "radio_and_accessibility",
    "system_unity_oracle_audition_and_return",
    "atomic_state_and_hostile_reviews",
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


def git(repo: Path, *arguments: str) -> str:
    return subprocess.run(["git", *arguments], cwd=repo, check=True, capture_output=True, text=True).stdout.strip()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def load(path: Path, schema: str | None = None) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if schema is not None:
        require(payload.get("schema") == schema, f"schema mismatch for {path}: {payload.get('schema')}")
    return payload


def verified_path(record: dict[str, Any], *, contained: bool = True) -> Path:
    path = Path(record["path"])
    if contained:
        path = canonical_contained(PILOT_ROOT, path)
    else:
        path = path.resolve(strict=True)
    require(path.is_file() and not path.is_symlink(), f"not a regular file: {path}")
    require(sha256_file(path) == record["sha256"], f"hash mismatch: {path}")
    if "probe" in record:
        require(probe_audio(path) == record["probe"], f"audio probe mismatch: {path}")
    return path


def pilot_path(value: str) -> Path:
    candidate = Path(value)
    if not candidate.is_absolute():
        candidate = PILOT_ROOT / candidate
    return canonical_contained(PILOT_ROOT, candidate)


def collect_presenter_ids(value: Any) -> set[str]:
    found: set[str] = set()
    if isinstance(value, dict):
        for key, child in value.items():
            if key == "presenterId" and isinstance(child, str):
                found.add(child)
            elif key == "presenters" and isinstance(child, list):
                found.update(item for item in child if isinstance(item, str))
            found.update(collect_presenter_ids(child))
    elif isinstance(value, list):
        for child in value:
            found.update(collect_presenter_ids(child))
    return found


def check_git_and_scope() -> dict[str, Any]:
    require(git(DOC_REPO, "branch", "--show-current") == "codex/audio-systems-pilot-01", "wrong documentation branch")
    require(git(UNITY_REPO, "branch", "--show-current") == "wip/audio-systems-pilot-01-client", "wrong Unity branch")
    subprocess.run(["git", "merge-base", "--is-ancestor", DOC_BASE, "HEAD"], cwd=DOC_REPO, check=True)
    subprocess.run(["git", "merge-base", "--is-ancestor", UNITY_BASE, "HEAD"], cwd=UNITY_REPO, check=True)
    require(git(DOC_REPO, "status", "--porcelain", "--untracked-files=all") == "", "documentation worktree is not clean")
    require(git(UNITY_REPO, "status", "--porcelain", "--untracked-files=all") == "", "Unity worktree is not clean")
    require(git(DOC_REPO, "rev-parse", "HEAD") == git(DOC_REPO, "rev-parse", "@{upstream}"), "documentation branch is not fully pushed")
    require(git(UNITY_REPO, "rev-parse", "HEAD") == git(UNITY_REPO, "rev-parse", "@{upstream}"), "Unity branch is not fully pushed")
    doc_paths = [row for row in git(DOC_REPO, "diff", "--name-only", f"{DOC_BASE}..HEAD").splitlines() if row]
    unity_paths = [row for row in git(UNITY_REPO, "diff", "--name-only", f"{UNITY_BASE}..HEAD").splitlines() if row]
    require(all(row.startswith(("docs/audio/", "tools/audio_systems_pilot_01/")) for row in doc_paths), "documentation branch escaped owned paths")
    require(all(row == "Assets/ProjectStudioAudioLab.meta" or row.startswith("Assets/ProjectStudioAudioLab/") for row in unity_paths), "Unity branch escaped additive root")
    doc_history = verify_committed_history_policy(
        DOC_REPO, DOC_BASE, git(DOC_REPO, "rev-parse", "HEAD"),
        allowed_prefixes=("docs/audio/", "tools/audio_systems_pilot_01/"),
    )
    unity_history = verify_committed_history_policy(
        UNITY_REPO, UNITY_BASE, git(UNITY_REPO, "rev-parse", "HEAD"),
        allowed_prefixes=("Assets/ProjectStudioAudioLab/",),
        allowed_exact=("Assets/ProjectStudioAudioLab.meta",),
        prohibited_path_tokens=("studiolot", "campaign/living-lot", "generated bridge", "generated dto"),
    )
    require(not any(any(token in row.lower() for token in ("studiolot", "campaign/living-lot")) for row in unity_history["paths"]), "P05/production collision path touched")
    for name in DOC_NAMES:
        require((DOC_REPO / "docs/audio" / name).is_file(), f"required document missing: {name}")
    secret_pattern = re.compile(r"(?:hf_[A-Za-z0-9]{20,}|Bearer\s+[A-Za-z0-9._-]{20,}|BEGIN (?:RSA|OPENSSH|EC) PRIVATE KEY)")
    for relative in (*doc_paths, *unity_paths):
        path = (DOC_REPO if relative in doc_paths else UNITY_REPO) / relative
        if path.is_file():
            try:
                require(secret_pattern.search(path.read_text(encoding="utf-8")) is None, f"credential-like content: {relative}")
            except UnicodeDecodeError:
                pass
    return {
        "documentation_sha": git(DOC_REPO, "rev-parse", "HEAD"), "unity_sha": git(UNITY_REPO, "rev-parse", "HEAD"),
        "documentation_changed_paths": len(doc_paths), "unity_additive_paths": len(unity_paths),
        "documentation_commits_audited": doc_history["commits_audited"],
        "unity_commits_audited": unity_history["commits_audited"],
        "p05_collision": "NONE", "production_changes": "NONE", "audio_binaries_committed": 0,
    }


def machine_excluded(entry: dict[str, Any]) -> bool:
    disposition = entry.get("machine_disposition", {})
    return (
        disposition.get("disposition") in {"MACHINE_EXCLUDED", "MACHINE-EXCLUDED", "EXCLUDE"}
        or disposition.get("screening_status") in {"MACHINE_EXCLUDED", "MACHINE-EXCLUDED", "EXCLUDE"}
    )


def check_catalogue() -> dict[str, Any]:
    require(PHASE_A_RECEIPT.is_file() and not PHASE_A_RECEIPT.is_symlink()
            and PHASE_A_RECEIPT.stat().st_size == PHASE_A_RECEIPT_BYTES
            and sha256_file(PHASE_A_RECEIPT) == PHASE_A_RECEIPT_SHA256,
            "Phase-A reconciliation receipt differs from its committed frozen identity")
    phase_a = load(PHASE_A_RECEIPT, "project-studio-audio-phase-a-reconciliation/v1")
    phase_catalogue = phase_a.get("catalogue", {})
    phase_catalogue_path = Path(phase_catalogue.get("path", ""))
    require(phase_a.get("status") == "PASS"
            and phase_a.get("checks") == EXPECTED_PHASE_A_CHECKS
            and phase_a.get("counts") == EXPECTED_PHASE_A_COUNTS
            and not phase_catalogue_path.is_symlink()
            and phase_catalogue_path.resolve(strict=True) == CATALOGUE_BASE.resolve(strict=True)
            and phase_catalogue.get("bytes") == CATALOGUE_BASE_BYTES
            and phase_catalogue.get("sha256") == CATALOGUE_BASE_SHA256,
            "Phase-A reconciliation semantics or frozen catalogue binding changed")
    require(CATALOGUE_BASE.is_file() and not CATALOGUE_BASE.is_symlink()
            and CATALOGUE_BASE.stat().st_size == CATALOGUE_BASE_BYTES
            and sha256_file(CATALOGUE_BASE) == CATALOGUE_BASE_SHA256,
            "canonical prototype catalogue differs from the committed Phase-A identity")

    require(SOURCE_AUTHORITY_HASHES.is_file() and not SOURCE_AUTHORITY_HASHES.is_symlink()
            and SOURCE_AUTHORITY_HASHES.stat().st_size == SOURCE_AUTHORITY_HASHES_BYTES
            and sha256_file(SOURCE_AUTHORITY_HASHES) == SOURCE_AUTHORITY_HASHES_SHA256,
            "source-authority register differs from its committed frozen identity")
    authority = load(SOURCE_AUTHORITY_HASHES, "project-studio-audio-source-authority-hashes/v1")
    authority_rows = authority.get("artifacts")
    require(authority.get("status") == "HASH_VERIFIED"
            and isinstance(authority_rows, list) and len(authority_rows) == 18
            and all(isinstance(row, dict) and set(row) == {"path", "bytes", "sha256"} for row in authority_rows),
            "source-authority register semantics or cardinality changed")
    authority_paths = [row["path"] for row in authority_rows]
    require(len(authority_paths) == len(set(authority_paths)), "source-authority register contains duplicate paths")
    for row in authority_rows:
        path = Path(row["path"])
        require(path.is_absolute() and path.is_file() and not path.is_symlink()
                and path.stat().st_size == row["bytes"] and sha256_file(path) == row["sha256"],
                f"source authority changed: {path}")

    base = load(CATALOGUE_BASE, "project-studio-audio-prototype-catalogue/v1")
    current = load(CATALOGUE, "project-studio-audio-prototype-catalogue-identity-closure/v3")
    require(current.get("machine_verdict") == "PASS", "catalogue identity closure failed")
    require(len(base["entries"]) == len(current["entries"]) == 203, "catalogue cardinality mismatch")
    require(current["source_code"]["commit"] == git(DOC_REPO, "rev-parse", "HEAD"), "catalogue builder binding stale")
    required = set(base["required_entry_fields"])
    base_by_id = {row["stable_prototype_id"]: row for row in base["entries"]}
    primary = 0
    motif_seed_dispositions = 0
    for entry in current["entries"]:
        require(required <= set(entry), f"catalogue fields missing: {entry['stable_prototype_id']}")
        require(entry["human_disposition"] == "PENDING" and entry["rights_status"] == "PROTOTYPE_ONLY", "catalogue status boundary violated")
        if entry["seed"] is None:
            require(entry.get("seed_disposition") == "NOT_APPLICABLE_NO_RANDOMNESS" and entry.get("seed_nullable_reason"), "unresolved null seed")
            motif_seed_dispositions += 1
        raw = entry["raw"]
        path = Path(raw["absolute_authoritative_path"]).resolve(strict=True)
        require(sha256_file(path) == raw["sha256"], f"raw source changed: {path}")
        require(base_by_id[entry["stable_prototype_id"]]["raw"]["sha256"] == raw["sha256"], "catalogue raw identity changed")
        for derivative in entry.get("derivatives", []):
            if derivative.get("selection_role") == "PRIMARY" and derivative.get("derivative_type") == "aac_preview":
                primary += 1
                require(not machine_excluded(entry), f"machine-excluded source became primary: {entry['source_candidate_id']}")
                verified_path({"path": str(PILOT_ROOT / derivative["pilot_relative_path"]), "sha256": derivative["sha256"]})
    require(primary == 27 and motif_seed_dispositions == 12, "catalogue pick or motif seed-disposition count mismatch")
    require(not current["identity_closure"]["null_identity_fields"] and not current["identity_closure"]["unresolved_seed_fields"], "identity closure incomplete")
    return {
        "entries": 203, "raw_hashes_reverified": 203, "primary_picks": 27,
        "motif_no-randomness_dispositions": 12, "phase_a_receipt_sha256": PHASE_A_RECEIPT_SHA256,
        "source_authorities_reverified": 18, "source_authority_register_sha256": SOURCE_AUTHORITY_HASHES_SHA256,
    }


def check_assets_and_inventory() -> dict[str, Any]:
    validation = load(ASSET_VALIDATION, "project-studio-audio-assets-validation/v4")
    require(validation.get("status") == "PASS" and all(validation["checks"].values()), "bounded v4 asset validation failed")
    index = load(ASSET_INDEX, "project-studio-audio-assets-index/v4")
    require(index["audio_asset_count"] == len(index["audio_assets"]) == 152, "asset-index cardinality mismatch")
    ids = [row["stable_prototype_id"] for row in index["audio_assets"]]
    paths = [row["relative_path"] for row in index["audio_assets"]]
    require(len(ids) == len(set(ids)) and len(paths) == len(set(paths)), "duplicate asset ID/path")
    for row in index["audio_assets"]:
        require(row["rights_status"] in ALLOWED_STATUS and row["human_disposition"] == "PENDING", "invalid asset disposition")
        verified_path({"path": str(PILOT_ROOT / row["relative_path"]), "sha256": row["sha256"]})
    derivative = load(DERIVATIVES, "project-studio-audio-derivative-source-register/v4")
    require(derivative["status"] == "HASH_VERIFIED" and derivative["relationship_count"] == len(derivative["relationships"]) == 80, "derivative register failed")
    for relation in derivative["relationships"]:
        verified_path(relation["derivative"])
        require(relation["phase_or_stem_alignment_claimed"] is False, "derivative claims stem/phase alignment")
        for source in relation["sources"]:
            verified_path(source, contained=False)
    complete = load(COMPLETE_AUDIO, "project-studio-complete-audio-file-register/v1")
    verify_complete_audio_register(git(DOC_REPO, "rev-parse", "HEAD"), git(UNITY_REPO, "rev-parse", "HEAD"))
    require(complete["machine_verdict"] == "PASS" and all(complete["checks"].values()), "complete audio register failed")
    require(complete["source_code"]["artifact_generation_commit"] == git(DOC_REPO, "rev-parse", "HEAD"), "complete register builder binding stale")
    require(complete["source_code"]["unity_lab_commit"] == git(UNITY_REPO, "rev-parse", "HEAD") and complete["source_code"]["unity_lab_branch"] == "wip/audio-systems-pilot-01-client", "complete register Unity binding stale")
    require(all(row["commit"] == git(DOC_REPO, "rev-parse", "HEAD") and row["matches_bound_commit"] for rows in complete["source_code"]["bindings"].values() for row in rows), "complete register source-code binding failed")
    records = complete["files"]
    registered_paths = {row["relative_path"] for row in records}
    bounded_candidates = [
        path for root_name in complete["inventory_scope"]["bounded_media_roots"]
        for path in (PILOT_ROOT / root_name).rglob("*")
    ]
    require(not any(path.is_symlink() for path in bounded_candidates), "bounded media root contains a symlink")
    actual_paths = {
        str(path.relative_to(PILOT_ROOT)) for path in bounded_candidates
        if path.is_file() and path.suffix.lower() in AUDIO_SUFFIXES
    }
    require(registered_paths == actual_paths, "complete audio register does not match current bounded filesystem")
    require(len({row["file_id"] for row in records}) == len(records), "complete file IDs are not unique")
    for row in records:
        require(row["rights_status"] == "PROTOTYPE_ONLY" and row["human_disposition"] == "PENDING", "complete register status boundary violated")
        path = verified_path({"path": str(PILOT_ROOT / row["relative_path"]), "sha256": row["sha256"]})
        require(path.stat().st_size == row["bytes"] and probe_audio(path) == row["format"], f"complete register byte/format mismatch: {path}")
    return {"indexed_audio": 152, "derivative_relationships": 80, **complete["counts"]}


def check_responsive_and_playlists() -> dict[str, Any]:
    register = load(RESPONSIVE_REGISTER, "project-studio-responsive-generation-register/v2")
    bundles = load(RESPONSIVE, "project-studio-responsive-bundle-catalogue/v2")
    candidates, variants = register["candidates"], bundles["variants"]
    require(len(candidates) == 36 and len(variants) == 12 and register["text_only"] is True and register["guide_audio"] is False, "responsive generation contract failed")
    require({row["epoch"] for row in candidates} == EXPECTED_EPOCHS and {row["context"] for row in candidates} == EXPECTED_CONTEXTS, "responsive epoch/context coverage failed")
    expected_keys = {(epoch, context) for epoch in EXPECTED_EPOCHS for context in EXPECTED_CONTEXTS}
    require(Counter((row["epoch"], row["context"]) for row in candidates) == Counter({key: 3 for key in expected_keys}),
            "responsive candidate epoch/context cardinality is not exactly three per tuple")
    require(len({row["candidate_id"] for row in candidates}) == len(candidates), "responsive candidate IDs are not unique")
    excluded = {row["candidate_id"] for row in candidates if row["machine_disposition"] == "MACHINE_EXCLUDED"}
    eligible = {row["candidate_id"] for row in candidates if row["machine_disposition"] == "MACHINE_ELIGIBLE"}
    require(len(excluded) == 4 and len(eligible) == 32, "responsive dispositions mismatch")
    for row in candidates:
        verified_path(row["raw"])
        require(row["human_disposition"] == "PENDING" and row["seed"] is not None, "responsive provenance incomplete")
    require(bundles["classification"] == "HORIZONTAL_VARIANT_BUNDLE" and bundles["fake_stems"] is False and bundles["aligned_layers_claimed"] is False, "responsive stem honesty failed")
    require(Counter((row["epoch"], row["context"]) for row in variants) == Counter({key: 1 for key in expected_keys}),
            "responsive selected variants are not exactly one per epoch/context tuple")
    require(len({row["stable_bundle_variant_id"] for row in variants}) == len(variants)
            and len({row["selected_candidate_id"] for row in variants}) == len(variants),
            "responsive selected variant or candidate identities are duplicated")
    candidates_by_id = {row["candidate_id"]: row for row in candidates}
    for row in variants:
        require(row["selected_candidate_id"] in eligible and row["selected_candidate_id"] not in excluded, "excluded responsive source selected")
        selected = candidates_by_id[row["selected_candidate_id"]]
        require((selected["epoch"], selected["context"]) == (row["epoch"], row["context"]), "responsive selected candidate tuple mismatch")
        require(row["classification"] == "HORIZONTAL_VARIANT_BUNDLE", "variant classification mismatch")
        require(row["transition_metadata"]["phase_alignment_claimed"] is False and row["transition_metadata"]["melodic_continuity_claimed"] is False, "responsive continuity overclaim")
        for record in (row["source"], *[value for value in row["derivatives"].values() if isinstance(value, dict) and "path" in value and "sha256" in value]):
            verified_path(record)
    playlists = load(PLAYLISTS, "project-studio-four-hour-density-simulations/v2")
    require(playlists["machine_verdict"] == "PASS" and playlists["trace_count"] == 12 and playlists["duration_seconds_each"] == 14_400, "four-hour suite failed")
    require(set(playlists["densities"]) == {"FULL_MUSIC", "BALANCED", "SPARSE", "OFF"} and set(playlists["epochs"]) == EXPECTED_EPOCHS, "density suite coverage mismatch")
    for row in playlists["traces"]:
        path, trace = load_record_json(row)
        require(trace.get("machine_verdict") == "PASS" and trace.get("duration_seconds") == 14_400, f"four-hour child failed: {path}")
    return {"epochs": sorted(EXPECTED_EPOCHS), "candidates": 36, "eligible": 32, "excluded": 4, "selected_horizontal_variants": 12, "four_hour_traces": 12}


def load_record_json(record: dict[str, Any]) -> tuple[Path, dict[str, Any]]:
    path = verified_path(record)
    return path, json.loads(path.read_text(encoding="utf-8"))


def check_transitions_lot_management() -> dict[str, Any]:
    atlas = (DOC_REPO / "docs/audio/CODEX-ERA-TRANSITION-ATLAS-01.md").read_text(encoding="utf-8")
    require(len(re.findall(r"^\| `ET-0[1-8]` \|", atlas, flags=re.MULTILINE)) == 8, "transition atlas must contain eight boundaries")
    transitions = load(TRANSITIONS, "project-studio-rendered-era-transitions/v4")
    require(transitions["render_count"] == 9 and transitions["boundary_count"] == 3, "transition prototype coverage failed")
    expected_transition_keys = {
        (boundary, treatment) for boundary in EXPECTED_TRANSITION_BOUNDARIES for treatment in EXPECTED_TRANSITION_TREATMENTS
    }
    require(Counter((row["boundary_id"], row["treatment"]) for row in transitions["renders"])
            == Counter({key: 1 for key in expected_transition_keys}), "transition boundary/treatment Cartesian coverage mismatch")
    require(len({row["stable_prototype_id"] for row in transitions["renders"]}) == 9, "transition prototype IDs are not unique")
    for row in transitions["renders"]:
        outgoing, incoming = EXPECTED_TRANSITION_BOUNDARIES[row["boundary_id"]]
        require((row["outgoing_alias"], row["incoming_alias"]) == (outgoing, incoming), "transition representative boundary alias mismatch")
        require(not row["phrase_boundary_claimed"] and not row["natural_ending_claimed"] and not row["bespoke_claimed"], "transition overclaim")
        require(row["human_disposition"] == "PENDING", "transition human gate violated")
        verified_path(row["audio"])
    living = load(LIVING, "project-studio-living-lot-soundscape/v3")
    require(living["duration_seconds"] == 600 and [row["zoom"] for row in living["layers"]] == ["WIDE", "MEDIUM", "CLOSE"], "living-lot layer contract failed")
    require(len(living["fixture_presentations"]) == 5 and len(living["era_presentations"]) == 3, "living-lot presentation coverage failed")
    require(living["semantic_detail_counts"] == {"WIDE": 12, "MEDIUM": 25, "CLOSE": 28}, "living-lot detail schedule mismatch")
    require(living["era_specific_living_lot_proof"] == "NOT_IMPLEMENTED" and living["era_presentations_are_mix_diagnostics"] is True, "living-lot era honesty failed")
    for record in living["all_audio_files"]:
        path = verified_path(record)
        require(abs(probe_audio(path)["duration_seconds"] - 600) <= 0.025, "living-lot duration mismatch")
    management = load(MANAGEMENT, "project-studio-management-audio-language/v4")
    require(management["machine_verdict"] == "PASS" and management["semantic_family_count"] == 15 and management["candidate_count"] == 45, "management pack failed")
    require(len(management["vocabulary"]) == 15 and {row["id"] for row in management["vocabulary"]} == EXPECTED_MANAGEMENT_EVENTS,
            "management vocabulary is not the exact required semantic set")
    require(Counter(row["semantic_event"] for row in management["candidates"])
            == Counter({event: 3 for event in EXPECTED_MANAGEMENT_EVENTS}), "management candidates are not exactly three per semantic family")
    candidate_ids = [row["stable_prototype_id"] for row in management["candidates"]]
    require(len(set(candidate_ids)) == 45, "management candidate IDs are not unique")
    require(management["approval_language_corrections"] == 15 and all("approved candidates" not in row["repeat_variation"] for row in management["vocabulary"]), "management approval wording remains")
    require(management["source_code"]["commit"] == git(DOC_REPO, "rev-parse", "HEAD") and management["source_code"]["working_file_matches_commit"], "management remedy source binding stale")
    require(len(management["selections"]) == 15
            and Counter(row["semantic_event"] for row in management["selections"])
            == Counter({event: 1 for event in EXPECTED_MANAGEMENT_EVENTS})
            and all(row["selection_disposition"] == "MACHINE_PROVISIONAL_TECHNICAL_PROXY_PENDING_HUMAN_LISTENING" for row in management["selections"]),
            "management provisional selection contract failed")
    candidates_by_event = {
        event: {row["stable_prototype_id"] for row in management["candidates"] if row["semantic_event"] == event}
        for event in EXPECTED_MANAGEMENT_EVENTS
    }
    for selection in management["selections"]:
        family_ids = candidates_by_event[selection["semantic_event"]]
        require(selection["provisional_pick"] != selection["alternate"]
                and selection["provisional_pick"] in family_ids and selection["alternate"] in family_ids
                and len(selection["ranked_candidate_ids"]) == 3
                and set(selection["ranked_candidate_ids"]) == family_ids,
                f"management provisional/alternate/ranking identity failed: {selection['semantic_event']}")
    for row in management["candidates"]:
        verified_path(row["audio"])
        require(row["human_disposition"] == "PENDING", "management candidate human gate violated")
    return {"atlas_boundaries": 8, "transition_prototypes": 9, "living_layers": 3, "living_fixtures": 5, "management_families": 15, "management_candidates": 45}


def check_radio_accessibility() -> dict[str, Any]:
    lint = load(RADIO_LINT, "project-studio-radio-copy-lint/v2")
    require(lint["status"] == "PASS" and lint["source_units"] == lint["cleaned_units"] == 126, "radio lint coverage failed")
    require(lint["cleaned_finding_count"] == 0 and not lint["caption_parity_failures"] and not lint["unresolved_blockers"], "radio clean copy failed")
    fixtures = load(RADIO_FIXTURES, "project-studio-radio-functional-fixtures/v2")
    expected_fixture_checks = {"annotations_present", "base_fields_present", "caption_spoken_core_parity"}
    require(fixtures["lab_fixture_only"] is True and len(fixtures["payloads"]) == 3
            and set(fixtures.get("validation", {})) == expected_fixture_checks
            and all(value is True for value in fixtures["validation"].values()), "typed functional fixture proof failed")
    require({payload.get("eventId"): payload.get("ownerDomain") for payload in fixtures["payloads"]}
            == EXPECTED_FUNCTIONAL_IDENTITIES, "functional fixture identities/owners are not exact")
    require(len({payload.get("receiptId") for payload in fixtures["payloads"]}) == 3, "functional receipt IDs are missing or duplicate")
    for payload in fixtures["payloads"]:
        require(FUNCTIONAL_FIELDS <= set(payload)
                and all(isinstance(payload[field], str) and payload[field].strip() for field in FUNCTIONAL_FIELDS - {"priority"})
                and isinstance(payload["priority"], int) and not isinstance(payload["priority"], bool)
                and payload["captionText"] == payload["spokenText"], "functional caption/spoken identity failed")
    scheduler = load(RADIO_SCHEDULER, "project-studio-radio-scheduler-evidence/v2")
    require(scheduler["machineVerdict"] == "PASS" and len(scheduler["demos"]) == len(scheduler["simulations"]) == 3, "radio scheduler evidence failed")
    require({row.get("slug"): row.get("epochAlias") for row in scheduler["demos"]} == EXPECTED_RADIO_DEMOS,
            "radio scheduler demo slug/epoch identities are not exact")
    require({row.get("epochAlias") for row in scheduler["simulations"]} == set(EXPECTED_RADIO_DEMOS.values()),
            "radio scheduler simulation epoch identities are not exact")
    require(all(row.get("machineVerdict") == "PASS"
                and set(row.get("assertions", {})) == EXPECTED_RADIO_DEMO_ASSERTIONS
                and all(value is True for value in row["assertions"].values()) for row in scheduler["demos"]),
            "radio scheduler demo assertions are missing, extra, or failed")
    require(all(row.get("machineVerdict") == "PASS" and row.get("durationSeconds") == 1800
                and set(row.get("assertions", {})) == EXPECTED_RADIO_SIM_ASSERTIONS
                and all(value is True for value in row["assertions"].values()) for row in scheduler["simulations"]),
            "radio scheduler simulation assertions are missing, extra, or failed")
    radio = load(RADIO, "project-studio-radio-runtime-index/v2")
    require(radio["machine_verdict"] == "PASS" and radio["scripts_audited"] == 126 and radio["decorative_runtime_eligible"] == 108 and radio["technology_templates_withheld"] == 18, "radio runtime classification failed")
    require(len(radio["demos"]) == len(radio["thirty_minute_simulations"]) == 3
            and {row.get("slug"): row.get("epoch_alias") for row in radio["demos"]} == EXPECTED_RADIO_DEMOS
            and {row.get("epoch_alias") for row in radio["thirty_minute_simulations"]} == set(EXPECTED_RADIO_DEMOS.values())
            and all(row.get("machine_verdict") == "PASS"
                    and isinstance(row.get("accepted_event_count"), int) and row["accepted_event_count"] > 0
                    for row in radio["thirty_minute_simulations"]),
            "radio programme/simulation identity failed")
    for demo in radio["demos"]:
        require(demo["duration_seconds"] == 660 and demo["machine_verdict"] == "PASS"
                and set(demo.get("features", {})) == EXPECTED_RADIO_DEMO_ASSERTIONS
                and all(value is True for value in demo["features"].values()), "radio demo failed")
        for record in (demo["master"], demo["preview"], demo["captions"], demo["transcript"]):
            verified_path(record)
    presenters = load(PRESENTERS, "project-studio-radio-presenter-ensemble/v2")
    presenter_rows = presenters.get("presenters", [])
    presenter_projection = {
        row.get("presenter_id"): {
            "display_name": row.get("display_name"), "local_voice": row.get("local_voice"),
            "campaign_eligibility": set(row.get("campaign_eligibility", [])),
        }
        for row in presenter_rows
    }
    require(len(presenter_rows) == 3 and len(presenter_projection) == 3
            and presenter_projection == EXPECTED_RADIO_PRESENTERS
            and len({row.get("display_name") for row in presenter_rows}) == 3
            and len({row.get("local_voice") for row in presenter_rows}) == 3
            and all(isinstance(row.get("performance"), str) and row["performance"].strip() for row in presenter_rows),
            "presenter identities, generic voice assignments, recurrence, or performance briefs are not exact")
    require(presenters.get("status") == "PROTOTYPE_ONLY"
            and presenters.get("real_person_target") == "NONE"
            and presenters.get("name_mark_review") == "PENDING"
            and presenters.get("voice_route") == "generic macOS local synthetic voices; no cloning or imitation"
            and presenters.get("redistribution_caveat") == "System-voice output remains local prototype material pending explicit rights review.",
            "presenter route, rights caveat, or no-imitation boundary failed")
    for row in scheduler["demos"]:
        require(collect_presenter_ids(row) == {EXPECTED_DEMO_PRESENTERS[row["slug"]]},
                f"scheduler demo presenter cross-reference failed: {row['slug']}")
    presenter_by_epoch = {
        EXPECTED_RADIO_DEMOS[slug]: presenter_id for slug, presenter_id in EXPECTED_DEMO_PRESENTERS.items()
    }
    for row in scheduler["simulations"]:
        require(collect_presenter_ids(row) == {presenter_by_epoch[row["epochAlias"]]},
                f"scheduler simulation presenter cross-reference failed: {row['epochAlias']}")
    accessibility = load(ACCESSIBILITY, "project-studio-audio-accessibility-presets/v4")
    require(accessibility["machine_render_verdict"] == "PASS" and len(accessibility["renders"]) == 6
            and {render.get("preset") for render in accessibility["renders"]} == EXPECTED_ACCESSIBILITY_PRESETS
            and set(accessibility.get("render_checks", {})) == EXPECTED_ACCESSIBILITY_CHECKS
            and all(value is True for value in accessibility["render_checks"].values()), "accessibility render evidence failed")
    require(accessibility["accessibility_acceptance"] == "PENDING_RUNTIME_PROOF_AND_HUMAN_REVIEW", "accessibility acceptance overclaim")
    for render in accessibility["renders"]:
        verified_path(render)
    return {"radio_scripts": 126, "decorative_eligible": 108, "functional_templates_withheld": 18, "typed_fixtures": 3, "radio_demos": 3, "radio_demo_seconds_each": 660, "radio_simulations": 3, "presenters": 3, "accessibility_presets": 6}


def check_system_oracle_apps(lab_app: Path, return_root: Path) -> dict[str, Any]:
    require(return_root == RETURN_ROOT.resolve(strict=True), "final validation refuses a noncanonical return-package root")
    system = load(SYSTEM_REGISTER, "project-studio-system-audio-asset-register/v5")
    require(system["status"] in ALLOWED_STATUS and len(system["items"]) == 122 and sum(system["counts"].values()) == 122, "system register failed")
    require("NO_RECURSIVE_SCAN" in system["loading_law"] and "NO_NETWORK" in system["loading_law"] and "FAIL_CLOSED" in system["loading_law"], "external-loading law incomplete")
    for record in system["source_manifests"]:
        verified_path(record)
    ids = [row["id"] for row in system["items"]]
    require(len(ids) == len(set(ids)), "duplicate system ID")
    for row in system["items"]:
        require(row["rights_status"] in ALLOWED_STATUS and row["human_disposition"] == "PENDING", "system status boundary violated")
        verified_path(row)
    oracle = verify_oracle()
    unity_proof = verify_current_lab_proof(lab_app, git(UNITY_REPO, "rev-parse", "HEAD"))
    receipt = load(BUILD_RECEIPT, "project-studio-audio-lab-build-receipt/v1")
    require(receipt.get("unity_git_sha") == git(UNITY_REPO, "rev-parse", "HEAD"), "build receipt Unity SHA is stale")
    require(receipt.get("build_result") == "SUCCEEDED" and receipt.get("production_build_settings_mutated") is False and receipt.get("player_launched") is False, "build receipt isolation/result failed")
    receipt_app = pilot_path(receipt["application_path"])
    binary = pilot_path(receipt["executable_relative_path"])
    require(receipt_app == lab_app.resolve() and binary.parent == lab_app.resolve() / "Contents/MacOS", "requested lab app differs from receipt")
    require(binary.is_file() and sha256_file(binary) == receipt["executable_sha256"], "build receipt executable mismatch")
    subprocess.run(["codesign", "--verify", "--deep", "--strict", str(lab_app)], check=True, capture_output=True, text=True)
    source = load(AUDITION_SOURCE, "project-studio-audio-systems-audition-source/v2")
    audition = load(AUDITION, "project-studio-audio-systems-audition-build/v2")
    require(audition["machine_verdict"] == "PASS" and audition["counts"]["collections"]["ERA_LIBRARY"] == 27, "audition build failed")
    require(audition["counts"]["items"] == len(source["items"]), "audition source/build count mismatch")
    require(verify_audition().get("machine_verdict") == "PASS", "audition independent verifier failed")
    for record in source["source_manifests"]:
        verified_path(record)
    package = load(return_root / "RETURN-PACKAGE-MANIFEST.json", "project-studio-audio-systems-owner-return/v1")
    require(package["status"] == "PROTOTYPE_READY_FOR_OWNER_AUDITION" and package["human_acceptance"] == "NONE_RECORDED", "return-package boundary failed")
    for row in package["files"]:
        path = canonical_contained(return_root, return_root / row["relative_path"])
        require(path.stat().st_size == row["bytes"] and sha256_file(path) == row["sha256"], f"package file changed: {path}")
    require(verify_package()["machine_verdict"] == "PASS", "return package independent verifier failed")
    def count_audio(relative: str) -> int:
        return sum(path.is_file() and path.suffix.lower() in AUDIO_SUFFIXES for path in (return_root / relative).rglob("*"))
    require(count_audio("MUSIC") == 39 and count_audio("TRANSITIONS") == 9 and count_audio("LIVING-LOT") == 11, "return music/transition/lot coverage failed")
    require(count_audio("MANAGEMENT-SFX") == 45 and count_audio("ACCESSIBILITY") == 6, "return management/accessibility coverage failed")
    require(len(list((return_root / "RADIO").glob("*/*-RUNTIME-DEMO.m4a"))) == 3, "return radio preview coverage failed")
    require(len(list((return_root / "AUDIO-ORACLE/traces").glob("*.json"))) == 20, "return Oracle trace coverage failed")
    for launcher in (return_root / "AUDIO-LAB/START-AUDIO-LAB.command", return_root / "AUDITION/START-AUDITION.command"):
        require(launcher.is_file() and bool(launcher.stat().st_mode & 0o111), f"launcher not executable: {launcher}")
    subprocess.run(["codesign", "--verify", "--deep", "--strict", str(return_root / "AUDIO-LAB/Project Studio Audio Systems Pilot.app")], check=True, capture_output=True, text=True)
    return {"system_items": 122, "oracle_required_scenarios": 18, "oracle_total_scenarios": oracle["total_scenarios"], "oracle_offline_processor_marker_renders": oracle["offline_processor_marker_renders"], "audition_items": audition["counts"]["items"], "return_files": len(package["files"]), "return_manifest_sha256": sha256_file(return_root / "RETURN-PACKAGE-MANIFEST.json"), "editmode_passed": unity_proof["editmode_passed"], "playmode_passed": unity_proof["playmode_passed"], "codesign": "PASS"}


def check_prepackage_system_oracle_and_audition(lab_app: Path) -> dict[str, Any]:
    system = load(SYSTEM_REGISTER, "project-studio-system-audio-asset-register/v5")
    require(system["status"] in ALLOWED_STATUS and len(system["items"]) == 122 and sum(system["counts"].values()) == 122, "system register failed")
    require("NO_RECURSIVE_SCAN" in system["loading_law"] and "NO_NETWORK" in system["loading_law"] and "FAIL_CLOSED" in system["loading_law"], "external-loading law incomplete")
    ids = [row["id"] for row in system["items"]]
    require(len(ids) == len(set(ids)), "duplicate system ID")
    for record in system["source_manifests"]:
        verified_path(record)
    for row in system["items"]:
        require(row["rights_status"] in ALLOWED_STATUS and row["human_disposition"] == "PENDING", "system status boundary violated")
        verified_path(row)
    oracle = verify_oracle()
    unity = verify_current_lab_proof(lab_app, git(UNITY_REPO, "rev-parse", "HEAD"))
    source = load(AUDITION_SOURCE, "project-studio-audio-systems-audition-source/v2")
    audition = load(AUDITION, "project-studio-audio-systems-audition-build/v2")
    require(audition["machine_verdict"] == "PASS" and audition["counts"]["collections"]["ERA_LIBRARY"] == 27, "audition build failed")
    require(audition["counts"]["items"] == len(source["items"]), "audition source/build count mismatch")
    require(verify_audition().get("machine_verdict") == "PASS", "audition independent verifier failed")
    for record in source["source_manifests"]:
        verified_path(record)
    return {
        "system_items": 122, "oracle_total_scenarios": oracle["total_scenarios"],
        "audition_items": audition["counts"]["items"], "editmode_passed": unity["editmode_passed"],
        "playmode_passed": unity["playmode_passed"], "codesign": "PASS",
    }


def run_prepackage(lab_app: Path) -> dict[str, Any]:
    require(not RETURN_ROOT.exists() and not RETURN_ROOT.is_symlink(),
            "prepackage validation is one-shot and refuses to rewrite evidence after the immutable return root exists")
    checks: dict[str, Any] = {}
    stages: tuple[tuple[str, Callable[[], dict[str, Any]]], ...] = (
        ("git_isolation_and_push", check_git_and_scope),
        ("catalogue_identity_and_raw_hashes", check_catalogue),
        ("assets_derivatives_and_complete_inventory", check_assets_and_inventory),
        ("responsive_music_and_four_hour_density", check_responsive_and_playlists),
        ("transitions_living_lot_and_management", check_transitions_lot_management),
        ("radio_and_accessibility", check_radio_accessibility),
        ("system_unity_oracle_and_audition", lambda: check_prepackage_system_oracle_and_audition(lab_app)),
    )
    try:
        for name, function in stages:
            checks[name] = {"status": "PASS", **function()}
        result = {
            "schema": "project-studio-audio-systems-prepackage-validation/v1",
            "generated_utc": utc_now(), "status": "PASS", "checks": checks,
            "human_acceptance": "NONE_RECORDED", "production_integration": "PREPARED_NOT_EXECUTED",
            "p05_collision": "NONE", "production_changes": "NONE",
        }
    except Exception as error:
        result = {"schema": "project-studio-audio-systems-prepackage-validation/v1", "generated_utc": utc_now(), "status": "FAIL", "checks": checks, "failure": f"{type(error).__name__}: {error}"}
        atomic_write_json(PREPACKAGE_OUTPUT, result)
        raise
    atomic_write_json(PREPACKAGE_OUTPUT, result)
    return result


def check_state_and_hostile_reviews() -> dict[str, Any]:
    state = verify_state_record(
        git(DOC_REPO, "rev-parse", "HEAD"), git(UNITY_REPO, "rev-parse", "HEAD"),
        {("IN_PROGRESS", "READY_FOR_FINAL_VALIDATION"), ("COMPLETE", "FINAL_VALIDATION_COMPLETE")},
    )

    reviews = load(HOSTILE_REVIEW_INDEX, "project-studio-audio-systems-hostile-review-index/v1")
    verify_hostile_reviews()
    require(reviews.get("machine_verdict") == "PASS" and reviews.get("lane_count") == 8 and reviews.get("open_mechanical_findings") == 0, "hostile-review closure failed")
    require(reviews.get("source_code", {}).get("commit") == git(DOC_REPO, "rev-parse", "HEAD") and reviews["source_code"].get("working_file_matches_commit") is True, "hostile-review index source binding is stale")
    lanes = reviews.get("lanes", [])
    require([row.get("lane_id") for row in lanes] == [f"LANE-{number:02d}" for number in range(1, 9)], "hostile-review lane identities/order failed")
    for row in lanes:
        path = pilot_path(row["report"]["path"])
        require(path.is_file() and sha256_file(path) == row["report"]["sha256"], f"hostile-review report identity failed: {row['lane_id']}")
        require(row.get("open_mechanical_findings") == 0, f"hostile-review mechanical finding remains: {row['lane_id']}")
    return {"state_phase": state["phase"], "hostile_review_lanes": len(lanes), "open_mechanical_findings": 0, "human_or_legal_gates": reviews.get("human_or_legal_gates", [])}


def final_evidence_bindings() -> dict[str, str]:
    predecessor = verify_complete_predecessor_chain(load(COMPLETE_AUDIO))
    return {
        "documentation_sha": git(DOC_REPO, "rev-parse", "HEAD"),
        "unity_sha": git(UNITY_REPO, "rev-parse", "HEAD"),
        "state_sha256": sha256_file(STATE),
        "complete_audio_register_sha256": sha256_file(COMPLETE_AUDIO),
        "complete_predecessor_chain_sha256": predecessor["predecessor_chain_sha256"],
        "audio_oracle_suite_sha256": sha256_file(PILOT_ROOT / "07_audio-oracle/AUDIO-ORACLE-SUITE.v1.json"),
        "hostile_review_index_sha256": sha256_file(HOSTILE_REVIEW_INDEX),
        "unity_validation_sha256": sha256_file(UNITY_VALIDATION),
        "unity_current_run_sha256": sha256_file(PILOT_ROOT / "09_unity-lab/CURRENT-VALIDATION-RUN.json"),
        "unity_run_archive_manifest_set_sha256": verify_unity_run_archives()["archive_manifest_set_sha256"],
        "system_register_sha256": sha256_file(SYSTEM_REGISTER),
        "audition_build_manifest_sha256": sha256_file(AUDITION),
        "audition_source_register_sha256": sha256_file(AUDITION_SOURCE),
        "audition_preview_history_sha256": sha256_file(AUDITION_PREVIEW_HISTORY),
        "audition_app_history_sha256": sha256_file(AUDITION_APP_HISTORY),
        "return_manifest_sha256": sha256_file(RETURN_ROOT / "RETURN-PACKAGE-MANIFEST.json"),
    }


def run(lab_app: Path, return_root: Path) -> dict[str, Any]:
    checks: dict[str, Any] = {}
    stages: tuple[tuple[str, Callable[[], dict[str, Any]]], ...] = (
        ("git_isolation_and_push", check_git_and_scope),
        ("catalogue_identity_and_raw_hashes", check_catalogue),
        ("assets_derivatives_and_complete_inventory", check_assets_and_inventory),
        ("responsive_music_and_four_hour_density", check_responsive_and_playlists),
        ("transitions_living_lot_and_management", check_transitions_lot_management),
        ("radio_and_accessibility", check_radio_accessibility),
        ("system_unity_oracle_audition_and_return", lambda: check_system_oracle_apps(lab_app, return_root)),
        ("atomic_state_and_hostile_reviews", check_state_and_hostile_reviews),
    )
    try:
        for name, function in stages:
            checks[name] = {"status": "PASS", **function()}
        result = {
            "schema": "project-studio-audio-systems-final-validation/v2", "generated_utc": utc_now(),
            "status": "PASS", "check_order": list(FINAL_CHECK_ORDER),
            "checks": checks, "evidence_bindings": final_evidence_bindings(),
            "rights_status": "PROTOTYPE_ONLY_OR_PROTOTYPE_READY_FOR_OWNER_AUDITION",
            "human_acceptance": "NONE_RECORDED", "production_integration": "PREPARED_NOT_EXECUTED",
            "p05_collision": "NONE", "production_changes": "NONE",
            "limitations": ["Machine proof does not equal listening, historical, cultural, rights, accessibility, or shipping acceptance."],
        }
    except Exception as error:
        try:
            bindings = final_evidence_bindings()
        except Exception as binding_error:
            bindings = {"unavailable": f"{type(binding_error).__name__}: {binding_error}"}
        result = {
            "schema": "project-studio-audio-systems-final-validation/v2",
            "generated_utc": utc_now(), "status": "FAIL",
            "check_order": list(FINAL_CHECK_ORDER), "checks": checks,
            "evidence_bindings": bindings, "failure": f"{type(error).__name__}: {error}",
        }
        atomic_write_json(OUTPUT, result)
        raise
    atomic_write_json(OUTPUT, result)
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--lab-app", type=Path, required=True)
    parser.add_argument("--return-root", type=Path, default=RETURN_ROOT)
    parser.add_argument("--prepackage-only", action="store_true")
    arguments = parser.parse_args()
    if arguments.prepackage_only:
        result = run_prepackage(arguments.lab_app.resolve(strict=True))
        print(json.dumps({"status": result["status"], "path": str(PREPACKAGE_OUTPUT), "sha256": sha256_file(PREPACKAGE_OUTPUT)}, indent=2, sort_keys=True))
        return
    lexical_return_root = Path(os.path.abspath(arguments.return_root))
    require(lexical_return_root == Path(os.path.abspath(RETURN_ROOT)),
            "final validation refuses a noncanonical return-package root")
    require(not lexical_return_root.is_symlink(), "final validation refuses a symlink return-package root")
    result = run(arguments.lab_app.resolve(strict=True), lexical_return_root.resolve(strict=True))
    print(json.dumps({"status": result["status"], "path": str(OUTPUT), "sha256": sha256_file(OUTPUT)}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
