#!/usr/bin/env bash
# Invoke from repo root through the heavy lane, after producer install/typecheck/push.
# Args: f6|a8, full accepted producer HEAD, unique recorder stem, new external artifact dir.
set -euo pipefail
R=/Users/zacheryspector/The-Movies-headless-program
E=docs/engineering/playability-launch-review/evidence/p14b4-20260919
PREP=/Users/zacheryspector/studio-scratch/1361-capture-runner
MODE=${1:?f6 or a8 required}
HEAD_PIN=${2:?full accepted producer HEAD required}
STEM=${3:?unique recorder stem required}
ARTIFACT=${4:?exclusive external artifact directory required}
[ "$PWD" = "$R" ] || { echo 'run from repository root' >&2; exit 2; }
[[ "$HEAD_PIN" =~ ^[0-9a-f]{40}$ && "$STEM" =~ ^[0-9]{3,4}[a-z0-9-]*$ ]] || exit 2
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
[ "$(node --version)" = v20.20.2 ] || exit 2
git fetch -q origin wip/headless-program-20260916-ts
[ "$(git rev-parse HEAD)" = "$HEAD_PIN" ] && [ "$(git rev-parse FETCH_HEAD)" = "$HEAD_PIN" ] || exit 2
[ -z "$(git status --porcelain -- src tests ui bridge generated scripts)" ] || { echo 'dirty source' >&2; exit 2; }
FREE_KIB=$(df -k / | awk 'NR==2 {print $4}')
[ "$FREE_KIB" -ge 5242880 ] || { echo 'requires 5 GiB free' >&2; exit 2; }
for SUFFIX in .json .patch .txt -preflight.json -postflight.json; do
 [ ! -e "$E/$STEM$SUFFIX" ] || { echo 'recorder output exists' >&2; exit 2; }
done
python3 - "$ARTIFACT" "$R" <<'PY'
from pathlib import Path
import sys
path=Path(sys.argv[1]);repo=Path(sys.argv[2]).resolve()
assert path.is_absolute() and not path.exists(),'artifact path must be new and absolute'
assert path.parent.exists() and path.parent.is_dir(),'artifact parent must exist'
for part in [path,*path.parents]:assert not part.is_symlink(),'symlink artifact ancestor'
assert not path.resolve().is_relative_to(repo),'artifact must be external'
PY
case "$MODE" in
 f6)
  git ls-files --error-unmatch tests/helpers/p15c2-frozen-v2-mint.ts >/dev/null
  COMMAND=(python3 "$PREP/bounded-child.py" 240 node node_modules/vite-node/vite-node.mjs --script tests/helpers/p15c2-frozen-v2-mint.ts "$HEAD_PIN" "$ARTIFACT")
  ;;
 a8)
  git ls-files --error-unmatch tests/probes/1363-a8-capture.probe.ts tests/probes/1363-a8.workspace.ts >/dev/null
  export P1363_A8_HEAD=$HEAD_PIN P1363_A8_OUTPUT=$ARTIFACT
  COMMAND=(python3 "$PREP/bounded-child.py" 330 node node_modules/vitest/vitest.mjs run --workspace tests/probes/1363-a8.workspace.ts --project 1363-a8 --reporter=verbose)
  ;;
 *) exit 2 ;;
esac
printf 'capture mode=%s head=%s stem=%s artifact=%s\n' "$MODE" "$HEAD_PIN" "$STEM" "$ARTIFACT"
shasum -a 256 "$PREP/bounded-child.py" "$0"
pmset -g batt
caffeinate -is -w $$ >/dev/null 2>&1 &
python3 "$E/run-bounded-source-guards.py" pre "$STEM" 0
set +e
node "$E/run-bounded-source-c2.mjs" "$STEM" "${COMMAND[@]}"
RECORDER_EXIT=$?
python3 "$E/run-bounded-source-guards.py" post "$STEM"
POST_EXIT=$?
set -e
[ "$RECORDER_EXIT" = 0 ] && [ "$POST_EXIT" = 0 ] || exit 3
python3 - "$E/$STEM.json" "$E/$STEM-postflight.json" <<'PY'
import json,sys
record=json.load(open(sys.argv[1]));post=json.load(open(sys.argv[2]))
assert record['fixedSource'] and post['allGuardsExact'],'source guards failed'
assert record['exitCode']==post['exitCode'],'exit disagreement'
code=record['exitCode'];assert isinstance(code,int),'missing child exit'
print(json.dumps({'actualChildExit':code,'fixedSource':True,'allGuardsExact':True}))
sys.exit(code if code>=0 else 1)
PY
