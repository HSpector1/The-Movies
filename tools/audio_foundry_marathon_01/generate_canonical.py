#!/usr/bin/env python3
"""Resume-safe, sequential Stable Audio 3 Small-Music canonical generation."""

from __future__ import annotations

import argparse
import csv
import io
import json
import os
import shutil
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import soundfile as sf

from foundry_common import (
    MARATHON_ROOT,
    PILOT_ROOT,
    TOOLING_ROOT,
    atomic_write_json,
    atomic_write_text,
    require_generation_safety,
    retained_bytes,
    sha256_file,
    utc_now,
)


PYTHON = TOOLING_ROOT / ".phase2-venv-py312/bin/python"
CODE_ROOT = TOOLING_ROOT / "stable-audio-3"
SCRIPT = CODE_ROOT / "optimized/mlx/scripts/sa3_mlx.py"
WEIGHTS_ROOT = TOOLING_ROOT / "stable-audio-3-weights/MLX"
RAW_ROOT = MARATHON_ROOT / "02_raw"
LOG_ROOT = MARATHON_ROOT / "10_logs" / "generation"
PROVENANCE_ROOT = MARATHON_ROOT / "09_provenance"
EXISTING_INVENTORY = MARATHON_ROOT / "01_catalogue" / "existing-24-read-only-inventory.csv"
COMMANDS_PATH = MARATHON_ROOT / "01_catalogue" / "canonical-new-120-commands.jsonl"
GENERATION_PATH = LOG_ROOT / "canonical-generation.jsonl"
NEW_INVENTORY = MARATHON_ROOT / "01_catalogue" / "new-canonical-120-inventory.csv"
ALL_INVENTORY = MARATHON_ROOT / "01_catalogue" / "all-canonical-144-inventory.csv"
LARGE_GENERATION_CUTOFF = datetime.fromisoformat("2026-09-05T08:10:56+00:00")
PRIMARY_SEEDS = (104729, 130363, 155921, 196613)
EXISTING_PROMPT_IDS = {"FND-01", "FND-02", "FND-03", "DFG-01", "DFG-02", "DFG-03"}
EXPECTED_CODE_COMMIT = "c3909628db1ae2b57bed40a493c73c67ad674dc5"
WEIGHT_HASHES = {
    "dit_sm-music_f16.npz": "8ed3f38e2597f361ee675051f1265d9aa2ae2fffce1c61acd2e9fe31e1db1cbc",
    "same_s_decoder_f32.npz": "909928a8e6937c1ebe6ac4b729f0462bd3773704a11ea18278e42671dc69bfe4",
    "t5gemma_f16.npz": "8deb20489f36d9aec539f26c9c67321f99bc5fe300d470435ed6e76be4f16bbd",
}

GENERATION_TUPLE = {
    "code_repository": "Stability-AI/stable-audio-3",
    "code_commit": EXPECTED_CODE_COMMIT,
    "backend": "Apple MLX / Metal",
    "canonical_model": "stabilityai/stable-audio-3-small-music",
    "canonical_model_revision": "0fef1392cd842149a2b6d445e181c97608faac06",
    "optimized_weights_revision": "b5182df73f4aca4336c5c1b642ca6c44d5b085ec",
    "dit": "sm-music",
    "decoder": "same-s",
    "seconds": 120,
    "steps": 8,
    "init_noise_level": 1.0,
    "cfg": 2.0,
    "apg": 1.0,
    "dit_dtype": "fp16",
    "guide_audio": False,
    "lora": False,
    "hf_hub_offline": True,
}


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def csv_text(rows: list[dict[str, Any]], fieldnames: list[str]) -> str:
    buffer = io.StringIO(newline="")
    writer = csv.DictWriter(buffer, fieldnames=fieldnames, extrasaction="ignore", lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()


def row_value(row: dict[str, str], *names: str) -> str:
    for name in names:
        if row.get(name):
            return row[name]
    return ""


def load_families(path: Path) -> list[dict[str, str]]:
    rows = read_csv(path)
    families: list[dict[str, str]] = []
    seen: set[str] = set()
    for row in rows:
        prompt_id = row_value(row, "prompt_id", "family_id", "promptId")
        if not prompt_id:
            raise ValueError("catalogue row lacks prompt/family ID")
        # Candidate matrices can repeat each family four times. Collapse only
        # when prompt content is byte-for-byte identical.
        normalized = {
            "prompt_id": prompt_id,
            "epoch": row_value(row, "epoch", "epoch_alias"),
            "family": row_value(row, "family", "prompt_family", "family_name"),
            "positive_prompt": row_value(row, "positive_prompt", "prompt", "positivePrompt"),
            "negative_prompt": row_value(row, "negative_prompt", "negativePrompt"),
        }
        if not all(normalized.values()):
            raise ValueError(f"incomplete prompt row: {prompt_id}")
        if prompt_id in seen:
            prior = next(item for item in families if item["prompt_id"] == prompt_id)
            if normalized != prior:
                raise ValueError(f"conflicting repeated prompt row: {prompt_id}")
            continue
        seen.add(prompt_id)
        families.append(normalized)
    if len(families) != 36:
        raise ValueError(f"expected exactly 36 prompt families, found {len(families)}")
    counts: dict[str, int] = {}
    for family in families:
        counts[family["epoch"]] = counts.get(family["epoch"], 0) + 1
    if len(counts) != 9 or set(counts.values()) != {4}:
        raise ValueError(f"expected nine epochs with four families each, found {counts}")
    if not EXISTING_PROMPT_IDS.issubset(seen):
        raise ValueError(f"catalogue missing preserved prompts: {sorted(EXISTING_PROMPT_IDS - seen)}")
    return families


def append_jsonl(path: Path, record: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor = os.open(path, os.O_WRONLY | os.O_APPEND | os.O_CREAT, 0o644)
    try:
        payload = (json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n").encode("utf-8")
        os.write(descriptor, payload)
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def git_head(path: Path) -> str:
    result = subprocess.run(["git", "rev-parse", "HEAD"], cwd=path, check=True, capture_output=True, text=True)
    return result.stdout.strip()


def validate_route() -> dict[str, Any]:
    if git_head(CODE_ROOT) != EXPECTED_CODE_COMMIT:
        raise RuntimeError("Stable Audio source checkout is not at the pinned commit")
    if not PYTHON.is_file() or not SCRIPT.is_file():
        raise RuntimeError("pinned generator runtime or script missing")
    weights = []
    for name, expected_hash in WEIGHT_HASHES.items():
        path = WEIGHTS_ROOT / name
        actual_hash = sha256_file(path)
        if actual_hash != expected_hash:
            raise RuntimeError(f"weight hash mismatch: {name}")
        weights.append({"path": str(path), "bytes": path.stat().st_size, "sha256": actual_hash})
    result = subprocess.run([str(PYTHON), "--version"], check=True, capture_output=True, text=True)
    if "3.12.14" not in (result.stdout + result.stderr):
        raise RuntimeError(f"unexpected Python runtime: {result.stdout}{result.stderr}")
    return {"validated_utc": utc_now(), "generation_tuple": GENERATION_TUPLE, "weights": weights, "python": (result.stdout + result.stderr).strip()}


def build_argv(family: dict[str, str], seed: int, output: Path) -> list[str]:
    return [
        str(PYTHON),
        str(SCRIPT.relative_to(TOOLING_ROOT)),
        "--prompt", family["positive_prompt"],
        "--negative-prompt", family["negative_prompt"],
        "--dit", "sm-music",
        "--decoder", "same-s",
        "--seconds", "120",
        "--steps", "8",
        "--seed", str(seed),
        "--init-noise-level", "1.0",
        "--cfg", "2.0",
        "--apg", "1.0",
        "--dit-dtype", "fp16",
        "--free-models",
        "--out", str(output),
    ]


def validate_wav(path: Path) -> dict[str, Any]:
    info = sf.info(path)
    if info.channels != 2 or info.samplerate != 44_100 or info.frames != 5_292_000 or info.subtype != "PCM_16":
        raise RuntimeError(f"generated WAV format mismatch: {path}: {info}")
    if abs(info.duration - 120.0) > 1e-6:
        raise RuntimeError(f"generated WAV duration mismatch: {path}: {info.duration}")
    return {"bytes": path.stat().st_size, "sha256": sha256_file(path), "channels": info.channels, "sample_rate": info.samplerate, "frames": info.frames, "duration_seconds": info.duration, "subtype": info.subtype}


def read_success_log() -> dict[str, dict[str, Any]]:
    records: dict[str, dict[str, Any]] = {}
    if not GENERATION_PATH.exists():
        return records
    for line_number, line in enumerate(GENERATION_PATH.read_text(encoding="utf-8").splitlines(), start=1):
        try:
            record = json.loads(line)
        except json.JSONDecodeError as error:
            raise RuntimeError(f"malformed generation log line {line_number}: {error}") from error
        if record.get("status") == "SUCCESS":
            records[record["candidate_id"]] = record
    return records


def preserve_failed_temp(temp_path: Path, candidate_id: str) -> str | None:
    if not temp_path.exists():
        return None
    target_dir = LOG_ROOT / "failed-generation-artifacts"
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / f"{candidate_id}__{utc_now().replace(':', '').replace('-', '')}.wav"
    os.replace(temp_path, target)
    os.chmod(target, 0o444)
    return str(target)


def write_commands(matrix: list[tuple[dict[str, str], int, Path]]) -> None:
    lines = []
    for family, seed, output in matrix:
        argv = build_argv(family, seed, output)
        lines.append(json.dumps({
            "candidate_id": output.stem,
            "prompt_id": family["prompt_id"],
            "epoch": family["epoch"],
            "family": family["family"],
            "seed": seed,
            "cwd": str(TOOLING_ROOT),
            "argv": argv,
            "environment_safe": {"HF_HUB_OFFLINE": "1", "HF_HUB_DISABLE_TELEMETRY": "1"},
            "output": str(output),
            "status": "PLANNED",
            "rights_status": "PROTOTYPE_ONLY",
        }, ensure_ascii=False, sort_keys=True))
    expected = "\n".join(lines) + "\n"
    if COMMANDS_PATH.exists() and COMMANDS_PATH.read_text(encoding="utf-8") != expected:
        raise RuntimeError("existing command manifest differs from current exact plan")
    atomic_write_text(COMMANDS_PATH, expected)


def generate(args: argparse.Namespace) -> None:
    if datetime.now(timezone.utc) >= LARGE_GENERATION_CUTOFF:
        raise RuntimeError("new-large-generation cutoff reached")
    route = validate_route()
    require_generation_safety()
    families = load_families(args.catalogue)
    new_families = [family for family in families if family["prompt_id"] not in EXISTING_PROMPT_IDS]
    if len(new_families) != 30:
        raise RuntimeError(f"expected 30 new families, found {len(new_families)}")
    matrix = []
    for family in new_families:
        for seed in PRIMARY_SEEDS:
            output = RAW_ROOT / family["epoch"] / f"{family['prompt_id']}__seed-{seed}.wav"
            matrix.append((family, seed, output))
    if len(matrix) != 120:
        raise RuntimeError(f"expected 120 new canonical candidates, found {len(matrix)}")
    write_commands(matrix)
    atomic_write_json(PROVENANCE_ROOT / "canonical-generation-route.json", route)
    completed = read_success_log()
    environment = os.environ.copy()
    environment.update({"HF_HUB_OFFLINE": "1", "HF_HUB_DISABLE_TELEMETRY": "1"})

    for index, (family, seed, output) in enumerate(matrix, start=1):
        candidate_id = output.stem
        output.parent.mkdir(parents=True, exist_ok=True)
        prior = completed.get(candidate_id)
        if output.exists() or output.is_symlink():
            if not prior:
                raise FileExistsError(f"unlogged canonical destination exists; refusing overwrite: {output}")
            current = validate_wav(output)
            if current["sha256"] != prior["output_sha256"] or current["bytes"] != prior["output_bytes"]:
                raise RuntimeError(f"resume hash mismatch: {candidate_id}")
            print(f"[{index:03d}/120] VERIFIED-SKIP {candidate_id}", flush=True)
            continue

        require_generation_safety()
        predicted = retained_bytes() + 22_000_000
        if predicted >= 80 * 1024**3:
            raise RuntimeError(f"predictive 80 GiB disk cap reached before {candidate_id}")
        descriptor, temp_name = tempfile.mkstemp(prefix=f".{candidate_id}.", suffix=".wav", dir=output.parent)
        os.close(descriptor)
        temp_path = Path(temp_name)
        temp_path.unlink()
        argv = build_argv(family, seed, temp_path)
        started = utc_now()
        print(f"[{index:03d}/120] START {candidate_id}", flush=True)
        completed_process = subprocess.run(
            argv,
            cwd=TOOLING_ROOT,
            env=environment,
            capture_output=True,
            text=True,
            check=False,
            preexec_fn=lambda: os.nice(5),
        )
        ended = utc_now()
        stdout_path = LOG_ROOT / "candidates" / f"{candidate_id}.stdout.txt"
        stderr_path = LOG_ROOT / "candidates" / f"{candidate_id}.stderr.txt"
        atomic_write_text(stdout_path, completed_process.stdout)
        atomic_write_text(stderr_path, completed_process.stderr)
        record: dict[str, Any] = {
            "candidate_id": candidate_id,
            "prompt_id": family["prompt_id"],
            "epoch": family["epoch"],
            "family": family["family"],
            "positive_prompt": family["positive_prompt"],
            "negative_prompt": family["negative_prompt"],
            "seed": seed,
            "generation_tuple": GENERATION_TUPLE,
            "cwd": str(TOOLING_ROOT),
            "argv": argv,
            "environment_safe": {"HF_HUB_OFFLINE": "1", "HF_HUB_DISABLE_TELEMETRY": "1"},
            "process_priority_nice": 5,
            "started_utc": started,
            "ended_utc": ended,
            "return_code": completed_process.returncode,
            "stdout": {"path": str(stdout_path), "sha256": sha256_file(stdout_path)},
            "stderr": {"path": str(stderr_path), "sha256": sha256_file(stderr_path)},
            "planned_output": str(output),
            "rights_status": "PROTOTYPE_ONLY",
        }
        try:
            if completed_process.returncode != 0:
                raise RuntimeError(f"generator returned {completed_process.returncode}")
            metrics = validate_wav(temp_path)
            os.link(temp_path, output)
            os.chmod(output, 0o444)
            temp_path.unlink()
            record.update({"status": "SUCCESS", "output": str(output), **{f"output_{key}": value for key, value in metrics.items()}})
            append_jsonl(GENERATION_PATH, record)
            print(f"[{index:03d}/120] DONE {candidate_id} {metrics['sha256'][:12]}", flush=True)
        except Exception as error:
            record.update({"status": "FAILED", "error": repr(error), "preserved_partial": preserve_failed_temp(temp_path, candidate_id)})
            append_jsonl(GENERATION_PATH, record)
            raise

    build_inventories(families)


def build_inventories(families: list[dict[str, str]]) -> None:
    family_map = {family["prompt_id"]: family for family in families}
    successful = read_success_log()
    rows = []
    for candidate_id, record in sorted(successful.items()):
        path = Path(record["output"])
        if not path.exists():
            raise RuntimeError(f"logged output missing: {candidate_id}")
        metrics = validate_wav(path)
        if metrics["sha256"] != record["output_sha256"]:
            raise RuntimeError(f"logged output hash mismatch: {candidate_id}")
        family = family_map[record["prompt_id"]]
        rows.append({
            "absolute_path": str(path), "bytes": metrics["bytes"], "sha256": metrics["sha256"],
            "candidate_id": candidate_id, "epoch": family["epoch"], "prompt_id": family["prompt_id"],
            "prompt_family": family["family"], "seed": record["seed"],
            "generation_tuple": json.dumps(GENERATION_TUPLE, sort_keys=True, separators=(",", ":")),
            "screening_status": "PENDING_SCREENING_V3", "screening_gate": "V3_PENDING",
            "exclusion_reason": "", "rights_status": "PROTOTYPE_ONLY",
        })
    if len(rows) != 120:
        raise RuntimeError(f"expected 120 successful new canonical outputs, found {len(rows)}")
    fields = list(rows[0])
    atomic_write_text(NEW_INVENTORY, csv_text(rows, fields))
    existing = read_csv(EXISTING_INVENTORY)
    combined = existing + rows
    if len(combined) != 144 or len({row["candidate_id"] for row in combined}) != 144 or len({row["sha256"] for row in combined}) != 144:
        raise RuntimeError("canonical 144 inventory does not reconcile unique IDs and source hashes")
    atomic_write_text(ALL_INVENTORY, csv_text(combined, fields))
    summary = {
        "generated_utc": utc_now(), "status": "PASS", "existing": 24, "new": 120,
        "canonical_total": 144, "unique_candidate_ids": 144, "unique_source_hashes": 144,
        "new_inventory": {"path": str(NEW_INVENTORY), "sha256": sha256_file(NEW_INVENTORY)},
        "all_inventory": {"path": str(ALL_INVENTORY), "sha256": sha256_file(ALL_INVENTORY)},
        "generation_log": {"path": str(GENERATION_PATH), "sha256": sha256_file(GENERATION_PATH)},
        "rights_status": "PROTOTYPE_ONLY",
    }
    atomic_write_json(PROVENANCE_ROOT / "canonical-144-reconciliation.json", summary)
    print(json.dumps(summary, indent=2))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--catalogue", type=Path, required=True)
    return parser.parse_args()


if __name__ == "__main__":
    generate(parse_args())
