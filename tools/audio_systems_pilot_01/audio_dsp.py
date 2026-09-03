#!/usr/bin/env python3
"""Deterministic DSP helpers for the isolated Audio Systems Pilot.

The functions in this module only create new files.  Existing destinations are
accepted solely when an explicit expected hash matches; otherwise the operation
fails closed.  Audio analysis is structural evidence, never a listening verdict.
"""

from __future__ import annotations

import json
import math
import os
import re
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Iterable, Sequence

import numpy as np
import soundfile as sf

from common import atomic_write_json, probe_audio, sha256_file


FFMPEG = Path("/opt/homebrew/bin/ffmpeg")
FFPROBE = Path("/opt/homebrew/bin/ffprobe")


def file_record(path: Path) -> dict[str, Any]:
    return {
        "path": str(path),
        "bytes": path.stat().st_size,
        "sha256": sha256_file(path),
    }


def require_file(path: Path, expected_sha256: str | None = None) -> Path:
    if not path.is_file():
        raise RuntimeError(f"required file is missing: {path}")
    if expected_sha256 is not None:
        actual = sha256_file(path)
        if actual != expected_sha256:
            raise RuntimeError(
                f"required file hash mismatch: {path}; expected {expected_sha256}, got {actual}"
            )
    return path


def reusable_output(path: Path, expected_sha256: str | None) -> bool:
    """Return True only for a present output matching an explicit expected hash."""

    if not path.exists():
        return False
    if not path.is_file():
        raise RuntimeError(f"destination exists and is not a regular file: {path}")
    if not expected_sha256:
        raise RuntimeError(f"destination exists without an expected hash; refusing overwrite: {path}")
    actual = sha256_file(path)
    if actual != expected_sha256:
        raise RuntimeError(
            f"destination differs; refusing overwrite: {path}; expected {expected_sha256}, got {actual}"
        )
    return True


def _new_temp_for(destination: Path) -> Path:
    destination.parent.mkdir(parents=True, exist_ok=True)
    descriptor, name = tempfile.mkstemp(
        prefix=f".{destination.stem}.", suffix=destination.suffix, dir=destination.parent
    )
    os.close(descriptor)
    temp = Path(name)
    temp.unlink()
    return temp


def publish_temp(temp: Path, destination: Path, *, readonly: bool = True) -> dict[str, Any]:
    if destination.exists():
        raise RuntimeError(f"destination appeared during build; refusing overwrite: {destination}")
    if readonly:
        os.chmod(temp, 0o444)
    os.replace(temp, destination)
    return file_record(destination)


def run_checked(
    argv: Sequence[str | os.PathLike[str]],
    *,
    cwd: Path | None = None,
    env: dict[str, str] | None = None,
    capture: bool = True,
) -> subprocess.CompletedProcess[str]:
    completed = subprocess.run(
        [str(item) for item in argv],
        cwd=cwd,
        env=env,
        check=False,
        capture_output=capture,
        text=True,
    )
    if completed.returncode != 0:
        detail = (completed.stderr or completed.stdout or "").strip()
        raise RuntimeError(f"command failed ({completed.returncode}): {' '.join(map(str, argv))}\n{detail}")
    return completed


def ffmpeg_atomic(
    input_args: Sequence[str | os.PathLike[str]],
    destination: Path,
    *,
    expected_existing_sha256: str | None = None,
) -> dict[str, Any]:
    if reusable_output(destination, expected_existing_sha256):
        return {**file_record(destination), "reused": True, "probe": probe_audio(destination)}
    temp = _new_temp_for(destination)
    try:
        argv = [
            FFMPEG,
            "-hide_banner",
            "-nostdin",
            "-v",
            "error",
            "-y",
            *input_args,
            temp,
        ]
        run_checked(argv)
        record = publish_temp(temp, destination)
        return {**record, "reused": False, "probe": probe_audio(destination)}
    finally:
        temp.unlink(missing_ok=True)


def _parse_loudnorm(stderr: str) -> dict[str, float]:
    matches = re.findall(r"\{[\s\S]*?\}", stderr)
    if not matches:
        raise RuntimeError("ffmpeg loudnorm analysis did not emit JSON")
    raw = json.loads(matches[-1])
    mapping = {
        "input_i": "measured_I",
        "input_tp": "measured_TP",
        "input_lra": "measured_LRA",
        "input_thresh": "measured_thresh",
        "target_offset": "offset",
    }
    return {target: float(raw[source]) for source, target in mapping.items()}


def normalize_music(
    source: Path,
    destination: Path,
    *,
    integrated_lufs: float = -18.0,
    true_peak_dbtp: float = -1.5,
    expected_existing_sha256: str | None = None,
) -> dict[str, Any]:
    require_file(source)
    if reusable_output(destination, expected_existing_sha256):
        return {
            **file_record(destination),
            "reused": True,
            "probe": probe_audio(destination),
            "target_integrated_lufs": integrated_lufs,
            "target_true_peak_dbtp": true_peak_dbtp,
        }
    first = run_checked(
        [
            FFMPEG,
            "-hide_banner",
            "-nostdin",
            "-v",
            "info",
            "-i",
            source,
            "-af",
            f"loudnorm=I={integrated_lufs}:TP={true_peak_dbtp}:LRA=12:print_format=json",
            "-f",
            "null",
            "-",
        ]
    )
    measured = _parse_loudnorm(first.stderr)
    filt = (
        f"loudnorm=I={integrated_lufs}:TP={true_peak_dbtp}:LRA=12:"
        f"measured_I={measured['measured_I']}:measured_TP={measured['measured_TP']}:"
        f"measured_LRA={measured['measured_LRA']}:"
        f"measured_thresh={measured['measured_thresh']}:offset={measured['offset']}:"
        "linear=true:print_format=summary"
    )
    record = ffmpeg_atomic(
        [
            "-i",
            source,
            "-map_metadata",
            "-1",
            "-fflags",
            "+bitexact",
            "-flags:a",
            "+bitexact",
            "-af",
            filt,
            "-ar",
            "48000",
            "-ac",
            "2",
            "-c:a",
            "pcm_s24le",
            "-f",
            "wav",
        ],
        destination,
    )
    return {
        **record,
        "target_integrated_lufs": integrated_lufs,
        "target_true_peak_dbtp": true_peak_dbtp,
        "first_pass": measured,
    }


def derive_music_assets(
    normalized: Path,
    output_dir: Path,
    *,
    source_duration_seconds: float = 60.0,
    prior: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Create a lab loop, simple entry/exit, and AAC preview from one full mix.

    These are editing derivatives, not aligned stems and not proof of phrase
    alignment.  Entry and exit require transport crossfades.
    """

    prior = prior or {}
    output_dir.mkdir(parents=True, exist_ok=True)
    crossfade = 6.0
    loop_end = source_duration_seconds - crossfade
    if loop_end <= crossfade:
        raise RuntimeError("source is too short for the requested loop construction")

    loop_path = output_dir / f"loop-{int(loop_end)}s-qsin.wav"
    loop_filter = (
        f"[0:a]atrim=start=0:end={crossfade},asetpts=PTS-STARTPTS[head];"
        f"[0:a]atrim=start={crossfade}:end={loop_end},asetpts=PTS-STARTPTS[body];"
        f"[0:a]atrim=start={loop_end}:end={source_duration_seconds},asetpts=PTS-STARTPTS[tail];"
        f"[tail][head]acrossfade=d={crossfade}:c1=qsin:c2=qsin[wrap];"
        "[body][wrap]concat=n=2:v=0:a=1[out]"
    )
    loop = ffmpeg_atomic(
        [
            "-i",
            normalized,
            "-filter_complex",
            loop_filter,
            "-map",
            "[out]",
            "-map_metadata",
            "-1",
            "-fflags",
            "+bitexact",
            "-flags:a",
            "+bitexact",
            "-ar",
            "48000",
            "-ac",
            "2",
            "-c:a",
            "pcm_s24le",
            "-t",
            str(loop_end),
            "-f",
            "wav",
        ],
        loop_path,
        expected_existing_sha256=(prior.get("loop") or {}).get("sha256"),
    )

    entry_path = output_dir / "entry-8s-derived.wav"
    entry = ffmpeg_atomic(
        [
            "-i",
            normalized,
            "-af",
            "atrim=start=0:end=8,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.35",
            "-ar",
            "48000",
            "-ac",
            "2",
            "-c:a",
            "pcm_s24le",
            "-f",
            "wav",
        ],
        entry_path,
        expected_existing_sha256=(prior.get("entry") or {}).get("sha256"),
    )

    exit_path = output_dir / "exit-8s-derived.wav"
    start = source_duration_seconds - 8.0
    exit_record = ffmpeg_atomic(
        [
            "-ss",
            str(start),
            "-i",
            normalized,
            "-af",
            "atrim=start=0:end=8,asetpts=PTS-STARTPTS,afade=t=out:st=5.5:d=2.5",
            "-ar",
            "48000",
            "-ac",
            "2",
            "-c:a",
            "pcm_s24le",
            "-f",
            "wav",
        ],
        exit_path,
        expected_existing_sha256=(prior.get("exit") or {}).get("sha256"),
    )

    preview_path = output_dir / "preview-192k-aac.m4a"
    preview = ffmpeg_atomic(
        [
            "-i",
            loop_path,
            "-map_metadata",
            "-1",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-movflags",
            "+faststart",
        ],
        preview_path,
        expected_existing_sha256=(prior.get("preview") or {}).get("sha256"),
    )
    return {
        "normalized": {**file_record(normalized), "probe": probe_audio(normalized)},
        "loop": loop,
        "entry": entry,
        "exit": exit_record,
        "preview": preview,
        "loop_metadata": {
            "classification": "DERIVED_FULL_MIX_LOOP_NOT_AN_AUTHORED_STEM",
            "source_duration_seconds": source_duration_seconds,
            "loop_duration_seconds": loop_end,
            "crossfade_seconds": crossfade,
            "crossfade_curve": "qsin",
            "phrase_alignment_confidence": "LOW_UNVERIFIED_ESTIMATED_BPM_ONLY",
        },
        "entry_exit_metadata": {
            "classification": "DERIVED_AUDITION_TREATMENTS",
            "phase_continuity": "NOT_CLAIMED",
            "transport_requirement": "USE_SAFE_CROSSFADE",
        },
    }


def _fft_bpm(envelope: np.ndarray, frames_per_second: float) -> tuple[float | None, float]:
    if envelope.size < 64 or float(np.std(envelope)) < 1e-7:
        return None, 0.0
    values = envelope.astype(np.float64) - float(np.mean(envelope))
    size = 1 << (2 * values.size - 1).bit_length()
    spectrum = np.fft.rfft(values, size)
    correlation = np.fft.irfft(spectrum * np.conjugate(spectrum), size)[: values.size]
    minimum_lag = max(1, int(frames_per_second * 60.0 / 180.0))
    maximum_lag = min(values.size - 1, int(frames_per_second * 60.0 / 50.0))
    if maximum_lag <= minimum_lag:
        return None, 0.0
    region = correlation[minimum_lag : maximum_lag + 1]
    index = int(np.argmax(region)) + minimum_lag
    bpm = 60.0 * frames_per_second / index
    confidence = float(max(0.0, correlation[index]) / max(correlation[0], 1e-12))
    while bpm < 70.0:
        bpm *= 2.0
    while bpm > 150.0:
        bpm /= 2.0
    return round(bpm, 3), round(min(confidence, 1.0), 6)


def technical_screen(
    path: Path,
    *,
    expected_duration_seconds: float | None = None,
    expected_channels: int | None = 2,
    silence_threshold_dbfs: float = -55.0,
    music: bool = True,
) -> dict[str, Any]:
    """Measure deterministic format/signal properties without judging quality."""

    require_file(path)
    threshold = 10.0 ** (silence_threshold_dbfs / 20.0)
    sum_values = 0.0
    sum_squares = 0.0
    sample_count = 0
    peak = 0.0
    clipped = 0
    first_active: int | None = None
    last_active: int | None = None
    frame_cursor = 0
    sum_l = sum_r = sum_ll = sum_rr = sum_lr = 0.0
    envelopes: list[float] = []
    hop = 1024

    with sf.SoundFile(path) as handle:
        sample_rate = int(handle.samplerate)
        channels = int(handle.channels)
        frames = int(handle.frames)
        subtype = handle.subtype
        carry = np.empty((0, channels), dtype=np.float32)
        for block in handle.blocks(blocksize=65536, dtype="float32", always_2d=True):
            absolute = np.abs(block)
            peak = max(peak, float(np.max(absolute, initial=0.0)))
            clipped += int(np.count_nonzero(absolute >= 0.999969))
            sum_values += float(np.sum(block, dtype=np.float64))
            sum_squares += float(np.sum(np.square(block, dtype=np.float64), dtype=np.float64))
            sample_count += int(block.size)
            active_frames = np.flatnonzero(np.max(absolute, axis=1) > threshold)
            if active_frames.size:
                if first_active is None:
                    first_active = frame_cursor + int(active_frames[0])
                last_active = frame_cursor + int(active_frames[-1])
            if channels >= 2:
                left = block[:, 0].astype(np.float64)
                right = block[:, 1].astype(np.float64)
                sum_l += float(np.sum(left))
                sum_r += float(np.sum(right))
                sum_ll += float(np.dot(left, left))
                sum_rr += float(np.dot(right, right))
                sum_lr += float(np.dot(left, right))
            energy_input = np.concatenate((carry, block), axis=0)
            complete = (energy_input.shape[0] // hop) * hop
            if complete:
                windows = energy_input[:complete].reshape(-1, hop, channels)
                rms = np.sqrt(np.mean(np.square(windows, dtype=np.float64), axis=(1, 2)))
                envelopes.extend(float(item) for item in rms)
            carry = energy_input[complete:]
            frame_cursor += block.shape[0]

    duration = frames / sample_rate
    rms = math.sqrt(sum_squares / max(1, sample_count))
    mean = sum_values / max(1, sample_count)
    rms_dbfs = 20.0 * math.log10(max(rms, 1e-12))
    peak_dbfs = 20.0 * math.log10(max(peak, 1e-12))
    leading = duration if first_active is None else first_active / sample_rate
    trailing = duration if last_active is None else (frames - last_active - 1) / sample_rate
    correlation: float | None = None
    if channels >= 2:
        count = frames
        covariance = sum_lr - (sum_l * sum_r / max(1, count))
        variance_l = sum_ll - (sum_l * sum_l / max(1, count))
        variance_r = sum_rr - (sum_r * sum_r / max(1, count))
        denominator = math.sqrt(max(variance_l * variance_r, 0.0))
        correlation = covariance / denominator if denominator > 1e-15 else 1.0

    envelope = np.asarray(envelopes, dtype=np.float64)
    bpm, bpm_confidence = _fft_bpm(envelope, sample_rate / hop)
    positive = np.diff(envelope, prepend=envelope[:1]) if envelope.size else np.array([])
    onset_threshold = max(float(np.median(np.abs(positive))) * 4.0, 1e-5) if positive.size else 1.0
    onset_density = float(np.count_nonzero(positive > onset_threshold) / max(duration, 1e-9))

    failures: list[str] = []
    if expected_duration_seconds is not None and abs(duration - expected_duration_seconds) > 0.025:
        failures.append("DURATION_MISMATCH")
    if expected_channels is not None and channels != expected_channels:
        failures.append("CHANNEL_MISMATCH")
    if sample_count == 0 or not math.isfinite(rms) or not math.isfinite(peak):
        failures.append("INVALID_OR_EMPTY_SIGNAL")
    if peak <= threshold:
        failures.append("EFFECTIVE_SILENCE")
    if abs(mean) > 0.05:
        failures.append("EXCESSIVE_DC_OFFSET")
    if sample_count and clipped / sample_count > 0.002:
        failures.append("EXCESSIVE_CLIPPED_SAMPLE_FRACTION")
    if music:
        if leading > 2.0:
            failures.append("LEADING_SILENCE")
        if trailing > 2.0:
            failures.append("TRAILING_SILENCE")
        if correlation is not None and correlation < -0.15:
            failures.append("STEREO_NEGATIVE_CORRELATION")
        if rms_dbfs < -42.0:
            failures.append("MUSIC_LEVEL_TOO_LOW")

    clipped_fraction = clipped / max(1, sample_count)
    utility = 1.0
    utility -= min(0.35, clipped_fraction * 80.0)
    utility -= min(0.15, abs(mean) * 2.0)
    utility -= min(0.2, max(0.0, leading - 0.25) / 10.0)
    utility -= min(0.2, max(0.0, trailing - 0.25) / 10.0)
    if correlation is not None:
        utility -= min(0.2, max(0.0, -correlation) * 0.5)
    if failures:
        utility -= 1.0

    return {
        "analysis_classification": "STRUCTURAL_AND_SIGNAL_ANALYSIS_ONLY",
        "path": str(path),
        "sha256": sha256_file(path),
        "bytes": path.stat().st_size,
        "format": {
            "sample_rate_hz": sample_rate,
            "channels": channels,
            "frames": frames,
            "duration_seconds": round(duration, 6),
            "subtype": subtype,
        },
        "signal": {
            "peak_linear": round(peak, 8),
            "peak_dbfs": round(peak_dbfs, 4),
            "rms_dbfs": round(rms_dbfs, 4),
            "mean": round(mean, 9),
            "clipped_sample_fraction": round(clipped_fraction, 9),
            "leading_silence_seconds": round(leading, 6),
            "trailing_silence_seconds": round(trailing, 6),
            "stereo_correlation": None if correlation is None else round(correlation, 7),
            "onset_density_per_second": round(onset_density, 6),
        },
        "estimated_bpm": bpm,
        "bpm_confidence_signal": bpm_confidence,
        "automatic_pass": not failures,
        "failure_reasons": failures,
        "selection_utility": round(utility, 8),
        "limitations": [
            "No machine measurement establishes listening quality, era fit, originality, or comfort.",
            "Estimated BPM does not establish a downbeat, bar grid, or phrase boundary.",
        ],
    }


def write_audio_atomic(
    destination: Path,
    audio: np.ndarray,
    sample_rate: int,
    *,
    subtype: str = "PCM_24",
    expected_existing_sha256: str | None = None,
) -> dict[str, Any]:
    if reusable_output(destination, expected_existing_sha256):
        return {**file_record(destination), "reused": True, "probe": probe_audio(destination)}
    temp = _new_temp_for(destination)
    try:
        sf.write(temp, audio, sample_rate, subtype=subtype, format="WAV")
        record = publish_temp(temp, destination)
        return {**record, "reused": False, "probe": probe_audio(destination)}
    finally:
        temp.unlink(missing_ok=True)


def write_stream_atomic(
    destination: Path,
    chunks: Iterable[np.ndarray],
    sample_rate: int,
    channels: int,
    *,
    subtype: str = "PCM_24",
    expected_existing_sha256: str | None = None,
) -> dict[str, Any]:
    if reusable_output(destination, expected_existing_sha256):
        return {**file_record(destination), "reused": True, "probe": probe_audio(destination)}
    temp = _new_temp_for(destination)
    try:
        with sf.SoundFile(
            temp,
            mode="w",
            samplerate=sample_rate,
            channels=channels,
            subtype=subtype,
            format="WAV",
        ) as handle:
            for chunk in chunks:
                block = np.asarray(chunk, dtype=np.float32)
                if block.ndim == 1:
                    block = block[:, None]
                if block.shape[1] != channels:
                    raise RuntimeError(
                        f"stream chunk channel mismatch: wanted {channels}, got {block.shape[1]}"
                    )
                if not np.all(np.isfinite(block)):
                    raise RuntimeError("stream chunk contains non-finite samples")
                handle.write(np.clip(block, -0.999, 0.999))
        record = publish_temp(temp, destination)
        return {**record, "reused": False, "probe": probe_audio(destination)}
    finally:
        temp.unlink(missing_ok=True)


def raised_cosine_envelope(length: int, attack: int, release: int) -> np.ndarray:
    envelope = np.ones(length, dtype=np.float64)
    attack = min(max(0, attack), length)
    release = min(max(0, release), length)
    if attack:
        x = np.linspace(0.0, math.pi, attack, endpoint=False)
        envelope[:attack] = 0.5 - 0.5 * np.cos(x)
    if release:
        x = np.linspace(0.0, math.pi, release, endpoint=False)
        envelope[-release:] = 0.5 + 0.5 * np.cos(x)
    return envelope


def render_semantic_tone(
    *,
    duration_seconds: float,
    sample_rate: int,
    frequencies_hz: Sequence[float],
    amplitudes: Sequence[float],
    attack_seconds: float,
    release_seconds: float,
    noise_amplitude: float = 0.0,
    seed: int = 0,
    descending: bool = False,
) -> np.ndarray:
    frames = int(round(duration_seconds * sample_rate))
    t = np.arange(frames, dtype=np.float64) / sample_rate
    envelope = raised_cosine_envelope(
        frames,
        int(round(attack_seconds * sample_rate)),
        int(round(release_seconds * sample_rate)),
    )
    signal = np.zeros(frames, dtype=np.float64)
    count = max(1, len(frequencies_hz))
    segment = frames / count
    for index, (frequency, amplitude) in enumerate(zip(frequencies_hz, amplitudes, strict=True)):
        center = (index + 0.5) * segment
        width = max(segment * 0.8, 1.0)
        local = np.exp(-0.5 * np.square((np.arange(frames) - center) / width))
        phase_frequency = frequency * (0.985 if descending and index else 1.0)
        signal += amplitude * local * np.sin(2.0 * math.pi * phase_frequency * t)
        signal += amplitude * 0.12 * local * np.sin(2.0 * math.pi * phase_frequency * 2.01 * t)
    if noise_amplitude:
        rng = np.random.default_rng(seed)
        signal += noise_amplitude * rng.standard_normal(frames) * np.square(envelope)
    signal *= envelope
    peak = float(np.max(np.abs(signal), initial=1e-9))
    signal *= 0.42 / max(peak, 1e-9)
    return signal.astype(np.float32)


def write_manifest(path: Path, payload: dict[str, Any]) -> None:
    if path.exists():
        if not path.is_file():
            raise RuntimeError(f"manifest destination is not a regular file: {path}")
        existing = json.loads(path.read_text(encoding="utf-8"))
        if existing != payload:
            raise RuntimeError(f"existing manifest differs; refusing overwrite: {path}")
        return
    atomic_write_json(path, payload)
