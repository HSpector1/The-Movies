# P13A final delivery addendum — pinned documentation closeout

2026-09-12 · `OPS-P13A-OWNER-FEEDBACK-CLOSEOUT-20260912-03`.

**Implementation, final technical verification and packaging were completed for TS `45ca33650074ad5413c39fb9d4a5c04cd6571c3a` / Unity `6420a4d91de52db1bffca2988f2c995672e7d53e`. Current Ops now records qualified KEEP for the delivered Core direction**, based on the [exact Owner feedback and acceptance scope](../campaigns/P13A-OWNER-ACCEPTANCE-RECEIPT.md). Laboratory clarity and research depth remain follow-up obligations in the [producer handoff](../engineering/P13A-TO-P13B-PRODUCER-HANDOFF.md). No all-routes L9 result, final tuning approval or P13B activation is implied.

This is the final publication to read alongside the historical [technical matrix](P13A-TECHNICAL-ACCEPTANCE-MATRIX.md), [Owner route](P13A-OWNER-PLAYTEST-ROUTE.md), [correctness review](P13A-CORRECTNESS-REVIEW.md), [post-gate review](P13A-POST-GATE-CORRECTION-REVIEW.md) and [evidence index](P13A-EVIDENCE-INDEX.md). Their earlier pending language remains chronology. Only the specific closures below supersede it. Failed attempts are not relabelled as passes.

## Existing delivery evidence and identity checks

All local evidence paths below refer to the agent's sealed delivery at `/Users/bruce/Desktop/P13A-Delivery-20260912/`. They are not references to Howard's current campaign state. The repository publication contains three Markdown documents; raw logs, images and proofs remain in that local delivery, so a remote reader needs access to that evidence archive.

| Existing record | SHA-256 |
| --- | --- |
| [Delivery checksum manifest](/Users/bruce/Desktop/P13A-Delivery-20260912/DELIVERY-SHA256.txt), 1,375 entries | `de46dd574acc73209ec38ee50b5edac92e12b71f715046401a7dd52e9fadb654` |
| [Final Current Ops report](/Users/bruce/Desktop/P13A-Delivery-20260912/CURRENT-OPS-REPORT.md) | `8c3f6f75c3e0c7adbb8c35ad9c3d884d8934b6f69a97fc3995faceae53499b5e` |
| [Final technical matrix](/Users/bruce/Desktop/P13A-Delivery-20260912/TECHNICAL-ACCEPTANCE-MATRIX.md) | `a2c2245ae822051e6c6bc424f09e38ea15020023ba4b4dec054a05886a9414db` |
| [Source identities](/Users/bruce/Desktop/P13A-Delivery-20260912/SOURCE-IDENTITIES.json) | `263fcbad159a03e7116a0cc38cfba79b69eb48a2f4b1c4997fd6d77f487f9b6e` |

A bounded read-only closeout check found all 26 selected closure documents/metadata artifacts present and matching the existing delivery manifest. That is a selected-artifact identity check, not a new full-archive audit or a runtime verification. The receipt binds the player, build manifest, engine/worker, worker source manifest, schema, DTO, candidate and launcher from the retained package records. No executable was rebuilt or rehashed for this publication; no campaign was opened, hashed, reset or restored.

The original accepted TS base was `592e926bfbf4574df94b38fc8dd594fc5df2ac8d`. Before Unity runtime work, the ordered comparison of accepted player source `deca39521da1baeca61898d156a43f4ae6a7e035` to later source-manifest HEAD `2bc8d304b79a72bf20fda1d462ec3d96df253992` found identical Assets, Packages and ProjectSettings with four Tools-only commits. The latter became the isolated Unity implementation base. The [execution log](../campaigns/P13A-EXECUTION-LOG.md) and final report retain that finding; this closeout did not repeat reconnaissance.

## Final verification closure and source applicability

| Obligation | Final result and existing evidence |
| --- | --- |
| Full TS suites and typechecks | At runtime commit `11ca8a4649d90b2da10536d6d9bcf842df7f35f5`: core **214 files / 2,584 passed**, no failures/skips, 138.80s; UI **201 files / 2,684 passed, five existing skips**, no failures, 34.25s. Core/UI/bridge typechecks, explicit studio runtime build and packaged audit passed. [Final suite record](/Users/bruce/Desktop/P13A-Delivery-20260912/Evidence/TypeScript/final-verification-02/final-ts-suite-11ca8a4.json), SHA `37a062d5ca5c7b95b5dfae894bb399c48c3a31d5cc242f2891eacfd5d2bfc879`. Later TS commits through delivered `45ca336` concern documentation, fixtures/package preparation and verification outside the emitted runtime graph. |
| Latest Unity compile and full EditMode | At delivered `6420a4d`: **1,139/1,139 passed**, zero failures/skips, 16.437s; successful build at `2026-09-11T22:26:25Z`. [Latest test metadata](/Users/bruce/Desktop/P13A-Delivery-20260912/Evidence/TypeScript/final-verification-02/native-adoption-receipt-copy-tests.json). Earlier 1,138 and 1,139 runs remain separate; the current corrected native replay closes that metadata's historical replay-pending wording. |
| Narrow native retests | Laboratory/Finance headless PlayMode **7/7**; rendered first-snapshot/body and memo geometry **2/2**. The combined rendered attempt was **8/9**, retaining one Finance chart-navigation failure. Unchanged Finance-only rendered retest was **5/5** after a 1440×900 request; startup was 228×391, so dimensions throughout those assertions and the earlier failure's cause remain unproven. No Finance assertion or algorithm was weakened. [Retained qualification](/Users/bruce/Desktop/P13A-Delivery-20260912/Evidence/TypeScript/final-verification-02/native-finance-and-rival-preparation.json). These are scoped retests, not extra full-suite totals. |
| Incoming accepted V19 through actual native Save/Quit | Generated week-316 campaign; nine actual steps on delivered `45ca336`/`6420a4d`, no gameplay advance, clean UI Quit. Four complete current/saved slots preserve original state after only the authorized neutral migration additions, Save19→20 version change and approved `era.soundRequired:true→false` correction. No invented Scientist/history; 84 people, six contracts, 135 Hollywood films, 61 studio-history rows and 379 ledger rows preserved. [Native preservation proof](/Users/bruce/Desktop/P13A-Delivery-20260912/Evidence/Unity/early-2026-09-11T22-37-50-374Z/native-v19-preservation.json), SHA `399a3603185357caa873ef5c71eff78eae58320e6b395141b1352fc4bf5c1921`; [independent audit](/Users/bruce/Desktop/P13A-Delivery-20260912/Evidence/Unity/early-2026-09-11T22-37-50-374Z/native-v19-independent-audit.json). One campaign, not four worlds or a performance sample. |
| Causal product critique | [Causal critique 04](/Users/bruce/Desktop/P13A-Delivery-20260912/Evidence/Unity/P13A-CAUSAL-PRODUCT-CRITIQUE-04.md): **internal KEEP**, with corrected 1280×720 and preceding 1440×900 observations, actual named Scientist body/Locate, Research/Working context, receipt-count units, Laboratory/Industry text and Back/context restoration. The earlier REVISE/interrupted attempts remain retained. |
| Packaged Save As/Rename/isolation | Candidate03 [43-step native report](/Users/bruce/Desktop/P13A-Delivery-20260912/Evidence/Unity/early-2026-09-11T23-58-26-346Z/report.json), clean UI Quit at `2026-09-12T00:07:04.835Z`. Actual Save As creates A and B; A advances 261→266 to nine work units/$60,000, while paused B remains at 261 with 1.5 work units/$10,000. Actual Rename preserves game authority and changes only lawful catalogue metadata/receipt. [Complete-state proof](/Users/bruce/Desktop/P13A-Delivery-20260912/Evidence/Unity/early-2026-09-11T23-58-26-346Z/native-campaign-isolation-rename-proof.json). |
| Same-package clean relaunch | [14-step relaunch report](/Users/bruce/Desktop/P13A-Delivery-20260912/Evidence/Unity/early-2026-09-12T00-08-21-144Z/report.json), clean UI Quit at `2026-09-12T00:11:24.968Z`. Actual A/B Loads restore their distinct complete saves. [Independent full durable proof](/Users/bruce/Desktop/P13A-Delivery-20260912/Evidence/Unity/early-2026-09-12T00-08-21-144Z/native-package-relaunch-proof.json), SHA `43186fd46441964419441d6370d8e047a87e0ce4537b5ffe33e6ae7a6f4573fb`: all ten complete records unchanged across relaunch, all eight original review entries preserved, original 01 restored without inventing a saved slot. Both reports record clean input, zero foreign/unknown events and clean owned-process/lease/lock closure. These are historical generated QA results, not current Owner campaign assertions. |
| Distinct final integrated critique | [Independent final integrated Core critique](/Users/bruce/Desktop/P13A-Delivery-20260912/Evidence/Unity/P13A-FINAL-INTEGRATED-PRODUCT-CRITIQUE-01.md): **internal KEEP**, SHA `1ed3f48a6a0e344c9626d3f7f39a4bd7b2401aea92c122f08cb0532e8fbf8277`. It closes the separate final integrated critique obligation using completed reports, states and images. It does not replace Howard's feedback or negate his usability findings. |

L0–L8 technical closure is supported by the final matrix with its stated qualifications. Native conclusions use actual guarded interaction reports, maps, authority bindings and durable proofs; screenshots document appearance but do not alone prove interaction, state preservation or responsiveness. Mouse/keyboard and virtual/mapped controller coverage do **not** establish a physical-controller playtest. Local 100%/200% and viewport observations do not establish universal legibility or one continuous all-route native playthrough.

Candidate01's Node executable-binding refusal, Candidate02's idle-admission refusal and subsequent foreign-input stop remain unsuccessful package attempts. Their cleanup does not prove clean UI Quit or successful relaunch. The final candidate is Candidate03; no admission guard was weakened.

## Performance: rejected observation, correction and fresh pass

The [original matched regression and stop](P13A-CURRENT-OPS-ESCALATION.md) remain rejected observations: 20 measured samples per side, with every P13 observation above every accepted observation.

| Original population | Complete Save median / p95 / max, ms | Load-ready median / p95 / max, ms |
| --- | ---: | ---: |
| Accepted control | 6,695.293 / 6,736.149 / 6,744.941 | 13,456.145 / 13,532.035 / 13,545.225 |
| Stopped P13 | 7,643.207 / 7,683.049 / 7,701.774 | 15,874.095 / 15,935.133 / 15,936.137 |

P95 increases were +14.057% / +17.759%. Order02 authorized a bounded correction and a fresh matched median/p95 gate of at most +5%, not acceptance against permanent historical millisecond targets.

Exact fix: **`50460f3aa14f77cfe38be15ed9d991cf983cfa92`**. P13's historical-film membership fallback made 6,435,042 predicate visits per technology validation on the 6,240-week fixture. A function-local nested studio→film-ID set replaces repeated searches. Every original validation, row, reference, receipt and reconciliation remains enforced; no persisted/module cache, extra persisted shape or campaign-unsafe ID cache was introduced.

[Before/after component evidence](/Users/bruce/Desktop/P13A-Delivery-20260912/Evidence/TypeScript/performance-correction-02/diagnosis/component-comparison.json) records inclusive diagnostic totals, not additive costs or percentiles:

| Component | Calls before / after | Before → after, ms |
| --- | ---: | ---: |
| Technology validation, load-ready | 38 / 38 | 2,627.678 → 106.520 |
| Full V20 validation, load-ready | 38 / 38 | 7,486.039 → 4,848.921 |
| Technology validation, Save | 13 / 13 | 721.461 → 34.184 |
| Full V20 validation, Save | 13 / 13 | 2,490.888 → 1,636.931 |

Fresh matched comparison: accepted `592e926bfbf4574df94b38fc8dd594fc5df2ac8d` versus corrected `2ac73da2cd4c7a71ea54407c76a20e0a4c75cf60` containing the fix. **Three excluded warmups plus 20 measured Save/load pairs per side**, nearest-rank p95; no discarded observations or confirmation rerun.

| Phase | Accepted median / p95 / max, ms | P13 median / p95 / max, ms | Median / p95 regression |
| --- | ---: | ---: | ---: |
| Complete Save | 7,112.991 / 7,414.568 / 7,791.659 | 7,341.145 / 7,445.594 / 7,460.085 | +3.2076% / +0.4185% — PASS |
| Load-ready | 14,385.557 / 14,958.267 / 15,004.195 | 14,817.094 / 15,044.235 / 15,145.679 | +2.9998% / +0.5747% — PASS |

[Paired comparison](/Users/bruce/Desktop/P13A-Delivery-20260912/Evidence/TypeScript/performance-correction-02/acceptance/paired-comparison.json), SHA `4900ea7053281d3e7528787bc7dbcf9d602bd1a063bfcbfe3cf7b1a88c89ce10`; [accepted raw population](/Users/bruce/Desktop/P13A-Delivery-20260912/Evidence/TypeScript/performance-correction-02/acceptance/accepted/store-report.json); [corrected raw population](/Users/bruce/Desktop/P13A-Delivery-20260912/Evidence/TypeScript/performance-correction-02/acceptance/corrected-p13/store-report.json). The [acceptance report](P13A-PERFORMANCE-CORRECTION-02-ACCEPTANCE.md) retains full precision, timings, hardware, workload, harness and source bindings.

The fresh control shifted materially; the authorized fresh ratios govern. Conditions were sequential, coordinated team-quiet on the same M3 Max/128GiB machine and Node26.3.1, with actual production storage and three real Save As records reset identically. Ordinary OS activity was uncontrolled; these are neither cold-cache nor exclusive-CPU measurements. HTTP, worker startup/message transport and native input responsiveness are outside the sampler. Build-manifest generation used Node24.16.0; the successful package launcher/admission and benchmark used Homebrew Node26.3.1, as recorded.

**Final candidate bytes were not benchmarked again.** The [literal-only source proof](/Users/bruce/Desktop/P13A-Delivery-20260912/Evidence/TypeScript/final-verification-02/p13a-technology-phase-copy-proof.json) binds measured `2ac73da` to runtime `11ca8a4`: 109 of 113 sampler inputs byte-identical; four inputs contain seven copy replacements, +338 bytes, with algorithms preserved. Later TS commits through 45ca336 are outside the emitted runtime graph; Unity presentation changes are outside the standalone sampler. Carrying this qualified evidence is not a claim of byte identity or zero timing effect.

## Endurance and bounded recovery

The existing generated accepted/P13 worlds each completed 6,240 actual ticks, canonical round trips and matching next-tick continuation. P13 save size was 48,984,542 bytes versus 47,825,995 accepted, +1,158,547. Retained production-technology history grows with film count, so P13 state is not claimed constant per studio. V19→V20 migration alone at that horizon measured 478.698 /507.337 /527.735ms median/p95/max, three warmups and 20 observations, excluding JSON parsing. [Original performance evidence](P13A-PERFORMANCE-EVIDENCE.md).

The [32-record recovery report](/Users/bruce/Desktop/P13A-Delivery-20260912/Evidence/TypeScript/recovery32-02/current-recovery/recovery-report.json), SHA `758e7171ec13b6eb3b6f46967cc64e6470ced1a04f67f54e1df4e42dc9891d1e`, closes the actual library-bound proof. It contains **one accepted 6,240-week record and 31 accepted 316-week records with distinct storage UUIDs**, not 32 independent full-endurance campaigns. Three recoveries took **31,274.135 /31,243.185 /30,973.101ms**; no p95 is claimed. Each checked 66 complete current/saved slots, **198 whole-save comparisons total**, using independent subtraction of only authorized neutral migration changes, with no migration function as the expected-result oracle. All passed, with zero errors and clean locks. The existing 32-record /256MiB encoded /1GiB decoded /192MiB individual-checkpoint bounds remain enforced. [Recovery method and source applicability](P13A-32-RECORD-RECOVERY-02.md).

## Inherited P12 limitations retained in full

These are inherited measurements against accepted TS 592e926 / Unity 2bc8d30 and the 197-file P12 package manifest `25facdbc105674ed86153568ac27b1e60558679431288ca7f9261b37a7c0ac64`, as preserved in [companion §8 at planning commit4734e409](https://github.com/HSpector1/The-Movies/blob/4734e4092d117ef89b7349389ef03bd95fc298c3/docs/engineering/P13A-DECISIONS-AND-ACCEPTANCE-COMPANION.md#8-performance-limits-carried-forward). That planning identity is not a runtime source.

| Inherited phase | Median / p95 / max, ms |
| --- | ---: |
| Production durable write | 52.011 /53.564 /56.602 |
| Complete library load-ready | 13,322.655 /13,414.888 /13,423.440 |
| Complete campaign Save | 9,517.586 /9,577.754 /9,612.708 |

- The 9,577.754ms historical Save p95 used a different 8,794-week/three-record workload; it is not the fresh P13 matched control. Previously reported Save/load p95 improvements of 47.51%/27.48% did not establish original target attainment.
- Native Save response 10.542s and first observed re-enabled Save at about 11.792s, with 41 maps advancing 1,740 frames, establish rendering progress only. **UI/input-unresponsiveness duration remains unmeasured.**
- Standalone high-water RSS 4.821GB remains a reference cost, not a minimum machine specification.
- The 30-second frame sample had **zero Save overlap**: p95 8.504ms/max 85.573ms are not Save-time frame results. Its 1,368 non-live frames remain disclosed despite continuity true and zero recorded outages.
- Missed original targets remain: serialize+digest 199.524ms versus 100ms; Hollywood field delta 37,829,874 bytes versus 8MB; average durable film 3,146.433 bytes versus 1.5KB.
- The 12-active/48-project/4,000-film/50-archived-studio stress and isolated write-only worker handoff, queue and durable-ack transport remain unmeasured.
- Intermittent Reconnecting observations remain recorded without recorded transport outages. Their evidence attribution is the P12 handoff/evidence JSONs, not the performance-attestation Markdown.
- Permanent history, strict validation/references, exact receipts, campaign isolation, page bounds and the synchronous engine-main storage 50ms prohibition remain binding. This closeout reran no workload, build or native input.

## Closeout checks, reserve and remaining boundary

No selected final closure artifact was unavailable. Remote access to the local evidence archive is not implied by publishing these documents. Missing Owner reports for individual routes, physical-controller coverage and the unmeasured performance cases above remain evidence boundaries; none was filled by assumption or by replaying Howard's campaigns.

[Final reserve accounting](/Users/bruce/Desktop/P13A-Delivery-20260912/FINAL-RESERVE-ACCOUNTING.json) retains its `2026-09-12T00:19:57.791403+00:00` cutoff: elapsed 5h24m34s, conservative charge **5h30m**, **22h30m remaining**. The bounded performance phase used 43m55s of its 10-hour cap and left 27h16m05s immediately afterward, above the 18-hour floor. These are the existing delivery-accounting facts, not a new runtime time charge or authority to spend unused reserve.

The new order file 02 checksum is `c729e49003dd62439903ca4159aec762123ff8ba6a90c41596845b0aff26e869`. It authorizes only these three documents on `docs/p13a-owner-feedback-closeout-01`, based on delivered 45ca336. Document/link/identity checks are the closeout verification. No optional hooks, code/schema/tuning/assets/saves/dependencies, build, suite, runtime launch, native input, PR, merge or protected-ref promotion is part of this publication. The delivered application and mutable Owner campaigns remain untouched; P13B still requires its own finite execution order.
