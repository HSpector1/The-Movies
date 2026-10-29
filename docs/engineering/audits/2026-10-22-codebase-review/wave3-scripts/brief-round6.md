# Round 6 brief: the full gate's 21 remaining non-candidate failures

The full gate (`wave3f`, worktree head 07e6c669, log `~/studio-scratch/1370-codebase-review-20261022-r1/lane-logs/wave3f.log`, reports `p16-gate-{bridge,ui,core}.json` beside it) ran every static gate green (typecheck, typecheck:bridge, both contract checks, 3d-assets, lane-guard, build; `audit:repo-hygiene` exit 1 is the known sparse-checkout artefact). UI: 0 new. Bridge: 2 new, both the recorded load timeouts. Core: 5948 tests, 149 failed; 106 recorded baseline by name, 43 new. Of the 43: 2 load timeouts, 3 sparse ENOENT (`p14c3-force-order`), 21 candidate-own already recorded (15 estate `actualClosureMissing`, 5 fractional asks, 1 drafting171), and **17 new era-class and pin failures** in files the focused runs never reached. A message-level comparison against the stabilization gate (`final-core.json`) found **4 more** failures hidden as "baseline by name" that passed at the stabilized main. Those 21 cases are round 6.

Round 5 (72036a93) did not touch any of these files, so every case is expected to reproduce on the current head; a lane run (`wave3i`) is measuring that now on the primary worktree.

## Where to work

- Side worktree `~/studio-scratch/p16-rebase-r5-wt`, branch `p16-rebase-20261024-r5`, currently at 72036a93 (the primary worktree is at the same commit and is under a lane run: do not touch `~/studio-scratch/p16-rebase-20261024-wt`).
- Same rules as rounds 2 to 5: no `.skip`, no budget or timeout changes, no fixture edits, no weakened assertions; every git call `git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks`; commits end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`; never amend. One commit per class below. You cannot run vitest, tsc, npm or node; reason from the source and say exactly which single file the coordinator should run when a measurement is needed, then continue with the rest.
- An era move keeps the original law asserted on a predecessor-era control (the genuineFrozen48 / week-133 patterns from round 4) or records the law by name as ACCEPTANCE OPEN in `P16-REBASE-REPORT.md`. Never "MOVED".
- A candidate-own defect (the P16 lane's) is fixed in `src` only when the fix is small and sits at the shared root; otherwise leave the case red and list it under C-03 in the report with file:line and the rule it breaks.

## A. `rightsStripped` refuses a nondefault market assessment (6 cases)

`tests/helpers/p16-era.ts:67` throws `rightsStripped: a nondefault current market assessment cannot be projected` for any table-3 assessment row that is not the default zero batch. Every downgrade chain that goes through `predecessorSave` (`tests/helpers/p15-roots.ts:51`) or `downgradeLiveTo45` (`tests/helpers/live-era.ts:28`) on a ticked world now stops there.

1. `tests/p1364-late-founding.test.ts:782` (R-B founding-second-grant): `predecessorSave(week30)` is the *admitted baseline*, not a refusal expectation.
2. `tests/p1364-late-founding.test.ts:1123` (founding-downgrade-refuses-recorded-fund): expected `/cannot downgrade or discard the recorded founding fund[^;]*; .*Power Ranking quarter/` on `down(predecessorSave(ticked))`.
3. `tests/p14c3-offmenu-extensions.test.ts:236` (two cases, actor→director and actor→writer): expected `/^migrateToV45: cannot downgrade or discard recovery authority: …/`.
4. `tests/p14d1-rival-shelving.test.ts:584` (shelving-viable-control): `downgradeLiveTo45(ordinary)` is a *positive* projection building the V45 historical control for "genesis to week77 matches the genuine old input".
5. `tests/p14r3-save-v41.test.ts:389`: expected `/^migrateToV44: cannot downgrade or discard a recorded shared-market assessment \(\d+ recorded\); …Power Ranking quarter$/`.

For the refusal expectations (2, 3, 5): the live step's own first refusal is `LIVE_DOWNGRADE_REFUSAL` from `tests/helpers/p16-era.ts` when the chain starts at `convertV49ToV48(makeSave(state))`; the helper-projection refusal is `NONDEFAULT_MARKET_PROJECTION`. Decide per case which law the test is pinning and whether a predecessor-era control (a Save48 world that recorded the same facts, or the never-ticked base) can still assert the original frozen-chain reason. For the positive projections (1, 4): if no route projects a ticked P16 world to the predecessor era, the dependent assertions become ACCEPTANCE OPEN by name, and the case must still assert everything that does not depend on the projection.

## B. `rightsStripped` refuses current phase history (4 cases)

`tests/helpers/p16-era.ts:71-81` (`refuseCurrentPhaseHistory`) throws `rightsStripped: current phase history cannot be projected` for any row with `phaseOrderVersion > 2` anywhere in the predecessor state. Round 5 moved the *product* check into `convertV49ToV48` only (`src/core/save.ts:11937`); the test helper still walks the whole state.

6. `tests/p14c3-transitions.test.ts:183-185` (A05/A06): `historical45 = convertV46ToV45(convertV47ToV46(predecessorSave(reopened)))`, then expects `/^migrateToV44: cannot downgrade or discard a recorded Power Ranking quarter$/` further down.
7. `tests/p15c2-campaign-legacy-integration.test.ts` legacy-root-downgrade (at the stabilized main this case failed on a 120 s budget; now it fails on the projection, so its cause changed).
8. `tests/p15c2-campaign-legacy-integration.test.ts` legacy-old-law-fixture-v1-validates-after-retune (passed at the stabilized main).

Say whether the helper should keep refusing table-3 history it cannot prove neutral (then these laws are ACCEPTANCE OPEN with a control where one exists) or whether a provable-neutral relabel exists for a specific root. Do not loosen the helper to make cases pass.

## C. Save48-assumed-live pins (3 cases)

9. `tests/p1364-late-founding.test.ts:1051`: `expect(LIVE_SAVE_VERSION).toBe(FOUNDING_STEP + 1)` → the live version is now two steps above the founding step; pin through `EXPECTED_LIVE_SAVE_VERSION` from `tests/helpers/live-era.ts` and keep the founding-step function names.
10. `tests/p1364-late-founding.test.ts:1074`: `saveFn('convertV49ToV47')` does not exist; the chain is `convertV49ToV48` then `convertV48ToV47` (the first step is the P16 step and has its own refusals: a week-0 `newGame` world holds no title and its roots are empty, so say why it passes).
11. `tests/p15b2-corporate-condition-live.test.ts:75`: `expect(LIVE_SAVE_VERSION, 'the P15B save step is the live version').toBe(P15B_SAVE_VERSION)` → the P15B step is frozen at 48; the live version is 49.

## D. P16 money kinds leak into an old-era period (1 case, possibly candidate-own)

12. `tests/p13b-s8-old-era-period.test.ts:88`: `Object.keys(last.movements).sort()` must equal `V27_KINDS`; the new period carries 18 kinds, the four `P16_RIVAL_MONEY_KINDS` (`src/core/hollywoodTypes.ts:67-68`: rightsConsideration, dueDiligenceFee, acquisitionOutlay, estateSaleProceeds) included. The same test proves 'termination' (Save41) and 'facilityDemolitionRefund' (Save46) are *absent* from a period opened in an explicit V27 staging, so the period writer is era-aware for those. Trace how the writer decides the roster for an old-era period and whether the P16 kinds follow the same rule. If the P16 writer adds them unconditionally, that is a candidate-own defect at one shared place; fix it there if small, else leave red and record. Round 2's `estateSaleProceeds: 0` lifts were on live-era periods and are not precedent for an old-era period.

## E. The rights root's provenance label matches the S7 announcement regex (1 case)

13. `tests/p13b-s7-announcements.test.ts:138`: `expect(exported).not.toMatch(/"announcement/i)`. The rights root writes `source: legacy('simulated-rival', announced.has(film.filmId) ? \`announcement:${film.filmId}\` : \`film:${film.filmId}\`)` (`src/core/rights.ts:456`) for virtual properties, so the export now contains the JSON string `"announcement:<filmId>"`. Confirm this is the only match by reading what else the Save49 writers emit. The S7 law is that no announcement *record* persists; a key walk (no key matching /announcement/i anywhere in the parsed export, plus the existing `technologyAnnounced` check) pins that law without the false positive. Record separately, as a P16 lane note, that the rights root encodes whether a rival film was announced at mint time, and say whether that conflicts with 1363 S7's intent.

## F. The forged V11 envelope trips on the rights root (1 case)

14. `tests/facility-move-demolish.test.ts:893` (law 19): `validateSave(forgedV11)` now throws `validateSaveV11: state has unknown field …` before reaching `/SaveFileV13 facility demolition authority|facilityDemolitionRefund/`. The test already strips the P15 roots (guard-before-strip, :872-881) and `foundingFunding` (:882-886). Add the rights root the same way: prove it is the never-ticked default of a `generateWorld` world (name the fields `src/core/rights.ts` initialises and assert them empty) and then delete it. Name the exact unknown field in your report.

## G. The closure validator refuses earlier than the disposition law (3 cases)

15. `tests/p15b4-pending-player-adoption.test.ts`, 16. `tests/p15b4-player-proposal-transaction.test.ts`, 17. `tests/p15b4-proposal-transaction.test.ts`: `refusePure` in `tests/helpers/p15b-pending-family-assertions.ts:13-19` expects `validateStudioClosureRoot(s, 'unit')` to throw `no disposition for live subject adoption:…` / `proposal:…` after `removeAndRedigest` (:20-25, which rebuilds `counts` from scratch and re-digests). It now throws a message beginning `unit: studioClosure closure studio-cl…` (chai truncates; the lane log will carry no more). Read the candidate's `validateStudioClosureRoot` in `src/core/studioClosure.ts`, enumerate the checks that run before the disposition law and name the one that fires for a closure whose disposition list lost one row and whose `counts` were rebuilt from the remaining rows. If the P16 closure record carries a field the helper's rebuild drops (an estate link, a rights count, a required zero key), the helper must maintain it so the original law is reached again; if the new check is a genuine P16 law the forged closure breaks first, keep the original law asserted on a second forgery that passes the new check, or record it ACCEPTANCE OPEN.

## H. A table-3 stamp is admitted now (1 case)

18. `tests/p15c2-campaign-legacy-integration.test.ts:1035`: `refuses(tamper(frozen, (o) => { o.phaseOrderVersion = 3 }), 'campaignLegacy.official.phase')` ("2 has a table now") returns without a refusal: table 3 is the live table. Move the forgery to the first unknown table and say whether a stamp-versus-era consistency rule (an official record stamped 3 in a world that never recorded table 3) is provable from the root; if not, record that narrower law ACCEPTANCE OPEN.

## I. Hidden regressions found by the message comparison (3 cases)

19. `tests/bridge-p14b2-trust.test.ts` "group1 — projection46, unchanged Save29/intents, closed wire shapes pins the exact versi…": expected a 29-entry intent list to equal the pinned 27. Name the two intents the candidate adds to the wire, check them against the projection-62 pins and the registry (round 2/3 commits 53571456, c7039311), and update the pin only with the measured list.
20. `tests/bridge-p14p4p5-opportunities.test.ts` "B55-3 independently migrates genuin…": expected a 45-row list, got 49. Read what the rows are (one per version step? per projection?) and pin the live count with its reason.
21. `tests/p15c2-campaign-legacy-integration.test.ts` legacy-tick-freezes-once-at-6240: `expected 3 to be 2` at :684 (this case passed at the stabilized main). Most likely the frozen legacy record's `phaseOrderVersion`, now stamped 3 by the P15 writers on a rights-bearing world (the `Object.hasOwn(state, 'rights') ? 3 : 2` rule). Confirm from the source and pin the table by the rule, not the literal.

## Report back (as text, not a file)

Per case: disposition (pin updated / era move with control / ACCEPTANCE OPEN by name / candidate-own fixed in src / candidate-own left red), file:line, and the exact expectation now asserted. Then: commit SHAs on `p16-rebase-20261024-r5`, the mechanical self-check (no skips, no budgets, no fixtures, +/− expects), the single files the coordinator must run alone for measurement, and the `P16-REBASE-REPORT.md` sections you changed (§10 gets a round-6 record).
