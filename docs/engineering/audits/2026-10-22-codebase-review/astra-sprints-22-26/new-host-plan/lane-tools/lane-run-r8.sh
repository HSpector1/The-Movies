#!/usr/bin/env bash
# Stage41 r8 one-shot lane: <pid to wait for | 0> <absolute log> <command...>.
# The unchanged audit.py requires the full recordedLane path in HEAVY-LANE-LOCK.
set -u
LOCK=/Users/zacheryspector/studio-scratch/HEAVY-LANE-LOCK
WAIT_PID=$1 LOG=$2; shift 2
case "$LOG" in /*) ;; *) echo 'STOP: lane log must be absolute' >&2; exit 2;; esac
[ "$#" -gt 0 ] || { echo 'STOP: missing lane command' >&2; exit 2; }
umask 077
[ ! -e "$LOG" ] && [ ! -L "$LOG" ] && [ ! -e "$LOG.meta" ] && [ ! -L "$LOG.meta" ] || {
  echo 'STOP: one-shot lane log or meta already exists' >&2; exit 2;
}
# Noclobber is an exclusive create. A second starter with the same log cannot append its meta.
if ! (set -C; : > "$LOG.meta") 2>/dev/null; then
  echo 'STOP: one-shot lane meta already exists or cannot be created' >&2; exit 2
fi
log() { echo "$1; $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$LOG.meta"; }
heavy() { ps -axo comm=,args= | awk '$1 ~ /(^|\/)node$/ && /vitest|\/bin\/tsc|\/lib\/tsc\.js/'; }
log "waiting for pid $WAIT_PID; then: $*"
while [ "$WAIT_PID" != 0 ] && kill -0 "$WAIT_PID" 2>/dev/null; do sleep 20; done
TOKEN=$(/usr/bin/uuidgen) || { log 'STOP: token generation failed'; exit 3; }
MARKER="lane-run $LOG token=$TOKEN"
LOCK_ID=
cleanup() {
  local rc=$?
  local failure= current_id= current_marker=
  trap - EXIT
  if [ -z "$LOCK_ID" ]; then
    failure='owned lock inode was never established; lock retained for manual review'
  elif [ ! -f "$LOCK" ] || [ -L "$LOCK" ]; then
    failure='owned lock absent or no longer a regular file'
  elif ! current_id=$(stat -f '%d:%i' "$LOCK" 2>/dev/null); then
    failure='owned lock stat failed; lock retained for review'
  elif [ "$current_id" != "$LOCK_ID" ]; then
    failure='owned lock inode changed; foreign lock preserved'
  elif ! current_marker=$(cat "$LOCK" 2>/dev/null); then
    failure='owned lock read failed; lock retained for review'
  elif [ "$current_marker" != "$MARKER" ]; then
    failure='owned lock marker changed; foreign lock preserved'
  elif ! rm -f -- "$LOCK"; then
    failure='owned lock cleanup failed'
  fi
  if [ -n "$failure" ]; then
    log "STOP: $failure" || true
    echo "STOP: $failure" >&2
    rc=3
  fi
  exit "$rc"
}
n=0
while :; do
  # Bash noclobber uses exclusive creation; a losing starter never owns the existing lock.
  if (set -C; printf '%s\n' "$MARKER" > "$LOCK") 2>/dev/null; then
    trap cleanup EXIT
    trap 'exit 129' HUP
    trap 'exit 130' INT
    trap 'exit 143' TERM
    # If stat fails, the empty LOCK_ID makes cleanup retain the lock for review.
    LOCK_ID=$(stat -f '%d:%i' "$LOCK") || {
      log 'STOP: acquired lock stat failed; lock retained for manual review'; exit 3;
    }
    [ -f "$LOCK" ] && [ ! -L "$LOCK" ] &&
      [ "$(stat -f '%l' "$LOCK")" = 1 ] &&
      [ "$(cat "$LOCK")" = "$MARKER" ] || { log 'STOP: acquired lock identity changed'; exit 3; }
    break
  fi
  [ -f "$LOCK" ] && [ ! -L "$LOCK" ] || { log 'STOP: unsafe or inaccessible lane lock'; exit 3; }
  n=$((n+1))
  [ "$n" -le 360 ] || { log 'STOP: lane stayed locked 2 h'; exit 3; }
  sleep 20
done
caffeinate -is -w $$ &
n=0
while [ -n "$(heavy)" ]; do
  n=$((n+1)); [ "$n" -le 120 ] || { log 'STOP: vitest or tsc still runs after 60 min'; exit 3; }
  sleep 30
done
log 'start'
(set -C; "$@" > "$LOG" 2>&1)
child_exit=$?
log "end, exit $child_exit"
exit "$child_exit"
