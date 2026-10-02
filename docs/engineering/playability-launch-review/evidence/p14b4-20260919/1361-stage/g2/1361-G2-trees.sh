#!/usr/bin/env bash
# 1361-G2: build the three G2 trees under S/1361-g2/run (1361-G2-notes.md, "Run"). Runs no node, vitest or tsc.
#   usage: bash 1361-G2-trees.sh <frozen P15A.1 (c) tag or sha in S/1361-prod/tree>
# Each tree is a git archive (src, generated, package files, tsconfig, vitest.config.ts, tests without fixtures) with
# node_modules linked to the repository's and the two G2 files copied into tests/. The K4 tree is the candidate with
# one line changed: SHARED_MARKET_FACTOR_MAX_PENALTY 0.25 -> 0 (1355-A:168). Nothing is written outside S/1361-g2/run.
set -u -o pipefail
R=/Users/zacheryspector/The-Movies-headless-program
P=/Users/zacheryspector/studio-scratch/1361-prod/tree
G=/Users/zacheryspector/studio-scratch/1361-g2
X=$G/run
CAND=${1:?usage: bash 1361-G2-trees.sh <frozen P15A.1 (c) tag or sha in $P>}
stop() { echo "STOP: $1"; exit 3; }
[ -e "$X" ] && stop "$X exists; remove it or build elsewhere"
CONTROL_SHA=$(git -C "$R" rev-parse --verify 'e4be3e5c^{commit}') || stop "e4be3e5c is not in $R"
CAND_SHA=$(git -C "$P" rev-parse --verify "$CAND^{commit}") || stop "$CAND is not in $P"
build() { # <repository> <sha> <role>
  local tree=$X/$3/tree
  mkdir -p "$tree" || stop "mkdir $tree"
  git -C "$1" archive "$2" src generated package.json package-lock.json tsconfig.json tsconfig.src.json vitest.config.ts | tar -x -C "$tree" || stop "archive $3"
  git -C "$1" archive "$2" tests ':!tests/fixtures' | tar -x -C "$tree" || stop "archive $3 tests"
  ln -s "$R/node_modules" "$tree/node_modules" || stop "link $3 node_modules"
  cp "$G/1361-G2-probe.test.ts" "$G/1361-G2-report.test.ts" "$tree/tests/" || stop "copy the G2 files into $3"
  echo "$2" > "$X/$3/HEAD"
}
build "$R" "$CONTROL_SHA" control
build "$P" "$CAND_SHA" candidate
build "$P" "$CAND_SHA" k4
python3 - "$X/k4/tree/src/core/tuning.ts" <<'PY' || stop "the K4 edit"
import sys
path = sys.argv[1]
text = open(path, encoding='utf-8', newline='').read()
old = 'SHARED_MARKET_FACTOR_MAX_PENALTY: 0.25,'
assert text.count(old) == 1, f'{old!r} appears {text.count(old)} times'
open(path, 'w', encoding='utf-8', newline='').write(text.replace(old, 'SHARED_MARKET_FACTOR_MAX_PENALTY: 0,'))
PY
diff -r "$X/candidate/tree/src" "$X/k4/tree/src" > "$X/k4/edit.diff"
[ "$(/usr/bin/grep -c '^[<>]' "$X/k4/edit.diff")" = 2 ] || stop "the K4 tree differs from the candidate in more or less than one line ($X/k4/edit.diff)"
# The decide spies read evaluate()'s three calls (notes, "decide() outcomes"). A spy sees only calls from another
# module, so each function's own module is left out and every other src/core call counts. A caller outside
# hollywoodTick.ts's four sites (:220, :233, :236, :324 at e4be3e5c) would be counted as an evaluation, so stop.
for role in control candidate; do
  { /usr/bin/grep -rnoE 'promisedCastMasks\(' "$X/$role/tree/src/core" | /usr/bin/grep -v '/src/core/promises\.ts:'
    /usr/bin/grep -rnoE '(chooseIndustryPackage|searchIndustryPackages)\(' "$X/$role/tree/src/core" | /usr/bin/grep -v '/src/core/hollywoodPolicy\.ts:'
  } > "$X/$role/decide-calls.txt"
  [ "$(wc -l < "$X/$role/decide-calls.txt" | tr -d ' ')" = 4 ] && [ "$(/usr/bin/grep -c '/src/core/hollywoodTick\.ts:' "$X/$role/decide-calls.txt")" = 4 ] \
    || stop "the $role tree calls the decide functions outside hollywoodTick.ts's four sites ($X/$role/decide-calls.txt)"
done
mkdir -p "$X/out"
shasum -a 256 "$G/1361-G2-probe.test.ts" "$G/1361-G2-report.test.ts" "$X"/*/tree/tests/1361-G2-*.test.ts > "$X/out/g2-files-sha256.txt"
echo "built: control $CONTROL_SHA, candidate and K4 $CAND_SHA; K4 edit in $X/k4/edit.diff; file hashes in $X/out/g2-files-sha256.txt"
