#!/bin/bash
set -u
export PATH="/usr/local/bin:$PATH"
X=/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt
S=/Users/zacheryspector/studio-scratch/p16-sprint11-20261027/bridge-b-green-r20
cd "$X" || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
[ "$(node --version)" = v20.20.2 ] || exit 9
python3 -I - "$S/SOURCE-MANIFEST.json" "$S/SELECTION.json" <<'VERIFY'
import hashlib,json,subprocess,sys
from pathlib import Path
sel=json.loads(Path(sys.argv[2]).read_text()); head=sel['head']
assert isinstance(head,str) and len(head)==40, 'binding pending'
G=['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks']
assert subprocess.check_output(G+['rev-parse','HEAD'],text=True).strip()==head, 'HEAD differs'
assert subprocess.check_output(G+['status','--porcelain'],text=True)=='', 'tree dirty'
m=json.loads(Path(sys.argv[1]).read_text()); assert len(m)==sel['sourceManifestEntries'] and len(m)>0
for name,expected in m.items(): assert hashlib.sha256(Path(name).read_bytes()).hexdigest()==expected, name
VERIFY
[ "$?" = 0 ] || exit 9
[ ! -e "$S/USED" ] || exit 9
touch "$S/USED"
fail=0
run() { local label="$1"; shift; [ "$(df -Pk . | awk 'NR==2 {print $4}')" -ge 3145728 ] || { echo "=== STOP runtime floor"; exit 9; }; local s; s=$(date +%s); echo "=== BEGIN $label"; date -Iseconds; "$@"; local rc=$?; echo "=== END $label exit=$rc elapsed=$(( $(date +%s) - s ))s"; date -Iseconds; [ "$rc" = 0 ] || fail=1; }
run bridge-touched node node_modules/vitest/vitest.mjs run --project core tests/bridge-contract-generator.test.ts tests/bridge-operations-events.test.ts tests/bridge-owner-ux-projection21-schema.test.ts tests/bridge-p10a-w0-people-projection.test.ts tests/bridge-p11-capital-contributors.test.ts tests/bridge-p11-ready.test.ts tests/bridge-p13b-r07-setup.test.ts tests/bridge-p13b-s1b-seats.test.ts tests/bridge-p13b-s2-labs.test.ts tests/bridge-p13b-s3-plans.test.ts tests/bridge-p13b-s4-office.test.ts tests/bridge-p13b-s5-adoption.test.ts tests/bridge-p13b-s6-cancellation.test.ts tests/bridge-p13b-s7-disclosure.test.ts tests/bridge-p13b-s8-rivals.test.ts tests/bridge-p14a1-market.test.ts tests/bridge-p14a1-release-busy-set.test.ts tests/bridge-p14a2-market.test.ts tests/bridge-p14a3-world.test.ts tests/bridge-p14b1-promises.test.ts tests/bridge-p14b10-relationship-labels.test.ts tests/bridge-p14b2-trust.test.ts tests/bridge-p14b3-promise-command.test.ts tests/bridge-p14b4-runtime47-compatibility.test.ts tests/bridge-p14b5-relationships.test.ts tests/bridge-p14b6-relationship-read-models.test.ts tests/bridge-p14b7-promise-waiver.test.ts tests/bridge-p14b8-waiver-surface.test.ts tests/bridge-p14c2rm-runtime.test.ts tests/bridge-p14c2s-scientist-runtime.test.ts tests/bridge-p14c3-promise-digest-continuity.test.ts tests/bridge-p14c3-runtime.test.ts tests/bridge-p14p3-directing-promises.test.ts tests/bridge-p14p4p5-opportunities.test.ts tests/bridge-p14r2r3-prior55.test.ts tests/bridge-p17-continuation-greenlight.test.ts tests/bridge-p17-featured-appearances.test.ts tests/bridge-r3n4-read-model-deltas.test.ts tests/bridge-runtime-checkpoint.test.ts tests/bridge-schema.test.ts tests/bridge-stabilization-l22-retired-projections.test.ts tests/bridge.test.ts  --reporter=default --reporter=json --outputFile="$S/focused.json"
git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks status --porcelain > "$S/post-status.txt"
echo "=== CHECKPOINT exit=$fail"; exit "$fail"
