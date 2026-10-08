#!/usr/bin/env python3
"""Small descendant canary for a frozen sandbox profile. Never writes protected paths."""

import errno
import hashlib
import json
import os
import selectors
import signal
import stat
import subprocess
import sys
import time
from pathlib import Path

PYTHON = str(Path(sys.executable).resolve(strict=True))
PIPE_CAP = 8192
GROUP_CLEAR_SECONDS = 3.0


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def load(path):
    return json.loads(Path(path).read_text())


def snapshot(paths):
    result = {}
    for value in paths:
        path = Path(value)
        st = path.lstat()
        if not stat.S_ISDIR(st.st_mode) or path.resolve(strict=True) != path:
            raise RuntimeError(f"protected path ambiguity: {path}")
        entries = []
        for name in sorted(os.listdir(path), key=os.fsencode):
            child = path / name
            item = child.lstat()
            entries.append([name, item.st_dev, item.st_ino, item.st_mode,
                            item.st_size, item.st_mtime_ns, item.st_ctime_ns])
        result[value] = {"root": [st.st_dev, st.st_ino, st.st_mode,
                                   st.st_mtime_ns, st.st_ctime_ns],
                         "entries": entries}
    return result


def attestation(spec, role):
    profile = Path(spec["profile"])
    actual = digest(profile)
    if actual != spec["profileSha256"] or actual != os.environ.get("H_CANARY_PROFILE_SHA"):
        raise RuntimeError("profile bytes or environment drift")
    if os.environ.get("H_CANARY_SANDBOX_PREFIX") != json.dumps(spec["sandboxPrefix"], separators=(",", ":")):
        raise RuntimeError("sandbox prefix attestation mismatch")
    return {"role": role, "pid": os.getpid(), "ppid": os.getppid(),
            "profileSha256": actual, "sandboxPrefix": spec["sandboxPrefix"],
            "executable": PYTHON,
            "environment": {key: os.environ.get(key) for key in
                            ("HOME", "TMPDIR", "VITEST_CACHE_DIR", "PREIMAGE_OUTPUT")}}


def exclusive_json(path, value):
    payload = (json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n").encode()
    fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW, 0o600)
    try:
        os.write(fd, payload)
        os.fsync(fd)
    finally:
        os.close(fd)


def descendant(spec):
    result = attestation(spec, "descendant")
    denied = Path(spec["deniedCanary"]) / spec["canaryName"]
    if denied.exists() or denied.is_symlink():
        raise RuntimeError("canary preexists")
    try:
        fd = os.open(denied, os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW, 0o600)
    except OSError as error:
        if error.errno not in (errno.EPERM, errno.EACCES):
            raise
        result["deniedErrno"] = error.errno
    else:
        os.close(fd)
        raise RuntimeError("sandbox allowed denied canary write")
    if denied.exists() or denied.is_symlink():
        raise RuntimeError("denied canary appeared")
    output = Path(spec["allowedProbeOutput"]) / "descendant.json"
    exclusive_json(output, result)


def inside_parent(spec_path, spec):
    result = attestation(spec, "parent")
    env = dict(os.environ)
    # The descendant's attestation is in its exclusive JSON receipt. Inherit the
    # outer supervisor's bounded pipes; /dev/null is denied by this sandbox.
    proc = subprocess.Popen([PYTHON, str(Path(__file__).resolve()), "--descendant", spec_path],
                            env=env)
    try:
        code = proc.wait(timeout=8)
    except subprocess.TimeoutExpired:
        # The outer supervisor owns and clears the entire sandbox process group.
        raise RuntimeError("STOP_BOUNDARY descendant timeout") from None
    if code != 0:
        raise RuntimeError(f"STOP_BOUNDARY descendant failed: {code}")
    result["descendantExit"] = code
    exclusive_json(Path(spec["allowedProbeOutput"]) / "parent.json", result)


def group_exists(pgid):
    try:
        os.killpg(pgid, 0)
    except ProcessLookupError:
        return False
    except OSError:
        # EPERM is never proof of disappearance. Finalization must STOP unless
        # a later probe obtains ESRCH after the direct child is reaped.
        return True
    return True


def clear_group(child, pgid):
    """TERM, then KILL, reap the direct child, and prove ESRCH for the group."""
    signal_errors = []
    for sig, seconds in ((signal.SIGTERM, 0.5), (signal.SIGKILL, GROUP_CLEAR_SECONDS)):
        try:
            os.killpg(pgid, sig)
        except ProcessLookupError:
            pass
        except OSError as error:
            signal_errors.append(f"signal {sig}: {error!r}")
        until = time.monotonic() + seconds
        while time.monotonic() < until:
            if not group_exists(pgid):
                break
            time.sleep(0.02)
        if not group_exists(pgid):
            break
    errors = []
    # A denied group signal must not leave the owned direct child unreaped. This
    # fallback cannot certify descendants; the group-clear check below still binds.
    if child.poll() is None:
        try:
            child.terminate()
            child.wait(timeout=0.5)
        except subprocess.TimeoutExpired:
            try:
                child.kill()
            except OSError as error:
                errors.append(f"direct child kill: {error!r}")
        except OSError as error:
            errors.append(f"direct child terminate: {error!r}")
    try:
        child.wait(timeout=GROUP_CLEAR_SECONDS)
    except subprocess.TimeoutExpired:
        errors.append("direct child unreaped")
    until = time.monotonic() + GROUP_CLEAR_SECONDS
    while time.monotonic() < until and group_exists(pgid):
        time.sleep(0.02)
    if group_exists(pgid):
        errors.append("process group not clear")
    if errors:
        raise RuntimeError("STOP_BOUNDARY cleanup: " + "; ".join(signal_errors + errors))


def bounded_group_child(argv, env, cwd, timeout=12, cap=PIPE_CAP):
    """Drain child and inherited descendant pipes without exceeding either cap."""
    child = subprocess.Popen(argv, env=env, cwd=cwd,
                             stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                             stdin=subprocess.PIPE, start_new_session=True,
                             close_fds=True, pass_fds=())
    child.stdin.close()
    pgid = child.pid
    outputs = {child.stdout: bytearray(), child.stderr: bytearray()}
    selector = selectors.DefaultSelector()
    reason = None
    cleanup_started = False
    try:
        for pipe in outputs:
            os.set_blocking(pipe.fileno(), False)
            selector.register(pipe, selectors.EVENT_READ)
        deadline = time.monotonic() + timeout
        while selector.get_map() or child.poll() is None:
            left = deadline - time.monotonic()
            if left <= 0:
                reason = "timeout"
                break
            for key, _ in selector.select(min(left, 0.05)):
                pipe = key.fileobj
                # One extra byte detects overflow. Never read more than the cap.
                remaining = cap + 1 - len(outputs[pipe])
                data = os.read(pipe.fileno(), min(65536, remaining))
                if not data:
                    selector.unregister(pipe)
                    continue
                outputs[pipe].extend(data)
                if len(outputs[pipe]) > cap:
                    reason = "pipe cap exceeded"
                    break
            if reason is not None:
                break
        if reason is None and child.poll() is None:
            reason = "timeout"
        if reason is None and child.returncode != 0:
            reason = f"child exit {child.returncode}"
        if reason is None:
            child.wait(timeout=GROUP_CLEAR_SECONDS)
            if group_exists(pgid):
                reason = "surviving process group"
        if reason is not None:
            cleanup_started = True
            try:
                clear_group(child, pgid)
            except Exception as cleanup_error:
                raise RuntimeError(f"STOP_BOUNDARY {reason}; {cleanup_error}") from cleanup_error
            raise RuntimeError(f"STOP_BOUNDARY {reason}; direct child reaped and group clear; "
                               f"stderr={bytes(outputs[child.stderr])[:2048]!r}")
        return bytes(outputs[child.stdout]), bytes(outputs[child.stderr]), child.returncode
    except BaseException:
        # Unexpected selector/read failures also fail closed with owned-group cleanup.
        if not cleanup_started and (group_exists(pgid) or child.poll() is None):
            clear_group(child, pgid)
        raise
    finally:
        selector.close()
        for pipe in outputs:
            pipe.close()


def probe(spec_path, spec):
    from profile import build
    profile = Path(spec["profile"])
    if digest(profile) != spec["profileSha256"]:
        raise RuntimeError("profile SHA mismatch")
    rendered = build(spec["profileBinding"])
    if rendered["text"].encode() != profile.read_bytes():
        raise RuntimeError("bound profile text mismatch")
    if any(profile == Path(value) or Path(value) in profile.parents for value in rendered["allowed"]):
        raise RuntimeError("profile is child-writable")
    prefix = spec["sandboxPrefix"]
    if prefix != ["/usr/bin/sandbox-exec", "-f", str(profile)]:
        raise RuntimeError("actual sandbox prefix mismatch")
    if spec["deniedCanary"] != rendered["canary"]:
        raise RuntimeError("canary path mismatch")
    output = Path(spec["allowedProbeOutput"])
    if str(output) not in rendered["allowed"] or list(output.iterdir()):
        raise RuntimeError("probe output is not unique and empty")
    environment = spec["environment"]
    if set(environment) != {"HOME", "TMPDIR", "VITEST_CACHE_DIR", "PREIMAGE_OUTPUT"}:
        raise RuntimeError("incomplete child environment")
    for value in environment.values():
        if value not in rendered["allowed"]:
            raise RuntimeError("child environment escapes allowed directories")
    denied = Path(spec["deniedCanary"]) / spec["canaryName"]
    if denied.exists() or denied.is_symlink():
        raise RuntimeError("denied canary preexists")
    before = snapshot(rendered["protected"])
    receipts = {p: digest(p) for p in spec["immutableReceiptSha256"]}
    if receipts != spec["immutableReceiptSha256"]:
        raise RuntimeError("protected receipt SHA mismatch")
    env = dict(os.environ)
    env.update(environment)
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    env["H_CANARY_PROFILE_SHA"] = spec["profileSha256"]
    env["H_CANARY_SANDBOX_PREFIX"] = json.dumps(prefix, separators=(",", ":"))
    argv = prefix + [PYTHON, str(Path(__file__).resolve()), "--inside-parent", spec_path]
    stdout, stderr, child_code = bounded_group_child(argv, env, spec["cwd"])
    parent = load(output / "parent.json")
    descendant_result = load(output / "descendant.json")
    for item in (parent, descendant_result):
        if (item["profileSha256"] != spec["profileSha256"] or
                item["sandboxPrefix"] != prefix or item["environment"] != environment):
            raise RuntimeError("STOP_BOUNDARY attestation mismatch")
    if parent["role"] != "parent" or descendant_result["role"] != "descendant":
        raise RuntimeError("STOP_BOUNDARY missing role")
    if descendant_result["ppid"] != parent["pid"] or parent["descendantExit"] != 0:
        raise RuntimeError("STOP_BOUNDARY missing lineage")
    if descendant_result["deniedErrno"] not in (errno.EPERM, errno.EACCES):
        raise RuntimeError("STOP_BOUNDARY no denial")
    if denied.exists() or denied.is_symlink():
        raise RuntimeError("STOP_BOUNDARY canary appeared")
    if snapshot(rendered["protected"]) != before or {p: digest(p) for p in receipts} != receipts:
        raise RuntimeError("STOP_BOUNDARY protected readback drift")
    return {"status": "SYNTHETIC_CANARY_OBSERVED_BOUNDARY_REVIEW_PENDING",
            "profileSha256": spec["profileSha256"], "argv": argv,
            "childExit": child_code, "stdoutBytes": len(stdout), "stderrBytes": len(stderr),
            "parent": parent, "descendant": descendant_result,
            "protectedSnapshot": before}


if __name__ == "__main__":
    role, spec_path = sys.argv[1:3]
    data = load(spec_path)
    if role == "--descendant":
        descendant(data)
    elif role == "--inside-parent":
        inside_parent(spec_path, data)
    elif role == "--probe":
        print(json.dumps(probe(spec_path, data), sort_keys=True))
    else:
        raise SystemExit("unknown mode")
