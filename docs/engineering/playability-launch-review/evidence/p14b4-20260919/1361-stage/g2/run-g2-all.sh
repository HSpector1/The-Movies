#!/usr/bin/env bash
# 1361-G2: build the trees, then every stage in order, stopping at the first failure; one heavy-lane job (lane-run.sh).
# Stages per 1361-G2-notes.md "Run"; RED_JSON from the parent's dry run of the frozen (c) (1361-G2-F ruling 3).
set -u
G=/Users/zacheryspector/studio-scratch/1361-g2
echo "== trees start $(date '+%Y-%m-%d %H:%M:%S %Z')"
bash $G/1361-G2-trees.sh p15a1-c-r1 > $G/trees.log 2>&1 || { echo "== trees FAILED $(date '+%H:%M:%S')"; exit 3; }
echo "== trees ok $(date '+%H:%M:%S')"
for st in smoke control candidate-1 candidate-2 k4 era-guard; do
  echo "== $st start $(date '+%H:%M:%S')"
  bash $G/1361-G2-run.sh $st > $G/run/out/stage-$st.log 2>&1; rc=$?
  echo "== $st exit $rc $(date '+%H:%M:%S')"
  [ $rc = 0 ] || exit 4
done
echo "== report start $(date '+%H:%M:%S')"
RED_JSON=/Users/zacheryspector/studio-scratch/1361-prod/x/r2c/p15a1.json bash $G/1361-G2-run.sh report > $G/run/out/stage-report.log 2>&1
echo "== report exit $? $(date '+%Y-%m-%d %H:%M:%S %Z')"
