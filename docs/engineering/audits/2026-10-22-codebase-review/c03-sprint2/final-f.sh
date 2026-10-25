#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt || exit 9
npm run typecheck
rc=$?; echo "=== final-f typecheck child exit=$rc"; exit "$rc"
