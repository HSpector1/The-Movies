# D-17A — Decision Truth & Defect Closure — Closure Recommendation

**Status:** ACCEPTED — Owner / Engine PM ruling, 2026-08-12. Accepted state:
`79a9ab3bb9e31ed7d32c571a56d9cc07792ed72f`, annotated tag `d17a-decision-truth`; branch and tag
published to `hspector-github`. D-17B (Awareness Business Cycle & Reach Repair) authorized by the
same ruling. The findings and recommendation below are preserved exactly as recorded at candidate
completion.
*(Superseded line at acceptance: "CANDIDATE COMPLETE — Owner / Engine PM review required.")*
**Branch:** `d17-economy-truth-equilibrium` (this closure commit's parent: `08ee63d`; program base
`c679f88` = final D-16 HEAD; `main @ 33eb33ae` unchanged throughout). **Not merged to `main`. Not
pushed** (D-17 branch publication was not ruled; only the D-16 branch was published under R11).
**Authority:** `docs/D-16-OWNER-RULINGS.md`; `docs/D-17A-IMPLEMENTATION-CONTRACT.md` §1–§6a.
**Owner evidence:** `docs/D-17A-OWNER-EVIDENCE.md` (measured, rendered read-model values).

## 1. Delivered scope (T1–T13)

| T | Deliverable | Closure evidence |
|---|---|---|
| T1 | One runway, one burn, founding guard | Roster and Dashboard render the identical `72 wk` on the Week-86 save; the retired payroll-only rule reproduces the old `186 wk` exactly. Six burn/runway sites unified on `runwayOf()`. |
| T2 | One headline profit/break-even convention | Cycle-inclusive headline on both Assembly steps; every retrospective profit/result word names its direct basis; wrong-sign defect closed (live on the Owner's save: upside `$62K · Covers direct costs / −$486K after studio fixed costs`, previously green `Profit`). One revenue basis in BOTH regimes (never-engaged surfaces use the 100% basis). |
| T3 | Cycle-inclusive break-even + reconciling attribution | Sole-occupancy headline + named shared-occupancy line; ledger-driven pro-rata allocator, integer-exact: rendered reconciliation `allocated + idle === total ledger payroll+overhead` to the dollar, property-tested with a negative control. |
| T4 | Prospective commitment truth | Affordability scopes on Dashboard + Assembly from the recap's own action-parity builders; cash-now / cash-after / post-greenlight runway rendered. |
| T5 | Contract-obligation truth at signing | Hiring, renewal, AND founding-draft offers show term obligation + burn/runway consequence; predicted post-signing burn equals the actual next-tick charge (incl. the regime-flip overhead step). |
| T6 | Quantified discoverability exposure | Same-rule read-model (proved identical to `resolveReception`'s rule over a 240-point sweep); shortfall-derived band (not a blanket 0.2×/1.8× claim); regime-gated; the retired proxy demonstrably mislabeled both adversarial shapes. |
| T7 | Marketing truth | Steering language removed at both sites; copy reports measured capacity in dollar terms; diminishing-conversion claims gated on the engine's measured overexposure. No grid change. |
| T8 | Honest standing copy | Financier fiction removed (surfaces + engine doc comment); confidence narrated on its true gross basis as a no-mechanical-effect reputation signal. No formula change (`standing.ts` formulas byte-identical). |
| T9 | Greenlight-discipline legibility | Named, signed studio-economic line on both decision steps; measured on the Owner's slate: 9/9 films negative-center on both bases (one only −$174,592 direct but −$527,158 studio-economic). No ranking, no recommendation engine. |
| T10 | Engagement-cliff closure | `economyEngagedEver` (monotonic, persisted) + SaveFileV6; migration predicate proven exact for all five save classes; cliff-monotonicity proven on natural-expiry and fire-everyone paths; UI staffs/prices exactly what the engine accepts (post-review fix). |
| T11 | `releaseTalent` closure | D-12.11 amended (marked R3 amendment, history intact); regression test proves below-cash release is intended. |
| T12 | Stale-certification truth | See §3 — honestly recorded, NOT re-certified. |
| T13 | Recap consistency | Additive studio-economic layer + visible reconciliation; Contribution/ROI/classifier byte-identical (D-12 §8 honored). |

## 2. Verification (all re-run at the final candidate)

Full suite **1385/1385** (baseline 1125 + 260 added); d16 harness **102/102**; root+UI typecheck
clean; production build clean; tree clean. **Corpus invariance (the §4.F gate):** 300 seeds × 208
weeks × 16 policies — every player policy and the oracle **float-for-float identical** from the
pre-implementation baseline to the final candidate; the fix-pass re-run is byte-identical to the
post-implementation run except the run name. The single intended change: **P15 exploitDisengage
collapsed** ($146.22M median → $16.03M; 44 films → 0; rejected actions 0 → 60,600). P15's rows are
**empty, not shifted** — the invariance claim covers the 14 player policies and the oracle.

## 3. T12 — honest certification status (Lesson BC applied)

The D-12 integrated balance gates were re-run at the analysis-base code AND at the candidate:
**verdicts identical and FAILING at both** (G1 fail, G2 partial, G3 fail, G4 fail; Y3 median final
cash negative for all seven strategies — bargainBasement −$0.7M through largeDepth −$16.9M). The
recorded D-12 PASS certification is stale, exactly as D-16 §13.1 found. D-17A is truth-only and
did not attempt to move these; **re-certification is D-17B's to earn.** The only numeric movement
is in the Y5 (260-week) rows, where the week-208 contract wall no longer disengages the economy —
the intended R2 consequence. Artifacts: `out/economy-balance/integrated-summary.json` in both the
lab and D-17 worktrees.

## 4. Process record

Phase-0 audits (migration proof — HELD, no STOP; accounting design — R7 satisfied, no STOP;
finance-source inventory with corrections adopted into §6) → Phase E (engine+save; two builders)
→ independent adversarial test authorship (83 contract-derived tests, **zero findings**) → Phase U
(truth surfaces) → five-lens adversarial review (1 BLOCKER, 6 MAJOR, 9 MINOR — **all adjudicated
and fixed**, closure proven by inverting the reviewers' own probes) → fix pass → final regression
+ corpus invariance → Owner evidence package. The BLOCKER (UI staffing/pricing on the retired
predicate post-cliff) reversed one of the PM's own §6 instructions; the reversal is recorded in
§6a and distilled as Lesson BL.

## 5. Residuals and accepted limitations (recorded, none blocking)

1. Save-validator ledger-integer gap: a hand-corrupted import with fractional payroll/overhead
   throws loudly from the allocator (contained by the error boundary) rather than being rejected
   at import — **accepted as designed** (§6a); the engine cannot emit such a ledger.
2. `src/harness/d16/policies.ts:684` comment and `view.ts:409` field are stale post-R2 —
   instrument byte-identity governs this milestone; D-17B may modernize the harness under its own
   ruling (the +18 `DISC_*`/`MARKETING_*` allowlist keys from D-16 §13.4 are likewise deliberately
   still pending — first D-17B harness task).
3. `packages.test.ts`'s old forecast-vs-realized commensurability coverage narrowed by necessity
   (the exploit produces no films to measure).
4. `marketingReachCeiling` is not a `computeBoxOffice` return; the shipped copy reports capacity
   and quality truthfully without it. Adding the literal figure needs a reception return-shape
   addition — out of D-17A scope.
5. `scripts/*.mts` are outside both tsconfigs (pre-existing); headers corrected.
6. Dashboard recent-releases and Film Record show the direct basis with the basis named; the full
   studio-economic per-film figure lives on the recap (allocator-backed) and prospectively on
   Assembly. Extending allocation to those two surfaces is optional D-17B-adjacent polish.

## 6. Lessons

**BJ finalized** (condition met: R2 recorded + correction implemented and proven). **BL added**
(a regime-predicate split must be carried through every consumer that feeds an action). **BE, BK
remain DRAFT** per Owner direction (through D-17B).

## 7. Recommendation

Accept D-17A as the decision-truth foundation: the economy's information surfaces now tell one
coherent, measured story in both regimes, the engagement cliff is closed with its exploit dead,
and the D-16 instrument re-proves the macroeconomy untouched. The known-unhealthy balance
(negative-sum normal play, no awareness equilibrium) is **unchanged by design** and is exactly
what D-17B exists to repair. Recommended next Owner actions: review the evidence package; rule on
D-17A acceptance and branch publication; authorize D-17B.
