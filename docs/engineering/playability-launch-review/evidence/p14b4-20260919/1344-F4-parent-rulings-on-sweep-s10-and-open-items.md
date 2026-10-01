# 1344-F4: parent rulings on the sweep's S10 pre-declarations and the groups' open items

Inputs, all in scratch under `/Users/zacheryspector/studio-scratch/1344-sweep/`:
- the S10 pre-declarations (test-author, read-only, nothing run): `s10/declarations.md` and five probes in
  `s10/probes/`;
- the open items in the group handbacks (`helpers`, `g1`-`g6`, each `handback.md` and `deferred.json`).

The merged sweep sits in `/Users/zacheryspector/studio-scratch/1344-merge/tree` (merge HEAD a318722). Its parent dry
run x2 is in progress; its type gates exit 0 on root, UI and Bridge.

## Rulings on the S10 rows

1. **Rows 1-4 are retained 1338 identities: attribute them, do not re-pin them in the sweep.** These are the four
   1338 rows whose primary changed (1344-N, "the other four changed rows are the S10 rows"): the seating seed-b chain
   digest (`p14b4-rival-seating-preference:498`) and `bridge-p14b5-relationships` family 12 (`:530` settled count,
   not `:529`; `:550` settlement digests for `p13-public-commercial-adoption` and `p13a-core-causal-01`).
   - 1344-N keeps every retained row's cause ("The 79 retained 1338 rows keep their causes") and its success line
     counts the four S10 rows among the failing identities, "attributed".
   - A value recomputed on today's chain would also absorb the retained 1338 cause into the new pin. The sweep
     therefore changes none of these assertions.
   - The probe for each row must show the shelving receipts its declaration names, ahead of the moved value. The row
     then stays failing, and its changed primary is attributed to shelving.
   - Rows 1-3 have no shelving on record for their seeds. If a probe finds none before the moved value, the
     attribution is refuted and the row returns to the parent as an unattributed movement, not S10.
   - Family 12's "up to seven pins per seed" question does not arise in the sweep.
2. **Row 5 (`p14b5-relationships:596`, passing at 1338) is S7, not S10.** `bytes()` strips `screenplayShelving` from
   every business behind a guard placed before the strip. The guard throws unless, for every business:
   - `version` is 1, `shelved` is empty and `commissionHoldUntilWeek` is 0;
   - every rejection has count 1 and names an active ready ordinal;
   - no `screenplayShelved` receipt exists.

   The pin `FROZEN.postTakeDigestStripped` (9702aa68…) does not move. This follows the guard-before-strip convention
   of [1332-A](1332-A-unresolved-attribution-and-repair-r3-plan.md) (:84-90). The author runs the whole file and names
   each `bytes()` caller that passes.
3. **Oracle rows follow the shelved-screenplay filter.** These are row 7 (`p14b1-trust-chooser:683`, two leaves) and
   g6's `p14b4-cast-class-policy:485`.
   - Each test restates production's candidate set. Production now excludes a rival's shelved screenplays:
     `rivalPromiseProjectCandidates` (`src/core/talentMarket.ts:1442-1449`) filters through `shelvedScriptIds`
     (`src/core/hollywoodTypes.ts:142-145`).
   - The oracle derives "shelved" from the persisted save state (the business's `activeScriptOrdinals` and
     `screenplayShelving`), never by calling the production function under test. No pinned output value moves.
   - Class label: `ORACLE` (new; record it in the classification with the source lines above).
4. **Row 6 (`p14b5-relationships:365-372`, three leaves, passing at 1338) is S10 proper.** The probe decides:
   - If the replacement repeat take lands inside the leaf's 40-tick guard, the leaves re-pin to the identities the
     probe's verified receipts name. The declaration predicts, without a run, that `script-0006` shelves at week 208
     and `film:6` is retried from week 234.
   - If it lands outside, nothing widens. The leaves return to the parent as a premise conflict with the shelving
     law. Choosing a different lawful witness is a test-design change and needs its own review.

## Rulings on the groups' open items

5. **The S9 measure items take the measured order from the dry run.** These are `p14c3-transitions:169,198` (g6) and
   `p14c3-second-episode-writing:144`, W6 (g6).
   - Where `convertV43ToV42` or `validateSaveV43` now throws first, the expected message names that measured guard.
   - A comment records the masking and names the test that still covers the older guard on its own era's genuine
     input (1344-N S9; the 1320-A form).
6. **g5's Q2 anomaly takes the measured result.** The direct `validateSaveV42` calls are at
   `p14c3-queued-writing-proof` 56/129/154.
   - If they fail with the S1 signature, they take S1.
   - If they pass, the handback states which envelope they validate.
7. **The helpers' two deferrals.**
   - `p14p3-fixtures.ts:106` (inferred S4) takes S4 only if the dry run shows the frozen chain refusing a live
     envelope there.
   - The stale digest comment at `p14c3-canonical-rival-fixtures.ts:194` asserts nothing and stays as written.
8. **Order.** The sweep lands before slice A's RED r5. r5 rebases onto the swept HEAD and keeps the sweep's row 5 and
   row 6 edits.

## Process

- An independent read-only review of the declarations (1344-D5) answers the seven "Reviewer checks" in
  `declarations.md` against these rulings.
- The parent then runs the probes in the merge tree one at a time, after x2 ends, and records each predicate as true
  or false.
- The dry-run tallies are 1344-X8 (x2) and 1344-X9 (x3). The final sweep review stays 1344-D4, as 1344-N names it.
