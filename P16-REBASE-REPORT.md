P16 REBASE REPORT (Owner decision 3A)
=====================================

Branch p16-rebase-20261024, worktree ~/studio-scratch/p16-rebase-20261024-wt, base main 8792de52.
Candidate: current200 PATCH.diff, sha256 d59d331be952e608aa4da9f89f88d71212826adb62a1f54ebbaf0cd6c4e1a1c5
(verified before the apply; the file and K/p16 were only read).
State: the agent ran no tsc, vitest, vite-node, npm script or generator. The coordinator ran the lane
at 59ec1457 (lane-logs/wave3.log): typecheck 0, typecheck:bridge 0, both contract checks pass after
generation, UI 30 of 30, core 1,149 of 1,323 in 139 files. Section 10 records the follow-up commits;
they are unrun.

Commits on the branch, in order:
  b2d3d97e  P16: apply the current200 candidate onto main at 8792de52; conflicts resolved by the ledger's rules
  0863f80b  P16 C-01: absorbed work obeys the stabilized shared-occupancy law in every reader L-05 fixed
  96ea1da7  P16: the candidate's suites compile against the stabilized laws; the 12A witness reads the live save
  59ec1457  P16: rebase report (this file, first version)
  9c9b38d5 .. d691d07f  the follow-up after the first lane run (section 10); this correction follows them

Headline numbers
  200 candidate paths: 71 added, 129 modified (52 added test files, 61 modified test files, 87 source,
  helper and generated paths).
  190 paths applied or merged cleanly; 14 of those were three-way merged onto files main changed since
  the candidate's base 2c3024e2, and each was reviewed (section 2).
  10 paths conflicted; all 10 were resolved by a ledger rule or by keeping both sides (section 1).
  Static import check: 0 unresolved imports or missing exports across 1,255 tracked TypeScript files.
  Expected failures by static reading, by class (section 6): 16 tests in 5 files (C-03); 32 files that
  need captures outside the repository (31 candidate files, audit C-06, plus the new C-01 regression);
  39 Bridge files whose projection or registry pins predate projection 62 (C-02; 10 of them
  candidate-modified); 11 files that still treat Save48 as the live save. The classes overlap where a
  file belongs to two.


1. Conflicts and resolutions
----------------------------

git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks apply --3way --index PATCH.diff.
A plain --check fails at 13 paths (re-run on 2026-10-25 against 8792de52 in a scratch index; the first
version of this report said 14, which was wrong). The three-way merge left 10 conflicts; the other 3
merged without markers: physicalPlans.ts, technology.ts and LotNextEventRail.tsx.

generated/unity/project-studio-bridge.contract-manifest.json
  Rule (ledger): never hand-merge; regenerate. Kept main's file unchanged. The candidate's version
  named projection 61; main's names 58. Neither matches the merged source (PROJECTION_VERSION 62).
  Regenerate in the lane (section 5).

src/core/hollywoodValidation.ts (3 hunks)
  Rule (ledger, L-05 vs P16): production claim = closedWeekOf(b) === null and not cancelled by the
  absorption; writer claim = terminalWeek === null. Kept L-05's parameter name `claim` and its comment.
  The production claim is `claimsLiveWork(p)`: false for a closed business; for an absorbed business,
  true only for a production in continuedProductions and not in workCancellations, which is the exact
  set `buyerContinuedProductions` puts in the busy set. Written-off (stoppedProductions) and
  buyer-cancelled work claim nobody (audit C-01). The writer claim line from L-05
  (`if(terminalWeek===null)`) merged unchanged and now reads the candidate's terminalWeek
  (closure or absorption), so absorption-scripts/v2 stopped drafts claim nobody.
  The production rule (`claimsLiveWork`, hollywoodValidation.ts:324-325 at 59ec1457) is stricter than
  the ledger's literal rule. Read literally, "not cancelled by the absorption" keeps the claims of a
  written-off picture (stoppedProductions). The merge follows audit C-01 instead: the busy set released
  those people, so a write-off claims nobody. 2a78b372 adds Array.isArray guards there and in
  professionHistory.ts, so a malformed absorption record refuses by name.

src/core/save.ts (5 hunks, plus the ledger rule for the two era-independent helpers)
  The five conflicts were the V14-V18 WithPolicy signatures: kept both the candidate's "rights-p16"
  policy and the stabilization's threaded professionContext parameter.
  Rule (ledger): nonFiniteNumberTail and assertStudioEventSequenceLaw run first in whichever validator
  is live, and the frozen P15B validator keeps them. The candidate's live validator is validateSaveV49
  (the ledger called it validateSaveP16). validateSaveV49 now runs both over its unstripped state,
  rights root included, before its own root checks. The predecessor proof it calls
  (validateSaveP15BEra with rights=true) skips them, so the state is walked once; the frozen
  validateSaveP15B (rights=false) still runs them. Finding ids kept in the comments.
  Consequence: the live refusal prefix for those two laws is now "validateSaveV49:". The L-19/SAVE-07
  stabilization test pinned "^validateSaveP15B:"; its two prefixes moved to "^validateSaveV49:" with
  every assertion kept (tests/stabilization-l19-save07-persistence.test.ts).

tests/save.test.ts, tests/contracts/v14-boundary-guards.contract.test.ts, tests/p13b-s8-save-v27.test.ts
  Rule (ledger): drop the patch's literal sentinel hunks (49 -> 50); keep EXPECTED_LIVE_SAVE_VERSION.
  Done. tests/helpers/live-era.ts takes the patch's 48 -> 49 and validateSaveV49 as the live reader.
  Decision recorded: p13b-s8-save-v27 also carries two non-sentinel Save49 hunks (the V49 -> V48
  downgrade now refuses the rights root first; the old assertion runs on rightsStripped). Those are the
  era change itself, not the sentinel, so they are kept. save.test.ts and v14-boundary-guards now carry
  no candidate change.

src/core/campaignLegacy.ts (12A)
  No ledger rule. Both kept: 12A made v4 a modern definition (isModernDefinition); the candidate admits
  the Save49 estate phase table 3 only under the rights era. Merged rule: table > 2 refused outside the
  rights era; a modern definition (v3 or v4) must use table 2, or table 3 under the rights era.
  The refusal text changed (campaignLegacy.ts:1316): main's 'must use the actual-closure finale phase
  table 2' is now the candidate's 'must use an admitted actual-closure finale phase table'. No test pins
  either text.

src/core/studioClosure.ts (12A, 2 hunks)
  No ledger rule. Both kept: both import sets; the ended manifest stays campaign-legacy/v4 with 12A's
  C + 1 cut, and takes the candidate's phase table (3 under the rights era, else 2). The candidate
  changed P15_PHASE_ORDER_VERSION to 3, so the explicit argument is required.

src/core/tick.ts (5A)
  No ledger rule. Both kept: the candidate's continued-work advance (operatedAdvance) and the L-18
  comment on the arrived-week event sink. The admission call keeps events.at(currentTick + 1) from 5A.

ui/src/lot/snapshot/nextEvent.test.ts (15A)
  No ledger rule. Both kept: the L-37 "exact receipts beyond the founding stages" describe and the
  candidate's F40 summary-keys case.


2. Clean three-way merges onto stabilized files (reviewed, no edit)
--------------------------------------------------------------------

bridge/laboratory.ts: the 10A adopt-row and plan-companion rules are intact; the candidate adds only
  the "acquired through absorption" access label.
bridge/runtime-checkpoint.ts (20A): RETIRED_PROTOCOL_4_SCHEMA_IDS and its refusal intact; the candidate
  adds v58-v61 to the supported map, which changes its size and digest (section 6c).
bridge/session.ts: the follow-up-5 integer case order intact; the candidate adds the diligence and
  absorption quote families and reads buyerOperatedProductions for release intents.
src/core/actions.ts (L-01, L-04, 19A): requireWriterTermCoversDraft and the busyTalentIds greenlight
  gate intact. git placed the candidate's greenlight rights refusal before any write and its mint tail
  after recordCastingCompetition, which is the hand re-application 19A section 5 asked for.
src/core/employment.ts: the busy set reads terminalWeekOf and buyerOperatedProductions (candidate);
  the stabilization's additions intact.
src/core/physicalPlans.ts (14B): the refund-row admission of a demolished plan-built body intact; the
  candidate adds the absorption disposition leaf.
src/core/promises.ts, src/core/rivalResearch.ts, src/core/studioEvents.ts, src/core/technology.ts
  (9A, 10A, 5A): stabilization rules intact; the candidate's additions are absorption-specific.
ui/src/lot/LotNextEventRail.tsx (ledger rule for L-36): the Financing row and the corrected "Other
  cash" explanation kept; the four P16 rows (rights, estate purchases, acquisition, diligence) render
  beside them when the receipt carries them, so the rows still cover every summary key.
ui/src/lot/snapshot/nextEvent.ts (15A): the release-review target and lotStageIdentityFor intact; the
  candidate's four optional summary keys merged.
ui/src/lot/LotNextEventRail.test.tsx, tests/p15b-legacy-terminal-regression.test.ts: both sides kept
  (the regression keeps 12A's v4 pins and takes the candidate's validateSaveV49 reads).


3. C-01 disposition: one reader site WITNESSED, one PREDICTED, two STATIC-UNRUN (owed by the P16 lane)
-----------------------------------------------------------------------------------------------------

The stabilized shared-occupancy law (ledger Batch 2, L-04 and L-05): one availability set, and every
validator and occupancy reader treats work the busy set released as history. The candidate's busy set
already released an absorbed target's people (terminalWeekOf, buyerOperatedProductions). The rebase
makes the four L-05 readers follow it:

  hollywoodValidation.ts (apply commit): the claim rule in section 1.
  professionHistory.ts (C-01 commit): the straddle check, a validator, refused a natural profession
    change of a person exited from a written-off picture, so the world became unsaveable. An absorbed
    business is now frozen history from its absorption week on, like a closed one, and its
    buyer-continued uncancelled productions stay obligations. save.ts hands the Save49 era's
    absorptions to validateProfessionHistory through proveProfessionSave, because the predecessor
    chain sees the state without the rights root. The ">=" boundary is right for absorption:
    closeAbsorption is a player action at week W, and the lifecycle step of W ran in the tick that
    arrived at W, while the person was still seated.
  promises.ts (2 sites) and opportunityPromises.ts: rivals filtered by terminalWeekOf; the player's
    productions are buyerOperatedProductions. Inputs stay byte-identical in every world without an
    absorption. The continuedWork import is placed last in both files, so module evaluation order is
    unchanged (careerLifecycle already reaches continuedWork through employment).

Regression: tests/p16-rebase-c01-absorbed-claims.test.ts. It runs the candidate's own write-off route
(r04-pre162 capture, full disclosure, public ask, retain nobody, film 13 written off at 162). The
player then signs the written-off picture's lead from the hiring market, staffs one picture and
greenlights with them. The test asserts makeSave admits the seated world and every weekly save of a
52-week natural soak. On the candidate the seated save threw "simultaneous active assignments". It
needs P16_ORIGINAL48_CAPTURE_ROOT. Before calling C-01 FIXED, run it red on a throwaway tree of
b2d3d97e with claimsLiveWork reverted to the candidate's rule (section 9, step 5); K/p16 itself lacks
the stabilization staffing helper the test imports. The regression exercises the validator claim
rule; the profession-history rule has no natural witness yet (it needs an exited actor's profession
change after the write-off).
Lane result at 59ec1457: the file's 3 tests pass. The reviewer found them not red at b2d3d97e, because
claimsLiveWork landed in the apply commit, so the reader edits had no witness. 2a78b372 adds a differential
case: in the same world, promiseFeasibility for a directing draft and a genre-opportunity draft whose
beneficiaries are film 13's exited people equals the same call with r01's written-off picture removed.
Lane wave3d (c01-red.json, a throwaway tree of b2d3d97e): the differential case is RED there ("DIRECTING_COUNT:
expected {...} to deeply equal {...}", :147) and the other three pass. Lane wave3e: 4 of 4 green at c0a6c64e.
The case looped over both drafts with plain expect, so at b2d3d97e it stopped at the directing draft and the
genre-opportunity draft never ran there (round 5 reviewer). Round 5 splits them into two cases.

Per reader site (round 4 correction; the round-2 text over-claimed the differential's reach):
  promises.ts:346-347 promiseProductionOccupancy: WITNESSED (the directing draft, red at b2d3d97e, green at
    HEAD).
  opportunityPromises.ts:66-67 opportunityFeasibilityInputs, its owners(): PREDICTED until the coordinator's red
    rerun of the split genre-opportunity case. Isolation limit: that draft also reads promiseProductionOccupancy
    (promises.ts:554-559: the opportunity scope sets the directing scope), so a red there does not isolate owners().
  promises.ts:926-928 rivalUncappedPromiseCapacity: STATIC-UNRUN, no witness. promiseFeasibility never
    calls it; its only caller is retirementVoidsPromise (promises.ts:973).
  professionHistory.ts:297-314, the straddle check's absorbed-business rule: STATIC-UNRUN, no witness. A
    validator path; it needs an exited person's profession change after the write-off.
  hollywoodValidation.ts claimsLiveWork, the validator claim rule: green at HEAD through the three
    seated-world cases, which also pass at b2d3d97e (the rule is in the apply commit), so it has no red run.
The P16 lane owes witnesses for the two STATIC-UNRUN sites; round 4 writes none, as the brief directs.

Not done, with the reason:
  licence.ts activeProductionOn still counts terminal studios' frozen work (C-13 / P16-04). Sharing
  the rule there changes which estate lots are encumbered, which the estate suites pin; it belongs to
  the C-13 follow-up with its own test.
  The audit's second regression (an exited stopped-draft writer hired and commissioned) needs a world
  with absorption-scripts/v2 stopped drafts. The r04-pre162 route has none; the drafting171 captures
  do. The writer rule itself is the terminalWeek skip above.
  Forged overlap before absorption: an explicit P16 deferral. A forged save in which a person held two
    assignments in the weeks before an absorption, one of them on the picture the absorption later wrote
    off, passes the validator, because a written-off picture claims nobody. No producer writes that
    overlap (the busy set held the person until the write-off). This is L-05 optional 4 (overlaps that
    began before the terminal week) applied to absorbed businesses; the ledger defers it for closures,
    and P16 defers it for absorptions with it.


4. 19A section 5: NOT IMPLEMENTED (not small); the next step
-------------------------------------------------------------

Preserved after the apply: linkContinuationAtGreenlight (rights.ts:840), the linked-work skips in
advanceRightsWeek and authenticTitles, the validator's continuation title rule, and
refusal-before-write (greenlightRightsRefusal runs before any write in applyGreenlight).
The change list touches rights.ts in five places (recordGreenlightRights, linkContinuationRefusal,
the concept-belongs-to-parent rule in greenlightRightsRefusal and the mint hook, storyPropertyOfWork
with its validator rule, the R4 use split), licence.ts and the validator's law parameter. It also
needs RIGHTS_COUNTERPARTY_IDS, the R4 cases of tests/p16-r2-authority.test.ts (the case at :162) and
the RED witness tests/p16-continuation-link.test.ts, which the note says to write first. That is a
rights-law change with a new save-validator rule, so the rebase applied the patch faithfully and
leaves section 5 as the next increment. Today R4_USES is still ['television', 'merchandise'] and
storyPropertyOfWork does not exist.


5. What must be regenerated (the agent regenerated nothing)
------------------------------------------------------------

  npm run generate:bridge-contract
    Writes bridge/schema/project-studio-bridge.schema.json, generated/unity/StudioBridgeDtos.Generated.cs
    and generated/unity/project-studio-bridge.contract-manifest.json from source PROJECTION_VERSION 62.
    The tree holds the candidate's schema JSON and C# at 61 and main's manifest at 58.
  npm run check:bridge-contract
  npm run check:bridge-contract:fixtures
    If the fixtures check fails, npm run generate:bridge-contract:fixtures rewrites committed fixture
    outputs; that is the coordinator's call (the agent does not edit persisted fixtures).
  The C# DTOs need a native compile and a consumer-lock check against the Unity repository (C-02).
  Authority note: AGENTS.md says workflow work cannot start canonical-62 generation; HANDOFF's 3A row
  lists "regenerate the Bridge manifest". The coordinator confirms the 3A order covers this step.


6. The candidate's tests and the expected failures
---------------------------------------------------

Files: 52 added test files and 61 modified ones (two of those, save.test.ts and
v14-boundary-guards.contract.test.ts, now carry no candidate change). Two are UI tests
(ui/src/lot/LotNextEventRail.test.tsx, ui/src/lot/snapshot/nextEvent.test.ts); the rest run in the
core project, Bridge files included.

Compile: a static resolver checked every relative named import in all 1,255 tracked TypeScript files
and the new test: 0 unresolved modules, 0 missing exports. No candidate file imports the deleted 8A
kernel or a renamed stabilization helper, and the candidate already reads LIVE_SAVE_VERSION or
EXPECTED_LIVE_SAVE_VERSION for its live-version pins, so no candidate file needed a compile edit.
Type-level errors remain possible; `npm run typecheck` and `npm run typecheck:bridge` decide.

6a. C-03, 16 tests in 5 files (the audit's static reading; synthetic estate handoffs, injected STABLE
readers, the old conditionReadersUnbound expectation, "closing is deferred"):
  tests/p16c-estate.test.ts: the 6 cases at :61, :88, :111, :158, :202, :236
  tests/p16-r2-estate.test.ts: the 6 cases at :43, :68, :85, :99, :114, :126
  tests/p16-r2-authority.test.ts: :50, :83
  tests/p16-r2-validator.test.ts: :179
  tests/p16c-acquisition.test.ts: :177 (the assertion at :183)

6b. Captures outside the repository (C-06): these 32 files fail loud unless the lane exports the
bindings that A/p16-work-release61-generation-runner-r6/runner.sh sets:
  P16_ORIGINAL48_CAPTURE_ROOT=~/studio-scratch/1370-astra-takeover-20261012/p16-original48-closure-capture-r2-run
  P16_ORIGINAL48_R03_CAPTURE_ROOT=~/studio-scratch/1370-astra-takeover-20261012/p16-original48-r03-capture-r2-run
  P16_JOIN_PREC48_PATH=<closure root>/r04-pre162.save48.json  P16_JOIN_PREC48_SHA256=cd11f369558e09f1d65d8e848374ea028f4c5f666c168b5527e48c098cfdfb19
  P16_JOIN_CLOSED48_PATH=<closure root>/r04-actual163.save48.json  P16_JOIN_CLOSED48_SHA256=c17b7aa82bd09e6988867e149ed0266803d8e432cfcd8842d9c2aca1f7ace8ad
  (the agent checked the r04-pre162 hash against the pin.)
  ORIGINAL48 (21): bridge-p16-absorption-finance, bridge-p16-rights-parity, p16-absorption-active-run,
    p16-absorption-clean-target, p16-absorption-continued-production, p16-absorption-paid-production,
    p16-absorption-public-action, p16-continued-work-cancel, p16-continued-work-shooting4,
    p16-continued-work-shooting5-baseline, p16-continued-work-silent-early,
    p16-continued-work-silent-phases76, p16-estate-observed-migration, p16-finance-presentation,
    p16-healthy-drafting171-funded-baseline, p16-healthy-new-drafting171, p16-held-title-buyer-public,
    p16-held-title-seller, p16-initial-shooting5-writeoff, p16-rival-buyer-absorption163-baseline,
    p16-stopped-drafting171-refusals
  JOIN_PREC48 (8): bridge-p16-paid-reports, p16-estate-claim-boundaries, p16-estate-current49-rollback,
    p16-estate-d-ceremony, p16-estate-d-join-negative, p16-estate-join (also JOIN_CLOSED48),
    p16-quote-age, p16-rival-buyer-rights
  R03 (2): p16-estate-run-continuation, p16-r03-observed-migration
  New (1): p16-rebase-c01-absorbed-claims
  C-05 still applies: the R6 runner pins p16-absorption-continued-production at 443a8b3e..., which the
  candidate no longer matches, so R6 cannot admit this tree.

6c. C-02, projection and registry pins (39 files with tests/bridge.test.ts:167 SNAPSHOT_VERSION, which
the first version missed; source declares projection 62; moved in 53571456, section 10):
  34 files assert PROJECTION_VERSION or the schema $id at 58: bridge-operations-events,
    bridge-owner-ux-projection21-schema, bridge-p10a-w0-people-projection, bridge-p11-capital-contributors,
    bridge-p11-ready, bridge-p13b-r07-setup, bridge-p13b-s1b-seats, bridge-p13b-s2-labs,
    bridge-p13b-s3-plans, bridge-p13b-s4-office, bridge-p13b-s5-adoption, bridge-p13b-s6-cancellation,
    bridge-p13b-s7-disclosure, bridge-p13b-s8-rivals, bridge-p14a1-market, bridge-p14a1-release-busy-set,
    bridge-p14a2-market, bridge-p14a3-world, bridge-p14b1-promises, bridge-p14b10-relationship-labels,
    bridge-p14b2-trust, bridge-p14b3-promise-command, bridge-p14b4-runtime47-compatibility,
    bridge-p14b5-relationships, bridge-p14b7-promise-waiver, bridge-p14b8-waiver-surface,
    bridge-p14c2rm-runtime, bridge-p14c2s-scientist-runtime, bridge-p14c3-promise-digest-continuity,
    bridge-p14c3-runtime, bridge-p14p3-directing-promises, bridge-p14p4p5-opportunities,
    bridge-p14r2r3-prior55, bridge-r3n4-read-model-deltas
  bridge-schema: $id and PROJECTION_VERSION pinned at 59 (:84, :340).
  Supported-map pins that end at v57 or at size 46 (the candidate adds v58-v61): bridge-p14b4-runtime47
    (:225), bridge-p14b5 (:405, :455), bridge-p14b6-relationship-read-models (:799, :802), bridge-p14b8
    (:788), bridge-runtime-checkpoint (:982, lists v58 but not v59-v61).
  bridge-stabilization-l22-retired-projections "the highest registered projection (57)": the highest
    registered is now v61. Its pin must be read from the generated C# header of the commit that ships
    the identity (the test's own rule), so it moves with the canonical generation, not before.
  check:bridge-contract and check:bridge-contract:fixtures fail until section 5 runs.

6d. Tests that still treat Save48 as the live save (makeSave now always writes Save49; the candidate
did not update these files, except the last one):
  tests/p15b2-corporate-condition-save.test.ts (33 sites: validateSaveP15B(makeSave(...)),
    convertFromP15BSave(live), LIVE_SAVE_VERSION - 1 as the P15B predecessor)
  tests/p15b4-studio-closure-save.test.ts (16 sites)
  tests/p15b4-studio-closure.test.ts :436, :478
  tests/p15b-legacy-v3.test.ts :97, :102, :103, :113, :124
  tests/p15b-legacy-official-order.test.ts :23, :44
  tests/p15b-legacy-atomic.test.ts :69 (spies validateSaveP15B; the publisher now calls validateSaveV49)
  tests/p14c2s-scientist-retirement.test.ts :290, :293 and tests/p15a2-power-ranking-archive.test.ts :939
    (expect "migrateToV48: ... corporateCondition"; the V49 -> V48 step now refuses the rights root first)
  tests/p15b-legacy-terminal-regression.test.ts :180-183 (candidate-modified; the two-closure spy is
    still on validateSaveP15B)
  tests/p14c3-cohort-transition.test.ts :297 and tests/p14c3-dual-extensions.test.ts :190 (expect the
    P15B step's composed refusal; the V49 -> V48 step refuses first). The first version missed these two.
  The candidate's own pattern fixes them: validateLiveSave for "the live save", and rightsStripped (or
  convertV49ToV48's named refusal) for downgrade assertions, as p13b-s8-save-v27 does.

6e. Recorded elsewhere and carried, not new: the audit's still-open candidate items (held-title-buyer-public
5,676 ms, p13b-s5 mid-deployment 10,051 ms, four p14b5-relationships failures, 13 Bridge consumer
timings) and main's recorded baseline in lane-logs.


7. Stabilization tests the rebase touched
------------------------------------------

  tests/stabilization-l19-save07-persistence.test.ts: prefix "validateSaveP15B" -> the live reader's
    name (apply commit; 2a78b372 derives it from validateLiveSave.name and adds the frozen-copy case:
    validateSaveP15B(rightsStripped(save)) with a forged seq row still refuses "^validateSaveP15B:
    state.studioEvents...", so deleting the `if (!rights)` block in save.ts fails a test).
  tests/stabilization-l35-legacy-manifest-week.test.ts :116: validateSaveP15B(makeSave(...)) ->
    validateLiveSave (third commit; it refused every Save49 envelope by version).
  tests/bridge-stabilization-l22-retired-projections.test.ts: HIGHEST_REGISTERED -> projection 61's identity
    (53571456, projection 62).
  tests/bridge-stabilization-l24-quote-contract.test.ts: 53571456 (18A) turned the overflow case into the accepted
    wide-cash quote, which removed the only witness of the session's quote-contract guard (session.ts
    mintQuoteResponse: SCHEMA_MISMATCH "quote response violates the published contract", nothing registered,
    the session continues). That was a weakening, found by the round-2 reviewer. Round 4 restores the witness
    with a forced out-of-range `cost` (2**31 through a spy on placementQuoteSnapshot) and checks the widened cash
    on all four quote snapshots.
  No other stabilization test or law was removed, skipped or weakened; no budget changed.


8. Not done, and why
--------------------

  19A section 5 (section 4). Canonical generation and every C-02 pin (sections 5, 6c).
  The 9 files of 6d: test design work in the candidate's legacy suites, not a merge rule; named with
    the fix.
  C-08 (default retention reads only a person's first production), C-10, C-11, C-12, C-13, C-14 and
    7A (managed-mode feasibility, scheduled "inside P16"): outside this brief.
  L-18's allow-list (tests/stabilization-l18-tick-row-weeks.test.ts) names no P16 producer. The
    absorbed-run revenue rows carry t, consistent with the rule; estate sales in the tick tail carry
    t + 1 and are not listed. That walk has no industry, so it cannot catch either; classify them when
    an industry walk exists.
  L-36's sum (tests/stabilization-l36-period-summary.test.ts) omits the four P16 buckets; they are zero
    there, so it passes; extend it when a rights row is in a summary window.
  No tsc, vitest or generator run, by the brief. Nothing pushed; HANDOFF.md untouched.


9. Lane commands for the coordinator (in this worktree, through the sole lane)
-------------------------------------------------------------------------------

  1. npm run typecheck
  2. npm run typecheck:bridge
  3. npm run generate:bridge-contract, then npm run check:bridge-contract and
     npm run check:bridge-contract:fixtures (section 5; commit the generated files separately)
  4. With the four capture bindings of 6b exported:
     npx vitest run --project core <the 111 core test files in the candidate's path list, plus
       tests/p16-rebase-c01-absorbed-claims.test.ts, tests/stabilization-l19-save07-persistence.test.ts,
       tests/stabilization-l35-legacy-manifest-week.test.ts and the nine files of 6d>
     npx vitest run --project ui ui/src/lot/LotNextEventRail.test.tsx ui/src/lot/snapshot/nextEvent.test.ts
  5. The C-01 red run: tests/p16-rebase-c01-absorbed-claims.test.ts on a throwaway tree of b2d3d97e
     with the claimsLiveWork call reverted to the candidate's rule
     (verifyParticipants(p,true,!(absorptionOf(b.studioId)?.workCancellations.some(c=>c.productionId===p.id)??false)));
     expect the seated save to throw "simultaneous active assignments"; expect it green from 0863f80b on.
  6. Then the audit's C-04 gate: test:core, test:bridge and test:ui on this tree at unchanged budgets,
     compared with main's recorded baseline.


10. Follow-up after the first lane run (59ec1457), unrun
--------------------------------------------------------

  9c9b38d5  P16: regenerated Bridge contract for projection 62 (the coordinator's generator output)
  2a78b372  C-01 follow-up: the differential reader witness (section 3), the L-19 frozen-copy case and
            the name-derived prefix (section 7), the Array.isArray guards (section 1)
  a38b35b8  Save48 assumed live: 21 expected lifts lacked estateSaleProceeds (P16_RIVAL_MONEY_KINDS has
            four); the P15B root-validator suites read validateLiveSave; the P15B step's own downgrade
            runs on rightsStripped(save); the closure root validator receives the state's era; the
            finalizer spies follow the live reader; p14d2's down/up control climbs back through
            convertV48ToV49. A ticked or closed P16 world has no Save48 envelope, so its downgrade
            expectations moved to the live step's named refusal.
  5cea24ae  First refusal moved: p14b9 keeps its Save44 guard (its world never ticks, so it projects);
            the candidate's live-step line ran before `newSave` was declared (TDZ) and now follows it.
            The rest assert the live step by name plus the projection's own refusal, because the world's
            P15 history carries table 3 (nondefault market rows, current phase history) or a closure
            opened an estate: p13b-s8-save-v27, p14c2b-save-v36, p14c2rm-writer-continuation,
            p14p3-directing-promises, p14c3-profession-history, p14c3-dual-extensions,
            p14c2s-scientist-retirement, p14c3-cohort-transition.
  53571456  Projection 62 + 18A: cashBefore/cashAfter of the casting, placement, set-commission and
            contract quote snapshots are number(); every projection and registry pin moved (6c); the
            L-24 witness asserts the wide-cash quote is accepted and registered. The F10/F11 declaration
            hashes and bridge-p14b5's running SCHEMA_ID literal wait for the regenerated identity and an
            independent producer measurement, by those tests' own rule.
  d691d07f  C-03: p15a2 reads the live phase table 3 and keeps the archive's downgrade guard on the
            committed week-53 capture and its Save48 predecessor; p15b4-pending-rival-work hands the
            validator its era; p16c-acquisition :183 asserts the implemented close guards.

Candidate defects left unchanged (the test states the candidate's own rule; the code breaks it):
  Synthetic estate handoffs (p16-r2-estate 6, p16c-estate 6, p16-r2-authority 2, p16-r2-validator 1):
    estateHandoffFor builds a handoff for a studio that never closed; estate.ts closureAuthorityRefusal
    answers 'actualClosureMissing' first. Audit C-03's fix: rebuild them on the real r04 pre162 -> C163
    closure, as p16-estate-join does, or retire them with a recorded supersession.
  Fractional absorption ask (p16c-acquisition :91, :202, :238; p16-r2-acquisition :72, :176):
    acquisition.ts takes postExitCash = account cash - the sum of terminationCost, both doubles (r03
    holds 11,588,432.0095 at week 53; weeklySalary is annual / 52), so the ask is fractional and the
    named refusal 'considerationBelowAsk:<ask>' fails the tests' whole-dollar pattern (r2 F33, "money is
    whole dollars"). The fix needs a rounding ruling, for example the floor the willingness test uses.
  Condition readers captured in a module cycle (p16b-condition-readers :67): rightsFinance.ts freezes
    { conditionRecord, outstandingLoan } at module evaluation; on the path acquisition ->
    corporateConditionLive -> ... -> estate -> rightsFinance, rightsFinance evaluates first and captures
    undefined. The order is the same at b2d3d97e, so the rebase did not cause it. Wrapping both in arrow
    functions removes the capture.
  p16-healthy-drafting171-funded-baseline :120: absorbedWork.ts:30 refuses the reloaded state
    ('missing-participant cancellation differs from actual coupled retention') although closeAbsorption's
    own makeSave admitted it in memory. Not diagnosed statically; a run printing both participant lists
    decides it.

Round 3 (after lane wave3b on ac3ab27c and the regenerated contract 839bb7c5), unrun:
  Lane wave3b: typecheck 0, typecheck:bridge 0, generate 0, both contract checks 0, UI 30 of 30, core 238
  files with 2,226 passing and 91 failing: 60 recorded main baseline, 31 new (2 pins, 2 load timeouts,
  1 sparse-checkout ENOENT the coordinator fixed, 4 era-class cases, 22 candidate-own).
  c7039311  Pins from the independent projection 62 measurement (lane wave3c on 839bb7c5,
            lane-logs/p62-declaration-measurement.json; producer
            docs/engineering/audits/2026-10-22-codebase-review/p62-declaration-measurement.ts, committed):
            bridge-contract-generator F10/F11 -> 2667c096... (473,437 bytes; eight positives rendered twice,
            six fixed bodies unchanged); its whole-schema identity and bridge-p14b5's running SCHEMA_ID ->
            the manifest schemaId sha256:2b94e6df.... The header line does not read projectionVersion, so
            the generator call keeps its 59. No other live-identity pin exists; the OUTGOING_58-61
            constants are history and stay.
  3ba586cb  The four era-class cases: p14p4p5-opportunities Q07 pins the projection's nondefault-market
            refusal after the live-step line; p15a1 K1/K2 compare live post-tick states with Save44 engine
            pins, so they need the Save45 projection, which refuses by name (K1 nondefault market, K2 phase
            history); RED 16 asserts the live rights-root refusal at the step and every older migrator.
            No committed Save45 capture holds a shared-market assessment, so the V45 market guard has no
            witness left (the round-2 comments in p14p3 that named p15a1 as its witness are corrected).
  73a7feca  p16b-condition-readers: rightsFinance.ts's default readers are getters over the live bindings,
            because the module evaluates inside the import cycle corporateConditionLive -> employment ->
            ... -> studioClosure -> estate -> rightsFinance. Getters, not arrow wrappers:
            p16b-live-condition-readers.test.ts:33-34 pin the identity of the two functions.
  drafting171 (no commit): the rebase did not cause it. Diagnosis in the defect list below.
  Load timeouts (not code): bridge-runtime-checkpoint-prepared-reuse passes 21 of 21 in a two-file run beside
  bridge-p13b-s7-disclosure (wave3c-alone.json, 42 of 43 overall; corrected in round 5, it was not alone; the
  20 s case took 15.1 s); bridge-p13b-s7-disclosure item 5 took 31.3 s against its 30 s budget in that run and
  is being measured alone at main and on this tree. No budget changed.

Candidate-own defects left red for the P16 lane (audit C-03):
  1. Synthetic estate handoffs, 15 cases: p16-r2-estate.test.ts :46, :72, :88, :102, :117, :130;
     p16c-estate.test.ts :63, :91, :113, :159, :203, :238; p16-r2-authority.test.ts :59, :90;
     p16-r2-validator.test.ts :183. Rule broken: estate.ts closureAuthorityRefusal (called first in
     estateHandoffRefusal) requires an actual closure record that the handoff joins; the tests hand in
     estateHandoffFor handoffs for an r03 that never closed. Fix owed: rebuild them on the real r04
     pre162 -> C163 closure, as p16-estate-join does, or retire them with a recorded supersession. They
     hold the only licence-survives-the-estate and estate-buys-no-people tests, so Owner rulings 5.1 and
     5.3 have no reachable coverage until then. No new Owner ruling needed.
  2. Fractional absorption ask, 5 cases: p16c-acquisition.test.ts :91, :207, :243;
     p16-r2-acquisition.test.ts :72, :176. Rule broken: r2 F33, "money is whole dollars". acquisition.ts
     quoteAbsorption takes postExitCash = account cash - the sum of terminationCost, both doubles (r03
     holds 11,588,432.0095 at week 53; weeklySalary is annual / 52), so absorptionAsk is fractional and
     the named refusal 'considerationBelowAsk:<ask>' fails the tests' whole-dollar pattern. Fix owed: a
     whole-dollar post-exit cash. NEEDS AN OWNER RULING on the rounding (floor, truncate or round, and
     the direction for negative post-exit cash); the willingness test uses floor and the disclosure
     records Math.trunc.
  3. Order-sensitive write-off check, 1 case: p16-healthy-drafting171-funded-baseline.test.ts:120.
     Rule broken: a save must survive its own export. absorbedWork.ts:29-30 compares the stored
     missingParticipants with people.filter(...) by join(), where people (:25) ends with
     Object.values(production.cast). quoteAbsorption (acquisition.ts:320) writes the list in the cast's
     insertion order (lead, antagonist, support, hollywoodTick.ts:260). film:12 starts at week 170, after
     the r04-actual163 capture loads, so in memory its cast keys keep that order and closeAbsorption's own
     makeSave admits the state. exportCurrentState is stableStringify(makeSave(...)), which sorts the keys
     to antagonist, lead, support, so importSave recomputes the list in another order and refuses.
     Fix owed: compare as sets, or derive both lists from the fixed seat order instead of Object.values.
     No Owner ruling needed.
  4. (round 6, FIXED in src, not left red) V27-era rival finance roster: hollywood.ts newFinancePeriod's
     research-v27 filter (:43-46) kept the four P16 rights kinds the candidate appended to RIVAL_MONEY_KINDS (:30),
     so the explicit pre-recovery admission (rivalResearch.ts admitRivalPlans) opened a V27 period with 18 kinds
     (p13b-s8-old-era-period :88). The filter now drops them, beside termination, demolition and the loan kinds.
  P16 lane note (round 6, not a defect): the rights root records, for a rival film's materialized property, whether
     the film was announced: authenticTitles (rights.ts:456) gives the virtual property the provenance ref
     'announcement:<filmId>', and materializeLegacyTitles (:746-748) writes that source into the persisted genesis
     title event. It names an already persisted filmAnnounced receipt, so it adds no announcement record and does not
     conflict with 1363 S7, whose law is that the technology announcement stays derived (p13b-s7-announcements now
     pins that law as a key walk).
  Coverage gaps to close with them: the V45 market guard on a recorded assessment (a genuine Save45
  capture with assessments, or a ruled projection for table-3 market rows; audit C-06), and the L-24
  emission SCHEMA_MISMATCH path, which no quote can reach after 18A (round 4 gives it a forced witness).
  ACCEPTANCE OPEN since 3ba586cb (round 5 reviewer): p15a1 K1's diff confinement (every difference from the
  Save44 engine pin inside the pressured chain) and K2's byte identity with its pin. Both need the Save45
  projection of a live post-tick state, which refuses by name in a P16 world. The sibling cases check which
  releases are pressured (K1) and P = 0, f = 1 (K2), not these laws; the 3ba586cb comments and commit message
  said otherwise. Round 5 restores K1's seven named-fact equalities on the live state (PREDICTED).

Round 4 (the round-2 reviewer's blockers and optional items; lane wave3e on c0a6c64e), unrun:
  Lane wave3e: typecheck 0, typecheck:bridge 0, both contract checks 0; 18 files, 211 of 240 passing; the 29
  failing are 7 recorded baseline in 2 files and 22 new: 21 candidate-own (the 15 estate handoffs, the 5
  fractional-ask cases, drafting171) and 1 load timeout. bridge-contract-generator, bridge-p14b5 :410,
  p14p4p5-opportunities, p15a1 and both p16b suites pass. The C-01 witness is 4 of 4 green at HEAD; its
  differential case is red at b2d3d97e (lane wave3d, c01-red.json, :147).
  77e1e9b8  Blocker 1, the P15B step's own downgrade laws. The reviewer's route (advance the never-ticked
            base's rights-less Save48 copy) is unavailable: the live tick needs a rights root
            (rightsTick.ts refuses an industry without one). Two Save48 controls instead (round 5: the
            week-133 world is a real Save48 envelope built by the public downgrade; genuineFrozen48 is
            constructed, admitted by validateSaveP15B, not lawful gameplay evidence):
            - week 133 on the natural week-130 route: condition records, no condition event (the first
              warning can fire at 134: CORPORATE_WARN_SUSTAIN_WEEKS 4 from the first evaluation at 131), no
              title (lane wave3 measured none through 135), no table-3 row. Its public downgrade passes the
              live step and the P15B step refuses by name.
            - genuineFrozen48 (p15b-legacy-v3): the migrated, never-ticked 6240 capture frozen by the
              predecessor-era Legacy writer after p15b-legacy-v3.test.ts:19 sets campaignLegacy.recordedFromWeek
              to 0 (constructed, admitted by validateSaveP15B).
            Asserted again on those controls:
              'cannot downgrade or discard a corporateCondition record (N evaluated)': p15b2
                condition-root-downgrade (:113-114) and (c) (:167-169), p15a2 rank-root-downgrade (:945).
              The composition rule, this step's reason first and the older steps' appended, never masked:
                the condition record with R8's 'recovery authority: costCutting.since,
                facilityDemolitionRefund, facilityDisposed' (p15b2 (c), p15a2 at 133, exact), and the modern
                Legacy v3 reason with the shared P15 step's 'the frozen 2040 Legacy' (p15b-legacy-v3, exact),
                each at the step and through migrateToV47, migrateToV46 and migrateToV45.
              'cannot downgrade or discard modern Legacy v3 official authority': p15b-legacy-v3 :142-144.
            ACCEPTANCE OPEN (unasserted), by name, with the reason in each file. The obstacle (round 5
            wording): tick.ts:1254 calls advanceRightsWeek on every tick and rightsTick.ts:23 throws for an
            industry with no rights root, so no Save48 state can be advanced; a ticked Save48 control can only
            be a rights-era world taken before its first table-3 row, and the writers stamp
            `Object.hasOwn(state, 'rights') ? 3 : 2`, so table 3 holds for every rights-era row.
              'cannot downgrade or discard a corporateCondition event', 'a studio loan', 'a loan or claim
                ledger row' and 'the <kind> movement of <studio>': a rights-era event is table 3, and a loan
                needs warning or distress after the sustain law's low weeks, so an event precedes it (p15b2).
              'cannot downgrade or discard an actual studio closure', 'a closure claim', 'an estate event':
                a rights-era closure opens a closure49 estate (p15b4-studio-closure-save, terminal-regression).
              'cannot downgrade or discard the ended Legacy manifest': only a player closure publishes it
                (p15b-legacy-v3, terminal-regression).
              No control combines two or more of the P15B step's own reasons (its order: condition, closure,
                Legacy, movements, ledger); each control above carries one own reason plus older steps'.
              Round 5 pins the per-root reason strings and their join order through the exported
                corporateConditionDowngradeRefusal and studioClosureDowngradeRefusal (p15b2): the strings,
                not the step.
              The world-specific composed refusals of p14c2s, p14c3-cohort, p14c3-dual-extensions and
                terminal6240: those worlds hold estates or table-3 loans; the same composition law runs on
                the controls above.
            p15b4-studio-closure-save :56-64 pins ESTATE_OBSERVATION_REFUSAL (with the closure49 premise)
            instead of the 'closure' substring, which matched "current closure provenance".
  0dbdd2df  Blocker 2: tests/bridge-stabilization-l24-quote-contract.test.ts gains the rejection witness for
            session.ts mintQuoteResponse (placementQuoteSnapshot forced to cost 2**31): SCHEMA_MISMATCH, the
            declared-bound message, unchanged revision and pendingQuotes, the repeat call, a lawful session
            registering. The acceptance case checks the widened cash on all four quote snapshots. Section 7
            lists l22 and l24 and records the l24 weakening.
  6795c44a  Blocker 3: section 3 rewritten. WITNESSED: promises.ts:346-347; opportunityPromises.ts:66-67 was
            listed WITNESSED here, corrected to PREDICTED in round 5.
            STATIC-UNRUN, no witness, owed by the P16 lane: promises.ts:926-928 (rivalUncappedPromiseCapacity)
            and professionHistory.ts:297-314. claimsLiveWork: green at HEAD, no red run.
  097f0f7d  Optional, the cheap ones:
            O1 done: p16DowngradeRefusal names table-3 history last, "cannot downgrade or discard current phase
              history (<root>)" (save.ts currentPhaseHistoryRoot, P15B_SEQUENCED_ROOTS order); p15a2 :955 pins
              (corporateCondition). A source change in the candidate's own step, made to keep its "refuses once,
              by name" promise; every Save48 reader already refused these rows, so no admitted downgrade changes.
            O2 done: one strict LIVE_DOWNGRADE_REFUSAL (RIGHTS_ROOT_REFUSAL or PHASE_HISTORY_REFUSAL). The branch
              is not pinned for p15b2's borrowed world or p14c3-profession-history :125: those cases pass, so
              the lane logged no message. Pinning needs one logged run.
            O4 done: stabilization-l19's NaN mirror on the Save48 copy (validateSaveP15B's non-finite walk).
            O6 done: technology.ts refuses a non-array continuedProductions by name, with a unit case;
              hollywoodValidation.ts:497 is already guarded by :324 in the same loop iteration.
  Recorded, not done:
    O9: phase table 2 is no longer asserted unchanged on the live tree (p15a2 p15-phase-table-v1 pins table 3);
      no case refuses table 3 on a predecessor-era archive row (powerRankingArchive.ts:263); p16c-acquisition
      :183 pins ABSORPTION_CLOSING_PREREQUISITES from the source, and the three old prerequisites have no witness.
    O7: the C-01 differential compares against an unlawful world (r01's written-off picture removed by hand),
      and its continuedProductions is [], so the buyerOperatedProductions half of the rule is unseen.
    O8: projection 60's identity (8bf35013...) exists only in the candidate's registry; it awaits the open
      audit decision on identities 59-61.
  Performance (owed to the P16 lane): bridge-p13b-s7-disclosure item 5, "identical in a Save As world", takes
    9.7 s alone at main and 24.3 s alone on this tree (lane s7-parent.json, s7-wt.json; file totals 45.1 s and
    66.6 s; budget 30 s, unchanged). A P16 performance regression on the Save As path.
  Attribution of the candidate-own reds (reviewer check 7):
    Synthetic estate handoffs: the candidate's. tests/helpers/p16-fixtures.ts:250-263 invents
      closure-<studio>-<week> with no closure record.
    Fractional absorption ask: likely the candidate's, not proven.
    drafting171: the key-order diagnosis above matches the reviewer's reading (absorbedWork.ts vs
      participantsOf; stableStringify identical at both bases).
    p16b-condition-readers: fixed in 73a7feca; attribution not proven.

Round 5 (the third reviewer's blockers and optional items; lane wave3g on 07e6c669; edited in the second
sparse worktree, branch p16-rebase-20261024-r5), unrun:
  Lane wave3g: static gates 0; 29 files, 380 of 408 passing; the 28 failing are 5 recorded baseline and 23 new:
  21 candidate-own and 2 load timeouts. Every round-4 target is green; L-24 is 8 of 8 alone
  (wave3g-l24-alone.json). The round-4 week-133 and genuineFrozen48 predictions held.
  4a3d27f5  Blocker 1: tests/p16-rebase-c01-absorbed-claims.test.ts :148 and :155 run the directing and the
            genre-opportunity drafts as separate cases (the shared loop stopped at the first draft, so at
            b2d3d97e the opportunity draft never ran). promises.ts:346-347 WITNESSED (red at b2d3d97e, green at
            HEAD). opportunityPromises.ts:66-67 PREDICTED until the coordinator's red rerun; isolation limit:
            the opportunity draft also reads promiseProductionOccupancy (promises.ts:554-559). Sections 3 and 10
            relabelled.
  0349df40  Blocker 2: p15a2 rank-root-downgrade :961-967 forges the envelope convertV49ToV48 used to build
            (rights and P16_RIVAL_MONEY_KINDS dropped, saveVersion 48) and pins validateSaveV48's exact
            "validateSaveP15B: corporateCondition estate phase table is not admitted in this predecessor era":
            corporateConditionLive.ts:422 WITNESSED again (PREDICTED until the lane runs it; lane wave3b and
            wave3e measured the same text through the old path; the coordinator's mutant red will confirm).
            Unwitnessed since 097f0f7d (the week-135 world holds no such row): corporateConditionLive.ts:518
            (loans), marketIntegration.ts:181, powerRankingArchive.ts:263, campaignLegacy.ts:1315,
            studioClosure.ts:692 and :729.
  825d0f0b  Blocker 3: p15a1 K1 :446-468 and K2 :483: titles and comments say ACCEPTANCE OPEN for K1's diff
            confinement and K2's byte identity (coverage gaps above); K1's seven named-fact equalities
            (:457-463) compare keepKeys(detached(post), pins.k1.keys) with the pin, PREDICTED; the pin's byte
            and SHA-256 check stays.
  f1d158ae  Optional:
            O2 done: the phase-history check sits in convertV49ToV48 only (save.ts:11936); the frozen builders
              reach the P15B step's composed reasons again on a title-free ticked world.
            O1 done: p15b2 :118-119 pin the exact composed refusal (recordedRefusal, :69).
            O3/O5 done: the ACCEPTANCE OPEN notes (p15b2 :120-127, p15b4-studio-closure-save :56-61,
              p15b-legacy-v3 :117-122, round-4 record above) state the real obstacle and that no control
              combines two of the step's own reasons. p15b2 :316 pins the per-root reason strings and join
              order (strings, not the step).
            O4 done: genuineFrozen48 is "constructed, admitted by validateSaveP15B" in the round-4 record.
            O6 done, with the answer: the rights validator does not reject first. validateSaveP15BEra
              (save.ts:11908) runs before validateRightsRoot (:11909), whose own loop reads record.id unguarded
              (rights.ts:1068-1069). The era map (save.ts:11645) admits records only; the row guards are
              hollywoodValidation.ts:326-327 (covering :497 in the same iteration), technology.ts:892-893 and
              professionHistory.ts:302. Unit cases: p16-rebase-c01-absorbed-claims :176 (a null row through
              validateTechnology) and :185 (a null record through validateSaveV49 on a world with no industry,
              named "validateSaveV49: rights cannot hold records without an industry"). Still unguarded
              against a null record on an industry world: rights.ts:1068-1069 and the direct readers of
              rights.absorptions (operatingState.ts:17, continuedWork.ts:15, :22, firstTakeSubjects.ts:22 and
              others); owed by the P16 lane.
            O7 done: L-24 :108 pins $.quote.cost.
            O8 done: the round-3 load line now says the prepared-reuse run was a two-file run beside s7.
  The reviewer's verdicts that stand: the 73a7feca identity law holds; O1's coverage is total; the week-133
  world is a real Save48 envelope; the composition rule is exercised at two depths; the projection 62 pins
  equal the measurement; no budget, persisted fixture or history was touched.

Round 6 (the full gate wave3f on 07e6c669: 21 non-candidate failures in 16 files; edited in the side worktree,
branch p16-rebase-20261024-r5 from 72036a93), unrun:
  Gate: every static gate green; UI 0 new; bridge 2 new (the recorded load timeouts); core 5948 tests, 149 failed,
  106 recorded baseline by name, 43 new: 2 load timeouts, 3 sparse ENOENT, 21 candidate-own (recorded), 17 era-class
  and pin failures, plus 4 hidden ones found by the message comparison with final-core.json.
  98d8fbb2  C, Save48-assumed-live pins: p1364-late-founding :1051 (P15B step = FOUNDING_STEP + 1, live =
            EXPECTED_LIVE_SAVE_VERSION), :1074 (convertV49ToV48 then convertV48ToV47; the week-0 world converts
            losslessly at the P16 step: no title, instrument, rights money or ledger row, unchanged cutover anchors,
            no table-3 row), p15b2-corporate-condition-live :75 (P15B = FOUNDING + 1, live = 49).
  898b3e96  F, facility-move-demolish law 19 :882-893: the forged V11 envelope also strips the rights root, after
            asserting it equals initialRightsRoot(0). The unknown field was "rights" (chai truncated it; Save49 adds no
            other top-level root, and this world has no industry, so no P16 money kind).
  779440a9, 7d50aa7b  E, p13b-s7-announcements :138: a key walk (no key starting "announcement") replaces the text
            match; every string value starting "announcement" must sit at state.rights.titleEvents[n].source.ref
            (PREDICTED path). The follow-up narrows the key test to the old regex's reach (ageAtAnnouncement is a
            persisted retirement field).
  9ff07f1a  D, candidate-own FIXED (C-03 item 4 above): hollywood.ts:43-46.
  eacb7869  G, the three p15b4 pending-family cases: refusePure (tests/helpers/p15b-pending-family-assertions.ts:15-18)
            passes {rightsEstate: Object.hasOwn(s, 'rights')}. The check that fired first was studioClosure.ts:729,
            "closure <id> uses current estate phase table below its era", under the default predecessor policy; the
            disposition law ('no disposition for live subject adoption:/proposal:') is reached again. removeAndRedigest
            drops no P16 field.
  09c2bc56  B, table-3 history: the helper stays strict (table 3 inserts p16.estateSale at ordinal 2; relabelling
            rewrites every later ordinal, the finale's 6 to 5, which no root proves neutral). p14c3-transitions
            A05/A06 :183: LIVE_DOWNGRADE_REFUSAL and PHASE_HISTORY_PROJECTION asserted; ACCEPTANCE OPEN on this world:
            convertV45ToV44's recorded Power Ranking quarter refusal (p15a2 keeps its genuine witness). p15c2
            legacy-root-downgrade and legacy-old-law-fixture-v1-validates-after-retune: historicalV2FrozenControl is
            rebuilt in the predecessor era (genuineFrozen48 pattern: rightsStripped genuine 6240, frozen at table 2,
            admitted by validateSaveP15B and predecessorSave, lifted by convertV48ToV49, admitted by makeSave); both
            cases keep their laws (PREDICTED; legacy-root-downgrade had a 120 s budget issue at the stabilized main).
  8074719c  H, p15c2 legacy-validate-stamp :1035: the forgery moves to P15_PHASE_ORDER_VERSION + 1 (refused at
            campaignLegacy.ts:1316). ACCEPTANCE OPEN: a stamp-versus-era rule (a table-3 official only in a world that
            recorded under table 3): the root admits 2 and 3 under the rights era, because a Save48 freeze lifted by
            convertV48ToV49 keeps table 2.
  68dfe1d3  I, hidden regressions: bridge-p14b2-trust :151 adds requestDueDiligence and absorbStudio (from
            intent-schema.ts; inside the measured projection-62 schema identity); bridge-p14p4p5-opportunities :535
            pins 49 prior pairs and digest 0ce03cea... (Python, the test's documented method, which reproduces the
            old 66ff414a... from main's map); p15c2 :684 pins P15_PHASE_ORDER_VERSION with a rights-era premise.
  fef0bdd3  A, nondefault table-3 market history. ACCEPTANCE OPEN, by name:
              p1364-late-founding :782: Save46's 'employment start lacks its actual player signing payment' on the
                injected week-30 second grant (the live-reader refusals before it stay).
              p1364-late-founding :1123: convertV47ToV46's fund refusal with the P15 quarter appended.
              p14c3-offmenu-extensions :236 (both cases): R8's recovery refusal on this world (projected witness in
                p14c3-transitions' Scientist case).
              p14d1-rival-shelving :584: K4's historical equality with the genuine Save44 week-77 input (the K4
                premises, the receipts equality and the shelving probe now read the live state).
              p14r3-save-v41 :389: the P15 step's market-then-ranking composition.
            Each case asserts the live step's LIVE_DOWNGRADE_REFUSAL and/or NONDEFAULT_MARKET_PROJECTION. On the
            question asked: the sharedMarket slot is ordinal 1 in tables 2 and 3, so a stamp relabel of a nondefault
            market row is ordinal-neutral, but whether its content is what the predecessor engine wrote is not
            provable from the root; widening rightsStripped beyond the default class needs a ruling (audit C-06).
  Mechanical self-check: no skip or only, no budget or timeout change, no fixture file; expect( lines +35 / -35 over
  12 test files. The removals are the assertions that needed a Save45 or Save46 operand (p1364 :782 block, p14d1 K4
  operand checks and its dead saveVersion-45 branch), each recorded ACCEPTANCE OPEN above.
