#!/usr/bin/env python3
"""Tiny no-network checks. No historical checkout or dependency copy."""

import json
import hashlib
import os
from pathlib import Path
import subprocess
import tempfile
from unittest.mock import patch
from types import SimpleNamespace

from materialize import (Stop, assert_no_protected_writable_fds, file_sha, parse_tree, physical_source_paths,
                         protected_snapshot, require, space_guard, validate_binding)
from record import lane, update_free_minimum, validated_spec
from supervise import finalize_bound, watch, write_once


def expects_stop(fn):
    try:
        fn()
    except (Stop, KeyError):
        return
    raise AssertionError("unsafe fixture admitted")


def test_cow_tiny():
    with tempfile.TemporaryDirectory(prefix="1370-r2-cow-") as name:
        root = Path(name)
        src, dest = root / "source", root / "dest"
        src.mkdir()
        (src / "file").write_bytes(b"a")
        (src / "link").symlink_to("file")
        subprocess.run(["/bin/cp", "-c", "-R", "-P", "-p", str(src), str(dest)],
                       check=True, capture_output=True, timeout=10)
        require((dest / "link").is_symlink() and os.readlink(dest / "link") == "file",
                "internal relative link changed")
        require((src / "file").stat().st_ino != (dest / "file").stat().st_ino,
                "clone inode shared")
        before = file_sha(src / "file")
        (dest / "file").write_bytes(b"b")
        require(file_sha(src / "file") == before, "clone mutation reached source")


def test_physical_enumeration():
    with tempfile.TemporaryDirectory(prefix="1370-r2-paths-") as name:
        root = Path(name)
        (root / ".git").mkdir()
        (root / "src").mkdir()
        (root / "src/a.ts").write_bytes(b"ok")
        actual = physical_source_paths(root)
        require(set(actual) == {"src/a.ts"}, "wrong physical roster")
        (root / "src/extra.ts").write_bytes(b"extra")
        require("src/extra.ts" in physical_source_paths(root), "extra path hidden")
        (root / "src/extra.ts").unlink()
        (root / "src/link").symlink_to("a.ts")
        require(physical_source_paths(root)["src/link"]["type"] == "symlink",
                "symlink hidden")


def test_protected_snapshot():
    with tempfile.TemporaryDirectory(prefix="1370-r2-protect-") as name:
        root = Path(name)
        (root / "refs").mkdir()
        path = root / "refs/main"
        path.write_bytes(b"a")
        before = protected_snapshot(root)
        path.write_bytes(b"b")
        require(before != protected_snapshot(root), "protected byte mutation hidden")


def test_refusal():
    expects_stop(lambda: validate_binding({"status": "UNFILLED_UNRUN",
                                           "executionAuthorization": False}))
    expects_stop(lambda: parse_tree(b"100644 blob deadbeef\tsrc/a.ts\0"))
    with tempfile.TemporaryDirectory(prefix="1370-r2-space-") as name:
        expects_stop(lambda: space_guard(Path(name), 1 << 60))
    with tempfile.TemporaryDirectory(prefix="1370-r2-spec-") as name:
        path = Path(name) / "binding.json"
        path.write_text(json.dumps({"status": "UNFILLED_UNRUN"}))
        expects_stop(lambda: validated_spec(path))


def test_writable_fd_red():
    binding = {"productionRoot": "/protected/production",
               "commonGitRoot": "/protected/common.git", "lsofPath": "/usr/sbin/lsof"}
    with patch("materialize.command", return_value=
               b"p91\0\n f3u\0n/protected/production/file\0".replace(b" f", b"f")):
        expects_stop(lambda: assert_no_protected_writable_fds(binding))
    with patch("materialize.command", return_value=
               b"p91\0\n f3r\0n/protected/production/file\0".replace(b" f", b"f")):
        assert_no_protected_writable_fds(binding)


def test_outer_watchdog_blocked_preflight():
    read_fd, write_fd = os.pipe()
    child = os.fork()
    if child == 0:
        os.close(read_fd)
        os.setsid()
        import time
        time.sleep(5)
        os._exit(0)
    os.close(write_fd)
    try:
        import time
        result = watch(child, read_fd, time.monotonic(), limit=0.08)
        require(result["timedOut"] and result["workerExit"] is None,
                "blocked preflight escaped outer clock")
        os.kill(child, 9)
        os.waitpid(child, 0)
    finally:
        os.close(read_fd)


def test_outer_watchdog_blocked_fork_ready():
    read_fd, write_fd = os.pipe()
    worker = os.fork()
    if worker == 0:
        os.close(read_fd)
        os.setsid()
        nested = os.fork()
        if nested == 0:
            os.setsid()
            import time
            time.sleep(5)
            os._exit(0)
        os.write(write_fd, f"{nested}\n".encode())
        import time
        time.sleep(5)
        os._exit(0)
    os.close(write_fd)
    try:
        import time
        result = watch(worker, read_fd, time.monotonic(), limit=0.08)
        require(result["timedOut"] and result["childGroup"] is not None,
                "blocked fork readiness escaped outer clock")
        os.kill(worker, 9)
        os.kill(result["childGroup"], 9)
        os.waitpid(worker, 0)
    finally:
        os.close(read_fd)


def test_after_deadline_exit_and_free_receipt():
    read_fd, write_fd = os.pipe()
    worker = os.fork()
    if worker == 0:
        os.close(read_fd)
        os.setsid()
        import time
        time.sleep(0.07)
        os._exit(0)
    os.close(write_fd)
    try:
        import time
        result = watch(worker, read_fd, time.monotonic(), limit=0.02)
        require(result["timedOut"], "post-deadline child could pass")
        os.kill(worker, 9)
        os.waitpid(worker, 0)
    finally:
        os.close(read_fd)
    receipt = {"freeMinimum": None}
    update_free_minimum(receipt, 4_000_000_000)
    update_free_minimum(receipt, 3_100_000_000)
    require(receipt["freeMinimum"] == 3_100_000_000,
            "breach free minimum not durable in STOP receipt")


def test_actual_free_stop_receipt():
    from materialize import FLOOR
    with tempfile.TemporaryDirectory(prefix="1370-r3-free-receipt-") as name:
        root = Path(name)
        spec_path = root / "spec.json"
        spec_path.write_text("{}")
        spec = {"outputRoot": str(root / "output"), "scratchRoot": str(root / "scratch"),
                "recorderLockPath": str(root / "lane.lock")}
        reads = iter([FLOOR + 1024, FLOOR + 512, FLOOR - 1])
        with patch.dict(os.environ, {"SPARSE_1370_SUPERVISOR_FD": "1"}), \
             patch("record.validated_spec", return_value=spec), \
             patch("record.fork_ready", return_value=999999), \
             patch("record.terminate"), patch("record.still_alive", return_value=False), \
             patch("record.shutil.disk_usage",
                   side_effect=lambda _: SimpleNamespace(free=next(reads))):
            result = lane(spec_path)
        require(result["status"] == "STOP" and
                result["freeMinimum"] == FLOOR - 1 and
                "space floor" in result["stopReason"],
                "free-space STOP status wrong")
        durable = json.loads((root / "output/RESULT.json").read_text())
        require(durable["freeMinimum"] == FLOOR - 1 and
                durable["status"] == "STOP" and durable["groupClear"] is True,
                "free-space breach missing in durable STOP receipt")


def bound_finalization_fixture(root):
    spec = root / "spec.json"
    spec.write_bytes(b'{"original":true}')
    digest = hashlib.sha256(spec.read_bytes()).hexdigest()
    output, scratch, lock = root / "output", root / "scratch", root / "lock"
    output.mkdir()
    scratch.mkdir()
    (scratch / "owned.txt").write_bytes(b"owned")
    neighbor = root / "neighbor"
    neighbor.mkdir()
    (neighbor / "keep.txt").write_bytes(b"keep")
    result = {"status": "MATERIALIZED_UNREVIEWED_UNRUN",
              "groupClear": True, "scratchRoot": str(scratch),
              "specSha256": digest, "freeMinimum": 4_000_000_000}
    (output / "RESULT.json").write_text(json.dumps(result))
    bound = ({}, output, scratch, lock, digest)
    observed = {"timedOut": False, "workerExit": 0, "childGroup": 999998}
    return spec, bound, observed, neighbor


def test_late_final_fsync_stop():
    with tempfile.TemporaryDirectory(prefix="1370-r4-final-late-") as name:
        spec, bound, observed, neighbor = bound_finalization_fixture(Path(name))
        tick = [0.0]
        def writer(path, payload):
            write_once(path, payload)
            if path.name == "SUPERVISOR-PREPARED.json":
                tick[0] = 1.01
        with patch("supervise.alive_group", return_value=False):
            result = finalize_bound(spec, bound, observed, 999999, 0.0, 1.0,
                                    clock=lambda: tick[0], writer=writer)
        require(result["status"] == "STOP" and result["timedOut"] is True and
                not (bound[1] / "SUPERVISOR-PREPARED.json").is_symlink() and
                json.loads((bound[1] / "SUPERVISOR.json").read_text())["status"] == "STOP" and
                not bound[2].exists() and (neighbor / "keep.txt").is_file(),
                "late prepared fsync claimed success or cleaned a neighbor")


def test_postflight_binding_drift_stop():
    for mutation in ("changed", "unreadable"):
        with tempfile.TemporaryDirectory(prefix="1370-r4-binding-stop-") as name:
            spec, bound, observed, neighbor = bound_finalization_fixture(Path(name))
            if mutation == "changed":
                spec.write_bytes(b'{"changed":true}')
            else:
                spec.unlink()
            with patch("supervise.alive_group", return_value=False):
                result = finalize_bound(spec, bound, observed, 999999, 0.0, 1.0,
                                        clock=lambda: 0.1)
            durable = json.loads((bound[1] / "SUPERVISOR.json").read_text())
            require(result["status"] == "STOP" and durable["status"] == "STOP" and
                    durable["specSha256"] == bound[4] and
                    not bound[2].exists() and (neighbor / "keep.txt").is_file(),
                    "postflight binding drift lost durable bound STOP/cleanup")


if __name__ == "__main__":
    test_cow_tiny()
    test_physical_enumeration()
    test_protected_snapshot()
    test_refusal()
    test_writable_fd_red()
    test_outer_watchdog_blocked_preflight()
    test_outer_watchdog_blocked_fork_ready()
    test_after_deadline_exit_and_free_receipt()
    test_actual_free_stop_receipt()
    test_late_final_fsync_stop()
    test_postflight_binding_drift_stop()
    print("PASS tiny COW, guards, watchdog, free STOP, late finalization, binding drift STOP")
