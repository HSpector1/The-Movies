#!/bin/bash
# PreToolUse(Bash) backstop for the single heavy lane. Blocks a DIRECT heavy command (tsc, vitest,
# vite-node generators/checks, npm test/typecheck/check:/generate:/build, vite build, playwright)
# while the lane is locked, disk is under the launch minimum, power is on battery, or another heavy
# process runs. Lane invocations pass: lane-run-r8.sh does its own preflight and lock.
# ponytail: process check samples ps by name, not the reviewed equipment-run-preflight-r3.py
# classifier; that script stays the qualification gate. This hook only catches ad-hoc runs.
set -u
raw=$(cat)
# Fast path: most Bash calls never mention a heavy tool, so skip the JSON parse.
printf '%s' "$raw" | /usr/bin/grep -Eq 'vitest|tsc|vite-node|playwright|npm|vite' || exit 0
cmd=$(printf '%s' "$raw" | python3 -I -c 'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))') || exit 0
case "$cmd" in *lane-run-r8.sh*) exit 0;; esac

sep='(^|[;&|(]|&&|\|\|)[[:space:]]*'
prefix='(([A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*|time|env|nice|timeout[[:space:]]+[0-9]+[smh]?)[[:space:]]+)*'
tool='((npx[[:space:]]+|node[^;&|[:space:]]*[[:space:]]+[^;&|[:space:]]*/|[^;&|[:space:]]*/)?(tsc|vitest|vite-node|playwright)([[:space:]]|$)|npm[[:space:]]+(run[[:space:]]+)?(test|typecheck|check:|generate:|build)|vite[[:space:]]+build)'
printf '%s' "$cmd" | /usr/bin/grep -Eq "$sep$prefix$tool" || exit 0

why=()
lock=${LANE_GUARD_LOCK:-/Users/zacheryspector/studio-scratch/HEAVY-LANE-LOCK}
[ -e "$lock" ] && why+=("heavy lane locked: $lock")
free=$(df -Pk "${CLAUDE_PROJECT_DIR:-$PWD}" | awk 'NR==2{print $4}')
[ "$free" -lt 3670016 ] && why+=("disk $free KiB < 3670016 KiB launch minimum")
pmset -g batt | /usr/bin/grep -q 'AC Power' || why+=("not on AC power")
others=$(pgrep -fl 'vitest|typescript/bin/tsc|typescript/lib/tsc\.js|ghidra\.app\.util\.headless|DIAGNOSTIC\.ts' | head -2 | cut -c1-140 | tr '\n' ';')
[ -n "$others" ] && why+=("heavy process running: $others")

[ ${#why[@]} -eq 0 ] && exit 0
{ echo "lane-guard: blocked a direct heavy command. Run it through the single lane (lane-run-r8.sh) after equipment-run-preflight-r3.py passes."
  printf ' - %s\n' "${why[@]}"; } >&2
exit 2
