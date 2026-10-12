#!/bin/bash
set -eu
R=/Users/zacheryspector/The-Movies-headless-program
C=/Users/zacheryspector/studio-specialists/founding
O=/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012
T=/Users/zacheryspector/studio-scratch/1370-ar-integrator-tools-20261011
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$R/.venv/bin:$PATH GIT_OPTIONAL_LOCKS=0
G='git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks'
cd "$C"
[ "$(df -Pk "$R" | awk 'NR==2 {print $4}')" -ge 3670016 ]
$G diff --binary HEAD > "$O/week77-before.patch.LOCAL"
$G status --porcelain=v1 --untracked-files=all > "$O/week77-before.status.LOCAL"
printf 'start=%s node=%s clone_head=%s\n' "$(date -u +%FT%TZ)" "$(node --version)" "$($G rev-parse HEAD)"
set +e
nice -n 10 node "$R/node_modules/vitest/vitest.mjs" run --config "$O/p14d1-week77-probe.config.mjs" --no-cache --reporter=default --reporter=json --outputFile.json="$O/week77-r7.json" > "$O/week77-r7.log" 2>&1
probe_ec=$?
set -e
$G diff --binary HEAD > "$O/week77-after.patch.LOCAL"
$G status --porcelain=v1 --untracked-files=all > "$O/week77-after.status.LOCAL"
cmp "$O/week77-before.patch.LOCAL" "$O/week77-after.patch.LOCAL"
cmp "$O/week77-before.status.LOCAL" "$O/week77-after.status.LOCAL"
echo "probe_child_exit=$probe_ec; clone unchanged"
[ "$(df -Pk "$R" | awk 'NR==2 {print $4}')" -ge 3145728 ]
cd "$R"
head_before=$($G rev-parse HEAD)
[ -z "$($G status --porcelain=v1 --untracked-files=all)" ]
bash "$T/control-run.sh" "$O/control-predecessor-ui-corrected" ui ui/src/lot/WorldFirstLiveWeekAdvance.test.tsx ui/src/lot/livingTurn.scheduler.test.tsx
[ "$head_before" = "$($G rev-parse HEAD)" ]
[ -z "$($G status --porcelain=v1 --untracked-files=all)" ]
echo "postflight unchanged; inspect individual control child exits/JSON"
exit "$probe_ec"
