#!/bin/zsh
set -eu

APP_DIR="${0:A:h}"
PYTHON_BIN="${HOME:?HOME is not set}/Project Studio Music Pilot 01 Tooling/.phase2-venv-py312/bin/python"

if [[ ! -x "$PYTHON_BIN" ]]; then
  print -u2 "Required isolated Python runtime is unavailable: $PYTHON_BIN"
  exit 1
fi

cd "$APP_DIR"
exec "$PYTHON_BIN" "$APP_DIR/serve_audition.py" --port 8765 --root "$APP_DIR/dist/client"
