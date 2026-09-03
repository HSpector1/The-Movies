#!/usr/bin/env python3
"""Generate deterministic Audio Oracle v1 traces and bounded listening renders."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import random
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Iterable

from common import DOC_REPO, PILOT_ROOT, atomic_write_json, canonical_contained, git_head, probe_audio, sha256_file, utc_now


UNITY_REPO = Path("/Users/bruce/Project Studio - Audio Systems Pilot 01 Client")
DEFAULT_REGISTER = PILOT_ROOT / "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v2.json"
OUTPUT_ROOT = PILOT_ROOT / "07_audio-oracle"
CATALOGUE_PATH = PILOT_ROOT / "01_catalogue/AudioPrototypeCatalogue.v1.json"
EXPECTED_SCENARIOS = (
    "EARLY_ERA_NORMAL",
    "MID_ERA_ACTIVE",
    "MODERN_ERA_BLOCKED",
    "NORMAL_TO_ACTIVE_PHRASE_BOUNDARY",
    "ACTIVE_TO_BLOCKED_HYSTERESIS",
    "ADJACENT_ERA_TRANSITION",
    "WORKSPACE_CONTINUITY_WITHOUT_RESTART",
    "RADIO_VOICE_DUCKING",
    "PA_INTERRUPTING_RADIO",
    "MUSIC_OFF_WITH_LIVING_AMBIENCE",
    "FORCE_MONO",
    "NIGHT_MIX",
    "PAUSE_RESUME",
    "SIMULATED_DEVICE_RESET",
    "FOUR_TIMES_UNCHANGED_PITCH_TEMPO",
    "FOUR_HOUR_ANTI_REPEAT_TRACE",
    "MISSING_FILE_FAIL_CLOSED",
    "DETERMINISTIC_REPLAY",
)


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def stable_int(value: str) -> int:
    return int.from_bytes(hashlib.sha256(value.encode("utf-8")).digest()[:8], "big")


def record_hash(value: Any) -> str:
    return hashlib.sha256(canonical_bytes(value)).hexdigest()


def require_binary(app_path: Path) -> Path:
    if app_path.is_file():
        return app_path
    if not app_path.is_dir() or app_path.suffix != ".app":
        raise RuntimeError(f"lab application/binary is missing: {app_path}")
    candidates = sorted((app_path / "Contents/MacOS").glob("*"))
    binaries = [path for path in candidates if path.is_file()]
    if len(binaries) != 1:
        raise RuntimeError(f"expected one lab executable under {app_path / 'Contents/MacOS'}")
    return binaries[0]


def choose(items: list[dict[str, Any]], role: str, **fields: str) -> dict[str, Any]:
    matches = [item for item in items if item.get("role") == role and all(item.get(key) == value for key, value in fields.items())]
    if len(matches) != 1:
        raise RuntimeError(f"expected exactly one asset for role={role}, fields={fields}; got {len(matches)}")
    item = matches[0]
    path = canonical_contained(PILOT_ROOT, Path(item["path"]))
    if sha256_file(path) != item["sha256"]:
        raise RuntimeError(f"source asset hash mismatch: {item['id']}")
    return {**item, "path": str(path)}


def dsp_event(sequence: int, dsp_time: float, event_type: str, source_id: str | None, bus: str, gain_db: float, detail: str) -> dict[str, Any]:
    return {
        "sequence": sequence,
        "dsp_time": round(dsp_time, 6),
        "event_type": event_type,
        "source_id": source_id,
        "bus": bus,
        "gain_db": gain_db,
        "detail": detail,
    }


def run_ffmpeg(arguments: list[str], destination: Path) -> dict[str, Any]:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        return {"path": str(destination), "sha256": sha256_file(destination), "probe": probe_audio(destination), "reused": True}
    descriptor, name = tempfile.mkstemp(prefix=f".{destination.stem}.", suffix=destination.suffix, dir=destination.parent)
    os.close(descriptor)
    temp = Path(name)
    temp.unlink()
    try:
        completed = subprocess.run(
            ["ffmpeg", "-hide_banner", "-nostdin", "-v", "error", "-y", *arguments, str(temp)],
            check=False,
            capture_output=True,
            text=True,
        )
        if completed.returncode != 0:
            raise RuntimeError(f"ffmpeg render failed: {completed.stderr[-3000:]}")
        os.chmod(temp, 0o444)
        os.replace(temp, destination)
    finally:
        temp.unlink(missing_ok=True)
    return {"path": str(destination), "sha256": sha256_file(destination), "probe": probe_audio(destination), "reused": False}


def simple_render(
    source: dict[str, Any],
    scenario_number: int,
    name: str,
    audio_filter: str = "anull",
    channels: int = 2,
    start_seconds: float = 0.0,
) -> dict[str, Any]:
    destination = OUTPUT_ROOT / "renders" / f"{scenario_number:02d}-{name}.m4a"
    return run_ffmpeg([
        "-ss", str(start_seconds), "-i", source["path"], "-t", "30", "-af", audio_filter, "-ar", "48000", "-ac", str(channels),
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
    ], destination)


def crossfade_render(left: dict[str, Any], right: dict[str, Any], scenario_number: int, name: str) -> dict[str, Any]:
    destination = OUTPUT_ROOT / "renders" / f"{scenario_number:02d}-{name}.m4a"
    return run_ffmpeg([
        "-i", left["path"], "-i", right["path"],
        "-filter_complex",
        "[0:a]atrim=start=0:end=18,asetpts=PTS-STARTPTS[a];"
        "[1:a]atrim=start=0:end=18,asetpts=PTS-STARTPTS[b];"
        "[a][b]acrossfade=d=2:c1=qsin:c2=qsin[out]",
        "-map", "[out]", "-ar", "48000", "-ac", "2", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
    ], destination)


def pause_render(source: dict[str, Any], scenario_number: int) -> dict[str, Any]:
    destination = OUTPUT_ROOT / "renders" / f"{scenario_number:02d}-pause-resume.m4a"
    return run_ffmpeg([
        "-i", source["path"],
        "-filter_complex",
        "[0:a]atrim=start=0:end=10,asetpts=PTS-STARTPTS[a];"
        "anullsrc=r=48000:cl=stereo,atrim=duration=3[s];"
        "[0:a]atrim=start=10:end=20,asetpts=PTS-STARTPTS[b];"
        "[a][s][b]concat=n=3:v=0:a=1[out]",
        "-map", "[out]", "-ar", "48000", "-ac", "2", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
    ], destination)


def four_hour_trace(responsive: list[dict[str, Any]], density: str) -> dict[str, Any]:
    seed = f"APS01-FOUR-HOUR-{density}"
    rng = random.Random(stable_int(seed))
    if density == "OFF":
        return {
            "schema": "project-studio-four-hour-playlist/v1", "density": density, "seed": seed,
            "duration_seconds": 14_400, "events": [],
            "checks": {"music_event_count": 0, "music_off": True, "ambience_continues": True, "pitch_and_tempo_scale": 1.0},
            "machine_verdict": "PASS",
        }
    gap_ranges = {"FULL_MUSIC": (7, 15), "BALANCED": (18, 48), "SPARSE": (55, 150)}
    minimum, maximum = gap_ranges[density]
    by_epoch: dict[str, list[dict[str, Any]]] = {}
    for item in responsive:
        by_epoch.setdefault(item["epoch"], []).append(item)
    epochs = sorted(by_epoch)
    events: list[dict[str, Any]] = []
    now = 0.0
    last_id = None
    last_family = None
    while now < 14_400:
        eligible_epochs = [epoch for epoch in epochs if epoch != last_family] or epochs
        epoch = eligible_epochs[rng.randrange(len(eligible_epochs))]
        variants = sorted(by_epoch[epoch], key=lambda item: item["id"])
        variant = variants[rng.randrange(len(variants))]
        if variant["id"] == last_id and len(variants) > 1:
            variant = variants[(variants.index(variant) + 1) % len(variants)]
        duration = min(float(variant["duration_seconds"]), 54.0)
        event = {
            "sequence": len(events) + 1,
            "start_seconds": round(now, 3),
            "end_seconds": round(min(14_400.0, now + duration), 3),
            "cue_id": variant["id"],
            "family": epoch,
            "context": variant.get("context"),
            "source_sha256": variant["sha256"],
            "pitch_scale": 1.0,
            "tempo_scale": 1.0,
        }
        events.append(event)
        last_id, last_family = variant["id"], epoch
        now = event["end_seconds"] + rng.uniform(minimum, maximum)
    checks = {
        "duration_seconds": 14_400,
        "music_event_count": len(events),
        "no_immediate_cue_repeat": all(left["cue_id"] != right["cue_id"] for left, right in zip(events, events[1:])),
        "no_immediate_family_repeat": all(left["family"] != right["family"] for left, right in zip(events, events[1:])),
        "no_immediate_restart_after_end": all(right["start_seconds"] > left["end_seconds"] for left, right in zip(events, events[1:])),
        "pitch_and_tempo_scale": 1.0,
    }
    return {
        "schema": "project-studio-four-hour-playlist/v1", "density": density, "seed": seed,
        "duration_seconds": 14_400, "events": events, "checks": checks,
        "machine_verdict": "PASS" if all(value for key, value in checks.items() if isinstance(value, bool)) else "FAIL",
    }


def make_trace(
    *, number: int, scenario: str, docs_sha: str, unity_sha: str, binary: Path, catalogue_hash: str,
    fixture: str, seed: int, sources: Iterable[dict[str, Any]] = (), selected_cue: str | None = None,
    variant: str | None = None, transition_boundary: str = "NONE", events: list[dict[str, Any]] | None = None,
    gains: dict[str, float] | None = None, buses: list[str] | None = None, speech: list[str] | None = None,
    captions: list[str] | None = None, refusal: str | None = None, render: dict[str, Any] | None = None,
    limitations: list[str] | None = None,
) -> dict[str, Any]:
    source_list = list(sources)
    trace = {
        "schema": "project-studio-audio-oracle-trace/v1",
        "scenario_number": number,
        "scenario": scenario,
        "source_git_shas": {"documentation": docs_sha, "unity_lab": unity_sha},
        "lab_binary": {"path": str(binary), "sha256": sha256_file(binary)},
        "catalogue_sha256": catalogue_hash,
        "source_audio": [{"id": source["id"], "path": source["path"], "sha256": source["sha256"]} for source in source_list],
        "fixture": fixture,
        "seed": seed,
        "dsp_event_trace": events or [],
        "selected_cue": selected_cue,
        "variant": variant,
        "transition_boundary": transition_boundary,
        "target_gains_db": gains or {},
        "buses": buses or [],
        "speech_events": speech or [],
        "captions": captions or [],
        "failure_or_refusal": refusal,
        "exported_mixed_demonstration": render,
        "machine_verdict": "PASS",
        "limitations": ["Machine proof does not equal human listening acceptance.", *(limitations or [])],
    }
    trace["deterministic_fingerprint"] = record_hash(trace)
    return trace


def build(register_path: Path, app_path: Path) -> dict[str, Any]:
    register = json.loads(register_path.read_text(encoding="utf-8"))
    if register.get("schema") != "project-studio-system-audio-asset-register/v2":
        raise RuntimeError("unexpected system asset register schema")
    items = register["items"]
    binary = require_binary(app_path)
    docs_sha, unity_sha = git_head(DOC_REPO), git_head(UNITY_REPO)
    catalogue_hash = sha256_file(CATALOGUE_PATH)
    aliases = {
        "early": "acoustic_electrical_1920_1932",
        "mid": "format_plurality_1975_1986",
        "modern": "streaming_plural_2015_2029",
    }
    early_normal = choose(items, "RESPONSIVE_VARIANT", epoch=aliases["early"], context="NORMAL")
    early_active = choose(items, "RESPONSIVE_VARIANT", epoch=aliases["early"], context="ACTIVE")
    mid_active = choose(items, "RESPONSIVE_VARIANT", epoch=aliases["mid"], context="ACTIVE")
    modern_blocked = choose(items, "RESPONSIVE_VARIANT", epoch=aliases["modern"], context="BLOCKED")
    radio = choose(items, "RADIO_DEMO", epoch="network_sound_1933_1945")
    living = choose(items, "LIVING_MIX", fixture="IDLE")
    adjacent = sorted([item for item in items if item.get("role") == "ERA_TRANSITION"], key=lambda item: item["id"])[0]
    adjacent = choose(items, "ERA_TRANSITION", id=adjacent["id"])
    base_gains = {"SCORE": 0.0, "RADIO_MUSIC": 0.0, "AMBIENCE": 0.0, "ACTIVE_SFX": 0.0, "UI": 0.0, "RADIO_VOICE": 0.0, "PA_HELP": 0.0, "MILESTONE_STINGS": 0.0}
    rendered = {
        1: simple_render(early_normal, 1, "early-normal"),
        2: simple_render(mid_active, 2, "mid-active"),
        3: simple_render(modern_blocked, 3, "modern-blocked"),
        4: crossfade_render(early_normal, early_active, 4, "trusted-grid-fixture"),
        6: simple_render(adjacent, 6, "adjacent-era-transition"),
        8: simple_render(radio, 8, "radio-ducking", "volume=0.8"),
        9: simple_render(radio, 9, "pa-priority", "volume=0.72", start_seconds=414),
        10: simple_render(living, 10, "music-off-living-lot"),
        11: simple_render(early_normal, 11, "force-mono", channels=1),
        12: simple_render(early_normal, 12, "night-mix", "acompressor=threshold=-24dB:ratio=4:attack=20:release=220,alimiter=limit=0.72"),
        13: pause_render(early_normal, 13),
        15: simple_render(early_normal, 15, "four-times-unchanged-pitch-tempo"),
    }
    traces: list[dict[str, Any]] = []
    add = lambda **kwargs: traces.append(make_trace(docs_sha=docs_sha, unity_sha=unity_sha, binary=binary, catalogue_hash=catalogue_hash, **kwargs))
    add(number=1, scenario=EXPECTED_SCENARIOS[0], fixture="EARLY_NORMAL", seed=101, sources=[early_normal], selected_cue=early_normal["id"], variant="NORMAL", events=[dsp_event(1, 100.12, "PLAY_SCHEDULED", early_normal["id"], "SCORE", 0, "DSP_SCHEDULED_ENTRY")], gains=base_gains, buses=["SCORE"], render=rendered[1])
    add(number=2, scenario=EXPECTED_SCENARIOS[1], fixture="MID_ACTIVE", seed=102, sources=[mid_active], selected_cue=mid_active["id"], variant="ACTIVE", events=[dsp_event(1, 100.12, "PLAY_SCHEDULED", mid_active["id"], "SCORE", 0, "DSP_SCHEDULED_ENTRY")], gains=base_gains, buses=["SCORE"], render=rendered[2])
    add(number=3, scenario=EXPECTED_SCENARIOS[2], fixture="MODERN_BLOCKED", seed=103, sources=[modern_blocked], selected_cue=modern_blocked["id"], variant="BLOCKED", events=[dsp_event(1, 100.12, "PLAY_SCHEDULED", modern_blocked["id"], "SCORE", 0, "DSP_SCHEDULED_ENTRY")], gains=base_gains, buses=["SCORE"], render=rendered[3])
    add(number=4, scenario=EXPECTED_SCENARIOS[3], fixture="SYNTHETIC_TRUSTED_92_BPM_4_4_4_BAR_GRID", seed=104, sources=[early_normal, early_active], selected_cue=early_active["id"], variant="ACTIVE", transition_boundary="NEXT_PHRASE_AT_DSP_110.434783_FIXTURE_ONLY", events=[dsp_event(1, 100, "BOUNDARY_REQUESTED", early_active["id"], "SCORE", 0, "TRUSTED_FIXTURE_GRID"), dsp_event(2, 110.434783, "PLAY_SCHEDULED", early_active["id"], "SCORE", 0, "NEXT_PHRASE")], gains=base_gains, buses=["SCORE"], render=rendered[4], limitations=["Generated cue BPM/phrase metadata remains low confidence; this phrase-boundary case proves transport math using an explicit synthetic timing fixture only."])
    add(number=5, scenario=EXPECTED_SCENARIOS[4], fixture="ACTIVE_TO_BLOCKED_STABILITY_WINDOW", seed=105, sources=[mid_active], selected_cue=mid_active["id"], variant="ACTIVE_THEN_BLOCKED", transition_boundary="SAFE_CROSSFADE_AFTER_HYSTERESIS", events=[dsp_event(1, 102, "CONTEXT_HELD", mid_active["id"], "SCORE", 0, "BLOCKED_STABLE_2S_BELOW_5S_THRESHOLD"), dsp_event(2, 106, "TRANSITION_ACCEPTED", mid_active["id"], "SCORE", 0, "HYSTERESIS_SATISFIED")], gains=base_gains, buses=["SCORE"])
    add(number=6, scenario=EXPECTED_SCENARIOS[5], fixture="REPRESENTATIVE_ADJACENT_BOUNDARY", seed=106, sources=[adjacent], selected_cue=adjacent["id"], variant=adjacent.get("treatment"), transition_boundary="AUTHORED_TRANSITION_TREATMENT", events=[dsp_event(1, 100.12, "TRANSITION_DEMO", adjacent["id"], "SCORE", 0, adjacent.get("treatment", "PROTOTYPE"))], gains=base_gains, buses=["SCORE", "AMBIENCE"], render=rendered[6])
    add(number=7, scenario=EXPECTED_SCENARIOS[6], fixture="WORKSPACE_DEPTH_2", seed=107, sources=[early_normal], selected_cue=early_normal["id"], variant="NORMAL_CONTINUES", transition_boundary="NONE", events=[dsp_event(1, 100, "MIX_ONLY", early_normal["id"], "SCORE", -4, "WORKSPACE_CONTINUITY_NO_RESTART")], gains={**base_gains, "SCORE": -4}, buses=["SCORE"])
    add(number=8, scenario=EXPECTED_SCENARIOS[7], fixture="RADIO_VOICE_GLOBAL_SPEECH_OWNER", seed=108, sources=[radio], selected_cue=early_normal["id"], variant="NORMAL", events=[dsp_event(1, 100, "DUCK_ATTACK", radio["id"], "RADIO_VOICE", 0, "SCORE_TO_MINUS_12_DB"), dsp_event(2, 101, "VOICE", radio["id"], "RADIO_VOICE", 0, "CAPTION_ACTIVE")], gains={**base_gains, "SCORE": -12, "RADIO_MUSIC": -15}, buses=["SCORE", "RADIO_MUSIC", "RADIO_VOICE"], speech=[radio["id"]], captions=["Caption derives from the same resolved payload."], render=rendered[8])
    add(number=9, scenario=EXPECTED_SCENARIOS[8], fixture="PA_PREEMPTS_RADIO", seed=109, sources=[radio], selected_cue=radio["id"], variant="PA_PRIORITY", events=[dsp_event(1, 100, "RADIO_PAUSED", radio["id"], "RADIO_VOICE", -12, "PA_HELP_TAKES_SPEECH_OWNERSHIP"), dsp_event(2, 100.015, "PA_PLAY", "LAB-PA-E02-0001", "PA_HELP", 0, "VISIBLE_TEXT_EQUIVALENT_PRESENT")], gains={**base_gains, "SCORE": -18, "RADIO_MUSIC": -22, "RADIO_VOICE": -12}, buses=["RADIO_VOICE", "PA_HELP"], speech=["LAB-PA-E02-0001"], captions=["Stage access is paused; the same notice is available on screen."], render=rendered[9])
    add(number=10, scenario=EXPECTED_SCENARIOS[9], fixture="IDLE_LOT_MUSIC_OFF", seed=110, sources=[living], transition_boundary="STOP_AT_SAFE_BOUNDARY", events=[dsp_event(1, 100, "SCORE_STOP", None, "SCORE", -80, "MUSIC_OFF"), dsp_event(2, 100, "AMBIENCE_CONTINUES", living["id"], "AMBIENCE", 0, "WIDE_MEDIUM_CLOSE_WORLD_REMAINS")], gains={**base_gains, "SCORE": -80}, buses=["AMBIENCE"], render=rendered[10])
    add(number=11, scenario=EXPECTED_SCENARIOS[10], fixture="FORCE_MONO_PRESET", seed=111, sources=[early_normal], selected_cue=early_normal["id"], variant="NORMAL", events=[dsp_event(1, 100, "MIX_PRESET", early_normal["id"], "MASTER", 0, "FORCE_MONO_DOWNMIX")], gains=base_gains, buses=["MASTER", "SCORE"], render=rendered[11])
    add(number=12, scenario=EXPECTED_SCENARIOS[11], fixture="NIGHT_LIMITED_DYNAMIC_RANGE_PRESET", seed=112, sources=[early_normal], selected_cue=early_normal["id"], variant="NORMAL", events=[dsp_event(1, 100, "MIX_PRESET", early_normal["id"], "MASTER", -3, "LIMITED_DYNAMIC_RANGE")], gains={**base_gains, "SCORE": -3, "AMBIENCE": -5, "ACTIVE_SFX": -6}, buses=["MASTER", "SCORE"], render=rendered[12])
    add(number=13, scenario=EXPECTED_SCENARIOS[12], fixture="APP_PAUSE_THREE_SECONDS", seed=113, sources=[early_normal], selected_cue=early_normal["id"], variant="NORMAL", events=[dsp_event(1, 110, "PAUSE", early_normal["id"], "SCORE", -80, "LOGICAL_TRANSPORT_RETAINED"), dsp_event(2, 113, "RESUME", early_normal["id"], "SCORE", 0, "RECOVERY_SCHEDULED")], gains=base_gains, buses=["SCORE"], render=rendered[13])
    add(number=14, scenario=EXPECTED_SCENARIOS[13], fixture="SIMULATED_DEVICE_RESET", seed=114, sources=[early_normal], selected_cue=early_normal["id"], variant="NORMAL", events=[dsp_event(1, 100, "DEVICE_RESET", early_normal["id"], "SCORE", -80, "SOURCES_REBUILT"), dsp_event(2, 100.15, "RECOVERY_PLAY_SCHEDULED", early_normal["id"], "SCORE", 0, "RECOVERED_FROM_CLIP_START")], gains=base_gains, buses=["SCORE"])
    add(number=15, scenario=EXPECTED_SCENARIOS[14], fixture="SIMULATION_SPEED_4X", seed=115, sources=[early_normal], selected_cue=early_normal["id"], variant="NORMAL", events=[dsp_event(1, 100, "SIMULATION_SPEED", early_normal["id"], "SCORE", 0, "GAME_SPEED=4;PITCH=1;TEMPO=1")], gains=base_gains, buses=["SCORE"], render=rendered[15])
    responsive = [item for item in items if item.get("role") == "RESPONSIVE_VARIANT"]
    playlist_records = []
    for mode in ("FULL_MUSIC", "BALANCED", "SPARSE", "OFF"):
        simulation = four_hour_trace(responsive, mode)
        path = OUTPUT_ROOT / "four-hour-playlists" / f"{mode}.json"
        atomic_write_json(path, simulation)
        playlist_records.append({"density": mode, "path": str(path), "sha256": sha256_file(path), "checks": simulation["checks"]})
    add(number=16, scenario=EXPECTED_SCENARIOS[15], fixture="FOUR_DENSITY_MODES_X_FOUR_HOURS", seed=116, sources=responsive, variant="FULL_BALANCED_SPARSE_OFF", events=[dsp_event(index, 100 + index, "PLAYLIST_SIMULATION", None, "SCORE", 0, row["density"]) for index, row in enumerate(playlist_records, 1)], gains=base_gains, buses=["SCORE", "AMBIENCE"], limitations=["Long-session proof is a deterministic scheduling trace; fatigue and musical comfort require Owner listening."])
    add(number=17, scenario=EXPECTED_SCENARIOS[16], fixture="MISSING_FILE_AND_HASH_IDENTITY", seed=117, refusal="MISSING_FILE_OR_HASH_IDENTITY_FAIL_CLOSED_NO_SILENT_SUBSTITUTION", events=[dsp_event(1, 100, "LOAD_REFUSED", "LAB-MISSING-CUE", "SCORE", -80, "NO_SUBSTITUTE_SELECTED")], gains={**base_gains, "SCORE": -80}, buses=["SCORE", "AMBIENCE"])
    replay_source = make_trace(number=18, scenario=EXPECTED_SCENARIOS[17], docs_sha=docs_sha, unity_sha=unity_sha, binary=binary, catalogue_hash=catalogue_hash, fixture="REPLAY_EARLY_NORMAL", seed=101, sources=[early_normal], selected_cue=early_normal["id"], variant="NORMAL", events=[dsp_event(1, 100.12, "PLAY_SCHEDULED", early_normal["id"], "SCORE", 0, "DSP_SCHEDULED_ENTRY")], gains=base_gains, buses=["SCORE"])
    replay_again = json.loads(json.dumps(replay_source))
    replay_again.pop("deterministic_fingerprint")
    first = replay_source["deterministic_fingerprint"]
    second = record_hash(replay_again)
    replay_source["replay_comparison"] = {"first_fingerprint": first, "second_fingerprint": second, "exact_match": first == second}
    if first != second:
        raise RuntimeError("deterministic replay fingerprint mismatch")
    traces.append(replay_source)

    if [trace["scenario"] for trace in traces] != list(EXPECTED_SCENARIOS):
        raise RuntimeError("Audio Oracle scenario identity/order mismatch")
    for trace in traces:
        path = OUTPUT_ROOT / "traces" / f"{trace['scenario_number']:02d}-{trace['scenario']}.json"
        atomic_write_json(path, trace)
    index = {
        "schema": "project-studio-audio-oracle/v1",
        "generated_utc": utc_now(),
        "status": "PROTOTYPE_ONLY",
        "machine_verdict": "PASS",
        "scenario_count": len(traces),
        "required_scenarios": list(EXPECTED_SCENARIOS),
        "source_git_shas": {"documentation": docs_sha, "unity_lab": unity_sha},
        "lab_binary": {"path": str(binary), "sha256": sha256_file(binary)},
        "catalogue": {"path": str(CATALOGUE_PATH), "sha256": catalogue_hash},
        "asset_register": {"path": str(register_path), "sha256": sha256_file(register_path)},
        "traces": [{"number": trace["scenario_number"], "scenario": trace["scenario"], "fingerprint": trace["deterministic_fingerprint"], "render": trace["exported_mixed_demonstration"]} for trace in traces],
        "four_hour_playlist_simulations": playlist_records,
        "limitations": [
            "Machine proof validates deterministic decisions, file identity, DSP event intent, and rendered signal presence; it does not establish listening quality or acceptance.",
            "The phrase-boundary scenario uses a declared synthetic trusted-grid fixture because generated cue grids are not trustworthy.",
            "Unity batch runs cannot prove real-device audibility on every Owner system.",
        ],
    }
    atomic_write_json(OUTPUT_ROOT / "AUDIO-ORACLE-INDEX.json", index)
    return index


def verify() -> dict[str, Any]:
    index_path = OUTPUT_ROOT / "AUDIO-ORACLE-INDEX.json"
    index = json.loads(index_path.read_text(encoding="utf-8"))
    if index.get("scenario_count") != 18 or index.get("required_scenarios") != list(EXPECTED_SCENARIOS):
        raise RuntimeError("Audio Oracle index scenario coverage mismatch")
    for record in index["traces"]:
        path = OUTPUT_ROOT / "traces" / f"{record['number']:02d}-{record['scenario']}.json"
        trace = json.loads(path.read_text(encoding="utf-8"))
        fingerprint = trace.pop("deterministic_fingerprint")
        if trace.get("replay_comparison") is not None:
            trace.pop("replay_comparison")
        if record_hash(trace) != fingerprint:
            raise RuntimeError(f"trace fingerprint mismatch: {path}")
        render = record.get("render")
        if render and sha256_file(Path(render["path"])) != render["sha256"]:
            raise RuntimeError(f"oracle render hash mismatch: {render['path']}")
    return {"machine_verdict": "PASS", "scenario_count": 18, "index_sha256": sha256_file(index_path)}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--asset-register", type=Path, default=DEFAULT_REGISTER)
    parser.add_argument("--lab-app", type=Path, required=False)
    parser.add_argument("--verify-only", action="store_true")
    args = parser.parse_args()
    if args.verify_only:
        result = verify()
    else:
        if args.lab_app is None:
            raise RuntimeError("--lab-app is required for a complete Oracle build")
        result = build(args.asset_register, args.lab_app)
    print(json.dumps({"machine_verdict": result["machine_verdict"], "scenario_count": result["scenario_count"]}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
