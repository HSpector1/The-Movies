# 1358-J: review of relationship slice B production

**KEEP** (dry-run as staged). No finding blocks a step. Findings 2, 3 and 6 ask the parent to record a reading. Findings 15 to 17 correct 1358-E's expectations for the dry run and its candidate list for the sweep.

## Scope and method

- **When and where.** Reviewed 2026-10-02 (last clock check 01:52 CDT) at HEAD `bc2f6007495951cd44da16275437905a66d5d44d`, branch wip/headless-program-20260916-ts.
- **Inputs.** I checked each input's sha256 (first 16 hex shown):
  - step patches: step 1 `a17b2a4e52bfd4b7`, step 2 `76d4427977da1a95`, step 3 `74ffa04594610fd1`, step 4 `df0c52a33813ff7c`;
  - RED r6: patch `212b798058a8902f`, classification `9ee1abbc99878010` (97 rows: 83 fail, 14 controls);
  - r5 patch `3ca4e3bc7aa08b90`;
  - prod-gen: `contract.py` `0c102823ff3ff18d`, `pins.py` `7ea29a8559ff7923`, `pins.txt` `66198c044add470e`, `rows-r6.txt` `45014f565c8e53cb`.
- **r6 versus r7.** I read r6. r7 is still pending. It changes only comments, classification text and row 58's trailing assertion on the first two titles. Step 4's evidence sentence satisfies that assertion because it names all three pictures (bridge/relationships.ts:203).
- **Scratch repo.** `/Users/zacheryspector/studio-scratch/1358-j/tree` holds `git archive bc2f6007 src bridge generated scripts ui package.json tsconfig.json vitest.config.ts vitest.workspace.ts tests ':!tests/fixtures'`, with no symlinks and no fixtures.
  - Tags: `base` 7ec9469, `red-r5` a700118, `red-r6` f30b16f, `step1` 7a83584, `step2` 885670e, `step3` fadf821, `step4` 2b0471f.
  - Each step patch passes `git apply --check` on red-r5 and on base. Each `stepk` tag is red-r6 plus step k.
  - Pre-image blobs equal HEAD's.
- **Post-image blobs** (first 12 hex). save.ts and types.ts do not change after step 1, and relationshipLabels.ts does not change after step 2. The cumulative change is 13 files, +697/-122.

| Step | File | Blob |
|---|---|---|
| 1 | src/core/index.ts | 33bde0420f1d |
| 1 | src/core/relationships.ts | 1cf7acf57a26 |
| 1 | src/core/save.ts | 818cc73f9692 |
| 1 | src/core/types.ts | fb1dee30818a |
| 2 | src/core/index.ts | 2c8e93b52cf6 |
| 2 | src/core/relationships.ts | 14b5bc2eca0d |
| 2 | src/core/relationshipLabels.ts | b5b4e529810b |
| 3 | src/core/index.ts | 561c200a4dcf |
| 3 | src/core/relationships.ts | e1835f29e7e8 |
| 3 | src/core/talentMarket.ts | c5fd8cf73969 |
| 3 | bridge/finance-upcoming.ts | be472f839332 |
| 4 | bridge/relationships.ts | 5197ffd459d0 |
| 4 | bridge/runtime-checkpoint.ts | 0df9e365a449 |
| 4 | bridge/schema/bridge-schema.ts | 3007ee5e13b2 |
| 4 | bridge/schema/project-studio-bridge.schema.json | d753895d71cd |
| 4 | generated/unity/StudioBridgeDtos.Generated.cs | a155677b2cac |
| 4 | generated/unity/project-studio-bridge.contract-manifest.json | 6e9ec5159a8e |

- **Scripts I wrote.** All are python3 and only print, under `/Users/zacheryspector/studio-scratch/1358-j/`:
  - `check_contract.py`, sha256 `098c8000e9c9c298aa9e064590469877e565928a79e2cb3d4fde3e216b908eff`;
  - `decl_body.py`, sha256 `fdd709dceb26ed979c8821fa39eedc3c67e4be80144baf4835b6ab1dc6470e62`;
  - `romance_end.py`, sha256 `0a6ffaedc586ecdf71818d1afa466af8b17cb6e42199f7b3c4fdcb2217de480a`;
  - unsaved inline checks: the `migrateToVn` branch shape, step containment, and the pin scans behind findings 15 to 17 and the sweep list.
- **Other scratch files.**
  - `head-save.ts`.
  - `package-lock.head.json`: HEAD's lockfile, used for the bundle hash, sha256 `728ee1693d3d4f33d04fc731264e442cb5f00e922fb36943aee9db9bf2e7c5de`.
  - `x-base/` and `x-step4/`: archives where I ran 1358-E's `contract.py verify`. That mode writes only to stdout (contract.py:278-283).
- I started no node, vitest, tsc, tsx or vite-node process. I accessed no Owner save.
- **Disclosures:**
  1. Early in the session I ran `git status --short` once in the real repository. Status may refresh the index's stat cache. It changed no staged content, HEAD or worktree. No later command touched the repository's index.
  2. `git rev-list --objects --missing=print -n1 bc2f6007` wrote an object list to the session scratchpad, and that list includes tests/fixtures paths. I only counted it (8,654 objects, 0 missing, so the archive needed no lazy fetch) and then deleted it unread.
  3. One grep named a tests/fixtures path inside the scratch tree, where that path does not exist. `scripts/generate-bridge-contract-fixtures.ts` imports `tests/fixtures/bridge-contract-union-fixtures.ts`. I did not open that file.

## Findings

1. **Save44 meets 1347-A §4, F6 ruling 1 and 1358-D check 3 (step 1). Non-blocking.**
   - **validateSaveV44** (src/core/save.ts:10763-10772) checks the envelope and validates the relationships root at era 44. It then hands `validateSaveV43` the era-42 projection (`relationshipsAtV42`, :10769-10770). This is the Save42 pattern.
   - **The converters.**
     - `convertV43ToV44` (:10776-10781) adds `competitions: []` and `romance: null` to every edge and reconstructs nothing.
     - `convertV44ToV43` (:10785-10794) refuses by name: "migrateToV43: cannot downgrade or discard the competitions log of <edgeId>" at :10789 and "... the romance of <edgeId>" at :10790.
   - **The live version wiring agrees:** `LIVE_SAVE_VERSION = 44` (:6567), `makeSave` (:6571), the dispatch and its "1 through 44" message (:5443-5445), `migrateToLive` (:10176-10177) and `migrateToV44` (:10796-10799).
   - **The downward branches are complete.**
     - HEAD has 41 `=== 43` lines: the dispatch (:5436), 38 downward branches (:7414-10611), migrateToV42's own (:10657) and migrateToV43's (:10707).
     - Step 1 has 42 `=== 44` lines: the dispatch; 39 downward branches of one shape, from migrateToV4 (:7421) to migrateToV42 (:10702); migrateToV43 (:10753); and migrateToV44 (:10797).
     - A script checked all 39 against `if (save.saveVersion === 44) return migrateToVn(convertV44ToV43(save as SaveFileV44));` and found zero mismatches.
     - 1358-E's "38 downward branches" and 1358-D check 3's list both miss migrateToV42's own branch. The code covers it, so only the count in the record needs correcting.
   - **The era-44 validator** (src/core/relationships.ts:747-794) holds:
     - the log (:748-771) to an array no longer than `sharedCompetitions`, non-decreasing weeks, distinct `productionId`, and non-empty slots in strict slot order;
     - romance (:772-794) to an integer value from 0 to 100, every week inside the recording interval (through `recordedWeek`), bonds in order, only the last bond open, and `endedWeek` ≥ `formedWeek`.
   - That is F6 ruling 1, with no edge-relative bound (D4, F7 ruling 3). Rows 29-43's refusal patterns match these messages.

2. **The validator admits an open bond anchored before it formed. Non-blocking.**
   - No rule at :772-794 ties the open last bond's `formedWeek` to `anchorWeek`.
   - At value 40 or more, such a track derives an ending before its own formation. `romanceStatus` then reads 'ended', and the Bridge prints an `endedLabel` dated before the `sinceLabel`. The next touch records `endedWeek` < `formedWeek`, and the save after that refuses at :793.
   - No engine route writes this shape. `writeRomance` forms a bond only at the write week, and every write re-anchors to the write week (:395-406).
   - No RED leaf stages it, and neither 1347-A §4 nor F6 ruling 1 names the bound.
   - The parent can either record the shape as admitted, or add one rule to step 1 at :788-791 (the open bond's `formedWeek` ≤ `anchorWeek`) with its own RED leaf.

3. **The validator does not hold one open bond per person across edges. Non-blocking.**
   - The engine prevents a second open bond at formation: `thirdPartyBond` (:369-383) blocks the gain while either person holds an open bond with someone else.
   - A hand-built save with two open bonds for one person loads. Both pairs stay Partners until separation ends them, and neither pair gains.
   - 1347-A §2.3 states the condition at formation, and §4 states no stored invariant. Record this with finding 2.

4. **The competitions log and Professional Rivals meet 1347-A §2.1 and §2.4 (step 2). Non-blocking.**
   - **One row per pair per production.** `recordCastingCompetition` (:509-552) collects pairs in an insertion-ordered Map over `SLOT_ORDER` (:516-526), so each row's slots arrive in strict slot order, with no RNG.
     - It appends the row exactly where the counter counts: on a new edge at :537, and on an existing edge at :548, after the `hasDriver` dedup (:542) and the driver and accelerator writes.
     - A greenlight calls it once per production (src/core/actions.ts:590). The first-take validator already allows only one take per production (src/core/promises.ts:1627).
   - **The log never outgrows the counter.** It trails the counter by the competitions recorded before Save44, which `convertV43ToV44` leaves out (save.ts:10779) and the validator admits (relationships.ts:750).
   - **Rivals evidence.** `professionalRivalsEvidence` (src/core/relationshipLabels.ts:52-58) takes the first slot, in slot order, named by at least `RIVALS_SAME_SLOT_COMPETITIONS` rows (2, relationships.ts:57). It cites that slot's first two rows. A row with two slots counts for both.
   - **Copy.** The Bridge (bridge/relationships.ts:208-214) prints "twice in <date>" when both rows fall in the same week.

5. **The romance law meets 1347-A §2.3, F §1-§3, F2 §1-§2 and F7 rulings 4-6 (step 3). Non-blocking.**
   - **Constants and value.** The constants are 75, 40, 10, 5, 104 and 260 (relationships.ts:127-136). `currentRomanceValue` (:181-186) has `currentCloseness`'s shape, with 0 as its target.
   - **The closed form matches the law.** `derivedEndWeek` (:191-195) equals the week-by-week law for every value from 0 to 100, at anchors 0, 7 and 1000.
     - `romance_end.py` used IEEE doubles in the source's order of evaluation, plus an exact-rational oracle. It found zero mismatches.
     - Ending offsets: 40 → 111, 41 → 117, 65 → 208, 75 → 229, 80 → 238, 90 → 252, 100 → 263.
     - A value below 40 ends at its anchor. The offset never falls as the value rises.
   - **The ending recorded on touch.** `recordEnding` (:269-276) writes the derived week once, after that week has arrived, and before anything moves the anchor.
     - Every write runs it first: `writeEdge` (:283), `writeRomance` (:396), and `thirdPartyBond` for third-party edges (:375-379).
     - The only other writer, `newEdge` (:300-316), creates edges with `romance: null`.
     - The recorded week equals the derived week, so no read depends on whether an ending was recorded (`romanceEndWeek`, :200-204).
   - **Status and drift.**
     - `romanceStatus` (:209-212) reads only the track and the week.
     - `currentCloseness` (:169-176) holds the stored closeness while the last bond is open. After the ending, recorded or derived, it counts dormancy from max(`lastEventWeek`, ending) (F2 §2).
   - **Growth and eligibility.**
     - Both romance writes follow the take's own drivers (:455-456 for takes, :362 for successes), so the Friends gate reads the tier those drivers left (F7 ruling 4).
     - A pair below Friends keeps its bond through shared takes, which re-anchor without a gain (:399-404, F7 ruling 5).
     - `thirdPartyBond` runs only on a write that can gain, through the `&&` order at :398. It records every third-party ending it reads and skips the pair's own edge (:374). This satisfies Q4 and Reading B.
   - **Formation** (:402-403) appends `{formedWeek: week, endedWeek: null}` when a gain brings the value to 75 or more and the pair's last bond is closed or absent.

6. **A gaining success moves the anchor. Non-blocking; the parent records the reading.**
   - F2 §1 ends every romance write by setting `anchorWeek` to the write week. The code does this for a success gain (`driveTake` :362 into `writeRomance` :404).
   - F7 ruling 6 reads "Only a shared take resets the anchor (1347-A:51)". The two agree only if ruling 6 covers writes without a gain, which matches 1358-E's Q3 wording ("A success that cannot gain leaves the track alone").
   - The other option, adding the gain at the old anchor, is the "gain then decay" order that F2 §1 rejects.
   - No RED leaf pins the anchor after a success. The success leaves assert only the value (tests/p14b10-romance.test.ts:300-319 and :391-406). One more assertion in either leaf would pin the reading.

7. **The consequences and non-triggers meet 1347-A §2.3 and 1347-F Amendment 2 (step 3). Non-blocking.**
   - **D5** (src/core/talentMarket.ts:920-923):
     - a Partners tie counts as close (band 2) unless its tier is Enemies or Nemeses, where it counts as hostile (band 0);
     - close ties win, then hostility, else none, which is the shipped order;
     - `nemesisOnRoster` still reads tiers alone (:1204).
   - **pairChemistry** (relationships.ts:615-629):
     - Partners read +1 at Strained and above (:622) and -1 at Enemies and Nemeses;
     - the reason 'they are partners' is added (:624);
     - a Partners pair dormant for more than 52 weeks also reads "they have not worked together lately" (:625-627). Both statements are true. The pairing goes to the Owner with F7 ruling 7's copy list.
   - **Expiry note.** `closeTieNote` (bridge/finance-upcoming.ts:36-42) reads the bond at the contract's end week and prefers the partner sentence over the Inseparable one.
   - **Non-triggers.** No romance rule reads employment, retirement or the friendship tier after formation (`romanceStatus`, :209-212).

8. **Projection 57 keeps the disclosure and leak laws (step 4). Non-blocking.**
   - **Schema.**
     - It adds `StudioRelationshipLabel` and `StudioRelationshipRomance` (bridge/schema/bridge-schema.ts:2789-2799), the row's `labels` and nullable `romance` (:2812, :2814), and registers both definitions (:3728-3729).
     - `PROJECTION_VERSION` is 57 (:286).
     - `check_contract.py` confirms the checked-in delta from HEAD is exactly: five `snapshotVersion` constants from 56 to 57, the two definitions, the row's two properties and required list, `$id`, and `x-project-studio.projectionVersion`.
   - **Outgoing schema.** bridge/runtime-checkpoint.ts:64 registers HEAD's schema id `sha256:349b2d3e…bfcec1` as 'projection-v56'. f3f8c209 set the same pattern for projection-v55.
   - **Disclosure.**
     - Rows exist only for counterparts on the viewer's roster at that week (bridge/relationships.ts:244, :256). Labels and the romance block ride on those rows and carry no value, anchor or closeness.
     - Rivals cites only dates of the viewer's own casting sessions; `recordCastingCompetition` refuses any other studio (relationships.ts:513-514).
     - Romance reads null wherever the retirement-dated tier is unavailable (:262, :279, F7 ruling 8).
     - Every romance write coincides with a driver that moves `lastEventWeek`. The one exception is a recorded ending, which equals the derived one. So a retirement-dated read cannot reveal a later bond.

9. **The Mentor gate (F6 ruling 2) is met. Non-blocking.**
   - **The gate.** `citePicture` (bridge/relationships.ts:186-192) cites a rival picture by its title in `state.hollywood.films` and returns null when the film is absent. `mentorLabel` (:196-204) withholds the label unless all three cites exist.
   - **`hollywood.films` membership means released and public.**
     - Rival films enter the list only in the release block of src/core/hollywoodTick.ts. Productions with `remainingTicks === 0` (:379) build a film with `filmId: p.id` and the concept's title (:392) and append it (:397). The same step opens the theatrical run (:398) and appends the `filmReleased` receipt (:403).
     - The only other writer adds authored history at world start, under ids that no take carries (src/core/hollywood.ts:264).
     - The validator holds every simulated film's release at or before the save week (src/core/hollywoodValidation.ts:156-160).
     - The Bridge publishes the list as "Canonical released films" (bridge/industry.ts:31 and :58, Movie Charts at :298), with each film's credits (:342, :354). Announced rival work appears only as projects (:318).
   - **The three cases.**
     - A released rival picture shows Mentor, cited by its public title (row 56).
     - An announced but unreleased rival picture is absent from `films`, so Mentor is withheld (row 57).
     - The viewer's own pictures always cite. The cite falls back from the subject fact's concept, to the released film's concept, to the active production's concept, to "a picture first shot <date>" (:188-191). So ownership alone never withholds (row 58).
   - The dry run cannot show rows 56-58 green, because they fail first at `acceptedEvidence` (finding 15). The runtime proof follows the sweep's move of that pin.

10. **The emulated artifacts hold. Three questions remain for the real generator. Non-blocking.**
    - **1358-E's emulator.** `contract.py` never evaluates bridge-schema.ts. It applies a fixed delta to HEAD's schema JSON (contract.py:278) and emits C# with its own object emitter (:280).
      - Its `verify` mode passes on both HEAD's and step 4's artifacts, reproducing 251 and 253 checked-in classes byte for byte (29 union members skipped).
      - Run on HEAD's artifacts, it emits exactly step 4's schema (sha256 `032d261c…1829`, 403,927 bytes) and C# (sha256 `23e3d843…e49b`, 890,695 bytes).
    - **My independent check** (`check_contract.py`):
      - the schema round-trips as canonical pretty JSON;
      - its identity `sha256:74826ef419bfa816647b3de156de3e24fb50327879e207c844c1e1a12b9c1253` equals the manifest's and the C# header's;
      - the C# hash equals both manifest hashes;
      - the nine-file source bundle, recomputed with HEAD's lockfile, equals the manifest's `4aa01cd55ed9b16edfa454180999f3d49bb5165e0b75739973d926eba31f0f87`.
    - **By reading, the step-4 source yields the emitted shapes:**
      - `enumeration` keeps value order (bridge/schema/dsl.ts:54-58);
      - `array` (:83-87);
      - `nullable` is `anyOf` with null (:89-93);
      - `object` sorts properties and required keys (:108-131);
      - `reference` (:132-137).
    - **Only the real generator settles three things:**
      - that bridge-schema.ts evaluates to exactly these bytes;
      - the C# path through `analyzeContract` and `validateIdentifiers` (scripts/bridge-contract-csharp.ts:1029-1197);
      - the bundle hash over the tree's own package files.
    - **Union fixtures.** generated/unity/tests/StudioBridgeUnionFixtures.Generated.cs names projection 1 and contains no relationship or snapshot type, and step 4 changes neither the C# generator nor the fixture input. That input lives in tests/fixtures, which I did not read, so X5 also runs `npm run check:bridge-contract:fixtures`.
    - **F10 and F11 move at step 4.** They render the whole schema (tests/bridge-contract-generator.test.ts:724-725, `a0f316eb…`, 418,871 bytes).
      - `decl_body.py` reproduces HEAD's pinned value from the checked-in C#, which validates its cut.
      - At step 4 it gives 420,340 bytes and `1dadf88fb7230405a6232fff3a37e3aee9014718200dfdb8baf4ff385ab71fa4`. That value is only a cross-check: the test's provenance rule (:709) asks for a recorded producer run.
      - F12 (:726) must not move.

11. **Step 4 makes `mentorEvidence`'s invariant throw reachable from every snapshot. Non-blocking.**
    - At HEAD, no src or bridge file imports relationshipLabels. Step 4's bridge/relationships.ts:28 is the first, and every snapshot builds the block for every profile.
    - The throw at src/core/relationshipLabels.ts:35-37 (a cohort entrant with a first take before its receipt) would then fail the whole snapshot.
    - That is the right loud failure for a broken invariant. The receipt creates the person's id, so no lawful state reaches it.
    - M2 should still confirm that no snapshot on the natural routes throws `mentorEvidence:`.

12. **Determinism holds, and the cost stays in HEAD's complexity class (check 7). Non-blocking.**
    - **No new nondeterministic reads.** No step adds an RNG, Date, locale or key-order read. The one locale call in the diff is HEAD's `toLocaleString('en-US')`, which appears only because finance-upcoming renames the function around it.
    - **Fixed orders:**
      - the casting pairs follow `SLOT_ORDER`;
      - the ledger and `thirdPartyBond` scans run in array order;
      - Bridge rows sort by counterpart id (bridge/relationships.ts:256);
      - labels keep a fixed order (:265-269);
      - Rivals cites log order.
    - **One order effect touches the law.** If two pairs that share a person both reach 75 in the same week, the first in `delta.takes` and seat-pair order forms a bond. The second then sees an open third-party bond and gains nothing. The order is deterministic, but no RED leaf pins it.
    - **Cost per tick (U3).**
      - Each gain-eligible romance write scans all E edges once (relationships.ts:372-381). An edge with no track costs one comparison.
      - A week therefore costs O(W·E), where W counts the high-proximity repeat pairs and the seat pairs of successful releases that sit at Friends or above.
    - **Cost per row (U3).**
      - Each emitted row calls `mentorEvidence` twice (bridge/relationships.ts:266-267).
      - Each call scans the cohort receipts. A cohort entrant adds an O(F) filter and sort of first takes. A matching Mentor pair adds three O(F) cite lookups.
      - HEAD already pays O(F) per roster counterpart in `sharedPictureCount` (:122-139, called at :257), on every profile in every snapshot. Step 4 stays in that class and adds roughly two to three times HEAD's per-row work for cohort entrants.
      - The subject's own evidence is recomputed for every row of its block. Computing it once per block would remove the repeat.
      - M2 should time snapshot builds on the longest natural route.

13. **Type cleanliness holds by reading, and each step contains the one before (check 6). Non-blocking.**
    - **Imports.** Every new import is used at the step that adds it, under `noUnusedLocals`. talentMarket keeps `tiersOnRoster` (:1204) next to the new `rosterTies` (:920).
    - **Library.** `.at` and `Object.hasOwn` are in lib ES2022.
    - **Narrowings:**
      - `romance == null` covers D1's absent field;
      - `.at(-1)` results are checked for undefined;
      - `mentorLabel` narrows its cites with a type predicate;
      - `romanceRow` returns only after status, ending and bond are non-null (bridge/relationships.ts:217-224).
    - **Strict Picks** name 'romance' (relationships.ts:169, :209, :236) and 'competitions' (relationshipLabels.ts:52).
    - **Containment.** A script confirmed that every line a step adds survives into the next step. The one exception is relationships.ts:29, which step 3 extends with `RomanceTrack`.

14. **1358-E's row map holds for all 97 rows (check 5). Non-blocking.**
    - **The 14 controls** (0, 1, 2, 4, 9, 10, 48, 53, 55, 74, 87, 88, 93, 96) pass at every step:
      - row 0 through D1's lenience;
      - row 2 because `live()` receives an engine edge that carries both fields;
      - row 4 through `withEdges` and the engine alone.
    - **Spot arithmetic:**
      - row 74: 45+6+1 = 52, below Friends, so no gain;
      - row 80: at span 97 the value reads 50-18 = 32, then 42 after the gain (F2 §1's order);
      - row 85: the third-party ending falls at anchor+238 (value 80) and gets recorded;
      - row 89: closeness 45 holds until take week+252 (value 90), then reads 40, Strained;
      - rows 91 and 94 end at 1263 and 1252.
    - **The red lists.** The lists in "What each step leaves red" hold for the classified rows.

15. **1358-E's per-step expectations miss fallout that X5 will see. Non-blocking for the production; X5 should use these corrections.**
    - **Step 1, root type gate:** two errors that 1358-E places later or omits.
      - tests/p14b10-conflict-evidence.test.ts:108 returns a `RelationshipEdge` whose new fields arrive only through a `Partial<RelationshipEdge>` spread, so the type sees them as optional.
      - tests/p14b4-material-evidence-core.test.ts:293 assigns `migrateToLive`'s `SaveFileV44` to `EnvelopeV33`, which :40 defines as `ReturnType<typeof validateSaveV43>`.
    - **Step 3, root type gate:**
      - tests/p14b5-relationships.test.ts errors at about twenty call sites. Its local `Edge` type (:93-99) lacks `romance`, and `edges` (:182), `findEdge` (:191), `mintedEdge` (:220) and `stagedEdge` (:228) all return that type.
      - These sites include the RED's own family 6c lines :1137 and :1147, so a RED file fails the root gate from step 3 until the sweep.
      - tests/p5b5-t-failure-tuning.test.ts errors only at :295 and :373.
    - **False positives in 1358-E's list:**
      - tests/p14b9-casting-competition.test.ts:339, because `edgeOf` returns a `RelationshipEdge` from state (:205-206);
      - tests/p14b5-t-failure-tuning.test.ts:347-368, because `findEdge` returns `RelationshipEdge` (:80);
      - tests/p14b9-save-v42.test.ts:71, 174 and 175, which are a type import and the V43 functions' own signatures.
    - **Runtime failures in p14b5-relationships outside its classified rows, from step 1:**
      - the minted-edge oracles (:583, :661), since engine edges now carry `competitions: []` and `romance: null`;
      - the `stage()` leaves (:235), which fail at the Save44 validator;
      - the `validateSaveV43` lines (:1297, :1311, :1317, :1359, :1439);
      - the era-42 call (:1301).
    - **Rows 56-58** fail first at tests/helpers/p14c3-genuine-evidence-fixtures.ts:17 with `expected 44 to be 43`, at every step.

16. **Under D1, a missing `competitions` fails as a TypeError. Non-blocking.**
    - F7 ruling 1 accepted D1, which gives `romance` lenience and `competitions` none.
    - A staged edge without `competitions` throws a TypeError, without a named refusal, at two places:
      - relationships.ts:548 (`[...next.competitions, row]`), from step 2;
      - relationshipLabels.ts:54, through `rivalsLabel` (bridge/relationships.ts:209), from step 4.
    - **For attribution in M2 and N:** "is not iterable" from :548, or "reading 'filter'" from :54, means a staged edge without the field.
    - **One route that can reach :548.** tests/p14b9-save-v42.test.ts:183 lifts a V43 state through `convertV42ToV43` and greenlights a cast with a complete casting session (:189-196). If any contested pair already holds an edge, the leaf throws there from step 2. At step 1 it fails later, at `makeSave` (:203).

17. **Some Save43 refusal leaves will pass for the wrong reason once the shared helpers move. Non-blocking for the production; the sweep must reach them.**
    - tests/helpers/p14c2rm-fixtures.ts:23-24 sends every writer fixture through `validateSaveV43`. At step 1, every leaf of tests/p14c2rm-writer-continuation.test.ts therefore fails loudly.
    - Once the sweep moves that helper, two kinds of leaves keep passing on the version mismatch alone, so M2 will report them green:
      - the file's bare `.toThrow()` leaves on `validateSaveV43` of a live envelope: :218, :232, :241 and :242 (the `envelope` helper stamps `LIVE_SAVE_VERSION`, :37);
      - the unlisted live chain at :254, `convertV43ToV42(makeSave(...))` under a bare `.toThrow()`.
    - tests/p12-starting-world.test.ts:52 expects `/cannot downgrade/` from a live chain. After the sweep inserts `convertV44ToV43`, the Save44 refusal matches that pattern whenever the state holds a log row or a bond.
    - The older `/cannot downgrade/` leaves in the Save20-28 tests read historical envelopes, whose Save44 fields stay empty.

## What the dry run 1358-X5 must show

Every step:

1. The step patch applies with `git apply --check` on the RED commit (r7 plus the minted capture), and `git hash-object` of each touched file equals the blob table above.
2. The six RED files run, and controls 0, 1, 2, 4, 9, 10, 48, 53, 55, 74, 87, 88 and 93 pass.
3. Rows 56-58 fail first at tests/helpers/p14c3-genuine-evidence-fixtures.ts:17 with `expected 44 to be 43`. Any other first failure is a new finding.
4. The root, UI and Bridge type gates run.
   - Every root-gate error outside the RED's own expected errors falls in finding 15's lists.
   - The UI and Bridge gates show no new error.
5. Every failing leaf in the six RED files outside the classified rows sits in p14b5-relationships, at the sites finding 15 lists.

Step 1 (Save44):

- Rows 24-27 and 29-45 turn green; rows 27, 44 and 45 need the minted capture. 1358-E's step-1 list stays red.
- The root gate shows the RED's own errors plus tests/p14b10-conflict-evidence.test.ts:108 and tests/p14b4-material-evidence-core.test.ts:293.

Step 2 (the log and Rivals):

- Rows 5-8, 11, 12-23 and 28 turn green. Step 2's exports clear their TS2305 errors.
- No RED leaf stages an edge without `competitions`, so no TypeError from relationships.ts:548 appears in the six files.

Step 3 (romance):

- Rows 3, 59, 60-73, 75-86, 89-92, 94 and 95 turn green. Row 96's two `@ts-expect-error` lines now have their errors, so TS2578 goes away.
- The root gate adds the strict-Pick errors:
  - about twenty sites in p14b5-relationships, including :1137 and :1147;
  - p14b5-t-failure-tuning at :295 and :373;
  - none at p14b9-casting-competition:339 or p14b5-t-failure-tuning:347-368.

Step 4 (projection 57):

- Rows 46, 47, 49-52 and 54 turn green, and rows 48, 53 and 55 stay green. Only rows 56-58 stay red, at `acceptedEvidence`.
- `npm run generate:bridge-contract -- --check` passes with:
  - schema id `sha256:74826ef4…1253`;
  - schema file sha256 `032d261c…1829` (403,927 bytes);
  - C# sha256 `23e3d843…e49b` (890,695 bytes);
  - source bundle `4aa01cd5…0f87`.
- `npm run check:bridge-contract:fixtures` passes with no change.

## For the sweep plan 1358-N

1. **Move `acceptedEvidence` first, per F7.** Change tests/helpers/p14c3-genuine-evidence-fixtures.ts:17-18 to 44 and `validateSaveV44`.
   - Then rows 56-58 and tests/p14b10-mentor-label.test.ts must pass on step 4:
     - row 56 cites the released rival titles;
     - row 57 withholds;
     - row 58 cites the concept titles and meets r7's first-two-titles assertion.
   - Record the first Mentor leaf's duration against F6 ruling 5's 49,182 ms.
2. **Fix p14b5-relationships at the type.** In tests/p14b5-relationships.test.ts, add both fields to the local `Edge` type (:93-99), and give `mintedEdge` (:220) and `stagedEdge` (:228) `competitions: []` and `romance: null`.
   - This one change clears the step-3 type errors (including :1137 and :1147), the minted oracles (:583, :661) and the `stage()` validator failures.
   - F7 ruling 1 names only `stagedEdge` and `stage()`. The fix belongs in the type.
3. **Widen the candidate list.** pins.py scans tests, tests/helpers, tests/contracts, tests/three-visual-regression, bridge/testing and scripts (pins.py:7-8). It misses these kinds and forms:
   - a. **The UI project.** Eight live-43 pins in five files:
     - ui/src/saves.test.tsx:126;
     - ui/src/session.test.tsx:332, 360, 387;
     - ui/src/engine/d17-save-migration.test.ts:131, 155;
     - ui/src/engine/film-chronicle-adapter.test.ts:289;
     - ui/src/lot/snapshot/v14SetHolderBoundary.test.ts:46.
   - b. **Future-version sentinels stamped 44 (1344-N S3):** 23 lines in 15 files.
     - tests/d17a-adv-migration.test.ts:274 and tests/d17b-save-v7.test.ts:163 are missing from pins.txt entirely.
     - The others appear only through a neighbouring "1 through 43" line, for example tests/construction-save-v11.test.ts:553-554, tests/p13b-r07-save-v25.test.ts:274-275, tests/p14a1-save-v28.test.ts:255-256 and tests/p14b1-save-v29.test.ts:205-206.
     - Each sentinel moves to 45 together with its message.
   - c. **Live-to-older chains (S4).** `convertV43ToV42(` appears on 31 lines in 21 files. Each one fed live output needs `convertV44ToV43` first.
     - Four helpers outside 1358-E's helper list carry such chains: tests/helpers/p14c2b-fixtures.ts:69 (five importers), tests/helpers/p14c4-fixtures.ts:71 (two), tests/helpers/p14c3-canonical-rival-fixtures.ts:198 (one) and tests/helpers/p14p3-fixtures.ts:110 (two).
     - The genuine V43 envelopes at tests/p14d1-rival-shelving-save-v43.test.ts:235-263 stay as they are.
   - d. **First-guard masking (S9).** Once a live save holds a log row or a bond, `convertV44ToV43` refuses before the older guards run.
     - Exact-message leaves at risk: tests/p14c3-dual-extensions.test.ts:178, tests/p14c3-offmenu-extensions.test.ts:235, tests/p14c3-profession-history.test.ts:119, tests/p14c3-transitions.test.ts:175 and :207, and tests/p14c3-cohort-transition.test.ts:287.
     - tests/p12-starting-world.test.ts:52 would pass on the refusal instead (finding 17).
   - e. **Hand-lifted "live" states that stop at V43 (S5):**
     - tests/p14c1-materialized-aging.test.ts:175;
     - tests/p14b9-save-v42.test.ts:183;
     - tests/p14d1-rival-shelving.test.ts:561;
     - the expected envelope stamped 43 at tests/bridge-p14b2-checkpoint.test.ts:92.
   - f. **Whole-edge oracles:** the minted oracles from item 2, and tests/p14p4p5-post-capacity.test.ts:347 (an edge literal under `toEqual`).
   - g. **`validateRelationshipsRoot(<live>, 42)` calls:** tests/p14b5-t-failure-tuning.test.ts:117, :123, :433 and :489, and tests/p14b5-relationships.test.ts:1301. Each moves to era 44.
   - h. **A typed helper:** tests/p14b4-material-evidence-core.test.ts:40 (`EnvelopeV33`), which types live output at :293.
   - i. **Vacuous passes (finding 17):**
     - tests/p14c2rm-writer-continuation.test.ts:218, :232, :241 and :242 each need a message pattern when they move to V44;
     - :254 needs the chain fix and a pattern;
     - tests/p12-starting-world.test.ts:52 needs a clean state or a tighter pattern.
   - j. **Projection-56 pins the grep misses:**
     - tests/bridge-schema.test.ts:341 (`/expected literal 56/`) and :576 (`'public const int ProjectionVersion = 56;'`);
     - tests/bridge-p14b6-relationship-read-models.test.ts:103 (`INCOMING_PROJECTION = 56`, read at :777, :782, :802 and :803);
     - the leaf title at tests/bridge-p14a1-release-busy-set.test.ts:214.
   - k. **Live-43 pins the grep misses:**
     - tests/film-chronicle.test.ts:923 (`if (restored.saveVersion !== 43) return;`). If :922 moves alone, this guard turns the leaf vacuous. Move both lines, or make the guard throw.
     - tests/p14b1-save-v29.test.ts:110 (`LIVE_SAVE_VERSION as number`);
     - tests/p14c3-queued-writing-proof.test.ts:27 (an envelope helper stamped 43);
     - leaf titles that name 43: tests/p13b-s7-announcements.test.ts:86, tests/p14b5-save-v31.test.ts:195, tests/p14b9-save-v42.test.ts:212, tests/p14d1-rival-shelving.test.ts:186, tests/p14d1-rival-shelving-save-v43.test.ts:45 and tests/save.test.ts:453;
     - the sentinel titles at tests/p13b-s2-save-v22.test.ts:211, tests/p13b-s3-save-v23.test.ts:124, tests/p13b-s8-save-v27.test.ts:211, tests/p14a1-save-v28.test.ts:252 and tests/p14b1-save-v29.test.ts:202.
     - A renamed title is a new test identity. Record each rename the way r6 recorded family 4's.
   - l. **Whole-schema declaration bodies.** F10 and F11 at tests/bridge-contract-generator.test.ts:724-725 take their new value from a recorded producer run, with finding 10's value as the cross-check. F12 (:726) stays.
   - m. **A new test identity.** The `it.each` over the prior-schema roster (tests/bridge-runtime-checkpoint.test.ts:763) gains a projection-v56 case. Its `toBe(43)` at :782 is already on the list.
   - n. **Bytes and natural values (S10).**
     - Each edge serializes 33 more bytes in compact JSON (`,"competitions":[]` and `,"romance":null`). Any digest or byte count over a live save with edges moves from step 1.
     - From step 3, a formed bond changes tiers through the drift exemption, and through them D5, `nemesisOnRoster`, chemistry and the Bridge rows.
     - Rerun the §7 natural routes (the 1348-X7 analog) and re-mint whatever moves.
4. **Attribute finding 16's TypeErrors to staged edges**, never to the production.
5. **Out of scope:** bridge/testing/c3-active-endurance-observer.ts:41 asserts projection 53 and was already stale at HEAD. Leave it unchanged.
