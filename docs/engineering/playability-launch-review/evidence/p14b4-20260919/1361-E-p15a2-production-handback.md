# 1361-E: P15A.2 slice 2a production handback (the Power Ranking archive; the shared Save45 step)

Role: the single production writer for P15A.2 slice 2a under 1361-F. Scope: the two new modules, the tick step, fresh
worlds, the Save45 step with `powerRanking` and `p15Sequence` above slice B's V44, the public index, and the two `src`
type-error sites. I wrote one commit in the scratch tree, read it against the landed RED, and ran no node, vitest, tsc,
npm, npx, tsx or vite-node. I edited no test and no test helper. Besides shell reading tools (cat, sed, grep, awk,
wc, shasum), I ran read-only git in the real repository, git in my own tree (commit, tag, diff, and an apply check
under a temporary index), and python that printed: two readers of the classification and a MANIFEST, and one script
that printed a transformed `save.ts` for the 40 migrator lines, which I diffed and then copied in. Every type and
behavior claim below comes from reading.

**Status: complete by reading.** All 72 classified rows map to code (table below), and by reading all 72 pass at Save45
with slice 2a alone, the two controls included. Two things stay unmeasured: the type gates (U1) and the harness time
(row 72, U3).

## Authority read

E is `docs/engineering/playability-launch-review/evidence/p14b4-20260919` in the real repository.

1. 1361-F, all 22 rulings. Rulings 1 to 9 shape this commit.
2. 1361-R Part 0, Part 1.1, Part 2 (2.1 to 2.5), Part 3.3 and 3.5 for the fallout, Part 4.1 and 4.2.
3. 1360-F ruling 1, 1360-F2 ruling 2, 1360-F3 (all five rulings).
4. 1356-A in full, with 1356-F (Amendments 1 and 2 and the later ruling), 1356-F2 to 1356-F5, and 1356-C4.
5. 1355-F2 (all items), 1355-F5 ruling 1, and 1355-F4 for the landing order and R2.
6. The oracle: `tests/p15a2-power-ranking-archive.test.ts` (A), `-isolation.test.ts` (I), `-harness.test.ts` (H) and
   `tests/helpers/p15-roots.ts` in the tree, all read in full; the r4 classification
   `E/1356-stage/1356-p15a2-wave2-red-r4-classification.json` (72 rows, 2 controls).
7. The guides: `E/1356-stage/1356-p15a2-wave2-reference.patch` in full, and
   `E/1355-stage/1355-p15a1-wave2-reference-r3.patch` lines 63-339 (the allocator check and its messages), 340-394 (the
   module rewrite and the archive hunks) and 443-608 (the merged step).
8. For the allocator messages P15A.1 and P15C will reuse: T:596-680 (the forgeries and the R1 cross-root leaf),
   `tests/helpers/p15c2-legacy.ts:270-290`, and 1359 r4 :536-560 and :735-765 (the Legacy's sequence and refs).
9. Model: `/Users/zacheryspector/studio-scratch/1358-prod/1358-E-rel-sliceB-production-handback.md`.

Under `tests/fixtures` I read only the three `tests/fixtures/p15/*/MANIFEST.json` files.

## Base and tree

- Tree: `/Users/zacheryspector/studio-scratch/1361-prod/tree`.
- `base` is `1045432824164e7101fb00ed89a25fafa1e40505`, the archive of f3fe97d0.
- `p15a2-r1` is `1f2495a2bc0c32d4a061a38f63a5f64037eed131`, one commit on `base`, `src` only.
- `src` trees: `base:src` = 762d8e09, equal to the real repository's `src` at f3fe97d0, at 1706d844 and at its HEAD
  3ebaca24 when I checked. So the patch applies to the real `src` exactly as it does to `base`.
- Apply check: `git apply --check --cached -v` of the patch on `base`, under a temporary index read from `base` in my
  tree, passed for all nine files.
- I wrote only under `src/` in the tree and nothing under a link or in the real repository.

| File | Lines | Bytes | sha256 |
|---|---:|---:|---|
| `/Users/zacheryspector/studio-scratch/1361-prod/1361-p15a2-production-r1.patch` (`git diff base p15a2-r1`) | 1,081 | 67,267 | `0b654b0313cc107bf3a5d60f134351df40a11a86b4e918be4ec4e4459038200e` |

Files, by `git diff --numstat base p15a2-r1`:

| File | + | − |
|---|---:|---:|
| `src/core/p15Phases.ts` (new) | 35 | 0 |
| `src/core/powerRankingArchive.ts` (new) | 259 | 0 |
| `src/core/save.ts` | 192 | 13 |
| `src/core/types.ts` | 27 | 1 |
| `src/core/tick.ts` | 7 | 1 |
| `src/core/worldgen.ts` | 4 | 1 |
| `src/core/index.ts` | 7 | 1 |
| `src/core/promises.ts` | 7 | 5 |
| `src/harness/roster-wall/historical-control.ts` | 13 | 4 |

## What the commit holds

Line numbers are the tree's at `p15a2-r1`. PRA is `src/core/powerRankingArchive.ts`.

**`src/core/p15Phases.ts`, r3's form (1361-F ruling 6).** `P15_PHASE_ORDER_VERSION = 1`, `P15_PHASE_TABLES` with the
v1 table in the ruled order (ordinals 1 to 4), `P15PhaseTriple`, the writer's `p15PhaseTriple(phaseId)`, the
`P15Sequence` type and `initialP15Sequence()`. No `p15PhaseMatches`. The header drops REFERENCE ONLY.

**PRA, one module (1356-A §3).**
- `studioWeeklyFixedCost` (:49-55): player 0 while founding, else payroll + overhead + facility opex; rival
  `rivalWeeklyOperatingCost(business, h, market.tick)`. P15B imports it.
- `rankingInputAt` (:62-118), private, and `powerRankingInput` (:121-123): studios entered by W (:64-73); player films
  from `releasedFilms`, pre-origin skipped (:78), run end by arithmetic (:86); authored films at the chronology tick,
  ended, in no lane (:93-105); rival live films, pre-origin skipped (:106), ended when `settledWeek < W` (:111).
- `recordPowerRankingQuarter` (:149-169): with an industry at a quarter week, one record from `p15Sequence.next`, id
  `power-ranking-<n>`, the v1 triple, the law's snapshot minus three fields; the allocator moves by one. Otherwise the
  state itself.
- `validatePowerRankingArchive` (:193-259), the root's own validator: root keys and version (:195-196);
  `recordedFromWeek` a whole week in [0, tick] (:198-201); no industry, no record (:208-211); cadence by
  `isPowerRankingWeek` over (max(recordedFromWeek, originWeek), tick] (:213-219); per record keys (:223), week
  (:225), definition (:226), a whole sequence that ascends (:229-231), the id (:232), the phase triple through
  `P15_PHASE_TABLES[record.phaseOrderVersion]` (:234-237), row keys and band (:240-244), cohort (:245-247), and the
  recompute by era with cash and cost at 0 (:251-257).

**`src/core/save.ts`, the Save45 step.**
- `SaveFileV45` (:634-637), `LiveSaveFile = SaveFileV45` (:638), the union (:686).
- The dispatcher's 45 line (:5453) and "versions 1 through 45" (:5455).
- The frozen-builder branch (:6193-6199), first in `assertFrozenBuilderRetainsHollywood`, which all 18 `makeSaveVn`
  call first: the one refusal if any step root holds a row, else strip and recurse.
- `LIVE_SAVE_VERSION = 45` (:6584); `makeSave` stamps and validates V45 (:6588-6593).
- A 45 line above each of the 39 legacy 44 lines, `migrateToVn(convertV45ToV44(save as SaveFileV45))`, plus the same
  line in `migrateToV43` (:10809): 40 lines. `migrateToV44` gains `return convertV45ToV44(...)` (:10854).
- `migrateToLive` returns `migrateToV45` (:10224-10226).
- `validatedLiveProfessionContext` strips the step's roots before the V41 proof (:10548-10554).
- The step section (:10860-10978):
  - `P15_ROOT_KEYS = ['p15Sequence', 'powerRanking']` (:10868) and `stripP15Roots` (:10871-10873);
  - `initialP15Roots(week): P15StepRoots` (:10877-10879), used by `generateWorld`, `convertV44ToV45` and
    `liftV18Control`;
  - `P15_DOWNGRADE_REFUSALS` (:10884-10887) and `p15DowngradeRefusal` (:10890-10894), the one refusal;
  - `P15_SEQUENCED_ROOTS = ['powerRanking']` (:10898), `p15Sequences` (:10902-10910), and the exported
    `validateP15Allocator(raw, label)` (:10918-10938), the one allocator check;
  - `validateSaveV45` (:10942-10954): envelope, presence of each step root, `validateSaveV44` on the stripped state,
    `validatePowerRankingArchive(raw)`, then `validateP15Allocator(raw, 'validateSaveV45')`;
  - `convertV44ToV45` (:10958-10962): validates V44, adds `initialP15Roots(market.tick)`, validates V45;
  - `convertV45ToV44` (:10967-10973): validates V45, refuses once by name, strips, validates V44;
  - `migrateToV45` (:10975-10978).
- The V44 names stay as frozen versions, as Save44 kept V43's.

**`src/core/types.ts`.** `GameState = GameStateV45` (:2325). `PowerRankingRecordRow`, `PowerRankingRecord`,
`PowerRankingArchive`, `P15StepRoots = { powerRanking; p15Sequence }` and `GameStateV45 = GameStateV44 & P15StepRoots`
follow `GameStateV44`.

**`src/core/tick.ts`.** `recordPowerRankingQuarter` wraps tick()'s only return (:1165-1166), imported from
`./powerRankingArchive.js`, so I's `vi.mock` of that module catches the call. Both other `return` lines inside tick()
sit in callbacks (:370, :597).

**`src/core/worldgen.ts`.** `...initialP15Roots(0)` ends the fresh state; the import joins the existing one from
`./save.js`.

**`src/core/index.ts` (1361-F ruling 8).** `validateSaveV45`, `convertV44ToV45`, `convertV45ToV44`, `migrateToV45`
beside the V44 four; `SaveFileV45` beside `SaveFileV44`; `GameStateV45` beside `GameStateV44`.

**`src/core/promises.ts` and `src/harness/roster-wall/historical-control.ts`:** the two type-error sites (below).

## RED row map

Rows follow the r4 classification's order. Every row reads "passes by reading". Test lines are the tree's.

**A, `tests/p15a2-power-ranking-archive.test.ts`**

| # | Leaf | Code that makes it pass |
|---:|---|---|
| 1 | rank-archive-module-exports (A:341) | PRA exports the four functions: :49, :121, :149, :193. |
| 2 | p15-phase-table-v1 (A:347) | `p15Phases.ts`: version 1; the four phase ids in order; entries of exactly `{phaseId, phaseOrdinal}`; ordinals 1 to 4. |
| 3 | rank-adapter-player-films (A:365) | PRA :76-91: seven keys per film, `filmId = productionId`, `studioId = playerStudioId`; ended when no run, `legacyCompleted`, or `releaseTick + totalWeeks <= W`, never by status. Studio entry: `studio.cash` and :52's sum. |
| 4 | rank-adapter-field-mapping-rivals-and-cohort (A:417) | PRA :64-73 (cohort and finance) and :106-115 (live films from `result`, ended when `settledWeek < W`). Fresh origin, so no live film is pre-origin. |
| 5 | rank-adapter-run-end-parity (A:448) | :86 and :111 both say "last payment before W". |
| 6 | rank-adapter-authored (A:492) | PRA :93-105. The law counts authored films in no lane. |
| 7 | rank-adapter-pre-origin (A:515) | PRA :78 drops `pr-1356-pre` (week 30 < origin 60). |
| 8 | rank-adapter-owner-swap (A:546) | Player and rival rows read the same fields; the player's cost is :52. |
| 9 | rank-adapter-no-leak (A:582) | Records hold no cash or cost. The step's NaN refusal is the law's "power ranking: cash must be finite". The validator's band refusal reads "validatePowerRankingArchive: Power Ranking archive record 143 has an unknown band", the reference's message. |
| 10 | rank-fixed-cost-player-after-founding-excludes-research (A:634) | PRA :52, the reference's sum, which passed at 1356-X2 (D5). |
| 11 | rank-fixed-cost-player-zero-while-founding (A:650) | PRA :52, `founding !== null` gives 0. |
| 12 | rank-fixed-cost-rival-research-window-premise (A:666), CONTROL | Test-side memo over `tick`. The step draws no RNG and writes only the two P15 roots, so the rival route is unchanged. |
| 13 | rank-fixed-cost-rival-operating-cost (A:680) | PRA :54. |
| 14 | rank-step-cadence (A:705) | `generateWorld` seeds the empty archive (`counts[0]` 0); the step appends only at `week % 13 === 0`; none at origin+1. |
| 15 | rank-step-cadence-no-industry (A:719) | The headless world carries the root; PRA :151 returns the state without an industry. |
| 16 | rank-step-cadence-founded-midgame-none-at-origin-plus-one (A:728) | Same rule: 28 is no quarter; the first record is 39. |
| 17 | rank-step-record-is-law-snapshot (A:742) | The step is tick()'s last expression, and its record is the law's snapshot over that state minus three row fields. |
| 18 | rank-step-record-shape (A:757) | Exactly the ten record keys and eight row keys; `recordedFromWeek` 0 from `initialP15Roots(0)`; 13, 26 and 39 recorded unavailable. |
| 19 | rank-record-sequence-allocation (A:778) | :153-167: n from `next`, id `power-ranking-<n>`, `next = n + 1`; with no sibling rows, 1..n contiguous. |
| 20 | rank-record-phase-triple (A:805) | :157, `p15PhaseTriple('p15a2.rankingRecord')` gives v1 ordinal 2. |
| 21 | rank-step-entrant (A:816) | `enterRival` runs in the tick's finalize before the step, so the entrant's `enteredWeek` 520 is in the 520 cohort, unranked. |
| 22 | rank-root-fresh (A:835) | `initialP15Roots(0)` in both worlds; `makeSave` stamps 45; `validateSaveV45` accepts. |
| 23 | rank-root-migration-empty (A:848) | `migrateToLive` → `migrateToV45` → `convertV44ToV45(migrateToV44(v42))` adds only the two roots at week 130; a second pass returns the validated envelope (:10976). |
| 24 | rank-root-migration-genuine-below-step-capture (A:867) | The landed capture is Save44 = 45 − 1 (MANIFEST read); `convertV44ToV45` adds only `P15_ROOTS` keys at its week 30. |
| 25 | rank-root-downgrade-empty-strips (A:900) | `convertV45ToV44` strips the empty pair; the V44 envelope equals `migrateToV44(v42)`. |
| 26 | rank-root-downgrade-round-trip-claims-less (A:913) | Down then up records from 135. |
| 27 | rank-root-downgrade-recorded-quarter-refuses (A:923) | `convertV45ToV44` refuses "migrateToV44: cannot downgrade or discard a recorded Power Ranking quarter". All 41 of `migrateToV4` to `migrateToV44` reach it through their 45 lines. |
| 28 | rank-root-downgrade-frozen-builders-refuse (A:939) | save.ts :6193-6199 throws "`<builder>`: cannot downgrade …" in all 18 builders, before any other guard. |
| 29 | rank-root-frozen-builder-headless-control (A:950), CONTROL | The empty pair strips (:6198) and `projectStateV18` carries neither key. |
| 30 | rank-append-only (A:961) | The step only appends. |
| 31 | rank-round-trip (A:972) | `exportSave`/`importSave` route V45 through the dispatcher's 45 line; the state continues byte for byte. |
| 32 | rank-validate-genuine-archive-validates (A:1022) | The validator accepts the step's own records (same input builder, `finance` false). |
| 33 | rank-validate-keys-root (A:1027) | :195. |
| 34-35 | rank-validate-keys-record-extra, -missing (A:1033, :1039) | :223. |
| 36-37 | rank-validate-keys-row-points, -row-honors-and-stage (A:1045, :1052) | :242. |
| 38 | rank-validate-version (A:1060) | :196. |
| 39 | rank-validate-recorded-from-week-range (A:1066) | :199: -1, 0.5 and 131 refuse. |
| 40 | rank-validate-cadence-gap (A:1074) | `renumber()` keeps the allocator consistent; :217 refuses 9 of 10. |
| 41 | rank-validate-cadence-duplicate (A:1081) | :217, 11 of 10. |
| 42 | rank-validate-cadence-off-cadence (A:1089) | :225, record 4 is not 65. |
| 43 | rank-validate-cadence-future (A:1095) | :217, 11 of 10. |
| 44 | rank-validate-cadence-order (A:1102) | :225, record 3 is not 52. |
| 45 | rank-validate-cadence-no-industry (A:1111) | :209. |
| 46 | rank-validate-cadence-boundary (A:1122) | (a) to (d): the step's weeks equal the validator's (D1); a prepended lower-end record and a dropped first record refuse at :217. |
| 47 | rank-validate-definition (A:1200) | :226. |
| 48-50 | rank-validate-cohort-missing-row, -extra-row, -duplicate-row (A:1208, :1216, :1224) | :245-247. |
| 51 | rank-validate-id-week-only (A:1231) | :232. |
| 52 | rank-validate-sequence-duplicate (A:1241) | :231 (record 78 no longer ascends); a Power Ranking message matches ALLOCATOR. |
| 53 | rank-validate-sequence-at-or-above-next (A:1250) | save.ts :10930, "powerRanking p15DomainSequence … is at or above p15Sequence.next". |
| 54 | rank-validate-next-stale (A:1258) | +1: :10935-10936; −1: :10930. |
| 55 | rank-validate-sequence-ascends-with-weeks (A:1266) | :231. |
| 56 | rank-validate-phase-triple (A:1276) | :234-237: ordinal off, another phase's id, and v2 (no table) all refuse. |
| 57 | p15-validate-sequence-root (A:1291) | save.ts :10920-10923 refuses an extra key, version 2 and a missing `next`, naming `p15Sequence`. |
| 58-67 | rank-validate-recompute-films-lane, -releases-lane, -rank, -ranked, -releases, -film-outside-window, -swapped-film, -available, -window-start, -row-order (A:1316-1391) | :251-257: every field but the band, row order included. |
| 68 | rank-validate-band-another-valid-band-passes (A:1393) | :243 checks membership only; the recompute skips the band. |
| 69 | rank-validate-band-unknown-refuses (A:1402) | :243. |

**I and H**

| # | Leaf | Code that makes it pass |
|---:|---|---|
| 70 | rank-step-only-writes-archive (I:89) | The step touches only `powerRanking` and `p15Sequence` and draws no RNG. The live profession proof strips the step's roots (save.ts :10552), so both campaigns tick identically. With the stub off, `next` stays 1. |
| 71 | rank-step-final-facts (I:117) | The step is the last expression; its input equals the returned state minus the record and one allocator step; each band is `financialStrengthBand` over that final cash and :49's cost. |
| 72 | rank-bounded-harness (H:65) | 480 records, 13 to 6240, at most 10 rows and 4 counted films. The validator and `makeSave` complete. Time is unmeasured on this candidate; the reference measured 57,710 to 66,546 ms against the 300,000 ms ceiling (1356-X2, X3). My per-tick work equals the reference's (U3). |

The declared re-pin rows (cls :116, :158, :165, :179, :186, :193, :494) need no re-pin at slice 2a alone: the ranking
step is the last expression, no sibling root refuses first, and the step adds only `P15_ROOTS` keys.

## Type reasoning for a clean `src`

**Site 1, `src/core/save.ts:10487` at HEAD (:10538 here).** The call
`validateOpportunityWaiverLinks((save as SaveFileV40 | SaveFileV41).state)` passes a `GameStateV40`. Once `GameState`
is `GameStateV44 & P15StepRoots`, that argument lacks both roots: TS2379, as 1356-X measured at the reference.
- The fix is in the callee's types, in `src/core/promises.ts`. `validateOpportunityWaiverLinks` runs only "after
  complete40 admission", so its parameter becomes `GameStateV40`, the era it proves. Its helper
  `opportunitySubstitutionRefusal` takes `GameStateV40` too.
- The live caller `waiverAccepted(state: GameState, …)` still compiles: `GameStateV45` is `GameStateV40 & …`, so it
  is assignable.
- Inside, `takeSubjectOwner` takes `Pick<SubjectState, 'hollywood' | 'studio' | 'concepts' | 'scriptDevelopment'>`
  over `GameState`. Those four keys have the same types in `GameStateV40` and `GameStateV45`, because the roots add
  keys and change none. The bodies are unchanged and compiled while `GameState` equalled `GameStateV40` structurally.
- No cast, no `@ts-ignore`, no `@ts-expect-error`. The call line is unchanged.

**Site 2, `src/harness/roster-wall/historical-control.ts:33`.** `liftV18Control(state: GameStateV18): GameState`
returns an object literal that lacked both roots: TS2375 at the reference.
- The fix: the literal ends with `...initialP15Roots(state.market.tick)`, so the value carries both roots with their
  declared types. That is also the honest lift ("a state the engine refuses is not a lift"). The bridge tests that
  import the function (`bridge-p05a1-owner-greenlight`, `bridge-p05a3-roster-liveness`) reach the live validator,
  which now requires the roots.
- `historicalHashState` keeps every historical hash unchanged. It adds both keys to its early return and refuses
  unless the archive is empty and the allocator is at 1 ("Historical hash cannot discard P15 authority"). Then it
  strips the pair with the other live roots. A control has no industry, so the pair is always empty there.

**The rest of `src`.**
- The reference's root gate found exactly these two `src` errors with the same `GameState` shape (1356-X F-3;
  `S/1356-x/x-ref-tsc.txt`).
- Slice B's Save44 step in `save.ts` (9eb1e66e), which I read, constructs no `GameState`. Its other `src` changes
  (`relationships.ts`, `relationshipLabels.ts`, `talentMarket.ts`, `index.ts`) postdate the reference's gate run, and
  I did not read them line by line; the `src` type gate settles them.
- `generateWorld` now spreads the roots. `initializeHollywood` builds its result with `as GameState` assertions, which
  stay comparable when the target gains properties.
- My greps of `bridge/`, `ui/src/engine/adapter.ts`, `ui/src/lot/snapshot` and the other `ui/src` non-test files
  found no `GameState` literal; for `src` the reference's root gate is the evidence. No exhaustive switch over
  `saveVersion` exists in `src`, `bridge` or `ui/src`. `bridge/runtime-checkpoint.ts:501` and
  `ui/src/engine/adapter.ts:3795` compare against `LIVE_SAVE_VERSION`, which the union now includes.

**New code.**
- `stripP15Roots` and `p15DowngradeRefusal` take `object`, so no call site depends on an implicit index signature.
- One internal assertion, `state as Record<string, unknown>` in `p15DowngradeRefusal`, mirrors the existing one in
  `assertFrozenBuilderRetainsHollywood`.
- `validatePowerRankingArchive` keeps the reference's `raw as unknown as GameState` after the frozen chain has proved
  the rest of the state.
- Narrowings rest on declared `never` returns (`refuse`) and on the existing `isRecord` type predicate.
- Every new import and helper is used (`noUnusedLocals`).
- `src/core` also sits in the UI gate (`ui/tsconfig.json` includes `../src/core/**/*.ts`) and the bridge gate; the
  same reasoning holds there. `src/harness` is in the root and bridge gates only.

## Extension points for P15A.1 and P15C

Every list a sibling extends sits in one place, and the type `P15StepRoots` forces the initializer to follow.

**P15A.1 (`sharedMarket`), commit (b):**
1. `types.ts` `P15StepRoots`: add `sharedMarket`. The compiler then requires `initialP15Roots` to return it, which
   covers fresh worlds, `convertV44ToV45` and the historical lift.
2. `save.ts` `initialP15Roots`: add `sharedMarket: initialSharedMarket(week)`.
3. `save.ts` `P15_ROOT_KEYS`: add `'sharedMarket'`. This drives the presence check, every strip (`validateSaveV45`,
   `convertV45ToV44`, the frozen builders) and `validatedLiveProfessionContext`. **Hazard:** a root missing from this
   list reaches the exact-keyed live profession proof, and `prepareLiveWritingContext`
   (`src/core/liveRetirementWriting.ts:19-27`) swallows that failure into `{ kind: 'rejected' }`. Every tick would then
   lose writing authority silently (T:218-221 notes the exact-keyed proof).
4. `save.ts` `P15_DOWNGRADE_REFUSALS`: put the market entry **first**. r3's text matches T:90:
   `cannot downgrade or discard a recorded shared-market assessment (<n> recorded)`.
5. `save.ts` `P15_SEQUENCED_ROOTS`: add `'sharedMarket'`. The allocator's duplicate message already carries
   "p15DomainSequence" and "duplicate" for T's R1 leaf (T:679-680), and its other messages match T:622-632.
6. `save.ts` `validateSaveV45`: call the market validator after `validatePowerRankingArchive`, before
   `validateP15Allocator`. Drop r3's private `validateP15Allocator` in `marketIntegration.ts` (1361-F ruling 5).
7. Apply nothing of r3's `p15Phases.ts` and `powerRankingArchive.ts` hunks: both are already in this commit.
8. `historical-control.ts`: add the key to the early return, an emptiness guard, and the strip.
9. Commit (a)'s seam and (c)'s batch go in `reception.ts`, `hollywoodTick.ts` and tick step 2.5; nothing here
   constrains them.

**P15C (`campaignLegacy`):**
1. `P15StepRoots`, `initialP15Roots` (`{version: 1, recordedFromWeek: week, official: null, endOfRun: null}`) and
   `P15_ROOT_KEYS`, as above.
2. `P15_DOWNGRADE_REFUSALS`: append the Legacy's entry **last**, "cannot downgrade or discard the frozen 2040 Legacy".
   The step already validates first (1361-F ruling 4); r4 refused before validating, so the dry run shows any 1359
   leaf that depends on that order.
3. `P15_SEQUENCED_ROOTS`: add `'campaignLegacy'`. The generic walk finds the official stamp's `p15DomainSequence`; r4's
   refs are `{domainId, id}`, so they count as no row. A stored copy of another root's sequence under that field name
   would count twice (D2).
4. `validateSaveV45`: call the Legacy validator; drop r4's `validateP15Sequence`.
5. `tick.ts`: wrap `recordPowerRankingQuarter(…)` in `freezeCampaignLegacyWeek(…)` (1361-F ruling 9).
6. Drop r4's copy of `p15Phases.ts` and its `p15PhaseMatches` call; read `P15_PHASE_TABLES[row.phaseOrderVersion]`
   through the export, as PRA :234-237 does.
7. `historical-control.ts`: guard (official and end of run null) and strip.

**P15B, later step:** it adds `'corporateCondition'` to `P15_SEQUENCED_ROOTS` (1361-F ruling 5). But
`validateSaveV45`, once frozen, would then run the allocator over a state stripped of `corporateCondition`, and `next`
would sit above the largest remaining row. P15B's step needs an era flag on the frozen V45 call (the Save41 and Save43
pattern) and must run the one check over all roots itself. This is an open item, not slice 2a's work.

## Departures from the reference, and why

1. **Save45, not Save44** (1361-F ruling 2): every V44 name of the reference is V45 here, above slice B's V44.
2. **`p15Phases.ts` in r3's form** (ruling 6): no `p15PhaseMatches`.
3. **Phase lookup** (1355-F5 ruling 1): PRA :234-237 reads the table through the export, as r3 rewrote it. It adds
   `Number.isSafeInteger(record.phaseOrderVersion)`: a string `"1"` would otherwise index the v1 table, and a key such
   as `"constructor"` would throw a TypeError. r3's market validator carries the same guard.
4. **The allocator rules left the archive validator** (ruling 5): the `p15Sequence` shape, `n < next` and
   `next = largest + 1` now live in the one `validateP15Allocator` (save.ts :10918). I also dropped the reference's
   `seenSequences` and `seenIds` sets: strict ascent already makes a root's sequences distinct, and the id rule ties
   each id to its sequence. Cross-root duplicates are the allocator's.
5. **Cadence by `isPowerRankingWeek`** (PRA :214-216) instead of stepping by 13: the same weeks, one law shared by the
   step and the validator. The no-industry case returns early (:208-211).
6. **List-driven step:** `P15_ROOT_KEYS` drives presence and strips; the reference destructured two keys in
   `stripV44Roots` and checked each by hand. The presence message reads "the <key> root is missing" instead of "the
   Power Ranking archive root is missing"; no RED leaf deletes a root.
7. **`initialP15Roots`** serves `generateWorld`, `convertV44ToV45` and the historical lift. The reference wrote a literal
   in worldgen and in the converter, and worldgen imported `p15Phases.js`; here it imports from `./save.js`, which it
   already imports.
8. **One refusal list** (ruling 4) serves the converter and the frozen builders; the reference checked the archive in
   each place.
9. **`migrateToV43` gets its own 45 line** (:10809). The reference's step sat at 44 and edited that function's direct
   return instead.
10. **The public index** (ruling 8) and **the two type-error sites** (ruling 7): the reference touched neither.
11. **`P15StepRoots`** names the step's roots in `types.ts`; the reference wrote them inline in `GameStateV44`.

## Decisions, open items and uncertain items

Decisions:
- **D1.** The step records at any quarter week with an industry and has no `recordedFromWeek` guard, as in the
  reference. Row 46 calls the step on the lower-end state directly and needs that record (A:1133-1141).
- **D2.** The allocator collects sequences by a generic walk, the reading `tests/helpers/p15-roots.ts` `p15Rows` uses,
  so the validator and the RED agree on what a P15 row is, and a sibling adds one key. The limit: a future root that
  stores another row's sequence under the name `p15DomainSequence` would count it as a row.
- **D3.** `validateP15Allocator` lives in `save.ts`, exported, beside the step's other lists. Placing it in
  `p15Phases.ts` would have moved that module off r3's form.
- **D4.** The historical hash discards only the empty pair and refuses anything else by name.
- **D5.** The player's fixed cost keeps the reference's sum, `weeklyPayroll + weeklyOverhead +
  weeklyFacilityOperatingCost`. `weeklyBurn − weeklyResearchSpend` need not round-trip in floating point, and the sum
  passed rows 3, 8, 10 and 11 at 1356-X2.

Open items for the parent:
- **O1.** P15B and the frozen allocator check, as above.
- **O2. Expected fallout signatures**, for the 1358-M2-style run:
  - Save45 version pins: classes S1 to S4 and UI.
  - S9: a live state with an industry at week 13 or later has recorded a quarter, so the P15 refusal fires before
    slice B's refusals.
  - S5 and S10: whole states and digests now include the two roots.
  - A test that hand-builds a live state without the roots meets "validateSaveV45: the p15Sequence root is missing"
    at `makeSave`. If such a state ticks into a quarter week with an industry, the step throws a TypeError reading
    `snapshots` or `next`. Production adds no guard there: the type forbids that state, and the validator names the
    missing root.
  - Hashes through `historicalHashState` stay unchanged.
- **O3.** The 1355 and 1359 REDs at slice 2a, by reading and not leaf by leaf:
  - Their own-root leaves stay red.
  - Their capture leaves now pass the STEP − 1 check (44 = 45 − 1) and fail later, on the missing root.
  - T's K1, K2 and M0A pins list state keys without the P15 roots (MANIFEST read), and the step changes no other
    root, so those controls should hold. The dry run settles it.

Uncertain items:
- **U1. Type cleanliness rests on reading.** The narrowings to watch:
  - `state.powerRanking.snapshots` behind `isRecord` and `Array.isArray` (save.ts :10885);
  - `sequence.next` through the `||` chain (:10920-10924);
  - `recordedFromWeek` after `refuse` (PRA :199-214);
  - the `P15StepRoots` spread in `liftV18Control`'s literal.
- **U2.** The cadence loop runs once per week, up to 6,240 iterations a validation, which is negligible beside the
  recompute.
- **U3.** Per-tick cost: the step's law call at each quarter, as in the reference, plus one shallow key filter of the
  state in `validatedLiveProfessionContext`, where the reference destructured.

## Evidence limits

No test or type gate ran. The row map and the type reasoning are readings of the code against A, I, H and the
helpers. The python script only printed `save.ts` with the 40 migrator lines; its diff against the tree showed exactly
40 added lines (39 legacy, 1 in `migrateToV43`). The apply check and the `src` tree-hash comparison are git facts.

## What the parent should measure first

1. The `src` type gate (root gate filtered to `src/`, or `tsconfig.src.json`), then the UI and bridge gates. This
   settles U1 and ruling 7.
2. The 1356 archive and isolation files on the candidate: 71 leaves, all expected to pass.
3. The 1356 harness alone, against the 300,000 ms ceiling.
4. The other two landed REDs, for O3.
5. The full core suite with no test edit, for the fallout (O2).

Scratch files: the tree; the patch; this record; the migrator script at
`/private/tmp/claude-501/-Users-zacheryspector-Downloads-project-studio-p13-owner-direction-inputs-01/60db833c-4cf7-4685-b2ec-8aac42c6dac1/scratchpad/gen/migrators.py`.
