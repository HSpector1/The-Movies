# P15 Deliverable §3 — Shared-Market Release-Window Analysis

**Status:** DOCUMENTATION ONLY — read-only research analysis. No production authorization.
**Scope:** tests the Owner-selected ≈4-week primary release-window abstraction (Direction A,
2026-09-11) against four alternatives, on the six criteria named in the task, and proposes one
bounded PROVISIONAL model. This section does **not** reopen Power Ranking (P15A.2), corporate
fate (P15B), M&A (I), or the finale (J/K) — those are owned elsewhere in this package and are
referenced only where the window design must stay compatible with them.

---

## 1. What is already settled, and what this section is allowed to test

Owner Direction A settles genre + release-window competition as the shared-market law, with a
"working primary window ≈ FOUR WEEKS (exact window/curve is open tuning)." P15-PACKAGE §23's
"market formula" row and §24 Open Question 1 ("same week, four weeks, quarter, or a run-overlap
interval?") are therefore **SUPERSEDED BY OWNER DIRECTION** as an open choice among window
*families* (screens/physical exhibition remain excluded, unchanged) — but the exact window
*value* and *curve shape* are explicitly still open, which is exactly this section's mandate. I
do not reopen "genre + window" as the formula family, and I do not reopen the frozen same-week
batch/self-exclusion mechanism in P15-PACKAGE §12.1 (Builder Annex §C.1/D.2.1/D.3) — I reuse it
as given.

This section's job: is ~4 weeks a *sensible abstraction*, or is a different simple window
*materially* better, judged on legibility, strategic planning, schedule flexibility, era
differences, computational cost, and exploitability — with concrete, reproducible arithmetic.

---

## 2. Code ground truth used for the arithmetic

All facts below are read from the accepted 592e926 snapshot at
`<scratchpad>/accepted-592e926/`,
cross-checked against the phase1-verify `_DIGEST.md` corrections.

| Fact | Value | Source |
|---|---|---|
| Tick length | 1 tick = 1 week (`TICKS_PER_YEAR: 52`) | `src/core/tuning.ts:56` |
| Production duration | 8 weeks (`PRODUCTION_TICKS: 8`) | `src/core/tuning.ts:57` |
| Theatrical run length | 6 weeks, fixed for every era (`THEATRICAL_WEEKS: 6`) | `src/core/tuning.ts:414` |
| Original screenplay draft time | 3–6 weeks (`SCRIPT_DRAFT_WEEKS_BASE`/`_MIN`/`_MAX`) | `src/core/tuning.ts:859-861` |
| Rival concurrency cap | greenlight only when the rival has **zero** productions in flight; commission at most **2** active screenplays | `src/core/hollywoodTick.ts:109-110,146,176`; digest-confirmed |
| Rival decision cadence | re-evaluate every 1 week (`HOLLYWOOD_DECISION_WEEKS: 1`) | `src/core/tuning.ts:27` |
| Genre taxonomy | 6 values: comedy, drama, crime, romance, horror, adventure | `src/core/types.ts:9` |
| Chart/rank recompute cadence | every 13 weeks (`week%13===0`) | `src/core/hollywoodTick.ts:306` |
| Rival roster | 9 authored rivals + player = 10 studios, arrivals at weeks 0,0,0,0,520,988,1560,1872,2548 | `src/core/calendar.ts:3`, `hollywoodStartingData.ts`; digest-confirmed |
| Rival genre-affinity policy | per-genre weight = 5 if the genre is one of the rival's authored `anchors`, else 1; concept genre is a weighted random draw | `src/core/hollywoodTick.ts:160-161`, `hollywoodStartingData.ts:8-35` |
| `competitionFactor` | inert constant ≡ 1.0; `competingSlate` always `[]` | `src/core/reception.ts:596,679`; `src/core/worldgen.ts:645`; digest-confirmed still true |
| Prima retail evidence | "Genre interest is ruled by two factors: time and saturation" (p.58); "the more movies all studios, including yours, release in a genre, the more tired… genre interest plummets" (p.58); **no window/curve recovered**; rivals capped "10 in five years" (p.82, MEDIUM-HIGH) | `out/phase1/orig-rivals.md:29-31,47`; digest-confirmed page numbers |

Two structural facts matter most for this section: (1) the game already has an **inert but
correctly-shaped placeholder** — `CompetingRelease = { marketPressure: number }` (0..1) on
`MarketState.competingSlate` (`src/core/types.ts:274-281`) — showing a bounded-pressure shape was
already anticipated; P15A may replace or repurpose it, that is a builder call, not a P15 research
finding. (2) A rival's *structural* release ceiling (pipeline: draft 3–6 wks + production 8 wks,
perfectly overlapped) is roughly one film per 11–14 weeks (~3.7–4.7/yr) if never idle and never
cash-constrained, which is **faster** than Prima's historical "10 in five years" (2/yr) cap —
Prima's number is a *tuned outcome*, not a hard code limit. I use Prima's 2/yr as the
illustrative baseline below because it is the only sourced release-rate figure, and flag the
faster structural ceiling as a legitimate upside risk the Owner-tuning stage should watch.

---

## 3. Release-density arithmetic: how often does a 4-week window actually fire?

**Assumptions (PROVISIONAL, stated so the reader can substitute their own):**
- 9 rivals, each releasing **2 films/year** (Prima p.82 cap, used as the illustrative rate — not
  a code constant); genre chosen by the *actual authored* affinity weights in
  `hollywoodStartingData.ts`, not an assumed-uniform distribution.
- Player excluded from these rates (this section asks "how often does a *rival* release land in
  my window," which is what the player experiences as competitive pressure).

The nine rivals' authored anchors are **not** evenly spread across the six genres:

| Genre | Anchor rivals (weight 5 each) | Non-anchor rivals (weight 1 each) | Expected rival releases/yr |
|---|---|---|---|
| romance | Rose Lantern, Silver Current, Marigold (3) | remaining 6 | **4.08** |
| horror | Night Orchard, Blackthorn, Copper Kite (3) | remaining 6 | **3.86** |
| comedy | Bellwether, Copper Kite, Bright Meridian (3, two double-anchored) | remaining 6 | **3.63** |
| adventure | Trailhead, Bright Meridian (2, one double-anchored) | remaining 7 | **3.06** |
| drama | none | all 9 | **1.68** |
| crime | none | all 9 | **1.68** |

(Arithmetic: for a single-anchor rival, P(genre=anchor)=5/10=50%, P(other)=10% each; for the two
double-anchor rivals, weight sum=14, P(each anchor)=5/14≈35.7%, P(other)=1/14≈7.1%. Sum over all
9 rivals × 2 films/yr. Row sum ≈ 18.0 = 9×2, confirming the split is conservative.)

**This is itself a finding worth naming**: the authored roster gives drama and crimeonly ~40% of
romance's release rate. *Any* flat window size will feel almost dormant in drama/crime and
comparatively busy in romance/horror/comedy. That is a legibility fact about the current P12
roster, not a defect in the window formula — but it means "does the 4-week window feel alive"
will vary by genre from day one, and the Owner-tuning pass should expect that, not read it as a
formula bug.

Converting annual rate to a per-window hit probability (Poisson, `P(≥1) = 1 − e^(−rate×weeks/52)`), for the mean genre (18 films / 6 genres / 52 weeks = 0.0577/wk), the busiest genre (romance,
0.0785/wk) and the quietest (drama/crime, 0.0324/wk):

| Window | Mean-genre P(≥1 rival same-genre release in window) | Busiest (romance) | Quietest (drama/crime) |
|---|---|---|---|
| same week (1 wk) | 5.6% | 7.6% | 3.2% |
| 2 weeks | 10.9% | 14.5% | 6.4% |
| **4 weeks (Owner value)** | **20.6%** | **27.0%** | **12.2%** |
| 8 weeks | 37.0% | 46.7% | 22.9% |
| 6-week run-overlap | 29.3% | 37.4% | 18.2% |

**Reading this table:** same-week is rare enough (3–8%) that most releases would never see the
mechanic — it would read as "usually nothing happens," undermining the "strategic planning"
purpose (a rule a player almost never encounters cannot become a planning habit). 8 weeks is
common enough (23–47%, nearly half of all romance releases) that pressure risks becoming
*ambient* rather than a signal — if it is "on" for close to half of all releases in the busiest
genres, the INFO-tier "pressure direction changed" notice (§21) stops reading as informative and
starts reading as decoration, which the package's own attention law is trying to avoid ("Routine
pressure decay… produce no notifications" — but a near-50% base rate makes "routine" the norm,
not the exception). 4 weeks sits in a legible middle (12–27%): common enough to matter and to
teach the player to check the Shared Market before committing a release date, rare enough that
when it fires, it is informative. This is consistent with, not merely asserted from, the Owner's
choice — the arithmetic supports ≈4 weeks as a *sensible* abstraction rather than an arbitrary
round number.

---

## 4. Five-way comparison on the six named criteria

| Criterion | Same week | 2 weeks | **4 weeks** | 8 weeks | 6-wk run-overlap |
|---|---|---|---|---|---|
| **Legibility** | Trivially explainable ("same week") but almost never true (3–8%) — reads as absent | Explainable, still rare (6–15%) — no natural real-world analog to anchor player intuition on | Explainable and matches common moviegoer intuition ("no other big genre release this month"); fires often enough to register (12–27%) | Explainable but fires so often in busy genres (up to 47%) that it stops discriminating | Explainable ("still playing"), ties to a real in-fiction fact (a run is literally active), 18–37% |
| **Strategic planning** | Too rare to build a habit around; encourages ignoring the feature | Marginal improvement, still thin | Genuine, recurring scheduling decision — "do I wait 3 weeks for daylight?" | Nearly-always-relevant; risks feeling like a tax on every release rather than a choice | Genuine and intuitive, but tied to run length the player does not directly set |
| **Schedule flexibility** | Player only needs to avoid one exact week — cheap to route around, low friction | Still cheap to route around (2-week detour) | Meaningful detour (a month) forces real tradeoffs against a production's own 8–14-week lead time | A 2-month detour can collide with the rival's *own* unpredictable schedule, reducing player agency (dodging becomes guesswork) | Coupled to the *other* film's run, which the player cannot always observe reliably before commit |
| **Era differences** | No support either way — flat regardless of era | No support either way | No support either way (flat, and Owner explicitly left the window "open tuning" rather than era-scaled) | No support either way | **Silently inherits era assumptions**: `THEATRICAL_WEEKS: 6` is one flat constant for 1920 and 2040 alike (`tuning.ts:414`); using run-overlap as the *window definition* would make P15's formula drift automatically whenever P07/P13 ever vary run length by era — coupling P15's own versioned definition to a constant P15 does not own |
| **Computational cost** | Cheapest possible (narrowest live-exposure set) | Cheap | Still O(active exposures + due events); no different asymptotically from 2 or 8 weeks — see §5 | Same asymptotic cost as 4 weeks, but a *larger* live-exposure set per batch (roughly 2× the standing population) | Comparable to 4–8 weeks; no asymptotic difference, but adds a second source of truth (P07's run-length constant) that must be read every batch instead of one self-contained versioned field |
| **Exploitability** | High: trivial to dodge by moving one week; also lowest signal, so dodging barely matters | High: still a shallow, cheap detour | Moderate: a full month is a real cost to move, and (with tapering — §6) there is no single "safe day" that fully resets exposure | Low-dodge-value paradoxically *because* it's almost always on — dodging becomes near-impossible, which converts "strategic planning" into "unavoidable tax," a different kind of design problem | Moderate, but adds a **cliff-timing** exploit specific to it: releasing one day after a rival's run legally *ends* zeroes out contact even though real audiences don't forget a film that fast |

**Verdict on the comparison:** ~4 weeks is not an arbitrary round number picked for its own sake —
it is the shortest window in this set that clears the "occurs often enough to be a real, felt
strategic constraint" bar (§3) without crossing into "occurs so often it is ambient background
noise" (which 8 weeks risks in the busier genres) or "reads as unrelated to real film scheduling"
(same week/2 weeks). Run-overlap is conceptually attractive (it maps to something literally true
in the fiction — a rival's film is still physically playing) but it fails the **era-differences**
and **computational self-containment** criteria specifically because `THEATRICAL_WEEKS` is a flat
P07 constant today, and the task explicitly asked this section to flag that fact. None of the five
alternatives is disqualifying enough to overturn the Owner's choice; the finding is **confirm 4
weeks, refine the internal shape** (§6).

---

## 5. Computational cost, worked against the hostile fixture

P15-PACKAGE §19 and Builder Annex §L.3 require the design to survive the **hostile fixture**: 64
studios, 4,000 simultaneously public/active release records, a same-week batch of 512 releases
with dense genre overlap, across 6,240 weeks, with cost `O(active exposures + due events)` and
**no pairwise film scan**.

Applying the frozen-batch/self-exclusion law from §12.1 (reused unchanged, not redesigned) to a
window-based formula:

1. **Build bounded genre/window aggregates once per batch.** With only 6 genre keys (well under
   the Annex D.2.1 cap of 64 aggregate rows), one pass over the ≤4,000 active exposures sums each
   exposure's current temporal-lane weight into its genre bucket: **O(4,000)**.
2. **Fold in the freezing batch.** One pass over the 512 batch members adds their entering
   contribution to the same 6 buckets before any assessment reads them: **O(512)**.
3. **Assess each subject.** For each of the 512 releases, self-exclusion is "genre aggregate minus
   this subject's own contribution" — **O(1)** per subject, **O(512)** total. No subject is
   compared against any other subject individually; nothing is `O(batch²)`.
4. **Persist.** Per Annex D.2.1/D.3, the batch stores one chunked member manifest (chunks ≤100
   rows) and each assessment keeps only its batch/aggregate digest, self-contribution, counts, and
   ≤5 reason facts — **O(batch members + contributors)**, not a copy of "all other releases" per
   assessment.

Total per-batch cost ≈ **O(4,000 + 512) ≈ 4,500 operations**, independent of which of the five
window sizes is chosen — window length changes *which* exposures are still active (i.e., how large
the 4,000-record active set typically runs), not the asymptotic shape of the algorithm. An 8-week
window keeps roughly twice as many exposures "live" at any moment as a 4-week window (since decay
removes them later), so it costs more in practice (a larger constant on the same O(active
exposures) term) without changing complexity class — this is a real but secondary cost argument
for preferring the narrower window, not the deciding one.

The **saturation-stock** lane proposed in §6 adds one more O(genres)=O(6) weekly decay pass and
folds in the same O(512) batch contributions — negligible, and independently satisfies the same
no-pairwise-scan law (§L.4) because it is a running scalar per genre, never a per-film history
scan.

Over the full 6,240-week hostile run, worst case ≈ 6,240 × 4,500 ≈ 28M operations total for the
temporal lane — trivial for a modern client/server and far below the concern threshold; the
binding constraint is the *asymptotic shape* (no quadratic term), which every window size in this
comparison satisfies identically. **Computational cost does not discriminate between window
sizes** — it discriminates between "aggregate-then-subtract" (used here) and "pairwise scan"
(forbidden), and all five candidates in §4 can be implemented the same aggregate-then-subtract
way. This closes Open Question 1's cost dimension without needing a code build: the choice among
1/2/4/6/8 weeks is a legibility and design decision, not a performance one.

---

## 6. Exploitability: four named vectors

| Vector | Risk under a **hard-cliff** window | Mitigation already implied by §12.1/Annex | Residual risk under the **recommended tapered** shape (§7) |
|---|---|---|---|
| **Release-date dodging** | None — this is the *intended* mechanic (choosing a less-crowded date is the strategic decision the Owner asked this system to create) | n/a — not an exploit | Softened, not eliminated: a release 1 day past the window boundary still carries partial residual weight under tapering, so there is no single "magic day" that fully resets exposure to zero; genuine spacing is still rewarded, it just cannot buy a discontinuous full discount |
| **Announce-and-cancel** | A studio could announce a release to spook a rival into moving date, then cancel for free, wasting the rival's tempo | Already closed by state law: pressure exists only from **batch-frozen** (actually-released) exposures, never from `known-preview` (Annex C.1: "no assessment or phantom pressure for an unreleased film"; fixture `market-cancel-before-release`) — a cancelled film never created a market fact to begin with | The **preview** (non-authoritative "2 known releases within 4 weeks" UI count) still updates live off `known-preview` state, so a player can still be *bluffed* by an announcement before it cancels — this is legitimate meta-strategy (real film studios do this), not a mechanical exploit, because it never touches a formula input or a persisted fact |
| **Spamming cheap films to poison a genre** | If contribution is a flat "1 unit per film," a studio can queue several minimally-produced films into a rival's window purely to inflate the shared aggregate against that rival, at near-zero cost | Two structural throttles already exist: (a) the rival production pipeline (§2: 1 production in flight + ≤2 screenplays) mechanically caps *rival* output; (b) binding laws 8/9 (no player-only penalty, no hidden subsidy) forbid a player-only anti-spam gate — so any fix must apply to every studio equally | **Recommend resolving Open Question 2 (exposure basis) as "contribution scaled by disclosed public reach/opening-exposure, not a flat per-film count."** A studio can still release several cheap films in a window, but a barely-marketed quickie should sit near the `contributionBounds` floor (already a named field in Annex D.1), so spamming genuinely low-reach product buys little pressure — a spam strategy that actually wants to hurt a rival has to spend real marketing/production capital to do it, which is a fair economic cost, not a free exploit. **This is a recommendation for a still-open Owner decision (OQ2), not a resolved rule.** |
| **Splitting a release around the boundary** | Choosing a release date at exactly `rivalWeek + windowSize + 1` grants full, discontinuous immunity despite being nearly simultaneous in practice | The immutable `inputSnapshot` per assessment (Annex D.3: "prevents later decay or retitling from rewriting the released film's explanation") already forbids *retroactive* boundary gaming — you cannot change an already-committed assessment by moving a later release | Tapering (§7) removes the *discontinuity* itself: a release just past the nominal 4-week envelope still carries a small residual weight rather than a hard zero, so there is no exact day that flips from "full pressure" to "none." The player can still legitimately reduce pressure by spacing further out — that remains the intended lever, just without a bright-line cliff to game |

No vector requires reopening §12.1's frozen same-week batch/self-exclusion mechanism; all four are
addressed either by state-machine facts already in the Annex or by shaping the decay curve and
contribution formula, which are exactly the two things Direction A left as "open tuning."

---

## 7. Recommended model (PROVISIONAL parameters — illustrative, not final tuning)

**Adopts:** genre + governed release-window pressure (Owner-settled, Direction A); the frozen
same-week batch and explicit self-exclusion law of §12.1 (reused verbatim); a window value of
**4 weeks** as the primary temporal-overlap envelope (Owner-selected value, confirmed by §3–§4);
`SharedMarketDefinition.exposureWindowWeeks` and `.decaySchedule` as the versioned fields already
specified in Builder Annex §D.1 (no new entity types invented); a bounded, separately-versioned
genre-saturation stock, distinct from the temporal-overlap lane, as the task's "shape" guidance
requested ("strongest pressure near release → weaker residual → decay… bounded genre-saturation
stock separate from temporal-overlap pressure").

**Rejects:** same week, 2 weeks, and 8 weeks as the primary window (too rare or too ambient — §4);
run-overlap as the window *definition* (couples P15's versioned formula to a P07 constant P15
does not own, and silently mis-models era differences — §4); a hard-cliff (flat, non-tapered)
window shape (creates the boundary-dodge exploit named in §6); a single blended pressure number
that mixes "did a same-genre film just open" with "has this genre been oversaturated for months"
(conflates two different real phenomena Prima itself treats as related-but-distinct — "time and
saturation" are named as two factors, p.58 — and would make the reasonFacts harder to explain
under Annex F.3's "what changed / over what window / which films" acceptance test).

### 7.1 Temporal-overlap lane (primary — this is "the 4-week window")

| Field | PROVISIONAL value | Note |
|---|---|---|
| `exposureWindowWeeks` | 4 | Owner-selected primary value |
| `decaySchedule` (3 bounded ordered stages inside the window) | peak `[R, R+1)` weight **1.00**; cooling `[R+1, R+3)` weight **0.55**; residual `[R+3, R+4)` weight **0.20** | half-open week boundaries relative to release week `R`, matching Annex C.1's "exact half-open dates and no duplicate decay" |
| Post-window | archived (removed from active-exposure index) at `R+4` | matches C.1 `exposure-decaying → archived` |
| `contributionBounds` | `[0.05, 1.00]`, scaled by disclosed public reach/opening-exposure band | **recommendation for still-open OQ2**, not a resolved rule — closes the spam vector (§6) |
| `genreOrSegmentKeys` | the 6 existing `Genre` values | reuses current taxonomy; era-stability (OQ5) stays open, not addressed here |

### 7.2 Genre-saturation stock (secondary — separate lane, separate version)

| Field | PROVISIONAL value | Note |
|---|---|---|
| `saturationStockWindowWeeks` | 26 | deliberately **not** 13 (the chart/rank cadence) or 52 (a Power-Ranking-adjacent number) — chosen to avoid any accidental coupling to the separately-owned P15A.2 ranking system; "roughly two quarters" is long enough to capture Prima's "a rival churns out a series in that genre" phrasing without becoming unbounded |
| Accumulation | +contribution (same bounded value as §7.1) per real (batch-frozen) release in-genre | reuses one contribution number for both lanes rather than inventing a second input |
| Decay | simple exponential toward 0, half-life ≈13 weeks, clamped `[0,100]` | bounded stock, never an unbounded running sum |
| Reason label | separate typed reason code from the temporal lane | keeps the two phenomena — "a rival just opened here" vs. "this genre has been busy for months" — independently explainable per Annex F.3 |

Both lanes reuse the **same** frozen-batch machinery (§12.1) and the **same** aggregate-once/
subtract-self pattern (§5); they differ only in window length and decay shape, so implementing
both costs one extra O(genres) pass per batch, not a second algorithm.

---

## 8. Explanation grammar for the player

| Lane | State | Template |
|---|---|---|
| Temporal (4-wk) | none | *"Comedy pressure: none — no known releases in the last 4 weeks"* |
| Temporal | rising | *"Comedy pressure: rising — 2 known releases within 4 weeks"* (task's own example, unchanged) |
| Temporal | steady | *"Comedy pressure: steady — 1 known release within 4 weeks"* |
| Temporal | recovering | *"Comedy pressure: recovering — clears in 2 weeks"* |
| Saturation (26-wk stock) | building | *"Comedy fatigue: building — 4 comedies released in the past 26 weeks"* |
| Saturation | elevated | *"Comedy fatigue: elevated — 7 comedies released in the past 26 weeks"* |
| Saturation | easing | *"Comedy fatigue: easing — down from a recent high"* |

Each string names window length and known-release count (Annex F.3 questions 1–2), and the source
film/studio identities are the up-to-5 `reasonFacts` behind it (question 3); formula/version label
and next-decay date are separate, always-visible fields (questions 4–5), consistent with §20's
accessibility law (word-based direction, not color-only).

---

## 9. How announced-but-cancelled releases unwind

Mapped directly to the existing C.1 state table — no new state is proposed:

1. A rival's disclosed future release exists only as `known-preview` until its actual release
   week. The player-facing "2 known releases within 4 weeks" count is a **live derived read** of
   current `known-preview` + `batch-frozen` facts — it is not itself a persisted market fact.
2. If the rival cancels, P12 emits a cancellation/disclosure-change event; P15 transitions that
   preview to `removed/refreshed preview`. **No P15 historical event, exposure, or assessment is
   created or deleted**, because none was ever created for an unreleased film (C.1; fixture
   `market-cancel-before-release`).
3. The next time any player reads the Shared Market view, the derived count simply reflects the
   smaller current set — no rewrite is needed because nothing was written.
4. If a **different** film already had its own assessment **committed** before the cancellation
   (i.e., it released and froze its batch first), that assessment's immutable `inputSnapshot`
   already excluded the cancelled film correctly at the time, or already correctly included the
   *other* film's exposure if it was real — either way that record is never revisited (Annex D.3:
   "prevents later decay or retitling from rewriting the released film's explanation").
5. A **delay** (not a cancellation) works the same way in reverse: it changes the preview's
   projected week; no historical assessment is mutated before the film actually releases (C.1;
   fixture `market-delay-across-window`).

Net effect: cancellation/delay unwinding requires no special-case code beyond what §12.1 and
Annex C.1 already specify. This section's only addition is confirming that a *live preview count*
sitting in front of the frozen-batch law is safe to build without inventing a new persisted root.

---

## 10. Package ownership and what remains Owner tuning

| Item | Owns |
|---|---|
| Frozen same-week batch, self-exclusion law | **P15A** (existing §12.1 — reused unchanged) |
| `exposureWindowWeeks = 4`, temporal decaySchedule shape/weights | **P15A** (this section's recommendation; values PROVISIONAL) |
| Genre-saturation stock as a second, separately-versioned lane | **P15A** (new sub-definition; not a new package) |
| `contributionBounds` scaled by public reach (resolution of OQ2) | **P15A**, but remains an **open Owner decision** until ruled — this section recommends, does not resolve, it |
| Genre/segment taxonomy stability across eras (OQ5) | **P13** boundary question; untouched here |
| Era-conditioned window/run-length (flagged in §4) | **not in scope for P15A.1**; a legitimate future refinement co-owned by **P13** (era facts) and **P15**, not required to ship the bounded checkpoint |
| Power Ranking cadence/lanes (13-wk chart, 52-wk trailing window) | **P15A.2** — explicitly not touched by this section; the 26-week saturation-stock value was deliberately chosen to avoid numeric coincidence with either the 13-week chart cadence or a future 52-week ranking window |
| Player/rival genre-affinity realism (drama/crime under-represented in the current 9-rival roster) | **P12** (roster authoring) — named as a legibility fact for Owner awareness, not a request to change P12's authored anchors |

### Remaining genuine Owner decisions surfaced by this section

1. Confirm (or revise) **`exposureWindowWeeks = 4`** as the shipped value — this section's
   arithmetic supports it as sensible but the exact number is still, by Direction A's own words,
   "open tuning."
2. Approve, revise, or reject the **3-stage taper** (1.00 / 0.55 / 0.20) versus a different curve
   shape (e.g., continuous exponential decay) — both satisfy "bounded ordered stages" (Annex D.1)
   equally well; this section picked the simplest illustrative version.
3. Rule on **Open Question 2** (exposure basis: reach-scaled vs. flat-per-film vs. announced
   intent) — this section recommends reach-scaled specifically to close the spam vector (§6), but
   OQ2 remains formally open per RULINGS §4.3.
4. Approve or revise the **saturation-stock window (26 weeks)** and its **half-life (~13 weeks)** —
   both PROVISIONAL, chosen only to be long-but-bounded and deliberately decoupled from ranking
   cadences.
5. Confirm the **era-window question is out of scope for P15A.1** (this section's recommendation)
   rather than something the bounded checkpoint must solve.

---

## 11. Structural problems with the selected direction

**None found that would justify reopening ~4 weeks as the primary window.** The arithmetic in §3–
§4 supports it; the computational analysis in §5 shows the choice is cost-neutral versus the
alternatives; the exploit analysis in §6 shows every named vector is addressed by shape/formula
choices that Direction A already left open, not by a different window size. The one genuine
refinement this section surfaces — a hard-cliff window creates a boundary-dodge exploit and an
"always-on" ambient-pressure risk at 8 weeks — has the smallest possible correction available:
**taper the decay curve inside the existing window rather than changing the window's length**,
which is already anticipated by Annex D.1's `decaySchedule: ordered deterministic stages` field
and requires no new entity, package, or Owner boundary change.

---

## 12. Disposition of prior P15 claims touched by this section

| Claim | Prior label | This section's disposition |
|---|---|---|
| P15-PACKAGE §24 OQ1 ("same week, four weeks, quarter, run-overlap?") | OPEN QUESTION | **SUPERSEDED BY OWNER DIRECTION** for the window *family* choice (Owner picked ~4 wk); the exact value/curve remains genuinely open, and this section answers it with PROVISIONAL, Owner-revisable numbers |
| P15-PACKAGE §23 "market formula" row (genre + governed window, screens excluded) | PRELIMINARY RECOMMENDATION | **CONFIRMED** by Direction A and by this section's independent arithmetic |
| Annex D.1 `exposureWindowWeeks`: "positive bounded integer" | Conceptual entity | **CONFIRMED**, value now proposed at 4 (PROVISIONAL) |
| Prior-claims register A5 (batch vs. window reconciliation) | QUALIFIED | **CONFIRMED as reconciled**: batch = commit boundary (frozen at the releasing film's own week), window = how long that release's *exposure* stays weighted afterward; §7.1 makes this explicit — a batch can contain releases whose *windows* do not otherwise overlap at all |
| Prior-claims register A7/A9/A13 (Owner selected ~4 wk, OQ1 superseded, window is a versioned parameter) | CONFIRMED | **CONFIRMED**, unchanged by this section |
| Prior-claims register A17 (endurance fixtures should add a shrinking-cohort case because Direction G removes the entrant floor) | QUALIFIED | **CONFIRMED as a real but small point**: a shrinking studio count only *reduces* the active-exposure set the §5 algorithm scans, so it cannot create a new performance risk; it is worth one extra endurance fixture (`market-shrinking-cohort`) for completeness, not a design change to the window itself |

No claim in this section's scope required a CORRECTED disposition (i.e., no prior claim was found
to be substantively wrong once respected against the digest) — everything in Section A of the
prior-claims register that touches window/formula/cost was already accurate; this section's
contribution is the concrete arithmetic, the tapered-curve refinement, and the explicit
computational-cost worked example the prior register called for but did not compute.
