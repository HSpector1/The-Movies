# P17 Model A — Three Stored Meters (R, M, F) with Exponential Decay

Modeler: RMF-A. Shape mandated by brief: three persisted scalars per franchise (Recognition,
Momentum, Fatigue), updated by bounded event deltas in the house style of `computeStarPowerDelta`
(`starPower.ts:67-120`, `tuning.ts:552-568`), decayed weekly toward rest values by exponential
half-life. All constants below are **STARTING POINTS** (design law #5) — every one is a knob, not
a claim about the "right" value; the worked cases exist to show the *shape* behaves correctly, not
to certify these exact numbers. A companion script that produced every number in this file lives at
`scratchpad/p17/models/m1a_three_meters.py` (read-only paper arithmetic; no repo touched).

Owner directions A–U are treated as fixed; where this shape creates friction with one of them I name
it precisely under §11 rather than reopening it.

---

## 1. State stored (per StoryProperty, and per Branch)

The brief asks for three meters "per franchise." This model **splits R from (M, F)** across two
levels, because the evidence make that split load-bearing, not optional:

- Direction H: "reboots restart continuity, **keep StoryProperty recognition**" — this is only
  expressible if R lives above the branch.
- 04a §D / 04b §D (spin-off inheritance: Rogue One 62%, Solo 38%, Creed 2.4× parent's last entry) —
  a SubProperty needs its own fast dynamics while still drawing on the parent's durable value.
  03e §13 ADOPT: "importance-weighted talent continuity... bigger franchises depend MORE on the
  iconic lead" — same logic applies to Recognition: it is a property-level brand asset, not a
  per-release one.
- Direction N (bounded branching) already requires a branch object to exist; putting M/F there
  costs nothing extra.

### 1.1 StoryProperty root (one per P16 StoryProperty; direction M's "lightweight persistent
Franchise identity")

| Field | Type | Meaning |
|---|---|---|
| `storyPropertyId` | id ref (P16-owned) | exact P16 key — never inferred (contract §15, INT-011/012/013) |
| `R` | float 0..100 | Recognition — slow, durable, shared across every branch of this property |
| `rPeak` | float 0..100 | highest R ever reached; defines the decay floor (§4) |
| `branches[]` | id list | refs to Branch rows below (bounded — direction N) |
| `subProperties[]` | id list | refs to bounded named SubProperties (direction J) — each SubProperty owns its own Branch(es) |
| `milestones[]` | small capped list of `{week, kind, productionId}` | optional flavour/audit trail, not read by the formulas — pruned to a handful of entries |

### 1.2 Branch (one per continuity: the main line, each reboot, each SubProperty's branch — direction N, I)

| Field | Type | Meaning |
|---|---|---|
| `branchId` | id | scoped to the StoryProperty |
| `branchType` | enum `main \| reboot \| spinoff` | direction A/I/J |
| `parentBranchId` | id ref, optional | set for spin-off branches only |
| `M` | float **signed**, −100..+100, rest = 0 | Momentum — fast, decays to neutral (can go negative = active bad buzz) |
| `F` | float 0..100, rest = 0 | Fatigue/overexposure — recovers with rest, floored at 0 |
| `lastEventWeek` | int, optional | last release on **this branch** |
| `installments[]` | id list of `productionId` | join only, never a copy of `FilmResult` (f.2 law) |

`weeksSinceLastRelease` and `gapBeforeLastRelease` (needed for the ACTIVE AGAIN band, §6) are **not
stored** — both are derived on read from `installments[]` joined to each `FilmResult`'s release
week, exactly the "derived read model" pattern f.2 recommends over speculative fields on a frozen
leaf. This satisfies "never a separate manual state" literally: there is no band flag anywhere,
only R, M, F and two numbers computed from the installment list every time the band is asked for.

A new P17 root is unavoidable regardless of shape (f.1: an unknown `franchises` key fails
`validateSaveVN` today) — this is `SaveFileV20`, additive, absent-safe on load, per f.2's pattern.

---

## 2. Update rule at each release (bounded event delta, house style of `computeStarPowerDelta`)

Inputs, all public `FilmResult` facts plus the two caller-supplied continuation facts (task's
required input list):

```
critic, audience        FilmResult.criticScore, (audience score)
total, expectedTotal     FilmResult.boxOffice.total vs FilmResult.forecast.expectedTotal
opening, expectedOpening FilmResult.boxOffice.opening vs FilmResult.forecast.expectedOpening
similarity  s ∈ [0,1]     caller-supplied per continuation type (direct sequel/prequel ≈0.9,
                           remake ≈0.65, spin-off ≈0.45, reboot ≈0.3; s=0 for a founding/ORIGINAL
                           release — nothing precedes it to be "similar" to)
continuationType          ORIGINAL | DIRECT_SEQUEL | PREQUEL | SPIN_OFF | REMAKE | REBOOT
```

House-style building blocks, deliberately mirroring `computeStarPowerDelta`'s shape (saturating
reach term × quality gate × forecast-comparator multiplier × room-to-grow, final delta clamped —
`starPower.ts:67-120`):

```
q        = 0.4·critic + 0.6·audience                         (blended public quality index)
reach01  = total / (total + 200)                              (saturating box-office reach, $M)
beat     = total / expectedTotal
beatMult = clamp(1 + 0.3·(beat − 1), 0.8, 1.3)                 (same 0.3 coefficient as fcMult, c.5)
gainQ    = clamp((q − 55)/30, 0, 1.3)
lossQ    = clamp((60 − q)/45, 0, 1.4)
room(x, p) = clamp((100 − x)/100, 0, 1)^p                      (diminishing returns near ceiling —
                                                                 same purpose as c.5's `room` term)
```

**Recognition delta (applied to the StoryProperty root, from ANY branch's release):**
```
gain_R = 48 · reach01 · gainQ · beatMult · room(R, 1.3)
loss_R = 10 · reach01 · lossQ · (2 − beatMult) · sqrt(R/100)
dR = clamp(gain_R − loss_R, −8, +50)
R  = clamp(R + dR, 0, 100);  rPeak = max(rPeak, R)
```
Gain ceiling (+50) is far larger than loss ceiling (−8) by design: this is the direct mechanical
expression of direction Q ("recent performance matters strongly... no full lifetime average," and
implicitly: Recognition is built by hits, not eroded by ordinary misses).

**Momentum delta (applied to the releasing Branch):**
```
openingBeat = opening / expectedOpening
openingMult = clamp(1 + 0.5·(openingBeat − 1), 0.6, 1.8)
gain_M = 55 · reach01 · gainQ · openingMult
loss_M = 85 · reach01 · lossQ · clamp(2 − openingMult, 0.4, 1.8)
dM = clamp(gain_M − loss_M, −80, +55)
M  = clamp(M + dM, −100, 100)
```
M **adds** to whatever M the branch already carries — this is what lets two hits in a row compound
(Case B) rather than each event overwriting the last.

**Fatigue delta (applied to the releasing Branch; item 5 — the non-monotonic core of this model):**
```
satiation(q) = clamp((75 − q)/35, 0, 1.3)     (≈0 once q ≥ 75; rises sharply below it)
gain_F  = 80 · reach01 · satiation(q) · s^1.2 · room(F, 0.7)
relief_F = 25 · reach01 · clamp((q − 75)/25, 0, 1) · (F/100)     (only excellent work relieves F,
                                                                    proportional to existing F)
dF = clamp(gain_F − relief_F, −25, +45)
F  = clamp(F + dF, 0, 100)
```
Two mechanisms do the item-5 work together: `satiation(q)` is ~0 for a genuinely excellent film
regardless of similarity (an s=0.9 direct sequel that scores 85 adds essentially no Fatigue), while
`s^1.2` means the *same* mediocre quality accrues far less Fatigue when framed as a lower-similarity
continuation (reboot 0.3^1.2≈0.23× vs direct sequel 0.9^1.2≈0.88×) — the mechanical reading of
Sood & Drèze 2006's finding that satiation keys on sameness (03e §11.1), harvested explicitly in
03e §13 ADAPT.

For a founding `ORIGINAL` release, `s = 0` by convention → `dF = 0` always: a first film cannot be
"fatiguing," there is nothing before it to be tired of.

---

## 3. Weekly decay (exponential, toward each meter's rest value)

Applied every week (including the release week, after that week's event delta):
```
value(t+1) = rest + (value(t) − rest) · 0.5^(1 / halfLifeWeeks)
```

| Meter | Rest value | Half-life | ≈ years | Rationale |
|---|---|---|---|---|
| M | 0 (neutral) | 65 weeks | 1.25y | brief: "fast ~1–1.5 years" |
| F | 0 (fully recovered) | 156 weeks | 3.0y | brief: "medium ~3 years" |
| R | `floor = 0.35 · rPeak` (not 0) | 1000 weeks | 19.2y | brief: "very slow ~15–25 years, floor at a fraction of peak" |

R is the only meter that does **not** decay to zero — it decays toward a floor tied to its own
history. This single line is the entire mechanical answer to item 4.

---

## 4. Recognition as a durable, non-averaged value (direction Q)

`rPeak` is a ratchet: it only ever goes up, on any event that pushes R to a new high. The decay
floor, `0.35 · rPeak`, then rises permanently every time a new defining hit is scored. This gives
exactly the property the brief calls for: R can fall a long way from a recent peak, but it never
forgets that the peak happened, and it never becomes a lifetime average — a franchise's *best* film
sets a floor that its worst film cannot erase, no matter how many mediocre films come after (Case D
shows F, not R, doing almost all the damage from mediocrity; Case E shows a 20-year-old peak still
worth 48 points of Recognition after roughly one full R half-life of silence — 1040 of 1000 weeks —
because it is decaying toward a floor, not toward zero).

`0.35` is a STARTING POINT. Raising it makes legendary IP nearly unkillable (closer to CCM's "0-100
durable fame, rarely falls" reference shape, 03e §12); lowering it makes even iconic properties
eventually forgettable, closer to a slower version of Momentum. 0.35 was chosen so that a
peak-80 property (Case E) still reads as R≈48 (comfortably a REVIVAL CANDIDATE) after 20 years, not
merely "not zero."

---

## 5. Descriptor bands (derived, never a stored flag)

```
ws  = weeksSinceLastRelease(branch)          # derived from installments[] × FilmResult release week
gap = gapBeforeLastRelease(branch)           # derived the same way; None if <2 installments

if ws >= 156:                                 # DORMANCY_WEEKS
    return "REVIVAL CANDIDATE" if R >= 40 else "DORMANT"
if ws < 104 and gap is not None and gap >= 156:
    return "ACTIVE AGAIN"                     # just broke a long silence
if ws < 104:
    return "ACTIVE" if (M >= 5 and F < 55) else "COOLING"
return "COOLING"                              # the 104–156wk fading-but-not-yet-dormant band
```

Note this reads **R** as well as M/F/weeksSince, not just the three the brief's parenthetical names
literally. That is a deliberate, minimal deviation, not a new manual flag: distinguishing DORMANT
from REVIVAL CANDIDATE is definitionally "is there durable value worth reviving," and Recognition
*is* the durable-value meter this model already carries — using it here is the whole reason R exists
as a separate factor. All four inputs (R, M, F, ws/gap) are already-computed model outputs, so the
"never a separate manual state" rule (no hidden flag, always recomputed) is fully respected.

Thresholds (104wk "recently active," 156wk "dormant," R≥40 "durable enough to revive," M≥5 "genuine
positive buzz," F<55 "not yet oppressive") are STARTING POINTS calibrated against the seven cases
below, not derived from a formula.

---

## 6. The two outputs P17 hands to other packages

Both are pure read-model functions of the branch's current (R, M, F, ws) — nothing is written back,
nothing new is computed inside P07/P11's own formulas (design law #2).

### 6.1 Inherited awareness/reach (0..1) → P07's optional `ReceptionInputs` seam

```
nostalgia = 0.25 · clamp((ws − 104)/156, 0, 1) · (R/100)      # only nonzero once ws ≥ 104wk
awarenessInput = clamp(0.5·(R/100) + 0.3·(M/100) − 0.35·(F/100) + nostalgia, 0, 1)
```
Feeds the exact optional-input pattern d.4 names: an absent/undefined field on `ReceptionInputs`
that is a bit-exact no-op for every non-franchise film, following the `setUplift`/`setNovelty`
precedent (`reception.ts:87-103`, "ABSENT is the whole legacy world"). At the call sites
`reception.ts:649-652` / `marketingMenu.ts:87-96` it adds into `preMarketingAwarenessOf` exactly the
way `appealReach` already does — P07 keeps every formula; P17 supplies one clamped number.

### 6.2 Expectation multiplier → the forecast's `expectedTotal`

```
expectMult = clamp(1 + 0.006·(R − 50) + 0.004·M − 0.0035·F, 0.6, 1.85)
```
Applied as a scalar on the already-computed center estimate at the point `FilmResult.forecast` is
populated (`tick.ts:594-604`; rival `hollywoodTick.ts:240`), **not** as a new `ForecastFactorKey`.
c.3 flags exactly this risk: widening the closed `ForecastFactorKey` enum
(`types.ts:1881-1892`) touches a persisted leaf (`SegmentForecast` inside `Production.forecastSnapshot`).
The smallest correction is to let P17 hand P11 one multiplier applied *after* `computeForecast`
produces its center, the same way `economyScale` is applied at a named point in `reception.ts:619-629`
— no enum growth, no second forecast model.

This is the entire mechanical expression of direction B's "higher expectations, bigger reputational
downside, no automatic quality bonus": `expectMult` raises the **bar** `computeStarPowerDelta.fcMult`
and the newspaper's `boxDelta` (`newspaper.ts:571-574`) judge the film against — it never touches a
single realized dollar of box office. A franchise film can out-gross an original in absolute terms
and still register as "missed expectations" once R/M have inflated its bar. Awareness (§6.1) helps
sell tickets; the multiplier (§6.2) makes it harder to be called a hit. That pairing — real reach,
harsher judgment — is exactly direction B, achieved with zero new formulas in P07/P11/P14, per c.5's
own note that "P17's direction B can be expressed by what P17 feeds into `expectedTotal`."

---

## 7. Nostalgia/revival without a free fatigue reset (item 8, directions D/P)

The exploit the brief warns against: a rival (or player) discovers that simply **waiting** is a
dominant strategy — "shelve it, let Fatigue clear, cash in." Three structural facts in this model
jointly foreclose that, without adding a special case:

1. **R also decays during dormancy**, toward a floor that is a *fraction* of the peak, not the peak
   itself. Waiting has a real, continuous cost against the one meter that actually drives long-run
   awareness (§6.1) — it is never free, only slow.
2. **M fully flatlines to 0**, never positive, during any dormancy long enough to matter (16
   half-lives at 20 years — Case E). A revival gets **zero** momentum tailwind purely from waiting;
   any excitement in a revival's own opening has to come from the film P07 actually produces, which
   is scored by the *same* event-delta rule as everything else (§2) — a bad reboot still crashes M
   and does not clear F any faster than an equally bad direct sequel would (Case G: dF=+9.11, same
   formula, no reboot-specific discount on the downside).
3. The nostalgia term (§6.1) touches **only** `awarenessInput` (reach), never `expectMult` (the
   bar) and never F directly. It is capped (`0.25` max) and saturates at exactly the dormancy
   threshold (156 weeks) — waiting past that point buys nothing further. It rewards a durable,
   already-earned R; it does not manufacture new R, and it cannot be farmed by repeatedly going
   dormant on purpose, because each dormancy already cost R against its floor per (1).

Net effect: dormancy is **neutral-to-costly**, never strictly better than staying active with good
films. The only thing a rights-holder gains from waiting is F's ordinary recovery — which an active
studio also gets for free between releases via the same 3-year half-life; dormancy just buys more of
it, at the price of R decay and a fully flat M. Case F/G below make this numeric: a *good* reboot
after 20 years still needs its own 83-quality film to reach M=49; nothing about the wait itself
produced that number.

---

## 8. Rival compact policy (three lines, slots into `hollywoodTick.ts` `decide()` step 2, e.5)

```
1. IF a held property/branch is band ∈ {ACTIVE, ACTIVE AGAIN} and M ≥ 20
     → bias the roulette (e.3) toward a same-type continuation of it, scored by the SAME
       chooseIndustryPackage over perceived inputs carrying this branch's awarenessInput (no 2nd forecast).
2. ELSE IF a held property is band = REVIVAL CANDIDATE and R ≥ 40 and dev capacity is free
     → commission a REBOOT with bounded seeded probability (not guaranteed).
3. ELSE → do not touch this property this cycle; fall back to the existing genre-affinity roulette.
```
Attaches at exactly the branch point e.5 names (`hollywoodTick.ts:175-184`), requires
`policy.version: 2` and `hollywoodValidation.ts:208-211` widening (already flagged there as
necessary), and needs P16 to give rivals a rights model first (e.5's own gap: "rivals have no rights
model at all" today) — that is a P16 dependency, not something this model can create.

---

## 9. Save cost per franchise

Following f.2's law (scalars + id lists, never a copy of `FilmResult`/participants), with 16-bit
fixed-point for R/M/F (0.1 precision is more than enough for a display band) and ~12-byte id refs
(matching the engine's existing short-id convention for `productionId`/`conceptId`):

| Element | Bytes |
|---|---|
| StoryProperty root fixed fields (id, R, rPeak, rightsOwnerRef) | ~28 |
| milestones[] (optional, capped ~5 × {week,kind,productionId}) | ~75 |
| Branch fixed fields (id, type, parentRef, M, F, lastEventWeek) | ~17 |
| per installment id ref | ~12 |

**Typical franchise** (root + milestones, 1 main branch with 4 installments, 1 spin-off branch with
2 installments): 28 + 75 + (17+4·12) + (17+2·12) = **≈228 bytes**.
**Large franchise** (5 branches × 8 installments avg): 28 + 75 + 5·(17+8·12) = **≈740 bytes**.

Both are far under the per-film 1.5 KB budget f.2 quotes from PERF-009 (already missed elsewhere in
the codebase, `docs/engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md:183,320-322`) — this shape
adds roughly one-fifth to one-half of a single `FilmResult`'s budget per franchise, for the whole
franchise's persistent state.

---

## 10. Seven worked case histories

All numbers below are exact script output (`m1a_three_meters.py`), not hand-rounded. `q` = blended
quality, `beat` = total/expectedTotal, `expMult`/`aware` = the two §6 outputs computed from the
*resulting* state. Dollar figures ($M) are illustrative box-office inputs chosen to match each
case's stated adjectives/ratios; they are DESIGN INFERENCE placeholders, not sourced grosses.

### CASE A — breakout original → fast direct sequel

| Week | Event | q | beat | dR | dM | dF | R | M | F | Band | expMult | aware |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Film 1 (critic 85, aud 80, opening 2.2×, total 2.0×) | 82.0 | 2.00 | +42.1 | +55.0 | 0.0 | 42.1 | 55.0 | 0.0 | ACTIVE | 1.173 | 0.376 |
| 4 | Film 2 dev starts | — | — | — | — | — | 42.0 | 52.7 | 0.0 | ACTIVE | 1.163 | 0.368 |
| 60 | Film 2 greenlight/release eve | — | — | — | — | — | 41.0 | 29.0 | 0.0 | ACTIVE | 1.062 | 0.292 |

**Player sees at wk60:** ACTIVE. *"Recognition is building fast off Film 1; audiences are still
excited (M=29, decaying from a peak of 55); no fatigue yet. Expect roughly a 6% bump over a
comparable non-franchise forecast."* **Rival's 3-line policy:** rule 1 fires (ACTIVE, M=29≥20) —
commissions the same-type continuation immediately, exactly matching the player's own timing; the
model does not create an advantage for whichever side moves faster, only for whoever the box-office
event favors.

### CASE B — two straight hits → spin-off 40wk later (must not be punished for speed)

| Week | Event | q | beat | dR | dM | dF | R | M | F | Band | expMult | aware |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Film 1 smash (critic 80, aud 78, 1.6×) | 78.8 | 1.60 | +31.7 | +37.0 | 0.0 | 31.7 | 37.0 | 0.0 | ACTIVE | 1.038 | 0.269 |
| 52 | Film 2 smash (critic 82, aud 80, 1.48×) | 80.8 | 1.48 | +22.0 | +42.0 | 0.0 | 53.0 | 63.2 | 0.0 | ACTIVE | 1.271 | 0.455 |
| 92 | Spin-off greenlight eve (+40wk) | — | — | — | — | — | 52.1 | 41.3 | 0.0 | ACTIVE | 1.177 | 0.384 |

**Player sees at wk92:** ACTIVE. *"Two hits in a row — Momentum is still strongly positive (41),
Recognition just crossed 52, zero fatigue. This spin-off is well-timed, not rushed."* **Fatigue is
exactly 0.0 throughout** — nothing in the model penalizes cadence by itself; F only moves on
mediocre-or-worse *quality* (§2), so two smashes back-to-back at 52 and then 40 weeks accrue no
fatigue at all, satisfying the case's explicit "must not punish this for speed." **Rival:** rule 1
fires strongly (M=41) — same bias toward continuing, no timing penalty applied to it either.

### CASE C — hit then flop (Recognition stays high; Momentum falls; salvageable)

| Week | Event | q | beat | dR | dM | dF | R | M | F | Band | expMult | aware |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Film 1 iconic (critic 90, aud 88, 2.34×) | 88.8 | 2.34 | +50.0 | +55.0 | 0.0 | 50.0 | 55.0 | 0.0 | ACTIVE | 1.220 | 0.415 |
| 78 | Film 2 weak (critic 45, aud 42, 0.6×) | 43.2 | 0.60 | −1.5 | −20.7 | +32.8 | 46.8 | 3.2 | 32.8 | COOLING | 0.879 | 0.129 |

**Player sees right after Film 2:** COOLING. *"Recognition barely moved (50→47) — this is still a
known, respected property. Momentum crashed to near-zero and real fatigue built up (33). The next
film needs to actually be good; the brand itself is not the problem."* R fell **1.5 out of 50** from
a genuine flop — the mechanical proof of "Recognition stays high." **Rival:** rule 3 fires (COOLING,
not ACTIVE/ACTIVE AGAIN, and not a REVIVAL CANDIDATE since ws is small) — the compact policy stands
down on this property for now and falls back to an original, exactly the "salvageable, not
abandoned, just not right now" read the case calls for.

### CASE D — rapid mediocrity ×4 @ 40wk cadence (Fatigue must become visibly important)

| Week | Event | q | beat | dR | dM | dF | R | M | F | Band | expMult | aware |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Film 1 (56.4, 0.9×, ORIGINAL, s=0) | 56.4 | 0.90 | +1.3 | −2.8 | 0.0 | 1.3 | −2.8 | 0.0 | COOLING | 0.696 | 0.000 |
| 40 | Film 2 (56.4, 0.9×, sequel, s=0.9) | 56.4 | 0.90 | +1.2 | −2.8 | +21.5 | 2.4 | −4.7 | 21.5 | COOLING | 0.620 | 0.000 |
| 80 | Film 3 (56.4, 0.9×, sequel, s=0.9) | 56.4 | 0.90 | +1.1 | −2.8 | +18.7 | 3.5 | −5.9 | 36.8 | COOLING | 0.600 | 0.000 |
| 120 | Film 4 (56.4, 0.9×, sequel, s=0.9) | 56.4 | 0.90 | +1.1 | −2.8 | +16.6 | 4.5 | −6.7 | 47.4 | COOLING | 0.600 | 0.000 |

**Player sees after Film 4:** COOLING, forecast multiplier pinned at its 0.60 floor. *"Four
mediocre outings in a row — audiences are visibly tired of this. Momentum has been negative since
Film 1; Fatigue has climbed steadily to 47 and is now the dominant factor in how a fifth film would
be received."* Fatigue climbs **monotonically and visibly** (0→21.5→36.8→47.4) purely from repeated
mediocrity at fixed similarity — no quality change, no cadence change, same 40-week gap throughout —
which is exactly item 5's ask, and note Recognition **never gets a chance to build** (it caps under
5) because none of the four films ever cleared the 55-quality gain floor. `awareness=0.000` at every
step is the sharpest legibility signal the model produces: the franchise has become mechanically
worthless as a reach input. **Rival:** rule 3 fires from Film 2 onward (COOLING, F rising past the
implicit "not worth it" read) — a rival running this policy stops chasing this property after one
mediocre sequel, which is the intended contrast with a player who keeps pulling the lever anyway.

### CASE E — long dormancy (20 years / 1040 weeks) on a major property

| Week | Event | R | M | F | Band | expMult | aware |
|---|---|---|---|---|---|---|---|
| 0 | Last release (established; R=70, rPeak=80, M=15, F=45) | 70.0 | 15.0 | 45.0 | ACTIVE | 1.023 | 0.237 |
| 1040 | +1040wk (20y) dormant | 48.4 | 0.0 | 0.4 | REVIVAL CANDIDATE | 0.989 | 0.362 |

**Player sees today:** REVIVAL CANDIDATE. *"This property hasn't released anything in 20 years.
Recognition has faded from 70 to 48 but never disappeared — it's still a known name. Momentum is
fully neutral and Fatigue has essentially recovered to zero. This is a clean slate with real
name-recognition still attached — a strong revival candidate."* Note `aware` (0.362) is actually
*higher* than it was the day the franchise went quiet (0.237) — the nostalgia term (§6.1, §7) is
doing real work here, but only on reach, never on the bar (`expMult` is essentially unchanged, 1.023
→ 0.989). **Rival:** rule 2 fires (REVIVAL CANDIDATE, R=48≥40) — bounded seeded probability of
commissioning a reboot, not a guarantee; a rival does not automatically snap up every dormant IP.

### CASE F — successful reboot after Case E's dormancy

| Week | Event | q | beat | dR | dM | dF | R | M | F | Band | expMult | aware |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1040 | (carried from E) | — | — | — | — | — | 48.4 | 0.0 | 0.4 | REVIVAL CANDIDATE | 0.989 | 0.362 |
| 1040 | Reboot, excellent (critic 85, aud 82, 1.6×) | 83.2 | 1.60 | +16.6 | +49.1 | 0.0 | 65.0 | 49.1 | 0.0 | ACTIVE | 1.287 | 0.472 |

**Player sees right after:** ACTIVE, and Recognition set a **new peak** (65 > old rPeak 80's floor
but still under 80 — one excellent reboot does not instantly out-recognize the franchise's all-time
best; it takes a real string of hits to raise `rPeak` itself past 80). *"The reboot landed — this
franchise is fully alive again, arguably stronger (M=49) than it's been in decades."*

### CASE G — failed reboot after Case E's dormancy

| Week | Event | q | beat | dR | dM | dF | R | M | F | Band | expMult | aware |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1040 | (carried from E) | — | — | — | — | — | 48.4 | 0.0 | 0.4 | REVIVAL CANDIDATE | 0.989 | 0.362 |
| 1040 | Reboot, poor (critic 40, aud 38, 0.5×) | 38.8 | 0.50 | −1.8 | −23.6 | +9.1 | 46.7 | −23.6 | 9.1 | COOLING | 0.854 | 0.131 |

**Player sees right after:** COOLING, and `aware` collapsed from 0.362 to 0.131 — the reboot's own
failure erased almost all of the nostalgia-driven reach bump it launched with. Recognition still
barely moved (48.4→46.7) — the franchise's durable brand survives a bad reboot exactly as it
survives a bad sequel (Case C) — but the **reboot's own new branch** now carries real negative
Momentum and rising Fatigue of its own, independent of the still-untouched old main branch (verified
below). **Rival:** rule 3 fires post-event (band flipped to COOLING) — a rival would not chase a
second attempt immediately.

**Story-level isolation check** (direction I/N — a reboot must not silently touch the branch it
reboots from): after either Case F or Case G's reboot event, `PropE-main` (the original, still-
dormant continuity) remains exactly `R=48.43, M=0.00, F=0.44` — untouched by either fork. Two rights-
holders could run the successful reboot (F) and the failed one (G) as genuinely independent
counterfactuals from the same starting property, which is what "bounded branching" is for.

---

## 11. Self-critique

**Legibility.** Mostly good: a player who sees "COOLING, expMult 0.60" after four mediocre sequels
(Case D) can plausibly infer "Fatigue is now doing the damage" even without seeing the raw number,
because the descriptor + a one-line sentence naming the dominant factor (a small addition to the UI
this model doesn't specify) closes the loop. The weakest legibility point is **R vs the ceiling near
rPeak**: after Case F's reboot, R=65 while rPeak stays at 80 — a player who doesn't know rPeak exists
has no way to predict *why* an 85-quality reboot only added 16.6 points instead of pushing R to 80+
(the `room(R,1.3)` diminishing-returns term is invisible without a tooltip). Recommend exposing
`rPeak` (or a plain "all-time high" label) alongside R in any UI built from this model — otherwise
"why didn't a great film move the number more" is a legitimate, unanswered player question.

**Double counting with P07/P14.** The design is careful about this in the two places that matter
most (§6.2's note on `computeStarPowerDelta.fcMult`, and §6.1 reusing the exact `setUplift` no-op
pattern) but one soft spot remains: `awarenessInput` folds in a **positive** M term (0.3·M/100), and
`expectMult` *also* reads M (0.004·M). Both terms are legitimate on their own (one is "the audience
already knows to show up," the other is "expectations are higher because of recent buzz") but they
are driven by the *same underlying signal* (recent reception), so a single very hot Momentum reading
pushes a franchise's box office up **and** its bar up simultaneously through two independent seams
that a reader auditing "why did this sequel read as underwhelming despite a real gross increase"
would have to trace through two different packages (P07 and P11) to fully explain. This is
intentional (it is literally what direction B asks for) but it is the one place in this model where
"no duplicate formulas" is satisfied only in the narrow sense (no formula is copied) — the same
number is legitimately consumed twice for two different purposes, and that coupling should be
documented at the seam, not just here.

**Exploit surface.**
- *Fast-sequel spam*: not rewarded (Case D shows this directly — repeated mediocrity at any cadence
  drives F up and R growth to near-zero regardless of speed) but not specifically **punished for
  speed** either (Case B shows cadence alone costs nothing when quality holds) — this is the correct
  behavior per direction D, but it does mean a studio that can reliably produce *good-enough*
  (q≥75, clears `relief_F`'s threshold) content on a fast cadence has no mechanical ceiling on
  stacking Momentum forever except the ±100 clamp and the half-life decay between releases — which
  is arguably fine (that's "a real hot streak"), but is worth flagging as the model's version of
  MGT2's "you will get 5.0 IP forever anyway" plateau (03e §2.6) if a player chain of q≥85 films
  ever materializes.
- *Dormancy reset*: addressed structurally in §7; the residual soft spot is that the nostalgia bonus
  (§6.1) is a pure function of `(ws, R)` with no memory of *why* the property went dormant — a
  property that went dormant because its last three films were disasters (F was still elevated when
  it stopped releasing) gets the *identical* eventual nostalgia bonus as one that went dormant at
  its absolute peak, once both have crossed the 156-week dormancy threshold and F has fully decayed
  either way. Real-world evidence (04b §E: Furiosa, Expendables 4 — dormancy did NOT rescue franchises
  that went quiet on a low note) suggests this may be too generous; the smallest correction is to
  gate the nostalgia bonus's magnitude on `R` at the *moment* dormancy began, not just current R,
  but that requires one more stored scalar per branch (`rAtDormancyStart`) and was left out of this
  STARTING POINT for the sake of the "handful of scalars" budget in f.2 — flagged here as the most
  concrete open tuning question for the report writer.
- *Reboot-as-fatigue-cure*: not available — a reboot's own branch starts at F=0 by construction (it
  is a new branch), so there is nothing to "cure"; the OLD branch's F decays at exactly its normal
  rate regardless of whether a reboot happens elsewhere (verified in Case F/G's isolation check).
  The only way F ever drops fast is `relief_F`, which requires q≥75 — i.e., you cannot fatigue-
  launder a franchise by rebooting it badly, only by making something actually good.

**Weakest part of this shape.** The single biggest judgment call is the **blended quality index**
`q = 0.4·critic + 0.6·audience` used everywhere (gain/loss for R, M, and F alike). Real evidence is
mixed on whether critics or audience should dominate franchise-level reputation math (Hennig-Thurau
2009's brand-extension model weights parent-brand *image* and *awareness* far more than review
scores; 03b's MGT2 "Sequelitis" discussion ties IP growth to "ratings" generically). Collapsing two
public signals into one scalar is simple and legible but throws away a real distinction the
evidence supports keeping separate: a critically-savaged-but-audience-loved franchise (many comedy
franchises) and a critically-adored-but-audience-cold one (arthouse-adjacent IP) currently produce
**identical** R/M/F trajectories under this model if their blended `q` matches, even though real
franchises in that position behave differently (audience score should probably dominate Momentum,
since M ≈ "will people show up," while critic score arguably belongs more with Recognition's
long-run reputation). This is the one place a second modeler working the same three-meter shape
should look first before this becomes the shipped constant set.

**Open question for the report writer:** should `expectMult`'s floor (0.6) and ceiling (1.85) be
narrower? At the extremes (Case D's floor, Case F's near-ceiling) the swing is a genuine ±40-85%
change to the bar a film is judged against, which is a large lever to hand to a single P17-owned
number feeding P11's forecast — worth a second modeler's independent read on whether that range is
too aggressive relative to how much box-office variance `computeBoxOffice`'s own marketing/awareness
chain (d.2) already produces on its own.
