#!/usr/bin/env python3
"""Publish immutable metadata-only status-language remedies after hostile review."""

from __future__ import annotations

import hashlib
import json
import subprocess
from copy import deepcopy
from pathlib import Path
from typing import Any

from common import DOC_REPO, PILOT_ROOT, atomic_write_json, sha256_file


SOURCE = PILOT_ROOT / "05_management-sfx/semantic-pack/management-semantic-catalogue.v3.json"
OUTPUT = PILOT_ROOT / "05_management-sfx/semantic-pack/management-semantic-catalogue.v4.json"
CREATED_AT = "2026-09-03T00:00:00Z"


def source_binding() -> dict[str, Any]:
    commit = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=DOC_REPO, check=True, capture_output=True, text=True
    ).stdout.strip()
    relative = "tools/audio_systems_pilot_01/publish_metadata_status_remedies.py"
    committed = subprocess.run(
        ["git", "show", f"{commit}:{relative}"], cwd=DOC_REPO, check=True, capture_output=True
    ).stdout
    committed_hash = hashlib.sha256(committed).hexdigest()
    current_hash = sha256_file(DOC_REPO / relative)
    if committed_hash != current_hash:
        raise RuntimeError("metadata-remedy builder is not committed at current HEAD")
    return {"commit": commit, "path": relative, "blob_sha256": committed_hash, "working_file_matches_commit": True}


def build() -> dict[str, Any]:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    output = deepcopy(source)
    corrected = 0
    for row in output["vocabulary"]:
        if row.get("repeat_variation") == "shuffle among approved candidates; no immediate repeat":
            row["repeat_variation"] = "shuffle among eligible provisional candidates; no immediate repeat"
            corrected += 1
    if corrected != 15:
        raise RuntimeError(f"expected 15 approval-language corrections, got {corrected}")
    for candidate in output["candidates"]:
        audio = Path(candidate["audio"]["path"])
        if sha256_file(audio) != candidate["audio"]["sha256"]:
            raise RuntimeError(f"management candidate changed: {audio}")
        if candidate.get("human_disposition") != "PENDING":
            raise RuntimeError("management human disposition exceeds prototype boundary")
    output.update({
        "schema": "project-studio-management-audio-language/v4",
        "generated_at_utc": CREATED_AT,
        "supersedes": {"path": str(SOURCE), "sha256": sha256_file(SOURCE), "reason": "Removes ambiguous approval language; audio and machine selections are unchanged."},
        "source_code": source_binding(),
        "approval_language_corrections": corrected,
        "machine_verdict": "PASS",
    })
    atomic_write_json(OUTPUT, output)
    return output


def main() -> None:
    output = build()
    print(json.dumps({"path": str(OUTPUT), "sha256": sha256_file(OUTPUT), "corrections": output["approval_language_corrections"], "machine_verdict": output["machine_verdict"]}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
