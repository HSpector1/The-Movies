# P15 Research Review — Comparator Study: M&A, Company Acquisition, Bankruptcy Auctions, Subsidiaries in Management/Tycoon Games

**Reader:** independent evidence reader (read-only)
**Date:** 2026-09-11
**Scope:** how other tycoon/management games shape company acquisition, what transfers, how price is set, anti-snowball protections, and whether the mechanic turned the game into a finance simulator. Ends with a synthesis table and a staged recommendation for Project: Studio's deferred P16+ "Studio Empire & Ownership Transactions" parking lot.
**Authority cross-check:** P15-PACKAGE.md §5.5, §6, §23, §25; P13-P15-OWNER-RULINGS.md §4.2, §5; P13-P15-LONG-RANGE-ROADMAP.md lines 215, 260, 676, 695–703; accepted code snapshot 592e926 `src/core/hollywoodTypes.ts`.

## 0. Evidence classes used in this report

Comparator games are not The Movies, so the retail-parity ladder does not apply to them; instead each claim is tagged by source class:

| Tag | Meaning |
|---|---|
| **OFFICIAL** | game source code, official manual, developer-maintained wiki, developer patch note/news post |
| **DEV STATEMENT** | a named developer writing in a forum, PR, or designer diary |
| **PRO REVIEW** | professional review or walkthrough (retail) |
| **COMMUNITY** | Steam/forum thread, fan wiki, player guide; used only for player-experience criticism or when nothing better exists, and labelled as such |

For The Movies itself the strict ladder (RETAIL SHIPPED MECHANIC / PRIMA-MANUAL / CONTEMPORARY PROFESSIONAL / PRE-RELEASE PROMISE / COMMUNITY INFERENCE) is used in §3.

Confidence: HIGH = primary source read directly; MEDIUM = secondary or summarizer-mediated official source; LOW = community-only or single unverified snippet.

---

## 1. The canonical simple model: Transport Tycoon Deluxe / OpenTTD bankruptcy offer flow

This is the cleanest "consolidation without a finance simulator" in the genre and is fully inspectable in GPL source. All line references are to OpenTTD `master` as fetched 2026-09-11 (`src/economy.cpp`, `src/company_cmd.cpp`, `src/company_base.h`); the P15 package already pins an OpenTTD revision (`96651d3…`) as a data-model/testing reference and explicitly rejects "any takeover/acquisition translation into P15" (P15-PACKAGE.md line 329). Nothing here changes that; the model is recorded for P16+ design only.

### 1.1 Exact flow (OFFICIAL, HIGH)

| Step | Rule | Source |
|---|---|---|
| Trigger | The bankruptcy counter advances only while `money - current_loan < -GetMaxLoan()` — i.e., net position worse than the maximum loan, not merely negative cash. Recovering resets the counter and the "asked" mask. | `economy.cpp::CompanyCheckBankrupt`, lines 547–559 |
| Cadence | Checked every economy month (`CompaniesGenStatistics`). Counter is `months_of_bankruptcy`. | lines 636–643 |
| Warning | After 3 months (`case 4`) a news item "company in trouble" is published and AI/GameScript events broadcast. | lines 574–580 |
| Offer | After 6 months (`case 7`) the company is valued with `CalculateCompanyValue(c, false)` — **loan excluded** — and `bankrupt_asked` is seeded with only the owner (so it cannot buy itself). | lines 584–595; comment: "Don't consider the loan" |
| Rotation | Each tick, `HandleBankruptcyTakeover` asks **one** company at a time, in descending order of `performance_history`, each with a timeout of one quarter divided by (MAX_COMPANIES−1). Companies that are themselves in bankruptcy are skipped, and a buyer that would exceed the vehicle limit is skipped. Human buyers get `ShowBuyCompanyDialog`; AI buyers get `ScriptEventCompanyAskMerger`. | `company_cmd.cpp` lines 745–796 |
| Deletion | At `case 10` (9 months) — or immediately if the company had no value at month 6 — the company is deleted (`CompanyRemoveReason::Bankrupt`). In single-player the **local** (human) company is never deleted: "there is no THE-END"; it is left playing. | lines 598–627 |
| Replacement | A separate `_new_competitor_timeout` timer starts a new AI whenever the AI count is below `max_no_competitors` (optionally on an interval with ±12.5 % jitter). So consolidation does not empty the map. | `company_cmd.cpp` lines 686–707, 809–830 |

### 1.2 Valuation (OFFICIAL, HIGH)

- **Asset value** = stations × `StationValue` price × 25 + Σ vehicle `value × 3/2` (trains, road, ships, normal aircraft). `economy.cpp` lines 115–139.
- **Bankruptcy price** = asset value + cash (loan ignored), floored at 1. Lines 151–160. The bankruptcy price is frozen at the moment of the offer (`bankrupt_value`), not recomputed per bidder (`CmdBuyCompany` comment, line 2043).
- **Hostile-takeover price** (post-14.0, AI targets only, single-player only) = asset value + the target's loan + any negative balance + 2 × max(0, last four quarters' profit) — the comment says the target's owners "walk away with all the money they have in the bank." Lines 163–192; `CmdBuyCompany` lines 2029–2031 restrict hostile takeover to AI companies and non-network games.

### 1.3 What transfers (OFFICIAL, HIGH)

`DoAcquireCompany` → `ChangeOwnershipOfCompanyItems`: vehicles (renumbered), stations, signs, subsidies, exclusive-rights, groups; town ratings become the max of both. The acquired **company object is deleted** — its name and identity do not persist; a "merger" news item is the only trace. (`economy.cpp` lines 1980–2004; summariser-confirmed contents of `ChangeOwnershipOfCompanyItems`, MEDIUM.) On bankruptcy purchase the loan is *not* inherited (it was excluded from the price and the company object is deleted); on hostile takeover the buyer effectively pays it off inside the price.

### 1.4 Why OpenTTD removed share trading (DEV STATEMENT, HIGH)

PR #10709 (TrueBrain, merged 2023-04-29; shipped as 14.0, 2024-04-13 changelog line: "Replace buying/selling company shares with hostile takeovers of AI companies") lists the reasons: shares could be sold to nobody ("when you sell it, nobody else has to buy it"), the 25 % steps were arbitrary, the feature generated years of bugs (a maintainer counted 14+ issues and 16+ fix attempts), it enabled infinite-money exploits (#7691), it was disabled by default, and it inconsistently allowed buying out AI but not humans. Replacement: a one-shot hostile takeover of AI companies at a premium price. **Design lesson:** a partial-share market in a game whose core is not finance was net-negative; a single whole-company transaction at a formula price survived.

### 1.5 Player-experience notes (COMMUNITY, MEDIUM)

- GitHub issue #3561 and Steam discussions restate the flow as players see it: after months in the red a rival is "offered up for buying," at a price equal to assets plus cash, and you do not get the debt.
- Hostile-takeover bugs after 14.0 (#12594 vehicle-limit error, #12818 expenses counted as profit) show that even a one-formula takeover needs precise wording of what is included.

**Assessment.** The TTD model is fun for exactly the reasons it is simple: one trigger, one warning, one frozen price, one yes/no dialog per candidate buyer in merit order, one deletion, and a replacement spawner that keeps the world populated. It never became a finance sim because there is no negotiation, no partial stake, and no valuation the player can manipulate. Its weaknesses for a Hollywood game are that the acquired identity vanishes and nothing "historical" is preserved.

---

## 2. Comparator profiles

### 2.1 Software Inc. (Coredumping; Beta 1.8.x, 2026)

- **Shape:** stock-market accumulation → at >50 % of listed shares a "Takeover" button buys the remainder; then the player chooses **Takeover** (company ceases to exist; shares, IPs, frameworks transfer) or **Subsidiary** (company persists, keeps its IP, transfers shares/frameworks to the parent). Steam guide "Subsidiaries and How to use them [Beta 1.6.x]" and KosGames guide (COMMUNITY, MEDIUM). Official wiki "Stocks" page lists "Hostile takeover" and "Subsidiary/bankrupt" as sections but leaves them empty (OFFICIAL, incomplete).
- **Valuation:** share price rises each time shares are bought ("inflates the price on the remaining shares… cumulative"); buying out fast creates a bubble that "bursts" on completion because "all the money you spend… goes to the old owner, not the company" (Steam thread 2017-12-15, COMMUNITY, MEDIUM). No official formula published.
- **Transfers:** IP/products and frameworks; a subsidiary keeps its name and staff and "you can manipulate its balance… take all its profits"; when a company you hold heavily goes bankrupt "the major shareholder receives its IP" (Steam thread 2017-09, COMMUNITY, MEDIUM).
- **Subsidiary control:** one product specialization per subsidiary, autonomous vs. task-driven, assignable support/marketing/porting work; Beta 1.8.12 let the player pick specialization and stopped subsidiaries counting toward the AI-company limit (Steam news, OFFICIAL, MEDIUM).
- **AI vs player:** AI companies can hostile-take the player; defence is holding >50 % or buying back during a countdown (Steam thread 2023-02-21, COMMUNITY, MEDIUM).
- **Anti-snowball:** only the price-inflation-on-purchase rule. **Criticism:** 2015 thread "Take over are just overkill" — ~15 M spend returned ~1 B; inherited low-quality IP tanked reputation and cluttered menus; the developer replied "the stock market will get an overhaul in the future" (DEV STATEMENT, MEDIUM). The subsidiary option was players' proposed fix and later shipped.
- **Finance-sim drift:** moderate. The share market exists mainly as the acquisition on-ramp; the IP-inheritance and reputation side-effects are where the design interest sits.

### 2.2 GearCity (Visual Entertainment and Technologies; 2014–)

- **Shape:** voluntary whole-company acquisition through a shareholder vote — "If 50% of the shares are yes votes, then the acquisition is approved"; shares you own vote yes; other companies' shares vote no; a denied offer locks you out until next turn (official wiki `howto_stockmarket`, OFFICIAL, HIGH). Also **consolidation** (merger of equals: "the game creates a new company with a randomized name" and both old companies become marques), **buying individual marques**, **spin-offs**, and **bankruptcy purchase**.
- **Valuation:** takeover price is a multiple of the game's company evaluation: unprofitable targets (EPS < −0.5) at 1.1× evaluation; profitable targets at 1.2× evaluation × (1 + EPS_year/10), share price ×1.75, scaled by difficulty (wiki `gm_stocks`, OFFICIAL, MEDIUM via summariser). The developer states players are deliberately charged **more** than AI buyers to close exploits (Steam 2021-07-22, DEV STATEMENT, HIGH). Shareholder willingness falls when the target is healthy and rises in recessions/low-rate periods; the developer cites Nissan–Mitsubishi and Fiat–Chrysler as the intended feel (Steam 2021-02-28, DEV STATEMENT, HIGH).
- **Transfers:** "you're buying all their assets, including the factories, branches, designs, and marques"; duplicate factories in cities you already occupy are sold or closed automatically (wiki `howto_marques`, OFFICIAL, HIGH). **Debt transfers**: bankrupt purchases include outstanding bonds — "Debts don't magically disappear" and "it's not supposed to be a good deal" (dev forum 2016-05, DEV STATEMENT, HIGH).
- **Brand persistence:** acquired companies become **marques** with separate names, logos and image ratings that "seemly operate as a different company in the public's eye"; marques can be sold, discontinued, restored, or spun off (OFFICIAL, HIGH). This is the strongest "acquired identity persists" model in the set.
- **Bankruptcy flow:** player gets first refusal at a steeply discounted-from-book price; if declined, "the AI companies are then checked to see if any are in the position to purchase"; if none, "the assets are liquidated" (DEV STATEMENT, HIGH). A "Bid on Bankrupt Companies" auto-command controls whether the player is even asked (Steam 2021, DEV STATEMENT, HIGH). Player bankruptcy: search-snippet-level claim of "negative for 6 months" (LOW; not verified in a primary source).
- **AI acquires AI:** yes — the same Steam thread documents Daimler buying MG for far less than the player's quoted price.
- **Anti-snowball:** player premium; health-based refusal; recession gating; debt inheritance; per-turn offer cooldown.
- **Finance-sim drift:** high by design — GearCity is proudly a spreadsheet game with IPOs, bonds, dividends, splits. Its acquisition layer is coherent but sits on top of a full corporate-finance model, which is exactly what P15 says it cannot afford.

### 2.3 Capitalism Lab (Enlight; Subsidiary DLC, Digital Age DLC)

- **Shape:** stock-market accumulation. A rival taking >50 % of your shares is a hostile takeover ("seizes control of it"); at **75 %** you gain direct corporate- and firm-level control of a subsidiary (hire C-suite, build/close firms, set prices); **100 %** is needed to privatize or inject capital; two subsidiaries at ≥75 % each can be merged, paying cash or issuing shares (official site pages "Subsidiary Control", "Merging Subsidiary Companies", "Privatization", "Tips and FAQ", OFFICIAL, HIGH). Private AI tech companies can be bought outright via an "[Acquire Company]" button at a quoted price, with an "Acquire and Merge" alternative (Digital Age DLC page, OFFICIAL, HIGH; formula not published).
- **Player loss is not game over:** "Playing Without a Company" — after hostile takeover or bankruptcy the company "keeps running on its own as a computer-controlled company under its new owner," the player keeps all personal wealth, may stay on as salaried CEO, and can found a new private company for $1 M (inflation-scaled) that is takeover-proof until it IPOs (OFFICIAL, HIGH).
- **Transfers:** firms, brands, products, tech as a going concern; subsidiaries keep separate books, dividends, and stock.
- **AI acquires AI / player:** yes (hostile takeover is a core loss condition).
- **Anti-snowball:** none documented beyond price and the 75 %/100 % ladders; no antitrust in the inspected pages.
- **Finance-sim drift:** total — this is the reference corporate-finance sim. Valuable mainly for the **continuation-after-loss** pattern and the **ownership-percentage ladder** (50/75/100) as a control model.

### 2.4 Railroad Tycoon II (PopTop, 1998; Platinum manual)

- **Shape:** voluntary merger by shareholder vote from the company Finances tab: "select the company you want to merge with, then set the offering price. You'll see the resulting shareholder vote… You can only attempt a merger once a year. You'll get more votes if you offer a higher price." Shares you hold personally vote yes (RT2 Platinum manual, archive.org full text, chapter 7 "Company Detail", OFFICIAL, HIGH). Community practice: buy just over 50 % (driving the price down first), then merge cheaply (COMMUNITY, MEDIUM).
- **Valuation:** share price is "determined by a number of factors… but most especially Earnings Per Share and Book Value Per Share"; buying pushes price up, selling down; Expert model adds margin and short selling and warns AI "can bankrupt you" (manual ch. 8, OFFICIAL, HIGH). Merger price = whatever offer wins the vote.
- **Transfers:** track, stations, trains, cash and **debt** ("you'll end up with their debt," Steam 2015, COMMUNITY, MEDIUM). Merged identity disappears.
- **Bankruptcy:** the player may **declare** it: "Half your debt will disappear, but… you'll have to forfeit all company cash," lose borrowing and bond issuance for a while (manual, OFFICIAL, HIGH); Second Century adds a 50 % share-dilution penalty (OFFICIAL, HIGH). AI companies that go broke are liquidated and "its track and stations stay on the map, managed by the bankruptcy trustees"; an option removes the clutter (Platinum manual Game Options, OFFICIAL, HIGH). Chairman removal is explicit: "Don't disappoint them, or you'll be out on your ear. Remember that chairmen are appointed, not born."
- **AI acquires AI:** yes by design (historical tycoons act in character; "Jay Gould will speculate relentlessly").
- **Anti-snowball:** annual merger cooldown; vote depends on price; bankruptcy penalties; margin calls.
- **Finance-sim drift:** high — the manual openly frames stock manipulation as half the game. RT3 kept the vote-and-minimum-offer merger and "abolished" RT2's stock/debt/bankruptcy exploits (COMMUNITY, MEDIUM).

### 2.5 Railway Empire (Gaming Minds, 2018) / Railway Empire 2

- **Shape:** buy shares until **100 %**, then either **Merge** (take everything, with per-asset choice to keep or demolish) or **keep it operating** and receive its profits (gamepressure guide + Steam threads, PRO/COMMUNITY, MEDIUM). Hitting Merge before owning 100 % pays a 10 % premium on the remainder; marginal share cost rises as you buy, ending near 150–160 % of company value if bought at once (COMMUNITY, MEDIUM).
- **Player loss:** if a rival reaches 100 % of your shares, "your game ends" (RE2, COMMUNITY, MEDIUM).
- **Finance-sim drift:** low — shares exist only as the acquisition ramp; no dividends/IPO layer. A useful "middle" reference between OpenTTD and GearCity.

### 2.6 Offworld Trading Company (Mohawk, 2016) — designer notes

- **Shape:** the **win condition** is buying a majority of every rival; when other players hold six of a company's shares (more than half) "the targeted player is instantly eliminated" and the company becomes a **subsidiary run by a modified AI**, with shareholders receiving its income. Earlier builds gave the buyer all buildings and were changed because "Players often felt the game spiralled out of control" (Soren Johnson, Designer Notes #17, 2016-05-01, DEV STATEMENT, HIGH).
- **Valuation/anti-snowball:** buyouts cost double, plus "20% extra for each share owned by a third party"; the defence is buying your own stock; price rises with each purchase (DEV STATEMENT, HIGH).
- **Lesson:** whole-asset absorption snowballs; converting the loser into an AI-run subsidiary that pays its shareholders keeps the world intact and de-escalates.

### 2.7 Mad Games Tycoon 2 (Eggcode; acquisitions added early 2022)

- **Shape:** buy percentage stakes in NPC developers; 20–50 % yields a small profit share and "smaller decisions"; 100 % yields full control, the right to publish their games, close them, and swap IPs between owned companies (Steam news "Company Acquisitions!", OFFICIAL summary, MEDIUM; tier details from Steam threads, COMMUNITY, MEDIUM).
- **Criticism:** "All companies cost more than it can earn"; NPC studios "don't need money at all" while owned ones charge real monthly costs; the workaround is treating them as "game farms" and pruning their IP libraries (Steam threads Feb 2023, COMMUNITY, MEDIUM). No official valuation formula located.
- **Finance-sim drift:** low; but the mechanic is widely judged economically pointless, a warning that acquisitions need a *reason* beyond ownership.

### 2.8 Industry Giant 2 (JoWooD, 2002; Steam re-release)

- One "opponent info" panel shows company worth and a "take over" button; players believe you must hold cash equal to the company value (Steam 2022, COMMUNITY, LOW). No official documentation located. Weak; recorded only as another "whole-company at displayed value" instance.

### 2.9 Hollywood Animal (Weappy, EA 2025)

- **No inspected source establishes** rival acquisition, merger, or purchase of a rival studio. Store page, Game8 review (2025-03/05) and the Outsider Gaming guide describe competition through talent poaching ("your rivals can't hire them"), theater-slot competition, alliances/rivalries, sabotage/blackmail — and a player **bankruptcy "Game Over" screen** (PRO/COMMUNITY, MEDIUM). Roadmap posts could not be read (Steam page shell only). Treat as: closest thematic comparator, currently no M&A.

### 2.10 Moviehouse – The Film Studio Tycoon (Odyssey/Assemble, 2023)

- Reviews report you can "invest in your rival studios, giving you a steady monthly income" and "buy shares in your competition to create a passive income that far exceeds any costs" — i.e., the mechanic **trivialised the money loop** (LadiesGamers 2023-04-28; Big Boss Battle 2023-05-03; PRO REVIEW, MEDIUM). Cautionary example for a film-studio setting.

### 2.11 Game Dev Tycoon (Greenheart, 2013)

- No acquisition mechanic; competitors are flavour. Bankruptcy is a game-over/reload (fan wiki via search snippet, COMMUNITY, LOW–MEDIUM). Confirms that a small studio sim can be complete without any M&A.

### 2.12 Football Manager (SI)

- Takeovers are **events done to the club**, never by the manager: an approach → due diligence (transfer embargo) → completion or collapse; the new board may sack the manager; "you can't use your career earnings to buy a football club" (Football Manager Story overview, COMMUNITY, MEDIUM). Model of *ownership change as narrative*, not as player agency.

### 2.13 Motorsport Manager (Playsport, 2016)

- No takeover; a hard debt cap blocks spending ("the game won't let me go more into debt… design any new parts") — a debt lockout structurally identical to The Movies' "in debt" build restriction (Steam thread, COMMUNITY, MEDIUM).

### 2.14 Two Point Hospital/Campus, Planet Coaster

- Not inspected in this pass; these are single-venue builders with no rival-company entities in their base design, so an acquisition mechanic is structurally absent (general knowledge, MEDIUM). Nothing to learn here beyond "absence is a valid design."

---

## 3. Cross-check against the original game (The Movies, 2005)

Re-grepped the plain-text extractions (`manual.txt`, `prima.txt`, `gamefaqs-maxx.txt`, `gamefaqs-mark.txt`, `gamepressure-improving.txt`) for acquire/merge/buyout/takeover/bankrupt/bust/closed:

- **RETAIL SHIPPED MECHANIC (manual.txt lines 129–130; Prima "Building in Debt" table ~lines 769–1229):** negative balance only blocks most construction; named facilities remain buildable in debt. No bankruptcy, closure, acquisition, merger, or ownership transfer appears in any retail text inspected. (HIGH)
- **RETAIL SHIPPED MECHANIC (manual.txt line 429; Prima line 1202):** the only inter-studio transaction is selling scripts (and Stars) to rival studios via the selling facility. (HIGH)
- **PRE-RELEASE PROMISE:** the GameSpot E3-2002 first look cited by P15 §5.5 said acquiring competitors was a possible growth path. Not retail. (Not re-fetched here; taken from P15's citation.)
- The compiled bible (lines 2088, 2782, 2866) reaches the same conclusion and tags it correctly ([OFFICIAL manual p.6], [INFERRED] for the no-fail-state design intent).

**Conclusion:** the P15 "REFUTED as shipped parity" rulings for acquisition/merger/subsidiary/library transfer stand. Any successor acquisition is invention and must be labelled as such.

---

## 4. Synthesis table

| Game | Shape | When | Price basis | Transfers | Brand persists? | Player can sell? | AI↔AI? | Anti-snowball | Finance-sim drift | Fun / pain (labelled) |
|---|---|---|---|---|---|---|---|---|---|---|
| **OpenTTD/TTD** | whole-company; bankruptcy offer (+ post-14.0 hostile takeover of AI) | only after 6 months below max-loan (hostile: any time, AI only) | frozen formula: assets + cash, loan excluded; hostile adds loan + 2 yrs profit | vehicles, stations, ratings; no debt on bankruptcy path | **No** — company deleted | no (shares removed) | yes, merit order | vehicle cap; one bidder at a time; replacement AI spawns | none | simple, legible; identity loss; share market removed as exploit-ridden (DEV) |
| **GearCity** | voluntary buyout by vote; consolidation; marque purchase; bankruptcy first-refusal | any time (vote) / on bankruptcy | 1.1–1.2× evaluation × EPS factor; player premium; bankrupt = steep discount but debt included | factories, branches, designs, marques, **debt** | **Yes** (marques with own image) | yes (sell/spin off marques) | yes | premium, refusal when healthy, recession gating, cooldown | very high | coherent but spreadsheet-heavy (COMMUNITY: prices and AI discounts confuse) |
| **Capitalism Lab** | stock accumulation; 50 % control, 75 % direct control, 100 % privatize; private-company buy button | any time | market price / quoted price (formula unpublished) | firms, brands, tech, books as going concern | Yes (subsidiary) | yes (IPO, spin-off) | yes, incl. hostile on player | none documented | total | continuation-after-loss is elegant; everything else is a finance sim |
| **Railroad Tycoon II** | merger by vote at chosen offer | once/year, any time | offer price vs EPS/book share price | track, trains, cash, debt | No | n/a | yes | annual cooldown; margin calls; bankruptcy penalties | high | manual celebrates manipulation; exploits fixed in RT3 (COMMUNITY) |
| **Railway Empire** | 100 % shares → merge or keep as earner | any time | rising marginal share price to ~150 % of value; 10 % premium on remainder | trains, track, buildings (keep/demolish) | optional (keep operating) | shares only | yes; 100 % of player = game over | price escalation | low | clean ramp; late-game hoarding (COMMUNITY) |
| **Offworld TC** | majority buyout → subsidiary run by AI | any time | double price + 20 %/third-party share | share of income, not buildings | Yes (AI-run subsidiary) | n/a | yes | self-buyback, escalating price | medium (stock is the win condition) | designer changed from asset grab to subsidiary to stop spiralling (DEV) |
| **Software Inc.** | >50 % listed shares → Takeover (absorb) or Subsidiary | any time; bankrupt → major holder gets IP | share price inflates per purchase; "bubble" | IP, frameworks, shares; subsidiary keeps staff/name | Yes (subsidiary) / No (takeover) | partial | yes, incl. hostile on player | price inflation only | medium | 2015: "overkill" returns, reputation hit from junk IP (COMMUNITY) |
| **Mad Games Tycoon 2** | % stakes; 100 % = control/publish/close | any time | unpublished | IP swap, publishing rights | Yes | shares | not documented | none | low | "cost more than it can earn" (COMMUNITY) |
| **Moviehouse** | passive investment in rivals | any time | unpublished | income only | Yes | ? | ? | none | low | trivialised money (PRO REVIEW) |
| **Hollywood Animal** | none found | — | — | — | — | — | — | — | — | competition via talent/theaters; bankruptcy = game over (PRO/COMMUNITY) |
| **Game Dev Tycoon** | none | — | — | — | — | — | — | — | none | — |
| **Football Manager** | takeover *of* the club as event | AI-driven | n/a | ownership/board | Yes | no | n/a | n/a | none | narrative only; manager can be sacked |

---

## 5. What produces fun without a corporate-finance simulator

**Patterns that worked (evidence-backed):**

1. **Distress → warning → single frozen-price offer → merit-ordered candidates → deletion or replacement** (OpenTTD). One formula, one dialog, no negotiation. Decades of players never asked for it to be more complex; they asked for the *share* layer to be removed (PR #10709).
2. **Acquired identity persists as a marque/label with its own public image** (GearCity marques; Software Inc./Offworld/Railway Empire subsidiaries). This is what makes an acquisition feel like history rather than a vehicle count going up, and it is what a Legacy finale can narrate.
3. **Debt travels with a bankrupt purchase** (GearCity: "not supposed to be a good deal"). Prevents the bankruptcy path from being a free lunch.
4. **Loss of the studio is not game-over**: the company continues under a new owner and the person continues (Capitalism Lab "Playing Without a Company"; Offworld subsidiary). This matches P12's "no mandatory hard-bankruptcy game-over" law for the player and could later reconcile with an asymmetric rival closure slice.
5. **Reasons to refuse and cool-downs** (GearCity health-based votes, RT2 once-a-year, Railway Empire escalating price) are cheap anti-snowball tools that need no antitrust model.

**Patterns to reject (evidence-backed):**

1. **Partial-share markets with tradeable stakes** — removed from OpenTTD for exploits and bugs; bubble/"lose 300 M overnight" confusion in Software Inc.; RT2's manual-endorsed manipulation. They pull the game toward finance and away from film-making.
2. **Asset-grab absorption** — Offworld's original design was changed because inheriting everything made games "spiral out of control"; Software Inc. 2015 "overkill" returns.
3. **Ownership with no operating purpose** — Mad Games Tycoon 2 acquisitions "cost more than [they] can earn"; Moviehouse passive investments trivialised money. An acquired studio must do something the buyer wants (a library to re-release, a label to keep a genre alive, talent under contract) or it is a spreadsheet trophy.
4. **Anything that lets the player buy rivals while healthy, early** — every game that allows it needed premiums, votes or cooldowns afterwards.

**Does it make the game a finance sim?** Only when the acquisition rides on a share market (GearCity, Capitalism Lab, RT2). Games that expose a single whole-company transaction at a formula price (OpenTTD, Railway Empire, Industry Giant 2, Capitalism Lab's private-company button) stayed operational games.

---

## 6. Recommendation for the P16+ parking lot (design, not P15 scope)

Nothing below is authorised for P15; P15-PACKAGE.md §23/§25 and OWNER-RULINGS §4.2/§5 defer all of it. The accepted snapshot 592e926 already has the minimum substrate a later slice would consume: `StudioIdentity { studioId, role, name, founding, enteredWeek }`, `RivalBusiness.account.cash` with typed period movements, `IndustryEmployment { studioId, terms, endedWeek }`, and films carrying `studioId` (`src/core/hollywoodTypes.ts` lines 6–16, 56–66, 79–91, 105–124). It has **no** ownership, valuation, closure, or rights model — consistent with the P15 "DO NOT TOUCH / P16+ ADDITIVE ROOT NEEDED" line for library/IP (P15-PACKAGE.md line 351).

### 6.1 Candidate staged progression

| Stage | Shape | Why first/later | Borrowed from |
|---|---|---|---|
| **Stage 1 — Bankruptcy asset offer (rival-only, event-driven)** | When a rival reaches the P15B closure-eligible state (if that slice is ever authorised), the settlement emits a one-time, frozen-price **asset lot** (named films/library rights, a few unexpired contracts with consent, optionally the studio *name* as a dormant label) offered to studios in merit order, player included, with a short window; unsold lots are archived and the identity closes. No shares, no negotiation, no debt market (debt is settled inside the P11 ledger before the lot is priced, or explicitly attached as a lump obligation). | Smallest surface; consumes closure rather than creating it; produces Legacy-grade history ("acquired the Pinnacle library in 1958"); cannot snowball because it only fires on failure and prices are formula-frozen. | OpenTTD offer rotation and frozen `bankrupt_value`; GearCity first-refusal + discounted-from-book + debt attached; Software Inc. "major holder receives IP" |
| **Stage 2 — Whole-studio purchase of a distressed rival as a label** | A rival in pre-terminal distress (P15B warning state) may be bought outright at a formula price (assets + cash − obligations, plus a fixed premium), becoming a **label** that keeps its name, mark, image and history and continues to release under its own identity with bounded autonomy. | Adds the "identity persists" fun without a share market; price formula is one function; the label model reuses `StudioIdentity` with an added ownership edge rather than reminting. | GearCity marques; Railway Empire "keep it operating"; Offworld AI-run subsidiary |
| **Stage 3 — Voluntary M&A between healthy studios (last, only if wanted)** | Offer at ≥ formula value with a refusal function based on the target's health and a per-year cooldown; optional sale of the player's own label; AI↔AI events under the same law. | Only here does antitrust/regulatory flavour (Paramount Decree era) become meaningful, and only here is a valuation model needed that the player can reason about. | GearCity vote + premium + recession gating; RT2 once-a-year rule |

### 6.2 Non-negotiables if any stage is ever built

- Never label any of it original-game parity (P15 §5.5, §6).
- `StudioId` is minted once; acquisition appends an ownership event, never remints (ROADMAP line 273).
- Historical creator/owner facts on films are immutable; an acquisition changes *current* rights holder only (P15-PACKAGE.md line 539).
- Player-side symmetry is not required: the rival-only Stage 1/2 path is consistent with P12's asymmetric terminal law, and a player "loss of studio" should, if ever authorised, follow the Capitalism-Lab continuation shape rather than a game-over.
- No partial shares, no stock exchange, no margin, no dividends — every comparator that had them either removed them or became a finance sim.

---

## 7. Corrections and confirmations to prior P15 research

- **CONFIRMED** — P15 §5.5 / §6: no retail source (manual, Prima, GameFAQs FAQs, gamepressure) establishes acquisition, merger, subsidiary, library transfer, bankruptcy or closure; only the "in debt" build lockout and script/Star selling exist. Re-grepped this session.
- **CONFIRMED** — P15 §8 register line 329: OpenTTD is a data-model/testing reference only; this report adds that OpenTTD's own share-trading layer was removed in 14.0 for exploit/bug reasons, which strengthens the "reject takeover translation into P15" ruling and informs P16+.
- **QUALIFIED** — P15 §2 / §23 "acquisition… needs valuation, rights, contract assumption, finance, and ownership-history law": true for Stage 3 (healthy M&A) but the comparator evidence shows a bankruptcy-only asset offer (Stage 1) needs only a frozen formula price and a settlement event, not a valuation or finance model. The deferral is still correct; the *cost estimate* of the smallest slice is smaller than the package implies.
- **QUALIFIED** — P15 §2 preliminary recommendation lists "labels/subsidiaries" together with acquisitions: comparators show label persistence (GearCity marques) is the part players value and the part that produces history; if P16+ is ever scoped, labels should be designed with Stage 2, not left to a generic "subsidiary" finance abstraction.
- **CONFIRMED** — OWNER-RULINGS §4.2: "Corporate Hollywood" does not authorise any of this; nothing in the comparator set argues for pulling it forward.
- **CONFIRMED** — P15 §23 "player closure / bankruptcy asymmetry": Capitalism Lab and Offworld show a non-game-over continuation is a viable, shipped pattern, supporting P12's no-mandatory-hard-bankruptcy law.
- **NOT CORRECTED but flagged** — P15 §5.5 cites two GameSpot pre-release articles for "studio going bust" and "acquiring competitors"; this session did not re-fetch them, so their wording is accepted from P15 at MEDIUM confidence.

---

## 8. Open uncertainties

1. GearCity's exact takeover formula was read through a summariser of the official `gm_stocks` page (MEDIUM); the multipliers should be re-read directly before anyone uses them as a design anchor.
2. GearCity's player-bankruptcy trigger ("6 months negative") is a search-snippet claim only (LOW).
3. Software Inc.'s share-price inflation and takeover pricing have no published formula; only community observation.
4. Mad Games Tycoon 2's tier thresholds (20–50 % / 100 %) come from community summaries of the official post, not the post body itself (Steam page returned shell HTML).
5. Hollywood Animal's Early Access roadmap could not be read; a future Act 2 could add rival acquisition. "No inspected source establishes" is the correct statement today.
6. Offworld's subsidiary income rules were read from the designer diary, not the wiki (fandom returned HTTP 402).
7. Two Point / Planet Coaster were not inspected; their absence of rivals is asserted from general knowledge.

---

## 9. Sources (main)

- OpenTTD source, `master` fetched 2026-09-11: `src/economy.cpp` lines 115–192, 547–643, 1980–2051; `src/company_cmd.cpp` lines 686–707, 745–830; `src/company_base.h` lines 104–107. https://github.com/OpenTTD/OpenTTD
- OpenTTD PR #10709 "Remove: buying/selling/owning company shares" (merged 2023-04-29). https://github.com/OpenTTD/OpenTTD/pull/10709
- OpenTTD 14.0 changelog (2024-04-13), line 166. https://cdn.openttd.org/openttd-releases/14.0/changelog.txt ; 15.0 changelog fixes #12818, #12594.
- OpenTTD wiki Manual/Economy (share-trading/loan text, pre-14.0). https://wiki.openttd.org/en/Manual/Economy
- Software Inc.: official wiki Stocks page (incomplete) https://softwareinc.coredumping.com/wiki/index.php/Stocks ; Steam guide "Subsidiaries and How to use them [Beta 1.6.x]" https://steamcommunity.com/sharedfiles/filedetails/?id=2941566335 ; KosGames subsidiaries guide; Steam threads 2015-05-05 (dev reply), 2017-09-07, 2017-12-15, 2023-02-21; Beta 1.8.12 Steam news.
- GearCity: official wiki `howto_stockmarket`, `gm_stocks`, `howto_marques` https://wiki.gearcity.info ; developer forum "buying bankrupt companies" (2016-05) https://www.ventdev.com/forums/showthread.php?tid=2895 ; Steam threads 2021-02-28 and 2021-07-22 with Eric.B replies.
- Capitalism Lab official pages: Subsidiary DLC, Subsidiary Control, Merging Subsidiary Companies, Privatization, Tips & FAQ, Acquiring a Private Company, Playing Without a Company. https://www.capitalismlab.com
- Railroad Tycoon II Platinum manual full text (archive.org), chapters 7–8 and Second Century notes. https://archive.org/stream/Railroad_Tycoon_II_Platinum/Railroad_Tycoon_II_Platinum_djvu.txt ; GOG forum (2023-04) and Steam RT3 threads (2015–2016).
- Railway Empire: gamepressure guide "Research, bonds and acquiring competitors" https://www.gamepressure.com/railway-empire-guide/research-bonds-and-acquiring-competitors/z0aa86 ; Steam threads.
- Offworld Trading Company: Soren Johnson, "OTC Designer Notes #17: Stock Market" (2016-05-01) https://www.designer-notes.com/otc-designer-notes-17-stock-market/
- Mad Games Tycoon 2: Steam news "Company Acquisitions!" (2022) https://store.steampowered.com/news/app/1342330/view/3173358927541472594 ; Steam threads 2021–2023.
- Industry Giant 2: Steam thread 2022-03-07.
- Hollywood Animal: Steam store page; Game8 review (2025-05-08); Outsider Gaming guide.
- Moviehouse: LadiesGamers review (2023-04-28); Big Boss Battle review (2023-05-03).
- Football Manager: Football Manager Story "Club Takeovers… an overview".
- Motorsport Manager: Steam thread "Bankrupt".
- The Movies retail: scratchpad `original-text/manual.txt` lines 125–131, 429; `prima.txt` lines 769–1229 ("Build in Debt" entries), 1202; compiled bible lines 2088, 2782, 2866.
- Authority: P15-PACKAGE.md lines 85–110, 225–300, 320–335, 351, 393–402, 539, 790–850; P13-P15-OWNER-RULINGS.md lines 125–160; P13-P15-LONG-RANGE-ROADMAP.md lines 215, 260, 273, 676, 695–703, 886–890; accepted snapshot `src/core/hollywoodTypes.ts`.
