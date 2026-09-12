# Adversarial Verification — Loans / Debt System (`phase2/loans.md`)

**Lens:** break it. Adversarial game designer + economist. **Verifier role:** independent, read-only. **Date:** 2026-09-12.
**Verdict: VERIFIED WITH CAVEATS** — the two-product shape, the covenant math, and every recomputed dollar figure in the paper scenarios are correct. But the design has one gap serious enough to be load-bearing (a rational player or a symmetric rival can render the entire default ladder toothless for free) and one gap that defeats the document's own stated anti-rollover brake. Both have a one-sentence fix. Several smaller consistency, symmetry, and edge-case gaps follow.

---

## 1. Arithmetic recomputation (independently re-derived, not copied)

I rebuilt the amortization formula (`A = P·i/(1−(1+i)^−n)`, weekly `i = annual/52`) from scratch in Python and ran it against every scenario in `phase2/loans.md` §5. Results:

| Scenario | Claim | My recomputation | Verdict |
|---|---|---|---|
| **A** — $5M/8%/10yr | weekly $13,976; annual debt service $726,751; year-1..10 balances $4,660,095 → $0, interest $386,846(y1)…$28,826(y10) | weekly $13,975.98; annual $726,751.15; **every year-end balance and interest/principal split matches to the dollar** (y1 $4,660,095.18/$386,846.33; y10 balance $0.00, interest $28,825.65) | **Exact match, no error** |
| **B** — Rescue $1.5M/14%/3yr vs. "Studio Loan" $1.5M/8%/3yr | $11,788 vs $10,823/wk; interest $338,974 vs $188,341; gap $150,633 | $11,788.30 vs $10,822.70/wk; $338,974.40 vs $188,341.13; **gap $150,633.27** | **Numbers exact** — but see §2.1, the comparator loan doesn't exist under this design's own rules |
| **C** — $2M interest-only bullet rolled 3×, rates 8/10/12% | $320k/$400k/$480k interest per 2-yr cycle, $1.2M total, $70k fees, $1,270,000 grand total (63.5%); blended-10% amortizing comparator $8,530/wk, $661,509 interest, "≈1.9×" | Cycle interest exact match; **$1,270,000/$2,000,000 = 63.500% exact**; blended comparator $8,530.48/wk, $661,508.92 interest; ratio **1.9199×** ("roughly 1.9×" confirmed) | **Exact match** — see §2.2 for a wording inconsistency in the surrounding prose (not the numbers) |
| **D** — $20M/8%/10yr, decaying surplus | weekly $55,904, annual debt service $2,907,005; coverage/leverage 2.29×/3.00× (yr0), 1.03×/6.67× (yr1), 0.52×/13.33× (yr2); shortfall $1,407,005/yr | $55,903.93 / $2,907,004.61; **every coverage and leverage ratio matches to two decimals**; shortfall $1,407,004.61 | **Exact match, no error** |
| **§4** — "3× leverage allows $4.5M debt at 2.29× coverage; 3× coverage caps at ≈2.29× leverage (~$3,441,760)" | $4.5M → ≈$654,000 annual debt service, 2.29× coverage; solving the other way ≈$3,441,760 | $4.5M → $654,076.04 annual debt service, coverage **2.293×** (matches "≈"); my closed-form solve for exactly 3.000× coverage gives **$3,439,967**, a **0.05%** difference from the document's $3,441,760 | **Immaterial rounding difference** (labeled PROVISIONAL; not a real error) |

**Conclusion on arithmetic:** every dollar figure in the document is either exactly reproducible or within rounding noise on an explicitly-PROVISIONAL number. The quantitative work is trustworthy. The problems below are in the *rules*, not the *math*.

---

## 2. Findings, ranked by severity

### 2.1 [MAJOR] Missed-instalment amounts have no stated fate — a free, symmetric, unlimited "hoarding" exploit

§3.7 says a missed loan payment is "*missed, recorded, and — new — recorded as a fact (not silently absorbed into the overdraft, unlike ordinary overhead)*." It never says what happens to the money: is the missed principal+interest capitalized onto the balance (continuing to accrue, as Prison Architect does — the document's own comparator, `comp-bankruptcy-loans.md` §1.12, "unpaid interest capitalizes"), does the loan term simply extend by one week, or does the debt just... not exist for that week?

As written, the only *consequence* of a miss is that it counts toward "4 missed weekly instalments within a rolling 13-week window." A rolling window with no capitalization means a rational studio (or a deterministic P12 policy running the identical law, per the document's own "AI compat" axis) can **miss exactly 3 of every 13 weekly instalments forever** — never touching the 4th — and, since nothing states the skipped cash is ever owed, extract an indefinite ~23% discount on debt service with **zero cost, zero cure, and zero effect on credit grade** (grade is defined by "weeks since last missed payment... coverage... collateral," not by count of misses, so even that channel is silent on repeat, cured-by-construction misses). This is exactly the OpenTTD/MGT2 family of exploit the document spends §2 row 5c and §6 closing for *other* mechanisms, but it leaves its own newest mechanism open.

**Why this matters more than a normal balance bug:** Direction F ("too much debt can contribute to ultimate bankruptcy") and Direction D ("failure comes from sustained inability to meet real obligations") both depend on missed obligations being *real* — i.e., costing something. If they cost nothing until the 4th one in 13 weeks, "sustained inability" never actually accumulates; the ladder's finance-sourced Warning trigger (§3.7's "acceleration... is the only event that may hand the P15B condition machine a Warning trigger") becomes reachable only by players who don't know the rule, which is the opposite of legible.

**Smallest fix:** one sentence — "a missed instalment's principal and interest are capitalized onto the outstanding balance (added back, continuing to accrue at the loan's contracted rate) the same week; the loan's remaining schedule re-amortizes over its original remaining term." This closes the exploit without adding a new product or counter, and is exactly the mechanism already cited in the document's own comparator evidence (Prison Architect capitalization; Software Inc.'s "the more time you ask for, the higher rates go").

### 2.2 [MAJOR] The refinancing fee escalation (§3.8) is trivially bypassed by "pay off with a new loan" instead of "refinance"

§3.8's whole reason for existing, per the document's own Scenario C ("the rising fee/rate brake... is what stops 'roll it forever'"), is to stop cheap indefinite rollover. But §3.1 separately states early repayment is "**allowed, no penalty**," and nothing restricts a studio to one outstanding Studio Loan at a time. So instead of "refinancing" loan A (which triggers the rising fee), a studio in Good/Watch standing can simply **originate a brand-new Studio Loan B at the current Good-grade rate and use its proceeds to pay off loan A in full, penalty-free, in the same week.** Nothing in the document distinguishes this from an ordinary new loan — it is never labeled a "refinance of the same obligation," so it never accrues the escalating 1–2%-rising fee or the credit-grade rate-brake described in §3.5/§3.8. The economic effect (perpetual rollover of the original exposure) is identical to what §3.8 was written to prevent, at strictly lower cost, defeating the exact mechanism the document uses Scenario C to justify.

**Smallest fix:** define "refinance" functionally, not nominally: any new borrowing whose proceeds retire ≥50% of an existing loan's balance within, say, 4 weeks of origination is a refinance of that obligation for fee/rate-escalation purposes, regardless of which Loan record ID it is booked under. The escalating counter must attach to the *studio's rollover history of the original obligation* (already have a "correlation id" per §7's ownership table — reuse it), not to whichever transaction happens to be labeled "refinance."

### 2.3 [MODERATE] Scenario B's "same size/term" comparator loan doesn't exist under this design's own rules

§3.1 restricts Product 1 (Studio Loan) to two terms only: "5 or 10 years (260/520 weeks)." Scenario B (§5.2) computes "if it had been drawn early instead, as a Studio Loan (8%), same size/term" at a **3-year** term — a term Product 1 never offers (only Rescue offers ≤3yr, and Rescue requires Impaired grade, i.e. Distress, which contradicts "drawn early" / healthy). I recomputed both sides and the arithmetic is exact ($150,633 gap), so this is not a math error — it's a comparison against a hypothetical instrument the design itself doesn't sell. The "price of waiting" lesson is real (I confirmed the 5-year and 10-year Studio Loan interest totals are $321,085 and $680,253 respectively — both far more expensive in absolute terms because they're longer, which actually muddies the "waiting costs more" point unless the term is held constant), but as written a builder implementing exactly §3.1's two-term menu cannot reproduce Scenario B's own comparator.

**Smallest fix:** either (a) extend Product 1's authored terms to include a short option (e.g., "5 or 10 years, or any elected term from 1–10 years") so the like-for-like comparison is achievable, or (b) relabel the comparator explicitly as "a hypothetical same-terms Good-grade loan, illustrative only, not an actual Studio Loan menu option" so it isn't read as a real available choice.

### 2.4 [MINOR] Scenario C's own prose is internally inconsistent about how many refinance events occurred

The scenario is introduced as "rolled **three times** (6 years total), with the refinancing fee rising **1.0% → 1.5% → 2.0%**" — three fee values implying three refinance events. But the table that follows has exactly **two** fee rows (1.5% into cycle 2, 2.0% into cycle 3) and the "Total fees: $70,000" figure is exactly `$30,000 + $40,000` — the 1.0%/$20,000 value is never applied anywhere. Separately, "rolled three times" starting from a 2-year bullet would normally mean 4 cycles / 8 years, not the 3 cycles / 6 years actually tabulated (3 cycles = 2 rolls). Both statements are cosmetic — the computed numbers are internally self-consistent given rates 8/10/12% and fees 1.5%/2.0% — but as written a reader can't tell whether the "1.0%" and "three times" language is a typo or a missing fourth cycle.

**Smallest fix:** either drop "1.0% →" from the prose (only two refinance fee points are used: 1.5%, 2.0%) and say "issued once, then rolled twice," or extend the table to a fourth 2-year cycle at 14%/2.5% fee to match "rolled three times" literally and recompute the totals.

### 2.5 [MODERATE] `finance-logic`'s own fourth anti-exploit rule (minimum cash buffer) is silently dropped

`finance-logic.md` §4.3 states its recommended rule set as **four** rules, rule 3 being "**Interest coverage ≥ 3× and minimum cash ≥ 8 weeks of fixed costs**, tested every week." `loans.md` §3.4 adopts leverage (≤3×), coverage (≥3×), and collateral-at-book-after-salvage, but the minimum-cash-on-hand floor is never mentioned anywhere in the document — not adopted, not explicitly rejected with a reason. This matters for exactly the "hoarding" and hostile-fixture direction of this review: under the adopted rules alone, a studio can borrow up to the leverage/coverage ceiling and immediately spend every dollar of cash (loan proceeds plus operating cash) on capex/production, landing at $0 liquid cash the moment the loan closes, with no covenant catching that. The two caps that remain bound *future* debt capacity, not *present* liquidity cushion.

**Smallest fix:** either fold the minimum-cash floor into §3.4 as a third simultaneous test (matching `finance-logic`'s own four-rule design, unit-free as "≥ 8 weeks of current fixed costs"), or add one sentence explaining why it's redundant given the other two (I could not construct that redundancy proof myself — worth having the author confirm rather than assume).

### 2.6 [MODERATE] Rival ("P12") acceptance rule for the Rescue tier is unspecified, unlike the Studio Loan

§7's ownership table gives a concrete deterministic rule for when P12 rivals draw a **Studio Loan** preventively ("if projected weeks-to-reserve-exhaustion ≤ N and trailing surplus positive and under the leverage cap, draw..."). No equivalent rule is given for whether/when a rival **accepts a Rescue offer** once P15B computes it eligible — the document only asserts "same eligibility/cost/timing for player and rival" as a *property*, without stating the *decision rule* a deterministic rival needs to actually exercise it. P15-PACKAGE §17 requires "equivalent typed remedy capabilities for player and rivals" with "presentation and choice mechanisms may differ" only in *how* the choice is made, not whether one is specified at all. Without a stated rival acceptance rule, a builder cannot make P12 rivals actually use Route 2 (Rescue) — leaving rivals to fall straight to Distress → Administration every time, which is a real behavioral asymmetry the document doesn't flag as an open question (it isn't in §8's decision list either).

**Smallest fix:** one line — "P12 rival policy accepts an offered Rescue draw whenever eligible and the resulting coverage after the draw exceeds the studio's pre-draw coverage" (or similarly simple deterministic rule), matching the pattern rival policy already uses elsewhere (e.g., `hollywoodTick.ts`'s `staff()`/`decide()` functions, which are exactly this kind of "accept if it clears a reserve/coverage test" rule).

### 2.7 [MINOR] Migration: no stated policy for seeding the new counters on existing saves

P15-PACKAGE §18.2 (Migration) is explicit and binding: "no pre-migration pressure, ranking, rival entry, **distress**, closure, recovery, or Legacy claim is invented." `loans.md` introduces three time-window counters (13-week missed-instalment window §3.7, 8-week covenant cure §3.7, 8-week sustained-negative-cash distress-interest trigger §3.2) but never states how they initialize for a save that predates the loan system — e.g., a studio that has already been continuously negative for 30 weeks at the moment the mechanic ships. Read literally under §18.2, no pre-existing negative-cash history may be invented into an instant "already sustained 8 weeks" distress trigger the moment the patch lands.

**Smallest fix:** state explicitly that every counter starts counting from the studio's `recordedFromWeek` migration boundary (the same pattern §18.1/§18.2 already use for the market-history root), never backfilled from pre-migration ledger history, even when that history is technically available.

### 2.8 [MINOR] Terminal fate of a closed studio's own outstanding Loan record is unstated

P15-PACKAGE §13.2 makes IDs (including, by the document's own extension, presumably Loan records tied to a `StudioId`) permanent — never deleted, never recycled. Direction D requires a failed rival's history to "remain accessible forever." The exploit catalogue (§6) discusses what happens if a *lender* fails (not applicable — single implicit lender) but never states what happens to a *borrower's* own unpaid principal when that borrower studio itself closes/settles. Does the Loan record move to a terminal status (e.g., `writtenOff`) as part of P12's settlement, staying visible in the permanent historical record per Direction D? This is likely the obvious answer, but the document should say so in one sentence rather than leave it implied.

**Smallest fix:** add to §7's P12 row: "at closure/settlement, any outstanding Loan balance is marked `writtenOff` (never deleted) as part of the same settlement event that closes the studio, preserving the record per Direction D/§13.2 identity law."

### 2.9 [MINOR] Systemic/correlated-default risk across rivals is never analyzed, despite Direction G's explicit concern

Direction A makes market pressure (genre saturation, release-window overlap) **shared** across all studios. Direction D ties failure to "sustained inability to meet real obligations under the same economic law." Combine the two: a market-wide downturn in a saturated genre could simultaneously erode trailing surplus for *several* rivals who all leaned into that genre, pushing multiple covenant breaches (§3.7) in the same quarter — a correlated-default wave, not the "one bad movie" scenario the document's Scenario D explicitly rules out for a *single* studio. Direction G explicitly says: "report a severe failure if found rather than silently adding a floor" for exactly this kind of ecosystem-thinning risk. `loans.md` never runs or even mentions this multi-studio stress case — every scenario in §5 is single-studio. Given the loan/covenant mechanism is the concrete trigger surface for this risk, this document is the right place to at least flag it for a later simulation pass.

**Smallest fix:** one line in §8 (open Owner decisions) noting that covenant/default parameters should be pressure-tested against a correlated-shock scenario (several genre-concentrated rivals hit by the same saturation event) before final tuning, per Direction G's "report, don't silently floor" instruction.

### 2.10 [TRIVIAL] Citation error: the "rival finances stay private" quote is mis-lined

§9 Sources cites `bridge/industry.ts:1` for "future receipts, costs and studio revenue remain private." I read the file: line 1 is a file-header comment ("Public, bounded Industry reads..."); the actual quoted sentence is at **`bridge/industry.ts:50`** (inside the `businessNotice` string literal). Substance is correct — I confirmed the quote verbatim — only the line number is wrong.

**Smallest fix:** change the citation to `bridge/industry.ts:50`.

---

## 3. Exploit/edge-case checklist (explicit pass/fail against the adversarial brief)

| Check | Result |
|---|---|
| Borrow → invest → borrow snowball | **Closed**, verified by re-deriving the geometric series: book-after-salvage collateral (60%×50%=30% effective LTV on new assets) bounds the loop to ≈1.43× equity, not the 10× finance-logic shows for unconstrained 90% LTV. Coverage floor binds even earlier per §4's own (confirmed) math. |
| Counter resets on one good week (MGT2-style) | **Closed as designed** — the 13-week rolling window with "must catch up every currently-missed instalment" does prevent a single solvent week from erasing a live default. But see 2.1: the counter's *inputs* (misses) carry no real cost, which is a different and worse hole than the one being closed. |
| Cancel-and-reannounce / relabeling dodge | **Open** — see 2.2 (refinance-fee bypass via a freshly-originated loan). |
| Borrow-to-buy (rival acquisition) | Out of scope by the document's own admission (Direction I / P16+); correctly flagged as forward-compatibility only, not attempted here. Acceptable. |
| Hoarding / free float | **Open** — see 2.1. |
| Player/rival symmetry swap | **Partially open** — Studio Loan symmetric and specified; Rescue symmetric in principle (§17) but **rival acceptance rule unspecified** (2.6). |
| Deterministic-rival degenerate strategy | Rivals only draw Studio Loan preventively per a stated rule; no stated Rescue behavior, so a rival's actual behavior in Distress is undetermined by this document (2.6). |
| Migration from pre-P15 saves | **Gap** — counter-seeding policy unstated, and P15-PACKAGE §18.2 forbids inventing pre-migration distress (2.7). |
| 2-studio end state (Direction G, no floor) | **Gap** — correlated multi-rival default risk never analyzed (2.9). |
| Post-2040 / P15C interaction | **Gap, not fatal** — Direction J requires the finale dossier to acknowledge "financial highs and crises" and "bankruptcies & recoveries," both of which this exact system generates, but §7's ownership table never mentions P15C at all, breaking the document's own stated method rule ("state... which package owns it"). Smallest fix: one line noting the new ledger kinds/default facts are eligible `legacyFinaleSnapshot` evidence, additive like everything else P15C freezes. |
| Save/load mid-settlement | **Likely fine but unstated** — the design's counters should be pure selectors over persisted ledger facts (matching the codebase's existing additive-root/selector pattern), not separately mutable running counters, to satisfy P15-PACKAGE §18.4's replay-determinism guarantee. The document never says this explicitly; it should, since it's the difference between "safe by construction" and "safe by accident." |
| ID reuse | **No violation found** — no reuse is proposed anywhere; StudioId/Loan correlation follows the existing immutable-ID law. Terminal record fate is merely unstated (2.8), not wrong. |
| Legibility ("one sentence" test) | Every rule I checked (distress-interest trigger, default threshold, credit-grade bands, refinance fee) passes the one-sentence test **as far as it's specified** — the failures above are gaps in specification, not in the clarity of what *is* specified. |

---

## 4. What holds up well (not just problems)

- Every dollar figure recomputed independently matched the document's own tables, including a scenario (D) with three years of compounding covenant math — no arithmetic errors found anywhere.
- The book-after-salvage collateral rule is a genuinely effective, correctly-derived brake on the classic borrow-invest-borrow loop (verified by re-deriving the convergence series myself, not just trusting the prose).
- The "acceleration is the only finance-sourced Warning trigger" rule, combined with the 8-week sustained-negative-cash rule, correctly implements Direction D's "one bad movie must not bankrupt a studio" — Scenario D shows a full year of collapsed surplus before even a covenant breach, and a second year before a possible Event of Default, which is the right order of magnitude for "sustained," not "single week."
- Every authority citation I spot-checked (P11-REQ-041 OWNER-BLOCKED at the register, D-16 R10 and D-17B's "do not introduce financing, loans, bailouts..." language, P15-PACKAGE §16's verbatim "Loans, bailouts, investors, forced sales, or acquisition are not implied," §16's "at least two legitimate recovery routes... typed remedy capability family," the IndustryReceipt closed-five-kind union in `hollywoodTypes.ts`) checked out exactly against the source text and line numbers (except the one line-number slip in 2.10).
- The document correctly incorporates the phase1-verify digest's corrections where they're relevant (e.g., not repeating the refuted "nothing is locked below zero" claim; correctly hedging the OCC/Fed rescission scope; correctly hedging "3× coverage" as an authored rule of thumb, not a real-world constant).

---

## 5. Summary of smallest fixes (for quick triage)

1. State that a missed instalment's principal+interest capitalizes onto the balance and re-amortizes (closes the free-hoarding exploit — **do this first**).
2. Define "refinance" functionally (any new loan whose proceeds retire ≥50% of an existing balance within ~4 weeks counts, regardless of label) so the escalating fee can't be dodged by relabeling.
3. Either extend Product 1's term menu below 5 years or relabel Scenario B's comparator as illustrative-only.
4. Fix Scenario C's "1.0% → 1.5% → 2.0%" / "rolled three times" wording to match its own 2-fee, 3-cycle table.
5. Either adopt `finance-logic`'s minimum-cash-buffer covenant or explain why it's unnecessary.
6. Add one sentence giving P12 rivals a deterministic Rescue-acceptance rule.
7. State that all new time-window counters start at zero from the migration boundary, never backfilled.
8. State the terminal status of a closed studio's own outstanding loan (`writtenOff`, never deleted).
9. Flag correlated multi-rival covenant breach as a tuning risk to pressure-test before final numbers.
10. Add P15C to the ownership table as the consumer of loan/default history for the 2040 dossier.
11. Fix the `bridge/industry.ts:1` → `:50` citation.
