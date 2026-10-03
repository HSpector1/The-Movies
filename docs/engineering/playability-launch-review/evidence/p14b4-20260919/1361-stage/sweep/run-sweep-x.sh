#!/usr/bin/env bash
# 1361-N sweep dry run. usage: run-sweep-x.sh <label> <patch ...>. Builds S/1361-sweep/<label>/tree with build-unit-tree.sh
# (HEAD + the production through p15c-c-r1 + each patch, committed in order), then runs the three type gates, both
# generator checks, core over core-list-448.txt (1361-M2's 447 plus the sibling file), UI and the d16 config, like
# 1361-M2. Not a recorded run. Run alone under lane-run.sh; never edit it while it runs; copy it to a new name instead.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
S=/Users/zacheryspector/studio-scratch/1361-sweep
L=${1:?label}; shift
X=$S/$L
T=$X/tree
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
[ -e "$X/x.meta" ] && { echo "STOP: $X/x.meta exists"; exit 2; }
mkdir -p "$X" || exit 2
log() { echo "$1; $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$X/x.meta"; }
[ "$(wc -l < "$S/core-list-448.txt" | tr -d ' ')" = 448 ] || { echo "STOP: core list is not 448 files"; exit 2; }
bash "$S/build-unit-tree.sh" "$L" "$@" > "$X/build.txt" 2>&1 || { log "STOP: tree build failed: $(tail -1 "$X/build.txt")"; exit 2; }
log "start: $(tail -1 "$X/build.txt"), node $(node --version), patches: $*"
cd "$T" || exit 2
for f in $(cat "$S/core-list-448.txt"); do [ -e "$f" ] || { log "STOP: missing in tree: $f"; exit 2; }; done
{ for p in tsconfig.json ui/tsconfig.json tsconfig.bridge.json; do echo "== $p"; node_modules/.bin/tsc -p $p --noEmit 2>&1; echo "exit $?"; done; } > "$X/x-tsc.txt"
log "tsc: $(/usr/bin/grep -E '^(==|exit)' "$X/x-tsc.txt" | tr '\n' ' ')"
{ echo "== check:bridge-contract"; node_modules/.bin/vite-node scripts/generate-bridge-contract.ts --check 2>&1; echo "exit $?";
  echo "== check:bridge-contract:fixtures"; node_modules/.bin/vite-node scripts/generate-bridge-contract-fixtures.ts --check 2>&1; echo "exit $?"; } > "$X/x-generate.txt"
log "generator: $(/usr/bin/grep -E '^(==|exit)' "$X/x-generate.txt" | tr '\n' ' ')"
log "core start"
PATH="$R/.venv/bin:$PATH" node_modules/.bin/vitest run --project core --no-cache $(cat "$S/core-list-448.txt") > "$X/x-core.txt" 2>&1
log "core exit $?; $(/usr/bin/grep -aE '^ +Tests ' "$X/x-core.txt" | tr -s ' ')"
PATH="$R/.venv/bin:$PATH" node_modules/.bin/vitest run --project ui --no-cache > "$X/x-ui.txt" 2>&1
log "ui exit $?; $(/usr/bin/grep -aE '^ +Tests ' "$X/x-ui.txt" | tr -s ' ')"
node_modules/.bin/vitest run --config src/harness/d16/vitest.d16.config.ts --no-cache --reporter=default --reporter=json --outputFile.json="$X/x-d16.json" > "$X/x-d16.txt" 2>&1
log "d16 exit $?; $(/usr/bin/grep -aE '^ +Tests ' "$X/x-d16.txt" | tr -s ' ')"
log "tree status: [$(git status --porcelain | tr '\n' ' ')]"
log "end"
