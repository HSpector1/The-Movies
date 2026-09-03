#!/usr/bin/env python3
"""Publish non-destructive, content-addressed supplements for legacy Unity run archives."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from copy import deepcopy
from pathlib import Path
from typing import Any

from common import (
    DOC_REPO, PILOT_ROOT, publish_immutable_bytes, read_contained_regular_bytes,
    sha256_file,
)


ARCHIVE_ROOT = PILOT_ROOT / "09_unity-lab/ArchivedRuns"
SUPPLEMENT_ROOT = PILOT_ROOT / "09_unity-lab/ArchiveSupplements"
MANAGEMENT_SOURCE = PILOT_ROOT / "05_management-sfx/semantic-pack/management-semantic-catalogue.v3.json"
MANAGEMENT_HISTORY_ROOT = PILOT_ROOT / "05_management-sfx/semantic-pack/history"
MANAGEMENT_RELATIVE = "05_management-sfx/semantic-pack/management-semantic-catalogue.v4.json"
MANAGEMENT_GENERATOR = "tools/audio_systems_pilot_01/publish_metadata_status_remedies.py"
REPAIR_TOOL = "tools/audio_systems_pilot_01/repair_unity_validation_archives.py"
CREATED_AT = "2026-09-03T00:00:00Z"
AUTHORIZED_REPAIRS = {
    "20260903T133507Z-30281": {
        "archive_manifest_sha256": "3edf36502e18c360adf47aa42cca9a7cac0f94c3402f1d327f9f0de89aed3c33",
        "current_pointer_sha256": "d48d7c50fe15a901dde2806371b89e94b7baaee66a77e944768d7f4dfd924187",
        "validation_sha256": "a2ea55aa0f49dcfb1e3775b7c7ea19ef0f88b685881560229180818882459db8",
        "relative_path": MANAGEMENT_RELATIVE,
        "archived_bytes": 139_956,
        "archived_sha256": "6aaff305fd6d843f1334c8cf17164589de31d378858fe779c5732c286184c9fb",
        "expected_bytes": 139_956,
        "expected_sha256": "af47f60155e7e5453093174f375878e36536b95a2f591065b5a4ae4a06044ba8",
        "pointer_documentation_sha": "14d1b412555e53e79b7b63efaf5f1f506a8ab298",
        "archive_creation_documentation_sha": "df7c81e68e89655772ab645eb2af8aefd028e80c",
        "historical_outcome": "FAIL",
    },
}


def git(*arguments: str, text: bool = True) -> str | bytes:
    result = subprocess.run(
        ["git", *arguments], cwd=DOC_REPO, check=True, capture_output=True, text=text
    )
    return result.stdout.strip() if text else result.stdout


def committed_blob(commit: str, relative: str) -> bytes:
    return subprocess.run(
        ["git", "show", f"{commit}:{relative}"], cwd=DOC_REPO, check=True, capture_output=True
    ).stdout


def safe_relative(value: Any) -> Path:
    if not isinstance(value, str):
        raise RuntimeError("archive pointer path is not a string")
    relative = Path(value)
    if relative.is_absolute() or ".." in relative.parts or str(relative) != value:
        raise RuntimeError(f"archive pointer path is unsafe: {value!r}")
    return relative


def canonical_json_bytes(value: Any) -> bytes:
    return (json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode("utf-8")


def reconstruct_management_v4(documentation_sha: str) -> tuple[bytes, dict[str, Any]]:
    if re.fullmatch(r"[0-9a-f]{40}", documentation_sha) is None:
        raise RuntimeError(f"historical documentation SHA is malformed: {documentation_sha!r}")
    git("cat-file", "-e", f"{documentation_sha}^{{commit}}")
    generator = committed_blob(documentation_sha, MANAGEMENT_GENERATOR)
    source_payload, _ = read_contained_regular_bytes(PILOT_ROOT, MANAGEMENT_SOURCE)
    source = json.loads(source_payload.decode("utf-8"))
    output = deepcopy(source)
    corrected = 0
    for row in output["vocabulary"]:
        if row.get("repeat_variation") == "shuffle among approved candidates; no immediate repeat":
            row["repeat_variation"] = "shuffle among eligible provisional candidates; no immediate repeat"
            corrected += 1
    if corrected != 15:
        raise RuntimeError(f"historical management reconstruction expected 15 corrections, got {corrected}")
    for candidate in output["candidates"]:
        audio = Path(candidate["audio"]["path"])
        audio_payload, _ = read_contained_regular_bytes(PILOT_ROOT, audio)
        if hashlib.sha256(audio_payload).hexdigest() != candidate["audio"]["sha256"]:
            raise RuntimeError(f"historical management source audio changed: {audio}")
        if candidate.get("human_disposition") != "PENDING":
            raise RuntimeError("historical management candidate exceeds the prototype boundary")
    generator_sha = hashlib.sha256(generator).hexdigest()
    source_sha = hashlib.sha256(source_payload).hexdigest()
    output.update({
        "schema": "project-studio-management-audio-language/v4",
        "generated_at_utc": CREATED_AT,
        "supersedes": {
            "path": str(MANAGEMENT_SOURCE),
            "sha256": source_sha,
            "reason": "Removes ambiguous approval language; audio and machine selections are unchanged.",
        },
        "source_code": {
            "commit": documentation_sha,
            "path": MANAGEMENT_GENERATOR,
            "blob_sha256": generator_sha,
            "working_file_matches_commit": True,
        },
        "approval_language_corrections": corrected,
        "machine_verdict": "PASS",
    })
    return canonical_json_bytes(output), {
        "type": "DETERMINISTIC_METADATA_RECONSTRUCTION_FROM_ARCHIVED_DOCUMENTATION_SHA",
        "documentation_sha": documentation_sha,
        "generator_path": MANAGEMENT_GENERATOR,
        "generator_blob_sha256": generator_sha,
        "source_path": str(MANAGEMENT_SOURCE),
        "source_sha256": source_sha,
        "serializer": "json.dumps(indent=2,sort_keys=True,ensure_ascii=False)+LF",
    }


def current_tool_binding() -> dict[str, Any]:
    commit = str(git("rev-parse", "HEAD"))
    committed = committed_blob(commit, REPAIR_TOOL)
    working, _ = read_contained_regular_bytes(DOC_REPO, DOC_REPO / REPAIR_TOOL)
    working_sha = hashlib.sha256(working).hexdigest()
    committed_sha = hashlib.sha256(committed).hexdigest()
    if working_sha != committed_sha:
        raise RuntimeError("archive-repair tool must be committed at current HEAD")
    return {
        "commit": commit,
        "path": REPAIR_TOOL,
        "blob_sha256": committed_sha,
        "working_file_matches_commit": True,
    }


def archive_file_rows(manifest: dict[str, Any]) -> dict[str, dict[str, Any]]:
    rows = manifest.get("files", [])
    if not isinstance(rows, list) or not rows:
        raise RuntimeError("archive manifest contains no preserved file rows")
    paths = [row.get("relative_path") for row in rows]
    if (None in paths or len(paths) != len(set(paths))
            or any(str(safe_relative(path)) != path for path in paths)):
        raise RuntimeError("archive manifest contains duplicate or missing file paths")
    return {row["relative_path"]: row for row in rows}


def repair_run(run_root: Path, tool_binding: dict[str, Any]) -> dict[str, Any] | None:
    if run_root.is_symlink() or not run_root.is_dir():
        raise RuntimeError(f"archive run root is unsafe: {run_root}")
    manifest_path = run_root / "ARCHIVE-MANIFEST.json"
    pointer_path = run_root / "09_unity-lab/CURRENT-VALIDATION-RUN.json"
    manifest_payload, _ = read_contained_regular_bytes(PILOT_ROOT, manifest_path)
    manifest = json.loads(manifest_payload.decode("utf-8"))
    if manifest.get("attribution") != "PRIOR_CURRENT_RUN_INDEX":
        return None
    pointer_payload, _ = read_contained_regular_bytes(PILOT_ROOT, pointer_path)
    pointer = json.loads(pointer_payload.decode("utf-8"))
    run_id = run_root.name
    if pointer.get("schema") != "project-studio-unity-validation-current-run/v1" or pointer.get("run_id") != run_id:
        raise RuntimeError(f"archived current pointer is malformed: {run_id}")
    authorization = AUTHORIZED_REPAIRS.get(run_id)
    archive_rows = archive_file_rows(manifest)
    repair_plans: list[dict[str, Any]] = []
    pointer_rows = pointer.get("files")
    pointer_paths = [row.get("relative_path") for row in pointer_rows] if isinstance(pointer_rows, list) else []
    if (not pointer_rows or None in pointer_paths
            or len(pointer_paths) != len(set(pointer_paths))):
        raise RuntimeError(f"archived current pointer has no usable unique file rows: {run_id}")
    for row in pointer_rows:
        relative = safe_relative(row.get("relative_path"))
        archived = run_root / relative
        try:
            archived_payload, _ = read_contained_regular_bytes(PILOT_ROOT, archived)
        except RuntimeError:
            archived_payload = None
        actual_sha = hashlib.sha256(archived_payload).hexdigest() if archived_payload is not None else None
        actual_bytes = len(archived_payload) if archived_payload is not None else None
        if actual_sha == row.get("sha256") and actual_bytes == row.get("bytes"):
            continue
        if str(relative) != MANAGEMENT_RELATIVE:
            raise RuntimeError(f"unsupported archived pointer mismatch: {run_id}:{relative}")
        if authorization is None:
            raise RuntimeError(f"indexed archive mismatch repair is not explicitly authorized: {run_id}")
        if (hashlib.sha256(manifest_payload).hexdigest() != authorization["archive_manifest_sha256"]
                or hashlib.sha256(pointer_payload).hexdigest() != authorization["current_pointer_sha256"]
                or pointer.get("documentation_sha") != authorization["pointer_documentation_sha"]):
            raise RuntimeError(f"archive repair authorization identity changed: {run_id}")
        archived_row = archive_rows.get(str(relative))
        if archived_row is None or actual_sha != archived_row.get("sha256") or actual_bytes != archived_row.get("bytes"):
            raise RuntimeError(f"archive manifest does not authenticate the mismatching bytes: {run_id}:{relative}")
        if ({"relative_path": str(relative), "archived_bytes": actual_bytes, "archived_sha256": actual_sha,
             "expected_bytes": row.get("bytes"), "expected_sha256": row.get("sha256")} != {
                key: authorization[key] for key in (
                    "relative_path", "archived_bytes", "archived_sha256", "expected_bytes", "expected_sha256"
                )
             }):
            raise RuntimeError(f"archive mismatch is outside the committed repair authorization: {run_id}:{relative}")
        payload, reconstruction = reconstruct_management_v4(pointer.get("documentation_sha"))
        expected_sha = row.get("sha256")
        if hashlib.sha256(payload).hexdigest() != expected_sha or len(payload) != row.get("bytes"):
            raise RuntimeError(f"deterministic reconstruction does not match archived pointer: {run_id}:{relative}")
        archived_json = json.loads(archived_payload.decode("utf-8"))
        if archived_json.get("source_code", {}).get("commit") != authorization["archive_creation_documentation_sha"]:
            raise RuntimeError(f"archived replacement metadata has an unexpected documentation binding: {run_id}")
        normalized = deepcopy(archived_json)
        normalized["source_code"]["commit"] = authorization["pointer_documentation_sha"]
        if canonical_json_bytes(normalized) != payload:
            raise RuntimeError(f"archive repair differs by more than the authorized commit pointer: {run_id}")
        reconstruction["authorized_json_pointer_delta"] = ["/source_code/commit"]
        repair_plans.append({
            "relative_path": str(relative),
            "expected_pointer": {"bytes": row["bytes"], "sha256": expected_sha},
            "original_archive": {"bytes": actual_bytes, "sha256": actual_sha},
            "reconstruction": reconstruction,
            "payload": payload,
        })
    if not repair_plans:
        return None
    supplement_root = SUPPLEMENT_ROOT / run_id
    archived_validation_path = run_root / "09_unity-lab/UNITY-AUDIO-LAB-VALIDATION.json"
    archived_validation_payload, _ = read_contained_regular_bytes(PILOT_ROOT, archived_validation_path)
    archived_validation = json.loads(archived_validation_payload.decode("utf-8"))
    historical_verdict = archived_validation.get("machine_verdict")
    if historical_verdict not in {"PASS", "FAIL"}:
        raise RuntimeError(f"archived Unity validation verdict is unavailable: {run_id}")
    if (hashlib.sha256(archived_validation_payload).hexdigest() != authorization["validation_sha256"]
            or historical_verdict != authorization["historical_outcome"]):
        raise RuntimeError(f"archive repair authorization historical outcome changed: {run_id}")
    mismatches: list[dict[str, Any]] = []
    for plan in repair_plans:
        payload = plan.pop("payload")
        expected_sha = plan["expected_pointer"]["sha256"]
        history_path = MANAGEMENT_HISTORY_ROOT / f"management-semantic-catalogue.v4-{expected_sha}.json"
        history = publish_immutable_bytes(PILOT_ROOT, history_path, payload)
        blob_relative = Path("blobs") / f"{expected_sha}.json"
        supplement_path = SUPPLEMENT_ROOT / run_id / blob_relative
        supplement = publish_immutable_bytes(PILOT_ROOT, supplement_path, payload)
        mismatches.append({
            **plan,
            "supplement_blob": {
                "relative_path": str(blob_relative), "bytes": supplement["bytes"],
                "sha256": supplement["sha256"], "mode": 0o444,
            },
            "content_addressed_history": {
                "path": str(history_path), "bytes": history["bytes"], "sha256": history["sha256"],
            },
        })
    supplement_manifest = {
        "schema": "project-studio-unity-validation-run-archive-supplement/v1",
        "run_id": run_id,
        "status": "NONDESTRUCTIVE_POINTER_PROJECTION_REPAIR",
        "reason": "The original run archive remains byte-for-byte intact; exact pointer-named metadata is supplied separately.",
        "historical_run_outcome": historical_verdict,
        "pointer_status_semantics": "LEGACY_UNCONDITIONAL_STATUS_NOT_USED_AS_HISTORICAL_OUTCOME",
        "disposition": "HASH_AUTHENTICATED_DETERMINISTIC_RECONSTRUCTION_NOT_ORIGINAL_PRESERVED_BYTES; NOT_A_REVALIDATION; HISTORICAL_RUN_REMAINS_FAIL",
        "authorization": authorization,
        "source_root": str(PILOT_ROOT),
        "original_archive_manifest": {
            "path": str(manifest_path.relative_to(PILOT_ROOT)),
            "bytes": len(manifest_payload),
            "sha256": hashlib.sha256(manifest_payload).hexdigest(),
        },
        "archived_current_run_pointer": {
            "path": str(pointer_path.relative_to(PILOT_ROOT)),
            "bytes": len(pointer_payload),
            "sha256": hashlib.sha256(pointer_payload).hexdigest(),
        },
        "archived_validation": {
            "path": str(archived_validation_path.relative_to(PILOT_ROOT)),
            "bytes": len(archived_validation_payload),
            "sha256": hashlib.sha256(archived_validation_payload).hexdigest(),
        },
        "repair_tool": tool_binding,
        "repairs": mismatches,
    }
    manifest_payload = canonical_json_bytes(supplement_manifest)
    published = publish_immutable_bytes(
        PILOT_ROOT, supplement_root / "SUPPLEMENT-MANIFEST.json", manifest_payload
    )
    return {
        "run_id": run_id,
        "manifest": published,
        "repair_count": len(mismatches),
        "original_archive_modified": False,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-id", action="append", default=[])
    arguments = parser.parse_args()
    if not ARCHIVE_ROOT.is_dir() or ARCHIVE_ROOT.is_symlink():
        raise RuntimeError(f"Unity archive root is unavailable or unsafe: {ARCHIVE_ROOT}")
    requested = set(arguments.run_id)
    roots = sorted(ARCHIVE_ROOT.iterdir())
    if requested:
        available = {path.name for path in roots}
        missing = requested - available
        if missing:
            raise RuntimeError(f"requested archive runs do not exist: {sorted(missing)}")
        roots = [path for path in roots if path.name in requested]
    binding = current_tool_binding()
    results = [result for root in roots if (result := repair_run(root, binding)) is not None]
    print(json.dumps({
        "schema": "project-studio-unity-validation-archive-repair-result/v1",
        "machine_verdict": "PASS",
        "runs_examined": len(roots),
        "supplements_published_or_reused": len(results),
        "results": results,
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
