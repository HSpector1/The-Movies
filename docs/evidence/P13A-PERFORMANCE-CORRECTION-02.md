# P13A bounded performance correction — matched gate passed

Authority: [OPS-P13A-PERFORMANCE-CORRECTION-20260911-02](../campaigns/OPS-P13A-PERFORMANCE-CORRECTION-20260911-02.md). This record continues the preserved [performance stop](P13A-CURRENT-OPS-ESCALATION.md); the original measurements and escalation packet remain unchanged. **The fresh matched Complete Save and load-ready median and p95 all pass the 5% gate.** Root independently verified the complete raw populations at **2026-09-11 19:39:18 UTC** and resumed the existing ordered verification without another routine checkpoint. No new capability or P13B work is authorized.

Correction reserve started **2026-09-11 18:55:23 UTC**, from 0 of 28 protected hours used. At most 10 hours may be used for this correction; at least 18 hours must remain for the unfinished verification and delivery. Active lead wall time, including coordinated waits, is charged conservatively. The exact stopped TS `1bba6645265ab59395c126b77afc95401cb7a29e` and Unity `608f719381938cc60126d31c7fc172c2b4d1dfb3` are preserved on local `wip/p13a-pre-performance-correction-02-ts` and `wip/p13a-pre-performance-correction-02-client` recovery refs. Work remains on the existing isolated implementation branches/worktrees.

## Diagnosis before correction

The first diagnostic pair used unchanged accepted `592e926` and stopped P13 source graphs, each with its original generated 6,240-week, three-record library in a fresh owned diagnostic directory. One unprofiled warmup and one CPU-profiled load/Save use the production checkpoint store and coordinator. These are diagnostic observations, not acceptance samples or percentiles. The profiler adds overhead; component inclusive times overlap and must not be summed.

Raw evidence: `artifacts/p13a/performance-correction-02/diagnosis/{accepted,stopped-p13}/profile-report.json`, the raw `.cpuprofile` files, and exact executable/source bindings alongside them. Both runs completed, retained world authority and inactive-record catalogue facts, preserved original fixture bytes, and closed their stores and locks. [The detailed diagnosis](P13A-PERFORMANCE-CORRECTION-02-DIAGNOSIS.md) retains broader component observations and exact emitted identities.

The specific P13-added cost is historical film membership inside `validateTechnology`: each retained rival loadout used `hollywood.films.some(...)` to prove its exact studio/film reference. On the actual P13 endurance state, 3,586 technology loadouts, 3,587 industry film rows and 3,579 historical searches cause **6,435,042 predicate visits per validation invocation**. That count is a separate read-only execution of the original short-circuit membership algorithm, outside timed phases; it is not a count of validation invocations.

The historical membership callback sampled **921.203 ms during load / 314.930 ms during Save**. `validateTechnology` sampled inclusive **1,117.311 / 374.480 ms**. Additional self samples attributed to `validateSaveV20` all point to its `validateTechnology(typed.state)` call site, so they do not establish a separate envelope or serialization cause. The identical before/after instrumentation reported below resolves that attribution without treating it as a second cost.

## Smallest correction and invariant review

Only the rival historical-membership fallback in `src/core/technology.ts` changes. A function-local nested `Map<studioId, Set<filmId>>` derives exact membership from the original film array once per invocation. Every original loadout still receives every original check. The complete original Hollywood array still reaches the existing full save validator: duplicate identities, unknown fields, malformed rows and invalid provenance remain refusals. The index does not replace, sanitize or persist the input.

The player active/released/locked-ledger fallback, active rival production lookup, first-filming locks, selected physical chain, research receipts, payroll, financial reconciliation and frozen V19 migration remain unchanged. There is no module/session cache, persisted field, new storage identity, entity-ID-only cache key or delimiter-composed lookup. Independent Save As copies and repeated validation of mutable caller objects build independent indexes. No P12 validation call, receipt, history, compression, digest, durable write or campaign-isolation check was removed.

Nine new meaningful regressions cover absent and cross-studio history, blank identities, original duplicate/malformed/extra-field rejection, independent same-ID round-tripped copies, and same-object removal/restoration revalidation. The affected five-file group passed **35 tests**, including real Save As/inactive-campaign isolation, adversarial finance, production locks and V19→V20 migration. Log: `/tmp/p13a-membership-correction-tests.txt`. Core/UI and bridge TypeScript checks pass. Independent review agrees the lookup replacement preserves the original checks.

The exact fix commit is **`50460f3aa14f77cfe38be15ed9d991cf983cfa92`**, on `wip/p13a-synchronized-sound-01-ts` in `/Users/bruce/The Movies - P13A Synchronized Sound TS`. Its only runtime change is the membership lookup; the other changed file adds the nine regression cases. The sequential full core run passes **214 files / 2,582 tests** in 139.39 seconds (`/tmp/p13a-correction-02-full-core-isolated.log`).

The initial concurrent full core/UI runs are retained in `/tmp/p13a-correction-02-full-{core,ui}.log`. Under that overlap, five existing campaign-library tests hit their unchanged five-second timeout; the UI suite hit one five-second inspector timeout followed by seven duplicate-DOM failures. Both suites passed on sequential reruns with unchanged source, assertions and timeouts. Full UI passes **201 files / 2,684 tests, with five existing skips**, in 40.39 seconds (`/tmp/p13a-correction-02-full-ui-isolated.log`). No timeout was increased or assertion removed.

## Direct before/after component comparison

Identical diagnostic-only `try/finally` timers wrapped copies of the frozen stopped and corrected emitted bundles. No product source was instrumented. Both used the same original generated P13 library, one warmup and one profiled observation, and the same wrapper transformation. Raw function call durations, source/bundle/instrumenter hashes and broader profiles remain under `diagnosis/{stopped-p13-components,corrected-p13-components}/`. These instrumented values are diagnostic wall measurements, not acceptance percentiles; the full validator includes technology validation, so their totals are not additive.

| Component and phase | Calls before / after | Stopped milliseconds | Corrected milliseconds |
| --- | ---: | ---: | ---: |
| Technology validation during load-ready | 38 / 38 | 2,627.678 | 106.520 |
| Complete V20 validation during load-ready | 38 / 38 | 7,486.039 | 4,848.921 |
| Technology validation during Complete Save | 13 / 13 | 721.461 | 34.184 |
| Complete V20 validation during Complete Save | 13 / 13 | 2,490.888 | 1,636.931 |

The local index removes the measured added membership traversal without reducing validation invocations. Broader inherited serialization, validation, digest and durable-writing work remains in place. The corrected diagnostic run completed at `2026-09-11T19:13:46.364Z`; every run's raw timestamps and checks remain in its own report.

## Fresh matched acceptance and reserve accounting

Both sides use the unchanged production sampler (harness SHA `4e0f8303eb6890f854fb5c20fb7030dfdab8ca73ff63cd86a67f8f2479b8607a`), three warmups and **20 measured samples per phase**. No diagnostic instrumentation is present. Every observation remains included; no confirmation or additional acceptance run was needed. Nearest-rank p95, ordinary OS cache/GC and all retained boundary qualifications remain unchanged. All reports completed without errors, preserved authority and catalogue facts, and closed their owned stores and locks.

| Phase, milliseconds | Accepted P12 median / p95 / max | Corrected P13 median / p95 / max | Median regression | p95 regression |
| --- | ---: | ---: | ---: | ---: |
| Complete Save | 7,112.991 / 7,414.568 / 7,791.659 | 7,341.145 / 7,445.594 / 7,460.085 | +3.2076% | +0.4185% |
| Load-ready | 14,385.557 / 14,958.267 / 15,004.195 | 14,817.094 / 15,044.235 / 15,145.679 | +2.9998% | +0.5747% |

Accepted ran `19:20:25.538–19:29:29.485 UTC`; corrected P13 ran `19:29:42.241–19:39:00.708 UTC` on 2026-09-11. This was a coordinated team-quiet sequential window, with no other team tests, builds or native work. Ordinary OS background remained uncontrolled; this is not an exclusive-CPU or randomized-population claim. The fresh control is slower than the earlier control; **the fresh ratios govern as explicitly ordered**, rather than the earlier approximate millisecond ceilings. Original stopped, noisy and diagnostic observations remain separately preserved.

Accepted source remains `592e926bfbf4574df94b38fc8dd594fc5df2ac8d`. Corrected source was frozen at clean `2ac73da2cd4c7a71ea54407c76a20e0a4c75cf60`, whose runtime fix is `50460f3aa14f77cfe38be15ed9d991cf983cfa92`. The accepted bundle `39268856cf4cc370efca319fe05363b057d85a01c18f6bb2d4d8a394a3846581` is byte-identical to the previous control; the corrected bundle is `5ac3bd89845c5ea23d38f90d772165cc501583a265bbde753f09e8758ac87ed8` (1,640,316 bytes / 113 inputs). Post-run source/bundle checks found no changes. Raw reports, complete samples, bindings, measurement windows and exact comparison are under `artifacts/p13a/performance-correction-02/acceptance/`.

Correction reserve consumption from `18:55:23` to independent gate decision `19:39:18` is **2,635 seconds = 0.731944 hours** of the authorized ten-hour correction allowance. **27.268056 hours of the 28-hour reserve remain** at resumption, exceeding the protected eighteen-hour minimum. Subsequent native verification, recovery, critiques and delivery consume the remaining reserve separately; this correction phase is closed. No gameplay or persistence invariant was weakened. This gate pass is not final candidate acceptance, and Howard's L9 remains separate.
