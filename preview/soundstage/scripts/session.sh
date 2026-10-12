#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
run_log=${1:?Must be launched through START PREVIEW.command}
stop_file=${2:?Missing owned stop file}
LOCK=/Users/zacheryspector/studio-scratch/HEAVY-LANE-LOCK
test -f "$LOCK" && test ! -L "$LOCK"
case "$(cat "$LOCK")" in "lane-run $run_log token="*) ;; *) echo 'Refusing a lane owned by another job.'; exit 1;; esac
ancestor=$PPID
owned=0
for step in 1 2 3 4 5 6 7 8 9 10; do
  args=$(ps -p "$ancestor" -o args=)
  case "$args" in *lane-run-r8.sh*"$run_log"*) owned=1; break;; esac
  ancestor=$(ps -p "$ancestor" -o ppid= | tr -d ' ')
  test "$ancestor" -gt 1 || break
done
test "$owned" = 1 || { echo 'Required lane ancestor absent.'; exit 1; }
stop_requested() { test -f "$stop_file"; }
stop_requested && exit 0
available=$(df -k . | awk 'NR==2 {print $4}')
test "$available" -ge 3670016 || { echo 'Need3.5GiB free before starting.'; exit 1; }
pmset -g batt | grep -q 'AC Power' || { echo 'Connect AC power before starting.'; exit 1; }
NODE="$HOME/.nvm/versions/node/v20.20.2/bin/node"
test -x "$NODE"
"$NODE" scripts/verify-assets.mjs
stop_requested && exit 0
"$NODE" node_modules/typescript/bin/tsc --project tsconfig.json
stop_requested && exit 0
"$NODE" scripts/build.mjs
stop_requested && exit 0
ready_file="$run_log.ready"
test ! -e "$ready_file"
PREVIEW_READY_FILE="$ready_file" "$NODE" scripts/server.mjs &
server_pid=$!
browser_pid=
cleanup() {
  if [ -n "$browser_pid" ]; then kill -TERM "$browser_pid" 2>/dev/null || true; wait "$browser_pid" 2>/dev/null || true; fi
  kill -TERM "$server_pid" 2>/dev/null || true
  wait "$server_pid" 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM HUP
for step in {1..100}; do
  stop_requested && exit 0
  kill -0 "$server_pid" 2>/dev/null || { wait "$server_pid"; exit 1; }
  test -f "$ready_file" && break
  sleep .1
done
test -f "$ready_file" || { echo 'Server did not become ready.'; exit 1; }
url=$("$NODE" -e 'const r=JSON.parse(require("fs").readFileSync(process.argv[1]));if(r.pid!==Number(process.argv[2]))throw Error("Wrong readiness owner");console.log(r.url)' "$ready_file" "$server_pid")
"$NODE" scripts/open-browser.mjs "$url" &
browser_pid=$!
while kill -0 "$server_pid" 2>/dev/null && kill -0 "$browser_pid" 2>/dev/null; do
  stop_requested && exit 0
  available=$(df -k . | awk 'NR==2 {print $4}')
  test "$available" -ge 3145728 || { echo 'Stopping: below3GiB live disk floor.'; exit 1; }
  pmset -g batt | grep -q 'AC Power' || { echo 'Stopping: AC disconnected.'; exit 1; }
  sleep 1
done
if ! kill -0 "$browser_pid" 2>/dev/null; then wait "$browser_pid"; else wait "$server_pid"; fi
