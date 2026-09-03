#!/usr/bin/env python3
"""Build scheduler-produced, runtime-paced Studio Radio v2 evidence and renders."""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import platform
import subprocess
import tempfile
from dataclasses import dataclass, replace
from pathlib import Path
from typing import Any

from build_radio_runtime import find_music, format_time, make_sting, run_atomic
from common import PILOT_ROOT, atomic_write_json, atomic_write_text, probe_audio, sha256_file
from radio_copy_linter_v2 import OUTPUT_BANK, LINT_REPORT, build as build_clean_bank, lint_text, self_test as lint_self_test


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
CLEAN_VOICE_FILTER = "highpass=f=65,lowpass=f=15500,alimiter=limit=0.88"


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


def canonical_sha256(value: Any) -> str:
    payload = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def reject_duplicate_json_keys(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise RuntimeError(f"duplicate JSON object key: {key}")
        result[key] = value
    return result


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=reject_duplicate_json_keys)
    except json.JSONDecodeError as error:
        raise RuntimeError(f"malformed JSON: {path}") from error


def rerender_atomic(argv: list[str], destination: Path) -> None:
    """Build output from its recipe every time; existing bytes are never treated as proof."""
    run_atomic(argv, destination)


PRESENTERS = {
    "PRESENTER-MAE-CALDER": {
        "display_name": "Mae Calder",
        "local_voice": "Kathy",
        "campaign_eligibility": ["E01", "E02", "E03", "E04", "E05", "E08"],
        "role_scoped_eligibility": {
            "PROGRAMME_PRESENTER": ["E01", "E02", "E03", "E04", "E05", "E08"],
            "PA_HELP_SPEAKER": [],
        },
        "performance": "Measured warmth, clear consonants, practical curiosity; never an era caricature.",
    },
    "PRESENTER-ARTHUR-VALE": {
        "display_name": "Arthur Vale",
        "local_voice": "Ralph",
        "campaign_eligibility": ["E02", "E03", "E04", "E05", "E06", "E07", "E09"],
        "role_scoped_eligibility": {
            "PROGRAMME_PRESENTER": ["E02", "E03", "E04", "E05", "E06", "E07", "E09"],
            "PA_HELP_SPEAKER": [],
        },
        "performance": "Dry observational timing, steady breath groups, low sales pressure.",
    },
    "PRESENTER-RINA-SHORE": {
        "display_name": "Rina Shore",
        "local_voice": "Samantha",
        "campaign_eligibility": ["E01", "E04", "E05", "E06", "E07", "E08", "E09"],
        "role_scoped_eligibility": {
            "PROGRAMME_PRESENTER": ["E01", "E04", "E05", "E06", "E07", "E08", "E09"],
            "PA_HELP_SPEAKER": ["E02", "E03", "E07"],
        },
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


def require_clean_resolved_fields(stable_id: str, fields: dict[str, str]) -> None:
    findings = [
        finding
        for field, text in fields.items()
        for finding in lint_text(stable_id, field, text)
    ]
    if findings:
        raise RuntimeError(f"generated runtime copy lint failure: {findings}")


def require_presenter_role(presenter_id: str, role: str, epoch_code: str) -> None:
    presenter = PRESENTERS.get(presenter_id)
    eligible = [] if presenter is None else presenter.get("role_scoped_eligibility", {}).get(role, [])
    if epoch_code not in eligible:
        raise RuntimeError(f"presenter role is not eligible: {presenter_id}/{role}/{epoch_code}")


def functional_payload(spec: DemoSpec, receipt_suffix: str = "0001", *, expired: bool = False) -> dict[str, Any]:
    headline, spoken, owner = FUNCTIONAL_TEXT[spec.epoch_code]
    event_id = f"LAB-{spec.epoch_code}-FUNCTIONAL-BULLETIN" + ("-EXPIRED-PROBE" if expired else "")
    payload = {
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
    require_clean_resolved_fields(event_id, {
        "headline": payload["headline"],
        "body": payload["body"],
        "captionText": payload["captionText"],
        "spokenText": payload["spokenText"],
    })
    return payload


def pa_payload(spec: DemoSpec) -> dict[str, Any]:
    spoken = "Stage two access is paused while the loading lane is cleared. The same notice is available on screen."
    payload = {
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
    require_clean_resolved_fields(payload["eventId"], {
        "headline": payload["headline"],
        "body": payload["body"],
        "captionText": payload["captionText"],
        "spokenText": payload["spokenText"],
    })
    return payload


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
    speaker_id: str | None = None,
    payload: dict[str, Any] | None = None,
    coalesce_key: str | None = None,
    expires_at: str | None = None,
    streamer_safe: bool = True,
) -> dict[str, Any]:
    typed = content_type in ("FUNCTIONAL", "PA_HELP")
    if typed != (payload is not None):
        raise RuntimeError(f"typed payload ownership mismatch: {item_id}/{content_type}")
    require_clean_resolved_fields(item_id, {"captionText": text, "spokenText": text})
    projected = {
        "ownerDomain": payload["ownerDomain"] if payload else None,
        "eventId": payload["eventId"] if payload else None,
        "receiptId": payload["receiptId"] if payload else None,
        "headline": payload["headline"] if payload else None,
        "body": payload["body"] if payload else None,
    }
    if payload is not None:
        expected_key = f"{payload['ownerDomain']}:{payload['eventId']}"
        if (
            priority != payload["priority"]
            or expires_at != payload["expiresAt"]
            or text != payload["captionText"]
            or text != payload["spokenText"]
            or coalesce_key != expected_key
        ):
            raise RuntimeError(f"typed payload projection mismatch: {item_id}")
    resolved_speaker_id = speaker_id or presenter_id
    if resolved_speaker_id not in PRESENTERS:
        raise RuntimeError(f"unknown speaker: {resolved_speaker_id}")
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
        **projected,
        "speakerId": resolved_speaker_id,
        "speakerDisplayName": PRESENTERS[resolved_speaker_id]["display_name"],
        "speakerRole": "PA_HELP_SPEAKER" if content_type == "PA_HELP" else "PROGRAMME_PRESENTER",
        "streamerSafeEligible": streamer_safe,
    }


def voice_recipe(
    spec: DemoSpec,
    role: str,
    text: str,
    presenter_id: str,
    rate_wpm: int,
    environment: dict[str, Any],
) -> dict[str, Any]:
    presenter = PRESENTERS[presenter_id]
    ffmpeg = environment["ffmpeg"]["path"]
    commands = {
        "say": [
            environment["say"]["path"], "-v", presenter["local_voice"], "-r", str(rate_wpm),
            "-o", "{TEMP_AIFF}", text,
        ],
        "clean_ffmpeg": [
            ffmpeg, "-nostdin", "-v", "error", "-y", "-i", "{TEMP_AIFF}",
            "-af", CLEAN_VOICE_FILTER,
            "-ar", "48000", "-ac", "1", "-c:a", "pcm_s24le", "{OUTPUT}",
        ],
        "treated_ffmpeg": [
            ffmpeg, "-nostdin", "-v", "error", "-y", "-i", "{CLEAN_WAV}",
            "-af", spec.period_filter,
            "-ar", "48000", "-ac", "1", "-c:a", "pcm_s24le", "{OUTPUT}",
        ],
    }
    return {
        "schema": "project-studio-radio-voice-render-recipe/v1",
        "tool_version": TOOL_VERSION,
        "demo_slug": spec.slug,
        "epoch_code": spec.epoch_code,
        "epoch_alias": spec.epoch_alias,
        "role": role,
        "presenter_id": presenter_id,
        "presenter_display_name": presenter["display_name"],
        "generic_local_voice": presenter["local_voice"],
        "spoken_text_sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
        "spoken_text_utf8_bytes": len(text.encode("utf-8")),
        "rate_wpm": rate_wpm,
        "clean_filter": CLEAN_VOICE_FILTER,
        "period_filter": spec.period_filter,
        "sample_rate_hz": 48000,
        "channels": 1,
        "codec": "pcm_s24le",
        "commands": commands,
        "tool_environment": environment,
    }


def verify_voice_record(
    spec: DemoSpec,
    role: str,
    text: str,
    presenter_id: str,
    rate_wpm: int,
    environment: dict[str, Any],
    metadata: dict[str, Any],
) -> None:
    presenter = PRESENTERS[presenter_id]
    root = DEMO_ROOT / spec.slug / "voice" / role
    clean = root / "CLEAN.wav"
    treated = root / "PERIOD-TREATED.wav"
    text_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
    recipe = voice_recipe(spec, role, text, presenter_id, rate_wpm, environment)
    expected_identity = {
        "schema": "project-studio-radio-voice-render/v2",
        "tool_version": TOOL_VERSION,
        "evidence_created_at": EVIDENCE_CREATED_AT,
        "role": role,
        "presenter_id": presenter_id,
        "presenter_display_name": presenter["display_name"],
        "generic_local_voice": presenter["local_voice"],
        "spoken_text": text,
        "spoken_text_sha256": text_hash,
        "render_recipe": recipe,
        "render_recipe_sha256": canonical_sha256(recipe),
        "tool_environment": environment,
        "rights_status": RIGHTS_STATUS,
        "human_disposition": "PENDING",
    }
    for key, value in expected_identity.items():
        if metadata.get(key) != value:
            raise RuntimeError(f"voice metadata identity mismatch: {spec.slug}/{role}/{key}")
    if metadata.get("performance", {}).get("actual_rate_wpm_argument") != rate_wpm:
        raise RuntimeError(f"voice rate identity mismatch: {spec.slug}/{role}")
    if metadata.get("period_treated", {}).get("filter") != spec.period_filter:
        raise RuntimeError(f"voice filter identity mismatch: {spec.slug}/{role}")
    if metadata.get("reproducible_commands") != recipe["commands"]:
        raise RuntimeError(f"voice command identity mismatch: {spec.slug}/{role}")
    for label, path in (("clean", clean), ("period_treated", treated)):
        if not path.is_file():
            raise RuntimeError(f"voice output missing: {path}")
        record = metadata.get(label, {})
        if record.get("path") != str(path) or record.get("sha256") != sha256_file(path) or record.get("probe") != probe_audio(path):
            raise RuntimeError(f"voice output identity mismatch: {spec.slug}/{role}/{label}")


def verify_voice_fresh_render(metadata: dict[str, Any]) -> None:
    recipe = metadata["render_recipe"]
    with tempfile.TemporaryDirectory(prefix="radio-voice-fresh-verify-") as scratch:
        root = Path(scratch)
        aiff = root / "source.aiff"
        clean = root / "clean.wav"
        treated = root / "period-treated.wav"
        say_command = [str(aiff) if value == "{TEMP_AIFF}" else value for value in recipe["commands"]["say"]]
        completed = subprocess.run(say_command, capture_output=True, text=True)
        if completed.returncode != 0:
            raise RuntimeError(f"fresh voice source render failed: {completed.stderr[-2000:]}")
        clean_command = [str(aiff) if value == "{TEMP_AIFF}" else value for value in recipe["commands"]["clean_ffmpeg"]]
        rerender_atomic(clean_command, clean)
        treated_command = [str(clean) if value == "{CLEAN_WAV}" else value for value in recipe["commands"]["treated_ffmpeg"]]
        rerender_atomic(treated_command, treated)
        for label, path in (("clean", clean), ("period_treated", treated)):
            if sha256_file(path) != metadata[label]["sha256"] or probe_audio(path) != metadata[label]["probe"]:
                raise RuntimeError(f"fresh voice render differs from frozen output: {metadata['demo_slug'] if 'demo_slug' in metadata else recipe['demo_slug']}/{metadata['role']}/{label}")


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
    recipe = voice_recipe(spec, role, text, presenter_id, rate_wpm, environment)
    root.mkdir(parents=True, exist_ok=True)
    descriptor, temp_name = tempfile.mkstemp(prefix=f".{role}.", suffix=".aiff", dir=root)
    os.close(descriptor)
    aiff = Path(temp_name)
    aiff.unlink()
    try:
        say_command = [str(aiff) if value == "{TEMP_AIFF}" else value for value in recipe["commands"]["say"]]
        subprocess.run(say_command, check=True, capture_output=True, text=True)
        clean_command = [str(aiff) if value == "{TEMP_AIFF}" else value for value in recipe["commands"]["clean_ffmpeg"]]
        rerender_atomic(clean_command, clean)
        treated_command = [str(clean) if value == "{CLEAN_WAV}" else value for value in recipe["commands"]["treated_ffmpeg"]]
        rerender_atomic(treated_command, treated)
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
        "render_recipe": recipe,
        "render_recipe_sha256": canonical_sha256(recipe),
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
        "reproducible_commands": recipe["commands"],
        "tool_environment": environment,
        "route": "macOS built-in generic synthetic speech; local scratch prototype",
        "redistribution_caveat": "No redistribution or commercial-use conclusion is made for macOS system-voice output. Keep these renders local and prototype-only pending explicit rights review.",
        "prohibitions": ["NO_REAL_PERSON_IMITATION", "NO_VOICE_CLONING", "NO_CELEBRITY_OR_PROTECTED_CHARACTER_TARGET"],
        "rights_status": RIGHTS_STATUS,
        "human_disposition": "PENDING",
    }
    atomic_write_json(sidecar, metadata)
    verify_voice_record(spec, role, text, presenter_id, rate_wpm, environment, metadata)
    return metadata


def load_verified_voice(
    spec: DemoSpec,
    role: str,
    text: str,
    presenter_id: str,
    rate_wpm: int,
    environment: dict[str, Any],
) -> dict[str, Any]:
    sidecar = DEMO_ROOT / spec.slug / "voice" / role / "metadata.v2.json"
    if not sidecar.is_file():
        raise RuntimeError(f"voice metadata missing: {sidecar}")
    metadata = load_json(sidecar)
    verify_voice_record(spec, role, text, presenter_id, rate_wpm, environment, metadata)
    return metadata


def build_plan(
    spec: DemoSpec,
    bank: dict[str, Any],
    environment: dict[str, Any],
    *,
    render_audio: bool = True,
) -> tuple[dict[str, Any], dict[str, dict[str, Any]]]:
    require_presenter_role(spec.presenter_id, "PROGRAMME_PRESENTER", spec.epoch_code)
    require_presenter_role("PRESENTER-RINA-SHORE", "PA_HELP_SPEAKER", spec.epoch_code)
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
    voice_builder = render_voice if render_audio else load_verified_voice
    voice_records = {
        "opening": voice_builder(spec, "OPENING", opening_text, spec.presenter_id, rates["opening"], environment),
        "functional": voice_builder(spec, "FUNCTIONAL", functional["spokenText"], spec.presenter_id, rates["functional"], environment),
        "interruptible": voice_builder(spec, "INTERRUPTIBLE", interrupt_text, spec.presenter_id, rates["interruptible"], environment),
        "pa": voice_builder(spec, "PA", pa["spokenText"], "PRESENTER-RINA-SHORE", rates["pa"], environment),
    }
    durations = {key: record["period_treated"]["probe"]["duration_seconds"] for key, record in voice_records.items()}
    if durations["interruptible"] <= 20:
        raise RuntimeError(f"{spec.slug} interruptible voice must exceed 20 seconds: {durations}")
    if durations["opening"] + durations["interruptible"] > 75:
        raise RuntimeError(f"{spec.slug} elective voice budget exceeded before scheduling: {durations}")
    functional_key = f"{functional['ownerDomain']}:{functional['eventId']}"
    older = functional_payload(spec, "0000")
    expired_payload = functional_payload(spec, "EXPIRED", expired=True)
    expired_key = f"{expired_payload['ownerDomain']}:{expired_payload['eventId']}"
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
            duration=durations["functional"], priority=70, cooldown=3600, category_cooldown=0,
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
            text=pa["spokenText"], presenter_id=spec.presenter_id, speaker_id="PRESENTER-RINA-SHORE", daypart=spec.daypart,
            duration=durations["pa"], priority=100, cooldown=300, category_cooldown=0,
            payload=pa, coalesce_key=f"{pa['ownerDomain']}:{pa['eventId']}", expires_at=pa["expiresAt"],
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


def compose_demo_audio(
    spec: DemoSpec,
    schedule: dict[str, Any],
    voice_records: dict[str, dict[str, Any]],
    sting: Path,
    environment: dict[str, Any],
) -> tuple[list[str], list[str], list[dict[str, Any]]]:
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
            "speakerId": item["speakerId"],
            "speakerRole": item["speakerRole"],
            "speaker": item["speakerDisplayName"],
        })
    sting_index = len(speech_labels) + 1
    input_args.extend(["-i", str(sting)])
    filters.append(f"[{sting_index}:a]adelay=330000,aformat=channel_layouts=stereo[sting]")
    speech_labels.append("[sting]")
    filters.append("".join(speech_labels) + f"amix=inputs={len(speech_labels)}:normalize=0:dropout_transition=0,alimiter=limit=0.90[speech]")
    filters.append("[music][speech]sidechaincompress=threshold=0.018:ratio=10:attack=15:release=700[ducked]")
    filters.append("[ducked][speech]amix=inputs=2:weights='1 1':normalize=0,alimiter=limit=0.94[out]")
    master_command = [
        environment["ffmpeg"]["path"], "-nostdin", "-v", "error", "-y", *input_args,
        "-filter_complex", ";".join(filters), "-map", "[out]", "-t", str(spec.duration_seconds),
        "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", "{OUTPUT}",
    ]
    return master_command, filters, delivered


def demo_recipe(
    spec: DemoSpec,
    schedule: dict[str, Any],
    voice_records: dict[str, dict[str, Any]],
    sting: Path,
    environment: dict[str, Any],
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    root = DEMO_ROOT / spec.slug
    master = root / f"{spec.slug}-RUNTIME-DEMO.wav"
    master_command, filters, delivered = compose_demo_audio(spec, schedule, voice_records, sting, environment)
    preview_command = [
        environment["ffmpeg"]["path"], "-nostdin", "-v", "error", "-y", "-i", str(master),
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "{OUTPUT}",
    ]
    music = find_music(spec.music_stable_id)
    recipe = {
        "schema": "project-studio-runtime-radio-demo-render-recipe/v1",
        "tool_version": TOOL_VERSION,
        "demo_slug": spec.slug,
        "epoch_code": spec.epoch_code,
        "epoch_alias": spec.epoch_alias,
        "duration_seconds": spec.duration_seconds,
        "seed": spec.seed,
        "daypart": spec.daypart,
        "programme_presenter_id": spec.presenter_id,
        "pa_help_speaker_id": "PRESENTER-RINA-SHORE",
        "period_filter": spec.period_filter,
        "scheduler_schedule_sha256": canonical_sha256(schedule),
        "music": {
            "stable_id": spec.music_stable_id,
            "path": str(music),
            "sha256": sha256_file(music),
            "probe": probe_audio(music),
        },
        "voices": [
            {
                "role": role,
                "path": record["period_treated"]["path"],
                "sha256": record["period_treated"]["sha256"],
                "probe": record["period_treated"]["probe"],
                "voice_render_recipe_sha256": record["render_recipe_sha256"],
                "presenter_id": record["presenter_id"],
                "rate_wpm": record["performance"]["actual_rate_wpm_argument"],
                "period_filter": record["period_treated"]["filter"],
            }
            for role, record in voice_records.items()
        ],
        "milestone_sting": {
            "path": str(sting),
            "sha256": sha256_file(sting),
            "probe": probe_audio(sting),
        },
        "filter_graph": filters,
        "commands": {
            "master_ffmpeg": master_command,
            "preview_ffmpeg": preview_command,
        },
        "tool_environment": environment,
    }
    return recipe, delivered


def verify_demo_record(
    spec: DemoSpec,
    schedule: dict[str, Any],
    voice_records: dict[str, dict[str, Any]],
    sting: Path,
    environment: dict[str, Any],
    metadata: dict[str, Any],
) -> None:
    root = DEMO_ROOT / spec.slug
    master = root / f"{spec.slug}-RUNTIME-DEMO.wav"
    preview = root / f"{spec.slug}-RUNTIME-DEMO.m4a"
    recipe, _ = demo_recipe(spec, schedule, voice_records, sting, environment)
    expected_identity = {
        "schema": "project-studio-runtime-radio-demo/v2",
        "tool_version": TOOL_VERSION,
        "evidence_created_at": EVIDENCE_CREATED_AT,
        "slug": spec.slug,
        "duration_seconds": spec.duration_seconds,
        "seed": spec.seed,
        "epoch_alias": spec.epoch_alias,
        "epoch_code": spec.epoch_code,
        "presenter_id": spec.presenter_id,
        "render_recipe": recipe,
        "render_recipe_sha256": canonical_sha256(recipe),
    }
    for key, value in expected_identity.items():
        if metadata.get(key) != value:
            raise RuntimeError(f"demo metadata identity mismatch: {spec.slug}/{key}")
    for label, path in (("master", master), ("preview", preview)):
        if not path.is_file():
            raise RuntimeError(f"demo output missing: {path}")
        expected = {
            "path": str(path),
            "bytes": path.stat().st_size,
            "sha256": sha256_file(path),
            "probe": probe_audio(path),
        }
        if metadata.get(label) != expected:
            raise RuntimeError(f"demo output identity mismatch: {spec.slug}/{label}")


def verify_demo_fresh_render(spec: DemoSpec, metadata: dict[str, Any]) -> None:
    recipe = metadata["render_recipe"]
    root = DEMO_ROOT / spec.slug
    canonical_master = root / f"{spec.slug}-RUNTIME-DEMO.wav"
    with tempfile.TemporaryDirectory(prefix="radio-demo-fresh-verify-") as scratch:
        temporary = Path(scratch)
        master = temporary / "master.wav"
        preview = temporary / "preview.m4a"
        rerender_atomic(recipe["commands"]["master_ffmpeg"], master)
        preview_command = [
            str(master) if value == str(canonical_master) else value
            for value in recipe["commands"]["preview_ffmpeg"]
        ]
        rerender_atomic(preview_command, preview)
        for label, path in (("master", master), ("preview", preview)):
            if (path.stat().st_size != metadata[label]["bytes"]
                    or sha256_file(path) != metadata[label]["sha256"]
                    or probe_audio(path) != metadata[label]["probe"]):
                raise RuntimeError(f"fresh demo render differs from frozen output: {spec.slug}/{label}")


def render_demo(
    spec: DemoSpec,
    schedule: dict[str, Any],
    voice_records: dict[str, dict[str, Any]],
    sting: Path,
    environment: dict[str, Any],
) -> dict[str, Any]:
    root = DEMO_ROOT / spec.slug
    root.mkdir(parents=True, exist_ok=True)
    master = root / f"{spec.slug}-RUNTIME-DEMO.wav"
    preview = root / f"{spec.slug}-RUNTIME-DEMO.m4a"
    recipe, delivered = demo_recipe(spec, schedule, voice_records, sting, environment)
    rerender_atomic(recipe["commands"]["master_ffmpeg"], master)
    rerender_atomic(recipe["commands"]["preview_ffmpeg"], preview)
    if abs(probe_audio(master)["duration_seconds"] - spec.duration_seconds) > 0.01:
        raise RuntimeError(f"duration mismatch: {master}")

    caption_rows: list[tuple[float, float, str]] = []
    transcript = [f"# {spec.title} — v2 transcript", "", "Every resolved core text is retained with speaker, context, and delivery status.", ""]
    for event in delivered:
        speaker_key = event["item"]["speakerId"]
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
        "audioRender": "Every voiced playout derives from a scheduler-accepted event. INTERRUPTIBLE is hard-trimmed at exactly 20.0 seconds when urgent PA begins; no fade or word-boundary alignment is asserted.",
    }
    atomic_write_json(root / "SCHEDULE.v2.json", rendered_schedule)
    simulation = next(row for row in load_json(EVIDENCE_PATH)["simulations"] if row["epochAlias"] == spec.epoch_alias)
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
        "presenter_roles": {
            "programme_presenter": spec.presenter_id,
            "pa_help_speaker": "PRESENTER-RINA-SHORE",
        },
        "render_recipe": recipe,
        "render_recipe_sha256": canonical_sha256(recipe),
        "music": {"stable_id": spec.music_stable_id, "path": str(find_music(spec.music_stable_id)), "sha256": sha256_file(find_music(spec.music_stable_id))},
        "scheduler_evidence": {"path": str(EVIDENCE_PATH), "sha256": sha256_file(EVIDENCE_PATH), "demo_machine_verdict": schedule["machineVerdict"]},
        "master": {"path": str(master), "bytes": master.stat().st_size, "sha256": sha256_file(master), "probe": probe_audio(master)},
        "preview": {"path": str(preview), "bytes": preview.stat().st_size, "sha256": sha256_file(preview), "probe": probe_audio(preview)},
        "captions": {"path": str(root / "CAPTIONS.v2.vtt"), "sha256": sha256_file(root / "CAPTIONS.v2.vtt")},
        "transcript": {"path": str(root / "TRANSCRIPT.v2.md"), "sha256": sha256_file(root / "TRANSCRIPT.v2.md")},
        "voice_records": [{"role": role, "path": record["period_treated"]["path"], "sha256": record["period_treated"]["sha256"]} for role, record in voice_records.items()],
        "features": schedule["assertions"],
        "generated_copy_lint": {
            "scope": "Every generated FUNCTIONAL and PA_HELP headline, body, spokenText, and captionText; every scheduled item spokenText and captionText",
            "status": "PASS",
        },
        "interruption_law": "Urgent PA hard-stops the active radio item at 20.0 seconds in the offline demonstration; no fade or word-boundary alignment is proved.",
        "machine_verdict": "PASS" if schedule["machineVerdict"] == "PASS" else "FAIL",
        "limitations": [
            "Machine proof covers scheduler law, source identity, render duration, hash, and caption-core parity only.",
            "The interruption proof is a hard cut; editing smoothness and word-boundary acceptability require listening review.",
            "Voice performance, period credibility, name/mark, fatigue, historical/cultural judgment, and listening acceptance remain PENDING.",
        ],
    }
    atomic_write_json(root / "METADATA.v2.json", metadata)
    verify_demo_record(spec, schedule, voice_records, sting, environment, metadata)
    return metadata


def recipe_self_test(environment: dict[str, Any]) -> int:
    global DEMO_ROOT

    mutation_refusals = 0

    def refuse(action: Any, label: str) -> None:
        nonlocal mutation_refusals
        try:
            action()
        except RuntimeError:
            mutation_refusals += 1
            return
        raise AssertionError(f"radio render-recipe mutation was accepted: {label}")

    spec = DEMOS[0]
    text = "Deterministic local radio render recipe probe."
    baseline = voice_recipe(spec, "PROBE", text, spec.presenter_id, spec.base_rate_wpm, environment)
    mutations = [
        voice_recipe(spec, "PROBE", text, "PRESENTER-ARTHUR-VALE", spec.base_rate_wpm, environment),
        voice_recipe(spec, "PROBE", text, spec.presenter_id, spec.base_rate_wpm + 1, environment),
        voice_recipe(replace(spec, period_filter=spec.period_filter + ",volume=0.99"), "PROBE", text, spec.presenter_id, spec.base_rate_wpm, environment),
    ]
    changed_environment = copy.deepcopy(environment)
    changed_environment["ffmpeg"]["sha256"] = "0" * 64
    mutations.append(voice_recipe(spec, "PROBE", text, spec.presenter_id, spec.base_rate_wpm, changed_environment))
    baseline_hash = canonical_sha256(baseline)
    if any(canonical_sha256(value) == baseline_hash for value in mutations):
        raise RuntimeError("voice recipe mutation was not identity-bearing")
    mutation_refusals += len(mutations)

    with tempfile.TemporaryDirectory(prefix="radio-render-recipe-self-test-") as scratch:
        scratch_root = Path(scratch)
        duplicate_json = scratch_root / "duplicate.json"
        duplicate_json.write_text('{"schema":"v2","schema":"forged"}', encoding="utf-8")
        refuse(lambda: load_json(duplicate_json), "json:duplicate-object-key")
        output = scratch_root / "replaced-master.wav"
        command = [
            environment["ffmpeg"]["path"], "-nostdin", "-v", "error", "-y",
            "-f", "lavfi", "-i", "sine=frequency=431:sample_rate=48000:duration=0.2",
            "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", "{OUTPUT}",
        ]
        rerender_atomic(command, output)
        canonical_hash = sha256_file(output)
        os.chmod(output, 0o600)
        output.write_bytes(b"REPLACED_MASTER_MUTATION")
        if sha256_file(output) == canonical_hash:
            raise RuntimeError("master replacement mutation did not alter bytes")
        rerender_atomic(command, output)
        if sha256_file(output) != canonical_hash:
            raise RuntimeError("build-mode rerender did not restore canonical master bytes")
        mutation_refusals += 1

        original_demo_root = DEMO_ROOT
        DEMO_ROOT = scratch_root / "demos"
        try:
            rendered = render_voice(spec, "PROBE", text, spec.presenter_id, spec.base_rate_wpm, environment)
            altered_presenter = copy.deepcopy(rendered)
            altered_presenter["presenter_id"] = "PRESENTER-ARTHUR-VALE"
            refuse(lambda: verify_voice_record(
                spec, "PROBE", text, spec.presenter_id, spec.base_rate_wpm, environment, altered_presenter
            ), "voice:presenter")
            altered_rate = copy.deepcopy(rendered)
            altered_rate["performance"]["actual_rate_wpm_argument"] += 1
            refuse(lambda: verify_voice_record(
                spec, "PROBE", text, spec.presenter_id, spec.base_rate_wpm, environment, altered_rate
            ), "voice:rate")
            altered_filter = copy.deepcopy(rendered)
            altered_filter["period_treated"]["filter"] += ",volume=0.99"
            refuse(lambda: verify_voice_record(
                spec, "PROBE", text, spec.presenter_id, spec.base_rate_wpm, environment, altered_filter
            ), "voice:filter")
            clean_path = Path(rendered["clean"]["path"])
            original_clean_sha = rendered["clean"]["sha256"]
            os.chmod(clean_path, 0o600)
            clean_path.write_bytes(b"REPLACED_VOICE_OUTPUT_MUTATION")
            refuse(lambda: verify_voice_record(
                spec, "PROBE", text, spec.presenter_id, spec.base_rate_wpm, environment, rendered
            ), "voice:output-replacement")
            restored = render_voice(spec, "PROBE", text, spec.presenter_id, spec.base_rate_wpm, environment)
            if restored["clean"]["sha256"] != original_clean_sha:
                raise RuntimeError("voice rerender did not restore canonical bytes")

            short_spec = replace(spec, duration_seconds=1)
            minimal_item = {
                "id": f"{short_spec.slug}-OPENING",
                "contentType": "DECORATIVE",
                "durationSeconds": 0.2,
                "speakerId": short_spec.presenter_id,
                "speakerRole": "PROGRAMME_PRESENTER",
                "speakerDisplayName": PRESENTERS[short_spec.presenter_id]["display_name"],
            }
            minimal_schedule = {
                "events": [{"atSeconds": 0.0, "item": minimal_item}],
                "musicWindows": [{"startSeconds": 0.0, "endSeconds": 1.0}],
            }
            voice_records = {role: restored for role in ("opening", "functional", "interruptible", "pa")}
            schedule_recipe, _ = demo_recipe(short_spec, minimal_schedule, voice_records, Path(restored["clean"]["path"]), environment)
            changed_schedule = copy.deepcopy(minimal_schedule)
            changed_schedule["events"][0]["atSeconds"] = 0.125
            changed_recipe, _ = demo_recipe(short_spec, changed_schedule, voice_records, Path(restored["clean"]["path"]), environment)
            if canonical_sha256(changed_recipe) == canonical_sha256(schedule_recipe):
                raise RuntimeError("schedule timing mutation did not alter demo recipe")
            mutation_refusals += 1
        finally:
            DEMO_ROOT = original_demo_root
    return mutation_refusals


def verify_current_outputs(bank: dict[str, Any], environment: dict[str, Any]) -> dict[str, Any]:
    plans: list[dict[str, Any]] = []
    voice_sets: dict[str, dict[str, dict[str, Any]]] = {}
    for spec in DEMOS:
        plan, voices = build_plan(spec, bank, environment, render_audio=False)
        for record in voices.values():
            verify_voice_fresh_render(record)
        plans.append(plan)
        voice_sets[spec.slug] = voices
    expected_input = {
        "schema": "project-studio-radio-scheduler-input/v2",
        "evidenceCreatedAt": EVIDENCE_CREATED_AT,
        "bankSha256": sha256_file(OUTPUT_BANK),
        "plans": plans,
    }
    if load_json(INPUT_PATH) != expected_input:
        raise RuntimeError("current scheduler input does not match exact source/voice projection")
    current_evidence = load_json(EVIDENCE_PATH)
    with tempfile.TemporaryDirectory(prefix="radio-scheduler-verify-") as scratch:
        fresh_evidence = Path(scratch) / "evidence.json"
        run_scheduler(INPUT_PATH, fresh_evidence)
        if load_json(fresh_evidence) != current_evidence:
            raise RuntimeError("current scheduler evidence differs from a fresh deterministic run")

    sting = RADIO_ROOT / "milestone-stings/LAB-MILESTONE-STING-01.wav"
    if not sting.is_file():
        raise RuntimeError(f"milestone sting missing: {sting}")
    demo_metadata: list[dict[str, Any]] = []
    for spec, schedule in zip(DEMOS, current_evidence["demos"], strict=True):
        metadata_path = DEMO_ROOT / spec.slug / "METADATA.v2.json"
        metadata = load_json(metadata_path)
        verify_demo_record(spec, schedule, voice_sets[spec.slug], sting, environment, metadata)
        verify_demo_fresh_render(spec, metadata)
        for label, filename in (("captions", "CAPTIONS.v2.vtt"), ("transcript", "TRANSCRIPT.v2.md")):
            path = DEMO_ROOT / spec.slug / filename
            if metadata.get(label) != {"path": str(path), "sha256": sha256_file(path)}:
                raise RuntimeError(f"demo text evidence identity mismatch: {spec.slug}/{label}")
        demo_metadata.append(metadata)
    index = load_json(INDEX_PATH)
    if index.get("demos") != demo_metadata:
        raise RuntimeError("radio runtime index demo projection mismatch")
    if index.get("scheduler_evidence", {}).get("sha256") != sha256_file(EVIDENCE_PATH):
        raise RuntimeError("radio runtime index scheduler hash mismatch")
    if index.get("machine_verdict") != "PASS":
        raise RuntimeError("radio runtime index is not PASS")
    return {"voices": sum(len(value) for value in voice_sets.values()), "demos": len(demo_metadata)}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--skip-audio-render", action="store_true")
    parser.add_argument("--verify-only", action="store_true")
    parser.add_argument("--recipe-self-test", action="store_true")
    args = parser.parse_args()
    if args.verify_only and (args.self_test or args.skip_audio_render or args.recipe_self_test):
        raise RuntimeError("--verify-only cannot be combined with build/test modes")
    environment = tool_environment()
    if args.recipe_self_test:
        mutation_count = recipe_self_test(environment)
        print(json.dumps({"recipe_mutation_refusals": mutation_count, "status": "PASS"}, indent=2, sort_keys=True))
        return
    if args.verify_only:
        bank = load_json(OUTPUT_BANK)
        verified = verify_current_outputs(bank, environment)
        print(json.dumps({**verified, "status": "PASS"}, indent=2, sort_keys=True))
        return
    recipe_mutation_refusals = 0
    if args.self_test:
        lint_self_test()
        recipe_mutation_refusals = recipe_self_test(environment)
    lint_report = build_clean_bank()
    if lint_report["status"] != "PASS":
        raise RuntimeError("v2 radio copy must lint clean")
    bank = load_json(OUTPUT_BANK)
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
    evidence = load_json(EVIDENCE_PATH)
    if evidence["machineVerdict"] != "PASS":
        raise RuntimeError("scheduler evidence did not pass")
    fixtures = [functional_payload(spec) for spec in DEMOS]
    pa_fixtures = [pa_payload(spec) for spec in DEMOS]
    all_typed_fixtures = fixtures + pa_fixtures
    atomic_write_json(FIXTURE_PATH, {
        "schema": "project-studio-radio-functional-fixtures/v2",
        "evidence_created_at": EVIDENCE_CREATED_AT,
        "status": RIGHTS_STATUS,
        "lab_fixture_only": True,
        "payloads": fixtures,
        "pa_help_payloads": pa_fixtures,
        "validation": {
            "base_fields_present": all(set(("ownerDomain", "eventId", "receiptId", "headline", "body", "priority", "expiresAt", "captionText", "spokenText")).issubset(row) for row in all_typed_fixtures),
            "annotations_present": all(set(("source", "fixtureVersion", "locale", "createdAt", "deterministicSeed")).issubset(row) for row in all_typed_fixtures),
            "caption_spoken_core_parity": all(row["captionText"] == row["spokenText"] for row in all_typed_fixtures),
            "generated_spoken_and_caption_lint": all(
                not lint_text(row["eventId"], field, row[field])
                for row in all_typed_fixtures
                for field in ("spokenText", "captionText")
            ),
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
            demos.append(render_demo(spec, schedule, voice_sets[spec.slug], sting, environment))
    index = {
        "schema": "project-studio-radio-runtime-index/v2",
        "tool_version": TOOL_VERSION,
        "evidence_created_at": EVIDENCE_CREATED_AT,
        "status": RIGHTS_STATUS,
        "scripts_audited": len(bank["units"]),
        "decorative_runtime_eligible": sum(unit["runtime_eligible"] for unit in bank["units"]),
        "technology_templates_withheld": sum(not unit["runtime_eligible"] for unit in bank["units"]),
        "clean_copy_lint": {"path": str(LINT_REPORT), "sha256": sha256_file(LINT_REPORT), "status": lint_report["status"]},
        "generated_runtime_copy_lint": {
            "scope": "All generated typed FUNCTIONAL/PA_HELP fields and all scheduled captionText/spokenText",
            "status": "PASS",
        },
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
            "The urgent-PA demonstration uses an exact hard cut, not a proved edited fade or word-timed transition.",
        ],
    }
    atomic_write_json(INDEX_PATH, index)
    if args.self_test:
        assert len(bank["units"]) == 126
        assert sum(not unit["runtime_eligible"] for unit in bank["units"]) == 18
        assert evidence["machineVerdict"] == "PASS"
        assert all(spec.duration_seconds == 660 for spec in DEMOS)
        for plan in plans:
            for item in plan["items"].values():
                typed = item["contentType"] in ("FUNCTIONAL", "PA_HELP")
                assert typed == (item["payload"] is not None)
                if typed:
                    payload = item["payload"]
                    assert all(item[field] == payload[field] for field in ("ownerDomain", "eventId", "receiptId", "headline", "body", "priority", "expiresAt", "captionText", "spokenText"))
                    assert item["coalesceKey"] == f"{payload['ownerDomain']}:{payload['eventId']}"
                else:
                    assert all(item[field] is None for field in ("ownerDomain", "eventId", "receiptId", "headline", "body"))
            assert plan["items"]["pa"]["speakerId"] == "PRESENTER-RINA-SHORE"
            assert plan["items"]["pa"]["speakerRole"] == "PA_HELP_SPEAKER"
        for spec, schedule in zip(DEMOS, evidence["demos"], strict=True):
            baseline_recipe, _ = demo_recipe(spec, schedule, voice_sets[spec.slug], sting, environment)
            mutated_schedule = copy.deepcopy(schedule)
            mutated_schedule["events"][0]["atSeconds"] += 0.125
            mutated_recipe, _ = demo_recipe(spec, mutated_schedule, voice_sets[spec.slug], sting, environment)
            if canonical_sha256(mutated_recipe) == canonical_sha256(baseline_recipe):
                raise RuntimeError(f"schedule timing mutation did not alter demo recipe: {spec.slug}")
            recipe_mutation_refusals += 1
    print(json.dumps({
        "index": str(INDEX_PATH),
        "index_sha256": sha256_file(INDEX_PATH),
        "scheduler_evidence_sha256": sha256_file(EVIDENCE_PATH),
        "demos": len(demos),
        "machine_verdict": index["machine_verdict"],
        "recipe_mutation_refusals": recipe_mutation_refusals,
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
