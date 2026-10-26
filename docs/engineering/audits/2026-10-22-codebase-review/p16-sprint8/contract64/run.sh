#!/bin/bash
# PREPARED ONLY: coordinator launches through existing preflight/heavy-lane wrapper.
set -euo pipefail
export PATH="/usr/local/bin:$PATH"
X=/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt
S=/Users/zacheryspector/studio-scratch/p16-sprint8-obligations-20261026/contract64
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
[ ! -e "$S/snapshot63" ]
[ ! -e "$S/snapshot64" ]
[ ! -e "$S/outgoing63" ]
(set -o noclobber; : > "$S/USED")
prepare63() {
mkdir "$S/snapshot63" "$S/outgoing63" || return $?
git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks -C "$X" archive 9c91232dd980cbe05399b6fd77ed55454e671f86 src bridge ui/src ui/public/lot/hollywood/role-atlas-v1.json generated package.json package-lock.json tsconfig.json tsconfig.src.json tsconfig.bridge.json | tar -x -C "$S/snapshot63" || return $?
ln -s "$X/node_modules" "$S/snapshot63/node_modules" || return $?
cp "$S/capture63.ts" "$S/snapshot63/capture63.ts"
}
run source9c-materialize prepare63
cd "$S/snapshot63"
export CONTRACT64_OUTPUT="$S/outgoing63"
run outgoing63-public-save-capture node node_modules/vite-node/vite-node.mjs capture63.ts
cd "$S"
prepare64() {
python3 - "$X" "$S" <<'COPY'
import hashlib,json,sys
from pathlib import Path
source,out=map(Path,sys.argv[1:]);dest=out/'snapshot64';dest.mkdir()
for name,expected in json.loads((out/'INPUTS.json').read_text())['inputs'].items():
    data=(source/name).read_bytes();assert hashlib.sha256(data).hexdigest()==expected,name
    target=dest/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
(dest/'node_modules').symlink_to(source/'node_modules',target_is_directory=True)
COPY
}
run current64-input-copy prepare64
cd "$S/snapshot64"
run contract64-generate node node_modules/vite-node/vite-node.mjs scripts/generate-bridge-contract.ts
run contract64-check node node_modules/vite-node/vite-node.mjs scripts/generate-bridge-contract.ts --check
run union-fixture64-generate node node_modules/vite-node/vite-node.mjs scripts/generate-bridge-contract-fixtures.ts
run union-fixture64-check node node_modules/vite-node/vite-node.mjs scripts/generate-bridge-contract-fixtures.ts --check
run output-receipt python3 - "$S" <<'OUTPUTS'
import hashlib,json,sys
from pathlib import Path
out=Path(sys.argv[1]);inputs=json.loads((out/'INPUTS.json').read_text());files={}
for name in inputs['expectedOutputs']:
    data=(out/'snapshot64'/name).read_bytes();files[name]={'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)}
manifest=json.loads((out/'snapshot64/generated/unity/project-studio-bridge.contract-manifest.json').read_text())
assert manifest['projectionVersion']==64 and manifest['protocolVersion']==4
(out/'GENERATED-OUTPUTS.json').write_text(json.dumps({'status':'ACTUAL-SCRATCH-GENERATION','schemaId':manifest['schemaId'],'files':files,'committedSourceDeclarationMeasurement':'PENDING coordinator installation/commit then measure.sh'},indent=2)+'\n')
OUTPUTS
echo "=== CHECKPOINT exit=0"
