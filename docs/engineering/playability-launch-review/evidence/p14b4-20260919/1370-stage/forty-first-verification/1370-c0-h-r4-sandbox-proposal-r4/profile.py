#!/usr/bin/env python3
"""Generate a narrow macOS sandbox profile. Source proposal; no real launch."""

import hashlib
import json
import os
import signal
import stat
from pathlib import Path

SCRATCH = Path('/Users/zacheryspector/studio-scratch')
DIR_FLAGS = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW


def sha(data):
    return hashlib.sha256(data).hexdigest()


def canonical(path):
    item = Path(path)
    if not item.is_absolute() or not item.exists():
        raise ValueError(f"missing absolute path: {item}")
    if item.resolve(strict=True) != item:
        raise ValueError(f"symlink/ambiguous ancestor: {item}")
    if not stat.S_ISDIR(item.lstat().st_mode):
        raise ValueError(f"not a real directory: {item}")
    return item


def contains(parent, child):
    return parent == child or parent in child.parents


def scheme(path):
    # Scheme strings accept JSON-compatible quote and backslash escapes;
    # paths with control characters are refused instead of normalized.
    value = str(path)
    if any(ord(c) < 32 for c in value):
        raise ValueError("control character in profile path")
    return json.dumps(value, ensure_ascii=True)


def build(spec):
    if spec.get("mode") not in ("real", "synthetic"):
        raise ValueError("profile mode must be explicit")
    experiment = canonical(spec["experimentParent"])
    canary = canonical(spec["deniedCanary"])
    allowed = [canonical(value) for value in spec["allowedDirectories"]]
    protected = [canonical(value) for value in spec["protectedDirectories"]]
    if len(set(protected)) != len(protected):
        raise ValueError("duplicate profile path")
    receipts = spec.get("protectedReceiptPaths")
    if spec["mode"] == "real" and (not isinstance(receipts, list) or not receipts):
        raise ValueError("real profile requires protected receipt paths")
    if receipts is not None:
        if not isinstance(receipts, list):
            raise ValueError("protected receipt paths must be a list")
        for value in receipts:
            receipt = Path(value)
            if not receipt.is_absolute() or receipt.is_symlink() or not receipt.is_file() or \
               receipt.resolve(strict=True) != receipt:
                raise ValueError("noncanonical protected receipt")
            protected.append(canonical(receipt.parent))
    protected = sorted(set(protected), key=str)
    if spec["mode"] == "real":
        required = {
            canonical("/Users/zacheryspector/The-Movies-headless-program"),
            canonical("/Users/zacheryspector/studio-scratch/1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1"),
        }
        if not required.issubset(set(protected)):
            raise ValueError("real profile missing production or protected H deny")
        evidence = spec.get("evidenceCheckout")
        if evidence is not None and canonical(evidence) not in protected:
            raise ValueError("real profile missing evidence checkout deny")
    if len(set(allowed)) != len(allowed):
        raise ValueError("duplicate profile path")
    if not contains(experiment, canary):
        raise ValueError("canary must be under experiment parent")
    for item in allowed:
        if not contains(experiment, item) or item == experiment:
            raise ValueError("allow outside exact experiment child")
        if contains(item, canary) or contains(canary, item):
            raise ValueError("allow overlaps canary")
        if any(contains(item, p) or contains(p, item) for p in protected):
            raise ValueError("allow overlaps protected path")
    if any(contains(experiment, p) or contains(p, experiment) for p in protected):
        raise ValueError("experiment overlaps protected path")
    if any(item in (Path.home(), Path("/Users"), Path("/tmp"), Path("/private/tmp"))
           for item in allowed):
        raise ValueError("broad allow")
    # Default deny is the operative write boundary. Explicit deny lines make
    # protected sources and the canary visible to exact reviewers.
    lines = ["(version 1)", "(deny default)", "(allow process*)",
             "(allow file-read*)", "(allow mach-lookup)"]
    for path in sorted(protected + [canary], key=str):
        lines.append(f"(deny file-write* (subpath {scheme(path)}))")
    for path in sorted(allowed, key=str):
        lines.append(f"(allow file-write* (subpath {scheme(path)}))")
    text = "\n".join(lines) + "\n"
    return {"text": text, "sha256": sha(text.encode()),
            "protected": [str(x) for x in protected],
            "allowed": [str(x) for x in allowed], "canary": str(canary)}


def held_chain(value):
    path = Path(value)
    if not path.is_absolute() or str(path) != os.path.normpath(str(path)):
        raise ValueError("noncanonical directory path")
    fd = os.open('/', DIR_FLAGS)
    identities = []
    try:
        root = os.fstat(fd); identities.append((root.st_dev, root.st_ino))
        for component in path.parts[1:]:
            if component in ("", ".", ".."):
                raise ValueError("ambiguous directory component")
            child = os.open(component, DIR_FLAGS, dir_fd=fd)
            os.close(fd); fd = child
            st = os.fstat(fd)
            identities.append((st.st_dev, st.st_ino))
        return fd, identities
    except Exception:
        os.close(fd)
        raise


def recheck(path, held_fd, identity):
    st = os.fstat(held_fd)
    if (st.st_dev, st.st_ino) != identity:
        raise ValueError("held profile parent changed")
    fd, chain = held_chain(path)
    try:
        if chain[-1] != identity:
            raise ValueError("profile parent pathname changed")
    finally:
        os.close(fd)


def freeze(spec, destination):
    result = build(spec)
    output = Path(destination)
    if not output.is_absolute() or output.exists() or output.is_symlink():
        raise ValueError("profile target must be absolute and absent")
    if output.name in ("", ".", "..") or str(output) != os.path.normpath(str(output)):
        raise ValueError("unsafe profile basename")
    parent_fd, parent_chain = held_chain(output.parent)
    try:
        scratch_fd, scratch_chain = held_chain(SCRATCH)
        try:
            scratch_identity = scratch_chain[-1]
        finally:
            os.close(scratch_fd)
        if scratch_identity not in parent_chain or parent_chain[-1] == scratch_identity:
            raise ValueError("profile parent outside distinct studio scratch child")
        protected = [spec["experimentParent"], *result["protected"], *result["allowed"], result["canary"]]
        for value in protected:
            guard_fd, guard_chain = held_chain(value)
            try:
                if guard_chain[-1] in parent_chain or parent_chain[-1] in guard_chain:
                    raise ValueError("profile parent overlaps protected or experiment input")
            finally:
                os.close(guard_fd)
        identity = parent_chain[-1]
        recheck(output.parent, parent_fd, identity)
        if os.environ.get("H_BOOTSTRAP_TEST_STOP") == "1":
            if spec["mode"] != "synthetic":
                raise ValueError("test stop forbidden for real binding")
            print("READY_BEFORE_OPEN", flush=True)
            os.kill(os.getpid(), signal.SIGSTOP)
        descriptor = os.open(output.name, os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW,
                             0o600, dir_fd=parent_fd)
        try:
            payload = result["text"].encode()
            view = memoryview(payload)
            while view:
                view = view[os.write(descriptor, view):]
            os.fsync(descriptor)
        finally:
            os.close(descriptor)
        os.fsync(parent_fd)
        recheck(output.parent, parent_fd, identity)
        read_fd = os.open(output.name, os.O_RDONLY | os.O_NOFOLLOW, dir_fd=parent_fd)
        try:
            chunks = []
            remaining = len(payload) + 1
            while remaining > 0:
                chunk = os.read(read_fd, remaining)
                if not chunk:
                    break
                chunks.append(chunk)
                remaining -= len(chunk)
            if b"".join(chunks) != payload:
                raise ValueError("profile readback differs")
        finally:
            os.close(read_fd)
    finally:
        os.close(parent_fd)
    return result
