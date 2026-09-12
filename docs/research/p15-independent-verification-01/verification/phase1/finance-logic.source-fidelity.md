# Source-Fidelity Verification — `phase1/finance-logic.md`

**Lens:** SOURCE FIDELITY (does the cited source actually say it; is the page/line/URL right; is the evidence tier correctly assigned)
**Verifier:** independent adversarial reader, READ-ONLY
**Date:** 2026-09-11
**Report verified:** `<scratchpad>/out/phase1/finance-logic.md`
**Method:** every consequential citation was reproduced by me — `sed`/`grep` on the plain-text extractions and the accepted `592e926` snapshot, `pdftotext` on the two government PDFs the author cited, `WebFetch` on each statute/agency/finance URL, and an independent Python recomputation of every number in §§3–4. Nothing under any git repository was touched; no player data was opened.

**Overall verdict: VERIFIED WITH CAVEATS.** No substantive claim was refuted. All project-authority, accepted-code, original-game, statute, agency-data and arithmetic citations reproduce exactly. Three citations are **weak** (the source does not say what is attributed to it, or the URL is dead) although the underlying statements are correct; a handful of small assertions are unsourced or slightly overstated. Details below.

---

## 1. Claims checked (15 checks over the 8–12 most consequential claims)

### C1. Original-game retail evidence: red balance + build lockout (report §0, §6) — **CONFIRMED, tier correct**

| Citation in report | What I found | Evidence |
|---|---|---|
| manual "balance can go into the red … won't be able to build new sets or add certain facilities and lot ornamentation", printed pp. 6–7, `manual.txt:126–130` | Exact text present at `manual.txt:129–130`; "Cash Balance" paragraph at 125–130; "contributes toward your ranking in the Charts" at 128 | `sed -n '120,135p' manual.txt`. Page headers: `The_Movies_FINAL2.qxp … Page 6` at line 105, `Page 8` at line 152 → lines 126–130 sit on the printed 6–7 spread. |
| Prima "Building in Debt", printed p. 14, `prima.txt:769–777` | Box heading at 769; seven exceptions (Casting Office, Crew Facility, Production Office, Basic Script Office, Stage School, Stage Set, Star & Script Selling Facility) at 770–777 | Form feeds at 716 and 792; printed folio "14" at line 789 → correct page. |
| GameFAQs Maxx `gamefaqs-maxx.txt:659–664` | "Most sets and buildings cannot be built once you are in debt …" with the same seven exceptions | lines 659–664 reproduce. |

Tier: RETAIL SHIPPED MECHANIC (manual + Prima + retail FAQ). HIGH. Correctly assigned.

### C2. Absence claims: no interest, loan, bank, creditor, bankruptcy in inspected retail sources (report §0, §6) — **CONFIRMED, tier correct, one small imprecision**

Case-insensitive grep over `manual.txt`, `prima.txt`, `gamefaqs-maxx.txt`, `gamefaqs-mark.txt`, `gamepressure-improving.txt`:

| Term | Hits |
|---|---|
| `loan`, `bankrupt`, `creditor`, `overdraft`, `game over`, `go bust`, `insolven` | **0** in all five files |
| `interest` | only non-financial uses (love interest, genre interest, "interesting") |
| `debt` | manual:129; maxx:659, 1119; prima:769–770 and ~60 "Build in Debt: Yes/No" catalogue rows — all the same lockout mechanic |
| `bank` | Wild West Bank / Urban Modern Bank **sets** (prima:1585, 3349, 3389; mark:1428, 1677) **and** "in the bank"/"bank account" in the money sense (prima:2810, 2854, 5230; mark:806–861) |

The report's parenthetical "'Bank' appears only as set names" is slightly overstated — the word also appears meaning the studio's own cash balance (e.g. Prima's Capital factor: "the amount of money your studio has in the bank"). None of those establish a lending bank, so the conclusion stands. The report's own tier for absences ("MEDIUM, absence ≠ proof") is the right one.

### C3. Accepted-code citations (report §0 table, §1.3, §1.4, §5.2) — **CONFIRMED (one trivial line offset)**

| Cited | Reproduced |
|---|---|
| `src/core/studioRunRecap.ts:1003` "No recovery mechanic (loans/financing) exists in the current rules." | Verbatim at line 1003. |
| `src/core/economyView.ts:112–135` runway rule `weeks = ⌊cash / (burn − rev)⌋`, current commitments only, net-positive → infinite | Lines 112–137: `runwayOf` at 124–129, comment "THE ONE runway rule … current commitments only", `runway(state)` at 135. |
| `tuning.ts:70` INITIAL_CASH 20,000,000; `419–420` OVERHEAD_BASE 15,000 / OVERHEAD_PER_EMPLOYEE 1,500; `596` annex opex 3,500; `816` SET_DEMOLITION_REFUND_FRACTION 0.35; `1613` FACILITY_DEMOLITION_REFUND_FRACTION 0.5 | All five lines match exactly. |
| `calendar.ts:17` year = 1920 + ⌊week/52⌋ | Line 17 exactly. |
| `types.ts:284–289` EraConfig with `costScale: number`; `hollywoodPolicy.ts:45`, `reception.ts:264`, `build-contract.md:325` requiredNegative = baseNegativeCost × budgetDemandMultiplier × era.costScale; `worldgen.ts:657–663` costScale 1.0 | All reproduce (types 284–289; hollywoodPolicy 45; reception 263–264; build-contract 325; worldgen 658–663 with comment "the three non-costScale fields are inert data here"). |
| `financeReport.ts:22` "Conditional estimate at current pace; not a forecast" | Present, but at **line 20** (trivial offset). |
| `sets.ts:467, 536`, `placement.ts:636` `insufficientFunds`; `studioRunRecap.ts:951–960` affordability via `cashAfter` | All present; `affordabilityOf` at 953–960 uses `preview.cashAfter`. |
| `run-d17b-week86.ts:7` "$2.04M per 52 weeks" | Line 7 reads "loses $2.04M per 52 weeks, stops producing by week 112 and is insolvent around week 158". |
| D-16 R3 `releaseTalent` may drive cash below zero | `D-16-OWNER-RULINGS.md:45` verbatim. |

Extra check the author implied but did not state: `grep -rni 'overdraft\|\bloan\b\|interestRate' src/core/*.ts` → only the line-1003 string. There is no interest/penalty mechanic on negative cash in `src/core`. The report's "silent, interest-free overdraft" characterisation of current code is therefore supported.

### C4. Project-authority citations (report §0, §7) — **CONFIRMED**

| Cited | Reproduced |
|---|---|
| D-16 R10 "KEEP THE STUDIO, LOSE CONTROL", list of deferred instruments | `docs/D-16-OWNER-RULINGS.md:52` verbatim (loans, credit lines, co-financing, distribution advances, deferred-compensation financing, investors, bailouts, passive/library revenue, hard bankruptcy, forced restructuring ladder). |
| D-17B lines 85–97 "do not introduce financing, loans, bailouts, restructuring or the failure ladder" | Lines 85–97 verbatim, including "Do not invent an arbitrary cash sink …". |
| Roadmap §5.3 lines 163–167 (cash literal; obligations beside cash; negative cash recoverable ≠ bankruptcy; P15B cannot infer debt/valuation/insolvency/acquisition price; runway selectors incomplete) | `P13-P15-LONG-RANGE-ROADMAP.md:164–167` verbatim. |
| P15 §11 law 5 "Negative cash is not bankruptcy"; law 6, 9, 10, 14 | `P15-PACKAGE.md:393` and neighbours verbatim. |
| P15 §25 "studio and library valuation", "debt/equity/investor integration if separately approved" in P16+ | `P15-PACKAGE.md:837–847`. |
| Owner rulings §5 P16+ parking lot includes valuation | `P13-P15-OWNER-RULINGS.md:147–151`. |
| Annex §C.3 lines 114–128 ladder; forbidden shortcuts "cash `< 0` alone", "one bad film or one week" | `P15-BUILDER-ANNEX.md:114–124` verbatim. |
| P15 §5.5/§6 GameSpot 2004 preview "studio goes bust" = pre-release only | `P15-PACKAGE.md:62, 246–249, 295`. Report labels it PRE-RELEASE PROMISE — correct tier. |

Two small characterisation notes: (a) the annex has **four** P15 conditions (stable/warning/distress/recovery) crossed with P12 operating states (active/dormant); "five-condition ladder" is a loose count of composite rows, not wrong. (b) `HANDOFF.md:586–590` records that D-15 shipped with "no financing/debt/recovery mechanic" — it *describes an absence*; it does not itself "prohibit or defer". The report's sentence "every current project authority (… HANDOFF …) prohibits or defers" slightly overstates HANDOFF's role. D-16 R10 and D-17B do the prohibiting.

### C5. UK Insolvency Act 1986 s.123 and s.214 quotes (report §2.1) — **CONFIRMED verbatim, primary statute**

WebFetch of legislation.gov.uk s.123: (1)(a) "sum exceeding £750 then due … written demand … for 3 weeks thereafter neglected to pay"; (1)(e) "unable to pay its debts as they fall due"; (2) "value of the company's assets is less than the amount of its liabilities, taking into account its contingent and prospective liabilities". s.214(2)(b) "no reasonable prospect that the company would avoid going into insolvent liquidation [or entering insolvent administration]"; s.214(3) "took every step with a view to minimising the potential loss to the company's creditors". All as the report states. HIGH.

### C6. US Bankruptcy Code citations (report §2.2, §2.4) — **CONFIRMED verbatim**

- Cornell LII §507(a)(4): "$10,000 for each individual or corporation … earned within 180 days before the date of the filing"; adjustment note **$17,150 effective April 1, 2025**. Taxes at (a)(8). Matches report.
- §524(e): "discharge of a debt of the debtor does not affect the liability of any other entity on, or the property of any other entity for, such debt" — verbatim.
- US Courts Chapter 7 Basics: "gathers and sells the debtor's nonexempt assets"; "six classes of claims; and each class must be paid in full before the next lower class is paid anything"; "a discharge is only available to individual debtors, not to partnerships or corporations". Matches.
- US Courts Chapter 11 Basics: debtor in possession; plan "must include a classification of claims and must specify how each class of claims will be treated"; stay suspends "all judgments, collection activities, foreclosures, and repossessions"; §365 assumption/rejection; "two-thirds in amount and more than one-half in number"; feasibility + good faith. Matches.

### C7. GOV.UK "Options when a company is insolvent" (report §2.2 UK block) — **WEAK CITATION on two sub-claims; substance correct**

Two targeted fetches of the page:

| Report attributes to GOV.UK | On the page? |
|---|---|
| Administration moratorium: creditors "can't take legal action to recover their debts or start compulsory liquidation without the permission of the court" | **Yes**, verbatim. |
| CVA repays "all, or part of, the company's debts over an agreed period" | **Yes**, verbatim. |
| Administrative receivership largely abolished for charges after 2003 | **Yes** (15 September 2003, with listed exceptions). |
| Administration "objectives in strict order: rescue … else better result … else realise property" | **No.** The page lists four administrator *proposals* with no priority language. The strict order is real law but it lives in **Insolvency Act 1986 Sch B1 para 3(1), (3), (4)** (fetched: (a) rescue as going concern; (b) better result than winding up; (c) realise property for secured/preferential creditors; (3)/(4) require (a) unless "not reasonably practicable", then (b), then (c)). |
| Liquidation payment order "fixed-charge holders, insolvency costs, preferential creditors (including employees' wages), floating-charge holders, unsecured creditors, shareholders" | **No.** The page gives no liquidation waterfall; the only ordering it states is the *receiver's* ("their costs, the preferential creditors, the floating charge holder's debt"). The waterfall as written is the standard England & Wales order (IA 1986 ss.175, 176A, 176ZA; Insolvency (E&W) Rules 2016 r.7.108), minus the "prescribed part" carve-out for unsecured creditors; a professional summary (e.g. https://www.uklegalguides.com/priority-of-claims-in-liquidation-proceedings/) or the statute should be cited instead. |

Corrected statement: "Administration objectives are ranked by Insolvency Act 1986 Sch B1 para 3 (https://www.legislation.gov.uk/ukpga/1986/45/schedule/B1/paragraph/3); the liquidation waterfall (fixed charge → liquidation costs → preferential incl. employee wages → prescribed part → floating charge → unsecured → shareholders) is set by IA 1986 ss.175/176A and the Insolvency Rules 2016, not by the GOV.UK options page." Confidence in the substance stays HIGH; confidence in the citation as written is LOW.

### C8. Loan arithmetic, §§3.1–3.4, 3.7 (script section G), 3.10, 4.1, 4.2 — **CONFIRMED by independent recomputation**

I re-derived every figure from A = P·i/(1−(1+i)^−n) with i = r/52, n = 52·years (and i = r, n = years for annual), without using the author's script:

- All 18 weekly rows (e.g. $1M 8%/10yr → $2,795/wk, total interest $453,502, 45.4%; $20M 12%/10yr → $66,086/wk, $14,364,797, 71.8%) match to the dollar.
- All 8 annual rows match ($1M 8%/10yr → $149,029/yr, $490,295; $20M 8%/10yr → $2,980,590/yr, $9,805,898).
- Effective annual at 8% nominal/weekly = 8.32%. ✔
- Bullet table ($1M 8% → $1,538/wk; $20M 8% → $30,769/wk, $8M/5yr, $16M/10yr). ✔
- Leverage loop E/(1−L): $2.0M, $3.33M, $10.0M. ✔
- Tranche ladder (6/8/11/15%) on $1.5M surplus: 6.0% / 14.0% / 25.0% / 40.0% of surplus; coverage at 4× = 2.5× (< 3×, so "the fourth tranche is never offered" holds). ✔
- Section G: 2×/4×/6× at 8% IO → 16%/32%/48% of surplus; coverage 6.2× / 3.1× / 2.1×. ✔
- Scale check: 2,795/15,000 = 18.6% ("about 19%") ✔; 55,904/15,000 = 3.7× ✔.
- "Bullet costs roughly twice the interest" — actual ratios 1.67× (12%/10yr) to 1.90× (6%/5yr). "Roughly twice" is fair.

The pedagogy line "doubling the term roughly doubles total interest; doubling the rate roughly doubles it too" is consistent with the table (6%/5yr 15.8% → 6%/10yr 33.0%; 6%/5yr 15.8% → 12%/5yr 33.1%). HIGH.

### C9. OCC Bulletin 2013-9a / 78 Fed. Reg. 17766 and its Dec 2025 rescission (report §3.7, §4.2) — **CONFIRMED; page-wrap and one omission**

`pdftotext -layout` of the bulletin PDF the author cited:
- "leverage level after planned asset sales … in excess of 6X Total Debt/EBITDA raises concerns for most industries" — on **p. 17773** (between the 17773 header at txt line 640 and the 17774 header at 729). ✔
- "the ability to fully amortize senior secured debt or the ability to repay at least 50 percent of total debt over a five-to-seven year period provides evidence of adequate repayment capacity" — sentence **starts at the foot of p. 17774 col. 3 and wraps onto p. 17775**; the same test is also summarised on p. 17769 in the comment discussion. The report's "pp. 17773–17774" is acceptable.
- Sullivan & Cromwell memo (9 Dec 2025): OCC and FDIC rescinded the guidance on **5 Dec 2025** ✔. **Omitted by the report:** the memo stresses that the **Federal Reserve did not join** the rescission, so the guidance is not uniformly withdrawn. Minor, but worth adding since the report says flatly "the guidance was rescinded".

### C10. CFI covenant sources: DSCR 1.25×, LTV levels, remedies, revolver, 5 Cs (report §3.5, §3.7, §3.8) — **CONFIRMED; one unsourced number**

- CFI DSCR: "Many small and middle market commercial lenders will set minimum DSC covenants at not less than 1.25x" — verbatim ✔; formula (EBITDA − cash taxes)/(principal + interest) ✔.
- CFI LTV: "LTV % = (Loan Amount / Asset Value) * 100" ✔; cash 100%, CRE "generally upwards of 75% of appraised value", inventory "frequently capped at 50%" ✔.
- CFI Debt Covenants: "Demand full immediate repayment of the loan", "Increase the predetermined interest rate", "Increase the amount of collateral" ✔; interest coverage (EBITDA or EBIT / Interest) listed as a common covenant ✔; negative covenants (no more debt, no senior debt, no asset sales, dividend limits) ✔.
- **"3× is a common comfort level"** for interest coverage — **not on the CFI page** (its worked example uses 3.70). Unsourced in the report. An independent search finds 2.5×–3.0× commonly quoted as covenant floors and 1.5× as the usual "minimum acceptable" (e.g. https://umbrex.com/resources/company-analysis/finance/interest-coverage-ratio/ ; Law Insider clause samples range 1.25×–4.5×). The number is a defensible rule of thumb but should carry a source and MEDIUM, not ride on the CFI cite.
- CFI Revolver: "charged interest based only on the withdrawal amount and not on the entire credit line"; commitment fee described ✔.
- Fredrikson & Byron: "Default events should include missed payments, bankruptcy, and cross defaults"; remedies "termination of the loan, acceleration of the loan, and, if a secured loan, taking possession of collateral" ✔. The page gives **no** cure-period lengths; the report's "30–90 days" is the author's gloss and is already labelled MEDIUM/contractual — acceptable.

### C11. Era facts: CPI and prime rate (report §5.1) — **CONFIRMED**

- Minneapolis Fed CPI table: 1920 = 20.0; 1921 = 17.9 (−10.9%); 1930 = 16.7; 1931 −8.9%; 1932 −10.3%; 1950 = 24.1; 1970 = 38.8; 1990 = 130.7; 2005 = 195.3; 2020 = 258.8; 2025 = 321.9 (not flagged as an estimate). 321.9/20.0 = 16.1× ("~16×") ✔.
- FRED PRIME: 21.50% on 1980-12-19 (series maximum); 3.25% on 2008-12-16; 6.75% on 2025-12-11, which is the **latest observation in the table** as fetched today ✔.
- ERP 2010 Table B-73 (pdftotext of the govinfo PDF): 1929 prime "5.50–6.00"; footnote 5 says 1929–1933 figures are ranges of rates in effect. The report's MEDIUM for this secondary table is, if anything, conservative — it is an official Treasury/CEA compilation.

### C12. Negative book equity examples (report §1.2) — **WEAK CITATION; substance correct**

- WallStreetMojo *Negative Shareholders Equity* names **Colgate (buybacks $19.13bn to 2016 + AOCI), Revlon (losses), HP (HPE separation + dividends)**. It does **not** mention McDonald's or Starbucks, so the report's parenthetical "(Colgate/McDonald's buyback examples)" misattributes McDonald's to that page.
- IMA/Strategic Finance URL **is dead**: 301 → https://imatoday.org/ homepage; the cited article cannot be reproduced at that address (search-engine snippets still attribute "Boeing, Starbucks, The Home Depot, and McDonald's have crossed … into negative stockholders' equity as the result of many years of stock buybacks" to it, but that is second-hand).
- The mechanism (treasury stock + debt-funded distributions → negative equity while profitable) is textbook and McDonald's/Starbucks are widely documented instances; a reproducible substitute is Z. Workman, *Profitable Restaurants Reporting Negative Equity* (SSRN 3825098, https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3825098) or the companies' 10-K balance sheets.
- Corrected statement: "Colgate (WallStreetMojo) and the US restaurant chains McDonald's/Starbucks (Workman, SSRN 2021) are commonly cited buyback-driven negative-equity examples." The report's own "MEDIUM on any specific company figure" is appropriate.

### C13. Wikipedia EV / Bullet loan quotes (report §1.1, §1.3, §3.4) — **CONFIRMED**

- *Enterprise value*: "If you settle with all the security holders, you pay EV" ✔; negative when the company "holds abnormally high amounts of cash that are not reflected in the market value of the stock and total capitalization" ✔; component list matches.
- *Bullet loan*: "entire principal of the loan … is due at the end of the loan term" ✔; grace period → partial amortization → bullet hybrid ✔.

### C14. Mechanics-bible cross-references (report §0) — **CONFIRMED, tiers correctly kept secondary**

Bible lines 2088 ("Debt lockout, not bankruptcy" [OFFICIAL: manual p.6]), 2782 (debt/soft-failure row, exception list), 2866 ("No source consulted … describes a hard loss/game-over/bankruptcy"), 3375 (Economy row with the "capital never really seems to be an issue" retrospective) all reproduce. The report correctly cites the underlying manual/Prima text rather than the bible for the retail claims and correctly labels 3375 as COMMUNITY INFERENCE.

### C15. Evidence-tier discipline overall — **CONFIRMED**

Retail (manual/Prima/FAQ) vs pre-release (GameSpot 2004 preview) vs community (retrospective quote) are kept separate throughout §0, §6 and §7; nothing pre-release is promoted to parity; every design section is explicitly labelled "successor design foundation, not parity". The "authorizes nothing" framing matches D-16 R10 / D-17B / P15 §25 / Owner rulings §5 as reproduced above.

---

## 2. Findings that go beyond citation checking (things the report did not say)

1. **The accepted code's own comment uses "insolvent" in the cash-below-zero sense.** `run-d17b-week86.ts:7` says the baseline "is insolvent around week 158", meaning cash exhaustion. The report leans on "negative cash ≠ insolvency" as *correct finance*; it should note that the codebase's harness prose is looser than the P15 law and could confuse a later reader.
2. **Fed non-participation in the leveraged-lending rescission** (see C9).
3. **UK "prescribed part"** is missing from the liquidation waterfall abstraction (see C7) — immaterial to a game abstraction, but the table is labelled "real rule".
4. **The report's HANDOFF line** (`HANDOFF.md:586–590`) is descriptive, not prohibitive (see C4).

None of these change any recommendation.

---

## 3. Tally

| Check | Result |
|---|---|
| C1 retail red-balance/lockout, page numbers | CONFIRMED |
| C2 absence of interest/loan/bank/creditor/bankruptcy | CONFIRMED (minor "bank" imprecision) |
| C3 accepted-code lines | CONFIRMED (financeReport quote at :20 not :22) |
| C4 authority docs | CONFIRMED (HANDOFF characterisation slightly overstated) |
| C5 IA 1986 s.123 / s.214 | CONFIRMED verbatim |
| C6 11 U.S.C. §507(a)(4), §524(e), Ch.7/Ch.11 Basics | CONFIRMED verbatim |
| C7 GOV.UK objectives order + liquidation waterfall | **WEAK citation** (correct law, wrong source) |
| C8 loan/leverage arithmetic | CONFIRMED by independent recomputation |
| C9 OCC 6×, 50%/5–7yr, S&C rescission | CONFIRMED (Fed omission) |
| C10 CFI DSCR/LTV/covenants/revolver/Fredrikson | CONFIRMED; "3× comfort" **unsourced** |
| C11 CPI, FRED prime, ERP B-73 | CONFIRMED |
| C12 negative-equity company examples | **WEAK citation** (McDonald's not in WallStreetMojo; IMA URL dead) |
| C13 Wikipedia EV / bullet loan | CONFIRMED |
| C14 mechanics-bible lines | CONFIRMED |
| C15 tier discipline | CONFIRMED |

**Verdict: VERIFIED WITH CAVEATS.** The report's consequential claims — the project-authority state, the accepted-code facts, the retail/pre-release split for the original game, the statutory insolvency and priority rules, the loan and leverage arithmetic, and the CPI/prime-rate era facts — all reproduce from their cited sources. The caveats are three citation-hygiene defects (C7, C10 "3×", C12) and four small omissions/overstatements, none of which alters a finding or recommendation.
