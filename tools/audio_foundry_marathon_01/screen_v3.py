#!/usr/bin/env python3
"""Model-Aware Screening V3 for Audio Foundry Marathon 01.

This is a local, deterministic, CPU-only screening pipeline.  It never edits
raw audio.  The original pilot's V2 automatic disposition remains historical
authority for its 24 candidates; V3 diagnostics do not rewrite that history.

Two stages keep the workflow resumable:

* ``technical`` verifies the canonical inventory and raw hashes, imports the
  immutable pilot V2 evidence, computes/caches technical measurements, applies
  conservative exact/near-duplicate gates, and writes a jury-ready inventory.
* ``finalize`` joins one or more optional machine-jury CSVs and applies the
  bounded family law (at least two automatic passes with no severe jury
  mismatch).  Missing jury rows remain pending and never count as passes.

All outputs are ANALYSIS SIGNAL ONLY and PROTOTYPE_ONLY.  Endpoint equality is
never, by itself, a failure: the pinned Stable Audio MLX writer clips float
output to [-1, 1] before PCM16 serialization.  Only sustained near-rail
flattening crosses the V3 clipping gate.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import math
import os
import re
import shutil
import subprocess
import tempfile
import wave
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Iterable

import numpy as np
import soundfile as sf

from foundry_common import MARATHON_ROOT, PILOT_ROOT, atomic_write_json, atomic_write_text, sha256_file, utc_now


ANALYSIS_VERSION = "audio-foundry-screening-v3.1"
RIGHTS_STATUS = "PROTOTYPE_ONLY"
SIGNAL_STATUS = "ANALYSIS SIGNAL ONLY"

DEFAULT_INVENTORY = MARATHON_ROOT / "01_catalogue" / "all-canonical-144-inventory.csv"
DEFAULT_PILOT_V2_METRICS = PILOT_ROOT / "03_screening" / "gate-v2" / "metrics-objective.csv"
DEFAULT_PILOT_V2_DISPOSITION = PILOT_ROOT / "03_screening" / "gate-v2" / "final-disposition.csv"
DEFAULT_OUTPUT_DIR = MARATHON_ROOT / "03_analysis"
DEFAULT_CACHE_DIR = DEFAULT_OUTPUT_DIR / "cache" / "screening-v3"

EXPECTED_FORMAT = {
    "channels": 2,
    "sample_rate": 44_100,
    "frames": 5_292_000,
    "duration_seconds": 120.0,
    "subtype": "PCM_16",
}
EXPECTED_PILOT_EXCLUSIONS = {
    "FND-02__seed-155921": "STEREO_NEGATIVE_CORRELATION",
    "DFG-03__seed-196613": "TRAILING_SILENCE",
}
RESCUE_SEEDS = (262147, 324503, 400009, 499979)

# V3 thresholds are intentionally sparse and conservative.  Raw loudness and
# seam warnings are useful ranking signals, but moderate normalization needs
# are not grounds to reject an otherwise valid prototype.
SILENCE_AMPLITUDE = 10.0 ** (-50.0 / 20.0)
LEADING_SILENCE_LIMIT_SECONDS = 1.0
TRAILING_SILENCE_LIMIT_SECONDS = 2.0
INTERNAL_SILENCE_LIMIT_SECONDS = 2.0
DC_OFFSET_LIMIT = 0.01
NEGATIVE_CORRELATION_LIMIT = -0.2
NEGATIVE_CORRELATION_WINDOWS = 3
MONO_FOLD_LOSS_LIMIT_DB = 6.0
SUSTAINED_FLAT_TOP_LIMIT_MS = 5.0
RAW_LOUDNESS_LOW_LIMIT_LUFS = -35.0
RAW_LOUDNESS_HIGH_LIMIT_LUFS = -4.0
CREST_FACTOR_LOW_LIMIT_DB = 2.5
CREST_FACTOR_HIGH_LIMIT_DB = 35.0
NEAR_DUPLICATE_FINGERPRINT_COSINE = 0.9995
NEAR_DUPLICATE_ENVELOPE_CORRELATION = 0.995

TECHNICAL_FIELDS = [
    "candidate_id", "epoch", "prompt_id", "prompt_family", "seed",
    "absolute_path", "source_sha256", "source_bytes", "source_class",
    "gate_basis", "preserved_v2_status", "preserved_v2_reasons",
    "technical_automatic_pass", "screening_status", "automatic_failure_reasons",
    "technical_warnings", "analysis_status", "measurement_status", "format_name", "subtype",
    "channels", "sample_rate", "frames", "duration_seconds", "nonfinite_count",
    "dc_left", "dc_right", "rms_dbfs", "peak_dbfs", "crest_factor_db",
    "raw_loudness_lufs_i", "raw_loudness_range_lu", "raw_true_peak_dbtp",
    "leading_silence_seconds", "trailing_silence_seconds",
    "max_internal_silence_seconds", "fullscale_count", "fullscale_percent",
    "fullscale_positive_count", "fullscale_negative_count", "pcm_minimum_value_count",
    "max_endpoint_run_ms", "max_near_full_flat_run_ms", "flat_top_class",
    "stereo_min_correlation", "stereo_negative_run_windows", "mono_fold_loss_db",
    "ending_rms_50ms_dbfs", "ending_frame_peak", "abrupt_ending_signal",
    "loop_boundary_jump", "loop_boundary_jump_over_rms", "loop_edge_rms_mismatch_db",
    "loop_edge_spectral_similarity", "loop_seam_quality_signal",
    "nearest_candidate_id", "nearest_fingerprint_cosine",
    "nearest_envelope_correlation", "duplicate_cluster_keeper",
    "duplicate_class", "endpoint_policy", "analysis_version", "rights_status",
]


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def csv_text(rows: list[dict[str, Any]], fieldnames: list[str]) -> str:
    buffer = io.StringIO(newline="")
    writer = csv.DictWriter(buffer, fieldnames=fieldnames, extrasaction="ignore", lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()


def parse_bool(value: Any) -> bool:
    return str(value).strip().lower() in {"1", "true", "yes", "y", "pass", "passed"}


def finite_float(value: Any, fallback: float = math.nan) -> float:
    try:
        result = float(value)
    except (TypeError, ValueError):
        return fallback
    return result if math.isfinite(result) else fallback


def dbfs(value: float) -> float:
    return 20.0 * math.log10(max(float(value), 1e-12))


def clipped(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return float(np.clip(value, low, high))


def normalized_vector(values: np.ndarray) -> np.ndarray:
    vector = np.asarray(values, dtype=np.float64).reshape(-1)
    vector -= float(np.mean(vector))
    norm = float(np.linalg.norm(vector))
    if norm <= 1e-12:
        return np.zeros_like(vector, dtype=np.float32)
    return (vector / norm).astype(np.float32)


def true_runs(mask: np.ndarray) -> list[tuple[int, int]]:
    if not np.any(mask):
        return []
    padded = np.concatenate(([False], np.asarray(mask, dtype=bool), [False]))
    changes = np.flatnonzero(padded[1:] != padded[:-1])
    return [(int(start), int(end)) for start, end in zip(changes[::2], changes[1::2], strict=True)]


def max_true_run(mask: np.ndarray) -> int:
    return max((end - start for start, end in true_runs(mask)), default=0)


def silence_runs(mask: np.ndarray) -> tuple[int, int, int]:
    runs = true_runs(mask)
    if not runs:
        return 0, 0, 0
    leading = runs[0][1] if runs[0][0] == 0 else 0
    trailing = len(mask) - runs[-1][0] if runs[-1][1] == len(mask) else 0
    internal = max((end - start for start, end in runs if start > 0 and end < len(mask)), default=0)
    return int(leading), int(trailing), int(internal)


def split_reasons(value: str) -> list[str]:
    return [item.strip() for item in re.split(r"[;,]", value or "") if item.strip()]


def current_stable_audio_processes() -> list[str]:
    """Return matching inference commands without killing or signalling them."""
    completed = subprocess.run(
        ["ps", "-axo", "pid=,command="], check=True, capture_output=True, text=True
    )
    matches = []
    for line in completed.stdout.splitlines():
        lower = line.lower()
        if "sa3_mlx.py" in lower or ("stable-audio-3" in lower and "--prompt" in lower):
            matches.append(line.strip())
    return matches


def require_inference_idle() -> None:
    matches = current_stable_audio_processes()
    if matches:
        raise RuntimeError(
            "Stable Audio inference is active; Screening V3 intentionally refuses to run:\n"
            + "\n".join(matches)
        )


def ffmpeg_path() -> Path:
    candidates = [Path("/opt/homebrew/bin/ffmpeg"), Path("/usr/local/bin/ffmpeg")]
    located = shutil.which("ffmpeg")
    if located:
        candidates.append(Path(located))
    for path in candidates:
        if path.is_file():
            return path
    raise FileNotFoundError("ffmpeg is required for deterministic EBU R128 measurement")


def loudnorm_analysis(path: Path) -> dict[str, float]:
    completed = subprocess.run(
        [
            str(ffmpeg_path()), "-nostdin", "-hide_banner", "-i", str(path),
            "-af", "loudnorm=I=-18:LRA=12:TP=-1.5:print_format=json", "-f", "null", "-",
        ],
        check=False,
        capture_output=True,
        text=True,
    )
    if completed.returncode != 0:
        raise RuntimeError(f"ffmpeg loudnorm failed ({completed.returncode}): {completed.stderr[-2000:]}")
    matches = re.findall(r'\{\s*"input_i".*?\}', completed.stderr, flags=re.S)
    if not matches:
        raise RuntimeError("ffmpeg loudnorm did not emit its JSON measurement")
    payload = json.loads(matches[-1])
    result = {
        "raw_loudness_lufs_i": float(payload["input_i"]),
        "raw_loudness_range_lu": float(payload["input_lra"]),
        "raw_true_peak_dbtp": float(payload["input_tp"]),
    }
    if not all(math.isfinite(value) for value in result.values()):
        raise RuntimeError(f"nonfinite loudnorm result: {result}")
    return result


def stereo_correlation(audio: np.ndarray, sample_rate: int) -> tuple[float, int]:
    window = sample_rate
    hop = sample_rate // 2
    values: list[float] = []
    for start in range(0, max(0, len(audio) - window + 1), hop):
        block = audio[start : start + window].astype(np.float64, copy=False)
        left = block[:, 0] - float(np.mean(block[:, 0]))
        right = block[:, 1] - float(np.mean(block[:, 1]))
        denominator = math.sqrt(float(np.dot(left, left)) * float(np.dot(right, right)))
        values.append(float(np.dot(left, right) / denominator) if denominator > 1e-15 else 0.0)
    negative_run = max_true_run(np.asarray(values) < NEGATIVE_CORRELATION_LIMIT)
    return float(min(values, default=0.0)), int(negative_run)


def endpoint_metrics(pcm: np.ndarray, sample_rate: int) -> dict[str, Any]:
    integer = pcm.astype(np.int32, copy=False)
    # The pinned writer maps clamp endpoints to +/-32767.  -32768 is counted
    # separately as an unexpected serialization observation.
    endpoint = np.abs(integer) == 32767
    durations: list[int] = []
    for channel in range(pcm.shape[1]):
        durations.extend(end - start for start, end in true_runs(endpoint[:, channel]))
    near_full = np.abs(integer) >= round(0.98 * 32767)
    differences = np.abs(np.diff(integer, axis=0))
    near_flat_step = near_full[1:] & near_full[:-1] & (differences <= 1)
    longest_near_flat_steps = max(
        (max_true_run(near_flat_step[:, channel]) for channel in range(pcm.shape[1])),
        default=0,
    )
    longest_near_flat_frames = longest_near_flat_steps + 1 if longest_near_flat_steps else 0
    max_endpoint_frames = max(durations, default=0)
    flat_ms = longest_near_flat_frames * 1000.0 / sample_rate
    return {
        "fullscale_count": int(np.sum(endpoint)),
        "fullscale_percent": 100.0 * float(np.sum(endpoint)) / max(1, endpoint.size),
        "fullscale_positive_count": int(np.sum(integer == 32767)),
        "fullscale_negative_count": int(np.sum(integer == -32767)),
        "pcm_minimum_value_count": int(np.sum(integer == -32768)),
        "max_endpoint_run_ms": max_endpoint_frames * 1000.0 / sample_rate,
        "max_near_full_flat_run_ms": flat_ms,
        "flat_top_class": (
            "FAIL_SUSTAINED_NEAR_RAIL_FLATTENING"
            if flat_ms >= SUSTAINED_FLAT_TOP_LIMIT_MS
            else "PASS_ENDPOINT_CONTACT_DIAGNOSTIC_ONLY"
            if np.any(endpoint)
            else "PASS_NO_SERIALIZED_RAIL_CONTACT"
        ),
    }


def fingerprint(audio: np.ndarray, sample_rate: int) -> tuple[np.ndarray, np.ndarray]:
    """Create arrangement-sensitive spectral and energy signatures.

    The expected 44.1 kHz source is averaged to 11.025 kHz and divided into
    one-second blocks.  Keeping temporal order makes the threshold far more
    conservative than a single whole-track timbre vector.
    """
    mono = np.mean(audio.astype(np.float64, copy=False), axis=1)
    factor = 4 if sample_rate == 44_100 else max(1, sample_rate // 11_025)
    usable = (len(mono) // factor) * factor
    down = np.mean(mono[:usable].reshape(-1, factor), axis=1) if factor > 1 else mono[:usable]
    down_rate = sample_rate / factor
    block = max(256, int(round(down_rate)))
    count = len(down) // block
    if count < 10:
        raise RuntimeError("audio is too short for duplicate fingerprinting")
    down = down[: count * block].reshape(count, block)
    window = np.hanning(block)
    spectrum = np.square(np.abs(np.fft.rfft(down * window[None, :], axis=1)))
    frequencies = np.fft.rfftfreq(block, d=1.0 / down_rate)
    edges = np.geomspace(40.0, min(5_000.0, down_rate * 0.45), 25)
    bands = []
    for low, high in zip(edges[:-1], edges[1:], strict=True):
        selected = (frequencies >= low) & (frequencies < high)
        bands.append(np.mean(spectrum[:, selected], axis=1) if np.any(selected) else np.zeros(count))
    log_bands = np.log10(np.maximum(np.stack(bands, axis=1), 1e-14))
    log_bands -= np.mean(log_bands, axis=1, keepdims=True)
    envelope = np.sqrt(np.mean(np.square(down), axis=1))
    return normalized_vector(log_bands), normalized_vector(np.log10(np.maximum(envelope, 1e-12)))


def edge_metrics(audio: np.ndarray, sample_rate: int, rms_all: float) -> dict[str, float | str]:
    edge_frames = max(1, int(round(2.0 * sample_rate)))
    short_frames = max(1, int(round(0.050 * sample_rate)))
    head = np.mean(audio[:edge_frames].astype(np.float64, copy=False), axis=1)
    tail = np.mean(audio[-edge_frames:].astype(np.float64, copy=False), axis=1)
    ending = audio[-short_frames:].astype(np.float64, copy=False)
    end_rms = float(np.sqrt(np.mean(np.square(ending))))
    ending_frame_peak = float(np.max(np.abs(audio[-1])))
    jump = float(np.sqrt(np.mean(np.square(audio[-1].astype(np.float64) - audio[0].astype(np.float64)))))
    jump_over_rms = jump / max(rms_all, 1e-12)
    head_rms = float(np.sqrt(np.mean(np.square(head))))
    tail_rms = float(np.sqrt(np.mean(np.square(tail))))
    rms_mismatch = abs(dbfs(head_rms) - dbfs(tail_rms))
    window = np.hanning(edge_frames)
    head_spectrum = np.log1p(np.abs(np.fft.rfft(head * window)))
    tail_spectrum = np.log1p(np.abs(np.fft.rfft(tail * window)))
    denominator = float(np.linalg.norm(head_spectrum) * np.linalg.norm(tail_spectrum))
    spectral_similarity = float(np.dot(head_spectrum, tail_spectrum) / denominator) if denominator else 0.0
    seam_quality = clipped(
        0.50 * math.exp(-jump_over_rms / 2.0)
        + 0.25 * math.exp(-rms_mismatch / 8.0)
        + 0.25 * clipped(spectral_similarity)
    )
    abrupt = end_rms > 10.0 ** (-12.0 / 20.0) and ending_frame_peak > 0.35 and jump_over_rms > 2.5
    return {
        "ending_rms_50ms_dbfs": dbfs(end_rms),
        "ending_frame_peak": ending_frame_peak,
        "abrupt_ending_signal": "SEVERE" if abrupt else "NONE_OR_MODERATE",
        "loop_boundary_jump": jump,
        "loop_boundary_jump_over_rms": jump_over_rms,
        "loop_edge_rms_mismatch_db": rms_mismatch,
        "loop_edge_spectral_similarity": spectral_similarity,
        "loop_seam_quality_signal": seam_quality,
    }


def cache_paths(cache_dir: Path, source_hash: str) -> tuple[Path, Path]:
    return cache_dir / f"{source_hash}.json", cache_dir / f"{source_hash}.npz"


def atomic_save_npz(path: Path, **arrays: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".npz", dir=path.parent)
    os.close(descriptor)
    temporary = Path(name)
    try:
        np.savez_compressed(temporary, **arrays)
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def load_cache(cache_dir: Path, source_hash: str) -> tuple[dict[str, Any], np.ndarray, np.ndarray] | None:
    json_path, npz_path = cache_paths(cache_dir, source_hash)
    if not json_path.is_file() or not npz_path.is_file():
        return None
    try:
        payload = json.loads(json_path.read_text(encoding="utf-8"))
        if payload.get("analysis_version") != ANALYSIS_VERSION or payload.get("source_sha256") != source_hash:
            return None
        with np.load(npz_path, allow_pickle=False) as archive:
            if str(archive["analysis_version"].item()) != ANALYSIS_VERSION:
                return None
            spectral = np.asarray(archive["spectral"], dtype=np.float32)
            envelope = np.asarray(archive["envelope"], dtype=np.float32)
        return payload, spectral, envelope
    except (OSError, ValueError, KeyError, json.JSONDecodeError):
        return None


def analyze_audio(path: Path, source_hash: str, cache_dir: Path) -> tuple[dict[str, Any], np.ndarray, np.ndarray]:
    cached = load_cache(cache_dir, source_hash)
    if cached is not None:
        return cached

    reasons: list[str] = []
    warnings: list[str] = []
    try:
        info = sf.info(path)
        with wave.open(str(path), "rb") as handle:
            wave_facts = {
                "channels": handle.getnchannels(),
                "sample_width": handle.getsampwidth(),
                "sample_rate": handle.getframerate(),
                "frames": handle.getnframes(),
            }
        audio, sample_rate = sf.read(path, dtype="float32", always_2d=True)
        pcm, pcm_rate = sf.read(path, dtype="int16", always_2d=True)
        if sample_rate != pcm_rate or audio.shape != pcm.shape:
            raise RuntimeError("inconsistent decoder output between float and PCM reads")
    except Exception as error:
        payload = {
            "analysis_version": ANALYSIS_VERSION,
            "source_sha256": source_hash,
            "analysis_status": "FAILED_TO_DECODE",
            "base_failure_reasons": ["CORRUPT_OR_UNREADABLE"],
            "technical_warnings": [],
            "decode_error": f"{type(error).__name__}: {error}",
        }
        # A one-element sentinel keeps cache shape handling simple while the
        # candidate remains excluded from duplicate comparisons.
        spectral = np.zeros(1, dtype=np.float32)
        envelope = np.zeros(1, dtype=np.float32)
        json_path, npz_path = cache_paths(cache_dir, source_hash)
        atomic_save_npz(npz_path, analysis_version=np.array(ANALYSIS_VERSION), spectral=spectral, envelope=envelope)
        atomic_write_json(json_path, payload)
        return payload, spectral, envelope

    channels = int(info.channels)
    frames = int(info.frames)
    duration = float(info.duration)
    if info.format != "WAV":
        reasons.append("FORMAT_CONTAINER_NOT_WAV")
    if info.subtype != EXPECTED_FORMAT["subtype"]:
        reasons.append("FORMAT_NOT_PCM16")
    if channels != EXPECTED_FORMAT["channels"]:
        reasons.append("CHANNEL_COUNT_MISMATCH")
    if sample_rate != EXPECTED_FORMAT["sample_rate"]:
        reasons.append("SAMPLE_RATE_MISMATCH")
    if frames != EXPECTED_FORMAT["frames"] or abs(duration - EXPECTED_FORMAT["duration_seconds"]) > 1e-6:
        reasons.append("DURATION_MISMATCH")
    if wave_facts != {"channels": 2, "sample_width": 2, "sample_rate": 44_100, "frames": 5_292_000}:
        reasons.append("WAV_HEADER_MISMATCH")

    nonfinite_count = int(np.size(audio) - np.count_nonzero(np.isfinite(audio)))
    if nonfinite_count:
        reasons.append("NONFINITE_VALUES")
        audio = np.nan_to_num(audio, nan=0.0, posinf=1.0, neginf=-1.0)
    dc = np.mean(audio.astype(np.float64), axis=0)
    if np.any(np.abs(dc) > DC_OFFSET_LIMIT):
        reasons.append("DC_OFFSET")
    rms_all = float(np.sqrt(np.mean(np.square(audio.astype(np.float64)))))
    peak = float(np.max(np.abs(audio)))
    crest = dbfs(peak / max(rms_all, 1e-12))
    if rms_all < SILENCE_AMPLITUDE:
        reasons.append("EFFECTIVE_SILENCE")
    if crest < CREST_FACTOR_LOW_LIMIT_DB or crest > CREST_FACTOR_HIGH_LIMIT_DB:
        reasons.append("EXTREME_CREST_FACTOR")

    silence_mask = np.max(np.abs(audio), axis=1) < SILENCE_AMPLITUDE
    leading, trailing, internal = silence_runs(silence_mask)
    if leading / sample_rate > LEADING_SILENCE_LIMIT_SECONDS:
        reasons.append("LEADING_SILENCE")
    if trailing / sample_rate > TRAILING_SILENCE_LIMIT_SECONDS:
        reasons.append("TRAILING_SILENCE")
    if internal / sample_rate > INTERNAL_SILENCE_LIMIT_SECONDS:
        reasons.append("INTERNAL_SILENCE_REQUIRES_HUMAN_ACCEPTANCE")

    endpoints = endpoint_metrics(pcm, sample_rate)
    if endpoints["max_near_full_flat_run_ms"] >= SUSTAINED_FLAT_TOP_LIMIT_MS:
        reasons.append("SUSTAINED_NEAR_RAIL_FLATTENING")
    min_correlation, negative_run = stereo_correlation(audio, sample_rate)
    if negative_run >= NEGATIVE_CORRELATION_WINDOWS:
        reasons.append("STEREO_NEGATIVE_CORRELATION")
    stereo_reference_rms = math.sqrt(float(np.mean(np.square(audio.astype(np.float64)))))
    mono = np.mean(audio.astype(np.float64), axis=1)
    mono_rms = float(np.sqrt(np.mean(np.square(mono))))
    mono_fold_loss = dbfs(stereo_reference_rms / max(mono_rms, 1e-12))
    if mono_fold_loss > MONO_FOLD_LOSS_LIMIT_DB:
        reasons.append("MONO_FOLD_LOSS")

    try:
        loudness = loudnorm_analysis(path)
        if not (RAW_LOUDNESS_LOW_LIMIT_LUFS <= loudness["raw_loudness_lufs_i"] <= RAW_LOUDNESS_HIGH_LIMIT_LUFS):
            reasons.append("EXTREME_RAW_LOUDNESS")
    except Exception as error:
        loudness = {
            "raw_loudness_lufs_i": None,
            "raw_loudness_range_lu": None,
            "raw_true_peak_dbtp": None,
        }
        reasons.append("LOUDNESS_ANALYSIS_ERROR")
        warnings.append(f"LOUDNESS_ERROR:{type(error).__name__}")

    edges = edge_metrics(audio, sample_rate, rms_all)
    if edges["abrupt_ending_signal"] == "SEVERE":
        reasons.append("ABRUPT_ENDING")
    if float(edges["loop_seam_quality_signal"]) < 0.20:
        warnings.append("RAW_LOOP_SEAM_REQUIRES_CROSSFADE")
    spectral, envelope = fingerprint(audio, sample_rate)

    payload = {
        "analysis_version": ANALYSIS_VERSION,
        "source_sha256": source_hash,
        "analysis_status": "COMPLETE",
        "base_failure_reasons": sorted(set(reasons)),
        "technical_warnings": sorted(set(warnings)),
        "format_name": info.format,
        "subtype": info.subtype,
        "channels": channels,
        "sample_rate": sample_rate,
        "frames": frames,
        "duration_seconds": duration,
        "nonfinite_count": nonfinite_count,
        "dc_left": float(dc[0]) if len(dc) else None,
        "dc_right": float(dc[1]) if len(dc) > 1 else None,
        "rms_dbfs": dbfs(rms_all),
        "peak_dbfs": dbfs(peak),
        "crest_factor_db": crest,
        **loudness,
        "leading_silence_seconds": leading / sample_rate,
        "trailing_silence_seconds": trailing / sample_rate,
        "max_internal_silence_seconds": internal / sample_rate,
        **endpoints,
        "stereo_min_correlation": min_correlation,
        "stereo_negative_run_windows": negative_run,
        "mono_fold_loss_db": mono_fold_loss,
        **edges,
        "endpoint_policy": (
            "ENDPOINT_EQUALITY_DIAGNOSTIC_ONLY; FAIL ONLY SUSTAINED NEAR-RAIL FLATTENING "
            f">={SUSTAINED_FLAT_TOP_LIMIT_MS:.1f}MS"
        ),
    }
    json_path, npz_path = cache_paths(cache_dir, source_hash)
    atomic_save_npz(npz_path, analysis_version=np.array(ANALYSIS_VERSION), spectral=spectral, envelope=envelope)
    atomic_write_json(json_path, payload)
    return payload, spectral, envelope


class UnionFind:
    def __init__(self, items: Iterable[str]) -> None:
        self.parent = {item: item for item in items}

    def find(self, item: str) -> str:
        while self.parent[item] != item:
            self.parent[item] = self.parent[self.parent[item]]
            item = self.parent[item]
        return item

    def union(self, left: str, right: str) -> None:
        a, b = self.find(left), self.find(right)
        if a != b:
            self.parent[max(a, b)] = min(a, b)


def load_and_validate_inventory(path: Path, expected_count: int) -> list[dict[str, str]]:
    rows = read_csv(path)
    required = {"candidate_id", "epoch", "prompt_id", "absolute_path", "sha256", "seed"}
    if not rows or not required.issubset(rows[0]):
        raise ValueError(f"inventory lacks required fields: {sorted(required - set(rows[0] if rows else {}))}")
    if len(rows) != expected_count:
        raise ValueError(f"expected {expected_count} canonical inventory rows, found {len(rows)}")
    if len({row["candidate_id"] for row in rows}) != len(rows):
        raise ValueError("candidate IDs are not unique")
    family_counts = Counter(row["prompt_id"] for row in rows)
    if expected_count == 144 and (len(family_counts) != 36 or set(family_counts.values()) != {4}):
        raise ValueError(f"canonical pool is not 36 families x four candidates: {dict(family_counts)}")
    for row in rows:
        if row.get("rights_status") not in {"", RIGHTS_STATUS}:
            raise ValueError(f"unexpected rights status for {row['candidate_id']}: {row.get('rights_status')}")
        source = Path(row["absolute_path"])
        if not source.is_file() or source.is_symlink():
            raise FileNotFoundError(f"raw source is absent or symlinked: {source}")
        actual = sha256_file(source)
        if actual != row["sha256"]:
            raise RuntimeError(f"raw provenance hash mismatch: {row['candidate_id']}: {actual} != {row['sha256']}")
        expected_bytes = row.get("bytes")
        if expected_bytes and source.stat().st_size != int(expected_bytes):
            raise RuntimeError(f"raw byte count mismatch: {row['candidate_id']}")
    return rows


def load_pilot_v2(metrics_path: Path, disposition_path: Path, inventory: list[dict[str, str]]) -> dict[str, dict[str, str]]:
    metrics_rows = read_csv(metrics_path)
    dispositions = {row["candidate_id"]: row for row in read_csv(disposition_path)}
    metrics = {row["candidate_id"]: row for row in metrics_rows}
    legacy = [row for row in inventory if row.get("screening_gate") == "V2"]
    if len(legacy) != 24:
        raise RuntimeError(f"expected exactly 24 preserved pilot V2 rows, found {len(legacy)}")
    if set(metrics) != {row["candidate_id"] for row in legacy} or set(dispositions) != set(metrics):
        raise RuntimeError("pilot V2 evidence candidate set does not match the 24 legacy inventory rows")
    exclusions = {}
    for row in legacy:
        candidate_id = row["candidate_id"]
        metric = metrics[candidate_id]
        if metric["raw_sha256"] != row["sha256"]:
            raise RuntimeError(f"pilot V2 raw hash mismatch: {candidate_id}")
        if not parse_bool(metric["nonclipping_automatic_pass"]):
            exclusions[candidate_id] = metric["nonclipping_automatic_reasons"]
        disposition_reason = dispositions[candidate_id].get("nonclipping_automatic_reasons", "")
        if disposition_reason != metric["nonclipping_automatic_reasons"]:
            raise RuntimeError(f"pilot V2 disposition/metric disagreement: {candidate_id}")
    if exclusions != EXPECTED_PILOT_EXCLUSIONS:
        raise RuntimeError(f"preserved pilot exclusions changed: {exclusions}")
    return metrics


def duplicate_analysis(
    inventory: list[dict[str, str]],
    base_pass: dict[str, bool],
    spectral: dict[str, np.ndarray],
    envelopes: dict[str, np.ndarray],
) -> tuple[list[dict[str, Any]], dict[str, dict[str, Any]]]:
    candidate_ids = [row["candidate_id"] for row in inventory]
    row_map = {row["candidate_id"]: row for row in inventory}
    hashes = {row["candidate_id"]: row["sha256"] for row in inventory}
    union = UnionFind(candidate_ids)
    pairs: list[dict[str, Any]] = []
    nearest = {candidate_id: {"candidate_id": "", "spectral": -1.0, "envelope": -1.0} for candidate_id in candidate_ids}

    for left_index, left in enumerate(candidate_ids):
        for right in candidate_ids[left_index + 1 :]:
            exact = hashes[left] == hashes[right]
            left_spectral, right_spectral = spectral[left], spectral[right]
            left_envelope, right_envelope = envelopes[left], envelopes[right]
            compatible = left_spectral.shape == right_spectral.shape and left_spectral.size > 1
            spectral_score = float(np.dot(left_spectral, right_spectral)) if compatible else math.nan
            envelope_score = (
                float(np.dot(left_envelope, right_envelope))
                if compatible and left_envelope.shape == right_envelope.shape
                else math.nan
            )
            for first, second in ((left, right), (right, left)):
                if math.isfinite(spectral_score) and spectral_score > nearest[first]["spectral"]:
                    nearest[first] = {"candidate_id": second, "spectral": spectral_score, "envelope": envelope_score}
            near = (
                not exact
                and math.isfinite(spectral_score)
                and math.isfinite(envelope_score)
                and spectral_score >= NEAR_DUPLICATE_FINGERPRINT_COSINE
                and envelope_score >= NEAR_DUPLICATE_ENVELOPE_CORRELATION
            )
            if exact or near:
                union.union(left, right)
                pairs.append({
                    "candidate_a": left,
                    "candidate_b": right,
                    "duplicate_class": "EXACT" if exact else "NEAR",
                    "fingerprint_cosine": spectral_score,
                    "envelope_correlation": envelope_score,
                    "threshold_policy": (
                        "SHA256_EQUAL"
                        if exact
                        else f"SPECTRAL>={NEAR_DUPLICATE_FINGERPRINT_COSINE};ENVELOPE>={NEAR_DUPLICATE_ENVELOPE_CORRELATION}"
                    ),
                    "analysis_status": SIGNAL_STATUS,
                    "rights_status": RIGHTS_STATUS,
                })

    components: dict[str, list[str]] = defaultdict(list)
    for candidate_id in candidate_ids:
        components[union.find(candidate_id)].append(candidate_id)
    duplicate_info: dict[str, dict[str, Any]] = {
        candidate_id: {"keeper": "", "class": "", "reject": False} for candidate_id in candidate_ids
    }
    for members in components.values():
        if len(members) < 2:
            continue
        keeper = min(
            members,
            key=lambda item: (
                not base_pass[item],
                row_map[item].get("screening_gate") != "V2",
                item,
            ),
        )
        for member in members:
            if member == keeper:
                duplicate_info[member] = {"keeper": keeper, "class": "CLUSTER_KEEPER", "reject": False}
                continue
            exact_to_keeper = hashes[member] == hashes[keeper]
            source_is_legacy = row_map[member].get("screening_gate") == "V2"
            duplicate_info[member] = {
                "keeper": keeper,
                "class": "EXACT_DUPLICATE" if exact_to_keeper else "NEAR_DUPLICATE_CLUSTER",
                # Never rewrite the historical status of a pilot V2 source.
                "reject": not source_is_legacy,
            }
    pairs.sort(key=lambda row: (row["duplicate_class"], row["candidate_a"], row["candidate_b"]))
    return pairs, {candidate_id: {**nearest[candidate_id], **duplicate_info[candidate_id]} for candidate_id in candidate_ids}


def output_paths(output_dir: Path) -> dict[str, Path]:
    return {
        "technical": output_dir / "screening-v3-technical.csv",
        "details": output_dir / "screening-v3-technical-details.jsonl",
        "duplicates": output_dir / "screening-v3-duplicate-pairs.csv",
        "jury_ready": output_dir / "screening-v3-jury-ready-inventory.csv",
        "technical_summary": output_dir / "screening-v3-technical-summary.json",
        "final": output_dir / "screening-v3-final.csv",
        "families": output_dir / "screening-v3-family-status.csv",
        "rescue": output_dir / "screening-v3-rescue-needed.csv",
        "final_summary": output_dir / "screening-v3-final-summary.json",
    }


def technical(args: argparse.Namespace) -> dict[str, Any]:
    inventory = load_and_validate_inventory(args.inventory, args.expected_count)
    pilot_metrics = load_pilot_v2(args.pilot_v2_metrics, args.pilot_v2_disposition, inventory)
    cache_dir = args.cache_dir
    measurements: dict[str, dict[str, Any]] = {}
    spectral: dict[str, np.ndarray] = {}
    envelopes: dict[str, np.ndarray] = {}
    base_pass: dict[str, bool] = {}
    base_reasons: dict[str, list[str]] = {}

    for index, item in enumerate(inventory, start=1):
        candidate_id = item["candidate_id"]
        metrics, spectral_vector, envelope_vector = analyze_audio(
            Path(item["absolute_path"]), item["sha256"], cache_dir
        )
        measurements[candidate_id] = metrics
        spectral[candidate_id] = spectral_vector
        envelopes[candidate_id] = envelope_vector
        if item.get("screening_gate") == "V2":
            historical = pilot_metrics[candidate_id]
            base_pass[candidate_id] = parse_bool(historical["nonclipping_automatic_pass"])
            base_reasons[candidate_id] = split_reasons(historical["nonclipping_automatic_reasons"])
        else:
            base_reasons[candidate_id] = list(metrics.get("base_failure_reasons", []))
            base_pass[candidate_id] = not base_reasons[candidate_id]
        print(f"[{index:03d}/{len(inventory):03d}] V3 {candidate_id} base={'PASS' if base_pass[candidate_id] else 'FAIL'}", flush=True)

    duplicate_pairs, duplicate_info = duplicate_analysis(inventory, base_pass, spectral, envelopes)
    paths = output_paths(args.output_dir)
    rows: list[dict[str, Any]] = []
    details: list[str] = []
    inventory_map = {row["candidate_id"]: row for row in inventory}
    for item in inventory:
        candidate_id = item["candidate_id"]
        metric = measurements[candidate_id]
        legacy = item.get("screening_gate") == "V2"
        reasons = list(base_reasons[candidate_id])
        duplicate = duplicate_info[candidate_id]
        if duplicate["reject"]:
            reasons.append(f"{duplicate['class']}_OF:{duplicate['keeper']}")
        reasons = sorted(set(reasons))
        warnings = list(metric.get("technical_warnings", []))
        fresh_reasons = list(metric.get("base_failure_reasons", []))
        if legacy and sorted(fresh_reasons) != sorted(base_reasons[candidate_id]):
            warnings.append("FRESH_V3_DIAGNOSTICS_DIFFER_FROM_PRESERVED_V2; HISTORY_NOT_REWRITTEN")
        nearest = duplicate
        passed = not reasons
        historical = pilot_metrics.get(candidate_id, {})
        row = {
            "candidate_id": candidate_id,
            "epoch": item["epoch"],
            "prompt_id": item["prompt_id"],
            "prompt_family": item.get("prompt_family", ""),
            "seed": item["seed"],
            "absolute_path": item["absolute_path"],
            "source_sha256": item["sha256"],
            "source_bytes": Path(item["absolute_path"]).stat().st_size,
            "source_class": "EXISTING_PILOT_V2" if legacy else "NEW_CANONICAL_V3",
            "gate_basis": "PRESERVED_SCREENING_GATE_V2" if legacy else "MODEL_AWARE_SCREENING_V3",
            "preserved_v2_status": historical.get("v2_final_status", ""),
            "preserved_v2_reasons": historical.get("nonclipping_automatic_reasons", ""),
            "technical_automatic_pass": str(passed).upper(),
            "screening_status": "MACHINE_ELIGIBLE" if passed else "MACHINE_REJECTED",
            "automatic_failure_reasons": ";".join(reasons),
            "technical_warnings": ";".join(sorted(set(warnings))),
            "analysis_status": SIGNAL_STATUS,
            "measurement_status": metric.get("analysis_status", ""),
            **{
                field: metric.get(field, "")
                for field in TECHNICAL_FIELDS
                if field in metric and field not in {"analysis_status", "measurement_status", "rights_status"}
            },
            "nearest_candidate_id": nearest["candidate_id"],
            "nearest_fingerprint_cosine": "" if nearest["spectral"] < -0.5 else nearest["spectral"],
            "nearest_envelope_correlation": "" if nearest["envelope"] < -0.5 else nearest["envelope"],
            "duplicate_cluster_keeper": nearest["keeper"],
            "duplicate_class": nearest["class"],
            "endpoint_policy": metric.get(
                "endpoint_policy",
                "ENDPOINT_EQUALITY_DIAGNOSTIC_ONLY; NO AUTOMATIC ENDPOINT FAILURE",
            ),
            "analysis_version": ANALYSIS_VERSION,
            "rights_status": RIGHTS_STATUS,
        }
        rows.append(row)
        details.append(json.dumps({
            "candidate_id": candidate_id,
            "source_sha256": item["sha256"],
            "fresh_v3_metrics": metric,
            "preserved_v2_metric": historical if legacy else None,
            "final_technical_gate_reasons": reasons,
            "analysis_status": SIGNAL_STATUS,
            "rights_status": RIGHTS_STATUS,
        }, sort_keys=True, ensure_ascii=False, allow_nan=False))

    rows.sort(key=lambda row: (row["epoch"], row["prompt_id"], int(row["seed"]), row["candidate_id"]))
    atomic_write_text(paths["technical"], csv_text(rows, TECHNICAL_FIELDS))
    atomic_write_text(paths["details"], "\n".join(details) + "\n")
    duplicate_fields = [
        "candidate_a", "candidate_b", "duplicate_class", "fingerprint_cosine",
        "envelope_correlation", "threshold_policy", "analysis_status", "rights_status",
    ]
    atomic_write_text(paths["duplicates"], csv_text(duplicate_pairs, duplicate_fields))

    jury_rows = []
    for row in rows:
        if row["technical_automatic_pass"] != "TRUE":
            continue
        source = inventory_map[row["candidate_id"]]
        jury_rows.append({
            **source,
            "screening_status": "MACHINE_ELIGIBLE",
            "screening_gate": "V2_PRESERVED" if row["source_class"] == "EXISTING_PILOT_V2" else "V3_TECHNICAL",
            "technical_automatic_pass": "TRUE",
            "technical_failure_reasons": "",
            "analysis_status": SIGNAL_STATUS,
            "rights_status": RIGHTS_STATUS,
        })
    jury_fields = list(dict.fromkeys(
        list(inventory[0].keys())
        + ["screening_status", "screening_gate", "technical_automatic_pass", "technical_failure_reasons", "analysis_status", "rights_status"]
    ))
    atomic_write_text(paths["jury_ready"], csv_text(jury_rows, jury_fields))

    output_hashes = {
        name: {"path": str(paths[name]), "bytes": paths[name].stat().st_size, "sha256": sha256_file(paths[name])}
        for name in ("technical", "details", "duplicates", "jury_ready")
    }
    summary = {
        "generated_utc": utc_now(),
        "analysis_version": ANALYSIS_VERSION,
        "classification": SIGNAL_STATUS,
        "status": "TECHNICAL_SCREENING_COMPLETE",
        "endpoint_policy": (
            "The pinned MLX writer clips float output to [-1,1] before PCM16 serialization. "
            "Endpoint equality alone never fails V3; only sustained near-rail flattening at or above "
            f"{SUSTAINED_FLAT_TOP_LIMIT_MS:.1f} ms fails."
        ),
        "inventory": {"path": str(args.inventory), "sha256": sha256_file(args.inventory), "count": len(inventory)},
        "pilot_v2": {
            "metrics": {"path": str(args.pilot_v2_metrics), "sha256": sha256_file(args.pilot_v2_metrics)},
            "disposition": {"path": str(args.pilot_v2_disposition), "sha256": sha256_file(args.pilot_v2_disposition)},
            "preserved_exclusions": EXPECTED_PILOT_EXCLUSIONS,
        },
        "counts": {
            "canonical": len(rows),
            "technical_eligible": sum(row["technical_automatic_pass"] == "TRUE" for row in rows),
            "technical_rejected": sum(row["technical_automatic_pass"] != "TRUE" for row in rows),
            "jury_ready": len(jury_rows),
            "exact_or_near_duplicate_pairs": len(duplicate_pairs),
        },
        "thresholds": {
            "silence_dbfs": -50.0,
            "leading_silence_seconds": LEADING_SILENCE_LIMIT_SECONDS,
            "trailing_silence_seconds": TRAILING_SILENCE_LIMIT_SECONDS,
            "internal_silence_seconds": INTERNAL_SILENCE_LIMIT_SECONDS,
            "dc_offset_absolute": DC_OFFSET_LIMIT,
            "stereo_negative_correlation": NEGATIVE_CORRELATION_LIMIT,
            "stereo_consecutive_windows": NEGATIVE_CORRELATION_WINDOWS,
            "mono_fold_loss_db": MONO_FOLD_LOSS_LIMIT_DB,
            "sustained_flat_top_ms": SUSTAINED_FLAT_TOP_LIMIT_MS,
            "near_duplicate_fingerprint_cosine": NEAR_DUPLICATE_FINGERPRINT_COSINE,
            "near_duplicate_envelope_correlation": NEAR_DUPLICATE_ENVELOPE_CORRELATION,
        },
        "limitations": [
            "Technical gates and duplicate fingerprints are analysis signals, not human listening.",
            "A raw seam warning does not predict the audibility of a later purpose-built crossfade loop.",
            "No automated measurement establishes copyright safety, non-infringement, cultural acceptance, or commercial clearance.",
            "The original 24 retain their V2 status; fresh V3 measurements are diagnostic and do not rewrite screening history.",
        ],
        "outputs": output_hashes,
        "rights_status": RIGHTS_STATUS,
    }
    atomic_write_json(paths["technical_summary"], summary)
    print(json.dumps(summary, indent=2))
    return summary


def load_jury(paths: list[Path]) -> tuple[dict[str, dict[str, str]], list[dict[str, str]]]:
    mapping: dict[str, dict[str, str]] = {}
    provenance = []
    for path in paths:
        if not path.is_file():
            raise FileNotFoundError(path)
        rows = read_csv(path)
        provenance.append({"path": str(path), "sha256": sha256_file(path), "count": len(rows)})
        for row in rows:
            candidate_id = row.get("candidate_id", "")
            if not candidate_id:
                raise ValueError(f"jury row without candidate_id: {path}")
            if candidate_id in mapping and mapping[candidate_id] != row:
                raise ValueError(f"conflicting duplicate jury row: {candidate_id}")
            mapping[candidate_id] = row
    return mapping, provenance


def finalize(args: argparse.Namespace) -> dict[str, Any]:
    paths = output_paths(args.output_dir)
    if not paths["technical"].is_file() or not paths["technical_summary"].is_file():
        raise FileNotFoundError("technical mode must complete before finalize mode")
    technical_rows = read_csv(paths["technical"])
    summary = json.loads(paths["technical_summary"].read_text(encoding="utf-8"))
    if summary.get("analysis_version") != ANALYSIS_VERSION:
        raise RuntimeError("technical evidence was produced by a different screening version")
    if summary["inventory"]["sha256"] != sha256_file(args.inventory):
        raise RuntimeError("inventory changed after technical screening")
    if summary["outputs"]["technical"]["sha256"] != sha256_file(paths["technical"]):
        raise RuntimeError("technical CSV changed after its summary was written")
    jury, jury_provenance = load_jury(args.jury)

    final_rows: list[dict[str, Any]] = []
    family_members: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in technical_rows:
        candidate_id = row["candidate_id"]
        technical_pass = parse_bool(row["technical_automatic_pass"])
        jury_row = jury.get(candidate_id)
        source_hash = jury_row.get("source_sha256", "") if jury_row else ""
        if source_hash and source_hash != row["source_sha256"]:
            raise RuntimeError(f"jury/source hash mismatch: {candidate_id}")
        if not technical_pass:
            final_status = "MACHINE_REJECTED"
            jury_state = "NOT_REQUIRED_TECHNICAL_REJECTION"
            severe = ""
            final_reasons = row["automatic_failure_reasons"]
        elif jury_row is None:
            final_status = "PENDING_MACHINE_JURY"
            jury_state = "NOT_PROVIDED"
            severe = ""
            final_reasons = "MACHINE_JURY_PENDING"
        else:
            severe_bool = parse_bool(jury_row.get("severe_machine_mismatch", ""))
            severe = str(severe_bool).upper()
            jury_state = "COMPLETE"
            if severe_bool:
                final_status = "MACHINE_REJECTED"
                final_reasons = jury_row.get("mismatch_reasons", "SEVERE_MACHINE_JURY_MISMATCH")
            else:
                final_status = "MACHINE_ELIGIBLE"
                final_reasons = ""
        result = {
            **row,
            "jury_state": jury_state,
            "severe_machine_mismatch": severe,
            "jury_machine_label": jury_row.get("machine_label", "") if jury_row else "",
            "jury_machine_score": jury_row.get("machine_score", "") if jury_row else "",
            "jury_mismatch_reasons": jury_row.get("mismatch_reasons", "") if jury_row else "",
            "final_machine_status": final_status,
            "final_machine_reasons": final_reasons,
            "final_status_law": "AUTOMATIC_TECHNICAL_PASS_AND_NO_SEVERE_MACHINE_JURY_MISMATCH",
            "analysis_status": SIGNAL_STATUS,
            "rights_status": RIGHTS_STATUS,
        }
        final_rows.append(result)
        family_members[row["prompt_id"]].append(result)

    family_rows: list[dict[str, Any]] = []
    rescue_rows: list[dict[str, Any]] = []
    for prompt_id, members in sorted(family_members.items()):
        if len(members) != 4:
            raise RuntimeError(f"canonical family {prompt_id} has {len(members)} candidates instead of four")
        eligible = [row for row in members if row["final_machine_status"] == "MACHINE_ELIGIBLE"]
        pending = [row for row in members if row["final_machine_status"] == "PENDING_MACHINE_JURY"]
        rejected = [row for row in members if row["final_machine_status"] == "MACHINE_REJECTED"]
        if len(eligible) >= 2:
            family_status = "CANONICAL_FAMILY_PASS"
        elif len(eligible) + len(pending) >= 2:
            family_status = "FAMILY_PENDING_MACHINE_JURY"
        else:
            family_status = "RESCUE_REQUIRED_BY_BOUNDED_LAW"
        reason_counts = Counter()
        for row in rejected:
            reason_counts.update(split_reasons(row["final_machine_reasons"]))
        family_row = {
            "epoch": members[0]["epoch"],
            "prompt_id": prompt_id,
            "prompt_family": members[0]["prompt_family"],
            "canonical_candidate_count": len(members),
            "technical_pass_count": sum(parse_bool(row["technical_automatic_pass"]) for row in members),
            "eligible_no_severe_jury_mismatch_count": len(eligible),
            "machine_jury_pending_count": len(pending),
            "rejected_count": len(rejected),
            "family_status": family_status,
            "failure_pattern": ";".join(f"{reason}:{count}" for reason, count in sorted(reason_counts.items())),
            "pass_law": "AT_LEAST_2_AUTOMATIC_PASSES_WITH_NO_SEVERE_MACHINE_JURY_MISMATCH",
            "analysis_status": SIGNAL_STATUS,
            "rights_status": RIGHTS_STATUS,
        }
        family_rows.append(family_row)
        if family_status == "RESCUE_REQUIRED_BY_BOUNDED_LAW":
            rescue_rows.append({
                **family_row,
                "original_prompt_must_be_preserved": "TRUE",
                "maximum_documented_prompt_revisions": 1,
                "fixed_rescue_seeds": ";".join(str(seed) for seed in RESCUE_SEEDS),
                "maximum_rescue_candidates": 4,
                "additional_rescue_rounds": 0,
            })

    final_fields = list(TECHNICAL_FIELDS) + [
        "jury_state", "severe_machine_mismatch", "jury_machine_label", "jury_machine_score",
        "jury_mismatch_reasons", "final_machine_status", "final_machine_reasons",
        "final_status_law",
    ]
    final_rows.sort(key=lambda row: (row["epoch"], row["prompt_id"], int(row["seed"]), row["candidate_id"]))
    atomic_write_text(paths["final"], csv_text(final_rows, list(dict.fromkeys(final_fields))))
    family_fields = list(family_rows[0]) if family_rows else []
    atomic_write_text(paths["families"], csv_text(family_rows, family_fields))
    rescue_fields = (
        list(rescue_rows[0])
        if rescue_rows
        else family_fields + [
            "original_prompt_must_be_preserved", "maximum_documented_prompt_revisions",
            "fixed_rescue_seeds", "maximum_rescue_candidates", "additional_rescue_rounds",
        ]
    )
    atomic_write_text(paths["rescue"], csv_text(rescue_rows, rescue_fields))
    output_hashes = {
        name: {"path": str(paths[name]), "bytes": paths[name].stat().st_size, "sha256": sha256_file(paths[name])}
        for name in ("final", "families", "rescue")
    }
    result = {
        "generated_utc": utc_now(),
        "analysis_version": ANALYSIS_VERSION,
        "classification": SIGNAL_STATUS,
        "status": "FINALIZED" if not any(row["final_machine_status"] == "PENDING_MACHINE_JURY" for row in final_rows) else "PARTIAL_PENDING_MACHINE_JURY",
        "counts": {
            "candidates": len(final_rows),
            "machine_eligible": sum(row["final_machine_status"] == "MACHINE_ELIGIBLE" for row in final_rows),
            "machine_rejected": sum(row["final_machine_status"] == "MACHINE_REJECTED" for row in final_rows),
            "pending_machine_jury": sum(row["final_machine_status"] == "PENDING_MACHINE_JURY" for row in final_rows),
            "families": len(family_rows),
            "families_passed": sum(row["family_status"] == "CANONICAL_FAMILY_PASS" for row in family_rows),
            "families_pending_jury": sum(row["family_status"] == "FAMILY_PENDING_MACHINE_JURY" for row in family_rows),
            "families_requiring_rescue": len(rescue_rows),
        },
        "family_pass_law": "AT_LEAST_2_AUTOMATIC_PASSES_WITH_NO_SEVERE_MACHINE_JURY_MISMATCH",
        "rescue_law": {
            "maximum_prompt_revisions_per_family": 1,
            "fixed_seeds": RESCUE_SEEDS,
            "maximum_candidates_per_family": 4,
            "additional_rounds": 0,
        },
        "technical_summary": {"path": str(paths["technical_summary"]), "sha256": sha256_file(paths["technical_summary"])},
        "machine_jury_inputs": jury_provenance,
        "outputs": output_hashes,
        "limitations": [
            "No result is Owner approval or human listening acceptance.",
            "Machine semantic mismatches are analysis signals, not historical or cultural truth.",
            "No automated detector proves copyright safety, exclusivity, non-infringement, or commercial clearance.",
        ],
        "rights_status": RIGHTS_STATUS,
    }
    atomic_write_json(paths["final_summary"], result)
    print(json.dumps(result, indent=2))
    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=("technical", "finalize", "all"), default="technical")
    parser.add_argument("--inventory", type=Path, default=DEFAULT_INVENTORY)
    parser.add_argument("--pilot-v2-metrics", type=Path, default=DEFAULT_PILOT_V2_METRICS)
    parser.add_argument("--pilot-v2-disposition", type=Path, default=DEFAULT_PILOT_V2_DISPOSITION)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--cache-dir", type=Path, default=DEFAULT_CACHE_DIR)
    parser.add_argument("--jury", type=Path, action="append", default=[])
    parser.add_argument("--expected-count", type=int, default=144)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    require_inference_idle()
    if args.mode in {"technical", "all"}:
        technical(args)
    if args.mode in {"finalize", "all"}:
        finalize(args)


if __name__ == "__main__":
    main()
