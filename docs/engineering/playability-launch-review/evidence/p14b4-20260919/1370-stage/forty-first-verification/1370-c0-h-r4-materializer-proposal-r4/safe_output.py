#!/usr/bin/env python3
"""Fail-closed result/experiment placement before every r3 write."""

import os
import stat
from contextlib import contextmanager
from pathlib import Path

SCRATCH = Path("/Users/zacheryspector/studio-scratch")
PRODUCTION = Path("/Users/zacheryspector/The-Movies-headless-program")


def canonical_dir(value):
    path = Path(value)
    if not path.is_absolute() or not path.exists() or path.is_symlink():
        raise RuntimeError(f"missing/noncanonical directory: {path}")
    if path.resolve(strict=True) != path or not stat.S_ISDIR(path.lstat().st_mode):
        raise RuntimeError(f"ambiguous directory ancestry: {path}")
    return path


def overlaps(a, b):
    return a == b or a in b.parents or b in a.parents


def protected_paths(binding):
    paths = [canonical_dir(PRODUCTION), canonical_dir(binding["protectedH"]),
             canonical_dir(binding["productionDependencies"])]
    if binding.get("evidenceCheckout") is not None:
        paths.append(canonical_dir(binding["evidenceCheckout"]))
    receipts = binding["immutableReceiptSha256"]
    if not isinstance(receipts, dict) or not receipts:
        raise RuntimeError("missing protected receipt set")
    for name in receipts:
        receipt = Path(name)
        if not receipt.is_absolute() or not receipt.is_file() or receipt.is_symlink():
            raise RuntimeError(f"invalid protected receipt: {receipt}")
        paths.append(canonical_dir(receipt.parent))
    return paths


def validate_experiment(binding):
    target = Path(binding["oneShotParent"])
    if not target.is_absolute() or target.exists() or target.is_symlink():
        raise RuntimeError("experiment parent must be absolute and absent")
    parent = canonical_dir(target.parent)
    if SCRATCH not in parent.parents and parent != SCRATCH:
        raise RuntimeError("experiment outside studio scratch")
    if any(overlaps(target, protected) for protected in protected_paths(binding)):
        raise RuntimeError("experiment overlaps protected input")
    return target


@contextmanager
def held_output(binding):
    """Hold the result parent FD; unsafe bindings receive no STOP file."""
    target = Path(binding["resultPath"])
    if not target.is_absolute() or target.exists() or target.is_symlink():
        raise RuntimeError("result target must be absolute and absent")
    parent = canonical_dir(target.parent)
    if SCRATCH not in parent.parents:
        raise RuntimeError("result parent must be a distinct studio-scratch child")
    experiment = Path(binding["oneShotParent"])
    if any(overlaps(parent, protected) for protected in protected_paths(binding)):
        raise RuntimeError("result parent overlaps protected input")
    if overlaps(parent, experiment):
        raise RuntimeError("result parent overlaps experiment")
    if target.name in ("", ".", ".."):
        raise RuntimeError("unsafe result basename")
    fd = os.open(parent, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    identity = (os.fstat(fd).st_dev, os.fstat(fd).st_ino, os.fstat(fd).st_mode)
    try:
        actual = parent.lstat()
        if (actual.st_dev, actual.st_ino, actual.st_mode) != identity:
            raise RuntimeError("result parent changed before write")
        yield fd, target.name
        actual = parent.lstat()
        current = os.fstat(fd)
        if ((actual.st_dev, actual.st_ino, actual.st_mode) != identity or
                (current.st_dev, current.st_ino, current.st_mode) != identity):
            raise RuntimeError("result parent changed after write")
    finally:
        os.close(fd)
