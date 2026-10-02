#!/usr/bin/env bash
# 1361-F4 ruling 2 / 1361-F5 ruling 3: the d16 suite (src/harness/d16/vitest.d16.config.ts, outside the core project)
# on an archive of a writer's tag. usage: run-d16.sh <tag> <label>. Writes only under S/1361-d16/<label>/.
set -u -o pipefail
R=/Users/zacheryspector/The-Movies-headless-program
W=/Users/zacheryspector/studio-scratch/1361-prod/tree
TAG=${1:?tag}; L=${2:?label}
Y=/Users/zacheryspector/studio-scratch/1361-d16/$L
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
[ -e "$Y" ] && { echo "STOP: $Y exists"; exit 2; }
C=$(git -C "$W" rev-parse "$TAG^{commit}") || exit 2
mkdir -p "$Y/tree" "$Y/out" || exit 2
git -C "$W" archive "$C" | tar -x -C "$Y/tree" || { echo "STOP: archive failed"; exit 2; }
ln -s "$R/node_modules" "$Y/tree/node_modules" || exit 2
echo "d16 $L: tag $TAG $C, node $(node --version), start $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$Y/out/run.meta"
(cd "$Y/tree" && ./node_modules/.bin/vitest run --config src/harness/d16/vitest.d16.config.ts --no-cache --reporter=default --reporter=json --outputFile.json="$Y/out/d16.json" > "$Y/out/d16.txt" 2>&1); rc=$?
echo "d16 $L: vitest exit $rc; $(/usr/bin/grep -E '^ +Tests ' "$Y/out/d16.txt" | tail -1); end $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$Y/out/run.meta"
exit $rc
