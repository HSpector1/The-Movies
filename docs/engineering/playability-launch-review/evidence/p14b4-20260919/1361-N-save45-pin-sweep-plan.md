# 1361-N: Save45 test pin sweep plan

**Status: DRAFT for the parent.** The planner read HEAD 5a6378d1 on `wip/headless-program-20260916-ts` and the merged
candidate `p15c-c-r1` in the writer's tree (`/Users/zacheryspector/studio-scratch/1361-prod/tree`) on 2026-10-03.
HEAD's `tests`, `ui/src`, `src` and `bridge` trees equal those of a0e51c93, the tree 1361-M2 measured (tree ids
c3afdf32, 10bcfbe3, 762d8e09 and faa227af). Line numbers under `tests/` and `ui/src/` are HEAD's. Line numbers under
`src/` and `bridge/` are the candidate's. `m2-core.txt:N` is line N of `/Users/zacheryspector/studio-scratch/1361-m2/m2-core.txt`.

- **Classification:** [1361-N-classification.json](1361-N-classification.json). It holds one row per NEW or CHANGED
  core row (868), per UI row (11) and per type-error site (38), and a `sites` list of
  826 census lines: 552 edits and 274 examined lines that keep.
- **Scripts:** [py/](py/). `detect45.py` is 1358-N's detector shifted one era. `parse_frames.py` joins each M2 row to
  its stack frames from the raw log. `build.py` writes the JSON with `census.py`, `special.py`, `units.py` and
  `msgs.py`. The planner ran them with python3 against the session scratchpad (see Disclosures).

This plan scopes the tests-only sweep that returns the core, UI and type gates to their 1358-I sets on the Save45
production. It follows 1358-N's method and class numbering. It changes no production file, fixture payload, tsconfig
or P15 RED file.

## What Save45 moves

- **The live version.** `LIVE_SAVE_VERSION` is 45 (`src/core/save.ts:6586`). `makeSave` writes Save45 through
  `validateSaveV45` (:6590-6591). `migrateToLive` ends in `migrateToV45` (:10226, :10997-10999).
- **Four new top-level roots**, written empty by `initialP15Roots(week)` (:10883-10886):
  - `powerRanking: {version: 1, recordedFromWeek: week, snapshots: []}`;
  - `p15Sequence: {version: 1, next: 1}` (`src/core/p15Phases.ts:35`);
  - `sharedMarket: {version: 1, recordedFromWeek: week, assessments: []}` (`src/core/marketIntegration.ts:21`);
  - `campaignLegacy: {version: 1, recordedFromWeek: week, official: null, endOfRun: null}`
    (`src/core/campaignLegacy.ts:947`).
- **`validateSaveV45`** (:10962-10975) checks the envelope and refuses a missing root by name (:10968), first
  `p15Sequence` (`P15_ROOT_KEYS`, :10873). It then hands the stripped state to `validateSaveV44` (:10970), runs each
  root's validator and checks the allocator last. The dispatcher reads "versions 1 through 45 only" (:5455-5457).
- **`convertV44ToV45`** (:10980-10984) adds the empty roots at the save's own week and back-fills nothing.
- **`convertV45ToV44`** (:10989-10995) validates, then refuses once if any root holds a row. The message is
  "migrateToV44: " plus each reason, in the order shared market, Power Ranking, Legacy, joined by "; "
  (:10891-10905). Empty roots strip. Each frozen builder refuses the same way under its own name (:6193-6200).
- **A tick:**
  - refuses an industry state with no `sharedMarket` root: "shared market: the state has no sharedMarket root; migrate
    it to Save45 before ticking it" (`src/core/marketIntegration.ts:26`, called at `src/core/tick.ts:1071`; 1361-D2 F7);
  - moves `sharedMarket.recordedFromWeek` to the produced week (`tick.ts:1131`);
  - records a Power Ranking quarter whenever an industry state reaches a week divisible by 13
    (`src/core/powerRankingArchive.ts:149-169`; `src/core/powerRanking.ts:81`), with its id drawn from `p15Sequence`;
  - freezes the 2040 Legacy only in the tick that produces week 6240 (`tick.ts:1179-1182`; `campaignLegacy.ts:78`).
- **The S9 guard follows.** A live industry state that crossed a quarter week since its migration or genesis refuses
  every downgrade at `convertV45ToV44`: "migrateToV44: cannot downgrade or discard a recorded Power Ranking quarter"
  (:10992 with the reason at :10895).
- **No pressure moves a route value at this candidate.** P15A.1 (c), the market batch, has not landed, so no tick
  writes an assessment. 1355-A §4 confines pressure to a pressured release's chain.
- **The Bridge schema does not move.** Both generator checks pass in M2, so F10 and F11 stay (1361-R §3.2).

## Measured fallout (1361-M2)

- **Type gates:** root 33, UI 4 and Bridge 9 errors, all in tests. `src` is clean. Both generator checks pass. d16
  fails the same 12 of 176 leaves as at base.
- **Core:** 939 rows (938 failed tests and one failed suite). Against 1358-I: SAME 71, CHANGED 14, NEW 854, GONE 0.
  - 45 NEW rows are the declared 1355 leaves (40 integration, 4 atomicity, 1 phases). Each fails with its declared
    message in `1361-stage/x-r3b/1355-leaves-red-at-b-r2.tsv`.
  - 7 NEW rows are the `bridge-supervisor` environment rows ("Fake Unity did not report …", `m2-core.txt:1272`).
  - 1 NEW row is `tests/hygiene.test.ts:45` (open question 1). Save45 did not cause it.
  - 801 NEW rows are Save45 fallout.
  - 14 CHANGED rows: 8 retained 1358-I identities that a Save45 pin now stops first, and 6
    `r3n1-stale-schedule-take-02*` rows that still fail with ENOENT at a different tree path.
- **UI:** NEW 11, all live-version pins. GONE 3: the numpy rows, which pass with the approved `.venv`.

The planner joined each M2 row to its frames (the raw log's failure blocks, read with `grep -n` and `sed -n`), took the
innermost `tests/` frame as the throwing site, and classified every row. 24 rows carry `line: null`, because every
frame in the log's frame list sits in a helper; their `site` field names the helper line.

## Counts

| Class | Core rows | Through a helper | UI rows | Census edit sites | Type sites | Decision |
|---|---:|---:|---:|---:|---:|---|
| S1 live validator | 302 | 161 | 0 | 199 | 19 | 302 certain |
| S2 live literals | 363 | 183 | 11 (3 through a helper) | 132 core, 8 UI | 0 | 374 certain |
| S3 sentinels | 16 | 0 | 0 | 31 | 0 | 16 certain |
| S4 chains and typed APIs | 9 | 1 | 0 | 35 | 18 | 9 measure |
| S5 comparisons and lifts | 49 | 0 | 0 | 24 | 0 | 18 certain, 30 measure, 1 ruling |
| S6 hand-built states | 0 | 0 | 0 | 1 | 1 | certain |
| S7 shape projections | 29 | 25 | 0 | 4 | 0 | 4 certain, 25 measure |
| S8 refusal messages | 27 | 0 | 0 | 67 | 0 | 27 measure |
| S9 first-guard masking | 5 | 0 | 0 | 32 | 0 | 1 certain, 4 measure |
| S10 values and retained rows | 9 | 7 | 0 | 1 | 0 | 1 certain, 8 measure |
| T renamed titles | 0 | 0 | 0 | 18 | 0 | certain |
| outside the sweep (RED-1355, ENV, X) | 45, 13, 1 | 0 | 0 | 0 | 0 | no edit; X needs a ruling |

- **Sweep rows:** 820 (809 core and 11 UI): 716 certain, 103 to
  measure and 1 awaiting a ruling (the week-93 control).
- **Outside the sweep:** 45 RED-1355 rows, 13 environment rows (7 `bridge-supervisor`, 6 `r3n1`) and the hygiene row.
- **Census lines:** 826 lines in the detector's output and the planner's additions: 552 edits
  (417 certain, 133 to measure, 2 rulings) and 274 that keep with
  a recorded reason. The edit lines sit in 138 files.

## Classes and edit rules

Each class gives its rule, what it keeps and when the author stops. "Live" means an envelope from `makeSave`,
`migrateToLive`, `importSave` of live bytes, a hydrated checkpoint slot, a `LIVE_SAVE_VERSION` stamp, or a helper that
returns one.

- **S1 live validator selection.** `validateSaveV44(` on a live envelope becomes `validateSaveV45(`.
  - **Kinds:** calls; imports; the `saveApi('validateSaveV44')` key (`tests/helpers/p14c3-fixtures.ts:66`) and its
    callers; the by-name lookups at `contracts/studio-events:129` and `contracts/v14-byte-parity:201`; typed members
    (`p14b9-save-v42:176`, `p14p4p5-opportunities:34`, `tests/helpers/p14p3-fixtures.ts:78`); existence checks
    (`p14p3-fixtures:89`, `p14p4p5-opportunities:91`); the alias `EnvelopeV33` at `p14b4-material-evidence-core:40`;
    the type import at `p14b9-save-v42:71`.
  - **Expected:** no throw. `validateSaveV45` returns the live envelope.
  - **Measured:** "validateSaveV44: expected version 44" (`save.ts:10825`; `m2-core.txt:31`, 584 lines).
  - **Keep:** `validateSaveV44` on genuine V44 envelopes in `p14b10-save-v44` (`baseV44Envelope()` and the
    `convertV43ToV44` outputs); `validateRelationshipsRoot(save.state, 44)` at `p14b5-relationships:1305`.
  - **Stop:** the input is not shown to be live.
- **S2 live literals.** A `toBe(44)` or a stamp that states the live writer's version becomes 45.
  - **Helper pins:** `envelope38` (`p14c3-fixtures:136`), `acceptedEvidence` (`p14c3-genuine-evidence-fixtures:17`),
    `accepted` (`p14c3-second-episode-fixtures:27`), `acceptBoundary` (`p14c3-history-boundary-fixtures:26`).
  - **Other sites:**
    - the envelope stamp at `p14c3-queued-writing-proof:28`, with its three readers (S1);
    - the stamp in the expected export at `bridge-p14b2-checkpoint:93`, which also takes S5;
    - `bridge-process-restart:797` and :799, whose leaf rethrows at :897;
    - `film-chronicle` :911, :922 and the guard at :923, which move together;
    - the message pin `/canonical V44 save bytes exactly/` at `bridge-runtime-checkpoint:439`, which becomes V45
      ("checkpoint.currentSaveJson: must preserve the canonical V45 save bytes exactly", `bridge/runtime-checkpoint.ts:505`;
      `m2-core.txt:6993`);
    - lines that hold both `toBe(44)` and `validateSaveV44(` (the p14p4p5 family, `bridge-p14p3-directing-promises:81`,
      `bridge-p14p4p5-opportunities:72`) take both edits;
    - the 8 UI pins in `ui/src/engine/d17-save-migration.test.ts`, `ui/src/engine/film-chronicle-adapter.test.ts`,
      `ui/src/lot/snapshot/v14SetHolderBoundary.test.ts`, `ui/src/saves.test.tsx` and `ui/src/session.test.tsx`.
      `ui/src/screens/StudioCalendar.career.test.tsx` needs only H.
  - **Expected:** 45.
  - **Measured:** "expected 45 to be 44" (`save.ts:6586`, :6591; `m2-core.txt:91`, 575 lines).
  - **Keep:** a 44 that stamps or reads a genuine V44 envelope (`p14b10-save-v44:109`, :139); weeks, ticks, scores and
    roster sizes the detector caught (`tick.test:286`, :328; `d17a-decision-truth:587`, :589; the roster
    `size).toBe(45)` lines).
  - **Stop:** the literal names a capture or a frozen API.
- **S3 future-version sentinels.** The stamp 45 becomes 46. "unknown saveVersion 45" becomes 46, and "1 through 44"
  becomes "1 through 45".
  - **Measured:** a live save stamped 45 is now valid, so a bare `.toThrow()` sees no throw. An older envelope stamped
    45 now meets `validateSaveV45` and refuses at "validateSaveV45: the p15Sequence root is missing" (`save.ts:10968`;
    `m2-core.txt:2942`).
  - **`save.test.ts:289`** pins its bare `.toThrow()` as `/unknown saveVersion 46/` (1358-N named this leaf).
  - **`p14b9-save-v42:233`** keeps its sentinel 999 and moves only the range. M2 measured "validateSave: unknown
    saveVersion 999 (this build handles versions 1 through 45 only)" (`m2-core.txt:331092`).
  - **Masked:** `contracts/v14-boundary-guards:322` sits behind the suite failure at :63.
  - **Stop:** the leaf asserts something other than the unknown-version refusal.
- **S4 live-to-older chains and typed APIs.** `convertV44ToV43(live)` becomes `convertV44ToV43(convertV45ToV44(live))`.
  The class also adds `convertV45ToV44` to imports, typed members (`p14b9-save-v42:177`, `p14p4p5-opportunities:37`,
  `p14p3-fixtures:83`) and existence checks (`p14p3-fixtures:94`, `p14p4p5-opportunities:92`).
  - **Measured:** "validateSaveV44: expected version 44" from the old innermost converter (`save.ts:10845` calling
    :10825), and TS2345 "Argument of type 'SaveFileV45' is not assignable to parameter of type 'SaveFileV44'" at 18
    type sites.
  - **Expected:** the chain passes `convertV45ToV44` first. It succeeds while every P15 root is empty, and refuses as
    S9 otherwise.
  - **Stop:** after the insert, the chain's first refusal differs from the leaf's expectation. That leaf takes S9.
- **S5 migration comparisons and hand lifts.**
  - **Hand lifts that stop at V44 gain one governed step, `convertV44ToV45`:**
    - `p14c1-materialized-aging:178` (`liftForTick`). Its 17 rows tick the lift and fail at the first tick: "shared
      market: the state has no sharedMarket root; migrate it to Save45 before ticking it"
      (`marketIntegration.ts:26` via `tick.ts:1071`; `m2-core.txt:606`).
    - `p14b9-save-v42:192`. M2 measured "validateSaveV45: the p15Sequence root is missing" (`save.ts:10968`), because
      `makeSave` now validates the lifted state at Save45.
  - **Whole-state comparisons gain the four roots** through one helper per file, `withEmptyP15Roots(state, week)`,
    beside `withEmptyCompetitionsAndRomance` (1358-F9 ruling 6). It writes the four roots of `initialP15Roots` as
    literals, at the input's own `market.tick`.
    - Sites: `p14b4-save-v30-compatibility:216`, `p14b3-rule-revision:174`, `p14bf2-acting-discipline:366`, the four
      p14p4p5 files (`casting-reservation:209`, `delayed-retirement:189`, `queued-project-outcome:186`,
      `scenery-capacity:202`), `bridge-p14c3-promise-digest-continuity:164`, and the masked sites listed in the
      census (`bridge-p14b2-checkpoint:93`, `bridge-p14c2rm-runtime:61`, `bridge-p14c2s-scientist-runtime:141`,
      `bridge-p14p3-directing-promises` :140 and :376, `bridge-p14p4p5-opportunities` :99 and :519,
      `bridge-p14r2r3-prior55:201`, `p14c3-save-v38:92`, `p14p3-directing-promises:440`, `p14p4p5-opportunities:382`,
      `p14p4p5-cross-owner:107`).
    - Measured: "expected { broadcastItems: [], …(44) } to deeply equal { broadcastItems: [], …(40) }" (the four
      p14p4p5 rows, `m2-core.txt:924`); a stringified state whose first differing key is `campaignLegacy`
      (`m2-core.txt:582`); "expected { saveVersion: 45, …(3) } to deeply equal …" (`m2-core.txt:2143`, the 21
      p14b4-save-v30 rows). `convertV44ToV45` writes the roots (`save.ts:10983`).
  - **The week-93 control** (`p14d1-rival-shelving:618`) needs a ruling (open question 5). By week 93 the candidate
    has recorded the quarters 13 to 91, which a genuine Save42 input cannot hold.
  - **Keep:** comparisons of `.hollywood` alone (`bridge-p14b4-runtime47-compatibility:258`,
    `bridge-p14b5-relationships:474`, `p14c2rm-writer-continuation:298`).
  - **Stop:** the comparison still differs after the helper, or the compared state ticked after its migration (its
    `recordedFromWeek` moved, or it recorded a quarter). Report the difference as S10 or as a defect. Never edit the
    expectation to match a run.
- **S6 hand-built states (one type site).** `p14p3-directing-promises:425` types `invalid` as the live `GameState`,
  which now requires the four roots (TS2375). It becomes `typeof bound40`, the frozen V40 state of
  `directorCapture40` (:113). Line :424 already passes `bound40` to the same builders. The runtime does not change.
- **S7 shape projections.** A test that projects a live state to an older shape also drops the four roots, each only
  while it is empty (the 1332-A guard-before-strip form).
  - `tests/contracts/_v14Contract.ts:377` (`projectToV13State`). Its 25 v14-migration contract rows fail in `v13TwinOf`
    (:528) with the C2a-M1 contract message, which carries 'validateSaveV12: state has unknown field "powerRanking"'
    (`save.ts:4185`; `m2-core.txt:2549`).
  - `facility-move-demolish:869` (`forgedV11`). Measured: 'validateSaveV11: state has unknown field "campaignLegacy"'
    (`save.ts:3936`; `m2-core.txt:7610`).
  - `p13b-r07-save-v25:149` (`asV25Envelope`). Measured: the frozen V25 chain refusing at 'validateSaveV12: state has
    unknown field "powerRanking"' (`save.ts:8613`, :4185; `m2-core.txt:2864`).
  - `p14c2s-scientist-retirement:325` (the reader-only V34-V36 relabel). Measured: the frozen V34 chain refusing the
    same way (`save.ts:9958`, :4185; `m2-core.txt:402321`).
  - **Expected:** the older-era validator accepts the projection, and each leaf reaches its own assertion.
  - **Stop:** a root holds a row. Report it; do not strip it (1358-F9 ruling 2).
- **S8 refusal messages.** A tamper refusal on a live save reaches its guard through `validateSaveV45`, which hands
  the frozen V44 chain the stripped state (`save.ts:10970`). The rename keeps the pattern.
  - **Measured:** every S8 row stops at "validateSaveV44: expected version 44" (`save.ts:10825`) before its guard.
  - **Expected guards, as at Save44:**
    - `cash-ledger-checkpoint-v11` :287 (`src/core/construction.ts:445`) and :461 (:463);
    - `construction-core` :497 (`construction.ts:340-360` or `src/core/placement.ts:2271`) and :566
      (`placement.ts:2238`);
    - `construction-save-v11:514` (`construction.ts:251` or `placement.ts:2015`);
    - `legacy-parcel-ground` :365 and :404 (`placement.ts:2066`);
    - `p06a-w1-release-authority:459` (`src/core/releaseAuthority.ts:172`);
    - `p13a-technology-milestones:74` (`src/core/studioHistory.ts:357`);
    - `property-state-v13` :799 (the required-key check, e.g. `save.ts:3931`), :868 (`placement.ts:1651`) and :880
      (`placement.ts:2040`);
    - `p14b5-relationships` family 10 (:1299, 13 rows) and :1321: the relationships root's own refusals at era 44
      (`src/core/relationships.ts:666`), with `validateRelationshipsRoot(save.state, 44)` kept at :1305.
  - **Bare `.toThrow()` sites** (1358-F10 ruling 2): `p14b1-t4-regressions:86`, `p14c2rm-writer-continuation:379` and
    `p14c3-save-v38:121` pass today on the version refusal alone. After the rename, the message probe must show each
    case at its tampered field's guard. Pin any case that shows another guard.
  - **Unreached sites:** M2 reached 14 of the 67 S8 census lines. The other 53, the three bare `.toThrow()` sites among
    them, sit behind an earlier failure. They keep their patterns, and the dry run measures them.
  - **Stop:** the measured refusal comes from a guard other than the tampered field's. Record it as masking.
- **S9 first-guard masking.** See [S9 sites](#s9-sites-and-predictions).
  - **Measured:** `p13b-s8-save-v27:206`, through the production chain `migrateToV26`: "migrateToV44: cannot downgrade
    or discard a recorded Power Ranking quarter" (`save.ts:10992`, reason :10895; `m2-core.txt:8223`).
  - **Rule** (1358-F10 ruling 4, the 1344-N S9 form): the pin names the measured first guard, anchored, for example
    `/^migrateToV44: cannot downgrade or discard a recorded Power Ranking quarter$/`. The comment records the masking
    and names the test that still covers the masked guard on its own era's input:
    - the romance guard: `p14b10-save-v44:356` (a V44 envelope);
    - the V39 guard: `p13b-s3-save-v23:115-117` and `p14p4p5-opportunities:336`;
    - the V27 guard: the staged V27 input at `p13b-s8-save-v27:216`;
    - the V40 termination guard: the staged V41 input at `p14r3-save-v41:412`;
    - the V36 extension guard: `p14c2rm-writer-continuation:278`.
  - **Comments:** 1358-N's S9 comments cite Save44's lines (for example `save.ts:10790`). The rewrite cites the
    candidate's lines.
  - **Loose regexes** (1358-F10 ruling 3): `contracts/v14-boundary-guards` :211, :250, :275, :300 and
    `v14-migration.contract:244` pin `/cannot downgrade/`. They get no edit unless the probe shows the P15 refusal
    newly masking their guard.
  - **Stop:** the first guard is neither the leaf's own nor `convertV45ToV44`'s, or a must-succeed chain refuses.
- **S10 values and retained rows.** See [S10](#s10-and-the-retained-rows).
  - **Measured digest:** `p14b5-relationships:626` received
    `80fe2347e47678fefdf4b175f0b48046a11a97828d93aa4b3056ca4de8490c87` against the frozen
    `9702aa6869cf80f82d5133f68137427a0ed44c07ce987e8fe2be66bbb60f3d78` (`m2-core.txt:330595`). The live bytes now
    carry the four roots: `convertV44ToV45` writes them at `takeWorld`'s migration (`save.ts:10983`), and the tick
    moves `sharedMarket.recordedFromWeek` (`tick.ts:1131`).
  - **Measured C20:** "expected '{"broadcastCache":[],"saveVersion":45…' to be '{"broadcastCache":[],"saveVersion":38…'"
    (`m2-core.txt:1356`; `makeSave` stamps 45 at `save.ts:6591`).
  - **Screen:** the planner scanned hex and byte-count pins in the leaves that a Save45 failure masks, by the stack
    frames. Every literal pin there reads capture, manifest or fixture bytes, or compares a digest with its own
    recomputation. Only `p14b5-relationships:626` pins a literal over live save bytes, and M2 measured it.
- **T renamed titles (18 census lines).** A title moves when its body moves the number it states:
  - 9 live-version titles: `p13b-s7-announcements:86`, `p14b5-save-v31:195`, `p14b9-save-v42` :228 and :232,
    `p14b10-save-v44` :118 and :361, `p14d1-rival-shelving-save-v43` :45 and :82, `p14d1-rival-shelving:186`;
  - 9 sentinel titles: `p13b-r07-save-v25:273`, `p13b-s2-save-v22:211`, `p13b-s3-save-v23:124`,
    `p13b-s5-save-v24:213`, `p13b-s6-save-v26:221`, `p13b-s8-save-v27:232`, `p14a1-save-v28:252`,
    `p14b1-save-v29:202`, `save.test:453`.

  None of the 18 is a retained 1358-I identity. The handback records each old and new identity. Stale titles that
  earlier sweeps left alone stay.

### Expected value or message per class

| Class | Expected after the edit | Produced at p15c-c-r1 |
|---|---|---|
| S1 | no throw; the live envelope returns | `save.ts:10962-10975` |
| S2 | 45 | `save.ts:6586`, :6591 |
| S3 | "validateSave: unknown saveVersion 46 (this build handles versions 1 through 45 only)" | `save.ts:5455-5457` |
| S4 | the chain succeeds while every P15 root is empty; otherwise S9 | `save.ts:10989-10995` |
| S5 | equality holds with the four empty roots at the input's week | `save.ts:10883-10886`, :10980-10984 |
| S6 | the type gate passes; runtime unchanged | none |
| S7 | the older-era chain accepts the projection; each leaf reaches its own assertion | the guard M2 hit: `save.ts:3936`, :4185 |
| S8 | the tampered field's own guard, unchanged from Save44 (list above) | the guard lines listed in S8 |
| S9 | "migrateToV44: cannot downgrade or discard a recorded Power Ranking quarter", or the leaf's own guard where no quarter was recorded | `save.ts:10992`, :10895 |
| S10 | `9702aa68…` unchanged after the guarded strip; 7 retained rows fail with their 1358-I primaries; C20 attributed | see S10 |
| T | the title states 45 (live) or 46 (sentinel) | none |

## The shared helpers first (unit H)

H lands before any other unit. Every row behind a helper pin moves only when its helper moves.

| Helper | Edit | Rows behind it |
|---|---|---:|
| `tests/helpers/p14c3-fixtures.ts` | `envelope38`: `toBe(44)` to 45 at :136 (keep the label); the `saveApi` key type at :66 to `validateSaveV45` | 93 |
| `tests/helpers/p14c3-genuine-evidence-fixtures.ts` | `acceptedEvidence`: :17 to 45; :18 and the import :8 to `validateSaveV45` | 56 core, 3 UI |
| `tests/helpers/p14c3-second-episode-fixtures.ts` | `accepted`: :27 to 45; :28 and the import :8 | 23 |
| `tests/helpers/p14c3-history-boundary-fixtures.ts` | `acceptBoundary`: :26 to 45; :27 and the import :6 | 15 |
| `tests/helpers/p14c2rm-fixtures.ts` | `admitted`: :24 and the import :6 to `validateSaveV45` (clears TS2375 in all three gates) | 88 |
| `tests/helpers/p14b2-fixtures.ts` | :122, :244, :259 and the import :7 | 47 |
| `tests/helpers/p14c2c-fixtures.ts` | `savedState`: :29 and the import :8 (clears TS2375 in all three gates) | 27 |
| `tests/contracts/_v14Contract.ts` | `projectToV13State` (:377-509) drops the four roots under its emptiness preconditions (S7) | 25 |
| `tests/helpers/p14p3-fixtures.ts` | the `futureSave` steps: member :78, check :89 and call :112 to V45; chain :113 gains `convertV45ToV44`, with member :83 and check :94 | 2 |
| `tests/helpers/p14c2b-fixtures.ts` | `liveEnvelopeV36`: chain :69 and import :23 (TS2345 in all three gates) | 1 |
| `tests/helpers/p14c4-fixtures.ts` | chain :71 and import :12 (TS2345 in all three gates; the export has no caller) | 0 |
| `tests/helpers/p14c3-canonical-rival-fixtures.ts` | chain :198 and import :8 (TS2345; tick 0, so the chain succeeds) | 0 |
| the four `saveApi` callers | `p14c3-save-v38`, `p14c3-transition-evidence`, `p14c3-admission-boundaries`, `p14c3-profession-episodes` take the key rename with their own S1, S2, S5 and S8 lines | 6 |

H's rows: 383 core and 3 UI. The H rows include 7 retained identities that H unmasks and C20 (S10).

**H's acceptance check (x1):** each of H's other 378 rows passes or moves to a later site that another unit
owns; the 7 retained rows fail with their 1358-I primaries; C20 keeps its version-only change; and the type gates lose
H's 5 sites (13 errors: 5 root, 4 UI, 4 Bridge), which leaves the UI gate at 0.

## Units

The units are disjoint file sets. Every edit line, type site and M2 throwing site belongs to exactly one unit
(`units.py`). Rows count by the file that throws, so a row that a helper stops counts in H.

**Order** (1358-F8 ruling 7):
1. H lands first.
2. The parent runs x1 on HEAD plus the candidate plus H.
3. G1 to G5 work in parallel on HEAD plus the candidate plus H.
4. The parent runs x2, then follow-up units take the measured S5, S8, S9 and S10 leftovers, then x3 confirms.
5. An independent review samples at least 40 rows across the classes: assertion strength, live against historical
   saves, the sentinels, the chains and their S9 comments, the helper pins, the titles and any S10 declaration.
6. The landing applies the production and the sweep, runs the recorded gates and attributes them against 1358-I and
   1358-I2.

**Authoring** (1358-N's process):
- Each unit works in a scratch tree of HEAD with the candidate's production patch
  (`1361-stage/prod/1361-p15c-production-c-r1.patch`) applied, plus H's patch for G1 to G5. `tests/fixtures` is a real
  directory of per-entry links. `docs`, `node_modules`, `art` and `tools` are links that nothing writes.
- Each unit stages a tests-only `patch.diff`, cumulative against HEAD; its classification rows (file, line, old text,
  new text, class, census line and the measured cause or frame); a handback; and a deferred list.
- Each unit checks its patch with a temporary index (`git apply --check --cached`). Authors run no test, tsc or node
  process. Only the parent runs the lane.

| Unit | Scope | Files | Core rows | UI rows | Edit lines | Type sites |
|---|---|---:|---:|---:|---:|---:|
| H | the shared helpers, `_v14Contract`, the four `saveApi` callers | 16 | 383 | 3 | 61 | 5 |
| G1 | hand lifts, shape projections, whole-state comparisons, the `p14b5` digest and the week-93 control | 15 | 94 | 0 | 67 | 0 |
| G2 | the Bridge test files | 25 | 139 | 0 | 92 | 5 |
| G3 | save-version, sentinel and title files, the older-era live pins, `v14-byte-parity` and the five UI files | 36 | 54 | 8 | 108 | 2 |
| G4 | chains and masking: the p14c3 chain leaves, `p14c2rm-writer-continuation`, `p12-starting-world`, `p06a`, `p14p3`, `p14p4p5-opportunities` and `-screenplay-status`, `p14r3-save-v41`, `save`, `v14-boundary-guards`, `p14c2b-save-v36`, `p13b-s8-save-v27`, `p14b1-t4-regressions` | 20 | 51 | 0 | 137 | 17 |
| G5 | the remaining core S1, S2 and S8 files: p14b1 to p14b5, the p14p4p5 pins, `c2a-m2-sets-save`, three contract files, `v14-migration.contract`, `construction-core`, `cash-ledger-checkpoint-v11`, `legacy-parcel-ground`, `p08a`, `p13a-technology-milestones` | 26 | 88 | 0 | 87 | 9 |
| total | | 138 | 809 | 11 | 552 | 38 |

#### H: 16 files, 383 core rows, 3 UI rows, 61 edit lines (49 certain, 12 measure), 5 type sites

| File | Rows | Row classes | Edit lines (? = measure or ruling) | Type sites |
|---|---:|---|---|---:|
| `contracts/_v14Contract.ts` | 25 | S7 25 | S7? 1 | 0 |
| `helpers/p14b2-fixtures.ts` | 47 | S1 46, S10 1 | S1 4 | 0 |
| `helpers/p14c2b-fixtures.ts` | 1 | S4 1 | S4 1, S4? 1 | 1 |
| `helpers/p14c2c-fixtures.ts` | 27 | S1 25, S10 2 | S1 2 | 1 |
| `helpers/p14c2rm-fixtures.ts` | 88 | S1 88 | S1 2 | 1 |
| `helpers/p14c3-canonical-rival-fixtures.ts` | 0 |  | S4 1, S4? 1 | 1 |
| `helpers/p14c3-fixtures.ts` | 93 | S10 1, S2 92 | S1 1, S2 1 | 0 |
| `helpers/p14c3-genuine-evidence-fixtures.ts` | 59 | S10 3, S2 53, S2 UI 3 | S1 2, S2 1 | 0 |
| `helpers/p14c3-history-boundary-fixtures.ts` | 15 | S2 15 | S1 2, S2 1 | 0 |
| `helpers/p14c3-second-episode-fixtures.ts` | 23 | S2 23 | S1 2, S2 1 | 0 |
| `helpers/p14c4-fixtures.ts` | 0 |  | S4 1, S4? 1 | 1 |
| `helpers/p14p3-fixtures.ts` | 2 | S1 2 | S1 3, S4 2, S4? 1 | 0 |
| `p14c3-admission-boundaries.test.ts` | 0 |  | S1 1 | 0 |
| `p14c3-profession-episodes.test.ts` | 0 |  | S1 3 | 0 |
| `p14c3-save-v38.test.ts` | 6 | S10 1, S2 5 | S1 11, S2 3, S5? 1, S8? 5 | 0 |
| `p14c3-transition-evidence.test.ts` | 0 |  | S1 4, S8? 1 | 0 |

#### G1: 15 files, 94 core rows, 0 UI rows, 67 edit lines (47 certain, 18 measure, 2 ruling), 0 type sites

| File | Rows | Row classes | Edit lines (? = measure or ruling) | Type sites |
|---|---:|---|---|---:|
| `facility-move-demolish.test.ts` | 2 | S1 1, S7 1 | S1 2, S7 1 | 0 |
| `p13b-r07-save-v25.test.ts` | 3 | S3 1, S7 2 | S3 2, S7 1, T 1 | 0 |
| `p14b3-rule-revision.test.ts` | 5 | S1 2, S5 3 | S1 3, S5? 1 | 0 |
| `p14b4-save-v30-compatibility.test.ts` | 22 | S2 1, S5 21 | S2 1, S5? 1 | 0 |
| `p14b5-relationships.test.ts` | 17 | S1 2, S10 1, S8 14 | S1 4, S10? 1, S8? 2, S9? 4 | 0 |
| `p14b9-save-v42.test.ts` | 3 | S2 1, S3 1, S5 1 | S1 3, S2 2, S3 1, S4 1, S5 1, S9? 1, T 2 | 0 |
| `p14bf2-acting-discipline.test.ts` | 12 | S1 11, S5 1 | S1 5, S5? 1 | 0 |
| `p14c1-materialized-aging.test.ts` | 18 | S2 1, S5 17 | S2 1, S5 1 | 0 |
| `p14c2s-scientist-retirement.test.ts` | 4 | S2 3, S7 1 | S2 4, S7 1, S9? 2 | 0 |
| `p14d1-rival-shelving.test.ts` | 3 | S1 1, S2 1, S5 1 | S1 2, S2 1, S5? 2, T 1 | 0 |
| `p14p4p5-casting-reservation.test.ts` | 1 | S5 1 | S2 1, S5? 1 | 0 |
| `p14p4p5-cross-owner.test.ts` | 1 | S2 1 | S1 1, S2 1, S5? 1 | 0 |
| `p14p4p5-delayed-retirement.test.ts` | 1 | S5 1 | S2 1, S5? 1 | 0 |
| `p14p4p5-queued-project-outcome.test.ts` | 1 | S5 1 | S2 1, S5? 1 | 0 |
| `p14p4p5-scenery-capacity.test.ts` | 1 | S5 1 | S2 1, S5? 1 | 0 |

#### G2: 25 files, 139 core rows, 0 UI rows, 92 edit lines (83 certain, 9 measure), 5 type sites

| File | Rows | Row classes | Edit lines (? = measure or ruling) | Type sites |
|---|---:|---|---|---:|
| `bridge-p13b-r07-setup.test.ts` | 1 | S2 1 | S2 1 | 0 |
| `bridge-p13b-s8-rivals.test.ts` | 2 | S2 2 | S2 2 | 0 |
| `bridge-p14a1-market.test.ts` | 1 | S2 1 | S2 1 | 0 |
| `bridge-p14a2-market.test.ts` | 4 | S2 4 | S2 6 | 0 |
| `bridge-p14a3-world.test.ts` | 4 | S2 4 | S2 4 | 0 |
| `bridge-p14b1-promises.test.ts` | 3 | S2 3 | S2 3 | 0 |
| `bridge-p14b2-checkpoint.test.ts` | 1 | S2 1 | S2 1, S5? 1 | 0 |
| `bridge-p14b2-trust.test.ts` | 1 | S2 1 | S1 4, S2 2 | 1 |
| `bridge-p14b3-promise-command.test.ts` | 19 | S1 19 | S1 6, S2 2 | 0 |
| `bridge-p14b4-cast-class.test.ts` | 27 | S1 27 | S1 4 | 0 |
| `bridge-p14b4-runtime47-compatibility.test.ts` | 1 | S2 1 | S2 1 | 0 |
| `bridge-p14b5-relationships.test.ts` | 1 | S2 1 | S2 1 | 0 |
| `bridge-p14b6-d2-withheld-employment-claim.test.ts` | 2 | S1 2 | S1 2 | 0 |
| `bridge-p14b6-e714-false-empty-absence-lines.test.ts` | 0 |  | S1 2 | 0 |
| `bridge-p14b6-relationship-read-models.test.ts` | 4 | S1 3, S2 1 | S1 2, S2 1 | 0 |
| `bridge-p14b8-waiver-surface.test.ts` | 1 | S2 1 | S2 2 | 0 |
| `bridge-p14c2rm-runtime.test.ts` | 3 | S2 3 | S2 2, S5? 1 | 0 |
| `bridge-p14c2s-scientist-runtime.test.ts` | 3 | S1 2, S2 1 | S1 2, S2 2, S5? 1 | 0 |
| `bridge-p14c3-promise-digest-continuity.test.ts` | 1 | S5 1 | S2 1, S5? 1 | 0 |
| `bridge-p14c3-runtime.test.ts` | 1 | S2 1 | S1 2, S2 1 | 0 |
| `bridge-p14p3-directing-promises.test.ts` | 3 | S1 1, S2 2 | S1 2, S2 3, S5? 2 | 1 |
| `bridge-p14p4p5-opportunities.test.ts` | 3 | S1 1, S2 2 | S1 4, S2 2, S5? 2 | 3 |
| `bridge-p14r2r3-prior55.test.ts` | 1 | S1 1 | S1 2, S2 1, S5? 1 | 0 |
| `bridge-process-restart.test.ts` | 1 | S2 1 | S2 2 | 0 |
| `bridge-runtime-checkpoint.test.ts` | 51 | S2 51 | S2 10 | 0 |

#### G3: 36 files, 54 core rows, 8 UI rows, 108 edit lines (96 certain, 12 measure), 2 type sites

| File | Rows | Row classes | Edit lines (? = measure or ruling) | Type sites |
|---|---:|---|---|---:|
| `c2a-m3-rename-and-pooling.test.ts` | 2 | S2 2 | S2 2 | 0 |
| `c2a-m3-screenplay-mint.test.ts` | 1 | S2 1 | S2 1 | 0 |
| `construction-save-v11.test.ts` | 4 | S2 1, S3 1, S8 2 | S1 2, S2 1, S3 2, S8? 1 | 0 |
| `contracts/v14-byte-parity.contract.test.ts` | 1 | S2 1 | S1 1, S2 1 | 0 |
| `d11-employment.test.ts` | 1 | S2 1 | S2 1 | 0 |
| `d17-engagement-persistence.test.ts` | 1 | S2 1 | S2 1 | 0 |
| `d17a-adv-migration.test.ts` | 1 | S3 1 | S3 1 | 0 |
| `d17a-adv-reconciliation.test.ts` | 1 | S2 1 | S2 1 | 0 |
| `d17b-save-v7.test.ts` | 1 | S3 1 | S3 1 | 0 |
| `film-chronicle.test.ts` | 1 | S2 1 | S2 3 | 0 |
| `p04a2-writer-credit-law.test.ts` | 1 | S2 1 | S2 1 | 0 |
| `p09a-w0-founding-regime.test.ts` | 2 | S1 1, S2 1 | S1 2, S2 1, S8? 4 | 0 |
| `p13a-causal-core.test.ts` | 2 | S1 2 | S1 3 | 0 |
| `p13b-s2-access-identity.test.ts` | 1 | S1 1 | S1 2 | 0 |
| `p13b-s2-save-v22.test.ts` | 2 | S2 1, S3 1 | S2 1, S3 1, T 1 | 0 |
| `p13b-s3-save-v23.test.ts` | 2 | S2 1, S3 1 | S2 1, S3 2, T 1 | 0 |
| `p13b-s3-validation.test.ts` | 1 | S1 1 | S1 2 | 0 |
| `p13b-s5-save-v24.test.ts` | 2 | S2 1, S3 1 | S2 1, S3 2, T 1 | 0 |
| `p13b-s6-save-v26.test.ts` | 2 | S2 1, S3 1 | S2 1, S3 2, T 1 | 0 |
| `p13b-s7-announcements.test.ts` | 2 | S2 2 | S2 2, T 1 | 0 |
| `p14a1-save-v28.test.ts` | 1 | S3 1 | S3 2, T 1 | 0 |
| `p14b1-save-v29.test.ts` | 2 | S2 1, S3 1 | S2 1, S3 2, T 1 | 0 |
| `p14b10-save-v44.test.ts` | 2 | S2 2 | S2 4, T 2 | 0 |
| `p14b5-save-v31.test.ts` | 1 | S2 1 | S2 1, T 1 | 0 |
| `p14b7-promise-waiver.test.ts` | 1 | S2 1 | S2 1 | 0 |
| `p14c2a-save-and-settlement.test.ts` | 2 | S1 1, S2 1 | S1 2, S2 1 | 1 |
| `p14c4-save-v35.test.ts` | 3 | S1 1, S2 2 | S1 3, S2 2 | 1 |
| `p14d1-rival-shelving-save-v43.test.ts` | 2 | S2 2 | S2 2, T 2 | 0 |
| `placement-save-v12.test.ts` | 2 | S1 2 | S1 3, S8? 4 | 0 |
| `property-state-v13.test.ts` | 6 | S2 2, S3 1, S8 3 | S1 2, S2 2, S3 2, S8? 3 | 0 |
| `script-projects-save-v9.test.ts` | 1 | S3 1 | S3 4 | 0 |
| `ui/src/engine/d17-save-migration.test.ts` | 2 | S2 UI 2 | UI 2 | 0 |
| `ui/src/engine/film-chronicle-adapter.test.ts` | 1 | S2 UI 1 | UI 1 | 0 |
| `ui/src/lot/snapshot/v14SetHolderBoundary.test.ts` | 1 | S2 UI 1 | UI 1 | 0 |
| `ui/src/saves.test.tsx` | 1 | S2 UI 1 | UI 1 | 0 |
| `ui/src/session.test.tsx` | 3 | S2 UI 3 | UI 3 | 0 |

#### G4: 20 files, 51 core rows, 0 UI rows, 137 edit lines (80 certain, 57 measure), 17 type sites

| File | Rows | Row classes | Edit lines (? = measure or ruling) | Type sites |
|---|---:|---|---|---:|
| `contracts/v14-boundary-guards.contract.test.ts` | 1 | S4 1 | S3 1, S4 1, S4? 1, S9? 4 | 1 |
| `p06a-w1-release-authority.test.ts` | 2 | S4 1, S8 1 | S1 1, S4 1, S4? 1, S8? 2 | 1 |
| `p12-starting-world.test.ts` | 1 | S4 1 | S4 1, S4? 1 | 1 |
| `p13b-s8-save-v27.test.ts` | 3 | S2 1, S3 1, S9 1 | S2 1, S3 2, S9 1, S9? 1, T 1 | 0 |
| `p14b1-t4-regressions.test.ts` | 16 | S1 16 | S1 4, S8? 1 | 1 |
| `p14c2b-save-v36.test.ts` | 5 | S1 1, S2 2, S9 2 | S1 2, S2 2, S8? 4, S9? 2 | 0 |
| `p14c2rm-writer-continuation.test.ts` | 0 |  | S1 3, S4 1, S8? 6, S9? 1 | 1 |
| `p14c3-canonical-rival-history.test.ts` | 0 |  | S1 3, S8? 2 | 0 |
| `p14c3-cohort-transition.test.ts` | 0 |  | S1 2, S4 1, S8? 1, S9? 1 | 1 |
| `p14c3-dual-extensions.test.ts` | 0 |  | S4 1, S9? 1 | 1 |
| `p14c3-offmenu-extensions.test.ts` | 0 |  | S4 1, S9? 1 | 1 |
| `p14c3-profession-history.test.ts` | 0 |  | S1 11, S8? 3, S9? 1 | 1 |
| `p14c3-promise-digest-continuity.test.ts` | 3 | S4 3 | S4 1, S4? 1 | 1 |
| `p14c3-queued-writing-proof.test.ts` | 0 |  | S1 3, S2 1, S8? 1 | 0 |
| `p14c3-transitions.test.ts` | 1 | S9 1 | S4 1, S9? 2 | 0 |
| `p14p3-directing-promises.test.ts` | 3 | S2 3 | S2 5, S4 2, S5? 1, S6 1, S9? 5 | 3 |
| `p14p4p5-opportunities.test.ts` | 6 | S1 4, S2 2 | S1 5, S2 3, S4 2, S4? 3, S5? 1, S8? 4, S9? 1 | 1 |
| `p14p4p5-screenplay-status.test.ts` | 1 | S2 1 | S2 1, S4 1, S9? 1 | 1 |
| `p14r3-save-v41.test.ts` | 5 | S1 2, S2 2, S9 1 | S1 2, S2 4, S4 1, S9? 1 | 0 |
| `save.test.ts` | 4 | S3 2, S4 2 | S3 4, S4 1, S4? 2, T 1 | 2 |

#### G5: 26 files, 88 core rows, 0 UI rows, 87 edit lines (62 certain, 25 measure), 9 type sites

| File | Rows | Row classes | Edit lines (? = measure or ruling) | Type sites |
|---|---:|---|---|---:|
| `c2a-m2-sets-save.test.ts` | 3 | S1 3 | S1 9, S8? 2 | 0 |
| `cash-ledger-checkpoint-v11.test.ts` | 4 | S1 2, S8 2 | S1 4, S8? 5, S9? 1 | 0 |
| `construction-core.test.ts` | 3 | S1 1, S8 2 | S1 2, S8? 3 | 0 |
| `contracts/cross-owner-refusal.contract.test.ts` | 3 | S1 3 | S1 3, S8? 1 | 0 |
| `contracts/phase-table-agreement.contract.test.ts` | 3 | S1 3 | S1 3, S8? 3 | 0 |
| `contracts/studio-events.contract.test.ts` | 3 | S1 3 | S1 1 | 0 |
| `legacy-parcel-ground.test.ts` | 3 | S1 1, S8 2 | S1 2, S8? 2 | 0 |
| `p08a-w0-studio-history.test.ts` | 1 | S1 1 | S1 2, S8? 4 | 0 |
| `p13a-technology-milestones.test.ts` | 1 | S8 1 | S1 1, S8? 3 | 0 |
| `p14b1-first-take.test.ts` | 1 | S1 1 | S1 1 | 1 |
| `p14b1-promises.test.ts` | 1 | S1 1 | S1 1 | 0 |
| `p14b2-setup-wrap-regressions.test.ts` | 0 |  | S1 2 | 0 |
| `p14b3-reservations.test.ts` | 5 | S1 5 | S1 5 | 1 |
| `p14b4-cancel-causal-proof.test.ts` | 22 | S2 22 | S2 1 | 0 |
| `p14b4-cast-class-outcomes.test.ts` | 14 | S2 14 | S1 2, S2 1 | 0 |
| `p14b4-material-evidence-core.test.ts` | 10 | S1 10 | S1 4 | 6 |
| `p14b5-t-failure-tuning.test.ts` | 2 | S1 2 | S1 3 | 0 |
| `p14p4p5-finishing-material.test.ts` | 1 | S2 1 | S1 1, S2 1 | 0 |
| `p14p4p5-grouped-witness.test.ts` | 1 | S2 1 | S1 1, S2 1 | 0 |
| `p14p4p5-post-capacity.test.ts` | 1 | S2 1 | S1 1, S2 1 | 0 |
| `p14p4p5-receipt-freeze.test.ts` | 1 | S2 1 | S1 1, S2 1 | 1 |
| `p14p4p5-retired-acting.test.ts` | 1 | S2 1 | S1 1, S2 1 | 0 |
| `p14p4p5-soundstage-capacity.test.ts` | 1 | S2 1 | S1 1, S2 1 | 0 |
| `p14p4p5-stock-subject.test.ts` | 1 | S2 1 | S1 1, S2 1 | 0 |
| `p14p4p5-writer-resources.test.ts` | 2 | S2 2 | S2 1 | 0 |
| `v14-migration.contract.test.ts` | 0 |  | S9? 1 | 0 |

## Type-error sites

M2's gates: root 33, UI 4, Bridge 9. Sites 7, 8, 9 and 11 below are the 4 UI errors; those 4 and sites 1 to 5 are the 9
Bridge errors. Every root site is one of the 33. After the sweep all three gates must exit 0.

| # | Site | Code | Gates | Class | Unit | Edit |
|---:|---|---|---|---|---|---|
| 1 | `bridge-p14b2-trust.test.ts(470,79)` | TS2379 | bridge | S1 | G2 | rename at :468 |
| 2 | `bridge-p14p3-directing-promises.test.ts(378,12)` | TS2379 | bridge | S1 | G2 | rename at :374 |
| 3 | `bridge-p14p4p5-opportunities.test.ts(520,77)` | TS2379 | bridge | S1 | G2 | rename at :518 |
| 4 | `bridge-p14p4p5-opportunities.test.ts(525,17)` | TS2379 | bridge | S1 | G2 | rename at :523 |
| 5 | `bridge-p14p4p5-opportunities.test.ts(526,17)` | TS2379 | bridge | S1 | G2 | rename at :524 |
| 6 | `contracts/v14-boundary-guards.contract.test.ts(63,132)` | TS2345 | root | S4 | G4 | insert convertV45ToV44 innermost at :63, and add it to the import where the file imports by name; the chain then types |
| 7 | `helpers/p14c2b-fixtures.ts(69,138)` | TS2345 | root, ui, bridge | S4 | H | insert convertV45ToV44 innermost at :69, and add it to the import where the file imports by name; the chain then types |
| 8 | `helpers/p14c2c-fixtures.ts(29,3)` | TS2375 | root, ui, bridge | S1 | H | validateSaveV44 -> validateSaveV45 at :29 (the return type follows) |
| 9 | `helpers/p14c2rm-fixtures.ts(24,3)` | TS2375 | root, ui, bridge | S1 | H | validateSaveV44 -> validateSaveV45 at :24 |
| 10 | `helpers/p14c3-canonical-rival-fixtures.ts(198,113)` | TS2345 | root | S4 | H | insert convertV45ToV44 innermost at :198, and add it to the import where the file imports by name; the chain then types |
| 11 | `helpers/p14c4-fixtures.ts(71,120)` | TS2345 | root, ui, bridge | S4 | H | insert convertV45ToV44 innermost at :71, and add it to the import where the file imports by name; the chain then types |
| 12 | `p06a-w1-release-authority.test.ts(406,136)` | TS2345 | root | S4 | G4 | insert convertV45ToV44 innermost at :406, and add it to the import where the file imports by name; the chain then types |
| 13 | `p12-starting-world.test.ts(55,92)` | TS2345 | root | S4 | G4 | insert convertV45ToV44 innermost at :55, and add it to the import where the file imports by name; the chain then types |
| 14 | `p14b1-first-take.test.ts(301,36)` | TS2379 | root | S1 | G5 | rename at :294 types roundTripped as SaveFileV45 |
| 15 | `p14b1-t4-regressions.test.ts(168,33)` | TS2379 | root | S1 | G4 | rename at :166 |
| 16 | `p14b3-reservations.test.ts(96,17)` | TS2379 | root | S1 | G5 | rename at :94 |
| 17 | `p14b4-material-evidence-core.test.ts(147,44)` | TS2379 | root | S1 | G5 | type EnvelopeV33 = ReturnType<typeof validateSaveV45> at :40; rename at :109 |
| 18 | `p14b4-material-evidence-core.test.ts(293,9)` | TS2322 | root | S1 | G5 | the alias at :40 (TS2322 clears) |
| 19 | `p14b4-material-evidence-core.test.ts(294,7)` | TS2375 | root | S1 | G5 | the alias at :40 |
| 20 | `p14b4-material-evidence-core.test.ts(364,37)` | TS2379 | root | S1 | G5 | the alias at :40 and the rename at :362 |
| 21 | `p14b4-material-evidence-core.test.ts(409,27)` | TS2379 | root | S1 | G5 | the alias at :40 |
| 22 | `p14b4-material-evidence-core.test.ts(439,65)` | TS2379 | root | S1 | G5 | the alias at :40 |
| 23 | `p14c2a-save-and-settlement.test.ts(347,35)` | TS2379 | root | S1 | G3 | rename at :346 |
| 24 | `p14c2rm-writer-continuation.test.ts(287,146)` | TS2345 | root | S4 | G4 | insert convertV45ToV44 innermost at :287, and add it to the import where the file imports by name; the chain then types |
| 25 | `p14c3-cohort-transition.test.ts(288,130)` | TS2345 | root | S4 | G4 | insert convertV45ToV44 innermost at :288, and add it to the import where the file imports by name; the chain then types |
| 26 | `p14c3-dual-extensions.test.ts(180,130)` | TS2345 | root | S4 | G4 | insert convertV45ToV44 innermost at :180, and add it to the import where the file imports by name; the chain then types |
| 27 | `p14c3-offmenu-extensions.test.ts(237,130)` | TS2345 | root | S4 | G4 | insert convertV45ToV44 innermost at :237, and add it to the import where the file imports by name; the chain then types |
| 28 | `p14c3-profession-history.test.ts(119,165)` | TS2345 | root | S4 | G4 | insert convertV45ToV44 innermost at :119, and add it to the import where the file imports by name; the chain then types |
| 29 | `p14c3-promise-digest-continuity.test.ts(279,135)` | TS2345 | root | S4 | G4 | insert convertV45ToV44 innermost at :279, and add it to the import where the file imports by name; the chain then types |
| 30 | `p14c4-save-v35.test.ts(279,35)` | TS2379 | root | S1 | G3 | renames at :277 and :278 |
| 31 | `p14p3-directing-promises.test.ts(417,106)` | TS2345 | root | S4 | G4 | insert convertV45ToV44 innermost at :417, and add it to the import where the file imports by name; the chain then types |
| 32 | `p14p3-directing-promises.test.ts(425,13)` | TS2375 | root | S6 | G4 | type `invalid` as the frozen V40 state it is (`typeof bound40`, the convertV39ToV40 output of directorCapture40 at :113) instead of the live GameState; :424 already passes bound40 to the same builders and type-checks; runtime unchanged |
| 33 | `p14p3-directing-promises.test.ts(747,108)` | TS2345 | root | S4 | G4 | insert convertV45ToV44 innermost at :747, and add it to the import where the file imports by name; the chain then types |
| 34 | `p14p4p5-opportunities.test.ts(827,128)` | TS2345 | root | S4 | G4 | insert convertV45ToV44 innermost at :827, and add it to the import where the file imports by name; the chain then types |
| 35 | `p14p4p5-receipt-freeze.test.ts(363,17)` | TS2379 | root | S1 | G5 | rename at :361 |
| 36 | `p14p4p5-screenplay-status.test.ts(320,119)` | TS2345 | root | S4 | G4 | insert convertV45ToV44 innermost at :320, and add it to the import where the file imports by name; the chain then types |
| 37 | `save.test.ts(370,136)` | TS2345 | root | S4 | G4 | insert convertV45ToV44 innermost at :370, and add it to the import where the file imports by name; the chain then types |
| 38 | `save.test.ts(419,136)` | TS2345 | root | S4 | G4 | insert convertV45ToV44 innermost at :419, and add it to the import where the file imports by name; the chain then types |

## S9 sites and predictions

The archive fills only on a tick that reaches a week divisible by 13 while the state has an industry. A migration
records nothing. So a genuine capture migrated at week W refuses once a tick reaches the next multiple of 13 after W,
and a genesis route refuses from week 13. A state without an industry never refuses for this reason.

| Site | Class | Status | Prediction and edit |
|---|---|---|---|
| `cash-ledger-checkpoint-v11.test.ts:381` | S9 | measure | pinned V11 guard predicted unchanged: generateWorld has no industry; masked by :364 |
| `contracts/v14-boundary-guards.contract.test.ts:63` | S4 | measure | no industry: must succeed |
| `contracts/v14-boundary-guards.contract.test.ts:211` | S9 | measure | loose /cannot downgrade/; no industry, predicted unchanged; no edit unless the probe shows the P15 refusal (1358-F10 ruling 3) |
| `contracts/v14-boundary-guards.contract.test.ts:250` | S9 | measure | as :211 |
| `contracts/v14-boundary-guards.contract.test.ts:275` | S9 | measure | as :211 |
| `contracts/v14-boundary-guards.contract.test.ts:300` | S9 | measure | as :211 |
| `helpers/p14c2b-fixtures.ts:69` | S4 | measure | caller p14c2b-save-v36:64 (`live`, never ticked) must succeed |
| `helpers/p14c3-canonical-rival-fixtures.ts:198` | S4 | measure | tick 0, no quarter: must succeed |
| `helpers/p14c4-fixtures.ts:71` | S4 | measure | no caller in tests (type gate only) |
| `helpers/p14p3-fixtures.ts:113` | S4 | measure | futureSave chain; callers p14p3-directing-promises :387, :482, :740 are S9 leaves |
| `p06a-w1-release-authority.test.ts:406` | S4 | measure | founded studio, no industry: must succeed |
| `p12-starting-world.test.ts:55` | S4 | measure | week 0: chain succeeds, makeSaveV18 refuses as pinned |
| `p13b-s8-save-v27.test.ts:194` | S9 | measure | P15 Power Ranking refusal predicted (same natural route as :206, which M2 measured); masked by :187 |
| `p13b-s8-save-v27.test.ts:206` | S9 | certain | P15 Power Ranking refusal, measured in M2 |
| `p14b5-relationships.test.ts:1400` | S9 | measure | pinned V42 shelving guard predicted unchanged: takeWorld() sits at week 61 after a migration at week 60, before quarter 65, so the archive is empty |
| `p14b5-relationships.test.ts:1417` | S9 | measure | as :1400 |
| `p14b5-relationships.test.ts:1432` | S9 | measure | as :1400 |
| `p14b5-relationships.test.ts:1453` | S9 | measure | as :1400 |
| `p14b9-save-v42.test.ts:223` | S9 | measure | insert `convertV45ToV44` innermost, then pinned competitions-log guard predicted unchanged: the lifted state is greenlit without a tick, so its archive is empty |
| `p14c2b-save-v36.test.ts:83` | S9 | measure | P15 refusal predicted: the week-52 capture is advanced to 92 and 98, past quarters 65, 78, 91 |
| `p14c2b-save-v36.test.ts:98` | S9 | measure | P15 refusal predicted, as :83 |
| `p14c2rm-writer-continuation.test.ts:287` | S9 | measure | insert `convertV45ToV44` innermost, then unknown: depends on whether `current` crossed a quarter since its migration |
| `p14c2s-scientist-retirement.test.ts:287` | S9 | measure | P15 refusal predicted: scientistAt(hardResearch, 566) ticks the week-520 corpus past 533, 546, 559 |
| `p14c2s-scientist-retirement.test.ts:288` | S9 | measure | P15 refusal predicted, as :287 |
| `p14c3-cohort-transition.test.ts:288` | S9 | measure | insert `convertV45ToV44` innermost, then unknown: depends on the c4/c3 route weeks since migration |
| `p14c3-dual-extensions.test.ts:180` | S9 | measure | insert `convertV45ToV44` innermost, then unknown: depends on the route weeks since migration |
| `p14c3-offmenu-extensions.test.ts:237` | S9 | measure | insert `convertV45ToV44` innermost, then unknown: depends on the route weeks since migration |
| `p14c3-profession-history.test.ts:119` | S9 | measure | insert `convertV45ToV44` innermost, then unknown: depends on the fixture route |
| `p14c3-promise-digest-continuity.test.ts:279` | S4 | measure | genuine bytes, no tick: must succeed |
| `p14c3-transitions.test.ts:175` | S9 | measure | insert `convertV45ToV44` innermost, then unknown: depends on `reopened` |
| `p14c3-transitions.test.ts:207` | S9 | measure | insert `convertV45ToV44` innermost, then unknown: depends on `reopened` |
| `p14p3-directing-promises.test.ts:387` | S9 | measure | P15 refusal predicted: p13a routes run past week 13 |
| `p14p3-directing-promises.test.ts:418` | S9 | measure | P15 refusal predicted, as :387 |
| `p14p3-directing-promises.test.ts:482` | S9 | measure | P15 refusal predicted, as :387 |
| `p14p3-directing-promises.test.ts:740` | S9 | measure | P15 refusal predicted, as :387 |
| `p14p3-directing-promises.test.ts:748` | S9 | measure | P15 refusal predicted, as :387 |
| `p14p4p5-opportunities.test.ts:335` | S4 | measure | valid (week-45 capture, attached without a tick): must succeed |
| `p14p4p5-opportunities.test.ts:386` | S4 | measure | genuine bytes, no tick: must succeed |
| `p14p4p5-opportunities.test.ts:406` | S4 | measure | the validator refuses the mutation first; unchanged |
| `p14p4p5-opportunities.test.ts:827` | S9 | measure | insert `convertV45ToV44` innermost, then unknown: `released` starts from the week-45 capture; a tick past 52 records a quarter |
| `p14p4p5-screenplay-status.test.ts:328` | S9 | measure | pinned romance guard predicted unchanged: the route runs from the week-45 capture to week 48, before quarter 52 |
| `p14r3-save-v41.test.ts:381` | S9 | measure | insert `convertV45ToV44` innermost, then P15 refusal predicted: p13aGeneratedStudio ticked to week 23, past quarter 13 |
| `save.test.ts:370` | S4 | measure | contendedStudio, no industry: must succeed |
| `save.test.ts:419` | S4 | measure | as :370 |
| `v14-migration.contract.test.ts:244` | S9 | measure | loose /cannot downgrade/; founded cells without an industry, predicted unchanged; no edit unless the probe shows the P15 refusal |

**Must-succeed chains** (S4 rows above whose leaf needs success): `v14-boundary-guards:63`, `p06a-w1-release-authority:406`,
`save.test` :370 and :419, `p14c3-promise-digest-continuity:279`, `p14p4p5-opportunities` :335, :386 and :406,
`p12-starting-world:55` (the chain succeeds, then `makeSaveV18` refuses as pinned), and the helpers `p14c2b-fixtures:69`,
`p14c4-fixtures:71`, `p14c3-canonical-rival-fixtures:198` and `p14p3-fixtures:113`. If one refuses, the leaf needs a
ruling (open question 2).

**Who measures:** M2 measured the one leaf that reached a production chain. x1 measures the leaves behind H. x2
measures the test-side chains after the S4 inserts.

## S10 and the retained rows

**Retained rows that a Save45 helper pin now masks.** They get no edit at the leaf. H unmasks them.

| Retained identity | Masked at | 1358-I primary |
|---|---|---|
| `bridge-p14b2-trust.test.ts` > ignores real withdrawn unbound drafts near due and never interrupts... | `helpers/p14b2-fixtures.ts:122` | Error: P14B.2 fixture: no natural rival-only promise outcome by 240 |
| `bridge-p14c2rm-retirement.test.ts` > SYNTHETIC imported newer edge withholds unreconstructible retiremen... | `helpers/p14c2c-fixtures.ts:29` | AssertionError: freeze premise: counterpart stays lawfully disclosed: expected undefined to match object { endWeekExc... |
| `bridge-p14c2rm-retirement.test.ts` > natural retired tiers stay fixed across real drift while lawful cur... | `helpers/p14c2c-fixtures.ts:29` | AssertionError: freeze premise: counterpart stays lawfully disclosed: expected undefined to match object { endWeekExc... |
| `bridge-p14c3-runtime.test.ts` > R8 durable coordinator Save As branches208, saves B209, then clean-... | `helpers/p14c3-genuine-evidence-fixtures.ts:17` | Error: Test timed out in 5000ms. |
| `p14c3-admission-boundaries.test.ts` > N10 actual open rival promise disposition explicitly requests actor... | `helpers/p14c3-fixtures.ts:136` | AssertionError: expected { …(17) } to match object { outcome: null, progress: +0, …(1) } |
| `p14c3-canonical-rival-history.test.ts` > L1 observes an actual passive non-player Writer hire with one emplo... | `helpers/p14c3-genuine-evidence-fixtures.ts:17` | AssertionError: L passive work premise ended without an obligation: {"personId":"person-studio-8c9ee794-r01-4","week"... |
| `p14c3-canonical-rival-history.test.ts` > L2 completes real rival screenplay review, production and released ... | `helpers/p14c3-genuine-evidence-fixtures.ts:17` | AssertionError: L passive work premise ended without an obligation: {"personId":"person-studio-8c9ee794-r01-4","week"... |

**Questions for the parent:**
1. Do all 7 fail again with their 1358-I primaries after H? The canonical-rival-history premise sits at week 607 of
   a genuine route, and the p14b2 premise at week 240. Both depend on rival behavior that no Save45 root changes at
   this candidate.
2. R8's 1358-I primary is a 5000 ms timeout. After H it may time out again, fail elsewhere or pass. A pass makes a
   GONE retained identity. Does the success line accept it?
3. C20 (`p14c3-save-v38:105`) keeps failing with `"saveVersion":45` in its primary. Confirm attribution with no edit
   (1358-F9 ruling 7).
4. `p14b5-relationships:626`: confirm the guard-before-strip extension of `bytes()` (:272) in place of a new digest.
   The window is weeks 60 to 61, with no quarter week, so each root should hold no row.
5. The 71 SAME rows include no Save45 value. They stay as they are.

**Probes the parent can run** (authors run nothing):

| Probe | When | What it does | Decides |
|---|---|---|---|
| P1 retained | after H (x1) | runs `bridge-p14b2-trust`, `bridge-p14c2rm-retirement`, `bridge-p14c3-runtime`, `p14c3-admission-boundaries`, `p14c3-canonical-rival-history` and `p14c3-save-v38`; compares each primary with 1358-I by `1344-I-compare.py`; records R8's duration | questions 1 to 3 |
| P2 digest | with G1's `bytes()` edit | computes `sha(bytes(after))` for family 1 and prints `after`'s four roots (snapshots, assessments, `next`, Legacy) | question 4 |
| P3 week 93 | before G1 writes :618 | prints the candidate's roots at week 93 on `HARNESS_GENESIS()` (quarter weeks, `next`, assessments, Legacy) and runs the four root validators | open question 5 |
| P4 first guard | after the S4 inserts (x2) | captures the thrown message or success at every S9 and must-succeed site in the table above, with its source line | each S9 row |
| P5 S8 messages | after the S1 renames (x2) | captures each S8 site's message, the three bare `.toThrow()` cases included | each S8 row |
| P6 S5 diff | after the helper (x2) | prints any remaining difference and each root's `recordedFromWeek` against the input week | each S5 row |
| P7 type gates | after each unit | runs the root, UI and Bridge gates | the type rows |

## What the sweep must not touch

- **The P15 RED files:** `tests/p15a1-market-integration.test.ts` with its `-atomicity` and `-phases` files,
  `tests/p15a2-power-ranking-archive.test.ts` with its `-isolation` and `-harness` files,
  `tests/p15c2-campaign-legacy-integration.test.ts` (1361-R's T, A, I, H and L), and the helpers `tests/helpers/p15-roots.ts`,
  `p15a1-market-route.ts`, `p15c2-legacy.ts` and `p15c2-route-l.ts`. `p15c1-campaign-legacy` and
  `p15c-wave-r-retention` hold no Save45 pin. No P15 test file has a census line.
- **`BASE_LIVE_SAVE_VERSION = 44`** at L:151, asserted below STEP at L:820.
- **F10 and F11** at `tests/bridge-contract-generator.test.ts:732-733` (`1dadf88f…`). No production edited the Bridge
  schema.
- **The 45 declared 1355 leaves** and the P15 capture leaves that pass at Save45 (1361-R §3.5).
- **Retained 1358-I identities** get no edit, C20 included.
- **Production files, fixture payloads (`tests/fixtures`), tsconfig and `generated/`.**
- **The six 1296-A Owner-input files** and `bridge/testing/c3-active-endurance-observer.ts:41`.
- **Comments** that cite moved `save.ts` lines stay, except the S9 comments the S9 form rewrites.

## Success line

On the landing's recorded gates (Node v20.20.2, a quiet machine, the 447-file core list):
- the root, UI and Bridge type gates exit 0, and both generator checks pass;
- **core:** the failing identities equal 1358-I's 85 identities (in M2, 71 SAME and 14 CHANGED), plus the 45 declared
  1355 leaves, plus the environment rows, and nothing else:
  - 78 of the 85 fail with their 1358-I primaries: the 71 SAME rows and the 7 rows H unmasks (R8 per S10 question 2);
  - C20 fails with its version-only change, which the compare attributes;
  - the 6 `r3n1-stale-schedule-take-02*` rows fail with ENOENT as at 1358-I; a scratch tree shows its own path;
  - each 1355 leaf fails with its declared message;
  - the parent attributes any `bridge-supervisor` row that reproduces on a quiet machine as an environment row;
  - `tests/hygiene.test.ts:45` fails until the parent rules (open question 1);
- **UI:** NEW 0 against 1358-I2;
- **d16:** the same 12 of 176 leaves as at base;
- the 18 renamed titles appear only as passing identities, and the P15 capture leaves of 1361-R §3.5 pass.

## Open questions for the parent

1. **The hygiene row.** `tests/hygiene.test.ts:45` finds "Math.random" in a comment at L:79 ("// no Math.random; TUNING
   by name; …"). The standing rule bans the literal in tests, comments included (1344-X9). It fails at HEAD without
   Save45, and L is a RED file this sweep must not touch. Options: the RED's owner rewords the comment in a P15C r2 or
   the closure, or the Owner approves a declared exception. Until then the success line carries one extra row.
2. **S9 policy.** The plan pins the measured first guard (1358-F10 ruling 4). If a must-succeed chain refuses, the
   plan follows 1358-F9 ruling 2: refuse rather than strip, and choose an input with no recorded quarter. Confirm. The
   exact anchors will move again when P15A.1 (c) lands, because the shared-market reason comes first in the message.
3. **S5 helper form.** The plan writes `withEmptyP15Roots(state, week)` once per file with literal roots (1358-F9
   ruling 6). Importing production's `initialP15Roots` would let production define the expectation. Confirm.
4. **S7 and S10 strip guards.** The guard can import `stripP15` and `p15Rows` from the landed RED helper
   `tests/helpers/p15-roots.ts` (read only) and add a `p15Sequence.next === 1` check, or each file can carry its own
   literal list. The RED helper's list grows when a later P15 root lands. Choose one.
5. **The week-93 control** (`p14d1-rival-shelving:618`). The plan proposes the 1358-F12 form: assert that the
   candidate holds no shared-market assessment and an unfrozen Legacy, that its archive passes
   `validatePowerRankingArchive` and its allocator passes `validateP15Allocator`, then take the four roots out of the
   candidate as :616 takes slice B's fields out. The genuine side stays at its V44 lift (:569). P15A.2's own tests
   measure the archive. Rule on it with question 4's digest strip.
6. **Class numbering.** The brief named S5, S8, S9 and S10 as the measured classes. The plan keeps 1358-N's S1 to S10
   and renames P5 to T, since Save45 has no projection step. S6 and S7 keep their slots for hand-built states and
   shape projections. Confirm.
7. **Titles.** 18 renames, listed under T. Confirm.
8. **Retained rows.** Confirm attribution with no edit for C20 and the re-attribution of the 7 masked rows, and rule
   on R8 (S10 question 2).
9. **Bare `.toThrow()` probes.** Confirm that `p14b1-t4-regressions:86`, `p14c2rm-writer-continuation:379` and
   `p14c3-save-v38:121` take a pin only where P5 shows a guard other than the tampered field's.
10. **1361-D3 F4 and 1361-D2 F7.** The plan's rule: every hand lift that a test ticks ends at Save45 through
    `convertV44ToV45`, and no test adds the roots one at a time. Then no test ticks a state without `sharedMarket`
    (F7) or reaches week 6240 without `campaignLegacy` (F4). At HEAD no test outside the P15 files names a P15 root
    (grep over `tests`, `ui/src` and `bridge`), and the census found two lifts that tick (`p14c1-materialized-aging:178`,
    `p14b9-save-v42:192`). The presence check at `campaignLegacy.ts:1165-1166` stays with its owner. Confirm.
11. **Units.** G4 carries 137 edit lines, 57 of them to measure. Split it if one author cannot hold it.

## Disclosures

- **Writes outside the brief's folder.** The planner wrote working files (scripts, JSON joins of M2's rows with their
  frames, a copy of the candidate's `save.ts`) to the session scratchpad
  `/private/tmp/claude-501/-Users-zacheryspector-Downloads-project-studio-p13-owner-direction-inputs-01/60db833c-4cf7-4685-b2ec-8aac42c6dac1/scratchpad/`.
  The planner copied the scripts to [py/](py/); they still read their inputs from that scratchpad.
- **Git reads in the repository:** one `git log --oneline -3` on a test file, while dating the hygiene offender, before
  the planner applied 1358-F10 ruling 10 (the plan cites nothing from it); `rev-parse` of HEAD and of the four tree ids
  at a0e51c93 and HEAD. In the writer's tree: `git show p15c-c-r1:<path>` and `git diff base p15c-c-r1 -- <path>` only.
- **Runs:** python3 and the shell's read tools only. No node, vitest, tsc, npm, npx, tsx or vite-node.
- **Not opened:** Owner saves and anything under `tests/fixtures`.
