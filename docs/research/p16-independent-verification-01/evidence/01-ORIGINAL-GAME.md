# Dossier 01 — Original *The Movies* (2005) + *Stunts & Effects* (2006): Ownership / Library / M&A Reconstruction

**Assignment:** §2.Q of `ASSIGNMENT.md` (P16 Studio Empire, Library & Ownership research). READ-ONLY evidence dossier.
**Author role:** independent evidence agent (one of several). Nothing here is Owner direction; "Design implications" are labelled as this agent's inference.
**Date:** 2026-09-11.

Evidence classes used throughout (per assignment):
- **SHIPPED RETAIL (OFFICIAL)** — official PC manual (Lionhead/Activision, Sept 2005 print file), official *Stunts & Effects* manual (Apr 2006 print file).
- **PRIMA-MANUAL** — Prima Official Game Guide (Greg Kramer, 2005), developer-reviewed (Lionhead staff credited as reviewers). Guide evidence, not executable proof.
- **CONTEMPORARY PROFESSIONAL** — GameSpot retail walkthrough (Rorie, 21 Feb 2006), GameSpot review (Davis, 8 Nov 2005), IGN review (Adams, 9 Nov 2005), Box Office Mojo (Saulsbury, 3 Nov 2005), GameFAQs player guides 2006–2008 (treated as contemporary player guides, one tier below professional).
- **PRE-RELEASE CLAIM** — GameSpot E3 2002 First Look (Parker, 21 May 2002); GameSpot Preview (Park; article 1100-6089840, content pre-dates release — see F19 note on date stamp).
- **COMMUNITY MEMORY** — Fandom wikis (Lionhead Wiki, The Movies Game Wiki), 2012 retrospective (forceforgood.co.uk).
- **PRIOR PROJECT PROSE** — `MECHANICS-BIBLE.md`, `SOURCE-REGISTER.md`, `ORIGINAL-DATA/*`, `TECHNICAL-ARTIFACTS/*`, P15 package §5, P14 package §reconstruction table, P13–P15 roadmap/rulings. Verified, not trusted.

Prior-prose status labels: **CONFIRMED / QUALIFIED / CORRECTED / SUPERSEDED BY OWNER DIRECTION / NEW / N/A**.

---

## 1. Scope

Determine what the retail original and its expansion actually contained for: film ownership and library; scripts (ownership, shelving, selling); selling Stars (facility mechanics, valuation, buyers); rivals hiring fired Stars; sequel/franchise ownership; remakes; licensing; studio acquisitions; mergers; rival purchases in either direction; bankrupt asset sales; rival bankruptcy/closure; corporate labels/subsidiaries; debt behaviour; Studio Rating/charts as "valuation"; whether *Stunts & Effects* added anything corporate; what "Movies 24%" measures; whether the Advanced Movie Maker allowed title/character reuse or a sequel bonus.

Out of scope: comparator games, real-world M&A, Project: Studio code (other dossiers).

## 2. Method & sources consulted

**Local corpus (all read via grep/sed/python; nothing modified):**
`original-corpus/manual_english.txt` (1,227 lines; QXP page markers map text lines to printed pages), `prima_eguide.txt` (765 very long lines; epub OCR with page markers), `The_Movies_-_FAQ_-_PC_-_By_Maxx_-_GameFAQs.txt` (v0.24, 2005–2008), `The_Movies_-_Guide_and_Walkthrough_-_PC_-_By_Mark_E_1990_-_GameFAQs.txt` (v3.0, 19 Mar 2006), `The_Movies__Stunts__Effects_-_Strategy_Guide_-_PC_-_By_JPaterson000_-_GameFAQs.txt` (v0.3, 7 Jul 2006), `The_Movies__Improving_the_Studio_-_gamepressure.com.txt`, `MECHANICS-BIBLE.md`, `SOURCE-REGISTER.md`, `COMPARATIVE-DESIGN-REGISTER.md`, `RECONCILIATION-CHANGELOG.md`, `ORIGINAL-DATA/*.csv|json`, `TECHNICAL-ARTIFACTS/*.csv`.
Grep terms: sell, selling facility, market value, rival, buy, acquire, merger, bankrupt, debt, loan, sequel, remake, library, archive, franchise, subsidiary, licence/license, royalty, re-release, distribution, television, DVD, game over, liquidat, creditor.

**Term-hit matrix (six retail-era text sources):** `sequel`, `remake`, `franchise`, `acquisit`, `merger`, `takeover`, `bankrupt`, `buyout`, `loan`, `borrow`, `creditor`, `liquidat`, `royalt` (in-game sense), `home video`: **0 hits in every source** (manual, Prima, Maxx, Mark_E, JPaterson, gamepressure). `subsidiar` — 1 hit (manual line 1208, Activision legal boilerplate). `re-release` — Prima only, all six hits are "pre-release rating" OCR variants (marketing chapter), none about re-releasing films. `library` — only "Suburban: School Library" set and Prima's "huge library of scenes". `debt` — manual 1, Prima many ("Build in Debt" field).

**Web (verified this pass):**
- GameSpot E3 2002 First Look — fetched in full via Chrome (WebFetch/curl blocked by Cloudflare 403).
- GameSpot Preview 1100-6089840 — fetched in full via Chrome.
- GameSpot retail walkthrough 1100-6140049 — fetched in full via Chrome (77k chars; sections read: General Tips, Buildings incl. Production Office and SSSF, Dealing With Stars, Studio Rankings, Certificates).
- GameSpot review 1900-6139475 (Ryan Davis, 8 Nov 2005) — fetched in full.
- IGN review (Dan Adams, 9 Nov 2005) — fetched via Chrome, keyword-scanned.
- Official *Stunts & Effects* manual PDF (Steam CDN) — WebFetch saved the binary; `pdftotext` run on the saved copy; "What's New" section read.
- Prima OCR at archive.org/stream — WebFetch succeeded partially (summariser only saw the front of the file) but returned a clean reading of the garbled eight-year note.
- Wikipedia "The Movies (video game)" — WebFetch; no relevant gameplay claims; citation list captured.
- Box Office Mojo 3 Nov 2005 article — WebFetch; no relevant claims.
- forceforgood.co.uk 2012 retrospective — WebFetch; no relevant claims.
- The Movies Game Wiki (Fandom): "Star & Script Selling Facility" and "Production Office" pages are **empty stubs**; main article reproduces the Lionhead site blurb.
- Lionhead Wiki (Fandom) "The Movies" — fetched via Chrome; no relevant claims.

**Failed / unusable:**
- archive.org Wayback availability API: HTTP 429 (rate limited) on every attempt.
- `web.archive.org` snapshot of `themoviesgame.com` (31 Dec 2005) loads but the site was a Flash shell — no extractable text. `lionhead.com/themovies` — "No URL has been captured for this URL prefix".
- Eurogamer review: `/the-movies-review` returns 404; search could not locate the live URL. Not consulted.
- PC Gamer (Jan 2005 print) — not available online; not consulted.
- Reddit: no relevant threads surfaced by search; no Reddit source used.
- WebFetch is blocked for gamespot.com, ign.com, eurogamer.net, web.archive.org, fandom (402); Chrome MCP used instead where possible.

---

## 3. Findings

Format per finding: **Claim** → Source / Locator (verbatim quote) → Proves → Confidence → Prior-prose status → Evidence class.

### A. Acquisitions, mergers, rival purchases, subsidiaries

**F1. Acquiring competitors was a stated design intention in May 2002 and nothing more.**
- Source: GameSpot, "E3 2002: First Look: The Movies", Sam Parker, 21 May 2002. URL https://www.gamespot.com/articles/e3-2002-first-look-the-movies/1100-2866856/
- Verbatim: "Competition from other studios raises the stakes for success, and one way to grow is to acquire your competitors."
- Context: same article says the game "has been in development only since January" (2002), was not shown on the E3 floor, and describes real-time "violence slider"/"romance slider" controls that also did not ship in that form.
- Proves: the claim exists exactly as prior prose remembered it; it is an interview-derived pre-alpha ambition, four months into development.
- Confidence: HIGH that the sentence exists; HIGH that it is pre-release only.
- Prior prose: **CONFIRMED** (P15 package §5.5 "SOURCE VERIFIED AS PRE-RELEASE REPORT ONLY").
- Class: PRE-RELEASE CLAIM.

**F2. No retail-era source of any class describes buying, merging with, or taking over a rival studio, or a rival buying the player's studio.**
- Sources checked (absence): official manual (0 hits for acquir/merger/takeover/buyout); Prima full text (0 hits, confirmed both locally and by archive.org OCR fetch: "does not contain any instances of: acquire/acquisition, merger, bankrupt, sequel, remake, subsidiary"); S&E manual (0 hits); GameSpot walkthrough (only "acquaintances"); GameSpot review; IGN review; Maxx, Mark_E, JPaterson guides; Fandom/Lionhead wikis.
- Corroborating positive statements of what rivals *do* instead: Prima p.51 "RIVAL STUDIOS ... Though much of each studio's behavior is random, several things about each studio contribute to what could be termed a 'personality.' The first important thing to know is when each studio arrives on the scene ... The second task is understanding in which genres they're likely to release films." (prima_eguide.txt line 453). Rival behaviour is: arrival year window, genre-release propensities, releasing films that saturate genres, competing on charts/awards, and exchanging Stars (F9–F12). Nothing corporate.
- Proves: acquisition/merger was NOT a shipped mechanic. Absence across every retail-class source, including the developer-reviewed guide whose stated purpose is to unpack "the mechanics of how studios are rated" and the full facility catalogue, is as strong as negative evidence gets short of decompiling.
- Confidence: HIGH (negative finding; executable not inspected).
- Prior prose: **CONFIRMED** (P15 §5.5 "REFUTED: acquisition was a verified shipped mechanic"; P15 §6 table). MECHANICS-BIBLE never claimed acquisition shipped — CONFIRMED by silence.
- Class: SHIPPED RETAIL (absence) + PRIMA + CONTEMPORARY PROFESSIONAL (absence).

**F3. No labels, subsidiaries, co-productions, licensing, or rival-purchase-from-player mechanics existed. The only direction of "purchase" is player → rivals via the Star & Script Selling Facility (F5–F8), and rivals never buy anything else from the player, nor can the player buy from rivals.**
- Source: same absence set as F2; positive scope of the sole transaction facility in manual p.17 lines 428–431 (F5).
- Proves: the original's inter-studio economy was one-way sales of two asset types plus involuntary talent movement.
- Confidence: HIGH.
- Prior prose: **CONFIRMED** (P15 §5.5 second REFUTED line).
- Class: SHIPPED RETAIL (absence).

**F4. The retail rival roster is fixed at nine named studios that only ever *arrive*; no source describes a rival leaving, closing, going bankrupt, or being replaced.**
- Source: Prima p.51 table (line 453): "Old Rope Cinema 1898-1902 ... Maxipack Worldwide 1898-1902 ... Lionear Productions 1905-1907 ... Creamboat Creations 1916-1920 ... Rigormortis Movies 1928-1932 ... Gusset Entertainment 1937-1941 ... Cletus's Shotgun Cinema 1948-1952 ... Boney Studios 1954-1958 ... Booboo & Dingo Films 1967-1971"; "The Studio Charts get longer and longer as more studios enter the studio wars." Maxx FAQ lines 2364–2400 repeats the same nine with the same windows. JPaterson (S&E guide, lines 2020–2060) lists the same nine for the expansion ("Susset" is the guide's typo for Gusset) and says "that number will jump to nine to ten over the next half century or so."
- Proves: monotonic roster growth; no closure/exit path documented; identical roster under the expansion.
- Confidence: HIGH for roster/arrival; MEDIUM for "never leave" (absence-based).
- Prior prose: **CONFIRMED** (P15 §5.4, §5.5 "OPEN QUESTION ... rival bankruptcy, closure"). This dossier tightens it: three independent sources describe only arrivals; none describe exits.
- Class: PRIMA + CONTEMPORARY PLAYER GUIDES.

### B. Star & Script Selling Facility (the ONLY asset-sale mechanic)

**F5. Facility existence, purpose and buyer: sells Stars and scripts to rival studios for immediate cash.**
- Source: official manual p.17 (manual_english.txt lines 428–431): "Star and Script selling – Sometimes you might want to sell off Stars or scripts to rival studios to make some quick money. Building this facility allows you to do just that. Simply drop the Star or script you want to sell into the building and you'll be rewarded with cold, hard cash."
- Corroboration: GameSpot review (Davis, 8 Nov 2005): "Talent will grow old and eventually retire (unless he or she quits or is sold to another studio before hitting the age of 70)". GameSpot walkthrough (Rorie, 2006), Buildings: "The SSSF is your place to sell off excess scripts or hoary old stars that you don't necessarily need anymore."
- Proves: shipped; buyer is nominally "rival studios"/"another studio"; transaction is instantaneous drag-and-drop with no negotiation, no named counterparty, no offer/refusal.
- Confidence: HIGH.
- Prior prose: **CONFIRMED** (MECHANICS-BIBLE line 489; P14 package "Selling" row; P15 §5.3).
- Class: SHIPPED RETAIL (OFFICIAL) + CONTEMPORARY PROFESSIONAL.

**F6. Facility stats: $3,000, Attractiveness −20, multiples allowed, available 1920, buildable while in debt.**
- Source: Prima p.20 (line 250): "Star & Script Selling Facility • Cost: $3,000 • Attractiveness Effect: -20 • Multiples: Yes • Available: 1920 • Build in Debt: Yes This structure is not necessary for a functioning studio, but it can be important depending on how you play. If you're in the habit of switching Stars periodically, it pays to use this building to sell them to another studio rather than firing them outright." Maxx FAQ lines 958–961 and JPaterson lines 932–940 match ($3,000, 1920, Build in Debt: Yes, unlimited). Technical artifact `facility_sell.ini` (TECHNICAL-ARTIFACTS/facility_candidates.csv TECH-FAC-026: cost 3000, capacity=0) corroborates cost; blueprint schema field `availableindebt=1` (schema_fields.csv TECH-SCHEMA-004) corroborates the debt exception as an engine-level flag.
- Proves: a cheap, always-available liquidity valve, explicitly usable as a *distress* tool (buildable in debt).
- Confidence: HIGH.
- Prior prose: **CONFIRMED** (all_reconciled_facts_appendix.csv row 101; MECHANICS-BIBLE debt-exception list).
- Class: PRIMA + PLAYER GUIDES + TECHNICAL ARTIFACT.

**F7. Star valuation rule: market value = f(Star rating, actual age); rises until 55 then falls yearly; full value only after eight years' tenure (including Stars hired from rivals); the estimated price is shown on hover; the sale is described as an "auction" but with no visible bidding.**
- Sources:
  - Prima p.61 (line 519): "During a Star's lifetime, his or her market value (the price you could get in the Star & Script Selling Facility) is a function of Star rating and actual age. At age 55, the upward curve of a Star's market value begins its turn downward, decreasing with every year as retirement approaches."
  - Prima p.61 (line 519): "Market Value Market value is a combination of a Star's actual age and Star rating. It climbs over time until it begins to decline at age 55. Stars must be with your studio for eight years before they can be sold for full market value for their age and Star rating. Until then, they'll fetch only a rising fraction of the full amount. Market value is only important if you intend to make cash by selling a Star at the Star & Script Selling Facility. Otherwise, it's not important."
  - Prima p.21 note (local OCR garbled; archive.org OCR clean): "Newly hired Stars, even those hired from rival studios, don't reach their proper market value until they've been with your studio for eight years."
  - Prima p.8 (line 639): "If you want to receive compensation, build a Star & Script Selling Facility and auction the Star off to your competitors. The value is based on the Star's rating but begins to drop off steeply after the Star turns 55."
  - Mark_E guide lines 711–713: "You will be told the estimated selling price when you hover the star/script over the building." and lines 510–512: "You can fetch a pretty good price for your stars depending on their age, star rating and their image." (image = additional factor claimed only by this guide — LOW).
  - Maxx FAQ lines 624–627: "they will be auctioned off to an amount based on their rating."
  - JPaterson (S&E) lines 1630–1632: "All stars appreciate in value until they hit fifty years old, at which point their market value goes down." — **conflicts** (50 vs 55) with Prima; treat Prima as controlling.
  - GameSpot walkthrough, Production Office: the Finance screen lets you "check your talent's salaries compared to their market value" — market value is a displayed number, not only a sale-time quote.
- Proves: a deterministic, disclosed valuation with (a) rating and age inputs, (b) an explicit anti-flip rule (eight-year vesting to full value), (c) a decline curve tied to remaining career, (d) no counterparty choice and no negotiation. "Auction" is guide vocabulary for an instantaneous sale.
- Confidence: HIGH for inputs and 55/eight-year rules (developer-reviewed guide, multiply corroborated); LOW for "image" as an input; UNVERIFIED for exact formula/fraction curve.
- Prior prose: **CONFIRMED** (ORIGINAL-DATA row 62; P14 "Aging"/"Selling" rows). **NEW**: the eight-year vesting rule as an anti-flip mechanism is not called out anywhere in prior prose as a *design* lesson (P14 mentions "took years" only).
- Class: PRIMA + CONTEMPORARY PROFESSIONAL + PLAYER GUIDES.

**F8. Script valuation: sale price depends on script (star) rating; the sale is a clutter/cash valve and "relatively minor" money.**
- Sources: Prima p.21 (line 256): "If you have unwanted scripts or want to make extra money by producing scripts in large volume and selling them to other studios, consider selling them in this building. The market value of scripts depends on their script rating." Maxx line 966: "the amount you get for a script depends on its star rating." Mark_E lines 642–644: "You may make more scripts than you need so you can sell spare scripts ... for a small cash boost." GameSpot walkthrough: "In most cases, you probably won't need the actual cash that's generated here, as it'll be relatively minor in comparison to what your actual movies bring in." and "sell any scripts that are of an unpopular genre or are of poor quality".
- Proves: scripts were fungible inventory with a single scalar value; no ownership, rights, or provenance travelled with them; no source says what the buying studio does with a purchased script (never observed as a rival release).
- Confidence: HIGH for the rule; UNVERIFIED for downstream effect on the buyer.
- Prior prose: **CONFIRMED** (P14 "Selling" row). MECHANICS-BIBLE does not record the "relatively minor" scale — **QUALIFIED**.
- Class: PRIMA + CONTEMPORARY PROFESSIONAL.

### C. Involuntary talent movement (the only "rival hiring" system)

**F9. Fired Stars immediately join a rival studio; the player gets nothing.**
- Source: Prima p.20 (line 250): "Fire/Reject: Fire any employee you drop here. If the fired employee is a Star, he or she will march off the lot and join a rival studio. Since you get nothing for releasing a Star this way, it might be better to sell an unwanted Star at the Star & Script Selling Facility to get a return on your investment." Prima p.8 (line 639): "They wander off the lot and are immediately hired by other studios. Firing Stars gets you no compensation for your investment in their development."
- Proves: rivals "hire" fired Stars automatically and instantly; no contract, no buy-out, no severance; a sale is the compensated alternative.
- Confidence: HIGH.
- Prior prose: **CONFIRMED** (P14 "Defection" row; P15 §5.3).
- Class: PRIMA.

**F10. Unhappy Stars walk off to another studio, taking sunk investment with them.**
- Source: official manual pp.14–15 (lines 375–384): "if you haven't treated your Stars well ... they may decide to seek greener pastures at another studio. When they're upset enough with their salary or image, they'll let you know; if you let the situation continue to deteriorate, they'll walk right off the lot, taking all the time and money you invested in them."
- Confidence: HIGH. Prior prose: **CONFIRMED** (MECHANICS-BIBLE; P14). Class: SHIPPED RETAIL (OFFICIAL).

**F11. Rival Stars appear in the player's Stage School queue with their full current state; their frequency/quality scales with Studio Rating.**
- Sources: Maxx FAQ lines 609–618: "Sometimes stars from rival studios will appear on your lot and take a place in your Stage School line. You can hire these stars to gain a quick boost to your Studio Rating. They will have all of the experience, age, mood, and rating that they've received from their original studio, and will expect to have a large salary and trailer ready for them". GameSpot walkthrough: "stars that attempt to join you from a rival studio". Prima p.45 (line 417): "rival studios' Stars who appear in your Stage School queue are proportional to Studio rating."
- Proves: talent continuity across studios existed (identity, age, rating, experience persist); acquisition of people was via free-agent queue, not via transaction.
- Confidence: HIGH. Prior prose: **CONFIRMED** (P14 "Rival talent continuity"; source_conflicts.csv row 55). Class: PRIMA + CONTEMPORARY PROFESSIONAL + PLAYER GUIDE.

**F12. A rehired fired Star returns with "disastrously low" mood — the only documented consequence attached to talent churn.**
- Source: Prima p.8 (line 639): "You can, of course, rehire a Star as an actor or director, but his or her Mood will be disastrously low after the affront of the firing."
- Proves: the original had a tiny memory/consequence layer for people churn but none for asset churn. Whether a *sold* Star can reappear in the queue is UNVERIFIED (no source).
- Confidence: HIGH for the quote; UNVERIFIED for sold-Star return. Prior prose: **NEW**. Class: PRIMA.

### D. Film ownership, library, archive, re-release

**F13. A released film earns box office until it "stops earning money"; then it is inert. The Archive room is a UI tidy-up with zero economic function, and archiving is irreversible.**
- Sources: official manual p.7 (lines 134–137): "Your movie has been released. When your movie is taking money at the box office a $ sign will pulse over the movie card. When your movie is no longer making any money, you should archive it in the Production Office facility." Prima pp.44–45 (line 411): "STEP 6: ARCHIVING A film stays in release until it stops earning money. When this happens, the film remains in the Production Office and its Movie card stays onscreen. You can leave them there forever if you like, but all the old movies will quickly clutter the screen and pile up in the Release room. Archiving is a way to tidy up your releases by removing them from view. Archived movies belong in […]" GameSpot walkthrough: "the Archive, which is mainly intended to save your previously-made films in case you want to watch them again at some point in the future." JPaterson line 688: "Rooms: Archive (drop movies here that no longer make money)".
- Proves: no library revenue, no re-release, no residuals, no home video; the "library" is a viewing archive only (Prima p.22 line 226: "Drop it into the Movie Player room to view any of your studio's archived movies" — viewing survives archiving; economic life does not).
- Confidence: HIGH.
- Prior prose: **CONFIRMED** (MECHANICS-BIBLE line 478). **QUALIFIED**: the Bible does not state the irreversibility or the zero-economic-value of the archive explicitly.
- Class: SHIPPED RETAIL (OFFICIAL) + PRIMA + CONTEMPORARY PROFESSIONAL.

**F14. A completed film could be shelved unreleased (dropped straight into the Archive) to avoid a bad release hurting studio standing.**
- Source: GameSpot walkthrough, Production Office: "Alternately, you can move the script right to the Archives if you want to just shelve it entirely. This might be worthwhile if you've somehow produced a truly awful movie that you're afraid will drag down your studio's prestige".
- Proves: the only "ownership decision" over a finished film was release vs. bury; burying was permanent (F13) and yielded nothing.
- Confidence: MEDIUM (single professional source; consistent with Prima's irreversibility rule).
- Prior prose: **NEW**.
- Class: CONTEMPORARY PROFESSIONAL.

**F15. Pre-release press explicitly promised library/re-release income that did not ship.**
- Source: GameSpot Preview (Park), URL https://www.gamespot.com/articles/the-movies-preview/1100-6089840/: "depending on the time period you film in, you may even be able to make further royalties on it with eventual VHS and DVD rereleases." The same article promises advisers, "random challenges" from a "wealthy socialite", poaching rivals' stars "by offering bigger, fatter contracts", and a timeline that runs "at least until the studio goes bust" — none of which appear in any retail source (F2, F13, F16, F17).
- Note on date: GameSpot's page stamp reads "May 17, 2006" but the text says the game "is scheduled for release on the PC and consoles later this year" and describes cancelled console versions; the P15 package calls it the 2004 preview. Treat the stamp as a CMS re-date; content is pre-release.
- Proves: "library value" was a designed-then-cut idea in the original, like acquisition. Any P16 library economics is successor design, not parity.
- Confidence: HIGH that the claim exists; HIGH that it did not ship (F13).
- Prior prose: **NEW** (P15 §5.5 cites this article only for "goes bust"). This is a material addition to the record.
- Class: PRE-RELEASE CLAIM.

### E. Sequels, remakes, franchises, titles

**F16. No sequel, remake, franchise, or series mechanic existed; no sequel bonus; nothing tracked title or character reuse.**
- Sources: 0 hits for sequel/remake/franchise across all six retail-era texts and the S&E manual; Prima p.98 (line 765) on the Advanced Movie Maker title screen: "Movie Title Enter your own title or press the dice button for a randomly generated title. The title you get is based partially on the genre you've chosen" — free text, no uniqueness check, no linkage to prior films described anywhere. The only reuse mechanic is **negative**: set novelty (Prima line 495: "Novelty value is shared by every copy of the same set on your lot; using one decreases the novelty of all. It persists even if you tear down an overused set"), and GameSpot review: "The moviegoing audience will stop showing up if you use the same sets over and over again".
- Proves: players could type "Rocky II" as a title, but the sim had no concept of a story property, a prior film, or continuity; repetition was penalised (sets), never rewarded (franchise).
- Confidence: HIGH (absence across every class incl. the AMM chapter that documents the title field).
- Prior prose: **CONFIRMED** (P15 §5.5 REFUTED line covers "library/IP ownership transfer"; sequels not previously addressed explicitly — **NEW** detail).
- Class: SHIPPED RETAIL (absence) + PRIMA.

### F. Debt, bankruptcy, failure

**F17. Cash may go negative; debt only gates construction; no interest, no loans, no creditors, no game-over. Contemporary reviewers noted the absence of a losing condition.**
- Sources: official manual p.6 (line 129): "Note: Your balance can go into the red but when you're in debt, you won't be able to build new sets or add certain facilities and lot ornamentation." Prima p.14 (line 208): "Building in Debt Most facilities and sets can't be built when your studio is in debt, but there are a few exceptions: • Casting Office • Crew Facility • Production Office • Basic Script Office • Stage School • Stage Set • Star & Script Selling Facility". IGN review (Adams, 9 Nov 2005): "Not having to worry about losing definitely makes a difference to making the game fun, though anyone that hates being number two on the charts (like me) will quickly have problems with that philosophy." 0 hits for loan/interest-on-debt/creditor/bankrupt/game over in all sources.
- Pre-release contrast: GameSpot Preview "at least until the studio goes bust" (F15) — cut.
- Proves: the original had a soft-lock debt state and a recovery valve (the SSSF is buildable in debt), not insolvency. "Bankrupt asset sales" did not exist because bankruptcy did not exist.
- Confidence: HIGH.
- Prior prose: **CONFIRMED** (MECHANICS-BIBLE lines 1607, 2127, 2167; P15 §6 "original hard bankruptcy ... do not infer"). The IGN quote is **NEW** contemporary-professional corroboration.
- Class: SHIPPED RETAIL (OFFICIAL) + PRIMA + CONTEMPORARY PROFESSIONAL.

**F18. Buildings could be sold back for a depreciated refund — the only physical-asset liquidation in the game — with a lot-mess penalty.**
- Source: Prima p.7 (line 28): "To sell, hold a builder over a structure's Sell Building icon to permanently demolish the building and recoup a depreciated portion of its original purchase price." and "Moving or selling buildings leaves behind bare earth and lots of trash that will depress Studio Attractiveness ... Don't move or sell a building just before an awards ceremony or it might cost you the Most Prestigious Studio award." Maxx lines 390–394 corroborate.
- Proves: a depreciation concept existed for facilities (book value < purchase price) even though no balance sheet existed; buildings were never transferable, only demolished-for-cash.
- Confidence: HIGH. Prior prose: **CONFIRMED** (all_reconciled_facts_appendix.csv rows 66–67). Class: PRIMA + PLAYER GUIDE.

### G. Studio Rating / charts as "valuation"

**F19. Studio Rating was a current comparative composite (Capital 24 / Movies 24 / Stars 24 / Lot Prestige 14 / Awards 14), where Capital = cash in bank on a non-linear $50k–$1.6M scale. It is not net worth, not enterprise value, and contains no asset or library term.**
- Sources: official manual p.6 (lines 110–122): "Your rank is determined by a number of factors, such as your cash balance, the quality of movies your studio has released so far, the quality of Stars in your employ, how well connected and laid out your studio is and even how clean and tidy you keep the place." Prima pp.45–46 (line 417): "Capital 24% of Studio Rating Capital is a measure of your studio's wealth based on the amount of money your studio has in the bank at any given time ... Your studio's capital is measured on a scale from $50,000 (lowest rating) to $1[,600,000] ... the midpoint is not directly between the two extremes ($775,000) but instead about one-fifth of maximum ($300,000)." Engine corroboration: `global.ini [studio]` weights 0.239/0.239/0.239/0.144/0.144 (TECHNICAL-ARTIFACTS/schema_fields.csv TECH-SCHEMA-007; engine names the Movies term "reputationfactor").
- Proves: the original's only "valuation" was a chart score whose money component was literal cash; buildings, films, scripts, and IP had no valuation role.
- Confidence: HIGH.
- Prior prose: **CONFIRMED** (P15 §5.1; original_formulas.json).
- Class: SHIPPED RETAIL (OFFICIAL) + PRIMA + TECHNICAL ARTIFACT.

**F20. "Movies 24%" measured the collective *Success*-weighted quality of releases with explicit time decay — a recency-weighted reputation term, not a persistent library value.**
- Source: Prima p.46 (line 417): "Movies 24% of Studio Rating Movies is a measure of the collective quality of your studio's releases. The Success score ... increases this measure in proportion to its size. Having one or even several great movies in your studio's history, however, isn't enough in a town with a staggeringly short memory; you have to keep the hits coming. The impact of individual movies decays over time, so you must regularly produce extremely high-quality films to retain the topmost rating in the factor." GameSpot walkthrough, Studio Rankings/Movies: "you might want to try stockpiling three or four five-star productions and then release them all at once." (a recency-exploit tip consistent with decay). Engine field name "reputationfactor" (F19) matches the reading.
- Proves: the original deliberately *rejected* durable library value in its standing metric. Old films counted for nothing after decay, in rating or in cash.
- Confidence: HIGH.
- Prior prose: **QUALIFIED** — original_formulas.json and MECHANICS-BIBLE record the 24% weight but omit the decay rule; P15 §5.1 says "current comparative composite" (correct) without the decay evidence. The assignment's framing "Movies ... i.e., a form of library value" is **CORRECTED**: it is the opposite of library value.
- Class: PRIMA + CONTEMPORARY PROFESSIONAL + TECHNICAL ARTIFACT.

**F21. Awards term counted only the most recent ceremony; "Most Prolific Studio" counted releases since the previous ceremony — again windowed, never cumulative.**
- Source: Prima p.51 (line 453): "Awards 14% of Studio Rating The Awards score represents the number of awards your studio has won at the most recent award ceremony." Prima p.79 (line 627): "Most Prolific Studio 1960 Studio that releases the most movies since the previous awards ceremony."
- Proves: no cumulative filmography/legacy metric fed standing. Lifetime Honors (Gold/Platinum) were checklists, not valuations (P15 §5.6).
- Confidence: HIGH. Prior prose: **CONFIRMED**. Class: PRIMA.

### H. Stunts & Effects (2006)

**F22. The expansion added no corporate, ownership, library, or rival mechanic.**
- Source: official S&E manual p.2 "WHAT'S NEW" (pdftotext of Steam CDN PDF): "the basic game is still intact: run the studio, make the stars, shoot the movies. The Movies: Stunts & Effects expansion pack introduces several new ways ... • Stuntmen, a new class of characters ... • Three new training facilities ... as well as a Hospital facility ... • All new scenes ... • Over a dozen new sets, including blue-screen, green-screen and miniature cities. • New costumes ... • Spe […]". p.9 "New Awards": "new stunt-specific Awards and Achievements ... giving them an extra edge over your rival studios!" Also a "Quick Start" mode with a "Pre-Built Studio Lot ... along with a small stable of employees and Stars". JPaterson S&E guide facility list (lines 95–200) adds only Stunt School, Hospital, Training facilities, SFX/Propshop sets, Stunt Performers; SSSF unchanged (lines 932–940); rivals unchanged (F4).
- Proves: nothing corporate was added; the pre-built lot is a start-state convenience, not an acquired studio.
- Confidence: HIGH.
- Prior prose: **CONFIRMED** (P15 §6 "Stunts & Effects redesigned rivals — no verified change"). MECHANICS-BIBLE line 1452 (stunt track) consistent.
- Class: SHIPPED RETAIL (OFFICIAL).

### I. Online service (for completeness, not sim law)

**F23. "Archive"/"library" vocabulary in The Movies Online referred to community storage of award-winning uploads and a studio page with "release history"; it is a web service, not simulation economics.**
- Source: Prima p.18 (line 184): "viewers can stream or download all your current and awardwinning archived releases, view listings for your past films ... learn about your studio release history"; "If, however, a movie wins an award and is preserved for long-term availability ('Archived'), the file's size ceases to count against your studio's storage allotment." Lionhead Wiki: site shut down December 2014.
- Proves: the only place the original treated a filmography as a persistent, browsable asset was outside the sim.
- Confidence: HIGH. Prior prose: **NEW** (disambiguation). Class: PRIMA + COMMUNITY MEMORY.

### J. Official marketing framing

**F24. Lionhead's own product blurb framed rivalry as chart competition and technology-adoption timing only.**
- Source: The Movies Game Wiki main article, reproducing "Movies Game page on the Lionhead Website": "competing with others to create a string of box office smashes ... Will you decide to innovate and introduce the talkies, color or digital sound before any of your rivals? Or will you let the other studios make the investments, leaving you to jump on the bandwagon".
- Confidence: MEDIUM (second-hand reproduction of official copy; original site not retrievable — Flash). Prior prose: **NEW**. Class: COMMUNITY MEMORY quoting OFFICIAL.

---

## 4. Design implications for P16 (this agent's inference — not evidence, not Owner direction)

1. **Parity budget is empty.** Every P16 mechanic (StoryProperty, rights, library value, acquisition, auction, labels) is successor design. Documentation must never call any of it "original parity". (F2, F3, F16, F20.) Consistent with P15 §5.5 and roadmap §20 — SUPERSEDED BY OWNER DIRECTION is the correct label for the *decision to build them*; the *facts* stand.

2. **The original already contained the two anti-flip primitives P16.K asks for:** (a) time-vesting to full sale value ("eight years before they can be sold for full market value ... until then ... a rising fraction") and (b) decline tied to remaining useful life (age 55). Transposed to Story Properties/library rights: a holding-period discount on resale and a value curve tied to remaining exploitation potential are legible, precedented, and need no artificial cap. (F7.)

3. **Disclosed, deterministic price beats a bargaining sim.** The original showed the price on hover and in the Finance screen; the assignment's §2.L/§2.N demand transparency. A P16 "market value" line per asset (visible before any sale) is the original's pattern and matches Owner preference for no opaque simulator. (F7, GameSpot Finance quote.)

4. **Separate viewing-archive from economic library.** The original conflated "archive" with "dead". P16.C's "separate historical value from current cash flow" is exactly the correction: a film's *record* should be permanent and browsable (the original even made archiving irreversible), while *cash* from old films must wait for an owning distribution/media system (P18). Do not re-import the pre-release "VHS/DVD royalties" idea as a P16 weekly trickle. (F13, F15.)

5. **Standing decay is a lesson, not a bug.** The original's Movies term decayed so studios had to keep producing. P16 library value entering *valuation* should be a separate, non-decaying asset line, while P08/P15 standing keeps its recency behaviour — otherwise old libraries become a standing snowball. (F20.)

6. **Shelving is a real ownership decision.** The original let you bury a finished film to protect standing (F14). P16A should keep "unreleased/shelved" as a StoryProperty/film state with the property retained (unlike the original, where shelving was irreversible and valueless). Cheap, legible, precedented.

7. **Talent is not inventory** (already P14 law). The original sold people like scripts; P14 rejected that. P16.K's sellable categories correctly exclude people. Rival "hiring" in the original was free-agent queueing — the P14 lawful-transition model already covers this; P16 acquisition should transfer *contracts* (P14 objects), never "sell" people. (F5, F9–F12.)

8. **Debt/bankruptcy is wholly successor design.** The original's soft-lock plus a debt-buildable selling facility is a useful *recovery valve* precedent for §2.K ("asset sales may become a recovery mechanism before bankruptcy"): the recovery tool was always available and cheap. (F6, F17.)

9. **Facility depreciation exists as precedent** for §2.G option 4 (transferable equipment sold at depreciated value) and for BOOK NET WORTH in §2.N: buildings had a depreciated sell-back but never transferred. Physical property → cash, never teleport. (F18.)

10. **Rival roster only grows.** P15/P16 closure and acquisition will be the first time a studio ever *leaves* the chart; the corporate-history register (§2.I) has no original precedent and must be designed from scratch. (F4.)

## 5. Open questions

1. Executable behaviour of a *sold* Star: does the Star reappear at a named rival, in the player's queue later, or vanish? No source. (UNVERIFIED)
2. Whether a purchased script ever surfaces as a rival release, or is simply deleted. No source. (UNVERIFIED)
3. Exact market-value formula and the "rising fraction" vesting curve; whether "image" (Mark_E) is a real input. (UNVERIFIED / LOW)
4. Age-55 (Prima) vs age-50 (JPaterson S&E guide) inflection: expansion change, guide error, or engine constant? (LOW; treat 55 as controlling)
5. Whether rival studios' "personality" tables (Prima p.51) drive anything beyond genre choice (e.g., star poaching intensity). Absence-based; not resolvable without the executable.
6. Whether the retail Archive truly blocked re-viewing (Prima "can't be brought back" vs "view any of your studio's archived movies") — likely "cannot return to release", but wording conflicts. (MEDIUM)
7. Eurogamer/PC Gamer reviews not consulted; could contain additional contemporary framing of rivals. Low expected value given uniform silence elsewhere.
8. The raw `facility_sell.ini` (476 bytes) and `global.ini` are catalogued in TECHNICAL-ARTIFACTS but not in this corpus export; they could confirm whether any market-value constants live in data files. Not inspected here.

## 6. Source table

| # | Source | Class | Locator | Used for | Access |
|---|---|---|---|---|---|
| S1 | Official PC manual (Lionhead/Activision, QXP file dated 9/27/05) | SHIPPED RETAIL | `original-corpus/manual_english.txt` lines 110–137 (pp.6–7), 375–384 (pp.14–15), 428–431 (p.17), 490–532 (pp.20–21) | F5, F10, F13, F17, F19 | local |
| S2 | Prima Official Game Guide (Kramer, 2005; Lionhead-reviewed) | PRIMA-MANUAL | `original-corpus/prima_eguide.txt` lines 28 (p.7), 184 (p.18), 208 (p.14), 226 (p.22), 250–256 (pp.20–21), 411 (pp.44–45), 417–423 (pp.45–47), 453 (p.51), 495, 519 (p.61), 627 (p.79), 639 (p.8), 765 (p.98) | F2, F4, F6–F9, F11–F13, F16–F21, F23 | local + archive.org OCR (partial) |
| S3 | Official *Stunts & Effects* manual (Apr 2006) | SHIPPED RETAIL | Steam CDN PDF → pdftotext; "What's New" p.2, "New Awards" p.9, "Game Modes" p.4 | F22 | web (WebFetch binary + pdftotext) |
| S4 | GameSpot walkthrough, M. Rorie, 21 Feb 2006 | CONTEMPORARY PROFESSIONAL | https://www.gamespot.com/articles/the-movies-walkthrough/1100-6140049/ — General Tips; Buildings → Production Office, SSSF; Studio Rankings → Movies | F5, F7, F8, F11, F13, F14, F20 | Chrome |
| S5 | GameSpot review, R. Davis, 8 Nov 2005 (8.2) | CONTEMPORARY PROFESSIONAL | https://www.gamespot.com/reviews/the-movies-review/1900-6139475/ | F5, F16 | Chrome |
| S6 | IGN review, D. Adams, 9 Nov 2005 | CONTEMPORARY PROFESSIONAL | https://www.ign.com/articles/2005/11/09/the-movies | F17 | Chrome |
| S7 | GameSpot E3 2002 First Look, S. Parker, 21 May 2002 | PRE-RELEASE CLAIM | https://www.gamespot.com/articles/e3-2002-first-look-the-movies/1100-2866856/ | F1 | Chrome |
| S8 | GameSpot Preview, A. Park (pre-release content; page stamp unreliable) | PRE-RELEASE CLAIM | https://www.gamespot.com/articles/the-movies-preview/1100-6089840/ | F15, F17 | Chrome |
| S9 | GameFAQs FAQ by Maxx (2005–2008) | CONTEMPORARY PLAYER GUIDE | `The_Movies_-_FAQ_-_PC_-_By_Maxx_-_GameFAQs.txt` lines 390–394, 609–627, 800–812, 958–966, 2364–2400 | F4, F7, F8, F11, F18 | local |
| S10 | GameFAQs guide by Mark_E_1990 v3.0 (19 Mar 2006) | CONTEMPORARY PLAYER GUIDE | `...Mark_E_1990...txt` lines 504–512, 636–644, 705–713 | F7, F8 | local |
| S11 | GameFAQs S&E guide by JPaterson000 v0.3 (7 Jul 2006) | CONTEMPORARY PLAYER GUIDE | `...JPaterson000...txt` lines 95–200, 405–420, 688, 932–940, 1625–1633, 2020–2060 | F4, F7, F13, F22 | local |
| S12 | Box Office Mojo, S. Saulsbury, 3 Nov 2005 | CONTEMPORARY PROFESSIONAL | https://www.boxofficemojo.com/article/ed1786184708 | F2 (absence) | WebFetch |
| S13 | Wikipedia "The Movies (video game)" | COMMUNITY MEMORY | https://en.wikipedia.org/wiki/The_Movies_(video_game) | F2 (absence); citation list | WebFetch |
| S14 | Lionhead Wiki (Fandom) "The Movies" | COMMUNITY MEMORY | https://lionhead.fandom.com/wiki/The_Movies | F23 (site shutdown) | Chrome |
| S15 | The Movies Game Wiki (Fandom) main article; SSSF and Production Office pages (empty) | COMMUNITY MEMORY | https://the-movies-game.fandom.com/wiki/The_Movies_(Game) | F24 | Chrome |
| S16 | forceforgood.co.uk retrospective, 8 Dec 2012 | COMMUNITY MEMORY | https://forceforgood.co.uk/strategy/the-movies/ | F2 (absence) | WebFetch |
| S17 | TECHNICAL-ARTIFACTS registers (employeemod global.ini / facility_sell.ini catalogue) | TECHNICAL ARTIFACT (modded data; treat as corroboration only) | `TECHNICAL-ARTIFACTS/schema_fields.csv` TECH-SCHEMA-004/007; `facility_candidates.csv` TECH-FAC-026 | F6, F19, F20 | local |
| S18 | Prior prose: MECHANICS-BIBLE.md, original_formulas.json, all_reconciled_facts_appendix.csv, source_conflicts.csv; P15 package §5–6; P14 package reconstruction table; roadmap §8/§20 | PRIOR PROJECT PROSE | as cited inline | status labels | local |
| — | archive.org Wayback API; lionhead.com/themovies; themoviesgame.com (Flash); Eurogamer review (404); PC Gamer print | — | — | FAILED / not consulted | — |

**Bottom line for the report author:** the retail original had exactly one ownership transaction (sell a Star or a script to "rival studios" for a disclosed, vesting, age-decaying price), one physical liquidation (demolish a building for a depreciated refund), one irreversible film decision (release or shelve; archive = dead), a decaying reputation term where a library term would sit, a soft debt lock with no insolvency, and a rival roster that only grows. Acquisition (2002) and library royalties (pre-release preview) were both promised and both cut. *Stunts & Effects* changed none of this.
