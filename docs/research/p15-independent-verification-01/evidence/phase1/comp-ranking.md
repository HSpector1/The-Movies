# P15 Evidence Report — Comparators: Industry Rankings, Power vs Value, Consolidation, High-Visibility Events

**Reader:** independent evidence reader (read-only)  
**Date:** 2026-09-11  
**Scope:** modern tycoon/management comparators for (1) competitive industry rankings, (2) company value presentation, (3) AI-field consolidation, (4) industry-event presentation; plus the original-game anchor and the accepted current-code snapshot (`592e926`).  
**Method:** official manuals/wikis and developer statements first; open-source code read directly (OpenTTD, Simutrans); Steam/forum threads used only for player-experience criticism and labelled as such. Nothing under any git repository was modified; no player data touched.

Evidence labels used below:

- **RETAIL SHIPPED MECHANIC** — original *The Movies* retail behaviour established by manual/Prima/retail walkthrough.
- **PRIMA/MANUAL EVIDENCE** — the specific page used.
- **OFFICIAL / SOURCE CODE** — comparator publisher docs, wikis maintained by the developer, or code read at the cited URL.
- **DEVELOPER STATEMENT** — a developer post in a forum.
- **COMMUNITY INFERENCE** — player forum/wiki text; player-experience only.
- **CURRENT CODE VERIFIED** — observed in the accepted snapshot `592e926` extracted in the scratchpad.

---

## 0. Original-game anchor (what Project: Studio is departing from)

| Claim | Source | Establishes | Confidence |
|---|---|---|---|
| Studio Rating was a weighted composite: Capital 24%, Movies 24%, Stars 24%, Lot Prestige 14%, Awards 14% | Prima eGuide pp. 45–46 (`prima.txt` lines 2816–2889, 3182); corroborated by GameFAQs Maxx FAQ (`gamefaqs-maxx.txt` 2237, 2357) | **RETAIL SHIPPED MECHANIC** (developer-reviewed guide). The original *blended wealth into the comparative rank*. | HIGH |
| Capital factor = cash in bank on a $50,000–$1,600,000 scale, non-linear: midpoint ≈ $300,000, "progressively more" needed above it | Prima p. 46 | Original wealth lane was a capped, diminishing-returns transform of literal cash, not a valuation | HIGH |
| Movies factor decays: "impact of individual movies decays over time"; Awards factor = awards won *at the most recent ceremony* (≥6 for max) | Prima p. 46 (`prima.txt` 2850–2870, 3175–3190) | The original already used recency/decay — the comparative chart was momentum-like, not lifetime | HIGH |
| The Studio Charts "show your studio's ranking in the world and how it's doing in each of the scoring categories"; manual: charts show standing "in relation to the competition" and right-click reveals a breakdown | Prima p. 46; manual "Star, Movie and Studio Charts" (`manual.txt` 509–520) | The original ranking was **transparent per category** and exposed contributing factors | HIGH |
| Rank *movement* was rewarded: "Highest Climbing Studio award (by making the biggest change in rank from one award ceremony to another)" | Prima p. 45 (`prima.txt` 2777–2781) | Original had a movement metric with an award hook | HIGH |
| Rating had consequences: photographers at the gate, queue applicants, and rival Stars in the Stage School queue were "proportional to Studio rating" | Prima p. 46 (`prima.txt` 2796–2801) | The comparative number was not informational-only | HIGH |
| No inspected retail source establishes rival bankruptcy, closure, merger or replacement | Consistent with P15 §5.5; nothing new found | Absence of evidence, not proof of absence | HIGH (as absence) |

**Implication:** the P15 candidate Power Ranking (three lanes, no cash) is a *deliberate departure* from the original's Capital-24% composite, not parity, and should be labelled that way.

---

## 1. Rankings — how comparators rank companies

### 1.1 OpenTTD — Company League Table (the transparent benchmark)

**SOURCE CODE** read at `https://raw.githubusercontent.com/OpenTTD/OpenTTD/master/src/economy.cpp` (saved to scratchpad `web/openttd_economy.cpp`) and `src/lang/english.txt`; **OFFICIAL** wiki table at `https://wiki.openttd.org/en/Manual/Game%20Mechanics/`.

`_score_info` (economy.cpp lines 92–103) — `ScoreInfo(score, needed)`:

| Component | Max points | Threshold ("needed") | Share | What is measured (UpdateCompanyRatingAndValue, lines 203–318) |
|---|---|---|---|---|
| Vehicles | 100 | 120 | 10% | primary vehicles with `profit_last_year > 0` |
| Stations | 100 | 80 | 10% | station facilities loaded/unloaded within last 20 units of time |
| Min. profit | 100 | £10,000 | 10% | lowest last-year profit among vehicles older than `VEHICLE_PROFIT_MIN_AGE`; negative shows 0 |
| Min. income | 50 | £50,000 | 5% | minimum of (income+expenses) over the last ≤12 quarters, only if > 0 |
| Max. income | 100 | £100,000 | 10% | maximum of (income+expenses) over the last ≤12 quarters |
| Delivered | 400 | 40,000 | 40% | cargo units delivered over the last ≤4 quarters |
| Cargo | 50 | 8 | 5% | distinct cargo types delivered last quarter |
| Money | 50 | £10,000,000 | 5% | current cash if > 0 |
| Loan | 50 | £250,000 | 5% | `250000 − current_loan` (i.e., 50 pts at zero loan) |
| **Total** | **1000** | — | 100% | `s = Clamp(part, 0, needed) * score / needed`, summed, rescaled to 1000 |

- **Correction to the task premise:** there is no "total value" component. `ScoreID::Total` is the *sum* row; the components are the nine above. Company value is computed alongside but is **not** part of the rating (line 311 stores it separately).
- **Transparency:** fully published and shown in-game. The "Detailed Performance Rating" window prints each row as `(value/needed)` and a percentage (`STR_PERFORMANCE_DETAIL_AMOUNT_INT`, `STR_PERFORMANCE_DETAIL_PERCENT`, english.txt 687–718) with tooltips stating the exact definition (e.g., "Amount of cash made in the quarter with the lowest profit of the last 12 quarters").
- **Cadence:** quarterly. `CompaniesGenStatistics()` returns unless month ∈ {0,3,6,9}; then rolls `old_economy`, calls `UpdateCompanyRatingAndValue(c, true)`, and dirties the League/Value windows (lines 638–692).
- **Wealth vs power:** cash and loan are inside the rating but weigh only 10% combined; the Company Value Graph (`STR_GRAPH_COMPANY_VALUES_CAPTION`) is a separate window. Both numbers coexist; neither is hidden.
- **Bands:** League Table titles Engineer (0–127) … Tycoon (960–1000); a separate 2050 high-score title ladder (wiki table). Bands are cosmetic labels on the same score.
- **Player criticism (COMMUNITY INFERENCE, LOW):** search-indexed Steam comments describe losing interest because it is "too easy to dominate the AI competition"; no complaint about the *formula's* opacity was found — consistent with it being published.

### 1.2 Simutrans — single-criterion sortable ranking (no composite)

**SOURCE CODE** `src/simutrans/gui/player_ranking_frame.cc` (lines 20–35, 66–76, 83–108): the "Player ranking" window ranks all players by **one selected criterion at a time** from nine — Revenue, Ops Profit, Margin (%), Passengers, Mail, Goods, Cash, Net Wealth, Convoys — for "This Year" or "Last Year", filtered by transport type. Ties break on the prior year, then player number. There is **no blended score**. Cash and Net Wealth are lanes beside performance lanes, never merged. (Cited by P15 §8 only as a data-model reference; the ranking UI itself is the relevant pattern.) Confidence HIGH.

### 1.3 Capitalism Lab — Forbes-style single-metric rankings plus a personal wealth list

**OFFICIAL** (`capitalismlab.com`):
- Goal types: "Revenue Ranking" = annual revenue "that ranks at the specified position among all companies in the game"; "Profit Ranking" = annual operating profit; "Market Cap Ranking" = market capitalization; "Billionaires Ranking" / "Local Billionaires Ranking" = *personal* wealth on a top-100 list (Script — Goal Values page). Cadence is implicitly **annual** for revenue/profit, live for market cap. Confidence HIGH.
- Challenge-game ranking methods: Score, Revenue, Profit, Goal+Score (Script — Challenge Game). The "score" formula is not published on the pages inspected. Confidence MEDIUM.
- Influence Score (CES DLC) is shown "in the score report" with "the three components" broken out separately (Wealth & Business Score, current political influence, past political influence) — a partially transparent composite. HIGH.
- **Wealth and power are separate numbers**: corporate rankings (revenue/profit/market cap) vs personal Billionaires list vs Influence Score.

### 1.4 GearCity — reports, not a league table

**OFFICIAL** GearCity wiki (`gamemanual:gui_reports`): "Company Directory" "lists every company in the game, along with their revenues, expenses, and funds"; "Market Cap Table" "lists every publically traded company … along with their share price and market cap"; "Vehicle Class Market Share" shows the class leader and the player's share. **DEVELOPER STATEMENT** (Eric.B, Steam "Competitors?" thread): players verify competitor activity via "All Time Marketshare" and "Monthly Marketshare" charts. No composite rating found. Wealth (funds), market cap and sales share are **separate columns/reports**. Confidence HIGH for the reports; MEDIUM that no composite exists (absence in inspected pages).

### 1.5 Hollywood Animal — Reputation and Influence are resources, not a league table

- **CONTEMPORARY PROFESSIONAL / official copy:** Reputation is a "vital resource" derived from critics' reviews and box-office; "the higher your rep, the more you can get away with … and the more likely you are to secure loans and deals" (TheGamer guide; Steam store/official site copy). Reputation "can also be spent like a currency to cover your tracks" (TheGamer). Influence is a spendable point pool ("Be very wary of spending influence on speeding up tech" — Outsider Gaming guide, EA 0.8.8). Cash is separate. Confidence MEDIUM.
- **No inspected source establishes a numeric studio league table or a published rival-ranking formula.** Rivals are authored (e.g., "Gerstein Brothers" named in the Outsider Gaming guide). The Fandom/TV Tropes pages were inaccessible (402/403). Confidence LOW on ranking presentation.
- Official copy frames consolidation thematically: "Some will be buried in an avalanche of problems, while others seize new opportunities" (weappy-studio.com). A Steam thread titled "GB CINEMA buy out" exists (age-gated; body not readable) — **COMMUNITY INFERENCE, unverified** that a rival buyout mechanic exists in EA.

### 1.6 Mad Games Tycoon 2 — a rank without consequence is dismissed

- **OFFICIAL** store: "up to 100 competing companies"; buy them, direct them, or "take all their IPs and shut them down".
- **DEVELOPER STATEMENT** (Eggcode Games, Steam "what IS studio rating?"): "Currently, this rating has no impact on the sales figures of the games, etc." — planned to influence self-distribution. Confidence HIGH (dated EA thread; may have changed since).
- **COMMUNITY INFERENCE:** market share is "a fancy number that doesn't really matter"; "The AI has a static, only-ever-slightly-random growth rate" (player Kyouko Tsukino). Lesson: a comparative number with no consequence and a static AI is called out quickly.

### 1.7 Game Dev Tycoon — not transferable

Inspected wiki/forum sources describe **platform** market share and top-games charts; no inspected source establishes simulated rival *companies*. Not a company-ranking comparator. Confidence MEDIUM.

### 1.8 Software Inc. — stock-implied value, undocumented formula

**OFFICIAL** wiki `Stocks` page is marked "WORK IN PROGRESS" with empty takeover/bankruptcy sections; it states only that as "the worth of the company goes up, so goes the worth of your stake". **COMMUNITY INFERENCE** (Steam thread "buy a company for 450M$ it lose 300M$ overnight"): buying all stock "creating a market bubble"; "All the money you spend when taking the business over goes to the old owner, not the company"; "all subsidiaries in this game are worth zero" after purchase. No developer reply. Lesson: undocumented valuation produces confusion between *sale price* and *post-sale book value*.

### 1.9 Transport Fever 2 — the no-ranking control case

**DEVELOPER/COMMUNITY-MANAGER STATEMENT** (Steam "Will they ever add competitors"): "there will be no competitors AI" because it requires the same effort as multiplayer. Players describe the result as "boring" and ask for AI companies that "work against the player" (COMMUNITY INFERENCE). No company ranking exists. Confidence HIGH for the design fact.

### 1.10 Sports management (only where transferable)

- **Football Manager:** club reputation is a 0–10000 attribute (FM Fandom wiki snippet — COMMUNITY); an annual news item reports reputation change; an FM26 bug-tracker user reports that FM24's clickable ranking details are gone (COMMUNITY). Official pages show "Finances" as a separate club-preview field (footballmanager.com "Starting Your First Save"). **Transferable lesson:** reputation is persistent and separate from finances (like P08 Standing), updated annually, and mostly opaque — players want the ranking to be inspectable. Confidence MEDIUM.
- **NBA 2K25 MyNBA:** official courtside report: "add or remove up to 6 teams to the league each and every offseason". That is **user-configured** expansion/contraction, not simulated consolidation; no team power-ranking presentation is described on that page. Confidence HIGH.

### 1.11 Ranking comparison table

| Game | Transparent? | Cadence | Financial value in the rank? | Wealth vs power separate? | Consequence of rank |
|---|---|---|---|---|---|
| *The Movies* (2005) | Yes — per-category breakdown | continuous chart; awards every 5 yrs | Yes (Capital 24%) | No — blended | Yes (queues, photographers, awards) |
| OpenTTD | Yes — 9 published linear components, (value/needed) shown | quarterly | Money 5% + Loan 5% | Yes — Company Value graph separate | Titles only; AI events |
| Simutrans | Yes — single criterion, sortable | yearly buckets, live | Only if chosen as lane | Yes — Cash/Net Wealth are lanes | None (informational) |
| Capitalism Lab | Single-metric rankings; score report shows components | annual (revenue/profit), live (mkt cap) | Rankings *are* financial | Yes — corporate vs personal billionaire list vs Influence | Goals/challenge scoring |
| GearCity | Reports/tables, no composite | live tables | Funds, market cap as columns | Yes | None documented |
| Hollywood Animal | Not established | n/a | n/a | Reputation, Influence, Cash separate | Reputation gates loans/deals |
| MGT2 | Not documented; rating inert (dev) | n/a | unknown | unknown | None ("fancy number") |
| Football Manager | Opaque (0–10000 hidden) | annual | No | Yes (Finances separate) | Attracts players |
| Transport Fever 2 | No ranking | — | — | — | — |

---

## 2. Net worth / company value presentation

### 2.1 OpenTTD — three distinct valuations (SOURCE CODE, HIGH)

- **Asset value** (`CalculateCompanyAssetValue`, lines 116–139): `stations_facility_count × price[StationValue] × 25` + `1.5 × vehicle->value` for trains/road/ships/normal aircraft.
- **Company Value** (`CalculateCompanyValue`, 151–160): `assets − current_loan + money`, floor 1. This is the number graphed in the Company Value Graph and stored quarterly in `old_economy[0].company_value`.
- **Bankruptcy sale value**: the same function with `including_loan = false` ("Don't consider the loan", line 589–592): `assets + money`.
- **Hostile takeover price** (`CalculateHostileTakeoverValue`, 166–199): `assets + current_loan + max(0, −money) + 2 × Σ_{last 4 quarters} max(0, income+expenses)` — i.e., assets, debt assumed, and two years of projected profit; the seller "walk[s] away with all the money they have in the bank".

So OpenTTD **does** distinguish a book-like value from an enterprise/sale price; the book value is graphed, the sale prices appear only in the offer/takeover dialogs and merger headline. Bankruptcy is also **not** driven by company value but by `money − loan < −max_loan` for consecutive months (line 553).

### 2.2 GearCity — "Evaluation" (book-like) vs share price vs acquisition cost (OFFICIAL wiki `gm_stocks`, HIGH)

- **Evaluation** = `Money − Total_Debt + Branch_Construction_Costs + Factory_Construction_Costs + Vehicle_Inventory + Total_Design_Costs(÷10) + Share_Holdings` — an asset-at-cost book value.
- **Share price** (post-2000, company ≥8 yrs): `((Evaluation×0.4) + (Revenues_12_Months×1.0×Global_Stock_Rates) × (0.75×EPS_Growth)) / Total_Shares`, then quarterly EPS multipliers 0.75×–1.15×; **floor** `Evaluation×0.7 / Total_Shares` (wiki: "a minimum market cap value … based on the equity they own"). Younger companies weight Evaluation more heavily.
- **Acquisition cost** (positive EPS): `((((Price_Evaluation×1.2)/Shares_Needed/2.5) + (PricePerShare×1.75)) × Shares_Needed) × ((EPS_Year/10)+1) × DifficultyBonus` — a premium over market.
- Displayed separately: Company Directory (funds/revenues/expenses) and Market Cap Table (share price, market cap). So GearCity shows **book (Evaluation) and market (cap)**, and prices a **third** number for control.

### 2.3 Capitalism Lab (OFFICIAL, MEDIUM)

Market cap (share price × shares) is a ranking metric; corporate financial statements and a Corporate Detail Report exist; personal net worth is ranked on the Billionaires list. Bankrupt-company acquisition is offered at "a discounted price, reflecting its distressed financial condition". No explicit book-vs-enterprise pair was found on the inspected pages.

### 2.4 Software Inc. (COMMUNITY, LOW)

Value is stock-implied; formula undocumented; purchase price goes to the seller and the acquired subsidiary's own balance is unaffected — players read the resulting drop as a loss.

### 2.5 Original (PRIMA, HIGH)

No valuation existed; "Capital" was literal cash in bank, capped and non-linear, inside the rating.

### 2.6 Value-presentation table

| Game | Book/asset value | Market/enterprise value | Sale/takeover price | Shown together? | Formula published? |
|---|---|---|---|---|---|
| OpenTTD | assets + cash − loan (graph) | — | bankruptcy: assets + cash; hostile: assets + loan + 2 yrs profit | value on graph; price only in dialog/headline | Yes (source; wiki partial) |
| GearCity | Evaluation (assets at cost, less debt) | share price × shares (floored at 0.7× Evaluation) | premium formula | Yes (two reports) | Yes (wiki) |
| Capitalism Lab | financial statements | market cap | "discounted price" for distressed | partly | No formula on inspected pages |
| Software Inc. | — | stock-implied | stock purchase | — | No |
| *The Movies* | cash only (Capital lane) | — | — | inside rating | Prima describes scale |

---

## 3. Consolidation — shrinking AI fields, floors, and synthetic entrants

### 3.1 OpenTTD — refill to a cap, on a real-time timer (SOURCE CODE, HIGH)

- Settings: `difficulty.max_no_competitors` (0 … MAX_COMPANIES−1, default 0 in current master) and `difficulty.competitors_interval` (minutes, default 10) — `table/settings/difficulty_settings.ini` lines 57–75; string "Interval between starting of competitors: N minutes" (english.txt 4988).
- `company_cmd.cpp` 686–705 and 808–830: a tick timer fires; if `count(is_ai) < max_no_competitors` a new AI company is started. If the interval is 0, all competitors start at once and the game re-checks "every ~10 minutes if a company went bankrupt and needs replacing". Start time is jittered ±12.5%.
- **Perception:** replacement is tied to wall-clock minutes, not world years; the entrant is announced as "New transport company launched! X starts construction near TOWN!" (english.txt 898–899). It is a **synthetic floor** by design. No complaint thread specifically about respawn was located (searched; LOW).
- **Asymmetric terminal law:** in singleplayer the human company is never deleted on bankruptcy — "leave the company playing. Eg. there is no THE-END" (economy.cpp 604–611); AI companies are deleted at month 10 with reason `Bankrupt`. This is a direct precedent for P12's "no mandatory hard-bankruptcy game-over" while rivals may close.

### 3.2 GearCity — authored entry dates, dynamic attrition, no synthetic replacement (OFFICIAL + DEVELOPER, HIGH/MEDIUM)

- AI editor fields (wiki `modtools:aieditor`): "Founding Year … the year in which the AI company will appear in the game"; "Death Year … the year that the company is no longer in the game IF you start at a later game date." Death year only trims the roster for late starts; in-game exits happen through the economy (bankruptcy, buyout, delisting when share price < 1 — `gm_stocks`).
- **DEVELOPER STATEMENT** (Eric.B): with 50 AI in a 1980 start "a lot of those AI were probably bought out or went bankrupt, or both"; "Demand doesn't change based on how many AI are in the game" (more AI = more cars = fewer sales each). Companies "persist longer" from earlier starts.
- No inspected source documents random new-company generation; the field can thin toward the player. Late-game "dead world" complaints specific to GearCity were **not** found (searched; absence noted).

### 3.3 Capitalism Lab — bankruptcies open room for newcomers (OFFICIAL + COMMUNITY)

- OFFICIAL: "Number of Competitors=<0 to 68>" script setting; bankruptcy triggers an acquisition offer window; if accepted "the game pauses, so you can evaluate the company". The page does not say what happens if declined.
- COMMUNITY INFERENCE (forum user eleaza): high start-up capital means AI "will die very slowly, and won't let those more aggressive personality persons to join-in, once the unsuccessful old ones go bankrupt" — players observe newcomers entering after bankruptcies; "Constant renew of different personality corporations … is more important." Not confirmed by a developer page.
- COMMUNITY INFERENCE (thread "Make billions, bankrupt everyone"): bankrupting all rivals "takes the challenge out of the game"; the root issue is AI passivity, not competitor count.

### 3.4 Hollywood Animal — authored rivals; consolidation thematic, mechanics unverified (LOW)

Official copy promises "the strong devour the weak"-style rivalry; a Steam thread title suggests buying out a rival; no inspected source establishes rival closure rules, floors, or entrants.

### 3.5 Player perception of empty late games (COMMUNITY INFERENCE, LOW–MEDIUM)

- Transport Fever 2: with no AI companies "the game becomes boring", requests for AI companies "that work against the player".
- Railway Empire: threads focus on buying out rivals early ("After a couple of years in-game you should be able to buy out any offending competition"; "The AI … should be no real challenge"). A search-indexed remark about beating all competitors by year 10 and losing interest for the remaining 90 years could not be located in a specific thread — treat as LOW.
- OpenTTD: "too easy to dominate the AI competition" (search-indexed Steam comment; LOW).

**Pattern:** the recurring complaint is *unopposed dominance*, not the *absence of a floor mechanism*; where refills exist (OpenTTD) they are wall-clock and cosmetic; where they do not (GearCity) the developer accepts a thinning field. No source praises synthetic respawn; no source specifically condemns it either.

### 3.6 Consolidation table

| Game | Field can shrink? | Replacement? | Rule visible to player? | Player company protected? |
|---|---|---|---|---|
| OpenTTD | Yes (bankrupt/merged at month 10) | Yes, up to `max_no_competitors`, timer in minutes | Settings only; entrant announced | Yes (singleplayer never deleted) |
| GearCity | Yes (bankruptcy, buyout, delisting) | Authored founding years only | Roster by XML; not in-game | Player can go bankrupt (COMMUNITY) |
| Capitalism Lab | Yes | Community-reported newcomers | Not documented | n/a |
| MGT2 | Buyout/shutdown by player | Not documented | n/a | n/a |
| Hollywood Animal | Unverified | Unverified | Unverified | Player starts from a bankrupt studio (story) |
| NBA 2K25 MyNBA | Only by user setting (±6 teams/offseason) | User-driven | Yes (menu) | n/a |
| *The Movies* | Not established | Authored later entrants to ~1971 (Prima table) | No | No hard game-over established |

---

## 4. High-visibility events — how rival failure/entry is announced

### 4.1 OpenTTD (SOURCE CODE, HIGH)

Staged, dated newspaper headlines, all `{BIG_FONT}` company-news style (english.txt 892–900):

| Stage (monthly check, `CompanyCheckBankrupt`) | Headline | Disclosed |
|---|---|---|
| month 4 of `money − loan < −max_loan` | "Transport company in trouble!" / "X will be sold off or declared bankrupt unless performance increases soon!" | name only; cause is generic |
| month 7 | company offered to others at `assets + money` (no headline; a purchase dialog to each company) | price to the offeree |
| month 10 | "Bankrupt!" / "X has been closed down by creditors and all assets sold off!" | name |
| sold | "Transport company merger!" / "X has been sold to Y for £N!" | **price disclosed** |
| hostile takeover | "X has been taken over by Y for an undisclosed amount!" | price **withheld** |
| new AI | "New transport company launched!" / "X starts construction near TOWN!" | name, location |

- **Pause behaviour:** `AddCompanyNewsItem`/`AddNewsItem` do not pause the game; no pause-on-news setting exists in the inspected strings. News is a non-modal newspaper/ticker.
- **User control:** each news category has Off / Summary / Full (english.txt 1981–1983); the "Company information" category covers "when a new company starts, or when companies are risking to bankrupt" (1945–1946).
- **Private vs public:** the detailed rating and company value of *every* company are public windows; cash is public (Money component). Only the hostile takeover price is styled "undisclosed".

### 4.2 Capitalism Lab (OFFICIAL, HIGH)

Bankruptcy of an AI firm surfaces as a **modal offer window** ("A window asks whether you are interested in acquiring the failing company"); on acceptance "the game pauses" for evaluation via the Corporate Details screen. Technology news for any company appears on the History page of the Corporate Detail Report. Headline grammar not documented on inspected pages.

### 4.3 GearCity (DEVELOPER STATEMENT, HIGH)

Bankruptcy auctions arrive as an **action memo** listing debt and factory count (e.g., "7 factories") with no factory quality/location. A player found "250+ million in bonds" after a purchase disclosed as 14.5M debt; the developer acknowledged a debt-calculation bug, said the auction "wasn't designed for detailed research", pointed to the stock-acquisition menu for full data, and announced a "Wait button" so players can pause and research on the world map before committing. Lesson: decision-bearing events need enough disclosure and a pause/inspect affordance; non-decision news does not.

### 4.4 MGT2 / Hollywood Animal / Software Inc.

No inspected source documents rival-failure headline grammar. Hollywood Animal's press/newspaper surface is referenced in reviews only as flavour. MGT2 buyouts are player-initiated; "after a buyout you will take on ALL the company's debt" (COMMUNITY/guide text).

### 4.5 Event-presentation table

| Game | Style | Pauses? | Disclosed | Withheld | User volume control |
|---|---|---|---|---|---|
| OpenTTD | dated big-font newspaper; staged warning → sale → bankrupt/merger | No | names, sale price, location; all ratings/values public | hostile price | Off/Summary/Full per category |
| Capitalism Lab | modal offer window | Yes, on accept | discounted price, corporate details | — | not documented |
| GearCity | action memo | Planned "Wait" button | debt, factory count | quality/location (dev: use stock menu) | not documented |
| *The Movies* | charts + award ceremonies; no closure events established | n/a | per-category rating | — | — |

---

## 5. Current accepted code (`592e926`) — what already exists (CURRENT CODE VERIFIED)

These observations correct the P15 package's code claims, which were written against `7811377`.

- **A quarterly comparative chart already ships.** `src/core/hollywoodTick.ts` 306–313 snapshots `HollywoodChartSnapshot { week, rows[{studioId, standing, output}] }` every 13 weeks (`week%13===0`) and keeps `previousChart`; `hollywoodValidation.ts` 414–416 enforces that cadence.
- **Per-lane ranks with movement already ship.** `bridge/industry.ts` 66–84 computes, for each of `INDUSTRY_LANES = ['audienceAwareness','industryPrestige','commercialConfidence','output']` (`bridge/schema/industry-schema.ts` 3), `rank = 1 + count(rows with strictly greater value)` (competition ranking, ties 1-1-3), `priorRank` only when the cohort is identical (`sameCohort`), and movement labels "Up/Down N since <date>", "New to this comparison", "No comparable prior cohort". The page title is "Studio Charts"; the summary notice reads "Separate public comparison lanes." Lane meanings are shown (`laneLabels`, `meanings`).
- **This is a Standing-ordered chart, not a momentum Power Ranking.** It orders studios by P08's three persistent Standing channels plus a lifetime "Released Films" count. The P15 gate question "Is P08 Standing being used as a hidden rank?" is therefore already answered: Standing is used as a *visible per-lane rank*. P15A.2 must be specified relative to this surface (rename/retire it, or make Power Ranking a distinct lens beside it), and its tie rule (P15 candidate: dense ties) conflicts with the shipped competition-ranking rule.
- **An activities feed with headline grammar already ships**: "X joins Hollywood", "X announces a film", "X releases Y" (detail discloses Standing before→after at release), "Y completes its theatrical run"; people transitions say "Contract terms remain private" (`bridge/industry.ts` 88–95). No closure/dormancy/distress kinds exist (`IndustryReceipt` union, `hollywoodTypes.ts` 96–103).
- **Scheduled entrants already exist**: `enterRival(state, studioId, 'scheduled')` with `eligibleWeek` gating (`hollywood.ts` 139–194) and a `studioEntered` receipt with `origin: 'fresh'|'migration'|'scheduled'`. No active-rival floor logic was found in `src/core/hollywood*.ts` (grep for minimum/floor returned nothing) — the "minimum three active AI rivals" is authority text, not code.
- **No valuation/net-worth field exists** in `src/core/types.ts`, `economyView.ts`, or the UI adapter (grep negative). Consistent with the P16+ parking of valuation.

---

## 6. Synthesis — lessons for Project: Studio

### (a) Transparent quarterly Power Ranking

| Adopt | From | Reject | From |
|---|---|---|---|
| Publish every component with `(value / needed)` and % per lane, plus a plain-language definition tooltip | OpenTTD Detailed Performance Rating; original per-category breakdown | Opaque hidden scalar surfaced only by an annual news item | Football Manager reputation (community-reported) |
| Quarterly cadence aligned to the existing 13-week chart snapshot | OpenTTD `CompaniesGenStatistics`; current code | Wall-clock or per-tick reordering | — |
| Linear capped lanes (clamp then scale) so a single blockbuster or cash pile cannot dominate | OpenTTD clamps; original Capital scale with diminishing returns | Unbounded raw sums (volume spam) | — |
| Movement vs the last *comparable* snapshot, and a "New to this comparison" state | current `bridge/industry.ts`; original "Highest Climbing Studio" | Movement across non-comparable cohorts | — |
| A visible consequence or an explicit "informational only" banner | original rating had queue/photographer/award effects; MGT2 shows an inert rating gets dismissed as "a fancy number" | Rank that feeds nothing and explains nothing | MGT2 |
| Offer a single-criterion sortable view *beside* the composite (players can sort by any lane) | Simutrans Player ranking; current per-lane Studio Charts | Forcing one blended order as the only view | — |
| Keep cash/valuation **out** of the momentum rank, and say so as a departure from the original's Capital-24% | P15 Owner boundary; OpenTTD keeps value separate (only 10% cash/loan) | Presenting the cash-free rank as original parity | Prima pp. 45–46 |
| Resolve the tie rule explicitly (shipped: competition ranking; P15 candidate: dense) | current code vs P15 §11 | Two tie rules on two adjacent screens | — |

### (b) Separate financial value display

- Under the Owner's P16+ parking of valuation, P15 should show **literal P11 cash and obligations** (as the original showed Capital as bank balance) and no computed "studio value". If a value is ever authorized, OpenTTD and GearCity show the safe pattern: **define the book value and publish its formula; show any sale/takeover price as a different, labelled number computed only at the moment of an offer**, never as a standing "worth". Software Inc.'s undocumented stock-implied value is the cautionary case (players confuse sale price with post-sale balance).
- Keep wealth and power as separate numbers on separate surfaces (OpenTTD graph vs league table; Capitalism Lab corporate rankings vs Billionaires list; FM Finances vs reputation).

### (c) Consolidation without artificial floors

- The closest precedent to Project: Studio's authored-window entrants is **GearCity** (Founding Year per AI; field thins through the economy; no synthetic respawn), not OpenTTD's minute-timer refill. Keep entrants **world-dated and reasoned** (a dated "joins Hollywood" event already exists), never wall-clock.
- If a floor is retained (P12's minimum three active AI rivals), make the rule itself public in the Industry view so an entrant reads as policy, not as respawn — OpenTTD hides its rule in settings and the entrant reads as synthetic; no inspected player praises that.
- The recurring "dead world" complaint (Transport Fever 2, Railway Empire, OpenTTD) is about **unopposed dominance**, so the fun-preserving lever is rival competence and staged distress/recovery (P15B) more than head-count. Capitalism Lab players say the same: bankrupting everyone "takes the challenge out", but the cause is AI passivity.
- OpenTTD's singleplayer rule ("there is no THE-END") is a shipped precedent for P12's asymmetric terminal law: rivals may close; the player's company is never deleted.

### (d) Event presentation

- Adopt OpenTTD's **staged, dated headline chain** (trouble → offer/settlement → closed/merged → new entrant) with a typed public cause where P15B has one — OpenTTD's "unless performance increases soon" is generic; Project: Studio can do better with its typed reason grammar.
- Distinguish **disclosed** facts (name, date, public outcome, and — where the world would know — a settlement figure) from **withheld** ones ("undisclosed amount", "Contract terms remain private" already used in current code). Never show private rival ledgers (consistent with P15 §15.2).
- **Pause only for decision-bearing events** (Capitalism Lab pauses on accept; GearCity is adding a "Wait" button because a bare memo caused blind purchases); plain industry news should not pause (OpenTTD).
- Give per-category news volume controls (OpenTTD Off/Summary/Full) so a long 1920–2040 campaign does not drown the player.

---

## 7. Corrections to prior P15 research (this topic only)

- **CONFIRMED** — Prima Studio Rating weights Capital/Movies/Stars 24% each, Lot Prestige/Awards 14% each (pp. 45–46; `prima.txt` 2816–2889, 3182; `gamefaqs-maxx.txt` 2237, 2357).
- **QUALIFIED** — the original *did* blend wealth (Capital = bank balance, $50k–$1.6M, non-linear) into the comparative rank; the P15 candidate's cash-free Power Ranking is a deliberate departure and must not be presented as parity.
- **CONFIRMED (new supporting fact)** — the original rewarded rank movement ("Highest Climbing Studio", Prima p. 45) and decayed the Movies factor / counted only the latest ceremony's awards (p. 46): a trailing-window momentum design has original-game precedent.
- **QUALIFIED** — P15 §8 uses OpenTTD only as a history/save-version data-model reference; it omits OpenTTD's fully published quarterly 9-component/1000-point Company League Table, its separate Company Value graph, three distinct valuations, and its singleplayer never-delete rule — the strongest transparent-ranking and asymmetric-terminal precedents available.
- **CORRECTED (task premise)** — OpenTTD's rating has **nine** components; "total value of company" is not one of them; "Total" is the sum row.
- **QUALIFIED** — "CURRENT CODE VERIFIED: no Power Ranking" was true at `7811377`; at accepted `592e926`, `bridge/industry.ts` ships "Studio Charts" with four per-lane ranks over a 13-week snapshot, prior-rank movement and cohort checks. It is not a momentum Power Ranking, but P15A.2 must be specified against it, and the tie rule (competition vs dense) must be reconciled.
- **QUALIFIED** — "minimum three active AI rivals" is authority text; no floor logic exists in current `src/core/hollywood*.ts`.
- **CONFIRMED / QUALIFIED** — NBA 2K25 MyNBA does expose "add or remove up to 6 teams … each offseason", but as a user setting, not simulated consolidation; not evidence for organic closure design.
- **QUALIFIED** — the Football Manager comparator page is about transfers/finance; FM's club reputation is an opaque 0–10000 value surfaced annually (community sources) — it is a *persistent-reputation* precedent (P08-like), not a transparent-ranking precedent.
- **CONFIRMED** — a quarterly Power Ranking cadence is consistent with both OpenTTD's quarterly rating and the shipped 13-week chart cadence.
- **CONFIRMED** — every modern comparator with buyouts/mergers (OpenTTD, MGT2, Capitalism Lab, GearCity, Software Inc.) is a successor mechanic; nothing found changes the P15 finding that acquisition is not original parity.

---

## 8. Open uncertainties

1. Hollywood Animal: exact rival-comparison presentation, whether rivals can close or be bought in the current EA build, and any newspaper grammar (Fandom/TV Tropes/Steam thread bodies were inaccessible).
2. Capitalism Lab: outcome for a declined bankrupt company (liquidation vs continuation) and whether new AI corporations genuinely spawn — only community inference found.
3. GearCity: whether any random AI generation exists beyond authored founding years; late-game survivor counts unquantified.
4. MGT2: whether the studio rating has been activated since the EA-era developer statement; competitor bankruptcy/removal undocumented.
5. Software Inc.: company-worth formula undocumented on the official wiki.
6. Football Manager: reputation update cadence/formula rests on community sources only.
7. The "beat all rivals by year 10, 90 years left" Railway Empire remark was search-indexed but not located in a specific thread — LOW.
8. OpenTTD wiki lists 9 rating rows; the wiki page has no explicit company-value formula — the formula here is from source, so wiki/manual and source may diverge in wording.

---

## 9. Sources

Original game (local read-only):
- Prima Official eGuide, pp. 45–46 — `scratchpad/original-text/prima.txt` lines 2770–2905, 3175–3190.
- Official manual, "Star, Movie and Studio Charts" — `scratchpad/original-text/manual.txt` lines 505–525.
- GameFAQs Maxx FAQ — `scratchpad/original-text/gamefaqs-maxx.txt` lines 2237, 2357.

OpenTTD (source read directly; saved in `scratchpad/web/`):
- https://raw.githubusercontent.com/OpenTTD/OpenTTD/master/src/economy.cpp (lines 92–103, 116–199, 203–318, 544–692)
- https://raw.githubusercontent.com/OpenTTD/OpenTTD/master/src/company_cmd.cpp (455–470, 686–705, 808–830, 995–1010)
- https://raw.githubusercontent.com/OpenTTD/OpenTTD/master/src/lang/english.txt (625, 673–718, 892–900, 1945–1946, 1981–1983, 4988)
- https://raw.githubusercontent.com/OpenTTD/OpenTTD/master/src/table/settings/difficulty_settings.ini (57–75)
- https://wiki.openttd.org/en/Manual/Game%20Mechanics/ (rating table, title bands)

Simutrans: https://raw.githubusercontent.com/simutrans/simutrans/master/src/simutrans/gui/player_ranking_frame.cc (20–35, 66–76, 83–108)

Capitalism Lab (official): https://www.capitalismlab.com/scripts/script-goals/script-goal-values/ ; https://www.capitalismlab.com/scripts/script-competitors/ ; https://www.capitalismlab.com/acquire-companies-facing-bankruptcy/ ; https://www.capitalismlab.com/scripts/script-challenge-game/ ; https://www.capitalismlab.com/ces-dlc/influence-score/ ; https://www.capitalismlab.com/new-features/tech-focused-ai-companies/ . Community: https://capitalism2.com/forum/viewtopic.php?t=2760 ; https://www.capitalism2.com/forum/viewtopic.php?t=3854

GearCity (official wiki + developer): https://wiki.gearcity.info/doku.php?id=gamemanual:gm_stocks ; https://wiki.gearcity.info/doku.php?id=gamemanual:howto_stockmarket ; https://wiki.gearcity.info/doku.php?id=gamemanual:gui_reports ; https://wiki.gearcity.info/doku.php?id=modtools:aieditor ; https://gearcity.info/faq.php ; https://steamcommunity.com/app/285110/discussions/0/522729358625167142/ ; https://steamcommunity.com/app/285110/discussions/0/1694922526917807909/ ; https://steamcommunity.com/app/285110/discussions/1/1470841715950097838/

Hollywood Animal: https://store.steampowered.com/app/2680550/Hollywood_Animal/ ; https://weappy-studio.com/hollywood-animal/ ; https://www.thegamer.com/hollywood-animal-reputation-explained-increase/ ; https://outsidergaming.com/hollywood-animal-guide-strategies-how-to-make-money/ ; https://www.neonlightsmedia.com/blog/hollywood-animal-early-access-review-tycoon ; https://game8.co/articles/reviews/hollywood-animal-gameplay-and-story ; (inaccessible: Fandom 402, TV Tropes 403, Steam thread "GB CINEMA buy out" age-gated)

Mad Games Tycoon 2: https://store.steampowered.com/app/1342330/Mad_Games_Tycoon_2/ ; https://steamcommunity.com/app/1342330/discussions/0/3079873089695563784/ (developer reply) ; https://steamcommunity.com/app/1342330/discussions/0/3201491841995796729/ ; https://steamcommunity.com/app/1342330/discussions/0/4943253385022886478/ ; https://steamcommunity.com/sharedfiles/filedetails/?id=2371634667

Software Inc.: https://softwareinc.coredumping.com/wiki/index.php/Stocks ; https://softwareinc.coredumping.com/wiki/index.php/Main_Page ; https://steamcommunity.com/app/362620/discussions/0/2549465882920038674/

Transport Fever 2: https://steamcommunity.com/app/1066780/discussions/0/2277079183727043477/ (community-manager statement via search summary) ; Railway Empire: https://steamcommunity.com/app/503940/discussions/0/4841930637296116681 ; https://steamcommunity.com/app/503940/discussions/0/1640919737479133376

Sports: https://nba.2k.com/2k25/en-GB/courtside-report/mynba/ ; https://www.footballmanager.com/the-dugout/starting-your-first-save-fm26 (search summary) ; https://www.footballmanager.com/features/smarter-transfers-squad-building-and-finance ; FM community (blocked, snippets only): footballmanager.fandom.com/wiki/Reputation ; community.sports-interactive.com bug tracker "Club reputation"

Current accepted code: `scratchpad/accepted-592e926/bridge/industry.ts` (19–24, 66–95), `bridge/schema/industry-schema.ts` (3–16), `src/core/hollywoodTick.ts` (306–313), `src/core/hollywoodValidation.ts` (414–416), `src/core/hollywood.ts` (139–194), `src/core/hollywoodTypes.ts` (96–123).

Project authority: `scratchpad/authority/P15-PACKAGE.md` §5.1, §5.5, §7, §8, §15.3, §11 decision table; `P15-BUILDER-ANNEX.md` E.5, M.4; `P13-P15-OWNER-RULINGS.md` §4; `P13-P15-LONG-RANGE-ROADMAP.md` lines 676–682.
