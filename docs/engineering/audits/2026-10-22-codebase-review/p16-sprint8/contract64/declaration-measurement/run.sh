#!/bin/bash
# PREPARED ONLY: coordinator launches through existing preflight/heavy-lane wrapper.
set -euo pipefail
export PATH="/usr/local/bin:$PATH"
X=/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt
S=/Users/zacheryspector/studio-scratch/p16-sprint8-obligations-20261026/contract64/declaration-measurement
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
[ "$(node --version)" = v20.20.2 ]
[ "$(df -Pk "$S" | awk 'NR==2 {print $4}')" -ge 3670016 ]
python3 - "$S/SOURCE-MANIFEST.json" <<'VERIFY'
import hashlib,json,sys
from pathlib import Path
for name,expected in json.loads(Path(sys.argv[1]).read_text()).items():
    assert hashlib.sha256(Path(name).read_bytes()).hexdigest()==expected,name
VERIFY
run() {
  local label="$1"; shift
  [ "$(df -Pk "$S" | awk 'NR==2 {print $4}')" -ge 3670016 ] || exit 9
  echo "=== BEGIN $label"
  date -Iseconds
  local rc=0
  "$@" || rc=$?
  echo "=== END $label exit=$rc"
  date -Iseconds
  return "$rc"
}
[ ! -e "$S/USED" ]
(set -o noclobber; : > "$S/USED")
export P64_DECLARATION_EXPECTED_HEAD=b5c11b5a570820b4c8e8ded6830294b84d57d5a2
run committed64-declarations bash /Users/zacheryspector/studio-scratch/p16-sprint8-obligations-20261026/contract64/measure.sh
echo "=== CHECKPOINT exit=0"
