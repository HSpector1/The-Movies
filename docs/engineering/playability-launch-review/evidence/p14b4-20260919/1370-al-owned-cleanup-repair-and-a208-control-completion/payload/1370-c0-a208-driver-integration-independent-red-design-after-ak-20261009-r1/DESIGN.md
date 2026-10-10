SOURCE ONLY, UNRUN. No workload or control execution is authorized here.

The actual66101 diagnostic remains STOP: tool/helper/recorder2,driver-14,
3.5028156069893157s, three+fourteen method reports OK, no driver RESULT. A fresh
captured EPERM identifies killpg94482/slot3/seq7 and retains later cleanup.
This new target does not identify the earlier failed run's target. Host EPERM
cause and SIGALRM causal relationship remain unknown. The separate sealed STOP
receipt63f323d2 preserves source/streams and the observed UnboundLocalError.

The r1 driver0a4934e6 adds a STOP assignment in main185 but its global declaration
lists only REG,PHASE,ROOT,CLEANUP. This makes STOP local throughout main: refusal
reads the uninitialized local at185, and a valid clean outcome would read it at187.
My source reviews missed this scoping defect. Prior eighteen GREEN controls
exercised the cleanup module, not the actual driver's integration/result tail.

The authored controls accept exactly four positional arguments: r2 drive path,
r2 SHA256, r1 drive path, r1 SHA256. R1 must be authenticated0a4934e6. R2 must be
byte-identical except adding STOP to main's existing global declaration; an
unrelated repair cannot pass this test's source gate.

AST extraction copies main's actual global declarations, the exact final
if CLEANUP.refusal_codes branch, and every subsequent statement through actual
return. An explicit fake prelude supplies actual local outcome/reason/cleanup/root
state. Only original ControlStop, need and deadline_guard helpers accompany the
tail. No driver import, top-level timer, suite, real cleanup syscall, fork,
process, file/descriptor, fsync, actual signal or actual timer executes. Every
tail callback is synthetic. Source reads and final harness summary are the only
real I/O under a future separately granted run.

Two original expected RED cases require exact UnboundLocalError naming STOP
inside main at185(refusal) and187(clean), without fake RESULT/emission/timer
disable. Ten candidate GREEN cases require clean valid counts/state alone pass;
EPERM yields sticky STOP/result2 with retained synthetic errno/target; prior STOP
survives both with and without new refusal; invalid method count and unclear
owned state refuse; actual late artifact/emission gates raise ControlStop; hard55
exits through a fake124 before I/O; fixture-cap failure cannot conceal refusal.
Late candidate PASS bytes are invalid because actual main raises and the full
parent gate separately requires genuine child/helper/recorder exits0.

One JSONline<=12288B is emitted. Accepted schema is
a208-independent-driver-integration-controls/v1, status
DRIVER_INTEGRATION_CONTROLS_PASS, expectedRed=observedExpectedRed=2,
expectedGreen=observedGreen=10, len(cases)=12, failure=null, game=false,
realIO=false,realSignals=false,driverTopLevelImported=false. Exact case names and
order are constants RED_NAMES and GREEN_NAMES in controls.py. Any mismatch,
unexpected RED or missing GREEN exits2. No intended stderr.

These controls are a separate pure AST-tail route under future20/25/30+64KiB
recording; they replace neither the qualified module3RED18GREEN21 outcome nor
the real three+fourteen method diagnostic route. They do not validate real
suite execution/ownership capture/cleanup or grant a retry, game or pricing.
Source review must check the extraction boundary, authentic inverse, actual
global scope and exact late gates; execution must await root review/grant.

Lesson: extract and exercise actual caller integration when adding a global
state assignment, not only the helper module. A source review that preserves
all tests and pins can still miss a Python name-binding error. Keep the failed
run and admissions distinct from the repair and future outcome. The r2 repair
can fix result transport while real EPERM remains a refusal to accept.
