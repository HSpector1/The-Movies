# 621 — Final seating preference: design (619-A), RED (619-T, published f8bf42a0), review (619-B: RELEASE WITH CONDITIONS); writer 619-W released

2026-09-21. Claude Code parent. Record 618 NEXT618 (a). Law: plan :215-236 (delegated hypothesis
adopted for this bounded slice, "subject to expansion review"); 26 §2 :80-87; 600 §3 step 8.

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| `619-A-design-note.md` (sim-core READ-ONLY; published f8bf42a0) | 34399 | `4be769653e1a7422…` |
| `619-T-report.md` (test-author; RED `tests/p14b4-rival-seating-preference.test.ts` 698 lines `13cf926145837afa…`; 620 baseline 5 failed / 15 passed / 2 todo) | — | published f8bf42a0 |
| `619-B-review.md` (contract-auditor) | 20573 | `46b1898e6215d821…` |

Workflows `wf_fc9bbaa4-2ca` (619-T ∥ 619-A) and `wf_3ba8c580-f92` (619-B). Per-call Opus
overrides on the test-author and auditor profiles; profiles unchanged.

## Adopted (619-B rulings 1–6; parent readings)

- The design implements plan :215-236 exactly (Q1 MET): `promisedCastMasks(state, issuerStudioId,
  takeWeek)` after `promiseCastSlots` (bound OPEN, unmet, same issuer, take inside the half-open
  window, intersection of masks, CURRENT offers never counted); benefit = distinct beneficiaries
  whose slot satisfies their mask; chooser `benefit > bestBenefit || (benefit === bestBenefit &&
  score > bestScore)` after the unchanged :50 cash and :60 viability gates; no-member path reduces
  to today's `score > bestScore`; planning call untouched; initial-cast seam: director/craft by the
  existing rule, `taken = {writer, director, craft}`, promised members in employment order, then
  the existing first-non-busy actors, `.slice(0,3)`, guard unchanged. Take week = `week +
  WEEKS_TO_FIRST_TAKE` = the 5→4 first-take week (verified: greenlight W → take W+5).
- **D1 (fix in the writer):** pass `promisedMasks` only when `masks.size > 0` (conditional spread
  or `undefined`), so the RED's no-member `decision.options` pin (:367) and the no-preference call
  stay byte-identical.
- **D2 (design-note correction, recorded here):** the default seed's w208 settlement swaps r01's
  and r02's teams on bound P1 roots; r01's leftover scripts carry the departed writer, so its new
  sole writer is a generic member NOT in `taken` and can be admitted by the seam ahead of the
  actors — a lawful G10-b movement on the default chain, not "G10-0 unchanged". Also: "< w208"
  (binding precedes the w208 decide); `bridge-p13b-s8-rivals` uses its own seed
  (`p13b-s8-bridge-probe-01`); scientists join only via a case, not `staff()`.
- **G10 "post-binding rival seating drift"** (sub-classes a permutation-only / b triple change / 0
  unchanged) is a lawful plan-T2 reconciliation class under the 600-B C10 conditions plus: name the
  class per moved fact; re-derive from receipts (`Production.cast`, `FirstTakeReceipt.cast`,
  `promiseOutcome`) with the member set observed at the decision; re-express purposes, never drop;
  a G10-b movement names the admitted person, promise and role; a moved row counts as G10 only if
  the RED's law-relative `ok` holds on the moved chain (otherwise a writer defect); the landing
  record lists moved winners/weeks for the Owner.
- **R2 attribution protocol for the post-fix RED:** expected 20 passed / 2 todo, OR 19 / 1 / 2
  where the ONLY failure is the default-seed digest (:406) with a moved row whose `pool` names a
  lawfully admitted non-actor member (`ok` true) → G10-b → test-author re-pins from receipts and
  turns todo :697 (or a new case) into the positive seam witness plan :233 asks for. Any other
  failure is a writer defect.
- **G-1 strategy gap (real at HEAD; outside this slice; product-level):** `authorRivalPromise`
  authors cast promises to any case subject including the rival's sole writer/director/craft; the
  sole director/craft are never seatable under `RIVAL_TEAM_ROLES`, the sole writer only on a
  picture written by someone else; those roots break at due — self-authored trust damage (seed-b
  r01-0/1/5 evidence). Disposition adopted: (B) accept as hypothesis cost now, recorded for the
  Owner; (A) a rival-only authoring exclusion goes to the expansion-review backlog with its own RED
  (it would move every natural chain after w196 on every seed). The seating slice proceeds.
- RED limits recorded: the RED cannot detect a seam omission (L1) — the parent verifies the seam
  hunk structurally; the RED adjudicates a member only when its window holds all of [W+1, W+8]
  (`ambiguous` otherwise); witness cost 309,545 of expected score on seed-b r01 f23 (Owner-visible
  hypothesis cost); R5 (actors-first ordering of `promised`) is a product option for the expansion
  review, NOT adopted.

## Writer 619-W release

Writable: `src/core/promises.ts` (the reader only, inserted after `promiseCastSlots`),
`src/core/hollywoodPolicy.ts`, `src/core/hollywoodTick.ts`. Nothing else (talentMarket.ts frozen;
no test, fixture, save, bridge, receipt, RNG, index export or timeout change). Two cumulative
patches: step 1 reader + chooser (D1 applied), step 2 the seam LAST (bisectable). Self-checks:
the RED file per R2; `tests/p14b4-cast-class-outcomes.test.ts` 23/23 (rivalWorlds still met on
seed-b w215 film 23; comment :211-216 goes stale, record-only); `npm run typecheck` EXIT 0. The
parent then runs the policy file, the natural-chain controls the note names, the capacity files
and the full core compared with 617/616, under record-check, before 619-R.
