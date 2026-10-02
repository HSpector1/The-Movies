#!/usr/bin/env bash
# P15 Wave 2 REDs on the Save44 base (records 1355-X5, 1356-X4, 1359-X6). Parent dry run, heavy lane, run alone under
# lane-run.sh. For each base, a fresh scratch tree from a repo archive; each RED applied alone on that base (all three
# create tests/helpers/p15-roots.ts), its test files run with JSON output, the root type gate run, then the tree
# reset to the base. Bases: OLD = 65515b66 (Save43, the last commit before slice B's production), NEW = the repo HEAD
# (Save44). REDs: 1355 r4 and 1356 r4 on both; 1359 r7 on OLD and r8 (BASE_LIVE_SAVE_VERSION 44) on NEW.
# The parent compares OLD with NEW leaf by leaf (check-p15-save44.py). The parent removes the trees afterwards.
# usage: run-p15-reds-save44.sh
set -u
R=/Users/zacheryspector/The-Movies-headless-program
E=$R/docs/engineering/playability-launch-review/evidence/p14b4-20260919
X=/Users/zacheryspector/studio-scratch/p15-save44
OLD=65515b668c8e66750ec720e06f5e8c21a8fcd979
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
log() { echo "$1; $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$X/run.meta"; }
P1355=$E/1355-stage/1355-p15a1-wave2-red-r4.patch;  H1355=2092c19874aa08af2d54301e9a56ad20b04c517d7ce769ef155efd5c20c5a686
P1356=$E/1356-stage/1356-p15a2-wave2-red-r4.patch;  H1356=32397525d8c178eab61de834af08c1b2936f530e594cb144053d9bde710bf8f1
P1359o=$E/1359-stage/1359-p15c-wave2-red-r7.patch;  H1359o=e3ccde792ac00b8b7c1bc343e74a1c1c7c2571c71303ea57aff716781463c5a9
P1359n=$X/1359-p15c-wave2-red-r8.patch;             H1359n=2a5df9771b2c77388e8d756a77323f6acb9cea8c55bf7eef26b984120520616b
F1355="tests/p15a1-market-integration.test.ts tests/p15a1-market-integration-phases.test.ts tests/p15a1-market-integration-atomicity.test.ts"
F1356="tests/p15a2-power-ranking-archive.test.ts tests/p15a2-power-ranking-archive-isolation.test.ts tests/p15a2-power-ranking-archive-harness.test.ts"
F1359="tests/p15c2-campaign-legacy-integration.test.ts tests/p15c-wave-r-retention.test.ts tests/p15c1-campaign-legacy.test.ts"
for pair in "$P1355 $H1355" "$P1356 $H1356" "$P1359o $H1359o" "$P1359n $H1359n"; do
  set -- $pair; [ "$(shasum -a 256 "$1" | cut -c1-64)" = "$2" ] || { log "STOP: $1 hash differs"; exit 2; }
done
NEW=$(git -C "$R" rev-parse HEAD)
log "start: OLD $OLD, NEW $NEW, node $(node --version)"
for label in old new; do
  T=$X/tree-$label
  [ -e "$T" ] && { log "STOP: $T exists"; exit 2; }
  B=$OLD; [ $label = new ] && B=$NEW
  mkdir -p "$T"
  git -C "$R" archive "$B" src bridge ui generated scripts package.json package-lock.json tsconfig.json tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md | tar -x -C "$T"
  git -C "$R" archive "$B" tests ':!tests/fixtures' | tar -x -C "$T"
  for d in docs node_modules art tools; do ln -s "$R/$d" "$T/$d"; done
  mkdir -p "$T/tests/fixtures" && for e in "$R"/tests/fixtures/*; do ln -s "$e" "$T/tests/fixtures/$(basename "$e")"; done
  git -C "$T" init -q && git -C "$T" add -A . && git -C "$T" -c user.name=parent -c user.email=parent@local commit -q -m "base $B"
  log "$label tree built at $B"
  for red in 1355 1356 1359; do
    case $red in 1355) P=$P1355; F=$F1355 ;; 1356) P=$P1356; F=$F1356 ;; 1359) P=$P1359o; [ $label = new ] && P=$P1359n; F=$F1359 ;; esac
    git -C "$T" apply --index "$P" || { log "STOP: $label $red apply failed"; exit 1; }
    git -C "$T" -c user.name=parent -c user.email=parent@local commit -q -m "red $red $(basename "$P")"
    ( cd "$T" && node_modules/.bin/vitest run --project core --no-cache --reporter=default --reporter=json \
        --outputFile.json="$X/$label-$red.json" $F > "$X/$label-$red.txt" 2>&1 ); v=$?
    ( cd "$T" && node_modules/.bin/tsc -p tsconfig.json --noEmit > "$X/$label-$red-tsc.txt" 2>&1 ); t=$?
    log "$label $red ($(basename "$P")): vitest exit $v; $(grep -aE '^ +Tests ' "$X/$label-$red.txt" | tr -s ' '); tsc exit $t, $(grep -c 'error TS' "$X/$label-$red-tsc.txt") errors"
    git -C "$T" reset -q --hard HEAD~1 && git -C "$T" clean -fdq -e node_modules -e docs -e art -e tools
    [ -z "$(git -C "$T" status --porcelain)" ] || { log "STOP: $label tree not clean after $red"; exit 1; }
  done
done
log "end"
