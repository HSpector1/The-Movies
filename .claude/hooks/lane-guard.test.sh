#!/bin/bash
# Self-check for lane-guard.sh: heavy commands must block under a forced lock; others must pass;
# a lane invocation passes even though its arguments name heavy tools; malformed input is refused.
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
         'npm run check:bridge-contract' 'vite build --config ui/vite.config.ts' 'git status && npm test' \
         'npx vite build' 'node_modules/.bin/vite build' 'node node_modules/vite-node/vite-node.mjs --script x.ts' \
         'node node_modules/vitest/vitest.mjs run' 'node node_modules/typescript/lib/tsc.js -p tsconfig.json' \
         'node --max-old-space-size=4096 node_modules/.bin/vitest run' 'bash -c "npm test"' "eval 'npx tsc --noEmit'" \
         'nohup npx vitest run' 'caffeinate -i npm run typecheck' 'env -i PATH=/x npm test' 'nice -n 10 npm test' \
         'time -p npm run build' 'echo lane-run-r8.sh; npm test' 'npx -y tsc' 'npm t' 'npm -s test' 'npm run-script test' \
         'npm run capture:3d-baseline' 'npm run verify:bridge-contract-consumer' 'npm run play' 'npm run dev' \
         'npm run studio' 'npm run some-new-script' '(cd /r && npm run typecheck)' 'x=$(npx vitest list)'; do
  run 2 "$c"; done
for c in 'grep -n vitest package.json' 'git log --grep tsc' 'cat tsconfig.json' 'npm ls typescript' \
         'bash /s/lane-run-r8.sh 0 /tmp/x.log bash /a/runner.sh' 'ls node_modules/.bin' 'echo done' \
         'bash /s/lane-run-r8.sh 0 /tmp/x.log env PATH=/x npm run test:core' \
         '(cd /r && bash /s/lane-run-r8.sh 0 /tmp/x.log bash /a/run.sh); echo lane exit $?' \
         'node scripts/audit-repository-hygiene.mjs' 'npm run audit:repo-hygiene' 'npm ci --no-audit' \
         'npm view vitest version' 'python3 -c "print(1)"' 'sed -n 1,5p vitest.config.ts'; do
  run 0 "$c"; done
# Malformed hook input is refused rather than allowed.
printf 'not json: npm test' | LANE_GUARD_LOCK="$here/lane-guard.test.sh" bash "$here/lane-guard.sh" 2>/dev/null
[ $? = 2 ] || { echo 'FAIL want 2 for malformed input'; fail=1; }
[ $fail = 0 ] && echo "lane-guard: all cases pass"
exit $fail
