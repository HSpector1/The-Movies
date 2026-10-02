#!/usr/bin/env bash
# 1361-X4 follow-up: the sibling patch r2's file on p15c-c-r1 (expect 5 passed) and on p15a1-b-r2 (the RED-side baseline:
# 4 on the freezeCampaignLegacyWeek message, C3b on "no campaignLegacy root"). Each in its own archive tree with
# build-tree.sh's layout: node_modules, art and tools linked; tests/fixtures and the E directory real dirs of per-entry
# links; bridge-contract-union-fixtures.ts copied. Run alone under lane-run.sh. Writes only under S/1361-sibling/v2-*.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
EREL=docs/engineering/playability-launch-review/evidence/p14b4-20260919
W=/Users/zacheryspector/studio-scratch/1361-prod/tree
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
rc_all=0
for pair in "p15c-c-r1 v2-c" "p15a1-b-r2 v2-b"; do
  set -- $pair
  Y=/Users/zacheryspector/studio-scratch/1361-sibling/$2
  [ -e "$Y" ] && { echo "STOP: $Y exists"; exit 2; }
  mkdir -p "$Y/tree" "$Y/out" || exit 2
  git -C "$W" archive "$1" | tar -x -C "$Y/tree" || { echo "STOP: archive $1 failed"; exit 2; }
  for d in node_modules art tools; do ln -s "$R/$d" "$Y/tree/$d"; done
  mkdir -p "$Y/tree/tests/fixtures" && for e in "$R"/tests/fixtures/*; do b=$(basename "$e"); [ "$b" = bridge-contract-union-fixtures.ts ] || ln -s "$e" "$Y/tree/tests/fixtures/$b"; done
  cp "$R/tests/fixtures/bridge-contract-union-fixtures.ts" "$Y/tree/tests/fixtures/" || exit 2
  mkdir -p "$Y/tree/$EREL" && for e in "$R/$EREL"/*; do ln -s "$e" "$Y/tree/$EREL/$(basename "$e")"; done
  (cd "$Y/tree" && git apply --check "$R/$EREL/1359-stage/1359-p15c-wave2-sibling-r2.patch" && git apply "$R/$EREL/1359-stage/1359-p15c-wave2-sibling-r2.patch") || { echo "STOP: the patch does not apply on $1"; exit 3; }
  echo "sibling $2: $1 $(git -C "$W" rev-parse "$1") + sibling-r2 (blob $(git hash-object "$Y/tree/tests/p15c2-campaign-legacy-sibling.test.ts" | cut -c1-7)), node $(node --version), start $(date '+%Y-%m-%d %H:%M:%S %Z')" > "$Y/out/run.meta"
  (cd "$Y/tree" && ./node_modules/.bin/vitest run --project core --no-cache --reporter=default --reporter=json --outputFile.json="$Y/out/sibling.json" tests/p15c2-campaign-legacy-sibling.test.ts > "$Y/out/sibling.txt" 2>&1); rc=$?
  echo "sibling $2: vitest exit $rc; $(/usr/bin/grep -E '^ +Tests ' "$Y/out/sibling.txt" | tail -1); end $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$Y/out/run.meta"
  echo "$2 exit $rc"
done
