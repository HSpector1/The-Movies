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
