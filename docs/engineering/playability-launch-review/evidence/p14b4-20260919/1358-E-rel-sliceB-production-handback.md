# 1358-E: P14B relationship slice B production handback

Role: the single production writer for relationship slice B. Scope: the Save44 `competitions` log and `romance`
track, Professional Rivals, the romance law and its consequences, and Bridge projection 57. I wrote four cumulative
step patches in a scratch tree against RED r5 and checked them against r6. I ran no vitest, tsc, node, tsx or
vite-node, and I edited no test. Every type and behavior claim below comes from reading the code against the
tests; the only programs I ran were read-only git and python that prints.

**Status: complete by reading.** All 97 classified rows map to code (table below). Three conditions outside
production decide the full count:

1. Rows 27, 44 and 45 read the GENUINE V43 capture. The parent mints it with 1358-P before the run.
2. Rows 56, 57 and 58 build their world through `cohortThreeFilms()`, which calls `acceptedEvidence()`.
   `tests/helpers/p14c3-genuine-evidence-fixtures.ts:17-18` pins `saved.saveVersion` at 43 and calls
   `validateSaveV43(saved)`. Once Save44 is live both lines fail, so these rows stay red until the sweep moves
   that helper. This is the r1 situation again (the pin at 42 during the Save43 step).
3. I emulated the generated contract artifacts in python. The parent confirms them with
   `npm run generate:bridge-contract -- --check` before any other step-4 run.

## Authority read

E is `docs/engineering/playability-launch-review/evidence/p14b4-20260919`.

- Parent rulings 1358-F, F2, F3 and F4, all in E. F5 arrived during the work. It routes two findings to
  production (non-decreasing log weeks, and p14b5's `stage()` fields for the sweep) and changes nothing else I
  write.
- 1347-A §2-§4 and §6 as adopted by 1347-F (Amendments 1 and 2, the eligibility note, the Addendum).
- RED r5 (`1358-rel-sliceB-red-r5.patch`, sha256 `3ca4e3bc…`), its classification, 1358-C5, review 1358-D, dry run
  1358-X3. RED r6 (sha256 `212b7980…`) and 1358-C6.
- Model: 1348-E.

## Base and tree

- Real HEAD at the start: `85ffc6bc`. At the end: `bc2f6007`. The two commits between touch only `docs/` and
  `HANDOFF.md`. For every file the patches touch, `git rev-parse 85ffc6bc:<path>` equals the scratch base blob.
- Tree: `/Users/zacheryspector/studio-scratch/1358-prod/tree`, built the 1327-C way. `docs`, `node_modules`, `art`,
  `tools` and `tests/fixtures` are links. I wrote nothing under a link and nothing in the real repository.

| Tag | Commit | Content |
|---|---|---|
| `base` | `3403f5d` | archive of HEAD's source paths and tests without fixtures |
| `red-r5` | `a231c96` | r5 applied with `--include='tests/*'` |
| `step1` to `step4` | `5a8fbd3`, `8b563df`, `3eb2bea`, `8f575a7` | the production, one commit per step |
| `red-r6` | `5de3a8d` | r6 applied on `base` the same way, for the apply check |

Apply check: each step patch passes `git apply --check` on `red-r6` and on `base` (HEAD with no RED). No patch
touches a test file, so they apply under r5, r6 or no RED at all.

## Patches

Each file is `git diff red-r5 step<k>`: cumulative and production only. All four sit in
`/Users/zacheryspector/studio-scratch/1358-prod/`.

| File | Bytes | sha256 |
|---|---:|---|
| `1358-rel-sliceB-production-step1.patch` | 46,831 | `a17b2a4e52bfd4b725db3caa541ff03fd0e9c4f521d98d49fc9eb45146cf6d73` |
| `1358-rel-sliceB-production-step2.patch` | 54,126 | `76d4427977da1a954067ab20c0a22e12fc338de424c1867957300264c729c8e3` |
| `1358-rel-sliceB-production-step3.patch` | 77,487 | `74ffa04594610fd1c30de1d32ee8e30af674625dc2bf902cb0ac1271eb75ce4a` |
| `1358-rel-sliceB-production-step4.patch` | 313,748 | `df0c52a33813ff7c41baf33b6b5b31d1164fbeee3eaf33d73616c70aa1604f4a` |

## Per step

**Step 1: Save44.** Files and increment: `src/core/types.ts` +33/-1, `src/core/relationships.ts` +77/-9,
`src/core/save.ts` +103/-13, `src/core/index.ts` +10/-1.

- `types.ts`: `RelationshipCompetition = { week; productionId; slots: readonly CastSlot[] }`, `RomanceBond`,
  `RomanceTrack`. `RelationshipEdge` gains `competitions` and `romance: RomanceTrack | null`. `GameState` is now
  `GameStateV44`.
- `relationships.ts`: `newEdge` writes `competitions: []` and `romance: null`.
  `validateRelationshipsRoot(state, era: 31 | 42 | 44)` checks at era 44:
  - exactly the V42 keys plus the two new ones;
  - the log: an array of at most `sharedCompetitions` rows, weeks in non-decreasing order (two productions can
    contest in one week: P3a and P3b, F5 item 3), distinct production refs, and non-empty slots in slot order
    with no repeat;
  - romance: null, or `{value, anchorWeek, bonds}` with an integer value from 0 to 100, bonds in order (each formed
    at or after the previous ending), only the last bond open, and no `endedWeek` before its `formedWeek`.

  Every week takes the existing recording-interval bound and no edge-relative bound (decision D4).
  `relationshipsAtV31` also drops the two fields, and the new `relationshipsAtV42` drops only them.
- `save.ts`: `SaveFileV44`, `LIVE_SAVE_VERSION = 44`, and `makeSave` validates at 44. The dispatch reads "1 through
  44". `validateSaveV44` validates its own root at era 44, then hands the frozen V43 chain the era-42 projection
  (the Save42 pattern). `convertV43ToV44` adds `[]` and `null` and moves nothing else. `convertV44ToV43` refuses by
  name: "migrateToV43: cannot downgrade or discard the competitions log of <edgeId>" and "... the romance of
  <edgeId>". `migrateToV44` and `migrateToLive` lift to 44, and 38 downward `=== 44` branches route Save44 down
  the chain.
- `index.ts`: the three types, the four save functions, `SaveFileV44`, `GameStateV44`, `relationshipsAtV42`.

**Step 2: the competitions log and Rivals.** Increment: `relationships.ts` +23/-15, `relationshipLabels.ts`
+22/-2, `index.ts` +1.

- `RIVALS_SAME_SLOT_COMPETITIONS = 2`.
- `recordCastingCompetition` gathers each pair's contested slots in slot order (`SLOT_ORDER` from `tuning.ts`) and
  appends one row `{week, productionId, slots}` exactly where the counter counts. A new edge starts with its row,
  and an existing edge gets the row after its driver and accelerator. The log therefore never outgrows
  `sharedCompetitions`, and the `hasDriver` dedup is unchanged.
- `relationshipLabels.ts`: `RivalsEvidence` and `professionalRivalsEvidence(edge)`. The first slot in slot order
  with two rows names the label, and that slot's first two rows are the evidence. Like `mentorEvidence`, it stays
  out of `index.ts` (the 1346-E precedent).

**Step 3: romance.** Increment: `relationships.ts` +148/-22, `talentMarket.ts` +12/-9,
`bridge/finance-upcoming.ts` +12/-6, `index.ts` +11/-1.

- Constants (1347-A §3): formation 75, exit 40, proximity gain 10, success gain 5, grace 104, decay 260.
- Reads:
  - `currentRomanceValue(romance, week)` holds the value through the grace window, then falls linearly to 0:
    `value - trunc(value * span / 260)`.
  - The private `derivedEndWeek` gives the first week the value reads below 40 in closed form:
    `anchor + 104 + ceil(260 * (value - 39) / value)`, or the anchor itself for a value below 40. A python check
    against the week-by-week read found no mismatch for any value from 0 to 100 (75 ends at +229, 80 at +238,
    90 at +252, 100 at +263).
  - `romanceEndWeek(romance)` returns the last bond's ending, recorded or derived, and null when no bond formed.
    It is exported because the Bridge needs it.
  - `romanceStatus(edge, week)` takes two arguments and returns 'partners' before that ending, 'ended' from it,
    and null without a bond.
- Drift exemption (F §3): `currentCloseness` and `currentTier` take the strict Picks with `romance`. While the
  bond is open the stored closeness holds. After the ending, dormancy counts from `max(lastEventWeek, ending)`,
  so recording a derived ending later changes no closeness.
- The ending on touch: `recordEnding` runs first in `writeEdge` and in every romance write. It writes the derived
  week into `endedWeek` once and moves nothing else.
- Growth and formation at the tick seam (F §2, F2 item 1), in `writeRomance`:
  - It runs after each existing edge's take drivers, with gain 10 for a high-proximity pair (director-lead or
    lead-antagonist) from the second shared production and 0 otherwise. It also runs after each success driver,
    with gain 5.
  - Order: record any ending, read the value at the write week, add the gain, clamp to 0..100, set the anchor to
    the write week.
  - A gain needs Friends or above on the edge as this write left it (Q1), and no open bond for either person
    with a third party (Reading B). `thirdPartyBond` records every third-party ending it reads.
  - A take writes even without a gain when a track exists, because any shared take resets the anchor. A success
    writes only when it gains (Q3).
  - Formation appends `{formedWeek: week, endedWeek: null}` when the gain brings the value to 75 or more and the
    pair holds no open bond.
- Consequences:
  - D5: `rosterTies` and `RosterTie` return `{tier, partners}`, and `tiersOnRoster` maps them to tiers.
    `talentMarket.ts` counts a Partners tie as close (band 2) unless its tier is Enemies or Nemeses, where it
    counts as hostile (band 0). The shipped order holds (1347-F Amendment 2).
  - `pairChemistry`: Partners read +1 at Strained and above and add the reason 'they are partners'.
  - `financeUpcoming`: `closeTieNote` (renamed from `inseparableNote`) adds " <name> works here and is their
    partner; letting the contract lapse separates them." for a Partners counterpart at any tier, read at the
    expiry week.
- Non-triggers hold by construction. `romanceStatus` reads only the track and the week, and no romance rule reads
  employment or retirement.

**Step 4: projection 57.** Increment: `bridge/relationships.ts` +60/-3, `bridge/runtime-checkpoint.ts` +4,
`bridge/schema/bridge-schema.ts` +25/-1, and the three generated files.

- `bridge-schema.ts`: `PROJECTION_VERSION = 57` with its comment.
  `StudioRelationshipLabel {label: 'Mentor' | 'Professional Rivals', evidence}` and
  `StudioRelationshipRomance {status: 'partners' | 'ended', sinceLabel, endedLabel | null}`. The row gains
  `labels` and `romance`, and both definitions join `$defs`.
- `bridge/relationships.ts`: each disclosed row carries its labels and its romance block. The disclosure law and
  the leak law are unchanged, since rows still come only from the roster.
  - Mentor: `mentorEvidence` in both directions of the pair. `citePicture` cites a rival picture only once
    `hollywood.films` holds it, by its public title, and otherwise withholds the label. It cites a picture of the
    viewer's own, released or not, by its concept title, found through the first-take subject fact, then the
    released film, then the active production. The gate covers rival pictures only (F4 item 1).
  - Rivals: "They competed for {the lead | the antagonist | the supporting role} in {date} and {date}.", or
    "twice in {date}" when both rows share a week. Each date is `campaignDate(week).label`.
  - Romance: `{status, sinceLabel, endedLabel}` from the last bond, with `endedLabel` the recorded or derived
    ending. It is null without a bond, and null when the retirement-dated tier is unavailable, like the tier.
- `runtime-checkpoint.ts` registers the outgoing56 identity `sha256:349b2d3e…bfcec1` as `projection-v56`, in the
  same step as the bump, after the projection-56 commit's pattern (f3f8c209).
- Generated: `bridge/schema/project-studio-bridge.schema.json`,
  `generated/unity/StudioBridgeDtos.Generated.cs`, `generated/unity/project-studio-bridge.contract-manifest.json`.

## The generated contract artifacts

Method: `gen/contract.py` emulates `scripts/generate-bridge-contract.ts`: canonical JSON, the schema identity,
the C# object and vocabulary emission, the 3,000-character schema chunks and the CF09 source-bundle hash. It reads
and prints. I redirected its output into `gen/out/` and copied the three files into the tree.

Self-check on the checked-in projection-56 artifacts, before any change, all PASS:

- the schema JSON round-trips byte for byte, and its identity equals the manifest's `schemaId`;
- the C# canonical-schema block regenerates byte for byte, and the C# file hash equals both manifest hashes;
- the object emitter reproduces all 251 ordinary classes and their vocabularies byte for byte (it skips 29 union
  members, none of which this step touches);
- the source-bundle hash over step 3's nine sources equals the manifest's `4382f43e…`.

After the change the same checks pass on the new files (253 classes), and the bundle hash over step 4's sources
equals the new manifest.

| Value | Projection 57 |
|---|---|
| `schemaId` | `sha256:74826ef419bfa816647b3de156de3e24fb50327879e207c844c1e1a12b9c1253` |
| C# file, 890,695 bytes (both manifest hashes) | `23e3d843d0e74eddb1d17e057640f0905faf2727afecaebac0ef33349275e49b` |
| `generatorSourceSha256` | `4aa01cd55ed9b16edfa454180999f3d49bb5165e0b75739973d926eba31f0f87` |
| Schema JSON | 403,927 bytes |

A later byte change to `bridge-schema.ts`, comments included, moves `generatorSourceSha256`, so any such edit
needs a regenerate.

## RED row map

Row numbers follow the r6 classification's order (0 to 96). r5's order is the same; only row 58 changed its name
in r6. "All" means the row passes at every step.

**tests/p14b5-relationships.test.ts**

| Rows | Step | Code |
|---|---|---|
| 0, 1, 2 (control) | all | Row 0 calls `currentTier` on p14b5's `stagedEdge`, which has no `romance`. `romanceEndWeek` and `recordEnding` read the missing field as null, so the row passes at runtime (D1). Row 2 restages a minted edge, which carries both fields, through `live()`. |
| 3 | 3 | `talentMarket.ts:920`: a Partners tie at Friends is close, band 2. |
| 4 (control) | all | A hostile Partners tie stays band 0. |

**tests/p14b10-competitions-log.test.ts**

| Rows | Step | Code |
|---|---|---|
| 5, 6, 7, 8, 11 | 2 | `recordCastingCompetition` rows. P3a and P3b share a week, which the step 1 validator admits. |
| 9, 10 (control) | all | No RNG; conflict evidence unchanged. |

**tests/p14b10-labels.test.ts**

| Rows | Step | Code |
|---|---|---|
| 12 to 23 | 2 | `RIVALS_SAME_SLOT_COMPETITIONS`, `professionalRivalsEvidence`; `hasConflictEvidence` unchanged. |

**tests/p14b10-save-v44.test.ts**

| Rows | Step | Code |
|---|---|---|
| 24, 25, 26, 29 to 43 | 1 | `validateSaveV44`, the converters and the validator's messages. Each refusal carries a word its regex names: week order (29), "repeats an earlier row's production" (30), "non-empty array of cast slots" (31), "slot order" (32), "more rows than sharedCompetitions" (33), "romance.value must be an integer from 0 to 100" (35, 36), "out of order" (37, r6's `endedWeek` 101), "only the last bond may be open" (38), "cannot downgrade or discard" (42, 43). |
| 28 | 2 | Needs `professionalRivalsEvidence` beside step 1's converters. |
| 27, 44, 45 | 1, with the mint | GENUINE capture. |

**tests/bridge-p14b10-relationship-labels.test.ts**

| Rows | Step | Code |
|---|---|---|
| 46 | 4 | `PROJECTION_VERSION` 57. |
| 47, 49 | 4 | `rivalsLabel`: both dates appear; no shared slot, no label. |
| 48, 53, 55 (control) | all | Disclosure and leak laws unchanged. |
| 50, 51, 52 | 4 | `romanceRow`. |
| 54 | 4 | A label row is exactly `{label, evidence}`. |
| 56 | 4, with the sweep | `mentorLabel`; own released pictures cite their concept titles. |
| 57 | 4, with the sweep | The rival picture is absent from `hollywood.films`, so `citePicture` returns null and Mentor is withheld. |
| 58 | 4, with the sweep | r6 reads the route's own state before the third release. The first-take subject fact names the production's concept, so the evidence contains its title. r5's variant passes the same way. |
| 59 | 3 | `closeTieNote`. |

**tests/p14b10-romance.test.ts**

| Rows | Step | Code |
|---|---|---|
| 60, 61 | 3 | Constants. |
| 62 to 66 | 3 | `currentRomanceValue`. |
| 67 to 73 | 3 | `romanceStatus` (two arguments). |
| 74 (control) | all | 45 + 6 + 1 = 52 reads Acquaintances under either eligibility reading. |
| 75 | 3 | `thirdPartyBond` blocks the gain. The take still materializes and re-anchors the track, which stays at 65 with no bond. |
| 76 | 3 | Reading B: the pair's own open bond never blocks; 96 + 5 clamps to 100 and appends no second bond. |
| 77, 78, 79 | 3 | Proximity gain for director-lead and lead-antagonist; low proximity re-anchors only. |
| 80 | 3 | Write order: 50 decays to 32 at 201 weeks, then +10 gives 42. |
| 81 | 3 | Success gain on a new track. |
| 82, 83, 84 | 3 | Formation at the crossing write; re-formation appends. |
| 85 | 3 | The formation check records the third party's derived ending (its anchor + 238) and does not block. |
| 86 | 3 | `writeEdge` records the derived ending before the take's drivers apply. |
| 87, 88 (control) | all | A recorded ending never moves; the twin edges agree apart from `romance`. |
| 89 | 3 | The flop drops the pair to Strained and the bond stays open. |
| 90 | 3 | `pairChemistry`. |
| 91, 92, 94, 95 | 3 | Drift exemption and resumption. |
| 93 (control) | all | A later ordinary driver anchors the dormancy. |
| 96 (control, type gate) | 3 | The strict Picks give both `@ts-expect-error` lines their error. |

History: r4's Mentor leaf at :280 withheld the label for the viewer's own unreleased picture. F4 item 1 overruled
it, r5 replaced it, and r6 restaged it as an in-production picture. The production follows F4.

## What each step leaves red

By reading, for the 97 rows:

- **After step 1:** 3, 5 to 8, 11, 12 to 23, 28, 46, 47, 49 to 52, 54, 56 to 59, 60 to 73, 75 to 86, 89 to 92,
  94, 95, plus the type gate for 96. Rows 27, 44 and 45 pass once the capture exists.
- **After step 2:** step 1's list less 5 to 8, 11, 12 to 23 and 28.
- **After step 3:** 46, 47, 49 to 52, 54 and 56 to 58. The 17 RED type errors are gone: TS2305 by steps 2 and 3,
  TS2353 and TS2578 by step 3.
- **After step 4:** only 56, 57 and 58, until the sweep moves the `acceptedEvidence` pin.

Outside the rows, each step adds the sweep's fallout: step 1 the Save44 pins and staged edges without the new
fields; step 3 the strict-Pick type errors; step 4 the projection-57 pins.

## Expected pin moves (the sweep's work)

`gen/pins.py` greps the tree's tests (never `tests/fixtures`), `bridge/testing` and `scripts`. Its full output is
`gen/pins.txt`. The RED's own files are excluded. The lists are candidates; the sweep judges each line.

- **Helpers that every dependent test inherits:**
  - `tests/helpers/p14c3-genuine-evidence-fixtures.ts:17-18` (blocks rows 56 to 58 and
    `tests/p14b10-mentor-label.test.ts`);
  - `tests/helpers/p14c3-history-boundary-fixtures.ts:26-27`;
  - `tests/helpers/p14c3-second-episode-fixtures.ts:27-28`;
  - `tests/helpers/p14c3-fixtures.ts:134`;
  - `validateSaveV43` on `makeSave` output in `tests/helpers/p14b2-fixtures.ts:122, 244, 259` (retention,
    history and rival fixtures; `fund` is clear), `tests/helpers/p14c2c-fixtures.ts:29` and
    `tests/helpers/p14c2rm-fixtures.ts:24`.
- **Save44 live-version candidates:** 143 lines in 80 files match `toBe(43)` against a save or
  `LIVE_SAVE_VERSION`, or "1 through 43". `validateSaveV43(` appears on 210 lines in 73 files; each call on live
  output now throws "validateSaveV43: expected version 43". `SaveFileV43` types live output at
  `tests/p14b9-save-v42.test.ts:71, 174, 175`.
- **Staged edges without `competitions` and `romance`**, which fail the Save44 validator wherever they go through
  `makeSave`, `live()`, `stage()` or `admitted()`:
  - `tests/p14b5-relationships.test.ts`, whose `stagedEdge` and `stage()` lack both fields (the coordinator's and
    F5's note);
  - Bridge: `bridge-p14b5-relationships`, `bridge-p14b6-d2-withheld-employment-claim`,
    `bridge-p14b6-relationship-read-models`, `bridge-p14c2rm-runtime`, `bridge-p14c2s-scientist-runtime`,
    `bridge-p14c3-promise-digest-continuity`, `bridge-p14p3-directing-promises`, `bridge-p14p4p5-opportunities`;
  - Core: `p14b10-conflict-evidence`, `p14b5-t-failure-tuning`, `p14b9-casting-competition`, `p14b9-save-v42`,
    `p14c3-save-v38`, `p14p3-directing-promises`, and the p14p4p5 files `casting-reservation`, `cross-owner`,
    `delayed-retirement`, `opportunities`, `post-capacity`, `queued-project-outcome`, `scenery-capacity`.
- **Strict-Pick type errors** (root gate) on partial edges passed to `currentTier` or `currentCloseness`:
  `tests/p14b5-relationships.test.ts` (`stagedEdge`), `tests/p14b10-conflict-evidence.test.ts`,
  `tests/p14b5-t-failure-tuning.test.ts:295, 373` and its staged `edge` at :347-368,
  `tests/p14b9-casting-competition.test.ts:339`.
- **Projection 57:** 76 lines in 38 files pin 56 (`PROJECTION_VERSION`, `snapshotVersion`, `projection-56`).
  The schema identity `349b2d3e…` is pinned as current at `tests/bridge-contract-generator.test.ts:567-572` (with
  `projectionVersion: 56`) and `tests/bridge-p14b5-relationships.test.ts:381`. The row's exact key list is pinned at
  `tests/bridge-p14b6-relationship-read-models.test.ts:402`; it gains `labels` and `romance`.
- **Prior-schema roster:** 89 lines in 22 files name the roster or `projection-v55`. The full-key-list pins (for
  example `tests/bridge-p14b5-relationships.test.ts:384`) gain the outgoing56 id. The `it.each` over the roster at
  `tests/bridge-runtime-checkpoint.test.ts:763` gains a projection-v56 case with no edit.
- **Not this slice:** `bridge/testing/c3-active-endurance-observer.ts:41` asserts `PROJECTION_VERSION` 53, already
  stale at HEAD's 56.

## Decisions, open questions and uncertain items

Decisions:

- **D1. Runtime lenience on a missing `romance`.** The pure reads and the writes treat an absent field as null
  (`romance == null`). Row 0 needs this: it reads p14b5's `stagedEdge`, which has no `romance`. The types still
  refuse the omission (row 96), and the Save44 validator refuses it in any saved state. A missing `competitions`
  gets no lenience: `recordCastingCompetition` and the Bridge read it directly, so a staged edge without it
  throws a TypeError there. No RED row stages that case.
- **D2.** `romanceEndWeek` is exported, because the Bridge's `endedLabel` needs the derived ending.
- **D3.** `tiersOnRoster` stays as a map over `rosterTies`, for `nemesisOnRoster` and the tests.
- **D4. No edge-relative week bound in the validator.** The formation check records a third party's ending
  without a driver, so that edge's `endedWeek` can exceed its `lastEventWeek`. Row 92 stages `endedWeek` 900 over
  `lastEventWeek` 500 as valid. I read F5 item 1's sentence ("a touch writes the ending and moves
  `lastEventWeek`") as a description of a touch and enforce no invariant from it.

Open questions for the parent:

- **Q1. Eligibility timing.** I read the Friends gate on the edge as this write left it, after the take's own
  drivers. The other reading takes the tier before them. No RED row separates the two (row 74 reads Acquaintances
  either way).
- **Q2. A Partners pair below Friends.** The growth bullet gates every gain on Friends or above, and I follow it.
  The non-trigger bullet says no romance rule reads the friendship tier after formation, which could mean a
  partnered pair grows at any tier. Either way the pair's shared takes keep re-anchoring the track, so the bond
  survives. No RED row separates them (row 76 runs at CloseFriends).
- **Q3. A success that cannot gain** leaves the track alone. Only a shared take resets the anchor.
- **Q4. Third-party endings** get recorded only when a formation check runs, that is, on a write that can gain.
  An ineligible write runs no check.
- **Q5. Copy** for the Owner or the parent: the reason 'they are partners'; the expiry sentence; the Mentor
  sentence "<director> directed <actor>'s first three pictures: A, B and C."; the Rivals sentence above; and the
  fallback "a picture first shot <date>" for a picture of the viewer's own with no concept title on record.
- **Q6.** Labels still show when the retirement-dated tier is unavailable. Romance reads null there, like the
  tier.

Uncertain items:

- **U1.** Type-cleanliness of each step rests on reading. I checked the imports per step for `noUnusedLocals`
  and every narrowing the new code relies on.
- **U2.** The generated artifacts come from an emulator. The self-checks above make a mismatch unlikely, and the
  generator's `--check` settles it.
- **U3.** Cost, untimed: `thirdPartyBond` scans the ledger once per write that can gain, and the Bridge calls
  `mentorEvidence` twice per disclosed row. Both exit early on most edges (`romance == null`; no cohort receipt).
- **U4.** Row 58 depends on r6's tick spy capturing the route's state. That is test-side.

## Evidence limits

No test or type gate ran. The row map, the step-by-step red lists and the type-cleanliness claims are readings
of the code against r5 and r6. The python checks cover two things only: the closed-form ending against the decay
law, and the generator emulation against the checked-in artifacts.

## Next action

1. The parent mints the GENUINE V43 capture (1358-P), as F4 item 5 orders.
2. The parent dry-runs each step patch on HEAD with r6: the six RED files, the root, UI and Bridge type gates,
   and `npm run generate:bridge-contract -- --check` for step 4.
3. The Save44 and projection-57 sweep moves the pins above, starting with
   `tests/helpers/p14c3-genuine-evidence-fixtures.ts:17-18`, which rows 56 to 58 need.
4. The parent rules on Q1 to Q6 where it wants a different reading.

Scratch files: the tree; the four patches; `gen/contract.py` and `gen/out/` (the emulator and its outputs);
`gen/pins.py` and `gen/pins.txt` (the pin grep); `gen/rows-r6.txt` (the 97 rows, numbered).
