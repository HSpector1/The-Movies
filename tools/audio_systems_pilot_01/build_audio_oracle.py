#!/usr/bin/env python3
"""Verify the Unity-observed Audio Oracle suite; never author trace events."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any

from common import DOC_REPO, PILOT_ROOT, canonical_contained, probe_audio, sha256_file


UNITY_REPO = Path("/Users/bruce/Project Studio - Audio Systems Pilot 01 Client")
SUITE_PATH = PILOT_ROOT / "07_audio-oracle/AUDIO-ORACLE-SUITE.v1.json"
SYSTEM_REGISTER = PILOT_ROOT / "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v5.json"
RUNTIME_OBSERVATIONS = PILOT_ROOT / "09_unity-lab/RuntimeEvidence/audio-oracle-runtime-observations.json"
PLAYLIST_SUITE = PILOT_ROOT / "02_music-bundles/simulations/FOUR-HOUR-DENSITY-SIMULATIONS.v2.json"

EXPECTED_SCENARIOS = (
    "early_era_normal",
    "mid_era_active",
    "modern_era_blocked",
    "normal_to_active_phrase_boundary_transition",
    "active_to_blocked_hysteresis",
    "adjacent_era_transition",
    "workspace_continuity_without_restart",
    "radio_voice_ducking",
    "pa_interrupting_radio",
    "music_off_with_living_ambience",
    "force_mono",
    "night_mix",
    "pause_resume",
    "simulated_device_reset",
    "four_x_simulation_unchanged_pitch_tempo",
    "four_hour_anti_repeat_trace",
    "missing_file_fail_closed",
    "deterministic_replay",
)


def git_head(repo: Path) -> str:
    return subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=repo, check=True, capture_output=True, text=True
    ).stdout.strip()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def load_verified(record: dict[str, Any], *, schema: str | None = None) -> tuple[Path, dict[str, Any]]:
    path = canonical_contained(PILOT_ROOT, Path(record["path"]))
    require(sha256_file(path) == record["sha256"], f"hash mismatch: {path}")
    payload = json.loads(path.read_text(encoding="utf-8"))
    if schema is not None:
        require(payload.get("schema") == schema, f"schema mismatch: {path}")
    return path, payload


def assertions_pass(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, dict):
        return all(assertions_pass(child) for child in value.values())
    if isinstance(value, list):
        return all(assertions_pass(child) for child in value)
    return True


def verify() -> dict[str, Any]:
    suite = json.loads(SUITE_PATH.read_text(encoding="utf-8"))
    require(suite.get("schema") == "project-studio-audio-oracle-suite/v1", "unexpected Oracle suite schema")
    require(suite.get("status") == "PROTOTYPE_ONLY", "Oracle status exceeds prototype boundary")
    require(suite.get("machine_verdict") == "PASS", "Oracle suite did not pass")
    require(suite.get("required_scenario_count") == 18, "Oracle required scenario count is not 18")
    require(suite.get("scenario_count") == len(suite.get("scenarios", [])) >= 18, "Oracle scenario cardinality mismatch")
    require(tuple(suite.get("required_scenarios", [])) == EXPECTED_SCENARIOS, "Oracle required scenario identities/order mismatch")
    source_shas = suite.get("source_git_shas", {})
    require(source_shas.get("documentation") == git_head(DOC_REPO), "Oracle documentation SHA is stale")
    require(source_shas.get("unity_lab") == git_head(UNITY_REPO), "Oracle Unity SHA is stale")

    binary = canonical_contained(PILOT_ROOT, Path(suite["lab_binary"]["path"]))
    require(binary.is_file() and sha256_file(binary) == suite["lab_binary"]["sha256"], "Oracle binary identity mismatch")
    require(suite["catalogue"]["path"] == str(SYSTEM_REGISTER), "Oracle does not bind the v5 system register")
    require(sha256_file(SYSTEM_REGISTER) == suite["catalogue"]["sha256"], "Oracle catalogue identity mismatch")
    _, observations = load_verified(suite["runtime_observations"], schema="project-studio-audio-oracle-runtime-observations/v1")
    require(suite["runtime_observations"]["path"] == str(RUNTIME_OBSERVATIONS), "Oracle runtime-observation path mismatch")
    require(observations.get("observation_source") == "UNITY_RUNTIME", "Oracle observations are not labelled Unity runtime")

    scenario_names: list[str] = []
    required_names: list[str] = []
    capture_count = 0
    force_mono_channels = None
    for row in suite["scenarios"]:
        scenario = row["scenario"]
        scenario_names.append(scenario)
        if row.get("required"):
            required_names.append(scenario)
        _, trace = load_verified(row["trace"], schema="project-studio-audio-oracle-trace/v1")
        require(trace.get("scenario") == scenario, f"trace scenario mismatch: {scenario}")
        require(trace.get("observation_source") == "UNITY_RUNTIME", f"trace is not runtime-observed: {scenario}")
        require(trace.get("machine_verdict") == "PASS", f"trace failed: {scenario}")
        require(assertions_pass(trace.get("assertions", {})), f"trace assertion failed: {scenario}")
        capture = row.get("capture")
        if capture:
            capture_path = canonical_contained(PILOT_ROOT, Path(capture["path"]))
            require(sha256_file(capture_path) == capture["sha256"], f"capture hash mismatch: {scenario}")
            actual_probe = probe_audio(capture_path)
            require(actual_probe == capture["probe"], f"capture probe mismatch: {scenario}")
            capture_count += 1
            if scenario == "force_mono":
                force_mono_channels = actual_probe["channels"]
    require(len(scenario_names) == len(set(scenario_names)), "duplicate Oracle scenario")
    require(tuple(required_names) == EXPECTED_SCENARIOS, "required Oracle scenario rows mismatch")
    require(capture_count >= 2 and force_mono_channels == 1, "runtime PCM capture coverage or mono proof missing")

    playlist_record = suite["four_hour_density_simulations"]
    _, playlist = load_verified(playlist_record, schema="project-studio-four-hour-density-simulations/v2")
    require(playlist_record["path"] == str(PLAYLIST_SUITE), "Oracle long-session suite path mismatch")
    require(playlist.get("trace_count") == 12 and playlist.get("machine_verdict") == "PASS", "four-hour suite incomplete")
    for row in playlist["traces"]:
        path = canonical_contained(PILOT_ROOT, Path(row["path"]))
        require(sha256_file(path) == row["sha256"], f"four-hour child trace mismatch: {path}")

    return {
        "machine_verdict": "PASS",
        "suite_path": str(SUITE_PATH),
        "suite_sha256": sha256_file(SUITE_PATH),
        "required_scenarios": 18,
        "total_scenarios": len(scenario_names),
        "runtime_pcm_captures": capture_count,
        "documentation_sha": source_shas["documentation"],
        "unity_sha": source_shas["unity_lab"],
        "limitations": "Machine proof does not equal listening acceptance.",
    }


def main() -> None:
    print(json.dumps(verify(), indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
