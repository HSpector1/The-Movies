#!/bin/bash
# PREPARED ONLY. Launch through the existing preflight and heavy-lane wrapper.
set -u
export PATH="/usr/local/bin:$PATH"
X=/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt
S=/Users/zacheryspector/studio-scratch/p16-sprint7-verification-20261026/native-coherent-resume2
cd "$X" || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
[ "$(node --version)" = v20.20.2 ] || exit 9
[ "$(git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks rev-parse HEAD)" = 5a730f42d5a66d22cba4808b5c642510c2f068bb ] || exit 9
python3 - "$S/SOURCE-MANIFEST.json" <<'VERIFY'
import hashlib,json,sys
from pathlib import Path
for name,expected in json.loads(Path(sys.argv[1]).read_text()).items():
    assert hashlib.sha256(Path(name).read_bytes()).hexdigest()==expected,name
VERIFY
[ "$?" = 0 ] || exit 9
[ ! -e "$S/affected.json" ] || exit 9
[ ! -e "$S/ui-consumers.json" ] || exit 9
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
run screenplay node node_modules/vitest/vitest.mjs run --project core tests/p16-retained-drafting-continuation.test.ts tests/p16-carried-script-accept.test.ts tests/p16-carried-script-rewrite.test.ts --reporter=default --reporter=json --outputFile="$S/screenplay.json"
run affected node node_modules/vitest/vitest.mjs run --project core tests/p14b1-first-take.test.ts tests/p14c2rm-writer-continuation.test.ts tests/p14c3-save-v38.test.ts tests/stabilization-l02-casting-profession.test.ts tests/casting-package-read-model.test.ts tests/p15a1-shared-market.test.ts tests/p15c1-campaign-legacy.test.ts tests/p15c2-campaign-legacy-integration.test.ts tests/p14p4p5-opportunities.test.ts --reporter=default --reporter=json --outputFile="$S/affected.json"
run root-types node node_modules/typescript/bin/tsc --noEmit
run bridge-types node node_modules/typescript/bin/tsc -p tsconfig.bridge.json
run ui-types node node_modules/typescript/bin/tsc -p ui/tsconfig.json --noEmit
echo "=== CHECKPOINT exit=$fail"
exit "$fail"
