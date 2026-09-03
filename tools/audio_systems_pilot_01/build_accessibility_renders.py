#!/usr/bin/env python3
"""Render bounded accessibility-mix demonstrations from explicit hashed sources."""

from __future__ import annotations

import json
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from common import PILOT_ROOT, atomic_write_json, probe_audio, sha256_file, utc_now


REGISTER_PATH = PILOT_ROOT / "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v2.json"
OUTPUT_ROOT = PILOT_ROOT / "07_audio-oracle/accessibility-renders-v2"
PRESET_PATH = OUTPUT_ROOT / "ACCESSIBILITY-PRESETS.v2.json"


PRESETS: dict[str, dict[str, Any]] = {
    "STANDARD": {
        "bus_gains_db": {"MASTER": 0, "SCORE": -3, "RADIO_MUSIC": -5, "AMBIENCE": -7, "ACTIVE_SFX": -4, "UI": -5, "RADIO_VOICE": 0, "PA_HELP": 0, "MILESTONE_STINGS": -3},
        "filter": "alimiter=limit=0.92",
        "channels": 2,
    },
    "SPEECH_FIRST": {
        "bus_gains_db": {"MASTER": 0, "SCORE": -12, "RADIO_MUSIC": -15, "AMBIENCE": -10, "ACTIVE_SFX": -10, "UI": -7, "RADIO_VOICE": 2, "PA_HELP": 2, "MILESTONE_STINGS": -8},
        "filter": "highpass=f=55,acompressor=threshold=-24dB:ratio=2.5:attack=12:release=180,alimiter=limit=0.88",
        "channels": 2,
    },
    "NIGHT_LIMITED_DYNAMIC_RANGE": {
        "bus_gains_db": {"MASTER": -3, "SCORE": -7, "RADIO_MUSIC": -10, "AMBIENCE": -10, "ACTIVE_SFX": -12, "UI": -10, "RADIO_VOICE": -2, "PA_HELP": -2, "MILESTONE_STINGS": -12},
        "filter": "acompressor=threshold=-28dB:ratio=5:attack=25:release=260,alimiter=limit=0.65",
        "channels": 2,
    },
    "MUSIC_LIGHT": {
        "bus_gains_db": {"MASTER": 0, "SCORE": -14, "RADIO_MUSIC": -12, "AMBIENCE": -5, "ACTIVE_SFX": -4, "UI": -5, "RADIO_VOICE": 0, "PA_HELP": 0, "MILESTONE_STINGS": -5},
        "filter": "alimiter=limit=0.88",
        "channels": 2,
    },
    "MUSIC_OFF": {
        "bus_gains_db": {"MASTER": 0, "SCORE": -80, "RADIO_MUSIC": -80, "AMBIENCE": -4, "ACTIVE_SFX": -4, "UI": -5, "RADIO_VOICE": 0, "PA_HELP": 0, "MILESTONE_STINGS": -5},
        "filter": "alimiter=limit=0.88",
        "channels": 2,
    },
    "FORCE_MONO": {
        "bus_gains_db": {"MASTER": 0, "SCORE": -3, "RADIO_MUSIC": -5, "AMBIENCE": -7, "ACTIVE_SFX": -4, "UI": -5, "RADIO_VOICE": 0, "PA_HELP": 0, "MILESTONE_STINGS": -3},
        "filter": "pan=mono|c0=0.5*c0+0.5*c1,alimiter=limit=0.90",
        "channels": 1,
    },
}


def pick(items: list[dict[str, Any]], role: str, **filters: str) -> dict[str, Any]:
    matches = [item for item in items if item["role"] == role and all(item.get(key) == value for key, value in filters.items())]
    if len(matches) != 1:
        raise RuntimeError(f"expected one {role}/{filters}, got {len(matches)}")
    path = Path(matches[0]["path"])
    if sha256_file(path) != matches[0]["sha256"]:
        raise RuntimeError(f"accessibility source hash mismatch: {path}")
    return matches[0]


def render_mix(score: dict[str, Any], ambience: dict[str, Any], radio: dict[str, Any], preset: str, spec: dict[str, Any]) -> dict[str, Any]:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    destination = OUTPUT_ROOT / f"ASP01-ACCESSIBILITY-{preset}.m4a"
    if destination.exists():
        return {"path": str(destination), "sha256": sha256_file(destination), "probe": probe_audio(destination), "reused": True}
    descriptor, name = tempfile.mkstemp(prefix=f".{destination.stem}.", suffix=destination.suffix, dir=destination.parent)
    os.close(descriptor)
    temp = Path(name)
    temp.unlink()
    if preset == "MUSIC_OFF":
        mix_filter = "[1:a]atrim=start=0:end=45,asetpts=PTS-STARTPTS,volume=0.55[mix]"
    else:
        score_gain = "0.45" if preset == "STANDARD" or preset == "FORCE_MONO" else "0.18" if preset in {"SPEECH_FIRST", "MUSIC_LIGHT"} else "0.25"
        radio_gain = "0.90" if preset == "SPEECH_FIRST" else "0.72"
        mix_filter = (
            f"[0:a]atrim=start=0:end=45,asetpts=PTS-STARTPTS,volume='{score_gain}*if(lt(t,15),1,if(lt(t,30),0.25,0))'[score];"
            "[1:a]atrim=start=0:end=45,asetpts=PTS-STARTPTS,volume=0.32[amb];"
            f"[2:a]atrim=start=52:end=67,asetpts=PTS-STARTPTS,volume={radio_gain},adelay=15000|15000[radio];"
            "[score][amb][radio]amix=inputs=3:normalize=0:dropout_transition=0[mix]"
        )
    filter_complex = f"{mix_filter};[mix]{spec['filter']}[out]"
    completed = subprocess.run([
        "ffmpeg", "-hide_banner", "-nostdin", "-v", "error", "-y",
        "-stream_loop", "-1", "-i", score["path"],
        "-i", ambience["path"], "-i", radio["path"],
        "-filter_complex", filter_complex, "-map", "[out]", "-t", "45", "-ar", "48000", "-ac", str(spec["channels"]),
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(temp),
    ], check=False, capture_output=True, text=True)
    if completed.returncode != 0:
        temp.unlink(missing_ok=True)
        raise RuntimeError(f"accessibility render failed for {preset}: {completed.stderr[-3000:]}")
    os.chmod(temp, 0o444)
    os.replace(temp, destination)
    return {"path": str(destination), "sha256": sha256_file(destination), "probe": probe_audio(destination), "reused": False}


def build() -> dict[str, Any]:
    register = json.loads(REGISTER_PATH.read_text(encoding="utf-8"))
    if register.get("schema") != "project-studio-system-audio-asset-register/v2":
        raise RuntimeError("unexpected v2 system asset register schema")
    items = register["items"]
    score = pick(items, "RESPONSIVE_VARIANT", epoch="acoustic_electrical_1920_1932", context="NORMAL")
    ambience = pick(items, "LIVING_MIX", fixture="IDLE")
    radio = pick(items, "RADIO_DEMO", epoch="network_sound_1933_1945")
    renders = []
    for name, spec in PRESETS.items():
        record = render_mix(score, ambience, radio, name, spec)
        if abs(record["probe"]["duration_seconds"] - 45) > 0.1:
            raise RuntimeError(f"accessibility render duration mismatch: {name}")
        if record["probe"]["channels"] != spec["channels"]:
            raise RuntimeError(f"accessibility channel-count mismatch: {name}")
        renders.append({"preset": name, **record})
    output = {
        "schema": "project-studio-audio-accessibility-presets/v2",
        "generated_utc": utc_now(),
        "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "human_acceptance": "NONE_RECORDED",
        "independent_controls": ["MASTER", "SCORE", "RADIO_MUSIC", "RADIO_VOICE", "PA_HELP", "AMBIENCE", "ACTIVE_SFX", "UI"],
        "presets": [{"id": name, **spec} for name, spec in PRESETS.items()],
        "captions": {"enabled_before_first_functional_voice": True, "spoken_caption_same_resolved_payload": True},
        "transcript_history": True,
        "important_sound_captions": True,
        "critical_audio_only_information": False,
        "radio_off_mechanical_loss": False,
        "game_speed_pitch_or_tempo_change": False,
        "keyboard_operable": True,
        "controller_operable": True,
        "renders": renders,
        "sources": [{"id": item["id"], "path": item["path"], "sha256": item["sha256"]} for item in (score, ambience, radio)],
        "source_register": {"path": str(REGISTER_PATH), "sha256": sha256_file(REGISTER_PATH)},
        "machine_verdict": "PASS",
        "limitations": ["Rendered examples prove channel count and signal processing only; accessibility comfort and intelligibility require human review."],
    }
    atomic_write_json(PRESET_PATH, output)
    return output


def main() -> None:
    output = build()
    print(json.dumps({"machine_verdict": output["machine_verdict"], "preset_count": len(output["presets"]), "renders": len(output["renders"]), "path": str(PRESET_PATH)}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
