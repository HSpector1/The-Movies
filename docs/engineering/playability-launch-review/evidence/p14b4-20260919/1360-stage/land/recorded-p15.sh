#!/usr/bin/env bash
# P15 Wave 2 RED landings (1360-F), one recorded run per call, under lane-run.sh: guards pre, the bounded-source
# recorder, guards post. Modeled on studio-scratch/1358-land/recorded3.sh.
# usage: recorded-p15.sh red1356 | mint1355 | red1355 | mint1359 | red1359
#   red1356:  stem 1360-p15a2-red-recorded, the archive, isolation and harness files (before any mint; 1360-F ruling 3)
#   mint1355: stem 1360-p15a1-mint, E/1355-P-p15a1-market-producer.ts, P15A1_CAPTURE_MODE=mint, P15A1_PRODUCER_HEAD=HEAD
#   red1355:  stem 1360-p15a1-red-recorded, the three market files (after the fixture commit with the sha pin)
#   mint1359: stem 1360-p15c-mint, E/1359-P-p15c2-route-l-producer.ts, P15C2_PRODUCER_HEAD=HEAD
#   red1359:  stem 1360-p15c-red-recorded, the integration, retention and p15c1 files
# Checks: HEAD equals the fetched remote, clean source paths, free disk >= 5 GiB, the stem rule, none of the stem's five
# output names present; for a mint, the producer committed at the E root. NO COMMITS while it runs. A failed mint is a
# finding: stop, report, no retry (1360-F ruling 8).
set -u
R=/Users/zacheryspector/The-Movies-headless-program
E=docs/engineering/playability-launch-review/evidence/p14b4-20260919
L=/Users/zacheryspector/studio-scratch/1360-land
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
cd "$R" || exit 2
log() { echo "$1; $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$L/recorded-p15.meta"; }
stop() { log "STOP: $1"; exit 3; }
F1356="tests/p15a2-power-ranking-archive.test.ts tests/p15a2-power-ranking-archive-isolation.test.ts tests/p15a2-power-ranking-archive-harness.test.ts"
F1355="tests/p15a1-market-integration.test.ts tests/p15a1-market-integration-phases.test.ts tests/p15a1-market-integration-atomicity.test.ts"
F1359="tests/p15c2-campaign-legacy-integration.test.ts tests/p15c-wave-r-retention.test.ts tests/p15c1-campaign-legacy.test.ts"
MODE=${1:-}
case "$MODE" in
  red1356) STEM=1360-p15a2-red-recorded ;;
  mint1355) STEM=1360-p15a1-mint; PRODUCER="$E/1355-P-p15a1-market-producer.ts" ;;
  red1355) STEM=1360-p15a1-red-recorded ;;
  mint1359) STEM=1360-p15c-mint; PRODUCER="$E/1359-P-p15c2-route-l-producer.ts" ;;
  red1359) STEM=1360-p15c-red-recorded ;;
  *) echo "usage: recorded-p15.sh red1356|mint1355|red1355|mint1359|red1359"; exit 2 ;;
esac
caffeinate -is -w $$ &
log "$STEM start at $(git rev-parse HEAD), node $(node --version)"
git fetch -q origin wip/headless-program-20260916-ts || stop "fetch failed"
[ "$(git rev-parse HEAD)" = "$(git rev-parse FETCH_HEAD)" ] || stop "HEAD is not the remote branch head"
[ -z "$(git status --porcelain -- src tests ui bridge generated scripts)" ] || stop "source paths are dirty"
avail=$(df -k / | tail -1 | awk '{print $4}')
[ "$avail" -ge 5242880 ] || stop "free disk below 5 GiB ($avail KiB)"
[[ "$STEM" =~ ^[0-9]{3,4}[a-z0-9-]*$ ]] || stop "stem $STEM does not match the recorder's name rule"
for f in "$E/$STEM.json" "$E/$STEM.patch" "$E/$STEM.txt" "$E/$STEM-preflight.json" "$E/$STEM-postflight.json"; do
  [ -e "$f" ] && stop "$STEM output $f already exists"
done
case "$MODE" in mint*) git ls-files --error-unmatch "$PRODUCER" >/dev/null 2>&1 || stop "the producer $PRODUCER is not committed" ;; esac
log "$STEM pre"
python3 "$E/run-bounded-source-guards.py" pre "$STEM" 0 >> "$L/recorded-p15.log" 2>&1 || stop "$STEM preflight failed"
log "$STEM run"
case "$MODE" in
  red1356) PATH="$R/.venv/bin:$PATH" node "$E/run-bounded-source-c2.mjs" "$STEM" node_modules/.bin/vitest run --project core $F1356 >> "$L/recorded-p15.log" 2>&1 ;;
  mint1355) P15A1_PRODUCER_HEAD=$(git rev-parse HEAD) P15A1_CAPTURE_MODE=mint PATH="$R/.venv/bin:$PATH" \
      node "$E/run-bounded-source-c2.mjs" "$STEM" node_modules/.bin/vite-node "$PRODUCER" >> "$L/recorded-p15.log" 2>&1 ;;
  red1355) PATH="$R/.venv/bin:$PATH" node "$E/run-bounded-source-c2.mjs" "$STEM" node_modules/.bin/vitest run --project core $F1355 >> "$L/recorded-p15.log" 2>&1 ;;
  mint1359) P15C2_PRODUCER_HEAD=$(git rev-parse HEAD) PATH="$R/.venv/bin:$PATH" \
      node "$E/run-bounded-source-c2.mjs" "$STEM" node_modules/.bin/vite-node "$PRODUCER" >> "$L/recorded-p15.log" 2>&1 ;;
  red1359) PATH="$R/.venv/bin:$PATH" node "$E/run-bounded-source-c2.mjs" "$STEM" node_modules/.bin/vitest run --project core $F1359 >> "$L/recorded-p15.log" 2>&1 ;;
esac
log "$STEM run exit $?"
python3 "$E/run-bounded-source-guards.py" post "$STEM" >> "$L/recorded-p15.log" 2>&1
log "$STEM post exit $?; $(grep -aE '^ +Tests ' "$E/$STEM.txt" 2>/dev/null | tr -s ' ')"
log "$STEM end"
