#!/bin/bash
# PREPARED ONLY. Launch through the existing preflight and heavy-lane wrapper.
set -u
export PATH="/usr/local/bin:$PATH"
X=/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt
S=/Users/zacheryspector/studio-scratch/p16-sprint8-obligations-20261026/rival-earlier/first-green
cd "$X" || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
[ "$(node --version)" = v20.20.2 ] || exit 9
# Coordinator binds SELECTION.head/count and the usual tracked-source manifest only
# AFTER installing the exact independent test patch, BEFORE preflight. Pending refuses.
python3 - "$S/SOURCE-MANIFEST.json" "$S/SELECTION.json" <<'VERIFY'
import hashlib,json,subprocess,sys
from pathlib import Path
selection=json.loads(Path(sys.argv[2]).read_text())
head=selection['head']
assert isinstance(head,str) and len(head)==40, 'source binding pending after test installation'
assert selection['selector']['file']!='PENDING_TEST_FILE' and selection['selector']['it']!='PENDING_EXACT_LEAF', 'test author selector pending'
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
run root-types node node_modules/typescript/bin/tsc --noEmit
[ "$fail" = 0 ] || exit "$fail"
run rival-earlier-lifecycle node node_modules/vitest/vitest.mjs run --project core tests/p16-continued-work-silent-phases76.test.ts -t "quotes actual163 unshot silent phase7 with all six original people into idle R03 before reaching the earlier-work producer" --reporter=default --reporter=json --outputFile="$S/focused.json"
echo "=== CHECKPOINT exit=$fail"
exit "$fail"
