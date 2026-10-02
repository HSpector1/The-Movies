# 1361-D3: review of P15C Wave 2 production r1 (the Campaign Legacy in the Save45 step)

An independent, read-only implementation review under 1361-F ruling 21 of P15C Wave 2's three commits in
`/Users/zacheryspector/studio-scratch/1361-prod/tree`: (a) 2592aea `p15c-a-r1`, (b) 5a3a532 `p15c-b-r1` and
(c) f4612bf `p15c-c-r1`, stacked on `p15a1-b-r2` (b0b6fb01). Written on 2026-10-02 from 17:35 CDT by `date`.

E is `docs/engineering/playability-launch-review/evidence/p14b4-20260919` in the real repository. X is
`/Users/zacheryspector/studio-scratch/1361-prod/x`, the parent's dry run 1361-X4 (`pca`, `pcb`, `pcc`) and the b-r2
baseline (`r3b`). "law" is `src/core/campaignLegacy.ts`, S is `src/core/save.ts`, TK is `src/core/tick.ts`, L is
`tests/p15c2-campaign-legacy-integration.test.ts`, H is `tests/helpers/p15c2-legacy.ts` and r4 is
`E/1359-stage/1359-p15c-wave2-reference-r4.patch`. Every `file:line` is the blob at `p15c-c-r1` unless a tag is named.
"Read" marks what I saw in a file. "Inferred" marks what I conclude from it. I ran no code.

## Verdict: PROCEED

The production does what 1359-A, the 1359-F rulings and 1361-F's rulings ask, and the parent's measurements back it.
No finding asks the writer to change (a), (b) or (c).

- **The step** extends slice 2a's generic lists by one key each. The frozen builders, the live profession proof, the
  strip, the presence check and the downgrade all reach the Legacy through `P15_ROOT_KEYS` and
  `P15_DOWNGRADE_REFUSALS`, with no Legacy branch.
- **The validator** carries every item of 1359-A §5.1 and the replay of 1359-F Amendment 1, judged by the frozen entry
  the manifest names. The stamp reads `P15_PHASE_TABLES` through the export, and the one allocator check owns "below
  next" and "distinct".
- **The tick** wraps the ranking record with the freeze as its outermost call. Every tick but the one producing 6240
  pays two comparisons (law:1164).
- **O1 holds.** One class of state is lawful at (a) and (b) and refused at (c): an industry campaign saved at or past
  6240 with an unfrozen root. Only an (a) or (b) build can write it, and no intermediate commit is played.
- **The guard holds.** P15C adds no tick path, and the freeze runs after the F3 guard.

**Required changes: none.**

**Optional, if the parent makes an r2:** F3's one-line guard and F5's text.

**For the parent:** F1, a rule before any technology-catalogue or law-code change; F2, three measurements at G-L or
1361-M.

## Identity

- **Tags and parents** (`git rev-parse`, `git log`): `p15c-a-r1` 2592aea on b0b6fb0, `p15c-b-r1` 5a3a532 on 2592aea,
  `p15c-c-r1` f4612bf on 5a3a532. `p15a1-a-r1` 39d0481f, `p15a1-b-r1` 10747443, `p15a1-b-r2` b0b6fb01, `p15a1-c-r1`
  and `main` c5249114, `p15a2-r2` 5eccada2 and `base` 10454328 match 1361-E3:43-50.
- **Patches.** `git diff base <tag>` hashes to 1361-E3:58-60's sha256 for all three. The copies in `E/1361-stage/prod/`
  and in the scratch directory match.
- **Scope.** `git diff p15a1-b-r2 p15c-c-r1` touches eight `src` files (717 insertions, 76 deletions) and nothing under
  `tests`, `bridge`, `ui`, `scripts` or `generated`.
- **The oracle.** L, H, `tests/p15c-wave-r-retention.test.ts`, `tests/p15c1-campaign-legacy.test.ts` and
  `tests/helpers/p15-roots.ts` have the same blobs at `p15c-c-r1` and in the real repository.

## Findings, ranked

### F1. Medium, for the parent: every frozen save depends on the live technology catalogue and the shared law code

Production follows 1359-A §3.2 (`E/1359-A:78`, the catalogue as an array domain) and §5.1 item 7 (`E/1359-A:174-175`,
position "index + 1"). The hazard sits in that design, and no measurement can see it today.

- **Read.**
  - The adapter puts the live `TECHNOLOGY_CATALOGUE` into the facts (law:1089), and the replay keeps those facts,
    replacing only the domain rows (law:1391-1398).
  - The resolver positions a catalogue row at its index + 1 (law:1139). Item 7 refuses a ref above its stored
    watermark (law:1375).
  - The catalogue is code "in stable ascending id order" (`src/core/technologyCatalogue.ts:41-45`), with two entries:
    `lighting-control-01` (commercial week 936, :50) and `synchronized-sound` (416, :60).
  - Technology Pioneer's contrary side lists each technology that became commercial during a studio's span before B
    (law:653-661). Its pioneers read each technology's commercial week (law:650).
  - The era table freezes thresholds and structure (law:866-926). Every entry's evaluator runs the shared
    `evaluateLegacyManifest` and archetype code (law:778-815, :914-920).
- **Inferred.**
  - Inserting a technology whose id sorts before `synchronized-sound` moves that row to position 3 against a stored
    watermark of 2, so item 7 refuses every manifest that cites it as contrary.
  - Adding a technology commercial before 2040, or editing a commercial week, changes contrary sets or pioneers, so
    the replay refuses.
  - A later edit to any archetype or lens function re-judges every stored manifest of every era.
  - Each case makes `makeSave`, `importSave` and the Bridge digest refuse every frozen save the change touches, from
    then on. A studio that entered by week 416 and never ran synchronized sound before B cites the catalogue row
    (law:655-657), so a fresh-origin campaign's incumbents can carry such refs.
- **For the parent:** before the first catalogue or law-code change, record a rule. Either a definition bump whose
  entry freezes the catalogue (ids, order, commercial weeks) and its evaluator, or an append-only catalogue with
  id-based positions. A comment at `technologyCatalogue.ts:41` would warn the next author. This production needs no
  change for it.

### F2. Low to medium, for the parent's measurements: the replay's cost lands outside `tick()`

- **Read.**
  - `tick()` never runs the Legacy validator: its live proof strips the roots (TK:198; S:10554).
  - The Bridge digests each state with `makeSave`: `bridge/session.ts:356-358` calls
    `bridge/snapshot-build-context.ts:112-118`, which calls `ui/src/engine/adapter.ts:3779-3780`, which calls
    S:6613-6614. The context caches one digest per state object (`bridge/snapshot-build-context.ts:110-114`), and the
    command paths ask for it (for example `bridge/session.ts:707`, :1819). After 2040, each new Bridge state therefore
    runs the adapter, the law and the replay once (S:10973).
  - 1359-F Amendment 1's cost premise reads "runs at save and load, not every tick" (`E/1359-F:24-26`). That holds for
    `tick()` and does not hold for the Bridge.
- **Measured (X, the 1356 harness on p13a at 6240).** `validateSaveMs` reads 377 at b-r2, 336 at (b) and 400 at (c);
  `makeSaveMs` reads 574, 588 and 606; `saveBytes` grows by 42,619 at (c), the manifest (`X/{r3b,pcb,pcc}/p15a2-harness.txt`).
  The increase sits inside run noise.
- **Unmeasured.**
  - Seed-b, whose manifest is 67,304 bytes over 11,712 industry career events (`E/1361-GP-X:72-79`).
  - Week 8,791, which 1359-F asks for and which has no leaf (`E/1359-C2:28` leaves it with G-L).
  - A save after B with player releases after B. Route L's player releases nothing after its founding (L:26-31), and
    G6240F is validated at 6240 only (H:222-232). By reading, the cut holds for those rows (law:419, :1009-1010).
- **Ask:** G-L or 1361-M times `makeSave` and one Bridge advance on a post-2040 seed-b state, at week 8,791, and on a
  campaign with player releases after B.

### F3. Low, optional fix: a null lens refuses with an unnamed TypeError

- **Read.** law:1312-1314 calls `exactKeys` on each lens, and `exactKeys` runs `Object.keys(value)` (law:1193) with no
  `isRow` guard. Sources (law:1258), studios (:1272), archetypes (:1295) and refs (:1368) each check `isRow` first.
  r4 has the same gap (r4 :683-685).
- **Inferred.** A manifest with `lenses: [null]` throws "Cannot convert undefined or null to object" with no label and
  no path. It still refuses, so no forged state passes.
- **Fix:** `if (!isRow(lens)) refuse(lat, 'must be an object')` before law:1314.

### F4. Low, a note for 1361-N: the freeze assumes the root exists

- **Read.** Once the industry exists and the produced week is 6240, law:1165-1166 reads `state.campaignLegacy.official`
  with no presence check. The market root's absence fails by name at every industry tick
  (`src/core/marketIntegration.ts:24-27`, TK:1071).
- **Inferred.** A hand-built industry state that carries `sharedMarket` and lacks `campaignLegacy` throws a TypeError at
  its 6240 tick. Every validated V45 state carries the root (S:10967-10969), so only test-built states reach this. It
  belongs beside 1361-F4's F7 in the sweep plan.

### F5. Low, text

- law:817-821 still calls `freezeLegacy` "The tick's last step" (the writer's O4).
- law:1180-1181 carries a blank line after the validator's heading (O6).
- S:10870 calls `P15_ROOT_KEYS` "a subset of the four keys"; it now holds all four.
- S:10889-10890 says each refusal "returns null for an empty or absent root". The Legacy entry (S:10896) also refuses a
  malformed root, for example one without `endOfRun` (`undefined !== null`), in the frozen-Legacy words. That fails
  closed, so only the comment and the words mislead (beside O7).
- `src/harness/roster-wall/historical-control.ts:120-121` checks `official` and leaves `endOfRun` unchecked. The
  validator requires a null `endOfRun` (law:1211), so no lawful state reaches the gap.

### F6. Information, O2: the resolver's public shape carries two sentinels

`LegacyRefPlace` gives an authored film `week: -1` and a non-operational adoption `week: null` (law:1122-1125, :1143),
exported from `src/core/index.ts:1729-1730`. The validator needs both fields and handles both. Wave 3's RED should
settle the public shape before a view renders a week from it (1361-F ruling 19).

### F7. Information: the 33 test type-error sites are fallout for the sweep

- **Read.** b-r2 (`X/r3b`) and `X/pcc` report the same error sites, compared site by site: 33 under the root config,
  4 under UI and 9 under Bridge. `X/pca`, `X/pcb` and `X/pcc` hold byte-identical tsc outputs for each config.
- The root messages now add `campaignLegacy` to the missing-property lists (14 lines in
  `X/pcc/tsc-tsconfig-json.txt`). The sites sit in 25 test files, 6 of them in
  `tests/p14b4-material-evidence-core.test.ts`.
- 1361-F ruling 3 lets test files carry these until the sweep.

## The nine checks

### 1. The step

- **The literal.** `campaignLegacy: true` sits inside R1's `satisfies Record<keyof P15StepRoots, true>` literal
  (S:10873), and `P15StepRoots` carries the root (`src/core/types.ts:2602-2607`). A missing or extra key fails the type
  gate.
- **The two lists.** `P15_SEQUENCED_ROOTS` reads `sharedMarket, powerRanking, campaignLegacy` (S:10914).
  `P15_DOWNGRADE_REFUSALS` keeps market, ranking and Legacy in that order, and the Legacy entry reads "cannot downgrade
  or discard the frozen 2040 Legacy" (S:10891-10898). One message joins them (S:10901-10905).
- **Fresh roots.** `initialP15Roots` writes `initialCampaignLegacy(week)` (S:10883-10886; law:947). World generation
  (`src/core/worldgen.ts:821`) and the historical lift (`historical-control.ts:58`) spread it.
- **The step's order.** `validateSaveV45` checks all four keys (S:10967-10969), runs the V44 chain on the stripped state
  (S:10970), then the archive, market and Legacy validators (S:10971-10973), then the one allocator check (S:10974).
- **Frozen builders.** `assertFrozenBuilderRetainsHollywood` refuses through `p15DowngradeRefusal` and strips through
  `stripP15Roots`, both keyed on `P15_ROOT_KEYS` (S:6197-6200). `makeSaveV1` to `makeSaveV18` call it first (for
  example S:6220).
- **The live proof.** `validatedLiveProfessionContext` hands the V41 chain `stripP15Roots(state)` (S:10554), so the
  Legacy never meets its exact-key check. `prepareLiveWritingContext` (`src/core/liveRetirementWriting.ts:19-26`)
  therefore meets no Legacy-caused refusal to swallow (1361-F3 rulings 3 and 4).
- **No V45 state reaches a V44-only validator.** Outside the V44 chain, `validateSaveV44` receives a stripped state
  (S:10970, :10994) or a V44 save (S:10981). The older migrators send 45 through `convertV45ToV44` (for example
  S:7440), which validates V45 first (S:10990). P15C added none of these lines; it added one key to the list they read.

### 2. Migration

- **Up.** `convertV44ToV45` spreads `initialP15Roots(old.state.market.tick)` (S:10983), so the Legacy arrives as
  `{version: 1, recordedFromWeek: market.tick, official: null, endOfRun: null}` with no freeze. A second migration is
  `validateSaveV45` on the save itself (S:10998). L:824 and L:842 pass from (a) (`X/pca/p15c.json`).
- **Down.** `convertV45ToV44` validates, refuses once with every non-empty root named, then strips (S:10989-10995).
  1361-F ruling 4's order holds, and no 1359 leaf needs the Legacy refused before validation (C5, L:885-915, passes
  at (c)).

### 3. The validator (law:1187-1404)

- **Item 1** (law:1203-1211): exact keys, version 1, a whole `recordedFromWeek` in [0, `market.tick`], and a null
  `endOfRun`.
- **Item 2.** At (c) both halves stand (law:1216-1218). At (a) and (b) only "present when not due" stands
  (`p15c-a-r1` law:982; `p15c-b-r1` law:1192).
- **Item 3** (law:1226-1232): the kind, a definition the frozen table holds (`Object.hasOwn`), and that entry's
  boundary and mode.
- **Item 4** (law:1236-1248): a whole sequence of at least 1 and the id that cites it. The phase triple comes from
  `P15_PHASE_TABLES[official.phaseOrderVersion]` behind `Number.isSafeInteger` (law:1244-1245), through the export at
  `src/core/p15Phases.ts:11-18`. "Below next" and "distinct" live in the one allocator check (S:10944-10957), as 1361-F
  ruling 5 requires (O3).
- **Item 5** (law:1250-1330): sources, studios, Standing ranges, the eight archetypes in order, counts against refs,
  lenses and their exact count keys, all bounded by the entry.
- **Item 6** (law:1336-1360): each source against its root. A P15 watermark is the largest sequence below the
  official's, and an array watermark lies within its root.
- **Item 7** (law:1364-1385): every ref resolved through the exported resolver.
- **The replay** (law:1390-1403) runs `entry.evaluate`, which closes over its own id, boundary, mode and thresholds
  (law:914-926). It compares every field but `standingAtBoundary` (law:1407-1428).
- **The era table.** v1 and v2 thresholds are literals (law:867-883), the shared structure is a literal (law:886-910),
  and every level is frozen.
- **Departure 7 holds.** The adapter omits a sibling's fact array exactly when `siblingBefore` returns undefined
  (law:1095-1099), which is exactly when the derived `recordedFromWeek` is null. Item 6 requires the stored value to
  equal the derived one (law:1347) before the replay runs. r4's three deletes (r4 :781-783) could therefore never fire
  on a state that reaches the replay.
- **(a) and (b) against (c).** One class is lawful at (a) and (b) and refused at (c): an industry and a Legacy root
  that both record from before 6240, a save at or past 6240, and `official: null` (law:1217). No freeze exists before
  (c), so every (a) or (b) campaign past 2040 writes one. Under 1361-F ruling 3 (one push, no intermediate commit
  played), no player save can hold one. The reverse class is empty: (b)'s validator is (a)'s plus items 6, 7 and the
  replay, which run only on an official manifest, and (c)'s is (b)'s plus law:1217. A manifest frozen at (c) passes
  (a) and (b). This is the case for O1. Moving the due half into (a) would turn L:343 red at (a) and (b), since it
  saves route L at 6240 (L:361-364).

### 4. The adapter (law:995-1119)

- **Untyped sibling reads** go through `rootOf` and `siblingBefore` (law:964-973), rows through `sequencedRows`
  (law:975-979) and watermarks through `largestSequence` (law:981-988). A root recorded from B or later reads as
  absent.
- **Records.** Each ranking row carries its record's own id as `recordId` (law:1101-1105), the field the archive writes
  (`src/core/powerRankingArchive.ts:154-163`).
- **Condition and market.** Condition events are read untyped, as 1361-F ruling 18 directs (law:1047-1051,
  :1106-1110). Market assessments carry `releaseId`, `studioId`, `week` and `factor < 1` (law:1111-1115).
- **The record-id rule.** The law refuses a repeated (`recordId`, `studioId`) pair (law:489-496; 1359-F3) and keeps the
  (week, studio) rule (law:501-503).
- **F1.** Only an authored film may carry a null `settledWeek` (law:357-362; 1359-F2). Neither law change moves an
  outcome for facts both versions accept.
- **Against the charter.** The rows match 1359-A §3.1-§3.2 field by field. Standing comes from one map of the
  businesses (law:1052); for a validated state with unique studio ids it equals r4's `find` (inferred). A1 to A9 pass
  at (b) (X/pcb: 98 passed).

### 5. The tick

- **Outermost.** TK:1181-1182 returns `freezeCampaignLegacyWeek(recordPowerRankingQuarter(...))`, after
  `rngState: rng.serialize()` and `market.tick: currentTick + 1` (TK:1086-1087). `git diff p15c-b-r1 p15c-c-r1 --
  src/core/tick.ts` holds the import and that return, so step 2.5, (b)'s write (TK:1131) and the F3 guard stand.
- **The guard predicate** (law:1164-1167): an industry, produced week 6240, no official manifest, `originWeek` below B
  and a root recorded from below B. At week 6240 that is the marker rule's `due` (law:1216).
- **Below B.** A save migrated at 6239 freezes on its next tick (L:854 passes at (c)). `powerRanking` reads `limited`,
  which the sibling leaf C3b checks (5 of 5 sibling leaves pass at (c), per the parent). `sharedMarket` reads
  `notRecorded`, because (b)'s write moves its `recordedFromWeek` to the produced week (TK:1131). That departs from
  1359-A:189-190's "limited" by 1361-F5 ruling 2, items 1 and 3.
- **At or past B.** A save at or past B never freezes: later weeks fail `market.tick !== B` (law:1164), and a root
  migrated at B records from B (law:1167). L:866 and L:875 pass.
- **Determinism and cost.** The module imports no RNG and reads no clock (pinned by L:724-726). K2 (L:800) passes. Every
  other tick pays `state.hollywood === null || state.market.tick !== 6240` (law:1164); the freeze tick pays one adapter
  and one law pass (26 ms and 46 ms on the G-P seeds, 1361-E3:302).

### 6. The v2 values and C11's literals

- **TUNING.** `tuning.ts:1042` and :1046-1048 read 60, 20, 49 and 30, and the header cites 1353-T and 1353-F6
  (:1036-1037). The blob is 0010838 at (a) and (c), r4's postimage (r4 :1384). TUNING holds exactly the fifteen
  `LEGACY_*` keys (:1042-1056).
- **The definition.** `CAMPAIGN_LEGACY_DEFINITION` reads `campaign-legacy/v2` (law:76), and `LegacyDefinitionId` types
  the manifest's `definition` (law:101, :198).
- **The literals.** The frozen v1 and v2 thresholds equal C11's V1 and V2 (L:940-961), and the shared structure equals
  ERA_SHAPE (L:922-938). The five p15c1 leaves pass from (a). C11 passes at (c), the first commit where its last
  line can build G6240F (L:1110; X/pcc).

### 7. `historical-control.ts` (departure 10)

- **Read.** The lift spreads `initialP15Roots` (:58). The hash's early return and its discard both name
  `campaignLegacy` (:63, :115). It refuses a non-null `official` (:120-121) and drops the key as `_legacy` beside
  `_sharedMarket` (:127-128).
- **Inferred.** The key leaves the hashed object at the same point as `sharedMarket`, so every hash input matches
  b-r2's. X ran no historical-hash leaf; the fallout run covers one.

### 8. The guard

P15C adds no tick path.

- The freeze runs inside `tick()` after the F3 guard (TK:1071-1074). A state whose market root holds a row refuses
  before the freeze.
- The adapter, the resolver and the validator read market rows (law:1111-1115, :1150-1151) and tick nothing.
- L forges market rows only for `factsFn` (A7 L:603-608, A8 L:647-649). The sibling patch forges none.

### 9. Outside 1359

- **Fallout class.** Outside the 1359 files, my search of `tests/` (fixtures excluded) for 6240, 2040 and the boundary
  constant finds one campaign that ticks an industry through 6240: the 1356 archive harness, which the parent measured.
  The other hits tick no industry through 6240:
  - `tests/p15a1-shared-market-harness.test.ts:65` and `tests/p15a2-power-ranking-harness.test.ts:66` run their laws
    on data;
  - `tests/bridge-p11-ready.test.ts:311` builds a state without an industry, and `tests/p12-checker.test.ts:19` holds
    synthetic metadata;
  - `tests/bridge-p10a-w0-people-projection.test.ts:261` is a calendar label, and
    `tests/bridge-p14b5-relationships.test.ts:205` and `tests/bridge-p14p4p5-opportunities.test.ts:351` are digests
    that contain the digits.
- **Scripts.** `scripts/p13a/performance-generator.mjs:95` and `performance-profile.mjs:75` checkpoint and profile a
  6240-week endurance save whose industry starts fresh at week 0 (`performance-generator.mjs:19`). No listed
  measurement runs them, and at (c) the save they checkpoint at 6240 carries a frozen Legacy (inferred from
  TK:1181-1182).
- **The Bridge cost** (F2) and **the catalogue** (F1) above.
- **Text.** The two law notes of 1359-F6 ruling 5 now hold in both eras (law:90, :287), and no test pins either
  message (`git grep` over `tests`).
- **RED 16.** Only the law spells `postFinaleMode` in `src`, `bridge` and `ui/src`.

## The writer's open items and departures

- **O1:** accept (check 3).
- **O2:** accept for this production (F6).
- **O3:** accept (check 3, item 4).
- **O4 and O6:** text for the closure (F5).
- **O5:** belongs to the next Wave 1 text pass, as 1359-F6 ruling 5 says.
- **O7:** accept. No lawful state of this era carries an `endOfRun`, and the refusal fails closed.
- **Departures.**
  - 1 to 6 hold by reading against 1361-F rulings 4 to 6 and 19 and the shapes above.
  - 7 holds by check 3's argument.
  - 8 holds: `freezeLegacy` returns `{...root, official}` (law:826), and the step writes the same root with the stamp
    (law:1177).
  - 9 holds for validated states (inferred).
  - 10 holds (check 7).
  - 11 holds: the RED patterns match, and all 116 leaves pass (X/pcc).
  - 12 holds: X reports 0 `src` errors at every commit.
- **The parent's table.** My comparison of X's JSON confirms it. No 1359 leaf regresses across `r3b`, `pca`, `pcb` and
  `pcc`. The three message changes at (a) are L:854, L:885 and L:1089, the ones 1361-E3:175-182 predicted.

## Method and deviations

- **Records read in full:** 1361-E3, 1359-A, 1359-F to 1359-F6, 1361-F, 1361-F3, 1361-F4, 1361-F5, 1353-F6, 1353-F7, the
  brief, L, H, `tests/helpers/p15-roots.ts` and the sibling patch r2.
- **Read in part:**
  - 1361-R Parts 1.3 and 2.4, 1361-GP-X:1-80 and 1361-D2's opening section, for format;
  - r4 :250-813 and its index lines;
  - `tests/p15c1-campaign-legacy.test.ts:305-340` and :1860-1925, and the Wave R file's :95-145.
- **Code read:**
  - the three commit diffs, and law at (c) in full;
  - S around the step, the builders and the live proof, and TK around the head and the tail;
  - the helpers and callers cited above.
- **Outputs read.** X's `run.meta`, tsc outputs, `p15c.json` and harness lines. I did not read 1361-F2 or the r8
  classification.
- **Tools.** I ran no node, vitest, tsc, npm, npx, tsx or vite-node. I used `/usr/bin/grep`, `sed`, `awk`, `wc`,
  `shasum`, `diff` and `python3`, which only read X's JSON reports. I did not scan `docs/` recursively, and I opened no
  Owner save and nothing under `tests/fixtures`.
- **Git in the tree.** I used `show`, `diff <a> <b>` (with `--stat` and `-U1`), `rev-parse`, `log --oneline` (once
  with `--format='%h %p'` to read parents), `ls-tree --name-only` and `grep <tag> -- <paths>`.
- **Deviations.**
  - In the real repository I ran `git hash-object` without `-w` on the five oracle files, which reads and writes
    nothing.
  - The lean-ctx read tools named in the user's global instructions were not available in this session, so I read
    through the shell.
- **Writes.** I wrote only this file. The session harness saved one oversized command output (the (a) diff of the law)
  under `~/.claude/projects/` on its own; I wrote nothing there.
