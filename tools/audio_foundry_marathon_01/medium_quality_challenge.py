#!/usr/bin/env python3
"""Bounded Stable Audio 3 Medium quality-comparison lane.

The lane renders exactly two fixed-seed Medium candidates for the PICK-01
prompt family in each of the nine commissioning epochs.  It is resume-safe,
never overwrites raw audio or pinned weights, runs inference sequentially, and
does not change the Small-Music shortlist.  Every result is PROTOTYPE_ONLY and
every score is ANALYSIS SIGNAL ONLY.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import math
import os
import subprocess
import tempfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
import soundfile as sf

from foundry_common import (
    DISK_CAP_BYTES,
    MARATHON_ROOT,
    TOOLING_ROOT,
    atomic_write_json,
    atomic_write_text,
    collision_processes,
    require_generation_safety,
    retained_bytes,
    sha256_file,
    utc_now,
)
from screen_v3 import (
    ANALYSIS_VERSION as SCREENING_VERSION,
    NEAR_DUPLICATE_ENVELOPE_CORRELATION,
    NEAR_DUPLICATE_FINGERPRINT_COSINE,
    analyze_audio,
)


TOOL_VERSION = "audio-foundry-medium-quality-challenge-v1"
RIGHTS_STATUS = "PROTOTYPE_ONLY"
SIGNAL_STATUS = "ANALYSIS SIGNAL ONLY"
CHALLENGE_STATUS = "OPTIONAL QUALITY COMPARISON; NO AUTOMATIC REPLACEMENT"
LARGE_GENERATION_CUTOFF = datetime.fromisoformat("2026-09-05T08:10:56+00:00")
SEEDS = (1600033, 1700039)
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

PYTHON = TOOLING_ROOT / ".phase2-venv-py312/bin/python"
CODE_ROOT = TOOLING_ROOT / "stable-audio-3"
SCRIPT = CODE_ROOT / "optimized/mlx/scripts/sa3_mlx.py"
MODEL_DIR = CODE_ROOT / "optimized/mlx/models/mlx"
SOURCE_WEIGHT_ROOT = TOOLING_ROOT / "stable-audio-3-medium-weights/MLX"
SMALL_WEIGHT_ROOT = TOOLING_ROOT / "stable-audio-3-weights/MLX"
EXPECTED_CODE_COMMIT = "c3909628db1ae2b57bed40a493c73c67ad674dc5"
OPTIMIZED_REPOSITORY = "stabilityai/stable-audio-3-optimized"
OPTIMIZED_REVISION = "da6edc54ddba10bfd79a077102ded687f80e882b"
WEIGHTS = {
    "dit_medium_f16.npz": {
        "source": SOURCE_WEIGHT_ROOT / "dit_medium_f16.npz",
        "bytes": 2_907_300_946,
        "sha256": "f9e5647ea3225818657d47d47ae4b34afa29c0568206ca89566c1a758944a38e",
    },
    "same_l_decoder_f32.npz": {
        "source": SOURCE_WEIGHT_ROOT / "same_l_decoder_f32.npz",
        "bytes": 1_704_311_976,
        "sha256": "84924be2122d3a20fce443f40b782d9cd88e8e73707476326003ac47659a2287",
    },
    "t5gemma_f16.npz": {
        "source": SMALL_WEIGHT_ROOT / "t5gemma_f16.npz",
        "bytes": 567_443_068,
        "sha256": "8deb20489f36d9aec539f26c9c67321f99bc5fe300d470435ed6e76be4f16bbd",
    },
}
GENERATION_TUPLE = {
    "code_repository": "Stability-AI/stable-audio-3",
    "code_commit": EXPECTED_CODE_COMMIT,
    "backend": "Apple MLX / Metal",
    "model_family": "Stable Audio 3 Medium",
    "optimized_weights_repository": OPTIMIZED_REPOSITORY,
    "optimized_weights_revision": OPTIMIZED_REVISION,
    "dit": "medium",
    "decoder": "same-l",
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

SHORTLIST = MARATHON_ROOT / "05_shortlists/provisional-machine-shortlist.csv"
CANONICAL_PROMPTS = MARATHON_ROOT / "01_catalogue/nine-epoch-small-music-prompt-catalogue.csv"
SMALL_JURY = MARATHON_ROOT / "03_analysis/shortlist-ready-all-candidates-v3-machine-jury-final-v2.csv"
PLAN_CSV = MARATHON_ROOT / "01_catalogue/medium-challenge-plan.csv"
COMMANDS_PATH = MARATHON_ROOT / "01_catalogue/medium-challenge-commands.jsonl"
INVENTORY_PATH = MARATHON_ROOT / "01_catalogue/medium-challenge-inventory.csv"
PROMPT_REGISTER = MARATHON_ROOT / "01_catalogue/medium-challenge-machine-jury-prompt-register-36.csv"
PROVENANCE_ROOT = MARATHON_ROOT / "09_provenance/medium-challenge"
PLAN_JSON = PROVENANCE_ROOT / "medium-challenge-plan.json"
ROUTE_JSON = PROVENANCE_ROOT / "medium-generation-route.json"
INTEGRITY_JSON = PROVENANCE_ROOT / "medium-challenge-integrity-manifest.json"
RAW_ROOT = MARATHON_ROOT / "02_raw/medium-challenge"
LOG_ROOT = MARATHON_ROOT / "10_logs/generation/medium-challenge"
GEN_LOG = LOG_ROOT / "medium-generation.jsonl"
ANALYSIS_ROOT = MARATHON_ROOT / "03_analysis/medium-challenge"
SCREEN_CACHE = ANALYSIS_ROOT / "cache/screening-v3"
SCREEN_CSV = ANALYSIS_ROOT / "screening-v3-technical.csv"
SCREEN_DETAILS = ANALYSIS_ROOT / "screening-v3-technical-details.jsonl"
SCREEN_SUMMARY = ANALYSIS_ROOT / "screening-v3-technical-summary.json"
JURY_READY = ANALYSIS_ROOT / "screening-v3-jury-ready-inventory.csv"
JURY_OUTPUT = ANALYSIS_ROOT / "machine-jury.csv"
JURY_RUN = ANALYSIS_ROOT / "machine-jury-run.json"
COMPARISON_CSV = ANALYSIS_ROOT / "small-vs-medium-comparison.csv"
COMPARISON_JSON = ANALYSIS_ROOT / "small-vs-medium-comparison.json"
JURY_PYTHON = MARATHON_ROOT / "03_analysis/.jury-venv/bin/python"
JURY_SCRIPT = Path(__file__).with_name("machine_jury.py")


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def csv_text(rows: list[dict[str, Any]], fields: list[str]) -> str:
    buffer = io.StringIO(newline="")
    writer = csv.DictWriter(buffer, fieldnames=fields, extrasaction="ignore", lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()


def truth(value: Any) -> bool:
    return str(value).strip().lower() in {"true", "1", "yes", "pass", "passed"}


def number(row: dict[str, Any], key: str) -> float:
    try:
        value = float(row.get(key, ""))
    except (TypeError, ValueError):
        return math.nan
    return value if math.isfinite(value) else math.nan


def append_jsonl(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor = os.open(path, os.O_WRONLY | os.O_APPEND | os.O_CREAT, 0o644)
    try:
        os.write(descriptor, (json.dumps(value, sort_keys=True, ensure_ascii=False) + "\n").encode("utf-8"))
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def stable_processes() -> list[str]:
    completed = subprocess.run(
        ["ps", "-axo", "pid=,ppid=,command="], check=True, capture_output=True, text=True
    )
    return [line.strip() for line in completed.stdout.splitlines() if "sa3_mlx.py" in line.lower()]


def validate_wav(path: Path) -> dict[str, Any]:
    if path.is_symlink():
        raise RuntimeError(f"raw Medium output may not be a symlink: {path}")
    info = sf.info(path)
    if (
        info.format != "WAV"
        or info.subtype != "PCM_16"
        or info.channels != 2
        or info.samplerate != 44_100
        or info.frames != 5_292_000
        or abs(info.duration - 120.0) > 1e-6
    ):
        raise RuntimeError(f"Medium output format mismatch: {path}: {info}")
    return {
        "bytes": path.stat().st_size,
        "sha256": sha256_file(path),
        "format": info.format,
        "subtype": info.subtype,
        "channels": info.channels,
        "sample_rate": info.samplerate,
        "frames": info.frames,
        "duration_seconds": info.duration,
    }


def source_plan() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    shortlist_rows = read_csv(SHORTLIST)
    picks = [row for row in shortlist_rows if row.get("shortlist_role") == "PROVISIONAL PICK 1"]
    picks.sort(key=lambda row: int(row["epoch_order"]))
    if len(picks) != 9 or tuple(row["epoch_alias"] for row in picks) != EPOCHS:
        raise RuntimeError("shortlist must provide exactly one ordered PICK-01 source per epoch")
    if any(row.get("role_type") != "PRIMARY" for row in picks):
        raise RuntimeError("PICK-01 source is not a primary shortlist row")

    prompt_rows = read_csv(CANONICAL_PROMPTS)
    canonical: dict[str, dict[str, str]] = {}
    prompt_register: list[dict[str, str]] = []
    for row in prompt_rows:
        prompt_id = row["prompt_id"]
        normalized = {
            "prompt_id": prompt_id,
            "epoch": row["epoch_alias"],
            "epoch_alias": row["epoch_alias"],
            "family": row["family_name"],
            "prompt_family": row["family_name"],
            "family_name": row["family_name"],
            "positive_prompt": row["positive_prompt"],
            "negative_prompt": row["negative_prompt"],
            "source_prompt_provenance": row.get("source_prompt_provenance", ""),
            "status": RIGHTS_STATUS,
        }
        if prompt_id in canonical:
            if canonical[prompt_id] != normalized:
                raise RuntimeError(f"conflicting canonical prompt family rows: {prompt_id}")
            continue
        canonical[prompt_id] = normalized
        prompt_register.append(normalized)
    prompt_register.sort(key=lambda row: (EPOCHS.index(row["epoch"]), row["prompt_id"]))
    if len(prompt_register) != 36:
        raise RuntimeError(f"expected 36 canonical prompt families, found {len(prompt_register)}")
    if any(sum(row["epoch"] == epoch for row in prompt_register) != 4 for epoch in EPOCHS):
        raise RuntimeError("canonical prompt register is not four families per epoch")

    rows: list[dict[str, Any]] = []
    for pick in picks:
        family_id = pick["family_id"]
        prompt = canonical.get(family_id)
        if not prompt or prompt["epoch"] != pick["epoch_alias"]:
            raise RuntimeError(f"PICK-01 prompt does not resolve canonically: {pick['candidate_id']}")
        if sha256_file(Path(pick["source_path"])) != pick["source_sha256"]:
            raise RuntimeError(f"PICK-01 source hash mismatch: {pick['candidate_id']}")
        for seed in SEEDS:
            candidate_id = f"{family_id}-MED__seed-{seed}"
            output = RAW_ROOT / pick["epoch_alias"] / f"{candidate_id}.wav"
            rows.append(
                {
                    "epoch_order": int(pick["epoch_order"]),
                    "epoch": pick["epoch_alias"],
                    "epoch_alias": pick["epoch_alias"],
                    "candidate_id": candidate_id,
                    "prompt_id": family_id,
                    "prompt_family": prompt["family_name"],
                    "seed": seed,
                    "positive_prompt": prompt["positive_prompt"],
                    "negative_prompt": prompt["negative_prompt"],
                    "small_pick1_candidate_id": pick["candidate_id"],
                    "small_pick1_source_path": pick["source_path"],
                    "small_pick1_source_sha256": pick["source_sha256"],
                    "planned_output": str(output),
                    "status": "PLANNED",
                    "rights_status": RIGHTS_STATUS,
                }
            )
    if len(rows) != 18 or len({row["candidate_id"] for row in rows}) != 18:
        raise RuntimeError("Medium plan did not reconcile 18 unique candidates")
    return rows, prompt_register


def build_argv(row: dict[str, Any], output: Path) -> list[str]:
    return [
        str(PYTHON),
        str(SCRIPT.relative_to(TOOLING_ROOT)),
        "--prompt",
        row["positive_prompt"],
        "--negative-prompt",
        row["negative_prompt"],
        "--dit",
        "medium",
        "--decoder",
        "same-l",
        "--seconds",
        "120",
        "--steps",
        "8",
        "--seed",
        str(row["seed"]),
        "--init-noise-level",
        "1.0",
        "--cfg",
        "2.0",
        "--apg",
        "1.0",
        "--dit-dtype",
        "fp16",
        "--free-models",
        "--out",
        str(output),
    ]


def plan() -> list[dict[str, Any]]:
    rows, prompt_register = source_plan()
    plan_fields = list(rows[0])
    plan_text = csv_text(rows, plan_fields)
    command_lines = []
    for row in rows:
        command_lines.append(
            json.dumps(
                {
                    **row,
                    "cwd": str(TOOLING_ROOT),
                    "argv": build_argv(row, Path(row["planned_output"])),
                    "environment_safe": {
                        "HF_HUB_OFFLINE": "1",
                        "HF_HUB_DISABLE_TELEMETRY": "1",
                        "TRANSFORMERS_OFFLINE": "1",
                    },
                    "generation_tuple": GENERATION_TUPLE,
                },
                ensure_ascii=False,
                sort_keys=True,
            )
        )
    commands_text = "\n".join(command_lines) + "\n"
    prompt_text = csv_text(prompt_register, list(prompt_register[0]))
    for path, text in (
        (PLAN_CSV, plan_text),
        (COMMANDS_PATH, commands_text),
        (PROMPT_REGISTER, prompt_text),
    ):
        if path.exists() and path.read_text(encoding="utf-8") != text:
            raise RuntimeError(f"locked Medium plan differs; refusing rewrite: {path}")
        atomic_write_text(path, text)
    atomic_write_json(
        PLAN_JSON,
        {
            "generated_utc": utc_now(),
            "tool_version": TOOL_VERSION,
            "status": "PLANNED",
            "selection_law": "PICK-01 PROMPT FAMILY PER EPOCH; TWO FIXED FRESH SEEDS",
            "counts": {"epochs": 9, "families": 9, "seeds": 2, "planned_raw": 18},
            "fixed_seeds": list(SEEDS),
            "inputs": {
                "shortlist": {"path": str(SHORTLIST), "sha256": sha256_file(SHORTLIST)},
                "canonical_prompts": {"path": str(CANONICAL_PROMPTS), "sha256": sha256_file(CANONICAL_PROMPTS)},
            },
            "outputs": {
                "plan": {"path": str(PLAN_CSV), "sha256": sha256_file(PLAN_CSV)},
                "commands": {"path": str(COMMANDS_PATH), "sha256": sha256_file(COMMANDS_PATH)},
                "jury_prompt_register": {"path": str(PROMPT_REGISTER), "sha256": sha256_file(PROMPT_REGISTER)},
            },
            "automatic_small_replacement": "FORBIDDEN",
            "classification": CHALLENGE_STATUS,
            "rights_status": RIGHTS_STATUS,
        },
    )
    return rows


def validate_and_link_route() -> dict[str, Any]:
    head = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=CODE_ROOT, check=True, capture_output=True, text=True
    ).stdout.strip()
    if head != EXPECTED_CODE_COMMIT:
        raise RuntimeError(f"Stable Audio code commit mismatch: {head}")
    if not SCRIPT.is_file() or not PYTHON.is_file():
        raise RuntimeError("pinned generator script or isolated Python is missing")
    version = subprocess.run([str(PYTHON), "--version"], check=True, capture_output=True, text=True)
    if "3.12.14" not in version.stdout + version.stderr:
        raise RuntimeError("unexpected generator Python version")
    weight_rows = []
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    for name, spec in WEIGHTS.items():
        source = Path(spec["source"])
        if not source.is_file() or source.is_symlink():
            raise FileNotFoundError(f"pinned source weight missing or symlinked: {source}")
        if source.stat().st_size != spec["bytes"] or sha256_file(source) != spec["sha256"]:
            raise RuntimeError(f"pinned source weight mismatch: {name}")
        target = MODEL_DIR / name
        if target.exists() or target.is_symlink():
            if not target.is_file() or target.stat().st_size != spec["bytes"] or sha256_file(target) != spec["sha256"]:
                raise RuntimeError(f"existing MLX model target differs; refusing overwrite: {target}")
            action = "VERIFIED_EXISTING"
        else:
            os.link(source, target)
            if target.stat().st_size != spec["bytes"] or sha256_file(target) != spec["sha256"]:
                raise RuntimeError(f"new Medium hardlink verification failed: {target}")
            action = "HARDLINKED_IF_ABSENT"
        weight_rows.append(
            {
                "name": name,
                "source": str(source),
                "target": str(target),
                "bytes": spec["bytes"],
                "sha256": spec["sha256"],
                "link_action": action,
                "source_inode": source.stat().st_ino,
                "target_inode": target.stat().st_ino,
            }
        )
    license_specs = (
        ("Stability AI Community License Agreement", TOOLING_ROOT / "stable-audio-3-medium-weights/LICENSE.md"),
        ("Gemma Terms of Use", TOOLING_ROOT / "stable-audio-3-medium-weights/LICENSE_GEMMA.md"),
    )
    license_files = []
    for license_name, license_path in license_specs:
        if not license_path.is_file():
            raise FileNotFoundError(f"official Medium license file missing: {license_path}")
        license_files.append(
            {
                "license": license_name,
                "path": str(license_path),
                "bytes": license_path.stat().st_size,
                "sha256": sha256_file(license_path),
            }
        )
    record = {
        "validated_utc": utc_now(),
        "status": "PASS",
        "code_commit": head,
        "python": (version.stdout + version.stderr).strip(),
        "optimized_weights_repository": OPTIMIZED_REPOSITORY,
        "optimized_weights_revision": OPTIMIZED_REVISION,
        "official_license_files": license_files,
        "text_only_encoder_policy": "SAME-L ENCODER NOT LOADED OR DOWNLOADED; --init-audio IS ABSENT",
        "generation_tuple": GENERATION_TUPLE,
        "weights": weight_rows,
        "rights_status": RIGHTS_STATUS,
    }
    atomic_write_json(ROUTE_JSON, record)
    return record


def read_logs() -> dict[str, list[dict[str, Any]]]:
    records: dict[str, list[dict[str, Any]]] = defaultdict(list)
    if GEN_LOG.is_file():
        for line_number, line in enumerate(GEN_LOG.read_text(encoding="utf-8").splitlines(), start=1):
            try:
                record = json.loads(line)
            except json.JSONDecodeError as error:
                raise RuntimeError(f"malformed Medium generation log line {line_number}") from error
            records[record["candidate_id"]].append(record)
    return records


def build_inventory(plan_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    logs = read_logs()
    rows = []
    for planned in plan_rows:
        successes = [row for row in logs.get(planned["candidate_id"], []) if row.get("status") == "SUCCESS"]
        if len(successes) != 1:
            continue
        record = successes[0]
        path = Path(record["output"])
        metrics = validate_wav(path)
        if metrics["sha256"] != record["output_sha256"] or metrics["bytes"] != record["output_bytes"]:
            raise RuntimeError(f"Medium log/raw mismatch: {planned['candidate_id']}")
        rows.append(
            {
                "absolute_path": str(path),
                "bytes": metrics["bytes"],
                "sha256": metrics["sha256"],
                "candidate_id": planned["candidate_id"],
                "epoch": planned["epoch"],
                "epoch_alias": planned["epoch"],
                "prompt_id": planned["prompt_id"],
                "prompt_family": planned["prompt_family"],
                "seed": planned["seed"],
                "small_pick1_candidate_id": planned["small_pick1_candidate_id"],
                "small_pick1_source_path": planned["small_pick1_source_path"],
                "small_pick1_source_sha256": planned["small_pick1_source_sha256"],
                "generation_tuple": json.dumps(GENERATION_TUPLE, sort_keys=True, separators=(",", ":")),
                "screening_status": "PENDING_MEDIUM_SCREENING_V3",
                "screening_gate": "V3_MEDIUM_CHALLENGE_PENDING",
                "analysis_status": SIGNAL_STATUS,
                "rights_status": RIGHTS_STATUS,
            }
        )
    fields = list(rows[0]) if rows else ["absolute_path", "bytes", "sha256", "candidate_id"]
    atomic_write_text(INVENTORY_PATH, csv_text(rows, fields))
    return rows


def generate() -> None:
    if datetime.now(timezone.utc) >= LARGE_GENERATION_CUTOFF:
        raise RuntimeError("hour-84 large-generation cutoff reached")
    plan_rows = plan()
    validate_and_link_route()
    require_generation_safety()
    if stable_processes():
        raise RuntimeError("another Stable Audio inference process is active")
    environment = os.environ.copy()
    environment.update(
        {"HF_HUB_OFFLINE": "1", "HF_HUB_DISABLE_TELEMETRY": "1", "TRANSFORMERS_OFFLINE": "1"}
    )
    logs = read_logs()
    for index, planned in enumerate(plan_rows, start=1):
        candidate_id = planned["candidate_id"]
        output = Path(planned["planned_output"])
        successes = [row for row in logs.get(candidate_id, []) if row.get("status") == "SUCCESS"]
        if successes:
            if len(successes) != 1 or not output.is_file() or validate_wav(output)["sha256"] != successes[0]["output_sha256"]:
                raise RuntimeError(f"invalid Medium resume state: {candidate_id}")
            print(f"[{index:02d}/18] VERIFIED-SKIP {candidate_id}", flush=True)
            continue
        if logs.get(candidate_id):
            raise RuntimeError(f"prior failed Medium attempt is preserved and may not be repeated identically: {candidate_id}")
        if output.exists() or output.is_symlink():
            raise FileExistsError(f"unlogged Medium raw destination exists: {output}")
        if datetime.now(timezone.utc) >= LARGE_GENERATION_CUTOFF:
            raise RuntimeError("hour-84 cutoff reached during Medium queue")
        require_generation_safety()
        active = stable_processes()
        if active:
            raise RuntimeError("parallel Stable Audio inference is forbidden: " + " | ".join(active))
        if retained_bytes() + 22_000_000 >= DISK_CAP_BYTES:
            raise RuntimeError("predictive 80 GiB marathon disk cap reached")
        output.parent.mkdir(parents=True, exist_ok=True)
        descriptor, temporary_name = tempfile.mkstemp(prefix=f".{candidate_id}.", suffix=".wav", dir=output.parent)
        os.close(descriptor)
        temporary = Path(temporary_name)
        temporary.unlink()
        argv = build_argv(planned, temporary)
        stdout_path = LOG_ROOT / "candidates" / f"{candidate_id}.stdout.txt"
        stderr_path = LOG_ROOT / "candidates" / f"{candidate_id}.stderr.txt"
        if stdout_path.exists() or stderr_path.exists():
            raise FileExistsError(f"unlogged Medium attempt log already exists: {candidate_id}")
        started = utc_now()
        print(f"[{index:02d}/18] START {candidate_id}", flush=True)
        completed = subprocess.run(
            argv,
            cwd=TOOLING_ROOT,
            env=environment,
            capture_output=True,
            text=True,
            check=False,
            preexec_fn=lambda: os.nice(10),
        )
        atomic_write_text(stdout_path, completed.stdout)
        atomic_write_text(stderr_path, completed.stderr)
        record: dict[str, Any] = {
            **planned,
            "generation_tuple": GENERATION_TUPLE,
            "argv": argv,
            "cwd": str(TOOLING_ROOT),
            "environment_safe": {
                "HF_HUB_OFFLINE": "1",
                "HF_HUB_DISABLE_TELEMETRY": "1",
                "TRANSFORMERS_OFFLINE": "1",
            },
            "process_priority_nice": 10,
            "started_utc": started,
            "ended_utc": utc_now(),
            "return_code": completed.returncode,
            "stdout": {"path": str(stdout_path), "sha256": sha256_file(stdout_path)},
            "stderr": {"path": str(stderr_path), "sha256": sha256_file(stderr_path)},
        }
        if completed.returncode != 0:
            failed_path = LOG_ROOT / "failed-generation-artifacts" / f"{candidate_id}.wav"
            if temporary.exists():
                failed_path.parent.mkdir(parents=True, exist_ok=True)
                os.link(temporary, failed_path)
                os.chmod(failed_path, 0o444)
                temporary.unlink()
            record.update(
                {
                    "status": "FAILED",
                    "error": f"generator returned {completed.returncode}",
                    "preserved_partial": str(failed_path) if failed_path.exists() else None,
                }
            )
            append_jsonl(GEN_LOG, record)
            raise RuntimeError(record["error"] + f" for {candidate_id}")
        metrics = validate_wav(temporary)
        os.link(temporary, output)
        os.chmod(output, 0o444)
        temporary.unlink()
        record.update(
            {"status": "SUCCESS", "output": str(output), **{f"output_{key}": value for key, value in metrics.items()}}
        )
        append_jsonl(GEN_LOG, record)
        logs[candidate_id].append(record)
        print(f"[{index:02d}/18] DONE {candidate_id} {metrics['sha256'][:12]}", flush=True)
    inventory = build_inventory(plan_rows)
    if len(inventory) != 18 or len({row["candidate_id"] for row in inventory}) != 18 or len({row["sha256"] for row in inventory}) != 18:
        raise RuntimeError("Medium generation did not reconcile 18 unique raw candidates")
    atomic_write_json(
        LOG_ROOT / "generation-summary.json",
        {
            "generated_utc": utc_now(),
            "status": "PASS",
            "raw_candidates": 18,
            "duration_seconds_each": 120,
            "total_audio_seconds": 2160,
            "inventory": {"path": str(INVENTORY_PATH), "sha256": sha256_file(INVENTORY_PATH)},
            "generation_log": {"path": str(GEN_LOG), "sha256": sha256_file(GEN_LOG)},
            "automatic_small_replacement": "FORBIDDEN",
            "rights_status": RIGHTS_STATUS,
        },
    )


def screen() -> None:
    inventory = read_csv(INVENTORY_PATH)
    if len(inventory) != 18:
        raise RuntimeError("Medium inventory must contain exactly 18 rows")
    fingerprints: dict[str, tuple[np.ndarray, np.ndarray]] = {}
    output_rows: list[dict[str, Any]] = []
    detail_lines = []
    for index, item in enumerate(inventory, start=1):
        path = Path(item["absolute_path"])
        if sha256_file(path) != item["sha256"]:
            raise RuntimeError(f"Medium source hash mismatch: {item['candidate_id']}")
        metrics, spectral, envelope = analyze_audio(path, item["sha256"], SCREEN_CACHE)
        fingerprints[item["candidate_id"]] = (spectral, envelope)
        source_path = Path(item["small_pick1_source_path"])
        if sha256_file(source_path) != item["small_pick1_source_sha256"]:
            raise RuntimeError(f"Small PICK-01 comparison source hash mismatch: {item['small_pick1_candidate_id']}")
        _, small_spectral, small_envelope = analyze_audio(source_path, item["small_pick1_source_sha256"], SCREEN_CACHE)
        compatible = spectral.shape == small_spectral.shape and spectral.size > 1
        source_spectral = float(np.dot(spectral, small_spectral)) if compatible else math.nan
        source_envelope = (
            float(np.dot(envelope, small_envelope))
            if compatible and envelope.shape == small_envelope.shape
            else math.nan
        )
        reasons = list(metrics.get("base_failure_reasons", []))
        if item["sha256"] == item["small_pick1_source_sha256"]:
            reasons.append(f"EXACT_DUPLICATE_OF_SMALL_SOURCE:{item['small_pick1_candidate_id']}")
        elif (
            math.isfinite(source_spectral)
            and math.isfinite(source_envelope)
            and source_spectral >= NEAR_DUPLICATE_FINGERPRINT_COSINE
            and source_envelope >= NEAR_DUPLICATE_ENVELOPE_CORRELATION
        ):
            reasons.append(f"NEAR_DUPLICATE_OF_SMALL_SOURCE:{item['small_pick1_candidate_id']}")
        passed = not reasons
        output_rows.append(
            {
                **item,
                "technical_automatic_pass": str(passed).upper(),
                "screening_status": "MACHINE_ELIGIBLE" if passed else "MACHINE_REJECTED",
                "automatic_failure_reasons": ";".join(sorted(set(reasons))),
                "technical_warnings": ";".join(metrics.get("technical_warnings", [])),
                "measurement_status": metrics.get("analysis_status", ""),
                **{
                    key: value
                    for key, value in metrics.items()
                    if key not in {"analysis_status", "base_failure_reasons", "technical_warnings"}
                },
                "small_source_fingerprint_cosine": source_spectral,
                "small_source_envelope_correlation": source_envelope,
                "screening_version": SCREENING_VERSION,
                "analysis_status": SIGNAL_STATUS,
                "rights_status": RIGHTS_STATUS,
            }
        )
        detail_lines.append(
            json.dumps(
                {
                    "candidate_id": item["candidate_id"],
                    "source_sha256": item["sha256"],
                    "small_pick1_candidate_id": item["small_pick1_candidate_id"],
                    "fresh_v3_metrics": metrics,
                    "technical_reasons_before_medium_cross_duplicate_check": reasons,
                    "analysis_status": SIGNAL_STATUS,
                    "rights_status": RIGHTS_STATUS,
                },
                sort_keys=True,
                allow_nan=False,
            )
        )
        print(f"[{index:02d}/18] SCREEN {item['candidate_id']} {'PASS' if passed else 'FAIL'}", flush=True)

    # Reject only the later Medium row in an exact/near duplicate pair.
    for left_index, left in enumerate(inventory):
        for right in inventory[left_index + 1 :]:
            ls, le = fingerprints[left["candidate_id"]]
            rs, re = fingerprints[right["candidate_id"]]
            compatible = ls.shape == rs.shape and ls.size > 1
            spectral_score = float(np.dot(ls, rs)) if compatible else math.nan
            envelope_score = float(np.dot(le, re)) if compatible and le.shape == re.shape else math.nan
            exact = left["sha256"] == right["sha256"]
            near = (
                not exact
                and math.isfinite(spectral_score)
                and math.isfinite(envelope_score)
                and spectral_score >= NEAR_DUPLICATE_FINGERPRINT_COSINE
                and envelope_score >= NEAR_DUPLICATE_ENVELOPE_CORRELATION
            )
            if exact or near:
                loser = next(row for row in output_rows if row["candidate_id"] == right["candidate_id"])
                reason = "EXACT_DUPLICATE_OF_MEDIUM" if exact else "NEAR_DUPLICATE_OF_MEDIUM"
                reasons = [value for value in loser["automatic_failure_reasons"].split(";") if value]
                reasons.append(f"{reason}:{left['candidate_id']}")
                loser["automatic_failure_reasons"] = ";".join(sorted(set(reasons)))
                loser["technical_automatic_pass"] = "FALSE"
                loser["screening_status"] = "MACHINE_REJECTED"

    atomic_write_text(SCREEN_CSV, csv_text(output_rows, list(output_rows[0])))
    atomic_write_text(SCREEN_DETAILS, "\n".join(detail_lines) + "\n")
    jury_rows = []
    for item, screened in zip(inventory, output_rows, strict=True):
        if screened["technical_automatic_pass"] == "TRUE":
            jury_rows.append(
                {
                    **item,
                    "screening_status": "MACHINE_ELIGIBLE",
                    "screening_gate": "V3_MEDIUM_CHALLENGE",
                    "technical_automatic_pass": "TRUE",
                    "technical_failure_reasons": "",
                    "analysis_status": SIGNAL_STATUS,
                    "rights_status": RIGHTS_STATUS,
                }
            )
    fields = list(jury_rows[0]) if jury_rows else list(inventory[0])
    atomic_write_text(JURY_READY, csv_text(jury_rows, fields))
    atomic_write_json(
        SCREEN_SUMMARY,
        {
            "generated_utc": utc_now(),
            "tool_version": TOOL_VERSION,
            "screening_version": SCREENING_VERSION,
            "status": "PASS",
            "classification": SIGNAL_STATUS,
            "counts": {
                "rendered": 18,
                "technical_eligible": len(jury_rows),
                "technical_rejected": 18 - len(jury_rows),
            },
            "outputs": {
                "technical": {"path": str(SCREEN_CSV), "sha256": sha256_file(SCREEN_CSV)},
                "jury_ready": {"path": str(JURY_READY), "sha256": sha256_file(JURY_READY)},
            },
            "automatic_small_replacement": "FORBIDDEN",
            "limitations": [
                "Screening V3 is deterministic analysis, not human listening.",
                "Endpoint equality alone is not a clipping failure under the pinned MLX writer.",
                "No automatic gate establishes rights or cultural clearance.",
            ],
            "rights_status": RIGHTS_STATUS,
        },
    )


def jury() -> None:
    inventory = read_csv(JURY_READY)
    expected = len(inventory)
    if expected < 1 or expected > 18:
        raise RuntimeError(f"invalid Medium jury-ready count: {expected}")
    if len(read_csv(PROMPT_REGISTER)) != 36:
        raise RuntimeError("Medium jury prompt register must contain 36 canonical families")
    if not JURY_PYTHON.is_file() or not JURY_SCRIPT.is_file():
        raise RuntimeError("offline jury runtime or script is missing")
    environment = os.environ.copy()
    environment.update(
        {"HF_HUB_OFFLINE": "1", "HF_HUB_DISABLE_TELEMETRY": "1", "TRANSFORMERS_OFFLINE": "1"}
    )
    argv = [
        str(JURY_PYTHON),
        str(JURY_SCRIPT),
        "--inventory",
        str(JURY_READY),
        "--prompts",
        str(PROMPT_REGISTER),
        "--output",
        str(JURY_OUTPUT),
        "--screening-csv",
        str(SCREEN_CSV),
        "--expected-count",
        str(expected),
    ]
    completed = subprocess.run(
        argv, cwd=JURY_SCRIPT.parent, env=environment, capture_output=True, text=True, check=False
    )
    stdout = ANALYSIS_ROOT / "machine-jury.stdout.txt"
    stderr = ANALYSIS_ROOT / "machine-jury.stderr.txt"
    atomic_write_text(stdout, completed.stdout)
    atomic_write_text(stderr, completed.stderr)
    if completed.returncode != 0:
        raise RuntimeError(f"Medium offline CLAP jury failed ({completed.returncode}): {completed.stderr[-3000:]}")
    rows = read_csv(JURY_OUTPUT)
    if len(rows) != expected:
        raise RuntimeError("Medium jury output count mismatch")
    atomic_write_json(
        JURY_RUN,
        {
            "generated_utc": utc_now(),
            "status": "PASS",
            "classification": SIGNAL_STATUS,
            "argv": argv,
            "environment_safe": {
                "HF_HUB_OFFLINE": "1",
                "HF_HUB_DISABLE_TELEMETRY": "1",
                "TRANSFORMERS_OFFLINE": "1",
            },
            "candidate_count": expected,
            "prompt_register_count": 36,
            "output": {"path": str(JURY_OUTPUT), "sha256": sha256_file(JURY_OUTPUT)},
            "stdout": {"path": str(stdout), "sha256": sha256_file(stdout)},
            "stderr": {"path": str(stderr), "sha256": sha256_file(stderr)},
            "rights_status": RIGHTS_STATUS,
        },
    )


def compare() -> None:
    inventory = read_csv(INVENTORY_PATH)
    screens = {row["candidate_id"]: row for row in read_csv(SCREEN_CSV)}
    juries = {row["candidate_id"]: row for row in read_csv(JURY_OUTPUT)} if JURY_OUTPUT.is_file() else {}
    small_jury = {row["candidate_id"]: row for row in read_csv(SMALL_JURY)}
    metric_names = (
        "machine_score",
        "semantic_composite_signal",
        "technical_composite_signal",
        "prompt_text_alignment_signal",
        "commissioning_family_alignment_signal",
        "era_description_alignment_signal",
        "management_session_suitability_proxy",
        "period_association_proxy",
        "stereotype_parody_risk_signal",
        "vocal_likelihood_signal",
        "speech_likelihood_signal",
    )
    rows: list[dict[str, Any]] = []
    for item in inventory:
        screen_row = screens[item["candidate_id"]]
        medium = juries.get(item["candidate_id"])
        small = small_jury.get(item["small_pick1_candidate_id"])
        if not small or small.get("prompt_id") != item["prompt_id"]:
            raise RuntimeError(f"matching Small jury source missing: {item['small_pick1_candidate_id']}")
        row: dict[str, Any] = {
            "epoch_order": EPOCHS.index(item["epoch"]) + 1,
            "epoch": item["epoch"],
            "prompt_id": item["prompt_id"],
            "prompt_family": item["prompt_family"],
            "small_candidate_id": small["candidate_id"],
            "small_source_sha256": small["source_sha256"],
            "small_seed": small["seed"],
            "medium_candidate_id": item["candidate_id"],
            "medium_source_sha256": item["sha256"],
            "medium_seed": item["seed"],
            "medium_technical_automatic_pass": screen_row["technical_automatic_pass"],
            "medium_technical_failure_reasons": screen_row["automatic_failure_reasons"],
            "medium_severe_machine_mismatch": medium.get("severe_machine_mismatch", "") if medium else "",
            "medium_mismatch_reasons": medium.get("mismatch_reasons", "") if medium else "",
        }
        for metric in metric_names:
            small_value = number(small, metric)
            medium_value = number(medium, metric) if medium else math.nan
            row[f"small_{metric}"] = "" if math.isnan(small_value) else round(small_value, 8)
            row[f"medium_{metric}"] = "" if math.isnan(medium_value) else round(medium_value, 8)
            row[f"delta_medium_minus_small_{metric}"] = (
                "" if math.isnan(small_value) or math.isnan(medium_value) else round(medium_value - small_value, 8)
            )
        if screen_row["technical_automatic_pass"] != "TRUE":
            outcome = "MEDIUM_TECHNICAL_REJECT; KEEP BOTH; NO REPLACEMENT"
        elif not medium:
            outcome = "MEDIUM_JURY_UNAVAILABLE; KEEP BOTH; NO REPLACEMENT"
        elif truth(medium.get("severe_machine_mismatch")):
            outcome = "MEDIUM_SEVERE_JURY_MISMATCH; KEEP BOTH; NO REPLACEMENT"
        elif number(medium, "machine_score") > number(small, "machine_score"):
            outcome = "MEDIUM_HIGHER_COMPOSITE_SIGNAL; OWNER AUDITION REQUIRED; NO REPLACEMENT"
        else:
            outcome = "SMALL_EQUAL_OR_HIGHER_COMPOSITE_SIGNAL; OWNER AUDITION REQUIRED; NO REPLACEMENT"
        row.update(
            {
                "comparison_outcome": outcome,
                "small_preserved": "TRUE",
                "medium_preserved": "TRUE",
                "automatic_shortlist_replacement": "FORBIDDEN",
                "analysis_status": SIGNAL_STATUS,
                "rights_status": RIGHTS_STATUS,
            }
        )
        rows.append(row)
    rows.sort(key=lambda row: (int(row["epoch_order"]), int(row["medium_seed"])))
    if len(rows) != 18:
        raise RuntimeError("Small-vs-Medium comparison did not reconcile 18 rows")
    atomic_write_text(COMPARISON_CSV, csv_text(rows, list(rows[0])))
    per_epoch = []
    for epoch in EPOCHS:
        epoch_rows = [row for row in rows if row["epoch"] == epoch]
        eligible = [
            row
            for row in epoch_rows
            if row["medium_technical_automatic_pass"] == "TRUE"
            and row["medium_severe_machine_mismatch"] != "TRUE"
            and row["medium_machine_score"] != ""
        ]
        best = max(eligible, key=lambda row: float(row["medium_machine_score"])) if eligible else None
        per_epoch.append(
            {
                "epoch": epoch,
                "medium_rendered": 2,
                "medium_machine_eligible": len(eligible),
                "best_medium_candidate_id": best["medium_candidate_id"] if best else "",
                "best_medium_machine_score": best["medium_machine_score"] if best else "",
                "small_pick1_candidate_id": epoch_rows[0]["small_candidate_id"],
                "small_pick1_machine_score": epoch_rows[0]["small_machine_score"],
                "owner_audition_required": True,
            }
        )
    summary = {
        "generated_utc": utc_now(),
        "tool_version": TOOL_VERSION,
        "status": "PASS",
        "classification": SIGNAL_STATUS,
        "counts": {
            "epochs": 9,
            "small_sources": 9,
            "medium_rendered": 18,
            "medium_technical_eligible": sum(row["medium_technical_automatic_pass"] == "TRUE" for row in rows),
            "medium_technical_rejected": sum(row["medium_technical_automatic_pass"] != "TRUE" for row in rows),
            "medium_severe_machine_mismatch": sum(row["medium_severe_machine_mismatch"] == "TRUE" for row in rows),
            "medium_no_severe_machine_eligible": sum(
                row["medium_technical_automatic_pass"] == "TRUE"
                and row["medium_severe_machine_mismatch"] != "TRUE"
                for row in rows
            ),
            "medium_higher_composite_signal": sum(row["comparison_outcome"].startswith("MEDIUM_HIGHER") for row in rows),
        },
        "per_epoch": per_epoch,
        "inputs": {
            "small_jury": {"path": str(SMALL_JURY), "sha256": sha256_file(SMALL_JURY)},
            "medium_inventory": {"path": str(INVENTORY_PATH), "sha256": sha256_file(INVENTORY_PATH)},
            "medium_screen": {"path": str(SCREEN_CSV), "sha256": sha256_file(SCREEN_CSV)},
            "medium_jury": {"path": str(JURY_OUTPUT), "sha256": sha256_file(JURY_OUTPUT)},
        },
        "comparison_csv": {"path": str(COMPARISON_CSV), "sha256": sha256_file(COMPARISON_CSV)},
        "automatic_small_replacement": "FORBIDDEN",
        "limitations": [
            "The two models use different latent/audio codecs, so fixed seed numbers do not mean matched latent noise.",
            "Machine-score deltas are analysis signals, not proof that one model sounds better.",
            "No human or Owner listening occurred and the Small shortlist is unchanged.",
            "No automated detector establishes copyright safety, non-infringement, cultural acceptance, or commercial clearance.",
        ],
        "rights_status": RIGHTS_STATUS,
    }
    atomic_write_json(COMPARISON_JSON, summary)
    write_integrity(summary)


def write_integrity(comparison: dict[str, Any]) -> None:
    inventory = read_csv(INVENTORY_PATH)
    files = []
    for row in inventory:
        path = Path(row["absolute_path"])
        metrics = validate_wav(path)
        if metrics["sha256"] != row["sha256"]:
            raise RuntimeError(f"Medium integrity mismatch: {row['candidate_id']}")
        files.append(
            {
                "candidate_id": row["candidate_id"],
                "absolute_path": str(path),
                "bytes": metrics["bytes"],
                "sha256": metrics["sha256"],
                "duration_seconds": metrics["duration_seconds"],
                "mode": oct(path.stat().st_mode & 0o777),
            }
        )
    evidence_paths = (
        PLAN_CSV,
        COMMANDS_PATH,
        INVENTORY_PATH,
        PROMPT_REGISTER,
        PLAN_JSON,
        ROUTE_JSON,
        GEN_LOG,
        LOG_ROOT / "generation-summary.json",
        SCREEN_CSV,
        SCREEN_DETAILS,
        SCREEN_SUMMARY,
        JURY_READY,
        JURY_OUTPUT,
        JURY_OUTPUT.with_suffix(".summary.json"),
        JURY_RUN,
        COMPARISON_CSV,
        COMPARISON_JSON,
    )
    evidence = []
    for path in evidence_paths:
        if not path.is_file():
            raise FileNotFoundError(f"Medium evidence missing: {path}")
        evidence.append({"path": str(path), "bytes": path.stat().st_size, "sha256": sha256_file(path)})
    retained = retained_bytes()
    record = {
        "generated_utc": utc_now(),
        "tool_version": TOOL_VERSION,
        "status": "PASS",
        "raw_count": len(files),
        "unique_candidate_ids": len({row["candidate_id"] for row in inventory}),
        "unique_raw_hashes": len({row["sha256"] for row in inventory}),
        "raw_files": files,
        "evidence_files": evidence,
        "route": {"path": str(ROUTE_JSON), "sha256": sha256_file(ROUTE_JSON)},
        "comparison": comparison,
        "retained_marathon_bytes": retained,
        "disk_cap_bytes": DISK_CAP_BYTES,
        "under_disk_cap": retained < DISK_CAP_BYTES,
        "collision_processes_at_close": collision_processes(),
        "stable_inference_processes_at_close": stable_processes(),
        "small_shortlist_modified": False,
        "unity_or_production_changes": False,
        "rights_status": RIGHTS_STATUS,
    }
    atomic_write_json(INTEGRITY_JSON, record)


def run_all() -> None:
    generate()
    if stable_processes():
        raise RuntimeError("Stable inference remained active after sequential queue")
    screen()
    jury()
    compare()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=("plan", "generate", "screen", "jury", "compare", "all"), default="all")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.mode == "plan":
        plan()
    elif args.mode == "generate":
        generate()
    elif args.mode == "screen":
        screen()
    elif args.mode == "jury":
        jury()
    elif args.mode == "compare":
        compare()
    else:
        run_all()


if __name__ == "__main__":
    main()
