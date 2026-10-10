# Owned cleanup diagnostic source

Held source preparation only. The frozen module and driver were parsed as source;
they were not imported or run. CONFIG runtimeGrant/sourceReview and ROUTE grant
are null. A separately reviewed fresh fill and grant are required before retry.
The original 17 OK method reports, uncaught PermissionError, driver exit -14 and
missing RESULT remain a failed route. Its target, host cause and alarm relation
remain unknown.

`owned_cleanup.py` has no OS access or timer setup. Its injected
`CleanupDiagnostics(clock, snapshot, emit=None, whole=55, start=0, ...)` exposes
`attempt(operation, target, slot, call, context=None) -> (ok, value)`,
`cleanup_targets(slots, probes, *, killpg, kill, getpgid, poll)` and `summary()`.
Only retained slots/probes are used. Group/PID/probe positive signals remain
SIGKILL (9); absence checks remain signal 0. There is no target discovery.

Each attempt/result event carries sequence/stage/operation, exact target and
retained PID, intended PGID for group calls, signal, ordinal, ready/reaped/
groupClear, lastExit/lastWaitStatus, monotonic elapsed/phase, outcome and optional
bounded context. Error is `{type, errno, message}`. Driver snapshot includes PID,
PGRP, session, EUID, observed alarm handler disposition, timer remaining/interval
and phase. alarmBlocked is null: this source adds no signal-mask query or change
to diagnostics. These snapshots describe observation, not signal provenance.

`summary()` contains schema/status/refusalCodes/events/eventCount/eventBytes/
droppedEvents/emitFailures/deadlineObserved. COMPLETE means only no injected
diagnostic refusal; it is not a route PASS. The driver adds this summary to its
original result and requires all original PASS predicates plus no refusal.
Last successful zero-signal absence gives groupClear true; presence gives false;
a refused observation gives null. Unknown ownership cannot pass. ESRCH from
readiness/signalling/absence observation is distinct from PermissionError.

Caps are 128 retained events, 2048 serialized bytes per event, 65536 aggregate
event bytes and 192 UTF-8 bytes per text field. The summary's derived bound is
98304 bytes; original streams remain 1 MiB each and the whole fixture remains
8 MiB. Fixed refusal codes (at most seven) survive event overflow, capture faults,
writer failures and later successful calls. Failed emission is disabled after
its first error; target cleanup continues. Reentry is refused without duplicating
target signals. No traceback is retained.

The real emitter verifies existing stdout is a FIFO and sets it nonblocking
before cleanup. It performs one bounded write per event, with no flush, fsync,
new pipe, file or process. Non-pipe stdout, EAGAIN, short write or any emission
error remains STOP. Event storage is in memory. The original registry fsync/close
and RESULT durability remain original finalization operations; their diagnostic
wrappers do not make those original disk operations nonblocking.

The alarm remains unmasked during diagnostics. At the 55-second hard limit the
handler exits 124 immediately without recursive cleanup or new diagnostic I/O.
The pure module checks before a call and after its result; simulated post-call
EPERM is recorded before deadline refusal. The actual alarm may terminate between
records, so missing/partial evidence cannot pass. The active driver bound remains
45 seconds; parent child/active/whole bounds remain 60/75/90. Seven owned groups,
four inherited probes and all original 3+14 assertions remain required. All 18
observer file roles and report_guard.py/test_reports.py are byte-identical.

Artifact status is never sufficient authority: driver/recorder/helper actual
exit 0 and all reviewed predicates are required. If artifact writing or stdout
emission crosses the active limit, or receives a later refusal, postwrite and
postprint checks make the child nonzero. A preexisting PASS artifact in that
failure window is stale and cannot authorize acceptance. Hard deadline evidence
has precedence over any earlier event or candidate status.

ROUTE.json proposes a held pure focused 3 expected RED / 18 GREEN route against
the authenticated original hard_kill AST and this pure module. It never imports
the original driver, creates processes inside the controls or sends real signals.
Independent controls pins/review and an actual parent grant are still required.
After qualification, a fresh held fill may propose one Python diagnostic under
the existing bounds; no JS rerun, game, pricing or automatic retry is included.

Exact forward and inverse diffs accompany drive.py, CONFIG.json, record.py and
ROUTE.json. INVERSE-AND-ROLE-PROOF.json records exact original reconstruction and
18 authenticated observer roles. A new module has no original inverse. Read-only
sealing is a source checkpoint, not runtime or host-cause acceptance.
