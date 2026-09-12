# BREAK-IT verification — phase2/consolidation.md
**Lens:** adversarial game designer + economist. **Verdict: VERIFIED_WITH_CAVEATS.**

The analysis's core claim (no population floor is needed; consolidation is mechanically
graceful; the one severe risk is a talent-market collapse fixable by rival capacity growth,
not a headcount rule) survives attack. Every code/authority citation I spot-checked resolved
to real, on-point lines (list below), and every arithmetic row I recomputed was internally
correct. But the report has real gaps against the brief's own required lenses — most
seriously it never considers pre-P15-save migration, and it never cross-references its own
genre-anchor data against failure risk, which would have surfaced a correlated-failure
pattern its smooth "10→8→6→4→2" narrative hides. None of these findings overturn the
"no floor" recommendation; they identify risks and one stale input the report should account
for before the Owner treats §13 as final.

---

## 1. Recomputation of paper-scenario arithmetic (3+ rows, as required)

**§2 genre-collision table**, formula `E = (N−1) × (λ/6) × W`, λ=0.0625/wk, W=4:
- N=10: 9 × (0.0625/6) × 4 = 9 × 0.0104167 × 4 = **0.375** — matches table. Correct.
- N=6: 5 × 0.0104167 × 4 = **0.2083** ≈ 0.208 — matches table. Correct.
- N=2: 1 × 0.0104167 × 4 = **0.0417** ≈ 0.042 — matches table. Correct.
All five rows check out arithmetically against the stated formula.

**§3 talent-supply table** ("Active studios remaining | Employer demand (studios×6) |
Cumulative free agents"): the demand column uses the *post-transition* studio count (e.g.
"8→4" uses 4×6=24 ✓; "4→2" uses 2×6=12 ✓), and the "cumulative" closures column counts
closures *from the original 10*, not per-transition (8→4 row's "~36" = (10−4)=6 closures ×
6 = 36 ✓; 4→2 row's "~48" = (10−2)=8×6=48 ✓; 2→1 row's "~54" = 9×6=54 ✓). Every cell is
internally consistent once that (unstated) cumulative convention is understood — **the
arithmetic is correct, but the column header doesn't say "cumulative since 10 active,"
which cost me a re-read to confirm it wasn't an error.** Smallest fix: label the column
"Cumulative free agents since full population (10)."

**Verdict on recomputation: no arithmetic errors found.** The one real numerical problem is
not in the arithmetic but in the *input* — see Finding 6 below.

---

## 2. Findings, ranked

### Finding 1 — MAJOR: migration from pre-P15 saves is never considered
The report itself establishes (§1, §9, citing `hollywoodTick.ts:280-282`) that under the
*current* accepted code, rival cash "can run arbitrarily negative with zero consequence" —
i.e. long-running campaigns can already contain rivals sitting at large negative cash for
years, because no failure law exists yet to stop them. When P15B's real failure law ships
(the report's own §9 recommendation: rivals borrow and can fail under sustained inability
to meet obligations), any such already-deeply-negative rival in an in-progress save is, on
the very first tick after the patch, either (a) read as already "sustained" and tipped
straight to bankruptcy with zero of Direction E's "meaningful warning and recovery first,"
or (b) silently given a free pass depending on how the eligibility window is implemented —
and the report never says which. A player who has played for years could load their save
post-patch and watch several studios "declare bankruptcy" in the same week with no warning
ladder ever shown to them — the opposite of what Direction D/E require, and exactly the
kind of sudden, illegible mass-consolidation event the report's whole argument (graceful,
gradual, observable decline) is trying to avoid.
**This is more severe than the report's own §12 "one severe risk" (talent collapse), and
the report doesn't mention it at all.**
**Smallest fix:** require that the new distress/failure clock start at zero, for every
rival, at first-tick-after-migration — pre-existing negative-cash duration must not count
toward "sustained" until the new law has been in effect for at least the full warning
ladder's length. State this as a one-line P15B/P12 migration rule.

### Finding 2 — MAJOR: genre-anchor concentration creates a correlated-failure risk the
report's uniform-genre model hides
`hollywoodStartingData.ts:9-34` (cross-checked against `phase2/market-window.md` §3, which
now exists) shows the nine rivals' authored `anchors` are **not** evenly spread: exactly 3
of 9 rivals anchor romance (Rose Lantern, Silver Current, Marigold), 3 anchor horror (Night
Orchard, Blackthorn, Copper Kite), 3 anchor comedy (two of them double-anchored), 2 anchor
adventure, and **zero** anchor drama or crime. The consolidation report's own §2 table
assumes "~6 effective genre buckets, hypothetical, uniform for illustration only" and never
revisits that assumption against the real, now-available data. This matters for exactly the
question the Owner asked ("does genre saturation vanish?"): a sustained genre-specific
downturn — prolonged saturation, an era shift, or a player deliberately flooding that genre
(see Finding 3) — can stress *several same-genre rivals at once*, because they share an
anchor. Losing all three romance specialists in a short span is a materially different,
much more dramatic event than the report's smooth "10→8→6→4→2" population-decay narrative
implies, and it produces exactly the "genre suddenly has zero real competition" outcome the
Owner is asking whether the mechanic degrades into — the report answers this only in the
aggregate (§2, §4) and never at the per-genre level where the real risk lives. It also means
drama/crime consolidation is a non-event (there are no anchors to lose) while adventure
(only 2 anchors) is fragile to a single closure.
**Smallest fix:** track per-genre active-anchor count as its own observable signal
alongside the aggregate active-studio count; flag "a genre has 0 remaining anchors" as a
distinct, narrower, non-headcount question for the Owner — this is not the population floor
Direction G rejected, it's a genre-diversity signal, and it should be named as a real open
item rather than left implicit in the §2 uniform-bucket abstraction.

### Finding 3 — MAJOR: predatory genre-flood as a rush-to-monopoly exploit is not examined
Direction A ties box-office outcomes to genre+window market pressure; the report's own §9
recommends rivals fail from sustained inability to cover obligations under real market
outcomes. Nothing in the report checks whether a skilled player can *deliberately* target
a rival's anchor genre — timing high-marketing releases to overlap that rival's windows,
using the exact same law every studio operates under — to accelerate that rival's
insolvency well before the report's assumed "late-run, decades-out" timeframe, especially
against the roster's most exposed authored rival (Bright Meridian: `reserveWeeks:12`,
`negativeScale:1.20`, the fragile extremes in `hollywoodStartingData.ts:33-34`). By the
report's own §8 test ("legitimate if a surviving studio pays the same costs, under the same
law, that any studio always pays"), this qualifies as *legitimate*, not a subsidy — which is
exactly why it is dangerous: nothing stops a player from turning "acceptable emergent
history" (§13) into an engineered speed-run to monopoly, then (once M&A/Direction I ships)
buying the wreckage cheap. The report calls the low-rival end state "an emergent, rare,
late-run tail outcome" (§7) without ever testing whether player agency can make it common
and early instead.
**Smallest fix:** this is a genuine Owner decision the report should have surfaced but
doesn't — state explicitly whether player-engineered rival bankruptcy is an intended,
sanctioned strategy, and if not, bound how much of the market-pressure term (vs. a rival's
own mismanagement) may count toward its failure threshold.

### Finding 4 — MEDIUM: Endless Sandbox turns "possible" consolidation into a mathematical
certainty the report doesn't name
Direction G is a pure death process for the rival population: no births (no replacements),
and — once P15B's failure law exists per §9 — some nonzero per-period failure probability
for every rival. Over the *bounded* 120-year historical campaign this is merely likely to
matter at the margin, which is how the report frames it throughout ("reachable, not
hypothetical," §6; "rare... tail outcome," §7). But Direction K's Endless Sandbox removes
the time bound entirely. A pure death process with no births converges to the zero-rival
absorbing state with probability 1 given unbounded time — full consolidation in Endless
mode isn't a risk to manage, it is the guaranteed eventual outcome absent the (currently
unbuilt, per §8) capacity-growth/re-entry counterweights being strong enough to actually
prevent it, which the report itself flags as unimplemented. The report never states this
directly.
**Smallest fix:** one sentence in the finale/endless coordination note: "in Endless
Sandbox, eventual zero-rival consolidation is expected with unbounded play, not an edge
case — the presentation layer (P15C) should be designed to degrade gracefully to it, not
be surprised by it."

### Finding 5 — MEDIUM: player/rival symmetry swap is only half-addressed
§5 addresses the N=1 case only as "player alone, monopolist." §12 rank 3 notes the
player's own closure is "already decided" under Direction E and treats that as sufficient.
But the *mirror* case the brief specifically asks for — the player fails while multiple
rivals continue simulating toward their own 2-or-1 end state — is never discussed: does the
Historical Campaign's 2040 ceremony still occur for a player who went bankrupt in 1985, and
does the interactive Legacy dossier (Direction J: "rivals rising & falling," "bankruptcies &
recoveries") still make sense to present to a player who is no longer an active participant?
This is a real gap given the task explicitly names "player/rival symmetry swap" as a
required lens.
**Smallest fix:** one line noting this belongs to `player-failure.md`/P15C's finale
coordination, and that the frozen-Legacy dossier framing (Direction K) must already handle
"campaign continues to 2040 after the player's own studio has closed" as a case, not only
"campaign continues after a rival closes."

### Finding 6 — MINOR: stale market-cadence input, now correctable
§2's PROVISIONAL cadence (λ≈0.0625 films/wk/studio ≈ 3.25/yr, spread uniformly over "~6
effective genre buckets") was adopted because, per the report's own method note,
`phase2/market-window.md` "does not exist in this scratchpad" at authoring time. It exists
now (same phase-2 batch, written ~2 minutes later) and supplies a sourced, non-uniform
model: Prima's 2 films/yr/rival baseline, with anchor-weighted per-genre aggregate rates
from 1.68/yr (drama, crime) to 4.08/yr (romance) across all 9 rivals. Recomputing
consolidation's own formula shape with those real weighted rates at N=10 (aggregate over
9 rivals, W=4 wks):
- drama/crime: 0.0323/wk × 4 = **0.129** vs. the report's flat 0.375 for N=10 — the flat
  model overstates pressure by **~190%** in exactly the two genres that turn out to have
  no anchor rivals at all.
- romance (busiest real genre): 0.0785/wk × 4 = **0.314** vs. 0.375 — flat model still
  ~19% high even against the busiest real genre.
- mean genre: 0.0577/wk × 4 = **0.231** vs. 0.375 — flat model ~62% high on average.
This does **not** overturn the qualitative "pressure thins roughly linearly, degrades
gracefully" conclusion — if anything it makes the "market becomes uninteresting well before
studios run out" reading (§2's own honest framing) *more* true, not less, since real
pressure is lower than assumed almost everywhere. But the specific table numbers are now
supersedable by better evidence the analyst was instructed to use if available, and the
"file does not exist" note is stale.
**Smallest fix:** rerun §2 with `market-window.md`'s real per-genre weighted rates (or add
one line: "recomputed against the now-available market-window.md, aggregate pressure is
~60% lower than assumed above; conclusion strengthens").

### Finding 7 — MINOR: citation error
§7 cites `_DIGEST.md` line 31 (twice) and line 58 for the Transport Fever 2 correction
("corrected to COMMUNITY/LOW-MEDIUM tier"; the "no competitive objective"/"a deal breaker"
quotes). I read the actual digest: those lines are unrelated (line 31 is a section header,
"## verify:code-hollywood:completeness-overclaim"; line 58 is a note about the
player/rival awareness-drift-gate asymmetry). The real Transport Fever 2 correction, with
the exact quoted words, is at **lines 242, 252, and 322**. The substance the report quotes
is faithful to what the digest actually says — this is a pointer error, not a fabrication —
but it's the one citation slip I found in an otherwise carefully-cited report.
**Smallest fix:** retarget both citations to `_DIGEST.md` lines 242/322.

### Finding 8 — MINOR: "hoarding" / passive-survival is a sanctioned but unexamined
degenerate strategy
§8 legitimizes "market pressure per release rising as rivals thin" and "free-agent
gravitation to the few remaining employers" as earned, law-consistent benefits of simply
outlasting rivals. Taken together, this already sanctions a pure risk-averse "never
greenlight anything risky, hoard reserves, wait decades for natural attrition" playstyle as
a viable path to eventual market dominance — the report never asks whether that passive
"turtle" pattern is desirable or whether it needs a counterweight (e.g., tying Power
Ranking's output/reliability lane, Direction B, to more than survival). The brief
specifically asks for hoarding-type exploits to be checked.
**Smallest fix:** one sentence connecting §8 to Direction B's multi-factor Power Ranking —
survival alone should not read as "powerful" — so this is at least named rather than left
implicit.

### Finding 9 — NIT: rank-table framing is ambiguous about which axis is "the recommendation"
§12's table orders options by intrusiveness (rank 1 = least intrusive), but the prose calls
rank-4 item ("capacity growth") "the actual fix for the severe risk" while two *less*
intrusive items sit at rank 2–3. A reader skimming only the table could conclude the
top-ranked disclosure notice (rank 2) is the report's primary recommendation. Not a design
problem, a report-clarity one.
**Smallest fix:** add "(primary recommendation)" next to the capacity-growth row, or add a
sentence explicitly separating "least intrusive" from "most load-bearing."

---

## 3. Citation audit (spot-checked against accepted-592e926 and authority docs)

Confirmed exact / accurate:
- `calendar.ts:3` RIVAL_ARRIVAL_WEEKS = `[0,0,0,0,520,988,1560,1872,2548]` ✓ (week 2548 = 1969 ✓)
- `hollywoodStartingData.ts` capital range 20M (Silver Current) – 38M (Bright Meridian) ✓;
  reserveWeeks list [13,18,20,15,15,18,13,16,12] in studio order ✓; negativeScale extremes
  Night Orchard 0.94 / Bright Meridian 1.20 ✓; marketingRatio 0.14–0.24 ✓
- `RIVAL_TEAM_ROLES` = writer/director/3×actor/craft (6 roles) ✓ (`hollywoodStartingData.ts:37`)
- `hollywoodTick.ts:98,126,176` reserve-gated hiring/commissioning; `:197` reserve-computation
  line feeding the same gate (close but not the gate line itself — minor looseness, not an
  error) ✓; `:221` `for(const b of h.businesses)` ✓; `:280-282` unconditional
  payroll/overhead/facilityOpex postings ✓
- `hollywood.ts:88` `rivalCapacityOpex` ✓; no `acquire`/`buildFacility`/growth function
  anywhere in `hollywood*.ts` — confirmed by grep, matches the "no growth code found" claim ✓
- No `loan`/`debt` code anywhere in `src/` (one unrelated wordlist entry) ✓; `StudioIdentity`
  (`hollywoodTypes.ts:6-17`) confirmed to have no status field ✓
- `P15-BUILDER-ANNEX.md` §C.2 rank-state table (lines 102-111) "archived studio →
  excluded/archived; history retained" ✓
- `P13-P15-LONG-RANGE-ROADMAP.md` §19.2 line 668 "hard maximum 32 people" ✓; §19.3 line 679
  "P12's minimum three active AI rivals" ✓ — both section numbers correct
- `_DIGEST.md` SIM-015 citation (lines 5, 53, 63) ✓ all three resolve to the real SIM-015
  content, "not Owner law"
- `comp-ranking.md` §3.2 (GearCity no-replacement), §3.5 (line 197, "No source praises
  synthetic respawn" — verbatim match), §3.6 (NBA 2K25 MyNBA "±6 teams/offseason, user
  setting" — verbatim match) ✓
- `P15-PACKAGE.md:158` "eligible studio cohort" ✓
- Comparator facts (GearCity >75% monopoly-lawsuit ceiling; Blockbuster Inc. "pausing
  operations for a year before returning") ✓ match `_DIGEST.md` lines 335 and 353

Error found:
- `_DIGEST.md` "line 31/58" for the Transport Fever 2 correction — wrong; see Finding 7.

---

## 4. Other edge cases checked, no problem found
- **2-studio / 1-studio end state, "3 active / 7 closed" framing:** explicitly and correctly
  handled in §5, matches the task's own example framing.
- **Save/load mid-settlement:** not discussed, but this is a multi-week-process concern that
  belongs to whichever package implements the settlement/auction state machine
  (comp-ma/P15I), not a gap specific to this section's population-count analysis.
- **ID reuse:** Direction D's "never recycle StudioId" is correctly relied on throughout;
  the report's own proposed "opt-in late-entrant pack" (§12 rank 5) doesn't restate the
  dedup requirement, but the existing `uniqueIdentity` pattern used elsewhere in the code
  makes this a checklist item, not a design gap.
- **Two AI rivals / one AI rival "enough":** well-reasoned in §7, correctly distinguishes an
  authored permanent zero-AI design (Transport Fever 2) from an emergent rare tail state.

## 5. Bottom line
No arithmetic errors; citations are accurate with one pointer slip; the "no floor" headline
recommendation stands. The report is weaker than it looks on the brief's specific adversarial
asks — it misses the single most game-breaking edge case (pre-P15 save migration mass-failure
on patch day), and it never cross-references its own genre-anchor data against the failure
risk it spends two sections analyzing, which would have shown consolidation is likely to
happen in genre-correlated bursts, not the smooth population decay the report's tables imply.
Recommend the Owner see Findings 1–3 flagged explicitly alongside the report's own §13 list.
