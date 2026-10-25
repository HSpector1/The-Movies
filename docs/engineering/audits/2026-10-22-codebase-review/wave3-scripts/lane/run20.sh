#!/bin/bash
# Lane helper: run a command in the production checkout with the pinned Node 20.20.2 first on PATH.
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
echo "run20: node $(node --version) at $(date '+%F %T'); $*"
exec "$@"
