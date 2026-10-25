P16 REBASE REPORT (Owner decision 3A)
=====================================

Branch p16-rebase-20261024, worktree ~/studio-scratch/p16-rebase-20261024-wt, base main 8792de52.
Candidate: current200 PATCH.diff, sha256 d59d331be952e608aa4da9f89f88d71212826adb62a1f54ebbaf0cd6c4e1a1c5
(verified before the apply; the file and K/p16 were only read).
State: STATIC-UNRUN. The agent ran no tsc, vitest, vite-node, npm script or generator. Every claim
below comes from reading source and from git; compilation, assertions and timing are the lane's.

Commits on the branch, in order:
  b2d3d97e  P16: apply the current200 candidate onto main at 8792de52; conflicts resolved by the ledger's rules
  0863f80b  P16 C-01: absorbed work obeys the stabilized shared-occupancy law in every reader L-05 fixed
  96ea1da7  P16: the candidate's suites compile against the stabilized laws; the 12A witness reads the live save
  (this report is the fourth commit)

Headline numbers
  200 candidate paths: 71 added, 129 modified (52 added test files, 61 modified test files, 87 source,
  helper and generated paths).
  190 paths applied or merged cleanly; 14 of those were three-way merged onto files main changed since
  the candidate's base 2c3024e2, and each was reviewed (section 2).
  10 paths conflicted; all 10 were resolved by a ledger rule or by keeping both sides (section 1).
  Static import check: 0 unresolved imports or missing exports across 1,255 tracked TypeScript files.
  Expected failures by static reading, by class (section 6): 16 tests in 5 files (C-03); 32 files that
  need captures outside the repository (31 candidate files, audit C-06, plus the new C-01 regression);
  38 Bridge files whose projection or registry pins predate projection 62 (C-02; 10 of them
  candidate-modified); 9 files that still treat Save48 as the live save. The classes overlap where a
  file belongs to two.


1. Conflicts and resolutions
----------------------------

git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks apply --3way --index PATCH.diff.
A plain --check failed at 14 paths; the three-way merge reduced that to 10 conflicts
(physicalPlans.ts, technology.ts and LotNextEventRail.tsx merged without markers).

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


3. C-01 disposition: FIXED in source, regression STATIC-UNRUN
--------------------------------------------------------------

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

Not done, with the reason:
  licence.ts activeProductionOn still counts terminal studios' frozen work (C-13 / P16-04). Sharing
  the rule there changes which estate lots are encumbered, which the estate suites pin; it belongs to
  the C-13 follow-up with its own test.
  The audit's second regression (an exited stopped-draft writer hired and commissioned) needs a world
  with absorption-scripts/v2 stopped drafts. The r04-pre162 route has none; the drafting171 captures
  do. The writer rule itself is the terminalWeek skip above.
  L-05 optional 4 (overlaps that began before the terminal week) stays DEFERRED, as the ledger records.


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

6c. C-02, projection and registry pins (38 files; source declares projection 62):
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
  tests/p15b-legacy-v3.test.ts :97, :102, :113
  tests/p15b-legacy-official-order.test.ts :23, :44
  tests/p15b-legacy-atomic.test.ts :69 (spies validateSaveP15B; the publisher now calls validateSaveV49)
  tests/p14c2s-scientist-retirement.test.ts :290, :293 and tests/p15a2-power-ranking-archive.test.ts :939
    (expect "migrateToV48: ... corporateCondition"; the V49 -> V48 step now refuses the rights root first)
  tests/p15b-legacy-terminal-regression.test.ts :180-183 (candidate-modified; the two-closure spy is
    still on validateSaveP15B)
  The candidate's own pattern fixes them: validateLiveSave for "the live save", and rightsStripped (or
  convertV49ToV48's named refusal) for downgrade assertions, as p13b-s8-save-v27 does.

6e. Recorded elsewhere and carried, not new: the audit's still-open candidate items (held-title-buyer-public
5,676 ms, p13b-s5 mid-deployment 10,051 ms, four p14b5-relationships failures, 13 Bridge consumer
timings) and main's recorded baseline in lane-logs.


7. Stabilization tests the rebase touched
------------------------------------------

  tests/stabilization-l19-save07-persistence.test.ts: prefix "validateSaveP15B" -> "validateSaveV49"
    (apply commit; the laws now run first in the live validator).
  tests/stabilization-l35-legacy-manifest-week.test.ts :116: validateSaveP15B(makeSave(...)) ->
    validateLiveSave (third commit; it refused every Save49 envelope by version).
  No stabilization test or law was removed, skipped or weakened; no budget changed.


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
