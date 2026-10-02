# 1358-C8: relationship slice B RED r8 handback

Written 2026-10-02 at 02:09 CDT by the slice B test author, under [1358-F8](1358-F8-parent-response-to-1358-J.md) rulings 2 and 3, after [1358-J](1358-J-rel-sliceB-production-review.md) findings 2, 3 and 6.

r8 is r7 plus three leaves in save-v44's forged-romance block and one trailing assertion in a romance success leaf. No existing leaf changes its outcome or its first message at the RED commit.

## Files

All three sit in `/Users/zacheryspector/studio-scratch/1358-r2/`.

| File | sha256 |
|---|---|
| `1358-rel-sliceB-red-r8.patch` | `ef7c456a5cc173b1340f2e127ca6af8657f57f3198a38e6b2d7e6d2caed3998e` |
| `1358-rel-sliceB-red-r8-classification.json` | `90491c5cf4d106304c6af728701fc06302c92adee76ed8b69d3a4d5880472f7c` |
| `1358-C8-handback.md` | this file; its hash is in the final report |

- **The patch** is cumulative from HEAD `bc2f6007`. It carries r6's producer hunk unchanged: `9b2b4a4` to `0e9c6ed`, sha256 `04713f73…`.
- **Against r7's patch,** the producer, Bridge, competitions-log, labels and p14b5 sections are byte-identical. Only the romance and save-v44 sections differ.

## Apply check

- I archived the two preimages from `bc2f6007` into `/Users/zacheryspector/studio-scratch/1358-r2/r8-apply-check`:
  - `tests/p14b5-relationships.test.ts` (blob `1225928`);
  - the producer (blob `9b2b4a4`).

  Before archiving, I confirmed both blobs were local loose objects.
- `git apply --check -v` passed there for all seven files.
- The five new test files are absent at `bc2f6007`.
- I removed that directory by its literal path.
- The repository's index kept its mtime (1790918506), its size (1419527 bytes) and its sha256 prefix (`340b4fb66aa3f0f6`). The object counts stayed at 4172 loose and 25372 packed.
- I started no vitest, tsc, node or tsx process.

## The edges, from the pinned fixture

I read only `tests/fixtures/p14/genuine-v42-pre-shelving/genuine-v42-rival-stall-week-130.json.gz`, by path, with python3.
- **Pins.** The gzip is 121,262 bytes (sha256 `af45c8a0…`), and the decoded save is 1,096,270 bytes (sha256 `f0bf1f76…`). These are the pins at `tests/p14d1-rival-shelving-fixtures.ts:55-59`.
- **The save.** It is `saveVersion` 42 at tick 130, with `recordingStartedWeek` 0.
- **The edges.** It holds 24 edges in four complete graphs of four people, one graph per rival studio. Edges 0-5 cover studio r01, and all six span weeks 8 to 101:

| Edge | a | b | firstSharedWeek | lastEventWeek |
|---|---|---|---|---|
| 0 | person-studio-aca408ec-r01-1 | person-studio-aca408ec-r01-4 | 8 | 101 |
| 1 | person-studio-aca408ec-r01-1 | person-studio-aca408ec-r01-3 | 8 | 101 |
| 5 | person-studio-aca408ec-r01-2 | person-studio-aca408ec-r01-3 | 8 | 101 |

- **Shared person: edges 0 and 1.** Both hold r01-1.
- **No shared person: edges 0 and 5.**
  - Edge 0 holds r01-1 and r01-4; edge 5 holds r01-2 and r01-3.
  - Together they split r01's four people into two disjoint pairs.
  - Because all four people sit in one studio's complete graph, this control also catches a rule keyed on the studio or on a connected group rather than on the person.
- **Premises.** Each leaf checks its two edges with named premises, so a fixture change would fail by name.

## The four changes

1. **save-v44 :301-308, the anchor rule (ruling 2, finding 2).**
   - Edge 0 gets value 80, `anchorWeek` 100 and one open bond formed at week 101.
   - Every week sits inside edge 0's span and the week-130 save, so the formation after the anchor is the only defect.
   - The leaf expects a throw matching `/romance|bond|anchor/i`.
2. **save-v44 :316-323, the cross-edge rule (ruling 2, finding 3).**
   - `lawfulOpenBond()` (:310-314) gives an edge value 90 and one open bond, formed and anchored at the edge's own `lastEventWeek` (101).
   - The leaf puts that bond on edges 0 and 1 and expects a throw matching `/romance|bond|open/i`.
3. **save-v44 :325-332, the control.** The leaf puts the same lawful bond on edges 0 and 5 and expects acceptance.
4. **romance :321 (ruling 3, finding 6).** The partnered success leaf (:300-322) gains from 96 to the cap of 100, with the track anchored at `week` and the write at `week + 1`. It now ends by expecting `anchorWeek` to equal `week + 1`. At the RED commit it still fails at its first line, the `ROMANCE_SUCCESS_GAIN` guard.

## Expected results at the RED commit

| File | Leaves | Failed | Passed |
|---|---|---|---|
| `tests/p14b10-romance.test.ts` | 37 | 32 | 5 |
| `tests/bridge-p14b10-relationship-labels.test.ts` | 14 | 11 | 3 |
| `tests/p14b10-competitions-log.test.ts` | 7 | 5 | 2 |
| `tests/p14b10-labels.test.ts` | 12 | 12 | 0 |
| `tests/p14b10-save-v44.test.ts` | 25 | 25 | 0 |
| `tests/p14b5-relationships.test.ts` | 53 | 4 | 49 |
| Total | 148 | 89 | 59 |

**The new leaves' first messages:**
- **Anchor rule:** `AssertionError: expected [Function] to throw error matching /romance|bond|anchor/i but got 'mods(...).validateSaveV44 is not a fu…'`
- **Cross-edge rule:** `AssertionError: expected [Function] to throw error matching /romance|bond|open/i but got 'mods(...).validateSaveV44 is not a fu…'`. This is the same line X3 observed for "rejects two open bonds".
- **Control:** `AssertionError: expected [Function] to not throw an error but 'TypeError: mods(...).validateSaveV44 …' was thrown`. This is the same line X3 observed for the block's accepted shapes.

The success leaf keeps X3's first message: `AssertionError: ROMANCE_SUCCESS_GAIN: expected 'undefined' to be 'number' // Object.is equality`.

**Root type gate:** still 17 errors.
- The romance line at :321 moves every later romance position down by one.
- TS2305 ×10: labels (47,10) and (48,10); romance (91,3), (91,24), (91,48), (91,77), (92,3), (92,27), (93,47) and (93,81). These are unchanged.
- TS2353 ×5: romance (619,90), (637,90), (656,92), (657,91) and (668,126).
- TS2578 ×2: romance (677,7) and (679,7).

**Bridge and UI gates:** each should exit 0. The Bridge file is unchanged.

## Classification

- The file holds 100 rows: r7's 97 plus the three new save-v44 rows. They sit in source order after "accepts every bond closed".
- It declares 86 failed and 14 passed. X3's 48 unclassified p14b5 leaves (45 passed and the 3 failed F6 exceptions) bring the run to 89 failed and 59 passed of 148.
- Each new row has an `r8Change` of "New leaf.", null `x2Observed` and `x3Observed`, and a basis derived by reading.
- The success row's `note` records the new assertion, and its `r8Change` names it. Its outcome and first message are unchanged.
- No other row changes.

## The r7-to-r8 diff in full

```diff
diff --git a/tests/p14b10-romance.test.ts b/tests/p14b10-romance.test.ts
index 57307b2..8d66e4a 100644
--- a/tests/p14b10-romance.test.ts
+++ b/tests/p14b10-romance.test.ts
@@ -318,6 +318,7 @@ describe('growth in advanceRelationshipsWeek (1358-F §2): eligibility is Friend
     expect(written.sharedSuccesses).toBe(1) // fixture premise: the existing success driver fired
     expect(written.romance!.value).toBe(Math.min(100, staged + ROMANCE_SUCCESS_GAIN)) // grew past `staged`, stopped at 100
     expect(written.romance!.bonds).toEqual([bond]) // the same open bond; growth appends no second one
+    expect(written.romance!.anchorWeek).toBe(week + 1) // 1358-F8 ruling 3 (F2 §1): a gaining success anchors the track at the write week
   })
 })
 
diff --git a/tests/p14b10-save-v44.test.ts b/tests/p14b10-save-v44.test.ts
index c76ba54..bd5fb34 100644
--- a/tests/p14b10-save-v44.test.ts
+++ b/tests/p14b10-save-v44.test.ts
@@ -297,6 +297,39 @@ describe('save-v44: the validator rejects forged romance', () => {
     })
     expect(() => mods().validateSaveV44(env)).not.toThrow()
   })
+
+  // 1358-C8 (1358-F8 ruling 2; 1358-J findings 2 and 3): two stored invariants that no engine route breaks.
+  it('rejects an open last bond that formed after the track\'s anchorWeek (formation sets the anchor, and later writes only move it forward)', () => {
+    // Value 80 and weeks 100 and 101 sit inside edge 0's span (8 to 101) and the week-130 save, so the anchor is the only defect.
+    const env = withFirstEdge((e) => {
+      e.romance = { value: 80, anchorWeek: 100, bonds: [{ formedWeek: 101, endedWeek: null }] }
+    })
+    expect(() => mods().validateSaveV44(env)).toThrow(/romance|bond|anchor/i)
+  })
+
+  /** A lawful open bond: value 90, formed and anchored at the edge's own lastEventWeek. */
+  const lawfulOpenBond = (edge: RawEdge): RomanceTrack => {
+    const week = edge.lastEventWeek as number
+    return { value: 90, anchorWeek: week, bonds: [{ formedWeek: week, endedWeek: null }] }
+  }
+
+  it('rejects one person holding open bonds on two edges (edges 0 and 1 share person-studio-aca408ec-r01-1)', () => {
+    const env = baseV44Envelope()
+    const [first, second] = [env.state.relationships[0], env.state.relationships[1]]
+    assert.ok(first && second, 'route premise: the genuine fixture holds edges 0 and 1')
+    assert.ok([first.a, first.b].some((id) => id === second.a || id === second.b), 'route premise: edges 0 and 1 share a person')
+    for (const edge of [first, second]) edge.romance = lawfulOpenBond(edge)
+    expect(() => mods().validateSaveV44(env)).toThrow(/romance|bond|open/i)
+  })
+
+  it('accepts open bonds on two edges that share no person (edges 0 and 5 split studio r01\'s four people into two pairs)', () => {
+    const env = baseV44Envelope()
+    const [first, other] = [env.state.relationships[0], env.state.relationships[5]]
+    assert.ok(first && other, 'route premise: the genuine fixture holds edges 0 and 5')
+    assert.ok(![first.a, first.b].some((id) => id === other.a || id === other.b), 'route premise: edges 0 and 5 share no person')
+    for (const edge of [first, other]) edge.romance = lawfulOpenBond(edge)
+    expect(() => mods().validateSaveV44(env)).not.toThrow()
+  })
 })
 
 describe('save-v44: down-conversion (convertV44ToV43)', () => {
```
