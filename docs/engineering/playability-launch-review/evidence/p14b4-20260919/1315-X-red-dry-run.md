# 1315-X: parent scratch dry run of the staged casting-driver RED

Scratch only. The parent archived HEAD 2f669293 (`src`, `bridge`, `ui`, `generated`, `scripts`, configs and `tests/`
without fixture payloads), added `tests/fixtures/bridge-contract-union-fixtures.ts` and the 1314 fixture directory, and
copied the five unmodified 1315-C files into `tests/`. Tree A is that archive; tree B is the same archive with the
parent's scratch Save42 production draft applied ([1315-X-production-draft.patch](1315-X-production-draft.patch),
6 files, +277/−29). Each tree ran `vitest run` on the five files once.

| Tree | Result | Log |
| --- | --- | --- |
| A, unchanged engine | 25 failed, 5 passed, 1 skipped | [1315-X-red-dry-run-head.txt](1315-X-red-dry-run-head.txt) |
| B, Save42 draft | 17 failed, 13 passed, 1 skipped | [1315-X-red-dry-run-draft.txt](1315-X-red-dry-run-draft.txt) |

## What tree B shows

Every Save42 leaf passes on the draft: the genuine V41 inputs migrate by adding zero counters only, the released input
is not retro-minted, 42→41 is byte-lossless without competitions, a Save42 greenlight on the migrated acknowledged
input mints the three slate pairs and 42→41 then refuses by name, `LIVE_SAVE_VERSION` is 42 and the dispatcher names
"1 through 42". The queue-admission leaf passes on B and fails on A for its stated reason (`expected [] to have a
length of 1`). The 17 failures on B are the four premise defects below; none is a law or draft defect.

## Test premise defects (measured)

1. **Cash runs out in the chained competition world.** `castingCompetitionWorld()` greenlights five times, and a cancel
   refunds nothing. Cash before each greenlight (tree B, probe copy of the file): concept 0 at week 10, 17,557,036;
   concept 1 at week 12, 12,797,806; concept 2 at week 14, 10,458,092; concept 3 at week 16, 6,243,551. The P3
   re-greenlight after the cancel then meets 812,344 against a 5,431,207 commitment and the solvency gate refuses it
   (`actions.ts:456`, "would leave cash at -4618864"). Because the world is memoized, all 10 leaves that read it fail.
   The house remedy is the disclosed cash bootstrap with an equal ledger entry (`tests/helpers/p14b2-fixtures.ts:15-19`,
   `fund()`), applied once after founding and named in the file header.
2. **Unmeasured seeds.** `p14b9-casting-copy.test.ts` (`r1315-copy-01`, no director in the week-0 market) and
   `p14b9-casting-readers.test.ts` (`r1315-readers-01`, two actors) fail their own market premise. The measured seed
   is `r1314-casting-01` (writer t-wri-05, director t-dir-04, craft t-cra-09, actors t-act-24, t-act-08, t-act-20,
   t-act-12; 1314-P).
3. **Expiry route signing.** `p14b9-casting-expiry.test.ts` (`r1315-expiry-01`) signs six people in one `applyActions`
   call from the week-0 list; `signContract` refuses `t-act-00` as "not currently available to sign (D-11.14)"
   (`actions.ts:2576`, which re-reads `hiringMarketIds(state)` on the evolving state). The measured route signs each
   person in its own call on `r1314-casting-01`.
4. **Frozen-reader leaf input.** The acknowledged input cannot go below V40: `migrateToV39` refuses it lawfully with
   "cannot downgrade or discard an opportunity predicate or recorded first-take subject" (rival first takes carry
   subjects by week 10). The leaf must project each frozen version only from an input that version can hold, for
   example the genuine input for V40 and V41 and a fresh `p13aGeneratedStudio` state (no take yet) for V4..V39.

## Interpretations for the review (not defects)

- The queue-admission leaf injects a queue entry built with `queueGreenlightScriptProject` and lets the real tick admit
  it (1315-C route premise 3). The review decides whether that substitute is acceptable or genuine contention is
  required; the injected state should pass the live validator before the tick either way.
- The draft's expiry note counts a counterpart only while the counterpart's committed term reaches past the expiry
  week, in addition to the `rosterAt` predicate (a future week cannot use the current-week predicate alone). The
  staged leaf signs every counterpart for 208 weeks against a 52-week lead, so it does not distinguish the two readings.
- `state.hollywood === null` with a managed casting session has no lawful route; the leaf stays skipped.
