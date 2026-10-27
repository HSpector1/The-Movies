#!/bin/bash
# PREPARED ONLY. Launch through the existing preflight and heavy-lane wrapper.
set -u
export PATH="/usr/local/bin:$PATH"
X=/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt
S=/Users/zacheryspector/studio-scratch/p16-sprint8-obligations-20261026/rival-continuation/coherent-affected
cd "$X" || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
[ "$(node --version)" = v20.20.2 ] || exit 9
# Coordinator binds SELECTION.head/count and the usual tracked-source manifest only
# AFTER installing the reviewed coherent source, BEFORE preflight. Pending refuses.
python3 - "$S/SOURCE-MANIFEST.json" "$S/SELECTION.json" <<'VERIFY'
import hashlib,json,subprocess,sys
from pathlib import Path
selection=json.loads(Path(sys.argv[2]).read_text())
head=selection['head']
assert isinstance(head,str) and len(head)==40, 'source binding pending after test installation'
actual=subprocess.check_output(['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks','rev-parse','HEAD'],text=True).strip()
assert actual==head, 'source HEAD differs'
manifest=json.loads(Path(sys.argv[1]).read_text())
assert len(manifest)>0 and len(manifest)==selection['sourceManifestEntries'], 'source manifest binding pending'
for name,expected in selection['testPostimages'].items():
    assert manifest[name]==expected, 'selected test postimage differs: '+name
for name,expected in manifest.items():
    assert hashlib.sha256(Path(name).read_bytes()).hexdigest()==expected,name
VERIFY
[ "$?" = 0 ] || exit 9
[ ! -e "$S/focused.json" ] || exit 9
[ ! -e "$S/USED" ] || exit 9
touch "$S/USED"
fail=0
run() {
  local label="$1"; shift
  [ "$(df -Pk . | awk 'NR==2 {print $4}')" -ge 3145728 ] || exit 9
  echo "=== BEGIN $label"
  date -Iseconds
  "$@"
  local rc=$?
  echo "=== END $label exit=$rc"
  date -Iseconds
  [ "$rc" = 0 ] || fail=1
}
run coherent-affected node node_modules/vitest/vitest.mjs run --project core tests/p16-absorption-active-run.test.ts tests/p16-continued-work-shooting4.test.ts tests/p16-continued-work-cancel.test.ts tests/p16-estate-run-continuation.test.ts tests/p16-estate-observed-migration.test.ts tests/p16-r03-observed-migration.test.ts --reporter=default --reporter=json --outputFile="$S/focused.json"
run root-types node node_modules/typescript/bin/tsc --noEmit
run bridge-types node node_modules/typescript/bin/tsc -p tsconfig.bridge.json --noEmit
echo "=== CHECKPOINT exit=$fail"
exit "$fail"
