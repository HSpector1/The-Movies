#!/bin/bash
# PREPARED ONLY. Bind with bind.py --bind, then launch via launch.sh (fresh preflight, explicit no-Godot scan, lane-run-r8.sh).
set -u
export PATH="/usr/local/bin:$PATH"
X=/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt
S=/Users/zacheryspector/studio-scratch/p16-sprint9-20261027/browser-r9
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
for port in 5178 5179; do lsof -nP -iTCP:$port -sTCP:LISTEN >/dev/null 2>&1 && { echo "=== STOP port $port busy"; exit 9; }; done
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
export PLAYWRIGHT_JSON_OUTPUT_NAME="$S/smoke-report.json"
run browser-smoke node node_modules/@playwright/test/cli.js test --config ui/playwright.config.ts smoke.spec.ts --reporter=list,json
echo "=== CHECKPOINT exit=$fail"
exit "$fail"
