#!/usr/bin/env python3
"""Build deterministic fixed-epoch four-hour music-density traces with cue identity."""

from __future__ import annotations

import argparse
import hashlib
import json
import random
from pathlib import Path
from typing import Any

from common import PILOT_ROOT, atomic_write_json, sha256_file


REGISTER = PILOT_ROOT / "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v5.json"
OUTPUT_ROOT = PILOT_ROOT / "02_music-bundles/simulations"
INDEX = OUTPUT_ROOT / "FOUR-HOUR-DENSITY-SIMULATIONS.v2.json"
CREATED_AT = "2026-09-03T00:00:00Z"
DURATION_SECONDS = 4 * 60 * 60
EPOCHS = (
    "acoustic_electrical_1920_1932",
    "format_plurality_1975_1986",
    "streaming_plural_2015_2029",
)
DENSITY_GAPS: dict[str, tuple[float, float] | None] = {
    "FULL_MUSIC": (8.0, 20.0),
    "BALANCED": (35.0, 95.0),
    "SPARSE": (120.0, 300.0),
    "OFF": None,
}


def stable_seed(value: str) -> int:
    return int.from_bytes(hashlib.sha256(value.encode("utf-8")).digest()[:8], "big")


def shuffled_cycle(items: list[dict[str, Any]], rng: random.Random, last_id: str | None) -> list[dict[str, Any]]:
    cycle = list(items)
    rng.shuffle(cycle)
    if last_id is not None and len(cycle) > 1 and cycle[0]["id"] == last_id:
        cycle[0], cycle[1] = cycle[1], cycle[0]
    return cycle


def build_trace(epoch: str, density: str, sources: list[dict[str, Any]]) -> dict[str, Any]:
    seed = f"APS01-4H-{epoch}-{density}-V2"
    if DENSITY_GAPS[density] is None:
        events: list[dict[str, Any]] = []
        silence = [{"start_seconds": 0.0, "end_seconds": float(DURATION_SECONDS), "reason": "MUSIC_OFF_USER_SETTING"}]
    else:
        rng = random.Random(stable_seed(seed))
        gap_low, gap_high = DENSITY_GAPS[density] or (0.0, 0.0)
        events = []
        silence = []
        cursor = 0.0
        previous_id: str | None = None
        bag: list[dict[str, Any]] = []
        cycle = 0
        while cursor < DURATION_SECONDS:
            if not bag:
                cycle += 1
                bag = shuffled_cycle(sources, rng, previous_id)
            source = bag.pop(0)
            end = min(float(DURATION_SECONDS), cursor + float(source["duration_seconds"]))
            events.append({
                "sequence": len(events) + 1,
                "shuffle_cycle": cycle,
                "start_seconds": round(cursor, 6),
                "end_seconds": round(end, 6),
                "cue_id": source["id"],
                "family": source["family"],
                "epoch": source["epoch"],
                "source_sha256": source["sha256"],
                "source_relative_path": source["relative_path"],
                "pitch_scale": 1.0,
                "tempo_scale": 1.0,
                "selection_reason": "DETERMINISTIC_FIXED_EPOCH_SHUFFLE_BAG",
                "relaxation_reason": None,
            })
            previous_id = source["id"]
            if end >= DURATION_SECONDS:
                break
            gap = rng.uniform(gap_low, gap_high)
            gap_end = min(float(DURATION_SECONDS), end + gap)
            silence.append({
                "start_seconds": round(end, 6),
                "end_seconds": round(gap_end, 6),
                "reason": f"{density}_DETERMINISTIC_GAP",
            })
            cursor = gap_end
    no_immediate_id = all(a["cue_id"] != b["cue_id"] for a, b in zip(events, events[1:]))
    no_immediate_family = all(a["family"] != b["family"] for a, b in zip(events, events[1:]))
    final_timeline_end = max(
        events[-1]["end_seconds"] if events else 0,
        silence[-1]["end_seconds"] if silence else 0,
    )
    assertions = {
        "duration_exact_seconds": final_timeline_end == DURATION_SECONDS,
        "fixed_epoch": all(event["epoch"] == epoch for event in events),
        "no_immediate_cue_repeat": no_immediate_id,
        "no_immediate_family_repeat": no_immediate_family,
        "gap_bounds": all(
            DENSITY_GAPS[density] is not None and
            (
                (DENSITY_GAPS[density] or (0, 0))[0] - 1e-6 <= row["end_seconds"] - row["start_seconds"] <= (DENSITY_GAPS[density] or (0, 0))[1] + 1e-6
                or row["end_seconds"] == DURATION_SECONDS
            )
            for row in silence
        ) if density != "OFF" else len(silence) == 1,
        "off_has_no_music": density != "OFF" or len(events) == 0,
        "pitch_and_tempo_unchanged": all(event["pitch_scale"] == 1 and event["tempo_scale"] == 1 for event in events),
        "three_distinct_source_families_available": len({source["family"] for source in sources}) == 3,
        "no_unrecorded_relaxation": all(event["relaxation_reason"] is None for event in events),
    }
    return {
        "schema": "project-studio-four-hour-density-trace/v2",
        "created_at": CREATED_AT,
        "seed": seed,
        "duration_seconds": DURATION_SECONDS,
        "epoch": epoch,
        "density": density,
        "source_set": [{"id": row["id"], "family": row["family"], "sha256": row["sha256"], "relative_path": row["relative_path"]} for row in sources],
        "event_count": len(events),
        "silence_segment_count": len(silence),
        "events": events,
        "silence_segments": silence,
        "assertions": assertions,
        "machine_verdict": "PASS" if all(assertions.values()) else "FAIL",
        "human_fatigue_disposition": "PENDING",
        "limitations": [
            "This is a fixed-epoch long-session era-pick trace, not proof that independently generated responsive variants share melodic continuity.",
            "Timing and anti-repeat proof cannot establish music quality, context fit, or four-hour listening comfort.",
        ],
    }


def build() -> dict[str, Any]:
    register = json.loads(REGISTER.read_text(encoding="utf-8"))
    if register.get("schema") != "project-studio-system-audio-asset-register/v5":
        raise RuntimeError("unexpected system register")
    era_picks = [item for item in register["items"] if item["role"] == "ERA_PICK" and item["epoch"] in EPOCHS]
    for item in era_picks:
        path = Path(item["path"])
        if sha256_file(path) != item["sha256"]:
            raise RuntimeError(f"source hash mismatch: {path}")
    traces = []
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    for epoch in EPOCHS:
        sources = sorted([item for item in era_picks if item["epoch"] == epoch], key=lambda row: row["id"])
        if len(sources) != 3 or len({row["family"] for row in sources}) != 3:
            raise RuntimeError(f"expected three distinct fixed-epoch families: {epoch}")
        for density in DENSITY_GAPS:
            trace = build_trace(epoch, density, sources)
            path = OUTPUT_ROOT / f"{epoch}__{density}.v2.json"
            atomic_write_json(path, trace)
            traces.append({
                "epoch": epoch,
                "density": density,
                "path": str(path),
                "sha256": sha256_file(path),
                "event_count": trace["event_count"],
                "silence_segment_count": trace["silence_segment_count"],
                "machine_verdict": trace["machine_verdict"],
            })
    index = {
        "schema": "project-studio-four-hour-density-simulations/v2",
        "created_at": CREATED_AT,
        "status": "PROTOTYPE_ONLY",
        "source_register": {"path": str(REGISTER), "sha256": sha256_file(REGISTER)},
        "trace_count": len(traces),
        "duration_seconds_each": DURATION_SECONDS,
        "epochs": list(EPOCHS),
        "densities": list(DENSITY_GAPS),
        "traces": traces,
        "machine_verdict": "PASS" if len(traces) == 12 and all(row["machine_verdict"] == "PASS" for row in traces) else "FAIL",
        "human_fatigue_disposition": "PENDING",
    }
    atomic_write_json(INDEX, index)
    return index


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    output = build()
    if args.self_test:
        assert output["trace_count"] == 12
        assert output["machine_verdict"] == "PASS"
    print(json.dumps({"path": str(INDEX), "sha256": sha256_file(INDEX), "trace_count": output["trace_count"], "machine_verdict": output["machine_verdict"]}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
