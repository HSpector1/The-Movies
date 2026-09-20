# 578 — Owner / Current Ops decision packet: D1, D2, 515 §6 and the 576 bound (consolidated; non-blocking)

2026-09-21. Claude Code parent. This packet consolidates the open decision items the headless
program has recorded since the Owner transfer (records 515 §6, 537 §3, 538-C §2, 574, 576) so the
Owner or Current Ops can rule on them in one sitting. Nothing here is adopted by the parent; the
parent's only recommendation is the one already recorded under D1. Every number is a measured or
committed fact with its record; every option is one the records already state. The program
continues meanwhile on the parallel track (record 576 "Disposition"); no live wiring, version
stamp, save/projection movement, cap, tariff or test loosening follows from this packet.

## What is committed and qualified WITHOUT Owner acceptance (state at HEAD bb6bcb31)

| Item | Record | Identity | Status |
| --- | --- | --- | --- |
| Detached owner-adapter first slice (`src/core/promiseCapacityOwners.ts`) | 553 | published `e753da22` | qualified checkpoint; contract-auditor KEEP |
| B2 poaching fixture reconciled under the accepted D3 law | 556/557 | published `e33022fb` | qualified; bridge B2 trust suite green |
| Detached enumerator slice (`src/core/promiseCapacityEnumerator.ts`, adapter 5th parameter) | 574 | published `00fd237c` | qualified checkpoint; contract-auditor KEEP, nine record-only items |
| Started-alternative bill measurement | 576/577 | published `bb6bcb31` | measurement only; no source change |

Designated failures that stay RED by design or by record: `tests/p14b4-ready-replay-stale-target.test.ts:234`
(the 302 stale route; 515 §6), `tests/p14b1-trust-chooser.test.ts` test 6 (record 110/554; migrates
at the coordinated tagged-P2 activation), `tests/bridge-p14b4-cast-class.test.ts(364,20)` OLD
TS2353 (bridge tsc), and the live-P2/kernel groups' 83 failures (the kernel-vocabulary cases
behind D1; byte-identical since record 536).

Not started and not startable by the parent: live wiring of the adapter/enumerator into the
offer path, `PROMISE_RULES_VERSION 4`, Save30 / projection 47 / the class-selection wire contract,
native/Unity work, Owner acceptance.

## The four items

### D1 — evaluator-4 definition and sequencing (537 §3; the prior question)

Question: what does evaluator 4 mean at launch? The installed RED pins `rulesVersion 4` on scalar
reads; the plan defines evaluator 4 as residual capacity plus the bounded joint certificate; the
measured budget (D2) makes that certificate unreachable for ordinary long-window offers under the
200000 hypothesis.

Options (verbatim intent of 537 §3):
- (a) Amend the plan: evaluator 4 = class-restricted fixed-seat paths + shared residual capacity
  on the existing count-family scalar; the kernel joint certificate and the UNCERTIFIED→FRAGILE
  mapping become evaluator 5. P2 launches on the same minimum-countdown heuristic P1 has under
  rules 3 (parity, not certification); the test-author reconciles the B-F2/B3 pins and disposes
  the kernel-vocabulary capacity cases. **Parent recommendation: (a), implemented INSIDE the
  coordinated core/save/runtime/wire cutover (26 §2–§4), not as a pre-cutover era.**
- (b) Hold 4 for the kernel-backed service: the capacity/outcomes/policy cases and every downstream
  cutover case stay unreachable until an owner adapter with a complete enumerator exists and D2
  is answered; live P2 waits on that. Records 553/574 now supply the adapter and an enumerator
  whose certificates are bounded to windows within `now + 5` (574) and, for unforced pictures,
  `now + 2` (576); ordinary launch windows stay UNCERTIFIED.
- (c) Revisit the computational hypotheses (cap/tariffs; 515 §6) so the certificate route can fit
  ordinary offers, then keep 4 as defined.
Why it is a product decision: (a) changes what an offer's ACHIEVABLE means at launch (plan
:361-363).

### D2 — the kernel budget (538-C §2; concrete, measured)

Facts: one hand-written Ready plan costs 182925 of the 200000 shared units on the first-take
fixture (534/535); Ready admission on any history-bearing world saturates the cap under the
adopted 162 §2 native Map/Set metric (538/538-C: ≥ 74 ID occurrences at width 37); one admission
per trace at source-now makes the plan's achievable probe (B = X + ceil(X/3)) structurally
unwitnessable for a fresh world. What fits today: the fixed-cast 2-week cells and the
conflicting-claim case (≤ 112722; now certified through the enumerator, 574) and, for an unforced
started picture, only windows ending at `now + 2` (576: k=2 145876; `now + 3` ≈ 253k, `now + 4`
≈ 444k, cut at the second plan).

Options (538-C §2, unchanged): (i-a) a same-metric refinement direction record (`min(i, D)` with
paid dedup and actual spans; ≈ 139k+ on paper, likely insufficient alone); (i-b) a different
native-collection metric (a clarification of 162 §2); (i-c) accept that certified offers exist
only on history-free or short-window states and keep 200000 as the exact boundary; (i-d) revisit
the hypothesis itself (plan :306-308 calls it a hypothesis for audit/measurement); (ii) a
direction record for a multi-admission or deferred-admission grammar (the certificate's meaning
changes; review + decision item) or keep the plan's UNCERTIFIED → non-offerable FRAGILE
extension as the launch behaviour, which then interacts with D1. No parent recommendation; the
parent will not touch caps or tariffs.

### 515 §6 — the 302 stale route and the tariff clarifications C9/C10

Facts: the stale Ready route (`tests/p14b4-ready-replay-stale-target.test.ts:234`, expected
`commandRefused`, receives `workLimit`) cannot be closed by the lawful-as-written reductions
C1–C7 (≈ 23–26k gross against a LIKELY gap of 31–35k; 515 §3). Options: (a) authorize the two
engineering-law clarifications C9 (merge-sort head-comparison bound) and C10 (token output span
via a paid escape-free pre-scan), ≈ 9k gross, which with C1–C7 reaches the gap only marginally;
(b) rule on the 302 control itself (horizon, route or cap), which the parent does not propose and
will not touch; (c) keep the route RED as a recorded exact boundary while the rest of B4 proceeds
(the current state). The parent proceeds with C6/C7 (then C5, then C1) regardless, because they
lower every bill lawfully (record 576 "Disposition", record 579 to follow); they do not decide
this item.

### The 576 bound (new; informs D1/D2, needs no separate ruling)

The detached certificate track is at its lawful bound: the enumerator certifies started-picture
domains for windows within `now + 5` when the picture is filmed, forced or floor-bounded, and the
unforced-picture alternative set fits the cap only for windows ending at `now + 2`. Every further
certificate needs D1 (live wiring), D2 (the Ready admission bill) or a budget/tariff ruling
(515 §6). If the Owner wants certified ordinary offers, the ruling is D2 (i-b)/(i-d) or 515 §6
(b), not more detached engineering; if the Owner accepts D1 (a), the certificates already
landed become evaluator-5 material and nothing further is needed before the coordinated cutover.

## What a ruling unlocks (so the sequencing is visible)

- D1 (a): test-author reconciliation of the B-F2/B3 rules-3 pins and the kernel-vocabulary
  cases → the coordinated core/save/runtime/wire cutover (Save30, projection 47, class selection)
  under a fresh writer release; the 83 live-P2 failures become reachable work.
- D1 (b): nothing until D2 and a Ready staffing enumerator (D2-gated).
- D2 (i-b)/(i-d) or 515 §6 (a)/(b): re-measure 538/576 under the clarified metric/cap; if the
  now+3..now+5 sets fit, the unforced-picture slice and the Ready staffing enumerator become
  lawful detached slices again.
- Nothing ruled: the parallel track (C6/C7, C5, C1) continues; all four items stay open; the
  program's bounded engineering ends when the parallel track is exhausted.

## Evidence pointers

515 §3/§6; 534/535 (first-take fixture bill); 536/549/570 (the live-P2 failing set, byte-identical
across three checkpoints); 537 §3 (D1 text); 538/538-C (measured budget; D2 text); 553-R and 574-R
(independent reviews); 576/577 (the alternative-bill rows, 65 deterministic lines). Every record
lives in `docs/engineering/playability-launch-review/evidence/p14b4-20260919/`; the shared
status block in the five header files points here.
