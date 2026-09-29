# 1348-F2: the D5 reason sentence when enemies decide a settlement (parent decision)

[1348-D2](1348-D2-rel-sliceA-red-r2-review.md) returned ACCEPT. Its trace of the new settlement-level leaf shows a
defect that slice A makes reachable.

## The defect

`chooseProposal` gives the winner one reason per descriptor on which it beats every other proposal
(`src/core/talentMarket.ts:984-988`). For `relationships` it always uses one sentence
(`DESCRIPTOR_REASON.relationships`, `:746`): "their roster holds this person's close ties". Under v1, band 0
("enemies here") was unreachable, so a decisive relationships difference was always 2 over 1, and the sentence was
true. Under v2 a proposal can win at band 1 ("none") over a band-0 proposal. The winner then reads "their roster holds
this person's close ties" although its roster holds none. The 1348-C2 leaf "only enemy" asserts exactly that sentence
for r01, whose roster is empty for the subject. A reason must be true, so the test would pin a false explanation.

## Decision

The relationships reason depends on the winner's own band:
- winner band 2 (close ties): "their roster holds this person's close ties", unchanged;
- winner band 1 over losers at band 0: "every other offer comes from a roster holding someone this person is at odds
  with".

The new sentence stays in the sentence class of `:744-745`: ordering only, naming no person, tier or number.
Settlement reasons are validated as ordering-only text (`talentMarket.ts:1570-1579`), not against a closed list, so no
save or validator change follows. Receipts written before slice A keep their sentences unchanged.

## Tests (revision 1348-C3)

- The "only enemy" settlement leaf asserts the new sentence.
- A copy test pins each branch's sentence: 2 over 1, 2 over 0, and 1 over 0.

This follows the recorded rule that an order, band or copy accessor gets a companion-text test per branch in the
slice that lands it.
