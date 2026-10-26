#!/bin/bash
# PREPARED ONLY. Launch through the existing preflight and heavy-lane wrapper.
set -u
export PATH="/usr/local/bin:$PATH"
X=/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt
S=/Users/zacheryspector/studio-scratch/p16-sprint8-obligations-20261026/typed-green
cd "$X" || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
[ "$(node --version)" = v20.20.2 ] || exit 9
[ "$(git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks rev-parse HEAD)" = 9c91232dd980cbe05399b6fd77ed55454e671f86 ] || exit 9
python3 - "$S/SOURCE-MANIFEST.json" <<'VERIFY'
import hashlib,json,sys
from pathlib import Path
for name,expected in json.loads(Path(sys.argv[1]).read_text()).items():
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
run obligations-market node node_modules/vitest/vitest.mjs run --project core tests/p14c2rm-writer-continuation.test.ts tests/p16-absorption-public-action.test.ts -t "continues genuine acquired obligations|withdraws the absorbed rival proposal" --reporter=default --reporter=json --outputFile="$S/focused.json"
echo "=== CHECKPOINT exit=$fail"
exit "$fail"
