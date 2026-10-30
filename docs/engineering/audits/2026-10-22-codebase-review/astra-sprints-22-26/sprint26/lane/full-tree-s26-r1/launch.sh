#!/bin/bash
# One-shot launch inside a verified sustained window: bind, preflight, explicit Godot scan, lane launch.
set -u
D=/Users/zacheryspector/studio-scratch/astra-20261029/full-tree-s26-r1
R=/Users/zacheryspector/The-Movies-headless-program
A=/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012
LANE=/Users/zacheryspector/studio-scratch/1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh
[ ! -e "$D/USED" ] && [ ! -e "$D/lane.log" ] && [ ! -e "$D/preflight.LOCAL.json" ] || { echo 'STOP: attempt already used'; exit 9; }
python3 -I "$D/bind.py" --bind || { echo 'STOP: bind failed'; exit 9; }
"$R/.venv/bin/python3" -I -B "$A/equipment-run-preflight-r3.py" "$D/run.sh" "$D/preflight.LOCAL.json" || { echo 'STOP: preflight refused'; exit 9; }
ps -ww -axo pid,ppid,etime,comm > "$D/launch-host.PRIVATE.txt"
if /usr/bin/grep -qi godot "$D/launch-host.PRIVATE.txt"; then echo 'STOP: foreign Godot present at launch scan'; exit 9; fi
date -Iseconds > "$D/launch-at.txt"
nohup bash "$LANE" 0 "$D/lane.log" bash "$D/run.sh" > "$D/launcher.out" 2>&1 &
echo $! > "$D/launcher.pid"
echo "LAUNCHED lane pid $(cat "$D/launcher.pid") at $(cat "$D/launch-at.txt")"
