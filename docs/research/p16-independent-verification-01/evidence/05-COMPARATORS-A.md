# Dossier 05 — Tycoon Comparators A: Software Inc., GearCity, Capitalism Lab

Evidence dossier for Project: Studio P16 research (assignment §2.R, with direct bearing on §J, §K, §L, §N, §O, §S).
Prepared 2026-09-11. READ-ONLY research; nothing in any repository was touched.

## 1. Scope

For each of the three comparators, reconstruct from official/developer sources first, then community sources
(labelled COMMUNITY), the shipped mechanics for: (1) acquiring competitors / hostile takeovers / buying
subsidiaries; (2) subsidiary vs absorption; (3) brand/label retention; (4) asset sales (products, IP, buildings,
land, brands); (5) company valuation shown to the player; (6) bankruptcy disposal of an AI competitor's assets;
(7) IP/product ownership and licensing; (8) anti-snowball systems; (9) how the AI uses M&A. For each: mechanic,
player decision, what players like, what becomes tedious, AI use, snowball risk, and a Project: Studio lesson
(every lesson is labelled INFERENCE).

Version discipline: all three games are still patched. Every finding carries the version/date of its source.
Where the only available official text is version-lagged (Software Inc.'s wiki), that is said explicitly.

## 2. Method and sources consulted

**Official / developer sources (primary):**
- Software Inc.: Steam store description; the developer's own Steam announcement feed pulled in full via the
  Steam ISteamNews API (371 posts, 2015-05-01 → 2026-08-20; saved locally as `si_news.json`), including the
  2026-06-08 "The overhauls will continue until morale improves" announcement, the 2026-08-05 "Overhaul update",
  the 2026-08-20 subsidiary-CEO teaser, and Beta 1.8.x patch notes; official wiki pages Stocks (WORK IN PROGRESS,
  last modified 2020-04-23, Alpha 11.5.9) and Deals (Alpha 10.5.1, 2018-05-01).
- GearCity: official wiki/manual at wiki.gearcity.info — `howto_stockmarket` (2022-01-10), `gm_stocks` game-
  mechanics pseudo-code (2022-06-20), `howto_marques` (2022-01-10), `gui_financials` (2022-01-08), `gui_rnd`
  Outsourcing/Licensing (2022-02-11), `references_actionmemos` (2022-02-05), `howto_autotools` (2022-01-10),
  `new_game_settings` (2026-08-27); official tutorial scripts `stocks.txt` and `marques.txt`; developer Eric B.'s
  replies on Steam (2017, 2021); full GearCity Steam announcement feed (200 posts, 2016-09-06 → v2.0.0.15
  2026-01-27; saved as `gc_news.json`).
- Capitalism Lab: capitalismlab.com feature pages — Subsidiary DLC hub, Merging Subsidiary Companies,
  Privatization, Subsidiary Control, Subsidiary Financial Management, Subsidiary DLC Tips and FAQ, Acquiring a
  Private Company (Digital Age DLC), Acquire Companies Facing Bankruptcy, Tech-focused AI Companies,
  Understanding Non-Transferable Firm Types, Mass Transfer Firms, Stock Market Enhancement, Playing Without a
  Company (Billionaire Life DLC), Script Special Rules, Version 12.0 page; developer David (Enlight) replies on the
  official forum (2017).

**Community sources (labelled COMMUNITY):** Steam discussions for Software Inc. (2015–2023) and GearCity
(2017–2021, several with developer replies, which are treated as developer evidence); Steam guide "Subsidiaries
and How to use them [Beta 1.6.x]" (2023-03-03, updated 2023-05-24); Capitalism Lab official forum player threads
(2017–2020).

**What failed:**
- Reddit: blocked for the crawler (WebSearch domain restriction) and 403 via direct fetch. No Reddit evidence was
  obtained; player-experience criticism comes from Steam and the Capitalism Lab forum instead.
- Software Inc. official wiki: `/wiki/index.php/Subsidiaries` → 404; the Stocks page is an explicit WORK IN
  PROGRESS whose hostile-takeover/subsidiary/bankruptcy sections are empty headers; the wiki search endpoint
  returned no usable results. The wiki is therefore version-lagged and could not supply current mechanics.
- Steam announcement pages fetched through WebFetch returned only navigation chrome; bodies were recovered via
  curl and the Steam news API instead.
- capitalism2.com forum via curl returned "Not Acceptable"; WebFetch summaries succeeded (verbatim quotes and
  dates were requested and are used only where returned as quotes).
- namu.wiki (Korean Capitalism Lab wiki) → 403; not used.
- No formula for GearCity's shareholder vote and no formula for Capitalism Lab's share-price escalation were
  found in official text; those items are marked LOW/UNVERIFIED below.

Evidence labels used: **OFFICIAL** (developer/publisher text), **DEV-REPLY** (developer post in a community
thread), **COMMUNITY** (player report). Prior-prose status refers to Project: Studio documents listed in
PATHS.md; where no prior Project: Studio prose makes the same claim the status is N/A.

## 3. Findings

### 3A. Software Inc. (Coredumping; Steam Beta 1.8.42 line, currently mid-overhaul)

**F1. Version state: Beta, with a deliberately game-breaking overhaul that explicitly includes subsidiaries.**
- Source: OFFICIAL, Steam announcement "The overhauls will continue until morale improves", 2026-06-08:
  "The overhaul will touch marketing, servers, product "identity", subsidiaries and some smaller game breaking
  stuff that I've always wanted to add"; "Add some very high-level customization to subsidiaries"; "We're going
  on a financially dubious probably 6 month long hiatus to overhaul some core mechanics (marketing, servers and
  subsidiaries)". Teaser 2026-08-20 (Beta 1.8.42 notes): "Here is a teaser for the subsidiary CEO mechanic I'm
  working on for the overhaul".
- Proves: Software Inc.'s subsidiary mechanics are a moving target; every Software Inc. finding below is dated.
- Confidence: HIGH. Prior-prose status: CONFIRMED (P12 §13 and P12 annex already label this "active development,
  not completed mechanics").

**F2. Acquisition is by buying listed shares; the last block is a "Takeover" purchase at a displayed price; there
is no refusal step once the target is >50% listed.**
- Source: COMMUNITY, Steam guide "Subsidiaries and How to use them [Beta 1.6.x]" (2023-03-03/2023-05-24):
  "You can acquire any company to be your subsidiary, it the amount of shares listed is higher than 50%"; "To be
  able to take over the company, we need to acquire all of the listed shares. Once that is done, on top a new
  Takeover button will be displayed with the amount need for the rest of the company."
- Corroboration: OFFICIAL Alpha 11.5.1 notes (2020-03-15): "You now trade in actual shares instead of having 5
  "stock slots". Furthermore, other companies can now start a hostile takeover of your company, if they own more
  than 50% of your shares."
- Proves: the target has no willingness model; the gate is float (how much is listed) plus cash. Companies that
  keep >50% unlisted are simply unbuyable.
- Confidence: MEDIUM (mechanic), HIGH (hostile-takeover threshold). Prior-prose: N/A.

**F3. The purchase price is self-inflated: buying shares pushes the price up cumulatively, so a fast buyer pays
a bubble, and the company's worth collapses to zero on takeover; the buyer then "deposits" fresh capital.**
- Source: COMMUNITY, Steam thread "buy a company for 450M$ it lose 300M$ overnight" (2017-12-15/17):
  "Everytime you buy stocks it inflates the price on the remaining shares, for a period of time this effect is
  cumulative"; "The moment you take over the company, its worth becomes zero. Then appears a pop-up which asks
  to deposit money into the subsidiary. Usually the default number is 10% of your current balance."
  OFFICIAL Alpha 9.6.1 (2017-04-09): "Subsidiaries now start off with whatever you deposit, so closing a
  subsidiary doesn't make more money than a take over"; Alpha 11.7 (2020-10-12): "Fixed subsidiary price adding
  player stock worth twice, making it almost twice as expensive as intended"; Beta 1.8.33 (2026-01-16): "Fixed
  discrepancy in recursion level of stocks when calculating company worth".
- Proves: the "control premium" in Software Inc. is an emergent side-effect of market impact, not a designed
  willingness price; company worth is a recursive number (cash + holdings incl. subsidiaries + loans due; see F4)
  and the developer has repeatedly patched its accounting.
- Confidence: MEDIUM. Prior-prose: N/A.

**F4. Company worth (what the player sees) is an accounting-style number: stocks held, subsidiaries, plots and
loans due are counted; developer patch notes are the only formula evidence.**
- Source: OFFICIAL patch notes: Alpha 5.3 (2015-07-26) "Stocks are now considered part of company worth when
  valuating stocks"; Alpha 9.6.1 (2017-04-09) "Subsidiaries are now counted in company worth"; Alpha 10.1.1
  (2018-02-28) "Count loans due in stock worth", "Plots counted towards worth in rent mode" (fixed); Beta 1.8.33
  (2026-01-16) recursion fix above. Official wiki Stocks page (2020): "When the worth of the company goes up, so
  goes the worth of your stake in the company and the other way around."
- Proves: one blended "worth" figure serves as book value, market cap and transaction base simultaneously —
  exactly the collapse the assignment §N forbids.
- Confidence: MEDIUM (no single published formula). Prior-prose: N/A; supports assignment §N's separation.

**F5. Takeover vs Subsidiary is an explicit choice at closing; the two bundles differ.**
- Source: COMMUNITY guide (Beta 1.6.x, 2023): "Takeover the company, meaning it will cease to exists, and all of
  the assets (shares, IPs, frameworks) will be transferred to our company. — Subsidiary — the company will
  continue to exists and keep the IPs, but will transfer us shares and frameworks". Steam thread "Takeover vs
  subsidiaries" (2017-09-07): "After the takeover, company disappears from the list and you gain rights to the
  products". OFFICIAL Alpha 9 (2017-09-06): "The player can make other companies subsidiaries when taking them
  over to keep them in the game and control their funding"; developer plan 2016-07-27: "subsidiaries, which will
  allow you to buy out a company without closing it, and then controlling it, much like automation, but with the
  added ability to keep in the background and let them do their thing."
- Proves: Software Inc. ships assignment Model D (choose absorb vs keep-alive) with the label choice made once at
  closing. Employees and buildings do NOT transfer in either branch (see F6).
- Confidence: MEDIUM-HIGH. Prior-prose: P12 §13 "DO NOT COPY ... hostile takeovers, subsidiaries" —
  SUPERSEDED BY OWNER DIRECTION (Owner has selected acquisitions for P16); the P12 caution about *subsidiaries as
  a second managed company* remains consistent with the Owner's stated preference.

**F6. What does not transfer: employees, offices. Staff of a bought-out or bankrupt AI company are released to
the hiring pool; the lead designer is released.**
- Source: OFFICIAL Beta 1.7.28 (2024-01-12): "Fixed AI companies not releasing their lead designer when they go
  bankrupt or are bought out"; Beta 1.5.1 (2023-03-30): "Hiring pool boost from bankrupted companies have been
  capped". COMMUNITY (2015-09-30, Alpha era): "you only get their IP. You don't get their employees"; player wish
  2017-06-08: "you take over the IP and the team, move them into your building and they keep working on the
  project!" (not implemented as far as any source shows).
- Proves: a comparator chose IP-only transfer and players repeatedly asked for people/projects to come across —
  supporting the Owner's §F/§H interest in inheriting staff and active productions as a differentiator.
- Confidence: MEDIUM. Prior-prose: N/A.

**F7. Subsidiaries: one specialization each; "Autonomous" checkbox; the parent assigns support/marketing/porting/
development; must be funded by deposits; profits cannot be swept except via founder-style dividends (not
documented for subsidiaries); no notification of subsidiary releases.**
- Source: COMMUNITY guide (Beta 1.6.x): "Every Subsidiary can have only one Specialization"; "If this box is left
  checked after takeover, the Subsidiary will continue to act as a separate company and will create new sequels
  or even new IP. If this box is unchecked, the Subsidiary will only deal with work we assign to it."; "there is
  still no notification about Subsidiaries releasing new products, so we need to keep track"; "Subsidiaries work
  normal office hours, so they are not as effective as two teams". OFFICIAL Beta 1.8.12 (2025-01-28): "Player can
  now pick subsidiary product specialization and subsidiaries will no longer count towards AI company limit in the
  market"; Alpha 10.6.1 (2018-05-29): "Added warning when subsidiary is running out of money".
- Proves: the autonomous-subsidiary model creates a background company the player must fund, monitor and cannot
  see well; the developer has been adding notifications and controls for eight years and is now rebuilding it
  (F1).
- Confidence: MEDIUM. Prior-prose: N/A; supports Owner preference against Model B.

**F8. AI companies use M&A: they buy out companies they hold stock in, and they hostile-takeover the player above
50%; AI dilution as a defence was limited in 2023.**
- Source: DEV-REPLY (2016-01, Alpha 7): "currently they only use stocks to save themselves from going bankrupt
  and if a company has a lot of stock in another company they will try to buy them out"; OFFICIAL Alpha 9.3.1
  (2017-02-18): "Improved AI company budget planning to avoid too many bankruptcies and buyouts"; Beta 1.2.3
  (2022-09-28): "Take-over notification now differentiates between whether company was bought out or went
  bankrupt"; Beta 1.6.1 (2023-05-08): "AI companies can no longer dilute shares if one company owns more than
  50%"; Beta 1.7.28 (2024-01-12): "Added ability to start a new company in the same save when you go bankrupt or
  are bought out". COMMUNITY (2021-08/2023-02): "you need to buy back enough until the other company has below
  25% stocks to stop the takeover"; "every time I give myself money to buy them out their price raises ... they
  always wanted everything and a bit more".
- Proves: symmetric-ish M&A exists (AI buys AI; AI buys player), and the player-facing hostile takeover is
  experienced as punishing and opaque (no visible willingness or price law, only a rising counter).
- Confidence: MEDIUM-HIGH. Prior-prose: P12 annex "takeovers" claim CONFIRMED.

**F9. Bankruptcy disposal: assets go to shareholders pro rata if listed; otherwise sold randomly / IP to public
domain; AI tries to sell IP before dying; near-bankrupt AI course-corrects when the player is circling.**
- Source: OFFICIAL Alpha 11.3.1 (2019-11-23): "Company assets are now distributed equally among share owners
  when they bankrupt, otherwise it is sold off randomly"; Multiplayer (2023-11-13): "Changed how company assets
  are divided among shareholders when a company bankrupts, so it will be distributed even if less than 10% of the
  company is listed"; Beta 1.7.28 (2024-01-12): "AI companies will now try to sell IP when going bankrupt"; "All
  IP from unlisted bankrupt companies is now transferred directly to the public domain"; Beta 1 (2022-03-13): "AI
  companies going bankrupt before acquisition by the player will now try to course correct"; Beta 1.8.11/1.8.12
  (2025-01): "The game will now try to auto-resolve a bankruptcy, if possible, when the player has neglected the
  bankruptcy warning". COMMUNITY (2017-09-12): "I bought all the shares of a company except one ... Found out
  that it went bankrupt and as the major shareholder, I received all its IP".
- Proves: no auction. Distress is resolved by shareholder distribution, distressed IP sales, or public domain.
  The "buy shares of a dying company to inherit its IP for pennies" exploit was real enough to patch.
- Confidence: HIGH (all developer text). Prior-prose: N/A; QUALIFIES assignment §M — none of the three
  comparators actually runs a bid auction (see also F24, F40).

**F10. IP is a first-class tradeable object: buy/sell IP (AI bids), lead designers can own IP and take a cut,
IPs expire into the public domain, and the 2026 overhaul gives IPs their own following.**
- Source: OFFICIAL Alpha 8.3.1 (2016-02-29) "Raised how much the player will get from an IP deal based on
  product sales"; Alpha 11.4 (2020-01-12) "Fixed long standing bug causing player to never receive deals regarding
  IP takeover"; Beta 1.6.1 (2023-05-08) "The AI will no longer place bids on IP that is owned by a lead designer,
  since it doesn't concern the company"; 64-bit update (2024-05-18) "When trading lead designer owned IP, their
  actual cut is now listed in the prompt"; Beta 1.1.13 (2022-04-03) "Fixed IPs becoming public domain while a
  sequel is being developed"; Beta 1.5.1 (2023-03-30) "archived public domain products older than 20 years are
  removed"; Overhaul update (2026-08-05): "Entire IPs can now gain their own following, separate from the
  companies' fans"; "We've started adding ads for products in-world".
- Proves: (a) a durable IP object distinct from its releases, with its own audience — the closest comparator
  analogue to StoryProperty; (b) creator-retained economic interest (lead designer cut) is a shipped pattern;
  (c) IP has an expiry route (public domain) that keeps old libraries from being perpetual.
- Confidence: HIGH. Prior-prose: P12 annex "IP-specific followings" CONFIRMED; §A/§C of the assignment gain a
  comparator precedent.

**F11. Licensing objects: frameworks (engines) licensed to other companies; patents on tech levels pay royalties
and expire; OS/tool licenses paid per employee per project; fixed license price to stop exploits.**
- Source: OFFICIAL Alpha 11 progress (2019-06-23): "You will now be able to create a framework when developing
  any type of software, which can be licensed to other companies and reused"; (2019-05-03): "each specialization
  has a tech level that can be researched and patented"; Alpha 11.3.1 (2019-11-23): "Patent royalty and expiration
  have been reduced to account for income boost"; Alpha 11.4 (2020-01-12): "License price is now fixed to stop
  license fee exploit"; Alpha 11.7.55 (2021-05-10): "Licenses are now paid per employee per project"; Garbage
  update (2026-04-20): "Added notification when another company uses player's framework"; Beta 1.8.11/12
  (2025-01): "highest difficulty will have almost everything patented".
- Proves: licensing is non-exclusive, priced by the licensor, and used as a difficulty lever (AI patents
  everything on Impossible). Exploit history shows license pricing must be bounded.
- Confidence: HIGH. Prior-prose: P13 rulings park licensing in P16+ — no conflict; this is comparator context only.

**F12. Anti-snowball in Software Inc. is mostly gating and difficulty: business-reputation stars gate how many
companies you may buy; one-year minimum company age; subsidiaries don't consume the AI company cap; difficulty
options remove loans/deals; founder dividends scale with difficulty.**
- Source: COMMUNITY (2018-07): "each star represents 1 company you can buyout"; "companies must exist at least
  one year before acquisition" (reported as an error message). OFFICIAL Beta 1.7.33 (2024-02-27): "Fixed not
  being able to buy subsidiaries or hire lead designers with contracts and deals disabled due to not being able to
  gain business reputation" (confirms reputation gating exists); Beta 1.8.12 (2025-01-28) subsidiary/AI-cap line
  (F7); Beta 1.7.28 (2024-01-12) "Extra founder dividends is now a difficulty option starting at the current 20%
  going up to 100% on impossible"; Achievements (2024-01-30) "added a new impossible difficulty without contracts,
  deals, loans and publishers".
- Proves: the developer relies on reputation gates and difficulty toggles rather than valuation to slow serial
  acquisition.
- Confidence: MEDIUM (star rule COMMUNITY), HIGH (patch lines). Prior-prose: N/A.

**F13. COMMUNITY verdict on snowball and tedium (Software Inc.).**
- Source: Steam 2015-05-05 moderator: "That is probably the most unrealistic thing about the game, Kenneth has
  had many complaints about this mechanic"; 2015-05-06: "I would end up with a bunch of crap software that
  clutters my menues"; "Buying out other companies hits you really hard on the reputation, because of their
  terrible products which you are the owner now"; 2015-07-13 "YEAR 2009 - No more competition?": "In 2013 I'm
  getting bored to buy out every small company"; "This game it's like an RTS ^_^ build your base, destroy the
  enemy"; 2016-02-15: "It makes more sense currently (7.7) to buy any IP you are interested in rather than over
  paying significantly for the entire company with the only added benefit being one less competitor"; 2017-09-11:
  "Making companies subs just makes the game easier in another way as a source of never ending cash."
- Proves: (a) whole-company purchase competed badly against buying only the IP you want; (b) inherited junk
  products create clutter and reputation drag; (c) an emptied market ends the game emotionally even when it does
  not end mechanically.
- Confidence: MEDIUM (COMMUNITY, alpha-era but recurring). Prior-prose: N/A.

**F14. Software Inc. shows history of takeovers and bankruptcies as newspaper/timeline events.**
- Source: OFFICIAL Beta 1.4.6 (2023-01-15) "Growth and take over newspaper articles"; Beta 1.8.10 (2024-11-25)
  "Fixed subsidiary takeover event in company timeline"; Beta 1.5.1 (2023-03-30) "Newspaper articles older than 5
  years ... are removed to increase save speed".
- Proves: corporate-fate history is recorded but pruned for save size — a caution for §I (permanent
  searchability) about bounded history storage.
- Confidence: HIGH. Prior-prose: P15 §12.3 corporate-fate lifecycle CONFIRMED as comparator-supported.

### 3B. GearCity (Visual Entertainment and Technologies; v2.0.0.15, 2026-01-27)

**F15. Acquisition = a priced offer to shareholders that they vote on; a healthy target refuses; >50% owned means
automatic approval; one attempt per turn; buying more shares raises the odds.**
- Source: OFFICIAL manual `howto_stockmarket` (2022-01-10): "When you attempt to acquire the company, the
  shareholders of that company will vote if they approve. If 50% of the shares are yes votes, then the acquisition
  is approved. Any shares you own are automatic yes votes"; "How well the company is doing determines how
  shareholders vote. If their company is doing poorly or they're predicting a downward trend, they're more likely
  to vote yes ... But if the company is healthy and doing well, they're unlikely to allow the buyout."; "When
  you're denied a takeover, you won't be able to make another offer to any company until the next turn. If shares
  are available, you can still purchase them to make your next attempt more likely to be approved." `gui_financials`:
  "Often, AI companies will reject your buyout offer if they are profitable. The only way to be 100% sure of
  purchase is if you own more than 50% of the shares. You can only make one attempt to acquire a company per turn."
  Overview: "it is difficult to acquire a company that is booming. Likewise, a company that is doing poorly will be
  more willing to be bought out."
- Proves: a legible willingness model exists: health → willingness; price is displayed, not negotiated; rejection
  is cheap (one-turn cooldown) and the remedy is buying influence or waiting for weakness.
- Confidence: HIGH. Prior-prose: assignment §L ("A healthy studio should be allowed to reject an offer. Price may
  influence willingness strongly") CONFIRMED as a shipped comparator pattern — with the caveat (F16) that in
  GearCity price does not move willingness; health does.

**F16. Takeover price is a published formula: book-style evaluation plus a share-price premium, with the premium
larger for profitable targets and a player-only difficulty multiplier.**
- Source: OFFICIAL `gm_stocks` (2022-06-20) — Price Evaluation: `Money - Total_Debt + Branch_Construction_Costs +
  Factory_Construction_Costs + Vehicle_Inventory + Total_Design_Costs + Share_Holdings` (Total_Design_Costs =
  "Design costs of all your components and vehicles divided by 10"). Takeover Price: if `EPS_Year < -0.5`:
  `AqusitionCosts = ((((Price_Evaluation*1.1)/(Shares_Needed)/5) + (PricePerShare*1.3)) * Shares_Needed)*DifficultyBonus`;
  else `((((Price_Evaluation*1.2)/(Shares_Needed)/2.5) + (PricePerShare*1.75)) * Shares_Needed) * ((EPS_Year/10.0) + 1)*DifficultyBonus`;
  if no shares needed: `(Price_Evaluation/10)*DifficultyBonus`. Share price floor: `if(NewSharePrice < ((Evaluation *
  0.7) / Total_Shares)) NewSharePrice = ((Evaluation * 0.7) / Total_Shares)`; manual: "The game also gives a minimum
  market cap value to the stock based on the equity they own."
- Proves: GearCity keeps three separate numbers — Price Evaluation (book-like), market cap (share price × shares,
  driven by revenue/EPS growth with a book floor), and Acquisition Cost (evaluation share + 30%/75% premium on
  market price, scaled by profitability). Distressed targets (EPS_Year < −0.5) carry a smaller premium.
- Confidence: HIGH (manual says pseudo-code "may not be 100% the same as the code"). Prior-prose: assignment §N
  ("healthy acquisition begins from enterprise valuation + control premium") CONFIRMED by comparator; §O "whether
  control premium should scale with studio success" — GearCity answers yes (1.75× vs 1.3× and an EPS multiplier).

**F17. The player is charged more than the AI for the same acquisition, explicitly to close exploits; AI only bids
for companies at least 10 years old.**
- Source: DEV-REPLY Eric B., Steam "Company Acquisition" (2021-07-22/23): "the player is charged more to buy out
  companies. This had to be done to fix player exploits found a few years ago with the stock system"; "The price
  to purchase 100% of the shares is inflated for players. The price is not inflated for the AI."; "The company can
  deny you purchasing them, and agree to another company buying them. That is perfectly logical to happen."; "You
  do not need shares of a company to take over a company. You just need to purchase shares." OFFICIAL v1.25.0.10
  (2020-06-06): "Tweaked AI Company Takeover offer amount, AI will now only make offers to companies 10 years old or
  older." Simulation data in the same thread: AI buyout $19.81–$22.16/share vs player acquisition price
  $25.44/share on the same save.
- Proves: a mature comparator deliberately broke player/AI price symmetry to stop stock-system exploits. This is
  the opposite of the Owner's "no player-only superpower / same transaction law" rule; it is evidence that symmetric
  law needs exploit-proof valuation rather than a hidden player surcharge.
- Confidence: HIGH. Prior-prose: assignment §J symmetry — QUALIFIED (comparator shows why symmetry is hard).

**F18. Transfer bundle on acquisition: cash, branches, designs, marques, shares, factories transfer; contracts and
licensed designs do NOT; racing vehicles are discontinued; duplicate-city factories/branches are auto-sold.**
- Source: OFFICIAL `howto_stockmarket`: "When an acquisition is approved, the amount of money you pay is
  distributed to shareholders. In return, you receive all assets that the company had. This includes cash funds,
  branches, designs, marques, shares, and factories. The game will sell or close assets such as factories located
  where you already have assets." Tutorial script `marques.txt`: "When you purchase another company, you receive
  all their vehicle designs, component designs, inventories, marques, factories, and branches. You do not get their
  contracts or licensed designs. The game discontinues any racing vehicles automatically, and it sells any factories
  or branches if you already operate one in the city."
- Proves: a shipped, legible bundle: money paid to owners (not into the company), target cash comes across, debt
  is netted in Price Evaluation (F16), third-party contracts and inbound licenses lapse, and physical duplicates are
  liquidated automatically. No employee transfer exists (GearCity has no named staff).
- Confidence: HIGH. Prior-prose: assignment §F/§G — CONFIRMED that "automatic liquidation of colliding physical
  assets" is a shipped, comprehensible rule.

**F19. Acquired brands survive as marques (labels) with their own image ratings, owned designs and facilities,
under one managed company — Owner Model C, with the option later to spin them off (Model B) or sell them.**
- Source: OFFICIAL `howto_marques` (2022-01-10): "Marques are additional vehicle brands your company owns. You
  have complete control and operation of these brands, and they act as part of your company even though you sell
  them under a different name and logo."; "Marques have their own image ratings and seemly operate as a different
  company in the public's eye"; "The company will become one of your marques. And the assets they owned are still
  assigned to them." `gui_financials` Player Marques: "These brands do not operate independently from the company."
  Consolidation (v1.23.3, 2018-05-09): "Consolidation will now automatically create a new marques with your former
  company name and logo. For example if Foo merged with Bar you will now have FooBar, Foo, and Bar marques."
  v1.24 SP6 (2018-11-07): "New Marques now inherit 75% of parent company's image and skill ratings."
- Proves: brand-as-label with separate public reputation but no separate operations is a proven pattern; ownership
  of designs/facilities is tagged per marque, which later drives sale/spin-off value ("Design ownership also plays a
  critical role in the value of a marque when selling it").
- Confidence: HIGH. Prior-prose: assignment §E Model C/D — CONFIRMED as shipped and playable; Owner's "labels
  should not become a second separately managed studio" matches GearCity's marque definition exactly.

**F20. Marque disposal menu: Spin-off, Wholly Owned Subsidiary, Sell Marque, Discontinue, Restore.**
- Source: OFFICIAL `howto_marques`: Spin-off "will make the selected marque an independent company ... You will
  have no input in the company unless you own 50% of the company's shares"; checkboxes "include the factories and
  branches"; "Selling your marque will give you the maximum short-term gains ... If it is the name of an existing
  company in the game, the marque will become one of their marques. However, if the name is an investment firm, the
  marque will become an independent company."; Discontinue "will end the production of all their vehicles and
  components"; Restore "will not restore discontinued vehicles or components."
- Proves: asset sales at brand granularity, with the buyer either a rival (label survives under them) or "an
  investment firm" (becomes a new independent company) — a compact fiction for re-entry of a brand into the world.
- Confidence: HIGH. Prior-prose: assignment §K "acquired brands/labels" sellable — CONFIRMED as shipped.

**F21. Marques and companies can be bought piecemeal from AI ("Not Interested" is a legal answer).**
- Source: OFFICIAL `gui_financials` AI Marques: "at the bottom of this panel is an option to purchase the marque
  from their parent company. If the company is not interested in selling, the game will say "Not Interested.""
- Proves: unit-level refusal without any bargaining UI is a shipped pattern.
- Confidence: HIGH. Prior-prose: N/A.

**F22. Subsidiaries (spun-off marques) are AI-run; the only way to extract cash is dividends; over-extraction
kills the subsidiary and causes lawsuits.**
- Source: OFFICIAL `howto_stockmarket` Adjusting Dividends: "If you want to make money from your subsidiaries,
  you'll use the dividend system. This is the only way to extract capital from companies you own. You will need to
  be careful and not increase the dividend rate too high. If you do, you will drain the company out of capital
  which can kill the company and cause lawsuits." Tutorial: "They will have access to your designs, and you will
  have access to their designs. But they have their own factories and branches, and you do not control what they
  do or build."
- Proves: Model B in GearCity is intentionally low-control; the design makes it a financial holding rather than a
  second operated company.
- Confidence: HIGH. Prior-prose: N/A; supports Owner preference.

**F23. Player-side vote when an AI acquires a company the player holds shares in; the vote memo shows price per
share versus what the player paid; vote breakdown is not disclosed.**
- Source: OFFICIAL `references_actionmemos` "Acquisition Vote": "{PURCHASING COMPANY} is attempting to acquire
  {COMPANY YOU OWN SHARES OF} for ${PURCHASE PRICE}. This takeover would come out to ${AMOUNT YOU WILL GET} per
  share. We own {PERCENTAGE YOU OWN}% of the company at ${AMOUNT YOU PAID} per share. Our choice is the deciding
  vote." DEV-REPLY (2021-07-23): "I don't break down the share votes and show it publicly. No reason to, you can't
  influence it."
- Proves: symmetric rival M&A is visible to the player as a decision only when the player's stake is pivotal;
  otherwise it is news.
- Confidence: HIGH. Prior-prose: assignment §J/F — CONFIRMED comparator pattern for rival-acquires-rival.

**F24. Bankruptcy disposal: creditors offer the whole company to buyers at a price plus an explicit assumed-debt
figure (an ASSUMPTION PURCHASE, not an auction); majority owners and debt holders get first priority; player
opt-in via "Bid On Bankrupt Companies"; bankrupt companies are discounted and AI buys them if the player doesn't.**
- Source: OFFICIAL `references_actionmemos` "Buy Bankrupt Company (Not Owner)": "Creditors of {COMPANY NAME} are
  approaching various companies looking for a buyer. For ${PRICE} we can purchase {COMPANY NAME}, its {NUMBER OF
  FACTORIES, BRANCHES, AND MODELS}, and all its child marques. However, this deal will come with an extra ${DEBT}
  in liabilities."; "(Majority Owner)" variant: "A company we own majority control of ... is on the brink of
  bankruptcy. For ${PRICE} we can take complete control". `howto_autotools`: "Bid On Bankrupt Companies => Shows an
  action memo anytime a bankrupt company is available for a buyout, assuming you have enough funds ... not all
  bankrupt companies are available to bid on because debt holders and largest stock holders have first priority."
  DEV-REPLY (2021-07-22): "Bankrupted companies are often discounted, which would explain how they picked them up
  for $170m when you offered $600m."; "If the company went out of business, and you do not have bid on bankrupt
  companies enabled, then the other AI companies would be able to buy out the company at a discounted rate."
  DEV-REPLY (2017-08-07): "The bid on bankruptcy action memo is more for the folks who are looking to buy
  everything up in the game world." v1.22.2 (2017-09-29): "Implemented a "Wait" button in Bid on Bankruptcy action
  memo ... If you end the turn before making a decision, the game will decline the buy out." v1.25.0.10
  (2020-06-06): "You can no longer sell shares of a company if you get a bid on bankruptcy action memo."
- Proves: the assignment's Alternative 4 (assumption purchase) is the shipped GearCity model, with a single
  "yes/no/wait" decision, transparent price and separate debt, and priority rules instead of bidding. Nobody bids
  against anybody in real time.
- Confidence: HIGH. Prior-prose: assignment §M/§N ("auction price emerges from bids") QUALIFIED — GearCity uses a
  creditor-set discounted price + assumed debt, not competitive bids.

**F25. Licensing designs: perpetual, non-exclusive, one-time fee plus per-unit royalty; licensor cannot refuse a
licensee; licenses cannot be cancelled once granted; licensed designs survive the licensor's bankruptcy; the AI's
appetite is tuned by size.**
- Source: OFFICIAL `gui_rnd` Outsourcing/Licensing (2022-02-11): "When you license a design, you're purchasing the
  instructions and the right to manufacture that model. You pay a royalty for every unit you manufacture."; "When
  you put up a design for license, any manufacture may purchase it. The game does not allow you to deny any
  company the right to license your design."; "Purchasing a license will allow you to produce that design for the
  rest of the game. You will have to pay a one-time fee and an extra royalty payment for each unit"; "The license
  lasts forever"; "You can not cancel licensed designs or anything that has been platform shared." Patch 1.21.1
  (2016-12-20): "Fixed bug that would discontinue your licensed components if the parent company went bankrupt."
  v1.25.0.10 (2020-06-06): "Decreased licensing wins, Large AI companies are less interested in licensing designs";
  "Tweaked licensing selection code to consider royality rates less, and signing fees much less."
- Proves: the smallest working license object = (design, fee, royalty, perpetual, non-exclusive). No territories,
  no terms, no exclusivity — and it has been stable since 2017.
- Confidence: HIGH. Prior-prose: assignment §B "smallest useful rights bundle" — comparator CONFIRMS that a
  perpetual non-exclusive license with a royalty is sufficient for play.

**F26. Anti-snowball, GearCity: Acquisition Cool Down scaled by target size; Monopoly Lawsuits at >75% global
share (0.3%/turn check; fines, marque stripping, break-up above 90%); Limit New Branches per year; player-only
price surcharge (F17); auto-sale of stock when out of cash; new AI generated when the world empties.**
- Source: OFFICIAL v1.25 RC1 (2019-08-01): "Implemented an advance game setting which limits the amount of
  acquitiions or merging you can do, based on the size of the companies you acquire. The larger the company, the
  longer you will have to wait before you can buy another company." `new_game_settings` (2026-08-27): "In GearCity,
  a Monopoly is a car company with more than 75% global market share. The game can sue you even if you do not
  commit anti-competitive behavior. Monopoly Lawsuits is a random events with a 0.3% chance of happening each turn
  ... This lawsuit can break apart the company or heavily fine them."; "Limit New Branches ... total number of
  cities or territories on the map time 0.03 plus 1". v1.23.3 (2018-05-09): "Above 90% market share has stiffer
  fines and the possibility to completely break up your company". v1.23.4 (2018-06-20): "The game will now
  automatically sell shares when you've been out of cash for a couple of months. This prevents players from
  investing all their cash into a company and then not going bankrupt because they have liquid assets (stocks)."
  v1.22.3 (2017-11-17): "New AI companies will be generated if the game world becomes too empty." Antitrust memo:
  options Fight / Settle ("the government will close 25% of your branches and factories") / Bribe / "Chewbacca
  Defense".
- Proves: a serial acquirer is slowed by (i) a size-scaled cooldown, (ii) an outcome-based (not transaction-based)
  antitrust event, (iii) construction rate limits, and the world refills. All are toggles preset by difficulty.
- Confidence: HIGH. Prior-prose: assignment §S — cooldown and refill CONFIRMED as natural-feeling levers;
  antitrust exists as "only if necessary" default-on at higher difficulty.

**F27. Exploit history (developer-acknowledged): buy-below-equity-then-sell/spin-off flips; sell-marque always
found a buyer; spin-off stock resell; IPO/buyout abuse.**
- Source: COMMUNITY Steam "Mergers & Acquisitions" (2019-04-28): "If Acquisition Costs < Company Equity,
  congratulations - you found yourself a winner. Acquiring and selling them off should 99% guarantueed bring in
  some cash ... In my last gameplay i earned about 7 billion $ ... from just buying and selling companies within a
  few years"; (2019-05-05): "I did kinda exploit the fact that there is always a buyer when you sell a marque ... I
  did sell to one company in particular and now they have 27% overall world market share." OFFICIAL v1.24.1
  (2019-03-30) "Fixed sell marque double payout"; v2.0.0.4 (2022-03-08) "Spin-off stock resell exploit, adjustments
  made to cash value in stock eval, past stock history for spun off company is now deleted"; v2.0.0.9 (2023-06-11)
  "Made adjustments to stock IPOs and buyouts since it could be abused to exploit the game."
- Proves: any rule set where transaction price can sit below book/liquidation value, or where a guaranteed buyer
  exists, will be flipped. Assignment §K's "repeated flip exploits" are not hypothetical.
- Confidence: HIGH. Prior-prose: assignment §K CONFIRMED (risk is real in a mature comparator).

**F28. AI M&A in GearCity: AI acquires AI (consolidation and buyout), AI institutional investors trade on price
momentum; AI companies buy stock only when profitable and cash-rich; sell when short of cash.**
- Source: OFFICIAL `gm_stocks` AI Companies Buy: "if(LY_YTD_Profits > 0 && CurrentFunds > (LY_YTD_Profits*2))
  Buy 10% of CurrentFunds worth of stock shares."; Sell: when funds are short, "Sell 5% of shares owned of their
  company" if >25% self-owned "else Sell all shares of random company." DEV-REPLY 2021-07-22 (Daimler buying MG;
  Jaguar bought a year earlier) and "Likewise a consolidation could have happened."; v1.25.0.10 AI offers only to
  companies ≥10 years old (F17).
- Proves: rival M&A is bounded by simple affordability predicates (profitable + 2× last-year profit in cash) and
  target age, not by a strategic planner.
- Confidence: HIGH. Prior-prose: assignment §J ("when an AI should bid") — comparator CONFIRMS affordability +
  age gates are enough to avoid immediate consolidation.

**F29. What GearCity does NOT transfer or preserve: the buyer inherits 30-model catalogues it must prune by hand;
history for spun-off companies is deleted; discontinued marques can be restored but not their designs.**
- Source: COMMUNITY (2019-04-28): "I bought a company completely then decided i didnt have the factory space to
  make the 30 car models they had listed"; DEV-REPLY (2021-06-16): "If you're buying them to get their designs,
  well then, you'll have to go through the process going through their designs ... The game has no way of knowing
  what you want to do"; OFFICIAL v2.0.0.4 "past stock history for spun off company is now deleted".
- Proves: the tedium of absorption is catalogue triage, and the developer accepts it as the player's job.
- Confidence: MEDIUM-HIGH. Prior-prose: assignment §H (choose which projects continue) — supports "buyer chooses"
  but warns to keep the choice small.

**F30. Shareholder-morale governance (board can force dividends, spin-offs, or fire the player).**
- Source: OFFICIAL `howto_stockmarket`: "If their morale becomes poor, they can force actions at your company
  without your input. And if you have the "Can Be Fired" setting enabled, they can fire you"; memo "Board Of
  Directions Action (Spin-Off)".
- Proves: public ownership brings a counter-party that constrains empire building — but only if the player IPOs.
- Confidence: HIGH. Prior-prose: N/A (Project: Studio has no equity market; noted as not selected).

**F31. Minor internal inconsistency in GearCity's own documentation.**
- Source: tutorial `marques.txt`: reacquiring a wholly-owned spin-off "It is free to do so if you own 100% of the
  company." vs `gm_stocks`: `else AqusitionCosts = ((Price_Evaluation/10))*DifficultyBonus;` when no shares are
  needed.
- Proves: even a formula-publishing developer drifts between prose and code; Project: Studio should publish one
  TypeScript formula and derive UI text from it.
- Confidence: MEDIUM. Prior-prose: N/A.

**F32. GearCity difficulty presets bundle the M&A brakes.**
- Source: OFFICIAL `new_game_settings`: CFO (Normal) enables "Dynamic Wages, Acquisition Cool Down Time, Monopoly
  Lawsuits, Increased Branch Costs, Establish AI"; Easy disables "Acquisition Cool Down Time, Monopoly Lawsuits,
  Limit New Branches"; page text for "Acquisition Cool Down Time" is an empty heading (no official prose on the
  formula).
- Proves: the brakes are considered difficulty, not law; their exact scaling is undocumented.
- Confidence: HIGH (presence), LOW (scaling). Prior-prose: N/A.

### 3C. Capitalism Lab (Enlight; Version 12.0, post-release beta 12.0.26, 2026)

**F33. Public-company acquisition is share accumulation on the exchange; >50% = control (and, if done to the
player, a hostile takeover); the developer has refused to add a tender offer to keep the game hard.**
- Source: OFFICIAL "Playing Without a Company": "A hostile takeover happens when a rival buys more than 50% of
  your company's shares on the Stock Exchange and seizes control of it." Subsidiary Financial Management: "A
  subsidiary has to be at least 50% controlled before it appears on this screen at all." DEV-REPLY David (Enlight),
  forum t=4049, 2017-03-07: "having tender offer will just lower the difficulty level of the game ... once the
  player has acquired all the companies he wants to acquire, the challenge is gone and the game will become
  boring."; 2017-01-15: "if it is going to be implemented, it is likely to be a feature of the DLC, so that it won't
  affect the core game." COMMUNITY same thread (derekg52, 2017-03-07): "to get to the 75% takeover threshold (if
  bought 5% at a time), you've bid the company up over 4x it's original value!"; OP (2017-01-10): "every time I
  offered the owner to buy stocks he asked me to give him 2-3 times higher price".
- Proves: Capitalism Lab's "control premium" is emergent price impact plus a major-holder mark-up, with no
  willingness screen; the developer explicitly treats acquisition ease as the anti-snowball lever.
- Confidence: HIGH (official + dev quotes), MEDIUM (exact 2%-per-1% escalation and 5% blocks are COMMUNITY).
  Prior-prose: assignment §L "avoid an opaque bargaining simulator" — QUALIFIED: Capitalism Lab is the cautionary
  case of price-only, opaque accumulation.

**F34. Private AI companies can be bought outright at a quoted price with a one-click choice: [Acquire] (keeps a
separate company) or [Acquire and Merge] (firms and assets come across directly).**
- Source: OFFICIAL "Acquiring a Private Company" (Digital Age DLC): "AI-controlled tech companies that are private
  and independent may be open to acquisition offers."; "You are quoted a price for the company and asked to
  confirm it. Here, Circle Cross can be acquired for $285,315,000."; "[Acquire] You buy the company and it
  continues to exist as a separate company under your control. [Acquire and Merge] You buy the company and merge it
  into the acquiring company in one step, so its firms and assets come across directly."; "The list shows each
  company's cash beside the acquisition cost, so you can see at a glance which of them can actually fund the
  purchase".
- Proves: Owner Model D (choose at closing) is shipped in Capitalism Lab for private targets, with a quoted price
  and a "may be open" willingness gate.
- Confidence: HIGH. Prior-prose: assignment §E Model D — CONFIRMED as shipped comparator pattern.

**F35. Subsidiaries are AI-CEO companies; 75% ownership unlocks direct control; 100% for capital injection and
privatization; firm-level overrides are undone by the AI manager unless you take the manager seat.**
- Source: OFFICIAL Subsidiary DLC Tips and FAQ: "Control a subsidiary directly — hire its COO, CTO and CMO, set
  up departments, build firms for it, change its firms — 75% ownership or more"; "Inject capital directly into a
  subsidiary — 100% ownership"; "If you change a price or a setting in a subsidiary's firm, the AI manager of that
  firm will make their own decision shortly afterwards and it will supersede yours."; "How do I stop my subsidiary
  competing with me? Use the Scope of Production page ... it will not shut down production it has already begun."
  Subsidiary Control: "Micro-managing a subsidiary firm has short-lived effects."
- Proves: Model B implemented with an AI CEO produces an ownership ladder (50/75/100) and an override-fight the
  documentation itself has to explain; subsidiaries can compete with the parent.
- Confidence: HIGH. Prior-prose: N/A; strongly supports Owner preference against Model B.

**F36. Merging: a subsidiary merges into the parent with one button; two subsidiaries merge only at ≥75% each,
larger market value acquires, remaining shares bought for cash or new shares; script rule requires direct
majority; no stock trading between parent and subsidiary under Alternative Stock Sim.**
- Source: OFFICIAL Merging Subsidiary Companies: "To merge a subsidiary into your own company, open the
  subsidiary's Corporate Details screen and click [Merge Company]."; "You must own 75% or more of the equity in
  both companies."; "whether the acquiring company should pay cash or issue new shares to buy up the target's
  remaining shares." Script Special Rules: "Mergers require direct majority ownership ... a parent cannot merge with
  subsidiaries held by its own first subsidiary." Stock Market Enhancement, Alternative Stock Sim: "Stock trading
  between your company and its subsidiaries is prohibited. Together they make it considerably harder to speculate
  for quick profits — which is the point of the option."
- Proves: absorption ("merge") is the terminal state of a subsidiary; intra-group trading is an exploit vector the
  developer had to fence.
- Confidence: HIGH. Prior-prose: assignment §K "duplicate ownership / flip exploits" CONFIRMED as a real class.

**F37. Asset sales: firms transfer between group companies as a paid purchase; land plots of subsidiaries can be
sold; four firm types are non-transferable because technology does not travel with a firm.**
- Source: OFFICIAL Mass Transfer Firms: "The transfer is recorded as a business transaction — one company buys
  the firms from the other. The receiving company therefore needs enough cash to pay for them." Improved
  Management: "You can now sell land plots owned by your subsidiaries. Worth knowing as an acquisition tactic: a
  company holding valuable plots in prime locations, and easy to acquire, becomes a way to fund your own
  expansion." Understanding Non-Transferable Firm Types: "When a firm is transferred, only the physical assets
  change hands — not the underlying technological capability or intellectual property. So a corporation without
  the relevant expertise would end up owning a knowledge-intensive business it has no capability to operate.
  Rather than allow a tech company running without its core technology, the game blocks the transfer."
- Proves: (a) Capitalism Lab separates physical asset transfer from knowledge transfer, and refuses transfers that
  would strand an asset without its know-how — the mirror image of the Owner's "knowledge transfers, installations
  do not" principle; (b) land-rich distressed targets become asset-stripping plays.
- Confidence: HIGH. Prior-prose: assignment §F/§G knowledge-vs-installation principle — CONFIRMED by an inverse
  comparator rule; §K asset-strip risk NEW.

**F38. Technology is bought as a copy from other companies ("acquire technology"), the seller keeps it; tech-
focused AI firms exist to sell it; technology is carried as an intangible asset on the balance sheet.**
- Source: OFFICIAL Tech-focused AI Companies: "The goal is technology superior to their competitors', because
  that raises the Intangible Asset (Technology) on the balance sheet"; "They are also eager sellers. Selling
  technology funds further research, and their customers are companies for which buying is more cost-effective
  than researching — which gives a latecomer a way to catch up quickly."; "They may be acquired. Larger
  corporations find them attractive targets, and one can end up assimilated into a bigger group."; "Technology
  acquisitions make the news". COMMUNITY forum t=4717 (2017-10-30/12-22): "selling technology is ridiculous as it
  defeats the purpose of having to do research"; "$10-20 million is a drop in the bucket that I'll offer for a
  technology and the A.I., will usually accept".
- Proves: technology transfer as a purchasable copy is shipped and is the stated reason AI buys tech companies
  (assignment Scenario D); the community objection is that cheap copies devalue research.
- Confidence: HIGH (official), MEDIUM (price behaviour COMMUNITY). Prior-prose: assignment §F Q7 ("what exactly
  does acquired research grant") — comparator CONFIRMS "knowledge copy" semantics; P13 rulings park licensing
  in P16+ — no conflict.

**F39. Valuation shown: market cap (price × shares) with book-style balance sheet incl. Intangible Asset
(Technology); a $1.00 minimum bid price with automatic reverse split; Alternative Stock Sim decouples price from
economy.**
- Source: OFFICIAL Stock Market Enhancement: "Every publicly-traded stock must maintain a minimum bid price of
  $1.00 per share. Fall below it and a stock merge — a reverse stock split — happens automatically."; Alternative
  Stock Sim: "Stock prices are unaffected by the economic state." Tech-focused page balance-sheet quote (F38).
  Private acquisition quote (F34) shows a single quoted price with no breakdown.
- Proves: Capitalism Lab shows market cap and book, but the private-company acquisition price is opaque (one
  number, no factors).
- Confidence: HIGH. Prior-prose: assignment §N transparency — QUALIFIED (comparator shows the numbers but not
  the price derivation).

**F40. Bankruptcy: with the "Acquire Companies Facing Bankruptcy" setting, the player is offered the failing
company, the game pauses, and the player buys 100% of shares; otherwise the company is liquidated (no auction).**
- Source: OFFICIAL Acquire Companies Facing Bankruptcy: "a company on the brink of bankruptcy can be rescued — by
  you, buying all of its shares. Distressed companies are cheap, and some of them are worth more to you than to
  anyone else — a technology that complements your own"; "Click [Yes] and the game pauses, so you can evaluate the
  company without the clock running." Billionaire Life: "Continue After Bankruptcy ... Going bankrupt no longer
  ends the game (your company is still liquidated)."
- Proves: a third comparator with pre-insolvency rescue rather than post-insolvency auction; the design value is
  "worth more to you than to anyone else" (strategic value), with time paused for evaluation.
- Confidence: HIGH. Prior-prose: assignment §M — QUALIFIED (no comparator runs an auction; two of three do a
  pre-failure whole-company rescue).

**F41. AI M&A in Capitalism Lab: AI performs hostile takeovers of the player above 50%; larger AI corporations
absorb tech companies; AI CEOs buy back shares to 100%, which players find blocks takeovers.**
- Source: OFFICIAL (F33, F38). COMMUNITY forum t=7248 (2020-01-14): "most companies end up with the CEO buying
  out the whole shares of the other shareholders until he owns 100% again"; poll result 5-to-1 against limiting
  buybacks. Forum t=3387 (Hostile take over): "You will have to vastly over pay and even then its likely he still
  won't sell you shares."; "When he is broke he will sell shares."
- Proves: the AI's defence is buybacks and refusal to sell; the only reliable route is weakening the target first
  (price wars) — i.e. willingness follows financial health, as in GearCity, but without any displayed model.
- Confidence: MEDIUM-HIGH. Prior-prose: assignment §L/§O (target can refuse regardless of price) CONFIRMED as a
  shipped stance; §O "how much information the player should receive" — comparator gives none.

**F42. Subsidiary tedium and idleness (COMMUNITY + DEV-REPLY).**
- Source: forum t=4606 (2017-09-12/14): player: "When I make a subsidiary company its doesnt matter what config
  or how much money I give, they do literally nothing"; "When the player sold the subsidiary, it became possitive,
  he started closing the bad stores ... suddenly he understands how to play"; David: the CEO was "not comfortable
  with expanding the business", players must enable "[Expand in Production]" and "[Expand in R&D]"; "Your game has
  a very high inflation rate, so that real value of the money is a lot less than they appear." Official FAQ later
  added "Why is my subsidiary idle and not setting up new firms?"
- Proves: autonomous subsidiaries generate support load and a policy-configuration mini-game; the developer's
  fix was more UI, not less autonomy.
- Confidence: HIGH. Prior-prose: N/A; supports Owner preference.

**F43. Snowball testimony (COMMUNITY): a "mega holding company" of "700 department stores, 600 factories, 400
farms, 230 apartments ... 8 software companies, 13 internet companies, and 4 telecoms" built via hostile takeovers.**
- Source: forum t=4962 "Mega holding company strategy" (summary via search; not fetched in full).
- Proves: with no transaction cooldown and cheap distressed rescue, late-game consolidation is unbounded.
- Confidence: LOW (headline only). Prior-prose: N/A.

**F44. Brands after acquisition/merger: NOT VERIFIED in official text.** Capitalism Lab documents Corporate/Range/
Unique brand strategies and (Billionaire Life DLC preview) "Hybrid Branding", but no page found states what
happens to an acquired company's brand ratings on [Acquire and Merge]. Marked UNVERIFIED.

**F45. History: technology acquisitions and takeovers appear on the Corporate Detail Report History page.**
- Source: OFFICIAL Tech-focused page: "Technology-related news for your own company, or any other, appears on
  the History page of the Corporate Detail Report."; Billionaire Life: "When the takeover completes, a message
  spells out what just happened".
- Proves: corporate history is per-company and event-based. Confidence: HIGH. Prior-prose: P15 §12.3 lifecycle —
  CONFIRMED comparator practice.

### 3D. Cross-cutting findings

**F46. None of the three comparators runs a competitive auction for distressed assets.** Software Inc.
distributes/dissolves (F9); GearCity sells the whole entity at a creditor price plus assumed debt with priority
rules (F24); Capitalism Lab offers a paused pre-failure rescue (F40). Confidence: HIGH. Prior-prose: assignment
§M/§N auction language QUALIFIED.

**F47. All three keep the acquired brand alive only via a deliberate structure:** GearCity marque (label, one
company, F19); Software Inc. subsidiary (separate company, F5/F7); Capitalism Lab subsidiary vs merge (F34/F36).
Only GearCity ships "brand as label under one operated company". Confidence: HIGH. Prior-prose: assignment §E
Model C/D CONFIRMED viable.

**F48. Willingness models observed:** health-based vote (GearCity, visible), listing/float gate (Software Inc.,
no refusal), accumulation with owner mark-up and buybacks (Capitalism Lab, opaque), "may be open"/"Not
Interested" binary for private targets and marques (Capitalism Lab, GearCity). No comparator lets price alone
override an unwilling healthy target except by first buying >50% of it. Confidence: HIGH. Prior-prose: §L
CONFIRMED that refusal-regardless-of-price is normal.

**F49. Every comparator's "worth" is dominated by book-style inputs plus a market/earnings overlay; only
GearCity publishes the split and only GearCity separates acquisition cost from both.** Confidence: HIGH.
Prior-prose: §N CONFIRMED as the right separation and as unusual.

**F50. The most-patched exploit classes across all three:** self-dealing between parent and subsidiary (F36);
buy-then-sell/spin-off arbitrage when price < book (F27); guaranteed buyers (F27); circling a dying company for
its IP (F9); license-fee pricing loops (F11); duplicated staff via subsidiaries (Software Inc. Beta 1.8.33 "Fixed
duplicating lead designer using subsidiaries exploit"). Confidence: HIGH. Prior-prose: §K/§S CONFIRMED.

## 4. Per-game comparator summary (assignment §R format)

| Game (version) | Mechanic | Player decision created | What players like | What becomes tedious | How AI uses it | Snowball risk | Project: Studio lesson (INFERENCE) |
|---|---|---|---|---|---|---|---|
| Software Inc. (Beta 1.8.42, overhaul in progress) | Buy listed shares → Takeover (absorb IP/frameworks/patents, company vanishes) or Subsidiary (autonomous or tasked; fund by deposit); no target refusal; hostile takeover of player >50% | Absorb vs keep; which IP to buy instead of the company; how much to deposit | Owning a competitor's IP and sequels; IP with its own following (2026) | Junk-product clutter; no subsidiary release notifications; funding/monitoring subsidiaries; reputation drag from inherited products | AI buys companies it holds stock in; hostile-takeovers the player; sells IP when dying | "never ending cash" from subs; emptied market = boredom; countered by reputation-star gate, 1-year age, difficulty toggles | Ship IP-only purchase as a first-class alternative to whole-company purchase; give inherited catalogue a cheap triage; never let a takeover happen with no refusal step |
| GearCity (v2.0.0.15) | Offer at displayed formula price → shareholder vote by health; assets incl. cash/factories/designs/marques transfer, contracts and licences do not; colliding facilities auto-sold; target becomes a marque (label); consolidation merges into a new company; bankrupt companies offered by creditors at price + assumed debt | Whether to bid now or buy shares and wait; keep/sell/spin-off/discontinue each marque; buy marque only; vote on rival deals; take assumed debt | Marques with own image; buying infrastructure cheaply in depressions; transparent numbers (Equity vs Acquisition Cost) | Pruning 30-model catalogues; one-offer-per-turn waiting; hand-managing acquired production | AI bids only on 10+-year-old firms when profitable and cash-rich; AI consolidates; AI buys bankrupts at discount; AI not surcharged | Buy-below-equity flips (documented $7B); guaranteed marque buyers; countered by size-scaled cooldown, monopoly suits >75%, branch limits, player surcharge, world refill | Adopt: health-driven willingness, displayed price, marque-as-label, size-scaled cooldown, creditor sale with explicit assumed debt. Avoid: hidden player-only surcharge (breaks Owner symmetry) — replace with exploit-proof floors (price ≥ liquidation value) |
| Capitalism Lab (v12.0) | Public: accumulate shares, owner mark-up, >50% control, 75% direct control, 100% privatize/inject; private: quoted price, [Acquire] vs [Acquire and Merge]; merge subsidiary into parent; tech bought as copies; firms transfer as purchases; tech-heavy firms non-transferable | Acquire vs merge; where the 50/75/100 ladder is worth climbing; buy tech vs research; asset-strip land-rich targets | Rescuing distressed tech firms cheaply; empire structures; quoted one-click price for private targets | AI CEO overrides; idle subsidiaries; buybacks blocking takeovers; policy configuration | AI hostile-takeovers player >50%; big AI absorbs tech firms; AI buys back to 100% | Unbounded holding companies; countered only by price impact, buybacks, developer refusing tender offers, Alternative Stock Sim | Adopt: one-click "absorb vs keep" at closing, knowledge separated from physical transfer, pause-to-evaluate before a distressed purchase. Avoid: ownership-percentage ladders and AI-CEO subsidiaries |

## 5. Design implications for P16 (INFERENCE — my reading of the evidence, not Owner direction)

1. **Model D is comparator-validated, and Model C (GearCity marque) is the only shipped "label under one operated
   company".** Recommend the label be exactly GearCity's marque: a name, logo, its own public reputation lane,
   ownership tags on Story Properties/films, and nothing operational. (F19, F47)
2. **Healthy-acquisition willingness should be health-driven and visible, with price as a secondary lever**, as in
   GearCity: show the target's state (profitable / declining / distressed), the displayed price, and a yes/no.
   Capitalism Lab shows what an opaque, price-only accumulation feels like. (F15, F33, F48)
3. **Keep three numbers on screen: Book Net Worth, Studio Valuation, Offer Price.** GearCity is the only comparator
   that separates them and it is the one players cite as "transparent". (F16, F49)
4. **Control premium scaling with success is precedented** (1.3× distressed vs 1.75× healthy plus an EPS
   multiplier). A published TypeScript formula of the same shape (valuation share + premium on valuation scaled by
   recent profitability) satisfies §O without importing finance literally. (F16)
5. **Do not solve exploits with a player-only surcharge.** GearCity did and it directly contradicts the Owner's
   symmetric-law rule. Use floors instead: transaction price never below book liquidation value; no guaranteed
   buyer for asset sales; a cooldown on re-selling anything bought (F17, F27, F50).
6. **Transfer bundle:** the GearCity list (cash yes, facilities/designs/brands yes, third-party contracts no,
   inbound licences no, colliding physical assets auto-liquidated) is legible and matches Owner §F/§G intent.
   Capitalism Lab's "knowledge does not travel with a firm" rule is the mirror that validates "knowledge transfers,
   installations do not". (F18, F37)
7. **Bankruptcy: prefer creditor sale with explicit assumed debt (Alternative 4) or clean asset purchase
   (Alternative 3) over a live auction.** No comparator runs an auction; GearCity's memo ("For ${PRICE} we can
   purchase ... this deal will come with an extra ${DEBT}") is the most legible distressed UI observed. Rival
   competition can be a sealed one-shot comparison rather than bidding rounds. (F24, F40, F46)
8. **Pause or hold the clock for the distressed decision** (Capitalism Lab pauses; GearCity added a "Wait" button
   after players complained). (F24, F40)
9. **AI M&A gates:** affordability (profitable and cash ≥ 2× last-year profit), target age (≥10 years), and a
   size-scaled cooldown are enough to prevent immediate consolidation without an M&A cap. (F26, F28)
10. **Anti-snowball, minimum set:** size-scaled acquisition cooldown; integration friction (catalogue/contract
    triage); no guaranteed buyers; price floors; world refill via P15 entrants. Antitrust only as a later outcome-
    based event (GearCity's >75% share suit), not as transaction law. (F26)
11. **IP-only purchase must exist alongside whole-company purchase** or players will find whole-company purchase
    "over paying significantly" (Software Inc. F13). This is the §D/§K individual Story Property sale.
12. **Story Property should carry its own audience/following state** (Software Inc. 2026 overhaul: IP following
    separate from company fans) — a cheap way to make library value real without weekly cash. (F10)
13. **A creator-retained economic interest is precedented** (Software Inc. lead-designer IP cut) if the Owner ever
    wants producer/creator identity to be economic as well as historical; not required for P16. (F10)
14. **Smallest licence object that shipped and stayed stable:** (asset, one-time fee, royalty, perpetual, non-
    exclusive, cannot be cancelled, survives licensor bankruptcy). Time-limited or exclusive variants exist in no
    comparator; add them only if a P17/P18 consumer needs them. (F25)
15. **Inherited catalogue triage is the real tedium.** Present inherited Story Properties/productions as a short
    keep/cancel/sell list at closing, not as a permanent management surface. (F13, F29)
16. **History bounding:** Software Inc. prunes newspaper history for save size; P16's permanent corporate history
    must be typed events with bounded payloads, not article text. (F14)

## 6. Open questions

1. GearCity's shareholder-vote formula (how health maps to yes-probability) is not published; only prose. (F15)
2. GearCity's Acquisition Cool Down scaling by target size is undocumented on the settings page. (F32)
3. Capitalism Lab's exact share-price escalation per block purchased and the major-holder mark-up are COMMUNITY
   only. (F33)
4. Capitalism Lab: what happens to brand ratings on [Acquire and Merge] — UNVERIFIED. (F44)
5. Software Inc.'s post-overhaul subsidiary model (CEO mechanic) is unreleased; re-audit after the overhaul ships.
   (F1)
6. Software Inc.: whether "each reputation star = one buyout" is still current in Beta 1.8 (COMMUNITY 2018). (F12)
7. Whether Software Inc. transfers "fans"/followers on takeover (COMMUNITY 2016 "I think you'll also get their
   fans") — UNVERIFIED.
8. Reddit criticism was not reachable; the community picture rests on Steam and the Capitalism Lab forum.

## 7. Source table

| # | Source | Type | Version/date | Used for |
|---|---|---|---|---|
| S1 | https://store.steampowered.com/app/362620/Software_Inc/ | OFFICIAL | fetched 2026-09-11 | "take over their businesses", stocks/patents/franchises claims |
| S2 | Steam news API, appid 362620 (371 announcements) incl. https://steamcommunity.com/games/362620/announcements/detail/667238910445749820 (2026-06-08), .../672876654794637447 (2026-08-05), Beta 1.8.42 notes (2026-08-20), Beta 1.8.12 https://store.steampowered.com/news/app/362620/view/543347435698652444 (2025-01-28) | OFFICIAL | 2015-05-01 → 2026-08-20 | F1, F3, F4, F5–F14, F50 |
| S3 | https://softwareinc.coredumping.com/wiki/index.php/Stocks | OFFICIAL (version-lagged, WIP) | Alpha 11.5.9, modified 2020-04-23 | F2, F4 |
| S4 | https://softwareinc.coredumping.com/wiki/index.php/Deals | OFFICIAL (version-lagged) | Alpha 10.5.1, 2018-05-01 | deal types only |
| S5 | https://steamcommunity.com/sharedfiles/filedetails/?id=2941566335 "Subsidiaries and How to use them [Beta 1.6.x]" | COMMUNITY | 2023-03-03 / 2023-05-24 | F2, F5, F7 |
| S6 | https://steamcommunity.com/app/362620/discussions/0/2549465882920038674/ | COMMUNITY | 2017-12-15 | F3 |
| S7 | https://steamcommunity.com/app/362620/discussions/0/3160848559785616633/ | COMMUNITY | 2018-07-15 | F12 |
| S8 | https://steamcommunity.com/app/362620/discussions/0/613956964604262226/ | COMMUNITY (moderator + dev) | 2015-05-05 | F13 |
| S9 | https://steamcommunity.com/app/362620/discussions/0/3056241311837531656/ | COMMUNITY | 2021-08-06 / 2023-02-04 | F8 |
| S10 | https://steamcommunity.com/app/362620/discussions/0/451850468372809165/ | COMMUNITY + DEV-REPLY | 2016-01 | F8 |
| S11 | https://steamcommunity.com/app/362620/discussions/0/1473096694437868698/ | COMMUNITY | 2017-09-07 | F5, F9, F13 |
| S12 | https://steamcommunity.com/app/362620/discussions/0/517142892069751579/ ; .../530647080134369375 ; .../357287304416742325 ; .../405692758724844995 | COMMUNITY | 2015–2017 | F6, F13 |
| S13 | https://wiki.gearcity.info/doku.php?id=gamemanual:howto_stockmarket | OFFICIAL manual | modified 2022-01-10 | F15, F18, F22, F30 |
| S14 | https://wiki.gearcity.info/doku.php?id=gamemanual:gm_stocks | OFFICIAL pseudo-code | modified 2022-06-20 | F16, F28, F31 |
| S15 | https://wiki.gearcity.info/doku.php?id=gamemanual:howto_marques | OFFICIAL manual | 2022-01-10 | F19, F20 |
| S16 | https://wiki.gearcity.info/doku.php?id=gamemanual:gui_financials | OFFICIAL manual | 2022-01-08 | F15, F19, F21 |
| S17 | https://wiki.gearcity.info/doku.php?id=gamemanual:gui_rnd (Outsourcing System) | OFFICIAL manual | 2022-02-11 | F25 |
| S18 | https://wiki.gearcity.info/doku.php?id=gamemanual:references_actionmemos | OFFICIAL manual | 2022-02-05 | F23, F24, F26, F30 |
| S19 | https://wiki.gearcity.info/doku.php?id=gamemanual:howto_autotools | OFFICIAL manual | 2022-01-10 | F24 |
| S20 | https://wiki.gearcity.info/doku.php?id=gamemanual:new_game_settings | OFFICIAL manual | 2026-08-27 | F26, F32 |
| S21 | https://gearcity.info/tutorials/Scripts/marques.txt ; .../stocks.txt | OFFICIAL tutorial scripts | undated (v1.25–2.0 era) | F18, F22, F31 |
| S22 | Steam news API, appid 285110 (200 announcements, 2016-09-06 → v2.0.0.15 2026-01-27) | OFFICIAL | as dated per line | F17, F19, F24–F28 |
| S23 | https://steamcommunity.com/app/285110/discussions/0/3055114073631531775/ "Company Acquisition" | DEV-REPLY (Eric.B) + COMMUNITY | 2021-07-22/23 | F17, F23, F24, F28 |
| S24 | https://steamcommunity.com/app/285110/discussions/0/1675812484349117944/ "Mergers & Acquisitions" | COMMUNITY | 2019-04-27 → 05-05 | F27, F29 |
| S25 | https://steamcommunity.com/app/285110/discussions/0/3073125301384251735/ "Acquisition" | DEV-REPLY | 2021-06-16 | F29 |
| S26 | https://steamcommunity.com/app/285110/discussions/1/1470841715950097838/ | DEV-REPLY | 2017-08-07 / 09-19 | F24 |
| S27 | https://www.capitalismlab.com/subsidiary-dlc/ ; .../merging-subsidiary-companies/ ; .../privatization/ ; .../subsidiary-control/ ; .../subsidiary-financial-management/ ; .../tips-and-faq/ ; .../mass-transfer-firms/ | OFFICIAL | current site, v12-era | F35, F36, F37 |
| S28 | https://www.capitalismlab.com/digital-age-dlc/acquiring-private-company/ | OFFICIAL | current | F34, F39 |
| S29 | https://www.capitalismlab.com/acquire-companies-facing-bankruptcy/ | OFFICIAL | current | F40 |
| S30 | https://www.capitalismlab.com/new-features/tech-focused-ai-companies/ | OFFICIAL | current | F38, F41, F45 |
| S31 | https://www.capitalismlab.com/understanding-non-transferable-firm-types/ ; .../new-content/improved-management-of-your-subsidiary-companies/ | OFFICIAL | current | F37 |
| S32 | https://www.capitalismlab.com/new-content/stock-market-enhancement/ ; .../scripts/script-special-rules/ | OFFICIAL | current | F36, F39 |
| S33 | https://www.capitalismlab.com/playing-without-company/ (Billionaire Life DLC) | OFFICIAL | 2026 preview/current | F33, F40, F41, F45 |
| S34 | https://www.capitalismlab.com/version120/ ; .../recent-versions/ | OFFICIAL | Version 12.0 | version state |
| S35 | https://capitalism2.com/forum/viewtopic.php?t=4049 "A new way to buy another company" | DEV-REPLY (David) + COMMUNITY | 2017-01-10 → 03-07 | F33 |
| S36 | https://www.capitalism2.com/forum/viewtopic.php?t=4606 "Problem with subsidiaries" | DEV-REPLY + COMMUNITY | 2017-09-12/14 | F42 |
| S37 | https://www.capitalism2.com/forum/viewtopic.php?t=7248 ; .../t=3387 ; .../t=4717 ; .../t=4962 | COMMUNITY | 2017–2020 | F38, F41, F43 |
| S38 | Prior Project: Studio prose: p12-accepted/docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md §13 (lines 348–360) and BUILDER-ANNEX rows 43–46; p13-docs CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md §25 (lines 838–848), §16 (lines 617–619); CODEX-P13-P15-LONG-RANGE-ROADMAP.md §20 (lines 689–711); CODEX-P13-P15-OWNER-RULINGS.md §5 (lines 245–263) | PRIOR PROSE | 2026-08/09 | status labels |

Files written by this dossier: this file only. Temporary fetch copies (Steam news API JSON, GearCity wiki raw
exports, thread parsers) were used during research and deleted afterwards; every quotation above was taken from
those fetches at the URLs listed and can be re-fetched from the same locators.
