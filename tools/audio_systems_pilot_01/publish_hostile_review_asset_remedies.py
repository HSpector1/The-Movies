#!/usr/bin/env python3
"""Publish immutable metadata/audio remedies for hostile adaptive-music findings."""

from __future__ import annotations

import copy
import json
import math
from pathlib import Path
from typing import Any

import numpy as np
import soundfile as sf

from audio_dsp import ffmpeg_atomic, file_record, technical_screen, write_manifest
from common import PILOT_ROOT, sha256_file, utc_now


RESPONSIVE_ROOT = PILOT_ROOT / "02_music-bundles/responsive"
LEGACY_REGISTER = RESPONSIVE_ROOT / "responsive-generation-register.json"
REGISTER_V2 = RESPONSIVE_ROOT / "responsive-generation-register.v2.json"
LEGACY_BUNDLES = RESPONSIVE_ROOT / "responsive-bundle-catalogue.json"
BUNDLES_V2 = RESPONSIVE_ROOT / "responsive-bundle-catalogue.v2.json"
TRANSITION_ROOT = PILOT_ROOT / "03_transitions"
TRANSITIONS_V3 = TRANSITION_ROOT / "rendered-transition-catalogue.v3.json"
TRANSITIONS_V4 = TRANSITION_ROOT / "rendered-transition-catalogue.v4.json"
QUARANTINE = TRANSITION_ROOT / "SUPERSEDED-NONCANONICAL-ASSETS.json"
LIVING_ROOT = PILOT_ROOT / "04_living-lot"
LIVING_V2 = LIVING_ROOT / "living-lot-soundscape-catalogue.v2.json"
LIVING_V3 = LIVING_ROOT / "living-lot-soundscape-catalogue.v3.json"
FINAL_WINDOW_HASHES = {
    "AE-TO-NS": "dd2293d677cb8e9b1fe114711c2094eb97d38395ab78aabef057d24d0ba45c12",
    "MF-TO-FP": "f69359073fcc2d7f7d257b638db0dd736fa9a8a463c764e7fa87961059508138",
    "SD-TO-NH": "2afbf5dc3493c64df5cd0f216b2083342d596bdf7694ab6e9c1ec3807dd2a663",
}


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def stable_generated_time(path: Path) -> str:
    if path.is_file():
        existing = load(path).get("generated_at_utc")
        if existing:
            return str(existing)
    return utc_now()


def dispositions(analysis: dict[str, Any]) -> dict[str, str]:
    passed = bool(analysis.get("automatic_pass"))
    return {
        "technical_disposition": "TECHNICAL_PASS" if passed else "TECHNICAL_EXCLUDED",
        "machine_disposition": "MACHINE_ELIGIBLE" if passed else "MACHINE_EXCLUDED",
        "human_disposition": "PENDING",
        "rights_status": "PROTOTYPE_ONLY",
    }


def publish_responsive() -> tuple[dict[str, Any], dict[str, Any]]:
    source_register = load(LEGACY_REGISTER)
    register = copy.deepcopy(source_register)
    register["schema"] = "project-studio-responsive-generation-register/v2"
    register["candidates"] = [
        {**candidate, **dispositions(candidate["analysis"])}
        for candidate in source_register["candidates"]
    ]
    register["per_candidate_disposition_contract"] = {
        "technical": "deterministic file/signal screen only",
        "machine": "eligibility for machine-provisional selection only",
        "human": "PENDING for every candidate",
    }
    register["supersedes"] = {
        **file_record(LEGACY_REGISTER),
        "reason": "v1 omitted explicit per-candidate technical, machine, and human dispositions",
    }
    if len(register["candidates"]) != 36 or not all(
        row["human_disposition"] == "PENDING"
        and row["rights_status"] == "PROTOTYPE_ONLY"
        and row["technical_disposition"] in {"TECHNICAL_PASS", "TECHNICAL_EXCLUDED"}
        and row["machine_disposition"] in {"MACHINE_ELIGIBLE", "MACHINE_EXCLUDED"}
        for row in register["candidates"]
    ):
        raise RuntimeError("responsive v2 per-candidate disposition contract failed")
    write_manifest(REGISTER_V2, register)

    source_bundles = load(LEGACY_BUNDLES)
    bundles = copy.deepcopy(source_bundles)
    bundles["schema"] = "project-studio-responsive-bundle-catalogue/v2"
    thresholds = {"NORMAL": 0, "ACTIVE": 8, "BLOCKED": 5, "WORKSPACE": 0}
    for variant in bundles["variants"]:
        variant["transition_metadata"]["hysteresis_seconds"] = thresholds[variant["context"]]
        variant["transition_metadata"]["hysteresis_policy"] = "TARGET_CONTEXT_STABLE_SECONDS"
    bundles["selection_policy"] = {
        "minimum_dwell_seconds": 45,
        "target_context_hysteresis_seconds": thresholds,
        "density": {
            "FULL_MUSIC": {"gap_seconds": [8, 20], "start_probability": 1.0},
            "BALANCED": {"gap_seconds": [35, 95], "start_probability": 0.82},
            "SPARSE": {"gap_seconds": [120, 300], "start_probability": 0.58},
            "OFF": {"gap_seconds": None, "start_probability": 0.0},
        },
    }
    bundles["supersedes"] = {
        **file_record(LEGACY_BUNDLES),
        "reason": "v1 encoded one eight-second hysteresis value instead of the shared target-context policy",
    }
    write_manifest(BUNDLES_V2, bundles)
    return register, bundles


def render_final_window(row: dict[str, Any]) -> dict[str, Any]:
    boundary = row["boundary_id"]
    outgoing = Path(row["outgoing_source"]["path"])
    incoming = Path(row["incoming_source"]["path"])
    ambience = Path(row["ambience_source"]["path"])
    destination = TRANSITION_ROOT / boundary / f"ASP01-TRANSITION-{boundary}-FINAL-WINDOW-AMBIENCE-BRIDGE-v3.wav"
    sidecar = destination.with_suffix(".v4.json")
    prior = load(sidecar) if sidecar.is_file() else None
    rendered_audio = ffmpeg_atomic(
        [
            "-i", outgoing, "-i", ambience, "-i", incoming,
            "-filter_complex",
            "[0:a]atrim=start=107.75:end=119.75,asetpts=PTS-STARTPTS,afade=t=out:st=7.75:d=4.25[o];"
            "[1:a]atrim=start=12:end=18,asetpts=PTS-STARTPTS,volume=0.40,afade=t=in:st=0:d=1.25,afade=t=out:st=4.75:d=1.25[a];"
            "[2:a]atrim=start=0.25:end=12.25,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=4.25[i];"
            "[o][a][i]concat=n=3:v=0:a=1[out]",
            "-map", "[out]", "-map_metadata", "-1", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", "-f", "wav",
        ],
        destination,
        expected_existing_sha256=(prior["audio"]["sha256"] if prior else FINAL_WINDOW_HASHES[boundary]),
    )
    audio = {key: value for key, value in rendered_audio.items() if key != "reused"}
    analysis = technical_screen(destination, expected_channels=2, music=False)
    if not analysis["automatic_pass"]:
        raise RuntimeError(f"final-window transition screen failed: {destination}")
    remediated = copy.deepcopy(row)
    remediated.update({
        "stable_prototype_id": row["stable_prototype_id"].replace("NATURAL-ENDING-AMBIENCE-BRIDGE", "FINAL-WINDOW-AMBIENCE-BRIDGE"),
        "treatment": "FINAL-WINDOW-AMBIENCE-BRIDGE",
        "classification": "UNVERIFIED_FINAL_WINDOW_WITH_SIX_SECOND_AMBIENCE_BRIDGE",
        "honesty": "Fixed final source window only; no natural ending, authored cadence, phrase, bar, or phase alignment is claimed",
        "natural_ending_claimed": False,
        "owner_facing_filename_uses_honest_treatment_token": True,
        "audio": audio,
        "analysis": analysis,
    })
    write_manifest(sidecar, remediated)
    return remediated


def mono_technical_result(path: Path) -> dict[str, Any]:
    peak = 0.0
    sum_squares = 0.0
    frames = 0
    with sf.SoundFile(path) as handle:
        while True:
            block = handle.read(262_144, dtype="float64", always_2d=True)
            if not len(block):
                break
            mono = np.mean(block, axis=1)
            peak = max(peak, float(np.max(np.abs(mono))))
            sum_squares += float(np.dot(mono, mono))
            frames += len(mono)
    rms = math.sqrt(sum_squares / max(1, frames))
    return {
        "method": "equal-weight channel fold; streaming sample peak and RMS",
        "frames_checked": frames,
        "peak_dbfs": round(20 * math.log10(max(peak, 1e-12)), 4),
        "rms_dbfs": round(20 * math.log10(max(rms, 1e-12)), 4),
        "status": "TECHNICAL_NON_SILENCE_PASS" if rms > 1e-6 else "FAIL_SILENT",
        "human_mono_compatibility": "PENDING",
    }


def explicit_transition_contract(row: dict[str, Any]) -> dict[str, Any]:
    sample_rate = int(row["audio"]["probe"]["sample_rate_hz"])
    treatment = row["treatment"]
    specs: dict[str, dict[str, Any]] = {
        "FINAL-WINDOW-AMBIENCE-BRIDGE": {
            "source_windows_seconds": {"outgoing": [107.75, 119.75], "ambience": [12.0, 18.0], "incoming": [0.25, 12.25]},
            "source_windows_frames": {"outgoing": [5_172_000, 5_748_000], "ambience": [576_000, 864_000], "incoming": [12_000, 588_000]},
            "output_segment_offsets_frames": [0, 576_000, 864_000],
            "fade_envelopes": [
                {"source": "outgoing", "type": "linear_out", "start_seconds": 7.75, "duration_seconds": 4.25},
                {"source": "ambience", "type": "linear_in_out", "in_seconds": 1.25, "out_start_seconds": 4.75, "out_duration_seconds": 1.25},
                {"source": "incoming", "type": "linear_in", "start_seconds": 0.0, "duration_seconds": 4.25},
            ],
            "crossfade_interval_output_frames": None,
        },
        "SAFE-UNVERIFIED-WINDOW-CROSSFADE": {
            "source_windows_seconds": {"outgoing": [87.5, 107.5], "incoming": [0.5, 20.5]},
            "source_windows_frames": {"outgoing": [4_200_000, 5_160_000], "incoming": [24_000, 984_000]},
            "output_segment_offsets_frames": [0],
            "fade_envelopes": [{"type": "equal_power_qsin_crossfade", "duration_seconds": 8.0}],
            "crossfade_interval_output_frames": [576_000, 960_000],
        },
        "GENERIC-DERIVED-EXIT-ENTRY": {
            "source_windows_seconds": {"outgoing": [110.0, 120.0], "ambience": [36.0, 38.0], "incoming": [0.0, 10.0]},
            "source_windows_frames": {"outgoing": [5_280_000, 5_760_000], "ambience": [1_728_000, 1_824_000], "incoming": [0, 480_000]},
            "output_segment_offsets_frames": [0, 480_000, 576_000],
            "fade_envelopes": [
                {"source": "outgoing", "type": "linear_out", "start_seconds": 6.0, "duration_seconds": 4.0},
                {"source": "incoming", "type": "linear_in", "start_seconds": 0.0, "duration_seconds": 4.0},
            ],
            "crossfade_interval_output_frames": None,
        },
    }
    spec = specs[treatment]
    path = Path(row["audio"]["path"])
    return {
        "transitionId": row["stable_prototype_id"],
        "outgoingCommissioningAlias": row["outgoing_alias"],
        "incomingCommissioningAlias": row["incoming_alias"],
        "outgoingPrototypeId": row["outgoing_source"]["candidate_id"],
        "incomingPrototypeId": row["incoming_source"]["candidate_id"],
        "constructionType": treatment.replace("-", "_"),
        "exact_output": {
            "sample_rate_hz": sample_rate,
            "channels": int(row["audio"]["probe"]["channels"]),
            "bits_per_sample": int(row["audio"]["probe"]["bits_per_sample"]),
            "duration_seconds": float(row["audio"]["probe"]["duration_seconds"]),
            "frames": round(float(row["audio"]["probe"]["duration_seconds"]) * sample_rate),
        },
        "offline_edit": spec,
        "runtime_dsp_scheduling_offsets": {
            "requested_deadline": None,
            "accepted_deadline": None,
            "reason": "Pre-rendered audition artifact; runtime DSP offsets are recorded per Audio Oracle execution, not invented here.",
        },
        "bpm_phrase_metadata": {
            "outgoing_bpm": None,
            "incoming_bpm": None,
            "phrase_boundary": None,
            "confidence": "UNVERIFIED",
            "reason": "No trusted downbeat, bar, phrase, or harmonic grid exists for these independent full mixes.",
        },
        "loudness_measurements": {
            "sample_peak_dbfs": row["analysis"]["signal"]["peak_dbfs"],
            "rms_dbfs": row["analysis"]["signal"]["rms_dbfs"],
            "integrated_lufs": None,
            "true_peak_dbtp": None,
            "reason": "Current technical screen records sample peak/RMS; integrated loudness and true peak remain pending measured mix review.",
        },
        "mono_compatibility": mono_technical_result(path),
        "source_and_derivative_lineage": {
            "outgoing": row["outgoing_source"],
            "incoming": row["incoming_source"],
            "ambience": row.get("ambience_source"),
            "derivative": row["audio"],
        },
        "historicalStatus": "HISTORICAL_COMMISSIONING_ALIAS",
        "historical_disposition": "PENDING_HUMAN_EDITORIAL_REVIEW",
        "cultural_review": "REQUIRED_NOT_PERFORMED",
        "machine_disposition": "TECHNICAL_FILE_FITNESS_PASS",
        "human_disposition": "PENDING",
        "rights_status": row["rights_status"],
        "fallback_and_refusal": {
            "hash_or_file_failure": "REFUSE_NO_SUBSTITUTION",
            "untrusted_timing": "AMBIENCE_OR_SILENCE_THEN_ELIGIBLE_INCOMING_CUE",
            "ineligible_upstream_alias": "REFUSE_NO_ERA_INFERENCE",
        },
    }


def publish_transitions() -> dict[str, Any]:
    source = load(TRANSITIONS_V3)
    renders: list[dict[str, Any]] = []
    for row in source["renders"]:
        if row["treatment"] == "NATURAL-ENDING-AMBIENCE-BRIDGE":
            renders.append(render_final_window(row))
        else:
            current = copy.deepcopy(row)
            current["audio"].pop("reused", None)
            current["natural_ending_claimed"] = False
            renders.append(current)
    for row in renders:
        row["metadata_contract"] = explicit_transition_contract(row)
    manifest = {
        "schema": "project-studio-rendered-era-transitions/v4",
        "generated_at_utc": stable_generated_time(TRANSITIONS_V4),
        "boundary_count": 3,
        "treatments_per_boundary": 3,
        "render_count": len(renders),
        "renders": renders,
        "source_separation_or_fake_stems": False,
        "phrase_boundary_claimed_for_rendered_files": False,
        "bespoke_boundary_specific_edit_claimed": False,
        "natural_ending_claimed_for_rendered_files": False,
        "human_acceptance": "NONE_RECORDED",
        "rights_status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "supersedes": {
            **file_record(TRANSITIONS_V3),
            "reason": "v3 used an unverified NATURAL_ENDING label for a fixed final-window fade",
        },
    }
    if len(renders) != 9 or len({row["audio"]["sha256"] for row in renders}) != 9:
        raise RuntimeError("transition v4 cardinality/unique audio identity failed")
    required_contract_keys = {
        "transitionId", "outgoingCommissioningAlias", "incomingCommissioningAlias",
        "outgoingPrototypeId", "incomingPrototypeId", "constructionType", "exact_output",
        "offline_edit", "runtime_dsp_scheduling_offsets", "bpm_phrase_metadata",
        "loudness_measurements", "mono_compatibility", "source_and_derivative_lineage",
        "historicalStatus", "historical_disposition", "cultural_review", "machine_disposition",
        "human_disposition", "rights_status", "fallback_and_refusal",
    }
    if not all(required_contract_keys <= set(row["metadata_contract"]) for row in renders):
        raise RuntimeError("transition v4 metadata contract incomplete")
    write_manifest(TRANSITIONS_V4, manifest)

    flagged: list[dict[str, Any]] = []
    canonical_paths = {Path(row["audio"]["path"]).resolve() for row in renders}
    for path in sorted(TRANSITION_ROOT.glob("*/*")):
        if not path.is_file() or path.resolve() in canonical_paths:
            continue
        if any(token in path.name for token in ("PHRASE-BOUNDARY-CROSSFADE", "BESPOKE-EXIT-ENTRY", "NATURAL-ENDING-AMBIENCE-BRIDGE")):
            flagged.append({
                "path": str(path),
                "sha256": sha256_file(path),
                "status": "SUPERSEDED_NONCANONICAL_DO_NOT_AUDITION",
                "runtime_allowlisted": False,
                "owner_package_included": False,
            })
    quarantine = {
        "schema": "project-studio-superseded-transition-quarantine/v1",
        "generated_at_utc": stable_generated_time(QUARANTINE),
        "canonical_manifest": file_record(TRANSITIONS_V4),
        "flagged_count": len(flagged),
        "files": flagged,
        "law": "Preserved evidence only; never recursively scanned, runtime-loaded, or copied to Owner package.",
    }
    write_manifest(QUARANTINE, quarantine)
    return manifest


def publish_living_diagnostics() -> dict[str, Any]:
    source = load(LIVING_V2)
    manifest = copy.deepcopy(source)
    manifest["schema"] = "project-studio-living-lot-soundscape/v3"
    labels = {
        "EARLY_PRESENTATION": ("BANDWIDTH_SPATIAL_DIAGNOSTIC_NARROW", "ASP01-LIVING-MIX-DIAGNOSTIC-NARROW-V3"),
        "MID_PRESENTATION": ("BANDWIDTH_SPATIAL_DIAGNOSTIC_INTERMEDIATE", "ASP01-LIVING-MIX-DIAGNOSTIC-INTERMEDIATE-V3"),
        "MODERN_PRESENTATION": ("BANDWIDTH_SPATIAL_DIAGNOSTIC_WIDE", "ASP01-LIVING-MIX-DIAGNOSTIC-WIDE-V3"),
    }
    for diagnostic in manifest["era_presentations"]:
        legacy_label = diagnostic["presentation"]
        presentation, stable_id = labels[legacy_label]
        diagnostic.update({
            "legacy_presentation_label": legacy_label,
            "legacy_stable_prototype_id": diagnostic["stable_prototype_id"],
            "stable_prototype_id": stable_id,
            "presentation": presentation,
            "classification": "BANDWIDTH_AND_SPATIAL_MIX_DIAGNOSTIC_ONLY",
            "commissioning_alias": None,
            "p13_technology_or_era_eligibility": None,
            "era_truth": "NONE",
            "era_proof_eligible": False,
            "historical_disposition": "NOT_APPLICABLE_TO_MIX_DIAGNOSTIC",
            "cultural_review": "REQUIRED_NOT_PERFORMED_FOR_ANY_FUTURE_ERA_SPECIFIC_CONTENT",
        })
    manifest["era_presentations_are_mix_diagnostics"] = True
    manifest["era_specific_living_lot_proof"] = "NOT_IMPLEMENTED"
    manifest["future_era_specific_requirement"] = (
        "Distinct machinery, traffic, communications, material, and production-practice assets require "
        "typed P13 eligibility plus historical and cultural review; EQ/stereo processing is insufficient."
    )
    manifest["supersedes"] = {
        **file_record(LIVING_V2),
        "reason": "v2 mix diagnostics carried misleading EARLY/MID/MODERN presentation labels",
    }
    write_manifest(LIVING_V3, manifest)
    return manifest


def main() -> None:
    register, bundles = publish_responsive()
    transitions = publish_transitions()
    living = publish_living_diagnostics()
    print(json.dumps({
        "machine_verdict": "PASS",
        "responsive_candidates": len(register["candidates"]),
        "responsive_variants": len(bundles["variants"]),
        "transition_renders": len(transitions["renders"]),
        "register_v2_sha256": sha256_file(REGISTER_V2),
        "bundles_v2_sha256": sha256_file(BUNDLES_V2),
        "transitions_v4_sha256": sha256_file(TRANSITIONS_V4),
        "quarantine_sha256": sha256_file(QUARANTINE),
        "living_v3_sha256": sha256_file(LIVING_V3),
        "living_mix_diagnostics": len(living["era_presentations"]),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
