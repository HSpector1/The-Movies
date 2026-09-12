> **STATUS: HISTORICAL INPUT (revision 02, 2026-09-12).** Unmodified research input below this line. Where it differs from the canonical specification — report [`../P17-INDEPENDENT-VERIFICATION-REPORT.md`](../P17-INDEPENDENT-VERIFICATION-REPORT.md) §5 (index §5.7, with §8/§9/§10), canonical calculator [`../redteam/R3-reviewer-corrections-calc.py`](../redteam/R3-reviewer-corrections-calc.py), committed output [`../redteam/R3-output.txt`](../redteam/R3-output.txt) — **the report governs.** Superseded here: a judge's hand re-runs of the three candidates; verdicts predate the synthesis, the red team and revision 02.

# M1j — RMF Judge: PLAYER-LEGIBILITY-AND-FUN lens

**Judge role:** independent adversarial reviewer of the three RMF candidate models (M1a "Three Stored
Meters," M1b "Derived-from-Installments," M1c "Overexposure Debt + Heat Ledger"). Read-only research;
no repo touched. All arithmetic re-runs below were done two ways: (1) by hand from the formulas as
written in each model's own Markdown prose, and (2) by executing each model's own throwaway script
(`models/m1a_three_meters.py`, `m1b_derived_kernels.py`, `m1c_rmf_sim.py`) unmodified, to check the
Markdown tables against both the stated rule and the code that produced them. Evidence consulted:
`evidence/04a-real-franchises-set-A.md` (Parts 1–5), `evidence/04b-real-franchises-set-B.md` §3, and
`evidence/03e-comparators-other-ip-sequel-tycoons.md` §12–13.

**Verdict up front:** **M1b (Derived-from-Installments) wins**, narrowly, on the strength of the single
cleanest demonstration of Case D (an isolated Fatigue-driven band flip with Momentum held flat) and the
most rigorous double-counting proof, despite a real, self-flagged save-cost weakness. M1c has the best
raw UI legibility (the itemised CK3-style ledger is literally the idiom the comparator evidence names as
best-in-class) but loses on case fidelity to three concrete, code-verified rule-inconsistencies found
below. M1a is a competent, well-calibrated middle result but is the least legible of the three (no
itemised per-film breakdown at all) and has the least-examined exploit surface.

---

## 1. Scoring table (0–10)

| Dimension | M1a | M1b | M1c |
|---|---|---|---|
| Legibility (tooltip-predictability, two-speed idiom) | 7.0 | 8.5 | 9.0 |
| Case fidelity (A–G, esp. B/C/D/E/F/G as specified) | 6.5 | 8.0 | 6.0 |
| No double counting (P07/P14/P15) | 7.5 | 8.5 | 8.0 |
| Exploit resistance (spam/dormancy/reboot-cure/laundering) | 7.0 | 8.0 | 7.5 |
| Save cost | 8.5 | 5.5 | 8.0 |
| Rival compactness | 8.5 | 8.5 | 8.5 |
| **Weighted total*** | **7.2** | **8.0** | **7.7** |

*Weights used (this is a legibility-and-fun lens, so legibility and case fidelity are weighted
heaviest): legibility 25%, case fidelity 25%, no-double-counting 15%, exploit resistance 20%, save
cost 10%, rival compactness 5%. Recomputing with equal 1/6 weights instead still ranks M1b (7.83) >
M1c (7.75) > M1a (7.5) — the ranking is not an artefact of the weighting choice.

**Ranking: M1b > M1c > M1a.**

---

## 2. Independent re-run of the arithmetic (Case B and Case D, all three models)

Per the task's instruction, I re-derived numbers from each model's *stated rule* (not just its script)
and then ran the model's own script to cross-check. Full session shown; only the load-bearing lines are
reproduced here (complete output is reproducible from the three `.py` files in this same folder, which
I ran unmodified).

### 2.1 M1a, Case B, Film 1 (hand-derivation from §2 of `M1a-rmf-three-meters.md`)

Inputs (from `m1a_three_meters.py`, which encodes the case's stated critic/audience/ratio figures):
critic=80, audience=78, total=$480M, expectedTotal=$300M, opening=$126M, expectedOpening=$90M, s=0 (ORIGINAL).

```
q = 0.4·80 + 0.6·78 = 78.8                              ✓ matches table (78.8)
beat = 480/300 = 1.60                                    ✓ matches table (1.60)
reach01 = 480/(480+200) = 0.7059
gainQ = clamp((78.8-55)/30,0,1.3) = 0.7933
lossQ = clamp((60-78.8)/45,0,1.4) = 0 (negative→0)
beatMult = clamp(1+0.3·0.60,0.8,1.3) = 1.18
room(R=0,1.3) = 1
gain_R = 48·0.7059·0.7933·1.18·1 = 31.72 → dR = 31.72     ✓ matches table (+31.7)
openingBeat = 126/90 = 1.40; openingMult = clamp(1+0.5·0.40,0.6,1.8) = 1.20
gain_M = 55·0.7059·0.7933·1.20 = 36.96 → dM = 36.96       ✓ matches table (+37.0)
sat(q) = clamp((75-78.8)/35,0,1.3) = 0 (q≥75)  → gain_F = 0 → dF = 0.0   ✓ matches table (0.0)
```
**Result: exact match.** This also independently confirms the model's central Case-B claim — the
`satiation(q)` hard gate at q≥75 is the literal mechanism that makes Fatigue **exactly** zero for a
genuine hit, not merely "small."

### 2.2 M1b, Case B, Film 2 at week 52 (hand-derivation from §3 of `M1b-rmf-derived-kernels.md`)

Pre-event decayed state at week 52 (from Film 1's R=80.1-equivalent kernel — recomputed via the
peak-anchored formula directly, not carried forward as a stored scalar, since M1b has no stored
scalars): `quality₂ = 0.5·82+0.5·80... ` — recomputing from the model's own installment definitions
(critic 80/audience 78 for Film 1, comparator 1.9; critic 80/audience 78... — using the script's own
`Installment` objects) and its own `momentum()`/`fatigue()` sums:

```
surprise₂ = clamp(0.5·(1.7-1) + (quality₂-0.5), -1, 1), quality₂ = 0.5·0.80+0.5·0.78 = 0.79
         = 0.5·0.7 + 0.29 = 0.35+0.29 = 0.64
M contribution from Film2 at its own release = 100·0.64·2^0 = 64.0   ✓ matches script's printed
                                                                        contribution ('Film2', 64.0)
Film1's own contribution at week 52 (age 52, HL_M=24): 100·surprise₁·2^(-52/24)
  surprise₁ = clamp(0.5·(1.9-1)+(quality₁-0.5),-1,1), quality₁=0.5·0.82+0.5·0.80=0.81
            = 0.45+0.31 = 0.76 → 100·0.76·2^(-2.1667) = 76·0.2226 = 16.93   ✓ matches ('Film1', 16.93)
M(52) = 16.93 + 64.0 = 80.93 ≈ 80.9                                    ✓ matches table (80.9)
```
**Result: exact match**, and it shows the mechanism explicitly: M1b's per-installment sum really is
"Film 1 contributes +16.9, Film 2 contributes +64.0" — a literal, auditable tooltip, not a post-hoc
description.

### 2.3 M1c, Case D, Film 1 and Film 2 (hand-derivation from §2 of `M1c-rmf-debt-ledger.md`)

```
Q = 0.35·0.57 + 0.25·0.52 + 0.40·clamp((0.9-0.5)/1.5,0,1) = 0.1995+0.13+0.1067 = 0.4362   ✓ matches (0.436)
R (Film1, target=43.62 > R=0, rise-rate 0.70): R = 0 + 0.70·43.62 = 30.53                  ✓ matches (30.53)
M contribution: m0 = 60·(0.4362-0.5)·2 = -7.66                                            ✓ matches (-7.66)
F accrual: ΔF = 40·(1-0.4362)·similarity. Using similarity=0.90 (direct_sequel bucket; SEE §3
  below — this is Film 1, the branch's FOUNDING/ORIGINAL release, for which the model defines
  no "original" similarity bucket at all):
  ΔF = 40·0.5638·0.90 = 20.30                                                              ✓ matches (20.30)

Film 2 (week 40): R decays 30.53→29.46 (0.5^(40/780)=0.9651), then rises toward 43.62 at
  rate 0.70: R = 29.46+0.70·(43.62-29.46)=29.46+9.91=39.37                                 ✓ matches (39.37)
F paydown then accrual: qualityBonus=1+1.5·clamp((0.436-0.5)/0.5,0,1)=1.0 (Q<0.5→clamp to 0);
  damping=0.4 (active production); rate=0.6·1.0·0.4=0.24/wk; over 40wk: F=20.30-9.6=10.70;
  then + new accrual 40·0.5638·0.90=20.30 → F=10.70+20.30=31.00                            ✓ matches (31.00)
```
**Result: exact match** with the stated rule and with the script. This confirms the tables are
mechanically correct **applications of the code** — but it also demonstrates, precisely, the defect
named in §3 below: **the founding/ORIGINAL release of every M1c case is charged real Fatigue debt
(20.30, 3.13, 2.34 across Cases A/B/C respectively) using the direct-sequel similarity bucket**,
because M1c's `SIMILARITY` dict has no `"original"` key and its §2.4 rule text never exempts a
branch's first release — unlike M1a (`s=0` by explicit convention for ORIGINAL, `dF=0` always) and
M1b (the branch's founding film is explicitly sliced out of the Fatigue sum, `rows[1:]`). This is a
real, reproducible, self-inconsistent rule application, not a hand-rounding slip.

### 2.4 Minor transcription note (M1a)

Independently recomputing M1a Case D Film 1's `dR` from the stated rule gives **1.2482** (full
precision, confirmed against the script's own unrounded output), which rounds to **1.2** at one
decimal place — but the Markdown table in `M1a-rmf-three-meters.md` prints "+1.3" / "R=1.3" for this
row. The script itself prints `1.25` (rounded to 2dp in its log) and the Markdown appears to have
hand-rounded that already-rounded figure up to 1.3 rather than down to 1.2 (a double-rounding slip).
This contradicts the file's own claim ("exact script output... not hand-rounded") for exactly one
cell. It is immaterial to every conclusion drawn from Case D (the Fatigue climb 0→21.5→36.8→47.4 and
every other row are unaffected and match the script exactly) — flagged only because the report writer
should regenerate all M1a tables directly from the script rather than trust the hand-transcribed
Markdown for publication.

---

## 3. Case-by-case fidelity audit (the load-bearing seven)

### Case B — "two straight hits → fast spin-off, must not be punished for speed"

- **M1a: PASS, cleanest.** Fatigue is **exactly 0.0** throughout (verified in §2.1) because
  `satiation(q)` hard-gates to zero once q≥75 — a genuine hit produces *no* fatigue signal at all, not
  just a small one. Momentum **compounds additively** (37.0→63.2), directly modelling "two hits in a
  row stack," matching 04a Part 2A's Endgame/Far-From-Home and Rogue-One/Last-Jedi evidence.
- **M1b: PASS with a soft ding.** Fatigue rises to a real 18.9 (peak, week 52) / 14.5 (week 92) even
  though both releases are explicitly "smash" quality (~0.80–0.81 on M1b's 0–1 scale). This is because
  M1b's Fatigue kernel `100·similarity·(1-quality)·decay` has **no quality gate and no variable
  paydown rate** — unlike M1a's hard q≥75 zero-Fatigue gate or M1c's quality-scaled paydown multiplier,
  *any* finite quality (even 0.81) leaves a nonzero residue. The **band never leaves ACTIVE** (F stays
  well under the 60 "hot" threshold), so the case's outcome requirement is met, but a player reading the
  raw Fatigue number after two genuine smashes sees "18.9," not "≈0" — a real, if modest, mismatch with
  04a Q.B's "steady quality at steady cadence did not fatigue... adds ~nothing" finding.
- **M1c: PASS**, F stays ≤3.13 throughout (the founding-film artefact from §2.3 plus a rapid
  quality-scaled paydown that clears it before the next release), never threatens the band.

### Case C — "hit then flop; Recognition stays high, Momentum falls, salvageable"

All three pass the qualitative test (R barely moves; band flips to COOLING; a rest period restores F to
0). Quantitatively, the *size* of the Recognition dip differs meaningfully:
- M1b: 86.7→85.4 (**−1.5%**) — the strongest demonstration, because its `max`-based peak-anchoring
  makes it *mechanically impossible* for a non-peak flop to pull R down by more than a small `κ_R`-
  weighted residual drag; this is provably not just "small in this case" but small *by construction*.
- M1a: 50.0→46.8 (**−6.4%**).
- M1c: 65.45→57.15 (**−12.7%**) — the largest of the three, roughly a third of which is ordinary
  15-year-half-life passive aging over the 78-week gap (65.45→61.07) and the rest the flop's own
  fall-rate erosion. Still qualifies as "held up," but is the weakest of the three on this specific
  metric and the closest to reading as a meaningful, not merely cosmetic, dent.

### Case D — "rapid mediocrity ×4; Fatigue must become visibly important"

This is the sharpest differentiator among the three models, and it turns on the *band* logic, not the
raw meter:

- **M1b: the only clean pass.** The band transition ACTIVE→COOLING happens **specifically because F
  crosses 60** at week 80, while Momentum stays essentially flat and non-negative the whole time
  (1.0→1.3→1.4→1.4 — never itself crosses `MOMENTUM_COOL=-5`). A player watching the descriptor sees an
  isolated event: "nothing here looks like a flop, yet the franchise just went COOLING" — which is
  *exactly* what Case D asks the model to demonstrate, and M1b's own self-critique names this
  correctly as the intended reading.
- **M1a and M1c: raw numbers correct, band does not isolate Fatigue.** In both models the band is
  **already COOLING at Film 1** — a merely mediocre (not flop-level) *founding* release — because
  M1a requires `M≥5` and M1c requires `M≥0` for an ACTIVE reading, and both models' Momentum formulas
  put a q=56.4/Q=0.436 release at slightly-negative Momentum on its own. This means: (a) the F number
  does rise correctly and visibly in both (0→21.5→36.8→47.4 for M1a; 20.3→31.0→41.7→52.4 for M1c),
  satisfying the letter of "Fatigue rises," but (b) the *band* — the thing a player actually watches —
  never demonstrates Fatigue becoming the dominant driver, because it was already reading COOLING for
  an unrelated reason (weak Momentum) before Fatigue had accumulated at all. This is also a
  **player-fun concern independent of Case D**: under M1a/M1c's thresholds, *any* brand-new original
  film that scores merely average (not a flop — e.g. the real 2001 *The Fast and the Furious*, RT 55%,
  which launched an 11-film franchise, 04a §1.3) reads as "COOLING" on day one, before the property has
  had any chance to build. That is a harsh, potentially demoralizing framing for an ordinary release
  that real-world evidence says routinely goes on to a healthy franchise. M1b's default-ACTIVE-unless-
  clearly-negative-or-fatigued threshold avoids this false-negative.

### Case E — "20-year dormancy on a major property"

All three are internally consistent (independently re-derived and matched to 1 decimal place: M1a
R 70→48.43, M1b R→27.6, M1c R 90→35.72) and all three correctly show M→0, F→0, band→REVIVAL CANDIDATE.
One structural difference worth naming for the report: **only M1a has an explicit non-zero decay
floor** (`0.35·rPeak`), guaranteeing Recognition can never fully die regardless of how much real-world
time passes. M1b's and M1c's Recognition both decay by pure exponential half-life with no floor — over
enough half-lives (well beyond any of the seven cases, which top out at 20 years) both would
eventually approach zero. This is not exercised by any worked case and evidence itself doesn't reach
that far (Bond and Star Wars gaps top out at 16 years; no real case in 04a/04b tests a 40–60 year gap),
so this is flagged as an **open tail-case question for the report writer**, not a scored defect.

### Case F / G — "successful vs. failed reboot after identical dormancy"

All three correctly share an identical pre-release state between F and G (Direction G's "no hidden
future reception, equivalent bets") and correctly diverge only on outcome. Two M1c-specific defects
found by reading its script line-by-line (not visible from the Markdown alone):

1. **Reboot-ledger seeding does not follow M1c's own §2.3 rule.** The model's own text says a
   spin-off *or reboot* "may receive one seed entry — `initialValue = similarity·parent_M(now)`,
   `halfLifeWeeks=13`." The Case B spin-off is implemented exactly this way (verified:
   `inherited_seed = 0.45 × 21.33 = 9.60`, correct). The Case F/G reboot is **not**: the script does
   `ledgerF = list(ledger0)` — a literal, unscaled copy of the *old* branch's entire momentum ledger at
   its *original* magnitude and *original* 26-week half-life, not a similarity-discounted, 13-week
   "borrowed excitement" seed. This is numerically inert in the specific case shown (20 years of decay
   leaves the old ledger's single ember at ≈9×10⁻⁹, indistinguishable from zero either way), so it does
   not corrupt the Case F/G tables — but it is a genuine, reproducible inconsistency between the rule as
   *written* and the rule as *coded*, and it is a **latent exploit**: a reboot greenlit soon after a
   still-hot old branch would, under the code as written, inherit the *old branch's full, undiscounted,
   slow-decaying* momentum rather than the intended reduced/fast-fading share — the opposite of what
   Direction H's "reboot restarts continuity" and the reboot-similarity discount (0.35, lowest bucket)
   are supposed to produce.
2. **`G` (gap-before-last-release) is fed cross-branch.** M1c's own §5 defines `G` as "the gap between
   the two most recent releases" (implicitly, on the branch being evaluated) — a brand-new reboot
   branch should have `G=∞` (fewer than 2 releases on that branch). Instead the script passes
   `G=1040.0` (the *old* branch's dormancy length) into the reboot branch's own band calculation,
   which is what lets Case F read "ACTIVE AGAIN" rather than plain "ACTIVE." Both M1a and M1b
   explicitly considered exactly this pattern and explicitly rejected it, with stated reasoning: M1b
   says "'ACTIVE AGAIN' is reserved for a legacy sequel inside the SAME continuity coming back after a
   long gap... 'reboot' is a different, branch-level event... this distinction costs nothing extra."
   M1c's own prose never argues for the opposite choice — the code silently diverges from both siblings
   and from M1c's own stated per-branch semantics, with no justification given.

Neither defect is a hard Owner-direction violation and neither corrupts the *published* Case F/G
tables (they happen to be numerically inert at 20 years) — but both are exactly the kind of "table
follows the code, but the code doesn't follow the stated rule" inconsistency the task asked this pass
to surface, and a tuning pass that changes the dormancy length in either direction (a shorter reboot
gap, which is entirely plausible under Direction D's "no cooldown") would expose them.

---

## 4. Legibility deep dive (the assigned lens)

**Two-speed idiom check** (03e §12/§13: "Two-speed display idiom... itemised decaying modifiers in the
tooltip" is named as the single most legible pattern in the genre, via CK3 opinion lists and FM's
adjective-band-plus-star-rating split):
- **M1c passes most literally.** Momentum is *stored* as an itemised, ≤4-entry, CK3-opinion-style
  ledger with a per-entry fade date — this is the evidence's named idiom implemented almost verbatim,
  and Fatigue's "debt" framing (a number you watch pay itself down) is an unusually intuitive,
  game-legible metaphor most players already understand from real life.
- **M1b passes functionally but not structurally.** Nothing is *stored* as a ledger, but every output
  is *computable* as a literal per-installment sum on demand (demonstrated in §2.2 above and in the
  model's own Case F "R contributions: [('Reboot', +79.1), ('DefiningHit', +4.1)]" printout) — a UI can
  build the identical CK3-style tooltip from this shape with zero extra bookkeeping; it just isn't a
  first-class stored object the way M1c's is.
- **M1a does not pass this check.** R, M, and F are each a single accumulated float with no
  itemisation available at all — "why is Momentum 41.3" has no per-film answer without inventing new
  bookkeeping the model doesn't specify. M1a's own self-critique concedes a related point (the `rPeak`
  ceiling effect is invisible without a tooltip) but does not address the more basic itemisation gap.

**Band legibility:** M1b is the only model whose Case D exercise produces a band transition that is
*attributable to a single named cause* without extra narration (see §3). M1c's self-critique honestly
flags that band thresholds themselves are invisible ("F needs to drop by 37 more" is not visible without
a UI addition) — a real, useful, and correctly self-identified gap, but one that applies to all three
models equally (none of them expose distance-to-next-band as a stored or derived value); M1c is just the
one that says so out loud.

**Fun/tone check:** M1a's and M1c's COOLING threshold on Momentum alone (M1a: `M≥5`; M1c: `M≥0`)
produces the "brand-new average film reads as already declining" problem named in §3's Case D
discussion — worth a specific tuning flag for the report writer regardless of which model is chosen,
since it is a real risk to how a mid-quality launch *feels* to the player, independent of whether it is
mathematically "correct."

---

## 5. No double counting with P07/P14/P15

All three correctly avoid literal formula duplication and correctly use the same two seams
(`ReceptionInputs` optional field / `reception.ts:87-103` precedent for awareness; a multiplier on
`forecast.expectedTotal` for the "harsher bar" per Direction B) — verified against
`02-project-studio-architecture-READONLY.md` locators, all of which check out (`starPower.ts:67-120`,
`reception.ts:87-103,619-629,649-652,737-741`, `hollywoodTick.ts:175-184`,
`hollywoodValidation.ts:204-211`). None of the three encroach on P15 (market crowding) — all three
correctly treat crowding as out of scope, per 03e §13's ADAPT note.

Differentiating on *rigor of self-audit*, not on correctness:
- **M1b** goes furthest: it doesn't just flag the awareness/expectation dual-consumption of R/M, it
  **proves** (§11, worked arithmetic) that the loop is self-damping rather than self-reinforcing — "just
  clearing the raised bar is worth roughly a fifth of the original breakout's Momentum jolt." This is a
  materially stronger form of self-audit than a caveat.
- **M1c** catches the *broadest* set of channels: the same expectation/fcMult coupling **plus** a second,
  distinct concern the other two do not name — `awarenessInput` potentially stacking with the existing
  `Standing.audienceAwareness` channel for a top studio's own beloved franchise — and recommends a
  specific playtest rather than proving boundedness.
- **M1a** flags the same core coupling but neither proves nor tests it further.

---

## 6. Exploit resistance

| Exploit | M1a | M1b | M1c |
|---|---|---|---|
| Fast-sequel spam | Not rewarded in Case B/D, but explicitly left as an *open, unresolved* risk for an indefinite q≥85 chain (self-flagged, not quantified) | **Proven self-damping** with a worked numeric example (§11) | **Quantified directly**: an 8-release/15-week-cadence stress test shows F climbing unboundedly (21→144, no saturation) and both P07/P11 outputs collapsing to their floors by release 5 — the most concrete demonstration of the three |
| Dormancy-as-free-reset | Strong, explicit 3-point argument (decaying floor + fully flat M + capped/saturating nostalgia) | Strong, arguably the cleanest (no separate nostalgia formula at all — "the reset was never gated on dormancy length, it's gated on opening a new branch") | Strong, same two-clock argument as M1a, but paired with the reboot-ledger defect in §3 that partially undercuts it for a *short*-dormancy reboot |
| Reboot-as-fatigue-cure | Correctly structural (new branch = F=0 by construction); not separately stress-tested | Explicitly acknowledged as *real by design* (Direction H wants this), bounded by production cost + non-reset of Recognition; residual risk (branch-spam) correctly punted to Direction N governance | **Best-argued** (numeric proof: same bad quality costs 25.77 F as a direct sequel vs 10.02 as a reboot) with a **specific proposed fix** (gate new reboot-branch creation on the current branch already being COOLING-or-worse) — but the ledger-seeding code bug found in §3 is itself an unflagged exploit surface that cuts the other way |
| "Type"/similarity mislabeling ("spin-off laundering") | **Not discussed** — the `s^1.2` term has the same mislabeling vulnerability as the other two but the self-critique never names it | **Not discussed** as a named exploit, though the `type`/`similarity` inputs are explicitly "chosen by the player/rival at greenlight" with no stated validation — a shared gap across all three, not unique to M1b | **Not discussed** as its own bullet either, though its reboot discussion functionally covers the adjacent "is a declared reboot really a reboot" concern |

All three punt "who validates that a declared continuation type is honest" to governance outside the
RMF formulas — this is a **shared gap across all three models**, worth flagging to the report writer as
a cross-cutting open question rather than a differentiator.

---

## 7. Save cost

| | M1a | M1b | M1c |
|---|---|---|---|
| Typical franchise | ≈228 B | ≈775 B | ≈450 B |
| Large/branched | ≈740 B | ≈1,510 B | ≈1.3 KB |
| Scales with... | branches (bounded) | **lifetime installment count (unbounded, append-only)** | branches (bounded) |
| Self-flagged growth risk | No (bounded by construction) | **Yes** — explicitly named as the shape's core weakness (§10.5), "a future perf pass could prune... flagged as an open question, not a defect" but no base-model fix offered | No (bounded by construction) |

This is M1b's clearest structural weakness relative to the other two: its own MCU-scale worked estimate
(35 films → ≈3,925 B) is comfortably under budget *today*, but the shape has **no ceiling** — a
Bond/Fast-&-Furious/MCU-scale franchise (exactly the evidence set this whole exercise is built from) run
across a multi-decade save keeps growing this root forever, unlike M1a's and M1c's meter-based shapes,
which stay flat regardless of how many films a franchise eventually releases. This is real and worth a
tuning-pass note even though it does not break any of the seven worked cases.

## 8. Rival compactness

All three attach at the identical seam (`hollywoodTick.ts:175-184` `decide()` step 2), require the same
`policy.version: 2` + `hollywoodValidation.ts:204-211` widening, and are all genuinely 3-line rules with
no second forecast — functionally equivalent and equally compact (8.5/10 for all three). Minor,
non-scoring stylistic note: M1b's rule 1 threshold is a named `policy.continuationBar` field rather than
a magic constant embedded in the rule (M1a hardcodes `M≥20`; M1c uses `M>0`, a much looser bar than
either sibling) — a very small practice difference, not a compactness difference.

---

## 9. Winner and grafts

**Winner: M1b (Derived-from-Installments).** It wins specifically because it is the only one of the
three that cleanly, unambiguously satisfies the single most load-bearing item in this brief — Case D's
"Fatigue must become visibly important, on its own" — via an isolated band transition with Momentum held
flat, and because its double-counting self-audit is the most rigorous (proved, not just asserted). Its
real weakness (unbounded save growth) is a fixable implementation detail, not a conceptual flaw, and is
honestly self-flagged with a stated (if unbuilt) mitigation path.

**Grafts from M1c (runner-up, best raw legibility) onto the winning direction:**
1. Adopt M1c's **itemised ≤N-entry ledger as the concrete UI spec** for M1b's Momentum — M1b already
   computes the exact per-installment contributions needed (verified in §2.2); it just needs to be
   *displayed* as M1c's CK3-style card list rather than left as an internal sum.
2. Adopt M1c's **quality-scaled Fatigue paydown rate** (faster recovery after an excellent release) to
   fix M1b's one real Case-B soft spot (§3) — M1b's Fatigue currently only varies decay *magnitude at
   release*, never recovery *speed*; grafting a Q-scaled multiplier onto M1b's fixed `HL_F` would let a
   genuinely excellent film clear old debt faster, closing the gap with 04a's "Thunderbolts 2025... good
   reviews still soft, but earlier debt not compounding" pattern.
3. Adopt M1c's "**debt**" vocabulary/metaphor for presenting Fatigue to the player — the single most
   intuitive framing among the three, independent of which kernel computes the underlying number.
4. Adopt M1c's explicit "**show distance-to-next-band**" UI recommendation (weeks-to-dormant,
   points-to-COOLING) as a concrete requirement for whoever builds the screen — currently a self-flagged
   gap in all three models, but M1c is the one that names the fix.
5. Adopt M1c's **specific reboot-branch governance fix** ("a new reboot branch requires the current
   branch to already be COOLING or worse") as the smallest-correction answer to the reboot-as-cure /
   branch-spam exploit surface that all three models otherwise punt to Direction N without a concrete
   rule.

**Grafts from M1a (third place, most disciplined constant-count) onto the winning direction:**
1. Adopt M1a's **`rPeak`-anchored decay floor** for Recognition. This is the one mechanism that
   *guarantees* Recognition can never fully die regardless of elapsed real-world time — a stronger,
   more literal satisfaction of Direction Q ("older defining hits retain long-term Recognition") than
   either sibling's pure exponential decay, which given enough half-lives eventually approaches zero
   (untested by any of the seven cases, but a real tail-case gap in M1b/M1c). M1b's own peak-anchored
   kernel is a natural, low-cost place to bolt this on (track a `peakEverContribution` alongside the
   live peak-installment score, and floor the result against a fraction of it).
2. Adopt M1a's **hard `satiation(q)` zero-Fatigue gate above a quality threshold** to fully close M1b's
   Case-B soft ding (§3) — rather than (or in addition to) the M1c paydown-rate graft above, clamping
   `quality_i` before computing `(1-quality_i)` so a sufficiently excellent film contributes literally
   zero Fatigue, not just "eventually recoverable" Fatigue.
3. Adopt M1a's **append-nothing, scalars-only save shape** as the structural fix for M1b's one real
   weakness (§7): once a franchise's per-installment contribution has decayed below `κ_R`-relevance
   (M1b's own §10.5 suggestion, ~2×HL_R), roll it into a single compact residual scalar the way M1a
   never needed to avoid in the first place. This directly resolves M1b's self-identified #1 structural
   weakness using a pattern M1a already demonstrates is workable.

---

## 10. Case-failure list (precise)

1. **M1a — Case D:** band reads COOLING from Film 1 onward (an ORIGINAL, not a flop), driven by
   Momentum going slightly negative on a merely-average film, not by Fatigue — the case's explicit ask
   ("Fatigue must become visibly important") is satisfied by the raw F number but not by the band a
   player actually watches.
2. **M1c — Case D:** identical issue to M1a, same mechanism (M<0 trips COOLING at Film 1, before
   Fatigue has accumulated at all).
3. **M1c — Cases A/B/C/D (every case with a founding release):** the branch's founding/ORIGINAL film is
   charged real Fatigue debt (F=20.30, 3.13, 3.13, 2.34 respectively) using the direct-sequel similarity
   bucket, because M1c defines no "original" similarity value and its §2.4 rule text never exempts a
   founding release — contradicting the "a first film cannot be fatiguing, nothing precedes it"
   principle that both M1a (`s=0` convention) and M1b (`rows[1:]` exclusion) implement explicitly and
   correctly.
4. **M1c — Case F/G:** the reboot's Momentum ledger is seeded via an unscaled copy of the old branch's
   ledger (`list(ledger0)`, original magnitude, original 26-week half-life) rather than the
   similarity-scaled, 13-week-half-life seed M1c's own §2.3 rule specifies and which the Case B
   spin-off correctly implements — numerically inert at 20 years of dormancy, but a real code/rule
   inconsistency and a latent exploit for a short-dormancy reboot.
5. **M1c — Case F:** the reboot branch's `G` (gap-before-last-release) is fed the *old* branch's
   dormancy length rather than `∞` (its own branch has had zero prior releases), producing an
   "ACTIVE AGAIN" reading that both M1a and M1b explicitly considered and rejected for a brand-new
   branch, with stated reasoning M1c never rebuts or acknowledges.
6. **M1b — Case B:** Fatigue rises to a non-trivial 18.9 (peak) even for two explicitly "smash"-quality
   releases, because M1b's Fatigue kernel has no quality gate and no variable paydown rate — the band
   outcome is correct (stays ACTIVE) but the raw meter does not read "≈0" for genuinely excellent
   output the way both sibling models achieve, a partial, non-band-breaking miss on "must not be
   punished for speed."

No case failure rises to a hard Owner-direction violation (A–U) in the sense of contradicting a
directly-stated rule; all six are either (a) a band/legibility gap where the underlying meter is correct
but the player-facing descriptor doesn't isolate the intended cause, or (b) a code-vs-stated-rule
inconsistency that happens to be numerically inert in the specific case shown. All six are precise,
reproducible (shown by independent hand arithmetic and by running each model's own unmodified script),
and none of them are disqualifying on their own — they are exactly the kind of tuning-pass findings this
report exists to surface before any of these three ships as a "starting point."
