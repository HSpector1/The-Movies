#!/usr/bin/env python3
"""One-shot receipt wrapper. No real binding has been accepted or filled."""

import hashlib
import json
import os
import sys
from pathlib import Path

from materialize import materialize
from safe_output import held_output, validate_experiment

SCRATCH_ROOT = Path("/Users/zacheryspector/studio-scratch")


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def write_once(dirfd, basename, payload):
    fd = os.open(basename, os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW,
                 0o600, dir_fd=dirfd)
    try:
        data = (json.dumps(payload, sort_keys=True, separators=(",", ":")) + "\n").encode()
        view = memoryview(data)
        while view:
            view = view[os.write(fd, view):]
        os.fsync(fd)
    finally:
        os.close(fd)


def main(binding_path):
    path = Path(binding_path)
    if not path.is_absolute() or path.is_symlink():
        raise RuntimeError("binding path must be absolute and non-symlink")
    raw = path.read_bytes()
    binding = json.loads(raw)
    validate_experiment(binding)
    with held_output(binding) as (result_parent_fd, result_basename):
        try:
            for filename, key in (("materialize.py", "materializerSourceSha256"),
                                  ("dependency_manifest.py", "dependencyManifestBuilderSha256"),
                                  ("native_metadata.py", "nativeMetadataSourceSha256"),
                                  ("safe_output.py", "outputGuardSourceSha256"),
                                  ("run.py", "runnerSourceSha256")):
                if sha(Path(__file__).parent / filename) != binding[key]:
                    raise RuntimeError(f"source SHA mismatch: {filename}")
            result = materialize(binding)
            result["bindingSha256"] = hashlib.sha256(raw).hexdigest()
        except BaseException as error:
            result = {"schema": "1370-c0-h-r4-materializer-result-r4",
                      "decision": "STOP_MATERIALIZER_R4",
                      "error": repr(error),
                      "bindingSha256": hashlib.sha256(raw).hexdigest(),
                      "partialScratchPath": binding.get("oneShotParent"),
                      "claimLimit": "No H source, type, collection, or causal acceptance"}
            write_once(result_parent_fd, result_basename, result)
            return 1
        result["decision"] = "MATERIALIZED_PENDING_INDEPENDENT_OBSERVED_REVIEW"
        write_once(result_parent_fd, result_basename, result)
        return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: run.py ABSOLUTE_BINDING.json")
    raise SystemExit(main(sys.argv[1]))
