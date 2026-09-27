# 1111-B — Independent corrected C artifact review

**KEEP.** Closed run 1084 qualifies the declared corrected C cadence variant through week 6,240 against the immutable original A. Its complete artifacts, reference inputs, source identity, recording lineage and actual reload/read records pass independent data-only review. D may proceed under the already reviewed 1108 protocol after the recoverable checkpoint; this is not D's result, general C.3 closure or an all-green suite claim.

The reviewer used file reads, standard-library JSON/byte/hash parsing and read-only Git inventory inspection. No project module, producer, verifier, compiler, test, gameplay or additional trajectory was invoked. Parent 1111-A owns the execution result/publication. Original A/B and the failed original C remain unchanged.

## Actual closure and source

`1084-c3-endurance-c-force-order-v1.json` records 2026-09-27 05:16:56.011–05:48:29.029 UTC, 1,893.018 seconds, child 0, no signal/error, `fixedSource:true`, on `81a96b7a53330ed1335fa54daf6bacc750d572a9`. Start/end consumed diff is empty and untracked consumed lists are empty. The 1,192-byte recorder hashes to `490b19c978f35ec9cca5d125f0ffa022dbca413c7da9e13bce78b905d920ba50`. The 17,930-byte raw log hashes to `dc277405b0421a81ed1485ec7fff2c08dab2f7fb977e5e8deee5e59385f8d510`; it contains exactly 121 boundary-qualified markers at 0,52,…,6240 and one completed marker. Failure, guard failure and artifact failure are null.

Independently rehashed all 1,661 current consumed files and compared their complete path/mode/Git-object/byte identities against `1108-c3-lineage-provenance.json`. The actual Git index list is 157,480 bytes / `7c48ac7a48da588183cba0b971ef09fa087482d7cdbcce473976115aa20fa179`; current HEAD, empty diff and no untracked consumed files also match the run. All ten explicit dependencies, including the original 1052 producer, recording codec/proof/verifier, force-order preservation capture/patch and new lineage helper/compiler/verifier, retain their frozen identities.

The running producer is exactly 70,857 bytes / `eaeb7c077e4dfeff1398e4cc5f22cb484db82d18848950dc836d05187819588e`; the correction proof is 1,061,030 bytes / `ae8a5d0be192bd3373a993345b69785d49013b7bd57139934786a9fe794c9453`. This is the explicitly mixed-source qualification reviewed in 1108-B/C: historical A/B use the old complete inventory; corrected C uses only the four qualified force-order production changes plus the independently pinned test. The complete Endurance policy remains the reviewed 43,293-byte segment `3c356493a0515e88a75ca945d0ed2d0b0daed1a4b2414aeee811a531fc96ae8d`. This report does not describe these runs as identical source.

The exact original A metadata remains 1,129,358 bytes / `3762178bb4a542b5f10014a55c78fead6bbfbbf2e4cecd70659cb69becc6163d`; its complete 10-file inventory totals 40,480,386 bytes. Original B metadata remains 1,129,812 bytes / `38ad11c77215118970dfcc9cf7d3e7424ac6b205733779adbf8648b2e8db5383`; its seven-file inventory totals 16,330,598 bytes. Every listed artifact was rehashed, with no extra/missing file. Their source and producer records match the fixed proof; neither reference was restamped.

## Complete corrected C inventory

Output: `1052-c3-endurance-C-force-order-v1`. All seven regular files, totaling **16,420,685 bytes**, were checked against metadata and the directory; no runtime directory, symlink, failure-authority file or undeclared file exists. Metadata is independently hashed because its inventory intentionally precedes its own final write.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| authority-3120.json | 3,644,208 | `5fea7fc04ef6a16a636f376fcc4791f75f77926ead08ae0b598e566db9091050` |
| authority-6240.json | 6,720,108 | `c9bfb1428cf27dad13c26b6f135f3cd3ee00b9303c45076e97abecb357c8aab1` |
| checkpoints.jsonl | 1,199,770 | `bf2f66e7308ed34e2ad959c3ac68aa3204e811becaec1c4cacc16d601c4f9bed` |
| commands.jsonl | 352,985 | `17e54238a78fbea30696e65bca320f71f1525c66167fcc412a14b4751ad1cded` |
| failure.json | 314 | `f54f5e1d2f903f6a1e801e6750e1309973b80662415b46e778de445d8b140efb` |
| observations.jsonl | 3,370,207 | `0c5836d4b69e6beb4144bfc929a0ec1e1de17046032a85218d85d84dde968b21` |
| metadata.json | 1,133,093 | `3780adbdb8a9321c0093a1cb8a4f20d6d5f332970410f900a96dd6e4df982a2c` |

Each compact file remains below 16 MiB, each authority below 256 MiB, and the directory below 1 GiB/10 files. These are separate limits: the total directory exceeding 16 MiB is not a compact-file overflow.

## Exact A comparison and actual cadence

Independently compared all **1,072 commands**, excluding only their measured `elapsedMs`; weeks, ordinals, purposes, complete commands, accepted outcomes, reasons and engine-invoked flags are exact A values. All are ACCEPTED, with null reasons and one actual engine call each. No trace row is omitted, postponed or substituted. The initial generated/funded bytes and the complete 122-slot activity records also match A.

All **121 complete canonical save identities**, all **4,840 individual identities for the exact 40 state roots**, boundary counts and complete recorded focus facts match A. Only process RSS fields are excluded from checkpoint comparison. Week 0's retained 430,333 bytes / `597997206fa098ec8664e58b797db30dee30ccd2063cdce371762f5c4159e614`, and both raw authority files at 3,120 and 6,240, are literally identical to A. The 40 roots were independently rehashed from each of these three retained saves. Other boundaries retain complete-save SHA/size and root identities, not 121 raw save files. No differing gameplay scalar or root was normalized away.

The observation log records exactly **280 actual import replacements** and their preceding exports: every week 1–104 (104), every 26 weeks from 130 through 3,120 (116), and every 52 weeks from 3,172 through 6,240 (60). The frozen `reload()` performs real `importSave`, current validation and exact canonical re-export before replacing state (`1108` producer lines 708–716); the actual schedule is at line 755. Both recorded phase-week lists match that exact schedule. C derives its policy anew after loading and checks the complete A command trace; it is not just a reused command replay labelled as save cadence.

All 6,240 tick records have consecutive from/to/returned weeks and exact A pre-tick recorded counts. These counts are not falsely described as complete per-tick root hashes. Every retained release, actual cohort, new-person append, decoded lifecycle-boundary and promise-feasibility record is also exact A data. The corrected run passes the former 1,352 detection point and the remaining century; the original C's first float-order divergence and failed run remain independently preserved.

## Recording and read purity

An independent standard-library decoder reconstructed **9,794 logical records / 13,068,789 bytes**, SHA-256 `f6a5f32b47581cc09269d73186a11bb008fef02a2ecc918f72820d5774b3c234`, from 9,916 physical lines. It checked exact JSONL representation, ordered unique definitions, immediate first use, known backward references and absence of stranded definitions. There are 122 definitions using 596,098 dictionary bytes. The lossless recording amendment discards no logical lifecycle row.

Logical counts are 925 timing records, 121 read groups, 6,240 tick timings, 122 releases, 120 cohort records, 100 people-append records, 2,090 lifecycle-boundary records and 76 feasibility records. C's extra cadence timings are expected; no runtime sample was performed by this variant.

All **121 read groups** report PASS/null failure, exact checkpoint input and identical complete isolated-after identity. Each has the actual public-discovery, four group-boundary and final full-save measurements required by the frozen observer. The authoritative driver then checks its own complete save again. Alternating query order, schema parsing, privacy controls and repeated-query checks remain in the pinned observer.

Independent record checks total **2,802 public read calls, 3,040 schema checks and 1,153 privacy checks**. Actual maxima are 16 Industry calls, four Market calls, 24 read records and 33 timings in a group, within every declared cap. All 484 repeated Industry query pairs have exact within-session response identities. The 722 recorded people/Calendar/Market identities also match A. The 1,838 Industry envelope hashes and 242 snapshot response hashes differ across runs and are not claimed to be equal: fresh session identity and actual snapshot serialization telemetry are part of those envelopes. The existing observer preserves both raw snapshot hashes, validates finite nonnegative serialization time and compares every other repeated-snapshot field, including payloadBytes; only that measured time is omitted from its equality predicate. Read shape, paging fields, counts and schema/privacy observations match A.

## Attained activity, cost and limits

Actual counters are 6,240 attempted/completed ticks; 1,072 commands/engine calls; six public creators; 122 commissions, greenlights and releases; 19 set-maintenance commands; 75 attachments; 121 read groups; zero runtime samples. Every fixed cap passes; the busiest command week reaches the permitted 16. This remains the explicitly funded generated scenario with a single initial 2-billion endowment and no later funding.

The final accepted state has 325 people/anchors, 120 cohorts, 242 profession-retirement records, two profession changes, 1,556 transition evaluations, 228 industry retirements and 11 future due entries; 122 player releases, 28 Hollywood films, 252 employment intervals, 142 first takes and 109 promise roots. Both authored focus people changed at 208, accumulated four real new-role work-history credits and reached their second-profession finality at 416. These are actual bounded scenario observations, not replacement evidence for the separate canonical passive Writer-work route.

Recomputed tick-only timings match metadata: median 12.347484 ms, p95 24.351025 ms, p99 31.412649 ms, maximum 267.523049 ms at invocation 5. Peak sampled RSS is 780,951,552 bytes; process maxRSS is 904,824 KiB. These environment-specific observations include neither a latency guarantee nor a conclusion that save/import/read costs equal tick-only timings.

**Final disposition: KEEP for corrected C1084 and its immutable original-A comparisons.** D's additional read cadence remains pending. No new full-century disk journal, native, Owner-library, profitability, full-suite-green or all-P14 completion claim follows. The original failed C, canonical K/L Writer-work failed premise and original R8 Vitest timeouts stay visible; A's three real persistence samples retain their narrower scope.
