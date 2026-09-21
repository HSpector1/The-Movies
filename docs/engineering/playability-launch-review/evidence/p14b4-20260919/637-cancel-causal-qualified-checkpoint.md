# Record 637 — breakPromisesOnCancel causal-coupling correction: QUALIFIED WITH RECORD-ONLY ITEMS (629-R)

Status: engineering checkpoint, qualified by the independent contract-auditor review 629-R
(`629-R-review.md`, verdict QUALIFIED WITH RECORD-ONLY ITEMS, no DEMONSTRATED defect). Not Owner
acceptance. Authority: Owner ruling record 600 step 7 (continue the authorized logic-first
program); record 628 NEXT628 (b); record 630 rulings R1–R7; record 26 §2; plan :237-258, :331-336,
:348-355. Unity/native deferred; no wire, save, receipt, RNG or version change.

## Identity

- Candidate source: `61833f0d` = 629-W S1 `c5a2ecdc` (`src/core/promises.ts`) + S2 `61833f0d`
  (`src/core/actions.ts` :591-595 comment-only), landed via commit-tree with each cumulative diff
  byte-equal to the writer's patch (S1 sha256 `ae3e8c1d…`, S2 `bc4e5019…`); `git diff --stat
  61833f0d HEAD -- src bridge ui` empty at sealing.
- RED: `tests/p14b4-cancel-causal-proof.test.ts` — 629-T bytes `c3fdbf56…` (592 lines, commit
  `6c9e7d47`), amended by 629-T2 to `3eb7f1fc…` (765 lines, commit `885ef07`; blob `e0e5f1d` = the
  post-image of the tested diff `03488791…`).
- Versions unchanged: PROMISE_RULES_VERSION 4, LIVE_SAVE_VERSION 30, PROJECTION_VERSION 47, schema
  identity `sha256:6f6b4880…`.

## The landed law (promises.ts :641-667, :769-796)

`targetSpecificImpossibility(state, promise, week)`: `remaining = max(0, count −
|qualifyingTakes(state, promise)|)`; zero → `null`; `t0 = max(windowStartWeek,
expectedFirstTakeWeek(state, promise, week, 0))`; `nMax = t0 < dueWeekExclusive ? ceil((dueWeekExclusive
− t0) / WEEKS_TO_FIRST_TAKE) : 0`; the physical sentence iff `remaining > nMax`. No reservation
subtraction, no family or class refusal, no FRAGILE term, no receipt. `breakPromisesOnCancel`:
immunity line unchanged; judged iff evaluable ∧ same issuer ∧ the beneficiary held a seat in the
promise's class mask on the cancelled picture; proof on the post-cancel `state`; cause and reason
strings byte-identical. `reclassifyPromise` stays exported with no production caller.

## Evidence chain (record-check, serialized, fixedSource true throughout)

| # | On | Result |
|---|---|---|
| 629 | `cb13a457`, untracked RED `104739c5…` | 7 failed / 9 passed — every failure at `untouched()`; every premise passed (joint `promises already made to this person exhaust the window`, classless-P2 refusal, `a directing promise is not offered in this slice`, physical sentence with the ORIGINAL count); the array-order loser shape witnessed (629-T finding 1) |
| 631 | `61833f0d`, unamended RED (start 19:43:51Z, before T2) | 16 passed / 16 |
| 632 | `61833f0d` | typecheck (root + ui) EXIT 0 |
| 633 | `df944978` + T2 diff `03488791…` | RED 22 passed / 22 |
| 634 | same | live-P2 set, 14 files: 1 failed / 226 passed / 2 todo — the failure is the designated evaluator-5 case (`expected 'FRAGILE' to be 'IMPOSSIBLE'`, identical in 624); 624's 192 + seating 21 + p14bf2 13 = 226 |
| 635 | same | natural-chain controls, 16 files: 177 passed / 2 todo — identical to 625; chain digests `2aec0184…` / `d3218295…` unmoved |
| 636 | same | FULL CORE 9 files / 24 failed / 3813 passed / 8 todo (346 files) — the same nine files with the same per-file counts as 627 (bridge-p12-campaign-library 11, bridge-p13-campaign-isolation 1, p13a-scientist-foundation 3, r3n1 ×3 files 2 each, world-first-scenery-load-in-provenance 1 = 22 inherited since 89b5ad2; evaluator-5 1 + ready-replay-stale-target 1 = 2 designated); +22 passed = the RED; never cited as all-green |

## What the RED pins (22)

Untouched at the cancel: joint reservation conflict (either promise; no loser by promiseId order);
bound legacy count-only P2 in a wide window; bound DIRECTING_COUNT root; support seat under a lead /
leadOrAntagonist mask (then due-week BROKEN); count-2 with one real qualifying take (and with a stale
progress 0); the A/B separator (count 2, window [21,33): untouched under the 5-week hard bound,
would break under the quote's 8+5 cadence; due-week BROKEN at 33); the D1 clamp ([23,28): t0 =
max(23, 26) = 26, untouched, due-week BROKEN at 28). BROKEN at the cancel: tagged lead and P1 count-1
with due w+2; the at-five differential (take expected w+1 before, nothing by w+3 after); legacy P2
with due w+2; the case-5 negative (support take does not qualify a lead mask: remaining 2 > nMax 1);
the D1 mirror ([23,26): t0 26 ≥ 26). Immunity (first take then cancel), the termination owner on the
real releaseTalent route, the no-change control, and direct helper pins (count 1: due t0 → sentence,
t0+1 → null; count 2: t0+5 → sentence, t0+6 → null; remaining 0 → null). Every root is a real bound
root (contractId from the actual employment row, validated by `makeSave`/validateSaveV30); takes only
from the real 5→4; outcomes only from the real owners.

## Owner-visible behaviour (629-R Q5)

When the studio cancels a picture that has not filmed, each open promise to a person seated on it in
a seat the promise counts is judged at once and marked BROKEN with the cancel cause only if no
schedule can still deliver the remaining count before the due week (first take no earlier than
max(window start, now + 5); later takes five weeks apart). Otherwise the cancel records nothing and
real takes or the due week decide. No longer broken at the cancel: a joint reservation conflict, an
unsupported family, a legacy count-only P2, a count ≥ 2 root the quote's cadence would refuse. A
support-seat cancel under a lead-class promise is not judged at the cancel. Unchanged: cause
strings, receipt reasons, one own receipt per outcome, trust driver kinds (the `promiseBroken` week
moves with the outcome in the cases that changed), save/wire/versions. Today no bridge or UI route
builds a production `cancel` action; the seam is reachable through engine `applyActions` only.

## Record-only (carried; none reopened)

- Publication correction `def4ace1` (record 630): 52 probe logs named by 616/618/628 were untracked
  by `.gitignore *.log`; force-added; log directories verified with `git ls-files` since.
- Comment/line drift: RED comments (:414 validator refs, :422 promiseCastSlots); 26 §2 (:656 → :779,
  :739-746 → actions.ts :567-600); `promises.ts:449-452` doc on `reclassifyPromise` still names the
  §4.4 step (no production caller now); `tests/p14b1-promises.test.ts:578/:780` describe the
  pre-writer coupling (assertions lawful); 629-B Q6 "17 files" for the 625 set (16).
- DIRECTING_COUNT roots judged over generic cast (a director sits in `directorId`, never `cast`;
  never relevant at this seam; due-week only); FRAGILE placeholder receipts on labeled bound roots
  (validator-lawful, not live-mintable, unread by owners); synthetic double-seat and `from ≥ due`
  states outside the lawful contract.
- Cancel attribution for the Owner: 5N and D1m were impossible before the cancel; the seam credits
  the cancel (the pin p14b1 :780-838 and companion §4.4 chose this reading). The 5-week two-take
  witness is unbuilt (this fixture's pipeline takes at +9; the bound is optimistic relative to it —
  the safe direction).
- The greenlight seam needs no integration (a non-mask hold is reversible by the same studio's
  cancel).

## Next (bounded)

NEXT637: (c) the stale-title text pass (600-R Q2 list; `p14b3-rule-revision:97`,
`bridge-p14b1-promises:206/:498`, `p14b1-save-v29:108/:193-194`, `bridge-operations-events:323`,
generator-test comment `:658`, `promises.ts:90` and `:449-452`, `p14b1-promises:578/:780` wording)
+ the 574-R `promiseCapacityOwners.ts:8-9` doc fix — comment/title-only, ONE writer, no assertion
change, record-check on the touched files. Evaluator 5 later (D2 (i-c)). Owner expansion-review
questions from 628 (R5, G-1(A), G-2) and the cancel-attribution note above await the Owner;
nothing adopted. Unity/native deferred.
