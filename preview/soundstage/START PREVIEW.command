#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
dependency_root="${STUDIO_INTEGRATION_ROOT:-$HOME/The-Movies-headless-program}/node_modules"
if [ ! -e node_modules ] && [ ! -L node_modules ]; then
  test -d "$dependency_root" || { echo 'Existing Project Studio dependencies not found; set STUDIO_INTEGRATION_ROOT. Nothing will be installed.'; exit 1; }
  ln -s "$dependency_root" node_modules
fi
NODE="$HOME/.nvm/versions/node/v20.20.2/bin/node"
test -x "$NODE" || { echo 'Required installed Node20.20.2 is unavailable.'; exit 1; }
exec "$NODE" scripts/launch.mjs
