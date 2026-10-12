#!/bin/bash
set -eu
R=/Users/zacheryspector/The-Movies-headless-program
O=/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012
T=/Users/zacheryspector/studio-scratch/1370-ar-integrator-tools-20261011
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$R/.venv/bin:$PATH
export GIT_OPTIONAL_LOCKS=0
G='git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks'
cd "$R"
[ "$(node --version)" = v20.20.2 ]
[ -z "$($G status --porcelain=v1 --untracked-files=all)" ]
[ "$(df -Pk "$R" | awk 'NR==2 {print $4}')" -ge 3670016 ]
head_before=$($G rev-parse HEAD)
echo "$head_before" > "$O/control-frozen-HEAD"
$G ls-files --stage -z | shasum -a 256 > "$O/control-frozen-index.sha256"
bash "$T/control-run.sh" "$O/control-predecessor-ui" ui ui/src/WorldFirstLiveWeekAdvance.test.tsx ui/src/livingTurn.scheduler.test.tsx
[ "$(df -Pk "$R" | awk 'NR==2 {print $4}')" -ge 3145728 ]
bash "$T/control-run.sh" "$O/control-predecessor-core" core tests/bridge-process-restart.test.ts tests/p15c2-campaign-legacy-integration.test.ts
[ "$head_before" = "$($G rev-parse HEAD)" ]
[ -z "$($G status --porcelain=v1 --untracked-files=all)" ]
$G ls-files --stage -z | shasum -a 256 > "$O/control-postflight-index.sha256"
cmp "$O/control-frozen-index.sha256" "$O/control-postflight-index.sha256"
echo 'CONTROL POSTFLIGHT PASS; read individual child exits and JSON, not this wrapper as test success'
