# 1361-C-sib: the five P15C sibling leaves, classified

Independent test author, read-only. I ran no node, vitest, tsc, npm, npx, tsx or vite-node.
Written Fri Oct 2 16:50 CDT 2026 (from `date`). Rows: `1361-sibling-classification.json` in this folder.
The rows keep r8's field names and add `id`, `expectedAtBr2`, `expectedMerged`, `imports` and `dependsOnC` (true only if
the merged status needs market rows or the guard's refusal). `lines` are lines of the new file (patch line minus 6).
`expectedFailureToday` and `firstMessageAtRed` describe `p15a1-b-r2` without P15C. Every status is a reading. Nothing ran.

## What I read

- The patch (131 lines, sha256 d703e29c..., the hash 1361-R Part 2.1 cites). The new file has 125 lines.
- 1361-F5 with Amendment 1; 1361-F rulings 4, 5, 9, 10 and 14; 1360-F3 ruling 1; the charter 1359-A; 1361-R
  Part 0 item 7, Part 1.3 with the sibling paragraph, Part 2.4, Part 3.5 and Q10.
- Reference r4 (adapter, freeze, validator, V44 step, tick hunk) for shape. The first r8 rows, and r8's C3 and C8 rows.
- `tests/helpers/p15c2-legacy.ts`, `p15c2-route-l.ts` and `p15-roots.ts`. Their blob ids (0606c85e, 09de4a54, 2f2acc5f)
  equal the blobs at `p15a1-b-r2` in the writer's tree. Main test lines 36-75 and 836-883.
- The writer's tree through `git show`, `ls-tree`, `rev-parse` and `log` only: p15a2-r2 and p15a1-b-r2 (b0b6fb0) in full
  for the archive, market, save and tick sources, and p15a1-a-r1 by diffstat. The p15c tags did not exist when I started.
  They appeared while I worked (p15c-a-r1 2592aea, p15c-b-r1 5a3a532, p15c-c-r1 f4612bf). I then read campaignLegacy.ts,
  save.ts and tick.ts at p15c-c-r1 and checked each merged reading against that source.
- I opened nothing under `tests/fixtures`, no save and no Owner file. The Save44 manifest, the capture week names and the
  genuine save's byte pin rest on 1360-L, r8 and the helper. No run has confirmed any merged status.

## Result

| Leaf | Lines | At b-r2 | Merged | Budget |
|---|---|---|---|---|
| B2 `legacy-freeze-is-last-allocation` | 50-68 | fail: stepFn, no `freezeCampaignLegacyWeek` | pass | ROUTE_MS 90,000 |
| B4b `legacy-ranking-at-6240-inside-live-tick` | 70-83 | fail: stepFn, no `freezeCampaignLegacyWeek` | pass | ROUTE_MS |
| C3b `legacy-migration-before-boundary-siblings-limited` | 85-98 | fail: officialOf, no campaignLegacy root | pass | ROUTE_MS |
| C8b `legacy-validate-stamp-duplicate-across-roots` | 100-110 | fail: stepFn, no `freezeCampaignLegacyWeek` | pass | ROUTE_MS |
| C10c `legacy-validate-refs-sibling-added-after-freeze` | 112-124 | fail: stepFn, no `freezeCampaignLegacyWeek` | pass | FIXTURE_MS 120,000 |

All five set `dependsOnC` false. All five join `1361-p15c-green-recorded` (ruling 14 lists the sibling test).

## What each leaf uses

- B2. Roots: powerRanking (required), p15Sequence, campaignLegacy; the loop also meets sharedMarket (empty) and
  corporateCondition (absent, skipped). It asserts that the 6240 ranking record appends in the freeze tick, that the
  official's sequence exceeds every sibling row of that tick and equals next minus 1, and that each present sibling's
  watermark equals its root's largest sequence. Helpers: stepFn, routeAt, requireRoot, sequenceOf, siblingRows, officialOf, sourceOf.
- B4b. Roots: powerRanking, campaignLegacy. It asserts that the official equals the law over the tick's facts and that
  removing the 6240 record changes the manifest. Helpers: stepFn, factsFn, routeAt, requireRoot, canon, withoutStamp,
  withRoot, officialOf. Src: `buildLegacyManifest`.
- C3b. Roots: the Save44 capture at 6239, then all four Save45 roots. It asserts that a sibling migrated at 6239 reads
  `[6239, 'limited']`. Helpers: captureAt, convertIntoStep, requireSiblings, officialOf, sourceOf. Src: `tick`.
- C8b. Roots: powerRanking, campaignLegacy. It asserts that `makeSave` refuses a ranking record forged to the official's
  sequence, with `/power ranking|p15/i`. Helpers: stepFn, routeAt(6241), requireRoot, withRoot, refuses.
- C10c. Roots: the genuine Save38 at 6240, migrated to Save45 and frozen. It asserts that each sibling root recorded from
  6240 reads `{highWatermark 0, recordedFromWeek null, notRecorded}` and that `makeSave(frozen)` stamps STEP.
  Helpers: stepFn, genuineFrozen, requireSiblings, sourceOf. Src: `makeSave`.
- Fixtures, by path pattern. C3b reads `tests/fixtures/p15/p15c2-route-l-captures/MANIFEST.json` and
  `route-l-week-<6239|6240>.json.gz` (both loaded, 6239 used). C10c reads
  `<E>/1052-c3-endurance-A-observer-fixed/authority-6240.json` (6,720,108 bytes). B2, B4b and C8b build route L in process.
- Budgets. Each body runs inside `budgeted`, and each leaf passes the same constant as its vitest timeout. None has run at
  GREEN (1361-R Part 1.3). B2, B4b and C8b share one route build, and the first of them pays it.

## Imports

The file imports `buildLegacyManifest`, `makeSave` and `tick` from src, 22 names from `helpers/p15c2-legacy.js`, `routeAt`
from `helpers/p15c2-route-l.js` and three vitest names. Every binding exists at b-r2 and on the merged candidate, so no
import fails to resolve. None needs the exported ref resolver (`legacyRefResolver`, added in p15c-b-r1). Two helper names
fail by name at b-r2 because they look up P15C exports at call time: `stepFn` (`freezeCampaignLegacyWeek`, added in
p15c-c-r1) and `factsFn` (`legacyFactsFromState`, added in p15c-b-r1). `convertIntoStep` looks up `convertV44ToV45`, which
exists since slice 2a; p15c-a-r1 adds the Legacy root inside it.

## Findings

1. No dependence on (c) or on the guard. sharedMarket holds no rows, so B2's market branch and C10c's market half hold at
   zero rows. Route L's 53 industry ticks (built once, shared by B2, B4b and C8b) and C3b's one tick pass the guard, which
   never fires. A later (c) removes b's tick write and the guard (1361-F5 Amendment 1), so re-read B2's market branch and
   C3b's `migrated` set then.
2. No conflict with ruling 4. None of the five calls a downgrade path or `DOWNGRADE_REFUSAL`. The source follows ruling 4
   anyway: the converter validates first, then refuses once, with entries in the order sharedMarket, powerRanking,
   campaignLegacy (save.ts at p15c-a-r1).
3. C3b passes through powerRanking alone. In the freeze tick b's write moves sharedMarket.recordedFromWeek to 6240, so
   sharedMarket leaves `migrated`. If a later (c) drops that write, sharedMarket returns to `migrated` and the leaf also
   asserts `[6239, 'limited']` for marketAssessments.
4. C8b passes through the Legacy validator. `validateSaveV45` runs `validateCampaignLegacy` before `validateP15Allocator`
   (save.ts at p15c-a-r1). The forged record passes the ranking validator, then item 6 refuses at source 7:
   `validateSaveV45: campaignLegacy.official.sources[7].highWatermark must equal the largest P15 sequence in its root below
   the official's`. The regexp matches through "P15". The allocator's message (`p15DomainSequence 5 is held by two P15 rows
   (duplicate)`) never runs for this forgery, so the leaf proves a refusal that names P15 and leaves the allocator's cross-root
   check untested. A reorder of the validators, or a reword of item 6 that drops "P15", changes the message. A refs-check
   refusal (`names no powerRanking row`) would miss the regexp, because "powerRanking" has no space.
5. C8b does not assert that the unforged state validates. Read its pass together with the control
   `legacy-control-late-founding-route-lawful`.
6. B4b's b-r2 message names `freezeCampaignLegacyWeek`, because `stepFn()` runs before `factsFn()`.
7. The sibling file has no recorded RED, and ruling 14 compares each recorded GREEN with its recorded RED. One run at
   `p15a1-b-r2` supplies it.
8. Under P15C's fallback (a separate step) C3b fails at its premise by name: `premise: a sibling root migrated at 6239 with the
   Legacy (a shared step)`, `expected 0 to be greater than 0`. A Save45 capture already holds the sibling roots, so none
   migrates at 6239. The fallback landing re-pins it, as 1360-F3 ruling 1 requires.
9. The shapes the leaves read match slice 2a and b-r2 as landed: powerRanking `{version, recordedFromWeek, snapshots}` with
   record keys `id`, `p15DomainSequence`, `week`; `tests/helpers/p15-roots.ts` already lists powerRanking, sharedMarket and
   campaignLegacy. The header's re-pin and key-listing duties need no edit. The header still names the r1 patch
   (`1359-p15c-wave2-sibling.patch`), which has no code consequence.

## What the dry run should check

1. `git apply --check` on p15c-c-r1. The new file's blob id should read 6e46149 (the patch's index line).
2. Run the file under the heavy lane on p15c-c-r1 and expect 5 passed. Time each leaf alone and in file order. Compare with
   ROUTE_MS and FIXTURE_MS and with 1359-F4's rule (a budget is about six times the slowest single-file time: 15 s and 20 s).
3. Print the values I derived by reading:
   - B2: since 4, ranking record sequence 4 at week 6240, official 5, next 6, powerRanking watermark 4, market root week 6240.
   - C3b: powerRanking.recordedFromWeek 6239, sharedMarket.recordedFromWeek 6240, powerRanking source `[6239, 'limited']`.
   - C8b: the refusal text in finding 4, and which validator raised it.
   - C10c: official sequence 1; powerRanking and marketAssessments sources both notRecorded.
4. Run the file at `p15a1-b-r2` with only the patch applied. Expect four leaves on the `freezeCampaignLegacyWeek` message
   and C3b on `no campaignLegacy root`.
5. Run the main file's control `legacy-control-late-founding-route-lawful` in the same session (finding 5).
6. In the writer's tree, confirm the links C3b and C10c need: `tests/fixtures/p15/p15c2-route-l-captures/` and E's
   `1052-c3-endurance-A-observer-fixed/`.
7. Add `tests/p15c2-campaign-legacy-sibling.test.ts` to the file list of `1361-p15c-green-recorded` (1359's three files and
   the sibling test) and expect 5 passes from it.
8. Run the type gate on the new file. By reading, its calls type-check against the helpers, but I ran no tsc.
