#!/bin/bash
set -u
export PATH="/usr/local/bin:$PATH"
X=/Users/zacheryspector/studio-scratch/p16-capture64-snapshot-wt
S=/Users/zacheryspector/studio-scratch/p16-sprint11-20261027/capture65-r17
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
run capture65 env CONTRACT66_OUTPUT="$S/out" node node_modules/vite-node/vite-node.mjs capture65.ts
echo "=== CHECKPOINT exit=$fail"; exit "$fail"
