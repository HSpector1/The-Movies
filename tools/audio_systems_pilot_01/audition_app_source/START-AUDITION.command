#!/bin/zsh
set -euo pipefail
SCRIPT_DIR="${0:A:h}"
cd "$SCRIPT_DIR"
exec /usr/bin/python3 "$SCRIPT_DIR/serve_audition.py"
