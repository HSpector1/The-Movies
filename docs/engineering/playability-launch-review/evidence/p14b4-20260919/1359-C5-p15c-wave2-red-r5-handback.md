# 1359-C5 handback: P15C Wave 2 RED r5 (answers 1359-F4)

**Status: staged, not run.** r5 sets the budgets 1359-F4 ruled, drops "PROVISIONAL" from the budget names and messages, and records the 1359-X2 measurement and the F4 rule in the budget comments. It is test-only, one commit on `main`. I ran no vitest and no tsc: the heavy lane is busy, and constants and comments need no run (1359-D4 checks r5 by reading).

| Branch (scratch tree `studio-scratch/1359-red/tree`) | Head | Holds |
|---|---|---|
| `main` | c0bc087 | RED r5: r4 (400e10b) plus one commit |
| `ref-1359-r4` | ad81d6d | rebuilt on r5: the reference r2 and r3 commits cherry-picked onto c0bc087; src unchanged |
| `sibling-1359` | 8faf9af | rebased onto r5, plus one rename commit (sibling r2, below) |

`main` is checked out and the tree is clean.

## Changes

| Item (1359-F4) | Change | Commit |
|---|---|---|
| The numbers | `ROUTE_MS` 90,000; `EXTENSION_MS` 90,000; `POST_FREEZE_MS` = `ROUTE_MS + EXTENSION_MS` = 180,000; `FIXTURE_MS` 120,000; `GUARD_BUDGET_MS` stays 300,000 | c0bc087 |
| Names and messages lose "PROVISIONAL" | `PROVISIONAL_` dropped from the five constant names, mechanically, everywhere they appear; the four assertion messages drop the word | c0bc087 |
| Budget comments | `tests/helpers/p15c2-legacy.ts:24-43` and the Wave R header (:77-84) record the 1359-X2 measurement and the rule, citing 1359-X2 and 1359-F4; the integration header's one budget line (:69) cites both | c0bc087 |
| Classification | `provisionalBudget` renamed to `budget` and its values follow the new names (below) | file |
| No in-loop ceiling | none added | none |
| Reference | unchanged: no renamed name appears in `src` | none |

## r5 diff summary (`git diff 400e10b c0bc087`; line numbers are r5's)

**`tests/helpers/p15c2-legacy.ts`** (4 hunks, +20/-10):
- :4, header comment: "PROVISIONAL budgets" becomes "budgets".
- :27-43, the budget block. The comment drops "Every number below is PROVISIONAL and unmeasured…" and gains the record: measured by 1359-X2 on a quiet lane under Node v22.23.2, set by 1359-F4; the rule, about six times the slowest single-file time of the class, rounded up (full-suite load about four times, after 1353-F3; the pinned Node v20.20.2 about 1.4 times, after 1344-J3 item 9). Each constant gets a comment line with its slowest measured leaf:
  - :33-35: `ROUTE_MS = 90_000`, after the control's 9,095 ms (route build 3,111.5 + 5,563.7) and about 13.4 s for a route leaf run alone (`legacy-determinism`);
  - :36-37: `EXTENSION_MS = 90_000`, after `extension520Ms` 13,707.6 ms;
  - :38-40: `POST_FREEZE_MS = ROUTE_MS + EXTENSION_MS` (180,000), after `legacy-adapter-only-at-boundary` 13,879 ms with the route memoized, about 23 s alone;
  - :41-43: `FIXTURE_MS = 120_000`, after `legacy-migration-empty-root-genuine-save38` 17,259 ms.
- :45, `budgeted`'s doc comment: "its PROVISIONAL budget" becomes "its budget".
- :51, the failure message: `` `elapsed ${…} ms against the ${budgetMs} ms budget` ``.

**`tests/p15c-wave-r-retention.test.ts`** (3 hunks, +6/-4):
- :81-84, the BUDGET note: `GUARD_BUDGET_MS`, 300 s, with the first guard's single-file times (67.3 s at RED and 74.0 s at the reference, 1359-X; 51,084 ms and 51,550 ms, 1359-X2 on Node v22.23.2) and both 1353-F3 measurements below it. The rule: 1359-F3 keeps 300 s, and 1359-F4 sets it.
- :104: `const GUARD_BUDGET_MS = 300_000 // 1359-F2 item 2; 1359-F4: see BUDGET in the header`.
- :112-113: the message `` `elapsed ${…} ms against the ${GUARD_BUDGET_MS} ms budget` `` and `.toBeLessThanOrEqual(GUARD_BUDGET_MS)`.

**`tests/p15c2-campaign-legacy-integration.test.ts`** (72 hunks, 77 lines replaced one for one; no line moved). A script checked that 74 of the 77 differ from r4 only by `s/PROVISIONAL_(ROUTE_MS|EXTENSION_MS|POST_FREEZE_MS|FIXTURE_MS)/\1/`:
- :69, header: "BUDGETS: self-timed (1359-F2 item 2), measured by 1359-X2 and set by 1359-F4; see tests/helpers/p15c2-legacy.ts."
- :123-126, the import list: `EXTENSION_MS`, `FIXTURE_MS`, `POST_FREEZE_MS`, `ROUTE_MS`. They keep r4's positions, so the list is no longer alphabetical there.
- :366, the control's route-build assertion: message "route L build against its budget", name `ROUTE_MS`.
- :780, B6's extension assertion: message "the 520-tick extension against its budget", name `EXTENSION_MS`.
- `ROUTE_MS` (18 lines; `budgeted(…` and the `it` timeout of 9 leaves): 338, 367, 431, 443, 664, 693, 695, 722, 783, 793, 795, 803, 849, 859, 861, 868, 1075, 1083.
- `POST_FREEZE_MS` (6 lines, 3 leaves): 748, 764, 766, 781, 1001, 1021.
- `FIXTURE_MS` (46 lines, 23 leaves): 369, 380, 387, 397, 399, 429, 445, 512, 514, 528, 530, 555, 557, 569, 571, 624, 626, 645, 647, 657, 724, 746, 819, 835, 837, 847, 870, 878, 880, 910, 914, 925, 927, 934, 936, 947, 949, 978, 980, 999, 1023, 1073, 1090, 1135, 1137, 1164.

`grep PROVISIONAL` finds nothing in the r5 patch or the r5 classification.

## Classification (`1359-p15c-wave2-red-r5-classification.json`)

- **I renamed the field `provisionalBudget` to `budget`.** I judge that clearer: after 1359-F4 the field names set, measured budgets, and "provisional" would misdescribe every value.
- **Values follow the new names.** `FIXTURE_MS` 23, `ROUTE_MS` 9, `GUARD_BUDGET_MS` 7, `POST_FREEZE_MS` 3. Two rows keep r4's empty values: `legacy-root-fresh` (`""`) and `legacy-law-settled-week-null-authored-only` (`null`).
- **Nine `expectedFailureToday` texts drop the word.** In the 2 controls, "against a PROVISIONAL budget (1359-F2 item 2)" becomes "against its budget (1359-F2 item 2; 1359-F4)". In the 7 Wave R guards, `PROVISIONAL_GUARD_BUDGET_MS` becomes `GUARD_BUDGET_MS`, citing 1359-F4.
- **Nothing else changed.** 44 rows, in r4's order, with 9 controls and 3 fixture-pending. A script matched each row's `budget` to the constant its leaf passes to `budgeted` in r5: 44 of 44.

## Reference and sibling

- **Reference: unchanged.** No renamed name appears in `src`. I rebuilt `ref-1359-r4` on r5 by cherry-pick (912b65e and 7d2156b became a855865 and ad81d6d). `git diff main..ref-1359-r4 -- src` still hashes to 733d1f84…, the staged `reference/1359-reference-r3.patch`, so no new reference patch exists. The r4-based head 7d2156b stays in the reflog.
- **Sibling: r2, forced by the rename.** `tests/p15c2-campaign-legacy-sibling.test.ts` imports `PROVISIONAL_FIXTURE_MS` and `PROVISIONAL_ROUTE_MS` from the helper. Without a change, its five leaves would import names r5 no longer exports. `1359-p15c-wave2-sibling-r2.patch` makes the same mechanical rename on 12 lines: the imports at :33-34; `ROUTE_MS` at 50, 68, 70, 83, 85, 98, 100, 110; `FIXTURE_MS` at 112, 124. Nothing else changed.

## Checks

- **Patches reproduce the branches** (scratch tree, temporary index):
  - `ad4aaa8` plus the r5 patch gives `main`'s tree 4badf81f;
  - adding the reference r3 patch gives `ref-1359-r4`'s tree ca42b6a0;
  - `main` plus the sibling r2 patch gives `sibling-1359`'s tree 3b3f913e.
- **Real HEAD, read-only.** `GIT_INDEX_FILE=<tmp> git read-tree 4947f231 && GIT_INDEX_FILE=<tmp> git apply --check --cached <patch>` passes for the r5 patch, the sibling r2 patch and the reference r3 patch. Each check used a fresh temporary index in my session scratchpad, deleted after.
  - HEAD has since moved to 954a373e (7c1d1fe7 docs; 954a373e changes four p14b test files, none of them imported by this RED). All three patches pass the same check there.
  - Neither HEAD changes `src`, `generated` or `bridge` since the base 1063ab4f.

## Hashes (sha256)

| File | sha256 |
|---|---|
| `1359-p15c-wave2-red-r5.patch` (`git diff ad4aaa8..main`, 5 files under `tests/`) | 1867b718d4fb769c15681d93ffdfb44f42915d9c727bfef65975cb78aa337206 |
| `1359-p15c-wave2-red-r5-classification.json` | 920063b77c25b583682e0c3d33a270cc48db1b2bf242cc54d8bcaeabc612cb9a |
| `1359-p15c-wave2-sibling-r2.patch` (`git diff main..sibling-1359`) | d703e29ca9189bb06bad39985c991f99a73632f9c6feeb5549d886c0354b97f8 |
| `reference/1359-reference-r3.patch`, unchanged | 733d1f84d363a8c9926444d282a5b82b67a5b48acc8de56ab6b0a67977dbf713 |
| `1359-P-p15c2-route-l-producer-r4.ts`, unchanged | 78c1d1055973dfd98479f511140d9ec44978639b83ae27e6389ffb55ada35186 |

## Outside the brief

1. The sibling r2 patch and the `sibling-1359` rebase, forced by the rename (above).
2. `ref-1359-r4` moved from the r4 base to r5. The r4 state 1359-X2 measured stays reproducible from the staged r4 and reference r3 patches (tree 35874fa3).
3. The apply checks also covered the sibling and reference patches, and also ran at the current HEAD 954a373e.

## Notes for 1359-D4

1. **The `it` timeouts moved with the names.** Each budgeted leaf passes its constant to `budgeted` and as the `it` timeout, so the timeouts fall to the new values too. On these synchronous bodies the timeout cannot fire (1359-D item 2), so nothing changes at run time.
2. **The Wave R guard against F4's rule.** Six times the slowest 1359-X2 guard time (51,550 ms) is about 309 s, and six times 1359-X's 74.0 s is about 444 s. The guard stays at 300 s, as 1359-F3 and 1359-F4 rule. I record it here and changed nothing.
