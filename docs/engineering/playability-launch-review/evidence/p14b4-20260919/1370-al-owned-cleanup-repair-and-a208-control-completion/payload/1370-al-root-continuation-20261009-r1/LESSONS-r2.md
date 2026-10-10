# Lessons from the A208 cleanup blocker

- A test-method summary is only one part of a successful recorded run. Require clean process ownership, final result publication and recorder exit before admitting the route. The original3+14 methods OK followed by EPERM/exit-14 remains failed.
- Record each retained owned target and syscall outcome before cleanup loses control. A final registry of fork IDs alone cannot identify which cleanup attempt failed.
- Cleanup refusal must remain sticky while subsequent already-owned targets receive their bounded cleanup attempts; catching and ignoring permission errors would conceal the original problem.
- Do not infer who raised SIGALRM from a negative child exit code or an outer timedOut=false flag. Record handler/timer state in the fresh diagnostic; original cause stays unknown.
- Preserve published checkpoints and scratch originals, then make fresh reviewed derivatives. Documentation-only HEAD changes require current authority rebinding, not replaying accepted source copies.

These are established process lessons. Candidate implementation and synthetic/actual verification are still pending; later versions will record measured results.

- Preserve historical acceptance against its actual source: changing today's documentation HEAD must not rewrite an older successful completion receipt. Bind today's operational refs separately.
- Reuse a passing JavaScript result only after proving its tested observer files, Node executable, arguments and report validation are unchanged by a Python-only repair. Bundle-pin equality alone is too coarse to establish or reject that reuse.
- A durable PASS-shaped file is not final acceptance: a later timeout/write failure can invalidate it. Require the full child/recorder/helper/tool outcome and final guards. Do not invent an impossible guarantee that an artifact predicts future process exit.
- Separate new blocking behavior from existing bounded durability calls. Wrapping the original registry fsync with diagnostics does not introduce a new fsync; the actual diagnostic emitter is a verified nonblocking pipe write.
