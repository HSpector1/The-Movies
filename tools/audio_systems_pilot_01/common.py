#!/usr/bin/env python3
"""Dependency-light shared helpers for the isolated Audio Systems Pilot."""

from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


DEFAULT_PILOT_ROOT = Path("/Users/bruce/Project Studio Audio Systems Pilot 01")
PILOT_ROOT = Path(os.environ.get("PROJECT_STUDIO_AUDIO_PILOT_ROOT", DEFAULT_PILOT_ROOT))
MARATHON_ROOT = Path("/Users/bruce/Project Studio Audio Foundry Marathon 01")
MUSIC_PILOT_ROOT = Path("/Users/bruce/Project Studio Music Pilot 01")
TOOLING_ROOT = Path("/Users/bruce/Project Studio Music Pilot 01 Tooling")
DOC_REPO = Path(__file__).resolve().parents[2]
STATE_PATH = PILOT_ROOT / "00_state/AUDIO-SYSTEMS-PILOT-STATE.json"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def sha256_file(path: Path, chunk_size: int = 1024 * 1024) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        while chunk := handle.read(chunk_size):
            digest.update(chunk)
    return digest.hexdigest()


def atomic_write_text(path: Path, payload: str, mode: int | None = None) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    wanted_mode = mode if mode is not None else (path.stat().st_mode & 0o777 if path.exists() else 0o644)
    descriptor, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    temp_path = Path(temp_name)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(temp_path, wanted_mode)
        os.replace(temp_path, path)
    finally:
        temp_path.unlink(missing_ok=True)


def atomic_write_json(path: Path, value: Any) -> None:
    atomic_write_text(path, json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n")


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def git_head(repo: Path) -> str:
    return subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=repo, check=True, capture_output=True, text=True
    ).stdout.strip()


def probe_audio(path: Path) -> dict[str, Any]:
    completed = subprocess.run(
        [
            "ffprobe", "-v", "error", "-select_streams", "a:0",
            "-show_entries", "stream=codec_name,sample_rate,channels,bits_per_sample:format=duration",
            "-of", "json", str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    data = json.loads(completed.stdout)
    if len(data.get("streams", [])) != 1:
        raise RuntimeError(f"expected exactly one audio stream: {path}")
    stream = data["streams"][0]
    return {
        "codec": stream.get("codec_name"),
        "sample_rate_hz": int(stream["sample_rate"]),
        "channels": int(stream["channels"]),
        "bits_per_sample": int(stream.get("bits_per_sample") or 0),
        "duration_seconds": round(float(data["format"]["duration"]), 6),
    }


def canonical_contained(root: Path, candidate: Path) -> Path:
    canonical_root = root.resolve(strict=True)
    canonical_candidate = candidate.resolve(strict=True)
    try:
        canonical_candidate.relative_to(canonical_root)
    except ValueError as error:
        raise RuntimeError(f"path escapes approved root: {candidate}") from error
    return canonical_candidate


def materialize_verified(source: Path, destination: Path, expected_sha256: str) -> dict[str, Any]:
    if sha256_file(source) != expected_sha256:
        raise RuntimeError(f"source hash mismatch before materialization: {source}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        actual = sha256_file(destination)
        if actual != expected_sha256:
            raise RuntimeError(f"existing destination differs; refusing overwrite: {destination}")
        return {"path": str(destination), "bytes": destination.stat().st_size, "sha256": actual, "reused": True}
    descriptor, temp_name = tempfile.mkstemp(prefix=f".{destination.name}.", suffix=".tmp", dir=destination.parent)
    os.close(descriptor)
    temp_path = Path(temp_name)
    temp_path.unlink()
    try:
        clone = subprocess.run(["cp", "-c", str(source), str(temp_path)], capture_output=True, text=True)
        if clone.returncode != 0:
            shutil.copy2(source, temp_path)
        actual = sha256_file(temp_path)
        if actual != expected_sha256:
            raise RuntimeError(f"materialized hash mismatch: {destination}")
        os.chmod(temp_path, 0o444)
        os.replace(temp_path, destination)
    finally:
        temp_path.unlink(missing_ok=True)
    return {"path": str(destination), "bytes": destination.stat().st_size, "sha256": expected_sha256, "reused": False}


def collision_processes() -> list[str]:
    completed = subprocess.run(
        ["ps", "-axo", "pid=,ppid=,command="], check=True, capture_output=True, text=True
    )
    matches: list[str] = []
    for line in completed.stdout.splitlines():
        lower = line.lower()
        if (
            "/unity.app/contents/macos/unity" in lower
            or ("unity" in lower and "-batchmode" in lower)
            or "sa3_mlx.py" in lower
            or ("p05" in lower and ("proof" in lower or "test" in lower or "build" in lower))
        ):
            matches.append(line.strip())
    return matches


def update_state(
    *,
    phase: str | None = None,
    status: str | None = None,
    completed: list[str] | None = None,
    errors: list[dict[str, Any] | str] | None = None,
    decisions: list[dict[str, Any]] | None = None,
    counts: dict[str, int] | None = None,
    next_action: str | None = None,
    unity_repo: Path | None = None,
) -> None:
    state = read_json(STATE_PATH)
    if phase is not None:
        state["phase"] = phase
    if status is not None:
        state["status"] = status
    for item in completed or []:
        if item not in state["completed_work"]:
            state["completed_work"].append(item)
    for item in errors or []:
        entry = {"at_utc": utc_now(), "message": item} if isinstance(item, str) else item
        entry_id = entry.get("id") if isinstance(entry, dict) else None
        existing_index = next((index for index, value in enumerate(state["errors"])
            if entry_id is not None and isinstance(value, dict) and value.get("id") == entry_id), None)
        if existing_index is not None:
            state["errors"][existing_index] = entry
        elif entry not in state["errors"]:
            state["errors"].append(entry)
    for item in decisions or []:
        item_id = item.get("id")
        existing_index = next((index for index, value in enumerate(state["decisions"])
            if item_id is not None and value.get("id") == item_id), None)
        if existing_index is not None:
            state["decisions"][existing_index] = item
        else:
            state["decisions"].append(item)
    state["counts"].update(counts or {})
    if next_action is not None:
        state["next_resumable_action"] = next_action
    state["updated_utc"] = utc_now()
    state["git"]["documentation_sha"] = git_head(DOC_REPO)
    if unity_repo is not None:
        state["git"]["unity_sha"] = git_head(unity_repo)
    atomic_write_json(STATE_PATH, state)
