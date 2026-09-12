# Dossier 09 — Valuation, Transaction and Auction Principles for Project: Studio (P16)

Evidence agent dossier for assignment §2.N, O, L, M, S, J and §3 scenarios A–F.
READ-ONLY research. No repository edits, no runtime, no implementation. All numbers in §5 are
**PAPER HYPOTHESES** and are marked as such; none is tuning, product law or Owner-approved.

---

## 1. Scope

Build the simplest transparent structure that keeps five numbers apart — **BOOK NET WORTH**,
**STUDIO (ENTERPRISE) VALUATION**, **TRANSACTION PRICE**, **AUCTION PRICE**, **LIQUIDATION VALUE** —
grounded in (a) standard corporate-finance concepts translated into game rules and (b) how shipped
tycoon games actually present valuation; then produce a valuation ladder with named components and
anti-double-counting rules, a healthy-deal price model with visible willingness states, an auction
model with rival bidders, six worked paper scenarios, an anti-snowball analysis of financing, and
rival-AI bidding heuristics. It does not cover StoryProperty structure, rights granularity, the
transfer bundle, physical property, active-production handling, history/identity, or the package
boundary except where valuation arithmetic depends on them (those belong to other dossiers).

Terminology used below (mine, for clarity):

| Term | Meaning in this dossier |
|---|---|
| CASH | P11 literal `studio.cash`; may be negative. |
| BNW | Book Net Worth: accounting identity from P11 rows, no judgment. |
| LV | Liquidation Value: cash a forced closure/auction floor would raise. |
| OV | Operating Value: capitalised trailing operating surplus of the target *as a standalone*. |
| SV | Studio Valuation: the intrinsic going-concern value of the whole target (the assignment's "enterprise/studio valuation"). |
| ASK | Seller's minimum acceptable price in a healthy deal (SV × visible state band). |
| BUYER PRIVATE VALUE (BPV) | What one particular buyer rationally gains from the parts it receives; buyer-relative; never shown as the target's value. |
| CLEARING BID | Auction price emerging from rival bids between reserve (LV) and each bidder's BPV. |

---

## 2. Method and sources consulted

**Repository (read-only exports):** accepted code `p12-accepted/src/core/*.ts` (types, tuning,
placement, employment); accepted docs (`OWNER-RULINGS-HOLLYWOOD-HORIZON.md`, P11/P12 packages,
P11A register, consumer contract §15, handoff); approved P13–P15 docs and Owner rulings
(`p13-docs/docs/design/*`); original corpus (official manual, Prima eGuide text, prior
`MECHANICS-BIBLE.md` as prior prose only).

**Corporate finance (primary/professional):** Damodaran, *The Value of Control: Some General
Propositions* (NYU Stern PDF, text-extracted locally); Damodaran, *Valuing Distressed and Declining
Companies* (NYU Stern PDF); Damodaran blog *A tangled web of values: Enterprise value, Firm Value and
Market Cap* (2013); CFA Institute refresher reading *Equity Valuation: Applications and Processes*;
DeWitt LLP *Asset Purchase vs. Stock Purchase*; Ward and Smith *The Section 363 Sale Process*.

**Tycoon comparators:** OpenTTD source (`economy.cpp`, `company_cmd.cpp`, GitHub master, fetched
2026-09-11) and OpenTTD wiki *Transport company*; Capitalism 2 official manual (Steam PDF, Enlight)
and Capitalism Lab official pages; GearCity official wiki *How-to: Stock Market*; Railway Empire
(gamepressure guide; Steam community for premium figures); Software Inc. official wiki *Stocks* +
Steam discussion (player experience); Football Manager 26 official feature *Introducing
Intermediaries and Offloading Players*; TWC 2018 §363 sale (TheWrap, two articles).

**What failed (noted, alternates used):** OpenTTD wiki `Manual/Company value` → 404 (used the
*Transport company* page + source code); Damodaran control PDF unreadable by WebFetch → extracted
locally with `pdftotext`; Deadline and Variety → tollbit redirect (used TheWrap); CNBC → 403;
Software Inc. wiki `Companies` → 404 (used `Stocks` page, itself marked WORK IN PROGRESS);
Mad Games Tycoon fandom wiki → 402 and MGT2 Steam news body empty → MGT2 left UNVERIFIED;
fmscout → 403. Capitalism Lab official pages do not state a price formula (noted as gap).

---

## 3. Findings

Each finding: source · locator · what it proves · confidence · prior-prose status.

### 3.1 What the accepted game actually has (CURRENT/ACCEPTED CODE)

**F1. The studio is cash-only; there is no debt, loan, equity or valuation object.**
Source: `p12-accepted/src/core/types.ts:291-296` — `export type Studio = { cash: number; standing: Standing; activeProductions: Production[]; releasedFilms: FilmResult[] }`. Ledger kinds at `types.ts:352-364, 385-396` are production, boxOffice, payroll, signingBonus, termination, freelancerFee, studioRevenue, overhead, publicity, constructionCapex, facilityOpex, facilityDemolitionRefund, setCapex, setMaintenance, setDemolitionRefund. A repo-wide grep for `netWorth|valuation|debt|loan|auction|liquidat` finds no engine symbol (only a recap string at `studioRunRecap.ts:1003`: "No recovery mechanic (loans/financing) exists in the current rules.").
Proves: BNW today can only be built from cash, locked receipts, capital rows and contract facts; "debt" does not exist as an instrument. Confidence: HIGH. Prior prose: **CONFIRMED** (P12 §466 "Studio is a frozen singleton leaf with only cash, Standing, active productions, and released films").

**F2. Player financing/loans are Owner-prohibited; a P16 "debt to finance deals" lever cannot be assumed.**
Source: `p12-accepted/docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md:64-65` — "The prior prohibition (no financing, loans, bailouts, restructuring, hard bankruptcy, failure ladder or arbitrary cash sink) remains in force **for the player's studio** and is unchanged." `pkg-docs/.../PACKAGE-11.md:1299` — "No current authority exists for loans, credit facilities, interest-bearing debt instruments, investors, equity, bonds, interest, tax, acquisition, or public markets." `P11A-DECISION-AND-REQUIREMENT-REGISTER.md:140` — `P11-REQ-041` "Loans/investors/external financing require separate Owner gate … **OWNER-BLOCKED**".
Proves: the assignment's instruction "assume P11 may add [debt]" must be read as *P11 may add only after a new Owner ruling*; the anti-snowball design must work cash-only. Confidence: HIGH. Prior prose: **QUALIFIED** (assignment §S lists "debt needed to finance deals" as a lever; it is not available without reopening an Owner prohibition).

**F3. The only "debt" the game has is negative cash, and the original worked the same way.**
Source: `PACKAGE-11.md:52` law 1 "**Cash is literal.** Do not subtract future obligations into an invented 'available cash' … Show obligations beside cash."; roadmap `CODEX-P13-P15-LONG-RANGE-ROADMAP.md:165` "Known obligations remain beside Cash, not secretly subtracted. Negative cash is currently recoverable and does not mean bankruptcy." Original manual `manual_english.txt:129-130` "Your balance can go into the red but when you're in debt, you won't be able to build new sets or add certain facilities"; Prima `prima_eguide.txt:214` "Build in Debt: No/Yes" per facility. OpenTTD source comment `economy.cpp:183` "Negative balance is basically a loan."
Proves: for valuation purposes "debt" = overdraft (negative cash) plus any future P11 instrument; Scenario B's "heavy debt" must be modelled as deep negative cash plus committed obligations. Confidence: HIGH. Prior prose: **CONFIRMED**.

**F4. P15 cannot derive valuation or an acquisition price; it belongs to P16.**
Source: roadmap `:167` "P15B cannot infer debt, valuation, insolvency, or an acquisition price from the present ledger."; `:215` "acquisitions, mergers, co-productions, labels/subsidiaries, library/IP ownership transfer, and valuation belong in P16+"; Owner rulings `CODEX-P13-P15-OWNER-RULINGS.md:249-250` parking lot lists "valuation"; consumer contract `P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md:364-369` "It may also later own mergers, valuation, stakes … under a separate Owner charter."
Proves: a valuation read model is P16 scope by approved documentation; P15's distress states are inputs to it, not owners of it. Confidence: HIGH. Prior prose: **CONFIRMED**.

**F5. A recoverable (liquidation) value for tangible capital already exists in accepted law and is deliberately lossy.**
Source: `src/core/tuning.ts:1613` `FACILITY_DEMOLITION_REFUND_FRACTION = 0.5`; `tuning.ts:816` `SET_DEMOLITION_REFUND_FRACTION: 0.35`; `placement.ts:98-100` "CAPITAL IS STRICTLY LOSSY. A demolition refunds a fraction of the ORIGINAL capex, never more, so build-then-demolish always nets negative"; invariant `placement.ts:1152-1155` fraction `>= 0 && < 1`. Prima parity: `prima_eguide.txt` (Builders section) "permanently demolish the building and recoup a depreciated portion of its original purchase price."
Proves: "tangible assets at recoverable value" has an authoritative, invariant-protected basis (50%/35% of original capex) that is exactly the liquidation question. Confidence: HIGH. Prior prose: **CONFIRMED** (P11 `:641` "net capital committed/recovered, not a depreciation schedule or asset valuation").

**F6. The demolition credit answers the liquidation question, not the replacement/adoption question.**
Source: P13 `CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13.md:689` — "Its amounts must never be computed from the accepted demolition credit, a rounded fraction of a blueprint's capital cost, because that credit answers a different question and is deliberately lossy."
Proves: the ladder needs two tangible bases — recoverable (demolition credit) for BNW/LV and "inside operating value" for going-concern — and must never present the credit as replacement cost. Confidence: HIGH. Prior prose: **QUALIFIED** (P13's warning is about option-B cancellations; the same logic applies to valuation).

**F7. Contract liabilities and exit costs are already computable.**
Source: `src/core/employment.ts:172-180` — `guaranteedComp = weeklySalary × remainingWeeks`; `terminationCost = HIRING_TERMINATION_FRACTION × guaranteedComp`; `tuning.ts:391` `HIRING_TERMINATION_FRACTION: 0.5`; `tuning.ts:387` `CONTRACT_SIGNING_BONUS_FRACTION: 0.18`.
Proves: "talent under contract" can be shown as (a) committed payroll (guaranteed remainder), (b) cost to clear (50%), and (c) an avoided-signing-bonus proxy (18% of annual salary) for wanted people — all from accepted law, no new formula. Confidence: HIGH. Prior prose: **NEW** for valuation use.

**F8. Production cost is sunk at greenlight; theatrical receipts are locked and scheduled.**
Source: `types.ts:356` `'production' // negative + marketing debited at greenlight`; `types.ts:299-312` `TheatricalRun { weeklyGross: number[] // locked; studioShare // locked; cumulativeStudioRevenuePaid }`; P11 `:43, :824` "Studio Revenue scheduled: remaining locked receipts."; P11 `:59` law 8 "They never invent future hits, market growth, financing, or ungreenlit films."
Proves: (i) scheduled receipts are a deterministic receivable and belong in BNW at par; (ii) an active production has no remaining direct cash cost (payroll aside), so its "cost" is informational and its "expected value" may not be forecast by the engine — any monetary weight must be a published cost-based fraction, not a hit forecast. Confidence: HIGH. Prior prose: **CONFIRMED**.

**F9. Land has no cost basis or market yet.**
Source: `P08-P10-DEFERRED-NOT-DROPPED-REGISTER.md:26` `P09-REQ-035 | LATER | Land acquisition/property expansion waits for parcels, price, zoning/unlock, and finance authority`; P09 `:216` "Land market | LATER".
Proves: a land row in the ladder must read "not priced (no land market)" until P09-LATER-LAND ships; endowed parcels cannot be given a book value without inventing one. Confidence: HIGH. Prior prose: **CONFIRMED**.

**F10. Rival finance is a compact conserved account with the same primitives, so rival BNW/SV are computable symmetrically, but exact rival cash is private.**
Source: P12 annex `:151` "finance | cash, obligations, reserve target, current-period aggregates | hiring/films/distress must be conserved"; P12 `:846` "Do not expose exact cash, internal strategy weights, unrevealed slate…"; P12 `:881` "Acquired is a later distinct outcome, never an alias for closed."; P12 `:885` "deterministic entrants maintaining a minimum of **3 active AI rivals**".
Proves: the same ladder can be evaluated for any `StudioId`; a P16 disclosure rule is required to decide what a bidder/suitor sees (bands vs exact). Confidence: HIGH. Prior prose: **CONFIRMED**.

**F11. Valuation must never feed Standing or Power Ranking.**
Source: P15 `:453` Power Ranking "never reads Standing, cash/valuation, private slate…"; roadmap `:682` "excludes Standing, cash/valuation".
Proves: a P16 valuation read model is a separate lens; it cannot become a fourth Standing channel or a ranking input. Confidence: HIGH. Prior prose: **CONFIRMED**.

**F12. Technology confers no monopoly; its value to a buyer is avoided research, not rent.**
Source: P13 `:873` "discovering a capability confers no monopoly over it."; `:871` Owner-selected direction for supplier commercialization "P16+ remains the default placement".
Proves: technology belongs in the *buyer's* strategic increment (gap-relative) and inside the target's OV, never as a standalone asset line in SV — otherwise double counted. Confidence: HIGH. Prior prose: **CONFIRMED / QUALIFIED**.

**F13. P15 distress remedies do not include asset sales or acquisition.**
Source: P15 `:615-619` "Distress must have at least two legitimate recovery routes—such as reducing future obligations, delaying/cancelling an uncommitted plan, completing a conserved release, or entering dormancy… Loans, bailouts, investors, forced sales, or acquisition are not implied."
Proves: if §K's "asset sales as a recovery mechanism" is adopted, it is a P16-authored remedy family that P15B must reference by boundary agreement, not an existing P15 route. Confidence: HIGH. Prior prose: **QUALIFIED**.

### 3.2 Original The Movies (SHIPPED RETAIL / PRIMA)

**F14. The original had cash, a cash-only "Capital" rating, depreciated building sale, and Star/script sale — no net worth, valuation or acquisition.**
Source: manual `manual_english.txt:124-127` "Cash Balance … Your Cash Balance contributes toward your ranking in the Charts"; Prima (Studio Rating) "Capital 24% of Studio Rating Capital is a measure of your studio's wealth based on the amount of money your studio has in the bank … measured on a scale from $50,000 (lowest rating) to $1,600,000 … Above $300,000, it takes progressively more to gain points"; manual `:428-431` "Star and Script selling – Sometimes you might want to sell off Stars or scripts to rival studios to make some quick money … you'll be rewarded with cold, hard cash."; P15 `:254-262` acquisition **REFUTED** as shipped.
Proves: no original parity exists for BNW/SV/auction; the only parity facts are (i) cash rating with diminishing returns, (ii) lossy building resale, (iii) fixed-quote asset sales of Stars/scripts, (iv) in-debt build lockout. Confidence: HIGH. Prior prose: **CONFIRMED** (P11 `:132` "Reject calling cash/assets a recovered `Studio Worth`").

### 3.3 Corporate-finance basics (translated, not imported)

**F15. Enterprise value is the value of operating assets; cash and non-operating assets are netted; putting an intangible on the balance sheet *and* in the cash flows double counts.**
Source: Damodaran blog (2013): "The third measure of market value nets out the market value of cash & other non-operating assets from firm value to arrive at enterprise value … enterprise value should be equal to the market value of the operating assets of the company."; "Double counting of operating assets: … even if brand name and customer lists are valued and put on the balance sheet, they are very much part of the operations of the firm and should not be netted out as non-operating assets. Only assets that don't contribute (and are never expected to contribute) to operating income can be treated as non-operating assets."; "the difference between book and market value is likely to be small for healthy firms but much larger for distressed companies."
Proves: the one-lane rule (every asset is either capitalised in OV or priced as a non-operating asset, never both) is standard doctrine; brand/tech/plant live inside OV when OV exists. Confidence: HIGH.

**F16. Going-concern value, liquidation value and fair value are three different definitions.**
Source: CFA Institute refresher reading: intrinsic value "incorporates the going-concern assumption, that is, the assumption that a company will continue operating for the foreseeable future. In contrast, liquidation value is the company's value if it were dissolved and its assets sold individually."; "Fair value is the price at which an asset (or liability) would change hands if neither buyer nor seller were under compulsion to buy/sell and both were informed about material underlying facts."
Proves: SV (going concern), LV (dissolved, sold individually) and healthy TRANSACTION PRICE (no compulsion) are distinct by definition; auction price is the compelled case. Confidence: HIGH.

**F17. Book value is not liquidation value; orderly liquidation ≠ distress sale; value is the higher of going concern and orderly liquidation.**
Source: Damodaran, *Valuing Distressed and Declining Companies* (NewDistress.pdf): "that does not imply that book value is a good measure of liquidation value"; "Expected Value = Maximum (Status Quo Value, Orderly Liquidation Value)"; orderly liquidation "can wait until the right time and the right bidder … there should be little or no illiquidity discount"; "If the likelihood of distress is high, access to capital is constrained … and distress sale proceeds are significantly lower than going concern values, discounted cash flow valuations will overstate firm and equity value".
Proves: SV = max(going-concern basis, asset basis) is standard; a forced auction reserve must carry a haircut below orderly values; BNW must not be presented as "what you would get". Confidence: HIGH.

**F18. The value of control is the gap between status-quo and optimal operation; it is larger for badly run firms; there is no rule-of-thumb premium.**
Source: Damodaran, *The Value of Control: Some General Propositions* (slides 22–23): "The value of controlling a firm derives from the fact that you believe that you or someone else would operate the firm differently (and better)"; "the premium should be larger for poorly managed firms and smaller for well managed firms"; "There can be no rule of thumb on control premium … The notion that control is always 20-30% of value cannot be right."; "The control premium should be a function of the ease of making management changes".
Proves: the assignment's "control premium" for a *healthy* target is not Damodaran's buyer-side value of control (which is *small* for well-run firms); it is a seller-side reluctance/independence premium. The two must be named separately or the model contradicts itself (see §4.2). Confidence: HIGH. Prior prose: **QUALIFIED** (assignment §N/§O wording).

**F19. Asset deal vs stock deal: cherry-pick vs everything-including-unknown; contracts need consent in asset deals.**
Source: DeWitt LLP: "In an asset purchase, the purchaser only acquires the assets and liabilities it identifies and agrees to acquire and assume"; "In a stock purchase … acquires all the target company's assets, rights, and liabilities (including undisclosed or unknown liabilities)"; "most contracts contain anti-assignment clauses. Conversely, stock purchases usually do not require the assignment of contracts".
Proves: assignment §M options 1/3 are asset deals, 2/4 are entity deals; the legible game split is "whole entity (everything transfers, priced by SV+state)" vs "lots (choose, priced by reserve+bids)". Confidence: HIGH.

**F20. Distressed sales use a reserve-like stalking-horse floor, minimum overbid increments, free-and-clear transfer, and buyer-selected contract assumption.**
Source: Ward and Smith: "Buyers acquire the assets free and clear of liens or other claims"; "requiring minimum bid increments (e.g., how much higher a subsequent bid must be in order to defeat the stalking horse bidder's offer)"; "The debtor selects the highest and best bid at the auction."; "the buyer to assume certain contracts, thereby curing any defaults". TWC 2018 (TheWrap): Lantern "stalking horse bidder for virtually all of the company's assets" to keep "the studio's employees on as a 'going concern'" for "$310 million"; filing listed "assets and liabilities of between $500 million and $1 billion"; secured creditors "Union Bank and Bank of America who are owed $156 million".
Proves: a real distressed studio sold as one going-concern lot at a price far below book liabilities, with old claims left with the estate — the "clean whole-lot purchase, creditors absorb the shortfall" shape. Confidence: HIGH (process), MEDIUM (TWC figures via trade press).

### 3.4 Tycoon comparators — how valuation is actually presented

**F21. OpenTTD: three separate formulas — company value, hostile-takeover price, bankruptcy offer — with different treatment of cash and loan.**
Source: OpenTTD `economy.cpp` (GitHub master, 2026-09-11): `:116-145` asset value = `num_station_facilities × Price::StationValue × 25` + `Σ vehicle value × 3 >> 1`; `:151-160` `CalculateCompanyValue = assets − current_loan (if including_loan) + money; max(value, 1)`; `:162-193` `CalculateHostileTakeoverValue = assets + current_loan + (−money if money<0) + Σ_4 quarters max(income+expenses,0) × 2`, doc-comment "The profit for the next two years (if positive) based on the last four quarters. And on top of that, they walk away with all the money they have in the bank."; `:547-620` bankruptcy: month 4 warning, month 7 `bankrupt_value = CalculateCompanyValue(c, false)` ("Don't consider the loan"), month 10 deletion; `company_cmd.cpp:745-796` offers go first to "the company with the highest performance history", each with a timeout, then the next; `:2018-2050` buyer pays `bankrupt_value` or the hostile value; the company is deleted (cash/loan do not transfer). Wiki *Transport company*: "The company value is a score … based on your stations facilities and price, your vehicles price and your real money(money - loan) and it is 1 at min."
Proves: a shipped, long-lived tycoon game already separates (i) a book-like value (assets + cash − loan), (ii) a healthy-takeover price (assets + loan repaid + 2 years of profit; seller keeps cash), (iii) a distressed price (assets + cash, loan discharged by creditors) and (iv) a sequential fixed-price offer rather than an auction. Confidence: HIGH.

**F22. Capitalism 2 (official manual): Net Worth vs Market Value are separate rows; tender must exceed market; owners can reject and demand more, or refuse at any price.**
Source: Cap2 manual (Steam PDF): "Net Worth. The difference between the corporation's total assets and total loans."; "Market Value … calculated by multiplying the corporation's stock price by the total number of outstanding shares"; EPS uses operating earnings "so that the stock price correctly reflects the profit-earning ability of the corporation and is not affected by the price fluctuation of stocks that the corporation owns" (an explicit anti-double-count); "Your offer must be above the current stock price to entice the shareholder to sell … If the shareholder is not satisfied with your offer, the shareholder will reject it and demand a new price."; "NOTE: Some shareholders will refuse to sell their shares no matter how much you offer them because their main interest is in controlling the corporation."; merger at ≥75%.
Proves: shipped precedent for (a) two headline numbers side by side, (b) a visible ask above market, (c) a refuse-regardless state — the assignment's §L/§O requirements. Confidence: HIGH.

**F23. Capitalism Lab: distressed targets are cheap and buyer-relative; merger acquirer = larger market value.**
Source: capitalismlab.com "Distressed companies are cheap, and some of them are worth more to you than to anyone else — a technology that complements your own, for instance, at a fraction of what it would cost to develop."; "a company on the brink of bankruptcy can be rescued — by you, buying all of its shares"; merging subsidiaries "The company with the larger market value is the one that acquires the other."; "You must own 75% or more of the equity in both companies." Price formula: not published on official pages (gap).
Proves: the buyer-relative strategic increment (technology gap) is the explicit design intent of a leading business sim; official pages leave the price opaque — a legibility gap Project: Studio should not copy. Confidence: HIGH (quotes), price model UNVERIFIED.

**F24. GearCity: value = share price × shares; takeover by shareholder vote whose willingness is driven by target health; buyer receives everything including cash; target becomes a marque.**
Source: GearCity wiki *How-to: Stock Market*: "If 50% of the shares are yes votes, then the acquisition is approved."; "If their company is doing poorly or they're predicting a downward trend, they're more likely to vote yes … But if the company is healthy and doing well, they're unlikely to allow the buyout."; "the amount of money you pay is distributed to shareholders. In return, you receive all assets that the company had. This includes cash funds, branches, designs, marques, shares, and factories."; "The company will become one of your marques."
Proves: willingness as a health-derived state (not a price multiplier), cash transferring at par as part of the bundle, and brand-as-label absorption are all shipped patterns. Confidence: HIGH.

**F25. Railway Empire: rising marginal share price, 100% required, bonds sized as a percentage of company value.**
Source: gamepressure guide: "you must purchase 100% of shares in the rival company"; "It is best to buy shares as soon as possible, otherwise the company's value will increase, just like the share price."; "You can issue a bond, which reflects a percentage of your company's value." Community (Steam, player-reported, LOW): buying all shares at once can cost "150-160% of company value", merge adds "a 10% premium".
Proves: escalating price with accumulation is a common anti-instant-buyout lever, and that debt (bonds) sized to valuation is how such games finance deals — precisely the lever Project: Studio lacks (F2). Confidence: MEDIUM (guide), LOW (premium figures).

**F26. Software Inc. (player experience): players confuse price paid with cash received; acquired value "resets".**
Source: Steam discussion 2549465882920038674 (community, not developer): "I just bought a company and made it a subsidiary for 450M. The following month its balance lose ~300M$"; reply "money you spend when taking the business over goes to the old owner, not the company"; reply "Everytime you buy stocks it inflates the price on the remaining shares". Official wiki *Stocks* page is "WORK IN PROGRESS" and states only "When the worth of the company goes up, so goes the worth of your stake".
Proves: an opaque valuation plus an unexplained cash outcome produces "I was robbed" reports; the ladder must show *Cash inside target* and *Price to seller* as separate rows. Confidence: MEDIUM (player-experience only).

**F27. Football Manager: price tag ≠ value; rejected/cancelled deals create a visible cooldown.**
Source: FM26 official feature: "'Ask Agent About Market Interest' option … Following your conversation with the agent, the price tag on the player's profile will update to reflect the market value discussed."; "Should you cancel or reject a move sourced by an Intermediary, both that Intermediary and the associated club will be unlikely to make further offers for this player for a short period."
Proves: shipped precedent for (a) an updatable visible ask distinct from underlying value, (b) consequences of rejection expressed as a time-bounded state. Confidence: HIGH (official), narrow.

**F28. Mad Games Tycoon 2 — UNVERIFIED.** Search snippets claim "Goodwill is the net worth of a company, as in how much buying the company will cost", ownership tiers (20–50%, 100%) and "take all their IPs and shut them down"; fandom wiki (402) and Steam news (empty body) could not be read. Confidence: LOW/UNVERIFIED; not relied upon.

---

## 4. The recommended structure (FUTURE RECOMMENDATION — my inference unless cited)

### 4.1 The valuation ladder — separately displayed rows, one lane per asset

Every number below is computed in TypeScript from P11/P12/P13/P14 facts (P11 law 6: Unity never
derives finance), versioned like the P15 rank formula, and shown with its definition and drivers
(P11 law 5). The ladder is a **read model**; it changes no state.

| Row | Book Net Worth (BNW) | Liquidation Value (LV) | Studio Valuation (SV) | Buyer Private Value (BPV) |
|---|---|---|---|---|
| Cash (may be negative) | par | par (healthy) / stays with estate (bankrupt) | par | par (healthy) / 0 (bankrupt) |
| Scheduled receipts (locked runs) | par | par | par | par |
| Tangible (facilities, sets) | demolition credit (0.5 / 0.35) | demolition credit | inside OV if OV>0, else demolition credit | demolition credit (one-lot rule: liquidated) |
| Land | not priced (F9) | not priced | not priced | not priced |
| Story Properties | 0 (no cost basis) | 0.5 × property basis | property basis | need-weighted 0.5–1.0 × basis |
| Film library rights (no cash channel yet) | 0 | 0 | 0 — shown as "historical, not monetised" | 0 until a P18 channel exists |
| Technology / knowledge | 0 | 0 | 0 (inside OV) | avoided research for gaps only |
| Brand / Standing | 0 | 0 | 0 (inside OV) | 0 (label option informational) |
| Talent under contract | 0; committed payroll shown beside | − termination cost to clear | 0 (payroll already netted in OV) | + avoided bonus (wanted) − termination (unwanted) |
| Active productions | 0; committed cost shown beside | 0 (cancelled) | recoverable work = f(committed cost, completion) | same as SV |
| Debt instruments (none today) | − par | − par (estate) | − par | − par if assumed |

Definitions:

- **BNW** = Cash + Scheduled receipts + Tangible at demolition credit − Debt instruments. No judgment
  rows. Committed payroll and committed production cost are displayed *beside* it (P11 law 1), not
  subtracted, because they buy future labour/work (executory), exactly as P11 shows obligations beside
  Cash today.
- **OV** (Operating Value) = max(0, M × OS52), where OS52 = trailing-52-week Studio Revenue received −
  direct film commitments − payroll − overhead/Opex − publicity (all existing P11 rows). M is a
  published, versioned multiple. OV is the target's *standalone* going-concern surplus; it is the
  seller's number, not the buyer's (see 4.2).
- **SV** = max(GC, AB) where GC = OV + Cash + Receipts + Properties + Productions − Debt and
  AB = Cash + Receipts + Tangible + Properties + Productions − Debt. This is Damodaran's
  max(going concern, orderly liquidation) (F17). When OV > 0 the plant is inside OV and is not added
  again (F15); when OV = 0 the asset basis takes over.
- **LV** (auction reserve for a whole-studio lot) = Receipts + 0.5 × Properties + 0 × Productions,
  with tangible liquidated by the estate before the lot is offered and the overdraft left with the
  estate (see 4.3). Contracts travel with the lot (assumption) and are not netted in the reserve;
  each bidder nets its own expected clearing cost in BPV.
- **BPV** is never displayed as the target's value. It is the buyer's "What you would actually
  receive" panel: rows valued at that buyer's own gaps and needs.

**Anti-double-counting rules (proposed product law):**

1. **One lane per asset.** Anything that produces the operating surplus (plant, technology, brand,
   contracted people) is inside OV and is not added as an asset while OV > 0 (F15).
2. **Properties are assets only while no library cash channel exists.** When P18 creates library
   income, that income enters OS52/OV and the property row falls to sequel/remake option value defined
   by P17 — the row moves lanes, it never sits in both (assignment §C, F15).
3. **Cash is priced at par and never capitalised.** Buying cash with cash is neutral by construction.
4. **Strategic increments are buyer-relative** (technology gaps, genre gaps, wanted people) and
   appear only in BPV, never in SV (F12, F23).
5. **BNW contains no judgment**: no properties, no OV, no forecasts (P11 law 8).
6. **Active productions carry cost-based recoverable work only** — a published fraction of committed
   cost × completion — never a hit forecast (F8).
7. **Debt rows do not exist until an instrument exists**; no disabled "Debt: —" row (P11 `:1303`
   rejects fake disabled tabs).

Assignment §N question — *should healthy acquisition begin from enterprise valuation + control
premium, while auction price emerges from bids around liquidation/strategic value?* — **Verified
YES with two corrections**: (i) the premium is the seller's *independence premium* (a visible state),
not Damodaran's buyer-side value of control, which for a well-run target is small (F18); (ii) in a
one-lot absorption the buyer's rational ceiling (BPV) is normally *below* the seller's SV because the
target's going-concern surplus does not survive absorption of its plant — the premium is structural,
not a tunable number (see Scenario C).

### 4.2 Healthy transaction price — visible states, not hidden multipliers

**ASK = SV × band(state)**, where `state` is derived from facts the player can already see:

| Willingness state | Derivation (published) | Band (PAPER) | Player sees |
|---|---|---|---|
| NOT FOR SALE | P15 `active`, OS52 > 0 in each of the last two years | refuses any price | "Rejects all offers. Would reconsider after a loss year or a P15 Warning." |
| RELUCTANT | `active`, exactly one loss year in the last two | ×1.50 | ASK and the reason |
| OPEN | P15 `warning`, or two loss years | ×1.20 | ASK and the reason |
| WILLING | P15 `distress` (pre-dormant) | ×1.05 | ASK and the reason |
| AUCTION | P15 `dormant → closure-settlement` (if Owner approves rival closure) | reserve = LV | lot sheet, reserve, current high bid |

Rules: the target accepts any offer ≥ ASK (deterministic; no dice); an offer below ASK is rejected
with the shortfall shown; a rejection starts a **26-week cooldown** (F27 pattern) during which the
target entertains no new offer from that suitor; the state can change while the offer window is
open (a Warning during the window moves RELUCTANT → OPEN). When two suitors are active in the same
window, the higher offer ≥ ASK wins at window close (a mini-auction, symmetric for rivals). The
band factor is a multiplier, but it is *published per state and per formula version*, which is what
"not a hidden fixed multiplier" requires; the refuse-regardless state is the Capitalism 2 pattern
(F22); the health-driven willingness is the GearCity pattern (F24).

Answers to §O: control premium scales with success *automatically* because SV contains OV (a more
profitable target has a higher SV and a tougher state) — no separate success multiplier is needed;
strategic assets raise the *buyer's* ceiling (BPV), not the seller's ask; repeated rejected bids cause
a cooldown only (no escalation of ASK, which would punish persistence arbitrarily); the target can
refuse regardless of price via NOT FOR SALE; information — full asset rows and property list at
approach, Cash and OS52 in P12 disclosure bands until acceptance, exact at signing (Owner decision
flagged in §6).

### 4.3 Auction price — bids anchored between reserve and strategic value

Recommended shape (hybrid, §M option 5, emerging from bids rather than a rule):

1. **Estate step (before any lot).** At the P15/P12 closure-settlement boundary, the estate (a
   P16-owned settlement actor, not a studio) liquidates tangible at demolition credit and holds the
   overdraft. Neither the credits nor the overdraft is part of any lot: a one-lot game cannot use
   remote buildings (§G), and OpenTTD-style "negative money reduces the price" would make creditor
   losses a buyer discount (F21) — a snowball gift.
2. **Whole-studio lot first.** Lot = scheduled receipts + Story Properties + library rights + active
   productions + contracts (assumed) + completed technology knowledge + brand/label. Reserve = LV.
   Open ascending auction over N rounds (one per week), minimum overbid increment = published % of
   reserve (F20), all bids visible as they land, tie → earliest bid. AI bidders bid up to their BPV
   capped by affordability (4.5).
3. **If no bid ≥ reserve, asset lots.** Each Story Property (and each production, if any bidder
   wants it) goes to its own lot at reserve 0.5 × basis; contracts are terminated by the estate
   under P10/P14 law and people enter the free market. Unsold properties remain with the estate as
   a P16 "estate catalogue" purchasable later at reserve (no vanishing IP).
4. **Proceeds are a sink.** The estate settles the overdraft and terminations; any shortfall is
   written off; any surplus is recorded in history and destroyed. No rival is enriched by a rival's
   failure except through what it buys.

Why an auction rather than OpenTTD's sequential fixed-price offer (F21): the fixed price gives the
best-performing company a right of first refusal at book — a snowball accelerator; an ascending
auction with rival bidders is the assignment's chosen anti-snowball lever (§S) and produces the
price divergence §3.B asks for.

### 4.4 Financing and anti-snowball (§S) — the analysis

- **No debt exists and the player may not borrow (F2).** This is the strongest natural brake: every
  acquisition dollar is a film not made, and prices are money sinks (4.3 step 4; healthy prices go
  to vanished owners). If a later Owner ruling adds P11 instruments, the ladder already has the row
  (par), the reserve requirement (4.5) must add debt service, and interest becomes a P11 recurring
  obligation — the leverage risk then becomes visible weekly pace, not a hidden cap.
- **Reserve requirement (affordability law, not a counter).** A bid or offer is legal only if
  post-closing Cash ≥ R_weeks × (own + inherited recurring weekly obligations). This is the P11
  "affordability is law" pattern extended one step; it makes frequency emerge from cash — each
  acquisition raises the bar for the next.
- **Inherited contracts** are friction by construction: payroll joins the weekly pace immediately;
  clearing costs 50% of the guaranteed remainder (F7). Nothing extra needed.
- **Integration capacity.** One integration work order at a time (paper: 13 weeks), modelled like a
  P13 adoption work order with a typed state and reason; a second closing waits. This is capacity,
  not an arbitrary M&A counter.
- **Diminishing strategic value.** Need-weights fall as the buyer fills genre/technology gaps, so
  BPV for the third target is lower than for the first; rivals with gaps outbid the incumbent. P15
  shared-market saturation additionally makes a large slate compete with itself.
- **Rival bidders and competing suitors** (4.3, 4.2) — the assignment's preferred lever.
- **Not recommended initially:** artificial caps, antitrust, or suitor-count escalation of ASK.
  Keep as later levers only if playtests show the above insufficient.
- **Anti-flip:** an asset acquired in a transaction may be resold, but for 52 weeks its market quote
  is capped at its allocated acquisition cost (§K "repeated flip exploits"); after that, resale is
  ordinary trading at the same public basis rules.

### 4.5 Rival-AI bidding heuristics (§J) — same law, deterministic policy

An AI studio submits an auction bid or a healthy offer when **all** hold, evaluated at the same
decision boundary the player sees:

1. Not itself in P15 `warning`/`distress`/integration.
2. Post-close Cash ≥ reserve requirement (4.4) — identical predicate to the player's.
3. BPV(target) − current price ≥ 0 (auction) or BPV ≥ ASK (healthy). BPV uses the same public
   basis rows plus that studio's own gaps (P13 adoption state, P12 strategy genre weights).
4. Bid amount: auction — raise by exactly the minimum increment while ≤ min(BPV, affordable);
   healthy — offer exactly ASK (never overpay without competition; if a competing suitor exists,
   raise by the increment up to min(BPV, affordable)).
5. Label choice (Model D) by deterministic P12 policy (paper: retain label if target
   `industryPrestige` ≥ buyer's).

Frequency then emerges: after a purchase, Cash falls below the reserve requirement until rebuilt by
receipts; no timer. Sequence of AI decisions must be ordered by a stable key (P12 admission ordinals)
so `StudioId` order never decides a contested lot; player and rival bids are both weekly-boundary
facts. Symmetry proof: same-seed harness with the player and one rival exchanging state must yield
identical ASK/accept and identical clearing outcomes (P15 §17 pattern).

---

## 5. Paper worked examples — all figures PAPER HYPOTHESES ($K)

**Paper constants (K)** — none is tuning; each would be a versioned P16 formula parameter:
K1 M = 3.0 (OV = 3 × OS52, floored at 0). K2 tangible recoverable = 0.50 × facility capex, 0.35 × set
capex (accepted values, F5). K3 property basis PB = max($20K, 10% of the source film's lifetime
Studio Revenue). K4 forced-sale property haircut = 0.5 × PB. K5 production recoverable work =
0.5 × committed cost × completion. K6 technology gap value = 0.6 × the buyer's remaining research cost
for each completed technology the buyer lacks. K7 wanted contracted person = 0.18 × annual salary
(accepted signing-bonus fraction); unwanted = −0.5 × remaining guaranteed salary (accepted
termination law). K8 reserve requirement = 26 weeks × (own + inherited weekly obligations).
K9 bands: WILLING 1.05, OPEN 1.20, RELUCTANT 1.50, NOT FOR SALE refuses. K10 auction increment = 5% of
reserve, rounded up to $1K. K11 cooldown 26 weeks. K12 anti-flip 52 weeks. K13 integration 13 weeks.

### Scenario A — Bankrupt small studio ("Meridian Pictures"): liquidation vs whole-company

Facts: Cash −70; receipts 30; facilities capex 400 → 200; sets capex 100 → 35 (tangible 235);
4 Story Properties, each source film lifetime revenue 150 → 10% = 15 → floor 20 (PB 80; forced 40);
5 contracts, remaining guaranteed 180, payroll 6/wk, termination-to-clear 90; no technology; no
productions; OS52 = −60 → OV 0.

- BNW = −70 + 30 + 235 = **195**. (Committed payroll 180 shown beside.)
- SV: GC = 0 − 70 + 30 + 80 + 0 = 40; AB = −70 + 30 + 235 + 80 = 275 → SV = **275**.
- Estate step: +235 credits, −70 overdraft → estate +165 before terminations.
- Whole-lot reserve LV = 30 + 40 = **70**.
- Player BPV (wants 2 properties at 1.0 → 40; other 2 at 0.5 → 20; receipts 30; the director,
  salary 60/yr → 11; 4 unwanted contracts, guaranteed 130 → −65) = 40 + 20 + 30 + 11 − 65 = **36**
  < reserve 70 → no rational whole-lot bid. Rivals' BPV similar (no tech, weak properties) → lot
  unsold.
- Asset lots: property reserve 0.5 × 20 = 10 each. Player wins two at 10 and 12 (one contested) →
  outlay **22** for exactly what it wanted (its own value 40). Director enters the free market
  (P14) after estate termination.
- Whole-company alternative, for comparison: pay ≥ 70, then clear 4 contracts (65) → 135 outlay,
  minus receipts 30 → net 105 for items the player values at 101. Asset route dominates.

Conclusion: for small distressed targets without technology, the hybrid produces asset lots without
any rule saying so; whole-company purchase becomes attractive only when a bidder values most of the
bundle — which is where the strategic depth should live.

### Scenario B — Valuable distressed studio ("Argent Lion Films"): why BNW, SV and auction price differ

Facts: Cash −900; receipts 250; facilities capex 2,400 → 1,200; sets 400 → 140 (tangible 1,340);
12 strong properties (source lifetime 1,500 → PB 150 each = 1,800) + 18 weak (floor 20 = 360) →
PB 2,160, forced 1,080; Technology III complete; 3 active productions, committed 1,500, completion
60% → recoverable work 450; 14 contracts, payroll 50/wk, guaranteed 1,900; OS52 = −1,000 → OV 0.

- **BNW = −900 + 250 + 1,340 = 690.** (Committed payroll 1,900 and committed production cost 1,500
  shown beside.)
- **SV**: GC = 0 − 900 + 250 + 2,160 + 450 = 1,960; AB = −900 + 250 + 1,340 + 2,160 + 450 = 3,300 →
  **SV = 3,300.**
- Estate step: +1,340 credits, −900 overdraft → +440 held by the estate.
- **Whole-lot reserve LV = 250 + 1,080 + 0 = 1,330.**
- Bidders (all use the same lot sheet):
  - Player: Cash 8,000; own obligations 60/wk + inherited 50 → reserve requirement 26 × 110 = 2,860
    → affordable ≤ 5,140. BPV = receipts 250 + strong 12 × 150 × 1.0 = 1,800 + weak 18 × 20 × 0.5 =
    180 + productions 450 + Tech III gap 0.6 × 1,000 = 600 + 8 wanted people (salaries 1,600 → 288)
    − 6 unwanted (guaranteed 800 → −400) = **3,168**; max bid = min(3,168, 5,140) = 3,168.
  - Rival Corvid: has Tech III (0); Cash 9,000; 90 + 50 → 26 × 140 = 3,640 → affordable ≤ 5,360.
    BPV = 250 + (6 strong fill gaps at 1.0 → 900) + (6 at 0.5 → 450) + 180 + 450 + 10 wanted
    (salaries 2,000 → 360) − 4 unwanted (guaranteed 500 → −250) = **2,340**.
  - Rival Halcyon: Cash 1,500; 40 + 50 → 26 × 90 = 2,340 > Cash → cannot bid (published reason:
    "insufficient reserve").
- Auction: increment 5% × 1,330 = 66.5 → 67. Corvid opens at 1,330; bids alternate by 67. Corvid's
  last legal bid is 1,330 + 14 × 67 = 2,268 (its next, 2,402, exceeds 2,340). Player's 2,335 stands.
  **Clearing bid = 2,335.**
- Ladder for the same studio in the same week: **BNW 690 · reserve 1,330 · clearing 2,335 ·
  SV 3,300 · player BPV 3,168 · Corvid BPV 2,340.**

Why they diverge: (1) BNW carries the overdraft and no property/production value (no cost basis);
(2) SV adds properties at basis and recoverable production work but OV = 0 because the studio is
loss-making; (3) the reserve drops the overdraft (creditors' loss, not a buyer discount) and haircuts
properties by half; (4) the clearing bid exceeds the reserve because two bidders had positive
strategic increments (the player's technology gap, both bidders' genre gaps) that no intrinsic number
contains, and the winner pays one increment over the runner-up's ceiling, not its own — which is why
the price is below SV and below the player's BPV. Post-close for the player: 8,000 − 2,335 = 5,665;
clearing 6 contracts −400 → 5,265; receipts +250 over the run; Tech III still requires the player's
own conversion capex at its own lot (nothing physical arrived).

### Scenario C — Healthy rival ("Sterling Crown Pictures"): how the premium functions

Facts: Cash 2,000; receipts 600; facilities capex 3,600 → 1,800; sets 600 → 210 (tangible 2,010);
10 strong properties (PB 200 → 2,000) + 15 weak (300) → PB 2,300; 2 productions, committed 1,200,
50% → 300; technology equal to buyer's (gap 0); 16 contracts, payroll 70/wk, annual salaries 3,640,
guaranteed 2,500; OS52 = +1,500 → OV 4,500; two profitable years; P15 `active`.

- **BNW = 2,000 + 600 + 2,010 = 4,610.**
- **SV**: GC = 4,500 + 2,000 + 600 + 2,300 + 300 = 9,700; AB = 2,000 + 600 + 2,010 + 2,300 + 300 =
  7,210 → **SV = 9,700.** (Tangible is inside OV; not added.)
- State: **NOT FOR SALE**. An approach is refused with reason and a 26-week cooldown. If the state
  later becomes RELUCTANT the ASK is 14,550; OPEN 11,640; WILLING 10,185.
- Buyer BPV (one-lot absorption): Cash 2,000 + receipts 600 + tangible liquidated 2,010 + properties
  need-weighted (6 strong at 1.0 → 1,200; 4 at 0.5 → 400; 15 weak at 0.5 → 150) = 1,750 +
  productions 300 + technology 0 + 12 wanted people (salaries 2,800 → 504) − 4 unwanted (guaranteed
  600 → −300) = **6,864**.
- Even at the WILLING ask the buyer pays 10,185 − 6,864 = **3,321 more than the parts are worth to
  it**. That gap *is* the healthy premium and it is structural: the seller prices its going-concern
  surplus (OV 4,500) which a one-lot buyer cannot keep, because the target's plant is liquidated and
  its output capacity vanishes at absorption. No tuned "control multiplier" is needed to make healthy
  deals expensive; the band only adds reluctance on top.
- Damodaran check (F18): the buyer-side value of control here is ≈ 0 (well-run target) — consistent
  with BPV < SV; the premium the assignment calls "control premium" is the seller's independence
  band, and naming it so avoids a contradiction with the cited doctrine.

### Scenario D — Technology target ("Northlight Studios"): knowledge transfers, buildings do not

Facts: Cash 400; receipts 100; facilities capex 1,000 (incl. a Tech III stage, capex 600) → 500;
sets 100 → 35 (tangible 535); 5 weak properties (PB 100; forced 50); Tech III complete; 1 production,
committed 400, 25% → 50; 4 contracts, payroll 12/wk, annual salaries 624, guaranteed 500; OS52 = +200
→ OV 600; P15 `warning` → OPEN. Buyer: Tech II; remaining research for III = 700 and 40 weeks;
conversion of its own stage = 300 capex + 8 weeks (P13 conversion law).

- SV: GC = 600 + 400 + 100 + 100 + 50 = 1,250; AB = 400 + 100 + 535 + 100 + 50 = 1,185 → SV = 1,250.
  **ASK (OPEN) = 1,500.**
- Buyer BPV = 400 + 100 + 535 + properties 5 × 20 × 0.5 = 50 + production 50 + Tech III gap
  0.6 × 700 = 420 + 3 wanted (salaries 468 → 84) − 1 unwanted (guaranteed 125 → −63) = **1,576**
  ≥ 1,500 → the buyer rationally accepts the ask.
- Transfer bundle as valued: pays 1,500; receives Cash 400, receipts 100 (over weeks), demolition
  credits 535 (the Tech III stage returns 300 of its 600 capex as cash — it does not travel),
  5 properties, 1 production, 4 contracts, and **P13 eligibility for Tech III** recorded for the
  buyer's `StudioId` with provenance "inherited from Northlight, week W"; the historical first-use
  credit stays with Northlight (P13 provenance law).
- Net cash after conversion and one termination: 1,500 − 1,035 + 300 + 63 = **828**, versus
  research + conversion = 1,000 and 48 weeks. Acquisition delivers Tech III in 8 + 13 (integration)
  = 21 weeks. The buyer paid ~315 above cash-equivalents (band premium 250 + OV−tangible gap 65) for
  technology plus properties/people/production. Principle verified: the buyer bought *knowledge and
  eligibility*, then lawfully built at home; nothing physical teleported.
- Liquidation-arbitrage check: net cost = ASK − (Cash + receipts + tangible) = premium + (SV − Cash −
  receipts − tangible) ≥ premium + properties + productions > 0 whenever SV = max(GC, AB); the
  `max` is what prevents buying tangible cash-back below its recoverable value.

### Scenario E — Serial acquirer: three studios in ten years

Player buys Argent Lion (Y1, auction 2,335), Northlight (Y4, healthy OPEN 1,500) and a third small
distressed lot (Y8, 900). Snowball checks against the rules in §4:

1. **Cash sink**: 4,735 leaves the player's economy permanently; none recycles to rivals.
2. **Reserve requirement grows**: inherited payroll (50 + 12 + …/wk) raises the 26-week bar before
   each next bid; the Y8 bid is legal only because Y1–Y4 receipts rebuilt Cash.
3. **Diminishing strategic value**: after Y1 the player holds ~35 properties and Tech III; Northlight's
   tech is already 0 to it by Y4 unless it is a different technology; the Y8 lot's properties weigh
   0.5 (no gaps) so rivals with gaps outbid at the same Cash.
4. **Integration capacity**: one 13-week work order at a time; three in ten years is comfortable, so
   no artificial cap is triggered — the *cost* is what restrains.
5. **Industry floor**: P12's minimum three active AI rivals and P15 entrants refill the field; the
   serial acquirer faces new challengers, and its enlarged slate self-saturates under P15.

Exploits and the smallest rule that closes each: (a) *flip* — buy the lot at 2,335, resell 12 strong
properties to Corvid at its 1.0 weights → K12 caps resale quotes at allocated cost for 52 weeks;
(b) *cash harvesting* — healthy deals price Cash at par, bankrupt lots carry no cash → nothing to
harvest; (c) *approach spam* — cooldown; (d) *sniping when rivals are poor* — legitimate and
symmetric; (e) *save-scumming auctions* — AI bids are deterministic functions of state, so
same-seed outcomes repeat; (f) *termination dumping* — a cost, not an exploit; (g) *buying while
negative* — P11 affordability already forbids voluntary commitments without sufficient cash.

### Scenario F — Rival acquires rival: symmetry and history

Corvid buys Halcyon (Halcyon dormant → closure-settlement → lot). The lot sheet, reserve, increments
and rounds are the same read model the player sees; the player may bid; Corvid's bid follows §4.5.
At closing: P12 commits Halcyon `closed` with reason `acquired` and successor `Corvid` (P12 `:881`
"Acquired is a later distinct outcome, never an alias for closed"); P16 `ownershipEvents` record each
property/right transfer dated to the week; every Halcyon film keeps "Released by Halcyon (year)";
every `PersonId` keeps its P12 employer-history interval (Halcyon → Corvid at week W); label choice by
deterministic policy; history line "ACQUISITION — Halcyon Pictures — Acquired by Corvid Films: 1961
Week 14". Corvid's compact P12 account debits the clearing price, its reserve requirement and
integration state apply, and a same-seed harness with player/Corvid states exchanged must reproduce
the identical clearing bid — the only asymmetry permitted is presentation (P15 §17).

---

## 6. Design implications for P16 (explicitly my inference)

1. Publish the ladder as one versioned P16 read model with five named numbers and the row table in
   4.1; BNW is an accounting identity from P11 rows, SV = max(GC, AB), LV is the estate reserve.
2. Adopt the seven anti-double-counting rules as product law; the "one lane per asset, lane
   assignment published and versioned" rule is what lets P17/P18 later re-lane property/library value
   without a formula rewrite.
3. Express seller willingness as five visible states derived from P15 condition + trailing OS52,
   each with a published band and reason; keep a refuse-regardless state and a rejection cooldown;
   never a hidden threshold.
4. Distressed sales: estate step (tangible liquidated, overdraft retained), whole-studio lot at LV
   reserve with an ascending increment auction, then asset lots at half basis; proceeds are a sink.
5. Rename the assignment's "control premium" to *independence premium* in P16 prose; document that
   BPV < SV is the expected healthy case and the source of the premium.
6. Do not depend on debt. Write P16 so that a future P11 instrument slots into existing rows and the
   reserve requirement; do not add a placeholder row.
7. Affordability law: bids/offers legal only if post-close Cash ≥ 26 weeks of combined obligations
   (parameter versioned); this is the frequency governor for player and AI alike.
8. Model integration as a typed work order with capacity one (P13 adoption-order pattern), not a
   counter.
9. Anti-flip: 52-week resale cap at allocated acquisition cost per asset.
10. Rival AI: the five-condition bid rule in 4.5, deterministic ordering by P12 admission ordinals,
    same-seed symmetry harness as a package-blocking test.
11. Disclosure: full asset rows for lots; for healthy approaches Cash/OS52 in P12 bands until
    acceptance — needs an Owner decision (below).
12. Land row reads "not priced" until P09-LATER-LAND ships; film-library rights read "historical,
    not monetised" until a P18 channel exists.
13. If §K asset sales are made a distress remedy, register them as a P16-authored typed remedy family
    that P15B references, since P15 currently implies no forced sale.

---

## 7. Open questions (genuine Owner/charter decisions surfaced by this dossier)

1. Does target Cash transfer at par in a healthy deal (GearCity yes; OpenTTD no)? Recommended yes,
   priced at par — Owner confirmation needed because it decides whether "buy a studio for its cash"
   is neutral or impossible.
2. Are guaranteed contract remainders booked as liabilities in BNW or shown beside (recommended:
   beside, per P11 law 1)?
3. The capitalisation multiple M and the property-basis rule K3 (10% of source lifetime revenue,
   floor) are pure hypotheses; P17's later option value may replace K3 entirely.
4. Whether any priced value attaches to a retained label/brand (recommended: none; informational).
5. Disclosure bands for healthy approaches vs full lot sheets for auctions.
6. Auction format parameters: rounds, increment %, tie law, and whether the player may withdraw a
   standing bid.
7. Whether the estate catalogue of unsold properties should exist (recommended yes) and its reserve.
8. Whether any future P11 debt instrument is ever authorised (Owner-blocked today, F2).
9. Whether a serial-acquirer "industry wariness" ask escalation is ever wanted (not recommended).
10. Rival closure itself remains an Owner-gated P15B policy; without it, only healthy and
    asset-lot transactions can exist.

---

## 8. Source table

| # | Source | Type | Locator | Used for | Confidence |
|---|---|---|---|---|---|
| S1 | Accepted code `types.ts`, `tuning.ts`, `placement.ts`, `employment.ts` | CURRENT/ACCEPTED CODE | lines cited in F1, F5, F7, F8 | cash-only studio, refund fractions, contract math, locked runs | HIGH |
| S2 | `OWNER-RULINGS-HOLLYWOOD-HORIZON.md` | Owner ruling | :58-65 | player financing prohibition; rival failure allowed | HIGH |
| S3 | `CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11.md` | APPROVED DOCUMENTATION | :43, :52, :59, :132, :641, :824, :1299-1303 | cash literal, no loans, scheduled receipts, no Studio Worth | HIGH |
| S4 | `P11A-DECISION-AND-REQUIREMENT-REGISTER.md` | accepted register | :140 | REQ-041 OWNER-BLOCKED | HIGH |
| S5 | `CODEX-P13-P15-LONG-RANGE-ROADMAP.md` | APPROVED DOCUMENTATION | :165-167, :215, :260, :682, :699 | valuation → P16, ownershipEvents root | HIGH |
| S6 | `CODEX-P13-P15-OWNER-RULINGS.md` | Owner ruling | :232-252 | P16+ parking incl. valuation | HIGH |
| S7 | `CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md` | APPROVED DOCUMENTATION | :254-262, :453, :460-476, :615-619, :837-848 | acquisition refuted as parity; lifecycle; remedies; deferrals | HIGH |
| S8 | `CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md` (+annex) | design authority | :466, :846, :881, :885; annex :151 | rival compact finance, privacy, "acquired ≠ closed", floor | HIGH |
| S9 | `CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13.md` | APPROVED DOCUMENTATION | :689, :871-873 | demolition credit ≠ replacement; no monopoly; rights sale | HIGH |
| S10 | `P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md` | accepted | :348-376 | P16 owns valuation later | HIGH |
| S11 | `P08-P10-DEFERRED-NOT-DROPPED-REGISTER.md`; P09 package | accepted / design | :26; :216 | land not priced | HIGH |
| S12 | Official manual `manual_english.txt` | SHIPPED RETAIL | :124-130, :428-431 | cash rating, in-debt lockout, Star/script selling | HIGH |
| S13 | Prima eGuide `prima_eguide.txt` | PRIMA | Studio Rating "Capital 24%…"; Builders "recoup a depreciated portion"; "Build in Debt" | original valuation facts | HIGH |
| S14 | Damodaran, *Value of Control: Some General Propositions* | primary (academic) | https://pages.stern.nyu.edu/~adamodar/pdfiles/country/controlshort.pdf slides 22–23 | control value doctrine | HIGH |
| S15 | Damodaran, *Valuing Distressed and Declining Companies* | primary (academic) | https://pages.stern.nyu.edu/~adamodar/pdfiles/papers/NewDistress.pdf | book ≠ liquidation; max(GC, orderly liquidation); distress sale | HIGH |
| S16 | Damodaran blog, *A tangled web of values* (2013) | primary (academic blog) | https://aswathdamodaran.blogspot.com/2013/06/a-tangled-web-of-values-enterprise.html | EV bridge; double counting | HIGH |
| S17 | CFA Institute, *Equity Valuation: Applications and Processes* | professional body | https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/equity-valuation-applications-and-processes | going concern / liquidation / fair value | HIGH |
| S18 | DeWitt LLP, *Asset Purchase vs. Stock Purchase* | professional secondary | https://dewittllp.com/news/2021/05/19/an-overview-of-an-asset-purchase-vs-stock-purchase | asset vs stock deals | HIGH |
| S19 | Ward and Smith, *The Section 363 Sale Process* | professional secondary | https://www.wardandsmith.com/articles/the-section-363-sale-process-buying-assets-from-a-bankrupt-company | free and clear; increments; contract assumption | HIGH |
| S20 | TheWrap, TWC bankruptcy (2018) ×2 | trade press | https://www.thewrap.com/weinstein-company-files-for-bankruptcy/ ; https://www.thewrap.com/weinstein-company-goes-to-lantern-capital-in-bankruptcy-sale/ | distressed studio going-concern lot | MEDIUM |
| S21 | OpenTTD `economy.cpp`, `company_cmd.cpp` (master, 2026-09-11) | primary (open source) | https://raw.githubusercontent.com/OpenTTD/OpenTTD/master/src/economy.cpp :116-193, :547-620, :2018-2050; company_cmd.cpp :745-796 | three formulas; bankruptcy offer sequence | HIGH |
| S22 | OpenTTD wiki *Transport company* | official wiki | https://wiki.openttd.org/en/Manual/Transport%20company | company value sentence | HIGH |
| S23 | Capitalism 2 official manual (Enlight, Steam PDF) | official manual | https://cdn.akamai.steamstatic.com/steam/apps/638200/manuals/Cap2_manual.pdf pp. 105–106 and finance report glossary | net worth vs market value; tender; refusal | HIGH |
| S24 | Capitalism Lab official pages | developer site | https://www.capitalismlab.com/acquire-companies-facing-bankruptcy/ ; …/subsidiary-dlc/merging-subsidiary-companies/ ; …/digital-age-dlc/acquiring-private-company/ | distressed cheap; buyer-relative; 75% merger; price opaque | HIGH (quotes) |
| S25 | GearCity wiki *How-to: Stock Market* | official wiki | https://wiki.gearcity.info/doku.php?id=gamemanual:howto_stockmarket | vote-based willingness; bundle incl. cash; marque | HIGH |
| S26 | gamepressure Railway Empire guide; Steam community | contemporary guide / community | https://www.gamepressure.com/railway-empire-guide/research-bonds-and-acquiring-competitors/z0aa86 ; Steam app 503940 discussions | 100% shares; rising price; bonds | MEDIUM / LOW |
| S27 | Software Inc. wiki *Stocks*; Steam discussion | official wiki (WIP) / community | https://softwareinc.coredumping.com/wiki/index.php/Stocks ; https://steamcommunity.com/app/362620/discussions/0/2549465882920038674/ | price vs cash confusion | MEDIUM (player experience) |
| S28 | Football Manager 26 feature | official developer | https://www.footballmanager.com/features/introducing-intermediaries-and-offloading-players | price tag; rejection cooldown | HIGH |
| S29 | Mad Games Tycoon 2 | search snippets only | fandom wiki 402; Steam news empty | not relied upon | UNVERIFIED |
| S30 | `MECHANICS-BIBLE.md` (prior Project: Studio prose) | PRIOR PROSE | :489, :574, :720 | Star & Script Selling facility notes | verified against S12 only |
