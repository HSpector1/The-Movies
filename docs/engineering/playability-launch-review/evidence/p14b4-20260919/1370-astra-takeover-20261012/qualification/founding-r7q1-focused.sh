#!/bin/bash
set -eu
R=/Users/zacheryspector/The-Movies-headless-program
C=/Users/zacheryspector/studio-specialists/founding
O=/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$R/.venv/bin:$PATH GIT_OPTIONAL_LOCKS=0
G='git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks'
cd "$C"
[ "$(df -Pk "$R" | awk 'NR==2 {print $4}')" -ge 3670016 ]
[ "$(node --version)" = v20.20.2 ]
$G diff --binary HEAD > "$O/r7q1-focus-before.patch.LOCAL"
$G status --porcelain=v1 --untracked-files=all > "$O/r7q1-focus-before.status.LOCAL"
printf 'start=%s node=%s clone_head=%s\n' "$(date -u +%FT%TZ)" "$(node --version)" "$($G rev-parse HEAD)"
set +e
nice -n 10 node node_modules/vitest/vitest.mjs run --project core --no-file-parallelism --no-cache tests/p14d1-rival-shelving.test.ts --reporter=default --reporter=json --outputFile.json="$O/r7q1-p14d1-focused.json"
ec=$?
set -e
$G diff --binary HEAD > "$O/r7q1-focus-after.patch.LOCAL"
$G status --porcelain=v1 --untracked-files=all > "$O/r7q1-focus-after.status.LOCAL"
cmp "$O/r7q1-focus-before.patch.LOCAL" "$O/r7q1-focus-after.patch.LOCAL"
cmp "$O/r7q1-focus-before.status.LOCAL" "$O/r7q1-focus-after.status.LOCAL"
printf 'end=%s child_exit=%s unchanged=yes\n' "$(date -u +%FT%TZ)" "$ec"
exit "$ec"
