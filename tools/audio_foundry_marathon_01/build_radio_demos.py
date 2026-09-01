#!/usr/bin/env python3
"""Build three deterministic, source-bound Studio Radio concept reels.

This local-only pipeline is deliberately downstream of the provisional music
shortlist. It mixes period-presentation speech while preserving and verifying
the clean speech, applies controlled music-only sidechain ducking, and emits
exact cue sheets, verbatim captions, transcripts, hashes, and metadata.

Publication is fail-closed and non-destructive. A reel is assembled in a
signature-named staging directory and atomically renamed into place. Failed
staging is preserved for diagnosis; this tool contains no recursive deletion.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import math
import os
import subprocess
import tempfile
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any


PIPELINE_VERSION = "studio-radio-demo-builder-v1"
STATUS = "RADIO CONCEPT PROTOTYPE"
RIGHTS_STATUS = "PROTOTYPE_ONLY"
MUSIC_STATUS = "PROTOTYPE_READY_FOR_OWNER_AUDITION"

MARATHON_ROOT = Path("/Users/bruce/Project Studio Audio Foundry Marathon 01")
DEFAULT_SHORTLIST = MARATHON_ROOT / "05_shortlists" / "provisional-machine-shortlist.csv"
DEFAULT_VOICE_MANIFEST = MARATHON_ROOT / "06_radio/voice-prototypes/VOICE-PROTOTYPE-MANIFEST.json"
DEFAULT_SCRIPT_BANK = MARATHON_ROOT / "06_radio/script-bank/STUDIO-RADIO-SCRIPT-BANK-01.json"
DEFAULT_OUTPUT_ROOT = MARATHON_ROOT / "06_radio/demos"
FFMPEG = Path("/opt/homebrew/bin/ffmpeg")
FFPROBE = Path("/opt/homebrew/bin/ffprobe")

DISK_CAP_BYTES = 80 * 1024**3
BUILD_ALLOWANCE_BYTES = 2 * 1024**3
MUSIC_EXCERPT_SECONDS = 104.0
CROSSFADE_SECONDS = 4.0
PROGRAM_SECONDS = 304.0
SPEECH_GAIN_DB = 5.0
SPEECH_OFFSETS = (4.0, 48.0, 108.0, 130.0, 176.0, 216.0, 258.0, 289.0)
VOICE_SUFFIXES = ("ID-01", "LNK-01", "ID-02", "TEC-01", "LNK-02", "ADV-01", "LNK-03", "SGN-01")
EXPECTED_ROLES = (
    "station_id",
    "studio_workday_link",
    "station_id",
    "news_or_industry",
    "studio_workday_link",
    "advertisement",
    "transition",
    "signoff",
)
SIDECHAIN = {
    "threshold": 0.015,
    "ratio": 8.0,
    "attack_ms": 15.0,
    "release_ms": 350.0,
    "knee": 2.0,
    "link": "average",
    "detection": "rms",
}


@dataclass(frozen=True)
class Program:
    slug: str
    title: str
    epoch_code: str
    epoch_alias: str
    voice_anchor: str
    wav_name: str


PROGRAMS = (
    Program(
        "EARLY-STUDIO",
        "EARLY STUDIO BROADCAST",
        "E02",
        "network_sound_1933_1945",
        "Early network / 1930s",
        "EARLY-STUDIO-BROADCAST.wav",
    ),
    Program(
        "POSTWAR",
        "POSTWAR STUDIO BROADCAST",
        "E03",
        "tape_hifi_1946_1959",
        "Postwar personality / 1950s",
        "POSTWAR-STUDIO-BROADCAST.wav",
    ),
    Program(
        "DIGITAL-ERA",
        "DIGITAL-ERA STUDIO BROADCAST",
        "E06",
        "sampled_digital_1987_1999",
        "Formatted FM/digital transition / 1990s",
        "DIGITAL-ERA-STUDIO-BROADCAST.wav",
    ),
)


class BuildError(RuntimeError):
    """A fail-closed input, provenance, render, or publication error."""


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def json_text(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n"


def csv_text(rows: list[dict[str, Any]], fields: list[str]) -> str:
    stream = io.StringIO(newline="")
    writer = csv.DictWriter(stream, fieldnames=fields, extrasaction="ignore", lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return stream.getvalue()


def run(command: list[str], *, label: str) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(command, check=False, capture_output=True, text=True)
    if result.returncode:
        tail = "\n".join(result.stderr.splitlines()[-30:])
        raise BuildError(f"{label} failed ({result.returncode}):\n{tail}")
    return result


def read_json(path: Path) -> dict[str, Any]:
    if not path.is_file():
        raise BuildError(f"required JSON is absent: {path}")
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise BuildError(f"cannot parse required JSON {path}: {exc}") from exc
    if not isinstance(value, dict):
        raise BuildError(f"required JSON root is not an object: {path}")
    return value


def read_csv(path: Path) -> list[dict[str, str]]:
    if not path.is_file():
        raise BuildError(f"required shortlist is absent: {path}")
    with path.open(newline="", encoding="utf-8-sig") as handle:
        rows = list(csv.DictReader(handle))
    if not rows:
        raise BuildError(f"required shortlist is empty: {path}")
    return rows


def publish_text(path: Path, content: str) -> None:
    encoded = content.encode("utf-8")
    if path.exists():
        if path.is_file() and path.read_bytes() == encoded:
            return
        raise BuildError(f"refusing to overwrite nonidentical file: {path}")
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    temporary = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(encoded)
            handle.flush()
            os.fsync(handle.fileno())
        os.link(temporary, path)
    except FileExistsError as exc:
        raise BuildError(f"file appeared during atomic publication: {path}") from exc
    finally:
        temporary.unlink(missing_ok=True)


def retained_bytes(root: Path) -> int:
    total = 0
    for directory, _, names in os.walk(root):
        for name in names:
            try:
                total += (Path(directory) / name).stat().st_size
            except FileNotFoundError:
                continue
    return total


def tool_identity() -> dict[str, Any]:
    for path in (FFMPEG, FFPROBE):
        if not path.is_file() or not os.access(path, os.X_OK):
            raise BuildError(f"required local executable unavailable: {path}")
    ffmpeg_lines = run([str(FFMPEG), "-version"], label="FFmpeg identity").stdout.splitlines()
    ffprobe_lines = run([str(FFPROBE), "-version"], label="FFprobe identity").stdout.splitlines()
    return {
        "ffmpeg_path": str(FFMPEG),
        "ffmpeg_version": ffmpeg_lines[0],
        "ffmpeg_binary_sha256": sha256_file(FFMPEG.resolve()),
        "ffprobe_path": str(FFPROBE),
        "ffprobe_version": ffprobe_lines[0],
        "ffprobe_binary_sha256": sha256_file(FFPROBE.resolve()),
    }


def probe_audio(path: Path) -> dict[str, Any]:
    result = run(
        [
            str(FFPROBE),
            "-v",
            "error",
            "-select_streams",
            "a:0",
            "-show_entries",
            "stream=codec_name,sample_rate,channels,channel_layout,bits_per_raw_sample:format=duration",
            "-of",
            "json",
            str(path),
        ],
        label=f"probe {path.name}",
    )
    payload = json.loads(result.stdout)
    streams = payload.get("streams", [])
    if len(streams) != 1:
        raise BuildError(f"expected one audio stream: {path}")
    stream = streams[0]
    try:
        duration = float(payload["format"]["duration"])
        sample_rate = int(stream["sample_rate"])
        channels = int(stream["channels"])
    except (KeyError, TypeError, ValueError) as exc:
        raise BuildError(f"invalid probe result: {path}") from exc
    if not math.isfinite(duration) or duration <= 0:
        raise BuildError(f"invalid duration: {path}: {duration}")
    return {
        "duration_seconds": round(duration, 6),
        "codec_name": stream.get("codec_name", ""),
        "sample_rate": sample_rate,
        "channels": channels,
        "channel_layout": stream.get("channel_layout", ""),
        "bits_per_raw_sample": stream.get("bits_per_raw_sample", ""),
    }


def verify_file(path: Path, expected_hash: str, label: str) -> dict[str, Any]:
    if not path.is_file():
        raise BuildError(f"{label} is absent: {path}")
    actual = sha256_file(path)
    if actual != expected_hash:
        raise BuildError(f"{label} hash mismatch: {path}: {actual} != {expected_hash}")
    return {"path": str(path), "bytes": path.stat().st_size, "sha256": actual}


def validate_voice_and_scripts(
    script_bank_path: Path, voice_manifest_path: Path
) -> tuple[dict[str, Any], dict[str, Any], dict[str, dict[str, Any]]]:
    scripts = read_json(script_bank_path)
    voices = read_json(voice_manifest_path)
    if scripts.get("status") != RIGHTS_STATUS:
        raise BuildError(f"script bank is not {RIGHTS_STATUS}")
    if voices.get("status") != "SCRATCH_DELIVERY_PROTOTYPE" or voices.get("rights_status") != RIGHTS_STATUS:
        raise BuildError("voice manifest status is not SCRATCH_DELIVERY_PROTOTYPE / PROTOTYPE_ONLY")
    units = scripts.get("units")
    clips = voices.get("clips")
    if not isinstance(units, list) or len(units) != 126:
        raise BuildError("script bank must contain exactly 126 units")
    if not isinstance(clips, list) or len(clips) != 30:
        raise BuildError("voice manifest must contain exactly 30 clips")
    units_by_id = {str(item.get("stable_id", "")): item for item in units}
    clips_by_source = {str(item.get("source_stable_id", "")): item for item in clips}
    if len(units_by_id) != 126 or len(clips_by_source) != 30:
        raise BuildError("script or voice stable IDs are not unique")

    voice_root = voice_manifest_path.parent
    for clip in clips:
        stable_id = str(clip.get("source_stable_id", ""))
        source = units_by_id.get(stable_id)
        if source is None:
            raise BuildError(f"voice clip lacks a script-bank source: {stable_id}")
        if clip.get("transcript") != source.get("transcript") or clip.get("caption") != source.get("caption"):
            raise BuildError(f"voice/script text mismatch: {stable_id}")
        if source.get("transcript") != source.get("caption"):
            raise BuildError(f"caption is not verbatim: {stable_id}")
        if clip.get("rights_status") != RIGHTS_STATUS:
            raise BuildError(f"voice clip lacks {RIGHTS_STATUS}: {stable_id}")
        for kind, path_field, hash_field in (
            ("clean speech", "clean_path", "clean_sha256"),
            ("period speech", "period_path", "period_sha256"),
        ):
            relative = clip.get(path_field)
            expected = clip.get(hash_field)
            if not relative or not expected:
                raise BuildError(f"missing {kind} provenance: {stable_id}")
            path = voice_root / str(relative)
            verify_file(path, str(expected), kind)
            probe = probe_audio(path)
            if probe["sample_rate"] != 48000 or probe["channels"] != 1:
                raise BuildError(f"{kind} must be mono 48 kHz: {path}")

    for program in PROGRAMS:
        chosen = []
        for suffix in VOICE_SUFFIXES:
            stable_id = f"SR-{program.epoch_code}-{suffix}"
            clip = clips_by_source.get(stable_id)
            if clip is None or clip.get("anchor_epoch") != program.epoch_code:
                raise BuildError(f"required voice unit missing or epoch-mismatched: {stable_id}")
            chosen.append(str(clip.get("prototype_role", "")))
        if tuple(chosen) != EXPECTED_ROLES:
            raise BuildError(f"voice role sequence mismatch for {program.slug}: {chosen}")
        tech = clips_by_source[f"SR-{program.epoch_code}-TEC-01"]
        advert = clips_by_source[f"SR-{program.epoch_code}-ADV-01"]
        if tech.get("source_function") != "fictional_industry_technology_bulletin":
            raise BuildError(f"technology bulletin classification mismatch: {program.slug}")
        if advert.get("source_function") != "fictional_advertisement":
            raise BuildError(f"advertisement classification mismatch: {program.slug}")
    return scripts, voices, clips_by_source


def select_music(shortlist_path: Path) -> dict[str, list[dict[str, Any]]]:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in read_csv(shortlist_path):
        if row.get("role_type") == "PRIMARY":
            grouped[row.get("epoch_alias", "")].append(row)
    selected: dict[str, list[dict[str, Any]]] = {}
    candidate_ids: list[str] = []
    for program in PROGRAMS:
        rows = grouped.get(program.epoch_alias, [])
        if len(rows) != 3:
            raise BuildError(f"{program.epoch_alias}: expected three PRIMARY rows, got {len(rows)}")
        try:
            rows.sort(key=lambda row: int(row["role_rank"]))
        except (KeyError, TypeError, ValueError) as exc:
            raise BuildError(f"invalid primary rank: {program.epoch_alias}") from exc
        if [int(row["role_rank"]) for row in rows] != [1, 2, 3]:
            raise BuildError(f"primary ranks must be 1,2,3: {program.epoch_alias}")
        if len({row.get("family_id") for row in rows}) != 3:
            raise BuildError(f"primary families must be distinct: {program.epoch_alias}")
        for row in rows:
            candidate_id = row.get("candidate_id", "")
            if row.get("shortlist_status") != "PROVISIONAL MACHINE SHORTLIST":
                raise BuildError(f"unexpected shortlist status: {candidate_id}")
            if row.get("rights_status") != MUSIC_STATUS:
                raise BuildError(f"unexpected music rights status: {candidate_id}")
            path_text = row.get("loop_wav_path") or row.get("normalized_wav_path")
            hash_text = row.get("loop_wav_sha256") or row.get("normalized_wav_sha256")
            if not path_text or not hash_text:
                raise BuildError(f"primary lacks a bound WAV derivative: {candidate_id}")
            path = Path(path_text)
            record = verify_file(path, hash_text, "shortlist music")
            probe = probe_audio(path)
            if probe["duration_seconds"] + 0.001 < MUSIC_EXCERPT_SECONDS:
                raise BuildError(f"music is shorter than 104 seconds: {path}")
            if probe["sample_rate"] != 48000 or probe["channels"] != 2:
                raise BuildError(f"music must be stereo 48 kHz: {path}")
            if not row.get("source_sha256"):
                raise BuildError(f"primary lacks raw source hash: {candidate_id}")
            row["_path"] = path
            row["_hash"] = record["sha256"]
            row["_bytes"] = record["bytes"]
            row["_probe"] = probe
            candidate_ids.append(candidate_id)
        selected[program.slug] = rows
    if len(candidate_ids) != len(set(candidate_ids)):
        raise BuildError("a music candidate is reused across anchor-period reels")
    return selected


def selected_clips(program: Program, clips_by_source: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    return [clips_by_source[f"SR-{program.epoch_code}-{suffix}"] for suffix in VOICE_SUFFIXES]


def make_music_cues(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    result = []
    for index, row in enumerate(rows):
        start = index * (MUSIC_EXCERPT_SECONDS - CROSSFADE_SECONDS)
        result.append(
            {
                "cue_type": "MUSIC",
                "cue_index": index + 1,
                "start_seconds": start,
                "end_seconds": start + MUSIC_EXCERPT_SECONDS,
                "duration_seconds": MUSIC_EXCERPT_SECONDS,
                "crossfade_in_seconds": 0.0 if index == 0 else CROSSFADE_SECONDS,
                "crossfade_out_seconds": 0.0 if index == 2 else CROSSFADE_SECONDS,
                "candidate_id": row.get("candidate_id", ""),
                "family_id": row.get("family_id", ""),
                "shortlist_role": row.get("shortlist_role", ""),
                "music_path": str(row["_path"]),
                "music_sha256": row["_hash"],
                "raw_source_path": row.get("source_path", ""),
                "raw_source_sha256": row.get("source_sha256", ""),
                "status": "PROVISIONAL MACHINE SHORTLIST",
                "rights_status": MUSIC_STATUS,
            }
        )
    return result


def make_speech_cues(
    program: Program, clips_by_source: dict[str, dict[str, Any]], voice_root: Path
) -> list[dict[str, Any]]:
    result = []
    for index, (offset, clip) in enumerate(
        zip(SPEECH_OFFSETS, selected_clips(program, clips_by_source), strict=True)
    ):
        period_path = voice_root / clip["period_path"]
        clean_path = voice_root / clip["clean_path"]
        duration = float(probe_audio(period_path)["duration_seconds"])
        if offset + duration > PROGRAM_SECONDS:
            raise BuildError(f"speech cue overruns reel: {clip['source_stable_id']}")
        result.append(
            {
                "cue_type": "SPEECH",
                "cue_index": index + 1,
                "start_seconds": offset,
                "end_seconds": round(offset + duration, 6),
                "duration_seconds": duration,
                "prototype_id": clip["prototype_id"],
                "source_stable_id": clip["source_stable_id"],
                "source_function": clip["source_function"],
                "prototype_role": clip["prototype_role"],
                "voice_label": clip["voice_label"],
                "transcript": clip["transcript"],
                "caption": clip["caption"],
                "clean_path": str(clean_path),
                "clean_sha256": clip["clean_sha256"],
                "period_path": str(period_path),
                "period_sha256": clip["period_sha256"],
                "mix_source": "PERIOD-PRESENTATION.wav",
                "clean_source_preserved": True,
                "status": "SCRATCH_DELIVERY_PROTOTYPE",
                "rights_status": RIGHTS_STATUS,
            }
        )
    return result


def filter_graph(
    speech: list[dict[str, Any]],
    *,
    program_seconds: float = PROGRAM_SECONDS,
    music_excerpt_seconds: float = MUSIC_EXCERPT_SECONDS,
    crossfade_seconds: float = CROSSFADE_SECONDS,
) -> str:
    parts = []
    for index in range(3):
        parts.append(
            f"[{index}:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,"
            f"atrim=start=0:duration={music_excerpt_seconds:g},asetpts=N/SR/TB[m{index}]"
        )
    parts.extend(
        [
            f"[m0][m1]acrossfade=d={crossfade_seconds:g}:c1=qsin:c2=qsin[m01]",
            f"[m01][m2]acrossfade=d={crossfade_seconds:g}:c1=qsin:c2=qsin[music]",
        ]
    )
    labels = []
    for index, cue in enumerate(speech):
        label = f"voice{index}"
        labels.append(f"[{label}]")
        delay_ms = int(round(float(cue["start_seconds"]) * 1000))
        parts.append(
            f"[{index + 3}:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=mono,"
            f"pan=stereo|c0=c0|c1=c0,volume={SPEECH_GAIN_DB:g}dB,adelay={delay_ms}:all=1,"
            f"apad=whole_dur={program_seconds:g}[{label}]"
        )
    parts.append(
        "".join(labels)
        + f"amix=inputs={len(labels)}:duration=longest:dropout_transition=0:normalize=0,"
        + f"atrim=start=0:duration={program_seconds:g},asplit=2[voice_sidechain][voice_mix]"
    )
    parts.append(
        "[music][voice_sidechain]sidechaincompress="
        f"threshold={SIDECHAIN['threshold']}:ratio={SIDECHAIN['ratio']}:"
        f"attack={SIDECHAIN['attack_ms']}:release={SIDECHAIN['release_ms']}:"
        f"knee={SIDECHAIN['knee']}:link={SIDECHAIN['link']}:detection={SIDECHAIN['detection']}"
        "[ducked_music]"
    )
    parts.append(
        "[ducked_music][voice_mix]amix=inputs=2:duration=longest:dropout_transition=0:normalize=0,"
        f"alimiter=limit=0.84:attack=5:release=50,aresample=48000,"
        f"atrim=start=0:duration={program_seconds:g}[out]"
    )
    return ";".join(parts)


def mix_command(music: list[dict[str, Any]], speech: list[dict[str, Any]], output: Path) -> tuple[list[str], str]:
    graph = filter_graph(speech)
    command = [str(FFMPEG), "-hide_banner", "-nostdin", "-loglevel", "error", "-y"]
    for row in music:
        command.extend(["-i", str(row["_path"])])
    for cue in speech:
        command.extend(["-i", cue["period_path"]])
    command.extend(
        [
            "-filter_complex",
            graph,
            "-map",
            "[out]",
            "-ar",
            "48000",
            "-ac",
            "2",
            "-c:a",
            "pcm_s24le",
            "-map_metadata",
            "-1",
            str(output),
        ]
    )
    return command, graph


def preview_command(source: Path, output: Path) -> list[str]:
    return [
        str(FFMPEG),
        "-hide_banner",
        "-nostdin",
        "-loglevel",
        "error",
        "-y",
        "-i",
        str(source),
        "-map",
        "0:a:0",
        "-ar",
        "48000",
        "-ac",
        "2",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-map_metadata",
        "-1",
        str(output),
    ]


def vtt_time(seconds: float) -> str:
    milliseconds = int(round(seconds * 1000))
    hours, remainder = divmod(milliseconds, 3_600_000)
    minutes, remainder = divmod(remainder, 60_000)
    secs, millis = divmod(remainder, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"


def caption_text(speech: list[dict[str, Any]]) -> str:
    lines = ["WEBVTT", "", "NOTE RADIO CONCEPT PROTOTYPE — captions are verbatim", ""]
    for index, cue in enumerate(speech, start=1):
        lines.extend(
            [
                str(index),
                f"{vtt_time(cue['start_seconds'])} --> {vtt_time(cue['end_seconds'])}",
                cue["caption"],
                "",
            ]
        )
    return "\n".join(lines)


def transcript_text(program: Program, speech: list[dict[str, Any]]) -> str:
    lines = [
        f"# {program.title} — Transcript",
        "",
        f"Status: `{STATUS}`  ",
        f"Rights/status: `{RIGHTS_STATUS}`",
        "",
        "All spoken text is original fictional Project: Studio copy. It carries no gameplay-critical fact and is not production authority.",
        "",
    ]
    for cue in speech:
        lines.extend(
            [
                f"## {vtt_time(cue['start_seconds'])} — {cue['source_stable_id']}",
                "",
                f"Function: `{cue['source_function']}`  ",
                f"Prototype voice: `{cue['voice_label']}` (generic macOS scratch voice; no cloning)",
                "",
                cue["transcript"],
                "",
            ]
        )
    return "\n".join(lines)


def cue_rows(music: list[dict[str, Any]], speech: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows = []
    for cue in music:
        rows.append(
            {
                "start_seconds": f"{cue['start_seconds']:.6f}",
                "end_seconds": f"{cue['end_seconds']:.6f}",
                "duration_seconds": f"{cue['duration_seconds']:.6f}",
                "cue_type": "MUSIC",
                "stable_id": cue["candidate_id"],
                "function": cue["shortlist_role"],
                "family_id": cue["family_id"],
                "transcript": "",
                "mix_source_path": cue["music_path"],
                "mix_source_sha256": cue["music_sha256"],
                "clean_source_path": "",
                "clean_source_sha256": "",
                "crossfade_in_seconds": f"{cue['crossfade_in_seconds']:.6f}",
                "crossfade_out_seconds": f"{cue['crossfade_out_seconds']:.6f}",
                "status": cue["status"],
                "rights_status": cue["rights_status"],
            }
        )
    for cue in speech:
        rows.append(
            {
                "start_seconds": f"{cue['start_seconds']:.6f}",
                "end_seconds": f"{cue['end_seconds']:.6f}",
                "duration_seconds": f"{cue['duration_seconds']:.6f}",
                "cue_type": "SPEECH",
                "stable_id": cue["source_stable_id"],
                "function": cue["source_function"],
                "family_id": "",
                "transcript": cue["transcript"],
                "mix_source_path": cue["period_path"],
                "mix_source_sha256": cue["period_sha256"],
                "clean_source_path": cue["clean_path"],
                "clean_source_sha256": cue["clean_sha256"],
                "crossfade_in_seconds": "",
                "crossfade_out_seconds": "",
                "status": cue["status"],
                "rights_status": cue["rights_status"],
            }
        )
    rows.sort(key=lambda item: (float(item["start_seconds"]), item["cue_type"]))
    return rows


CUE_FIELDS = [
    "start_seconds",
    "end_seconds",
    "duration_seconds",
    "cue_type",
    "stable_id",
    "function",
    "family_id",
    "transcript",
    "mix_source_path",
    "mix_source_sha256",
    "clean_source_path",
    "clean_source_sha256",
    "crossfade_in_seconds",
    "crossfade_out_seconds",
    "status",
    "rights_status",
]


def input_binding(
    program: Program,
    shortlist_path: Path,
    voice_manifest_path: Path,
    script_bank_path: Path,
    music: list[dict[str, Any]],
    speech: list[dict[str, Any]],
) -> tuple[str, dict[str, Any]]:
    bound = {
        "pipeline_version": PIPELINE_VERSION,
        "program": {
            "slug": program.slug,
            "title": program.title,
            "epoch_code": program.epoch_code,
            "epoch_alias": program.epoch_alias,
            "duration_seconds": PROGRAM_SECONDS,
        },
        "mix_policy": {
            "music_excerpt_seconds": MUSIC_EXCERPT_SECONDS,
            "crossfade_seconds": CROSSFADE_SECONDS,
            "speech_offsets_seconds": list(SPEECH_OFFSETS),
            "speech_gain_db": SPEECH_GAIN_DB,
            "sidechain": SIDECHAIN,
            "output": "48_KHZ_STEREO_PCM24_PLUS_AAC_192K",
        },
        "manifests": {
            "shortlist": {"path": str(shortlist_path), "sha256": sha256_file(shortlist_path)},
            "voice": {"path": str(voice_manifest_path), "sha256": sha256_file(voice_manifest_path)},
            "script_bank": {"path": str(script_bank_path), "sha256": sha256_file(script_bank_path)},
        },
        "music": [
            {
                "candidate_id": row.get("candidate_id", ""),
                "family_id": row.get("family_id", ""),
                "raw_source_sha256": row.get("source_sha256", ""),
                "derivative_path": str(row["_path"]),
                "derivative_sha256": row["_hash"],
            }
            for row in music
        ],
        "speech": [
            {
                "source_stable_id": cue["source_stable_id"],
                "start_seconds": cue["start_seconds"],
                "clean_sha256": cue["clean_sha256"],
                "period_sha256": cue["period_sha256"],
            }
            for cue in speech
        ],
    }
    return hashlib.sha256(canonical_json(bound).encode("utf-8")).hexdigest(), bound


def verify_existing(directory: Path, signature: str) -> dict[str, Any]:
    metadata_path = directory / "METADATA.json"
    if not metadata_path.is_file():
        raise BuildError(f"existing reel lacks completion metadata: {directory}")
    metadata = read_json(metadata_path)
    if metadata.get("input_signature_sha256") != signature:
        raise BuildError(f"existing reel signature differs; refusing overwrite: {directory}")
    artifacts = metadata.get("artifacts")
    if not isinstance(artifacts, list) or not artifacts:
        raise BuildError(f"existing reel lacks artifact inventory: {directory}")
    for artifact in artifacts:
        verify_file(directory / artifact["relative_path"], artifact["sha256"], "published artifact")
    return metadata


def render_program(
    program: Program,
    music: list[dict[str, Any]],
    clips_by_source: dict[str, dict[str, Any]],
    shortlist_path: Path,
    voice_manifest_path: Path,
    script_bank_path: Path,
    output_root: Path,
    tools: dict[str, Any],
) -> dict[str, Any]:
    music_cues = make_music_cues(music)
    speech = make_speech_cues(program, clips_by_source, voice_manifest_path.parent)
    signature, bound = input_binding(
        program, shortlist_path, voice_manifest_path, script_bank_path, music, speech
    )
    target = output_root / program.slug
    if target.exists():
        metadata = verify_existing(target, signature)
        return summary_record(program, target, metadata, "VERIFIED_EXISTING")

    output_root.mkdir(parents=True, exist_ok=True)
    staging: Path | None = output_root / f".{program.slug}.building-{signature[:16]}"
    if staging.exists():
        raise BuildError(f"preserved incomplete staging requires inspection before resume: {staging}")
    staging.mkdir()

    wav = staging / program.wav_name
    preview = staging / program.wav_name.replace(".wav", "-PREVIEW.m4a")
    command, graph = mix_command(music, speech, wav)
    run(command, label=f"mix {program.title}")
    wav_probe = probe_audio(wav)
    if abs(float(wav_probe["duration_seconds"]) - PROGRAM_SECONDS) > 0.02:
        raise BuildError(f"mixed reel duration mismatch: {wav_probe['duration_seconds']}")
    if wav_probe["codec_name"] != "pcm_s24le" or wav_probe["sample_rate"] != 48000 or wav_probe["channels"] != 2:
        raise BuildError(f"mixed reel format mismatch: {wav_probe}")
    run(preview_command(wav, preview), label=f"AAC preview {program.title}")
    preview_probe = probe_audio(preview)
    if abs(float(preview_probe["duration_seconds"]) - PROGRAM_SECONDS) > 0.08:
        raise BuildError(f"AAC preview duration mismatch: {preview_probe['duration_seconds']}")

    combined_cues = cue_rows(music_cues, speech)
    (staging / "CUE-SHEET.csv").write_text(
        csv_text(combined_cues, CUE_FIELDS), encoding="utf-8", newline=""
    )
    (staging / "CUE-SHEET.json").write_text(
        json_text(
            {
                "schema_version": "1.0",
                "title": program.title,
                "status": STATUS,
                "rights_status": RIGHTS_STATUS,
                "duration_seconds": PROGRAM_SECONDS,
                "music_cues": music_cues,
                "speech_cues": speech,
            }
        ),
        encoding="utf-8",
        newline="",
    )
    (staging / "TRANSCRIPT.md").write_text(
        transcript_text(program, speech), encoding="utf-8", newline=""
    )
    (staging / "CAPTIONS.vtt").write_text(caption_text(speech), encoding="utf-8", newline="")

    for row in music:
        verify_file(row["_path"], row["_hash"], "post-render music")
    for cue in speech:
        verify_file(Path(cue["period_path"]), cue["period_sha256"], "post-render period speech")
        verify_file(Path(cue["clean_path"]), cue["clean_sha256"], "post-render clean speech")

    names = [program.wav_name, preview.name, "CUE-SHEET.csv", "CUE-SHEET.json", "TRANSCRIPT.md", "CAPTIONS.vtt"]
    artifacts = [
        {"relative_path": name, "bytes": (staging / name).stat().st_size, "sha256": sha256_file(staging / name)}
        for name in names
    ]
    metadata = {
        "schema_version": "1.0",
        "pipeline_version": PIPELINE_VERSION,
        "title": program.title,
        "program_slug": program.slug,
        "epoch_code": program.epoch_code,
        "epoch_alias": program.epoch_alias,
        "voice_anchor": program.voice_anchor,
        "status": STATUS,
        "rights_status": RIGHTS_STATUS,
        "classification": "SELF-CONTAINED PROTOTYPE RADIO DEMO; HUMAN LISTENING REQUIRED",
        "input_signature_sha256": signature,
        "bound_inputs": bound,
        "render_policy": {
            "music": "THREE_104_SECOND_PROVISIONAL_PICK_EXCERPTS_WITH_TWO_4_SECOND_QSIN_CROSSFADES",
            "speech": "EIGHT_ORIGINAL_FICTIONAL_PERIOD_PRESENTATION_CLIPS; CLEAN_PERFORMANCES_PRESERVED",
            "ducking": "MUSIC_ONLY_SIDECHAIN_COMPRESSION_TRIGGERED_BY_SPEECH_STEM",
            "speech_gain_db": SPEECH_GAIN_DB,
            "sidechain": SIDECHAIN,
            "master_protection": "FFMPEG_ALIMITER_0.84; NOT_A_COMMERCIAL_MASTER",
        },
        "filter_complex": graph,
        "tooling": tools,
        "output_probe": wav_probe,
        "preview_probe": preview_probe,
        "primary_wav": {"relative_path": program.wav_name, "sha256": sha256_file(wav)},
        "artifacts": artifacts,
        "assertions": {
            "original_fictional_script_units": True,
            "technology_bulletin_count": 1,
            "fictional_advertisement_count": 1,
            "period_speech_used_for_mix": True,
            "clean_speech_preserved_and_hash_verified": True,
            "voice_cloning_used": False,
            "real_person_impersonation_requested": False,
            "cloud_or_network_service_used": False,
            "gameplay_critical_facts_are_audio_only": False,
        },
        "limitations": [
            "No human or Owner listening acceptance occurred.",
            "macOS speech is a scratch-delivery prototype, not a final broadcaster performance.",
            "Period processing does not establish historical authenticity.",
            "Music is machine-shortlisted and remains subject to human and rights review.",
            "This reel is not production authority and is not cleared for import or ship.",
        ],
    }
    (staging / "METADATA.json").write_text(json_text(metadata), encoding="utf-8", newline="")
    checksum_names = names + ["METADATA.json"]
    checksum_lines = [f"{sha256_file(staging / name)}  {name}" for name in sorted(checksum_names)]
    (staging / "SHA256SUMS.txt").write_text("\n".join(checksum_lines) + "\n", encoding="utf-8", newline="")
    for name in checksum_names + ["SHA256SUMS.txt"]:
        if not (staging / name).is_file() or (staging / name).stat().st_size == 0:
            raise BuildError(f"staged output is absent or empty: {staging / name}")
    if target.exists():
        raise BuildError(f"target appeared before publication: {target}")
    staging.rename(target)
    staging = None
    metadata = verify_existing(target, signature)
    return summary_record(program, target, metadata, "BUILT")


def summary_record(program: Program, directory: Path, metadata: dict[str, Any], state: str) -> dict[str, Any]:
    return {
        "program": program.title,
        "directory": str(directory),
        "state": state,
        "duration_seconds": metadata["output_probe"]["duration_seconds"],
        "wav_path": str(directory / metadata["primary_wav"]["relative_path"]),
        "wav_sha256": metadata["primary_wav"]["sha256"],
        "metadata_sha256": sha256_file(directory / "METADATA.json"),
    }


def plan_record(
    program: Program,
    music: list[dict[str, Any]],
    clips_by_source: dict[str, dict[str, Any]],
    voice_manifest_path: Path,
) -> dict[str, Any]:
    speech = make_speech_cues(program, clips_by_source, voice_manifest_path.parent)
    return {
        "program": program.title,
        "slug": program.slug,
        "epoch_code": program.epoch_code,
        "epoch_alias": program.epoch_alias,
        "duration_seconds": PROGRAM_SECONDS,
        "music": [
            {"candidate_id": row["candidate_id"], "family_id": row["family_id"], "path": str(row["_path"])}
            for row in music
        ],
        "speech": [
            {
                "start_seconds": cue["start_seconds"],
                "source_stable_id": cue["source_stable_id"],
                "source_function": cue["source_function"],
                "period_path": cue["period_path"],
            }
            for cue in speech
        ],
        "technology_bulletins": sum(cue["source_function"] == "fictional_industry_technology_bulletin" for cue in speech),
        "fictional_advertisements": sum(cue["source_function"] == "fictional_advertisement" for cue in speech),
    }


def available_report(args: argparse.Namespace) -> dict[str, Any]:
    scripts, voices, _ = validate_voice_and_scripts(args.script_bank, args.voice_manifest)
    return {
        "pipeline_version": PIPELINE_VERSION,
        "status": "AVAILABLE_INPUTS_VALID",
        "rights_status": RIGHTS_STATUS,
        "script_bank": {
            "path": str(args.script_bank),
            "sha256": sha256_file(args.script_bank),
            "units": len(scripts["units"]),
        },
        "voice_manifest": {
            "path": str(args.voice_manifest),
            "sha256": sha256_file(args.voice_manifest),
            "clips": len(voices["clips"]),
            "clean_files_hash_verified": len(voices["clips"]),
            "period_files_hash_verified": len(voices["clips"]),
        },
        "shortlist": {
            "path": str(args.shortlist),
            "present": args.shortlist.is_file(),
            "next_state": "READY_TO_RENDER" if args.shortlist.is_file() else "WAITING_FOR_PROVISIONAL_MUSIC_SHORTLIST",
        },
        "network_used": False,
        "voice_cloning_used": False,
    }


def filter_self_test(args: argparse.Namespace) -> dict[str, Any]:
    """Exercise the production filter graph with generated inputs and a null sink."""
    tool_identity()
    validate_voice_and_scripts(args.script_bank, args.voice_manifest)
    test_program_seconds = 12.0
    test_music_seconds = 6.0
    test_crossfade_seconds = 3.0
    test_offsets = (0.4, 1.6, 2.8, 4.0, 5.2, 6.4, 7.6, 9.0)
    speech = [{"start_seconds": value} for value in test_offsets]
    graph = filter_graph(
        speech,
        program_seconds=test_program_seconds,
        music_excerpt_seconds=test_music_seconds,
        crossfade_seconds=test_crossfade_seconds,
    )
    command = [str(FFMPEG), "-hide_banner", "-nostdin", "-loglevel", "error"]
    for frequency in (110, 137, 173):
        command.extend(
            ["-f", "lavfi", "-i", f"sine=frequency={frequency}:sample_rate=48000:duration={test_music_seconds:g}"]
        )
    for frequency in range(320, 328):
        command.extend(["-f", "lavfi", "-i", f"sine=frequency={frequency}:sample_rate=48000:duration=0.6"])
    command.extend(["-filter_complex", graph, "-map", "[out]", "-f", "null", "-"])
    run(command, label="non-writing synthetic filter self-test")
    return {
        "pipeline_version": PIPELINE_VERSION,
        "status": "FILTER_SELF_TEST_PASS",
        "actual_script_units_validated": 126,
        "actual_clean_voice_files_hash_verified": 30,
        "actual_period_voice_files_hash_verified": 30,
        "synthetic_music_inputs": 3,
        "synthetic_speech_inputs": 8,
        "test_duration_seconds": test_program_seconds,
        "output_sink": "FFMPEG_NULL_MUXER",
        "files_created": 0,
        "network_used": False,
    }


def build_all(args: argparse.Namespace) -> dict[str, Any]:
    tools = tool_identity()
    scripts, voices, clips_by_source = validate_voice_and_scripts(args.script_bank, args.voice_manifest)
    selected = select_music(args.shortlist)
    plans = [
        plan_record(program, selected[program.slug], clips_by_source, args.voice_manifest)
        for program in PROGRAMS
    ]
    if args.plan_only:
        return {
            "pipeline_version": PIPELINE_VERSION,
            "status": "VALIDATED_RENDER_PLAN",
            "rights_status": RIGHTS_STATUS,
            "plans": plans,
        }
    retained = retained_bytes(MARATHON_ROOT)
    if retained + BUILD_ALLOWANCE_BYTES >= DISK_CAP_BYTES:
        raise BuildError(
            f"disk-cap preflight failed: retained={retained}, allowance={BUILD_ALLOWANCE_BYTES}, cap={DISK_CAP_BYTES}"
        )
    results = []
    for program in PROGRAMS:
        result = render_program(
            program,
            selected[program.slug],
            clips_by_source,
            args.shortlist,
            args.voice_manifest,
            args.script_bank,
            args.output_root,
            tools,
        )
        results.append(result)
        print(f"{result['state']}: {result['program']} -> {result['wav_path']}", flush=True)

    for program in PROGRAMS:
        for clip in selected_clips(program, clips_by_source):
            verify_file(args.voice_manifest.parent / clip["clean_path"], clip["clean_sha256"], "final clean speech")
            verify_file(args.voice_manifest.parent / clip["period_path"], clip["period_sha256"], "final period speech")

    index_rows = []
    for program, result in zip(PROGRAMS, results, strict=True):
        index_rows.append(
            {
                "program": program.title,
                "slug": program.slug,
                "epoch_code": program.epoch_code,
                "epoch_alias": program.epoch_alias,
                "duration_seconds": result["duration_seconds"],
                "wav_path": result["wav_path"],
                "wav_sha256": result["wav_sha256"],
                "directory": result["directory"],
                "metadata_sha256": result["metadata_sha256"],
                "status": STATUS,
                "rights_status": RIGHTS_STATUS,
            }
        )
    publish_text(args.output_root / "RADIO-DEMO-INDEX.csv", csv_text(index_rows, list(index_rows[0])))
    index = {
        "schema_version": "1.0",
        "pipeline_version": PIPELINE_VERSION,
        "title": "Project: Studio Radio Demo Programs",
        "status": STATUS,
        "rights_status": RIGHTS_STATUS,
        "program_count": 3,
        "programs": index_rows,
        "source_manifests": {
            "shortlist": {"path": str(args.shortlist), "sha256": sha256_file(args.shortlist)},
            "voice": {"path": str(args.voice_manifest), "sha256": sha256_file(args.voice_manifest)},
            "script_bank": {"path": str(args.script_bank), "sha256": sha256_file(args.script_bank)},
        },
        "validation": {
            "script_units": len(scripts["units"]),
            "voice_prototypes": len(voices["clips"]),
            "reels_4_to_7_minutes": all(240 <= float(row["duration_seconds"]) <= 420 for row in index_rows),
            "exact_technology_bulletins_per_reel": 1,
            "exact_fictional_advertisements_per_reel": 1,
            "clean_speech_preserved": True,
            "captions_and_transcripts_present": True,
            "controlled_music_ducking": True,
            "no_voice_cloning": True,
            "network_used": False,
        },
        "limitations": [
            "No human or Owner listening acceptance occurred.",
            "These are radio concept prototypes, not final game broadcasts.",
            "No automated process establishes rights clearance or historical authenticity.",
        ],
    }
    publish_text(args.output_root / "RADIO-DEMO-INDEX.json", json_text(index))
    publish_text(
        args.output_root / "README.md",
        "\n".join(
            [
                "# Project: Studio Radio Demo Programs",
                "",
                f"Status: `{STATUS}`  ",
                f"Rights/status: `{RIGHTS_STATUS}`",
                "",
                "Three 304-second concept reels pair provisional machine-shortlisted music with original fictional scratch-delivery speech. Every reel includes an exact cue sheet, verbatim captions, transcript, source-bound metadata, and hashes.",
                "",
                "Only the music bed is ducked while speech is present. Clean speech remains preserved and hash-bound; the mixes use the corresponding period-presentation files.",
                "",
                "No human or Owner listening acceptance occurred. These reels are not final game broadcasts, production authority, or rights clearance.",
                "",
            ]
        ),
    )
    top_names = ["RADIO-DEMO-INDEX.csv", "RADIO-DEMO-INDEX.json", "README.md"]
    publish_text(
        args.output_root / "SHA256SUMS.txt",
        "\n".join(f"{sha256_file(args.output_root / name)}  {name}" for name in sorted(top_names)) + "\n",
    )
    return {
        "pipeline_version": PIPELINE_VERSION,
        "status": "COMPLETE",
        "classification": STATUS,
        "rights_status": RIGHTS_STATUS,
        "output_root": str(args.output_root),
        "program_count": 3,
        "programs": results,
        "index_sha256": sha256_file(args.output_root / "RADIO-DEMO-INDEX.json"),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--shortlist", type=Path, default=DEFAULT_SHORTLIST)
    parser.add_argument("--voice-manifest", type=Path, default=DEFAULT_VOICE_MANIFEST)
    parser.add_argument("--script-bank", type=Path, default=DEFAULT_SCRIPT_BANK)
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT_ROOT)
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument(
        "--validate-available-only",
        action="store_true",
        help="hash-validate existing scripts and voice assets without requiring the music shortlist",
    )
    modes.add_argument(
        "--plan-only",
        action="store_true",
        help="validate all final inputs and print the exact render plan without publishing",
    )
    modes.add_argument(
        "--self-test-filter-only",
        action="store_true",
        help="exercise the complete filter topology with generated inputs and FFmpeg's null sink",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.validate_available_only:
        result = available_report(args)
    elif args.self_test_filter_only:
        result = filter_self_test(args)
    else:
        result = build_all(args)
    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))


if __name__ == "__main__":
    try:
        main()
    except BuildError as exc:
        raise SystemExit(f"RADIO DEMO PIPELINE STOPPED: {exc}") from exc
