#!/usr/bin/env python3
"""Tiny APFS clone/manifest fixtures only. Never materializes real H/deps."""

import os
import json
import sys
from unittest.mock import patch
import subprocess
import tempfile
import time
from pathlib import Path

from dependency_manifest import build
from materialize import (FLOOR, admit, clone_tree, inventory, normalized_digest,
                         require_distinct_inodes, require_equal,
                         bounded_process, helper_text)
from run import main as run_main


def refuse(fn, text):
    try:
        fn()
    except (RuntimeError, ValueError) as error:
        assert text in str(error), (text, error)
    else:
        raise AssertionError(f"expected refusal: {text}")


with tempfile.TemporaryDirectory(prefix="h-r4-materializer-r2-synthetic-", dir=Path(__file__).parent) as directory:
    scratch = Path(directory)
    src = scratch / "deps-fixture"
    src.mkdir()
    (src / "pkg").mkdir()
    data = src / "pkg" / "index.js"
    data.write_bytes(b"export default 1;\n")
    os.chmod(data, 0o640)
    subprocess.run(["/usr/bin/xattr", "-w", "com.movies.synthetic", "marker", str(data)], check=True)
    (src / "alias").symlink_to("pkg")
    before = inventory(src)
    rows = len(before["rows"])
    size = sum(r.get("size", 0) for r in before["rows"])
    manifest_parent = scratch / "manifest-parent"
    manifest_parent.mkdir()
    manifest = build(src, manifest_parent / "manifest.json", fixture=True, expected=(rows, size, 1))
    assert manifest["rowsSha256"] == normalized_digest(before["rows"])
    first = clone_tree(src, scratch / "control", scratch, "control", time.monotonic() + 20)
    second = clone_tree(src, scratch / "instrumented", scratch, "instrumented", time.monotonic() + 20)
    control = inventory(scratch / "control")
    instrumented = inventory(scratch / "instrumented")
    require_equal(before, control)
    require_equal(before, instrumented)
    require_distinct_inodes(before, control)
    require_distinct_inodes(before, instrumented)
    require_distinct_inodes(control, instrumented)
    assert first["argv"][:2] == ["/bin/cp", "-cRpP"]
    assert second["argv"][:2] == ["/bin/cp", "-cRpP"]
    assert os.readlink(scratch / "control" / "alias") == "pkg"
    refuse(lambda: clone_tree(src, scratch / "control", scratch, "repeat", time.monotonic() + 20),
           "one-shot target exists")
    (scratch / "control" / "pkg" / "index.js").write_bytes(b"changed\n")
    assert data.read_bytes() == b"export default 1;\n"
    refuse(lambda: require_equal(before, inventory(scratch / "control")), "divergence")
    protected = scratch / "protected"
    protected.mkdir()
    evidence = scratch / "evidence"
    evidence.mkdir()
    receipt = protected / "receipt.json"
    receipt.write_text("{}\n")
    result_parent = scratch / "result-parent"
    result_parent.mkdir()
    binding = scratch / "unfilled-binding.json"
    result = result_parent / "unfilled-result.json"
    payload = {"resultPath": str(result),
               "oneShotParent": str(scratch / "never-created"),
               "protectedH": str(protected),
               "productionDependencies": str(src),
               "evidenceCheckout": str(evidence),
               "immutableReceiptSha256": {str(receipt): "fixture"},
               "materializerSourceSha256": "wrong"}
    manifest_protected = protected / "manifest.json"
    protected_identity = (protected.stat().st_mtime_ns, protected.stat().st_ctime_ns)
    refuse(lambda: build(src, manifest_protected, fixture=True,
                         expected=(rows, size, 1), binding=payload),
           "manifest output parent overlaps protected input")
    assert not manifest_protected.exists()
    assert (protected.stat().st_mtime_ns, protected.stat().st_ctime_ns) == protected_identity
    for forbidden_parent in (src, evidence, scratch):
        target = forbidden_parent / "manifest.json"
        refuse(lambda target=target: build(src, target, fixture=True,
                       expected=(rows, size, 1), binding=payload),
               "manifest output parent overlaps protected input")
        assert not target.exists()
    manifest_symlink = scratch / "manifest-symlink"
    manifest_symlink.symlink_to(protected)
    refuse(lambda: build(src, manifest_symlink / "manifest.json", fixture=True,
                         expected=(rows, size, 1), binding=payload),
           "missing/noncanonical directory")
    assert not manifest_protected.exists()
    binding.write_text(json.dumps(payload))
    assert run_main(str(binding)) == 1
    assert json.loads(result.read_text())["decision"] == "STOP_MATERIALIZER_R4"
    assert not (scratch / "never-created").exists()
    original_entries = sorted(p.name for p in protected.iterdir())
    for protected_root in (protected, src, evidence):
        protected_stop = protected_root / "STOP.json"
        payload["resultPath"] = str(protected_stop)
        binding.write_text(json.dumps(payload))
        refuse(lambda: run_main(str(binding)), "result parent overlaps protected input")
        assert not protected_stop.exists()
    assert sorted(p.name for p in protected.iterdir()) == original_entries
    swapped = scratch / "swapped-result-parent"
    swapped.symlink_to(protected)
    payload["resultPath"] = str(swapped / "STOP.json")
    binding.write_text(json.dumps(payload))
    refuse(lambda: run_main(str(binding)), "missing/noncanonical directory")
    assert sorted(p.name for p in protected.iterdir()) == original_entries
    noisy_log = scratch / "noisy.stdout"
    noisy_err = scratch / "noisy.stderr"
    with noisy_log.open("wb") as out, noisy_err.open("wb") as err:
        noisy = ("import subprocess,sys,time; "
                 "subprocess.Popen([sys.executable,'-c','import time;time.sleep(30)']); "
                 "sys.stdout.write('x'*200000); sys.stdout.flush(); time.sleep(30)")
        start = time.monotonic()
        refuse(lambda: bounded_process([sys.executable, "-c", noisy], timeout=6,
                                        stdout_cap=1024, stderr_cap=1024,
                                        stdout_fd=out.fileno(), stderr_fd=err.fileno(),
                                        label="noisy-grandchild"), "STOP_LOG_CAP")
        assert time.monotonic() - start < 6
    assert noisy_log.stat().st_size <= 1024 and noisy_err.stat().st_size <= 1024
    refuse(lambda: helper_text([sys.executable, "-c", "print('x'*70000)"]),
           "STOP_LOG_CAP")
    with patch("materialize.available", return_value=FLOOR - 1):
        refuse(lambda: admit(scratch, "synthetic-floor"), "STOP_DISK_FLOOR")
    with patch("materialize.available", return_value=FLOOR + 128 * 1024 * 1024):
        refuse(lambda: admit(scratch, "synthetic-margin"), "STOP_DISK_MARGIN")
    acl_src = scratch / "acl-source"
    acl_src.mkdir()
    acl_file = acl_src / "acl.txt"
    acl_file.write_text("acl\n")
    subprocess.run(["/bin/chmod", "+a", "everyone allow read", str(acl_file)], check=True)
    acl_before = inventory(acl_src)
    clone_tree(acl_src, scratch / "acl-copy", scratch, "acl-copy", time.monotonic() + 20)
    refuse(lambda: require_equal(acl_before, inventory(scratch / "acl-copy")), "divergence")

print("PASS: tiny clone/readback; protected result and manifest placement; streaming caps, noisy-grandchild cleanup, disk STOPs, ACL loss refusal")
