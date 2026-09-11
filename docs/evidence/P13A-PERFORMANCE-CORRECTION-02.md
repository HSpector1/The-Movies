# P13A bounded performance correction — in progress

Authority: [OPS-P13A-PERFORMANCE-CORRECTION-20260911-02](../campaigns/OPS-P13A-PERFORMANCE-CORRECTION-20260911-02.md). This record continues the preserved [performance stop](P13A-CURRENT-OPS-ESCALATION.md); the original measurements and escalation packet remain unchanged. Capability is frozen until fresh matched Complete Save and load-ready median **and** p95 each regress by no more than 5%. No gate pass is yet claimed.

Correction reserve started **2026-09-11 18:55:23 UTC**, from 0 of 28 protected hours used. At most 10 hours may be used for this correction; at least 18 hours must remain for the unfinished verification and delivery. Active lead wall time, including coordinated waits, is charged conservatively. The exact stopped TS `1bba6645265ab59395c126b77afc95401cb7a29e` and Unity `608f719381938cc60126d31c7fc172c2b4d1dfb3` are preserved on local `wip/p13a-pre-performance-correction-02-ts` and `wip/p13a-pre-performance-correction-02-client` recovery refs. Work remains on the existing isolated implementation branches/worktrees.

## Diagnosis before correction

The first diagnostic pair used unchanged accepted `592e926` and stopped P13 source graphs, each with its original generated 6,240-week, three-record library in a fresh owned diagnostic directory. One unprofiled warmup and one CPU-profiled load/Save use the production checkpoint store and coordinator. These are diagnostic observations, not acceptance samples or percentiles. The profiler adds overhead; component inclusive times overlap and must not be summed.

Raw evidence: `artifacts/p13a/performance-correction-02/diagnosis/{accepted,stopped-p13}/profile-report.json`, the raw `.cpuprofile` files, and exact executable/source bindings alongside them. Both runs completed, retained world authority and inactive-record catalogue facts, preserved original fixture bytes, and closed their stores and locks. [The detailed diagnosis](P13A-PERFORMANCE-CORRECTION-02-DIAGNOSIS.md) retains broader component observations and exact emitted identities.

The specific P13-added cost is historical film membership inside `validateTechnology`: each retained rival loadout used `hollywood.films.some(...)` to prove its exact studio/film reference. On the actual P13 endurance state, 3,586 technology loadouts, 3,587 industry film rows and 3,579 historical searches cause **6,435,042 predicate visits per validation invocation**. That count is a separate read-only execution of the original short-circuit membership algorithm, outside timed phases; it is not a count of validation invocations.

The historical membership callback sampled **921.203 ms during load / 314.930 ms during Save**. `validateTechnology` sampled inclusive **1,117.311 / 374.480 ms**. Additional self samples attributed to `validateSaveV20` all point to its `validateTechnology(typed.state)` call site, so they do not establish a separate envelope or serialization cause. Identically instrumented diagnostic before/after component measurements are pending to avoid mistaking optimized-frame attribution for a second cost.

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

Fresh matched populations, gate disposition and final reserve accounting remain pending. Unity remains at the preserved, uncompiled correction checkpoint pending the performance pass.
