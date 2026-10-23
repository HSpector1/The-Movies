# Stabilization report — Owner order 2026-10-22 "IMPLEMENT CODE REVIEW FINDINGS"

Branch `wip/headless-program-20260916-ts`, base at phase start `0a12cbfd`, head at report time `f75e76ce (follow-up 5; the records commit follows it)`. Every runtime claim names a lane log under `lane-logs/` beside this file (also copied into the repository under `docs/engineering/audits/2026-10-22-codebase-review/`). The findings ledger (`LEDGER.md`) carries one row per audit finding with FIXED / VERIFIED / DEFERRED / NOT REPRODUCED / BLOCKED and the evidence.

## What improved

- **The campaign can no longer tick or play into states it cannot save**, for the five people-and-employment laws the audit found (writer term, casting slates after a profession change, payroll booking, the one availability set, closed businesses' retained work), the facilities cancellation seam (an Office III cancel on a II body, a second restoration, re-adopting sound after a cancelled fit-out, moving or demolishing bodies with cancelled records or plan proofs) and the money boundary (no cancel after a release commitment; no NaN, negative or infinite budget; no fractional or NaN contract term; owned copies of caller payloads).
- **The live save validator covers what the frozen chain let through**: the studio-event sequence law over the unstripped log, a whole-state finite-number walk, the casting-slate law reaching every frozen walker with the recorded profession history, one receipt per restoration, and restorations never work to order.
- **The Studio Lot keeps presentation memory with the studio it belongs to** (deferred release playback and the Living Turn transport reset on start, new game and load), guards every money-moving Lot handler against a stale render-time state, stops swallowing letters page-wide and releases the page's keys under a modal, re-bakes built facilities' artwork on remount, tears down a hidden-tab Lot, opens the clicked stage's own picture (pinned by a case that is red at the parent), keeps the decision badge, lists the financing bucket beside a corrected "Other cash", and names the four installation holders the cancellation seam publishes.
- **The Bridge refuses at the source what the native consumer could not read**: a wire integer is the consumer's int32, every quote response leaves through the published contract, a violation is a named SCHEMA_MISMATCH rejection that leaves the runtime alive and registers no intent, and the event week's two rules are documented correctly. The Unity contract manifest is regenerated (it hashes package.json, which Batch 1 changed); schema and C# DTOs are unchanged.
- **The toolchain and safeguards**: CI's static job on Node 20.20.2 (the hygiene audit crash fixed), the lane guard's command classifier, .gitignore anchors that stop silently dropping evidence, dependabot on the working branch, the legacy fixture generator's guard.

## What was tested

| Gate | Result | Log |
|---|---|---|
| Focused lane runs per batch (typecheck + selected core files, compared against the 162 recorded baseline failures) | every batch green except the recorded baseline; see the ledger per batch | `focused-batch*-r*.log` |
| Independent read-only reviews (Opus) of Batch 2 (two rounds), Batches 3/4, the follow-ups, Batch 5, Batches 6/7 with the Batch 5 follow-up, and follow-up 4 (follow-up 4's review returned one blocker, answered by follow-up 5 f75e76ce) | every substantiated blocker fixed and re-run; 11 blockers across the rounds, all answered; dispositions in the ledger | ledger review sections |
| `typecheck` (root + ui), `typecheck:bridge` | typecheck exit 0 (127s); typecheck:bridge exit 0 (37s) | `final-gates.log` |
| `check:bridge-contract`, `check:bridge-contract:fixtures` | check:bridge-contract exit 0 (1s); check:bridge-contract:fixtures exit 0 (1s) | `final-gates.log` |
| `audit:repo-hygiene`, `audit:3d-assets`, lane-guard self-test | audit:repo-hygiene exit 0 (27s); audit:3d-assets exit 0 (0s); lane-guard-self-test exit 0 (11s) | `final-gates.log` |
| `build` (vite) | build exit 0 (28s) | `final-gates.log` |
| `test:bridge` (contract checks + bridge files) | 1067 tests, 1028 pass, 37 fail (34 recorded-baseline, 3 new: bridge-runtime-checkpoint-prepared-reuse.test.ts :: prepared checkpoint representation reuse preserves authority; bridge-schema.test.ts :: canonical Unity bridge schema rejects missing, additional, w; bridge-schema.test.ts :: canonical Unity bridge schema preserves required nullable nu) | `final-bridge.json` |
| `test:ui` (jsdom) | 2720 tests, 2702 pass, 13 fail (13 recorded-baseline, 0 new: none) | `final-ui.json` |
| full `test:core` | 5869 tests, 5749 pass, 106 fail (102 recorded-baseline, 4 new: bridge-runtime-checkpoint-prepared-reuse.test.ts :: prepared checkpoint representation reuse preserves authority; bridge-schema.test.ts :: canonical Unity bridge schema rejects missing, additional, w; bridge-schema.test.ts :: canonical Unity bridge schema preserves required nullable nu; world-first-scenery-load-in-provenance.test.ts :: World-First Scenery Load-In V1 — frozen district provenance ) | `final-core.json` |

Claims limits: no browser session, no native (Unity) run and no Owner playtest happened in this phase; every UI claim is a jsdom unit claim; the recorded 162 full-core failures (P15B-full-gate-r1) are compared, never waived.

## What remains

- **Owner decisions** (ledger rows): L-17 engine refusal versus fault surfacing; L-18 the admission week of a queued greenlight; L-16 the recap label; L-28 the promise feasibility term; L-32/L-33/L-34 facility rulings; L-35 the Legacy manifest week; L-37/L-40 Lot rulings; C-07 the P16 rights model versus the P18 commissioner party; C-09 story-property minting versus the P17 link; the Scientist-as-Craft-Lead rule the one availability set now refuses; whether a plan-built body may ever be demolished (the fail-closed hold is the interim).
- **Deferred to the next phase** (named in the ledger): L-12/L-20 (measure first; the live validator's measured cost is +16% on the save-heaviest bridge suite), L-21 (P16 boundary), L-41/L-43 and the L-09 cursor-key policy (need a browser), L-23, L-29, LOT-13 (four adopted contract tests pin the plate copy), the 30 numeric leaves no named validator types (a `null` there still passes), the int64 money contract for the Bridge (owner's at canonical-62), the P3 groups.
- **Blocked**: L-22 (genuine fixtures of projections 32–44 do not exist), L-11 (Unity consumer binding; this machine cannot run Unity 6000.3).
- **P16 candidate**: untouched; its patch now fails `git apply --check` at seven paths at this head (the regenerated manifest, the semantic `hollywoodValidation.ts` rule, the live validator's new laws, the three sentinel tests the independent constant now drives, the rail rows); a merge rule per path is recorded in the ledger; C-01..C-14 remain the P16 lane's.
- **Tests still owed**: the time bound of the closed-business straddle check and the hard-age guard need constructed lifecycle worlds.

## Readiness for the next gate

The branch is ready for the next gate as an engineering candidate, not yet as a player-accepted one. Every batch landed through focused lane runs compared against the recorded baselines, six independent read-only reviews whose eleven blockers were all answered, and a full gate at `ba238f30` whose only new failures are the two wording cases follow-up 5 corrects, one load-sensitive timeout measured green alone, and one environmental exporter. Promotion to `main` is the Owner's separate decision; before it, two things deserve a look: the 59 recorded failures that no longer reproduce (listed, not investigated), and the P16 candidate's seven conflicting paths, each with a merge rule. No browser, native or Owner playtest claim is made.

No `main` merge was performed. The branch is published at `https://github.com/HSpector1/The-Movies.git`: first push at `d007408e` after the usage trigger, the records commit was pushed last and the remote ref verified equal to the local head (HANDOFF).
