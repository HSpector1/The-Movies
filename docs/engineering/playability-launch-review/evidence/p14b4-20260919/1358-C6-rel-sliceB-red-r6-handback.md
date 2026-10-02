# 1358-C6: relationship slice B RED r6 handback

Written 2026-10-02 at 00:23 CDT by the slice B test author, under the coordinator's rulings on 1358-C5's two uncertain items. Line numbers are r6 lines.

## Deliverables

All three files sit in `/Users/zacheryspector/studio-scratch/1358-r2/`.

| File | sha256 |
|---|---|
| `1358-rel-sliceB-red-r6.patch` | `212b798058a8902fcd718b7487584dba805d34a08109e032846cb2801251c9ef` |
| `1358-rel-sliceB-red-r6-classification.json` | `9ee1abbc998780108d0ba911b92661c1be39ba38cd9301cd8261db98cfb980dd` |
| `1358-C6-handback.md` | this file; its hash is in the final report |

The producer is unchanged since r4 (sha256 `04713f73d9a172f76302a860f3b24af925316155d5b504444de4af9ad6a698a3`). Like r5, the patch carries r4's producer hunk against HEAD's r3 copy.

## Base and apply check

- **HEAD moved.** The real HEAD is now `a5359347`, the docs commit that records 1358-X3 on top of `85ffc6bc`.
  - The `src`, `bridge`, `ui`, `generated`, `tests` and `scripts` trees carry the same tree ids at both commits.
  - The two preimage blobs are unchanged: `1225928` for p14b5 and `9b2b4a4` for the producer.
- **Apply check.** `git apply --check --cached -v` passed at `85ffc6bc` and at `a5359347`.
  - Each check ran under a temporary index at `/Users/zacheryspector/studio-scratch/1358-r2/r6-apply-check.index`, which I removed by its literal path afterwards.
  - Both preimage blobs were already loose objects, so the check triggered no lazy fetch.
  - My checks left the real worktree index unchanged: mtime 1790918506, size 1419527 bytes, sha256 prefix `340b4fb66aa3f0f6`. Object counts stayed at 4172 loose and 25372 packed.
- **Processes.** I started no vitest, tsc, node or tsx process. Python built the classification from the r5 JSON and X3's JSON.

## Changes from r5

### Ruling item 1: `tests/p14b10-save-v44.test.ts:269-278`

The out-of-order bond now ends at week 101, edge 0's `lastEventWeek`. The comment names the bound:
- a touch writes the ending and moves `lastEventWeek`, so a valid state keeps `endedWeek` at or below `lastEventWeek`;
- 101 sits at or after the bond's `formedWeek`, 100;
- 101 sits inside the week-130 save's recording interval.

So the order of the two bonds is the leaf's only defect.

### Ruling item 2: the own-picture Mentor leaf, restaged

I found a lawful staging, so the variant stays.

- **The capture.** `mentorCohort()` (`tests/bridge-p14b10-relationship-labels.test.ts:287-313`) wraps the first `cohortThreeFilms()` build in a tick spy.
  - The spy follows the house pattern of `tests/bridge-p14c3-dual-career-surfaces.test.ts:30-36`: `vi.spyOn` on the tick module, with every call going to the real tick.
  - It returns each real result unchanged, keeps a copy of the input to the tick that takes `releasedFilms` from 2 to 3, and is restored in a `finally`.
  - That copy is the route's own state just before the third release. The cohort helper itself is untouched.
- **The leaf.** :351-374 reads that copy. Its premises:
  - the third picture is in `activeProductions`;
  - its first take is recorded, at the viewer's studio;
  - no released film, theatrical run or `filmReleased` history row names it;
  - no other cohort title contains its title;
  - `mentorEvidence` names the director.

  The leaf then expects Mentor shown, with evidence that contains the title of the production's concept.
- **Comments.** The header scope note (:32-34) and the comment before the rival leaf (:326-330) now describe the restaged leaf.

### Ruling item 3: `tests/p14b10-competitions-log.test.ts:220-222`

The sentence about Save44's week order left the test comment. Both production findings now go to the production writer through this handback:
- Save44's log weeks must be non-decreasing, not strictly ascending: P3a and P3b share a week, and the log holds P3a's row first.
- After Save44, p14b5's `stage()` (:235) and `stagedEdge()` (:228) need the two new fields. That falls to the pin sweep.

## The diff from r5

```diff
diff --git a/tests/bridge-p14b10-relationship-labels.test.ts b/tests/bridge-p14b10-relationship-labels.test.ts
index b308a3d..eed12fc 100644
--- a/tests/bridge-p14b10-relationship-labels.test.ts
+++ b/tests/bridge-p14b10-relationship-labels.test.ts
@@ -29,8 +29,9 @@
 // (roster-gated row presence) and leaves the "released" half of the clause to the leaf that IS
 // load-bearing for it: Mentor, whose director/actor pair CAN be entirely rival-internal (no
 // player-only constraint on cohort entry or `firstTakes`), covered below with a REAL fixture: the
-// all-released positive, a rival picture not yet public (withheld), and the viewer's own unreleased
-// picture (shown, citing it), the last two per 1358-F4 item 1 in revision 1358-C5. Romance's DTO
+// all-released positive, a rival picture not yet public (withheld, 1358-F4 item 1), and the viewer's
+// own picture still in production, read in the route's own state before its release (shown, citing
+// it; restaged in revision 1358-C6). Romance's DTO
 // (`status`/`sinceLabel`/`endedLabel`) names no production id at all — only calendar labels via the
 // existing `campaignDate` helper (the same device `asOfLabel` already uses in this file) — so the
 // "released pictures" clause has no surface there either. Both omissions are named explicitly here,
@@ -58,7 +59,7 @@
 
 import assert from 'node:assert/strict'
 import { performance } from 'node:perf_hooks'
-import { describe, expect, it } from 'vitest'
+import { describe, expect, it, vi } from 'vitest'
 import { applyActions } from '../src/core/actions.js'
 import { hiringMarketIds } from '../src/core/employment.js'
 import { campaignDate } from '../src/core/calendar.js'
@@ -67,6 +68,7 @@ import { financeUpcoming } from '../bridge/finance-upcoming.js'
 import { PROJECTION_VERSION } from '../bridge/schema/bridge-schema.js'
 import { currentTier } from '../src/core/relationships.js'
 import { mentorEvidence } from '../src/core/relationshipLabels.js'
+import * as tickModule from '../src/core/tick.js'
 import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
 import { advanceTo, fund, player } from './helpers/p14b2-fixtures.js'
 import { cohortThreeFilms, COHORT_SUBJECT } from './helpers/p14c3-cohort-transition-fixtures.js'
@@ -282,11 +284,24 @@ function titleOf(state: GameState, productionId: string): string {
 const COHORT_THREE_FILMS_BUDGET_MS = 240_000
 let cohortTimed = false
 let cohortOverBudget: Error | undefined // cached, so the second Mentor leaf fails by the same name
+/** 1358-C6 (the coordinator's ruling on 1358-C5's second uncertain item): the route's own input to the tick
+ * that releases its third picture, captured from the real tick during the first build. In that state the
+ * picture sits in activeProductions with its first take recorded, and nothing records it as released. */
+let cohortBeforeThirdRelease: GameState | undefined
 function mentorCohort(): ReturnType<typeof cohortThreeFilms> {
   if (cohortOverBudget !== undefined) throw cohortOverBudget
   if (cohortTimed) return cohortThreeFilms()
   const started = performance.now()
-  const built = cohortThreeFilms()
+  const realTick = tickModule.tick
+  const capture = vi.spyOn(tickModule, 'tick').mockImplementation((input, options) => {
+    const output = realTick(input, options)
+    if (cohortBeforeThirdRelease === undefined && input.studio.releasedFilms.length === 2 && output.studio.releasedFilms.length === 3) {
+      cohortBeforeThirdRelease = structuredClone(input)
+    }
+    return output
+  })
+  let built: ReturnType<typeof cohortThreeFilms>
+  try { built = cohortThreeFilms() } finally { capture.mockRestore() }
   const elapsedMs = performance.now() - started
   cohortTimed = true
   if (elapsedMs > COHORT_THREE_FILMS_BUDGET_MS) {
@@ -311,7 +326,8 @@ describe('Mentor — the Bridge-level "public" gate (1347-A §6 item 8: "withhol
   // 1358-C5 (1358-F4 item 1; 1358-D blocking 1): evidence "cites only released pictures or the viewer's
   // own" (1347-A:105), and §6 item 8 withholds Mentor only for RIVAL pictures until all three are public.
   // r4 withheld Mentor for the viewer's own unreleased picture, which the charter allows. The withholding
-  // leaf now re-attributes that picture to a rival; r4's variant stays as the next leaf, flipped.
+  // leaf now re-attributes that picture to a rival. The next leaf shows Mentor for the viewer's own picture
+  // while it is still in production (restaged in 1358-C6 from the route's own state).
   it('the SAME cohort entrant, with ONE of the three pictures a RIVAL picture that is not yet public (first take re-attributed to a rival business, no release fact), withholds Mentor at the Bridge level even though the core derivation is unaffected', () => {
     const { state, team, pictureIds } = mentorCohort()
     const playerId = player(state)
@@ -332,24 +348,29 @@ describe('Mentor — the Bridge-level "public" gate (1347-A §6 item 8: "withhol
     expect(directorRow.labels.some((l) => l.label === 'Mentor')).toBe(false)
   }, 180_000) // 1356-F5: vitest cannot stop a synchronous body, so this timeout is not a budget
 
-  it('the SAME cohort entrant, with ONE of the three pictures the viewer\'s OWN and not yet released, still shows Mentor, and the evidence cites that picture (1347-A:105)', () => {
-    const { state, team, pictureIds } = mentorCohort()
+  it('the SAME cohort entrant, read in the route\'s own week before its third picture is released (that picture in production, its first take recorded), shows Mentor, and the evidence cites the picture by its production\'s title (1347-A:105)', () => {
+    const { team, pictureIds } = mentorCohort()
+    assert.ok(cohortBeforeThirdRelease, 'route premise: the first cohortThreeFilms() build captured the state before the third release')
+    const state = structuredClone(cohortBeforeThirdRelease)
     const playerId = player(state)
     const week = state.market.tick
-    const ownPicture = pictureIds[2]!
-    const titles = pictureIds.map((id) => titleOf(state, id))
-    const ownTitle = titles[2]!
-    assert.ok(!titles.slice(0, 2).some((title) => title.includes(ownTitle)), 'route premise: the third picture\'s title names it alone')
-    // r4's variant, unchanged: the picture's release result is removed from the viewer's released films.
-    const variant: GameState = { ...state, studio: { ...state.studio, releasedFilms: state.studio.releasedFilms.filter((f) => f.productionId !== ownPicture) } }
-    assert.ok(variant.firstTakes.some((take) => take.productionId === ownPicture && take.studioId === playerId), 'route premise: the viewer\'s own first take records the picture')
-    assert.ok(mentorEvidence(variant, COHORT_SUBJECT)?.directorId === team.directorId, 'route premise: the core derivation still names Mentor')
-    const block = blockFor(variant, COHORT_SUBJECT, playerId, week)
+    const [first, second, third] = pictureIds as [string, string, string]
+    const production = state.studio.activeProductions.find((p) => p.id === third)
+    assert.ok(production, 'route premise: the third picture is in production')
+    assert.ok(state.firstTakes.some((take) => take.productionId === third && take.studioId === playerId), 'route premise: its first take is recorded, at the viewer\'s own studio')
+    assert.ok(!state.studio.releasedFilms.some((film) => film.productionId === third) && !state.theatricalRuns.some((run) => run.productionId === third)
+      && !state.studioHistory.rows.some((row) => row.kind === 'filmReleased' && row.productionId === third),
+    'route premise: no release, theatrical run or release history row names it')
+    const title = state.concepts.find((concept) => concept.id === production.conceptId)?.title // the title the production carries
+    assert.ok(title !== undefined, 'route premise: the production names a concept')
+    assert.ok(![first, second].some((id) => titleOf(state, id).includes(title)), 'route premise: the third title names that picture alone')
+    assert.ok(mentorEvidence(state, COHORT_SUBJECT)?.directorId === team.directorId, 'route premise: the core derivation names Mentor')
+    const block = blockFor(state, COHORT_SUBJECT, playerId, week)
     const directorRow = block.rows.find((r) => r.counterpartId === team.directorId)
-    assert.ok(directorRow, 'route premise: the director must still be disclosed on the player roster')
+    assert.ok(directorRow, 'route premise: the director must be disclosed on the player roster')
     const mentor = directorRow.labels.find((l) => l.label === 'Mentor')
     expect(mentor, 'Mentor shows: the unreleased picture is the viewer\'s own').toBeDefined()
-    expect(mentor!.evidence).toContain(ownTitle)
+    expect(mentor!.evidence).toContain(title)
   }, 180_000) // 1356-F5: vitest cannot stop a synchronous body, so this timeout is not a budget
 })
 
diff --git a/tests/p14b10-competitions-log.test.ts b/tests/p14b10-competitions-log.test.ts
index c94546f..8e9e98d 100644
--- a/tests/p14b10-competitions-log.test.ts
+++ b/tests/p14b10-competitions-log.test.ts
@@ -219,8 +219,7 @@ describe('the competitions log exists on the engine-minted edge (RED: Relationsh
     for (const row of p3Rows) expect(row.slots).toEqual(['lead'])
     // 1358-C5 (1358-F4; 1358-D check 2): r4 compared the weeks with `<=`, which always held, and its
     // comment called P3b "strictly later". P3b is greenlit in P3a's own week, right after the cancel, so
-    // both rows carry that week and the append-only log holds P3a's row first. Save44's "ascending
-    // weeks" therefore has to admit equal weeks.
+    // both rows carry that week and the append-only log holds P3a's row first.
     expect(w.afterP3b.market.tick).toBe(w.afterP3a.market.tick) // route premise: no tick between P3a and P3b
     expect(p3Rows.map((row) => row.productionId)).toEqual([w.p3a, w.p3b])
     for (const row of p3Rows) expect(row.week).toBe(w.afterP3a.market.tick)
diff --git a/tests/p14b10-save-v44.test.ts b/tests/p14b10-save-v44.test.ts
index 71f1d83..c18966f 100644
--- a/tests/p14b10-save-v44.test.ts
+++ b/tests/p14b10-save-v44.test.ts
@@ -267,10 +267,12 @@ describe('save-v44: the validator rejects forged romance', () => {
   })
 
   it('rejects bonds out of order (a later formedWeek before an earlier one)', () => {
-    // 1358-F4 item 4: r4's endedWeek 150 lay past the week-130 save, so a validator could refuse the
-    // week before it reached the order. Week 120 sits inside the recording interval.
+    // 1358-C6 (the coordinator's ruling on 1358-C5's first uncertain item, after 1358-F4 item 4): endedWeek 101
+    // is edge 0's lastEventWeek. A touch writes the ending and moves lastEventWeek, so a valid state keeps
+    // endedWeek <= lastEventWeek. 101 also sits at or after the bond's formedWeek (100) and inside the week-130
+    // save's recording interval, so the order of the two bonds is the leaf's only defect.
     const env = withFirstEdge((e) => {
-      e.romance = { value: 80, anchorWeek: 100, bonds: [{ formedWeek: 100, endedWeek: 120 }, { formedWeek: 50, endedWeek: null }] }
+      e.romance = { value: 80, anchorWeek: 100, bonds: [{ formedWeek: 100, endedWeek: 101 }, { formedWeek: 50, endedWeek: null }] }
     })
     expect(() => mods().validateSaveV44(env)).toThrow(/romance|bond|order/i)
   })
```

## Expected first messages for the changed leaves

| Leaf | Expected at the next run | Basis |
|---|---|---|
| save-v44 :269 "rejects bonds out of order" | `AssertionError: expected [Function] to throw error matching /romance\|bond\|order/i but got 'mods(...).validateSaveV44 is not a fu…'` | X3 observed it at r5. Nothing reads the staged week before the missing validator throws. |
| Bridge :351 own picture in production (renamed) | `TypeError: Cannot read properties of undefined (reading 'find')` | Derived by reading. The premises read only the captured state, and slice A's rows have no `labels`. |
| Bridge :316 genuine cohort, three released pictures (runs the spied build) | `TypeError: undefined is not iterable (cannot read property Symbol(Symbol.iterator))` | X3 observed it at r5. The spy returns every tick result unchanged. |
| Bridge :331 rival picture not yet public | `TypeError: Cannot read properties of undefined (reading 'some')` | X3 observed it at r5. The leaf's lines are unchanged. |
| competitions-log :211 P3a/P3b (comment only) | `TypeError: Cannot read properties of undefined (reading 'filter')` | X3 observed it at r5. |

## Expected results at the next run

- **Tests.** The same as X3: 86 failed and 59 passed of 145, with the same split per file.
- **Root type gate.** The same 17 errors at r5's positions, because r6 touches neither the romance file nor the labels file:
  - TS2305 ×10: labels (47,10) and (48,10); romance (91,3), (91,24), (91,48), (91,77), (92,3), (92,27), (93,47) and (93,81);
  - TS2353 ×5: romance (618,90), (636,90), (655,92), (656,91) and (667,126);
  - TS2578 ×2: romance (676,7) and (678,7).
- **Bridge and UI gates.** Each should exit 0. The new Bridge code uses only `vi`, the tick module namespace and `structuredClone`, as the house tick-spy test does.

## Classification

- The file holds 97 rows, each with `x3Observed` (X3's status and first message at r5).
- `expectedX3` keeps its name, so `check-x3.py` reads r6 unchanged. In r6 it holds the outcome expected at the next run.
- Five rows carry an `r6Change`; the other 92 read "None.".
- 96 rows rest on X3's observation. One rests on reading alone: the restaged own-picture leaf.
- The re-formation row now records X3's printed first message:
  - X3 printed: `expected [ { formedWeek: 100, endedWeek: 300 } ] to deeply equal [ { formedWeek: 100, …(1) }, …(1) ]`;
  - r5 declared: `expected [ Array(1) ] …`.
- The own-picture row records its rename from r5's identity.

## Uncertain items

1. **The capture's timing.** The capture assumes the route records the third picture's first take before the tick that releases it. The cohort helper's `release()` expects exactly one take for each released picture. If the take and the release ever fell in one tick, the leaf's take premise would fail by name.
2. **The capture's caller.** Only the first `mentorCohort()` call in the file sets the capture. The restaged leaf asserts the capture exists, so a run that skipped the build would fail by name rather than pass.

## Hard rules

- I wrote nothing into the real repo, its index or its stash, and nothing under a link.
- The r6 edits live in the scratch tree `/Users/zacheryspector/studio-scratch/1358-r2/tree-r4`, committed as tag `slice-b-r6` (6f836ff). The patch is `git diff base slice-b-r6`.
- r6 edits no production source.
