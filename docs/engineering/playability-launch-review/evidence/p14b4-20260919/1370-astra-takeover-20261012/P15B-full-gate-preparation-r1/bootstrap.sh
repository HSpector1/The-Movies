#!/bin/bash
# Parent-only existing-lane wrapper; no timeout/config/source/restore amendment.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
A=/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$R/.venv/bin:$PATH GIT_OPTIONAL_LOCKS=0
exec "$R/.venv/bin/python3" -I "$A/p15b-full-gate-supplement-r1/RUN-FULL-GATE.py"
