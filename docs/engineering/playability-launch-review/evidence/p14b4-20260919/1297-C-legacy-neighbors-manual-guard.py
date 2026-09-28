"""Fixed 1298 manual companion. Parent execution only, after independent review.

Usage from repository root: python3 <this file> pre|post
Require P14_NEIGHBORS_EXPECTED_HEAD and P14_NEIGHBORS_GUARD_SHA256.
Never enumerate/read fixture payloads outside the seven fixed P14 paths below.
This supplements the bounded source guard; it does not execute the test command.
"""
from pathlib import Path
import datetime
import gzip
import hashlib
import json
import os
import re
import subprocess
import sys

E = "docs/engineering/playability-launch-review/evidence/p14b4-20260919/"
SELF = E + "1297-C-legacy-neighbors-manual-guard.py"
MANIFEST = E + "1297-legacy-neighbors-manifest.json"
GATE = "1298-legacy-neighbors-runtime"
EXCLUDED = ["tests/fixtures/", "ui/e2e/", "ui/public/"]
SOURCE = ["src", "bridge", "tests", "ui", "generated", "scripts", "package.json", "package-lock.json",
          "vitest.config.ts", "vitest.workspace.ts", "tsconfig.json", "tsconfig.bridge.json", "tsconfig.src.json"]
FILES = [{'path': 'tests/p14b4-d3-matching.test.ts', 'bytes': 6210, 'sha256': '31eefcc27339d8a518146256e474c1eb863b16f8b26b5b0044f30a830bfd0519'}, {'path': 'tests/p14b3-rule-revision.test.ts', 'bytes': 17872, 'sha256': 'fec9711ce1dd11467905cb421d59bb10495d40d0b183b9fa9aad353f0e752699'}, {'path': 'src/harness/p13a/fixtures.ts', 'bytes': 2130, 'sha256': 'f9d07ff10728ef42aa4973e97880e2300b9f29c32db3cc3b4bd6e4cdbd01f6d5'}, {'path': 'vitest.workspace.ts', 'bytes': 1228, 'sha256': '2bb01ef4b7f9f02877e42b425e43f40e3905be769cd6f091cf61a3275563b446'}, {'path': 'vitest.config.ts', 'bytes': 176, 'sha256': '2939ba611a5c025c2974043c98c06af10aadd3065925103d3f506bd1f1d07faa'}, {'path': 'tests/fixtures/p14/genuine-v29-pre-b3-evaluator1/MANIFEST.json', 'bytes': 7195, 'sha256': '9e56cfe4202f6bc18d0952cee09514149dec30a7b74ea8f8fe202c2e86a221b3'}, {'path': 'tests/fixtures/p14/genuine-v29-pre-b3-evaluator1/genuine-v29-evaluator1-current-p1.json.gz', 'bytes': 82607, 'sha256': 'cadbbd41271b820a466d5d9114e198f7e44b4ff0c801df68fa0cbe69f677c1d2', 'raw': {'bytes': 675654, 'sha256': '78decd6e96938facc2b9e20e433c44fcae4e998402d78be4122996d3887cdc0b'}}, {'path': 'tests/fixtures/p14/genuine-v29-pre-b3-evaluator1/genuine-v29-evaluator1-current-p1.provenance.json', 'bytes': 5013, 'sha256': '3876035b391355ea0fd86ae97270391a5b2f5266b32299afbddf3de28388a2b0'}, {'path': 'tests/fixtures/p14/genuine-v29-pre-b3-evaluator1/genuine-v29-evaluator1-withdrawn-p1.json.gz', 'bytes': 82566, 'sha256': 'a34114171c81c37e46ebbc8ccc5bd72995bfad42e6bb8f828eb437a67ef6c5a1', 'raw': {'bytes': 675401, 'sha256': '8ecb96f736ef81795af599e9827fba46fd98415c96a47df4d465e554ffa67586'}}, {'path': 'tests/fixtures/p14/genuine-v29-pre-b3-evaluator1/genuine-v29-evaluator1-withdrawn-p1.provenance.json', 'bytes': 5186, 'sha256': '5c14d8645a5c11b64ced9e70ef62f37db338d34974770d754fac864b0219affc'}, {'path': 'tests/fixtures/p14/genuine-v29-pre-b3-evaluator1/genuine-v29-evaluator1-role-label-refused-p1.json.gz', 'bytes': 122311, 'sha256': 'febd33112d57128c67a025237add374aeb7925d94a7d941bd4b303b3fedc0367', 'raw': {'bytes': 1121277, 'sha256': '0272162ec2746cefb1a7910487d6d30642c8743f9853d61a73ebef469a3df2b3'}}, {'path': 'tests/fixtures/p14/genuine-v29-pre-b3-evaluator1/genuine-v29-evaluator1-role-label-refused-p1.provenance.json', 'bytes': 6603, 'sha256': '4eea49c7f0b4c9b147d1276b2eeff164067e86e65e2bd9c3ee262a72e9dfabfc'}]
COMMAND = ['node_modules/.bin/vitest', 'run', '--project', 'core', '--no-file-parallelism', 'tests/p14b4-d3-matching.test.ts', 'tests/p14b3-rule-revision.test.ts', '-t', 'B4 D3 public pure matcher|pins the live evaluator generation|preserves genuine|new actual attachment']
PLAN_PINS = [
    {"path": E + "1297-A-legacy-neighbors-proposal.md", "bytes": 4397,
     "sha256": "b2e942931d527a754c9761e5df19fa778db910a692820974f0d242c1c2b0e3c4"},
    {"path": E + "1297-B-legacy-neighbors-plan-review.md", "bytes": 5249,
     "sha256": "319a76d1512e4933217275ae059a58fc928053070464cd335fecb1b78c7cbcdb"},
    {"path": E + "1297-F-parent-plan-adoption.md", "bytes": 1904,
     "sha256": "d577f3814407a3b645eb80b1548da94203e69d934e092c12549be0c586a236f2"},
    {"path": MANIFEST, "bytes": 3831,
     "sha256": "dd9843b8f4671a7b1b6411ce8dc0aad73e5ee282b128857e9fdacdce19ce86ff"},
]
RECORD_PATHS = {suffix: E + GATE + suffix for suffix in
                ["-preflight.json", "-postflight.json", ".json", ".txt", ".patch",
                 "-manual-preflight.json", "-manual-postflight.json"]}
READ_PATHS = {row["path"] for row in FILES + PLAN_PINS} | {SELF} | set(RECORD_PATHS.values())
ROOT = Path.cwd()


def require(value, message):
    if not value:
        raise RuntimeError(message)


def digest(data):
    return {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}


def read(path):
    require(path in READ_PATHS, "undeclared read: " + path)
    candidate = ROOT / path
    require(not any(p.is_symlink() for p in [candidate, *candidate.parents]), "symlink: " + path)
    return candidate.read_bytes()


def pin(path):
    return {"path": path, **digest(read(path))}


def load(path):
    return json.loads(read(path))


def git(*args):
    # Metadata only. No diff, checkout, index refresh, payload blob, or project code.
    return subprocess.check_output(["git", *args], env={**os.environ, "GIT_OPTIONAL_LOCKS": "0"}).decode()


def timestamp(value):
    return datetime.datetime.fromisoformat(value.replace("Z", "+00:00"))


def snapshot(expected_self):
    manifest = load(MANIFEST)
    # Check its literal bytes before trusting even a path or decompression instruction.
    require(pin(MANIFEST) == PLAN_PINS[-1], "manifest literal changed")
    require(manifest["files"] == FILES, "unexpected manifest file scope/pins")
    require(manifest["commands"] == {GATE: COMMAND}, "unexpected command")
    require(manifest["selection"] == {"files": 2, "selectedLeaves": 13, "filteredLeaves": 1,
            "expectedAdvances": 0, "newTestSource": False, "timeoutChanges": False}, "unexpected selection")
    require(len(FILES) == 12 and len({r["path"] for r in FILES}) == 12, "file scope cardinality")
    rows = []
    for expected in FILES + PLAN_PINS:
        actual = pin(expected["path"])
        require(actual == {k: expected[k] for k in ["path", "bytes", "sha256"]}, "pin changed: " + expected["path"])
        if "raw" in expected:
            actual["raw"] = digest(gzip.decompress(read(expected["path"])))
            require(actual["raw"] == expected["raw"], "decoded input changed: " + expected["path"])
        rows.append(actual)
    own = pin(SELF)
    require(own["sha256"] == expected_self, "companion differs from reviewed hash")
    rows.append(own)
    require(len(rows) == 17 and sum("raw" in r for r in rows) == 3, "manual scope cardinality")
    return rows


def check_bounded(record, expected_head):
    require(record["head"] == expected_head, "bounded source HEAD differs")
    require(record["sourcePaths"] == SOURCE, "unexpected bounded roots")
    scope = record["guardScope"]
    require(scope["excludedAutomaticReadPrefixes"] == EXCLUDED, "automatic exclusion policy differs")
    require(scope["authorizedManualInputsSeparate"] is True, "explicit inputs not separated")
    excluded = scope["excludedPaths"]
    require(excluded == sorted(set(excluded)), "duplicate/unsorted excluded metadata")
    require(all(p.startswith(tuple(EXCLUDED)) for p in excluded), "unexpected exclusion scope")
    require(scope["includedPathCount"] == record["sourceFiles"] > 0, "included count differs")
    require(scope["trackedPathCount"] == record["sourceFiles"] + len(excluded), "scope count differs")


def write_exclusive(path, value):
    require(path in [RECORD_PATHS["-manual-preflight.json"], RECORD_PATHS["-manual-postflight.json"]], "output scope")
    # No cleanup on failure: any partial record remains for inspection.
    with (ROOT / path).open("x", encoding="utf-8") as stream:
        json.dump(value, stream, indent=2)
        stream.write("\n")
    print(json.dumps({"output": pin(path), "gate": GATE, "mode": value["mode"]}))


def main():
    require(len(sys.argv) == 2 and sys.argv[1] in ["pre", "post"], "usage: pre|post")
    require((ROOT / SELF).resolve() == Path(__file__).resolve(), "run from repository root at the fixed script path")
    mode = sys.argv[1]
    expected_head = os.environ.get("P14_NEIGHBORS_EXPECTED_HEAD", "")
    expected_self = os.environ.get("P14_NEIGHBORS_GUARD_SHA256", "")
    require(re.fullmatch(r"[0-9a-f]{40}", expected_head) is not None, "missing exact published HEAD")
    require(re.fullmatch(r"[0-9a-f]{64}", expected_self) is not None, "missing reviewed companion SHA256")
    require(git("rev-parse", "HEAD").strip() == expected_head, "current HEAD differs")
    rows = snapshot(expected_self)
    bounded_pre = load(RECORD_PATHS["-preflight.json"])
    check_bounded(bounded_pre, expected_head)
    require(bounded_pre["remote"] == expected_head and bounded_pre["advanceCap"] == 0, "preflight remote/cap differs")
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    common = {"gate": GATE, "mode": mode, "time": now, "head": expected_head,
              "command": COMMAND, "sourceRouteAdvanceCap": 0, "advanceCounterMeasured": False,
              "expectedSelection": {"files": 2, "selected": 13, "filtered": 1},
              "manual": rows, "boundedPreflight": pin(RECORD_PATHS["-preflight.json"]),
              "automaticPayloadReads": False, "excludedAutomaticReadPrefixes": EXCLUDED}
    if mode == "pre":
        for suffix in [".json", ".txt", ".patch", "-postflight.json", "-manual-postflight.json"]:
            require(not (ROOT / RECORD_PATHS[suffix]).exists(), "run/post already exists: " + suffix)
        require(timestamp(bounded_pre["time"]) <= timestamp(now), "bounded preflight chronology")
        write_exclusive(RECORD_PATHS["-manual-preflight.json"], common)
        return

    before = load(RECORD_PATHS["-manual-preflight.json"])
    require(before["mode"] == "pre", "wrong manual prerequisite")
    for key in ["gate", "head", "command", "sourceRouteAdvanceCap", "advanceCounterMeasured",
                "expectedSelection", "manual", "boundedPreflight", "automaticPayloadReads", "excludedAutomaticReadPrefixes"]:
        require(before[key] == common[key], "manual pre/post mismatch: " + key)
    bounded_post = load(RECORD_PATHS["-postflight.json"])
    check_bounded(bounded_post, expected_head)
    for key in ["guardScope", "head", "sourcePaths", "sourceFiles", "sourceInventory", "manual", "index", "stageEntries"]:
        require(bounded_post[key] == bounded_pre[key], "bounded pre/post mismatch: " + key)
    require(bounded_post["allGuardsExact"] is True and bounded_post["fixedSource"] is True, "bounded post not complete/exact")
    record = load(RECORD_PATHS[".json"])
    require(record["command"] == COMMAND, "executed argv differs")
    require(record["sourceSha"] == record["sourceShaAtEnd"] == expected_head and record["fixedSource"] is True,
            "executed source changed")
    require(record["untrackedSource"] == record["untrackedSourceAtEnd"] == [], "untracked source")
    require(read(RECORD_PATHS[".patch"]) == b"", "nonempty recorded source diff")
    require(record["testedDiffSha256"] == record["testedDiffSha256AtEnd"] == digest(b"")["sha256"], "source diff hash differs")
    scope = record["guardScope"]
    require(scope["excludedAutomaticReadPrefixes"] == EXCLUDED and scope["authorizedManualInputsSeparate"] is True,
            "recorder exclusion policy differs")
    # Filename metadata only, filtered before comparison; no file-content inventory here.
    tracked = sorted(git("ls-files", "--", *SOURCE).splitlines())
    included = [p for p in tracked if not p.startswith(tuple(EXCLUDED))]
    require(scope["includedPaths"] == included and len(included) == bounded_pre["sourceFiles"], "recorder source scope differs")
    require([p for p in tracked if p.startswith(tuple(EXCLUDED))] == bounded_pre["guardScope"]["excludedPaths"], "excluded metadata differs")
    for key, suffix in [("record", ".json"), ("raw", ".txt"), ("patch", ".patch")]:
        require(bounded_post[key] == pin(RECORD_PATHS[suffix]), "bounded output identity differs: " + key)
    header = json.loads(read(RECORD_PATHS[".txt"]).split(b"\n", 1)[0])
    initial_keys = ["guardScope", "sourceSha", "testedDiffSha256", "untrackedSource", "command", "node",
                    "start", "end", "exitCode", "signal", "error"]
    expected_header = {key: record[key] for key in initial_keys}
    expected_header.update({"end": None, "exitCode": None, "signal": None, "error": None})
    require(header == expected_header, "raw initial record does not join closed record")
    require(record["end"] is not None and bounded_post["exitCode"] == record["exitCode"], "unclosed/inconsistent runtime")
    require(timestamp(before["time"]) <= timestamp(record["start"]) <= timestamp(record["end"])
            <= timestamp(bounded_post["time"]) <= timestamp(now), "run/manual/bounded chronology differs")
    common.update({"manualPreflight": pin(RECORD_PATHS["-manual-preflight.json"]),
                   "boundedPostflight": pin(RECORD_PATHS["-postflight.json"]),
                   "record": pin(RECORD_PATHS[".json"]), "raw": pin(RECORD_PATHS[".txt"]),
                   "patch": pin(RECORD_PATHS[".patch"]), "manualGuardsExact": True,
                   "testExitCode": record["exitCode"], "signal": record["signal"], "error": record["error"],
                   "runtimePassInferred": False})
    write_exclusive(RECORD_PATHS["-manual-postflight.json"], common)


if __name__ == "__main__":
    main()
