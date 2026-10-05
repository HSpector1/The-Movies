#!/usr/bin/env bash
set -euo pipefail
cd /Users/zacheryspector/The-Movies-headless-program
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
S=/Users/zacheryspector/studio-scratch/1367-capture-types
date -u '+%Y-%m-%dT%H:%M:%SZ' > "$S/start.txt"
set +e
node node_modules/typescript/bin/tsc --noEmit > "$S/root-types.txt" 2>&1
ROOT_RC=$?
node node_modules/typescript/bin/tsc --project scripts/captures/tsconfig.1367-predecessor-captures.json --noEmit > "$S/scripts-types.txt" 2>&1
SCRIPTS_RC=$?
set -e
printf 'root=%s\nscripts=%s\n' "$ROOT_RC" "$SCRIPTS_RC" > "$S/status.txt"
date -u '+%Y-%m-%dT%H:%M:%SZ' > "$S/end.txt"
cat "$S/status.txt"
[ "$ROOT_RC" = 0 ] && [ "$SCRIPTS_RC" = 0 ]
