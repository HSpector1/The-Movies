#!/usr/bin/env python3
"""Verify the scenario-labelled Unity Audio Oracle suite; never author trace events."""

from __future__ import annotations

import json
import math
import re
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
SUPPLEMENTAL_SCENARIOS = (
    "authority_compatibility_1940_normal",
    "save_load_across_era_compatibility",
)
EXPECTED_ALL_SCENARIOS = (*EXPECTED_SCENARIOS, *SUPPLEMENTAL_SCENARIOS)
EXPECTED_FALLBACKS = {scenario: False for scenario in EXPECTED_ALL_SCENARIOS}
EVIDENCE_SOURCES = {
    **{scenario: "UNITY_BATCH_PURE_POLICY_OR_SCHEDULER_EXECUTION" for scenario in EXPECTED_ALL_SCENARIOS},
    "early_era_normal": "UNITY_PLAYMODE_OBSERVATION",
    "normal_to_active_phrase_boundary_transition": "UNITY_PLAYMODE_OBSERVATION",
    "pause_resume": "UNITY_PLAYMODE_OBSERVATION",
    "simulated_device_reset": "UNITY_PLAYMODE_OBSERVATION",
    "four_x_simulation_unchanged_pitch_tempo": "UNITY_PLAYMODE_OBSERVATION",
    "force_mono": "UNITY_EDITOR_OFFLINE_OUTPUT_PROCESSOR_MARKER_RENDER",
    "night_mix": "UNITY_EDITOR_OFFLINE_OUTPUT_PROCESSOR_MARKER_RENDER",
    "four_hour_anti_repeat_trace": "FROZEN_EXTERNAL_TRACE_REVALIDATED_IN_UNITY_BATCH",
    "missing_file_fail_closed": "UNITY_BATCH_EXTERNAL_FILE_VALIDATOR_EXECUTION",
}
CAPTURE_SCENARIOS = {"force_mono", "night_mix"}
REQUIRED_EVENT_TYPES = {
    "early_era_normal": {"DECISION_ACCEPTED"},
    "mid_era_active": {"DECISION_ACCEPTED"},
    "modern_era_blocked": {"DECISION_ACCEPTED"},
    "normal_to_active_phrase_boundary_transition": {"SYNTHETIC_TRUSTED_NEXT_PHRASE_TRANSITION_REQUEST"},
    "active_to_blocked_hysteresis": {"HYSTERESIS_REFUSAL", "HYSTERESIS_ACCEPTANCE"},
    "adjacent_era_transition": {"ADJACENT_RENDER_ACCEPTED"},
    "workspace_continuity_without_restart": {"KEEP_CURRENT"},
    "radio_voice_ducking": {"RADIO_VOICE_TARGET", "SCORE_DUCK_TARGET"},
    "pa_interrupting_radio": {"PA_SPEECH_TARGET", "SCORE_DUCK_TARGET", "RADIO_INTERRUPTED_BY_PA"},
    "music_off_with_living_ambience": {"MIX_APPLIED"},
    "force_mono": {"MIX_APPLIED"},
    "night_mix": {"MIX_APPLIED"},
    "pause_resume": {"PAUSE_CURSOR_CAPTURED", "PAUSE_CURSOR_HELD", "RESUME_CURSOR_ADVANCED"},
    "simulated_device_reset": {"DEVICE_RESET_CURSOR_CAPTURED", "DEVICE_RESET_CURSOR_RESTORED"},
    "four_x_simulation_unchanged_pitch_tempo": {"SIMULATION_SPEED_CHANGED"},
    "four_hour_anti_repeat_trace": {"DENSITY_SIMULATION_SUMMARY"},
    "missing_file_fail_closed": {"EXTERNAL_SOURCE_VALIDATION"},
    "deterministic_replay": {"REPLAY_A", "REPLAY_B"},
    "authority_compatibility_1940_normal": {"AUTHORITY_REFUSAL"},
    "save_load_across_era_compatibility": {"SAVE_LOAD_PRESENTATION_REEVALUATION"},
}
BUS_INDEX = {
    "Master": 0, "Score": 1, "RadioMusic": 2, "Ambience": 3, "ActiveSfx": 4,
    "Ui": 5, "RadioVoice": 6, "PaHelp": 7, "MilestoneStings": 8,
}
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
    "early_era_normal": {"EXACT_BUNDLE_ID", "EXACT_VARIANT_ID", "ENTRY_FROM_SILENCE", "UNITY_TRANSPORT_SCHEDULING_OBSERVED"},
    "mid_era_active": {"EXACT_BUNDLE_ID", "EXACT_VARIANT_ID", "ENTRY_FROM_SILENCE"},
    "modern_era_blocked": {"EXACT_BUNDLE_ID", "EXACT_VARIANT_ID", "ENTRY_FROM_SILENCE"},
    "normal_to_active_phrase_boundary_transition": {
        "REQUESTED_NEXT_PHRASE", "SYNTHETIC_TRUSTED_GRID_APPLIES_NEXT_PHRASE",
        "SYNTHETIC_NEXT_PHRASE_DEADLINE_IS_EXACT", "UNITY_TRANSPORT_PHRASE_SCHEDULING_OBSERVED",
    },
    "active_to_blocked_hysteresis": {"BLOCKED_HELD_BEFORE_5S", "BLOCKED_ACCEPTED_AT_5S_AFTER_45S_DWELL"},
    "adjacent_era_transition": {"ERA_TRUTH_NOT_MANUFACTURED", "HONEST_RENDER_TREATMENT"},
    "workspace_continuity_without_restart": {"NO_RESTART"},
    "radio_voice_ducking": {"SPEECH_AND_SCORE_DUCK_BUS_TARGETS_EXPLICIT", "VOICE_DUCKS_SCORE", "CAPTION_AND_SPOKEN_DERIVE_FROM_TYPED_PAYLOAD"},
    "pa_interrupting_radio": {"SPEECH_AND_SCORE_DUCK_BUS_TARGETS_EXPLICIT", "PA_INTERRUPTION_DISPOSITION_EXPLICIT", "PA_INTERRUPTS", "CAPTION_AND_SPOKEN_DERIVE_FROM_TYPED_PAYLOAD"},
    "music_off_with_living_ambience": {"EXPLICIT_SCORE_AND_AMBIENCE_BUS_TARGET_EVENTS", "MUSIC_OFF_AMBIENCE_REMAINS"},
    "force_mono": {"EXPLICIT_SCORE_AND_AMBIENCE_BUS_TARGET_EVENTS", "FORCE_MONO_ENABLED", "PCM_MARKER_DETECTED_WITHIN_ONE_FRAME", "OFFLINE_RUNTIME_FORCE_MONO_CHANNEL_EQUALITY"},
    "night_mix": {"EXPLICIT_SCORE_AND_AMBIENCE_BUS_TARGET_EVENTS", "NIGHT_LIMITER_ENABLED", "PCM_MARKER_DETECTED_WITHIN_ONE_FRAME", "OFFLINE_RUNTIME_NIGHT_PEAK_REDUCTION"},
    "pause_resume": {"PAUSE_CURSOR_HELD_WITHIN_256_SAMPLES", "RESUME_CURSOR_ADVANCED_FROM_PRESERVED_OFFSET", "RUNTIME_SAMPLE_CURSOR_PRESERVATION_OBSERVED"},
    "simulated_device_reset": {"DEVICE_RESET_CURSOR_NOT_RESTARTED", "RUNTIME_SAMPLE_CURSOR_PRESERVATION_OBSERVED"},
    "four_x_simulation_unchanged_pitch_tempo": {"PITCH_TEMPO_SCALES_REMAIN_ONE", "PITCH_TEMPO_EVENT_FIELDS_EXPLICIT", "UNITY_SOURCE_PITCH_ONE_OBSERVED"},
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
    payload = json.loads(path.read_text(encoding="utf-8"))
    if schema is not None:
        require(payload.get("schema") == schema, f"schema mismatch: {path}")
    return path, payload


def trace_assertions_pass(value: Any) -> bool:
    return (
        isinstance(value, list)
        and bool(value)
        and all(isinstance(row, dict) and isinstance(row.get("id"), str) and row["id"] and row.get("passed") is True for row in value)
    )


def nonempty_string(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def bus_is(event: dict[str, Any], expected: str) -> bool:
    return event.get("bus") in {expected, BUS_INDEX[expected]}


def near(value: Any, expected: float, tolerance: float = 1e-5) -> bool:
    return (isinstance(value, (int, float)) and not isinstance(value, bool)
            and math.isfinite(float(value)) and abs(float(value) - expected) <= tolerance)


def verify_trace_contract(trace: dict[str, Any], scenario: str) -> None:
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
        require((isinstance(bus, int) and not isinstance(bus, bool) and 0 <= bus <= 8)
                or bus in {"Master", "Score", "RadioMusic", "Ambience", "ActiveSfx", "Ui", "RadioVoice", "PaHelp", "MilestoneStings"},
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
        deadline = event.get("requested_dsp_deadline")
        require(deadline is None or (isinstance(deadline, (int, float)) and not isinstance(deadline, bool)
                and math.isfinite(float(deadline)) and float(deadline) >= 0.0), f"trace DSP deadline is invalid: {scenario}")
        event_types.add(event["event_type"])
    require(REQUIRED_EVENT_TYPES[scenario] <= event_types, f"trace required DSP event type missing: {scenario}")
    require("SOURCE_AUDIO_IDENTITY_EVIDENCE" in assertion_ids,
            f"trace source-audio identity assertion missing: {scenario}")
    require(REQUIRED_ASSERTION_IDS.get(scenario, set()) <= assertion_ids,
            f"trace required semantic assertion missing: {scenario}")
    if scenario in SELECTED_CUE_SCENARIOS:
        require(nonempty_string(trace.get("selected_cue_id")), f"trace selected cue missing: {scenario}")
    if scenario in SELECTED_VARIANT_SCENARIOS:
        require(nonempty_string(trace.get("selected_variant_id")), f"trace selected variant missing: {scenario}")
    if scenario == "normal_to_active_phrase_boundary_transition":
        phrase_events = [event for event in events if event["event_type"] == "SYNTHETIC_TRUSTED_NEXT_PHRASE_TRANSITION_REQUEST"]
        require(trace.get("music_epoch_id") == "acoustic_electrical_1920_1932"
                and trace.get("requested_context") == "ACTIVE" and trace.get("selected_context") == "ACTIVE"
                and trace.get("requested_transition_boundary") in {3, "NextPhrase"}
                and trace.get("transition_boundary") in {3, "NextPhrase"}
                and len(events) == len(phrase_events) == 1
                and phrase_events[0].get("source_id") == trace.get("selected_variant_id")
                and near(phrase_events[0].get("dsp_time"), 0.0)
                and bus_is(phrase_events[0], "Score") and near(phrase_events[0].get("gain"), 1.0)
                and phrase_events[0].get("scheduler_api_accepted") is True
                and near(phrase_events[0].get("requested_dsp_deadline"), 106.0),
                "synthetic trusted-grid phrase transition was not scheduled at NextPhrase")
    if scenario == "adjacent_era_transition":
        adjacent_events = [event for event in events if event["event_type"] == "ADJACENT_RENDER_ACCEPTED"]
        require(trace.get("music_epoch_id") == "acoustic_electrical_1920_1932->network_sound_1933_1945"
                and trace.get("selected_variant_id") == "ASP01-TRANSITION-AE-TO-NS-SAFE-UNVERIFIED-WINDOW-CROSSFADE"
                and trace.get("requested_authority") == "P13_FUTURE_TYPED_ELIGIBILITY_FIXTURE"
                and trace.get("accepted_authority") == "AUDIO_TRANSITION_PRESENTATION_ONLY"
                and trace.get("requested_transition_boundary") in {4, "SafeCrossfade"}
                and trace.get("transition_boundary") in {4, "SafeCrossfade"}
                and len(events) == len(adjacent_events) == 1
                and adjacent_events[0].get("source_id") == trace.get("selected_variant_id")
                and near(adjacent_events[0].get("dsp_time"), 0.12)
                and near(adjacent_events[0].get("requested_dsp_deadline"), 0.12)
                and bus_is(adjacent_events[0], "Score") and near(adjacent_events[0].get("gain"), 1.0)
                and adjacent_events[0].get("scheduler_api_accepted") is False,
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
                and hysteresis_events[0].get("detail") == "CONTEXT_HYSTERESIS"
                and near(hysteresis_events[0].get("requested_dsp_deadline"), 5.0)
                and near(hysteresis_events[1].get("requested_dsp_deadline"), 5.0)
                and hysteresis_events[1].get("source_id") == trace.get("selected_variant_id"),
                "Blocked hysteresis does not refuse immediately before and accept exactly at the five-second boundary")
    if scenario == "workspace_continuity_without_restart":
        keep_events = [event for event in events if event["event_type"] == "KEEP_CURRENT"]
        require(trace.get("requested_context") == "WORKSPACE_LOW_DENSITY" and trace.get("selected_context") == "NORMAL"
                and len(events) == len(keep_events) == 1 and keep_events[0].get("source_id") == trace.get("selected_variant_id")
                and keep_events[0].get("detail") == "WORKSPACE_CONTINUITY"
                and bus_is(keep_events[0], "Score") and near(keep_events[0].get("gain"), 1.0)
                and trace.get("requested_transition_boundary") in {0, "None"}
                and trace.get("transition_boundary") in {0, "None"},
                "Workspace continuity does not explicitly keep the current cue without a transition/restart")
    if scenario in {"radio_voice_ducking", "pa_interrupting_radio"}:
        speech = trace["speech_event_ids"]
        captions = trace["captions"]
        require(speech and captions and len(speech) == len(captions)
                and all(nonempty_string(value) for value in (*speech, *captions)), f"radio/PA speech-caption proof missing: {scenario}")
        require(all(nonempty_string(trace.get(key)) for key in ("owner_domain", "event_id", "receipt_id")), f"radio/PA typed payload identity missing: {scenario}")
        expected_speech_type = "PA_SPEECH_TARGET" if scenario == "pa_interrupting_radio" else "RADIO_VOICE_TARGET"
        expected_speech_bus = "PaHelp" if scenario == "pa_interrupting_radio" else "RadioVoice"
        expected_duck = 10 ** ((-12.0 if scenario == "pa_interrupting_radio" else -8.0) / 20.0)
        expected_event_order = (["PA_SPEECH_TARGET", "SCORE_DUCK_TARGET", "RADIO_INTERRUPTED_BY_PA"]
                                if scenario == "pa_interrupting_radio"
                                else ["RADIO_VOICE_TARGET", "SCORE_DUCK_TARGET"])
        require([event["event_type"] for event in events] == expected_event_order
                and all(near(event.get("dsp_time"), 0.0) and near(event.get("requested_dsp_deadline"), 0.0)
                        for event in events)
                and events[0].get("source_id") == speech[0]
                and events[1].get("source_id") == speech[0]
                and events[0]["event_type"] == expected_speech_type and bus_is(events[0], expected_speech_bus)
                and near(events[0]["gain"], 1.0) and events[0]["scheduler_api_accepted"] is True,
                f"radio/PA explicit speech-bus target failed: {scenario}")
        require(events[1]["event_type"] == "SCORE_DUCK_TARGET" and bus_is(events[1], "Score")
                and near(events[1]["gain"], expected_duck) and events[1]["scheduler_api_accepted"] is True,
                f"radio/PA explicit Score duck target failed: {scenario}")
        require({"SPEECH_AND_SCORE_DUCK_BUS_TARGETS_EXPLICIT", "CAPTION_AND_SPOKEN_DERIVE_FROM_TYPED_PAYLOAD"} <= assertion_ids,
                f"radio/PA semantic assertions missing: {scenario}")
        if scenario == "pa_interrupting_radio":
            require(events[2]["event_type"] == "RADIO_INTERRUPTED_BY_PA" and bus_is(events[2], "RadioVoice")
                    and near(events[2]["gain"], 0.0) and events[2]["scheduler_api_accepted"] is True
                    and "PA_INTERRUPTION_DISPOSITION_EXPLICIT" in assertion_ids,
                    "PA interruption disposition is not explicit")
    if scenario in {"music_off_with_living_ambience", "force_mono", "night_mix"}:
        require(any(event["event_type"] == "BUS_TARGET_GAIN" and bus_is(event, "Score") for event in events)
                and any(event["event_type"] == "BUS_TARGET_GAIN" and bus_is(event, "Ambience") for event in events)
                and "EXPLICIT_SCORE_AND_AMBIENCE_BUS_TARGET_EVENTS" in assertion_ids,
                f"mix trace lacks explicit Score/Ambience target events: {scenario}")
        if scenario == "music_off_with_living_ambience":
            require([event["event_type"] for event in events] == ["MIX_APPLIED", "BUS_TARGET_GAIN", "BUS_TARGET_GAIN"]
                    and bus_is(events[0], "Master") and bus_is(events[1], "Score") and bus_is(events[2], "Ambience")
                    and near(events[1]["gain"], 0.0) and float(events[2]["gain"]) > 0.0,
                    "Music Off does not explicitly preserve living ambience")
        elif scenario == "force_mono":
            require([event["event_type"] for event in events] == [
                        "MIX_APPLIED", "BUS_TARGET_GAIN", "BUS_TARGET_GAIN",
                        "FORCE_MONO_POLICY_ENABLED", "OFFLINE_RUNTIME_PROCESSOR_PCM_MARKER",
                    ]
                    and [bus_is(event, bus) for event, bus in zip(events, ("Master", "Score", "Ambience", "Master", "Master"))] == [True] * 5
                    and "FORCE_MONO_ENABLED" in assertion_ids,
                    "Force Mono policy event/assertion missing")
        else:
            require([event["event_type"] for event in events] == [
                        "MIX_APPLIED", "BUS_TARGET_GAIN", "BUS_TARGET_GAIN",
                        "LIMITED_DYNAMIC_RANGE_POLICY_ENABLED", "OFFLINE_RUNTIME_PROCESSOR_PCM_MARKER",
                    ]
                    and [bus_is(event, bus) for event, bus in zip(events, ("Master", "Score", "Ambience", "Master", "Master"))] == [True] * 5
                    and "NIGHT_LIMITER_ENABLED" in assertion_ids,
                    "Night limited-dynamic-range policy event/assertion missing")
        if scenario in CAPTURE_SCENARIOS:
            marker = events[-1]
            require(marker.get("source_id") == "997HZ_MARKER"
                    and near(marker.get("dsp_time"), 0.1) and near(marker.get("requested_dsp_deadline"), 0.1)
                    and near(marker.get("gain"), 1.0) and marker.get("scheduler_api_accepted") is False
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
                        "PAUSE_CURSOR_CAPTURED", "PAUSE_CURSOR_HELD", "RESUME_CURSOR_ADVANCED",
                    ]
                    and all(event.get("source_id") == "HASHED_CLIP" and bus_is(event, "Score")
                            and near(event.get("gain"), 1.0) and event.get("scheduler_api_accepted") is True
                            and event.get("requested_dsp_deadline") is None for event in events)
                    and all(near(event["dsp_time"], expected, 1e-9)
                            for event, expected in zip(events, (0.0, 0.15, 0.35)))
                    and events[0].get("detail") == f"sample_cursor_before={before}"
                    and events[1].get("detail") == f"sample_cursor_before={before};sample_cursor_during={during}"
                    and events[2].get("detail") == f"sample_cursor_during={during};sample_cursor_after={after}",
                    "pause/resume cursor capture, hold, and advance sequence is not exact")
        else:
            require(during is None and after >= before
                    and [event["event_type"] for event in events] == [
                        "DEVICE_RESET_CURSOR_CAPTURED", "DEVICE_RESET_CURSOR_RESTORED",
                    ]
                    and all(event.get("source_id") == "HASHED_CLIP" and bus_is(event, "Score")
                            and near(event.get("gain"), 1.0) and event.get("scheduler_api_accepted") is True
                            and event.get("requested_dsp_deadline") is None for event in events)
                    and all(near(event["dsp_time"], expected, 1e-9)
                            for event, expected in zip(events, (0.0, 0.35)))
                    and events[0].get("detail") == f"sample_cursor_before={before}"
                    and events[1].get("detail") == f"sample_cursor_before={before};sample_cursor_after={after}",
                    "device-reset cursor capture and restored sequence is not exact")
    if scenario == "four_x_simulation_unchanged_pitch_tempo":
        require(len(events) == 1 and events[0].get("event_type") == "SIMULATION_SPEED_CHANGED"
                and events[0].get("source_id") == "4X"
                and bus_is(events[0], "Score") and near(events[0].get("gain"), 1.0)
                and near(events[0].get("pitch_scale"), 1.0) and near(events[0].get("tempo_scale"), 1.0)
                and near(events[0].get("dsp_time"), 0.0) and near(events[0].get("requested_dsp_deadline"), 0.0)
                and events[0].get("scheduler_api_accepted") is True
                and {"PITCH_TEMPO_SCALES_REMAIN_ONE", "PITCH_TEMPO_EVENT_FIELDS_EXPLICIT"} <= assertion_ids,
                "4x simulation lacks explicit independent pitch/tempo-one fields")
    if scenario == "missing_file_fail_closed":
        require(trace.get("failure_or_refusal") == "SOURCE_FILE_MISSING"
                and trace.get("source_audio_disposition") == "EXPECTED_SOURCE_ABSENCE_FAIL_CLOSED"
                and len(events) == 1 and events[0].get("event_type") == "EXTERNAL_SOURCE_VALIDATION"
                and events[0].get("source_id") == "MISSING-FIXTURE" and bus_is(events[0], "Score")
                and near(events[0].get("gain"), 0.0) and events[0].get("scheduler_api_accepted") is False,
                "missing-file refusal is not exact")
    if scenario == "authority_compatibility_1940_normal":
        require(trace.get("calendar_year") == 1940 and trace.get("music_epoch_id") == "network_sound_1933_1945"
                and trace.get("requested_authority") == "P13_GLOBAL_ERA_TRUTH_FIXTURE"
                and trace.get("accepted_authority") == "REFUSED_NOT_IN_THREE_ANCHOR_LAB_ELIGIBILITY_SET"
                and trace.get("failure_or_refusal") == "AUDIO_LAB_DOES_NOT_MANUFACTURE_P13_ERA_MAPPING"
                and trace.get("source_audio_disposition") == "NO_SOURCE_SELECTED_DUE_TO_AUTHORITY_REFUSAL"
                and len(events) == 1 and events[0].get("event_type") == "AUTHORITY_REFUSAL"
                and events[0].get("source_id") == "network_sound_1933_1945"
                and bus_is(events[0], "Score") and near(events[0].get("gain"), 0.0),
                "authority refusal boundary missing")
    if scenario == "deterministic_replay":
        replay_events = [event for event in events if event["event_type"] in {"REPLAY_A", "REPLAY_B"}]
        fingerprints = [str(event.get("detail", "")).removeprefix("decision_projection_sha=") for event in replay_events]
        require(len(events) == len(replay_events) == 2
                and [event["event_type"] for event in replay_events] == ["REPLAY_A", "REPLAY_B"]
                and len(fingerprints) == 2 and fingerprints[0] == fingerprints[1]
                and all(event.get("source_id") == trace.get("selected_variant_id")
                        and bus_is(event, "Score") and near(event.get("gain"), 1.0)
                        and near(event.get("requested_dsp_deadline"), 0.12)
                        and event.get("scheduler_api_accepted") is False for event in replay_events)
                and re.fullmatch(r"[0-9a-f]{16}", fingerprints[0]) is not None
                and "COMPLETE_DECISION_OUTPUT_PROJECTION_IDENTICAL" in assertion_ids,
                "deterministic replay does not prove the full decision-output projection")
    if scenario == "save_load_across_era_compatibility":
        require(trace.get("music_epoch_id") == "streaming_plural_2015_2029"
                and trace.get("requested_authority") == "P13_ELIGIBILITY_AFTER_LOAD"
                and trace.get("accepted_authority") == "AUDIO_PRESENTATION_REEVALUATED_WITHOUT_SAVED_CUE_TRUTH"
                and trace.get("pause_or_reset_action") == "LOAD_INTO_DIFFERENT_ERA_REEVALUATE_ELIGIBILITY"
                and len(events) == 1 and events[0].get("event_type") == "SAVE_LOAD_PRESENTATION_REEVALUATION"
                and events[0].get("source_id") == trace.get("selected_variant_id")
                and bus_is(events[0], "Score") and near(events[0].get("gain"), 1.0)
                and events[0].get("scheduler_api_accepted") is False,
                "save/load presentation did not re-evaluate supplied eligibility without loading cue truth")
    expected_fallback = EXPECTED_FALLBACKS[scenario]
    require(trace.get("expected_fallback") is expected_fallback,
            f"trace fallback disposition differs from scenario-owned authority: {scenario}")
    require((trace.get("machine_verdict") == "PASS_WITH_DECLARED_FALLBACK") == expected_fallback,
            f"trace fallback verdict/disposition mismatch: {scenario}")


def verify() -> dict[str, Any]:
    suite = json.loads(SUITE_PATH.read_text(encoding="utf-8"))
    require(suite.get("schema") == "project-studio-audio-oracle-suite/v1", "unexpected Oracle suite schema")
    require(suite.get("status") == "PROTOTYPE_ONLY", "Oracle status exceeds prototype boundary")
    require(suite.get("machine_verdict") == "PASS", "Oracle suite did not pass")
    require(suite.get("required_scenario_count") == 18, "Oracle required scenario count is not 18")
    require(suite.get("scenario_count") == len(suite.get("scenarios", [])) == 20, "Oracle scenario cardinality mismatch")
    require(tuple(suite.get("required_scenarios", [])) == EXPECTED_SCENARIOS, "Oracle required scenario identities/order mismatch")
    source_shas = suite.get("source_git_shas", {})
    require(source_shas.get("documentation") == git_head(DOC_REPO), "Oracle documentation SHA is stale")
    require(source_shas.get("unity_audio_lab") == git_head(UNITY_REPO), "Oracle Unity SHA is stale")

    binary = pilot_path(suite["lab_binary"]["path"])
    require(binary.is_file() and sha256_file(binary) == suite["lab_binary"]["sha256"], "Oracle binary identity mismatch")
    require(pilot_path(suite["catalogue"]["path"]) == SYSTEM_REGISTER.resolve(), "Oracle does not bind the v5 system register")
    require(sha256_file(SYSTEM_REGISTER) == suite["catalogue"]["sha256"], "Oracle catalogue identity mismatch")
    system = json.loads(SYSTEM_REGISTER.read_text(encoding="utf-8"))
    require(system.get("schema") == "project-studio-system-audio-asset-register/v5"
            and system.get("status") in {"PROTOTYPE_ONLY", "PROTOTYPE_READY_FOR_OWNER_AUDITION"},
            "Oracle-bound system register schema/status mismatch")
    system_items = system.get("items", [])
    system_by_id = {row.get("id"): row for row in system_items}
    require(None not in system_by_id and len(system_by_id) == len(system_items), "Oracle-bound system item IDs are duplicate/missing")
    system_by_source_alias: dict[str, dict[str, Any]] = {}
    for item in system_items:
        for alias in (item["id"], item.get("source_asset_id")):
            if not alias:
                continue
            require(alias not in system_by_source_alias, f"system-register source alias is ambiguous: {alias}")
            system_by_source_alias[alias] = item
    _, observations = load_verified(suite["runtime_observations"], schema="project-studio-audio-oracle-runtime-observations/v1")
    require(pilot_path(suite["runtime_observations"]["path"]) == RUNTIME_OBSERVATIONS.resolve(), "Oracle runtime-observation path mismatch")
    require(observations.get("observation_source") == "UNITY_PLAYMODE_OBSERVATION", "Oracle observations are not labelled Unity PlayMode evidence")
    expected_source_summary: dict[str, int] = {}
    for source in EVIDENCE_SOURCES.values():
        expected_source_summary[source] = expected_source_summary.get(source, 0) + 1
    require(suite.get("evidence_source_summary") == expected_source_summary, "Oracle evidence-source summary mismatch")

    scenario_names: list[str] = []
    required_names: list[str] = []
    marker_render_count = 0
    force_mono_channels = None
    capture_scenarios: set[str] = set()
    for expected_number, row in enumerate(suite["scenarios"], start=1):
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
            require(isinstance(identity, dict) and identity.get("source_id") and identity.get("evidence_role"), f"trace source identity incomplete: {scenario}")
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
                decision_events = [event for event in trace["dsp_events"] if event.get("event_type") == "DECISION_ACCEPTED"]
                require(selected_item.get("role") == "RESPONSIVE_VARIANT"
                        and selected_item.get("epoch") == expected_epoch
                        and selected_item.get("context") == expected_context
                        and trace.get("music_epoch_id") == expected_epoch
                        and trace.get("requested_context") == expected_context
                        and trace.get("selected_context") == expected_context
                        and len(trace["dsp_events"]) == 1
                        and len(decision_events) == 1
                        and near(decision_events[0].get("dsp_time"), 0.0)
                        and decision_events[0].get("source_id") == selected_item["id"]
                        and bus_is(decision_events[0], "Score") and near(decision_events[0].get("gain"), 1.0)
                        and near(decision_events[0].get("requested_dsp_deadline"), 0.12),
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
            marker_render_count += 1
            if scenario == "force_mono":
                force_mono_channels = actual_probe["channels"]
        else:
            require(not trace.get("capture_path") and not trace.get("capture_sha256"), f"unpublished trace capture: {scenario}")
    require(len(scenario_names) == len(set(scenario_names)), "duplicate Oracle scenario")
    require(tuple(scenario_names) == EXPECTED_ALL_SCENARIOS, "Oracle total scenario identities/order mismatch")
    require(tuple(required_names) == EXPECTED_SCENARIOS, "required Oracle scenario rows mismatch")
    require(capture_scenarios == CAPTURE_SCENARIOS and marker_render_count == 2 and force_mono_channels == 1, "offline processor marker-render scenario coverage or mono proof missing")

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
        "documentation_sha": source_shas["documentation"],
        "unity_sha": source_shas["unity_audio_lab"],
        "limitations": "Machine proof does not equal listening acceptance.",
    }


def main() -> None:
    print(json.dumps(verify(), indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
