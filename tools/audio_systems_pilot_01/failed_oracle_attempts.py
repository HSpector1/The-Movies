#!/usr/bin/env python3
"""Publish and verify one exact failed, unpublished Audio Oracle attempt."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from common import (
    DOC_REPO, PILOT_ROOT, read_contained_regular_bytes, replace_contained_bytes,
)


UNITY_REPO = Path("/Users/bruce/Project Studio - Audio Systems Pilot 01 Client")
REGISTER_RELATIVE_PATH = "07_audio-oracle/AUDIO-ORACLE-FAILED-ATTEMPT-REGISTER.v1.json"
REGISTER_PATH = PILOT_ROOT / REGISTER_RELATIVE_PATH
TOOL_PATH = "tools/audio_systems_pilot_01/failed_oracle_attempts.py"
ATTEMPT_ID = "UNINDEXED-PRIOR-20260903T211256Z-37030"
ARCHIVE_ROOT_RELATIVE = f"09_unity-lab/ArchivedRuns/{ATTEMPT_ID}"
ATTEMPT_DOCUMENTATION_SHA = "8015aab13ece86664885125f837b043a8b4c5924"
ATTEMPT_UNITY_SHA = "199aa643c53dce124a58c813767f15277c54457e"
ATTEMPT_BINARY_SHA256 = "5480ee02e9db140b2f7ebf7e1ee5e0007e7ed2519c25721051b7d5fb0aa441ba"
ATTEMPT_CATALOGUE_SHA256 = "d26df18eddfb299d9332ad82402c836c6234342b51ed4fb44b5294d0a78b334e"
ATTEMPT_EXCEPTION = (
    "InvalidOperationException: "
    "ORACLE_ARCHIVE_REGISTER_PRIOR_INTEGRITY_FAILED:"
    "ARCHIVED_ORACLE_SCENARIO_ID_INVALID:early_era_normal"
)
ATTEMPT_PROCESS_GATE_UTC = "2026-09-03T21:07:38Z"
ATTEMPT_RUNTIME_UTC = "2026-09-03T21:07:14.8758080Z"
ATTEMPT_BUILD_UTC = "2026-09-03T21:07:37.2692210Z"
ATTEMPT_RUNTIME_NONCE = "88fd6eeff4ee41418a5a1fee0d4339ae"
STALE_VALIDATION_UNITY_SHA = "6d4a4c4fd194273ce88aba513baab53b5cb08ceb"

ARCHIVE_RECORDS = (
    {
        "role": "MIXED_PRIOR_BYTES_CONTAINER_MANIFEST",
        "path": f"{ARCHIVE_ROOT_RELATIVE}/ARCHIVE-MANIFEST.json",
        "bytes": 4619,
        "sha256": "0c9334f3edb2903fbbdec388005874c5d7d469f2e580d3cf909617ad3656670a",
    },
    {
        "role": "ATTEMPT_PROCESS_COLLISION_GATE",
        "path": f"{ARCHIVE_ROOT_RELATIVE}/09_unity-lab/Logs/process-gate-oracle-final.log",
        "bytes": 701,
        "sha256": "1fa6a0402df26ce21a39d29f2fda07c18868476685dd750ec4702bac470c6157",
    },
    {
        "role": "ATTEMPT_ORACLE_FAILURE_LOG",
        "path": f"{ARCHIVE_ROOT_RELATIVE}/09_unity-lab/Logs/oracle-final.log",
        "bytes": 27255,
        "sha256": "0527eb88d0e9a87c0f87d560151ac53d752246e099090f2619121c2924cfc148",
    },
    {
        "role": "ATTEMPT_RUNTIME_OBSERVATION",
        "path": f"{ARCHIVE_ROOT_RELATIVE}/09_unity-lab/RuntimeEvidence/audio-oracle-runtime-observations.json",
        "bytes": 1709,
        "sha256": "7e5bf7b370c07264ccbd295c99d61371a8cb6445dc03a4cb7c911347450e24f3",
    },
    {
        "role": "ATTEMPT_BUILD_RECEIPT",
        "path": f"{ARCHIVE_ROOT_RELATIVE}/09_unity-lab/Builds/macOS/Project Studio Audio Systems Pilot.app.build-receipt.json",
        "bytes": 2031,
        "sha256": "1303fb94c2ec2ea717673dd460cf15a787205ee06bb7d71119a5fe5a706d2c84",
    },
)

STALE_VALIDATION_RECORD = {
    "path": f"{ARCHIVE_ROOT_RELATIVE}/09_unity-lab/UNITY-AUDIO-LAB-VALIDATION.json",
    "bytes": 20003,
    "sha256": "e187364c64cbd7cd43e912df0db2c1534dadb6430da7db80945178a3a9fe5126",
    "internal_unity_sha": STALE_VALIDATION_UNITY_SHA,
    "internal_machine_verdict": "PASS",
    "disposition": (
        "EXCLUDED_MIXED_PRIOR_BYTES; NOT_ATTRIBUTABLE_TO_FAILED_ATTEMPT; "
        "NOT_A_SUITE_OR_CURRENT_RUN_VERDICT"
    ),
}

TRACE_RECORDS = (
    ("active_to_blocked_hysteresis", 7485, "373ce12e28652f284e4a77981345e9dd320bc09ba77944afda10d8c4907169b5"),
    ("adjacent_era_transition", 4693, "ad792c290446b8faf8dd6edcff572ed6b3da52f979d8b05770fef93c6ac37020"),
    ("authority_compatibility_1940_normal", 4081, "af10d51fb7bd02db356d906b5a45a65cb76cae23e354b053f80bbfc297bdb35e"),
    ("deterministic_replay", 11382, "e0fd4124482ff348a339b7d4f9270429371bec85c4ff700c510ff67cb18e6419"),
    ("early_era_normal", 11332, "a5f52f709e408e05279ba34d546f0ce6036c35b3da5f5a98e85dd46afa36a6f9"),
    ("force_mono", 11839, "65092b67f75f42befe342e6f460570be24f340a382f2c094df6d6e36d929ec8f"),
    ("four_hour_anti_repeat_trace", 93429, "6b1ab3aa1dcd055e1df76b0e3908adf9f1abd1b2fcd03926e1ae648032a834c4"),
    ("four_x_simulation_unchanged_pitch_tempo", 4947, "d599b92097a3207c68eccafa5b6165b14f836042b9fe5f94ff1d773132f06a84"),
    ("mid_era_active", 5270, "a909eadaf25837d1d4bd4f96c3affb4465a974b666d7737016cf43be3787c409"),
    ("missing_file_fail_closed", 3816, "f0a8233f49b9fdfaaa527ca49743e0ff7c36f8e9a9dac8634f4ca6f7fdd9fb29"),
    ("modern_era_blocked", 5316, "821ab7eadf6fe3fe83298ae546c71ab87a4fa1057893910ed68fcbf04b323cbb"),
    ("music_off_with_living_ambience", 8353, "b21dd669ebf26b2a4ab51924db4c70e63455aaff4ef2a5b9c825c0e2187085c0"),
    ("night_mix", 12008, "8410728d7eaed5bb09924995d4549c9d75806975a5dbd0f4b214867294f818ff"),
    ("normal_to_active_phrase_boundary_transition", 7772, "24c46ad6be81e9edef1ca22ffe00da40ac0ef1dc55d17ba17478bb77caa29ea7"),
    ("pa_interrupting_radio", 8347, "fa0f73f5b9ff78f2059db0780887f64e1fc279ed2e7609645783b32bddbe492e"),
    ("pause_resume", 8709, "7deee057ac7f0f970d076e9866f14a4af2818392f9921d29ab905bf1cc5a8a40"),
    ("radio_voice_ducking", 6606, "a98378c5eb2f15253beb9871a7644672444258725afffa232a51f0ef52174418"),
    ("save_load_across_era_compatibility", 5165, "de7f247180339bcb361747ad60c5ab828dd3698ce33e879fdde6cc33058e10f5"),
    ("simulated_device_reset", 6809, "0e4f3f2b297003de0eb3f1cc3de7c3e719a9aac257dc413cd6245ad26bb1fd70"),
    ("workspace_continuity_without_restart", 4999, "008f9d9c00af0ebcb3ff4b7f82dd8bd5ec559e843d6d0185785c21e0cb1bc45f"),
)

CAPTURE_RELATIONSHIPS = {
    "force_mono": {
        "path": "07_audio-oracle/captures/force-mono-runtime-processor-marker-6d6646813e0c12675e6b6c43885d001996d6e08b95882b566dc7d13878e602b2.wav",
        "sha256": "6d6646813e0c12675e6b6c43885d001996d6e08b95882b566dc7d13878e602b2",
        "disposition": "RELATIONSHIP_ONLY; CAPTURE_REACHABILITY_OWNED_BY_PUBLISHED_SUITES",
    },
    "night_mix": {
        "path": "07_audio-oracle/captures/night-limited-dynamic-range-runtime-processor-marker-9e56fcfe518240cc2158534c3962fdabb3837f7d88e21d048c6a62e7f6fa6210.wav",
        "sha256": "9e56fcfe518240cc2158534c3962fdabb3837f7d88e21d048c6a62e7f6fa6210",
        "disposition": "RELATIONSHIP_ONLY; CAPTURE_REACHABILITY_OWNED_BY_PUBLISHED_SUITES",
    },
}

OLD_UNITY_SOURCES = (
    {
        "role": "CATALOGUE_PIN_SOURCE",
        "path": "Assets/ProjectStudioAudioLab/Runtime/Unity/ExternalAudioCatalogueService.cs",
        "blob_sha256": "b3d967313310f121fbfeb8b44c6fe16726ef5565a14ae3ecc979373dbd8e6bfa",
    },
    {
        "role": "FAILED_PUBLICATION_ORDER_SOURCE",
        "path": "Assets/ProjectStudioAudioLab/Editor/AudioOracleBatchRunner.cs",
        "blob_sha256": "98236ccb2ad5cbd9cb8cd2e160c7738e8331446dd877348dd88bb98cd9b5dadc",
    },
)


def canonical_json_bytes(value: Any) -> bytes:
    return (json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode("utf-8")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def _git(repo: Path, *arguments: str, check: bool = True) -> subprocess.CompletedProcess[bytes]:
    return subprocess.run(["git", *arguments], cwd=repo, check=check, capture_output=True)


def _source_binding(doc_repo: Path) -> dict[str, Any]:
    commit = _git(doc_repo, "rev-parse", "HEAD").stdout.decode().strip()
    committed = _git(doc_repo, "show", f"{commit}:{TOOL_PATH}").stdout
    working, _ = read_contained_regular_bytes(doc_repo, doc_repo / TOOL_PATH)
    require(committed == working, "failed-attempt register tool must be committed at current HEAD")
    return {
        "commit": commit,
        "path": TOOL_PATH,
        "blob_sha256": hashlib.sha256(committed).hexdigest(),
        "working_file_matches_commit": True,
    }


def _trace_rows() -> list[dict[str, Any]]:
    return [
        {
            "scenario": scenario,
            "path": f"07_audio-oracle/traces/{scenario}-{digest}.json",
            "bytes": size,
            "sha256": digest,
            "trace_level_machine_verdict": "PASS",
            "capture_relationship": CAPTURE_RELATIONSHIPS.get(scenario),
        }
        for scenario, size, digest in TRACE_RECORDS
    ]


def _read_exact(root: Path, record: dict[str, Any], label: str) -> bytes:
    candidate = root / record["path"]
    payload, _ = read_contained_regular_bytes(root, candidate)
    require(len(payload) == record["bytes"], f"{label} byte count changed: {record['path']}")
    require(hashlib.sha256(payload).hexdigest() == record["sha256"], f"{label} hash changed: {record['path']}")
    return payload


def _validate_git_identities(doc_repo: Path, unity_repo: Path) -> list[dict[str, Any]]:
    require(_git(doc_repo, "cat-file", "-e", f"{ATTEMPT_DOCUMENTATION_SHA}^{{commit}}", check=False).returncode == 0,
            "failed-attempt documentation commit is unavailable")
    require(_git(unity_repo, "cat-file", "-e", f"{ATTEMPT_UNITY_SHA}^{{commit}}", check=False).returncode == 0,
            "failed-attempt Unity commit is unavailable")
    result: list[dict[str, Any]] = []
    for source in OLD_UNITY_SOURCES:
        completed = _git(unity_repo, "show", f"{ATTEMPT_UNITY_SHA}:{source['path']}", check=False)
        require(completed.returncode == 0 and hashlib.sha256(completed.stdout).hexdigest() == source["blob_sha256"],
                f"failed-attempt Unity source binding changed: {source['path']}")
        result.append(dict(source))
        if source["role"] == "CATALOGUE_PIN_SOURCE":
            expected_literal = f'SystemRegisterExpectedSha256 = "{ATTEMPT_CATALOGUE_SHA256}"'
            require(expected_literal.encode("utf-8") in completed.stdout,
                    "failed-attempt catalogue identity is not pinned by its Unity commit")
        if source["role"] == "FAILED_PUBLICATION_ORDER_SOURCE":
            trace_write = completed.stdout.find(b"var traceArtifact = WriteImmutableEvidenceForTests")
            suite_call = completed.stdout.find(b"WritePublishedSuiteAndArchive(root, output")
            publication_method = completed.stdout.find(
                b"private static void WritePublishedSuiteAndArchive"
            )
            publication_body = completed.stdout[publication_method:]
            require(0 <= trace_write < suite_call < publication_method
                    and b"UpdateArchiveRegister(root, null);" in publication_body
                    and publication_body.find(b"UpdateArchiveRegister(root, null);")
                    < publication_body.rfind(b"WriteBytesWithoutArchive(output, bytes);"),
                    "failed-attempt source no longer proves trace-before-suite publication order")
            require(b"RequireArchiveRegisterReadyForEvidencePublication" not in completed.stdout,
                    "failed-attempt source unexpectedly contains the later preflight guard")
    return result


def _validate_archive_evidence(root: Path) -> None:
    payloads = {record["role"]: _read_exact(root, record, record["role"]) for record in ARCHIVE_RECORDS}
    manifest = json.loads(payloads["MIXED_PRIOR_BYTES_CONTAINER_MANIFEST"].decode("utf-8"))
    require(manifest.get("schema") == "project-studio-unity-validation-run-archive/v1"
            and manifest.get("run_id") == ATTEMPT_ID
            and manifest.get("archived_by_run_id") == "20260903T211256Z-37030"
            and manifest.get("attribution") == "UNINDEXED_PRIOR_BYTES_NO_CURRENT_RUN_INDEX"
            and manifest.get("status") == "PRESERVED_UNINDEXED_ATTEMPT_BYTES",
            "failed-attempt archive-container identity changed")
    manifest_files = {row.get("relative_path"): row for row in manifest.get("files", [])}
    require("09_unity-lab/CURRENT-VALIDATION-RUN.json" not in manifest_files
            and not any(str(path).startswith("07_audio-oracle/AUDIO-ORACLE-SUITE")
                        for path in manifest_files),
            "failed-attempt archive unexpectedly contains a suite or current-run pointer")
    for record in ARCHIVE_RECORDS[1:]:
        relative = str(Path(record["path"]).relative_to(ARCHIVE_ROOT_RELATIVE))
        require(manifest_files.get(relative) == {
                    "relative_path": relative, "bytes": record["bytes"],
                    "sha256": record["sha256"], "mode": 0o444,
                }, f"archive manifest does not authenticate failed-attempt member: {relative}")
    stale_payload = _read_exact(root, STALE_VALIDATION_RECORD, "excluded stale validation")
    stale_relative = str(Path(STALE_VALIDATION_RECORD["path"]).relative_to(ARCHIVE_ROOT_RELATIVE))
    require(manifest_files.get(stale_relative) == {
                "relative_path": stale_relative, "bytes": STALE_VALIDATION_RECORD["bytes"],
                "sha256": STALE_VALIDATION_RECORD["sha256"], "mode": 0o444,
            }, "archive manifest no longer authenticates the excluded stale validation member")
    stale = json.loads(stale_payload.decode("utf-8"))
    require(stale.get("schema") == "project-studio-unity-audio-lab-validation/v1"
            and stale.get("unity_git_sha") == STALE_VALIDATION_UNITY_SHA
            and stale.get("unity_git_sha") != ATTEMPT_UNITY_SHA
            and stale.get("machine_verdict") == "PASS",
            "excluded validation no longer proves the mixed-prior-bytes boundary")

    gate_text = payloads["ATTEMPT_PROCESS_COLLISION_GATE"].decode("utf-8")
    gate = dict(line.split("=", 1) for line in gate_text.splitlines() if "=" in line)
    require(set(gate) == {
                "utc", "next_command", "unity_git_sha", "documentation_git_sha",
                "unrelated_unity_process_count", "matching_processes", "status",
            }
            and gate.get("utc") == ATTEMPT_PROCESS_GATE_UTC
            and gate.get("documentation_git_sha") == ATTEMPT_DOCUMENTATION_SHA
            and gate.get("unity_git_sha") == ATTEMPT_UNITY_SHA
            and gate.get("unrelated_unity_process_count") == "0"
            and gate.get("matching_processes") == "NONE"
            and gate.get("status") == "PASS_NO_ACTIVE_UNITY"
            and ATTEMPT_UNITY_SHA in gate.get("next_command", "")
            and "ProjectStudio.AudioLab.Editor.AudioOracleBatchRunner.RunAll" in gate.get("next_command", ""),
            "failed-attempt process gate identity changed")

    log_text = payloads["ATTEMPT_ORACLE_FAILURE_LOG"].decode("utf-8", errors="strict")
    require(log_text.count(ATTEMPT_EXCEPTION) == 1
            and "at ProjectStudio.AudioLab.Editor.AudioOracleBatchRunner.UpdateArchiveRegister" in log_text
            and "executeMethod method ProjectStudio.AudioLab.Editor.AudioOracleBatchRunner.RunAll threw exception." in log_text,
            "failed-attempt Oracle exception identity changed")

    runtime = json.loads(payloads["ATTEMPT_RUNTIME_OBSERVATION"].decode("utf-8"))
    require(runtime.get("schema") == "project-studio-audio-oracle-runtime-observations/v2"
            and runtime.get("unity_git_sha") == ATTEMPT_UNITY_SHA
            and runtime.get("generated_utc") == ATTEMPT_RUNTIME_UTC
            and runtime.get("run_nonce") == ATTEMPT_RUNTIME_NONCE
            and runtime.get("test_id") == "RuntimeOracleObservesSchedulingCancellationLifecycleAndSpeed"
            and runtime.get("observation_source") == "UNITY_PLAYMODE_OBSERVATION",
            "failed-attempt runtime observation identity changed")

    receipt = json.loads(payloads["ATTEMPT_BUILD_RECEIPT"].decode("utf-8"))
    require(receipt.get("schema") == "project-studio-audio-lab-build-receipt/v1"
            and receipt.get("unity_git_sha") == ATTEMPT_UNITY_SHA
            and receipt.get("generated_utc") == ATTEMPT_BUILD_UTC
            and receipt.get("executable_sha256") == ATTEMPT_BINARY_SHA256
            and receipt.get("build_result") == "SUCCEEDED"
            and receipt.get("player_launched") is False,
            "failed-attempt build receipt identity changed")


def _validate_traces(root: Path) -> list[dict[str, Any]]:
    rows = _trace_rows()
    require(len(rows) == 20
            and len({row["scenario"] for row in rows}) == 20
            and len({row["path"] for row in rows}) == 20
            and len({row["sha256"] for row in rows}) == 20,
            "failed-attempt trace allowlist is not exactly twenty unique records")
    for row in rows:
        payload = _read_exact(root, row, f"failed-attempt trace {row['scenario']}")
        trace = json.loads(payload.decode("utf-8"))
        require(trace.get("schema") == "project-studio-audio-oracle-trace/v1"
                and trace.get("scenario") == row["scenario"]
                and trace.get("documentation_git_sha") == ATTEMPT_DOCUMENTATION_SHA
                and trace.get("unity_git_sha") == ATTEMPT_UNITY_SHA
                and trace.get("lab_binary_sha256") == ATTEMPT_BINARY_SHA256
                and trace.get("catalogue_sha256") == ATTEMPT_CATALOGUE_SHA256
                and trace.get("machine_verdict") == "PASS"
                and trace.get("listening_limitation") == "Machine proof does not equal human listening acceptance.",
                f"failed-attempt trace semantic identity changed: {row['scenario']}")
        capture = row["capture_relationship"]
        require(trace.get("capture_path") == (capture or {}).get("path")
                and trace.get("capture_sha256") == (capture or {}).get("sha256"),
                f"failed-attempt trace capture relationship changed: {row['scenario']}")
    return rows


def build_register(
    *, root: Path = PILOT_ROOT, doc_repo: Path = DOC_REPO, unity_repo: Path = UNITY_REPO,
) -> dict[str, Any]:
    source = _source_binding(doc_repo)
    historical_sources = _validate_git_identities(doc_repo, unity_repo)
    _validate_archive_evidence(root)
    traces = _validate_traces(root)
    return {
        "schema": "project-studio-audio-oracle-failed-attempt-register/v1",
        "status": "PROTOTYPE_ONLY",
        "evidence_class": "HASH_AUTHENTICATED_FAILED_UNPUBLISHED_ORACLE_ATTEMPT",
        "preservation_verdict": "PASS_EXACT_ALLOWLIST_AND_BYTES",
        "suite_level_machine_verdict": None,
        "attempt_count": 1,
        "registered_trace_count": len(traces),
        "registered_capture_count": 0,
        "registered_audio_file_count": 0,
        "capture_relationship_count": len(CAPTURE_RELATIONSHIPS),
        "source_code": source,
        "attempts": [{
            "attempt_id": ATTEMPT_ID,
            "original_run_id": None,
            "archive_created_by_run_id": "20260903T211256Z-37030",
            "attribution": "UNINDEXED_PRIOR_BYTES_NO_CURRENT_RUN_INDEX",
            "outcome": "FAILED_DURING_ORACLE_BEFORE_SUITE_OR_CURRENT_POINTER_PUBLICATION",
            "suite_published": False,
            "current_run_pointer_published": False,
            "suite_level_machine_verdict": None,
            "trace_level_machine_verdict": "PASS",
            "source_git_shas": {
                "documentation": ATTEMPT_DOCUMENTATION_SHA,
                "unity_audio_lab": ATTEMPT_UNITY_SHA,
            },
            "lab_binary_sha256": ATTEMPT_BINARY_SHA256,
            "catalogue_sha256": ATTEMPT_CATALOGUE_SHA256,
            "failure": {
                "exception": ATTEMPT_EXCEPTION,
                "root_cause": (
                    "The failed Unity source wrote twenty content-addressed traces before "
                    "archive-register validation and suite publication; archive-register "
                    "validation then failed, so no suite or current-run pointer made those "
                    "exact trace bytes reachable."
                ),
                "publication_boundary": "TRACE_BYTES_WRITTEN; SUITE_NOT_PUBLISHED; CURRENT_POINTER_NOT_PUBLISHED",
            },
            "archive_container_boundary": (
                "MIXED_PRIOR_BYTES; ONLY THE EXACTLY LISTED PROCESS GATE, ORACLE FAILURE LOG, "
                "RUNTIME OBSERVATION, BUILD RECEIPT, AND TRACE BYTES ARE ATTRIBUTED TO THIS ATTEMPT"
            ),
            "archive_evidence": [dict(record) for record in ARCHIVE_RECORDS],
            "excluded_mixed_archive_member": dict(STALE_VALIDATION_RECORD),
            "historical_unity_sources": historical_sources,
            "traces": traces,
            "capture_policy": (
                "RELATIONSHIPS_RECORDED_FOR_TWO_TRACES; CAPTURE FILES REMAIN REACHABLE ONLY "
                "THROUGH PUBLISHED CURRENT_OR_ARCHIVED SUITES"
            ),
        }],
    }


def verify(
    *, root: Path = PILOT_ROOT, register_path: Path | None = None,
    doc_repo: Path = DOC_REPO, unity_repo: Path = UNITY_REPO,
) -> dict[str, Any]:
    target = register_path or (root / REGISTER_RELATIVE_PATH)
    payload, _ = read_contained_regular_bytes(root, target)
    actual = json.loads(payload.decode("utf-8"))
    expected = build_register(root=root, doc_repo=doc_repo, unity_repo=unity_repo)
    require(actual == expected, "failed-attempt register differs from its exact committed allowlist projection")
    rows = expected["attempts"][0]["traces"]
    return {
        "attempt_count": 1,
        "registered_trace_count": len(rows),
        "registered_capture_count": expected["registered_capture_count"],
        "registered_audio_file_count": expected["registered_audio_file_count"],
        "capture_relationship_count": expected["capture_relationship_count"],
        "register_path": REGISTER_RELATIVE_PATH,
        "register_sha256": hashlib.sha256(payload).hexdigest(),
        "attempt_id": ATTEMPT_ID,
        "trace_records": [
            {key: row[key] for key in ("scenario", "path", "bytes", "sha256")}
            for row in rows
        ],
        "suite_level_machine_verdict": None,
        "attempt_outcome": expected["attempts"][0]["outcome"],
    }


def publish() -> dict[str, Any]:
    value = build_register()
    payload = canonical_json_bytes(value)
    existing_sha: str | None = None
    if os.path.lexists(REGISTER_PATH):
        existing, _ = read_contained_regular_bytes(PILOT_ROOT, REGISTER_PATH)
        existing_sha = hashlib.sha256(existing).hexdigest()
    replace_contained_bytes(
        PILOT_ROOT, REGISTER_PATH, payload,
        expected_existing_sha256=existing_sha, mode=0o644,
    )
    return verify()


def self_test() -> dict[str, Any]:
    """Copy the bounded evidence to a temporary root and prove mutations fail closed."""
    with tempfile.TemporaryDirectory(prefix="audio-oracle-failed-attempt-selftest-") as name:
        root = Path(name)
        source_records = [*_trace_rows(), *ARCHIVE_RECORDS, STALE_VALIDATION_RECORD]
        for record in source_records:
            source = PILOT_ROOT / record["path"]
            destination = root / record["path"]
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(source.read_bytes())
        register = build_register(root=root)
        register_path = root / REGISTER_RELATIVE_PATH
        register_path.parent.mkdir(parents=True, exist_ok=True)
        register_path.write_bytes(canonical_json_bytes(register))
        verify(root=root, register_path=register_path)

        cases: list[str] = []

        def reject(label: str, mutate: Any, restore: Any) -> None:
            mutate()
            try:
                verify(root=root, register_path=register_path)
            except Exception:
                cases.append(label)
            else:
                raise RuntimeError(f"failed-attempt self-test accepted mutation: {label}")
            finally:
                restore()

        trace_path = root / _trace_rows()[0]["path"]
        trace_bytes = trace_path.read_bytes()
        reject("TRACE_BYTE_MUTATION", lambda: trace_path.write_bytes(trace_bytes + b" "),
               lambda: trace_path.write_bytes(trace_bytes))
        for role, label in (
            ("MIXED_PRIOR_BYTES_CONTAINER_MANIFEST", "ARCHIVE_MANIFEST_MUTATION"),
            ("ATTEMPT_PROCESS_COLLISION_GATE", "PROCESS_GATE_MUTATION"),
            ("ATTEMPT_ORACLE_FAILURE_LOG", "FAILURE_LOG_MUTATION"),
            ("ATTEMPT_RUNTIME_OBSERVATION", "RUNTIME_OBSERVATION_MUTATION"),
            ("ATTEMPT_BUILD_RECEIPT", "BUILD_RECEIPT_MUTATION"),
        ):
            record = next(row for row in ARCHIVE_RECORDS if row["role"] == role)
            path = root / record["path"]
            original = path.read_bytes()
            reject(label, lambda path=path, original=original: path.write_bytes(original + b" "),
                   lambda path=path, original=original: path.write_bytes(original))

        register_bytes = register_path.read_bytes()

        def mutate_register(field: str, value: Any) -> None:
            changed = json.loads(register_bytes.decode("utf-8"))
            changed["attempts"][0][field] = value
            register_path.write_bytes(canonical_json_bytes(changed))

        reject("SUITE_PASS_FABRICATION",
               lambda: mutate_register("suite_level_machine_verdict", "PASS"),
               lambda: register_path.write_bytes(register_bytes))

        def add_trace() -> None:
            changed = json.loads(register_bytes.decode("utf-8"))
            changed["attempts"][0]["traces"].append(dict(changed["attempts"][0]["traces"][0]))
            changed["registered_trace_count"] = 21
            register_path.write_bytes(canonical_json_bytes(changed))

        reject("ALLOWLIST_ADDITION", add_trace, lambda: register_path.write_bytes(register_bytes))
        reject("ATTEMPT_IDENTITY_MUTATION",
               lambda: mutate_register("lab_binary_sha256", "0" * 64),
               lambda: register_path.write_bytes(register_bytes))
        verify(root=root, register_path=register_path)
        return {"status": "PASS", "mutation_cases": cases, "mutation_case_count": len(cases)}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group(required=True)
    modes.add_argument("--publish", action="store_true")
    modes.add_argument("--verify-only", action="store_true")
    modes.add_argument("--self-test", action="store_true")
    arguments = parser.parse_args()
    if arguments.publish:
        result = publish()
    elif arguments.self_test:
        result = self_test()
    else:
        result = verify()
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
