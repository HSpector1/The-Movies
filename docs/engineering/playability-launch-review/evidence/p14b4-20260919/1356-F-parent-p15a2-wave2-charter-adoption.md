# 1356-F: parent adoption of the P15A.2 Wave 2 charter

[1356-A](1356-A-p15a2-wave2-charter.md) stays byte-frozen. Review [1356-B](1356-B-p15a2-wave2-charter-review.md)
returned ACCEPT with no blocking defect. It could not read the P15 builder annex, which exists only at commit 2a7ff0d9,
and so left R4 to the parent. The parent read the annex and adopts 1356-A with the amendments below, which govern
where they differ.

## Amendment 1: record identity from a persisted allocator (R4)

Annex D.7 (`git show 2a7ff0d9:docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15-BUILDER-ANNEX.md`,
lines 340-347) requires a "deterministic keyspace or monotonic allocator whose state is persisted" and forbids
"array-position, display-name, rank, or week-only identity". The draft's `power-ranking-<W>` is a week-only identity.
The cadence makes it unique today, but D.7 rules it out as written.

- The root gains `nextRecord: number`, a monotonic allocator in the `industry-event-N` pattern
  (`hollywoodTick.ts:44-46`, `h.nextReceipt++`). A fresh or migrated root starts at 1.
- Each record gains `id: 'power-ranking-<n>'`, allocated at append. The record keeps its `week` as data.
- Validation adds: ids are distinct, each `n` is below `nextRecord`, ids ascend with weeks, and `nextRecord` equals
  one more than the largest `n` (1 when empty). A duplicate id refuses by name on load (D.7 "collision and
  duplicate-load refusal").
- The Bridge `targetId` for an archived quarter is that id. A week is never accepted as an identity.
- The downgrade that strips an empty archive also drops `nextRecord`.

## Amendment 2: the step and the validator agree on cadence by a named invariant (1356-B note 2)

`originWeek` and a migration's `recordedFromWeek` are both stamped at the current week before any further tick runs,
so the first week the step can produce is strictly above both. That is why the validator's interval
`(max(recordedFromWeek, originWeek), market.tick]` is open at its lower end.
`recordPowerRankingQuarter` carries a comment stating this. RED 14 gains one leaf, `rank-validate-cadence-boundary`:
- a world founded at a multiple of 13;
- a save migrated at a multiple of 13;
- a save migrated one week before a multiple of 13.

In all three, the step's records and the validator's expected weeks are equal.

## Answers to the review questions

- **R1, R2, R3 and R5:** adopted as 1356-B answered them.
- **R4:** Amendment 1.
- **1356-B note 1:** the TUNING pins run to `tests/p15a2-power-ranking.test.ts:200`; read §2's citation as :194-200.

## Status and order

Charter adopted. Slice 2a production waits for the Wave 1 closure (1351-L IN PROGRESS) and for the save versions ahead
of it, as §9 states. 1355-F Amendment 4 allows the archive to share one save step with the P15A.1 and P15B roots. RED
staging is independent work and follows the running Save43 measurement. Owner questions: none.

## Later ruling

[1355-F2](1355-F2-parent-p15-domain-sequence-ruling.md) item 5 replaces Amendment 1's separate `nextRecord`: a record's
id is `power-ranking-<p15DomainSequence>`, drawn from the one persisted P15 allocator. Every record also stores the
phase triple of 1355-F2 item 3. The validation, Bridge `targetId` and "a week is never an identity" rules of Amendment
1 stand with that id.
