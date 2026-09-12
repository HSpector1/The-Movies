# Dossier 06 — Tycoon Comparators B
## Hollywood Animal, Mad Games Tycoon 1 & 2, Game Dev Tycoon, and other film/entertainment-studio management games

Evidence agent: Comparators B. Date of research: 2026-09-11. READ-ONLY; nothing in any repository was touched.
Assignment coverage: §2.R (comparators), §2.S (anti-snowball), §2.J (rival M&A), §2.K (asset sales), §2.L/§2.O (healthy-target willingness / premium), §2.N (valuation vs price), and §2.A–D (Story Property / rights / library / individual asset sales) as evidenced by comparators.

Evidence-class labels used throughout:
- **OFFICIAL** = developer/publisher text (Steam store page, Steam news/patch notes read through the official Steam news API, developer Q&A, developer's own interview answers).
- **OFFICIAL-PLANNED** = developer statement of intent that I could not confirm as shipped.
- **WIKI** = fan wiki reproducing in-game handbook or observed behaviour (secondary).
- **COMMUNITY** = Steam forum / Reddit / press player reports; used for player-experience criticism only.
- **DEV-REPLY** = a developer account replying inside a community thread.

Prior-prose status labels: CONFIRMED / QUALIFIED / CORRECTED / SUPERSEDED BY OWNER DIRECTION / NEW / N/A. "Prior prose" = P12 package §12–13, P12 builder annex source table, P13 catalogue G03–G05, P07/P09 Game Dev Tycoon entries, roadmap §20 and Owner rulings §5.

---

## 1. Scope

What this dossier answers, per comparator:
1. acquiring competitors / buying studios / publishers; 2. IP / franchise / sequel / remake ownership; 3. licensing of external IP; 4. asset sales; 5. valuation; 6. AI-rival bankruptcy and what happens to assets; 7. anti-snowball / late-game dominance criticism; 8. labels / subsidiaries.

Comparators covered: **Hollywood Animal** (Weappy, EA 10 Apr 2025, still Early Access at 0.8.72EA, 3 Aug 2026); **Mad Games Tycoon 2** (Eggcode, released 31 May 2023) with **Mad Games Tycoon (1)** by wiki only; **Game Dev Tycoon** (Greenheart Games); **The Executive – Movie Industry Tycoon** (Aniki Games / Goblinz, 11 Feb 2025) — the assignment's "The Executive (2016)" does not exist under that date as far as I could find; the 2025 title is the relevant one; **Blockbuster Inc.** (Super Sly Fox, 6 Jun 2024); **Moviehouse – The Film Studio Tycoon** (Odyssey Studios / Assemble, 5 Apr 2023); **Hollywood Mogul / Hollywood Mogul 3** (Carey DeVuono, 1994/1997/2006); **Movies Tycoon** (PixelCraze, 24 Oct 2024) and **Movie Studio Tycoon** (Steam 630440) checked and found to carry no relevant mechanics; **Total Extreme Wrestling 2020** (Grey Dog Software) for takeover-willingness and contract-transfer law.

Out of scope (Comparators A): Software Inc., GearCity, Capitalism Lab.

---

## 2. Method & sources consulted (with what failed)

**Worked**
- Steam official news API (`api.steampowered.com/ISteamNews/GetNewsForApp/v2`) for appids 2680550 (Hollywood Animal, 100 items 2024-08-28 → 2026-08-03), 1342330 (MGT2, 25 items 2021-01-26 → 2024-02-10), 1793090 (Blockbuster Inc., 38 items), 2315430 (The Executive, 23 items), 1576280 (Moviehouse, 17 items). Full text scanned for the keyword set {sequel, remake, franchise, rights, licence/license, library, acquire, takeover, subsidiary, bankrupt, competitor, cinema, IP, valuation}. Each cited announcement gives its Steam `gid`; the canonical URL form is `https://steamcommunity.com/games/<appid>/announcements/detail/<gid>`.
- Steam store pages (with age-gate cookie) for 2680550, 1342330, 1793090, 1576280, 2315430, 2659050.
- Steam community discussions fetched directly (mature-content cookie) and parsed: HA 594021502842589651, 594022012433773014, 506199960686978542, 594032586879159899, 506199960687002023, 506200114838182202, 506199960687023856; MGT2 3416558908189280598, 3374907062176295278, 3186862118586938596, 3052859736125494336, 591762021826961586, 4204742223857061022, 561358380223986764; Blockbuster Inc. 4354499321006822946, 4339861173661816357.
- Fandom MediaWiki APIs: hollywoodanimal.fandom.com (thin: 49 pages), mad-games-tycoon.fandom.com (MGT1 "Companies"), gamedevtycoon.fandom.com ("Bankruptcy", "Companies", "Contracts", "Expansion Packs"), tew2020.fandom.com ("Companies", "Your Office", "Contracts" — these reproduce the TEW 2020 in-game handbook).
- Greenheart Games forum (Discourse JSON) thread 3881 "Publisher deal & Sequel?"; Henry Jenkins blog interview with Carey DeVuono (2006-11-27); Film Stories feature (Simon Brew, 2024-05-24); Gamer Social Club review of The Executive (2025-02-08).

**Failed / degraded (noted, alternate tried once)**
- Steam guide 3464161838 (Traveler's Hollywood Animal Guide): rate-limited ("You've made too many requests recently") on two attempts → not used.
- TV Tropes (Hollywood Animal page): HTTP 403 both via WebFetch and curl → the widely repeated sequel description (prior-film performance, script quality, time since release, "shameless money grab") could only be seen in search-engine snippets → marked LOW where used.
- gamespress.com press release "How To Make a Quick Buck With a Shameless Sequel": HTTP 401; ResetEra mirror: 403 → date of the sequel trailer UNVERIFIED.
- MobyGames Hollywood Mogul page: 403 → replaced by DeVuono's own interview.
- Fandom HTML pages: Cloudflare challenge; the MediaWiki API worked instead.
- Reddit: not fetched directly; no Reddit claim is load-bearing below.
- Movie Studio Tycoon (630440): store page returned no description block and the news feed is empty → no claims made.

---

## 3. Findings

Each finding: claim → source → locator (verbatim quote) → what it proves → confidence → prior-prose status.

### 3.A Hollywood Animal (Weappy; Early Access since 2025-04-10; latest 0.8.72EA 2026-08-03)

**F1. Hollywood Animal has NO studio-acquisition mechanic; rival studios are five fixed AI studios. Player "M&A" is limited to buying cinemas (an asset class), lending money to a distressed rival, and selling/buying technology.**
- Source: Steam store page (OFFICIAL); HA fandom API `parse&page=Gerstein_Brothers` (WIKI); Steam thread 594032586879159899 (COMMUNITY).
- Locators: store page lists filmmaking "from making up plots to theater distribution", contracts, "delay a film's release to avoid competition", mafia — no acquisition claim. Wiki: "Gerstein Brothers is one of five AI-controlled film studios in Hollywood Animal, and the largest studio at the start of the game." Thread, reply by "Aston" 2025-09-08 to "How can i have all my competitors dead to buy their cinemas?": "Im not sure is it possible"; reply "Cloudhunter" 2025-09-09: "Before the beta some people tested it out and it was not possible. Success for the other studios was hardlocked, even with all their actors killed ... Then came the beta and suddenly you had reports, that the other studios were going bankrupt".
- Proves: through Aug 2026 the closest current film comparator does not let anyone buy a studio; rival failure was scripted-immune before the Aug 2025 beta and became possible afterwards. Absence of a feature in official text is inferred (no announcement in 100 news items mentions buying a studio).
- Confidence: HIGH for "no acquisition mechanic in official material"; MEDIUM for the community account of rival hard-lock/bankruptcy.
- Prior prose: NEW (P12 §12 did not address acquisition in HA).

**F2. Distressed-rival interaction exists as a lending event, not a purchase.**
- Source: Update 0.8.51EA, 2025-09-30, gid 1811772772403433 (OFFICIAL).
- Locator: "The head of Marginese Pictures used to be too shy to come borrow your money. When his studio was going bankrupt, he kept his distance. But now he has no other choice."
- Proves: HA models rival distress as a relationship/loan event with the player as creditor; there is no auction or asset transfer.
- Confidence: HIGH. Prior prose: NEW.

**F3. Cinemas are the one transferable scarce asset, and they are the dominance engine (community consensus) — rivals buy them too, and the developer treats rival buy-outs as legitimate simulation.**
- Source: beta notes 2025-08-19 gid 1808061939507988 (OFFICIAL); 0.8.67EA 2026-01-27 gid 1822556746168855 (OFFICIAL); thread 506199960686978542 (DEV-REPLY + COMMUNITY); thread 594032586879159899 (COMMUNITY); thread 506199960687023856 (COMMUNITY); thread 594022012433773014 (COMMUNITY).
- Locators: OFFICIAL: "over time, more independent cinemas appear in the game, which you can purchase." / "Competitors now buy cinemas more aggressively and go after your employees more frequently." DEV-REPLY (Weappy, 2025-04-12): "It sounds like your competitors have bought out all the independent theaters, so you got a bit unlucky with the simulation. More will be available in 1940." COMMUNITY: "Buying cinemas is basically the meta, you should be GB before them. I usually have 1500 cinemas in 1936 or so. You will practically destroy every other competitor since they can't use any cinema and will always be in deficit." (Geus, 2025-08-27); "The problem is, the more theaters you buy, the easier the game becomes ... either way after a while, money is no object." (RaphaelDelageto, 2025-04-12); "I have forced the competition to part with their cinemas by spamming police raids, bought them all out and forced insane extra costs with all alliance debuffs. They then went negative, took loans and went bankrupt when it was time to repay" (Kvadron, 2025-05-02); "I've heard that if competitors enter financial distress they may sell some theaters." (JesusLovesYou, 2025-04-15, unverified hearsay); holding cost exists: "i have 222 cinemas and have to pay 60k per month" (Cloudhunter, 2025-09-09).
- Proves: (a) an asset class that both (i) can be bought outright and (ii) gates a rival's access to the shared audience becomes an unbounded snowball; (b) maintenance cost alone did not stop it; (c) the developer's chosen anti-snowball is a **scripted structural event** rather than a price rule.
- Confidence: HIGH (official + multiple independent player reports + developer reply).
- Prior prose: QUALIFIED — P12 annex row "competitor advertising, cinema purchases, employee pursuit, alliance participation/tuning" is CONFIRMED as text, but "cinema purchases" is not a neutral participation flag: it is the game's central dominance exploit.

**F4. The developer's anti-snowball answer is a scripted "Paramount-decree" style event: Act 1 ends with every studio losing its theaters, replaced by distributors with bargaining power.**
- Source: "Act 2: Where Is the Game Heading?" 2026-04-30 gid 1831432155569742 (OFFICIAL-PLANNED); thread 594032586879159899 OP (COMMUNITY).
- Locators: "Act 1 ended with you and your competitors losing your theaters. That means a new force has entered the game: distributors. Each with their own interests, character, and weight in the industry. Every release now involves tough negotiations ... By default, the distributor holds the stronger position." COMMUNITY OP: "it's so grief when everything was going very well and this cinema buy out story begin."
- Proves: HA resets the snowball by removing the asset class from everyone symmetrically; players who built the dominance engine experienced this as punitive.
- Confidence: HIGH that this is the stated plan; Act 2 not shipped as of 2026-08-03 (no release announcement in feed).
- Prior prose: NEW.

**F5. Sequels shipped at Early Access launch; a sequel is derived from a released film, throttled to one in flight, and (per secondary sources) judged on prior-film performance, script quality and elapsed time; story elements "wear out" with reuse.**
- Source: thread 594021502842589651 OP 2025-04-26 (COMMUNITY, describes rules as experienced); patch notes 0.8.56EA 2025-10-23 gid 1814309641439953, Mac update 2025-11-04 gid 1815034433033874, Factory Policy Update 2025-11-20 gid 1816849002011010 (OFFICIAL); beta notes 2025-08-19 (OFFICIAL); Q&A 2024-11-11 gid 6148070194801732730 (OFFICIAL).
- Locators: COMMUNITY: "A film must have been shown to start a sequel and only 1 sequel can be in production at a time, including writing, production, and release." OFFICIAL: "Fixed a bug which prevented you from submitting a sequel film for the Pollux Award."; "Fixed multiple issues related to the sequel system."; "Minor improvements to the sequel system and Pollux algorithms." OFFICIAL (wear): "After a certain point in the game, story elements will begin to 'wear out,' meaning audiences will lose interest in characters and events you use too often." OFFICIAL Q&A on franchises: "Pick 'Protagonist Dies Heroically' for the ending and then don't bring them back for the sequel, and voilà, they're dead!"
- The often-quoted three factors (previous instalment performance, sequel script quality, time since previous release; reviews call it a "shameless money grab") come from TV Tropes and search snippets only → LOW.
- Proves: a film-studio comparator treats the sequel right as flowing automatically from the studio's own released film (no separate "rights" object), with pacing and fatigue as the only brakes.
- Confidence: HIGH that a sequel system exists and is gated on a released film; MEDIUM for the one-at-a-time throttle; LOW for the three-factor formula.
- Prior prose: NEW.

**F6. Licensing external stories (books/comics/radio) was PROMISED for "one of the first major updates" but no shipped mention exists through 2026-08-03; TV catalog licensing is announced for Act 2 as a per-catalog or per-deal choice, opt-out allowed.**
- Source: Q&A 2024-11-11 gid 6148070194801732730 (OFFICIAL-PLANNED); Act 2 post 2026-04-30 (OFFICIAL-PLANNED); keyword scan of all 100 news items for book/comic/radio/adapt/novel (none in patch notes).
- Locators: "we plan to add franchises in one of the first major updates during Early Access, and yes, you will be able to licence books/comics/radio shows and adapt them into films." / "Truly beloved pictures can live on television for decades. If you unlock enough upgrades, you'll gain maximum flexibility: you can license your entire catalog to some TV network (each with its own specialization) for years ahead and keep things simple, or manage each deal individually to maximize returns. Or you can take a principled stance and keep your films exclusively as a theatrical experience".
- Proves: (a) even a large team defers external-IP licensing; (b) the planned library-revenue design matches the Owner's C-principle exactly — library cash appears only when a TV/media system exists, is time-bounded ("for years ahead"), and offers a coarse (whole-catalog) vs granular (per-deal) choice.
- Confidence: HIGH as statements; UNVERIFIED as shipped.
- Prior prose: NEW; supports roadmap §20 "home media, television, streaming ... later revenue channels" deferral.

**F7. Technology is buyable/sellable/licensable and obsolescent; a company can sell its own invention to rivals.**
- Source: "New mechanics and features" 2024-08-28 gid 6240387642450806861; Q&A 2024-11-11; beta notes 2025-08-19; Factory Policy Update 2025-11-20 (all OFFICIAL).
- Locators: "Then you can decide whether to sell your miracle invention to your competitors, or favor a long-term advantage over an immediate profit." / "You can buy technology from companies that specialize in it." / "Filming and sound recording equipment now becomes obsolete: after some time, manufacturers stop supporting old technologies, so you need to invest in licensing new ones — or develop your own." / "Fixed a bug which allowed you to purchase a technology that was about to become obsolete."
- Proves: a film comparator separates *knowledge/right to use* (licensed, purchasable, obsolescent) from physical installation cost, and treats selling a proprietary technology as a strategic trade-off.
- Confidence: HIGH. Prior prose: CONFIRMED/QUALIFIED — P13 catalogue G03 quoted the cancel line; the date the catalogue "could not confirm" is **2026-08-03, Update 0.8.72EA** (news-API gid 1839676055894386; the catalogue's own URL id 688638619235125213 resolves to the same announcement, page title "Steam :: Hollywood Animal :: Update 0.8.72EA", and the sentence "You can now cancel the following processes: creating or upgrading technology, researching story elements, writing a script." occurs in no other item of the 100-item feed).

**F8. Contract law in HA: early termination with partial recovery of contract cost; instant poaching via compromising material exposes the poacher to a lawsuit; a "Retribution" upgrade lets you sue whoever attacked your staff.**
- Source: beta notes 2025-08-19; 0.8.72EA 2026-08-03 (OFFICIAL).
- Locators: "you can now terminate employee contracts early and even recover part of the contract cost"; "Compromising material now allows you to instantly poach an employee from another studio without waiting for their current contract to expire. However, studios may sue you for unfair competition."; "Added the Retribution upgrade. It lets you sue whoever ordered a beating, kidnapping, or murder on your employees."
- Proves: comparator precedent for "ordinary termination law" with a priced exit, and for symmetric legal consequences.
- Confidence: HIGH. Prior prose: CONFIRMED (P12 §12 "instant blackmail-based poaching exception" + "competitors poaching player employees").

**F9. Late-game dominance criticism (COMMUNITY): money becomes "no object" by ~1937; the loop becomes repetitive; the theater bottleneck is the only late constraint.**
- Source: thread 506200114838182202 OP 2025-04-14; thread 506199960687002023 reply 2025-04-12 (COMMUNITY).
- Locators: "Got to 1937 or so, 60m in the bank. The game needs a different type of balancing ... I'm curious what happens later in the game ... how do we avoid doing the same thing every year, it's too repetitive." / "after you can buy theatres, you game is over. Near the end of the scene I get 900M in my balance".
- Proves: player-experience evidence that unbounded asset accumulation collapses challenge; useful for §2.S.
- Confidence: MEDIUM (multiple concurring posts, early-EA balance). Prior prose: NEW.

**F10. Scripts are purchasable from a market (a "purchase scripts" pool) — the nearest HA analogue to buying a Story Property.**
- Source: Update 0.8.60EA 2025-11-21 gid 1816849002013995; beta 0.8.50.13EA 2025-09-04 (OFFICIAL).
- Locators: "Fixed a bug that prevented new purchase scripts from appearing."; "Fixed an issue where scripts for sale could have zero scores."
- Proves: HA has a market of externally written scripts bought outright; nothing indicates residual rights for the seller.
- Confidence: HIGH. Prior prose: NEW.

### 3.B Mad Games Tycoon 2 (Eggcode; EA Jan 2021, 1.0 on 2023-05-31) — the richest M&A comparator

**F11. Competitor acquisition shipped 2022-03-01 (basic form), announced 2022-04-28; bought companies become directed subsidiaries; IPs can be moved between owner and subsidiaries.**
- Source: "Company Acquisitions!" 2022-04-28 gid 4348798430274738151 (OFFICIAL); store page (OFFICIAL).
- Locators: "You can now buy your competitors! ... Once purchased you have many options to control their decision making process. You can tell them what genres and topics to develop for, what consoles to focus on, whether to develop exclusively for your own consoles, what game engines to use, and how long to spend developing their games. You can also make them prioritize certain IPs, set how much they pay per copy to publish games (or publish their games for them!)"; patch line "BUILD 2022.03.01A — Buying NPC companies is now available in its basic form."; "'Subsidiaries Menu': You can now move IPs to you or subsidiaries."; store: "With up to 100 competing companies, once you begin to get the upper hand on the competition you can buy them ... give them specific guidelines on what kind of games you want them to make, or if you choose, just take all their IPs and shut them down completely".
- Proves: MGT2 implements the assignment's MODEL B (autonomous subsidiary) plus an "absorb the IP and shut it down" exit, i.e. a runtime version of MODEL D's "Absorb Completely".
- Confidence: HIGH. Prior prose: NEW.

**F12. Anti-snowball rules on acquisition are explicit and simple: a purchase lock-out window after founding, platform holders never for sale, difficulty bonuses removed on purchase, a visible company value, and expensive upkeep.**
- Source: 2022-04-28 post (OFFICIAL); 2023-04-20 Development Update gid 5133583099794633322 (OFFICIAL); thread 3416558908189280598 (COMMUNITY); thread 3186862118586938596 (COMMUNITY).
- Locators: OFFICIAL: "NPC companies are now locked for a certain amount of time until you can buy them."; "Once an NPC company is purchased, difficulty bonuses or deductions are disabled."; "Publisher & Developer Menu: You can now hide companies that are not for sale."; "NPC-Companys: Calculation of the company value revised."; "BUG: Company value of NPC studios could increase infinitely."; "BALANCE: Company values raised on low difficulty levels." COMMUNITY (Kyouko Tsukino 2022-06-29): "all companies have a 2-year window where they can't be bought ... Companies that have platforms assigned to them (Sega, Atari, Nintendo, Sony...) can't be ever bought"; "They're also very expensive by default ... you'll most likely not see any actual profit from subsidiaries until the 2000s and beyond." COMMUNITY (semaj9001 2022-02-07): console makers "are listed as 'not for sale' rather than having a visible valuation."
- Proves: MGT2 exposes a single visible **company value** as the price and uses categorical "not for sale" plus a time lock rather than a bargaining sim; upkeep, not price, is the operating brake.
- Confidence: HIGH (official) / MEDIUM (2-year figure, community).
- Prior prose: NEW; relevant to §2.L ("no hidden fixed multiplier") — MGT2 is the counter-example: a fixed visible price, no refusal.

**F13. AI rivals cannot be bought or bankrupted through economics; closure is scripted from historical data; they can be re-opened by purchase; the player community calls them "immovable objects".**
- Source: Development Update 2023-08-24 gid 5141475722326763113 (OFFICIAL); Development Update 2024-01-17 gid 5510784213094558022 (OFFICIAL); threads 3186862118586938596, 4204742223857061022, 591762021826961586 (COMMUNITY).
- Locators: OFFICIAL: "NPC developers are now closed after historical data (can be disabled in startup options)."; "BUG: Closed game studios have bought IPs."; "BUG: Closed companies offered contract work." COMMUNITY (Kyouko Tsukino 2022-02-06): "As companies are now, I don't care about buying any of them. They're invincible, godmodding entities that don't go through development processes or research or engine creation."; (2024-02-07): "They just have plot armor and will not go out of business no matter how bad their games are ... any NPC studio that closes down does so because an end date is specified in the game files."; (2025-01-31): "The ones that 'close down' only do so because there's a set time in a file ... they won't vanish and can be bought and re-opened if you so wish."
- Proves: MGT2 has no rival-bankruptcy asset flow in single player; acquisitions therefore have no distressed-price tier; players perceive purchase as "collecting".
- Confidence: HIGH. Prior prose: NEW.

**F14. Subsidiaries are simulated by a timer, not by a real pipeline; their output is randomized; players report them as a money sink whose real value is (a) removing competition, (b) harvesting IPs, (c) captive publishing terms.**
- Source: threads 3416558908189280598 (2022-06-29), 591762021826961586 (2025-01-31/02-14), 4204742223857061022 (2024-02-07/08), 561358380223986764 (2024-12-16) (COMMUNITY).
- Locators: "The 'progress bar' is actually a timer ruled by both the development time you set in their options, and the [SPEED] value in the Publisher.txt file ... There are no employees working on games there, just a timer emulating that." (Kyouko Tsukino); "This is a totally random popup by RNG ... it's a fiction" (GrandeLS); "having a lot of them can sink your company faster than Sega's decision-making skills did to them in the nineties" (Kyouko Tsukino); counter-report: "Last year in 2012, Subsidiaries cost me $20,156,000 and the income was $57,724,300!" (MikeNevo, legendary difficulty); "I bought them just to avoid competition ... I buy, I close, that'll be simple." (P'tit Serpent); "you can gut them of the IPs they own ... You can sell the company after you buy it, to make it disappear, I think. Only after you gut the IPs from them." (JD_Mortal).
- Proves: an autonomous-subsidiary model that is not backed by a real conserved simulation reads as fiction and becomes either a chore or a strip-mining tool; the durable value players extract is IP + market removal, not operation.
- Confidence: MEDIUM-HIGH (consistent multi-year reports; one dissent on profitability).
- Prior prose: NEW; strongly supports the Owner's rejection of MODEL B.

**F15. IP is a first-class tradable asset with a visible value: IP rating grows with quality/awards, all games under an IP influence each other, IPs can be bought and sold "if you need some extra cash", IP value scales with year, sequel/spinoff hype was nerfed, bankruptcy (multiplayer) lowers fans and IP values.**
- Source: anniversary post 2022-01-21 gid 4237325463675656030; patch notes 2021-05-28 gid 4069544815359781322; 2022-04-28 post; 2023-04-20 post; store page (all OFFICIAL).
- Locators: "Games now have an IP rating. - Do you want to build the next great game franchise? Now you can! The IP rating of a game grows as you release better and better games. If you happen to sweep the Year End awards you'll see your game IP get massive gains ... All the big IPs compete on a top 100 chart, with the biggest IPs getting boost to their game sales and merchandise sales. There is also an IP menu listing the history of each of your IPs"; "IP system added: All games of the IP influence each other."; "Buying and selling of IPs — If you need some extra cash, or if there is an IP you would really like to own you have the option to buy and sell IPs. This is in addition to the already existing feature allowing you to transfer IPs from subsidiaries you own."; "The value of IPs now scales with the current year."; "All lists with IPs now also show the value of the IP."; "BALANCE: Hype for sequels and spinoffs reduced."; "BUG: (Multiplayer) If you had to go bankrupt, fans and IP values were increased instead of decreased."; store: "Sell IPs you have let become dormant or buy popular IPs from other companies".
- Proves: a shipped, legible model in which (a) the IP (Story-Property analogue) is the root and each release (sequel, spin-off, remaster, GOTY, bundle) is a child that feeds the root's value, (b) IP value is shown, (c) sale is framed as a *distress liquidity* action, (d) year-scaling prevents early-era IPs from being priced like modern ones.
- Confidence: HIGH. Prior prose: NEW.

**F16. External-IP licensing is a consumable, per-game purchase with genre fit and rising cost; NPCs also license; licenses can be sold; multiple media types.**
- Source: patch notes 2021-03-08 gid 4057152305727721555, 2021-09-08 gid 4020014731791976970, 2021-11-05 gid 4186652991113913673, 2021-12-22 gid 4224938027296499338, 2022-09-27 gid 4589754330749384797, 2023-04-20, 2024-01-17; store page (all OFFICIAL).
- Locators: "BUG: Only a few movie licenses were offered."; "BALANCE: Licenses are now much more expensive."; "NPCs now use licenses for their games."; "BUG: It was possible to use licenses more than once."; "Licenses now have one suitable and one unsuitable genre. This can also have a negative impact on sales."; "Added three more types for licenses: Comics, Board Games and Toys."; "Licenses become more expensive over time."; "Licenses are now included in the game rating."; "(Sell licenses menu) Search function added."; store: "Buy popular licenses from things such as books, toys, movies and sports".
- Proves: the smallest working licensing model in a shipped tycoon: one license = one production use, priced by era, with a fit modifier; no territories, no terms, no exclusivity.
- Confidence: HIGH. Prior prose: NEW.

**F17. Mad Games Tycoon (1) already allowed buying competitor developers and closing them.**
- Source: mad-games-tycoon.fandom.com `parse&page=Companies` (WIKI).
- Locator: "Competitors are other companies that also develop games on their own. They may ask you to publish their games and you can also buy those companies to let them develop for you. You can also close them when you own them."
- Proves: the buy → direct → close pattern predates MGT2. Confidence: MEDIUM (wiki). Prior prose: NEW.

**F18. MGT2 community design debate anticipated the assignment's own questions (debt vs cash transfer, bidding windows, relationship-gated willingness) — none of these were shipped; the shipped model is "pay the visible value, own it".**
- Source: thread 3186862118586938596 (2022-02-06/07) and 3052859736125494336 (2021-06/2022-02) (COMMUNITY suggestions, explicitly pre-release).
- Locators: "Why would we be given their debts but not their positive balances? We also don't get their employees or buildings" (Sol); "I think the delay could be interesting if there were a mechanic added that you put a bid in for a company, and there is a time frame where other companies ... also could put a bid in ... Then in 3 to 6 months the highest bid wins." (Panda); "require 3 hearts 'relationship' to buy a company, and have buyout/takeover reduce 1 hearts from every company" (Sol). The widely quoted "After a buyout you will take on ALL the company's debt" originates in the player suggestion thread 3052859736125494336, **not** in shipped behaviour.
- Proves: the claim that MGT2 transfers debt is UNVERIFIED as shipped and should not be cited as a comparator fact.
- Confidence: HIGH that these are suggestions; UNVERIFIED for shipped debt transfer.
- Prior prose: N/A (CORRECTS a plausible misreading if any later dossier cites it).

### 3.C Game Dev Tycoon (Greenheart Games, 2012–)

**F19. No rivals, no acquisitions, no IP market; bankruptcy is game-over with narrative-only library transfer to a behemoth.**
- Source: greenheartgames.com/app/game-dev-tycoon/ (OFFICIAL feature list); gamedevtycoon.fandom.com `Bankruptcy` and `Companies` (WIKI).
- Locators: official list mentions only "Create best selling games. Research new technologies and invent new game types ... Hire staff, train them ... Unlock labs" — no competitors/acquisition/IP wording. WIKI game-over text: "We have just got confirmation that (COMPANY NAME), which has been in financial trouble lately, has gone bankrupt. It appears that Electronic Mass Productions/Stygnya, a behemoth in the gaming industry, has purchased the remains of the company." / "'We are very excited to have acquired the rights to all of (COMPANY NAME)'s previously released titles'."
- Proves: GDT confirms the assignment's suspicion ("Game Dev Tycoon: none? verify") — there is nothing to borrow mechanically; the one relevant idea is that a bankrupt studio's *library rights* are what a buyer wants, stated as flavour.
- Confidence: HIGH. Prior prose: CONFIRMED (P07/P09 used GDT only for post-release report and sparse start; nothing claimed about M&A).

**F20. Sequel/expansion ownership in GDT: the developer keeps the series; a publisher deal covers the first title only; sequels must be self-published (community, developer-forum consensus, not staff).**
- Source: forum.greenheartgames.com thread 3881 (2013-05-15/16) (COMMUNITY); wiki `Expansion Packs` (WIKI).
- Locators: OP: "it seems I can't have a publisher deal for a sequel"; jimmmartens (non-staff): "Short answer: No. Long answer: Still no. You are missing nothing."; Lynx: "it would be nice to some complexity in sequels from publishers, some option like: product sequel with same publisher, or buyout the rights to francise". Wiki: "Expansion packs ... are still part of the original MMO."
- Proves: the simplest possible rights model (creator owns the property; distribution deal is per release) is legible and accepted; players themselves asked for a "buy out the rights to franchise" option.
- Confidence: MEDIUM (consistent community statements; no official rule text). Prior prose: NEW.

### 3.D The Executive – Movie Industry Tycoon (Aniki Games / Goblinz; released 2025-02-11)

**F21. The closest shipped film comparator to the Owner's P16/P17 direction: franchises with fatigue, an IP marketplace for adapting spoofed external properties (with conditions and forfeiture), IP sale for cash, and back-catalog monetisation through home-entertainment distributor deals. No rival studios to acquire — competition is a list of competing releases.**
- Source: Steam store 2315430 (OFFICIAL); patch notes 1.1.0 2025-03-13 gid 1794102528076260, 1.1.2 2025-03-21 gid 1794830910910996, 1.3.0 2025-06-15 gid 1802354289661571, 1.0.3 2025-02-14 gid 1791580426006306, 1.1.1 2025-03-14 gid 1794102528117871 (OFFICIAL); Gamer Social Club review 2025-02-08 (COMMUNITY/press).
- Locators: store: "Turn your biggest hits into long-lasting franchises! Create sequels, prequels, reboots, and even spinoffs to capitalize on audience demand. But beware: too many installments can lead to franchise fatigue."; "MONETIZE YOUR BACK CATALOG — Don't let your past successes collect dust. Manage your studio's library and maximize ancillary revenue with strategic home entertainment deals. Partner with distributors who are the best fit for your catalog, and invest in add-ons to boost sales." 1.1.0: "With the IP Marketplace, you can acquire the rights to iconic (spoofed) novels, TV shows, video games, and more ... 700+ spoofed IPs ... 6 different media sources: Cartoons, Graphic Novels, Manga/Anime, Novels, TV Shows, and Video Games. Invest in powerful new IPs – with a catch! The most valuable IPs come with tough conditions. Fail three times, and you lose the IP." 1.1.2: "Franchise Fatigue Decay Rate has been increased. Some of you noticed ... you had to wait way too long between 2 sequels". 1.3.0: "Sell Your IPs — Need a cash injection? You can now sell intellectual properties you've created or acquired, opening up fresh strategies for making money." 1.0.3: "competitor movies are now procedurally generated rather than based on real events". 1.1.1: "Book Value Stuck at 0 – A previous patch unintentionally caused studio book values to remain at 0." 1.0.4: "Updated tooltips to better explain the difference between IP and Franchise." Press: "Home entertainment to be a great stream of passive revenue, including for movies that weren't hits on their release."
- Proves: (a) a two-level structure (IP → Franchise → films) was needed for player comprehension; (b) externally sourced rights carry obligations and can be forfeited (use-it-or-lose-it), which is a simple legible alternative to expiring licenses; (c) library revenue is produced only through a distribution-deal system, per the Owner's C-principle; (d) a separate "studio book value" figure exists alongside cash; (e) IP sale is framed as a liquidity lever.
- Confidence: HIGH (official). Prior prose: NEW (this game is absent from all prior Project: Studio prose).

### 3.E Blockbuster Inc. (Super Sly Fox; 2024-06-06)

**F22. Passive equity stakes ("buy shares from other studios") pay a quarterly revenue share, do not remove the rival, were disabled for balance because the game was too easy, are lost if the rival goes bankrupt, and the player's own shares became unsellable; rival bankruptcy pauses the rival for a year and then it returns.**
- Source: store page 1793090 (OFFICIAL); Patch 1.9.0 2024-10-28 gid 6212245217911958737 (OFFICIAL); thread 4354499321006822946 (DEV-REPLY 2024-06-23); thread 4339861173661816357 (COMMUNITY 2024-06-08).
- Locators: store: "You can choose working hours, buy shares from other studios, take loans, decide on the marketing and so much more!" 1.9.0: "Bankruptcy Mechanic: Rival studios can go bankrupt, pausing operations for a year before returning. Shared Consumer Pool: A new, limited sales pool (starting at 1M in 1920) grows over time, creating competition for sales among studios."; "studio shares now work properly and bring back a portion of the original studio's revenue every quarter. If that studio goes bankrupt, you lose the shares you bought from them. You can sell back the shares of other studios but you can no longer sell your own studio's shares, as this could often cause a disadvantage that was hard to recover from". DEV-REPLY (Super Sly Fox): "We are currently rebalancing some economic parts so this is disabled for now as the game was too easy. We will bring the money from shares back soon!" COMMUNITY: "I'm in 1928 and have over 600 million dollars, I have 100% shares in every company and the top 6 slots in the Star Charts are all my people. It feels like I've completed the game"; "I've purchased shares of every other studio, and have zero consequence".
- Proves: ownership stakes without control or obligations are a pure money faucet and an early-snowball accelerator; the fix was to switch them off; bankruptcy is a *pause*, with equity wiped — a shipped example of value evaporating in distress.
- Confidence: HIGH. Prior prose: QUALIFIED — roadmap §20 lists "ownership stakes" as a P16 candidate; Blockbuster Inc. is direct evidence that passive stakes need obligations or should be dropped. P13 catalogue G05 ("build, decorate, set creation" only) is CONFIRMED and unaffected.

### 3.F Moviehouse – The Film Studio Tycoon (Odyssey Studios / Assemble; 2023-04-05)

**F23. Sequels/prequels/cinematic universes are unlocks; home-media distribution is a deliberately small secondary revenue that consumes a distribution slot; no rival acquisition.**
- Source: announcement 2022-06-14 and 2021-04-07 (OFFICIAL); Patch #2 2023-04-10 gid 5121196841302956539 (OFFICIAL).
- Locators: "Unlock sequels, prequels, cinematic universes and more."; "Fixed issue where media types would produce far too much profit given their customer base (Videotape, Video Discs), these distributions should now produce a slight secondary source of profit with the trade of having to use up a distribution slot as intended."
- Proves: a second film comparator that bounds library/home-media income by capacity (slots) rather than by a perpetual weekly trickle.
- Confidence: HIGH. Prior prose: CONFIRMED that P13 catalogue G04 treated the Moviehouse guide as a pinned forum topic; nothing else claimed.

### 3.G Hollywood Mogul / Hollywood Mogul 3 (Carey DeVuono; 1994 DOS, 1997 Windows, HM3 2006)

**F24. Source material is bought per category (13 categories including Comic Book, TV Show, Original Screenplay); talent can be contracted for sequels at fixed terms; AI studios draw from the same source and talent pools.**
- Source: Henry Jenkins blog interview with DeVuono, 2006-11-27 (OFFICIAL — developer's own words); Film Stories feature (Simon Brew, 2024-05-24) (press).
- Locators: "There are 13 source material categories. So your studio can purchase a Comic Book, or a TV Show, or an Original Screenplay."; "HM3 has computer AI studios competing against you, with all of you pulling from the same source and talent pools."; "You can make Production Deals with talent, you can contract them for sequels at specific terms". Film Stories: "What happens when that sure-fire sequel sinks?"
- Proves: the oldest film-mogul design already separates *source property purchase* from *production*, and treats the property pool as shared and contested by AI — a natural, non-arbitrary anti-snowball (rivals buy the good properties too).
- Confidence: HIGH for HM3 features; MEDIUM for 1990s versions (not separately verified). Prior prose: NEW.

### 3.H Total Extreme Wrestling 2020 (Grey Dog Software) — takeover willingness and transfer law

**F25. Takeover acceptance is driven by the target's run of consecutive negative-balance months plus owner personality and relationship with the aggressor; a target can refuse even when distressed; taken-over companies become child companies whose bank balance is absorbed monthly by the parent; written-contract releases cost six months' pay.**
- Source: tew2020.fandom.com `Companies`, `Your Office`, `Contracts` (WIKI reproducing the in-game handbook).
- Locators: "A company's financial performance is also key in whether they will accept a takeover attempt. As with bankruptcy, the amount of debt is not relevant, all that matter is how many consecutive times they have ended the month with a negative bank balance. Please bear in mind that finances are only part of the takeover process, some companies will refuse to be taken over even if they're in bad financial shape because of their owner's personality, their relationship with the aggressor, etc."; "it is impossible for child companies to go bankrupt as their bank balance returns to zero every month (because their parent absorbs their bank balance)"; "A Purchased owner means they bought the company outright."; "you can try and takeover an existing company (by going to that company's profile and choosing Contact)"; "If a company releases a worker from a written contract then they must pay them compensation ... the compensation amount is their next six months' worth of monthly pay; if they have less than six months remaining on their contract then they only get that amount."
- Proves: a shipped, legible willingness model with three visible drivers (distress streak, owner temperament, relationship) and an explicit refusal right; a shipped answer to "does acquired cash become buyer cash" (yes, swept monthly); a shipped ordinary-termination cost rule.
- Confidence: MEDIUM-HIGH (handbook text via wiki). Prior prose: NEW.

### 3.I Movies Tycoon (PixelCraze, 2024-10-24) and Movie Studio Tycoon

**F26.** Movies Tycoon's store description covers studio building, talent scouting ("recruit them before your competitors do") and a character creator; it names no sequel, rights, library or acquisition mechanics. Movie Studio Tycoon returned no description and has no news feed. Confidence: HIGH for "nothing claimed"; nothing to borrow. Prior prose: N/A.

---

## 4. Cross-comparator answers to the eight questions

| Question | HA | MGT2 | GDT | The Executive | Blockbuster Inc. | Moviehouse | HM3 | TEW 2020 |
|---|---|---|---|---|---|---|---|---|
| 1 Acquire competitors | No (cinemas only; lend to distressed rival) | Yes: buy at visible company value → subsidiary or strip-and-close | No | No (rivals = release list) | Equity stakes only (rival keeps operating) | No | No | Yes: takeover if willing; becomes child company |
| 2 IP / sequel ownership | Sequel flows from own released film; wear-out | IP root with rating; all releases feed it; IP tradable | Creator keeps series; publisher deal per title | IP → Franchise → films; fatigue | n/a | Sequels as unlocks | Talent contracted for sequels | n/a |
| 3 External licensing | Promised (books/comics/radio), not observed shipped | Per-game consumable license; fit; rising price; sellable | No | IP marketplace with conditions & forfeiture | No | No | Buy source material by category | n/a |
| 4 Asset sales | Sell own technology; (cinemas buy; sell unverified) | Sell IPs; sell licenses; shut/sell subsidiaries | No | Sell IPs | Sell back rival shares; own shares locked | No | n/a | n/a |
| 5 Valuation | none visible | visible company value; IP value (year-scaled) | none | "book value" stat exists | none | none | none | financial streak + personality |
| 6 AI bankruptcy → assets | Post-beta rivals can go bankrupt (community); no auction; rival borrows from player | No economic bankruptcy; scripted closure; reopen by purchase | n/a | n/a | Pause one year, return; shareholders lose shares | n/a | n/a | Bankruptcy after N negative months; grace year |
| 7 Snowball criticism | Cinemas = meta; money "no object"; dev reset via decree | "immovable" rivals; subsidiaries a sink; collecting | n/a | none found | "billionaire in the 1920s"; dividends disabled | n/a | n/a | misc costs "rein them in" |
| 8 Labels / subsidiaries | none | directed subsidiaries (timer-simulated) | none | none | none | none | none | child companies with CEO/booker |

---

## 5. Design implications for P16 — labelled INFERENCE (my reading of the evidence, not Owner direction)

1. **INFERENCE — Model B (autonomous subsidiary) is the comparator failure mode.** MGT2 is the only comparator that shipped it at scale, and its players describe it as a timer-driven fiction that is either a money sink or a strip-mining tool (F14). The Owner's preference for one managed company with an optional retained label (Model C/D) is consistent with what players actually valued in MGT2: the IPs, the market removal, and captive publishing terms — none of which require a second operated studio.

2. **INFERENCE — the "prize" of an acquisition should be Story Properties, library rights and knowledge, with a legible one-screen bundle.** Every comparator that made acquisition interesting did so through transferable IP (MGT2 F11/F15, The Executive F21, GDT flavour F19). None made buildings or lots the prize. This supports §2.F/§2.G: physical property as a liquidation line, not a second lot.

3. **INFERENCE — never let an acquisition or asset class grant exclusive access to the shared audience channel.** Hollywood Animal's cinemas (F3/F4) show that a purchasable asset that also starves rivals produces an unbounded snowball that only a scripted decree could reset. P16 asset sales and acquisitions should transfer rights/knowledge/cash, not screen or market capacity; P15's shared-market pressure should remain symmetric.

4. **INFERENCE — passive ownership stakes should be dropped or given obligations.** Blockbuster Inc. (F22) shows stakes without control become a faucet that the developer had to switch off. Roadmap §20's "ownership stakes" candidate should be QUALIFIED: either no stakes in P16, or stakes that carry board/veto obligations later (not recommended now).

5. **INFERENCE — healthy-target willingness can be three visible inputs and a refusal right, no bargaining sim.** TEW 2020 (F25) is a shipped precedent for §2.L/§2.O: (i) financial streak (distress), (ii) owner disposition (independence preference), (iii) relationship with the bidder. MGT2's alternative — fixed visible value, no refusal (F12) — reads as "collecting" (F13). Recommend the TEW shape with price as a strong fourth input, and show the reason for refusal.

6. **INFERENCE — keep three numbers distinct and show two of them.** MGT2 shows a company value and an IP value (year-scaled) side by side (F12/F15); The Executive tracks a separate studio "book value" (F21). No comparator collapses book, enterprise and price into one number and none shows a hidden multiplier. This supports §2.N.

7. **INFERENCE — distressed-sale value should be able to evaporate.** Blockbuster Inc. wipes shareholders on bankruptcy; TEW treats streaks, not debt size, as the trigger; MGT2 (multiplayer) reduces fans and IP values on bankruptcy (F15). For §2.M: an asset auction where lots are priced from the property's own history (IP value) rather than the seller's book value is both simple and precedent-backed.

8. **INFERENCE — the smallest useful rights bundle is two objects and one flag.** Comparators converge on: a root property (MGT2 "IP", The Executive "IP", HM3 "source material"), the derived releases (films / franchise installments), and a fit-or-obligation on externally sourced properties (MGT2 suitable/unsuitable genre + single use; The Executive's "tough conditions, fail three times and you lose the IP"). No comparator needed territories, exclusivity tiers or terms to be fun. Time-limited licensing appears only in HA's *planned* TV-catalog system (F6), i.e. it belongs to P18, not P16.

9. **INFERENCE — sequel entitlement should be derived from ownership of the Story Property and released film, throttled by pacing/fatigue, exactly as HA (F5) and The Executive (F21) do; P17 should read P16 truth.** Fatigue tuning was the most patched balance item in The Executive — expect iteration, keep the rule visible.

10. **INFERENCE — library cash only through a downstream system, and bounded.** HA's plan (license whole catalog vs per-deal, or opt out), The Executive's distributor deals, and Moviehouse's slot-limited home media all tie library income to a media/distribution object. Historical/strategic value (valuation input, sequel eligibility) can exist in P16 without any cash flow — matches Owner C.

11. **INFERENCE — natural anti-snowball levers that comparators actually shipped:** purchase lock-out window after founding (MGT2), categorical not-for-sale classes (MGT2 platform holders), upkeep on acquired assets (MGT2 subsidiaries, HA cinema maintenance), shared contested pools where rivals also buy (HM3 source/talent pools), relationship/disposition refusal (TEW), value wiped in distress (Blockbuster). None used antitrust; HA used a scripted decree, which players resented — supports §2.S "no artificial caps first".

12. **INFERENCE — rival symmetry is cheap when rivals already buy assets.** HA rivals buy cinemas and poach (F3, F8); MGT2 NPCs license and prioritise successors (F16); HM3 AI buys from the same pool (F24). A rival that can bid on a distressed lot with the same law is the comparator norm; a rival that can never be bought or fail (MGT2 F13) is the trust failure.

13. **INFERENCE — termination law after acquisition:** HA (early termination with partial cost recovery) and TEW (six months' pay) show priced, symmetric release; supports §2.F(4) with P14's existing contract law as the substrate.

---

## 6. Open questions

1. Whether Hollywood Animal's promised book/comic/radio licensing has shipped under a name my keyword scan missed (no patch note through 2026-08-03 mentions it). UNVERIFIED.
2. Whether HA rivals can sell cinemas when distressed (single community hearsay, F3) — would be the only comparator example of a rival selling assets under distress outside auction.
3. The exact HA sequel evaluation inputs (three-factor description is TV Tropes-only; site blocked).
4. MGT2: whether subsidiary cash/debt transfers at purchase in shipped 1.x (community says NPCs have no meaningful balance; the "you take on all debt" line is a suggestion, F18).
5. The Executive: how "studio book value" is computed and whether IP sale price is derived from franchise performance (patch notes name the features, not the formulas).
6. TEW: the numeric takeover price and how relationship is scored (handbook text describes drivers, not values).
7. Whether any comparator lets an AI rival acquire another AI rival (none found; MGT2 players hoped for it — "AI companies will certainly be able to buy other companies. I hope they won't do that too aggressively" — but no patch note confirms it). Relevant to §2.J.

---

## 7. Source table

| # | Source | Class | Locator | Used for |
|---|---|---|---|---|
| S1 | Hollywood Animal store page | OFFICIAL | https://store.steampowered.com/app/2680550/Hollywood_Animal/ (EA 10 Apr 2025) | F1 |
| S2 | HA news API feed | OFFICIAL | `api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=2680550` (100 items) | all HA patch quotes |
| S3 | HA "New mechanics and features" 2024-08-28 | OFFICIAL | steamcommunity.com/games/2680550/announcements/detail/6240387642450806861 | F7 |
| S4 | HA developer Q&A 2024-11-11 | OFFICIAL | .../detail/6148070194801732730 | F5, F6, F7 |
| S5 | HA beta notes "The Stuff That Dreams Are Made Of" 2025-08-19 | OFFICIAL | .../detail/1808061939507988 | F3, F5, F7, F8 |
| S6 | HA Update 0.8.51EA 2025-09-30 | OFFICIAL | .../detail/1811772772403433 | F2 |
| S7 | HA Update 0.8.56EA 2025-10-23 | OFFICIAL | .../detail/1814309641439953 | F5 |
| S8 | HA Mac release notes 2025-11-04 | OFFICIAL | .../detail/1815034433033874 | F5 |
| S9 | HA Factory Policy Update 2025-11-20 | OFFICIAL | .../detail/1816849002011010 | F5, F7 |
| S10 | HA Update 0.8.60EA 2025-11-21 | OFFICIAL | .../detail/1816849002013995 | F10 |
| S11 | HA Update 0.8.67EA 2026-01-27 | OFFICIAL | .../detail/1822556746168855 | F3 |
| S12 | HA "Act 2: Where Is the Game Heading?" 2026-04-30 | OFFICIAL-PLANNED | .../detail/1831432155569742 | F4, F6 |
| S13 | HA Update 0.8.72EA 2026-08-03 | OFFICIAL | .../detail/1839676055894386 | F7 (dates G03), F8 |
| S14 | HA fandom wiki (API) | WIKI | hollywoodanimal.fandom.com/api.php?action=parse&page=Gerstein_Brothers | F1 |
| S15 | HA Steam thread "How to release 6 sequels in a year?" 2025-04-26 | COMMUNITY | steamcommunity.com/app/2680550/discussions/0/594021502842589651/ | F5 |
| S16 | HA thread "how to bankrupt other studios" 2025-05-02/03 | COMMUNITY | .../discussions/0/594022012433773014/ | F3 |
| S17 | HA thread on theaters (Weappy reply 2025-04-12) | DEV-REPLY/COMMUNITY | .../discussions/0/506199960686978542/ | F3 |
| S18 | HA thread "GB CINEMA buy out" 2025-08/09 | COMMUNITY | .../discussions/0/594032586879159899/ | F1, F3, F4 |
| S19 | HA thread 2025-04-14 (60m by 1937) | COMMUNITY | .../discussions/0/506200114838182202/ | F9 |
| S20 | HA thread 2025-04-12 (rentable cinemas shrinking) | COMMUNITY | .../discussions/0/506199960687023856/ | F3 |
| S21 | HA tips thread 2025-04-12 | COMMUNITY | .../discussions/0/506199960687002023/ | F9 |
| S22 | MGT2 store page | OFFICIAL | https://store.steampowered.com/app/1342330/Mad_Games_Tycoon_2/ (released 31 May 2023) | F11, F15, F16 |
| S23 | MGT2 "Company Acquisitions!" 2022-04-28 | OFFICIAL | steamcommunity.com/games/1342330/announcements/detail/4348798430274738151 | F11, F12, F15 |
| S24 | MGT2 First Year Anniversary 2022-01-21 | OFFICIAL | .../detail/4237325463675656030 | F15 |
| S25 | MGT2 Patchnotes 2021.04.20A–05.28A | OFFICIAL | .../detail/4069544815359781322 | F15 |
| S26 | MGT2 Update BUILD 2022.09.16A 2022-09-27 | OFFICIAL | .../detail/4589754330749384797 | F16 |
| S27 | MGT2 Development Update 2023-04-20 | OFFICIAL | .../detail/5133583099794633322 | F12, F15, F16 |
| S28 | MGT2 Development Update 2023-08-24 | OFFICIAL | .../detail/5141475722326763113 | F13 |
| S29 | MGT2 Development Update for 2024 2024-01-17 | OFFICIAL | .../detail/5510784213094558022 | F13, F16 |
| S30 | MGT2 patch posts 2021-03-08 / 09-08 / 11-05 / 12-22 | OFFICIAL | .../detail/4057152305727721555, 4020014731791976970, 4186652991113913673, 4224938027296499338 | F16 |
| S31 | MGT2 thread "How does the subsidiary system work?" 2022-06-29 | COMMUNITY | steamcommunity.com/app/1342330/discussions/0/3416558908189280598/ | F12, F14 |
| S32 | MGT2 thread "Subsidiaries" 2022-09-10 | COMMUNITY | .../discussions/0/3374907062176295278/ | F14 |
| S33 | MGT2 thread "Ideas for company acquisitions" 2022-02 | COMMUNITY (suggestions) | .../discussions/0/3186862118586938596/ | F12, F13, F18 |
| S34 | MGT2 thread "Subsidiaries and Buyouts Suggestion" 2021-06 | COMMUNITY (suggestions) | .../discussions/0/3052859736125494336/ | F18 |
| S35 | MGT2 thread "[Subsidiaries] Do I earn/lose money" 2025-01/02 | COMMUNITY | .../discussions/0/591762021826961586/ | F13, F14 |
| S36 | MGT2 thread "Subsidiary Games - deductions" 2024-02 | COMMUNITY | .../discussions/0/4204742223857061022/ | F13, F14 |
| S37 | MGT2 thread "I will never accept that subsidizing is detrimental" 2024-12 | COMMUNITY | .../discussions/0/561358380223986764/ | F14 |
| S38 | MGT1 fandom wiki "Companies" | WIKI | mad-games-tycoon.fandom.com/api.php?action=parse&page=Companies | F17 |
| S39 | Game Dev Tycoon official page | OFFICIAL | https://www.greenheartgames.com/app/game-dev-tycoon/ | F19 |
| S40 | GDT fandom wiki "Bankruptcy", "Companies", "Expansion Packs" | WIKI | gamedevtycoon.fandom.com/wiki/Bankruptcy etc. | F19, F20 |
| S41 | Greenheart forum "Publisher deal & Sequel?" 2013-05-15/16 | COMMUNITY | https://forum.greenheartgames.com/t/publisher-deal-sequel/3881 | F20 |
| S42 | The Executive store page | OFFICIAL | https://store.steampowered.com/app/2315430/ (released 11 Feb 2025) | F21 |
| S43 | The Executive patch notes 1.0.3, 1.0.4, 1.1.0, 1.1.1, 1.1.2, 1.3.0 | OFFICIAL | steamcommunity.com/games/2315430/announcements/detail/1791580426006306, 1791580426103576, 1794102528076260, 1794102528117871, 1794830910910996, 1802354289661571 | F21 |
| S44 | Gamer Social Club review 2025-02-08 | press | https://gamersocialclub.ca/2025/02/08/the-executive-movie-industry-tycoon-review/ | F21 |
| S45 | Blockbuster Inc. store page | OFFICIAL | https://store.steampowered.com/app/1793090/Blockbuster_Inc/ (released 6 Jun 2024) | F22 |
| S46 | Blockbuster Inc. Patch 1.9.0 2024-10-28 | OFFICIAL | steamcommunity.com/games/1793090/announcements/detail/6212245217911958737 | F22 |
| S47 | Blockbuster Inc. thread "Am I Getting Money For My Shares?" (dev reply 2024-06-23) | DEV-REPLY | steamcommunity.com/app/1793090/discussions/0/4354499321006822946/ | F22 |
| S48 | Blockbuster Inc. thread "Game Balance" 2024-06-08 | COMMUNITY | .../discussions/0/4339861173661816357/ | F22 |
| S49 | Moviehouse announcements 2021-04-07, 2022-06-14; Patch #2 2023-04-10 | OFFICIAL | steamcommunity.com/games/1576280/announcements/detail/5121196841302956539 (+ feed) | F23 |
| S50 | Carey DeVuono interview, Henry Jenkins blog 2006-11-27 | OFFICIAL (developer's words) | http://henryjenkins.org/blog/2006/11/hollywood_mogul_3.html | F24 |
| S51 | Film Stories, "The various attempts at a movie studio management computer game", Simon Brew 2024-05-24 | press | https://filmstories.co.uk/features/the-various-attempts-at-a-movie-studio-management-computer-game/ | F24 |
| S52 | TEW 2020 wiki "Companies", "Your Office", "Contracts" (handbook text) | WIKI | tew2020.fandom.com/api.php?action=parse&page=Companies / Your_Office / Contracts | F25 |
| S53 | Movies Tycoon store page | OFFICIAL | https://store.steampowered.com/app/2659050/ (released 24 Oct 2024) | F26 |
| S54 | Prior Project: Studio prose checked | internal | p12-accepted/docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md §12–13 and BUILDER-ANNEX rows 38–46; p13-docs/docs/design/STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md rows 99–101, 813–815; CODEX-P13-P15-LONG-RANGE-ROADMAP.md §20 (l.689–730); CODEX-P13-P15-OWNER-RULINGS.md §5 (l.245–262) | prior-prose labels |

Failed sources (not cited): Steam guide 3464161838 (rate-limited); TV Tropes HollywoodAnimal (403); gamespress.com sequel press release (401); ResetEra mirror (403); MobyGames Hollywood Mogul (403); Fandom HTML front-ends (Cloudflare; API used instead).
