#!/usr/bin/env python3
"""Inspect/repair pinned instruction files and portable links, never runtime setup."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import platform
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = "docs/development/skill-sources.json"
LIMIT = 1_000_000


class SetupError(Exception):
    pass


def relative(value):
    if (not isinstance(value, str) or not value or len(value) > 512
            or not re.fullmatch(r"[A-Za-z0-9_./-]+", value)
            or "\\" in value or ":" in value
            or any(ord(c) < 32 for c in value)
            or any(p in ("", ".", "..") for p in value.split("/"))
            or PurePosixPath(value).is_absolute()):
        raise SetupError(f"Unsafe relative path: {value!r}")
    return value


def safe(root, value, final_link=False):
    if root.is_symlink():
        raise SetupError("Symlink checkout root")
    path = root
    parts = relative(value).split("/")
    for i, part in enumerate(parts):
        path = path / part
        if path.is_symlink() and not (final_link and i == len(parts) - 1):
            raise SetupError(f"Symlink in destination: {value}")
    return path


def read(path):
    if path.stat().st_size > LIMIT:
        raise SetupError(f"Oversized instruction/metadata: {path.name}")
    with path.open("rb") as f:
        data = f.read(LIMIT + 1)
    if len(data) > LIMIT:
        raise SetupError("Read limit exceeded")
    return data


def unique(pairs):
    result = {}
    for k, v in pairs:
        if k in result:
            raise SetupError(f"Duplicate metadata key: {k}")
        result[k] = v
    return result


def load(root):
    m = json.loads(read(safe(root, MANIFEST)), object_pairs_hook=unique)
    if m.get("schema_version") != 1 or m.get("scope") != "repository-instructions-only":
        raise SetupError("Unsupported instruction inventory")
    names, paths, total = set(), set(), 0
    if not 1 <= len(m["sources"]) <= 12:
        raise SetupError("Unexpected skill count")
    for s in m["sources"]:
        name = s["name"]
        if not re.fullmatch(r"[a-z0-9-]{1,64}", name) or name in names:
            raise SetupError("Invalid/duplicate skill name")
        names.add(name)
        if s.get("repository"):
            if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", s["repository"]):
                raise SetupError("Invalid repository")
            if not re.fullmatch(r"[0-9a-f]{40}", s.get("commit", "")):
                raise SetupError("Immutable 40-character source commit required")
        seen = set()
        for f in s["files"]:
            dest = relative(f["path"])
            if not dest.startswith(f".agents/skills/{name}/") or dest in paths:
                raise SetupError("Duplicate/out-of-scope destination")
            if PurePosixPath(dest).suffix != ".md" and PurePosixPath(dest).name != "LICENSE":
                raise SetupError("Only selected Markdown instructions and LICENSE files are allowed")
            paths.add(dest)
            seen.add(dest)
            if f.get("source_path"):
                relative(f["source_path"])
            if not re.fullmatch(r"[0-9a-f]{64}", f.get("sha256", "")):
                raise SetupError("Invalid instruction hash")
            if type(f.get("bytes")) is not int or not 0 < f["bytes"] <= LIMIT:
                raise SetupError("Invalid instruction size")
            total += f["bytes"]
        if f".agents/skills/{name}/SKILL.md" not in seen:
            raise SetupError("Incomplete skill: missing entrypoint")
        for dependency in s.get("required_files", []):
            if dependency not in seen:
                raise SetupError(f"Incomplete referenced resource: {dependency}")
    if len(paths) > 100 or total > 2_000_000:
        raise SetupError("Inventory exceeds bounded scope")
    return m


def matches(data, entry):
    return len(data) == entry["bytes"] and hashlib.sha256(data).hexdigest() == entry["sha256"]


def inspect(root, sources):
    observations = []
    for s in sources:
        directory = safe(root, f'.agents/skills/{s["name"]}')
        expected = {f["path"] for f in s["files"]}
        parents = {str(p) for f in expected for p in PurePosixPath(f).parents}
        pending = [directory] if directory.is_dir() else []
        count = 0
        while pending:
            with os.scandir(pending.pop()) as children:
                for child in children:
                    count += 1
                    if count > 150:
                        raise SetupError("Skill directory inspection limit exceeded")
                    value = str(Path(child.path).relative_to(root))
                    if child.is_symlink() or value not in expected | parents:
                        observations.append({"path": value, "status": "mismatched", "domain": "instructions"})
                    elif child.is_dir(follow_symlinks=False):
                        pending.append(Path(child.path))
        for f in s["files"]:
            p = safe(root, f["path"])
            state = "missing" if not p.exists() else (
                "present" if p.is_file() and matches(read(p), f) else "mismatched")
            observations.append({"path": f["path"], "status": state, "domain": "instructions"})
        link = f'.claude/skills/{s["name"]}'
        p = safe(root, link, final_link=True)
        target = f'../../.agents/skills/{s["name"]}'
        state = (("present" if p.is_dir() else "missing") if os.readlink(p) == target else "mismatched") if p.is_symlink() else (
            "mismatched" if p.exists() else "missing")
        observations.append({"path": link, "status": state, "domain": "instructions"})
    return observations


def host():
    # Version-only probes: no engine, provider, authentication or config operation.
    tools = []
    for name in ("git", "node", "npm", "claude", "codex"):
        binary = shutil.which(name)
        item = {"tool": name, "required_for_game": name in ("git", "node", "npm"),
                "status": "missing" if not binary else "present"}
        if binary:
            try:
                p = subprocess.run([binary, "--version"], capture_output=True, text=True, timeout=5)
                item["version"] = (p.stdout or p.stderr).strip()[:160]
                if p.returncode:
                    item["status"] = "unverified"
                elif name == "node":
                    item["expected_game_version"] = "v20.20.2"
                    if item["version"] != item["expected_game_version"]:
                        item["status"] = "mismatched"
            except (OSError, subprocess.TimeoutExpired):
                item["status"] = "unverified"
        tools.append(item)
    return {"os": platform.system(), "architecture": platform.machine(),
            "checkout": str(ROOT), "python": platform.python_version(), "tools": tools}


def runtime_metadata(root):
    """A few existing lockfile/installation records, not a runtime smoke or installer."""
    lock = root / "package-lock.json"
    if not lock.is_file():
        return [{"path": "package-lock.json", "status": "missing", "required_for_game": True}]
    try:
        packages = json.loads(read(lock), object_pairs_hook=unique).get("packages", {})
        if not isinstance(packages, dict):
            raise ValueError("Invalid packages metadata")
    except (OSError, ValueError, SetupError, AttributeError):
        return [{"path": "package-lock.json", "status": "mismatched",
                 "required_for_game": True, "detail": "Malformed/unreadable runtime metadata; preserve it"}]
    result = []
    for name in ("typescript", "vitest", "vite", "vite-node", "@playwright/test"):
        key = "node_modules/" + name
        package = packages.get(key)
        expected = package.get("version") if isinstance(package, dict) else None
        p = root / key / "package.json"
        value = {"path": key + "/package.json", "required_for_game": True}
        if not expected:
            value["status"] = "unverified"
        elif not p.is_file():
            value.update(status="missing", expected=expected)
        else:
            try:
                actual = json.loads(read(p), object_pairs_hook=unique).get("version")
            except (OSError, ValueError, SetupError, AttributeError):
                actual = None
            value.update(status="present" if actual == expected else "mismatched",
                         expected=expected, actual=actual)
        result.append(value)
    result.append({"path": ".venv/bin/python3", "required_for_game": True,
                   "status": "present" if (root / ".venv/bin/python3").is_file() else "missing",
                   "identity_and_packages": "unverified"})
    return result


def report(root, sources):
    observations = inspect(root, sources)
    return {"instruction_integrity": all(x["status"] == "present" for x in observations),
            "runtime_readiness": "unverified", "client_discovery": "unverified",
            **{state: [x["path"] for x in observations if x["status"] == state]
               for state in ("present", "missing", "mismatched")},
            "unverified": ["real game smoke", "fresh Claude discovery", "fresh Codex discovery"]}


def plan(root, sources):
    observations = {x["path"]: x["status"] for x in inspect(root, sources)}
    downloads, repairs, links = [], [], []
    for s in sources:
        for f in s["files"]:
            if observations[f["path"]] != "missing":
                continue
            if s.get("repository") and f.get("source_path") and not f.get("adapted"):
                downloads.append({"repository": s["repository"], "commit": s["commit"],
                                  "source": f["source_path"], "destination": f["path"],
                                  "bytes": f["bytes"], "sha256": f["sha256"]})
            else:
                repairs.append(f["path"])
        link = f'.claude/skills/{s["name"]}'
        if observations[link] == "missing" and not safe(root, link, final_link=True).is_symlink():
            links.append({"path": link, "target": f'../../.agents/skills/{s["name"]}'})
    return {"downloads": downloads, "download_bytes": sum(x["bytes"] for x in downloads),
            "links": links, "restore_from_reviewed_git_manually": repairs,
            "conflicts": [p for p, state in observations.items() if state == "mismatched"],
            "prerequisites": ["Python 3.10+ standard library", "idle non-frozen owned checkout",
                              "HTTPS only if missing unmodified upstream instructions"],
            "side_effects": ["selected missing instruction files", "individual relative Claude links"],
            "runtime_changes": False, "network_during_plan": False}


def download(source, entry):
    url = f'https://raw.githubusercontent.com/{source["repository"]}/{source["commit"]}/{entry["source_path"]}'
    with urllib.request.urlopen(url, timeout=20) as response:
        data = response.read(entry["bytes"] + 1)
    if not matches(data, entry):
        raise SetupError(f'Tampered/incomplete download: {entry["path"]}')
    return data


def apply(root, sources, fetch=download):
    def idle():
        lock = root.parent / "studio-scratch/HEAVY-LANE-LOCK"
        run = root.parent / "studio-scratch/1370-astra-takeover-20261012/p16-work-release61-generation-r6-run"
        if lock.exists() or lock.is_symlink() or run.exists() or run.is_symlink():
            raise SetupError("Recorded lane/run exists; preserve it and reconcile its required audit before apply")
    idle()
    proposed = plan(root, sources)
    if proposed["conflicts"] or proposed["restore_from_reviewed_git_manually"]:
        raise SetupError("Preserved conflicts or missing original/adapted files; see --plan")
    by_path = {f["path"]: (s, f) for s in sources for f in s["files"]}
    # Stage and verify every selected download before exposing any of them to discovery.
    with tempfile.TemporaryDirectory(prefix=".studio-instructions-", dir=root) as temporary:
        stage = Path(temporary)
        for row in proposed["downloads"]:
            source, entry = by_path[row["destination"]]
            data = fetch(source, entry)
            if not matches(data, entry):
                raise SetupError("Unverified bytes from fetch")
            p = stage / entry["path"]
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_bytes(data)
        # Recheck before writes; coordinator must still ensure a quiescent writer boundary.
        if plan(root, sources) != proposed:
            raise SetupError("Installation changed during staging; preserved it")
        idle()
        for row in proposed["downloads"]:
            dest = safe(root, row["destination"])
            dest.parent.mkdir(parents=True, exist_ok=True)
            # Exclusive creation never overwrites a late writer. A partial file is reported.
            with dest.open("xb") as f:
                f.write(read(stage / row["destination"]))
        for row in proposed["links"]:
            link = safe(root, row["path"], final_link=True)
            link.parent.mkdir(parents=True, exist_ok=True)
            link.symlink_to(row["target"], target_is_directory=True)
    return report(root, sources)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group()
    for mode in ("check", "plan", "apply"):
        modes.add_argument("--" + mode, action="store_true")
    parser.add_argument("--select", action="append", default=[], metavar="NAME")
    args = parser.parse_args(argv)
    if args.apply and not args.select:
        parser.error("--apply requires explicit --select NAME (or all)")
    try:
        inventory = load(ROOT)
        sources = inventory["sources"]
        known = {s["name"] for s in sources}
        if set(args.select) - known - {"all"}:
            raise SetupError("Unknown selection")
        if args.select and "all" not in args.select:
            sources = [s for s in sources if s["name"] in args.select]
        result = apply(ROOT, sources) if args.apply else plan(ROOT, sources) if args.plan else report(ROOT, sources)
        result["mode"] = "apply" if args.apply else "plan" if args.plan else "check"
        result["host"] = host()
        result["runtime_metadata"] = runtime_metadata(ROOT)
        print(json.dumps(result, indent=2))
        if args.plan:
            return 1 if result["conflicts"] or result["restore_from_reviewed_git_manually"] else 0
        return 0 if result["instruction_integrity"] else 1
    except (SetupError, OSError, ValueError, KeyError, TypeError, AttributeError) as error:
        print(json.dumps({"error": str(error), "runtime_readiness": "unverified",
                          "instruction_integrity": False, "recovery": "Run --check and --plan; preserve partial files"}))
        return 2


if __name__ == "__main__":
    sys.exit(main())
