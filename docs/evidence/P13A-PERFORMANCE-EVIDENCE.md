# P13A bounded performance evidence — Current Ops STOP

**Execution stopped under the Current Ops material incremental save/load regression condition.** The matched quiet runs completed successfully, but every measured P13 Save and load took longer than every accepted-control observation of that phase. The activation supplied **no numerical incremental-regression margin**; none is invented here. Root invoked the stated escalation after reviewing the completed comparison. No optimization or further measurement followed.

| Observed phase (milliseconds) | Accepted P12 | P13 | Absolute increase | Relative increase |
|---|---:|---:|---:|---:|
| Complete Save, median | 6,695.293 | 7,643.207 | +947.914 | +14.158% |
| Complete Save, p95 | 6,736.149 | 7,683.049 | +946.900 | +14.057% |
| Load to ready, median | 13,456.145 | 15,874.095 | +2,417.951 | +17.969% |
| Load to ready, p95 | 13,532.035 | 15,935.133 | +2,403.098 | +17.759% |

Accepted Save range: **6,655.835–6,744.941 ms**; P13: **7,614.911–7,701.774 ms**. Accepted load-to-ready range: **13,420.595–13,545.225 ms**; P13: **15,853.316–15,936.137 ms**. Neither pair overlaps. These are two sequential empirical 20-sample datasets under coordinated quiet conditions, not a randomized population study or a numerical acceptance threshold.

P13 Save p95 is still below the retained **9,577.754 ms** reference, which used a different, later three-record workload. That comparison does not negate the measured increase against the matched accepted control.

**All 32-record preparations are UNEXECUTED.** The proposed one week-6,240 plus 31 week-316 library was not assembled; no 32-record load or migration ran. Existing 1 GiB decoded / 256 MiB encoded bounds were not changed. Those recovery costs remain unmeasured; the stop does not become a performance acceptance. Prepared scripts/bundles and their unexecuted disposition are retained.

This probe uses generated campaigns. No Howard campaign was opened, hashed or altered. Raw artifacts are under `artifacts/p13a/performance/`; the executable harnesses are `scripts/p13a/performance-{generator,store,migration}.mjs`. Their emitted bundles and complete input-file hashes bind each result even if the shared implementation worktree later changes.

Accepted control: `592e926bfbf4574df94b38fc8dd594fc5df2ac8d`, branch `wip/p13a-performance-baseline-01`, worktree `/Users/bruce/The Movies - P13A Accepted Baseline TS`. This is the exact accepted executable source, not the later P12 documentary HEAD. P13 source and emitted executable identities are captured in each `*-binding.json`; observed packaged production worker bytes are recorded separately in `r4-observed-production-worker-binding.json`.

The measured P13 sampler was frozen against TS commit `64b8a2beda3c42e13288c88b75577058d02170d4` on `wip/p13a-synchronized-sound-01-ts`, worktree `/Users/bruce/The Movies - P13A Synchronized Sound TS`. Its bundle is `4840d63d5ac51d1bddcf060b2a65194c803edec517ccc91b79847045fa646820` (1,639,980 bytes, 113 input files), recorded under `p13-final/`. The completed generator's 75 inputs and migration probe's 40 inputs remain byte-identical to this graph (`p13-final/measurement-window.json`). The separately observed packaged worker is `181a6d5c3979850ac894c26776acc35db16346b7945ec348cd5055b9538138a9` (1,653,980 bytes); its source manifest is `53f784f12376be3bf36daf17ac3fa671caa1ade7ad83b0297cccb70831e89dc3` (15,551 bytes). Those worker files are provenance observations, not executed sampler transport.

Both generated worlds progress from week 0 to 6,240 through actual weekly ticks. The P13 driver constructs its Laboratory, installs instruments, hires and assigns its Scientist, begins research at week 260, completes 64 work at week 303, commits the exact physical chain at week 303 and receives operational capability at week 315. Both drivers recruit a real player production package and make one film; P13 explicitly chooses synchronized dialogue. Rivals follow each product's existing weekly automation. Exact final save roundtrip and next-week equality are checked. This is a new 0→6,240 workload; it does not replace the retained P12 all-nine 2,548→8,788 endurance qualification.

Machine: Apple M3 Max, 16 logical CPUs, 128 GiB RAM, Darwin 25.6.0 arm64, Node v26.3.1, default heap. Runtime flags, sample timestamps, raw memory endpoints and RSS high-water are recorded with each run.

The complete-Save sampler preserves the retained `store-source.ts` production boundary: 3 warmups, 20 observed samples, nearest-rank p95, identical encoded-library reset before every sample, real checkpoint-store ownership and coordinator recovery, then the authoritative campaign Save transaction through durable acceptance. Untimed setup creates three named records through real Save As actions. The new records share the generated 6,240-week world; the retained 9,577.754 ms reference used a different three-record 8,794-week library. Matched accepted-P12/P13 results are reported separately from that reference.

Save includes proposal/fork, strict validation, production encoding/compression and atomic durable write. It excludes the prior catalogue read and later verification, HTTP, worker-message transport and Unity. Load-ready includes store ownership acquisition, coordinator recovery and first snapshot; excludes worker startup/transport. Samples use ordinary OS page cache, no forced GC or heap flags. Generation and the initial accepted control overlapped other authorized work. The final matched runs used the coordinated quiet windows recorded below; ordinary OS activity remained, so these wall-clock observations do not establish exclusive CPU attribution.

Migration times the governed V19→V20 migration on the accepted source's actual 6,240-week save. Input JSON parsing is reported separately. Existing history, player balances, contracts, RNG and rival period opening/closing balances must remain exact; migration adds zero adoption movement leaves and an empty technology root starting at 6,240. Per-studio byte attribution reports exact technology-row payload and finance movement leaves; global research-person leaves and actual whole-save differences are separate. No stripped counterfactual is offered as a valid save.

All retained P12 qualifications remain binding:

- Durable-write median/p95/max 52.011/53.564/56.602 ms; load-ready 13,322.655/13,414.888/13,423.440 ms; complete Save 9,517.586/9,577.754/9,612.708 ms. Separate phase percentiles are not additive.
- Native Save response 10.542s and first observed re-enable about11.792s; 41 sampled maps advanced 1,740 frames. Rendering progress does not measure input responsiveness; UI-unresponsiveness duration remains unmeasured.
- Prior Save/load p95 improvements 47.51%/27.48% do not mean target attainment. Standalone RSS high-water 4.821 GB is a reference cost, not a minimum specification.
- The retained 30-second frame window had zero Save overlap. Its 8.504 ms p95/85.573 ms max are not Save-time frame performance; 1,368 non-live frames remain disclosed despite continuity true and no recorded outages.
- Original misses remain: paired serialize+digest 199.524 ms against 100 ms; Hollywood delta 37,829,874bytes against 8 MB; durable-film average 3,146.433bytes against 1.5 KB.
- The 12-active/48-project/4,000-film/50-archived-studio stress and isolated write-only worker handoff/queue/durable-ack transport remain unmeasured. Intermittent Reconnecting observations remain disclosed despite no recorded transport outages.
- Permanent history, strict references/validation, exact receipts, campaign isolation, page bounds and the synchronous engine-main storage 50 ms prohibition are unchanged. This standalone coordinator probe makes no engine-main or native responsiveness claim.

Both generated campaigns completed 6,240 actual ticks, retained nine rival businesses and 3,579 simulated rival films, and released one actual player film. P13 retains one completed research project, two operational adoptions, and 3,586 production technology records. Exact final roundtrip and next-tick continuation passed. The long-idle player has negative cash in both worlds; unavoidable operating costs remain lawful, and no rescue money was fabricated.

The accepted V19 save is 47,825,995 bytes, SHA `2a8fa601d2aabda77a7b4f067a511690bebf34804c9ea7c61fb0086399b3ef71`. P13 is 48,984,542 bytes, SHA `87de16446ade6ee5610262c79a81fcde330dfb4902295276faaecfbe72c7632b`. The actual whole-save difference is **1,158,547 bytes**; this includes added physical/person/history facts and causal outcomes, not just the technology root. The technology root itself is 484,588 bytes. Global research-person leaves add 55,370 bytes.

Exact per-studio technology-row payload plus added finance movement leaves:

| Identity suffix | Added attributed bytes |
|---|---:|
| player | 1,201 |
| r01 | 96,081 |
| r02 | 96,081 |
| r03 | 6,603 |
| r04 | 96,081 |
| r05 | 6,775 |
| r06 | 6,867 |
| r07 | 72,159 |
| r08 | 67,296 |
| r09 | 56,872 |
| Total | 506,016 |

These ten identities share prefix `studio-db4a7e64-`. This attribution is 50,601.6 bytes per identity on average; the whole-campaign difference divided by ten is 115,854.7 bytes and is explicitly an average, not individual ownership. The 3,586 retained production-technology rows grow with film count; these figures do not establish constant storage per studio. Physical jobs and facilities, the added Scientist, contracts, research/operating ledger rows, permanent history and changed causal traffic are outside the narrow row/finance attribution. Added finance movement leaves are already included in the 506,016-byte subtotal and must not be counted twice. Both added amounts are below the existing 8 MB reference, while the original total Hollywood-size miss remains open. This is a bounded-horizon observation, not a general storage bound.

The final precision-fixed source's governed V19→V20 migration measured **478.698 ms median / 507.337 ms p95 / 527.735 ms max**, with three warmups and 20 samples. JSON parsing is separately recorded; it is excluded from those migration-only values. Original input bytes, existing history, contracts, RNG, player balances and every rival period balance remained unchanged. No research or filming history was invented at migration week 6,240.

The initial frozen P13 generator was stopped before completion after observing a 323.728 ms median tick over weeks 4,005–4,056. P09 rebuilt demolition history from the complete ledger for every operating-cost row. The authorized correction derives that same history once within each validation pass and retains every exact weekly charge comparison. No cache, persisted field or schema changed. The corrected run's median over those same weeks was 7.548 ms. Frozen campaign bytes at weeks 316, 520 and 2,600 were identical before and after the correction. The later research-budget precision correction also produced identical final 6,240-week bytes. Raw incomplete evidence and both source-refresh proofs are retained separately; the stopped run is not claimed as endurance completion.

The first P13 complete-Save probe failed before any warmup or measured sample: the valid week-6,240 state raised `studioLotSnapshot: invalid or ambiguous Gate Hiring authority` while preparing the campaign library. The Scientist's expired contract makes that boundary reachable. The failure, stack, emitted source binding and released quiet-window record are preserved in the P13 artifact directory. This is a functional projection defect; it is not a Save latency result, and no P13 Save p95 is claimed from it.

The correction adds Scientist to the strict Gate role set and passed 21 focused regressions plus core/UI/bridge typechecks. A separate functional preflight then loaded the exact 48,984,542-byte generated campaign, produced its full snapshot and completed an accepted durable Save without changing week or digest; its lock was removed. This preflight ran 17:22:34–17:23:01 UTC on 2026-09-11 and supplies no latency percentile. The emitted bundle is `522e26bb8e48aee3ee36e54ca46470e3bfd2bbd3aa32ae2d631b5c7d780cfa50` (1,633,271 bytes), with all inputs in `p13-gate-preflight/performance-preflight-binding.json`. The failed original attempt remains untouched.

The corrected P13 complete-Save run finished successfully with three warmups and 20 measured samples: **7,643.207 ms median / 7,683.049 ms p95 / 7,701.774 ms max**. Load-to-ready measured **15,874.095 / 15,935.133 / 15,936.137 ms**. All world, revision, inactive-record and cleanup checks passed. This run used a coordinated team quiet window; ordinary OS activity remained. Raw samples and timestamps are in `p13-final/store-report.json`, and the timing-source binding is in that directory.

The matched accepted run also finished successfully, using the unchanged accepted executable and fixture. P13 ran **2026-09-11 17:50:17.191–18:00:06.763 UTC**; accepted P12 ran **18:00:46.524–18:09:11.723 UTC**. Both had three warmups and 20 measured samples, no errors, exact authority and inactive-record checks, and clean lock removal. The team held native, Editor, test and build work during these sequential runs. The quiet window was released after both processes exited.

The accepted sampler bundle is `39268856cf4cc370efca319fe05363b057d85a01c18f6bb2d4d8a394a3846581` (1,535,759 bytes; 106 inputs). Both accepted and P13 samplers share exactly the same harness source SHA `4e0f8303eb6890f854fb5c20fb7030dfdab8ca73ff63cd86a67f8f2479b8607a`. Post-run checks found zero changed inputs in either frozen product graph (`matched-source-equivalence.json`). The repeated accepted library was 78,307,585 encoded bytes, SHA `d14b25115bbfbc29ac1f3e93e5e9d9eb3190ad8e05b016eb530357a9ad48cc60`; P13 was 78,991,513 bytes, SHA `62b7145d65b2c49fd55ec38f691e6fe24bb9e682cff49018f44c1c246daca78b`. Within each run every sample reset exactly to its fixed bytes; fresh storage UUIDs distinguish the two separately prepared libraries.

The initial accepted run remains intact in `p12/`: Save p95 **7,735.418 ms**, load-ready p95 **15,580.372 ms**. It overlapped the original P13 generator and native task activity; it is not silently replaced or treated as uncontended. The fresh quiet comparison above resolves that ambiguity. The failed P13 setup, unexecuted pre-native-review preparations, earlier frozen generations and their exact equality proofs also remain separate.

The complete matched data and arithmetic are in `performance-summary.json`. Primary raw paths, all relative to `artifacts/p13a/performance/`:

- `p12-quiet/store-report.json` and `p12-quiet/performance-store-binding.json` — accepted quiet control, all samples and source inputs.
- `p13-final/store-report.json` and `p13-final/performance-store-binding.json` — P13 quiet run, all samples and source inputs.
- `matched-source-equivalence.json` and both `measurement-window.json` files — unchanged input hashes, quiet-window lineage and stop disposition.
- `p12/generation-report.json`, `p13/generation-report.json` and their generator bindings — completed actual endurance runs.
- `migration-report.json` and `performance-migration-binding.json` — completed single-save V19→V20 measurement.
- `p09-history-reuse-correction.json`, `research-precision-source-refresh.json` and `p13-before-correction/generation-report-incomplete.json` — exact correction evidence and the original incomplete run.
- `p13/store-report.json`, `p13-gate-preflight/preflight-report.json` and their bindings — failed pre-sampling attempt and successful functional-only preflight.
- `library32-preparation-disposition.json` and `stop-disposition.json` — explicitly unexecuted 32-record preparations and the Current Ops stop.
- `r4-observed-production-worker-binding.json` — separately observed packaged r4 worker/engine, not measured transport.

No protected ref was merged or promoted by this work. No Howard campaign was opened, hashed or altered. The completed single-save migration and 6,240-week generation remain evidence; 32-record recovery and acceptance remain unfinished under the explicit stop.
