#!/bin/bash
# Self-check for lane-guard.sh: heavy commands must block under a forced lock; others must pass.
here=$(cd "$(dirname "$0")" && pwd)
fail=0
run() { # expected-exit command
  printf '%s' "$2" | python3 -I -c 'import json,sys; print(json.dumps({"tool_input":{"command":sys.stdin.read()}}))' \
    | LANE_GUARD_LOCK="$here/lane-guard.test.sh" bash "$here/lane-guard.sh" 2>/dev/null
  got=$?; [ "$got" = "$1" ] || { echo "FAIL want $1 got $got: $2"; fail=1; }
}
for c in 'npx vitest run tests/a.test.ts' 'cd /r && node node_modules/typescript/bin/tsc -p tsconfig.json' \
         'npm run typecheck' 'npm test' 'FOO=1 npx tsc --noEmit' 'timeout 600 npx vitest run' \
         'node_modules/.bin/vitest run' 'npx vite-node scripts/generate-bridge-contract.ts --check' \
         'npm run check:bridge-contract' 'vite build --config ui/vite.config.ts' 'git status && npm test'; do
  run 2 "$c"; done
for c in 'grep -n vitest package.json' 'git log --grep tsc' 'cat tsconfig.json' 'npm ls typescript' \
         'bash /s/lane-run-r8.sh 0 /tmp/x.log bash /a/runner.sh' 'ls node_modules/.bin' 'echo done'; do
  run 0 "$c"; done
[ $fail = 0 ] && echo "lane-guard: all cases pass"
exit $fail
