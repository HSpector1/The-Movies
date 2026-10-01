# 1355-F4: parent response to the P15A.1 Wave 2 RED review (1355-D)

[1355-D](1355-D-p15a1-wave2-red-review.md) returned REFINE on [1355-C](1355-C-p15a1-wave2-red-handback.md) with four
required changes. The parent adopts all four and rules on the two open points. The test author revises the RED as r2.

## Landing order this RED assumes

The writer queue lands P15A.2 slice 2a (the Power Ranking archive, `p15Sequence` and `p15Phases.ts`) before P15A.1
Wave 2. At P15A.1's GREEN, the ranking root therefore exists. The handback states this. If the order changes, the
leaves marked "re-pinned at a sibling landing" are re-pinned at that landing.

## Required in r2

1. **R1, cross-root validation (1355-F2 item 4).** A RED 14 leaf driven by `P15_ROOTS`
   (`tests/helpers/p15-roots.ts`, 1356-F2 R3) runs on a state just after a quarter tick (`rivalRouteAt(66)`):
   - (a) the state validates while a ranking record holds the largest `p15DomainSequence`;
   - (b) a market row given a ranking record's sequence, ascent kept, refuses by name.

   By the landing order it passes at this wave's GREEN. It is declared re-pinned if the order changes. The leaf reads
   the ranking root only through `P15_ROOTS` and the record shape 1356-C pins, never through a private name.
2. **R2, sibling roots.**
   - Pins and the shared capture strip every `P15_ROOTS` key, never a fixed pair. The producer guards on `sharedMarket`
     alone and tolerates other P15 roots below the step.
   - The handback states that the RED holds whether the roots share one save step (1355-F Amendment 4) or land at
     separate steps.
   - The downgrade leaf (week 70) is declared re-pinned at the merge, alongside 1356-C's
     `rank-root-downgrade-recorded-quarter-refuses`. Whichever production lands second fixes the refusal order for both,
     and its RED revision re-pins the other leaf.
3. **R3, the two-subject leaves.** A pass-through `vi.mock` of `reception.js` logs each `competitionFactor` that
   returns. The leaf asserts that `pressureFactor(1)` returned before the 0.5 call threw.
4. **R4, phase reinterpretation.**
   - Add a row declared under `phaseOrderVersion` 2, with v2's ordinal, that must validate. A validator that pins every
     row to the live version then fails.
   - **Ruling:** the leaf supplies the v2 table by mocking `p15Phases.js` (`importOriginal` plus one added version-2
     table). 1356-C's module may freeze its tables.
   - This keeps 1355-F2 item 3's law intact: rows keep the version they were written under, and versions are added,
     never rewritten.

## Also adopted (1355-D minor and checklist)

- **K3's baseline.** G2's rerun at the RED commit is K3's baseline (1355-A:264 has the RED mint the K1-K3 pins).
- **RED 16 leaf 2** asserts its ramp premise in the leaf (moved from P:87-99), and pins the capture's sha256 after
  minting.
- **The `vi.mock` seam.** The handback declares that production must call `assessBatch` through its export from outside
  `sharedMarket.ts`.
- **The skip mode.** Mint/skip stays. The handback notes that `skip` cannot add an input that another record's capture
  lacks: the parent mints once, at the last writer below the step, with every reader's premises in one run.

## Next

- r2 from the test author, then a confirmation review.
- The parent's reference run follows dry run x3 and 1356-X, one heavy process at a time.
