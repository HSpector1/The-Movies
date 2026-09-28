"""Fresh 1300 manual companion. Written independently from the 1297-C shape with its own
constants; it does not import, modify or repurpose 1297-C, whose exact allowlist and command
stay exclusive to 1298. Parent execution only, after independent 1299-D review.

Usage from repository root: python3 <this file> pre|post
Require P14_SAVE30_EXPECTED_HEAD and P14_SAVE30_GUARD_SHA256.
Never enumerate/read fixture payloads outside the nineteen fixed P14 paths below.
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
SELF = E + "1299-C-save-compatibility-manual-guard.py"
MANIFEST = E + "1299-save-compatibility-manifest.json"
GATE = "1300-save-v30-compatibility-runtime"
EXCLUDED = ["tests/fixtures/", "ui/e2e/", "ui/public/"]
SOURCE = ["src", "bridge", "tests", "ui", "generated", "scripts", "package.json", "package-lock.json",
          "vitest.config.ts", "vitest.workspace.ts", "tsconfig.json", "tsconfig.bridge.json", "tsconfig.src.json"]
FILES = [{'path': 'tests/p14b4-save-v30-compatibility.test.ts', 'identityBasis': 'postimage (post-application; the current live file is still the preimage until the parent applies 1299-save-compatibility.patch)', 'bytes': 25226, 'sha256': 'f7f97c673abc825dcc3dd64ccde8048fcfb9c626d04368ba1b96d6d9b736cff6'}, {'path': 'src/core/save.ts', 'bytes': 474474, 'sha256': '88d1bab0db6c1b96c0895af9cdf09a353d8c16993791024bedbebd97cf3d0984'}, {'path': 'vitest.workspace.ts', 'bytes': 1228, 'sha256': '2bb01ef4b7f9f02877e42b425e43f40e3905be769cd6f091cf61a3275563b446'}, {'path': 'vitest.config.ts', 'bytes': 176, 'sha256': '2939ba611a5c025c2974043c98c06af10aadd3065925103d3f506bd1f1d07faa'}, {'path': 'tests/fixtures/p14/genuine-v29-pre-p2/MANIFEST.json', 'bytes': 39934, 'sha256': '77fa32dabb635f4fc839328ac47b07a008b8d26953cff61cf10d1a3dbbb8c1d1'}, {'path': 'tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-empty.json.gz', 'bytes': 47265, 'sha256': '93c925eb5bf5027b963bb8d5222497d7b1325979be0830ea1d4ee41fecf6ab8d', 'raw': {'bytes': 383776, 'sha256': '2ca7733a9e7d60f13c0fc46d3646e6bb4711962d394523684717a5503afaea6a'}}, {'path': 'tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-empty.provenance.json', 'bytes': 4290, 'sha256': '6ab685f8b59f6b8a61f3970c9e98a96bf90685c56d948d50c95d5315d4629588'}, {'path': 'tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-current-p1.json.gz', 'bytes': 82610, 'sha256': '4947c31baa8cf9b948edd3a75b246df56c6d924e6d624ef1e18591d977f4cca7', 'raw': {'bytes': 675654, 'sha256': '03017370f16d9d2cf211f5653650a6d41452f73f0e8b96bb4aa154a6a946f4ca'}}, {'path': 'tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-current-p1.provenance.json', 'bytes': 4956, 'sha256': '8d971552112afe2c7e02501593b4fca03cd5d72be9d0b021bda20cbb175a0d89'}, {'path': 'tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-replaced-p1.json.gz', 'bytes': 82642, 'sha256': 'bfd215039345d8ce223283f1f21e8d16f61113bb0a583bae194c6fa7067263ad', 'raw': {'bytes': 676287, 'sha256': '7d5dba1e1dcf78c361c42ccfe5637578a33e64e943662a6e201d699656eb9950'}}, {'path': 'tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-replaced-p1.provenance.json', 'bytes': 6015, 'sha256': '67b0c4f3e228e8b26818ca22363040debe8a970d6921e57614869374247ee19e'}, {'path': 'tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-withdrawn-p1.json.gz', 'bytes': 82599, 'sha256': '4b0d27c32d231b2815853343fe56e8282f9f0b766e9dc41d871f3652c60206ca', 'raw': {'bytes': 676034, 'sha256': '95a01ac1e86772fc7e0e338fdc167261a244fb09e2b15d8c73e8ba4cd7a0bae7'}}, {'path': 'tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-withdrawn-p1.provenance.json', 'bytes': 6476, 'sha256': 'fdb410af8e8510cfa61b09eaab5671a52813e1bdcf02a3bb0077c471dd7d61b0'}, {'path': 'tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-bound-open-p1.json.gz', 'bytes': 88103, 'sha256': '48ec1b4474c2d808cae8d689dde74b8695fa5a95f2b51499a384a189e7fb880e', 'raw': {'bytes': 729829, 'sha256': '9d1a1ea177f021477fbd73d401e76bbb4a0448a680253082a100c1e5246862d9'}}, {'path': 'tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-bound-open-p1.provenance.json', 'bytes': 5495, 'sha256': '18e72f4320a52739624675ca930348a4e575dafb3f565534fb7e1631de42c781'}, {'path': 'tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-kept-and-broken-p1.json.gz', 'bytes': 95800, 'sha256': '5ad270aafe913186d0570c3e876f7d76d0108ec73a600c1e9e6c8036c5851654', 'raw': {'bytes': 796283, 'sha256': 'd4ddc01941f4a814cf992ad101a3a03b0b64aaa0043953d2108fa234a0475c4c'}}, {'path': 'tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-kept-and-broken-p1.provenance.json', 'bytes': 5624, 'sha256': '4c80c68eef0f5f007663f62eb79dbfc891912931044b3901e0f51338f689a9a5'}, {'path': 'tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-rival-current-p1.json.gz', 'bytes': 122731, 'sha256': '560f645e0575a031d8a8e4b4320b968fdc2c25c264c05511f0d7cfe9494570d9', 'raw': {'bytes': 1132766, 'sha256': '4902a1b2151529336091ffa30c488f2b6f2ecd818add1596eb8f37fbc81cb555'}}, {'path': 'tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-rival-current-p1.provenance.json', 'bytes': 24691, 'sha256': '7937653154e52a26ecbcd23fef2b9d171d7fb3ea08b7060827df875bf0a49640'}, {'path': 'tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-rival-shared-take-terminal-p1.json.gz', 'bytes': 122548, 'sha256': 'c4065d9c150c7741adb0901625fae787fc6fdd2804daad4803e777df9ed0fa46', 'raw': {'bytes': 1131090, 'sha256': '51cb83b5a9cbbc8aa08fdd1e66a269d2e57ff77a98e88d08e134f5d6a16d7918'}}, {'path': 'tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-rival-shared-take-terminal-p1.provenance.json', 'bytes': 6273, 'sha256': 'b032a11a2066c286e105e2d19d72420d6628b956a1a2e218bbbf2bb16b5a1444'}, {'path': 'tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-refused-p2-count-only-current-draft.json.gz', 'bytes': 82741, 'sha256': 'dedd68ed7a975d362838dbbbc5b32016181052a62d3b82a33dea3d95a63d5497', 'raw': {'bytes': 676337, 'sha256': '7f7529cb05ab29d2b27bb2855448d2b72e69b5b222b6b351698da0ec7632a253'}}, {'path': 'tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-refused-p2-count-only-current-draft.provenance.json', 'bytes': 5239, 'sha256': 'f1dbd042b5ddb4b59880c2d80987aff464a335a773c297bea69a99e1e751ad87'}]
COMMAND = ['node_modules/.bin/vitest', 'run', '--project', 'core', '--no-file-parallelism', 'tests/p14b4-save-v30-compatibility.test.ts']
EXPECTED_SELECTION = {'files': 1, 'selectedLeaves': 36, 'filteredLeaves': 0, 'expectedAdvances': 0, 'sourceRouteAdvanceAccounting': True, 'advanceCounterMeasured': False, 'timeoutChanges': False, 'testSourceChange': "exactly the two literals: the first leaf's it-title string and its toBe argument; no other byte in the test file changes"}
PLAN_PINS = [
    {"path": E + "1299-A-save-compatibility-neighbor-proposal.md", "bytes": 14762,
     "sha256": "5a4378279fc8fccb391ddaf3d54de28b9d5ff092e90d45cce340489119bcabcb"},
    {"path": E + "1299-B-save-compatibility-neighbor-review.md", "bytes": 6346,
     "sha256": "cf7fcc5a0121dc3f3e71d4da655f91e1aaee92cfc979946ee912f4e7d4e5d352"},
    {"path": E + "1299-F-parent-plan-adoption.md", "bytes": 3146,
     "sha256": "67624fa93f23a40f4cc82a1af37c44e0b52f8c4c6421c21bb8102d1978524a4b"},
    {"path": MANIFEST, "bytes": 9568,
     "sha256": "01239bdcb25ba6238fa64089f33021c6bf0a2dccb385cb5c4ef04b0e85ce26a9"},
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
    require(manifest["sourceConfigPins"] + manifest["fixtureInputs"] == FILES, "unexpected manifest file scope/pins")
    require(manifest["commands"] == {GATE: COMMAND}, "unexpected command")
    require(manifest["selection"] == EXPECTED_SELECTION, "unexpected selection")
    require(len(FILES) == 23 and len({r["path"] for r in FILES}) == 23, "file scope cardinality")
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
    require(len(rows) == 28 and sum("raw" in r for r in rows) == 9, "manual scope cardinality")
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
    expected_head = os.environ.get("P14_SAVE30_EXPECTED_HEAD", "")
    expected_self = os.environ.get("P14_SAVE30_GUARD_SHA256", "")
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
              "expectedSelection": {"files": 1, "selected": 36, "filtered": 0},
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
