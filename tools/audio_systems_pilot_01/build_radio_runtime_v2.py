#!/usr/bin/env python3
"""Build scheduler-produced, runtime-paced Studio Radio v2 evidence and renders."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import platform
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from build_radio_runtime import find_music, format_time, make_sting, run_atomic
from common import PILOT_ROOT, atomic_write_json, atomic_write_text, probe_audio, sha256_file
from radio_copy_linter_v2 import OUTPUT_BANK, LINT_REPORT, build as build_clean_bank, lint_text


TOOL_VERSION = "project-studio-runtime-radio-builder-v2"
EVIDENCE_CREATED_AT = "2026-09-03T00:00:00Z"
RIGHTS_STATUS = "PROTOTYPE_ONLY"
REPO_ROOT = Path(__file__).resolve().parents[2]
RADIO_ROOT = PILOT_ROOT / "06_radio"
DEMO_ROOT = RADIO_ROOT / "demos-v2"
SCHEDULER_ROOT = RADIO_ROOT / "scheduler-evidence"
INPUT_PATH = SCHEDULER_ROOT / "RADIO-SCHEDULER-INPUT.v2.json"
EVIDENCE_PATH = SCHEDULER_ROOT / "RADIO-SCHEDULER-EVIDENCE.v2.json"
FIXTURE_PATH = RADIO_ROOT / "functional-fixtures.v2.json"
PRESENTER_PATH = RADIO_ROOT / "presenter-ensemble.v2.json"
INDEX_PATH = RADIO_ROOT / "STUDIO-RADIO-RUNTIME-INDEX.v2.json"


@dataclass(frozen=True)
class DemoSpec:
    slug: str
    title: str
    epoch_code: str
    epoch_alias: str
    music_stable_id: str
    presenter_id: str
    duration_seconds: int
    seed: str
    daypart: str
    base_rate_wpm: int
    period_filter: str
    opening_source_ids: tuple[str, ...]
    interruptible_source_ids: tuple[str, ...]
    queue_source_id: str


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
        slug="EARLY-NETWORK-GOLDEN-STUDIO-V2",
        title="Early Network / Golden Studio",
        epoch_code="E02",
        epoch_alias="network_sound_1933_1945",
        music_stable_id="MUS-02-NSD-04__seed-196613",
        presenter_id="PRESENTER-MAE-CALDER",
        duration_seconds=660,
        seed="APS01-RADIO-EARLY-1938-V2",
        daypart="MORNING",
        base_rate_wpm=148,
        period_filter="highpass=f=170,lowpass=f=5200,acompressor=threshold=-24dB:ratio=3:attack=12:release=180,asoftclip=type=tanh:threshold=0.88:output=0.94",
        opening_source_ids=("SR-E02-ID-03", "SR-E02-LNK-01", "SR-E02-ADV-02", "SR-E02-HNW-01"),
        interruptible_source_ids=("SR-E02-LNK-02", "SR-E02-LNK-03", "SR-E02-HNW-02"),
        queue_source_id="SR-E02-SGN-01",
    ),
    DemoSpec(
        slug="POSTWAR-PERSONALITY-TAPE-HIFI-V2",
        title="Postwar Personality / Tape Hi-Fi Transition",
        epoch_code="E03",
        epoch_alias="tape_hifi_1946_1959",
        music_stable_id="MUS-03-THF-01__seed-130363",
        presenter_id="PRESENTER-ARTHUR-VALE",
        duration_seconds=660,
        seed="APS01-RADIO-POSTWAR-1952-V2",
        daypart="AFTERNOON",
        base_rate_wpm=158,
        period_filter="highpass=f=125,lowpass=f=7600,acompressor=threshold=-25dB:ratio=2.7:attack=10:release=165,asoftclip=type=tanh:threshold=0.92:output=0.96",
        opening_source_ids=("SR-E03-ID-03", "SR-E03-LNK-01", "SR-E03-ADV-02", "SR-E03-HNW-02"),
        interruptible_source_ids=("SR-E03-LNK-02", "SR-E03-LNK-03", "SR-E03-HNW-01"),
        queue_source_id="SR-E03-SGN-01",
    ),
    DemoSpec(
        slug="DIGITAL-NETWORKED-HYBRID-V2",
        title="Digital / Networked Hybrid",
        epoch_code="E07",
        epoch_alias="networked_hybrid_2000_2014",
        music_stable_id="MUS-07-NHY-01__seed-104729",
        presenter_id="PRESENTER-RINA-SHORE",
        duration_seconds=660,
        seed="APS01-RADIO-NETWORK-2008-V2",
        daypart="EVENING",
        base_rate_wpm=172,
        period_filter="highpass=f=75,lowpass=f=14500,acompressor=threshold=-27dB:ratio=2:attack=7:release=130,asoftclip=type=tanh:threshold=0.97:output=0.98",
        opening_source_ids=("SR-E07-ID-02", "SR-E07-LNK-02", "SR-E07-ADV-01", "SR-E07-HNW-01"),
        interruptible_source_ids=("SR-E07-LNK-01", "SR-E07-LNK-03", "SR-E07-HNW-02"),
        queue_source_id="SR-E07-SGN-01",
    ),
)


FUNCTIONAL_TEXT = {
    "E02": ("Workshop pickup trial logged", "Workshop bulletin: the camera team logged a successful electrical pickup trial and filed the result for review.", "P13_AUDIO_LAB_FIXTURE"),
    "E03": ("Dubbing comparison complete", "Production bulletin: the dubbing room completed its scheduled comparison and placed the written result in the lab record.", "P05_AUDIO_LAB_FIXTURE"),
    "E07": ("Release result archived", "Release bulletin: the release desk archived the latest result and placed the same summary in the written record.", "P06_AUDIO_LAB_FIXTURE"),
}


def command_first_line(argv: list[str]) -> str:
    completed = subprocess.run(argv, capture_output=True, text=True, check=False)
    value = (completed.stdout or completed.stderr).splitlines()
    return value[0] if value else "UNAVAILABLE"


def tool_environment() -> dict[str, Any]:
    say = Path("/usr/bin/say")
    ffmpeg = Path(subprocess.run(["which", "ffmpeg"], capture_output=True, text=True, check=True).stdout.strip())
    return {
        "os": {
            "name": platform.system(),
            "version": command_first_line(["sw_vers", "-productVersion"]),
            "build": command_first_line(["sw_vers", "-buildVersion"]),
            "architecture": platform.machine(),
        },
        "say": {
            "path": str(say),
            "bytes": say.stat().st_size,
            "sha256": sha256_file(say),
            "version": "NO_VERSION_FLAG; executable identity pinned by OS build, byte size, and SHA-256",
        },
        "ffmpeg": {
            "path": str(ffmpeg),
            "bytes": ffmpeg.stat().st_size,
            "sha256": sha256_file(ffmpeg),
            "version": command_first_line([str(ffmpeg), "-version"]),
        },
    }


def word_count(text: str) -> int:
    return len(text.replace("—", " ").split())


def estimate_duration(text: str, rate_wpm: int) -> float:
    return round(max(2.0, word_count(text) * 60.0 / rate_wpm + 0.9), 6)


def unit_map(bank: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {unit["stable_id"]: unit for unit in bank["units"]}


def resolve_text(units: dict[str, dict[str, Any]], source_ids: tuple[str, ...]) -> str:
    resolved = []
    for stable_id in source_ids:
        unit = units[stable_id]
        if not unit["runtime_eligible"]:
            raise RuntimeError(f"withheld item cannot enter runtime copy: {stable_id}")
        resolved.append(unit["transcript"])
    text = " ".join(resolved)
    findings = lint_text("+".join(source_ids), "spokenText", text)
    if findings:
        raise RuntimeError(f"resolved copy lint failure: {findings}")
    return text


def functional_payload(spec: DemoSpec, receipt_suffix: str = "0001", *, expired: bool = False) -> dict[str, Any]:
    headline, spoken, owner = FUNCTIONAL_TEXT[spec.epoch_code]
    event_id = f"LAB-{spec.epoch_code}-FUNCTIONAL-BULLETIN"
    return {
        "ownerDomain": owner,
        "eventId": event_id,
        "receiptId": f"LAB-RECEIPT-{spec.epoch_code}-{receipt_suffix}",
        "headline": headline,
        "body": spoken.removesuffix("."),
        "priority": 70,
        "expiresAt": "2026-09-02T00:00:00Z" if expired else "2099-01-01T00:00:00Z",
        "captionText": spoken,
        "spokenText": spoken,
        "source": "EXPLICIT_AUDIO_LAB_FIXTURE",
        "fixtureVersion": "audio-systems-pilot-radio-fixture/v2",
        "locale": "en-US",
        "createdAt": EVIDENCE_CREATED_AT,
        "deterministicSeed": spec.seed,
    }


def pa_payload(spec: DemoSpec) -> dict[str, Any]:
    spoken = "Stage two access is paused while the loading lane is cleared. The same notice is available on screen."
    return {
        "ownerDomain": "PA_HELP_AUDIO_LAB_FIXTURE",
        "eventId": f"LAB-PA-{spec.epoch_code}-ACCESS-PAUSED",
        "receiptId": f"LAB-RECEIPT-PA-{spec.epoch_code}-0001",
        "headline": "Stage access paused",
        "body": spoken,
        "priority": 100,
        "expiresAt": "2099-01-01T00:00:00Z",
        "captionText": spoken,
        "spokenText": spoken,
        "source": "EXPLICIT_AUDIO_LAB_FIXTURE",
        "fixtureVersion": "audio-systems-pilot-radio-fixture/v2",
        "locale": "en-US",
        "createdAt": EVIDENCE_CREATED_AT,
        "deterministicSeed": f"{spec.seed}-PA",
    }


def radio_item(
    *,
    item_id: str,
    content_type: str,
    category: str,
    text: str,
    presenter_id: str,
    daypart: str,
    duration: float,
    priority: int,
    cooldown: int,
    category_cooldown: int,
    payload: dict[str, Any] | None = None,
    coalesce_key: str | None = None,
    expires_at: str | None = None,
    streamer_safe: bool = True,
) -> dict[str, Any]:
    return {
        "id": item_id,
        "contentType": content_type,
        "category": category,
        "dayparts": [daypart],
        "presenters": [presenter_id],
        "priority": priority,
        "cooldownSeconds": cooldown,
        "categoryCooldownSeconds": category_cooldown,
        "durationSeconds": duration,
        "expiresAt": expires_at,
        "coalesceKey": coalesce_key,
        "captionText": text,
        "spokenText": text,
        "payload": payload,
        "streamerSafeEligible": streamer_safe,
    }


def render_voice(
    spec: DemoSpec,
    role: str,
    text: str,
    presenter_id: str,
    rate_wpm: int,
    environment: dict[str, Any],
) -> dict[str, Any]:
    presenter = PRESENTERS[presenter_id]
    root = DEMO_ROOT / spec.slug / "voice" / role
    clean = root / "CLEAN.wav"
    treated = root / "PERIOD-TREATED.wav"
    sidecar = root / "metadata.v2.json"
    text_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
    if sidecar.exists() and clean.exists() and treated.exists():
        previous = json.loads(sidecar.read_text(encoding="utf-8"))
        if previous.get("tool_version") != TOOL_VERSION or previous.get("spoken_text_sha256") != text_hash:
            raise RuntimeError(f"immutable voice identity collision: {sidecar}")
        if sha256_file(clean) != previous["clean"]["sha256"] or sha256_file(treated) != previous["period_treated"]["sha256"]:
            raise RuntimeError(f"immutable voice hash mismatch: {sidecar}")
        return previous
    root.mkdir(parents=True, exist_ok=True)
    descriptor, temp_name = tempfile.mkstemp(prefix=f".{role}.", suffix=".aiff", dir=root)
    os.close(descriptor)
    aiff = Path(temp_name)
    aiff.unlink()
    try:
        say_command = [
            "/usr/bin/say", "-v", presenter["local_voice"], "-r", str(rate_wpm),
            "-o", str(aiff), text,
        ]
        subprocess.run(say_command, check=True, capture_output=True, text=True)
        clean_command = [
            "ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(aiff),
            "-af", "highpass=f=65,lowpass=f=15500,alimiter=limit=0.88",
            "-ar", "48000", "-ac", "1", "-c:a", "pcm_s24le", "{OUTPUT}",
        ]
        run_atomic(clean_command, clean)
        treated_command = [
            "ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(clean),
            "-af", spec.period_filter,
            "-ar", "48000", "-ac", "1", "-c:a", "pcm_s24le", "{OUTPUT}",
        ]
        run_atomic(treated_command, treated)
    finally:
        aiff.unlink(missing_ok=True)
    metadata = {
        "schema": "project-studio-radio-voice-render/v2",
        "tool_version": TOOL_VERSION,
        "evidence_created_at": EVIDENCE_CREATED_AT,
        "role": role,
        "presenter_id": presenter_id,
        "presenter_display_name": presenter["display_name"],
        "generic_local_voice": presenter["local_voice"],
        "spoken_text": text,
        "spoken_text_sha256": text_hash,
        "performance": {
            "actual_rate_wpm_argument": rate_wpm,
            "word_count": word_count(text),
            "syntax_source": "resolved clean v2 script-bank copy or explicit typed lab payload",
            "rhythm_and_breath_grouping": "punctuation-delimited clauses preserved; no time compression",
            "diction": presenter["performance"],
            "historical_review": "PENDING",
            "cultural_review": "PENDING",
        },
        "clean": {"path": str(clean), "sha256": sha256_file(clean), "probe": probe_audio(clean)},
        "period_treated": {
            "path": str(treated),
            "sha256": sha256_file(treated),
            "probe": probe_audio(treated),
            "filter": spec.period_filter,
            "classification": "BOUNDED PERIOD-PRESENTATION DIAGNOSTIC; NOT HISTORICAL PROOF",
        },
        "reproducible_commands": {
            "say": ["/usr/bin/say", "-v", presenter["local_voice"], "-r", str(rate_wpm), "-o", "{TEMP_AIFF}", text],
            "clean_ffmpeg": clean_command,
            "treated_ffmpeg": treated_command,
        },
        "tool_environment": environment,
        "route": "macOS built-in generic synthetic speech; local scratch prototype",
        "redistribution_caveat": "No redistribution or commercial-use conclusion is made for macOS system-voice output. Keep these renders local and prototype-only pending explicit rights review.",
        "prohibitions": ["NO_REAL_PERSON_IMITATION", "NO_VOICE_CLONING", "NO_CELEBRITY_OR_PROTECTED_CHARACTER_TARGET"],
        "rights_status": RIGHTS_STATUS,
        "human_disposition": "PENDING",
    }
    atomic_write_json(sidecar, metadata)
    return metadata


def build_plan(spec: DemoSpec, bank: dict[str, Any], environment: dict[str, Any]) -> tuple[dict[str, Any], dict[str, dict[str, Any]]]:
    units = unit_map(bank)
    opening_text = resolve_text(units, spec.opening_source_ids)
    interrupt_text = resolve_text(units, spec.interruptible_source_ids)
    queue_text = units[spec.queue_source_id]["transcript"]
    functional = functional_payload(spec)
    pa = pa_payload(spec)
    rates = {
        "opening": spec.base_rate_wpm,
        "functional": max(135, spec.base_rate_wpm - 5),
        "interruptible": max(132, spec.base_rate_wpm - 10),
        "pa": 176,
    }
    voice_records = {
        "opening": render_voice(spec, "OPENING", opening_text, spec.presenter_id, rates["opening"], environment),
        "functional": render_voice(spec, "FUNCTIONAL", functional["spokenText"], spec.presenter_id, rates["functional"], environment),
        "interruptible": render_voice(spec, "INTERRUPTIBLE", interrupt_text, spec.presenter_id, rates["interruptible"], environment),
        "pa": render_voice(spec, "PA", pa["spokenText"], "PRESENTER-RINA-SHORE", rates["pa"], environment),
    }
    durations = {key: record["period_treated"]["probe"]["duration_seconds"] for key, record in voice_records.items()}
    if durations["interruptible"] <= 20:
        raise RuntimeError(f"{spec.slug} interruptible voice must exceed 20 seconds: {durations}")
    if durations["opening"] + durations["interruptible"] > 75:
        raise RuntimeError(f"{spec.slug} elective voice budget exceeded before scheduling: {durations}")
    functional_key = f"{functional['ownerDomain']}:{functional['eventId']}"
    older = functional_payload(spec, "0000")
    expired_payload = functional_payload(spec, "EXPIRED", expired=True)
    expired_key = f"{expired_payload['ownerDomain']}:{expired_payload['eventId']}:EXPIRED"
    items = {
        "opening": radio_item(
            item_id=f"{spec.slug}-OPENING", content_type="DECORATIVE",
            category="station_id+host_link+fictional_advertisement+decorative_item",
            text=opening_text, presenter_id=spec.presenter_id, daypart=spec.daypart,
            duration=durations["opening"], priority=35, cooldown=7200, category_cooldown=900,
        ),
        "functionalNew": radio_item(
            item_id=f"{functional['eventId']}@{functional['receiptId']}", content_type="FUNCTIONAL", category="functional_bulletin",
            text=functional["spokenText"], presenter_id=spec.presenter_id, daypart=spec.daypart,
            duration=durations["functional"], priority=70, cooldown=3600, category_cooldown=0,
            payload=functional, coalesce_key=functional_key, expires_at=functional["expiresAt"],
        ),
        "functionalOld": radio_item(
            item_id=f"{older['eventId']}@{older['receiptId']}", content_type="FUNCTIONAL", category="functional_bulletin",
            text=older["spokenText"], presenter_id=spec.presenter_id, daypart=spec.daypart,
            duration=durations["functional"], priority=70, cooldown=3600, category_cooldown=0,
            payload=older, coalesce_key=functional_key, expires_at=older["expiresAt"],
        ),
        "expired": radio_item(
            item_id=f"{expired_payload['eventId']}@EXPIRED", content_type="FUNCTIONAL", category="functional_bulletin",
            text=expired_payload["spokenText"], presenter_id=spec.presenter_id, daypart=spec.daypart,
            duration=durations["functional"], priority=69, cooldown=3600, category_cooldown=0,
            payload=expired_payload, coalesce_key=expired_key, expires_at=expired_payload["expiresAt"],
        ),
        "milestone": radio_item(
            item_id=f"LAB-STING-{spec.epoch_code}-V2", content_type="MILESTONE_STING", category="milestone_sting",
            text="", presenter_id=spec.presenter_id, daypart=spec.daypart, duration=1.25,
            priority=60, cooldown=1800, category_cooldown=900,
        ),
        "interruptible": radio_item(
            item_id=f"{spec.slug}-INTERRUPTIBLE", content_type="DECORATIVE", category="host_link_interrupt_demo",
            text=interrupt_text, presenter_id=spec.presenter_id, daypart=spec.daypart,
            duration=durations["interruptible"], priority=30, cooldown=7200, category_cooldown=900,
        ),
        "pa": radio_item(
            item_id=pa["eventId"], content_type="PA_HELP", category="urgent_pa",
            text=pa["spokenText"], presenter_id=spec.presenter_id, daypart=spec.daypart,
            duration=durations["pa"], priority=100, cooldown=300, category_cooldown=0,
            payload=pa, expires_at=pa["expiresAt"],
        ),
        "queuedDecorative": radio_item(
            item_id=f"{spec.slug}-QUEUED", content_type="DECORATIVE", category="signoff_transition",
            text=queue_text, presenter_id=spec.presenter_id, daypart=spec.daypart,
            duration=estimate_duration(queue_text, spec.base_rate_wpm), priority=30, cooldown=3600, category_cooldown=900,
        ),
        "streamerUnsafe": radio_item(
            item_id=f"{spec.slug}-STREAMER-UNSAFE", content_type="DECORATIVE", category="licensed_music_link",
            text=queue_text, presenter_id=spec.presenter_id, daypart=spec.daypart,
            duration=estimate_duration(queue_text, spec.base_rate_wpm), priority=30, cooldown=3600, category_cooldown=900,
            streamer_safe=False,
        ),
    }
    simulation_units = [
        units[spec.opening_source_ids[0]],
        units[spec.opening_source_ids[2]],
        units[spec.opening_source_ids[3]],
    ]
    simulation_decorative = [
        radio_item(
            item_id=unit["stable_id"], content_type="DECORATIVE", category=unit["function"],
            text=unit["transcript"], presenter_id=spec.presenter_id, daypart=spec.daypart,
            duration=estimate_duration(unit["transcript"], spec.base_rate_wpm), priority=30,
            cooldown=7200 if "link" in unit["function"] else 5400 if "advertisement" in unit["function"] else 3600,
            category_cooldown=900,
        )
        for unit in simulation_units
    ]
    simulation_slots = [
        {"atSeconds": 30, "presenterId": spec.presenter_id, "items": [simulation_decorative[0]]},
        {"atSeconds": 330, "presenterId": spec.presenter_id, "items": [simulation_decorative[1]]},
        {"atSeconds": 630, "presenterId": spec.presenter_id, "items": [items["functionalOld"], items["functionalNew"], items["expired"]]},
        {"atSeconds": 930, "presenterId": spec.presenter_id, "items": [items["pa"], items["queuedDecorative"]]},
        {"atSeconds": 1230, "presenterId": spec.presenter_id, "items": [items["milestone"]]},
        {"atSeconds": 1530, "presenterId": spec.presenter_id, "items": [simulation_decorative[2]]},
    ]
    plan = {
        "slug": spec.slug,
        "title": spec.title,
        "epochCode": spec.epoch_code,
        "epochAlias": spec.epoch_alias,
        "durationSeconds": spec.duration_seconds,
        "seed": spec.seed,
        "daypart": spec.daypart,
        "presenterId": spec.presenter_id,
        "items": items,
        "simulationSlots": simulation_slots,
    }
    return plan, voice_records


def run_scheduler(input_path: Path, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    completed = subprocess.run(
        [
            str(REPO_ROOT / "node_modules/.bin/vite-node"),
            str(REPO_ROOT / "tools/audio_systems_pilot_01/build-radio-schedule-evidence.ts"),
            str(input_path),
            str(output_path),
        ],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )
    if completed.returncode != 0:
        raise RuntimeError(f"scheduler evidence failed ({completed.returncode}):\n{completed.stdout}\n{completed.stderr}")


def caption_display(event: dict[str, Any], presenter: dict[str, Any]) -> str:
    context = "[over PA]" if event["item"]["contentType"] == "PA_HELP" else "[over radio]"
    return f"{context} {presenter['display_name']}: {event['item']['captionText']}"


def render_demo(spec: DemoSpec, schedule: dict[str, Any], voice_records: dict[str, dict[str, Any]], sting: Path) -> dict[str, Any]:
    root = DEMO_ROOT / spec.slug
    root.mkdir(parents=True, exist_ok=True)
    events = schedule["events"]
    voice_by_id = {
        f"{spec.slug}-OPENING": voice_records["opening"],
        f"LAB-{spec.epoch_code}-FUNCTIONAL-BULLETIN@LAB-RECEIPT-{spec.epoch_code}-0001": voice_records["functional"],
        f"{spec.slug}-INTERRUPTIBLE": voice_records["interruptible"],
        f"LAB-PA-{spec.epoch_code}-ACCESS-PAUSED": voice_records["pa"],
    }
    input_args = ["-stream_loop", "-1", "-i", str(find_music(spec.music_stable_id))]
    enable = "+".join(f"between(t,{window['startSeconds']},{window['endSeconds']})" for window in schedule["musicWindows"])
    filters = [f"[0:a]atrim=duration={spec.duration_seconds},asetpts=PTS-STARTPTS,volume='0.28*gt({enable},0)'[music]"]
    speech_labels: list[str] = []
    delivered: list[dict[str, Any]] = []
    for event in events:
        item = event["item"]
        if item["contentType"] == "MILESTONE_STING":
            continue
        record = voice_by_id[item["id"]]
        source = Path(record["period_treated"]["path"])
        input_args.extend(["-i", str(source)])
        input_index = len(speech_labels) + 1
        at = event["atSeconds"]
        declared = item["durationSeconds"]
        played = 20.0 if item["id"] == f"{spec.slug}-INTERRUPTIBLE" else declared
        end = at + played
        filters.append(f"[{input_index}:a]atrim=duration={played},asetpts=PTS-STARTPTS,adelay={int(round(at * 1000))},aformat=channel_layouts=stereo[v{input_index}]")
        speech_labels.append(f"[v{input_index}]")
        delivered.append({
            **event,
            "declaredDurationSeconds": declared,
            "audioPlayedSeconds": played,
            "endSeconds": round(end, 6),
            "deliveryStatus": "INTERRUPTED_BY_PA" if played < declared else "PLAYED",
            "captionContext": "OVER_PA" if item["contentType"] == "PA_HELP" else "OVER_RADIO",
            "speaker": PRESENTERS["PRESENTER-RINA-SHORE"]["display_name"] if item["contentType"] == "PA_HELP" else PRESENTERS[spec.presenter_id]["display_name"],
        })
    sting_index = len(speech_labels) + 1
    input_args.extend(["-i", str(sting)])
    filters.append(f"[{sting_index}:a]adelay=330000,aformat=channel_layouts=stereo[sting]")
    speech_labels.append("[sting]")
    filters.append("".join(speech_labels) + f"amix=inputs={len(speech_labels)}:normalize=0:dropout_transition=0,alimiter=limit=0.90[speech]")
    filters.append("[music][speech]sidechaincompress=threshold=0.018:ratio=10:attack=15:release=700[ducked]")
    filters.append("[ducked][speech]amix=inputs=2:weights='1 1':normalize=0,alimiter=limit=0.94[out]")
    master = root / f"{spec.slug}-RUNTIME-DEMO.wav"
    preview = root / f"{spec.slug}-RUNTIME-DEMO.m4a"
    if not master.exists():
        run_atomic([
            "ffmpeg", "-nostdin", "-v", "error", "-y", *input_args,
            "-filter_complex", ";".join(filters), "-map", "[out]", "-t", str(spec.duration_seconds),
            "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", "{OUTPUT}",
        ], master)
    if not preview.exists():
        run_atomic([
            "ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(master),
            "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "{OUTPUT}",
        ], preview)
    if abs(probe_audio(master)["duration_seconds"] - spec.duration_seconds) > 0.01:
        raise RuntimeError(f"duration mismatch: {master}")

    caption_rows: list[tuple[float, float, str]] = []
    transcript = [f"# {spec.title} — v2 transcript", "", "Every resolved core text is retained with speaker, context, and delivery status.", ""]
    for event in delivered:
        speaker_key = "PRESENTER-RINA-SHORE" if event["item"]["contentType"] == "PA_HELP" else spec.presenter_id
        display = caption_display(event, PRESENTERS[speaker_key])
        caption_rows.append((event["atSeconds"], event["endSeconds"], display))
        transcript.extend([
            f"## {format_time(event['atSeconds'])} — {event['item']['contentType']} — {event['item']['id']}",
            "",
            f"- Speaker: {event['speaker']}",
            f"- Context: {event['captionContext']}",
            f"- Delivery: {event['deliveryStatus']}",
            f"- Owner/event/receipt: {(event['item'].get('payload') or {}).get('ownerDomain', 'NONE')} / {(event['item'].get('payload') or {}).get('eventId', 'NONE')} / {(event['item'].get('payload') or {}).get('receiptId', 'NONE')}",
            "",
            event["item"]["spokenText"],
            "",
        ])
    caption_rows.append((330.0, 331.25, "[important sound] Milestone sting. No mechanical change."))
    caption_rows.sort(key=lambda row: row[0])
    captions = ["WEBVTT", ""]
    for index, (start, end, display) in enumerate(caption_rows, start=1):
        captions.extend([str(index), f"{format_time(start)} --> {format_time(end)}", display, ""])
    atomic_write_text(root / "CAPTIONS.v2.vtt", "\n".join(captions) + "\n")
    atomic_write_text(root / "TRANSCRIPT.v2.md", "\n".join(transcript))
    rendered_schedule = {
        **schedule,
        "deliveredVoiceEvents": delivered,
        "captionLaw": "Display label adds speaker/context; captionText and spokenText retain byte-identical resolved core.",
        "audioRender": "Every voiced playout derives from a scheduler-accepted event. INTERRUPTIBLE is physically trimmed at the PA boundary.",
    }
    atomic_write_json(root / "SCHEDULE.v2.json", rendered_schedule)
    simulation = next(row for row in json.loads(EVIDENCE_PATH.read_text(encoding="utf-8"))["simulations"] if row["epochAlias"] == spec.epoch_alias)
    atomic_write_json(root / "THIRTY-MINUTE-SIMULATION.v2.json", simulation)
    metadata = {
        "schema": "project-studio-runtime-radio-demo/v2",
        "tool_version": TOOL_VERSION,
        "evidence_created_at": EVIDENCE_CREATED_AT,
        "title": spec.title,
        "slug": spec.slug,
        "status": RIGHTS_STATUS,
        "duration_seconds": spec.duration_seconds,
        "seed": spec.seed,
        "epoch_alias": spec.epoch_alias,
        "epoch_code": spec.epoch_code,
        "historical_review": "PENDING",
        "cultural_review": "PENDING",
        "presenter_id": spec.presenter_id,
        "music": {"stable_id": spec.music_stable_id, "path": str(find_music(spec.music_stable_id)), "sha256": sha256_file(find_music(spec.music_stable_id))},
        "scheduler_evidence": {"path": str(EVIDENCE_PATH), "sha256": sha256_file(EVIDENCE_PATH), "demo_machine_verdict": schedule["machineVerdict"]},
        "master": {"path": str(master), "bytes": master.stat().st_size, "sha256": sha256_file(master), "probe": probe_audio(master)},
        "preview": {"path": str(preview), "bytes": preview.stat().st_size, "sha256": sha256_file(preview), "probe": probe_audio(preview)},
        "captions": {"path": str(root / "CAPTIONS.v2.vtt"), "sha256": sha256_file(root / "CAPTIONS.v2.vtt")},
        "transcript": {"path": str(root / "TRANSCRIPT.v2.md"), "sha256": sha256_file(root / "TRANSCRIPT.v2.md")},
        "voice_records": [{"role": role, "path": record["period_treated"]["path"], "sha256": record["period_treated"]["sha256"]} for role, record in voice_records.items()],
        "features": schedule["assertions"],
        "machine_verdict": "PASS" if schedule["machineVerdict"] == "PASS" else "FAIL",
        "limitations": [
            "Machine proof covers scheduler law, source identity, render duration, hash, and caption-core parity only.",
            "Voice performance, period credibility, name/mark, fatigue, historical/cultural judgment, and listening acceptance remain PENDING.",
        ],
    }
    atomic_write_json(root / "METADATA.v2.json", metadata)
    return metadata


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--skip-audio-render", action="store_true")
    args = parser.parse_args()
    lint_report = build_clean_bank()
    if lint_report["status"] != "PASS":
        raise RuntimeError("v2 radio copy must lint clean")
    bank = json.loads(OUTPUT_BANK.read_text(encoding="utf-8"))
    environment = tool_environment()
    plans: list[dict[str, Any]] = []
    voice_sets: dict[str, dict[str, dict[str, Any]]] = {}
    for spec in DEMOS:
        plan, voices = build_plan(spec, bank, environment)
        plans.append(plan)
        voice_sets[spec.slug] = voices
    scheduler_input = {
        "schema": "project-studio-radio-scheduler-input/v2",
        "evidenceCreatedAt": EVIDENCE_CREATED_AT,
        "bankSha256": sha256_file(OUTPUT_BANK),
        "plans": plans,
    }
    atomic_write_json(INPUT_PATH, scheduler_input)
    run_scheduler(INPUT_PATH, EVIDENCE_PATH)
    evidence = json.loads(EVIDENCE_PATH.read_text(encoding="utf-8"))
    if evidence["machineVerdict"] != "PASS":
        raise RuntimeError("scheduler evidence did not pass")
    fixtures = [functional_payload(spec) for spec in DEMOS]
    atomic_write_json(FIXTURE_PATH, {
        "schema": "project-studio-radio-functional-fixtures/v2",
        "evidence_created_at": EVIDENCE_CREATED_AT,
        "status": RIGHTS_STATUS,
        "lab_fixture_only": True,
        "payloads": fixtures,
        "validation": {
            "base_fields_present": all(set(("ownerDomain", "eventId", "receiptId", "headline", "body", "priority", "expiresAt", "captionText", "spokenText")).issubset(row) for row in fixtures),
            "annotations_present": all(set(("source", "fixtureVersion", "locale", "createdAt", "deterministicSeed")).issubset(row) for row in fixtures),
            "caption_spoken_core_parity": all(row["captionText"] == row["spokenText"] for row in fixtures),
        },
    })
    atomic_write_json(PRESENTER_PATH, {
        "schema": "project-studio-radio-presenter-ensemble/v2",
        "evidence_created_at": EVIDENCE_CREATED_AT,
        "status": RIGHTS_STATUS,
        "presenters": [{"presenter_id": key, **value} for key, value in PRESENTERS.items()],
        "name_mark_review": "PENDING",
        "real_person_target": "NONE",
        "voice_route": "generic macOS local synthetic voices; no cloning or imitation",
        "tool_environment": environment,
        "redistribution_caveat": "System-voice output remains local prototype material pending explicit rights review.",
    })
    sting = RADIO_ROOT / "milestone-stings/LAB-MILESTONE-STING-01.wav"
    make_sting(sting)
    demos = []
    if not args.skip_audio_render:
        for spec, schedule in zip(DEMOS, evidence["demos"], strict=True):
            demos.append(render_demo(spec, schedule, voice_sets[spec.slug], sting))
    index = {
        "schema": "project-studio-radio-runtime-index/v2",
        "tool_version": TOOL_VERSION,
        "evidence_created_at": EVIDENCE_CREATED_AT,
        "status": RIGHTS_STATUS,
        "scripts_audited": len(bank["units"]),
        "decorative_runtime_eligible": sum(unit["runtime_eligible"] for unit in bank["units"]),
        "technology_templates_withheld": sum(not unit["runtime_eligible"] for unit in bank["units"]),
        "clean_copy_lint": {"path": str(LINT_REPORT), "sha256": sha256_file(LINT_REPORT), "status": lint_report["status"]},
        "functional_fixtures": {"path": str(FIXTURE_PATH), "sha256": sha256_file(FIXTURE_PATH)},
        "presenters": {"path": str(PRESENTER_PATH), "sha256": sha256_file(PRESENTER_PATH), "count": len(PRESENTERS)},
        "scheduler_evidence": {"path": str(EVIDENCE_PATH), "sha256": sha256_file(EVIDENCE_PATH), "machine_verdict": evidence["machineVerdict"]},
        "demos": demos,
        "thirty_minute_simulations": [
            {
                "epoch_alias": simulation["epochAlias"],
                "machine_verdict": simulation["machineVerdict"],
                "accepted_event_count": len(simulation["acceptedEvents"]),
            }
            for simulation in evidence["simulations"]
        ],
        "machine_verdict": "PASS" if len(demos) == 3 and all(demo["machine_verdict"] == "PASS" for demo in demos) else "NOT_RENDERED" if args.skip_audio_render else "FAIL",
        "limitations": [
            "All technology script-bank templates remain withheld pending typed P13 truth and editorial sourcing.",
            "All voice, historical, cultural, fatigue, name/mark, rights, and listening dispositions remain PENDING.",
            "Machine scheduler and render proof is not human broadcaster credibility or acceptance.",
        ],
    }
    atomic_write_json(INDEX_PATH, index)
    if args.self_test:
        assert len(bank["units"]) == 126
        assert sum(not unit["runtime_eligible"] for unit in bank["units"]) == 18
        assert evidence["machineVerdict"] == "PASS"
        assert all(spec.duration_seconds == 660 for spec in DEMOS)
    print(json.dumps({
        "index": str(INDEX_PATH),
        "index_sha256": sha256_file(INDEX_PATH),
        "scheduler_evidence_sha256": sha256_file(EVIDENCE_PATH),
        "demos": len(demos),
        "machine_verdict": index["machine_verdict"],
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
