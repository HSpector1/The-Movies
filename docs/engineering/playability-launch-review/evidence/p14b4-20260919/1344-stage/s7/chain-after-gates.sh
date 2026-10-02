#!/usr/bin/env bash
# Starts run-s7.sh once the 1344 recorded gates end. Usage: chain-after-gates.sh <gates runner pid> <C_SHA>
# A STOP line, or a runner gone without "end", starts nothing. Log: out/chain.log.
set -u
M=/Users/zacheryspector/studio-scratch/1344-gates/gates.meta
K=/Users/zacheryspector/studio-scratch/1344-s7
PID=${1:?pid} C_SHA=${2:?sha}
mkdir -p "$K/out"
while kill -0 "$PID" 2>/dev/null; do sleep 5; done
if grep -q '^STOP' "$M" || ! grep -q '^end;' "$M"; then
  echo "gates did not end cleanly; s7 not started; $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$K/out/chain.log"; exit 3
fi
echo "gates ended; starting run-s7.sh $C_SHA; $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$K/out/chain.log"
exec bash "$K/run-s7.sh" "$C_SHA"
