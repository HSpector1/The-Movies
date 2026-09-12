# M1c — RMF Model C: OVEREXPOSURE DEBT + HEAT LEDGER

**Modeler:** RMF Modeler C. **Status:** paper model / candidate, read-only research. No repo edits, no code. All constants are STARTING POINTS for tuning, explicitly labelled. Numeric worked histories were computed with a throwaway script at `scratchpad/p17/models/m1c_rmf_sim.py` (python3, not part of the repo).

**Shape in one line:** R is a slow scalar; **M is a CK3-opinion-style itemised ledger of ≤4 recent installment contributions, each with its own fade date**; F is an **overexposure debt** that accrues on release and is paid down weekly, faster after a great film, slower while the franchise is actively being worked.

---

## 0. Where this sits against the Owner directions and the architecture (no reopening)

- Reads only public `FilmResult` facts — `criticScore`, `audienceScore` (`filmAudienceScore`), `boxOffice.total` vs `FilmResult.forecast.expectedTotal`, `opening` — plus the given `similarity` and continuation-type inputs (CONTEXT.md Direction A/B; architecture §d.3, `02-project-studio-architecture-READONLY.md:189-196`).
- Never computes box office, never mints cash, never changes salary, never adds a `StandingChangeSource` (architecture §d.1, `:169-179`; Direction R). "Higher expectations, bigger reputational downside" (Direction B) is expressed **only** by raising `FilmResult.forecast.expectedTotal`'s multiplier, which `computeStarPowerDelta.fcMult` already reads with **no new fame formula** (architecture §c.5, `:144-150`, verbatim: "P17's 'higher expectations / bigger reputational downside' … can be expressed by what P17 feeds into `expectedTotal`, not by a second fame formula").
- Inherited awareness/reach is fed through the same optional-input seam the house style already uses for `setUplift`/`setNovelty` (architecture §d.2/d.4, `reception.ts:87-103`, `:597-768`) — "ABSENT is the whole legacy world … a bit-exact IEEE no-op." P17 supplies a **value**; P07 keeps the **formula**.
- Three separate factors, never one FranchiseScore (Direction C). No hard cooldown; timing acts only through M and F (Direction D). No per-count penalty (explicit in the task).
- `computeStarPowerDelta`'s bounded-clamp style (`starPower.ts:67-120`) is the house pattern this model imitates for its own quality read: weighted sums of clamped [0,1] terms, no raw multiplicative blow-ups.
- Size: follows the §f.2 pattern — scalars + id lists only, no film-result copies (`02-project-studio-architecture-READONLY.md:262-268`).

---

## 1. State stored (per Franchise, and per branch/SubProperty)

All fields are exact ids or scalars, per the additive-root law (architecture §f.1). A **Franchise** root keyed to the exact P16 `StoryPropertyId` (Direction M); each **branch** (main continuity / a reboot continuity) and each **SubProperty** (Direction J) carries its **own** copy of this same triple, because Recognition/Momentum/Fatigue for "the Bond films" and "a Bond spin-off" are not the same numbers.

```
FranchiseState (one per StoryPropertyId):
  storyPropertyId: Id            // P16 authority, never inferred (register INT-011/012)
  rightsOwnerRef: Id             // P16 owns; P17 reads
  branches: BranchState[]        // bounded, small (Direction N)

BranchState (one per branch OR SubProperty; a SubProperty is a BranchState with subPropertyOf set):
  branchId: Id
  branchType: 'main' | 'reboot' | 'spinoff'
  subPropertyOf: Id | null       // parent StoryProperty/branch if this is a J-style SubProperty

  // R — Recognition: one durable scalar, 0..100
  recognition: number

  // M — Momentum: itemised ledger, CK3-opinion-style, ≤4 entries
  momentumLedger: MomentumEntry[]   // length <= 4, oldest dropped on overflow

  // F — Fatigue: one non-negative scalar ("overexposure debt"), unbounded upward,
  //     floor 0. Internal ledger value is uncapped; DISPLAY clamps it (see §6).
  fatigueDebt: number
  lastReleaseWeek: number | null
  lastQuality: number | null        // Q of the most recent release (drives paydown speed)
  priorReleaseGapWeeks: number | null // gap before the MOST RECENT release (drives the
                                       // ACTIVE-AGAIN/REVIVAL read; derivable from
                                       // installments[] alone, kept as a cached scalar
                                       // for cheap tick reads rather than recomputed)

  installments: Id[]                // productionId/conceptId list, exact ids only (§a.6)
  keyAssociations: { talentId: Id; importance: number }[]  // bounded, small (Direction F)
  milestones: Id[] | { week: number; kind: string }[]      // small, display-only

MomentumEntry:
  sourceInstallmentId: Id     // exact productionId, never a title (§a.1)
  addedWeek: number
  initialValue: number        // signed, -60..+60 in the starting tuning
  halfLifeWeeks: number       // per-entry; default 26, spin-off inheritance uses 13
```

No lifetime average is ever stored — `recognition` is a single scalar updated by a rule (§4), not an accumulator over `installments[]`. `installments[]` exists only for identity-joining and UI history, exactly the way `persistedProductionIds` already works (§a.6).

---

## 2. The update rule at each release

### 2.1 A bounded, house-style quality read `Q_i ∈ [0,1]`

P17 does not have a "reception score" to read off `FilmResult` directly, so it builds one, in the same clamped-weighted-sum style as `computeStarPowerDelta` (§c.5) — never re-deriving box office, only re-expressing already-computed public facts as a bounded index:

```
critic01   = clamp(criticScore / 100, 0, 1)
aud01      = clamp(audienceScore / 100, 0, 1)          // filmAudienceScore, public (§d.3)
perfRatio  = boxOffice.total / forecast.expectedTotal   // the SAME ratio fcMult already reads
perf01     = clamp((perfRatio - 0.5) / 1.5, 0, 1)       // 0.5x forecast -> 0 ; 2.0x -> 1 ; 1.0x (met) -> 0.33

Q_i = clamp(0.35*critic01 + 0.25*aud01 + 0.40*perf01, 0, 1)
```

`opening` (vs `expectedOpening`) is available but not separately weighted in `Q_i` in this candidate — folding a second forecast-ratio in would double-count the same signal `perf01` already carries. It is used only where a case explicitly gives it as the headline number (Case A); see §7 worked-history notes.

Reference points (used throughout the worked histories): excellent (critic 85, aud 80, ratio 2.2) → Q≈0.90; iconic (90/88/2.5) → Q≈0.93; mediocre (57/52/0.9) → Q≈0.44; weak (45/40/0.6) → Q≈0.28; poor reboot (40/38/0.5) → Q≈0.24.

### 2.2 Recognition (R) — asymmetric target-seeking + slow passive decay

```
target_i = 100 * Q_i
if target_i > R:  R <- R + 0.70 * (target_i - R)      // RISES fast toward a big win
else:             R <- R + 0.12 * (target_i - R)      // FALLS slowly toward a flop

// every week, regardless of releases:
R <- R * 0.5 ^ (1 week / 780 weeks)                    // 15-year half-life, passive
```

This is the whole mechanism for Direction Q ("recent performance matters strongly; older defining hits retain long-term Recognition; no full lifetime average"): one great film can move R most of the way to its own quality level in one step (recent matters strongly); a subsequent flop only erodes R at roughly 1/6th that rate (defining hits persist); and R is **never** an arithmetic mean of `installments[]` — it has no per-count dependency at all.

### 2.3 Momentum (M) — itemised, decaying, capped-length ledger

```
m0_i = 60 * (Q_i - 0.5) * 2          // -60..+60, signed around "met expectations"
add MomentumEntry{ sourceInstallmentId: i, addedWeek: now, initialValue: m0_i, halfLifeWeeks: 26 }
if ledger length > 4: drop the OLDEST entry (by addedWeek)

// value of any entry at time t:
value(entry, t) = entry.initialValue * 0.5 ^ ((t - entry.addedWeek) / entry.halfLifeWeeks)
M(t) = sum(value(entry, t) for entry in ledger)
```

Every ledger row is player-visible with its own remaining half-life, exactly the CK3 opinion-tooltip idiom the comparator atlas calls out as "the most legible 'why is this number what it is' UI in the genre" (`03e-comparators-other-ip-sequel-tycoons.md:227`, §10.1). A spin-off/reboot's **own** ledger starts empty; it may receive one **seed entry** — `initialValue = similarity * parent_M(now)`, `halfLifeWeeks = 13` (faster fade — borrowed excitement, not earned) — capturing "spin-off inherits a reception-scaled share" (04a Part 5 row D) without touching the parent's own ledger (parent not consumed, per the same row).

### 2.4 Fatigue / Overexposure Debt (F) — accrual + variable-rate paydown

**Accrual, at each release:**
```
F <- F + 40 * (1 - Q_i) * similarity_i
```
`similarity_i` is the given continuation-type input. Starting-point values used throughout (bucketed as instructed — direct sequel/prequel high, spin-off/reboot lower, remake medium):

| Continuation type | similarity (starting point) |
|---|---|
| Direct sequel | 0.90 |
| Prequel | 0.85 |
| Remake | 0.60 |
| Film spin-off | 0.45 |
| Reboot | 0.35 |

**Paydown, every week:**
```
qualityBonus  = 1 + 1.5 * clamp((lastQuality - 0.5) / 0.5, 0, 1)   // 1.0x .. 2.5x
damping       = 0.4 if a continuation of this same franchise/branch is currently
                       in production (greenlit, not yet released), else 1.0
F <- max(0, F - 0.6 * qualityBonus * damping)      // per week
```

This is the whole mechanism for the task's central ask: "F rises faster for mediocre similar output than for excellent output, and recovers with rest, and pays down FASTER when the last release was excellent, and SLOWER while the property is being released into again — no per-count penalty, no cooldown." `(1-Q)` alone already means an excellent film adds ~4x less debt than a mediocre one and ~7x less than a poor one for the same similarity (worked in §8.2); `qualityBonus` additionally makes the debt from a good film evaporate fast (Case A: gone in days); `damping` makes debt linger while the franchise stays in active production, matching "slower while the property is being released into again," and both terms are continuous multipliers, not a step, count, or a timer — there is no `installments.length` anywhere in this formula and no minimum-wait check anywhere in the release path.

---

## 3. Weekly/periodic decay half-lives (summary)

| Meter | Decay shape | Half-life / rate | Rationale |
|---|---|---|---|
| R (Recognition) | passive exponential toward 0, every week | 780 weeks (15 yr) | "older defining hits keep" — must survive a multi-year gap almost untouched, and only meaningfully fade over a generation (Case E: 40% remains after 20yr) |
| M (per ledger entry) | exponential toward 0 | 26 weeks (~6 mo) default; 13 weeks for an inherited spin-off seed | "fast, decays to neutral" (Direction C); a borrowed seed fades twice as fast as an earned one |
| F (debt) | linear paydown, rate-modulated | not a half-life — a fixed £/week-style rate (0.6/wk baseline) scaled 1.0–2.5x by last quality and 0.4–1.0x by production activity | a debt, not a decaying quantity — "recovers with rest," at a rate the franchise's own recent record and current workload control |

---

## 4. Recognition is slow/durable, no lifetime average (Direction Q) — why this shape works

- No accumulator ever divides by `installments.length`. R only ever moves by the two-rate rule in §2.2, driven by the CURRENT release's own `Q_i`; the entire history of the franchise before that release is compressed into the single number R already holds.
- The 6:1 rise:fall asymmetry (0.70 vs 0.12) means one defining hit does most of the work of establishing R, and it takes several bad films in a row to erode it by a similar amount — verified in Case D (§8.4): four mediocre-but-not-terrible films only walk R up to ~43 (converging toward the quality ceiling, never near collapse) precisely because there was never a `target_i` far below the running R to pull it down hard.
- The 15-year half-life on passive decay means R is for practical purposes frozen between releases at normal game timescales (a multi-year gap moves R by single-digit points) and only a true dormancy-scale gap (a decade-plus) meaningfully erodes it — Case E shows R fall from 90 to ~36 over 20 years, "partially persists," not gone.

---

## 5. Descriptor bands — ACTIVE / COOLING / DORMANT / REVIVAL CANDIDATE / ACTIVE AGAIN

Derived, never stored, evaluated on read from `(M, F, R, weeksSinceLastRelease=W, gapBeforeLastRelease=G)`. `G` is the gap between the two most recent releases (∞ if fewer than two releases exist yet) — already recoverable from `installments[]`'s release weeks with no new cross-package read.

```
if W < 26  and G is finite and G >= 156  and M >= 0:     ACTIVE AGAIN
elif W >= 156:
    if R >= 25 and F <= 15:                              REVIVAL CANDIDATE
    else:                                                 DORMANT
elif W >= 104  or  M < 0:                                 COOLING
else:                                                      ACTIVE
```

Starting-point thresholds: `REACTIVATION_WINDOW=26wk`, `DORMANT_WEEKS=156wk (3yr)`, `ACTIVE_WEEKS=104wk (2yr)`, `REVIVAL_R_MIN=25`, `FATIGUE_REST_MAX=15`.

Two deliberate, minimal additions beyond the literal `(M, F, W)` triple named in the brief, both argued in §11:
1. **R gates DORMANT vs REVIVAL CANDIDATE.** Without it, every dormant flop reads as a "revival candidate," which is not useful information — a forgotten failure and a sleeping classic must not share a label.
2. **`M >= 0` gates ACTIVE AGAIN.** A reactivation whose own release just tanked (Case G) is not meaningfully "active again" — it falls straight through to COOLING, which is the truer signal for the player deciding what to do next.

---

## 6. The two outputs P17 hands to other packages

### 6.1 Inherited awareness/reach input `a ∈ [0,1]` (P07's optional `ReceptionInputs` seam, §d.4)

```
recognitionTerm = R / 100
momentumTerm    = clamp(M / 60, -1, 1)
base_a          = clamp(0.65*recognitionTerm + 0.35*momentumTerm, 0, 1)
fatigueDamp     = clamp(1 - 0.5*clamp(F/100, 0, 1), 0.5, 1)      // fatigue can cut awareness up to 50%, never past it
nostalgiaMult   = 1 + 0.20*clamp(R/100, 0, 1)   if band in {DORMANT, REVIVAL CANDIDATE} else 1
a = clamp(base_a * fatigueDamp * nostalgiaMult, 0, 1)
```

Plugs in exactly where §d.4 names: `preMarketingAwarenessOf` / `reachSupport` / `awarenessFactor` call sites (`reception.ts:649-652, 666-676, 737-741`), as one more optional field beside `setUplift`/`setNovelty` — absent for any non-continuation film, bit-exact no-op.

### 6.2 Expectation multiplier for `forecast.expectedTotal`

```
expectationMult = clamp(1 + 0.006*R + 0.004*M - 0.006*min(F, 100), 0.6, 1.8)
```

This is the ONLY place "higher expectations, bigger reputational downside" (Direction B) is expressed: it raises the locked `expectedTotal`, and `computeStarPowerDelta.fcMult` (already clamped 0.85–1.15, §c.5) and the newspaper's `boxDelta` (§d.3) then judge the SAME film against that harder bar with zero new formulas. A beloved, hot property (high R, positive M) gets a bigger number to live up to; a fatigued or currently-cold one gets a discounted one — matching real audiences/industry expecting less from a tired brand.

---

## 7. Nostalgia/revival without a free fatigue reset (Direction D/P)

Two separate things happen during a long dormancy, on two different clocks, and neither one is a special "dormancy bonus" rule — both are the SAME §2/§6 formulas simply running for a long time:

1. **F pays itself down to 0 through ordinary paydown** (§2.4) — this happens on an ~1-2 year timescale even with no bonus (baseline 0.6/wk clears a Case-D-sized debt of ~50 in well under two years once production goes idle). Waiting the full 20 years of Case E buys **nothing extra** on the fatigue side past the point F already hit its floor of 0 — there is no reward for waiting longer than it takes debt to clear, because the paydown formula saturates at zero exactly like any debt does.
2. **R keeps decaying the entire time**, on its own 15-year-half-life clock (§2.2/§3) — so the LONGER a property sits dormant past the point F has cleared, the LOWER its eventual nostalgia payoff, because `nostalgiaMult` in §6.1 is itself proportional to the current (decayed) R. There is a real, continuous cost to waiting beyond what recovery requires; the model never gives "wait longer, get more."

The nostalgia bonus itself (`nostalgiaMult` up to 1.20x) is an **awareness-only** effect — it never touches R, F, or the film's actual quality. Case F and Case G start from the identical pre-release state (§8.6, "what the player sees") and receive the identical nostalgia-boosted awareness input; what happens next is entirely about the film the studio actually makes. A studio cannot mine dormancy for free value beyond the ordinary rest a fatigued property needed anyway.

---

## 8. Worked histories

All numbers from `scratchpad/p17/models/m1c_rmf_sim.py`. `a` = §6.1 awareness input; `E` = §6.2 expectation multiplier. Unspecified case numbers (mainly `audienceScore`, and Case B's "smash" figures) are explicit **ASSUMPTIONS**, flagged inline — the cases as given specify critic score and forecast ratio but not every field `Q_i` reads.

### 8.1 Case A — breakout original, fast direct sequel

Film 1: critic 85, opening 2.2x forecast, audience 80 → **Q₁ = 0.897**.

| Event | Week | R | M (ledger) | F | Band |
|---|---|---|---|---|---|
| Post-Film 1 | 0 | 62.82 | +47.70 [Film1: 47.70, hl 26wk] | 3.69 | ACTIVE |
| **Greenlight decision for Film 2** | 4 | 62.60 | +42.88 | 0.00 | ACTIVE |
| Film 2 releases (outcome not yet known) | 60 | 59.56 | +9.63 | 0.00 | ACTIVE |

**What the player sees at the week-4 greenlight decision:** band **ACTIVE**, Momentum still +42.9 (barely decayed off a +47.7 peak), Fatigue already back to 0 (an excellent film's small debt cleared in days). One-line forecast: *"[Property] is red hot — audiences are still buzzing and there's no overexposure debt to pay off. A sequel now would ride real momentum."* Expectation multiplier is 1.55 at week 4, meaning `expectedTotal` for a Film 2 greenlit now is already ~55% above a same-budget standalone film's baseline before any of Film 2's own casting/marketing choices are made.

**Rival's compact policy** (same numbers, §9): ACTIVE + M>0 → greenlight a same-branch continuation now, at the highest similarity bucket the rival's own IP inventory supports. No different from the player's incentive — this is intentional (Direction K: rivals obey the same law).

### 8.2 Case B — two straight hits, then a fast spin-off (must not punish speed)

Film 1 & Film 2 "smash," **ASSUMPTION**: critic 88, audience 82, ratio 2.0x → Q = 0.913 each.

| Event | Week | R | M (parent) | F (parent) | Band |
|---|---|---|---|---|---|
| Post-Film 1 | 0 | 63.91 | +49.56 | 3.13 | ACTIVE |
| Post-Film 2 (52wk later) | 52 | 82.22 | +61.95 (Film1 remnant +12.4 stacked with fresh Film2 +49.6) | 3.13 | ACTIVE |
| Parent state at spin-off release | 92 | 79.35 | +21.33 | 0.00 | ACTIVE |
| **Spin-off's own state** (inherits `0.45 × 21.33 = 9.60` as a seeded 13wk-half-life entry) | 92 | 0.00 (own R starts fresh) | +9.60 | 0.00 | ACTIVE |

**Momentum is HIGHER at week 52 (61.95) than at week 0 (49.56)** — back-to-back hits stack in the ledger; the model rewards, not punishes, releasing Film 2 while Film 1's momentum was still positive. Fatigue never rises above the tiny amount two excellent films leave behind (3.13, cleared within weeks by the quality-bonus paydown). **What the player sees before greenlighting the spin-off (week 92):** band ACTIVE, M=+21.3 (still clearly positive off two hits), F=0, R=79 — one-line forecast: *"Two hits in a row and no fatigue on the books. A spin-off now inherits real excitement, not a cold start."*

**Rival's policy:** ACTIVE + M>0 both times → greenlight immediately both times; nothing in the rule set would make a rival wait, which is the point of Direction D.

### 8.3 Case C — hit then flop (Recognition survives, Momentum falls, salvageable)

Film 1 iconic: critic 90, ratio 2.5x, **ASSUMPTION** audience 88 → Q₁=0.935. Film 2 weak: critic 45, ratio 0.6x, **ASSUMPTION** audience 40 → Q₂=0.284. Gap 78 weeks.

| Event | Week | R | M | F | Band |
|---|---|---|---|---|---|
| Post-Film 1 (iconic) | 0 | 65.45 | +52.20 | 2.34 | ACTIVE |
| Post-Film 2 (weak) | 78 | 57.15 | **−19.38** | 25.77 | **COOLING** |
| +52wk rest, no Film 3 yet | 130 | 54.57 | −4.84 | 0.00 | COOLING |

R fell only 65.45→57.15 (−12.7%) despite a genuine flop — the asymmetric fall rate did its job; Momentum went sharply negative (the flop itself is now the dominant ledger entry); Fatigue spiked to 25.77 but had already fully cleared by week 130 (bad film's debt still pays down at baseline rate — no bonus, but no extra penalty either — and here production went idle, so paydown ran undamped). **What the player sees right after Film 2 (week 78):** band COOLING, R still 57 (respectable), M negative — *"[Property] took a hit, but its core reputation is intact. Give it time before the next installment."* By week 130: COOLING but F=0 and `a` climbing back (0.225→0.326) — *"The debt from the last film is paid off; the property is still cooling but recoverable."* This is exactly "franchise salvageable," not dead.

**Rival's policy:** COOLING → fall back to an original-film choice this cycle rather than continuing the branch (§9 rule 3), unless the rival's own risk tolerance is high — matches real comparator data (04b: single flops like Rocky V, JP3 did not end their franchises, but were followed by a gap, not an immediate re-continuation).

### 8.4 Case D — rapid mediocrity x4 @ 40-week cadence (fatigue must matter, visibly)

Each film: critic 57 (mid of 55-60), ratio 0.9x, **ASSUMPTION** audience 52 → **Q=0.436** every time (a perfect fit for the ≤4-entry ledger cap — this case exactly fills it).

| Film | Week | R | M | F | Band |
|---|---|---|---|---|---|
| 1 | 0 | 30.53 | −7.66 | 20.30 | COOLING |
| 2 | 40 | 39.37 | −10.30 | 31.00 | COOLING |
| 3 | 80 | 41.93 | −11.20 | 41.69 | COOLING |
| 4 | 120 | 42.67 | −11.52 | **52.39** | COOLING |

Fatigue climbs steadily and visibly (20→31→42→52) because each release adds ~+20 of debt and only ~−9.6 pays down in the 40-week gap between them (mediocre quality gets no paydown bonus, and the franchise stays in active-production damping the whole time) — a clear, monotonic, player-legible signal that "doing the same mediocre thing again" is costing something real, without ever counting installments. Recognition creeps up only toward the quality ceiling (~43 = 100×0.436) and never threatens to reach "hit" territory. `a` (awareness input) falls 0.138→0.155 (flat/slightly down) and `E` (expectation multiplier) falls from 1.03 to 0.90 — the market's expectations for a fifth installment are already lower than for an original film. **What the player sees after Film 4:** band COOLING, F=52 (well above the FATIGUE_REST_MAX=15 "rested" line) — *"Overexposure debt is high and Momentum has gone negative. Audiences expect less from the next one (0.90x) unless this franchise gets a real rest or a real change."*

**Rival's policy:** by Film 3–4, F is already crossing most reasonable `F_TOL` thresholds → rule 3 fires: skip, do an original film instead. A rival following the compact policy in §9 would have stopped chasing this chain around Film 3.

### 8.5 Case E — 20-year dormancy (1040 weeks) of a major (R-high) property

**ASSUMPTION** (case gives no numbers): last release left R=90, F=30 (a middling debt on the books), one small residual momentum ember (+10, 26wk half-life — already negligible).

| State | Week | R | M | F | Band |
|---|---|---|---|---|---|
| Start of dormancy | 0 | 90.00 | +10.00 | 30.00 | ACTIVE |
| 20 years later | 1040 | **35.72** | 0.00 | **0.00** | **REVIVAL CANDIDATE** |

R's 15-year half-life gives a decay factor of 0.5^(1040/780) = 0.397 over 20 years — R falls from 90 to ~36, "partially persists," never zero (§4). M has fully decayed to neutral (26wk half-life over 1040 weeks is ~40 half-lives — no realistic ledger entry survives). F has fully recovered to 0 (ordinary paydown running undamped, uncontested, for two decades — nothing special about dormancy, it's just a very long rest). **What the player sees:** band REVIVAL CANDIDATE, R=36 (still meaningfully above the REVIVAL_R_MIN=25 floor), M neutral, F=0 — *"[Property] has been dormant for 20 years but its name still carries real recognition. Fully rested; a well-made revival would get a genuine nostalgia lift."*

**Rival's policy:** DORMANT/REVIVAL CANDIDATE + R above the rival's own revival threshold → consider a reboot bid, bounded by rights ownership (§9 rule 2) — this is the shipped-nowhere gap the comparator atlas flags (§13 point 4): no comparator ships rival revival behavior, so this is designed from scratch.

### 8.6 Case F vs Case G — successful vs failed reboot after the SAME dormancy

**Both cases share the identical pre-release state** — this is the important framing point: the player's (and rival's) greenlight decision is made from Case E's end-state, band REVIVAL CANDIDATE, R=35.72, M=0, F=0, `a`=0.249, `E`=1.214 — before anyone knows which of the two outcomes below will happen. Reboot similarity = 0.35 (lower bucket, per Direction A/H).

**Case F — excellent reboot** (critic 85, ratio 1.6x, **ASSUMPTION** audience 78 → Q=0.786):

| Event | Week | R | M | F | Band |
|---|---|---|---|---|---|
| Post-reboot | 1040 | 65.72 | +34.30 | 3.00 | **ACTIVE AGAIN** |
| +6wk | 1046 | 65.37 | +29.23 | 0.32 | ACTIVE AGAIN |

**Case G — poor reboot** (critic 40, ratio 0.5x, **ASSUMPTION** audience 38 → Q=0.235):

| Event | Week | R | M | F | Band |
|---|---|---|---|---|---|
| Post-reboot | 1040 | 34.25 | **−31.80** | 10.71 | **COOLING** |
| +6wk | 1046 | 34.07 | −27.10 | 9.27 | COOLING |

Case F nearly doubles R (36→66) and lands a strongly positive Momentum ledger — a real "revival landed" signal, band ACTIVE AGAIN. Case G barely moves R (36→34, the asymmetric fall rate limiting the damage even here) but Momentum craters and the band correctly reads COOLING, not a false "active again" (§5 point 2) — the comeback attempt is legible as having stumbled, not succeeded, even though the property did technically just release something.

**What the player sees, one line each:**
- Case F: *"The reboot landed. [Property] is active again with real momentum and no debt — a fast follow-up would be well timed."*
- Case G: *"The reboot underperformed. Recognition mostly held, but this didn't reignite the franchise — treat it as a fresh flop, not a fresh start."*

**Rival's policy** at the shared pre-release decision point: identical for F and G (rivals don't get to see the outcome either, per Direction G "no hidden future reception info; rivals make equivalent bets") — a rival with R≥threshold bids the same reboot; the split in outcomes is exactly the intended risk of Direction E/G ("bad bets allowed").

---

## 9. Rival's compact three-line policy

```
1. IF band in {ACTIVE, ACTIVE AGAIN} AND M > 0:
       greenlight a same-branch continuation now, similarity per continuation type,
       sized to the rival's available capacity/cash (P11-owned).
2. ELSE IF band in {DORMANT, REVIVAL CANDIDATE} AND R >= policy.rivalRevivalRMin:
       bid a REBOOT (or a licensed remake) of this property, subject to P16 rights
       ownership (Direction K/L) — never invents rights because the film once existed.
3. ELSE (COOLING, or fatigueDebt above policy.rivalFatigueTolerance):
       skip this franchise this decision cycle; fall back to the existing
       genre-roulette original-film choice (hollywoodTick.ts:175-184).
```

This slots into `chooseIndustryPackage` as one more bounded branch at the existing `decide()` step 2 commission point (architecture §e.5, `hollywoodTick.ts:175-184`), scored the same way (`expectedOperatingMargin - preferenceCost`), with **no second forecast**. `rivalRevivalRMin` and `rivalFatigueTolerance` are two new scalar fields on the closed `policy` shape (`hollywoodTypes.ts:79-95`; `hollywoodValidation.ts:204-211`), requiring `policy.version: 2` — exactly the "dormant policy dimension" register SIM-009 already anticipates (architecture §e.5).

---

## 10. Save cost in bytes per franchise

Following the §f.2 pattern (scalars + exact-id lists, no `FilmResult`/participant copies):

| Field | Bytes (approx, packed) |
|---|---|
| `storyPropertyId`, `rightsOwnerRef` | 2 × 16B = 32B |
| Per branch: `branchId` + `branchType` enum + `subPropertyOf` | 16 + 1 + 16 = 33B |
| Per branch: `recognition` (float) | 8B |
| Per branch: `momentumLedger` (≤4 entries × {sourceInstallmentId 16B, addedWeek 4B, initialValue 4B, halfLifeWeeks 4B} = 28B) | ≤112B |
| Per branch: `fatigueDebt`, `lastReleaseWeek`, `lastQuality`, `priorReleaseGapWeeks` | 4 × 8B = 32B |
| Per branch: `installments[]` (typical 4-6 ids × 16B) | ~80-96B |
| Per branch: `keyAssociations[]` (typical ≤3 × {talentId 16B, importance 4B}) | ~60B |
| Per branch: `milestones[]` (typical ≤2 × 24B) | ~48B |
| **Per branch total** | **~400-420B** |
| **Per franchise** (1 main branch typical; 2-3 branches for a franchise with a reboot + a spin-off) | **~450B (simple) to ~1.3KB (branched)** |

For scale: PERF-009 budgets a single `film` record at ≤1.5KB and today's live `hollywood` root already runs at ~37.8MB against an ≤8MB target (architecture §f.2, `P12A-DECISION-AND-REQUIREMENT-REGISTER.md:183, 320-322`) — a franchise root at well under 1.5KB per property, times a realistic few dozen live properties (~15-40KB total), is a rounding error against the existing overshoot, not a new contributor to it. This is a paper estimate (DESIGN INFERENCE, MEDIUM confidence on exact packed layout) pending an actual `SaveFileV20` schema pass.

---

## 11. Self-critique

**Legibility.** The raw numbers are few and each has one clear job (R = durable reputation, itemised M ledger = "why is momentum what it is right now," single F number = "how much debt is on the books"), and the CK3-style itemised ledger is the strongest legibility choice available per the comparator harvest (§12 of `03e`, "the most legible 'why is this number what it is' UI in the genre"). The weak spot is the **band thresholds themselves are invisible** — a player told "COOLING" has no way to see how close F is to 15 (the REST line) or how many weeks remain until DORMANT_WEEKS, without a UI that explicitly shows "F needs to drop by 37 more" or "in 64 more weeks, dormant." That is a UI-layer gap, not a P17-formula gap, but it should be called out to whoever builds the player-facing screen: **show distance-to-next-band, not just the current band**, the same way a progress bar would.

**Double counting with P07/P14.** Not a formula duplication, but two real interaction effects worth flagging: (1) `expectationMult` (§6.2) raises `expectedTotal`, which `computeStarPowerDelta.fcMult` already reads (§c.5) — a high-R franchise therefore amplifies the EXISTING fame-swing mechanism (bigger wins, bigger losses for the cast) purely as a side effect, which is exactly Direction B's intent, but it means P17's tuning constants (0.006/0.004/0.006 in §6.2) are implicitly co-tuned with P14's fame delta, not independent — a future P14 rebalance could make P17's multiplier feel stronger or weaker than intended without either package's constants changing. (2) The `a` awareness input (§6.1) is additive to the studio-level `Standing.audienceAwareness` that already reacts to reach/star (§d.1) — for a top studio's own beloved franchise both terms could be elevated simultaneously; `preMarketingAwarenessOf`'s own overall clamp (`reception.ts:571-578`) already bounds the combined effect, so this is a plausible-but-untested compounding, not an unbounded one. Recommend a specific playtest: a studio's #1 franchise, at high Standing, releasing a continuation — check the combined awareness/marketing-capacity number is not saturating trivially.

**Exploit surface.**
- *Fast-sequel spam*: tested directly (§8 self-critique mini-case, 8 mediocre releases at 15-week cadence — see `m1c_rmf_sim.py` output). F climbs unboundedly (21→39→56→74→92→109→127→144, roughly +17.6/cycle, no saturation on the raw debt) and both outputs the model actually hands to other packages collapse under it: `a` falls to 0.057 and `E` hits its floor of 0.6 by the 5th spam release. The spec's "no per-count penalty" is honored literally (nothing reads a count), but the emergent behavior still self-limits spam because paydown can never outrun accrual at that cadence — this is the intended "no cooldown, but not free" outcome, not a loophole.
- *Dormancy as a free fatigue reset*: addressed structurally in §7 — F recovers on an ordinary (short) clock regardless of dormancy, so there is no reward for waiting past the point debt clears, and R (which the nostalgia bonus is keyed to) can only fall, never rise, while waiting. Not a hard proof, but the two clocks are the right shape to make "wait forever" strictly dominated by "wait until F clears, then go."
- *Reboot-as-fatigue-cure*: this is the **weakest point of this shape**, confirmed numerically (§8 self-critique mini-case): the SAME bad Q (0.284) produces ΔF=25.77 as a direct sequel (similarity 0.90) but only ΔF=10.02 as a reboot (similarity 0.35) — rebooting is mechanically the cheapest way to keep releasing into a franchise while accruing the least debt per bad film, by construction of the fixed similarity-by-type table. Direction H explicitly wants reboots to be "useful when continuity stale/damaged/dormant/confusing," so a genuinely lower fatigue cost for a *bona fide* reboot is arguably correct — the risk is a studio (or rival) relabeling every continuation as a "reboot" purely to dodge fatigue accrual with no real creative or continuity reset behind it. **Smallest correction**: this is a bounded-branching problem (Direction N), not a fatigue-formula problem — cap how often a *new* reboot branch may be created for a given StoryProperty (e.g., a new reboot branch requires the CURRENT branch to already be COOLING or worse), rather than touching the fatigue formula or reopening Direction D's no-cooldown rule. This keeps the fix inside the branch-creation rule P16/P17 already need for Direction N's "small number of spin-off branches, no spaghetti graphs," and leaves §2.4 untouched.

**Where this shape is weakest overall.** The ≤4-entry momentum ledger is an excellent legibility device but is a genuinely arbitrary cap — Case D happens to produce exactly 4 releases, a clean fit, but a franchise with 6+ closely-spaced continuations (not modeled in any of the seven required cases) would silently drop its 5th-oldest contributor from the tooltip while that contributor might still hold real residual value (e.g., a strong Film 1 dropped from a 5-film ledger while its 26-week-half-life value is still nonzero at high cadence). The dropped value is not lost from `M(t)` incorrectly — the entry is simply removed, so `M(t)` after eviction slightly understates what an uncapped ledger would show. This is a legibility-vs-completeness trade the brief explicitly asked for ("ledger of the last N (≤4)"), but it is worth flagging that at very fast cadences (sub-13-week gaps) it can visibly truncate real, still-relevant history.

---

## 12. Constants — full list of starting points

| Constant | Value | Meaning |
|---|---|---|
| `R_RISE_RATE` | 0.70 | R's jump-fraction toward a target above current R |
| `R_FALL_RATE` | 0.12 | R's drift-fraction toward a target below current R |
| `R_HALF_LIFE_WEEKS` | 780 (15yr) | passive weekly decay of R |
| `M_SCALE` | 60 | ledger entry magnitude scale (±60 range) |
| `MOMENTUM_HALF_LIFE` | 26 weeks | default per-entry decay |
| `SPINOFF_SEED_HALF_LIFE` | 13 weeks | inherited-seed decay (faster) |
| `LEDGER_CAP` | 4 | max simultaneous ledger entries |
| `FATIGUE_SCALE` | 40 | ΔF = scale × (1−Q) × similarity |
| `BASE_PAYDOWN` | 0.6 / week | baseline debt recovery rate |
| `QUALITY_BONUS_MAX_MULT` | 2.5x | paydown multiplier at Q=1.0 (interpolated from 1.0x at Q=0.5) |
| `ACTIVE_PRODUCTION_DAMPING` | 0.4x | paydown multiplier while a continuation is in production |
| similarity: direct sequel / prequel / remake / spin-off / reboot | 0.90 / 0.85 / 0.60 / 0.45 / 0.35 | continuation-type input buckets |
| `REACTIVATION_WINDOW` | 26 weeks | ACTIVE AGAIN eligibility window |
| `DORMANT_WEEKS` | 156 weeks (3yr) | DORMANT / REVIVAL threshold |
| `ACTIVE_WEEKS` | 104 weeks (2yr) | COOLING threshold on time alone |
| `REVIVAL_R_MIN` | 25 | minimum R for REVIVAL CANDIDATE |
| `FATIGUE_REST_MAX` | 15 | maximum F counted as "rested" |
| awareness weights `wR`/`wM` | 0.65 / 0.35 | §6.1 |
| `NOSTALGIA_BONUS` | 0.20 (max +20%) | §6.1, gated to DORMANT/REVIVAL bands, scaled by R |
| expectation coefficients | +0.006·R, +0.004·M, −0.006·min(F,100), clamp [0.6, 1.8] | §6.2 |

Every constant above is a starting point for the report's tuning pass, not a final value.
