#!/usr/bin/env python3
"""Deterministic long-session scheduler and condensed endurance-demo renderer.

Production defaults implement the Project: Studio marathon brief: one four-hour
schedule and one thirty-minute WAV/AAC audition convenience per epoch.  Inputs
are treated as immutable, all source hashes are reconciled before output, and
each epoch is assembled in a sibling staging directory before atomic publish.

The resulting machine checks are fatigue proxies, not human listening evidence.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import os
import platform
import shutil
import statistics
import subprocess
import sys
import tempfile
import wave
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable, Sequence


SCHEMA = "project-studio-endurance-simulation/v1"
STATUS = "PROTOTYPE_READY_FOR_OWNER_AUDITION"
SIGNAL_STATUS = "ANALYSIS SIGNAL ONLY"
EXPECTED_EPOCHS = (
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
GAIN_BY_STATE_DB = {"normal": -2.0, "activity": -6.0, "blocked": -9.0}
STATE_CYCLE = ("normal", "activity", "normal", "blocked")
GAME_SPEED_PATTERN = (1, 1, 2, 1, 4, 1, 2, 1)


@dataclass(frozen=True)
class Track:
    track_id: str
    epoch_alias: str
    family_id: str
    audio_path: Path
    duration_seconds: float
    loudness_lufs: float
    spectral_density: float
    spectral_bin: str
    contains_motif: bool
    motif_id: str | None
    shortlist_role: str
    machine_label: str
    source_sha256: str
    source_bytes: int
    loopable: bool


@dataclass(frozen=True)
class Config:
    seed: str
    total_seconds: float
    demo_seconds: float
    minimum_track_dwell_seconds: float
    maximum_track_dwell_seconds: float
    minimum_state_dwell_seconds: float
    maximum_state_dwell_seconds: float
    silence_min_seconds: float
    silence_max_seconds: float
    motif_cooldown_track_events: int
    render_demos: bool


class StableRng:
    """SHA-256 counter stream, avoiding interpreter-dependent random.shuffle."""

    def __init__(self, namespace: str):
        self.namespace = namespace.encode("utf-8")
        self.counter = 0

    def _u64(self) -> int:
        payload = self.namespace + b"\0" + self.counter.to_bytes(16, "big")
        self.counter += 1
        return int.from_bytes(hashlib.sha256(payload).digest()[:8], "big")

    def fraction(self) -> float:
        return self._u64() / float(1 << 64)

    def uniform(self, minimum: float, maximum: float) -> float:
        return minimum + (maximum - minimum) * self.fraction()

    def integer(self, minimum: int, maximum: int) -> int:
        if maximum < minimum:
            raise ValueError("maximum must be >= minimum")
        return minimum + self._u64() % (maximum - minimum + 1)

    def order(self, values: Iterable[Any]) -> list[Any]:
        # The ordinal tie-breaker avoids ever comparing arbitrary value objects if
        # two 64-bit ordering keys collide.
        decorated = [(self._u64(), ordinal, value) for ordinal, value in enumerate(values)]
        return [value for _, _, value in sorted(decorated)]


def canonical_json_bytes(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode("utf-8")


def pretty_json_bytes(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, indent=2, ensure_ascii=False) + "\n").encode("utf-8")


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        while chunk := handle.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def atomic_write(path: Path, payload: bytes) -> None:
    if not path.parent.is_dir():
        raise FileNotFoundError(f"Atomic-write parent disappeared or was never prepared: {path.parent}")
    descriptor, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    temp_path = Path(temp_name)
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp_path, path)
    except BaseException:
        # Delete only the exact temporary file this call created.  Never recurse.
        if temp_path.parent == path.parent and temp_path.name.startswith(f".{path.name}."):
            temp_path.unlink(missing_ok=True)
        raise


def nested_get(value: dict[str, Any], dotted: str) -> Any:
    current: Any = value
    for key in dotted.split("."):
        if not isinstance(current, dict) or key not in current:
            return None
        current = current[key]
    return current


def first_present(value: dict[str, Any], keys: Sequence[str]) -> Any:
    for key in keys:
        candidate = nested_get(value, key)
        if candidate is not None and candidate != "":
            return candidate
    return None


def flatten_input(document: dict[str, Any]) -> list[dict[str, Any]]:
    flattened: list[dict[str, Any]] = []
    epochs = document.get("epochs")
    if isinstance(epochs, dict):
        epoch_items = [{"epoch_alias": alias, **(body if isinstance(body, dict) else {})} for alias, body in epochs.items()]
    elif isinstance(epochs, list):
        epoch_items = epochs
    else:
        epoch_items = []

    for epoch in epoch_items:
        if not isinstance(epoch, dict):
            continue
        alias = first_present(epoch, ("epoch_alias", "alias", "epoch", "creative_alias"))
        tracks: list[Any] = []
        for key in ("tracks", "entries", "picks", "alternates", "shortlist"):
            value = epoch.get(key)
            if isinstance(value, list):
                tracks.extend(value)
        for track in tracks:
            if isinstance(track, dict):
                flattened.append({"epoch_alias": alias, **track})

    if not flattened:
        for key in ("tracks", "entries", "catalogue", "shortlist"):
            values = document.get(key)
            if isinstance(values, list):
                flattened.extend(item for item in values if isinstance(item, dict))
    return flattened


def bool_value(value: Any, default: bool = False) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value != 0
    return str(value).strip().lower() in {"1", "true", "yes", "y", "present"}


def inspect_duration(path: Path, ffprobe: str) -> float:
    if path.suffix.lower() in {".wav", ".wave"}:
        try:
            with wave.open(str(path), "rb") as source:
                return source.getnframes() / source.getframerate()
        except (wave.Error, EOFError):
            pass
    completed = subprocess.run(
        [
            ffprobe,
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(completed.stdout.strip())


def density_bins(values: list[float]) -> tuple[float, float]:
    ordered = sorted(values)
    if len(ordered) < 3:
        return ordered[0], ordered[-1]
    lower = ordered[(len(ordered) - 1) // 3]
    upper = ordered[(2 * (len(ordered) - 1)) // 3]
    return lower, upper


def density_bin(value: float, lower: float, upper: float) -> str:
    if math.isclose(lower, upper):
        return "mid"
    if value <= lower:
        return "low"
    if value >= upper:
        return "high"
    return "mid"


def load_tracks(input_path: Path, ffprobe: str) -> dict[str, list[Track]]:
    document = json.loads(input_path.read_text(encoding="utf-8"))
    entries = flatten_input(document)
    if not entries:
        raise ValueError("No shortlist entries found. Expected epochs[].tracks[] or a top-level tracks[] list.")

    staged: dict[str, list[dict[str, Any]]] = {}
    seen_ids: set[str] = set()
    for entry in entries:
        epoch_alias = str(first_present(entry, ("epoch_alias", "epoch", "creative_alias")) or "").strip()
        track_id = str(first_present(entry, ("track_id", "stable_track_id", "candidate_id", "id")) or "").strip()
        family_id = str(first_present(entry, ("family_id", "prompt_family_id", "prompt_family", "family")) or "").strip()
        path_value = first_present(
            entry,
            (
                "loop_ready_wav",
                "loop_wav_path",
                "audio_path",
                "wav_path",
                "path",
                "processed.loop_ready_wav",
                "processed.loop_wav_path",
                "derivatives.loop_ready_wav",
            ),
        )
        loudness = first_present(entry, ("loudness_lufs", "integrated_loudness_lufs", "metrics.loudness_lufs", "metrics.integrated_loudness_lufs"))
        density = first_present(entry, ("spectral_density", "spectral_density_score", "metrics.spectral_density", "metrics.spectral_density_score"))
        if not all((epoch_alias, track_id, family_id, path_value is not None, loudness is not None, density is not None)):
            raise ValueError(
                f"Shortlist entry missing required epoch/track/family/path/loudness/spectral-density fields: {track_id or entry}"
            )
        if track_id in seen_ids:
            raise ValueError(f"Duplicate stable track ID: {track_id}")
        seen_ids.add(track_id)

        machine_label = str(first_present(entry, ("machine_label", "eligibility_label", "label", "screening_status")) or "MACHINE-ELIGIBLE")
        if "REJECT" in machine_label.upper():
            raise ValueError(f"Machine-rejected source cannot enter endurance scheduling: {track_id} ({machine_label})")
        path = Path(str(path_value)).expanduser()
        if not path.is_absolute():
            path = (input_path.parent / path).resolve()
        else:
            path = path.resolve()
        if not path.is_file():
            raise FileNotFoundError(f"Missing shortlist audio source: {path}")

        actual_hash = sha256_file(path)
        declared_hash = first_present(entry, ("source_sha256", "master_sha256", "wav_sha256", "hashes.source_sha256", "hashes.master_sha256"))
        if declared_hash and str(declared_hash).lower() != actual_hash:
            raise ValueError(f"Source hash mismatch for {track_id}: declared {declared_hash}, actual {actual_hash}")
        actual_duration = inspect_duration(path, ffprobe)
        declared_duration = first_present(entry, ("duration_seconds", "duration", "metrics.duration_seconds"))
        if declared_duration is not None and abs(float(declared_duration) - actual_duration) > 0.100:
            raise ValueError(
                f"Duration mismatch for {track_id}: declared {float(declared_duration):.6f}, actual {actual_duration:.6f}"
            )
        staged.setdefault(epoch_alias, []).append(
            {
                "track_id": track_id,
                "epoch_alias": epoch_alias,
                "family_id": family_id,
                "audio_path": path,
                "duration_seconds": actual_duration,
                "loudness_lufs": float(loudness),
                "spectral_density": float(density),
                "contains_motif": bool_value(first_present(entry, ("contains_motif", "motif_present", "metrics.contains_motif"))),
                "motif_id": first_present(entry, ("motif_id", "motif_shape_id")),
                "shortlist_role": str(first_present(entry, ("shortlist_role", "role", "provisional_rank")) or "PROVISIONAL_SHORTLIST"),
                "machine_label": machine_label,
                "source_sha256": actual_hash,
                "source_bytes": path.stat().st_size,
                "loopable": bool_value(first_present(entry, ("loopable", "is_loop_ready", "metrics.loopable")), default=True),
            }
        )

    result: dict[str, list[Track]] = {}
    for alias, values in staged.items():
        lower, upper = density_bins([value["spectral_density"] for value in values])
        tracks = [Track(**value, spectral_bin=density_bin(value["spectral_density"], lower, upper)) for value in values]
        family_counts: dict[str, int] = {}
        for track in tracks:
            family_counts[track.family_id] = family_counts.get(track.family_id, 0) + 1
            if not track.loopable:
                raise ValueError(f"Endurance source must be a loop-ready derivative: {track.track_id}")
        if len(tracks) < 3 or len(family_counts) < 2:
            raise ValueError(f"Epoch {alias} needs at least three tracks from at least two prompt families")
        if max(family_counts.values()) > math.ceil(len(tracks) / 2):
            raise ValueError(f"Epoch {alias} family distribution cannot satisfy no-immediate-family-repeat: {family_counts}")
        result[alias] = sorted(tracks, key=lambda track: track.track_id)
    return result


def build_bag(
    tracks: list[Track],
    rng: StableRng,
    previous_family: str | None,
    recent_track_ids: tuple[str, ...],
    music_events_since_motif: int,
    previous_density_bin: str | None,
    density_run: int,
    motif_cooldown: int,
) -> list[Track]:
    random_rank = {track.track_id: rank for rank, track in enumerate(rng.order(tracks))}

    def search(
        remaining: tuple[Track, ...],
        built: tuple[Track, ...],
        last_family: str | None,
        recent_ids: tuple[str, ...],
        since_motif: int,
        last_density: str | None,
        run_length: int,
    ) -> tuple[Track, ...] | None:
        if not remaining:
            return built
        candidates = []
        for track in remaining:
            if track.family_id == last_family or track.track_id in recent_ids:
                continue
            if track.contains_motif and since_motif < motif_cooldown:
                continue
            next_run = run_length + 1 if track.spectral_bin == last_density else 1
            candidates.append((next_run > 2, next_run, random_rank[track.track_id], track.track_id, track))
        for _, _, _, _, track in sorted(candidates):
            next_remaining = tuple(value for value in remaining if value.track_id != track.track_id)
            next_since = 0 if track.contains_motif else min(motif_cooldown, since_motif + 1)
            next_recent = (recent_ids + (track.track_id,))[-2:]
            next_run = run_length + 1 if track.spectral_bin == last_density else 1
            found = search(
                next_remaining,
                built + (track,),
                track.family_id,
                next_recent,
                next_since,
                track.spectral_bin,
                next_run,
            )
            if found is not None:
                return found
        return None

    built = search(
        tuple(tracks),
        (),
        previous_family,
        recent_track_ids,
        music_events_since_motif,
        previous_density_bin,
        density_run,
    )
    if built is None:
        raise ValueError(
            "Unable to form a complete anti-repeat bag under family, two-track repeat, and motif cooldown constraints. "
            "Adjust the shortlist composition; the scheduler will not weaken these constraints."
        )
    return list(built)


def next_state_target(config: Config, rng: StableRng) -> float:
    return round(rng.uniform(config.minimum_state_dwell_seconds, config.maximum_state_dwell_seconds), 3)


def schedule_epoch(epoch_alias: str, tracks: list[Track], config: Config) -> dict[str, Any]:
    rng = StableRng(f"{SCHEMA}:{config.seed}:{epoch_alias}")
    events: list[dict[str, Any]] = []
    current_seconds = 0.0
    music_event_index = 0
    bag_index = 0
    bag_position = 0
    bag: list[Track] = []
    previous_family: str | None = None
    recent_track_ids: tuple[str, ...] = ()
    music_events_since_motif = config.motif_cooldown_track_events
    previous_density_bin: str | None = None
    density_run = 0
    music_until_silence = rng.integer(4, 7)
    current_state_index = 0
    current_state = STATE_CYCLE[current_state_index]
    state_start_seconds = 0.0
    state_target_seconds = next_state_target(config, rng)
    state_windows: list[dict[str, Any]] = []

    def maybe_transition_state() -> None:
        nonlocal current_state_index, current_state, state_start_seconds, state_target_seconds
        elapsed = current_seconds - state_start_seconds
        remaining = config.total_seconds - current_seconds
        if elapsed >= state_target_seconds and remaining >= config.minimum_state_dwell_seconds:
            state_windows.append(
                {
                    "state": current_state,
                    "start_seconds": round(state_start_seconds, 3),
                    "end_seconds": round(current_seconds, 3),
                    "duration_seconds": round(elapsed, 3),
                    "workspace_gain_db": GAIN_BY_STATE_DB[current_state],
                }
            )
            current_state_index = (current_state_index + 1) % len(STATE_CYCLE)
            current_state = STATE_CYCLE[current_state_index]
            state_start_seconds = current_seconds
            state_target_seconds = next_state_target(config, rng)

    while current_seconds < config.total_seconds - 0.0005:
        maybe_transition_state()
        remaining = round(config.total_seconds - current_seconds, 6)

        if music_until_silence <= 0 or remaining < config.minimum_track_dwell_seconds:
            if remaining < config.minimum_track_dwell_seconds:
                silence_duration = remaining
            else:
                silence_duration = min(round(rng.uniform(config.silence_min_seconds, config.silence_max_seconds), 3), remaining)
                if remaining - silence_duration < config.minimum_track_dwell_seconds:
                    silence_duration = remaining
            event = {
                "event_index": len(events),
                "kind": "silence",
                "start_seconds": round(current_seconds, 3),
                "duration_seconds": round(silence_duration, 3),
                "end_seconds": round(current_seconds + silence_duration, 3),
                "state": current_state,
                "workspace_gain_db": None,
                "game_speed_multiplier": GAME_SPEED_PATTERN[music_event_index % len(GAME_SPEED_PATTERN)],
                "audio_tempo_multiplier": 1.0,
                "pitch_shift_semitones": 0.0,
                "sample_playback_rate_multiplier": 1.0,
                "reason": "occasional_workspace_silence" if remaining >= config.minimum_track_dwell_seconds else "exact_session_tail",
            }
            events.append(event)
            current_seconds = round(current_seconds + silence_duration, 6)
            music_until_silence = rng.integer(4, 7)
            continue

        if not bag:
            bag_index += 1
            bag = build_bag(
                tracks,
                rng,
                previous_family,
                recent_track_ids,
                music_events_since_motif,
                previous_density_bin,
                density_run,
                config.motif_cooldown_track_events,
            )
            bag_position = 0

        track = bag.pop(0)
        bag_position += 1
        preferred_dwell = max(config.minimum_track_dwell_seconds, min(config.maximum_track_dwell_seconds, track.duration_seconds))
        duration = min(round(preferred_dwell, 3), remaining)
        if duration < config.minimum_track_dwell_seconds:
            continue
        game_speed = GAME_SPEED_PATTERN[music_event_index % len(GAME_SPEED_PATTERN)]
        effective_loudness = track.loudness_lufs + GAIN_BY_STATE_DB[current_state]
        event = {
            "event_index": len(events),
            "kind": "music",
            "start_seconds": round(current_seconds, 3),
            "duration_seconds": round(duration, 3),
            "end_seconds": round(current_seconds + duration, 3),
            "state": current_state,
            "workspace_gain_db": GAIN_BY_STATE_DB[current_state],
            "game_speed_multiplier": game_speed,
            "audio_tempo_multiplier": 1.0,
            "pitch_shift_semitones": 0.0,
            "sample_playback_rate_multiplier": 1.0,
            "bag_index": bag_index,
            "bag_position": bag_position,
            "track_id": track.track_id,
            "family_id": track.family_id,
            "audio_path": str(track.audio_path),
            "source_sha256": track.source_sha256,
            "source_offset_seconds": 0.0,
            "source_looped_if_needed": duration > track.duration_seconds + 0.001,
            "source_duration_seconds": round(track.duration_seconds, 6),
            "declared_loudness_lufs": track.loudness_lufs,
            "effective_loudness_lufs_proxy": round(effective_loudness, 3),
            "spectral_density": track.spectral_density,
            "spectral_bin": track.spectral_bin,
            "contains_motif": track.contains_motif,
            "motif_id": track.motif_id,
            "shortlist_role": track.shortlist_role,
            "machine_label": track.machine_label,
        }
        events.append(event)
        current_seconds = round(current_seconds + duration, 6)
        music_event_index += 1
        music_until_silence -= 1
        previous_family = track.family_id
        recent_track_ids = (recent_track_ids + (track.track_id,))[-2:]
        music_events_since_motif = 0 if track.contains_motif else min(
            config.motif_cooldown_track_events, music_events_since_motif + 1
        )
        next_density_run = density_run + 1 if track.spectral_bin == previous_density_bin else 1
        previous_density_bin = track.spectral_bin
        density_run = next_density_run

    state_windows.append(
        {
            "state": current_state,
            "start_seconds": round(state_start_seconds, 3),
            "end_seconds": round(config.total_seconds, 3),
            "duration_seconds": round(config.total_seconds - state_start_seconds, 3),
            "workspace_gain_db": GAIN_BY_STATE_DB[current_state],
        }
    )
    return {
        "schema": SCHEMA,
        "status": STATUS,
        "epoch_alias": epoch_alias,
        "deterministic_seed": config.seed,
        "duration_seconds": config.total_seconds,
        "duration_hours": config.total_seconds / 3600.0,
        "policy": {
            "anti_repeat_shuffle_bag": True,
            "track_repeat_cooldown_music_events": 2,
            "minimum_track_dwell_seconds": config.minimum_track_dwell_seconds,
            "minimum_state_dwell_seconds": config.minimum_state_dwell_seconds,
            "states": list(GAIN_BY_STATE_DB),
            "motif_cooldown_track_events": config.motif_cooldown_track_events,
            "silence_range_seconds": [config.silence_min_seconds, config.silence_max_seconds],
            "game_speeds_simulated": [1, 2, 4],
            "audio_speed_policy": "No pitch, tempo, or sample-playback-rate change at 2x or 4x game speed.",
        },
        "track_pool": [
            {
                **{key: value for key, value in asdict(track).items() if key != "audio_path"},
                "audio_path": str(track.audio_path),
            }
            for track in tracks
        ],
        "state_windows": state_windows,
        "events": events,
    }


def consecutive_runs(values: Sequence[str]) -> list[tuple[str, int]]:
    result: list[tuple[str, int]] = []
    for value in values:
        if result and result[-1][0] == value:
            result[-1] = (value, result[-1][1] + 1)
        else:
            result.append((value, 1))
    return result


def check_schedule(schedule: dict[str, Any], tracks: list[Track], config: Config, replay_hash_equal: bool) -> dict[str, Any]:
    events = schedule["events"]
    music = [event for event in events if event["kind"] == "music"]
    silences = [event for event in events if event["kind"] == "silence"]
    track_ids = [event["track_id"] for event in music]
    families = [event["family_id"] for event in music]
    density_values = [event["spectral_bin"] for event in music]
    source_pool = {track.track_id for track in tracks}

    repeat_intervals: dict[str, list[float]] = {track.track_id: [] for track in tracks}
    repeat_event_gaps: dict[str, list[int]] = {track.track_id: [] for track in tracks}
    last_occurrence: dict[str, tuple[int, float]] = {}
    for index, event in enumerate(music):
        track_id = event["track_id"]
        if track_id in last_occurrence:
            previous_index, previous_start = last_occurrence[track_id]
            repeat_intervals[track_id].append(round(event["start_seconds"] - previous_start, 3))
            repeat_event_gaps[track_id].append(index - previous_index - 1)
        last_occurrence[track_id] = (index, event["start_seconds"])

    completed_bags: dict[int, list[str]] = {}
    for event in music:
        completed_bags.setdefault(event["bag_index"], []).append(event["track_id"])
    max_bag = max(completed_bags, default=0)
    bag_violations = []
    for bag_id, values in completed_bags.items():
        expected = source_pool if bag_id < max_bag or len(values) == len(source_pool) else set(values)
        if len(values) != len(set(values)) or set(values) != expected:
            bag_violations.append({"bag_index": bag_id, "track_ids": values})

    family_counts = {family: families.count(family) for family in sorted(set(families))}
    family_seconds = {
        family: round(sum(event["duration_seconds"] for event in music if event["family_id"] == family), 3)
        for family in sorted(set(families))
    }
    effective_loudness = [event["effective_loudness_lufs_proxy"] for event in music]
    loudness_jumps = [abs(right - left) for left, right in zip(effective_loudness, effective_loudness[1:])]
    density_runs = consecutive_runs(density_values)

    motif_indices = [index for index, event in enumerate(music) if event["contains_motif"]]
    motif_gaps = [right - left - 1 for left, right in zip(motif_indices, motif_indices[1:])]
    speed_invariant = all(
        event["audio_tempo_multiplier"] == 1.0
        and event["pitch_shift_semitones"] == 0.0
        and event["sample_playback_rate_multiplier"] == 1.0
        for event in events
        if event["game_speed_multiplier"] in (2, 4)
    )
    speeds_seen = sorted({event["game_speed_multiplier"] for event in events})
    state_windows = schedule["state_windows"]
    state_dwell_ok = all(window["duration_seconds"] + 0.001 >= config.minimum_state_dwell_seconds for window in state_windows)
    states_seen = sorted({window["state"] for window in state_windows})
    silence_seconds = sum(event["duration_seconds"] for event in silences)
    silence_proportion = silence_seconds / config.total_seconds
    exact_duration = math.isclose(events[-1]["end_seconds"], config.total_seconds, abs_tol=0.001)
    minimum_dwell_ok = all(event["duration_seconds"] + 0.001 >= config.minimum_track_dwell_seconds for event in music)
    immediate_track_repeats = [index for index, (left, right) in enumerate(zip(track_ids, track_ids[1:])) if left == right]
    immediate_family_repeats = [index for index, (left, right) in enumerate(zip(families, families[1:])) if left == right]
    motif_ok = not motif_gaps or min(motif_gaps) >= config.motif_cooldown_track_events
    missing_track_ids = sorted(source_pool - set(track_ids))

    structural_checks = {
        "exact_session_duration": exact_duration,
        "minimum_track_dwell": minimum_dwell_ok,
        "minimum_state_dwell": state_dwell_ok,
        "all_three_states_visited": set(states_seen) == set(GAIN_BY_STATE_DB),
        "anti_repeat_shuffle_bags": not bag_violations,
        "no_accidental_same_track_adjacency": not immediate_track_repeats,
        "no_immediate_family_repeat": not immediate_family_repeats,
        "motif_cooldown_and_no_consecutive_motif": motif_ok,
        "speed_invariant_at_2x_4x": speed_invariant and {2, 4}.issubset(speeds_seen),
        "every_source_exercised": not missing_track_ids,
        "deterministic_seed_replay": replay_hash_equal,
        "occasional_silence_present": bool(silences) and 0.01 <= silence_proportion <= 0.10,
    }
    overall = "PASS" if all(structural_checks.values()) else "FAIL"
    all_repeat_intervals = [value for values in repeat_intervals.values() for value in values]
    all_repeat_gaps = [value for values in repeat_event_gaps.values() for value in values]
    return {
        "schema": "project-studio-endurance-machine-checks/v1",
        "status": SIGNAL_STATUS,
        "overall_structural_result": overall,
        "human_limit": "A deterministic proxy cannot establish listening comfort, musical quality, irritation, or four-hour human fatigue.",
        "structural_checks": structural_checks,
        "event_counts": {
            "total": len(events),
            "music": len(music),
            "silence": len(silences),
            "state_transitions": max(0, len(state_windows) - 1),
        },
        "repeat_intervals": {
            "per_track_seconds": repeat_intervals,
            "per_track_intervening_music_events": repeat_event_gaps,
            "minimum_seconds": min(all_repeat_intervals) if all_repeat_intervals else None,
            "median_seconds": statistics.median(all_repeat_intervals) if all_repeat_intervals else None,
            "minimum_intervening_music_events": min(all_repeat_gaps) if all_repeat_gaps else None,
        },
        "family_distribution": {"event_counts": family_counts, "seconds": family_seconds},
        "loudness_discontinuity_proxy": {
            "maximum_adjacent_jump_lu": round(max(loudness_jumps), 3) if loudness_jumps else 0.0,
            "median_adjacent_jump_lu": round(statistics.median(loudness_jumps), 3) if loudness_jumps else 0.0,
            "count_over_8_lu": sum(value > 8.0 for value in loudness_jumps),
            "note": "Calculated from source integrated-loudness metadata plus scheduled workspace gain; not a rendered perceptual measurement.",
        },
        "spectral_density_clustering_proxy": {
            "runs": [{"bin": value, "music_event_count": count} for value, count in density_runs],
            "maximum_run_music_events": max((count for _, count in density_runs), default=0),
            "count_over_three": sum(count > 3 for _, count in density_runs),
        },
        "motif": {
            "event_indices": motif_indices,
            "intervening_music_event_gaps": motif_gaps,
            "required_cooldown_music_events": config.motif_cooldown_track_events,
        },
        "silence": {"seconds": round(silence_seconds, 3), "proportion": round(silence_proportion, 6)},
        "states": {"seen": states_seen, "windows": state_windows},
        "speed": {
            "game_speed_multipliers_seen": speeds_seen,
            "audio_tempo_multiplier": 1.0,
            "pitch_shift_semitones": 0.0,
            "sample_playback_rate_multiplier": 1.0,
        },
        "violations": {
            "bag": bag_violations,
            "immediate_track_repeat_indices": immediate_track_repeats,
            "immediate_family_repeat_indices": immediate_family_repeats,
            "missing_track_ids": missing_track_ids,
        },
    }


def csv_bytes(rows: list[dict[str, Any]], fieldnames: Sequence[str]) -> bytes:
    import io

    stream = io.StringIO(newline="")
    writer = csv.DictWriter(stream, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    return stream.getvalue().encode("utf-8")


def write_schedule_csv(path: Path, schedule: dict[str, Any]) -> None:
    fields = (
        "event_index",
        "kind",
        "start_seconds",
        "duration_seconds",
        "end_seconds",
        "state",
        "workspace_gain_db",
        "game_speed_multiplier",
        "audio_tempo_multiplier",
        "pitch_shift_semitones",
        "sample_playback_rate_multiplier",
        "bag_index",
        "bag_position",
        "track_id",
        "family_id",
        "audio_path",
        "source_sha256",
        "source_offset_seconds",
        "effective_loudness_lufs_proxy",
        "spectral_bin",
        "contains_motif",
        "motif_id",
        "reason",
    )
    atomic_write(path, csv_bytes(schedule["events"], fields))


def demo_events(schedule: dict[str, Any], demo_seconds: float) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    current = 0.0
    for source in schedule["events"]:
        if current >= demo_seconds - 0.0005:
            break
        duration = min(source["duration_seconds"], demo_seconds - current)
        event = dict(source)
        event["schedule_start_seconds"] = source["start_seconds"]
        event["demo_start_seconds"] = round(current, 3)
        event["duration_seconds"] = round(duration, 3)
        event["demo_end_seconds"] = round(current + duration, 3)
        result.append(event)
        current += duration
    if not math.isclose(current, demo_seconds, abs_tol=0.001):
        raise RuntimeError(f"Unable to form exact demo duration: {current} vs {demo_seconds}")
    return result


def ffmpeg_version(ffmpeg: str) -> str:
    completed = subprocess.run([ffmpeg, "-version"], check=True, capture_output=True, text=True)
    return completed.stdout.splitlines()[0]


def run_checked(command: list[str]) -> None:
    completed = subprocess.run(command, capture_output=True, text=True)
    if completed.returncode != 0:
        raise RuntimeError(
            f"Command failed ({completed.returncode}): {' '.join(command[:8])} ...\n"
            f"stdout:\n{completed.stdout[-4000:]}\nstderr:\n{completed.stderr[-4000:]}"
        )


def render_demo(
    events: list[dict[str, Any]],
    wav_path: Path,
    aac_path: Path,
    ffmpeg: str,
    ffprobe: str,
    expected_seconds: float,
) -> dict[str, Any]:
    command = [ffmpeg, "-nostdin", "-hide_banner", "-loglevel", "error", "-y"]
    filters: list[str] = []
    labels: list[str] = []
    input_index = 0
    forbidden_filters = ("atempo", "asetrate", "rubberband", "aresample=async")
    for event_index, event in enumerate(events):
        label = f"segment{event_index}"
        labels.append(f"[{label}]")
        duration = float(event["duration_seconds"])
        if event["kind"] == "silence":
            filters.append(
                f"anullsrc=r=48000:cl=stereo,atrim=duration={duration:.6f},asetpts=PTS-STARTPTS[{label}]"
            )
            continue
        command.extend(["-stream_loop", "-1", "-i", event["audio_path"]])
        fade_out_start = max(0.0, duration - 0.030)
        filters.append(
            f"[{input_index}:a]atrim=start={float(event['source_offset_seconds']):.6f}:duration={duration:.6f},"
            "asetpts=PTS-STARTPTS,aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,"
            f"volume={float(event['workspace_gain_db']):.3f}dB,afade=t=in:st=0:d=0.020,"
            f"afade=t=out:st={fade_out_start:.6f}:d=0.030[{label}]"
        )
        input_index += 1
    filters.append("".join(labels) + f"concat=n={len(labels)}:v=0:a=1[demo]")
    filter_graph = ";".join(filters)
    if any(token in filter_graph for token in forbidden_filters):
        raise RuntimeError("Forbidden pitch/tempo-changing filter entered demo graph")
    command.extend(
        [
            "-filter_complex",
            filter_graph,
            "-map",
            "[demo]",
            "-ar",
            "48000",
            "-ac",
            "2",
            "-c:a",
            "pcm_s24le",
            str(wav_path),
        ]
    )
    run_checked(command)
    run_checked(
        [
            ffmpeg,
            "-nostdin",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(wav_path),
            "-map_metadata",
            "-1",
            "-c:a",
            "aac",
            "-b:a",
            "256k",
            str(aac_path),
        ]
    )
    wav_duration = inspect_duration(wav_path, ffprobe)
    aac_duration = inspect_duration(aac_path, ffprobe)
    if abs(wav_duration - expected_seconds) > 0.075 or abs(aac_duration - expected_seconds) > 0.150:
        raise RuntimeError(
            f"Rendered demo duration mismatch: WAV {wav_duration:.6f}, AAC {aac_duration:.6f}, expected {expected_seconds:.6f}"
        )
    return {
        "wav": {
            "path": str(wav_path),
            "bytes": wav_path.stat().st_size,
            "sha256": sha256_file(wav_path),
            "duration_seconds": wav_duration,
            "sample_rate_hz": 48000,
            "bit_depth": 24,
            "channels": 2,
        },
        "aac": {
            "path": str(aac_path),
            "bytes": aac_path.stat().st_size,
            "sha256": sha256_file(aac_path),
            "duration_seconds": aac_duration,
            "codec": "AAC",
            "target_bitrate": "256k",
        },
        "render_invariants": {
            "pitch_shift_semitones": 0.0,
            "tempo_multiplier": 1.0,
            "sample_playback_rate_multiplier": 1.0,
            "forbidden_pitch_tempo_filters_absent": True,
            "workspace_gain_applied": True,
        },
    }


def artifact(path: Path) -> dict[str, Any]:
    return {"path": str(path), "bytes": path.stat().st_size, "sha256": sha256_file(path)}


def build_epoch(
    epoch_alias: str,
    tracks: list[Track],
    config: Config,
    input_path: Path,
    output_root: Path,
    ffmpeg: str,
    ffprobe: str,
) -> dict[str, Any]:
    final_dir = output_root / epoch_alias
    if final_dir.exists():
        raise FileExistsError(f"Refusing to overwrite existing epoch output: {final_dir}")

    first_schedule = schedule_epoch(epoch_alias, tracks, config)
    second_schedule = schedule_epoch(epoch_alias, tracks, config)
    first_canonical = canonical_json_bytes(first_schedule)
    replay_equal = first_canonical == canonical_json_bytes(second_schedule)
    checks = check_schedule(first_schedule, tracks, config, replay_equal)
    if checks["overall_structural_result"] != "PASS":
        raise RuntimeError(f"Endurance structural checks failed for {epoch_alias}: {checks['structural_checks']}")

    output_root.mkdir(parents=True, exist_ok=True)
    stage_parent = Path(tempfile.mkdtemp(prefix=f".{epoch_alias}.stage-", dir=output_root))
    stage_dir = stage_parent / epoch_alias
    stage_dir.mkdir()
    try:
        schedule_json = stage_dir / "four-hour-schedule.json"
        schedule_csv = stage_dir / "four-hour-schedule.csv"
        checks_path = stage_dir / "machine-checks.json"
        atomic_write(schedule_json, pretty_json_bytes(first_schedule))
        write_schedule_csv(schedule_csv, first_schedule)
        atomic_write(checks_path, pretty_json_bytes(checks))

        produced = [schedule_json, schedule_csv, checks_path]
        render_record: dict[str, Any] | None = None
        cue_json: Path | None = None
        cue_csv: Path | None = None
        if config.render_demos:
            cues = demo_events(first_schedule, config.demo_seconds)
            cue_document = {
                "schema": "project-studio-endurance-demo-cues/v1",
                "status": STATUS,
                "epoch_alias": epoch_alias,
                "duration_seconds": config.demo_seconds,
                "purpose": "Condensed audition convenience; not proof against human listening fatigue.",
                "events": cues,
            }
            cue_json = stage_dir / "thirty-minute-demo-cues.json"
            cue_csv = stage_dir / "thirty-minute-demo-cues.csv"
            atomic_write(cue_json, pretty_json_bytes(cue_document))
            write_schedule_csv(cue_csv, {"events": cues})
            wav_path = stage_dir / "thirty-minute-endurance-demo.wav"
            aac_path = stage_dir / "thirty-minute-endurance-demo.m4a"
            render_record = render_demo(cues, wav_path, aac_path, ffmpeg, ffprobe, config.demo_seconds)
            produced.extend([cue_json, cue_csv, wav_path, aac_path])

        source_records = [
            {
                "track_id": track.track_id,
                "path": str(track.audio_path),
                "bytes": track.source_bytes,
                "sha256": track.source_sha256,
            }
            for track in tracks
        ]
        provenance = {
            "schema": "project-studio-endurance-provenance/v1",
            "status": STATUS,
            "analysis_status": SIGNAL_STATUS,
            "epoch_alias": epoch_alias,
            "tool": {
                "path": str(Path(__file__).resolve()),
                "sha256": sha256_file(Path(__file__).resolve()),
                "python_executable": sys.executable,
                "python_version": platform.python_version(),
                "platform": platform.platform(),
            },
            "input_metadata": {
                "path": str(input_path),
                "bytes": input_path.stat().st_size,
                "sha256": sha256_file(input_path),
            },
            "sources": source_records,
            "configuration": asdict(config),
            "schedule_canonical_sha256": sha256_bytes(first_canonical),
            "deterministic_replay_equal": replay_equal,
            "ffmpeg": ffmpeg_version(ffmpeg) if config.render_demos else "not invoked; schedule-only run",
            "artifacts": [artifact(path) for path in produced],
            "render": render_record,
            "boundary": (
                "This deterministic simulation and condensed demo are audition conveniences only. "
                "They do not prove human fatigue tolerance or constitute Owner approval."
            ),
        }
        provenance_path = stage_dir / "provenance.json"
        atomic_write(provenance_path, pretty_json_bytes(provenance))
        produced.append(provenance_path)
        sums_path = stage_dir / "SHA256SUMS.txt"
        sums = "\n".join(f"{sha256_file(path)}  {path.name}" for path in sorted(produced, key=lambda value: value.name)) + "\n"
        atomic_write(sums_path, sums.encode("utf-8"))

        os.replace(stage_dir, final_dir)
        # This is an exact, non-recursive removal and succeeds only when the
        # tool-owned staging parent is empty.  Unexpected contents are preserved.
        try:
            stage_parent.rmdir()
        except OSError:
            pass
    except BaseException as error:
        # Preserve failed staging for forensic/resume work.  Automatic recursive
        # cleanup is intentionally forbidden after the worktree-collision audit.
        marker = stage_parent / "FAILED-STAGING-PRESERVED.txt"
        try:
            atomic_write(
                marker,
                (
                    "Project: Studio endurance build failed before atomic publish.\n"
                    f"epoch={epoch_alias}\n"
                    f"error_type={type(error).__name__}\n"
                    f"error={error}\n"
                    "This tool will not delete staging recursively. Inspect and remove manually only after verification.\n"
                ).encode("utf-8"),
            )
        except BaseException:
            pass
        raise RuntimeError(f"Epoch build failed; staging preserved at {stage_parent}") from error
    return {
        "epoch_alias": epoch_alias,
        "output_dir": str(final_dir),
        "schedule_sha256": sha256_file(final_dir / "four-hour-schedule.json"),
        "checks_sha256": sha256_file(final_dir / "machine-checks.json"),
        "rendered_demo": config.render_demos,
        "structural_result": "PASS",
    }


def validate_production_defaults(arguments: argparse.Namespace) -> None:
    if arguments.fixture_mode:
        return
    expected = {
        "session_hours": 4.0,
        "demo_minutes": 30.0,
        "minimum_track_dwell_seconds": 90.0,
        "minimum_state_dwell_seconds": 600.0,
        "maximum_state_dwell_seconds": 1500.0,
        "silence_min_seconds": 20.0,
        "silence_max_seconds": 45.0,
        "motif_cooldown_track_events": 2,
    }
    changed = {key: (getattr(arguments, key), value) for key, value in expected.items() if getattr(arguments, key) != value}
    if changed:
        raise ValueError(f"Non-production timing values require explicit --fixture-mode: {changed}")


def input_template() -> dict[str, Any]:
    return {
        "schema": "project-studio-endurance-shortlist-input/v1",
        "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "epochs": [
            {
                "epoch_alias": alias,
                "tracks": [
                    {
                        "track_id": f"{alias}__stable-id",
                        "family_id": f"{alias}__family-id",
                        "loop_ready_wav": "/absolute/path/to/loop-ready.wav",
                        "duration_seconds": 120.0,
                        "source_sha256": "64-lowercase-hex-characters",
                        "loudness_lufs": -16.0,
                        "spectral_density": 0.5,
                        "contains_motif": False,
                        "motif_id": None,
                        "loopable": True,
                        "shortlist_role": "PROVISIONAL PICK 1",
                        "machine_label": "MACHINE-PREFERRED",
                    }
                ],
            }
            for alias in EXPECTED_EPOCHS
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, help="Final provisional-shortlist metadata JSON")
    parser.add_argument(
        "--output-root",
        type=Path,
        default=Path("/Users/bruce/Project Studio Audio Foundry Marathon 01/08_endurance"),
    )
    parser.add_argument("--seed", default="PROJECT-STUDIO-ENDURANCE-01")
    parser.add_argument("--session-hours", type=float, default=4.0)
    parser.add_argument("--demo-minutes", type=float, default=30.0)
    parser.add_argument("--minimum-track-dwell-seconds", type=float, default=90.0)
    parser.add_argument("--maximum-track-dwell-seconds", type=float, default=150.0)
    parser.add_argument("--minimum-state-dwell-seconds", type=float, default=600.0)
    parser.add_argument("--maximum-state-dwell-seconds", type=float, default=1500.0)
    parser.add_argument("--silence-min-seconds", type=float, default=20.0)
    parser.add_argument("--silence-max-seconds", type=float, default=45.0)
    parser.add_argument("--motif-cooldown-track-events", type=int, default=2)
    parser.add_argument("--render-demos", action="store_true", help="Render condensed WAV and AAC using local ffmpeg")
    parser.add_argument("--allow-subset", action="store_true", help="Test-only: permit fewer than all nine epochs")
    parser.add_argument("--fixture-mode", action="store_true", help="Test-only: permit non-production duration settings")
    parser.add_argument("--ffmpeg", default=shutil.which("ffmpeg") or "ffmpeg")
    parser.add_argument("--ffprobe", default=shutil.which("ffprobe") or "ffprobe")
    parser.add_argument("--print-input-template", action="store_true")
    arguments = parser.parse_args()

    if arguments.print_input_template:
        print(json.dumps(input_template(), indent=2))
        return 0
    if arguments.input is None:
        parser.error("--input is required unless --print-input-template is used")
    validate_production_defaults(arguments)
    if arguments.session_hours <= 0 or arguments.demo_minutes <= 0:
        raise ValueError("Session and demo durations must be positive")
    if arguments.demo_minutes * 60 > arguments.session_hours * 3600:
        raise ValueError("Demo duration cannot exceed session duration")
    if not 0 < arguments.minimum_track_dwell_seconds <= arguments.maximum_track_dwell_seconds:
        raise ValueError("Invalid track dwell bounds")
    if not 0 < arguments.minimum_state_dwell_seconds <= arguments.maximum_state_dwell_seconds:
        raise ValueError("Invalid state dwell bounds")
    if not 0 < arguments.silence_min_seconds <= arguments.silence_max_seconds:
        raise ValueError("Invalid silence bounds")
    if arguments.motif_cooldown_track_events < 1:
        raise ValueError("Motif cooldown must be at least one intervening music event")

    input_path = arguments.input.expanduser().resolve()
    output_root = arguments.output_root.expanduser().resolve()
    if not input_path.is_file():
        raise FileNotFoundError(input_path)
    if arguments.render_demos:
        for executable in (arguments.ffmpeg, arguments.ffprobe):
            if not shutil.which(executable) and not Path(executable).is_file():
                raise FileNotFoundError(f"Required local executable not found: {executable}")

    tracks_by_epoch = load_tracks(input_path, arguments.ffprobe)
    actual_aliases = set(tracks_by_epoch)
    if not arguments.allow_subset and actual_aliases != set(EXPECTED_EPOCHS):
        raise ValueError(
            f"Production run requires exactly nine creative epoch aliases. Missing={sorted(set(EXPECTED_EPOCHS)-actual_aliases)} "
            f"unexpected={sorted(actual_aliases-set(EXPECTED_EPOCHS))}"
        )
    aliases = [alias for alias in EXPECTED_EPOCHS if alias in tracks_by_epoch]
    aliases.extend(sorted(actual_aliases - set(EXPECTED_EPOCHS)))

    targets = [output_root / alias for alias in aliases]
    existing = [str(path) for path in targets if path.exists()]
    index_path = output_root / "endurance-index.json"
    if index_path.exists():
        existing.append(str(index_path))
    if existing:
        raise FileExistsError(f"Refusing to overwrite existing endurance outputs: {existing}")

    config = Config(
        seed=arguments.seed,
        total_seconds=round(arguments.session_hours * 3600.0, 3),
        demo_seconds=round(arguments.demo_minutes * 60.0, 3),
        minimum_track_dwell_seconds=arguments.minimum_track_dwell_seconds,
        maximum_track_dwell_seconds=arguments.maximum_track_dwell_seconds,
        minimum_state_dwell_seconds=arguments.minimum_state_dwell_seconds,
        maximum_state_dwell_seconds=arguments.maximum_state_dwell_seconds,
        silence_min_seconds=arguments.silence_min_seconds,
        silence_max_seconds=arguments.silence_max_seconds,
        motif_cooldown_track_events=arguments.motif_cooldown_track_events,
        render_demos=arguments.render_demos,
    )
    results = [
        build_epoch(alias, tracks_by_epoch[alias], config, input_path, output_root, arguments.ffmpeg, arguments.ffprobe)
        for alias in aliases
    ]
    index = {
        "schema": "project-studio-endurance-index/v1",
        "status": STATUS,
        "analysis_status": SIGNAL_STATUS,
        "input": {"path": str(input_path), "sha256": sha256_file(input_path)},
        "configuration": asdict(config),
        "epoch_count": len(results),
        "epochs": results,
        "human_limit": "These outputs are audition conveniences and deterministic proxies, not proof against human fatigue.",
    }
    atomic_write(index_path, pretty_json_bytes(index))
    print(json.dumps({"result": "PASS", "index": str(index_path), "epochs": results}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
