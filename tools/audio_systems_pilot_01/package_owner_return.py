#!/usr/bin/env python3
"""Assemble the immutable Owner return package for Audio Systems Pilot 01."""

from __future__ import annotations

import argparse
import csv
import io
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from common import DOC_REPO, PILOT_ROOT, atomic_write_json, atomic_write_text, sha256_file, utc_now


RETURN_ROOT = Path("/Users/bruce/Desktop/Project-Studio-Audio-Systems-Pilot-01")
AUDITION_SOURCE = PILOT_ROOT / "11_return-package/AUDITION-SOURCE-REGISTER.json"
SYSTEM_REGISTER = PILOT_ROOT / "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v3.json"
ORACLE_ROOT = PILOT_ROOT / "07_audio-oracle"
AUDITION_APP = PILOT_ROOT / "08_audition-app"
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
FEEDBACK_FIELDS = (
    "item_id", "collection", "epoch", "context", "musicalQuality", "eraFit", "studioIdentity",
    "managementSuitability", "irritation", "repetition", "transitionQuality", "ambienceQuality",
    "radioCopyCredibility", "voicePerformance", "ducking", "uiSoundRestraint", "accessibility",
    "verdict", "notes", "saved_at",
)


def clone_file(source: Path, destination: Path) -> None:
    if not source.is_file():
        raise RuntimeError(f"required package source missing: {source}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    completed = subprocess.run(["cp", "-c", str(source), str(destination)], check=False, capture_output=True, text=True)
    if completed.returncode != 0:
        shutil.copy2(source, destination)
    if sha256_file(source) != sha256_file(destination):
        raise RuntimeError(f"package copy hash mismatch: {destination}")


def copy_tree(source: Path, destination: Path) -> None:
    if not source.is_dir():
        raise RuntimeError(f"required package directory missing: {source}")
    completed = subprocess.run(["ditto", str(source), str(destination)], check=False, capture_output=True, text=True)
    if completed.returncode != 0:
        raise RuntimeError(f"ditto failed for {source}: {completed.stderr}")


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
5. All three ten-minute Studio Radio programs with captions.
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
- Radio, PA, score, ambience, SFX, and UI never mutate mechanics. Functional bulletins use typed lab fixture payloads until their future owner contracts exist.
- The Small-SFX path uses an exact public optimized prototype weight and existing approved shared components. It does not create commercial clearance.
- The Audio Lab APIs and integration proposal are provisional. Production integration was prepared but not executed.
"""


def launcher_text() -> str:
    return """#!/bin/zsh
set -euo pipefail
SCRIPT_DIR="${0:A:h}"
PILOT_ROOT_DEFAULT="/Users/bruce/Project Studio Audio Systems Pilot 01"
export PROJECT_STUDIO_AUDIO_PILOT_ROOT="${PROJECT_STUDIO_AUDIO_PILOT_ROOT:-$PILOT_ROOT_DEFAULT}"
if [[ ! -f "$PROJECT_STUDIO_AUDIO_PILOT_ROOT/01_catalogue/AudioPrototypeCatalogue.v1.json" ]]; then
  print -u2 "Audio Lab refused: catalogue unavailable under $PROJECT_STUDIO_AUDIO_PILOT_ROOT"
  print -u2 "Set PROJECT_STUDIO_AUDIO_PILOT_ROOT to the preserved Audio Systems Pilot root and retry."
  exit 2
fi
exec /usr/bin/open "$SCRIPT_DIR/Project Studio Audio Systems Pilot.app"
"""


def package_item(item: dict[str, Any], root: Path) -> None:
    source = Path(item["source_path"])
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
        destination = root / "MUSIC" / epoch_map[item["epoch"]] / f"{prefix}--{item['id']}{source.suffix}"
    elif collection == "ERA_TRANSITIONS":
        destination = root / "TRANSITIONS" / f"{item['id']}{source.suffix}"
    elif collection == "LIVING_LOT":
        destination = root / "LIVING-LOT" / f"{item['id']}{source.suffix}"
    elif collection == "MANAGEMENT_SFX":
        destination = root / "MANAGEMENT-SFX" / f"{item['id']}{source.suffix}"
    elif collection == "ACCESSIBILITY":
        destination = root / "ACCESSIBILITY" / f"{item['id']}{source.suffix}"
    else:
        return
    clone_file(source, destination)


def copy_radio(root: Path) -> None:
    mappings = {
        "EARLY": "EARLY-NETWORK-GOLDEN-STUDIO",
        "POSTWAR": "POSTWAR-PERSONALITY-FORMAT-TRANSITION",
        "DIGITAL": "DIGITAL-NETWORKED-HYBRID",
    }
    for destination_name, slug in mappings.items():
        source_root = PILOT_ROOT / "06_radio/demos" / slug
        destination_root = root / "RADIO" / destination_name
        for name in (f"{slug}-RUNTIME-DEMO.m4a", "CAPTIONS.vtt", "TRANSCRIPT.md", "SCHEDULE.json", "METADATA.json", "THIRTY-MINUTE-SIMULATION.json"):
            clone_file(source_root / name, destination_root / name)


def manifest_tree(root: Path) -> dict[str, Any]:
    files: list[dict[str, Any]] = []
    links: list[dict[str, Any]] = []
    for path in sorted(root.rglob("*")):
        if path.name == "RETURN-PACKAGE-MANIFEST.json":
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
            files.append({"relative_path": relative, "bytes": path.stat().st_size, "sha256": sha256_file(path)})
    return {"files": files, "symlinks": links}


def build(lab_app: Path) -> dict[str, Any]:
    if RETURN_ROOT.exists():
        raise RuntimeError(f"return package already exists; verify or preserve it instead of overwriting: {RETURN_ROOT}")
    source_register = json.loads(AUDITION_SOURCE.read_text(encoding="utf-8"))
    if source_register.get("schema") != "project-studio-audio-systems-audition-source/v1":
        raise RuntimeError("unexpected audition source register")
    for item in source_register["items"]:
        if sha256_file(Path(item["source_path"])) != item["sha256"]:
            raise RuntimeError(f"audition source changed before packaging: {item['id']}")
    oracle_index = json.loads((ORACLE_ROOT / "AUDIO-ORACLE-INDEX.json").read_text(encoding="utf-8"))
    if oracle_index.get("scenario_count") != 18 or oracle_index.get("machine_verdict") != "PASS":
        raise RuntimeError("Audio Oracle is not a complete 18-scenario pass")
    subprocess.run(["codesign", "--verify", "--deep", "--strict", str(lab_app)], check=True, capture_output=True, text=True)

    staging = Path(tempfile.mkdtemp(prefix=".Project-Studio-Audio-Systems-Pilot-01.", dir=RETURN_ROOT.parent))
    try:
        for relative in REQUIRED_DIRS:
            (staging / relative).mkdir(parents=True, exist_ok=True)
        write_markdown(staging / "START-HERE.md", start_here())
        write_markdown(staging / "KNOWN-LIMITATIONS.md", known_limitations())
        feedback = io.StringIO(newline="")
        csv.writer(feedback).writerow(FEEDBACK_FIELDS)
        atomic_write_text(staging / "OWNER-FEEDBACK.csv", feedback.getvalue())

        copy_tree(lab_app, staging / "AUDIO-LAB/Project Studio Audio Systems Pilot.app")
        atomic_write_text(staging / "AUDIO-LAB/START-AUDIO-LAB.command", launcher_text(), mode=0o755)
        write_markdown(staging / "AUDIO-LAB/README.md", """
# Isolated Unity Audio Lab

Use `START-AUDIO-LAB.command`. The application loads only explicit, SHA-256-bound local prototype files from `PROJECT_STUDIO_AUDIO_PILOT_ROOT`. It is not in production build settings and is not the production game.
""")
        for item in source_register["items"]:
            package_item(item, staging)
        copy_radio(staging)
        copy_tree(ORACLE_ROOT, staging / "AUDIO-ORACLE")
        copy_tree(AUDITION_APP, staging / "AUDITION")

        for source in (
            PILOT_ROOT / "01_catalogue/AudioPrototypeCatalogue.v1.json",
            SYSTEM_REGISTER,
            AUDITION_SOURCE,
            PILOT_ROOT / "10_provenance/audio-assets-index.v3.json",
            PILOT_ROOT / "02_music-bundles/responsive/responsive-anchor-authority.v2.json",
            PILOT_ROOT / "02_music-bundles/responsive/responsive-generation-register.json",
            PILOT_ROOT / "02_music-bundles/responsive/responsive-bundle-catalogue.json",
            PILOT_ROOT / "03_transitions/rendered-transition-catalogue.v3.json",
            PILOT_ROOT / "04_living-lot/living-lot-soundscape-catalogue.v2.json",
            PILOT_ROOT / "05_management-sfx/generated-lot-detail/lot-detail-sfx-catalogue.json",
            PILOT_ROOT / "05_management-sfx/semantic-pack/management-semantic-catalogue.v3.json",
            PILOT_ROOT / "06_radio/STUDIO-RADIO-RUNTIME-INDEX.json",
            PILOT_ROOT / "07_audio-oracle/accessibility-renders-v3/ACCESSIBILITY-PRESETS.v3.json",
            PILOT_ROOT / "07_audio-oracle/AUDIO-ORACLE-INDEX.json",
        ):
            clone_file(source, staging / "CATALOGUE" / source.name)
        provenance_files = (
            PILOT_ROOT / "10_provenance/phase-a-reconciliation.json",
            PILOT_ROOT / "10_provenance/source-authority-hashes.json",
            PILOT_ROOT / "10_provenance/sfx-route-gate.v2.json",
            PILOT_ROOT / "10_provenance/audio-assets-validation.v3.json",
            PILOT_ROOT / "10_provenance/audio-derivative-source-register.v3.json",
            PILOT_ROOT / "00_state/AUDIO-SYSTEMS-PILOT-STATE.json",
        )
        for source in provenance_files:
            clone_file(source, staging / "PROVENANCE" / source.name)
        for name in DOC_NAMES:
            clone_file(DOC_REPO / "docs/audio" / name, staging / "PROVENANCE" / name)
        clone_file(DOC_REPO / "docs/audio/CODEX-ERA-TRANSITION-ATLAS-01.md", staging / "TRANSITIONS/ERA-TRANSITION-ATLAS.md")
        clone_file(DOC_REPO / "docs/audio/CODEX-RESPONSIVE-MUSIC-BUNDLES-01.md", staging / "MUSIC/README.md")
        clone_file(DOC_REPO / "docs/audio/CODEX-LIVING-LOT-SOUNDSCAPE-01.md", staging / "LIVING-LOT/README.md")
        clone_file(DOC_REPO / "docs/audio/CODEX-MANAGEMENT-AUDIO-LANGUAGE-01.md", staging / "MANAGEMENT-SFX/README.md")
        clone_file(DOC_REPO / "docs/audio/CODEX-STUDIO-RADIO-RUNTIME-01.md", staging / "RADIO/README.md")
        clone_file(PILOT_ROOT / "07_audio-oracle/accessibility-renders-v3/ACCESSIBILITY-PRESETS.v3.json", staging / "ACCESSIBILITY/ACCESSIBILITY-PRESETS.v3.json")

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
            "files": tree["files"],
            "symlinks": tree["symlinks"],
            "counts": {"files": len(tree["files"]), "symlinks": len(tree["symlinks"]), "audition_items": len(source_register["items"]), "oracle_scenarios": 18},
        }
        atomic_write_json(staging / "RETURN-PACKAGE-MANIFEST.json", manifest)
        os.replace(staging, RETURN_ROOT)
    except Exception:
        shutil.rmtree(staging, ignore_errors=True)
        raise
    return verify()


def verify() -> dict[str, Any]:
    manifest_path = RETURN_ROOT / "RETURN-PACKAGE-MANIFEST.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    for relative in REQUIRED_DIRS:
        if not (RETURN_ROOT / relative).is_dir():
            raise RuntimeError(f"return package missing required directory: {relative}")
    for name in ("START-HERE.md", "KNOWN-LIMITATIONS.md", "OWNER-FEEDBACK.csv"):
        if not (RETURN_ROOT / name).is_file():
            raise RuntimeError(f"return package missing required file: {name}")
    for record in manifest["files"]:
        path = RETURN_ROOT / record["relative_path"]
        if not path.is_file() or sha256_file(path) != record["sha256"]:
            raise RuntimeError(f"return package hash mismatch: {path}")
    subprocess.run(["codesign", "--verify", "--deep", "--strict", str(RETURN_ROOT / "AUDIO-LAB/Project Studio Audio Systems Pilot.app")], check=True, capture_output=True, text=True)
    return {"machine_verdict": "PASS", "path": str(RETURN_ROOT), **manifest["counts"], "manifest_sha256": sha256_file(manifest_path)}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--lab-app", type=Path)
    parser.add_argument("--verify-only", action="store_true")
    args = parser.parse_args()
    if args.verify_only:
        result = verify()
    else:
        if args.lab_app is None:
            raise RuntimeError("--lab-app is required")
        result = build(args.lab_app)
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
