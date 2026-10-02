# 1358-D2: confirmation review of slice B RED r6

**CONFIRMED.** r6 applies 1358-F4 and all three 1358-F5 rulings. None of the eight findings below blocks the recorded RED. The verdict holds only if 1358-X3b shows the results in the next section.

**Scope.** I reviewed on 2026-10-02, between 00:31 and 00:57 CDT, at HEAD bc2f6007. Its `src`, `bridge`, `ui`, `generated`, `tests` and `scripts` tree ids equal 85ffc6bc's, the tree X3 measured.

What I read:
- the six records in order;
- both patches and both classifications;
- X3's JSON and `check-x3.py`;
- the cited source.

How I built the comparison tree:
- The repository is a blob-filtered partial clone, so I first confirmed that all 724 needed blobs were local.
- I built `/Users/zacheryspector/studio-scratch/1358-d2/tree` from `git archive bc2f6007 src bridge tests`, with `tests/fixtures` excluded.
- I committed it as `base` and applied each patch with `--include='tests/*'` (tags `r5` and `r6`).

What I did not do:
- I ran only python3 and read-only git. I started no node, vitest, tsc, tsx or vite-node process.
- I wrote nothing to the repository, its index, its stash or its worktree.
- I opened nothing under any `tests/fixtures`.

The object store still holds 4,172 loose and 25,372 packed objects, so nothing was fetched.

## What 1358-X3b must show

These results assume X3's setup: r6's tests applied at HEAD, with the week-284 capture in place.

| Leaf (r6 line) | Outcome and first line |
|---|---|
| competitions-log :211, P3a/P3b | Fails with `TypeError: Cannot read properties of undefined (reading 'filter')`, thrown at :216. |
| save-v44 :269, bonds out of order | Fails with `AssertionError: expected [Function] to throw error matching /romance\|bond\|order/i but got 'mods(...).validateSaveV44 is not a fu…'`. |
| Bridge :316, three released pictures | Fails with `TypeError: undefined is not iterable (cannot read property Symbol(Symbol.iterator))` at :323. This leaf runs the spied build. Its duration should sit near X3's 49,182 ms and under 240,000 ms, with no `CohortThreeFilmsBudgetExceeded`, `DataCloneError` or heap failure. |
| Bridge :331, rival picture | Fails with `TypeError: Cannot read properties of undefined (reading 'some')` at :348. |
| Bridge :351, own picture in production (new identity) | Fails with `TypeError: Cannot read properties of undefined (reading 'find')`, thrown at :371. Reaching :371 proves that the capture premise (:353) and every route premise (:358-370) held. An `AssertionError` naming a route premise voids my confirmation of ruling 2. |

X3b must also show:
- The six files total 86 failed and 59 passed of 145, with X3's split per file.
- `check-x3.py` on the r6 classification reports 97 rows, with 0 missing, 0 status mismatches and 0 message mismatches.
- The root type gate exits 2 with exactly X3's 17 errors at r5's positions.
- The Bridge gate exits 0. The root config excludes `tests/bridge*.test.ts`, so only this gate compiles the changed Bridge file.
- The UI gate exits 0.

One fact needs a check outside vitest. A python read of the week-130 V42 fixture must show `state.relationships[0].lastEventWeek` 101 and `firstSharedWeek` 8 (finding 4). No RED run can show these, because the leaf fails on the missing validator first.

## Checks

### 1. The diff: MET

- I split both patches by file. The producer hunk and the labels, romance and p14b5 sections are byte-identical in r5 and r6. Only the Bridge, competitions-log and save-v44 sections differ.
- In the scratch repo, `git diff r5 r6` equals the block printed at 1358-C6:65-212, byte for byte (146 lines).
- The post-image blobs match the patch headers:
  - Bridge eed12fc, competitions-log 8e9e98d and save-v44 c18966f (changed);
  - labels 49977c2, romance 57307b2 and p14b5 d20faf0 (unchanged).
- The p14b5 base, 1225928, is HEAD's blob.
- The producer hunk turns HEAD's 9b2b4a4 into 0e9c6ed. Its sha256 is 04713f73…, which is r4's adopted producer.
- The staged files hash as recorded:
  - r6 patch 212b7980… and r6 classification 9ee1abbc…;
  - r5 patch 3ca4e3bc… and r5 classification 5d97e741….

### 2. No regression: MET

r6 is r5 plus that diff. Every resolution outside the three changed files therefore stands byte for byte. Inside those files:
- **F4 item 1.** The rival leaf's lines are unchanged (Bridge :331-349). The own-picture leaf is restaged (:351-374) and pins more than r5's variant did (check 4).
- **F4 item 2(a).** The `financeUpcoming` leaf is unchanged (Bridge :377-400).
- **F4 items 3 and 5.** The GENUINE, chain and live-route leaves are unchanged (save-v44 :149-165 and :327-346). The GENUINE and third-party classification rows keep r5's declared outcome and message.
- **F4 item 4.** Week 120 became 101. It stays inside the recording interval and now also sits at or below edge 0's `lastEventWeek`.
- **The adopted list.**
  - Competitions-log :223-225 keep r5's equal-week assertions. Only the Save44 sentence left the comment (:220-222).
  - The Mentor wrapper still times the first build and caches its named error (Bridge :291-313).

These items are untouched, in byte-identical files:
- 1358-D blocking 2(b)-(d) (romance :548, :458-485, :530-544);
- family 6c (p14b5 :1126) and pairChemistry (romance :586);
- `BASEWORLD_BUDGET_MS` at 120,000 (romance :134);
- labels :137-154;
- notes 2-5, 9, 10 and 11.

### 3. Ruling 1, save-v44 :269-278: MET

**What the leaf builds.**
- `withFirstEdge` (:251-257) changes `relationships[0]` of `baseV44Envelope()` (:105-115).
- That envelope starts from the genuine week-130 V42 save. The bytes are pinned at `tests/p14d1-rival-shelving-fixtures.ts:55-59`, and :8-9 records the save at week 130.
- The envelope goes through the real `convertV42ToV43`, is stamped 44, and gets `competitions: []` and `romance: null` on every edge.
- The leaf stages value 80, anchor 100 and the bonds `[{100, 101}, {50, null}]` (:275).

**The three bounds.**
- Week 101 is at or after the bond's `formedWeek`, which is 100.
- Week 101 equals edge 0's `lastEventWeek` according to 1358-C5:112 and :163. I did not open the fixture (finding 4).
- The existing root law admits an edge only if its `lastEventWeek` lies between `recordingStartedWeek` and `market.tick` (`src/core/relationships.ts:547-554`, applied at :577). Edge 0's `lastEventWeek` is therefore inside the interval by construction. Weeks 50 and 100 lie between its `firstSharedWeek` (8) and 101.

**Only the order fails.**
- These rules hold:
  - The value is within 0..100.
  - Only the last bond is open.
  - Each bond ends at or after it starts.
  - The anchor (100) is at or after the open bond's start (50) and at or below `lastEventWeek`.
  - The open bond's value of 80 stays above the exit threshold through week 130, inside the 104-week grace.
- The decay law cannot produce a first bond that lasts one week. No validator can test that from stored fields, though, because later gains move the value and the anchor.
- The second bond starts at 50, before the first bond and inside its span. That is the order defect, and only an order check reaches it.

**Controls on the same edge.**
- The two accepted shapes (:287-299) stage the same anchor on edge 0, and the first also has the same value. Both expect acceptance.
- Any rule about the edge, the value or the anchor would also refuse them.
- The weeks that differ (50 and 101) satisfy every bound above.
- So a validator without an order check cannot reject this leaf by another rule unless it also fails a control.

**RED message.** Nothing reads the staged week before `validateSaveV44` throws, so X3's first message stands.

### 4. Ruling 2, the own-picture Mentor leaf: MET

**4a. Every tick of the route goes through the spied binding.**
- `cohortThreeFilms()` (`tests/helpers/p14c3-cohort-transition-fixtures.ts:214-231`) calls `cohortSetup()`, `refreshSet()`, `greenlight()` and `release()`.
- Only `step()` calls `tick` (:43), through the named import at :12.
  - `toWeek()` (:52-56) reaches it from `refreshSet()` (:121).
  - `release()` reaches it at :147.
- These helpers apply actions, migrations and save checks only, and never tick:
  - `cohortSetup()` (:163-213), `hire()` (:77-95) and `addYoung()` (:96-114);
  - `greenlightEvidence()` (`tests/helpers/p14c3-genuine-evidence-fixtures.ts:40-57`).
- No module under `src/core` imports `tick` except the re-export at `src/core/index.ts:879`.
- Vitest 2.1.9 runs these files through Vite 5.4.21's SSR transform, in `node_modules/vitest/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js`:
  - It maps the named import to a property of tick.ts's export object (:52490-52496).
  - It rewrites each use into a read of that property at call time (:52592-52613).
  - It defines each export as a configurable getter (:52462-52467).
- tinyspy 3.0.2 detects that getter form and redefines it to return the spy (`node_modules/tinyspy/dist/index.js:110`).
- So every call at :43 reaches the spy. No path calls `tick` through another module or a captured reference.
- The house test proves the mechanism with the same import form:
  - `tests/helpers/p14c3-offmenu-extension-fixtures.ts:11` imports `tick` by name and calls it at :35.
  - `tests/bridge-p14c3-dual-career-surfaces.test.ts:30-38` counts 366 spied calls.
  - 1348-E:188 records that file passing 3 of 3 with this `node_modules`.

**4b. The predicate matches the third release.**
- The route starts with no released film (helper :188) and releases its pictures one at a time (:219-223).
- A release happens only inside `tick`:
  - `src/core/operations.ts:1752-1768` admits a committed picture at the 1-to-0 edge;
  - `src/core/tick.ts:499-503` collects it;
  - :648 appends the `releasedFilms` row;
  - :652-662 appends the `filmReleased` history row;
  - :669-670 opens the theatrical run.
- `commitPictureToRelease` writes only a commitment and a `releaseCommitted` studio event (`src/core/actions.ts:2867-2882`).
- So the only tick whose input holds 2 released films and whose output holds 3 is the third release. Its input is the route's own state right after the commit.
- The first take comes earlier. `operations.ts:1680-1696` records it at the 5-to-4 advance, and `tick.ts:1134-1142` stamps it with the produced week and the player studio id. At least four advances separate the take from the release, so 1358-C6's uncertain item 1 cannot occur.
- The captured input therefore holds:
  - the picture in `activeProductions` at `remainingTicks` 1;
  - its first take, recorded at the viewer's studio;
  - no `releasedFilms` row, theatrical run or `filmReleased` row for it.
- The leaf asserts each of these as a named premise (:358-363).

**4c. The leaf tests the charter's rule.**
- It expects Mentor shown for the viewer's own unreleased picture (1347-A:105, and §6 item 8 at :156). The evidence must contain the production's concept title (:364, :373).
- The Bridge names a production by its concept title elsewhere (`bridge/finance.ts:75`, `bridge/release.ts:67`, `bridge/laboratory.ts:457`). The frozen release title is also the concept title (`tick.ts:658`). The title the leaf demands is therefore the house name.
- The leaf rejects these wrong productions:
  - A gate that withholds Mentor until release fails, whatever release record it reads, because the captured state holds none. This closes 1358-C5's uncertain item 2, where a GREEN that read the history row passed r5's variant.
  - Evidence titled only from `releasedFilms` or the release history fails at :373.
- A production with no gate at all passes this leaf, but the rival leaf catches it. Two wrong gates pass all three Mentor leaves (finding 2).

**4d. The RED message.**
- HEAD's rows carry no `labels` (`bridge/relationships.ts:216-223`), so :371 throws `TypeError: Cannot read properties of undefined (reading 'find')`.
- The premises before :371 hold at RED:
  - `mentorEvidence` reads only cohorts, first takes and the week (`src/core/relationshipLabels.ts:27-38`), and all three takes are recorded.
  - X3 observed r5's versions of the title, director-row and core-derivation premises passing on the same route.
  - The third picture has the same concept and title in both states.

**4e. Test order and caching.**
- `mentorCohort()` is the only path to `cohortThreeFilms()` in the file (Bridge :317, :332, :352). Whichever Mentor leaf runs first builds under the spy, so running a `-t` subset or a shuffled order both work.
- Each failure path fails loudly:
  - A failed build rethrows from the helper's memo (:30-35).
  - An over-budget build rethrows its cached, named error (Bridge :292, :307-311).
  - A missing capture fails by name at :353.
- The `finally` at :304 restores the spy on every path.
- Findings 5 and 6 cover two remaining risks.

### 5. Ruling 3: MET

- 1358-C6:57-61 hands both production findings to the production writer.
- Competitions-log :220-222 no longer carries the Save44 sentence.
- No leaf asserts either finding:
  - Save-v44 stages only strictly descending rows (:201-207) and never validates a log with equal weeks.
  - Competitions-log asserts equal weeks on engine rows (:223-225) and validates nothing.
  - p14b5's `stagedEdge()` (:228) and `stage()` (:235) are byte-identical to r5.
- The leaf title "rejects non-ascending weeks" follows the brief's wording. Its rows descend strictly, so the leaf agrees with the finding.

### 6. The classification: MET

- **Rows.** The file holds 97 rows in r5's order, declaring 83 failed and 14 passed. X3's 48 unclassified p14b5 leaves (45 passed, plus the 3 failed F6 exceptions) bring the run to 86 failed and 59 passed of 145.
- **Changed rows.** Five rows carry an `r6Change`: the five leaves in the table above. 96 rows rest on X3's observation, and the own-picture row rests on reading alone.
- **Against X3.** Every `x3Observed` equals X3's JSON; I matched the renamed row by `renameOldIdentity`. Every declared message equals the message X3 observed, including the printed form on the re-formation row.
- **Derivations.** The changed rows' declared outcomes and messages follow from the code (checks 3 and 4).
- **The checker today.** Run against X3's JSON, `check-x3.py` on r6's classification reports 96 matching rows and 1 missing: the renamed row, as expected before X3b.
- **Totals.** They cannot move:
  - r6 changes no outcome;
  - the root gate does not compile the Bridge file;
  - the save-v44 and competitions-log edits add no types.

## Findings

1. **Non-blocking. F5 ruling 1's first bound is stricter than the charter, and the leaf's comment states it as law.**
   - Save-v44 :270-272 says "a valid state keeps endedWeek <= lastEventWeek".
   - The charter says otherwise:
     - An ending is written "at the next write that touches the edge (or either person's formation check)" (1347-A:56).
     - The ending writes no driver (:57) and changes no closeness (:127). The formation-check path therefore cannot move the third party's `lastEventWeek`.
     - Dormancy then resumes from `max(lastEventWeek, endedWeek)` (:58). That formula only matters when `endedWeek` is the later week.
   - The RED itself contains both cases:
     - Romance :458-485 writes the (l,z) ending at the (d,l) formation, with no driver on (l,z).
     - Romance :626-631 stages `endedWeek = 900, lastEventWeek = 500` as a lawful state.
   - Week 101 satisfies both readings, so the leaf stays sound.
   - A Save44 validator built from the comment would refuse a lawful save after a third-party ending. No leaf saves such a state, so nothing would catch it.
   - **Recommendation.** Before production, hand the production writer the correct bound together with F5 ruling 3's two findings: `endedWeek` lies between its `formedWeek` and the save week, and the validator must not bound it by `lastEventWeek`. A comment-only edit at :270-272 before the RED commit is optional and changes no outcome.

2. **Non-blocking; the parent decides. The three Mentor leaves leave two wrong gates open.**
   - With r6, the leaves cover three cases:
     - own pictures, all released: Mentor shown;
     - one rival picture with no record of any kind: withheld;
     - an own picture still in production: shown.
   - **Gate keyed on ownership.** A gate that withholds Mentor whenever any picture is a rival's, released or not, passes all three. §6 item 8 shows Mentor once all three pictures are public, and no leaf stages a released rival picture.
   - **Announced counted as public.** A gate that treats an announced rival picture as public also passes all three:
     - The industry page lists rival productions by title once they are announced (`bridge/industry.ts:318`).
     - 1347-A:105 lets evidence cite only released pictures or the viewer's own.
     - The rival leaf's picture is neither announced nor released, so the leaves do not decide this case.
   - The parent can add a leaf in which a rival picture with a public release record shows Mentor. Alternatively, the GREEN review can check the gate's definition against :105 as a named item.

3. **Non-blocking. Text left over from r5.**
   - The own-picture row's `note` still says the variant leaves the title "not in releasedFilms or activeProductions". In r6 the picture sits in `activeProductions`. Its `requirement` still describes "r4's variant, kept with the expectation flipped".
   - The re-formation row's note says `formedWeek: -100`. X3 printed 100.
   - Bridge :328 says r4 withheld Mentor for the viewer's own picture, "which the charter allows". It reads as if the charter allowed the withholding.
   - The checker reads none of these fields. Correct them before the RED commit.

4. **Non-blocking. I could not verify edge 0's weeks.**
   - The leaf hardcodes week 101.
   - The other romance leaves on the same edge hardcode weeks 10 to 100, and their controls need `firstSharedWeek` to be at most 10.
   - Both values rest on 1358-C5's python read (:26, :112, :163). The hard rule kept me out of the fixture.
   - The forged-log tests derive their weeks from the edge (:191-198). The romance `withFirstEdge` (:251-257) does not.
   - The parent's python read in X3b settles the values. Deriving the romance weeks from the edge would remove the dependence entirely.

5. **Non-blocking. The spy keeps every tick's input and output until it is restored.**
   - The spy records each call's arguments and result (`node_modules/tinyspy/dist/index.js:33`, :36). `mockClear` and `mockRestore` clear them (`node_modules/@vitest/spy/dist/index.js:69-87`).
   - The build therefore keeps up to about 128 route states alive until `mockRestore()` at Bridge :304.
   - X3's build without the spy took 49.2 s against a 240 s budget. X3b's duration for the first Mentor leaf measures the extra cost.

6. **Non-blocking. The capture assumes per-file isolation.**
   - The helper memoizes per module instance (:26-35).
   - Under `--no-isolate`, a memo already warmed by another file would skip every tick. The own-picture leaf would then fail by name at :353; it would not pass.
   - `vitest.config.ts` and `vitest.workspace.ts` keep vitest's default isolation.

7. **Non-blocking. No leaf checks the full Mentor evidence.**
   - 1347-A:65 makes the evidence the three pictures.
   - The own-picture leaf checks only the third title. The all-released leaf checks only that the label exists.
   - The own-picture leaf already computes the first two titles at :366, so one more assertion would cover all three.

8. **Non-blocking; production. GREEN must move the Save43 pin in `acceptedEvidence`.**
   - The cohort route checks saves throughout (helper :93, :123, :155, :198, :210), and `acceptedEvidence` expects `saveVersion` 43 (`tests/helpers/p14c3-genuine-evidence-fixtures.ts:17-18`).
   - After Save44, all three Mentor leaves fail inside the build until the pin sweep moves that pin, as it did for 42 to 43 (1358-C2:56).
   - This belongs with F5 ruling 3's sweep finding.
