# BREAK-IT verification — market-window.md

**Lens:** adversarial game designer + economist. **Verdict: VERIFIED_WITH_CAVEATS.**

The analysis (`out/phase2/market-window.md`) is well-grounded: its code citations
(tuning.ts, hollywoodTick.ts, types.ts, reception.ts, worldgen.ts, calendar.ts,
hollywoodStartingData.ts) and its authority citations (P15-PACKAGE §12.1/§19/§23/§24;
Builder Annex C.1/D.1/D.2.1/D.3/F.3/L.3/L.4; binding laws 8/9) were independently
re-read at the cited locations and all check out verbatim or in substance. The core
4-week row of the Poisson table recomputes exactly, and the release-density table's
row sum (≈18.0) is internally consistent. It correctly declines to redesign the
frozen same-week batch/self-exclusion law and correctly reuses it. Its recommendation
(confirm ≈4 weeks, taper the decay curve, add a separate bounded saturation stock)
survives every attack below — but five problems need the smallest fixes named.

## Problems

### 1. Arithmetic error in the 6-week run-overlap Poisson row (recompute finding)
**Claim:** §4's comparison table (via the §3 Poisson table) states, for the 6-week
theatrical-run-overlap window: busiest (romance) = 37.4%, quietest (drama/crime) =
18.2%.
**Why wrong:** Recomputing `P(≥1) = 1 − e^(−rate×6)` from the analysis's own stated
per-week rates (busiest 0.0785714/wk, quietest 0.0324176/wk — both of which I
independently re-derived from the anchor-weight table and they check out):
- busiest: 1 − e^(−0.0785714×6) = 1 − e^(−0.4714286) = 1 − 0.624111 = **0.375889 → 37.6%**, not 37.4%.
- quietest: 1 − e^(−0.0324176×6) = 1 − e^(−0.1945056) = 1 − 0.823246 = **0.176754 → 17.7%**, not 18.2% (this one is off by 0.5 percentage points, the largest deviation found).
**Corrected statement:** the 6-week run-overlap column should read busiest ≈37.6%,
quietest ≈17.7%. This does not change the qualitative verdict (run-overlap still
sits in a comparable band to 8 weeks and is rejected on era/self-containment grounds,
not on this number), but a paper-scenario table that will be cited elsewhere in the
deliverable should carry correct figures.
**Smallest fix:** recompute that one column with a calculator/spreadsheet before
downstream sections (e.g., consolidation.md, if it reuses this table) cite it.

### 2. Smaller rounding slips (recompute finding, immaterial)
Independently recomputing all 15 cells of the §3 Poisson table, two more show ~0.1pp
drift: 2-week quietest (stated 6.4%, recomputes to 6.3%) and 8-week quietest (stated
22.9%, recomputes to 22.8%). Separately, in the §3 release-density table, romance
(exact value 4.0857) and drama/crime (exact value 1.6857) are stated as 4.08 and 1.68
— both are truncations; standard rounding gives 4.09 and 1.69. None of this affects
any conclusion (magnitudes are trivial), but since the task explicitly asked to
recompute rows and report *any* error, they are logged here. **Smallest fix:** none
required beyond awareness; if the table is regenerated, use consistent rounding.

### 3. §2's rival "structural release ceiling" likely understates true throughput
**Claim:** §2 states a rival's structural ceiling is "roughly one film per 11–14
weeks (~3.7–4.7/yr)" from "draft 3–6 wks + production 8 wks, perfectly overlapped."
**Why likely wrong:** Tracing the actual cap in code: `b.activeScriptOrdinals`
(hollywoodTick.ts:39,46) is filtered only by `status!=='produced'`, and
scriptDevelopment.ts's status machine is `drafting → review → ready → inProduction →
produced` (scriptDevelopment.ts:326,487,561,588,626) — so a script already linked to
a production (`inProduction`) still occupies one of the two script slots. That is
exactly why the cap is **two**, not one: while film A is shooting (8 weeks), the
rival's second slot is free to draft film B (3–6 weeks, always < 8), so B is already
`ready` and waiting the moment A's `remainingTicks` hits 0. `decide()` runs before
`advanceManagedProductions()` each week (hollywoodTick.ts's `advanceHollywoodWeek`),
so the earliest a new greenlight can fire is the week *after* A completes — giving a
true steady-state cadence of **≈ PRODUCTION_TICKS + 1 ≈ 9 weeks/film (~5.8/yr)**, not
11–14 weeks (~3.7–4.7/yr). The 2-screenplay cap only makes sense as an overlap-enabling
device; treating draft and production as sequential ignores what it's for.
**Consequence:** the analysis already flags this ceiling as an "upside risk the
Owner-tuning stage should watch" versus Prima's 2/yr baseline — the risk is real but
meaningfully **larger** than stated (≈2.9× Prima's rate at the true ceiling, not the
≈1.9–2.4× the stated figure implies).
**Smallest fix:** correct §2's estimate to "~8–9 weeks/film once one overlap cycle is
established (screenplay #2 drafts during production #1 — the reason the cap is 2, not
1), ~5.5–6.5 films/yr structural ceiling," and strengthen (not weaken) the Owner-tuning
flag accordingly. This is a caveat on a secondary paragraph, not on §3's main
arithmetic, which correctly uses Prima's 2/yr as its explicit assumption rather than
the structural ceiling.

### 4. The taper does not remove the boundary-dodge discontinuity; it only shrinks it
**Claim:** §6 states the recommended 3-stage taper (1.00 / 0.55 / 0.20) means "there
is no single 'magic day' that fully resets exposure to zero," and §7 frames this as
tapering "removes the discontinuity itself."
**Why inconsistent:** the recommended `decaySchedule` (§7.1) is peak `[R,R+1)`=1.00,
cooling `[R+1,R+3)`=0.55, residual `[R+3,R+4)`=0.20, then **archived at exactly R+4**
(exposure removed from the active index — per C.1's `exposure-decaying → archived`
transition, which the analysis correctly cites). Weight goes from 0.20 to 0 at that
exact boundary. R+4 *is* a magic day — a smaller cliff (0.20 units) than the original
hard-cliff design (1.00 units), but still an exact, discontinuous drop to zero, so a
release timed at R+4 gets strictly better treatment than one timed at R+3-and-a-half.
**Corrected statement:** tapering reduces the cliff's magnitude from 1.00 to 0.20; it
does not eliminate the cliff. If fully cliff-free behavior is wanted, the smallest
addition is a continuously-decaying tail past R+4 (or one more low-weight stage)
instead of a hard archive cutoff — optional Owner-tuning, not required to ship, but
the write-up's claim should be softened to match what the table actually delivers.

### 5. Player-side flood vector not named (asymmetric concurrency caps)
**Claim:** §6's "spamming cheap films" row treats the structural throttle on this
exploit as "the rival production pipeline (1 production in flight + ≤2 screenplays)"
plus the proposed reach-scaled `contributionBounds`.
**Why incomplete (BREAK-IT: "degenerate strategies for player AND deterministic
rivals"):** the 1-production/≤2-screenplay cap is a **rival-only** policy
(hollywoodTick.ts's `decide()`); nothing in the cited code caps how many productions
the *player* can run concurrently — that is bounded only by the player's own facility
count and capital, which a wealthy late-game player can grow arbitrarily. A player
who has built several soundstages could commission and release multiple
well-marketed (i.e., high-reach — so *not* stopped by the recommended reach-scaled
contribution floor, since a real marketing spend legitimately buys a high
`contributionBounds` value) same-genre films inside one narrow window specifically to
spike every rival's saturation/temporal-pressure reading at once, timed against a
rival's known tentpole release. This is exactly the "flood one genre" degenerate
strategy the task's exploit list asks about, and it is not symmetric between player
and rival under the stated code facts (no player-only *penalty* is required to fix
it — the fix is a per-studio cap, which applies to rivals too, just never binds them
because their production law already prevents it).
**Smallest fix:** clamp *contribution per (studioId, genre, window)* before it enters
the shared aggregate — i.e., one studio's own simultaneous same-genre releases inside
one window should saturate toward a per-studio ceiling rather than summing linearly —
reusing the already-named `contributionBounds` concept at the studio level instead of
only the per-film level. No new mechanism, no player-only rule (law 8/9-compliant),
closes the vector.

## Missing items (edge cases named in this verification's brief, not addressed by the analysis)

- **Pre-P15A save migration:** no statement of how `known-preview`/exposure state and
  the new saturation-stock accumulator are seeded for a save with existing release
  history at the moment P15A ships (cold-start at zero vs. backfill from
  `IndustryReceipt`/film history). Binding law 7 ("no retroactive fiction") suggests
  cold-start-at-zero-with-a-recordedFromWeek-flag is the only lawful answer, but the
  section never says so.
- **Low-rival-count / consolidation endgame:** §3's density arithmetic is computed
  only for the current 9-rival roster and handed to `consolidation.md` "if it
  exists" for reuse, but no worked low-N example (e.g., 2 rivals remaining) is shown
  to confirm the formula degrades sensibly (it does — fewer contributors trivially
  lowers every P(≥1) — but a one-line worked check would have been cheap insurance
  given this section explicitly volunteers to be that dependency).
- Player/rival ID-swap symmetry, save/load mid-batch, and ID reuse are correctly
  *inherited* from the frozen §12.1 law the task told this section not to redesign;
  no independent gap found there.

## Strong points

- Recomputing the release-density table (§3) by hand from the authored anchor
  weights (hollywoodStartingData.ts:9-33) reproduces all six genre figures to within
  ≤0.01 films/yr, and the row sum (≈18.0 = 9 rivals × 2 films/yr) checks out exactly
  — confirms the arithmetic backbone of the whole section is sound.
- The 4-week row of the Poisson table (the Owner-selected value) recomputes exactly:
  20.6% / 27.0% / 12.2% all reproduce to the stated precision.
- Every code citation spot-checked (tuning.ts:56-57,414,858-861; hollywoodTick.ts's
  concurrency/cadence logic; types.ts's `Genre`/`CompetingRelease`; reception.ts:596,679;
  worldgen.ts:645; calendar.ts:3; hollywoodStartingData.ts's anchors) matches the
  accepted-592e926 source verbatim.
- Every authority quote/paraphrase spot-checked (P15-PACKAGE §12.1, §19, §23's
  "market formula" row, §24 OQ1; Builder Annex C.1, D.1, D.2.1 (64-row cap), D.3,
  F.3's 6-question test, L.3's hostile-fixture numbers, L.4; binding laws 8 and 9)
  matches verbatim or in clearly-labeled substance — no fabricated or misattributed
  quotes found.
- Correctly declines to reopen §12.1's frozen same-week batch/self-exclusion law and
  correctly maps announce-and-cancel/delay handling onto the existing C.1 state table
  rather than inventing new states.
- The player-facing explanation grammar (§8) satisfies all six of Annex F.3's
  explainability questions.
