# 1114-B — Independent corrected D artifact review

**KEEP.** Closed run 1085 qualifies the declared D continuous replay/read-stress variant through week 6,240. Its complete command trace, all checkpoint/save/root identities, retained raw authority, 600 read groups, source/reference pins and lossless recording pass independent data-only review. The recoverable D checkpoint and already reviewed post-D maintenance may proceed. This is not final C.3 regression qualification or an all-green suite claim.

This review used standard-library JSON, byte/hash parsing and read-only Git inventory inspection. No project module, producer, verifier, compiler, test, gameplay or extra trajectory was invoked. Only this review document was written. Parent 1114-A owns execution/publication. Historical A/B and both original failed C and corrected C remain unchanged.

## Actual closure and source authority

`1085-c3-endurance-d-force-order-v1.json` records 2026-09-27 05:57:39.652–07:55:49.437 UTC, **7,089.785 seconds**, child 0, no signal/error and `fixedSource:true`, on `c1a6654a859e528bd719cd39c62d850a51f59eee`. Both recorded consumed diffs are empty; both untracked-source lists are empty. The 1,194-byte recorder hashes to `8f16ebb0f0b1407349bd5ccfb219163808be225cf7b4744063bfce126c3c74e9`.

The raw log is 18,018 bytes / `0d861647b04d78845d8ac8141a1ffbdaf06e50a5e0c41cfbd9bfd328bded8c67`. It contains exactly 121 boundary-qualified markers at 0,52,…,6240 and one completed marker. Final failure, guard failure and artifact failure are null. Metadata measures 7,083,144.153098 ms; the later completed marker measures 7,083,163.053014 ms. These distinct observed scopes are retained, not conflated with recorder duration or a latency requirement.

Independently rehashed all **1,661** current consumed files against the complete corrected-source manifest, including each actual file's bytes/SHA-256 and Git object. The actual index path/mode/object list equals that manifest and the recorded 157,480-byte identity `7c48ac7a48da588183cba0b971ef09fa087482d7cdbcce473976115aa20fa179`. Current HEAD, empty consumed diff and no untracked consumed files match the recorder. All ten separately pinned dependencies also match their actual bytes.

The producer is 70,857 bytes / `eaeb7c077e4dfeff1398e4cc5f22cb484db82d18848950dc836d05187819588e`; correction proof is 1,061,030 bytes / `ae8a5d0be192bd3373a993345b69785d49013b7bd57139934786a9fe794c9453`; lineage helper is 15,616 bytes / `fa0c9d95fb22228c9df0b24e47888c560641eca10b8ad64060661b3456fef1aa`. The codec remains 11,491 bytes / `b5c2489bbdefc26242cbd6a98aa450d98cc99407a196d7ef608a0d14e3845187`. D and corrected C have identical consumed source, producer, correction and recording lineage; their separately frozen actual HEADs differ only as permitted by the checkpoint protocol.

Rehashed the full eligible reference inventories with no missing/extra file: original A has ten files totaling 40,480,386 bytes and metadata `3762178bb4a542b5f10014a55c78fead6bbfbbf2e4cecd70659cb69becc6163d`; original B has seven files totaling 16,330,598 bytes and metadata `38ad11c77215118970dfcc9cf7d3e7424ac6b205733779adbf8648b2e8db5383`; corrected C has seven files totaling 16,420,685 bytes and metadata `3780adbdb8a9321c0093a1cb8a4f20d6d5f332970410f900a96dd6e4df982a2c`. A is D's exact historical baseline; corrected C is its actual predecessor. No failed run was substituted or restamped.

## Exact complete D inventory

Exclusive output: `1052-c3-endurance-D-force-order-v1`. All seven actual regular files total **21,202,513 bytes**. Every pre-metadata file matches the recorded inventory; metadata itself was independently hashed. There is no extra file, symlink, runtime directory or failure-authority save.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| authority-3120.json | 3,644,208 | `5fea7fc04ef6a16a636f376fcc4791f75f77926ead08ae0b598e566db9091050` |
| authority-6240.json | 6,720,108 | `c9bfb1428cf27dad13c26b6f135f3cd3ee00b9303c45076e97abecb357c8aab1` |
| checkpoints.jsonl | 1,199,770 | `e9a9576e968902310e335a689607d86d71add918c0c888ff54c82430d5df6c04` |
| commands.jsonl | 352,979 | `f406c54aaa4e82e534687b0c58c73d58af524ef7e47a34a6d91c2aecfe431a85` |
| failure.json | 314 | `427cd26d78925724101f2626fefa9db17aa2c69836124fbf2f9ac941a518d52e` |
| observations.jsonl | 8,149,365 | `579943ea8c400af8b48561f5c0cbcf21a3d9417fbf41f74bbff6b451b5563dd0` |
| metadata.json | 1,135,769 | `a34c2f07f084cd68cb627dfe83c007ddb1eed9d685a822d0d41d2f4f4c3d5384` |

Every physical compact file remains below 16 MiB, each authority below 256 MiB, and the directory below 1 GiB and ten files. The total directory is not subject to the per-compact-file cap.

## Complete replay and authority comparison

All **1,072 command rows** match original A and corrected C after excluding only measured `elapsedMs`. Week, ordinal, purpose, complete command, status, reason and engine-invoked flag are exact. Every command is ACCEPTED with null reason and one engine invocation; the busiest week has 16 commands, exactly the declared maximum. No command was removed, delayed or replaced.

All **121 checkpoint value trees**, excluding only measured `rss`/`maxRSS`, equal original A and corrected C. This includes each complete canonical save SHA/byte count and **all 4,840 identities for the exact 40 state roots**, plus full recorded counts and focus facts. The generated/funded initial strings and all 122 activity-slot records also match exactly.

The initial checkpoint is literally the same 430,333 bytes / `597997206fa098ec8664e58b797db30dee30ccd2063cdce371762f5c4159e614`. Both retained raw files at 3,120 and 6,240 are literally equal across A/C/D. Independently parsed and rehashed all 40 roots of these three retained saves using their actual JSON values, matching their checkpoint records. Other boundaries retain full-save/root identities, not 121 raw save files. No differing gameplay field, floating-point result or history entry was normalized away.

All 6,240 tick records show consecutive from/to/returned weeks. Their recorded pre-tick counts equal A; those counts are not full per-tick state hashes. Every release, cohort, new-person append and decoded lifecycle-boundary record equals A. D uses the already qualified exact A command replay, so it does not rerun policy feasibility queries or claim newly derived command decisions. The absence of A's 76 policy feasibility observation rows in D is the declared replay behavior, not lost codec records. D has no cadence import replacements and no runtime samples; corrected C and original A retain those distinct proofs.

## Lossless recording and actual read schedule

An independent standard-library decoder consumed **10,716 physical lines** and reconstructed **10,595 logical rows / 17,852,963 bytes**, SHA-256 `b9d79ab3dc4bfd01b62b915527746936a3a03a2a9e1787ee724a913c9917d586`. It checked exact JSONL representation, dictionary key shape/order, sequential unique definitions, distinct values, immediate first use, backward references and no stranded definition. There are **121 definitions / 591,151 dictionary bytes**. Logical counts are:

- 6,240 tick timings, 2,090 lifecycle-boundary records, 122 releases, 120 cohort records and 100 people-append records;
- 600 read groups and 1,323 generic save/inspection timings.

The decoded size exceeds 16 MiB, while the actual recorded file is 8,149,365 bytes. This is precisely the reviewed lossless physical-recording amendment: no logical row was dropped and the unchanged physical/dictionary caps pass. The reconstructed bytes were checked in memory; no second output file was created.

The **600** actual read groups comprise exactly **481 regular weeks 0,13,…,6240** and **119 first-decision weeks**, with no overlap or duplicate read week in this attained trajectory. Every decision week belongs to one distinct 52-week block; block 3 is the sole block without one. These weeks also equal the earliest recorded actual `decision-*` command week in each represented block, and each has an actual script-review command. This independently corroborates the recorded schedule without executing `nextStudioDecision` against reconstructed states. The frozen driver performs that real pre-command decision check and coalesces an already-read week (`1108` producer:670–687, :753–777). No unobserved decision week is invented.

Generic timing records independently reconcile to 600 authoritative after-read checks, 481 scheduled boundaries, 121 independent full-save/root hashes, 119 decision-read inputs and the two initial generated/funded measurements. No cadence-export or import phase occurs in D. The final read count is below the unchanged 601-group cap.

## Read purity, privacy and bounded paging

All **600 groups** report PASS with null failure and exact equality between the full input and isolated-after save identities. At all 121 checkpoint weeks, the read input also equals the independently compared checkpoint save. Each group contains exactly one public discovery measurement, its actual post-discovery full-byte check, all four post-group full-byte checks and the final isolated full-byte check. The driver additionally records its authoritative after-read save comparison. All recorded inspection times are finite and nonnegative.

Independent checks counted **13,901 public read calls, 15,082 schema checks and 5,634 privacy checks**. The recorded maxima are 16 Industry calls, four Market calls, four checked profiles, 24 read records and 33 timings per group; the largest result is 10,180 bytes, below 256 KiB. There are exactly two snapshots, one people discovery and one Calendar call per group. Industry pages use 25 rows; Market pages use their actual 20/10 bounds. Every retained page count equals the ceiling of total rows divided by page size, and no sampled page exceeds its bound.

All **2,400 repeated Industry query pairs** have exact within-session response identities. Public people discovery comes first in every group; the remaining group order alternates exactly by read ordinal, with snapshots first on even ordinals and Market first on odd ordinals. The source-pinned observer retains the schema, explicit private-field and 13-week career-event checks before reporting PASS.

Raw snapshot identities are preserved. The qualified observer validates finite nonnegative `serializationMs` and compares every other repeated-snapshot field, including `payloadBytes`; only that measured time is excluded. This review does not claim complete cross-run response-envelope equality, nor independent inspection of unretained raw DTO bodies. It checks the retained identities/counts and the unchanged source of the successful assertions. Fresh session IDs, query order and actual timing remain legitimate response differences; complete game authority remains exact.

## Attained counts, measured cost and limits

Actual counters are 6,240 attempted/completed ticks; 1,072 commands/engine calls; six creators; 122 commissions, greenlights and releases; 19 set-maintenance commands; 75 promise attachments; 600 reads; zero runtime-store samples. The same single initial 2-billion endowment remains explicit, with no later funding. This is a funded active stress scenario, not normal campaign economics or profitability evidence.

Final authority has 325 people/anchors, 120 cohorts, 242 profession-retirement records, two profession changes, 1,556 transition evaluations, 228 industry retirements and 11 future due entries; 122 player releases, 28 Hollywood films, 252 employment intervals, 142 first takes and 109 promise roots. These values equal A/C. The same actual focus transitions, subsequent work and second-profession finality remain retained; they do not replace the separate canonical passive Writer-work route.

Recomputed all tick-only nearest-rank percentiles from the 6,240 actual timings: median 13.900319000240415 ms, p95 28.030987000092864 ms, p99 35.45978500042111 ms, maximum 233.98676500000147 ms at invocation 2. Recorded peak sampled RSS 747,520,000 bytes and process maxRSS 897,604 KiB equal the maxima in checkpoint observations. These environment-specific values are not end-to-end read/import/save latency, performance guarantees or evidence of an unstated scale envelope.

**Final disposition: KEEP for D1085 under the explicit mixed-source A/B/C/D protocol.** Original A/B remain historical-source qualifications; failed original C remains failed; corrected C/D use the narrowly proved force-order source and preserve exact A authority. Only A's three bounded actual store samples establish that separate persistence scope; neither C nor D claims a full-century durable journal, default journal exhaustion or new disk/native behavior. Canonical098 Writer-work failed premises and original R8 Vitest timeouts stay visible. Final staged maintenance, paired regressions, full current core/UI gates and matched first-cause attribution remain required before C.3 closure. Parent 1114-A's recorded durations, identities and limits were cross-checked with no correction required.
