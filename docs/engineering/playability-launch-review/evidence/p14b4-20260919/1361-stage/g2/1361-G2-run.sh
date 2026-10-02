#!/usr/bin/env bash
# 1361-G2: one G2 stage, alone in the heavy lane (1361-G2-notes.md, "Run"). Build the trees first (1361-G2-trees.sh).
#   bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 <log> bash 1361-G2-run.sh <stage>
# Stages, in order: smoke, control, candidate-1, candidate-2, k4, era-guard, report.
# - smoke runs every stage at 40 weeks on p13a-core-causal-01 into out/smoke-*, so the plumbing fails in seconds;
# - report reads RED_JSON (the vitest JSON of the three 1355 RED files on the frozen candidate) when it is set;
#   without it K1 and K2 read notRun. The report refuses a RED_JSON unless the first line of the run.meta beside it
#   names a short sha that prefixes the candidate's head (1361-G2-F ruling 1.4).
# Each stage refuses an output that exists. Node is pinned to v20.20.2. Never edit this file while a stage runs.
# More heap: NODE_OPTIONS=--max-old-space-size=5120 before the lane command, and never more on this 8 GB machine.
set -u
G=/Users/zacheryspector/studio-scratch/1361-g2
X=$G/run
SEEDS=p13a-core-causal-01,seed-b
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
STAGE=${1:?stage: smoke, control, candidate-1, candidate-2, k4, era-guard or report}
[ -d "$X/out" ] || { echo "STOP: $X/out is missing; run 1361-G2-trees.sh first"; exit 3; }
log() { echo "$1; $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$X/out/runs.meta"; }
fresh() { [ -e "$X/out/$1" ] && { log "STOP: $X/out/$1 exists"; exit 3; }; return 0; }

probe() { # <tree> <label> <weeks> <seeds> <K3 control label, or ->
  local tree=$1 label=$2 weeks=$3 seeds=$4 k3=$5 k3from=""
  fresh "$label"
  [ "$k3" = - ] || k3from=$X/out/$k3
  log "$label: start, $tree tree $(cat "$X/$tree/HEAD"), $weeks weeks, seeds $seeds, node $(node --version)"
  ( cd "$X/$tree/tree" && PROBE_EXPECT=$tree PROBE_TREE_HEAD=$(cat "$X/$tree/HEAD") PROBE_WEEKS=$weeks PROBE_SEEDS=$seeds \
      PROBE_OUT=$X/out/$label PROBE_K3_FROM=$k3from \
      node_modules/.bin/vitest run --no-cache --reporter=verbose tests/1361-G2-probe.test.ts ) > "$X/out/$label.vitest.txt" 2>&1
  local rc=$?
  log "$label: vitest exit $rc"
  return $rc
}

eraguard() { # <label>: the era-guard leaf must FAIL in the K4 tree (1355-A:168); vitest exits 1 when it does
  fresh "$1.json"
  log "$1: start"
  ( cd "$X/k4/tree" && node_modules/.bin/vitest run --no-cache --reporter=verbose --reporter=json --outputFile.json="$X/out/$1.json" \
      tests/p15a1-market-integration.test.ts -t 'market-definition-era-guard' ) > "$X/out/$1.vitest.txt" 2>&1
  local rc=$?
  log "$1: vitest exit $rc (1 expected; the report reads the leaf)"
  [ -s "$X/out/$1.json" ]
}

report() { # <label> <control> <candidate-1> <candidate-2> <k4> <era-guard label>
  fresh "$1"
  log "$1: start, RED_JSON ${RED_JSON:-not set}"
  ( cd "$X/candidate/tree" && PROBE_EXPECT=report PROBE_OUT=$X/out/$1 PROBE_CONTROL=$X/out/$2 PROBE_CANDIDATE=$X/out/$3,$X/out/$4 \
      PROBE_K4=$X/out/$5 PROBE_ERA_GUARD_JSON=$X/out/$6.json PROBE_RED_JSON=${RED_JSON:-} \
      node_modules/.bin/vitest run --no-cache --reporter=verbose tests/1361-G2-report.test.ts ) > "$X/out/$1.vitest.txt" 2>&1
  local rc=$?
  log "$1: vitest exit $rc"
  return $rc
}

case $STAGE in
  smoke)
    probe control smoke-control 40 p13a-core-causal-01 - &&
      probe candidate smoke-candidate-1 40 p13a-core-causal-01 smoke-control &&
      probe candidate smoke-candidate-2 40 p13a-core-causal-01 smoke-control &&
      probe k4 smoke-k4 40 p13a-core-causal-01 - &&
      eraguard smoke-era-guard &&
      report smoke-report smoke-control smoke-candidate-1 smoke-candidate-2 smoke-k4 smoke-era-guard ;;
  control) probe control control 6240 "$SEEDS" - ;;
  candidate-1 | candidate-2) probe candidate "$STAGE" 6240 "$SEEDS" control ;;
  k4) probe k4 k4 6240 "$SEEDS" - ;;
  era-guard) eraguard era-guard ;;
  report) report report control candidate-1 candidate-2 k4 era-guard ;;
  *) echo "STOP: unknown stage $STAGE"; exit 2 ;;
esac
