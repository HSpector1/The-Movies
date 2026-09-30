# 1355-F2: parent ruling on the P15 domain sequence and phase identity (binds every P15 Wave 2 root)

Reviews 1355-B and 1356-B could not read the P15 builder annex, which exists only at commit 2a7ff0d9. The parent
exported it (`git show 2a7ff0d9:docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15-BUILDER-ANNEX.md`) with
the research disposition RECONCILIATION-02 (`git show c5b52b4d:docs/research/p15-independent-verification-01/RECONCILIATION-02.md`,
the SOURCE-INDEX pointer) and read the ordering law. Neither 1355-A nor 1356-A carries it. This ruling amends
[1355-F](1355-F-parent-p15a1-wave2-charter-adoption.md) and [1356-F](1356-F-parent-p15a2-wave2-charter-adoption.md) and
binds the P15B Wave 2 charter (1357-A) and the P15C Wave 2 charter.

## The annex law

- One allocator. "P15 allocates only `p15DomainSequence`" (annex E.7, line 459). G.1 (line 531): "next P15 domain
  sequence | Persist monotonic allocator state | append-stable P15 ordering; never reused or treated as global".
- Every P15 native row carries it: the market assessment (D.3, line 216), the ranking snapshot (D.4, line 243) and the
  condition event (D.5, line 270). The finale reads it as a high-watermark. L.6 invariant 10 (line 875): "Every P15
  event has one monotonic P15 domain sequence".
- Phase identity. G.1 (line 532): "scheduler phase ID/ordinal/version on each new P15 event | Persist immutable
  append-time facts | phase-catalogue upgrades cannot reorder old same-week history". No scheduler catalogue exists
  in source (1323-B row 6). RECONCILIATION-02 §7.3 sets the rule: each slice records its own domain-local phase
  identity so a later catalogue can absorb it. The repo-wide catalogue is not a prerequisite.

## Ruling

1. **One persisted allocator.** A top-level root `p15Sequence: { version: 1, next: number }` lands in the save step of
   the first P15 root to reach production. It starts at 1. Every later P15 root uses the same allocator.
2. **Every P15 native row stores `p15DomainSequence`**, taken from `next` at append (`next++`). This covers each
   market assessment, each ranking record, and each condition event and loan contract event. Within one tick,
   allocation follows the tick's step order:
   - the market batch (step 2.5), in `(week, releaseId)` order;
   - then, at the end of the tick, the ranking record, the condition steps in ascending studio id, and the finale.
3. **Phase identity is stored on every P15 native row** as `phaseId`, `phaseOrdinal` and `phaseOrderVersion`. The
   values come from one documented domain-local table in `src/core/p15Phases.ts`, version 1:

   | phaseId | Step |
   |---|---|
   | `p15a1.marketBatch` | step 2.5 |
   | `p15a2.rankingRecord` | end of tick |
   | `p15b.condition` | end of tick |
   | `p15c.finale` | end of tick |

   Ordinals ascend in that order. A row keeps the version it was written under. A later catalogue maps versions and
   never rewrites rows. This supersedes 1355-A R3's "documented constant, not stored".
4. **Validation across roots.** Every `p15DomainSequence` is distinct across all P15 roots. Each root's rows ascend
   in it, and `next` equals one more than the largest value (1 when there is none). Each row's phase triple matches
   the table entry of its `phaseOrderVersion`. A duplicate or a value at or above `next` refuses by name.
5. **Identity.** The sequence is a persisted monotonic allocator, so it meets annex D.7.
   - A ranking record's id becomes `power-ranking-<p15DomainSequence>`, and 1356-F Amendment 1's separate
     `nextRecord` is withdrawn.
   - A market assessment keeps `releaseId` as its identity, which an existing allocator already issues.
   - P15B may derive event ids from the sequence or keep its own persisted counters. Its charter adoption decides.
6. **Migration.** The save step that creates `p15Sequence` starts it at 1. No row is back-filled, and a downgrade
   refuses a non-empty P15 root by name, as each root already does. When roots share one save step (1355-F Amendment
   4), the allocator arrives in that step.
7. **P15C.** The Legacy law's per-domain `{domainId, highWatermark, recordedFromWeek}` facts (1353-F2) need no change.
   For a P15 native domain, `highWatermark` is the largest `p15DomainSequence` in that domain at the boundary. The
   P15C Wave 2 adapter supplies it.

## The batch manifest (annex D.2.1, L.6 invariant 11): sent back to review

1355-A §3.3 drops the annex's `MarketReleaseBatch` manifest and its `batchCommitReceiptId` and argues that the week's
assessments are the manifest. The reviewer answered R2 without the annex. The parent sends that adaptation, and the
coverage of annex K.1's Wave 2 fixtures, to a second review (1355-B2) with the annex supplied. 1355-F stays adopted
for everything else. RED staging for P15A.1 Wave 2 waits for 1355-B2.
