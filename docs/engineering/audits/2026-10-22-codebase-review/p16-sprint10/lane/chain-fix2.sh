#!/bin/bash
# Relaunch chain for FIX-2 (2c50c9df): compiler r6, focused GREEN r7, RED-at-parent r8. Run once AC power is back.
set -u
C=/Users/zacheryspector/studio-scratch/p16-sprint10-20261027
FILES="tests/p17-continuation-law.test.ts tests/p17-continuation-seam.test.ts tests/p17-continuation-signals.test.ts tests/p17-p16-rights.test.ts tests/p17-save-step.test.ts tests/bridge-runtime-checkpoint.test.ts tests/p16-r2-validator.test.ts tests/p16a-save-v46.test.ts"
for a in types-r6 green-r7 red-r8; do rm -rf "$C/$a"; mkdir "$C/$a"; done
for f in bind.py launch.sh run.sh SELECTION.json; do sed -e 's#p16-sprint10-20261027/types-r3#p16-sprint10-20261027/types-r6#g' "$C/types-r3/$f" > "$C/types-r6/$f"; done
python3 -I -c "import json;p='$C/types-r6/SELECTION.json';s=json.load(open(p));s['head']='PENDING_BIND_AT_LAUNCH';s['sourceManifestEntries']=0;s['purpose']='Sprint 10 compiler-first r6 after FIX-2';json.dump(s,open(p,'w'),indent=2)"
for f in bind.py launch.sh; do sed -e 's#p16-sprint10-20261027/green-r4#p16-sprint10-20261027/green-r7#g' "$C/green-r4/$f" > "$C/green-r7/$f"; done
python3 -I - "$C/green-r7/SELECTION.json" "$FILES" <<'PY'
import json,sys
json.dump({"head":"PENDING_BIND_AT_LAUNCH","sourceManifestEntries":0,"purpose":"Sprint 10 GREEN focused r7 after FIX-2: the five p17 files, bridge-runtime-checkpoint and two save-era consumers","children":[{"label":"focused","completeFiles":sys.argv[2].split()}],"budgets":{"coreDefaultMilliseconds":5000,"timeoutOverride":False}},open(sys.argv[1],'w'),indent=2)
PY
sed -e 's#p16-sprint10-20261027/green-r4#p16-sprint10-20261027/green-r7#g' -e "s#^run focused .*#run focused node node_modules/vitest/vitest.mjs run --project core $FILES --reporter=default --reporter=json --outputFile=\"\$S/focused.json\"#" "$C/green-r4/run.sh" > "$C/green-r7/run.sh"
for f in bind.py launch.sh run.sh SELECTION.json; do sed -e 's#p16-sprint10-20261027/red-r5#p16-sprint10-20261027/red-r8#g' "$C/red-r5/$f" > "$C/red-r8/$f"; done
python3 -I -c "import json;p='$C/red-r8/SELECTION.json';s=json.load(open(p));s['head']='PENDING_BIND_AT_LAUNCH';s['sourceManifestEntries']=0;s['purpose']='RED premise r8 at the parent for the FIX-2 cases of tests/p17-p16-rights.test.ts';json.dump(s,open(p,'w'),indent=2)"
for f in types-r6 green-r7 red-r8; do bash -n "$C/$f/run.sh" || exit 9; done
run_wait() { bash "$1/launch.sh" | tail -1; [ -f "$1/lane.log.meta" ] || { ls "$1"; return 1; }; until /usr/bin/grep -qE '^(end, exit|STOP)' "$1/lane.log.meta" 2>/dev/null; do sleep 5; done; tail -1 "$1/lane.log.meta"; /usr/bin/grep -E '^=== END|^ (✓|×|❯) |Tests ' "$1/lane.log" | cut -c1-120; /usr/bin/grep -E 'error TS' "$1/lane.log" | head -8 | cut -c1-200; }
echo "===== types-r6"; run_wait "$C/types-r6" || exit 1
echo "===== green-r7"; run_wait "$C/green-r7" || exit 1
echo "===== red-r8"; run_wait "$C/red-r8" || exit 1
