#!/usr/bin/env bash
# Fixed unchanged-Save45 regression selection; expected behavioral REDs stay failures.
# Args: actual published HEAD, exclusive recorder stem. Invoke through one heavy lane.
set -euo pipefail
R=/Users/zacheryspector/The-Movies-headless-program
E=docs/engineering/playability-launch-review/evidence/p14b4-20260919
S=/Users/zacheryspector/studio-scratch/1367-regression-runner
HEAD_PIN=${1:?actual published HEAD}
STEM=${2:?new recorder stem}
[ "$#" -eq 2 ] && [ "$PWD" = "$R" ]
[[ "$HEAD_PIN" =~ ^[0-9a-f]{40}$ && "$STEM" =~ ^[0-9]{3,4}[a-z0-9-]*$ ]]
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
export GIT_OPTIONAL_LOCKS=0
[ "$(node --version)" = v20.20.2 ]
[ "$(git rev-parse HEAD)" = "$HEAD_PIN" ]
[ "$(git ls-remote origin refs/heads/wip/headless-program-20260916-ts | awk '{print $1}')" = "$HEAD_PIN" ]
[ -z "$(git status --porcelain -- src tests ui bridge generated scripts)" ]
[ "$(df -k / | awk 'NR==2 {print $4}')" -ge 5242880 ]
for suffix in .json .patch .txt -preflight.json -postflight.json; do
 [ ! -e "$E/$STEM$suffix" ] && [ ! -L "$E/$STEM$suffix" ]
done
[ ! -e "$S/$STEM-extra-guards.json" ] && [ ! -L "$S/$STEM-extra-guards.json" ]
FILES=(tests/p14d1-rival-shelving.test.ts tests/p14d2-binding-cash.test.ts tests/p14d2-a8-binding-cash.test.ts tests/p15c2-legacy-lens-shape.test.ts tests/save-masked-downgrade-own-era.test.ts tests/save-v36-extension-own-era.test.ts)
git ls-files --error-unmatch -- "${FILES[@]}" >/dev/null
check_new_inputs() {
 python3 - "$S/new-input-pins.json" <<'PINS'
from pathlib import Path
import hashlib,json,sys
raw=Path(sys.argv[1]).read_bytes()
assert hashlib.sha256(raw).hexdigest()=='81c9387bfe5d311ffaf92fe7a42bc034686c9915c152b534cd35e183162d44e4','accepted pin map changed'
pins=json.loads(raw)
for name,expected in pins.items():
 p=Path(name).absolute()
 assert all(not q.is_symlink() for q in [p,*p.parents]),name
 assert p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest()==expected,name
print(json.dumps({'newManualInputs':pins,'exact':True}))
PINS
}
check_new_inputs
pmset -g batt
caffeinate -is -w $$ >/dev/null 2>&1 &
python3 "$E/run-bounded-source-guards.py" pre "$STEM" 0
set +e
node "$E/run-bounded-source-c2.mjs" "$STEM" python3 /Users/zacheryspector/studio-scratch/1361-capture-runner/bounded-child.py 330 node node_modules/vitest/vitest.mjs run --project core "${FILES[@]}" --maxWorkers=1 --minWorkers=1 --no-file-parallelism --reporter=verbose
RECORDER_RC=$?
python3 "$E/run-bounded-source-guards.py" post "$STEM"
POST_RC=$?
set -e
check_new_inputs
[ "$RECORDER_RC" = 0 ] && [ "$POST_RC" = 0 ]
python3 - "$E/$STEM.json" "$E/$STEM-postflight.json" "$HEAD_PIN" "$S/$STEM-extra-guards.json" "$S/new-input-pins.json" <<'RESULT'
from pathlib import Path
import hashlib,json,sys
r=json.loads(Path(sys.argv[1]).read_text());p=json.loads(Path(sys.argv[2]).read_text())
assert r['fixedSource'] and p['allGuardsExact'] and p['fixedSource']
assert r['sourceSha']==r['sourceShaAtEnd']==p['head']==sys.argv[3]
assert r['exitCode']==p['exitCode'] and isinstance(r['exitCode'],int)
pinsRaw=Path(sys.argv[5]).read_bytes();pinsSha=hashlib.sha256(pinsRaw).hexdigest()
assert pinsSha=='81c9387bfe5d311ffaf92fe7a42bc034686c9915c152b534cd35e183162d44e4'
out={'additionalInputPinsSha256':pinsSha,'additionalInputPins':json.loads(pinsRaw),'head':sys.argv[3],'actualChildExit':r['exitCode'],'fixedSource':True,'allGuardsExact':True,'additionalInputPinsBeforeAfter':True,'postprocessExit':0}
with Path(sys.argv[4]).open('x') as f:json.dump(out,f,indent=2);f.write('\n')
print(json.dumps(out));sys.exit(r['exitCode'] if r['exitCode']>=0 else 1)
RESULT
