# Lessons from the A208 cleanup blocker

- A test-method summary is only one part of a successful recorded run. Require clean process ownership, final result publication and recorder exit before admitting the route. The original3+14 methods OK followed by EPERM/exit-14 remains failed.
- Record each retained owned target and syscall outcome before cleanup loses control. A final registry of fork IDs alone cannot identify which cleanup attempt failed.
- Cleanup refusal must remain sticky while subsequent already-owned targets receive their bounded cleanup attempts; catching and ignoring permission errors would conceal the original problem.
- Do not infer who raised SIGALRM from a negative child exit code or an outer timedOut=false flag. Record handler/timer state in the fresh diagnostic; original cause stays unknown.
- Preserve published checkpoints and scratch originals, then make fresh reviewed derivatives. Documentation-only HEAD changes require current authority rebinding, not replaying accepted source copies.

These are established process lessons. Candidate implementation and synthetic/actual verification are still pending; later versions will record measured results.
