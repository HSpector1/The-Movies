#!/usr/bin/env bash
# 1360-L: the three type gates and both generator checks at the landed HEAD after the P15 Wave 2 RED landing, in the repo,
# alone in the heavy lane (run under lane-run.sh). Modeled on studio-scratch/1358-land/landed-gates.sh. Read-only: tsc
# --noEmit and the generators' --check modes. Writes only E/1360-L-type-gates.txt, untracked until the parent commits it.
# Expected (1360-X s12): root exits 2 with exactly six TS2307 errors for the missing P15 modules; UI and Bridge exit 0.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
E=$R/docs/engineering/playability-launch-review/evidence/p14b4-20260919
OUT=$E/1360-L-type-gates.txt
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
cd "$R" || exit 2
[ -e "$OUT" ] && { echo "$OUT exists"; exit 2; }
grep -q "1360-p15c-red-recorded end" /Users/zacheryspector/studio-scratch/1360-land/recorded-p15.meta || { echo "step 10 has not ended"; exit 2; }
{ echo "HEAD $(git rev-parse HEAD), node $(node --version), start $(date '+%Y-%m-%d %H:%M:%S %Z')"
  for p in tsconfig.json ui/tsconfig.json tsconfig.bridge.json; do echo "== $p"; node_modules/.bin/tsc -p $p --noEmit 2>&1; echo "exit $?"; done
  echo "== check:bridge-contract"; node_modules/.bin/vite-node scripts/generate-bridge-contract.ts --check 2>&1; echo "exit $?"
  echo "== check:bridge-contract:fixtures"; node_modules/.bin/vite-node scripts/generate-bridge-contract-fixtures.ts --check 2>&1; echo "exit $?"
  echo "source paths after: [$(GIT_OPTIONAL_LOCKS=0 git status --porcelain -- src tests ui bridge generated scripts | tr '\n' ' ')]"
  echo "end $(date '+%Y-%m-%d %H:%M:%S %Z')"; } > "$OUT"
grep -E '^(HEAD|==|exit|source|end)' "$OUT"
