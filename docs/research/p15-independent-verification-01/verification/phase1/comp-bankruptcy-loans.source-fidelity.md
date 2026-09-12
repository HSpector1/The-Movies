# Source-Fidelity Verification — `comp-bankruptcy-loans.md`

**Verifier role:** adversarial, read-only. **Lens:** does the cited source actually say what the report says, is the page/line/URL right, is the evidence tier correctly assigned? **Date:** 2026-09-11.
**Report under review:** `<scratchpad>/out/phase1/comp-bankruptcy-loans.md`

**Method.** I selected the 14 most consequential claims (the ones the synthesis and the P15 corrections section rest on) and reproduced each citation myself: `sed`/`grep` on the accepted-592e926 snapshot and the original-text extractions; `pdftotext` + visual page render of the Prima and manual PDFs for exact page numbers; `curl` of Steam news (API + store view gids), Steam discussion threads (mature-content cookie required), the GearCity wiki raw exports, the ventdev forum, fandom/Paradox wikis via API/WebFetch; and `curl` of GitHub raw files for OpenTTD `96651d3` and OpenRCT2 `9279d06`. WebSearch budget was exhausted before this pass, so every check below is a direct fetch of the cited location, not a search-snippet.

**Overall verdict: VERIFIED WITH CAVEATS.** 12 of 14 checks reproduce exactly (verbatim text, correct line numbers, correct gid/URL, correct tier). Two citations are off: one page-number error (Prima "Building in Debt" is printed p. 14, not p. 13) and one small misquotation plus one formula overstatement in the GearCity dossier. None of the errors changes a conclusion; all are correctable in place.

---

## Check-by-check

### C1. Accepted code: no loan/financing mechanic; negative cash recoverable — **CONFIRMED (HIGH)**

| Cited | Reproduced |
|---|---|
| `src/core/studioRunRecap.ts:1003` "No recovery mechanic (loans/financing) exists in the current rules." | Line 1003 contains exactly that string inside a `reasons.push(...)`. A `grep -rniE '\bloan|financing|bankrupt|insolven' src/core` returns **only** this line. |
| `src/core/employment.ts:70-80` `canAfford`, D-12.11 comment | Comment block lines 70–76 ("D-12 solvency gate (D-12.11) … cash AFTER this immediate transaction must be ≥ 0 … Unavoidable weekly debits (payroll/overhead/existing commitments) may still push cash below zero"); `export function canAfford` at line 78. Exact. |
| `employment.ts:74` runway "never a legality rule" | Line 74: "(that is advisory runway, never a legality rule)". Exact. |
| `economyView.ts:112-141` runway | Lines 112–141 are the `Runway` type, `runwayOf`, and `runway()` with the "CURRENT COMMITMENTS ONLY" comment. Exact. |
| `harness/d16/states.ts:9,51,98` `insolvent` label | Line 9: `insolvent     cash < 0` in the ladder comment; line 51: `FinancialState` union includes `'insolvent'`; line 98: `if (cash < 0) label = 'insolvent'`. Exact; it is a harness label, as the report says. |

Tier: current-code truth, correctly stated as such.

### C2. Original game: manual "balance can go into the red", printed p. 6–7 — **CONFIRMED (HIGH)**

`original-text/manual.txt:129-130`: "Note:Your balance can go into the red but when you're in debt, you won't be able to build new sets or add certain facilities and lot ornamentation." The passage sits between the qxp slugs `Page 6` (line 105) and `Page 8` (line 152); `pdftotext -f 4 -l 4` of `movies manual_english.pdf` shows the same text on PDF page 4, slug "Page 6" (each PDF page is a two-page spread). "Printed p. 6–7 spread" is correct. Tier RETAIL SHIPPED MECHANIC is correct.

### C3. Prima "Building in Debt" exception list, "printed p. 13" — **SUBSTANCE CONFIRMED, PAGE NUMBER WRONG**

`original-text/prima.txt:769-777` reproduces the heading and the seven-item list exactly as the report gives it. However, the page footers in the extraction are `12` at line 634 and `14` at line 789 (odd-page footers are not extracted), so lines 769–777 fall on **printed page 14**, not 13. Confirmed visually: `The_Movies_Prima_Official_eGuide.pdf` **PDF page 15** renders "BUILDINGS AND ORNAMENTS … Building in Debt … Casting Office / Crew Facility / Production Office / Basic Script Office / Stage School / Stage Set / Star & Script Selling Facility" with the footer "14 PRIMAGAMES.COM". `pdftotext -f 14 -l 14` (printed 13) does not contain "Building in Debt".

**Correction:** "Prima eGuide printed p. 14 (PDF p. 15)". The GameFAQs Maxx corroboration at `gamefaqs-maxx.txt:659-661` is exact ("Most sets and buildings cannot be built once you are in debt, but there are a few important facilities that can. They are the Basic Script Office, Casting Office, Crew Facility, Production Office, Stage School, Stage Set, and the Star and Script Selling Facility"). Tier PRIMA/MANUAL EVIDENCE is correct.

### C4. "No inspected retail source mentions loan/interest/bankruptcy/game over" — **CONFIRMED (HIGH)**

`grep -niE "\bloans?\b|bankrupt|interest rate|game over|game-over|\bdebt\b|in the red"` across `manual.txt`, `prima.txt`, `gamefaqs-maxx.txt`, `gamefaqs-mark.txt`, `gamepressure-improving.txt`: the only hits are the manual note (line 129), Prima's "Building in Debt" heading plus per-building "Build in Debt: Yes/No" attribute rows, and the two Maxx lines. No loan, interest, bankruptcy or game-over hit anywhere. The report's phrasing ("absence of evidence, not proof of absence") is the correct epistemic framing. The compiled bible (lines 2088, 2782, 2866) says the same and cites the same underlying sources, so the report did not lean on the bible.

### C5. Hollywood Animal Hotfix 0.8.12EA (2025-04-17): "100 days instead of 50"; "first credit … $1m" — **CONFIRMED VERBATIM (HIGH)**

Steam news API (`ISteamNews/GetNewsForApp appid=2680550`) item "Hotfix 0.8.12EA", date 2025-04-17, contains both lines exactly: "The first credit available to you is now $1m, also it takes less time to unlock." and "When your bank account balance goes negative, you now have 100 days to recover instead of 50." The store-view gid `543355041065468187` resolves to `<title>Hollywood Animal - Hotfix 0.8.12EA - Steam News</title>`. Tier OFFICIAL DEV STATEMENT is correct.

### C6. Hollywood Animal Update 0.8.51EA (2025-09-30): Marginese "come borrow your money … going bankrupt" — **CONFIRMED VERBATIM (HIGH)**

API item "Update 0.8.51EA", 2025-09-30: "The head of Marginese Pictures used to be too shy to come borrow your money. When his studio was going bankrupt, he kept his distance. But now he has no other choice." gid `534362428708750439` resolves to the 0.8.51EA title. Also reproduced: 0.8.67EA (2026-01-27) "Competitors now buy cinemas more aggressively and go after your employees more frequently."; 0.8.71EA (2026-05-07) "Fixed the calculation of the amount you must repay after taking out a loan."; Q&A (2024-11-11) "You can hurt other studios significantly in Act 1, but … things are going to get more brutal in Act 2." All four remaining gids (`529869613052202357`, `675120209794695998`, `688638619235125212`, `4487367832217059830`) resolve to the named posts. The report's "no inspected source establishes rival closure/removal" is consistent with what the posts say (the 0.8.51 line is a borrowing event only). Tier correct; LOW for closure is correct.

### C7. Hollywood Animal community claims: 12 % rate, 365-day cooldown, 4-week payout, −100 reputation — **CONFIRMED, tier correct (COMMUNITY/MEDIUM)**

Fetched with the mature-content cookie (the pages are age-gated; a plain fetch returns only the Steam shell):
- Thread `595162055800082153` ("game sucks NOW!!", OP Ozone 5 Oct 2025): **Das_Daw, 14 Oct 2025**: "You should not take the one million dollar loan, because the 12% interest rate is crazy." Also the "you problem" reply is by **9163891** (14 Oct 2025), as the report says.
- Thread `594033220191056039` (**the_humourist, 6 Sep 2025**, "Finances & Negative Balance somewhat unbalanced"): "You only have 100 days…", "You get a 100 point penalty in you reputation almost immediately…", "Income comes in at the end of the 4 week screening period meaning you can go bankrupt even if you have a couple of million coming in…", "You cant take a loan for 365 days after repaying the last one…", "inescapable trap especially in early game". Every quoted fragment reproduces.
- Thread `594033220190870507` (**Doomeetrue, 4 Sep 2025**): "Then next week ticks and I get in the negative again, and I lose 100 rep points again. So during the same month I got hit with the same penalty 4 or 5 times." Supports "re-fires each week".
- Guide `3464161838` (Traveler's): "Financial Department : $1,000,000 loan -> $500 cash per month -> $1000 cash per month -> Early repayment -> $2,000,000 loan -> $6,000,000 loan then whatevers left". **Nuance:** this is the guide author's *recommended research order*, not a documented unlock dependency; the report's word "chain" slightly over-reads it. MEDIUM is still right.

### C8. OpenTTD `96651d3` `economy.cpp:547-627` staged bankruptcy; `606-611` "no THE-END"; `801-829` interest on negative cash — **CONFIRMED (HIGH)**

Fetched `raw.githubusercontent.com/OpenTTD/OpenTTD/96651d3/src/economy.cpp`. `CompanyCheckBankrupt` begins line 547; line 553: `if (c->money - c->current_loan >= -c->GetMaxLoan())` resets `months_of_bankruptcy` — so the counter only advances when `money − loan < −maxLoan`, exactly as stated. `case 4` "Warn about bankruptcy after 3 months" (STR_NEWS_COMPANY_IN_TROUBLE_*, ScriptEventCompanyInTrouble); `case 7` "Offer company for sale after 6 months", `CalculateCompanyValue(c, false)`; `case 10/default` with the comment (lines ~605–609) "If we are in singleplayer mode, leave the company playing. Eg. there is no THE-END" and `Command<Commands::CompanyControl>::Post(CompanyCtrlAction::Delete, …, CompanyRemoveReason::Bankrupt …)` for everyone else. Infinite-money early return at line 550.
`CompaniesPayInterest` lines 801–829: comment "In order to prevent cheating or abuse (just not paying interest by not taking a loan) we make companies pay interest on negative cash as well, except if infinite money is enabled." and `if (available_money < 0) yearly_fee += -available_money * _economy.interest_rate / 100;`. `economy_type.h:207 LOAN_INTERVAL = 10000`; `difficulty_settings.ini` `max_loan def=300000`, `initial_interest def=2 min=2 max=4`, NewgameOnly; `economy.cpp:899 _economy.interest_rate = _settings_game.difficulty.initial_interest`; `economy.cpp:737` inflation-scaled max loan. All exact.
**Minor:** the report's "(or 7 if worthless)" describes only a stale code comment; at this commit `case 7` asserts `bankrupt_value > 0`, so there is no worthless-at-7 branch. Not consequential. Tier SHIPPED CODE is correct.

### C9. GearCity: Eric.B "negative for 6 months … 1.23 SP4 counter does not reset … changes for 1.24"; wiki "Bankrupt Warning!" memo 1001 with Cut Funding / Cut Production — **CONFIRMED (HIGH)**, with two wording issues in the same dossier

- Steam thread `1694922980033868934` page 2 (app 285110): embedded comment JSON post `1694922980038090730`, `"author":"Eric.B"`: "If your cash on hand is negative for 6 months in the game you will bankrupt. In v1.23 SP4 this counter does not reset. If you had 5 months of negative cash on hand, got a loan or a bond, and then had to pay it off and you went negative for that 6th month. You will bankrupt. There has been changes to this for v1.24". Exact; author confirmed structurally, not by adjacency.
- Wiki raw export `gamemanual:references_actionmemos`: row "**Bankrupt Warning!** //1001//" — "…they believe they can shift money around and buy us {NUMBER OF} months until we default on our payments…" with choices **Thanks** //1009//, **Cut Funding** //1011//, **Cut Production/Funds** //1012//. Exact. (The report cites the page without its `gamemanual:` namespace; the bare id `references_actionmemos` returns "This topic does not exist yet" — a citation-path nit.)
- `howto_financing` and `gui_financials` exports confirm: line of credit revolving, "You may only have one line of credit at a time", "banks will not be willing to give you a line of credit, nor will they raise your maximums"; loans "the more money or time you ask for, the higher interest rates go", unlimited count, "Payback" early; bonds interest-only, "must wait 3 games years", "take out an additional bond to cover the principal". `new_game_settings`: "Start with a bank loan" (loan = company value, random term/rate, "locks the player out of the financing systems"); "Can be fired (Game Over)" >50 % shareholders. `references_achievements`: "Too Big To Fail … Have company bailed out from going bankrupt … Go bankrupt after 1960"; "Rags To Riches … After having negative cash funds, have the most cash funds of all active companies". Exact.

**Issue 9a — formula overstated.** Report: "rate = global interest rate × credit rating". Wiki (three places): "On the top-right of the panel are the global interest rate and your credit rating. These two variables **factor into** your loan offers and interest rates." No multiplication is stated. Should read "rate depends on the global interest rate and the company's credit rating (wiki: 'factor into'; exact formula not disclosed)".

**Issue 9b — misquotation.** Report: `refinanced survival "under new ownership"`. ventdev pid 7643 (Eric.B, 24 May 2016, post #4): "Second path is coming out of bankruptcy through financing, such as a bank or investment firm buying them. **In this path the company still owns the company.**" The quoted phrase "under new ownership" does not appear and contradicts the source's own gloss. The other quotes reproduce exactly: "Debts don't magically disappear you know." (post #2, 22 May 2016), "First path is complete liquidation, the company disappears.", "The player gets first pick, if he declines, the AI companies are then checked… if none are found the assets are liquidated." Tier OFFICIAL DEV (forum admin Eric.B) is correct.

### C10. Mad Games Tycoon 2: Eggcode 2021-08-10 statements; "conjure … out of red digits"; −$114 billion — **CONFIRMED (HIGH for dev statements)**

Thread `3052863612120877620` (app 1342330): **Eggcode Games [developer], 10 Aug 2021 @ 12:29am**: "@1. … I will make the suggestion like this. Link the maximum credit limit to the difficulty level."; **10 Aug 2021 @ 1:54am**: "I also linked the interest to the difficulty level. … Currently you do not pay overdraft interest. This could be added so that the players do not excessively bring the account into the red." Exact. GrandeLS (quoted as "Red Valour"): "The secret is that you don't have to 'earn' them, but 'conjure' them out of red diigits". Kyouko Tsukino: the "get in the reds for X months, get out of the reds, get into the reds again" workaround and the "must stay out of the reds for N months" proposal. Exact.
Thread `3113656428083196969` (Foxtrot Six, 1–2 Jun 2021; Eggcode replied): "I made it all the way to -$114 billion before the game finally declared my company insolvent." Exact.
Thread `5691968038980072138` (Jun 2021): Kyouko "I just spent three years in the reds, using fast speed, nothing happened."; another player: "I got a message warning of bankruptcy after 6 months." Thread `3552805589771323868` (Ocean15, 17 Nov 2022): "get green again or die". So the "~6-month warning" has a dated community datum; **caveat:** the Aug-2021 thread also references "the full 18 month" red allowance (yutterh), implying the *warning* at ~6 months and the *total* allowance may differ. MEDIUM for timing is defensible; the report's Open Uncertainty #2 already flags it.

### C11. Prison Architect Paradox wiki two-condition trigger, 24 h, once-per-game bailout — **CONFIRMED VERBATIM (HIGH)**

`prisonarchitect.paradoxwikis.com/Winning_and_Failure_Conditions`: "If you have a negative bank balance and a negative cash-flow, you are bankrupt." "You will have 24 hours to put in place a financial rescue package before being sacked." "Once per game, the Government Bailout grant may help you out." Tier OFFICIAL WIKI correct; the report correctly marks loan details (fandom) MEDIUM.

### C12. Capitalism Lab official "Declare Bankruptcy" / liquidation / "Continue After Bankruptcy" — **CONFIRMED (HIGH)**

`capitalismlab.com/playing-without-company/`: "whether you choose Declare Bankruptcy in the out-of-cash screen or the company is forced under"; "The company is still liquidated to pay off its debts (there's no avoiding that)."; "Continue After Bankruptcy — Yes — Going bankrupt no longer ends the game (your company is still liquidated)."; "With this setting off (the classic rule), that's game over." Exact. The report correctly keeps the bond-maturity trigger at COMMUNITY/LOW.

### C13. OpenRCT2 `9279d06`: raise loan while cash negative; interest formula; defaults — **CONFIRMED (HIGH)**

`ParkSetLoanAction.cpp` `Query` at line 40; lines 51–52: "// The "isPayingBack" check is needed to allow increasing the loan when the player is in debt." / `const auto isPayingBack = park.bankLoan > _value;`; `STR_BANK_REFUSES_TO_INCREASE_LOAN` at line 44; repayment gated by `amountToPayBack > park.cash`. `Finance.cpp:144-161` `FinancePayInterest`: `rct1Interest ? (current_loan / 2400) : (current_loan * 5 * current_interest_rate) >> 14`; lines 240–243: `bankLoan = 10000`, `maxBankLoan = 20000`, `bankLoanInterestRate = 10`. Exact.

### C14. Cities: Skylines 1, Two Point Hospital, Software Inc., Game Dev Tycoon, Planet Zoo, Football Manager — **CONFIRMED, tiers correct**

- CS1 (`skylines.paradoxwikis.com/Economy`, OFFICIAL): Silver Sunset ₡20,000/52 wk/5 %/₡21,000; Global Credit ₡60,000/260/10 %/₡66,000; Pyramid Capital ₡200,000/520/15 %/₡230,000; "bailout offer … anytime the money indicator falls below -₡10,000"; "Once the bailout offer is accepted, however, the savegame is disqualified from having any achievements." Exact.
- TPH (fandom API, COMMUNITY): Money page "You receive a warning at -$150,000 and then are officially bankrupt at -$300,000"; Loans page tiers 5 %/24 mo, 10 %/24 mo, Smell My Cash $150,000–250,000 at 15 %/36 mo. Exact; MEDIUM correct.
- Software Inc. (fandom API, COMMUNITY): "Bankruptcy is an event in game that occurs when your money drops below $0"; "In Alpha 11 … the game will warp until 20:00 (4 hours before you go bankrupt)"; quick loans "$6,000 - $600,000 … 4 months to 5 years", "$6,000 loan over 4 months … will cost $7,815", "Over 2 years that same loan costs $8,649", bank loans "$600,000 - $6,000,000 over … 4 months to 20 years", "up to just under 2x", accountants "star level 2 or greater", "$600,000 or greater you are no longer eligible for Quick loans". Exact; MEDIUM correct.
- GDT (fandom API, COMMUNITY): "Bankruptcy occurs when a company is too far in debt and have recently been bailed out by the bank. This typically represents a game over … The game classifies debt as more than 200K. (-$200K+)"; "purchased the remains of the company". Steam thread `648814841450359975` (Panda, 18 Dec 2013): "the bank gave me 80k because i was bankrupt so now i have the 150k nescesary to pay them"; contrabored: "After a year, they will remove the 150k". Exact; MEDIUM correct.
- Planet Zoo (`one.planetzoogame.com/...managing-your-zoo`, OFFICIAL; WebFetch 403, curl with a browser UA succeeds): "The number and type of loans available are set per scenario." "Each year, the outstanding amount on the loan increases by a fixed percentage as the interest on the debt builds." "The loan can be paid off yearly with a set amount, or as a total sum at any given point without penalty." Exact; no bankruptcy sentence on the page, matching the report.
- Football Manager (`fm-base.co.uk/threads/77613/`, "What happens if a club goes bankrupt?", Aug 2011, FM11 era): "Administrators come in and take over financial control and the team is deducted 9 points, transfer embargo is placed and players are up for cheap…"; "-9 points every time they come in."; "…got a total of 36 points deducted…"; Portsmouth and Liverpool examples present. Exact. **Caveat:** the thread is 2011/FM11; the report should date it so readers do not take it as current-FM law. COMMUNITY/MEDIUM is correct.
- P15 authority quotes: `P15-PACKAGE.md:619` "Loans, bailouts, investors, forced sales, or acquisition are not implied." (exact); `:295` "| original hard bankruptcy | pre-release wording conflicts with retail-source silence |" (exact); `:309` Football Manager row cites the "smarter-transfers-squad-building-and-finance" feature page (so the report's characterisation "transfer/finance context only" is fair); `:467` "A single negative-cash week cannot skip…"; `P13-P15-LONG-RANGE-ROADMAP.md:165` "Known obligations remain beside Cash, not secretly subtracted. Negative cash is currently recoverable and does not mean bankruptcy."; `:702` "debt/investor/equity integration if separately approved". All exact.

---

## Findings summary

| # | Claim | Result | Action |
|---|---|---|---|
| C3 | Prima "Building in Debt" at printed p. 13 | **Page wrong** — printed p. 14 / PDF p. 15 | Fix in §0 table, §5 and §7 |
| C9a | GearCity "rate = global interest rate × credit rating" | **Overstated** — wiki says the two "factor into" rates; no formula | Reword |
| C9b | GearCity refinanced path "under new ownership" | **Misquote** — source: "the company still owns the company" | Reword; drop the quotation marks |
| C7 | HA "research chain $1M→…→$6M" | Slight over-read: guide gives a recommended research *order* | Reword to "recommended research order" |
| C8 | OpenTTD "(or 7 if worthless)" | Stale comment only; `case 7` asserts value > 0 at this commit | Optional nit |
| C9 | `references_actionmemos` cited without `gamemanual:` namespace | Bare id returns "topic does not exist" | Add namespace |
| C14 | fm-base thread undated | 2011 / FM11-era | Add date/version |
| C10 | MGT2 "~6 months" | Community datum exists (Jun 2021); Aug 2021 thread implies a longer total allowance | Keep MEDIUM; note the 18-month reference |
| C1, C2, C4, C5, C6, C7, C8, C9, C10, C11, C12, C13, C14 | all other quotes, line numbers, gids, URLs, dates, authors, tiers | **Reproduced exactly** | — |

**Tier discipline:** every official/dev/shipped-code claim I checked is genuinely official, dev-authored, or shipped source; every player claim is labeled COMMUNITY. No pre-release promise was promoted to retail parity anywhere in the report. The only retail-parity claims (manual/Prima soft-debt state) are correctly tiered and, apart from the Prima page number, correctly cited.

**Verdict: VERIFIED WITH CAVEATS** — the report's findings stand; apply the three wording/page corrections (C3, C9a, C9b) and the four nits before it is used as an authority input.
