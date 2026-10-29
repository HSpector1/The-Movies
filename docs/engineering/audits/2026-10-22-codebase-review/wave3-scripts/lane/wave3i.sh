#!/bin/bash
# wave3i: after the primary worktree is fast-forwarded to the round-5 head. Static gates; the round-5 files; then three
# throwaway-tree checks: the split C-01 drafts red at b2d3d97e, the p15a2 forged-envelope witness red on a mutant of HEAD
# (corporateConditionLive.ts event guard removed), and prepared-reuse truly solo.
export PATH="/usr/local/bin:$PATH"
WT=/Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt
RED=/Users/zacheryspector/studio-scratch/p16-c01-red-wt
MUT=/Users/zacheryspector/studio-scratch/p16-mutant-wt
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
S=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts
G="git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks"
C01=tests/p16-rebase-c01-absorbed-claims.test.ts
cd "$WT" || exit 9
HEADSHA=$($G rev-parse HEAD)
echo "node $(node --version) at $(date '+%F %T'); worktree HEAD ${HEADSHA:0:8}; dirty $($G status --porcelain | wc -l | tr -d ' '); load $(uptime | sed 's/.*load/load/'); free $(df -k ~ | awk 'NR==2 {printf "%.2f GB", $4/1048576}')"
. "$S/lane/p16-env.sh"
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
run typecheck npm run -s typecheck
run typecheck:bridge npm run -s typecheck:bridge
run check:bridge-contract npm run -s check:bridge-contract
run check:bridge-contract:fixtures npm run -s check:bridge-contract:fixtures
CHANGED=$( { $G diff --name-only 07e6c669 HEAD -- tests; } | /usr/bin/grep '\.test\.ts$' | sort -u)
MORE="tests/p16-rebase-c01-absorbed-claims.test.ts tests/p15a2-power-ranking-archive.test.ts tests/p15a1-market-integration.test.ts tests/p15b2-corporate-condition-save.test.ts tests/p15b4-studio-closure-save.test.ts tests/p15b-legacy-v3.test.ts tests/bridge-stabilization-l24-quote-contract.test.ts tests/p14c3-profession-history.test.ts tests/p14p3-directing-promises.test.ts tests/p14c2b-save-v36.test.ts tests/p14c2rm-writer-continuation.test.ts tests/frozen-save-builder-projection.test.ts tests/p06a-w1-release-authority.test.ts tests/p13b-s3-save-v23.test.ts tests/p1364-late-founding.test.ts tests/p14d2-save46-migration.test.ts tests/p14r3-save-v41.test.ts tests/stabilization-l05-closed-rival-claims.test.ts tests/stabilization-l19-save07-persistence.test.ts tests/p16b-condition-readers.test.ts tests/p16b-live-condition-readers.test.ts tests/facility-move-demolish.test.ts tests/p13b-s7-announcements.test.ts tests/p13b-s8-old-era-period.test.ts tests/p14c3-offmenu-extensions.test.ts tests/p14c3-transitions.test.ts tests/p14d1-rival-shelving.test.ts tests/p15b2-corporate-condition-live.test.ts tests/p15b4-pending-player-adoption.test.ts tests/p15b4-player-proposal-transaction.test.ts tests/p15b4-proposal-transaction.test.ts tests/p15c2-campaign-legacy-integration.test.ts"
FILES=$(printf '%s\n' $CHANGED $MORE | /usr/bin/grep -v '^$' | sort -u | while read f; do [ -f "$f" ] && echo "$f"; done)
echo "=== FILES ($(echo "$FILES" | wc -l | tr -d ' '))"; echo "$FILES"
run vitest:core npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/wave3i-core.json" $FILES
# (a) the split C-01 drafts at b2d3d97e
[ -e "$RED" ] && { echo "red tree exists; skipping (a)"; } || {
  $G worktree add --detach --no-checkout "$RED" b2d3d97e && $G -C "$RED" sparse-checkout init --no-cone && printf '/*\n!/docs/\n!/ui/\n' > "$($G -C "$RED" rev-parse --git-path info/sparse-checkout)" && $G -C "$RED" checkout --detach b2d3d97e -q && ln -s "$WT/node_modules" "$RED/node_modules" && $G show "$HEADSHA:$C01" > "$RED/$C01"
  echo "red tree $($G -C "$RED" rev-parse --short HEAD) with $C01 from ${HEADSHA:0:8}; free $(df -k ~ | awk 'NR==2 {printf "%.2f GB", $4/1048576}')"
  (cd "$RED" && run vitest:c01-red-split npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/c01-red-split.json" "$C01")
  $G worktree remove --force "$RED" && echo "red tree removed"
}
# (b) the mutant: HEAD with the corporateConditionLive.ts event table-3 guard removed
[ -e "$MUT" ] && { echo "mutant tree exists; skipping (b)"; } || {
  $G worktree add --detach --no-checkout "$MUT" "$HEADSHA" && $G -C "$MUT" sparse-checkout init --no-cone && cp "$($G rev-parse --git-path info/sparse-checkout)" "$($G -C "$MUT" rev-parse --git-path info/sparse-checkout)" && $G -C "$MUT" checkout --detach "$HEADSHA" -q && ln -s "$WT/node_modules" "$MUT/node_modules" && ln -s "$WT/ui/node_modules" "$MUT/ui/node_modules"
  python3 -I - "$MUT/src/core/corporateConditionLive.ts" <<'PY'
import sys; p=sys.argv[1]; s=open(p).read()
line="    if (!rightsEstate && event.phaseOrderVersion > 2) fail('estate phase table is not admitted in this predecessor era')\n"
assert s.count(line)==1, s.count(line)
open(p,'w').write(s.replace(line,'    // MUTANT (wave3i): event table-3 guard removed\n')); print('mutant applied')
PY
  echo "mutant tree $($G -C "$MUT" rev-parse --short HEAD): $($G -C "$MUT" diff --stat | tail -1); free $(df -k ~ | awk 'NR==2 {printf "%.2f GB", $4/1048576}')"
  (cd "$MUT" && run vitest:p15a2-mutant npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/p15a2-mutant.json" tests/p15a2-power-ranking-archive.test.ts)
  $G worktree remove --force "$MUT" && echo "mutant tree removed"
}
# (c) prepared-reuse truly solo
run vitest:prepared-reuse-solo npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/prepared-reuse-solo.json" tests/bridge-runtime-checkpoint-prepared-reuse.test.ts
echo "=== ALL DONE at $(date '+%F %T'); free $(df -k ~ | awk 'NR==2 {printf "%.2f GB", $4/1048576}')"
