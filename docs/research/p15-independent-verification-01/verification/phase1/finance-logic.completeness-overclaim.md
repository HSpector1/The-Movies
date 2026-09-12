# Verification memo — `phase1/finance-logic.md`
## Lens: COMPLETENESS & OVERCLAIM (adversarial)

**Verifier role:** independent, read-only. Re-checked the report's citations against the accepted snapshot `592e926`, the six authority docs, the plain-text original-game extractions and the PDFs (page numbers confirmed with `pdftotext`), the author's own `loan_tables.py`, and the primary web sources (statute text, FRED, Minneapolis Fed, Cornell LII, US Courts, OCC, CFI).
**Date:** 2026-09-11
**Verdict:** **VERIFIED WITH CAVEATS.** The report answers all five prompt items, its arithmetic reproduces, and every code, authority and legal citation I spot-checked (23 of them) resolves to what the report says. The problems are (a) a handful of sentences that state more than the evidence supports — mostly in the connective prose rather than in the sourced tables — and (b) three completeness gaps, one of which (the Prima "Capital" rating scale) is a retail-source fact that bears directly on the report's own §5 recommendation and §1.5 advice.

---

## 1. What the prompt asked vs what the report delivered

| Prompt item | Asked | Delivered? | Gap |
|---|---|---|---|
| 1 — value concepts | book NW vs EV vs equity vs sale price; negative book equity; worth-less-than-cash; asset-based / earnings-multiple / **DCF simplified**; legibility; labeling recommendation | Yes, except DCF | **DCF is dismissed, not taught.** Prompt listed "DCF simplified" as a method to define; report gives no formula (e.g. perpetuity `V = CF / (r − g)` or a 5-year sum), no worked number, only "do not expose". Legitimate verdict, incomplete pedagogy. |
| 1 — earnings multiple | "e.g. EV = k × EBITDA or × average annual profit" | Yes | The only concrete `k` offered ("roughly 3–5 years of your recent operating surplus", §1.5 item 3) has **no source**. It is in fact consistent with published small-business EBITDA multiples (≈3–6×; SDE 1.5–4×) but the report presents it as if settled. |
| 2 — insolvency tests, staging, survivals | both tests; which trigger; US/UK staging; 4–5 game stages; secured/unsecured/wages/executory/guarantees | Yes, thorough | Minor legal over-simplification in §2.4 (see O-7). |
| 3 — loan products | formula; $1M/$5M/$20M × 6/8/12% × 5/10 yr; weekly vs annual; bullet; revolver; tiers; covenants; creditworthiness; refinancing; default rule; acceleration | Yes, complete | Two covenant "typical levels" are unsourced (see O-5). |
| 4 — borrow/invest loop | why LTV & leverage caps and rising rates bound it; simplest anti-exploit rules | Yes | None. |
| 5 — era/inflation | 1920 vs 2040; nominal vs `era.costScale`; unit-free rule | Yes | **Missed the retail precedent**: the original *did* use fixed nominal dollars across 1920–2005 for its Capital rating (see M-1). The report argues for unit-free rules without acknowledging that parity would be nominal. |

**Completeness score:** 4.5 of 5 items fully answered. Nothing was answered vaguely; the DCF omission is the only item the prompt named that the report did not actually explain.

---

## 2. Spot-checks performed (source → result)

### 2.1 Arithmetic (author's script re-read; two rows recomputed by hand)

| Claim | Check | Result |
|---|---|---|
| $1M, 8%, 10 yr, weekly → $2,795/wk, total interest $453,502 | `i = 0.08/52`, `n = 520`, `(1+i)^520 ≈ 2.2242` → `A ≈ 2,795.2` | **CONFIRMED** |
| $1M, 8%, 10 yr, annual → $149,029/yr | `80,000 / (1 − 1.08^−10) = 149,029` | **CONFIRMED** |
| "interest ÷ principal depends only on rate and term" | linear in P; table shows identical % across $1M/$5M/$20M | **CONFIRMED** |
| "bullet costs roughly twice a same-term amortizing loan" | 6%/5yr 1.90×; 8%/10yr 1.76×; 12%/10yr 1.67× | **CONFIRMED as "roughly"** — the true range is 1.7–1.9×; "roughly twice" is generous at 12%/10yr |
| $2,795 ≈ 19% of $15,000; $55,904 = 3.7× | 18.6%; 3.73× | **CONFIRMED** |
| LTV loop limit E/(1−L): 50%→$2M, 70%→$3.33M, 90%→$10M | closed form correct; script's 90% case only reaches $9.6M after 30 rounds (report correctly cites the closed form) | **CONFIRMED** |
| marginal ladder 6/14/25/40% of surplus; coverage < 3× at 4× | 600k/1.5M = 40%; coverage 2.5× | **CONFIRMED** |

### 2.2 Accepted-code citations (all 17 file:line references resolved)

| Cited | Found | Result |
|---|---|---|
| `studioRunRecap.ts:1003` "No recovery mechanic (loans/financing) exists" | exact text at line 1003 | **CONFIRMED** |
| `economyView.ts:112–135` runway rule `⌊cash/(burn−rev)⌋`, net-positive → infinite | lines 128–134 `runwayOf` | **CONFIRMED** |
| `sets.ts:467, 536`; `placement.ts:636` `insufficientFunds` gates | exact | **CONFIRMED** |
| `tuning.ts:70, 419, 420, 596, 816, 1613` (20M / 15,000 / 1,500 / 3,500 / 0.35 / 0.5) | exact | **CONFIRMED** |
| `types.ts:284–289` `EraConfig.costScale`; `worldgen.ts:657–663` default 1.0; `hollywoodPolicy.ts:45`; `reception.ts:264`; `build-contract.md:325` | exact | **CONFIRMED** |
| `calendar.ts:17` year = 1920 + ⌊week/52⌋ | exact | **CONFIRMED** |
| `financeReport.ts:22` "Conditional estimate at current pace; not a forecast"; `FinanceHistoryWindow` 13/52 | lines 22, 45, 199 | **CONFIRMED** |
| `types.ts` `'production'` "debited at greenlight"; `constructionCapex`; `setCapex` | lines 353, 378, 392 | **CONFIRMED** |
| `offerObligation` selector (`economyView.ts:315`) | exact | **CONFIRMED** |
| `tick.ts` payroll/overhead/opex debits can go negative | lines 919, 930, 946 `cash -=` with no floor | **CONFIRMED** |
| D-16 R3 (releaseTalent may drive cash below zero) | `D-16-OWNER-RULINGS.md:45` | **CONFIRMED** |
| `run-d17b-week86.ts:7` "$2.04M/year structural burn" | line 7 says the least-bad continuation "loses $2.04M per 52 weeks" **from a $2.83M save** | **CONFIRMED number, LOOSE attribution** (see O-4) |

### 2.3 Authority-doc citations

| Cited | Result |
|---|---|
| D-16 R10 "KEEP THE STUDIO, LOSE CONTROL", full deferral list | **CONFIRMED** (`D-16-OWNER-RULINGS.md:52`) |
| D-17B "do not introduce financing, loans, bailouts, restructuring or the failure ladder" lines 85–97 | **CONFIRMED** (line 93) |
| Roadmap §5.3 lines 163–167 (cash literal; obligations beside cash; negative cash recoverable; P15B cannot infer debt/valuation/insolvency/acquisition price; incomplete runway selectors) | **CONFIRMED** verbatim |
| P15-PACKAGE §11 law 5, law 6, law 9, law 10; §16 "Loans, bailouts, investors, forced sales, or acquisition are not implied"; §25 P16+ list incl. "studio and library valuation" and "debt/equity/investor integration"; §5.5 GameSpot preview = PRE-RELEASE ONLY; §6 "original hard bankruptcy … do not infer" | **CONFIRMED** |
| Annex §C.3 ladder + forbidden shortcuts "cash `< 0` alone" / "one bad film or one week" | **CONFIRMED** (lines 114–128) |
| Owner rulings §5 parking lot incl. valuation; §4.2 "Corporate Hollywood" does not authorize ownership systems | **CONFIRMED** |
| HANDOFF.md:586–590 "no financing/debt/recovery mechanic"; build-contract.md:599 non-goals incl. receivership | **CONFIRMED** |

### 2.4 Original-game citations

| Cited | Result |
|---|---|
| Manual "balance can go into the red … won't be able to build new sets or add certain facilities and lot ornamentation", printed spread pp. 6–7 | **CONFIRMED** — `manual.txt:129–130`; PDF page 4 carries the Quark header "Page 6" |
| Prima "Building in Debt" seven exceptions, printed p. 14 | **CONFIRMED** — `prima.txt:769–777`; PDF page 15 carries printed folio 14 |
| GameFAQs Maxx `659–664` same list | **CONFIRMED** |
| Manual "Cash Balance contributes toward your ranking in the Charts" | **CONFIRMED** (`manual.txt:128`) |
| "No inspected retail source establishes interest, loan, bank, creditor, bankruptcy" | **CONFIRMED by my own grep** of all five extractions for interest/loan/bankrupt/game over/overdraft/creditor/receivership/liquidat/insolven/net worth/valuation/bust/broke: zero relevant hits ("interest" = genre interest / love interest only; "Bank" = set names only) |
| Bible lines 2088, 2782, 2866, 3375 as cited | **CONFIRMED** they say what the report says |

### 2.5 Web / legal / statistical claims

| Claim | Primary source checked | Result |
|---|---|---|
| §507(a)(4): 180 days; cap $17,150 from 1 Apr 2025 (statutory $10,000; prior $15,150) | Cornell LII text + adjustment notes (90 FR 8941) | **CONFIRMED** |
| Insolvency Act s.123(1)(a) £750 / 3 weeks; s.123(1)(e) cash-flow; s.123(2) balance-sheet wording | legislation.gov.uk | **CONFIRMED** verbatim |
| Chapter 11: classify claims; automatic stay wording; ⅔ amount + ½ number; §365 assumption/rejection; DIP | uscourts.gov | **CONFIRMED** |
| Chapter 7: trustee sells nonexempt assets; class-by-class; no corporate discharge | uscourts.gov | **CONFIRMED** |
| OCC 2013-9a: ">6X Total Debt/EBITDA raises concerns for most industries" (78 FR 17773) and "repay at least 50 percent of total debt over a five-to-seven year period" (17774) | PDF text extracted | **CONFIRMED**, page numbers correct |
| Guidance "rescinded in Dec 2025" | OCC Bulletin 2025-44 / S&C memo | **CONFIRMED with nuance**: OCC and FDIC withdrew on 5 Dec 2025; the **Federal Reserve had not** joined at that date. "Rescinded" is slightly over-broad. |
| CFI DSCR "not less than 1.25x"; CFI LTV formula, CRE ~75%, inventory ~50%, cash 100% | CFI pages | **CONFIRMED** verbatim |
| CFI Debt Covenants remedies ("demand full immediate repayment", "increase the predetermined interest rate", "increase the amount of collateral") | CFI page | **CONFIRMED** |
| CPI-U 1920 20.0 → 2025 321.9; 1921 −10.9%; 1930 16.7; 1950 24.1; 1970 38.8; 1990 130.7; 2005 195.3; 2020 258.8 | Minneapolis Fed table | **CONFIRMED** (2025 is a final annual figure; the estimate row is 2026) |
| Prime 21.50% 1980-12-19; 3.25% 2008-12-16; 6.75% 2025-12-11 | FRED PRIME + 2026 rate trackers | **CONFIRMED**; 6.75% still in force Aug 2026, so "as of 2025-12-11" is accurate |
| 1929 prime 5.50–6.00 (ERP 2010 Table B-73) | PDF extracted | **CONFIRMED** (footnote 5: 1929–1933 values are ranges of the rate in effect) |
| Wikipedia EV: "If you settle with all the security holders, you pay EV"; EV "can be negative … abnormally high amounts of cash" | Wikipedia | **CONFIRMED** verbatim |
| Fredrikson: default events "should include missed payments, bankruptcy, and cross defaults"; remedies incl. acceleration/possession | fredlaw.com | **CONFIRMED**; note the source gives **no** typical cure-period lengths — the report's "30–90 days" is not from any cited source (flagged MEDIUM by the author, but still unsourced) |

**Net:** every quoted figure and quotation I tested is accurate. The report's sourcing is unusually clean for a 5,000-word note. The issues below are about *framing*, not fabrication.

---

## 3. Overclaims and weak claims (ranked)

**O-1 — "the accepted game has no creditor and no due debt" (§2.1, §7, and summary bullet 4).** Overstated and internally inconsistent. Payroll, overhead and Annex opex *do* fall due every week and are debited without a floor (`tick.ts:919/930/946`); the project's own D-17B harness calls the resulting trajectory "insolvent around week 158" (`run-d17b-week86.ts:8`). The report's own §7 QUALIFIED verdict concedes this ("today only payroll/overhead/opex 'fall due', and they are auto-debited into overdraft rather than missed"). The defensible statement is narrower: *the engine never records a missed payment because an implicit, uncapped, interest-free overdraft always pays; so no cash-flow-insolvency **event** can be observed, and the sign of cash is not one.* The conclusion "negative cash ≠ bankruptcy is correct finance" survives on that narrower footing; the sentence as written does not. **Corrected statement, source:** roadmap §5.3 line 165 + `tick.ts:919–946` + `run-d17b-week86.ts:7–8`.

**O-2 — "The original therefore shipped … an unlimited, interest-free overdraft with a spending lockout" (§0 prose).** "Unlimited" and "interest-free" are inferred from silence, then asserted as shipped fact in the prose, even though the report's own §6 table correctly rates the absences MEDIUM and the P15 package (§6) says absence "is not proof that no executable remnant ever existed". **Corrected statement:** "the only retail-documented consequence of a red balance is the build lockout; no inspected retail source establishes a limit, interest, or a lender" (manual pp. 6–7; Prima p. 14; grep of all five extractions).

**O-3 — Runway "ignores scheduled obligations (contract guarantees …)" (§2.1, §7).** Half-right. `weeklyBurn` (`economyView.ts:69–72`) *includes* `weeklyPayroll`, which is exactly the guaranteed comp charged weekly; what runway does not model is contract **expiry** (burn falling) or any non-weekly due date — the recap's `contractsOutliveRunway` flag exists precisely for the former. The correct statement is that runway is a constant-burn extrapolation that knows neither when obligations end nor any third-party due date; it does not "ignore" the guarantee.

**O-4 — "$20M cash, $2.04M/year structural burn (the D-17B harness comment … describes such a profile)" (§1.3).** The harness describes a **$2.83M** save at week 86 losing $2.04M per 52 weeks; the $20M is `INITIAL_CASH`. The report grafted the burn onto a different cash figure and attributed the composite to the harness. Small, but a hostile reader will catch it. **Corrected:** cite the harness for the burn only.

**O-5 — Unsourced "typical" covenant levels.** "Interest coverage … 3× is a common comfort level" (§3.7) and "minimum cash/liquidity — common affirmative covenant" have no citation; the CFI Debt Covenants page the row cites lists interest coverage as a covenant but its only numeric example is 3.70×, and it does not mention minimum liquidity at all. Similarly "commercial practice commonly quotes 30–90 days" for cures (§2.2) is not in the Fredrikson source cited beside it (that source explicitly declines to give lengths). These are reasonable practitioner rules of thumb, but they should be labeled "author's rule of thumb", not sit in a "Typical real-world level" column beside verbatim CFI quotes.

**O-6 — "roughly 3–5 years of your recent operating surplus" (§1.5 item 3).** No source. It happens to sit inside published small-business ranges (EBITDA multiples ≈3–6× for sub-$1M-EBITDA firms; SDE multiples 1.5–4×, all-industry median ≈2.7× in 2026 broker data), so it is not wrong — but as the one concrete valuation number in the note it needed a citation and an explicit "authored range" label.

**O-7 — §2.4 "Automatic stay / moratorium: during administration no further penalties accrue; the clock stops."** Legally over-simplified: the US stay halts *collection*, but interest continues to accrue for oversecured creditors (§506(b)) and default interest may accrue; only post-petition interest on unsecured claims is generally disallowed (§502(b)(2)); in UK administration interest accrues though it is not payable. As an explicitly labeled "legible abstraction" this is tolerable, but the sentence should say "no further *collection or acceleration*" rather than "no further penalties".

**O-8 — "the guidance was rescinded in Dec 2025" (§3.7).** Only the OCC and FDIC withdrew (5 Dec 2025, OCC Bulletin 2025-44); the Federal Reserve, a co-signatory, had not. Minor; the 6× reference point is unaffected.

**O-9 — Balance-sheet test "mostly governs director duties and what a court will accept" (§2.1).** Understates that s.123(2) is itself a ground on which a creditor can petition to wind up (s.122(1)(f)) — i.e. it can be an *event*, not only a condition. The gameplay framing ("a condition, not an event") is still the right design call; the legal gloss is a shade too strong.

**O-10 — Minor labeling slips.** §4.3 calls the $780k asset "a stage"; in the snapshot it is `PLACEMENT_ANNEX_CAPEX` (an Annex). §3.4 "roughly twice" is 1.7–1.9× in the author's own table. The report cites the "capital never really seems to be an issue" quote to bible line 3375 (a summary table row) and labels it COMMUNITY INFERENCE without naming the underlying source; the bible itself names it at line 2094 (`forceforgood.co.uk`, tagged PLAYER DOCUMENTED) — the evidence discipline asked for the underlying source.

No instance was found of a pre-release feature being promoted to retail parity, of a design doc being treated as code, or of a forum post being generalized. The report's parity discipline (§6, §7) is sound.

---

## 4. Missing items / skipped counter-evidence

**M-1 — Prima's Capital rating scale (retail, developer-reviewed).** Prima printed p. 46 (PDF p. 47; `prima.txt:2795–2809, 2851–2853`) and GameFAQs Maxx `2228–2235` establish that **Capital = 24% of Studio Rating**, scored on a fixed nominal scale from **$50,000 (lowest) to $1,600,000 (max)**, concave (midpoint ≈ $300,000, not $775,000), "amass and keep more than $1,600,000 in the bank at all times" to max it. This is a RETAIL SHIPPED MECHANIC the report did not surface, and it matters in three places: (i) §6's row "Cash Balance contributes to chart ranking" could have been stated exactly; (ii) §5's era argument should acknowledge that the *original's* parity is **fixed nominal dollars across 1920–2005** — the unit-free recommendation is therefore a deliberate departure from parity, which the report should say; (iii) §1.5 item 4 ("Never … fold them into Power Ranking") is right under P15 law 3, but the original literally did fold cash into Studio Rating — worth stating so nobody later calls the departure an oversight.

**M-2 — DCF simplified.** Prompt item 1 named it; the report gives no formula or example. One line would close it: perpetuity `V ≈ CF / (r − g)` (Gordon), or "sum of the next N years' surplus each divided by (1+r)^t plus a terminal value".

**M-3 — Sourced multiple range.** See O-6; one broker/industry citation would make the "3–5 years" range honest.

**M-4 — UK employee preferential cap.** §2.4 says "UK preferential wages" without noting the cap (£800 per employee for the 4 months pre-insolvency). Not required by the prompt; noted because the report otherwise gives US caps precisely.

**M-5 — Federal Reserve status on the rescission.** See O-8.

Nothing else the prompt asked for is absent. I looked specifically for counter-evidence to the report's central original-game absence claim (interest, loans, bankruptcy) in all five extractions and found none; the absence claim stands at MEDIUM exactly as the author rated it.

---

## 5. Confirmed strong claims (safe to carry forward)

1. Every accepted-code and authority citation resolves (§2.2–2.3 above); the note is correctly framed as authorizing nothing.
2. The amortization tables, bullet tables, LTV-loop limit, leverage/coverage arithmetic and scale comparisons are correct and reproducible from `loan_tables.py`.
3. The legal staging (missed payment → notice/cure → Event of Default → acceleration/cross-default → Ch.11 DIP / UK administration with moratorium and ordered objectives vs Ch.7 / liquidation) is accurately sourced to primary statute and court materials.
4. §507(a)(4) 180-day / $17,150 (Apr 2025) wage priority; §524(e) guarantees survive; no corporate Ch.7 discharge; Insolvency Act s.123 both tests and s.123(1)(a) demand — all verbatim-correct.
5. OCC 2013 6× / 50%-in-5–7-years quotes and FR page numbers are correct; OCC/FDIC withdrawal Dec 2025 is real.
6. CPI 20.0 → 321.9 (≈16×), 1921 −10.9%, prime 21.5% (Dec 1980) / 3.25% (Dec 2008) / 6.75% (Dec 2025, still in force), 1929 prime 5.50–6.00 — all correct.
7. Original-game parity table (§6): red balance permitted; build lockout with Prima's seven exceptions; cash feeds chart rank; silence on interest/loans/bankruptcy — correct, with page numbers verified against the PDFs.
8. `era.costScale` is the sole live era scalar, default 1.0, multiplying required negative cost — correct.
9. The P15B annex ladder mapping and the "acceleration is the only bridge from a loan problem to the corporate ladder" design rule are coherent with roadmap §5.3, P15 §16 and D-16 R10.

---

## 6. Verdict

**VERIFIED WITH CAVEATS.** The report is complete against the prompt except for the DCF explanation, and its sourced content is accurate. Before it is used as foundation for paper scenarios, the author should (1) narrow the "no creditor and no due debt" sentence to the observable-event form in O-1; (2) rephrase §0's "unlimited, interest-free overdraft" as an absence claim; (3) add the Prima p. 46 Capital scale to §5/§6 and state that unit-free limits are a departure from the original's nominal-dollar parity; (4) label the 3× coverage, 8-week cash, 30–90-day cure and "3–5 years" figures as authored rules of thumb or cite them; (5) fix the harness attribution and the Annex/stage label. None of these changes the report's recommendations.
