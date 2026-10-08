#!/usr/bin/env python3
"""UNRUN r4 proposal: clone two isolated, byte-checked H diagnostic copies.

This module has no implicit entry point. A future independently reviewed binding
must call materialize(binding); importing it cannot touch the historical H tree.
"""

import hashlib
import json
import os
import selectors
import signal
import shutil
import stat
import subprocess
import threading
import time
from contextlib import ExitStack, contextmanager
from pathlib import Path
from safe_output import validate_experiment
from native_metadata import capture as capture_native_metadata

GIB = 1024 ** 3
MIB = 1024 ** 2
FLOOR = 3 * GIB
ADMISSION = FLOOR + 256 * MIB
MONITOR_STOP = FLOOR + 128 * MIB
R5_PLAN_SHA = "07bb080a579501bc4921591a5ff7137ae11220e9c2de6731e1986b9ef7490403"
R5_REVIEW_SHA = "29ee4c9f87d4944b10c73fb4f9cb9f3ff8be8ec0e0ddb48800ac53756de23680"
R1_REFINE_SHA = "118e71c1e365d66a31a6029fc145a17ef1a71092d54839d0366d3ee05706eacd"
R2_REFINE_SHA = "f53caf905b437b6677b89564fb41fcd7eac9b819ef1e041694007034ec4a4be2"
R3_REFINE_SHA = "0cf511defa69facdd8692dbe952c7c8de8824787d691f475e41f736af46ae9ad"
DESIGN_SHA = "b1f42ea4c301e04903e8bf2b4b7c8560724ab1c9407300481dda4d4730bc506a"
DESIGN_REVIEW_SHA = "f7ccb46627aad487f56a6f413e7f2d862d382c8412aeed7e9cc4944e2327ca6f"
H_COMMIT = "8708d6a98e6eb4ad53e3a54e431c4b40b974f79d"
H_BRIDGE_TREE = "a697b042eccb85adacd40ef1303869be6d26239a"
H_SOURCE_DIGEST = "1534ca888a99c1f41e3eb2a7201d6d6d56f1343bab3f4040518348cc34d276b4"
H_FILES = 1402
H_BYTES = 99516095
H_DIRECTORIES = 76
DEPENDENCY_ENTRIES = 12484
DEPENDENCY_BYTES = 348223802
DEPENDENCY_HISTORICAL_DIGEST = "a06e929a60a5ede6ce0d72467d4d587e50d1c4fa3788bee3d07f1ea3388cd21d"
PRODUCTION = Path("/Users/zacheryspector/The-Movies-headless-program")
SCRATCH_ROOT = Path("/Users/zacheryspector/studio-scratch")
EVIDENCE_REF = "refs/heads/evidence/1370-r10-clean-captures"
PRODUCTION_REF = "refs/heads/wip/headless-program-20260916-ts"
ACTIVE_MONITOR = None


def sha_bytes(data):
    return hashlib.sha256(data).hexdigest()


def sha_file(path):
    digest = hashlib.sha256()
    with open(path, "rb", buffering=0) as stream:
        while part := stream.read(1024 * 1024):
            digest.update(part)
    return digest.hexdigest()


def check_real_directory(path):
    path = Path(path)
    if not path.is_absolute() or path.is_symlink() or not stat.S_ISDIR(path.lstat().st_mode):
        raise ValueError(f"not an absolute real directory: {path}")
    if path.resolve(strict=True) != path:
        raise ValueError(f"ambiguous ancestor: {path}")
    return path


@contextmanager
def held_chain(path):
    """Hold every ancestor without following links; recheck before release."""
    path = check_real_directory(path)
    fds = [os.open("/", os.O_RDONLY | os.O_DIRECTORY)]
    paths = [Path("/")]
    try:
        for part in path.parts[1:]:
            fd = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW,
                         dir_fd=fds[-1])
            fds.append(fd)
            paths.append(paths[-1] / part)
        identities = [(os.fstat(fd).st_dev, os.fstat(fd).st_ino,
                       os.fstat(fd).st_mode) for fd in fds]
        yield fds[-1]
        for item, fd, expected in zip(paths, fds, identities):
            actual = item.lstat()
            current = os.fstat(fd)
            if ((actual.st_dev, actual.st_ino, actual.st_mode) != expected or
                    (current.st_dev, current.st_ino, current.st_mode) != expected):
                raise RuntimeError(f"held ancestor changed: {item}")
    finally:
        for fd in reversed(fds):
            os.close(fd)


def available(path):
    fs = os.statvfs(path)
    return fs.f_bavail * fs.f_frsize


def admit(path, label):
    value = available(path)
    if value < FLOOR:
        raise RuntimeError(f"STOP_DISK_FLOOR {label}: {value}")
    if value < ADMISSION:
        raise RuntimeError(f"STOP_DISK_MARGIN {label}: {value}")
    return value


class DiskMonitor:
    def __init__(self, path):
        self.path = path
        self.samples = []
        self.failure = None
        self.done = threading.Event()
        self.worker = threading.Thread(target=self._sample, daemon=True)

    def _sample(self):
        while not self.done.is_set():
            try:
                value = available(self.path)
            except BaseException as error:
                self.failure = f"STOP_DISK_MONITOR_ERROR: {error!r}"
                break
            self.samples.append([time.monotonic_ns(), value])
            if value < FLOOR:
                self.failure = f"STOP_DISK_FLOOR monitor: {value}"
                break
            if value <= MONITOR_STOP:
                self.failure = f"STOP_DISK_MONITOR: {value}"
                break
            self.done.wait(0.5)

    def start(self):
        self.worker.start()
        return self

    def check(self):
        if self.failure:
            raise RuntimeError(self.failure)

    def close(self):
        self.done.set()
        self.worker.join(timeout=2)
        if self.worker.is_alive():
            raise RuntimeError("STOP_DISK_MONITOR_THREAD")
        self.check()


def monitor_check():
    if ACTIVE_MONITOR is not None:
        ACTIVE_MONITOR.check()


def guard_authority(binding):
    """Current refs are run-time guards, never substituted for historical H."""
    current = binding["currentRefs"]
    clean_env = {key: value for key, value in os.environ.items()
                 if not key.startswith("GIT_")}
    def git(*args):
        return subprocess.run(["git", *args], cwd=PRODUCTION, check=True,
                              env=clean_env, text=True, capture_output=True,
                              timeout=15).stdout.strip()
    if git("remote", "get-url", "origin") != binding["originUrl"]:
        raise RuntimeError("origin URL drift")
    if git("rev-parse", "HEAD") != current["productionHead"]:
        raise RuntimeError("current production HEAD drift")
    if git("rev-parse", "HEAD:src") != current["productionSrcTree"]:
        raise RuntimeError("current production src tree drift")
    if git("status", "--porcelain"):
        raise RuntimeError("production working tree dirty")
    for ref, value in ((PRODUCTION_REF, current["productionHead"]),
                       (EVIDENCE_REF, current["evidenceTip"])):
        if git("rev-parse", ref) != value:
            raise RuntimeError(f"local ref drift: {ref}")
        lines = git("ls-remote", "origin", ref).splitlines()
        if lines != [f"{value}\t{ref}"]:
            raise RuntimeError(f"remote ref drift: {ref}")
    for path, digest in binding["immutableReceiptSha256"].items():
        item = Path(path)
        if not item.is_absolute() or item.is_symlink() or sha_file(item) != digest:
            raise RuntimeError(f"source receipt drift: {path}")


def metadata(path):
    monitor_check()
    st = path.lstat()
    extra = capture_native_metadata(path)
    return {
        "mode": stat.S_IMODE(st.st_mode), "uid": st.st_uid, "gid": st.st_gid,
        "flags": getattr(st, "st_flags", 0), **extra,
    }


def inventory(root, *, source=False, deadline=None):
    """Record paths without following any entry; reject escaping links/hardlinks."""
    root = check_real_directory(root)
    rows = []
    root_stat = root.lstat()
    root_identity = [root_stat.st_dev, root_stat.st_ino, root_stat.st_mode,
                     root_stat.st_mtime_ns, root_stat.st_ctime_ns]
    stack = [(root, "")]
    while stack:
        monitor_check()
        if deadline is not None and time.monotonic() >= deadline:
            raise RuntimeError("STOP_DEADLINE inventory")
        current, relative = stack.pop()
        before = current.lstat()
        if not stat.S_ISDIR(before.st_mode):
            raise RuntimeError(f"directory replaced: {current}")
        rows.append({"path": relative or ".", "kind": "dir", **metadata(current)})
        names = sorted(os.listdir(current), key=os.fsencode)
        if len(names) > 15000:
            raise RuntimeError(f"entry cap: {current}")
        for name in reversed(names):
            monitor_check()
            if deadline is not None and time.monotonic() >= deadline:
                raise RuntimeError("STOP_DEADLINE inventory entry")
            if name in (".", "..") or "/" in name:
                raise RuntimeError(f"unsafe name: {name!r}")
            child = current / name
            rel = f"{relative}/{name}" if relative else name
            st = child.lstat()
            if stat.S_ISDIR(st.st_mode):
                stack.append((child, rel))
            elif stat.S_ISREG(st.st_mode):
                if st.st_nlink != 1:
                    raise RuntimeError(f"hardlink: {rel}")
                fd = os.open(child, os.O_RDONLY | os.O_NOFOLLOW)
                try:
                    fd_stat = os.fstat(fd)
                    if (fd_stat.st_dev, fd_stat.st_ino) != (st.st_dev, st.st_ino):
                        raise RuntimeError(f"file race: {rel}")
                    content = hashlib.sha256()
                    git_blob = hashlib.sha1()
                    git_blob.update(f"blob {st.st_size}\0".encode())
                    size = 0
                    while part := os.read(fd, 1024 * 1024):
                        monitor_check()
                        if deadline is not None and time.monotonic() >= deadline:
                            raise RuntimeError("STOP_DEADLINE inventory file")
                        content.update(part)
                        git_blob.update(part)
                        size += len(part)
                    if size != st.st_size or child.lstat().st_ino != st.st_ino:
                        raise RuntimeError(f"file drift: {rel}")
                finally:
                    os.close(fd)
                rows.append({"path": rel, "kind": "file", "size": size,
                             "sha256": content.hexdigest(), "gitOid": git_blob.hexdigest(),
                             "device": st.st_dev, "inode": st.st_ino, "nlink": st.st_nlink,
                             **metadata(child)})
            elif stat.S_ISLNK(st.st_mode):
                target = os.readlink(child)
                if source and rel == "node_modules":
                    rows.append({"path": rel, "kind": "source-dependency-link",
                                 "target": target, **metadata(child)})
                    continue
                if os.path.isabs(target):
                    raise RuntimeError(f"absolute dependency link: {rel}")
                resolved = (child.parent / target).resolve(strict=True)
                if os.path.commonpath([root, resolved]) != str(root):
                    raise RuntimeError(f"escaping dependency link: {rel}")
                rows.append({"path": rel, "kind": "link", "target": target,
                             "resolved": str(resolved.relative_to(root)), **metadata(child)})
            else:
                raise RuntimeError(f"unsupported node: {rel}")
        after = current.lstat()
        if (before.st_dev, before.st_ino, before.st_mtime_ns, before.st_ctime_ns) != (
            after.st_dev, after.st_ino, after.st_mtime_ns, after.st_ctime_ns
        ):
            raise RuntimeError(f"directory drift: {current}")
    rows.sort(key=lambda row: os.fsencode(row["path"]))
    return {"rootIdentity": root_identity, "rows": rows,
            "rowsSha256": sha_bytes(json.dumps(rows, sort_keys=True, separators=(",", ":")).encode())}


def comparable(rows, *, source=False):
    result = []
    for row in rows:
        clone = dict(row)
        for identity in ("device", "inode", "nlink"):
            clone.pop(identity, None)
        # Each copy has new inodes and relocated ownership/times. The H source
        # link is the sole authorized target difference; it is checked later.
        if source and clone["kind"] == "source-dependency-link":
            clone.pop("target")
        result.append(clone)
    return result


def normalized_digest(rows, *, source=False):
    return sha_bytes(json.dumps(comparable(rows, source=source), sort_keys=True,
                                separators=(",", ":")).encode())


def require_distinct_inodes(first, second):
    a = {r["path"]: (r["device"], r["inode"]) for r in first["rows"] if r["kind"] == "file"}
    b = {r["path"]: (r["device"], r["inode"]) for r in second["rows"] if r["kind"] == "file"}
    if a.keys() != b.keys() or any(a[path] == b[path] for path in a):
        raise RuntimeError("clone source/copy share a regular-file inode")


def source_digest(rows):
    digest = hashlib.sha256()
    files = [r for r in rows if r["kind"] == "file"]
    for row in sorted(files, key=lambda r: os.fsencode(r["path"])):
        line = [row["path"], row["size"], row["gitOid"], row["sha256"], row["mode"]]
        digest.update(json.dumps(line, separators=(",", ":"), ensure_ascii=False).encode() + b"\n")
    return {"count": len(files), "bytes": sum(r["size"] for r in files),
            "digest": digest.hexdigest()}


def group_clear(pgid):
    try:
        os.killpg(pgid, 0)
    except ProcessLookupError:
        return True
    except OSError:
        # EPERM (and any other ambiguous probe failure) never proves ESRCH.
        return False
    return False


def stop_group(proc):
    """Always reap the direct child; accept cleanup only after group ESRCH."""
    failures = []
    if not group_clear(proc.pid):
        try:
            os.killpg(proc.pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
        except OSError as error:
            failures.append(f"group TERM denied: {error!r}")
        until = time.monotonic() + 0.5
        while time.monotonic() < until and not group_clear(proc.pid):
            time.sleep(0.02)
    if not group_clear(proc.pid):
        try:
            os.killpg(proc.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        except OSError as error:
            failures.append(f"group KILL denied: {error!r}")
    # A denied group signal must not bypass direct-child reaping. This fallback
    # cannot certify descendants; the group-clear probe below remains mandatory.
    if proc.poll() is None:
        try:
            proc.terminate()
            proc.wait(timeout=0.5)
        except subprocess.TimeoutExpired:
            try:
                proc.kill()
            except OSError as error:
                failures.append(f"direct KILL denied: {error!r}")
        except OSError as error:
            failures.append(f"direct TERM denied: {error!r}")
    try:
        proc.wait(timeout=2)
    except subprocess.TimeoutExpired:
        failures.append("direct child unreaped")
    until = time.monotonic() + 2
    while time.monotonic() < until and not group_clear(proc.pid):
        time.sleep(0.02)
    if not group_clear(proc.pid):
        raise RuntimeError("STOP_GROUP_SURVIVOR " + "; ".join(failures))
    if "direct child unreaped" in failures:
        raise RuntimeError("STOP_DIRECT_CHILD_UNREAPED " + "; ".join(failures))


def bounded_process(argv, *, timeout, stdout_cap, stderr_cap, stdout_fd=None,
                    stderr_fd=None, scratch=None, label="helper", env=None):
    """Drain pipes while running; never spool more than cap bytes to a file."""
    proc = subprocess.Popen(argv, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                            env=env, start_new_session=True)
    selector = selectors.DefaultSelector()
    buffers = {"stdout": bytearray(), "stderr": bytearray()}
    caps = {"stdout": stdout_cap, "stderr": stderr_cap}
    destinations = {"stdout": stdout_fd, "stderr": stderr_fd}
    end = time.monotonic() + timeout
    try:
        for name, stream in (("stdout", proc.stdout), ("stderr", proc.stderr)):
            os.set_blocking(stream.fileno(), False)
            selector.register(stream, selectors.EVENT_READ, name)
        while selector.get_map() or proc.poll() is None:
            monitor_check()
            if scratch is not None:
                value = available(scratch)
                if value < FLOOR:
                    raise RuntimeError(f"STOP_DISK_FLOOR during {label}: {value}")
                if value <= MONITOR_STOP:
                    raise RuntimeError(f"STOP_DISK_MONITOR during {label}: {value}")
            if time.monotonic() >= end:
                raise RuntimeError(f"STOP_DEADLINE during {label}")
            for key, _ in selector.select(timeout=0.1):
                name = key.data
                chunk = os.read(key.fileobj.fileno(), 65536)
                if not chunk:
                    selector.unregister(key.fileobj)
                    continue
                if len(buffers[name]) + len(chunk) > caps[name]:
                    raise RuntimeError(f"STOP_LOG_CAP during {label} {name}")
                buffers[name].extend(chunk)
                if destinations[name] is not None:
                    view = memoryview(chunk)
                    while view:
                        view = view[os.write(destinations[name], view):]
        proc.wait(timeout=1)
        if proc.returncode != 0:
            raise RuntimeError(f"STOP_CHILD_EXIT {label}: {proc.returncode}")
        if not group_clear(proc.pid):
            raise RuntimeError(f"STOP_GROUP_SURVIVOR after {label}")
        return bytes(buffers["stdout"]), bytes(buffers["stderr"])
    except BaseException:
        stop_group(proc)
        raise
    finally:
        selector.close()
        proc.stdout.close()
        proc.stderr.close()


def helper_text(argv):
    stdout, stderr = bounded_process(argv, timeout=5, stdout_cap=65536,
                                     stderr_cap=8192, label="metadata-helper")
    if stderr:
        raise RuntimeError(f"STOP_METADATA_STDERR: {argv[0]}")
    return stdout.decode("utf-8", "strict")


def _clone_tree_held(src, dst, scratch, label, deadline, parent_fd):
    """Only /bin/cp -cRpP; no byte-copy or hardlink fallback."""
    if dst.exists() or dst.is_symlink():
        raise RuntimeError(f"one-shot target exists: {dst}")
    src = check_real_directory(src)
    if src.lstat().st_dev != scratch.lstat().st_dev or dst.parent.lstat().st_dev != src.lstat().st_dev:
        raise RuntimeError("clone source/destination volume mismatch")
    before = admit(scratch, f"before {label}")
    out = dst.parent / f"{label}.cp.stdout"
    err = dst.parent / f"{label}.cp.stderr"
    for item in (out, err):
        if item.exists() or item.is_symlink():
            raise RuntimeError(f"one-shot log exists: {item}")
    stdout_fd = os.open(out.name, os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW,
                        0o600, dir_fd=parent_fd)
    try:
        stderr_fd = os.open(err.name, os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW,
                            0o600, dir_fd=parent_fd)
    except BaseException:
        os.close(stdout_fd)
        raise
    argv = ["/bin/cp", "-cRpP", str(src), str(dst)]
    sample_start = len(ACTIVE_MONITOR.samples) if ACTIVE_MONITOR else 0
    env = dict(os.environ)
    env["LC_ALL"] = "C"
    try:
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            raise RuntimeError(f"STOP_DEADLINE before {label}")
        bounded_process(argv, timeout=min(120.0, remaining), stdout_cap=MIB,
                        stderr_cap=MIB, stdout_fd=stdout_fd, stderr_fd=stderr_fd,
                        scratch=scratch, label=label, env=env)
    finally:
        os.close(stdout_fd)
        os.close(stderr_fd)
    after = admit(scratch, f"after {label}")
    return {"argv": argv, "sourceDevice": src.lstat().st_dev,
            "destinationDevice": dst.lstat().st_dev, "freeBefore": before,
            "freeAfter": after, "allocatedDelta": before - after,
            "samples": ([[time.monotonic_ns(), before]] +
                        (ACTIVE_MONITOR.samples[sample_start:] if ACTIVE_MONITOR else []) +
                        [[time.monotonic_ns(), after]]), "stdoutSha256": sha_file(out),
            "stderrSha256": sha_file(err)}


def clone_tree(src, dst, scratch, label, deadline):
    with held_chain(dst.parent) as parent_fd:
        return _clone_tree_held(src, dst, scratch, label, deadline, parent_fd)


def require_equal(source_inventory, copy_inventory, *, source=False):
    left = comparable(source_inventory["rows"], source=source)
    right = comparable(copy_inventory["rows"], source=source)
    if left != right:
        raise RuntimeError("source/copy path, byte or metadata divergence")


def dependency_manifest_guard(binding, deps_inventory):
    path = Path(binding["frozenDependencyManifestPath"])
    if path.is_symlink() or sha_file(path) != binding["frozenDependencyManifestSha256"]:
        raise RuntimeError("frozen dependency manifest bytes drift")
    manifest = json.loads(path.read_text())
    rows = comparable(deps_inventory["rows"])
    if (manifest.get("decision") != "INDEPENDENTLY_FROZEN_DEPENDENCY_ROWS" or
            manifest.get("historicalMetadataDigestSha256") != DEPENDENCY_HISTORICAL_DIGEST or
            manifest.get("rows") != rows or
            manifest.get("rowsSha256") != normalized_digest(deps_inventory["rows"])):
        raise RuntimeError("frozen dependency path/content/mode/link manifest mismatch")
    if (len(rows) != DEPENDENCY_ENTRIES or
            sum(row.get("size", 0) for row in rows) != DEPENDENCY_BYTES or
            sum(row["kind"] == "link" for row in rows) != 24):
        raise RuntimeError("dependency roster count/bytes/links mismatch")
    return manifest["rowsSha256"]


def inventory_summary(scan, *, source=False):
    rows = scan["rows"]
    return {"rootIdentity": scan["rootIdentity"],
            "rowsSha256": normalized_digest(rows, source=source),
            "directories": sum(row["kind"] == "dir" for row in rows),
            "regularFiles": sum(row["kind"] == "file" for row in rows),
            "regularBytes": sum(row.get("size", 0) for row in rows),
            "links": sum(row["kind"] in ("link", "source-dependency-link") for row in rows),
            "sourceDigest": source_digest(rows) if source else None}


def _materialize_impl(binding):
    """Not authorized for real use until binding and this source are reviewed."""
    required = {"designSha256": DESIGN_SHA, "designReviewSha256": DESIGN_REVIEW_SHA,
                "historicalCommit": H_COMMIT, "bridgeTree": H_BRIDGE_TREE,
                "historicalSourceDigest": H_SOURCE_DIGEST,
                "historicalDependencyDigest": DEPENDENCY_HISTORICAL_DIGEST,
                "r5PlanSha256": R5_PLAN_SHA, "r5ReviewSha256": R5_REVIEW_SHA,
                "r1RefineSha256": R1_REFINE_SHA,
                "r2RefineSha256": R2_REFINE_SHA,
                "r3RefineSha256": R3_REFINE_SHA,
                "authority": "INDEPENDENT_EXACT_ACCEPT"}
    for key, value in required.items():
        if binding.get(key) != value:
            raise RuntimeError(f"missing/wrong authority {key}")
    parent = Path(binding["oneShotParent"])
    scratch = check_real_directory(parent.parent)
    if SCRATCH_ROOT not in parent.parents or parent == SCRATCH_ROOT:
        raise RuntimeError("one-shot parent outside studio scratch")
    if parent.exists() or parent.is_symlink() or not str(parent).startswith(str(scratch) + os.sep):
        raise RuntimeError("one-shot parent exists or escapes scratch")
    h = check_real_directory(binding["protectedH"])
    deps = check_real_directory(binding["productionDependencies"])
    if len({str(p) for p in (parent, h, deps)}) != 3:
        raise RuntimeError("source/target overlap")
    for protected in (h, deps, PRODUCTION):
        if str(parent).startswith(str(protected) + os.sep):
            raise RuntimeError("one-shot target overlaps protected source")
    deadline = time.monotonic() + min(float(binding["wholeSeconds"]), 600.0)
    with ExitStack() as held:
        held.enter_context(held_chain(scratch))
        held.enter_context(held_chain(h))
        held.enter_context(held_chain(deps))
        guard_authority(binding)
        admit(scratch, "before source scan")
        h_before = inventory(h, source=True, deadline=deadline)
        deps_before = inventory(deps, deadline=deadline)
        if source_digest(h_before["rows"]) != {"count": H_FILES, "bytes": H_BYTES, "digest": H_SOURCE_DIGEST}:
            raise RuntimeError("historical H source proof mismatch")
        if (sum(r["kind"] == "dir" for r in h_before["rows"]) != H_DIRECTORIES
                or len(h_before["rows"]) != H_DIRECTORIES + H_FILES + 1):
            raise RuntimeError("historical H directory/entry roster mismatch")
        dependency_digest = dependency_manifest_guard(binding, deps_before)
        if [r["path"] for r in h_before["rows"] if r["kind"] in ("link", "source-dependency-link")] != ["node_modules"]:
            raise RuntimeError("H dependency link roster mismatch")
        if next(r["target"] for r in h_before["rows"] if r["kind"] == "source-dependency-link") != str(deps):
            raise RuntimeError("historical H dependency link target mismatch")
        if h.lstat().st_dev != scratch.lstat().st_dev or deps.lstat().st_dev != scratch.lstat().st_dev:
            raise RuntimeError("clone source/destination volume mismatch")
        admit(scratch, "before one-shot parent")
        parent.mkdir(mode=0o700)
        result = {"schema": "1370-c0-h-r4-materializer-proposal-r4",
                  "status": "UNREVIEWED_OUTPUT_STOP", "designSha256": DESIGN_SHA,
                  "r5PlanSha256": R5_PLAN_SHA, "dependencyRowsSha256": dependency_digest,
                  "sourceBefore": inventory_summary(h_before, source=True),
                  "dependencyBefore": inventory_summary(deps_before),
                  "arms": {}}
        prior_source = None
        prior_dependencies = None
        for arm in ("control", "instrumented"):
            base = parent / arm
            base.mkdir(mode=0o700)
            dep_copy = base / "dependencies"
            source_copy = base / "source"
            dep_clone = clone_tree(deps, dep_copy, scratch, f"{arm}-dependencies", deadline)
            source_clone = clone_tree(h, source_copy, scratch, f"{arm}-source", deadline)
            link = source_copy / "node_modules"
            if not link.is_symlink() or os.readlink(link) != str(deps):
                raise RuntimeError("cloned H dependency link changed")
            link.unlink()
            link.symlink_to(dep_copy)
            admit(scratch, f"after {arm} dependency link relocation")
            dep_readback = inventory(dep_copy, deadline=deadline)
            source_readback = inventory(source_copy, source=True, deadline=deadline)
            require_equal(deps_before, dep_readback)
            require_equal(h_before, source_readback, source=True)
            require_distinct_inodes(deps_before, dep_readback)
            require_distinct_inodes(h_before, source_readback)
            if prior_source is not None:
                require_distinct_inodes(prior_source, source_readback)
                require_distinct_inodes(prior_dependencies, dep_readback)
            if os.readlink(link) != str(dep_copy) or source_digest(source_readback["rows"])["digest"] != H_SOURCE_DIGEST:
                raise RuntimeError("isolated source/link readback mismatch")
            admit(scratch, f"after {arm} full readback")
            result["arms"][arm] = {"source": inventory_summary(source_readback, source=True),
                                   "dependencies": inventory_summary(dep_readback),
                                   "cloneSteps": [dep_clone, source_clone]}
            prior_source, prior_dependencies = source_readback, dep_readback
        if inventory(h, source=True, deadline=deadline) != h_before or inventory(deps, deadline=deadline) != deps_before:
            raise RuntimeError("protected H or production dependency drift")
        guard_authority(binding)
        admit(scratch, "materializer postflight")
        result["status"] = "MATERIALIZED_PENDING_INDEPENDENT_OBSERVED_REVIEW"
        return result


def materialize(binding):
    global ACTIVE_MONITOR
    if ACTIVE_MONITOR is not None:
        raise RuntimeError("materializer already active")
    validate_experiment(binding)
    parent = Path(binding["oneShotParent"])
    scratch = check_real_directory(parent.parent)
    if SCRATCH_ROOT not in parent.parents or parent == SCRATCH_ROOT:
        raise RuntimeError("one-shot parent outside studio scratch")
    admit(scratch, "before monitor start")
    monitor = DiskMonitor(scratch).start()
    ACTIVE_MONITOR = monitor
    try:
        result = _materialize_impl(binding)
        monitor.check()
    finally:
        ACTIVE_MONITOR = None
        monitor.close()
    result["diskMonitorSamples"] = monitor.samples
    return result
