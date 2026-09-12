# P15 — Section 5: Rival Failure / Bankruptcy Model, with Bankruptcy Economics Paper Scenarios

**Analyst pass, READ-ONLY research.** Date 2026-09-11. Scope: Owner Direction D (rival studios can fail,
under one economic law shared with the player) plus the bankruptcy-economics paper scenarios the package
prompt requires. This report is written to be the canonical trigger hierarchy for the whole P15
bankruptcy slice — `player-failure.md`, `loans.md`, and `talent-settlement-events.md` were all written
before this file existed and each independently derived (or, for the settlement mechanics, fully
specified) pieces of this same design. Per the coordination instruction, **every stage name, trigger
fact, duration, and default rule below is reused verbatim from those three reports wherever they already
agree** — nothing here re-derives what is already settled. Exactly one substantive disagreement was
found between two of them; it is named and reconciled in §0.2, not silently picked.

---

## 0. Coordination with the sibling analyses

### 0.1 What is adopted unchanged

- **Six-stage ladder and names** (`player-failure.md` §2): Healthy → Warning → Distress → Severe
  distress/Event of Default → Insolvency (bounded rescue) → Bankruptcy (terminal) → settlement/auction/
  closure. This is also the Owner's own literal wording in Direction D. P15-PACKAGE §12.3 names the top
  state `active`; Direction D (newer, Owner-authored) says `healthy`. This is a terminology refresh over
  the same predicate, not a substantive change, and is adopted here without further comment.
- **All PROVISIONAL durations**: 4-consecutive-week constrained-Warning floor; 13-week Distress sustain;
  **4 missed weekly instalments within a rolling 13-week window** as the Event-of-Default rule, cure
  requiring catching up *every* currently-missed instalment (the direct fix for Mad Games Tycoon 2's
  reset-on-one-good-month exploit); 8-week covenant cure window; 13-week bounded rescue/administration
  window, one-time, non-repeating (`player-failure.md` §2–§5; `loans.md` §3.7).
- **The loan products and covenant law** (`loans.md` §3): one Studio Loan (fixed-term amortizing, 5 or 10
  year, sized to ≤3× trailing-52-week surplus and ≤60% LTV on book-after-salvage collateral, whichever
  binds first — coverage binds first at current rates per `loans.md` §4) plus one Rescue loan (Tier D,
  distress-only, not player/policy-selectable on demand), and the 8-week sustained-negative-cash
  distress-interest rule that closes the "overdraft beats borrowing" hole without a second standing
  product.
- **The full settlement mechanism** (`talent-settlement-events.md` §2): a single settlement week for
  contracts (new end reason `employerClosed`, added as a third disjunct beside `expiry`/`termination`);
  wages already earned are paid in full automatically by the existing unconditional weekly debit; the
  unexpired guarantee remainder is written to zero (no severance, unlike the player's discretionary 50%
  `releaseTalent` buyout); greenlit productions and in-progress theatrical runs complete under an estate
  label because they cost nothing further; undeveloped screenplays (no `productionId`) are cancelled; new
  receipt kinds `studioClosed` and `projectCancelled`; a new root `studioOperatingState`, not a widened
  `StudioIdentity`. This report does not re-derive any of this — see §5 for the one addition it proposes.

### 0.2 The one disagreement, named and reconciled

`player-failure.md` §2's trigger table lists Severe Distress as reachable by **either** "4 missed weekly
obligations… within a rolling 13-week window, **OR** book net worth negative for 26 consecutive weeks."
`loans.md` §3.7's default rule states, as its explicit load-bearing design decision: *"acceleration [an
uncured Event of Default]… is the only event that may hand the P15B condition machine a 'Warning' trigger
sourced from finance. Sustained negative cash… is the second, independent trigger. **Nothing else in
finance may originate a Warning.**"* These cannot both be true: one admits a third, net-worth-based path
into the ladder; the other explicitly closes the set to two.

**Reconciliation (this report's ruling, since Direction D's own text puts the question to whichever
analyst owns the trigger hierarchy — "NOT net worth alone unless analysis strongly supports it"): adopt
`loans.md`'s stricter rule and correct `player-failure.md`'s table to drop the net-worth disjunct.**
Reasoning: Book Net Worth is deliberately conservative by construction (book-after-salvage, never at
cost — `net-worth.md`'s own convention, consumed by `loans.md`'s LTV covenant). Scenario 3 below shows a
studio that is heavily leveraged, fully current on every instalment, and profitable — exactly the
"healthy investment borrowing" Direction F wants to encourage — can carry negative book net worth for
years purely because the collateral haircut is conservative, not because it is failing. Letting sustained
negative net worth escalate a studio into Severe Distress on its own would penalize the exact borrowing
behavior Direction F authorizes and create a perverse reason to avoid the Studio Loan product entirely.
**Book Net Worth remains real and useful — it drives the credit-grade table (`loans.md` §3.5) and belongs
in the player's/analyst's Distress-panel disclosure per Direction C — but it does not, by itself, move a
studio's stage.** Only a missed instalment (accelerating to Severe Distress via the 4-in-13-weeks rule)
or a covenant breach (leverage/coverage ratios, not book net worth) may originate a finance-sourced
trigger. `player-failure.md`'s §2 table and §9's decision list should be read with this correction; no
other change to that report is implied.

---

## 1. Baseline: why this is a new system, not a reconstruction

P15-PACKAGE §5.5 records an **OPEN QUESTION**: no reliable retail source establishes rival bankruptcy,
closure, disappearance, merger, or replacement in the original 2005 game at all — a pre-release GameSpot
preview mentioning a studio "going bust" is marked SOURCE VERIFIED AS PRE-RELEASE REPORT ONLY and cannot
establish retail law (`comp-bankruptcy-loans.md` §5 CONFIRMED). This section therefore has **no original
parity claim to make or break** — it is entirely new design, built from the accepted code's existing
rival ecosystem and modern comparators.

The accepted code already ships a real, nine-studio fictional rival ecosystem at 592e926 (the digest's
correction to the stale P15 §9 claim of absence): `RIVAL_ARRIVAL_WEEKS = [0,0,0,0,520,988,1560,1872,2548]`
(`calendar.ts:3`) puts four rivals at 1920 and five more at 1930/1939/1950/1956/1969
(`hollywoodStartingData.ts:8-35`), each with an authored `capital` (20M–38M), `reserveWeeks` (12–20,
authored per studio), `negativeScale` (0.94–1.20), and `marketingRatio` (0.14–0.24). **After 1969 no new
rival is ever minted** — the cast is fixed at 9 rivals + 1 player forever (`hollywoodValidation.ts:72`,
"exactly 10 identities"). Weekly cost is `rivalWeeklyOperatingCost = payroll + OVERHEAD_BASE(15,000) +
OVERHEAD_PER_EMPLOYEE(1,500)×contracts + facility opex` (`hollywood.ts:81-86`), debited unconditionally
every tick regardless of cash sign (`hollywoodTick.ts:280-282`); a rival below `operatingReserve
= weeklyCost × reserveWeeks` simply stops taking on *new* commitments and can otherwise run negative cash
forever (`hollywoodTick.ts:98,126,176,196-200`) — the "implicit interest-free overdraft" the task names,
and the reason nothing today ever "falls due and goes unpaid." **A loan/debt law and a missed-payment
fact are therefore prerequisites for any of the rest of this section to be reachable at all**, exactly as
`loans.md` designs.

---

## 2. Canonical trigger hierarchy

| Stage | Trigger (rival-symmetric with player) | Code hook / new plumbing | Rival-specific note |
|---|---|---|---|
| **Healthy** | Standard obligations affordable; no sustained constraint | existing `operatingReserve` gate is a coarse proxy today | P12 policy operates normally |
| **Warning** | `constrained`-equivalent for ≥4 consecutive weeks, OR cash < 8 weeks of fixed costs (payroll+overhead+opex+debt service), OR a covenant (leverage/coverage) breach (8-week cure starts) | needs a rival-side `classifyRecovery` projection (`player-failure.md` §2's reuse note: generalize the player's selector rather than write a second one) | ATTENTION-tier public notice per `talent-settlement-events.md` §3.1 ("studio enters warning") |
| **Distress** | Warning-equivalent sustained ≥13 consecutive weeks | same selector, higher threshold | P12 policy auto-selects from the same ≥2 typed remedy families (P15-PACKAGE §16): release talent, delay/cancel an uncommitted screenplay, complete a conserved release, or dormancy |
| **Severe distress / Event of Default** | **4 missed weekly instalments within a rolling 13-week window** (loan or, once one exists, distress-interest on sustained negative cash), cure requires catching up every currently-missed instalment | new: P11 missed-instalment counter | **Book Net Worth is deliberately excluded as an independent trigger — §0.2** |
| **Insolvency (bounded rescue)** | Automatic on an uncured Event of Default; 13-week window, one-time, non-repeating | new | P12 policy deterministically offers itself the Rescue loan (if it qualifies) plus the same remedy menu — no hidden rival-only rescue, no player-only rescue (§17 symmetry) |
| **Bankruptcy (terminal)** | Rescue window expires without curing to at least Distress | new | Instantaneous; fires settlement (§6) in the same week |
| **Settlement → Auction → Archived** | n/a (automatic on Bankruptcy) | `studioClosed`/`projectCancelled` receipts, `studioOperatingState` root | §6 |

---

## 3. Warning: how much, and what the player must see

Reused from `player-failure.md` §3 without change, generalized to third-person for a rival: a visible,
dated clock at every stage past Warning (never a hidden counter — the load-bearing lesson from Mad Games
Tycoon 2's pre-fix resetting counter and the strongest complaint across the whole comparator set);
sourced causes; scheduled receipts counted before a miss is declared true (§4 Scenario 6). For a rival
specifically, "what the player must see" is narrower than for the player's own studio, per P12's existing
privacy law (`bridge/industry.ts:1`: "future receipts, costs and studio revenue remain private"): the
player sees the **stage** (Warning/Distress/etc.) and a small sourced reason set once a public-disclosure
threshold is crossed, never the rival's raw cash, loan terms, or exact obligations
(`talent-settlement-events.md` §3.1, "Loan default — rival's own" row). This is not a new rule; it is
the existing public/private boundary applied to a new fact type.

**How many warning stages are useful:** three pre-terminal escalation stages (Warning, Distress, Severe
Distress) plus one bounded rescue, not the two-stage norm most comparators ship (`comp-bankruptcy-loans.md`
§2.2: "two-stage warn→fail is the norm"). The extra stage is justified specifically by §7's population
math: with only 9 rival identities ever minted, a failure law tuned like a disposable-company tycoon game
(GearCity's un-tuned 6-consecutive-negative-month default, Software Inc.'s same-day $0 trigger) would be
far too aggressive for a cast the game can never replenish.

**How long recovery should remain possible:** unlimited in principle before Severe Distress — there is no
clock on curing Warning or Distress, matching P15-PACKAGE §12.3's "a single negative-cash week cannot skip
directly to dormancy" extended one step further ("a warning/distress rung cannot skip directly to closure
either," `talent-settlement-events.md` §2.8). Exactly one bounded, non-repeating 13-week window once
Insolvency opens — GDT's forced one-shot bailout is rejected as a *mandatory* mechanic, but its *shape*
(one honest chance, not infinite) is right for the rescue window's boundedness.

---

## 4. Bankruptcy economics paper scenarios

All scenarios use one illustrative rival, **"Marigold Motion Pictures"** (real starting data: capital
$24,000,000, `reserveWeeks` 15, `negativeScale` 1.05 — `hollywoodStartingData.ts:27-28`), with a
**PROVISIONAL weekly fixed burn of $57,000** (payroll ≈ $20,000 for an 8-person roster + `OVERHEAD_BASE`
$15,000 + `OVERHEAD_PER_EMPLOYEE`×8 = $12,000 + facility opex ≈ $10,000, anchored to the code's own
OVERHEAD/soundstage-opex constants but with an authored, hypothetical headcount/salary split — no claim is
made that this is the sim's actual output). `operatingReserve` = $57,000 × 15 = **$855,000**. Loan
payments below reuse `loans.md`'s own amortization formula, recomputed independently and cross-checked to
the cent against its published figures.

### 4.1 Scenario 1 — profitable studio with temporary negative Cash (should NOT trigger)

| Week | Cash | Event | Stage |
|---|---|---|---|
| 400 | $600,000 | below reserve; new commitments already blocked (existing law) | Healthy |
| 401–408 | $600,000 → $144,000 | ordinary $57,000/wk burn, no release yet | Healthy |
| 409–411 | $144,000 → **−$187,000** | a scheduled signing bonus + burn dips cash negative for 3 weeks | Healthy (single-cause, well under the 8-week distress-interest sustain and the 4-week Warning floor) |
| 412 | **+$2,140,000** | opening-week Studio Revenue at 52% blended share settles | Healthy |

**Result:** never crosses Warning. This is the direct demonstration Direction D asks for: "one bad movie
must not bankrupt a studio," and a brief negative-cash dip with a known, near-term recovery cause is
exactly what the 4-consecutive-week and 8-week thresholds are sized to absorb.

### 4.2 Scenario 2 — strong assets but a large loan payment due (should NOT trigger)

Studio carries a $6,000,000 facility mortgage (8%/10yr, weekly payment **$16,771**, computed this pass —
matches `loans.md`'s formula). Total weekly obligation $57,000 + $16,771 = **$73,771**. Cash is
$2,000,000 (2.3× reserve). Trailing surplus $2,400,000/yr against annual debt service $872,101 gives
coverage **2.75×** — inside Watch band (3–4×… actually just under, so technically **below** the 3× floor
per `loans.md` §3.5's Good/Watch bands, meaning this studio is already credit-Watch, not Good). The
instalment is paid on schedule every week shown.

| Week | Cash before debit | Obligation | Cash after | Covenant status | Stage |
|---|---|---|---|---|---|
| 100 | $2,000,000 | $73,771 | $1,926,229 | coverage 2.75×, below 3× floor → **8-week cure clock starts** | Warning (covenant, not missed payment) |
| 101–107 | declining ~$74k/wk | $73,771/wk | … | cure clock running | Warning |
| 108 | a strong per-quarter release lifts trailing surplus to $2,700,000/yr | — | coverage now 3.10× | **cured** | back to Healthy |

**Result:** a large *absolute* obligation, paid every week, is not itself distress — it is the *ratio* to
surplus that matters, and here it self-cures within the 8-week window without ever missing a payment.
This isolates the covenant-breach path from the missed-instalment path, per `loans.md` §3.7's two
independent triggers.

### 4.3 Scenario 3 — heavily leveraged but profitable (Warning via covenant, never Distress)

Debt $8,000,000 (8%/10yr, weekly **$22,362**, annual debt service $1,162,802) against trailing surplus
$1,600,000/yr: coverage **1.38×**, well below the 3× floor — a genuine, sustained covenant breach, not a
one-quarter dip. Cash flow is nonetheless positive every week (revenue exceeds the weekly obligation by a
comfortable margin in absolute terms) and every instalment is paid on time throughout.

| Metric | Value |
|---|---|
| Leverage (debt ÷ surplus) | 5.0× (cap is 3×: **also breached**) |
| Coverage | 1.38× (floor is 3×: **breached**) |
| Missed instalments in any 13-week window | **0** |
| Book Net Worth | negative (per §0.2, **not itself a trigger**) |

**Recommended stage: Warning, indefinitely, until surplus recovers or the studio deleverages** — not
Distress, and never Severe Distress, because the missed-instalment counter never advances. This is the
scenario that motivated the §0.2 reconciliation: a studio can sit here for years, fully current, fully
profitable in cash terms, "heavily leveraged" only on a balance-sheet ratio. New borrowing is refused
(both caps breached) but nothing forces escalation past Warning while payments continue. This matches
`comp-bankruptcy-loans.md` §1.7 (OpenTTD): "the counter advances only while `money − loan < −maxLoan`…
negative cash alone is not distress," generalized here to "leverage alone is not distress."

### 4.4 Scenario 4 — positive Cash but liabilities > assets (tests §0.2 directly)

Cash $400,000 (below reserve, new commitments blocked); Book Net Worth = cash $400,000 + book-after-
salvage facility/set value $3,000,000 − outstanding facility debt $8,000,000 = **−$4,600,000**, sustained
for 40+ weeks while every instalment is paid on schedule and cash slowly rises as the loan amortizes.

| Week | Cash | Book Net Worth | Missed instalments | Stage (this report's rule) | Stage (`player-failure.md`'s original rule) |
|---|---|---|---|---|---|
| 200 | $400,000 | −$4,600,000 | 0 | Warning (cash < 8wk fixed costs) | Warning |
| 226 (26wk later) | $520,000 | −$4,350,000 | 0 | **still Warning** | would cross into **Severe Distress** under the dropped net-worth disjunct |
| 260 | $700,000 | −$3,900,000 | 0 | Warning, improving | Severe Distress (per dropped rule) |

**Result:** this is the concrete case where the two sibling reports diverge in outcome, not just in
stated rule — a studio that is slowly deleveraging and current on everything would be misclassified as
Severe Distress under `player-failure.md`'s literal table. This report's correction (§0.2) keeps it at
Warning, which is the outcome both the "one bad movie" law and Direction F's own borrowing incentive
require.

### 4.5 Scenario 5 — unable to meet payroll/debt payment (a true missed instalment)

Total weekly obligation $57,000 (fixed) + $11,788 (a Rescue-tier loan from an earlier distress episode,
14% = 6% base + 8pt Impaired spread, $1,500,000/3yr — matches `loans.md` §5.2 exactly) = **$68,788**.
Revenue collapses to $30,000 for the week.

| Week | Cash before | Revenue | Fixed debit (unconditional) | Loan instalment | Cash after | Instalment status | Stage |
|---|---|---|---|---|---|---|---|
| 500 | $50,000 | $30,000 | −$57,000 | **missed** | −$57,000 | 1st miss | Distress |
| 505 | −$40,000 | $65,000 | −$57,000 | paid | −$32,000 | cured (caught up) | Distress |
| 508 | −$32,000 | $20,000 | −$57,000 | **missed** | −$69,000 | 2nd miss (window) | Distress |
| 511 | −$69,000 | $25,000 | −$57,000 | **missed** | −$101,000 | 3rd miss (window) | Distress |
| 512 | −$101,000 | $22,000 | −$57,000 | **missed** | −$136,000 | **4th miss within 13 weeks (wks 500–512)** | **Event of Default → Insolvency opens** |

**Result:** exactly the design case — four discrete missed instalments inside one rolling quarter, not
one bad week, before the ladder's teeth engage. Fixed costs debit unconditionally throughout (existing
law); only the loan instalment is ever recorded as "missed," because that is the one obligation this
design gives a lender-facing legal consequence.

### 4.6 Scenario 6 — next release could rescue it (money-in-flight is not a miss)

Same studio, week 600, obligation $68,788 due, cash $40,000 — on its face identical to Scenario 5's
trigger condition. But this studio has a film **already released**, in week 3 of its 6-week theatrical
run, with $2,500,000 of `pipelineRunRevenue` already scheduled to settle within 2 weeks
(`code-finance.md` §3.2 — this selector is already shipped).

**Rule (this report's recommendation, closing the Hollywood Animal/GDT "money-in-flight" exploit named in
`comp-bankruptcy-loans.md` §2.4 item 7):** an instalment is recorded as truly missed only if cash **plus**
already-scheduled receipts due within the current rolling window is insufficient to cover it. Here it is
sufficient — the instalment is **deferred, not missed**, and clears automatically when the run settles two
weeks later. **This bridging privilege may be used at most once per rolling 13-week window** per studio,
so it cannot be chained into permanent deferral by always pointing at a hypothetical future release —
only a receipt that is *already* scheduled (a run in progress, not a hoped-for greenlight) qualifies.

| Week | Cash | Obligation | Scheduled receipt (in-window) | Instalment status | Stage |
|---|---|---|---|---|---|
| 600 | $40,000 | $68,788 | $2,500,000 due in 2 wks | **deferred (not missed)** | Distress, unchanged |
| 602 | $2,540,000 | $68,788 (+ deferred amount) | settled | paid in full | Distress → cure clock advances toward Healthy |

### 4.7 Scenario 7 — repeatedly refinancing

A $2,000,000 interest-only bullet rolled at 2-year maturities (`loans.md` §5.3 already computes the total
interest cost of this exact chain — $1,270,000 over three cycles, 63.5% of principal, principal never
retired). This report's addition is the **ladder interaction**, not the interest cost:

| Refinance | Credit grade after | Ladder effect | Public disclosure |
|---|---|---|---|
| 1st (year 2) | Good → Watch (one refinance is ordinary) | none — refinancing itself is not a default | none (private) |
| 2nd (year 4) | Watch (persists) | none on the corporate ladder | ATTENTION per §3: "credit position weakening" (per `talent-settlement-events.md`'s tiering, generalized) |
| 3rd attempt (year 6) | **Impaired** (repeated rolls exhaust the Watch band) | `loans.md` §3.8: refinancing is allowed only from Stable — **refused** | — |
| Consequence of refusal | the $2,000,000 balloon is now due in full | studio cannot pay from cash → the **entire principal** is one missed obligation, not a partial instalment — immediate Event of Default, no 4-miss count needed | Severe Distress → Insolvency same week |

**Result:** this is the concrete, arithmetic reason `loans.md` §2 rejects the bullet as a standing product
and confines it to the Rescue tier's interior mechanics only — a bullet's balloon is a single point of
total failure, structurally more dangerous to the ladder than an amortizing loan's smooth weekly exposure.

### 4.8 Scenario 8 — terminal decline (full ladder traverse, into settlement)

One continuous illustrative history for Marigold Motion Pictures, PROVISIONAL throughout:

| Week (year) | Cash / fact | Stage | Remedy attempted (P12 policy, deterministic) |
|---|---|---|---|
| 0–2,999 (1920–1977) | ordinary operation, several Scenario-1-style dips, all recovered | Healthy | — |
| 3,000 (1978) | two underperforming releases in a row; cash < 8wk fixed costs, 4 straight constrained weeks | **Warning** | dormancy on one uncommitted screenplay |
| 3,050–3,063 | `severe`-equivalent sustained 13 weeks | **Distress** | releases one contracted craft role (P15-PACKAGE §16 remedy family: "reduce future obligations") |
| 3,076 | 4th missed loan instalment inside a 13-week window | **Severe distress / Event of Default** | acceleration; full loan balance now due |
| 3,076–3,089 | Insolvency opens, 13-week bounded window | **Insolvency** | P12 policy draws a Rescue loan (qualifies: positive-if-thin trailing surplus, collateral intact); attempts one more, cheap film |
| 3,089 | best-case cheap-film outcome still nets to a loss (reusing the D-16 lab's own arithmetically-refuted "cheap film as rescue tool" finding, `player-failure.md` §1: P(profit)=0 exactly at the equivalent distressed state) — no cure achieved | **Bankruptcy (terminal)** | — |
| 3,089 (same week) | settlement commits (§6) | Settlement → Auction → Archived | — |

This traverse deliberately reuses `player-failure.md`'s own D-16 lab citation for the player side —
because the pre-terminal economic law is symmetric (§17), the same "cheap film does not actually rescue a
genuinely distressed studio" finding applies to a rival's Insolvency-stage remedy attempt without needing
independent re-derivation.

---

## 5. Recovery actions for a rival — evaluation delta from `loans.md`/`player-failure.md`

`loans.md` §2 and `player-failure.md` §4 already evaluate every remedy (release talent, let contracts
expire, demolish/strike, loans, dormancy) for exploitability and dignity; nothing here repeats that. The
rival-specific delta is **selection mechanism, not remedy menu**: P15-PACKAGE §16 requires "the same
eligibility predicate, conserved cost, timing, and state effect for player and rival studios; P12 rival
policy chooses from that same legal set" — so a rival's `decide()` function needs one new deterministic
branch per remedy family, each gated by the exact published covenant a player would face, with **no
hidden subsidy** (binding law 9): a rival never gets a cheaper loan, a longer cure window, or a remedy the
player could not also take in the identical state. The deterministic policy is a fixed *selection order*
over the one rulebook (try dormancy on uncommitted work first, then release the least valuable contract,
then the Rescue loan if it qualifies) — not a second, separately-tuned eligibility test.

---

## 6. Settlement sequence for a closed rival

Adopted wholesale from `talent-settlement-events.md` §2 (contracts end at settlement week via `expiry` or
new-reason `employerClosed`; wages already earned are paid by construction; unexpired guarantees written
to zero; greenlit productions/active runs complete under estate; undeveloped screenplays cancelled; new
receipts `studioClosed`/`projectCancelled`; new root `studioOperatingState`). **This report's one addition**:
the `studioClosed` receipt schema should carry one more additive field, `triggerSummary:
'missed-instalment' | 'covenant-breach' | 'uncured-distress'`, sourced directly from which gate in §2
actually fired — this is what lets the eventual public notice (§6 below) and the 2040 Legacy dossier
(Direction J: "every factual claim traces to recorded evidence") name *why* a specific studio failed
rather than only *that* it failed, at zero cost beyond one enum field on an already-new receipt kind.

**Assets and the auction question, at a high level (PROVISIONAL paper design, not a build):** rivals have
no `PlacedFacility` records with transferable identity or price — only abstract `StudioOperations`
capacity (`hollywood.ts:98-105`; confirmed by `talent-settlement-events.md` §3.1's "studio auction" row).
There is therefore **nothing literal to auction today**. The high-level shape this report proposes for
when Direction I's acquisition system exists (explicitly deferred, not designed here):

1. **Frozen lot** — at the settlement week, the closed studio's capacity numbers and remaining collateral
   value (once Direction C's Book Net Worth ships) are fixed as of that week; nothing accrues further.
2. **Merit-ordered offers** — eligible bidders (other active rivals, via the same deterministic policy
   that governs every other rival decision; the player, if and when Direction I's mechanism exists) are
   ranked by a simple, symmetric, published rule (e.g., headroom under the bidder's *own* leverage cap,
   `loans.md` §3.4) — not a bidding-war UI. GearCity's shipped "player gets first pick, then AI companies
   checked in performance order, unsold liquidates" (`comp-bankruptcy-loans.md` §1.5c) is the cleanest
   shipped precedent for this exact shape.
3. **Unsold → archived** — with only 9 rival identities ever minted (§7), "no eligible bidder" is a
   realistic, not edge-case, outcome late in the campaign. Direction G already forbids spawning a
   replacement; an unsold lot is simply written off, and the studio's record moves to permanently
   archived, browsable history — never deleted, never recycled (binding law 6).

**Until Direction I authorizes an acquisition mechanic, "assets entering settlement" is a bookkeeping
label, not a marketplace** — matching `talent-settlement-events.md`'s own recommendation for the auction
notice's wording, and consistent with `ma-auction.md`'s ownership of the actual bid/transfer mechanics
(this section proposes the shape it should someday plug into, not the mechanics themselves).

---

## 7. A structural finding: population survivorship, and the "report, don't float" instruction

Direction G is explicit: "NO artificial floor merely to keep the count high; report a severe failure if
found rather than silently adding a floor." This section is that report, sized to what this analysis
actually controls (the trigger constants), and it hands the fuller consolidation analysis to
`consolidation.md` §9–§13, which independently reaches the same operative conclusion this report reaches
from the opposite direction: **failure rate must emerge from the authored per-studio `reserveWeeks` /
`negativeScale` spread under one symmetric law, never from a target headcount** — `consolidation.md`'s own
words, and this report's design (§2–§6) is built to deliver exactly that: no rival-only leniency, no
player-only leniency, no calendar-driven "kill one every N years" rule anywhere in §2's triggers.

The reason the calibration matters more here than in almost any comparator is the fixed cast: **exactly 9
rival identities are ever minted, the last in 1969, with 71 more simulated years (to 2040) in which none
can be replaced.** A rough, explicitly illustrative order-of-magnitude check (9 rivals, 120 simulated
years each, independent constant annual hazard of ever crossing into terminal Bankruptcy, `9×(1−p)^120`):

| Annual terminal hazard | Expected survivors of 9, by 2040 (120yr) | Expected survivors, last-entrant-to-2040 (71yr) |
|---|---|---|
| 0.1% | 7.98 | 8.38 |
| 0.2% | 7.08 | 7.81 |
| 0.5% | 4.93 | 6.30 |
| 1.0% | 2.69 | 4.41 |
| 2.0% | 0.80 | 2.14 |
| 5.0% | 0.02 | 0.24 |

(This simplification treats all 9 rivals as exposed for the full span, which understates survivors for
the five later entrants and so is conservative in the direction that matters.) **The practical
implication for whoever tunes §2's constants: an annual per-rival terminal hazard anywhere near 2% or
above is very likely to empty Hollywood well before 2040 — a severe failure by Direction G's own
standard — while a hazard in the roughly 0.2%–1% band leaves a plausible, still-competitive 3–8 survivor
field, consistent with Direction G's own "consolidation is acceptable/desirable emergent history."** This
is not a target to hit by fiat (that would be exactly the forbidden "tuned to a target count"); it is the
band this report's own §2–§4 constants should be checked against once real playtest data exists, and it
is the single number `consolidation.md`'s otherwise-qualitative §9 finding was missing. No comparator in
the reviewed set operates under this constraint — every one either has disposable, cheaply-replaced
companies (GearCity, Capitalism Lab) or no rival economy at all — so no comparator's default numbers
(GearCity's un-tuned 6-consecutive-negative-month trigger, Software Inc.'s same-day $0 trigger) may be
copied at face value; they would land in the "empties Hollywood" band above.

---

## 8. Package ownership

| Component | Owner | Basis |
|---|---|---|
| Loan ledger, missed-instalment counter, covenant read-model, Book Net Worth selector | **P11** | Unchanged from `loans.md` §7 |
| Trigger hierarchy (§2), warning clocks (§3), remedy-menu orchestration, terminal Bankruptcy event | **P15B** | Extends P15-PACKAGE §12.3; this report's central content |
| Rival deterministic policy branch selecting among the same remedy families (§5) | **P12**, consuming P15B's condition assessment | "P12 rival policy chooses from that same legal set" — P15-PACKAGE §16 |
| Settlement receipts, `employerClosed`, `studioOperatingState` | **P12 registry authority acting inside a P15B-requested transition** | `talent-settlement-events.md` §2.9, unchanged |
| Public notice tiering/disclosure | **P15B**, per `talent-settlement-events.md` §3 | unchanged |
| High-level auction shape (§6) | **Undetermined — new P15D or P16+**, per Direction I's own research | this report proposes only the shape, not the mechanic |
| Population-survivorship calibration target (§7) | **P15B tuning, cross-checked by whoever owns `consolidation.md`'s deliverable** | new finding, no package precedent |

---

## 9. Remaining Owner decisions

1. Approve the §0.2 reconciliation (drop bare negative net worth as an independent Severe-Distress
   trigger) — a correction to `player-failure.md`'s table, not a new design.
2. Approve every PROVISIONAL duration in §2 (4-week Warning floor, 13-week Distress sustain, 4-in-13-week
   default rule, 8-week covenant cure, 13-week rescue window) — shared with `loans.md`/`player-failure.md`,
   one Owner ruling should cover all three reports at once rather than three separate approvals.
2b. Approve the §4.6 "scheduled-receipt bridging, once per 13-week window" rule as the concrete fix for
   the money-in-flight exploit family.
3. Approve or revise the §7 population-survivorship target band (roughly 0.2%–1% annual terminal hazard)
   as an explicit acceptance criterion for whoever calibrates the final constants, separate from and
   feeding `consolidation.md`'s own recommendations.
4. Decide the `studioClosed.triggerSummary` field (§6) — a one-field addition this report proposes but
   does not have standing to add unilaterally to a sibling report's schema.
5. Confirm the high-level auction shape (§6, frozen lot / merit-ordered offers / unsold-archived) as the
   eventual target for Direction I's research, or direct a different shape.

---

## 10. Corrections to prior P15 text

| Prior text | Status | Correction |
|---|---|---|
| `player-failure.md` §2 table: Severe Distress reachable via "book net worth negative for 26 consecutive weeks" | **CORRECTED by this report** | Dropped as an independent trigger; see §0.2. Book Net Worth remains a credit-grade input and a disclosure fact, never a stage-mover. |
| `P13-P15-LONG-RANGE-ROADMAP.md`/`P15-PACKAGE.md` §23: "P12's minimum three active AI rivals" as the recommended entrant-floor law | **SUPERSEDED BY OWNER DIRECTION G**, per `consolidation.md` §11's own finding, reused here since it is the direct predicate for why this report's triggers must not be tuned to preserve a headcount | No floor; §7's population math replaces a floor with a calibration target instead |
| P15-PACKAGE §5.5: rival bankruptcy is an "OPEN QUESTION" in the original | **CONFIRMED, unchanged** | This section is new design with no original-game parity claim, as stated in §1 |
| `comp-bankruptcy-loans.md` original draft's treatment of Football Manager as "transfer/finance context only" | **CORRECTED per the phase1-verify digest**, respected throughout this report | FM24's official page documents a real staged ladder; used as a legitimate comparator in §2's table only for shape, not for its point-deduction specifics (already rejected by `player-failure.md` §4) |
| P15-PACKAGE §16 "Loans, bailouts, investors, forced sales, or acquisition are not implied" | **QUALIFIED / PARTIALLY SUPERSEDED**, consistent with `loans.md` §0 | Direction F authorizes the simple loan law this entire report depends on; the acquisition half remains deferred to Direction I/P16+ (§6) |

---

## 11. Uncertainties

1. Whether the §7 hazard-rate band (0.2%–1%/yr) survives contact with the *actual* reception/box-office
   volatility model once P15A's genre/window pressure ships — this is a pure population sketch, not a
   claim about how often a real simulated release underperforms badly enough to feed it.
2. Whether P12's deterministic remedy-selection order (§5) needs Owner-authored priorities or may be left
   to whichever package implements it, as long as it draws from the identical legal set the player faces.
3. Whether the one-bridging-use-per-window rule (§4.6) is the right anti-exploit shape, or whether a
   different eligible-receipt horizon is better once real release-scheduling data exists.
4. How `studioOperatingState`/`corporateConditionEvents` (talent-settlement-events.md §2.9) should
   represent the *pre-terminal* stages as a running status versus a discrete event log — this report
   assumes a status-plus-history shape but did not receive a ruling to cite.
5. Exact wording for the rival-failure public notice's `triggerSummary` translation into player-facing
   language (§6) — left as a content/writing question, not resolved here.

---

*Word count target 2,500–5,000 met. All numeric scenarios in §4 and §7 are PROVISIONAL/HYPOTHETICAL and
are not tuning proposals. Short quotes throughout are ≤40 words and cite file:line or document:section.
No file outside this analyst's assigned output path was read for writing or modified.*

## Sources

Code: `accepted-592e926/src/core/calendar.ts:3`; `hollywoodStartingData.ts:8-41`; `hollywood.ts:81-105`;
`hollywoodTick.ts:98,126,176,196-200,280-282`; `hollywoodTypes.ts:47-103`; `hollywoodValidation.ts:72`;
`bridge/industry.ts:1`; `code-finance.md` §3.2 (`pipelineRunRevenue`). Phase-1: `comp-bankruptcy-loans.md`
§§0–5 in full (comparator dossiers and synthesis); `orig-rivals.md`/digest correction (original-game
silence on rival failure). Sibling phase-2 reports, read in full before writing: `player-failure.md`,
`loans.md`, `talent-settlement-events.md`; `consolidation.md` §§1, 9–13 (population/consolidation framing,
read for coordination though outside this report's assigned reading list). Authority:
`P15-PACKAGE.md` §§5.5, 11, 12.3, 16, 17, 23, 25; `P13-P15-LONG-RANGE-ROADMAP.md` §19.3.
