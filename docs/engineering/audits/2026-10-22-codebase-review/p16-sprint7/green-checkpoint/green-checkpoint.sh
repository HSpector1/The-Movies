#!/bin/bash
# PREPARED ONLY. Launch through the existing preflight and heavy-lane wrapper.
set -u
export PATH="/usr/local/bin:$PATH"
X=/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt
S=/Users/zacheryspector/studio-scratch/p16-sprint7-verification-20261026/green-checkpoint
cd "$X" || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
[ "$(node --version)" = v20.20.2 ] || exit 9
[ "$(git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks rev-parse HEAD)" = 6fdbe96672e28049199f312fc59c95ebfda20c44 ] || exit 9
python3 - "$S/SOURCE-MANIFEST.json" <<'VERIFY'
import hashlib,json,sys
from pathlib import Path
for name,expected in json.loads(Path(sys.argv[1]).read_text()).items():
    assert hashlib.sha256(Path(name).read_bytes()).hexdigest()==expected,name
VERIFY
[ "$?" = 0 ] || exit 9
[ ! -e "$S/retained-writing-complete.json" ] || exit 9
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
run bridge-types node node_modules/typescript/bin/tsc -p tsconfig.bridge.json
run retained-writing-complete node node_modules/vitest/vitest.mjs run --project core tests/p16-retained-drafting-continuation.test.ts tests/p16-carried-script-accept.test.ts tests/p16-carried-script-rewrite.test.ts --reporter=default --reporter=json --outputFile="$S/retained-writing-complete.json"
echo "=== CHECKPOINT exit=$fail"
exit "$fail"
