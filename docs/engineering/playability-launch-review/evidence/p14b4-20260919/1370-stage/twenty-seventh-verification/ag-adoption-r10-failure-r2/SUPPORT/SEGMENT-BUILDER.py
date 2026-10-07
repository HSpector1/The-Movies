#!/usr/bin/env python3
"""Stage lossless, checked, GitHub-sized parts of the exact reviewed r2 archive.

This script writes only to an isolated scratch directory. Publication is separate.
"""

import hashlib
import json
import os
import stat
from pathlib import Path


SOURCE = Path(
    "/Users/zacheryspector/studio-scratch/1370-r10-clean-evidence-worktree/"
    "docs/engineering/playability-launch-review/evidence/p14b4-20260919/"
    "1370-stage/twenty-seventh-verification/ag-adoption-r10-failure-r2/EVIDENCE.tar.xz"
)
STAGE = Path("/Users/zacheryspector/studio-scratch/1370-r10-adoption-r2-segments")
EXPECTED_SIZE = 113_296_808
EXPECTED_SHA256 = "1d065ca4f946269a464c526a80e8d34b932cf56c06bf04fc812fc96590d567df"
CHUNK_SIZE = 48 * 1024 * 1024
PART_COUNT = (EXPECTED_SIZE + CHUNK_SIZE - 1) // CHUNK_SIZE
READ_SIZE = 1024 * 1024


def reject_symlink_components(path: Path) -> None:
    current = Path("/")
    for component in path.parts[1:]:
        current = current / component
        try:
            mode = current.lstat().st_mode
        except FileNotFoundError:
            if current == STAGE:
                break
            raise
        if stat.S_ISLNK(mode):
            raise RuntimeError(f"symlink component forbidden: {current}")


def write_new(path: Path, content: bytes) -> None:
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW
    fd = os.open(path, flags, 0o644)
    try:
        with os.fdopen(fd, "wb", closefd=False) as handle:
            handle.write(content)
            handle.flush()
            os.fsync(fd)
    finally:
        os.close(fd)


def main() -> None:
    reject_symlink_components(SOURCE)
    reject_symlink_components(STAGE)
    if STAGE.exists() or STAGE.is_symlink():
        raise RuntimeError(f"stage must not exist: {STAGE}")
    source_fd = os.open(SOURCE, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        before = os.fstat(source_fd)
        if not stat.S_ISREG(before.st_mode) or before.st_size != EXPECTED_SIZE:
            raise RuntimeError("source type/size mismatch")
        STAGE.mkdir(mode=0o755)
        parts = []
        archive_digest = hashlib.sha256()
        total = 0
        for ordinal in range(1, PART_COUNT + 1):
            name = f"EVIDENCE.tar.xz.part-{ordinal:04d}-of-{PART_COUNT:04d}"
            expected_part_size = min(CHUNK_SIZE, EXPECTED_SIZE - total)
            part_digest = hashlib.sha256()
            part_total = 0
            flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW
            part_fd = os.open(STAGE / name, flags, 0o644)
            try:
                while part_total < expected_part_size:
                    data = os.read(source_fd, min(READ_SIZE, expected_part_size - part_total))
                    if not data:
                        raise RuntimeError("source ended before expected size")
                    offset = 0
                    while offset < len(data):
                        offset += os.write(part_fd, data[offset:])
                    part_digest.update(data)
                    archive_digest.update(data)
                    part_total += len(data)
                os.fsync(part_fd)
            finally:
                os.close(part_fd)
            parts.append({"name": name, "bytes": part_total, "sha256": part_digest.hexdigest()})
            total += part_total
        if os.read(source_fd, 1):
            raise RuntimeError("source grew beyond expected size")
        after = os.fstat(source_fd)
        if (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) != (
            after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns
        ):
            raise RuntimeError("source changed during split")
        if total != EXPECTED_SIZE or archive_digest.hexdigest() != EXPECTED_SHA256:
            raise RuntimeError("source archive digest mismatch")
        os.lseek(source_fd, 0, os.SEEK_SET)
        source_reread = hashlib.sha256()
        while data := os.read(source_fd, READ_SIZE):
            source_reread.update(data)
        if source_reread.hexdigest() != EXPECTED_SHA256:
            raise RuntimeError("source archive reread mismatch")

        assembled = hashlib.sha256()
        assembled_bytes = 0
        for part in parts:
            part_hash = hashlib.sha256()
            part_bytes = 0
            part_fd = os.open(STAGE / part["name"], os.O_RDONLY | os.O_NOFOLLOW)
            try:
                if not stat.S_ISREG(os.fstat(part_fd).st_mode):
                    raise RuntimeError("nonregular part")
                while data := os.read(part_fd, READ_SIZE):
                    part_hash.update(data)
                    assembled.update(data)
                    part_bytes += len(data)
            finally:
                os.close(part_fd)
            if part_bytes != part["bytes"] or part_hash.hexdigest() != part["sha256"]:
                raise RuntimeError(f"part readback mismatch: {part['name']}")
            assembled_bytes += part_bytes
        if assembled_bytes != EXPECTED_SIZE or assembled.hexdigest() != EXPECTED_SHA256:
            raise RuntimeError("reassembled stream mismatch")

        manifest = {
            "schema": "movies.evidence.archive-segments.v1",
            "archive": "EVIDENCE.tar.xz",
            "archiveBytes": EXPECTED_SIZE,
            "archiveSha256": EXPECTED_SHA256,
            "chunkBytesMaximum": CHUNK_SIZE,
            "parts": parts,
            "sourceRereadSha256": source_reread.hexdigest(),
            "stagedReadbackSha256": assembled.hexdigest(),
        }
        manifest_bytes = (json.dumps(manifest, indent=2, sort_keys=True) + "\n").encode("utf-8")
        write_new(STAGE / "SEGMENTS.json", manifest_bytes)
        part_names = " ".join(p["name"] for p in parts)
        instructions = (
            "# Archive segment publication\n\n"
            "These ordered parts reconstruct the exact reviewed failed-capture archive. "
            "The original capture remains failed.\n\n"
            "Run from this directory after downloading all parts:\n\n"
            "```sh\n"
            f"cat {part_names} > EVIDENCE.reassembled.tar.xz\n"
            "shasum -a 256 EVIDENCE.reassembled.tar.xz\n"
            "```\n\n"
            f"Expected SHA-256: `{EXPECTED_SHA256}`; expected bytes: `{EXPECTED_SIZE}`. "
            "Check each part against `SEGMENTS.json` before using the archive.\n"
        ).encode("utf-8")
        write_new(STAGE / "SEGMENTS-README.md", instructions)
        print(json.dumps({
            "stage": str(STAGE),
            "archiveBytes": EXPECTED_SIZE,
            "archiveSha256": EXPECTED_SHA256,
            "parts": parts,
            "manifestSha256": hashlib.sha256(manifest_bytes).hexdigest(),
            "readmeSha256": hashlib.sha256(instructions).hexdigest(),
        }, sort_keys=True))
    finally:
        os.close(source_fd)


if __name__ == "__main__":
    main()
