#!/usr/bin/env python3
"""Eagerly preserve every exact file named by the current successful Unity run pointer."""

from __future__ import annotations

import hashlib
import json
import os
import re
import stat
import subprocess
from pathlib import Path
from typing import Any

from common import (
    DOC_REPO, PILOT_ROOT, create_contained_directory_once,
    ensure_contained_directory, publish_immutable_bytes, read_contained_regular_bytes,
    remove_contained_directory, require_contained_directory, sha256_file,
)


CURRENT_POINTER = PILOT_ROOT / "09_unity-lab/CURRENT-VALIDATION-RUN.json"
COMPLETED_ROOT = PILOT_ROOT / "09_unity-lab/CompletedRuns"
UNITY_REPO = Path("/Users/bruce/Project Studio - Audio Systems Pilot 01 Client")
TOOL_PATH = "tools/audio_systems_pilot_01/snapshot_unity_validation_run.py"
VALIDATION_RELATIVE = "09_unity-lab/UNITY-AUDIO-LAB-VALIDATION.json"
MANAGEMENT_RELATIVE = "05_management-sfx/semantic-pack/management-semantic-catalogue.v4.json"
EXPECTED_POINTER_PATHS = {
    "09_unity-lab/Logs/compile-final.log",
    "09_unity-lab/Logs/editmode-final.log",
    "09_unity-lab/Logs/playmode-final.log",
    "09_unity-lab/Logs/build-final.log",
    "09_unity-lab/Logs/oracle-final.log",
    "09_unity-lab/Logs/validation-summary-final.log",
    "09_unity-lab/Logs/process-gate-compile-final.log",
    "09_unity-lab/Logs/process-gate-editmode-final.log",
    "09_unity-lab/Logs/process-gate-playmode-final.log",
    "09_unity-lab/Logs/process-gate-build-final.log",
    "09_unity-lab/Logs/process-gate-oracle-final.log",
    "09_unity-lab/Logs/process-gate-validation-summary-final.log",
    "09_unity-lab/TestResults/editmode-final.xml",
    "09_unity-lab/TestResults/playmode-final.xml",
    "09_unity-lab/RuntimeEvidence/audio-oracle-runtime-observations.json",
    "09_unity-lab/Builds/macOS/Project Studio Audio Systems Pilot.app.build-receipt.json",
    VALIDATION_RELATIVE,
    "07_audio-oracle/AUDIO-ORACLE-SUITE.v1.json",
    "07_audio-oracle/AUDIO-ORACLE-EVIDENCE-ARCHIVE-REGISTER.v1.json",
    MANAGEMENT_RELATIVE,
}


def canonical_json_bytes(value: Any) -> bytes:
    return (json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode("utf-8")


def git(repo: Path, *arguments: str, check: bool = True) -> subprocess.CompletedProcess[bytes]:
    return subprocess.run(["git", *arguments], cwd=repo, check=check, capture_output=True)


def tool_binding() -> dict[str, Any]:
    commit = git(DOC_REPO, "rev-parse", "HEAD").stdout.decode().strip()
    committed = git(DOC_REPO, "show", f"{commit}:{TOOL_PATH}").stdout
    working, _ = read_contained_regular_bytes(DOC_REPO, DOC_REPO / TOOL_PATH)
    if committed != working:
        raise RuntimeError("Unity run snapshot tool must be committed at current HEAD")
    return {
        "commit": commit,
        "path": TOOL_PATH,
        "blob_sha256": hashlib.sha256(committed).hexdigest(),
        "working_file_matches_commit": True,
    }


def safe_relative(value: Any) -> Path:
    if not isinstance(value, str):
        raise RuntimeError("Unity current-run pointer path is not a string")
    relative = Path(value)
    if relative.is_absolute() or ".." in relative.parts or str(relative) != value:
        raise RuntimeError(f"Unity current-run pointer path is unsafe: {value!r}")
    return relative


def inspect_tree(root: Path, manifest_path: Path) -> tuple[dict[str, tuple[int, str, int]], set[str]]:
    files: dict[str, tuple[int, str, int]] = {}
    directories: set[str] = set()
    for path in root.rglob("*"):
        relative = str(path.relative_to(root))
        mode = os.lstat(path).st_mode
        if stat.S_ISLNK(mode):
            raise RuntimeError(f"completed Unity run snapshot contains a refused symlink: {path}")
        if stat.S_ISDIR(mode):
            directories.add(relative)
        elif stat.S_ISREG(mode):
            if path != manifest_path:
                payload, file_mode = read_contained_regular_bytes(PILOT_ROOT, path)
                files[relative] = (
                    len(payload), hashlib.sha256(payload).hexdigest(), file_mode,
                )
        else:
            raise RuntimeError(f"completed Unity run snapshot contains a special node: {path}")
    return files, directories


def verify_snapshot(root: Path, expected_run_id: str | None = None) -> dict[str, Any]:
    root = require_contained_directory(PILOT_ROOT, root)
    manifest_path = root / "COMPLETED-RUN-MANIFEST.json"
    manifest_payload, _ = read_contained_regular_bytes(PILOT_ROOT, manifest_path)
    manifest = json.loads(manifest_payload.decode("utf-8"))
    if (manifest.get("schema") != "project-studio-unity-validation-completed-run/v1"
            or manifest.get("status") != "VERIFIED_SUCCESSFUL_RUN_BYTES"
            or manifest.get("run_id") != (expected_run_id or root.name)
            or manifest.get("validation_outcome") != "PASS"
            or manifest.get("superseded_app_disposition")
            != "REPLACEABLE_DERIVED_APP_NOT_PRESERVED; BUILD_RECEIPT_PRESERVED"):
        raise RuntimeError(f"completed Unity run manifest identity failed: {root}")
    rows = manifest.get("files")
    if not isinstance(rows, list) or not rows:
        raise RuntimeError(f"completed Unity run has no files: {root}")
    expected = {row.get("relative_path"): row for row in rows}
    if None in expected or len(expected) != len(rows):
        raise RuntimeError(f"completed Unity run paths are duplicate or missing: {root}")
    actual, actual_directories = inspect_tree(root, manifest_path)
    expected_directories = {
        str(parent)
        for relative in expected
        for parent in Path(str(relative)).parents
        if str(parent) != "."
    }
    if set(actual) != set(expected) or actual_directories != expected_directories:
        raise RuntimeError(f"completed Unity run tree differs from manifest: {root}")
    for relative, row in expected.items():
        if (row.get("mode") != 0o444
                or actual[relative] != (row.get("bytes"), row.get("sha256"), 0o444)):
            raise RuntimeError(f"completed Unity run file identity failed: {root.name}:{relative}")
    pointer_relative = "09_unity-lab/CURRENT-VALIDATION-RUN.json"
    pointer_path = root / pointer_relative
    pointer_payload, _ = read_contained_regular_bytes(PILOT_ROOT, pointer_path)
    pointer = json.loads(pointer_payload.decode("utf-8"))
    run_id = expected_run_id or root.name
    source_pointer = manifest.get("source_pointer", {})
    pointer_rows = pointer.get("files")
    pointer_paths = [row.get("relative_path") for row in pointer_rows] if isinstance(pointer_rows, list) else []
    if (source_pointer != {
                "relative_path": pointer_relative,
                "bytes": len(pointer_payload),
                "sha256": hashlib.sha256(pointer_payload).hexdigest(),
            }
            or pointer.get("schema") != "project-studio-unity-validation-current-run/v1"
            or pointer.get("status") != "PASS" or pointer.get("run_id") != run_id
            or pointer.get("documentation_sha") != manifest.get("documentation_sha")
            or pointer.get("unity_sha") != manifest.get("unity_sha")
            or not pointer_rows or None in pointer_paths
            or len(pointer_paths) != len(set(pointer_paths))
            or set(pointer_paths) != EXPECTED_POINTER_PATHS
            or set(expected) != {pointer_relative, *EXPECTED_POINTER_PATHS}):
        raise RuntimeError(f"completed Unity run pointer semantics failed: {root}")
    for row in pointer_rows:
        snapshot_row = expected.get(row["relative_path"])
        if (snapshot_row is None or snapshot_row.get("bytes") != row.get("bytes")
                or snapshot_row.get("sha256") != row.get("sha256")):
            raise RuntimeError(
                f"completed Unity run pointer projection failed: {root.name}:{row['relative_path']}"
            )
    validation_payload, _ = read_contained_regular_bytes(
        PILOT_ROOT, root / VALIDATION_RELATIVE
    )
    validation = json.loads(validation_payload.decode("utf-8"))
    management_row = next(row for row in pointer_rows if row["relative_path"] == MANAGEMENT_RELATIVE)
    required_components = (
        "compile", "edit_mode", "play_mode", "build", "codesign",
        "audio_oracle", "process_gates",
    )
    if (validation.get("schema") != "project-studio-unity-audio-lab-validation/v1"
            or validation.get("machine_verdict") != "PASS"
            or validation.get("unity_git_sha") != manifest.get("unity_sha")
            or validation.get("direct_pinned_management_sha256") != management_row.get("sha256")
            or any(validation.get(name, {}).get("status") != "PASS" for name in required_components)):
        raise RuntimeError(f"completed Unity run validation semantics failed: {root}")
    snapshot_tool = manifest.get("snapshot_tool", {})
    snapshot_commit = snapshot_tool.get("commit")
    tool_content = git(
        DOC_REPO, "show", f"{snapshot_commit}:{TOOL_PATH}", check=False
    )
    if (not isinstance(snapshot_commit, str)
            or re.fullmatch(r"[0-9a-f]{40}", snapshot_commit) is None
            or snapshot_tool.get("path") != TOOL_PATH
            or snapshot_tool.get("working_file_matches_commit") is not True
            or tool_content.returncode != 0
            or hashlib.sha256(tool_content.stdout).hexdigest()
            != snapshot_tool.get("blob_sha256")):
        raise RuntimeError(f"completed Unity run snapshot-tool binding failed: {root}")
    return manifest


def build_snapshot() -> dict[str, Any]:
    pilot = PILOT_ROOT.resolve(strict=True)
    pointer_payload, pointer_mode = read_contained_regular_bytes(PILOT_ROOT, CURRENT_POINTER)
    pointer_sha = hashlib.sha256(pointer_payload).hexdigest()
    pointer = json.loads(pointer_payload.decode("utf-8"))
    run_id = pointer.get("run_id")
    rows = pointer.get("files")
    if (pointer.get("schema") != "project-studio-unity-validation-current-run/v1"
            or pointer.get("status") != "PASS" or not isinstance(run_id, str)
            or re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,127}", run_id) is None
            or not isinstance(rows, list) or not rows):
        raise RuntimeError("current Unity run pointer is not a nonempty successful-run pointer")
    documentation_sha = pointer.get("documentation_sha")
    unity_sha = pointer.get("unity_sha")
    if (not isinstance(documentation_sha, str) or re.fullmatch(r"[0-9a-f]{40}", documentation_sha) is None
            or not isinstance(unity_sha, str) or re.fullmatch(r"[0-9a-f]{40}", unity_sha) is None
            or git(DOC_REPO, "cat-file", "-e", f"{documentation_sha}^{{commit}}", check=False).returncode != 0
            or git(UNITY_REPO, "cat-file", "-e", f"{unity_sha}^{{commit}}", check=False).returncode != 0):
        raise RuntimeError("current Unity run pointer Git identities are unavailable")
    pointer_paths = [row.get("relative_path") for row in rows]
    if (None in pointer_paths or len(set(pointer_paths)) != len(pointer_paths)
            or set(pointer_paths) != EXPECTED_POINTER_PATHS):
        raise RuntimeError("current Unity run pointer contains duplicate or missing paths")
    destination = COMPLETED_ROOT / run_id
    if os.path.lexists(destination):
        require_contained_directory(PILOT_ROOT, destination)
        existing = verify_snapshot(destination, run_id)
        if (existing.get("source_pointer", {}).get("sha256") != pointer_sha
                or existing.get("source_pointer", {}).get("bytes") != len(pointer_payload)
                or existing.get("documentation_sha") != documentation_sha
                or existing.get("unity_sha") != unity_sha):
            raise RuntimeError(f"completed Unity run destination already has a different identity: {run_id}")
        return {
            "run_id": run_id,
            "reused": True,
            "manifest_sha256": sha256_file(destination / "COMPLETED-RUN-MANIFEST.json"),
        }
    sources: list[tuple[str, bytes, int, str, int]] = []
    source_payloads: dict[str, bytes] = {}
    for row in rows:
        relative = safe_relative(row.get("relative_path"))
        lexical_source = pilot / relative
        payload, mode = read_contained_regular_bytes(PILOT_ROOT, lexical_source)
        expected_bytes = row.get("bytes")
        expected_sha = row.get("sha256")
        if (not isinstance(expected_bytes, int)
                or not isinstance(expected_sha, str) or len(expected_sha) != 64
                or len(payload) != expected_bytes or hashlib.sha256(payload).hexdigest() != expected_sha):
            raise RuntimeError(f"current Unity run source no longer matches its pointer: {relative}")
        sources.append((str(relative), payload, expected_bytes, expected_sha, mode))
        source_payloads[str(relative)] = payload
    validation_row = next((row for row in rows if row.get("relative_path") == VALIDATION_RELATIVE), None)
    management_row = next((row for row in rows if row.get("relative_path") == MANAGEMENT_RELATIVE), None)
    if validation_row is None or management_row is None:
        raise RuntimeError("current Unity run pointer omits validation or direct management identity")
    validation = json.loads(source_payloads[VALIDATION_RELATIVE].decode("utf-8"))
    required_components = ("compile", "edit_mode", "play_mode", "build", "codesign", "audio_oracle", "process_gates")
    if (validation.get("schema") != "project-studio-unity-audio-lab-validation/v1"
            or validation.get("machine_verdict") != "PASS"
            or validation.get("unity_git_sha") != unity_sha
            or validation.get("direct_pinned_management_sha256") != management_row.get("sha256")
            or any(validation.get(name, {}).get("status") != "PASS" for name in required_components)):
        raise RuntimeError("current Unity validation is not a matching successful outcome")

    ensure_contained_directory(PILOT_ROOT, COMPLETED_ROOT)
    staging_parent = ensure_contained_directory(PILOT_ROOT, PILOT_ROOT / "12_logs")
    staging = staging_parent / f"unity-completed-run.{run_id}.{os.getpid()}.{os.urandom(12).hex()}"
    staging, staging_identity = create_contained_directory_once(PILOT_ROOT, staging)
    destination_reserved = False
    destination_identity: tuple[int, int] | None = None
    try:
        copied_rows: list[dict[str, Any]] = []
        pointer_relative = "09_unity-lab/CURRENT-VALIDATION-RUN.json"
        all_sources = [
            (pointer_relative, pointer_payload, len(pointer_payload), pointer_sha, pointer_mode),
            *sources,
        ]
        for relative, payload, expected_bytes, expected_sha, _source_mode in all_sources:
            target = staging / relative
            staged = publish_immutable_bytes(PILOT_ROOT, target, payload, 0o444)
            if staged["bytes"] != expected_bytes or staged["sha256"] != expected_sha:
                raise RuntimeError(f"completed Unity run snapshot copy changed: {relative}")
            copied_rows.append({
                "relative_path": relative, "bytes": expected_bytes,
                "sha256": expected_sha, "mode": 0o444,
            })
        manifest = {
            "schema": "project-studio-unity-validation-completed-run/v1",
            "run_id": run_id,
            "status": "VERIFIED_SUCCESSFUL_RUN_BYTES",
            "validation_outcome": "PASS",
            "documentation_sha": documentation_sha,
            "unity_sha": unity_sha,
            "source_pointer": {
                "relative_path": pointer_relative,
                "bytes": len(pointer_payload),
                "sha256": pointer_sha,
            },
            "superseded_app_disposition": "REPLACEABLE_DERIVED_APP_NOT_PRESERVED; BUILD_RECEIPT_PRESERVED",
            "snapshot_tool": tool_binding(),
            "files": copied_rows,
        }
        manifest_path = staging / "COMPLETED-RUN-MANIFEST.json"
        publish_immutable_bytes(
            PILOT_ROOT, manifest_path, canonical_json_bytes(manifest), 0o444
        )
        verify_snapshot(staging, run_id)
        try:
            destination, destination_identity = create_contained_directory_once(
                PILOT_ROOT, destination
            )
            destination_reserved = True
        except RuntimeError as error:
            raise RuntimeError(f"completed Unity run destination appeared during publication: {destination}") from error
        for source in sorted(staging.rglob("*"), key=lambda path: (len(path.parts), str(path))):
            relative = source.relative_to(staging)
            target = destination / relative
            if source == manifest_path:
                continue
            source_mode = os.lstat(source).st_mode
            if stat.S_ISLNK(source_mode):
                raise RuntimeError(f"completed Unity run staging contains a refused link: {source}")
            if stat.S_ISDIR(source_mode):
                ensure_contained_directory(PILOT_ROOT, target)
            elif stat.S_ISREG(source_mode):
                payload, mode = read_contained_regular_bytes(PILOT_ROOT, source)
                publish_immutable_bytes(PILOT_ROOT, target, payload, mode)
            else:
                raise RuntimeError(f"completed Unity run staging contains an unsafe entry: {source}")
        publish_immutable_bytes(
            PILOT_ROOT, destination / "COMPLETED-RUN-MANIFEST.json",
            read_contained_regular_bytes(PILOT_ROOT, manifest_path)[0], 0o444,
        )
        verify_snapshot(destination)
    except Exception:
        if (destination_reserved and destination_identity is not None
                and not os.path.lexists(destination / "COMPLETED-RUN-MANIFEST.json")):
            remove_contained_directory(PILOT_ROOT, destination, destination_identity)
        if os.path.lexists(staging):
            remove_contained_directory(PILOT_ROOT, staging, staging_identity)
        raise
    remove_contained_directory(PILOT_ROOT, staging, staging_identity)
    return {"run_id": run_id, "reused": False, "manifest_sha256": sha256_file(destination / "COMPLETED-RUN-MANIFEST.json")}


def main() -> None:
    print(json.dumps({
        "schema": "project-studio-unity-validation-snapshot-result/v1",
        "machine_verdict": "PASS",
        **build_snapshot(),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
