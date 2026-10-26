#!/bin/bash
# PREPARED ONLY. Launch through the existing preflight and heavy-lane wrapper.
set -u
export PATH="/usr/local/bin:$PATH"
X=/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt
S=/Users/zacheryspector/studio-scratch/p16-sprint7-verification-20261026/native-consumers-remaining
cd "$X" || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
[ "$(node --version)" = v20.20.2 ] || exit 9
[ "$(git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks rev-parse HEAD)" = e0d4c23939bcb4caf35957896959c32afef82c6b ] || exit 9
python3 - "$S/SOURCE-MANIFEST.json" <<'VERIFY'
import hashlib,json,sys
from pathlib import Path
for name,expected in json.loads(Path(sys.argv[1]).read_text()).items():
    assert hashlib.sha256(Path(name).read_bytes()).hexdigest()==expected,name
VERIFY
[ "$?" = 0 ] || exit 9
[ ! -e "$S/bridge-consumers.json" ] || exit 9
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
run bridge-consumers node node_modules/vitest/vitest.mjs run --project core tests/bridge-operations-events.test.ts tests/bridge-owner-ux-projection21-schema.test.ts tests/bridge-p10a-w0-people-projection.test.ts tests/bridge-p11-capital-contributors.test.ts tests/bridge-p11-ready.test.ts tests/bridge-p13b-r07-setup.test.ts tests/bridge-p13b-s1b-seats.test.ts tests/bridge-p13b-s2-labs.test.ts tests/bridge-p13b-s3-plans.test.ts tests/bridge-p13b-s4-office.test.ts tests/bridge-p13b-s5-adoption.test.ts tests/bridge-p13b-s6-cancellation.test.ts tests/bridge-p13b-s7-disclosure.test.ts tests/bridge-p13b-s8-rivals.test.ts tests/bridge-p14a1-market.test.ts tests/bridge-p14a1-release-busy-set.test.ts tests/bridge-p14a3-world.test.ts tests/bridge-p14b1-promises.test.ts tests/bridge-p14b10-relationship-labels.test.ts tests/bridge-p14b2-trust.test.ts tests/bridge-p14b3-promise-command.test.ts tests/bridge-p14b4-runtime47-compatibility.test.ts tests/bridge-p14b7-promise-waiver.test.ts tests/bridge-p14c2rm-runtime.test.ts tests/bridge-p14c2s-scientist-runtime.test.ts tests/bridge-p14c3-promise-digest-continuity.test.ts tests/bridge-p14c3-runtime.test.ts tests/bridge-p14p3-directing-promises.test.ts tests/bridge-p14p4p5-opportunities.test.ts tests/bridge-p14r2r3-prior55.test.ts tests/bridge-r3n4-read-model-deltas.test.ts tests/bridge-schema.test.ts tests/bridge-development.test.ts tests/bridge-p16-absorption-finance.test.ts tests/bridge-runtime-checkpoint.test.ts --reporter=default --reporter=json --outputFile="$S/bridge-consumers.json"
echo "=== CHECKPOINT exit=$fail"
exit "$fail"
