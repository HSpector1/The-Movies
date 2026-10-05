#!/usr/bin/env bash
set -euo pipefail
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
X=/Users/zacheryspector/studio-scratch/1361-postrelease-maintenance-types-01
cd /Users/zacheryspector/The-Movies-headless-program
set +e
node node_modules/typescript/bin/tsc --noEmit --allowImportingTsExtensions > "$X/root-types.txt" 2>&1
ROOT_RC=$?
cd "$X"
./tree/node_modules/.bin/tsc -p tsconfig.maintenance.json --noEmit > maintenance-types.txt 2>&1
MAINT_RC=$?
printf 'root=%s\nmaintenance=%s\n' "$ROOT_RC" "$MAINT_RC" > status.txt
[ "$ROOT_RC" = 0 ] && [ "$MAINT_RC" = 0 ]
