#!/usr/bin/env bash
# Invoke through the parent's heavy lane only, after recorded Save45 gates/postflight.
# Usage: bash run-1361-gl-natural.sh <full-accepted-head> <new-run-leaf>
# Writes only a new literal-parent scratch directory, never source or fixture trees.
set -euo pipefail
R=/Users/zacheryspector/The-Movies-headless-program
PREP=/Users/zacheryspector/studio-scratch/1361-gl-prep
HEAD_PIN=${1:?full accepted source HEAD required}
LEAF=${2:?new run leaf required}
[[ "$HEAD_PIN" =~ ^[0-9a-f]{40}$ ]] || { echo 'full hexadecimal HEAD required' >&2; exit 2; }
[[ "$LEAF" =~ ^[a-zA-Z0-9_-]+$ ]] || { echo 'simple run leaf required' >&2; exit 2; }
X=/Users/zacheryspector/studio-scratch/1361-gl-runs/$LEAF
[ ! -e "$X" ] || { echo 'run path already exists' >&2; exit 2; }
[ "$(git -C "$R" rev-parse HEAD)" = "$HEAD_PIN" ] || { echo 'HEAD differs from accepted pin' >&2; exit 2; }
git -C "$R" diff --quiet HEAD -- src package.json package-lock.json tsconfig.json
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
[ "$(node --version)" = v20.20.2 ] || { echo 'wrong Node' >&2; exit 2; }
FREE_KIB=$(df -k / | awk 'NR==2 {print $4}')
[ "$FREE_KIB" -ge 5242880 ] || { echo 'requires at least 5 GiB free' >&2; exit 2; }
POWER_STATUS=$(pmset -g batt) # record operational context; no invented AC hard gate
python3 - "$PREP" <<'PY'
import hashlib,json,sys
from pathlib import Path
root=Path(sys.argv[1])
for name,wanted in json.loads((root/'SHA256.json').read_text()).items():
    if hashlib.sha256((root/name).read_bytes()).hexdigest()!=wanted:
        raise SystemExit('artifact hash mismatch: '+name)
PY
python3 - "$X" <<'PYGUARD'
from pathlib import Path
import sys
root=Path(sys.argv[1])
for part in [root,*root.parents]:
    if part.is_symlink():
        raise SystemExit('refuse symlink in scratch path: '+str(part))
    if part.exists() and not part.is_dir():
        raise SystemExit('scratch ancestor is not a directory: '+str(part))
PYGUARD
mkdir -p "$X/tree" "$X/probe" "$X/out"
cp "$PREP/SHA256.json" "$PREP/GP-SOURCE.txt" "$X/out/"
printf '%s\n' "$POWER_STATUS" > "$X/out/power.txt"
git -C "$R" archive "$HEAD_PIN" src package.json package-lock.json tsconfig.json | tar -x -C "$X/tree"
ln -s "$R/node_modules" "$X/tree/node_modules"
cp "$PREP/1361-GL-probe.ts" "$PREP/1361-GL-independent-adapter.ts" "$PREP/gp-reference.json" "$X/probe/"
printf 'sourceHead=%s\nsourceTree=%s\nstart=%s\n' "$HEAD_PIN" "$(git -C "$R" rev-parse "$HEAD_PIN:src")" "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" > "$X/out/run.meta"
caffeinate -dimsu -w $$ >/dev/null 2>&1 &
set +e
PROBE_TREE_HEAD=$HEAD_PIN "$X/tree/node_modules/.bin/vite-node" --root "$X/tree" "$X/probe/1361-GL-probe.ts" > "$X/out/gl.json" 2> "$X/out/gl.err"
RC=$?
set -e
printf 'exit=%s\nend=%s\n' "$RC" "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" >> "$X/out/run.meta"
[ "$(git -C "$R" rev-parse HEAD)" = "$HEAD_PIN" ] || { echo 'HEAD changed while running' >&2; exit 3; }
git -C "$R" diff --quiet HEAD -- src package.json package-lock.json tsconfig.json
exit "$RC"
