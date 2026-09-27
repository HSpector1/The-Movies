# 1101-B — Independent B artifact review

Status: **KEEP — closed B recording and repeat-authority evidence independently reviewed.** The provisional observations below are preserved as historical observations. This disposition qualifies the bounded B evidence described in the final appendix; it does not qualify C, D, C.3, the full suite, or native integration.

Ownership: independent reviewer; data-only file/JSON/hash reads, with no project imports, producer execution, gameplay, compiler, tests, source edits or additional process in the heavy lane. Parent owns recorder 1065 and the frozen source. B uses published `1f4b8429fef335e1fb25bede0b5d2c6014901ba8`, the reviewed revised producer `909e822e1847dc6752eb1af6b56c0ebb8e5e338127e99476709454c9de2d2eba`, and `1052-c3-endurance-B-recording-v1`; completed A remains its exact baseline and predecessor.

## Interim observation

A read of the completed checkpoint JSONL prefix found **59 rows, weeks 0–3016 inclusive**, each with the exact complete-save identity and all root identities recorded by A at that same week. No mismatch was found in those fields. This compares completed rows only: it neither predicts later weeks nor treats a growing file as a closed artifact. Final source guards, complete artifact inventory, full retained authority bytes, command trace, failure status and recorder closure remain to be checked.

The subsequently completed **week-3120 authority** was independently read as raw bytes and JSON. Its **3,644,208 bytes**, SHA256 `5fea7fc04ef6a16a636f376fcc4791f75f77926ead08ae0b598e566db9091050`, are literally byte-equal to A's retained week-3120 authority. The checkpoint's complete-save identity agrees; independent canonical serialization of each of the **40 state roots** agrees with all 40 recorded byte counts and hashes. The retained state's actual market week is 3120. This midpoint observation remains provisional for the overall run.

## Final review requirements

1. Read the actual closed 1065 record and metadata; require declared source/producer/codec/provenance identities, full tick/command counts, null failures and unchanged source guards. Preserve any first failure rather than inferring success from reached week 6240.
2. Independently hash every inventoried file and account for the complete directory, excluding metadata only where the manifest explicitly does so. Retain original physical encoded bytes as the evidence identities.
3. Decode observation definitions/references with an independent data-only parser. Check canonical complete rows, sequential definitions, immediate references, no unknown/duplicate/stranded definitions, and bounded physical/dictionary sizes. Do not import the prepared codec to establish its own correctness.
4. Compare all 121 attained checkpoint save/root identities against A; independently reconstruct and hash full retained 0/3120/6240 authority, and compare complete bytes and roots. Compare command identities, outcomes and applicable semantic observations while retaining measured timing separately.
5. B does not acquire A's three runtime samples by running its read schedule. Any runtime evidence remains explicitly A's; compare the actual variant's schedule against its frozen contract.
6. Preserve original A's failed observer attempt, both R8 Vitest timeout failures, canonical098's failed passive new-Writer employment/work premise, designated/inherited failures and pending full matched qualification. Funded authored-focus endurance cannot replace those claims.

At the time of the interim observations, final disposition was pending actual closure and independent artifact checks. The following closed-record review resolves that pending disposition.

## Closed 1065 result and independent inventory

Recorder `1065-c3-endurance-b-recording-v1.json` closed **PASS**, child 0, `fixedSource: true`, from **2026-09-27 03:51:04.721Z to 04:20:48.228Z** (29m43.507s wrapper). Both source guards name `1f4b8429fef335e1fb25bede0b5d2c6014901ba8`, the empty consumed diff and no untracked consumed source. The final raw completion marker reports null failure, guard failure and artifact failure. Metadata and `failure.json` separately report PASS with null failures.

The actual run completed **6,240 attempts and 6,240 ticks**, **1,072 commands and engine calls**, six creators, 122 commissions, 122 greenlights, 122 releases, 19 set commands, 75 attachments and **121 read groups**. It ran **zero runtime samples**, as B requires. The actual directory contains exactly seven files, totalling **16,330,598 bytes**; every one of the six manifest entries was independently rehashed, with metadata separately hashed and no extra directory entries.

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| `metadata.json` | 1,129,812 | `38ad11c77215118970dfcc9cf7d3e7424ac6b205733779adbf8648b2e8db5383` |
| `authority-3120.json` | 3,644,208 | `5fea7fc04ef6a16a636f376fcc4791f75f77926ead08ae0b598e566db9091050` |
| `authority-6240.json` | 6,720,108 | `c9bfb1428cf27dad13c26b6f135f3cd3ee00b9303c45076e97abecb357c8aab1` |
| `checkpoints.jsonl` | 1,199,770 | `ab463214ffdc687e540654cf33688a2e600c4369b4708aee9a7f3ad5f424da62` |
| `commands.jsonl` | 352,954 | `4908483026e793bec8d98e8a9472ed187a4501c2c41c15bc704e7d69026cbff6` |
| `observations.jsonl` | 3,283,432 | `712372488be85c51587aec7ff59e88b023691c994acc62727b5c2c68bf0463f7` |
| `failure.json` | 314 | `f54f5e1d2f903f6a1e801e6750e1309973b80662415b46e778de445d8b140efb` |

Independent source/data hashing agrees with the recorded revised producer `909e822e…`, codec `b5c2489b…`, provenance `47e05786…`, original producer `f7d19d39…` and exact completed A metadata `3762178b…`. The recorded lineage is `c3-observations-focus-dictionary-v1`, with the reviewed eight-hunk reverse reconstruction and unchanged 43,293-byte Endurance class `3c356493…`. No original B/C compatibility exception was introduced. The actual source tracked-identity digest agrees with A; only the published HEAD differs.

## Independent lossless decoding and authority comparison

A separate data-only JSON parser, without importing or executing the prepared codec, checked physical canonical complete lines, sequential unique definitions, immediate first use, known references, no duplicate or stranded definitions, allowed boundary roots and bounded physical/dictionary sizes. It found **121 definitions**, **591,151 dictionary bytes** and reconstructed **9,158 logical rows** into **12,987,030 bytes**, SHA256 `8624b9679e9638addbb3a1a3ea2f2b0e763ba92efafbfb14aed1726d49ef97f3`.

The decoded kinds are 6,240 tick timings, 2,090 lifecycle boundaries, 365 other timings, 122 releases, 121 read observations, 120 cohort observations and 100 people-append observations. B intentionally replays A's actual command trace; it does not recalculate A/C policy promise-feasibility observations and does not run A's runtime samples. These expected variant differences explain why the decoded whole observation file is not claimed byte-identical to A.

All **1,072 command rows** match A in every recorded field except measured `elapsedMs`. Ordinals are complete, all outcomes are accepted with null reasons and actual engine invocation, timings are finite/nonnegative, and no week exceeds the 16-command bound. All **121 checkpoints**, at exactly weeks 0, 52, …, 6240, match A's complete-save identity, all **40 root identities**, counts and focus facts. The full retained raw authorities at weeks **0, 3120 and 6240** are literally equal to A. Their actual market weeks, canonical complete bytes and independently reconstructed identities of all 40 roots agree with the corresponding checkpoint records. Week 0 is the 430,333-byte metadata checkpoint, SHA256 `597997206fa098ec8664e58b797db30dee30ccd2063cdce371762f5c4159e614`.

All 2,090 lifecycle-boundary rows, 122 release rows, 120 cohort rows and 100 people-append rows match A semantically and completely. The 6,240 tick rows form consecutive `i → i+1` transitions with the expected returned week; all non-timing fields, including pre-tick root identities, match A. The initial generated/funded-state and funding-ledger facts also agree. This is a funded stress scenario with an initial 2B endowment and no later funding; it is not a campaign-affordability result.

## Read scope, purity and comparison limits

Every read group reports PASS, null failure, the expected week and exact equality of input and post-read complete-authority identities. The group counts, row/page metadata, selected identities, schema-check counts and privacy-check counts match A. Independent inspection found **242 snapshots, 121 people reads, 121 Calendars, 1,838 Industry calls, 480 Market calls and 480 checked profiles**, with 3,040 schema checks and 1,153 privacy checks. The largest group records 24 projection calls, 16 Industry calls and four Market calls, within the frozen bounds. All sampled page lengths fit their declared page sizes; repeated Industry calls within the same group have exact raw identities. All recorded inspection timings are finite and nonnegative.

The **722 direct people/Calendar/Market response hashes** match A exactly. The other 2,080 calls are fresh-session Industry envelopes or snapshots. Their raw identities remain preserved: `BridgeSession.fromSaveJson` allocates a fresh session ID (`bridge/session.ts:1371`), which the Industry query/response carries (`bridge/testing/c3-active-endurance-observer.ts:136`, `bridge/schema/industry-schema.ts:157`); snapshots additionally measure `serializationMs`. Consequently this review does not falsely equate those cross-run envelopes or infer unrecorded normalized response bytes from their hashes. Industry envelope sizes and all recorded page/result metadata agree across runs. The frozen observer's within-session repeat, schema, privacy and complete-state purity assertions passed in every actual group.

The observed B tick median/p95/p99/max were approximately **14.018/28.482/34.498/365.706 ms**; these are observations from this run, not a latency guarantee or a benchmark comparison with A. Persistence evidence remains A's three attained-scale zero-tick store/coordinator samples. B adds no century-long journal, disk, native or Owner-library claim.

## Final disposition

**KEEP.** Closed B satisfies its reviewed command-replay, 121-checkpoint authority-equivalence, read-purity, bounded recording and immutable-lineage obligations. C and D remain unexecuted and unqualified by this review. The original failed A observer attempt, both R8 Vitest timeouts, canonical098 passive new-Writer employment/work failure, unresolved B5 pin attribution and the pending matched full core/UI qualification remain distinct evidence and are not erased by this result.
