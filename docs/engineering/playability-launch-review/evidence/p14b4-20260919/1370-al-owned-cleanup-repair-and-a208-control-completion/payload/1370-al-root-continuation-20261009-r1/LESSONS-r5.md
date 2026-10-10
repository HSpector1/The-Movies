# Lessons from the A208 cleanup blocker

- A test-method summary is only one part of a successful recorded run. Require clean process ownership, final result publication and recorder exit before admitting the route. The original3+14 methods OK followed by EPERM/exit-14 remains failed.
- Record each retained owned target and syscall outcome before cleanup loses control. A final registry of fork IDs alone cannot identify which cleanup attempt failed.
- Cleanup refusal must remain sticky while subsequent already-owned targets receive their bounded cleanup attempts; catching and ignoring permission errors would conceal the original problem.
- Do not infer who raised SIGALRM from a negative child exit code or an outer timedOut=false flag. Record handler/timer state in the fresh diagnostic; original cause stays unknown.
- Preserve published checkpoints and scratch originals, then make fresh reviewed derivatives. Documentation-only HEAD changes require current authority rebinding, not replaying accepted source copies.

The entries below distinguish actual finite wins from still-open runtime acceptance.

- Preserve historical acceptance against its actual source: changing today's documentation HEAD must not rewrite an older successful completion receipt. Bind today's operational refs separately.
- Reuse a passing JavaScript result only after proving its tested observer files, Node executable, arguments and report validation are unchanged by a Python-only repair. Bundle-pin equality alone is too coarse to establish or reject that reuse.
- A durable PASS-shaped file is not final acceptance: a later timeout/write failure can invalidate it. Require the full child/recorder/helper/tool outcome and final guards. Do not invent an impossible guarantee that an artifact predicts future process exit.
- Separate new blocking behavior from existing bounded durability calls. Wrapping the original registry fsync with diagnostics does not introduce a new fsync; the actual diagnostic emitter is a verified nonblocking pipe write.

- Measured win: the isolated controls reproduced the original cleanup failure at group, PID and inherited-probe signal calls, then passed all18 repaired behavior cases. Actual tool63410/helper/recorder/child exited0 in0.588654904s with both recorded process identities absent; independent201da395/root adoption admit this finite result. Fault tests exercise exact refused targets, remaining cleanup, deadline/reentry/caps/writer/snapshot failures without sending synthetic target numbers to the OS.
- This win qualifies the diagnostic implementation, not the original real17-method route or any game run. Keep those acceptance boundaries separate.

- The first real diagnostic run captured the exact refused target and continued cleanup, but a new driver integration bug prevented final reporting: adding a STOP assignment without declaring it global made Python treat every STOP access in main as local. All reviewers missed this. Static parsing and isolated module tests do not check the entry-point name-binding behavior; add RED/GREEN tests of the actual driver reporting tail, including both clean and refusal branches.
- Exact event ordering matters: the new run observed getpgid ESRCH, group SIGKILL EPERM, direct PID SIGKILL success, then a reaped exit-9 and absent group. This motivates an exit/reap-order diagnostic; it does not yet prove the host reason or identify the original failed run's target.

- Measured reporting fix: actual81061 exited0 throughout in0.858775245s. Two original-tail cases reproduce the exact UnboundLocalError, and ten corrected-tail cases pass, including prior STOP preservation, late artifact/emission refusal and deadline precedence. Independentf0733ca9 admits this result; root adopts it separately from the still-failed real17-method route. A one-line language-scoping repair needs an entry-point integration test, not a larger code rewrite.
