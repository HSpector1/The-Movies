#!/usr/bin/env bash
# Run only after x2 ends, under the heavy lane. This is a diagnostic scratch run.
set -euo pipefail
R=/Users/zacheryspector/The-Movies-headless-program
S=/Users/zacheryspector/studio-scratch/1361-sweep
E=$R/docs/engineering/playability-launch-review/evidence/p14b4-20260919
X=$S/x2-guards
T=$X/tree
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
/usr/bin/grep -q '^end;' "$S/x2/x.meta" || { echo 'STOP: x2 has not ended'; exit 2; }
mkdir -p "$X"
bash "$S/build-unit-tree.sh" x2-guards \
  "$E/1359-stage/1359-p15c-wave2-sibling-r2.patch" \
  "$S/hygiene/1361-hygiene-comment.patch" \
  "$S/H/patch.diff" "$S/G1/patch.diff" "$S/G2/patch.diff" "$S/G3/patch.diff" \
  "$S/G4a/patch.diff" "$S/G4b/patch.diff" "$S/G5/patch.diff" > "$X/build.txt" 2>&1
reference_tree=$(git -C "$S/x2/tree" rev-parse 'HEAD^{tree}')
[ "$(git -C "$T" rev-parse 'HEAD^{tree}')" = "$reference_tree" ] || { echo 'STOP: observer source differs from x2'; exit 2; }
echo "Uninstrumented tree equals x2: $reference_tree" >> "$X/build.txt"
python3 "$S/observe-guards.py" "$T"
git -C "$T" diff --check
git -C "$T" diff -- tests > "$X/observer.patch"
date '+start %Y-%m-%d %H:%M:%S %Z' > "$X/observer.meta"
node --version >> "$X/observer.meta"
# The script is a child process; this does not change the session's working directory.
cd "$T"
set +e
PATH="$R/.venv/bin:$PATH" node_modules/.bin/vitest run --project core --no-cache \
  tests/p14b1-t4-regressions.test.ts tests/p14c2rm-writer-continuation.test.ts \
  tests/p14c3-save-v38.test.ts tests/contracts/studio-events.contract.test.ts \
  tests/contracts/v14-boundary-guards.contract.test.ts tests/v14-migration.contract.test.ts \
  > "$X/observer.txt" 2>&1
result=$?
set -e
echo "vitest exit $result" >> "$X/observer.meta"
git diff --check
git status --porcelain >> "$X/observer.meta"
date '+end %Y-%m-%d %H:%M:%S %Z' >> "$X/observer.meta"
