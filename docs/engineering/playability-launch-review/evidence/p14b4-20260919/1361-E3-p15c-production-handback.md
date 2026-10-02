# 1361-E3: P15C Wave 2 production handback (the Campaign Legacy in the Save45 step)

Role: the single production writer for P15C Wave 2 (record 1359) under 1361-F and the brief
`brief-p15c-production.md`, on `p15a1-b-r2`. Scope: the `campaignLegacy` root, its validator, its entries in the
Save45 step, migration, downgrade and fresh worlds; the fact adapter and the ref resolver; the replay; the 2040
freeze as the tick's last step; the v2 values. I wrote three commits in the scratch tree, read them against the
landed RED, and ran no node, vitest, tsc, npm, npx, tsx or vite-node. I edited no test and no test helper. Besides
shell reading tools (cat, sed, grep, awk, wc, shasum), I used git in my own tree (checkout of a new branch, add,
commit, tag, diff, show, and an apply check under a temporary index in my scratchpad) and python that printed. In
the real repository I only read files: the records named below, the stage files of 1359 and 1361, and the G-P run
outputs. Every type and behavior claim below comes from reading.

**Status: complete by reading.** All 40 leaves red at `p15a1-b-r2` map to a commit (table below), and by reading
all 116 leaves of the three 1359 files pass at `p15c-c-r1`. The pass count by reading climbs 76, 86, 98, 116 across
`p15a1-b-r2`, (a), (b) and (c), and no passing leaf turns red at any commit. No 1359 leaf needs the Legacy refused
before validation, and no 1359 leaf ticks a state that holds market rows. Unmeasured: the type gates, every leaf,
and the run time of the replay inside the 1356 harness.

## Authority read

E is `docs/engineering/playability-launch-review/evidence/p14b4-20260919` in the real repository.

1. The brief, in full.
2. 1359-A in full; 1359-F (Amendments 1 to 3), 1359-F2, 1359-F3, 1359-F4, 1359-F5 and 1359-F6; 1359-D5 items 7 and
   10 (the reference's confirmed v2 lines and the two text notes).
3. 1361-F in full; 1361-F2; 1361-F3; 1361-F4 rulings 1 to 3; 1361-F5 with Amendment 1.
4. 1361-R Part 1.3 and Part 2.4, with Parts 2.1, 2.2 and 2.5.
5. 1353-F6 in full (the v2 values, the era table, and which production carries them).
6. The oracle, read in the tree: L `tests/p15c2-campaign-legacy-integration.test.ts` in full, the helper
   `tests/helpers/p15c2-legacy.ts` in full, `tests/helpers/p15-roots.ts`, the route L helper's export list, the Wave R
   file's campaign (`tests/p15c-wave-r-retention.test.ts:100-135`), and the five p15c1 leaves red at the base with the
   RED 16 guard (`tests/p15c1-campaign-legacy.test.ts:334`, :580, :627, :942, :1869-1886, :1892-1915).
7. The sibling patch `E/1359-stage/1359-p15c-wave2-sibling-r2.patch` in full, read against this production.
8. The guide, reference r4 `E/1359-stage/1359-p15c-wave2-reference-r4.patch`, all 1,465 lines, for shape only. I
   did not apply it.
9. The b-r2 dry run `x/r3b` (`p15c.json`, `run.meta`, the three tsc outputs) and the G-P run `E/1361-stage/gp-x/gp.json`
   (freeze times and manifest bytes).

## Base and tree

The tree is `/Users/zacheryspector/studio-scratch/1361-prod/tree`. I branched `p15c` at `p15a1-b-r2`.

| Tag | Commit | Parent | Files |
|---|---|---|---|
| `p15c-a-r1` | 2592aea | b0b6fb01 (`p15a1-b-r2`) | `campaignLegacy.ts`, `save.ts`, `tuning.ts`, `types.ts`, `worldgen.ts`, `historical-control.ts` |
| `p15c-b-r1` | 5a3a532 | 2592aea | `campaignLegacy.ts`, `index.ts` |
| `p15c-c-r1` | f4612bf | 5a3a532 | `campaignLegacy.ts`, `tick.ts` |

The tree is clean on branch `p15c` at `p15c-c-r1`. No other tag moved: `p15a1-a-r1` 39d0481, `p15a1-b-r1` 1074744,
`p15a1-b-r2` b0b6fb0, `p15a1-c-r1` and `main` c524911. There is no commit (d), and (c) of P15A.1 is not rebased.

Patches, cumulative from `base` (1045432), staged beside this record in `/Users/zacheryspector/studio-scratch/1361-prod/`
for the parent to copy into `E/1361-stage/prod/`, as with 1361-E2. Each applies with `git apply --check --cached` on
`base` under a temporary index, since deleted.

| File | Lines | Bytes | sha256 |
|---|---:|---:|---|
| `1361-p15c-production-a-r1.patch` (`git diff base p15c-a-r1`) | 1,965 | 127,851 | `9feb6b0af5b4e0224fc9d2e35e0ce5f70f55479633aab6b269def2d7c25960db` |
| `1361-p15c-production-b-r1.patch` (`git diff base p15c-b-r1`) | 2,303 | 149,482 | `5b8e690e1d76dd34c1f5d72ed38e9c19f897d56dbb52e7ace6cbc6c342740a85` |
| `1361-p15c-production-c-r1.patch` (`git diff base p15c-c-r1`) | 2,332 | 151,630 | `a7a70ad959ee2eb7fc7f0e7200ee693f3a28edfb66ffbc8fc327fd077ef7c221` |

Line references below are at `p15c-c-r1`: "law" is `src/core/campaignLegacy.ts`, "S" `src/core/save.ts`.

## What the commits hold

### (a) the root in the Save45 step

- **The v2 era** (1353-F6 rulings 2 and 4). `CAMPAIGN_LEGACY_DEFINITION` reads `campaign-legacy/v2` (law :76), and the
  header names v2 (law :1). `LegacyDefinitionId` (law :101) types the manifest's `definition`. The six evaluated
  archetypes take an era's thresholds as an argument. `buildLegacyManifest` (law :771) now calls
  `evaluateLegacyManifest` (law :778) with the live definition, boundary, mode and TUNING, read at each call.
  `LEGACY_DEFINITIONS` (law :923) holds two frozen entries built from literals (law :836-921): v1's fifteen values as
  Wave 1 landed them, and v2's. Each entry carries its own evaluator, which stamps its own id, boundary and mode.
- **The v2 values** in `tuning.ts:1036-1048`: critic 60, share floor 20, hit line 49 with 1353-F6's measure, and flop 30
  with its new comment. The file's blob after (a) is 0010838, the same as reference r4's postimage.
- **The root** (law :930-949). The types are `OfficialLegacy` (the manifest plus its five stamp fields) and
  `CampaignLegacyRoot {version: 1, recordedFromWeek, official, endOfRun: null}`, and `initialCampaignLegacy(week)` gives
  the empty form. `types.ts:2606` adds the root to `P15StepRoots`, so `GameStateV45` carries it.
- **The validator, 1359-A §5.1 items 1 to 5** (law :1187-1330).
  - Item 1: exact keys, version 1, `recordedFromWeek` a whole week in [0, `market.tick`], `endOfRun` null.
  - Item 2: the half of the marker rule that needs no freeze step. An official manifest refuses unless the freeze
    was due.
  - Item 3: the identity against the manifest's own frozen entry. An unknown definition refuses by name.
  - Item 4: the stamp's own rule. The sequence is a whole number of at least 1, and the id is
    `campaign-legacy-<sequence>`. The phase triple is checked against `P15_PHASE_TABLES[row.phaseOrderVersion]`
    through the export, with R2's whole-number guard on the version (1361-F ruling 6).
  - Item 5: the bounds of the entry.
- **The step** (S :10862-10973).
  - `campaignLegacy: true` joins R1's `P15_ROOT_KEYS` literal (S :10873). Through that list the presence check, the
    strip in `validateSaveV45`, both converters, the live profession proof (`validatedLiveProfessionContext`) and
    the frozen-builder guard all cover the root, with no new branch.
  - `initialP15Roots` writes the empty Legacy at the given week (S :10883), so fresh worlds, `convertV44ToV45` and the
    historical lift seed it, with no freeze at migration. A second migration is `validateSaveV45` on the save itself.
  - `P15_DOWNGRADE_REFUSALS` appends the Legacy last (S :10896-10897), so the one refusal reads market, ranking,
    Legacy. A non-null `official` or `endOfRun` refuses with "cannot downgrade or discard the frozen 2040 Legacy".
  - `P15_SEQUENCED_ROOTS` gains the Legacy (S :10914), so the one allocator check sees the official's sequence.
    There is no `validateP15Sequence` and no private copy (1361-F ruling 5).
  - `validateSaveV45` calls `validateCampaignLegacy(raw, 'validateSaveV45')` after the market's validator and before
    the allocator check (S :10973).
- **`historical-control.ts`.** The hash discards an unfrozen Legacy root (:63, :115-128) and refuses a frozen one
  with "Historical hash cannot discard P15 authority". The lift already writes `initialP15Roots`, so no historical
  hash moves.
- **Text notes** (1359-F6 ruling 5). Law :90 and :287 (r4's :91 and :288) now hold in both eras. No test pins either
  text.

### (b) the adapter, the resolver and the replay

- **`legacyFactsFromState(state, boundaryWeek)`** (law :995). It is r4's adapter, built on 1359-A §3.1-§3.2. It reads the three sibling roots untyped
  (law :958-990; 1361-F ruling 18). `powerRanking` records give one fact per row with the record's own id as
  `recordId`; `corporateCondition` events and `sharedMarket` assessments give their facts by `p15DomainSequence` and
  `week`. A sibling root that is absent, or recorded from the boundary or later, reads notRecorded. Standing comes
  from one map of the businesses, not a `find` per studio.
- **`legacyRefResolver(state, boundaryWeek)`** (law :1125-1153), exported from the law and from `src/core/index.ts:1729-1730`
  (1359-A §7; 1361-F ruling 19). One id map per citable root. A ref resolves to `{position, week}`: the index plus 1
  in an array root, or the P15 sequence in a P15 root, and the row's effective week. An authored film's week is -1,
  dated before the campaign, as in r4. `playerRuns` and `awards` resolve to nothing.
- **Validator items 6 and 7 and the replay** (law :1332-1404).
  - Item 6 re-derives each source's `recordedFromWeek`. It requires a P15 watermark equal to the largest sequence in
    its root below the official's, and an array watermark within its root's length.
  - Item 7 resolves every ref through the exported resolver.
  - The replay rebuilds the facts, puts the stored sources in place of the domain facts, and runs the evaluator of
    the stored definition. Every field but `standingAtBoundary` must match, and the first differing path is named
    (1359-F Amendment 1).
- **Two law changes.**
  - The F1 relaxation (law :357-362; 1359-F2): an authored film may carry a null `settledWeek`, and every other film
    keeps the refusal.
  - Ranking facts are unique on (`recordId`, `studioId`) (law :489-496; 1359-F3), the shape the adapter writes.
  - Neither moves an outcome, so the definition stays v2.

### (c) the freeze as the tick's last step

- **`freezeCampaignLegacyWeek(state)`** (law :1155-1178), 1359-A §4.2. It returns its input unless the industry
  exists, the produced week is 6240, the industry and the root both record from before 6240, and no official
  manifest exists. When it fires, it reads the facts of the final state and calls the law through `freezeLegacy`.
  It then stamps `campaign-legacy-<next>` with `p15PhaseTriple('p15c.finale')` and advances `p15Sequence.next`. It
  draws no randomness, and the law module reads no clock.
- **The marker rule's other half** (law :1217): a save that stands at or past 6240 with the freeze due must hold the
  manifest.
- **`tick.ts:1181`.** The freeze wraps `recordPowerRankingQuarter`, which wraps everything before it, so the official
  sequence is the week's last allocation (1361-F ruling 9). P15A.1's step 2.5 and (b)'s tick write are untouched.

## The commit split: two moves from the brief's (a) list

The brief lists the replay and the marker rule under (a). Each moved to the commit that holds what it needs.

1. **The replay, with items 6 and 7, is in (b), not (a).** The replay rebuilds the facts with
   `legacyFactsFromState`, which the charter and the brief place in (b). Items 6 and 7 read the sibling roots' rows,
   the reads the brief gives (b) "as r4 does (ref :742-750)". (a) carries 1359-A §5.1 items 1 to 5 and the era table
   that the replay later uses. At (a) nothing can write a manifest, so its validator never meets one.
2. **The marker rule's "missing when due" half is in (c), with the freeze.** If (a) demanded a manifest that only (c)
   writes, every campaign with an industry that stands at or past 6240 would fail at save at (a) and (b). Two leaves
   would go red there: the route L control (L:343), which saves route L at 6240 and 6241, and the 1356 harness, which
   saves its campaign at 6240. With the split, no leaf turns red at an intermediate commit. Each half lands with the
   code that makes it true. Moving the half back into (a) is two lines, if the parent prefers it.

## RED leaf map

The baseline is the b-r2 dry run `x/r3b`: 76 pass and 40 fail, 35 in L and 5 in p15c1. The Wave R file's 7 leaves
pass at every commit. Each leaf below flips at the commit named and stays green after it, by reading.

| Commit | Leaves that flip (file:line of `it(`) | Pass / fail by reading |
|---|---|---|
| base `p15a1-b-r2` | (measured) | 76 / 40 |
| (a) | L:815 `legacy-root-fresh`, L:824 `legacy-migration-empty-root`, L:842 `legacy-migration-empty-root-genuine-save38`, L:866 `legacy-migration-past-boundary`, L:875 `legacy-migration-past-boundary-genuine-save38`; p15c1:334 `campaign-legacy-definition-version-export`, :580 `legacy-archetype-edges-commercial-engine-min-films-n-minus-1-vs-n`, :627 `legacy-archetype-edges-artistic-voice-share-exactly-at-threshold`, :942 `legacy-coexist-every-evaluated-archetype-held`, :1892 `tuning-legacy-bounded-terms` | 86 / 30 |
| (b) | L:392 `legacy-adapter-film-facts`, L:404 `-run-status`, L:436 `-run-status-natural-no-run`, L:450 `-private-money-never-read`, L:519 `-career-events`, L:535 `-studios`, L:562 `-domain-facts`, L:576 `-sibling-roots`, L:631 `-p15-watermarks`, L:652 `-missing-concept-refuses`, L:729 `legacy-condition-at-6240-outside`, L:1235 `legacy-law-settled-week-null-authored-only` | 98 / 18 |
| (c) | L:669 `legacy-tick-freezes-once-at-6240`, L:700 `legacy-freeze-writes-only-its-root`, L:753 `legacy-adapter-only-at-boundary`, L:771 `legacy-ticks-after-freeze`, L:788 `legacy-hollywood-null-no-freeze`, L:800 `legacy-determinism`, L:854 `legacy-migration-before-boundary`, L:885 `legacy-root-downgrade`, L:980 `legacy-validate-marker`, L:993 `-manifest-identity`, L:1002 `-stamp`, L:1015 `-bounds`, L:1046 `-refs`, L:1067 `-refs-post-boundary-row`, L:1089 `legacy-definition-era-guard`, L:1113 `legacy-round-trip`, L:1128 `legacy-validate-replay`, L:1175 `legacy-old-law-fixture-v1-validates-after-retune` | 116 / 0 |

Why each group flips where it does:
- **(a).** The five L leaves need only the root, the step and fresh worlds, and none calls `stepFn` or `factsFn`. C4
  ticks a state recorded from 6240, which never freezes. The p15c1 five read the v2 values and the v2 definition.
- **(b).** Ten leaves need `legacyFactsFromState`. L:729 also needs the ranking rule keyed on (`recordId`,
  `studioId`), because its forged records carry one row per studio. L:1235 needs F1.
- **(c).** Every other leaf calls `stepFn` or `genuineFrozen`, or ticks to 6240 and reads the manifest.

Messages that change for leaves still red, so the parent can declare them:
- **At (a) and (b):**
  - L:854 now fails at "premise: the state holds no official 2040 Legacy". The root now exists, so `officialOf`
    throws after the tick.
  - L:885 and L:1089 now fail at "RED: src/core/campaignLegacy.ts does not export a function named
    'freezeCampaignLegacyWeek' (1359-A §3-§5)". `genuineFrozen` asks for the step after the root and the table are
    found.
  - Every other red leaf keeps its x-r3b message.
- **At (b):** the remaining 18 are L:854 and the 17 that ask for `freezeCampaignLegacyWeek`, with the messages above.

How the key leaves pass at (c), by reading:
- **B1 (L:669) and B3 (L:700).** The freeze runs after the 6240 ranking record, so `next − 1` is the official's
  sequence. B3's forged state at 6239 refuses at item 2 with `campaignLegacy.official must be null: ...`, which
  matches `MARKER`. The allocator check would also refuse that state, but it runs after the Legacy's validator. Its tick strips the
  root in the live proof.
- **B5 (L:753).** The ranking record reads no concept (`powerRankingArchive.ts` and `powerRanking.ts` name none), so the
  6239 to 6240 tick fails first in the adapter: "state.concepts must hold concept <id>, ...".
- **C5 (L:885).**
  - `convertV45ToV44` validates, then refuses with "migrateToV44: cannot downgrade or discard the frozen 2040 Legacy".
  - Every `migrateToVn` for 4 ≤ n < 45 reaches that converter through slice 2a's 45 lines.
  - Every `makeSaveVn` reaches `p15DowngradeRefusal` through `assertFrozenBuilderRetainsHollywood` before any
    validation.
  - `makeSaveV18` of a fresh world strips the empty root.
- **C6 to C10 (L:980-1087).**
  - Each message carries the substring its leaf asks for: `campaignLegacy.official.kind`, `.boundaryWeek`,
    `.postFinaleMode`, `.definition`, `.legacySnapshotId`, `.phase`, `campaignLegacy.endOfRun`, `sources`,
    `archetypes`, `lenses`, `lens`, `counts`, `qualifying|contrary`, `qualifyingCount|contraryCount`, `studios`,
    `highWatermark`, `recordedFromWeek`, `playerRuns|domainId`, `awards|domainId`.
  - C8's two `/p15/i` cases: sequence 0 fails item 4 ("official.p15DomainSequence must be a whole number of at least
    1"), and sequence `next` passes the Legacy's validator and fails the allocator check ("campaignLegacy
    p15DomainSequence 2 is at or above p15Sequence.next 2").
- **C11 (L:1089).** The table's fields equal the literals ERA_SHAPE, V1 and V2 field by field. TUNING holds exactly
  the fifteen `LEGACY_*` keys (the parcel id is in `lot.ts`). The live exports equal v2.
- **The replay leaves (L:1128, L:1175).**
  - `firstDifference` walks the archetype's keys in the law's order, so a tampered outcome names `.outcome` and a
    tampered count names `.qualifyingCount`.
  - Relabelling v1 and v2 moves only qualifying refs, counts and outcomes (critic, hit and share lines), never the
    contrary side, so the relabels match `/outcome|qualifying/`.
  - Under the unbumped retune, both stored manifests replay under their frozen entries, never under TUNING.

## The refusal order (1361-F ruling 4)

No finding. The step validates and then refuses once, naming `sharedMarket`, `powerRanking` and `campaignLegacy` in
that order. No 1359 leaf needs the Legacy refused before validation:
- C5 downgrades `makeSave(genuineFrozen())`, a valid save, and each older migrator receives that same save.
- The frozen builders refuse before any validation through the shared guard.
- The sibling patch adds no downgrade case.

## The v2 values

Commit (a) carries them: `tuning.ts:1036-1048`, `CAMPAIGN_LEGACY_DEFINITION` at law :76, and both frozen entries at
law :867-926. C11 pins the literals.

## Departures from r4, and why

1. **No second `p15Phases.ts` and no `p15PhaseMatches`** (1361-F ruling 6). The stamp check reads
   `P15_PHASE_TABLES[official.phaseOrderVersion]` through the export, with slice 2a R2's whole-number guard.
2. **No `validateP15Sequence`** (1361-F ruling 5). The Legacy joins `P15_SEQUENCED_ROOTS`. Its own validator keeps
   only the root's rule (a whole sequence and the id that cites it), as the archive's validator does. r4's
   `[1, p15Sequence.next − 1]` check moved to the one allocator check, which covers it.
3. **The downgrade refuses after validation, in the step's one message** (1361-F ruling 4). r4 refused a frozen
   Legacy before validating.
4. **No Legacy branch in the frozen-builder guard and no separate strip in the live proof.** Both run through
   `P15_ROOT_KEYS` and `P15_DOWNGRADE_REFUSALS`, which R1 ties to `P15StepRoots`.
5. **The exported resolver** replaces r4's private `places` index and `checkRef` closure (1361-F ruling 19). The
   validator calls it, so display and validation share one reading. Its first leaf arrives with Wave 3's RED.
6. **`validateCampaignLegacy(raw, label)`** takes the raw state, as `validateSharedMarketRoot` does, instead of r4's
   `(state: GameState, label)`.
7. **The replay drops r4's three `delete replayFacts.*` lines** (r4 :781-783). Item 6 has already proved each stored
   `recordedFromWeek` equal to the derived one, and the adapter omits a sibling's fact array exactly when it derives
   null, so the lines could never change the facts.
8. **`freezeLegacy` takes the root itself**, whose `official` the guard has just found null, instead of a rebuilt
   empty root. The result is the same.
9. **Standing comes from a map of the businesses**, one pass per root as 1359-A §3 asks, instead of a `find` per studio.
10. **`historical-control.ts` discards an unfrozen Legacy.** r4's own step did not seed the lift, so r4 never touched
    this file. Here the lift writes `initialP15Roots`, and the hash must not move.
11. **The validator's messages** for the stamp's sequence and phase now name this production's rules. Every RED
    pattern still matches (above).
12. **No new `src` type-error site.** Slice 2a fixed both sites r4 carried.

## Type reasoning for a clean `src`

The settings are TypeScript ^5.6, strict, `exactOptionalPropertyTypes`, `noUnusedLocals`/`Parameters`,
`noImplicitReturns`, and no `noUncheckedIndexedAccess`.

- **(a).**
  - R1's `satisfies Record<keyof P15StepRoots, true>` holds with the four keys, and `initialP15Roots` returns all four.
  - `worldgen.ts` and the historical lift spread it, so no `GameState` literal misses the root.
  - The Legacy refusal narrows `state.campaignLegacy` with `isRecord`, as its two siblings do.
  - In the validator:
    - `refuse` carries an explicit `never` type, so each guard narrows (`root` to `Row`, `from` to `number`, `h` to
      `HollywoodState` after line :1219).
    - `LEGACY_DEFINITIONS[official.definition]` indexes a record keyed by the same union, so `entry` is defined.
    - `previous` in the studios callback uses its declared union.
  - The era code is r4's, which compiled in 1359-X2 and 1359-X5 apart from the two sites slice 2a fixed:
    - `Object.freeze` keeps literal types, which are assignable to `LegacyDefinition`;
    - `awards: readonly never[]` is assignable to `readonly string[]`;
    - `liveLegacyThresholds` reads `TUNING[name]` over the fifteen literal keys.
  - `historical-control.ts` reads `p15.campaignLegacy?.official ?? null` on `Partial<GameState>`, and its new rest
    sibling `_legacy` follows `_sharedMarket`.
- **(b).**
  - The adapter's types match `hollywoodTypes.ts:19-46` and `types.ts:279-283`, :315 and :2624-2650:
    - `HollywoodCredit.role` and `TalentCareerEvent.role` are string unions;
    - `Standing` has exactly three channels;
    - `'legacyCompleted'` is a run status.
  - The resolver's `index(...)` calls infer tuples from the `Iterable<[string, LegacyRefPlace]>` parameter, r4's
    pattern.
  - `checkRef` narrows `ref` to `Row`, then `ref.domainId` to `string` before `resolve` reads it.
  - `replayFacts` spreads `LegacyFacts`, and `delete` runs on a `Row`.
- **(c).**
  - `frozen.official` narrows after `fail`.
  - The stamped literal satisfies `OfficialLegacy` through `P15PhaseTriple`.
  - The return spreads `GameState` with both roots.
- **Every commit.**
  - No unused local or import: `GameState` and `P15_PHASE_TABLES` are used in (a), `TECHNOLOGY_CATALOGUE` and
    `TalentCareerEvent` in (b), `p15PhaseTriple` in (c).
  - Only the law spells `postFinaleMode` (the RED 16 guard allows the law and `save.ts`; `save.ts` has none).
  - No runtime import cycle: the law imports `calendar`, `p15Phases`, `technologyCatalogue` and `tuning` only.
- **A structural check.** A python check that skips strings, templates and comments reported every edited file
  balanced.

## Effects outside the 1359 files, by reading

- **1356 (p15a2).** Unchanged at 72 of 72.
  - The isolation file runs to week 221, and its sibling comparison covers an unfrozen Legacy, identical in both runs.
  - At (c) the archive harness's p13a campaign freezes at 6240 (originWeek 0, root recorded from 0). It then pays one
    adapter and law pass in the tick and one replay in each of `makeSave` and `validateSaveV45`.
  - G-P measured the freeze at 26 ms on p13a and 46 ms on seed-b on the (b) tree, with manifests of 42,495 and 67,304
    bytes, so the three passes stay far below the 300,000 ms ceiling.
  - No 1356 leaf counts P15 rows or reads `p15Sequence.next` at 6240.
  - The second harness (`p15a2-power-ranking-harness.test.ts`) runs the ranking law on data and never ticks.
- **1355 (p15a1).** By reading, still 14 pass and 45 fail, with x-r3b's messages.
  - No 1355 state reaches 6240.
  - The Legacy's validator passes every unfrozen root before the allocator check runs.
  - The F3 guard and its messages are untouched.
- **No 1359 leaf ticks forged market rows** (the brief's watch item). A7 (L:576) and A8 (L:631) forge market rows
  only for the adapter and never tick them. No Wave R, p15c1 or sibling leaf forges market rows.
- **Generator checks.** Both passed at b-r2 after (b) added `sharedMarket`, and this production adds a root the same
  way, with no Bridge or projection change. Unmeasured.
- **Test type errors.** The 33 root-gate sites at b-r2 include test helpers that pass a `GameStateV40` where
  `GameStateV45` is due (x-r3b tsc output, lines 9-36). Those sites now also name `campaignLegacy`. Test files may
  carry type errors until the sweep (1361-F ruling 3).
- **The fallout class for 1361-N.** Any test that ticks a campaign with an industry through week 6240, from a root
  recorded before 6240, now freezes a Legacy. That adds one P15 row and changes the root. Outside the 1359 files, my
  search of `tests/` for 6240 found only:
  - the 1356 harness above;
  - `p11-finance-history-scale.test.ts`, whose world never founds an industry;
  - a synthetic `bridge-p11-ready.test.ts` state without an industry, never validated.
- **The sibling patch** (`1359-p15c-wave2-sibling-r2.patch`): its five leaves pass on `p15c-c-r1` by reading.
  - B2: the official's sequence exceeds the 6240 record's, and `powerRanking`'s watermark is the largest sequence;
    the market root, recorded from 6240, reads 0.
  - B4b: the 6240 record is inside.
  - C3b: `powerRanking` migrated at 6239 reads `[6239, 'limited']`.
  - C8b: item 6 refuses first, with "largest P15 sequence".
  - C10c: both siblings migrated at 6240 read notRecorded.
- **G-L's K3 (1359-A §9).** G-P's probe stood in for the 8 authored films' null `settledWeek` (`f1.standInFilms` 8),
  because the base's law refused it. The law reads an authored film's `settledWeek` in no lane, so the stand-in should
  not change the manifest. G-L measures that.

## Decisions, open items and uncertain items

For the reviewer:

1. **O1, the split** (above): the replay in (b) and the marker rule's due half in (c). This is the one structural
   choice the brief's listing did not make.
2. **O2, the resolver's shape.** `{position, week}`, with week -1 for an authored film and null for an adoption never
   operational. The validator needs both fields. Wave 3 may want the row itself, and its RED decides that (1361-F
   ruling 19).
3. **O3, the stamp's rule split.** The Legacy's validator checks a whole sequence and its id, and the allocator check
   enforces "below next" and "distinct". C8's two `/p15/i` cases are met by one message each.
4. **O4, `freezeLegacy`'s Wave 1 doc** (law :816-821) still calls it "The tick's last step (Wave 2)". The tick's last
   step is now `freezeCampaignLegacyWeek`, which calls it. I left the Wave 1 text for its next text pass.
5. **O5, the p15c1 text notes at :50-59 and :70-72** (1359-F6 ruling 5) lie in a test file, so they wait for the next
   Wave 1 text pass.
6. **O6, a cosmetic blank line** after the validator's heading (law :1180-1181), left by (b)'s move of `Row` and
   `isRow`.
7. **O7, the frozen-builder refusal for a non-null `endOfRun`** uses the frozen-Legacy words, as r4 did. No lawful
   state of this era carries one.

## Evidence limits

Every result here is by reading. Nothing ran: no type gate, no leaf, no harness. I did not read the 1359
classification JSON (r8) row by row. The leaf map comes from L's code and x-r3b's measured failures.

## What the parent should measure first

1. The type gates at (a), (b) and (c): `src` clean on all three.
2. The 1359 files at (c): 116 of 116. At (a) and (b): 86 and 98, with the message changes above.
3. The sibling patch's five leaves at (c), before its classification.
4. The 1356 harness alone at (c) against its ceiling (1361-F ruling 15), and 1355's 45 declared failures unchanged.
5. The generator checks and the fallout run (1361-F ruling 20).

Scratch files: the tree; the three patches named above; this record.
