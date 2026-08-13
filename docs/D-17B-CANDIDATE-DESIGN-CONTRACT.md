# D-17B — Candidate Design Contract (rev. 3 — §2/§6 restated on the exact final stack)

**Rev. 3 note (2026-08-13):** the first full-stack reference corpus (`d17b-final-reference`) was
DEFECTIVE — its publicity config carried `saturation: 1` (a percent scale; lift ≡ 0 for any
awareness ≥ 1), so its seven buying arms measured pure cash burn. A focused verification
(SHA-replicated apparatus; pinned pre-Phase-E snapshot) re-measured §2 on the exact final stack at
the correct `saturation: 100`: **C1(a) PASSES** — the break-even-tuned buying rule (buy below
A≈30, the menu's own break-even) wins 67.3% [61.8, 72.4] of 300 paired seeds, mean +$11.16M,
median +$5.40M, 5.18 buys/208wk; the untuned Q6 (floor 20, below break-even) misses ≥50% by one
seed at 208wk and wins 61.5% [54.6, 68.0] at 312wk (awareness is a durable asset; the 208wk
knife-edge is horizon-limited). **C1(b) HOLDS on the exact stack:** durable@103 0/180 → Q6 14.5%
[10.1, 20.4] over 15 worlds / Q1 13.0% / Q5 10.6%; both paired controls and a fresh no-lever
control 0/180 (UB 1.7%); ends-insolvent 100%→85%; residual failure 100%→41.9%. **C1(c) PASSES
re-measured:** Q7 vs Q0 38.5% [32.0, 45.4], median −$4.82M, mean +$0.90M. Week-86 story
unchanged (§21). The §2(a)/(b) figures in the body below were measured on DISC tuple (i) and are
superseded by these; §6.1's reference corpus is **`d17b-final-reference-sat100`** (the defective
run's 17 non-buying policies are bit-identical and remain valid; its Q1–Q7 rows are invalid).
Phase-H lab guards required: `publicityKey` must encode `saturation`; `validatePublicity` rejects
`saturation < 50` as probable fraction/percent confusion. The publicity panel should surface
price-per-point and the ~A30 break-even band so the player can locate the profitable-use line
(§15's honest decision story: buying below ~A30 is profitable, above it is not, spam loses).

**Status:** SURVIVED INDEPENDENT ATTACK WITH AMENDMENTS (all 6 blockers, 9 majors, 9 minors
incorporated below; reviewer verdict recorded 2026-08-13). Production implementation is authorized
against THIS revision. Authority: `docs/D-16-OWNER-RULINGS.md` (R4/R5/R6/R9/R10),
`docs/D-17B-OWNER-AUTHORIZATION.md` (the Owner directive this program executes),
`docs/D-17B-PROGRAM-LOG.md`. Every number traces to the lab record; the independent reviewer
re-verified 21 load-bearing figures to the digit.

## 0. Escalations — Owner rulings REQUIRED at review (none blocks implementation; each has a
recorded fallback)

- **E1 (R4 extension):** `AWARENESS_REACH_NEUTRAL` is NOT engaged-gated at HEAD
  (`standing.ts:107`; tick step 4 ungated; the disengaged reception branch reads awareness).
  The pivot ships as `engaged ? 0.45 : 0.58` inside `updateStanding` — preserving M0A
  byte-identity and every measured number — but a regime split inside a D-6 channel formula is a
  change to a protected channel's applicability and needs an explicit R4 extension. Fallback if
  declined: unconditional 0.45 with the M0A corpus re-baselined and the byte-identity gate struck.
- **E2 (R6 kind-extension):** the capacity-anchored menu is a change of menu KIND (state-dependent
  rungs), not of constants; R6's text names dollar triples. The evidence supports the anchored
  menu (no fixed triple clears the gate; 38.7% is the measured frontier) but the Owner must rule
  that R6 extends to it. Fallback: the best gate-passing fixed triple `{350k, 775k, 1.525M}`
  (39.8% max-optimal) — in-grant, inferior on distress access and stability.
- **E3 (Lesson-BK ruling):** the candidate fixes the floor tail and **roughly doubles the
  cash-runaway rate** (§8 item 1). The Owner must rule whether that is an acceptable D-17B
  outcome given the repair needs a size-scaling cash sink that R10 defers.
- **E4 (SaveFileV7):** R2 authorized V6 only. V7 is plainly required for publicity state and
  `convertV6ToV7` seeds empty state (nothing reconstructed), but the bump is REQUESTED here, not
  asserted.
- **E5 (DISC tuple):** candidate (ii) BALANCED; (i) MAX-REPAIR remains the lower-variance option.
  (iii) SURPRISE-FIRST is **strictly dominated by (ii) on the like-for-like harvest** (5.0% vs
  5.2% breakouts at 9.3% vs 7.5% sign-flips) and stays only as a lower-repair option.

## 1. Selected counter-flow family

**Family C, one-sided:** each engaged week, `awareness' = awareness − κ·max(0, awareness − ANCHOR)`
with **κ = 0.04/week, ANCHOR = 35**. Deterministic, no RNG, engaged-gated, constants in TUNING
(`AWARENESS_DRIFT_RATE`, `AWARENESS_DRIFT_ANCHOR`). Pull-down only — it acts solely on studios
above the anchor (structurally the opposite of rubber-banding). **Placement (measured, binding):
a new engaged-gated step 5.5, immediately after BROADCAST and before DEVELOPMENT** — the placement
the lab measured (`driver.ts:807-841` applied it post-tick, i.e. after BROADCAST); step 4.5 would
change what BROADCAST observes and is an unmeasured variant. D-12 §9 ("insertions; no reordering",
`docs/D-12-economy-contract.md:129`) permits the insertion.

**`AWARENESS_REACH_NEUTRAL: 0.58 → 0.45`**, shipped as the E1 regime split. Decomposition (the
design's spine): N does the recovery-side work, the drift the anti-runaway work; both required —
N-only arms reach awareness ceiling absorption up to 0.410/0.520 on the full 24-policy menu
(0.24–0.31 excluding P15; menu named per Stage-8 rule); drift-only leaves the floor at baseline.
Measured jointly: corpus floor-week share **18.32% → 2.26%** (`d17b-s3-baseline300` →
`d17b-s3b2-DISCii`; the pre-lab-fix run measured 2.47%), awareness ceiling absorption 0.00% on
all 24 policies, the ±6 delta cap and D-6 formula shape untouched.

## 2. Selected publicity mechanic (menu R21)

One player action, three tiers, engaged-only, `canAfford`-gated, integer dollars, immediate, no
RNG. Lift = `maxLift · (1 − awareness/100)^6`:

| tier | cost | maxLift | cooldown |
|---|---|---|---|
| Whisper campaign | $1,200,000 | 18 pts | 8 wk |
| Push | $3,600,000 | 30 pts | 12 wk |
| Blitz | $8,000,000 | 42 pts | 20 wk |

Global cooldown 6 weeks. Price per point $67k at A=0 → $884k at A=35 → $1.43M at A=40; the
lifetime break-even ($560–700k/pt) crosses at **A≈30–32**.

**Measured acceptance (statistics stated BOTH ways — reviewer B4):**
(a) 208wk — `Q6_awarenessMaintenance` beats its host `P3` on **51.0%** [45.4, 56.6] of 300 paired
seeds; **mean Δ +$5.07M [+4.16, +5.99], median Δ +$0.19M** (the mean is tail-driven); conditional
on the rule ever firing (184/300) **83.2% win, median +$4.70M**.
(b) 180 verified distress states — the all-states median Δ is **exactly $0.00M** for all three
buying arms (the median test passes on ties, not effect); buyers' medians **Q1 +$0.51M, Q6
+$0.33M, Q5 −$0.79M** (the emergency rule is still net-negative for its buyers);
`durableRecovery@103` moves 0/180 → **Q6 15.1% [10.6, 21.1] — 27 successes over 15 of 27 worlds**
(Q1 13.6% over 13, Q5 11.7% over 11; strict form Q6 11/180 over 9 worlds); both paired
no-publicity controls stay **0/180**.
(c) 312wk — `Q7` spam vs `Q0`: **39.0% [32.5, 45.9] paired win, median −$4.39M, but mean
+$1.10M** — the adversary loses the typical world and wins on average; and in the 55% of worlds
where the week-208 roster wall never binds, spam still wins 65.5%. The pooled pass is
substantially wall-mediated; if the wall is repaired, re-run C1(c). This is structural (awareness
is a permanent asset whose value scales with remaining films), not tunable in the family.

**Further disclosures:** Q6 edges Q1 by 11.3pp at 208wk (not marginal; 63.5% vs 61.0% at 312wk
is). **Tier usage:** whisper 49.0%, push 45.7%, blitz 5.3% of buys; blitz is bought ONLY by the
adversarial max arm, push only by Q2/Q4/Q5/Q7; the C1(a)-passing Q6 buys whisper exclusively —
for competent play the measured mechanic is one rung and the ladder is presentational. The Owner
sees this before accepting the three-tier shape.

## 3. Selected D-13 shape family (R5)

RNG: **keep `discovery-v1`** (constants-only; re-keying reserved for functional-form changes).
DISC constants are engaged-gated by construction (`reception.ts:643`) ⇒ M0A-safe. All three
tuples on ONE measurement base per column (reviewer M5) — corpus = 300×208 full stack; harvest =
54,882-release exact re-simulation:

| | (i) MAX-REPAIR | **(ii) BALANCED — candidate** | (iii) dominated |
|---|---|---|---|
| T / SPREAD / EXP / FLOOR | .375 / 2.5 / 1.5 / .35 | **.375 / 4.0 / 1.5 / .30** | .45 / 3.5 / 2.0 / .20 |
| corpus breakouts / disasters / flips | 1.8 / 1.3 / 4.1% | **3.3 / 2.6 / 5.6%** | not corpus-measured |
| harvest breakouts / disasters / flips | 3.0 / 2.1 / 5.7% | **5.2 / 4.1 / 7.5%** | 5.0 / 3.8 / 9.3% |
| G4 cost-deciles >40% | 0/10 | **0/10** | 0/10 |
| cost-quartile sd ratio (Q4/Q1) | 0.267 | **0.313** | 0.318 |

Baseline (no levers): breakouts 11.4%, disasters 9.5%, sign-flips 17.1%. (ii) buys back +83%
breakouts and +100% disasters vs (i) for ~1.5pp of sign-flips at zero economic cost (policy
medians, distress, floor absorption, G1/G9 unchanged in the 300×208 confirm). The §10-D cost vs
HEAD is named, not hidden; the floor is worst-case truncation only (~96% inert for survivability).
**D-17A surfaces that must be RE-MEASURED (not edited) in the same change (reviewer M6):**
`docs/D-17A-OWNER-EVIDENCE.md` §3.4/§4.1/§7(b) and `docs/D-17A-CLOSURE.md:24` (the
`CAPACITY_COLLAPSED` fixture, support 0.38376, ceases to be exposed at T=0.375);
`tests/d17a-adv-discovery.test.ts` needs a new adversarial fixture below the 0.375 threshold;
`ui/src/screens/d17a-decision-truth.test.tsx:606-612` and `DiscoveryExposure.tsx` band rendering
(0.3×/1.8× after).

## 4. Selected marketing grid (R6) — the change of menu KIND is escalated (E2)

**Candidate: capacity-anchored rungs {1.3×, 2.4×, 3.7×} of the film's measured efficient
marketing capacity, computed EXACTLY as the lab measured it** — `Math.round(multiplier ×
capacity)` with strictly-ascending +$1 guards (`run-d16-corpus.ts:124-129`); any display rounding
is presentational only and must not change the charged amount (a $25k quantum collides rungs at
`MARKETING_CAPACITY_MIN` and would invalidate every measurement — reviewer B6).

Measured: max-optimal share 38.7% (fixed candidates 39.8–61%), zero dead rungs, declining
marginal returns hold across states on the coarse-rung reading — with the disclosure that the
top rung's median MRR(2→3) is **1.003 / 0.640 / 0.534** by awareness band (it does not pay for
itself where most decision weight sits; that is what "not universally dominant" costs);
**max-optimal share by awareness band 45.8%/45.4% low/high** (band-stability of the max-share,
above the 38.7% pooled headline and the historic ≤35% bar — disclosed); distressed access
**9.4%**, vs 5.0–7.2% for gate-passing fixed triples but **10.0% for the current shipped grid** —
the selected menu slightly reduces distressed access vs the grid it replaces (the current grid
buys that access with a dead rung and 60.5% dominance). Post-lab-fix, CAP beats FIX on 11 of 14
player arms (+$0.230M pooled median, seed-clustered [+0.158, +0.350]).

**Blocking presentation rules:** (a) capacity rendered as a dollar figure on package AND
pre-greenlight surfaces; each rung as dollars AND multiple; (b) **the campaign-status band and
overexposure copy must be re-derived against the anchored menu** (reviewer M1:
`OVEREXPOSURE_THRESHOLD 1.3` equals the bottom rung multiple — under the candidate the
'Underexposed'/'Efficient campaign' labels are unreachable and the top rung is at full
overexposure by construction; `adapter.ts:3155-3162`, `Assembly.tsx:1300-1305`,
`filmPackage.ts:787-791` must state the truth of the new menu). The disengaged/M0A path keeps the
legacy array (byte-identity). `studioRunRecap`'s `STANDARD_MARKETING` hardcode resolves from the
active menu (Lesson BL).

## 5. Save / versioning / ledger

New `LedgerKind: 'publicity'`: `financeTotals` extension is compile-guarded (verified); ADDITIONALLY
(reviewer M3, binding): an explicit `case 'publicity'` in `periodSummary` (its `default:` is
silent) and a rendered publicity line in `WeeklySummary.tsx`; a `never`-guard on `LedgerKind`
switches (idiom at `actions.ts:1288-1289`); `save.ts` `ENGAGED_KINDS` retyped
`ReadonlySet<LedgerKind>` with membership decided explicitly (publicity IS engaged-only ⇒ add it);
and the recap's treatment stated: **publicity is a studio-level cost, NOT a per-film commitment —
it does not enter `totalCommitments`/`totalFilmContribution`/`studioEconomicResult`; it gets its
own line in the recap capital story and the cash timeline carries it via the ledger.** Integer
dollars enforced at the write site (the allocator's guard never sees this kind).
**SaveFileV7 (E4):** `GameState.publicity = { lastUsedWeek: number | null, byTier: Record<tier,
number | null> }`; `convertV6ToV7` seeds the empty state; deterministic, idempotent, `rngState`
untouched; `validateSave` dispatch + message updated; **`adapter.ts:1959`'s `saveVersion !== 6`
banner check updated to `!== 7`** (reviewer M8 — silent hazard); the frozen-shape V5/V6 test
fixtures must strip the new field EXPLICITLY so migration tests stay non-vacuous (M8's second
hazard). Replay determinism mandatory; no new RNG.

## 6. Acceptance metrics

1. **Implementation-vs-lab agreement against the named reference corpus `d17b-final-reference`**
   (300×208×24, the EXACT final stack: drift C κ.04/35 + N 0.45 split + DISC (ii) + CAP
   1.3/2.4/3.7 + publicity R21 — reviewer minor-8: no prior single run held the whole stack).
   Tolerance: policy median end cash within the seed-bootstrap 95% band of the reference; rate
   metrics (floor absorption, distress, runaway, durable@103) within ±2pp or overlapping 95%
   CIs; anti-spam/maintenance gate verdicts identical.
2. **M0A byte-identity** via the E1 regime split (if E1 declined: re-baseline, gate struck) +
   replay/save determinism + the full D-17A regression list, WITH the M6 re-measurement list.
3. **Full G1–G12 table** under Stage-8 discipline. Expected honest outcome: G4 PASS; **G5 not
   measured in D-17B — D-16's "not fixable balance-only" verdict stands, and the DISC tuple's
   cost-quartile inversion makes cheap films riskier, not more purposeful**; G8 moves for
   publicity-using and forecast-driven play (Stage-5 repair measured, CIs stated); G9 partial;
   **G10 PASS, still vacuously** (Stage-5 residual failure 100%; no floor escape converts to
   durable recovery in the control cells); G1/G3/G6/G7/G12 per the measured record; **G11
   ("Snowballing bounded", both halves): the awareness half is repaired (ceiling absorption 0),
   the cash half REGRESSES (§8 item 1)** — all reported exactly (§27), never smuggled.
4. D-17B gates: anti-spam pair, maintenance bound, floor-escape existence, interior residence,
   awareness ceiling absorption 0, P16 cash byte-stability.

## 7. Rejected alternatives (measured, recorded)

Pure decay families A/B/E alone (a tax on a falling stock; E anti-correlated with runaway);
N-only and drift-only stacks (each fails the other tail); publicity EMG2 and the flat/cheap menu
family (spam) and small-lift steep menus (traps); exponent 7–8 variants (fail C1(a)); fixed
triples {300k,700k,1.5M}, {200k,700k,2M}, {300k,850k,2.5M} (dominance or distress-access);
DISC SPREAD 3.0–3.5 / FLOOR 0.25–0.30 (miss the surprise floor); tuple (iii) (dominated by (ii)).
Reference-measured UNAUTHORIZED families (two-sided mean-reversion, loss-damping, endogenous
pivot) outperform on raw economy but drive publicity purchases to zero (substitutes for R9's paid
action) and remain excluded; reported under §27.

## 8. Structural report-outs (§34 — not repaired here)

1. **The cash-runaway tail roughly doubles.** 14-arm mean runaway rate **11.1% →
   19.6%/19.7%**; worlds where no arm ever runs away 55.0% → 46.7%; world share of runaway
   variance 0.240 → 0.312 vs policy 0.188 → 0.202. Awareness ceiling absorption is 0.00% —
   the drift bounds the STOCK, not the CASH. This is the Lesson-BK shape named in
   `docs/D-16-OWNER-RULINGS.md`: one tail fixed, the other worsened; closing it needs a
   size-scaling cash sink (R10-deferred; D-17A froze the candidates). **Owner ruling E3.**
2. Economic immortality at the top (0/720 top-decile runs end below opening, every
   arm/horizon/grid).
3. The week-208 roster wall (36.4% of 312wk player runs; 100% cash-gated renewal failures) —
   also the partial substrate of C1(c)'s pooled pass.
4. Menu breadth / bet-the-studio moments (D-16 finding; neither marketing candidate restores it).
5. G1a: P5 min pairwise dominance 66.3% (unchanged by the lab fix; the argmax concentration WAS
   partly a pinning artifact — post-fix four arms ≥10%).
6. G3 regression: policy share of end-cash variance 0.269 → 0.217 (the healthier economy is more
   world-determined).
7. The awareness meter's practical band is ~0–57 of a nominal 0–100; UI must state the practical
   band, and the drift narration must attribute ~90% of a working studio's awareness decline to
   below-neutral releases, not to the drift (truth law; the reviewer-approved sentence is in the
   Stage-9 record).
