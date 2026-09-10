The original250ms provisional target applies to **asynchronous durable write/persistence end-to-end**, not explicitly to complete campaign Save. My previous categorical “complete Save MISS250ms” wording was an overbroad phase interpretation and is withdrawn. The previous report and all raw measurements are preserved; this addendum controls that attribution.

The pinned authority is consistent when read together:

- Builder Annex §Q, line818 at design pin `a0739055c30f80fcf756340d0e0e962865aec6a4`: “asynchronous persistence end-to-end p95 ≤250 ms at full target.” That paragraph separately requires timing canonical serialize, digest, strict validate/import, load-to-ready and durable write.
- Companion Design §34, line990 at the same pin names the row **“Asynchronous durable write, end-to-end”**, with the250ms target. Lines988–989 give separate canonical serialize+digest and strict validate/import limits. Line994 again requires measuring serialize/validate/load/write separately.
- Original register PERF-008 separately names serialize/digest/validate/load/write. PERF-009 says “serialize/digest, validate, and write p95 limits from ANN §Q.” Neither row assigns250ms to the complete later campaign transaction.

| Measured phase | Observed p95 | Correct disposition |
| --- | ---: | --- |
| Production writeAtomic, already-encoded library | 53.564 ms | Below250ms within this measured durable-write boundary |
| Complete production campaign Save | 9,577.754 ms | Disclosed total reference cost; no categorical original250ms PASS/MISS assignment |
| Complete library load to ready | 13,414.888 ms | Separately measured recovery cost |
| Write-only worker handoff/queue through durable acknowledgement | Not separately isolated | Do not invent a transport percentile from the component or whole-operation timings |

The write sample includes production ownership checks, UTF8 conversion/validation, file write/fsync, atomic replacement, directory fsync, cleanup and writeAtomic Promise completion. Serialization, checkpoint preparation, compression and worker transport are outside that phase; opening/ownership acquisition is also outside the measured write call. This is production storage evidence, not a synthetic write substitute, but it does not establish an independently timed worker-message boundary. Existing emitted tests independently establish worker placement and complete HTTP operation observations.

The complete Save remains a material9.578s p95 reference latency and retains the measured47.51% reduction from its control. The sources do not explicitly define the later campaign proposal/fork/history/codec/transaction boundary as the250ms target. No measurement is being changed, and no broad performance pass is awarded.

True original misses remain: full serialize+digest199.524ms versus100ms, Hollywood field delta37,829,874bytes versus8MB, and mean film3146.433bytes versus1.5KB. Pure strict import remains within its500ms scope. Future12/48/4000/50 stress remains unmeasured. The50ms synchronous engine-main storage prohibition and strict/history/retry/algorithm obligations remain unchanged. The bounded repeated accepted-checkpoint preparation closure still rests on independent reviewed sources, tests/counters and fresh current-byte evidence.

Suggested current register wording: “Original250ms limit applies to asynchronous durable write/persistence. Current production writeAtomic p95 53.564ms (3 warmups+n20) is below250ms for already-encoded storage including durable commit/cleanup; write-only worker transport was not separately isolated. Complete campaign Save p95 9,577.754ms and library load-ready13,414.888ms remain separate measured reference costs.”

Exact pinned excerpts, source blob hashes and preserved report hashes are in `durable-write-target-addendum.json`. No workloads, shared edits or native operations occurred during this check.
