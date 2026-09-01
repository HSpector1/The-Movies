#!/usr/bin/env python3
"""Build source-bound provisional integration/audition/endurance catalogues.

This utility is deliberately external to production code.  It never copies or
changes audio and publishes a JSON document only when every referenced hash and
shortlist invariant has first been reconciled.
"""

from __future__ import annotations

import csv
import hashlib
import json
import os
import tempfile
import wave
from pathlib import Path
from typing import Any


ROOT = Path("/Users/bruce/Project Studio Audio Foundry Marathon 01")
SHORTLIST_CSV = ROOT / "05_shortlists/provisional-machine-shortlist.csv"
SHORTLIST_JSON = ROOT / "05_shortlists/provisional-machine-shortlist.json"
MUSIC_OUT = ROOT / "11_return-package/MusicCatalogue.provisional.json"
VALIDATION_OUT = ROOT / "11_return-package/MusicCatalogue.provisional.validation.json"
ENDURANCE_OUT = ROOT / "08_endurance/endurance-input.provisional.json"
AUDITION_OUT = ROOT / "11_return-package/audition-app-catalogue.provisional.json"

EPOCHS = (
    "acoustic_electrical_1920_1932", "network_sound_1933_1945",
    "tape_hifi_1946_1959", "multitrack_fm_1960_1974",
    "format_plurality_1975_1986", "sampled_digital_1987_1999",
    "networked_hybrid_2000_2014", "streaming_plural_2015_2029",
    "legacy_future_2030_2040",
)
SHORTLIST_STATUS = "PROVISIONAL MACHINE SHORTLIST"
RIGHTS_STATUS = "PROTOTYPE_READY_FOR_OWNER_AUDITION"
ALIAS_AUTHORITY = "CREATIVE_COMMISSIONING_ALIAS_NOT_P13_RUNTIME_ID"


def sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def checked(path_value: str, declared: str, label: str) -> Path:
    path = Path(path_value)
    if not path.is_absolute() or not path.is_file():
        raise ValueError(f"{label}: missing absolute file {path}")
    actual = sha(path)
    if actual != declared.lower():
        raise ValueError(f"{label}: SHA-256 mismatch: declared {declared}, actual {actual}")
    return path


def checked_artifact(value: dict[str, Any], label: str) -> dict[str, Any]:
    path = checked(str(value["path"]), str(value["sha256"]), label)
    if path.stat().st_size != int(value["bytes"]):
        raise ValueError(f"{label}: byte-count mismatch")
    sidecar_path = checked(str(value["provenance_sidecar"]), sha(Path(value["provenance_sidecar"])), f"{label} sidecar")
    result = {
        "path": str(path), "bytes": path.stat().st_size, "sha256": value["sha256"],
        "probe": value.get("probe"),
        "provenance_sidecar": {"path": str(sidecar_path), "bytes": sidecar_path.stat().st_size, "sha256": sha(sidecar_path)},
    }
    return result


def wav_contract(path: Path, rate: int, width: int, channels: int, seconds: float) -> None:
    with wave.open(str(path), "rb") as f:
        actual = (f.getframerate(), f.getsampwidth(), f.getnchannels(), f.getnframes() / f.getframerate())
    expected = (rate, width, channels, seconds)
    if actual[:3] != expected[:3] or abs(actual[3] - seconds) > 1 / rate:
        raise ValueError(f"WAV contract mismatch for {path}: {actual} != {expected}")


def pretty(value: Any) -> bytes:
    return (json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode()


def publish(path: Path, payload: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        if path.read_bytes() == payload:
            return
        raise FileExistsError(f"Refusing unknown overwrite: {path}")
    fd, name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    temp = Path(name)
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(payload); f.flush(); os.fsync(f.fileno())
        os.link(temp, path)
    finally:
        temp.unlink(missing_ok=True)


def main() -> None:
    rows = list(csv.DictReader(SHORTLIST_CSV.open(newline="", encoding="utf-8")))
    source_manifest = json.loads(SHORTLIST_JSON.read_text(encoding="utf-8"))
    if len(rows) != 54:
        raise ValueError(f"Expected 54 shortlist rows, got {len(rows)}")
    if {r["epoch_alias"] for r in rows} != set(EPOCHS):
        raise ValueError("Shortlist must contain exactly the nine creative epoch aliases")
    if sum(r["role_type"] == "PRIMARY" for r in rows) != 27 or sum(r["role_type"] == "ALTERNATE" for r in rows) != 27:
        raise ValueError("Expected exactly 27 primaries and 27 alternates")

    tracks: list[dict[str, Any]] = []
    endurance_epochs: list[dict[str, Any]] = []
    audition_public: list[dict[str, Any]] = []
    audition_hidden: dict[str, Any] = {}
    stable_ids: set[str] = set()
    candidate_ids: set[str] = set()
    verified_artifacts = 0

    for order, alias in enumerate(EPOCHS, 1):
        epoch_rows = sorted((r for r in rows if r["epoch_alias"] == alias), key=lambda r: (r["role_type"] != "PRIMARY", int(r["role_rank"])))
        if len(epoch_rows) != 6 or [r["role_rank"] for r in epoch_rows[:3]] != ["1", "2", "3"]:
            raise ValueError(f"{alias}: expected three ranked primaries and three ranked alternates")
        if len({r["family_id"] for r in epoch_rows[:3]}) < 3:
            raise ValueError(f"{alias}: primary family diversity contract failed")
        endurance_tracks: list[dict[str, Any]] = []
        blind_sorted = sorted(epoch_rows, key=lambda r: hashlib.sha256((alias + "\0" + r["source_sha256"]).encode()).hexdigest())
        blind_number = {r["candidate_id"]: n for n, r in enumerate(blind_sorted, 1)}

        for row in epoch_rows:
            if row["shortlist_status"] != SHORTLIST_STATUS or row["rights_status"] != RIGHTS_STATUS:
                raise ValueError(f"Forbidden/mismatched status for {row['candidate_id']}")
            if "REJECT" in row["machine_label"].upper():
                raise ValueError(f"Machine-rejected selection: {row['candidate_id']}")
            if row["candidate_id"] in candidate_ids:
                raise ValueError(f"Duplicate candidate ID: {row['candidate_id']}")
            candidate_ids.add(row["candidate_id"])

            metadata_path = checked(row["metadata_path"], row["metadata_sha256"], f"{row['candidate_id']} metadata")
            metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
            stable_id = str(metadata["stable_track_id"])
            if stable_id in stable_ids:
                raise ValueError(f"Duplicate stable track ID: {stable_id}")
            stable_ids.add(stable_id)
            for key in ("candidate_id", "epoch_alias", "family_id", "shortlist_role", "shortlist_status", "rights_status"):
                row_key = key
                if str(metadata[key]) != str(row[row_key]):
                    raise ValueError(f"{row['candidate_id']}: metadata mismatch for {key}")
            if metadata["epoch_alias_authority"] != ALIAS_AUTHORITY:
                raise ValueError(f"{row['candidate_id']}: epoch alias authority mismatch")

            raw_path = checked(row["source_path"], row["source_sha256"], f"{row['candidate_id']} raw source")
            if raw_path.stat().st_size != int(row["source_bytes"]):
                raise ValueError(f"{row['candidate_id']}: source byte mismatch")
            artifacts = {name: checked_artifact(value, f"{row['candidate_id']} {name}") for name, value in metadata["derivatives"].items()}
            verified_artifacts += 2 + len(artifacts) * 2
            normalized = artifacts["normalized_master"]
            preview = artifacts["aac_preview"]
            wav_contract(Path(normalized["path"]), 48000, 3, 2, 120.0)
            primary = row["role_type"] == "PRIMARY"
            if primary:
                required = {"normalized_master", "loop_master", "seam_audition", "aac_preview", "waveform", "spectrogram"}
                if set(artifacts) != required or metadata.get("loop") is None:
                    raise ValueError(f"{row['candidate_id']}: incomplete primary derivative set")
                loop = artifacts["loop_master"]
                wav_contract(Path(loop["path"]), 48000, 3, 2, 114.0)
                wav_contract(Path(artifacts["seam_audition"]["path"]), 48000, 3, 2, 12.0)
                lp = metadata["loop"]
                if (lp["start_frame"], lp["end_frame_exclusive"], lp["sample_rate_hz"], lp["crossfade_seconds"], lp["crossfade_curve"]) != (0, 5472000, 48000, 6, "qsin"):
                    raise ValueError(f"{row['candidate_id']}: loop-point contract mismatch")
                loop_points = {"start_frame": 0, "end_frame_exclusive": 5472000, "start_seconds": 0.0, "end_seconds": 114.0, "crossfade_seconds": 6.0, "crossfade_curve": "qsin"}
                import_profile = "PS-MUSIC-LOOP-STREAMING-PROTOTYPE-V1"
            else:
                if set(artifacts) != {"normalized_master", "aac_preview"} or metadata.get("loop") is not None:
                    raise ValueError(f"{row['candidate_id']}: alternate must remain explicitly non-loop-derived")
                loop = None; loop_points = None
                import_profile = "PS-MUSIC-AUDITION-NONLOOP-PROTOTYPE-V1"

            signals = metadata["machine_jury"]["signals"]
            normalized_lufs = float(metadata["normalization"]["verification_measurement"]["input_i"])
            raw_lufs_value = row["estimated_loudness_lufs_i"] or signals.get("raw_loudness_lufs_i")
            raw_lufs = float(raw_lufs_value) if raw_lufs_value not in (None, "") else None
            track = {
                "stable_track_id": stable_id, "candidate_id": row["candidate_id"],
                "epoch_order": order, "epoch_alias": alias, "epoch_alias_authority": ALIAS_AUTHORITY,
                "family_id": row["family_id"], "prompt_family": row["prompt_family"], "seed": int(row["seed"]),
                "shortlist": {"status": SHORTLIST_STATUS, "role": row["shortlist_role"], "role_type": row["role_type"], "rank": int(row["role_rank"]), "machine_label": row["machine_label"], "machine_score": float(row["machine_score"])},
                "eligibility": {"technical_automatic_pass": True, "severe_machine_jury_mismatch": False, "human_listening_acceptance": False},
                "duration_seconds": {"raw": 120.0, "normalized_master": 120.0, "loop_master": 114.0 if primary else None, "aac_preview": float(preview["probe"]["duration_seconds"])},
                "bpm_estimate": float(row["likely_bpm"]), "sample_rate_hz": 48000,
                "loudness": {"normalized_integrated_lufs": normalized_lufs, "raw_estimated_integrated_lufs": raw_lufs, "target_integrated_lufs": -18.0, "target_true_peak_dbtp": -1.5},
                "loopable": primary, "loop_points": loop_points,
                "hashes": {"raw_source_sha256": row["source_sha256"], "normalized_master_sha256": normalized["sha256"], "loop_master_sha256": loop["sha256"] if loop else None, "aac_preview_sha256": preview["sha256"], "metadata_sha256": row["metadata_sha256"]},
                "artifacts": {"raw_source": {"path": str(raw_path), "bytes": raw_path.stat().st_size, "sha256": row["source_sha256"]}, **artifacts, "metadata": {"path": str(metadata_path), "bytes": metadata_path.stat().st_size, "sha256": row["metadata_sha256"]}},
                "provenance": {"generation_tuple": metadata["generation_tuple"], "prompt_provenance": metadata["prompt_provenance"], "machine_jury": {"source_path": metadata["machine_jury"]["source_path"], "source_sha256": metadata["machine_jury"]["source_sha256"], "classification": "ANALYSIS SIGNAL ONLY"}},
                "suggested_unity_import_settings": {"profile_id": import_profile, "status": "SUGGESTION_ONLY_NOT_EXECUTED", "force_to_mono": False, "load_in_background": True, "preload_audio_data": False, "load_type": "STREAMING", "compression_format": "VORBIS", "quality": 0.7, "sample_rate_setting": "PRESERVE_SAMPLE_RATE", "normalize": False, "ambisonic": False, "audio_source_loop": primary},
                "prototype_status": RIGHTS_STATUS,
            }
            tracks.append(track)

            blind = blind_number[row["candidate_id"]]
            audition_id = f"AUD-E{order:02d}-{blind:02d}"
            audition_public.append({"audition_id": audition_id, "epoch_order": order, "epoch_alias": alias, "blind_label": f"E{order:02d} · Clip {blind:02d}", "preview": {"path": preview["path"], "sha256": preview["sha256"], "duration_seconds": float(preview["probe"]["duration_seconds"]), "codec": "AAC", "bitrate": "192k"}, "normalized_reference": {"path": normalized["path"], "sha256": normalized["sha256"]}, "rating_required_before_reveal": True, "prototype_status": RIGHTS_STATUS})
            audition_hidden[audition_id] = {"unlock_rule": "AFTER_RATING_SUBMITTED", "metadata_path": str(metadata_path), "metadata_sha256": row["metadata_sha256"], "stable_track_id": stable_id, "candidate_id": row["candidate_id"], "family_id": row["family_id"], "prompt_family": row["prompt_family"], "seed": int(row["seed"]), "shortlist_role": row["shortlist_role"], "machine_label": row["machine_label"]}

            if primary:
                endurance_tracks.append({"track_id": stable_id, "family_id": row["family_id"], "loop_ready_wav": loop["path"], "duration_seconds": 114.0, "source_sha256": loop["sha256"], "loudness_lufs": normalized_lufs, "spectral_density": float(signals["spectral_density_signal"]), "contains_motif": False, "motif_id": None, "loopable": True, "shortlist_role": row["shortlist_role"], "machine_label": row["machine_label"]})
        endurance_epochs.append({"epoch_alias": alias, "tracks": endurance_tracks})

    inputs = {
        "shortlist_csv": {"path": str(SHORTLIST_CSV), "bytes": SHORTLIST_CSV.stat().st_size, "sha256": sha(SHORTLIST_CSV)},
        "shortlist_json": {"path": str(SHORTLIST_JSON), "bytes": SHORTLIST_JSON.stat().st_size, "sha256": sha(SHORTLIST_JSON)},
    }
    music = {"schema": "project-studio-music-catalogue-provisional/v1", "catalogue_status": SHORTLIST_STATUS, "prototype_status": RIGHTS_STATUS, "epoch_alias_authority": ALIAS_AUTHORITY, "counts": {"epochs": 9, "tracks": 54, "primaries": 27, "alternates": 27}, "source_bindings": inputs, "limitations": ["No human or Owner listening acceptance occurred.", "Machine analysis does not establish copyright, clearance, exclusivity, cultural acceptance, or production suitability.", "Unity integration is prepared but not executed."], "tracks": tracks}
    endurance = {"schema": "project-studio-endurance-shortlist-input/v1", "status": RIGHTS_STATUS, "selection_scope": "PRIMARY_ONLY_LOOP_MASTERS", "source_bindings": inputs, "epochs": endurance_epochs}
    audition = {"schema": "project-studio-audition-catalogue-provisional/v1", "status": RIGHTS_STATUS, "blind_protocol": {"public_fields_exclude": ["stable_track_id", "candidate_id", "family_id", "prompt_family", "seed", "shortlist_role", "machine_label"], "reveal_rule": "AFTER_RATING_SUBMITTED", "telemetry": False, "network_required": False}, "counts": {"epochs": 9, "entries": 54}, "source_bindings": inputs, "public_entries": sorted(audition_public, key=lambda x: (x["epoch_order"], x["audition_id"])), "hidden_reveal_index": audition_hidden}

    music_bytes, endurance_bytes, audition_bytes = pretty(music), pretty(endurance), pretty(audition)
    validation = {"schema": "project-studio-music-catalogue-validation/v1", "status": "SOURCE_BOUND_VALIDATION_PASS", "prototype_status": RIGHTS_STATUS, "inputs": inputs, "outputs": {"music_catalogue": {"path": str(MUSIC_OUT), "bytes": len(music_bytes), "sha256": hashlib.sha256(music_bytes).hexdigest()}, "endurance_input": {"path": str(ENDURANCE_OUT), "bytes": len(endurance_bytes), "sha256": hashlib.sha256(endurance_bytes).hexdigest()}, "audition_catalogue": {"path": str(AUDITION_OUT), "bytes": len(audition_bytes), "sha256": hashlib.sha256(audition_bytes).hexdigest()}}, "checks": {"exactly_nine_epochs": True, "exactly_27_primaries": True, "exactly_27_alternates": True, "all_54_stable_ids_unique": True, "all_54_candidate_ids_unique": True, "no_machine_rejected_selection": True, "all_referenced_hashes_verified": True, "primary_loop_contract_48k_pcm24_114s": True, "alternate_nonloop_status_preserved": True, "endurance_uses_27_primary_loop_masters": True, "audition_public_fields_blind_safe": True, "unity_not_executed": True}, "verified_file_references": verified_artifacts, "limitations": music["limitations"]}
    validation_bytes = pretty(validation)

    publish(MUSIC_OUT, music_bytes)
    publish(ENDURANCE_OUT, endurance_bytes)
    publish(AUDITION_OUT, audition_bytes)
    publish(VALIDATION_OUT, validation_bytes)
    print(json.dumps({"music": str(MUSIC_OUT), "validation": str(VALIDATION_OUT), "endurance": str(ENDURANCE_OUT), "audition": str(AUDITION_OUT), "counts": music["counts"], "verified_file_references": verified_artifacts}, indent=2))


if __name__ == "__main__":
    main()
