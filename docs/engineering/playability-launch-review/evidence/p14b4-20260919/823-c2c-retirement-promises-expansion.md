# 823 — C.2c: retirement and open promises

IN PROGRESS. Entry observed 2026-09-26T10:58:38Z. Source and remote both
`9b170660398e605be149994400bf092415c78a07`; clean worktree on
`wip/headless-program-20260916-ts`. No reset, clone or restoration. Process checks
showed no vitest/vite-node/tsc or prior worker child jobs. Two resident Claude
terminals have cwd in the separate Downloads packet directory; the Owner yielded
implementation ownership, and neither was invoked. Codex-native specialists carry
the existing sim-core and test-author contracts, inherit this session's model,
and cannot delegate. Parent owns integration, publication and the one test slot.
Actual Node: v20.20.2. Save 36, projection 50, protocol 4, promise rules 4.

## Authority and player outcome

Owner-selected, 773 §10: **"void the promise if they retire"**. This selects
automatic VOIDED without a trust penalty. It does not select a trigger week.
The following timing/proof is a delegated implementation decision, not a quotation
or additional Owner ruling. An open bound promise becomes VOIDED when retirement
closes new production admission and its unmet obligation requires another seat,
unless ordinary physical timing already rules that obligation out independently.
Completed contributions and every terminal outcome stay recorded.

## Selected trigger and causal proof

Evaluate during the ordinary weekly promise pass, after the week's first takes
and newly announced retirement intent are known, before ordinary due settlement
and market ranking. SATISFIED has precedence. For a bound open unmet promise,
VOIDED requires all three facts on the same state:

1. Retirement's actual admission predicate now refuses a NEW production seat
   (announced: `week > E - PRODUCTION_TICKS - 1`; finishing/retired: no new seat).
2. Existing qualifying committed pre-first-take seats cannot cover the remainder
   inside its half-open window.
3. Ordinary target-specific physical timing, without the retirement refusal,
   has not independently ruled out that remainder. For rivals, a subsequent seat
   must wait for earliest release: they have no player cancellation route.

The trigger is the **first weekly pass meeting these conditions at or after the
actual admission cutoff**. A normal announcement has at least 52 weeks' notice
and therefore cannot immediately trigger it. FRAGILE, a joint reservation
conflict, and a work-limit refusal never trigger an outcome. When ordinary physical
timing independently rules the remainder out, studio/deadline law remains
authoritative. No terminal result is reopened or rewritten.

This is the selected retirement disposition rule, not certification of a funded,
staffed counterfactual schedule. Stage/cash fragility is not itself a terminal
promise failure under existing law. Actual studio termination/cancellation outcomes
settle at their commands and remain terminal before this weekly rule runs.

Review correction before implementation: the initial draft compared two optimistic
upper bounds before the cutoff. Independent review found that this overstated
causation: a rival needing three takes at E-16 cannot use the player's five-week
cancel/restart route even without retirement. That early-capacity trigger is
withdrawn. Tests must keep such a promise under ordinary law while admission is
still open, and preserve the rival release constraint at the cutoff.

Source reconciliation: the promise deadline lies inside its carrying contract
(`promises.ts` attachment and validator); announcement chooses
`E = max(A + 52, active contract/interval ends)` (`careerLifecycle.ts`). Therefore
waiting only until E would usually find an already BROKEN promise. The actual
retirement restriction is on a NEW greenlight: `g + PRODUCTION_TICKS + 1 <= E`.
It is not a cap on first takes. An existing qualifying seat may be held at its
first-take boundary, then finish under obligations-first, even after E.

The physical check uses actual distinct qualifying first takes, the complete P1
or tagged-P2 cast predicate, and committed qualifying pre-first-take seats. It
allows a held take to reach the promise's window start. The player's subsequent
pictures use the existing physical five-week cancellation/restart bound; a rival
must first release its picture through its actual production owner. The check
ignores competing promises, cash and other resource contention. New seats are
closed by the actual lifecycle predicate; committed seats survive. It does not
convert an optimistic upper bound into an executable success witness or reopen
the eight-week heuristic/evaluator-5 project.

Use the CURRENT E, including an accepted final extension. Do not speculate an
additional 52 weeks: C.2b settles at the carrying employment end C, while an
existing promise is due no later than C (exclusive); that future extension cannot
create an extra take before that original deadline. It never lengthens the
promise window. A later extension must not revive an existing terminal outcome.

The weekly order becomes first takes → bonds → lifecycle intent → ordinary
promise pass → market → lifecycle settlement. Intent writes only new retirement
records, and reads no promise outcomes; market still sees same-week outcomes and
announcements. Lifecycle settlement still sees an accepted same-week extension.

## Requirement → test map

| ID | Required observable behavior | Independent check |
|---|---|---|
| C1 | Announcement alone leaves a possible promise open | Actual tick through birthday; no outcome/receipt |
| C2 | Retirement removes the last future greenlight route | Paired capped/uncapped states; exact first VOIDED week and one receipt |
| C3 | Existing committed work survives, including held takes | Real greenlight/first-take path crossing boundary; actual qualifying progress |
| C4 | Completed work is never erased | Kept/SATISFIED precedence; partial progress/evidence preserved |
| C5 | Full predicate and identity | Tagged lead vs antagonist/support, issuer and beneficiary differences |
| C6 | Studio-caused failure remains ordinary law | Uncapped also impossible, cancellation and termination controls |
| C7 | Binding and terminal immutability | Unbound proposal untouched; SATISFIED/BROKEN/WAIVED/VOIDED unchanged; exactly once |
| C8 | Extension uses current E without resurrecting history | Genuine extension command/settlement; legal deadlines and moved-boundary feasibility |
| C9 | Determinism and persistence | Actual live save/validate/reload and continued tick match; originals unchanged |
| C10 | No trust penalty and permitted disclosure | Existing trust and bridge promise/receipt projections; no private terms leak |
| C11 | Feasibility sees retirement | Capped new assignments, preserved committed path, digest changes with relevant E |

## Implementation boundary and verification

Sole production writer: `src/core/promises.ts`, the narrow tick-order seam in
`src/core/tick.ts`, and `bridge/trust.ts`'s missing issuer-only VOIDED outcome word.
The public industry feed remains governed by its existing disclosure filter.
Use the existing `settle` receipt/outcome owner. Existing VOIDED persistence and
wire members already exist; no save/projection/rules bump is assumed necessary
for this bounded law. Keep unaffected feasibility digests byte-identical by
including retirement facts only for a recorded beneficiary. No evaluator-5 work,
budget/timeout changes, fixture refresh or new replacement policy.

Test author separately owns new C.2c tests and necessary new helpers. First record
RED against unchanged production; verify the failures name absent behavior rather
than malformed fixtures. Then production, focused and adjacent checks, stable-source
independent review, full core boundary against 822 by test identity AND diagnostic,
type/bridge checks and publication. Use `run-fixed-source-c2.mjs`; freeze every
consumed input and HEAD during a recorded run. The inherited baseline is 55
failures, qualified; no all-green claim. Unity/native remains deferred.

## Bounded follow-on and restart

Immediately after C.2c: Scientist retirement amendment, eligibility 62 / hard
ANNOUNCEMENT 72, existing notice, obligations-first and one final extension. Its
own independent RED must reconcile old never-announces tests and frozen/live
validator policy explicitly. Measure `researchCandidates`' eight stable identities
and rival recruitment versus C.4's film-only cohorts; no refill policy is selected.
Then C.2-RM (821), remaining P14, P15–P17 and sufficiently specified P18.

Next action: finalize independent RED fixtures against this map, run them on the
unchanged production source, then release the sole writer. No implementation or
test pass is claimed in this entry record. No test process is currently active.
