#!/bin/bash
# Static baseline for the stabilization phase: typechecks, contract checks, hygiene, hook self-test.
export PATH=/usr/local/bin:$PATH
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
echo "node $(node --version) npm $(npm --version) at $(date '+%F %T')"
run() { local t0=$(date +%s); echo "=== BEGIN $1"; bash -c "$1"; local rc=$?; echo "=== END $1 exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
run 'npm run -s typecheck'
run 'npm run -s typecheck:bridge'
run 'npm run -s check:bridge-contract'
run 'npm run -s check:bridge-contract:fixtures'
run 'npm run -s audit:repo-hygiene 2>&1 | tail -5'
run 'bash .claude/hooks/lane-guard.test.sh'
run '.venv/bin/python3 -I -B -m unittest discover -s scripts/tests -p "test_studio_workflow_setup.py" 2>&1 | tail -3'
echo "done $(date '+%F %T')"
