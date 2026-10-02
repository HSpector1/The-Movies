# 1348-L: relationship slice A landed (D-1312-1 conflict evidence, Mentor, rules version 2)

| Step | Commit | Evidence |
|---|---|---|
| RED r5 tests (1348-C5; review 1348-D3; 1348-F3, 1348-F5), applied with `git apply --index` from the staged patch (sha256 34c5be75…) | 954a373e | [1348-X6](1348-X6-rel-sliceA-dry-run-post-sweep.md) |
| Recorded RED at 954a373e (attempt 2) | f2663f6f | [txt](1348-slicea-red-recorded.txt), [json](1348-slicea-red-recorded.json), [patch](1348-slicea-red-recorded.patch), pre/postflight: **30 failed, 62 passed (92)**, `fixedSource` true, `allGuardsExact` true, Node v20.20.2 |
| Production step 1 (1348-E; review 1348-J KEEP; 1348-F4) | 11693bff | staged step 1 (a5896456…) |
| Step 2 | 442105f4 | staged step 2 (881989a4…) |
| Step 3 | c208d214 | staged step 3 (80540869…) |
| Recorded GREEN at c208d214 | (this record) | [txt](1348-slicea-green-recorded.txt), [json](1348-slicea-green-recorded.json), [patch](1348-slicea-green-recorded.patch), pre/postflight: **89 passed, 3 failed (92)**, `fixedSource` true, `allGuardsExact` true, Node v20.20.2 |

## How the steps landed

- **The commits.** Each staged step patch is cumulative over r5. The landing script reversed the previous step's
  patch and applied the next, so each commit holds one step's increment (`/Users/zacheryspector/studio-scratch/1348-land/land-sliceA-green.sh`).
- **Equal to the dry-run tree.** The five changed `src` files at c208d214 equal the 1348-X6 step 3 tree blob for blob:
  - `index.ts` 0e6cfa3b;
  - `professionTransitions.ts` 5cd61416;
  - `relationshipLabels.ts` aacec77b;
  - `relationships.ts` 8a8f5269;
  - `talentMarket.ts` f572d051.
- **Pushed before each recorded run,** so HEAD equaled the remote at both preflights.

## The recorded runs

- **The four files.** `p14b10-conflict-evidence`, `p14b10-mentor-label`, `p14b5-relationships` and
  `p14b5-t-failure-tuning`, run by `node_modules/.bin/vitest run --project core`, alone in the heavy lane.
- **RED.** The 30 failing identities equal 1348-X6's: the 27 slice A RED leaves and the three row 6 exceptions of
  [1344-F6](1344-F6-parent-ruling-declared-exceptions.md).
- **GREEN.** The 3 failing identities are exactly those three exceptions in `tests/p14b5-relationships.test.ts`
  (family 2 ×2, family 5 ×1), with the frame `rivalWorld` :397:53. Every slice A leaf passes.
- **Attempt 1 of the RED was void.** The script committed r5 (954a373e) and pushed it. The recorder then refused the
  stem `1348-sliceA-red-recorded`, because the name must match `^\d{3,4}[a-z0-9-]*$`
  (`run-bounded-source-c2.mjs:11`). The guard's preflight had already run. Its orphan preflight and the attempt's log
  are kept in `/Users/zacheryspector/studio-scratch/1348-land/void-attempt1/`. Attempt 2 recorded the same commit
  under a lowercase stem. Both landing scripts now check the stem before they start.

## Type gates at c208d214 ([1348-L-type-gates.txt](1348-L-type-gates.txt))

Root, UI and Bridge each exit 0.

## Status: CLOSED

- **Broad gates.** [1348-M](1348-M-rel-sliceA-recorded-broad-gates.md) ran them at bc2f6007, whose source equals
  c208d214's. Core reproduces 1344-I3's 85 failures exactly (SAME 85), and UI reproduces 1344-I4's three numpy rows.
  Slice A's two new files pass.
- **Natural routes.** [1348-X7](1348-X7-rel-sliceA-natural-routes.md) ran §7's four 520-week routes at HEAD. Every
  output file equals the §7 candidate's, so slice A moves none of them.
- **Follow-ups.** The stale describe title (1348-F5 item 3) rides with slice B's RED, which renames it.
- **The three row 6 leaves** stay failing as 1344-F6 declared exceptions. 1344-K lists them for the Owner.
