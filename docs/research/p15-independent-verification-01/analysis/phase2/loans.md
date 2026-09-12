# P15 Paper Design — Loan / Debt System (Owner Direction F)

**Author role:** independent P15 analyst, READ-ONLY research and paper scenarios. Nothing here is implementation-authorized.
**Date:** 2026-09-11. **Deliverable:** package prompt §7 (loan/debt system) and §8 (loan paper scenarios).
**Primary evidence:** `out/phase1/finance-logic.md` §§3–4 (loan math, covenants, anti-exploit rules), `out/phase1/comp-bankruptcy-loans.md` (18 comparator dossiers), `out/phase1/code-finance.md` (accepted-code finance seams), `out/phase1-verify/_DIGEST.md` (corrections respected throughout — see inline notes), plus direct reads of `accepted-592e926/src/core/{types,tick,economyView,hollywood,hollywoodTypes,hollywoodTick}.ts`.
**Arithmetic:** all worked tables below were recomputed in this pass (`/tmp/loanscen.py`, weekly-amortization recursion, same formula as `finance-logic.md` §3.1) from the principals/rates/terms the prompt specifies, and cross-checked against `finance-logic.md` §3.2's published weekly table. Every dollar figure that is not a direct code constant is labelled **PROVISIONAL**.

---

## 0. Status of the prior prohibition (read this before anything else)

`P11-REQ-041` ("Loans / investors / external financing") is recorded **OWNER-BLOCKED, DEFERRED** in `docs/engineering/P11A-DECISION-AND-REQUIREMENT-REGISTER.md:140`. D-16 R10 ("KEEP THE STUDIO, LOSE CONTROL... no D-17 loans, credit lines... hard bankruptcy") and D-17B's "next charter" clause ("do not introduce financing, loans, bailouts, restructuring or the failure ladder") are both still-written prohibitions (`docs/D-16-OWNER-RULINGS.md:52`; `docs/D-17B-OWNER-RULINGS.md:85-99`). The recap copy still tells the player, verbatim, "No recovery mechanic (loans/financing) exists in the current rules." (`src/core/studioRunRecap.ts:1003`).

**SUPERSEDED BY OWNER DIRECTION.** Direction F (2026-09-11) explicitly authorizes a simple loan system, and Direction E revises the earlier "player never truly fails" ruling that D-16 R10 rested on. This package-level supersession is real and this document treats it as settled. But it is not yet a *line-item* correction to the three documents above — they still read as active law to anyone who opens them next. **Recorded-ruling requirement:** before any implementation charter is written, the Owner (or a delegated engineering ruling under this Owner direction) should add one dated entry to each of `P11A-DECISION-AND-REQUIREMENT-REGISTER.md` (flip REQ-041 from OWNER-BLOCKED to APPROVED-SCOPED, citing this direction), `D-16-OWNER-RULINGS.md` (an addendum noting R10's loan clause is superseded, its "keep the studio, lose control" philosophy otherwise intact), and `D-17B-OWNER-RULINGS.md` (retire the "next charter" prohibition sentence). Until that happens, a builder who has not read the P15 direction and opens only the D-16/D-17B/P11A register will see a live prohibition. This is a paperwork gap, not a design disagreement — flagged here so it is not silently skipped.

---

## 1. What "good" looks like here

The prompt's six evaluation axes, used consistently below:

| Axis | Question |
|---|---|
| **Player understanding** | Can a non-finance player predict the weekly payment and the total cost before committing? |
| **Strategic value** | Does the choice trade off against something real (a rate, a term, a cap), or is it free money? |
| **Exploitability** | Can it be gamed into infinite leverage, a free snowball, or a counter that resets on one good week? |
| **AI/rival compatibility** | Can deterministic P12 policy use the *identical* law with no hidden subsidy (law 9)? |
| **Bankruptcy interaction** | Does a loan default become the *only* legal bridge into the P15B ladder, per the digest's confirmed finding that nothing currently "falls due and goes unpaid" observably? |
| **UI burden** | How many new numbers does the player have to track? |

---

## 2. Candidate products, scored

| # | Product | Comparator precedent | Player understanding | Strategic value | Exploitability | AI compat | Bankruptcy interaction | UI burden | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Fixed-term amortizing** | Cities: Skylines 1 (3 tiers, 5/10/15%), Two Point Hospital (3 tiers, gated), `finance-logic` §3.6 Tier B | HIGH — one weekly number, visible schedule | HIGH — term/rate trade-off is legible | LOW — principal retires every week; nothing to roll | HIGH — a pure formula, same for rivals | Clean — a missed weekly instalment is a discrete fact | LOW — 1 balance, 1 payment | **Adopt as primary product** |
| 2 | **Interest-only / bullet** | Hollywood Animal's underlying credit product; GearCity bonds; Prima's silence on the original | MEDIUM — payment is small and easy to ignore until the balloon | MEDIUM — useful only as a short bridge against a specific release | HIGH — nothing paid down; classic rollover chain (Scenario 3 below) | HIGH in principle, but the exploit surface is real for both | Balloon-at-maturity is a legible single event, but chained rollovers hide the true exposure | LOW per loan, but a maturity calendar item accumulates | **Reject as a standing product; keep only as the mechanism inside Tier D (below), never player-selectable on demand** |
| 3 | **Revolving credit line** | OpenTTD (interest on negative cash "to prevent cheating or abuse"), RCT1/2 (adjustable while negative) | MEDIUM — one number, but it moves every week and invites "max it day one" | LOW as a standing product here — see §3.2 for why the *lesson* is adopted without the *product* | HIGH — "cheap max loan at start" is the single most repeated comparator exploit (OpenTTD, RCT) | HIGH mechanically, but a full revolver adds a second live balance to keep symmetric | Weak — a revolver rarely reaches an Event of Default in the comparator set (players discuss size, "never default") | MEDIUM — a second running balance | **Reject as a v1 product; adopt its core lesson (interest must apply to negative cash) as a rule, not a product — see §3.2** |
| 4 | **Several standardized tiers (A/B/C/D)** | `finance-logic` §3.6; Software Inc.'s quick-loan/bank-loan split; Capitalism Lab's per-bank ladder | MEDIUM — more tiers = more to learn | HIGH — matches purpose to instrument | MEDIUM — more moving parts, more surface | HIGH if all deterministic | Diffuse — four products means four default paths to reconcile | HIGH — this is exactly what the prompt says to avoid | **Reject the full four-tier menu for v1; keep the ownership idea (facility vs. rescue) but collapse to two products — see §3** |
| 5a | Hollywood Animal researched credit ladder | Weappy EA, 2025– | MEDIUM — "earned" tiers feel good | MEDIUM | The 365-day cooldown was the strongest "trap" complaint in the whole comparator set (`the_humourist`, COMMUNITY) | N/A (single-player research gate) | N/A | Adds a tech-tree dependency P15 does not own | **Adopt the gating-by-scale idea; reject the cooldown and the Financial-Department research building (P13 territory, not P15's to add)** |
| 5b | Cities: Skylines fixed tiers | Paradox wiki, OFFICIAL | HIGH | HIGH | LOW | N/A (no AI) | N/A | LOW | **Adopt the shape (fixed tiers unlocked by scale)** |
| 5c | OpenTTD revolver + interest on negative cash | shipped code `96651d3` | HIGH (one number) | MEDIUM | The interest-on-negative-cash rule is the only shipped fix in the whole set for "overdraft beats borrowing" | Symmetric by code | The counter (`money − loan < −maxLoan` for N months, resetting) is the closest shipped analogue to a distress trigger | LOW | **Adopt the "charge for sustained negative cash" lesson; do not build the standing revolver — see §3.2** |
| 5d | GearCity: line + amortizing loans + bonds + IPO | official wiki, HIGH | LOW — four instruments, undisclosed rate formula ("factor into," per digest correction) | HIGH in principle | Bond roll-over is *explicitly sanctioned* by the game and is a Ponzi-lite; buying a bankrupt rival for $1 plus its debt is a documented trap | Yes, symmetric | Best-documented staged memo with inline remedies in the set | Highest of any comparator | **Reject the full stack — this is the prompt's own instruction and the evidence agrees: too much machinery for a film studio, and the bond/IPO half pulls straight into P16+'s debt/equity/investor domain** |

**Note on Football Manager and Blockbuster Inc.** — neither is a *loan product* comparator (FM's loans are board-owned and opaque to the manager; Blockbuster Inc.'s loan mechanics are not documented beyond "instant payoff" and "borrow while negative"). Both matter for §6 (default → distress bridge) instead, and are discussed there. The digest's correction that FM24's *official* feature page (not just community text) documents a staged ladder — negative-transfer-budget notice → board takes control and sells players → administration with net-debt/P&L graphs and withdrawn transfer funds → players'-association wage embargo → a CVA letting the club keep operating while it repays creditors — is the strongest OFFICIAL-tier comparator in the whole set for "warn → typed remedy → escalation → still operating," and it independently confirms the shape `finance-logic` already recommends.

---

## 3. Recommended design — two products, one rule change

Per the prompt's "keep it SIMPLE (one or two products max)" instruction, and matching what the evidence converges on:

### 3.1 Product 1 — "Studio Loan" (the only loan a healthy studio ever sees)

A single fixed-term amortizing product, tiered by scale, replacing `finance-logic`'s three healthy-use tiers (A/B/C) with **one** menu item so the player learns one shape:

| Field | Rule | Basis |
|---|---|---|
| Size cap | ≤ 3× trailing-52-week operating surplus (see §3.4) **and** ≤ 60% of book-after-salvage collateral value, whichever is smaller | `finance-logic` §4.3 rules 1–2 |
| Term | authored choice at signing: 5 or 10 years (260/520 weeks) | matches the published weekly table (`finance-logic` §3.2) exactly, so the player-facing numbers never need re-deriving |
| Rate | base (era-authored) + spread by credit grade (§3.5) | `finance-logic` §3.6, §5.3 |
| Repayment | weekly, automatic, unconditional once drawn (same debit pattern as payroll/overhead) | matches `tick.ts:912-953`'s existing unconditional-debit precedent |
| Early repayment | allowed, no penalty | Planet Zoo precedent (only comparator that explicitly rewards this) |
| Eligibility | ≥ 52 weeks of studio history, no current default, positive trailing surplus | `finance-logic` §3.6 Tier A/B qualification, tightened to one gate |
| Security | the studio's own facility/set book, valued at *book-after-salvage* (the existing 50%/35% refund fractions), never at cost | `finance-logic` §4.3 rule 1; code fact: `constructionCapex`/`setCapex` ledger rows are the only persisted purchase price (`code-finance.md` §2.6) |

**Why one product covers both the facility-mortgage and the slate-funding use case named in the prompt:** the accepted code has no reason to distinguish "borrowed to build a stage" from "borrowed to fund a slate" — cash is fungible (`studio.cash` is the only money field, `types.ts:291-296`). A single uncommitted-purpose loan, sized against surplus and collateral, is honest about that fungibility instead of pretending the game tracks use-of-proceeds it does not track.

### 3.2 The "overdraft instead of borrow" rule — a rule change, not a second revolver

OpenTTD's one durable lesson (§2, row 5c) is that a silent, free overdraft always beats a priced loan; it charges interest on negative cash specifically to close that hole. Building a full second revolving-credit product to capture this lesson would violate the "one or two products" instruction and add a second live balance the player must track forever. Instead:

**Rule:** once cash has been continuously negative for **8 consecutive weeks** (the same window `finance-logic` §3.9 already proposes for a covenant cure, chosen so short, ordinary dips are never touched), a **distress interest** surcharge begins accruing on the negative balance at the same *base* rate used for Tier-1 loans (no spread — this is not a product being sold, it is the honest cost of the "loan" the studio already has by construction). It is charged the same way overhead is charged: unconditionally, weekly, added to the negative balance.

This does two things at once: (a) it makes the *existing, already-shipped* uncapped overdraft (`employment.ts:70-85`; confirmed absorbing state, D-16 lab) cost something once it is sustained, so a player who deliberately avoids the Studio Loan to dodge its interest no longer comes out ahead; (b) it gives the P15B ladder a second, independent input (**sustained negative cash**, distinct from **missed loan instalment**) without inventing a new instrument. It does **not** change the "cash < 0 alone is not a Warning trigger" law (annex C.3) — the trigger stays the *8-week sustain*, not the sign.

**Decision on "charge interest on negative cash": yes, but only after an 8-week sustain, and at the plain base rate, never a punitive multiple** — this is the one place this document departs from a literal reading of OpenTTD (which charges from week one); the departure is deliberate, to preserve the existing "a single bad week is fine" design law.

### 3.3 Product 2 — "Rescue" loan (Tier D, distress-only, not player-selectable)

Available only as one of the **typed remedy capabilities** the P15B ladder already requires (`P15-PACKAGE.md` §16: "Distress must have at least two legitimate recovery routes... Each route belongs to a typed remedy capability family with the same eligibility predicate, conserved cost, timing, and state effect for player and rival studios"). It is small, short (≤3 years), carries the heaviest spread of anything in this design, and a studio cannot walk in and ask for it — the P15B condition machine offers it, the same way GearCity's "Bankrupt Warning!" memo offers `Cut Funding`/`Cut Production` inline (`comp-bankruptcy-loans.md` §1.5b). Blockbuster Inc.'s shipped "allow getting loans even if company money is below 0" (1.7.16.1 patch note) is direct comparator precedent that a rescue instrument being available exactly when ordinary borrowing would be refused is a real, shipped pattern, not a novel idea.

This is Direction F's mandated "at least two legitimate recovery routes" satisfied structurally: Route 1 is the Studio Loan taken *before* trouble (prevention); Route 2 is Rescue taken *during* Distress (cure). Both use the identical amortizing mechanic from §3.1 — same formula, different eligibility gate and rate.

**Two products total**, both using the one payment formula in `finance-logic.md` §3.1, satisfying the "keep it simple" instruction while still closing the OpenTTD exploit and giving the ladder a working remedy.

### 3.4 Borrowing limit

`finance-logic` §4.3's two-cap design is adopted, with one refinement this pass's arithmetic surfaces (§4 below): **total debt ≤ 3× trailing-52-week operating surplus, AND interest coverage (surplus ÷ annual debt service) ≥ 3×, whichever is more restrictive** — plus collateral at book-after-salvage (never at cost) as a hard ceiling underneath both. Surplus must be positive; a studio with none qualifies for nothing (matching `finance-logic`'s own fallback). All limits are stated as multiples of a trailing observed quantity, never a dollar figure, so they survive `era.costScale` moving between 1920 and 2040 without a lookup table (`finance-logic` §5.3).

### 3.5 Interest-rate logic

**Base + spread**, base authored per era band (an OWNER DECISION §9 below), spread set by a three-band deterministic **credit grade** (Good / Watch / Impaired) computed from: weeks since last missed payment (history), trailing surplus and existing debt service (capacity), and book collateral (collateral) — the "5 Cs" minus "conditions" (already captured by the era base) and "character" folded into history (`finance-logic` §3.8). No hidden dice: the grade is a pure function of numbers the ledger already has.

| Grade | Spread over base | Who qualifies |
|---|---|---|
| Good | +2 pts | no missed instalment ever, coverage ≥ 4× |
| Watch | +4 pts | one cured default in the last 104 weeks, or coverage 3–4× |
| Impaired | +8 pts (Rescue tier only — a studio here cannot draw a Studio Loan at all) | currently in or recently exited Distress |

### 3.6 Repayment style

Weekly, level-payment amortizing (§3.1's table), for both products. Rejects annual payments outright — `finance-logic` §3.3 already shows annual instalments invite save-scumming around one giant debit a week a year, and weekly instalments read exactly like the payroll debit the player already understands.

### 3.7 Default rule (the bridge into distress)

Adopting `finance-logic` §3.9 with one addition from Prison Architect's shipped two-condition trigger (`comp-bankruptcy-loans.md` §1.12: "negative bank balance **and** negative cash-flow"), which matches the digest's correction that *today* payroll/overhead/opex already fall due weekly — the missing piece is only that nothing is ever recorded as **missed**:

- **Missed instalment:** a loan payment not covered by cash in its due week is *missed*, recorded, and — new — recorded as a fact (not silently absorbed into the overdraft, unlike ordinary overhead).
- **Event of Default:** **4 missed weekly instalments within a rolling 13-week window** (one quarter). The window ages out entries older than 13 weeks, but a **cure requires catching up every currently-missed instalment**, not just the most recent one — this is the direct fix for Mad Games Tycoon 2's "counter resets on one good month" exploit (`comp-bankruptcy-loans.md` §1.3g, §2.4 item 1).
- **Covenant breach:** coverage or leverage cap broken → 8-week cure window, no new borrowing while breached (`finance-logic` §3.9).
- **Cross-default:** default on either product defaults both, and blocks new Studio Loan draws — simple, and it prevents the "juggle many small loans" pattern (§4.3 rule 4).
- **Acceleration:** an uncured Event of Default makes the full balance due, adds default interest, and — this is the load-bearing design decision the prompt asks for — **is the only event that may hand the P15B condition machine a "Warning" trigger sourced from finance**. Sustained negative cash (§3.2) is the second, independent trigger. Nothing else in finance may originate a Warning.

### 3.8 Refinancing rule

Allowed only from **Stable** (not Warning/Distress — refinancing a defaulting loan is not refinancing, it is Rescue), only into a tier the studio currently qualifies for, fee 1–2% of principal rising with each successive refinance of the *same* obligation (Scenario 3 below shows why the fee must rise, not stay flat).

---

## 4. A consistency finding the arithmetic surfaces

Running the numbers exposes something `finance-logic` §4.2 states qualitatively ("two different caps are needed") but did not quantify: at an 8%/10-year Studio Loan, the leverage cap (debt ≤ 3× surplus) and the coverage floor (coverage ≥ 3×) are **not simultaneously satisfiable** — coverage binds first.

With trailing surplus $1,500,000: the 3×-leverage ceiling allows $4,500,000 of debt, whose annual debt service (scaled from the $5M/8%/10yr row, `finance-logic` §3.2) is **≈$654,000**, giving coverage of only **2.29×** — already below the 3× floor. Solving the other direction, a studio can only reach 3× coverage at **≈2.29× leverage** (**$3,441,760** of debt against $1,500,000 surplus) for this rate/term combination. **Recommendation:** state the rule as "the *more restrictive* of the two caps governs," as already worded in §3.4 — do not present "3× leverage" to the player as if it is usually reachable; at current-tuning rates it functions as a backstop that the coverage floor reaches first. This is exactly the intended conservative behavior (two independent brakes, `finance-logic` §4.2), just worth stating precisely rather than implying both caps bind at the same point.

---

## 5. Paper scenarios (package prompt §8)

All principal/rate/term combinations below reuse `finance-logic.md` §3.2's published weekly-amortizing table (recomputed here for annual rollups and comparison cases). **Every dollar figure is PROVISIONAL and hypothetical** — none is derived from the accepted sim's actual reception/greenlight math, only from the loan formula and the code-confirmed scale anchors (`INITIAL_CASH` 20M, soundstage capex 2.4M/9,000wk Opex, `code-finance.md` §2.3).

### 5.1 Scenario A — healthy investment borrowing

Borrow **$5,000,000** (Studio Loan, 8%, 10-year) to build one Standard Soundstage (**$2,400,000** capex, **$9,000/week** Opex — code fact) and fund a slate with the remaining **$2,600,000**.

| Year | Balance, year end | Interest paid this year | Principal paid this year |
|---|---|---|---|
| 1 | $4,660,095 | $386,846 | $339,905 |
| 2 | $4,291,903 | $358,559 | $368,192 |
| 3 | $3,893,070 | $327,918 | $398,833 |
| 5 | $2,993,069 | $258,774 | $467,977 |
| 8 | $1,342,232 | $131,945 | $594,806 |
| 10 | $0 | $28,826 | $697,926 |

Weekly payment **$13,976**; annual debt service **$726,751** (÷52 = weekly figure, matches `finance-logic` §3.2 exactly). Add the new stage's Opex: **$468,000/yr**. Total annual carrying cost of the investment: **$1,194,751/yr — PROVISIONAL**.

**Payback (PROVISIONAL, illustrative only):** assume the added capacity enables averaging one extra film release per year contributing **$2,000,000/yr** net Studio Revenue (an authored placeholder, not a sim-derived figure — no claim is made about what the reception model would actually produce). Net effect: **+$805,249/yr** from the first full year of operation once the stage is producing. **The design point, not the specific number:** a facility-scale loan's carrying cost (debt service + the asset's own Opex) is a single, stable, predictable weekly number the player can compare directly against what the capacity is expected to earn — this is the legibility the fixed-tier product is chosen for (§2, row 1).

### 5.2 Scenario B — emergency borrowing

Cash is **−$1,000,000**; payroll is **$60,000/week**. Under current code this studio already cannot make *any* voluntary commitment — `canAfford` refuses every positive-cost action once cash is negative (digest-corrected reading of `employment.ts:79-81`; the earlier phase-1 claim that "nothing is locked" below zero was itself corrected in verification and is not repeated here). This is exactly the state the Rescue tier (§3.3) exists for.

| | Rescue tier (Distress, 14% = base 6% + 8pt spread), $1,500,000, 3yr | If it had been drawn *early* instead, as a Studio Loan (8%), same size/term |
|---|---|---|
| Weekly payment | $11,788 | $10,823 |
| Total interest, 3yr | $338,974 | $188,341 |
| Interest ÷ principal | 22.6% | 12.6% |

**The gap ($150,633 more, PROVISIONAL) is the price of waiting.** This reproduces Hollywood Animal's "decision created" finding (`comp-bankruptcy-loans.md` §1.1d) mechanically rather than narratively: borrowing early at Good/Watch grade is always cheaper than the same size loan drawn from Impaired grade during Distress, and the gap is large enough to matter without needing a cooldown or a hard trap.

**Does $1.5M solve it?** Cash moves from −$1,000,000 to +$500,000 at the draw, but the new **$11,788/week** obligation stacks on top of the **$60,000/week** payroll that was already unaffordable — the Rescue draw buys time and a cure window, not a fix. The studio still needs a real remedy (releasing talent, completing a conserved release, or a second Rescue cycle if it re-qualifies) inside the cure window, matching Direction E's "meaningful warning and recovery first," not a one-shot save button.

### 5.3 Scenario C — repeated refinancing (roll a bullet 3×)

A **$2,000,000** interest-only bullet, 2-year terms, rolled three times (6 years total), with the refinancing fee rising 1.0% → 1.5% → 2.0% and the rate rising 8% → 10% → 12% (an authored credit-grade brake, per §3.8):

| Cycle | Rate | Weekly interest | 2-yr interest | Refinance fee into next cycle |
|---|---|---|---|---|
| 1 | 8% | $3,077 | $320,000 | 1.5% × $2,000,000 = $30,000 |
| 2 | 10% | $3,846 | $400,000 | 2.0% × $2,000,000 = $40,000 |
| 3 | 12% | $4,615 | $480,000 | — (matures) |

**Total interest over 6 years: $1,200,000. Total fees: $70,000. Grand total: $1,270,000 (63.5% of principal) — and the studio still owes the full $2,000,000 principal at the end, because a bullet never amortizes.** Compare a single $2,000,000 amortizing loan at a blended 10% over the same 6 years: weekly payment $8,530, total interest **$661,509**, and **zero** principal remaining at year 6. **The rollover chain costs roughly 1.9× as much and leaves the principal fully outstanding — this is the concrete version of `finance-logic` §3.4's "bullets cost roughly twice the interest of amortizing" claim, plus the compounding effect of a rising refinance fee and rate.** The rising fee/rate brake (§3.8) is what stops "roll it forever": by the third maturity the studio's credit grade (built from missed-payment history and coverage, §3.5) may no longer clear the eligibility gate for a fourth roll, forcing either full repayment from cash or an Event of Default on the balloon — exactly the "brake" the prompt asks the scenario to demonstrate.

### 5.4 Scenario D — overleveraging (coverage collapse)

$20,000,000 total debt (Studio Loan terms, 8%/10yr, weekly payment $55,904, annual debt service **$2,907,005**) against a trailing surplus that erodes over three years — illustrating debt taken on when the cap was satisfied, then outgrown by a collapsing business, not debt taken on in violation of the cap:

| Year | Trailing surplus | Interest coverage (surplus ÷ debt service) | Leverage (debt ÷ surplus) | Covenant status | Ladder consequence (§3.7/§3.2) |
|---|---|---|---|---|---|
| 0 (origination) | $6,666,667 | 2.29× | 3.00× | at the leverage cap; coverage already below the 3× floor (see §4) | loan approved at the binding (coverage) constraint |
| 1 | $3,000,000 | 1.03× | 6.67× | both covenants breached | Warning; 8-week cure, no new borrowing |
| 2 | $1,500,000 | 0.52× | 13.33× | far breached; shortfall **$1,407,005/yr** the studio cannot cover from operations | if 4 of the last 13 weekly instalments are missed while uncured → Event of Default → acceleration → Distress |

**One bad movie does not do this** — it takes a full year of collapsed surplus (year 1) before the covenant is even breached, and a second year of sustained shortfall before a *missed instalment* can accumulate to an Event of Default under the 4-in-13-weeks rule. This is the "sustained inability... under the same economic law" Direction D asks for, arithmetically: the ladder cannot fire on year 0's single origination decision, only on years of subsequent, real, unpaid shortfall.

---

## 6. Exploit catalogue and closures

| Exploit | Comparator evidence | Closure in this design |
|---|---|---|
| **Borrow → invest → borrow indefinitely** | `finance-logic` §4.1: with LTV 90%, $1M equity converges to $10M assets — a geometric-series snowball | Collateral valued at *book-after-salvage* (50%/35% of catalog capex, never cost) means every dollar of borrowed cash spent on a new asset buys ≤$0.30 of new borrowing capacity at the margin (§3.4); the coverage floor (§4) binds well before the leverage cap in practice |
| **Overdraft instead of borrow (no interest on negative cash)** | OpenTTD's entire rationale for taxing negative cash "to prevent cheating or abuse" | §3.2's 8-week sustained distress-interest rule removes the free-overdraft dominance without adding a second product |
| **Counter resets on one good month** | Mad Games Tycoon 2, extensively documented (`comp-bankruptcy-loans.md` §1.3g) | §3.7's cure requires catching up *every* currently-missed instalment inside the 13-week window, not just the most recent one; the window ages out old misses but does not let one solvent week erase a live default |
| **Creditor failure forgives debt** | Capitalism Lab: drawing a credit line right before the issuing bank's own bankruptcy voided the debt (forum-documented bug) | Not directly reachable in this design — there is one implicit lender, not a failable NPC bank. Flagged as a **forward-compatibility requirement for P16+**: if named lenders/investors are ever added, any lender's own failure must transfer the receivable to a successor/estate, never erase it |
| **Buy-rival-with-borrowed-money snowball** | GearCity ($1 + assumed debt purchases), Capitalism Lab (buy shares of a failing rival) | Out of this document's scope (Direction I / P16+), but flagged now so P11's loan law does not need a redesign later: **any future acquisition price should draw against the *acquirer's* leverage cap using the *combined* post-acquisition surplus, and an acquired studio's existing debt must transfer with it, never be erased** — this is a one-sentence forward-compatibility note, not a P15 design |
| **Money-in-flight false distress** | Hollywood Animal (4-week screening payout window), Game Dev Tycoon (one week before release) | The default rule (§3.7) counts a *missed instalment*, which is a cash fact at the due week, not a revenue-timing fact; `pipelineRunRevenue`/`financeUpcoming` (already shipped, `code-finance.md` §3.2) let a future P15B predicate net out scheduled receipts before declaring Warning, exactly as `comp-bankruptcy-loans.md` §2.4 recommends |

---

## 7. Ownership boundaries

| Owner | What it owns for this slice |
|---|---|
| **P11** | The three new ledger kinds (`loanProceeds`, `loanInterest`, `loanPrincipal`) as an additive `LedgerKindV20`/`LedgerEntryV20` extension of the existing V10→V13 pattern (`types.ts:352-465`) — the same shape as every prior ledger widening; a new persisted `Loan` record (principal, rate, term, origin week, balance, correlation id, status); the weekly unconditional debit at the same tick stage as payroll/overhead (`tick.ts:912-953`); the missed-instalment fact and the 13-week/8-week counters (§3.7); the covenant read-model (coverage, leverage, collateral-at-book-after-salvage) as pure selectors over existing + new ledger truth, following the existing non-subtraction law ("obligations sit beside Cash, never secretly subtracted," `P11-REQ-016`, PROVEN); the §3.2 distress-interest rule (it is a cash-debit mechanic, like overhead). **P11 does not decide what a default means for the studio's operating status — only that a default fact exists.** |
| **P15B** | Consumes the P11 default fact and the P11 sustained-negative-cash fact as two more typed inputs into the *existing* `stable → warning → distress → recovery / dormant` ladder (`P15-BUILDER-ANNEX.md` §C.3) — no new ladder is designed here. Owns the Rescue loan as one of the required typed remedy capability families (§16 of the package), with the same eligibility/cost/timing for player and rival. Owns the rule that **only acceleration (an uncured Event of Default) or an 8-week sustained-negative-cash fact may originate a finance-sourced Warning** — a drawn, current, on-schedule loan is never itself a trigger, matching annex C.3's forbidden shortcut ("cash `< 0` alone"). Direction H's large public failure notice ("X DECLARES BANKRUPTCY...") is a P15B/P12 authoring question — outside this loan document's scope, but it will need a sixth `IndustryReceipt` kind (the union is closed at five today: `studioEntered, employment, filmAnnounced, filmReleased, filmSettled`, `hollywoodTypes.ts:96-102`) or an equivalent new receipt type, additively extended the same way the ledger is. |
| **P12** | Mints/commits the actual active→dormant/closed studio-registry transition (unchanged — P15B only proposes). Owns the rival loan-policy branch as one more deterministic rule beside the already-shipped `operatingReserve` gate (`hollywoodTick.ts:51-53, 98, 126, 156, 176, 196-200`; `policy.reserveWeeks` 12–20wk, `hollywoodTypes.ts`) — e.g., "if projected weeks-to-reserve-exhaustion ≤ N and trailing surplus positive and under the leverage cap, draw a Studio Loan at the studio's own credit grade." No hidden subsidy (law 9): rivals qualify by the exact published covenants, at the exact published rate table, and can default/accelerate into the same P15B ladder the player uses. This is a natural extension of a buffer concept P12 already ships, not a new rival mechanic. |
| **P16+** | Everything this document explicitly rejects for v1: revolving credit lines as a standing product, bonds/IPO/equity, named lenders/investors who can themselves fail, credit rating as a persistent player-visible score with its own UI surface, acquisition-price financing and debt assumption on M&A (Direction I's research question), and any leverage product beyond the two here. The package's own §25 deferral list ("debt/equity/investor integration if separately approved") already anticipated exactly this split — Direction F approves the *simple* half now; the rest stays parked. |

**No new P15D package is needed for the loan/debt slice.** It decomposes cleanly across P11 (mechanics: ledger, obligations, covenant math) and P15B (consumption: one more typed condition input plus one typed remedy capability), reusing package boundaries the Owner has already approved (`P15-PACKAGE.md` §3.2, §16). Creating a separate package here would only fragment a system that is, by design, two ledger kinds and one condition input. (A *different* P15-numbered slice may be warranted for Direction C's net-worth/valuation display, since that is a distinct read-model question with its own player-legibility problem — but that is a different analyst's call, not this document's, and this design's LTV covenant only needs the existing capex-ledger book value, not whatever valuation model Direction C eventually adopts, so the two workstreams are not blocking each other.)

---

## 8. Genuine Owner decisions this document leaves open

1. **Era base-rate table** — a fixed real rate (~4–5%) applied uniformly with `era.costScale` carrying the price level, or an authored per-decade band (5–6% in the 1920s, 2–3% around 1950, 10–20% around 1980, 3–7% for 2010–2025, an authored guess for 2026–2040)? `finance-logic` §5.3 leaves this open; this document does not resolve it, only requires that whichever is chosen is stated as a ratio/band, never a bare dollar constant.
2. **Exact default-window constants** — 4-in-13-weeks and the 8-week covenant/distress-sustain windows used throughout this document are PROVISIONAL and need Owner tuning, the same way `PRODUCTION_TICKS: 8` or `THEATRICAL_WEEKS: 6` were tuned.
3. **Whether rival loan draws are public** — today rival cash and terms are private ("future receipts, costs and studio revenue remain private," `bridge/industry.ts:1`); Direction H requires a *failure* to be a large public notice, but does not say whether an ordinary, healthy loan draw is ever visible pre-failure. This document assumes draws stay private and only the terminal event becomes public, matching existing P12 privacy law, but that is this document's inference, not a ruling.
4. **Whether the §3.2 distress-interest rule needs its own explicit Owner sign-off** as a genuinely new mechanic (it is small, but it is new — negative cash currently costs nothing beyond the build lockout the original shipped, and this document adds a cost).
5. **Whether a minimal "book collateral value" read-model ships alongside the loan system**, or whether the LTV covenant runs as an internal-only computation with no player-facing number until Direction C's net-worth work lands. `finance-logic` §1.5 recommends exposing it labeled "Book Net Worth, not a sale price," but that recommendation belongs to Direction C's analyst, not this one, and this design works either way.

---

## 9. Sources

Primary: `out/phase1/finance-logic.md` §§3–5 (loan formulas, covenant sourcing, era rules) and its digest corrections (`_DIGEST.md` lines under `verify:finance-logic:*`, respected throughout — e.g. interest-coverage "3×" is stated here as an authored rule of thumb inside a published 1.25×–4.5× range, not as a universal real-world figure; the OCC 2013 leverage guidance is noted as rescinded by OCC/FDIC only, not the Federal Reserve, with the 6× reference point unaffected). `out/phase1/comp-bankruptcy-loans.md` §§1–4 and its digest corrections (`_DIGEST.md` lines under `verify:comp-bankruptcy-loans:*` — notably: OpenTTD's acquirer does **not** inherit the target's loan at the pinned commit `96651d3` [`economy.cpp:1982-2051`], so no takeover-debt-inheritance claim is made anywhere above; FM24's official feature page, not just community text, documents the staged ladder cited in §2; GearCity's rate formula is "factor into," not a disclosed multiplication; Blockbuster Inc. (Super Sly Fox, 2024) is cited from its own Steam patch notes — 1.9.0 "Rival studios can go bankrupt, pausing operations for a year before returning," "Bank Loan Payoff Option," and 1.7.16.1 "allow getting loans even if company money is below 0" — rather than from the phase-1 report, which the digest found had skipped it entirely). `out/phase1/code-finance.md` §§1–4, 6 for every accepted-code citation. `accepted-592e926/src/core/types.ts:352-465` (ledger kind V10→V13 additive pattern), `hollywoodTypes.ts:47-102` (RivalAccount, IndustryReceipt union), `hollywoodTick.ts:51-200` (rival `operatingReserve` gate), `tick.ts:912-953` (unconditional weekly debits), `employment.ts:70-85` (`canAfford`, corrected reading per digest). Authority: `P15-PACKAGE.md` §§3.2, 11, 16, 25; `P15-BUILDER-ANNEX.md` §C.3; `P13-P15-OWNER-RULINGS.md` §§4–5. Computation: `/tmp/loanscen.py` (this pass), reusing the amortization formula from `finance-logic.md` §3.1/`scratchpad/loan_tables.py`.
