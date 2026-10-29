#!/bin/bash
# usage: one-file.sh <json-name> <test files...>
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
name="$1"; shift
echo "node $(node --version) at $(date '+%F %T')"
t0=$(date +%s); echo "=== BEGIN vitest focused"
npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/$name.json" "$@"
echo "=== END vitest focused exit=$? elapsed=$(( $(date +%s) - t0 ))s"
