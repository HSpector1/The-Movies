# P15 Evidence Review — Management/Tycoon Comparators: Bankruptcy, Distress, Loans, Debt

**Reader role:** independent evidence reader (read-only). **Date:** 2026-09-11.
**Scope:** how shipped management/tycoon games model borrowing, distress warnings, failure, and AI symmetry, and what that implies for the P15B "Corporate Fate" slice (warning → distress → recovery → dormancy) and for any later, separately approved debt/investor system (P16+ parking lot).

**Evidence tiers used below:** RETAIL SHIPPED MECHANIC (manual / official wiki / shipped source code) · OFFICIAL DEV STATEMENT (patch notes, developer forum replies) · CONTEMPORARY PROFESSIONAL (press review/guide) · COMMUNITY INFERENCE (fan wiki, Steam/Reddit players — labeled). Confidence HIGH/MEDIUM/LOW is per claim. "No inspected source establishes X" means exactly that, not proof of absence.

---

## 0. Baseline: what Project: Studio's accepted code and the original game actually do

| Fact | Source | Establishes | Confidence |
|---|---|---|---|
| Accepted code has **no loan, credit, or financing mechanic**. | `accepted-592e926/src/core/studioRunRecap.ts:1003` — recap reason text: "No recovery mechanic (loans/financing) exists in the current rules." | Current code truth; any loan is new design. | HIGH |
| Voluntary commitments are gated by a one-line solvency check (cash after the transaction ≥ 0); **unavoidable weekly debits may still push cash below zero**; negative cash is not terminal. | `src/core/employment.ts:70-80` (`canAfford`, D-12.11 comment) | Negative cash is a recoverable state with no game-over. | HIGH |
| Runway is advisory only ("never a legality rule"). | `src/core/employment.ts:74`; `src/core/economyView.ts:112-141` | Distress cannot be derived from present runway selectors without repair (matches Roadmap §5.3). | HIGH |
| The D-16 harness labels `cash < 0` as `insolvent` but this is a **harness classification**, not game law. | `src/harness/d16/states.ts:9,51,98` | Do not read "insolvent" as a shipped failure state. | HIGH |
| Original game (2005): balance "can go into the red"; in debt you cannot build new sets or certain facilities/ornaments. | Manual, printed p. 6–7 spread ("Cash Balance" HUD note; `original-text/manual.txt:129-130`) | RETAIL SHIPPED MECHANIC: a **soft, recoverable debt state** with a build restriction, no terminal condition. | HIGH |
| Prima "Building in Debt" exception list: Casting Office, Crew Facility, Production Office, Basic Script Office, Stage School, Stage Set, Star & Script Selling Facility. | Prima eGuide printed p. 13 (`original-text/prima.txt:769-777`); corroborated GameFAQs Maxx FAQ (`gamefaqs-maxx.txt:659-661`) | Developer-reviewed guide evidence of the same soft-debt law. | HIGH |
| No inspected retail source (manual, Prima, GameFAQs FAQs, gamepressure) mentions a loan, interest, bankruptcy, or game-over from debt. | grep of all five plain-text extractions for loan/bankrupt/debt/game over | Absence of evidence, not proof of absence; sufficient to prohibit a parity claim for loans or hard bankruptcy. | HIGH |

---

## 1. Per-game dossiers

### 1.1 Hollywood Animal (Weappy, Early Access 2025 →) — the closest genre comparator

**(a) Loans.** Credit is a *researched* product line in the Financial Department, not an always-on facility. OFFICIAL DEV STATEMENT (Hotfix 0.8.12EA, 2025-04-17): "The first credit available to you is now $1m, also it takes less time to unlock." (Steam news gid 543355041065468187). A community guide lists the research chain "$1,000,000 loan → $500 cash per month → $1000 cash per month → Early repayment; $2,000,000 loan → $6,000,000 loan" (Traveler's Hollywood Animal Guide, Steam guide id 3464161838 — COMMUNITY, MEDIUM). A player reports the $1M loan at "12% interest rate" (Steam thread 595162055800082153, poster Das_Daw, Oct 2025 — COMMUNITY, MEDIUM). Another player reports "You cant take a loan for 365 days after repaying the last one" (Steam thread 594033220191056039, the_humourist, Sep 2025 — COMMUNITY, MEDIUM). Update 0.8.71EA (2026-05-07): "Fixed the calculation of the amount you must repay after taking out a loan" (gid 675120209794695998 — OFFICIAL, HIGH that a fixed-repayment loan exists; exact formula not disclosed).

**(b) Failure.** OFFICIAL: "When your bank account balance goes negative, you now have 100 days to recover instead of 50." (Hotfix 0.8.12EA). Bankruptcy is a hard game-over that forces reload/restart (Outsider Gaming guide — CONTEMPORARY PROFESSIONAL, MEDIUM; NeonLightsMedia EA review, MEDIUM). Player-documented cascade on entering the red (COMMUNITY, MEDIUM, version ~0.8.50 beta): −100 reputation "almost immediately"; negative reputation blocks advertising; income arrives at the end of a 4-week screening window so you can fail with money in flight; 100-day clock. Another player: the reputation hit re-fires each week the balance dips (Steam thread 594033220190870507, Doomeetrue).

**(c) AI symmetry.** OFFICIAL (Update 0.8.51EA, 2025-09-30): a rival ("Marginese Pictures") now "come[s] borrow your money" when "his studio was going bankrupt" — i.e., rivals have a distress state and a rival-to-player borrowing event (gid 534362428708750439, HIGH). Dev Q&A (2024-11-11): "You can hurt other studios significantly in Act 1 … things are going to get more brutal in Act 2" (gid 4487367832217059830, HIGH for intent). Update 0.8.67EA (2026-01-27) made competitors "buy cinemas more aggressively and go after your employees" (HIGH). Players report rival bankruptcy reports appearing in the beta (Steam thread 594032586879159899, COMMUNITY, LOW–MEDIUM). No inspected source establishes rival closure/removal or asset disposal.

**(d) Decision created.** Borrow early (cheap capital, high interest, cooldown) vs. run lean; cash vs. "hard cash" (TheGamer, MEDIUM).

**(e) Fun / annoying.** Fun: the tiered, researched credit ladder feels earned; rival distress becomes a relationship event. Annoying (COMMUNITY, labeled): "death spiral" after rebalance (NeonLightsMedia; Steam "game sucks NOW!!"); reputation penalty stacking; loan cooldown removing the only remedy; payout timing (money in flight doesn't count).

**(f) Earned?** Split. Veteran players say it is a "you problem" (9163891); others describe an "inescapable trap especially in early game" (the_humourist). The 50→100-day extension is direct evidence the developer judged the original clock unfair.

**(g) Exploit notes.** Players report free-labor contracts via blackmail to avoid borrowing (Das_Daw); no inspected source shows a loan-to-invest loop, mainly because of cooldown + 12% rate.

### 1.2 Game Dev Tycoon (Greenheart Games, 2012/13)

**(a) Loans.** No voluntary loan. A one-shot **bank bailout** fires when cash falls below a stage-dependent threshold; you must have the repayment on hand when the term ends and the bank takes it automatically. Player example: bank gave $80K, must repay $150K "after a year" (Steam thread 648814841450359975, 2013 — COMMUNITY, MEDIUM). TV Tropes (via search snippet, COMMUNITY, LOW–MEDIUM): thresholds −$50K (garage), −$200K (small team), −$1M (large team); "pay them back double the amount in a year's time." A different player recalls "3 years" (Steam thread 1697175413685144498) — **conflicting**; treat exact term as unresolved.

**(b) Failure.** Fandom wiki (COMMUNITY, MEDIUM): "Bankruptcy occurs when a company is too far in debt and have recently been bailed out by the bank … a game over"; debt threshold "more than 200K (−$200K+)". Game-over text: a rival publisher "purchased the remains of the company" (flavor only).

**(c) AI symmetry.** No AI competitors exist in GDT's economy; N/A.

**(d) Decision.** Accept the bailout and ship one make-or-break game, or reload. Players call it "Death or Glory" (TV Tropes snippet).

**(e/f) Fun / earned.** Players: "the Bankrupt system is well setup and it's always your fault" (Dorok) vs. "1 week away from releasing my greatest game" and asking for "a tiny bit of leeway" (Xehh) (Steam thread 864977564336994349, COMMUNITY). Maverick: "Early on the bailout system is fine … and still has a pretty hefty penalty"; late-game costs "can very quickly exceed the bailout + 2mil in red zone allowance" (Talv).

**(g) Exploit.** None reported; the one-shot, 2× repayment prevents loops. Mods (e.g., "Financial Services") added credit ratings (C→AAA) and 10-year loans because the base game has none (Workshop id 393236776, MEDIUM).

### 1.3 Mad Games Tycoon 2 (Eggcode, 2021 → )

**(a) Loans.** Bank with a credit limit shown on the borrow page; **credit limit and interest linked to difficulty** — OFFICIAL DEV STATEMENT (Eggcode, Steam thread 3052863612120877620, 2021-08-10): "Link the maximum credit limit to the difficulty level … I also linked the interest to the difficulty level … Currently you do not pay overdraft interest." (HIGH for Aug-2021 state). Players: interest "ridiculously low" so loans sit unpaid for decades (Kyouko Tsukino, thread 3552805589771323868 — COMMUNITY, MEDIUM); "On legendary … interest rates are really high" (search snippet, LOW).

**(b) Failure.** Player-documented (COMMUNITY, MEDIUM): after roughly six consecutive months in the red an insolvency warning appears ("get green again or die"); staying negative leads to game-over; a player reached −$114 billion before "the game finally declared my company insolvent" (thread 3113656428083196969, dev replied but did not dispute). A June-2021 patch temporarily broke the consequence ("three years in the reds … nothing happened", Kyouko). MGT1 dev (2015): end-of-year warning was "only a temporary solution. Later, a bank is added" (thread 617329920701486306 — OFFICIAL, HIGH for MGT1 history).

**(c) AI symmetry.** No inspected source establishes AI studios going bankrupt; a player suggestion thread asks for it ("if your company goes bankrupt you get bought by a publisher"), implying it does not exist.

**(d) Decision.** Whether to borrow at all; on Normal, "you have to take loans" to research fast (search snippet, LOW).

**(e/f) Annoying / earned.** "You get some fresh money from the bank at the end of the month and then just give it back one week later. It just doesn't feel right." (Ocean15, COMMUNITY). Legendary "wants you to lose" (Kyouko).

**(g) Exploit — important.** Because there was **no overdraft interest** and the rule was "be positive for one month, counter resets," players describe conjuring capital "out of red digits": go red for X months, pop positive, go red again (GrandeLS, Kyouko; thread 3052863612120877620). The dev's proposed fix was to tie the allowed overdraft to the loan limit and difficulty. Lesson: a counter that resets on one good month is an exploit; a non-resetting or "must stay positive for N months" cure is needed.

### 1.4 Software Inc. (Coredumping, 2015 → )

**(a) Loans.** Fandom wiki (COMMUNITY, MEDIUM, with screenshots): **Quick loans** $6,000–$600,000 over 4 months–5 years; smaller loans must be shorter; example $6,000/4 months costs $7,815; over 2 years $8,649; multiple allowed while total debt < $600,000; early payoff saves remaining interest. **Bank loans** $600,000–$6,000,000 over 4 months–20 years, require accountants ≥ 2 stars, total cost "up to just under 2×"; holding ≥ $600,000 bank debt disqualifies quick loans.

**(b) Failure.** "Bankruptcy … occurs when your money drops below $0"; in Alpha 11 the game warps to 20:00 "(4 hours before you go bankrupt)" — i.e., an end-of-day check with a same-day warning (COMMUNITY, MEDIUM). Coredumping on why players fail: "employees are expensive … startup companies quickly running out of money" (Steam thread 343786746017531224 — OFFICIAL, HIGH for design intent). Players note the game "tells you a few times when there are problems" but not for oversized teams.

**(c) AI symmetry.** Official wiki "Stocks" page lists "Subsidiary/bankrupt" as a takeover route and says AI companies buy/sell shares and perform takeovers (WORK IN PROGRESS page — MEDIUM). No inspected source gives the AI bankruptcy trigger.

**(d/e/f/g).** Decision: short quick loan to bridge a release vs. long bank loan. Wiki warns bank loans "can lead to definite bankruptcy with high monthly repayments" (interest-heavy, amortizing). The instant-at-$0 failure with a same-day warning is the harshest trigger in this set; player threads ("Plagued by Bankruptcy", "I Keep Getting Bankrupt!") show recurring frustration.

### 1.5 GearCity (Visual Entertainment and Technologies, 2014 → )

The most complete corporate-finance model in the set; official wiki (wiki.gearcity.info) is developer-written → RETAIL/OFFICIAL, HIGH.

**(a) Loans.** Three instruments (`gamemanual:howto_financing`, `gui_financials`): **Line of credit** (revolving; one at a time; interest on unpaid balance; "banks will not … raise your maximums" once failing). **Bank loans** (amortizing; fixed monthly payment incl. principal; unlimited count; payable early; "the more money or time you ask for, the higher interest rates go"; rate = global interest rate × credit rating). **Bonds** (interest-only coupon, balloon principal at maturity; cannot be repaid early for 3 game-years; "if you can not afford … take out an additional bond"). IPO as equity. Setting "Start with a bank loan" (loan = company value, random term/rate, locks financing systems). Credit rating recovers faster with loans than bonds; paying off early can *tank* the rating (Steam thread 1741105805764113711, COMMUNITY).

**(b) Failure.** Staged: "Bankrupt Warning!" action memo — accounting "can shift money around and buy us {N} months until we default"; remedy buttons **Cut Funding** (marketing) and **Cut Production/Funds** (`references_actionmemos` row 1001, HIGH). Trigger — OFFICIAL DEV STATEMENT (Eric.B, Steam thread 1694922980033868934 p.2): "If your cash on hand is negative for 6 months in the game you will bankrupt"; in 1.23 SP4 the counter **did not reset** (5 months negative + a loan + 1 more negative month = bankrupt); changed in 1.24 (HIGH for the version cited; post-1.24 rule not inspected). Achievements confirm a post-1960 government **bailout** exists ("Too Big To Fail: Have company bailed out from going bankrupt"; also "Rags To Riches: have negative cash funds … then most cash of all companies") — HIGH that they exist, mechanics not documented. Optional "Can be fired (Game Over)" when shareholders control >50% (`new_game_settings`, HIGH).

**(c) AI symmetry.** Yes — AI companies go bankrupt with three outcomes: liquidation, refinanced survival "under new ownership", or sale; "The player gets first pick, if he declines, the AI companies are then checked … if none are found the assets are liquidated" (Eric.B, ventdev forum pid 7643 — OFFICIAL, HIGH). Bankrupt-company purchases carry debt ("Debts don't magically disappear"; e.g., $1 price + $1.2B liabilities).

**(d–g).** Decision: instrument choice (rate vs. term vs. balloon risk vs. rating). Earned: mostly; the non-resetting counter produced surprise bankruptcies the dev then changed. Exploit: bond-rollover ("take an additional bond") is explicitly sanctioned; buying bankrupt rivals for $1 is a trap by design.

### 1.6 Capitalism Lab (Enlight, 2012 → )

**(a) Loans.** Official site (capitalismlab.com/banking-dlc/bank-loans — OFFICIAL, HIGH): banks are corporations; each sets its own credit limit and interest; "A longer term carries a higher interest rate"; multiple loans while limit positive; repayment amount player-chosen. Game settings expose "Base Loan Interest Rate", "Bond Credit Standard (Loose/Normal/Tight)", "Maximum Loan-to-Asset Ratio", and "Economy's Impact on Loan Defaults" (new-game-settings page, HIGH).

**(b) Failure.** Official: "you are your company — lose it and it's game over" (Capitalism Lab X post via search, MEDIUM); an "out-of-cash screen" with **Declare Bankruptcy**; the company "is liquidated to pay off its debts (there's no avoiding that)"; the Billionaire Life DLC adds "Continue After Bankruptcy" (keep personal wealth, found a new company) (playing-without-company page — OFFICIAL, HIGH). Community: failing to repay bond principal at maturity bankrupts the company (NamuWiki snippet — COMMUNITY, LOW).

**(c) AI symmetry.** Yes — "Acquire Companies That Are Facing Bankruptcy" is an official feature: a window asks if you want to rescue a failing company "by you, buying all of its shares" (OFFICIAL, HIGH). Banks themselves can fail.

**(g) Exploit.** Documented bug/exploit: draw the full credit line before a bank's announced bankruptcy; the debt is forgiven (forum t=8106, 2020; t=7985) — lesson: creditor failure must transfer, not erase, debt.

### 1.7 OpenTTD / Transport Tycoon Deluxe (Chris Sawyer 1995; OpenTTD GPL-2.0)

Source read at the P15-pinned commit `96651d3` (SHIPPED CODE, HIGH):

**(a) Loans.** Revolving, interest-only, £10,000 steps (`economy_type.h:207 LOAN_INTERVAL`); max loan default £300,000, inflation-scaled (`difficulty_settings.ini:112-121`; `economy.cpp:737`); interest 2–4 %/yr, fixed at game start (`difficulty_settings.ini:127-135`); paid monthly with exact rounding; **interest is also charged on negative cash** "to prevent cheating or abuse" (`economy.cpp:801-829`). Takeover adds the target's loan to yours (wiki Economy, HIGH).

**(b) Failure.** `CompanyCheckBankrupt` (`economy.cpp:547-627`), run monthly: the counter advances only while `money − loan < −maxLoan` (line 553) — **negative cash alone is not distress**; the counter resets when the position recovers. Month 4: "company in trouble" news + script event; month 7: company **offered for sale** at asset value excluding loan (`CalculateCompanyValue(c,false)`); month 10 (or 7 if worthless): company deleted — **except** the local human company in single-player: "leave the company playing … there is no THE-END" (lines 606-611). Infinite-money setting disables it all.

**(c) AI symmetry.** Rules are identical for AI and player companies; the *terminal* step is asymmetric by code: AI/multiplayer companies are removed; the single-player human keeps playing. This is a shipped precedent for P15's "rival closure permitted, no mandatory player game-over" law.

**(d–g).** Decision: take max loan day one (community consensus; interest trivial). Earned: yes but rarely reached — players discuss loan *size*, never default (BTPro thread 730, COMMUNITY). Exploit: cheap max loan is a snowball by design; negative-cash interest closes the "don't borrow, just overdraft" hole.

### 1.8 RollerCoaster Tycoon 1/2 and OpenRCT2 (GPL-3.0, pinned `9279d06`)

**(a) Loans.** Scenario-authored revolving, interest-only loan: scenario editor fields "Initial loan / Maximum loan size / Annual interest rate" (`en-GB.txt` STR_3241-3243); defaults £10,000 initial, £20,000 max, 10 % (`Finance.cpp:240-243`); adjust in £1,000 steps (`Finances.cpp:541,557`); "The bank refuses to increase your loan!" above max; you **may raise the loan while cash is negative** (`ParkSetLoanAction.cpp:40-58`); repayment limited to cash on hand. Interest formula `loan×5×rate>>14` per payment tick (RCT1 flag: `loan/2400`) (`Finance.cpp:144-161`).

**(b) Failure.** **No bankruptcy exists.** Objectives fail only at the deadline (guests/park value by year N) or when park rating stays below 700 for ~4 weeks ("park has been closed down") (`ScenarioObjective.cpp:25-65,130-150`). Negative cash simply blocks spending. One objective type is "Repay loan and achieve a given park value" (STR_2407).

**(c) AI.** None. **(d–g).** Decision: borrow to build early; repay to hit loan objectives. Earned: N/A. Exploit: max loan is free early capital; no default risk.

### 1.9 Planet Zoo (Frontier, 2019) — Planet Coaster not separately inspected

**(a)** Official Frontier guide (one.planetzoogame.com "Managing your zoo" — OFFICIAL, HIGH): "The number and type of loans available are set per scenario … Each year, the outstanding amount on the loan increases by a fixed percentage … The loan can be paid off yearly with a set amount, or as a total sum at any given point without penalty." (b) No inspected official source establishes a bankruptcy/game-over; players keep operating in debt and describe restarts as a choice ("If you have too many loans it may be hopeless and you might have to restart" — Razamanaz, Steam thread 2137462524953165878, COMMUNITY, MEDIUM). (c) No AI. (g) Loans are called "a trap" by players; annual compounding on the outstanding balance punishes ignoring them.

### 1.10 Cities: Skylines (2015) and Cities: Skylines II (2023)

**CS1** (Paradox wiki Economy — OFFICIAL, HIGH): three fixed-tier amortizing loans — Silver Sunset Bank ₡20,000 / 52 weeks / 5 % (total ₡21,000); Global Credit Inc. ₡60,000 / 260 weeks / 10 % (₡66,000); Pyramid Capital ₡200,000 / 520 weeks / 15 % (₡230,000); instant repayment at no extra cost; tiers unlock with milestones. **Bailout:** when money "falls below −₡10,000" the game offers ₡50,000 with no repayment, once per save, and "the savegame is disqualified from having any achievements". No game-over; the city just cannot build.

**CS2** (cs2.paradoxwikis Economy — OFFICIAL, MEDIUM): a single adjustable loan adding "2.3–20 % of the loaned amount to monthly expenses"; limit scales with milestones "from ₡100,000 to ₡26,100,000"; City Hall −1 %, Central Bank −2 %; increase/repay any time. No inspected source establishes a CS2 bailout or game-over; players run multi-million negative balances and recover via milestone cash injections (Steam thread 5540052310304154719, COMMUNITY).

**(c)** No AI. **(d–g).** Decision: cheap early capital vs. weekly burden. Annoying: loans "just made things worse, adding 200k to the monthly expenses" (CS2 player). Exploit: CS1 bailout is a one-shot free ₡50k gated by achievements — an "honest" softener.

### 1.11 Two Point Hospital (Two Point Studios, 2018)

Fandom wiki with in-game screenshots (COMMUNITY, MEDIUM): three fixed-tier amortizing lenders — Two Point Bank $25–50K at 5 % p.a. over 24 months; Swindles $75–100K at 10 %/24 months; Smell My Cash $150–250K at 15 %/36 months, gated by hospital value $500K, reputation 25, level 2; monthly auto-repayment; full early repayment allowed. **Failure:** "warning at −$150,000 and then … officially bankrupt at −$300,000"; then reload or restart the level (corroborated by player Freiya, Steam thread 1770385542776191468). No AI. Players report losing is hard unless over-expanding.

### 1.12 Prison Architect (Introversion, 2015)

Paradox wiki "Winning and Failure Conditions" (OFFICIAL, HIGH): "If you have a negative bank balance **and** a negative cash-flow, you are bankrupt. You will have 24 hours to put in place a financial rescue package before being sacked." Fandom (COMMUNITY, MEDIUM): CEO warning message; **Government Bailout** hidden grant ($50,000 advance + $50,000 on completion) unlocks with <$500 cash, >30 prisoners, ≥$10,000 bank debt, ≤$0 cashflow, once per game; Legal Defense research averts game over once. **Bank loan** (Bureaucracy research): up to $250,000, daily interest, unpaid interest capitalizes, credit rating rises while repaying and falls on non-payment ("the bank won't give you any more money"). Failure = the *warden* is sacked (you lose control; the prison persists in Escape Mode). No AI.

### 1.13 Anno 1800 (Ubisoft Blue Byte, 2019)

Fandom "Coins" (COMMUNITY, MEDIUM): bankruptcy at **−5,000 coins**; one free second chance (Archibald Blake gifts 25,000); reaching −5,000 again = "losing the game". Players report a visible countdown ("bankruptcy in 28 days") when negative (search snippet, LOW). No loans in the base game (no inspected source establishes any). AI players hold shares and can take over islands, but no inspected source establishes AI bankruptcy.

### 1.14 Football Manager (Sports Interactive, annual)

Official FM24 manual page was inaccessible (403); official feature page cited by P15 covers transfer/finance context only. Community (fm-base thread 77613 — COMMUNITY, MEDIUM): when a club runs out of money, **administrators take over financial control**, "the team is deducted 9 points, transfer embargo is placed and players are up for cheap"; clubs can re-enter administration repeatedly ("36 points deducted"); AI clubs suffer the same (Portsmouth, Liverpool examples); the *manager* is not automatically sacked, the board/creditors act. Loans are board-owned, not manager-chosen. Real-world analogue confirmed by press (Derby County 12-point deduction, ESPN 2021).

### 1.15 Railroad Tycoon 3 (PopTop, 2003) — brief

StrategyWiki (COMMUNITY, MEDIUM): bonds of $500,000 with 2 % underwriting, issuable only at credit rating ≥ "B"; "If the debts becomes overwhelming, the company can declare bankruptcy to shake off some bonds at the cost of the company's credit rating." Personal vs. company money split; chairman can be removed by shareholders. AI companies use the same bond/stock system.

---

## 2. Cross-cutting patterns

### 2.1 Trigger taxonomy (what actually flips "distress")

| Trigger type | Games | Note |
|---|---|---|
| Instant at cash < 0 (end-of-day) | Software Inc. | Harshest; same-day warning only |
| Negative cash for N months (counter) | GearCity (6 mo, non-resetting in 1.23), MGT2 (~6 mo warning, community), OpenTTD (net position < −maxLoan for 3/6/9 mo, resetting) | Counter-reset rule decides exploitability |
| Negative cash for N days (clock) | Hollywood Animal (50 → 100 days), Prison Architect (24 h, needs negative cashflow too), Anno 1800 (countdown, community) | Visible clock = legible |
| Fixed negative threshold | Two Point Hospital (−150K warn / −300K fail), Anno (−5,000), GDT (stage thresholds → bailout, then any relapse) | Threshold scales with stage in GDT |
| Failed scheduled payment | Capitalism Lab (bond maturity, community), GearCity ("default on our payments") | Only games with real debt instruments |
| Governance failure (shareholders/board) | GearCity "Can be fired", RRT3 chairman, Football Manager administration | Not cash-based |
| No failure state | RCT1/2/OpenRCT2, Planet Zoo, Cities: Skylines 1/2 | Sandbox-tolerant; objectives fail instead |

### 2.2 Warning stages

Two-stage (warn → fail) is the norm: TPH (−150K/−300K), OpenTTD (trouble → for sale → removed), Prison Architect (CEO warning → 24 h → sacked), GearCity (Bankrupt Warning memo with N months + remedy buttons). One-stage clocks (HA 100 days, Anno countdown) work when the clock is visible. GearCity is the only one whose warning **offers typed remedies inline** (Cut Funding / Cut Production) — the closest existing analogue to P15B's "typed remedy capability families".

### 2.3 AI symmetry

| Game | AI obeys same rules? | AI can fail? | Terminal handling |
|---|---|---|---|
| GearCity | Yes | Yes | liquidate / refinance / sold (player first refusal) |
| Capitalism Lab | Yes (banks too) | Yes | player may rescue by buying shares |
| OpenTTD | Yes | Yes | AI removed; single-player human never removed |
| Hollywood Animal | Partially documented | Distress yes (0.8.51); closure not established | rival borrows from player |
| Software Inc. | Partially documented | Implied ("Subsidiary/bankrupt" takeover) | unknown |
| Football Manager | Yes | Yes (administration) | points deduction, embargo, fire sale |
| RRT3 | Yes | Yes | bankruptcy sheds bonds |
| GDT, MGT2, TPH, PA, Anno, RCT, PZ, CS | no economic rivals / no rival failure established | — | — |

### 2.4 Exploit / snowball catalogue

1. **Reset-on-one-good-month counter** → "red digits are free" (MGT2). Fix: cure requires N consecutive positive months, or a non-resetting counter with a visible clock (GearCity 1.23 went too far the other way).
2. **No interest on overdraft** → overdraft beats borrowing (MGT2 pre-fix). OpenTTD charges interest on negative cash explicitly to stop this.
3. **Creditor failure forgives debt** (Capitalism Lab bug). Debt must transfer.
4. **Cheap max loan at start** (OpenTTD, RCT) → borrowing is a free snowball; only acceptable where failure is not the design goal.
5. **Bond roll-over** (GearCity) → sanctioned Ponzi-lite; needs a credit-rating brake.
6. **Buy bankrupt rival for $1 + its debt** (GearCity) → deliberately bad deal; relevant only if P16+ ever adds acquisition.
7. **Money-in-flight failures** (HA: 4-week screening payout; GDT: one week before release) → the most-cited "unearned" losses. Any P15B predicate should count *scheduled receipts* (P11 already exposes them) before declaring distress.

---

## 3. Synthesis table

| Game | Loan model | Bankruptcy trigger | Warning stages | AI symmetric? | Adopt for Project: Studio | Reject for Project: Studio |
|---|---|---|---|---|---|---|
| Hollywood Animal | researched tiered credit ($1M→$2M→$6M), fixed repayment, ~12 % (player), 365-day cooldown (player) | balance < 0 for 100 days (official) | one visible clock + reputation penalty | rivals have distress + borrow-from-player event; closure not established | visible recovery clock; rival distress as a *relationship event*; counting receipts in flight (as a fix) | reputation double-jeopardy; loan cooldown that removes the only remedy; hard game-over |
| Game Dev Tycoon | none voluntary; one-shot bailout ≈2× in ~1 yr | debt > ~$200K after a bailout | bailout itself is the warning | N/A | "one honest second chance" framing | forced bailout as sole instrument; instant game-over |
| Mad Games Tycoon 2 | bank credit, limit+interest by difficulty; no overdraft interest (2021) | ~6 months negative (community) | one warning | not established | difficulty-scaled limits | resetting counter (exploit); free overdraft |
| Software Inc. | quick loans $6K–600K (4 mo–5 yr) + bank loans $600K–6M (to 20 yr, ≤2× cost) | cash < 0 at day end | same-day warp warning | partial | product ladder gated by staff skill (parallels HA research gate) | instant failure at $0 |
| GearCity | line of credit + amortizing loans + bonds + IPO; rate = global rate × credit rating | 6 months negative cash (dev), counter non-resetting in 1.23 | memo with N-month runway + inline remedies; post-1960 bailout | yes — liquidate/refinance/sold, player first refusal | **typed inline remedies; runway-in-months warning; credit rating that recovers by behavior** | full bond/IPO stack; non-resetting counter surprise; $1 rival purchases |
| Capitalism Lab | per-bank credit limit/rate; term ↑ rate ↑; loan-to-asset caps | out of cash → Declare Bankruptcy / liquidation; bond default | out-of-cash screen | yes, incl. banks | explicit "declare" choice at the terminal edge (player agency) | game-over default; bank-failure debt forgiveness |
| OpenTTD | revolving interest-only, £10K steps, 2–4 %, max £300K; interest on negative cash | money − loan < −maxLoan for 3/6/9 months | trouble (3 mo) → for sale (6 mo) → removed (9 mo) | rules symmetric; **human never removed in single-player** | **the asymmetric terminal law precedent; staged months; net-position (not raw cash) trigger** | takeover/for-sale stage (P16+); trivial-interest snowball |
| RCT2 / OpenRCT2 | scenario-authored revolving loan, £1K steps, 10 % default | none (objective deadline / rating) | none | N/A | loan adjustable while negative (no lock-out) | absence of any failure |
| Planet Zoo | per-scenario loans, annual compounding, no early-payment penalty | none established | none | N/A | penalty-free early repayment | — |
| Cities: Skylines 1 | three fixed amortizing tiers 5/10/15 % | none; bailout ₡50K at −₡10K, once, disables achievements | bailout prompt | N/A | fixed tiers are legible | achievement-gated bailout is irrelevant here |
| Cities: Skylines II | one adjustable loan, 2.3–20 % monthly add, limit scales ₡100K–26.1M | none established | none | N/A | limit scaling with progression | opaque rate curve |
| Two Point Hospital | three fixed tiers 5/10/15 % p.a., 24–36 mo, gated by value/reputation | −$300K | warning at −$150K | N/A | two-stage numeric warning | hard reload/restart |
| Prison Architect | up to $250K, daily interest, capitalizing, credit rating | negative balance AND negative cashflow → 24 h | CEO warning; once-per-game bailout/legal defense | N/A | **two-condition trigger (stock AND flow)**; once-only rescue | 24 h window; sacked-warden framing |
| Anno 1800 | none | −5,000 coins, one free second chance | countdown (community) | AI takeovers only | one-time second chance | game-over default |
| Football Manager | board-owned loans | administration when out of money | none for manager | yes | consequences that persist (embargo, fire sale) as *remedy costs* | points deductions; creditor forced sales (P15 already rejects) |
| Railroad Tycoon 3 | bonds $500K, credit rating ≥ B, 2 % fee | declare bankruptcy sheds bonds at rating cost | — | yes | credit rating as memory of behavior | bond/stock stack |

---

## 4. "Best simple loan system" candidates (for a *separately approved* Owner decision — not P15B law)

Authority check first: P15 §16 says "Loans, bailouts, investors, forced sales, or acquisition are not implied" for P15B, and the Rulings/Roadmap park "debt/equity/investor integration if separately approved" in P16+. Nothing below may enter P15A/B without a new Owner ruling. Ranked by simplicity × legibility × exploit resistance:

1. **Fixed-tier amortizing loans, unlocked by studio scale (CS1 / Two Point Hospital pattern).** 2–3 authored tiers with fixed principal, term, and flat rate; automatic weekly repayment posted through P11 as a *known obligation beside Cash* (Roadmap §5.3 already requires obligations to sit beside cash, not be subtracted secretly). Early repayment at no penalty (Planet Zoo). Why: no credit-rating simulation, no revolving balance to game, every number visible in advance; players in TPH/CS1 rarely complain about the instrument itself. Rival symmetry is trivial (same tiers, deterministic P12 policy).
2. **Single revolving interest-only line with a hard cap and interest charged on overdraft (OpenTTD pattern).** One number to reason about; cap scales with an authored progression; charging interest on negative cash closes the "overdraft instead of borrow" hole. Why not first: revolving lines invite the "max it day one" snowball unless the rate is meaningful.
3. **Research-gated credit ladder (Hollywood Animal pattern).** Fits a studio whose Financial Department is a building; but the cooldown and 12 % rate produced the strongest "trap" criticism in the set; adopt the gating, not the cooldown.

**Not recommended:** GearCity/RRT3/Capitalism Lab bond–IPO–rating stacks (too much machinery for a film studio and they pull toward the P16+ ownership domain); GDT-style forced bailout as the *only* instrument; any creditor that can fail.

**Distress-law takeaways independent of loans (usable by P15B as evidence, not law):**
- Trigger on a **net position over a window** (OpenTTD `money − loan < −maxLoan`; Prison Architect "negative balance AND negative cashflow"), never on one negative week — matches P15 §12.3 "a single negative-cash week cannot skip directly to dormancy".
- A **visible clock or month-runway** in the warning (GearCity memo, HA 100 days) reads as fair; hidden non-resetting counters read as unfair (GearCity 1.23 complaints).
- **Cure must be sustained**, not one good month (MGT2 exploit).
- **Count scheduled receipts** before declaring distress (HA/GDT money-in-flight complaints); P11 already exposes scheduled receipts.
- **Typed inline remedies** at the warning (GearCity Cut Funding / Cut Production) are the shipped analogue of P15B's remedy families.
- **Terminal asymmetry has precedent**: OpenTTD single-player keeps the human company alive while AI companies are removed, using identical pre-terminal stages — exactly the shape P15 §17 describes.

---

## 5. Corrections / confirmations against prior P15 text

- **CONFIRMED** (P15 §6, Roadmap §5.3, Annex `negativeCashOnly`): "Negative cash is not bankruptcy" is both current code truth (`employment.ts:70-80`, `studioRunRecap.ts:1003`) and original-game retail law (manual p.6–7; Prima p.13).
- **QUALIFIED** (P15 §6 row "original hard bankruptcy — pre-release wording conflicts with retail-source silence"): retail sources are not *silent*; they affirmatively describe a non-terminal "in the red / in debt" state whose only consequence is a build restriction. The row should read "retail sources describe a soft debt state; no retail source describes a terminal state".
- **CONFIRMED** (P15 §12.3/§17 terminal asymmetry): a shipped, widely played precedent exists — OpenTTD `economy.cpp:606-611` keeps the single-player human company alive ("there is no THE-END") while AI companies are deleted after identical stages.
- **QUALIFIED** (P15 §7 comparator atlas, Football Manager row): the cited FM feature page is about transfer/finance context; FM's actual distress mechanic is administration (points deduction, embargo, creditor fire sales — community-documented), which P15 already rejects. The atlas contains **no** management-sim distress comparator; GearCity's warning memo with inline remedies and OpenTTD's staged months are stronger comparators for "warn and remedy without surprise failure".
- **QUALIFIED** (P15 §16 "at least two legitimate recovery routes … Loans … not implied"): every comparator that has a distress state also ships at least one liquidity instrument (loan, bailout, grant, or second-chance gift). P15B's remedy set (reduce obligations, delay/cancel uncommitted plans, complete a conserved release, dormancy) is feasible but unusual; the design should prove those routes are reachable in the hostile fixture without borrowing, or the Owner should be shown the loan question explicitly.
- **CONFIRMED** (P15 §8 register): OpenTTD/OpenRCT2 remain pattern references only; OpenTTD's bankruptcy code contains a takeover ("offered for sale") stage that P15 correctly refuses to translate; OpenRCT2 has no bankruptcy at all, so it is not a distress reference.
- **CONFIRMED** (P15 §5.5 / Rulings §4.2): no comparator evidence changes the "acquisition is P16+" ruling; GearCity and Capitalism Lab show that bankrupt-rival purchase drags in valuation, debt assumption, and contract law — exactly the P16+ dependencies P15 lists.

---

## 6. Open uncertainties

1. Game Dev Tycoon bailout terms conflict across community sources ("double in a year" vs "3 years"); one dated player example (80K → 150K after a year) is the only concrete datum.
2. Mad Games Tycoon 2 insolvency timing and whether overdraft interest was added after Aug 2021 (dev said "could be added").
3. Software Inc. exact bankruptcy check timing and AI-company bankruptcy rules (official wiki page is WIP).
4. Hollywood Animal: loan interest, tiers, and the 365-day cooldown are player-reported and version-dependent (0.8.5x–0.8.7x); whether rivals can *close* and what happens to their assets is not established; the current repayment formula is undisclosed.
5. GearCity's post-1.24 bankruptcy counter and the mechanics of the post-1960 bailout ("Too Big To Fail").
6. Capitalism Lab base-game trigger (out-of-cash screen vs. bond-maturity default) — the official page describes the screen, the trigger rule is community-sourced.
7. Cities: Skylines II bailout existence; Planet Coaster loan specifics — not inspected.
8. Football Manager official manual text on administration was inaccessible (403); only community and press evidence inspected.

---

## 7. Sources (main)

- Project authority: `authority/P15-PACKAGE.md` §5.5, §6, §7, §12.3, §16, §17, §23, §25; `P15-BUILDER-ANNEX.md` rows 64–67, 119–127, 1030; `P13-P15-OWNER-RULINGS.md` §4, §5; `P13-P15-LONG-RANGE-ROADMAP.md` §5.3.
- Accepted code `592e926`: `src/core/employment.ts:60-80`; `src/core/economyView.ts:112-181`; `src/core/studioRunRecap.ts:995-1006`; `src/harness/d16/states.ts:9-98`.
- Original game: `original-text/manual.txt:125-131` (manual printed p.6–7); `original-text/prima.txt:769-777` (Prima p.13); `original-text/gamefaqs-maxx.txt:659-661`.
- Hollywood Animal: Steam news gids 543355041065468187 (Hotfix 0.8.12EA), 534362428708750439 (0.8.51EA), 529869613052202357 (0.8.67EA), 675120209794695998 (0.8.71EA), 688638619235125212 (0.8.72EA), 4487367832217059830 (Q&A) at `https://store.steampowered.com/news/app/2680550/view/<gid>`; Steam threads 595162055800082153, 594033220191056039, 594033220190870507, 777534492476770278, 594032586879159899; Steam guide 3464161838; outsidergaming.com guide; neonlightsmedia.com EA review; hollywoodanimal.fandom.com.
- Game Dev Tycoon: gamedevtycoon.fandom.com/wiki/Bankruptcy (API wikitext); Steam threads 648814841450359975, 864977564336994349, 1697175413685144498, 648814844899559993; Workshop 393236776.
- Mad Games Tycoon 2: Steam threads 3052863612120877620 (Eggcode replies 2021-08-10), 5691968038980072138, 3552805589771323868, 3113656428083196969, 600779252329095472; MGT1 thread 617329920701486306.
- Software Inc.: software-inc.fandom.com Loans & Bankruptcy (API wikitext); softwareinc.coredumping.com/wiki Stocks; Steam thread 343786746017531224.
- GearCity: wiki.gearcity.info `gamemanual:howto_financing`, `gui_financials`, `references_actionmemos`, `references_achievements`, `new_game_settings`, `howto_stockmarket` (raw exports); Steam threads 1694922980033868934 (Eric.B), 358417008714656279, 1741105805764113711; ventdev.com forum pid 7643.
- Capitalism Lab: capitalismlab.com/banking-dlc/bank-loans, /banking-dlc/new-game-settings, /acquire-companies-facing-bankruptcy, /playing-without-company; capitalism2.com forum t=8106, t=7985.
- OpenTTD `96651d3`: `src/economy.cpp:151-159, 547-627, 640-643, 737, 801-829, 899`; `src/table/settings/difficulty_settings.ini:112-135, 316-319`; `src/economy_type.h:207`; wiki.openttd.org/en/Manual/Economy; openttd.btpro.nl thread 730.
- OpenRCT2 `9279d06`: `src/openrct2/management/Finance.cpp:144-161, 240-243, 281-283`; `src/openrct2/actions/park/ParkSetLoanAction.cpp:40-64`; `src/openrct2/scenario/ScenarioObjective.cpp:25-65, 130-150, 232-241`; `src/openrct2-ui/windows/Finances.cpp:537-560`; `data/language/en-GB.txt` STR_1920, 2365, 2407, 3241-3243.
- Planet Zoo: one.planetzoogame.com/help-centre/player-guides/managing-your-zoo; Steam thread 2137462524953165878.
- Cities: Skylines: skylines.paradoxwikis.com/Economy; cs2.paradoxwikis.com/Economy; Steam thread 5540052310304154719.
- Two Point Hospital: two-point-hospital.fandom.com Loans & Money (API wikitext); Steam thread 1770385542776191468.
- Prison Architect: prisonarchitect.paradoxwikis.com/Winning_and_Failure_Conditions; prison-architect.fandom.com Failure_Conditions, Government_Bailout, Bureaucracy.
- Anno 1800: anno1800.fandom.com/wiki/Coins.
- Football Manager: fm-base.co.uk thread 77613; footballmanager.com features page (as cited by P15).
- Railroad Tycoon 3: strategywiki.org Railroad_Tycoon_3/Gameplay.
