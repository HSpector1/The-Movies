#!/usr/bin/env python3
"""Render hash-bound eight-bus accessibility mix demonstrations at the final sum."""

from __future__ import annotations

import argparse
import json
import hashlib
import math
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from common import PILOT_ROOT, atomic_write_json, canonical_contained, probe_audio, sha256_file


CREATED_AT = "2026-09-03T00:00:00Z"
REGISTER_PATH = PILOT_ROOT / "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v5.json"
OUTPUT_ROOT = PILOT_ROOT / "07_audio-oracle/accessibility-renders-v4"
BUS_ROOT = OUTPUT_ROOT / "bus-contributions"
PRESET_PATH = OUTPUT_ROOT / "ACCESSIBILITY-PRESETS.v4.json"
BUS_MANIFEST_PATH = OUTPUT_ROOT / "ACCESSIBILITY-BUS-CONTRIBUTIONS.v4.json"
DURATION = 45.0

SOURCE_IDS = {
    "SCORE": "ASP01-BUNDLE-EARLY-NORMAL",
    "RADIO_MUSIC": "APS01-MUSIC-FND-01__seed-155921",
    "AMBIENCE": "ASP01-LIVING-FIXTURE-IDLE-V2",
    "ACTIVE_SFX": "ASP01-SFX-CLOSE-CAMERA",
    "UI": "ASP01-UI-FOCUS-C1",
    "RADIO_VOICE": "ASP01-RADIO-VOICE-E02-FUNCTIONAL-PERIOD",
    "PA_HELP": "ASP01-RADIO-VOICE-E02-PA-PERIOD",
    "MILESTONE_STINGS": "ASP01-RADIO-MILESTONE-STING-01",
}
SOURCE_ROLES = {
    "SCORE": "RESPONSIVE_VARIANT", "RADIO_MUSIC": "ERA_PICK", "AMBIENCE": "LIVING_MIX",
    "ACTIVE_SFX": "LOT_DETAIL_SFX", "UI": "MANAGEMENT_CANDIDATE", "RADIO_VOICE": "RADIO_VOICE",
    "PA_HELP": "PA_VOICE", "MILESTONE_STINGS": "MILESTONE_STING",
}


BASE_PRESETS: dict[str, dict[str, Any]] = {
    "STANDARD": {
        "bus_gains_db": {"SCORE": -3, "RADIO_MUSIC": -5, "AMBIENCE": -7, "ACTIVE_SFX": -4, "UI": -5, "RADIO_VOICE": 0, "PA_HELP": 0, "MILESTONE_STINGS": -3},
        "master_gain_db": 0,
        "final_filter": "alimiter=limit=0.92",
    },
    "SPEECH_FIRST": {
        "bus_gains_db": {"SCORE": -12, "RADIO_MUSIC": -15, "AMBIENCE": -10, "ACTIVE_SFX": -10, "UI": -7, "RADIO_VOICE": 2, "PA_HELP": 2, "MILESTONE_STINGS": -8},
        "master_gain_db": 0,
        "final_filter": "highpass=f=55,acompressor=threshold=-24dB:ratio=2.5:attack=12:release=180,alimiter=limit=0.88",
        "optional_focus_select_suppression": True,
        "management_global_concurrency_cap": 3,
    },
    "NIGHT_LIMITED_DYNAMIC_RANGE": {
        "bus_gains_db": {"SCORE": -7, "RADIO_MUSIC": -10, "AMBIENCE": -10, "ACTIVE_SFX": -12, "UI": -10, "RADIO_VOICE": -2, "PA_HELP": -2, "MILESTONE_STINGS": -12},
        "master_gain_db": -3,
        "final_filter": "acompressor=threshold=-28dB:ratio=5:attack=25:release=260,alimiter=limit=0.65",
        "management_global_concurrency_cap": 2,
    },
    "MUSIC_LIGHT": {
        "bus_gains_db": {"SCORE": -14, "RADIO_MUSIC": -12, "AMBIENCE": -5, "ACTIVE_SFX": -4, "UI": -5, "RADIO_VOICE": 0, "PA_HELP": 0, "MILESTONE_STINGS": -5},
        "master_gain_db": 0,
        "final_filter": "alimiter=limit=0.88",
    },
    "MUSIC_OFF": {
        "bus_gains_db": {"SCORE": -80, "RADIO_MUSIC": -80, "AMBIENCE": -4, "ACTIVE_SFX": -4, "UI": -5, "RADIO_VOICE": 0, "PA_HELP": 0, "MILESTONE_STINGS": -5},
        "master_gain_db": 0,
        "final_filter": "alimiter=limit=0.88",
    },
}
COMPOSITION_LAW = {
    "base_profile": "Select exactly one of STANDARD, SPEECH_FIRST, NIGHT_LIMITED_DYNAMIC_RANGE, MUSIC_LIGHT, or MUSIC_OFF.",
    "force_mono": "Independent final-sum overlay; does not reset the selected base profile or user levels.",
    "user_precedence": "Per-bus user adjustments apply after base-profile defaults and before final-sum overlays; persistence is not proved by this renderer or lab UI.",
}
OVERLAYS = [{"id": "FORCE_MONO", "stage": "FINAL_SUM", "composable": True}]
NON_RENDER_CLAIMS = {
    "captions_before_first_functional_voice": "NOT_EVIDENCED_BY_OFFLINE_RENDER; REQUIRES UNITY TEST_AND_OWNER_CHECK",
    "transcript_history": "NOT_EVIDENCED_BY_OFFLINE_RENDER; REQUIRES UNITY TEST_AND_OWNER_CHECK",
    "important_sound_captions": "NOT_EVIDENCED_BY_OFFLINE_RENDER; REQUIRES UNITY TEST_AND_OWNER_CHECK",
    "keyboard_operability": "NOT_EVIDENCED_BY_OFFLINE_RENDER; REQUIRES UNITY TEST_AND_OWNER_CHECK",
    "controller_operability": "NOT_EVIDENCED_BY_OFFLINE_RENDER; REQUIRES UNITY TEST_AND_OWNER_CHECK",
    "radio_off_has_no_mechanical_loss": "NOT_EVIDENCED_BY_OFFLINE_RENDER; REQUIRES UNITY TEST_AND_OWNER_CHECK",
    "no_critical_audio_only_information": "ARCHITECTURAL REQUIREMENT; HUMAN_AND_RUNTIME_REVIEW_PENDING",
    "screen_reader_semantics": "NOT_PROVED; IMMEDIATE-MODE LAB UI HAS NO CLAIMED SCREEN-READER CONFORMANCE",
    "preference_persistence": "NOT_IMPLEMENTED_OR_PROVED_BY_THIS LAB",
}
LIMITATIONS = [
    "The renders prove source hashes, isolated bus contributions, final-sum channel count, and bounded signal processing only.",
    "Speech intelligibility, mono phase safety, comfort, control reachability, caption usability, and disabled-player acceptance require human review.",
]


def pick(items: list[dict[str, Any]], item_id: str) -> dict[str, Any]:
    matches = [item for item in items if item.get("id") == item_id]
    if len(matches) != 1:
        raise RuntimeError(f"missing or duplicate accessibility source ID: {item_id}")
    item = matches[0]
    path = canonical_contained(PILOT_ROOT, Path(item["path"]))
    if sha256_file(path) != item["sha256"]:
        raise RuntimeError(f"source hash mismatch: {path}")
    return item


def db_linear(db: float) -> float:
    return 10 ** (db / 20)


def run_atomic(argv: list[str], destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temp_name = tempfile.mkstemp(prefix=f".{destination.stem}.", suffix=destination.suffix, dir=destination.parent)
    os.close(descriptor)
    temp = Path(temp_name)
    temp.unlink()
    completed = subprocess.run([str(temp) if value == "{OUTPUT}" else value for value in argv], capture_output=True, text=True)
    if completed.returncode != 0:
        temp.unlink(missing_ok=True)
        raise RuntimeError(f"render failed: {completed.stderr[-3000:]}")
    os.chmod(temp, 0o444)
    os.replace(temp, destination)


def canonical_sha256(value: Any) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":")).encode("utf-8")).hexdigest()


def render_and_validate(path: Path, command: list[str], expected_channels: int) -> dict[str, Any]:
    # Build mode never blesses cached bytes. Every contribution/preset is atomically
    # regenerated from its exact source+command recipe; verify() remains read-only.
    run_atomic(command, path)
    probe = probe_audio(path)
    if abs(probe["duration_seconds"] - DURATION) > 0.1 or probe["channels"] != expected_channels:
        raise RuntimeError(f"render structure mismatch: {path}: {probe}")
    return {"path": str(path), "sha256": sha256_file(path), "probe": probe}


def bus_source_records(register: dict[str, Any]) -> dict[str, dict[str, Any]]:
    items = register["items"]
    placements = {
        "SCORE": "looped 0–45 s", "RADIO_MUSIC": "looped 0–45 s", "AMBIENCE": "0–45 s",
        "ACTIVE_SFX": "5 s", "UI": "10 s", "RADIO_VOICE": "15 s", "PA_HELP": "32 s",
        "MILESTONE_STINGS": "30 s",
    }
    result: dict[str, dict[str, Any]] = {}
    for bus, item_id in SOURCE_IDS.items():
        item = pick(items, item_id)
        relative = Path(item.get("relative_path", ""))
        if (relative.is_absolute() or relative.as_posix() != item.get("relative_path")
                or "." in relative.parts or ".." in relative.parts):
            raise RuntimeError(f"noncanonical accessibility source relative path: {item_id}")
        path = canonical_contained(PILOT_ROOT, Path(item["path"]))
        projected = canonical_contained(PILOT_ROOT, PILOT_ROOT / relative)
        if (item.get("role") != SOURCE_ROLES[bus] or path != projected
                or item["path"] != str(path) or sha256_file(path) != item.get("sha256")):
            raise RuntimeError(f"accessibility source identity/role/path projection failed: {bus}/{item_id}")
        result[bus] = {
            "id": item["id"],
            "role": item["role"],
            "path": item["path"],
            "relative_path": item["relative_path"],
            "sha256": item["sha256"],
            "placement": placements[bus],
        }
    return result


def bus_command(bus: str, source: dict[str, Any]) -> list[str]:
    if bus in {"SCORE", "RADIO_MUSIC"}:
        input_args = ["-stream_loop", "-1", "-i", source["path"]]
        filter_graph = f"[0:a]atrim=duration={DURATION},asetpts=PTS-STARTPTS,volume=0.35,aresample=48000[out]"
    elif bus == "AMBIENCE":
        input_args = ["-i", source["path"]]
        filter_graph = f"[0:a]atrim=duration={DURATION},asetpts=PTS-STARTPTS,volume=0.45,aresample=48000[out]"
    else:
        delay = {"ACTIVE_SFX": 5000, "UI": 10000, "RADIO_VOICE": 15000, "PA_HELP": 32000, "MILESTONE_STINGS": 30000}[bus]
        input_args = ["-i", source["path"]]
        filter_graph = f"[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,adelay={delay}|{delay},apad=whole_dur={DURATION},atrim=duration={DURATION}[out]"
    return [
        "ffmpeg", "-nostdin", "-v", "error", "-y", *input_args,
        "-filter_complex", filter_graph, "-map", "[out]", "-t", str(DURATION),
        "-ar", "48000", "-ac", "2", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "{OUTPUT}",
    ]


def render_bus_contributions(sources: dict[str, dict[str, Any]]) -> dict[str, dict[str, Any]]:
    records: dict[str, dict[str, Any]] = {}
    for bus, source in sources.items():
        path = BUS_ROOT / f"{bus}.m4a"
        command = bus_command(bus, source)
        recipe_sha = canonical_sha256({"source_sha256": source["sha256"], "command": command})
        records[bus] = render_and_validate(path, command, 2)
        records[bus]["source"] = source
        records[bus]["render_recipe_sha256"] = recipe_sha
    return records


def preset_command(spec: dict[str, Any], buses: dict[str, dict[str, Any]], *, force_mono: bool) -> list[str]:
    ordered = list(buses)
    inputs: list[str] = []
    filters: list[str] = []
    labels = []
    for index, bus in enumerate(ordered):
        inputs.extend(["-i", buses[bus]["path"]])
        gain = db_linear(float(spec["bus_gains_db"][bus]))
        filters.append(f"[{index}:a]volume={gain:.10f}[b{index}]")
        labels.append(f"[b{index}]")
    filters.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:dropout_transition=0[mix]")
    master = db_linear(float(spec["master_gain_db"]))
    final = f"volume={master:.10f},{spec['final_filter']}"
    if force_mono:
        final += ",pan=mono|c0=0.5*c0+0.5*c1"
    filters.append(f"[mix]{final}[out]")
    return [
        "ffmpeg", "-nostdin", "-v", "error", "-y", *inputs,
        "-filter_complex", ";".join(filters), "-map", "[out]", "-t", str(DURATION),
        "-ar", "48000", "-ac", "1" if force_mono else "2",
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "{OUTPUT}",
    ]


def render_preset(name: str, spec: dict[str, Any], buses: dict[str, dict[str, Any]], *, force_mono: bool = False) -> dict[str, Any]:
    destination = OUTPUT_ROOT / f"ASP01-ACCESSIBILITY-{name}.m4a"
    command = preset_command(spec, buses, force_mono=force_mono)
    recipe_sha = canonical_sha256({
        "bus_sha256": {bus: record["sha256"] for bus, record in buses.items()},
        "command": command,
    })
    record = render_and_validate(destination, command, 1 if force_mono else 2)
    record.update({
        "preset": name,
        "base_preset": "STANDARD" if force_mono else name,
        "force_mono_overlay": force_mono,
        "active_bus_count": sum(float(value) > -80 for value in spec["bus_gains_db"].values()),
        "render_scope": "EIGHT_ISOLATED_BUS_CONTRIBUTIONS_MIXED_THEN_FINAL_SUM_DSP",
        "render_recipe_sha256": recipe_sha,
    })
    return record


def build() -> dict[str, Any]:
    register = json.loads(REGISTER_PATH.read_text(encoding="utf-8"))
    if register.get("schema") != "project-studio-system-audio-asset-register/v5":
        raise RuntimeError("unexpected v5 system register")
    sources = bus_source_records(register)
    buses = render_bus_contributions(sources)
    atomic_write_json(BUS_MANIFEST_PATH, {
        "schema": "project-studio-accessibility-bus-contributions/v4",
        "created_at": CREATED_AT,
        "source_register": {"path": str(REGISTER_PATH), "sha256": sha256_file(REGISTER_PATH)},
        "buses": [{"bus": bus, **record} for bus, record in buses.items()],
        "checks": {
            "required_bus_count": len(buses) == 8,
            "all_source_hashes_verified": all(sha256_file(Path(record["source"]["path"])) == record["source"]["sha256"] for record in buses.values()),
            "all_source_ids_and_roles_project_current_register": all(
                record["source"]["id"] == SOURCE_IDS[bus] and record["source"]["role"] == SOURCE_ROLES[bus]
                for bus, record in buses.items()
            ),
            "all_contributions_45_seconds_stereo": all(abs(record["probe"]["duration_seconds"] - DURATION) < 0.1 and record["probe"]["channels"] == 2 for record in buses.values()),
            "all_render_recipes_bound": all(record["render_recipe_sha256"] == canonical_sha256({"source_sha256": record["source"]["sha256"], "command": bus_command(bus, record["source"])}) for bus, record in buses.items()),
        },
    })
    renders = [render_preset(name, spec, buses) for name, spec in BASE_PRESETS.items()]
    renders.append(render_preset("FORCE_MONO", BASE_PRESETS["STANDARD"], buses, force_mono=True))
    register_record = {"path": str(REGISTER_PATH), "sha256": sha256_file(REGISTER_PATH)}
    bus_manifest = json.loads(BUS_MANIFEST_PATH.read_text(encoding="utf-8"))
    render_checks = {
        "six_renders": len(renders) == 6,
        "all_duration_45_seconds": all(abs(row["probe"]["duration_seconds"] - DURATION) < 0.1 for row in renders),
        "force_mono_final_sum_one_channel": next(row for row in renders if row["preset"] == "FORCE_MONO")["probe"]["channels"] == 1,
        "other_final_sums_stereo": all(row["probe"]["channels"] == 2 for row in renders if row["preset"] != "FORCE_MONO"),
        "music_off_keeps_six_non_music_buses": next(row for row in renders if row["preset"] == "MUSIC_OFF")["active_bus_count"] == 6,
        "source_register_hash_bound": bus_manifest.get("source_register") == register_record,
        "all_render_recipes_bound": all(
            row["render_recipe_sha256"] == canonical_sha256({
                "bus_sha256": {bus: record["sha256"] for bus, record in buses.items()},
                "command": preset_command(
                    BASE_PRESETS["STANDARD"] if row["preset"] == "FORCE_MONO" else BASE_PRESETS[row["preset"]],
                    buses,
                    force_mono=row["preset"] == "FORCE_MONO",
                ),
            })
            for row in renders
        ),
    }
    output = {
        "schema": "project-studio-audio-accessibility-presets/v4",
        "created_at": CREATED_AT,
        "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "human_acceptance": "NONE_RECORDED",
        "composition_law": COMPOSITION_LAW,
        "base_presets": [{"id": name, **spec} for name, spec in BASE_PRESETS.items()],
        "overlays": OVERLAYS,
        "source_register": register_record,
        "bus_contributions": {"path": str(BUS_MANIFEST_PATH), "sha256": sha256_file(BUS_MANIFEST_PATH)},
        "renders": renders,
        "render_checks": render_checks,
        "machine_render_verdict": "PASS" if all(render_checks.values()) else "FAIL",
        "non_render_claims": NON_RENDER_CLAIMS,
        "accessibility_acceptance": "PENDING_RUNTIME_PROOF_AND_HUMAN_REVIEW",
        "limitations": LIMITATIONS,
    }
    atomic_write_json(PRESET_PATH, output)
    return output


def verify() -> dict[str, Any]:
    register = json.loads(REGISTER_PATH.read_text(encoding="utf-8"))
    if register.get("schema") != "project-studio-system-audio-asset-register/v5":
        raise RuntimeError("unexpected v5 system register")
    register_record = {"path": str(REGISTER_PATH), "sha256": sha256_file(REGISTER_PATH)}
    expected_sources = bus_source_records(register)
    manifest = json.loads(BUS_MANIFEST_PATH.read_text(encoding="utf-8"))
    if (set(manifest) != {"schema", "created_at", "source_register", "buses", "checks"}
            or manifest.get("schema") != "project-studio-accessibility-bus-contributions/v4"
            or manifest.get("created_at") != CREATED_AT
            or manifest.get("source_register") != register_record):
        raise RuntimeError("accessibility contribution manifest is stale against current system register")
    rows = manifest.get("buses", [])
    by_bus = {row.get("bus"): row for row in rows if isinstance(row, dict)}
    if len(rows) != len(by_bus) or set(by_bus) != set(SOURCE_IDS):
        raise RuntimeError("accessibility contribution bus identities are incomplete or duplicate")
    for bus, source in expected_sources.items():
        row = by_bus[bus]
        path = canonical_contained(OUTPUT_ROOT, Path(row.get("path", "")))
        expected_path = canonical_contained(OUTPUT_ROOT, BUS_ROOT / f"{bus}.m4a")
        expected_recipe = canonical_sha256({"source_sha256": source["sha256"], "command": bus_command(bus, source)})
        if (set(row) != {"bus", "path", "sha256", "probe", "source", "render_recipe_sha256"}
                or path != expected_path or row.get("path") != str(expected_path) or row.get("source") != source
                or row.get("render_recipe_sha256") != expected_recipe
                or row.get("sha256") != sha256_file(path)
                or row.get("probe") != probe_audio(path)):
            raise RuntimeError(f"accessibility contribution projection failed: {bus}")
    if (set(manifest.get("checks", {})) != {
            "required_bus_count", "all_source_hashes_verified", "all_source_ids_and_roles_project_current_register",
            "all_contributions_45_seconds_stereo", "all_render_recipes_bound",
        } or not all(value is True for value in manifest.get("checks", {}).values())):
        raise RuntimeError("accessibility contribution checks did not pass")

    output = json.loads(PRESET_PATH.read_text(encoding="utf-8"))
    expected_render_check_keys = {
        "six_renders", "all_duration_45_seconds", "force_mono_final_sum_one_channel",
        "other_final_sums_stereo", "music_off_keeps_six_non_music_buses",
        "source_register_hash_bound", "all_render_recipes_bound",
    }
    if (set(output) != {"schema", "created_at", "status", "human_acceptance", "composition_law", "base_presets",
                       "overlays", "source_register", "bus_contributions", "renders", "render_checks",
                       "machine_render_verdict", "non_render_claims", "accessibility_acceptance", "limitations"}
            or output.get("schema") != "project-studio-audio-accessibility-presets/v4"
            or output.get("created_at") != CREATED_AT
            or output.get("status") != "PROTOTYPE_READY_FOR_OWNER_AUDITION"
            or output.get("human_acceptance") != "NONE_RECORDED"
            or output.get("composition_law") != COMPOSITION_LAW
            or output.get("base_presets") != [{"id": name, **spec} for name, spec in BASE_PRESETS.items()]
            or output.get("overlays") != OVERLAYS
            or output.get("source_register") != register_record
            or output.get("bus_contributions") != {"path": str(BUS_MANIFEST_PATH), "sha256": sha256_file(BUS_MANIFEST_PATH)}
            or output.get("machine_render_verdict") != "PASS"
            or output.get("non_render_claims") != NON_RENDER_CLAIMS
            or output.get("accessibility_acceptance") != "PENDING_RUNTIME_PROOF_AND_HUMAN_REVIEW"
            or output.get("limitations") != LIMITATIONS
            or set(output.get("render_checks", {})) != expected_render_check_keys
            or not all(value is True for value in output.get("render_checks", {}).values())):
        raise RuntimeError("accessibility preset manifest is stale or failed")
    render_rows = output.get("renders", [])
    by_preset = {row.get("preset"): row for row in render_rows if isinstance(row, dict)}
    expected_presets = {*BASE_PRESETS, "FORCE_MONO"}
    if len(render_rows) != len(by_preset) or set(by_preset) != expected_presets:
        raise RuntimeError("accessibility render identities are incomplete or duplicate")
    bus_records = {bus: {key: value for key, value in row.items() if key != "bus"} for bus, row in by_bus.items()}
    for name, row in by_preset.items():
        force_mono = name == "FORCE_MONO"
        spec = BASE_PRESETS["STANDARD"] if force_mono else BASE_PRESETS[name]
        path = canonical_contained(OUTPUT_ROOT, Path(row.get("path", "")))
        expected_path = canonical_contained(OUTPUT_ROOT, OUTPUT_ROOT / f"ASP01-ACCESSIBILITY-{name}.m4a")
        expected_recipe = canonical_sha256({
            "bus_sha256": {bus: record["sha256"] for bus, record in bus_records.items()},
            "command": preset_command(spec, bus_records, force_mono=force_mono),
        })
        expected_active_buses = sum(float(value) > -80 for value in spec["bus_gains_db"].values())
        if (set(row) != {"path", "sha256", "probe", "preset", "base_preset", "force_mono_overlay",
                        "active_bus_count", "render_scope", "render_recipe_sha256"}
                or path != expected_path or row.get("path") != str(expected_path)
                or row.get("base_preset") != ("STANDARD" if force_mono else name)
                or row.get("force_mono_overlay") is not force_mono
                or row.get("active_bus_count") != expected_active_buses
                or row.get("render_scope") != "EIGHT_ISOLATED_BUS_CONTRIBUTIONS_MIXED_THEN_FINAL_SUM_DSP"
                or row.get("render_recipe_sha256") != expected_recipe
                or row.get("sha256") != sha256_file(path) or row.get("probe") != probe_audio(path)):
            raise RuntimeError(f"accessibility preset render projection failed: {name}")
    return output


def self_test() -> dict[str, Any]:
    command = [
        "ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "lavfi", "-i",
        f"sine=frequency=440:sample_rate=48000:duration={DURATION}",
        "-ar", "48000", "-ac", "2", "-c:a", "aac", "-b:a", "64k",
        "-movflags", "+faststart", "{OUTPUT}",
    ]
    with tempfile.TemporaryDirectory(prefix="asp01-accessibility-selftest-") as directory:
        path = Path(directory) / "render.m4a"
        first = render_and_validate(path, command, 2)
        canonical_bytes = path.read_bytes()
        os.chmod(path, 0o644)
        path.write_bytes(b"tampered cached render")
        second = render_and_validate(path, command, 2)
        if path.read_bytes() != canonical_bytes or second["sha256"] != first["sha256"]:
            raise RuntimeError("normal build did not atomically restore canonical accessibility render bytes")
    return {"machine_verdict": "PASS", "tampered_cached_render_restored": True}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--verify-only", action="store_true")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        print(json.dumps(self_test(), indent=2, sort_keys=True))
        return
    if args.verify_only:
        output = verify()
    else:
        build()
        output = verify()
    print(json.dumps({
        "path": str(PRESET_PATH),
        "sha256": sha256_file(PRESET_PATH),
        "preset_count": len(output["renders"]),
        "machine_render_verdict": output["machine_render_verdict"],
        "accessibility_acceptance": output["accessibility_acceptance"],
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
