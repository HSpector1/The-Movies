#!/usr/bin/env python3
"""Deterministic + local CLAP analysis jury for Project: Studio candidates.

All semantic outputs are ANALYSIS SIGNAL ONLY.  They are deliberately expressed
as relative proxies and never as human listening, rights clearance, or truth.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import math
import os
import re
import subprocess
import sys
import time
from collections import defaultdict
from pathlib import Path
from typing import Any, Iterable

import librosa
import numpy as np
import soundfile as sf

from foundry_common import MARATHON_ROOT, PILOT_ROOT, atomic_write_json, atomic_write_text, sha256_file, utc_now


MODEL_ID = "laion/clap-htsat-unfused"
MODEL_REVISION = "8fa0f1c6d0433df6e97c127f64b2a1d6c0dcda8a"
MODEL_LICENSE = "Apache-2.0"
MODEL_DIR = MARATHON_ROOT / "03_analysis" / "models" / "laion-clap-htsat-unfused"
CACHE_DIR = MARATHON_ROOT / "03_analysis" / "cache" / "machine-jury-v1"
DEFAULT_INVENTORY = MARATHON_ROOT / "01_catalogue" / "existing-24-read-only-inventory.csv"
DEFAULT_PROMPTS = PILOT_ROOT / "01_prompt-register" / "prompts.csv"
DEFAULT_OUTPUT = MARATHON_ROOT / "03_analysis" / "existing-22-machine-jury.csv"
DEFAULT_V2 = PILOT_ROOT / "03_screening" / "gate-v2" / "metrics-objective.csv"
DEFAULT_V1 = PILOT_ROOT / "03_screening" / "metrics-automatic.csv"

ANALYSIS_VERSION = "audio-foundry-machine-jury-v1"
WINDOW_STARTS_SECONDS = (5.0, 25.0, 45.0, 65.0, 85.0, 105.0)
WINDOW_SECONDS = 10.0

ERA_DESCRIPTIONS = {
    "acoustic_electrical_1920_1932": "1920s to early 1930s acoustic and early electrical small ensemble, silent photoplay chamber music, dance jazz, piano, strings, clarinet, brass, upright bass, restrained percussion",
    "network_sound_1933_1945": "1930s to mid 1940s network radio era studio orchestra, swing rhythm section, chamber dramatic underscore, newsreel modernism, restrained brass and woodwind writing",
    "tape_hifi_1946_1959": "late 1940s and 1950s postwar high fidelity studio music, cool jazz chamber ensemble, light orchestral modernism, tape-era clarity and personality",
    "multitrack_fm_1960_1974": "1960s to early 1970s multitrack and FM era instrumental studio music, jazz pop rhythm section, chamber colors, early electronics, spacious restrained production",
    "format_plurality_1975_1986": "late 1970s to mid 1980s format plurality, polished acoustic and electric ensemble, restrained funk pulse, synth texture, sophisticated studio orchestration",
    "sampled_digital_1987_1999": "late 1980s and 1990s sampled digital production, workstation textures, restrained breakbeat or electronic pulse, clean electric bass, hybrid acoustic digital palette",
    "networked_hybrid_2000_2014": "2000s to early 2010s networked hybrid production, organic electronics, chamber ensemble, edited rhythm, warm digital acoustic blend",
    "streaming_plural_2015_2029": "late 2010s and 2020s streaming era plural instrumental music, intimate chamber electronics, restrained beat craft, detailed spatial production",
    "legacy_future_2030_2040": "plausible 2030s legacy future studio music, humane orchestral electronic hybrid, transparent adaptive layers, restrained speculative timbre",
}

SEMANTIC_LABELS = {
    "instrumental": "instrumental music with no voice",
    "singing": "singing vocals, lyrics, choir, or humming",
    "speech": "spoken voice, dialogue, narration, or announcer speech",
    "background": "restrained unobtrusive background underscore for a calm management game work session",
    "foreground": "prominent foreground melody, dramatic action cue, trailer climax, or attention grabbing music",
    "respectful_period": "historically informed ensemble music performed without parody or caricature",
    "parody": "comic historical pastiche, exaggerated period parody, novelty caricature, or cartoon music",
    "melodic": "dominant memorable lead melody in the foreground",
    "textural": "supporting texture and ensemble conversation without a dominant lead melody",
    "piano": "acoustic piano or keyboard",
    "strings": "violin viola cello strings or chamber string ensemble",
    "woodwinds": "clarinet flute saxophone or woodwind ensemble",
    "brass": "trumpet cornet trombone horn or brass ensemble",
    "guitar": "acoustic or electric guitar, banjo, or plucked string instrument",
    "bass": "upright bass or electric bass",
    "drums": "drum kit, brushed drums, percussion, or rhythmic beat",
    "synth": "electronic synthesizer, sampler, or digital texture",
    "orchestra": "orchestral ensemble or cinematic chamber orchestra",
    "jazz": "jazz small ensemble or swing rhythm section",
}


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def csv_text(rows: list[dict[str, Any]], fieldnames: list[str]) -> str:
    buffer = io.StringIO(newline="")
    writer = csv.DictWriter(buffer, fieldnames=fieldnames, lineterminator="\n", extrasaction="ignore")
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()


def as_float(value: Any, fallback: float = math.nan) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return fallback


def clipped(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return float(np.clip(value, low, high))


def sigmoid(value: float) -> float:
    return 1.0 / (1.0 + math.exp(-float(np.clip(value, -40.0, 40.0))))


def softmax(values: Iterable[float], temperature: float = 12.0) -> np.ndarray:
    array = np.asarray(list(values), dtype=np.float64) * temperature
    array -= np.max(array)
    exp = np.exp(array)
    return exp / max(float(np.sum(exp)), 1e-12)


def robust_norm(value: float, center: float, width: float, invert: bool = False) -> float:
    score = sigmoid((value - center) / max(width, 1e-9))
    return 1.0 - score if invert else score


def text_fields(row: dict[str, str]) -> tuple[str, str, str, str]:
    prompt_id = row.get("prompt_id") or row.get("family_id") or row.get("promptId") or ""
    family = row.get("family") or row.get("prompt_family") or row.get("family_name") or ""
    positive = row.get("positive_prompt") or row.get("prompt") or row.get("positivePrompt") or ""
    negative = row.get("negative_prompt") or row.get("negativePrompt") or ""
    return prompt_id, family, positive, negative


class ClapJury:
    def __init__(self, model_dir: Path) -> None:
        os.environ.setdefault("HF_HUB_OFFLINE", "1")
        os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")
        os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
        import torch
        from transformers import ClapModel, ClapProcessor

        self.torch = torch
        self.processor = ClapProcessor.from_pretrained(model_dir, local_files_only=True)
        self.model = ClapModel.from_pretrained(model_dir, local_files_only=True).eval()
        self.text_cache: dict[str, np.ndarray] = {}

    def text_embeddings(self, texts: list[str]) -> np.ndarray:
        missing = [text for text in texts if text not in self.text_cache]
        if missing:
            batch_size = 48
            for offset in range(0, len(missing), batch_size):
                batch = missing[offset : offset + batch_size]
                inputs = self.processor(text=batch, return_tensors="pt", padding=True, truncation=True)
                with self.torch.inference_mode():
                    output = self.model.get_text_features(**inputs).pooler_output
                vectors = output.detach().cpu().numpy().astype(np.float32)
                for text, vector in zip(batch, vectors, strict=True):
                    self.text_cache[text] = vector
        return np.stack([self.text_cache[text] for text in texts])

    def audio_embedding(self, path: Path, source_hash: str) -> np.ndarray:
        cache_path = CACHE_DIR / f"{source_hash}__clap-windows.npz"
        if cache_path.exists():
            with np.load(cache_path) as cached:
                if cached["analysis_version"].item() == ANALYSIS_VERSION:
                    return cached["embedding"].astype(np.float32)

        windows: list[np.ndarray] = []
        for start in WINDOW_STARTS_SECONDS:
            audio, _ = librosa.load(path, sr=48_000, mono=True, offset=start, duration=WINDOW_SECONDS)
            target = int(48_000 * WINDOW_SECONDS)
            if len(audio) < target:
                audio = np.pad(audio, (0, target - len(audio)))
            windows.append(audio[:target].astype(np.float32, copy=False))
        inputs = self.processor(audio=windows, sampling_rate=48_000, return_tensors="pt", padding=True)
        with self.torch.inference_mode():
            output = self.model.get_audio_features(**inputs).pooler_output
        vectors = output.detach().cpu().numpy().astype(np.float32)
        embedding = np.mean(vectors, axis=0)
        embedding /= max(float(np.linalg.norm(embedding)), 1e-12)
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        temp_path = cache_path.with_suffix(".tmp.npz")
        np.savez_compressed(temp_path, analysis_version=np.array(ANALYSIS_VERSION), embedding=embedding)
        os.replace(temp_path, cache_path)
        return embedding

    def similarities(self, audio_embedding: np.ndarray, texts: list[str]) -> np.ndarray:
        text_embeddings = self.text_embeddings(texts)
        return text_embeddings @ audio_embedding


def deterministic_features(path: Path, source_hash: str) -> dict[str, float]:
    cache_path = CACHE_DIR / f"{source_hash}__deterministic.json"
    if cache_path.exists():
        cached = json.loads(cache_path.read_text(encoding="utf-8"))
        if cached.get("analysis_version") == ANALYSIS_VERSION:
            return {key: float(value) for key, value in cached["features"].items()}

    audio, sample_rate = librosa.load(path, sr=22_050, mono=True)
    duration = len(audio) / sample_rate
    hop = 512
    frame = 2048
    rms = librosa.feature.rms(y=audio, frame_length=frame, hop_length=hop)[0]
    rms_db = librosa.amplitude_to_db(np.maximum(rms, 1e-10), ref=1.0)
    centroid = librosa.feature.spectral_centroid(y=audio, sr=sample_rate, n_fft=frame, hop_length=hop)[0]
    bandwidth = librosa.feature.spectral_bandwidth(y=audio, sr=sample_rate, n_fft=frame, hop_length=hop)[0]
    flatness = librosa.feature.spectral_flatness(y=audio, n_fft=frame, hop_length=hop)[0]
    rolloff = librosa.feature.spectral_rolloff(y=audio, sr=sample_rate, n_fft=frame, hop_length=hop, roll_percent=0.85)[0]
    zcr = librosa.feature.zero_crossing_rate(audio, frame_length=frame, hop_length=hop)[0]
    onset = librosa.onset.onset_strength(y=audio, sr=sample_rate, hop_length=hop)
    onset_frames = librosa.onset.onset_detect(onset_envelope=onset, sr=sample_rate, hop_length=hop, backtrack=False)
    tempo_value, beats = librosa.beat.beat_track(onset_envelope=onset, sr=sample_rate, hop_length=hop)
    tempo = float(np.asarray(tempo_value).reshape(-1)[0]) if np.size(tempo_value) else 0.0
    beat_times = librosa.frames_to_time(beats, sr=sample_rate, hop_length=hop)
    intervals = np.diff(beat_times)
    tempo_stability = 0.0
    if len(intervals) >= 3 and float(np.mean(intervals)) > 0:
        tempo_stability = clipped(1.0 - float(np.std(intervals) / np.mean(intervals)))

    chroma = librosa.feature.chroma_cqt(y=audio, sr=sample_rate, hop_length=hop)
    block_frames = max(1, int(round(8.0 * sample_rate / hop)))
    block_vectors = []
    for offset in range(0, chroma.shape[1], block_frames):
        block = chroma[:, offset : offset + block_frames]
        if block.shape[1] >= block_frames // 2:
            vector = np.mean(block, axis=1)
            vector /= max(float(np.linalg.norm(vector)), 1e-12)
            block_vectors.append(vector)
    block_array = np.stack(block_vectors) if block_vectors else np.zeros((1, 12), dtype=np.float32)
    changes = np.linalg.norm(np.diff(block_array, axis=0), axis=1) if len(block_array) > 1 else np.array([])
    threshold = float(np.median(changes) + 1.25 * np.median(np.abs(changes - np.median(changes)))) if len(changes) else math.inf
    section_count = 1 + int(np.sum(changes > threshold)) if len(changes) else 1
    repetition = 0.0
    if len(block_array) >= 4:
        similarity = block_array @ block_array.T
        mask = np.triu(np.ones_like(similarity, dtype=bool), k=2)
        repetition = clipped(float(np.percentile(similarity[mask], 90))) if np.any(mask) else 0.0

    rms_delta = np.abs(np.diff(rms_db, prepend=rms_db[0]))
    centroid_delta = np.abs(np.diff(centroid, prepend=centroid[0]))
    static_frames = (rms_delta < 0.10) & (centroid_delta < 8.0)
    static_fraction = float(np.mean(static_frames))
    longest = 0
    current = 0
    for flag in static_frames:
        current = current + 1 if flag else 0
        longest = max(longest, current)
    long_static_seconds = longest * hop / sample_rate

    peak = float(np.max(np.abs(audio)))
    rms_all = float(np.sqrt(np.mean(np.square(audio, dtype=np.float64))))
    crest = 20.0 * math.log10(max(peak, 1e-12) / max(rms_all, 1e-12))
    dynamic_range = float(np.percentile(rms_db, 95) - np.percentile(rms_db, 10))
    melodic_prominence = clipped(
        0.55 * robust_norm(float(np.mean(chroma.max(axis=0))), 0.65, 0.12)
        + 0.45 * robust_norm(float(np.mean(chroma.max(axis=0) - np.mean(chroma, axis=0))), 0.45, 0.10)
    )

    # Seam proxy compares the last and first 100 ms, plus their local RMS.
    seam_frames = max(1, int(sample_rate * 0.10))
    first = audio[:seam_frames]
    last = audio[-seam_frames:]
    seam_rms = float(np.sqrt(np.mean(np.square(first - last, dtype=np.float64))))
    body_rms = max(rms_all, 1e-12)
    seam_ratio_db = 20.0 * math.log10(max(seam_rms, 1e-12) / body_rms)
    boundary_jump = float(abs(float(audio[0]) - float(audio[-1])))
    seam_quality = clipped(1.0 - robust_norm(seam_ratio_db, 2.0, 3.0))

    features = {
        "duration_seconds": duration,
        "sample_rate_analysis": float(sample_rate),
        "likely_bpm": tempo,
        "tempo_stability_signal": tempo_stability,
        "onset_density_per_second": len(onset_frames) / max(duration, 1e-9),
        "section_count": float(section_count),
        "spectral_centroid_hz": float(np.mean(centroid)),
        "spectral_bandwidth_hz": float(np.mean(bandwidth)),
        "spectral_rolloff_hz": float(np.mean(rolloff)),
        "spectral_flatness": float(np.mean(flatness)),
        "zero_crossing_rate": float(np.mean(zcr)),
        "spectral_density_signal": clipped(0.5 * robust_norm(float(np.mean(centroid)), 1700.0, 700.0) + 0.5 * robust_norm(float(np.mean(flatness)), 0.025, 0.02)),
        "dynamic_range_db": dynamic_range,
        "crest_factor_db_deterministic": crest,
        "repetition_signal": repetition,
        "long_static_region_seconds": long_static_seconds,
        "static_fraction": static_fraction,
        "melodic_prominence_deterministic": melodic_prominence,
        "loop_boundary_jump": boundary_jump,
        "loop_seam_ratio_db_deterministic": seam_ratio_db,
        "loop_seam_quality_deterministic": seam_quality,
    }
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    atomic_write_json(cache_path, {"analysis_version": ANALYSIS_VERSION, "features": features})
    return features


def protected_reference_scan(positive: str, negative: str) -> tuple[float, str]:
    # This only checks the commissioning text. It has no reference-audio database.
    forbidden = re.compile(r"\b(?:in the style of|soundtrack|score from|theme from|song titled|artist named)\b", re.I)
    warning = 1.0 if forbidden.search(positive) else 0.0
    return warning, "PROMPT_LEXICAL_CHECK_ONLY; NO COPYRIGHT OR REFERENCE-AUDIO DETECTOR"


def load_metric_maps(paths: list[Path]) -> dict[str, dict[str, str]]:
    output: dict[str, dict[str, str]] = defaultdict(dict)
    for path in paths:
        if not path.exists():
            continue
        for row in read_csv(path):
            output[row["candidate_id"]].update(row)
    return output


def model_manifest() -> dict[str, Any]:
    files = []
    for path in sorted(MODEL_DIR.rglob("*")):
        if path.is_file() and "/.cache/" not in str(path):
            files.append({"relative_path": str(path.relative_to(MODEL_DIR)), "bytes": path.stat().st_size, "sha256": sha256_file(path)})
    return {
        "model_id": MODEL_ID,
        "revision": MODEL_REVISION,
        "license": MODEL_LICENSE,
        "execution": "LOCAL_ONLY; HF_HUB_OFFLINE=1; NO CLOUD UPLOAD",
        "classification": "ANALYSIS SIGNAL ONLY",
        "files": files,
    }


def analyze(args: argparse.Namespace) -> None:
    started = time.time()
    inventory = read_csv(args.inventory)
    eligible = [row for row in inventory if row.get("screening_status", "MACHINE_ELIGIBLE") != "MACHINE_REJECTED"]
    if args.expected_count is not None and len(eligible) != args.expected_count:
        raise SystemExit(f"expected {args.expected_count} eligible candidates, found {len(eligible)}")

    prompt_rows = read_csv(args.prompts)
    prompts: dict[str, dict[str, str]] = {}
    for row in prompt_rows:
        prompt_id, family, positive, negative = text_fields(row)
        if prompt_id:
            prompts[prompt_id] = {"family": family, "positive_prompt": positive, "negative_prompt": negative}
    missing_prompts = sorted({row["prompt_id"] for row in eligible} - prompts.keys())
    if missing_prompts:
        raise SystemExit(f"missing prompts: {missing_prompts}")

    metric_maps = load_metric_maps(args.screening_csv)
    clap = ClapJury(args.model_dir)
    label_names = list(SEMANTIC_LABELS)
    label_texts = [SEMANTIC_LABELS[name] for name in label_names]
    era_names = list(ERA_DESCRIPTIONS)
    era_texts = [ERA_DESCRIPTIONS[name] for name in era_names]
    family_texts_by_epoch: dict[str, list[tuple[str, str]]] = defaultdict(list)
    for prompt_id, prompt in prompts.items():
        epoch = next((row.get("epoch", "") for row in prompt_rows if text_fields(row)[0] == prompt_id), "")
        family_texts_by_epoch[epoch].append((prompt_id, f"instrumental {prompt['family']} for restrained studio management background music"))

    rows: list[dict[str, Any]] = []
    for index, item in enumerate(eligible, start=1):
        path = Path(item["absolute_path"])
        actual_hash = sha256_file(path)
        expected_hash = item.get("sha256") or item.get("raw_sha256") or item.get("source_sha256")
        if expected_hash and actual_hash != expected_hash:
            raise SystemExit(f"source hash mismatch before jury: {item['candidate_id']}")
        prompt = prompts[item["prompt_id"]]
        det = deterministic_features(path, actual_hash)
        audio_embedding = clap.audio_embedding(path, actual_hash)
        label_sims = dict(zip(label_names, clap.similarities(audio_embedding, label_texts), strict=True))
        era_sims_array = clap.similarities(audio_embedding, era_texts)
        era_probs = softmax(era_sims_array, temperature=18.0)
        epoch = item["epoch"]
        era_index = era_names.index(epoch)
        period_signal = float(era_probs[era_index])

        family_pairs = sorted(family_texts_by_epoch[epoch])
        family_sims = clap.similarities(audio_embedding, [text for _, text in family_pairs])
        family_probs = softmax(family_sims, temperature=18.0)
        family_ids = [family_id for family_id, _ in family_pairs]
        family_signal = float(family_probs[family_ids.index(item["prompt_id"])])
        prompt_text = f"instrumental {prompt['family']} for a restrained Hollywood studio management workday"
        contrast_texts = [
            prompt_text,
            "generic corporate stock music",
            "dramatic foreground trailer score",
            "spoken word or vocal song",
            "sound effects and ambience without music",
        ]
        prompt_alignment = float(softmax(clap.similarities(audio_embedding, contrast_texts), temperature=18.0)[0])

        vocal_signal = sigmoid(12.0 * (float(label_sims["singing"]) - float(label_sims["instrumental"])))
        speech_signal = sigmoid(12.0 * (float(label_sims["speech"]) - float(label_sims["instrumental"])))
        background_signal = sigmoid(12.0 * (float(label_sims["background"]) - float(label_sims["foreground"])))
        parody_signal = sigmoid(12.0 * (float(label_sims["parody"]) - float(label_sims["respectful_period"])))
        melodic_clap = sigmoid(12.0 * (float(label_sims["melodic"]) - float(label_sims["textural"])))
        melodic_signal = clipped(0.55 * melodic_clap + 0.45 * det["melodic_prominence_deterministic"])
        instrument_scores = sorted(
            ((name, float(label_sims[name])) for name in ("piano", "strings", "woodwinds", "brass", "guitar", "bass", "drums", "synth", "orchestra", "jazz")),
            key=lambda pair: (-pair[1], pair[0]),
        )
        instrument_estimates = ";".join(f"{name}:{score:.4f}" for name, score in instrument_scores[:4])

        old = metric_maps.get(item["candidate_id"], {})
        loudness = as_float(old.get("raw_lufs_i"))
        lra = as_float(old.get("raw_lra"))
        true_peak = as_float(old.get("raw_true_peak_dbtp"))
        crest = as_float(old.get("crest_factor_db"), det["crest_factor_db_deterministic"])
        seam_ratio = as_float(old.get("loop_seam_ratio_db"), det["loop_seam_ratio_db_deterministic"])
        seam_quality = det["loop_seam_quality_deterministic"]
        density_fit = 1.0 - abs(det["spectral_density_signal"] - 0.46) / 0.54
        density_fit = clipped(density_fit)
        form_fit = clipped(1.0 - abs(det["section_count"] - 3.0) / 5.0)
        dynamic_fit = clipped(1.0 - abs(det["dynamic_range_db"] - 17.0) / 17.0)
        management = clipped(
            0.30 * background_signal
            + 0.14 * (1.0 - melodic_signal)
            + 0.13 * (1.0 - vocal_signal)
            + 0.06 * (1.0 - speech_signal)
            + 0.10 * density_fit
            + 0.09 * det["tempo_stability_signal"]
            + 0.08 * form_fit
            + 0.05 * seam_quality
            + 0.05 * dynamic_fit
        )
        semantic = clipped(0.45 * prompt_alignment + 0.30 * family_signal + 0.25 * period_signal)
        technical = clipped(
            0.22 * density_fit
            + 0.18 * dynamic_fit
            + 0.18 * det["tempo_stability_signal"]
            + 0.16 * form_fit
            + 0.14 * seam_quality
            + 0.12 * (1.0 - det["static_fraction"])
        )
        warning, warning_limit = protected_reference_scan(prompt["positive_prompt"], prompt["negative_prompt"])
        mismatch_reasons = []
        if vocal_signal >= 0.78:
            mismatch_reasons.append("HIGH_VOCAL_SIGNAL")
        if speech_signal >= 0.78:
            mismatch_reasons.append("HIGH_SPEECH_SIGNAL")
        # CLAP systematically favors the shorter generic foreground label over
        # the deliberately specific management-background sentence.  Treat it
        # as severe only at the empirical floor and only when the independent
        # prompt-alignment lane corroborates the mismatch.
        if background_signal <= 0.008 and prompt_alignment <= 0.08:
            mismatch_reasons.append("SEVERE_FOREGROUND_AND_PROMPT_MISMATCH_SIGNAL")
        if parody_signal >= 0.90 and prompt_alignment <= 0.08:
            mismatch_reasons.append("HIGH_PARODY_CARICATURE_SIGNAL")
        if prompt_alignment <= 0.025 and family_signal <= 0.12:
            mismatch_reasons.append("SEVERE_PROMPT_FAMILY_MISMATCH_SIGNAL")
        if warning:
            mismatch_reasons.append("PROTECTED_REFERENCE_PROMPT_WARNING")
        severe = bool(mismatch_reasons)
        jury_score = clipped(
            0.28 * semantic
            + 0.34 * management
            + 0.22 * technical
            + 0.10 * (1.0 - parody_signal)
            + 0.06 * (1.0 - warning)
            - (0.18 if severe else 0.0)
        )

        rows.append(
            {
                "candidate_id": item["candidate_id"],
                "epoch": epoch,
                "prompt_id": item["prompt_id"],
                "prompt_family": prompt["family"],
                "seed": item["seed"],
                "absolute_path": str(path),
                "source_sha256": actual_hash,
                "source_screening_status": item.get("screening_status", "MACHINE_ELIGIBLE"),
                "jury_status": "ANALYSIS SIGNAL ONLY",
                "family_rank": 0,
                "machine_label": "",
                "machine_score": round(jury_score, 6),
                "semantic_composite_signal": round(semantic, 6),
                "technical_composite_signal": round(technical, 6),
                "severe_machine_mismatch": str(severe).upper(),
                "mismatch_reasons": ";".join(mismatch_reasons),
                "prompt_text_alignment_signal": round(prompt_alignment, 6),
                "commissioning_family_alignment_signal": round(family_signal, 6),
                "era_description_alignment_signal": round(period_signal, 6),
                "likely_bpm": round(det["likely_bpm"], 3),
                "tempo_stability_signal": round(det["tempo_stability_signal"], 6),
                "onset_density_per_second": round(det["onset_density_per_second"], 6),
                "section_count_estimate": int(det["section_count"]),
                "spectral_centroid_hz": round(det["spectral_centroid_hz"], 3),
                "spectral_bandwidth_hz": round(det["spectral_bandwidth_hz"], 3),
                "spectral_rolloff_hz": round(det["spectral_rolloff_hz"], 3),
                "spectral_flatness": round(det["spectral_flatness"], 8),
                "spectral_density_signal": round(det["spectral_density_signal"], 6),
                "dynamic_range_db": round(det["dynamic_range_db"], 3),
                "raw_loudness_lufs_i": "" if math.isnan(loudness) else round(loudness, 3),
                "raw_loudness_range_lu": "" if math.isnan(lra) else round(lra, 3),
                "raw_true_peak_dbtp": "" if math.isnan(true_peak) else round(true_peak, 3),
                "crest_factor_db": round(crest, 3),
                "repetition_signal": round(det["repetition_signal"], 6),
                "long_static_region_seconds": round(det["long_static_region_seconds"], 3),
                "static_fraction": round(det["static_fraction"], 6),
                "vocal_likelihood_signal": round(vocal_signal, 6),
                "speech_likelihood_signal": round(speech_signal, 6),
                "instrument_family_estimates": instrument_estimates,
                "melodic_prominence_signal": round(melodic_signal, 6),
                "background_tendency_signal": round(background_signal, 6),
                "loop_boundary_jump": round(det["loop_boundary_jump"], 8),
                "loop_seam_ratio_db": round(seam_ratio, 3),
                "loop_seam_quality_signal": round(seam_quality, 6),
                "management_session_suitability_proxy": round(management, 6),
                "period_association_proxy": round(period_signal, 6),
                "stereotype_parody_risk_signal": round(parody_signal, 6),
                "protected_reference_warning_signal": round(warning, 6),
                "protected_reference_limit": warning_limit,
                "analysis_model": MODEL_ID,
                "analysis_model_revision": MODEL_REVISION,
                "analysis_model_license": MODEL_LICENSE,
                "analysis_version": ANALYSIS_VERSION,
                "rights_status": "PROTOTYPE_ONLY",
            }
        )
        print(f"[{index:03d}/{len(eligible):03d}] {item['candidate_id']} score={jury_score:.4f}", flush=True)

    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        grouped[row["prompt_id"]].append(row)
    for family_rows in grouped.values():
        ranked = sorted(family_rows, key=lambda row: (-float(row["machine_score"]), row["candidate_id"]))
        for rank, row in enumerate(ranked, start=1):
            row["family_rank"] = rank
            if row["severe_machine_mismatch"] == "TRUE":
                row["machine_label"] = "MACHINE-REJECTED"
            elif rank == 1:
                row["machine_label"] = "MACHINE-PREFERRED"
            elif rank == 2:
                row["machine_label"] = "MACHINE-ALTERNATE"
            else:
                row["machine_label"] = "MACHINE-ELIGIBLE"
    rows.sort(key=lambda row: (row["epoch"], row["prompt_id"], int(row["family_rank"]), row["candidate_id"]))

    output = args.output
    atomic_write_text(output, csv_text(rows, list(rows[0].keys())))
    summary_path = output.with_suffix(".summary.json")
    summary = {
        "generated_utc": utc_now(),
        "analysis_version": ANALYSIS_VERSION,
        "classification": "ANALYSIS SIGNAL ONLY",
        "limitations": [
            "No output is human listening or Owner approval.",
            "Semantic associations are relative CLAP embedding signals, not historical truth.",
            "Instrument and vocal fields are broad association signals, not source separation or transcription.",
            "The protected-reference field checks prompt wording only and cannot establish copyright safety, exclusivity, non-infringement, or commercial clearance.",
            "Fatigue, cultural acceptance, artifact audibility, and musical quality still require human listening.",
        ],
        "candidate_count": len(rows),
        "severe_mismatch_count": sum(row["severe_machine_mismatch"] == "TRUE" for row in rows),
        "machine_labels": {label: sum(row["machine_label"] == label for row in rows) for label in ("MACHINE-PREFERRED", "MACHINE-ALTERNATE", "MACHINE-ELIGIBLE", "MACHINE-REJECTED")},
        "input_inventory": {"path": str(args.inventory), "sha256": sha256_file(args.inventory)},
        "prompt_register": {"path": str(args.prompts), "sha256": sha256_file(args.prompts)},
        "output": {"path": str(output), "sha256": sha256_file(output)},
        "model": model_manifest(),
        "window_policy": {"starts_seconds": WINDOW_STARTS_SECONDS, "duration_seconds": WINDOW_SECONDS, "aggregation": "MEAN_NORMALIZED_EMBEDDING"},
        "elapsed_seconds": round(time.time() - started, 3),
        "rights_status": "PROTOTYPE_ONLY",
    }
    atomic_write_json(summary_path, summary)
    print(json.dumps(summary, indent=2))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--inventory", type=Path, default=DEFAULT_INVENTORY)
    parser.add_argument("--prompts", type=Path, default=DEFAULT_PROMPTS)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--model-dir", type=Path, default=MODEL_DIR)
    parser.add_argument("--screening-csv", type=Path, action="append", default=[DEFAULT_V1, DEFAULT_V2])
    parser.add_argument("--expected-count", type=int, default=22)
    return parser.parse_args()


if __name__ == "__main__":
    analyze(parse_args())
