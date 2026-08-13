# D-17B — Candidate Design Contract

**Status:** FROZEN for independent review (ruling §22). No production formula may change until this
contract survives attack. Authority: `docs/D-16-OWNER-RULINGS.md` (R4/R5/R6/R9/R10),
`docs/D-17B-PROGRAM-LOG.md` (Phase-A gate), the Owner's D-17B authorization. Evidence: the Stage
1–9 lab record (run inventory in the program log's scratchpad references; every number below is
from an executed corpus or an exact re-simulation).

## 1. Selected counter-flow family

**Family C, one-sided ("attention drifts back toward the industry norm"):** each engaged week,
`awareness' = awareness − κ·max(0, awareness − ANCHOR)` with **κ = 0.04/week, ANCHOR = 35**.
Deterministic, no RNG, engaged-gated, applied as a new tick step AFTER standing updates. Constants
in TUNING (`AWARENESS_DRIFT_RATE`, `AWARENESS_DRIFT_ANCHOR`). Pull-down only — it acts solely on
studios above the anchor and never hands a losing studio anything (structurally the opposite of
rubber-banding). Measured role: with `AWARENESS_REACH_NEUTRAL 0.45` it takes corpus-wide
floor-week share 18.32% → 2.47% and awareness ceiling absorption to 0.00% for all 24 policies
while the ±6 delta cap and D-6 formula stay untouched (rev4 law).

**`AWARENESS_REACH_NEUTRAL: 0.58 → 0.45`** (R4 grant). The Stage-1 decomposition is the design's
spine: N does the recovery-side work, the drift does the anti-runaway work; both are required
(N-only arms fail ceiling absorption 0.24–0.31; drift-only arms leave the floor at baseline).

## 2. Selected publicity mechanic (menu R21)

One player action, three qualitative tiers, engaged-only, solvency-gated by `canAfford`, integer
dollars, immediate effect, no RNG. Lift = `maxLift · (1 − awareness/100)^6` (steeply
awareness-dependent: real in an emergency, worthless as maintenance-spam):

| tier | cost | maxLift | cooldown |
|---|---|---|---|
| Whisper campaign | $1,200,000 | 18 pts | 8 wk |
| Push | $3,600,000 | 30 pts | 12 wk |
| Blitz | $8,000,000 | 42 pts | 20 wk |

Global cooldown 6 weeks. Price per point: $67k at A=0 → $884k at A=35 → $1.43M at A=40
(break-even for lifetime value ≈ $560–700k/pt crosses at A≈30–33). Measured acceptance (red-team
condition C1, all three parts): (a) 208wk — the maintenance-rule arm beats its host on 51.0%
[45.4, 56.6] of paired seeds (+$5.07M mean [+4.16, +5.99]); conditional on the rule ever firing,
83.2% win, +$4.70M median; (b) from the 180 verified distress states, buyers' median paired Δ
+$0.33–0.51M and **durable recovery @+103wk moves 0/180 → 15.1% [10.6, 21.1]** (13–14 of 27
worlds, three entry classes; paired no-publicity control stays 0/180); (c) 312wk spam adversary
loses (39.0% paired win, median −$4.39M).

**Owner disclosures (rule, don't absorb):** C1(a) passes at the point estimate only (CI includes
50%; the conditional statement is the robust one). C1(c)'s pooled pass is substantially
wall-mediated — in the 55% of 312wk worlds where the week-208 roster wall never binds, spam still
wins 65.5%; this is structural (awareness is a permanent asset whose value scales with remaining
films) and NOT tunable inside the authorized family; if the wall is ever repaired, re-run C1(c).
Band-maintenance (Q6) marginally edges need-based buying (Q1) — a real, disclosed residual.

## 3. Selected D-13 shape family (R5) — with the surprise trade presented for ruling

RNG: **keep `discovery-v1`** (constants-only change; the stream is a per-production derived
N(0,1); re-keying is reserved for functional-form changes). Engaged-gated ⇒ M0A byte-identity by
construction. Three tuples on the measured frontier (exact re-simulation, n=54,882; corpus
confirmation at 300×208):

| | (i) MAX-REPAIR | **(ii) BALANCED — candidate** | (iii) SURPRISE-FIRST |
|---|---|---|---|
| T / SPREAD / EXP / FLOOR | .375 / 2.5 / 1.5 / .35 | **.375 / 4.0 / 1.5 / .30** | .45 / 3.5 / 2.0 / .20 |
| breakouts ≥1.8× (shipped stack) | 1.8% | **3.3%** | ~5.0% (harvest) |
| disasters <0.5× | 1.3% | **2.6%** | ~3.8% |
| sign-flips (was 17.1%) | 4.1% | **5.6%** | 9.3% |
| G4 cost-deciles >40% | 0/10 | **0/10** | 0/10 |
| cost-quartile sd inversion (Q4/Q1) | 0.267 | **0.313** | 0.318 |

**(ii) is the candidate**: it buys back +83% of breakouts and +100% of disasters for ~1.5pp of
sign-flips at zero economic cost (all policy medians, distress, runaway, G1/G9 unchanged in the
300×208 confirm). (i) and (iii) stay on the table for the Owner's final ruling; the §10-D cost of
every tuple vs HEAD (baseline breakouts 11.4%) is named, not hidden. The floor raise is honestly
labelled worst-case truncation — it does NOT fix survivability (~96% inert; the unsurvivability
is economy-level ROI).

## 4. Selected marketing grid (R6)

**Capacity-anchored menu: rungs = {1.3×, 2.4×, 3.7×} of the film's measured efficient marketing
capacity** (the same engine value the D-17A `marketing-capacity` surface already renders), rounded
to the nearest $25,000. Measured: max-optimal share 38.7% (best of every menu tested; fixed
candidates 39.8–61%), zero dead rungs, declining marginal returns in 100% of states, rung shares
stable across awareness bands (45.8%/45.4% low/high), and it preserves distressed access (9.4% vs
5.0–7.2% for gate-passing fixed triples) because low awareness ⇒ low capacity ⇒ a small bottom
rung exactly where it is needed. Post-lab-fix, CAP beats FIX on 11 of 14 player arms (+$0.23M
pooled median [+0.14, +0.35]).

**Blocking presentation rule (red-team C4):** the UI must render (a) the film's efficient
capacity as a dollar figure, (b) each rung as dollars AND as its multiple of that figure, (c) the
same capacity figure on the pre-greenlight surfaces — without the anchor on screen this menu is a
slot machine; with it, it is the most legible menu measured. The disengaged/M0A path keeps the
legacy `{100k, 400k, 1M}` array (byte-identity). `studioRunRecap`'s `STANDARD_MARKETING`
hardcode is fixed to resolve from the active menu (Lesson BL).

**Honest gate note:** no menu, fixed or anchored, meets the historic ≤~35% max-optimal bar; 38.7%
is the measured frontier. Restoring the bet-the-studio campaign needs menu breadth (D-16 finding,
out of scope — §34).

## 5. Save / versioning

New `LedgerKind: 'publicity'` (compile-guarded `financeTotals` extension; `periodSummary` folds it
into `otherCash` by its default branch — documented). Persisted publicity state: per-tier
last-used week (`publicity: { lastUsedWeek, byTier }` on `GameState`) → **SaveFileV7** (deliberate
bump per §24 and house precedent; `convertV6ToV7` adds empty publicity state — nothing guessed,
deterministic, idempotent, `rngState` untouched). Replay determinism mandatory; no new RNG
anywhere in the milestone.

## 6. Acceptance metrics (the §26/§29 gate)

1. **Implementation-vs-lab agreement:** the implemented production system, run through the same
   corpus commands WITHOUT lab shims, must reproduce the lab's final-stack numbers (floor-week
   share, floor absorption, anti-spam pair, durable-recovery table, multiplier distribution)
   within stated statistical tolerance — the lab predicted the product; agreement is the proof.
2. **M0A byte-identity** (all changes engaged-gated) + full replay/save determinism + D-17A
   regression list (§25: one runway, cycle-inclusive headline, wrong-sign, action parity,
   affordability scopes, hiring obligations, discovery-exposure truth (re-pointed at the new
   constants), marketing truth (updated to the anchored menu), standing truth, engagement
   monotonicity, releaseTalent, recap reconciliation).
3. **Full G1–G12 table** with Stage-8's corrected operationalizations (named menus, CIs on small
   rates, per-run medians, asinh variance shares) — expected honest outcome: G4 PASS, G5 moves,
   G8 moves for publicity-using and forecast-driven play with the Stage-5 durable-recovery repair
   measured, G9 partial, G10 PASS non-vacuously, G1/G3/G6/G7/G11-cash/G12 reported as
   FAIL/PARTIAL/unchanged per the measured record — **partial success reported exactly (§27),
   never smuggled**.
4. The D-17B-specific gates: anti-spam pair, maintenance bound, floor-escape existence, interior
   residence, awareness ceiling absorption 0, P16 cash byte-stability.

## 7. Rejected alternatives (measured, recorded)

Pure decay families A/B/E as sole counter-flow (a tax on a falling stock; E's idle-keying is
anti-correlated with runaway); N-only and drift-only stacks (each fails the other tail — Lesson
BK enforced); publicity menu EMG2 and the entire flat/cheap menu family (spam-dominated) and
steep-but-small-lift menus (distress traps); fixed marketing triples incl. {300k,700k,1.5M} and
{200k,700k,2M} and {300k,850k,2.5M} (dominance or distress-access failures); DISC SPREAD 3.0–3.5
with FLOOR 0.25–0.30 (misses the surprise floor). Reference-measured UNAUTHORIZED families
(two-sided mean-reversion, loss-leg damping, endogenous EMA pivot) outperform on raw economy but
substitute for the paid action (publicity purchases → 0) and remain excluded; reported under §27.

## 8. §34 structural report-outs (not repaired here)

Economic immortality at the top (0/720 top-decile runs end below opening across every arm/horizon/
grid; needs a size-scaling cash sink — R10-deferred); the week-208 roster wall (36.4% of 312wk
player runs; 100% cash-gated renewal failures); menu breadth / bet-the-studio moments (D-16); G1a
P5 pairwise dominance 66.3%; G3 regression (policy share of end-cash variance falls 0.269 → 0.217
— the healthier economy is more world-determined); the awareness meter's practical band is ~0–57
of a nominal 0–100 (UI must state the practical band — truth law); the truthful drift narration
(the counter-flow supplies ~10% of a working studio's awareness decline; releases below the
awareness-neutral gross supply ~90% — UI copy must say what actually moves the stock).
