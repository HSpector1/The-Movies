# 1358-C7: relationship slice B RED r7 handback

Written 2026-10-02 at 01:05 CDT by the slice B test author, under [1358-F6](1358-F6-parent-response-to-1358-D2.md) rulings 1, 3 and 7. r7 is r6 plus four changes:
- the save-v44 comment;
- the Bridge comment;
- one assertion in the own-picture Mentor leaf;
- three classification text fields.

No RED outcome or first message changes.

## Files

All three sit in `/Users/zacheryspector/studio-scratch/1358-r2/`.

| File | sha256 |
|---|---|
| `1358-rel-sliceB-red-r7.patch` | `82b5e16e17d872fe0bca13eeb92fbe15ecd18a577023f46d58189f1294846074` |
| `1358-rel-sliceB-red-r7-classification.json` | `0e9b8c75bc7c0c96c0b9a5777a382a709eba7519ac59ec36b18bb4f69203ede9` |
| `1358-C7-handback.md` | this file; its hash is in the final report |

- **The patch** is cumulative from HEAD `bc2f6007`. It carries r6's producer hunk unchanged: `9b2b4a4` to `0e9c6ed`, sha256 `04713f73…`.
- **Against r6's patch,** the producer, competitions-log, labels, romance and p14b5 sections are byte-identical. Only the Bridge and save-v44 sections differ.

## Apply check

- I archived the two preimages from `bc2f6007` into a scratch directory, `/Users/zacheryspector/studio-scratch/1358-r2/r7-apply-check`:
  - `tests/p14b5-relationships.test.ts` (blob `1225928`);
  - the producer (blob `9b2b4a4`).

  Before archiving, I confirmed both blobs were local loose objects.
- `git apply --check -v` passed there for all seven files.
- The five new test files are absent at `bc2f6007`.
- I then removed the scratch directory by its literal path.
- The repository's index kept its mtime (1790918506), its size (1419527 bytes) and its sha256 prefix (`340b4fb66aa3f0f6`). The object counts stayed at 4172 loose and 25372 packed.
- I started no vitest, tsc, node or tsx process.

## The four changes

1. **Save-v44 :270-273 (ruling 1).** The comment now states the charter's bound:
   - `endedWeek` lies at or after the bond's `formedWeek` and at or below the save week, inside the recording interval.
   - A formation check can record an ending with no driver (1347-A:56-58), so `endedWeek` may lie after the edge's `lastEventWeek`.
   - Week 101 satisfies both bounds, and the bond order stays the only defect.

   The code is unchanged.
2. **Bridge :328 (ruling 3).** The comment now says the charter allows Mentor for the viewer's own unreleased picture.
3. **Bridge :374 (ruling 7).** After :373, the own-picture leaf also expects the first two pictures' titles in the Mentor evidence. At the RED commit the leaf still throws at :371, before this line.
4. **Classification (ruling 3).**
   - The own-picture row's `requirement` and `note` now describe r6's restaged leaf and r7's added titles.
   - The re-formation row's note reads `formedWeek: 100`.
   - No `expectedX3`, outcome or first message changes.

## The r6-to-r7 diff of the tests

```diff
diff --git a/tests/bridge-p14b10-relationship-labels.test.ts b/tests/bridge-p14b10-relationship-labels.test.ts
index eed12fc..5ae93be 100644
--- a/tests/bridge-p14b10-relationship-labels.test.ts
+++ b/tests/bridge-p14b10-relationship-labels.test.ts
@@ -325,7 +325,7 @@ describe('Mentor — the Bridge-level "public" gate (1347-A §6 item 8: "withhol
 
   // 1358-C5 (1358-F4 item 1; 1358-D blocking 1): evidence "cites only released pictures or the viewer's
   // own" (1347-A:105), and §6 item 8 withholds Mentor only for RIVAL pictures until all three are public.
-  // r4 withheld Mentor for the viewer's own unreleased picture, which the charter allows. The withholding
+  // r4 withheld Mentor for the viewer's own unreleased picture, where the charter allows Mentor. The withholding
   // leaf now re-attributes that picture to a rival. The next leaf shows Mentor for the viewer's own picture
   // while it is still in production (restaged in 1358-C6 from the route's own state).
   it('the SAME cohort entrant, with ONE of the three pictures a RIVAL picture that is not yet public (first take re-attributed to a rival business, no release fact), withholds Mentor at the Bridge level even though the core derivation is unaffected', () => {
@@ -371,6 +371,7 @@ describe('Mentor — the Bridge-level "public" gate (1347-A §6 item 8: "withhol
     const mentor = directorRow.labels.find((l) => l.label === 'Mentor')
     expect(mentor, 'Mentor shows: the unreleased picture is the viewer\'s own').toBeDefined()
     expect(mentor!.evidence).toContain(title)
+    for (const id of [first, second]) expect(mentor!.evidence).toContain(titleOf(state, id)) // 1358-F6 ruling 7; 1347-A:65
   }, 180_000) // 1356-F5: vitest cannot stop a synchronous body, so this timeout is not a budget
 })
 
diff --git a/tests/p14b10-save-v44.test.ts b/tests/p14b10-save-v44.test.ts
index c18966f..c76ba54 100644
--- a/tests/p14b10-save-v44.test.ts
+++ b/tests/p14b10-save-v44.test.ts
@@ -267,10 +267,10 @@ describe('save-v44: the validator rejects forged romance', () => {
   })
 
   it('rejects bonds out of order (a later formedWeek before an earlier one)', () => {
-    // 1358-C6 (the coordinator's ruling on 1358-C5's first uncertain item, after 1358-F4 item 4): endedWeek 101
-    // is edge 0's lastEventWeek. A touch writes the ending and moves lastEventWeek, so a valid state keeps
-    // endedWeek <= lastEventWeek. 101 also sits at or after the bond's formedWeek (100) and inside the week-130
-    // save's recording interval, so the order of the two bonds is the leaf's only defect.
+    // 1358-C7 (1358-F6 ruling 1, correcting 1358-F5 ruling 1): endedWeek 101 lies at or after the bond's formedWeek
+    // (100) and at or below the save week, inside the week-130 save's recording interval. A formation check can record
+    // an ending with no driver (1347-A:56-58), so endedWeek may lie after the edge's lastEventWeek; here 101 equals it.
+    // The order of the two bonds stays the leaf's only defect.
     const env = withFirstEdge((e) => {
       e.romance = { value: 80, anchorWeek: 100, bonds: [{ formedWeek: 100, endedWeek: 101 }, { formedWeek: 50, endedWeek: null }] }
     })
```

## The r6-to-r7 diff of the classification

Three fields change, and nothing else:

- **bridge-p14b10-relationship-labels.test.ts**, "the SAME cohort entrant, read in the route's own week before its third p…", field `note`:
  - r6: Derived by reading: the title-distinctness premise holds when no other cohort title contains the third title; greenlightEvidence takes the first unused concept for each picture. At GREEN the kept variant leaves the title in the studio history row, the theatrical run and the career events, but not in releasedFilms or activeProductions (see the handback).
  - r7: r6 restaged the leaf (1358-F5 ruling 2). It reads the route's own input to the tick that releases the third picture, which mentorCohort() captures with a pass-through tick spy during the first cohortThreeFilms() build. In that state the picture sits in activeProductions at remainingTicks 1, with its first take recorded at the viewer's studio, and no released film, theatrical run or filmReleased history row names it. The evidence must contain the title of the production's concept, and r7 adds the first two pictures' titles (1358-F6 ruling 7). At RED the leaf throws at the labels read, before either title check. Derived by reading: no other cohort title contains the third title, because greenlightEvidence takes the first unused concept for each picture; the leaf asserts this as a named premise.
- **bridge-p14b10-relationship-labels.test.ts**, "the SAME cohort entrant, read in the route's own week before its third p…", field `requirement`:
  - r6: 1347-A:105 (evidence cites "released pictures or the viewer's own") and 1358-F4 item 1: r4's variant, kept with the expectation flipped. The viewer's own unreleased picture shows Mentor, and the evidence cites it.
  - r7: 1347-A:105 (evidence cites "released pictures or the viewer's own"), §6 item 8 and 1358-F4 item 1, as restaged under 1358-F5 ruling 2: the viewer's own picture, still in production, shows Mentor, and the evidence cites all three pictures by their concept titles (1347-A:65; 1358-F6 ruling 7).
- **p14b10-romance.test.ts**, "a re-formation (after an ended bond) appends a SECOND bond row, never ov…", field `note`:
  - r6: Derived at RED, and observed by 1358-X: fails toEqual: one bond row {formedWeek: -100, endedWeek: 300} received; the expected second row {formedWeek: 401, endedWeek: null} is absent. 1358-X3 printed the first message as "AssertionError: expected [ { formedWeek: 100, endedWeek: 300 } ] to deeply equal [ { formedWeek: 100, …(1) }, …(1) ]", where 1358-C5 declared "AssertionError: expected [ Array(1) ] to deeply equal [ { formedWeek: 100, …(1) }, …(1) ]": the same assertion on the same values. r6 records the printed form.
  - r7: Derived at RED, and observed by 1358-X: fails toEqual: one bond row {formedWeek: 100, endedWeek: 300} received; the expected second row {formedWeek: 401, endedWeek: null} is absent. 1358-X3 printed the first message as "AssertionError: expected [ { formedWeek: 100, endedWeek: 300 } ] to deeply equal [ { formedWeek: 100, …(1) }, …(1) ]", where 1358-C5 declared "AssertionError: expected [ Array(1) ] to deeply equal [ { formedWeek: 100, …(1) }, …(1) ]": the same assertion on the same values. r6 records the printed form.
