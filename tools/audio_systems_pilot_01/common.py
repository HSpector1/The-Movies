#!/usr/bin/env python3
"""Dependency-light shared helpers for the isolated Audio Systems Pilot."""

from __future__ import annotations

import hashlib
import fcntl
import json
import os
import secrets
import shutil
import stat
import subprocess
import tempfile
from contextlib import contextmanager
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


def verify_exact_file_reference(
    record: Any, expected_path: Path, allowed_root: Path, *, label: str
) -> Path:
    """Verify one exact path/hash record through the shared no-follow reader."""
    if (not isinstance(record, dict) or set(record) != {"path", "sha256"}
            or not isinstance(record.get("path"), str)
            or not isinstance(record.get("sha256"), str)
            or len(record["sha256"]) != 64
            or any(character not in "0123456789abcdef" for character in record["sha256"])):
        raise RuntimeError(f"{label} identity is malformed")
    candidate = Path(record["path"])
    if not candidate.is_absolute():
        candidate = allowed_root / candidate
    lexical_candidate = Path(os.path.abspath(candidate))
    lexical_expected = Path(os.path.abspath(expected_path))
    if lexical_candidate != lexical_expected:
        raise RuntimeError(f"{label} path is not the exact expected file: {lexical_candidate}")
    payload, _ = read_contained_regular_bytes(allowed_root, lexical_candidate)
    actual_sha256 = hashlib.sha256(payload).hexdigest()
    if record["sha256"] != actual_sha256:
        raise RuntimeError(
            f"{label} hash mismatch: declared={record['sha256']};actual={actual_sha256}"
        )
    return lexical_candidate


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


def _contained_relative(root: Path, candidate: Path, label: str) -> tuple[Path, Path, Path]:
    lexical_root = Path(os.path.abspath(root))
    lexical_candidate = Path(os.path.abspath(candidate))
    try:
        relative = lexical_candidate.relative_to(lexical_root)
    except ValueError as error:
        raise RuntimeError(f"{label} escapes its allowed lexical root: {candidate}") from error
    if (not os.path.lexists(lexical_root) or lexical_root.is_symlink()
            or not stat.S_ISDIR(os.lstat(lexical_root).st_mode)):
        raise RuntimeError(f"allowed {label} root is not a real directory: {lexical_root}")
    return lexical_root, lexical_candidate, relative


def _open_contained_directory(
    root: Path, directory: Path, *, create: bool, mode: int = 0o755
) -> tuple[Path, int]:
    """Open a child directory through no-follow dirfds, optionally creating it."""
    lexical_root, lexical_directory, relative = _contained_relative(root, directory, "directory")
    flags = os.O_RDONLY | os.O_DIRECTORY | getattr(os, "O_NOFOLLOW", 0)
    descriptor = os.open(lexical_root, flags)
    try:
        for part in relative.parts:
            if create:
                try:
                    os.mkdir(part, mode, dir_fd=descriptor)
                except FileExistsError:
                    pass
            try:
                child = os.open(part, flags, dir_fd=descriptor)
            except OSError as error:
                raise RuntimeError(
                    f"directory component is missing, linked, or special: {lexical_directory}"
                ) from error
            os.close(descriptor)
            descriptor = child
        if not stat.S_ISDIR(os.fstat(descriptor).st_mode):
            raise RuntimeError(f"opened storage path is not a directory: {lexical_directory}")
        return lexical_directory, descriptor
    except Exception:
        os.close(descriptor)
        raise


def ensure_contained_directory(root: Path, directory: Path, mode: int = 0o755) -> Path:
    """Create and open-check a lexical child directory without following links."""
    lexical_directory, descriptor = _open_contained_directory(root, directory, create=True, mode=mode)
    os.close(descriptor)
    return lexical_directory


def require_contained_directory(root: Path, directory: Path) -> Path:
    """Return a lexical child directory after a no-follow component walk."""
    lexical_directory, descriptor = _open_contained_directory(root, directory, create=False)
    os.close(descriptor)
    return lexical_directory


def create_contained_directory_once(
    root: Path, directory: Path, mode: int = 0o755
) -> tuple[Path, tuple[int, int]]:
    """Create exactly one child directory through its no-follow parent dirfd."""
    lexical_root, lexical_directory, relative = _contained_relative(root, directory, "directory")
    if not relative.parts:
        raise RuntimeError("created directory may not replace its allowed root")
    _, parent_descriptor = _open_contained_directory(
        lexical_root, lexical_directory.parent, create=False
    )
    flags = os.O_RDONLY | os.O_DIRECTORY | getattr(os, "O_NOFOLLOW", 0)
    try:
        try:
            os.mkdir(lexical_directory.name, mode, dir_fd=parent_descriptor)
        except FileExistsError as error:
            raise RuntimeError(f"directory already exists: {lexical_directory}") from error
        child_descriptor = os.open(lexical_directory.name, flags, dir_fd=parent_descriptor)
        try:
            identity = os.fstat(child_descriptor)
        finally:
            os.close(child_descriptor)
        os.fsync(parent_descriptor)
    finally:
        os.close(parent_descriptor)
    return lexical_directory, (identity.st_dev, identity.st_ino)


def remove_contained_directory(
    root: Path, directory: Path, expected_identity: tuple[int, int]
) -> None:
    """Remove one owned tree by dirfd only when its exact directory identity matches."""
    lexical_root, lexical_directory, relative = _contained_relative(root, directory, "directory")
    if not relative.parts:
        raise RuntimeError("refusing to remove the allowed directory root")
    _, parent_descriptor = _open_contained_directory(
        lexical_root, lexical_directory.parent, create=False
    )
    try:
        actual = os.stat(lexical_directory.name, dir_fd=parent_descriptor, follow_symlinks=False)
        if (not stat.S_ISDIR(actual.st_mode)
                or (actual.st_dev, actual.st_ino) != expected_identity):
            raise RuntimeError(f"owned directory identity changed before removal: {lexical_directory}")
        _remove_directory_entry(
            parent_descriptor, lexical_directory.name, expected_identity, lexical_directory
        )
        os.fsync(parent_descriptor)
    finally:
        os.close(parent_descriptor)


def _remove_directory_entry(
    parent_descriptor: int,
    name: str,
    expected_identity: tuple[int, int],
    display_path: Path,
) -> None:
    """Recursively unlink one already-identified directory without following names."""
    flags = os.O_RDONLY | os.O_DIRECTORY | getattr(os, "O_NOFOLLOW", 0)
    try:
        directory_descriptor = os.open(name, flags, dir_fd=parent_descriptor)
    except OSError as error:
        raise RuntimeError(f"owned directory became linked or inaccessible: {display_path}") from error
    try:
        opened = os.fstat(directory_descriptor)
        if (not stat.S_ISDIR(opened.st_mode)
                or (opened.st_dev, opened.st_ino) != expected_identity):
            raise RuntimeError(f"owned directory identity changed during removal: {display_path}")
        for child_name in os.listdir(directory_descriptor):
            child_path = display_path / child_name
            observed = os.stat(
                child_name, dir_fd=directory_descriptor, follow_symlinks=False
            )
            child_identity = (observed.st_dev, observed.st_ino)
            if stat.S_ISDIR(observed.st_mode):
                _remove_directory_entry(
                    directory_descriptor, child_name, child_identity, child_path
                )
                continue
            if not stat.S_ISREG(observed.st_mode):
                raise RuntimeError(
                    f"owned directory cleanup refuses a linked or special child: {child_path}"
                )
            try:
                child_descriptor = os.open(
                    child_name,
                    os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0),
                    dir_fd=directory_descriptor,
                )
            except OSError as error:
                raise RuntimeError(
                    f"owned directory child became linked or inaccessible: {child_path}"
                ) from error
            try:
                opened_child = os.fstat(child_descriptor)
            finally:
                os.close(child_descriptor)
            current_child = os.stat(
                child_name, dir_fd=directory_descriptor, follow_symlinks=False
            )
            identity_fields = ("st_dev", "st_ino", "st_mode", "st_size", "st_mtime_ns")
            if (not stat.S_ISREG(opened_child.st_mode)
                    or any(getattr(opened_child, field) != getattr(observed, field)
                           for field in identity_fields)
                    or any(getattr(current_child, field) != getattr(observed, field)
                           for field in identity_fields)):
                raise RuntimeError(f"owned directory child identity changed: {child_path}")
            os.unlink(child_name, dir_fd=directory_descriptor)
        os.fsync(directory_descriptor)
    finally:
        os.close(directory_descriptor)
    current = os.stat(name, dir_fd=parent_descriptor, follow_symlinks=False)
    if (not stat.S_ISDIR(current.st_mode)
            or (current.st_dev, current.st_ino) != expected_identity):
        raise RuntimeError(f"owned directory identity changed before final removal: {display_path}")
    os.rmdir(name, dir_fd=parent_descriptor)


def remove_contained_regular_file(
    root: Path,
    candidate: Path,
    *,
    expected_sha256: str | None = None,
    missing_ok: bool = False,
) -> bool:
    """Unlink an observed regular file through a no-follow parent dirfd; callers serialize writers."""
    lexical_root, lexical_candidate, relative = _contained_relative(root, candidate, "file")
    if not relative.parts:
        raise RuntimeError("refusing to remove the allowed root")
    _, parent_descriptor = _open_contained_directory(
        lexical_root, lexical_candidate.parent, create=False
    )
    try:
        try:
            descriptor = os.open(
                lexical_candidate.name,
                os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0),
                dir_fd=parent_descriptor,
            )
        except FileNotFoundError:
            if missing_ok:
                return False
            raise RuntimeError(f"file disappeared before removal: {lexical_candidate}")
        except OSError as error:
            raise RuntimeError(f"file is linked or inaccessible: {lexical_candidate}") from error
        try:
            before = os.fstat(descriptor)
            if not stat.S_ISREG(before.st_mode):
                raise RuntimeError(f"removal target is not regular: {lexical_candidate}")
            digest = hashlib.sha256()
            while chunk := os.read(descriptor, 1024 * 1024):
                digest.update(chunk)
        finally:
            os.close(descriptor)
        if expected_sha256 is not None and digest.hexdigest() != expected_sha256:
            raise RuntimeError(f"removal target hash changed: {lexical_candidate}")
        current = os.stat(
            lexical_candidate.name, dir_fd=parent_descriptor, follow_symlinks=False
        )
        if (not stat.S_ISREG(current.st_mode)
                or (current.st_dev, current.st_ino, current.st_size, current.st_mtime_ns)
                != (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns)):
            raise RuntimeError(f"removal target identity changed: {lexical_candidate}")
        os.unlink(lexical_candidate.name, dir_fd=parent_descriptor)
        os.fsync(parent_descriptor)
        return True
    finally:
        os.close(parent_descriptor)


def _open_contained_regular_file(root: Path, candidate: Path) -> tuple[Path, int]:
    lexical_root, lexical_candidate, relative = _contained_relative(root, candidate, "file")
    if not relative.parts:
        raise RuntimeError(f"file path names the allowed directory root: {candidate}")
    _, parent_descriptor = _open_contained_directory(
        lexical_root, lexical_candidate.parent, create=False
    )
    flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
    try:
        try:
            descriptor = os.open(relative.name, flags, dir_fd=parent_descriptor)
        except OSError as error:
            raise RuntimeError(f"file is missing, linked, or inaccessible: {lexical_candidate}") from error
    finally:
        os.close(parent_descriptor)
    if not stat.S_ISREG(os.fstat(descriptor).st_mode):
        os.close(descriptor)
        raise RuntimeError(f"file is not regular: {lexical_candidate}")
    return lexical_candidate, descriptor


def require_contained_regular_file(root: Path, candidate: Path) -> Path:
    """Return a lexical child file after a no-follow component walk."""
    lexical_candidate, descriptor = _open_contained_regular_file(root, candidate)
    os.close(descriptor)
    return lexical_candidate


def read_contained_regular_bytes(root: Path, candidate: Path) -> tuple[bytes, int]:
    """Read one stable snapshot of a contained regular file and return bytes/mode."""
    lexical_candidate, descriptor = _open_contained_regular_file(root, candidate)
    try:
        before = os.fstat(descriptor)
        chunks: list[bytes] = []
        while chunk := os.read(descriptor, 1024 * 1024):
            chunks.append(chunk)
        after = os.fstat(descriptor)
    finally:
        os.close(descriptor)
    if ((before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns)
            != (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns)):
        raise RuntimeError(f"file changed while it was read: {lexical_candidate}")
    payload = b"".join(chunks)
    if len(payload) != after.st_size:
        raise RuntimeError(f"file size changed while it was read: {lexical_candidate}")
    return payload, after.st_mode & 0o777


def publish_immutable_bytes(
    allowed_root: Path, destination: Path, payload: bytes, mode: int = 0o444
) -> dict[str, Any]:
    """Create a regular file exactly once through a no-follow parent dirfd."""
    if mode < 0 or mode > 0o777:
        raise RuntimeError(f"invalid immutable-file mode: {oct(mode)}")
    lexical_root, lexical_destination, relative = _contained_relative(
        allowed_root, destination, "immutable destination"
    )
    if not relative.parts:
        raise RuntimeError("immutable destination may not replace its allowed root")
    _, parent_descriptor = _open_contained_directory(
        lexical_root, lexical_destination.parent, create=True
    )
    expected_sha256 = hashlib.sha256(payload).hexdigest()

    def verify_existing() -> dict[str, Any]:
        existing, existing_mode = read_contained_regular_bytes(lexical_root, lexical_destination)
        if (existing != payload or existing_mode != mode):
            raise RuntimeError(
                f"immutable destination already differs or is unsafe: {lexical_destination}"
            )
        return {
            "path": str(lexical_destination), "bytes": len(payload),
            "sha256": expected_sha256, "reused": True,
        }

    temp_name = f".{lexical_destination.name}.{os.getpid()}.{secrets.token_hex(12)}.tmp"
    descriptor = -1
    try:
        try:
            descriptor = os.open(
                temp_name,
                os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0),
                0o600,
                dir_fd=parent_descriptor,
            )
        except FileExistsError as error:
            raise RuntimeError("unrepeatable immutable temporary-name collision") from error
        with os.fdopen(descriptor, "wb") as handle:
            descriptor = -1
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
            os.fchmod(handle.fileno(), mode)
        try:
            os.link(
                temp_name,
                lexical_destination.name,
                src_dir_fd=parent_descriptor,
                dst_dir_fd=parent_descriptor,
                follow_symlinks=False,
            )
        except FileExistsError:
            return verify_existing()
        os.fsync(parent_descriptor)
    finally:
        if descriptor >= 0:
            os.close(descriptor)
        try:
            os.unlink(temp_name, dir_fd=parent_descriptor)
        except FileNotFoundError:
            pass
        os.close(parent_descriptor)
    return {
        "path": str(lexical_destination), "bytes": len(payload),
        "sha256": expected_sha256, "reused": False,
    }


def replace_contained_bytes(
    allowed_root: Path,
    destination: Path,
    payload: bytes,
    *,
    expected_existing_sha256: str | None,
    mode: int = 0o644,
) -> dict[str, Any]:
    """Atomically replace one mutable file; existing-target callers hold the shared writer lock."""
    if mode < 0 or mode > 0o777:
        raise RuntimeError(f"invalid replacement-file mode: {oct(mode)}")
    lexical_root, lexical_destination, relative = _contained_relative(
        allowed_root, destination, "replacement destination"
    )
    if not relative.parts:
        raise RuntimeError("replacement destination may not replace its allowed root")
    _, parent_descriptor = _open_contained_directory(
        lexical_root, lexical_destination.parent, create=True
    )
    temp_name = f".{lexical_destination.name}.{os.getpid()}.{secrets.token_hex(12)}.tmp"
    descriptor = -1
    original_identity: tuple[int, int, int, int, str] | None = None
    try:
        try:
            existing_descriptor = os.open(
                lexical_destination.name,
                os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0),
                dir_fd=parent_descriptor,
            )
        except FileNotFoundError:
            existing_descriptor = -1
        except OSError as error:
            raise RuntimeError(
                f"replacement destination is linked or inaccessible: {lexical_destination}"
            ) from error
        if existing_descriptor >= 0:
            try:
                existing_stat = os.fstat(existing_descriptor)
                if not stat.S_ISREG(existing_stat.st_mode):
                    raise RuntimeError(
                        f"replacement destination is not regular: {lexical_destination}"
                    )
                digest = hashlib.sha256()
                size = 0
                while chunk := os.read(existing_descriptor, 1024 * 1024):
                    digest.update(chunk)
                    size += len(chunk)
                after = os.fstat(existing_descriptor)
                if ((existing_stat.st_dev, existing_stat.st_ino, existing_stat.st_size,
                     existing_stat.st_mtime_ns)
                        != (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns)
                        or size != after.st_size):
                    raise RuntimeError(
                        f"replacement destination changed while read: {lexical_destination}"
                    )
                actual_existing = digest.hexdigest()
                original_identity = (
                    after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns,
                    actual_existing,
                )
            finally:
                os.close(existing_descriptor)
            if expected_existing_sha256 is None or actual_existing != expected_existing_sha256:
                raise RuntimeError(
                    f"replacement destination changed before publication: {lexical_destination}"
                )
        elif expected_existing_sha256 is not None:
            raise RuntimeError(
                f"expected replacement destination disappeared: {lexical_destination}"
            )
        descriptor = os.open(
            temp_name,
            os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0),
            0o600,
            dir_fd=parent_descriptor,
        )
        with os.fdopen(descriptor, "wb") as handle:
            descriptor = -1
            handle.write(payload)
            handle.flush()
            os.fchmod(handle.fileno(), mode)
            os.fsync(handle.fileno())
        try:
            current_descriptor = os.open(
                lexical_destination.name,
                os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0),
                dir_fd=parent_descriptor,
            )
        except FileNotFoundError:
            current_descriptor = -1
        except OSError as error:
            raise RuntimeError(
                f"replacement destination became linked or inaccessible: {lexical_destination}"
            ) from error
        if current_descriptor >= 0:
            try:
                current_stat = os.fstat(current_descriptor)
                current_digest = hashlib.sha256()
                current_size = 0
                while chunk := os.read(current_descriptor, 1024 * 1024):
                    current_digest.update(chunk)
                    current_size += len(chunk)
                current_after = os.fstat(current_descriptor)
            finally:
                os.close(current_descriptor)
            current_identity = (
                current_after.st_dev, current_after.st_ino, current_after.st_size,
                current_after.st_mtime_ns, current_digest.hexdigest(),
            )
            if (not stat.S_ISREG(current_after.st_mode)
                    or current_size != current_after.st_size
                    or (current_stat.st_dev, current_stat.st_ino, current_stat.st_size,
                        current_stat.st_mtime_ns)
                    != (current_after.st_dev, current_after.st_ino, current_after.st_size,
                        current_after.st_mtime_ns)
                    or current_identity != original_identity):
                raise RuntimeError(
                    f"replacement destination changed during publication: {lexical_destination}"
                )
        elif original_identity is not None:
            raise RuntimeError(
                f"replacement destination disappeared during publication: {lexical_destination}"
            )
        if original_identity is None:
            try:
                os.link(
                    temp_name,
                    lexical_destination.name,
                    src_dir_fd=parent_descriptor,
                    dst_dir_fd=parent_descriptor,
                    follow_symlinks=False,
                )
            except FileExistsError as error:
                raise RuntimeError(
                    f"replacement destination appeared during publication: {lexical_destination}"
                ) from error
        else:
            os.rename(
                temp_name,
                lexical_destination.name,
                src_dir_fd=parent_descriptor,
                dst_dir_fd=parent_descriptor,
            )
        os.fsync(parent_descriptor)
    finally:
        if descriptor >= 0:
            os.close(descriptor)
        try:
            os.unlink(temp_name, dir_fd=parent_descriptor)
        except FileNotFoundError:
            pass
        os.close(parent_descriptor)
    return {
        "path": str(lexical_destination),
        "bytes": len(payload),
        "sha256": hashlib.sha256(payload).hexdigest(),
    }


@contextmanager
def contained_exclusive_lock(root: Path, lock_path: Path):
    """Serialize cooperating writers with a no-follow lock file under a trusted root."""
    lexical_root, lexical_lock, relative = _contained_relative(root, lock_path, "lock file")
    if not relative.parts:
        raise RuntimeError("lock file may not name its allowed root")
    _, parent_descriptor = _open_contained_directory(
        lexical_root, lexical_lock.parent, create=True
    )
    try:
        try:
            descriptor = os.open(
                lexical_lock.name,
                os.O_RDWR | os.O_CREAT | getattr(os, "O_NOFOLLOW", 0),
                0o600,
                dir_fd=parent_descriptor,
            )
        except OSError as error:
            raise RuntimeError(f"lock file is linked or inaccessible: {lexical_lock}") from error
        try:
            if not stat.S_ISREG(os.fstat(descriptor).st_mode):
                raise RuntimeError(f"lock path is not a regular file: {lexical_lock}")
            try:
                fcntl.flock(descriptor, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError as error:
                raise RuntimeError(f"another evidence publisher holds the lock: {lexical_lock}") from error
            yield
        finally:
            fcntl.flock(descriptor, fcntl.LOCK_UN)
            os.close(descriptor)
    finally:
        os.close(parent_descriptor)


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
