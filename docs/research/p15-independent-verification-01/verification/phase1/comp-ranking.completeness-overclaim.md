# Verification memo — `comp-ranking.md` (lens: COMPLETENESS & OVERCLAIM)

**Verifier:** adversarial reader (read-only)  
**Date:** 2026-09-11  
**Target:** `scratchpad/out/phase1/comp-ranking.md` (Comparators: rankings, power vs value, consolidation, events)  
**Method:** re-read the topic prompt; re-checked 14 claims against the underlying sources (saved OpenTTD/Simutrans source, freshly fetched OpenTTD `company_cmd.cpp`/`object_cmd.cpp`/`script_event_types.cpp`, GearCity wiki cache, Capitalism Lab official pages, Steam thread bodies fetched directly, Prima/manual plain-text extractions, the accepted `592e926` snapshot, the authority docs, and the author's own `webcache/` which contains material the report did not use). Nothing under any repository was modified; no player data touched. WebSearch budget was exhausted before this pass, so all web checks are direct fetches of the report's cited URLs or of official pages.

**Verdict: REFUTED IN PART.** The load-bearing findings (OpenTTD nine-component formula, three valuations, refill timer, "no THE-END", staged headline chain; Simutrans single-criterion lanes; GearCity Evaluation/share-price/acquisition formulas; Prima 24/24/24/14/14 weights and Capital scale; current-code Studio Charts facts; authority citations) all check out against primary sources. But several *specific* claims are wrong or mislabelled as stated, one comparator (Hollywood Animal) is materially under-researched relative to official material already sitting in the author's cache, and four items the prompt asked for were not answered.

---

## 1. Spot-checks (14 claims)

| # | Report claim | Source checked | Result |
|---|---|---|---|
| 1 | Nine `_score_info` components with the listed points/thresholds; Total is a sum row; company value stored separately (economy.cpp 92–103, 203–318) | `web/openttd_economy.cpp` lines 92–103, 203–318 | **CONFIRMED.** Exact values match; `old_economy[0].company_value` stored separately at line ~311. |
| 2 | Company Value = assets − loan + money, floor 1; bankruptcy value excludes loan; hostile takeover = assets + loan + max(0,−money) + 2×Σ4q positive profit | economy.cpp 116–199; `CmdBuyCompany` 2025–2060 | **CONFIRMED.** Also confirmed: merger headline embeds `bankrupt_value` (price disclosed); hostile string is "undisclosed amount". |
| 3 | AI refill toward `max_no_competitors` on `competitors_interval` minutes, ±12.5% jitter, interval 0 → ~10 min recheck; default 0 | fetched `company_cmd.cpp` 686–705, 808–830; `webcache/openttd-difficulty.ini` 58–75 | **CONFIRMED** with a nuance: the timer is in *game ticks* (`interval × 60 × TICKS_PER_SECOND`), i.e. wall-clock only at 1× speed; it pauses with the game and compresses under fast-forward. "Wall-clock" is an approximation, not the mechanism. |
| 4 | Singleplayer human company never deleted ("no THE-END"); AI removed at month 10 | economy.cpp 604–635; `CmdBuyCompany` ("Disable taking over the local company in singleplayer mode") | **CONFIRMED**, and stronger than stated: an AI script can `AcceptMerger()` on any bankrupt company (`script_event_types.cpp` 113–117), but `CmdBuyCompany` refuses the local singleplayer company, so the human can be neither closed nor bought. |
| 5 | Staged headline chain months 4/7/10; Off/Summary/Full per category; "Company information" covers new company / risking bankruptcy | economy.cpp 560–612; `web/openttd_english.txt` 892–900, 1945–1946, 1981–1983 | **CONFIRMED.** |
| 6 | Simutrans: nine single criteria, "prior-year tie-break, then player number" | `web/simutrans_ranking.cc` 20–35, 83–100, 115–121, 227–231 | **PARTLY WRONG.** Tie-break uses `years_back − 1`, i.e. the *more recent* year: when viewing "Last Year" the tie breaks on "This Year"; when viewing "This Year" (`years_back = 0`) there is no year tie-break at all, only player number. |
| 7 | GearCity Evaluation formula incl. design costs ÷10; share-price floor 0.7×Evaluation/shares; acquisition premium "(positive EPS)" | `webcache/gearcity-gamemanual_gm_stocks.txt` 14–24, 32–36, 142–145, 200–216 | **CONFIRMED** on formulas (the ÷10 is in the variable table). Two caveats the report dropped: (a) the wiki page opens with "pseudo-code and may not be 100% the same as the code in the game" — a HIGH label without that disclaimer overstates; (b) the premium branch is `EPS_Year ≥ −0.5`, not "positive EPS". |
| 8 | GearCity dev statements ("bought out or went bankrupt", "Demand doesn't change", "Wait button") | Steam threads 522729358625167142, 1694922526917807909, 1470841715950097838 (fetched) | **CONFIRMED** as `[developer]`-badged posts. Dates the report omits: 6 Jun **2014** (pre-alpha; the dev says "the horrible balancing 1980 has right now"), 29 May 2018, 7–19 Sep 2017. The "Wait button" was *added* in Sep 2017 (v1.22.2/1.23), not merely "planned"/"announced" as §4.3/§4.5 say. |
| 9 | Capitalism Lab: bankrupt AI firm triggers a modal offer that pauses on accept | `phase1-verify/_caplab_bankrupt.html` (official page) | **CONFIRMED but under-qualified.** The page says this is a **new-game setting** ("Acquire Companies Facing Bankruptcy") inside the **Banking and Finance DLC**. The report's §4.2/§4.5 present it as baseline behaviour. The script-competitors page (fetched) has no new-entrant setting; "Venture Capitalists" (fetched) invest pre-IPO and do not found companies — so open uncertainty #2 could have been narrowed. |
| 10 | Transport Fever 2: "DEVELOPER/COMMUNITY-MANAGER STATEMENT ... Confidence HIGH"; players call it "boring" | Steam thread 2277079183727043477 fetched raw | **REFUTED as to source class.** "Sima \| Marco" carries no CM/developer badge; the post is a regular user relaying hearsay ("Community Manager said there will be no competitors AI"). The report's own sources list even says "via search summary". No post in that thread contains "boring" or "work against the player"; the quote is unsourced. The design fact (no AI competitors) is likely true but is established here only by COMMUNITY INFERENCE. |
| 11 | MGT2: players call market share "a fancy number that doesn't really matter"; AI has "static, only-ever-slightly-random growth rate" | Steam thread 3201491841995796729 fetched raw (16 Nov 2021) | **MIS-SCOPED.** Both quotes are about **console** market share (player-made consoles' user growth vs AI consoles), not company/studio ranking. Using them as evidence that "a comparative number without consequence is dismissed" generalises one post about a different metric. The developer studio-rating quote (27 Mar 2021) is correctly attributed but the report never gives its date; the game has had five years of updates since. |
| 12 | Hollywood Animal: Steam thread "GB CINEMA buy out" is "age-gated; body not readable" → "COMMUNITY INFERENCE, unverified that a rival buyout mechanic exists" | `webcache/ha-gbcinema.html` (author's own cache, readable) | **REFUTED.** The body is present (OP 27 Aug 2025). It is about a *rival buying up cinemas* and the Act-1-ending court ruling ("the game in its current state ends when the courts rule on GB's buyout of cinemas") — a scripted story event, not a studio-buyout mechanic. The inference drawn is wrong and the "unreadable" claim is false. |
| 13 | Prima 24/24/24/14/14; Capital $50k–$1.6M, midpoint ≈ $300k; Movies decay; Awards = latest ceremony ≥6; Highest Climbing Studio; photographers/queues/rival Stars "proportional to Studio rating"; rival entry windows to 1967–1971 | `original-text/prima.txt` 2777–2781, 2796–2801, 2816–2889, 3180–3190, 3195–3208 | **CONFIRMED.** Two precision notes: (a) the consequences attach to the absolute Studio *rating* (and star-rating thresholds), not to comparative *rank* position — only Highest Charting/Climbing awards attach to rank; (b) "corroborated by GameFAQs Maxx FAQ" is not independent corroboration — the FAQ paraphrases Prima's numbers and scale verbatim. |
| 14 | Manual: "charts show standing in relation to the competition and right-click reveals a breakdown" | `original-text/manual.txt` 509–531, 106–128 | **MISATTRIBUTED.** The right-click breakdown in that passage is for a *Star's* entry ("Right-click on their entry to view a breakdown of what determines their ranking"). The studio breakdown is established by Prima p. 46, not the manual. The manual does, however, independently establish that "Your Cash Balance contributes toward your ranking in the Charts" (p. 9) — a stronger, unused citation for the report's central "original blended wealth" point. |
| 15 | Current code: 13-week snapshot, competition ranking, cohort-gated movement, "Studio Charts" title, activity grammar, `enterRival` with `eligibleWeek`, no floor/valuation | `accepted-592e926/bridge/industry.ts` 19–24, 66–95, 129; `src/core/hollywoodTick.ts` 306–313; `hollywoodValidation.ts` 412–416; `hollywood.ts` 139–194; `hollywoodTypes.ts` 96–105; greps | **CONFIRMED.** One omission: the shipped base notice reads "Public facts only. Standing channels and film measures have separate meanings; **there is no combined Power score**" (`bridge/industry.ts` 110). That sentence is a design statement P15A.2 must reconcile and belongs in §5. |
| 16 | Authority: P15 candidate uses dense ties; P12 minimum three active AI rivals; valuation parked P16+; P15 §8 uses OpenTTD only as data-model reference | `P15-PACKAGE.md` 455, 800, 803, 329; `P13-P15-OWNER-RULINGS.md` 151 | **CONFIRMED.** |

---

## 2. What the prompt asked that the report did not answer (or answered vaguely)

| Prompt item | Report coverage | Gap |
|---|---|---|
| NBA 2K **team rating** | Only MyNBA expansion/contraction (verified: "add or remove up to 6 teams ... each and every offseason") | Team rating (a transparent roster-derived number) not examined at all. |
| Software Inc. **company value vs market share vs reputation** | Company value only (stock-implied, one Steam thread) | Market share and reputation not addressed; no official wiki page other than the WIP Stocks page inspected. |
| Game Dev Tycoon **fans, market share, top charts** | One line: "not transferable" | The prompt asked how fans/market share/charts are presented; the fans number (a persistent, transparent reputation stock) is the closest GDT analogue to P08 Standing and was not examined. |
| Football Manager **league position** vs reputation vs finances | Reputation and finances | League position → reputation feedback not discussed. |
| **Player criticism** per game (item 1) | Given for OpenTTD (LOW), MGT2, TF2, Software Inc. | None for Simutrans, Capitalism Lab, GearCity, FM; the 1.11 table has no criticism column. |
| **Transport Fever** (prompt names the series) | TF2 only | TF1 not mentioned (also shipped without AI competitors; one line would close it). |
| Hollywood Animal **"verify exactly"** how studios are ranked; **newspaper/events**; **fixed rival set?** | LOW/"unverified" throughout; Fandom/TV Tropes 402/403 cited as the blocker | See §3 — the author's own cache (`webcache/ha-news.json`, 100 official Steam announcements) contains relevant official text that was never mined. |
| **GearCity late-game feel** | "complaints not found" | The author's cached `gearcity-new_game_settings.txt` documents two official mechanisms bearing directly on a thinning field (see §3) that the report skipped. |
| Synthesis **tables** for (a)–(d) | (a) is a table; (b)–(d) are bullets | Minor format shortfall. |

---

## 3. Skipped counter-evidence / alternative sources (all already in the author's cache or one fetch away)

1. **Hollywood Animal official Steam announcements (`webcache/ha-news.json`)** — never cited. They establish, as OFFICIAL EA patch notes (dated):
   - 0.8.51EA (2025-09-30): "The head of Marginese Pictures ... When his studio was going bankrupt, he kept his distance. But now he has no other choice" [comes to borrow the player's money] → a **rival-distress event with player-as-lender interaction exists** in EA. Directly relevant to §3.4 and §4.4, which say nothing is established.
   - 0.8.67EA (2026-01-27): "Competitors now protect their characters based on how successfully they are doing business" (Marginese easy, Gerstein Brothers hard); "Competitors now buy cinemas more aggressively" → an **internal rival-success measure and authored rival tiering** exist; no public league table is described.
   - 0.8.50 beta (2025-08-19): departments can "generate Influence Points/Reputation instead of researching" → confirms Reputation and Influence as separate generatable resources (upgrades the report's MEDIUM to OFFICIAL).
   - "Act 2" post (2026-04-30): "Act 1 ended with you and your competitors losing your theaters ... a new force has entered the game: distributors" → industry-wide structural change is **authored per act**, not emergent consolidation.
   - Q&A (2024-11-11, **pre-EA**): "Can we drive enemy studios into bankruptcy...?" → "You can hurt other studios significantly in Act 1 ... more brutal in Act 2" — a PRE-RELEASE/developer statement; does not establish closure.
   - Beta 0.8.50.3: "The popup notifying you of an attack on your staff now shows who ordered it" → an example of **typed-cause disclosure** in HA's event popups, relevant to §4/(d).
   All HA facts remain **Early Access state**, which the report should say explicitly (it never labels HA as EA-only).
2. **GearCity official settings page (`webcache/gearcity-new_game_settings.txt` 185–205)** — "Monopoly Lawsuits": >75% global market share can trigger a lawsuit that "can break apart the company or heavily fine them" (0.3%/turn check). That is GearCity's shipped answer to a dwindling field — an **anti-dominance ceiling rather than an entrant floor** — and belongs in §3.2/§6(c). Same page: "AI Starting Funds ... The more money an AI company has, the longer it'll remain in business" — an official statement that attrition rate is a tunable, stronger than the 2014 pre-alpha forum post the report relies on.
3. **OpenTTD consequences of the rating** — the report's table says "Titles only; AI events". Source shows three more: `UpdateCompanyHQ(score)` grows the company HQ at 170/350/520/720 (`object_cmd.cpp` 166–179, called from `UpdateCompanyRatingAndValue`); `HandleBankruptcyTakeover` offers a bankrupt company **first to the rival with the highest performance history** (`company_cmd.cpp` 770–780); the yearly good/bad-year sound compares `performance_history[0]` vs `[4]` (`company_cmd.cpp` 853). These *strengthen* lesson (a) ("a rank needs a visible consequence") and should replace "Titles only".
4. **Manual p. 9** ("Your Cash Balance contributes toward your ranking in the Charts") — the cleanest retail citation for the report's central point about blended wealth; unused. Also unused: the manual's **Movie Mogul Ranks** (nine official owner ranks with published requirements, p. 22) — the original's own band ladder, the direct analogue of OpenTTD's Engineer…Tycoon titles.
5. **Capitalism Lab DLC/setting gating** (§1 row 9) — the modal-offer behaviour is opt-in DLC, not the base game's event presentation.

---

## 4. Overclaims and label problems (ranked)

1. **TF2 "DEVELOPER/COMMUNITY-MANAGER STATEMENT ... HIGH"** — actually an unbadged user's hearsay; "boring" quote not in the cited thread. Should be COMMUNITY INFERENCE / LOW, with the design fact sourced elsewhere (e.g., publisher FAQ or store page).
2. **HA "GB CINEMA buy out" inference** — cached body was readable and contradicts the inference (cinema buyout, scripted Act-1 end). Remove.
3. **MGT2 market-share quotes** — about console market share; cannot support "a comparative company number without consequence is dismissed". Keep only the developer studio-rating quote, dated 2021-03-27, with an explicit "may have changed" caveat in the summary bullet.
4. **Capitalism Lab modal offer** — DLC + new-game setting, not baseline.
5. **GearCity formulas HIGH** — drop to MEDIUM-HIGH with the wiki's own pseudo-code disclaimer; "(positive EPS)" → "EPS_Year ≥ −0.5"; "planned Wait button" → added Sep 2017; 2014 statement is pre-alpha.
6. **Simutrans tie-break** — direction inverted (adjacent more-recent year, none for "This Year").
7. **Prima "RETAIL SHIPPED MECHANIC (developer-reviewed guide)"** — "developer-reviewed" is asserted, not evidenced; the rubric already admits Prima as retail-tier, so drop the parenthetical. "Corroborated by GameFAQs" is not independent.
8. **Manual right-click breakdown** — Star entries, not studio; cite Prima p. 46 for the studio breakdown.
9. **"Wall-clock minutes"** for OpenTTD refill — game ticks; reads as wall-clock only at 1× speed.
10. **The Movies "consequence of rank"** — consequences attach to the absolute rating/star thresholds; only the Highest Charting/Climbing awards attach to rank. Matters because P15A.2 is a *rank*.
11. **Hollywood Animal never labelled Early Access** — every HA statement is EA-state (0.8.x), not shipped-retail parity.

---

## 5. What survives (strong claims re-confirmed)

- OpenTTD: nine published components (100/120, 100/80, 100/£10k, 50/£50k, 100/£100k, 400/40k, 50/8, 50/£10m, 50/£250k), linear clamp, 1000-point rescale, quarterly `CompaniesGenStatistics`, (value/needed) display strings, Company Value graph separate — SOURCE, HIGH.
- OpenTTD: three valuations (book, bankruptcy sale = assets+money, hostile = assets+loan+|neg cash|+2×4q positive profit) computed only at offer time; merger price disclosed, hostile "undisclosed" — SOURCE, HIGH.
- OpenTTD: refill to `max_no_competitors` (default 0) on `competitors_interval` (default 10) with ±12.5% jitter; singleplayer human company neither deleted nor purchasable; AI deleted at month 10 — SOURCE, HIGH.
- OpenTTD: staged month-4/7/10 chain, non-pausing newspaper, Off/Summary/Full per category — SOURCE, HIGH.
- Simutrans: nine single criteria, no composite, Cash/Net Wealth as lanes — SOURCE, HIGH.
- GearCity: Evaluation (book), share price with 0.7×Evaluation floor, separate acquisition premium, Company Directory vs Market Cap Table; Founding/Death Year semantics — OFFICIAL wiki (pseudo-code caveat), HIGH-MEDIUM.
- Capitalism Lab: 0–68 competitors setting; single-metric goal rankings; Billionaires list separate — OFFICIAL, HIGH.
- Original: 24/24/24/14/14 weights; Capital $50k–$1.6M non-linear with ≈$300k midpoint; Movies decay; Awards = last ceremony ≥6; Highest Climbing Studio; rating-proportional photographers/queues/rival Stars; authored rival entry windows 1898–1971; quinquennial awards — PRIMA + MANUAL, HIGH.
- Current code `592e926`: 13-week `HollywoodChartSnapshot`, four per-lane competition ranks, cohort-gated movement, "Studio Charts" title, activity headline grammar, `enterRival` with `eligibleWeek`, no closure receipt kinds, no floor or valuation logic — CURRENT CODE VERIFIED, HIGH.
- Authority: P15 candidate dense ties vs shipped competition ties; P12 minimum three active AI rivals is authority text; valuation parked P16+; P15 §8 treats OpenTTD as a data-model reference only — HIGH.

---

## 6. Net assessment

The report's architecture and its strongest evidence are sound; the lessons in §6 would not change materially after correction, except that (c) should add GearCity's anti-monopoly ceiling as a shipped alternative to an entrant floor, (a) should cite OpenTTD's HQ-growth/first-refusal consequences instead of "titles only", and the Hollywood Animal rows in every table should be rewritten from the official patch notes (rival distress + lender visit exists; Reputation/Influence are generatable resources; industry structure changes are authored per act; all EA-state). The mislabelled TF2 source, the wrong GB-Cinema inference, the console-scoped MGT2 quotes, the DLC-gated Capitalism Lab offer, and the inverted Simutrans tie-break are the items a hostile reviewer would lead with.
