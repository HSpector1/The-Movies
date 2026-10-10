#!/bin/bash
# Gate chain for the R8 rebase on 6510c971: types, generators, then bounded core test batches (sequential, no file parallelism).
set -u
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
export GIT_OPTIONAL_LOCKS=0
C=/Users/zacheryspector/studio-specialists/r8
P=/Users/zacheryspector/studio-scratch/1370-ar-1363-r8-rebase-20261010-r1
export P1368_ACCEPTED45_ROOT=$C/tests/fixtures/p14/genuine-v45-recovery-witnesses-1368
export P1368_ACCEPTED45_MANIFEST_SHA256=11ad61be481a8bec170f40425cfcfe7fcb24596418d30b6c8bf27895e93c3ba5
export P1368_ACCEPTED26_ROOT=$C/tests/fixtures/p13b/genuine-v26-period52-1368
export P1368_ACCEPTED26_MANIFEST_SHA256=8e40e51bb360ba6ff6c0d641a03e90aa8ed6f73f8c0b232a9a4b5861af358db4
export RIVAL_WRITING_CAPTURE_DIR=$C/tests/fixtures/p14/genuine-v46-rival-writing-pre414-1368
export RIVAL_WRITING_MANIFEST_SHA256=d097bbf131c1dc495b881d73e96994953b2f6a0ef50f88bd3b043f263024f205
export TRUST_AUTHORING_CAPTURE_DIR=$C/tests/fixtures/p14/genuine-v45-trust-authoring-week195-1368
export TRUST_AUTHORING_MANIFEST_SHA256=0b98763001eb96949d8e312df5dfe600f1adf599f5466dd59eec214e1f229991
cd "$C" || exit 99
R="$P/gates/results.jsonl"; : > "$R"
run() { # name, logfile, cmd...
  local name=$1 log=$2; shift 2
  local t0=$(date +%s)
  "$@" > "$log" 2>&1; local ec=$?
  local t1=$(date +%s)
  printf '{"name":"%s","exit":%d,"seconds":%d,"log":"%s","node":"%s","command":%s}\n' "$name" "$ec" "$((t1-t0))" "$log" "$(node --version)" "$(python3 -c 'import json,sys;print(json.dumps(sys.argv[1:]))' "$@")" >> "$R"
  echo "$(date '+%F %T') $name exit=$ec seconds=$((t1-t0))"
}
echo "$(date '+%F %T') gates start; HEAD=$(git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks rev-parse HEAD); node=$(node --version)"
run tsc-root "$P/gates/tsc-root.log" npx tsc --noEmit -p tsconfig.json
run tsc-ui "$P/gates/tsc-ui.log" npx tsc -p ui/tsconfig.json --noEmit
run tsc-bridge "$P/gates/tsc-bridge.log" npx tsc -p tsconfig.bridge.json
run gen-contract "$P/gates/gen-contract.log" node node_modules/vite-node/vite-node.mjs scripts/generate-bridge-contract.ts --check
run gen-contract-fixtures "$P/gates/gen-contract-fixtures.log" node node_modules/vite-node/vite-node.mjs scripts/generate-bridge-contract-fixtures.ts --check
for b in b1-modified10 b2-recovery-own b3-p15 b4-helper-consumers b5-backward b6-current; do
  files=$(tr '\n' ' ' < "$P/tests/$b.files")
  run "vitest-$b" "$P/tests/$b.log" npx vitest run --project core --no-file-parallelism --no-cache --reporter=verbose --reporter=json --outputFile.json="$P/tests/$b.vitest.json" $files
done
echo "$(date '+%F %T') gates done"
