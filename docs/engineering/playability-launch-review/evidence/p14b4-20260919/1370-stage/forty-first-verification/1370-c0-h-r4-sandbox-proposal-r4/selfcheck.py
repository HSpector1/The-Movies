#!/usr/bin/env python3
"""Disposable stand-ins only; no protected game path is a write target."""

import json
import tempfile
from pathlib import Path

from canary import probe
from profile import build, freeze


def refuse(fn, label):
    try:
        fn()
    except (ValueError, RuntimeError) as error:
        assert label in str(error), (label, error)
    else:
        raise AssertionError(f"expected refusal: {label}")


with tempfile.TemporaryDirectory(prefix="h-r4-sandbox-synthetic-", dir=Path(__file__).parent) as directory:
    root = Path(directory)
    experiment = root / "experiment"
    experiment.mkdir()
    canary = experiment / "denied-canary"
    canary.mkdir()
    output = experiment / "probe-output"
    output.mkdir()
    source = experiment / "control-source"
    source.mkdir()
    dependencies = experiment / "control-dependencies"
    dependencies.mkdir()
    temp = experiment / "temp"
    temp.mkdir()
    protected = root / "protected-stand-in"
    protected.mkdir()
    (protected / "sentinel.txt").write_text("untouched\n")
    profiles = root / "profiles"
    profiles.mkdir()
    profile_binding = {"mode": "synthetic", "experimentParent": str(experiment),
                       "deniedCanary": str(canary),
                       "allowedDirectories": [str(output), str(source), str(dependencies), str(temp)],
                       "protectedDirectories": [str(protected)]}
    rendered = build(profile_binding)
    assert "(deny default)" in rendered["text"]
    assert str(root) not in rendered["allowed"]
    refuse(lambda: build({**profile_binding, "allowedDirectories": [str(experiment)]}),
           "allow outside")
    refuse(lambda: build({**profile_binding, "allowedDirectories": [str(canary)]}),
           "allow overlaps canary")
    refuse(lambda: build({**profile_binding, "allowedDirectories": [str(protected)]}),
           "allow outside")
    refuse(lambda: freeze(profile_binding, protected / "must-not-appear.sb"),
           "profile parent overlaps protected")
    assert not (protected / "must-not-appear.sb").exists()
    alias = root / "profile-alias"
    alias.symlink_to(protected, target_is_directory=True)
    try:
        freeze(profile_binding, alias / "must-not-appear.sb")
    except (ValueError, RuntimeError, OSError):
        pass
    else:
        raise AssertionError("symlink profile parent accepted")
    assert not (protected / "must-not-appear.sb").exists()
    profile_path = profiles / "profile.sb"
    frozen = freeze(profile_binding, profile_path)
    assert frozen == rendered
    spec = {"profileBinding": profile_binding, "profile": str(profile_path),
            "profileSha256": frozen["sha256"], "deniedCanary": str(canary),
            "canaryName": "must-not-appear.txt", "allowedProbeOutput": str(output),
            "cwd": str(experiment), "immutableReceiptSha256": {},
            "environment": {"HOME": str(temp), "TMPDIR": str(temp),
                            "VITEST_CACHE_DIR": str(temp), "PREIMAGE_OUTPUT": str(output)},
            "sandboxPrefix": ["/usr/bin/sandbox-exec", "-f", str(profile_path)]}
    spec_path = root / "spec.json"
    spec_path.write_text(json.dumps(spec, sort_keys=True))
    result = probe(str(spec_path), spec)
    assert result["status"] == "SYNTHETIC_CANARY_OBSERVED_BOUNDARY_REVIEW_PENDING"
    assert not (canary / spec["canaryName"]).exists()
    assert (protected / "sentinel.txt").read_text() == "untouched\n"

print("PASS: synthetic profile overlap refusals and sandbox descendant denial/allowed write")
