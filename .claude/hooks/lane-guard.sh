#!/bin/bash
# PreToolUse(Bash) backstop for the single heavy lane. Blocks a DIRECT heavy command (tsc, vitest,
# vite-node generators/checks, vite build, playwright, and any npm script that tests, typechecks,
# generates, builds, serves or plays) while the lane is locked, disk is under the launch minimum,
# power is on battery, or another heavy process runs. A lane invocation passes: lane-run-r8.sh does
# its own preflight and lock. Classification lives in lane-guard-classify.py (command position after
# shell wrappers; an ordinary argument such as `grep -n vitest package.json` never counts); the hook
# fails closed when the classifier or the JSON parse fails.
# ponytail: process check samples ps by name, not the reviewed equipment-run-preflight-r3.py
# classifier; that script stays the qualification gate. This hook only catches ad-hoc runs.
set -u
here=$(cd "$(dirname "$0")" && pwd)
raw=$(cat)
# Fast path: most Bash calls never mention a heavy tool, so skip the JSON parse.
printf '%s' "$raw" | /usr/bin/grep -Eq 'vitest|tsc|vite|playwright|npm' || exit 0
cmd=$(printf '%s' "$raw" | python3 -I -c 'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))') || {
  echo 'lane-guard: could not read the tool input; refusing the command (fail closed).' >&2; exit 2; }
printf '%s' "$cmd" | python3 -I -B "$here/lane-guard-classify.py"
case $? in
  0|3) exit 0;;
  1) ;;
  *) echo 'lane-guard: command classifier failed; refusing the command (fail closed).' >&2; exit 2;;
esac

why=()
lock=${LANE_GUARD_LOCK:-/Users/zacheryspector/studio-scratch/HEAVY-LANE-LOCK}
[ -e "$lock" ] && why+=("heavy lane locked: $lock")
free=$(df -Pk "${CLAUDE_PROJECT_DIR:-$PWD}" 2>/dev/null | awk 'NR==2{print $4}')
case "$free" in ''|*[!0-9]*) why+=("disk free space could not be read");; *) [ "$free" -lt 3670016 ] && why+=("disk $free KiB < 3670016 KiB launch minimum");; esac
pmset -g batt 2>/dev/null | /usr/bin/grep -q 'AC Power' || why+=("not on AC power")
others=$(pgrep -fl 'vitest|vite-node|typescript/bin/tsc|typescript/lib/tsc\.js|ghidra\.app\.util\.headless|DIAGNOSTIC\.ts' | head -2 | cut -c1-140 | tr '\n' ';')
[ -n "$others" ] && why+=("heavy process running: $others")

[ ${#why[@]} -eq 0 ] && exit 0
{ echo "lane-guard: blocked a direct heavy command. Run it through the single lane (lane-run-r8.sh) after equipment-run-preflight-r3.py passes."
  printf ' - %s\n' "${why[@]}"; } >&2
exit 2
