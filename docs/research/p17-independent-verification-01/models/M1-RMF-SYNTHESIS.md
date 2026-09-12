> **STATUS: HISTORICAL INPUT (revision 02, 2026-09-12).** Unmodified research input below this line. Where it differs from the canonical specification — report [`../P17-INDEPENDENT-VERIFICATION-REPORT.md`](../P17-INDEPENDENT-VERIFICATION-REPORT.md) §5 (index §5.7, with §8/§9/§10), canonical calculator [`../redteam/R3-reviewer-corrections-calc.py`](../redteam/R3-reviewer-corrections-calc.py), committed output [`../redteam/R3-output.txt`](../redteam/R3-output.txt) — **the report governs.** Superseded here: ungated Recognition (ratchets with release count — red-team root cause A), Fatigue only in the expectation multiplier (root cause B), the reboot branch at F = 0, the separate expectation multiplier, per-branch Fatigue, the 0.6 remake coefficient, and the 'reboot only when COOLING' legality gate — all superseded by report §5 / §5.5 / §5.7.

# P17 Report — Section 5 & 6: Recognition / Momentum / Fatigue (FINAL)

**Status:** synthesis of three independently-modeled candidates (M1a "Three Stored Meters," M1b
"Derived-from-Installments," M1c "Overexposure Debt + Heat Ledger") and two independent adversarial
judges (M1j — player-legibility lens, M1k — systems-correctness lens). Read-only paper model; no repo
edits. Throwaway verification script: `scratchpad/p17/models/M1-final-synthesis-calc.py` (python3;
every number in §5–§6 below is exact script output, not hand-rounded). All constants are **STARTING
POINTS** per design law #5 — every one is a knob for the tuning pass, not a claim about a "right"
value.

---

## 5.0 How the two judges' split verdict was resolved

M1j (legibility lens) ranked **M1b first** (8.0/10 weighted); M1k (systems-correctness lens) ranked
**M1c first** (47.5/60). Both scored M1a third. This is a genuine split, not noise — each judge found
something real. Resolving it required weighing the *kind* of defect each winner carries, not just the
score:

- **M1c's disqualifying-strength defect is systemic.** Its founding/ORIGINAL-release Fatigue bug
  (undocumented, present in **5 of 7** of its own worked cases, confirmed by both judges independently)
  contradicts a principle M1c's own prose claims to honor ("no per-count penalty... a first film cannot
  be fatiguing") and that M1a and M1b both implement correctly. M1c also has no Recognition
  ratchet/floor at all (a structural gap vs. Direction Q, not just an untested tail case).
- **M1b's defects are narrow and self-contained.** The Case-B Fatigue soft-ding (F=18.9 for two
  "smash" releases) is confined to one number in one case and doesn't flip any band. The Case-B
  temporal leak (M1k §1.3) is a *presentation* mistake in one worked table, not a kernel defect — the
  underlying formulas were never shown to violate Direction G. Its self-flagged, real weakness
  (unbounded installment-list growth + O(installments) recompute) is a **complexity/perf** problem,
  not a correctness problem.
- **M1b is the only candidate that actually implements Direction I** (remake ≠ reboot) as a
  distinct mechanic — a specific-referenced-film comparison penalty, not just another similarity
  bucket feeding the shared formula. M1a and M1c both collapse "remake" into "yet another sequel-shaped
  input," which does not satisfy a non-reopenable Owner direction as written (M1k §1.7).
- **M1b's Case D is the only clean isolation** of "Fatigue becomes the visible driver of the band, independent
  of Momentum" — the single most load-bearing test in the whole brief. M1a's and M1c's Case D bands are
  contaminated by Momentum already reading negative at Film 1, before Fatigue has accumulated at all
  (both judges, independently, §3/§1.4).
- **M1b's growth weakness is exactly the shape a fix can attach to cleanly.** M1b's three kernels
  are each a *sum of per-installment terms that all decay on one shared half-life per meter*. That
  algebraic property (absent from M1a's path-dependent clamped-delta updates and from M1c's
  fixed-length-ledger-with-real-truncation) means the growth problem can be solved **exactly**, not
  approximated. §5.1–§5.2 below do exactly that.

**Decision: M1b (Derived-from-Installments) is the base shape**, corrected and re-derived into an
exact O(1) form, with the specific grafts both judges converged on (from M1a: Recognition ratchet
floor, satiation gate, scalars-only save discipline; from M1c: quality-scaled Fatigue paydown, debt
framing, itemized-ledger display spec, distance-to-band UI, reboot-branch governance fix) plus two
corrections this synthesis pass found by actually running the grafted rule end-to-end (below).

---

## 5.1 Exact stored state

Recognition is **StoryProperty-wide only** — it never lives on a branch. This is the one place M1a's
own worked cases (M1k §1.5) contradicted M1a's own schema (a per-branch value copy that silently
diverged instead of a true shared read); this final shape does not repeat that mistake — there is no
`recognition` field anywhere on `BranchState`, full stop.

```ts
// P17 root, additive per architecture §f.2 (scalars + id refs only, never a FilmResult/participant
// copy). One StoryProperty record per exact P16 StoryPropertyId (Direction M, register INT-011/012).

type StoryProperty = {
  storyPropertyId: Id            // P16 authority, never inferred from title/genre/cast/order/studio
  rightsOwnerRef: Id             // P16-owned, read-only to P17 (Direction L)
  branches: Id[]                 // bounded, small (Direction N)
  subProperties: Id[]            // bounded named SubProperties (Direction J)

  // --- Recognition: three scalars, exact, O(1) update, O(1) read. No installment list needed. ---
  bestScore: float               // time-invariant "peak constant" of whichever release currently
                                  // holds the all-time Recognition peak (see §5.2 derivation)
  residualScoreSum: float        // same time-invariant constant, summed over every OTHER release
  peakInstallmentId: Id | null   // which film currently holds the peak (for the UI's "your defining
                                  // hit is still X" line)
  rPeak: float                   // ratchet: highest Recognition value ever displayed for this property

  milestones?: {week:number, kind:string, productionId:Id}[]   // small, capped, display-only
}

type Branch = {                  // one per continuity: main line, each reboot, each SubProperty's branch
  branchId: Id
  branchType: 'main' | 'reboot' | 'spinoff'
  parentBranchId: Id | null      // set for spin-off/reboot forks only
  subPropertyOf: Id | null       // set when this branch belongs to a J-style SubProperty

  M: float                       // Momentum, signed, rest = 0 -- ONE scalar, exact (see §5.2)
  F: float                       // Fatigue/overexposure debt, >= 0, rest = 0 -- ONE scalar, exact
  lastUpdateWeek: number         // last week M/F were decayed to
  lastQuality: number | null     // quality of the most recent release on THIS branch (drives F's
                                  // paydown speed)
  lastReleaseWeek: number | null
  priorGapWeeks: number | null   // gap before the MOST RECENT release on this branch; null until a
                                  // branch has had >=2 releases -- this null-ness is load-bearing,
                                  // see §5.4's ACTIVE-AGAIN fix

  recentLedger: LedgerEntry[]    // DISPLAY ONLY, capped at 4 (graft: M1c's itemized-ledger UI spec).
                                  // Never read by any formula -- M and F above are always exact and
                                  // authoritative even when an entry ages out of this list. This is
                                  // the one place this shape improves on M1c's own self-critique
                                  // (M1c: "the dropped [5th] entry's value is not lost from M(t)
                                  // incorrectly... but M(t) after eviction slightly understates" --
                                  // here that can never happen, because eviction only ever touches
                                  // the display copy, not the number).
}

type LedgerEntry = {
  installmentId: Id
  addedWeek: number
  momentumContribution: number   // the m0 this release added, for the tooltip
  fatigueAccrual: number         // the F this release added, for the tooltip
  quality: number
}

// A remake's referenced film is an explicit greenlight-time input, resolving the ambiguity of "which
// prior film does this retell" the same way similarity/type already are -- not derived, not guessed:
type RemakeInput = { remakeOfInstallmentId: Id, /* + the usual critic/audience/total once released */ }
```

**No `installments[]` list is stored anywhere in this final shape.** This is a deliberate, exact
correction of M1b's own self-flagged #1 weakness (unbounded append-only growth, O(installments)
recompute per read/per rival tick) — not a pruning heuristic, an algebraic elimination. §5.2 shows why
this loses zero information.

---

## 5.2 The update rule at each release — and the reformulation that makes it O(1)

### 5.2.1 The shared quality/reach/comparator read (M1b base, unchanged)

```
critic01 = clamp(criticScore/100, 0, 1)
aud01    = clamp(audienceScore/100, 0, 1)
quality  = 0.5*critic01 + 0.5*aud01                    // 0..1 (kept as M1b's own base blend --
                                                        // flagged open in §6.9, not changed here)
reach01  = total / (total + 10,000,000)                // total in RAW DOLLARS -- reuses starPower.ts's
                                                        // reach01 shape/constant verbatim (c.5,
                                                        // `starPower.ts:67-120`), so a $10M saturation
                                                        // point means one thing everywhere in the codebase
comparator = total / expectedTotal                     // same ratio computeStarPowerDelta.fcMult reads
surprise = clamp(0.5*(comparator-1) + (quality-0.5), -1, 1)
```

### 5.2.2 Why every kernel here collapses to O(1) running scalars

M1b's three kernels are each a **sum of per-installment terms that all fade on one shared half-life**:

```
R(t) = 100 * [ peakScore_rank1(t) + κ_R * Σ_rest peakScore_i(t) ],   peakScore_i(t) = raw_i·2^(-(t-week_i)/HL_R)
M(t) = Σ_i  100·surprise_i · 2^(-(t-week_i)/HL_M)
F(t) = Σ_i  100·similarity_i·(1-quality_i) · 2^(-(t-week_i)/HL_F)
```

Because the decay factor `2^(-(t-week_i)/HL)` for a *fixed* meter depends only on `t` and `week_i`, it
factors as `2^(releaseWeek_i/HL) · 2^(-t/HL)` — the second factor is **identical for every installment
at a given query time**. Define `score_i = raw_i · 2^(week_i/HL)` (a per-installment constant, fixed
forever once the film releases). Then:

```
term_i(t) = score_i · 2^(-t/HL)          -- same common factor for every i
```

**Momentum and Fatigue are plain sums with no ranking**, so they collapse directly to one running
scalar each: `M <- M·2^(-Δt/HL_M) + 100·surprise_i` at every release, decayed continuously between
releases. Same for F. **No installment history is needed at all** to reproduce these two kernels
exactly — this was already implicitly true of M1b's own formulas; the derived-list framing was never
load-bearing for M or F, only for the tooltip.

**Recognition has one extra piece** (the rank-1/residual split), but the *relative order* of
`score_i` across installments is **fixed for all time** (the common decay factor multiplies every
installment equally, so it can never change who is "biggest"). That means the running maximum
(`bestScore`) and the running sum of everything else (`residualScoreSum`) can be maintained
incrementally, in O(1), at every release:

```
score_i = raw_i * 2^(releaseWeek_i / HL_R)                     // raw_i = reach01_i * quality_i
if this is the property's first-ever release:
    bestScore = score_i ; peakInstallmentId = i
elif score_i > bestScore:
    residualScoreSum += bestScore      // yesterday's peak is demoted into the residual
    bestScore = score_i
    peakInstallmentId = i
else:
    residualScoreSum += score_i

R(t) = clamp( 100 * (bestScore + κ_R·residualScoreSum) * 2^(-t/HL_R), 0, 100 )
rPeak = max(rPeak, R(t))                 // checked once, right after the update above -- R(t) is
                                          // strictly decreasing between releases, so its true maximum
                                          // is always achieved at a release event
```

This was verified line-for-line against M1b's own published Case A numbers before anything else in
this file was built: `R(0)=80.07, M=92.50, aware=0.826, exp=1.850` — an **exact** match to M1b's own
table (`R=80.1, M=92.5, aware=0.826, exp=1.850`). The reformulation is algebra, not a new model.

### 5.2.3 Recognition floor (grafted from M1a, §4 there)

```
R_reported(t) = clamp( max( R(t), FLOOR_FRAC * rPeak ), 0, 100 )      FLOOR_FRAC = 0.35
```

Every downstream read (bands, awareness, expectation multiplier) uses `R_reported`, never the raw
`R(t)`. Closes the tail-case gap both judges flagged: pure exponential decay (M1b's and M1c's original
shapes) can in principle approach zero given enough half-lives; the floor guarantees a franchise's
all-time-best film is never fully forgotten, mechanically satisfying Direction Q ("older defining hits
retain long-term Recognition") rather than merely decaying slowly toward it. Verified via script
(§8.5 below): the floor is inert for the first ~15 years of a Case-E-style dormancy and only binds
right around the 20-year mark — it is a tail guarantee, not a distortion of ordinary play.

### 5.2.4 Momentum (M1b base, now a pure scalar)

```
M <- M · 2^(-Δt/HL_M) + 100·surprise_i     at each release; continuous decay between releases
```
No change to the underlying rule — only to its storage (§5.2.2).

### 5.2.5 Fatigue — with both grafted fixes, corrected and retuned against real numbers

**Founding-film exemption (fixes M1c's bug):**
```
if this is the branch's FIRST-EVER release:  accrual = 0        // always, regardless of declared type
```
Keyed on "does this branch have a predecessor," never on the declared `continuationType` string — this
closes M1c's bug (a missing `'original'` similarity key silently defaulted every founding film to the
*highest* fatigue bucket) **and** a mislabeling loophole neither model discussed: a non-founding
release cannot dodge Fatigue by declaring itself `'original'` or `'reboot'` after the fact — if that
ever happens (a data/governance error), it falls back to the *worst-case* similarity bucket (0.90),
not a free pass.

**Accrual, with M1a's satiation gate (retuned — see the calibration note below):**
```
gate_i = 0                                       if quality_i >= 0.75
       = clamp((0.75 - quality_i)/0.10, 0, 1)     otherwise
accrual_i = 100 * similarity_i * (1 - quality_i) * gate_i          (skipped for a founding release)
```

**Paydown, with M1c's quality-scaled recovery rate:**
```
paydownMult = 1 + 1.5 * clamp((lastQuality - 0.5)/0.5, 0, 1)      // 1.0x .. 2.5x
effectiveHalfLife_F = 104 / paydownMult                            // 104wk baseline, down to ~42wk
F <- F * 2^(-Δt / effectiveHalfLife_F)     then     F += accrual_i
```

Similarity buckets (M1b base, unchanged): direct sequel/prequel = 0.90, remake = 0.70, spin-off = 0.50.

**Calibration correction found by this pass, not by either judge:** M1a's own satiation gate used a
0.35-wide ramp (in its own 0–100 quality scale). Porting that verbatim onto M1b's kernel and case
inputs was tried first and **broke Case D** — it partially gated (~46% dampened) Case D's genuinely
mediocre 0.56-quality films, eroding the very "Fatigue becomes visibly important" result that is the
single most load-bearing demonstration in the whole brief. The ramp was narrowed to 0.10 so it closes
only the specific gap it was grafted to fix (Case B's smash-quality 0.79–0.81 films → gate = 0
exactly) while leaving quality ≤ 0.65 (Case C's 0.425 flop, Case D's/the spam-test's 0.56) **completely
untouched** — Case D's table below is within rounding of M1b's own original numbers. This is exactly
the kind of "does the graft actually compose with the base shape" check that motivated writing a
script instead of hand-reasoning about it — a graft specified by a judge as a *mechanism* does not
come with the base model's own constants pre-validated against it.

---

## 5.3 Decay half-lives (summary)

| Meter | Rest value | Half-life | ≈ years | Note |
|---|---|---|---|---|
| M (Momentum) | 0 | 24 weeks | 0.46y | M1b base, unchanged |
| F (Fatigue) | 0 | 104 weeks baseline, 42–104wk effective | 0.8–2.0y | M1b base half-life; M1c-graft paydown multiplier (1.0×–2.5×) scales it by the most recent release's quality |
| R (Recognition) | `FLOOR_FRAC·rPeak` (not 0) | 650 weeks | 12.5y | M1b base half-life; M1a-grafted floor (§5.2.3) |

---

## 5.4 Descriptor bands — derived, never stored

Kept as **M1b's exact band function** — the shape whose thresholds produced the one clean, isolated
Case-D result (§6.5) and avoided the "any merely-average brand-new film reads COOLING on day one"
problem M1a's (`M≥5`) and M1c's (`M≥0`) stricter thresholds both produced (M1j §3, §4 "fun/tone check").

```
band(branch, now):
  if branch has never released:                                          "NEW"
  R = StoryProperty.R_reported(now)          M, F = branch.project(now)   // decayed, non-mutating read
  W = now - branch.lastReleaseWeek
  G = branch.priorGapWeeks                    // null for a brand-new/one-release branch -- MUST stay
                                               // null, never default to "infinite" (see fix below)
  if G is not null and W < 26 and G >= 150 and M >= 0:   return "ACTIVE AGAIN"
  if W >= 150:              return  "REVIVAL CANDIDATE" if R >= 25  else "DORMANT"
  if M < -5 or F >= 60:      return "COOLING"
  return "ACTIVE"
```
`DORMANT_WEEKS=150, REVIVAL_R_BAR=25, MOMENTUM_COOL=-5, FATIGUE_HOT=60, REACT_WINDOW=26` — all
STARTING POINTS, all thresholds on numbers a player can already see.

**One concrete fix made by this pass:** a literal `null`/`None` gap must never be coerced to "infinite"
in the `G >= DORMANT_WEEKS` check. Doing so (an implementation mistake this pass made, then caught by
running Case A/B/C/D/E and finding every single branch's *first-ever* release misread as "ACTIVE
AGAIN") makes every brand-new branch — including every reboot — read as a returning comeback on its
first day, which is exactly the bug M1k found live in M1c's own script for the reboot case (§1.7
there) and which M1a's and M1b's *prose* both explicitly reject. The fix is one word: `G is not null`,
not `G defaults to infinity`. Verified in §6.5's Case F/G tables below: a brand-new reboot branch now
correctly reads `NEW` before its first release and plain `ACTIVE`/`COOLING` after it — never `ACTIVE
AGAIN` — while a *true* returning legacy sequel (a real second release on the *same* branch after a
150+ week gap) still gets the label. This is the concrete difference between "a continuity coming back"
and "continuity restarting," which is exactly what Direction H's reboot/sequel distinction needs at the
band layer.

---

## 5.5 The two outputs to P07 / P11

Both are pure read-model functions of `(R_reported, M, F)` — nothing is written back, no new formula
inside P07/P11's own code (design law #2).

**(a) Inherited awareness/reach, 0..1 → P07's optional `ReceptionInputs` seam**
(`reception.ts:87-103` precedent — "ABSENT is the whole legacy world... a bit-exact IEEE no-op";
plugs in at `preMarketingAwarenessOf`/`reachSupport` call sites, `reception.ts:649-652, 666-676,
737-741`):
```
awareness = clamp( 0.8·(R/100) + 0.2·(max(M,0)/100), 0, 1 )
```
Only *positive* Momentum adds to awareness — a franchise on a downswing does not get its public
awareness suppressed here (people still know the name; they're just less excited). The downside of a
downswing is expressed entirely through (b).

**(b) Expectation multiplier → `forecast.expectedTotal`**, applied at the point the forecast is
populated (`tick.ts:594-604`; rival `hollywoodTick.ts:240`), the same way `economyScale` is applied at
a named point (`reception.ts:619-629`) — **not** a new `ForecastFactorKey` (avoids widening the closed,
persisted `types.ts:1881-1892` enum, per c.3's flagged risk):
```
expectation = clamp( 1 + 0.006·R + 0.004·max(M,0) - 0.005·F, 0.7, 2.0 )
```
`computeStarPowerDelta.fcMult` (already clamped 0.85–1.15, `starPower.ts:67-120`) and the newspaper's
`boxDelta` (`newspaper.ts:571-574`) then judge the same film against this harder/softer bar with **zero
new formulas** downstream. This is the entire mechanical expression of Direction B — real reach (a),
harsher judgment (b) — with no automatic quality bonus and no duplicate box-office model.

**Remake-specific mirror term (the ONLY implementation of Direction I found across all three source
models — kept and re-calibrated):**
```
legacyComparisonPenalty = 0.6 * quality_ref * 2^(-age_ref / 260)        // age_ref, quality_ref = the
                                                                          // ONE specific referenced film
expectation_remake = clamp( expectation - legacyComparisonPenalty, 0.7, 2.0 )   // re-clamped
```
**Correction made by this pass:** M1b's own text proposed reusing `HL_M` (24wk) for this penalty's
decay "so recency... drives comparison pressure," but never checked that number against the evidence
it cites. At `HL_M=24wk`, a remake of a **10-year-old** original decays the penalty to `2^(-520/24) ≈
2.9×10⁻⁷` — essentially zero — which directly contradicts 04a's own cited case (*Amazing Spider-Man*
2012 was punished for retelling a 10-year-old origin "too soon"). A new, dedicated half-life,
`HL_REMAKE_COMPARISON = 260 weeks (5yr)`, keeps the penalty real at 10 years (≈25% remaining) while
still fading to negligible by 30 years ("dormancy/nostalgia helps, no 20-year lock" — Direction H).
Worked in §6.5's bonus Case R.

---

## 5.6 Save cost — bounded regardless of a franchise's lifetime output

| Franchise size | Bytes | Grows with... |
|---|---|---|
| Typical (1 branch, capped 4-entry display ledger) | **~253 B** | nothing beyond branch count |
| Branched (5 branches — main+reboot+3 spin-offs) | **~993 B** | branch count only (bounded, Direction N) |
| MCU-scale outlier (8 branches, ANY total lifetime installment count) | **~1.5 KB** | branch count only — **flat even at 100+ lifetime films**, unlike M1b's original shape |

This is the concrete resolution of M1b's #1 self-flagged weakness and M1k's explicit ask ("M1b's
unbounded installment-list growth... should be resolved... before any 'derived, zero-mutable-meters'
shape is treated as final," M1k §9): the fix is not a prune-and-memoize plan, it is that the shape
never needed an unbounded list to begin with, once R/M/F are expressed as the running scalars §5.2
derives. All figures comfortably clear the ≤1.5KB single-`FilmResult` budget PERF-009 names (already
missed elsewhere in the codebase, `P12A-DECISION-AND-REQUIREMENT-REGISTER.md:183,320-322`) — a whole
franchise's persistent state costs about as much as a fraction of one film record.

---

## 5.7 Model-shape comparison — why this shape, what was grafted

| | M1a (Three Stored Meters) | M1b (Derived-from-Installments) — **base of FINAL** | M1c (Debt Ledger) |
|---|---|---|---|
| **Judge verdict** | 3rd, both judges | 1st (M1j, legibility) | 1st (M1k, systems) |
| **Decisive strength** | Smallest constant count; cleanest hand-arithmetic | Only correct Direction I (remake) mechanic; cleanest isolated Case-D | Best raw UI idiom (itemized ledger + "debt"); best exploit stress-testing |
| **Decisive failure** | R not actually shared across branches despite its own schema saying so (M1k §1.5); Case B's spin-off never modeled | Case-B Fatigue soft ding; unbounded save growth (both fixed here) | Founding-film Fatigue bug in 5/7 cases; no Recognition floor |
| **What FINAL grafts from it** | rPeak-style floor (§5.2.3), satiation gate (§5.2.5, retuned), scalars-only save discipline (§5.6, achieved exactly, not approximately) | Entire base kernel (R/M/F formulas, band function, both outputs, remake mechanic) | Quality-scaled paydown rate (§5.2.5), "debt" framing, itemized display-ledger spec (§5.1), distance-to-band UI ask (§6.7), reboot-branch governance fix (§6.4) |

Net effect: **FINAL keeps M1b's correctness/legibility wins, inherits none of its three named defects
(Case-B ding — fixed §5.2.5; save growth — fixed exactly §5.2.2/§5.6; temporal-leak presentation —
fixed by construction in §6.5's re-run), and adds two corrections neither source model nor either judge
caught** (the satiation-gate ramp width, and the remake-penalty half-life) because this pass actually
executed the grafted rule end-to-end rather than describing it.

---

# 6. Continuation-timing recommendation (Direction H)

## 6.1 Type-specific timing behaviour

**Sequels / prequels / spin-offs — no wait, ever.** Nothing in `release()` checks elapsed time, release
count, or any cooldown before allowing a release. Timing acts **exclusively** through the continuous
state of M and F at the moment of the decision (§6.2). A prequel is treated identically to a direct
sequel for these formulas (similarity 0.90) — Direction A requires the *type* to be tracked
distinctly for identity/UI purposes, not that it behave differently mechanically, and none of the
seven required cases calls for a prequel-specific rule.

**Remakes — comparison/redundancy pressure vs. nostalgia, both continuous.** A remake pays the shared
similarity-bucket Fatigue rule (0.70) like any continuation **plus** the one-time
`legacyComparisonPenalty` (§5.5) scoped to the *specific* prior film it retells. That penalty is large
and fresh if the referenced film is recent and beloved, and fades on its own 5-year half-life —
by 30 years it is negligible. This is the mechanical answer to "redundancy pressure if very recent,
dormancy/nostalgia helps, no 20-year lock": there is no lock, just a continuously fading tax that is
large near zero and small far out (worked numbers: §6.5 Case R).

**Reboots — restart the branch, keep the shared Recognition.** A reboot is the founding release of a
**new** `Branch` (`branchType: 'reboot'`). Its own M and F start at exactly 0 (a brand-new branch has
no prior terms to sum) — this costs nothing extra to implement, it is simply what an empty sum equals.
Recognition is **never** reset, because it was never stored on the branch to begin with (§5.1) — it is
read fresh from the shared `StoryProperty`, which the reboot's own release then updates like any other
release would (§5.2.2). The old branch's own M/F are provably untouched (verified in §6.5's Case F/G
isolation check) because they live on a different `Branch` object; the old branch's *own* band can
legitimately still read `DORMANT`/`REVIVAL CANDIDATE` even while the property's shared Recognition has
just jumped, because band is evaluated per-branch on that branch's own `weeksSinceLastRelease` — a
correct, slightly subtle distinction worth stating plainly for the report: **the reboot succeeding
raises the property's shared Recognition, visible from every branch immediately; it does not make the
OLD continuity itself "active" — that would require a release on the old branch.**

## 6.2 How timing affects M and F continuously — no hard unlock, anywhere

There is no minimum-wait check, no release-count check, no cooldown timer anywhere in the release path.
Timing enters this model through exactly two continuous channels, both pure decay, neither a gate:

1. **Momentum and Fatigue decay every week**, at rates set by `HL_M`/`effectiveHalfLife_F` (§5.3) —
   waiting longer between releases lets M fade toward 0 (losing a tailwind) and lets F fade toward 0
   (losing a headwind), at the SAME time, on different clocks. Nothing checks "has enough time passed"
   before permitting a release; the passage of time only changes what M and F *equal* at the moment a
   new release is decided.
2. **The band function reads elapsed weeks (`W`, `G`) as continuous inputs**, not permission gates —
   `ACTIVE`/`COOLING`/`DORMANT`/`REVIVAL CANDIDATE`/`ACTIVE AGAIN` are descriptive labels computed from
   the current numbers; nothing in `release()` consults the band before allowing a release to happen.
   A studio releasing into a `COOLING` or even `DORMANT` property is legal and unblocked; it simply
   gets whatever awareness/expectation numbers those meters currently produce.

## 6.3 Why a fast follow-up to a huge hit is MORE attractive under this rule

Momentum's half-life (24 weeks) is short relative to a typical production timeline. Case A (§6.5)
makes this numeric: a Film 1 that opens at M=92.5 has already decayed to M=82.4 by the greenlight
decision just 4 weeks later, and would be down to M≈16 if a sequel didn't land until week 60 with no
event of its own. Both P17 outputs — awareness (which rewards positive M directly) and the expectation
multiplier (same) — are **strictly higher the sooner the follow-up captures that decaying Momentum**.
Meanwhile, because a genuinely excellent film's Fatigue accrual gates to exactly zero (§5.2.5's
satiation gate, quality ≥ 0.75) and there is no per-count or cadence penalty of any kind, a fast,
*good* follow-up pays **no Fatigue cost at all** for being fast — Case B shows this exactly (F stays
0.00 through two straight hits and a 40-week-later spin-off). The two effects compose: waiting
strictly loses awareness/expectation value while gaining nothing on the Fatigue side (a genuinely good
film was never going to accrue meaningful Fatigue regardless of when it releases), so the model's own
arithmetic — not a special-cased rule — makes "ride the hit while it's hot" the dominant strategy for a
studio confident in quality, and makes a *rushed, mediocre* follow-up (which does pay real Fatigue,
Case D) the actual risk, exactly matching Direction C/D's intent.

## 6.4 Rival compact policy + reboot-branch governance

```
1. IF branch.band in {ACTIVE, ACTIVE AGAIN} AND branch.M > policy.continuationBar:
       propose a same-branch continuation (type = direct_sequel by default).
2. ELSE IF property.band in {DORMANT, REVIVAL CANDIDATE} AND R_reported >= policy.revivalBar
       AND [GOVERNANCE, below] AND rights permit (Direction K/L):
       propose a REBOOT (new branch) instead of an original commission.
3. ELSE: fall through to today's unchanged genre-affinity roulette (`hollywoodTick.ts:175-184`).
```
Attaches at the seam architecture §e.5 already names, requires `policy.version: 2` +
`hollywoodValidation.ts:204-211` widening — identical seam and shape across all three source models, no
second forecast, satisfying Direction K.

**Governance fix (grafted from M1c, adopted verbatim as the smallest correction to the
reboot-as-fatigue-dodge exploit, §6.7):** a **new** reboot branch of a StoryProperty may only be
created if that property's *current* active branch is already `COOLING` or worse. This is a
branch-creation rule (Direction N territory), not a change to the F formula — it stops a studio from
laundering an otherwise-healthy franchise through repeated cheap reboots purely to dodge Fatigue,
without touching §5.2.5's Fatigue math or reopening Direction D's no-cooldown rule.

## 6.5 The seven cases, re-run under the final rule

All numbers are exact output of `M1-final-synthesis-calc.py`, assuming `expectedTotal = $150M` flat
(reused from M1b's own case-table convention, flagged there and here: at this budget scale `reach01` is
nearly saturated, 0.88–0.97, so Recognition's variation below is driven mostly by quality, not reach —
a smaller-budget franchise would show more reach discrimination).

### Case A — breakout original, fast direct sequel

| Week | Event | R | M | F | Band | expect | aware |
|---|---|---|---|---|---|---|---|
| 0 | Film 1 (critic 85, aud 80, 2.2×) | 80.07 | 92.50 | 0.00 | ACTIVE | 1.850 | 0.826 |
| 4 | Film 2 greenlit (decision) | 79.73 | 82.41 | 0.00 | ACTIVE | 1.808 | 0.803 |
| 60 | Film 2 release week (no outcome given) | 75.11 | 16.35 | 0.00 | ACTIVE | 1.516 | 0.634 |

**What the player sees at the week-4 greenlight:** *"ACTIVE. Audiences are still buzzing from Film 1
(Momentum 82, barely off its 92.5 peak) and there's no fatigue on the books. A sequel greenlit now
would open roughly 81% above a comparable non-franchise forecast."* Rival policy: rule 1 fires
immediately (M≫0) — a rival makes the identical bet at the identical moment, matching Direction D/K.

### Case B — two straight hits, spin-off 40wk later (must not be punished for speed)

| Week | Event | R (property) | M (main) | F (main) | Band (main) | expect | aware |
|---|---|---|---|---|---|---|---|
| 0 | Film 1 smash (82/80, 1.9×) | 78.25 | 76.00 | 0.00 | ACTIVE | 1.774 | 0.778 |
| 52 | Film 2 smash (80/78, 1.7×) | 87.12 | 80.93 | 0.00 | ACTIVE | 1.846 | 0.859 |
| 91 | Main, one week before spin-off (decision time) | 83.57 | 26.24 | 0.00 | ACTIVE | 1.606 | 0.721 |

Spin-off branch (temporal-leak fixed — decision-time and outcome shown as two separate rows):

| Week | R (property) | M (spin-off) | F (spin-off) | Band | expect | aware |
|---|---|---|---|---|---|---|
| 91, pre-release (greenlight decision) | 83.57 | 0.00 | 0.00 | NEW | 1.501 | 0.669 |
| 92, post-release (75/74, 1.4×) | 94.15 | 44.50 | 0.00 | ACTIVE | 1.743 | 0.842 |

**What the player sees at the greenlight decision (week 91, before the spin-off's own outcome is
known):** *"ACTIVE. This property is near its strongest-ever Recognition (84). The spin-off starts
cold on its own Momentum/Fatigue — its inherited pull comes entirely from the parent property's
Recognition (aware=0.67) — but the main branch's own recent record (two hits, zero fatigue) has never
been better."* **Fatigue is exactly 0.00 on the main branch throughout** — the satiation gate closes
this cleanly (both films' quality, 0.81 and 0.79, clear the 0.75 gate). Rival policy: rule 1 fires at
every decision point (M≫0 both times) — no timing penalty applied by the model to either release.

### Case C — hit then flop (Recognition holds, Momentum falls, salvageable)

| Week | Event | R | M | F | Band | expect | aware |
|---|---|---|---|---|---|---|---|
| 0 | Film 1 iconic (90/88, 2.5×) | 86.69 | 100.00 | 0.00 | ACTIVE | 1.920 | 0.894 |
| 78 | Film 2 weak (45/40, 0.6×) | 85.51 | −16.99 | 51.75 | COOLING | 1.254 | 0.684 |
| 130 | +52wk rest, no Film 3 yet | 80.89 | −3.78 | 36.59 | ACTIVE | 1.302 | 0.647 |

**What the player sees right after Film 2:** *"COOLING. Recognition barely moved (87→86) — this is
still a major, respected property. Momentum swung sharply negative and real fatigue built up. The next
film will be judged against a much more modest bar (1.25×, down from 1.92×) — not written off."* R fell
**1.4 points out of 87** from a genuine flop — the numeric proof of "Recognition stays high." By week
130, having rested, the band is back to ACTIVE even with no new release — pure recovery, not a new
event. Rival policy: rule 3 (COOLING) — stands down this cycle, doesn't chase immediately, matches real
post-flop caution (04a) without declaring the property dead.

### Case D — rapid mediocrity ×4 @ 40wk cadence (Fatigue must become visibly important)

| Week | Event | R | M | F | Band | expect | aware |
|---|---|---|---|---|---|---|---|
| 0 | Film 1 (57/55, 0.9×, ORIGINAL) | 52.14 | 1.00 | 0.00 | ACTIVE | 1.317 | 0.419 |
| 40 | Film 2 (57/55, 0.9×, sequel) | 59.63 | 1.31 | 39.60 | ACTIVE | 1.165 | 0.480 |
| 80 | Film 3 (57/55, 0.9×, sequel) | 66.81 | 1.41 | 68.51 | **COOLING** | 1.064 | 0.537 |
| 120 | Film 4 (57/55, 0.9×, sequel) | 73.69 | 1.45 | 89.62 | **COOLING** | 1.000 | 0.592 |

**What the player sees after Film 3 (week 80):** *"COOLING — and Momentum reads a mild, essentially
flat +1.4 the whole time (nothing here individually flopped). The band flipped because Fatigue just
crossed 60 from four similar, mediocre releases in a row. The next film's forecast is already below a
comparable new property's baseline."* This is the load-bearing isolation the whole exercise turns on:
**Momentum never leaves the −5..+1.5 range across the entire run — the COOLING flip is attributable to
Fatigue alone**, exactly the property that made M1b's Case D the only clean pass among the three source
candidates, preserved here after the satiation-gate retune (§5.2.5). Rival policy: still ACTIVE at week
40, but band = COOLING by week 80 stops rule 1 from firing — a rival following this policy would have
stopped chasing this chain by the third mediocre film, even though nothing individually flopped.

### Case E — twenty years of dormancy on a major property

| Week | R | M | F | Band | expect | aware |
|---|---|---|---|---|---|---|
| 0 (defining hit, 88/85, 2.0×) | 83.71 | 86.50 | 0.00 | ACTIVE | 1.848 | 0.843 |
| 260 (5yr) | 63.44 | 0.05 | 0.00 | REVIVAL CANDIDATE | 1.381 | 0.508 |
| 520 (10yr) | 48.08 | 0.00 | 0.00 | REVIVAL CANDIDATE | 1.288 | 0.385 |
| 1040 (20yr) | 29.30 | 0.00 | 0.00 | REVIVAL CANDIDATE | 1.176 | 0.234 |

`rPeak` for this property = 83.71; the floor (0.35×83.71 = 29.30) is **already binding** at 20 years
(raw decayed value alone would be 27.61) — the durable-floor mechanism is not decorative, it is doing
real work exactly at the tail this case is built to probe (§5.2.3). **What the player sees:** *"REVIVAL
CANDIDATE. Recognition has faded to about a third of its peak but never disappeared. Momentum and
Fatigue have both fully recovered to neutral. This is a clean slate with real name-recognition still
attached."* Rival policy: rule 2 fires (property band REVIVAL CANDIDATE, R above the revival bar) —
bounded seeded probability of bidding a reboot, not a guarantee, and gated on the branch-governance rule
(§6.4) if the old branch weren't already this dormant.

### Case F — successful reboot after Case E's dormancy

| Week | Event | R (property) | M (reboot) | F (reboot) | Band (reboot) | expect | aware |
|---|---|---|---|---|---|---|---|
| 1040 | pre-reboot (shared state) | 29.30 | — | — | NEW | 1.176 | 0.234 |
| 1040 | Reboot releases (85/80, 1.6×) | **83.34** | 62.50 | 0.00 | **ACTIVE** | 1.750 | 0.792 |

Old main branch, **same instant** (isolation check): R=83.34 (identical — correctly shared), M=0.00,
F=0.00, own band = REVIVAL CANDIDATE (its own `weeksSinceLastRelease` is still 1040 — the reboot
happening on a *different* branch does not make the old continuity itself "active"; see §6.1).

**What the player sees right after:** *"ACTIVE. The reboot landed — Recognition jumped straight back
to near its all-time peak (83, from 29) and this new continuity opened with real Momentum (62.5) and
zero fatigue."* Note the band correctly reads plain `ACTIVE`, never `ACTIVE AGAIN` — this is a **new**
branch's first-ever release, not a legacy sequel returning after a gap (§5.4's fix).

### Case G — failed reboot after Case E's dormancy (identical pre-release state to F)

| Week | Event | R (property) | M (reboot) | F (reboot) | Band (reboot) | expect | aware |
|---|---|---|---|---|---|---|---|
| 1040 | pre-reboot (shared state) | 29.30 | — | — | NEW | 1.176 | 0.234 |
| 1040 | Reboot releases (40/38, 0.5×) | 38.55 | −36.00 | 0.00 | **COOLING** | 1.231 | 0.308 |

**What the player sees:** *"COOLING. The reboot underperformed a bar that the property's residual
Recognition had already raised. Recognition itself barely moved (29→39, the asymmetric peak-anchored
formula limits the damage even here) — but this attempt did not reignite the franchise; treat it as a
fresh flop, not a fresh start."* F and G share the **identical** pre-release read (R=29.30,
expect=1.176) — the player/rival cannot distinguish which outcome is coming, satisfying Direction G's
"no hidden future reception info; rivals make equivalent bets." Rival policy: COOLING → rule 1 does not
fire again for this branch; a rival would not immediately double down on a reboot that just missed.

### Bonus Case R — REMAKE at three referenced-film ages (closes the evidence gap M1k named: none of the
seven required cases exercises a remake)

Same defining-hit original as Case E (quality ≈0.865). A remake of that specific film is proposed at
three different points:

| Referenced-film age | expect (before penalty) | legacyComparisonPenalty | expect (remake) |
|---|---|---|---|
| 2 years (still fresh, beloved) | 1.467 | **0.393** | 1.073 |
| 10 years (the TASM-2012 calibration point) | 1.288 | **0.130** | 1.159 |
| 30 years (a generation gone) | 1.176 | 0.008 | 1.168 |

**What the player sees:** *"Remaking a film from 2 years ago is judged hard — the comparison is still
fresh (expectation cut nearly 30%). The same remake a decade later still pays a real, if smaller,
comparison tax. Three decades out, the tax is essentially gone — this reads as revival, not
redundancy."* This is the mechanical, continuous answer to Direction H's remake clause, calibrated
against 04a's own cited real-world case (*Amazing Spider-Man* 2012, "too soon" at 10 years) rather than
against an unchecked reuse of Momentum's fast half-life (§5.5's correction).

## 6.6 Exploit stress test (same probe M1c's judges praised)

Eight mediocre (57/55, 0.9×) releases at 15-week cadence, same StoryProperty:

| Film | Week | R | M | F | expect | Band |
|---|---|---|---|---|---|---|
| 1 | 0 | 52.14 | 1.00 | 0.00 | 1.317 | ACTIVE |
| 2 | 15 | 59.83 | 1.65 | 39.60 | 1.168 | ACTIVE |
| 3 | 30 | 67.41 | 2.07 | 74.79 | 1.039 | COOLING |
| 4 | 45 | 74.86 | 2.34 | 106.07 | 0.928 | COOLING |
| 5 | 60 | 82.20 | 2.52 | 133.87 | 0.834 | COOLING |
| 8 | 105 | 100.00 | 2.76 | 200.04 | **0.700 (floor)** | COOLING |

Fatigue climbs **without saturation** (no per-count penalty anywhere, exactly the spec) and the
expectation multiplier hits its 0.7 floor by film 7. Recognition, notably, keeps climbing toward its
ceiling — a real, defensible emergent property: sheer output volume does build raw *name recognition*
even when reception is mediocre ("everyone's heard of it"), while Fatigue and the expectation floor
separately and correctly capture "everyone's tired of it." The two numbers together, not either alone,
tell the true story — worth surfacing to the report's UI recommendations.

---

## 6.7 Exploits considered, and the smallest correction for each

| Exploit | Considered how | Smallest correction adopted |
|---|---|---|
| **Fast-sequel spam** | §6.6's 8-release stress test: F climbs unboundedly, expectation floors by film 7 | None needed — self-limiting by construction; "no per-count penalty" holds literally and the emergent behavior is still not free |
| **Dormancy as a free Fatigue reset** | Case E: F fully recovers on an ordinary ~1–2yr clock regardless of dormancy length; R only ever falls while waiting, never rises | None needed structurally — but see the genuine Owner decision in §6.8 about whether the floor's mere existence is itself too generous to a franchise that quit on a low note (04b: Furiosa, Expendables 4) |
| **Reboot-as-fatigue-cure** | A reboot's own branch starts at F=0 by construction (nothing to "cure") and never touches Recognition | Branch-creation governance (§6.4): a new reboot branch requires the current branch already be COOLING-or-worse — closes "reboot a still-healthy franchise purely to reset F" without touching the F formula |
| **Type mislabeling ("declare it a reboot to dodge Fatigue")** | A non-founding release declaring `type: reboot`/`original` | Fatigue exemption is keyed on `founding` (does this branch have a predecessor), never on the declared type string; a mislabeled non-founding release falls back to the *worst-case* similarity bucket (§5.2.5) |
| **Recompute cost / save growth** | M1b's self-flagged #1 weakness | Solved exactly via the O(1) reformulation (§5.2.2) — not a mitigation, an algebraic elimination |
| **Case-B Fatigue soft ding** | F=18.9 for two "smash" releases in M1b's original | Satiation gate (retuned, §5.2.5) — F=0.00 exactly for both films in the re-run (§6.5) |
| **Temporal leak in a worked example** | M1b's own Case B narrated a pre-decision snapshot computed AT the spin-off's own release week | Fixed by construction: every "decision time" row in §6.5 is computed strictly before the event it precedes |

## 6.8 Genuine Owner decisions

These are choices that change what the game **allows or means**, not tunable numbers (design law #5 —
constants are never Owner decisions on their own):

1. **Should creating a new reboot branch of a still-healthy franchise ever be legal?** The governance
   fix in §6.4 forbids it (current branch must already be COOLING-or-worse) as the smallest correction
   to the reboot-as-fatigue-dodge exploit. Some real studios do "soft reboot" a franchise that isn't
   actually struggling (a creative/marketing choice, not a fatigue dodge). Blocking this outright is a
   fantasy-shaping call, not a number to tune.
2. **Should Recognition's durable floor (§5.2.3) exist at all**, independent of its fraction? A
   non-zero floor means a franchise's all-time peak can never be fully erased no matter how
   catastrophically it is run afterward — arguably required by Direction P ("never permanently
   unusable") but worth an explicit yes, since it forecloses "run this IP so far into the ground its
   name recognition genuinely dies" as a possible player/rival outcome.
3. **Branch-tree nesting depth.** Direction N says "bounded... no spaghetti graphs" but does not say
   whether a SubProperty's own branch may itself spawn a further nested spin-off or reboot. None of
   the three source models nor either judge addressed this. Recommend capping at one level under the
   parent StoryProperty unless the Owner wants deeper nesting.
4. **Where does Direction F's talent-continuity signal actually enter this model?** As built (by all
   three source models and this synthesis), R/M/F read only public reception/box-office facts — losing
   or keeping an iconic lead affects the franchise's meters only *indirectly*, through whatever effect
   that has on the resulting film's own critic/audience score. Is that the intended scope (talent
   continuity is entirely P14's domain, mediated through quality), or should P17's kernel carry an
   explicit modifier when a franchise-important talent association breaks or is preserved? This is
   unresolved by all three candidates and both judges and is a real fantasy question, not a formula
   gap this pass can close on its own authority.
5. **Should a remake's referenced film be player/rival-chosen at greenlight** (as this pass assumes,
   §5.1's `RemakeInput`), or should the engine infer "the most recent/most iconic prior installment"
   automatically? Explicit choice avoids ambiguity when more than one prior film could plausibly be
   "the one being remade," but is itself a UX/agency decision worth an explicit Owner call.

## 6.9 Open questions for the tuning/next modeling pass

- **Quality blend.** This model keeps M1b's simple `0.5·critic01 + 0.5·aud01`. M1a used a differently
  weighted blend; M1c used a three-term critic/audience/performance-vs-forecast blend. All three
  source models flagged this as unresolved and untested against real critic/audience divergence
  (comedy franchises vs. arthouse-adjacent IP) — worth a dedicated pass before shipping.
- **Co-tuning with P14 fame swings.** `expectation`'s coefficients (0.006/0.004/0.005) directly change
  what `computeStarPowerDelta.fcMult` reads — both judges flagged this as needing its own calibration
  pass against real P14 fame data, not just against this file's seven cases.
- **Interaction with `Standing.audienceAwareness`.** M1c/M1k's flagged concern: does a top studio's own
  beloved franchise's `awareness` term stack unboundedly with Standing's own reach/star channel for the
  same release? `preMarketingAwarenessOf`'s own clamp (`reception.ts:571-578`) bounds the combined
  effect, but this is untested — recommend a specific playtest (a studio's #1 franchise, high Standing,
  releasing a continuation).
- **`REMAKE_COMPARISON_WEIGHT` (0.6) and `HL_REMAKE_COMPARISON` (260wk)** are new constants introduced
  by this pass (M1b named the mechanism without fully specifying it) and are calibrated against a
  single real-world data point (*Amazing Spider-Man* 2012). Worth a second modeler's independent read
  against more of 04a/04b's remake evidence before these ship.
- **Prequel-specific behaviour.** Bucketed identically to direct sequel throughout (similarity 0.90).
  None of the seven cases tests whether a prequel's different narrative framing ("audience already
  knows how it ends") deserves its own mechanic — flagged, not built.
- **Display-ledger cap (4 entries).** Purely cosmetic now (§5.1 — the authoritative M/F numbers are
  never affected by what falls off the display list), so the cap can be freely raised for very
  prolific franchises' UI without any formula consequence — worth confirming 4 is the right UI number,
  independent of the modeling question.
- **The satiation-gate ramp width (0.10) and the founding-film mislabeling fallback (worst-case bucket,
  0.90)** are both corrections this synthesis pass made while executing the grafts, not something
  either judge specified numerically — flagged for independent verification before shipping, per this
  report's own standard of not trusting a described mechanism until it's actually run.
