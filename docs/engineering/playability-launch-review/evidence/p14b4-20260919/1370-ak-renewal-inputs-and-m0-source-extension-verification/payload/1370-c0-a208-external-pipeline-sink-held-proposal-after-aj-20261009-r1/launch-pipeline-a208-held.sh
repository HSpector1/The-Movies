#!/bin/bash
# UNREVIEWED/UNRUN. Invoked by accepted r8 helper after exact filled launch review.
set -u
set -o pipefail
if [[ $# -ne 2 ]]; then
  printf '%s\n' '{"status":"STOP_PIPELINE_ARGV"}' >&2
  exit 2
fi
witness_binding="$1"
witness_binding_sha="$2"
readonly witness_python='/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14'
readonly witness_source='/Users/zacheryspector/studio-scratch/1370-c0-aging-era-settlement208-observer-after-aj-proposal-20261009-r1'
readonly witness_sink='/Users/zacheryspector/studio-scratch/1370-c0-a208-external-pipeline-sink-held-proposal-after-aj-20261009-r1/bounded-sink-a208-held.py'
"$witness_python" -B "$witness_source/outer-recorder.py" "$witness_binding" | "$witness_python" -B "$witness_sink" "$witness_binding" "$witness_binding_sha"
witness_pipeline_exits=("${PIPESTATUS[@]}")
if [[ ${#witness_pipeline_exits[@]} -ne 2 ]]; then
  printf '%s\n' '{"status":"STOP_PIPELINE_EXIT_SHAPE"}' >&2
  exit 2
fi
printf '{"status":"PIPELINE_EXITS_CANDIDATE","outerExit":%s,"sinkExit":%s}\n' "${witness_pipeline_exits[0]}" "${witness_pipeline_exits[1]}" >&2
if [[ ${witness_pipeline_exits[0]} -ne 0 || ${witness_pipeline_exits[1]} -ne 0 ]]; then
  exit 2
fi
exit 0
