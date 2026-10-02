#!/usr/bin/env bash
# 1361-F ruling 1: the production writer's scratch tree, a git repository from an archive of the repo's HEAD.
# node_modules, art and tools are links; tests/fixtures and the E directory are real directories of per-entry links;
# bridge-contract-union-fixtures.ts is a real copy (memory scratch-tree-fixture-links). Tag `base` marks the archive.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
EREL=docs/engineering/playability-launch-review/evidence/p14b4-20260919
T=/Users/zacheryspector/studio-scratch/1361-prod/tree
[ -e "$T" ] && { echo "tree exists"; exit 2; }
BASE=$(git -C "$R" rev-parse HEAD)
mkdir -p "$T"
git -C "$R" archive "$BASE" src bridge ui generated scripts package.json package-lock.json tsconfig.json tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md | tar -x -C "$T"
git -C "$R" archive "$BASE" tests ':!tests/fixtures' | tar -x -C "$T"
for d in node_modules art tools; do ln -s "$R/$d" "$T/$d"; done
mkdir -p "$T/tests/fixtures" && for e in "$R"/tests/fixtures/*; do b=$(basename "$e"); [ "$b" = bridge-contract-union-fixtures.ts ] || ln -s "$e" "$T/tests/fixtures/$b"; done
cp "$R/tests/fixtures/bridge-contract-union-fixtures.ts" "$T/tests/fixtures/bridge-contract-union-fixtures.ts"
mkdir -p "$T/$EREL" && for e in "$R/$EREL"/*; do ln -s "$e" "$T/$EREL/$(basename "$e")"; done
cd "$T" || exit 2
printf 'node_modules\nart\ntools\ndocs/\ntests/fixtures/\n' > .git-info-exclude
git init -q && mv .git-info-exclude .git/info/exclude
git -c user.name=parent -c user.email=parent@local add -A . && git -c user.name=parent -c user.email=parent@local commit -q -m "base: archive of $BASE (source and tests; fixtures and E are links)" && git tag base
echo "tree at $T, base $(git rev-parse --short HEAD) from repo $BASE; src tree $(git -C "$R" rev-parse "$BASE:src") vs tree $(git rev-parse HEAD:src)"
