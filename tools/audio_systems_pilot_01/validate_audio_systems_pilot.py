#!/usr/bin/env python3
"""Run the fail-closed final reconciliation for Audio Systems Pilot 01."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path
from typing import Any, Callable

from build_audio_oracle import verify as verify_oracle
from common import DOC_REPO, PILOT_ROOT, atomic_write_json, canonical_contained, probe_audio, sha256_file, utc_now


DOC_BASE = "c457c3a35a66b2ab4b72b0ca379f118b2f1fa1bf"
UNITY_BASE = "29aea89a706a7f0961f5a460afc5bdb4d38d8395"
UNITY_REPO = Path("/Users/bruce/Project Studio - Audio Systems Pilot 01 Client")
RETURN_ROOT = Path("/Users/bruce/Desktop/Project-Studio-Audio-Systems-Pilot-01")
OUTPUT = PILOT_ROOT / "10_provenance/FINAL-VALIDATION.v2.json"

CATALOGUE_BASE = PILOT_ROOT / "01_catalogue/AudioPrototypeCatalogue.v1.json"
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

ALLOWED_STATUS = {"PROTOTYPE_ONLY", "PROTOTYPE_READY_FOR_OWNER_AUDITION"}
AUDIO_SUFFIXES = {".wav", ".m4a", ".mp3", ".aac", ".flac", ".ogg", ".aif", ".aiff"}
EXPECTED_EPOCHS = {
    "acoustic_electrical_1920_1932", "format_plurality_1975_1986", "streaming_plural_2015_2029"
}
EXPECTED_CONTEXTS = {"NORMAL", "ACTIVE", "BLOCKED", "WORKSPACE"}
FUNCTIONAL_FIELDS = {
    "ownerDomain", "eventId", "receiptId", "headline", "body", "priority", "expiresAt", "captionText", "spokenText"
}
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
    require(not any(Path(row).suffix.lower() in AUDIO_SUFFIXES for row in (*doc_paths, *unity_paths)), "audio binary committed")
    require(not any(any(token in row.lower() for token in ("studiolot", "bridge", "dto", "campaign/living-lot")) for row in unity_paths), "P05/production collision path touched")
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
        "p05_collision": "NONE", "production_changes": "NONE", "audio_binaries_committed": 0,
    }


def machine_excluded(entry: dict[str, Any]) -> bool:
    disposition = entry.get("machine_disposition", {})
    return (
        disposition.get("disposition") in {"MACHINE_EXCLUDED", "MACHINE-EXCLUDED", "EXCLUDE"}
        or disposition.get("screening_status") in {"MACHINE_EXCLUDED", "MACHINE-EXCLUDED", "EXCLUDE"}
    )


def check_catalogue() -> dict[str, Any]:
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
    return {"entries": 203, "raw_hashes_reverified": 203, "primary_picks": 27, "motif_no-randomness_dispositions": 12}


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
    require(complete["machine_verdict"] == "PASS" and all(complete["checks"].values()), "complete audio register failed")
    require(complete["source_code"]["artifact_generation_commit"] == git(DOC_REPO, "rev-parse", "HEAD"), "complete register builder binding stale")
    records = complete["files"]
    registered_paths = {row["relative_path"] for row in records}
    actual_paths = {
        str(path.resolve().relative_to(PILOT_ROOT))
        for root_name in complete["inventory_scope"]["bounded_media_roots"]
        for path in (PILOT_ROOT / root_name).rglob("*")
        if path.is_file() and path.suffix.lower() in AUDIO_SUFFIXES
    }
    require(registered_paths == actual_paths, "complete audio register does not match current bounded filesystem")
    require(len({row["file_id"] for row in records}) == len(records), "complete file IDs are not unique")
    for row in records:
        require(row["rights_status"] == "PROTOTYPE_ONLY" and row["human_disposition"] == "PENDING", "complete register status boundary violated")
        verified_path({"path": str(PILOT_ROOT / row["relative_path"]), "sha256": row["sha256"]})
    return {"indexed_audio": 152, "derivative_relationships": 80, **complete["counts"]}


def check_responsive_and_playlists() -> dict[str, Any]:
    register = load(RESPONSIVE_REGISTER, "project-studio-responsive-generation-register/v2")
    bundles = load(RESPONSIVE, "project-studio-responsive-bundle-catalogue/v2")
    candidates, variants = register["candidates"], bundles["variants"]
    require(len(candidates) == 36 and len(variants) == 12 and register["text_only"] is True and register["guide_audio"] is False, "responsive generation contract failed")
    require({row["epoch"] for row in candidates} == EXPECTED_EPOCHS and {row["context"] for row in candidates} == EXPECTED_CONTEXTS, "responsive epoch/context coverage failed")
    excluded = {row["candidate_id"] for row in candidates if row["machine_disposition"] == "MACHINE_EXCLUDED"}
    eligible = {row["candidate_id"] for row in candidates if row["machine_disposition"] == "MACHINE_ELIGIBLE"}
    require(len(excluded) == 4 and len(eligible) == 32, "responsive dispositions mismatch")
    for row in candidates:
        verified_path(row["raw"])
        require(row["human_disposition"] == "PENDING" and row["seed"] is not None, "responsive provenance incomplete")
    require(bundles["classification"] == "HORIZONTAL_VARIANT_BUNDLE" and bundles["fake_stems"] is False and bundles["aligned_layers_claimed"] is False, "responsive stem honesty failed")
    for row in variants:
        require(row["selected_candidate_id"] in eligible and row["selected_candidate_id"] not in excluded, "excluded responsive source selected")
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
    require({row["treatment"] for row in transitions["renders"]} == {"FINAL-WINDOW-AMBIENCE-BRIDGE", "SAFE-UNVERIFIED-WINDOW-CROSSFADE", "GENERIC-DERIVED-EXIT-ENTRY"}, "transition treatments mismatch")
    for row in transitions["renders"]:
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
    require(management["approval_language_corrections"] == 15 and all("approved candidates" not in row["repeat_variation"] for row in management["vocabulary"]), "management approval wording remains")
    require(len(management["selections"]) == 15 and all(row["selection_disposition"] == "MACHINE_PROVISIONAL_TECHNICAL_PROXY_PENDING_HUMAN_LISTENING" for row in management["selections"]), "management provisional selection contract failed")
    for row in management["candidates"]:
        verified_path(row["audio"])
        require(row["human_disposition"] == "PENDING", "management candidate human gate violated")
    return {"atlas_boundaries": 8, "transition_prototypes": 9, "living_layers": 3, "living_fixtures": 5, "management_families": 15, "management_candidates": 45}


def check_radio_accessibility() -> dict[str, Any]:
    lint = load(RADIO_LINT, "project-studio-radio-copy-lint/v2")
    require(lint["status"] == "PASS" and lint["source_units"] == lint["cleaned_units"] == 126, "radio lint coverage failed")
    require(lint["cleaned_finding_count"] == 0 and not lint["caption_parity_failures"] and not lint["unresolved_blockers"], "radio clean copy failed")
    fixtures = load(RADIO_FIXTURES, "project-studio-radio-functional-fixtures/v2")
    require(fixtures["lab_fixture_only"] is True and len(fixtures["payloads"]) == 3 and all(fixtures["validation"].values()), "typed functional fixture proof failed")
    for payload in fixtures["payloads"]:
        require(FUNCTIONAL_FIELDS <= set(payload) and payload["captionText"] == payload["spokenText"], "functional caption/spoken identity failed")
    scheduler = load(RADIO_SCHEDULER, "project-studio-radio-scheduler-evidence/v2")
    require(scheduler["machineVerdict"] == "PASS" and len(scheduler["demos"]) == len(scheduler["simulations"]) == 3, "radio scheduler evidence failed")
    require(all(row["machineVerdict"] == "PASS" and all(row["assertions"].values()) for row in (*scheduler["demos"], *scheduler["simulations"])), "radio scheduler assertion failed")
    radio = load(RADIO, "project-studio-radio-runtime-index/v2")
    require(radio["machine_verdict"] == "PASS" and radio["scripts_audited"] == 126 and radio["decorative_runtime_eligible"] == 108 and radio["technology_templates_withheld"] == 18, "radio runtime classification failed")
    require(len(radio["demos"]) == len(radio["thirty_minute_simulations"]) == 3, "radio programme/simulation count failed")
    for demo in radio["demos"]:
        require(demo["duration_seconds"] == 660 and demo["machine_verdict"] == "PASS" and all(demo["features"].values()), "radio demo failed")
        for record in (demo["master"], demo["preview"], demo["captions"], demo["transcript"]):
            verified_path(record)
    presenters = load(PRESENTERS, "project-studio-radio-presenter-ensemble/v2")
    require(len(presenters["presenters"]) == 3 and presenters["real_person_target"] == "NONE" and presenters["name_mark_review"] == "PENDING", "presenter boundary failed")
    accessibility = load(ACCESSIBILITY, "project-studio-audio-accessibility-presets/v4")
    require(accessibility["machine_render_verdict"] == "PASS" and len(accessibility["renders"]) == 6 and all(accessibility["render_checks"].values()), "accessibility render evidence failed")
    require(accessibility["accessibility_acceptance"] == "PENDING_RUNTIME_PROOF_AND_HUMAN_REVIEW", "accessibility acceptance overclaim")
    for render in accessibility["renders"]:
        verified_path(render)
    return {"radio_scripts": 126, "decorative_eligible": 108, "functional_templates_withheld": 18, "typed_fixtures": 3, "radio_demos": 3, "radio_demo_seconds_each": 660, "radio_simulations": 3, "presenters": 3, "accessibility_presets": 6}


def check_system_oracle_apps(lab_app: Path, return_root: Path) -> dict[str, Any]:
    system = load(SYSTEM_REGISTER, "project-studio-system-audio-asset-register/v5")
    require(system["status"] in ALLOWED_STATUS and len(system["items"]) == 122 and sum(system["counts"].values()) == 122, "system register failed")
    require("NO_RECURSIVE_SCAN" in system["loading_law"] and "NO_NETWORK" in system["loading_law"] and "FAIL_CLOSED" in system["loading_law"], "external-loading law incomplete")
    ids = [row["id"] for row in system["items"]]
    require(len(ids) == len(set(ids)), "duplicate system ID")
    for row in system["items"]:
        require(row["rights_status"] in ALLOWED_STATUS and row["human_disposition"] == "PENDING", "system status boundary violated")
        verified_path(row)
    oracle = verify_oracle()
    unity = load(UNITY_VALIDATION, "project-studio-unity-audio-lab-validation/v1")
    require(unity.get("machine_verdict") == "PASS", "Unity validation failed")
    receipt = load(BUILD_RECEIPT, "project-studio-audio-lab-build-receipt/v1")
    binary = canonical_contained(PILOT_ROOT, Path(receipt["executable"]["path"]))
    require(binary.is_file() and sha256_file(binary) == receipt["executable"]["sha256"], "build receipt executable mismatch")
    require(binary.resolve() in [path.resolve() for path in (lab_app / "Contents/MacOS").iterdir() if path.is_file()], "requested lab app differs from receipt")
    subprocess.run(["codesign", "--verify", "--deep", "--strict", str(lab_app)], check=True, capture_output=True, text=True)
    source = load(AUDITION_SOURCE, "project-studio-audio-systems-audition-source/v2")
    audition = load(AUDITION, "project-studio-audio-systems-audition-build/v2")
    require(audition["machine_verdict"] == "PASS" and audition["counts"]["collections"]["ERA_LIBRARY"] == 27, "audition build failed")
    require(audition["counts"]["items"] == len(source["items"]), "audition source/build count mismatch")
    package = load(return_root / "RETURN-PACKAGE-MANIFEST.json", "project-studio-audio-systems-owner-return/v1")
    require(package["status"] == "PROTOTYPE_READY_FOR_OWNER_AUDITION" and package["human_acceptance"] == "NONE_RECORDED", "return-package boundary failed")
    for row in package["files"]:
        path = canonical_contained(return_root, return_root / row["relative_path"])
        require(path.stat().st_size == row["bytes"] and sha256_file(path) == row["sha256"], f"package file changed: {path}")
    def count_audio(relative: str) -> int:
        return sum(path.is_file() and path.suffix.lower() in AUDIO_SUFFIXES for path in (return_root / relative).rglob("*"))
    require(count_audio("MUSIC") == 39 and count_audio("TRANSITIONS") == 9 and count_audio("LIVING-LOT") == 11, "return music/transition/lot coverage failed")
    require(count_audio("MANAGEMENT-SFX") == 45 and count_audio("ACCESSIBILITY") == 6, "return management/accessibility coverage failed")
    require(len(list((return_root / "RADIO").glob("*/*-RUNTIME-DEMO.m4a"))) == 3, "return radio preview coverage failed")
    require(len(list((return_root / "AUDIO-ORACLE/traces").glob("*.json"))) >= 18, "return Oracle trace coverage failed")
    for launcher in (return_root / "AUDIO-LAB/START-AUDIO-LAB.command", return_root / "AUDITION/START-AUDITION.command"):
        require(launcher.is_file() and bool(launcher.stat().st_mode & 0o111), f"launcher not executable: {launcher}")
    subprocess.run(["codesign", "--verify", "--deep", "--strict", str(return_root / "AUDIO-LAB/Project Studio Audio Systems Pilot.app")], check=True, capture_output=True, text=True)
    return {"system_items": 122, "oracle_required_scenarios": 18, "oracle_total_scenarios": oracle["total_scenarios"], "oracle_runtime_pcm_captures": oracle["runtime_pcm_captures"], "audition_items": audition["counts"]["items"], "return_files": len(package["files"]), "codesign": "PASS"}


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
    )
    try:
        for name, function in stages:
            checks[name] = {"status": "PASS", **function()}
        result = {
            "schema": "project-studio-audio-systems-final-validation/v2", "generated_utc": utc_now(),
            "status": "PASS", "checks": checks,
            "rights_status": "PROTOTYPE_ONLY_OR_PROTOTYPE_READY_FOR_OWNER_AUDITION",
            "human_acceptance": "NONE_RECORDED", "production_integration": "PREPARED_NOT_EXECUTED",
            "p05_collision": "NONE", "production_changes": "NONE",
            "limitations": ["Machine proof does not equal listening, historical, cultural, rights, accessibility, or shipping acceptance."],
        }
    except Exception as error:
        result = {"schema": "project-studio-audio-systems-final-validation/v2", "generated_utc": utc_now(), "status": "FAIL", "checks": checks, "failure": f"{type(error).__name__}: {error}"}
        atomic_write_json(OUTPUT, result)
        raise
    atomic_write_json(OUTPUT, result)
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--lab-app", type=Path, required=True)
    parser.add_argument("--return-root", type=Path, default=RETURN_ROOT)
    arguments = parser.parse_args()
    result = run(arguments.lab_app.resolve(strict=True), arguments.return_root.resolve(strict=True))
    print(json.dumps({"status": result["status"], "path": str(OUTPUT), "sha256": sha256_file(OUTPUT)}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
