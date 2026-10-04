#!/usr/bin/env bash
set -eu
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
node --version
node_modules/.bin/tsc --noEmit
node_modules/.bin/tsc -p ui/tsconfig.json --noEmit
node_modules/.bin/tsc -p tsconfig.bridge.json --noEmit
npm run check:bridge-contract
npm run check:bridge-contract:fixtures
