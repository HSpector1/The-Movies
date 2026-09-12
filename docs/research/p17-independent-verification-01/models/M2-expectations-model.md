> **STATUS: HISTORICAL INPUT (revision 02, 2026-09-12).** Unmodified research input below this line. Where it differs from the canonical specification — report [`../P17-INDEPENDENT-VERIFICATION-REPORT.md`](../P17-INDEPENDENT-VERIFICATION-REPORT.md) §5 (index §5.7, with §8/§9/§10), canonical calculator [`../redteam/R3-reviewer-corrections-calc.py`](../redteam/R3-reviewer-corrections-calc.py), committed output [`../redteam/R3-output.txt`](../redteam/R3-output.txt) — **the report governs.** Superseded here: the expectation multiplier on `expectedTotal` (§1.2) is NOT recommended (report §5.3, §7); the seam analysis and double-counting audit remain the source of §7.

# M2 — Expectations Model for Franchise Continuations

Read-only paper model. No repo edits, no builds, no tests. All engine facts cited by
`file:line` as given in `02-project-studio-architecture-READONLY.md` (itself citing
commit `13370d42` of `/Users/bruce/The Movies`); design content beyond that is DESIGN
INFERENCE and labelled as such. All numeric constants proposed here are STARTING
POINTS, not final tuning.

---

## 0. One-paragraph verdict

Expectations already live in exactly one place in the shipped architecture — the
**locked greenlight forecast** (`Production.forecastSnapshot` → frozen
`FilmResult.forecast`, D-11.C) — and two systems already judge outcomes against it
(`computeStarPowerDelta.fcMult` for fame, the newspaper's `boxDelta` for narrative). P17
does not need, and must not add, a second "trust/hype" number (confirmed independently
by the Future-Ops critique itself: *"'trust' has no selected counterpart — expectations
already live in the locked forecast, §d.3"*, `02-...md:372` row h.1). The whole
Expectations model therefore reduces to: **P17 computes two bounded scalars from its own
Recognition/Momentum/Fatigue (R/M/F) state and feeds them through the two seams that
already exist** — an *awareness* input (into `preMarketingAwarenessOf`) and an
*expectation* input (into the greenlight forecast) — plus **one exclusively-P17-owned
consumer**, its own R/M/F update, which reads the same public `FilmResult` that fame and
the newspaper already read. Nothing else changes. Market crowding stays in P15's
`competitionFactor` untouched.

---

## 1. The two supply seams (what P17 writes)

### 1.1 Seam A — Inherited awareness → `preMarketingAwarenessOf` (direction B, "higher floor of attention")

- Formula (unchanged, P07-owned): `preMarketingAwarenessOf(audienceAwareness, appealReach) = clamp(0.7·A/100 + 0.3·appealReach, 0, 1)` (`reception.ts:571-578`; `02-...md:183`).
- Cleanest seam named in evidence: an **optional `ReceptionInputs` field**, precedent-matched to `setUplift?`/`setNovelty?` (`reception.ts:87-103`, "ABSENT is the whole legacy world … a bit-exact IEEE no-op"; `02-...md:209`), consumed at the call sites `reception.ts:649-652` and `marketingMenu.ts:87-96` (`02-...md:201`).
- **P17 proposal**: `inheritedAwareness01 ∈ [0, 0.35]`, a bounded *floor* raise on `appealReach` (direction B is explicitly "higher floor of attention," not a ceiling raise), computed by P17 from the StoryProperty's current Recognition and the branch's current Momentum, e.g. (STARTING POINT, P17-internal, not evidence-derived):
  `inheritedAwareness01 = clamp(0.25·recognition01 + 0.10·max(0, momentum01), 0, 0.35)`
  where `recognition01`/`momentum01` are P17's own 0..1-normalized R/M state (owned entirely inside the P17 root; never written to `FilmResult`/`Production`).
- Effect: raises `appealReach` (hence `preMarketingAwarenessOf`) for a known property even before a single trailer airs — this is "inherited recognition/marketing leverage," verbatim direction B — and it is **capacity-only**: because `efficientMarketingCapacity = 15,000 + 1,785,000·pma^1.3` (`reception.ts:586-592`), a higher floor makes marketing dollars *more efficient*, it does not buy gross directly. No new formula; P07 keeps `preMarketingAwarenessOf`.
- **Legs consume the same single input for free.** Legs/overexposure are governed by `spend ÷ capacity > 1.3` (`reception.ts:597-768`, `02-...md:185`), and `capacity` is already a function of the same `pma` that Seam A raised. So "legs" is not a second injection point — it is a downstream consequence of the *one* opening-time awareness value. This is exactly the double-count risk the task asks to rule out; §5 makes this explicit per-channel.
- Owner of the **formula**: P07 (`reception.ts`). Owner of the **value**: P17.

### 1.2 Seam B — Expectation multiplier → forecast `expectedTotal` (direction B, "higher bar to clear")

- Lock point (unchanged, P11-owned): `forecastSnapshot = computeForecast(inp, ctx, engaged, engaged)` at greenlight, copied verbatim (three scalars) to `FilmResult.forecast = {expectedCriticScore, expectedTotal, expectedOpening}` (`actions.ts:504-520,613-627`; `tick.ts:594-604`; `02-...md:191-192`).
- **P17 proposal**: feed the *same* `inheritedAwareness01`-derived signal, scaled up, as a bounded multiplier applied **only to the box-office side of the forecast center** (`expectedTotal`, and `expectedOpening` which is structurally the same input) — **never to `expectedCriticScore`**. Direction B says "no automatic sequel quality bonus," and the evidence shows no path by which `castFame`/awareness currently touches the critic-score forecast term at all; keeping the multiplier box-office-only is the smallest correction that respects that boundary (see §5, "Critic" row).
- STARTING POINT: `expectationMult = clamp(1 + 0.6·recognition01 + 0.4·max(0, momentum01), 1.0, 1.6)` — i.e. a known, currently-hot property can face a forecast bar up to **60% higher** than an otherwise-identical original; a dormant/damaged property with recognition01 near 0 gets a bar near 1.0× (no penalty for being a franchise, no bonus for being forgotten).
- Applied where `computeForecast`'s engaged central estimate is formed (`forecast.ts:406-465`), as one more optional multiplicative input in the same family as the existing causal/uncertainty factor system — **not** as a new `ForecastFactorKey`. See §3 for why the enum itself must stay closed.
- Because this happens **before the greenlight lock**, it is the *only* place expectation enters, and it is then frozen for the life of the film — no double application. Consumers read the locked number; they never re-derive it (§5).
- Owner of the **formula**: P11 (`forecast.ts`, `Production.forecastSnapshot`). Owner of the **value**: P17.

---

## 2. Reputational downside — verifying the "no new formula" claim, precisely

Task claim: *"P14's `computeStarPowerDelta` already judges realized vs `expectedTotal`
(`fcMult` 0.85..1.15) and the newspaper judges `boxDelta`, so a famous property's flop
already hits fame harder with no new formula."*

**Verified, with one load-bearing correction.** Reading the exact formula
(`starPower.ts:67-120`; constants `tuning.ts:552-568`; `02-...md:146`):

```
reach01  = total/(total+10,000,000)
audGain  = clamp((aud-40)/(65-40), 0, 1.2)
fcMult   = clamp(1 + 0.3·(total/expectedTotal - 1), 0.85, 1.15)
room     = ((100-fame)/100)^1.6
gain     = 9 · roleWeight · reach01 · audGain · fcMult · room
loss     = 16 · roleWeight · reach01 · clamp((45-aud)/45, 0, 1) · (fame/100)^1.5
delta    = clamp(gain - loss, -4, +10)
```

`fcMult` (the forecast comparator) **appears only inside `gain`.** It does not appear
anywhere in `loss`. This matters:

- A film that **misses `expectedTotal`** shrinks `fcMult` toward its floor (0.85), which
  **suppresses upside** (a would-be fame gain is cut by up to 15%) — but if `audGain` is
  already positive, `fcMult` cannot turn a gain negative on its own (floor is 0.85, not
  0 or negative).
- The actual **downside driver** is `loss`, which is a pure function of `audienceScore`
  (via `clamp((45-aud)/45,0,1)`) and, crucially, of **current fame raised to the 1.5
  power** — `(fame/100)^1.5`. This is where "a famous property's flop already hits
  harder" is really true: it is talent-fame-scaled, not franchise-track-record-scaled.
  A famous lead in a badly-reviewed franchise film loses *more* fame for the *same* bad
  audience score than an unknown lead would, purely because of their own current fame,
  independent of any P17 state.
- Reason codes `exceededCommercialExpectations` (fcMult ≥ 1.15) / `missedCommercialExpectations`
  (fcMult ≤ 0.85) fire off the *gain* side only (`starPower.ts:141-142`); a flop with a
  merely-mediocre (not terrible) audience score can miss `expectedTotal` badly, sit at
  the fcMult floor, and still show **no fame loss at all** if `audGain>0` and `aud≥45`
  (worked in CASE C below).

**What P17 adds, exactly:** nothing to this formula. Per the architecture sheet's own
seam table (`02-...md:203-204`, d.4): *"Reputational downside for the property |
P17-owned: Recognition/Momentum/Fatigue updated from the public FilmResult (criticScore,
boxOffice, segmentScores) and filmAudienceScore — reading, never writing, P07/P08
results."* P17's only addition is its **own** R/M/F update, reading the same frozen,
already-public `FilmResult` (and the `Production.forecastSnapshot`/`FilmResult.forecast`
it fed in §1.2) — a second *reader*, not a second *formula* for fame. Talent fame and
franchise Momentum/Fatigue are different state on different objects (`Talent.fame` vs.
the P17 root); both legitimately reacting to one `FilmResult` is not a double-count
(§5 makes the per-channel uniqueness explicit) — it would only be a double-count if P17
also wrote a second fame-affecting multiplier, which direction R (P17 changes no salary,
mints no cash) and this analysis together forbid.

**Correction to flag for the P17 charter:** do not describe this as "expectations hit
fame harder for famous properties." Precisely: *"expectations narrow the fame upside
via `fcMult`; the downside is driven by audience reception scaled by the talent's own
current fame, not by the property's history."* If the design intent really is "a famous
*property's* flop should cost more than an obscure property's flop, independent of the
lead's personal fame," that effect does not exist today and is out of scope for this
seam — it would require a new P14 formula, which direction R does not authorize P17 to
request implicitly. Recommend the P17 charter state this distinction explicitly so a
future author doesn't "fix" a gap that isn't P17's to fix.

---

## 3. Narrower forecast bands for continuations (H-T 2009) — recommendation and owner

Hennig-Thurau, Houston & Heitjans 2009 (`03e-...md:237`, verbatim): sequels are **less
risky** — "weighted MAPE improved 38%, RMSE 33%, CV 48%" — and parent-brand awareness is
the single strongest predictor (β=.71) of the brand-extension value, ahead of image
(β=.18) and star continuity (β=.15).

The architecture sheet flags the naive implementation as a **frozen-leaf risk**: adding
a `franchiseExpectation`/`continuationTrackRecord` key to `ForecastFactorKey` "would
widen" a closed enum that lives on `SegmentForecast` inside the persisted
`Production.forecastSnapshot` leaf (`02-...md:136`) — i.e., it would need schema
versioning to appear as a **named, player-visible causal/uncertainty chip** in the
forecast breakdown UI.

**Recommendation (smallest correction): narrow the band width numerically, without
adding a display chip or touching the closed enum.** `CONFIDENCE_INTERVAL_WIDTH[confidence]`
is applied as a width multiplier at the point the band is formed (`forecast.ts:406-465`);
add one more **optional, bounded, absent-is-no-op multiplicative narrowing term** in the
exact `setUplift`/`setNovelty` style already established as house precedent
(`reception.ts:87-103`) — a pure numeric adjustment to band width, not a new named
factor:

`bandWidthMult = clamp(1 − 0.20·continuityStrength01, 0.80, 1.0)` (STARTING POINT; H-T's
observed ~33-48% improvement is not fully trusted here — it conflates several effects
the sim keeps separate, so the cap is set conservatively at 20%, not ~40%)

where `continuityStrength01` is a P17-supplied scalar (e.g. "has ≥1 released prior
installment on this StoryProperty, discounted by how long ago and how well it did" —
P17-internal, not evidence-derived). Because this is a pure numeric multiplier on band
*width* (not a new enum member, not a new display chip), it needs no schema/version
change to `ForecastFactorKey` or to the persisted `Forecast` leaf shape.

- **Owner of the formula**: P11 (`forecast.ts`, alongside `CONFIDENCE_INTERVAL_WIDTH`).
- **Owner of the value**: P17.
- **v1 recommendation**: implement this narrowing (it is cheap and schema-safe); do
  **not** attempt the enum-widened, player-visible "franchise track record" chip in
  the forecast breakdown — that is a genuine schema-versioning decision Owner-scoped to
  P11 if ever wanted, flagged in Open Questions below.

---

## 4. The P15 boundary (market crowding) — confirmed untouched

`competitionFactor = 1.0` in `reception.ts` is explicitly ruled **DO NOT TOUCH** by the
P13 design doc, attributed to "P15 market law, not P13" (`…PACKAGE-13.md:389`, quoted at
`02-...md:360`). P17 must never let a continuation's inherited awareness or expectation
value leak into `competitionFactor`, `MarketState.competingSlate`, or any P15-owned
crowding term — "rivals releasing something similar this window" is P15's job in full,
including for a rival's own continuation (§1.2 of the architecture sheet's §e.5 notes
a rival continuation choice is scored through the *same* `chooseIndustryPackage`, which
already runs over `ReceptionInputs`, so rival parity for Seams A/B is automatic without
P17 touching P15 at all — `02-...md:207,243`).

---

## 5. Double-counting audit table

One channel, one entry point, one owner. This is the load-bearing table: it exists so a
single hit or flop is counted exactly once per channel, however many systems
subsequently *read* the resulting number.

| Channel | Where a continuation's inheritance/expectation enters (the ONE place) | Owner | Why not double-counted |
|---|---|---|---|
| **Opening** (box office) | Seam A: `inheritedAwareness01` raises `appealReach`/`preMarketingAwarenessOf` before marketing spend is chosen (`reception.ts:649-652`, `marketingMenu.ts:87-96`) | P07 formula / P17 value | Single optional input, consumed once at the point `pma` is computed |
| **Legs** (weekly decay / overexposure) | *No separate entry.* Inherits Seam A's `pma` through `efficientMarketingCapacity` (`reception.ts:586-592`), which already governs the `spend÷capacity>1.3` overexposure test (`reception.ts:597-768`) | P07 (no P17 change) | Same single upstream value; legs never gets its own P17 input |
| **Critic** (criticScore) | *None, by design.* `expectedCriticScore` and delivered criticScore are untouched by any P17 input (direction B: "no automatic sequel quality bonus") | P07 (no P17 input at all) | Zero entry points — nothing to double-count |
| **Awareness Standing** (`audienceAwareness`) | *No new `StandingChangeSource`.* `updateStanding` already reads realized `reach01`/`starAttention` from the release result (`standing.ts:143-207`); reach was already shaped once, upstream, by Seam A | P08 (no P17 change) | Standing reacts to the *outcome*, not to a P17 input directly — one upstream cause, one downstream reader |
| **Fame** (`Talent.fame`) | Seam B: `expectedTotal` (raised once, at greenlight lock) is read by `computeStarPowerDelta.fcMult` (`starPower.ts:67-120`) | P11 formula (locked value) / P14 formula (consumer) | The locked scalar is read, never re-derived, by exactly one fame formula |
| **Franchise Momentum** | P17's own post-release update, reading `FilmResult.boxOffice`/`audienceScore` vs. the *same* locked `FilmResult.forecast.expectedTotal` P17 supplied in Seam B | P17 (exclusive) | Different state object (P17 root, not `Talent`/`Standing`) — reading the same fact for a different purpose is not a re-application of the fact to the *same* channel |
| **Franchise Fatigue** | P17's own post-release update, reading `criticScore`/`audienceScore` and continuation-type similarity (direct sequel = high similarity; spin-off/reboot = lower — Sood & Drèze 2006, `03e-...md:237`) | P17 (exclusive) | Same as Momentum: one P17-internal formula, one read of the public result |
| **Forecast** (`expectedTotal`/`expectedOpening`) | Seam B, applied once at `computeForecast`'s engaged center (`forecast.ts:406-465`), then frozen (`tick.ts:594-604`) | P11 formula / P17 value | Frozen at lock; every later consumer (fame, newspaper, broadcast) reads the copy, never recomputes it |

---

## 6. Player legibility — the greenlight card

Direction B, translated to a card the player reads *before* committing:

> **Known property.** Continuing *[StoryProperty name]* starts this film with real
> advantages — but also a bar to clear.
> - **Opening floor:** marketing reaches audiences **+[X]%** more efficiently out of
>   the gate (Recognition/Momentum inherited from the property's history).
> - **Expected gross bar:** the studio's own forecast — the number your investors and
>   the trade press will judge you against — is set **+[Y]%** higher than an original
>   film with this cast would face.
> - **The risk:** a film that falls well short of that bar will cost Momentum for the
>   franchise, add to its Fatigue, and — through the lead's own current fame, same as
>   any film — can cost Star Power. A hit will do the opposite.

Where `X` = `round(100·inheritedAwareness01/0.35 · <display-scale>)` (a legible
percentage derived from the same value fed into Seam A) and `Y` =
`round(100·(expectationMult-1))` (Seam B, direct read of the multiplier before lock).
Both numbers are computed by P17 from its own R/M/F state and shown **before** the
forecast is locked, so the player sees the same bar the engine will hold them to —
no hidden future-reception information (direction G), and the card is generated purely
from P17's own root plus the two input values, never by re-deriving or peeking at
`FilmResult`.

---

## 7. Worked numbers

All fame arithmetic below uses the **real, cited** `computeStarPowerDelta` constants
(`starPower.ts:67-120`, `tuning.ts:552-568`). All Momentum/Fatigue arithmetic uses an
explicitly **PLACEHOLDER** rule — the actual R/M/F core formulas are a separate P17
model; this is illustrative only, to show *where* the two locked scalars from §1
feed a franchise-state update, not to propose final R/M/F tuning.

> **PLACEHOLDER RMF RULE** (not evidence-derived, for illustration only):
> `ΔMomentum = clamp(20·(realizedTotal/expectedTotal − 1), −25, +25)`
> `ΔFatigue = max(0, 10·(1 − audienceScore/100)) × similarity` (similarity = 1.0 direct
> sequel/reboot-of-same-property, lower for spin-offs — not modeled here)

### CASE C — Hit then flop (direct sequel)

**Film 1 (the hit).** Lead fame before = 55 (roleWeight = 1.0, lead). No franchise
history yet, so Seam A/B are inactive (`inheritedAwareness01=0`, `expectationMult=1.0`).
Base greenlight forecast `expectedTotal` = $120M. Realized: `total=$250M`,
`audienceScore=78`.

```
reach01 = 250/(250+10) = 0.9615
audGain = clamp((78-40)/25, 0, 1.2) = 1.20 (capped)
fcMult  = clamp(1+0.3·(250/120-1), 0.85, 1.15) = 1.15 (capped) → reason: exceededCommercialExpectations
room    = ((100-55)/100)^1.6 = 0.2788
gain    = 9·1.0·0.9615·1.20·1.15·0.2788 = 3.33
loss    = 0  (aud=78 ≥ 45)
Δfame   = clamp(3.33, -4, +10) = +3.3  →  fame 55 → 58.3
```

Placeholder Momentum/Fatigue: `ΔMomentum = clamp(20·(250/120-1),-25,25) = +21.7` (sharp
rise — "a huge recent hit may make a fast follow-up MORE attractive," direction C);
`ΔFatigue = 10·(1-0.78) = 2.2` (low — good reception keeps Fatigue near the floor).

**Film 2 (the flop).** Now the property has real Recognition/Momentum. P17 sets
`recognition01=0.55`, `momentum01=0.85` (post-hit) →
`expectationMult = clamp(1+0.6·0.55+0.4·0.85, 1.0, 1.6) = clamp(1.67,1.0,1.6) = 1.60`
(capped). Base (non-franchise) forecast for this cast/genre would have been ~$118M;
locked `expectedTotal = 118M × 1.60 ≈ $188.5M` — the higher bar direction B calls for.
Lead fame before = 58.3. Realized: `total=$65M`, `audienceScore=32` (a genuine flop,
weak reviews too).

```
reach01 = 65/(65+10) = 0.8667
audGain = clamp((32-40)/25, 0, 1.2) = 0        (floored — no gain term at all)
fcMult  = clamp(1+0.3·(65/188.5-1), 0.85, 1.15) = clamp(0.803, 0.85, 1.15) = 0.85 (floored) → reason: missedCommercialExpectations
room    = ((100-58.3)/100)^1.6 = 0.2468
gain    = 9·1.0·0.8667·0·0.85·0.2468 = 0        (audGain=0 zeroes it; fcMult's floor is moot here)
loss    = 16·1.0·0.8667·clamp((45-32)/45,0,1)·(58.3/100)^1.5
        = 16·0.8667·0.2889·0.4451 = 1.78
Δfame   = clamp(0-1.78, -4, +10) = -1.8  →  fame 58.3 → 56.5
```

Placeholder: `ΔMomentum = clamp(20·(65/188.5-1),-25,25) = clamp(20·(-0.655),...) = -13.1`
(sharp drop); `ΔFatigue = 10·(1-0.32)·1.0(direct sequel) = 6.8` (Fatigue rises fast on a
mediocre-to-bad *similar* follow-up, per Sood & Drèze 2006 / direction C).

**Reading the case:** the higher bar (Seam B) is what turned a $65M gross — which would
have looked like a modest original film — into a scored miss (`fcMult` floored,
`missedCommercialExpectations`) and a sharp Momentum/Fatigue swing; the fame hit itself
(−1.8) is driven by the audience score, not the miss, exactly as §2 verifies.

### CASE G — Failed reboot

A reboot restarts continuity from a dormant/damaged StoryProperty (direction H); per
04a/04b §C-F (`04a-...md:236-247`, `04b-...md:210-225,255-268`), Recognition survives a
prior flop but Momentum resets toward neutral on the new branch, and "restarting
continuity is not a fatigue cure" (Genisys/Dark Fate both failed after resetting,
`04b-...md:268`). P17 sets a *discounted* Recognition carry-over: `recognition01=0.30`
(damaged/dormant), `momentum01=0` (freshly reset branch) →
`expectationMult = clamp(1+0.6·0.30+0.4·0, 1.0,1.6) = 1.18`. Base non-franchise forecast
for an unknown-quantity reboot cast = $60M; locked `expectedTotal = 60M×1.18 ≈ $70.8M`
— **deliberately lower than CASE C's bar**, because a damaged/dormant property earns a
smaller floor, not a flat "franchise bonus" (this is the point of feeding real R/M
state into Seam B rather than a binary "is a continuation" flag).

Recast lead (no iconic-association carry-over), fame before = 45. Realized:
`total=$40M`, `audienceScore=30`, `criticScore=28`.

```
reach01 = 40/(40+10) = 0.80
audGain = clamp((30-40)/25, 0, 1.2) = 0
fcMult  = clamp(1+0.3·(40/70.8-1), 0.85, 1.15) = clamp(0.869, 0.85, 1.15) = 0.869
          (misses badly in plain-language terms, but does NOT cross the 0.85 reason-
           code floor — see note below)
room    = ((100-45)/100)^1.6 = 0.3843
gain    = 9·1.0·0.80·0·0.869·0.3843 = 0
loss    = 16·1.0·0.80·clamp((45-30)/45,0,1)·(45/100)^1.5
        = 16·0.80·0.3333·0.3019 = 1.29
Δfame   = clamp(0-1.29,-4,+10) = -1.3  →  fame 45 → 43.7
```

Placeholder: `ΔMomentum = clamp(20·(40/70.8-1),-25,25) = 20·(-0.435) = -8.7` (the reboot
attempt fails to establish positive Momentum on the new branch — it opens already
negative); `ΔFatigue` on the *new* branch starts from a partial-reset baseline (say 50%
of the old branch's peak, per direction H's "partial reset," not modeled numerically
here) plus `10·(1-0.30)=7.0` from this result — i.e. the new branch is already
accumulating Fatigue quickly after one bad entry, while the underlying StoryProperty's
Recognition itself is barely touched (matches 04a/04b's "Recognition survives, branches
end," direction P: never permanently unusable).

**Open boundary-condition note (flagged, not a P17 concern to fix):** in this case
`fcMult=0.869` sits *above* the 0.85 `missedCommercialExpectations` reason-code
threshold even though the film plainly bombed — the reason-code granularity is a P14
display concern independent of P17, but the report should note that "clear miss, no
reason code" cases will happen and a UI reading `reasonCodes` alone would under-report
franchise misses; P17's own Momentum/Fatigue reaction (both clearly negative here) is
the more reliable signal for franchise-level narrative than watching for that specific
fame reason code.

---

## 8. Ownership summary

| Element | Formula owner | Value/input owner |
|---|---|---|
| `preMarketingAwarenessOf` / `appealReach` (Seam A) | P07 | P17 |
| Marketing capacity / legs (consumes Seam A automatically) | P07 | — (no separate P17 input) |
| Greenlight forecast `expectedTotal`/`expectedOpening` (Seam B) | P11 | P17 |
| `expectedCriticScore` | P07/P11 | untouched — no P17 input, ever |
| `computeStarPowerDelta` (fame) | P14 | — (reads the P11-locked value; no P17 input) |
| Newspaper `boxDelta`/`criticDelta`, broadcast band comparison | P07 (media surface, DESIGN INFERENCE placement) | — (reads the same locked value) |
| Standing `audienceAwareness` | P08 | — (reacts to realized reach, no direct P17 input) |
| Forecast confidence band width (§3) | P11 | P17 (bounded, numeric-only; no enum widening) |
| Franchise Recognition / Momentum / Fatigue update | **P17 exclusive** | P17 |
| Market crowding / `competitionFactor` | P15 (DO NOT TOUCH) | — |
| Rival parity for Seams A/B | Automatic via `chooseIndustryPackage`/`ReceptionInputs` | P12 consumes; P17 supplies the same value for rival-owned properties |
| P11/P14 consumption in general | P11 (forecast lock), P14 (fame reaction) | Both are pure **consumers** of P17's two scalars — neither computes franchise state |

---

## 9. Exploits and accepted risks considered

1. **"Farm inherited awareness for a cheap opening, accept the fame/Momentum hit."**
   Explicitly allowed by directions E/G ("bad bets allowed," "flops may receive
   continuations if rights are controlled") — not a bug. Seam A only lowers marketing
   cost-efficiency, it does not buy gross outright (`efficientMarketingCapacity` is
   concave in `pma`), so the exploitable value is bounded and self-limiting.
2. **Double-dipping through Standing.** Ruled out in §5 — Standing reacts to realized
   `reach01`, which was already shaped once upstream by Seam A; no fourth
   `StandingChangeSource` is added (would retro-touch V1-V13 saves, `02-...md:d.1`).
3. **A parallel franchise-scaled fame-loss multiplier.** Explicitly rejected in §2 — the
   existing `loss` formula is already talent-fame-scaled; adding a second,
   property-scaled multiplier would be a genuine double-count of "famous → bigger
   downside" and is not authorized by direction R.
4. **Widening `ForecastFactorKey` for band-narrowing display.** Rejected for v1 in §3
   as an unnecessary schema-versioning cost; the numeric-only narrowing achieves the
   H-T 2009 effect without it.
5. **Reward for "wait one year" or any cooldown.** Not modeled anywhere in Seams A/B —
   both are continuous functions of `recognition01`/`momentum01`, matching direction D's
   explicit rejection of a hard cooldown.

## 10. Open questions (genuine, for the Owner / report writer)

1. Should the greenlight-card `+X%`/`+Y%` numbers (§6) be shown as exact percentages or
   banded (e.g. "modest / strong / exceptional" inherited awareness) — exact numbers
   are more legible but invite min-maxing the underlying R/M state once players reverse
   the formula; banding matches the FM/CK3 "adjective band" idiom favored in
   `03e-...md §12`.
2. Whether to ever pursue the enum-widened, player-visible "known franchise" forecast
   chip (§3) is a genuine P11-scoped schema decision, not something this model should
   resolve — flagged, not answered.
3. `expectationMult`'s cap (1.6×) and `inheritedAwareness01`'s cap (0.35) are both
   unvalidated starting points; they should be tuned against actual P07 forecast
   variance once a reference set of continuation greenlights exists, not asserted here
   as final.
4. This model does not specify the full Recognition/Momentum/Fatigue accrual formulas
   themselves (explicitly out of scope — "use a placeholder RMF rule and say so," per
   the brief) — it only specifies where the two locked scalars (Seams A/B) come from
   and where the one P17-owned R/M/F *read* of `FilmResult` goes. The core R/M/F model
   is a separate deliverable this model assumes as a black box.
