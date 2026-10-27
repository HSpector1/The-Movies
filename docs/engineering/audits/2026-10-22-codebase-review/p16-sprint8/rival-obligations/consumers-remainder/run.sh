#!/bin/bash
# PREPARED ONLY. Bind with bind.py --bind, then launch through fresh equipment preflight,
# an explicit no-Godot host scan and the heavy-lane wrapper (lane-run-r8.sh 0 <abs log> bash run.sh).
set -u
export PATH="/usr/local/bin:$PATH"
X=/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt
S=/Users/zacheryspector/studio-scratch/p16-sprint8-obligations-20261026/rival-obligations/consumers-remainder
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
manifest=json.loads(Path(sys.argv[1]).read_text())
assert len(manifest)>0 and len(manifest)==selection['sourceManifestEntries'], 'source manifest binding pending'
assert manifest[selection['selector']['file']]==selection['testPostimageSHA256'], 'independent test postimage differs'
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
run consumers-remainder node node_modules/vitest/vitest.mjs run --project core tests/p16-retained-drafting-continuation.test.ts tests/p16-continued-work-cancel.test.ts tests/p14c2c-rival-promises.test.ts tests/p14c3-promise-digest-continuity.test.ts tests/p15b4-studio-closure-save.test.ts --reporter=default --reporter=json --outputFile="$S/focused.json"
run bridge-types node node_modules/typescript/bin/tsc -p tsconfig.bridge.json --noEmit
echo "=== CHECKPOINT exit=$fail"
exit "$fail"
