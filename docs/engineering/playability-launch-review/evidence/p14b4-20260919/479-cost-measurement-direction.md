# 479 — Bounded passive cost measurement before another production change

2026-09-20. Published/exactremote `32d04de361ae41534bf7e69345a8e061f8cbad4c`.
Replay frozen466 SHA256
`956a0245872f02e625c93a41cc2cc2033c4279129b85e100f315045d4d4f8ca4`.
Kernel unchanged `1faa6fcac443dac046bd97fa3e27c61bada80c7297f8e69ea4ebcff76d899332`.
ALL tests/owners/limits/HEAD frozen. No production optimization adopted.

## Question and scope

476 measured first-take producer196468 and kernel initial-scan cut199967/request45.
Stale prefix still cuts199998/request673 before Post3 owner. These are shared
budget failures, not permission to weaken validation or remove required work.
Repeated narrow fixes have exposed aggregate producer cost as the remaining
architecture question. Measure where that cost lies before selecting another
change; do not assume ten-role hints or another local cache will be beneficial.

One native sim writer may TEMPORARILY instrument ONLY replay module and write
480-cost-measurement-instrumentation.md. No kernel/test/owner/runner change,
runtime, Git, network or delegation. Parent owns481 actual diagnostic review,
482 first-take and483 stale serial runs,484 results/restoration. All observers are
unmetered diagnostic overhead, never proposed free production work. Archive the
temporary patch, then remove it and verify exact466/source/test restoration
before any production decision or publication.

## A. Successful-charge attribution

Use lightweight counters, not a stack on every pay. The work cap does not bound
payment-call count because zero-unit payments may exist. Preserve ALL original
units, expressions, comparisons, order, saturation, throws and catches.

After a successful original used increment, record units and count. On failure,
record usedBefore/request/remaining, optionally one stack, then preserve original
saturation and throw; do not count the failed request as successful payment.
Record initial work separately. Check without throwing:
initial + successful charges + saturation gap = final used.

Context: invocation/plan/week/phase. Tag calculator argument reserves and helper
execution, actual string equality/order/discovery, direct shallow-copy/token work,
selected explicit bulk reserves, and other direct work. An optional diagnostic
tag on pay is permitted ONLY in this removable patch; its default retains all
untagged direct work. Nested calculator charges must not be assigned the enclosing
bulk reserve. Mixed sweep/observation payment must be labelled mixed, not owner-only.
Keep totals exhaustive, avoid double-counting.

Prefer targeted before/after context changes around existing calls: root prep,
Ready admission, dimensions, arrival, sweep-bill calculation, event drain,
reconcile, commands, release bookkeeping, output/final projection. Restore prior
context after normal return; cuts retain the failing context. No wrapper may
skip/retry any actual operation. Full numeric summaries/reference ordinals only,
no whole GameState/record dumps. Keep output compact and complete.

## B. Exact-reference role-hint shadow

Maintain separate diagnostic storage keyed by exact DimensionCell identity,
initially empty per cell and retained across its siblings. Never add production
facts or alter scans. Ten roles: operations root, technology root, production,
workflow, bindings, reservation, task, setup, Set, technology row. Label existing
fact-call sites diagnostically; actual helper modes and all owner records unchanged.

At each fact-call entry, snapshot that role's shadow hint; hit only when its
original entry.record === requested record. Count actual historical visits ONLY
AFTER each original pay(6) succeeds. Observe original missing-mode flags:
modeComplete/upgrade/cold. Check, without throwing, that shadow hit resolves to
same shared entry during unchanged scan. Publish original returned entry reference
only at the three successful returns: hot, completed atomic upgrade, appended
cold entry. No numeric snapshots, premature publication or discovery bypass.
Report unfinished calls separately on cuts.

Report by invocation/site/week/role: calls/completions/hits/misses, successfully
paid visits, visits on hits, outcomes and entry/exit work. Candidate directional
model, NOT actual implementation/fit:
31 +4R +8O +40C +6D +12M −6Vhit.
R/root and O/other call counts include reached partial calls; D only completions;
M ALL completed hint misses including existing-table hits; Vhit only successfully
paid visits on exact-reference shadow hits. Keep partial-call contribution
separate. Native sim and independent auditor qualified prospective KEEP of this
model; future actual-source payment review remains required. Changed charges
can move cuts, so no extrapolation beyond observed prefix.

Existing public record-facts/sibling/two-picture controls remain untouched.
Their genuine records cover replacement and alternation, not cross-role
same-object mode upgrades; that correctness remains a static obligation.

## Handoff and acceptance

Freeze/hash patch and handback; parent main reads full diff and metadata, native
auditor checks measurement neutrality, attribution and shadow semantics before
any run. Run ONLY the two original failing whole test files serially via existing
record-check runner at fixed HEAD/source. Expected known failure IDs must remain;
if instrumentation changes numeric producer/cut outcomes or reaches a new failure,
investigate observer integrity before using measurements. No raised timeout/cap.

After both processes close and full raw/json are read, restore exact466 and
original kernel/test hashes, verify protected worktree clean, and preserve484
analysis with exact intervals and patch hash. Then select one evidenced
implementation direction and continue under one-writer/Fable review workflow.
