#!/usr/bin/env bash
# Save45 landing recorded runs (1361-L; 1361-F ruling 14), one per call, alone under lane-run.sh: guards pre, the
# bounded-source recorder, guards post. Built from S/1358-land/recorded3.sh (exact five output names). NO COMMIT and no
# `git add` while it runs or during its postflight. usage: recorded-1361.sh <mode>
#   p15a2-green    1361-p15a2-green-recorded    1356's archive and isolation files
#   p15a2-harness  1361-p15a2-harness-recorded  the 1356 harness, alone (1356-F2:40)
#   p15a1-green    1361-p15a1-green-recorded    1355's three files (must fail exactly the 45 declared, 1361-F5 Amdt 1)
#   p15c-green     1361-p15c-green-recorded     1359's three files and the sibling test
#   core           1361-save45-broad-core       the 448 files of E/1361-stage/sweep/core-list-448.txt
#   ui             1361-save45-broad-ui         vitest --project ui
#   d16            1361-save45-broad-d16        the d16 config (must fail exactly the base 12)
# Separate revision: only d16 adds verbose + external JSON; the five recorder files stay unchanged.
# The JSON path is exclusive to this single-lane run and hashed only after successful postflight.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
E=docs/engineering/playability-launch-review/evidence/p14b4-20260919
L=/Users/zacheryspector/studio-scratch/1361-land
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
cd "$R" || exit 2
log() { echo "$1; $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$L/recorded.meta"; }
stop() { log "STOP: $1"; exit 3; }
MODE=${1:-}
case "$MODE" in
  p15a2-green) STEM=1361-p15a2-green-recorded ;;
  p15a2-harness) STEM=1361-p15a2-harness-recorded ;;
  p15a1-green) STEM=1361-p15a1-green-recorded ;;
  p15c-green) STEM=1361-p15c-green-recorded ;;
  core) STEM=1361-save45-broad-core ;;
  ui) STEM=1361-save45-broad-ui ;;
  d16) STEM=1361-save45-broad-d16 ;;
  *) echo "usage: recorded-1361.sh p15a2-green|p15a2-harness|p15a1-green|p15c-green|core|ui|d16"; exit 2 ;;
esac
caffeinate -is -w $$ &
log "$STEM start at $(git rev-parse HEAD), node $(node --version)"
git fetch -q origin wip/headless-program-20260916-ts || stop "fetch failed"
[ "$(git rev-parse HEAD)" = "$(git rev-parse FETCH_HEAD)" ] || stop "HEAD is not the remote branch head"
[ -z "$(git status --porcelain -- src tests ui bridge generated scripts)" ] || stop "source paths are dirty"
[ -e tests/p15c2-campaign-legacy-sibling.test.ts ] || stop "the sibling test has not landed"
/usr/bin/grep -q "Math.random" tests/p15c2-campaign-legacy-integration.test.ts && stop "the hygiene comment has not landed"
avail=$(df -k / | tail -1 | awk '{print $4}')
[ "$avail" -ge 5242880 ] || stop "free disk below 5 GiB ($avail KiB)"
[[ "$STEM" =~ ^[0-9]{3,4}[a-z0-9-]*$ ]] || stop "stem $STEM does not match the recorder's name rule"
for f in "$E/$STEM.json" "$E/$STEM.patch" "$E/$STEM.txt" "$E/$STEM-preflight.json" "$E/$STEM-postflight.json"; do
  [ -e "$f" ] && stop "$STEM output $f already exists"
done
LIST="$E/1361-stage/sweep/core-list-448.txt"
if [ "$MODE" = core ]; then
  [ "$(wc -l < "$LIST" | tr -d ' ')" = 448 ] || stop "core list is not 448 files"
fi
D16_JSON="$L/d16-vitest.json"
if [ "$MODE" = d16 ]; then
  python3 - "$D16_JSON" "$R" <<'PY_PATH' >> "$L/recorded.log" 2>&1
from pathlib import Path
import sys
path, repo = map(Path, sys.argv[1:])
assert path.is_absolute() and path.name == 'd16-vitest.json'
assert path.parent.is_dir(), 'reporter parent must already exist'
assert all(not parent.is_symlink() for parent in path.parents), 'symlinked reporter ancestor'
assert path.parent.resolve(strict=True) == path.parent, 'reporter parent is not canonical'
assert repo.resolve() not in path.parents, 'reporter output must be external'
assert not path.exists() and not path.is_symlink(), 'refusing existing reporter output'
PY_PATH
  [ "$?" -eq 0 ] || stop "d16 reporter path precondition failed"
fi
log "$STEM pre"
python3 "$E/run-bounded-source-guards.py" pre "$STEM" 0 >> "$L/recorded.log" 2>&1 || stop "$STEM preflight failed"
log "$STEM run"
V="node_modules/.bin/vitest run"
case "$MODE" in
  p15a2-green) PATH="$R/.venv/bin:$PATH" node "$E/run-bounded-source-c2.mjs" "$STEM" $V --project core \
      tests/p15a2-power-ranking-archive.test.ts tests/p15a2-power-ranking-archive-isolation.test.ts >> "$L/recorded.log" 2>&1 ;;
  p15a2-harness) PATH="$R/.venv/bin:$PATH" node "$E/run-bounded-source-c2.mjs" "$STEM" $V --project core \
      tests/p15a2-power-ranking-archive-harness.test.ts >> "$L/recorded.log" 2>&1 ;;
  p15a1-green) PATH="$R/.venv/bin:$PATH" node "$E/run-bounded-source-c2.mjs" "$STEM" $V --project core \
      tests/p15a1-market-integration.test.ts tests/p15a1-market-integration-phases.test.ts \
      tests/p15a1-market-integration-atomicity.test.ts >> "$L/recorded.log" 2>&1 ;;
  p15c-green) PATH="$R/.venv/bin:$PATH" node "$E/run-bounded-source-c2.mjs" "$STEM" $V --project core \
      tests/p15c2-campaign-legacy-integration.test.ts tests/p15c-wave-r-retention.test.ts tests/p15c1-campaign-legacy.test.ts \
      tests/p15c2-campaign-legacy-sibling.test.ts >> "$L/recorded.log" 2>&1 ;;
  core) PATH="$R/.venv/bin:$PATH" node "$E/run-bounded-source-c2.mjs" "$STEM" $V --project core $(cat "$LIST") \
      >> "$L/recorded.log" 2>&1 ;;
  ui) PATH="$R/.venv/bin:$PATH" node "$E/run-bounded-source-c2.mjs" "$STEM" $V --project ui >> "$L/recorded.log" 2>&1 ;;
  d16) node "$E/run-bounded-source-c2.mjs" "$STEM" $V --config src/harness/d16/vitest.d16.config.ts \
      --reporter=verbose --reporter=json --outputFile.json="$D16_JSON" >> "$L/recorded.log" 2>&1 ;;
esac
log "$STEM run exit $?"
python3 "$E/run-bounded-source-guards.py" post "$STEM" >> "$L/recorded.log" 2>&1
post_status=$?
log "$STEM post exit $post_status; $(/usr/bin/grep -aE '^ +Tests ' "$E/$STEM.txt" 2>/dev/null | tr -s ' ')"
if [ "$MODE" = d16 ]; then
  [ "$post_status" -eq 0 ] || stop "d16 postflight failed; reporter not hashed"
  python3 - "$D16_JSON" <<'PY_HASH' >> "$L/recorded.log" 2>&1
from pathlib import Path
import hashlib
import json
import sys
path = Path(sys.argv[1])
assert all(not parent.is_symlink() for parent in path.parents), 'symlinked reporter ancestor'
assert path.parent.resolve(strict=True) == path.parent
assert path.is_file() and not path.is_symlink(), 'missing or symlinked d16 reporter output'
data = path.read_bytes()
json.loads(data)  # Missing/truncated/non-JSON output cannot become accepted reporter evidence.
print(json.dumps({'artifact': str(path), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
                  'hashedAfterSuccessfulPostflight': True}))
PY_HASH
  [ "$?" -eq 0 ] || stop "d16 reporter postflight hashing failed"
fi
log "$STEM end"
