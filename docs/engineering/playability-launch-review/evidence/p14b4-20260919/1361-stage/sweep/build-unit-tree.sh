#!/usr/bin/env bash
# 1361-N authoring trees: usage build-unit-tree.sh <unit> [patch ...]. Builds S/1361-sweep/<unit>/tree: an archive of the
# repo's HEAD (src, tests, ui, bridge, generated, scripts, configs) with docs, node_modules, art and tools as links;
# tests/fixtures a real dir of per-entry links with bridge-contract-union-fixtures.ts copied; a git repo with commit
# "base", then the production patch through p15c-c-r1 committed as "production", then each extra patch committed.
# Runs no node. Writes only under S/1361-sweep/<unit>/.
set -u -o pipefail
R=/Users/zacheryspector/The-Movies-headless-program
EREL=docs/engineering/playability-launch-review/evidence/p14b4-20260919
U=${1:?unit}; shift
T=/Users/zacheryspector/studio-scratch/1361-sweep/$U/tree
PROD=$R/$EREL/1361-stage/prod/1361-p15c-production-c-r1.patch
[ "$(shasum -a 256 "$PROD" | cut -c1-64)" = a7a70ad959ee2eb7fc7f0e7200ee693f3a28edfb66ffbc8fc327fd077ef7c221 ] || { echo "STOP: production patch hash differs"; exit 2; }
[ -e "$T" ] && { echo "STOP: $T exists"; exit 2; }
BASE=$(git -C "$R" rev-parse HEAD)
[ "$(git -C "$R" rev-parse "$BASE:src")" = 762d8e094caba998b2e5458f0999e8421d90a835 ] || { echo "STOP: HEAD's src is not the writer's base"; exit 2; }
mkdir -p "$T" || exit 2
git -C "$R" archive "$BASE" src bridge ui generated scripts package.json package-lock.json tsconfig.json tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md | tar -x -C "$T" || exit 2
git -C "$R" archive "$BASE" tests ':!tests/fixtures' | tar -x -C "$T" || exit 2
for d in docs node_modules art tools; do ln -s "$R/$d" "$T/$d"; done
mkdir -p "$T/tests/fixtures" && for e in "$R"/tests/fixtures/*; do b=$(basename "$e"); [ "$b" = bridge-contract-union-fixtures.ts ] || ln -s "$e" "$T/tests/fixtures/$b"; done
cp "$R/tests/fixtures/bridge-contract-union-fixtures.ts" "$T/tests/fixtures/" || exit 2
G="git -C $T -c user.name=parent -c user.email=parent@local"
$G init -q && printf 'node_modules\nart\ntools\ndocs\ntests/fixtures/\ndist/\n' > "$T/.git/info/exclude" && $G add -A . && $G commit -q -m "base $BASE" && $G tag base || exit 2
$G apply --index "$PROD" && $G commit -q -m "production through p15c-c-r1 (1361-stage/prod)" && $G tag production || { echo "STOP: production apply failed"; exit 1; }
for p in "$@"; do $G apply --index "$p" && $G commit -q -m "apply $(basename "$p")" || { echo "STOP: $p does not apply"; exit 1; }; done
echo "tree $T at $($G rev-parse --short HEAD) on repo $BASE; status [$($G status --porcelain | tr '\n' ' ')]"
