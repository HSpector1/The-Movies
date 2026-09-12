# Basic Financial Logic for a Studio Management Game
## Net worth vs enterprise value, insolvency tests, simple loan products, covenants, leverage loops, era scaling

**Package:** P15 research review (Corporate Hollywood, Shared Market & Studio Legacy) — foundation note for later paper scenarios
**Role:** independent evidence reader, READ-ONLY
**Date:** 2026-09-11
**Accepted code snapshot inspected:** TypeScript runtime `592e926` (Owner-accepted P12 R05), extracted copy only
**Authority status of this note:** research/pedagogy only. It authorizes nothing. Every project authority I inspected currently **prohibits or defers** loans, financing, bailouts, valuation, and a failure ladder (see §0). Nothing below promotes any of those into package law.

---

## 0. Where the project stands today (so the foundations are not mistaken for a plan)

| Fact | Source | Confidence |
|---|---|---|
| Owner standing philosophy for failure: **"KEEP THE STUDIO, LOSE CONTROL."** No loans, credit lines, co-financing, distribution advances, investors, bailouts, hard bankruptcy, or forced restructuring ladder in D-17. | accepted snapshot `docs/D-16-OWNER-RULINGS.md` §2 row 10 (R10) | HIGH |
| D-17B re-affirms: "do not introduce financing, loans, bailouts, restructuring or the failure ladder"; instrument first, let facility/capacity systems create natural size-scaling costs. | `docs/D-17B-OWNER-RULINGS.md` lines 85–97 | HIGH |
| Accepted code has **no recovery mechanic**: the recap explainer literally tells the player "No recovery mechanic (loans/financing) exists in the current rules." | `src/core/studioRunRecap.ts:1003` | HIGH |
| Cash is literal; negative cash is recoverable and is **not** bankruptcy; obligations sit beside cash, never secretly subtracted. | `P13-P15-LONG-RANGE-ROADMAP.md` §5.3 (lines 163–167); `P15-PACKAGE.md` §11 law 5 | HIGH |
| P15B "cannot infer debt, valuation, insolvency, or an acquisition price from the present ledger." | roadmap §5.3 line 167 | HIGH |
| Valuation, debt/equity/investor integration, acquisition are parked in **P16+**. | `P15-PACKAGE.md` §25; `P13-P15-OWNER-RULINGS.md` §5 | HIGH |
| P15B (if approved) uses a five-condition ladder: `stable → warning → distress → recovery`, plus `dormant/distress`; forbidden shortcut for `warning` is "cash `< 0` alone"; forbidden shortcut for `distress` is "one bad film or one week". | `P15-BUILDER-ANNEX.md` §C.3 lines 114–128 | HIGH |
| `era.costScale` exists and is the only live era field: `requiredNegative = concept.baseNegativeCost × shapeEffects.budgetDemandMultiplier × era.costScale`, default `1.0`. | `src/core/types.ts:284–289`; `src/core/hollywoodPolicy.ts:45`; `src/core/reception.ts:264`; `src/core/worldgen.ts:657–663`; `docs/build-contract.md:325` | HIGH |
| Scale anchors in accepted code: `INITIAL_CASH 20,000,000`; `OVERHEAD_BASE 15,000`/week; `OVERHEAD_PER_EMPLOYEE 1,500`/week; annex opex `3,500`/week; facility demolition refund `0.5` of capex, set strike refund `0.35`. Year = 52 weeks from 1920. | `src/core/tuning.ts:70, 419–420, 596, 816, 1613`; `src/core/calendar.ts:17` | HIGH |
| Runway rule (the "incomplete runway selector" the roadmap names): `weeks = ⌊cash / (burn − activeRunRevenue)⌋`, current commitments only, net-positive → infinite. | `src/core/economyView.ts:112–135` | HIGH |
| Discretionary spending (greenlight, capex, set repair) is gated on `cashAfter ≥ 0` (`insufficientFunds`); mandatory tick debits (payroll, overhead, opex) can push cash negative; `releaseTalent` may deliberately push cash below zero because it removes a future obligation (D-16 R3). | `src/core/studioRunRecap.ts:951–960`; `src/core/sets.ts:467, 536`; `src/core/placement.ts:636`; `docs/D-16-OWNER-RULINGS.md` R3 | HIGH |

**Original-game evidence (retail shipped mechanic):** the manual says the balance "can go into the red" and that in debt you cannot build new sets or certain facilities/ornaments (manual, printed spread pp. 6–7, "Cash Balance" paragraph; `original-text/manual.txt:126–130`). Prima's "Building in Debt" box (printed p. 14; `prima.txt:769–777`) lists the seven exceptions. **No inspected retail source (manual, Prima, GameFAQs Maxx/Mark, gamepressure) establishes interest charged on a negative balance, a loan, a bank, a creditor, or a bankruptcy/game-over.** The original therefore shipped what a finance person would call an *unlimited, interest-free overdraft with a spending lockout* — a soft cash-flow constraint, not an insolvency regime. The mechanics bible agrees (line 2088, 2782, 2866) and its underlying citations check out against the plain-text extractions. A contemporary player retrospective it quotes ("capital never really seems to be an issue", bible line 3375) is COMMUNITY INFERENCE and only tells us the constraint had little bite.

---

## 1. Value concepts: book net worth vs equity value vs enterprise value vs sale price

### 1.1 Definitions (plain-language, with the standard formulas)

| Concept | Definition | Formula (simplified) | What it answers |
|---|---|---|---|
| **Cash** | money in the bank today | ledger balance | "Can I pay this week?" |
| **Book net worth** (book equity, net assets) | what the accounting records say the owners would keep if every asset were sold at its *recorded* value and every liability paid | assets (at book) − liabilities | "Have I built more than I owe, on paper?" |
| **Equity value** (market value of ownership) | what a buyer would pay for the *ownership* of the company | EV − net debt (net debt = debt − cash) | "What are my shares worth?" |
| **Enterprise value (EV)** | what it costs to own the *whole operating business* free of its financing: buy the equity, take on the debt, keep the cash | equity value + debt (+ preferred, unfunded pensions) − cash | "What is the business itself worth, regardless of how it is financed?" |
| **Sale price** | whatever a specific buyer actually pays; a negotiated number, often EV-based then adjusted for control, synergies, distress, urgency | negotiated | "What did we get?" |

Sources: Wikipedia, *Enterprise value* (formula components; "If you settle with all the security holders, you pay EV"; EV "can be negative" when a company holds abnormally high cash) — https://en.wikipedia.org/wiki/Enterprise_value ; CFI, *EV/EBITDA* ("Enterprise Value comprises market capitalization plus net debt") — https://corporatefinanceinstitute.com/resources/valuation/ev-ebitda/ ; NetSuite/Forage summaries of EV = market cap + total debt − cash — https://www.netsuite.com/portal/resource/articles/financial-management/enterprise-value.shtml . Confidence HIGH (textbook material, consistent across sources).

The three concepts answer three different questions, and a game that shows only one of them will be misread:

- Book net worth is a **record of the past** (what was paid, minus what was used up, minus what is owed).
- EV/equity value is a **bet about the future** (what the business will earn).
- Cash is **now**.

### 1.2 Why a profitable company can have negative book equity

Book equity = contributed capital + retained earnings − treasury stock. Two very different paths reach a negative number:

1. **Accumulated deficit:** years of losses eat retained earnings until equity is negative. This is the "bad" path.
2. **Buybacks/dividends funded by debt:** a highly profitable business borrows and hands the cash to owners; repurchased shares sit in a contra-equity account and reduce equity below zero even though the business earns plenty. McDonald's, Starbucks and Colgate are the commonly cited examples.

Sources: Wall Street Prep, *Accumulated Deficit* — https://www.wallstreetprep.com/knowledge/accumulated-deficit/ ; WallStreetMojo, *Negative Shareholders Equity* (Colgate/McDonald's buyback examples) — https://www.wallstreetmojo.com/negative-shareholders-equity/ ; IMA Strategic Finance, *The Downsides of Stock Buybacks* — https://www.sfmagazine.com/articles/2022/september/the-downsides-of-stock-buybacks . Confidence HIGH on the mechanism, MEDIUM on any specific company figure (they move yearly).

**Game translation.** A studio that borrowed to build stages and then paid the founder a large draw could show *negative book net worth* while releasing profitable films. Conversely a studio with positive book net worth can be worthless if its assets are sound stages nobody will buy. This is exactly why the accepted code's own salvage fractions (demolition refund 0.5, set strike 0.35) are a better "book" than the capex history: they already encode that a built asset is worth less than it cost.

### 1.3 Why a cash-rich company can be worth less than its cash

If a company holds $10M cash but is burning $4M a year with no credible path to profit, a buyer expects the cash to be gone before they can extract it; the market prices the equity below cash (negative EV). Wikipedia notes EV "can be negative if the company … holds abnormally high amounts of cash that are not reflected in the market value" (https://en.wikipedia.org/wiki/Enterprise_value). CFI's *Burn Rate* page explains net burn and that burn rate determines "how long the company can last until it needs more money" (https://corporatefinanceinstitute.com/resources/valuation/burn-rate/). Confidence HIGH.

**Game translation.** This is the accepted code's runway concept (`economyView.ts:124–135`) seen from a buyer's chair: `cash / net weekly burn` in weeks is precisely the number a valuer discounts. A studio with $20M cash, $2.04M/year structural burn (the D-17B harness comment in `run-d17b-week86.ts:7` describes such a profile) and no slate is worth less than $20M to anyone but a liquidator.

### 1.4 Simple valuation methods and which ones a lay player can read

| Method | How it works | Inputs a game already has (592e926) | Legibility for a lay player | Verdict for a management game |
|---|---|---|---|---|
| **Asset-based / book** | sum assets at recorded (depreciated) value, subtract liabilities | cash; capex ledger (`constructionCapex`, `setCapex`) with salvage fractions; contract obligations via `offerObligation` selectors | HIGH — "what you own minus what you owe" | **Expose** as "Book Net Worth"; deterministic, auditable, no forecast |
| **Liquidation value** | assets at forced-sale prices minus all liabilities | the refund fractions are literally this | HIGH but grim | Show only inside a distress/closure surface |
| **Earnings multiple** (EV = k × trailing profit or EBITDA) | pick a multiple from comparable businesses, multiply trailing 12-month operating profit | trailing 52-week ledger periods exist (`FinanceHistoryWindow` 13/52) | MEDIUM — multiples feel arbitrary unless explained as "years of profit a buyer pays for" | **Expose as a labeled estimate with a range**, never a single true number |
| **DCF (simplified)** | forecast future cash flows, discount to today | requires a forecast model the accepted code deliberately refuses to be ("Conditional estimate at current pace; not a forecast", `financeReport.ts:22`) | LOW — discount rates are opaque | Do not expose as a number; at most a hidden sanity check |
| **Market / comparable sale** | what similar studios sold for | requires P16+ ownership transactions | LOW until sales exist | Not available |

Sources: Wikipedia, *Business valuation* — three approaches (income/DCF, market/comparables, asset-based/net asset value), going-concern vs liquidation distinction — https://en.wikipedia.org/wiki/Business_valuation ; CFI, *EV/EBITDA* (pros: simple, widely used, good for stable businesses; cons: ignores capex, "may not be a good proxy for cash flow"). Confidence HIGH.

**Note on EBITDA for a film studio.** EBITDA is operating profit before interest, taxes, depreciation and amortization. A studio's film costs are capitalized and amortized in real life; the accepted code instead expenses production at commit (`production` ledger kind). For a game, "trailing 52-week operating surplus" (Studio Revenue received − payroll − overhead − opex − production − publicity, all from the ledger) is the honest EBITDA-like stand-in, and it will be lumpy because releases are lumpy. Any multiple must therefore sit on a **trailing average of several years**, not one year, or the number whipsaws.

### 1.5 Recommendation: what to expose and how to label it

1. **"Cash"** — already exists, keep it primary.
2. **"Book Net Worth"** — a read model: cash + depreciated facility/set capital (use the existing refund fractions or a simple straight-line schedule) − known obligations (guaranteed contract remainder, any future debt principal). Label it as a *record*, with a tooltip: "What your studio owns at recorded value, minus what it owes. Not a sale price." This is buildable from ledger truth with no new mechanics, but it is still a **P11 read-model change** and thus needs its own authorization; nothing here authorizes it.
3. **"Estimated Studio Value"** — only if valuation is ever approved (P16+). Show as a **range** ("roughly 3–5 years of your recent operating surplus, about $X–$Y") with the drivers listed (trailing surplus, cash, debt, library strength). Never round it to one number and never let any mechanic consume it as truth; that would violate P15 law 10 (no fake public precision).
4. **Never label any of these "Studio Rating" or fold them into Power Ranking**; the P15 package already separates rank, Standing and cash/valuation (§23 Power Ranking row).

---

## 2. Insolvency: the two tests, real staging, and a legible game abstraction

### 2.1 Cash-flow vs balance-sheet insolvency

UK statute states both tests in one section. A company is unable to pay its debts if "it is proved to the satisfaction of the court that the company is unable to pay its debts as they fall due" (cash-flow test, Insolvency Act 1986 s.123(1)(e)) or if "the value of the company's assets is less than the amount of its liabilities, taking into account its contingent and prospective liabilities" (balance-sheet test, s.123(2)). The same section also gives the classic *demand* trigger: a creditor owed more than £750 serves a written demand and the company neglects it for 3 weeks (s.123(1)(a)). Source: https://www.legislation.gov.uk/ukpga/1986/45/section/123 . Confidence HIGH (primary statute).

| Test | Question | Needs | Gameplay meaning |
|---|---|---|---|
| **Cash-flow** | can you pay what is due, when it is due? | a schedule of due payments and a cash balance | the one the player *feels*; it is about missed payments, not about a sign on a number |
| **Balance-sheet** | do you owe more than you own? | an asset register and a liabilities register | a *condition*, not an event; a studio can be balance-sheet insolvent for years while paying everyone |

**Which is meaningful?** Legally, insolvency processes are almost always *started by a creditor who was not paid* (demand, missed instalment) or by directors who conclude they cannot avoid it. The cash-flow test is the operative trigger; the balance-sheet test mostly governs director duties and what a court will accept. UK wrongful-trading law (s.214) makes directors personally liable if they kept trading after they "knew or ought to have concluded that there was no reasonable prospect" of avoiding insolvent liquidation and did not minimise creditor losses (https://www.legislation.gov.uk/ukpga/1986/45/section/214). Confidence HIGH.

**Consequence for the project.** The current game has **no creditor and no due debt**. Negative cash is an overdraft nobody has demanded. So "negative cash ≠ bankruptcy" (P15 law 5, roadmap §5.3) is not just a design preference; it is *correct finance*: without an obligation that has fallen due and gone unpaid, there is no cash-flow insolvency event. The accepted code's `runway` is a legitimate **early-warning input** (weeks until the overdraft deepens) but cannot be an insolvency test because (a) it ignores scheduled obligations (contract guarantees, which the `offerObligation` selectors know but runway does not consume), and (b) it has no concept of a payment falling due to a third party. That matches the roadmap's "incomplete runway selectors" warning, and explains *why* it is incomplete.

### 2.2 How real regimes stage things

**United States (Bankruptcy Code).**
- **Chapter 11 reorganization:** the debtor usually stays in control as "debtor in possession", files a plan that must "classify claims and specify how each class of claims will be treated", benefits from an automatic stay that suspends "all judgments, collection activities, foreclosures, and repossessions", may assume or reject executory contracts and unexpired leases under §365, and needs creditor votes (two-thirds in amount, one-half in number per class) plus a court finding that the plan is feasible and in good faith. Source: US Courts, *Chapter 11 – Bankruptcy Basics* — https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics/chapter-11-bankruptcy-basics . Confidence HIGH.
- **Chapter 7 liquidation:** a trustee "gathers and sells the debtor's nonexempt assets" and pays claims in class order, "each class must be paid in full before the next lower class is paid anything"; corporations get **no discharge** in Chapter 7. Source: US Courts, *Chapter 7 – Bankruptcy Basics* — https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics/chapter-7-bankruptcy-basics . Confidence HIGH.
- **Priority of unsecured claims (11 U.S.C. §507(a)):** administrative expenses rank near the top; **wages, salaries and commissions "earned within 180 days before the date of the filing"** are a priority class capped per employee (statutory text $10,000, adjusted to $17,150 from 1 April 2025); then employee benefit contributions; taxes further down; general unsecured last; equity after everyone. Source: Cornell LII — https://www.law.cornell.edu/uscode/text/11/507 . Confidence HIGH.
- **Guarantees survive:** "discharge of a debt of the debtor does not affect the liability of any other entity on, or the property of any other entity for, such debt" (11 U.S.C. §524(e), https://www.law.cornell.edu/uscode/text/11/524). Confidence HIGH.

**United Kingdom.**
- **Administration:** an insolvency practitioner takes control; a moratorium means creditors "can't take legal action to recover their debts or start compulsory liquidation without the permission of the court"; objectives in strict order: rescue the company as a going concern, else a better result for creditors than winding up, else realise property for secured/preferential creditors.
- **CVA:** company keeps trading and repays "all, or part of, the company's debts over an agreed period".
- **Administrative receivership:** a floating-charge holder (usually a bank) appoints a receiver — largely abolished for charges created after 2003 except special sectors.
- **Liquidation** (creditors' voluntary or compulsory): payment order — fixed-charge holders, insolvency costs, preferential creditors (including employees' wages), floating-charge holders, unsecured creditors, shareholders.
Source: GOV.UK, *Options when a company is insolvent* — https://www.gov.uk/government/publications/options-when-a-company-is-insolvent/options-when-a-company-is-insolvent . Confidence HIGH.

**The private-contract ladder that precedes all of the above** (standard loan documentation): a *default* (missed payment, breached covenant) → a *notice* and a *cure/grace period* (length varies by type of default; commercial practice commonly quotes 30–90 days for non-payment cures, shorter for payment defaults) → an *Event of Default* if uncured → lender may *accelerate* (all unpaid principal and interest "immediately become due and payable"), charge default interest, demand more collateral, or take possession of collateral; *cross-default* clauses make a default on one loan a default on the others; a cured default returns the parties to normal. Sources: Fredrikson & Byron, *Fortifying Your Loan Portfolio* (default events "should include missed payments, bankruptcy, and cross defaults"; remedies include "termination of the loan, acceleration of the loan, and, if a secured loan, taking possession of collateral") — https://www.fredlaw.com/alert-fortifying-your-loan-portfolio-essential-provisions-and-default-notices ; Law Insider acceleration clause samples — https://www.lawinsider.com/clause/acceleration-event-of-default ; CFI *Debt Covenants* (on breach the lender may "demand full immediate repayment of the loan", "increase the predetermined interest rate", "increase the amount of collateral") — https://corporatefinanceinstitute.com/resources/commercial-lending/debt-covenants/ . Confidence HIGH on structure, MEDIUM on "typical" cure lengths (they are contractual).

### 2.3 A 4–5 stage abstraction a player can read

The P15B annex ladder (`stable → warning → distress → recovery`, with `dormant`) already has the right *shape*. If a liabilities side is ever added, the real-world stages map onto it cleanly — and onto the Owner's "keep the studio, lose control" philosophy — like this:

| Stage | Real-world analogue | Legible game trigger (needs a liabilities model) | What the player loses | Exit |
|---|---|---|---|---|
| **0 Stable** | current on all obligations | all due payments met for N weeks | nothing | — |
| **1 Warning** ("Notice") | a missed payment inside its grace period; covenant trip | first missed scheduled payment (payroll, contract guarantee, loan instalment) *or* covenant breach; runway below a published horizon | nothing yet; public notice with causes | pay/cure inside the grace window |
| **2 Distress** ("Default") | Event of Default; creditors may accelerate | missed payments sustained past the cure window (e.g. 2 of the last 4 weekly instalments, or one covenant breach uncured for 8 weeks) | discretionary spend locked (the original's build-in-debt lockout is exactly this), default interest, no new borrowing | restore coverage: cut obligations, cancel uncommitted plans, complete a conserved release |
| **3 Administration** ("Lose control") | Chapter 11 / UK administration: business continues, an outside party controls money | distress sustained past a second window | control of the ledger: creditors impose the remedy menu (sell an asset, release talent, suspend a project); identity, films, people all persist | plan completes → Recovery |
| **4 Dormancy** (rivals: closure) | CVA/moratorium for the player; Chapter 7 / liquidation only for rivals under approved P15B policy | administration cannot produce a feasible plan | operations suspended; library, IDs, history preserved | re-entry remedy (player) / settlement + archive (rival) |

Design rules that follow from the law and the Owner rulings:
- **A stage change needs an unpaid due obligation or a breached published covenant, never a sign on cash.** (Matches annex forbidden shortcuts.)
- **Every stage has a cure path** (real regimes always do: cure period, CVA, plan). The P15 package already demands two legitimate recovery routes (§16).
- **Liquidation is asymmetric** (rival-only) by accepted P12 law; the player's floor is administration/dormancy. This is not "parity" and must not be labeled as such.

### 2.4 What survives — as legible abstractions

| Real rule | Legible abstraction for a game |
|---|---|
| **Secured creditor** is paid first from its collateral (Chapter 7 basics; UK fixed charge first) | a loan "secured on Stage 3" means Stage 3 is sold/forfeited first if the loan defaults; nothing else is touched by that lender |
| **Unsecured creditors** share what is left, often little | unsecured loans and suppliers are written down in dormancy/closure; they do not follow the studio into recovery at full value |
| **Employee wage priority** (§507(a)(4), 180 days, per-employee cap; UK preferential wages) | recent unpaid payroll is *always* paid before lenders; a studio cannot escape its people by defaulting — this protects P10/P14 contract truth |
| **Executory contracts may be assumed or rejected** (§365) | in administration the studio may cancel an unstarted project or an unperformed contract, paying a bounded rejection cost; contracts already performed are owed in full |
| **Guarantees survive discharge** (§524(e)) | any "personal" founder guarantee or cross-studio guarantee persists; a rival's closure does not cancel what others owed it or what it guaranteed |
| **No discharge for a corporation in liquidation** (Chapter 7 basics) | a closed rival stays closed and its debts do not vanish; its archive remains (P15 law 6, "no identity death") |
| **Automatic stay / moratorium** | during administration no further penalties accrue; the clock stops so the plan can work |

---

## 3. Loan products for a game

### 3.1 The amortizing payment formula

For principal *P*, periodic rate *i* (annual rate ÷ periods per year), and *n* total payments, the level payment is
**A = P × i / (1 − (1 + i)^−n)** (equivalently P·i(1+i)^n / ((1+i)^n − 1)).
Source: Wikipedia, *Amortization calculator* — https://en.wikipedia.org/wiki/Amortization_calculator . Confidence HIGH.

Weekly convention for this game: **i = r / 52, n = 52 × years.** Note this is a *nominal* annual rate; the effective annual rate at 8% nominal, weekly compounding, is 8.32%. Total interest is slightly *lower* with weekly amortization than with annual payments at the same nominal rate because principal is retired sooner. All tables below were computed with the script `scratchpad/loan_tables.py` (output `loan_tables.out`).

### 3.2 Worked tables — fixed-term amortizing, **weekly** payments (52/yr)

| Principal | Rate | Term | Weekly payment | Total paid | Total interest | Interest ÷ principal |
|---|---|---|---|---|---|---|
| $1,000,000 | 6% | 5 yr | $4,454 | $1,158,061 | $158,061 | 15.8% |
| $1,000,000 | 6% | 10 yr | $2,558 | $1,330,381 | $330,381 | 33.0% |
| $1,000,000 | 8% | 5 yr | $4,669 | $1,214,057 | $214,057 | 21.4% |
| $1,000,000 | 8% | 10 yr | $2,795 | $1,453,502 | $453,502 | 45.4% |
| $1,000,000 | 12% | 5 yr | $5,119 | $1,330,941 | $330,941 | 33.1% |
| $1,000,000 | 12% | 10 yr | $3,304 | $1,718,240 | $718,240 | 71.8% |
| $5,000,000 | 6% | 5 yr | $22,270 | $5,790,306 | $790,306 | 15.8% |
| $5,000,000 | 6% | 10 yr | $12,792 | $6,651,907 | $1,651,907 | 33.0% |
| $5,000,000 | 8% | 5 yr | $23,347 | $6,070,284 | $1,070,284 | 21.4% |
| $5,000,000 | 8% | 10 yr | $13,976 | $7,267,512 | $2,267,512 | 45.4% |
| $5,000,000 | 12% | 5 yr | $25,595 | $6,654,705 | $1,654,705 | 33.1% |
| $5,000,000 | 12% | 10 yr | $16,522 | $8,591,199 | $3,591,199 | 71.8% |
| $20,000,000 | 6% | 5 yr | $89,082 | $23,161,226 | $3,161,226 | 15.8% |
| $20,000,000 | 6% | 10 yr | $51,169 | $26,607,627 | $6,607,627 | 33.0% |
| $20,000,000 | 8% | 5 yr | $93,389 | $24,281,136 | $4,281,136 | 21.4% |
| $20,000,000 | 8% | 10 yr | $55,904 | $29,070,046 | $9,070,046 | 45.4% |
| $20,000,000 | 12% | 5 yr | $102,380 | $26,618,820 | $6,618,820 | 33.1% |
| $20,000,000 | 12% | 10 yr | $66,086 | $34,364,797 | $14,364,797 | 71.8% |

Because the payment scales linearly with principal, the "interest ÷ principal" column depends only on rate and term: **≈16% (6%/5yr), 21% (8%/5yr), 33% (12%/5yr or 6%/10yr), 45% (8%/10yr), 72% (12%/10yr).** Those five numbers are the whole pedagogy: doubling the term roughly doubles total interest; doubling the rate roughly doubles it too.

### 3.3 Same loans, **annual** payments (for comparison)

| Principal | Rate | Term | Annual payment | Total interest | Interest ÷ principal |
|---|---|---|---|---|---|
| $1,000,000 | 6% | 5 yr | $237,396 | $186,982 | 18.7% |
| $1,000,000 | 6% | 10 yr | $135,868 | $358,680 | 35.9% |
| $1,000,000 | 8% | 5 yr | $250,456 | $252,282 | 25.2% |
| $1,000,000 | 8% | 10 yr | $149,029 | $490,295 | 49.0% |
| $1,000,000 | 12% | 5 yr | $277,410 | $387,049 | 38.7% |
| $1,000,000 | 12% | 10 yr | $176,984 | $769,842 | 77.0% |
| $5,000,000 | 8% | 10 yr | $745,147 | $2,451,474 | 49.0% |
| $20,000,000 | 8% | 10 yr | $2,980,590 | $9,805,898 | 49.0% |

Annual instalments are a poor fit for a weekly game (one giant debit a year invites save-scumming around the due week); **weekly instalments are the natural product** and read like payroll.

### 3.4 Interest-only / bullet loans

Weekly interest = P × r / 52; principal due in full at maturity.

| Principal | Rate | Weekly interest | Total interest, 5 yr | Total interest, 10 yr | Balloon |
|---|---|---|---|---|---|
| $1,000,000 | 6% | $1,154 | $300,000 | $600,000 | $1,000,000 |
| $1,000,000 | 8% | $1,538 | $400,000 | $800,000 | $1,000,000 |
| $1,000,000 | 12% | $2,308 | $600,000 | $1,200,000 | $1,000,000 |
| $5,000,000 | 8% | $7,692 | $2,000,000 | $4,000,000 | $5,000,000 |
| $20,000,000 | 8% | $30,769 | $8,000,000 | $16,000,000 | $20,000,000 |

Bullet loans cost roughly **twice** the interest of a same-term amortizing loan (nothing is paid down) and concentrate risk at maturity ("the entire principal … is due at the end of the loan term"; hybrids with a grace period then partial amortization then a bullet also exist — Wikipedia, *Bullet loan*, https://en.wikipedia.org/wiki/Bullet_loan). A game should offer a bullet only as a short (1–3 year) bridge against a specific release, with the balloon shown on the calendar.

### 3.5 Revolving credit line

Borrow, repay, re-borrow up to a limit; interest "based only on the withdrawal amount and not on the entire credit line"; usually a small commitment fee on the unused portion (CFI, *Revolving Credit Facility*, https://corporatefinanceinstitute.com/resources/commercial-lending/revolving-credit-facility/). Confidence HIGH.

For this game a revolver is the honest replacement for the original's silent overdraft: **make the red balance a named, capped, interest-bearing line** with a published limit. That converts "cash < 0" from a meaningless sign into a drawn balance the player chose, and gives the warning ladder a real object to point at.

### 3.6 Standardized product tiers (proposal for paper scenarios)

| Tier | Product | Size cap (unit-free, see §5) | Term | Rate (era-relative, see §5) | Security | Who qualifies |
|---|---|---|---|---|---|---|
| A | Operating line (revolver) | ≤ 25% of trailing-52-week Studio Revenue | rolling, annual review | base + 2 pts | unsecured | any studio with 52 weeks of history and no current default |
| B | Facility mortgage (amortizing) | ≤ 60% of the facility's book value | 10 yr | base + 3 pts | that facility | positive trailing surplus |
| C | Production/bridge (bullet) | ≤ 50% of a committed film's negative cost | ≤ 2 yr, balloon | base + 5 pts | that film's receipts | studio must have released ≥ 3 films; one bridge per film |
| D | Rescue (available only in Distress/Administration) | small, creditor-dictated | ≤ 3 yr | base + 8 pts | everything | offered only as a remedy capability, symmetric for rivals |

"Base" is an authored era rate (§5), not a fixed number.

### 3.7 Covenants a game can use (each is one published ratio)

| Covenant | Formula | Typical real-world level | Suggested game level | Why it is legible |
|---|---|---|---|---|
| **Loan-to-value (LTV)** | loan ÷ asset value | "LTV % = (Loan Amount / Asset Value) × 100"; commercial real estate ~75%, inventory ~50%, cash 100% (CFI, *LTV Ratio*, https://corporatefinanceinstitute.com/resources/commercial-lending/loan-to-value-ratio/) | ≤ 60% of book value for facilities | "you can borrow up to 60 cents on every dollar of stage you own" |
| **Interest coverage** | operating surplus ÷ interest | EBIT/interest is a standard covenant (CFI *Debt Covenants*); 3× is a common comfort level | ≥ 3× trailing surplus | "your profit must be three times your interest bill" |
| **Debt service coverage (DSCR)** | (surplus − taxes) ÷ (principal + interest) | "many small and middle market commercial lenders will set minimum DSC covenants at not less than 1.25x" (CFI, *DSCR*, https://corporatefinanceinstitute.com/resources/commercial-lending/debt-service-coverage-ratio/) | ≥ 1.25× | "you must earn 1.25 dollars for every dollar of loan payment" |
| **Leverage (Debt/EBITDA)** | total debt ÷ trailing surplus | regulators said leverage "in excess of 6X Total Debt/EBITDA raises concerns for most industries" and looked for ability "to repay at least 50 percent of total debt over a five-to-seven year period" (Interagency Guidance on Leveraged Lending, 78 Fed. Reg. 17766, pp. 17773–17774, OCC Bulletin 2013-9a, https://www.occ.treas.gov/news-issuances/bulletins/2013/bulletin-2013-9a.pdf ; note the guidance was rescinded in Dec 2025 per Sullivan & Cromwell, https://www.sullcrom.com/insights/memo/2025/December/OCC-FDIC-Rescind-Interagency-Leveraged-Lending-Guidance — the 6× figure remains the well-known reference point) | ≤ 3× for a studio (film income is lumpy) | "you may owe at most three years of profit" |
| **Minimum cash / liquidity** | cash ≥ k weeks of fixed costs | common affirmative covenant ("minimum liquidity") | ≥ 8 weeks of payroll + overhead | "keep two months of wages in the bank" |
| **Negative covenants** | no new senior debt, no asset sales, no owner draws while in breach | standard (CFI *Debt Covenants*) | lock owner draws and new borrowing when any ratio is breached | one sentence each |

Illustrative arithmetic with a trailing surplus of $1.5M/yr (script section G): a 2× cap allows $3.0M debt whose 8% interest-only cost is 16% of surplus (coverage 6.2×); 4× allows $6.0M at 32% of surplus (3.1×); 6× allows $9.0M at 48% of surplus (2.1×) — which is why a cap around 3× and a 3× coverage floor land in the same place and can be explained as one rule.

### 3.8 Creditworthiness a game can compute

Lenders' "5 Cs" — character (repayment history), capacity (income vs existing debt), capital (owner's own money at risk), collateral, conditions (economy, purpose) — are assessed together; strength in one offsets weakness in another (CFI, *5 Cs of Credit*, https://corporatefinanceinstitute.com/resources/commercial-lending/5-cs-of-credit/ ; Wall Street Prep, https://www.wallstreetprep.com/knowledge/5-cs-of-credit/). Confidence HIGH.

A studio game already has, or could derive from existing ledger truth: **history** (weeks since last missed payment; count of defaults ever — "character"), **capacity** (trailing 52-week surplus, existing debt service), **collateral** (facility/set book value, committed films), **conditions** (era base rate, P15 market pressure). A three-band credit grade (Good / Watch / Impaired) derived deterministically from those four inputs is enough; it sets which tiers are offered and the spread over base.

### 3.9 Refinancing, default and acceleration rules (simple, deterministic)

- **Refinance:** allowed only from Stable, only into a tier the studio currently qualifies for, and only if the new loan's total remaining interest is shown next to the old one. A refinancing fee of 1–2% of principal stops free "roll it forever".
- **Missed payment:** an instalment not paid in its due week is *missed*; the game auto-draws the revolver if room exists (real overdraft behavior), otherwise the miss is recorded.
- **Default rule:** **N = 4 missed weekly instalments within 13 weeks** (one quarter) is an Event of Default — long enough to survive one bad release week, short enough to matter. A covenant breach is a default after **8 weeks uncured**.
- **Cure period:** 4 weeks after notice for payment defaults; 8 weeks for covenant defaults (mirrors real notice-and-cure; lengths are game choices).
- **Acceleration:** on an uncured Event of Default the full balance becomes due, default interest (+3 pts) accrues, and the studio enters Distress; acceleration is the *legal* bridge from "a loan problem" to "a corporate condition", and it should be the only way a loan moves the P15B ladder.
- **Cross-default:** default on any one loan defaults all — prevents juggling many small loans.

### 3.10 Scale check against the accepted economy

`OVERHEAD_BASE` is $15,000/week ($780k/yr). A $1M, 8%, 10-year loan adds $2,795/week — about 19% of base overhead — and a $5M facility mortgage on the same terms adds $13,976/week, nearly doubling fixed costs. Starting cash is $20M. So at current tuning, loans in the $1–5M range are *felt* but survivable, and a $20M loan (the whole starting purse) at 8%/10yr adds $55,904/week — 3.7× base overhead — which is the kind of number a covenant should refuse. These are scale observations, not tuning proposals.

---

## 4. The borrow → invest → borrow loop and why limits bound it

### 4.1 The exploit

If borrowed cash buys an asset the bank values at par, and the bank lends a fraction *L* of every asset, the player can borrow, buy, re-pledge, borrow again. With own equity *E* the loop converges to total assets **E / (1 − L)** (geometric series). Script section F: with E = $1M, LTV 50% → $2M assets, $1M debt; 70% → $3.33M; **90% → $10M assets on $1M of equity**. Without a cap (L → 1) the sum diverges: infinite leverage. This is exactly why every real lender caps LTV *and* looks at cash flow separately.

### 4.2 Why two different caps are needed

- **LTV / asset cap** bounds *how much* can be borrowed against things.
- **Debt/EBITDA (leverage) and coverage caps** bound *how much can be serviced*. Assets the player cannot service are the classic LBO failure; the 2013 guidance's 6× warning and its "repay at least 50 percent of total debt over a five-to-seven year period" test exist precisely because asset-backed lending alone allowed unserviceable stacks.
- **Rising marginal rates** make the loop self-limiting even inside the caps. Script section H with a $1.5M surplus and a tranche ladder 6% / 8% / 11% / 15% per additional 1× of surplus: at 1× the interest bill is 6% of surplus; at 2× it is 14%; at 3× it is 25%; at 4× it is 40% — and at 4× the coverage covenant (3×) is already broken, so the fourth tranche is never offered. The player sees the rate climb and the coverage gauge fall together; no hidden penalty is needed.

### 4.3 Simplest anti-exploit rule set (four rules, all public)

1. **Value collateral at book-after-salvage, not at cost** — a stage that cost $780k is collateral for at most 60% × its depreciated book, and the existing refund fractions already say a facility is worth half its capex on exit. Buying an asset with borrowed money therefore *reduces* borrowing capacity at the margin (you spend $1 of cash-capacity to gain ≤ $0.30 of new capacity).
2. **Total debt ≤ 3 × trailing-52-week operating surplus** (and surplus must be positive; a studio with no history borrows only against the founder's own cash contribution, i.e. Tier A only).
3. **Interest coverage ≥ 3× and minimum cash ≥ 8 weeks of fixed costs**, tested every week; breach → Warning with an 8-week cure, no new borrowing while breached.
4. **Marginal spread rises 2–4 points per extra 1× of leverage**, and refinancing charges a fee; cross-default across all loans.

These four are unit-free, deterministic, explainable in one sentence each, and symmetric for rivals (P15 laws 1 and 9: no hidden subsidy, same law for everyone).

---

## 5. Era and inflation: 1920 vs 2040 dollar scale

### 5.1 The facts

- US CPI-U annual average: **20.0 in 1920 → 16.7 in 1930 → 24.1 in 1950 → 38.8 in 1970 → 130.7 in 1990 → 195.3 in 2005 → 258.8 in 2020 → 321.9 in 2025**; i.e. a **~16× price level** between 1920 and 2025, with 1921 at −10.9% and the early 1930s deflationary. Source: Minneapolis Fed CPI table — https://www.minneapolisfed.org/about-us/monetary-policy/inflation-calculator/consumer-price-index-1913- . Confidence HIGH.
- US prime lending rate: **21.50% on 1980-12-19**, **3.25% from 2008-12-16**, **6.75% as of 2025-12-11** (FRED series PRIME — https://fred.stlouisfed.org/data/prime); 1929 prime ranged 5.5–6% (Economic Report of the President 2010, Table B-73 — https://www.govinfo.gov/content/pkg/ERP-2010/pdf/ERP-2010-table73.pdf). Confidence HIGH for FRED, MEDIUM for the 1929 figure (secondary table).

Nominal fixed-dollar limits are therefore meaningless across a 1920–2040 campaign: a "$1M cap" is a fortune in 1925 and a rounding error in 2035. Nominal rates also swing by a factor of six within the real century.

### 5.2 What the code already does

`era.costScale` (default 1.0, the only era field with a mechanic) multiplies required negative cost. So the accepted engine already has **one scalar that says "how expensive is this era"**, applied to film cost. Anything financial that is authored in dollars must either be multiplied by the same scalar or expressed as a ratio. The P13 package (eras) owns whether/how `costScale` changes over time; nothing here decides that.

### 5.3 Recommendation: a unit-free rule

1. **State every limit as a multiple of a trailing observed quantity**, never in dollars: revolver ≤ 25% of trailing-52-week Studio Revenue; total debt ≤ 3× trailing surplus; minimum cash ≥ 8 weeks of current fixed costs; LTV ≤ 60% of book. Trailing quantities inflate with the economy automatically and need no era table.
2. **State rates as "base + spread"** with **base authored per era band** (e.g. 5–6% for the 1920s, 2–3% around 1950, 10–20% around 1980, 3–7% for 2010–2025, authored assumption for 2026–2040) — or, if P13 rejects a rate timeline, use one **fixed real rate (~4–5%)** and let `costScale` carry the price level. Either is legible; mixing them (fixed nominal rates on inflating balances) is not.
3. **Never store a dollar constant in a covenant.** Where a floor is unavoidable (e.g. a minimum loan size), multiply by `era.costScale` at the moment of quoting and record the scale used in the loan record for auditability, exactly as `requiredNegative` already does at package time.
4. **Book values for collateral should carry the `costScale` of the year they were built**, so a 1925 stage is not collateral for 2035 dollars unless revalued — which is itself a legible event ("your lot has been revalued").

---

## 6. Original-game parity summary for this topic

| Feature | Retail shipped? | Evidence | Confidence |
|---|---|---|---|
| Cash can go negative | **Yes** | manual pp. 6–7 ("balance can go into the red"); `manual.txt:129` | HIGH |
| Negative cash blocks most construction | **Yes** | manual pp. 6–7; Prima p. 14 "Building in Debt" exception list; GameFAQs Maxx (`gamefaqs-maxx.txt:659–664`) | HIGH |
| Cash Balance contributes to chart ranking | **Yes** | manual pp. 6–7 ("contributes toward your ranking in the Charts") | HIGH |
| Interest on a negative balance | **No inspected source establishes it** | absent from manual, Prima, GameFAQs, gamepressure extractions | MEDIUM (absence ≠ proof) |
| Loans, banks, credit lines | **No inspected source establishes them** | "Bank" appears only as set names (Urban Modern Bank, Wild West Bank) | MEDIUM |
| Bankruptcy / game over | **No inspected retail source establishes it**; pre-release GameSpot preview mentioned a studio going bust (PRE-RELEASE PROMISE, per P15 package §5.5) | P15 package §5.5, §6 | HIGH that retail sources are silent |
| Studio valuation / net worth display | **No inspected source establishes it** | — | MEDIUM |

Everything in §§1–5 is therefore **successor design foundation**, not parity, and must never be labeled parity.

---

## 7. Verdicts on prior P15 finance-adjacent claims

- **CONFIRMED** — "Negative cash is not bankruptcy" (P15 law 5; roadmap §5.3). Correct as finance, not just as taste: cash-flow insolvency needs an unpaid debt that has fallen due; the game has no creditor and no due debt, so the sign of cash is not an insolvency event.
- **CONFIRMED** — "P15B cannot infer debt, valuation, insolvency, or an acquisition price from the present ledger" (roadmap §5.3). The accepted ledger is cash-only; there is no liabilities register (obligations exist only as selectors), no asset register (only capex history plus salvage fractions), and no forecast — every valuation method except book needs at least one of those.
- **QUALIFIED** — "P11's incomplete runway selectors cannot become distress authority". True, but the runway rule (`economyView.ts:124–135`) is a well-defined *cash-flow early-warning* input that any warning predicate would legitimately consume; what makes it incomplete is that it ignores scheduled obligations and has no due-payment concept, not that the arithmetic is wrong.
- **CONFIRMED** — "Loans, bailouts, investors, forced sales, or acquisition are not implied" by distress remedies (P15 §16); accepted code states outright that no loans/financing mechanic exists (`studioRunRecap.ts:1003`), and D-16 R10 / D-17B rulings defer them.
- **CONFIRMED** — Original hard bankruptcy: "pre-release wording conflicts with retail-source silence; do not infer" (P15 §6). Manual pp. 6–7 and Prima p. 14 describe only a red balance with a build lockout.
- **CONFIRMED** — Valuation belongs in P16+ (P15 §25; Owner rulings §5). Any "Estimated Studio Value" needs an earnings history and a liabilities model that P15 neither owns nor should build; a "Book Net Worth" *read model* could be built from existing truth, but that is a P11 change needing its own authorization.
- **QUALIFIED** — The P15B annex ladder (`stable/warning/distress/recovery/dormant`) is the right shape and matches real staging (notice → default → administration → moratorium) and the Owner's "keep the studio, lose control" philosophy, but its trigger predicates cannot be written until something *falls due*; today only payroll/overhead/opex "fall due", and they are auto-debited into overdraft rather than missed, so the first honest trigger object would be a capped, named credit line replacing the silent overdraft.

---

## 8. Open uncertainties

1. Whether the Owner ever wants a liabilities side at all; every current ruling says "not now" and the original shipped without one.
2. If loans are ever approved, whether the red balance becomes a named revolver (recommended here) or stays an interest-free overdraft with a lockout (original parity); the two produce different warning ladders.
3. Which trailing measure is the studio's "operating surplus" for covenants, given that production is expensed at commit rather than amortized over the run (lumpiness).
4. How `era.costScale` will evolve under P13 (fixed 1.0 today), and whether a per-era base rate is acceptable to P13's alternate-history rules.
5. Whether rivals' hidden Cash (P12 law) can support symmetric covenant tests without leaking private ledgers (P15 open question 8).
6. Whether "Book Net Worth" would be read by players as a score, which the P15 package's anti-score laws would then need to police.

---

## 9. Sources used

**Project authority and code (read-only copies):** `authority/P15-PACKAGE.md` §§2, 5.5–5.7, 6, 11, 16, 17, 23, 25; `authority/P15-BUILDER-ANNEX.md` §C.3 (lines 114–128), §Q; `authority/P13-P15-OWNER-RULINGS.md` §§4–7; `authority/P13-P15-LONG-RANGE-ROADMAP.md` §5.3, §23 (lines 765–776); `authority/P12-TO-P13-PRODUCER-HANDOFF.md` line 15; accepted snapshot `592e926`: `src/core/tuning.ts:70, 419–420, 596, 816, 1613`; `src/core/types.ts:284–289`; `src/core/worldgen.ts:657–663`; `src/core/hollywoodPolicy.ts:45`; `src/core/reception.ts:264`; `src/core/economyView.ts:112–135, 302–319`; `src/core/financeReport.ts:1–60, 273–288`; `src/core/studioRunRecap.ts:951–960, 1003`; `src/core/calendar.ts:17`; `docs/D-16-OWNER-RULINGS.md` R3, R8, R10; `docs/D-17B-OWNER-RULINGS.md` lines 85–97; `docs/HANDOFF.md:586–590`; `docs/build-contract.md:325, 599`.

**Original game:** *The Movies* manual (Steam PDF), printed spread pp. 6–7 "Cash Balance" (`original-text/manual.txt:126–130`); Prima Official eGuide printed p. 14 "Building in Debt" (`prima.txt:769–777`); GameFAQs FAQ by Maxx (`gamefaqs-maxx.txt:659–664`); mechanics bible lines 2088, 2782, 2866, 3375, 4066 (secondary compilation, cross-checked).

**Finance and law (web):**
- Wikipedia, *Enterprise value* — https://en.wikipedia.org/wiki/Enterprise_value
- Wikipedia, *Business valuation* — https://en.wikipedia.org/wiki/Business_valuation
- CFI, *EV/EBITDA* — https://corporatefinanceinstitute.com/resources/valuation/ev-ebitda/
- CFI, *Burn Rate* — https://corporatefinanceinstitute.com/resources/valuation/burn-rate/
- CFI, *Debt Covenants* — https://corporatefinanceinstitute.com/resources/commercial-lending/debt-covenants/
- CFI, *Debt Service Coverage Ratio* — https://corporatefinanceinstitute.com/resources/commercial-lending/debt-service-coverage-ratio/
- CFI, *Loan-to-Value Ratio* — https://corporatefinanceinstitute.com/resources/commercial-lending/loan-to-value-ratio/
- CFI, *Revolving Credit Facility* — https://corporatefinanceinstitute.com/resources/commercial-lending/revolving-credit-facility/
- CFI, *5 Cs of Credit* — https://corporatefinanceinstitute.com/resources/commercial-lending/5-cs-of-credit/ ; Wall Street Prep, *5 Cs of Credit* — https://www.wallstreetprep.com/knowledge/5-cs-of-credit/
- Wall Street Prep, *Accumulated Deficit* — https://www.wallstreetprep.com/knowledge/accumulated-deficit/ ; WallStreetMojo, *Negative Shareholders Equity* — https://www.wallstreetmojo.com/negative-shareholders-equity/ ; IMA, *The Downsides of Stock Buybacks* — https://www.sfmagazine.com/articles/2022/september/the-downsides-of-stock-buybacks
- Wikipedia, *Amortization calculator* — https://en.wikipedia.org/wiki/Amortization_calculator ; Wikipedia, *Bullet loan* — https://en.wikipedia.org/wiki/Bullet_loan
- UK Insolvency Act 1986 s.123 — https://www.legislation.gov.uk/ukpga/1986/45/section/123 ; s.214 — https://www.legislation.gov.uk/ukpga/1986/45/section/214
- GOV.UK, *Options when a company is insolvent* — https://www.gov.uk/government/publications/options-when-a-company-is-insolvent/options-when-a-company-is-insolvent
- US Courts, *Chapter 11 Bankruptcy Basics* — https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics/chapter-11-bankruptcy-basics ; *Chapter 7 Bankruptcy Basics* — https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics/chapter-7-bankruptcy-basics
- Cornell LII, 11 U.S.C. §507 — https://www.law.cornell.edu/uscode/text/11/507 ; §524 — https://www.law.cornell.edu/uscode/text/11/524
- Fredrikson & Byron, *Fortifying Your Loan Portfolio* — https://www.fredlaw.com/alert-fortifying-your-loan-portfolio-essential-provisions-and-default-notices ; Law Insider, acceleration/event-of-default clauses — https://www.lawinsider.com/clause/acceleration-event-of-default
- OCC Bulletin 2013-9a, *Interagency Guidance on Leveraged Lending*, 78 Fed. Reg. 17766 (pp. 17773–17774) — https://www.occ.treas.gov/news-issuances/bulletins/2013/bulletin-2013-9a.pdf ; Sullivan & Cromwell on its Dec 2025 rescission — https://www.sullcrom.com/insights/memo/2025/December/OCC-FDIC-Rescind-Interagency-Leveraged-Lending-Guidance
- Minneapolis Fed, CPI 1913– — https://www.minneapolisfed.org/about-us/monetary-policy/inflation-calculator/consumer-price-index-1913-
- FRED, *Bank Prime Loan Rate* (PRIME) — https://fred.stlouisfed.org/data/prime ; ERP 2010 Table B-73 — https://www.govinfo.gov/content/pkg/ERP-2010/pdf/ERP-2010-table73.pdf

**Computation:** `scratchpad/loan_tables.py` → `scratchpad/loan_tables.out` (all tables in §3–4 reproduced from it).
