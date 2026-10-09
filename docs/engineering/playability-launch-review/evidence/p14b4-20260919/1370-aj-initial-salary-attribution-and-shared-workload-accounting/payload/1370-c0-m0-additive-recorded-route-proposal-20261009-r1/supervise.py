#!/usr/bin/env python3
"""Independent whole-clock supervisor for one reviewed sparse materialization.

M0 role adaptation of accepted r6 owned wrapper tightened to210. Source-only proposal; unfilled binding cannot launch.
"""

import os,signal,time
BOOT_START=time.monotonic()
if __name__=="__main__":
 signal.signal(signal.SIGALRM,lambda *_: os._exit(124))
 signal.setitimer(signal.ITIMER_REAL,210) # Before source/helper imports; no child exists yet.
import json
import hashlib
import os
from pathlib import Path
import select
import shutil
import signal
import sys
import time

import importlib.util
import stat
_GUARD=Path("/Users/zacheryspector/studio-scratch/1370-c0-aging-era-sparse-materializer-source-r6/materialize.py")
require_guard_sha="2d63876297bc85a1ab5192491f4255d2cce7d17de048bfec65c21b479d1f0896"
if _GUARD.resolve(strict=True)!=_GUARD or not stat.S_ISREG(_GUARD.lstat().st_mode) or _GUARD.is_symlink() or hashlib.sha256(_GUARD.read_bytes()).hexdigest()!=require_guard_sha:
    raise RuntimeError("accepted read-only r6 helper source drift")
_module_spec=importlib.util.spec_from_file_location("accepted_r6_readonly_helpers",_GUARD)
_g=importlib.util.module_from_spec(_module_spec);_module_spec.loader.exec_module(_g)
Stop,canonical_json,file_sha,require=_g.Stop,_g.canonical_json,_g.file_sha,_g.require

WHOLE_SECONDS = 210
POLL_SECONDS = 0.05
PARENT = Path("/Users/zacheryspector/studio-scratch")


def alive_group(group):
    if group is None:
        return False
    try:
        os.killpg(group, 0)
        return True
    except ProcessLookupError:
        return False
    except PermissionError:
        return True


def kill_owned(worker_pid, child_group):
    for group in (child_group, worker_pid):
        if group is not None and alive_group(group):
            try:
                os.killpg(group, signal.SIGTERM)
            except (ProcessLookupError, PermissionError):
                pass
    time.sleep(0.1)
    for group in (child_group, worker_pid):
        if group is not None and alive_group(group):
            try:
                os.killpg(group, signal.SIGKILL)
            except (ProcessLookupError, PermissionError):
                pass
    try:
        os.kill(worker_pid, signal.SIGKILL)
    except (ProcessLookupError, PermissionError):
        pass


def watch(worker_pid, report_fd, start, limit=WHOLE_SECONDS, clock=time.monotonic,
          state=None):
    """Deadline is tested before and after waitpid; a late exit is always STOP."""
    os.set_blocking(report_fd, False)
    child_group = None
    if state is not None:
        state["childGroup"] = None
    report = b""
    exit_code = None
    timed_out = False
    while True:
        if clock() - start >= limit:
            timed_out = True
            break
        readable, _, _ = select.select([report_fd], [], [], POLL_SECONDS)
        if readable:
            chunk = os.read(report_fd, 256)
            report += chunk
            require(len(report) <= 256, "child group report too long")
            if b"\n" in report:
                raw, _, rest = report.partition(b"\n")
                require(not rest and raw.isdigit(), "malformed child group report")
                child_group = int(raw)
                require(child_group > 1, "invalid child group")
                if state is not None:
                    state["childGroup"] = child_group
        if clock() - start >= limit:
            timed_out = True
            break
        waited, status = os.waitpid(worker_pid, os.WNOHANG)
        if waited == worker_pid:
            exit_code = os.waitstatus_to_exitcode(status)
            if clock() - start >= limit:
                timed_out = True
            break
    return {"timedOut": timed_out, "workerExit": exit_code,
            "childGroup": child_group}


def read_roles(spec_path):
    require(spec_path.is_absolute() and spec_path.is_file() and
            not spec_path.is_symlink(), "exact binding path absent")
    require(spec_path.stat().st_size<=128*1024,"binding cap")
    raw = spec_path.read_bytes()
    data = json.loads(raw.decode("utf-8"))
    require(isinstance(data, dict), "invalid binding object")
    require(sys.dont_write_bytecode and not sys.flags.optimize and data.get("status")=="REVIEWED_FILLED_UNRUN" and data.get("executionAuthorization") is True and data.get("noDetachedChildren") is True, "reviewed isolated no-detach exact binding required")
    for key in ("outputParent", "outputRoot", "scratchParent", "scratchRoot",
                "recorderLockPath", "supervisorPath", "supervisorSha256"):
        require(isinstance(data.get(key), str) and bool(data[key]),
                "missing exact role " + key)
    output = Path(data["outputRoot"])
    scratch = Path(data["scratchRoot"])
    lock = Path(data["recorderLockPath"])
    require(Path(data["outputParent"]) == PARENT and
            output.parent == PARENT and scratch.parent == PARENT and
            lock.parent == PARENT and output != scratch and
            Path(data["scratchParent"]) == PARENT,
            "scratch/output/lock scope wrong")
    require(PARENT.is_dir() and not PARENT.is_symlink() and
            PARENT.resolve() == PARENT and data.get("noExternalSameUidRenamer") is True,
            "scratch parent/no-renamer scope wrong")
    require(not output.exists() and not output.is_symlink() and
            scratch.is_dir() and not scratch.is_symlink() and
            not lock.exists() and not lock.is_symlink(),
            "exclusive output, scratch or lock already exists")
    require(Path(data["supervisorPath"]) == Path(__file__) and
            file_sha(Path(__file__)) == data["supervisorSha256"],
            "supervisor source drift")
    return data, output, scratch, lock, hashlib.sha256(raw).hexdigest()


def write_once(path, payload):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, "wb") as stream:
        stream.write(payload)
        stream.flush()
        os.fsync(stream.fileno())


class DeadlineExpired(Stop):
    pass


def check_deadline(start, limit, clock=time.monotonic):
    if clock() - start >= limit:
        raise DeadlineExpired("whole-clock deadline through final receipt")


def finalize_bound(spec_path, bound, observed, worker_pid, start, limit,
                   failure=None, clock=time.monotonic, writer=write_once):
    """Never reread output/scratch roles; only compare the original spec bytes."""
    data, output, scratch, lock, starting_sha = bound
    child_group = observed["childGroup"]
    recorder = output / "RESULT.json"
    child_result = None
    recorder_sha = None
    try:
        if not output.exists():
            output.mkdir(mode=0o700)
        require(output.is_dir() and not output.is_symlink(), "bound output changed")
        if recorder.is_file() and not recorder.is_symlink():
            recorder_sha = file_sha(recorder)
            child_result = json.loads(recorder.read_text(encoding="utf-8"))
            require(isinstance(child_result, dict), "invalid recorder object")
        require(file_sha(spec_path) == starting_sha, "binding bytes changed after launch")
        require(isinstance(child_result, dict) and
                child_result.get("specSha256") == starting_sha,
                "worker binding digest mismatch")
        if failure:
            raise Stop(failure)
        require(not observed["timedOut"] and observed["workerExit"] == 0 and
                child_result.get("status") == "ADDITIVE_UNREVIEWED_UNRUN" and
                child_result.get("groupClear") is True and
                child_result.get("scratchRoot") == str(scratch) and
                scratch.is_dir() and not scratch.is_symlink() and
                not alive_group(worker_pid) and not alive_group(child_group),
                "worker/materialization result not accepted")
        if lock.is_file() and not lock.is_symlink() and \
                lock.read_text(encoding="utf-8").startswith(str(worker_pid) + ":"):
            lock.unlink()
        require(not lock.exists() and not lock.is_symlink(), "owned lock not cleared")
        check_deadline(start, limit, clock)
        # All expensive postflight I/O precedes the final success commit.
        prepared = {"schema": "1370-c0-m0-additive-supervisor-r1",
                    "status": "PREPARED_UNREVIEWED", "specSha256": starting_sha,
                    "workerPid": worker_pid, "childGroup": child_group,
                    "workerExit": observed["workerExit"],
                    "recorderSha256": recorder_sha, "startMonotonic": start}
        writer(output / "SUPERVISOR-PREPARED.json", canonical_json(prepared) + b"\n")
        check_deadline(start, limit, clock)
        final = {**prepared, "status": "ADDITIVE_UNREVIEWED_UNRUN",
                 "endMonotonic": clock(), "timedOut": False,
                 "workerGroupClear": True, "childGroupClear": True,
                 "freeMinimum": child_result.get("freeMinimum")}
        check_deadline(start, limit, clock)
        writer(output / "SUPERVISOR.json", canonical_json(final) + b"\n")
        # Alarm stays armed through the fsync above. A late final write creates
        # an authoritative STOP override; the independent observer must check it.
        check_deadline(start, limit, clock)
        return final
    except BaseException as exc:
        # The worker was already stopped/reaped by the caller. Cleanup is bound
        # to the original prelaunch scratch child, never new binding contents.
        if not output.exists():
            output.mkdir(mode=0o700)
        require(output.is_dir() and not output.is_symlink(), "bound output changed")
        # M0 partial leaves and durable sibling receipts are retained on STOP.
        # No deletion of this root or the separately protected H mirror is authorized.
        try:
            if lock.is_file() and not lock.is_symlink() and \
                    lock.read_text(encoding="utf-8").startswith(str(worker_pid) + ":"):
                lock.unlink()
        except OSError:
            pass
        final = {"schema": "1370-c0-m0-additive-supervisor-r1", "status": "STOP",
                 "specSha256": starting_sha, "workerPid": worker_pid,
                 "childGroup": child_group, "workerExit": observed["workerExit"],
                 "timedOut": isinstance(exc, DeadlineExpired) or
                             observed["timedOut"] or clock() - start >= limit,
                 "failure": f"{type(exc).__name__}:{exc}",
                 "recorderSha256": recorder_sha,
                 "workerGroupClear": not alive_group(worker_pid),
                 "childGroupClear": not alive_group(child_group),
                 "scratchClear": not scratch.exists(),
                 "partialMirrorPreserved": scratch.exists(),
                 "freeMinimum": child_result.get("freeMinimum") if isinstance(child_result, dict) else None,
                 "startMonotonic": start, "endMonotonic": clock()}
        path = output / ("SUPERVISOR-OVERRIDE-STOP.json" if
                         (output / "SUPERVISOR.json").exists() else "SUPERVISOR.json")
        writer(path, canonical_json(final) + b"\n")
        return final


def supervise(spec_path, limit=WHOLE_SECONDS):
    # The OS timer starts before any role read, lock, worker fork, or materializer.
    start = BOOT_START if __name__=="__main__" else time.monotonic()
    worker_pid = None
    report_read = report_write = None
    bound = None
    watched = {"childGroup": None}
    observed = None
    previous = signal.getsignal(signal.SIGALRM)
    def alarm(_signum, _frame):
        # Hard210 never resets for cleanup/finalization. Durable files/streams stay;
        # missing supervisor receipt and actual124 are authoritative STOP, no zero/clear claim.
        child=watched.get("childGroup")
        if child is None and report_read is not None:
            try:
                os.set_blocking(report_read,False);raw=os.read(report_read,256)
                if raw.strip().isdigit():child=int(raw.strip())
            except OSError:pass
        for group in (child,worker_pid):
            if group is not None:
                try:os.killpg(group,signal.SIGKILL)
                except (ProcessLookupError,PermissionError):pass
        os._exit(124)
    signal.signal(signal.SIGALRM, alarm)
    signal.setitimer(signal.ITIMER_REAL, max(.000001,limit-(time.monotonic()-start)))
    try:
        bound = read_roles(spec_path)
        check_deadline(start, limit)
        report_read, report_write = os.pipe()
        old_mask=signal.pthread_sigmask(signal.SIG_BLOCK,{signal.SIGALRM})
        try:worker_pid = os.fork()
        except BaseException:
            signal.pthread_sigmask(signal.SIG_SETMASK,old_mask)
            raise
        if worker_pid == 0:
            try:
                signal.setitimer(signal.ITIMER_REAL, 0)
                signal.pthread_sigmask(signal.SIG_SETMASK,old_mask)
                os.close(report_read)
                os.setsid()
                os.set_inheritable(report_write, True)
                env = dict(os.environ)
                env["SPARSE_1370_SUPERVISOR_FD"] = str(report_write)
                os.execve(sys.executable, [sys.executable,
                           "-I", "-B", str(Path(__file__).parent / "record.py"), str(spec_path)], env)
            except BaseException:
                os._exit(126)
        signal.pthread_sigmask(signal.SIG_SETMASK,old_mask)
        os.close(report_write)
        report_write = None
        observed = watch(worker_pid, report_read, start, limit, state=watched)
        os.close(report_read)
        report_read = None
        if observed["timedOut"] or observed["workerExit"] is None or \
                alive_group(worker_pid) or alive_group(observed["childGroup"]):
            kill_owned(worker_pid, observed["childGroup"])
        if observed["workerExit"] is None:
            deadline = time.monotonic() + 5
            while time.monotonic() < deadline:
                try:
                    waited, status = os.waitpid(worker_pid, os.WNOHANG)
                except ChildProcessError:
                    break
                if waited == worker_pid:
                    observed["workerExit"] = os.waitstatus_to_exitcode(status)
                    break
                time.sleep(0.05)
        result = finalize_bound(spec_path, bound, observed, worker_pid, start, limit)
        signal.setitimer(signal.ITIMER_REAL, 0)
        return result
    except BaseException as exc:
        # Alarm remains armed through STOP cleanup/finalization.
        if worker_pid is not None and (observed is None or
                                       observed.get("workerExit") is None or
                                       alive_group(worker_pid) or
                                       alive_group(watched["childGroup"])):
            kill_owned(worker_pid, watched["childGroup"])
        if worker_pid is not None:
            deadline = time.monotonic() + 5
            while time.monotonic() < deadline:
                try:
                    waited, status = os.waitpid(worker_pid, os.WNOHANG)
                except ChildProcessError:
                    break
                if waited == worker_pid:
                    if observed is None:
                        observed = {"timedOut": True, "workerExit":
                                    os.waitstatus_to_exitcode(status),
                                    "childGroup": watched["childGroup"]}
                    break
                time.sleep(0.05)
        if bound is None:
            raise Stop("prelaunch binding failed before output role was bound") from exc
        if observed is None:
            observed = {"timedOut": isinstance(exc, DeadlineExpired),
                        "workerExit": None, "childGroup": watched["childGroup"]}
        return finalize_bound(spec_path, bound, observed, worker_pid, start,
                              limit, failure=f"{type(exc).__name__}:{exc}")
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)
        signal.signal(signal.SIGALRM, previous)
        for fd in (report_read, report_write):
            if fd is not None:
                try:
                    os.close(fd)
                except OSError:
                    pass


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("one reviewed exact binding required")
    result = supervise(Path(sys.argv[1]))
    print(json.dumps({"status": result["status"], "timedOut": result["timedOut"]},
                     sort_keys=True))
    raise SystemExit(0 if result["status"] == "ADDITIVE_UNREVIEWED_UNRUN" else 2)
