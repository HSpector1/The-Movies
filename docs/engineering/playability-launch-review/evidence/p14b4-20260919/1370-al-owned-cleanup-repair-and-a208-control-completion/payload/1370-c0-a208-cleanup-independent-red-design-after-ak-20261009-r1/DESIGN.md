SOURCE PREPARATION ONLY. These controls have been authored and have not run.
No original/production/Git/mirror bytes were changed. No process, timer, signal,
probe or scientific acceptance is established by this package.

The source authority is frozen original drive.py SHA256
7c29cf7c679971ad59fb2190b2fc6e78f10ab64e1857723dd8a09cc9ba05303c,
under 1370-c0-a208-finite-recorded-controls-node22-filled-source-after-aj-20261009-r1.
The original STOP review and NEXT-SLICE-DESIGN under
1370-c0-a208-python-controls-stop-independent-observed-review-after-aj-20261009-r1
and parent ADOPTION.json under
1370-c0-a208-owned-cleanup-diagnostics-parent-design-adoption-after-aj-20261009-r1
govern this derivative. Actual tool/helper/recorder exit2, driver -14, empty
stdout and absent driver RESULT remain STOP. The original 3+14 method reports
do not establish route acceptance. Exact real target/host/alarm cause is unknown.

The independent harness controls.py accepts exactly four positional arguments:
candidate module absolute path, candidate SHA256, original drive absolute path,
original SHA256. It verifies both source hashes with a 128KiB source read cap.
It never imports the original driver: ast.parse selects its sole hard_kill
definition, and exec compiles only that definition into a namespace containing
fake os.kill/os.killpg, fake signal.SIGKILL, a no-op refresh, and synthetic owned
records. Original imports, setitimer, main, authentication, registry writes,
fixtures and observer tests are not executed. The reviewed candidate pure module
is compiled from the authenticated bytes; no pyc is written by this harness.
This is an explicit test boundary, not a general sandbox for unreviewed source.

Three expected original RED cases independently inject the same PermissionError
object with errno EPERM at first group kill, first direct PID kill and first
inherited probe kill. A valid RED requires identity-preserved exception escape,
exact expected call-prefix ending at that target and omission of later-owned
targets. Missing or differently shaped RED is STOP, not an expected failure.
These fixtures demonstrate a source control-flow flaw, not a real EPERM cause.

Eighteen GREEN controls use the announced pure CleanupDiagnostics API, with
all system operations, clock, snapshot and writer injected. The synthetic
roster always starts with seven owned groups and four inherited probes; the
normal trace has eighteen existing SIGKILL calls: group+PID per unreaped group,
then four direct probe PID kills. Context/snapshot IDs are synthetic numbers.
Controls independently require exact EPERM target/class/errno/signal and state
fields; sticky refusal after clean retry; later owned attempts; ESRCH distinction;
no cleared/reaped extra signals; unknown readiness/poll faults as refusal;
whole55 precedence before and after a call; retained EPERM at simultaneous
deadline; no reentrant duplicate calls; event/aggregate/UTF8 caps with refusal;
writer EAGAIN and ENOSPC refusal without remaining-target omission; and a writer
that advances fake clock to55 before syscall cannot cause a late signal.

Output is one compact JSON line, at most16384 UTF8 bytes. The exact accepted
schema is a208-independent-owned-cleanup-controls/v1, status
SYNTHETIC_CONTROLS_PASS, expectedRed=observedExpectedRed=3,
expectedGreen=observedGreen=18, cases length21, failure=null, game=false,
realSignals=false, originalImported=false. The first three statuses are
EXPECTED_RED, with exact kind group/pid/probe; the remaining eighteen named
cases must be GREEN exactly once in the authored order. Any unexpected exception,
RED mismatch, missing GREEN, output-cap failure or count mismatch returns2.
No intended stderr output. Parent route is separately reviewed, held and bounded
at child20/active25/whole30 seconds with64KiB streams. This document grants no run.

Source review before any execution must check the following:

- Candidate imports and module top level are pure; no subprocess, fork, timers,
  real kill, host scan or file mutation. Only reviewed callbacks issue existing
  ownership-list signals. Probe inherited external PGID must never be killed.
- Original test_reports.py and fourteen observer methods/assertions stay byte
  exact. Keep seven groups/four probes and45/55 driver,60/75/90 parent limits,
  1MiB stdout/stderr and8MiB owned fixture caps unchanged. Extra pure controls
  are separate tests and cannot replace or add to original17 route method count.
- Each existing cleanup syscall supplies immutable retained PID and intended
  PGID, slot ordinal/state/wait exit, syscall/signal, phase/elapsed and bounded
  snapshot. Snapshot reports current driver PID/PGRP/session/euid, handler
  disposition and actual timer state without pretending to attribute signal14.
- EPERM/uncertainty refuses independently of bounded event storage and report
  durability. Error cannot become absence/clearance. Dropped events, writer and
  snapshot failures refuse; exception type/errno and numeric target cannot be
  silently truncated into other identities. Uncaught failures cannot turn the
  final result into a stale computed PASS.
- Deadline checks dominate before any syscall, after snapshot/emission and
  after syscall; record an already observed syscall exception before deadline
  propagation. Handler reentrancy never duplicates ownership actions or resets
  refusal. Actual hard exit at55 is the driver's job, not a swallowed Exception.
- No newly introduced blocking diagnostic I/O in attempt/alarm or signal-masked paths. A write
  callback must be proved to target a fixed pre-opened nonblocking pipe with a
  bounded write or be deferred until after bounded cleanup. Regular-file
  O_NONBLOCK does not prove bounded latency. Added diagnostic fsync, flush, walk,
  unbounded allocation or writer retries must not delay hard deadline. The
  preexisting registry fsync remains alarm-unmasked under the unchanged55 bound;
  diagnostic events around that call do not introduce another fsync. Exception-only writer
  controls cannot prove that a genuinely blocking callback is nonblocking.
- Final acceptance requires cleanup, refusal/cap/deadline and evidence gates,
  actual driver exit0, recorder/helper exit0 and complete report validation.
  Durable PASS bytes written before a later cap/deadline refusal are invalid
  whenever actual exit is nonzero; artifact bytes cannot atomically prove future
  exit. The original recorder explicitly checks child.poll()==0 before invoking
  report_guard.validate, and retains active/whole/postwrite gates. Source review
  found no bypass of that full acceptance gate. These pure controls do not run
  the parent recorder or establish its actual rejection behavior; the preserved
  recorder controls and later actual route remain separate evidence.
- Candidate/module role is authenticated and wired into held driver/config;
  inverse diff protects unchanged controls/counts/clocks. Sealing this source or
  passing these pure controls would authorize neither diagnostic rerun nor game.

Lessons: method success and route cleanup/report success are separate facts.
Later numeric absence cannot retroactively pass an uncaptured cleanup. A lossless
error latch must precede fallible diagnostics; bounded diagnostic loss itself
refuses. A periodic timer in source and observed -14 are evidence, not causal
attribution. Source-only injected faults reproduce control flow, not host causes.
Nonblocking behavior requires reviewing the concrete emitter, not merely testing
an emitter that throws quickly. Keep timer imports outside independent RED.
