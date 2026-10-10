# Lessons from the preserved cleanup failure

Individual unittest OK reports do not establish cleanup or route success. The
first uncaught cleanup exception can hide later targets and all finalization.
Keep per-owned-attempt evidence and a sticky refusal independent of successful
later methods, cleanup calls, logging or bounded buffers.

Record exact retained target/state, syscall error and timer disposition before
making causal claims. An observed -14 exit and PermissionError traceback do not
identify the failed target or who generated SIGALRM. A diagnostic derivative can
expose a future refusal; it does not retroactively solve the original EPERM.

Bounds apply to failure reporting too. Use an existing nonblocking pipe for live
diagnostic emission, explicit event/text/aggregate caps and no fsync in the
diagnostic emitter. A full event buffer or failed writer must refuse acceptance
without blocking remaining already-owned cleanup. Hard deadlines take precedence
over recursive cleanup and incomplete evidence.

Extract pure injected cleanup logic to test EPERM, timer races, caps, writer
failure and reentry without importing a driver's top-level alarm. Preserve the
original failed source and outputs. Review and qualify a fresh immutable source
before separately granting any real diagnostic. Treat actual nonzero exits as
stronger evidence than a candidate PASS artifact written before final checks.

The r1 derivative added an assignment to STOP inside main() but omitted STOP
from that function's global declaration. Python therefore treated STOP as local
throughout main(), causing UnboundLocalError during final cleanup despite 17 OK
method reports and useful diagnostic capture. This was an implementation error;
the author and source reviewers missed it. The r1 failed run must stay failed.

The pure cleanup-module controls could not cover the driver's scope/finalization
integration. Add an authenticated main-tail/global AST RED against r1 and GREEN
against r2, exercising cleanup refusal and normal cleanup without importing the
driver's top-level timer. Fix the one global declaration in a fresh derivative;
do not broaden cleanup targets, signals, clocks or claims from the captured EPERM.

R3 records the bounded cleanup-order lesson without erasing the original failures.
The admitted owned-child observation found group0 EPERM while exit-notified but
unreaped, then ESRCH after the exact natural-exit wait. This supports a narrow
pre-reap step; it does not establish the original failing target or complete
alarm cause, and permission errors remain sticky STOP.

Reaping the leader does not prove descendants are gone. The zero-probe adapter
must return True on syscall success because the diagnostic module uses None for
ESRCH; passing raw killpg (also returns None) would falsely clear live groups.
Validate the exact owned wait tuple and decode status before reaped/exit admission,
and retain raw status even if decoding fails. Exercise the actual cleanup call
site and order, following the main-tail integration gap we previously missed.

The first microprobe route remained STOP despite child0 because Python3.14 emitted
a return-in-finally SyntaxWarning into producer stderr. The corrected probe
retained the strict gate and passed separately. Source parsing on a different
Python version cannot replace narrowly authorized pinned compiler validation.
