#!/usr/bin/env python3
"""Plan, generate, inventory, and reconcile the sole bounded R1 rescue round.

Original prompts remain immutable evidence.  Each family authorized by
Screening V3 receives exactly one documented R1 revision and four fixed rescue
seeds.  Generation uses only the pinned offline Stable Audio 3 Small-Music MLX
route, sequential low-priority execution, collision/time/disk/count gates, and
no-overwrite raw publication.

All generated material remains PROTOTYPE_ONLY.  Screening and jury outputs are
ANALYSIS SIGNAL ONLY.  There is deliberately no R2 generation path.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import os
import subprocess
import tempfile
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import soundfile as sf

from foundry_common import (
    DISK_CAP_BYTES,
    MARATHON_ROOT,
    TOOLING_ROOT,
    atomic_write_json,
    atomic_write_text,
    require_generation_safety,
    retained_bytes,
    sha256_file,
    utc_now,
)


TOOL_VERSION = "audio-foundry-rescue-r1.0"
RIGHTS_STATUS = "PROTOTYPE_ONLY"
SIGNAL_STATUS = "ANALYSIS SIGNAL ONLY"
RESCUE_SEEDS = (262147, 324503, 400009, 499979)
LARGE_GENERATION_CUTOFF = datetime.fromisoformat("2026-09-05T08:10:56+00:00")
MAX_CANONICAL_AND_RESCUE_RAW = 216
CANONICAL_COUNT = 144
EXPECTED_RESCUE_COUNT = 20

PYTHON = TOOLING_ROOT / ".phase2-venv-py312/bin/python"
CODE_ROOT = TOOLING_ROOT / "stable-audio-3"
SCRIPT = CODE_ROOT / "optimized/mlx/scripts/sa3_mlx.py"
WEIGHTS_ROOT = TOOLING_ROOT / "stable-audio-3-weights/MLX"
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

DEFAULT_RESCUE_NEEDED = MARATHON_ROOT / "03_analysis" / "screening-v3-rescue-needed.csv"
DEFAULT_CATALOGUE = MARATHON_ROOT / "01_catalogue" / "nine-epoch-small-music-prompt-catalogue.csv"
DEFAULT_CANONICAL_FINAL = MARATHON_ROOT / "03_analysis" / "screening-v3-final.csv"
CANONICAL_INVENTORY = MARATHON_ROOT / "01_catalogue" / "all-canonical-144-inventory.csv"
REVISION_CSV = MARATHON_ROOT / "01_catalogue" / "rescue-r1-prompt-revisions.csv"
REVISION_JSON = MARATHON_ROOT / "01_catalogue" / "rescue-r1-prompt-revisions.json"
MACHINE_JURY_PROMPT_REGISTER = MARATHON_ROOT / "01_catalogue" / "canonical-plus-rescue-r1-machine-jury-prompt-register.csv"
COMMANDS_PATH = MARATHON_ROOT / "01_catalogue" / "rescue-r1-commands.jsonl"
PLAN_PATH = MARATHON_ROOT / "09_provenance" / "rescue-r1-generation-plan.json"
ROUTE_PATH = MARATHON_ROOT / "09_provenance" / "rescue-r1-generation-route.json"
RAW_ROOT = MARATHON_ROOT / "02_raw"
LOG_ROOT = MARATHON_ROOT / "10_logs" / "generation" / "rescue-r1"
GENERATION_LOG = LOG_ROOT / "rescue-r1-generation.jsonl"
INVENTORY_PATH = MARATHON_ROOT / "01_catalogue" / "rescue-r1-inventory.csv"
COMBINED_INVENTORY_PATH = MARATHON_ROOT / "01_catalogue" / "canonical-plus-rescue-164-inventory.csv"
COMBINED_RECONCILIATION_PATH = MARATHON_ROOT / "09_provenance" / "canonical-plus-rescue-164-reconciliation.json"
RECONCILIATION_CSV = MARATHON_ROOT / "03_analysis" / "rescue-r1-reconciliation.csv"
FAMILY_STATUS_CSV = MARATHON_ROOT / "03_analysis" / "rescue-r1-family-status.csv"
RECONCILIATION_JSON = MARATHON_ROOT / "03_analysis" / "rescue-r1-final-summary.json"

STEREO_POSITIVE = (
    "Use a centered, naturally balanced, mono-compatible stereo image, with correlated low frequencies "
    "and no phase-inverted widening."
)
STEREO_NEGATIVE = (
    "phase-inverted widening, antiphase stereo, negative stereo correlation, "
    "hard-panned decorrelated ambience"
)
SILENCE_POSITIVE = (
    "Maintain a continuous low-level musical bed across the full two minutes; use performed transitions "
    "instead of long silent pauses, and sustain a gentle musical tail through the ending."
)
SILENCE_NEGATIVE = "long silent pause, internal silence, extended dropout, premature fade to silence, empty tail"
SEMANTIC_NEGATIVE = "foreground trailer score, dominant theme, generic corporate stock music, style ambiguity"


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def csv_text(rows: list[dict[str, Any]], fieldnames: list[str]) -> str:
    buffer = io.StringIO(newline="")
    writer = csv.DictWriter(buffer, fieldnames=fieldnames, extrasaction="ignore", lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()


def text_sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def parse_bool(value: Any) -> bool:
    return str(value).strip().lower() in {"true", "1", "yes", "pass", "passed"}


def append_clause(base: str, clause: str) -> str:
    base = base.strip()
    clause = clause.strip()
    return base if clause.lower() in base.lower() else f"{base} {clause}".strip()


def append_negative(base: str, clause: str) -> str:
    base = base.strip().rstrip(" ,")
    additions = [item.strip() for item in clause.split(",") if item.strip()]
    existing = base.lower()
    fresh = [item for item in additions if item.lower() not in existing]
    return base if not fresh else f"{base}, {', '.join(fresh)}"


def stable_audio_processes() -> list[str]:
    completed = subprocess.run(["ps", "-axo", "pid=,command="], check=True, capture_output=True, text=True)
    matches = []
    for line in completed.stdout.splitlines():
        lower = line.lower()
        if "sa3_mlx.py" in lower or ("stable-audio-3" in lower and "--prompt" in lower):
            matches.append(line.strip())
    return matches


def require_no_parallel_inference() -> None:
    matches = stable_audio_processes()
    if matches:
        raise RuntimeError("parallel Stable Audio inference is forbidden: " + " | ".join(matches))


def git_head(path: Path) -> str:
    completed = subprocess.run(["git", "rev-parse", "HEAD"], cwd=path, check=True, capture_output=True, text=True)
    return completed.stdout.strip()


def validate_route() -> dict[str, Any]:
    if git_head(CODE_ROOT) != EXPECTED_CODE_COMMIT:
        raise RuntimeError("Stable Audio source checkout is not at the pinned commit")
    if not PYTHON.is_file() or not SCRIPT.is_file():
        raise RuntimeError("pinned Stable Audio runtime or MLX script is missing")
    weights = []
    for name, expected_hash in WEIGHT_HASHES.items():
        path = WEIGHTS_ROOT / name
        actual_hash = sha256_file(path)
        if actual_hash != expected_hash:
            raise RuntimeError(f"weight hash mismatch: {name}")
        weights.append({"path": str(path), "bytes": path.stat().st_size, "sha256": actual_hash})
    version = subprocess.run([str(PYTHON), "--version"], check=True, capture_output=True, text=True)
    python_version = (version.stdout + version.stderr).strip()
    if "3.12.14" not in python_version:
        raise RuntimeError(f"unexpected Python runtime: {python_version}")
    return {
        "validated_utc": utc_now(),
        "tool_version": TOOL_VERSION,
        "generation_tuple": GENERATION_TUPLE,
        "python": python_version,
        "weights": weights,
        "rights_status": RIGHTS_STATUS,
    }


def load_catalogue(path: Path) -> dict[str, dict[str, str]]:
    rows = read_csv(path)
    if len(rows) != 144:
        raise ValueError(f"expected the 144-row canonical prompt catalogue, found {len(rows)}")
    required = {"prompt_id", "epoch_alias", "family_name", "positive_prompt", "negative_prompt", "primary_seed"}
    if not rows or not required.issubset(rows[0]):
        raise ValueError(f"prompt catalogue lacks fields: {sorted(required - set(rows[0] if rows else {}))}")
    grouped: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in rows:
        grouped[row["prompt_id"]].append(row)
    if len(grouped) != 36 or set(len(value) for value in grouped.values()) != {4}:
        raise ValueError("prompt catalogue is not 36 families x four candidates")
    families = {}
    for prompt_id, family_rows in grouped.items():
        first = family_rows[0]
        immutable = (first["epoch_alias"], first["family_name"], first["positive_prompt"], first["negative_prompt"])
        if any(
            (row["epoch_alias"], row["family_name"], row["positive_prompt"], row["negative_prompt"]) != immutable
            for row in family_rows
        ):
            raise ValueError(f"canonical prompt differs within family: {prompt_id}")
        if {int(row["primary_seed"]) for row in family_rows} != {104729, 130363, 155921, 196613}:
            raise ValueError(f"canonical seeds differ for family: {prompt_id}")
        families[prompt_id] = {
            "parent_prompt_id": prompt_id,
            "epoch": first["epoch_alias"],
            "family": first["family_name"],
            "original_positive_prompt": first["positive_prompt"],
            "original_negative_prompt": first["negative_prompt"],
        }
    return families


def load_rescue_needed(path: Path, canonical_final: Path) -> list[dict[str, str]]:
    rows = read_csv(path)
    required = {
        "epoch", "prompt_id", "prompt_family", "family_status", "failure_pattern",
        "maximum_documented_prompt_revisions", "fixed_rescue_seeds", "maximum_rescue_candidates",
        "additional_rescue_rounds", "rights_status",
    }
    if not rows or not required.issubset(rows[0]):
        raise ValueError(f"rescue-needed CSV lacks fields: {sorted(required - set(rows[0] if rows else {}))}")
    if len({row["prompt_id"] for row in rows}) != len(rows):
        raise ValueError("rescue-needed CSV repeats a prompt family")
    expected_seed_text = ";".join(str(seed) for seed in RESCUE_SEEDS)
    for row in rows:
        if row["family_status"] != "RESCUE_REQUIRED_BY_BOUNDED_LAW":
            raise ValueError(f"family is not authorized for rescue: {row['prompt_id']}")
        if row["maximum_documented_prompt_revisions"] != "1" or row["maximum_rescue_candidates"] != "4":
            raise ValueError(f"bounded rescue limits changed: {row['prompt_id']}")
        if row["additional_rescue_rounds"] != "0" or row["fixed_rescue_seeds"] != expected_seed_text:
            raise ValueError(f"R1-only seed/round law changed: {row['prompt_id']}")
        if row["rights_status"] != RIGHTS_STATUS:
            raise ValueError(f"unexpected rescue rights status: {row['prompt_id']}")
    canonical = read_csv(canonical_final)
    if len(canonical) != CANONICAL_COUNT or len({row["candidate_id"] for row in canonical}) != CANONICAL_COUNT:
        raise ValueError("canonical final must contain exactly 144 unique candidates")
    eligible = Counter(row["prompt_id"] for row in canonical if row.get("final_machine_status") == "MACHINE_ELIGIBLE")
    for row in rows:
        if eligible[row["prompt_id"]] >= 2:
            raise RuntimeError(f"rescue family already has two canonical eligible candidates: {row['prompt_id']}")
    if CANONICAL_COUNT + len(rows) * len(RESCUE_SEEDS) > MAX_CANONICAL_AND_RESCUE_RAW:
        raise RuntimeError("planned rescue would exceed the 216 canonical-plus-rescue raw cap")
    return sorted(rows, key=lambda row: (row["epoch"], row["prompt_id"]))


def revise_prompt(family: dict[str, str], failure_pattern: str) -> dict[str, Any]:
    positive = family["original_positive_prompt"]
    negative = family["original_negative_prompt"]
    corrections: list[str] = []
    upper = failure_pattern.upper()
    if "MISMATCH" in upper:
        plain = (
            f"Instrumental {family['family']} background music for a restrained Hollywood studio management work session. "
            "Keep the family style clear and direct, the pace calm and useful, and the music in a supporting role "
            "without a dominant foreground theme."
        )
        positive = f"{plain} {positive}".strip()
        negative = append_negative(negative, SEMANTIC_NEGATIVE)
        corrections.append("PLAINER_FAMILY_STYLE_AND_RESTRAINED_BACKGROUND_FUNCTION")
    if "STEREO_NEGATIVE_CORRELATION" in upper or "MONO_FOLD_LOSS" in upper:
        positive = append_clause(positive, STEREO_POSITIVE)
        negative = append_negative(negative, STEREO_NEGATIVE)
        corrections.append("CENTERED_MONO_COMPATIBLE_STEREO_NO_PHASE_INVERTED_WIDENING")
    if "SILENCE" in upper:
        positive = append_clause(positive, SILENCE_POSITIVE)
        negative = append_negative(negative, SILENCE_NEGATIVE)
        corrections.append("CONTINUOUS_LOW_LEVEL_MUSICAL_BED_NO_LONG_SILENT_PAUSE")
    if not corrections:
        raise ValueError(f"no bounded revision rule matches failure pattern: {failure_pattern}")
    return {"revised_positive_prompt": positive, "revised_negative_prompt": negative, "corrections": corrections}


def build_argv(revision: dict[str, Any], seed: int, output: Path) -> list[str]:
    return [
        str(PYTHON), str(SCRIPT.relative_to(TOOLING_ROOT)),
        "--prompt", revision["revised_positive_prompt"],
        "--negative-prompt", revision["revised_negative_prompt"],
        "--dit", "sm-music", "--decoder", "same-s", "--seconds", "120", "--steps", "8",
        "--seed", str(seed), "--init-noise-level", "1.0", "--cfg", "2.0", "--apg", "1.0",
        "--dit-dtype", "fp16", "--free-models", "--out", str(output),
    ]


def machine_jury_prompt_register(
    families: dict[str, dict[str, str]], revisions: list[dict[str, Any]]
) -> tuple[list[dict[str, Any]], list[str]]:
    fields = [
        "prompt_id", "epoch", "epoch_alias", "family", "prompt_family", "family_name",
        "positive_prompt", "negative_prompt", "parent_prompt_id", "rescue_round",
        "source_prompt_provenance", "status",
    ]
    rows: list[dict[str, Any]] = []
    for prompt_id, family in sorted(families.items()):
        rows.append({
            "prompt_id": prompt_id,
            "epoch": family["epoch"],
            "epoch_alias": family["epoch"],
            "family": family["family"],
            "prompt_family": family["family"],
            "family_name": family["family"],
            "positive_prompt": family["original_positive_prompt"],
            "negative_prompt": family["original_negative_prompt"],
            "parent_prompt_id": "",
            "rescue_round": "",
            "source_prompt_provenance": "CANONICAL_FAMILY_UNIQUE_FROM_144_ROW_CATALOGUE",
            "status": RIGHTS_STATUS,
        })
    for revision in sorted(revisions, key=lambda row: row["prompt_id"]):
        rows.append({
            "prompt_id": revision["prompt_id"],
            "epoch": revision["epoch"],
            "epoch_alias": revision["epoch_alias"],
            "family": revision["prompt_family"],
            "prompt_family": revision["prompt_family"],
            "family_name": revision["family_name"],
            "positive_prompt": revision["positive_prompt"],
            "negative_prompt": revision["negative_prompt"],
            "parent_prompt_id": revision["parent_prompt_id"],
            "rescue_round": "R1",
            "source_prompt_provenance": revision["source_prompt_provenance"],
            "status": RIGHTS_STATUS,
        })
    ids = [row["prompt_id"] for row in rows]
    canonical_ids = {row["prompt_id"] for row in rows if not row["rescue_round"]}
    rescue_ids = {row["prompt_id"] for row in rows if row["rescue_round"] == "R1"}
    if len(rows) != 41 or len(set(ids)) != 41 or len(canonical_ids) != 36 or len(rescue_ids) != 5:
        raise RuntimeError(
            "machine-jury prompt register must contain 36 unique canonical families plus five unique R1 revisions"
        )
    if any(not all(row[field] for field in ("prompt_id", "epoch", "epoch_alias", "family", "family_name", "positive_prompt", "negative_prompt")) for row in rows):
        raise RuntimeError("machine-jury prompt register contains an incomplete required field")
    return rows, fields


def build_plan(
    args: argparse.Namespace, *, write_artifacts: bool = True
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    families = load_catalogue(args.catalogue)
    needed = load_rescue_needed(args.rescue_needed, args.canonical_final)
    revisions: list[dict[str, Any]] = []
    commands: list[dict[str, Any]] = []
    for request in needed:
        parent_id = request["prompt_id"]
        if parent_id not in families:
            raise ValueError(f"rescue family is absent from prompt catalogue: {parent_id}")
        family = families[parent_id]
        if family["epoch"] != request["epoch"] or family["family"] != request["prompt_family"]:
            raise ValueError(f"rescue request/catalogue identity mismatch: {parent_id}")
        revised = revise_prompt(family, request["failure_pattern"])
        revision_id = f"{parent_id}-R1"
        revision = {
            "revision_id": revision_id,
            "prompt_id": revision_id,
            "rescue_round": "R1",
            "revision_number": 1,
            "parent_prompt_id": parent_id,
            "epoch": family["epoch"],
            "epoch_alias": family["epoch"],
            "prompt_family": family["family"],
            "family_name": family["family"],
            "failure_pattern": request["failure_pattern"],
            "correction_rules": ";".join(revised["corrections"]),
            "original_positive_prompt": family["original_positive_prompt"],
            "original_positive_prompt_sha256": text_sha256(family["original_positive_prompt"]),
            "original_negative_prompt": family["original_negative_prompt"],
            "original_negative_prompt_sha256": text_sha256(family["original_negative_prompt"]),
            "revised_positive_prompt": revised["revised_positive_prompt"],
            "revised_positive_prompt_sha256": text_sha256(revised["revised_positive_prompt"]),
            "revised_negative_prompt": revised["revised_negative_prompt"],
            "revised_negative_prompt_sha256": text_sha256(revised["revised_negative_prompt"]),
            "positive_prompt": revised["revised_positive_prompt"],
            "negative_prompt": revised["revised_negative_prompt"],
            "revision_limit": 1,
            "additional_rescue_rounds": 0,
            "source_prompt_provenance": "BOUNDED_RESCUE_R1_FROM_PRESERVED_CANONICAL_PARENT",
            "status": RIGHTS_STATUS,
        }
        revisions.append(revision)
        for seed in RESCUE_SEEDS:
            candidate_id = f"{revision_id}__seed-{seed}"
            output = RAW_ROOT / family["epoch"] / "rescue-r1" / f"{candidate_id}.wav"
            commands.append({
                "candidate_id": candidate_id,
                "revision_id": revision_id,
                "parent_prompt_id": parent_id,
                "epoch": family["epoch"],
                "prompt_family": family["family"],
                "failure_pattern": request["failure_pattern"],
                "seed": seed,
                "cwd": str(TOOLING_ROOT),
                "argv": build_argv(revision, seed, output),
                "environment_safe": {
                    "HF_HUB_OFFLINE": "1",
                    "HF_HUB_DISABLE_TELEMETRY": "1",
                    "TRANSFORMERS_OFFLINE": "1",
                },
                "planned_output": str(output),
                "generation_tuple": GENERATION_TUPLE,
                "process_priority_nice": 10,
                "status": "PLANNED_R1",
                "rights_status": RIGHTS_STATUS,
            })
    if len(revisions) != 5 or len(commands) != 20 or len(commands) != len(revisions) * len(RESCUE_SEEDS):
        raise RuntimeError("expected exactly five R1 family revisions and 20 fixed-seed commands")
    if CANONICAL_COUNT + len(commands) > MAX_CANONICAL_AND_RESCUE_RAW:
        raise RuntimeError("R1 plan exceeds the 216 canonical-plus-rescue raw cap")

    jury_rows, jury_fields = machine_jury_prompt_register(families, revisions)
    revision_csv = csv_text(revisions, list(revisions[0]))
    revision_json = json.dumps({
        "tool_version": TOOL_VERSION,
        "classification": SIGNAL_STATUS,
        "revision_round": "R1_ONLY",
        "revision_count": len(revisions),
        "revisions": revisions,
        "rights_status": RIGHTS_STATUS,
    }, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
    commands_text = "\n".join(json.dumps(row, sort_keys=True, ensure_ascii=False) for row in commands) + "\n"
    jury_text = csv_text(jury_rows, jury_fields)
    artifacts = (
        (REVISION_CSV, revision_csv),
        (REVISION_JSON, revision_json),
        (COMMANDS_PATH, commands_text),
        (MACHINE_JURY_PROMPT_REGISTER, jury_text),
    )
    for path, payload in artifacts:
        if path.exists() and path.read_text(encoding="utf-8") != payload:
            # The restored v1.1 adds the 41-row register but must remain byte
            # compatible with the already-executed v1.0 R1 plan artifacts.
            if path != MACHINE_JURY_PROMPT_REGISTER:
                raise RuntimeError(f"locked R1 plan differs; refusing to rewrite sole rescue round: {path}")
        if write_artifacts:
            atomic_write_text(path, payload)
        elif not path.is_file():
            raise FileNotFoundError(f"locked R1 plan artifact is missing: {path}")

    plan = {
        "generated_utc": utc_now(),
        "tool_version": TOOL_VERSION,
        "classification": SIGNAL_STATUS,
        "status": "R1_PLANNED_NOT_GENERATED",
        "input_evidence": {
            "rescue_needed": {"path": str(args.rescue_needed), "sha256": sha256_file(args.rescue_needed)},
            "prompt_catalogue": {"path": str(args.catalogue), "sha256": sha256_file(args.catalogue)},
            "canonical_final": {"path": str(args.canonical_final), "sha256": sha256_file(args.canonical_final)},
        },
        "outputs": {
            "revisions_csv": {"path": str(REVISION_CSV), "sha256": sha256_file(REVISION_CSV)},
            "revisions_json": {"path": str(REVISION_JSON), "sha256": sha256_file(REVISION_JSON)},
            "commands": {"path": str(COMMANDS_PATH), "sha256": sha256_file(COMMANDS_PATH)},
            "machine_jury_prompt_register": {
                "path": str(MACHINE_JURY_PROMPT_REGISTER),
                "sha256": sha256_file(MACHINE_JURY_PROMPT_REGISTER),
                "rows": 41,
                "canonical_families": 36,
                "r1_families": 5,
            },
        },
        "counts": {
            "canonical": CANONICAL_COUNT,
            "families_revised_once": len(revisions),
            "r1_candidates_planned": len(commands),
            "canonical_plus_planned_rescue": CANONICAL_COUNT + len(commands),
            "hard_cap": MAX_CANONICAL_AND_RESCUE_RAW,
        },
        "fixed_rescue_seeds": RESCUE_SEEDS,
        "additional_rescue_rounds": 0,
        "generation_tuple": GENERATION_TUPLE,
        "rights_status": RIGHTS_STATUS,
    }
    if write_artifacts:
        atomic_write_json(PLAN_PATH, plan)
    elif not PLAN_PATH.is_file():
        raise FileNotFoundError(f"R1 generation plan is missing: {PLAN_PATH}")
    return revisions, commands


def append_jsonl(path: Path, record: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor = os.open(path, os.O_WRONLY | os.O_APPEND | os.O_CREAT, 0o644)
    try:
        os.write(descriptor, (json.dumps(record, sort_keys=True, ensure_ascii=False) + "\n").encode("utf-8"))
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def read_attempts() -> dict[str, list[dict[str, Any]]]:
    attempts: dict[str, list[dict[str, Any]]] = defaultdict(list)
    if not GENERATION_LOG.exists():
        return attempts
    for line_number, line in enumerate(GENERATION_LOG.read_text(encoding="utf-8").splitlines(), start=1):
        try:
            record = json.loads(line)
        except json.JSONDecodeError as error:
            raise RuntimeError(f"malformed R1 generation log line {line_number}: {error}") from error
        attempts[record["candidate_id"]].append(record)
    return attempts


def read_locked_commands() -> list[dict[str, Any]]:
    if not COMMANDS_PATH.is_file():
        raise FileNotFoundError(COMMANDS_PATH)
    commands = []
    for line_number, line in enumerate(COMMANDS_PATH.read_text(encoding="utf-8").splitlines(), start=1):
        try:
            commands.append(json.loads(line))
        except json.JSONDecodeError as error:
            raise RuntimeError(f"malformed R1 command line {line_number}: {error}") from error
    if len(commands) != EXPECTED_RESCUE_COUNT:
        raise RuntimeError(f"expected {EXPECTED_RESCUE_COUNT} locked R1 commands, found {len(commands)}")
    ids = {row["candidate_id"] for row in commands}
    if len(ids) != EXPECTED_RESCUE_COUNT:
        raise RuntimeError("locked R1 commands contain duplicate candidate IDs")
    expected_seeds = defaultdict(set)
    for row in commands:
        if row.get("rights_status") != RIGHTS_STATUS or row.get("revision_id") != f"{row['parent_prompt_id']}-R1":
            raise RuntimeError(f"invalid locked R1 command identity/status: {row.get('candidate_id')}")
        expected_seeds[row["parent_prompt_id"]].add(int(row["seed"]))
    if len(expected_seeds) != 5 or any(seeds != set(RESCUE_SEEDS) for seeds in expected_seeds.values()):
        raise RuntimeError("locked R1 commands do not encode five families x four fixed rescue seeds")
    return commands


def validate_wav(path: Path) -> dict[str, Any]:
    info = sf.info(path)
    if (
        info.format != "WAV" or info.subtype != "PCM_16" or info.channels != 2
        or info.samplerate != 44_100 or info.frames != 5_292_000
        or abs(info.duration - 120.0) > 1e-6
    ):
        raise RuntimeError(f"R1 WAV format/duration mismatch: {path}: {info}")
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


def preserve_failed_temp(temp_path: Path, candidate_id: str, attempt_number: int) -> str | None:
    if not temp_path.exists():
        return None
    destination = LOG_ROOT / "failed-generation-artifacts" / f"{candidate_id}__attempt-{attempt_number:02d}.wav"
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists() or destination.is_symlink():
        raise FileExistsError(f"failed-artifact destination already exists: {destination}")
    os.link(temp_path, destination)
    os.chmod(destination, 0o444)
    temp_path.unlink()
    return str(destination)


def build_inventory(commands: list[dict[str, Any]], attempts: dict[str, list[dict[str, Any]]]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for command in commands:
        successes = [row for row in attempts.get(command["candidate_id"], []) if row.get("status") == "SUCCESS"]
        if not successes:
            continue
        if len(successes) > 1:
            raise RuntimeError(f"multiple successful R1 records: {command['candidate_id']}")
        record = successes[0]
        output = Path(record["output"])
        if output.is_symlink():
            raise RuntimeError(f"R1 raw may not be a symlink: {output}")
        metrics = validate_wav(output)
        if metrics["sha256"] != record["output_sha256"] or metrics["bytes"] != record["output_bytes"]:
            raise RuntimeError(f"R1 resume hash mismatch: {command['candidate_id']}")
        rows.append({
            "absolute_path": str(output),
            "bytes": metrics["bytes"],
            "sha256": metrics["sha256"],
            "candidate_id": command["candidate_id"],
            "epoch": command["epoch"],
            "prompt_id": command["revision_id"],
            "parent_prompt_id": command["parent_prompt_id"],
            "prompt_family": command["prompt_family"],
            "seed": command["seed"],
            "generation_tuple": json.dumps(GENERATION_TUPLE, sort_keys=True, separators=(",", ":")),
            "rescue_round": "R1",
            "revision_id": command["revision_id"],
            "failure_pattern": command["failure_pattern"],
            "screening_status": "PENDING_SCREENING_V3",
            "screening_gate": "V3_RESCUE_PENDING",
            "analysis_status": SIGNAL_STATUS,
            "rights_status": RIGHTS_STATUS,
        })
    fields = list(rows[0]) if rows else [
        "absolute_path", "bytes", "sha256", "candidate_id", "epoch", "prompt_id",
        "parent_prompt_id", "prompt_family", "seed", "generation_tuple", "rescue_round",
        "revision_id", "failure_pattern", "screening_status", "screening_gate",
        "analysis_status", "rights_status",
    ]
    atomic_write_text(INVENTORY_PATH, csv_text(rows, fields))
    return rows


def validate_observed_rescue_raws(
    commands: list[dict[str, Any]], attempts: dict[str, list[dict[str, Any]]]
) -> int:
    planned = {Path(row["planned_output"]): row["candidate_id"] for row in commands}
    observed = set(RAW_ROOT.glob("*/rescue-r1/*-R1__seed-*.wav"))
    unexpected = sorted(str(path) for path in observed - set(planned))
    if unexpected:
        raise RuntimeError(f"unplanned R1 raw files prevent provenance reconciliation: {unexpected}")
    for path in observed:
        if path.is_symlink():
            raise RuntimeError(f"R1 raw may not be a symlink: {path}")
        candidate_id = planned[path]
        successes = [row for row in attempts.get(candidate_id, []) if row.get("status") == "SUCCESS"]
        if len(successes) != 1:
            raise RuntimeError(f"observed R1 raw lacks exactly one success record: {candidate_id}")
        if successes[0].get("output") != str(path) or successes[0].get("output_sha256") != sha256_file(path):
            raise RuntimeError(f"observed R1 raw/log mismatch: {candidate_id}")
    total = CANONICAL_COUNT + len(observed)
    if total > MAX_CANONICAL_AND_RESCUE_RAW:
        raise RuntimeError(f"216 canonical-plus-rescue raw cap exceeded: {total}")
    return total


def emit_combined_inventory(
    *, canonical_path: Path = CANONICAL_INVENTORY, rescue_path: Path = INVENTORY_PATH
) -> dict[str, Any]:
    """Write the validated 144 canonical + 20 R1 union-field inventory."""
    canonical = read_csv(canonical_path)
    rescue = read_csv(rescue_path)
    if len(canonical) != CANONICAL_COUNT:
        raise RuntimeError(f"canonical inventory must contain 144 rows, found {len(canonical)}")
    if len(rescue) != EXPECTED_RESCUE_COUNT:
        raise RuntimeError(f"R1 inventory must contain 20 rows, found {len(rescue)}")
    if sum(row.get("rescue_round") == "R1" for row in rescue) != EXPECTED_RESCUE_COUNT:
        raise RuntimeError("R1 inventory does not identify every rescue row as R1")
    canonical_fields = list(canonical[0])
    rescue_extra_fields = [field for field in rescue[0] if field not in canonical_fields]
    fields = canonical_fields + rescue_extra_fields
    combined = [{field: row.get(field, "") for field in fields} for row in canonical + rescue]
    ids = [row["candidate_id"] for row in combined]
    hashes = [row["sha256"] for row in combined]
    if len(combined) != 164 or len(set(ids)) != 164 or len(set(hashes)) != 164:
        raise RuntimeError("combined inventory does not reconcile 164 unique candidate IDs and source hashes")
    if any(row.get("rights_status") != RIGHTS_STATUS for row in combined):
        raise RuntimeError("combined inventory contains a non-PROTOTYPE_ONLY rights status")
    for row in combined:
        source = Path(row["absolute_path"])
        if not source.is_file() or source.is_symlink():
            raise RuntimeError(f"combined raw is missing or symlinked: {source}")
        if source.stat().st_size != int(row["bytes"]) or sha256_file(source) != row["sha256"]:
            raise RuntimeError(f"combined raw provenance mismatch: {row['candidate_id']}")
    atomic_write_text(COMBINED_INVENTORY_PATH, csv_text(combined, fields))
    result = {
        "generated_utc": utc_now(),
        "tool_version": TOOL_VERSION,
        "status": "PASS",
        "classification": SIGNAL_STATUS,
        "counts": {
            "canonical": len(canonical),
            "rescue_r1": len(rescue),
            "combined": len(combined),
            "unique_candidate_ids": len(set(ids)),
            "unique_source_hashes": len(set(hashes)),
        },
        "inputs": {
            "canonical": {"path": str(canonical_path), "sha256": sha256_file(canonical_path)},
            "rescue_r1": {"path": str(rescue_path), "sha256": sha256_file(rescue_path)},
        },
        "output": {
            "path": str(COMBINED_INVENTORY_PATH),
            "bytes": COMBINED_INVENTORY_PATH.stat().st_size,
            "sha256": sha256_file(COMBINED_INVENTORY_PATH),
            "union_fields": fields,
        },
        "rights_status": RIGHTS_STATUS,
    }
    atomic_write_json(COMBINED_RECONCILIATION_PATH, result)
    return result


def generate(args: argparse.Namespace) -> None:
    if datetime.now(timezone.utc) >= LARGE_GENERATION_CUTOFF:
        raise RuntimeError("hour-84 cutoff reached; no new R1 generation may begin")
    _, commands = build_plan(args)
    route = validate_route()
    atomic_write_json(ROUTE_PATH, route)
    require_generation_safety()
    require_no_parallel_inference()
    attempts = read_attempts()
    validate_observed_rescue_raws(commands, attempts)
    environment = os.environ.copy()
    environment.update({
        "HF_HUB_OFFLINE": "1",
        "HF_HUB_DISABLE_TELEMETRY": "1",
        "TRANSFORMERS_OFFLINE": "1",
    })
    failures = []

    for index, command in enumerate(commands, start=1):
        candidate_id = command["candidate_id"]
        output = Path(command["planned_output"])
        prior = attempts.get(candidate_id, [])
        successes = [row for row in prior if row.get("status") == "SUCCESS"]
        if successes:
            if len(successes) != 1 or not output.is_file() or output.is_symlink():
                raise RuntimeError(f"invalid successful resume state: {candidate_id}")
            metrics = validate_wav(output)
            if metrics["sha256"] != successes[0]["output_sha256"]:
                raise RuntimeError(f"successful R1 raw changed: {candidate_id}")
            print(f"[{index:03d}/{len(commands):03d}] VERIFIED-SKIP {candidate_id}", flush=True)
            continue
        if output.exists() or output.is_symlink():
            raise FileExistsError(f"unlogged R1 raw exists; refusing overwrite: {output}")
        prior_failures = [row for row in prior if row.get("status") == "FAILED"]
        if prior_failures and not args.retry_failed:
            raise RuntimeError(
                f"prior identical operation failed for {candidate_id}; provide --retry-failed and "
                "--retry-hypothesis after changing the operational hypothesis/instrumentation"
            )
        if prior_failures and not args.retry_hypothesis.strip():
            raise ValueError("--retry-failed requires a concrete non-empty --retry-hypothesis")

        current_attempts = read_attempts()
        validate_observed_rescue_raws(commands, current_attempts)
        successful_count = sum(
            any(row.get("status") == "SUCCESS" for row in rows) for rows in current_attempts.values()
        )
        if CANONICAL_COUNT + successful_count >= MAX_CANONICAL_AND_RESCUE_RAW:
            raise RuntimeError("216 canonical-plus-rescue raw cap reached")
        if retained_bytes() + 22_000_000 >= DISK_CAP_BYTES:
            raise RuntimeError("predictive 80 GiB retained disk cap reached")
        if datetime.now(timezone.utc) >= LARGE_GENERATION_CUTOFF:
            raise RuntimeError("hour-84 cutoff reached during R1 queue")
        require_generation_safety()
        require_no_parallel_inference()

        output.parent.mkdir(parents=True, exist_ok=True)
        descriptor, temporary_name = tempfile.mkstemp(prefix=f".{candidate_id}.", suffix=".wav", dir=output.parent)
        os.close(descriptor)
        temporary = Path(temporary_name)
        temporary.unlink()
        attempt_number = len(prior) + 1
        argv = list(command["argv"])
        argv[-1] = str(temporary)
        started = utc_now()
        print(f"[{index:03d}/{len(commands):03d}] START {candidate_id}", flush=True)
        completed = subprocess.run(
            argv,
            cwd=TOOLING_ROOT,
            env=environment,
            capture_output=True,
            text=True,
            check=False,
            preexec_fn=lambda: os.nice(10),
        )
        ended = utc_now()
        stdout_path = LOG_ROOT / "candidates" / f"{candidate_id}__attempt-{attempt_number:02d}.stdout.txt"
        stderr_path = LOG_ROOT / "candidates" / f"{candidate_id}__attempt-{attempt_number:02d}.stderr.txt"
        if stdout_path.exists() or stderr_path.exists():
            raise FileExistsError(f"R1 attempt log destination already exists: {candidate_id} attempt {attempt_number}")
        atomic_write_text(stdout_path, completed.stdout)
        atomic_write_text(stderr_path, completed.stderr)
        record: dict[str, Any] = {
            **{key: command[key] for key in (
                "candidate_id", "revision_id", "parent_prompt_id", "epoch", "prompt_family",
                "failure_pattern", "seed", "generation_tuple", "rights_status",
            )},
            "attempt_number": attempt_number,
            "retry_hypothesis": args.retry_hypothesis.strip() if prior_failures else "",
            "cwd": str(TOOLING_ROOT),
            "argv": argv,
            "environment_safe": command["environment_safe"],
            "process_priority_nice": 10,
            "started_utc": started,
            "ended_utc": ended,
            "return_code": completed.returncode,
            "stdout": {"path": str(stdout_path), "sha256": sha256_file(stdout_path)},
            "stderr": {"path": str(stderr_path), "sha256": sha256_file(stderr_path)},
            "planned_output": str(output),
        }
        try:
            if completed.returncode != 0:
                raise RuntimeError(f"generator returned {completed.returncode}")
            metrics = validate_wav(temporary)
            os.link(temporary, output)
            os.chmod(output, 0o444)
            temporary.unlink()
            record.update({
                "status": "SUCCESS",
                "output": str(output),
                **{f"output_{key}": value for key, value in metrics.items()},
            })
            append_jsonl(GENERATION_LOG, record)
            attempts[candidate_id].append(record)
            print(f"[{index:03d}/{len(commands):03d}] DONE {candidate_id} {metrics['sha256'][:12]}", flush=True)
        except Exception as error:
            record.update({
                "status": "FAILED",
                "error": f"{type(error).__name__}: {error}",
                "preserved_partial": preserve_failed_temp(temporary, candidate_id, attempt_number),
            })
            append_jsonl(GENERATION_LOG, record)
            attempts[candidate_id].append(record)
            failures.append({"candidate_id": candidate_id, "error": record["error"]})
            print(f"[{index:03d}/{len(commands):03d}] FAILED {candidate_id}: {record['error']}", flush=True)
            if not args.continue_on_error:
                break

    attempts = read_attempts()
    inventory = build_inventory(commands, attempts)
    combined = emit_combined_inventory() if len(inventory) == EXPECTED_RESCUE_COUNT else None
    summary = {
        "generated_utc": utc_now(),
        "tool_version": TOOL_VERSION,
        "status": "R1_GENERATION_COMPLETE" if len(inventory) == len(commands) else "R1_GENERATION_PARTIAL",
        "planned": len(commands),
        "successful": len(inventory),
        "failed_this_run": failures,
        "canonical_plus_successful_rescue": CANONICAL_COUNT + len(inventory),
        "hard_cap": MAX_CANONICAL_AND_RESCUE_RAW,
        "inventory": {"path": str(INVENTORY_PATH), "sha256": sha256_file(INVENTORY_PATH)},
        "combined_inventory": combined["output"] if combined else None,
        "generation_log": {"path": str(GENERATION_LOG), "sha256": sha256_file(GENERATION_LOG)},
        "additional_rescue_rounds": 0,
        "rights_status": RIGHTS_STATUS,
    }
    atomic_write_json(LOG_ROOT / "rescue-r1-generation-summary.json", summary)
    print(json.dumps(summary, indent=2))
    if len(inventory) != len(commands):
        raise RuntimeError("R1 generation is partial; inspect immutable failure records before any hypothesis-changing retry")


def rebuild_inventories() -> dict[str, Any]:
    """Rebuild inventories from immutable 20/20 generation evidence only."""
    commands = read_locked_commands()
    attempts = read_attempts()
    validate_observed_rescue_raws(commands, attempts)
    inventory = build_inventory(commands, attempts)
    if len(inventory) != EXPECTED_RESCUE_COUNT:
        raise RuntimeError(f"R1 inventory is incomplete: {len(inventory)}/{EXPECTED_RESCUE_COUNT}")
    return emit_combined_inventory()


def load_unique_evidence(path: Path, expected_ids: set[str], label: str) -> dict[str, dict[str, str]]:
    rows = read_csv(path)
    mapping = {}
    for row in rows:
        candidate_id = row.get("candidate_id", "")
        if candidate_id in expected_ids:
            if candidate_id in mapping:
                raise ValueError(f"duplicate {label} row: {candidate_id}")
            mapping[candidate_id] = row
    return mapping


def reconcile(args: argparse.Namespace) -> None:
    if not args.rescue_screening or not args.rescue_jury:
        raise ValueError("reconcile mode requires --rescue-screening and --rescue-jury")
    inventory = read_csv(INVENTORY_PATH)
    commands = read_locked_commands()
    expected_ids = {row["candidate_id"] for row in commands}
    if len(inventory) != len(expected_ids) or {row["candidate_id"] for row in inventory} != expected_ids:
        raise RuntimeError("R1 inventory is incomplete; the sole round cannot yet be finalized")
    inventory_map = {row["candidate_id"]: row for row in inventory}
    screening = load_unique_evidence(args.rescue_screening, expected_ids, "rescue screening")
    jury = load_unique_evidence(args.rescue_jury, expected_ids, "rescue jury")
    canonical = read_csv(args.canonical_final)
    if len(canonical) != CANONICAL_COUNT:
        raise ValueError("canonical final no longer contains exactly 144 candidates")

    result_rows = []
    by_parent: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for command in commands:
        candidate_id = command["candidate_id"]
        source = inventory_map[candidate_id]
        screen = screening.get(candidate_id)
        judge = jury.get(candidate_id)
        if screen:
            screen_hash = screen.get("source_sha256") or screen.get("sha256") or screen.get("raw_sha256")
            if screen_hash and screen_hash != source["sha256"]:
                raise RuntimeError(f"R1 screening/source hash mismatch: {candidate_id}")
        if judge:
            jury_hash = judge.get("source_sha256") or judge.get("sha256") or judge.get("raw_sha256")
            if jury_hash and jury_hash != source["sha256"]:
                raise RuntimeError(f"R1 jury/source hash mismatch: {candidate_id}")
        if not screen:
            status = "PENDING_RESCUE_ANALYSIS"
            reasons = "SCREENING_PENDING"
            technical_pass = ""
            severe = "" if not judge else judge.get("severe_machine_mismatch", "")
        else:
            technical_ok = parse_bool(screen.get("technical_automatic_pass", ""))
            technical_pass = str(technical_ok).upper()
            if not technical_ok:
                # A technical rejection never needs or receives semantic jury
                # inference, so the absent jury row is complete—not pending.
                status = "MACHINE_REJECTED"
                reasons = screen.get("automatic_failure_reasons", "TECHNICAL_SCREENING_FAILURE")
                severe = ""
            elif not judge:
                status = "PENDING_RESCUE_ANALYSIS"
                reasons = "MACHINE_JURY_PENDING"
                severe = ""
            else:
                severe_bool = parse_bool(judge.get("severe_machine_mismatch", ""))
                severe = str(severe_bool).upper()
                if severe_bool:
                    status = "MACHINE_REJECTED"
                    reasons = judge.get("mismatch_reasons", "SEVERE_MACHINE_JURY_MISMATCH")
                else:
                    status = "MACHINE_ELIGIBLE"
                    reasons = ""
        row = {
            "candidate_id": candidate_id,
            "revision_id": command["revision_id"],
            "parent_prompt_id": command["parent_prompt_id"],
            "epoch": command["epoch"],
            "prompt_family": command["prompt_family"],
            "seed": command["seed"],
            "source_sha256": source["sha256"],
            "technical_automatic_pass": technical_pass,
            "severe_machine_mismatch": severe,
            "machine_score": judge.get("machine_score", "") if judge else "",
            "rescue_machine_status": status,
            "rescue_machine_reasons": reasons,
            "rescue_round": "R1_ONLY",
            "analysis_status": SIGNAL_STATUS,
            "rights_status": RIGHTS_STATUS,
        }
        result_rows.append(row)
        by_parent[command["parent_prompt_id"]].append(row)

    canonical_eligible = Counter(
        row["prompt_id"] for row in canonical if row.get("final_machine_status") == "MACHINE_ELIGIBLE"
    )
    family_rows = []
    for parent_id, rows in sorted(by_parent.items()):
        rescued = sum(row["rescue_machine_status"] == "MACHINE_ELIGIBLE" for row in rows)
        rejected = sum(row["rescue_machine_status"] == "MACHINE_REJECTED" for row in rows)
        pending = sum(row["rescue_machine_status"] == "PENDING_RESCUE_ANALYSIS" for row in rows)
        combined = canonical_eligible[parent_id] + rescued
        if combined >= 2:
            status = "FAMILY_PASS_AFTER_R1_RESCUE"
        elif pending:
            status = "R1_RECONCILIATION_PENDING"
        else:
            status = "FAMILY NEEDS OWNER / HUMAN AUDIO DIRECTION"
        family_rows.append({
            "epoch": rows[0]["epoch"],
            "parent_prompt_id": parent_id,
            "revision_id": rows[0]["revision_id"],
            "prompt_family": rows[0]["prompt_family"],
            "canonical_eligible_count": canonical_eligible[parent_id],
            "r1_candidate_count": len(rows),
            "r1_eligible_count": rescued,
            "r1_rejected_count": rejected,
            "r1_pending_count": pending,
            "combined_eligible_count": combined,
            "family_status": status,
            "pass_law": "AT_LEAST_2_AUTOMATIC_PASSES_WITH_NO_SEVERE_MACHINE_JURY_MISMATCH",
            "additional_rescue_rounds": 0,
            "analysis_status": SIGNAL_STATUS,
            "rights_status": RIGHTS_STATUS,
        })

    atomic_write_text(RECONCILIATION_CSV, csv_text(result_rows, list(result_rows[0])))
    atomic_write_text(FAMILY_STATUS_CSV, csv_text(family_rows, list(family_rows[0])))
    summary = {
        "generated_utc": utc_now(),
        "tool_version": TOOL_VERSION,
        "classification": SIGNAL_STATUS,
        "status": (
            "R1_RECONCILED"
            if not any(row["family_status"] == "R1_RECONCILIATION_PENDING" for row in family_rows)
            else "R1_ANALYSIS_PARTIAL"
        ),
        "counts": {
            "r1_candidates": len(result_rows),
            "r1_machine_eligible": sum(row["rescue_machine_status"] == "MACHINE_ELIGIBLE" for row in result_rows),
            "r1_machine_rejected": sum(row["rescue_machine_status"] == "MACHINE_REJECTED" for row in result_rows),
            "r1_analysis_pending": sum(row["rescue_machine_status"] == "PENDING_RESCUE_ANALYSIS" for row in result_rows),
            "families_passed_after_r1": sum(row["family_status"] == "FAMILY_PASS_AFTER_R1_RESCUE" for row in family_rows),
            "families_needing_owner_human_direction": sum(
                row["family_status"] == "FAMILY NEEDS OWNER / HUMAN AUDIO DIRECTION" for row in family_rows
            ),
        },
        "inputs": {
            "inventory": {"path": str(INVENTORY_PATH), "sha256": sha256_file(INVENTORY_PATH)},
            "screening": {"path": str(args.rescue_screening), "sha256": sha256_file(args.rescue_screening)},
            "jury": {"path": str(args.rescue_jury), "sha256": sha256_file(args.rescue_jury)},
            "canonical_final": {"path": str(args.canonical_final), "sha256": sha256_file(args.canonical_final)},
        },
        "outputs": {
            "candidate_reconciliation": {"path": str(RECONCILIATION_CSV), "sha256": sha256_file(RECONCILIATION_CSV)},
            "family_status": {"path": str(FAMILY_STATUS_CSV), "sha256": sha256_file(FAMILY_STATUS_CSV)},
        },
        "additional_rescue_rounds": 0,
        "limitations": [
            "This is machine reconciliation, not Owner or human listening acceptance.",
            "No automated detector establishes copyright safety, non-infringement, cultural acceptance, or commercial clearance.",
            "A family remaining weak after R1 requires Owner/human audio direction; this tool cannot generate R2.",
        ],
        "rights_status": RIGHTS_STATUS,
    }
    atomic_write_json(RECONCILIATION_JSON, summary)
    print(json.dumps(summary, indent=2))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=("plan", "generate", "inventory", "reconcile"), default="plan")
    parser.add_argument("--rescue-needed", type=Path, default=DEFAULT_RESCUE_NEEDED)
    parser.add_argument("--catalogue", type=Path, default=DEFAULT_CATALOGUE)
    parser.add_argument("--canonical-final", type=Path, default=DEFAULT_CANONICAL_FINAL)
    parser.add_argument("--rescue-screening", type=Path)
    parser.add_argument("--rescue-jury", type=Path)
    parser.add_argument("--continue-on-error", action=argparse.BooleanOptionalAction, default=True)
    parser.add_argument("--retry-failed", action="store_true")
    parser.add_argument("--retry-hypothesis", default="")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.mode == "plan":
        revisions, commands = build_plan(args)
        print(json.dumps({
            "status": "R1_PLANNED_NOT_GENERATED",
            "revisions": len(revisions),
            "commands": len(commands),
            "machine_jury_prompt_register": str(MACHINE_JURY_PROMPT_REGISTER),
            "machine_jury_prompt_rows": 41,
            "plan": str(PLAN_PATH),
            "rights_status": RIGHTS_STATUS,
        }, indent=2))
    elif args.mode == "generate":
        generate(args)
    elif args.mode == "inventory":
        print(json.dumps(rebuild_inventories(), indent=2))
    else:
        reconcile(args)


if __name__ == "__main__":
    main()
