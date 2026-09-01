#!/usr/bin/env python3
"""Bounded Phase F refinement for Audio Foundry Marathon 01.

Exactly one source per epoch is selected as the highest machine-score eligible
candidate.  Exactly one prompt revision and one fresh fixed-seed 120-second
Small-Music render are permitted per epoch.  Originals and revisions are both
preserved; no shortlist replacement is performed or implied.

All outputs are PROTOTYPE_ONLY or ANALYSIS SIGNAL ONLY.  No automated result is
Owner approval, human listening, rights clearance, or a production decision.
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


TOOL_VERSION = "audio-foundry-phase-f-refinement-v1"
RIGHTS_STATUS = "PROTOTYPE_ONLY"
SIGNAL_STATUS = "ANALYSIS SIGNAL ONLY"
REFINEMENT_STATUS = "PROTOTYPE_READY_FOR_OWNER_AUDITION"
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
REFINEMENT_SEEDS = (602221, 700001, 800011, 900019, 1000003, 1100009, 1200017, 1300021, 1400033)
DIMENSION_ORDER = (
    "excessive_density",
    "weak_era_alignment",
    "repetitive_form",
    "abrupt_ending",
    "poor_loop",
    "excessive_foreground_melody",
    "weak_contrast",
    "unstable_tempo",
)
LARGE_GENERATION_CUTOFF = datetime.fromisoformat("2026-09-05T08:10:56+00:00")

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
RANKING_INPUT = MARATHON_ROOT / "03_analysis" / "shortlist-ready-all-candidates-v3-machine-jury-final-v2.csv"
CANONICAL_PROMPTS = MARATHON_ROOT / "01_catalogue" / "nine-epoch-small-music-prompt-catalogue.csv"
RESCUE_PROMPTS = MARATHON_ROOT / "01_catalogue" / "rescue-r1-prompt-revisions.csv"
CANONICAL_SCREEN = MARATHON_ROOT / "03_analysis" / "screening-v3-final.csv"
RESCUE_SCREEN = MARATHON_ROOT / "03_analysis" / "rescue-r1" / "screening-technical.csv"

PROMPT_CSV = MARATHON_ROOT / "01_catalogue" / "refinement-f1-prompt-revisions.csv"
PROMPT_JSON = MARATHON_ROOT / "01_catalogue" / "refinement-f1-prompt-revisions.json"
JURY_PROMPTS = MARATHON_ROOT / "01_catalogue" / "refinement-f1-machine-jury-prompt-register-36.csv"
COMMANDS_PATH = MARATHON_ROOT / "01_catalogue" / "refinement-f1-commands.jsonl"
INVENTORY_PATH = MARATHON_ROOT / "01_catalogue" / "refinement-f1-inventory.csv"
PLAN_PATH = MARATHON_ROOT / "09_provenance" / "refinement-f1-plan.json"
ROUTE_PATH = MARATHON_ROOT / "09_provenance" / "refinement-f1-generation-route.json"
RAW_ROOT = MARATHON_ROOT / "02_raw"
GEN_LOG_ROOT = MARATHON_ROOT / "10_logs" / "generation" / "refinement-f1"
GEN_LOG = GEN_LOG_ROOT / "refinement-f1-generation.jsonl"
ANALYSIS_ROOT = MARATHON_ROOT / "03_analysis" / "refinement-f1"
SCREEN_CACHE = ANALYSIS_ROOT / "cache" / "screening-v3"
SCREEN_CSV = ANALYSIS_ROOT / "screening-technical.csv"
SCREEN_DETAILS = ANALYSIS_ROOT / "screening-technical-details.jsonl"
SCREEN_SUMMARY = ANALYSIS_ROOT / "screening-summary.json"
JURY_READY = ANALYSIS_ROOT / "jury-ready-inventory.csv"
JURY_OUTPUT = ANALYSIS_ROOT / "machine-jury.csv"
COMPARISON_CSV = ANALYSIS_ROOT / "refinement-vs-original.csv"
COMPARISON_JSON = ANALYSIS_ROOT / "refinement-vs-original.json"
INTEGRITY_PATH = MARATHON_ROOT / "09_provenance" / "refinement-f1-integrity-manifest.json"
JURY_PYTHON = MARATHON_ROOT / "03_analysis" / ".jury-venv" / "bin" / "python"
JURY_SCRIPT = Path(__file__).with_name("machine_jury.py")


POSITIVE_REVISIONS = {
    "excessive_density": "Use fewer simultaneous voices, transparent spacing, restrained percussion and an intentionally light midrange so the cue remains calm background music.",
    "weak_era_alignment": "Make this exact period family unmistakable through its stated instrumentation, ensemble practice, rhythm and harmony while remaining a clean modern master without fake age damage.",
    "repetitive_form": "Use four subtly differentiated low-intensity sections with evolving voicing, register and accompaniment; vary returns without introducing a dominant new theme.",
    "abrupt_ending": "Shape the final phrase as a controlled performed decrescendo with sustained musical continuity and no hard cut, empty tail or sudden terminal cadence.",
    "poor_loop": "Keep the opening and closing texture, harmony, ambience and energy compatible for a gentle crossfade loop; avoid a pickup-only opening or hard final cadence.",
    "excessive_foreground_melody": "Remove any soloistic lead line; distribute short motifs across the ensemble as supporting inner voices and leave generous space for management play and dialogue.",
    "weak_contrast": "Create three clearly perceptible but restrained sections using changes of voicing, register and accompaniment density while preserving one coherent background cue.",
    "unstable_tempo": "Maintain a steady unhurried pulse and consistent meter across all sections, with expressive phrasing that never disrupts tempo continuity.",
}
NEGATIVE_REVISIONS = {
    "excessive_density": "dense wall of sound, crowded orchestration, nonstop percussion, maximal layering",
    "weak_era_alignment": "era-neutral stock music, anachronistic instrumentation, generic soundtrack pastiche",
    "repetitive_form": "unchanged eight-bar repetition, static arrangement, copy-pasted loop, one-section form",
    "abrupt_ending": "hard cut, abrupt ending, empty tail, premature silence, final impact hit",
    "poor_loop": "pickup-only opening, hard final cadence, unmatched ending texture, loop discontinuity",
    "excessive_foreground_melody": "soloist, dominant lead melody, memorable anthem, foreground theme, virtuosic feature",
    "weak_contrast": "single unchanging section, flat dynamics, static orchestration, no sectional development",
    "unstable_tempo": "tempo drift, rubato breakdown, meter change, accelerando, ritardando, stop-start pulse",
}


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def csv_text(rows: list[dict[str, Any]], fields: list[str]) -> str:
    buffer = io.StringIO(newline="")
    writer = csv.DictWriter(buffer, fieldnames=fields, extrasaction="ignore", lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()


def text_sha(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def number(row: dict[str, Any], key: str, fallback: float = 0.0) -> float:
    try:
        value = float(row.get(key, fallback))
    except (TypeError, ValueError):
        return fallback
    return value if math.isfinite(value) else fallback


def clip(value: float) -> float:
    return max(0.0, min(1.0, float(value)))


def append_negative(base: str, clause: str) -> str:
    base = base.strip().rstrip(" ,")
    existing = base.lower()
    additions = [item.strip() for item in clause.split(",") if item.strip()]
    fresh = [item for item in additions if item.lower() not in existing]
    return base if not fresh else f"{base}, {', '.join(fresh)}"


def parse_bool(value: Any) -> bool:
    return str(value).strip().lower() in {"true", "1", "yes", "pass", "passed"}


def weakness_scores(row: dict[str, Any], abrupt_signal: str = "") -> dict[str, float]:
    density = number(row, "spectral_density_signal")
    onset = number(row, "onset_density_per_second")
    era = number(row, "period_association_proxy", number(row, "era_description_alignment_signal"))
    repetition = number(row, "repetition_signal")
    sections = number(row, "section_count_estimate", 3.0)
    loop_quality = number(row, "loop_seam_quality_signal", 0.5)
    melody = number(row, "melodic_prominence_signal", 0.5)
    background = number(row, "background_tendency_signal", 0.14)
    dynamic_range = number(row, "dynamic_range_db", 14.0)
    tempo_stability = number(row, "tempo_stability_signal", 0.97)
    return {
        "excessive_density": max(clip((density - 0.55) / 0.25), clip((onset - 5.0) / 4.0)),
        "weak_era_alignment": clip(((1.0 / 9.0) - era) / (1.0 / 9.0)),
        "repetitive_form": clip(0.70 * clip((repetition - 0.985) / 0.014) + 0.30 * clip((3.0 - sections) / 2.0)),
        "abrupt_ending": 1.0 if str(abrupt_signal).upper() == "SEVERE" else 0.0,
        "poor_loop": clip((0.60 - loop_quality) / 0.60),
        "excessive_foreground_melody": clip(
            0.60 * clip((melody - 0.72) / 0.28) + 0.40 * clip((0.14 - background) / 0.14)
        ),
        "weak_contrast": clip(0.60 * clip((14.0 - dynamic_range) / 10.0) + 0.40 * clip((3.0 - sections) / 2.0)),
        "unstable_tempo": clip((0.97 - tempo_stability) / 0.08),
    }


def weakest_dimension(row: dict[str, Any], abrupt_signal: str = "") -> tuple[str, dict[str, float]]:
    scores = weakness_scores(row, abrupt_signal)
    dimension = max(DIMENSION_ORDER, key=lambda key: (scores[key], -DIMENSION_ORDER.index(key)))
    return dimension, scores


def prompt_maps() -> tuple[dict[str, dict[str, str]], list[dict[str, str]]]:
    canonical_rows = read_csv(CANONICAL_PROMPTS)
    if len(canonical_rows) != 144:
        raise RuntimeError("canonical prompt catalogue must contain 144 rows")
    canonical: dict[str, dict[str, str]] = {}
    unique_rows = []
    for row in canonical_rows:
        prompt_id = row["prompt_id"]
        normalized = {
            "prompt_id": prompt_id,
            "epoch": row["epoch_alias"],
            "family": row["family_name"],
            "positive_prompt": row["positive_prompt"],
            "negative_prompt": row["negative_prompt"],
            "source_prompt_provenance": row["source_prompt_provenance"],
        }
        if prompt_id in canonical and canonical[prompt_id] != normalized:
            raise RuntimeError(f"canonical prompt differs within family: {prompt_id}")
        if prompt_id not in canonical:
            canonical[prompt_id] = normalized
            unique_rows.append(normalized)
    if len(canonical) != 36:
        raise RuntimeError("canonical prompt catalogue must collapse to 36 unique families")
    rescue: dict[str, dict[str, str]] = {}
    if RESCUE_PROMPTS.is_file():
        for row in read_csv(RESCUE_PROMPTS):
            rescue[row["prompt_id"]] = {
                "prompt_id": row["prompt_id"],
                "epoch": row["epoch"],
                "family": row["family_name"],
                "positive_prompt": row["positive_prompt"],
                "negative_prompt": row["negative_prompt"],
                "source_prompt_provenance": row["source_prompt_provenance"],
            }
    return {**canonical, **rescue}, unique_rows


def source_screen_map() -> dict[str, dict[str, str]]:
    mapping = {}
    for path in (CANONICAL_SCREEN, RESCUE_SCREEN):
        if path.is_file():
            for row in read_csv(path):
                mapping[row["candidate_id"]] = row
    return mapping


def choose_sources() -> list[dict[str, Any]]:
    rows = read_csv(RANKING_INPUT)
    by_epoch: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in rows:
        eligible = (
            parse_bool(row.get("technical_automatic_pass"))
            and not parse_bool(row.get("severe_machine_mismatch"))
            and row.get("machine_label") != "MACHINE-REJECTED"
            and row.get("source_screening_status") != "MACHINE_REJECTED"
        )
        if eligible:
            by_epoch[row["epoch"]].append(row)
    if set(by_epoch) != set(EPOCHS):
        raise RuntimeError(f"eligible ranking does not cover exactly nine epochs: {sorted(by_epoch)}")
    screens = source_screen_map()
    selected = []
    for order, (epoch, seed) in enumerate(zip(EPOCHS, REFINEMENT_SEEDS, strict=True), start=1):
        source = sorted(by_epoch[epoch], key=lambda row: (-number(row, "machine_score"), row["candidate_id"]))[0]
        actual_hash = sha256_file(Path(source["absolute_path"]))
        if actual_hash != source["source_sha256"]:
            raise RuntimeError(f"frozen source hash mismatch: {source['candidate_id']}")
        abrupt = screens.get(source["candidate_id"], {}).get("abrupt_ending_signal", "")
        dimension, scores = weakest_dimension(source, abrupt)
        selected.append({
            **source,
            "epoch_order": order,
            "refinement_seed": seed,
            "weakest_dimension": dimension,
            "weakness_scores": scores,
            "source_abrupt_ending_signal": abrupt,
        })
    return selected


def build_argv(revision: dict[str, Any], output: Path) -> list[str]:
    return [
        str(PYTHON), str(SCRIPT.relative_to(TOOLING_ROOT)),
        "--prompt", revision["positive_prompt"], "--negative-prompt", revision["negative_prompt"],
        "--dit", "sm-music", "--decoder", "same-s", "--seconds", "120", "--steps", "8",
        "--seed", str(revision["refinement_seed"]), "--init-noise-level", "1.0", "--cfg", "2.0",
        "--apg", "1.0", "--dit-dtype", "fp16", "--free-models", "--out", str(output),
    ]


def plan() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    prompts, canonical_unique = prompt_maps()
    selected = choose_sources()
    revisions = []
    commands = []
    replaced_parent_ids = set()
    for source in selected:
        analysis_prompt_id = source.get("analysis_prompt_id") or source["prompt_id"]
        if analysis_prompt_id not in prompts:
            raise RuntimeError(f"source prompt is absent from prompt registers: {analysis_prompt_id}")
        prompt = prompts[analysis_prompt_id]
        parent_prompt_id = source.get("parent_prompt_id") or source["prompt_id"]
        revision_id = f"{parent_prompt_id}-F1"
        dimension = source["weakest_dimension"]
        positive = f"{prompt['positive_prompt'].strip()} {POSITIVE_REVISIONS[dimension]}"
        negative = append_negative(prompt["negative_prompt"], NEGATIVE_REVISIONS[dimension])
        output = RAW_ROOT / source["epoch"] / "refinement-f1" / f"{revision_id}__seed-{source['refinement_seed']}.wav"
        revision = {
            "revision_id": revision_id,
            "prompt_id": revision_id,
            "refinement_round": "F1_ONLY",
            "epoch_order": source["epoch_order"],
            "epoch": source["epoch"],
            "epoch_alias": source["epoch"],
            "parent_prompt_id": parent_prompt_id,
            "source_analysis_prompt_id": analysis_prompt_id,
            "source_candidate_id": source["candidate_id"],
            "source_sha256": source["source_sha256"],
            "source_machine_score": source["machine_score"],
            "prompt_family": prompt["family"],
            "family_name": prompt["family"],
            "weakest_dimension": dimension,
            "weakness_score": round(source["weakness_scores"][dimension], 8),
            "weakness_scores_json": json.dumps(source["weakness_scores"], sort_keys=True, separators=(",", ":")),
            "weakness_formula_version": TOOL_VERSION,
            "original_positive_prompt": prompt["positive_prompt"],
            "original_positive_prompt_sha256": text_sha(prompt["positive_prompt"]),
            "original_negative_prompt": prompt["negative_prompt"],
            "original_negative_prompt_sha256": text_sha(prompt["negative_prompt"]),
            "positive_prompt": positive,
            "positive_prompt_sha256": text_sha(positive),
            "negative_prompt": negative,
            "negative_prompt_sha256": text_sha(negative),
            "targeted_positive_revision": POSITIVE_REVISIONS[dimension],
            "targeted_negative_revision": NEGATIVE_REVISIONS[dimension],
            "refinement_seed": source["refinement_seed"],
            "revision_limit": 1,
            "automatic_shortlist_replacement": "FORBIDDEN",
            "source_prompt_provenance": "PHASE_F_BOUNDED_TARGETED_REVISION_FROM_FROZEN_SOURCE",
            "status": RIGHTS_STATUS,
        }
        revisions.append(revision)
        commands.append({
            "candidate_id": output.stem,
            "revision_id": revision_id,
            "parent_prompt_id": parent_prompt_id,
            "source_candidate_id": source["candidate_id"],
            "source_sha256": source["source_sha256"],
            "epoch": source["epoch"],
            "epoch_order": source["epoch_order"],
            "prompt_family": prompt["family"],
            "weakest_dimension": dimension,
            "seed": source["refinement_seed"],
            "cwd": str(TOOLING_ROOT),
            "argv": build_argv(revision, output),
            "environment_safe": {"HF_HUB_OFFLINE": "1", "HF_HUB_DISABLE_TELEMETRY": "1", "TRANSFORMERS_OFFLINE": "1"},
            "planned_output": str(output),
            "generation_tuple": GENERATION_TUPLE,
            "process_priority_nice": 10,
            "status": "PLANNED_F1_ONLY",
            "rights_status": RIGHTS_STATUS,
        })
        if parent_prompt_id in replaced_parent_ids:
            raise RuntimeError(f"multiple epoch revisions target one parent family: {parent_prompt_id}")
        replaced_parent_ids.add(parent_prompt_id)
    if len(revisions) != 9 or len(commands) != 9 or len({row["refinement_seed"] for row in revisions}) != 9:
        raise RuntimeError("Phase F must plan exactly nine one-shot fixed-seed revisions")

    replacement = {row["parent_prompt_id"]: row for row in revisions}
    jury_rows = []
    for canonical in canonical_unique:
        if canonical["prompt_id"] in replacement:
            revision = replacement[canonical["prompt_id"]]
            jury_rows.append({
                "prompt_id": revision["prompt_id"], "epoch": revision["epoch"], "epoch_alias": revision["epoch"],
                "family": revision["prompt_family"], "prompt_family": revision["prompt_family"],
                "family_name": revision["family_name"], "positive_prompt": revision["positive_prompt"],
                "negative_prompt": revision["negative_prompt"], "parent_prompt_id": revision["parent_prompt_id"],
                "refinement_round": "F1_ONLY", "source_prompt_provenance": revision["source_prompt_provenance"],
                "status": RIGHTS_STATUS,
            })
        else:
            jury_rows.append({
                "prompt_id": canonical["prompt_id"], "epoch": canonical["epoch"], "epoch_alias": canonical["epoch"],
                "family": canonical["family"], "prompt_family": canonical["family"], "family_name": canonical["family"],
                "positive_prompt": canonical["positive_prompt"], "negative_prompt": canonical["negative_prompt"],
                "parent_prompt_id": "", "refinement_round": "", "source_prompt_provenance": canonical["source_prompt_provenance"],
                "status": RIGHTS_STATUS,
            })
    counts = defaultdict(int)
    for row in jury_rows:
        counts[row["epoch"]] += 1
    if len(jury_rows) != 36 or len({row["prompt_id"] for row in jury_rows}) != 36 or set(counts.values()) != {4}:
        raise RuntimeError("refinement jury register must contain 36 unique prompts and four families per epoch")

    revision_text = csv_text(revisions, list(revisions[0]))
    revision_json = json.dumps({"tool_version": TOOL_VERSION, "revisions": revisions, "status": RIGHTS_STATUS}, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
    commands_text = "\n".join(json.dumps(row, sort_keys=True, ensure_ascii=False) for row in commands) + "\n"
    jury_text = csv_text(jury_rows, list(jury_rows[0]))
    for path, text in ((PROMPT_CSV, revision_text), (PROMPT_JSON, revision_json), (COMMANDS_PATH, commands_text), (JURY_PROMPTS, jury_text)):
        if path.exists() and path.read_text(encoding="utf-8") != text:
            raise RuntimeError(f"locked refinement plan differs; refusing rewrite: {path}")
        atomic_write_text(path, text)
    plan_record = {
        "generated_utc": utc_now(), "tool_version": TOOL_VERSION, "status": "PLANNED_F1_ONLY",
        "source_ranking": {"path": str(RANKING_INPUT), "sha256": sha256_file(RANKING_INPUT)},
        "counts": {"epochs": 9, "source_candidates": 9, "prompt_revisions": 9, "planned_raw": 9, "maximum_per_epoch": 1},
        "fixed_seed_by_epoch": dict(zip(EPOCHS, REFINEMENT_SEEDS, strict=True)),
        "dimension_order_tie_break": DIMENSION_ORDER,
        "weakness_formula": {
            "excessive_density": "max(clip((spectral_density-.55)/.25),clip((onset_density-5)/4))",
            "weak_era_alignment": "clip(((1/9)-period_association)/(1/9))",
            "repetitive_form": ".70*clip((repetition-.985)/.014)+.30*clip((3-sections)/2)",
            "abrupt_ending": "1 only for V3 SEVERE; otherwise 0",
            "poor_loop": "clip((.60-loop_seam_quality)/.60)",
            "excessive_foreground_melody": ".60*clip((melody-.72)/.28)+.40*clip((.14-background)/.14)",
            "weak_contrast": ".60*clip((14-dynamic_range)/10)+.40*clip((3-sections)/2)",
            "unstable_tempo": "clip((.97-tempo_stability)/.08)",
        },
        "outputs": {
            "revisions": {"path": str(PROMPT_CSV), "sha256": sha256_file(PROMPT_CSV)},
            "commands": {"path": str(COMMANDS_PATH), "sha256": sha256_file(COMMANDS_PATH)},
            "jury_prompt_register_36": {"path": str(JURY_PROMPTS), "sha256": sha256_file(JURY_PROMPTS)},
        },
        "automatic_shortlist_replacement": "FORBIDDEN", "rights_status": RIGHTS_STATUS,
    }
    atomic_write_json(PLAN_PATH, plan_record)
    return revisions, commands


def append_jsonl(path: Path, record: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor = os.open(path, os.O_WRONLY | os.O_APPEND | os.O_CREAT, 0o644)
    try:
        os.write(descriptor, (json.dumps(record, sort_keys=True, ensure_ascii=False) + "\n").encode("utf-8"))
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def read_generation_log() -> dict[str, list[dict[str, Any]]]:
    mapping: dict[str, list[dict[str, Any]]] = defaultdict(list)
    if GEN_LOG.is_file():
        for line_number, line in enumerate(GEN_LOG.read_text(encoding="utf-8").splitlines(), start=1):
            try:
                record = json.loads(line)
            except json.JSONDecodeError as error:
                raise RuntimeError(f"malformed refinement generation log line {line_number}: {error}") from error
            mapping[record["candidate_id"]].append(record)
    return mapping


def validate_wav(path: Path) -> dict[str, Any]:
    info = sf.info(path)
    if info.format != "WAV" or info.subtype != "PCM_16" or info.channels != 2 or info.samplerate != 44100 or info.frames != 5292000 or abs(info.duration - 120.0) > 1e-6:
        raise RuntimeError(f"refinement WAV mismatch: {path}: {info}")
    return {"bytes": path.stat().st_size, "sha256": sha256_file(path), "format": info.format, "subtype": info.subtype, "channels": info.channels, "sample_rate": info.samplerate, "frames": info.frames, "duration_seconds": info.duration}


def generation_processes() -> list[str]:
    result = subprocess.run(["ps", "-axo", "pid=,command="], check=True, capture_output=True, text=True)
    return [line.strip() for line in result.stdout.splitlines() if "sa3_mlx.py" in line.lower()]


def validate_route() -> dict[str, Any]:
    head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=CODE_ROOT, check=True, capture_output=True, text=True).stdout.strip()
    if head != EXPECTED_CODE_COMMIT:
        raise RuntimeError(f"Stable Audio code commit mismatch: {head}")
    weights = []
    for name, expected in WEIGHT_HASHES.items():
        path = WEIGHTS_ROOT / name
        actual = sha256_file(path)
        if actual != expected:
            raise RuntimeError(f"weight hash mismatch: {name}")
        weights.append({"path": str(path), "bytes": path.stat().st_size, "sha256": actual})
    version = subprocess.run([str(PYTHON), "--version"], check=True, capture_output=True, text=True)
    if "3.12.14" not in version.stdout + version.stderr:
        raise RuntimeError("unexpected generation Python")
    return {"validated_utc": utc_now(), "generation_tuple": GENERATION_TUPLE, "weights": weights, "python": (version.stdout + version.stderr).strip(), "rights_status": RIGHTS_STATUS}


def build_inventory(commands: list[dict[str, Any]], logs: dict[str, list[dict[str, Any]]]) -> list[dict[str, Any]]:
    rows = []
    for command in commands:
        successes = [row for row in logs.get(command["candidate_id"], []) if row.get("status") == "SUCCESS"]
        if len(successes) != 1:
            continue
        record = successes[0]
        path = Path(record["output"])
        metrics = validate_wav(path)
        if metrics["sha256"] != record["output_sha256"] or metrics["bytes"] != record["output_bytes"]:
            raise RuntimeError(f"refinement log/raw mismatch: {command['candidate_id']}")
        rows.append({
            "absolute_path": str(path), "bytes": metrics["bytes"], "sha256": metrics["sha256"],
            "candidate_id": command["candidate_id"], "epoch": command["epoch"], "prompt_id": command["revision_id"],
            "parent_prompt_id": command["parent_prompt_id"], "source_candidate_id": command["source_candidate_id"],
            "source_sha256": command["source_sha256"], "prompt_family": command["prompt_family"], "seed": command["seed"],
            "weakest_dimension": command["weakest_dimension"],
            "generation_tuple": json.dumps(GENERATION_TUPLE, sort_keys=True, separators=(",", ":")),
            "refinement_round": "F1_ONLY", "screening_status": "PENDING_REFINEMENT_SCREENING_V3",
            "analysis_status": SIGNAL_STATUS, "rights_status": RIGHTS_STATUS,
        })
    fields = list(rows[0]) if rows else ["absolute_path", "bytes", "sha256", "candidate_id"]
    atomic_write_text(INVENTORY_PATH, csv_text(rows, fields))
    return rows


def generate() -> None:
    if datetime.now(timezone.utc) >= LARGE_GENERATION_CUTOFF:
        raise RuntimeError("hour-84 large-generation cutoff reached")
    _, commands = plan()
    route = validate_route()
    atomic_write_json(ROUTE_PATH, route)
    require_generation_safety()
    if generation_processes():
        raise RuntimeError("another Stable Audio inference process is active")
    environment = os.environ.copy()
    environment.update({"HF_HUB_OFFLINE": "1", "HF_HUB_DISABLE_TELEMETRY": "1", "TRANSFORMERS_OFFLINE": "1"})
    logs = read_generation_log()
    for index, command in enumerate(commands, start=1):
        candidate_id = command["candidate_id"]
        output = Path(command["planned_output"])
        successes = [row for row in logs.get(candidate_id, []) if row.get("status") == "SUCCESS"]
        if successes:
            if len(successes) != 1 or output.is_symlink() or validate_wav(output)["sha256"] != successes[0]["output_sha256"]:
                raise RuntimeError(f"invalid refinement resume state: {candidate_id}")
            print(f"[{index}/9] VERIFIED-SKIP {candidate_id}", flush=True)
            continue
        if logs.get(candidate_id):
            raise RuntimeError(f"prior failed refinement may not be retried: {candidate_id}")
        if output.exists() or output.is_symlink():
            raise FileExistsError(f"unlogged refinement raw exists: {output}")
        if retained_bytes() + 22_000_000 >= DISK_CAP_BYTES:
            raise RuntimeError("predictive 80 GiB cap reached")
        if datetime.now(timezone.utc) >= LARGE_GENERATION_CUTOFF:
            raise RuntimeError("hour-84 cutoff reached during refinement queue")
        require_generation_safety()
        if generation_processes():
            raise RuntimeError("parallel Stable Audio inference is forbidden")
        output.parent.mkdir(parents=True, exist_ok=True)
        descriptor, temp_name = tempfile.mkstemp(prefix=f".{candidate_id}.", suffix=".wav", dir=output.parent)
        os.close(descriptor)
        temporary = Path(temp_name)
        temporary.unlink()
        argv = list(command["argv"])
        argv[-1] = str(temporary)
        stdout_path = GEN_LOG_ROOT / "candidates" / f"{candidate_id}.stdout.txt"
        stderr_path = GEN_LOG_ROOT / "candidates" / f"{candidate_id}.stderr.txt"
        if stdout_path.exists() or stderr_path.exists():
            raise FileExistsError(f"refinement attempt log exists: {candidate_id}")
        started = utc_now()
        print(f"[{index}/9] START {candidate_id} target={command['weakest_dimension']}", flush=True)
        completed = subprocess.run(argv, cwd=TOOLING_ROOT, env=environment, capture_output=True, text=True, check=False, preexec_fn=lambda: os.nice(10))
        atomic_write_text(stdout_path, completed.stdout)
        atomic_write_text(stderr_path, completed.stderr)
        record = {
            **command, "argv": argv, "started_utc": started, "ended_utc": utc_now(), "return_code": completed.returncode,
            "stdout": {"path": str(stdout_path), "sha256": sha256_file(stdout_path)},
            "stderr": {"path": str(stderr_path), "sha256": sha256_file(stderr_path)},
        }
        if completed.returncode != 0:
            failed = GEN_LOG_ROOT / "failed-generation-artifacts" / f"{candidate_id}.wav"
            if temporary.exists():
                failed.parent.mkdir(parents=True, exist_ok=True)
                os.link(temporary, failed); os.chmod(failed, 0o444); temporary.unlink()
            record.update({"status": "FAILED", "error": f"generator returned {completed.returncode}", "preserved_partial": str(failed) if failed.exists() else None})
            append_jsonl(GEN_LOG, record)
            raise RuntimeError(record["error"])
        metrics = validate_wav(temporary)
        os.link(temporary, output); os.chmod(output, 0o444); temporary.unlink()
        record.update({"status": "SUCCESS", "output": str(output), **{f"output_{key}": value for key, value in metrics.items()}})
        append_jsonl(GEN_LOG, record)
        logs[candidate_id].append(record)
        print(f"[{index}/9] DONE {candidate_id} {metrics['sha256'][:12]}", flush=True)
    inventory = build_inventory(commands, read_generation_log())
    if len(inventory) != 9 or len({row["sha256"] for row in inventory}) != 9:
        raise RuntimeError("refinement generation did not reconcile nine unique raw sources")
    atomic_write_json(GEN_LOG_ROOT / "generation-summary.json", {
        "generated_utc": utc_now(), "tool_version": TOOL_VERSION, "status": "PASS", "raw_candidates": 9,
        "inventory": {"path": str(INVENTORY_PATH), "sha256": sha256_file(INVENTORY_PATH)},
        "generation_log": {"path": str(GEN_LOG), "sha256": sha256_file(GEN_LOG)},
        "automatic_shortlist_replacement": "FORBIDDEN", "rights_status": RIGHTS_STATUS,
    })


def screen() -> None:
    inventory = read_csv(INVENTORY_PATH)
    if len(inventory) != 9:
        raise RuntimeError("refinement inventory must contain nine rows")
    # Key by frozen source candidate, since refinement inventory names both.
    source_rows = {row["candidate_id"]: row for row in choose_sources()}
    output_rows = []
    detail_lines = []
    fingerprints: dict[str, tuple[np.ndarray, np.ndarray]] = {}
    source_fingerprints: dict[str, tuple[np.ndarray, np.ndarray]] = {}
    for index, item in enumerate(inventory, start=1):
        path = Path(item["absolute_path"])
        if sha256_file(path) != item["sha256"]:
            raise RuntimeError(f"refinement source hash mismatch: {item['candidate_id']}")
        metrics, spectral, envelope = analyze_audio(path, item["sha256"], SCREEN_CACHE)
        source = source_rows[item["source_candidate_id"]]
        source_metrics, source_spectral, source_envelope = analyze_audio(Path(source["absolute_path"]), source["source_sha256"], SCREEN_CACHE)
        fingerprints[item["candidate_id"]] = (spectral, envelope)
        source_fingerprints[item["source_candidate_id"]] = (source_spectral, source_envelope)
        spectral_similarity = float(np.dot(spectral, source_spectral)) if spectral.shape == source_spectral.shape and spectral.size > 1 else math.nan
        envelope_similarity = float(np.dot(envelope, source_envelope)) if envelope.shape == source_envelope.shape and envelope.size > 1 else math.nan
        reasons = list(metrics.get("base_failure_reasons", []))
        if item["sha256"] == source["source_sha256"]:
            reasons.append(f"EXACT_DUPLICATE_OF_SOURCE:{source['candidate_id']}")
        elif math.isfinite(spectral_similarity) and math.isfinite(envelope_similarity) and spectral_similarity >= NEAR_DUPLICATE_FINGERPRINT_COSINE and envelope_similarity >= NEAR_DUPLICATE_ENVELOPE_CORRELATION:
            reasons.append(f"NEAR_DUPLICATE_OF_SOURCE:{source['candidate_id']}")
        passed = not reasons
        row = {
            **item,
            "source_candidate_id": source["candidate_id"], "source_sha256": source["source_sha256"],
            "technical_automatic_pass": str(passed).upper(), "screening_status": "MACHINE_ELIGIBLE" if passed else "MACHINE_REJECTED",
            "automatic_failure_reasons": ";".join(sorted(set(reasons))),
            "technical_warnings": ";".join(metrics.get("technical_warnings", [])),
            "measurement_status": metrics.get("analysis_status", ""),
            **{key: value for key, value in metrics.items() if key not in {"analysis_status", "base_failure_reasons", "technical_warnings"}},
            "source_fingerprint_cosine": spectral_similarity, "source_envelope_correlation": envelope_similarity,
            "screening_version": SCREENING_VERSION, "analysis_status": SIGNAL_STATUS, "rights_status": RIGHTS_STATUS,
        }
        output_rows.append(row)
        detail_lines.append(json.dumps({"candidate_id": item["candidate_id"], "source_candidate_id": source["candidate_id"], "metrics": metrics, "source_metrics": source_metrics, "technical_reasons": reasons, "status": SIGNAL_STATUS}, sort_keys=True, allow_nan=False))
        print(f"[{index}/9] SCREEN {item['candidate_id']} {'PASS' if passed else 'FAIL'}", flush=True)

    # Compare refinement renders with one another after every fingerprint is
    # available.  Retain the earlier epoch-order candidate deterministically
    # and reject only the later duplicate; sources and raw files stay intact.
    for left_index, left in enumerate(inventory):
        for right in inventory[left_index + 1 :]:
            left_spectral, left_envelope = fingerprints[left["candidate_id"]]
            right_spectral, right_envelope = fingerprints[right["candidate_id"]]
            compatible = left_spectral.shape == right_spectral.shape and left_spectral.size > 1
            spectral_score = float(np.dot(left_spectral, right_spectral)) if compatible else math.nan
            envelope_score = float(np.dot(left_envelope, right_envelope)) if compatible and left_envelope.shape == right_envelope.shape else math.nan
            exact = left["sha256"] == right["sha256"]
            near = (
                not exact and math.isfinite(spectral_score) and math.isfinite(envelope_score)
                and spectral_score >= NEAR_DUPLICATE_FINGERPRINT_COSINE
                and envelope_score >= NEAR_DUPLICATE_ENVELOPE_CORRELATION
            )
            if exact or near:
                loser = next(row for row in output_rows if row["candidate_id"] == right["candidate_id"])
                reason = "EXACT_DUPLICATE_OF_REFINEMENT" if exact else "NEAR_DUPLICATE_OF_REFINEMENT"
                prior = [item for item in loser["automatic_failure_reasons"].split(";") if item]
                prior.append(f"{reason}:{left['candidate_id']}")
                loser["automatic_failure_reasons"] = ";".join(sorted(set(prior)))
                loser["technical_automatic_pass"] = "FALSE"
                loser["screening_status"] = "MACHINE_REJECTED"
    atomic_write_text(SCREEN_CSV, csv_text(output_rows, list(output_rows[0])))
    atomic_write_text(SCREEN_DETAILS, "\n".join(detail_lines) + "\n")
    jury_rows = []
    for item, screen_row in zip(inventory, output_rows, strict=True):
        if screen_row["technical_automatic_pass"] == "TRUE":
            jury_rows.append({**item, "screening_status": "MACHINE_ELIGIBLE", "screening_gate": "V3_REFINEMENT_F1", "technical_automatic_pass": "TRUE", "rights_status": RIGHTS_STATUS})
    atomic_write_text(JURY_READY, csv_text(jury_rows, list(jury_rows[0]) if jury_rows else list(inventory[0])))
    summary = {
        "generated_utc": utc_now(), "tool_version": TOOL_VERSION, "screening_version": SCREENING_VERSION,
        "status": "PASS", "classification": SIGNAL_STATUS,
        "counts": {"rendered": 9, "technical_eligible": len(jury_rows), "technical_rejected": 9 - len(jury_rows)},
        "outputs": {"technical": {"path": str(SCREEN_CSV), "sha256": sha256_file(SCREEN_CSV)}, "jury_ready": {"path": str(JURY_READY), "sha256": sha256_file(JURY_READY)}},
        "family_pass_law": "NOT_APPLICABLE_TO_ONE_SHOT_REFINEMENT_LANE",
        "automatic_shortlist_replacement": "FORBIDDEN", "rights_status": RIGHTS_STATUS,
    }
    atomic_write_json(SCREEN_SUMMARY, summary)


def jury() -> None:
    inventory = read_csv(JURY_READY)
    expected = len(inventory)
    if expected < 1 or expected > 9:
        raise RuntimeError(f"invalid refinement jury-ready count: {expected}")
    if len(read_csv(JURY_PROMPTS)) != 36:
        raise RuntimeError("refinement jury prompt register must contain 36 rows")
    if not JURY_PYTHON.is_file() or not JURY_SCRIPT.is_file():
        raise RuntimeError("jury runtime or script missing")
    environment = os.environ.copy()
    environment.update({"HF_HUB_OFFLINE": "1", "HF_HUB_DISABLE_TELEMETRY": "1", "TRANSFORMERS_OFFLINE": "1"})
    argv = [
        str(JURY_PYTHON), str(JURY_SCRIPT), "--inventory", str(JURY_READY), "--prompts", str(JURY_PROMPTS),
        "--output", str(JURY_OUTPUT), "--screening-csv", str(SCREEN_CSV), "--expected-count", str(expected),
    ]
    completed = subprocess.run(argv, cwd=JURY_SCRIPT.parent, env=environment, capture_output=True, text=True, check=False)
    stdout = ANALYSIS_ROOT / "machine-jury.stdout.txt"; stderr = ANALYSIS_ROOT / "machine-jury.stderr.txt"
    atomic_write_text(stdout, completed.stdout); atomic_write_text(stderr, completed.stderr)
    if completed.returncode != 0:
        raise RuntimeError(f"refinement CLAP jury failed ({completed.returncode}): {completed.stderr[-3000:]}")
    rows = read_csv(JURY_OUTPUT)
    if len(rows) != expected:
        raise RuntimeError("refinement jury output count mismatch")
    atomic_write_json(ANALYSIS_ROOT / "machine-jury-run.json", {
        "generated_utc": utc_now(), "status": "PASS", "classification": SIGNAL_STATUS,
        "argv": argv, "environment_safe": {"HF_HUB_OFFLINE": "1", "HF_HUB_DISABLE_TELEMETRY": "1", "TRANSFORMERS_OFFLINE": "1"},
        "candidate_count": expected, "prompt_register_count": 36,
        "output": {"path": str(JURY_OUTPUT), "sha256": sha256_file(JURY_OUTPUT)},
        "stdout": {"path": str(stdout), "sha256": sha256_file(stdout)}, "stderr": {"path": str(stderr), "sha256": sha256_file(stderr)},
        "rights_status": RIGHTS_STATUS,
    })


def compare() -> None:
    sources = {row["epoch"]: row for row in choose_sources()}
    inventory = read_csv(INVENTORY_PATH)
    screens = {row["candidate_id"]: row for row in read_csv(SCREEN_CSV)}
    juries = {row["candidate_id"]: row for row in read_csv(JURY_OUTPUT)} if JURY_OUTPUT.is_file() else {}
    rows = []
    for item in inventory:
        source = sources[item["epoch"]]
        screen_row = screens[item["candidate_id"]]
        jury_row = juries.get(item["candidate_id"])
        source_scores = source["weakness_scores"]
        if jury_row:
            revised_scores = weakness_scores(jury_row, screen_row.get("abrupt_ending_signal", ""))
            target_before = source_scores[item["weakest_dimension"]]
            target_after = revised_scores[item["weakest_dimension"]]
            target_delta = target_after - target_before
            score_delta = number(jury_row, "machine_score") - number(source, "machine_score")
        else:
            revised_scores = {}
            target_before = source_scores[item["weakest_dimension"]]
            target_after = math.nan
            target_delta = math.nan
            score_delta = math.nan
        technical_pass = parse_bool(screen_row.get("technical_automatic_pass"))
        severe = parse_bool(jury_row.get("severe_machine_mismatch")) if jury_row else False
        if not technical_pass:
            outcome = "REVISION_MACHINE_REJECTED_KEEP_BOTH_NO_REPLACEMENT"
        elif not jury_row:
            outcome = "REVISION_JURY_UNAVAILABLE_KEEP_BOTH_NO_REPLACEMENT"
        elif severe:
            outcome = "REVISION_SEVERE_JURY_MISMATCH_KEEP_BOTH_NO_REPLACEMENT"
        elif target_delta <= -0.02 and score_delta >= -0.03:
            outcome = "TARGET_SIGNAL_IMPROVED_KEEP_BOTH_FOR_OWNER_AUDITION"
        elif target_delta <= -0.02:
            outcome = "TARGET_SIGNAL_IMPROVED_OVERALL_TRADEOFF_KEEP_BOTH"
        elif score_delta > 0:
            outcome = "OVERALL_SIGNAL_IMPROVED_TARGET_MIXED_KEEP_BOTH"
        else:
            outcome = "NO_MACHINE_IMPROVEMENT_KEEP_BOTH_NO_REPLACEMENT"
        rows.append({
            "epoch_order": EPOCHS.index(item["epoch"]) + 1, "epoch": item["epoch"],
            "source_candidate_id": source["candidate_id"], "source_sha256": source["source_sha256"],
            "source_prompt_id": source.get("analysis_prompt_id") or source["prompt_id"], "source_machine_score": source["machine_score"],
            "refinement_candidate_id": item["candidate_id"], "refinement_sha256": item["sha256"], "refinement_prompt_id": item["prompt_id"],
            "refinement_seed": item["seed"], "weakest_dimension": item["weakest_dimension"],
            "source_weakness_score": round(target_before, 8), "refinement_weakness_score": "" if math.isnan(target_after) else round(target_after, 8),
            "weakness_delta_after_minus_before": "" if math.isnan(target_delta) else round(target_delta, 8),
            "source_all_weakness_scores": json.dumps(source_scores, sort_keys=True, separators=(",", ":")),
            "refinement_all_weakness_scores": json.dumps(revised_scores, sort_keys=True, separators=(",", ":")) if revised_scores else "",
            "technical_automatic_pass": screen_row.get("technical_automatic_pass", ""),
            "technical_failure_reasons": screen_row.get("automatic_failure_reasons", ""),
            "refinement_machine_score": jury_row.get("machine_score", "") if jury_row else "",
            "machine_score_delta": "" if math.isnan(score_delta) else round(score_delta, 8),
            "severe_machine_mismatch": jury_row.get("severe_machine_mismatch", "") if jury_row else "",
            "jury_mismatch_reasons": jury_row.get("mismatch_reasons", "") if jury_row else "",
            "comparison_outcome": outcome, "source_preserved": "TRUE", "refinement_preserved": "TRUE",
            "automatic_shortlist_replacement": "FORBIDDEN", "analysis_status": SIGNAL_STATUS, "rights_status": RIGHTS_STATUS,
        })
    rows.sort(key=lambda row: int(row["epoch_order"]))
    atomic_write_text(COMPARISON_CSV, csv_text(rows, list(rows[0])))
    summary = {
        "generated_utc": utc_now(), "tool_version": TOOL_VERSION, "status": "PASS", "classification": SIGNAL_STATUS,
        "counts": {
            "epochs": 9, "source_tracks_preserved": 9, "refinement_tracks_preserved": 9,
            "technical_pass": sum(row["technical_automatic_pass"] == "TRUE" for row in rows),
            "target_signal_improved": sum(row["comparison_outcome"] == "TARGET_SIGNAL_IMPROVED_KEEP_BOTH_FOR_OWNER_AUDITION" for row in rows),
            "target_signal_improved_overall_tradeoff": sum(row["comparison_outcome"] == "TARGET_SIGNAL_IMPROVED_OVERALL_TRADEOFF_KEEP_BOTH" for row in rows),
            "overall_signal_improved_target_mixed": sum(row["comparison_outcome"] == "OVERALL_SIGNAL_IMPROVED_TARGET_MIXED_KEEP_BOTH" for row in rows),
        },
        "rows": rows,
        "inputs": {
            "source_ranking": {"path": str(RANKING_INPUT), "sha256": sha256_file(RANKING_INPUT)},
            "refinement_inventory": {"path": str(INVENTORY_PATH), "sha256": sha256_file(INVENTORY_PATH)},
            "technical_screen": {"path": str(SCREEN_CSV), "sha256": sha256_file(SCREEN_CSV)},
            "machine_jury": {"path": str(JURY_OUTPUT), "sha256": sha256_file(JURY_OUTPUT)},
        },
        "comparison_csv": {"path": str(COMPARISON_CSV), "sha256": sha256_file(COMPARISON_CSV)},
        "automatic_shortlist_replacement": "FORBIDDEN",
        "limitations": [
            "Targeted metric movement is an analysis signal, not proof of audible improvement.",
            "No Owner or human listening acceptance occurred in this lane.",
            "No automated detector establishes copyright safety, cultural acceptance, or commercial clearance.",
        ],
        "rights_status": RIGHTS_STATUS,
    }
    atomic_write_json(COMPARISON_JSON, summary)
    write_integrity_manifest(rows)
    print(json.dumps(summary["counts"], indent=2))


def write_integrity_manifest(comparison_rows: list[dict[str, Any]]) -> None:
    inventory = read_csv(INVENTORY_PATH)
    raw = []
    for row in inventory:
        path = Path(row["absolute_path"])
        metrics = validate_wav(path)
        if metrics["sha256"] != row["sha256"] or metrics["bytes"] != int(row["bytes"]):
            raise RuntimeError(f"final refinement integrity mismatch: {row['candidate_id']}")
        raw.append({
            "candidate_id": row["candidate_id"], "path": str(path), "bytes": metrics["bytes"],
            "sha256": metrics["sha256"], "mode": oct(path.stat().st_mode & 0o777),
            "channels": metrics["channels"], "sample_rate": metrics["sample_rate"],
            "frames": metrics["frames"], "duration_seconds": metrics["duration_seconds"],
            "subtype": metrics["subtype"], "rights_status": RIGHTS_STATUS,
        })
    artifacts = [
        PROMPT_CSV, PROMPT_JSON, JURY_PROMPTS, COMMANDS_PATH, INVENTORY_PATH, PLAN_PATH, ROUTE_PATH,
        GEN_LOG, GEN_LOG_ROOT / "generation-summary.json", SCREEN_CSV, SCREEN_DETAILS, SCREEN_SUMMARY,
        JURY_READY, JURY_OUTPUT, JURY_OUTPUT.with_suffix(".summary.json"),
        ANALYSIS_ROOT / "machine-jury-run.json", COMPARISON_CSV, COMPARISON_JSON,
    ]
    missing = [str(path) for path in artifacts if not path.is_file()]
    if missing:
        raise FileNotFoundError(f"refinement integrity artifacts missing: {missing}")
    artifact_records = [
        {"path": str(path), "bytes": path.stat().st_size, "sha256": sha256_file(path)} for path in artifacts
    ]
    source_records = []
    selected_sources = {item["candidate_id"]: item for item in choose_sources()}
    for row in comparison_rows:
        path = selected_sources[row["source_candidate_id"]]["absolute_path"]
        if sha256_file(Path(path)) != row["source_sha256"]:
            raise RuntimeError(f"frozen original changed during refinement: {row['source_candidate_id']}")
        source_records.append({
            "candidate_id": row["source_candidate_id"], "path": path, "sha256": row["source_sha256"],
            "preserved": True,
        })
    manifest = {
        "generated_utc": utc_now(), "tool_version": TOOL_VERSION, "status": "PASS",
        "classification": SIGNAL_STATUS,
        "counts": {
            "frozen_sources": len(source_records), "raw_refinements": len(raw),
            "unique_refinement_ids": len({row["candidate_id"] for row in raw}),
            "unique_refinement_hashes": len({row["sha256"] for row in raw}),
            "technical_eligible": sum(row["technical_automatic_pass"] == "TRUE" for row in comparison_rows),
            "technical_rejected": sum(row["technical_automatic_pass"] != "TRUE" for row in comparison_rows),
        },
        "frozen_sources": source_records, "raw_refinements": raw, "artifacts": artifact_records,
        "automatic_shortlist_replacement": "FORBIDDEN", "source_and_revision_both_preserved": True,
        "rights_status": RIGHTS_STATUS,
    }
    if manifest["counts"]["frozen_sources"] != 9 or manifest["counts"]["raw_refinements"] != 9 or manifest["counts"]["unique_refinement_ids"] != 9 or manifest["counts"]["unique_refinement_hashes"] != 9:
        raise RuntimeError("final refinement integrity counts do not reconcile")
    atomic_write_json(INTEGRITY_PATH, manifest)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=("plan", "generate", "screen", "jury", "compare", "all"), default="plan")
    return parser.parse_args()


def main() -> None:
    mode = parse_args().mode
    if mode == "plan": plan()
    elif mode == "generate": generate()
    elif mode == "screen": screen()
    elif mode == "jury": jury()
    elif mode == "compare": compare()
    else:
        generate(); screen(); jury(); compare()


if __name__ == "__main__":
    main()
