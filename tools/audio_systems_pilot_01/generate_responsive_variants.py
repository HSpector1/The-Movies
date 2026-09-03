#!/usr/bin/env python3
"""Generate and derive the bounded three-epoch responsive music bundles."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Any

from audio_dsp import (
    derive_music_assets,
    file_record,
    normalize_music,
    publish_temp,
    require_file,
    technical_screen,
    write_manifest,
)
from common import PILOT_ROOT, TOOLING_ROOT, sha256_file, utc_now
from sfx_route import CODE_COMMIT, MUSIC_CANONICAL_REVISION, OPTIMIZED_REVISION, TOOLCHAIN


PYTHON = TOOLING_ROOT / ".phase2-venv-py312/bin/python"
GENERATOR = TOOLCHAIN / "optimized/mlx/scripts/sa3_mlx.py"
ROOT = PILOT_ROOT / "02_music-bundles/responsive"
RAW_ROOT = ROOT / "candidates"
BUNDLE_ROOT = ROOT / "bundles"
ANALYSIS_ROOT = ROOT / "analysis"
LOG_ROOT = PILOT_ROOT / "12_logs/responsive-generation"
REGISTER = ROOT / "responsive-generation-register.json"
BUNDLE_CATALOGUE = ROOT / "responsive-bundle-catalogue.json"
SEEDS = (271_003, 271_019, 271_043)
CONTEXTS = ("NORMAL", "ACTIVE", "BLOCKED", "WORKSPACE")


EPOCHS: dict[str, dict[str, Any]] = {
    "acoustic_electrical_1920_1932": {
        "code": "EARLY",
        "anchor_id": "FND-03__seed-130363",
        "anchor_seed": 130_363,
        "anchor_raw_sha256": "4771707e00bfa67d71c1daf947047f736358844a309b60fb56b28913dd53ef7b",
        "anchor_estimated_bpm": 92.285,
        "brief": (
            "Instrumental management background music with a cautious late-1920s to early-1930s "
            "acoustic-to-electrical studio palette: stride-influenced piano, cornet, clarinet, acoustic "
            "guitar, upright bass, brushed snare and woodblock. Use patient low-intensity call and "
            "response, humane craft energy, modest room scale, steady 92 BPM four-four, no dominant tune."
        ),
    },
    "format_plurality_1975_1986": {
        "code": "MID",
        "anchor_id": "FPL-01__seed-130363",
        "anchor_seed": 130_363,
        "anchor_raw_sha256": "02b5a57900e1f77f704bb9d73209f2d5a0de0ce0a49fa1f99e636504ac98e813",
        "anchor_estimated_bpm": 99.384,
        "brief": (
            "Instrumental management background music with a late-1970s to mid-1980s studio palette: "
            "live drums, syncopated electric bass, clavinet, electric piano, clean guitar, compact horns "
            "and restrained strings. Use an interlocking low-intensity pocket, warm ensemble craft, "
            "approximately 104 BPM four-four, restrained dynamics and no dominant hook."
        ),
    },
    "streaming_plural_2015_2029": {
        "code": "MODERN",
        "anchor_id": "SPL-02__seed-155921",
        "anchor_seed": 155_921,
        "anchor_raw_sha256": "2e3ae7cb9ada747846e2502bc05618dc941bb11456a60d966672f094bf130246",
        "anchor_estimated_bpm": 83.354,
        "brief": (
            "Instrumental management background music with a 2015-to-2029 networked studio palette: dry "
            "live and programmed drums, rounded bass, electric piano, muted guitar, soft modular synth and "
            "sparse wholly original edited fragments. Use a spacious restrained pocket near 84 BPM "
            "four-four, tactile human timing, speech-friendly dynamics and no dominant hook."
        ),
    },
}


CONTEXT_BRIEFS = {
    "NORMAL": (
        "NORMAL context: balanced low-intensity forward motion for routine planning. Keep all gestures "
        "patient, midground and loop-tolerant, with an even energy profile and a gentle open tail."
    ),
    "ACTIVE": (
        "ACTIVE context: add a little rhythmic articulation and purposeful ensemble motion while staying "
        "below foreground intensity. Avoid triumph, urgency, spectacle and any notification-like accent."
    ),
    "BLOCKED": (
        "BLOCKED context: reduce density and use suspended, gently questioning harmonic motion that leaves "
        "space for thought. Do not signal failure, danger, punishment, sadness or alarm."
    ),
    "WORKSPACE": (
        "WORKSPACE low-density context: use fewer simultaneous parts, softened attacks and large pockets "
        "for speech and detailed work. Remain musical throughout without long silence or a forced restart."
    ),
}


NEGATIVE_PROMPT = (
    "vocals, singing, rap, spoken word, dialogue, lyrics, choir, humming, whistling, artist imitation, "
    "recognizable song, famous theme, quotation, identifiable sample, copyrighted sample, DJ tag, "
    "producer tag, applause, crowd, trailer climax, heroic climax, alarm, notification sound, casino sound, "
    "abrupt ending, clipping, distortion, harsh mastering, hyper-compression, long silence, extended dropout, "
    "foreground solo, dominant melody, generic corporate stock music, parody, archival damage, static, hiss"
)


def _safe_environment() -> dict[str, str]:
    env = dict(os.environ)
    for key in ("HF_TOKEN", "HUGGING_FACE_HUB_TOKEN"):
        env.pop(key, None)
    env.update(
        {
            "HF_HUB_OFFLINE": "1",
            "TRANSFORMERS_OFFLINE": "1",
            "HF_HUB_DISABLE_TELEMETRY": "1",
            "DO_NOT_TRACK": "1",
        }
    )
    return env


def _candidate_id(epoch_code: str, context: str, index: int, seed: int) -> str:
    return f"ASP01-RMV-{epoch_code}-{context}-C{index}__seed-{seed}"


def _candidate_paths(epoch: str, context: str, candidate_id: str) -> tuple[Path, Path, Path]:
    raw = RAW_ROOT / epoch / context.lower() / f"{candidate_id}.wav"
    analysis = ANALYSIS_ROOT / epoch / context.lower() / f"{candidate_id}.json"
    log = LOG_ROOT / epoch / context.lower() / f"{candidate_id}.log"
    return raw, analysis, log


def _verify_existing(raw: Path, analysis_path: Path) -> dict[str, Any] | None:
    if not raw.exists() and not analysis_path.exists():
        return None
    if not raw.is_file() or not analysis_path.is_file():
        raise RuntimeError(f"partial candidate evidence exists; refusing overwrite: {raw}")
    existing = json.loads(analysis_path.read_text(encoding="utf-8"))
    if existing.get("sha256") != sha256_file(raw):
        raise RuntimeError(f"candidate evidence hash mismatch: {raw}")
    return existing


def _generate_candidate(
    epoch: str, epoch_data: dict[str, Any], context: str, index: int, seed: int
) -> dict[str, Any]:
    candidate_id = _candidate_id(epoch_data["code"], context, index, seed)
    raw, analysis_path, log_path = _candidate_paths(epoch, context, candidate_id)
    existing = _verify_existing(raw, analysis_path)
    prompt = (
        epoch_data["brief"]
        + " "
        + CONTEXT_BRIEFS[context]
        + " This is a newly generated horizontal full-mix variant. Do not imply melodic continuity with any other cue."
    )
    if existing is not None:
        return {
            "candidate_id": candidate_id,
            "epoch": epoch,
            "context": context,
            "seed": seed,
            "prompt": prompt,
            "negative_prompt": NEGATIVE_PROMPT,
            "raw": file_record(raw),
            "analysis": existing,
            "reused": True,
        }

    raw.parent.mkdir(parents=True, exist_ok=True)
    analysis_path.parent.mkdir(parents=True, exist_ok=True)
    log_path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temp_name = tempfile.mkstemp(prefix=f".{candidate_id}.", suffix=".generating.wav", dir=raw.parent)
    os.close(descriptor)
    temp = Path(temp_name)
    temp.unlink()
    argv = [
        str(PYTHON),
        str(GENERATOR),
        "--prompt",
        prompt,
        "--negative-prompt",
        NEGATIVE_PROMPT,
        "--dit",
        "sm-music",
        "--decoder",
        "same-s",
        "--seconds",
        "60",
        "--steps",
        "8",
        "--seed",
        str(seed),
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
        str(temp),
    ]
    started = time.monotonic()
    try:
        completed = subprocess.run(
            argv,
            cwd=TOOLCHAIN,
            env=_safe_environment(),
            check=False,
            capture_output=True,
            text=True,
            timeout=180,
        )
        elapsed = time.monotonic() - started
        if completed.returncode != 0:
            raise RuntimeError(
                f"Small-Music generation failed for {candidate_id}: "
                f"{(completed.stderr or completed.stdout).strip()}"
            )
        if not temp.is_file():
            raise RuntimeError(f"generator returned success without output: {candidate_id}")
        publish_temp(temp, raw)
    finally:
        temp.unlink(missing_ok=True)

    analysis = technical_screen(raw, expected_duration_seconds=60.0, expected_channels=2, music=True)
    analysis.update(
        {
            "candidate_id": candidate_id,
            "epoch": epoch,
            "context": context,
            "seed": seed,
            "generation_elapsed_seconds": round(elapsed, 3),
        }
    )
    write_manifest(analysis_path, analysis)
    log_payload = json.dumps(
        {
            "argv": argv,
            "candidate_id": candidate_id,
            "elapsed_seconds": round(elapsed, 3),
            "environment_safe": {
                "HF_HUB_OFFLINE": "1",
                "TRANSFORMERS_OFFLINE": "1",
                "HF_HUB_DISABLE_TELEMETRY": "1",
                "tokens_removed": True,
            },
            "returncode": completed.returncode,
            "stdout": completed.stdout,
            "stderr": completed.stderr,
        },
        indent=2,
        sort_keys=True,
    ) + "\n"
    if log_path.exists():
        if log_path.read_text(encoding="utf-8") != log_payload:
            raise RuntimeError(f"existing generation log differs; refusing overwrite: {log_path}")
    else:
        log_path.write_text(log_payload, encoding="utf-8")
        os.chmod(log_path, 0o444)
    return {
        "candidate_id": candidate_id,
        "epoch": epoch,
        "context": context,
        "seed": seed,
        "prompt": prompt,
        "negative_prompt": NEGATIVE_PROMPT,
        "raw": file_record(raw),
        "analysis": analysis,
        "reused": False,
    }


def _select_and_derive(epoch: str, epoch_data: dict[str, Any], context: str, rows: list[dict[str, Any]]) -> dict[str, Any]:
    eligible = [row for row in rows if row["analysis"]["automatic_pass"]]
    if not eligible:
        raise RuntimeError(f"no technically eligible candidate for {epoch}/{context}; do not weaken screen")
    selected = sorted(
        eligible,
        key=lambda row: (-float(row["analysis"]["selection_utility"]), row["candidate_id"]),
    )[0]
    candidate_path = Path(selected["raw"]["path"])
    context_dir = BUNDLE_ROOT / epoch / context.lower()
    normalized_path = context_dir / f"{selected['candidate_id']}__normalized-48k-24bit.wav"
    normalize_record = normalize_music(candidate_path, normalized_path)
    derivatives = derive_music_assets(normalized_path, context_dir)
    return {
        "stable_bundle_variant_id": f"ASP01-BUNDLE-{epoch_data['code']}-{context}",
        "epoch": epoch,
        "context": context,
        "classification": "HORIZONTAL_VARIANT_BUNDLE",
        "selected_candidate_id": selected["candidate_id"],
        "selection_disposition": "MACHINE_PROVISIONAL_PENDING_HUMAN_LISTENING",
        "selection_basis": "deterministic structural/signal screen utility among three fixed-seed candidates",
        "source": selected["raw"],
        "normalization": normalize_record,
        "derivatives": derivatives,
        "transition_metadata": {
            "trusted_phrase_grid": False,
            "default_boundary": "SAFE_CROSSFADE",
            "estimated_bpm": selected["analysis"].get("estimated_bpm"),
            "estimated_bpm_confidence": selected["analysis"].get("bpm_confidence_signal"),
            "minimum_dwell_seconds": 45,
            "hysteresis_seconds": 8,
            "melodic_continuity_claimed": False,
            "phase_alignment_claimed": False,
        },
        "rights_status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "human_disposition": "PENDING",
    }


def _verify_completed() -> dict[str, Any] | None:
    if not REGISTER.exists() and not BUNDLE_CATALOGUE.exists():
        return None
    if not REGISTER.is_file() or not BUNDLE_CATALOGUE.is_file():
        raise RuntimeError("partial responsive manifests exist; refusing overwrite")
    register = json.loads(REGISTER.read_text(encoding="utf-8"))
    bundles = json.loads(BUNDLE_CATALOGUE.read_text(encoding="utf-8"))
    if len(register.get("candidates", [])) != 36 or len(bundles.get("variants", [])) != 12:
        raise RuntimeError("existing responsive manifest counts are invalid")
    for row in register["candidates"]:
        require_file(Path(row["raw"]["path"]), row["raw"]["sha256"])
    for row in bundles["variants"]:
        for name in ("normalized", "loop", "entry", "exit", "preview"):
            record = row["derivatives"][name] if name != "normalized" else row["derivatives"]["normalized"]
            require_file(Path(record["path"]), record["sha256"])
    return {"register": register, "bundles": bundles}


def run() -> dict[str, Any]:
    completed = _verify_completed()
    if completed is not None:
        return {"status": "PASSED_REUSED", **completed}
    require_file(PYTHON)
    require_file(GENERATOR)
    require_file(TOOLCHAIN / "optimized/mlx/models/mlx/dit_sm-music_f16.npz")
    require_file(TOOLCHAIN / "optimized/mlx/models/mlx/same_s_decoder_f32.npz")
    require_file(TOOLCHAIN / "optimized/mlx/models/mlx/t5gemma_f16.npz")

    candidates: list[dict[str, Any]] = []
    variants: list[dict[str, Any]] = []
    for epoch, epoch_data in EPOCHS.items():
        for context in CONTEXTS:
            context_rows = [
                _generate_candidate(epoch, epoch_data, context, index, seed)
                for index, seed in enumerate(SEEDS, start=1)
            ]
            candidates.extend(context_rows)
            variants.append(_select_and_derive(epoch, epoch_data, context, context_rows))

    if len(candidates) != 36 or len({row["candidate_id"] for row in candidates}) != 36:
        raise RuntimeError("responsive candidate cardinality/identity check failed")
    if len(variants) != 12:
        raise RuntimeError("responsive variant cardinality check failed")
    hashes = [row["raw"]["sha256"] for row in candidates]
    if len(set(hashes)) != len(hashes):
        raise RuntimeError("responsive candidate audio hashes are not unique")

    generated = utc_now()
    register = {
        "schema": "project-studio-responsive-generation-register/v1",
        "generated_at_utc": generated,
        "status": "COMPLETE_MACHINE_SCREEN_PENDING_HUMAN_LISTENING",
        "candidate_count": 36,
        "expected_candidate_count": 36,
        "fixed_seeds": list(SEEDS),
        "seconds_per_candidate": 60,
        "text_only": True,
        "guide_audio": False,
        "named_artist_song_composer_or_soundtrack_reference": False,
        "generation_identity": {
            "canonical_model": "stabilityai/stable-audio-3-small-music",
            "canonical_model_revision": MUSIC_CANONICAL_REVISION,
            "optimized_weights_revision": OPTIMIZED_REVISION,
            "code_commit": CODE_COMMIT,
            "backend": "Apple MLX / Metal",
            "dit": "sm-music",
            "decoder": "same-s",
            "steps": 8,
            "cfg": 2.0,
            "apg": 1.0,
            "init_noise_level": 1.0,
            "dit_dtype": "fp16",
        },
        "anchors": EPOCHS,
        "candidates": candidates,
        "rights_status": "PROTOTYPE_ONLY",
        "limitations": [
            "Text-only generation does not establish melodic continuity among variants.",
            "Technical screening does not establish music quality, era fit, comfort, or non-infringement.",
            "No candidate is Owner-approved or commercially cleared.",
        ],
    }
    bundle_catalogue = {
        "schema": "project-studio-responsive-bundle-catalogue/v1",
        "generated_at_utc": generated,
        "bundle_count": 3,
        "variant_count": 12,
        "classification": "HORIZONTAL_VARIANT_BUNDLE",
        "fake_stems": False,
        "aligned_layers_claimed": False,
        "variants": variants,
        "rights_status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "human_acceptance": "NONE_RECORDED",
    }
    write_manifest(REGISTER, register)
    write_manifest(BUNDLE_CATALOGUE, bundle_catalogue)
    return {"status": "PASSED", "register": register, "bundles": bundle_catalogue}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--verify-only", action="store_true")
    args = parser.parse_args()
    if args.verify_only:
        completed = _verify_completed()
        if completed is None:
            raise RuntimeError("responsive generation is not complete")
        print(json.dumps({"status": "PASSED", "candidates": 36, "variants": 12}, sort_keys=True))
        return 0
    result = run()
    print(
        json.dumps(
            {
                "status": result["status"],
                "candidates": len(result["register"]["candidates"]),
                "variants": len(result["bundles"]["variants"]),
            },
            sort_keys=True,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
