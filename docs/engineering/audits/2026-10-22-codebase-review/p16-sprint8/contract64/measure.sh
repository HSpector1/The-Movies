#!/bin/bash
# Separate read-only lane, only after coordinator installs and commits outputs.
set -euo pipefail
export PATH="/usr/local/bin:$PATH"
X=/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt
S=/Users/zacheryspector/studio-scratch/p16-sprint8-obligations-20261026/contract64
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
[ "$(node --version)" = v20.20.2 ]
: "${P64_DECLARATION_EXPECTED_HEAD:?Supply the actual committed64 HEAD in the lane selection}"
[ ! -e "$S/measurement64.json" ]
cd "$X"
node node_modules/vite-node/vite-node.mjs "$S/p64-declaration-measurement.ts" > "$S/measurement64.json"
