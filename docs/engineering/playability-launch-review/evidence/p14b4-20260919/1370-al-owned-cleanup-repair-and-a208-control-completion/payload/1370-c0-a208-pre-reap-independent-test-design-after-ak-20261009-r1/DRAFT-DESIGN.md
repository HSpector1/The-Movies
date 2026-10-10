SOURCE-ONLY DRAFT. No functional source, runnable controls or execution grant.
Root must independently admit the microprobe and adopt the functional design
before implementation or final test authorship. All kernel-cause statements
remain hypotheses until separately supported; fake ordering faults are not host
causal evidence or an attribution of the original failed run's target.

The baseline is frozen r2 driver73519d8146d44b7076dcd73188baaf57743e27076198f4d3cb6d31bcb04fae07,
module8117463b6ecd6aa57dd5b34a6ad1ee50f8d9a82197b13659bed0f489a6ad2a15,
and admitted actual-tail integration2RED10GREEN12 (reviewf0733ca9). Both real
seventeen-method diagnostic attempts remain STOP; original module3RED18GREEN21
and actual-tail qualification remain distinct admissions.

The proposed contract, coordinated with the implementation author, is a minimal
driver-only reap_completed() immediately before existing hard_kill in cleanup.
The helper traverses at most seven retained valid owned PID slots. Unreaped slots
alone receive exact REAL_WAIT(pid,os.WNOHANG). Only tuple2 with exact int fields,
matching owned PID and successfully decoded wait status admits completed/reaped
state; (0,0) remains live. Mismatch, malformed pair, unexpected live status or
conversion failure refuses without substituting a returned PID or treating it
as another slot's authority. Update exit/reaped consistently after validation;
retain observed raw status in bounded diagnostics. Already-reaped slots never
receive another wait.

For reaped slots only, exact owned group0 probes determine groupClear. Use the
existing cleanup_group_probe(pid), which returns True on syscall success, through
existing CLEANUP.attempt('group-check',...). Module ESRCH returns (True,None);
that alone admits groupClear=True. Raw os.killpg success also returns None, so
passing raw killpg as that callback would falsely clear live descendants. Present
groups remain for existing group kill; reaped leaders do not get direct PID kill.
Probe uncertainty/EPERM and wait errors are sticky refusal, while later retained
owned slots are still attempted within the unchanged clocks. Live/unreaped state
never grants groupClear. Module and final main report tail stay unchanged.

The independent boundary must capture actual call order. Authenticate baseline
and candidate bytes, AST-extract the actual driver cleanup-entry statements plus
the required helper/hard_kill/zero-probe/deadline helpers, and use fake state,
clock, wait, group and direct kill callbacks. If root places the helper call
inside hard_kill, extraction must retain that actual placement. Do not manually
compose reap_completed();hard_kill() in the tester: a missing/misordered real call
could otherwise pass. Driver top-level imports/timers, suite, process creation,
filesystem I/O and real signals remain excluded. Reuse authenticated module811746
with its injected operations; do not reimplement its cleanup policy in the test.

Proposed finite roster is one expected old-order RED plus twelve focused GREEN
cases (thirteen rows). Counts are draft, not an actual run outcome.

| Case | Injected state/fault and independently required behavior |
| --- | --- |
| old-order-exited-unreaped-EPERM | Baseline actual entry sees an exited but unreaped retained leader; fake positive group kill refuses EPERM until reaped. Require exact owned target/errno/error and sticky refusal, no preceding wait/group0 skip. This RED demonstrates ordering under injected behavior only. |
| pre-reap-completed-ESRCH-skip | Exact owned wait completes, status decodes, then group0 ESRCH. Both positive group and direct PID kills for that slot are absent; target identity/status remain exact. |
| pre-reap-live-child-existing-kills | Wait(0,0) keeps unreaped/live state and cannot mark group clear; existing owned group+PID kills still occur. |
| pre-reap-leader-descendants-live | Wait completes leader; group0 success returns True, so existing group kill occurs and direct PID kill does not. Descendants are not cleared merely by leader reap. |
| pre-reap-already-reaped-no-wait | Already-reaped leader receives no wait; group0 present still permits group kill. A second helper call for a proven cleared slot performs no repeat wait or positive kill. |
| pre-reap-wait-error-sticky-continue | First owned wait raises EIO/ECHILD as a bounded fixed fixture; exact target/error/errno refuses, no fabricated reap/clear, later owned target attempts continue. |
| pre-reap-group-EPERM-sticky-continue | Completed leader group0 raises EPERM; no clearance admission, exact error retained and sticky through later targets/cleanup. Existing positive targets remain strictly the retained list. |
| pre-reap-mismatched-wait-refused | First wait returns a different PID, including another slot's number. No substitute probe/signal or cross-slot state update; refusal stays sticky and later slot is handled by its own call. |
| pre-reap-malformed-wait-refused | Fixed matrix: None, wrong tuple length, list pair, bool got/status, and (0,nonzero). Reject before reaped/clear mutation; no unbounded input expansion. |
| pre-reap-status-conversion-refused | Matching owned PID but injected status decoder raises. Preserve bounded observed status/error, no false successful state admission, continue later retained slots. |
| pre-reap-deadline-precedence | Fixed entry55 and first-wait-clock-to55 fixtures. Existing deadline path dominates; no later-target wait/probe/positive signal and no successful result/timer cancellation. |
| pre-reap-owned-boundaries | Overfull8 slot list refuses before prefix syscalls. Fixed invalid-target matrix None/bool/0/1/negative/string never reaches wait/probe/signal; valid later retained slots continue. Existing seven/four real route counts stay unchanged. |
| pre-reap-diagnostic-cap-sticky | Buffer near existing cap when prefix adds wait/probe diagnostics, plus a wait refusal. Dropped evidence/cap remains sticky, aggregate/field/event caps stay unchanged and no capture loss becomes a successful route; continuation is still time bounded. |

Normal positive-signal authority is unchanged: only exact retained owned groups
and unreaped PID targets through existing module, with inherited probes preserved.
No discovery, process-table scan, substituted groups or descendant enumeration.
The helper adds only nonblocking WNOHANG waits and existing exact group0 probes;
no wait retries, new sleeps, blocking diagnostics, timer masking or clock extension.

Source review must independently prove module bytes811746 unchanged, actual
entry order, r2 final main reporting tail AST identical, strict owned wait
validation/atomic state handling, group0 success-vs-ESRCH distinction, sticky
refusal and bounded loops. New code must preserve45/55,60/75/90,seven/four,
three+fourteen assertions,1MiB streams and8MiB fixture. Later pure recording may
use reviewed20/25/30+64KiB; neither this draft nor such pure tests grants a real
diagnostic retry. Existing eighteen module controls need no rerun without a new
reason: focused caller ordering/boundary/cap interactions supply the added scope.

Lesson carried forward: exercise the actual caller and its order, not a manually
constructed ideal sequence. Reaping alone does not prove a descendant group is
absent. An error latch survives correct later clearance and any diagnostic loss.
