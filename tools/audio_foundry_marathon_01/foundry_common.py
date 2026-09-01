#!/usr/bin/env python3
"""Shared, dependency-free utilities for Audio Foundry Marathon 01."""

from __future__ import annotations

import hashlib
import json
import os
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


MARATHON_ROOT = Path("/Users/bruce/Project Studio Audio Foundry Marathon 01")
PILOT_ROOT = Path("/Users/bruce/Project Studio Music Pilot 01")
TOOLING_ROOT = Path("/Users/bruce/Project Studio Music Pilot 01 Tooling")
DOC_WORKTREE = Path("/Users/bruce/The Movies - Audio Marathon 01")
STATE_PATH = MARATHON_ROOT / "00_state" / "MARATHON-STATE.json"
DISK_CAP_BYTES = 80 * 1024**3


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def sha256_file(path: Path, chunk_size: int = 1024 * 1024) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        while chunk := handle.read(chunk_size):
            digest.update(chunk)
    return digest.hexdigest()


def atomic_write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    mode = path.stat().st_mode & 0o777 if path.exists() else 0o644
    fd, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    temp_path = Path(temp_name)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="") as handle:
            handle.write(text)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(temp_path, mode)
        os.replace(temp_path, path)
    finally:
        temp_path.unlink(missing_ok=True)


def atomic_write_json(path: Path, value: Any) -> None:
    atomic_write_text(path, json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n")


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def git_sha() -> str:
    result = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=DOC_WORKTREE,
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def retained_bytes() -> int:
    total = 0
    for root, _, names in os.walk(MARATHON_ROOT):
        for name in names:
            path = Path(root) / name
            try:
                total += path.stat().st_size
            except FileNotFoundError:
                pass
    return total


def collision_processes() -> list[str]:
    """Return only high-confidence forbidden-process matches; never kills anything."""
    result = subprocess.run(
        ["ps", "-axo", "pid=,ppid=,command="],
        check=True,
        capture_output=True,
        text=True,
    )
    matches: list[str] = []
    for line in result.stdout.splitlines():
        lower = line.lower()
        forbidden = (
            "/unity.app/contents/macos/unity" in lower
            or "project studio.app/contents/macos" in lower
            or ("unity" in lower and "-batchmode" in lower)
            or ("p05" in lower and "proof" in lower)
        )
        if forbidden:
            matches.append(line.strip())
    return matches


def require_generation_safety() -> None:
    collisions = collision_processes()
    if collisions:
        raise RuntimeError("generation collision gate: " + " | ".join(collisions))
    used = retained_bytes()
    if used >= DISK_CAP_BYTES:
        raise RuntimeError(f"marathon retained disk cap reached: {used} >= {DISK_CAP_BYTES}")
