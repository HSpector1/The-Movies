# 1358-N G5 handback: chains and masking

Group G5 of the Save44 and projection-57 pin sweep (record 1358-N). Authored 2026-10-02, finished 04:02 CDT.

## Identity

- **Worktree:** `/Users/zacheryspector/studio-scratch/1358-sweep/g5`, branch `sweep-g5`, from tag `step4` (8e02a44). Nine commits, 2b85759 to 35f6319, each "1358-N G5: ...".
- **Patch:** `patch.diff` = `git diff step4 -- tests ui`. 65,013 bytes, sha256 `47b9322ca6d06806bb5b36511d9229c84bf9cdc1a4d15ee21bfef2b3a899cffe`. 18 files, 115 insertions, 107 deletions. All 18 are this group's files; no other file changed.
- **Scope check:** `git diff --stat step4 -- . ':!tests' ':!ui/src'` prints nothing.
- **Apply check:** `git apply --check --cached` passes on repo HEAD b17e8ac2 and on scratch `step4`, each under a temporary index file in `out/g5`, deleted after. b17e8ac2 differs from 5245072a only in docs and HANDOFF.md.
- **Lists:** `classification.json` holds 115 rows and `deferred.json` 29. `build.py` and `build_deferred.py` generated them: old text comes from `step4`, new text from the post-image, and the scripts assert each census id, file, line, class and text.
- **Process:** I ran no node, vitest, tsc, tsx, vite-node or npm. I read no fixture file and no Owner save. I wrote only in the worktree (Edit tool) and under `out/g5`.

## Counts

| Class | Census certain | Edited | Census measure | Edited by reading | Deferred |
|---|---:|---:|---:|---:|---:|
| S1 | 57 | 59 (57 + 2 new) | | | |
| S2 | 14 | 14 | | | |
| S3 | 4 | 5 (4 + 1 new) | | | |
| S4 | 33 | 34 (33 + 1 new) | | | |
| S5 | | | 2 | | 2 |
| S8 | | | 4 | 1 | 4 (3 + 1 new) |
| S9 | | | 22 | 1 | 23 (21 + 2 new) |
| P5 | 1 | 1 | | | |
| **Total** | **109** | **113** | **28** | **2** | **29** |

Classification rows: 113 certain plus 2 read = 115. Deferred by deciding run: dry run 25, parent 3, M2 1.

**Post-image line shifts.** Three files gained lines, so some classification lines differ from census lines:
- `p12-starting-world`: 3 comment lines before the S9 pin; census :52 is now :55.
- `p14c3-queued-writing-proof`: 1 comment line at :27; census :27, :61, :134 and :159 are now :28, :62, :135 and :160.
- `p14p4p5-opportunities`: 3 lines in the `FutureAPI` type and 1 existence check. Census lines :35-:83 move by 3, and lines from :84 on move by 4 (for example :810 is now :814).

## Rows edited by reading (status "read")

- **N-0463, `p12-starting-world:55` (S9).**
  - **Edit:** `/cannot downgrade/` becomes `/^makeSaveV18: cannot downgrade or discard profession transition, industry retirement or entrant authority$/`, with a 3-line comment.
  - **No Save44 refusal:**
    - the founding state has no tick, and `generateWorld` writes `relationships: []` (`src/core/worldgen.ts:812`);
    - only `tick.ts` and two actions write edges, so `convertV44ToV43` has nothing to refuse (`save.ts:10789-10790`).
  - **First guard:** `makeSaveV18` (`save.ts:6523`) calls `assertFrozenBuilderRetainsHollywood`, which calls `assertProfessionHistoryDowngrade(state, "makeSaveV18")` at `save.ts:6191`. That throws at `src/core/professionHistory.ts:67`.
  - **Why that guard:** the four authored rival teams enter at week 0, and `withTalentProvenance` (`src/core/aging.ts:268-269`) records their people as entrants.
- **N-0474, `p14c2rm-writer-continuation:242` (S8).**
  - **Edit:** the bare `.toThrow()` becomes `/^validateSaveV12: save has unknown field "retirementBypass"$/`.
  - **First guard:** `validateSaveV44` runs `v12ExactKeys` on the envelope at `save.ts:10765`, before the version check (:10766). The extra top-level key reaches `v12Error` (:4151-4153, via :4172-4176).

The parent's dry run checks both.

## New rows

| Id | Site | Class | Why the census missed it |
|---|---|---|---|
| G5-new-1 | `v14-boundary-guards:321` | S3 (comment) | Listed under noEditInFiles with "update only if the author touches the block". The :322 edit touches it, and the old text (43 live, sentinel 44) would contradict the line below |
| G5-new-2 | `p14c3-cohort-transition:9` | S1 import | N-0485 covers only the `convertV44ToV43` half. All three `validateSaveV43` callers move, so the import must name `validateSaveV44`, or the file fails TS2304 and TS6133 |
| G5-new-3 | `p14r3-save-v41:122` | S1 import | Same as G5-new-2, for N-0561 (callers :224, :342) |
| G5-new-4 | `p14p4p5-opportunities:87` | S4 | `futureAPI()` asserts every `FutureAPI` member before the cast. N-0537 adds the member only. 1344 added the matching `convertV43ToV42` check (now :88) |
| G5-new-5 | `p14p3-directing-promises:361` | S9, deferred | `/director\|predicate\|promise\|discard/i` also matches the Save44 refusal ("... or discard the competitions log of ..."). A log row would pass the leaf silently, so no failure flags it |
| G5-new-6 | `p14p3-directing-promises:438` | S9, deferred | Same regex and same helper chain |
| G5-new-7 | `p14c2rm-writer-continuation:345` | S8, deferred to the parent | Bare `.toThrow()` on the live validator inside an `it.each` over corrupt authority, with no validator control in the leaf. It has the same shape as the four finding-17 leaves, which name only :218, :232, :241 and :242 |

I examined `p14c2rm:279` and filed no row: :278 asserts in the same loop that the legal envelope passes, so the refusal at :279 belongs to the tamper.

## Census rows found wrong

- **N-0454 and N-0455, `p08a-w0-studio-history:398-399` (S9).** These rows do not hold.
  - `live` is the V18 envelope `convertV17ToV18(v17)` (:386; :387 expects version 18), so `migrateToV16` and `migrateToV15` never take their saveVersion 44 branch (`save.ts:7876`, :7713).
  - There is no Save44 risk, and the rows need no edit and no measurement. Both are deferred to the parent to drop.
- **N-0485 and N-0561 are incomplete.** Each import line also needs the S1 half (G5-new-2, G5-new-3).
- **N-0528 and N-0547 (S5): the deciding run is the dry run, not M2.** At step 4, each leaf fails first on an S2 pin this group moved:
  - `p14p3:405` reads `toBe(43)` and stops before the :406 comparison;
  - `p14p4p5-opportunities` stops at the `LIVE_SAVE_VERSION` pin (now :345), before the :374 comparison.
- **The plan's note on `save.test.ts:288`.** 1358-N S3 says the bare `.toThrow()` "would pass on a Save44 shape refusal". `wellFormedSave()` is `makeSave(state)` (:248-252), so at step 4 a stamp of 44 validates and the leaf fails instead. The edit (44 to 45) is the same.
- **N-0463's guard.** The census says to "tighten to the makeSaveV18 guard the leaf names". By reading, the first `makeSaveV18` guard is the V38 entrant-authority guard. The V19 Hollywood guard (`save.ts:6194`) comes after it. See ruling item 4.

## Renamed titles (P5)

| File | Old title | New title |
|---|---|---|
| `tests/save.test.ts:453` | `rejects an unknown saveVersion 43 with the updated range, and rejects downgrading V15 to V14 (stale number corrected post-C.2b)` | `rejects an unknown saveVersion 45 with the updated range, and rejects downgrading V15 to V14 (stale number corrected post-C.2b)` |

I left older stale titles as written (1358-F9 ruling 5):
- `v14-boundary-guards:318` ("rejects unknown V42");
- `p14r3-save-v41:210` ("LIVE_SAVE_VERSION === 42") and :213 ("makeSave stamps 41");
- `save.test.ts:283` ("e.g. 42").

## X5 TS2345 sites in this group's files

X5 lists the same 15 sites at step 1 and step 4 (`E/1358-stage/x5/x5-step1-tsc.txt`, `x5-step4-tsc.txt`). Each one gets `convertV44ToV43` innermost. The other 3 of X5's 18 TS2345 errors sit in group H's helpers.

| X5 site (line, col) | Edit (post-image line) |
|---|---|
| `contracts/v14-boundary-guards:63`, 116 | N-0443 (:63) |
| `p06a-w1-release-authority:406`, 120 | N-0448 (:406) |
| `p12-starting-world:52`, 76 | N-0462 (:55) |
| `p14c2rm-writer-continuation:254`, 130 | N-0475 (:254) |
| `p14c3-cohort-transition:287`, 114 | N-0489 (:287) |
| `p14c3-dual-extensions:178`, 114 | N-0492 (:178) |
| `p14c3-offmenu-extensions:235`, 114 | N-0495 (:235) |
| `p14c3-profession-history:119`, 144 | N-0497 (:119) |
| `p14c3-promise-digest-continuity:279`, 119 | N-0514 (:279) |
| `p14p3-directing-promises:387`, 90 | N-0526 (:387) |
| `p14p3-directing-promises:693`, 91 | N-0532 (:693) |
| `p14p4p5-opportunities:810`, 106 | N-0554 (:814) |
| `p14p4p5-screenplay-status:320`, 97 | N-0559 (:320) |
| `save.test:370`, 120 | N-0572 (:370) |
| `save.test:419`, 120 | N-0574 (:419) |

Seven more S4 call sites carry no TS2345 because their input is typed `as never` or `unknown`:
- `p14c3-transitions:175` and :207;
- `p14r3-save-v41:374`;
- `p14p4p5-opportunities:330`, :378 and :398.

Each would refuse at run time with "validateSaveV43: expected version 43" (`save.ts:10717`) without the insert.

## Deferred, in short

`deferred.json` gives each row's reason and deciding run.

- **Projection chains: 7, dry run.** v14:63, p06a:406, save :370 and :419, p14p3 :387 and :693, opportunities :330.
  - None is edited, and none may be stripped (1358-F9 ruling 2). A refusal goes back to the parent.
  - Reading settles p06a:406: the route has no Hollywood, so no edge exists.
  - Reading points to a pass at v14:63 and save.test: no casting session, two ticks.
- **S9 leaves expecting an older guard.**
  - M2 decides one: `p06a:447`, through the production `migrateToV15` chain.
  - The dry run decides the rest:
    - p14c2rm:254;
    - cohort:287, dual:178, offmenu:235, profession:119;
    - transitions :175 and :207;
    - p14p3:689, opportunities:814, screenplay-status:324, p14r3:374;
    - plus G5-new-5 and G5-new-6.
- **S8: 3 rows, dry run.** p14c2rm :218 (18 cases), :232 and :241.
- **S5: 2 rows, dry run.** p14p3:402 and opportunities:374.
- **Parent: 3 rows.** N-0454, N-0455 and G5-new-7.

**Where a pass settles nothing:**
- **Bare or permissive patterns.** p14c2rm :254, :218, :232 and :241, and p14p3 :361 and :438 pass under either guard. Each needs a message probe, the 1344-X12 logging-copy method.
- **Exact patterns.** The other S9 leaves pin exact messages, so masking at those sites shows up as a dry-run failure.

## Items that need a parent ruling

1. **Drop N-0454 and N-0455.** Their input is a V18 envelope, and Save44 never enters the chain.
2. **S8 scope.** Should S8 extend to `p14c2rm:345` (G5-new-7)? It is a bare `.toThrow()` on `validateSaveV44` with no validator control, the same shape as finding 17's four leaves.
3. **Probe-only S9 sites.** Order message probes for `p14p3:361` and :438 (G5-new-5, G5-new-6) and for `p14c2rm:254`. The census has no row for :361 or :438, because neither would fail if Save44 masked it.
4. **`p12:55` exact pin.** Accept the exact pin on the V38 entrant-authority guard, or loosen it to `/^makeSaveV18: cannot downgrade/`.
   - Either form excludes the Save44 refusal.
   - The V19 Hollywood guard that the original `makeSaveV18(state)` assertion reached has been masked since V38. That is a pre-Save44 finding outside the sweep, like 1344-X12 §4.
5. **The S9 coverage chain.**
   - The 1344 S9 comments in `p14c3-cohort-transition:281-286`, `p14c3-dual-extensions:172-177` and `p14c3-offmenu-extensions:229-234` name `p14p4p5-screenplay-status:324` as the leaf that keeps the V39 guard covered.
   - That leaf runs on a live week-48 save after audition work. If the dry run shows Save44 masking it (N-0560), those three comments need another covering test.
   - Likewise, if Save44 masks `p14c3-transitions:207` (N-0524), the V37 guard loses the leaf 1344-X12 pinned to cover it.
