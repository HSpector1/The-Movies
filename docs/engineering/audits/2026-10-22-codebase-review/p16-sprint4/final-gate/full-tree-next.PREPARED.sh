#!/bin/bash
# PREPARED ONLY. Root must first run the current equipment preflight and reconcile all required bindings,
# source/input ownership, AC power, resource floors and global exclusivity. This script is not that preflight.
# Launch through the existing sole lane only after that independent prerequisite succeeds.
# Usage: bash this-script <reviewed-clean-candidate-40-character-HEAD>
export PATH="/usr/local/bin:$PATH"
W=/Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt
S4=/Users/zacheryspector/studio-scratch/p16-sprint4-20261025
OUT="$S4/full-tree-next"
cd "$W" || exit 9
expected_head=${1:?Supply the reviewed clean candidate HEAD after the current checkpoint}
actual_head=$(git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks rev-parse HEAD) || exit 9
[ "$actual_head" = "$expected_head" ] || { echo 'Refusing: candidate HEAD differs from reviewed source'; exit 9; }
[ -z "$(git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks status --porcelain)" ] || { echo 'Refusing: candidate tree is dirty'; exit 9; }
[ "$(node --version)" = v20.20.2 ] || { echo 'Refusing: existing pinned Node20.20.2 not selected'; exit 9; }
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
missing=0
for input in \
 "$P16_JOIN_PREC48_PATH" "$P16_JOIN_CLOSED48_PATH" \
 docs/engineering/playability-launch-review/evidence/p14b4-20260919/1052-c3-endurance-C-recording-v1/authority-failure.json \
 evidence/Playability-Interaction-01/fixtures/r3n1-dense-02/generated-r3n1-dense-02.checkpoint.json \
 evidence/Playability-Interaction-01/fixtures/r3n1-dense-02p31/generated-r3n1-dense-02p31.checkpoint.json \
 evidence/Playability-Interaction-01/fixtures/r3n1-dense-02p32/generated-r3n1-dense-02p32.checkpoint.json; do
  if [ ! -f "$input" ]; then echo "Missing full-gate input: $input"; missing=1; fi
done
[ "$missing" -eq 0 ] || exit 9
# Current HANDOFF Operational details requires this launch floor; coordinator reconciles any scope conflict first.
free_kib=$(df -k "$W" | awk 'NR==2 {print $4}')
[ "$free_kib" -ge 3670016 ] || { echo "Refusing: free ${free_kib}KiB below documented launch floor3670016KiB"; exit 9; }
[ ! -e "$OUT" ] || { echo 'Refusing to overwrite an existing full-gate evidence directory'; exit 9; }
mkdir "$OUT" || exit 9
printf '%s\n' "$actual_head" > "$OUT/SOURCE-HEAD.txt"
echo "Node $(node --version); HEAD $actual_head; available ${free_kib}KiB"
uptime
failed=0
run() {
  local label="$1"; shift
  local started; started=$(date +%s)
  echo "=== BEGIN $label"
  "$@"
  local rc=$?
  echo "=== END $label exit=$rc elapsed=$(( $(date +%s) - started ))s"
  if [ "$rc" -ne 0 ]; then failed=1; fi
}
run root-ui-types npm run -s typecheck
run bridge-types npm run -s typecheck:bridge
run bridge-contract npm run -s check:bridge-contract
run bridge-fixture-contract npm run -s check:bridge-contract:fixtures
run build npm run -s build
# The core workspace includes ALL tests/**/*.test.ts, including Bridge. Never repeat a separate Bridge pass here.
run full-core-including-bridge node node_modules/vitest/vitest.mjs run --project core --reporter=default --reporter=json --outputFile="$OUT/core-including-bridge.json"
run full-ui node node_modules/vitest/vitest.mjs run --project ui --reporter=default --reporter=json --outputFile="$OUT/ui.json"
run final-source-integrity git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks diff --exit-code HEAD
printf '%s\n' "=== ALL DONE failure=$failed"
exit "$failed"
