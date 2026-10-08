#!/usr/bin/env python3
"""UNRUN proposal: isolated 3aaf55e0 sparse source and APFS-cloned dependencies.

This file has no default run. A separately reviewed, exact filled binding is
required; this package itself does not grant execution authorization.
"""

import hashlib
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import sys
import time

SOURCE = "3aaf55e0c06c4b745b0b722cc56913050b1ee229"
EXTRA = {
    "tests/bridge-p14b5-relationships.test.ts",
    "tests/fixtures/p13a/accepted-v19.json.gz",
    "package.json",
    "package-lock.json",
}
COUNT = 176
LOGICAL_BYTES = 4803106
FLOOR = 3 * 1024**3 + 128 * 1024**2
SOURCE_PROJECTION = 64 * 1024**2
COPY_PROJECTION = 384 * 1024**2
MAX_CMD_SECONDS = 180
SPECIAL_OIDS = {
    "src/core/aging.ts": "e1b88562ded631e0142b2783555e866d4a884d04",
    "src/core/employment.ts": "e8e5acaa1e6a94ac1de7db13eb46840efb55616f",
    "src/core/hollywood.ts": "377da502bcfa55afe31c243ab0909b2c0012d269",
    "src/core/worldgen.ts": "94f83a85e1e59532013ab4735f73a67a916a5332",
    "src/core/tick.ts": "328c2e28f7e209b4ab6b96c6e59f1d1739ad0db5",
    "src/harness/p13a/fixtures.ts": "9ab3eee75b0b2b2733f350bbc3964aa5ba176de8",
    "tests/bridge-p14b5-relationships.test.ts": "0815114340a983348eae6e98c33843c32c297228",
    "tests/fixtures/p13a/accepted-v19.json.gz": "a987ecc4411c48fc8f256e81c93e9abf1fd61d6c",
}


class Stop(RuntimeError):
    pass


def require(ok, message):
    if not ok:
        raise Stop(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def file_sha(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def canonical_json(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":")).encode()


def receipt(path, digest, decision):
    require(isinstance(path, str) and Path(path).is_absolute() and
            isinstance(digest, str) and len(digest) == 64, "receipt binding absent")
    file = Path(path)
    require(file.is_file() and not file.is_symlink() and file_sha(file) == digest,
            "receipt bytes changed")
    try:
        value = json.loads(file.read_text(encoding="utf-8"))
    except (ValueError, UnicodeError) as exc:
        raise Stop("invalid receipt JSON") from exc
    require(isinstance(value, dict) and value.get("decision") == decision,
            "receipt decision mismatch")
    return value


def physical_source_paths(root):
    """Enumerate every physical non-.git checkout entry; dirs are structural only."""
    found = {}
    stack = [(root, "")]
    while stack:
        directory, prefix = stack.pop()
        with os.scandir(directory) as iterator:
            entries = sorted(iterator, key=lambda e: e.name)
        for entry in entries:
            if not prefix and entry.name in (".git", "node_modules"):
                continue
            rel = prefix + entry.name
            path = Path(entry.path)
            info = path.lstat()
            if stat.S_ISDIR(info.st_mode):
                stack.append((path, rel + "/"))
            else:
                found[rel] = {"type": "regular" if stat.S_ISREG(info.st_mode) else
                              "symlink" if stat.S_ISLNK(info.st_mode) else "special",
                              "mode": stat.S_IMODE(info.st_mode), "bytes": info.st_size,
                              "links": info.st_nlink,
                              "sha256": file_sha(path) if stat.S_ISREG(info.st_mode) else None}
    return found


def protected_snapshot(root):
    """Full physical byte inventory, including common refs/config/objects."""
    require(root.is_dir() and not root.is_symlink(), "protected root missing")
    output = {}
    stack = [(root, "")]
    while stack:
        directory, prefix = stack.pop()
        with os.scandir(directory) as iterator:
            entries = sorted(iterator, key=lambda e: e.name)
        for entry in entries:
            rel = prefix + entry.name
            path = Path(entry.path)
            info = path.lstat()
            row = {"mode": stat.S_IMODE(info.st_mode), "bytes": info.st_size}
            if stat.S_ISDIR(info.st_mode):
                row["type"] = "directory"
                stack.append((path, rel + "/"))
            elif stat.S_ISREG(info.st_mode):
                row.update(type="regular", sha256=file_sha(path))
            elif stat.S_ISLNK(info.st_mode):
                row.update(type="symlink", target=os.readlink(path))
            else:
                raise Stop("special protected entry: " + rel)
            output[rel] = row
    return sha(canonical_json(output))


def assert_no_protected_writable_fds(binding):
    """Fail closed on unreadable lsof output or a writable descriptor in either root."""
    protected = [str(Path(binding[key]).resolve()) for key in
                 ("productionRoot", "commonGitRoot")]
    raw = command([binding["lsofPath"], "-n", "-P", "-w", "-F0pfn"],
                  env=clean_env())
    current_pid = current_fd = None
    for field in raw.split(b"\0"):
        field = field.lstrip(b"\n")
        if not field:
            continue
        kind, value = field[:1], field[1:]
        if kind == b"p":
            current_pid = value.decode("ascii", "strict")
            current_fd = None
        elif kind == b"f":
            current_fd = value.decode("ascii", "replace")
        elif kind == b"n" and current_fd and current_fd[-1:] in ("u", "w"):
            name = value.decode("utf-8", "surrogateescape")
            for root in protected:
                if name == root or name.startswith(root + os.sep):
                    raise Stop(f"protected writable FD: pid {current_pid} fd {current_fd}")


def command(argv, *, cwd=None, data=None, env=None):
    p = subprocess.run(argv, cwd=cwd, input=data, stdout=subprocess.PIPE,
                       stderr=subprocess.PIPE, env=env, close_fds=True,
                       timeout=MAX_CMD_SECONDS, check=False)
    require(p.returncode == 0, f"command stopped: {argv[0]} exit {p.returncode}; stderr sha {sha(p.stderr)}")
    return p.stdout


def clean_env():
    # Inherited Git configuration, alternate object stores, and hooks must not
    # influence this isolated repository. The filled binding pins executables.
    keep = ("PATH", "TMPDIR", "LANG", "LC_ALL", "USER", "LOGNAME", "HOME")
    env = {k: os.environ[k] for k in keep if k in os.environ}
    env.update(GIT_CONFIG_NOSYSTEM="1", GIT_CONFIG_GLOBAL="/dev/null",
               GIT_TERMINAL_PROMPT="0", GIT_OPTIONAL_LOCKS="0")
    return env


def git(binding, root, *args, data=None):
    return command([binding["gitPath"], "-c", "gc.auto=0", "-c",
                    "core.hooksPath=/dev/null", "-C", str(root), *args],
                   data=data, env=clean_env())


def free_bytes(path):
    return shutil.disk_usage(path).free


def space_guard(path, projected=0):
    free = free_bytes(path)
    require(free - projected >= FLOOR,
            f"space floor: free {free}, projection {projected}, required {FLOOR}")
    return free


def allocated_bytes(path, binding):
    raw = command([binding["duPath"], "-sk", str(path)], env=clean_env())
    try:
        return int(raw.split(b"\t", 1)[0]) * 1024
    except (IndexError, ValueError) as exc:
        raise Stop("invalid du allocation report") from exc


def safe_parent(path, trusted_parent):
    require(path.is_absolute() and path.parent == trusted_parent,
            "target must be one unique immediate scratch child")
    require(not path.exists() and not path.is_symlink(), "scratch target exists")
    require(trusted_parent.is_dir() and not trusted_parent.is_symlink(),
            "scratch parent changed")
    require(trusted_parent.resolve() == trusted_parent, "scratch parent resolves elsewhere")


def real_within(path, root):
    try:
        path.resolve(strict=True).relative_to(root.resolve(strict=True))
        return True
    except (ValueError, FileNotFoundError, RuntimeError):
        return False


def acl_text(path, binding):
    # One path per call makes the ACL report unambiguous even for unusual names.
    # -P preserves the link itself; -e prints extended ACL entries on macOS.
    result = command([binding["lsPath"], "-Pled", str(path)], env=clean_env())
    lines = result.decode("utf-8", "surrogateescape").splitlines()
    require(lines, "missing ACL report")
    # The first line includes the local path and can differ across the clone.
    # Retain its ACL '+' marker, then exact numbered ACL lines.
    mode = lines[0].split(maxsplit=1)[0]
    return [mode[-1:] if mode.endswith("+") else "no-acl", *lines[1:]]


def inventory(root, binding):
    require(root.is_dir() and not root.is_symlink(), "inventory root is not a directory")
    root_st = root.lstat()
    records = {".": {"type": "directory", "mode": stat.S_IMODE(root_st.st_mode),
                      "acl": acl_text(root, binding),
                      "xattrs": {name: sha(os.getxattr(root, name, follow_symlinks=False))
                                 for name in sorted(os.listxattr(root, follow_symlinks=False))}}}
    stack = [(root, "")]
    while stack:
        directory, prefix = stack.pop()
        with os.scandir(directory) as it:
            entries = sorted(it, key=lambda x: x.name)
        for entry in entries:
            rel = prefix + entry.name
            require("\n" not in rel and "\r" not in rel, "unsupported newline in dependency path")
            path = Path(entry.path)
            st = path.lstat()
            mode = stat.S_IMODE(st.st_mode)
            base = {"mode": mode, "acl": acl_text(path, binding),
                    "xattrs": {name: sha(os.getxattr(path, name, follow_symlinks=False))
                               for name in sorted(os.listxattr(path, follow_symlinks=False))}}
            if stat.S_ISDIR(st.st_mode):
                base["type"] = "directory"
                stack.append((path, rel + "/"))
            elif stat.S_ISREG(st.st_mode):
                require(st.st_nlink == 1, f"hardlink in tree: {rel}")
                base.update(type="regular", bytes=st.st_size, sha256=file_sha(path), inode=st.st_ino)
            elif stat.S_ISLNK(st.st_mode):
                target = os.readlink(path)
                require(not os.path.isabs(target), f"absolute link: {rel}")
                require(real_within(path, root), f"escaping or broken link: {rel}")
                base.update(type="symlink", target=target)
            else:
                raise Stop(f"special dependency entry: {rel}")
            records[rel] = base
    return records


def comparable(records):
    return {p: {k: v for k, v in row.items() if k != "inode"}
            for p, row in records.items()}


def require_independent_inodes(source, copied):
    require(set(source) == set(copied), "dependency entry set changed")
    for path, row in source.items():
        if row["type"] == "regular":
            require(row["inode"] != copied[path]["inode"],
                    f"clone shares inode: {path}")


def parse_tree(raw):
    rows = {}
    for item in raw.split(b"\0"):
        if not item:
            continue
        meta, path = item.split(b"\t", 1)
        mode, kind, oid = meta.decode("ascii").split(" ")
        name = path.decode("utf-8", "surrogateescape")
        require(name.startswith("src/") or name in EXTRA, f"extra tree path: {name}")
        require(mode == "100644" and kind == "blob", f"bad source mode: {name}")
        require(".." not in Path(name).parts and not name.startswith("/"), "unsafe source path")
        rows[name] = oid
    require(len(rows) == COUNT and EXTRA.issubset(rows), "wrong source path count/set")
    require(len([n for n in rows if n.startswith("src/")]) == 172,
            "wrong src path count")
    require(all(rows.get(n) == oid for n, oid in SPECIAL_OIDS.items()),
            "eight witness source OIDs differ")
    return rows


def write_exclusive(path, data, mode=0o644):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, mode)
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(data)
            f.flush()
            os.fsync(f.fileno())
    except BaseException:
        path.unlink(missing_ok=True)
        raise


def assert_executable(path, expected_sha):
    require(path.is_file() and not path.is_symlink(), f"executable missing: {path}")
    require(os.access(path, os.X_OK) and file_sha(path) == expected_sha,
            f"executable pin mismatch: {path}")


def validate_binding(binding):
    require(binding.get("status") == "REVIEWED_FILLED_UNRUN" and
            binding.get("executionAuthorization") is True,
            "reviewed exact binding required")
    require(binding.get("sourceSha") == SOURCE and
            binding.get("designReceiptSha256") == "27a5f1501ac3ee92d5b5f2e6ceb59dcd389d74c9fa62714c361feeddd2951b55" and
            binding.get("feasibilityNoteSha256") == "20e4fd091cf42af4c99c5be2dbef76c13beea4790845b491403f713ceab2f941",
            "design/source role mismatch")
    require(binding.get("sourceReviewDecision") == "ACCEPT_SOURCE_ONLY_UNRUN" and
            binding.get("exactBindingReviewDecision") == "ACCEPT_EXACT_FILLED_UNRUN",
            "independent source and exact binding reviews required")
    for role in ("sourcePins", "sourceReview", "exactBindingReview", "designReceipt",
                 "feasibilityNote"):
        path = Path(binding.get(role + "Path", ""))
        digest = binding.get(role + "Sha256")
        require(path.is_absolute() and path.is_file() and not path.is_symlink() and
                isinstance(digest, str) and file_sha(path) == digest,
                f"missing or changed {role} receipt")
    pins = json.loads(Path(binding["sourcePinsPath"]).read_text(encoding="utf-8"))
    require(pins.get("status") == "SOURCE_ONLY_UNRUN" and
            pins.get("sourceSha") == SOURCE, "source pins role wrong")
    source_review = receipt(binding["sourceReviewPath"], binding["sourceReviewSha256"],
                            "ACCEPT_SOURCE_ONLY_UNRUN")
    require(source_review.get("reviewedSourcePinsSha256") == binding["sourcePinsSha256"] and
            source_review.get("designReceiptSha256") == binding["designReceiptSha256"],
            "source review role mismatch")
    design = receipt(binding["designReceiptPath"], binding["designReceiptSha256"],
                     "ACCEPT_DESIGN_ONLY")
    require(design.get("qualifiedSourceSha") == SOURCE, "design source role mismatch")
    exact = receipt(binding["exactBindingReviewPath"], binding["exactBindingReviewSha256"],
                    "ACCEPT_EXACT_FILLED_UNRUN")
    semantic = {k: v for k, v in binding.items() if k not in
                ("status", "executionAuthorization", "exactBindingReviewPath",
                 "exactBindingReviewSha256", "exactBindingReviewDecision")}
    require(exact.get("sourcePinsSha256") == binding["sourcePinsSha256"] and
            exact.get("bindingSemanticSha256") == sha(canonical_json(semantic)),
            "exact review binding identity mismatch")
    for name, digest in pins["files"].items():
        require(file_sha(Path(__file__).parent / name) == digest,
                f"materializer source drift: {name}")
    for key in ("scratchParent", "scratchRoot", "productionRoot", "dependencyRoot",
                "commonObjects", "commonGitRoot", "gitPath", "cpPath", "lsPath",
                "nodePath", "lsofPath", "duPath", "designReceiptPath", "feasibilityNotePath",
                "outputRoot"):
        require(isinstance(binding.get(key), str) and Path(binding[key]).is_absolute(),
                f"missing absolute {key}")
    require(binding["cpPath"] == "/bin/cp", "copy tool must be macOS /bin/cp")
    for name, sha_key in (("cpPath", "cpSha256"), ("gitPath", "gitSha256"),
                          ("lsPath", "lsSha256"), ("nodePath", "nodeSha256"),
                          ("lsofPath", "lsofSha256"), ("duPath", "duSha256")):
        assert_executable(Path(binding[name]), binding[sha_key])
    require(command([binding["nodePath"], "--version"], env=clean_env()).strip() ==
            b"v22.23.2", "Node runtime version mismatch")
    require(binding.get("runtimeFiles") and all(isinstance(v, str) and len(v) == 64
            for v in binding["runtimeFiles"].values()), "runtime file hashes absent")
    require(set(binding["runtimeFiles"]) == {
        "package.json", "package-lock.json", "node_modules/vite/package.json",
        "node_modules/vite-node/package.json", "node_modules/vite-node/vite-node.mjs"},
        "runtime file set wrong")
    require(Path(binding["dependencyRoot"]) == Path(binding["productionRoot"]) / "node_modules",
            "dependency root not production-local")
    require(Path(binding["commonObjects"]).is_dir(), "common object directory absent")
    require(Path(binding["commonObjects"]).parent == Path(binding["commonGitRoot"]),
            "common object role mismatch")
    require(Path(binding["productionRoot"]).is_dir(), "production root absent")
    safe_parent(Path(binding["scratchRoot"]), Path(binding["scratchParent"]))
    require(Path(binding["outputRoot"]).is_dir() and
            not Path(binding["outputRoot"]).is_symlink(), "exclusive output absent")
    require(binding.get("noExternalSameUidRenamer") is True,
            "same-UID no-renamer scope not adopted")
    require(Path(binding["scratchParent"]).stat().st_dev ==
            Path(binding["dependencyRoot"]).stat().st_dev,
            "APFS clone must stay on exact source device")


def materialize(binding):
    validate_binding(binding)
    target = Path(binding["scratchRoot"])
    parent = Path(binding["scratchParent"])
    production = Path(binding["productionRoot"])
    dep_source = Path(binding["dependencyRoot"])
    common = Path(binding["commonObjects"])
    require(file_sha(Path(binding["designReceiptPath"])) == binding["designReceiptSha256"],
            "design receipt bytes changed")
    require(file_sha(Path(binding["feasibilityNotePath"])) == binding["feasibilityNoteSha256"],
            "feasibility note bytes changed")
    require(git(binding, production, "rev-parse", "HEAD").strip().decode() ==
            binding["productionHead"], "production HEAD drift")
    prod_status_before = git(binding, production, "status", "--porcelain=v1", "-z",
                             "--untracked-files=all")
    require(not prod_status_before, "production dirty")
    common_before = protected_snapshot(Path(binding["commonGitRoot"]))
    production_before = protected_snapshot(production)
    assert_no_protected_writable_fds(binding)
    deps_before = inventory(dep_source, binding)
    deps_source_allocated = allocated_bytes(dep_source, binding)
    require(sum(v["type"] == "regular" for v in deps_before.values()) == 11060 and
            sum(v["type"] == "symlink" for v in deps_before.values()) == 24 and
            sum(v["type"] == "directory" for v in deps_before.values()) == 1401,
            "dependency source shape drift")
    pre_free = space_guard(parent, SOURCE_PROJECTION)
    target.mkdir(mode=0o700)
    try:
        command([binding["gitPath"], "init", "-q", str(target)], env=clean_env())
        gitdir = target / ".git"
        require(gitdir.is_dir() and not gitdir.is_symlink(), "scratch Git not independent")
        write_exclusive(gitdir / "objects/info/alternates", (str(common) + "\n").encode())
        (gitdir / "HEAD").write_text(SOURCE + "\n", encoding="ascii")
        # git init owns this scratch file and may precreate template comments.
        with open(gitdir / "info/exclude", "ab") as exclude:
            exclude.write(b"\nnode_modules/\n")
            exclude.flush()
            os.fsync(exclude.fileno())
        require(git(binding, target, "rev-parse", "HEAD").strip().decode() == SOURCE,
                "scratch HEAD wrong")
        raw = git(binding, target, "ls-tree", "-r", "-z", SOURCE, "--", "src",
                  *sorted(EXTRA))
        rows = parse_tree(raw)
        git(binding, target, "read-tree", SOURCE)
        all_names = git(binding, target, "ls-files", "-z")
        git(binding, target, "update-index", "--skip-worktree", "-z", "--stdin",
            data=all_names)
        source_manifest = {}
        for name, oid in sorted(rows.items()):
            data = git(binding, target, "cat-file", "blob", oid)
            calculated = hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()
            require(calculated == oid, f"Git object bytes mismatch: {name}")
            write_exclusive(target / name, data)
            source_manifest[name] = {"oid": oid, "sha256": sha(data), "bytes": len(data),
                                     "mode": "100644"}
        require(sum(v["bytes"] for v in source_manifest.values()) == LOGICAL_BYTES,
                "source logical size drift")
        checkout = physical_source_paths(target)
        require(set(checkout) == set(rows) and
                all(checkout[name] == {"type": "regular", "mode": 0o644,
                                      "bytes": item["bytes"], "links": 1,
                                      "sha256": item["sha256"]}
                    for name, item in source_manifest.items()),
                "physical sparse checkout differs")
        git(binding, target, "update-index", "--no-skip-worktree", "-z", "--stdin",
            data=b"".join(n.encode("utf-8", "surrogateescape") + b"\0" for n in sorted(rows)))
        require(not git(binding, target, "status", "--porcelain=v1", "-z",
                        "--untracked-files=all"), "scratch checkout dirty")
        source_allocated = allocated_bytes(target, binding)
        source_free = space_guard(parent, max(COPY_PROJECTION, deps_source_allocated +
                                              128 * 1024**2))
        # cp -c is mandatory: clonefile(2) error must stop. There is no ordinary
        # copy retry. Destination is absent and cp creates it under scratch.
        clone_dest = target / "node_modules"
        require(not clone_dest.exists() and not clone_dest.is_symlink(), "clone destination exists")
        command([binding["cpPath"], "-c", "-R", "-P", "-p",
                 str(dep_source), str(clone_dest)], env=clean_env())
        post_free = space_guard(parent)
        copied_allocated = allocated_bytes(clone_dest, binding)
        require(copied_allocated <= deps_source_allocated + 64 * 1024**2,
                "copied dependency allocation exceeds conservative bound")
        deps_after = inventory(clone_dest, binding)
        require(comparable(deps_before) == comparable(deps_after),
                "dependency clone bytes/mode/ACL/xattr/link mismatch")
        require_independent_inodes(deps_before, deps_after)
        require(comparable(deps_before) == comparable(inventory(dep_source, binding)),
                "production dependency source changed during clone")
        runner = clone_dest / ".bin/vite-node"
        require(runner.is_symlink() and os.readlink(runner) ==
                "../vite-node/vite-node.mjs" and real_within(runner, clone_dest),
                "vite-node runner redirection")
        for name, expected in binding["runtimeFiles"].items():
            require(file_sha(target / name) == expected,
                    f"runtime file byte mismatch: {name}")
        for name, item in source_manifest.items():
            path = target / name
            st = path.lstat()
            require(stat.S_ISREG(st.st_mode) and stat.S_IMODE(st.st_mode) == 0o644 and
                    st.st_nlink == 1 and st.st_size == item["bytes"] and
                    file_sha(path) == item["sha256"], f"checkout byte drift: {name}")
        require(git(binding, target, "rev-parse", "HEAD").strip().decode() == SOURCE and
                not git(binding, target, "status", "--porcelain=v1", "-z",
                        "--untracked-files=all"), "scratch source drift")
        require(git(binding, production, "rev-parse", "HEAD").strip().decode() ==
                binding["productionHead"] and
                git(binding, production, "status", "--porcelain=v1", "-z",
                    "--untracked-files=all") == prod_status_before,
                "production drift")
        require(physical_source_paths(target) == checkout, "physical checkout postflight drift")
        require(protected_snapshot(Path(binding["commonGitRoot"])) == common_before,
                "common protected Git bytes drift")
        require(protected_snapshot(production) == production_before,
                "production protected bytes drift")
        assert_no_protected_writable_fds(binding)
        index_flags = git(binding, target, "ls-files", "-v", "-z")
        index_records = {}
        for raw_flag in (x for x in index_flags.split(b"\0") if x):
            require(len(raw_flag) >= 3 and raw_flag[1:2] == b" ",
                    "invalid sparse index flag")
            name = raw_flag[2:].decode("utf-8", "surrogateescape")
            require(name not in index_records, "duplicate sparse index entry")
            index_records[name] = chr(raw_flag[0])
        full_roster = set(x.decode("utf-8", "surrogateescape") for x in
                          all_names.split(b"\0") if x)
        require(set(index_records) == full_roster and
                {name for name, flag in index_records.items() if flag == "S"} ==
                full_roster - set(rows) and
                all(index_records[name] != "S" for name in rows),
                "sparse index skip flags differ")
        git_config = git(binding, target, "config", "--local", "--list", "-z")
        return {"status": "MATERIALIZED_UNREVIEWED_UNRUN", "sourceSha": SOURCE,
                "sourceManifest": source_manifest, "dependencyManifest": deps_after,
                "physicalCheckout": checkout,
                "detachedHead": (gitdir / "HEAD").read_text(encoding="ascii").strip(),
                "indexFlags": index_records, "indexFlagsSha256": sha(index_flags),
                "gitConfigSha256": sha(git_config),
                "sparsePatterns": "manual-index-skip-worktree: all except frozen 176 paths",
                "freeBefore": pre_free,
                "freeAfterSource": source_free, "freeAfter": post_free,
                "physicalFreeDelta": pre_free - post_free,
                "sourceAllocated": source_allocated,
                "dependencySourceAllocated": deps_source_allocated,
                "dependencyCopiedAllocated": copied_allocated,
                "protectedCommonSha256": common_before,
                "protectedProductionSha256": production_before,
                "scratchRoot": str(target), "monotonicEnd": time.monotonic()}
    except BaseException:
        # Cleanup is limited to the unique scratch root owned by this call.
        # A separate observer must verify no survivor retains an open FD.
        shutil.rmtree(target)
        require(not target.exists(), "cleanup survivor")
        raise


def main():
    require(len(sys.argv) == 2, "one exact binding JSON path required")
    binding_path = Path(sys.argv[1])
    require(binding_path.is_file() and not binding_path.is_symlink(), "binding absent")
    binding = json.loads(binding_path.read_text(encoding="utf-8"))
    result = materialize(binding)
    print(json.dumps(result, sort_keys=True, separators=(",", ":")))


if __name__ == "__main__":
    try:
        main()
    except (Stop, OSError, subprocess.TimeoutExpired, KeyError, ValueError,
            TypeError, UnicodeError) as exc:
        print(f"STOP:{type(exc).__name__}:{exc}", file=sys.stderr)
        sys.exit(2)
