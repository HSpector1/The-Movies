#!/usr/bin/env python3
"""Reconcile the preserved marathon into the canonical prototype catalogue.

The tool reads authoritative source files, verifies every recorded raw and selected
derivative hash, and materializes only the 27 provisional primary audition derivatives
inside the new external pilot root. It never writes to a source root.
"""

from __future__ import annotations

import argparse
import csv
import json
from collections import Counter
from pathlib import Path
from typing import Any

from common import (
    MARATHON_ROOT,
    PILOT_ROOT,
    atomic_write_json,
    materialize_verified,
    probe_audio,
    sha256_file,
    update_state,
    utc_now,
)


TOOL_VERSION = "audio-systems-catalogue-reconciler-v1"
RIGHTS_STATUS = "PROTOTYPE_ONLY"
HUMAN_DISPOSITION = "PENDING"
CATALOGUE_PATH = PILOT_ROOT / "01_catalogue/AudioPrototypeCatalogue.v1.json"
PROOF_PATH = PILOT_ROOT / "10_provenance/phase-a-reconciliation.json"
AUTHORITY_HASH_PATH = PILOT_ROOT / "10_provenance/source-authority-hashes.json"

INVENTORIES = (
    MARATHON_ROOT / "01_catalogue/canonical-plus-rescue-164-inventory.csv",
    MARATHON_ROOT / "01_catalogue/refinement-f1-inventory.csv",
    MARATHON_ROOT / "01_catalogue/medium-challenge-inventory.csv",
)
SCREENINGS = (
    MARATHON_ROOT / "03_analysis/screening-v3-final.csv",
    MARATHON_ROOT / "03_analysis/rescue-r1-reconciliation.csv",
    MARATHON_ROOT / "03_analysis/refinement-f1/screening-technical.csv",
    MARATHON_ROOT / "03_analysis/medium-challenge/screening-v3-technical.csv",
)
JURIES = (
    MARATHON_ROOT / "03_analysis/shortlist-ready-all-candidates-v3-machine-jury-final-v2.csv",
    MARATHON_ROOT / "03_analysis/refinement-f1/machine-jury.csv",
    MARATHON_ROOT / "03_analysis/medium-challenge/machine-jury.csv",
)
SELECTED_CATALOGUE = MARATHON_ROOT / "11_return-package/MusicCatalogue.provisional.json"
SHORTLIST = MARATHON_ROOT / "05_shortlists/provisional-machine-shortlist.json"
MOTIFS = MARATHON_ROOT / "04_processed/motif-shape-sketches/motif-shape-sketches.json"
SCRIPT_BANK = MARATHON_ROOT / "06_radio/script-bank/STUDIO-RADIO-SCRIPT-BANK-01.json"
VOICE_MANIFEST = MARATHON_ROOT / "06_radio/voice-prototypes/VOICE-PROTOTYPE-MANIFEST.json"
RADIO_INDEX = MARATHON_ROOT / "06_radio/demos-v2/RADIO-DEMO-INDEX.json"
ENDURANCE_INDEX = MARATHON_ROOT / "08_endurance/endurance-index.json"
MARATHON_STATE = MARATHON_ROOT / "00_state/MARATHON-STATE.json"


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def parse_json_cell(value: str | None) -> Any:
    if not value:
        return None
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return value


def first(row: dict[str, Any], *names: str, default: Any = None) -> Any:
    for name in names:
        value = row.get(name)
        if value not in (None, ""):
            return value
    return default


def load_index(paths: tuple[Path, ...]) -> dict[str, dict[str, str]]:
    result: dict[str, dict[str, str]] = {}
    for path in paths:
        for row in read_csv(path):
            candidate_id = row.get("candidate_id", "")
            if candidate_id:
                result[candidate_id] = row
    return result


def derive_machine_disposition(
    candidate_id: str,
    inventory: dict[str, str],
    screening: dict[str, str] | None,
    jury: dict[str, str] | None,
) -> dict[str, Any]:
    screening = screening or {}
    jury = jury or {}
    technical_pass = str(first(screening, "technical_automatic_pass", default="")).upper() == "TRUE"
    status = first(
        screening,
        "final_machine_status",
        "rescue_machine_status",
        "screening_status",
        "technical_screening_status",
        default=first(inventory, "screening_status", default="UNSCREENED"),
    )
    if str(status).upper() in {"MACHINE_REJECTED", "MACHINE_EXCLUDED", "REJECTED"} or not technical_pass and screening:
        disposition = "MACHINE_EXCLUDED"
    elif jury:
        disposition = first(jury, "machine_label", "analysis_machine_label", default="MACHINE_ELIGIBLE")
    elif str(status).upper() == "MACHINE_ELIGIBLE":
        disposition = "MACHINE_ELIGIBLE"
    else:
        disposition = str(status).upper()
    return {
        "disposition": disposition,
        "technical_automatic_pass": technical_pass if screening else None,
        "screening_status": status,
        "machine_score": float(jury["machine_score"]) if jury.get("machine_score") else None,
        "severe_mismatch": str(first(jury, "severe_machine_mismatch", default="FALSE")).upper() == "TRUE",
        "analysis_status": first(jury, "jury_status", "analysis_status", default="ANALYSIS SIGNAL ONLY"),
        "limitations": "Machine analysis cannot establish musical quality, historical correctness, cultural acceptance, fatigue comfort, or rights clearance.",
    }


def raw_entry(
    row: dict[str, str],
    screening: dict[str, str] | None,
    jury: dict[str, str] | None,
    selected: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    candidate_id = row["candidate_id"]
    source_path = Path(first(row, "absolute_path", "source_path"))
    expected_hash = first(row, "sha256", "source_sha256")
    actual_hash = sha256_file(source_path)
    if actual_hash != expected_hash:
        raise RuntimeError(f"raw source hash mismatch: {candidate_id}: {source_path}")
    probe = probe_audio(source_path)
    generation_tuple = parse_json_cell(row.get("generation_tuple")) or {}
    selected_rows = selected.get(candidate_id, {})
    derivative_records: list[dict[str, Any]] = []
    for role, selected_row in sorted(selected_rows.items()):
        for artifact_name, artifact in sorted(selected_row.get("artifacts", {}).items()):
            if not isinstance(artifact, dict) or not artifact.get("path") or not artifact.get("sha256"):
                continue
            artifact_path = Path(artifact["path"])
            actual = sha256_file(artifact_path)
            if actual != artifact["sha256"]:
                raise RuntimeError(f"selected derivative mismatch: {candidate_id}/{artifact_name}")
            record = {
                "derivative_type": artifact_name,
                "selection_role": role,
                "source_candidate_id": candidate_id,
                "absolute_source_path": str(artifact_path),
                "bytes": artifact_path.stat().st_size,
                "sha256": actual,
            }
            if artifact_name in {"loop_master", "aac_preview"} and role == "PRIMARY":
                suffix = artifact_path.suffix.lower()
                stable_id = selected_row["stable_track_id"]
                destination = PILOT_ROOT / "02_music-bundles/library" / row["epoch"] / f"{stable_id}{suffix}"
                local = materialize_verified(artifact_path, destination, actual)
                record["pilot_relative_path"] = destination.relative_to(PILOT_ROOT).as_posix()
                record["materialized_bytes"] = local["bytes"]
            derivative_records.append(record)
    parent = first(row, "source_candidate_id", "parent_prompt_id")
    prompt_revision = first(row, "revision_id", "refinement_round", "rescue_round", default="CANONICAL")
    if prompt_revision in (None, ""):
        prompt_revision = "CANONICAL"
    machine = derive_machine_disposition(candidate_id, row, screening, jury)
    contexts = ["LIBRARY_AUDITION"]
    if any(track.get("shortlist", {}).get("role_type") == "PRIMARY" for track in selected_rows.values()):
        contexts.extend(["LOT_SCORE_PROTOTYPE", "RADIO_MUSIC_PROTOTYPE"])
    if candidate_id in {"FND-03__seed-130363", "FPL-01__seed-130363", "SPL-02__seed-155921"}:
        contexts.append("RESPONSIVE_VARIANT_CREATIVE_ANCHOR")
    return {
        "stable_prototype_id": f"APS01-MUSIC-{candidate_id}",
        "asset_type": "MUSIC_SOURCE_CANDIDATE",
        "source_candidate_id": candidate_id,
        "source_parent_id": parent,
        "commissioning_alias": first(row, "epoch", "epoch_alias"),
        "family": first(row, "prompt_family", "family", default=first(row, "prompt_id")),
        "prompt_family_id": first(row, "prompt_id", "family_id"),
        "prompt_revision": str(prompt_revision),
        "seed": int(row["seed"]),
        "identities": {
            "model": generation_tuple.get("canonical_model") or generation_tuple.get("model_family"),
            "model_revision": generation_tuple.get("canonical_model_revision"),
            "code_repository": generation_tuple.get("code_repository"),
            "code_commit": generation_tuple.get("code_commit"),
            "optimized_weights_revision": generation_tuple.get("optimized_weights_revision"),
            "generation_tuple": generation_tuple,
        },
        "raw": {
            "absolute_authoritative_path": str(source_path),
            "bytes": source_path.stat().st_size,
            "sha256": actual_hash,
        },
        "derivatives": derivative_records,
        "duration_seconds": probe["duration_seconds"],
        "estimated_bpm": float(first(jury or {}, "likely_bpm", default="nan")) if first(jury or {}, "likely_bpm") else None,
        "sample_rate_hz": probe["sample_rate_hz"],
        "channels": probe["channels"],
        "loudness": {
            "integrated_lufs": float(first(jury or {}, "raw_loudness_lufs_i", default="nan")) if first(jury or {}, "raw_loudness_lufs_i") else None,
            "true_peak_dbtp": float(first(jury or {}, "raw_true_peak_dbtp", default="nan")) if first(jury or {}, "raw_true_peak_dbtp") else None,
            "status": "MEASURED_ANALYSIS_SIGNAL_ONLY" if first(jury or {}, "raw_loudness_lufs_i") else "NOT_REMEASURED",
        },
        "loop_metadata": {
            "loopable": False,
            "confidence": "RAW_SOURCE_NOT_LOOP_AUTHORITY",
            "derived_loop_available": any(item["derivative_type"] == "loop_master" for item in derivative_records),
        },
        "machine_disposition": machine,
        "human_disposition": HUMAN_DISPOSITION,
        "rights_status": RIGHTS_STATUS,
        "permitted_lab_contexts": sorted(set(contexts)),
    }


def motif_entries() -> list[dict[str, Any]]:
    data = json.loads(MOTIFS.read_text(encoding="utf-8"))
    result: list[dict[str, Any]] = []
    for row in data["records"]:
        source = Path(row["wav_absolute_path"])
        actual = sha256_file(source)
        if actual != row["wav_sha256"]:
            raise RuntimeError(f"motif hash mismatch: {row['motif_id']}")
        result.append({
            "stable_prototype_id": f"APS01-{row['motif_id']}",
            "asset_type": "MOTIF_SHAPE_SKETCH",
            "source_candidate_id": row["motif_id"],
            "source_parent_id": None,
            "commissioning_alias": "ORCHESTRATION_NEUTRAL_UNASSIGNED",
            "family": "UNSELECTED_MOTIF_SHAPE",
            "prompt_family_id": "DETERMINISTIC_CONTOUR_SPEC",
            "prompt_revision": "V1",
            "seed": None,
            "identities": {
                "model": "deterministic Python additive synthesis",
                "model_revision": None,
                "code_repository": None,
                "code_commit": None,
                "optimized_weights_revision": None,
                "generation_tuple": data["generation_spec"],
            },
            "raw": {"absolute_authoritative_path": str(source), "bytes": source.stat().st_size, "sha256": actual},
            "derivatives": [],
            "duration_seconds": row["duration_seconds"],
            "estimated_bpm": None,
            "sample_rate_hz": row["sample_rate_hz"],
            "channels": row["channels"],
            "loudness": {"integrated_lufs": None, "true_peak_dbtp": None, "status": "NOT_MEASURED"},
            "loop_metadata": {"loopable": False, "confidence": "NOT_APPLICABLE"},
            "machine_disposition": {"disposition": "NOT_SELECTED_NO_RANKING", "analysis_status": "STRUCTURAL_VALIDATION_ONLY"},
            "human_disposition": HUMAN_DISPOSITION,
            "rights_status": RIGHTS_STATUS,
            "permitted_lab_contexts": ["MOTIF_SHAPE_AUDITION_ONLY"],
        })
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pilot-root", type=Path, default=PILOT_ROOT)
    args = parser.parse_args()
    if args.pilot_root.resolve() != PILOT_ROOT.resolve():
        raise RuntimeError("set PROJECT_STUDIO_AUDIO_PILOT_ROOT before import to override the root")

    selected_catalogue = json.loads(SELECTED_CATALOGUE.read_text(encoding="utf-8"))
    selected: dict[str, dict[str, dict[str, Any]]] = {}
    for track in selected_catalogue["tracks"]:
        selected.setdefault(track["candidate_id"], {})[track["shortlist"]["role_type"]] = track
    screening = load_index(SCREENINGS)
    jury = load_index(JURIES)

    inventory_rows: list[dict[str, str]] = []
    for path in INVENTORIES:
        inventory_rows.extend(read_csv(path))
    ids = [row["candidate_id"] for row in inventory_rows]
    if len(ids) != 191 or len(set(ids)) != 191:
        raise RuntimeError(f"expected 191 unique raw music candidates, found {len(ids)}/{len(set(ids))}")

    entries = [raw_entry(row, screening.get(row["candidate_id"]), jury.get(row["candidate_id"]), selected) for row in inventory_rows]
    entries.extend(motif_entries())
    entries.sort(key=lambda item: item["stable_prototype_id"])

    selected_ids = {track["candidate_id"] for track in selected_catalogue["tracks"] if track["shortlist"]["role_type"] == "PRIMARY"}
    if len(selected_ids) != 27:
        raise RuntimeError(f"expected 27 primary candidates, found {len(selected_ids)}")
    disposition_by_id = {entry["source_candidate_id"]: entry["machine_disposition"]["disposition"] for entry in entries}
    excluded_picks = sorted(item for item in selected_ids if disposition_by_id.get(item) == "MACHINE_EXCLUDED")
    if excluded_picks:
        raise RuntimeError(f"machine-excluded candidate presented as primary: {excluded_picks}")

    authority_paths = list(INVENTORIES) + list(SCREENINGS) + list(JURIES) + [
        SELECTED_CATALOGUE, SHORTLIST, MOTIFS, SCRIPT_BANK, VOICE_MANIFEST,
        RADIO_INDEX, ENDURANCE_INDEX, MARATHON_STATE,
    ]
    authority_hashes = [
        {"path": str(path), "bytes": path.stat().st_size, "sha256": sha256_file(path)}
        for path in authority_paths
    ]
    atomic_write_json(AUTHORITY_HASH_PATH, {
        "schema": "project-studio-audio-source-authority-hashes/v1",
        "generated_utc": utc_now(),
        "status": "HASH_VERIFIED",
        "artifacts": authority_hashes,
    })

    script_bank = json.loads(SCRIPT_BANK.read_text(encoding="utf-8"))
    voice_manifest = json.loads(VOICE_MANIFEST.read_text(encoding="utf-8"))
    catalogue = {
        "schema": "project-studio-audio-prototype-catalogue/v1",
        "pilot_id": "project-studio-audio-systems-pilot-01",
        "generated_utc": utc_now(),
        "status": "PROTOTYPE_ONLY",
        "human_acceptance": "NONE_RECORDED",
        "era_alias_authority": "CREATIVE_COMMISSIONING_ALIAS_NOT_P13_RUNTIME_ID",
        "source_authorities": {
            "marathon_git_sha": "c457c3a35a66b2ab4b72b0ca379f118b2f1fa1bf",
            "music_pilot_git_sha": "65596e47f9e7b9de33bd9530ee573390416d329e",
            "direction_git_sha": "f803164357ad417cea3162cb2c329890868f2b19",
            "p13_binding_sha": "2a7ff0d973391f9433d19ec2cb7f6c5582d1e44f",
            "authority_hash_manifest": AUTHORITY_HASH_PATH.relative_to(PILOT_ROOT).as_posix(),
        },
        "counts": {
            "commissioning_aliases": len({entry["commissioning_alias"] for entry in entries if entry["asset_type"] == "MUSIC_SOURCE_CANDIDATE"}),
            "raw_music_candidates": 191,
            "motif_shape_sketches": 12,
            "catalogue_entries": len(entries),
            "provisional_primary_picks": 27,
            "provisional_alternates": 27,
            "radio_script_units": len(script_bank["units"]),
            "voice_units": int(voice_manifest.get("counts", {}).get("clips", 30)),
            "radio_demos": 3,
            "long_session_playlists": 9,
        },
        "required_entry_fields": [
            "stable_prototype_id", "source_candidate_id", "commissioning_alias", "family",
            "prompt_revision", "seed", "identities", "raw", "derivatives", "duration_seconds",
            "estimated_bpm", "sample_rate_hz", "loudness", "loop_metadata",
            "machine_disposition", "human_disposition", "rights_status", "permitted_lab_contexts",
        ],
        "entries": entries,
        "limitations": [
            "Machine eligibility and ranking do not establish listening acceptance.",
            "No entry is Owner-approved, commercially cleared, final, or ship-ready.",
            "Commissioning aliases are not P13 runtime era identifiers.",
            "Raw source paths remain read-only authorities outside this pilot root.",
        ],
    }
    atomic_write_json(CATALOGUE_PATH, catalogue)
    catalogue_hash = sha256_file(CATALOGUE_PATH)

    dispositions = Counter(entry["machine_disposition"]["disposition"] for entry in entries)
    proof = {
        "schema": "project-studio-audio-phase-a-reconciliation/v1",
        "tool_version": TOOL_VERSION,
        "generated_utc": utc_now(),
        "status": "PASS",
        "checks": {
            "raw_music_count_191": len(inventory_rows) == 191,
            "raw_ids_unique": len(set(ids)) == 191,
            "motif_count_12": len(entries) - len(inventory_rows) == 12,
            "all_recorded_raw_hashes_match": True,
            "all_selected_derivative_hashes_match": True,
            "primary_pick_count_27": len(selected_ids) == 27,
            "no_excluded_primary": not excluded_picks,
            "human_disposition_pending_for_every_entry": all(item["human_disposition"] == "PENDING" for item in entries),
            "rights_status_prototype_only_for_every_entry": all(item["rights_status"] == "PROTOTYPE_ONLY" for item in entries),
            "no_owner_or_ship_status": True,
        },
        "counts": catalogue["counts"],
        "machine_dispositions": dict(sorted(dispositions.items())),
        "catalogue": {"path": str(CATALOGUE_PATH), "bytes": CATALOGUE_PATH.stat().st_size, "sha256": catalogue_hash},
        "limitations": catalogue["limitations"],
    }
    atomic_write_json(PROOF_PATH, proof)
    update_state(
        phase="PHASE_A_RECONCILED",
        completed=[
            "Phase A reconciled 191 immutable raw music candidates and 12 motif sketches",
            "Verified every recorded raw and selected derivative hash",
            "Materialized hash-identical audition derivatives for all 27 provisional primaries",
            "Created canonical AudioPrototypeCatalogue.v1.json with all human dispositions PENDING",
        ],
        counts={"catalogue_entries": len(entries)},
        next_action="Author and render three targeted horizontal responsive variant bundles, then extend the catalogue without changing Phase A authority.",
    )
    print(json.dumps(proof, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
