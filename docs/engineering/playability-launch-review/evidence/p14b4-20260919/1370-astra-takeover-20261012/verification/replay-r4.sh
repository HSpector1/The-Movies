#!/bin/bash
set -eu
R=/Users/zacheryspector/The-Movies-headless-program
C=/Users/zacheryspector/studio-specialists/founding
O=/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$R/.venv/bin:$PATH
export GIT_OPTIONAL_LOCKS=0
G='git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks'
cd "$C"
[ "$(df -Pk "$C" | awk 'NR==2 {print $4}')" -ge 3670016 ]
[ "$(node --version)" = v20.20.2 ]
$G diff --binary HEAD > "$O/r4-replay-before.patch.LOCAL"
$G status --porcelain=v1 --untracked-files=all > "$O/r4-replay-before.status.LOCAL"
printf 'start=%s node=%s head=%s\n' "$(date -u +%FT%TZ)" "$(node --version)" "$($G rev-parse HEAD)"
set +e
nice -n 10 node node_modules/vite-node/vite-node.mjs /private/tmp/claude-501/-Users-zacheryspector/21e515ff-0aed-48b0-9b7f-11c9d5239850/scratchpad/fixverify-r6-d4e2/probe-a-r4-forgeries.ts
ec=$?
set -e
$G diff --binary HEAD > "$O/r4-replay-after.patch.LOCAL"
$G status --porcelain=v1 --untracked-files=all > "$O/r4-replay-after.status.LOCAL"
cmp "$O/r4-replay-before.patch.LOCAL" "$O/r4-replay-after.patch.LOCAL"
cmp "$O/r4-replay-before.status.LOCAL" "$O/r4-replay-after.status.LOCAL"
printf 'end=%s child_exit=%s unchanged=yes\n' "$(date -u +%FT%TZ)" "$ec"
exit "$ec"
