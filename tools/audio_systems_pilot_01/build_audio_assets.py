#!/usr/bin/env python3
"""Build bounded SFX, living-lot, management, and transition audio assets."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Any, Iterable

import numpy as np
import soundfile as sf

from audio_dsp import (
    ffmpeg_atomic,
    file_record,
    publish_temp,
    render_semantic_tone,
    require_file,
    technical_screen,
    write_audio_atomic,
    write_manifest,
    write_stream_atomic,
)
from common import DOC_REPO, PILOT_ROOT, TOOLING_ROOT, probe_audio, sha256_file, utc_now
from generate_responsive_variants import verify_anchor_authorities
from sfx_route import (
    CODE_COMMIT,
    GATE_PATH as SFX_GATE_PATH,
    OPTIMIZED_REVISION,
    SFX_CANONICAL_REVISION,
    SFX_WEIGHT_SHA256,
    TOOLCHAIN,
    verify_gate_data,
)


PYTHON = TOOLING_ROOT / ".phase2-venv-py312/bin/python"
GENERATOR = TOOLCHAIN / "optimized/mlx/scripts/sa3_mlx.py"
SAMPLE_RATE = 48_000
TEN_MINUTES = 600.0
SFX_ROOT = PILOT_ROOT / "05_management-sfx/generated-lot-detail"
MANAGEMENT_ROOT = PILOT_ROOT / "05_management-sfx/semantic-pack"
LIVING_ROOT = PILOT_ROOT / "04_living-lot"
LIVING_CATALOGUE = LIVING_ROOT / "living-lot-soundscape-catalogue.v3.json"
TRANSITION_ROOT = PILOT_ROOT / "03_transitions"
LOG_ROOT = PILOT_ROOT / "12_logs/audio-asset-build"
MASTER_V1_INDEX = PILOT_ROOT / "10_provenance/audio-assets-index.v1.json"
MASTER_V2_INDEX = PILOT_ROOT / "10_provenance/audio-assets-index.v2.json"
MASTER_V3_INDEX = PILOT_ROOT / "10_provenance/audio-assets-index.v3.json"
MASTER_INDEX = PILOT_ROOT / "10_provenance/audio-assets-index.v4.json"
VALIDATION_V1_PATH = PILOT_ROOT / "10_provenance/audio-assets-validation.json"
VALIDATION_V2_PATH = PILOT_ROOT / "10_provenance/audio-assets-validation.v2.json"
VALIDATION_V3_PATH = PILOT_ROOT / "10_provenance/audio-assets-validation.v3.json"
VALIDATION_PATH = PILOT_ROOT / "10_provenance/audio-assets-validation.v4.json"
DERIVATIVE_REGISTER = PILOT_ROOT / "10_provenance/audio-derivative-source-register.v4.json"
MANAGEMENT_V2_CATALOGUE = MANAGEMENT_ROOT / "management-semantic-catalogue.v2.json"
MANAGEMENT_CATALOGUE = MANAGEMENT_ROOT / "management-semantic-catalogue.v3.json"
TRANSITION_V1_CATALOGUE = TRANSITION_ROOT / "rendered-transition-catalogue.json"
TRANSITION_V2_CATALOGUE = TRANSITION_ROOT / "rendered-transition-catalogue.v2.json"
TRANSITION_V3_CATALOGUE = TRANSITION_ROOT / "rendered-transition-catalogue.v3.json"
TRANSITION_CATALOGUE = TRANSITION_ROOT / "rendered-transition-catalogue.v4.json"
RESPONSIVE_CATALOGUE = PILOT_ROOT / "02_music-bundles/responsive/responsive-bundle-catalogue.v2.json"
RESPONSIVE_REGISTER = PILOT_ROOT / "02_music-bundles/responsive/responsive-generation-register.v2.json"
CANONICAL_CATALOGUE = PILOT_ROOT / "01_catalogue/AudioPrototypeCatalogue.v1.json"


LOT_SFX: tuple[tuple[str, str, str], ...] = (
    ("WIDE-CITY-ROAD", "WIDE", "distant restrained city road wash heard across a quiet studio campus, sparse traffic, no horn"),
    ("WIDE-CAMPUS-AIR", "WIDE", "light open studio campus air with sparse leaves and distant building presence, no birdsong focus"),
    ("WIDE-FAR-BUILDING", "WIDE", "very distant muted building activity across a spacious studio campus, occasional soft movement"),
    ("MED-OFFICE", "MEDIUM", "restrained office zone activity behind closed doors, paper and quiet furniture movement, no speech"),
    ("MED-WORKSHOP", "MEDIUM", "small studio workshop activity at middle distance, sparse hand tools and wood handling, no power saw"),
    ("MED-CART", "MEDIUM", "utility cart rolling at middle distance on smooth backlot pavement, one gentle wheel rattle"),
    ("MED-DELIVERY", "MEDIUM", "restrained studio delivery unload at middle distance, two soft cases set down, no voices"),
    ("MED-STAGE-LEAK", "MEDIUM", "subtle soundstage activity leaking through a heavy closed door, indistinct movement, no music or speech"),
    ("CLOSE-DOOR", "CLOSE", "close controlled heavy wooden studio door open and latch, natural room, no slam"),
    ("CLOSE-TOOLS", "CLOSE", "close restrained hand tool handling on a workbench, two small metal and wood contacts"),
    ("CLOSE-CLOTH", "CLOSE", "close heavy set cloth and wardrobe fabric handled gently, detailed folds, no tearing"),
    ("CLOSE-CAMERA", "CLOSE", "close generic camera equipment adjustment, quiet mechanical controls and tripod contact, no shutter burst"),
    ("CLOSE-FOOTSTEPS", "CLOSE", "three close measured work shoes footsteps on studio concrete, natural and unhurried"),
    ("CLOSE-CART", "CLOSE", "close small studio cart rolling past on smooth concrete with restrained wheel texture"),
    ("CLOSE-SET", "CLOSE", "close careful lightweight set panel handling, wood contact and cloth movement, no crash"),
)


SFX_NEGATIVE = (
    "music, melody, rhythm track, singing, vocals, speech, dialogue, crowd, applause, alarm, siren, horn, "
    "explosion, gunshot, impact trailer sound, cartoon, casino sound, notification, clipping, distortion, "
    "static, archival damage, dominant hiss, named product, recognizable media sample"
)


SEMANTICS: tuple[dict[str, Any], ...] = (
    {"id": "FOCUS", "meaning": "focus moved", "priority": 10, "concurrency": 1, "cooldown_ms": 70, "optional": True},
    {"id": "SELECT", "meaning": "control selected", "priority": 20, "concurrency": 2, "cooldown_ms": 90, "optional": True},
    {"id": "OPEN", "meaning": "panel opened", "priority": 25, "concurrency": 1, "cooldown_ms": 120, "optional": True},
    {"id": "CLOSE_BACK", "meaning": "panel closed or navigation moved back", "priority": 25, "concurrency": 1, "cooldown_ms": 120, "optional": True},
    {"id": "PLACE", "meaning": "provisional placement made", "priority": 35, "concurrency": 2, "cooldown_ms": 150, "optional": True},
    {"id": "COMMIT", "meaning": "explicit action committed", "priority": 55, "concurrency": 1, "cooldown_ms": 350, "optional": False},
    {"id": "CANCEL", "meaning": "operation cancelled", "priority": 40, "concurrency": 1, "cooldown_ms": 250, "optional": True},
    {"id": "BLOCKED_REFUSED", "meaning": "requested action was refused", "priority": 70, "concurrency": 1, "cooldown_ms": 700, "optional": False},
    {"id": "WARNING", "meaning": "non-urgent attention requested", "priority": 75, "concurrency": 1, "cooldown_ms": 1500, "optional": False},
    {"id": "COMPLETION", "meaning": "bounded task completed", "priority": 50, "concurrency": 1, "cooldown_ms": 1200, "optional": True},
    {"id": "SAVE", "meaning": "local save completed", "priority": 45, "concurrency": 1, "cooldown_ms": 750, "optional": True},
    {"id": "LOAD", "meaning": "local load completed", "priority": 45, "concurrency": 1, "cooldown_ms": 750, "optional": True},
    {"id": "SPEED_UP", "meaning": "simulation presentation speed increased", "priority": 35, "concurrency": 1, "cooldown_ms": 220, "optional": True},
    {"id": "SPEED_DOWN", "meaning": "simulation presentation speed decreased", "priority": 35, "concurrency": 1, "cooldown_ms": 220, "optional": True},
    {"id": "PAUSE_RESUME", "meaning": "simulation presentation paused or resumed", "priority": 45, "concurrency": 1, "cooldown_ms": 300, "optional": True},
)


TRANSITIONS: tuple[dict[str, str], ...] = (
    {
        "id": "AE-TO-NS",
        "out_alias": "acoustic_electrical_1920_1932",
        "in_alias": "network_sound_1933_1945",
        "out_id": "FND-03__seed-130363",
        "in_id": "NSD-04__seed-196613",
        "out_path": "/Users/bruce/Project Studio Audio Foundry Marathon 01/04_processed/acoustic_electrical_1920_1932/FND-03__seed-130363/normalized-48k-24bit.wav",
        "in_path": "/Users/bruce/Project Studio Audio Foundry Marathon 01/04_processed/network_sound_1933_1945/NSD-04__seed-196613/normalized-48k-24bit.wav",
        "out_sha256": "cc778f2e67d3f9562ccff87db4c695990888edc253a1d294ab1e5436f8cd440a",
        "in_sha256": "8570c6bf7e45c4231c78a2197f2f15afdd68883de469b7391a1fe0e00f6715b3",
    },
    {
        "id": "MF-TO-FP",
        "out_alias": "multitrack_fm_1960_1974",
        "in_alias": "format_plurality_1975_1986",
        "out_id": "MFM-01__seed-130363",
        "in_id": "FPL-01__seed-130363",
        "out_path": "/Users/bruce/Project Studio Audio Foundry Marathon 01/04_processed/multitrack_fm_1960_1974/MFM-01__seed-130363/normalized-48k-24bit.wav",
        "in_path": "/Users/bruce/Project Studio Audio Foundry Marathon 01/04_processed/format_plurality_1975_1986/FPL-01__seed-130363/normalized-48k-24bit.wav",
        "out_sha256": "b0f8cbb9cda15cd498cf2cb76807217334766bff46ccb0645d1b5ec073e8c640",
        "in_sha256": "7ee01cc03dbf00a8caf73e3ddc5d1be109d0f7657ed3d47bd774944017feee44",
    },
    {
        "id": "SD-TO-NH",
        "out_alias": "sampled_digital_1987_1999",
        "in_alias": "networked_hybrid_2000_2014",
        "out_id": "DFG-01__seed-130363",
        "in_id": "NHY-01__seed-104729",
        "out_path": "/Users/bruce/Project Studio Audio Foundry Marathon 01/04_processed/sampled_digital_1987_1999/DFG-01__seed-130363/normalized-48k-24bit.wav",
        "in_path": "/Users/bruce/Project Studio Audio Foundry Marathon 01/04_processed/networked_hybrid_2000_2014/NHY-01__seed-104729/normalized-48k-24bit.wav",
        "out_sha256": "9cd6bd1a41c8216bcaac685760b711313868bbb1baf3331e809a9acf07f9c48f",
        "in_sha256": "85fdc44e178f40f23ffc9ec4cc4c56e09817ad7e4cdda6a377837e3d1a73a5f2",
    },
)


def safe_env() -> dict[str, str]:
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


def seed_for(label: str, offset: int = 0) -> int:
    value = int.from_bytes(hashlib.sha256(label.encode("utf-8")).digest()[:4], "big")
    return 100_000 + ((value + offset) % 800_000)


def generate_lot_sfx() -> dict[str, Any]:
    manifest_path = SFX_ROOT / "lot-detail-sfx-catalogue.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        if len(manifest.get("items", [])) != len(LOT_SFX):
            raise RuntimeError("existing lot SFX catalogue has wrong item count")
        for item in manifest["items"]:
            require_file(Path(item["audio"]["path"]), item["audio"]["sha256"])
        return manifest

    require_file(TOOLCHAIN / "optimized/mlx/models/mlx/dit_sm-sfx_f16.npz", SFX_WEIGHT_SHA256)
    require_file(GENERATOR)
    require_file(PYTHON)
    items: list[dict[str, Any]] = []
    for index, (short_id, zoom, brief) in enumerate(LOT_SFX, start=1):
        stable_id = f"ASP01-SFX-{short_id}"
        seed = seed_for(stable_id)
        output = SFX_ROOT / zoom.lower() / f"{stable_id}__seed-{seed}.wav"
        sidecar = output.with_suffix(".json")
        prompt = f"Clean isolated prototype sound effect: {brief}. Natural restrained dynamics and useful detail."
        if output.exists() or sidecar.exists():
            if not output.is_file() or not sidecar.is_file():
                raise RuntimeError(f"partial SFX output exists; refusing overwrite: {output}")
            row = json.loads(sidecar.read_text(encoding="utf-8"))
            require_file(output, row["audio"]["sha256"])
            items.append(row)
            continue

        output.parent.mkdir(parents=True, exist_ok=True)
        LOG_ROOT.mkdir(parents=True, exist_ok=True)
        descriptor, temp_name = tempfile.mkstemp(prefix=f".{stable_id}.", suffix=".generating.wav", dir=output.parent)
        os.close(descriptor)
        temp = Path(temp_name)
        temp.unlink()
        argv = [
            str(PYTHON), str(GENERATOR), "--prompt", prompt, "--negative-prompt", SFX_NEGATIVE,
            "--dit", "sm-sfx", "--decoder", "same-s", "--seconds", "8", "--steps", "8",
            "--seed", str(seed), "--init-noise-level", "1.0", "--cfg", "2.0", "--apg", "1.0",
            "--dit-dtype", "fp16", "--free-models", "--out", str(temp),
        ]
        started = time.monotonic()
        try:
            completed = subprocess.run(
                argv, cwd=TOOLCHAIN, env=safe_env(), check=False, capture_output=True, text=True, timeout=180
            )
            elapsed = time.monotonic() - started
            if completed.returncode != 0:
                raise RuntimeError(f"Small-SFX generation failed for {stable_id}: {completed.stderr.strip()}")
            publish_temp(temp, output)
        finally:
            temp.unlink(missing_ok=True)
        screen = technical_screen(output, expected_duration_seconds=8.0, expected_channels=2, music=False)
        if not screen["automatic_pass"]:
            raise RuntimeError(f"Small-SFX technical screen failed for {stable_id}: {screen['failure_reasons']}")
        row = {
            "stable_prototype_id": stable_id,
            "zoom": zoom,
            "prompt": prompt,
            "negative_prompt": SFX_NEGATIVE,
            "seed": seed,
            "audio": file_record(output),
            "analysis": screen,
            "generation_elapsed_seconds": round(elapsed, 3),
            "classification": "GENERATED_LOT_DETAIL_PROTOTYPE",
            "human_disposition": "PENDING",
            "rights_status": "PROTOTYPE_ONLY",
        }
        write_manifest(sidecar, row)
        log_path = LOG_ROOT / f"{stable_id}.json"
        write_manifest(
            log_path,
            {
                "argv": argv,
                "returncode": completed.returncode,
                "elapsed_seconds": round(elapsed, 3),
                "stdout": completed.stdout,
                "stderr": completed.stderr,
                "tokens_removed": True,
            },
        )
        items.append(row)
    if len(items) != 15 or len({item["audio"]["sha256"] for item in items}) != 15:
        raise RuntimeError("lot SFX cardinality/unique hash proof failed")
    manifest = {
        "schema": "project-studio-lot-detail-sfx/v1",
        "generated_at_utc": utc_now(),
        "status": "COMPLETE_MACHINE_SCREEN_PENDING_HUMAN_LISTENING",
        "route": {
            "canonical_model": "stabilityai/stable-audio-sfx",
            "canonical_revision": SFX_CANONICAL_REVISION,
            "optimized_revision": OPTIMIZED_REVISION,
            "code_commit": CODE_COMMIT,
            "dit_weight_sha256": SFX_WEIGHT_SHA256,
            "text_only": True,
            "guide_audio": False,
        },
        "item_count": len(items),
        "items": items,
        "rights_status": "PROTOTYPE_ONLY",
        "limitations": [
            "Technical screening is not a listening verdict.",
            "Generated sounds do not establish activity truth or historical accuracy.",
        ],
    }
    write_manifest(manifest_path, manifest)
    return manifest


def _fir_stream(seed: int, kind: str) -> Iterable[np.ndarray]:
    rng = np.random.default_rng(seed)
    chunk_frames = SAMPLE_RATE * 10
    total_frames = int(TEN_MINUTES * SAMPLE_RATE)
    kernel_size = 257 if kind == "wide" else 97
    kernel = np.hanning(kernel_size)
    kernel /= np.sum(kernel)
    state_l = np.zeros(kernel_size - 1)
    state_r = np.zeros(kernel_size - 1)
    cursor = 0
    phase = 0.0
    while cursor < total_frames:
        frames = min(chunk_frames, total_frames - cursor)
        common = rng.standard_normal(frames)
        side_l = rng.standard_normal(frames)
        side_r = rng.standard_normal(frames)
        raw_l = common * 0.78 + side_l * 0.22
        raw_r = common * 0.78 + side_r * 0.22
        joined_l = np.concatenate((state_l, raw_l))
        joined_r = np.concatenate((state_r, raw_r))
        low_l = np.convolve(joined_l, kernel, mode="valid")
        low_r = np.convolve(joined_r, kernel, mode="valid")
        state_l = joined_l[-(kernel_size - 1):]
        state_r = joined_r[-(kernel_size - 1):]
        t = (cursor + np.arange(frames)) / SAMPLE_RATE
        if kind == "wide":
            slow = 0.72 + 0.16 * np.sin(2 * math.pi * 0.011 * t + phase)
            hum = 0.012 * np.sin(2 * math.pi * 54.0 * t) + 0.006 * np.sin(2 * math.pi * 83.0 * t)
            left = 0.12 * low_l * slow + hum
            right = 0.12 * low_r * slow + hum * 0.96
        else:
            high_l = raw_l - low_l
            high_r = raw_r - low_r
            slow = 0.55 + 0.22 * np.sin(2 * math.pi * 0.017 * t + 0.8)
            machine = 0.008 * np.sin(2 * math.pi * 121.0 * t) * (0.65 + 0.35 * np.sin(2 * math.pi * 0.031 * t))
            left = 0.045 * high_l * slow + 0.055 * low_l + machine
            right = 0.045 * high_r * slow + 0.055 * low_r + machine * 1.02
        yield np.stack((left, right), axis=1).astype(np.float32)
        cursor += frames


def _event_wave(event_type: str, duration: float, seed: int, pan: float) -> np.ndarray:
    rng = np.random.default_rng(seed)
    frames = int(round(duration * SAMPLE_RATE))
    t = np.arange(frames) / SAMPLE_RATE
    attack = min(frames, int(0.018 * SAMPLE_RATE))
    release = min(frames, int(0.22 * SAMPLE_RATE))
    env = np.ones(frames)
    if attack:
        env[:attack] = np.linspace(0, 1, attack, endpoint=False)
    if release:
        env[-release:] *= np.linspace(1, 0, release)
    noise = rng.standard_normal(frames)
    if event_type == "door":
        mono = 0.19 * np.sin(2 * math.pi * 73 * t) * np.exp(-5.5 * t) + 0.045 * noise * np.exp(-10 * t)
    elif event_type == "tools":
        mono = 0.11 * np.sin(2 * math.pi * 710 * t) * np.exp(-7 * t) + 0.07 * np.sin(2 * math.pi * 1130 * t) * np.exp(-11 * t)
    elif event_type == "cloth":
        smooth = np.convolve(noise, np.ones(41) / 41, mode="same")
        mono = 0.16 * smooth * (0.55 + 0.45 * np.sin(2 * math.pi * 1.7 * t))
    elif event_type == "camera":
        mono = 0.07 * np.sin(2 * math.pi * 240 * t) * (np.sin(2 * math.pi * 7 * t) > 0) + 0.025 * noise
    elif event_type == "footsteps":
        mono = np.zeros(frames)
        for step in np.linspace(0.12, max(0.13, duration - 0.25), 3):
            local = np.maximum(0.0, t - step)
            mono += 0.13 * np.sin(2 * math.pi * 67 * local) * np.exp(-22 * local) * (t >= step)
    elif event_type == "cart":
        smooth = np.convolve(noise, np.ones(29) / 29, mode="same")
        mono = 0.065 * smooth + 0.028 * np.sin(2 * math.pi * (112 + 5 * np.sin(2 * math.pi * 0.7 * t)) * t)
    else:
        mono = 0.12 * np.sin(2 * math.pi * 104 * t) * np.exp(-4 * t) + 0.045 * noise * np.exp(-3 * t)
    mono *= env
    left = mono * math.sqrt((1 - pan) / 2)
    right = mono * math.sqrt((1 + pan) / 2)
    return np.stack((left, right), axis=1).astype(np.float32)


def _close_schedule() -> tuple[list[dict[str, Any]], list[tuple[int, np.ndarray]]]:
    rng = np.random.default_rng(404_051)
    types = ("door", "tools", "cloth", "camera", "footsteps", "cart", "set")
    descriptions: list[dict[str, Any]] = []
    rendered: list[tuple[int, np.ndarray]] = []
    cursor = 4.0
    index = 0
    while cursor < TEN_MINUTES - 3:
        event_type = types[index % len(types)]
        duration = float(rng.uniform(0.45, 2.2))
        pan = float(rng.uniform(-0.72, 0.72))
        event_seed = 404_051 + index * 101
        frame = int(round(cursor * SAMPLE_RATE))
        wave = _event_wave(event_type, duration, event_seed, pan)
        descriptions.append(
            {
                "event_index": index,
                "event_type": event_type,
                "start_seconds": round(cursor, 4),
                "duration_seconds": round(wave.shape[0] / SAMPLE_RATE, 4),
                "seed": event_seed,
                "pan": round(pan, 5),
            }
        )
        rendered.append((frame, wave))
        cursor += float(rng.uniform(3.8, 9.5))
        index += 1
    return descriptions, rendered


def _close_stream(events: list[tuple[int, np.ndarray]]) -> Iterable[np.ndarray]:
    rng = np.random.default_rng(404_050)
    chunk_frames = SAMPLE_RATE * 10
    total_frames = int(TEN_MINUTES * SAMPLE_RATE)
    cursor = 0
    kernel = np.ones(37) / 37
    state_l = np.zeros(len(kernel) - 1)
    state_r = np.zeros(len(kernel) - 1)
    while cursor < total_frames:
        frames = min(chunk_frames, total_frames - cursor)
        raw_l = rng.standard_normal(frames)
        raw_r = rng.standard_normal(frames)
        joined_l = np.concatenate((state_l, raw_l))
        joined_r = np.concatenate((state_r, raw_r))
        bed_l = np.convolve(joined_l, kernel, mode="valid")
        bed_r = np.convolve(joined_r, kernel, mode="valid")
        state_l = joined_l[-(len(kernel) - 1):]
        state_r = joined_r[-(len(kernel) - 1):]
        block = 0.018 * np.stack((bed_l, bed_r), axis=1)
        block_end = cursor + frames
        for event_start, wave in events:
            event_end = event_start + wave.shape[0]
            overlap_start = max(cursor, event_start)
            overlap_end = min(block_end, event_end)
            if overlap_start < overlap_end:
                block[overlap_start - cursor:overlap_end - cursor] += wave[
                    overlap_start - event_start:overlap_end - event_start
                ]
        yield np.clip(block, -0.82, 0.82).astype(np.float32)
        cursor += frames


def _load_or_build_living_lot_v1() -> dict[str, Any]:
    manifest_path = LIVING_ROOT / "living-lot-soundscape-catalogue.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        for record in manifest["all_audio_files"]:
            require_file(Path(record["path"]), record["sha256"])
        return manifest

    layer_dir = LIVING_ROOT / "layers"
    schedule, close_events = _close_schedule()
    layer_specs = (
        ("WIDE", layer_dir / "ASP01-LIVING-WIDE-600s.wav", lambda: _fir_stream(404_001, "wide")),
        ("MEDIUM", layer_dir / "ASP01-LIVING-MEDIUM-600s.wav", lambda: _fir_stream(404_021, "medium")),
        ("CLOSE", layer_dir / "ASP01-LIVING-CLOSE-600s.wav", lambda: _close_stream(close_events)),
    )
    layers: list[dict[str, Any]] = []
    for name, path, generator in layer_specs:
        sidecar = path.with_suffix(".json")
        if path.exists() or sidecar.exists():
            if not path.is_file() or not sidecar.is_file():
                raise RuntimeError(f"partial living layer exists; refusing overwrite: {path}")
            record = json.loads(sidecar.read_text(encoding="utf-8"))
            require_file(path, record["audio"]["sha256"])
        else:
            audio = write_stream_atomic(path, generator(), SAMPLE_RATE, 2, subtype="PCM_24")
            screen = technical_screen(path, expected_duration_seconds=TEN_MINUTES, expected_channels=2, music=False)
            if not screen["automatic_pass"]:
                raise RuntimeError(f"living layer screen failed: {name}: {screen['failure_reasons']}")
            record = {
                "stable_prototype_id": f"ASP01-LIVING-{name}",
                "zoom": name,
                "audio": audio,
                "analysis": screen,
                "generation": "DETERMINISTIC_PROCEDURAL_SYNTHESIS",
                "seed": {"WIDE": 404_001, "MEDIUM": 404_021, "CLOSE": 404_050}[name],
                "duration_seconds": TEN_MINUTES,
                "rights_status": "PROTOTYPE_ONLY",
            }
            write_manifest(sidecar, record)
        layers.append(record)

    wide, medium, close = (Path(record["audio"]["path"]) for record in layers)
    fixture_specs = {
        "IDLE": (0.82, 0.18, 0.06, "explicit lab fixture; no authoritative activity"),
        "ACTIVE_PRODUCTION": (0.72, 0.58, 0.46, "explicit lab fixture; no Production truth"),
        "LOAD_IN": (0.68, 0.54, 0.72, "explicit lab fixture; no load-in truth"),
        "BLOCKED_PRODUCTION": (0.80, 0.14, 0.10, "explicit lab fixture; no blocker legality or truth"),
        "CLOSE_STAGE_INSPECTION": (0.34, 0.50, 0.96, "explicit lab fixture; no Stage or inspection truth"),
    }
    fixture_records: list[dict[str, Any]] = []
    for name, (gw, gm, gc, disclaimer) in fixture_specs.items():
        path = LIVING_ROOT / "fixture-presentations" / f"ASP01-LIVING-FIXTURE-{name}-600s.wav"
        record = ffmpeg_atomic(
            [
                "-i", wide, "-i", medium, "-i", close,
                "-filter_complex",
                f"[0:a]volume={gw}[w];[1:a]volume={gm}[m];[2:a]volume={gc}[c];"
                "[w][m][c]amix=inputs=3:normalize=0,alimiter=limit=0.88[out]",
                "-map", "[out]", "-map_metadata", "-1", "-ar", str(SAMPLE_RATE), "-ac", "2",
                "-c:a", "pcm_s24le", "-f", "wav",
            ],
            path,
        )
        fixture_records.append(
            {"fixture": name, "audio": record, "layer_gains_linear": [gw, gm, gc], "truth_boundary": disclaimer}
        )

    fixture_layer_bindings: list[dict[str, Any]] = []
    layer_names = ("WIDE", "MEDIUM", "CLOSE")
    for fixture, gains_and_disclaimer in fixture_specs.items():
        gains = gains_and_disclaimer[:3]
        for layer_index, (layer, layer_record) in enumerate(zip(layer_names, layers, strict=True)):
            audio_record = layer_record["audio"]
            fixture_layer_bindings.append(
                {
                    "stable_prototype_id": f"ASP01-LIVING-BINDING-{fixture}-{layer}",
                    "commissioning_alias": None,
                    "era_truth": "NONE_LAB_FIXTURE_ONLY",
                    "fixture": fixture,
                    "layer": layer,
                    "relative_path": str(Path(audio_record["path"]).relative_to(PILOT_ROOT)),
                    "sha256": audio_record["sha256"],
                    "format": audio_record["probe"],
                    "gain_linear": gains[layer_index],
                    "permitted_contexts": ["AUDIO_LAB", "LIVING_LOT_FIXTURE"],
                    "activity_truth_owned": False,
                }
            )

    era_specs = {
        "EARLY-PRESENTATION": (0.78, 0.28, 0.30, "lowpass=f=6500,stereotools=mlev=1:slev=0.22"),
        "MID-PRESENTATION": (0.72, 0.48, 0.48, "lowpass=f=12000,stereotools=mlev=1:slev=0.65"),
        "MODERN-PRESENTATION": (0.68, 0.50, 0.58, "stereotools=mlev=1:slev=0.9"),
    }
    era_records: list[dict[str, Any]] = []
    for name, (gw, gm, gc, treatment) in era_specs.items():
        path = LIVING_ROOT / "era-presentations" / f"ASP01-LIVING-{name}-600s.wav"
        record = ffmpeg_atomic(
            [
                "-i", wide, "-i", medium, "-i", close,
                "-filter_complex",
                f"[0:a]volume={gw}[w];[1:a]volume={gm}[m];[2:a]volume={gc}[c];"
                f"[w][m][c]amix=inputs=3:normalize=0,{treatment},alimiter=limit=0.88[out]",
                "-map", "[out]", "-map_metadata", "-1", "-ar", str(SAMPLE_RATE), "-ac", "2",
                "-c:a", "pcm_s24le", "-f", "wav",
            ],
            path,
        )
        era_records.append(
            {
                "presentation": name,
                "audio": record,
                "layer_gains_linear": [gw, gm, gc],
                "treatment": treatment,
                "era_truth": "NONE; LAB PRESENTATION COLOR ONLY",
            }
        )

    all_audio = [row["audio"] for row in layers] + [row["audio"] for row in fixture_records] + [row["audio"] for row in era_records]
    if any(abs(record["probe"]["duration_seconds"] - TEN_MINUTES) > 0.025 for record in all_audio):
        raise RuntimeError("living-lot duration proof failed")
    manifest = {
        "schema": "project-studio-living-lot-soundscape/v1",
        "generated_at_utc": utc_now(),
        "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "duration_seconds": TEN_MINUTES,
        "sample_rate_hz": SAMPLE_RATE,
        "layers": layers,
        "close_event_schedule": schedule,
        "fixture_presentations": fixture_records,
        "fixture_layer_bindings": fixture_layer_bindings,
        "era_presentations": era_records,
        "all_audio_files": all_audio,
        "music_off_coherent_world": True,
        "activity_truth_owned": False,
        "zoom_changes_presentation_only": True,
        "rights_status": "PROTOTYPE_ONLY",
        "limitations": [
            "Procedural synthesis and technical measures do not establish listening quality or fatigue comfort.",
            "Fixtures and era colors are audition presentation only and never manufacture simulation or P13 truth.",
        ],
    }
    write_manifest(manifest_path, manifest)
    return manifest


def _resampled_clip(path: Path) -> np.ndarray:
    audio, sample_rate = sf.read(path, dtype="float32", always_2d=True)
    if audio.shape[1] == 1:
        audio = np.repeat(audio, 2, axis=1)
    elif audio.shape[1] != 2:
        raise RuntimeError(f"detail SFX must be mono or stereo: {path}")
    if sample_rate == SAMPLE_RATE:
        return audio
    output_frames = int(round(len(audio) * SAMPLE_RATE / sample_rate))
    source_positions = np.arange(len(audio), dtype=np.float64)
    target_positions = np.linspace(0, len(audio) - 1, output_frames)
    return np.stack(
        [np.interp(target_positions, source_positions, audio[:, channel]) for channel in range(2)],
        axis=1,
    ).astype(np.float32)


def _detail_schedule(items: list[dict[str, Any]], layer: str) -> tuple[list[dict[str, Any]], list[tuple[int, np.ndarray]]]:
    repeats = {"WIDE": 4, "MEDIUM": 5, "CLOSE": 4}[layer]
    count = len(items) * repeats
    rng = np.random.default_rng({"WIDE": 505_011, "MEDIUM": 505_031, "CLOSE": 505_051}[layer])
    nominal = np.linspace(22.0, 570.0, count)
    event_items = [items[index % len(items)] for index in range(count)]
    rng.shuffle(event_items)
    descriptions: list[dict[str, Any]] = []
    rendered: list[tuple[int, np.ndarray]] = []
    gain = {"WIDE": 0.10, "MEDIUM": 0.20, "CLOSE": 0.24}[layer]
    for index, (nominal_time, item) in enumerate(zip(nominal, event_items, strict=True)):
        start_seconds = float(np.clip(nominal_time + rng.uniform(-3.0, 3.0), 3.0, 589.0))
        clip = _resampled_clip(Path(item["audio"]["path"])) * gain
        start_frame = int(round(start_seconds * SAMPLE_RATE))
        descriptions.append(
            {
                "event_index": index,
                "layer": layer,
                "source_sfx_id": item["stable_prototype_id"],
                "source_path": item["audio"]["path"],
                "source_sha256": item["audio"]["sha256"],
                "start_seconds": round(start_seconds, 6),
                "duration_seconds": round(len(clip) / SAMPLE_RATE, 6),
                "gain_linear": gain,
            }
        )
        rendered.append((start_frame, clip))
    descriptions.sort(key=lambda row: row["start_seconds"])
    rendered.sort(key=lambda row: row[0])
    return descriptions, rendered


def _overlay_stream(base_path: Path, events: list[tuple[int, np.ndarray]], base_gain: float) -> Iterable[np.ndarray]:
    chunk_frames = SAMPLE_RATE * 10
    cursor = 0
    with sf.SoundFile(base_path) as base:
        if base.samplerate != SAMPLE_RATE or base.channels != 2 or base.frames != int(TEN_MINUTES * SAMPLE_RATE):
            raise RuntimeError(f"v1 procedural base format mismatch: {base_path}")
        while cursor < base.frames:
            block = base.read(chunk_frames, dtype="float32", always_2d=True) * base_gain
            block_end = cursor + len(block)
            for event_start, clip in events:
                event_end = event_start + len(clip)
                overlap_start = max(cursor, event_start)
                overlap_end = min(block_end, event_end)
                if overlap_start < overlap_end:
                    block[overlap_start - cursor:overlap_end - cursor] += clip[
                        overlap_start - event_start:overlap_end - event_start
                    ]
            yield np.clip(block, -0.88, 0.88)
            cursor = block_end


def build_living_lot() -> dict[str, Any]:
    """Build v2 acoustic zoom with sparse, hash-bound semantic detail overlays."""

    manifest_path = LIVING_ROOT / "living-lot-soundscape-catalogue.v2.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        for record in manifest["all_audio_files"]:
            require_file(Path(record["path"]), record["sha256"])
        return manifest

    base = _load_or_build_living_lot_v1()
    lot_sfx = generate_lot_sfx()
    v2_root = LIVING_ROOT / "v2"
    base_by_layer = {row["zoom"]: row for row in base["layers"]}
    sfx_by_layer = {
        layer: [row for row in lot_sfx["items"] if row["zoom"] == layer]
        for layer in ("WIDE", "MEDIUM", "CLOSE")
    }
    base_gains = {"WIDE": 0.62, "MEDIUM": 0.30, "CLOSE": 0.52}
    layers: list[dict[str, Any]] = []
    full_schedule: list[dict[str, Any]] = []
    for layer in ("WIDE", "MEDIUM", "CLOSE"):
        schedule, rendered = _detail_schedule(sfx_by_layer[layer], layer)
        full_schedule.extend(schedule)
        base_record = base_by_layer[layer]
        path = v2_root / "layers" / f"ASP01-LIVING-{layer}-DETAIL-v2-600s.wav"
        sidecar = path.with_suffix(".json")
        if path.exists() or sidecar.exists():
            if not path.is_file() or not sidecar.is_file():
                raise RuntimeError(f"partial v2 living layer exists; refusing overwrite: {path}")
            record = json.loads(sidecar.read_text(encoding="utf-8"))
            require_file(path, record["audio"]["sha256"])
        else:
            audio = write_stream_atomic(
                path,
                _overlay_stream(Path(base_record["audio"]["path"]), rendered, base_gains[layer]),
                SAMPLE_RATE,
                2,
                subtype="PCM_24",
            )
            screen = technical_screen(path, expected_duration_seconds=TEN_MINUTES, expected_channels=2, music=False)
            if not screen["automatic_pass"]:
                raise RuntimeError(f"v2 living layer screen failed: {layer}: {screen['failure_reasons']}")
            record = {
                "stable_prototype_id": f"ASP01-LIVING-{layer}-DETAIL-V2",
                "zoom": layer,
                "audio": audio,
                "analysis": screen,
                "generation": "DETERMINISTIC_PROCEDURAL_BASE_PLUS_FIXED_HASHED_GENERATED_DETAIL_OVERLAYS",
                "procedural_base": {
                    "stable_prototype_id": base_record["stable_prototype_id"],
                    "path": base_record["audio"]["path"],
                    "sha256": base_record["audio"]["sha256"],
                    "gain_linear": base_gains[layer],
                },
                "scheduled_detail_event_count": len(schedule),
                "scheduled_detail_sources": [
                    {
                        "stable_prototype_id": item["stable_prototype_id"],
                        "path": item["audio"]["path"],
                        "sha256": item["audio"]["sha256"],
                    }
                    for item in sfx_by_layer[layer]
                ],
                "duration_seconds": TEN_MINUTES,
                "rights_status": "PROTOTYPE_ONLY",
            }
            write_manifest(sidecar, record)
        layers.append(record)

    layer_paths = [Path(row["audio"]["path"]) for row in layers]
    fixture_specs = {
        "IDLE": (0.82, 0.18, 0.06, "explicit lab fixture; no authoritative activity"),
        "ACTIVE_PRODUCTION": (0.72, 0.58, 0.46, "explicit lab fixture; no Production truth"),
        "LOAD_IN": (0.68, 0.54, 0.72, "explicit lab fixture; no load-in truth"),
        "BLOCKED_PRODUCTION": (0.80, 0.14, 0.10, "explicit lab fixture; no blocker legality or truth"),
        "CLOSE_STAGE_INSPECTION": (0.34, 0.50, 0.96, "explicit lab fixture; no Stage or inspection truth"),
    }
    fixture_records: list[dict[str, Any]] = []
    for name, (gw, gm, gc, disclaimer) in fixture_specs.items():
        path = v2_root / "fixture-presentations" / f"ASP01-LIVING-FIXTURE-{name}-v2-600s.wav"
        sidecar = path.with_suffix(".json")
        expected_hash = None
        if sidecar.is_file():
            expected_hash = json.loads(sidecar.read_text(encoding="utf-8"))["audio"]["sha256"]
        elif path.is_file():
            expected_hash = sha256_file(path)
        audio = ffmpeg_atomic(
            [
                "-i", layer_paths[0], "-i", layer_paths[1], "-i", layer_paths[2],
                "-filter_complex",
                f"[0:a]volume={gw}[w];[1:a]volume={gm}[m];[2:a]volume={gc}[c];"
                "[w][m][c]amix=inputs=3:normalize=0,alimiter=limit=0.88[out]",
                "-map", "[out]", "-map_metadata", "-1", "-ar", str(SAMPLE_RATE), "-ac", "2",
                "-c:a", "pcm_s24le", "-f", "wav",
            ],
            path,
            expected_existing_sha256=expected_hash,
        )
        row = {
                "stable_prototype_id": f"ASP01-LIVING-FIXTURE-{name}-V2",
                "fixture": name,
                "audio": audio,
                "layer_gains_linear": [gw, gm, gc],
                "source_layer_ids": [row["stable_prototype_id"] for row in layers],
                "truth_boundary": disclaimer,
            }
        write_manifest(sidecar, row)
        fixture_records.append(row)

    era_specs = {
        "EARLY_PRESENTATION": (0.78, 0.28, 0.30, "lowpass=f=6500,stereotools=mlev=1:slev=0.22"),
        "MID_PRESENTATION": (0.72, 0.48, 0.48, "lowpass=f=12000,stereotools=mlev=1:slev=0.65"),
        "MODERN_PRESENTATION": (0.68, 0.50, 0.58, "stereotools=mlev=1:slev=0.9"),
    }
    era_records: list[dict[str, Any]] = []
    for name, (gw, gm, gc, treatment) in era_specs.items():
        path = v2_root / "era-presentations" / f"ASP01-LIVING-{name}-v2-600s.wav"
        sidecar = path.with_suffix(".json")
        expected_hash = None
        if sidecar.is_file():
            expected_hash = json.loads(sidecar.read_text(encoding="utf-8"))["audio"]["sha256"]
        elif path.is_file():
            expected_hash = sha256_file(path)
        audio = ffmpeg_atomic(
            [
                "-i", layer_paths[0], "-i", layer_paths[1], "-i", layer_paths[2],
                "-filter_complex",
                f"[0:a]volume={gw}[w];[1:a]volume={gm}[m];[2:a]volume={gc}[c];"
                f"[w][m][c]amix=inputs=3:normalize=0,{treatment},alimiter=limit=0.88[out]",
                "-map", "[out]", "-map_metadata", "-1", "-ar", str(SAMPLE_RATE), "-ac", "2",
                "-c:a", "pcm_s24le", "-f", "wav",
            ],
            path,
            expected_existing_sha256=expected_hash,
        )
        row = {
                "stable_prototype_id": f"ASP01-LIVING-{name}-V2",
                "presentation": name,
                "audio": audio,
                "layer_gains_linear": [gw, gm, gc],
                "source_layer_ids": [row["stable_prototype_id"] for row in layers],
                "treatment": treatment,
                "era_truth": "NONE; LAB PRESENTATION COLOR ONLY",
            }
        write_manifest(sidecar, row)
        era_records.append(row)

    fixture_layer_bindings: list[dict[str, Any]] = []
    for fixture, values in fixture_specs.items():
        for index, layer in enumerate(layers):
            audio = layer["audio"]
            fixture_layer_bindings.append(
                {
                    "stable_prototype_id": f"ASP01-LIVING-BINDING-{fixture}-{layer['zoom']}-V2",
                    "commissioning_alias": None,
                    "era_truth": "NONE_LAB_FIXTURE_ONLY",
                    "fixture": fixture,
                    "layer": layer["zoom"],
                    "relative_path": str(Path(audio["path"]).relative_to(PILOT_ROOT)),
                    "sha256": audio["sha256"],
                    "format": audio["probe"],
                    "gain_linear": values[index],
                    "permitted_contexts": ["AUDIO_LAB", "LIVING_LOT_FIXTURE"],
                    "activity_truth_owned": False,
                }
            )
    all_audio = [row["audio"] for row in layers] + [row["audio"] for row in fixture_records] + [row["audio"] for row in era_records]
    manifest = {
        "schema": "project-studio-living-lot-soundscape/v2",
        "generated_at_utc": utc_now(),
        "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "supersedes": {
            **file_record(LIVING_ROOT / "living-lot-soundscape-catalogue.json"),
            "reason": "v1 did not schedule the generated semantic lot-detail library into WIDE/MEDIUM/CLOSE",
        },
        "duration_seconds": TEN_MINUTES,
        "sample_rate_hz": SAMPLE_RATE,
        "layers": layers,
        "detail_sfx_schedule": sorted(full_schedule, key=lambda row: (row["start_seconds"], row["layer"])),
        "fixture_presentations": fixture_records,
        "era_presentations": era_records,
        "fixture_layer_bindings": fixture_layer_bindings,
        "all_audio_files": all_audio,
        "semantic_detail_counts": {layer: len([row for row in full_schedule if row["layer"] == layer]) for layer in ("WIDE", "MEDIUM", "CLOSE")},
        "music_off_coherent_world": "OWNER_LISTENING_GATE_PENDING",
        "activity_truth_owned": False,
        "zoom_changes_presentation_only": True,
        "rights_status": "PROTOTYPE_ONLY",
        "limitations": [
            "Sparse schedules prove named source/event presence, not perceptual credibility, comfort, or absence of a wall-of-noise effect.",
            "Owner listening remains required for acoustic-zoom distinction, fatigue, level, and semantic credibility.",
            "Fixtures and era colors are audition presentation only and never manufacture simulation or P13 truth.",
        ],
    }
    write_manifest(manifest_path, manifest)
    return manifest


def _management_technical_restraint_proxy(candidate: dict[str, Any]) -> dict[str, Any]:
    """Rank file fitness only; this intentionally cannot score semantic or listening quality."""

    signal = candidate["analysis"]["signal"]
    duration = float(candidate["analysis"]["format"]["duration_seconds"])
    peak_dbfs = float(signal["peak_dbfs"])
    rms_dbfs = float(signal["rms_dbfs"])
    leading = float(signal["leading_silence_seconds"])
    trailing = float(signal["trailing_silence_seconds"])
    headroom_db = -peak_dbfs
    duration_penalty = duration * 30.0
    loudness_penalty = max(0.0, rms_dbfs + 18.0) * 2.0
    low_headroom_penalty = max(0.0, 6.0 - headroom_db) * 3.0
    edge_silence_penalty = max(0.0, leading - 0.015) * 100.0 + max(0.0, trailing - 0.020) * 100.0
    score = 100.0 - duration_penalty - loudness_penalty - low_headroom_penalty - edge_silence_penalty
    return {
        "score_higher_is_more_technically_restrained": round(score, 6),
        "duration_seconds": duration,
        "peak_dbfs": peak_dbfs,
        "rms_dbfs": rms_dbfs,
        "headroom_db": round(headroom_db, 6),
        "leading_silence_seconds": leading,
        "trailing_silence_seconds": trailing,
        "formula": (
            "100 - 30*duration_seconds - 2*max(0,rms_dbfs+18) "
            "- 3*max(0,6-headroom_db) - 100*max(0,leading_silence_seconds-0.015) "
            "- 100*max(0,trailing_silence_seconds-0.020)"
        ),
        "proof_scope": "BOUNDED_TECHNICAL_RESTRAINT_PROXY_ONLY",
    }


def build_management_pack() -> dict[str, Any]:
    v1_path = MANAGEMENT_ROOT / "management-semantic-catalogue.json"
    manifest_path = MANAGEMENT_CATALOGUE
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        if len(manifest.get("candidates", [])) != 45:
            raise RuntimeError("existing management catalogue has wrong candidate count")
        for item in manifest["candidates"]:
            require_file(Path(item["audio"]["path"]), item["audio"]["sha256"])
        return manifest
    if MANAGEMENT_V2_CATALOGUE.exists():
        manifest = json.loads(MANAGEMENT_V2_CATALOGUE.read_text(encoding="utf-8"))
        manifest["schema"] = "project-studio-management-audio-language/v3"
        manifest["generated_at_utc"] = utc_now()
        manifest["supersedes"] = {
            **file_record(MANAGEMENT_V2_CATALOGUE),
            "reason": "v2 used fixed audition ordering and did not satisfy the required machine-provisional technical selection",
        }
        candidates_by_family: dict[str, list[dict[str, Any]]] = {}
        for candidate in manifest["candidates"]:
            candidate["technical_restraint_proxy"] = _management_technical_restraint_proxy(candidate)
            candidates_by_family.setdefault(candidate["semantic_event"], []).append(candidate)
        selections = []
        for semantic in SEMANTICS:
            ranked = sorted(
                candidates_by_family[semantic["id"]],
                key=lambda row: (
                    -row["technical_restraint_proxy"]["score_higher_is_more_technically_restrained"],
                    row["stable_prototype_id"],
                ),
            )
            selections.append(
                {
                    "semantic_event": semantic["id"],
                    "provisional_pick": ranked[0]["stable_prototype_id"],
                    "alternate": ranked[1]["stable_prototype_id"],
                    "selection_disposition": "MACHINE_PROVISIONAL_TECHNICAL_PROXY_PENDING_HUMAN_LISTENING",
                    "selection_basis": (
                        "deterministic bounded technical-restraint proxy using measured duration, peak/RMS headroom, "
                        "and edge silence; stable ID is tie-break only"
                    ),
                    "ranked_candidate_ids": [row["stable_prototype_id"] for row in ranked],
                    "ranked_scores": [
                        row["technical_restraint_proxy"]["score_higher_is_more_technically_restrained"]
                        for row in ranked
                    ],
                }
            )
        manifest["selections"] = selections
        manifest["machine_selection_scope"] = "TECHNICAL_RESTRAINT_PROXY_ONLY"
        manifest["limitations"] = [
            "The proxy compares technical restraint only; it does not establish meaning, quality, usability, or listener preference.",
            "All candidates require listening for semantic clarity, restraint, fatigue, repetition, and casino-like associations.",
        ]
        write_manifest(manifest_path, manifest)
        return manifest
    if v1_path.exists():
        raise RuntimeError(
            f"immutable v2 management catalogue must exist before v3 technical-proxy migration: {MANAGEMENT_V2_CATALOGUE}"
        )

    candidates: list[dict[str, Any]] = []
    selections: list[dict[str, Any]] = []
    for semantic_index, semantic in enumerate(SEMANTICS):
        semantic_rows: list[dict[str, Any]] = []
        for candidate_index in range(1, 4):
            stable_id = f"ASP01-UI-{semantic['id']}-C{candidate_index}"
            duration = 0.12 + semantic_index * 0.017 + candidate_index * 0.027
            if semantic["id"] in {"BLOCKED_REFUSED", "WARNING", "COMPLETION"}:
                duration += 0.18
            base = 238 + semantic_index * 19 + candidate_index * 11
            interval = {1: 1.25, 2: 1.5, 3: 1.333}[candidate_index]
            descending = semantic["id"] in {"CLOSE_BACK", "CANCEL", "BLOCKED_REFUSED", "SPEED_DOWN"}
            frequencies = (float(base), float(base / interval if descending else base * interval))
            audio = render_semantic_tone(
                duration_seconds=duration,
                sample_rate=SAMPLE_RATE,
                frequencies_hz=frequencies,
                amplitudes=(0.18, 0.13),
                attack_seconds=0.008,
                release_seconds=min(0.12, duration * 0.42),
                noise_amplitude=0.004 if semantic["id"] in {"PLACE", "COMMIT", "SAVE", "LOAD"} else 0.0,
                seed=seed_for(stable_id),
                descending=descending,
            )
            path = MANAGEMENT_ROOT / semantic["id"].lower() / f"{stable_id}.wav"
            record = write_audio_atomic(path, audio, SAMPLE_RATE, subtype="PCM_24")
            screen = technical_screen(path, expected_duration_seconds=duration, expected_channels=1, music=False)
            if not screen["automatic_pass"]:
                raise RuntimeError(f"management SFX screen failed: {stable_id}: {screen['failure_reasons']}")
            row = {
                "stable_prototype_id": stable_id,
                "semantic_event": semantic["id"],
                "candidate_index": candidate_index,
                "audio": record,
                "analysis": screen,
                "generation": "DETERMINISTIC_PROCEDURAL_SYNTHESIS",
                "seed": seed_for(stable_id),
                "rights_status": "PROTOTYPE_ONLY",
                "human_disposition": "PENDING",
            }
            row["technical_restraint_proxy"] = _management_technical_restraint_proxy(row)
            semantic_rows.append(row)
            candidates.append(row)
        ranked = sorted(
            semantic_rows,
            key=lambda row: (
                -row["technical_restraint_proxy"]["score_higher_is_more_technically_restrained"],
                row["stable_prototype_id"],
            ),
        )
        selections.append(
            {
                "semantic_event": semantic["id"],
                "provisional_pick": ranked[0]["stable_prototype_id"],
                "alternate": ranked[1]["stable_prototype_id"],
                "selection_disposition": "MACHINE_PROVISIONAL_TECHNICAL_PROXY_PENDING_HUMAN_LISTENING",
                "selection_basis": "deterministic bounded technical-restraint proxy; human listening remains required",
                "ranked_candidate_ids": [row["stable_prototype_id"] for row in ranked],
                "ranked_scores": [
                    row["technical_restraint_proxy"]["score_higher_is_more_technically_restrained"]
                    for row in ranked
                ],
            }
        )
    if len(candidates) != 45 or len({row["audio"]["sha256"] for row in candidates}) != 45:
        raise RuntimeError("management SFX cardinality/unique hash proof failed")
    vocabulary = []
    for semantic in SEMANTICS:
        vocabulary.append(
            {
                **semantic,
                "maximum_concurrency": semantic.pop("concurrency") if False else semantic["concurrency"],
                "repeat_variation": "shuffle among approved candidates; no immediate repeat",
                "volume_range_db": [-24, -12] if semantic["priority"] < 50 else [-21, -10],
                "bus": "UI",
                "visual_text_equivalent": f"visible state/text for {semantic['meaning']}; never audio-only",
                "ducks_music": False,
                "prohibited_casino_behavior": "no reward shower, escalating pitch ladder, coin/chime cascade, randomized jackpot accent, or unbounded repeat",
            }
        )
    manifest = {
        "schema": "project-studio-management-audio-language/v3",
        "generated_at_utc": utc_now(),
        "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "semantic_family_count": len(SEMANTICS),
        "candidate_count": len(candidates),
        "candidates_per_family": 3,
        "vocabulary": vocabulary,
        "candidates": candidates,
        "selections": selections,
        "machine_selection_scope": "TECHNICAL_RESTRAINT_PROXY_ONLY",
        "critical_information_audio_only": False,
        "rights_status": "PROTOTYPE_ONLY",
        "limitations": [
            "The technical proxy cannot establish meaning, quality, usability, or listener preference.",
            "All candidates require listening for semantic clarity, restraint, fatigue, repetition, and casino-like associations.",
        ],
    }
    write_manifest(manifest_path, manifest)
    return manifest


def build_transitions() -> dict[str, Any]:
    v1_path = TRANSITION_V1_CATALOGUE
    v2_path = TRANSITION_V2_CATALOGUE
    v3_path = TRANSITION_V3_CATALOGUE
    manifest_path = TRANSITION_CATALOGUE
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        if len(manifest.get("renders", [])) != 9:
            raise RuntimeError("existing transition catalogue has wrong render count")
        for row in manifest["renders"]:
            require_file(Path(row["audio"]["path"]), row["audio"]["sha256"])
        return manifest
    living = build_living_lot()
    wide_record = next(row for row in living["layers"] if row["zoom"] == "WIDE")
    wide = Path(wide_record["audio"]["path"])
    require_file(wide)
    renders: list[dict[str, Any]] = []
    for boundary in TRANSITIONS:
        outgoing = require_file(Path(boundary["out_path"]), boundary["out_sha256"])
        incoming = require_file(Path(boundary["in_path"]), boundary["in_sha256"])
        output_dir = TRANSITION_ROOT / boundary["id"]
        specs: tuple[tuple[str, list[Any], str, str], ...] = (
            (
                "FINAL-WINDOW-AMBIENCE-BRIDGE",
                [
                    "-i", outgoing, "-i", wide, "-i", incoming,
                    "-filter_complex",
                    "[0:a]atrim=start=107.75:end=119.75,asetpts=PTS-STARTPTS,afade=t=out:st=7.75:d=4.25[o];"
                    "[1:a]atrim=start=12:end=18,asetpts=PTS-STARTPTS,volume=0.40,afade=t=in:st=0:d=1.25,afade=t=out:st=4.75:d=1.25[a];"
                    "[2:a]atrim=start=0.25:end=12.25,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=4.25[i];"
                    "[o][a][i]concat=n=3:v=0:a=1[out]",
                    "-map", "[out]", "-map_metadata", "-1", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", "-f", "wav",
                ],
                "UNVERIFIED_FINAL_WINDOW_WITH_SIX_SECOND_AMBIENCE_BRIDGE",
                "Fixed final source window only; no natural ending, authored cadence, phrase, bar, or phase alignment is claimed",
            ),
            (
                "SAFE-UNVERIFIED-WINDOW-CROSSFADE",
                [
                    "-i", outgoing, "-i", incoming,
                    "-filter_complex",
                    "[0:a]atrim=start=87.5:end=107.5,asetpts=PTS-STARTPTS[o];"
                    "[1:a]atrim=start=0.5:end=20.5,asetpts=PTS-STARTPTS[i];"
                    "[o][i]acrossfade=d=8:c1=qsin:c2=qsin[out]",
                    "-map", "[out]", "-map_metadata", "-1", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", "-f", "wav",
                ],
                "SAFE_UNVERIFIED_WINDOW_CROSSFADE",
                "Fixed audition windows only; no BPM, downbeat, bar, or phrase boundary is claimed",
            ),
            (
                "GENERIC-DERIVED-EXIT-ENTRY",
                [
                    "-i", outgoing, "-i", wide, "-i", incoming,
                    "-filter_complex",
                    "[0:a]atrim=start=110:end=120,asetpts=PTS-STARTPTS,lowpass=f=4200,afade=t=out:st=6:d=4[o];"
                    "[1:a]atrim=start=36:end=38,asetpts=PTS-STARTPTS,volume=0.32,highpass=f=90,lowpass=f=3600[a];"
                    "[2:a]atrim=start=0:end=10,asetpts=PTS-STARTPTS,highpass=f=55,afade=t=in:st=0:d=4[i];"
                    "[o][a][i]concat=n=3:v=0:a=1[out]",
                    "-map", "[out]", "-map_metadata", "-1", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", "-f", "wav",
                ],
                "GENERIC_DERIVED_EXIT_AMBIENCE_ENTRY_TREATMENT",
                "One generic recipe across boundaries; not bespoke, a stem, or an authored shared session",
            ),
        )
        for treatment_id, args, classification, honesty in specs:
            path = output_dir / f"ASP01-TRANSITION-{boundary['id']}-{treatment_id}-v2.wav"
            sidecar = path.with_suffix(".v4.json")
            sidecar_record = json.loads(sidecar.read_text(encoding="utf-8")) if sidecar.is_file() else None
            audio = ffmpeg_atomic(
                args,
                path,
                expected_existing_sha256=(sidecar_record["audio"]["sha256"] if sidecar_record is not None else None),
            )
            screen = technical_screen(path, expected_channels=2, music=False)
            if not screen["automatic_pass"]:
                raise RuntimeError(f"transition render screen failed: {path}: {screen['failure_reasons']}")
            row = {
                    "stable_prototype_id": f"ASP01-TRANSITION-{boundary['id']}-{treatment_id}",
                    "boundary_id": boundary["id"],
                    "outgoing_alias": boundary["out_alias"],
                    "incoming_alias": boundary["in_alias"],
                    "outgoing_source": {"candidate_id": boundary["out_id"], "path": str(outgoing), "sha256": boundary["out_sha256"]},
                    "incoming_source": {"candidate_id": boundary["in_id"], "path": str(incoming), "sha256": boundary["in_sha256"]},
                    "ambience_source": (
                        {
                            "stable_prototype_id": wide_record["stable_prototype_id"],
                            "path": str(wide),
                            "sha256": wide_record["audio"]["sha256"],
                        }
                        if treatment_id in {"FINAL-WINDOW-AMBIENCE-BRIDGE", "GENERIC-DERIVED-EXIT-ENTRY"}
                        else None
                    ),
                    "treatment": treatment_id,
                    "owner_facing_filename_uses_honest_treatment_token": True,
                    "classification": classification,
                    "honesty": honesty,
                    "phrase_boundary_claimed": False,
                    "bespoke_claimed": False,
                    "natural_ending_claimed": False,
                    "audio": audio,
                    "analysis": screen,
                    "human_disposition": "PENDING",
                    "rights_status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
                }
            write_manifest(sidecar, row)
            renders.append(row)
    if len(renders) != 9 or len({row["audio"]["sha256"] for row in renders}) != 9:
        raise RuntimeError("transition cardinality/unique hash proof failed")
    manifest = {
        "schema": "project-studio-rendered-era-transitions/v4",
        "generated_at_utc": utc_now(),
        "boundary_count": 3,
        "treatments_per_boundary": 3,
        "render_count": 9,
        "renders": renders,
        "source_separation_or_fake_stems": False,
        "phrase_boundary_claimed_for_rendered_files": False,
        "bespoke_boundary_specific_edit_claimed": False,
        "natural_ending_claimed_for_rendered_files": False,
        "human_acceptance": "NONE_RECORDED",
        "rights_status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
    }
    if v3_path.exists():
        manifest["supersedes"] = {
            **file_record(v3_path),
            "reason": "v3 used an unverified NATURAL_ENDING label for a fixed final-window fade",
        }
    write_manifest(manifest_path, manifest)
    return manifest


def build_master_index(
    lot_sfx: dict[str, Any] | None = None,
    living: dict[str, Any] | None = None,
    management: dict[str, Any] | None = None,
    transitions: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Create a non-scanning, hash-bound index for Oracle/audition consumers."""

    if MASTER_INDEX.exists():
        index = json.loads(MASTER_INDEX.read_text(encoding="utf-8"))
        for asset in index["audio_assets"]:
            require_file(PILOT_ROOT / asset["relative_path"], asset["sha256"])
        return index
    if not RESPONSIVE_CATALOGUE.is_file():
        raise RuntimeError(f"responsive bundle catalogue is required before master index: {RESPONSIVE_CATALOGUE}")
    lot_sfx = lot_sfx or generate_lot_sfx()
    living = living or build_living_lot()
    management = management or build_management_pack()
    transitions = transitions or build_transitions()
    responsive = json.loads(RESPONSIVE_CATALOGUE.read_text(encoding="utf-8"))
    responsive_register = json.loads(RESPONSIVE_REGISTER.read_text(encoding="utf-8"))
    responsive_analysis = {
        row["candidate_id"]: row["analysis"] for row in responsive_register["candidates"]
    }

    assets: list[dict[str, Any]] = []
    known_ids: set[str] = set()
    known_paths: set[str] = set()

    def add_asset(
        stable_id: str,
        record: dict[str, Any],
        *,
        category: str,
        rights_status: str,
        context: dict[str, Any],
    ) -> str:
        if stable_id in known_ids:
            raise RuntimeError(f"duplicate master-index stable ID: {stable_id}")
        path = Path(record["path"]).resolve(strict=True)
        try:
            relative = path.relative_to(PILOT_ROOT.resolve(strict=True))
        except ValueError as error:
            raise RuntimeError(f"indexed output escapes pilot root: {path}") from error
        relative_text = str(relative)
        if relative_text in known_paths:
            raise RuntimeError(f"duplicate master-index audio path: {relative_text}")
        require_file(path, record["sha256"])
        audio_format = record.get("probe") or probe_audio(path)
        assets.append(
            {
                "stable_prototype_id": stable_id,
                "category": category,
                "relative_path": relative_text,
                "sha256": record["sha256"],
                "bytes": path.stat().st_size,
                "duration_seconds": audio_format["duration_seconds"],
                "format": audio_format,
                "rights_status": rights_status,
                "human_disposition": "PENDING",
                "permitted_lab_contexts": ["AUDIO_LAB", "OFFLINE_AUDITION", "AUDIO_ORACLE_DEMO"],
                **context,
            }
        )
        known_ids.add(stable_id)
        known_paths.add(relative_text)
        return stable_id

    responsive_selections: list[dict[str, Any]] = []
    for variant in responsive["variants"]:
        prefix = variant["stable_bundle_variant_id"]
        asset_ids = [
            add_asset(
                prefix + "-RAW",
                variant["source"],
                category="RESPONSIVE_MUSIC_SOURCE",
                rights_status="PROTOTYPE_ONLY",
                context={"commissioning_alias": variant["epoch"], "context": variant["context"], "derivative_role": "RAW_SELECTED_CANDIDATE"},
            )
        ]
        for role in ("normalized", "loop", "entry", "exit", "preview"):
            asset_ids.append(
                add_asset(
                    prefix + "-" + role.upper(),
                    variant["derivatives"][role],
                    category="RESPONSIVE_MUSIC_DERIVATIVE",
                    rights_status=variant["rights_status"],
                    context={"commissioning_alias": variant["epoch"], "context": variant["context"], "derivative_role": role.upper()},
                )
            )
        responsive_selections.append(
            {
                "stable_bundle_variant_id": prefix,
                "commissioning_alias": variant["epoch"],
                "context": variant["context"],
                "classification": variant["classification"],
                "selected_candidate_id": variant["selected_candidate_id"],
                "transition_metadata": variant["transition_metadata"],
                "asset_ids": asset_ids,
                "machine_proof_scope": "FILE_FITNESS_ONLY",
                "contextual_differentiation": "NOT_PROVEN_REQUIRES_OWNER_LISTENING",
                "selected_file_fitness_metrics": {
                    "rms_dbfs": responsive_analysis[variant["selected_candidate_id"]]["signal"]["rms_dbfs"],
                    "onset_density_per_second": responsive_analysis[variant["selected_candidate_id"]]["signal"]["onset_density_per_second"],
                    "automatic_pass": responsive_analysis[variant["selected_candidate_id"]]["automatic_pass"],
                },
            }
        )

    for item in lot_sfx["items"]:
        add_asset(
            item["stable_prototype_id"],
            item["audio"],
            category="GENERATED_LOT_DETAIL_SFX",
            rights_status=item["rights_status"],
            context={"zoom": item["zoom"]},
        )
    for layer in living["layers"]:
        add_asset(
            layer["stable_prototype_id"],
            layer["audio"],
            category="LIVING_LOT_LAYER",
            rights_status=layer["rights_status"],
            context={"zoom": layer["zoom"], "fixture": None},
        )
    for item in living["fixture_presentations"]:
        add_asset(
            item["stable_prototype_id"],
            item["audio"],
            category="LIVING_LOT_FIXTURE_PRESENTATION",
            rights_status="PROTOTYPE_ONLY",
            context={"fixture": item["fixture"]},
        )
    for item in living["era_presentations"]:
        add_asset(
            item["stable_prototype_id"],
            item["audio"],
            category="LIVING_LOT_ERA_PRESENTATION",
            rights_status="PROTOTYPE_ONLY",
            context={"presentation": item["presentation"], "era_truth": item["era_truth"]},
        )
    for item in management["candidates"]:
        add_asset(
            item["stable_prototype_id"],
            item["audio"],
            category="MANAGEMENT_SEMANTIC_SFX",
            rights_status=item["rights_status"],
            context={"semantic_event": item["semantic_event"], "candidate_index": item["candidate_index"]},
        )
    for item in transitions["renders"]:
        add_asset(
            item["stable_prototype_id"],
            item["audio"],
            category="ERA_TRANSITION_DEMO",
            rights_status=item["rights_status"],
            context={
                "boundary_id": item["boundary_id"],
                "outgoing_alias": item["outgoing_alias"],
                "incoming_alias": item["incoming_alias"],
                "treatment": item["treatment"],
            },
        )

    source_manifests = [
        RESPONSIVE_CATALOGUE,
        PILOT_ROOT / "02_music-bundles/responsive/responsive-anchor-authority.v2.json",
        SFX_ROOT / "lot-detail-sfx-catalogue.json",
        LIVING_CATALOGUE,
        MANAGEMENT_CATALOGUE,
        TRANSITION_CATALOGUE,
        DERIVATIVE_REGISTER,
        SFX_GATE_PATH,
    ]
    index = {
        "schema": "project-studio-audio-assets-index/v4",
        "generated_at_utc": utc_now(),
        "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "approved_root": str(PILOT_ROOT),
        "loading_law": "EXPLICIT_RELATIVE_PATH_ONLY; SHA256_REQUIRED; NO_RECURSIVE_SCAN; NO_NETWORK",
        "source_manifests": [file_record(path) for path in source_manifests],
        "audio_asset_count": len(assets),
        "audio_assets": assets,
        "responsive_selections": responsive_selections,
        "responsive_policy": responsive["selection_policy"],
        "living_fixture_layer_bindings": living["fixture_layer_bindings"],
        "management_selections": management["selections"],
        "rights_status": "PROTOTYPE_ONLY_OR_PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "human_acceptance": "NONE_RECORDED",
        "commercial_clearance": "NOT_CLAIMED",
    }
    if MASTER_V3_INDEX.exists():
        index["supersedes"] = {
            **file_record(MASTER_V3_INDEX),
            "reason": "v4 consumes explicit responsive dispositions/shared policy and removes the unverified natural-ending claim",
        }
    write_manifest(MASTER_INDEX, index)
    return index


def build_derivative_source_register() -> dict[str, Any]:
    """Name and hash every source used by an edited/mixed audio derivative."""

    if DERIVATIVE_REGISTER.exists():
        register = json.loads(DERIVATIVE_REGISTER.read_text(encoding="utf-8"))
        for relation in register["relationships"]:
            require_file(Path(relation["derivative"]["path"]), relation["derivative"]["sha256"])
            for source in relation["sources"]:
                require_file(Path(source["path"]), source["sha256"])
        return register

    responsive = json.loads(RESPONSIVE_CATALOGUE.read_text(encoding="utf-8"))
    living = json.loads(LIVING_CATALOGUE.read_text(encoding="utf-8"))
    transitions = json.loads(TRANSITION_CATALOGUE.read_text(encoding="utf-8"))
    relationships: list[dict[str, Any]] = []

    def source_record(stable_id: str, record: dict[str, Any], role: str) -> dict[str, Any]:
        return {
            "stable_prototype_id": stable_id,
            "role": role,
            "path": record["path"],
            "sha256": record["sha256"],
        }

    def add_relation(
        derivative_id: str,
        derivative: dict[str, Any],
        role: str,
        sources: list[dict[str, Any]],
        method: str,
    ) -> None:
        require_file(Path(derivative["path"]), derivative["sha256"])
        for source in sources:
            require_file(Path(source["path"]), source["sha256"])
        relationships.append(
            {
                "derivative": {
                    "stable_prototype_id": derivative_id,
                    "role": role,
                    "path": derivative["path"],
                    "sha256": derivative["sha256"],
                },
                "sources": sources,
                "method": method,
                "phase_or_stem_alignment_claimed": False,
            }
        )

    for variant in responsive["variants"]:
        prefix = variant["stable_bundle_variant_id"]
        raw_source = source_record(prefix + "-RAW", variant["source"], "GENERATED_FULL_MIX_SOURCE")
        normalized_record = variant["derivatives"]["normalized"]
        normalized_source = source_record(prefix + "-NORMALIZED", normalized_record, "NORMALIZED_FULL_MIX")
        loop_record = variant["derivatives"]["loop"]
        loop_source = source_record(prefix + "-LOOP", loop_record, "DERIVED_CROSSFADED_FULL_MIX_LOOP")
        add_relation(
            prefix + "-NORMALIZED",
            normalized_record,
            "LOUDNESS_NORMALIZED_FULL_MIX",
            [raw_source],
            "two-pass loudness normalization; 48 kHz stereo PCM-24",
        )
        for role in ("loop", "entry", "exit"):
            add_relation(
                prefix + "-" + role.upper(),
                variant["derivatives"][role],
                role.upper(),
                [normalized_source],
                "bounded full-mix editorial derivative; no source separation",
            )
        add_relation(
            prefix + "-PREVIEW",
            variant["derivatives"]["preview"],
            "AAC_AUDITION_PREVIEW",
            [loop_source],
            "192 kb/s AAC audition encode of the derived loop",
        )

    for layer in living["layers"]:
        base_source = {
            **layer["procedural_base"],
            "role": "PROCEDURAL_BASE",
        }
        detail_sources = [
            {**source, "role": "SCHEDULED_GENERATED_DETAIL_SFX"}
            for source in layer["scheduled_detail_sources"]
        ]
        add_relation(
            layer["stable_prototype_id"],
            layer["audio"],
            "LIVING_LOT_DETAIL_LAYER",
            [base_source, *detail_sources],
            "deterministic sparse hash-bound detail overlays on preserved procedural base",
        )

    living_sources = [
        source_record(layer["stable_prototype_id"], layer["audio"], layer["zoom"])
        for layer in living["layers"]
    ]
    for presentation in living["fixture_presentations"]:
        add_relation(
            presentation["stable_prototype_id"],
            presentation["audio"],
            "LIVING_LOT_FIXTURE_MIX",
            [
                {**source, "gain_linear": presentation["layer_gains_linear"][index]}
                for index, source in enumerate(living_sources)
            ],
            "deterministic three-layer fixture mix; presentation only and no activity truth",
        )
    for presentation in living["era_presentations"]:
        add_relation(
            presentation["stable_prototype_id"],
            presentation["audio"],
            "LIVING_LOT_ERA_PRESENTATION_MIX",
            [
                {**source, "gain_linear": presentation["layer_gains_linear"][index]}
                for index, source in enumerate(living_sources)
            ],
            f"deterministic three-layer mix plus {presentation['treatment']}; presentation only and no era truth",
        )

    for transition in transitions["renders"]:
        sources = [
            {
                "stable_prototype_id": transition["outgoing_source"]["candidate_id"],
                "role": "OUTGOING_FULL_MIX",
                "path": transition["outgoing_source"]["path"],
                "sha256": transition["outgoing_source"]["sha256"],
            },
            {
                "stable_prototype_id": transition["incoming_source"]["candidate_id"],
                "role": "INCOMING_FULL_MIX",
                "path": transition["incoming_source"]["path"],
                "sha256": transition["incoming_source"]["sha256"],
            },
        ]
        if transition["treatment"] in {
            "FINAL-WINDOW-AMBIENCE-BRIDGE",
            "GENERIC-DERIVED-EXIT-ENTRY",
        }:
            ambience = transition["ambience_source"]
            sources.append(
                {
                    "stable_prototype_id": ambience["stable_prototype_id"],
                    "role": "AMBIENCE_BRIDGE",
                    "path": ambience["path"],
                    "sha256": ambience["sha256"],
                }
            )
        add_relation(
            transition["stable_prototype_id"],
            transition["audio"],
            "ERA_TRANSITION_DEMO",
            sources,
            transition["classification"],
        )

    derivative_ids = [row["derivative"]["stable_prototype_id"] for row in relationships]
    if len(relationships) != 80 or len(derivative_ids) != len(set(derivative_ids)):
        raise RuntimeError("derivative source relationship cardinality/identity proof failed")
    register = {
        "schema": "project-studio-audio-derivative-source-register/v4",
        "generated_at_utc": utc_now(),
        "status": "HASH_VERIFIED",
        "relationship_count": len(relationships),
        "relationships": relationships,
        "rights_status": "PROTOTYPE_ONLY_OR_PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "honesty": "All relationships identify full-mix, procedural-layer, or editorial sources. No source is represented as a production stem.",
    }
    write_manifest(DERIVATIVE_REGISTER, register)
    return register


def _streaming_mono_correlation(left_path: Path, right_path: Path) -> float:
    sums = {"x": 0.0, "y": 0.0, "xx": 0.0, "yy": 0.0, "xy": 0.0}
    count = 0
    with sf.SoundFile(left_path) as left, sf.SoundFile(right_path) as right:
        if left.frames != right.frames or left.samplerate != right.samplerate:
            raise RuntimeError("living layers are not sample-aligned")
        while True:
            left_block = left.read(262_144, dtype="float64", always_2d=True)
            right_block = right.read(262_144, dtype="float64", always_2d=True)
            if not len(left_block):
                break
            x = np.mean(left_block, axis=1)
            y = np.mean(right_block, axis=1)
            count += len(x)
            sums["x"] += float(np.sum(x))
            sums["y"] += float(np.sum(y))
            sums["xx"] += float(np.dot(x, x))
            sums["yy"] += float(np.dot(y, y))
            sums["xy"] += float(np.dot(x, y))
    covariance = sums["xy"] - sums["x"] * sums["y"] / count
    variance_x = sums["xx"] - sums["x"] * sums["x"] / count
    variance_y = sums["yy"] - sums["y"] * sums["y"] / count
    return covariance / math.sqrt(variance_x * variance_y)


def _spectral_band_fractions(path: Path, seconds: int = 60) -> dict[str, float]:
    energy = np.zeros(3, dtype=np.float64)
    with sf.SoundFile(path) as handle:
        if handle.samplerate != SAMPLE_RATE:
            raise RuntimeError(f"living spectral proof sample-rate mismatch: {path}")
        for _ in range(seconds):
            block = handle.read(SAMPLE_RATE, dtype="float64", always_2d=True)
            if not len(block):
                break
            mono = np.mean(block, axis=1)
            mono *= np.hanning(len(mono))
            power = np.square(np.abs(np.fft.rfft(mono)))
            frequencies = np.fft.rfftfreq(len(mono), 1.0 / SAMPLE_RATE)
            energy[0] += float(np.sum(power[frequencies < 150]))
            energy[1] += float(np.sum(power[(frequencies >= 150) & (frequencies < 2_000)]))
            energy[2] += float(np.sum(power[frequencies >= 2_000]))
    total = float(np.sum(energy))
    if total <= 0:
        raise RuntimeError(f"living spectral proof found no signal: {path}")
    return {
        "below_150_hz": round(float(energy[0] / total), 7),
        "150_to_2000_hz": round(float(energy[1] / total), 7),
        "above_2000_hz": round(float(energy[2] / total), 7),
    }


def validate_evidence() -> dict[str, Any]:
    existing_validation: dict[str, Any] | None = None
    if VALIDATION_PATH.exists():
        existing_validation = json.loads(VALIDATION_PATH.read_text(encoding="utf-8"))
        if existing_validation.get("status") != "PASS" or not all(
            existing_validation.get("checks", {}).values()
        ):
            raise RuntimeError("existing asset validation is not a complete pass")

    master = json.loads(MASTER_INDEX.read_text(encoding="utf-8"))
    responsive = json.loads(RESPONSIVE_CATALOGUE.read_text(encoding="utf-8"))
    register = json.loads(RESPONSIVE_REGISTER.read_text(encoding="utf-8"))
    anchor_authority = verify_anchor_authorities()
    living = json.loads(LIVING_CATALOGUE.read_text(encoding="utf-8"))
    living_v1 = json.loads((LIVING_ROOT / "living-lot-soundscape-catalogue.json").read_text(encoding="utf-8"))
    management = json.loads(MANAGEMENT_CATALOGUE.read_text(encoding="utf-8"))
    transitions = json.loads(TRANSITION_CATALOGUE.read_text(encoding="utf-8"))
    transitions_v1 = json.loads(TRANSITION_V1_CATALOGUE.read_text(encoding="utf-8"))
    transitions_v3 = json.loads(TRANSITION_V3_CATALOGUE.read_text(encoding="utf-8"))
    lot_sfx = json.loads((SFX_ROOT / "lot-detail-sfx-catalogue.json").read_text(encoding="utf-8"))
    canonical = json.loads(CANONICAL_CATALOGUE.read_text(encoding="utf-8"))
    derivative_register = build_derivative_source_register()
    sfx_gate = json.loads(SFX_GATE_PATH.read_text(encoding="utf-8"))
    verify_gate_data(sfx_gate)

    asset_ids: list[str] = []
    asset_paths: list[str] = []
    asset_hashes: list[str] = []
    asset_inodes: list[tuple[int, int]] = []
    all_asset_hashes_match = True
    all_asset_paths_contained = True
    all_assets_regular_not_symlink = True
    for asset in master["audio_assets"]:
        unresolved_path = PILOT_ROOT / asset["relative_path"]
        path = unresolved_path.resolve(strict=True)
        try:
            path.relative_to(PILOT_ROOT.resolve(strict=True))
        except ValueError:
            all_asset_paths_contained = False
        all_assets_regular_not_symlink &= unresolved_path.is_file() and not unresolved_path.is_symlink()
        actual_hash = sha256_file(path)
        all_asset_hashes_match &= actual_hash == asset["sha256"]
        asset_ids.append(asset["stable_prototype_id"])
        asset_paths.append(asset["relative_path"])
        asset_hashes.append(actual_hash)
        stat = path.stat()
        asset_inodes.append((stat.st_dev, stat.st_ino))

    all_audio_by_path: dict[str, dict[str, Any]] = {
        asset["relative_path"]: {
            "stable_prototype_id": asset["stable_prototype_id"],
            "sha256": asset["sha256"],
        }
        for asset in master["audio_assets"]
    }
    responsive_candidate_evidence_complete = True
    for candidate in register["candidates"]:
        raw_path = Path(candidate["raw"]["path"])
        relative = str(raw_path.relative_to(PILOT_ROOT))
        all_audio_by_path.setdefault(
            relative,
            {"stable_prototype_id": candidate["candidate_id"], "sha256": candidate["raw"]["sha256"]},
        )
        analysis_path = (
            PILOT_ROOT
            / "02_music-bundles/responsive/analysis"
            / candidate["epoch"]
            / candidate["context"].lower()
            / f"{candidate['candidate_id']}.json"
        )
        log_path = (
            PILOT_ROOT
            / "12_logs/responsive-generation"
            / candidate["epoch"]
            / candidate["context"].lower()
            / f"{candidate['candidate_id']}.log"
        )
        if not analysis_path.is_file() or not log_path.is_file():
            responsive_candidate_evidence_complete = False
            continue
        analysis = json.loads(analysis_path.read_text(encoding="utf-8"))
        responsive_candidate_evidence_complete &= (
            analysis.get("candidate_id") == candidate["candidate_id"]
            and analysis.get("sha256") == candidate["raw"]["sha256"]
        )
    for layer in living_v1["layers"]:
        path = Path(layer["audio"]["path"])
        all_audio_by_path.setdefault(
            str(path.relative_to(PILOT_ROOT)),
            {"stable_prototype_id": layer["stable_prototype_id"] + "-V1-PRESERVED", "sha256": layer["audio"]["sha256"]},
        )
    for presentation in living_v1["fixture_presentations"]:
        path = Path(presentation["audio"]["path"])
        all_audio_by_path.setdefault(
            str(path.relative_to(PILOT_ROOT)),
            {"stable_prototype_id": f"ASP01-LIVING-FIXTURE-{presentation['fixture']}-V1-PRESERVED", "sha256": presentation["audio"]["sha256"]},
        )
    for presentation in living_v1["era_presentations"]:
        path = Path(presentation["audio"]["path"])
        all_audio_by_path.setdefault(
            str(path.relative_to(PILOT_ROOT)),
            {"stable_prototype_id": f"ASP01-LIVING-{presentation['presentation']}-V1-PRESERVED", "sha256": presentation["audio"]["sha256"]},
        )
    for transition in transitions_v1["renders"]:
        path = Path(transition["audio"]["path"])
        all_audio_by_path.setdefault(
            str(path.relative_to(PILOT_ROOT)),
            {
                "stable_prototype_id": transition["stable_prototype_id"] + "-V1-PRESERVED",
                "sha256": transition["audio"]["sha256"],
            },
        )
    for transition in transitions_v3["renders"]:
        path = Path(transition["audio"]["path"])
        all_audio_by_path.setdefault(
            str(path.relative_to(PILOT_ROOT)),
            {
                "stable_prototype_id": transition["stable_prototype_id"] + "-V3-PRESERVED",
                "sha256": transition["audio"]["sha256"],
            },
        )

    all_known_audio_hashes_match = True
    all_known_audio_ids: list[str] = []
    all_known_audio_hashes: list[str] = []
    all_known_audio_inodes: list[tuple[int, int]] = []
    for relative, record in all_audio_by_path.items():
        unresolved = PILOT_ROOT / relative
        resolved = unresolved.resolve(strict=True)
        try:
            resolved.relative_to(PILOT_ROOT.resolve(strict=True))
        except ValueError:
            all_known_audio_hashes_match = False
        actual_hash = sha256_file(resolved)
        all_known_audio_hashes_match &= (
            unresolved.is_file() and not unresolved.is_symlink() and actual_hash == record["sha256"]
        )
        all_known_audio_ids.append(record["stable_prototype_id"])
        all_known_audio_hashes.append(actual_hash)
        stat = resolved.stat()
        all_known_audio_inodes.append((stat.st_dev, stat.st_ino))

    raw_errors: list[str] = []
    for entry in canonical["entries"]:
        raw = entry["raw"]
        path = Path(raw["absolute_authoritative_path"])
        if (
            not path.is_file()
            or path.stat().st_size != raw["bytes"]
            or sha256_file(path) != raw["sha256"]
        ):
            raw_errors.append(entry["stable_prototype_id"])

    layer_paths = {
        layer["zoom"]: Path(layer["audio"]["path"])
        for layer in living["layers"]
    }
    correlations = {
        "WIDE_MEDIUM": round(_streaming_mono_correlation(layer_paths["WIDE"], layer_paths["MEDIUM"]), 9),
        "WIDE_CLOSE": round(_streaming_mono_correlation(layer_paths["WIDE"], layer_paths["CLOSE"]), 9),
        "MEDIUM_CLOSE": round(_streaming_mono_correlation(layer_paths["MEDIUM"], layer_paths["CLOSE"]), 9),
    }
    spectral_profiles = {
        layer: _spectral_band_fractions(path)
        for layer, path in layer_paths.items()
    }
    spectral_vectors = {
        layer: np.asarray(list(profile.values()), dtype=np.float64)
        for layer, profile in spectral_profiles.items()
    }
    spectral_distances = {
        "WIDE_MEDIUM": round(float(np.linalg.norm(spectral_vectors["WIDE"] - spectral_vectors["MEDIUM"])), 7),
        "WIDE_CLOSE": round(float(np.linalg.norm(spectral_vectors["WIDE"] - spectral_vectors["CLOSE"])), 7),
        "MEDIUM_CLOSE": round(float(np.linalg.norm(spectral_vectors["MEDIUM"] - spectral_vectors["CLOSE"])), 7),
    }

    owned_commit = subprocess.run(
        ["git", "log", "-1", "--format=%H", "--", "tools/audio_systems_pilot_01/audio_dsp.py"],
        cwd=DOC_REPO,
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()
    owned_commit_paths = subprocess.run(
        ["git", "show", "--pretty=format:", "--name-only", owned_commit],
        cwd=DOC_REPO,
        check=True,
        capture_output=True,
        text=True,
    ).stdout.splitlines()
    expected_owned_paths = {
        "tools/audio_systems_pilot_01/audio_dsp.py",
        "tools/audio_systems_pilot_01/sfx_route.py",
        "tools/audio_systems_pilot_01/generate_responsive_variants.py",
        "tools/audio_systems_pilot_01/build_audio_assets.py",
    }
    owned_commit_audio = [
        path
        for path in owned_commit_paths
        if Path(path).suffix.lower() in {".wav", ".aac", ".m4a", ".mp3", ".npz"}
    ]

    serialized = json.dumps(
        {"master": master, "responsive": responsive, "management": management, "transitions": transitions},
        sort_keys=True,
    ).upper()
    forbidden_claims = (
        "OWNER_APPROVED",
        "OWNER APPROVED",
        "SHIP_READY",
        "SHIP READY",
        "CLEARED_FOR_SHIP",
        "COMMERCIAL_MASTER",
        "PRODUCTION_STEM",
    )
    selected_candidate_ids = {row["selected_candidate_id"] for row in responsive["variants"]}
    eligible_candidate_ids = {
        row["candidate_id"] for row in register["candidates"] if row["analysis"]["automatic_pass"]
    }
    excluded_candidates = [
        {
            "candidate_id": row["candidate_id"],
            "epoch": row["epoch"],
            "context": row["context"],
            "failure_reasons": row["analysis"]["failure_reasons"],
        }
        for row in register["candidates"]
        if not row["analysis"]["automatic_pass"]
    ]
    eligible_contexts = {
        (row["epoch"], row["context"])
        for row in register["candidates"]
        if row["analysis"]["automatic_pass"]
    }
    checks = {
        "master_index_has_exactly_152_audio_assets": len(master["audio_assets"]) == 152,
        "all_indexed_audio_ids_unique": len(asset_ids) == len(set(asset_ids)),
        "all_indexed_audio_paths_unique": len(asset_paths) == len(set(asset_paths)),
        "all_indexed_audio_hashes_unique": len(asset_hashes) == len(set(asset_hashes)),
        "all_indexed_audio_hashes_match": all_asset_hashes_match,
        "all_indexed_audio_paths_contained": all_asset_paths_contained,
        "all_indexed_audio_regular_not_symlink": all_assets_regular_not_symlink,
        "all_indexed_audio_inodes_unique": len(asset_inodes) == len(set(asset_inodes)),
        "all_199_current_and_preserved_new_audio_files_explicitly_rehashed": len(all_audio_by_path) == 199,
        "all_current_and_preserved_new_audio_ids_unique": len(all_known_audio_ids) == len(set(all_known_audio_ids)),
        "all_current_and_preserved_new_audio_hashes_unique": len(all_known_audio_hashes) == len(set(all_known_audio_hashes)),
        "all_current_and_preserved_new_audio_hashes_match": all_known_audio_hashes_match,
        "all_current_and_preserved_new_audio_inodes_unique": len(all_known_audio_inodes) == len(set(all_known_audio_inodes)),
        "all_191_raw_music_and_12_motif_hashes_unchanged": (
            sum(row["asset_type"] == "MUSIC_SOURCE_CANDIDATE" for row in canonical["entries"]) == 191
            and sum(row["asset_type"] == "MOTIF_SHAPE_SKETCH" for row in canonical["entries"]) == 12
            and not raw_errors
        ),
        "responsive_exactly_36_candidates": len(register["candidates"]) == 36,
        "responsive_all_candidates_have_explicit_machine_and_human_dispositions": all(
            row.get("technical_disposition") in {"TECHNICAL_PASS", "TECHNICAL_EXCLUDED"}
            and row.get("machine_disposition") in {"MACHINE_ELIGIBLE", "MACHINE_EXCLUDED"}
            and row.get("human_disposition") == "PENDING"
            and row.get("rights_status") == "PROTOTYPE_ONLY"
            for row in register["candidates"]
        ),
        "responsive_all_36_raw_hashes_and_sidecar_logs_verified": responsive_candidate_evidence_complete,
        "responsive_three_anchor_hashes_eligibility_and_review_gates_verified": (
            len(anchor_authority["anchors"]) == 3
            and all(row["inherited_human_review_gate"] for row in anchor_authority["anchors"])
        ),
        "responsive_exactly_12_selected_context_variants": len(responsive["variants"]) == 12,
        "responsive_every_context_has_technical_eligible_candidate": len(eligible_contexts) == 12,
        "responsive_all_selected_candidates_technical_pass": selected_candidate_ids <= eligible_candidate_ids,
        "responsive_no_machine_excluded_candidate_selected": not selected_candidate_ids.intersection(
            row["candidate_id"] for row in register["candidates"] if not row["analysis"]["automatic_pass"]
        ),
        "responsive_is_text_only_no_guide_audio": register["text_only"] is True and register["guide_audio"] is False,
        "responsive_honestly_horizontal_not_stems": responsive["classification"] == "HORIZONTAL_VARIANT_BUNDLE" and responsive["fake_stems"] is False,
        "living_exactly_three_aligned_ten_minute_layers": len(living["layers"]) == 3 and all(abs(row["audio"]["probe"]["duration_seconds"] - 600.0) <= 0.025 for row in living["layers"]),
        "living_exactly_five_fixture_presentations": len(living["fixture_presentations"]) == 5,
        "living_exactly_three_era_presentations": len(living["era_presentations"]) == 3,
        "living_mix_diagnostics_make_no_era_proof": (
            living["era_presentations_are_mix_diagnostics"] is True
            and living["era_specific_living_lot_proof"] == "NOT_IMPLEMENTED"
            and all(
                row["era_proof_eligible"] is False
                and row["historical_disposition"] == "NOT_APPLICABLE_TO_MIX_DIAGNOSTIC"
                and row["commissioning_alias"] is None
                for row in living["era_presentations"]
            )
        ),
        "living_fixture_layer_bindings_exactly_5x3": len(living["fixture_layer_bindings"]) == 15,
        "living_layer_signals_not_duplicates": all(abs(value) < 0.10 for value in correlations.values()),
        "living_layer_spectral_profiles_measurably_different": all(value > 0.05 for value in spectral_distances.values()),
        "living_semantic_detail_schedule_exactly_w12_m25_c28": living["semantic_detail_counts"] == {"WIDE": 12, "MEDIUM": 25, "CLOSE": 28},
        "living_owner_listening_gate_not_overclaimed": living["music_off_coherent_world"] == "OWNER_LISTENING_GATE_PENDING",
        "management_exactly_15x3": len(management["vocabulary"]) == 15 and len(management["candidates"]) == 45,
        "management_pick_and_alternate_each_family": len(management["selections"]) == 15 and all(row["provisional_pick"] != row["alternate"] for row in management["selections"]),
        "management_machine_provisional_uses_bounded_technical_proxy": (
            management["machine_selection_scope"] == "TECHNICAL_RESTRAINT_PROXY_ONLY"
            and all(
                row["selection_disposition"]
                == "MACHINE_PROVISIONAL_TECHNICAL_PROXY_PENDING_HUMAN_LISTENING"
                for row in management["selections"]
            )
            and all("technical_restraint_proxy" in row for row in management["candidates"])
        ),
        "management_never_audio_only": management["critical_information_audio_only"] is False,
        "transitions_exactly_3x3": transitions["boundary_count"] == 3 and len(transitions["renders"]) == 9,
        "transitions_no_fake_stems": transitions["source_separation_or_fake_stems"] is False,
        "transitions_no_unproven_phrase_or_bespoke_claim": (
            transitions["phrase_boundary_claimed_for_rendered_files"] is False
            and transitions["bespoke_boundary_specific_edit_claimed"] is False
            and all(row["phrase_boundary_claimed"] is False and row["bespoke_claimed"] is False for row in transitions["renders"])
        ),
        "transitions_no_unproven_natural_ending_claim": (
            transitions["natural_ending_claimed_for_rendered_files"] is False
            and all(row["natural_ending_claimed"] is False for row in transitions["renders"])
        ),
        "transitions_all_nine_serialize_complete_editor_contract": all(
            {
                "transitionId", "outgoingCommissioningAlias", "incomingCommissioningAlias",
                "outgoingPrototypeId", "incomingPrototypeId", "constructionType", "exact_output",
                "offline_edit", "runtime_dsp_scheduling_offsets", "bpm_phrase_metadata",
                "loudness_measurements", "mono_compatibility", "source_and_derivative_lineage",
                "historicalStatus", "historical_disposition", "cultural_review", "machine_disposition",
                "human_disposition", "rights_status", "fallback_and_refusal",
            } <= set(row.get("metadata_contract", {}))
            and row["metadata_contract"]["mono_compatibility"]["status"] == "TECHNICAL_NON_SILENCE_PASS"
            and row["metadata_contract"]["historical_disposition"] == "PENDING_HUMAN_EDITORIAL_REVIEW"
            and row["metadata_contract"]["cultural_review"] == "REQUIRED_NOT_PERFORMED"
            for row in transitions["renders"]
        ),
        "transition_owner_facing_paths_use_only_honest_versioned_tokens": all(
            row["owner_facing_filename_uses_honest_treatment_token"] is True
            and row["treatment"] in Path(row["audio"]["path"]).name
            and Path(row["audio"]["path"]).name.endswith(("-v2.wav", "-v3.wav"))
            and "PHRASE-BOUNDARY-CROSSFADE" not in Path(row["audio"]["path"]).name
            and "BESPOKE-EXIT-ENTRY" not in Path(row["audio"]["path"]).name
            and "NATURAL-ENDING" not in Path(row["audio"]["path"]).name
            for row in transitions["renders"]
        ),
        "every_edited_or_mixed_derivative_names_hash_bound_sources": (
            derivative_register["relationship_count"] == 80
            and all(row["sources"] for row in derivative_register["relationships"])
        ),
        "small_sfx_exactly_15_technical_pass": len(lot_sfx["items"]) == 15 and all(row["analysis"]["automatic_pass"] for row in lot_sfx["items"]),
        "small_sfx_v2_gate_comprehensively_verified": sfx_gate["schema_version"] == 2 and sfx_gate["status"] == "PASSED",
        "no_forbidden_acceptance_or_shipping_claim": not any(term in serialized for term in forbidden_claims),
        "no_audio_or_model_weights_committed_by_pilot": not owned_commit_audio,
        "owned_commit_contains_only_four_authorized_scripts": set(filter(None, owned_commit_paths)) == expected_owned_paths,
    }
    if not all(checks.values()):
        failures = [key for key, passed in checks.items() if not passed]
        raise RuntimeError(f"audio asset validation failed without weakening checks: {failures}")
    validation = {
        "schema": "project-studio-audio-assets-validation/v4",
        "generated_at_utc": (
            existing_validation["generated_at_utc"] if existing_validation is not None else utc_now()
        ),
        "status": "PASS",
        "checks": checks,
        "counts": {
            "master_index_audio_assets": len(asset_ids),
            "all_current_and_preserved_new_audio_files": len(all_audio_by_path),
            "unique_current_and_preserved_new_audio_hashes": len(set(all_known_audio_hashes)),
            "canonical_raw_entries_rehashed": len(canonical["entries"]),
            "responsive_candidates": len(register["candidates"]),
            "responsive_technically_eligible_candidates": len(eligible_candidate_ids),
            "responsive_machine_excluded_candidates": len(excluded_candidates),
            "responsive_selected_variants": len(responsive["variants"]),
            "lot_sfx": len(lot_sfx["items"]),
            "living_layers": len(living["layers"]),
            "living_fixture_presentations": len(living["fixture_presentations"]),
            "living_era_presentations": len(living["era_presentations"]),
            "management_candidates": len(management["candidates"]),
            "transition_renders": len(transitions["renders"]),
            "derivative_source_relationships": derivative_register["relationship_count"],
        },
        "living_layer_mono_correlations": correlations,
        "living_layer_spectral_band_fractions_first_60s": spectral_profiles,
        "living_layer_spectral_profile_distances": spectral_distances,
        "responsive_machine_exclusions": excluded_candidates,
        "raw_hash_errors": raw_errors,
        "owned_scripts_commit": owned_commit,
        "master_index": file_record(MASTER_INDEX),
        "source_catalogue": file_record(CANONICAL_CATALOGUE),
        "responsive_anchor_authority": file_record(
            PILOT_ROOT / "02_music-bundles/responsive/responsive-anchor-authority.v2.json"
        ),
        "derivative_source_register": file_record(DERIVATIVE_REGISTER),
        "sfx_route_gate": file_record(SFX_GATE_PATH),
        "machine_proof_limit": "No validation check establishes listening acceptance, quality, comfort, historical correctness, copyrightability, exclusivity, non-infringement, or commercial clearance.",
    }
    if VALIDATION_V3_PATH.exists():
        validation["supersedes"] = {
            **file_record(VALIDATION_V3_PATH),
            "reason": "v4 adds per-candidate dispositions, shared policy, final-window honesty, and preserved-v3 hash coverage",
        }
    if existing_validation is not None and validation != existing_validation:
        raise RuntimeError(
            "fresh validation differs from immutable prior evidence; refusing overwrite: "
            f"{VALIDATION_PATH}"
        )
    write_manifest(VALIDATION_PATH, validation)
    return validation


def verify_all() -> dict[str, Any]:
    living_v2 = build_living_lot()
    if not LIVING_CATALOGUE.is_file():
        raise RuntimeError("immutable v3 living diagnostic manifest is required")
    living_current = json.loads(LIVING_CATALOGUE.read_text(encoding="utf-8"))
    result = {
        "lot_sfx": generate_lot_sfx(),
        "living_lot": living_current,
        "management": build_management_pack(),
        "transitions": build_transitions(),
    }
    verify_anchor_authorities()
    derivative_register = build_derivative_source_register()
    master = build_master_index(
        result["lot_sfx"], result["living_lot"], result["management"], result["transitions"]
    )
    validation = validate_evidence()
    return {
        "status": "PASSED",
        "lot_sfx_count": len(result["lot_sfx"]["items"]),
        "living_layer_count": len(result["living_lot"]["layers"]),
        "living_fixture_count": len(result["living_lot"]["fixture_presentations"]),
        "living_era_presentation_count": len(result["living_lot"]["era_presentations"]),
        "management_candidate_count": len(result["management"]["candidates"]),
        "transition_render_count": len(result["transitions"]["renders"]),
        "derivative_source_relationship_count": derivative_register["relationship_count"],
        "master_index_audio_asset_count": master["audio_asset_count"],
        "validation_status": validation["status"],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "target",
        nargs="?",
        default="all",
        choices=("all", "lot-sfx", "living-lot", "management", "transitions", "index", "validation", "verify"),
    )
    args = parser.parse_args()
    if args.target == "lot-sfx":
        payload = {"status": "PASSED", "item_count": len(generate_lot_sfx()["items"])}
    elif args.target == "living-lot":
        data = build_living_lot()
        payload = {"status": "PASSED", "layers": len(data["layers"]), "presentations": len(data["all_audio_files"]) - len(data["layers"])}
    elif args.target == "management":
        payload = {"status": "PASSED", "candidate_count": len(build_management_pack()["candidates"])}
    elif args.target == "transitions":
        payload = {"status": "PASSED", "render_count": len(build_transitions()["renders"])}
    elif args.target == "index":
        verify_anchor_authorities()
        build_derivative_source_register()
        payload = {"status": "PASSED", "audio_asset_count": build_master_index()["audio_asset_count"]}
    elif args.target == "validation":
        data = validate_evidence()
        payload = {"status": data["status"], **data["counts"]}
    else:
        payload = verify_all()
    print(json.dumps(payload, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
