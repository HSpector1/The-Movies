#!/usr/bin/env python3
"""Publish immutable metadata-only status-language remedies after hostile review."""

from __future__ import annotations

import hashlib
import json
import os
import re
import stat
import subprocess
from copy import deepcopy
from pathlib import Path
from typing import Any

from common import (
    DOC_REPO, PILOT_ROOT, contained_exclusive_lock, publish_immutable_bytes,
    read_contained_regular_bytes, replace_contained_bytes, require_contained_directory,
    sha256_file,
)


SOURCE = PILOT_ROOT / "05_management-sfx/semantic-pack/management-semantic-catalogue.v3.json"
OUTPUT = PILOT_ROOT / "05_management-sfx/semantic-pack/management-semantic-catalogue.v4.json"
HISTORY_ROOT = PILOT_ROOT / "05_management-sfx/semantic-pack/history"
HISTORY_REGISTER = PILOT_ROOT / "05_management-sfx/semantic-pack/MANAGEMENT-METADATA-HISTORY.v1.json"
CREATED_AT = "2026-09-03T00:00:00Z"
SOURCE_RELATIVE = "tools/audio_systems_pilot_01/publish_metadata_status_remedies.py"
HISTORY_NAME = re.compile(r"management-semantic-catalogue\.v4-([0-9a-f]{64})\.json")


def source_binding() -> dict[str, Any]:
    commit = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=DOC_REPO, check=True, capture_output=True, text=True
    ).stdout.strip()
    relative = SOURCE_RELATIVE
    committed = subprocess.run(
        ["git", "show", f"{commit}:{relative}"], cwd=DOC_REPO, check=True, capture_output=True
    ).stdout
    committed_hash = hashlib.sha256(committed).hexdigest()
    current_hash = sha256_file(DOC_REPO / relative)
    if committed_hash != current_hash:
        raise RuntimeError("metadata-remedy builder is not committed at current HEAD")
    return {"commit": commit, "path": relative, "blob_sha256": committed_hash, "working_file_matches_commit": True}


def validated_source_binding(binding: Any, path: Path) -> dict[str, Any]:
    """Prove one catalogue's exact historical generator identity."""
    if not isinstance(binding, dict):
        raise RuntimeError(f"management metadata source binding is malformed: {path}")
    commit = binding.get("commit")
    committed = subprocess.run(
        ["git", "show", f"{commit}:{SOURCE_RELATIVE}"],
        cwd=DOC_REPO, check=False, capture_output=True,
    )
    expected = {
        "commit": commit,
        "path": SOURCE_RELATIVE,
        "blob_sha256": hashlib.sha256(committed.stdout).hexdigest(),
        "working_file_matches_commit": True,
    }
    if (not isinstance(commit, str) or re.fullmatch(r"[0-9a-f]{40}", commit) is None
            or committed.returncode != 0 or binding != expected):
        raise RuntimeError(f"management metadata historical Git binding failed: {path}")
    return expected


def catalogue_for_binding(
    source: dict[str, Any], source_sha: str, binding: dict[str, Any]
) -> dict[str, Any]:
    """Reconstruct the only admitted v4 bytes from v3 plus one Git binding."""
    output = deepcopy(source)
    corrected = 0
    for row in output.get("vocabulary", []):
        if row.get("repeat_variation") == "shuffle among approved candidates; no immediate repeat":
            row["repeat_variation"] = "shuffle among eligible provisional candidates; no immediate repeat"
            corrected += 1
    if corrected != 15:
        raise RuntimeError(f"expected 15 approval-language corrections, got {corrected}")
    output.update({
        "schema": "project-studio-management-audio-language/v4",
        "generated_at_utc": CREATED_AT,
        "supersedes": {
            "path": str(SOURCE),
            "sha256": source_sha,
            "reason": "Removes ambiguous approval language; audio and machine selections are unchanged.",
        },
        "source_code": binding,
        "approval_language_corrections": corrected,
        "machine_verdict": "PASS",
    })
    return output


def catalogue_bytes(catalogue: dict[str, Any]) -> bytes:
    return (json.dumps(catalogue, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode("utf-8")


def validate_catalogue_history(
    payload: bytes, digest: str, path: Path, source: dict[str, Any], source_sha: str
) -> dict[str, Any]:
    """Prove byte-exact deterministic reconstruction and the historical generator."""
    if hashlib.sha256(payload).hexdigest() != digest:
        raise RuntimeError(f"management metadata history digest failed: {path}")
    catalogue = json.loads(payload.decode("utf-8"))
    binding = validated_source_binding(catalogue.get("source_code"), path)
    expected = catalogue_bytes(catalogue_for_binding(source, source_sha, binding))
    if payload != expected:
        raise RuntimeError(f"management metadata is not the exact deterministic v3-to-v4 projection: {path}")
    return catalogue


def collect_history_entries(source: dict[str, Any], source_sha: str) -> list[dict[str, Any]]:
    """Preflight the complete existing immutable set without mutating it."""
    if not os.path.lexists(HISTORY_ROOT):
        return []
    history_root = require_contained_directory(PILOT_ROOT, HISTORY_ROOT)
    entries: list[dict[str, Any]] = []
    for path in sorted(history_root.iterdir(), key=lambda value: value.name):
        mode = os.lstat(path).st_mode
        match = HISTORY_NAME.fullmatch(path.name)
        if path.is_symlink() or not stat.S_ISREG(mode) or match is None:
            raise RuntimeError(f"management metadata history contains a linked, special, or malformed entry: {path}")
        payload, file_mode = read_contained_regular_bytes(PILOT_ROOT, path)
        digest = hashlib.sha256(payload).hexdigest()
        if digest != match.group(1) or file_mode != 0o444:
            raise RuntimeError(f"management metadata history identity failed: {path}")
        catalogue = validate_catalogue_history(payload, digest, path, source, source_sha)
        entries.append({
            "absolute_path": str(path),
            "relative_path": str(path.relative_to(PILOT_ROOT)),
            "bytes": len(payload),
            "sha256": digest,
            "mode": file_mode,
            "catalogue_source_code": catalogue["source_code"],
        })
    return entries


def preserve_current_output(source: dict[str, Any], source_sha: str) -> str | None:
    """Validate, then retain the exact prior D-bound catalogue before rebinding v4."""
    if not os.path.lexists(OUTPUT):
        return None
    payload, _ = read_contained_regular_bytes(PILOT_ROOT, OUTPUT)
    digest = hashlib.sha256(payload).hexdigest()
    validate_catalogue_history(payload, digest, OUTPUT, source, source_sha)
    destination = HISTORY_ROOT / f"management-semantic-catalogue.v4-{digest}.json"
    publish_immutable_bytes(PILOT_ROOT, destination, payload)
    return digest


def publish_history_register(
    binding: dict[str, Any], source: dict[str, Any], source_sha: str
) -> dict[str, Any]:
    """Authorize the exact immutable D-bound catalogue set, including intermediate bindings."""
    entries = collect_history_entries(source, source_sha)
    if not entries:
        raise RuntimeError("management metadata history may not be empty")
    register = {
        "schema": "project-studio-management-metadata-history/v1",
        "generated_at_utc": CREATED_AT,
        "status": "PRESERVED_D_BOUND_METADATA_BYTES",
        "source_code": binding,
        "entries": entries,
        "counts": {"catalogues": len(entries)},
        "machine_verdict": "PASS",
        "limitations": [
            "Registration authenticates preserved metadata bytes and their committed generators; it does not rehabilitate a failed historical Unity run.",
            "Machine validation is not Owner listening acceptance or commercial clearance.",
        ],
    }
    register_payload = (
        json.dumps(register, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
    ).encode("utf-8")
    prior_register_sha: str | None = None
    if os.path.lexists(HISTORY_REGISTER):
        prior_register_payload, _ = read_contained_regular_bytes(PILOT_ROOT, HISTORY_REGISTER)
        prior_register_sha = hashlib.sha256(prior_register_payload).hexdigest()
    replace_contained_bytes(
        PILOT_ROOT, HISTORY_REGISTER, register_payload,
        expected_existing_sha256=prior_register_sha,
    )
    return register


def build() -> dict[str, Any]:
    source_payload, _ = read_contained_regular_bytes(PILOT_ROOT, SOURCE)
    source_sha = hashlib.sha256(source_payload).hexdigest()
    source = json.loads(source_payload.decode("utf-8"))
    candidates = source.get("candidates")
    if (source.get("schema") != "project-studio-management-audio-language/v3"
            or source.get("rights_status") != "PROTOTYPE_ONLY"
            or not isinstance(candidates, list) or not candidates
            or source.get("candidate_count") != len(candidates)):
        raise RuntimeError("management v3 source contract failed")
    for candidate in candidates:
        audio = Path(candidate["audio"]["path"])
        audio_payload, _ = read_contained_regular_bytes(PILOT_ROOT, audio)
        if hashlib.sha256(audio_payload).hexdigest() != candidate["audio"]["sha256"]:
            raise RuntimeError(f"management candidate changed: {audio}")
        if (candidate.get("human_disposition") != "PENDING"
                or candidate.get("rights_status") != "PROTOTYPE_ONLY"):
            raise RuntimeError("management human disposition exceeds prototype boundary")
    binding = source_binding()
    output = catalogue_for_binding(source, source_sha, binding)
    output_payload = catalogue_bytes(output)
    lock_path = PILOT_ROOT / "12_logs/locks/evidence-publication.lock"
    with contained_exclusive_lock(PILOT_ROOT, lock_path):
        # Every existing immutable entry and the mutable current projection must
        # pass before the first new immutable byte is published.
        collect_history_entries(source, source_sha)
        prior_sha = preserve_current_output(source, source_sha)
        replace_contained_bytes(
            PILOT_ROOT, OUTPUT, output_payload,
            expected_existing_sha256=prior_sha,
        )
        current_payload, _ = read_contained_regular_bytes(PILOT_ROOT, OUTPUT)
        current_sha = hashlib.sha256(current_payload).hexdigest()
        publish_immutable_bytes(
            PILOT_ROOT,
            HISTORY_ROOT / f"management-semantic-catalogue.v4-{current_sha}.json",
            current_payload,
        )
        publish_history_register(binding, source, source_sha)
    return output


def main() -> None:
    output = build()
    print(json.dumps({"path": str(OUTPUT), "sha256": sha256_file(OUTPUT), "corrections": output["approval_language_corrections"], "machine_verdict": output["machine_verdict"]}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
