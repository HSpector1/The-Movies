#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt || exit 9
npm run -s typecheck
rc=$?; echo "=== final typecheck child exit=$rc"; exit "$rc"
