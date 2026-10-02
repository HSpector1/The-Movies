# 1360-F3: parent response to 1360-D2

[1360-D2](1360-D2-p15-wave2-landing-recheck.md) rechecked [1360-F2](1360-F2-parent-response-to-1360-D.md) and
`recorded-p15-v2.sh`.
- **Verdict.** PROCEED to step 8 once step 7 passes its blob check.
- **Closed items.** 1360-F2 closes 1360-D's two required items, and v2 closes finding 3.
- **The five notes** are low, and none blocks step 8.

The parent ran steps 8 to 10 after the recheck ([1360-L](1360-L-p15-wave2-red-landing.md)). These rulings settle the
five notes. Each amends 1360-F2 where it names a ruling.

## Rulings

1. **P15C's fallback re-pins every reader of the route L captures** (note 1; amends 1360-F2 ruling 1).
   - **Who reads them.** Every reader goes through `belowStepCaptures` and `captureAt` in
     `tests/helpers/p15c2-legacy.ts:237-271`. Those read `CAPTURE_DIRECTORY` from `tests/helpers/p15c2-route-l.ts:41`.
     The readers are:
     - C2-C4 at RED;
     - C3b in the sibling test `tests/p15c2-campaign-legacy-sibling.test.ts`, once it lands
       (`1359-p15c-wave2-sibling-r2.patch:91-92`).
   - **What the fallback does.** It moves that one constant, mints again, and re-pins every reader that exists at the
     time.
2. **The 1357-Q1 case carries two more steps** (note 2; amends 1360-F2 ruling 2).
   - **The commit before the re-mint removes the committed fixture directories.** Both producers refuse an existing
     output directory (1355-P r3 :64-65; 1359-P r4 :59).
   - **K3's baseline moves with the pins.** G2's control then runs on an archive of the new last writer below Save45,
     not of e4be3e5c (1355-F4:41; 1360-F2 ruling 6).
3. **What matches 1360-X, for load errors** (note 3; amends 1360-F2 ruling 4).
   - The exception covers any leaf whose first message is a Vite load error ("Failed to load url …"). Such a leaf matches
     when its message differs only in the importing file's absolute path.
   - The counts in 1360-F2, two for 1355 and thirteen for 1356, describe this landing and set no limit.
4. **The step 7 blob check ran by hand before step 8** (note 4).
   - **What it found at 6044ad4f:**
     - `tests/helpers/p15-roots.ts` at 2f2acc5f…;
     - `tests/p15c2-campaign-legacy-integration.test.ts` at 80694a20…;
     - `tests/helpers/p15c2-route-l.ts` present;
     - the producer r4 in HEAD's tree and equal to it.
   - **Step 10's HEAD, 840cf1c7,** adds only the route L fixtures and the mint's outputs to that tree. v2's checks for
     a clean tree and HEAD equal to the remote held there.
   - **The landing is done,** so the parent leaves v2 unchanged. A later recorded script that runs a mint carries the
     check.
5. **A production commit is a commit that changes `src/`** (note 5; amends 1360-F2 ruling 2).
   - Commits that change only tests, fixtures, docs, scripts or `ui/` may land before Save45. They do not move the Save44
     writer that the captures and pins come from.
   - A test-helper change that alters a producer's route still needs its own review, as every test change does.
