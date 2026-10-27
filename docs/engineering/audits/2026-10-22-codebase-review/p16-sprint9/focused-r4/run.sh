#!/bin/bash
# PREPARED ONLY. Bind with bind.py --bind, then launch via launch.sh (fresh preflight, explicit no-Godot scan, lane-run-r8.sh).
set -u
export PATH="/usr/local/bin:$PATH"
X=/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt
S=/Users/zacheryspector/studio-scratch/p16-sprint9-20261027/focused-r4
cd "$X" || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
[ "$(node --version)" = v20.20.2 ] || exit 9
python3 -I - "$S/SOURCE-MANIFEST.json" "$S/SELECTION.json" <<'VERIFY'
import hashlib,json,subprocess,sys
from pathlib import Path
selection=json.loads(Path(sys.argv[2]).read_text())
head=selection['head']
assert isinstance(head,str) and len(head)==40, 'source binding pending'
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
run root-types node node_modules/typescript/bin/tsc --noEmit
run focused node node_modules/vitest/vitest.mjs run --project core tests/bridge.test.ts tests/bridge-stabilization-l22-retired-projections.test.ts tests/bridge-p14b6-relationship-read-models.test.ts tests/bridge-p14b4-runtime47-compatibility.test.ts tests/p16-healthy-new-drafting171.test.ts tests/p16-stopped-drafting171-refusals.test.ts tests/p14c3-force-order.test.ts tests/p14p4p5-finishing-material.test.ts tests/p14p4p5-post-capacity.test.ts tests/p14p4p5-screenplay-status.test.ts tests/p14p4p5-soundstage-capacity.test.ts --reporter=default --reporter=json --outputFile="$S/focused.json"
echo "=== CHECKPOINT exit=$fail"
exit "$fail"
