#!/usr/bin/env bash
# 1361-X: the parent's dry run of a production candidate in the writer's tree (1361-F ruling 1). Run it alone under
# lane-run.sh. usage: run-1361-X.sh <tag> <label>
# Requires the tree clean and at <tag>. Runs the root, UI and Bridge type gates (root errors split by src/ and tests/);
# the 1356 archive and isolation files; the 1356 harness alone (1356-F2:40); the 1355 and 1359 RED file sets; both
# generator checks. Writes only under S/1361-prod/x/<label>/. Never edit this file while it runs: copy it to a new name.
set -u
T=/Users/zacheryspector/studio-scratch/1361-prod/tree
TAG=${1:?tag}; LABEL=${2:?label}
X=/Users/zacheryspector/studio-scratch/1361-prod/x/$LABEL
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
[ -e "$X" ] && { echo "$X exists"; exit 2; }
mkdir -p "$X"
log() { echo "$1; $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$X/run.meta"; }
cd "$T" || exit 2
[ "$(git rev-parse HEAD)" = "$(git rev-parse "$TAG^{commit}")" ] || { log "STOP: tree HEAD is not $TAG"; exit 3; }
[ -z "$(git status --porcelain)" ] || { log "STOP: the tree is dirty"; exit 3; }
log "start at $TAG $(git rev-parse --short HEAD), node $(node --version)"
V="--project core --no-cache --reporter=default --reporter=json"
F1356="tests/p15a2-power-ranking-archive.test.ts tests/p15a2-power-ranking-archive-isolation.test.ts"
H1356="tests/p15a2-power-ranking-archive-harness.test.ts"
F1355="tests/p15a1-market-integration.test.ts tests/p15a1-market-integration-phases.test.ts tests/p15a1-market-integration-atomicity.test.ts"
F1359="tests/p15c2-campaign-legacy-integration.test.ts tests/p15c-wave-r-retention.test.ts tests/p15c1-campaign-legacy.test.ts"
for p in tsconfig.json ui/tsconfig.json tsconfig.bridge.json; do
  o="$X/tsc-$(echo "$p" | tr '/.' '--').txt"
  node_modules/.bin/tsc -p "$p" --noEmit > "$o" 2>&1; t=$?
  log "tsc $p exit $t; src errors $(grep -cE '^src/[^(]*\(.*error TS' "$o"); tests errors $(grep -cE '^tests/[^(]*\(.*error TS' "$o"); other errors $(grep 'error TS' "$o" | grep -cvE '^(src|tests)/')"
done
run() { local label=$1; shift
  node_modules/.bin/vitest run $V --outputFile.json="$X/$label.json" "$@" > "$X/$label.txt" 2>&1; local v=$?
  log "$label: vitest exit $v; $(grep -aE '^ +Tests ' "$X/$label.txt" | tr -s ' ')"; }
run p15a2 $F1356
run p15a2-harness $H1356
run p15a1 $F1355
run p15c $F1359
for g in generate-bridge-contract generate-bridge-contract-fixtures; do
  node_modules/.bin/vite-node scripts/$g.ts --check > "$X/$g.txt" 2>&1; log "$g --check exit $?"
done
log "tree status after: [$(git status --porcelain | tr '\n' ' ')]"
log "end"
