#!/bin/bash
set -u
export PATH="/usr/local/bin:$PATH"
X=/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt
S=/Users/zacheryspector/studio-scratch/p16-sprint10-20261027/recover-r10
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
run recover node node_modules/vitest/vitest.mjs run --project core tests/bridge-p14p3-directing-promises.test.ts tests/bridge-p14p4p5-opportunities.test.ts tests/p14c3-canonical-rival-history.test.ts tests/p14c3-force-order.test.ts tests/p14p3-directing-promises.test.ts tests/p14p4p5-casting-reservation.test.ts tests/p14p4p5-cross-owner.test.ts tests/p14p4p5-delayed-retirement.test.ts tests/p14p4p5-finishing-material.test.ts tests/p14p4p5-opportunities.test.ts tests/p14p4p5-post-capacity.test.ts tests/p14p4p5-queued-project-outcome.test.ts tests/p14p4p5-receipt-freeze.test.ts tests/p14p4p5-scenery-capacity.test.ts tests/p14p4p5-screenplay-status.test.ts tests/p14p4p5-soundstage-capacity.test.ts tests/p14p4p5-writer-resources.test.ts tests/p15b-legacy-v3.test.ts tests/p15c2-campaign-legacy-integration.test.ts tests/p15c2-campaign-legacy-sibling.test.ts tests/r3n1-stale-schedule-take-02.test.ts tests/r3n1-stale-schedule-take-02p31.test.ts tests/r3n1-stale-schedule-take-02p32.test.ts tests/world-first-scenery-load-in-provenance.test.ts  tests/bridge-p13b-s3-save-as.test.ts --reporter=default --reporter=json --outputFile="$S/focused.json"
run recover-ui node node_modules/vitest/vitest.mjs run --project ui ui/src/lot/WorldFirstStudioHome.test.tsx ui/src/lot/livingTurn.scheduler.test.tsx --reporter=default --reporter=json --outputFile="$S/ui.json"
echo "=== CHECKPOINT exit=$fail"; exit "$fail"
