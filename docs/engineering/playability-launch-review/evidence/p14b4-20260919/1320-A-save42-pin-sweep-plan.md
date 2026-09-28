# 1320-A: Save42 test pin sweep plan

Save42 (production 1b675f75, review 1319-J KEEP) makes the live save version 42 and gives every relationship edge
`sharedCompetitions`. The test suite still states Save41 as live. This plan scopes the test-side sweep that returns the
broad core and UI gates to their 1316/1317 retained sets. It changes tests only; no production file, fixture payload
or tsconfig.

## Measured fallout ([1320-M](1320-M-save42-fallout-extract.txt), [rows](1320-M-save42-fallout-rows.json))

Full core over the 422-file allowlist at c6b79ad1: **855 failed tests in 143 files**, plus one suite that fails to
load (`tests/contracts/v14-boundary-guards.contract.test.ts`, "validateSaveV41: expected version 41" at import).
Against the 1316 identities: 705 new, 22 retained with a changed primary (each now stops at a Save42 pin before its
1316 cause), 129 retained unchanged, none gone. The 704 new test rows by first message: "expected 42 to be 41" 335
(93 through the `envelope38` helper literal); "validateSaveV41: expected version 41", directly or as the message a
refusal or not-throw leaf received, 333; "sharedCompetitions is missing" 12; future-version sentinels 15 (8 message,
7 no longer throwing); migration deep-equals 4; catalogue and edge-shape pins 3; one frozen `validateSaveV31` fed a
live edge (`p14b5-t-failure-tuning`) and one downgrade regex (`p14c3-transitions`). Types ([1319-T](1319-T-type-errors-after-production.txt)): 18 root, 2 Bridge, 2 UI errors, all test
files. A UI measurement follows as 1320-M2.

## Classes (each edit gets one classification row)

- **S1 live validator selection.** `validateSaveV41(` on a live envelope (`makeSave`, `migrateToLive`, a hydrated
  checkpoint slot, an explicit `LIVE_SAVE_VERSION` stamp, or a helper that returns one) becomes `validateSaveV42(`.
  A genuine V41 capture (for example `tests/fixtures/p14/genuine-v41-pre-casting-drivers`, the `p14r3-save-v41` and
  prior-55 inputs) keeps `validateSaveV41`. Tamper leaves validate the live envelope with the live validator.
- **S2 live literals.** A `.toBe(41)` or equivalent that states the live writer's version becomes 42, including the
  helpers (`tests/helpers/p14c3-fixtures.ts:131`, `p14c3-genuine-evidence-fixtures.ts:17` and siblings). A literal that
  names a genuine historical capture keeps its number.
- **S3 future-version sentinels.** A save stamped 42 to prove an unknown version is refused now carries a valid
  version. The sentinel becomes 43; "unknown saveVersion 42" becomes 43; "versions 1 through 41 only" becomes 42.
- **S4 live-to-V40 chains and typed helpers.** `convertV41ToV40(live)` becomes `convertV41ToV40(convertV42ToV41(live))`.
  Frozen builders fed `convertV41ToV40(makeSave(state)).state` go through `convertV42ToV41` first. The 1319-T sites
  pass the projected envelope.
- **S5 migration comparisons.** Where a migrated V41-or-older genuine input is compared with the old state plus the
  known new roots, the expectation gains `sharedCompetitions: 0` on every relationship edge (`convertV41ToV42`), built
  from the old state by one generic helper beside `withRivalTermination`, never as literals.
- **S6 hand-built edges.** A relationship edge constructed in a test and fed to the live validator carries
  `sharedCompetitions` (0 unless its drivers include a competition).
- **S7 catalogue and shape pins.** The live driver catalogue is `RELATIONSHIP_DRIVER_KINDS` (seven kinds); the frozen
  one is `RELATIONSHIP_DRIVER_KINDS_V31` (five). A pin on the live edge key set or count includes `sharedCompetitions`.
- **S8 refusal messages.** Where a relationship tamper or refusal leaf now reaches `validateSaveV42`, the expected
  message names what that validator says for the tampered field (measured, cited by source line).
- **S9 the first downgrade guard for a live save.** A live save whose history includes a player greenlight from a
  completed casting session holds competitions; any downgrade meets `convertV42ToV41` first ("cannot downgrade or
  discard a casting competition"). An expected message names the measured first guard. Where the leaf's title names an
  older guard, its comment records that the competition guard masks it for such a save and names the test that still
  covers the older guard on its own era's genuine input, or records the reduction (the 1309-X3 ruling 2 form).
- **S10 natural-chain values.** A pinned value that moves because the new drivers changed relationship state on a
  natural chain (closeness, tier, digests) is re-derived from receipts on the chain, never copied from a run output.
  Before writing, the author pre-declares for each such pin the one assertion that may move and the receipt facts a
  lawful movement must show.

Out of scope: the 151 core and 33 UI failures retained at 1316/1317 and their clusters. A retained leaf that a Save42
pin now masks is moved past the pin so it again fails with its 1316 primary; nothing else in it changes.

## Deliverables and process

1. test-author stages `1320-stage/1320-save42-sweep.patch` (cumulative against HEAD), a classification JSON (file,
   line, old text, new text, class, measured cause or frame) and a handback. Checked with a temporary index
   (`GIT_INDEX_FILE`, `git apply --check --cached`); no worktree; nothing written in the repository outside
   `1320-stage/` and the handback. Scratch copies link `tests/fixtures`, `docs` and `node_modules` read-only instead of
   copying them (the volume ran out of space during 1309), and the author removes its own copies at the end.
2. The parent dry-runs each revision in scratch: three type gates, full core, UI.
3. Independent review (1320-D) of the final revision, parent application (1320-E), recorded broad core and UI gates,
   attribution against 1316/1317, review, closure (1319-K) of the Save42 increment.

Success: type gates clean; the broad core gate's failing identities equal 1316's 151 (same primaries, the 22 changed
rows restored); the UI gate's equal 1317's (or its C1-family timing rows); no new identity.

## UI measurement ([1320-M2](1320-M2-save42-ui-fallout-extract.txt))

UI project at the Save42 production: 42 failed, 2650 passed. Against 1317, 12 identities are new: 11 live-version
literals (S2) in `ui/src/saves.test.tsx`, `session.test.tsx`, `engine/d17-save-migration.test.ts`,
`engine/film-chronicle-adapter.test.ts`, `lot/snapshot/v14SetHolderBoundary.test.ts` and `screens/StudioCalendar.career`
(through a helper literal), and one `WorldFirstLotNativeNextEventApp` leaf at `:1929` ("Unable to find
`dashboard-releases-heading`") that the parent re-measures after the sweep before any change is made to it.
