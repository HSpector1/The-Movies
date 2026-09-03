#!/usr/bin/env python3
"""Run the fail-closed final reconciliation for Audio Systems Pilot 01."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path
from typing import Any, Callable

from common import DOC_REPO, PILOT_ROOT, atomic_write_json, canonical_contained, probe_audio, sha256_file, utc_now


DOC_BASE = "c457c3a35a66b2ab4b72b0ca379f118b2f1fa1bf"
UNITY_BASE = "29aea89a706a7f0961f5a460afc5bdb4d38d8395"
UNITY_REPO = Path("/Users/bruce/Project Studio - Audio Systems Pilot 01 Client")
RETURN_ROOT = Path("/Users/bruce/Desktop/Project-Studio-Audio-Systems-Pilot-01")
OUTPUT = PILOT_ROOT / "10_provenance/FINAL-VALIDATION.json"
CATALOGUE = PILOT_ROOT / "01_catalogue/AudioPrototypeCatalogue.v1.json"
RESPONSIVE = PILOT_ROOT / "02_music-bundles/responsive/responsive-bundle-catalogue.json"
RESPONSIVE_REGISTER = PILOT_ROOT / "02_music-bundles/responsive/responsive-generation-register.json"
TRANSITIONS = PILOT_ROOT / "03_transitions/rendered-transition-catalogue.v3.json"
LIVING = PILOT_ROOT / "04_living-lot/living-lot-soundscape-catalogue.v2.json"
MANAGEMENT = PILOT_ROOT / "05_management-sfx/semantic-pack/management-semantic-catalogue.v3.json"
RADIO = PILOT_ROOT / "06_radio/STUDIO-RADIO-RUNTIME-INDEX.json"
RADIO_LINT = PILOT_ROOT / "06_radio/script-bank/RADIO-COPY-LINT.json"
SYSTEM_REGISTER = PILOT_ROOT / "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v3.json"
ASSET_INDEX = PILOT_ROOT / "10_provenance/audio-assets-index.v3.json"
ASSET_VALIDATION = PILOT_ROOT / "10_provenance/audio-assets-validation.v3.json"
DERIVATIVES = PILOT_ROOT / "10_provenance/audio-derivative-source-register.v3.json"
ACCESSIBILITY = PILOT_ROOT / "07_audio-oracle/accessibility-renders-v3/ACCESSIBILITY-PRESETS.v3.json"
ORACLE = PILOT_ROOT / "07_audio-oracle/AUDIO-ORACLE-INDEX.json"
AUDITION = PILOT_ROOT / "08_audition-app/AUDITION-BUILD-MANIFEST.json"
UNITY_VALIDATION = PILOT_ROOT / "09_unity-lab/UNITY-AUDIO-LAB-VALIDATION.json"
ALLOWED_STATUS = {"PROTOTYPE_ONLY", "PROTOTYPE_READY_FOR_OWNER_AUDITION"}
FORBIDDEN_AUDIO_SUFFIXES = {".wav", ".m4a", ".mp3", ".aac", ".flac", ".ogg"}
FUNCTIONAL_FIELDS = {
    "ownerDomain", "eventId", "receiptId", "headline", "body", "priority", "expiresAt",
    "captionText", "spokenText",
}


def git(repo: Path, *arguments: str) -> str:
    return subprocess.run(
        ["git", *arguments], cwd=repo, check=True, capture_output=True, text=True
    ).stdout.strip()


def load(path: Path, schema: str | None = None) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if schema is not None and payload.get("schema") != schema:
        raise RuntimeError(f"schema mismatch for {path}: {payload.get('schema')}")
    return payload


def verify_record(record: dict[str, Any], *, root: Path | None = PILOT_ROOT) -> Path:
    path = Path(record["path"])
    if root is not None:
        path = canonical_contained(root, path)
    if sha256_file(path) != record["sha256"]:
        raise RuntimeError(f"hash mismatch: {path}")
    return path


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def check_git() -> dict[str, Any]:
    doc_branch = git(DOC_REPO, "branch", "--show-current")
    unity_branch = git(UNITY_REPO, "branch", "--show-current")
    require(doc_branch == "codex/audio-systems-pilot-01", f"wrong documentation branch: {doc_branch}")
    require(unity_branch == "wip/audio-systems-pilot-01-client", f"wrong Unity branch: {unity_branch}")
    subprocess.run(["git", "merge-base", "--is-ancestor", DOC_BASE, "HEAD"], cwd=DOC_REPO, check=True)
    subprocess.run(["git", "merge-base", "--is-ancestor", UNITY_BASE, "HEAD"], cwd=UNITY_REPO, check=True)
    doc_paths = [row for row in git(DOC_REPO, "diff", "--name-only", f"{DOC_BASE}..HEAD").splitlines() if row]
    unity_paths = [row for row in git(UNITY_REPO, "diff", "--name-only", f"{UNITY_BASE}..HEAD").splitlines() if row]
    require(all(row.startswith(("docs/audio/", "tools/audio_systems_pilot_01/")) for row in doc_paths), "documentation branch escaped owned paths")
    require(all(row.startswith("Assets/ProjectStudioAudioLab/") or row == "Assets/ProjectStudioAudioLab.meta" for row in unity_paths), "Unity branch escaped additive root")
    require(not any(Path(row).suffix.lower() in FORBIDDEN_AUDIO_SUFFIXES for row in [*doc_paths, *unity_paths]), "audio binary is committed")
    require(git(DOC_REPO, "status", "--porcelain") == "", "documentation worktree is not clean")
    require(git(UNITY_REPO, "status", "--porcelain") == "", "Unity worktree is not clean")
    return {
        "documentation_branch": doc_branch,
        "documentation_sha": git(DOC_REPO, "rev-parse", "HEAD"),
        "documentation_changed_paths": len(doc_paths),
        "unity_branch": unity_branch,
        "unity_sha": git(UNITY_REPO, "rev-parse", "HEAD"),
        "unity_changed_paths": len(unity_paths),
        "p05_paths_touched": False,
        "production_paths_touched": False,
        "audio_binaries_committed": False,
    }


def check_catalogue() -> dict[str, Any]:
    payload = load(CATALOGUE, "project-studio-audio-prototype-catalogue/v1")
    entries = payload["entries"]
    require(len(entries) == 203, "canonical catalogue cardinality changed")
    raw_hashes: set[str] = set()
    primary_count = 0
    for entry in entries:
        require(entry["human_disposition"] == "PENDING", f"human disposition changed: {entry['stable_prototype_id']}")
        require(entry["rights_status"] == "PROTOTYPE_ONLY", f"rights status changed: {entry['stable_prototype_id']}")
        raw = entry["raw"]
        path = Path(raw["absolute_authoritative_path"])
        require(path.is_file() and sha256_file(path) == raw["sha256"], f"raw source changed: {path}")
        raw_hashes.add(raw["sha256"])
        for derivative in entry.get("derivatives", []):
            if derivative.get("selection_role") != "PRIMARY":
                continue
            primary_count += derivative.get("derivative_type") == "aac_preview"
            require(entry["machine_disposition"].get("disposition") != "MACHINE-EXCLUDED", f"excluded source became primary: {entry['source_candidate_id']}")
    require(primary_count == 27, f"expected 27 primary previews, got {primary_count}")
    return {"entries": len(entries), "raw_hashes_reverified": len(raw_hashes), "primary_picks": primary_count}


def check_assets() -> dict[str, Any]:
    validation = load(ASSET_VALIDATION, "project-studio-audio-assets-validation/v3")
    require(validation.get("status") == "PASS" and all(validation["checks"].values()), "v3 asset validation failed")
    index = load(ASSET_INDEX, "project-studio-audio-assets-index/v3")
    assets = index["audio_assets"]
    require(index["audio_asset_count"] == 152 == len(assets), "v3 asset-index cardinality mismatch")
    ids = [row["stable_prototype_id"] for row in assets]
    paths = [row["relative_path"] for row in assets]
    require(len(ids) == len(set(ids)) and len(paths) == len(set(paths)), "duplicate indexed ID/path")
    for row in assets:
        require(row["rights_status"] in ALLOWED_STATUS and row["human_disposition"] == "PENDING", f"invalid indexed disposition: {row['stable_prototype_id']}")
        verify_record({"path": str(PILOT_ROOT / row["relative_path"]), "sha256": row["sha256"]})
    derivative = load(DERIVATIVES, "project-studio-audio-derivative-source-register/v3")
    require(derivative["status"] == "HASH_VERIFIED" and derivative["relationship_count"] == len(derivative["relationships"]), "derivative register failed")
    for relation in derivative["relationships"]:
        verify_record(relation["derivative"])
        require(relation["phase_or_stem_alignment_claimed"] is False, "derivative claims phase/stem alignment")
        for source in relation["sources"]:
            verify_record(source, root=None)
    return {"indexed_audio": len(assets), "derivative_relationships": len(derivative["relationships"]), "machine_verdict": "PASS"}


def check_responsive() -> dict[str, Any]:
    catalogue = load(RESPONSIVE, "project-studio-responsive-bundle-catalogue/v1")
    register = load(RESPONSIVE_REGISTER, "project-studio-responsive-generation-register/v1")
    candidates, variants = register["candidates"], catalogue["variants"]
    epochs = {row["epoch"] for row in candidates}
    contexts = {row["context"] for row in candidates}
    require(len(candidates) == 36 and len(variants) == 12 and len(epochs) == 3, "responsive cardinality mismatch")
    require(contexts == {"NORMAL", "ACTIVE", "BLOCKED", "WORKSPACE"}, "responsive context mismatch")
    require(all(row["classification"] == "HORIZONTAL_VARIANT_BUNDLE" for row in variants), "responsive bundle is not honest horizontal full mixes")
    require(all(row.get("aligned_stems") is not True for row in variants), "responsive bundle claims aligned stems")
    eligible = sum(bool(row["analysis"]["automatic_pass"]) for row in candidates)
    return {"epochs": sorted(epochs), "candidates": len(candidates), "variants": len(variants), "eligible": eligible, "excluded": len(candidates) - eligible}


def check_transitions_and_lot() -> dict[str, Any]:
    atlas_text = (DOC_REPO / "docs/audio/CODEX-ERA-TRANSITION-ATLAS-01.md").read_text(encoding="utf-8")
    atlas_rows = re.findall(r"^\| `ET-0[1-8]` \|", atlas_text, flags=re.MULTILINE)
    require(len(atlas_rows) == 8, f"transition atlas has {len(atlas_rows)} rows")
    transitions = load(TRANSITIONS, "project-studio-rendered-era-transitions/v3")
    require(transitions["render_count"] == 9 and transitions["boundary_count"] == 3, "rendered transition cardinality mismatch")
    require({row["treatment"] for row in transitions["renders"]} == {"NATURAL-ENDING-AMBIENCE-BRIDGE", "SAFE-UNVERIFIED-WINDOW-CROSSFADE", "GENERIC-DERIVED-EXIT-ENTRY"}, "transition treatments mismatch")
    for row in transitions["renders"]:
        require(row["phrase_boundary_claimed"] is False and row["bespoke_claimed"] is False, "transition contains overclaim")
        require("PHRASE-BOUNDARY" not in Path(row["audio"]["path"]).name and "BESPOKE" not in Path(row["audio"]["path"]).name, "transition filename contains overclaim")
        verify_record(row["audio"])
    living = load(LIVING, "project-studio-living-lot-soundscape/v2")
    require(living["duration_seconds"] == 600 and len(living["layers"]) == 3, "living-lot layer/duration mismatch")
    require(len(living["fixture_presentations"]) == 5 and len(living["era_presentations"]) == 3, "living-lot presentation mismatch")
    require(living["semantic_detail_counts"] == {"WIDE": 12, "MEDIUM": 25, "CLOSE": 28}, "living-lot detail schedule mismatch")
    for record in living["all_audio_files"]:
        path = verify_record(record)
        require(abs(probe_audio(path)["duration_seconds"] - 600) <= 0.025, f"living-lot duration mismatch: {path}")
    return {"atlas_boundaries": 8, "rendered_transitions": 9, "living_layers": 3, "living_fixture_presentations": 5, "living_era_presentations": 3, "detail_events": sum(living["semantic_detail_counts"].values())}


def check_management_radio_accessibility() -> dict[str, Any]:
    management = load(MANAGEMENT, "project-studio-management-audio-language/v3")
    require(management["semantic_family_count"] == 15 and management["candidate_count"] == 45, "management pack cardinality mismatch")
    require(len(management["selections"]) == 15 and all(row["selection_disposition"] == "MACHINE_PROVISIONAL_TECHNICAL_PROXY_PENDING_HUMAN_LISTENING" for row in management["selections"]), "management selection evidence mismatch")
    for row in management["candidates"]:
        verify_record(row["audio"])
    lint = load(RADIO_LINT, "project-studio-radio-copy-lint/v1")
    require(lint["status"] == "PASS" and lint["cleaned_units"] == 126 and lint["cleaned_finding_count"] == 0 and not lint["caption_parity_failures"], "radio-copy lint failed")
    radio = load(RADIO, "project-studio-radio-runtime-index/v1")
    require(radio["machine_verdict"] == "PASS" and len(radio["demos"]) == 3 and len(radio["thirty_minute_simulations"]) == 3, "radio runtime evidence failed")
    require(all(set(payload) == FUNCTIONAL_FIELDS and payload["captionText"] == payload["spokenText"] for payload in radio["functional_fixtures"]), "functional fixture identity/parity mismatch")
    for demo in radio["demos"]:
        require(abs(demo["preview"]["probe"]["duration_seconds"] - 600) <= 0.025, "radio demo duration mismatch")
        verify_record(demo["preview"])
        verify_record(demo["captions"])
        verify_record(demo["transcript"])
    for simulation in radio["thirty_minute_simulations"]:
        verify_record(simulation)
        require(all(simulation["checks"].values()), "radio 30-minute simulation failed")
    accessibility = load(ACCESSIBILITY, "project-studio-audio-accessibility-presets/v3")
    require(accessibility["machine_verdict"] == "PASS" and len(accessibility["renders"]) == 6, "accessibility evidence failed")
    require(accessibility["captions"]["enabled_before_first_functional_voice"] is True and accessibility["critical_audio_only_information"] is False, "accessibility contract mismatch")
    for render in accessibility["renders"]:
        verify_record(render)
    return {"management_families": 15, "management_candidates": 45, "radio_scripts": 126, "radio_demos": 3, "accessibility_presets": 6}


def check_apps_and_evidence(lab_app: Path, return_root: Path) -> dict[str, Any]:
    system = load(SYSTEM_REGISTER, "project-studio-system-audio-asset-register/v3")
    require(system["status"] in ALLOWED_STATUS and len(system["items"]) == 122, "system asset register mismatch")
    oracle = load(ORACLE, "project-studio-audio-oracle/v1")
    require(oracle["machine_verdict"] == "PASS" and oracle["scenario_count"] == 18 and sum(row["render"] is not None for row in oracle["traces"]) == 12, "Audio Oracle coverage failed")
    lab_binaries = [path for path in (lab_app / "Contents/MacOS").iterdir() if path.is_file()]
    require(len(lab_binaries) == 1 and oracle["lab_binary"]["sha256"] == sha256_file(lab_binaries[0]), "Audio Oracle lab binary mismatch")
    audition = load(AUDITION, "project-studio-audio-systems-audition-build/v1")
    require(audition["machine_verdict"] == "PASS" and audition["counts"]["collections"]["ERA_LIBRARY"] == 27, "audition build failed")
    unity = load(UNITY_VALIDATION)
    require(unity.get("machine_verdict") == "PASS", "Unity validation did not pass")
    package_manifest = load(return_root / "RETURN-PACKAGE-MANIFEST.json", "project-studio-audio-systems-owner-return/v1")
    require(package_manifest["status"] == "PROTOTYPE_READY_FOR_OWNER_AUDITION" and package_manifest["human_acceptance"] == "NONE_RECORDED", "return-package status boundary mismatch")
    for row in package_manifest["files"]:
        path = canonical_contained(return_root, return_root / row["relative_path"])
        require(path.stat().st_size == row["bytes"] and sha256_file(path) == row["sha256"], f"return-package file mismatch: {path}")
    count_audio = lambda relative: sum(  # noqa: E731
        path.is_file() and path.suffix.lower() in FORBIDDEN_AUDIO_SUFFIXES
        for path in (return_root / relative).rglob("*")
    )
    require(count_audio("MUSIC") == 39, "return package must contain 27 era picks and 12 responsive variants")
    require(count_audio("TRANSITIONS") == 9, "return package transition count mismatch")
    require(count_audio("LIVING-LOT") == 11, "return package living-lot count mismatch")
    require(count_audio("MANAGEMENT-SFX") == 45, "return package management count mismatch")
    require(count_audio("RADIO") == 3, "return package radio-demo count mismatch")
    require(count_audio("ACCESSIBILITY") == 6, "return package accessibility-render count mismatch")
    for launcher in (return_root / "AUDIO-LAB/START-AUDIO-LAB.command", return_root / "AUDITION/START-AUDITION.command"):
        require(launcher.is_file() and bool(launcher.stat().st_mode & 0o111), f"return launcher is not executable: {launcher}")
    subprocess.run(["codesign", "--verify", "--deep", "--strict", str(lab_app)], check=True, capture_output=True, text=True)
    subprocess.run(["codesign", "--verify", "--deep", "--strict", str(return_root / "AUDIO-LAB/Project Studio Audio Systems Pilot.app")], check=True, capture_output=True, text=True)
    return {"system_assets": len(system["items"]), "oracle_scenarios": 18, "oracle_renders": 12, "audition_items": audition["counts"]["items"], "return_files": len(package_manifest["files"]), "codesign": "PASS"}


def run(lab_app: Path, return_root: Path) -> dict[str, Any]:
    checks: dict[str, Any] = {}
    stages: tuple[tuple[str, Callable[[], dict[str, Any]]], ...] = (
        ("git_isolation", check_git),
        ("canonical_catalogue", check_catalogue),
        ("audio_assets", check_assets),
        ("responsive_music", check_responsive),
        ("transitions_and_living_lot", check_transitions_and_lot),
        ("management_radio_accessibility", check_management_radio_accessibility),
        ("apps_and_oracle", lambda: check_apps_and_evidence(lab_app, return_root)),
    )
    try:
        for name, function in stages:
            checks[name] = {"status": "PASS", **function()}
        result = {
            "schema": "project-studio-audio-systems-final-validation/v1",
            "generated_utc": utc_now(),
            "status": "PASS",
            "checks": checks,
            "rights_status": "PROTOTYPE_ONLY_OR_PROTOTYPE_READY_FOR_OWNER_AUDITION",
            "human_acceptance": "NONE_RECORDED",
            "production_integration": "PREPARED_NOT_EXECUTED",
            "p05_collision": "NONE",
            "production_changes": "NONE",
            "limitations": ["Machine proof does not equal listening, historical, cultural, rights, or shipping acceptance."],
        }
    except Exception as error:
        result = {
            "schema": "project-studio-audio-systems-final-validation/v1",
            "generated_utc": utc_now(),
            "status": "FAIL",
            "checks": checks,
            "failure": f"{type(error).__name__}: {error}",
        }
        atomic_write_json(OUTPUT, result)
        raise
    atomic_write_json(OUTPUT, result)
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--lab-app", type=Path, required=True)
    parser.add_argument("--return-root", type=Path, default=RETURN_ROOT)
    args = parser.parse_args()
    result = run(args.lab_app.resolve(strict=True), args.return_root.resolve(strict=True))
    print(json.dumps({"status": result["status"], "path": str(OUTPUT), "sha256": sha256_file(OUTPUT)}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
