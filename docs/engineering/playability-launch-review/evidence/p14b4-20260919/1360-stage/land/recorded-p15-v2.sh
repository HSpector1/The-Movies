#!/usr/bin/env bash
# P15 Wave 2 RED landings (1360-F, hardened by 1360-F2 ruling 3), one recorded run per call, under lane-run.sh: guards
# pre, the bounded-source recorder, guards post. A versioned copy of recorded-p15.sh, which ran step 2 (red1356).
# usage: recorded-p15-v2.sh mint1355 | red1355 | mint1359 | red1359
#   mint1355: stem 1360-p15a1-mint, E/1355-P-p15a1-market-producer.ts (r3), P15A1_CAPTURE_MODE=mint, P15A1_PRODUCER_HEAD=HEAD
#   red1355:  stem 1360-p15a1-red-recorded, the three market files, after the fixture commit with the sha pin
#   mint1359: stem 1360-p15c-mint, E/1359-P-p15c2-route-l-producer.ts (r4), P15C2_PRODUCER_HEAD=HEAD
#   red1359:  stem 1360-p15c-red-recorded, the integration, retention and p15c1 files, after the fixture commit
# Every check runs before the guards' pre step, so a failed check spends no stem: HEAD equals the fetched remote; clean
# source paths; free disk >= 5 GiB; the stem rule; none of the stem's five output names present; tests and
# tests/fixtures are real directories. Mint: the producer is in HEAD's tree, equal to HEAD, with its staged sha256, and
# its output directories do not exist. red1355: the capture MANIFEST is in HEAD and CAPTURE_MANIFEST_SHA256 holds its
# sha256. red1359: the route L MANIFEST is in HEAD. NO COMMITS while it runs. A failed mint is a finding: stop, report,
# no retry (1360-F ruling 8).
set -u
R=/Users/zacheryspector/The-Movies-headless-program
E=docs/engineering/playability-launch-review/evidence/p14b4-20260919
L=/Users/zacheryspector/studio-scratch/1360-land
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
cd "$R" || exit 2
log() { echo "$1; $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$L/recorded-p15.meta"; }
stop() { log "STOP: $1"; exit 3; }
sha() { shasum -a 256 "$1" | cut -c1-64; }
F1355="tests/p15a1-market-integration.test.ts tests/p15a1-market-integration-phases.test.ts tests/p15a1-market-integration-atomicity.test.ts"
F1359="tests/p15c2-campaign-legacy-integration.test.ts tests/p15c-wave-r-retention.test.ts tests/p15c1-campaign-legacy.test.ts"
CAPDIR=tests/fixtures/p15/genuine-below-p15-save-step
PINDIR=tests/fixtures/p15/p15a1-market-pins
ROUTEDIR=tests/fixtures/p15/p15c2-route-l-captures
OUT=""
MODE=${1:-}
case "$MODE" in
  mint1355) STEM=1360-p15a1-mint; PRODUCER="$E/1355-P-p15a1-market-producer.ts"
    PSHA=5007e231468ad566d7c69fe45b78261270550bbc1c9c8ad7c488c2b3e8ba5707; OUT="$CAPDIR $PINDIR" ;;
  red1355) STEM=1360-p15a1-red-recorded ;;
  mint1359) STEM=1360-p15c-mint; PRODUCER="$E/1359-P-p15c2-route-l-producer.ts"
    PSHA=78c1d1055973dfd98479f511140d9ec44978639b83ae27e6389ffb55ada35186; OUT="$ROUTEDIR" ;;
  red1359) STEM=1360-p15c-red-recorded ;;
  *) echo "usage: recorded-p15-v2.sh mint1355|red1355|mint1359|red1359"; exit 2 ;;
esac
caffeinate -is -w $$ &
log "$STEM start at $(git rev-parse HEAD), node $(node --version), recorded-p15-v2.sh"
git fetch -q origin wip/headless-program-20260916-ts || stop "fetch failed"
[ "$(git rev-parse HEAD)" = "$(git rev-parse FETCH_HEAD)" ] || stop "HEAD is not the remote branch head"
[ -z "$(git status --porcelain -- src tests ui bridge generated scripts)" ] || stop "source paths are dirty"
avail=$(df -k / | tail -1 | awk '{print $4}')
[ "$avail" -ge 5242880 ] || stop "free disk below 5 GiB ($avail KiB)"
[[ "$STEM" =~ ^[0-9]{3,4}[a-z0-9-]*$ ]] || stop "stem $STEM does not match the recorder's name rule"
for f in "$E/$STEM.json" "$E/$STEM.patch" "$E/$STEM.txt" "$E/$STEM-preflight.json" "$E/$STEM-postflight.json"; do
  [ -e "$f" ] && stop "$STEM output $f already exists"
done
for d in tests tests/fixtures; do { [ -d "$d" ] && [ ! -L "$d" ]; } || stop "$d is not a real directory"; done
[ -L tests/fixtures/p15 ] && stop "tests/fixtures/p15 is a link"
case "$MODE" in
  mint*)
    git cat-file -e "HEAD:$PRODUCER" 2>/dev/null || stop "the producer $PRODUCER is not in HEAD"
    git diff --quiet HEAD -- "$PRODUCER" || stop "the producer $PRODUCER differs from HEAD"
    [ "$(sha "$PRODUCER")" = "$PSHA" ] || stop "the producer $PRODUCER is not the staged revision"
    for d in $OUT; do [ -e "$d" ] && stop "the output directory $d already exists"; done ;;
  red1355)
    git cat-file -e "HEAD:$CAPDIR/MANIFEST.json" 2>/dev/null || stop "the capture MANIFEST is not in HEAD"
    pin=$(grep -E "^const CAPTURE_MANIFEST_SHA256: string [|] null = '[0-9a-f]{64}'$" tests/p15a1-market-integration.test.ts | grep -oE "[0-9a-f]{64}")
    { [ -n "$pin" ] && [ "$pin" = "$(sha "$CAPDIR/MANIFEST.json")" ]; } || stop "CAPTURE_MANIFEST_SHA256 does not hold the capture MANIFEST's sha256" ;;
  red1359)
    git cat-file -e "HEAD:$ROUTEDIR/MANIFEST.json" 2>/dev/null || stop "the route L MANIFEST is not in HEAD" ;;
esac
log "$STEM pre"
python3 "$E/run-bounded-source-guards.py" pre "$STEM" 0 >> "$L/recorded-p15.log" 2>&1 || stop "$STEM preflight failed"
log "$STEM run"
case "$MODE" in
  mint1355) P15A1_PRODUCER_HEAD=$(git rev-parse HEAD) P15A1_CAPTURE_MODE=mint PATH="$R/.venv/bin:$PATH" \
      node "$E/run-bounded-source-c2.mjs" "$STEM" node_modules/.bin/vite-node "$PRODUCER" >> "$L/recorded-p15.log" 2>&1 ;;
  red1355) PATH="$R/.venv/bin:$PATH" node "$E/run-bounded-source-c2.mjs" "$STEM" node_modules/.bin/vitest run --project core $F1355 >> "$L/recorded-p15.log" 2>&1 ;;
  mint1359) P15C2_PRODUCER_HEAD=$(git rev-parse HEAD) PATH="$R/.venv/bin:$PATH" \
      node "$E/run-bounded-source-c2.mjs" "$STEM" node_modules/.bin/vite-node "$PRODUCER" >> "$L/recorded-p15.log" 2>&1 ;;
  red1359) PATH="$R/.venv/bin:$PATH" node "$E/run-bounded-source-c2.mjs" "$STEM" node_modules/.bin/vitest run --project core $F1359 >> "$L/recorded-p15.log" 2>&1 ;;
esac
log "$STEM recorder exit $?"
python3 "$E/run-bounded-source-guards.py" post "$STEM" >> "$L/recorded-p15.log" 2>&1
post=$?
rc=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get("exitCode"))' "$E/$STEM.json" 2>&1)
log "$STEM post exit $post; command exitCode $rc; $(grep -aE '^ +Tests ' "$E/$STEM.txt" 2>/dev/null | tr -s ' ')"
for d in $OUT; do log "$STEM wrote $d: $(ls "$d" 2>&1 | tr '\n' ' ')"; done
log "$STEM end"
