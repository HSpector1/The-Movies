#!/usr/bin/env python3
"""Select provisional era shortlists and build immutable audition derivatives.

This pipeline consumes the reconciled all-candidate Screening V3 / machine-jury
CSV plus the 36-family commissioning catalogue.  It never asserts human
approval.  Selection is deterministic, eligibility is fail-closed, and every
published derivative has a source-bound provenance sidecar.

The loop construction is deliberately explicit: source seconds 6..114 are
followed by a six-second equal-power (`qsin`) tail-to-head crossfade.  The
result is exactly 114 seconds and its end wraps continuously into its start.
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
import subprocess
import tempfile
from collections import defaultdict
from pathlib import Path
from typing import Any, Callable, Iterable

from foundry_common import (
    DISK_CAP_BYTES,
    MARATHON_ROOT,
    PILOT_ROOT,
    atomic_write_json,
    retained_bytes,
    sha256_file,
)


PIPELINE_VERSION = "audio-foundry-shortlist-derivatives-v1"
SHORTLIST_STATUS = "PROVISIONAL MACHINE SHORTLIST"
RIGHTS_STATUS = "PROTOTYPE_READY_FOR_OWNER_AUDITION"
SOURCE_RIGHTS_STATUS = "PROTOTYPE_ONLY"

FFMPEG = Path("/opt/homebrew/bin/ffmpeg")
FFPROBE = Path("/opt/homebrew/bin/ffprobe")
DEFAULT_JURY = MARATHON_ROOT / "03_analysis" / "all-candidates-v3-machine-jury.csv"
DEFAULT_CATALOGUE = MARATHON_ROOT / "01_catalogue" / "nine-epoch-small-music-prompt-catalogue.csv"
PROCESSED_ROOT = MARATHON_ROOT / "04_processed"
SHORTLIST_ROOT = MARATHON_ROOT / "05_shortlists"

EPOCHS = (
    "acoustic_electrical_1920_1932",
    "network_sound_1933_1945",
    "tape_hifi_1946_1959",
    "multitrack_fm_1960_1974",
    "format_plurality_1975_1986",
    "sampled_digital_1987_1999",
    "networked_hybrid_2000_2014",
    "streaming_plural_2015_2029",
    "legacy_future_2030_2040",
)

CONTRAST_FIELDS = (
    "likely_bpm",
    "tempo_stability_signal",
    "onset_density_per_second",
    "section_count_estimate",
    "spectral_density_signal",
    "dynamic_range_db",
    "crest_factor_db",
    "repetition_signal",
    "melodic_prominence_signal",
    "background_tendency_signal",
    "management_session_suitability_proxy",
    "period_association_proxy",
    "loop_seam_quality_signal",
)

GATE_FIELDS = (
    "source_screening_status",
    "screening_status",
    "automatic_gate_status",
    "v3_status",
    "v3_automatic_status",
    "screening_v3_status",
)

REJECT_TOKENS = ("REJECT", "FAIL", "EXCLUD", "INELIGIBLE")
PASS_TOKENS = ("ELIGIBLE", "PASS", "CLEAR")
SAFE_COMPONENT = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]*$")


class PipelineError(RuntimeError):
    """A fail-closed provenance, eligibility, or output-collision error."""


def read_csv(path: Path) -> list[dict[str, str]]:
    if not path.is_file():
        raise PipelineError(f"required CSV is absent: {path}")
    with path.open(newline="", encoding="utf-8-sig") as handle:
        rows = list(csv.DictReader(handle))
    if not rows:
        raise PipelineError(f"required CSV is empty: {path}")
    return rows


def csv_text(rows: list[dict[str, Any]], fieldnames: list[str]) -> str:
    buffer = io.StringIO(newline="")
    writer = csv.DictWriter(buffer, fieldnames=fieldnames, lineterminator="\n", extrasaction="ignore")
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def as_float(value: Any, *, field: str, candidate_id: str) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError) as exc:
        raise PipelineError(f"{candidate_id}: required numeric field {field!r} is invalid: {value!r}") from exc
    if not math.isfinite(parsed):
        raise PipelineError(f"{candidate_id}: required numeric field {field!r} is nonfinite")
    return parsed


def is_true(value: Any) -> bool:
    return str(value).strip().upper() in {"1", "TRUE", "YES", "Y"}


def safe_component(value: str, label: str) -> str:
    if not SAFE_COMPONENT.fullmatch(value):
        raise PipelineError(f"unsafe {label}: {value!r}")
    return value


def is_relative_to(path: Path, root: Path) -> bool:
    try:
        path.relative_to(root)
        return True
    except ValueError:
        return False


def validate_source_location(path: Path) -> Path:
    resolved = path.expanduser().resolve(strict=True)
    allowed = ((PILOT_ROOT / "02_raw").resolve(), (MARATHON_ROOT / "02_raw").resolve())
    if not any(is_relative_to(resolved, root) for root in allowed):
        raise PipelineError(f"candidate source is outside the two authorized raw roots: {resolved}")
    if not resolved.is_file():
        raise PipelineError(f"candidate source is not a regular file: {resolved}")
    return resolved


def screening_gate(row: dict[str, str]) -> tuple[bool, str]:
    candidate_id = row.get("candidate_id", "<unknown>")
    machine_label = row.get("machine_label", "").strip().upper()
    if machine_label == "MACHINE-REJECTED" or any(token in machine_label for token in REJECT_TOKENS):
        return False, f"machine_label={machine_label or '<blank>'}"
    if is_true(row.get("severe_machine_mismatch", "")):
        return False, "severe_machine_mismatch=TRUE"
    mismatch = row.get("mismatch_reasons", "").strip()
    if mismatch and is_true(row.get("severe_mismatch", "")):
        return False, f"severe_mismatch={mismatch}"
    duplicate_of = row.get("duplicate_of", "").strip() or row.get("near_duplicate_of", "").strip()
    if duplicate_of:
        return False, f"duplicate_of={duplicate_of}"

    statuses = [(field, row.get(field, "").strip().upper()) for field in GATE_FIELDS if row.get(field, "").strip()]
    if not statuses:
        raise PipelineError(f"{candidate_id}: no recognized Screening V3 / automatic eligibility field")
    for field, status in statuses:
        if any(token in status for token in REJECT_TOKENS):
            return False, f"{field}={status}"
    if not any(any(token in status for token in PASS_TOKENS) for _, status in statuses):
        return False, ";".join(f"{field}={status}" for field, status in statuses)
    return True, ";".join(f"{field}={status}" for field, status in statuses)


def ffmpeg_identity() -> dict[str, str]:
    identities: dict[str, str] = {}
    for name, path in (("ffmpeg", FFMPEG), ("ffprobe", FFPROBE)):
        if not path.is_file() or not os.access(path, os.X_OK):
            raise PipelineError(f"required executable is absent or non-executable: {path}")
        result = subprocess.run([str(path), "-version"], check=True, capture_output=True, text=True)
        first_line = result.stdout.splitlines()[0].strip()
        identities[f"{name}_path"] = str(path)
        identities[f"{name}_version"] = first_line
        identities[f"{name}_sha256"] = sha256_file(path)
    return identities


def low_priority() -> None:
    try:
        os.nice(5)
    except OSError:
        pass


def run(command: list[str]) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        preexec_fn=low_priority,
    )
    if result.returncode:
        stderr = result.stderr[-8000:]
        raise PipelineError(f"command failed ({result.returncode}): {command!r}\n{stderr}")
    return result


def ffprobe(path: Path) -> dict[str, Any]:
    result = run(
        [
            str(FFPROBE),
            "-v",
            "error",
            "-show_format",
            "-show_streams",
            "-of",
            "json",
            str(path),
        ]
    )
    return json.loads(result.stdout)


def audio_probe(path: Path) -> dict[str, Any]:
    data = ffprobe(path)
    streams = [stream for stream in data.get("streams", []) if stream.get("codec_type") == "audio"]
    if len(streams) != 1:
        raise PipelineError(f"expected exactly one audio stream: {path}")
    stream = streams[0]
    duration_text = stream.get("duration") or data.get("format", {}).get("duration")
    try:
        duration = float(duration_text)
    except (TypeError, ValueError) as exc:
        raise PipelineError(f"ffprobe did not report audio duration: {path}") from exc
    return {
        "codec_name": stream.get("codec_name", ""),
        "sample_rate": int(stream.get("sample_rate", 0)),
        "channels": int(stream.get("channels", 0)),
        "channel_layout": stream.get("channel_layout", ""),
        "bits_per_sample": int(stream.get("bits_per_raw_sample") or stream.get("bits_per_sample") or 0),
        "duration_seconds": round(duration, 6),
    }


def validate_raw(path: Path) -> dict[str, Any]:
    probe = audio_probe(path)
    if abs(float(probe["duration_seconds"]) - 120.0) > 0.02:
        raise PipelineError(f"raw source is not exactly 120 seconds within probe tolerance: {path}: {probe}")
    if probe["channels"] != 2 or probe["sample_rate"] <= 0:
        raise PipelineError(f"raw source must be stereo with a valid sample rate: {path}: {probe}")
    return probe


def validate_pcm(path: Path, duration: float) -> dict[str, Any]:
    probe = audio_probe(path)
    if probe["codec_name"] != "pcm_s24le" or probe["sample_rate"] != 48_000 or probe["channels"] != 2:
        raise PipelineError(f"derived master is not 48 kHz / stereo / PCM24: {path}: {probe}")
    if abs(float(probe["duration_seconds"]) - duration) > 0.02:
        raise PipelineError(f"derived master duration mismatch for {path}: {probe}")
    return probe


def validate_aac(path: Path, expected_duration: float) -> dict[str, Any]:
    probe = audio_probe(path)
    if probe["codec_name"] != "aac" or probe["sample_rate"] != 48_000 or probe["channels"] != 2:
        raise PipelineError(f"preview is not stereo 48 kHz AAC: {path}: {probe}")
    if abs(float(probe["duration_seconds"]) - expected_duration) > 0.25:
        raise PipelineError(f"AAC preview duration mismatch for {path}: {probe}")
    return probe


def validate_png(path: Path, width: int, height: int) -> dict[str, Any]:
    if path.read_bytes()[:8] != b"\x89PNG\r\n\x1a\n":
        raise PipelineError(f"image is not PNG: {path}")
    data = ffprobe(path)
    streams = [stream for stream in data.get("streams", []) if stream.get("codec_type") == "video"]
    if len(streams) != 1 or int(streams[0].get("width", 0)) != width or int(streams[0].get("height", 0)) != height:
        raise PipelineError(f"PNG dimensions mismatch: {path}: {streams}")
    return {"format": "PNG", "width": width, "height": height}


def assert_disk_headroom(estimated_bytes: int = 128 * 1024**2) -> None:
    used = retained_bytes()
    if used + estimated_bytes >= DISK_CAP_BYTES:
        raise PipelineError(
            f"retained disk cap guard: {used} + {estimated_bytes} would reach/exceed {DISK_CAP_BYTES}"
        )


def sidecar_path(output: Path) -> Path:
    return output.with_name(output.name + ".provenance.json")


def read_sidecar(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise PipelineError(f"invalid derivative provenance sidecar: {path}") from exc
    if not isinstance(value, dict):
        raise PipelineError(f"derivative provenance sidecar is not an object: {path}")
    return value


def normalized_command(command: list[str], temp_path: Path) -> list[str]:
    return ["{OUTPUT}" if value == str(temp_path) else value for value in command]


def publish_derivative(
    *,
    output: Path,
    operation: str,
    input_path: Path,
    input_sha256: str,
    raw_source_path: Path,
    raw_source_sha256: str,
    parameters: dict[str, Any],
    tools: dict[str, str],
    command_builder: Callable[[Path], list[str]],
    validator: Callable[[Path], dict[str, Any]],
    estimated_bytes: int = 128 * 1024**2,
) -> dict[str, Any]:
    """Publish one immutable artifact via a same-directory hardlink.

    A PLANNED sidecar is written before execution.  If a crash leaves a file
    beside that PLANNED record, the next run regenerates to a temporary path
    and accepts the existing file only when both hashes match.  An existing
    file with no matching sidecar is an unknown overwrite and is refused.
    """

    output.parent.mkdir(parents=True, exist_ok=True)
    provenance = sidecar_path(output)
    spec = {
        "pipeline_version": PIPELINE_VERSION,
        "operation": operation,
        "input_path": str(input_path),
        "input_sha256": input_sha256,
        "raw_source_path": str(raw_source_path),
        "raw_source_sha256": raw_source_sha256,
        "parameters": parameters,
        "ffmpeg_identity": tools,
        "shortlist_status": SHORTLIST_STATUS,
        "rights_status": RIGHTS_STATUS,
    }
    signature = sha256_text(canonical_json(spec))
    prior: dict[str, Any] | None = read_sidecar(provenance) if provenance.exists() else None
    if prior and (prior.get("signature_sha256") != signature or prior.get("spec") != spec):
        raise PipelineError(f"existing sidecar describes a different derivative; refusing overwrite: {provenance}")
    if output.exists() and prior is None:
        raise PipelineError(f"existing derivative has no provenance sidecar; refusing unknown overwrite: {output}")
    if output.exists() and prior and prior.get("state") == "COMPLETE":
        actual = sha256_file(output)
        if actual != prior.get("output_sha256"):
            raise PipelineError(f"existing derivative hash differs from its sidecar: {output}")
        probe = validator(output)
        return {
            "path": str(output),
            "bytes": output.stat().st_size,
            "sha256": actual,
            "probe": probe,
            "provenance_sidecar": str(provenance),
            "reused": True,
        }
    if output.exists() and prior and prior.get("state") != "PLANNED":
        raise PipelineError(f"existing derivative sidecar has unsupported state: {provenance}")

    if prior is None:
        atomic_write_json(
            provenance,
            {
                "state": "PLANNED",
                "signature_sha256": signature,
                "spec": spec,
            },
        )
        prior = read_sidecar(provenance)

    assert_disk_headroom(estimated_bytes)
    fd, temp_name = tempfile.mkstemp(prefix=f".{output.stem}.", suffix=f".tmp{output.suffix}", dir=output.parent)
    os.close(fd)
    temp_path = Path(temp_name)
    temp_path.unlink()
    try:
        command = command_builder(temp_path)
        run(command)
        if not temp_path.is_file() or temp_path.stat().st_size == 0:
            raise PipelineError(f"derivative command did not create a nonempty temporary output: {temp_path}")
        with temp_path.open("rb+") as handle:
            os.fsync(handle.fileno())
        temp_hash = sha256_file(temp_path)
        if output.exists():
            existing_hash = sha256_file(output)
            if existing_hash != temp_hash:
                raise PipelineError(f"planned resume output differs from regenerated result; refusing overwrite: {output}")
        else:
            expected_prior_hash = prior.get("output_sha256") if prior else None
            if expected_prior_hash and expected_prior_hash != temp_hash:
                raise PipelineError(f"rebuilt derivative differs from recorded output hash: {output}")
            os.chmod(temp_path, 0o444)
            try:
                os.link(temp_path, output)
            except FileExistsError as exc:
                raise PipelineError(f"derivative appeared during atomic publication; refusing race overwrite: {output}") from exc
        probe = validator(output)
        record = {
            "state": "COMPLETE",
            "signature_sha256": signature,
            "spec": spec,
            "command": normalized_command(command, temp_path),
            "output_path": str(output),
            "output_bytes": output.stat().st_size,
            "output_sha256": sha256_file(output),
            "probe": probe,
        }
        atomic_write_json(provenance, record)
        return {
            "path": str(output),
            "bytes": output.stat().st_size,
            "sha256": record["output_sha256"],
            "probe": probe,
            "provenance_sidecar": str(provenance),
            "reused": False,
        }
    finally:
        temp_path.unlink(missing_ok=True)


def publish_small_text(path: Path, content: str) -> None:
    encoded = content.encode("utf-8")
    if path.exists():
        if path.read_bytes() != encoded:
            raise PipelineError(f"existing metadata/manifest differs; refusing overwrite: {path}")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    temp_path = Path(temp_name)
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(encoded)
            handle.flush()
            os.fsync(handle.fileno())
        try:
            os.link(temp_path, path)
        except FileExistsError as exc:
            raise PipelineError(f"metadata appeared during atomic publication; refusing race overwrite: {path}") from exc
        os.chmod(path, 0o444)
    finally:
        temp_path.unlink(missing_ok=True)


def publish_small_json(path: Path, value: Any) -> None:
    publish_small_text(path, json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n")


def loudnorm_measure(path: Path, target_i: float, target_tp: float, target_lra: float) -> dict[str, str]:
    filter_value = f"loudnorm=I={target_i}:TP={target_tp}:LRA={target_lra}:print_format=json"
    result = run(
        [
            str(FFMPEG),
            "-hide_banner",
            "-nostdin",
            "-v",
            "info",
            "-i",
            str(path),
            "-map_metadata",
            "-1",
            "-af",
            filter_value,
            "-f",
            "null",
            "-",
        ]
    )
    blocks = re.findall(r'\{\s*"input_i".*?\}', result.stderr, flags=re.DOTALL)
    if not blocks:
        raise PipelineError(f"could not parse loudnorm JSON for {path}")
    value = json.loads(blocks[-1])
    required = ("input_i", "input_tp", "input_lra", "input_thresh", "target_offset")
    if any(key not in value for key in required):
        raise PipelineError(f"incomplete loudnorm measurement for {path}: {value}")
    for key in required:
        try:
            if not math.isfinite(float(value[key])):
                raise ValueError
        except (TypeError, ValueError) as exc:
            raise PipelineError(f"nonfinite loudnorm measurement {key} for {path}: {value[key]!r}") from exc
    return {key: str(value[key]) for key in value}


def ensure_normalized(
    source: Path,
    source_hash: str,
    output: Path,
    tools: dict[str, str],
    target_i: float,
    target_tp: float,
    target_lra: float,
) -> tuple[dict[str, Any], dict[str, str]]:
    first_pass: dict[str, str] = {}

    def command(temp: Path) -> list[str]:
        first_pass.update(loudnorm_measure(source, target_i, target_tp, target_lra))
        measured = (
            f"loudnorm=I={target_i}:TP={target_tp}:LRA={target_lra}:"
            f"measured_I={first_pass['input_i']}:measured_TP={first_pass['input_tp']}:"
            f"measured_LRA={first_pass['input_lra']}:measured_thresh={first_pass['input_thresh']}:"
            f"offset={first_pass['target_offset']}:linear=true:print_format=summary"
        )
        return [
            str(FFMPEG),
            "-hide_banner",
            "-nostdin",
            "-v",
            "warning",
            "-n",
            "-i",
            str(source),
            "-map_metadata",
            "-1",
            "-fflags",
            "+bitexact",
            "-flags:a",
            "+bitexact",
            "-af",
            measured,
            "-ar",
            "48000",
            "-ac",
            "2",
            "-c:a",
            "pcm_s24le",
            "-f",
            "wav",
            str(temp),
        ]

    record = publish_derivative(
        output=output,
        operation="TWO_PASS_EBU_R128_NORMALIZE_PCM24",
        input_path=source,
        input_sha256=source_hash,
        raw_source_path=source,
        raw_source_sha256=source_hash,
        parameters={
            "target_integrated_lufs": target_i,
            "target_true_peak_dbtp": target_tp,
            "target_lra_lu": target_lra,
            "sample_rate_hz": 48_000,
            "channels": 2,
            "sample_format": "PCM_S24LE",
            "passes": 2,
        },
        tools=tools,
        command_builder=command,
        validator=lambda path: validate_pcm(path, 120.0),
        estimated_bytes=40 * 1024**2,
    )
    verification = loudnorm_measure(output, target_i, target_tp, target_lra)
    measured_i = float(verification["input_i"])
    measured_tp = float(verification["input_tp"])
    measured_lra = float(verification["input_lra"])
    if abs(measured_i - target_i) > 0.50:
        raise PipelineError(
            f"normalized master missed integrated-loudness target: {output}: "
            f"measured {measured_i} LUFS, target {target_i} LUFS"
        )
    if measured_tp > target_tp + 0.01:
        raise PipelineError(
            f"normalized master exceeded true-peak ceiling: {output}: "
            f"measured {measured_tp} dBTP, target ceiling {target_tp} dBTP"
        )
    if measured_lra > target_lra + 0.01:
        raise PipelineError(
            f"normalized master exceeded loudness-range ceiling: {output}: "
            f"measured {measured_lra} LU, target ceiling {target_lra} LU"
        )
    return record, verification


def ensure_loop(
    normalized: Path,
    normalized_hash: str,
    raw_source: Path,
    raw_source_hash: str,
    output: Path,
    tools: dict[str, str],
) -> dict[str, Any]:
    filter_graph = (
        "[0:a]atrim=start=0:end=6,asetpts=PTS-STARTPTS[head];"
        "[0:a]atrim=start=6:end=114,asetpts=PTS-STARTPTS[body];"
        "[0:a]atrim=start=114:end=120,asetpts=PTS-STARTPTS[tail];"
        "[tail][head]acrossfade=d=6:c1=qsin:c2=qsin[wrap];"
        "[body][wrap]concat=n=2:v=0:a=1[out]"
    )

    def command(temp: Path) -> list[str]:
        return [
            str(FFMPEG),
            "-hide_banner",
            "-nostdin",
            "-v",
            "warning",
            "-n",
            "-i",
            str(normalized),
            "-filter_complex",
            filter_graph,
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
            "114",
            "-f",
            "wav",
            str(temp),
        ]

    return publish_derivative(
        output=output,
        operation="TAIL_TO_HEAD_QSIN_LOOP_PCM24",
        input_path=normalized,
        input_sha256=normalized_hash,
        raw_source_path=raw_source,
        raw_source_sha256=raw_source_hash,
        parameters={
            "source_duration_seconds": 120,
            "crossfade_seconds": 6,
            "crossfade_curves": ["qsin", "qsin"],
            "construction": "SOURCE_6_114_THEN_CROSSFADE_SOURCE_114_120_INTO_SOURCE_0_6",
            "output_duration_seconds": 114,
            "sample_rate_hz": 48_000,
            "loop_start_frame": 0,
            "loop_end_frame_exclusive": 5_472_000,
        },
        tools=tools,
        command_builder=command,
        validator=lambda path: validate_pcm(path, 114.0),
        estimated_bytes=38 * 1024**2,
    )


def ensure_seam(
    loop: Path,
    loop_hash: str,
    raw_source: Path,
    raw_source_hash: str,
    output: Path,
    tools: dict[str, str],
) -> dict[str, Any]:
    filter_graph = (
        "[0:a]atrim=start=108:end=114,asetpts=PTS-STARTPTS[tail];"
        "[0:a]atrim=start=0:end=6,asetpts=PTS-STARTPTS[head];"
        "[tail][head]concat=n=2:v=0:a=1[out]"
    )

    def command(temp: Path) -> list[str]:
        return [
            str(FFMPEG),
            "-hide_banner",
            "-nostdin",
            "-v",
            "warning",
            "-n",
            "-i",
            str(loop),
            "-filter_complex",
            filter_graph,
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
            "12",
            "-f",
            "wav",
            str(temp),
        ]

    return publish_derivative(
        output=output,
        operation="LOOP_BOUNDARY_SEAM_AUDITION_PCM24",
        input_path=loop,
        input_sha256=loop_hash,
        raw_source_path=raw_source,
        raw_source_sha256=raw_source_hash,
        parameters={
            "tail_seconds": [108, 114],
            "head_seconds": [0, 6],
            "output_duration_seconds": 12,
            "sample_rate_hz": 48_000,
        },
        tools=tools,
        command_builder=command,
        validator=lambda path: validate_pcm(path, 12.0),
        estimated_bytes=6 * 1024**2,
    )


def ensure_preview(
    input_path: Path,
    input_hash: str,
    input_duration: float,
    raw_source: Path,
    raw_source_hash: str,
    output: Path,
    tools: dict[str, str],
) -> dict[str, Any]:
    def command(temp: Path) -> list[str]:
        return [
            str(FFMPEG),
            "-hide_banner",
            "-nostdin",
            "-v",
            "warning",
            "-n",
            "-i",
            str(input_path),
            "-vn",
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
            "aac",
            "-b:a",
            "192k",
            "-movflags",
            "+faststart",
            "-f",
            "mp4",
            str(temp),
        ]

    return publish_derivative(
        output=output,
        operation="AAC_192K_AUDITION_PREVIEW",
        input_path=input_path,
        input_sha256=input_hash,
        raw_source_path=raw_source,
        raw_source_sha256=raw_source_hash,
        parameters={
            "codec": "AAC",
            "container": "M4A_ISO_BMFF",
            "nominal_bitrate_bps": 192_000,
            "sample_rate_hz": 48_000,
            "channels": 2,
            "full_length_preview": True,
            "expected_duration_seconds": input_duration,
        },
        tools=tools,
        command_builder=command,
        validator=lambda path: validate_aac(path, input_duration),
        estimated_bytes=6 * 1024**2,
    )


def ensure_waveform(
    loop: Path,
    loop_hash: str,
    raw_source: Path,
    raw_source_hash: str,
    output: Path,
    tools: dict[str, str],
) -> dict[str, Any]:
    width, height = 1600, 360

    def command(temp: Path) -> list[str]:
        return [
            str(FFMPEG),
            "-hide_banner",
            "-nostdin",
            "-v",
            "warning",
            "-n",
            "-i",
            str(loop),
            "-filter_complex",
            f"showwavespic=s={width}x{height}:split_channels=1:colors=0x67D8FF|0xFFBF69",
            "-frames:v",
            "1",
            "-map_metadata",
            "-1",
            "-f",
            "image2",
            str(temp),
        ]

    return publish_derivative(
        output=output,
        operation="LOOP_WAVEFORM_PNG",
        input_path=loop,
        input_sha256=loop_hash,
        raw_source_path=raw_source,
        raw_source_sha256=raw_source_hash,
        parameters={"width": width, "height": height, "split_channels": True},
        tools=tools,
        command_builder=command,
        validator=lambda path: validate_png(path, width, height),
        estimated_bytes=8 * 1024**2,
    )


def ensure_spectrogram(
    loop: Path,
    loop_hash: str,
    raw_source: Path,
    raw_source_hash: str,
    output: Path,
    tools: dict[str, str],
) -> dict[str, Any]:
    width, height = 1600, 900

    def command(temp: Path) -> list[str]:
        return [
            str(FFMPEG),
            "-hide_banner",
            "-nostdin",
            "-v",
            "warning",
            "-n",
            "-i",
            str(loop),
            "-filter_complex",
            f"showspectrumpic=s={width}x{height}:legend=1:scale=log:fscale=log:color=viridis",
            "-frames:v",
            "1",
            "-map_metadata",
            "-1",
            "-f",
            "image2",
            str(temp),
        ]

    return publish_derivative(
        output=output,
        operation="LOOP_SPECTROGRAM_PNG",
        input_path=loop,
        input_sha256=loop_hash,
        raw_source_path=raw_source,
        raw_source_sha256=raw_source_hash,
        parameters={"width": width, "height": height, "frequency_scale": "LOG", "color": "VIRIDIS"},
        tools=tools,
        command_builder=command,
        validator=lambda path: validate_png(path, width, height),
        estimated_bytes=12 * 1024**2,
    )


def instruments(row: dict[str, Any]) -> set[str]:
    value = str(row.get("instrument_family_estimates", ""))
    return {part.split(":", 1)[0].strip().lower() for part in value.split(";") if part.strip()}


def prepare_candidates(jury_rows: list[dict[str, str]]) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    prepared: list[dict[str, Any]] = []
    excluded: list[dict[str, str]] = []
    seen_ids: set[str] = set()
    for source_row in jury_rows:
        row: dict[str, Any] = dict(source_row)
        candidate_id = safe_component(row.get("candidate_id", ""), "candidate_id")
        if candidate_id in seen_ids:
            raise PipelineError(f"duplicate candidate_id in jury CSV: {candidate_id}")
        seen_ids.add(candidate_id)
        epoch = row.get("epoch") or row.get("epoch_alias") or ""
        if epoch not in EPOCHS:
            raise PipelineError(f"{candidate_id}: unknown epoch alias: {epoch!r}")
        family_id = row.get("prompt_id") or row.get("family_id") or ""
        safe_component(family_id, "family/prompt ID")
        eligible, gate_evidence = screening_gate(row)
        if not eligible:
            excluded.append({"candidate_id": candidate_id, "epoch": epoch, "reason": gate_evidence})
            continue
        path_text = row.get("absolute_path") or row.get("source_path") or row.get("raw_path") or ""
        if not path_text:
            raise PipelineError(f"{candidate_id}: eligible row has no source path")
        source_path = validate_source_location(Path(path_text))
        source_hash = row.get("source_sha256") or row.get("sha256") or row.get("raw_sha256") or ""
        if not re.fullmatch(r"[0-9a-f]{64}", source_hash):
            raise PipelineError(f"{candidate_id}: invalid or absent source SHA-256")
        actual_hash = sha256_file(source_path)
        if actual_hash != source_hash:
            raise PipelineError(f"{candidate_id}: raw source hash mismatch: expected {source_hash}, got {actual_hash}")
        raw_probe = validate_raw(source_path)
        row.update(
            {
                "candidate_id": candidate_id,
                "epoch": epoch,
                "prompt_id": family_id,
                "source_path": source_path,
                "source_sha256": source_hash,
                "source_bytes": source_path.stat().st_size,
                "raw_probe": raw_probe,
                "gate_evidence": gate_evidence,
                "machine_score_numeric": as_float(row.get("machine_score"), field="machine_score", candidate_id=candidate_id),
                "instruments": instruments(row),
            }
        )
        prepared.append(row)
    if not prepared:
        raise PipelineError("jury CSV has no eligible candidates")
    hashes: dict[str, str] = {}
    for row in prepared:
        prior = hashes.setdefault(row["source_sha256"], row["candidate_id"])
        if prior != row["candidate_id"]:
            raise PipelineError(
                f"eligible candidates share an exact raw hash and should have been duplicate-gated: {prior}, {row['candidate_id']}"
            )
    return prepared, excluded


def normalize_features(epoch_rows: list[dict[str, Any]]) -> None:
    scores = [row["machine_score_numeric"] for row in epoch_rows]
    score_min, score_max = min(scores), max(scores)
    for row in epoch_rows:
        row["_score_norm"] = (
            (row["machine_score_numeric"] - score_min) / (score_max - score_min)
            if score_max > score_min
            else 1.0
        )
        row["_contrast_vector"] = []
    for field in CONTRAST_FIELDS:
        available: list[tuple[dict[str, Any], float]] = []
        for row in epoch_rows:
            value = row.get(field, "")
            try:
                parsed = float(value)
            except (TypeError, ValueError):
                continue
            if math.isfinite(parsed):
                available.append((row, parsed))
        values = [value for _, value in available]
        low, high = (min(values), max(values)) if values else (0.0, 0.0)
        mapped = {row["candidate_id"]: value for row, value in available}
        midpoint = 0.5
        for row in epoch_rows:
            if row["candidate_id"] not in mapped or high == low:
                row["_contrast_vector"].append(midpoint)
            else:
                row["_contrast_vector"].append((mapped[row["candidate_id"]] - low) / (high - low))


def contrast(left: dict[str, Any], right: dict[str, Any]) -> float:
    numeric = sum(abs(a - b) for a, b in zip(left["_contrast_vector"], right["_contrast_vector"], strict=True))
    numeric /= max(len(CONTRAST_FIELDS), 1)
    union = left["instruments"] | right["instruments"]
    instrument_distance = 1.0 - (len(left["instruments"] & right["instruments"]) / len(union)) if union else 0.5
    family_distance = 1.0 if left["prompt_id"] != right["prompt_id"] else 0.0
    return 0.65 * numeric + 0.25 * instrument_distance + 0.10 * family_distance


def choose_rows(
    candidates: list[dict[str, Any]],
    count: int,
    references: list[dict[str, Any]],
    *,
    enforce_new_families: bool,
) -> list[dict[str, Any]]:
    selected: list[dict[str, Any]] = []
    remaining = list(candidates)
    used_families = {row["prompt_id"] for row in references}
    while remaining and len(selected) < count:
        pool = remaining
        if enforce_new_families:
            unused = [row for row in remaining if row["prompt_id"] not in used_families]
            if unused:
                pool = unused
        all_references = references + selected
        scored: list[tuple[float, float, float, str, dict[str, Any]]] = []
        for row in pool:
            contrast_floor = min((contrast(row, prior) for prior in all_references), default=0.0)
            utility = row["_score_norm"] if not all_references else 0.72 * row["_score_norm"] + 0.28 * contrast_floor
            scored.append((utility, row["machine_score_numeric"], contrast_floor, row["candidate_id"], row))
        # Candidate ID is deliberately ascending for the final deterministic tie-break.
        scored.sort(key=lambda item: (-item[0], -item[1], -item[2], item[3]))
        utility, _, contrast_floor, _, winner = scored[0]
        winner = dict(winner)
        winner["selection_utility"] = round(utility, 6)
        winner["selection_contrast_floor"] = round(contrast_floor, 6)
        selected.append(winner)
        used_families.add(winner["prompt_id"])
        remaining = [row for row in remaining if row["candidate_id"] != winner["candidate_id"]]
    return selected


def select_shortlist(candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in candidates:
        grouped[row["epoch"]].append(row)
    missing_epochs = [epoch for epoch in EPOCHS if not grouped[epoch]]
    if missing_epochs:
        raise PipelineError(f"no eligible candidate in epochs: {missing_epochs}")

    selections: list[dict[str, Any]] = []
    for epoch_index, epoch in enumerate(EPOCHS, start=1):
        epoch_rows = grouped[epoch]
        normalize_features(epoch_rows)
        unique_families = {row["prompt_id"] for row in epoch_rows}
        primaries = choose_rows(
            epoch_rows,
            3,
            [],
            enforce_new_families=len(unique_families) >= 3,
        )
        if len(primaries) != 3:
            raise PipelineError(f"{epoch}: cannot provide three eligible provisional picks")
        if len(unique_families) >= 3 and len({row["prompt_id"] for row in primaries}) != 3:
            raise PipelineError(f"{epoch}: primary family diversity invariant failed")
        remaining = [row for row in epoch_rows if row["candidate_id"] not in {pick["candidate_id"] for pick in primaries}]
        alternates = choose_rows(remaining, 3, primaries, enforce_new_families=True)
        for rank, row in enumerate(primaries, start=1):
            row["epoch_order"] = epoch_index
            row["shortlist_role"] = f"PROVISIONAL PICK {rank}"
            row["role_type"] = "PRIMARY"
            row["role_rank"] = rank
            selections.append(row)
        for rank, row in enumerate(alternates, start=1):
            row["epoch_order"] = epoch_index
            row["shortlist_role"] = f"PROVISIONAL ALTERNATE {rank}"
            row["role_type"] = "ALTERNATE"
            row["role_rank"] = rank
            selections.append(row)

    primary_count = sum(row["role_type"] == "PRIMARY" for row in selections)
    if primary_count != 27:
        raise PipelineError(f"primary selection invariant failed: expected 27, got {primary_count}")
    selected_ids = [row["candidate_id"] for row in selections]
    selected_hashes = [row["source_sha256"] for row in selections]
    if len(set(selected_ids)) != len(selected_ids) or len(set(selected_hashes)) != len(selected_hashes):
        raise PipelineError("shortlist contains a repeated candidate or exact duplicate source hash")
    return selections


def catalogue_maps(rows: list[dict[str, str]]) -> tuple[dict[str, dict[str, str]], dict[str, dict[str, str]]]:
    by_candidate: dict[str, dict[str, str]] = {}
    by_family: dict[str, dict[str, str]] = {}
    families: set[tuple[str, str]] = set()
    epochs: set[str] = set()
    for row in rows:
        candidate_id = row.get("candidate_id", "")
        prompt_id = row.get("prompt_id") or row.get("family_id") or ""
        epoch = row.get("epoch_alias") or row.get("epoch") or ""
        if candidate_id:
            if candidate_id in by_candidate:
                raise PipelineError(f"duplicate candidate in commissioning catalogue: {candidate_id}")
            by_candidate[candidate_id] = row
        if prompt_id:
            by_family.setdefault(prompt_id, row)
            families.add((epoch, prompt_id))
        if epoch:
            epochs.add(epoch)
    if len(families) != 36 or epochs != set(EPOCHS):
        raise PipelineError(
            f"commissioning catalogue invariant failed: expected 36 families and all nine epochs; "
            f"found {len(families)} families, epochs={sorted(epochs)}"
        )
    return by_candidate, by_family


def catalogue_record(
    selection: dict[str, Any],
    by_candidate: dict[str, dict[str, str]],
    by_family: dict[str, dict[str, str]],
) -> tuple[dict[str, str], str]:
    if selection["candidate_id"] in by_candidate:
        return by_candidate[selection["candidate_id"]], "EXACT_CANDIDATE_ROW"
    if selection["prompt_id"] in by_family:
        return by_family[selection["prompt_id"]], "FAMILY_TEMPLATE_ROW"
    return {}, "JURY_ROW_ONLY"


def selection_explanation(row: dict[str, Any], family_count: int) -> dict[str, Any]:
    return {
        "classification": "ANALYSIS SIGNAL ONLY",
        "role": row["shortlist_role"],
        "machine_score": row["machine_score_numeric"],
        "score_normalized_within_epoch": round(row["_score_norm"], 6),
        "minimum_feature_contrast_at_selection": row["selection_contrast_floor"],
        "selection_utility": row["selection_utility"],
        "formula": "FIRST PICK: normalized machine score; LATER PICKS: 0.72 * normalized machine score + 0.28 * minimum contrast to already selected tracks",
        "contrast_dimensions": list(CONTRAST_FIELDS),
        "instrument_contrast_source": "broad machine instrument-family association labels",
        "family_policy": (
            "Primary picks use distinct prompt families because at least three eligible families were available."
            if row["role_type"] == "PRIMARY" and family_count >= 3
            else "Family diversity was applied where the eligible pool allowed it."
        ),
        "limitations": [
            "This is a machine-curated provisional ranking, not human listening or Owner approval.",
            "Contrast is a feature-space proxy and cannot prove long-session comfort.",
            "No automated analysis proves era authenticity, cultural acceptance, copyright safety, exclusivity, non-infringement, or commercial clearance.",
        ],
    }


def build_derivatives(
    selection: dict[str, Any],
    catalogue: dict[str, str],
    catalogue_match: str,
    catalogue_path: Path,
    catalogue_hash: str,
    jury_path: Path,
    jury_hash: str,
    tools: dict[str, str],
    family_count: int,
    target_i: float,
    target_tp: float,
    target_lra: float,
) -> dict[str, Any]:
    epoch = selection["epoch"]
    candidate_id = selection["candidate_id"]
    output_dir = PROCESSED_ROOT / epoch / candidate_id
    output_dir.mkdir(parents=True, exist_ok=True)
    source: Path = selection["source_path"]
    source_hash = selection["source_sha256"]

    normalized_path = output_dir / "normalized-48k-24bit.wav"
    normalized, loudness_verification = ensure_normalized(
        source,
        source_hash,
        normalized_path,
        tools,
        target_i,
        target_tp,
        target_lra,
    )
    derivatives: dict[str, Any] = {"normalized_master": normalized}

    if selection["role_type"] == "PRIMARY":
        loop_path = output_dir / "loop-114s-qsin.wav"
        loop = ensure_loop(normalized_path, normalized["sha256"], source, source_hash, loop_path, tools)
        seam_path = output_dir / "seam-audition-12s.wav"
        seam = ensure_seam(loop_path, loop["sha256"], source, source_hash, seam_path, tools)
        preview_path = output_dir / "preview-192k-aac.m4a"
        preview = ensure_preview(loop_path, loop["sha256"], 114.0, source, source_hash, preview_path, tools)
        waveform_path = output_dir / "waveform.png"
        waveform = ensure_waveform(loop_path, loop["sha256"], source, source_hash, waveform_path, tools)
        spectrogram_path = output_dir / "spectrogram.png"
        spectrogram = ensure_spectrogram(loop_path, loop["sha256"], source, source_hash, spectrogram_path, tools)
        derivatives.update(
            {
                "loop_master": loop,
                "seam_audition": seam,
                "aac_preview": preview,
                "waveform": waveform,
                "spectrogram": spectrogram,
            }
        )
    else:
        preview_path = output_dir / "preview-192k-aac.m4a"
        preview = ensure_preview(normalized_path, normalized["sha256"], 120.0, source, source_hash, preview_path, tools)
        derivatives["aac_preview"] = preview

    generation_fields = (
        "generation_config_id",
        "dit",
        "decoder",
        "duration_seconds",
        "steps",
        "cfg",
        "apg",
        "init_noise_level",
        "dit_dtype",
        "guide_audio",
        "lora",
        "hf_hub_offline",
        "model",
        "model_revision",
        "optimized_weights_revision",
        "code_commit",
        "backend",
    )
    prompt_fields = (
        "prompt_id",
        "family_name",
        "family_intent",
        "history_interpretation_boundary",
        "expected_instruments",
        "prohibited_cliches",
        "adjacent_overlap_notes",
        "human_cultural_review_notes",
        "positive_prompt",
        "negative_prompt",
        "target_bpm",
        "bpm_range_low",
        "bpm_range_high",
        "source_prompt_provenance",
    )
    generation = {field: catalogue.get(field, selection.get(field, "")) for field in generation_fields}
    prompt = {field: catalogue.get(field, selection.get(field, "")) for field in prompt_fields}
    machine_signals = {
        key: value
        for key, value in selection.items()
        if not key.startswith("_")
        and key
        not in {
            "source_path",
            "raw_probe",
            "instruments",
            "source_bytes",
        }
    }
    machine_signals["source_path"] = str(source)
    explanation = selection_explanation(selection, family_count)
    metadata = {
        "metadata_version": PIPELINE_VERSION,
        "candidate_id": candidate_id,
        "stable_track_id": f"MUS-{selection['epoch_order']:02d}-{candidate_id}",
        "epoch_alias": epoch,
        "epoch_alias_authority": "CREATIVE_COMMISSIONING_ALIAS_NOT_P13_RUNTIME_ID",
        "family_id": selection["prompt_id"],
        "shortlist_role": selection["shortlist_role"],
        "shortlist_status": SHORTLIST_STATUS,
        "rights_status": RIGHTS_STATUS,
        "source_rights_status": SOURCE_RIGHTS_STATUS,
        "raw_source": {
            "absolute_path": str(source),
            "bytes": selection["source_bytes"],
            "sha256": source_hash,
            "probe": selection["raw_probe"],
            "preservation": "READ_ONLY_SOURCE; NO RAW AUDIO WAS MODIFIED",
        },
        "prompt_provenance": {
            "catalogue_path": str(catalogue_path),
            "catalogue_sha256": catalogue_hash,
            "catalogue_match": catalogue_match,
            "prompt": prompt,
        },
        "generation_tuple": generation,
        "machine_jury": {
            "source_path": str(jury_path),
            "source_sha256": jury_hash,
            "signals": machine_signals,
            "explanation": explanation,
        },
        "normalization": {
            "target_integrated_lufs": target_i,
            "target_true_peak_dbtp": target_tp,
            "target_lra_lu": target_lra,
            "method": "FFMPEG_LOUDNORM_TWO_PASS",
            "verification_measurement": loudness_verification,
        },
        "loop": (
            {
                "duration_seconds": 114,
                "sample_rate_hz": 48_000,
                "start_frame": 0,
                "end_frame_exclusive": 5_472_000,
                "crossfade_seconds": 6,
                "crossfade_curve": "qsin",
                "construction": "BODY_6_114_THEN_TAIL_114_120_TO_HEAD_0_6",
            }
            if selection["role_type"] == "PRIMARY"
            else None
        ),
        "derivatives": derivatives,
        "tools": tools,
        "limitations": explanation["limitations"],
    }
    metadata_path = output_dir / "metadata.json"
    publish_small_json(metadata_path, metadata)
    metadata_record = {
        "path": str(metadata_path),
        "bytes": metadata_path.stat().st_size,
        "sha256": sha256_file(metadata_path),
    }

    role_slug = f"{'pick' if selection['role_type'] == 'PRIMARY' else 'alternate'}-{selection['role_rank']:02d}"
    pointer_path = SHORTLIST_ROOT / epoch / f"{role_slug}.json"
    pointer = {
        "candidate_id": candidate_id,
        "epoch_alias": epoch,
        "family_id": selection["prompt_id"],
        "shortlist_role": selection["shortlist_role"],
        "shortlist_status": SHORTLIST_STATUS,
        "rights_status": RIGHTS_STATUS,
        "machine_score_explanation": explanation,
        "source_sha256": source_hash,
        "metadata": metadata_record,
        "derivatives": derivatives,
    }
    publish_small_json(pointer_path, pointer)
    return {
        "metadata": metadata_record,
        "shortlist_pointer": {
            "path": str(pointer_path),
            "bytes": pointer_path.stat().st_size,
            "sha256": sha256_file(pointer_path),
        },
        "derivatives": derivatives,
        "machine_score_explanation": explanation,
    }


def shortlist_csv_rows(selections: list[dict[str, Any]]) -> list[dict[str, Any]]:
    result = []
    for row in selections:
        artifacts = row.get("artifacts", {})
        derivatives = artifacts.get("derivatives", {})

        def artifact(field: str, key: str) -> str:
            return str(derivatives.get(field, {}).get(key, ""))

        result.append(
            {
                "epoch_order": row["epoch_order"],
                "epoch_alias": row["epoch"],
                "shortlist_role": row["shortlist_role"],
                "role_type": row["role_type"],
                "role_rank": row["role_rank"],
                "candidate_id": row["candidate_id"],
                "family_id": row["prompt_id"],
                "prompt_family": row.get("prompt_family") or row.get("family_name", ""),
                "seed": row.get("seed", ""),
                "machine_label": row.get("machine_label", ""),
                "machine_score": row["machine_score_numeric"],
                "selection_utility": row["selection_utility"],
                "minimum_contrast_signal": row["selection_contrast_floor"],
                "likely_bpm": row.get("likely_bpm", ""),
                "estimated_loudness_lufs_i": row.get("raw_loudness_lufs_i", ""),
                "source_path": str(row["source_path"]),
                "source_bytes": row["source_bytes"],
                "source_sha256": row["source_sha256"],
                "normalized_wav_path": artifact("normalized_master", "path"),
                "normalized_wav_sha256": artifact("normalized_master", "sha256"),
                "loop_wav_path": artifact("loop_master", "path"),
                "loop_wav_sha256": artifact("loop_master", "sha256"),
                "seam_audition_path": artifact("seam_audition", "path"),
                "seam_audition_sha256": artifact("seam_audition", "sha256"),
                "aac_preview_path": artifact("aac_preview", "path"),
                "aac_preview_sha256": artifact("aac_preview", "sha256"),
                "waveform_path": artifact("waveform", "path"),
                "waveform_sha256": artifact("waveform", "sha256"),
                "spectrogram_path": artifact("spectrogram", "path"),
                "spectrogram_sha256": artifact("spectrogram", "sha256"),
                "metadata_path": artifacts.get("metadata", {}).get("path", ""),
                "metadata_sha256": artifacts.get("metadata", {}).get("sha256", ""),
                "shortlist_status": SHORTLIST_STATUS,
                "rights_status": RIGHTS_STATUS,
            }
        )
    return result


def explanations_markdown(selections: list[dict[str, Any]]) -> str:
    lines = [
        "# Provisional Machine Shortlist — Explanations",
        "",
        f"Status: `{SHORTLIST_STATUS}`  ",
        f"Rights/status: `{RIGHTS_STATUS}`",
        "",
        "These selections are machine-curated audition suggestions. They are not human listening, Owner approval, rights clearance, or production authority.",
        "",
        "Selection formula: the first pick in an epoch maximizes normalized machine score. Later choices maximize `0.72 × normalized score + 0.28 × minimum feature contrast` while using different prompt families where possible.",
        "",
    ]
    for epoch in EPOCHS:
        lines.extend([f"## {epoch}", ""])
        for row in [item for item in selections if item["epoch"] == epoch]:
            explanation = row["artifacts"]["machine_score_explanation"]
            lines.extend(
                [
                    f"### {row['shortlist_role']} — {row['candidate_id']}",
                    "",
                    f"- Family: `{row['prompt_id']}`",
                    f"- Machine score: `{row['machine_score_numeric']:.6f}`",
                    f"- Selection utility: `{row['selection_utility']:.6f}`",
                    f"- Minimum contrast signal when selected: `{row['selection_contrast_floor']:.6f}`",
                    f"- Explanation: {explanation['family_policy']}",
                    "- Limit: analysis signal only; human listening remains mandatory.",
                    "",
                ]
            )
    return "\n".join(lines) + "\n"


def run_pipeline(args: argparse.Namespace) -> None:
    jury_rows = read_csv(args.jury_csv)
    catalogue_rows = read_csv(args.catalogue)
    catalogue_by_candidate, catalogue_by_family = catalogue_maps(catalogue_rows)
    candidates, excluded = prepare_candidates(jury_rows)
    selections = select_shortlist(candidates)

    if args.plan_only:
        plan = {
            "pipeline_version": PIPELINE_VERSION,
            "shortlist_status": SHORTLIST_STATUS,
            "rights_status": RIGHTS_STATUS,
            "candidate_count_input": len(jury_rows),
            "candidate_count_eligible": len(candidates),
            "candidate_count_excluded": len(excluded),
            "primary_count": sum(row["role_type"] == "PRIMARY" for row in selections),
            "alternate_count": sum(row["role_type"] == "ALTERNATE" for row in selections),
            "selections": [
                {
                    "epoch": row["epoch"],
                    "role": row["shortlist_role"],
                    "candidate_id": row["candidate_id"],
                    "family_id": row["prompt_id"],
                    "machine_score": row["machine_score_numeric"],
                    "selection_utility": row["selection_utility"],
                    "contrast_floor": row["selection_contrast_floor"],
                }
                for row in selections
            ],
        }
        print(json.dumps(plan, indent=2, sort_keys=True))
        return

    tools = ffmpeg_identity()
    jury_hash = sha256_file(args.jury_csv)
    catalogue_hash = sha256_file(args.catalogue)
    family_counts = {
        epoch: len({row["prompt_id"] for row in candidates if row["epoch"] == epoch}) for epoch in EPOCHS
    }
    for index, selection in enumerate(selections, start=1):
        catalogue, match = catalogue_record(selection, catalogue_by_candidate, catalogue_by_family)
        selection["artifacts"] = build_derivatives(
            selection,
            catalogue,
            match,
            args.catalogue,
            catalogue_hash,
            args.jury_csv,
            jury_hash,
            tools,
            family_counts[selection["epoch"]],
            args.target_lufs,
            args.true_peak_dbtp,
            args.target_lra,
        )
        print(
            f"[{index:02d}/{len(selections):02d}] {selection['epoch']} "
            f"{selection['shortlist_role']}: {selection['candidate_id']}",
            flush=True,
        )

    # Re-hash every selected raw source after all reads.  Any source mutation
    # invalidates the whole publication rather than being obscured by outputs.
    for selection in selections:
        actual = sha256_file(selection["source_path"])
        if actual != selection["source_sha256"]:
            raise PipelineError(f"raw source changed during derivative run: {selection['candidate_id']}")

    output_rows = shortlist_csv_rows(selections)
    csv_path = SHORTLIST_ROOT / "provisional-machine-shortlist.csv"
    publish_small_text(csv_path, csv_text(output_rows, list(output_rows[0].keys())))
    explanations_path = SHORTLIST_ROOT / "PROVISIONAL-MACHINE-SHORTLIST-EXPLANATIONS.md"
    publish_small_text(explanations_path, explanations_markdown(selections))
    json_path = SHORTLIST_ROOT / "provisional-machine-shortlist.json"
    manifest = {
        "pipeline_version": PIPELINE_VERSION,
        "shortlist_status": SHORTLIST_STATUS,
        "rights_status": RIGHTS_STATUS,
        "classification": "PROVISIONAL MACHINE SHORTLIST; HUMAN LISTENING REQUIRED",
        "inputs": {
            "machine_jury_csv": {"path": str(args.jury_csv), "sha256": jury_hash},
            "commissioning_catalogue": {"path": str(args.catalogue), "sha256": catalogue_hash},
        },
        "tools": tools,
        "selection_policy": {
            "primary_per_epoch": 3,
            "alternate_per_epoch_max": 3,
            "primary_family_policy": "DIFFERENT_PROMPT_FAMILIES_WHERE_AT_LEAST_THREE_ARE_ELIGIBLE",
            "first_pick": "MAX_NORMALIZED_MACHINE_SCORE",
            "later_pick_utility": "0.72*NORMALIZED_MACHINE_SCORE + 0.28*MINIMUM_FEATURE_CONTRAST",
            "contrast_fields": list(CONTRAST_FIELDS),
        },
        "processing_policy": {
            "normalized_master": "48_KHZ_STEREO_PCM24; FFMPEG_LOUDNORM_TWO_PASS; -18_LUFS_TARGET",
            "loop": "114_SECONDS; 6_SECOND_TAIL_TO_HEAD_QSIN_CROSSFADE",
            "seam_audition": "LAST_6_SECONDS_PLUS_FIRST_6_SECONDS_OF_LOOP",
            "preview": "FULL_LENGTH_48_KHZ_STEREO_AAC_192_KBIT_S_IN_M4A",
            "publication": "SAME_DIRECTORY_TEMPORARY_FILE_PLUS_ATOMIC_NO_OVERWRITE_HARDLINK",
        },
        "counts": {
            "jury_rows": len(jury_rows),
            "eligible_rows": len(candidates),
            "excluded_rows": len(excluded),
            "primary": sum(row["role_type"] == "PRIMARY" for row in selections),
            "alternate": sum(row["role_type"] == "ALTERNATE" for row in selections),
        },
        "excluded_input_rows": excluded,
        "selections": output_rows,
        "explanations": {"path": str(explanations_path), "sha256": sha256_file(explanations_path)},
        "limitations": [
            "No human or Owner listening acceptance occurred.",
            "Machine scores and feature contrast are analysis signals only.",
            "The outputs do not establish historical truth, fatigue safety, cultural acceptance, copyrightability, exclusivity, non-infringement, or commercial clearance.",
        ],
    }
    publish_small_json(json_path, manifest)
    summary = {
        "shortlist_csv": {"path": str(csv_path), "sha256": sha256_file(csv_path)},
        "shortlist_json": {"path": str(json_path), "sha256": sha256_file(json_path)},
        "explanations": {"path": str(explanations_path), "sha256": sha256_file(explanations_path)},
        "primary_count": manifest["counts"]["primary"],
        "alternate_count": manifest["counts"]["alternate"],
        "shortlist_status": SHORTLIST_STATUS,
        "rights_status": RIGHTS_STATUS,
    }
    print(json.dumps(summary, indent=2, sort_keys=True))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--jury-csv", type=Path, default=DEFAULT_JURY)
    parser.add_argument("--catalogue", type=Path, default=DEFAULT_CATALOGUE)
    parser.add_argument("--target-lufs", type=float, default=-18.0)
    parser.add_argument("--true-peak-dbtp", type=float, default=-1.5)
    parser.add_argument("--target-lra", type=float, default=12.0)
    parser.add_argument(
        "--plan-only",
        action="store_true",
        help="validate inputs and print deterministic selections without creating any output",
    )
    args = parser.parse_args()
    if not (-30.0 <= args.target_lufs <= -10.0):
        parser.error("--target-lufs must be between -30 and -10")
    if not (-6.0 <= args.true_peak_dbtp <= -0.1):
        parser.error("--true-peak-dbtp must be between -6 and -0.1")
    if not (1.0 <= args.target_lra <= 20.0):
        parser.error("--target-lra must be between 1 and 20")
    return args


if __name__ == "__main__":
    try:
        run_pipeline(parse_args())
    except PipelineError as exc:
        raise SystemExit(f"SHORTLIST PIPELINE STOPPED: {exc}") from exc
