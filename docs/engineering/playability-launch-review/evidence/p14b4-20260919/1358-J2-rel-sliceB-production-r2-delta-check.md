# 1358-J2: delta check of slice B production r2

**CONFIRMED.** Step 1 r2 adds the two rules from F8 ruling 2 and nothing else. Steps 2-4 r2 differ from the first delivery only by that change. The three new r8 rows pass from step 1 by reading, and no other row changes outcome.

I checked this on 2026-10-02 at 02:17 CDT, at HEAD `bc2f6007`.
- **Inputs:** every sha256 matches.
  - step1-r2 `95d5a5d9…a9a0`, step2-r2 `eaa026e2…dd08`, step3-r2 `510c361b…8c1f`, step4-r2 `2004b500…c96f`.
  - r8 patch `ef7c456a…998e`, r8 classification `90491c5c…2f7c`.
- **Scratch tree:** `/Users/zacheryspector/studio-scratch/1358-j/tree`.
  - I applied r8's test hunks to base as `red-r8` (0d719a5).
  - I applied each r2 patch to red-r8: `step1-r2` 616a822, `step2-r2` 5c67be7, `step3-r2` f2b0f64, `step4-r2` 7d9d2da.
  - Each r2 patch also passes `git apply --check` on red-r6, red-r5 and base.
- **What I ran:** no new script, only inline python that prints. No node, vitest, tsc, tsx or vite-node, and nothing touched the repo index.

## 1. Step 1 r2 adds the two rules and nothing else

- **Scope of the change.** `git diff step1 step1-r2` over src, bridge, generated, scripts, ui and the package files touches only src/core/relationships.ts (+17/-2). Line numbers below are at step1-r2:
  - the doc comment (:528-530);
  - the `openBonds` map (:577);
  - the anchor read (:647);
  - the two rules.
- **Rule a** (:658-663). Inside the open-bond branch, after the "only the last bond" refusal, `formed > anchor` refuses at :661: "…bonds[j] is open but forms after …romance.anchorWeek: an open bond forms at or before the track's anchor".
- **Rule b** (:668-675). After the bond loop, a track with an open bond registers both of its people. A second registration refuses at the later edge, at :673: "…romance: <person> holds an open romance bond on relationship-edge-<k> and on relationship-edge-<i>; a person holds at most one".
  - The id `relationship-edge-${i}` (:670) always equals the row's `edgeId`, because the ordinal id rule refuses any other. That rule sits at HEAD :567, step1-r2 :582, and step3-r2/step4-r2 :716.
  - `a` and `b` are the edge's two people (:583-584). The bond loop declares its own `const b` (:653), which shadows the person only inside the loop.
- **Reach.** Both rules sit after `if (era !== 44) continue` (:616), so eras 31 and 42 are untouched.
  - Only `validateSaveV44` calls the root at era 44 (src/core/save.ts:10768 at step 4).
  - tick.ts and actions.ts call no save validator, so engine paths never meet the rules.
- **Types, by reading.** `anchor` is a number from `recordedWeek` and is read at :661. `open` is both assigned and read. `edgeId` and `openBonds` are read. Nothing is left unused.

## 2. Steps 2-4 r2 change only by the rebase

- **Diffs.** I stripped index lines and hunk offsets before comparing.
  - For k = 2, 3 and 4, `git diff stepk stepk-r2` equals the step-1 delta, context lines included.
  - Each increment from step(k-1)-r2 to stepk-r2 equals the same increment in the first delivery.
- **Blobs.** At every step, src/core/relationships.ts is the only production path whose blob differs. Each r2 patch is exactly 1,098 bytes longer than its first-delivery version.
- **Step 4's Bridge and generated files keep their first-delivery blobs:**

| File | Blob |
|---|---|
| bridge/relationships.ts | 5197ffd4 |
| bridge/runtime-checkpoint.ts | 0df9e365 |
| bridge/schema/bridge-schema.ts | 3007ee5e |
| bridge/finance-upcoming.ts | be472f83 |
| schema JSON | d753895d |
| generated C# | a155677b |
| contract manifest | 6e9ec515 |

  The identities in 1358-J finding 10 still hold.

## 3. Lawful states pass both rules; only the new rows change

- **Steps 1 and 2.** No engine path writes romance yet, so every lawful track is null and both rules hold trivially.
- **Rule a, from step 3** (relationships.ts lines):
  - formation writes `formedWeek` and `anchorWeek` at the same write week (:403-404);
  - every later romance write moves the anchor to its own, later week (:404);
  - `recordEnding` (:269-276) and `thirdPartyBond`'s write-back (:375-379) never change the anchor.
- **Rule b, from step 3.** A bond forms only when `gains` holds (:402), and `gains` requires `!thirdPartyBond(...)` (:398).
  - That scan first records every third-party bond whose derived ending has arrived (:375-379).
  - It returns true if any third-party bond is still open (:380).
  - So at formation neither person holds another stored open bond, and no later write can open a second one.
- **Existing rows.** The RED sends romance through the validator only in tests/p14b10-save-v44.test.ts.
  - The earlier forged leaves keep their first refusals: value (:260, :265), order (:275), two open bonds (:282).
  - The accepted shapes stay lawful under both rules: :289 forms at week 100 with anchor 100, and :296 holds no open bond.
  - The downgrade leaf (:355, formed 10, anchor 10) passes validation and still refuses by name.
  - The romance, Bridge, labels, log and p14b5 files stage romance through `advanceRelationshipsWeek`, `withEdges` or `withRoot`, never through a validator.
  - The classification shows no status change for any of the 97 earlier rows.
- **New rows, from step 1 by reading** (save-v44 file lines):
  - **Row 41** (:302-308). Edge 0's track is {value 80, anchor 100, open bond formed at 101}. It passes every earlier check and refuses at rule a (:661). The message contains "romance", "bond" and "anchor".
  - **Row 42** (:316-323). Edges 0 and 1 each get a lawful bond, formed and anchored at their own lastEventWeek, so rule a passes. Edge 1 then refuses at rule b (:673), naming the shared person, relationship-edge-0 and relationship-edge-1. The message matches /romance|bond|open/i.
  - **Row 43** (:325-332). Edges 0 and 5 share no person, so rule b registers four distinct people and `validateSaveV44` returns.
  - At RED, all three rows fail on the missing export, as the classification states.
- **The r8 anchor assertion** (tests/p14b10-romance.test.ts:321, row 79) holds from step 3.
  - The release at week+1 gains, because the pair is CloseFriends and no third-party edge is staged. `writeRomance` therefore writes `anchorWeek: week + 1` (:404).
  - At steps 1-2 the leaf still fails earlier, at the value assertion (:319).
- **Limit.** I did not read the fixture.
  - The person facts for edges 0, 1 and 5 come from r8's classification notes.
  - The leaves guard those facts with `assert.ok` (:319-320, :328-329), so a wrong premise fails loudly rather than passing.

## 4. Post-image blobs of the files step 1 touches

| File | step1-r2 | step2-r2 | step3-r2 | step4-r2 |
|---|---|---|---|---|
| src/core/index.ts | 33bde0420f1d | 2c8e93b52cf6 | 561c200a4dcf | 561c200a4dcf |
| src/core/relationships.ts | 72b02edb63dd | 56982db95535 | 77b60749a5d6 | 77b60749a5d6 |
| src/core/save.ts | 818cc73f9692 | 818cc73f9692 | 818cc73f9692 | 818cc73f9692 |
| src/core/types.ts | fb1dee30818a | fb1dee30818a | fb1dee30818a | fb1dee30818a |

Compared with 1358-J's table, only relationships.ts moves. Every blob matches 1358-E2's table.

## For X5: r8 renumbers the rows

- **The shift.** r8 inserts rows 41-43, so every r6 row from 41 on moves up by three.
  - The "rows 56-58" in 1358-J and F8 ruling 6 are rows 59-61 under r8.
  - The step lists in 1358-E and 1358-J shift the same way.
- **Controls under r8:** 0, 1, 2, 4, 9, 10, 51, 56, 58, 77, 90, 91, 96 and 99.
- **Step 1 greens.** Rows 41-43 join the rows that turn green at step 1.
- **Where the rules sit in relationships.ts:** :661 and :673 at step1-r2; :795 and :807 at step3-r2 and step4-r2.
