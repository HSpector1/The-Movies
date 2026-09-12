# Dossier 07 — Tycoon/Strategy Comparators C: cross-genre M&A, bankruptcy-auction and anti-snowball design

Evidence agent: comparators-C. Date: 2026-09-11. READ-ONLY research; nothing in any repository or worktree was touched. Assignment sections served: §2.R (comparators), §2.S (anti-snowball), §2.J (rival M&A), §2.L (healthy-studio willingness/price), §2.M (distressed acquisition), §2.O (control premium / rejected bids / refusal / information).

Label key used below (as required by the assignment): **CURRENT/ACCEPTED CODE** (P12 tree 13370d42…), **APPROVED DOCUMENTATION** (P13-docs branch 4734e409), **OWNER-SELECTED NEW DIRECTION** (ASSIGNMENT.md §2), **FUTURE RECOMMENDATION** (my inference). Prior-prose status per finding: CONFIRMED / QUALIFIED / CORRECTED / SUPERSEDED BY OWNER DIRECTION / NEW / N/A. Confidence: HIGH (primary code or developer text fetched and quoted verbatim) / MEDIUM (official or well-sourced secondary, or primary partially fetched) / LOW (community-only or search-summary only) / UNVERIFIED.

---

## 1. Scope

What this dossier answers, for each comparator mechanic: the player decision it creates; what players like; what becomes tedious; how the AI uses it; snowball risk; and a **Project: Studio lesson** (always labelled as inference). Then: the 3–5 most legible "willingness to sell" presentation patterns, and the 3–5 most natural anti-snowball levers, each with evidence of how they felt to players.

Comparators covered: OpenTTD / Transport Tycoon (primary source code, release 15.3), Railway Empire 1/2, Transport Fever 2, Offworld Trading Company (designer notes), Football Manager (official FM24 feature page + community), Motorsport Manager (community only), Crusader Kings III (wiki + history-file format), Anno 1800 (community + guide), Big Ambitions (guide), Startup Company (community), Capitalism Lab (official DLC pages), Mad Games Tycoon 1/2 (community), Total Extreme Wrestling 2020 (developer journal mirror), real-world wrestling tape-library acquisitions (Wrestlenomics interview, used only as the "library value" analogue), and anti-snowball design writing (Sirlin; The Thoughtful Gamer; Oakleaf Games).

Not researched (time budget; stated so the report does not imply absence): Tropico, Two Point, Rise of Industry beyond one search (a 2019 Let's Play titled "Buying out the competition" exists; no official documentation found — UNVERIFIED), Game Dev Tycoon / Software Inc. / GearCity / Hollywood Animal (assigned to comparators dossier R/A). GMTK and GDC talks on catch-up mechanics: searched, no primary talk fetched; the three written sources in §8 stand in for that literature.

---

## 2. Method & sources consulted (with what failed)

Method: official/developer/primary sources first (source code, developer journals, official feature pages), then community threads for player-experience criticism, always labelled COMMUNITY. Every material claim below carries a locator and a short verbatim quote. Prior Project: Studio prose checked against: `p13-docs/docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md` (§8 additive roots, §9 immutable IDs, line 676 acquisition row), `CODEX-P13-P15-OWNER-RULINGS.md` (§2.4.1, §4.2, §5), `CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md` (§5.5, §7, §12.3, §17, §25), `CODEX-TALENT-MARKET-...-PACKAGE-14.md` and annex (FM/CK3 comparator rows; "Interest" disclosure row), `p12-accepted/docs/D-16-ECONOMY-RECOVERY-DECISION-LAB.md` and `D-17B-OWNER-EVIDENCE.md` (G11 snowball gate).

Fetched successfully (primary/official): OpenTTD `src/economy.cpp` and `src/company_cmd.cpp` at `master` (latest release tag 15.3, published 2026-04-04 per GitHub API), OpenTTD `changelog.md`, PR #10709, PR #10914, issue #9281; Soren Johnson "OTC Designer Notes #17: Stock Market" (designer-notes.com, 2016-05-01); Football Manager official feature page "Introducing Intermediaries and Offloading Players" (FM24, 2023-09-21) and "Smarter Transfers, Squad Building and Finance" (FM24, 2023-09-19); CK3 wiki "Titles" (verified for 1.19, last edited 2026-08-15), "Succession" (verified 1.10), "History modding"; Anno Union devblog "The Art of War II" (2017-11-23); Capitalism Lab official "Acquiring a Private Company" and "Subsidiary DLC Tips and FAQ"; TEW2020 Announcement & Developer's Journal mirror at bethebooker.net (pages 1–4, entries #16, #60, #67, #68, #71, #75); Wrestlenomics interview with John Carlan (2022-07-15); Sirlin "Slippery Slope and Perpetual Comeback" (2014-08-11); The Thoughtful Gamer "Catch-Up Mechanisms" (2017-03-28); Oakleaf Games "Runaway Leader, Rubber Banding, and Feedback" (2014-02-13); gamepressure Railway Empire guide "Research, bonds and acquiring competitors"; Big Ambitions independent wiki guide "Buying Out an Existing Business" (verified 2026-09-03 for v1.0).

Fetched (COMMUNITY): Steam threads — Railway Empire "Mergers/Liquidations" (Jan 2020), "A competitor bought all of my shares!" (May 2021), "Curiosity: Benefits of stock ownership" (Jan 2023); Transport Fever 2 "Will they ever add competitors" (CM statement 30 May 2020); OpenTTD "Hostile takeovers" (Aug 2025); FM24 "What determines transfer value?" (Jan–Feb 2025); Motorsport Manager "Buyout clause paid by drivers???" (Jun 2017); Anno 1800 "Share buying / island takeover and AI reaction" (Apr 2019); Startup Company "Does ownership matter?" (Aug 2018); Mad Games Tycoon (1) developer-buyout thread (Aug 2017); MGT2 "Buy Competitors" (Sep–Nov 2021); givemesport FM24 selling guide (2024-12-21).

**Failed / blocked (noted, alternate tried once where possible):** OpenTTD wiki "Company value" (404; used source code instead); OpenTTD wiki "Economy" fetched but describes the pre-14 share system only; magicgameworld RE2 page (403); SI community manual and forum pages (403 twice, incl. via curl with browser UA); all Fandom wikis (TEW2020 "Your Office", Anno "Island shares" incl. `?action=raw`, Startup Company "Investing", OTC "Stock") returned 402/403; Grey Dog Software forum (403 twice); Steam guide "A Little Guidance for your Big Ambitions" (429); MGT2 "Company Acquisitions!" Steam news body (page shell only; events API returned non-JSON); BGG geeklist "compendium of solutions to rich-gets-richer" (403); Medium "Catch Me If You Can" (403); fmscout FM24 offloading article (403); vintageisthenewold Anno page (403); tewdb "What's new in TEW IX" and gmgames TEW IX article contain no acquisition text. Where only a search-engine summary of a blocked page is available, the finding is marked LOW and the summary is identified as such.

---

## 3. Findings

### 3A. OpenTTD / Transport Tycoon Deluxe (HIGH — primary source code)

**F1. Share trading was removed in OpenTTD 14 because partial ownership was an exploit with no decision value.**
- Source: OpenTTD `changelog.md` (master), section `14.0-beta1 (2024-02-03)`: "Feature: Replace buying/selling company shares with hostile takeovers of AI companies (#10709, #10914)". PR #10709 "Remove: buying/selling/owning company shares" (merged 2023-04-29): "Mostly, you can generate infinite money with this"; "Now, what does it add to the player? ABSOLUTELY NOTHING"; "Codewise, it is just a constant stream of problems"; the feature "was disabled by default". Earlier fixes show the exploit history: changelog "Fix #9281: Money generating exploit when buying out a company (#9300)"; "Fix: Company values do not properly account for shares (#9770)". Issue #9281 (OpenTTD 1.10.1, 2021-05-19): "Company B:- (Balance - Loan amount) is added to company A finance. Company B:- Loan amount is added as is to company A finance despite above money recovery."
- Proves: a tradable partial-ownership instrument in a tycoon game becomes a money-printing loophole unless it is a real decision; cash/debt double-handling at transfer is the classic exploit surface (assignment §K "repeated flip exploits").
- Confidence: HIGH.
- Prior prose: P15 §8 lists OpenTTD only as a data-model/testing pattern and says "reject ... any takeover/acquisition translation into P15" — CONFIRMED (acquisition belongs to P16; and the comparator itself abandoned share trading).

**F2. OpenTTD's bankruptcy pipeline is a staged warning → offer-for-sale → deletion ladder with a fixed price and sequential first refusal to the best-performing company.**
- Source: `src/economy.cpp` `CompanyCheckBankrupt` (master): trigger `if (c->money - c->current_loan >= -c->GetMaxLoan()) { ... months_of_bankruptcy = 0 ...}`; `case 4:` "Warn about bankruptcy after 3 months" (`STR_NEWS_COMPANY_IN_TROUBLE_TITLE`, `ScriptEventCompanyInTrouble`); `case 7:` "Offer company for sale after 6 months" with `/* Don't consider the loan */ Money val = CalculateCompanyValue(c, false); c->bankrupt_value = val;`; `case 10:` "Bankrupt company after 6 months (if the company has no value) or latest after 9 months" → `CompanyCtrlAction::Delete ... CompanyRemoveReason::Bankrupt`. `src/company_cmd.cpp` `HandleBankruptcyTakeover`: "Companies going bankrupt will ask the other companies in order of their performance rating, so better performing companies get the 'do you want to merge with Y' question earlier"; per-company window `TAKE_OVER_TIMEOUT = 3 * 30 * Ticks::DAY_TICKS / (MAX_COMPANIES - 1)`; AI receives `ScriptEventCompanyAskMerger(c->index, c->bankrupt_value)`; interactive company gets `ShowBuyCompanyDialog`. `CmdBuyCompany`: "For bankruptcy this amount is calculated when the offer was made; for hostile takeover you pay the current price."
- Player decision: accept a take-it-or-leave-it price during a short window, or pass. What players like: legible ladder (news at month 4, offer at 7, deletion at 10). Tedium/criticism: none needed — but note the design gives the *leader* first refusal, which is structurally pro-snowball.
- AI use: AI scripts get the same event and may accept; AI companies themselves can be deleted at month 10 and replaced by a new competitor timer (`_new_competitor_timeout`).
- Snowball risk: HIGH by construction — "better performing companies get the question earlier".
- Proves: (a) a bankruptcy sale can be a fixed clearing price rather than an auction; (b) first-refusal ordering is a hidden anti-/pro-snowball lever; (c) the price is frozen at offer time (no re-pricing during the window).
- Confidence: HIGH.
- Prior prose: P15 §12.3 `active → warning → distress → recovery/dormant → closure-settlement → archived` — CONFIRMED as a comparator-proven shape; the comparator adds the "offered for sale" state between distress and closure, which P15 §12.3 does not have and §25 defers to P16+.

**F3. OpenTTD's hostile-takeover price is a transparent three-part formula; the target cannot refuse; it is AI-only and single-player-only; a capacity limit can block it.**
- Source: `src/economy.cpp` `CalculateHostileTakeoverValue`: comment "You have to pay for: - The value of all the assets in the company. - The loan the company has (the investors really want their money back). - The profit for the next two years (if positive) based on the last four quarters. And on top of that, they walk away with all the money they have in the bank."; code `value += c->current_loan; if (c->money < 0) value += -c->money; for (quarter 0..3) value += max(income + expenses, 0) * 2;`. `CmdBuyCompany`: "Only allow hostile takeover of AI companies and when in single player" (`if (hostile_takeover && !c->is_ai) return CMD_ERROR; if (hostile_takeover && _networking) return CMD_ERROR;`); `if (!CheckTakeoverVehicleLimit(...)) return CommandCost(STR_ERROR_TOO_MANY_VEHICLES_IN_GAME);`. PR #10914 (merged 2023-06-05) motivation: "With the removal of the share-system, you could no longer make an AI disappear in a single player game"; "No protection period" vs the old share system's minimum company age (changelog 1.10: "Feature: Configurable minimum age for companies before allowing share trading (#7780)"). Bug history: "Fix #12818: During Hostile Takeover, profit was calculated incorrectly (#12819)"; "Fix #12594: Give descriptive error when company takeover fails due to vehicle limit (#12676)". COMMUNITY (Steam, 2025-08-24): "will cost me 78 million, I have over 93 million" but "Can't buy company" — answer: the vehicle limit.
- Player decision: pay ~assets + debt + 2-year profit to erase a rival. Liked: simple, predictable. Criticism: opaque refusals when the capacity limit bites (fixed by a typed error in 14.x).
- AI use: none — AI cannot hostile-takeover anyone; asymmetric by design.
- Snowball risk: MEDIUM — price scales with the target's profit, not with the buyer's size; the only brake is the buyer's vehicle limit.
- Proves: a "control premium" can be as simple as a profit multiple on top of book assets plus debt payoff; a physical capacity gate is a natural, understandable brake but must produce a typed reason.
- Confidence: HIGH.
- Prior prose: Assignment §L ("Do not use 'cross a hidden fixed multiplier and ownership automatically transfers'") — this comparator is the exact thing the Owner rejected, and it is *legible but refusal-free*; so §L is QUALIFIED: the fixed formula is not the problem, the automatic transfer is. P15 §17 "no `isPlayer` multiplier or exemption" — QUALIFIED by comparator: OpenTTD deliberately runs an asymmetric law (player may hostile-take AI, never the reverse), and Railway Empire's symmetric law is the one players complained about (F8).

**F4. OpenTTD's "company value" is a book-style asset figure; the profit multiple appears only at transaction time.**
- Source: `CalculateCompanyAssetValue`: `value = num_station_facilities * _price[Price::StationValue] * 25` plus `v->value * 3 >> 1` per vehicle; `CalculateCompanyValue(c, including_loan)`: assets + money, minus loan when `including_loan`; `return std::max<Money>(value, 1)`. Bankruptcy offer uses `CalculateCompanyValue(c, false)` (loan ignored); hostile takeover adds loan + 2× four-quarter profit.
- Proves: three distinct numbers coexist in one shipped comparator — book value (assets ± loan), bankruptcy clearing price (assets + cash, loan ignored), and healthy transaction price (assets + loan payoff + profit multiple) — which is exactly the §N separation the Owner asked to verify.
- Confidence: HIGH.
- Prior prose: Assignment §N Future Ops view ("healthy acquisition begins from enterprise valuation + control premium; auction price emerges around liquidation/strategic value") — CONFIRMED in shape by a shipped comparator.

**F5. What transfers in OpenTTD, and the cash/debt trap.**
- Source: `ChangeOwnershipOfCompanyItems(old_owner, new_owner)` (master): transfers subsidies (`s->awarded = new_owner`), town ratings ("use max of the two ratings"), exclusive transport rights, vehicles (with service-interval normalisation), tiles/track/signals, airport infrastructure counts, stations, waypoints, signs; deletes GameScript goals and story pages; no `money` or `current_loan` transfer lines exist in the function on master. Pre-14 wiki "Economy": "In doing so you will gain all of the company's vehicles, infrastructure, and cash, but also their debt." and "If you buyout a company ... their loan will be added to yours. This can cause you to have a loan bigger than the maximum permitted loan amount."
- Proves: two eras of the same game answer assignment §F Q1/Q2 differently. Old: cash and debt both transfer (and produced the #9281 exploit and an over-max-loan anomaly). Current: seller keeps its cash ("they walk away with all the money they have in the bank"), debt is settled inside the price, and the bankruptcy buyer pays a price that ignores the loan. Either way the operating assets transfer whole and the company identity is deleted (`delete c`) — history is not preserved (the opposite of Owner §I).
- Confidence: HIGH for the transfer list and the hostile-price comment; MEDIUM for "money/loan not transferred on master" (inferred from absence in the function; no explicit code statement fetched).
- Prior prose: Owner §F core principle "historical StudioId does not disappear" — CONFIRMED as a deliberate departure from this comparator (OpenTTD deletes the company object).

### 3B. Railway Empire 1/2 and Transport Fever 2 (MEDIUM/LOW — guides + COMMUNITY)

**F6. Railway Empire: 100% of shares required; marginal share price escalates; after full ownership the buyer chooses "keep running independently" or "merge", and on merge chooses "take over" or "sell off (demolish)" infrastructure; mergers can be disabled; the AI can take over the player and the scenario fails.**
- Source: gamepressure Railway Empire guide "Research, bonds and acquiring competitors": "For this purpose, you must purchase 100% of shares in the rival company. Only then can you connect the companies and take over all of the assets."; "It is best to buy shares as soon as possible, otherwise the company's value will increase, just like the share price." COMMUNITY Steam "Mergers/Liquidations" (2020-01-20..24): "You need 100% to Merge/Liquidate."; on merge "you have options to either sell off (demolish) their infrastructure (trains, tracks, and buildings) or take over it"; cost "150% of company value if you buy all at once", "10% premium" via the Merge button; a setting prevents the AI from acquiring the player. COMMUNITY Steam "A competitor bought all of my shares!" (2021-05-04/05): "A competitor simply bought all of my shares and took over the business, and I simply failed the scenario!"; "I really don't like the AI competitors idea, it ruins the game for me."; counter-voice: "If everything is up to configuration, there is no real (as in official) challenge." COMMUNITY "Curiosity: Benefits of stock ownership" (2023-01-01): "when AI opponents purchase your stocks, it does _NOTHING_ for you"; "you get dividends when you hold 100% of the company"; larger company value → "next time you ask for a bond - it will provide a larger amount". RE2 (search-summary of guides, LOW): same 100% rule; "let it continue to run independently ... or integrate it", with "completely liquidating the acquired company, dissolving its train lines, or integrating all its assets"; "If a competitor succeeds in acquiring 100% of your company's shares, your game ends, though you can disable mergers before the game starts."
- Player decision: buy early vs let the rival grow; keep as a passive dividend company vs merge; on merge, integrate vs scrap. Liked: the merge/scrap choice and territory gain. Tedious/criticised: inferior inherited infrastructure "often requires scrapping ... for rebuilds"; minority stakes do nothing; being taken over is an instant fail that players mod out.
- AI use: AI buys player shares and can complete a takeover (symmetric law).
- Snowball risk: HIGH — company value feeds bond capacity ("larger amount"), which funds more share purchases.
- Proves: a shipped tycoon already offers the Owner's Model D fork (absorb vs keep-as-independent-dividend-entity) *and* the §G fork (integrate vs liquidate physical assets) as post-closing choices; and that symmetric hostile takeover of the player produces documented frustration.
- Confidence: MEDIUM (guide + multiple consistent threads; official manual not fetched).
- Prior prose: P12/P15 "the player has no mandatory hard-bankruptcy game-over" (P15 §12.3, §17) — CONFIRMED as wise by comparator experience; Owner §E Model D — CONFIRMED as an existing pattern; Owner §G option 2 ("player chooses sell/liquidate selected assets") — CONFIRMED as an existing pattern.

**F7. Transport Fever 2 shipped with no AI competitors because competitor AI is as expensive as multiplayer.**
- Source: COMMUNITY (Steam, Urban Games community manager statement quoted in thread, 2020-05-30): "There will be no competitors AI, because it requires same efforts as developing a multiplayer. In fact multiplayer is much easier to implement."
- Proves: rival M&A AI is a real engineering cost; a comparator with a mature economy chose to omit competitors entirely.
- Confidence: MEDIUM (statement attributed to the CM in a public thread; original post not fetched).
- Prior prose: Roadmap line 773 "Acquisition is successor invention and would expand scope across finance, contracts, IP, and identity" — CONFIRMED.

### 3C. Offworld Trading Company (HIGH — designer primary source)

**F8. The original all-or-nothing buyout failed for two reasons: inherited management burden and snowball; pricing alone could not fix it.**
- Source: Soren Johnson, "OTC Designer Notes #17: Stock Market" (2016-05-01): "players often felt that the game spiralled out of control following a buyout because they inherited a lot of new buildings all over the map that they didn't have time to manage"; "buyouts were all-or-nothing affairs; when two players were racing to buyout a third player, the winner would usually snowball forward and easily dominate the rest of the game (or, if we tried to balance out this effect by making buyouts too expensive, an even worse situation occurred in which players saved up their money instead, in hopes being able to afford the final buyout)."
- Proves: (a) inheriting a second operation to run is felt as a burden, not a reward — direct support for the Owner's refusal to manage multiple lots (§E, §G); (b) a pure price-premium anti-snowball lever over-corrects into hoarding — a warning for §S "healthy-company control premium" if it is the only lever.
- Confidence: HIGH.
- Prior prose: Owner §E "does NOT want to manage multiple independent studio operations" — CONFIRMED by an independent designer's playtest finding.

**F9. The subsidiary solution: the bought company keeps existing as an AI-run cash-flow entity that distributes profit by ownership share; partial ownership handled cleanly; majority buyout ends kingmaking.**
- Source: same post: "players no longer acquired all of the eliminated player's buildings and claims but instead now owned shares of a new subsidiary, which is the eliminated player's company run by a modified AI that focuses solely on making money ... The subsidiary simply exists to distribute its profits to shareholders, according to the ownership percentage."; "the majority buyout, which occurs if the other players own six shares (meaning more than half) of a player's stock ... the targeted player is instantly eliminated and turned into a subsidiary ... the player is not left around with an opportunity to unbalance the game by, perhaps, using sabotage maliciously".
- Proves: Model B (autonomous subsidiary) *can* avoid management burden if the subsidiary is a pure AI-run financial asset with no player operations — which is closer to Owner §G option 3 ("remote corporate property exists only as a financial asset") than to a second managed studio.
- Confidence: HIGH.
- Prior prose: Owner §E Model B "expect this to conflict with Owner preference" — QUALIFIED: it conflicts only if the subsidiary is player-operated; an AI-run financial subsidiary does not.

**F10. Legibility came from turning ownership into visible "hit points", with an escalating price and a bundled last step to stop gang-ups.**
- Source: same post: "Stocks owned in one's own company became the equivalent of hit points, and when a player ran out of stock, her game was over. The system led to some tense games in which players could easily see how close the game was to ending"; "free-for-alls with more than three players suffered because players could team up against one specific player and buy one or two shares each"; final rule: "Players could buyout shares one at a time until only five shares remained; at that point, the remaining five shares have to be bought all together"; "during a buyout, players have to pay 20% extra for each share owned by a third party ... Many players didn't even notice this final tweak, but it felt better".
- Proves: (a) a visible progress-to-control meter creates tension without hidden bargaining; (b) a *pile-on* by several rivals is a distinct failure mode of any multi-bidder M&A law; (c) small escalations can shape behaviour without being noticed.
- Confidence: HIGH.
- Prior prose: P14 annex "Interest: Public tier/range and typed drivers known ... not exact hidden willingness" — CONFIRMED in spirit (visible state, not hidden dice).

**F11. Defence by spending: the target can buy its own stock; independence has a price.**
- Source: same post: "This rush, however, can be beaten by a turtle strategy, which means buying up shares of one's own stock, especially that all-important fifth share that prevents a majority buyout"; "when a player buys his own fifth share and blocks a majority buyout attempt".
- Proves: a target's "independence preference" (Owner §L factor) is most legible when it is backed by a visible cost the target actually pays.
- Confidence: HIGH.
- Prior prose: NEW.

### 3D. Football Manager and Motorsport Manager (MEDIUM/LOW)

**F12. FM24's willingness-to-sell is presented as a small typed stance plus explicit reasons, not a hidden bargaining number.**
- Source: Football Manager official feature page "Introducing Intermediaries and Offloading Players" (FM24, 2023-09-21): agent conversation with three tones — "Desperate", "Keen", "Curious"; the agent "will let you know the player's current market value and the clubs most interested"; the price tag "will remain active on the player's profile until it expires"; "If a player doesn't want to leave, the agent will refuse to engage in attempts to sell them"; "going over their head to an Intermediary can risk the player becoming unhappy"; intermediaries disclose reach, ability, time frame and commission (capped at 10%) — "what they expect to provide and for how much"; Transfer Status shows "Active Interest or Rumoured Interest" with a "contextual reason for a club's interest". Official "Smarter Transfers" page (2023-09-19): "AI Managers are now better geared up to recognise imbalances in their squad make-up"; rivals make "more informed, reactive squad-building decisions". COMMUNITY (givemesport, 2024-12-21): fees "can be altered at any time on the transfer status screen"; TransferRoom — "clubs won't be looking at the 'TransferRoom' every second of every day, but they will at the start of each transfer window".
- Player decision: choose a stance (urgent / market price / only for the right price), set an asking price, choose an intermediary route with disclosed cost/time. Liked: reasons shown; time-boxed price tags; windows make timing a decision. Tedious: (COMMUNITY, widely reported but not fetched from SI) lowball ping-pong and "not for sale at any price" even for listed players (SI forum thread title "Transfer listed player not for sale at any price", not fetched — UNVERIFIED detail).
- AI use: AI clubs buy and sell on squad context and finances; interest labels drive rumours.
- Snowball risk: LOW-MEDIUM — rich clubs out-bid, but windows, contract expiry and player consent limit.
- Proves: legible willingness = {typed stance, shown value, interested parties with reasons, time-limited tag, route cost}. This is the closest shipped analogue to Owner §L "recommend what should be visible to the player. Avoid an opaque bargaining simulator."
- Confidence: MEDIUM (official page quoted; SI manual blocked).
- Prior prose: P14 §comparator rows on FM intermediaries/interest — CONFIRMED; P15 §7 FM row ("reject ... opaque forced sale") — CONFIRMED.

**F13. Value vs price vs timing are distinct in FM: contract expiry, league reputation and the window move the fee independently of "value".**
- Source: COMMUNITY Steam FM24 "What determines transfer value?" (2025-01-30..02-03): moderator: "clubs likely won't offer you 20, 30, or 40m+, despite him being well worth that, as they know that he will be available for free"; "because your playing in polish league, that makes teams bid even lower"; "in January their prices are better, in summer they are just a fraction".
- Proves: a shown "value" is not the transaction price; time-to-expiry of the underlying contract is the biggest single driver — relevant to §F Q3 (inherited employee contracts are worth less the shorter they are) and §N (do not collapse value and price).
- Confidence: LOW (community).
- Prior prose: Owner §N "Do NOT collapse these into one number" — CONFIRMED.

**F14. FM club takeovers exist as board-level events; the club identity persists, only ownership and possibly the manager change.**
- Source: COMMUNITY thread titles only (SI forum "Sacked after board takeover"; Neoseeker "Board takeover = fired"; FMG "FM Club Takeovers..." — consortium vs wealthy investor types). Not fetched.
- Proves (weakly): sports sims model ownership change as an event on a persistent entity, never as a new club — same shape as Owner §I.
- Confidence: LOW.
- Prior prose: Roadmap §9 `StudioId` "Mint once ... acquisition ... appends events; none remints the studio" — CONFIRMED by analogue.

**F15. Motorsport Manager: buyout clauses are negotiated contract terms; high clauses deter poaching and are disliked by drivers.**
- Source: search-summary of Steam threads (Jun 2017 thread fetched shows only player confusion): "The buyout fee multiplies to increase the cost of someone poaching your drivers"; "Drivers do not like high buyout fees, as it reduces their chance of moving". LOW.
- Proves: in-term buyouts are a contract-level instrument (P14D territory), not an M&A instrument.
- Confidence: LOW.
- Prior prose: Owner rulings §5 "advanced mobility and buyouts" parked P16+; Roadmap line 203 P14D parking label — N/A for P16 M&A (this dossier does not reopen P14D); note only that a whole-company acquisition must *not* be a back door to in-term poaching (see §5 implication 9).

### 3E. Crusader Kings III (MEDIUM — wiki + history-file format)

**F16. CK3's title is a durable identity whose holder changes are an append-only dated log; a "claim" is a typed right distinct from holding.**
- Source: CK3 wiki "Titles" (verified for 1.19; last edited 2026-08-15): "A title is essentially a certificate of land ownership, decreeing which characters own (or have a right to own) a certain place"; titles are obtained by **creating**, **usurping** or **inheriting**; "Barony and County titles ... Cannot be destroyed"; holders may change a title's name and coat of arms (identity persists under a new label). CK3 wiki "History modding": title history files at `game/history/titles`, entries `year.month.day = { holder = id }`; example `1066.1.5 = { holder = 122 # Harold Godwinson`; "If no other liege or holder is added, they will be identical to the previous entry." CK3 wiki "Succession" (verified 1.10): "eligible children are given pressed claims on titles they did not inherit nor vassalise"; "If the parent held pressed claims themselves, unpressed claims are inherited in their stead."
- Proves: the data shape the Owner wants for `StudioId`, `StoryPropertyId` and film rights already exists as a proven model: entity minted once; ownership = dated holder events; label (name/arms) is a mutable presentation attribute; rights-to-hold (claims) are separate typed facts with their own inheritance law. The Owner cited CK3 for research prerequisites (rulings §2.4.1.2); that is a different CK3 system and is not evidence here.
- Confidence: MEDIUM (wiki fetched via summariser; history format quoted).
- Prior prose: Roadmap §9 identity table and P15 §13.2 identity law — CONFIRMED by analogue; Owner §I ("cleanest identity/status relation") — CONFIRMED pattern: status is an event log on the immutable id, "Successor owner" is the last holder entry.

### 3F. Anno 1800 (MEDIUM/LOW)

**F17. Island shares: fixed small share count, each a dividend claim; price scales with the target's development; final share = takeover; cooldown; AI buys/sells shares and retaliates diplomatically.**
- Source: search-summary of the Anno 1800 wiki "Island shares" (page blocked, LOW): "Each island ... has 5 shares, every one of them representing a small portion of income"; "Each share is worth 6% of income ... all 5 shares together are worth 30%"; "you can peacefully takeover other islands after acquiring all of their shares"; "Buying shares and taking over an island has a 10 minute cooldown per island"; "shares ... can be purchased and sold both by AI competitors and players". gamepressure (2023-06-27): "The price of shares depends on the size and development of your rival."; "By buying the final share, represented by the flag in the center, you take over the island." Anno Union devblog (2017-11-23): "with Anno 1404: Venice, we added the possibility to overtake opponent islands through economic domination". COMMUNITY Steam (2019-04-20..22): "AI declared war to me after buying a share from their island even tough I had 80 reputation with them"; another lost after "the AI purchasing all their shares in retaliation"; shares appreciate "from 50,000 to 500,000".
- Player decision: peaceful takeover vs war; buy early while cheap. Liked: appreciation and dividends. Criticised: diplomatic blow-back feels arbitrary at high reputation; tedious cooldowns.
- AI use: symmetric — buys player shares, retaliates.
- Snowball risk: MEDIUM — dividends fund more shares; cooldown and diplomacy brake it.
- Proves: rejected/hostile bids can carry a relationship consequence (Owner §O "whether repeated rejected bids have consequences") and a cooldown; and that consequences must be explained or they read as random.
- Confidence: LOW–MEDIUM.
- Prior prose: NEW.

### 3G. Big Ambitions, Startup Company, Capitalism Lab, Mad Games Tycoon (MEDIUM/LOW)

**F18. Big Ambitions: offer against a shown "estimated valuation of what the owner is expecting"; the seller can refuse; response depends on typed factors.**
- Source: independent Big Ambitions wiki guide (verified 2026-09-03 for v1.0): "The takeover price and seller response vary with the target's value, performance, ownership, and rivalry state. The exact offer needed cannot be promised in advance."; refusal means "the seller did not accept that valuation or the target is not currently eligible"; the feature is "a way to acquire a desirable operating location, with the target's furniture and stock remaining after the acquisition". Search-summary of a Steam guide (LOW): "'Send Business Overtake Offer' ... It will give you an estimated valuation of what the owner is expecting to get from their business, but you can negotiate"; "this includes all its employees, furniture and appliances". Selling player businesses to NPCs: not available (shut down and sell contents only) — LOW.
- Proves: the Owner's §L shape (shown valuation, typed drivers, refusal allowed, no hidden multiplier) is already a shipped pattern; note the target is bought for its *location/assets* (§G), not for its brand.
- Confidence: MEDIUM.
- Prior prose: Owner §L — CONFIRMED pattern exists.

**F19. Startup Company: no refusal and no escalation on competitor shares → documented total-monopoly snowball; only investor buy-back cost scales.**
- Source: search-summary of the Startup Company wiki (page blocked, LOW): competitors "don't buy back shares and can't deny the buying of shares"; "if you own a competitor completely (100% of all shares) you can merge its users with one of your competing companies". COMMUNITY Steam "Does ownership matter?" (2018-08-02): player: "I ... have a complete monopoly on all product types as I've bought and merged every competitor"; investor buy-back reaching "$10 billion"; developer (Jonas): "you will be able to raise more money through investments if you own everything".
- Proves: absence of refusal + absence of premium = the assignment's feared end state (§S "richest studio permanently unbeatable"); the one brake players felt was the escalating buy-back price.
- Confidence: LOW–MEDIUM.
- Prior prose: Owner §S — CONFIRMED risk; §L "A healthy studio should be allowed to reject an offer" — CONFIRMED necessary by counterexample.

**F20. Capitalism Lab offers "Acquire" (keep separate) vs "Acquire and Merge" (integrate) at purchase time; control thresholds are simple percentages.**
- Source: capitalismlab.com "Acquiring a Private Company" (Digital Age DLC page, screenshots dated 2017): "AI controlled tech companies that are private and independent may be open to acquisition offers"; button "[Acquire Company]" on the Corporate Details report; quoted price example "$285,315,000"; "[Acquire]" — "remains separate under your control"; "[Acquire and Merge]" — "integrates directly into the acquiring entity". "Subsidiary DLC Tips and FAQ": at "75% ownership or more you gain direct control"; "To merge two subsidiaries you need 75% or more of each, and the one with the larger market value must be selected as the acquiring company"; "the acquirer pays cash or issues new shares to buy up the target's remaining shares"; privatize at 100%. No refusal/willingness text on the page; no antitrust text.
- Proves: the Owner's Model D fork ("Absorb Completely" vs "Absorb Operations + Retain Brand as Label") is a recognised transaction-time choice in a business sim; Capitalism Lab's "remains separate" is a *managed* subsidiary (the thing the Owner does not want), so the Studio adaptation must strip management from the "retain brand" branch.
- Confidence: MEDIUM (official pages; willingness rules not documented there).
- Prior prose: Owner §E Model D — CONFIRMED as a known pattern; Owner §E "Labels should not become a second separately managed studio" — QUALIFIED: comparator labels *are* managed; the Studio version deliberately differs.

**F21. Mad Games Tycoon: carrying costs of acquired studios were felt as the natural brake; MGT2 transfers the target's debt.**
- Source: COMMUNITY Steam MGT (1) thread (2017-08): "their operating costs are eating nearly all my normal profits and it's making it incrementally harder to buy each new dev". MGT2 (search-summary of Steam threads/news, LOW): "After a buyout you will take on all the company's debt, and if the company was in financial trouble before the buyout you will need to give it financial assistance"; subsidiary profit take "10-85%"; owned companies can be closed. MGT2 "Buy Competitors" thread (2021-09..11): feature "not yet" at that date; dev: "the update will affect the AI of the game".
- Proves: inherited operating cost and inherited debt are experienced by players as *realistic* brakes rather than arbitrary caps — the "integration costs / inherited debt / inherited contracts" levers in Owner §S.
- Confidence: LOW–MEDIUM.
- Prior prose: Owner §S lever list — CONFIRMED (three of the listed levers have felt-natural evidence).

### 3H. Total Extreme Wrestling 2020 and the real-world tape-library analogue (MEDIUM / UNVERIFIED)

**F22. TEW2020 models ownership as a typed relationship on persistent companies; child companies are financially absorbed by the parent; the parent can close them; AI "predator hiring" is deliberately aggressive.**
- Source: TEW2020 Announcement & Developer's Journal (Adam Ryland, mirrored at bethebooker.net): #16 "Company relationships": statuses include "A Owns B", "B Owns A", "They Are Sister Companies", "They Have Agreed To Talent Trade"; "Opinions are saved even if two companies have no other visible relationship, meaning that the game can 'remember' previous acts of friendship or hostility." #1 child companies: "any profit or loss is absorbed by the parent and so it's impossible to go bankrupt", the parent "has the final say on all matters". #67: "a child company is no longer limited in how big it can grow. If the parent company wishes, it may now choose to close down any or all child companies". #68: "The user now has the option of voluntarily closing down their company if they're the owner." #70/#71: "The AI predator hiring, which is the code that allows bigger companies to go after major names, has been changed to make the AI far more aggressive." #75: "When viewing a company's history, the user can now order the list by type and rating, date, or attendance." Handbook (search-summary of blocked wiki, LOW): "try to takeover an existing company by going to that company's profile and choosing Contact"; "A Purchased owner means they bought the company outright."
- Proves: a shipped management sim records ownership as a relation between two *persisting* company records (Owner §I shape), remembers hostile acts (Owner §O rejected-bid consequences), and treats "close the acquired company" as a distinct owner action from "own it".
- **Tape library:** the assignment's premise that TEW models buying a rival's tape library and keeping the brand as a label was NOT verifiable: no developer-journal entry, feature list or accessible wiki page mentions a tape/video library mechanic. Status: UNVERIFIED (possible confusion with another wrestling sim or with real-world WWE practice). TEW IX video titles ("We Bought Out A Promotion", "What happens when you BUY A FOREIGN COMPANY?") suggest a buy-out flow exists in TEW IX; mechanics unverified — LOW.
- Confidence: MEDIUM for the journal quotes; UNVERIFIED for tape library.
- Prior prose: NEW.

**F23. Real-world tape-library acquisition (used only as the "library value" analogue): libraries are bought for a distribution channel and for history/control; priced by talent quality; fragmented rights make a library untradeable.**
- Source: Wrestlenomics, "How WWE acquired territorial video libraries, a conversation with John Carlan" (2022-07-15): "we at WWE wanted to have a lot of that, to be able to provide the viewer and our audience ... with the best possible content"; valuation "what was the talent, do we have A plus talent, do we have B talent, is it worth a million dollars"; a library "was not worth the price ... there wasn't enough A, B talent that was worth a million dollars"; Memphis: "there were so many different moving parts that it was not doable". No ongoing-revenue discussion; emphasis on post-purchase costs (music licensing, digitisation).
- Proves: (a) a library's cash value materialises only when an owning distribution/media channel exists — matching Owner §C "Do not invent perpetual weekly library cash before an owning distribution/media system actually exists"; (b) strategic/historical value exists independently of that cash; (c) split ownership of one property destroys tradeability — argument for Owner §B small undivided bundles.
- Confidence: MEDIUM (secondary interview, well sourced).
- Prior prose: Owner §C — CONFIRMED; Owner §B "smallest useful rights bundle" — CONFIRMED by counterexample.

### 3I. Anti-snowball design writing (MEDIUM — written sources; GMTK/GDC not fetched)

**F24. Positive feedback decides games early; the remedy is limited, temporary slippery slope plus non-arbitrary comeback.**
- Source: Sirlin, "Slippery Slope and Perpetual Comeback" (2014-08-11): "If a game has slippery slope, it means that falling behind causes you to fall even further behind."; "the real victor of the game is decided early on and the rest of the game is futile to play out"; recommendation: limited, temporary slippery slope (knockdowns that "reset quickly and can't compound") combined with comeback mechanics.
- Proves: the design goal is bounded, self-resetting advantage, not symmetry at every instant.
- Confidence: MEDIUM.
- Prior prose: D-16 rulings R9 "Must avoid ... permanent snowball, permanent death spiral" — CONFIRMED.

**F25. Catch-up mechanisms that emerge from the core economy feel elegant; explicit leader taxes feel heavy-handed; player-driven "bash the leader" works only with multiple agents.**
- Source: The Thoughtful Gamer, "Catch-Up Mechanisms" (2017-03-28): five categories — direct ("ball and chain": Power Grid reverse turn order, Suburbia "speed bumps"), point floors, subtle/integrated (Dominion: "Getting victory points fundamentally weakens your engine"), player-driven (bash the leader), none; direct mechanisms are "heavy handed"; integrated ones feel most elegant because they "emerge organically from gameplay rather than appearing as retrofitted solutions".
- Proves: Owner §S instruction "Do NOT automatically recommend artificial M&A caps" is aligned with practitioner consensus: prefer integrated costs (integration friction, inherited obligations, capacity) over caps.
- Confidence: MEDIUM.
- Prior prose: Owner §S — CONFIRMED.

**F26. Over-correction is its own failure: rubber-banding punishes the leader and randomises outcomes.**
- Source: Oakleaf Games, "Runaway Leader, Rubber Banding, and Feedback" (Nat Levan, 2014-02-13): runaway leader arises when "the rate of progress is based on some portion of your current progress"; rubber banding is when "the game keeps bouncing you back and forth between making a lot of progress when you're behind, and little, or negative progress when you're ahead" and can "completely overwhelm the player choices"; Mario Kart: "the leader is punished by the game", outcomes "fairly random"; recommended: escalating costs proportional to progress, diminishing returns, multiple progress paths, bounded ranges, staged resets.
- Proves: hidden rival catch-up or hidden player penalties (already rejected in P13 §2A/P15 annex as "hidden rubber-banding") are the wrong lever; escalating *visible* costs and diminishing returns are the right family.
- Confidence: MEDIUM.
- Prior prose: P15 builder annex "Decay ... | hidden rubber-banding" (rejected) and P13 "no invisible catch-up" — CONFIRMED.

**F27. Project: Studio's own economy already has a measured runaway mode; M&A would be a positive-feedback amplifier on top of it.**
- Source: `p12-accepted/docs/D-16-ECONOMY-RECOVERY-DECISION-LAB.md` line 49: "G11 | Snowballing bounded | ... | **FAIL** | Max 59× start, runaway runs never end negative, drawdown ≤1.4%; runaway is a world property (585/1000 worlds never run away under any policy); the current brake on snowballing is the death spiral itself". `p12-accepted/docs/D-17B-OWNER-EVIDENCE.md` line 224: "G11 Snowballing bounded | **PARTIAL/FAIL** | ... cash half regresses to 19.6–19.7% mean runaway and remains world-led".
- Proves: any P16 acquisition law that lets cash buy revenue-producing assets at book value would convert an existing ~20% runaway share into consolidation; anti-snowball is not optional for P16 (Owner §S), and the base-economy gate G11 should be re-run with M&A enabled.
- Confidence: HIGH (accepted-tree documents).
- Prior prose: CONFIRMED (this is the accepted measurement).

---

## 4. Synthesis A — the most legible "willingness to sell" presentation patterns (evidence-ranked)

| # | Pattern | Where it shipped | How it felt (evidence) | Fit with Owner §L/§O |
|---|---|---|---|---|
| W1 | **Typed public stance** ("Not for sale / Would listen / Open to offers / Seeking buyer / In administration") with a dated reason | FM24 agent tones Desperate/Keen/Curious and transfer-listed status (F12); TEW "Purchased owner"/owner types (F22) | Liked: players know before bidding; criticised only when a *listed* asset is still refused without a reason (F12 UNVERIFIED thread) | Directly satisfies "A healthy studio should be allowed to reject an offer" with visible cause |
| W2 | **Shown expected valuation + named premium drivers**, refusal allowed | Big Ambitions "estimated valuation of what the owner is expecting" with value/performance/ownership/rivalry drivers (F18); OpenTTD's three-part takeover price (F3) | Liked: predictable; the OpenTTD *automatic* transfer is the part the Owner rejects | Publish enterprise valuation band and the drivers; keep the decision with the target |
| W3 | **Visible progress-to-control meter** | OTC "stocks as hit points" (F10); Railway Empire share % (F6); Anno 5 shares (F17) | Liked: tension, everyone can see how close a takeover is; needs a gang-up cap (OTC bundled last five) | Requires partial ownership, which the Owner has not selected; adapt as an *acceptance-likelihood band* on the offer screen rather than shares |
| W4 | **Escalating, visible marginal premium** | OTC +20%/third-party share; RE ~150–160% of value for a full buy, +10% Merge-button premium; OpenTTD 2-year profit multiple | "Many players didn't even notice this final tweak, but it felt better" (F10) | Control premium as a shown schedule tied to target success and to how contested the bid is |
| W5 | **Interest/relationship labels with contextual reasons, and remembered hostility** | FM Active/Rumoured interest with reasons (F12); TEW opinions "remember previous acts" (F22); Anno diplomatic reaction (F17) | Liked when explained; Anno's unexplained war at 80 reputation read as arbitrary | Rejected bids leave a dated, typed relationship event and a cooldown (OpenTTD `bankrupt_asked` mask, Anno 10-min cooldown) |

## 5. Synthesis B — the most natural anti-snowball levers observed (evidence-ranked)

| # | Lever | Evidence it felt natural | Evidence of failure mode |
|---|---|---|---|
| L1 | **Carrying/integration cost of what you bought** (inherited operating cost, inherited debt, inferior inherited infrastructure) | MGT: "operating costs are eating nearly all my normal profits ... incrementally harder to buy each new dev" (F21); RE: inherited track "requires scrapping ... for rebuilds" (F6); MGT2 debt assumption (F21) | OTC v1: inheriting buildings "spiralled out of control" — burden must be *financial*, not *managerial* (F8) |
| L2 | **Price escalation with target success and with contest** | OTC 20%/share "felt better" (F10); OpenTTD profit multiple (F3); RE marginal price (F6) | OTC: too expensive → "players saved up their money instead" (F8); pure price is insufficient |
| L3 | **Target can refuse or defend** | OTC buy-own-fifth-share (F11); FM "agent will refuse to engage" (F12); Big Ambitions refusal (F18) | Startup Company: no refusal → monopoly (F19) |
| L4 | **Physical/capacity limits** | OpenTTD vehicle limit (F3); Owner's single-lot law (§G) | Must produce a typed reason — OpenTTD needed a fix for the silent "Can't buy company" (F3) |
| L5 | **Competing bidders / who gets asked first** | OTC third-party-share surcharge rewards the early investor (F10) | OpenTTD asks the *best performer first* — pro-leader ordering; do not copy (F2) |
| L6 | **Cooldowns / protection periods** | OpenTTD min-company-age for share trading (#7780) (F3); Anno per-island cooldown (F17); RE "disable mergers" option (F6) | PR #10914 dropped the protection period for hostile takeover — a design choice, not a failure |
| L7 | **Diplomatic/relationship consequences of hostile bids** | TEW remembered opinions (F22) | Anno: unexplained war after one share purchase read as arbitrary (F17) |

Observed anti-patterns to avoid: leaders getting first refusal (F2); symmetric hostile takeover of the human player as an instant fail (F6); hidden rubber-banding (F26); multi-rival pile-on without a bundled last step (F10); cash+debt double-handling at transfer (F1, F5).

---

## 6. Design implications for P16 (explicitly my INFERENCE — FUTURE RECOMMENDATION, not approved scope)

1. **Willingness as a public typed stance, not a bargaining number.** Every studio carries a visible `saleStance` ∈ {NotForSale, WouldListen, OpenToOffers, SeekingBuyer, InAdministration} with a dated reason code (from P15 condition/reason grammar). An offer to a NotForSale studio is refused with that reason; the stance itself, not a hidden multiplier, is what price moves (F12, F18, F19). Satisfies Owner §L/§O.
2. **Show the valuation band and the premium drivers; keep refusal with the target.** Display Enterprise Valuation (band), Control Premium schedule (drivers: recent performance, strategic assets, independence stance), and an Acceptance Likelihood band per offer. This is W2+W3 without shares (F3, F10, F18).
3. **Keep the three numbers separate and cite the comparator that already does it.** Book Net Worth (P11 ledger), Enterprise Valuation (P16 formula, versioned), Transaction Price (offer accepted) and Auction Price (clearing bid). OpenTTD proves the separation is implementable in a few lines (F4). Confirms Owner §N Future Ops view.
4. **Distressed sale = bounded window + clearing price or rival bids; never "best performer first".** Reuse P15's warning/distress ladder; add an "offered for sale" state with a fixed window (F2), but invite *all* eligible bidders simultaneously (or ascending bids) instead of OpenTTD's performance-ordered first refusal (L5).
5. **Model D implemented as "Absorb" vs "Absorb + Retain Label"; the label is a history/brand attribute with zero operations.** Capitalism Lab and Railway Empire both offer keep-separate vs merge (F6, F20) but their "separate" is a managed or dividend entity — OTC's designer evidence says inherited operations are a burden (F8). Retained label = name/credit on future films + searchable history; no roster, lot, ledger or projects.
6. **Anti-snowball via integrated costs first, price second, caps never (unless measured necessary).** Order of levers: L1 inherited obligations and integration friction (temporary, dated, visible), L4 single-lot physical limits (typed reasons), L2 premium schedule, L3 refusal/defence, L6 cooldown after a rejected or completed deal, L7 relationship event on hostile/repeated bids. Re-run the accepted G11 snowball gate with M&A enabled before any cap is considered (F27, F25).
7. **Never let cash and debt double-count at closing.** Adopt one rule and state it: acquired cash becomes buyer cash *and* debt transfers at face (whole-company), with price quoted net of both — or seller keeps cash and debt is settled in price (OpenTTD 14+). Either is legible; mixing them is the exploit (F1, F5). Recommend the first for whole-company deals (matches Owner §F "cash/debt" candidates) and the second for clean asset purchases (§M option 3).
8. **Rival may not hostile-acquire the player's studio without player consent.** Railway Empire's symmetric instant-fail was the single most-complained mechanic found (F6); OpenTTD forbids it outright (F3). "Same transaction law" (Owner §J) should mean same valuation, same premium schedule, same eligibility — with the player's sale being a player choice (consistent with P12/P15 "no mandatory hard-bankruptcy game-over").
9. **Whole-company acquisition must not be an in-term poaching back door.** Inherited contracts transfer intact and the buyer may release under ordinary termination law (Owner §F Q3/Q4); an acquisition made only to lift one star must still pay the enterprise premium and inherit the obligations — the cost is the brake (F13, F15, L1). Does not reopen P14D.
10. **Rejected bids have a dated consequence and a cooldown, with a stated reason.** TEW-style remembered opinion (F22) plus Anno-style cooldown (F17), but always explained (Anno's unexplained war is the failure case).
11. **Library value is strategic until a channel exists.** Store library/Story Property value as a valuation input and historical fact; do not emit weekly cash (F23; Owner §C). Fragmented rights (Memphis) argue for one undivided bundle per Story Property in P16A (Owner §B).
12. **Ownership history as CK3-style append-only holder events on an immutable id.** `StoryPropertyId` / `StudioId` never remint; each transfer appends `{date, fromOwner, toOwner, transactionId, kind}`; display name is a label (F16). Matches Roadmap §9 and Owner §I.
13. **Give every refusal a typed reason.** The OpenTTD "Can't buy company" defect and the FM "not for sale at any price" complaint are the same UX failure (F3, F12).

---

## 7. Open questions (genuine, for the report / Owner)

1. May a rival ever acquire the *player's* studio (hostile, or via player-initiated sale)? Evidence says hostile-instant-fail is hated; a player-initiated sale is a possible ending that P15 §4.3 leaves undecided (post-2040 / player terminal ending).
2. Should the retained label carry *any* mechanical effect (e.g., films released under it keep a brand-level audience memory), or is it purely credit/history? Comparators either manage the subsidiary (Capitalism Lab, TEW child) or make it a pure dividend AI (OTC); none ships a zero-operations label, so this is a genuine design decision.
3. Distressed sale ordering: simultaneous sealed bids, ascending auction, or fixed clearing price with a window? OpenTTD's fixed price is simplest; the Owner asked for rivals bidding (§S).
4. Should partial ownership (stakes) exist at all? Every "progress-to-control" legibility pattern (W3) depends on it, and every share system reviewed either became an exploit (OpenTTD) or a management/scale problem (OTC v1). The Owner has not selected stakes; this dossier recommends against them for P16 and notes the loss of W3.
5. Cooldown/protection period after founding or after a rejected bid: comparators use fixed timers; Project: Studio's week-based calendar suggests a dated `nextOfferAllowedWeek` — length is an Owner/tuning question.
6. TEW "tape library as label" premise remains UNVERIFIED; if the Owner recalls the source, it should be re-checked before it is cited in the report.

---

## 8. Source table

| # | Source | Type | Version / date | Locator | Fetched |
|---|---|---|---|---|---|
| S1 | OpenTTD `src/economy.cpp` (master) | CODE (GPL; pattern only, no reuse) | master; latest release 15.3 (2026-04-04) | `CalculateCompanyAssetValue`, `CalculateCompanyValue`, `CalculateHostileTakeoverValue`, `ChangeOwnershipOfCompanyItems`, `CompanyCheckBankrupt`, `DoAcquireCompany`, `CmdBuyCompany` — https://raw.githubusercontent.com/OpenTTD/OpenTTD/master/src/economy.cpp | yes |
| S2 | OpenTTD `src/company_cmd.cpp` (master) | CODE | same | `CheckTakeoverVehicleLimit`, `HandleBankruptcyTakeover`, `OnTick_Companies` — https://raw.githubusercontent.com/OpenTTD/OpenTTD/master/src/company_cmd.cpp | yes |
| S3 | OpenTTD `changelog.md` | OFFICIAL | 14.0-beta1 (2024-02-03) et al. | https://raw.githubusercontent.com/OpenTTD/OpenTTD/master/changelog.md | yes |
| S4 | OpenTTD PR #10709 "Remove: buying/selling/owning company shares" | DEVELOPER | merged 2023-04-29 | https://github.com/OpenTTD/OpenTTD/pull/10709 | yes |
| S5 | OpenTTD PR #10914 "Feature: allow to do a hostile takeover of an AI company (in singleplayer)" | DEVELOPER | merged 2023-06-05 | https://github.com/OpenTTD/OpenTTD/pull/10914 | yes |
| S6 | OpenTTD issue #9281 "Company Takeover Maths not correct" | DEVELOPER/COMMUNITY | 1.10.1, 2021-05-19 | https://github.com/OpenTTD/OpenTTD/issues/9281 | yes |
| S7 | OpenTTD wiki "Economy" (pre-14 share text) | OFFICIAL WIKI (stale) | undated | https://wiki.openttd.org/en/Manual/Economy | yes |
| S8 | Steam OpenTTD "Hostile takeovers" | COMMUNITY | 2025-08-24 | https://steamcommunity.com/app/1536610/discussions/0/600787749709060367/ | yes |
| S9 | gamepressure Railway Empire guide "Research, bonds and acquiring competitors" | GUIDE | undated | https://www.gamepressure.com/railway-empire-guide/research-bonds-and-acquiring-competitors/z0aa86 | yes (after redirect) |
| S10 | Steam Railway Empire "Mergers/Liquidations" | COMMUNITY | 2020-01-20..24 | https://steamcommunity.com/app/503940/discussions/0/3799284366977733496/ | yes |
| S11 | Steam Railway Empire "A competitor bought all of my shares!" | COMMUNITY | 2021-05-04/05 | https://steamcommunity.com/app/503940/discussions/0/3153060388604618274/ | yes |
| S12 | Steam Railway Empire "Curiosity: Benefits of stock ownership" | COMMUNITY | 2023-01-01 | https://steamcommunity.com/app/503940/discussions/0/3734079567824210776/ | yes |
| S13 | Steam Transport Fever 2 "Will they ever add competitors" (CM statement) | COMMUNITY (dev statement quoted) | 2020-05-30 | https://steamcommunity.com/app/1066780/discussions/0/2277079183727043477/ | yes |
| S14 | Soren Johnson, "OTC Designer Notes #17: Stock Market" | DEVELOPER (primary) | 2016-05-01 | https://www.designer-notes.com/otc-designer-notes-17-stock-market/ | yes (verbatim via curl) |
| S15 | Football Manager "Introducing Intermediaries and Offloading Players" | OFFICIAL | FM24, 2023-09-21 | https://www.footballmanager.com/features/introducing-intermediaries-and-offloading-players | yes |
| S16 | Football Manager "Smarter Transfers, Squad Building and Finance" | OFFICIAL | FM24, 2023-09-19 | https://www.footballmanager.com/features/smarter-transfers-squad-building-and-finance | yes |
| S17 | Steam FM24 "What determines transfer value?" | COMMUNITY | 2025-01-30..02-03 | https://steamcommunity.com/app/2252570/discussions/0/603020878754650313/ | yes |
| S18 | givemesport "how to sell unwanted players in FM24" | COMMUNITY/PRESS | 2024-12-21 | https://www.givemesport.com/football-manager-2024-gaming-how-to-sell-unwanted-players/ | yes |
| S19 | Steam Motorsport Manager "Buyout clause paid by drivers???" | COMMUNITY | 2017-06-15 | https://steamcommunity.com/app/415200/discussions/0/2119355556477633196/ | yes (low content) |
| S20 | CK3 wiki "Titles" | OFFICIAL WIKI | verified 1.19; edited 2026-08-15 | https://ck3.paradoxwikis.com/index.php?mobileaction=toggle_view_desktop&title=Titles | yes |
| S21 | CK3 wiki "Succession" | OFFICIAL WIKI | verified 1.10 | https://ck3.paradoxwikis.com/Succession | yes |
| S22 | CK3 wiki "History modding" | OFFICIAL WIKI | verified 1.1 | https://ck3.paradoxwikis.com/History_modding | yes |
| S23 | Anno Union "DevBlog: The Art of War II" | OFFICIAL | 2017-11-23 | https://www.anno-union.com/deblog-the-art-of-war-ii/ | yes |
| S24 | gamepressure "Anno 1800 - How to Buy Shares" | GUIDE | 2023-06-27 | https://www.gamepressure.com/newsroom/anno-1800-how-to-buy-shares-and-is-it-worth-it/zd5996 | yes |
| S25 | Steam Anno 1800 "Share buying / island takeover and AI reaction" | COMMUNITY | 2019-04-20..22 | https://steamcommunity.com/app/916440/discussions/0/1680315447978297270/ | yes |
| S26 | Anno 1800 wiki "Island shares" | COMMUNITY WIKI | — | https://anno1800.fandom.com/wiki/Island_shares | FAILED (402/403); search-summary only |
| S27 | Big Ambitions independent wiki "Buying Out an Existing Business Objective" | GUIDE | verified 2026-09-03, v1.0 | https://big-ambitions.com/wiki/guides/big-ambitions-buying-out-an-existing-business-objective | yes |
| S28 | Steam Startup Company "Does ownership matter?" | COMMUNITY (dev reply) | 2018-08-02 | https://steamcommunity.com/app/606800/discussions/0/1741090666219816630/ | yes |
| S29 | Startup Company wiki "Investing" | COMMUNITY WIKI | — | https://startupcompany.fandom.com/wiki/Investing | FAILED (402); search-summary only |
| S30 | Capitalism Lab "Acquiring a Private Company" | OFFICIAL | screenshots 2017; page © 2026 | https://www.capitalismlab.com/digital-age-dlc/acquiring-private-company/ | yes |
| S31 | Capitalism Lab "Subsidiary DLC Tips and FAQ" | OFFICIAL | undated | https://www.capitalismlab.com/subsidiary-dlc/tips-and-faq/ | yes |
| S32 | Steam Mad Games Tycoon (1) developer-buyout thread | COMMUNITY | 2017-08 | https://steamcommunity.com/app/341000/discussions/0/364042262879536136 | yes |
| S33 | Steam MGT2 "Buy Competitors" | COMMUNITY | 2021-09..11 | https://steamcommunity.com/app/1342330/discussions/0/4943253385022886478/ | yes |
| S34 | MGT2 Steam News "Company Acquisitions!" | OFFICIAL | ~2022-04 | https://store.steampowered.com/news/app/1342330/view/3173358927541472594 | FAILED (shell only) |
| S35 | TEW2020 Announcement & Developer's Journal (mirror) | DEVELOPER (mirrored) | 2019–2020; mirror posts 2020-03-16 | https://bethebooker.net/thread/226/tew2020-announcement-developers-journal (pages 1–4) | yes (curl) |
| S36 | Grey Dog Software forum TEW IX journal | DEVELOPER | — | https://forum.greydogsoftware.com/topic/57253-tew-ix-announcement-developers-journal/ | FAILED (403) |
| S37 | tew2020.fandom "Your Office" (handbook) | COMMUNITY WIKI | — | https://tew2020.fandom.com/wiki/Your_Office | FAILED (402/403); search-summary only |
| S38 | Wrestlenomics, "How WWE acquired territorial video libraries — John Carlan" | PRESS (interview) | 2022-07-15 | https://wrestlenomics.com/2022/07/15/how-wwe-acquired-territorial-video-libraries-a-conversation-with-john-carlan/ | yes |
| S39 | Sirlin, "Slippery Slope and Perpetual Comeback" | DESIGN WRITING | 2014-08-11 | https://www.sirlin.net/articles/slippery-slope-and-perpetual-comeback | yes |
| S40 | The Thoughtful Gamer, "Catch-Up Mechanisms" | DESIGN WRITING | 2017-03-28 | https://thethoughtfulgamer.com/2017/03/28/catch-up-mechanisms/ | yes |
| S41 | Oakleaf Games, "Runaway Leader, Rubber Banding, and Feedback" | DESIGN WRITING | 2014-02-13 | https://oakleafgames.wordpress.com/2014/02/13/game-theory-runaway-leader-rubber-banding-and-feedback/ | yes |
| S42 | BGG geeklist "compendium of solutions to rich-gets-richer"; Medium "Catch Me If You Can" | DESIGN WRITING | — | https://boardgamegeek.com/geeklist/204332/ ; https://fantastic-factories.medium.com/... | FAILED (403) |
| S43 | Prior prose: Roadmap, Rulings, P15 package, P14 package/annex, D-16 lab, D-17B evidence | PROJECT AUTHORITY | 2026-08/09 | paths in §2 | yes (local) |

End of dossier 07.
