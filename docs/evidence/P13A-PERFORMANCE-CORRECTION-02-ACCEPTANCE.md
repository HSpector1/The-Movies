# P13A performance correction 02 — fresh matched acceptance

All four performance gates in `OPS-P13A-PERFORMANCE-CORRECTION-20260911-02` pass on the first fresh matched pair: complete Save and load-ready median and empirical p95 each remain within 5% of the fresh accepted control. This permits the ordered final checks to resume; it does not constitute final product acceptance. No confirmation or additional benchmark run was performed.

The accepted control is exact `592e926bfbf4574df94b38fc8dd594fc5df2ac8d` in `/Users/bruce/The Movies - P13A Accepted Baseline TS`, branch `wip/p13a-performance-baseline-01`. Corrected P13 is clean `2ac73da2cd4c7a71ea54407c76a20e0a4c75cf60` in `/Users/bruce/The Movies - P13A Synchronized Sound TS`, branch `wip/p13a-synchronized-sound-01-ts`. The sole runtime correction is ancestor `50460f3aa14f77cfe38be15ed9d991cf983cfa92`: a local studio/film membership index within each technology validation invocation. The diagnostic cause, unchanged validation counts and exact component reductions are recorded in `P13A-PERFORMANCE-CORRECTION-02-DIAGNOSIS.md`.

| Phase | Statistic | Fresh accepted ms | Corrected P13 ms | Change |
| --- | --- | ---: | ---: | ---: |
| Complete Save | Median | 7,112.991 | 7,341.145 | +3.2076% — pass |
| Complete Save | p95 | 7,414.568 | 7,445.594 | +0.4185% — pass |
| Complete Save | Maximum | 7,791.659 | 7,460.085 | −4.2555% |
| Complete Save | Minimum | 7,000.781 | 7,263.992 | +3.7597% |
| Load-ready | Median | 14,385.557 | 14,817.094 | +2.9998% — pass |
| Load-ready | p95 | 14,958.267 | 15,044.235 | +0.5747% — pass |
| Load-ready | Maximum | 15,004.195 | 15,145.679 | +0.9430% |
| Load-ready | Minimum | 14,133.713 | 14,660.077 | +3.7242% |

Each source ran three excluded warmups and 20 measured pairs, sequentially accepted then corrected. Accepted ran **2026-09-11 19:20:25.538–19:29:29.485 UTC**; corrected P13 ran **19:29:42.241–19:39:00.708 UTC**. Both processes exited zero, reports completed, errors were empty and store locks were absent. Independent calculation from all raw samples confirms the report medians, nearest-rank p95 (sorted sample 19 of 20), minima and maxima. Every observation is retained, including the accepted control's 7,791.659 ms Save maximum. No outlier exclusion, rerun, forced garbage collection or cache clearing occurred.

This was a coordinated team-quiet sequential window: team builds, tests, native players and other heavy jobs were paused. Ordinary OS background activity was uncontrolled, and the run does not claim exclusive CPU use. Hardware was Apple M3 Max, 16 logical CPUs, 128 GiB RAM, Darwin 25.6.0 arm64; Node v26.3.1, default heap, empty `execArgv`, no `NODE_OPTIONS`. The fresh accepted control is slower than the prior accepted quiet control (prior Save median/p95 6,695.293/6,736.149 ms; load 13,456.145/13,532.035 ms). Both controls and all raw observations remain visible. The authorized fresh control governs this pair; the shift is not treated as a product improvement or evidence of an exclusively controlled machine.

The common sampler source is unchanged from the stopped pair: `scripts/p13a/performance-store.mjs`, SHA-256 `4e0f8303eb6890f854fb5c20fb7030dfdab8ca73ff63cd86a67f8f2479b8607a`. The fresh accepted emitted bundle remains byte-identical to its prior control: `39268856cf4cc370efca319fe05363b057d85a01c18f6bb2d4d8a394a3846581`, 1,535,759 bytes and 106 source inputs. Corrected P13 is `5ac3bd89845c5ea23d38f90d772165cc501583a265bbde753f09e8758ac87ed8`, 1,640,316 bytes and 113 source inputs. All source hashes and both bundles were checked before and after execution. Only `src/core/technology.ts` differs between the stopped and corrected P13 sampler source graphs; no diagnostic instrumentation is present in either acceptance bundle.

The inputs are retained actual generated week-6,240 worlds, copied without alteration: accepted 47,825,995 bytes/SHA `2a8fa601d2aabda77a7b4f067a511690bebf34804c9ea7c61fb0086399b3ef71`; P13 48,984,542 bytes/SHA `87de16446ade6ee5610262c79a81fcde330dfb4902295276faaecfbe72c7632b`. P13 includes completed research, operational adoption and production technology history. Each run creates its three records through actual Save As commands and resets the exact resulting encoded library bytes before every warmup and measured pair. Exact active state digest, week, catalogue revision and inactive campaign metadata/revisions were checked on every pair. Fresh encoded seeds differ from earlier libraries because the records were created anew; the per-run reset bytes and source world identities are bound in the raw reports.

Load-ready includes store ownership acquisition, coordinator recovery and the first production snapshot. Complete Save begins at the production coordinator campaign command and ends at its accepted durable response, including strict proposal/fork validation, compression/encoding and atomic durable writing. It excludes prior catalogue reading and later verification. Both are standalone private-process boundaries: HTTP, worker startup/message transport, Unity input, native responsiveness and cold-cache behavior remain outside the claim. No validation, permanent history, physical receipts or ownership checks were removed. All original P12 qualifications, misses and unmeasured stress cases recorded in `P13A-PERFORMANCE-EVIDENCE.md` remain binding, including the retained 9,577.754 ms reference, original 8 MB state target miss and outstanding engine-main/worker transport qualification. Passing this bounded empirical gate does not establish a population percentile or a constant per-studio storage cost.

Raw evidence is under `artifacts/p13a/performance-correction-02/acceptance/`:

- `paired-comparison.json`: exact deltas, four gate results, times, source identities and raw-report hashes.
- `source-equivalence.json`: complete input hashes and the single changed P13 runtime input.
- `accepted/store-report.json`, SHA `353c7b79d2fe0a2d72438fb470fdf2a9d86c1d96c2f94c185c32f91ff82f246a`.
- `corrected-p13/store-report.json`, SHA `0a17dd9dd93dbe03e9246bb8adecbcb92ea54557f4215a3a2f60105976a82dd2`.
- The adjacent `performance-store-binding.json`, frozen bundles, generated inputs, reset libraries and logs retain the full reproduction evidence.
- `original-evidence-integrity.json`: all 20 files in the stopped review manifest verified unchanged after the new pair, including prior failure, controls, migration, generation and unexecuted 32-record preparation evidence.

The timing window ended with no running sampler or held lock. Latest native compilation/tests and the subsequent actual 32-record recovery remain separate ordered checks; neither is claimed by these measurements.
