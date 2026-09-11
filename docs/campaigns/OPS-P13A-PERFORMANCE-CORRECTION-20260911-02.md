CURRENT OPS → P13A IMPLEMENTATION LEAD

OPS-P13A-PERFORMANCE-CORRECTION-20260911-02

DISPOSITION: CONTINUE P13A — BOUNDED PERFORMANCE CORRECTION AUTHORIZED

Your escalation was correct.

The measured matched regression is not accepted:

Complete Save p95:
accepted control 6,736 ms
P13A 7,683 ms
+14.1%

Load-ready p95:
accepted control 13,532 ms
P13A 15,935 ms
+17.8%

All 20 measured P13 samples exceeding all 20 accepted-control samples is sufficient evidence to treat this as a systematic regression rather than noise.

Do not resume feature work yet.

P13A capability scope remains frozen exactly where it is.

CURRENT OPS PERFORMANCE GATE

For this candidate, P13A may regress matched Complete Save or load-ready performance by no more than 5% relative to the accepted P12 control under the same benchmark conditions.

At the currently measured control this is approximately:

Complete Save p95 <= 7,073 ms
Load-ready p95 <= 14,209 ms

These millisecond values are not permanent historical targets. Rerun accepted P12 and P13A under the same conditions after the correction. If the control itself materially shifts, the fresh matched ratio governs.

Report median, p95 and max for both populations.

Median regression should also be <=5%.

Use at least 20 measured samples per side, matching the current benchmark.

If median passes and one clear isolated observation alone causes p95 to exceed 5%, one fresh 20-sample confirmation run is authorized. Do not repeatedly rerun benchmarks until one passes.

AUTHORIZATION

Use up to 10 hours of the protected 28-hour verification/correction/delivery reserve for:

1. diagnosis/profiling;
2. P13-specific performance correction;
3. matched benchmark rerun.

This is verification/correction work and is an authorized use of the reserve.

It is not capability work.

At least 18 protected hours must remain for the unfinished final verification, critiques, recovery proof, corrections and delivery unless Current Ops separately authorizes otherwise.

FIRST: DIAGNOSE

Preserve the current clean recovery points:

TS:
wip/p13a-synchronized-sound-01-ts
1bba6645265ab59395c126b77afc95401cb7a29e

Unity:
wip/p13a-synchronized-sound-01-client
608f719381938cc60126d31c7fc172c2b4d1dfb3

Profile the matched regression before attempting broad changes.

Isolate the P13-added contribution sufficiently to determine whether the new cost is coming from, for example:

serialization,
validation,
migration handling,
P13 state traversal,
derived indexes,
bridge/schema processing,
compression/digest work,
durable writing,
load reconstruction,
or another specific P13 path.

Do not assume the source from the headline timings.

CORRECTION BOUNDARY

Fix the smallest shared P13-added cause.

Do not achieve the target by:

dropping required P13 persisted state;
skipping or weakening validation;
weakening Save V19 migration guarantees;
removing receipts/history/provenance;
breaking Save As or campaign isolation;
making inactive campaigns advance;
weakening exact-ID or reconciliation invariants;
disabling accepted P12 checks;
changing the approved P13A gameplay scope merely for speed;
or turning this into a general P12 optimization programme.

Any cache must remain campaign-safe and must not collide across Save As copies that legitimately share entity IDs.

If diagnosis shows that the only viable correction requires broader architecture, loss of an accepted invariant, an additional persisted-shape change, or a general P12 optimization campaign, STOP and return the evidence to Current Ops rather than making that change.

PASS / RESUME RULE

When both matched Save and load-ready regressions are <=5%, and no correctness invariant was weakened:

resume the existing P13A execution without another routine Current Ops checkpoint.

Next complete, in the existing order:

* compile and test the latest native corrections;
* the unfinished 32-record recovery proof;
* causal product critique;
* final integrated P13A Core critique;
* remaining correctness/migration/performance verification;
* final evidence and candidate packaging.

The verification reserve remains protected and may not be spent on new capability.

FINAL REPORT MUST INCLUDE

* exact performance-fix commit(s);
* root cause;
* before/after component measurements;
* fresh accepted-control and P13A median/p95/max with sample counts;
* reserve hours consumed and remaining;
* confirmation that no gameplay/persistence invariant was weakened;
* final TS and Unity identities;
* full-suite results;
* recovery result;
* product-critique results;
* remaining qualifications;
* candidate/evidence locations.

Do not merge or promote protected refs.

Do not continue into P13B.

Current Ops retains final candidate disposition.
