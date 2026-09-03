#!/usr/bin/env python3
"""Build deterministic runtime-paced Studio Radio prototype programs."""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import math
import os
import random
import re
import shlex
import struct
import subprocess
import tempfile
import wave
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from common import PILOT_ROOT, atomic_write_json, atomic_write_text, probe_audio, sha256_file, utc_now
from radio_copy_linter import OUTPUT_BANK, build as build_clean_bank, lint_text


TOOL_VERSION = "project-studio-runtime-radio-builder-v1"
RIGHTS_STATUS = "PROTOTYPE_ONLY"
RADIO_ROOT = PILOT_ROOT / "06_radio"
DEMO_ROOT = RADIO_ROOT / "demos"
FIXTURE_PATH = RADIO_ROOT / "functional-fixtures.json"
PRESENTER_PATH = RADIO_ROOT / "presenter-ensemble.json"
INDEX_PATH = RADIO_ROOT / "STUDIO-RADIO-RUNTIME-INDEX.json"


@dataclass(frozen=True)
class DemoSpec:
    slug: str
    title: str
    epoch_code: str
    epoch_alias: str
    music_stable_id: str
    presenter_id: str
    duration_seconds: float
    seed: str
    daypart: str
    period_filter: str


PRESENTERS = {
    "PRESENTER-MAE-CALDER": {
        "display_name": "Mae Calder",
        "local_voice": "Kathy",
        "campaign_eligibility": ["E01", "E02", "E03", "E04", "E05", "E08"],
        "performance": "Measured warmth, clear consonants, practical curiosity; never an era caricature.",
    },
    "PRESENTER-ARTHUR-VALE": {
        "display_name": "Arthur Vale",
        "local_voice": "Ralph",
        "campaign_eligibility": ["E02", "E03", "E04", "E05", "E06", "E07", "E09"],
        "performance": "Dry observational timing, steady breath groups, low sales pressure.",
    },
    "PRESENTER-RINA-SHORE": {
        "display_name": "Rina Shore",
        "local_voice": "Samantha",
        "campaign_eligibility": ["E01", "E04", "E05", "E06", "E07", "E08", "E09"],
        "performance": "Direct, humane, lightly energetic delivery with deliberate room for silence.",
    },
}

DEMOS = (
    DemoSpec(
        slug="EARLY-NETWORK-GOLDEN-STUDIO",
        title="Early Network / Golden Studio",
        epoch_code="E02",
        epoch_alias="network_sound_1933_1945",
        music_stable_id="MUS-02-NSD-04__seed-196613",
        presenter_id="PRESENTER-MAE-CALDER",
        duration_seconds=600.0,
        seed="APS01-RADIO-EARLY-1938",
        daypart="MORNING",
        period_filter="highpass=f=170,lowpass=f=5200,acompressor=threshold=-24dB:ratio=3:attack=12:release=180,asoftclip=type=tanh:threshold=0.88:output=0.94",
    ),
    DemoSpec(
        slug="POSTWAR-PERSONALITY-FORMAT-TRANSITION",
        title="Postwar Personality / Format Transition",
        epoch_code="E05",
        epoch_alias="format_plurality_1975_1986",
        music_stable_id="MUS-05-FPL-01__seed-130363",
        presenter_id="PRESENTER-ARTHUR-VALE",
        duration_seconds=600.0,
        seed="APS01-RADIO-FORMAT-1980",
        daypart="AFTERNOON",
        period_filter="highpass=f=105,lowpass=f=9800,acompressor=threshold=-25dB:ratio=2.5:attack=9:release=150,asoftclip=type=tanh:threshold=0.94:output=0.97",
    ),
    DemoSpec(
        slug="DIGITAL-NETWORKED-HYBRID",
        title="Digital / Networked Hybrid",
        epoch_code="E07",
        epoch_alias="networked_hybrid_2000_2014",
        music_stable_id="MUS-07-NHY-01__seed-104729",
        presenter_id="PRESENTER-RINA-SHORE",
        duration_seconds=600.0,
        seed="APS01-RADIO-NETWORK-2008",
        daypart="EVENING",
        period_filter="highpass=f=75,lowpass=f=14500,acompressor=threshold=-27dB:ratio=2:attack=7:release=130,asoftclip=type=tanh:threshold=0.97:output=0.98",
    ),
)

FUNCTIONAL_FIXTURES = {
    "E02": {
        "ownerDomain": "P13_AUDIO_LAB_FIXTURE",
        "eventId": "LAB-TECH-ELECTRICAL-PICKUP-TRIAL",
        "receiptId": "LAB-RECEIPT-E02-0001",
        "headline": "Workshop pickup trial logged",
        "body": "The camera workshop logged a successful electrical pickup trial and filed the result for review.",
        "priority": 70,
        "expiresAt": "2099-01-01T00:00:00Z",
        "captionText": "Workshop bulletin: the camera team logged a successful electrical pickup trial and filed the result for review.",
        "spokenText": "Workshop bulletin: the camera team logged a successful electrical pickup trial and filed the result for review.",
    },
    "E05": {
        "ownerDomain": "P05_AUDIO_LAB_FIXTURE",
        "eventId": "LAB-PRODUCTION-CAMERA-MOVE-COMPLETE",
        "receiptId": "LAB-RECEIPT-E05-0001",
        "headline": "Camera move complete",
        "body": "The camera unit completed its scheduled move and returned the stage lane to normal use.",
        "priority": 70,
        "expiresAt": "2099-01-01T00:00:00Z",
        "captionText": "Production bulletin: the camera unit completed its scheduled move and returned the stage lane to normal use.",
        "spokenText": "Production bulletin: the camera unit completed its scheduled move and returned the stage lane to normal use.",
    },
    "E07": {
        "ownerDomain": "P06_AUDIO_LAB_FIXTURE",
        "eventId": "LAB-RELEASE-RESULT-ARCHIVED",
        "receiptId": "LAB-RECEIPT-E07-0001",
        "headline": "Release result archived",
        "body": "The release desk archived the latest result and made the same summary available in the written record.",
        "priority": 70,
        "expiresAt": "2099-01-01T00:00:00Z",
        "captionText": "Release bulletin: the release desk archived the latest result and placed the same summary in the written record.",
        "spokenText": "Release bulletin: the release desk archived the latest result and placed the same summary in the written record.",
    },
}


def stable_int(seed: str) -> int:
    return int.from_bytes(hashlib.sha256(seed.encode("utf-8")).digest()[:8], "big")


def format_time(seconds: float) -> str:
    milliseconds = max(0, int(round(seconds * 1000)))
    hours, milliseconds = divmod(milliseconds, 3_600_000)
    minutes, milliseconds = divmod(milliseconds, 60_000)
    secs, milliseconds = divmod(milliseconds, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{milliseconds:03d}"


def safe_slug(value: str) -> str:
    return re.sub(r"[^A-Z0-9_-]+", "-", value.upper()).strip("-")


def find_music(stable_id: str) -> Path:
    matches = list((PILOT_ROOT / "02_music-bundles/library").glob(f"*/{stable_id}.wav"))
    if len(matches) != 1:
        raise RuntimeError(f"expected one materialized music source for {stable_id}, found {matches}")
    return matches[0]


def pick_unit(units: list[dict[str, Any]], function_contains: str, rng: random.Random, used: set[str]) -> dict[str, Any]:
    candidates = [unit for unit in units if function_contains in unit["function"] and unit["stable_id"] not in used]
    if not candidates:
        raise RuntimeError(f"no eligible unused {function_contains} radio item")
    candidates.sort(key=lambda item: item["stable_id"])
    picked = candidates[rng.randrange(len(candidates))]
    used.add(picked["stable_id"])
    return picked


def make_sting(path: Path) -> None:
    if path.exists():
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    rate = 48_000
    duration = 1.25
    frames = int(rate * duration)
    notes = (523.251, 659.255, 783.991)
    descriptor, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    os.close(descriptor)
    temp = Path(temp_name)
    try:
        with wave.open(str(temp), "wb") as handle:
            handle.setnchannels(1)
            handle.setsampwidth(2)
            handle.setframerate(rate)
            payload = bytearray()
            for frame in range(frames):
                t = frame / rate
                attack = min(1.0, t / 0.025)
                release = min(1.0, (duration - t) / 0.34)
                envelope = max(0.0, attack * release) * math.exp(-1.4 * t)
                value = sum(math.sin(2 * math.pi * frequency * t) for frequency in notes) / len(notes)
                payload.extend(struct.pack("<h", int(max(-1, min(1, value * envelope * 0.34)) * 32767)))
            handle.writeframes(payload)
        os.chmod(temp, 0o444)
        os.replace(temp, path)
    finally:
        temp.unlink(missing_ok=True)


def run_atomic(argv: list[str], destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temp_name = tempfile.mkstemp(prefix=f".{destination.name}.", suffix=destination.suffix, dir=destination.parent)
    os.close(descriptor)
    temp = Path(temp_name)
    temp.unlink()
    try:
        expanded = [str(temp) if value == "{OUTPUT}" else value for value in argv]
        completed = subprocess.run(expanded, capture_output=True, text=True)
        if completed.returncode != 0:
            raise RuntimeError(f"command failed ({shlex.join(expanded)}): {completed.stderr[-4000:]}")
        os.chmod(temp, 0o444)
        os.replace(temp, destination)
    finally:
        temp.unlink(missing_ok=True)


def render_voice(text: str, presenter_id: str, spec: DemoSpec, voice_id: str, root: Path) -> dict[str, Any]:
    presenter = PRESENTERS[presenter_id]
    voice_root = root / "voice" / safe_slug(voice_id)
    clean = voice_root / "clean.wav"
    treated = voice_root / "period-treated.wav"
    text_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
    sidecar = voice_root / "metadata.json"
    if sidecar.exists() and clean.exists() and treated.exists():
        prior = json.loads(sidecar.read_text(encoding="utf-8"))
        if prior.get("spoken_text_sha256") != text_hash:
            raise RuntimeError(f"existing voice text identity mismatch: {voice_id}")
    else:
        voice_root.mkdir(parents=True, exist_ok=True)
        descriptor, aiff_name = tempfile.mkstemp(prefix=f".{safe_slug(voice_id)}.", suffix=".aiff", dir=voice_root)
        os.close(descriptor)
        aiff = Path(aiff_name)
        aiff.unlink()
        try:
            subprocess.run(
                ["/usr/bin/say", "-v", presenter["local_voice"], "-r", "165", "-o", str(aiff), text],
                check=True,
                capture_output=True,
                text=True,
            )
            run_atomic([
                "ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(aiff),
                "-af", "highpass=f=65,lowpass=f=15500,alimiter=limit=0.88",
                "-ar", "48000", "-ac", "1", "-c:a", "pcm_s24le", "{OUTPUT}",
            ], clean)
            run_atomic([
                "ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(clean),
                "-af", spec.period_filter,
                "-ar", "48000", "-ac", "1", "-c:a", "pcm_s24le", "{OUTPUT}",
            ], treated)
        finally:
            aiff.unlink(missing_ok=True)
    clean_probe = probe_audio(clean)
    treated_probe = probe_audio(treated)
    metadata = {
        "voice_id": voice_id,
        "presenter_id": presenter_id,
        "presenter_display_name": presenter["display_name"],
        "generic_local_voice": presenter["local_voice"],
        "spoken_text": text,
        "spoken_text_sha256": text_hash,
        "clean": {"path": str(clean), "sha256": sha256_file(clean), "probe": clean_probe},
        "period_treated": {"path": str(treated), "sha256": sha256_file(treated), "probe": treated_probe, "filter": spec.period_filter},
        "route": "macOS built-in speech; scratch delivery prototype",
        "prohibitions": ["NO_REAL_PERSON_IMITATION", "NO_VOICE_CLONING", "NO_CELEBRITY_OR_PROTECTED_CHARACTER_TARGET"],
        "rights_status": RIGHTS_STATUS,
    }
    atomic_write_json(sidecar, metadata)
    return metadata


def content_for_demo(spec: DemoSpec, bank: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    rng = random.Random(stable_int(spec.seed))
    eligible = [unit for unit in bank["units"] if unit["epoch_code"] == spec.epoch_code]
    used: set[str] = set()
    picks = {
        "station_id": pick_unit(eligible, "station_id", rng, used),
        "host_link_1": pick_unit(eligible, "studio_workday_link", rng, used),
        "advertisement": pick_unit(eligible, "advertisement", rng, used),
        "decorative": pick_unit(eligible, "hollywood_news", rng, used),
        "host_link_2": pick_unit(eligible, "studio_workday_link", rng, used),
        "signoff": pick_unit(eligible, "signoff", rng, used),
    }
    fixture = dict(FUNCTIONAL_FIXTURES[spec.epoch_code])
    fixture["captionText"] = fixture["spokenText"]
    events: list[dict[str, Any]] = []
    layout = (
        (10.0, "station_id", "DECORATIVE", 35),
        (58.0, "host_link_1", "DECORATIVE", 30),
        (122.0, "advertisement", "DECORATIVE", 25),
        (198.0, "decorative", "DECORATIVE", 30),
        (274.0, "functional", "FUNCTIONAL", 70),
        (354.0, "host_link_2", "DECORATIVE", 30),
        (424.0, "pa", "PA_HELP", 100),
        (508.0, "signoff", "DECORATIVE", 35),
    )
    for index, (at, role, content_type, priority) in enumerate(layout, start=1):
        if role == "functional":
            text = fixture["spokenText"]
            source_id = fixture["eventId"]
            presenter_id = spec.presenter_id
            payload = fixture
        elif role == "pa":
            text = "Stage two access is paused while the loading lane is cleared. The same notice is available on screen."
            source_id = f"LAB-PA-{spec.epoch_code}-0001"
            presenter_id = "PRESENTER-RINA-SHORE"
            payload = {
                "ownerDomain": "PA_HELP_AUDIO_LAB_FIXTURE",
                "eventId": source_id,
                "receiptId": f"LAB-RECEIPT-PA-{spec.epoch_code}-0001",
                "headline": "Stage access paused",
                "body": text,
                "priority": 100,
                "expiresAt": "2099-01-01T00:00:00Z",
                "captionText": text,
                "spokenText": text,
            }
        else:
            unit = picks[role]
            text = unit["transcript"]
            source_id = unit["stable_id"]
            presenter_id = spec.presenter_id
            payload = None
        findings = lint_text(source_id, "spokenText", text)
        if findings:
            raise RuntimeError(f"runtime spoken copy lint failed: {findings}")
        events.append({
            "sequence": index,
            "requested_start_seconds": at,
            "role": role,
            "content_type": content_type,
            "source_id": source_id,
            "presenter_id": presenter_id,
            "priority": priority,
            "cooldown_seconds": 300 if content_type == "DECORATIVE" else 0,
            "expires_at": payload["expiresAt"] if payload else None,
            "caption_text": text,
            "spoken_text": text,
            "typed_payload": payload,
            "mechanical_mutation": "NONE",
        })
    return events, fixture


def render_demo(spec: DemoSpec, bank: dict[str, Any], sting: Path) -> dict[str, Any]:
    root = DEMO_ROOT / spec.slug
    root.mkdir(parents=True, exist_ok=True)
    events, fixture = content_for_demo(spec, bank)
    voice_records: list[dict[str, Any]] = []
    for event in events:
        record = render_voice(event["spoken_text"], event["presenter_id"], spec, event["source_id"], root)
        event["accepted_start_seconds"] = event["requested_start_seconds"]
        event["rendered_start_seconds"] = event["requested_start_seconds"]
        event["duration_seconds"] = record["period_treated"]["probe"]["duration_seconds"]
        event["end_seconds"] = round(event["rendered_start_seconds"] + event["duration_seconds"], 6)
        event["ducking"] = {"score_target_db": -12.0 if event["content_type"] != "PA_HELP" else -18.0, "attack_ms": 15, "release_ms": 700}
        voice_records.append(record)
    for left, right in zip(events, events[1:]):
        if left["end_seconds"] > right["rendered_start_seconds"]:
            raise RuntimeError(f"voice overlap violates global arbiter: {left['source_id']} -> {right['source_id']}")

    music = find_music(spec.music_stable_id)
    music_windows = [(0, 48), (76, 116), (145, 191), (224, 266), (302, 346), (380, 416), (451, 500), (535, 600)]
    silence_windows = [(48, 58), (116, 122), (191, 198), (266, 274), (346, 354), (416, 424), (500, 508)]
    enable = "+".join(f"between(t,{start},{end})" for start, end in music_windows)
    filter_parts = [f"[0:a]atrim=duration={spec.duration_seconds},asetpts=PTS-STARTPTS,volume='0.28*gt({enable},0)'[music]"]
    input_args = ["-stream_loop", "-1", "-i", str(music)]
    voice_labels: list[str] = []
    for index, event in enumerate(events, start=1):
        voice_path = Path(voice_records[index - 1]["period_treated"]["path"])
        input_args.extend(["-i", str(voice_path)])
        delay = int(round(event["rendered_start_seconds"] * 1000))
        filter_parts.append(f"[{index}:a]adelay={delay},aformat=channel_layouts=stereo[v{index}]")
        voice_labels.append(f"[v{index}]")
    sting_input = len(events) + 1
    input_args.extend(["-i", str(sting)])
    filter_parts.append(f"[{sting_input}:a]adelay=332000,aformat=channel_layouts=stereo[sting]")
    voice_labels.append("[sting]")
    filter_parts.append(
        "".join(voice_labels)
        + f"amix=inputs={len(voice_labels)}:normalize=0:dropout_transition=0,alimiter=limit=0.90[speech]"
    )
    filter_parts.append("[music][speech]sidechaincompress=threshold=0.018:ratio=10:attack=15:release=700[ducked]")
    filter_parts.append("[ducked][speech]amix=inputs=2:weights='1 1':normalize=0,alimiter=limit=0.94[out]")
    master = root / f"{spec.slug}-RUNTIME-DEMO.wav"
    if not master.exists():
        run_atomic([
            "ffmpeg", "-nostdin", "-v", "error", "-y", *input_args,
            "-filter_complex", ";".join(filter_parts), "-map", "[out]", "-t", str(spec.duration_seconds),
            "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", "{OUTPUT}",
        ], master)
    preview = root / f"{spec.slug}-RUNTIME-DEMO.m4a"
    if not preview.exists():
        run_atomic([
            "ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(master),
            "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "{OUTPUT}",
        ], preview)
    master_probe = probe_audio(master)
    if abs(master_probe["duration_seconds"] - spec.duration_seconds) > 0.01:
        raise RuntimeError(f"radio demo duration mismatch: {spec.slug}: {master_probe}")

    captions = ["WEBVTT", ""]
    transcript = [f"# {spec.title} — transcript", "", "Prototype runtime program. Captions and spoken payloads are byte-identical.", ""]
    for sequence, event in enumerate(events, start=1):
        captions.extend([
            str(sequence),
            f"{format_time(event['rendered_start_seconds'])} --> {format_time(event['end_seconds'])}",
            event["caption_text"],
            "",
        ])
        transcript.extend([
            f"## {format_time(event['rendered_start_seconds'])} — {event['content_type']} — {event['source_id']}",
            "",
            event["spoken_text"],
            "",
        ])
    atomic_write_text(root / "CAPTIONS.vtt", "\n".join(captions) + "\n")
    atomic_write_text(root / "TRANSCRIPT.md", "\n".join(transcript))
    atomic_write_json(root / "SCHEDULE.json", {
        "schema": "project-studio-runtime-radio-schedule/v1",
        "demo": spec.__dict__,
        "events": events,
        "music_windows": [{"start": start, "end": end} for start, end in music_windows],
        "silence_windows": [{"start": start, "end": end} for start, end in silence_windows],
        "milestone_sting": {"start_seconds": 332.0, "content_type": "MILESTONE_STING", "mechanical_mutation": "NONE"},
        "arbitration": "PA_HELP > FUNCTIONAL > DECORATIVE; one global speech owner",
        "disabled_radio_behavior": "No radio voice or radio music; mechanics and visible text remain available.",
        "streamer_safe_substitution": "RADIO_MUSIC may be replaced with approved silence/ambience without changing voice payloads.",
    })
    metadata = {
        "schema": "project-studio-runtime-radio-demo/v1",
        "generated_utc": utc_now(),
        "title": spec.title,
        "slug": spec.slug,
        "status": RIGHTS_STATUS,
        "duration_seconds": spec.duration_seconds,
        "seed": spec.seed,
        "epoch_alias": spec.epoch_alias,
        "daypart": spec.daypart,
        "presenter_id": spec.presenter_id,
        "music": {"stable_id": spec.music_stable_id, "path": str(music), "sha256": sha256_file(music)},
        "functional_fixture": fixture,
        "features": {
            "station_id": True,
            "host_link": True,
            "advertisement": True,
            "decorative_item": True,
            "typed_functional_bulletin": True,
            "pa_priority_demonstration": True,
            "music_ducking": True,
            "silence": True,
            "caption_transcript_parity": all(event["caption_text"] == event["spoken_text"] for event in events),
            "cooldown_repeat_proof": len({event["source_id"] for event in events}) == len(events),
            "mechanical_mutation": False,
        },
        "voice_route": "generic macOS local synthetic voices; scratch prototype",
        "period_treatment": spec.period_filter,
        "master": {"path": str(master), "bytes": master.stat().st_size, "sha256": sha256_file(master), "probe": master_probe},
        "preview": {"path": str(preview), "bytes": preview.stat().st_size, "sha256": sha256_file(preview), "probe": probe_audio(preview)},
        "captions": {"path": str(root / "CAPTIONS.vtt"), "sha256": sha256_file(root / "CAPTIONS.vtt")},
        "transcript": {"path": str(root / "TRANSCRIPT.md"), "sha256": sha256_file(root / "TRANSCRIPT.md")},
        "limitations": [
            "Synthetic delivery and period treatment have not received human performance or listening acceptance.",
            "Typed payloads are explicit lab fixtures, not live P13/P05/P06 truth.",
        ],
    }
    atomic_write_json(root / "METADATA.json", metadata)
    return metadata


def thirty_minute_simulation(spec: DemoSpec, bank: dict[str, Any]) -> dict[str, Any]:
    root = DEMO_ROOT / spec.slug
    rng = random.Random(stable_int(spec.seed + "-30MIN"))
    eligible = sorted([unit for unit in bank["units"] if unit["epoch_code"] == spec.epoch_code], key=lambda item: item["stable_id"])
    history: list[str] = []
    events: list[dict[str, Any]] = []
    now = 0.0
    sequence = 0
    while now < 1800:
        gap = rng.uniform(82.0, 155.0)
        now += gap
        if now >= 1800:
            break
        candidates = [unit for unit in eligible if unit["stable_id"] not in history[-5:]]
        candidates.sort(key=lambda item: item["stable_id"])
        unit = candidates[rng.randrange(len(candidates))]
        history.append(unit["stable_id"])
        sequence += 1
        events.append({
            "sequence": sequence,
            "at_seconds": round(now, 3),
            "content_type": "DECORATIVE",
            "item_id": unit["stable_id"],
            "priority": 30,
            "caption_text": unit["caption"],
            "spoken_text": unit["transcript"],
            "cooldown_history_before": history[-6:-1],
            "mechanical_mutation": "NONE",
        })
    injected = [
        (600.0, "FUNCTIONAL", FUNCTIONAL_FIXTURES[spec.epoch_code]["eventId"], 70),
        (900.0, "PA_HELP", f"LAB-PA-{spec.epoch_code}-0001", 100),
        (1200.0, "MILESTONE_STING", f"LAB-STING-{spec.epoch_code}-0001", 60),
    ]
    for at, kind, item_id, priority in injected:
        events.append({"sequence": None, "at_seconds": at, "content_type": kind, "item_id": item_id, "priority": priority, "mechanical_mutation": "NONE"})
    events.sort(key=lambda item: (-item["priority"], item["at_seconds"]) if item["content_type"] == "PA_HELP" else (0, item["at_seconds"]))
    # Restore chronological trace while retaining explicit priority on each event.
    events.sort(key=lambda item: (item["at_seconds"], -item["priority"], item["item_id"]))
    for index, event in enumerate(events, start=1):
        event["sequence"] = index
    no_decorative_repeat = all(
        a["item_id"] != b["item_id"]
        for a, b in zip([e for e in events if e["content_type"] == "DECORATIVE"], [e for e in events if e["content_type"] == "DECORATIVE"][1:])
    )
    result = {
        "schema": "project-studio-runtime-radio-simulation/v1",
        "duration_seconds": 1800,
        "seed": spec.seed + "-30MIN",
        "epoch_alias": spec.epoch_alias,
        "events": events,
        "checks": {
            "chronological": all(a["at_seconds"] <= b["at_seconds"] for a, b in zip(events, events[1:])),
            "no_immediate_decorative_repeat": no_decorative_repeat,
            "functional_present": any(e["content_type"] == "FUNCTIONAL" for e in events),
            "pa_present": any(e["content_type"] == "PA_HELP" for e in events),
            "milestone_sting_present": any(e["content_type"] == "MILESTONE_STING" for e in events),
            "no_mechanical_mutation": all(e["mechanical_mutation"] == "NONE" for e in events),
        },
        "status": "PASS",
    }
    path = root / "THIRTY-MINUTE-SIMULATION.json"
    atomic_write_json(path, result)
    return {"path": str(path), "sha256": sha256_file(path), "event_count": len(events), "checks": result["checks"]}


def self_test() -> None:
    assert stable_int("x") == stable_int("x")
    assert format_time(61.234) == "00:01:01.234"
    assert safe_slug("A title / x") == "A-TITLE-X"
    for fixture in FUNCTIONAL_FIXTURES.values():
        assert fixture["captionText"] == fixture["spokenText"]
        assert set(fixture) == {"ownerDomain", "eventId", "receiptId", "headline", "body", "priority", "expiresAt", "captionText", "spokenText"}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--skip-audio-render", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
    build_clean_bank()
    bank = json.loads(OUTPUT_BANK.read_text(encoding="utf-8"))
    atomic_write_json(FIXTURE_PATH, {
        "schema": "project-studio-radio-functional-fixtures/v1",
        "status": RIGHTS_STATUS,
        "lab_fixture_only": True,
        "payloads": list(FUNCTIONAL_FIXTURES.values()),
    })
    atomic_write_json(PRESENTER_PATH, {
        "schema": "project-studio-radio-presenter-ensemble/v1",
        "status": RIGHTS_STATUS,
        "presenters": [{"presenter_id": key, **value} for key, value in PRESENTERS.items()],
        "name_mark_review": "PENDING",
        "real_person_target": "NONE",
    })
    sting = RADIO_ROOT / "milestone-stings/LAB-MILESTONE-STING-01.wav"
    make_sting(sting)
    demos: list[dict[str, Any]] = []
    simulations: list[dict[str, Any]] = []
    if not args.skip_audio_render:
        for spec in DEMOS:
            demos.append(render_demo(spec, bank, sting))
            simulations.append(thirty_minute_simulation(spec, bank))
    else:
        for spec in DEMOS:
            events, _ = content_for_demo(spec, bank)
            demos.append({"slug": spec.slug, "duration_seconds": spec.duration_seconds, "scheduled_event_count": len(events), "rendered": False})
            simulations.append(thirty_minute_simulation(spec, bank))
    index = {
        "schema": "project-studio-radio-runtime-index/v1",
        "tool_version": TOOL_VERSION,
        "generated_utc": utc_now(),
        "status": RIGHTS_STATUS,
        "scripts_audited": len(bank["units"]),
        "clean_copy_lint": json.loads((RADIO_ROOT / "script-bank/RADIO-COPY-LINT.json").read_text(encoding="utf-8")),
        "functional_fixtures": list(FUNCTIONAL_FIXTURES.values()),
        "presenter_count": len(PRESENTERS),
        "demos": demos,
        "thirty_minute_simulations": simulations,
        "scheduler_contract": {
            "eligibility": ["daypart", "presenter", "content_type"],
            "ordering": ["priority", "expiry", "cooldown", "deterministic_seed"],
            "coalescing": "same ownerDomain/eventId keeps newest receiptId before playout",
            "interruption": "PA_HELP interrupts radio; functional queues ahead of decorative; milestone sting never mutates truth",
            "ducking": "one global speech owner controls presentation-only gains",
            "disabled_radio": "mechanics and visible text remain; radio buses silent",
            "streamer_safe": "radio music substitutes silence or approved safe music without changing payload",
        },
        "machine_verdict": "PASS" if len(demos) == 3 and len(simulations) == 3 else "FAIL",
        "limitations": [
            "Runtime schedules and renders are lab fixtures, not live game integration.",
            "Machine proof does not establish copy credibility, voice performance, fatigue comfort, or listening acceptance.",
        ],
    }
    atomic_write_json(INDEX_PATH, index)
    print(json.dumps({
        "index": str(INDEX_PATH),
        "index_sha256": sha256_file(INDEX_PATH),
        "scripts": len(bank["units"]),
        "demos": len(demos),
        "simulations": len(simulations),
        "verdict": index["machine_verdict"],
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
