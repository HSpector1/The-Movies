# 1358-N: Save44 and projection-57 test pin sweep plan

**Status: ADOPTED as drafted, with [1358-F9](1358-F9-parent-rulings-on-1358-N-draft.md)'s rulings; the parent completes
"Measured fallout" from 1358-M2 (done); [1358-F10](1358-F10-parent-rulings-on-sweep-handbacks.md) rules on the handbacks.** The planner read HEAD 5245072a on `wip/headless-program-20260916-ts` on 2026-10-02
and drafted this plan at 03:20 CDT. HEAD 2ff1bf89 differs from 5245072a only under `docs`.

- **Census:** [census.json](1358-stage/n/census.json) and [census.md](1358-stage/n/census.md), with the planner's
  scripts in [1358-stage/n/py/](1358-stage/n/py/).

Slice B's production makes the live save version 44 and the projection 57. The sources:
[1358-E](1358-E-rel-sliceB-production-handback.md), revision r2 in
[1358-E2](1358-E2-rel-sliceB-production-r2-handback.md), review [1358-J](1358-J-rel-sliceB-production-review.md),
delta check [1358-J2](1358-J2-rel-sliceB-production-r2-delta-check.md) and dry run
[1358-X5](1358-X5-rel-sliceB-production-dry-run.md). Line numbers below are at step 4 r2.

- **Save44** gives every relationship edge `competitions: []` and `romance: null` (`convertV43ToV44`,
  `src/core/save.ts:10776-10781`).
  - `convertV44ToV43` refuses a downgrade that would drop a log row or any non-null romance track (:10789-10790).
  - `validateSaveV44` (:10763-10772) checks its own root at era 44 (:10768). It then hands the frozen V43 chain the
    era-42 projection.
- **Projection 57** adds `labels` and `romance` to `StudioRelationshipRow` (`bridge/schema/bridge-schema.ts:2812`,
  :2814).
  - The runtime checkpoint registers the outgoing56 schema id `sha256:349b2d3e…` as `projection-v56`
    (`bridge/runtime-checkpoint.ts:64`).
  - The schema id moves to `sha256:74826ef4…1253`.

The suite still states Save43 and projection 56. This plan scopes the test-side sweep that returns the broad core and UI
gates to their 1348-M sets. It follows [1344-N](1344-N-save43-pin-sweep-plan.md) and changes tests only. It touches no
production file, fixture payload or tsconfig. The step-4 patch touches no test file, so the sweep patch applies to HEAD
with or without the production steps.

## Measured fallout

- **1358-X5, step 4.**
  - **Root type gate, 46 errors:**
    - 18 TS2345 that pass a `SaveFileV44` where a `SaveFileV43` is typed, each at a live-to-older chain;
    - 2 TS2322, at `p14b10-conflict-evidence:108` and `p14b4-material-evidence-core:293`;
    - 24 strict-Pick TS2345 in `p14b5-relationships` and 2 in `p14b5-t-failure-tuning`.
  - **UI and Bridge gates, 2 errors each,** both in the shared helpers `tests/helpers/p14c2b-fixtures.ts:69` and
    `tests/helpers/p14c4-fixtures.ts:71`.
  - **The six slice B files:**
    - rows 59-61 fail at `acceptedEvidence` with `expected 44 to be 43`;
    - `p14b5-relationships` adds 27 fallout failures (staged edges, `validateSaveV43` on live envelopes, family 10),
      beside the three 1344-F6 row 6 exceptions.
- **[1358-M2](1358-M2-rel-sliceB-fallout-measurement.md)** (no test edit):
  - **Core:** 879 failed. Against 1348-I: SAME 71, CHANGED 14, NEW 795, GONE 0. Every NEW row is a Save44 or
    projection-57 pin, a shared helper's pin, or a known environment row. 114 sit in files without census rows: 105
    behind group H's helper pins, one suite-level row of a G5 file, and 8 environment rows.
  - **UI:** 16 failed. Against 1348-I2: CHANGED 3 (the numpy rows, by path) and NEW 13 (eight G4 pins, three through a
    helper, one known intermittent, one candidate intermittent).
  - **The four §7 routes** keep every §7 measure. Outside the relationship root, each final state equals 1348-X7's.
  - **What it decides:** the four p14p4p5 S5 rows need the helper. Most other measure rows go to the sweep dry run
    ([1358-F10](1358-F10-parent-rulings-on-sweep-handbacks.md) ruling 1).
- **The census.**
  - **Rows:** 685 in 156 files, 625 certain and 60 measure.
  - **No-edit rows:** 20 of the 685 plan no edit and name what the sweep must confirm at the site.
  - **Already measured:** 31 rows carry an X5 measurement.
  - **Other sites:** 123 examined sites need no edit, and 2 sit out of scope.
  - **Coverage:** every line of 1358-E's `pins.txt` and all 66 sites of 1358-J's list "For the sweep plan 1358-N"
    appear as rows or as no-edit entries.
  - **Post-image check:** all 13 post-image blobs in the census tree equal 1358-E2's table.

## Classes

Each edit gets one classification row. Counts are census rows. A line with two kinds of edit carries two rows.

- **S1 live validator selection (286 rows, 79 files, certain).** `validateSaveV43(` on a live envelope becomes
  `validateSaveV44(`.
  - **What counts as live:** an envelope from `makeSave`, `migrateToLive`, a hydrated checkpoint slot, a
    `LIVE_SAVE_VERSION` stamp, or a helper that returns one.
  - **Kinds of row:**
    - 198 calls and 49 imports;
    - 26 lookups by name: the callers of the `saveApi` key, and two `requireFunction` sites;
    - 8 typed members and type imports, including the `saveApi` key itself at `tests/helpers/p14c3-fixtures.ts:64`;
    - the five `validateRelationshipsRoot(<live>, 42)` calls that move to era 44 (1358-J 3g).
  - **Keep:**
    - `validateSaveV43` on V43 envelopes: the `convertV42ToV43` outputs and `baseV43Envelope()` in
      `p14d1-rival-shelving-save-v43`;
    - existence checks of the frozen function.
  - **Stop:** the input is not shown to be live, for example a genuine V43 capture or a hand-stamped V43 state. Keep the
    site and record why. A renamed call under a bare `.toThrow()` also takes an S8 row.
- **S2 live literals (136 rows, 81 files, certain).** A `toBe(43)` or a stamp that states the live writer's version
  becomes 44.
  - **Helper pins that every dependent inherits:**
    - `p14c3-genuine-evidence-fixtures.ts:17`;
    - `p14c3-history-boundary-fixtures.ts:26`;
    - `p14c3-second-episode-fixtures.ts:27`;
    - `envelope38` at `p14c3-fixtures.ts:134`.
  - **Other sites:**
    - the envelope helper at `p14c3-queued-writing-proof:27`;
    - the expected export at `bridge-p14b2-checkpoint:92`, whose expected state holds `relationships: []`, so it needs
      no S5 edit;
    - the eight UI pins (1358-J 3a).
  - **`film-chronicle`:** :911, :922 and the guard at :923 move together. If :922 moved alone, the guard would make the
    leaf vacuous (1358-J 3k).
  - **Keep:** a 43 that stamps or reads a V43 envelope (`p14d1-rival-shelving-save-v43:57`, :124, :229, :243, :257).
  - **Stop:** the literal names a capture or a frozen API.
- **S3 future-version sentinels (30 rows, 16 files, certain).** The stamp 44 becomes 45. The message "unknown
  saveVersion 44" becomes 45, and "1 through 43" becomes "1 through 44" (`save.ts:5445`).
  - The class includes `d17a-adv-migration:274` and `d17b-save-v7:163`, which `pins.txt` missed (1358-J 3b).
  - It also includes `save.test.ts:288`. Its bare `.toThrow()` would pass on a Save44 shape refusal.
  - **Stop:** the leaf asserts something other than the unknown-version refusal.
- **S4 live-to-older chains and typed helpers (45 rows, 21 files, certain).** `convertV43ToV42(live)` becomes
  `convertV43ToV42(convertV44ToV43(live))` at 26 call sites. The class also covers:
  - 14 import lines;
  - four typed dynamic APIs: the `p14b9-save-v42` `mods` type, the `p14p4p5-opportunities` `api` type, and the
    `p14p3-fixtures` steps type with its existence check;
  - four helpers that carry chains: `p14c2b-fixtures:69`, `p14c4-fixtures:71`, `p14c3-canonical-rival-fixtures:198`
    and `p14p3-fixtures:110`;
  - `EnvelopeV33` at `p14b4-material-evidence-core:40`, which becomes `ReturnType<typeof validateSaveV44>`.

  X5 measured 18 of the call sites and the TS2322 at :293.
  - **Keep:** the V43 envelopes at `p14d1-rival-shelving-save-v43:223-263`.
  - **Stop:** after the insert, the chain's first refusal differs from the one the leaf expects. That leaf takes an S9
    row.
- **S5 migration comparisons (19 rows, 17 files: 2 certain, 17 measure).** A migrated V31-V43 genuine input is compared
  with its old state plus the known new roots. The comparison gains `competitions: []` and `romance: null` on every edge.
  - **The helper:** each file gets one helper, `withEmptyCompetitionsAndRomance`, beside `withSharedCompetitions`. It
    builds the fields from the old state, never as literals. 1344-D4 accepted per-file helpers for Save43.
  - **Comparison sites:** 16 sites already map edges through `withSharedCompetitions`, so their inputs hold edges.
  - **Hand-lifted "live" states that stop at V43** gain `convertV43ToV44` (1358-J 3e):
    - `p14b9-save-v42:183` (1358-J finding 16);
    - `p14c1-materialized-aging:175`;
    - `p14d1-rival-shelving:561` (measure: its comparison holds only if the week-93 route wrote no log row and no
      track).
  - **Keep:** comparisons of `.hollywood` alone, and V29/V30 inputs whose expectation states `relationships: []`.
  - **Stop:** the comparison still differs after the helper. Report the difference as an S10 value or as a defect. Never
    edit the expectation to match.
- **S6 hand-built edges (15 rows, 7 files, certain).** Every edge literal fed to the live validator (`makeSave`, `live()`,
  `stage()`, `admitted()`) or compared with an engine edge gains both fields. Every local `Edge` type gains them too.
  - **`p14b5-relationships` takes the fix at the type** (1358-J sweep item 2; 1358-F7 ruling 1). The local `Edge` (:93)
    gains `competitions` and `romance`, typed from `RelationshipEdge`. `mintedEdge` (:220) and `stagedEdge` (:228) write
    `competitions: []` and `romance: null`. This one change clears:
    - X5's 24 strict-Pick errors, including the RED's family 6c lines :1137 and :1147;
    - the minted oracles at :582-583 and :660-661;
    - the `stage()` refusals in families 6, 6b and 8 and in the D5 sentences.
  - **The other sites:**
    - the `p14b10-conflict-evidence` `stagedEdge` (TS2322 at :108);
    - the whole-edge oracle at `p14p4p5-post-capacity:347`;
    - two Pick literals in `p14b5-t-failure-tuning` (:295, :373);
    - the staged edges of `bridge-p14b5-relationships`, `bridge-p14b6-d2-withheld-employment-claim` and
      `bridge-p14b6-relationship-read-models`.
  - **Stop:** a leaf's premise needs a non-empty log or a bond. Reading found none.
- **S7 shape pins (1 row, certain).** The reader-only V34-V36 relabel at `p14c2s-scientist-retirement:300` also deletes
  `competitions` and `romance`. The relationship row's key list moves under P3. Reading found no live edge key-set pin.
  - **Stop:** a widened pin moves by more than the two keys.
- **S8 refusal messages (5 rows, 2 files, measure).** A relationship tamper on a live save now reads
  `validateSaveV44: …`, because `validateSaveV44` checks the root before the V43 chain.
  - **Prefix pins:** no test pins the validator prefix (grep over tests and ui/src). The `p14b5-relationships` family
    10 patterns name the tampered field and should still match.
  - **Vacuous passes:** the four bare `.toThrow()` leaves at `p14c2rm-writer-continuation:218`, :232, :241 and :242 pass
    today on "expected version 43" alone (1358-J finding 17). After the S1 rename, each one pins the refusal the live
    validator gives for its tamper, measured and cited by source line.
  - **Who measures:** x1 or x2. M2 sees only "expected version 43" at these sites.
  - **Stop:** the measured refusal comes from a guard other than the tampered field's. Record it as masking.
- **S9 first-guard masking (32 rows, 20 files, measure).** A live save whose edges hold a log row or a romance track
  meets `convertV44ToV43` first. It refuses with "migrateToV43: cannot downgrade or discard the competitions log of
  <edgeId>" or "… the romance of <edgeId>".
  - **When the fields fill:** a casting competition writes a log row from step 2. A track opens at the first gaining
    write while the pair is at Friends or above (`writeRomance`, `src/core/relationships.ts:395-398`).
  - **Leaves that expect an older guard (23 rows):**
    - the six 1358-J 3d leaves;
    - `p14b9-save-v42:207`, whose greenlit cast writes log rows from step 2;
    - `p14c2rm-writer-continuation:254` and `p12-starting-world:52` (finding 17). Tighten the p12 regex to the guard
      the leaf names;
    - `p14r3-save-v41:374`;
    - the V39-guard leaves: `p14p4p5-screenplay-status:324`, `p14p4p5-opportunities:810`,
      `p06a-w1-release-authority:447` and `p13b-s3-save-v23:115-117`;
    - `p14p3-directing-promises:689`, through the `futureSave` helper chain;
    - `p14b5-relationships` :1394, :1411 and :1426, plus :1447, which holds no edge and expects no change;
    - `p08a-w0-studio-history:398-399`.

    Rule (the 1344-N S9 form): the expected message names the measured first guard. Where the title names an older
    guard, a comment records the masking and names the test that still covers that guard on its own era's input.
  - **Projection chains that must succeed (9 rows):**
    - `p06a-w1-release-authority:406`;
    - `save.test` :370 and :419;
    - `p14p3-directing-promises` :387 and :693;
    - `p14p4p5-opportunities:326`;
    - `v14-boundary-guards:63`;
    - the helpers `p14c2b-fixtures:69` and `p14c4-fixtures:71`.

    These chains feed frozen builders. They need no edit while every log is empty and every romance null.
  - **Who measures:** M2 measures the leaves that reach a production `migrateToVnn` chain. x2 measures the test-side
    chains after the S4 insert, because M2's tree stops them at "expected version 43".
  - **No S9 risk, recorded on the S4 rows:**
    - `p14c3-promise-digest-continuity:279` and `p14p4p5-opportunities:374` migrate genuine bytes, so their fields stay
      empty;
    - at `p14p4p5-opportunities:394` the validator refuses each mutation first;
    - `p14c3-canonical-rival-fixtures:198` sits at tick 0 with no edge.
  - **Stop:** the first guard is neither the leaf's own nor `convertV44ToV43`'s, or a projection chain refuses.
- **S10 natural-chain values (6 rows, 5 files, measure).** In compact JSON each edge serializes 33 more bytes
  (`,"competitions":[]` and `,"romance":null`), and a track adds more. Any digest or byte count over a live save with
  edges moves from step 1. From step 3 a formed bond also moves the tiers (through the drift exemption), D5,
  `nemesisOnRoster`, chemistry and the Bridge rows.
  - **Rule:** re-derive a moved value from receipts on the chain, never from a run output. Before writing, the author
    pre-declares for each pin the one assertion that may move and the receipt facts a lawful movement must show. The
    reviewer checks the declarations before the author runs.
  - **Known rows:** retained identities whose primaries embed a value Save44 can move. They get no edit, and the gate
    compare attributes each CHANGED primary:
    - `bridge-p14b5-relationships` :540 and :560;
    - `p14b4-rival-seating-preference:498`;
    - `p13a-scientist-foundation:32`;
    - C20 at `p14c3-save-v38:100`, whose primary embeds the live version and reads 44 after the sweep (the 1344 C20
      precedent).
  - **`p14b5-relationships:236`** expects no change, because its `bytes()` strips the whole relationships root.
  - **Screen:** a scan of every hex digest and byte-count pin in tests found each one reading fixture, manifest or
    capture bytes, which step 4 leaves unchanged.
  - **The §7 routes:** M2's four §7 routes against 1348-X7 decide whether any §7 evidence re-mints.
- **P1 projection pins (75 rows, 37 files, certain).** 56 becomes 57 in:
  - `PROJECTION_VERSION`, `x-project-studio.projectionVersion`, `snapshotVersion` and `SNAPSHOT_VERSION`;
  - the `$id` (`projection-56`);
  - `INCOMING_PROJECTION` (`bridge-p14b6-relationship-read-models:103`);
  - `/expected literal 56/` (`bridge-schema:341`) and `'public const int ProjectionVersion = 56;'` (:576);
  - the generator render's `projectionVersion: 56` (`bridge-contract-generator:567`).

  The `pins.txt` false positives get no edit: `d17a-adv-cliff:192` (a release week) and `p15a2-power-ranking` :365,
  :416 and :421 (a score).
  - **Stop:** the pin names a historical projection on purpose, such as an outgoing constant or a historical manifest.
    Keep it.
- **P2 schema identity and roster (15 rows, 8 files, certain).**
  - **The schema id.** The current id `349b2d3e…` becomes
    `sha256:74826ef419bfa816647b3de156de3e24fb50327879e207c844c1e1a12b9c1253` at `bridge-contract-generator:569` and
    :572 and at `bridge-p14b5-relationships:381`. The step-4 manifest and C# carry this id, and X5's
    `check:bridge-contract` passed on them.
  - **The full prior-roster lists** gain the outgoing56 id as a named `OUTGOING_56` constant:
    - `bridge-p14b5-relationships:384` and :433;
    - `bridge-p14b4-runtime47-compatibility:211`;
    - `bridge-p14b6-relationship-read-models:791`;
    - `bridge-runtime-checkpoint:977`, sorted after `2c377b6f…`, with a provenance comment.
  - **Roster sizes** 44 become 45 (`bridge-p14b8-waiver-surface:788`, `bridge-p14b6-relationship-read-models:794`).
  - **The older-roster pins.** The length 43 becomes 44, and the digests become:
    - `d25c64254ac090a8470cc43b2f02740e149b6f29f75966ba4d2d1684b26654a6` at `bridge-p14r2r3-prior55:172`;
    - `afae82e478438adcd177592fca60fc283c0e73bdc5eefc1101a8115de28cce58` at `bridge-p14p4p5-opportunities:504`.

    `py/roster.py` computed both by the method the pins' own comments state: parse the literal pairs, drop
    `OLD_SCHEMA`, sort by key, then take the sha256 of the compact JSON. It reproduces both base pins exactly. The author
    recomputes them the same way.
  - **The `it.each` over the roster** (`bridge-runtime-checkpoint:763`) gains a projection-v56 case. That case is a new
    test identity and needs no edit (1358-J 3m). Its `toBe(43)` at :782 is an S2 row.
  - **Stop:** a recomputation fails to reproduce the base pin, or the roster changes by more than the one entry.
- **P3 row key lists (1 row, certain).** `bridge-p14b6-relationship-read-models:402` becomes
  `['counterpartId', 'counterpartName', 'drivers', 'labels', 'romance', 'sharedPictures', 'sign', 'tierLabel']`.
- **P4 whole-schema declaration bodies (2 rows, certain).** F10 and F11 at `bridge-contract-generator:724-725` take
  the value of a recorded producer run on the step-4 source (the 1328 pattern).
  - The value in 1358-J finding 10, `1dadf88fb7230405a6232fff3a37e3aee9014718200dfdb8baf4ff385ab71fa4` (420,340 bytes),
    serves only as the cross-check.
  - The provenance comment at :716-722 names the new run.
  - F12 (:726) must not move.
  - **Stop:** no value is written without the recorded run.
- **P5 renamed titles (17 rows, 15 files, certain).** A title moves when it states a number its body moves:
  - 43 as the live version;
  - 44 as the sentinel;
  - "1 through 43";
  - 56 as the projection;
  - "to V43" for `migrateToLive`.

  Each rename is a new test identity. The handback records old and new, the way RED r6 recorded family 4's. None of the
  17 is a retained failing identity. Titles that earlier sweeps left naming an older live version stay as they are.
  - **Stop:** a rename would touch a retained 1348-I identity.

## Out of scope

- **Retained identities.** The 85 core identities of 1348-I keep their causes, and 67 of them sit in files with census
  rows.
  - A retained leaf that a Save44 pin now masks moves past the pin and fails again with its 1348 primary.
  - Where a primary embeds a value the slice moves (C20's version, the S10 rows), the compare attributes the change.
    The leaf gets no edit.
- **Environment rows** get no edit. The recorded gates re-measure them on a quiet machine:
  - hygiene `ELOOP` from a stray link, and the 30 s timeouts ([1344-M](1344-M-save43-core-measurement.md));
  - the C17 `ENOENT` rows that carry a scratch path, and the `bridge-supervisor` "Fake Unity" rows. Both are scratch
    artifacts ([1344-X9](1344-X9-save43-sweep-dry-run-x3.md), after 1320-X);
  - the four intermittent UI rows ([1344-M2](1344-M2-save43-ui-measurement.md));
  - the three numpy UI rows ([1345-E](1345-E-pillow-environment-result.md)), an Owner question.
- **`bridge/testing/c3-active-endurance-observer.ts:41`** asserts `PROJECTION_VERSION` 53, which was already stale at
  HEAD's 56 (1358-J sweep item 5).
- **The six 1296-A Owner-input files** sit outside the 440-file list. `bridge-owner-ux-projection20-migration:65` also
  pins 53.
- **Comments** that cite `save.ts` line numbers moved by step 1 stay as written.

## Interaction with staged work

- **Slice B's RED** landed at 650e963a, with its GENUINE capture at 4ad8e0f7.
  - Its five new files pass at step 4, except rows 59-61, which fail at `acceptedEvidence` (X5).
  - `p14b5-relationships` takes G1's S6 and S1 edits.
  - `p14b10-mentor-label` (slice A) and rows 59-61 need only H's `acceptedEvidence` move. The mentor-label file reaches
    that pin through `p14c3-cohort-transition-fixtures`.
- **The P15 REDs** stay staged. They rebase onto the swept HEAD after this lands.
  - **Version reads:** P15A.1 (1355-C4 r4, producer 1355-P r3), P15A.2 (1356-C4 r4) and P15C (1359-C7 r7, producer
    1359-P r4) read the live version through `LIVE_SAVE_VERSION`.
  - **The one base pin** is I:151, `BASE_LIVE_SAVE_VERSION = 43` in
    `tests/p15c2-campaign-legacy-integration.test.ts`. It moves to 44 at the rebase (1359-F6 ruling 5).
  - **Captures and references:** the producers mint at `STEP - 1`, so they mint V44 captures after the rebase. The
    reference patches, written as Save44 on a Save43 base, retarget Save45.
  - **No overlap:** no P15 RED file has a census row. P15C edits two existing files, `tests/p15c1-campaign-legacy.test.ts`
    and `tests/p15c-wave-r-retention.test.ts`, and neither has a row.
- **P15B** waits for 1357-Q1.
- **Standing rules:**
  - no commit and no `git add` during a recorded run or its postflight;
  - recorded stems match `^[0-9]{3,4}[a-z0-9-]*$`;
  - `tests/hygiene.test.ts` bans the literal `Math.random` in tests, comments included (1344-X9).

## Groups

The groups are disjoint file sets, and `census.md` lists every file in each one. The order follows 1358-F8 ruling 7:
1. H lands first. G1 follows; it opens with the p14b5 `Edge` type.
2. The parent runs x1.
3. G2-G6 work in parallel on HEAD plus step 4 r2 plus H and G1.
4. The S10 values and the P4 bodies come last: from the step-4 routes and from the recorded producer run.

| Group | Files | Rows | Scope |
|---|---:|---:|---|
| H | 15 | 62 | The 11 shared helpers: `acceptedEvidence` first (`p14c3-genuine-evidence-fixtures:17-18`), then the history-boundary and second-episode pins, `envelope38`, the four helper chains, and the renamed `saveApi` key with its four caller files (`p14c3-save-v38`, `p14c3-transition-evidence`, `p14c3-admission-boundaries`, `p14c3-profession-episodes`) |
| G1 | 13 | 84 | Relationship shapes: `p14b5-relationships` (the `Edge` type), `p14b5-t-failure-tuning`, `p14b10-conflict-evidence`, the bridge-p14b5 and bridge-p14b6 staged edges, `p14p4p5-post-capacity`, `p14c2s-scientist-retirement`, `p14b9-save-v42`, the two p14d1 shelving files, `p14c1-materialized-aging` |
| G2 | 20 | 60 | Bridge A: the bridge-p10, bridge-p11 and bridge-p13b files, `bridge-schema`, `bridge`, `bridge-r3n4`, `bridge-runtime-checkpoint`, `bridge-process-restart`, `bridge-contract-generator`. P4 waits for the recorded producer run |
| G3 | 19 | 111 | Bridge B: the other bridge-p14 files, with their S5 comparisons and roster pins |
| G4 | 37 | 124 | Versions and UI: the five UI files, the save-vNN and sentinel files, the p13a and p13b families, `v14-byte-parity`, `film-chronicle` and the other S1 and S2 files of that family |
| G5 | 18 | 137 | Chains and masking: the p14c3 chain leaves, `p14c2rm-writer-continuation`, `p12-starting-world`, `p06a-w1-release-authority`, `p14p3-directing-promises`, `p14p4p5-opportunities`, `p14p4p5-screenplay-status`, `p14r3-save-v41`, `save`, `v14-boundary-guards`, `p08a-w0-studio-history` |
| G6 | 34 | 107 | The remaining core S1, S2 and S5 files: p14b1 to p14b4, the p14p4p5 family, c2a, contracts, `construction-core`, `legacy-parcel-ground`, `facility-move-demolish` |

**H's acceptance test** (1358-J sweep item 1). On step 4 plus H, rows 59-61 and `p14b10-mentor-label` pass:
- row 59 cites the released rival titles;
- row 60 withholds;
- row 61 cites the concept titles and meets r7's first-two-titles assertion.

The run records the first Mentor leaf's duration against 1358-F6 ruling 5's 49,182 ms.

## Deliverables and process

1. **The parent finalizes this plan from M2.** Each M2 failure maps to a census row or becomes a new row. Each
   `measure` row either moves to `certain` or drops with its reason.
2. **Authoring.** Each unit works in a scratch tree of HEAD with step 4 r2 applied.
   - `tests/fixtures`, `docs`, `node_modules`, `art` and `tools` are linked with `ln -sfn` and never written.
   - Each unit stages:
     - `patch.diff`, tests only, cumulative against HEAD;
     - classification rows: file, line, old text, new text, class, census id, and the measured cause or frame;
     - a handback and a deferred list.
   - Each unit checks its patch with a temporary index (`git apply --check --cached`).
   - Authors run no test, tsc or node process; only the parent runs the lane.
3. **Dry runs by the parent.**
   - **x1** after H and G1: the six slice B files, `p14b10-mentor-label` and the three type gates.
   - **x2** after G2-G6 merge: the three type gates, both generator checks, core over the 440 files, and UI.
   - **Follow-up units** take the measured S5, S8 and S9 leftovers and any S10 declaration (the r2a-r2c units of
     [1344-C5](1344-C5-save43-sweep-handback.md)).
   - **x3** confirms.
4. **P4.** The parent runs the recorded producer for F10 and F11 on the step-4 source before G2 writes them.
5. **S10.** Declarations come first, then review, then the parent's probes, as in `1344-stage/s10`.
6. **Review.** An independent review of the merged revision checks a sample of at least 40 rows:
   - assertion strength, and live against historical saves;
   - the sentinels, the chains and the S9 comments;
   - the helper and roster pins, the titles, and any S10 declaration.
7. **Landing ([1358-L](1358-L-rel-sliceB-landing.md)).**
   - The parent applies production steps 1-4 (r2) and the sweep.
   - The recorded GREEN of the six slice B files runs next.
   - Then the recorded broad core gate (440 files) and the UI gate run on a quiet machine, on Node v20.20.2.
   - Attribution runs against 1348-I and 1348-I2, and a review follows.

**Success:**
- the root, UI and Bridge type gates exit 0;
- both generator checks pass;
- the recorded GREEN fails only the three 1344-F6 row 6 exceptions;
- the broad core gate's failing identities equal 1348-I's 85, each with its 1348 primary, except a primary that embeds a
  value the slice moves (C20's version, an S10 digest), which is attributed;
- any environment row that reproduces on a quiet machine is attributed separately;
- the UI gate's failures equal 1348-I2's three numpy rows;
- no new failing identity;
- the 17 renamed titles and the projection-v56 `it.each` case appear only as passing identities.

## Open questions for the parent (answered in 1358-F9)

1. **Which run decides each measure row.**
   - M2 decides the 17 S5 rows, the S9 leaves that reach a production `migrateToVnn` chain, and the 6 S10 rows.
   - x1 or x2 decides the 5 S8 rows and the S9 rows behind test-side chains, because M2 stops those at "expected
     version 43".
2. **A projection chain that refuses.** If x2 shows `convertV44ToV43` refusing one of the 9 projection chains, the leaf
   needs a ruling. The precedent at `tests/helpers/p14c4-fixtures.ts:64-69` (records 840 and 975) is to refuse rather
   than strip a current root to manufacture old data. That points to an input with no log row and no track.
3. **S9 coverage at `p14b9-save-v42:207`.** The greenlit cast writes log rows, so `convertV44ToV43` refuses before
   `convertV42ToV41`'s casting-competition guard.
   - A V43-shaped state now throws at `relationships.ts:548` when it greenlights over an edge without `competitions`
     (finding 16).
   - Should the leaf keep one assertion on the V42 chain built before the lift, or record a reduction?
4. **The 1358-J 3i items.** The plan files the four bare `.toThrow()` leaves as S8, and `p14c2rm:254` and `p12:52` as
   S9. Confirm the labels.
5. **Titles.** The plan renames 17 titles and leaves older stale ones (for example `v14-boundary-guards:317`, "rejects
   unknown V42"). Confirm.
6. **S5 helper.** One helper per file follows the 1344-D4 ruling. A shared helper in `tests/helpers` would need one
   edit and 17 imports. Choose one.
7. **Retained rows with moved primaries.** Confirm attribution with no edit for the five S10 retained rows, C20 among
   them.
8. **The six 1296-A files** stay outside the sweep, with their stale pins. Confirm.
9. **P15C I:151** moves at the P15C rebase, not in this sweep, because the staged patch is not in the tree. Confirm.
