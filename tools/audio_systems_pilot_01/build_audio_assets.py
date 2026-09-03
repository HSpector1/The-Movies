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
from common import PILOT_ROOT, TOOLING_ROOT, probe_audio, sha256_file, utc_now
from sfx_route import (
    CODE_COMMIT,
    OPTIMIZED_REVISION,
    SFX_CANONICAL_REVISION,
    SFX_WEIGHT_SHA256,
    TOOLCHAIN,
)


PYTHON = TOOLING_ROOT / ".phase2-venv-py312/bin/python"
GENERATOR = TOOLCHAIN / "optimized/mlx/scripts/sa3_mlx.py"
SAMPLE_RATE = 48_000
TEN_MINUTES = 600.0
SFX_ROOT = PILOT_ROOT / "05_management-sfx/generated-lot-detail"
MANAGEMENT_ROOT = PILOT_ROOT / "05_management-sfx/semantic-pack"
LIVING_ROOT = PILOT_ROOT / "04_living-lot"
TRANSITION_ROOT = PILOT_ROOT / "03_transitions"
LOG_ROOT = PILOT_ROOT / "12_logs/audio-asset-build"
MASTER_INDEX = PILOT_ROOT / "10_provenance/audio-assets-index.v1.json"
RESPONSIVE_CATALOGUE = PILOT_ROOT / "02_music-bundles/responsive/responsive-bundle-catalogue.json"


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


def build_living_lot() -> dict[str, Any]:
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


def build_management_pack() -> dict[str, Any]:
    manifest_path = MANAGEMENT_ROOT / "management-semantic-catalogue.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        if len(manifest.get("candidates", [])) != 45:
            raise RuntimeError("existing management catalogue has wrong candidate count")
        for item in manifest["candidates"]:
            require_file(Path(item["audio"]["path"]), item["audio"]["sha256"])
        return manifest

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
            semantic_rows.append(row)
            candidates.append(row)
        ranked = sorted(
            semantic_rows,
            key=lambda row: (
                abs(row["analysis"]["signal"]["peak_dbfs"] + 7.5),
                row["analysis"]["format"]["duration_seconds"],
                row["stable_prototype_id"],
            ),
        )
        selections.append(
            {
                "semantic_event": semantic["id"],
                "provisional_pick": ranked[0]["stable_prototype_id"],
                "alternate": ranked[1]["stable_prototype_id"],
                "selection_disposition": "MACHINE_PROVISIONAL_PENDING_HUMAN_LISTENING",
                "selection_basis": "deterministic restraint proxy: moderate peak then shortest duration",
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
        "schema": "project-studio-management-audio-language/v1",
        "generated_at_utc": utc_now(),
        "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "semantic_family_count": len(SEMANTICS),
        "candidate_count": len(candidates),
        "candidates_per_family": 3,
        "vocabulary": vocabulary,
        "candidates": candidates,
        "selections": selections,
        "critical_information_audio_only": False,
        "rights_status": "PROTOTYPE_ONLY",
        "limitations": ["Machine restraint proxies do not establish comfort, clarity, meaning, or listening acceptance."],
    }
    write_manifest(manifest_path, manifest)
    return manifest


def build_transitions() -> dict[str, Any]:
    manifest_path = TRANSITION_ROOT / "rendered-transition-catalogue.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        if len(manifest.get("renders", [])) != 9:
            raise RuntimeError("existing transition catalogue has wrong render count")
        for row in manifest["renders"]:
            require_file(Path(row["audio"]["path"]), row["audio"]["sha256"])
        return manifest
    wide = LIVING_ROOT / "layers/ASP01-LIVING-WIDE-600s.wav"
    require_file(wide)
    renders: list[dict[str, Any]] = []
    for boundary in TRANSITIONS:
        outgoing = require_file(Path(boundary["out_path"]), boundary["out_sha256"])
        incoming = require_file(Path(boundary["in_path"]), boundary["in_sha256"])
        output_dir = TRANSITION_ROOT / boundary["id"]
        specs: tuple[tuple[str, list[Any], str, str], ...] = (
            (
                "NATURAL-ENDING-AMBIENCE-BRIDGE",
                [
                    "-i", outgoing, "-i", wide, "-i", incoming,
                    "-filter_complex",
                    "[0:a]atrim=start=108:end=120,asetpts=PTS-STARTPTS,afade=t=out:st=8:d=4[o];"
                    "[1:a]atrim=start=0:end=6,asetpts=PTS-STARTPTS,volume=0.42,afade=t=in:st=0:d=1,afade=t=out:st=5:d=1[a];"
                    "[2:a]atrim=start=0:end=12,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=4[i];"
                    "[o][a][i]concat=n=3:v=0:a=1[out]",
                    "-map", "[out]", "-map_metadata", "-1", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", "-f", "wav",
                ],
                "NATURAL_ENDING_WITH_SIX_SECOND_AMBIENCE_BRIDGE",
                "No phrase or phase alignment claimed",
            ),
            (
                "PHRASE-BOUNDARY-CROSSFADE",
                [
                    "-i", outgoing, "-i", incoming,
                    "-filter_complex",
                    "[0:a]atrim=start=88:end=108,asetpts=PTS-STARTPTS[o];"
                    "[1:a]atrim=start=0:end=20,asetpts=PTS-STARTPTS[i];"
                    "[o][i]acrossfade=d=8:c1=qsin:c2=qsin[out]",
                    "-map", "[out]", "-map_metadata", "-1", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", "-f", "wav",
                ],
                "ESTIMATED_PHRASE_WINDOW_CROSSFADE",
                "Audition estimate only; BPM metadata does not prove downbeat/bar/phrase",
            ),
            (
                "BESPOKE-EXIT-ENTRY",
                [
                    "-i", outgoing, "-i", wide, "-i", incoming,
                    "-filter_complex",
                    "[0:a]atrim=start=110:end=120,asetpts=PTS-STARTPTS,lowpass=f=4200,afade=t=out:st=6:d=4[o];"
                    "[1:a]atrim=start=36:end=38,asetpts=PTS-STARTPTS,volume=0.32,highpass=f=90,lowpass=f=3600[a];"
                    "[2:a]atrim=start=0:end=10,asetpts=PTS-STARTPTS,highpass=f=55,afade=t=in:st=0:d=4[i];"
                    "[o][a][i]concat=n=3:v=0:a=1[out]",
                    "-map", "[out]", "-map_metadata", "-1", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", "-f", "wav",
                ],
                "BESPOKE_SHORT_EXIT_AMBIENCE_ENTRY_TREATMENT",
                "Derived full-mix treatment; not a stem or authored shared session",
            ),
        )
        for treatment_id, args, classification, honesty in specs:
            path = output_dir / f"ASP01-TRANSITION-{boundary['id']}-{treatment_id}.wav"
            audio = ffmpeg_atomic(args, path)
            screen = technical_screen(path, expected_channels=2, music=False)
            if not screen["automatic_pass"]:
                raise RuntimeError(f"transition render screen failed: {path}: {screen['failure_reasons']}")
            renders.append(
                {
                    "stable_prototype_id": f"ASP01-TRANSITION-{boundary['id']}-{treatment_id}",
                    "boundary_id": boundary["id"],
                    "outgoing_alias": boundary["out_alias"],
                    "incoming_alias": boundary["in_alias"],
                    "outgoing_source": {"candidate_id": boundary["out_id"], "path": str(outgoing), "sha256": boundary["out_sha256"]},
                    "incoming_source": {"candidate_id": boundary["in_id"], "path": str(incoming), "sha256": boundary["in_sha256"]},
                    "treatment": treatment_id,
                    "classification": classification,
                    "honesty": honesty,
                    "audio": audio,
                    "analysis": screen,
                    "human_disposition": "PENDING",
                    "rights_status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
                }
            )
    if len(renders) != 9 or len({row["audio"]["sha256"] for row in renders}) != 9:
        raise RuntimeError("transition cardinality/unique hash proof failed")
    manifest = {
        "schema": "project-studio-rendered-era-transitions/v1",
        "generated_at_utc": utc_now(),
        "boundary_count": 3,
        "treatments_per_boundary": 3,
        "render_count": 9,
        "renders": renders,
        "source_separation_or_fake_stems": False,
        "human_acceptance": "NONE_RECORDED",
        "rights_status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
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
                "asset_ids": asset_ids,
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
            f"ASP01-LIVING-FIXTURE-{item['fixture']}",
            item["audio"],
            category="LIVING_LOT_FIXTURE_PRESENTATION",
            rights_status="PROTOTYPE_ONLY",
            context={"fixture": item["fixture"]},
        )
    for item in living["era_presentations"]:
        add_asset(
            f"ASP01-LIVING-{item['presentation']}",
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
        SFX_ROOT / "lot-detail-sfx-catalogue.json",
        LIVING_ROOT / "living-lot-soundscape-catalogue.json",
        MANAGEMENT_ROOT / "management-semantic-catalogue.json",
        TRANSITION_ROOT / "rendered-transition-catalogue.json",
    ]
    index = {
        "schema": "project-studio-audio-assets-index/v1",
        "generated_at_utc": utc_now(),
        "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "approved_root": str(PILOT_ROOT),
        "loading_law": "EXPLICIT_RELATIVE_PATH_ONLY; SHA256_REQUIRED; NO_RECURSIVE_SCAN; NO_NETWORK",
        "source_manifests": [file_record(path) for path in source_manifests],
        "audio_asset_count": len(assets),
        "audio_assets": assets,
        "responsive_selections": responsive_selections,
        "living_fixture_layer_bindings": living["fixture_layer_bindings"],
        "management_selections": management["selections"],
        "rights_status": "PROTOTYPE_ONLY_OR_PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "human_acceptance": "NONE_RECORDED",
        "commercial_clearance": "NOT_CLAIMED",
    }
    write_manifest(MASTER_INDEX, index)
    return index


def verify_all() -> dict[str, Any]:
    result = {
        "lot_sfx": generate_lot_sfx(),
        "living_lot": build_living_lot(),
        "management": build_management_pack(),
        "transitions": build_transitions(),
    }
    master = build_master_index(
        result["lot_sfx"], result["living_lot"], result["management"], result["transitions"]
    )
    return {
        "status": "PASSED",
        "lot_sfx_count": len(result["lot_sfx"]["items"]),
        "living_layer_count": len(result["living_lot"]["layers"]),
        "living_fixture_count": len(result["living_lot"]["fixture_presentations"]),
        "living_era_presentation_count": len(result["living_lot"]["era_presentations"]),
        "management_candidate_count": len(result["management"]["candidates"]),
        "transition_render_count": len(result["transitions"]["renders"]),
        "master_index_audio_asset_count": master["audio_asset_count"],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "target",
        nargs="?",
        default="all",
        choices=("all", "lot-sfx", "living-lot", "management", "transitions", "index", "verify"),
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
        payload = {"status": "PASSED", "audio_asset_count": build_master_index()["audio_asset_count"]}
    else:
        payload = verify_all()
    print(json.dumps(payload, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
