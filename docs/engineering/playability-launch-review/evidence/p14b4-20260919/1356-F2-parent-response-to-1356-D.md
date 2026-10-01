# 1356-F2: parent response to the slice 2a RED review (1356-D)

[1356-D](1356-D-p15a2-wave2-red-review.md) returned REFINE on [1356-C](1356-C-p15a2-wave2-red-handback.md) with three
required changes. The parent adopts all three and rules on the open point in R3. The test author revises the RED as
r2.

## Required in r2

1. **R1, the player's arithmetic run end.** `rank-adapter-player-films` gains two runs whose status contradicts the
   arithmetic of 1356-A:55, :60-61: one `completed` but released at W−2 (running at W), one `active` but released at
   W−30 (ended at W). The adapter must decide by `releaseTick + totalWeeks <= W` and never by `status`.
2. **R2, the rival half of "research moves neither"** (1356-A:203-204). Check the rival side at a memo week inside the
   rival research window, after `researchableWeek` 260 (`rivalResearch.ts:50-55`, `technologyCatalogue.ts:60`), with a
   premise leaf asserting that some rival booked `researchSpend` there. If no seeded campaign reaches a paying rival
   within the memo's weeks, say so in the handback and use a constructed state that carries a real `researchSpend`
   booking through the live validator.
3. **R3, sibling roots.** Every leaf survives a sibling P15 root where it can. The rest are declared.
   - **One list.** A new helper `tests/helpers/p15-roots.ts` exports `P15_ROOTS` (today `['p15Sequence',
     'powerRanking']`) and `stripP15(state)`, which drops exactly those keys. `stripP15` in the archive file reads it.
     Each later P15 RED adds its root key to `P15_ROOTS` in its own patch, at its landing.
   - **`rank-record-sequence-allocation` becomes sibling-proof.**
     - Ranking records' `p15DomainSequence` values are distinct and ascending.
     - `p15Sequence.next` equals 1 plus the largest `p15DomainSequence` over every row in every `P15_ROOTS` root.
     - Contiguity (1..n) is asserted only while no other row-bearing root in `P15_ROOTS` holds a row.
   - **RED 10 keeps its intent and becomes sibling-proof.**
     - Every non-P15 root stays byte-identical, through `stableStringify`.
     - Every sibling P15 root stays byte-identical once each row's `p15DomainSequence` is removed.
     - The sibling rows' relative order by `p15DomainSequence` is unchanged.
     - `p15Sequence.next` falls by exactly the number of ranking records the removed step would have written.

     At RED time no sibling exists, so the leaf reduces to today's byte identity plus that `next` check.
   - **Declared, re-pinned at a sibling landing.** RED 9 pins the ranking step as `tick()`'s last expression, and
     1356-A:88-89 runs the P15B step after it. Its header lists RED 9 beside `ARCHIVE_STEP` as re-pinned when a later
     end-of-tick step lands, and the handback repeats the list.
4. **Minor (accepted).** `rank-record-phase-triple` asserts a non-empty archive before reading it.
5. **The 6,240-week harness.**
   - §8 item 17 sets the length, so it stays.
   - The 4-hour ceiling goes. r2 keeps a provisional ceiling marked PROVISIONAL, and the parent sets the budget from
     the first single-file run (the 1353-F3 method used for Wave R).
   - The file stays out of the broad core allowlist and runs alone.

## Unchanged

- The RED reasons stand, as do the save-version lookup by name and the `vi.mock` seam: it already appears in the UI
  project (`ui/src/shell/save-presentation.test.tsx:24-27`).
- Coverage stands, with items 18-27 deferred to slice 2b.

## Next

- r2 from the test author, then a confirmation review.
- The parent's reference run follows the Save43 sweep's dry run x2, one heavy process at a time.
- The genuine capture for the capture leaf is minted later, at the last writer below the P15 save step.
