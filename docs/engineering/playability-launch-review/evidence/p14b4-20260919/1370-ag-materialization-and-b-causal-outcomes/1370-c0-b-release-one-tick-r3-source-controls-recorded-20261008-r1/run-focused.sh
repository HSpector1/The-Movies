#!/bin/bash
set -u
export PYTHONDONTWRITEBYTECODE=1
witness_source='/Users/zacheryspector/studio-scratch/1370-c0-b-release-one-tick-source-proposal-20261008-r3'
witness_python='/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14'
witness_node='/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin/node'
"$witness_python" -I -B "$witness_source/test-recorder-red.py"
witness_recorder_exit=$?
printf '{"status":"SOURCE_CONTROL_EXIT","suite":"recorder15","actualExit":%s}\n' "$witness_recorder_exit"
"$witness_python" -I -B "$witness_source/test-json-cap-red.py"
witness_json_exit=$?
printf '{"status":"SOURCE_CONTROL_EXIT","suite":"json4","actualExit":%s}\n' "$witness_json_exit"
"$witness_node" "$witness_source/test-retention-red.mjs"
witness_retention_exit=$?
printf '{"status":"SOURCE_CONTROL_EXIT","suite":"retention4","actualExit":%s}\n' "$witness_retention_exit"
if [[ $witness_recorder_exit -ne 0 || $witness_json_exit -ne 0 || $witness_retention_exit -ne 0 ]]; then
  exit 2
fi
exit 0
