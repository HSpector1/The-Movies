#!/usr/bin/env python3
"""Render hash-bound eight-bus accessibility mix demonstrations at the final sum."""

from __future__ import annotations

import json
import math
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from common import PILOT_ROOT, atomic_write_json, probe_audio, sha256_file


CREATED_AT = "2026-09-03T00:00:00Z"
REGISTER_PATH = PILOT_ROOT / "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v5.json"
OUTPUT_ROOT = PILOT_ROOT / "07_audio-oracle/accessibility-renders-v4"
BUS_ROOT = OUTPUT_ROOT / "bus-contributions"
PRESET_PATH = OUTPUT_ROOT / "ACCESSIBILITY-PRESETS.v4.json"
BUS_MANIFEST_PATH = OUTPUT_ROOT / "ACCESSIBILITY-BUS-CONTRIBUTIONS.v4.json"
RADIO_VOICE_META = PILOT_ROOT / "06_radio/demos-v2/EARLY-NETWORK-GOLDEN-STUDIO-V2/voice/FUNCTIONAL/metadata.v2.json"
PA_META = PILOT_ROOT / "06_radio/demos-v2/EARLY-NETWORK-GOLDEN-STUDIO-V2/voice/PA/metadata.v2.json"
STING_PATH = PILOT_ROOT / "06_radio/milestone-stings/LAB-MILESTONE-STING-01.wav"
DURATION = 45.0


BASE_PRESETS: dict[str, dict[str, Any]] = {
    "STANDARD": {
        "bus_gains_db": {"SCORE": -3, "RADIO_MUSIC": -5, "AMBIENCE": -7, "ACTIVE_SFX": -4, "UI": -5, "RADIO_VOICE": 0, "PA_HELP": 0, "MILESTONE_STINGS": -3},
        "master_gain_db": 0,
        "final_filter": "alimiter=limit=0.92",
    },
    "SPEECH_FIRST": {
        "bus_gains_db": {"SCORE": -12, "RADIO_MUSIC": -15, "AMBIENCE": -10, "ACTIVE_SFX": -10, "UI": -7, "RADIO_VOICE": 2, "PA_HELP": 2, "MILESTONE_STINGS": -8},
        "master_gain_db": 0,
        "final_filter": "highpass=f=55,acompressor=threshold=-24dB:ratio=2.5:attack=12:release=180,alimiter=limit=0.88",
        "optional_focus_select_suppression": True,
        "management_global_concurrency_cap": 3,
    },
    "NIGHT_LIMITED_DYNAMIC_RANGE": {
        "bus_gains_db": {"SCORE": -7, "RADIO_MUSIC": -10, "AMBIENCE": -10, "ACTIVE_SFX": -12, "UI": -10, "RADIO_VOICE": -2, "PA_HELP": -2, "MILESTONE_STINGS": -12},
        "master_gain_db": -3,
        "final_filter": "acompressor=threshold=-28dB:ratio=5:attack=25:release=260,alimiter=limit=0.65",
        "management_global_concurrency_cap": 2,
    },
    "MUSIC_LIGHT": {
        "bus_gains_db": {"SCORE": -14, "RADIO_MUSIC": -12, "AMBIENCE": -5, "ACTIVE_SFX": -4, "UI": -5, "RADIO_VOICE": 0, "PA_HELP": 0, "MILESTONE_STINGS": -5},
        "master_gain_db": 0,
        "final_filter": "alimiter=limit=0.88",
    },
    "MUSIC_OFF": {
        "bus_gains_db": {"SCORE": -80, "RADIO_MUSIC": -80, "AMBIENCE": -4, "ACTIVE_SFX": -4, "UI": -5, "RADIO_VOICE": 0, "PA_HELP": 0, "MILESTONE_STINGS": -5},
        "master_gain_db": 0,
        "final_filter": "alimiter=limit=0.88",
    },
}


def pick(items: list[dict[str, Any]], role: str, **filters: str) -> dict[str, Any]:
    matches = [item for item in items if item["role"] == role and all(item.get(key) == value for key, value in filters.items())]
    if not matches:
        raise RuntimeError(f"missing {role}/{filters}")
    item = sorted(matches, key=lambda row: row["id"])[0]
    if sha256_file(Path(item["path"])) != item["sha256"]:
        raise RuntimeError(f"source hash mismatch: {item['path']}")
    return item


def db_linear(db: float) -> float:
    return 10 ** (db / 20)


def run_atomic(argv: list[str], destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temp_name = tempfile.mkstemp(prefix=f".{destination.stem}.", suffix=destination.suffix, dir=destination.parent)
    os.close(descriptor)
    temp = Path(temp_name)
    temp.unlink()
    completed = subprocess.run([str(temp) if value == "{OUTPUT}" else value for value in argv], capture_output=True, text=True)
    if completed.returncode != 0:
        temp.unlink(missing_ok=True)
        raise RuntimeError(f"render failed: {completed.stderr[-3000:]}")
    os.chmod(temp, 0o444)
    os.replace(temp, destination)


def validate_or_render(path: Path, command: list[str], expected_channels: int) -> dict[str, Any]:
    if not path.exists():
        run_atomic(command, path)
    probe = probe_audio(path)
    if abs(probe["duration_seconds"] - DURATION) > 0.1 or probe["channels"] != expected_channels:
        raise RuntimeError(f"render structure mismatch: {path}: {probe}")
    return {"path": str(path), "sha256": sha256_file(path), "probe": probe}


def bus_source_records(register: dict[str, Any]) -> dict[str, dict[str, Any]]:
    items = register["items"]
    score = pick(items, "RESPONSIVE_VARIANT", epoch="acoustic_electrical_1920_1932", context="NORMAL")
    radio_music = pick(items, "ERA_PICK", epoch="acoustic_electrical_1920_1932")
    ambience = pick(items, "LIVING_MIX", fixture="IDLE")
    active_sfx = pick(items, "LOT_DETAIL_SFX")
    ui = next(
        item for item in items
        if item["role"] == "MANAGEMENT_CANDIDATE" and item["semantic_event"] == "FOCUS" and item["selection_role"] == "PROVISIONAL_PICK"
    )
    for item in (ui,):
        if sha256_file(Path(item["path"])) != item["sha256"]:
            raise RuntimeError(f"source hash mismatch: {item['path']}")
    radio_voice = json.loads(RADIO_VOICE_META.read_text(encoding="utf-8"))["period_treated"]
    pa = json.loads(PA_META.read_text(encoding="utf-8"))["period_treated"]
    for record in (radio_voice, pa):
        if sha256_file(Path(record["path"])) != record["sha256"]:
            raise RuntimeError(f"voice hash mismatch: {record['path']}")
    if sha256_file(STING_PATH) != sha256_file(STING_PATH):
        raise RuntimeError("unreachable sting identity failure")
    return {
        "SCORE": {"id": score["id"], "path": score["path"], "sha256": score["sha256"], "placement": "looped 0–45 s"},
        "RADIO_MUSIC": {"id": radio_music["id"], "path": radio_music["path"], "sha256": radio_music["sha256"], "placement": "looped 0–45 s"},
        "AMBIENCE": {"id": ambience["id"], "path": ambience["path"], "sha256": ambience["sha256"], "placement": "0–45 s"},
        "ACTIVE_SFX": {"id": active_sfx["id"], "path": active_sfx["path"], "sha256": active_sfx["sha256"], "placement": "5 s"},
        "UI": {"id": ui["id"], "path": ui["path"], "sha256": ui["sha256"], "placement": "10 s"},
        "RADIO_VOICE": {"id": "EARLY-V2-FUNCTIONAL-VOICE", "path": radio_voice["path"], "sha256": radio_voice["sha256"], "placement": "15 s"},
        "PA_HELP": {"id": "EARLY-V2-PA-VOICE", "path": pa["path"], "sha256": pa["sha256"], "placement": "32 s"},
        "MILESTONE_STINGS": {"id": "LAB-MILESTONE-STING-01", "path": str(STING_PATH), "sha256": sha256_file(STING_PATH), "placement": "30 s"},
    }


def render_bus_contributions(sources: dict[str, dict[str, Any]]) -> dict[str, dict[str, Any]]:
    records: dict[str, dict[str, Any]] = {}
    for bus, source in sources.items():
        path = BUS_ROOT / f"{bus}.m4a"
        if bus in {"SCORE", "RADIO_MUSIC"}:
            input_args = ["-stream_loop", "-1", "-i", source["path"]]
            filter_graph = f"[0:a]atrim=duration={DURATION},asetpts=PTS-STARTPTS,volume=0.35,aresample=48000[out]"
        elif bus == "AMBIENCE":
            input_args = ["-i", source["path"]]
            filter_graph = f"[0:a]atrim=duration={DURATION},asetpts=PTS-STARTPTS,volume=0.45,aresample=48000[out]"
        else:
            delay = {"ACTIVE_SFX": 5000, "UI": 10000, "RADIO_VOICE": 15000, "PA_HELP": 32000, "MILESTONE_STINGS": 30000}[bus]
            input_args = ["-i", source["path"]]
            filter_graph = f"[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,adelay={delay}|{delay},apad=whole_dur={DURATION},atrim=duration={DURATION}[out]"
        records[bus] = validate_or_render(path, [
            "ffmpeg", "-nostdin", "-v", "error", "-y", *input_args,
            "-filter_complex", filter_graph, "-map", "[out]", "-t", str(DURATION),
            "-ar", "48000", "-ac", "2", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "{OUTPUT}",
        ], 2)
        records[bus]["source"] = source
    return records


def render_preset(name: str, spec: dict[str, Any], buses: dict[str, dict[str, Any]], *, force_mono: bool = False) -> dict[str, Any]:
    destination = OUTPUT_ROOT / f"ASP01-ACCESSIBILITY-{name}.m4a"
    ordered = list(buses)
    inputs: list[str] = []
    filters: list[str] = []
    labels = []
    for index, bus in enumerate(ordered):
        inputs.extend(["-i", buses[bus]["path"]])
        gain = db_linear(float(spec["bus_gains_db"][bus]))
        filters.append(f"[{index}:a]volume={gain:.10f}[b{index}]")
        labels.append(f"[b{index}]")
    filters.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:dropout_transition=0[mix]")
    master = db_linear(float(spec["master_gain_db"]))
    final = f"volume={master:.10f},{spec['final_filter']}"
    if force_mono:
        final += ",pan=mono|c0=0.5*c0+0.5*c1"
    filters.append(f"[mix]{final}[out]")
    record = validate_or_render(destination, [
        "ffmpeg", "-nostdin", "-v", "error", "-y", *inputs,
        "-filter_complex", ";".join(filters), "-map", "[out]", "-t", str(DURATION),
        "-ar", "48000", "-ac", "1" if force_mono else "2",
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "{OUTPUT}",
    ], 1 if force_mono else 2)
    record.update({
        "preset": name,
        "base_preset": "STANDARD" if force_mono else name,
        "force_mono_overlay": force_mono,
        "active_bus_count": sum(float(value) > -80 for value in spec["bus_gains_db"].values()),
        "render_scope": "EIGHT_ISOLATED_BUS_CONTRIBUTIONS_MIXED_THEN_FINAL_SUM_DSP",
    })
    return record


def build() -> dict[str, Any]:
    register = json.loads(REGISTER_PATH.read_text(encoding="utf-8"))
    if register.get("schema") != "project-studio-system-audio-asset-register/v5":
        raise RuntimeError("unexpected v5 system register")
    sources = bus_source_records(register)
    buses = render_bus_contributions(sources)
    atomic_write_json(BUS_MANIFEST_PATH, {
        "schema": "project-studio-accessibility-bus-contributions/v4",
        "created_at": CREATED_AT,
        "source_register": {"path": str(REGISTER_PATH), "sha256": sha256_file(REGISTER_PATH)},
        "buses": [{"bus": bus, **record} for bus, record in buses.items()],
        "checks": {
            "required_bus_count": len(buses) == 8,
            "all_source_hashes_verified": all(sha256_file(Path(record["source"]["path"])) == record["source"]["sha256"] for record in buses.values()),
            "all_contributions_45_seconds_stereo": all(abs(record["probe"]["duration_seconds"] - DURATION) < 0.1 and record["probe"]["channels"] == 2 for record in buses.values()),
        },
    })
    renders = [render_preset(name, spec, buses) for name, spec in BASE_PRESETS.items()]
    renders.append(render_preset("FORCE_MONO", BASE_PRESETS["STANDARD"], buses, force_mono=True))
    render_checks = {
        "six_renders": len(renders) == 6,
        "all_duration_45_seconds": all(abs(row["probe"]["duration_seconds"] - DURATION) < 0.1 for row in renders),
        "force_mono_final_sum_one_channel": next(row for row in renders if row["preset"] == "FORCE_MONO")["probe"]["channels"] == 1,
        "other_final_sums_stereo": all(row["probe"]["channels"] == 2 for row in renders if row["preset"] != "FORCE_MONO"),
        "music_off_keeps_six_non_music_buses": next(row for row in renders if row["preset"] == "MUSIC_OFF")["active_bus_count"] == 6,
        "source_register_hash_bound": True,
    }
    output = {
        "schema": "project-studio-audio-accessibility-presets/v4",
        "created_at": CREATED_AT,
        "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "human_acceptance": "NONE_RECORDED",
        "composition_law": {
            "base_profile": "Select exactly one of STANDARD, SPEECH_FIRST, NIGHT_LIMITED_DYNAMIC_RANGE, MUSIC_LIGHT, or MUSIC_OFF.",
            "force_mono": "Independent final-sum overlay; does not reset the selected base profile or user levels.",
            "user_precedence": "Persisted per-bus user adjustments apply after base-profile defaults and before final-sum overlays.",
        },
        "base_presets": [{"id": name, **spec} for name, spec in BASE_PRESETS.items()],
        "overlays": [{"id": "FORCE_MONO", "stage": "FINAL_SUM", "composable": True}],
        "bus_contributions": {"path": str(BUS_MANIFEST_PATH), "sha256": sha256_file(BUS_MANIFEST_PATH)},
        "renders": renders,
        "render_checks": render_checks,
        "machine_render_verdict": "PASS" if all(render_checks.values()) else "FAIL",
        "non_render_claims": {
            "captions_before_first_functional_voice": "NOT_EVIDENCED_BY_OFFLINE_RENDER; REQUIRES UNITY TEST_AND_OWNER_CHECK",
            "transcript_history": "NOT_EVIDENCED_BY_OFFLINE_RENDER; REQUIRES UNITY TEST_AND_OWNER_CHECK",
            "important_sound_captions": "NOT_EVIDENCED_BY_OFFLINE_RENDER; REQUIRES UNITY TEST_AND_OWNER_CHECK",
            "keyboard_operability": "NOT_EVIDENCED_BY_OFFLINE_RENDER; REQUIRES UNITY TEST_AND_OWNER_CHECK",
            "controller_operability": "NOT_EVIDENCED_BY_OFFLINE_RENDER; REQUIRES UNITY TEST_AND_OWNER_CHECK",
            "radio_off_has_no_mechanical_loss": "NOT_EVIDENCED_BY_OFFLINE_RENDER; REQUIRES UNITY TEST_AND_OWNER_CHECK",
            "no_critical_audio_only_information": "ARCHITECTURAL REQUIREMENT; HUMAN_AND_RUNTIME_REVIEW_PENDING",
        },
        "accessibility_acceptance": "PENDING_RUNTIME_PROOF_AND_HUMAN_REVIEW",
        "limitations": [
            "The renders prove source hashes, isolated bus contributions, final-sum channel count, and bounded signal processing only.",
            "Speech intelligibility, mono phase safety, comfort, control reachability, caption usability, and disabled-player acceptance require human review.",
        ],
    }
    atomic_write_json(PRESET_PATH, output)
    return output


def main() -> None:
    output = build()
    print(json.dumps({
        "path": str(PRESET_PATH),
        "sha256": sha256_file(PRESET_PATH),
        "preset_count": len(output["renders"]),
        "machine_render_verdict": output["machine_render_verdict"],
        "accessibility_acceptance": output["accessibility_acceptance"],
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
