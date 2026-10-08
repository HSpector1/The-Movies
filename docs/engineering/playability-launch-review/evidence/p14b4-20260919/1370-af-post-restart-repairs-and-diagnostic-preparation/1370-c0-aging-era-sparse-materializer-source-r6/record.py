#!/usr/bin/env python3
"""Source-only proposal: exclusive sparse materialization lane recorder.

Requires a separately reviewed exact binding. Never run this package as-is.
"""

import hashlib
import json
import os
from pathlib import Path
import shutil
import signal
import select
import sys
import time

from materialize import FLOOR, Stop, canonical_json, file_sha, require, safe_parent

POLL_SECONDS = 0.25
MAX_WHOLE_SECONDS = 930


def update_free_minimum(status, free):
    previous = status.get("freeMinimum")
    status["freeMinimum"] = free if previous is None else min(previous, free)
    return status["freeMinimum"]


def write_once(path, payload):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, "wb") as stream:
        stream.write(payload)
        stream.flush()
        os.fsync(stream.fileno())


def still_alive(group):
    try:
        os.killpg(group, 0)
        return True
    except ProcessLookupError:
        return False
    except PermissionError:
        # The group may exist but be inaccessible in this launch context.
        # Unknown clearance must be a STOP, never a successful cleanup claim.
        return True


def terminate(group, child_pid):
    if still_alive(group):
        try:
            os.killpg(group, signal.SIGTERM)
        except (ProcessLookupError, PermissionError):
            pass
        time.sleep(0.25)
    if still_alive(group):
        try:
            os.killpg(group, signal.SIGKILL)
        except (ProcessLookupError, PermissionError):
            pass
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline:
        try:
            waited, _ = os.waitpid(child_pid, os.WNOHANG)
        except ChildProcessError:
            break
        if waited == child_pid:
            break
        time.sleep(0.05)
    else:
        raise Stop("owned child survived KILL")
    require(not still_alive(group), "owned group survived KILL")


def fork_ready(spec, spec_path, stdout_fd, stderr_fd):
    """Parent owns PID before child can exec; child waits for GO after setsid."""
    ack_read, ack_write = os.pipe()
    go_read, go_write = os.pipe()
    child_pid = os.fork()
    if child_pid == 0:
        try:
            os.close(ack_read)
            os.close(go_write)
            os.setsid()
            os.write(ack_write, b"R")
            os.close(ack_write)
            if os.read(go_read, 1) != b"G":
                os._exit(125)
            os.close(go_read)
            os.dup2(stdout_fd, 1)
            os.dup2(stderr_fd, 2)
            os.chdir(str(Path(__file__).parent))
            os.execv(sys.executable, [sys.executable, spec["materializerPath"],
                                      str(spec_path)])
        except BaseException:
            os._exit(126)
    os.close(ack_write)
    os.close(go_read)
    try:
        report_fd = int(os.environ["SPARSE_1370_SUPERVISOR_FD"])
        os.write(report_fd, f"{child_pid}\n".encode("ascii"))
        readable, _, _ = select.select([ack_read], [], [], 5)
        require(readable and os.read(ack_read, 1) == b"R", "child group readiness absent")
        require(os.getpgid(child_pid) == child_pid, "child did not own new group")
        os.write(go_write, b"G")
        return child_pid
    except BaseException:
        try:
            os.kill(child_pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        try:
            os.waitpid(child_pid, 0)
        except ChildProcessError:
            pass
        raise
    finally:
        os.close(ack_read)
        os.close(go_write)


def validated_spec(path):
    require(path.is_absolute() and path.is_file() and not path.is_symlink(),
            "exact spec absent")
    try:
        spec = json.loads(path.read_text(encoding="utf-8"))
    except (ValueError, UnicodeError) as exc:
        raise Stop("invalid exact spec") from exc
    require(isinstance(spec, dict) and spec.get("status") == "REVIEWED_FILLED_UNRUN" and
            spec.get("executionAuthorization") is True, "unreviewed exact spec")
    for key in ("outputParent", "outputRoot", "scratchParent", "scratchRoot",
                "recorderLockPath"):
        require(isinstance(spec.get(key), str) and Path(spec[key]).is_absolute(),
                "missing absolute " + key)
    require(spec.get("noExternalSameUidRenamer") is True,
            "no-renamer operational scope missing")
    require(Path(spec["outputRoot"]).parent == Path(spec["outputParent"]),
            "output root not one direct child")
    require(Path(spec["recorderLockPath"]).parent == Path(spec["outputParent"]),
            "exclusive lock parent wrong")
    require(Path(spec["scratchRoot"]).parent == Path(spec["scratchParent"]),
            "scratch target parent wrong")
    for key in ("materializerPath", "materializerSha256", "recorderPath",
                "recorderSha256", "supervisorPath", "supervisorSha256", "sourceSha"):
        require(isinstance(spec.get(key), str) and bool(spec[key]),
                "missing exact " + key)
    require(Path(spec["materializerPath"]) == Path(__file__).parent / "materialize.py" and
            file_sha(Path(spec["materializerPath"])) == spec["materializerSha256"],
            "materializer source drift")
    require(Path(spec["recorderPath"]) == Path(__file__) and
            file_sha(Path(__file__)) == spec["recorderSha256"],
            "recorder source drift")
    supervisor = Path(__file__).parent / "supervise.py"
    require(Path(spec["supervisorPath"]) == supervisor and
            file_sha(supervisor) == spec["supervisorSha256"],
            "outer supervisor source drift")
    safe_parent(Path(spec["outputRoot"]), Path(spec["outputParent"]))
    safe_parent(Path(spec["scratchRoot"]), Path(spec["scratchParent"]))
    require(shutil.disk_usage(spec["scratchParent"]).free >= FLOOR + 64 * 1024**2,
            "source phase projection crosses floor")
    return spec


def lane(spec_path):
    start = time.monotonic()
    require(os.environ.get("SPARSE_1370_SUPERVISOR_FD", "").isdigit(),
            "independent outer supervisor required")
    spec = validated_spec(spec_path)
    root = Path(spec["outputRoot"])
    scratch = Path(spec["scratchRoot"])
    lock_path = Path(spec["recorderLockPath"])
    lock_fd = os.open(lock_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                      0o600)
    lock_id = f"{os.getpid()}:{time.time_ns()}"
    with os.fdopen(lock_fd, "w") as stream:
        stream.write(lock_id + "\n")
        stream.flush()
        os.fsync(stream.fileno())
    child_pid = None
    child_exit = None
    group = None
    status = {"schema": "1370-c0-sparse-materialization-observed-r2",
              "status": "STOP", "specSha256": file_sha(spec_path),
              "scratchRoot": str(scratch), "outputRoot": str(root),
              "startMonotonic": start, "stopReason": None,
              "childExit": None, "groupClear": None, "scratchClear": None,
              "freeMinimum": None, "stdoutSha256": None, "stderrSha256": None}
    try:
        root.mkdir(mode=0o700)
        require(root.is_dir() and not root.is_symlink(), "output root changed")
        update_free_minimum(status, shutil.disk_usage(scratch.parent).free)
        out = root / "child.stdout"
        err = root / "child.stderr"
        with open(out, "xb") as stdout, open(err, "xb") as stderr:
            child_pid = fork_ready(spec, spec_path, stdout.fileno(), stderr.fileno())
            group = child_pid
            status["childPid"] = child_pid
            update_free_minimum(status, shutil.disk_usage(scratch.parent).free)
            while True:
                now = time.monotonic()
                free = shutil.disk_usage(scratch.parent).free
                update_free_minimum(status, free)
                if now - start >= MAX_WHOLE_SECONDS:
                    raise Stop("whole materialization deadline")
                if free < FLOOR:
                    raise Stop("space floor plus reserve breached during materialization")
                waited, wait_status = os.waitpid(child_pid, os.WNOHANG)
                if waited == child_pid:
                    child_exit = os.waitstatus_to_exitcode(wait_status)
                    break
                time.sleep(POLL_SECONDS)
            status["childExit"] = child_exit
        if child_exit != 0:
            raise Stop("materializer child exited " + str(child_exit))
        try:
            payload = json.loads(out.read_text(encoding="utf-8"))
        except (ValueError, UnicodeError) as exc:
            raise Stop("invalid child result JSON") from exc
        require(isinstance(payload, dict) and
                payload.get("status") == "MATERIALIZED_UNREVIEWED_UNRUN" and
                payload.get("scratchRoot") == str(scratch) and
                payload.get("sourceSha") == spec.get("sourceSha"),
                "child result role mismatch")
        require(shutil.disk_usage(scratch.parent).free >= FLOOR,
                "postflight space floor breached")
        require(scratch.is_dir() and not scratch.is_symlink(), "scratch checkout absent")
        require(not still_alive(group), "owned group survivor after child exit")
        status["status"] = "MATERIALIZED_UNREVIEWED_UNRUN"
    except BaseException as exc:
        status["stopReason"] = f"{type(exc).__name__}:{exc}"
        if group is not None:
            try:
                terminate(group, child_pid)
            except BaseException as cleanup_exc:
                status["stopReason"] += f";cleanup:{type(cleanup_exc).__name__}:{cleanup_exc}"
        if scratch.exists() and not scratch.is_symlink():
            try:
                shutil.rmtree(scratch)
            except BaseException as cleanup_exc:
                status["stopReason"] += f";scratchCleanup:{type(cleanup_exc).__name__}:{cleanup_exc}"
    finally:
        status["endMonotonic"] = time.monotonic()
        status["childExit"] = child_exit
        status["groupClear"] = group is None or not still_alive(group)
        status["scratchClear"] = not scratch.exists() if status["status"] == "STOP" else False
        for key, name in (("stdoutSha256", "child.stdout"),
                          ("stderrSha256", "child.stderr")):
            file = root / name
            if file.is_file():
                status[key] = file_sha(file)
        try:
            if root.is_dir():
                write_once(root / "RESULT.json", canonical_json(status) + b"\n")
        finally:
            try:
                if lock_path.read_text(encoding="utf-8") == lock_id + "\n":
                    lock_path.unlink()
            except OSError:
                pass
    return status


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("one exact reviewed binding required")
    result = lane(Path(sys.argv[1]))
    print(json.dumps({"status": result["status"], "result": result["outputRoot"] +
                      "/RESULT.json"}, sort_keys=True))
    raise SystemExit(0 if result["status"] == "MATERIALIZED_UNREVIEWED_UNRUN" else 2)
