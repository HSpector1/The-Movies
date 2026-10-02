# 1358-N group H: handback

Group H test author, 2026-10-02 03:48 CDT (from `date`). Worktree `/Users/zacheryspector/studio-scratch/1358-sweep/h`,
branch `sweep-h`, base tag `step4` (8e02a44). E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`
in the repo. File paths below are repo-relative.

## Deliverables

- `patch.diff`: `git -C <worktree> diff step4 -- tests ui`. 15 files, 63 insertions, 58 deletions, sha256
  `8b2e33e6044bce49568b64f0f8f7f19b5171416c5472ea0c57ff2496ed5a784d`.
- `classification.json`: 63 objects, one per changed line.
- `deferred.json`: 7 rows.
- `handback.md`: this file.

Scope checks:

- `git diff --stat step4 -- . ':!tests' ':!ui/src'` prints nothing. The patch changes no `ui` file.
- `git apply --check --cached patch.diff` passes against `step4` under a temporary index. The index lived under
  `out/h` and is deleted.
- At repo HEAD 2ff1bf89 each of the 15 files has the same blob as at `step4` (`git rev-parse HEAD:<file>`), so the
  patch applies to HEAD.

Commits on `sweep-h`, in 1358-F8 ruling 7's order:

1. b9093df: `acceptedEvidence` (N-0016 to N-0018).
2. c5fe111: the history-boundary and second-episode pins, and `envelope38` (N-0019 to N-0024, N-0015).
3. 7174788: the four helper chains (N-0005, N-0006, N-0012, N-0013, N-0025, N-0026, N-0028 to N-0033).
4. 5635745: the `saveApi` key and its 24 callers, with the three live literals of `p14c3-save-v38` (N-0014,
   N-0034 to N-0040, N-0043 to N-0062).
5. 5fcecc6: the validators of `p14b2-fixtures`, `p14c2c-fixtures` and `p14c2rm-fixtures` (N-0001 to N-0004, N-0008
   to N-0011).

## Counts by class

| Class | Census rows edited | Comment lines edited | Deferred |
|---|---:|---:|---:|
| S1 | 42 | 3 | 0 |
| S2 | 7 | 0 | 0 |
| S4 | 9 | 2 | 0 |
| S5 | 0 | 0 | 1 (N-0041) |
| S8 | 0 | 0 | 1 (H-new-1) |
| S9 | 0 | 0 | 4 (N-0007, N-0027, H-new-2, H-new-3) |
| S10 | 0 | 0 | 1 (N-0042) |
| Total | 58 | 5 | 7 |

- H edited all 58 certain census rows, one classification object each.
- Five more objects cover the comment lines beside N-0014 (`tests/helpers/p14c3-fixtures.ts:64-65`), N-0032
  (`tests/helpers/p14p3-fixtures.ts:102`) and N-0033 (`:108-109`). They carry their row's id and class.
- Every object has status `certain`. H edited no S8 or S9 row on reading.
- No P-class row falls in H, and H renames no title.

## Acceptance by reading: rows 59-61 and `p14b10-mentor-label`

X5 step 4 stops all three Mentor leaves of `tests/bridge-p14b10-relationship-labels.test.ts` (:316, :331, :351) at
`tests/helpers/p14c3-genuine-evidence-fixtures.ts:17:29`, `expected 44 to be 43`. The call comes from
`tests/helpers/p14c3-cohort-transition-fixtures.ts:170` (E/1358-stage/x5/x5-step4.json).

The path through the helpers:

- Each Mentor leaf calls `mentorCohort()` (:291-313). That wrapper calls `cohortThreeFilms()`
  (`tests/helpers/p14c3-cohort-transition-fixtures.ts:214-231`), a helper outside H with no census row.
- `cohortSetup()` (:163-213) and the route use these H functions:
  - `c2bFixture` and `liveEnvelope` (`tests/helpers/p14c2b-fixtures.ts:42-57`). They read genuine V35 bytes and stamp
    35 on that state, so they stay historical and unchanged.
  - `clone`, `person` and `sha` from `tests/helpers/p14c3-fixtures.ts`, unchanged.
  - `acceptedEvidence`, which H moved. The route calls it at :170, :198 and :210, in `hire` (:93), `refreshSet` (:123)
    and `release` (:155).
  - `greenlightEvidence` (`tests/helpers/p14c3-genuine-evidence-fixtures.ts:40-57`), which calls `acceptedEvidence`
    at :55.
- After H, `acceptedEvidence` expects 44, the version `makeSave` stamps (`src/core/save.ts:6567`, :6572). It then
  calls `validateSaveV44`, which returns its input (:10771), so `toBe(saved)` holds.
- The route calls no downgrade chain, no `saveApi` and no `envelope38`.
- After the build, the leaves call only `relationshipBlockFor`, `mentorEvidence` and their local `withoutRelease` and
  `titleOf`. The file also imports `advanceTo`, `fund` and `player` from `tests/helpers/p14b2-fixtures.ts`, and H
  changed none of the three.
- `tests/p14b10-mentor-label.test.ts` reaches H only through `cohortThreeFilms()` and through `clone` and `fund` from
  `tests/helpers/p14b2-fixtures.ts`. Its genesis leaves read `p13aGeneratedStudio` worlds through core.

Nothing else in H's files blocks these leaves. Two things H cannot change remain: production behaviour along the route
(up to 128 ticks, week 2600 to 2728 at most, each `acceptedEvidence` validating the edges at era 44), and r7's
first-two-titles assertion. The parent records the first Mentor leaf's duration against 1358-F6 ruling 5's 49,182 ms.

H's `acceptedEvidence` move also reaches the UI gate. `ui/src/screens/StudioCalendar.career.test.tsx` builds its
states through `tests/helpers/p14c3-surface-fixtures.ts`, which calls `acceptedEvidence` and `reopenEvidence`.

## Census rows found wrong

1. **N-0024.** The edit reads `validateSaveV43(saved) -> validateSaveV44(saved)`. The line holds
   `expect(validateSaveV43(save)).toBe(save)`. H edited the line as it stands.
2. **N-0007.** The row cites five importers. Only `tests/p14c2b-save-v36.test.ts` calls `liveEnvelopeV36` (:64, :74,
   :82). The other four importers take other names from the module.
3. **N-0027.** The row cites two importers. No test calls the `liveEnvelope` of `tests/helpers/p14c4-fixtures.ts`, so
   the chain at :71 never runs. Only the type gates exercise it.
4. **N-0041.** F9 ruling 1 gives the S5 rows to M2. M2's tree carries no sweep, so it stops this leaf at :72
   (`expected 44 to be 43`), before the comparison at :87. Only a run with H applied reaches :87, so H names the dry
   run.
5. **N-0043.** The census gave the renamed lookup at `tests/p14c3-save-v38.test.ts:111` no S8 partner. The plan's S1
   rule requires one for a renamed call under a bare `.toThrow()`. H adds H-new-1.

## New rows

- **H-new-1 (S8, deferred).** `tests/p14c3-save-v38.test.ts:116`, the bare `.toThrow()` in `rejectMutations`. The
  census missed it because the renamed lookup (:111) and the `.toThrow()` (:116) sit on different lines. Reading finds
  no masking. Each case mutates a `careerLifecycle` root or a talent role, and `validateSaveV44` reads none of those
  before the frozen V43 chain (`src/core/save.ts:10763-10772`, :749; `src/core/relationships.ts:666-811`). No edit
  planned.
- **H-new-2 and H-new-3 (S9, deferred, G5's file).** `tests/p14p3-directing-promises.test.ts:361` and :438 reach H's S4
  insert through `futureSave().convertV39ToV38`. Both regexes contain `discard`. A `convertV44ToV43` refusal
  (`migrateToV43: cannot downgrade or discard ...`, `src/core/save.ts:10789-10790`) would satisfy them and hide the V39
  predicate guard that 1344-X12 measured first there (1344-C5 item 56). The census has no row at either line.

## Items that need a parent ruling

1. **N-0041's deciding run.** Confirm the sweep dry run, not M2, for `tests/p14c3-save-v38.test.ts:87`. After H the
   four `it.each` cases fail at :87 instead of :72 wherever the genuine state holds an edge, until the S5 follow-up
   lands.
2. **H-new-1.** The S8 rule asks for measured message pins. Reading puts every case at its own V43-chain guard, as under
   Save43, where the sweep pinned nothing here. H proposes closing the row with no edit once the 11 `rejectMutations`
   leaves pass in the dry run. Rule whether the dry run must also log each case's message.
3. **H-new-2 and H-new-3.** Assign them to G5 or to the S9 follow-up unit. The dry run decides whether the four D13
   positives and D14's `abandoned` state hold a log row or a romance track.

## Dependents of signature and behaviour changes

Method: the import graph of `tests`, `ui/src`, `bridge` and `scripts`, followed through every top-level declaration
that references a changed function, with strings and comments ignored. A file counts when it imports an affected name.

**Signature change.** The `SaveAPI` key `validateSaveV43` becomes `validateSaveV44` (`tests/helpers/p14c3-fixtures.ts:66`).
Four files call `saveApi`, all H's and all renamed here: `tests/p14c3-admission-boundaries.test.ts`,
`tests/p14c3-profession-episodes.test.ts`, `tests/p14c3-save-v38.test.ts`, `tests/p14c3-transition-evidence.test.ts`.
No file in `ui/src`, `bridge` or `scripts` uses it. `FutureSaveChainSteps` in `tests/helpers/p14p3-fixtures.ts` changes
too, but the file does not export it. No exported name changes.

**Behaviour changes.** Each helper below now accepts the live V44 envelope where step 4 made it fail the 43 pin or throw
`validateSaveV43: expected version 43`. The four chain helpers also refuse a log row or a romance track by name, through
`convertV44ToV43`.

- `tests/helpers/p14c3-genuine-evidence-fixtures.ts` (`acceptedEvidence` and the ten exported functions that reach it):
  `tests/bridge-p14b10-relationship-labels.test.ts`, `tests/bridge-p14c3-dual-career-surfaces.test.ts`,
  `tests/bridge-p14c3-read-models.test.ts`, `tests/bridge-p14c3-runtime.test.ts`,
  `tests/helpers/p14c3-canonical-rival-fixtures.ts`, `tests/helpers/p14c3-cohort-transition-fixtures.ts`,
  `tests/helpers/p14c3-equal-tuple-fixtures.ts`, `tests/helpers/p14c3-surface-fixtures.ts`,
  `tests/p14b10-mentor-label.test.ts`, `tests/p14c3-calendar-career.test.ts`,
  `tests/p14c3-canonical-rival-history.test.ts`, `tests/p14c3-cohort-transition.test.ts`,
  `tests/p14c3-deferred-transition-chain.test.ts`, `tests/p14c3-equal-tuple-evidence.test.ts`,
  `tests/p14c3-held-actor-evidence.test.ts`, `tests/p14c3-transition-owner-and-snapshots.test.ts`,
  `ui/src/screens/StudioCalendar.career.test.tsx`.
- `tests/helpers/p14c3-history-boundary-fixtures.ts` (`acceptBoundary` and the 12 declarations in the file that reach it):
  `tests/p14c3-profession-history.test.ts`.
- `tests/helpers/p14c3-second-episode-fixtures.ts` (`accepted`, `announcedEpisode`, `completedEpisode`,
  `finishingEpisode`, `renewedEpisode`): `tests/bridge-p14c3-dual-career-surfaces.test.ts`,
  `tests/helpers/p14c3-dual-extension-fixtures.ts`, `tests/helpers/p14c3-offmenu-extension-fixtures.ts`,
  `tests/helpers/p14c3-queued-writing-fixtures.ts`, `tests/p14c3-dual-extensions.test.ts`,
  `tests/p14c3-offmenu-extensions.test.ts`, `tests/p14c3-queued-writing-proof.test.ts`,
  `tests/p14c3-second-episode-writing.test.ts`.
- `tests/helpers/p14c3-fixtures.ts` (`envelope38`, `saveApi`, and `chosen` and `obligationControls`, which call
  `envelope38`): `tests/helpers/p14c3-queued-writing-fixtures.ts`, `tests/helpers/p14c3-second-episode-fixtures.ts`,
  `tests/p14c3-admission-boundaries.test.ts`, `tests/p14c3-profession-episodes.test.ts`,
  `tests/p14c3-queued-writing-proof.test.ts`, `tests/p14c3-save-v38.test.ts`, `tests/p14c3-second-episode-writing.test.ts`,
  `tests/p14c3-transition-evidence.test.ts`, `tests/p14c3-transitions.test.ts`.
- `tests/helpers/p14c2b-fixtures.ts` (`liveEnvelopeV36`): `tests/p14c2b-save-v36.test.ts`.
- `tests/helpers/p14c4-fixtures.ts` (`liveEnvelope`): no caller. Its importers compile it: `tests/p14c4-save-v35.test.ts`,
  `tests/p14c4-cohorts.test.ts`, `tests/helpers/p14c3-history-boundary-fixtures.ts`,
  `tests/helpers/p14c3-surface-fixtures.ts`.
- `tests/helpers/p14c3-canonical-rival-fixtures.ts` (`canonicalInitial` and `canonicalHired`, `canonicalChosen`,
  `canonicalReleased`, which build on it): `tests/p14c3-canonical-rival-history.test.ts`. The state sits at tick 0 with
  `relationships: []` (`src/core/worldgen.ts:812`), so the V38 export keeps `CANONICAL_INITIAL_SHA`.
- `tests/helpers/p14p3-fixtures.ts` (`futureSave`): `tests/p14p3-directing-promises.test.ts`. Every caller passes a live
  envelope (`makeSave` or `migrateToLive`; :58, :350, :361, :411, :433, :438, :680, :689).
- `tests/helpers/p14b2-fixtures.ts` (`retentionFixture`, `poachingFixture`, `rivalFixture`, `historyFixture`):
  `tests/bridge-p14b2-trust.test.ts`, `tests/bridge-p14b5-relationships.test.ts`,
  `tests/bridge-p14b6-e714-false-empty-absence-lines.test.ts`, `tests/bridge-p14b6-relationship-read-models.test.ts`,
  `tests/p14b2-fixture-preconditions.test.ts`, `tests/p14b2-setup-wrap-regressions.test.ts`,
  `tests/p14b7-promise-waiver.test.ts`.
- `tests/helpers/p14c2c-fixtures.ts` (`savedState`, `c2cFixture`, `withPromiseVariant`):
  `tests/bridge-p14c2c-retirement-promises.test.ts`, `tests/bridge-p14c2rm-proposals.test.ts`,
  `tests/bridge-p14c2rm-retirement.test.ts`, `tests/helpers/p14c2rm-fixtures.ts`,
  `tests/p14c2c-retirement-promises.test.ts`, `tests/p14c2c-rival-promises.test.ts`,
  `tests/p14c3-admission-boundaries.test.ts`.
- `tests/helpers/p14c2rm-fixtures.ts` (`admitted` and `extensionWorld`, `finishingWriter`, `frozenTies`,
  `multiRoleAlumnus`, `naturalRoleAlumnus`, `retirementCrowd`): `tests/bridge-p14c2rm-proposals.test.ts`,
  `tests/bridge-p14c2rm-retirement.test.ts`, `tests/helpers/p14c2rm-writer-fixtures.ts`,
  `tests/p14c2rm-writer-continuation.test.ts`.

## Examined sites that need no edit

- `tests/helpers/p14c3-canonical-rival-fixtures.ts:197` and `tests/helpers/p14p3-fixtures.ts:64` read
  `LIVE_SAVE_VERSION`.
- These stamp or read genuine historical envelopes, so they keep their numbers:
  - `tests/helpers/p14c2b-fixtures.ts:55-57` (35);
  - `tests/helpers/p14c4-fixtures.ts:54-56` (34) and :99-102 (37);
  - `tests/helpers/p14c2rm-fixtures.ts:104` (35), with `validateSaveV37` kept in its import (:6);
  - `tests/helpers/p14c3-fixtures.ts:100` (manifest 37 and 52) and :103-105 (`historical37`, `validateSaveV37`);
  - `tests/helpers/p14c3-history-boundary-fixtures.ts:98` and :116 (`envelopeV34`).
- `tests/p14c3-save-v38.test.ts`:
  - :326 stamps 37 on a stripped copy for the frozen V37 reader.
  - :312 and :483 call `convertV38ToV37`, which refuses first in `assertProfessionHistoryDowngrade`
    (`src/core/save.ts:10528`), before any version check.
  - :464-471 downgrade untouched migrated captures through `migrateToV37`, which takes 44 through `convertV44ToV43`
    (`src/core/save.ts:10462`). Every edge holds an empty log and a null romance, so the chain succeeds by reading.
  - :332-350 hand frozen builders a tick-0 state with `relationships: []`.
- Comments stay as written:
  - `tests/helpers/p14c3-fixtures.ts:61-63` cites Save43-era `save.ts` lines (1358-N out of scope);
  - `tests/helpers/p14c3-canonical-rival-fixtures.ts:188-195` names the live v42 sha (1344-F4 ruling 7, 1344-C5 item 1);
  - `tests/p14c3-save-v38.test.ts:42-43` describes the Save43 helper.
- `tests/helpers/p14c4-fixtures.ts:58-69` (records 840 and 975): `convertV44ToV43` refuses a log row or romance by name
  and strips nothing, so the S4 insert keeps the rule "refuse rather than strip a current root".

## Process

- H ran no node, vitest, tsc, tsx, vite-node or npm process.
- In the repo H ran only read-only git (`log`, `show`, `rev-parse`) and read files. H read no fixture file and no Owner
  save, and wrote under no symlink.
- H wrote only in its worktree (five commits on `sweep-h`) and under `out/h`.
- Added lines hold no em dash, no tab, no trailing space and no `Math.random`. The one em dash in `classification.json`
  sits in the verbatim old text of `tests/helpers/p14p3-fixtures.ts:102`, which H replaced with a semicolon.
