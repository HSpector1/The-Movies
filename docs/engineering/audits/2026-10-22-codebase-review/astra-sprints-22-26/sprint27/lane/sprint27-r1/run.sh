#!/bin/bash
# PREPARED ONLY. Bind with bind.py --bind, then launch via launch.sh (fresh preflight, explicit no-Godot scan, lane-run-r8.sh).
set -u
export PATH="/usr/local/bin:$PATH"
X=/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt
S=/Users/zacheryspector/studio-scratch/astra-20261029/sprint27-r1
cd "$X" || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
[ "$(node --version)" = v20.20.2 ] || exit 9
python3 -I - "$S/SOURCE-MANIFEST.json" "$S/SELECTION.json" <<'VERIFY'
import hashlib,json,subprocess,sys
from pathlib import Path
selection=json.loads(Path(sys.argv[2]).read_text())
head=selection['head']
assert isinstance(head,str) and len(head)==40, 'source binding pending: run bind.py --bind inside the exclusive window'
actual=subprocess.check_output(['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks','rev-parse','HEAD'],text=True).strip()
assert actual==head, 'source HEAD differs'
assert subprocess.check_output(['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks','status','--porcelain'],text=True)=='', 'tree dirty'
manifest=json.loads(Path(sys.argv[1]).read_text())
assert len(manifest)>0 and len(manifest)==selection['sourceManifestEntries'], 'source manifest binding pending'
for name,expected in manifest.items():
    assert hashlib.sha256(Path(name).read_bytes()).hexdigest()==expected,name
VERIFY
[ "$?" = 0 ] || exit 9
[ ! -e "$S/USED" ] || exit 9
touch "$S/USED"
: > "$S/MISSING-INPUTS.txt"
for input in "$P16_JOIN_PREC48_PATH" "$P16_JOIN_CLOSED48_PATH" \
 docs/engineering/playability-launch-review/evidence/p14b4-20260919/1052-c3-endurance-C-recording-v1/authority-failure.json \
 evidence/Playability-Interaction-01/fixtures/r3n1-dense-02/generated-r3n1-dense-02.checkpoint.json \
 evidence/Playability-Interaction-01/fixtures/r3n1-dense-02p31/generated-r3n1-dense-02p31.checkpoint.json \
 evidence/Playability-Interaction-01/fixtures/r3n1-dense-02p32/generated-r3n1-dense-02p32.checkpoint.json; do
  [ -f "$input" ] || echo "$input" >> "$S/MISSING-INPUTS.txt"
done
echo "known-missing inputs: $(wc -l < "$S/MISSING-INPUTS.txt")"
echo "Node $(node --version); HEAD $(git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks rev-parse HEAD)"; uptime
HEAD=$(git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks rev-parse HEAD)
fail=0
run() {
  local label="$1"; shift
  [ "$(df -Pk . | awk 'NR==2 {print $4}')" -ge 3145728 ] || { echo "=== STOP runtime floor before $label"; exit 9; }
  local started; started=$(date +%s)
  echo "=== BEGIN $label"; date -Iseconds
  "$@"
  local rc=$?
  echo "=== END $label exit=$rc elapsed=$(( $(date +%s) - started ))s"; date -Iseconds
  [ "$rc" = 0 ] || fail=1
}
run root-ui-types npm run -s typecheck
run bridge-types npm run -s typecheck:bridge
run bridge-contract npm run -s check:bridge-contract
run bridge-fixture-contract npm run -s check:bridge-contract:fixtures
run bridge-tests node node_modules/vitest/vitest.mjs run --project core tests/bridge*.test.ts --reporter=default --reporter=json --outputFile="$S/bridge-tests.json"
run final-source-integrity git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks diff --exit-code HEAD
echo "=== CHECKPOINT exit=$fail"
exit "$fail"
