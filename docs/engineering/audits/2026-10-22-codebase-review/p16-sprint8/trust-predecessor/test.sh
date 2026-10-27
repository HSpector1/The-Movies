#!/bin/bash
set -eu
cd /Users/zacheryspector/studio-scratch/p16-sprint8-obligations-20261026/trust-predecessor/source9c
exec node node_modules/vitest/vitest.mjs run --project core tests/bridge-p14b2-trust.test.ts -t 'does not publish another studio|raises due at minus8|raises the poaching winner|does not require any case entry|ignores real withdrawn unbound drafts|keeps open rival proposal terms|publishes the real rival kept outcome|is semantically unchanged when only hidden terminal terms' --reporter=default --reporter=json --outputFile=/Users/zacheryspector/studio-scratch/p16-sprint8-obligations-20261026/trust-predecessor/focused.json
