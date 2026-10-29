# Synthesis notes (lead reviewer), updated as reports arrive

## Status of reviewers (13 launched)
Done: SAVE, CORE, BRIDGE, UI (engine/app/screens), P16-SOURCE, PROD.
Running: PEOPLE, P16T (candidate tests + evidence), FAC (facilities/technology), RIVAL (rivals/market/closure), LOT (ui/src/lot), SUP (supporting engineering), P17/P18 drafts.

## Lead spot-checks performed (all confirmed at cited lines)
- SAVE-01 strip-and-delegate bypass of seq/nextSeq law (save.ts:4936-4953 vs 5237-5274). SAVE-06 sentinels hard-code 49.
- CORE-01 tick.ts:988-994 single `cash -= payroll` + two ledger rows; construction.ts:456-464 exact equality; tick.ts:818 `wg * run.studioShare` unrounded.
- CORE-02 actions.ts:597-633 cancel has no releaseAuthority mention.
- BRIDGE-03 registry jumps v45 → v31 (32–44 absent). BRIDGE-07 cashBefore/cashAfter integer(). BRIDGE-01 generator copies TS hash as unity hash (generate-bridge-contract.ts:186).
- UI-01/02 App.tsx onLoad 4899-4914 resets neither deferredLotReleaseRef nor livingTurn; UI-03 adapter requiredNegative duplicates core filmPackage.ts:96-98.
- P16-01 K/p16 hollywoodValidation.ts:286/421/429 vs employment.ts:174-177 (terminalWeekOf skip); absorbedWork.ts:6-7 comment. P16-02 K/p16 PROJECTION_VERSION 62 vs committed manifest 61.
- P17 draft P17_SAVE_VERSION = 46 / predecessor 45 (continuationSave.ts:14-15); P18 51 / predecessor 45 (save.ts:649-650). K/p16 = 49/48.
- PROD-01 actions.ts:2146-2153 no endWeekExclusive check (0 mentions in 2099-2245); hollywoodTick.ts:359 rival guard exists; scriptDevelopment.ts:1115-1118 invariant; contract doc :96-97 one-week premise.

## Cross-domain duplicates (merge in final list)
- CORE-02 ≡ PROD-02 (cancel after commit → orphan release commitment). Keep as one finding, cross-confirmed by two independent reviewers.
- CORE-03 ≡ PROD-10 ≡ UI-03 (budget/term inputs unvalidated in core; UI adapter and Bridge both compute the greenlight negative budget from a mirrored formula). Merge: one finding "core trusts caller money", with the adapter-mirror angle.
- CORE-06 ≡ PROD-09 (queue-admitted greenlight event rows stamped t while ledger/startTick t+1; mixed-week convention). Merge.
- CORE-05 ≈ BRIDGE-04 ≈ SAVE-10 ≈ UI-10 (untyped refusals: crashes become refusals/expiries; swallowed causes). Merge into one architectural finding "no typed refusal", with four sites.
- SAVE-11 ≈ UI import cap (same 8 MiB ceiling, Saves.tsx:33-34).
- SAVE-03 ≈ BRIDGE-02 ≈ BRIDGE-06 ≈ CORE debt 1 ≈ UI-14 (validation/serialization cost per tick/command/poll). Keep BRIDGE-02 as the P1 risk; cite the rest as the same cost family.
- P16-02 ≡ HANDOFF "canonical-62 generation pending" (known, STATIC-UNRUN).

## Severity calibration (lead judgment)
P0: none found by six domains so far. Invariants fail loud; no silent corruption or money loss proved.
P1 landed: PROD-01 (confirmed, reachable in ordinary play, bricks campaign), CORE-01 (strongly supported; reachability needs one execution probe), BRIDGE-01 (integration evidence gap), BRIDGE-02 (scale risk; mechanism certain, magnitude unmeasured).
P1 candidate: P16-01 (confirmed by reading, unsaveable world after sanctioned write-off), P16-02 (known gate).
P2 landed: SAVE-01, SAVE-03, SAVE-04, CORE-02/PROD-02 (latent), CORE-03 merged, CORE-04, CORE-05 merged, BRIDGE-03, BRIDGE-04, BRIDGE-05, BRIDGE-06, BRIDGE-07, UI-01, UI-02, UI-04.
P2 candidate: P16-03.

## Static checks: NOT RUN and why
node_modules absent in R → tsc/vitest/vite-node cannot execute; lane-guard would also block direct heavy commands. No static check executes code except file reads; every "check" listed is NOT RUN.

## Destination for publication
Persistent: /Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/ (AUDIT.md, EXECUTIVE-SUMMARY.md) — outside the checkout, consistent with the S evidence convention. Session copies in this scratchpad. No PR, no artifact (contains local paths).

## Additional lead spot-checks (confirmed)
- PEOPLE-01: castingSessions.ts:599-605 invariant `person.role === 'actor'` over every session slate; professionTransitions.ts:187-191 rewrites role; runs via construction.ts:408 (tick/action/save). Confirmed by reading; natural reachability needs a run.
- PEOPLE-04 / P16-01 landed twin: hollywood.ts:108 industryBusyTalentIds skips closed; hollywoodValidation.ts:371-372 claims every business's productions with verifyParticipants(p,true). Confirmed.
- P16T-03: R6 BINDINGS.json expectedCompiledTests pins tests/p16-absorption-continued-production.test.ts = 443a8b3e45e3…; current200 MANIFEST and actual K/p16 file = a99540fa7502…; runner.sh admission `need(sha(c/path)==pin,'exact reviewedsource …')` would fail. CONFIRMED decisively. The HANDOFF "exact next implementation sequence" steps 1–2 cannot succeed on current200 with R6 as bound.
- P16T-01: K/p16 estate.ts:231-236 estateHandoffRefusal runs closureAuthorityRefusal before unknownStudio; estate.ts:456-457 rejects injected readers and non-D−1 input; p16c-estate.test.ts builds a synthetic handoff (world() at :55-58). Consistent with the static-fail claim.
- bridge-schema.test.ts:84 in K/p16 pins projection-59 while source bridge-schema.ts:290 = 62 and generated outputs = 61: three different numbers in one candidate.

## Cross-domain duplicates (additions)
- PROD-01 ≡ PEOPLE-02 (writer contract vs multi-week draft; PEOPLE adds the market-loss variant with no remedy). Merge; cross-confirmed by two reviewers.
- PEOPLE-04 (landed) ≡ P16-01 (candidate): same validator-vs-availability law conflict; P16 inherits and extends it to absorbed stopped work. One root cause, two surfaces.
- PEOPLE-05 ≈ CORE-05 ≈ BRIDGE-04 (untyped refusals / catch-all).
- PEOPLE debt 1 (seven busy-set computations) ≈ UI-06 (adapter engagedTalentIds diverges from core busyTalentIds) ≈ PEOPLE-03 (greenlight gate omits industry seats). One root cause: no single occupancy producer.

## Severity calibration additions
Owner scale P0 = corruption/destructive loss/safety/blocker to safe continuation. I classify campaign-ending soft-locks reachable in ordinary play (PEOPLE-01, PROD-01/PEOPLE-02, CORE-01, PEOPLE-03, PEOPLE-04) as P1 "consequential incorrect gameplay" but flag them as the most serious class found: the state is not corrupted (fail-closed validators), yet the campaign cannot advance or save and the player has no remedy. P16T-01/02 are evidence/acceptance blockers for the candidate (P1 for landing), not P0 corruption.
