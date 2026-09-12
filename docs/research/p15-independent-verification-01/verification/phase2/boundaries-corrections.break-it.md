# Adversarial verification (BREAK-IT lens): `phase2/boundaries-corrections.md`

**Verifier role:** adversarial game designer + economist. Not the author. Task: find exploits,
snowball paths, degenerate strategies (player and deterministic rival), legibility failures, edge
cases, and recompute paper-scenario arithmetic.

**Overall verdict: VERIFIED WITH CAVEATS.** Every citation and arithmetic row I re-derived checked
out exactly against `accepted-592e926/`. The 17-row ownership map and 12-item decision list are
fully complete against the task's own checklists (no capability or decision item omitted). But the
"break it" pass surfaces several unaddressed exploit/edge-case paths in the *recommendations*
themselves — most importantly, a genuine ambiguity about whether the recommended player-terminal
option actually delivers what Owner Direction E asked for by name — that a builder could act on
without ever noticing the gap.

---

## 1. Arithmetic recomputed (3+ rows, as required)

### 1.1 §3.5 loan illustration — Facility mortgage, $5,000,000 @ 8%/10yr
Weekly rate r = 0.08/52 = 0.00153846; n = 520 weeks.
Standard amortizing-payment formula: P = r·PV / (1 − (1+r)^−n)

- (1+r)^520 ≈ 2.22435 → (1+r)^−520 ≈ 0.449554
- P = 0.00153846 × 5,000,000 / (1 − 0.449554) = 7,692.31 / 0.550446 ≈ **$13,977/week**

Document states **$13,976/week**. **Matches** (within $1 rounding). Confirmed correct.

### 1.2 §3.5 loan illustration — Operating line, $1,000,000 @ 8%/5yr
n = 260 weeks, same r.
- (1+r)^260 ≈ 1.49137 → (1+r)^−260 ≈ 0.670526
- P = 0.00153846 × 1,000,000 / (1 − 0.670526) = 1,538.46 / 0.329474 ≈ **$4,669/week**

Document states **$4,669/week** and "about 31% of base overhead." 4,669/15,000 = 0.3113 = **31.1%**.
Both **match**. Confirmed correct.

### 1.3 Row 48 — rival zero-employee weekly burn floor
Claimed: 38,500 = OVERHEAD_BASE 15,000 + facility opex (9,000+5,000+4,000+5,500 = 23,500).
9,000+5,000 = 14,000; +4,000 = 18,000; +5,500 = 23,500. 23,500+15,000 = **38,500**. **Matches.**
I also verified the four opex constants against `tuning.ts:686,699,710,731` directly (see §2) — all
four line numbers and all four dollar values are exact.

### 1.4 §1 Direction G calendar — RIVAL_ARRIVAL_WEEKS → years cross-check
`calendar.ts:3`: `[0,0,0,0,520,988,1560,1872,2548]`. At 52 weeks/year from 1920:
520/52=10→1930 ✓; 988/52=19→1939 ✓; 1560/52=30→1950 ✓; 1872/52=36→1956 ✓; 2548/52=49→1969 ✓.
All five match the direction text's parenthetical exactly. Confirmed self-consistent.

### 1.5 One genuine imprecision found (not a computation error, a legibility/phrasing defect)
Row 3.5's sentence: *"a $5,000,000 Facility-mortgage tier at 8%/10yr costs $13,976/week — **nearly
doubling** the $15,000 OVERHEAD_BASE."* Read literally, this says the $13,976 payment nearly doubles
$15,000 — but $13,976 is **93%** of $15,000, not double it or anything close. The sentence is only
true under a *different*, unstated reading: base overhead **plus** this loan payment
(15,000+13,976 = 28,976) is nearly double base overhead alone (28,976/15,000 = 1.93×). That reading
is correct arithmetic, but the sentence as written attaches "nearly doubling" to the wrong operand,
and a reader (or a builder skimming for a tuning constant) can walk away with a false number.
**This is exactly the kind of legibility failure the brief asks this lens to catch** — if a design
document's own scale-check sentence can be misread as a factual claim that is false on its face, a
player-facing string built the same way will be worse.
**Smallest fix:** reword to *"…costs $13,976/week on its own — comparable in size to the entire
$15,000 base overhead; stacked on top of it, weekly overhead very nearly doubles ($28,976 vs.
$15,000)."*

---

## 2. Citation spot-checks (code, not scenario arithmetic, but load-bearing for the exploit findings below)

I re-grepped the accepted snapshot rather than trusting the citations at face value, since several of
the report's exploit-relevant claims (reserve gates, migration refusal pattern, exact-key lists) rest
entirely on specific file:line pointers. All of the following checked out **exactly**:

| Claim | Cited | Actual |
|---|---|---|
| `RIVAL_ARRIVAL_WEEKS` array | `calendar.ts:3` | line 3, values match verbatim |
| `OVERHEAD_BASE`/`OVERHEAD_PER_EMPLOYEE` | `tuning.ts:419`/`:420` | exact |
| Four facility weekly-opex constants | `tuning.ts:686,699,710,731` | exact (9000/5000/4000/5500) |
| `StudioIdentity` exact-key list | `hollywoodValidation.ts:75` | exact |
| `RivalBusiness` exact-key list | `hollywoodValidation.ts:204` | exact |
| `policy` exact-key list + `version===1` pin | `hollywoodValidation.ts:208-209` | exact |
| Rival reserve-gate checks | `hollywoodTick.ts:98,126,156,176` | all four are real reserve-referencing gates (98/126/176 are literal `continue` gates; 156 feeds the reserve into `cashAvailable` for the package chooser — a slightly looser but substantively accurate citation) |
| `migrateToV13..V18` explicit "cannot downgrade SaveFileV19" throws | `save.ts:7072,7139,7147,7160,7176,7202` | exact, and confirmed `migrateToV12` (`:7046`) and `migrateToV11` (`:7024`) name only versions 12-18, **not 19** — a V19 save really does fall through both without an explicit refusal, exactly as row 21 claims |
| `bridge/industry.ts` "no combined Power score" notice | corrected to `:110` | **exact** — line 110, not the previously-cited 117 |
| Prima weight percentages sum check | 24+24+24+14+14 | = 100 exactly, self-consistent |

**No fabricated or mislocated citation found anywhere I checked.** This is a genuinely rigorous piece
of work on the code-evidence side; I'm noting the spot-check as a strong point, not a caveat.

---

## 3. Exploits, snowball paths, and design-adversarial findings

### 3.1 (Most important) Recommended player-terminal Option B may not actually deliver what Direction E asked for — and, as written, opens a debt-discharge loop
§3.4 recommends **Option B**: "the player studio still never legally closes… Dormancy for the player
is *always* re-enterable, never archived." The stated justification is that this "requir[es] the
least new machinery" and "satisf[ies] direction E's demand that 'negative cash = game over' never be
the mechanism."

That justification is true as far as it goes, but it only addresses the *negative* half of Direction
E ("do not silently choose negative cash = game over"). It never squarely addresses the *positive*
half, which is explicit and named: **"PLAYER STUDIO CAN ULTIMATELY FAIL AND GO BANKRUPT (revises the
earlier protected-continuity ruling)."** A permanently re-enterable, never-archived Administration
state is, by construction, protected continuity with better UI — which is the exact thing the
direction says it is revising away from. The report never states this tension outright; it presents
Option B as satisfying E without flagging that it may only satisfy half of it.

This is not merely a labeling nitpick (that's the authority-consistency lens's job) — it has two
concrete game-design consequences squarely inside this lens:

- **Legibility failure.** A player who is told "your studio can go bankrupt" and then discovers the
  worst outcome is a permanently-recoverable, never-lost state cannot explain the stakes in one
  sentence — the promised consequence and the actual consequence diverge.
- **Exploit surface (debt-discharge loop).** Neither §3.4 nor §3.5/§3.6 (loans) states whether
  entering the terminal/Dormancy floor discharges, freezes, or reduces the outstanding loan
  principal accrued under §1 row 5 / §3.5. If it does — even partially, even just an interest
  freeze — a player gains a repeatable "borrow recklessly, ride it into Dormancy, shed the
  consequence, recover" loop, since Option B's own text guarantees the studio "never actually stops
  existing." This is precisely the "borrow-to-buy" / "reset counters" exploit family the brief names.
  Even if the *intended* design has debt survive Dormancy unchanged, the report never says so, and a
  builder implementing "least new machinery" has an obvious incentive to let the debt ledger simply
  freeze while the studio is dormant (since nothing is "operating").

**Smallest fix (two sentences, no new machinery):** (1) Add to §3.4: *"Entering the terminal floor
never discharges, reduces, or pauses interest on outstanding loan principal (§1 row 5); the P11
ledger persists unchanged through Dormancy, and recovery requires resuming the same repayment
schedule."* (2) Explicitly flag to the Owner in §3.4 (not bury it in the recommendation prose) that
Option B is a *specific interpretive choice* — "permanently-recoverable Administration counts as
fulfilling 'ultimately fail and go bankrupt'" — and ask for sign-off on that reading, rather than
presenting it as the obviously-correct minimal option.

### 3.2 Unflagged player/rival terminal asymmetry
§3.4 (player: Option B, permanent floor, "never actually stops existing") and §3.9 (rival: "bounded
… dormancy state with an **automatic return-or-close resolution after a fixed window**" — i.e., a
rival genuinely *can* close forever) are two different terminal laws for the same underlying ladder.
The report cites the project's own remedy-family symmetry law in §3.6 ("identical
eligibility/cost/timing/effect for player and rival remedies," `P15-PACKAGE.md §17`) when discussing
*loans*, but never revisits that law when its own §3.4 and §3.9 recommendations, read together,
produce a *categorically* different terminal fate for player vs. rival (one can truly end, one
cannot). This is exactly the "player/rival symmetry swap" edge case named in the brief, and the
report addresses each half in isolation without ever naming the asymmetry it creates when combined.
**Smallest fix:** one sentence in §3.4 or §3.9 stating explicitly that the terminal *step* is an
intentional, Owner-directed asymmetry (Direction E vs. D are in fact different rulings for player vs.
rival) rather than an oversight — so a future reader doesn't have to reconstruct that this was a
deliberate choice instead of an inconsistency.

### 3.3 Auction "short window" is an unaddressed save-scum surface
§1 row 11 and §3.7 describe the Stage-1 bankruptcy asset auction as "offered in merit order with a
short window" and recommend "player-first refusal within a short window, then merit order." Nowhere
does the report state whether this window resolves in a single deterministic tick (seeded off
campaign state, matching the pattern already used elsewhere in the codebase — e.g.
`stream(state.seed,'hollywood-v1',...)` in `hollywoodTick.ts`) or spans multiple ticks/decision
points a player could save before and reload against. If it is the latter, a player can quicksave
immediately before a lot is offered, observe the outcome, and reload until every contested asset is
won at the cheapest possible price — directly defeating the "player-first refusal, then merit order"
fairness design the report itself proposes, and it is exactly the "cancel-and-reannounce" / timing-
dodge family the brief calls out.
**Smallest fix:** add one sentence to §3.7: *"The auction's bid amounts and winner must be resolved
deterministically and atomically in the same tick the lot is offered (seeded off campaign state, not
sequential player choices spanning multiple saves), so reloading cannot change the outcome."*

### 3.4 Degenerate 0/1-competitor market-pressure case is not required to be well-defined
§1 row 1 assigns "Market pressure (genre + release-window competition, decay)" to P15A. Direction G
explicitly forbids an artificial floor and accepts consolidation as legitimate history, which means
the shared market can genuinely end up at exactly the "2-studio end state" (or even a 1-studio,
player-only state) named in the brief — not a hypothetical, since G forecloses any mechanism that
would prevent it. Neither §1 row 1 nor §3.1 (window/curve tuning) requires the P15A formula's owner
to specify the zero-active-competitor and one-active-competitor limits. A naive genre-
saturation/competition-share formula is a natural place for a division-by-zero, a NaN, or an
unintended pressure cliff to appear exactly at the state the direction says must be allowed to occur.
**Smallest fix:** one added sentence to §1 row 1 (or §3.1): *"The P15A formula must be explicitly
well-defined at zero and one active competitors (no competitors ⇒ zero competitive pressure), since
Direction G makes this a reachable end state, not an edge case to design around."*

### 3.5 §3.12's dismissal of a monopoly consequence doesn't consider that P15A's own mechanic (row 1) is a plausible extinction vector
§3.12 recommends no monopoly mechanism, reasoning that the comparator complaint pattern is about
"unopposed dominance being boring," addressed by better rival AI rather than a mechanical brake. That
reasoning is reasonable for *organic* consolidation, but it does not consider that §1 row 1's own
market-pressure design — which explicitly consumes "P12 disclosed release schedule" as upstream truth
— gives the player visibility into a struggling rival's announced slate and a mechanical tool
(deliberate same-window release-and-saturate) to hasten that rival's failure on purpose. Combined with
Direction G's no-floor rule and §3.12's "no consequence" recommendation, the report's own
recommendations leave open a "snipe the last rival's release window until it fails" snowball strategy
with no counter-mechanism and no flag to the Owner that this is a live possibility distinct from
passive consolidation.
**Smallest fix:** add one sentence to §3.12: *"P15A's market-pressure formula (row 1) is a possible
vector for deliberately targeting a struggling rival's disclosed release window to hasten failure
rather than organic consolidation; §3.1's window/curve tuning should be play-tested against this
targeting strategy specifically before the Owner accepts 'no monopoly consequence' as final."*

### 3.6 Live-ranking visibility of dormant/closed studios is unspecified
§3.9 recommends bounded rival dormancy-with-return; §1 rows 2/7/10 and Direction J require closed
studios' history to remain accessible forever. Nothing in the ownership map or decision list states
whether a Dormant/Insolvent/Closed studio is excluded from the *live* quarterly Power Ranking and the
existing four-lane Studio Charts (`bridge/industry.ts`) while dormant, versus continuing to occupy a
ranked row with stale or zero output. This is a legibility gap ("can a player explain the number/stage
in one sentence?") that falls between the report's own rows 2, 7, and 9 without being explicitly
closed by any of them.
**Smallest fix:** add to §1 row 2 (or as a 13th open decision): *"Dormant/Insolvent/Closed studios are
excluded from the live-ranked Power Ranking and Studio Charts lanes (shown with a status badge
instead), while their historical rows persist unchanged for Legacy/finale purposes."*

### 3.7 Checked, no issue found (for completeness against the brief's checklist)
- **ID reuse:** foreclosed by construction, not a live risk. `hollywoodValidation.ts` requires
  `studios.size === 10 && h.identities.length === 10` — the roster is a fixed player+9 array; Direction
  G's "no replacement" means slots simply stop producing new activity, they are never freed or
  reissued. No fix needed; worth stating explicitly in a future revision only as documentation, not as
  a defect.
- **Migration from pre-P15 saves:** the V19→V20 additive-root pattern (row 22) and the six-validator
  enumeration (row 52) are accurate and, as far as I traced it, complete — I confirmed independently
  that `migrateToV11`/`migrateToV12` both lack an explicit V19 refusal and cascade toward older
  conversions, which would fail with a generic shape error rather than a clean message, exactly as row
  21 states. No correction needed here beyond what §1 row 22 already prescribes for a V20 root.
- **Post-2040 player failure / awards continuation (§3.10/§3.11):** internally consistent with
  Direction K's "must not rewrite the frozen Legacy" wording; I found no exploit path these open.

---

## 4. Strong points

- Every one of the 17 capabilities named in the task prompt has an ownership-map row; every one of
  the 12 decision categories named in the task prompt has a numbered §3 subsection, in the same order
  the task listed them. No omissions against either checklist.
- Corrections table has 55 deduplicated rows (within the requested 40-70 range), ordered by
  consequence, and every file:line citation I spot-checked (11 checks across code and one prose
  citation) was exactly correct, including a citation *self-correction* (row 54, "the notice is at
  line 110, not 117") that I independently verified as accurate.
- Both recomputed loan-payment figures in the PROVISIONAL illustration are correct to the dollar.
- The two "hardest boundary calls" callouts (net worth vs. valuation; M&A staging) are well-reasoned
  and consistent with the comparator evidence cited elsewhere in phase-1.

## 5. Missing items (brief's checklist items not closed by the document)

1. No explicit statement on whether entering the player terminal floor (§3.4-B) discharges, pauses,
   or leaves unchanged any outstanding loan obligation — creating an unaddressed debt-loop exploit
   surface (§3.1 above).
2. No explicit determinism/save-scum-resistance requirement for the Stage-1 auction's "short window"
   (§3.3 above).
3. No explicit requirement that the P15A market-pressure formula be well-defined at zero/one active
   competitors, despite Direction G making that state reachable (§3.4 above).
4. No reconciliation of the player-permanent-floor vs. rival-bounded-closure asymmetry against the
   project's own cited remedy-family symmetry law (§3.2 above).
5. No statement on live-ranking visibility/exclusion of dormant or closed studios (§3.6 above).

## 6. Problems, restated compactly (for the structured summary)

1. **Player-terminal Option B may not satisfy Direction E's positive requirement ("ultimately fail
   and go bankrupt")** — it only satisfies the negative constraint ("not silent game-over"); as
   written it also leaves an unaddressed debt-discharge exploit if Dormancy freezes obligations.
   Fix: add the two clarifying sentences in §3.1 above and flag the interpretive choice for explicit
   Owner sign-off rather than presenting it as settled.
2. **Recommended player (permanent-floor) and rival (bounded-closure) terminal laws are asymmetric**
   and this is never named against the project's own remedy-family symmetry law. Fix: one sentence
   stating this is an intentional, direction-driven asymmetry.
3. **Stage-1 auction's "short window" has no stated determinism/save-scum-resistance requirement.**
   Fix: one sentence requiring single-tick, seeded resolution.
4. **P15A market-pressure formula is not required to be well-defined at 0/1 active competitors**,
   despite Direction G making that state reachable. Fix: one sentence in row 1/§3.1.
5. **§3.12's "no monopoly consequence" doesn't consider that row 1's own mechanic (visibility into a
   rival's disclosed release schedule) is a plausible deliberate-extinction vector**, not just passive
   consolidation. Fix: one sentence flagging the targeting-strategy risk for playtesting.
6. **Minor: the §3.5 "nearly doubling" sentence is arithmetically misleading as literally written**
   (13,976 does not nearly double 15,000; the *sum* does). Fix: reword as shown in §1.5 above.

No arithmetic in the document was actually wrong; all recomputed figures matched. The caveats are all
about unaddressed exploit surfaces and one significant interpretive gap in the recommendations, not
about incorrect facts or citations.
