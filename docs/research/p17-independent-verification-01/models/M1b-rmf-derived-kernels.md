> **STATUS: HISTORICAL INPUT (revision 02, 2026-09-12).** Unmodified research input below this line. Where it differs from the canonical specification — report [`../P17-INDEPENDENT-VERIFICATION-REPORT.md`](../P17-INDEPENDENT-VERIFICATION-REPORT.md) §5 (index §5.7, with §8/§9/§10), canonical calculator [`../redteam/R3-reviewer-corrections-calc.py`](../redteam/R3-reviewer-corrections-calc.py), committed output [`../redteam/R3-output.txt`](../redteam/R3-output.txt) — **the report governs.** Superseded here: a candidate shape; its kernels became the base of the canonical rule, but ungated Recognition, per-branch Fatigue and the O(n) recompute are superseded.

# P17 Model B — DERIVED-FROM-INSTALLMENTS Recognition/Momentum/Fatigue

**Modeler:** RMF modeler B. **Shape:** zero mutable meters. The Franchise root stores only
an ordered installment list (`productionId`, `releaseWeek`, `type`, `similarity`, `branch`)
plus a handful of identity/branch scalars. **R, M, F are pure functions of that list and the
current week, re-derived on every query from the public `FilmResult` fields they join to.**
Nothing is written back after release except the one new installment row. This is the
"replay the tape" model, as opposed to a "keep a running total" model: it trades a small,
bounded recompute cost for perfect reproducibility, zero drift risk across saves/migrations,
and a tooltip that can show its work per-film because every output is a literal sum of
per-installment terms.

Throwaway calculator for every number in this file: `models/m1b_derived_kernels.py` (this
folder). Read-only; no repo/build/runtime activity anywhere in this pass.

Source-tier labels follow CONTEXT.md. All constants below are **STARTING POINTS**, explicitly
flagged where introduced — nothing here is a shipped tuning value.

---

## 1. State stored per Franchise (and per branch/SubProperty)

```ts
// P17 root, GameStateV20 — additive per f.2's law: scalars + id lists only, never a
// copy of FilmResult/FilmParticipants (evidence 02 §f.2, DEVELOPER/OFFICIAL @13370d42).
type Franchise = {
  franchiseId: string                 // == the exact P16 StoryProperty ID (direction M/I; INT-012)
  rightsOwnerRef: string              // P16 current owner id, read-only to P17 (direction L)
  branches: FranchiseBranch[]         // bounded, small (direction N)
  subProperties: SubPropertyRef[]     // direction J — id + parentBranchId + kind, no formulas of its own
  installments: FranchiseInstallment[] // THE ONLY THING THAT DRIVES R, M, F
  milestones?: MilestoneRef[]         // optional, id+kind+week only (e.g. "first $1B", display-only)
}

type FranchiseBranch = {
  branchId: string
  kind: 'main' | 'reboot' | 'spinoff'
  parentBranchId: string | null       // reboot/spinoff point back to the branch they forked from
  openedWeek: number
}

type FranchiseInstallment = {
  productionId: string                // join key into FilmResult / Studio.releasedFilms / IndustryFilm — a.1
  releaseWeek: number                 // == FilmResult.releaseTick, copied once at release, never re-derived
  branchId: string
  type: 'original' | 'direct_sequel' | 'prequel' | 'spin_off' | 'remake' | 'reboot'  // direction A
  similarity: number | null           // 0..1 input at creation time (null for the branch's founding film); direction unspecified elsewhere, defined in §2 below
}
```

**No `recognition`, `momentum`, or `fatigue` field exists anywhere in this shape.** R(t), M(t),
F(t) are computed by three pure functions — `recognitionOf`, `momentumOf`, `fatigueOf` — each
taking `(installments, nowWeek, scopeFilter)` and reading `criticScore`, `boxOffice.total`,
`audienceScore` (via `filmAudienceScore`/`aggregateAudienceScore`, `receptionVerdict.ts:21-117`,
02 §d.3) and `forecast.expectedTotal` off the joined `FilmResult` (`types.ts:241-264`, 02 §a.1).
This is exactly what the brief calls for and it is what makes the shape self-verifying: replay
the same installment list and public results, get the same R/M/F, every time, on any machine,
after any migration — because there is nothing else that could have drifted.

`scopeFilter` is what lets one function serve three different questions with zero duplication:
- Recognition is queried with **no branch filter** — it is a StoryProperty-wide fact (direction
  Q, direction H "reboot ... keeps StoryProperty recognition").
- Momentum and Fatigue are queried **per branch** (and, when a SubProperty is asked about, per
  SubProperty by filtering to its own installments) — this is what makes a reboot's Momentum/
  Fatigue reset "free" in the sense of costing no special-case code (see §8) while leaving
  Recognition, which is deliberately NOT branch-scoped, untouched.

---

## 2. Update rule at each release

There is no update rule in the "mutate a stored number" sense. **Release** does exactly one
thing to this root: append one `FranchiseInstallment` row (join to the new `productionId`,
copy `releaseWeek`, `type`, `similarity`, `branchId` — `similarity` and `type` are chosen by
the player/rival at greenlight, not derived). That is the entire write path. Everything else —
what R, M, F equal this week, next week, or in twenty years — is arithmetic performed at read
time over the row list plus whatever `FilmResult`s those rows point to.

**Inputs read per installment `i` (public `FilmResult` fields only, never written by P17):**

```
critic_i    = FilmResult.criticScore                                   (0..100)
audience_i  = filmAudienceScore(state, film)  or  aggregateAudienceScore(...)   (0..100; receptionVerdict.ts:21-117)
total_i     = FilmResult.boxOffice.total
expected_i  = FilmResult.forecast.expectedTotal                        (locked at greenlight, d.3)
comparator_i = total_i / expected_i            // SAME ratio computeStarPowerDelta already reads for fcMult, c.5 — reused, not duplicated
quality_i   = 0.5*(critic_i/100) + 0.5*(audience_i/100)                (0..1; new P17-owned pure helper, DESIGN INFERENCE — no such blend exists in the engine today)
reach_i     = total_i / (total_i + 10,000,000)                        // IDENTICAL constant and shape to starPower.ts's reach01 (c.5) — reused on purpose so a $10M saturation point means one thing everywhere in the codebase
```

`similarity_i` (continuation-type input, chosen at greenlight, not derived — the brief's
required "direct sequel/prequel = high, spin-off/reboot = lower, remake = medium"):

| type | similarity (starting point) |
|---|---|
| original | n/a (the branch's founding film never has a "similarity to what came before in this branch") |
| direct_sequel / prequel | 0.9 |
| remake | 0.7 |
| spin_off | 0.5 |
| reboot | n/a for its OWN branch's Fatigue (it is the new branch's founding film — see §8 for the separate, one-time legacy-comparison term this type gets instead) |

---

## 3. The three kernels

### 3.1 Recognition — StoryProperty-wide, peak-anchored, slow

```
peakScore_i = reach_i * quality_i * 2^(-age_i / HL_R)         age_i = nowWeek - releaseWeek_i
```
Rank every released installment across **every branch of the property** (main, reboots,
spin-offs alike) by `peakScore_i` descending. The single highest scorer counts at full weight;
every other installment counts at a small residual weight `κ_R`:

```
R(now) = clamp( 100 * [ peakScore_(rank1) + κ_R * Σ_{rank≥2} peakScore_i ] , 0, 100 )
```

`HL_R = 650 weeks (~12.5 years)`. `κ_R = 0.15`. Both STARTING POINTS.

**Why max-then-residual, not sum or average, is what makes this "no full lifetime average"
(direction Q):** a franchise's single defining hit decays on **its own** clock, undiluted by
whatever mediocre films came after it — a later flop can only ever add a small `κ_R`-weighted
drag if the flop itself scores low, it cannot pull the surviving peak term down, because the
peak term is a `max`, not part of a running mean. This is the literal mechanism, not a
description of one — Case C below shows it numerically (Recognition drops 86.7→85.4 after an
iconic-hit-then-flop, i.e. essentially unmoved, because Film 2's own low `peakScore` never
displaces Film 1's as the rank-1 term).

Per-installment auditability (the tooltip the brief asks for) falls out for free: `R` is a
literal sum of `100 * weight_i * peakScore_i` terms, one per installment, so "Film 1
contributes +79, Film 2 contributes +4, fading by half every 12.5 years" is not a
post-hoc explanation bolted onto a black box — it is the calculation.

### 3.2 Momentum — per branch, fast, decays to neutral

```
surprise_i = clamp( 0.5*(comparator_i - 1) + (quality_i - 0.5) , -1, 1 )
M_branch(now) = clamp( Σ_{i in branch} 100 * surprise_i * 2^(-age_i / HL_M) , -100, 100 )
```
`HL_M = 24 weeks (~5.5 months)`. STARTING POINT.

`surprise_i` is centered so that "met forecast (comparator=1) with a 50/100 critic+audience
blend" contributes exactly zero — a film that neither beat nor missed its own locked
expectation, and was neither good nor bad, is Momentum-neutral by construction. Both halves
of a franchise's reception (did it beat ITS OWN forecast; was it actually good) matter, and
either one alone can carry or sink the term — a beloved film that undershot a wildly
optimistic forecast still contributes positively if `quality_i` is high enough, matching the
empirical finding that reception, not the forecast miss alone, drives real-world sequel
momentum (03e §11.1, Basuroy & Chatterjee 2008).

This is a literal per-installment sum too: "Film 2 contributes −12 to Momentum, fading by
[now + a few half-lives]" is `100*surprise_2*decay(age_2)` read straight off the list — exactly
the brief's own tooltip example, produced with no extra bookkeeping.

### 3.3 Fatigue — per branch, slower, driven by (1−quality)·similarity

```
F_branch(now) = clamp( Σ_{i in branch, i not the branch's founding film} 100 * similarity_i * (1 - quality_i) * 2^(-age_i / HL_F) , 0, 100 )
```
`HL_F = 104 weeks (~2 years)`. STARTING POINT.

Excellent output (`quality_i → 1`) drives `(1-quality_i) → 0`: an excellent similar sequel adds
almost nothing to Fatigue, matching the brief's requirement directly and the observed-history
finding that steady QUALITY at steady cadence does not fatigue (03e §11.1 Sood & Drèze; 04a Q.B
Despicable Me / 2012–2019 MCU as the non-fatigue controls). Mediocre output (`quality_i≈0.55`)
at high similarity (`0.9`, a direct sequel) contributes a real, visible amount per release —
see Case D. Low-similarity types (spin-offs, `0.5`) contribute roughly half as much Fatigue for
the identical reception, which is the mechanical reason spin-offs and reboots exist as
distinct types at all (03e §13 ADAPT: "key Fatigue to SAMENESS ... rather than to installment
count").

**"Recovers with rest" is not a second rule — it is the same exponential decay applied to
whatever is already in the sum.** No new releases means no new terms are added; every existing
term keeps shrinking on its own `HL_F` clock. There is deliberately no separate "Fatigue rise
rate vs. Fatigue decay rate" — the asymmetry the brief describes (rises faster for mediocre than
excellent) is a magnitude-at-release effect (`(1-quality_i)` is bigger for a worse film), not a
rate effect; recovery is simply what the same half-life looks like once nothing new is being
added. Rapid, tightly-spaced mediocre releases still visibly compound Fatigue under this rule,
because each new term lands on top of the still-substantially-undecayed previous one (Case D:
`F` climbs 0 → 40 → 70 → 93 across four releases 40 weeks apart, because at `HL_F=104` a
40-week-old contribution has only decayed to 73% of its original size before the next one
stacks on).

---

## 4. Descriptor bands — derived, never a stored state

```
band(installments, now, branch):
  if branch has no releases yet:                         "NEW"
  R  = recognitionOf(installments, now)                    // property-wide
  M  = momentumOf(installments, now, branch)
  F  = fatigueOf(installments, now, branch)
  weeksSinceLast = now - releaseWeek of branch's most recent installment
  gapBeforeLast  = (releaseWeek of branch's last installment) - (releaseWeek of its second-to-last), or null if <2 releases

  if weeksSinceLast > DORMANT_WEEKS:
      return  R >= REVIVAL_R_BAR  ?  "REVIVAL CANDIDATE"  :  "DORMANT"
  if gapBeforeLast != null and gapBeforeLast > DORMANT_WEEKS and weeksSinceLast <= 26 and M >= 0:
      return "ACTIVE AGAIN"          // this branch itself just came back from a long gap and landed
  if M < MOMENTUM_COOL or F >= FATIGUE_HOT:
      return "COOLING"
  return "ACTIVE"
```
`DORMANT_WEEKS = 150 (~2.9 years)`, `REVIVAL_R_BAR = 25`, `MOMENTUM_COOL = -5`,
`FATIGUE_HOT = 60`. All STARTING POINTS, all thresholds on the same three derived numbers a
player can already see — no sixth "hidden phase" variable is introduced.

Two properties worth naming explicitly because they are exactly what direction P asks for:
- **"ACTIVE AGAIN" is detected from the installment list's own release-date gaps, not stored.**
  A branch that goes quiet for years and then releases again is *automatically* relabeled,
  because `gapBeforeLast` is just a second lookback into the same list.
- **A brand-new branch (a reboot) is never "ACTIVE AGAIN" — it is plain "ACTIVE."** Its own
  installment list starts empty, so `gapBeforeLast` is null the moment it has exactly one
  release. "ACTIVE AGAIN" is reserved for a *legacy sequel inside the same continuity* coming
  back after a long gap (direction H's "no arbitrary wait" case); "reboot" is a different,
  branch-level event (§8). This distinction costs nothing extra — it is what the same two-line
  lookback naturally produces for two different input shapes.

---

## 5. The two outputs P17 hands to other packages

Both are pure functions of `(R, M, F)` for the branch in question — no new formula duplicates
anything P07/P11 already owns; they are the seam values evidence §d.4 names exactly
(`ReceptionInputs` optional field, `Production.forecastSnapshot` read).

**(a) Inherited awareness/reach, 0..1, for P07's optional `ReceptionInputs` seam
(`reception.ts:87-103` precedent, §d.4):**
```
awarenessInput = clamp( 0.8*(R/100) + 0.2*(max(M,0)/100) , 0, 1 )
```
Only *positive* Momentum adds to awareness; a franchise on a downswing does not get its public
awareness suppressed through this channel (people still know what it is — they are just less
excited), matching direction C ("failures reduce excitement," not "erase recognition"). The
downside of a downswing is expressed entirely through (b), never here.

**(b) Expectation multiplier for the forecast's `expectedTotal` (feeds `Production.forecastSnapshot`
before `computeStarPowerDelta.fcMult` and the newspaper's `boxDelta` ever see it — d.3, c.5):**
```
expectationMultiplier = clamp( 1 + 0.006*R + 0.004*max(M,0) - 0.005*F , 0.7, 2.0 )
```
This is the one and only place "higher expectations, bigger reputational downside" (direction
B) is expressed: P17 never touches `computeStarPowerDelta` or `salaryCurve` (both stay exactly
as evidence §c.5/§c.6 describes them); P17 only changes what `expectedTotal` a continuation is
measured against, and the existing `fcMult`/`boxDelta`/broadcast-band machinery does the rest
with **zero new formulas** downstream (§d.4's whole point).

---

## 6. Nostalgia/revival (direction D, P) without a free fatigue reset

There is **no separate "revival bonus" formula.** A reboot or a post-dormancy legacy sequel
reads the exact same `awarenessInput`/`expectationMultiplier` in §5 that any other continuation
reads — the "nostalgia" is simply whatever `R` the property still has when the new film is
greenlit. Because `R`'s decay is monotonic (§3.1 — it only ever goes down during dormancy, it
never grows from waiting), there is **no reward for waiting longer**:

| weeks dormant | `decay_R` (HL=650wk) | reading |
|---|---|---|
| 130 (2.5 yr) | 0.871 | barely touched |
| 520 (10 yr) | 0.574 | roughly half the original peak weight |
| 1040 (20 yr) | 0.330 | about a third |
| 1872 (36 yr) | 0.136 | mostly gone |

A branch's own Momentum/Fatigue reset the instant a *new branch* opens (§3.2/§3.3 are branch-
scoped; an empty branch has no terms to sum), **on day one of dormancy just as much as on day
7300** — so there is no in-model incentive to sit on a franchise before rebooting it; every week
waited only costs Recognition, and the "clean M/F" is available immediately. This is the
concrete, numeric answer to "does dormancy become a free fatigue reset that rewards waiting":
**no** — because the reset was never gated on dormancy length in the first place, it is gated on
opening a new branch, which costs a full production (§9's economic point) regardless of when
you do it.

A **remake** (direction I, distinct from reboot) gets the mirror-image treatment: a one-time,
greenlight-time-only "legacy comparison" penalty applied to the SAME `expectationMultiplier`,
scoped to the specific prior `FilmResult` it remakes:
```
legacyComparisonPenalty = comparisonWeight * quality_ref * 2^(-age_ref / HL_M)   // note: the FAST half-life, not HL_R
expectationMultiplier_remake = expectationMultiplier - legacyComparisonPenalty
```
Using `HL_M` (fast) rather than `HL_R` for this term is the deliberate mechanism behind
direction H's "remakes face redundancy/comparison pressure if very recent; dormancy/nostalgia
helps" — a remake of a film that is still fresh and beloved (`age_ref` small, `quality_ref`
high) is judged hard against it; the SAME remake proposed decades later pays almost nothing
here (the comparison itself has faded), even though the property's own `R` (the slow kernel)
has not faded nearly as much. This is why remake and reboot read differently off an identical
state shape: a reboot never pays this term at all (it explicitly does not invite direct
comparison — direction I), a remake always evaluates it against the one specific film it
retells.

---

## 7. Rival compactness — the three-line policy rule

Attaches to the existing seam evidence §e.5 already names (`hollywoodTick.ts` `decide()` step 2,
`policy.version: 2`, no new forecast):

```
1. IF thisBranch.band ∈ {ACTIVE, ACTIVE AGAIN} AND M > policy.continuationBar:
      propose a same-branch continuation (type = direct_sequel by default) via the existing chooseIndustryPackage grid.
2. ELSE IF someBranch.band == REVIVAL CANDIDATE AND R > policy.revivalBar:
      propose a REBOOT (new branch) instead of an original commission.
3. ELSE: fall through to today's unchanged genre-affinity roulette (hollywoodTick.ts:175-184).
```
Two scalar knobs (`continuationBar`, `revivalBar`) join `policy`'s existing closed shape
(`{version, affinities, negativeScale, marketingRatio, reserveWeeks}`, `hollywoodValidation.ts:
204-211`) — `policy.version: 2` plus a validator widening, exactly as §e.5 anticipates. Rivals
read the *identical* `R`/`M`/`F`/band functions over their own `IndustryFilm` results (same
`resolveReception`→`buildFilmResult`→`applyReleaseCareers` chain, §e.4) — there is no second
rival-only formula, satisfying direction K.

---

## 8. Save cost — bytes per franchise

No stored meters (0 bytes for R, M, F — the entire point of this shape). Per-installment row,
JSON-ish estimate: `productionId` (~24–36B), `releaseWeek` (4B numeric), `branchId` (~8–16B
short id), `type` (1 enum tag, ~1B packed / ~14B as a JSON string key+value), `similarity`
(4–8B). With key names, a realistic JSON encoding is **~90–120 bytes/installment**. Root
scalars (`franchiseId`, `rightsOwnerRef`, `branches[]` at ~3–5 branches × ~60B, `subProperties[]`,
optional `milestones[]`) add roughly **150–250 bytes** of fixed overhead.

| franchise size | installments | estimated bytes |
|---|---|---|
| typical (5 films, 1 branch) | 5 | ~250 + 5×105 ≈ **775 B** |
| large (spin-off + reboot, 12 films) | 12 | ~250 + 12×105 ≈ **1,510 B** |
| MCU-scale outlier (35+ films) | 35 | ~250 + 35×105 ≈ **3,925 B** |

Even the outlier case lands near a single **film**'s own already-oversized record (3,146.43 B,
f.2's own missed-target figure) — and a save has one Hollywood-scale outlier at most, not one
per franchise. This comfortably satisfies direction M's "lightweight ... not a second
production-management system" and f.2's compactness requirement. The one honest caveat: the
installment list is append-only and never pruned, so in principle a decades-long save with an
extremely prolific rival franchise grows this root without bound; §11 below flags a possible
"prune installments older than ~2×HL_R" optimization as a later, non-blocking concern, not a
base-model requirement.

---

## 9. Seven paper histories

All tables computed by `models/m1b_derived_kernels.py`. Assumption used only to translate the
brief's "Nx forecast" ratios into dollars for the `reach01` term: `expectedTotal = $150M` for
every case (a representative studio-tentpole forecast; flagged because at this budget scale
`reach01` is nearly saturated — see §11.5 — so in these seven tables Recognition's variation is
driven almost entirely by `quality`, not by `reach`; a modest-budget property would show far
more `reach` discrimination in real play). `quality = 0.5·critic + 0.5·audience` throughout;
where the brief does not give an audience score, one consistent with the stated critic score is
assumed and flagged per case.

### CASE A — breakout original, immediate fast follow-up
Film 1: critic 85, audience 80, comparator 2.2×. Film 2 begins development at week 4, releases
at week 60; the brief gives no Film 2 reception, so this case is read at the greenlight/
pre-release decision points only — exactly the "what does the player see before greenlighting"
question the brief asks for.

| week | event | R | M | F | band | expectationMultiplier | awarenessInput |
|---|---|---|---|---|---|---|---|
| 0 | Film 1 releases | 80.1 | 92.5 | 0.0 | ACTIVE | 1.850 | 0.826 |
| 4 | Film 2 greenlit | 79.7 | 82.4 | 0.0 | ACTIVE | 1.808 | 0.803 |
| 60 | Film 2 releases | 75.1 | 16.4 | 0.0 | ACTIVE | 1.516 | 0.634 |

**Player sees (week 4, greenlighting Film 2):** *ACTIVE — "A sequel greenlit now inherits
strong awareness (0.80) and would be expected to do roughly 1.8× a comparable new property's
forecast."* Nothing here penalizes the 4-week dev start; Momentum is still near its post-release
peak. **Rival policy:** band=ACTIVE, M(82.4) far above any reasonable `continuationBar` → rule 1
fires, rival proposes a same-branch sequel immediately, same as the player could. This is the
direct demonstration of "a huge recent hit may make a FAST follow-up MORE attractive" (direction
C/D) with no special-cased exception — it falls out of M simply still being high at week 4.

### CASE B — two straight hits, spin-off 40 weeks later (must not be punished for speed)
Film 1 (main): critic 82, audience 80, comparator 1.9×. Film 2 (main, direct sequel,
similarity 0.9): critic 80, audience 78, comparator 1.7×, week 52. Spin-off (new branch,
similarity 0.5): critic 75, audience 74, comparator 1.4×, week 92 (40 weeks after Film 2).

Main branch:

| week | R (property) | M (main) | F (main) | band | expectationMultiplier |
|---|---|---|---|---|---|
| 0 | 78.3 | 76.0 | 0.0 | ACTIVE | 1.774 |
| 52 | 87.1 | 80.9 | 18.9 | ACTIVE | 1.752 |
| 92 | 94.2 | 25.5 | 14.5 | ACTIVE | 1.594 |

Spin-off branch:

| week | R (property) | M (spinoff) | F (spinoff) | band | expectationMultiplier |
|---|---|---|---|---|---|
| 92 | 94.2 | 44.5 | 0.0 | ACTIVE | 1.743 |

**Player sees (greenlighting the spin-off at week ~90):** *ACTIVE — "This property is at its
strongest recorded Recognition (94.2). A new spin-off inherits high awareness (0.84) and would
be expected to open well above baseline."* The main branch never drops below ACTIVE at any
point in this run — the model does not punish the 52-week and 40-week cadences at all, because
both Film 2 and the spin-off were genuinely well-received (`quality>0.7` throughout keeps
Fatigue contributions modest — 18.9 at peak, well under the 60 "hot" threshold). **Rival
policy:** ACTIVE + high M at every decision point → rule 1 (continuation) or, once the spin-off
branch itself reads REVIVAL-eligible R with its own strong band, an equally aggressive
follow-up; a rival with this exact history would keep producing on the same cadence the player
just did, which is the required non-punishment made concrete.

### CASE C — iconic hit then flop (Recognition holds, Momentum falls, salvageable)
Film 1: critic 90, audience 88, comparator 2.5×. Film 2 (direct sequel, similarity 0.9): critic
45, audience 40, comparator 0.6×, week 78.

| week | R | M | F | band | expectationMultiplier |
|---|---|---|---|---|---|
| 0 | 86.7 | 100.0 | 0.0 | ACTIVE | 1.920 |
| 78 | 85.4 | −16.5 | 51.4 | COOLING | 1.255 |

**Player sees (right after Film 2's flop):** *COOLING — "Recognition is essentially unmoved
(85.4, was 86.7) — this is still a major property. Momentum has swung sharply negative and
Fatigue is elevated; the next release will be judged against a much more modest forecast
(1.25× baseline, down from 1.92×) rather than being written off."* This is the numeric proof of
"Recognition stays high; Momentum falls; franchise salvageable" — the 1.3-point Recognition
drop is a rounding error next to Film 1's own peak-anchored contribution, because Film 2's own
`peakScore` (driven by its 0.425 quality) never comes close to displacing Film 1's as the rank-1
term (§3.1). **Rival policy:** band=COOLING → falls through rule 1 (M is negative) and rule 2
(this is not yet DORMANT) → rule 3, ordinary genre roulette; a rival would NOT chase this
property again immediately, matching real-world caution after a bad sequel (04a Q.C) without
declaring the franchise dead.

### CASE D — rapid mediocrity (Fatigue must become important, visibly)
Four direct sequels (similarity 0.9), critic 57, audience 55 assumed, comparator 0.9×, every 40
weeks (weeks 0, 40, 80, 120).

| week | R | M | F | band | expectationMultiplier |
|---|---|---|---|---|---|
| 0 | 52.1 | 1.0 | 0.0 | ACTIVE | 1.317 |
| 40 | 59.6 | 1.3 | 39.6 | ACTIVE | 1.165 |
| 80 | 66.8 | 1.4 | 69.9 | **COOLING** | 1.055 |
| 120 | 73.7 | 1.4 | 93.2 | **COOLING** | 0.982 |

**Player sees (after Film 3, week 80):** *COOLING — "Momentum reads roughly neutral (1.4), but
Fatigue is high (69.9) from four similar mediocre releases in quick succession; the next film's
forecast is now BELOW baseline (0.98×) even though nothing has technically flopped."* This is
the case's whole point made numerically explicit: Momentum alone (which stays essentially flat,
1.0→1.3→1.4→1.4, because each film is individually neither a hit nor a disaster) would never
flag a problem; the band flips to COOLING at week 80 **only because Fatigue crosses the 60
threshold**, exactly the "visibly important" signal the brief asks for, and it happens from
ordinary similar-and-mediocre output, with no single flop anywhere in the run. **Rival policy:**
ACTIVE→COOLING transition between week 40 and week 80 → a rival stops proposing continuations
of this property under rule 1 by week 80 even though its own "did we make money last time"
read would still look mildly positive — the compact policy reacts to the same visible signal a
player does.

### CASE E — twenty years of dormancy
Single defining hit: critic 88, audience 85, comparator 2.0×, week 0. No further releases
through week 1040 (20 years).

| week | R | M | F | band |
|---|---|---|---|---|
| 0 | 83.7 | 86.5 | 0.0 | ACTIVE |
| 260 (5 yr) | 63.4 | 0.0 | 0.0 | REVIVAL CANDIDATE |
| 520 (10 yr) | 48.1 | 0.0 | 0.0 | REVIVAL CANDIDATE |
| 1040 (20 yr) | 27.6 | 0.0 | 0.0 | REVIVAL CANDIDATE |

**Player sees (browsing dormant IP at week 1040):** *REVIVAL CANDIDATE — "Recognition has
decayed to about a third of its peak but remains meaningful; Momentum and Fatigue have both
returned to neutral. A well-executed revival could still command real awareness."* This is
"Recognition partially persists; Momentum near neutral; Fatigue recovered; revival opportunity
visible" reproduced as literal numbers from the same formula that ran on day one — no
dormancy-specific code path exists; it is simply what §3's decay curves look like at `age=1040`.

### CASE F — successful reboot after Case E
Case E's history, plus a reboot (new branch) at week 1040: critic 85, audience 80, comparator
1.6×.

| week | R (property) | M (reboot branch) | F (reboot branch) | band (reboot branch) | expectationMultiplier |
|---|---|---|---|---|---|
| 1040 | 83.3 | 62.5 | 0.0 | ACTIVE | 1.750 |

Recognition's own per-installment breakdown at week 1041 — `[('Reboot', +79.1), ('DefiningHit',
+4.1)]` — shows the reboot's own excellent reception immediately becomes the new rank-1 peak
term (its `peakScore` of 0.79 beats the 20-year-decayed original's 0.28), restoring R to nearly
its original height in one release, while the branch's own Momentum/Fatigue start completely
clean (nothing preceded this film in `reboot1`). **Player sees:** *ACTIVE — "A strong reboot has
essentially restored this property's Recognition and opened with excellent Momentum."*
**Rival policy:** band flips DORMANT/REVIVAL CANDIDATE → ACTIVE the moment this release posts;
a rival reading the same property would now treat it as a live continuation target under rule 1.

### CASE G — failed reboot after Case E
Same dormancy, poor reboot: critic 40, audience 35, comparator 0.5×.

| week | R (property) | M (reboot branch) | F (reboot branch) | band (reboot branch) | expectationMultiplier |
|---|---|---|---|---|---|
| 1040 | 37.2 | −37.5 | 0.0 | COOLING | 1.223 |

**Player sees:** *COOLING — "The reboot underperformed a forecast that was already elevated
(1.17× baseline) by the property's residual Recognition; Recognition itself is still real
(37.2, not zero) but Momentum on this new branch is now sharply negative."* This is "high
expectations" made concrete and asymmetric with Case F: the *same* dormant Recognition (27.6
pre-release) that gave the successful reboot in Case F a flattering 1.75× tailwind gives this
one a 1.17× **headwind to fall short of** — the model does not know in advance which way a
reboot will go, it just sets the bar from R either way, and c.5's existing `fcMult`/`boxDelta`
machinery (unchanged, read-only) then registers the miss downstream for free. **Rival policy:**
COOLING, new branch, M sharply negative → rule 1 does not fire again for this branch; a rival
would not double down on a reboot that just missed this badly, matching 04a's Genisys/Dark Fate/
TASM2001 evidence that a reboot is not by itself a fatigue cure that guarantees success.

---

## 10. Self-critique

**Legibility.** A player who has only ever seen the descriptor band, not the raw numbers, can
recover the direction (not the exact value) of what happened: ACTIVE↔COOLING is driven by
either "the last thing we made underperformed its own forecast" (M) or "we've been putting out
too much similar mediocre stuff lately" (F) — both are plain-language readable from the same two
sentences the forecast tooltip already shows. The one place legibility gets harder is Case D:
the band flips from ACTIVE to COOLING while Momentum barely moves (1.0→1.4 throughout) — a
player watching only Momentum would be surprised by the flip. This is intentional (it is the
exact "Fatigue becomes important, visibly" requirement) but it means the UI must surface F
explicitly, not just a single blended "heat" number, or the flip will read as arbitrary.

**Double counting with P07/P14.** `computeStarPowerDelta`'s `fcMult` already reacts to
`total/expectedTotal` for actor fame (c.5); this model's `expectationMultiplier` changes
`expectedTotal` itself before that ratio is even taken. That is not a duplicated formula (they
are two different functions — `fcMult`'s clamp-and-scale vs. this model's R/M/F blend — reading
the same public ratio for two separate purposes, exactly the pattern §d.4 endorses), but it is a
real **compounding channel**: a hyped continuation that "merely" matches a normal film's
absolute performance will now register as an actor-fame-losing miss (lower `fcMult`) purely
because P17 raised the bar it is measured against. That is direction B working as intended
("higher expectations ... bigger reputational downside"), not a bug — but it means a badly
mis-tuned `expectationMultiplier` constant would leak directly into actor career outcomes that
have nothing to do with franchise mechanics, so those constants deserve their own tuning pass
against P14 fame data, not just against P17's own case tables. Separately: because
`expectationMultiplier` is computed BEFORE release and `surprise_i` is computed FROM the
resulting `comparator_i` AFTER release, each franchise measures its own future films against a
bar it itself raised — the arithmetic worked example in this file (Case A, §11.2 below) shows
this is a *self-damping*, not a self-reinforcing, loop: no exploit risk, but worth naming
explicitly since a naive reading of "hits make you hotter which raises expectations" sounds like
it could compound into a runaway number, and it provably does not.

**Exploit surface.**
- *Fast-sequel spam:* not free. §11.2 below shows a sequel that only meets its own (already
  inflated) new forecast contributes far less fresh Momentum than the original breakout did —
  each subsequent win must be increasingly good in absolute terms to keep M climbing at the
  same rate, because the yardstick itself moves. Spam without genuine quality caps out fast.
- *Dormancy-as-free-reset:* provably absent (§8's decay table) — R only ever falls during
  dormancy, and a branch's clean M/F=0 slate is available on day one of a new branch regardless
  of how long the old one sat idle, so there is no in-model reason to wait.
- *Reboot-as-fatigue-cure:* real, by design (direction H), and bounded two ways that are worth
  stating separately because the R/M/F math alone does not enforce either: (1) it is not FREE —
  a reboot still requires greenlighting, casting, and producing an entire film, unlike the
  MGT2/"Sequelitis" comparator's costless IP-rename dodge (03e/03b evidence, the "Turn your
  Elder Scrolls 29 into Ultima 1" quote) — the production economy itself is the throttle here,
  not a cooldown; (2) it does NOT reset Recognition, only the branch's own Momentum/Fatigue, so
  laundering a chronically-mediocre property through repeated reboots gets you a clean slate
  each time but never a bigger Recognition base than the property actually has. The one thing
  the R/M/F formulas do *not* prevent on their own is spamming many reboot *branches* of the
  same property in a short span purely to keep dodging Fatigue — that has to be capped by
  direction N's own "small number of branches" governance rule (a data-hygiene/complexity bound
  P16/P17 should enforce directly, e.g. a small lifetime cap on reboot branches per property),
  not by anything in this file's math. **This is the one place I'd flag as needing an explicit
  rule beyond what falls out of the kernels.**

**Where this shape is weakest (vs. a stored-meter model).**
1. *Recompute cost is O(installments), not O(1).* Every read of R rescans every installment the
   property has ever had, across every branch. For a normal franchise (single digits to low
   tens of films) this is trivially cheap; for a save with a decades-long, extremely prolific
   rival "mega-franchise" queried every rival decision-tick (`HOLLYWOOD_DECISION_WEEKS=1`,
   `tuning.ts:27`), it is a real, if bounded, per-tick cost that a stored-meter model would not
   pay. The natural mitigation is memoization keyed on `(franchiseId, week)` — legitimate
   because these are genuinely pure functions of an append-only list, so a cache invalidated
   only on `now` advancing or a new installment landing is exact, not an approximation — but
   that is an implementation detail this model incurs and a stored-meter model does not.
2. *Rank-based peak weighting has a knife-edge.* Recognition's "rank-1 gets full weight, the
   rest get κ_R" rule keeps the tooltip a clean flat sum, but two installments with nearly-tied
   `peakScore`s can swap which one is "the peak" from a tiny change in either one's age or
   quality, producing a small but real discontinuity in R that a smoother (e.g. softmax-style)
   weighting would avoid at the cost of a less literally-per-film-additive tooltip. This model
   chose auditability over smoothness; that trade is explicit, not accidental, but the knife-edge
   is real and would show up as an occasional small unexplained R blip in telemetry.
3. *`quality_i = 0.5·critic + 0.5·audience` is a new P17-owned blend with no engine precedent* —
   every other consumer of these two scores keeps them separate (receptionVerdict's tiers,
   c.5's audience-only `audGain`/`loss`). It is a defensible, simple, auditable choice, but it
   is genuinely new surface area, not a reuse of an existing formula, and deserves its own
   sign-off separate from the reused `reach01`/`comparator` pieces.
4. *The seven paper cases understate how much `reach01` actually discriminates in general*,
   because all seven are written as studio-tentpole-scale forecasts; at `$150M` assumed
   `expectedTotal`, `reach01` ranges only 0.88–0.97 across every case in this file (§11's
   printed table), so in these tables Recognition is effectively quality-only. A $5M-forecast
   genre franchise hitting the same 2.2× multiple would show `reach01≈0.52` instead — real
   discrimination — so nothing here should be read as evidence that the reach term is
   redundant; it is redundant only at this file's chosen budget scale.
5. *Unbounded append-only growth.* Nothing in this shape prunes old installments, so a
   multi-decade save's most productive properties grow their row list forever (§8's honest
   caveat). At realistic scales this stays well inside budget, but a future perf pass could
   prune installments once their own peak contribution decays below, say, `κ_R`-relevance
   (roughly `2×HL_R`) into a single rolled-up residual scalar without breaking "no full lifetime
   average" — flagged as an open question, not a defect, since nothing in the seven cases above
   comes close to needing it.

---

## 11. Supporting arithmetic referenced above

**§10 "fast-sequel spam is self-damping" worked check** (Case A, hypothetical Film 2 that
exactly meets its own already-inflated forecast with a decent-not-spectacular 70/70
critic/audience): `comparator=1.0` (meets the NEW, elevated bar exactly), `quality=0.7` →
`surprise = 0.5·(1.0-1) + (0.7-0.5) = 0.20` → fresh Momentum contribution `= 20`, versus Film 1's
own `92.5` at its own release. "Just clearing the raised bar" is worth roughly a fifth of the
original breakout's Momentum jolt — spamming sequels off pure cadence, without also delivering
outsized absolute reception, visibly does not compound.

**Reach01 flatness at the assumed $150M baseline** (full table in
`models/m1b_derived_kernels.py` output): ranges from 0.88 (comparator 0.5×) to 0.97 (comparator
2.5×) — a span of 0.09 across the entire spread of all seven cases, versus 0.52 for a $5M-forecast
comparator-2.2× film, confirming the note in §9 and §10.4.

**Decay reference table** (half-lives as tuned: `HL_R=650wk`, `HL_M=24wk`, `HL_F=104wk`):

| age (weeks) | decay_R | decay_M | decay_F |
|---|---|---|---|
| 26 | 0.973 | 0.472 | 0.841 |
| 52 | 0.946 | 0.223 | 0.707 |
| 104 | 0.895 | 0.050 | 0.500 |
| 260 | 0.758 | 0.0005 | 0.177 |
| 520 | 0.574 | ~0 | 0.031 |
| 1040 | 0.330 | ~0 | 0.001 |
| 1872 | 0.136 | ~0 | ~0 |

