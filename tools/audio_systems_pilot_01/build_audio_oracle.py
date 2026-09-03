#!/usr/bin/env python3
"""Verify the scenario-labelled Unity Audio Oracle suite; never author trace events."""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import math
import re
import struct
import subprocess
import tempfile
import wave
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from common import DOC_REPO, PILOT_ROOT, canonical_contained, probe_audio, sha256_file
from build_accessibility_renders_v4 import verify as verify_accessibility_renders


UNITY_REPO = Path("/Users/bruce/Project Studio - Audio Systems Pilot 01 Client")
SUITE_PATH = PILOT_ROOT / "07_audio-oracle/AUDIO-ORACLE-SUITE.v1.json"
SYSTEM_REGISTER = PILOT_ROOT / "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v5.json"
RUNTIME_OBSERVATIONS = PILOT_ROOT / "09_unity-lab/RuntimeEvidence/audio-oracle-runtime-observations.json"
PLAYMODE_RESULTS = PILOT_ROOT / "09_unity-lab/TestResults/playmode-final.xml"
UNITY_PROJECT_VERSION = UNITY_REPO / "ProjectSettings/ProjectVersion.txt"
PLAYLIST_SUITE = PILOT_ROOT / "02_music-bundles/simulations/FOUR-HOUR-DENSITY-SIMULATIONS.v2.json"
RADIO_RUNTIME_INDEX = PILOT_ROOT / "06_radio/STUDIO-RADIO-RUNTIME-INDEX.v2.json"

RUNTIME_OBSERVATION_SCHEMA = "project-studio-audio-oracle-runtime-observations/v2"
RUNTIME_OBSERVATION_TEST_ID = "RuntimeOracleObservesSchedulingCancellationLifecycleAndSpeed"
RUNTIME_OBSERVATION_TEST_FULL_NAME = (
    "ProjectStudio.AudioLab.Tests.PlayMode.AudioLabPlayModeTests."
    "RuntimeOracleObservesSchedulingCancellationLifecycleAndSpeed"
)
RUNTIME_OBSERVATION_NONCE_LINE_COUNT = 2
RUNTIME_OBSERVATION_BOUNDARY = (
    "UNITY_BATCH_PLAYMODE_SYNTHETIC_IN_MEMORY_AUDIO_SOURCE_DSP_CLOCK;"
    "NO_PLAYER_LAUNCH;NO_EXTERNAL_CUE_SOURCE_SCHEDULED"
)
SYNTHETIC_TRANSPORT_SOURCE = "SYNTHETIC_IN_MEMORY_CLIP:oracle-a"
SYNTHETIC_PENDING_SOURCE = "SYNTHETIC_IN_MEMORY_CLIP:oracle-b"
SYNTHETIC_CROSSFADE_SOURCE = "SYNTHETIC_IN_MEMORY_CLIP:oracle-b-retry"
SYNTHETIC_PHRASE_SOURCE = "SYNTHETIC_IN_MEMORY_CLIP:oracle-c-synthetic-grid"
EXPECTED_RUNTIME_SOURCE_IDS = {
    "transport_scheduling_source_id": SYNTHETIC_TRANSPORT_SOURCE,
    "pending_cancellation_source_id": SYNTHETIC_PENDING_SOURCE,
    "cancellation_continuity_source_id": SYNTHETIC_TRANSPORT_SOURCE,
    "safe_crossfade_source_id": SYNTHETIC_CROSSFADE_SOURCE,
    "phrase_boundary_scheduling_source_id": SYNTHETIC_PHRASE_SOURCE,
    "pause_lifecycle_source_id": SYNTHETIC_CROSSFADE_SOURCE,
    "device_reset_lifecycle_source_id": SYNTHETIC_CROSSFADE_SOURCE,
    "speed_observation_source_id": SYNTHETIC_CROSSFADE_SOURCE,
}
EXPECTED_RUNTIME_FLAGS = (
    "transport_scheduling_observed",
    "safe_crossfade_observed",
    "phrase_boundary_scheduling_observed",
    "cursor_continuous_cancellation_observed",
    "pause_offset_preserved_observed",
    "device_reset_offset_preserved_observed",
    "four_times_pitch_one_observed",
)
TIMING_PURE_POLICY = "PURE_POLICY_AUTHORED_TRACE_COORDINATE"
TIMING_PURE_PLANNER = "PURE_PLANNER_AUTHORED_TRACE_COORDINATE"
TIMING_SYNTHETIC_SEQUENCE = "SYNTHETIC_OBSERVATION_AUTHORED_SEQUENCE_COORDINATE;NO_OBSERVED_DSP_TIMESTAMP"
TIMING_FROZEN_SIMULATION = "FROZEN_TRACE_SUMMARY_AUTHORED_SEQUENCE_COORDINATE;NOT_PLAYBACK_TIMESTAMP"
TIMING_OFFLINE_RENDER = "DETERMINISTIC_OFFLINE_RENDER_SAMPLE_COORDINATE"
TIMING_RUNTIME_DSP = "RUNTIME_DSP_CLOCK_RELATIVE_OBSERVATION"

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
SUPPLEMENTAL_SCENARIOS = (
    "authority_compatibility_1940_normal",
    "save_load_across_era_compatibility",
)
EXPECTED_ALL_SCENARIOS = (*EXPECTED_SCENARIOS, *SUPPLEMENTAL_SCENARIOS)
EXPECTED_FALLBACKS = {scenario: False for scenario in EXPECTED_ALL_SCENARIOS}
EVIDENCE_SOURCES = {
    **{scenario: "UNITY_BATCH_PURE_POLICY_OR_SCHEDULER_EXECUTION" for scenario in EXPECTED_ALL_SCENARIOS},
    "early_era_normal": "UNITY_BATCH_EXTERNAL_POLICY_REFERENCE_PLUS_SYNTHETIC_IN_MEMORY_PLAYMODE_OBSERVATION",
    "normal_to_active_phrase_boundary_transition": "UNITY_BATCH_EXTERNAL_POLICY_REFERENCE_PLUS_SYNTHETIC_IN_MEMORY_PLAYMODE_OBSERVATION",
    "pause_resume": "UNITY_SYNTHETIC_IN_MEMORY_PLAYMODE_OBSERVATION",
    "simulated_device_reset": "UNITY_SYNTHETIC_IN_MEMORY_PLAYMODE_OBSERVATION",
    "four_x_simulation_unchanged_pitch_tempo": "UNITY_SYNTHETIC_IN_MEMORY_PLAYMODE_OBSERVATION",
    "force_mono": "UNITY_EDITOR_OFFLINE_OUTPUT_PROCESSOR_MARKER_RENDER",
    "night_mix": "UNITY_EDITOR_OFFLINE_OUTPUT_PROCESSOR_MARKER_RENDER",
    "four_hour_anti_repeat_trace": "FROZEN_EXTERNAL_TRACE_REVALIDATED_IN_UNITY_BATCH",
    "missing_file_fail_closed": "UNITY_BATCH_EXTERNAL_FILE_VALIDATOR_EXECUTION",
}
CAPTURE_SCENARIOS = {"force_mono", "night_mix"}
REQUIRED_EVENT_TYPES = {
    "early_era_normal": {
        "EXTERNAL_CUE_DECISION_POLICY_ONLY",
        "SYNTHETIC_IN_MEMORY_TRANSPORT_SCHEDULE_OBSERVED",
        "SYNTHETIC_IN_MEMORY_PENDING_TRANSITION_CANCELLATION_OBSERVED",
        "SYNTHETIC_IN_MEMORY_SAFE_CROSSFADE_OBSERVED",
    },
    "mid_era_active": {"EXTERNAL_CUE_DECISION_POLICY_ONLY"},
    "modern_era_blocked": {"EXTERNAL_CUE_DECISION_POLICY_ONLY"},
    "normal_to_active_phrase_boundary_transition": {
        "EXTERNAL_CUE_PHRASE_POLICY_ONLY",
        "SYNTHETIC_IN_MEMORY_PHRASE_SCHEDULE_OBSERVED",
    },
    "active_to_blocked_hysteresis": {"HYSTERESIS_REFUSAL", "HYSTERESIS_ACCEPTANCE"},
    "adjacent_era_transition": {"ADJACENT_RENDER_ACCEPTED"},
    "workspace_continuity_without_restart": {"KEEP_CURRENT"},
    "radio_voice_ducking": {
        "REGISTERED_RADIO_VOICE_TARGET_PENDING_RUNTIME_SCHEDULE",
        "SCORE_DUCK_POLICY_TARGET",
    },
    "pa_interrupting_radio": {
        "REGISTERED_PA_VOICE_TARGET_PENDING_RUNTIME_SCHEDULE",
        "SCORE_DUCK_POLICY_TARGET",
        "RADIO_INTERRUPT_POLICY_TARGET_BY_PA",
    },
    "music_off_with_living_ambience": {"MIX_APPLIED"},
    "force_mono": {"MIX_APPLIED"},
    "night_mix": {"MIX_APPLIED"},
    "pause_resume": {
        "SYNTHETIC_IN_MEMORY_PAUSE_CURSOR_CAPTURED",
        "SYNTHETIC_IN_MEMORY_PAUSE_CURSOR_HELD",
        "SYNTHETIC_IN_MEMORY_RESUME_CURSOR_ADVANCED",
    },
    "simulated_device_reset": {
        "SYNTHETIC_IN_MEMORY_DEVICE_RESET_CURSOR_CAPTURED",
        "SYNTHETIC_IN_MEMORY_DEVICE_RESET_CURSOR_RESTORED",
    },
    "four_x_simulation_unchanged_pitch_tempo": {"SYNTHETIC_IN_MEMORY_SIMULATION_SPEED_OBSERVED"},
    "four_hour_anti_repeat_trace": {"DENSITY_SIMULATION_SUMMARY"},
    "missing_file_fail_closed": {"EXTERNAL_SOURCE_VALIDATION"},
    "deterministic_replay": {"REPLAY_A", "REPLAY_B"},
    "authority_compatibility_1940_normal": {"AUTHORITY_REFUSAL"},
    "save_load_across_era_compatibility": {"SAVE_LOAD_PRESENTATION_REEVALUATION"},
}
EXPECTED_EVENT_TYPES = set().union(*REQUIRED_EVENT_TYPES.values()) | {
    "BUS_TARGET_GAIN",
    "FORCE_MONO_POLICY_ENABLED",
    "LIMITED_DYNAMIC_RANGE_POLICY_ENABLED",
    "OFFLINE_RUNTIME_PROCESSOR_PCM_MARKER",
    "SIMULATED_PLAYLIST_SOURCE_ELIGIBLE",
}
EXPECTED_BUSES = {
    "Master", "Score", "RadioMusic", "Ambience", "ActiveSfx",
    "Ui", "RadioVoice", "PaHelp", "MilestoneStings",
}
EVENT_FIELDS = {
    "sequence", "dsp_time", "timing_basis", "event_type", "source_id", "bus", "gain",
    "pitch_scale", "tempo_scale", "detail", "absolute_dsp_diagnostic",
    "requested_dsp_deadline", "scheduler_api_accepted", "first_marker_detected_seconds",
    "marker_correlation", "marker_drift_seconds", "marker_recipe_schema",
    "marker_recipe_sha256", "marker_sample_rate_hz", "marker_input_channels",
    "marker_output_channels", "marker_total_frames", "marker_start_frame",
    "marker_tone_frames", "marker_frequency_hz", "marker_base_left_amplitude",
    "marker_base_right_amplitude", "marker_base_right_phase_radians",
    "marker_night_left_amplitude", "marker_night_left_phase_radians",
    "marker_night_right_amplitude", "marker_night_right_phase_radians",
    "marker_force_mono", "marker_limited_dynamic_range", "marker_processor_order",
    "marker_night_threshold", "marker_night_ratio", "marker_night_makeup",
    "marker_night_clamp_min", "marker_night_clamp_max", "marker_quantization",
    "marker_input_peak", "marker_output_peak",
}
TRACE_FIELDS = {
    "schema", "scenario", "documentation_git_sha", "unity_git_sha", "lab_binary_sha256",
    "catalogue_sha256", "source_audio_sha256", "source_audio_disposition", "fixture_id",
    "calendar_year", "music_epoch_id", "era_transition_phase", "major_milestone_id",
    "owner_domain", "event_id", "receipt_id", "lot_activity", "historical_cultural_review_status",
    "requested_authority", "accepted_authority", "seed", "deterministic_input_projection",
    "selected_cue_id", "selected_variant_id", "requested_context", "selected_context",
    "transition_boundary", "requested_transition_boundary", "replay_projections", "dsp_events",
    "speech_event_ids", "captions", "failure_or_refusal", "exported_mix_path", "capture_path",
    "capture_sha256", "capture_disposition", "crossfade_start_seconds", "crossfade_end_seconds",
    "pause_or_reset_action", "sample_cursor_before", "sample_cursor_during", "sample_cursor_after",
    "source_identities", "assertions", "expected_fallback", "machine_verdict", "listening_limitation",
    "observation_source", "evidence_source",
}
TRACE_SOURCE_IDENTITY_FIELDS = {"source_id", "source_relative_path", "sha256", "evidence_role"}
TRACE_ASSERTION_FIELDS = {"id", "passed", "detail"}
SUITE_FIELDS = {
    "schema", "status", "machine_verdict", "scenario_count", "required_scenario_count",
    "required_scenarios", "source_git_shas", "lab_binary", "catalogue", "runtime_observations",
    "four_hour_density_simulations", "evidence_source_summary", "scenarios", "evidence_boundary",
    "listening_limitation",
}
SUITE_SCENARIO_FIELDS = {
    "number", "scenario", "required", "machine_verdict", "evidence_source", "trace", "capture",
}
ARTIFACT_FIELDS = {"path", "sha256"}
CAPTURE_FIELDS = {"path", "sha256", "evidence_class", "runtime_mix_capture", "probe"}
CAPTURE_PROBE_FIELDS = {"codec", "sample_rate_hz", "channels", "bits_per_sample", "duration_seconds"}
MARKER_EVENT_TYPE = "OFFLINE_RUNTIME_PROCESSOR_PCM_MARKER"
MARKER_STRING_FIELDS = {
    "marker_recipe_schema", "marker_recipe_sha256", "marker_processor_order", "marker_quantization",
}
MARKER_INTEGER_FIELDS = {
    "marker_sample_rate_hz", "marker_input_channels", "marker_output_channels",
    "marker_total_frames", "marker_start_frame", "marker_tone_frames",
}
MARKER_BOOLEAN_FIELDS = {"marker_force_mono", "marker_limited_dynamic_range"}
MARKER_NUMBER_FIELDS = {
    "first_marker_detected_seconds", "marker_correlation", "marker_drift_seconds",
    "marker_frequency_hz", "marker_base_left_amplitude", "marker_base_right_amplitude",
    "marker_base_right_phase_radians", "marker_night_left_amplitude",
    "marker_night_left_phase_radians", "marker_night_right_amplitude",
    "marker_night_right_phase_radians", "marker_night_threshold", "marker_night_ratio",
    "marker_night_makeup", "marker_night_clamp_min", "marker_night_clamp_max",
    "marker_input_peak", "marker_output_peak",
}
MARKER_FIELDS = MARKER_STRING_FIELDS | MARKER_INTEGER_FIELDS | MARKER_BOOLEAN_FIELDS | MARKER_NUMBER_FIELDS
SCHEDULER_ACCEPTED_EVENT_TYPES = {
    "SYNTHETIC_IN_MEMORY_TRANSPORT_SCHEDULE_OBSERVED",
    "SYNTHETIC_IN_MEMORY_PENDING_TRANSITION_CANCELLATION_OBSERVED",
    "SYNTHETIC_IN_MEMORY_SAFE_CROSSFADE_OBSERVED",
    "SYNTHETIC_IN_MEMORY_PHRASE_SCHEDULE_OBSERVED",
}
SPEED_EVENT_TYPE = "SYNTHETIC_IN_MEMORY_SIMULATION_SPEED_OBSERVED"
PLANNER_DEADLINE_EVENT_TYPE = "EXTERNAL_CUE_PHRASE_POLICY_ONLY"
SELECTED_CUE_SCENARIOS = {
    "early_era_normal", "mid_era_active", "modern_era_blocked",
    "normal_to_active_phrase_boundary_transition", "active_to_blocked_hysteresis",
    "workspace_continuity_without_restart", "four_hour_anti_repeat_trace",
    "deterministic_replay", "save_load_across_era_compatibility",
}
SELECTED_VARIANT_SCENARIOS = {
    "early_era_normal", "mid_era_active", "modern_era_blocked",
    "normal_to_active_phrase_boundary_transition", "active_to_blocked_hysteresis",
    "adjacent_era_transition", "workspace_continuity_without_restart",
    "deterministic_replay", "save_load_across_era_compatibility",
}
DECISION_SCENARIO_TARGETS = {
    "early_era_normal": ("acoustic_electrical_1920_1932", "NORMAL"),
    "mid_era_active": ("format_plurality_1975_1986", "ACTIVE"),
    "modern_era_blocked": ("streaming_plural_2015_2029", "BLOCKED"),
}
REQUIRED_ASSERTION_IDS = {
    "early_era_normal": {
        "EXACT_BUNDLE_ID", "EXACT_VARIANT_ID", "ENTRY_FROM_SILENCE",
        "SYNTHETIC_TRANSPORT_SCHEDULING_OBSERVED_WITH_EXACT_IDENTITY",
        "SYNTHETIC_PENDING_TRANSITION_CANCELLATION_OBSERVED_WITH_EXACT_IDENTITIES",
        "SYNTHETIC_SAFE_CROSSFADE_OBSERVED_WITH_EXACT_IDENTITY",
    },
    "mid_era_active": {"EXACT_BUNDLE_ID", "EXACT_VARIANT_ID", "ENTRY_FROM_SILENCE"},
    "modern_era_blocked": {"EXACT_BUNDLE_ID", "EXACT_VARIANT_ID", "ENTRY_FROM_SILENCE"},
    "normal_to_active_phrase_boundary_transition": {
        "REQUESTED_NEXT_PHRASE", "SYNTHETIC_TRUSTED_GRID_APPLIES_NEXT_PHRASE",
        "SYNTHETIC_NEXT_PHRASE_DEADLINE_IS_EXACT",
        "SYNTHETIC_TRANSPORT_PHRASE_SCHEDULING_OBSERVED_WITH_EXACT_IDENTITY",
    },
    "active_to_blocked_hysteresis": {"BLOCKED_HELD_BEFORE_5S", "BLOCKED_ACCEPTED_AT_5S_AFTER_45S_DWELL"},
    "adjacent_era_transition": {"ERA_TRUTH_NOT_MANUFACTURED", "HONEST_RENDER_TREATMENT"},
    "workspace_continuity_without_restart": {"NO_RESTART"},
    "radio_voice_ducking": {
        "SPEECH_AND_SCORE_DUCK_POLICY_TARGETS_EXPLICIT",
        "VOICE_DUCK_POLICY_SELECTED",
        "CAPTION_AND_SPOKEN_DERIVE_FROM_TYPED_PAYLOAD",
    },
    "pa_interrupting_radio": {
        "SPEECH_AND_SCORE_DUCK_POLICY_TARGETS_EXPLICIT",
        "PA_INTERRUPTION_POLICY_DISPOSITION_EXPLICIT",
        "PA_INTERRUPT_POLICY_SELECTED",
        "CAPTION_AND_SPOKEN_DERIVE_FROM_TYPED_PAYLOAD",
    },
    "music_off_with_living_ambience": {"EXPLICIT_SCORE_AND_AMBIENCE_BUS_TARGET_EVENTS", "MUSIC_OFF_AMBIENCE_REMAINS"},
    "force_mono": {"EXPLICIT_SCORE_AND_AMBIENCE_BUS_TARGET_EVENTS", "FORCE_MONO_ENABLED", "PCM_MARKER_DETECTED_WITHIN_ONE_FRAME", "OFFLINE_RUNTIME_FORCE_MONO_CHANNEL_EQUALITY"},
    "night_mix": {"EXPLICIT_SCORE_AND_AMBIENCE_BUS_TARGET_EVENTS", "NIGHT_LIMITER_ENABLED", "PCM_MARKER_DETECTED_WITHIN_ONE_FRAME", "OFFLINE_RUNTIME_NIGHT_PEAK_REDUCTION"},
    "pause_resume": {
        "PAUSE_CURSOR_HELD_WITHIN_256_SAMPLES", "RESUME_CURSOR_ADVANCED_FROM_PRESERVED_OFFSET",
        "SYNTHETIC_LIFECYCLE_OBSERVATION_EXACT_IDENTITY", "RUNTIME_SAMPLE_CURSOR_PRESERVATION_OBSERVED",
    },
    "simulated_device_reset": {
        "DEVICE_RESET_CURSOR_NOT_RESTARTED", "SYNTHETIC_LIFECYCLE_OBSERVATION_EXACT_IDENTITY",
        "RUNTIME_SAMPLE_CURSOR_PRESERVATION_OBSERVED",
    },
    "four_x_simulation_unchanged_pitch_tempo": {
        "PITCH_TEMPO_SCALES_REMAIN_ONE", "PITCH_TEMPO_EVENT_FIELDS_EXPLICIT",
        "UNITY_SOURCE_PITCH_ONE_OBSERVED_WITH_EXACT_SYNTHETIC_IDENTITY",
    },
    "four_hour_anti_repeat_trace": {"FOUR_HOUR_MANIFEST_SCHEMA", "TWELVE_FIXED_EPOCH_DENSITY_TRACES"},
    "missing_file_fail_closed": {"MISSING_FILE_FAILS_CLOSED"},
    "deterministic_replay": {"COMPLETE_DECISION_OUTPUT_PROJECTION_IDENTICAL"},
    "authority_compatibility_1940_normal": {"P13_TRUTH_BOUNDARY_PRESERVED"},
    "save_load_across_era_compatibility": {"NO_AUTHORITATIVE_CUE_STATE_LOADED"},
}


def git_head(repo: Path) -> str:
    return subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=repo, check=True, capture_output=True, text=True
    ).stdout.strip()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def reject_duplicate_json_keys(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise RuntimeError(f"duplicate JSON object key: {key}")
        result[key] = value
    return result


def strict_json_loads(payload: str, label: str) -> Any:
    try:
        return json.loads(payload, object_pairs_hook=reject_duplicate_json_keys)
    except json.JSONDecodeError as error:
        raise RuntimeError(f"malformed JSON: {label}") from error


def strict_json_file(path: Path) -> Any:
    return strict_json_loads(path.read_text(encoding="utf-8"), str(path))


def pilot_path(value: str) -> Path:
    candidate = Path(value)
    if not candidate.is_absolute():
        candidate = PILOT_ROOT / candidate
    return canonical_contained(PILOT_ROOT, candidate)


def scoped_oracle_path(value: str, required_root: str) -> Path:
    relative = Path(value)
    require(not relative.is_absolute() and ".." not in relative.parts, f"Oracle artifact path is not a safe relative path: {value}")
    exact_root = (PILOT_ROOT / required_root).resolve(strict=True)
    path = canonical_contained(exact_root, PILOT_ROOT / relative)
    return path


def load_verified(record: dict[str, Any], *, schema: str | None = None, required_root: str | None = None) -> tuple[Path, dict[str, Any]]:
    path = scoped_oracle_path(record["path"], required_root) if required_root else pilot_path(record["path"])
    require(sha256_file(path) == record["sha256"], f"hash mismatch: {path}")
    payload = strict_json_file(path)
    if schema is not None:
        require(payload.get("schema") == schema, f"schema mismatch: {path}")
    return path, payload


def trace_assertions_pass(value: Any) -> bool:
    return (
        isinstance(value, list)
        and bool(value)
        and all(isinstance(row, dict) and set(row) == TRACE_ASSERTION_FIELDS
                and nonempty_string(row.get("id")) and row.get("passed") is True
                and nonempty_string(row.get("detail")) for row in value)
    )


def nonempty_string(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def bus_is(event: dict[str, Any], expected: str) -> bool:
    return event.get("bus") == expected


def near(value: Any, expected: float, tolerance: float = 1e-5) -> bool:
    return (isinstance(value, (int, float)) and not isinstance(value, bool)
            and math.isfinite(float(value)) and abs(float(value) - expected) <= tolerance)


def expected_event_timing_basis(event_type: str) -> str:
    if event_type.startswith("SYNTHETIC_IN_MEMORY_"):
        return TIMING_SYNTHETIC_SEQUENCE
    if event_type == "EXTERNAL_CUE_PHRASE_POLICY_ONLY":
        return TIMING_PURE_PLANNER
    if event_type == "OFFLINE_RUNTIME_PROCESSOR_PCM_MARKER":
        return TIMING_OFFLINE_RENDER
    if event_type in {"DENSITY_SIMULATION_SUMMARY", "SIMULATED_PLAYLIST_SOURCE_ELIGIBLE"}:
        return TIMING_FROZEN_SIMULATION
    return TIMING_PURE_POLICY


def verify_event_timing_claim(event: dict[str, Any], scenario: str) -> None:
    event_type = event.get("event_type")
    require(nonempty_string(event_type), f"trace DSP event type missing: {scenario}")
    require(event.get("timing_basis") == expected_event_timing_basis(event_type),
            f"trace timing basis is absent or overstated: {scenario}:{event_type}")
    deadline = event.get("requested_dsp_deadline")
    require(deadline is None or (isinstance(deadline, (int, float)) and not isinstance(deadline, bool)
            and math.isfinite(float(deadline)) and float(deadline) >= 0.0),
            f"trace DSP deadline is invalid: {scenario}")
    if event_type == PLANNER_DEADLINE_EVENT_TYPE:
        require(deadline is not None,
                f"planner event omits its computed DSP deadline: {scenario}:{event_type}")
    else:
        require(deadline is None,
                f"non-planner event must not claim an unrecorded DSP deadline: {scenario}:{event_type}")
    if event.get("timing_basis") != TIMING_RUNTIME_DSP:
        require(event.get("absolute_dsp_diagnostic") is None,
                f"authored/non-runtime event must not claim an observed absolute DSP diagnostic: {scenario}:{event_type}")


def verify_event_contract(event: dict[str, Any], scenario: str) -> None:
    require(isinstance(event, dict) and set(event) == EVENT_FIELDS,
            f"trace DSP event fields are not exact: {scenario}:{event.get('event_type') if isinstance(event, dict) else '<not-object>'}")
    event_type = event.get("event_type")
    require(event_type in EXPECTED_EVENT_TYPES, f"trace DSP event type is not recognized: {scenario}:{event_type}")
    require(isinstance(event.get("bus"), str) and event["bus"] in EXPECTED_BUSES,
            f"trace DSP bus must be an exact serialized name: {scenario}:{event_type}")
    expected_scheduler_acceptance = event_type in SCHEDULER_ACCEPTED_EVENT_TYPES
    require(event.get("scheduler_api_accepted") is expected_scheduler_acceptance,
            f"trace scheduler/API acceptance classification is not exact: {scenario}:{event_type}")

    if event_type == SPEED_EVENT_TYPE:
        require(near(event.get("pitch_scale"), 1.0) and near(event.get("tempo_scale"), 1.0),
                f"speed observation does not carry exact unity pitch/tempo scales: {scenario}")
    else:
        require(event.get("pitch_scale") is None and event.get("tempo_scale") is None,
                f"non-speed event carries pitch/tempo diagnostics: {scenario}:{event_type}")

    if event_type == MARKER_EVENT_TYPE:
        for field in MARKER_STRING_FIELDS:
            require(nonempty_string(event.get(field)), f"marker string field is malformed: {scenario}:{field}")
        for field in MARKER_INTEGER_FIELDS:
            require(isinstance(event.get(field), int) and not isinstance(event.get(field), bool),
                    f"marker integer field is malformed: {scenario}:{field}")
        for field in MARKER_BOOLEAN_FIELDS:
            require(isinstance(event.get(field), bool), f"marker boolean field is malformed: {scenario}:{field}")
        for field in MARKER_NUMBER_FIELDS:
            value = event.get(field)
            require(isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(float(value)),
                    f"marker numeric field is malformed: {scenario}:{field}")
    else:
        require(all(event.get(field) is None for field in MARKER_FIELDS),
                f"non-marker event carries marker-only evidence: {scenario}:{event_type}")

    verify_event_timing_claim(event, scenario)


def verify_source_identity_shape(identity: Any, scenario: str) -> None:
    require(isinstance(identity, dict) and set(identity) == TRACE_SOURCE_IDENTITY_FIELDS
            and nonempty_string(identity.get("source_id"))
            and nonempty_string(identity.get("source_relative_path"))
            and isinstance(identity.get("sha256"), str)
            and re.fullmatch(r"[0-9a-f]{64}", identity["sha256"]) is not None
            and nonempty_string(identity.get("evidence_role")),
            f"trace source identity incomplete or non-canonical: {scenario}")


def verify_suite_schema_shape(suite: Any) -> None:
    require(isinstance(suite, dict) and set(suite) == SUITE_FIELDS,
            "Oracle suite top-level fields are not exact")
    source_shas = suite.get("source_git_shas")
    require(isinstance(source_shas, dict) and set(source_shas) == {"documentation", "unity_audio_lab"},
            "Oracle source-Git identity fields are not exact")
    for artifact_name in ("lab_binary", "catalogue", "runtime_observations", "four_hour_density_simulations"):
        artifact = suite.get(artifact_name)
        require(isinstance(artifact, dict) and set(artifact) == ARTIFACT_FIELDS,
                f"Oracle suite artifact fields are not exact: {artifact_name}")
    scenarios = suite.get("scenarios")
    require(isinstance(scenarios, list), "Oracle suite scenario rows are not a list")
    for index, row in enumerate(scenarios, start=1):
        require(isinstance(row, dict) and set(row) == SUITE_SCENARIO_FIELDS,
                f"Oracle scenario-row fields are not exact: {index}")
        require(isinstance(row.get("trace"), dict) and set(row["trace"]) == ARTIFACT_FIELDS,
                f"Oracle trace-artifact fields are not exact: {index}")
        capture = row.get("capture")
        require(capture is None or (
            isinstance(capture, dict) and set(capture) == CAPTURE_FIELDS
            and isinstance(capture.get("probe"), dict)
            and set(capture["probe"]) == CAPTURE_PROBE_FIELDS
        ), f"Oracle capture fields are not exact: {index}")


def parse_utc(value: Any, label: str) -> datetime:
    require(isinstance(value, str) and value.endswith("Z"), f"{label} must be an explicit UTC timestamp")
    try:
        parsed = datetime.fromisoformat(value[:-1] + "+00:00")
    except ValueError as error:
        raise RuntimeError(f"{label} is not parseable: {value}") from error
    require(parsed.tzinfo is not None and parsed.utcoffset() == timezone.utc.utcoffset(parsed),
            f"{label} is not UTC: {value}")
    return parsed.astimezone(timezone.utc)


def unity_project_version() -> str:
    rows = [line.removeprefix("m_EditorVersion: ").strip()
            for line in UNITY_PROJECT_VERSION.read_text(encoding="utf-8").splitlines()
            if line.startswith("m_EditorVersion: ")]
    require(len(rows) == 1 and nonempty_string(rows[0]), "Unity ProjectVersion has no unique editor version")
    return rows[0]


def verify_runtime_observations(
    observations: dict[str, Any],
    playmode_xml: str,
    *,
    expected_unity_sha: str,
    expected_unity_version: str,
) -> dict[str, Any]:
    expected_keys = {
        "schema", *EXPECTED_RUNTIME_FLAGS, *EXPECTED_RUNTIME_SOURCE_IDS,
        "sample_before_cancellation", "sample_after_cancellation",
        "sample_before_pause", "sample_during_pause", "sample_after_resume",
        "sample_before_reset", "sample_after_reset", "evidence_boundary",
        "unity_git_sha", "unity_version", "run_nonce", "generated_utc", "test_id",
        "observation_source",
    }
    require(set(observations) == expected_keys, "runtime-observation v2 fields are not exact")
    require(observations.get("schema") == RUNTIME_OBSERVATION_SCHEMA,
            "runtime-observation schema is not v2")
    require(observations.get("observation_source") == "UNITY_PLAYMODE_OBSERVATION",
            "runtime observations are not labelled Unity PlayMode evidence")
    require(observations.get("evidence_boundary") == RUNTIME_OBSERVATION_BOUNDARY,
            "runtime-observation evidence boundary is not exact")
    require(observations.get("unity_git_sha") == expected_unity_sha,
            "runtime-observation Unity SHA is stale")
    require(observations.get("unity_version") == expected_unity_version,
            "runtime-observation Unity version differs from ProjectVersion")
    require(observations.get("test_id") == RUNTIME_OBSERVATION_TEST_ID,
            "runtime-observation test identity is not exact")
    require(all(observations.get(field) is True for field in EXPECTED_RUNTIME_FLAGS),
            "one or more required runtime observations are false")
    require(all(observations.get(field) == expected for field, expected in EXPECTED_RUNTIME_SOURCE_IDS.items()),
            "runtime-observation synthetic source identity mismatch")

    sample_fields = (
        "sample_before_cancellation", "sample_after_cancellation",
        "sample_before_pause", "sample_during_pause", "sample_after_resume",
        "sample_before_reset", "sample_after_reset",
    )
    samples = {field: observations.get(field) for field in sample_fields}
    require(all(isinstance(value, int) and not isinstance(value, bool) and 0 < value < 480_000
                for value in samples.values()), "runtime-observation sample cursor is malformed/outside the 10-second fixture")
    require(samples["sample_before_cancellation"] > 0
            and samples["sample_after_cancellation"] >= samples["sample_before_cancellation"],
            "pending-transition cancellation did not preserve the playing synthetic cursor")
    require(samples["sample_before_pause"] > 0
            and abs(samples["sample_during_pause"] - samples["sample_before_pause"]) <= 256
            and samples["sample_after_resume"] > samples["sample_during_pause"],
            "pause/resume sample relationship is invalid")
    require(samples["sample_before_reset"] == samples["sample_after_resume"]
            and samples["sample_after_reset"] >= samples["sample_before_reset"],
            "device-reset sample relationship is invalid")

    nonce = observations.get("run_nonce")
    require(isinstance(nonce, str) and re.fullmatch(r"[0-9a-f]{32}", nonce) is not None,
            "runtime-observation nonce is not an exact lowercase Guid-N identity")
    generated = parse_utc(observations.get("generated_utc"), "runtime-observation generated_utc")
    try:
        root = ET.fromstring(playmode_xml)
    except ET.ParseError as error:
        raise RuntimeError("PlayMode result XML is malformed") from error
    total = root.attrib.get("total")
    require(root.tag == "test-run" and root.attrib.get("result") == "Passed"
            and total is not None and total.isdigit() and int(total) > 0
            and root.attrib.get("testcasecount") == total
            and root.attrib.get("passed") == total
            and root.attrib.get("failed") == "0"
            and root.attrib.get("inconclusive") == "0"
            and root.attrib.get("skipped") == "0",
            "PlayMode test run did not pass")
    matches = [node for node in root.iter("test-case")
               if node.attrib.get("methodname") == RUNTIME_OBSERVATION_TEST_ID
               and node.attrib.get("fullname") == RUNTIME_OBSERVATION_TEST_FULL_NAME]
    require(len(matches) == 1 and matches[0].attrib.get("result") == "Passed",
            "runtime-observation producer is not one uniquely passed PlayMode testcase")
    testcase = matches[0]
    started = parse_utc(testcase.attrib.get("start-time", "").replace(" ", "T"),
                        "runtime-observation testcase start-time")
    ended = parse_utc(testcase.attrib.get("end-time", "").replace(" ", "T"),
                      "runtime-observation testcase end-time")
    require(started <= generated <= ended,
            "runtime-observation timestamp is not fresh within its producing PlayMode testcase")
    marker = f"AUDIO_ORACLE_RUNTIME_NONCE:{nonce}"
    outputs = testcase.findall("output")
    require(len(outputs) == 1, "runtime-observation producer must have exactly one direct output node")
    output_lines = [line.strip() for line in (outputs[0].text or "").splitlines()]
    require(output_lines.count(marker) == RUNTIME_OBSERVATION_NONCE_LINE_COUNT,
            "runtime-observation nonce exact-line multiplicity differs from the PlayMode producer contract")
    return {
        "run_nonce": nonce,
        "generated_utc": observations["generated_utc"],
        "testcase_start_utc": started.isoformat().replace("+00:00", "Z"),
        "testcase_end_utc": ended.isoformat().replace("+00:00", "Z"),
        "unity_version": expected_unity_version,
        "sample_relationships": "PASS",
        "synthetic_source_identities": len(EXPECTED_RUNTIME_SOURCE_IDS),
    }


def stable_hash(value: str) -> str:
    result = 14_695_981_039_346_656_037
    for character in value:
        result ^= ord(character)
        result = (result * 1_099_511_628_211) & ((1 << 64) - 1)
    return f"{result:016x}"


def parse_canonical_atom(value: str, label: str) -> str:
    length_text, separator, body = value.partition(":")
    require(separator == ":" and length_text.isdigit() and int(length_text) == len(body),
            f"{label} is not an exact canonical length-prefixed atom")
    return body


def canonical_atom(value: str | None) -> str:
    return "-1:" if value is None else f"{len(value)}:{value}"


def canonical_sequence(values: tuple[str, ...]) -> str:
    return f"{len(values)}:" + "".join(canonical_atom(value) for value in values)


RESPONSIVE_FIXTURES = {
    "EARLY": ("ASP01-BUNDLE-EARLY", "acoustic_electrical_1920_1932"),
    "MID": ("ASP01-BUNDLE-MID", "format_plurality_1975_1986"),
    "MODERN": ("ASP01-BUNDLE-MODERN", "streaming_plural_2015_2029"),
}
EXPECTED_DECISION_SEEDS = {
    "early_era_normal": 0xA0D101,
    "mid_era_active": 0xA0D101 + 1,
    "modern_era_blocked": 0xA0D101 + 2,
    "normal_to_active_phrase_boundary_transition": 0xA0D101 + 4,
    "active_to_blocked_hysteresis": 0xA0D101 + 5,
    "workspace_continuity_without_restart": 0xA0D101 + 7,
    "deterministic_replay": 0xA0D101 + 18,
    "save_load_across_era_compatibility": 0xA0D101 + 20,
}


def bundle_projection(fixture: str) -> str:
    bundle_id, alias = RESPONSIVE_FIXTURES[fixture]
    return ",".join((
        canonical_atom(bundle_id), canonical_atom(alias), canonical_atom("HORIZONTAL_VARIANT_BUNDLE"),
        canonical_atom(alias), canonical_atom(bundle_id + "-NORMAL"), canonical_atom(bundle_id + "-ACTIVE"),
        canonical_atom(bundle_id + "-BLOCKED"), canonical_atom(bundle_id + "-WORKSPACE"),
    ))


def decision_input_projection(
    fixture: str,
    seed: int,
    broad_lot_activity: str,
    workspace_depth: int,
    context_stable_seconds: str,
    *,
    current_context: str | None = None,
    current_started_at: str | None = None,
) -> str:
    bundle_id, alias = RESPONSIVE_FIXTURES[fixture]
    current = ("False,-1:,-1:,-1:,Normal,0" if current_context is None else ",".join((
        "True", canonical_atom(bundle_id), canonical_atom(alias),
        canonical_atom(bundle_id + "-" + current_context.upper()), current_context,
        current_started_at or "0",
    )))
    settings = "Balanced,0.8,45,8,5,True,-7,-12"
    return "|".join((
        "audio_presentation_state/v1",
        f"presentation_seed={seed}",
        f"broad_lot_activity={broad_lot_activity}",
        f"workspace_depth={workspace_depth}",
        "speech_owner=None",
        "is_paused=False",
        "has_focus=True",
        "density_window_open=True",
        "now_seconds=100",
        f"context_stable_seconds={context_stable_seconds}",
        "user_settings=" + canonical_atom(settings),
        "current_cue=" + canonical_atom(current),
        "eligibility=" + canonical_sequence((bundle_projection(fixture),)),
        "recent_bundle_ids=0:",
        "recent_families=0:",
    ))


def expected_decision_input_projections(scenario: str) -> dict[str, str]:
    seed = EXPECTED_DECISION_SEEDS[scenario]
    if scenario == "early_era_normal":
        return {"DECISION": decision_input_projection("EARLY", seed, "Idle", 0, "100")}
    if scenario == "mid_era_active":
        return {"DECISION": decision_input_projection("MID", seed, "ActiveProduction", 0, "100")}
    if scenario == "modern_era_blocked":
        return {"DECISION": decision_input_projection("MODERN", seed, "BlockedProduction", 0, "100")}
    if scenario == "normal_to_active_phrase_boundary_transition":
        return {"PHRASE_DECISION": decision_input_projection(
            "EARLY", seed, "ActiveProduction", 0, "8", current_context="Normal", current_started_at="40"
        )}
    if scenario == "active_to_blocked_hysteresis":
        return {
            "BEFORE_HYSTERESIS": decision_input_projection(
                "EARLY", seed, "BlockedProduction", 0, "4.999", current_context="Active", current_started_at="54"
            ),
            "AT_HYSTERESIS": decision_input_projection(
                "EARLY", seed, "BlockedProduction", 0, "5", current_context="Active", current_started_at="54"
            ),
        }
    if scenario == "workspace_continuity_without_restart":
        return {"WORKSPACE_CONTINUITY": decision_input_projection(
            "EARLY", seed, "Idle", 1, "30", current_context="Normal", current_started_at="10"
        )}
    if scenario == "deterministic_replay":
        projection = decision_input_projection("EARLY", seed, "ActiveProduction", 0, "100")
        return {"REPLAY_A": projection, "REPLAY_B": projection}
    if scenario == "save_load_across_era_compatibility":
        return {"SAVE_LOAD_REEVALUATION": decision_input_projection("MODERN", seed, "Idle", 0, "100")}
    raise AssertionError(f"unhandled decision scenario: {scenario}")


def verify_deterministic_input_projection(trace: dict[str, Any], scenario: str) -> dict[str, str]:
    expected_labels = {
        "early_era_normal": ("DECISION",),
        "mid_era_active": ("DECISION",),
        "modern_era_blocked": ("DECISION",),
        "normal_to_active_phrase_boundary_transition": ("PHRASE_DECISION",),
        "active_to_blocked_hysteresis": ("BEFORE_HYSTERESIS", "AT_HYSTERESIS"),
        "workspace_continuity_without_restart": ("WORKSPACE_CONTINUITY",),
        "deterministic_replay": ("REPLAY_A", "REPLAY_B"),
        "save_load_across_era_compatibility": ("SAVE_LOAD_REEVALUATION",),
    }.get(scenario, ())
    raw = trace.get("deterministic_input_projection")
    if not expected_labels:
        require(raw in {None, ""}, f"non-decision trace unexpectedly publishes a decision input: {scenario}")
        return {}
    require(trace.get("seed") == EXPECTED_DECISION_SEEDS[scenario],
            f"decision trace seed differs from the scenario-owned seed: {scenario}")
    require(isinstance(raw, str) and raw, f"decision trace omits deterministic input projection: {scenario}")
    parsed: dict[str, str] = {}
    for line in raw.splitlines():
        label_atom, separator, state_atom = line.partition("=")
        require(separator == "=", f"decision input projection row is malformed: {scenario}")
        label = parse_canonical_atom(label_atom, f"decision input label: {scenario}")
        state = parse_canonical_atom(state_atom, f"decision input state: {scenario}:{label}")
        require(label not in parsed, f"decision input projection label is duplicate: {scenario}:{label}")
        parsed[label] = state
    require(tuple(parsed) == expected_labels, f"decision input projection labels/order mismatch: {scenario}")
    require(parsed == expected_decision_input_projections(scenario),
            f"full deterministic decision input projection differs from its scenario fixture: {scenario}")
    return parsed


def expected_replay_output_projection() -> str:
    bundle_id, alias = RESPONSIVE_FIXTURES["EARLY"]
    return "|".join((
        "audio_presentation_decision/v1",
        "selected_bundle_id=" + canonical_atom(bundle_id),
        "selected_family=" + canonical_atom(alias),
        "selected_variant_id=" + canonical_atom(bundle_id + "-ACTIVE"),
        "selected_context=Active",
        "requested_transition=Entry",
        "requested_boundary=Immediate",
        "target_score_gain=0.8",
        "ducking_active=False",
        "silence=False",
        "keep_current=False",
        "refusal_or_fallback_reason=" + canonical_atom("ENTRY_REQUESTED"),
    ))


def verify_replay_projections(trace: dict[str, Any], decision_inputs: dict[str, str]) -> tuple[str, str]:
    rows = trace.get("replay_projections")
    require(isinstance(rows, list) and len(rows) == 2, "replay typed projection cardinality is not two")
    expected_output = expected_replay_output_projection()
    expected_output_sha = hashlib.sha256(expected_output.encode("utf-8")).hexdigest()
    expected_keys = {
        "label", "seed", "input_projection", "input_projection_sha256",
        "selected_bundle_id", "selected_family", "selected_variant_id", "selected_context",
        "requested_transition", "requested_boundary", "target_score_gain", "ducking_active",
        "silence", "keep_current", "refusal_or_fallback_reason", "output_projection",
        "output_projection_sha256",
    }
    bundle_id, alias = RESPONSIVE_FIXTURES["EARLY"]
    for row, label in zip(rows, ("REPLAY_A", "REPLAY_B")):
        require(isinstance(row, dict) and set(row) == expected_keys,
                f"replay typed projection fields are not exact: {label}")
        expected_input = decision_inputs[label]
        expected_input_sha = hashlib.sha256(expected_input.encode("utf-8")).hexdigest()
        require(row.get("label") == label and row.get("seed") == trace.get("seed")
                and row.get("input_projection") == expected_input
                and row.get("input_projection_sha256") == expected_input_sha,
                f"replay typed input projection is not exact: {label}")
        require(row.get("selected_bundle_id") == bundle_id
                and row.get("selected_family") == alias
                and row.get("selected_variant_id") == bundle_id + "-ACTIVE"
                and row.get("selected_context") == "Active"
                and row.get("requested_transition") == "Entry"
                and row.get("requested_boundary") == "Immediate"
                and near(row.get("target_score_gain"), 0.8)
                and row.get("ducking_active") is False
                and row.get("silence") is False
                and row.get("keep_current") is False
                and row.get("refusal_or_fallback_reason") == "ENTRY_REQUESTED",
                f"replay typed decision fields are not exact: {label}")
        require(row.get("output_projection") == expected_output
                and row.get("output_projection_sha256") == expected_output_sha,
                f"replay canonical output projection/hash is not exact: {label}")
    require(rows[0]["input_projection"] == rows[1]["input_projection"]
            and rows[0]["output_projection"] == rows[1]["output_projection"],
            "replay A/B full typed projections differ")
    return rows[0]["input_projection_sha256"], expected_output_sha


OFFLINE_MARKER_RECIPE_SCHEMA = "project-studio-offline-pcm-marker-recipe/v1"
OFFLINE_MARKER_QUANTIZATION = (
    "RIFF_WAVE_PCM_S16LE_CLAMP_TO_UNIT_MULTIPLY_32767_DOTNET_MATH_ROUND_TO_EVEN"
)
OFFLINE_MARKER_SAMPLE_RATE = 48_000
OFFLINE_MARKER_CHANNELS = 2
OFFLINE_MARKER_TOTAL_FRAMES = 48_000
OFFLINE_MARKER_START_FRAME = 4_800
OFFLINE_MARKER_TONE_FRAMES = 960
OFFLINE_MARKER_FREQUENCY_HZ = 997.0


def f32(value: float) -> float:
    return struct.unpack("<f", struct.pack("<f", value))[0]


def offline_marker_recipe(force_mono: bool, limited_dynamic_range: bool) -> str:
    return ";".join((
        f"schema={OFFLINE_MARKER_RECIPE_SCHEMA}",
        "sample_rate_hz=48000", "input_channels=2", "output_channels=2", "total_frames=48000",
        "marker_start_frame=4800", "marker_tone_frames=960", "frequency_hz=997",
        "phase=2*pi*frequency_hz*(frame-marker_start_frame)/sample_rate_hz",
        "arithmetic=SYSTEM_MATH_SIN_BINARY64_CAST_TO_IEEE754_BINARY32;processor_arithmetic=IEEE754_BINARY32",
        "base_left=sin(phase)*0.9", "base_right=sin(phase+0.3)*0.35",
        f"night_left={'sin(phase+0.08)*0.78' if limited_dynamic_range else '0'}",
        f"night_right={'sin(phase+0.41)*0.62' if limited_dynamic_range else '0'}",
        "processor=AudioLabOutputProcessor.ProcessInPlace",
        "processor_order=force_mono_then_limited_dynamic_range",
        "night_threshold=0.32", "night_ratio=4", "night_makeup=1.08",
        "night_clamp_min=-0.88", "night_clamp_max=0.88",
        f"force_mono={'true' if force_mono else 'false'}",
        f"limited_dynamic_range={'true' if limited_dynamic_range else 'false'}",
        f"quantization={OFFLINE_MARKER_QUANTIZATION}",
    ))


def synthesize_offline_marker(force_mono: bool, limited_dynamic_range: bool) -> tuple[list[float], list[float]]:
    samples = [0.0] * (OFFLINE_MARKER_TOTAL_FRAMES * OFFLINE_MARKER_CHANNELS)
    for frame in range(OFFLINE_MARKER_START_FRAME,
                       OFFLINE_MARKER_START_FRAME + OFFLINE_MARKER_TONE_FRAMES):
        phase = (2.0 * math.pi * OFFLINE_MARKER_FREQUENCY_HZ
                 * (frame - OFFLINE_MARKER_START_FRAME) / OFFLINE_MARKER_SAMPLE_RATE)
        left = f32(math.sin(phase) * 0.9)
        right = f32(math.sin(phase + 0.3) * 0.35)
        if limited_dynamic_range:
            left = f32(left + f32(math.sin(phase + 0.08) * 0.78))
            right = f32(right + f32(math.sin(phase + 0.41) * 0.62))
        samples[frame * 2] = left
        samples[frame * 2 + 1] = right
    input_samples = samples.copy()
    if force_mono:
        for index in range(0, len(samples), 2):
            summed = f32(f32(0.0 + samples[index]) + samples[index + 1])
            average = f32(summed / 2.0)
            samples[index] = average
            samples[index + 1] = average
    if limited_dynamic_range:
        threshold = f32(0.32)
        ratio = f32(4.0)
        makeup = f32(1.08)
        for index, value in enumerate(samples):
            sign = f32(-1.0 if value < 0.0 else 1.0)
            absolute = abs(value)
            compressed = absolute if absolute <= threshold else f32(
                threshold + f32(f32(absolute - threshold) / ratio)
            )
            samples[index] = max(-0.88, min(0.88, f32(f32(sign * compressed) * makeup)))
    return input_samples, samples


def pcm16_wave_bytes(samples: list[float], channels: int = OFFLINE_MARKER_CHANNELS) -> bytes:
    result = bytearray(44 + len(samples) * 2)
    result[0:4] = b"RIFF"
    result[4:8] = struct.pack("<i", len(result) - 8)
    result[8:16] = b"WAVEfmt "
    result[16:20] = struct.pack("<i", 16)
    result[20:22] = struct.pack("<h", 1)
    result[22:24] = struct.pack("<h", channels)
    result[24:28] = struct.pack("<i", OFFLINE_MARKER_SAMPLE_RATE)
    result[28:32] = struct.pack("<i", OFFLINE_MARKER_SAMPLE_RATE * channels * 2)
    result[32:34] = struct.pack("<h", channels * 2)
    result[34:36] = struct.pack("<h", 16)
    result[36:40] = b"data"
    result[40:44] = struct.pack("<i", len(samples) * 2)
    for index, sample in enumerate(samples):
        quantized = round(max(-1.0, min(1.0, sample)) * 32767)
        result[44 + index * 2:46 + index * 2] = struct.pack("<h", quantized)
    return bytes(result)


def decode_pcm16_wave(path: Path) -> tuple[int, int, list[int]]:
    with wave.open(str(path), "rb") as source:
        require(source.getcomptype() == "NONE" and source.getsampwidth() == 2,
                "offline marker capture is not uncompressed PCM16")
        channels = source.getnchannels()
        sample_rate = source.getframerate()
        frames = source.getnframes()
        payload = source.readframes(frames)
        require(source.readframes(1) == b"", "offline marker WAV contains undeclared frames")
    require(len(payload) == frames * channels * 2, "offline marker PCM payload length mismatch")
    samples = list(struct.unpack(f"<{frames * channels}h", payload))
    return sample_rate, channels, samples


def stereo_correlation(samples: list[int]) -> float:
    left = samples[0::2]
    right = samples[1::2]
    xy = sum(first * second for first, second in zip(left, right))
    xx = sum(value * value for value in left)
    yy = sum(value * value for value in right)
    return 0.0 if xx <= 0 or yy <= 0 else xy / math.sqrt(xx * yy)


def measured_tone_frequency(samples: list[int], channels: int) -> float:
    start = OFFLINE_MARKER_START_FRAME
    stop = start + OFFLINE_MARKER_TONE_FRAMES
    magnitudes: dict[int, float] = {}
    for frequency in range(990, 1005):
        real = 0.0
        imaginary = 0.0
        for frame in range(start, stop):
            mono = sum(samples[frame * channels + channel] for channel in range(channels)) / channels
            angle = 2.0 * math.pi * frequency * (frame - start) / OFFLINE_MARKER_SAMPLE_RATE
            real += mono * math.cos(angle)
            imaginary -= mono * math.sin(angle)
        magnitudes[frequency] = real * real + imaginary * imaginary
    return float(max(magnitudes, key=magnitudes.get))


def verify_marker_capture(marker: dict[str, Any], capture_path: Path, scenario: str) -> dict[str, Any]:
    require(scenario in CAPTURE_SCENARIOS, f"unexpected marker scenario: {scenario}")
    force_mono = scenario == "force_mono"
    limited_dynamic_range = scenario == "night_mix"
    recipe = offline_marker_recipe(force_mono, limited_dynamic_range)
    recipe_sha256 = hashlib.sha256(recipe.encode("utf-8")).hexdigest()
    expected_marker_fields: dict[str, Any] = {
        "marker_recipe_schema": OFFLINE_MARKER_RECIPE_SCHEMA,
        "marker_recipe_sha256": recipe_sha256,
        "marker_sample_rate_hz": OFFLINE_MARKER_SAMPLE_RATE,
        "marker_input_channels": OFFLINE_MARKER_CHANNELS,
        "marker_output_channels": OFFLINE_MARKER_CHANNELS,
        "marker_total_frames": OFFLINE_MARKER_TOTAL_FRAMES,
        "marker_start_frame": OFFLINE_MARKER_START_FRAME,
        "marker_tone_frames": OFFLINE_MARKER_TONE_FRAMES,
        "marker_frequency_hz": OFFLINE_MARKER_FREQUENCY_HZ,
        "marker_base_left_amplitude": 0.9,
        "marker_base_right_amplitude": 0.35,
        "marker_base_right_phase_radians": 0.3,
        "marker_night_left_amplitude": 0.78 if limited_dynamic_range else 0.0,
        "marker_night_left_phase_radians": 0.08 if limited_dynamic_range else 0.0,
        "marker_night_right_amplitude": 0.62 if limited_dynamic_range else 0.0,
        "marker_night_right_phase_radians": 0.41 if limited_dynamic_range else 0.0,
        "marker_force_mono": force_mono,
        "marker_limited_dynamic_range": limited_dynamic_range,
        "marker_processor_order": "FORCE_MONO_THEN_LIMITED_DYNAMIC_RANGE",
        "marker_night_threshold": 0.32,
        "marker_night_ratio": 4.0,
        "marker_night_makeup": 1.08,
        "marker_night_clamp_min": -0.88,
        "marker_night_clamp_max": 0.88,
        "marker_quantization": OFFLINE_MARKER_QUANTIZATION,
    }
    for field, expected in expected_marker_fields.items():
        actual = marker.get(field)
        if isinstance(expected, float):
            require(near(actual, expected, 1e-12), f"offline marker recipe field mismatch: {scenario}:{field}")
        else:
            require(actual == expected, f"offline marker recipe field mismatch: {scenario}:{field}")

    input_samples, output_samples = synthesize_offline_marker(force_mono, limited_dynamic_range)
    input_peak = max(abs(value) for value in input_samples)
    output_peak = max(abs(value) for value in output_samples)
    require(near(marker.get("marker_input_peak"), input_peak, 1e-7)
            and near(marker.get("marker_output_peak"), output_peak, 1e-7),
            f"offline marker input/output peak declaration does not match reconstructed recipe: {scenario}")
    expected_bytes = pcm16_wave_bytes(output_samples)
    actual_bytes = capture_path.read_bytes()
    require(actual_bytes == expected_bytes,
            f"offline marker capture bytes do not exactly match the independently reconstructed recipe: {scenario}")

    sample_rate, channels, decoded = decode_pcm16_wave(capture_path)
    require(sample_rate == OFFLINE_MARKER_SAMPLE_RATE and channels == OFFLINE_MARKER_CHANNELS
            and len(decoded) == OFFLINE_MARKER_TOTAL_FRAMES * OFFLINE_MARKER_CHANNELS,
            f"offline marker decoded format is not exact: {scenario}")
    threshold = round(0.02 * 32767)
    onset = next((frame for frame in range(OFFLINE_MARKER_TOTAL_FRAMES)
                  if any(abs(decoded[frame * channels + channel]) > threshold for channel in range(channels))), -1)
    require(onset == OFFLINE_MARKER_START_FRAME,
            f"offline marker decoded onset is not frame {OFFLINE_MARKER_START_FRAME}: {scenario}:{onset}")
    frequency = measured_tone_frequency(decoded, channels)
    require(frequency == OFFLINE_MARKER_FREQUENCY_HZ,
            f"offline marker decoded tone is not 997 Hz: {scenario}:{frequency}")
    decoded_peak = max(abs(value) for value in decoded) / 32767.0
    require(abs(decoded_peak - output_peak) <= 1.0 / 32767.0,
            f"offline marker decoded output peak differs from reconstructed processor output: {scenario}")
    correlation = stereo_correlation(decoded)
    if force_mono:
        maximum_delta = max(abs(left - right) for left, right in zip(decoded[0::2], decoded[1::2]))
        require(maximum_delta == 0 and correlation > 0.999999,
                "Force Mono marker is not independently measured stereo dual mono")
    else:
        maximum_delta = None
        require(input_peak > 1.0 and output_peak <= 0.880001 and output_peak < input_peak * 0.75,
                "Night marker does not independently prove the reconstructed input/output peak relationship")
    require(near(marker.get("first_marker_detected_seconds"), onset / sample_rate, 1.0 / sample_rate)
            and near(marker.get("marker_drift_seconds"), 0.0, 1.0 / sample_rate)
            and near(marker.get("marker_correlation"), correlation, 2.0 / 32767.0),
            f"offline marker trace diagnostics differ from independent PCM measurements: {scenario}")
    return {
        "scenario": scenario,
        "recipe_sha256": recipe_sha256,
        "onset_frame": onset,
        "frequency_hz": frequency,
        "input_peak": input_peak,
        "output_peak": output_peak,
        "decoded_output_peak": decoded_peak,
        "stereo_correlation": correlation,
        "maximum_channel_delta_pcm16": maximum_delta,
    }


def verify_trace_contract(trace: dict[str, Any], scenario: str) -> None:
    require(isinstance(trace, dict) and set(trace) == TRACE_FIELDS,
            f"trace top-level fields are not exact: {scenario}")
    require(nonempty_string(trace.get("fixture_id")), f"trace fixture is missing: {scenario}")
    seed = trace.get("seed")
    require(isinstance(seed, int) and not isinstance(seed, bool) and seed > 0, f"trace seed is not a positive integer: {scenario}")
    require(nonempty_string(trace.get("source_audio_disposition")), f"trace source-audio disposition missing: {scenario}")
    require(isinstance(trace.get("speech_event_ids"), list) and isinstance(trace.get("captions"), list), f"trace speech/caption lists malformed: {scenario}")
    events = trace.get("dsp_events")
    require(isinstance(events, list) and events, f"trace has no DSP events: {scenario}")
    event_types: set[str] = set()
    assertion_ids = {row["id"] for row in trace.get("assertions", [])}
    previous_time = -1.0
    for expected_sequence, event in enumerate(events):
        require(isinstance(event, dict) and event.get("sequence") == expected_sequence, f"trace DSP sequence is not contiguous: {scenario}")
        dsp_time = event.get("dsp_time")
        gain = event.get("gain")
        bus = event.get("bus")
        require(isinstance(dsp_time, (int, float)) and not isinstance(dsp_time, bool)
                and math.isfinite(float(dsp_time)) and float(dsp_time) >= 0.0 and float(dsp_time) >= previous_time,
                f"trace DSP time is invalid or unordered: {scenario}")
        previous_time = float(dsp_time)
        require(nonempty_string(event.get("event_type")) and nonempty_string(event.get("source_id")), f"trace DSP event identity missing: {scenario}")
        event_type = event["event_type"]
        verify_event_contract(event, scenario)
        require(isinstance(bus, str) and bus in EXPECTED_BUSES,
                f"trace DSP bus is invalid: {scenario}")
        require(isinstance(gain, (int, float)) and not isinstance(gain, bool)
                and math.isfinite(float(gain)) and 0.0 <= float(gain) <= 1.0,
                f"trace DSP gain is invalid: {scenario}")
        require(nonempty_string(event.get("detail")), f"trace DSP detail is missing: {scenario}")
        require(isinstance(event.get("scheduler_api_accepted"), bool), f"trace scheduler acceptance is not boolean: {scenario}")
        absolute_dsp = event.get("absolute_dsp_diagnostic")
        require(absolute_dsp is None or (isinstance(absolute_dsp, (int, float)) and not isinstance(absolute_dsp, bool)
                and math.isfinite(float(absolute_dsp)) and float(absolute_dsp) >= 0.0),
                f"trace absolute-DSP diagnostic is invalid: {scenario}")
        pitch_scale = event.get("pitch_scale")
        tempo_scale = event.get("tempo_scale")
        require(pitch_scale is None or (isinstance(pitch_scale, (int, float)) and not isinstance(pitch_scale, bool)
                and math.isfinite(float(pitch_scale)) and float(pitch_scale) > 0.0), f"trace pitch scale is invalid: {scenario}")
        require(tempo_scale is None or (isinstance(tempo_scale, (int, float)) and not isinstance(tempo_scale, bool)
                and math.isfinite(float(tempo_scale)) and float(tempo_scale) > 0.0), f"trace tempo scale is invalid: {scenario}")
        require((pitch_scale is None) == (tempo_scale is None), f"trace pitch/tempo scale fields are not paired: {scenario}")
        event_types.add(event_type)
    require(REQUIRED_EVENT_TYPES[scenario] <= event_types, f"trace required DSP event type missing: {scenario}")
    require("SOURCE_AUDIO_IDENTITY_EVIDENCE" in assertion_ids,
            f"trace source-audio identity assertion missing: {scenario}")
    require(REQUIRED_ASSERTION_IDS.get(scenario, set()) <= assertion_ids,
            f"trace required semantic assertion missing: {scenario}")
    decision_inputs = verify_deterministic_input_projection(trace, scenario)
    if scenario in SELECTED_CUE_SCENARIOS:
        require(nonempty_string(trace.get("selected_cue_id")), f"trace selected cue missing: {scenario}")
    if scenario in SELECTED_VARIANT_SCENARIOS:
        require(nonempty_string(trace.get("selected_variant_id")), f"trace selected variant missing: {scenario}")
    if scenario in DECISION_SCENARIO_TARGETS:
        policy_events = [event for event in events if event["event_type"] == "EXTERNAL_CUE_DECISION_POLICY_ONLY"]
        require(len(policy_events) == 1
                and policy_events[0].get("source_id") == trace.get("selected_variant_id")
                and near(policy_events[0].get("dsp_time"), 0.0)
                and policy_events[0].get("requested_dsp_deadline") is None
                and bus_is(policy_events[0], "Score") and near(policy_events[0].get("gain"), 0.8)
                and policy_events[0].get("scheduler_api_accepted") is False
                and policy_events[0].get("detail") == (
                    "ENTRY_REQUESTED;EXTERNAL_CUE_REFERENCE_ONLY;POLICY_ONLY;NO_EXTERNAL_SOURCE_SCHEDULER_CALL"
                ), f"external cue decision is not an exact policy-only event: {scenario}")
        if scenario == "early_era_normal":
            require(len(events) == 4
                    and [event["event_type"] for event in events] == [
                        "EXTERNAL_CUE_DECISION_POLICY_ONLY",
                        "SYNTHETIC_IN_MEMORY_TRANSPORT_SCHEDULE_OBSERVED",
                        "SYNTHETIC_IN_MEMORY_PENDING_TRANSITION_CANCELLATION_OBSERVED",
                        "SYNTHETIC_IN_MEMORY_SAFE_CROSSFADE_OBSERVED",
                    ], "early-era runtime observation event sequence is not exact")
            transport, cancellation, crossfade = events[1:]
            require(transport.get("source_id") == SYNTHETIC_TRANSPORT_SOURCE
                    and bus_is(transport, "Score") and near(transport.get("gain"), 1.0)
                    and near(transport.get("dsp_time"), 0.0)
                    and transport.get("requested_dsp_deadline") is None
                    and transport.get("scheduler_api_accepted") is True
                    and transport.get("detail") == (
                        "SYNTHETIC_IN_MEMORY_TRANSPORT_FIXTURE;NOT_EXTERNAL_CUE_SOURCE;"
                        "ACTUAL_DSP_DEADLINE_NOT_SERIALIZED"
                    ),
                    "synthetic transport schedule observation is not exact")
            require(cancellation.get("source_id") == SYNTHETIC_PENDING_SOURCE
                    and bus_is(cancellation, "Score") and near(cancellation.get("gain"), 1.0)
                    and near(cancellation.get("dsp_time"), 0.0)
                    and cancellation.get("requested_dsp_deadline") is None
                    and cancellation.get("scheduler_api_accepted") is True
                    and cancellation.get("detail") == (
                        f"SYNTHETIC_IN_MEMORY_TRANSPORT_FIXTURE;continuity_source={SYNTHETIC_TRANSPORT_SOURCE};"
                        "NOT_EXTERNAL_CUE_SOURCE"
                    ), "synthetic pending-transition cancellation observation is not exact")
            require(crossfade.get("source_id") == SYNTHETIC_CROSSFADE_SOURCE
                    and bus_is(crossfade, "Score") and near(crossfade.get("gain"), 1.0)
                    and near(crossfade.get("dsp_time"), 0.0)
                    and crossfade.get("requested_dsp_deadline") is None
                    and crossfade.get("scheduler_api_accepted") is True
                    and crossfade.get("detail") == "SYNTHETIC_IN_MEMORY_TRANSPORT_FIXTURE;NOT_EXTERNAL_CUE_SOURCE",
                    "synthetic safe-crossfade observation is not exact")
        else:
            require(len(events) == 1, f"pure decision scenario contains a non-policy event: {scenario}")
    if scenario == "normal_to_active_phrase_boundary_transition":
        policy_events = [event for event in events if event["event_type"] == "EXTERNAL_CUE_PHRASE_POLICY_ONLY"]
        phrase_events = [event for event in events if event["event_type"] == "SYNTHETIC_IN_MEMORY_PHRASE_SCHEDULE_OBSERVED"]
        require(trace.get("music_epoch_id") == "acoustic_electrical_1920_1932"
                and trace.get("requested_context") == "ACTIVE" and trace.get("selected_context") == "ACTIVE"
                and trace.get("requested_transition_boundary") in {3, "NextPhrase"}
                and trace.get("transition_boundary") in {3, "NextPhrase"}
                and near(trace.get("crossfade_start_seconds"), 106.0)
                and near(trace.get("crossfade_end_seconds"), 106.25)
                and len(events) == 2 and len(policy_events) == len(phrase_events) == 1
                and policy_events[0].get("source_id") == trace.get("selected_variant_id")
                and near(policy_events[0].get("dsp_time"), 0.0)
                and bus_is(policy_events[0], "Score") and near(policy_events[0].get("gain"), 1.0)
                and phrase_events[0].get("source_id") == SYNTHETIC_PHRASE_SOURCE
                and policy_events[0].get("scheduler_api_accepted") is False
                and policy_events[0].get("detail") == (
                    "TRUSTED_MUSICAL_BOUNDARY;EXTERNAL_CUE_REFERENCE_ONLY;POLICY_ONLY;"
                    "NO_EXTERNAL_SOURCE_SCHEDULER_CALL;SYNTHETIC_TRUSTED_GRID_NOT_GENERATED_CUE_METADATA"
                )
                and phrase_events[0].get("detail") == (
                    "SYNTHETIC_IN_MEMORY_TRANSPORT_FIXTURE;SYNTHETIC_TRUSTED_GRID_NOT_GENERATED_CUE_METADATA;"
                    "NOT_EXTERNAL_CUE_SOURCE;ACTUAL_DSP_DEADLINE_NOT_SERIALIZED"
                )
                and near(phrase_events[0].get("dsp_time"), 0.0)
                and bus_is(phrase_events[0], "Score") and near(phrase_events[0].get("gain"), 1.0)
                and phrase_events[0].get("scheduler_api_accepted") is True
                and near(policy_events[0].get("requested_dsp_deadline"), 106.0)
                and phrase_events[0].get("requested_dsp_deadline") is None,
                "synthetic in-memory trusted-grid phrase scheduling proof is not exact")
    if scenario == "adjacent_era_transition":
        adjacent_events = [event for event in events if event["event_type"] == "ADJACENT_RENDER_ACCEPTED"]
        require(trace.get("music_epoch_id") == "acoustic_electrical_1920_1932->network_sound_1933_1945"
                and trace.get("selected_variant_id") == "ASP01-TRANSITION-AE-TO-NS-SAFE-UNVERIFIED-WINDOW-CROSSFADE"
                and trace.get("requested_authority") == "P13_FUTURE_TYPED_ELIGIBILITY_FIXTURE"
                and trace.get("accepted_authority") == "AUDIO_TRANSITION_PRESENTATION_ONLY"
                and trace.get("requested_transition_boundary") in {4, "SafeCrossfade"}
                and trace.get("transition_boundary") in {4, "SafeCrossfade"}
                and near(trace.get("crossfade_start_seconds"), 0.12)
                and near(trace.get("crossfade_end_seconds"), 2.12)
                and trace.get("era_transition_phase") == "SAFE_UNVERIFIED_WINDOW_CROSSFADE"
                and len(events) == len(adjacent_events) == 1
                and adjacent_events[0].get("source_id") == trace.get("selected_variant_id")
                and near(adjacent_events[0].get("dsp_time"), 0.12)
                and adjacent_events[0].get("requested_dsp_deadline") is None
                and bus_is(adjacent_events[0], "Score") and near(adjacent_events[0].get("gain"), 1.0)
                and adjacent_events[0].get("scheduler_api_accepted") is False
                and adjacent_events[0].get("detail") == (
                    "HASH_INDEXED_RENDER_SELECTED; SCHEDULER_NOT_EXECUTED_IN_THIS_SCENARIO; "
                    "NO_PHRASE_OR_BESPOKE_CLAIM"
                ),
                "adjacent-era transition is not an honest exact safe-crossfade render selection")
    if scenario == "active_to_blocked_hysteresis":
        hysteresis_events = [event for event in events if event["event_type"] in {"HYSTERESIS_REFUSAL", "HYSTERESIS_ACCEPTANCE"}]
        require(trace.get("requested_context") == "BLOCKED" and trace.get("selected_context") == "BLOCKED"
                and len(events) == 2
                and [event["event_type"] for event in hysteresis_events] == ["HYSTERESIS_REFUSAL", "HYSTERESIS_ACCEPTANCE"]
                and near(hysteresis_events[0]["dsp_time"], 4.999, 1e-9)
                and near(hysteresis_events[1]["dsp_time"], 5.0, 1e-9)
                and bus_is(hysteresis_events[0], "Score") and bus_is(hysteresis_events[1], "Score")
                and near(hysteresis_events[0]["gain"], 1.0) and near(hysteresis_events[1]["gain"], 1.0)
                and hysteresis_events[0].get("source_id") == "ASP01-BUNDLE-EARLY-ACTIVE"
                and hysteresis_events[1].get("source_id") == trace.get("selected_variant_id")
                and hysteresis_events[0].get("detail") == "CONTEXT_HYSTERESIS"
                and hysteresis_events[1].get("detail") == "PHRASE_BOUNDARY_REQUESTED"
                and hysteresis_events[0].get("requested_dsp_deadline") is None
                and hysteresis_events[1].get("requested_dsp_deadline") is None
                and all(event.get("scheduler_api_accepted") is False for event in hysteresis_events),
                "Blocked hysteresis does not refuse immediately before and accept exactly at the five-second boundary")
    if scenario == "workspace_continuity_without_restart":
        keep_events = [event for event in events if event["event_type"] == "KEEP_CURRENT"]
        require(trace.get("requested_context") == "WORKSPACE_LOW_DENSITY" and trace.get("selected_context") == "NORMAL"
                and len(events) == len(keep_events) == 1 and keep_events[0].get("source_id") == trace.get("selected_variant_id")
                and keep_events[0].get("detail") == "WORKSPACE_CONTINUITY"
                and bus_is(keep_events[0], "Score") and near(keep_events[0].get("gain"), 1.0)
                and near(keep_events[0].get("dsp_time"), 0.0)
                and keep_events[0].get("requested_dsp_deadline") is None
                and keep_events[0].get("scheduler_api_accepted") is False
                and trace.get("requested_transition_boundary") in {0, "None"}
                and trace.get("transition_boundary") in {0, "None"},
                "Workspace continuity does not explicitly keep the current cue without a transition/restart")
    if scenario in {"radio_voice_ducking", "pa_interrupting_radio"}:
        speech = trace["speech_event_ids"]
        captions = trace["captions"]
        require(speech and captions and len(speech) == len(captions)
                and all(nonempty_string(value) for value in (*speech, *captions)), f"radio/PA speech-caption proof missing: {scenario}")
        require(all(nonempty_string(trace.get(key)) for key in ("owner_domain", "event_id", "receipt_id")), f"radio/PA typed payload identity missing: {scenario}")
        expected_speech_type = ("REGISTERED_PA_VOICE_TARGET_PENDING_RUNTIME_SCHEDULE"
                                if scenario == "pa_interrupting_radio"
                                else "REGISTERED_RADIO_VOICE_TARGET_PENDING_RUNTIME_SCHEDULE")
        expected_speech_bus = "PaHelp" if scenario == "pa_interrupting_radio" else "RadioVoice"
        expected_duck = 10 ** ((-12.0 if scenario == "pa_interrupting_radio" else -8.0) / 20.0)
        expected_event_order = (["REGISTERED_PA_VOICE_TARGET_PENDING_RUNTIME_SCHEDULE",
                                 "SCORE_DUCK_POLICY_TARGET", "RADIO_INTERRUPT_POLICY_TARGET_BY_PA"]
                                if scenario == "pa_interrupting_radio"
                                else ["REGISTERED_RADIO_VOICE_TARGET_PENDING_RUNTIME_SCHEDULE",
                                      "SCORE_DUCK_POLICY_TARGET"])
        require([event["event_type"] for event in events] == expected_event_order
                and all(near(event.get("dsp_time"), 0.0) and event.get("requested_dsp_deadline") is None
                        for event in events)
                and events[0].get("source_id") == speech[0]
                and events[1].get("source_id") == speech[0]
                and events[0]["event_type"] == expected_speech_type and bus_is(events[0], expected_speech_bus)
                and near(events[0]["gain"], 1.0) and events[0]["scheduler_api_accepted"] is False
                and events[0].get("detail") == (
                    ("URGENT_PA_INTERRUPTS_RADIO" if scenario == "pa_interrupting_radio"
                     else "SCHEDULED_BY_PRIORITY_COOLDOWN_DAYPART")
                    + ";POLICY_TARGET_ONLY_AUDIO_NOT_SCHEDULED_IN_ORACLE"
                ),
                f"radio/PA registered speech policy target failed: {scenario}")
        require(events[1]["event_type"] == "SCORE_DUCK_POLICY_TARGET" and bus_is(events[1], "Score")
                and near(events[1]["gain"], expected_duck) and events[1]["scheduler_api_accepted"] is False
                and events[1].get("detail") == ("POLICY_ONLY_NOT_ARMED;score_duck_decibels=-12"
                                                  if scenario == "pa_interrupting_radio"
                                                  else "POLICY_ONLY_NOT_ARMED;score_duck_decibels=-8"),
                f"radio/PA explicit Score duck policy target failed: {scenario}")
        require({"SPEECH_AND_SCORE_DUCK_POLICY_TARGETS_EXPLICIT",
                 "CAPTION_AND_SPOKEN_DERIVE_FROM_TYPED_PAYLOAD"} <= assertion_ids,
                f"radio/PA semantic assertions missing: {scenario}")
        if scenario == "pa_interrupting_radio":
            require(events[2]["event_type"] == "RADIO_INTERRUPT_POLICY_TARGET_BY_PA"
                    and bus_is(events[2], "RadioVoice")
                    and near(events[2]["gain"], 0.0) and events[2]["scheduler_api_accepted"] is False
                    and events[2].get("source_id") == "EARLY-NETWORK-GOLDEN-STUDIO-V2-OPENING"
                    and events[2].get("detail") == "POLICY_TARGET_IMMEDIATE_RADIO_SOURCE_STOP_FOR_URGENT_PA_NO_FADE_ASSERTED"
                    and {"PA_INTERRUPTION_POLICY_DISPOSITION_EXPLICIT", "PA_INTERRUPT_POLICY_SELECTED"} <= assertion_ids,
                    "PA interruption policy disposition is not explicit")
    if scenario in {"music_off_with_living_ambience", "force_mono", "night_mix"}:
        preset_name = {
            "music_off_with_living_ambience": "MusicOff",
            "force_mono": "ForceMono",
            "night_mix": "NightLimitedDynamicRange",
        }[scenario]
        expected_master_gain = 0.72 if scenario == "night_mix" else 1.0
        require(any(event["event_type"] == "BUS_TARGET_GAIN" and bus_is(event, "Score") for event in events)
                and any(event["event_type"] == "BUS_TARGET_GAIN" and bus_is(event, "Ambience") for event in events)
                and all(near(event.get("dsp_time"), 0.0) and event.get("requested_dsp_deadline") is None
                        and event.get("scheduler_api_accepted") is False for event in events
                        if event.get("event_type") != MARKER_EVENT_TYPE)
                and events[0].get("source_id") == preset_name
                and bus_is(events[0], "Master") and near(events[0].get("gain"), expected_master_gain)
                and events[0].get("detail") == (
                    "PURE_MIX_POLICY; OFFLINE_RUNTIME_PROCESSOR_EVIDENCE_ATTACHED_SEPARATELY_WHERE_APPLICABLE"
                )
                and events[1].get("source_id") == f"{preset_name}:SCORE"
                and bus_is(events[1], "Score") and events[1].get("detail") == "EXPLICIT_SCORE_TARGET"
                and events[2].get("source_id") == f"{preset_name}:AMBIENCE"
                and bus_is(events[2], "Ambience") and near(events[2].get("gain"), 0.8)
                and events[2].get("detail") == "EXPLICIT_AMBIENCE_TARGET"
                and "EXPLICIT_SCORE_AND_AMBIENCE_BUS_TARGET_EVENTS" in assertion_ids,
                f"mix trace lacks explicit Score/Ambience target events: {scenario}")
        if scenario == "music_off_with_living_ambience":
            require([event["event_type"] for event in events] == ["MIX_APPLIED", "BUS_TARGET_GAIN", "BUS_TARGET_GAIN"]
                    and bus_is(events[0], "Master") and bus_is(events[1], "Score") and bus_is(events[2], "Ambience")
                    and near(events[1]["gain"], 0.0) and near(events[2]["gain"], 0.8),
                    "Music Off does not explicitly preserve living ambience")
        elif scenario == "force_mono":
            require([event["event_type"] for event in events] == [
                        "MIX_APPLIED", "BUS_TARGET_GAIN", "BUS_TARGET_GAIN",
                        "FORCE_MONO_POLICY_ENABLED", "OFFLINE_RUNTIME_PROCESSOR_PCM_MARKER",
                    ]
                    and [bus_is(event, bus) for event, bus in zip(events, ("Master", "Score", "Ambience", "Master", "Master"))] == [True] * 5
                    and near(events[1].get("gain"), 0.8)
                    and events[3].get("source_id") == preset_name and near(events[3].get("gain"), 1.0)
                    and events[3].get("detail") == "force_mono=True"
                    and "FORCE_MONO_ENABLED" in assertion_ids,
                    "Force Mono policy event/assertion missing")
        else:
            require([event["event_type"] for event in events] == [
                        "MIX_APPLIED", "BUS_TARGET_GAIN", "BUS_TARGET_GAIN",
                        "LIMITED_DYNAMIC_RANGE_POLICY_ENABLED", "OFFLINE_RUNTIME_PROCESSOR_PCM_MARKER",
                    ]
                    and [bus_is(event, bus) for event, bus in zip(events, ("Master", "Score", "Ambience", "Master", "Master"))] == [True] * 5
                    and near(events[1].get("gain"), 0.8)
                    and events[3].get("source_id") == preset_name and near(events[3].get("gain"), 0.72)
                    and events[3].get("detail") == "limited_dynamic_range=True"
                    and "NIGHT_LIMITER_ENABLED" in assertion_ids,
                    "Night limited-dynamic-range policy event/assertion missing")
        if scenario in CAPTURE_SCENARIOS:
            marker = events[-1]
            require(marker.get("source_id") == "997HZ_MARKER"
                    and near(marker.get("dsp_time"), 0.1) and marker.get("requested_dsp_deadline") is None
                    and near(marker.get("gain"), 1.0) and marker.get("scheduler_api_accepted") is False
                    and marker.get("detail") == (
                        "AudioLabOutputProcessor.ProcessInPlace; force_mono="
                        + ("True" if scenario == "force_mono" else "False")
                        + ";limited_dynamic_range=" + ("False" if scenario == "force_mono" else "True")
                        + ";post_mix_input=" + ("STEREO_MARKER" if scenario == "force_mono" else "TWO_SOURCE_SUM")
                        + "; not hardware listening proof"
                    )
                    and near(marker.get("first_marker_detected_seconds"), 0.1, 1.0 / 48000.0)
                    and near(marker.get("marker_drift_seconds"), 0.0, 1.0 / 48000.0)
                    and isinstance(marker.get("marker_correlation"), (int, float))
                    and not isinstance(marker.get("marker_correlation"), bool)
                    and math.isfinite(float(marker["marker_correlation"])),
                    f"offline processor marker event/diagnostics are not exact: {scenario}")
    if scenario in {"pause_resume", "simulated_device_reset"}:
        expected_action = ("PAUSE_THEN_RESUME_SAMPLE_CURSOR_PRESERVED_POLICY" if scenario == "pause_resume"
                           else "DEVICE_RESET_PRESERVE_TIME_SAMPLES_OR_FAIL_VISIBLE")
        before = trace.get("sample_cursor_before")
        during = trace.get("sample_cursor_during")
        after = trace.get("sample_cursor_after")
        require(trace.get("pause_or_reset_action") == expected_action
                and isinstance(before, int) and not isinstance(before, bool) and before > 0
                and isinstance(after, int) and not isinstance(after, bool),
                f"lifecycle sample-cursor values are malformed: {scenario}")
        if scenario == "pause_resume":
            require(isinstance(during, int) and not isinstance(during, bool)
                    and abs(during - before) <= 256 and after > during
                    and [event["event_type"] for event in events] == [
                        "SYNTHETIC_IN_MEMORY_PAUSE_CURSOR_CAPTURED",
                        "SYNTHETIC_IN_MEMORY_PAUSE_CURSOR_HELD",
                        "SYNTHETIC_IN_MEMORY_RESUME_CURSOR_ADVANCED",
                    ]
                    and all(event.get("source_id") == SYNTHETIC_CROSSFADE_SOURCE and bus_is(event, "Score")
                            and near(event.get("gain"), 1.0) and event.get("scheduler_api_accepted") is False
                            and event.get("requested_dsp_deadline") is None for event in events)
                    and all(near(event["dsp_time"], expected, 1e-9)
                            for event, expected in zip(events, (0.0, 0.15, 0.35)))
                    and events[0].get("detail") == (
                        f"SYNTHETIC_IN_MEMORY_TRANSPORT_FIXTURE;sample_cursor_before={before};"
                        "NO_EXTERNAL_SOURCE_SCHEDULER_CLAIM"
                    )
                    and events[1].get("detail") == (
                        f"sample_cursor_before={before};sample_cursor_during={during};"
                        "SYNTHETIC_IN_MEMORY_TRANSPORT_FIXTURE;NO_EXTERNAL_SOURCE_SCHEDULER_CLAIM"
                    )
                    and events[2].get("detail") == (
                        f"sample_cursor_during={during};sample_cursor_after={after};"
                        "SYNTHETIC_IN_MEMORY_TRANSPORT_FIXTURE;NO_EXTERNAL_SOURCE_SCHEDULER_CLAIM"
                    ),
                    "pause/resume cursor capture, hold, and advance sequence is not exact")
        else:
            require(during is None and after >= before
                    and [event["event_type"] for event in events] == [
                        "SYNTHETIC_IN_MEMORY_DEVICE_RESET_CURSOR_CAPTURED",
                        "SYNTHETIC_IN_MEMORY_DEVICE_RESET_CURSOR_RESTORED",
                    ]
                    and all(event.get("source_id") == SYNTHETIC_CROSSFADE_SOURCE and bus_is(event, "Score")
                            and near(event.get("gain"), 1.0) and event.get("scheduler_api_accepted") is False
                            and event.get("requested_dsp_deadline") is None for event in events)
                    and all(near(event["dsp_time"], expected, 1e-9)
                            for event, expected in zip(events, (0.0, 0.35)))
                    and events[0].get("detail") == (
                        f"SYNTHETIC_IN_MEMORY_TRANSPORT_FIXTURE;sample_cursor_before={before};"
                        "NO_EXTERNAL_SOURCE_SCHEDULER_CLAIM"
                    )
                    and events[1].get("detail") == (
                        f"sample_cursor_before={before};sample_cursor_after={after};"
                        "SYNTHETIC_IN_MEMORY_TRANSPORT_FIXTURE;NO_EXTERNAL_SOURCE_SCHEDULER_CLAIM"
                    ),
                    "device-reset cursor capture and restored sequence is not exact")
    if scenario == "four_x_simulation_unchanged_pitch_tempo":
        require(len(events) == 1 and events[0].get("event_type") == "SYNTHETIC_IN_MEMORY_SIMULATION_SPEED_OBSERVED"
                and events[0].get("source_id") == SYNTHETIC_CROSSFADE_SOURCE
                and bus_is(events[0], "Score") and near(events[0].get("gain"), 1.0)
                and near(events[0].get("pitch_scale"), 1.0) and near(events[0].get("tempo_scale"), 1.0)
                and near(events[0].get("dsp_time"), 0.0) and events[0].get("requested_dsp_deadline") is None
                and events[0].get("scheduler_api_accepted") is False
                and events[0].get("detail") == (
                    "SYNTHETIC_IN_MEMORY_TRANSPORT_FIXTURE;SCORE_GAIN_UNCHANGED;AUDIO_CLOCK_UNCHANGED;"
                    "NO_EXTERNAL_SOURCE_SCHEDULER_CLAIM"
                )
                and {"PITCH_TEMPO_SCALES_REMAIN_ONE", "PITCH_TEMPO_EVENT_FIELDS_EXPLICIT"} <= assertion_ids,
                "4x simulation lacks explicit independent pitch/tempo-one fields")
    if scenario == "four_hour_anti_repeat_trace":
        expected_summaries = [
            (epoch, density)
            for epoch in (
                "acoustic_electrical_1920_1932",
                "format_plurality_1975_1986",
                "streaming_plural_2015_2029",
            )
            for density in ("BALANCED", "FULL_MUSIC", "OFF", "SPARSE")
        ]
        cursor = 0
        for epoch, density in expected_summaries:
            require(cursor < len(events), f"four-hour trace omits summary event: {epoch}:{density}")
            summary = events[cursor]
            expected_gain = 0.0 if density == "OFF" else 1.0
            detail_match = re.fullmatch(
                re.escape(f"{density}:duration_seconds=14400;cue_count=")
                + r"([0-9]+);trace_sha256=([0-9a-f]{64});trace="
                + re.escape(f"02_music-bundles/simulations/{epoch}__{density}.v2.json"),
                str(summary.get("detail", "")),
            )
            require(summary.get("event_type") == "DENSITY_SIMULATION_SUMMARY"
                    and summary.get("source_id") == epoch and bus_is(summary, "Score")
                    and near(summary.get("dsp_time"), float(summary.get("sequence", -1)), 1e-9)
                    and near(summary.get("gain"), expected_gain)
                    and summary.get("requested_dsp_deadline") is None
                    and summary.get("scheduler_api_accepted") is False
                    and detail_match is not None,
                    f"four-hour summary event is not exact: {epoch}:{density}")
            cue_count = int(detail_match.group(1)) if detail_match is not None else -1
            require((density == "OFF" and cue_count == 0) or (density != "OFF" and cue_count > 0),
                    f"four-hour summary cue count contradicts density: {epoch}:{density}")
            cursor += 1
            source_events: list[dict[str, Any]] = []
            while cursor < len(events) and events[cursor].get("event_type") == "SIMULATED_PLAYLIST_SOURCE_ELIGIBLE":
                source_events.append(events[cursor])
                cursor += 1
            expected_source_count = 0 if density == "OFF" else 3
            require(len(source_events) == expected_source_count
                    and len({event.get("source_id") for event in source_events}) == expected_source_count
                    and all(bus_is(event, "Score") and near(event.get("gain"), 1.0)
                            and near(event.get("dsp_time"), float(event.get("sequence", -1)), 1e-9)
                            and event.get("requested_dsp_deadline") is None
                            and event.get("scheduler_api_accepted") is False
                            and str(event.get("detail", "")).startswith(epoch + ":family=")
                            and len(str(event.get("detail", ""))) > len(epoch + ":family=")
                            for event in source_events),
                    f"four-hour eligible-source event set is not exact: {epoch}:{density}")
        require(cursor == len(events) == 39,
                "four-hour trace contains extra events or wrong summary/source cardinality")
    if scenario == "missing_file_fail_closed":
        require(trace.get("failure_or_refusal") == "SOURCE_FILE_MISSING"
                and trace.get("source_audio_disposition") == "EXPECTED_SOURCE_ABSENCE_FAIL_CLOSED"
                and len(events) == 1 and events[0].get("event_type") == "EXTERNAL_SOURCE_VALIDATION"
                and events[0].get("source_id") == "MISSING-FIXTURE" and bus_is(events[0], "Score")
                and near(events[0].get("dsp_time"), 0.0) and near(events[0].get("gain"), 0.0)
                and events[0].get("requested_dsp_deadline") is None
                and events[0].get("scheduler_api_accepted") is False
                and events[0].get("detail") == "SOURCE_FILE_MISSING",
                "missing-file refusal is not exact")
    if scenario == "authority_compatibility_1940_normal":
        require(trace.get("calendar_year") == 1940 and trace.get("music_epoch_id") == "network_sound_1933_1945"
                and trace.get("requested_authority") == "P13_GLOBAL_ERA_TRUTH_FIXTURE"
                and trace.get("accepted_authority") == "REFUSED_NOT_IN_THREE_ANCHOR_LAB_ELIGIBILITY_SET"
                and trace.get("failure_or_refusal") == "AUDIO_LAB_DOES_NOT_MANUFACTURE_P13_ERA_MAPPING"
                and trace.get("source_audio_disposition") == "NO_SOURCE_SELECTED_DUE_TO_AUTHORITY_REFUSAL"
                and len(events) == 1 and events[0].get("event_type") == "AUTHORITY_REFUSAL"
                and events[0].get("source_id") == "network_sound_1933_1945"
                and bus_is(events[0], "Score") and near(events[0].get("dsp_time"), 0.0)
                and near(events[0].get("gain"), 0.0)
                and events[0].get("requested_dsp_deadline") is None
                and events[0].get("scheduler_api_accepted") is False
                and events[0].get("detail") == (
                    "AUDIO_LAB_DOES_NOT_MANUFACTURE_P13_ERA_MAPPING;"
                    "requested=P13_GLOBAL_ERA_TRUTH_FIXTURE;"
                    "accepted=REFUSED_NOT_IN_THREE_ANCHOR_LAB_ELIGIBILITY_SET"
                ),
                "authority refusal boundary missing")
    if scenario == "deterministic_replay":
        replay_events = [event for event in events if event["event_type"] in {"REPLAY_A", "REPLAY_B"}]
        input_sha256, output_sha256 = verify_replay_projections(trace, decision_inputs)
        detail_pattern = re.compile(
            r"seed=(\d+);input_projection_sha256=([0-9a-f]{64});"
            r"output_projection_sha256=([0-9a-f]{64})"
        )
        details = [detail_pattern.fullmatch(str(event.get("detail", ""))) for event in replay_events]
        require(len(events) == len(replay_events) == 2
                and [event["event_type"] for event in replay_events] == ["REPLAY_A", "REPLAY_B"]
                and all(match is not None for match in details)
                and all(int(match.group(1)) == trace["seed"] for match in details if match is not None)
                and all(match.group(2) == input_sha256 and match.group(3) == output_sha256
                        for match in details if match is not None)
                and all(event.get("source_id") == trace.get("selected_variant_id")
                        and bus_is(event, "Score") and near(event.get("gain"), 0.8)
                        and near(event.get("dsp_time"), 0.0)
                        and event.get("requested_dsp_deadline") is None
                        and event.get("scheduler_api_accepted") is False for event in replay_events)
                and "COMPLETE_DECISION_OUTPUT_PROJECTION_IDENTICAL" in assertion_ids,
                "deterministic replay input seed/projection fingerprints are not exact")
    else:
        require(trace.get("replay_projections") is None or trace.get("replay_projections") == [],
                f"non-replay trace unexpectedly publishes replay projections: {scenario}")
    if scenario == "save_load_across_era_compatibility":
        require(trace.get("music_epoch_id") == "streaming_plural_2015_2029"
                and trace.get("requested_authority") == "P13_ELIGIBILITY_AFTER_LOAD"
                and trace.get("accepted_authority") == "AUDIO_PRESENTATION_REEVALUATED_WITHOUT_SAVED_CUE_TRUTH"
                and trace.get("pause_or_reset_action") == "LOAD_INTO_DIFFERENT_ERA_REEVALUATE_ELIGIBILITY"
                and len(events) == 1 and events[0].get("event_type") == "SAVE_LOAD_PRESENTATION_REEVALUATION"
                and events[0].get("source_id") == trace.get("selected_variant_id")
                and trace.get("selected_cue_id") == "ASP01-BUNDLE-MODERN"
                and trace.get("selected_variant_id") == "ASP01-BUNDLE-MODERN-NORMAL"
                and bus_is(events[0], "Score") and near(events[0].get("dsp_time"), 0.0)
                and near(events[0].get("gain"), 0.8)
                and events[0].get("requested_dsp_deadline") is None
                and events[0].get("scheduler_api_accepted") is False
                and events[0].get("detail") == (
                    "saved_cue_truth_not_loaded;eligibility_reevaluated=ASP01-BUNDLE-MODERN"
                ),
                "save/load presentation did not re-evaluate supplied eligibility without loading cue truth")
    expected_fallback = EXPECTED_FALLBACKS[scenario]
    require(trace.get("expected_fallback") is expected_fallback,
            f"trace fallback disposition differs from scenario-owned authority: {scenario}")
    require((trace.get("machine_verdict") == "PASS_WITH_DECLARED_FALLBACK") == expected_fallback,
            f"trace fallback verdict/disposition mismatch: {scenario}")


def verify() -> dict[str, Any]:
    accessibility = verify_accessibility_renders()
    suite = strict_json_file(SUITE_PATH)
    verify_suite_schema_shape(suite)
    require(suite.get("schema") == "project-studio-audio-oracle-suite/v1", "unexpected Oracle suite schema")
    require(suite.get("status") == "PROTOTYPE_ONLY", "Oracle status exceeds prototype boundary")
    require(suite.get("machine_verdict") == "PASS", "Oracle suite did not pass")
    require(suite.get("required_scenario_count") == 18, "Oracle required scenario count is not 18")
    require(suite.get("scenario_count") == len(suite.get("scenarios", [])) == 20, "Oracle scenario cardinality mismatch")
    require(tuple(suite.get("required_scenarios", [])) == EXPECTED_SCENARIOS, "Oracle required scenario identities/order mismatch")
    source_shas = suite.get("source_git_shas", {})
    require(isinstance(source_shas, dict) and set(source_shas) == {"documentation", "unity_audio_lab"},
            "Oracle source-Git identity fields are not exact")
    for artifact_name in ("lab_binary", "catalogue", "runtime_observations", "four_hour_density_simulations"):
        artifact = suite.get(artifact_name)
        require(isinstance(artifact, dict) and set(artifact) == ARTIFACT_FIELDS
                and nonempty_string(artifact.get("path"))
                and isinstance(artifact.get("sha256"), str)
                and re.fullmatch(r"[0-9a-f]{64}", artifact["sha256"]) is not None,
                f"Oracle suite artifact fields are not exact: {artifact_name}")
    require(source_shas.get("documentation") == git_head(DOC_REPO), "Oracle documentation SHA is stale")
    require(source_shas.get("unity_audio_lab") == git_head(UNITY_REPO), "Oracle Unity SHA is stale")

    binary = pilot_path(suite["lab_binary"]["path"])
    require(binary.is_file() and sha256_file(binary) == suite["lab_binary"]["sha256"], "Oracle binary identity mismatch")
    require(pilot_path(suite["catalogue"]["path"]) == SYSTEM_REGISTER.resolve(), "Oracle does not bind the v5 system register")
    require(sha256_file(SYSTEM_REGISTER) == suite["catalogue"]["sha256"], "Oracle catalogue identity mismatch")
    accessibility_register = accessibility.get("source_register", {})
    require(pilot_path(accessibility_register.get("path", "")) == SYSTEM_REGISTER.resolve()
            and accessibility_register.get("sha256") == suite["catalogue"]["sha256"],
            "Oracle accessibility evidence is stale against the Oracle catalogue")
    system = strict_json_file(SYSTEM_REGISTER)
    require(system.get("schema") == "project-studio-system-audio-asset-register/v5"
            and system.get("status") in {"PROTOTYPE_ONLY", "PROTOTYPE_READY_FOR_OWNER_AUDITION"},
            "Oracle-bound system register schema/status mismatch")
    system_items = system.get("items", [])
    system_by_id = {row.get("id"): row for row in system_items}
    require(None not in system_by_id and len(system_by_id) == len(system_items), "Oracle-bound system item IDs are duplicate/missing")
    source_manifest_records = system.get("source_manifests")
    require(isinstance(source_manifest_records, list), "Oracle-bound system source manifests are malformed")
    source_manifest_by_path: dict[Path, dict[str, Any]] = {}
    for record in source_manifest_records:
        require(isinstance(record, dict) and set(record) == {"path", "sha256"},
                "Oracle-bound system source-manifest record is malformed")
        path = pilot_path(record["path"])
        require(path not in source_manifest_by_path and sha256_file(path) == record["sha256"],
                f"Oracle-bound system source manifest is duplicate or hash-mismatched: {path}")
        source_manifest_by_path[path] = record
    require(RADIO_RUNTIME_INDEX.resolve(strict=True) in source_manifest_by_path,
            "Oracle-bound system register does not authenticate the radio runtime index")
    radio_runtime = strict_json_file(RADIO_RUNTIME_INDEX)
    require(radio_runtime.get("schema") == "project-studio-radio-runtime-index/v2"
            and radio_runtime.get("status") == "PROTOTYPE_ONLY"
            and radio_runtime.get("machine_verdict") == "PASS"
            and isinstance(radio_runtime.get("demos"), list) and len(radio_runtime["demos"]) == 3,
            "Oracle-bound radio runtime index failed its exact header/cardinality contract")
    runtime_radio_by_id: dict[str, dict[str, Any]] = {}
    for demo in radio_runtime["demos"]:
        slug = demo.get("slug")
        master = demo.get("master")
        preview = demo.get("preview")
        require(isinstance(slug, str) and slug and isinstance(master, dict) and isinstance(preview, dict),
                "Oracle-bound radio demo row is malformed")
        preview_path = pilot_path(preview["path"])
        master_path = pilot_path(master["path"])
        preview_relative = str(preview_path.relative_to(PILOT_ROOT.resolve(strict=True)))
        master_relative = str(master_path.relative_to(PILOT_ROOT.resolve(strict=True)))
        registered = [item for item in system_items if item.get("role") == "RADIO_DEMO"
                      and item.get("relative_path") == preview_relative]
        require(len(registered) == 1
                and registered[0].get("sha256") == preview.get("sha256")
                and preview_path.stat().st_size == preview.get("bytes")
                and sha256_file(preview_path) == preview.get("sha256")
                and probe_audio(preview_path) == preview.get("probe")
                and master_path.stat().st_size == master.get("bytes")
                and sha256_file(master_path) == master.get("sha256")
                and probe_audio(master_path) == master.get("probe"),
                f"Oracle radio runtime master/registered-preview relationship failed: {slug}")
        runtime_id = f"{registered[0]['id']}-RUNTIME-WAV"
        require(runtime_id not in runtime_radio_by_id, f"duplicate Oracle runtime radio identity: {runtime_id}")
        runtime_radio_by_id[runtime_id] = {
            "id": runtime_id, "relative_path": master_relative, "sha256": master["sha256"],
            "role": "RADIO_DEMO_RUNTIME_WAV", "source_asset_id": registered[0]["id"],
        }
    system_by_source_alias: dict[str, dict[str, Any]] = {}
    for item in system_items:
        for alias in (item["id"], item.get("source_asset_id")):
            if not alias:
                continue
            require(alias not in system_by_source_alias, f"system-register source alias is ambiguous: {alias}")
            system_by_source_alias[alias] = item
    for alias, item in runtime_radio_by_id.items():
        require(alias not in system_by_source_alias, f"runtime radio source alias is ambiguous: {alias}")
        system_by_source_alias[alias] = item
    _, observations = load_verified(suite["runtime_observations"], schema=RUNTIME_OBSERVATION_SCHEMA)
    require(pilot_path(suite["runtime_observations"]["path"]) == RUNTIME_OBSERVATIONS.resolve(), "Oracle runtime-observation path mismatch")
    require(PLAYMODE_RESULTS.is_file() and not PLAYMODE_RESULTS.is_symlink(),
            "canonical final PlayMode result is missing or symlinked")
    runtime_observation_proof = verify_runtime_observations(
        observations,
        PLAYMODE_RESULTS.read_text(encoding="utf-8"),
        expected_unity_sha=source_shas["unity_audio_lab"],
        expected_unity_version=unity_project_version(),
    )
    expected_source_summary: dict[str, int] = {}
    for source in EVIDENCE_SOURCES.values():
        expected_source_summary[source] = expected_source_summary.get(source, 0) + 1
    require(suite.get("evidence_source_summary") == expected_source_summary, "Oracle evidence-source summary mismatch")

    scenario_names: list[str] = []
    required_names: list[str] = []
    marker_render_count = 0
    force_mono_channels = None
    marker_signal_proofs: list[dict[str, Any]] = []
    capture_scenarios: set[str] = set()
    for expected_number, row in enumerate(suite["scenarios"], start=1):
        require(isinstance(row, dict) and set(row) == SUITE_SCENARIO_FIELDS,
                f"Oracle scenario-row fields are not exact: {expected_number}")
        require(isinstance(row.get("trace"), dict) and set(row["trace"]) == ARTIFACT_FIELDS,
                f"Oracle trace-artifact fields are not exact: {expected_number}")
        capture_record = row.get("capture")
        require(capture_record is None or (
            isinstance(capture_record, dict) and set(capture_record) == CAPTURE_FIELDS
            and isinstance(capture_record.get("probe"), dict)
            and set(capture_record["probe"]) == CAPTURE_PROBE_FIELDS
        ), f"Oracle capture fields are not exact: {expected_number}")
        require(row.get("number") == expected_number, f"Oracle scenario numbering mismatch: {expected_number}")
        expected_required = expected_number <= len(EXPECTED_SCENARIOS)
        require(row.get("required") is expected_required,
                f"Oracle required flag is not the scenario-owned boolean: {expected_number}")
        scenario = row["scenario"]
        evidence_source = EVIDENCE_SOURCES.get(scenario)
        require(row.get("evidence_source") == evidence_source, f"suite evidence source mismatch: {scenario}")
        scenario_names.append(scenario)
        if expected_required:
            required_names.append(scenario)
        _, trace = load_verified(row["trace"], schema="project-studio-audio-oracle-trace/v1", required_root="07_audio-oracle/traces")
        require(trace.get("scenario") == scenario, f"trace scenario mismatch: {scenario}")
        require(trace.get("observation_source") == evidence_source and trace.get("evidence_source") == evidence_source, f"trace evidence source mismatch: {scenario}")
        require(trace.get("machine_verdict") in {"PASS", "PASS_WITH_DECLARED_FALLBACK"}, f"trace failed: {scenario}")
        require(row.get("machine_verdict") == trace["machine_verdict"], f"suite/trace verdict mismatch: {scenario}")
        require(trace_assertions_pass(trace.get("assertions")), f"trace assertion failed: {scenario}")
        require(len({row["id"] for row in trace["assertions"]}) == len(trace["assertions"]), f"trace assertion IDs are duplicate: {scenario}")
        require(trace.get("documentation_git_sha") == source_shas["documentation"], f"trace documentation SHA mismatch: {scenario}")
        require(trace.get("unity_git_sha") == source_shas["unity_audio_lab"], f"trace Unity SHA mismatch: {scenario}")
        require(trace.get("lab_binary_sha256") == suite["lab_binary"]["sha256"], f"trace binary SHA mismatch: {scenario}")
        require(trace.get("catalogue_sha256") == suite["catalogue"]["sha256"], f"trace catalogue SHA mismatch: {scenario}")
        source_identities = trace.get("source_identities")
        require(isinstance(source_identities, list), f"trace source identities malformed: {scenario}")
        source_hashes: list[str] = []
        source_ids: set[str] = set()
        source_paths: set[str] = set()
        source_items_by_identity: dict[str, dict[str, Any]] = {}
        for identity in source_identities:
            verify_source_identity_shape(identity, scenario)
            relative = Path(identity["source_relative_path"])
            require(not relative.is_absolute() and ".." not in relative.parts, f"trace source identity path is not a safe pilot-relative path: {scenario}")
            source_path = pilot_path(identity["source_relative_path"])
            require(sha256_file(source_path) == identity.get("sha256"), f"trace source identity hash mismatch: {scenario}")
            if str(identity["evidence_role"]).startswith("GENERATED_UNITY_EDITOR_OFFLINE_OUTPUT_PROCESSOR_MARKER_RENDER"):
                require(identity["source_relative_path"] == trace.get("capture_path")
                        and identity["sha256"] == trace.get("capture_sha256"), f"generated Oracle marker identity is not its declared capture: {scenario}")
            else:
                registered_item = system_by_source_alias.get(identity["source_id"])
                require(registered_item is not None
                        and identity["source_relative_path"] == registered_item["relative_path"]
                        and identity["sha256"] == registered_item["sha256"],
                        f"trace source identity does not exactly join the v5 system register: {scenario}:{identity['source_id']}")
                source_items_by_identity[identity["source_id"]] = registered_item
            source_hashes.append(identity["sha256"])
            source_ids.add(identity["source_id"])
            source_paths.add(identity["source_relative_path"])
        require(len(source_ids) == len(source_identities) and len(source_paths) == len(source_identities),
                f"trace source identities contain duplicate IDs or paths: {scenario}")
        projected_hashes = trace.get("source_audio_sha256")
        require(isinstance(projected_hashes, list)
                and all(isinstance(value, str) and len(value) == 64 for value in projected_hashes)
                and projected_hashes == list(dict.fromkeys(source_hashes)), f"trace source hash projection mismatch: {scenario}")
        if scenario in SELECTED_VARIANT_SCENARIOS:
            selected_item = system_by_id.get(trace.get("selected_variant_id"))
            require(selected_item is not None and any(item.get("id") == selected_item["id"] for item in source_items_by_identity.values()),
                    f"selected Oracle variant/transition is not backed by a listed v5 source identity: {scenario}")
            if scenario in DECISION_SCENARIO_TARGETS:
                expected_epoch, expected_context = DECISION_SCENARIO_TARGETS[scenario]
                decision_events = [event for event in trace["dsp_events"]
                                   if event.get("event_type") == "EXTERNAL_CUE_DECISION_POLICY_ONLY"]
                expected_event_count = 4 if scenario == "early_era_normal" else 1
                require(selected_item.get("role") == "RESPONSIVE_VARIANT"
                        and selected_item.get("epoch") == expected_epoch
                        and selected_item.get("context") == expected_context
                        and trace.get("music_epoch_id") == expected_epoch
                        and trace.get("requested_context") == expected_context
                        and trace.get("selected_context") == expected_context
                        and len(trace["dsp_events"]) == expected_event_count
                        and len(decision_events) == 1
                        and near(decision_events[0].get("dsp_time"), 0.0)
                        and decision_events[0].get("source_id") == selected_item["id"]
                        and bus_is(decision_events[0], "Score") and near(decision_events[0].get("gain"), 0.8)
                        and decision_events[0].get("requested_dsp_deadline") is None
                        and decision_events[0].get("scheduler_api_accepted") is False,
                        f"decision scenario selected the wrong exact epoch/context/variant: {scenario}")
            elif scenario == "active_to_blocked_hysteresis":
                hysteresis_events = [event for event in trace["dsp_events"]
                                     if event.get("event_type") in {"HYSTERESIS_REFUSAL", "HYSTERESIS_ACCEPTANCE"}]
                active_item = system_by_id.get(hysteresis_events[0].get("source_id")) if hysteresis_events else None
                require(selected_item.get("epoch") == "acoustic_electrical_1920_1932"
                        and selected_item.get("context") == "BLOCKED"
                        and active_item is not None and active_item.get("epoch") == selected_item.get("epoch")
                        and active_item.get("context") == "ACTIVE"
                        and trace.get("requested_context") == "BLOCKED"
                        and trace.get("selected_context") == "BLOCKED"
                        and trace.get("lot_activity") == "BlockedProduction",
                        "Blocked hysteresis source/target contexts are not exact")
            elif scenario == "workspace_continuity_without_restart":
                require(selected_item.get("epoch") == "acoustic_electrical_1920_1932"
                        and selected_item.get("context") == "NORMAL",
                        "Workspace continuity did not retain the current early Normal variant")
        if scenario == "four_hour_anti_repeat_trace":
            simulated_ids = {
                event["source_id"] for event in trace["dsp_events"]
                if event["event_type"] == "SIMULATED_PLAYLIST_SOURCE_ELIGIBLE"
            }
            require(simulated_ids and simulated_ids == set(source_items_by_identity),
                    "four-hour Oracle event sources do not exactly equal their v5 source identities")
        verify_trace_contract(trace, scenario)
        capture = row.get("capture")
        if capture:
            capture_scenarios.add(scenario)
            capture_path = scoped_oracle_path(capture["path"], "07_audio-oracle/captures")
            require(sha256_file(capture_path) == capture["sha256"], f"capture hash mismatch: {scenario}")
            require(pilot_path(trace.get("capture_path")) == capture_path and trace.get("capture_sha256") == capture["sha256"], f"trace/suite capture identity mismatch: {scenario}")
            require(capture.get("evidence_class") == "UNITY_EDITOR_OFFLINE_OUTPUT_PROCESSOR_MARKER_RENDER" and capture.get("runtime_mix_capture") is False, f"capture evidence class is overstated: {scenario}")
            actual_probe = probe_audio(capture_path)
            declared_probe = capture["probe"]
            require(
                all(actual_probe[key] == declared_probe[key] for key in ("codec", "sample_rate_hz", "channels", "bits_per_sample"))
                and abs(actual_probe["duration_seconds"] - float(declared_probe["duration_seconds"])) <= 0.001,
                f"capture probe mismatch: {scenario}",
            )
            marker_events = [event for event in trace["dsp_events"]
                             if event.get("event_type") == "OFFLINE_RUNTIME_PROCESSOR_PCM_MARKER"]
            require(len(marker_events) == 1, f"offline marker trace event cardinality mismatch: {scenario}")
            marker_signal_proofs.append(verify_marker_capture(marker_events[0], capture_path, scenario))
            marker_render_count += 1
            if scenario == "force_mono":
                force_mono_channels = actual_probe["channels"]
        else:
            require(not trace.get("capture_path") and not trace.get("capture_sha256"), f"unpublished trace capture: {scenario}")
    require(len(scenario_names) == len(set(scenario_names)), "duplicate Oracle scenario")
    require(tuple(scenario_names) == EXPECTED_ALL_SCENARIOS, "Oracle total scenario identities/order mismatch")
    require(tuple(required_names) == EXPECTED_SCENARIOS, "required Oracle scenario rows mismatch")
    require(capture_scenarios == CAPTURE_SCENARIOS and marker_render_count == 2
            and force_mono_channels == 2,
            "offline processor marker-render coverage or stereo dual-mono proof is missing")

    playlist_record = suite["four_hour_density_simulations"]
    _, playlist = load_verified(playlist_record, schema="project-studio-four-hour-density-simulations/v2")
    require(pilot_path(playlist_record["path"]) == PLAYLIST_SUITE.resolve(), "Oracle long-session suite path mismatch")
    require(playlist.get("trace_count") == 12 and playlist.get("machine_verdict") == "PASS", "four-hour suite incomplete")
    for row in playlist["traces"]:
        path = pilot_path(row["path"])
        require(sha256_file(path) == row["sha256"], f"four-hour child trace mismatch: {path}")

    return {
        "machine_verdict": "PASS",
        "suite_path": str(SUITE_PATH),
        "suite_sha256": sha256_file(SUITE_PATH),
        "required_scenarios": 18,
        "total_scenarios": len(scenario_names),
        "offline_processor_marker_renders": marker_render_count,
        "offline_processor_marker_signal_proofs": marker_signal_proofs,
        "runtime_observation_proof": runtime_observation_proof,
        "documentation_sha": source_shas["documentation"],
        "unity_sha": source_shas["unity_audio_lab"],
        "limitations": "Machine proof does not equal listening acceptance.",
    }


def self_test() -> dict[str, Any]:
    mutation_count = 0

    def refuse(callable_value: Any, label: str) -> None:
        nonlocal mutation_count
        try:
            callable_value()
        except (RuntimeError, ValueError, wave.Error):
            mutation_count += 1
            return
        raise AssertionError(f"Oracle mutation was accepted: {label}")

    refuse(lambda: strict_json_loads('{"schema":"v2","schema":"forged"}', "duplicate-key-mutation"),
           "json:duplicate-object-key")
    synthetic_timing = {
        "event_type": "SYNTHETIC_IN_MEMORY_TRANSPORT_SCHEDULE_OBSERVED",
        "timing_basis": TIMING_SYNTHETIC_SEQUENCE,
        "requested_dsp_deadline": None,
    }
    verify_event_timing_claim(synthetic_timing, "selftest")
    wrong_basis = copy.deepcopy(synthetic_timing)
    wrong_basis["timing_basis"] = TIMING_PURE_POLICY
    refuse(lambda: verify_event_timing_claim(wrong_basis, "selftest"), "timing:synthetic-overclaim")
    false_deadline = copy.deepcopy(synthetic_timing)
    false_deadline["requested_dsp_deadline"] = 0.12
    refuse(lambda: verify_event_timing_claim(false_deadline, "selftest"), "timing:synthetic-unobserved-deadline")
    false_absolute_dsp = copy.deepcopy(synthetic_timing)
    false_absolute_dsp["absolute_dsp_diagnostic"] = 123.0
    refuse(lambda: verify_event_timing_claim(false_absolute_dsp, "selftest"),
           "timing:authored-event-absolute-dsp-overclaim")
    frozen_summary = {
        "event_type": "DENSITY_SIMULATION_SUMMARY",
        "timing_basis": TIMING_FROZEN_SIMULATION,
        "requested_dsp_deadline": None,
    }
    verify_event_timing_claim(frozen_summary, "selftest")
    wrong_frozen_basis = copy.deepcopy(frozen_summary)
    wrong_frozen_basis["timing_basis"] = "FROZEN_SIMULATION_TIMELINE_COORDINATE"
    refuse(lambda: verify_event_timing_claim(wrong_frozen_basis, "selftest"),
           "timing:frozen-summary-not-playback")
    offline_marker_timing = {
        "event_type": "OFFLINE_RUNTIME_PROCESSOR_PCM_MARKER",
        "timing_basis": TIMING_OFFLINE_RENDER,
        "requested_dsp_deadline": 0.1,
        "absolute_dsp_diagnostic": None,
    }
    refuse(lambda: verify_event_timing_claim(offline_marker_timing, "selftest"),
           "timing:offline-marker-false-deadline")

    def event_fixture(event_type: str, *, bus: str = "Score", source_id: str = "fixture") -> dict[str, Any]:
        event = {field: None for field in EVENT_FIELDS}
        event.update({
            "sequence": 0,
            "dsp_time": 0.0,
            "timing_basis": expected_event_timing_basis(event_type),
            "event_type": event_type,
            "source_id": source_id,
            "bus": bus,
            "gain": 1.0,
            "detail": "self-test",
            "requested_dsp_deadline": 106.0 if event_type == PLANNER_DEADLINE_EVENT_TYPE else None,
            "scheduler_api_accepted": event_type in SCHEDULER_ACCEPTED_EVENT_TYPES,
        })
        if event_type == SPEED_EVENT_TYPE:
            event["pitch_scale"] = 1.0
            event["tempo_scale"] = 1.0
        return event

    policy_event = event_fixture("KEEP_CURRENT")
    verify_event_contract(policy_event, "selftest")
    extra_field = copy.deepcopy(policy_event)
    extra_field["forged_semantic"] = "accepted"
    refuse(lambda: verify_event_contract(extra_field, "selftest"), "event:unknown-field")
    numeric_bus = copy.deepcopy(policy_event)
    numeric_bus["bus"] = 1
    refuse(lambda: verify_event_contract(numeric_bus, "selftest"), "event:numeric-bus")
    marker_graft = copy.deepcopy(policy_event)
    marker_graft["marker_recipe_schema"] = OFFLINE_MARKER_RECIPE_SCHEMA
    refuse(lambda: verify_event_contract(marker_graft, "selftest"), "event:marker-field-on-policy")
    pitch_graft = copy.deepcopy(policy_event)
    pitch_graft["pitch_scale"] = pitch_graft["tempo_scale"] = 1.0
    refuse(lambda: verify_event_contract(pitch_graft, "selftest"), "event:pitch-tempo-on-non-speed")
    scheduler_graft = copy.deepcopy(policy_event)
    scheduler_graft["scheduler_api_accepted"] = True
    refuse(lambda: verify_event_contract(scheduler_graft, "selftest"), "event:false-scheduler-acceptance")
    policy_deadline = copy.deepcopy(policy_event)
    policy_deadline["requested_dsp_deadline"] = 0.12
    refuse(lambda: verify_event_contract(policy_deadline, "selftest"), "event:non-planner-deadline")

    synthetic_event = event_fixture("SYNTHETIC_IN_MEMORY_TRANSPORT_SCHEDULE_OBSERVED")
    verify_event_contract(synthetic_event, "selftest")
    missing_scheduler_acceptance = copy.deepcopy(synthetic_event)
    missing_scheduler_acceptance["scheduler_api_accepted"] = False
    refuse(lambda: verify_event_contract(missing_scheduler_acceptance, "selftest"),
           "event:missing-scheduler-acceptance")

    speed_event = event_fixture(SPEED_EVENT_TYPE)
    verify_event_contract(speed_event, "selftest")
    changed_pitch = copy.deepcopy(speed_event)
    changed_pitch["pitch_scale"] = 0.99
    refuse(lambda: verify_event_contract(changed_pitch, "selftest"), "event:non-unity-pitch-scale")

    planner_event = event_fixture(PLANNER_DEADLINE_EVENT_TYPE)
    verify_event_contract(planner_event, "selftest")
    missing_planner_deadline = copy.deepcopy(planner_event)
    missing_planner_deadline["requested_dsp_deadline"] = None
    refuse(lambda: verify_event_contract(missing_planner_deadline, "selftest"),
           "event:missing-planner-deadline")

    def trace_fixture(scenario: str, events: list[dict[str, Any]], assertion_ids: set[str]) -> dict[str, Any]:
        trace = {field: None for field in TRACE_FIELDS}
        trace.update({
            "schema": "project-studio-audio-oracle-trace/v1",
            "scenario": scenario,
            "fixture_id": "SELF_TEST",
            "seed": 1,
            "source_audio_disposition": "SELF_TEST_EXACT_CONTRACT",
            "source_audio_sha256": [],
            "source_identities": [],
            "speech_event_ids": [],
            "captions": [],
            "dsp_events": events,
            "assertions": [
                {"id": value, "passed": True, "detail": "self-test"}
                for value in sorted({"SOURCE_AUDIO_IDENTITY_EVIDENCE", *assertion_ids})
            ],
            "deterministic_input_projection": None,
            "replay_projections": [],
            "transition_boundary": "None",
            "requested_transition_boundary": "None",
            "expected_fallback": False,
            "machine_verdict": "PASS",
            "listening_limitation": "Machine proof does not equal human listening acceptance.",
            "observation_source": "SELF_TEST",
            "evidence_source": "SELF_TEST",
        })
        return trace

    missing_event = event_fixture("EXTERNAL_SOURCE_VALIDATION", source_id="MISSING-FIXTURE")
    missing_event.update({"gain": 0.0, "detail": "SOURCE_FILE_MISSING"})
    missing_trace = trace_fixture("missing_file_fail_closed", [missing_event], {"MISSING_FILE_FAILS_CLOSED"})
    missing_trace.update({
        "source_audio_disposition": "EXPECTED_SOURCE_ABSENCE_FAIL_CLOSED",
        "failure_or_refusal": "SOURCE_FILE_MISSING",
    })
    verify_trace_contract(missing_trace, "missing_file_fail_closed")
    forged_trace_field = copy.deepcopy(missing_trace)
    forged_trace_field["owner_approved"] = True
    refuse(lambda: verify_trace_contract(forged_trace_field, "missing_file_fail_closed"),
           "trace:unknown-top-level-field")
    missing_trace_field = copy.deepcopy(missing_trace)
    missing_trace_field.pop("listening_limitation")
    refuse(lambda: verify_trace_contract(missing_trace_field, "missing_file_fail_closed"),
           "trace:missing-top-level-field")
    forged_assertion = copy.deepcopy(missing_trace["assertions"])
    forged_assertion[0]["commercially_cleared"] = True
    refuse(lambda: require(trace_assertions_pass(forged_assertion), "forged assertion accepted"),
           "trace:unknown-assertion-field")
    valid_identity = {
        "source_id": "SELF-TEST-SOURCE",
        "source_relative_path": "07_audio-oracle/self-test.wav",
        "sha256": "a" * 64,
        "evidence_role": "SELF_TEST",
    }
    verify_source_identity_shape(valid_identity, "selftest")
    forged_identity = copy.deepcopy(valid_identity)
    forged_identity["rights_status"] = "CLEARED"
    refuse(lambda: verify_source_identity_shape(forged_identity, "selftest"),
           "trace:unknown-source-identity-field")

    minimal_suite = {field: None for field in SUITE_FIELDS}
    minimal_suite.update({
        "source_git_shas": {"documentation": "d" * 40, "unity_audio_lab": "u" * 40},
        "lab_binary": {"path": "lab", "sha256": "a" * 64},
        "catalogue": {"path": "catalogue", "sha256": "b" * 64},
        "runtime_observations": {"path": "runtime", "sha256": "c" * 64},
        "four_hour_density_simulations": {"path": "playlist", "sha256": "d" * 64},
        "scenarios": [{
            "number": 1, "scenario": "selftest", "required": True, "machine_verdict": "PASS",
            "evidence_source": "SELF_TEST", "trace": {"path": "trace", "sha256": "e" * 64},
            "capture": None,
        }],
    })
    verify_suite_schema_shape(minimal_suite)
    forged_suite = copy.deepcopy(minimal_suite)
    forged_suite["owner_acceptance"] = True
    refuse(lambda: verify_suite_schema_shape(forged_suite), "suite:unknown-top-level-field")
    forged_scenario_row = copy.deepcopy(minimal_suite)
    forged_scenario_row["scenarios"][0]["ship_ready"] = True
    refuse(lambda: verify_suite_schema_shape(forged_scenario_row), "suite:unknown-scenario-field")
    forged_artifact = copy.deepcopy(minimal_suite)
    forged_artifact["scenarios"][0]["trace"]["unverified_url"] = "https://example.invalid"
    refuse(lambda: verify_suite_schema_shape(forged_artifact), "suite:unknown-artifact-field")
    shifted_missing = copy.deepcopy(missing_trace)
    shifted_missing["dsp_events"][0]["dsp_time"] = 1.0
    refuse(lambda: verify_trace_contract(shifted_missing, "missing_file_fail_closed"),
           "scenario:missing-file-authored-coordinate")
    renamed_missing = copy.deepcopy(missing_trace)
    renamed_missing["dsp_events"][0]["source_id"] = "MISSING-OTHER"
    refuse(lambda: verify_trace_contract(renamed_missing, "missing_file_fail_closed"),
           "scenario:missing-file-source")

    music_off_events = [
        event_fixture("MIX_APPLIED", bus="Master", source_id="MusicOff"),
        event_fixture("BUS_TARGET_GAIN", bus="Score", source_id="MusicOff:SCORE"),
        event_fixture("BUS_TARGET_GAIN", bus="Ambience", source_id="MusicOff:AMBIENCE"),
    ]
    for sequence, event in enumerate(music_off_events):
        event["sequence"] = sequence
    music_off_events[0].update({
        "detail": "PURE_MIX_POLICY; OFFLINE_RUNTIME_PROCESSOR_EVIDENCE_ATTACHED_SEPARATELY_WHERE_APPLICABLE",
        "gain": 1.0,
    })
    music_off_events[1].update({"detail": "EXPLICIT_SCORE_TARGET", "gain": 0.0})
    music_off_events[2].update({"detail": "EXPLICIT_AMBIENCE_TARGET", "gain": 0.8})
    music_off_trace = trace_fixture("music_off_with_living_ambience", music_off_events, {
        "EXPLICIT_SCORE_AND_AMBIENCE_BUS_TARGET_EVENTS", "MUSIC_OFF_AMBIENCE_REMAINS",
    })
    verify_trace_contract(music_off_trace, "music_off_with_living_ambience")
    renamed_mix_source = copy.deepcopy(music_off_trace)
    renamed_mix_source["dsp_events"][2]["source_id"] = "MusicOff:AMBIENCE-OTHER"
    refuse(lambda: verify_trace_contract(renamed_mix_source, "music_off_with_living_ambience"),
           "scenario:mix-source")

    four_hour_events: list[dict[str, Any]] = []
    for epoch in (
        "acoustic_electrical_1920_1932", "format_plurality_1975_1986", "streaming_plural_2015_2029",
    ):
        for density in ("BALANCED", "FULL_MUSIC", "OFF", "SPARSE"):
            summary_event = event_fixture("DENSITY_SIMULATION_SUMMARY", source_id=epoch)
            summary_event.update({
                "sequence": len(four_hour_events), "dsp_time": float(len(four_hour_events)),
                "gain": 0.0 if density == "OFF" else 1.0,
                "detail": (
                    f"{density}:duration_seconds=14400;cue_count={0 if density == 'OFF' else 1};"
                    f"trace_sha256={'a' * 64};trace=02_music-bundles/simulations/{epoch}__{density}.v2.json"
                ),
            })
            four_hour_events.append(summary_event)
            if density != "OFF":
                for ordinal in range(3):
                    source_event = event_fixture(
                        "SIMULATED_PLAYLIST_SOURCE_ELIGIBLE", source_id=f"{epoch}-SOURCE-{ordinal}"
                    )
                    source_event.update({
                        "sequence": len(four_hour_events), "dsp_time": float(len(four_hour_events)),
                        "detail": f"{epoch}:family=family-{ordinal}",
                    })
                    four_hour_events.append(source_event)
    four_hour_trace = trace_fixture("four_hour_anti_repeat_trace", four_hour_events, {
        "FOUR_HOUR_MANIFEST_SCHEMA", "TWELVE_FIXED_EPOCH_DENSITY_TRACES",
    })
    four_hour_trace["selected_cue_id"] = "RECORDED_ERA_PICK_SHUFFLE_BAGS"
    verify_trace_contract(four_hour_trace, "four_hour_anti_repeat_trace")
    shifted_summary = copy.deepcopy(four_hour_trace)
    shifted_summary["dsp_events"][0]["dsp_time"] = 0.5
    refuse(lambda: verify_trace_contract(shifted_summary, "four_hour_anti_repeat_trace"),
           "scenario:four-hour-summary-coordinate")
    renamed_summary = copy.deepcopy(four_hour_trace)
    renamed_summary["dsp_events"][0]["source_id"] = "wrong_epoch"
    refuse(lambda: verify_trace_contract(renamed_summary, "four_hour_anti_repeat_trace"),
           "scenario:four-hour-summary-source")

    nonce = "0123456789abcdef0123456789abcdef"
    generated = "2026-09-03T19:46:13Z"
    unity_sha = "a" * 40
    unity_version = "6000.3.22f1"
    observation: dict[str, Any] = {
        "schema": RUNTIME_OBSERVATION_SCHEMA,
        **{field: True for field in EXPECTED_RUNTIME_FLAGS},
        **EXPECTED_RUNTIME_SOURCE_IDS,
        "sample_before_cancellation": 10_000,
        "sample_after_cancellation": 12_000,
        "sample_before_pause": 100_000,
        "sample_during_pause": 100_001,
        "sample_after_resume": 110_000,
        "sample_before_reset": 110_000,
        "sample_after_reset": 120_000,
        "evidence_boundary": RUNTIME_OBSERVATION_BOUNDARY,
        "unity_git_sha": unity_sha,
        "unity_version": unity_version,
        "run_nonce": nonce,
        "generated_utc": generated,
        "test_id": RUNTIME_OBSERVATION_TEST_ID,
        "observation_source": "UNITY_PLAYMODE_OBSERVATION",
    }
    nonce_lines = "\n".join((f"AUDIO_ORACLE_RUNTIME_NONCE:{nonce}",) * 2)
    xml = (
        '<test-run testcasecount="1" result="Passed" total="1" passed="1" failed="0" '
        'inconclusive="0" skipped="0">'
        f'<test-case methodname="{RUNTIME_OBSERVATION_TEST_ID}" '
        f'fullname="{RUNTIME_OBSERVATION_TEST_FULL_NAME}" result="Passed" '
        'start-time="2026-09-03 19:46:12Z" end-time="2026-09-03 19:46:14Z">'
        f'<output><![CDATA[{nonce_lines}]]></output></test-case></test-run>'
    )
    verify_runtime_observations(observation, xml,
                                expected_unity_sha=unity_sha, expected_unity_version=unity_version)
    for field, value in (
        ("transport_scheduling_observed", False),
        ("safe_crossfade_source_id", SYNTHETIC_TRANSPORT_SOURCE),
        ("sample_after_cancellation", 9_999),
        ("sample_during_pause", 100_300),
        ("sample_before_reset", 109_999),
        ("run_nonce", "short"),
        ("generated_utc", "2026-09-03T19:45:00Z"),
        ("unity_version", "6000.0.0f0"),
    ):
        mutated = copy.deepcopy(observation)
        mutated[field] = value
        refuse(lambda mutated=mutated: verify_runtime_observations(
            mutated, xml, expected_unity_sha=unity_sha, expected_unity_version=unity_version
        ), f"runtime:{field}")
    refuse(lambda: verify_runtime_observations(
        observation, xml.replace(nonce, "f" * 32),
        expected_unity_sha=unity_sha, expected_unity_version=unity_version,
    ), "runtime:nonce-testcase-mismatch")
    refuse(lambda: verify_runtime_observations(
        observation, xml.replace(nonce_lines, f"AUDIO_ORACLE_RUNTIME_NONCE:{nonce}"),
        expected_unity_sha=unity_sha, expected_unity_version=unity_version,
    ), "runtime:nonce-line-count")
    split_outputs = xml.replace(
        f"<output><![CDATA[{nonce_lines}]]></output>",
        f"<output><![CDATA[AUDIO_ORACLE_RUNTIME_NONCE:{nonce}]]></output>"
        f"<output><![CDATA[AUDIO_ORACLE_RUNTIME_NONCE:{nonce}]]></output>",
    )
    refuse(lambda: verify_runtime_observations(
        observation, split_outputs,
        expected_unity_sha=unity_sha, expected_unity_version=unity_version,
    ), "runtime:split-output-nonce-bypass")

    for scenario in EXPECTED_DECISION_SEEDS:
        expected = expected_decision_input_projections(scenario)
        aggregate = "\n".join(canonical_atom(label) + "=" + canonical_atom(state)
                              for label, state in expected.items())
        trace = {"seed": EXPECTED_DECISION_SEEDS[scenario], "deterministic_input_projection": aggregate}
        verify_deterministic_input_projection(trace, scenario)
    early = expected_decision_input_projections("early_era_normal")
    mutated_input = early["DECISION"].replace("broad_lot_activity=Idle", "broad_lot_activity=LoadIn")
    mutated_trace = {
        "seed": EXPECTED_DECISION_SEEDS["early_era_normal"],
        "deterministic_input_projection": canonical_atom("DECISION") + "=" + canonical_atom(mutated_input),
    }
    refuse(lambda: verify_deterministic_input_projection(mutated_trace, "early_era_normal"),
           "decision:non-seed-input-field")

    replay_inputs = expected_decision_input_projections("deterministic_replay")
    replay_output = expected_replay_output_projection()
    replay_input_sha = hashlib.sha256(replay_inputs["REPLAY_A"].encode("utf-8")).hexdigest()
    replay_output_sha = hashlib.sha256(replay_output.encode("utf-8")).hexdigest()
    bundle_id, alias = RESPONSIVE_FIXTURES["EARLY"]
    replay_rows = []
    for label in ("REPLAY_A", "REPLAY_B"):
        replay_rows.append({
            "label": label,
            "seed": EXPECTED_DECISION_SEEDS["deterministic_replay"],
            "input_projection": replay_inputs[label],
            "input_projection_sha256": replay_input_sha,
            "selected_bundle_id": bundle_id,
            "selected_family": alias,
            "selected_variant_id": bundle_id + "-ACTIVE",
            "selected_context": "Active",
            "requested_transition": "Entry",
            "requested_boundary": "Immediate",
            "target_score_gain": 0.8,
            "ducking_active": False,
            "silence": False,
            "keep_current": False,
            "refusal_or_fallback_reason": "ENTRY_REQUESTED",
            "output_projection": replay_output,
            "output_projection_sha256": replay_output_sha,
        })
    verify_replay_projections({
        "seed": EXPECTED_DECISION_SEEDS["deterministic_replay"],
        "replay_projections": replay_rows,
    }, replay_inputs)
    arbitrary_rows = copy.deepcopy(replay_rows)
    arbitrary_output = replay_output.replace("selected_context=Active", "selected_context=Normal")
    arbitrary_sha = hashlib.sha256(arbitrary_output.encode("utf-8")).hexdigest()
    for row in arbitrary_rows:
        row["output_projection"] = arbitrary_output
        row["output_projection_sha256"] = arbitrary_sha
    refuse(lambda: verify_replay_projections({
        "seed": EXPECTED_DECISION_SEEDS["deterministic_replay"],
        "replay_projections": arbitrary_rows,
    }, replay_inputs), "replay:arbitrary-equal-output-hashes")

    with tempfile.TemporaryDirectory(prefix="asp01-oracle-selftest-") as directory:
        for scenario, force_mono, limited_dynamic_range in (
            ("force_mono", True, False), ("night_mix", False, True),
        ):
            input_samples, output_samples = synthesize_offline_marker(force_mono, limited_dynamic_range)
            path = Path(directory) / f"{scenario}.wav"
            path.write_bytes(pcm16_wave_bytes(output_samples))
            decoded = decode_pcm16_wave(path)[2]
            recipe = offline_marker_recipe(force_mono, limited_dynamic_range)
            marker = {
                "marker_recipe_schema": OFFLINE_MARKER_RECIPE_SCHEMA,
                "marker_recipe_sha256": hashlib.sha256(recipe.encode("utf-8")).hexdigest(),
                "marker_sample_rate_hz": OFFLINE_MARKER_SAMPLE_RATE,
                "marker_input_channels": 2, "marker_output_channels": 2,
                "marker_total_frames": OFFLINE_MARKER_TOTAL_FRAMES,
                "marker_start_frame": OFFLINE_MARKER_START_FRAME,
                "marker_tone_frames": OFFLINE_MARKER_TONE_FRAMES,
                "marker_frequency_hz": 997.0,
                "marker_base_left_amplitude": 0.9, "marker_base_right_amplitude": 0.35,
                "marker_base_right_phase_radians": 0.3,
                "marker_night_left_amplitude": 0.78 if limited_dynamic_range else 0.0,
                "marker_night_left_phase_radians": 0.08 if limited_dynamic_range else 0.0,
                "marker_night_right_amplitude": 0.62 if limited_dynamic_range else 0.0,
                "marker_night_right_phase_radians": 0.41 if limited_dynamic_range else 0.0,
                "marker_force_mono": force_mono,
                "marker_limited_dynamic_range": limited_dynamic_range,
                "marker_processor_order": "FORCE_MONO_THEN_LIMITED_DYNAMIC_RANGE",
                "marker_night_threshold": 0.32, "marker_night_ratio": 4.0,
                "marker_night_makeup": 1.08, "marker_night_clamp_min": -0.88,
                "marker_night_clamp_max": 0.88,
                "marker_quantization": OFFLINE_MARKER_QUANTIZATION,
                "marker_input_peak": max(abs(value) for value in input_samples),
                "marker_output_peak": max(abs(value) for value in output_samples),
                "first_marker_detected_seconds": 0.1,
                "marker_drift_seconds": 0.0,
                "marker_correlation": stereo_correlation(decoded),
            }
            marker_event = event_fixture(MARKER_EVENT_TYPE, bus="Master", source_id="997HZ_MARKER")
            marker_event.update(marker)
            marker_event["dsp_time"] = 0.1
            verify_event_contract(marker_event, scenario)
            verify_marker_capture(marker, path, scenario)
            malformed_marker_type = copy.deepcopy(marker_event)
            malformed_marker_type["marker_force_mono"] = 1
            refuse(lambda malformed_marker_type=malformed_marker_type, scenario=scenario:
                   verify_event_contract(malformed_marker_type, scenario),
                   f"marker:{scenario}:boolean-type")
            altered_marker = copy.deepcopy(marker)
            altered_marker["marker_night_ratio"] = 5.0
            refuse(lambda altered_marker=altered_marker, path=path, scenario=scenario:
                   verify_marker_capture(altered_marker, path, scenario),
                   f"marker:{scenario}:processor-recipe")
            altered_bytes = bytearray(path.read_bytes())
            altered_bytes[44 + OFFLINE_MARKER_START_FRAME * 4] ^= 1
            altered_path = Path(directory) / f"{scenario}-altered.wav"
            altered_path.write_bytes(altered_bytes)
            refuse(lambda marker=marker, altered_path=altered_path, scenario=scenario:
                   verify_marker_capture(marker, altered_path, scenario),
                   f"marker:{scenario}:pcm")

    return {"machine_verdict": "PASS", "mutation_refusals": mutation_count}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    arguments = parser.parse_args()
    result = self_test() if arguments.self_test else verify()
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
