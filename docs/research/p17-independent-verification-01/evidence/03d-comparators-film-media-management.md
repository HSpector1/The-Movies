# P17 Comparator Atlas 03d — Software Inc. + Film/Media-Management Tycoons

Scope: Software Inc. (Coredumping); Moviehouse – The Film Studio Tycoon; Blockbuster Inc.; The Executive
(Aniki Games/Goblinz, working title "Total Mayhem" in the brief); Hollywood Mogul 3→4; Movies Tycoon;
Filmmaker Tycoon; Movie Studio Tycoon-style mobile titles; and the thin remainder of the
Cinema Tycoon / Film Tycoon / "Show Business" bucket that could be verified in the time available.

All Steam appids confirmed against cached JSON before use: Software Inc. = 362620; Moviehouse = 1576280;
Blockbuster Inc. = 1793090; The Executive = 2315430; Hollywood Mogul 4 = 3536760; Movies Tycoon = 2659050;
Filmmaker Tycoon = 778010. Cached raw evidence lives under
`/private/tmp/claude-501/-Users-bruce/3f469c9d-8c5a-4e57-b351-5828c7e97a45/scratchpad/p17/evidence/raw/`
(referenced below as `raw/<file>`); live web fetches are cited by URL. Review permalinks use the standard
Steam format `https://steamcommunity.com/profiles/<steamid>/recommended/<appid>`.

Two files in `raw/` (`gdt_sequels.html`, MGT1/MGT2/thread_ipvalue/thread_boots/patchthread files) are
**Mad Games Tycoon / Game Dev Tycoon** evidence, out of this ticket's named scope, and are not used here
except where a game under study explicitly compares itself to them (cited as such, not as a comparator
in its own right). `raw/reddit_old_search.html` and `raw/reddit_search1.json` are dead Reddit login-wall
captures (COMMUNITY INFERENCE attempts that failed) and are not usable evidence.

---

## 0. Headline cross-cutting pattern (read this first)

Every 2023–2026 film-tycoon title in this set either ships or promises the same three-part taxonomy the
Owner has already chosen for Project: Studio — **sequel / prequel / spin-off / reboot** as separate
continuation types — but every one of them **also produces confused players who cannot tell the
difference between "IP" and "Franchise"**, or between "sequel" and "franchise," in their own UI. This is
the single most consistent structural risk in the genre and it recurs in three unrelated codebases (The
Executive, Movies Tycoon, and — inverted — Software Inc.'s IP-vs-fans split). See §8.

Second pattern: **promised franchise/sequel systems that never ship, or ship years late, while dev
attention visibly moves elsewhere** (Blockbuster Inc. promised an "IP system... including sequels and
prequels" in June 2024 and, per the cached patch-note corpus, never shipped it before the developers
told players on Discord they were stepping away in May 2025). See §3.

Third pattern: **sequel-quality carryover that players cannot see or predict** — reusing the exact
inputs that made the original a hit produces an unrelated (often worse) score on the sequel, in both
Moviehouse and Movies Tycoon independently. This is a specific, avoidable trust failure, not a vague
"needs more depth" complaint. See §2, §6.

---

## 1. Software Inc. (Coredumping / Kenneth Otto Larsen)

Steam appid 362620. Not a film game — included per the task brief as the product-sequel/IP-recognition
comparator for a single-genre business sim that has been in active development for 11+ years.

### Sequel / version mechanics
- Sequels are a real, tracked relationship between products: a 2024 patch changed automation so
  "Project management will no longer update tech of products that have a sequel out" — i.e., the sim
  itself treats "has a sequel" as a state that stops further investment in the predecessor.
  Source: Patch notes for Beta 1.8.8, 2024-10-09; `raw/news_362620.json` (title match) and
  `raw/swinc_news_hits.txt` line ~64; URL
  https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/6360862737592607738.
  Confidence HIGH; tier DEVELOPER/OFFICIAL.
- A 2026-08-05 "Overhaul update" reworked pre-release marketing into **Pre-marketing** (replaces the old
  hype task; only way to gain "followers"/hype pre-release) and **Messaging** (4–8 updates during dev
  that "hone in on your target audience and increase your reach... allow you to hype your product and
  nudge your target audience"), and states hype "will increase total audience reach, but also audience
  expectations, so you better not make too many promises" — an explicit hype-raises-expectations coupling,
  independently convergent with the Owner's Momentum/Fatigue split (Rule C).
  Source: `raw/news_362620.json` "Overhaul update"; `raw/swinc_news_hits.txt` lines 4-9; URL
  https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1840310314338984.
  Confidence HIGH; tier DEVELOPER/OFFICIAL.

### IP / franchise / fan-recognition state
- Same patch: **"Entire IPs can now gain their own following, separate from the companies' fans."** This
  is the single most on-point sentence in the whole corpus for the Owner's Rule C (Recognition/Momentum/
  Fatigue as properties of the IP, not the studio) — Software Inc. shipped exactly that split (IP-level
  following vs. company-level fans) as of this patch.
  Source: same as above. Confidence HIGH; tier DEVELOPER/OFFICIAL.
- The underlying stat is **Market Recognition (MR)**, tracked per product category, starts at 0 for a
  brand-new IP, and is "grown by releasing quality products (and sequels)"; a sequel raises MR for the
  whole "IP chain," which brings more fans/sales but also "tougher competition" (a self-limiting
  diminishing-return loop, not a flat bonus). Different products in the same category can share MR.
  Source: Steam Community thread "Market Recognition" and related guides, retrieved via WebSearch
  (softwareinc.coredumping.com wiki content is not indexed as a standalone IP page; community guides
  paraphrase the in-game tooltip); https://steamcommunity.com/app/362620/discussions/0/1473096694449300567/
  and https://steamcommunity.com/sharedfiles/filedetails/?id=2926392699. Confidence MEDIUM (community
  paraphrase of a real tooltip stat, not a dev quote verbatim, but corroborated across multiple
  independent threads); tier COMMUNITY INFERENCE.
- **IP recognition/fan following does NOT transfer when an IP changes hands.** A player who bought a
  bankrupt rival's IP (previously selling 2M+ copies) found sales "died straight up" post-acquisition;
  an experienced respondent confirmed: "Unfortunately, 'popularity' does not transfer with IPs." This is
  a direct, load-bearing precedent for the Owner's Rule L (rights transfer; historical films stay
  attributed to the original studio) — Software Inc. chose the harder-line version where the *acquirer*
  effectively starts from a colder position than the seller had, rather than inheriting accumulated
  audience warmth.
  Source: Steam Community thread "Question about IPS,"
  https://steamcommunity.com/app/362620/discussions/0/594013058474480747/. Confidence MEDIUM; tier
  COMMUNITY INFERENCE (player-reported mechanic, not a dev quote, but internally consistent with the
  bankruptcy patch note below).
- Bankruptcy/ownership patch: "All IP from unlisted bankrupt companies is now transferred directly to the
  public domain" (2024-01-12, Beta 1.7.28) and a later fix note: "Fixed public domain IP costing money and
  charging royalties." Confirms a real legal-status field on IP objects (owned / public domain) that
  bankruptcy flips, with its own bugs.
  Source: `raw/news_362620.json`, "Patch notes for Beta 1.7.28"; `raw/swinc_news_hits.txt` lines 91-94.
  Confidence HIGH; tier DEVELOPER/OFFICIAL.
- Patents and IP ownership interact with roles: "Lead designers with the IP Ownership demand can no
  longer work as lead designer on outsourced projects in multiplayer" (2023-09-30) — IP ownership is
  something individual staff can *demand* as a contract term, not just a company asset.
  Source: `raw/swinc_news_hits.txt` line 115 / `raw/news_362620.json` "Patch notes for Beta 1.7.10."
  Confidence HIGH; tier DEVELOPER/OFFICIAL.

### Player experience (representative quotes)
- On the *lack* of a felt quality-differentiation penalty for a lazy sequel: "Like 1981 I make a 2D
  editor. 1984 I make the sequel but I don't change anything AT ALL. I don't add any new features because
  when I do it is marked as overkill. But it sells. Why? Har har insert joke of Madden games being the
  same year, but literally that's what it is." — lörd farkwa ‡, mixed/positive review.
  https://steamcommunity.com/profiles/76561198010992197/recommended/362620. Confidence HIGH (direct
  quote); tier COMMUNITY (player-experience criticism, not a mechanic claim).
- On franchise reliance being *fun and rewarding* rather than punished: "I made Counterstrike and the
  following sequels and they were my biggest hits" — Liren, positive review.
  https://steamcommunity.com/profiles/76561198143772567/recommended/362620. Confidence HIGH; tier
  COMMUNITY.
- Two other reviews ask outright for a *sequel to Software Inc. itself* generalizing into a "broader
  capitalism simulator" — not about the in-game mechanic, noted only to avoid mis-citing it as an
  in-game complaint. (RACER 217259238; Chozzenone11 175771879.)

### (1) Decision created / (2) fun / (3) tedious-exploitable / (4) hard-timer? / (5) sequel spam? / (6) ADOPT-ADAPT-REJECT
1. Decision: *when to sequel an existing IP for MR/fan-following gain vs. spend the slot on a fresh IP
   that starts at 0 MR but avoids the old IP's baggage (esp. if acquired, since following didn't
   transfer).*
2. Fun: the MR-compounds-per-category system rewards specializing a studio's identity around a genre/IP
   without an explicit "genre lock," and the new IP-level-following-vs-company-fans split (2026-08-05)
   makes multi-IP portfolios legible.
3. Tedious/exploitable: player-reported "sequel = zero differentiation still sells" (lörd farkwa) shows
   the review/market-satisfaction formula does not visibly penalize a copy-paste sequel — a genre-wide
   exploit risk the Owner's Rule C (Fatigue rises faster on repeated *mediocre* output) is explicitly
   designed to close.
4. Hard-timer optimization: **no cooldown found in any cached source** — Software Inc.'s own MR model is
   continuous/compounding, consistent with the Owner's Rule D (no hard sequel cooldown). No evidence of a
   "wait N months" gate in this game.
5. Sequel spam: not directly observable as "spam" in the cached corpus, but the lörd farkwa quote is
   exactly the failure mode sequel-spam prevention exists to stop (reviewers not penalizing zero-effort
   iteration).
6. **ADOPT**: IP-level Recognition tracked separately from studio/company-level "fans," exactly as Rule C
   specifies — Software Inc. is the strongest real precedent in this whole batch for that specific split.
   **ADOPT**: rights-transfer-does-not-carry-recognition as one *legitimate* design point on the spectrum
   Rule L leaves open (P16 owns the final call; flag this precedent to P16 rather than deciding it here).
   **REJECT/AVOID**: shipping a sequel-scoring model that a competent player can defeat by copy-pasting
   inputs with zero new content and still profit — Owner Rule C's asymmetric Fatigue curve already guards
   against this, so no change needed, just confirm the reception formula (P07) actually enforces it.

---

## 2. Moviehouse – The Film Studio Tycoon (Assemble Entertainment / Odyssey Studios, 2023)

Steam appid 1576280.

### Sequel mechanics
- Dev confirmation, pre-launch marketing copy: "Unlock sequels, prequels, cinematic universes and more"
  via researching new technologies as the decades advance.
  Source: `raw/news_1576280.json` / `raw/mh_search_sequel.html`, "Welcome To The Party, Pal. -
  Assemble announces movie-Tycoon 'Moviehouse'!", 2022-06-14; URL
  https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/4480532686365315050.
  Confidence HIGH (dev copy) but PRE-RELEASE PROMISE tier for "cinematic universes" specifically — the
  cached patch-note trail (through the last known patch, 1.6.0, 2023-07-04) never documents a
  "universe" feature actually shipping; only the base "sequel" unlock is confirmed shipped (next bullet).
- Dev forum reply confirms sequels are **research/tech-gated**, not calendar/cooldown-gated: "While
  playing, you can research different stuff. After a while, you can unlock and produce Sequels."
  — Assemble_Skoddy (developer), 2023-03-17, in thread "How will the game handle movie sequels? Will it
  be possible to create?" Cached: `raw/mh_search_sequel.html`. Confidence HIGH; tier DEVELOPER/OFFICIAL.

### IP / franchise recognition, fatigue
- No named persistent "Franchise" or "IP" object confirmed in any cached source — the only carry-over
  players describe is at the level of the specific **movie's plot-card selections**, which are supposed
  to reproduce their score when reused for a sequel and, per multiple independent bug reports, do not.

### Player experience — the sequel-scoring trust failure (four independent corroborating threads/reviews)
- "I just made a sequel with the exact same cards selected, and it is thumbs down for all 3." —
  WildDogsGaming, forum post 2023-04-08, `raw/mh_search_sequel.html`.
- "I had a movie where i had three matching cards, making then a sequel with the same cards, they are
  turning to three non-matching cards. WTF! Either the cards are matching and then for all time or not,
  but this is just a dumb system." — Lyciana, forum post 2023-04-10, same cache.
- "A couple years later, I made a sequel for that movie, and selected all the same cards, and they all
  got thumbs down." — WildDogsGaming, follow-up review,
  https://steamcommunity.com/profiles/76561198031441988/recommended/1576280 (recommendationid 136412512).
- Same review, separately: "I started with the same 2 actors I ended with... As I increased their star
  rating, they had more fans than the top stars. And because the star points actually make the movies
  better, it was just better to al[ways use the same two]" — confirms a **star/fame stat that compounds
  and materially improves film quality**, and that reviewers found sticking with the same 2-person cast
  from start to finish strictly dominant (a cast-continuity snowball with no counterweight found).
  Confidence HIGH for all four (direct quotes, independently written); tier COMMUNITY (mechanic
  description via player experience, not dev-confirmed) — the pattern recurring across four separate
  authors elevates it from anecdote to a real, still-live UX/tuning defect. No cached patch note ever
  claims to fix it (last cached patch 1.6.0 predates most of these reports and did not address it).
- Structural context corroborating the sequel-scoring complaints being *symptomatic of abandonment*, not
  a since-fixed launch bug: a professional outlet already lumped Moviehouse (and Filmmaker Tycoon) in
  with "mostly negative"-status also-rans of the genre by 2024: "In recent years there have been a few
  attempts to make a game like The Movies, with games like Moviehouse and Filmmaker Tycoon sitting pretty
  at 'mostly negative' status on Steam." — Rock Paper Shotgun, syndicated via Blockbuster Inc.'s own
  Steam news feed, 2024-03-21; `raw/news_1793090.json` "Another new The Movies-like is coming this
  summer..."; original URL
  https://www.rockpapershotgun.com/another-new-the-movies-like-is-coming-this-summer-to-fulfil-the-
  promise-of-your-nostalgia. Confidence HIGH (direct quote, named outlet); tier CONTEMPORARY
  PROFESSIONAL SOURCE.

### (1)-(6)
1. Decision: whether to gamble a sequel on the same "winning" card combination once tech-unlocked, or
   treat every sequel as a fresh card-matching puzzle.
2. Fun (when working): festival circuit + tech-unlock pacing gives sequels a clear "you earned this"
   gate; the star-fame-compounds-quality loop makes a stable cast an appealing long-term investment.
3. Tedious/exploitable: **the sequel-scoring randomness is not fun-tedious, it is trust-breaking** — four
   independent authors describe identical inputs producing opposite outputs with no visible cause, which
   reads as broken rather than as a deliberate risk. The same-2-actors-forever exploit is a real design
   gap (fame/skill snowball with no diminishing return or fatigue counterweight found).
4. Hard-timer optimization: no cooldown found; gate is tech/research, consistent with a "continuous,
   earn-the-slot" model rather than a wait-timer.
5. Sequel spam: not directly evidenced, but the UI gap noted for The Executive/Movies Tycoon (no
   per-franchise grouping view) is corroborated here too — "Script II - No Option to tell her/him to make
   a sequel" (Lyciana, `raw/mh_search_sequel.html`) shows sequel-initiation itself was, at points, missing
   from parts of the production flow.
6. **ADOPT the failure as a warning, not the mechanic**: whatever P07's reception formula does with a
   sequel's inputs, it must be *legible* — if a player reproduces a predecessor's inputs, the game should
   either visibly explain why the outcome differs (fatigue, market shift, cast change) or reproduce a
   similar-band outcome. An opaque "the exact same choices sometimes score oppositely" outcome is the
   single clearest thing to avoid in this whole atlas. **REJECT** an unbounded cast-continuity snowball
   with no counterweight (a signature-lead lock-in effect is exactly what Owner Rule F says to prevent).

---

## 3. Blockbuster Inc. (Ancient Forge / Super Sly Fox, 2024)

Steam appid 1793090. Explicitly self-describes as a "spiritual successor" to The Movies (2005).
Source: dev reply, "Hey there! We love The Movies and are definitely inspired." — Super Sly Fox
(developer), `raw/bb_search_sequel_p2.html`, 2024-06-06. Confidence HIGH; tier DEVELOPER/OFFICIAL.

### Sequel/franchise mechanics — promised, not shipped, then game abandoned
- Pre-launch UI already has "a box where sequels and prequels would be listed" on a movie's detail
  screen, but as of July 2024 no player could find a way to actually populate it: "It looks like
  connecting movies as sequels or prequels is intended to be a feature in the game but I'm not sure how
  to do it... Does anyone know the actual game mechanic that connects movies as sequels?" — connerxlc,
  2024-07-21, `raw/bb_search_sequel.html`. Confidence HIGH (direct quote); tier COMMUNITY.
- **Developer confirms, in-thread, that sequels/prequels are not yet implemented and are planned**: "You
  cannot build your own streaming service at the moment but there will be an IP system within the game
  soon, including sequels and prequels. Keep in mind we are only 3 people developing the game so we might
  need a bit more time than usual to add things." — Super Sly Fox (developer), 2024-06-06,
  `raw/bb_search_sequel_p2.html`. Confidence HIGH; tier PRE-RELEASE PROMISE.
- **That promise is never fulfilled in the cached patch history.** Scanning every cached news item's full
  text (through the last cached post, "Happy Holidays," 2024-12-24) for "sequel," "franchise," "prequel,"
  "reboot," "spin-off" turns up exactly one hit — the March 2024 RPS syndication discussing the *real*
  1990s/2000s history of the genre, not a Blockbuster Inc. feature. Patch 1.9.0 (2024-10-28, "Update
  beyond human imagination!") — the single largest patch in the cache — adds a shared consumer-sales
  pool, rival bankruptcy, employee stress/resignation, a quarterly calendar, and difficulty tiers, but no
  IP/sequel system. Source: full-text keyword scan of `raw/news_1793090.json` (60 items) plus manual read
  of 1.9.0 and 1.8.0 ("Meet the superheroes!," 2024-07-29). Confidence HIGH (negative finding from
  complete corpus, not sampling); tier DEVELOPER/OFFICIAL (absence-of-feature claim from the developers'
  own announcement channel).
- **The game was reportedly abandoned by its 3-person team in May 2025**, per a player's dated review
  edit: "[Edit: May 5, 2025] The developers announced on their discord that they have abandoned the game
  due to negative reviews. That they no longer have time to work on the game because they have to find
  other jobs." — Sileka, review, https://steamcommunity.com/profiles/76561198015183752/recommended/1793090
  (recommendationid 168252699). Confidence MEDIUM (secondhand report of a Discord statement inside a
  Steam review, not a primary Steam-news post — no cached news item post-dates Dec 2024 to corroborate
  directly); tier COMMUNITY (player-reported). **If confirmed, this is the single most direct cautionary
  tale in the corpus for "announce a franchise system on the roadmap before you can ship it."**

### Fame/needs mechanic (shipped, and already showing the exact risk Owner Rule F flags)
- "your actors/directors/producers gain fame so fast that it becomes impossible to keep them happy. With
  only 5 5-star resident slots and no access to better quality food until research (which is painfully
  slow) they're destined to be miserable." — Bofa D Snuts, review at launch,
  https://steamcommunity.com/profiles/76561197983190667/recommended/1793090 (recommendationid
  166874004). Confidence HIGH (direct quote); tier COMMUNITY. This is a shipped fame-escalation mechanic
  (talent needs scale with fame, capacity does not) producing exactly the "unavoidable escalating
  demands" failure mode Owner Rule F says Project: Studio must prevent — useful as a negative exemplar.

### Licensed-IP-adjacent content (shipped, via parody rather than real licensing)
- 1.8.0 ("Meet the superheroes!," 2024-07-29) added playable pastiche characters press covered as
  Deadpool/Wolverine-alike: "an indestructible claw-man and the iconic samurai" — legally distinct
  parody IP, not a licensing system. PC Gamer coverage, syndicated on the game's own news feed:
  "Deadpool & Wolverine is blowing up the box office... You can make your own Deadpool & Wolverine movie
  in Blockbuster Inc... yet still legally distinct from Marvel." `raw/news_1793090.json`; original
  https://www.pcgamer.com/games/sim/make-your-own-deadpool-and-wolverine-movie-with-this-surprisingly-
  deep-movie-studio-management-sim. Confidence HIGH; tier CONTEMPORARY PROFESSIONAL SOURCE for the press
  framing, DEVELOPER/OFFICIAL for the patch content itself.

### Player wishlist for what a real system should look like (unimplemented, but a useful spec)
- "IP Control — sort of like mad games tycoon 2 where you can have multiple IPs which gain or lose
  reputation based on saturation of the market and quality of the content being released. Sequels and
  Spinoffs — ...using Star Wars for an example you could have a mainline series of films which spin off
  into TV shows, linking to the IP side of things." — JPLP, `raw/bb_search_sequel_p3.html`, 2024-06-07.
  Confidence HIGH (direct quote); tier COMMUNITY (feature request, not a shipped or promised mechanic).

### (1)-(6)
1. Decision (never actually reached shippable form): none — the mechanic doesn't exist, so no player
   decision was ever created around it.
2. Fun: N/A for the sequel system; the shipped fame/needs loop is *engaging* early (per multiple other
   reviews) but the same reviewers flag it as an unmanageable treadmill once fame outpaces capacity.
3. Tedious/exploitable: N/A (unshipped).
4. Hard-timer optimization: N/A (unshipped).
5. Sequel spam: N/A (unshipped).
6. **REJECT the process, not a mechanic**: do not announce a franchise/rights system on a public roadmap
   before its data model and UI exist; Blockbuster Inc.'s "sequels/prequels — coming soon" promise sat
   unfulfilled for the entire remaining life of the project and left a permanently-dead UI affordance
   (the empty "sequels and prequels" box) that damaged trust. **ADOPT the cautionary shape of the fame/
   needs finding**: any Project: Studio talent-needs system tied to fame growth must scale capacity (or
   cap demands) alongside fame, exactly the guard Owner Rule F already specifies — Blockbuster Inc. is
   the clearest shipped example of what happens when a comparator skips that guard.

---

## 4. The Executive — Movie Industry Tycoon (Aniki Games / Goblinz Publishing, Feb 2025)

Steam appid 2315430. Explicit spiritual sequel to Game Dev Tycoon, moved into the film industry; the most
mechanically complete and best-documented franchise system in this entire batch (developer "guillaume"
is personally active answering mechanic questions on the Steam forum).

### Sequel/franchise/IP taxonomy (shipped) — and the IP-vs-Franchise confusion it causes
- Dev, directly answering "Franchise Name VS. IP Name?": **"An IP can contain multiple franchise[s].
  Everytime you make a spinoff, you spawn a new franchise within that IP."** Example given in-thread:
  "The Walking Dead = IP but also Franchise. Fear The Walking Dead = Same IP but a new Franchise." —
  guillaume (developer), 2025-02-14, `raw/ex_search_franchise.html`. Confidence HIGH (direct dev quote);
  tier DEVELOPER/OFFICIAL. **This is the closest real-world precedent to the Owner's "bounded named
  SubProperties under a parent StoryProperty" model (Rule J)** — an IP is the parent property, each
  spin-off seeds a new bounded branch/franchise under it, exactly the shape Rule J and Rule N ask for.
- BUT: at least four separately-dated forum threads titled "Difference IP and Franchise name?" / "IP and
  Franchise Name?" over Feb–Apr 2025 show players still could not tell the two apart months after the
  dev's clarification, and a still-later player review complains the shipped mechanic in fact **only
  allows one franchise per IP** despite the dev's stated "multiple franchises per IP" intent: "I really
  dislike the way IPs are implemented. Instead of being able to have multiple franchises inside of each
  IP à la MCU or DCU, you can only put one franchise inside of each IP... it seems to only serve as an
  extra title for your franchise." — assassinknown, review,
  https://steamcommunity.com/profiles/76561198133574565/recommended/2315430 (recommendationid
  197344471). Confidence HIGH (direct quotes on both sides; genuine unresolved gap between stated design
  intent and at least one player's shipped experience, not fully reconciled in the cached corpus); tier
  DEVELOPER/OFFICIAL for the dev statement, COMMUNITY for the contradicting player report. **This is the
  strongest cross-game evidence that "IP contains Franchise contains installments" is intuitive to design
  but hard to make legible in UI** — directly relevant to the Owner's insistence (Rule J, "not every
  fictional noun is IP") that the object model stay simple; The Executive shows that even a *correct*
  two-level model reads as confusing without a visible grouping/tree view.
- Dev roadmap statement confirming a **planned "Universe" tier above Franchise** (an IP holding multiple
  franchises that can cross over), i.e. the same problem being actively worked on post-launch: "Yes, you
  will have the ability to create IPs with multiple franchises in it :p MCU, DCU choose your camp!" —
  guillaume, 2025-01-31, `raw/ex_search_franchise_p2.html`. Confidence HIGH; tier PRE-RELEASE PROMISE
  (stated intent; not confirmed shipped in cached patch notes through 1.3.2, 2025-06-15).
- One prequel per franchise is a stated, tooltip-documented rule, but it is exploitable: "I am able to do
  infinite prequels even though the game's tool tip says you can only do one per franchise :P" — Horus
  Takes Flight, review, https://steamcommunity.com/profiles/76561198164152048/recommended/2315430
  (recommendationid 232544100). Confidence HIGH (direct quote); tier COMMUNITY. Confirms (a) a real
  per-franchise cap exists by design and (b) it is not enforced in the shipped build the reviewer played.
- Explicit continuation-type taxonomy is shipped and named consistently across dev copy and players:
  sequels, prequels, reboots, and spin-offs (plus "adaptations" per one review) all appear as distinct,
  nameable actions. Sources: pros list "Lots of options like Sequels, Prequels, Reboots and Spin-offs" —
  TheOnlyGaming, https://steamcommunity.com/profiles/76561198887003710/recommended/2315430
  (recommendationid 202420576); "I loved navigating the IP mechanic with the sequels, adaptations,
  prequels, reboots, and spinoffs." — InfinityPlusOne,
  https://steamcommunity.com/profiles/76561198023667856/recommended/2315430 (recommendationid
  207415650). Confidence HIGH; tier COMMUNITY, corroborating the dev-stated design.

### Franchise ownership / licensed IP marketplace (shipped 1.1.0, Mar 2025)
- **IP Marketplace**: "you can acquire the rights to iconic (spoofed) novels, TV shows, video games, and
  more... Discover 700+ spoofed IPs inspired by renowned cultural franchises. Explore 6 different media
  sources: Cartoons, Graphic Novels, Manga/Anime, Novels, TV Shows, and Video Games. Invest in powerful
  new IPs – with a catch! The most valuable IPs come with tough conditions. **Fail three times, and you
  lose the IP.**" — Patch Notes 1.1.0, 2025-03-13; `raw/news_2315430.json`; URL
  https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1794102528076260.
  Confidence HIGH; tier DEVELOPER/OFFICIAL. Direct precedent for Owner Rule E (rights can be controlled
  independent of commercial success) — but note The Executive ties *loss of the license itself* to
  repeated commercial/quality failure, which the Owner has explicitly ruled OUT for Project: Studio
  ("legality never gated on commercial success"). **Flag, don't adopt**: this is exactly the kind of
  rule the brief says to note as a structural contrast without reopening the Owner's decision.
- **Sell Your IPs** (patch 1.3.0, 2025-06-15): "Need a cash injection? You can now sell intellectual
  properties you've created or acquired." Confirms IP-as-liquid-asset design, and confusion about it in
  the same forum ("What happens when you sell the IP franchise? because im abit confused with it" —
  donutmaker, `raw/ex_search_franchise_p2.html`, 2025-07-09) — another instance of the IP/franchise
  naming confusion pattern. Source: `raw/news_2315430.json`, URL
  https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1802354289661571.
  Confidence HIGH; tier DEVELOPER/OFFICIAL for the feature, COMMUNITY for the confusion.
- Achievement **"Superstar Cameo" — "Cast a supporting actor/actress with a popularity score of at least
  90"** (5.9% of players) sits alongside **"Superstar" — "Cast a lead actor/actress with a popularity
  score of at least 90"** (8.9%) and **"Pulling Power" — "Cast a director with a popularity score of at
  least 90"** (14.0%). Source: Steam Community Global Achievements page for The Executive,
  `raw/exec_ach.html`. Confidence HIGH (achievement text is shipped game data); tier DEVELOPER/OFFICIAL.
  This is the clearest **fame-modeled-separately-from-skill** evidence in the whole batch: popularity is
  a numeric score (0-100) attached independently to lead, supporting, and director slots, and the game's
  own flavor text uses "Cameo" for a big name in a smaller-than-lead role — though note The Executive does
  **not** appear to have a distinct CAMEO *role class* (no smaller-than-supporting slot found in any
  cached source); "cameo" here is achievement flavor language for "supporting + high popularity," not a
  separate role tier. Several achievement names ("We are Groot," "Last Survivor of the Nostromo, signing
  off," "I'll Be Back," "Are You Not Entertained," "Everybody be cool, this is a robbery") are direct
  jokes tied to producing spoofed versions of famous IP via the marketplace, corroborating that the IP
  Marketplace's "spoofed IP" content is a first-class, celebrated part of play, not a minor feature.
- **"Extended Universe" — "First franchise"** (74.4% of players) and separately **"Citizen Kane" — "First
  classic movie"** (56.4%) / **"Rocky Horror Picture Show" — "First cult movie"** (35.7%) confirm a
  Back-Catalogue legacy-status system (Classic vs. Cult) independent of the franchise system — i.e., two
  parallel "does this movie have lasting cultural weight" tracks (franchise membership, and
  classic/cult status) that do not appear to be unified into one score. Source: `raw/exec_ach.html`.
  Confidence HIGH; tier DEVELOPER/OFFICIAL.

### Fatigue / audience expectations (community-inferred but corroborated with dev-adjacent thread activity)
- Two independent threads list the same unlabeled formula ingredients for movie reception, including
  **"Topic fatigue"** and **"Franchise popularity"** as explicit named factors alongside Budget, Genre(s),
  Rating, Director, Actor, and slider correctness: "Factors to consider: Budget Genre(s) Rating Director
  Actor Correct match between genre(s) vs theme vs rating Correct sliders **Topic fatigue** **Franchise
  popularity**." — Bobbyaxe, two threads ("Sodascore," "how to get higher movie ratings"),
  `raw/ex_search_franchise_p2.html` and `_p3.html`, Feb 2025. Confidence MEDIUM-HIGH (repeated
  independently by the same knowledgeable player across two threads in a forum the developer actively
  posts in, uncontradicted); tier COMMUNITY INFERENCE. This is the clearest evidence in the batch of a
  shipped, explicit **Fatigue as its own named factor separate from Franchise popularity** — i.e., a
  comparator that already, in practice, treats "genre/topic tiredness" and "franchise strength" as two
  different numbers feeding one reception score, structurally adjacent to (though not identical to) the
  Owner's three-factor Recognition/Momentum/Fatigue split (Rule C).
- Genre-level fatigue (not franchise-level) is explicitly criticized as punishing: "it punishes
  specialization with genre fatigue" — Adopted.jpeg, negative review,
  https://steamcommunity.com/profiles/76561198128713260/recommended/2315430 (recommendationid
  187734558). Confidence HIGH; tier COMMUNITY.
- Cast-continuity signal exists as a stat, but its carry-over is buggy/unclear at sequel time: "Making a
  sequel, actor's script affinity from last movie is zero. Why?" with a reply arguing design intent should
  be "the same actors should be preferred in prequels or sequels (or even in franchise)." —
  Titule/`raw/ex_search_franchise_p2.html`, 2025-07-06. Confidence MEDIUM (a bug report/feature debate,
  not a confirmed dev answer in the cached page); tier COMMUNITY.

### Emergent design tension praised by players (directly relevant to Owner Rule G/D)
- "the game is realistic in that it discourages experimentation over franchises and IP exploitation. If
  you want to be solvent, you have to churn out winning formulas over and over to justify more
  experimental work." — The Royal Seal, positive review,
  https://steamcommunity.com/profiles/76561197968826307/recommended/2315430 (recommendationid
  198347443). Confidence HIGH; tier COMMUNITY. This is a **praised** emergent outcome that closely
  matches what the Owner's model should also produce (franchise reliance funds risk-taking) — worth
  citing as validation that the three-factor model, if it produces this same tension, will read as
  realistic and fun rather than as a grind.
- "Getting a 19-year-old Tom Cruise onboard for a low budget horror film only to turn it into a
  long-running movie franchise was good fun!" (via a real-actor-names mod) — WestHammer,
  https://steamcommunity.com/profiles/76561198077683628/recommended/2315430 (recommendationid
  199406745). Confidence HIGH; tier COMMUNITY. Praise for franchise-building-from-a-sleeper-hit as a fun
  narrative arc — validates the Owner's Rule G (early greenlight / fast-follow-up can be the *most*
  attractive move after a hit) as a source of player-reported fun elsewhere in the genre.

### Bugs at the sequel/franchise boundary worth flagging as implementation risk
- "the objectives disappear after releasing a sequel... I can't play past releasing a sequel" —
  Aries2150, review, https://steamcommunity.com/profiles/76561198041556849/recommended/2315430
  (recommendationid 188167258). Confidence HIGH; tier COMMUNITY. A sequel-triggered progression-state bug
  — a concrete argument for testing P17's sequel-creation path against P07/P08 completion/end-state logic
  specifically, since "just released a sequel" is exactly the kind of state transition that falls between
  two packages' ownership boundaries (here, between the moment-of-continuation and whatever tracks
  "what's left to do").

### (1)-(6)
1. Decision: which of {sequel, prequel (max 1/franchise, by design), spin-off (spawns a new franchise
   under the same IP), reboot} to spend a production slot on, weighed against "topic fatigue" and
   "franchise popularity" factors that visibly feed the reception score; separately, whether to buy a
   spoofed licensed IP knowing three flops forfeits it.
2. Fun: players explicitly praise the tension between franchise reliance (safe, funds experimentation)
   and creative risk (The Royal Seal); the "spoofed IP" marketplace turns licensing into a joke-forward,
   celebrated feature (Groot/Terminator/Alien achievement names) rather than a dry admin screen.
3. Tedious/exploitable: the prequel cap is bypassable ("infinite prequels" despite a stated 1-per-
   franchise tooltip rule) — a concrete QA lesson (enforce continuation-count caps server/sim-side, not
   just in the tooltip/UI gate). IP-vs-Franchise naming confusion recurs across at least 4 separate
   threads over 3+ months and is never fully resolved even after the developer explains it directly.
4. Hard-timer optimization: **no evidence of a calendar cooldown** — the constraints found are all
   count-based (max 1 prequel per franchise) or condition-based (3 licensed-IP failures forfeits it), not
   time-based. Consistent with the Owner's "no hard sequel cooldown" (Rule D).
5. Sequel spam: not directly evidenced as complained-about by players (the game's total per-playthrough
   film count is naturally bounded by its ~1970–2020 timeline), but the per-franchise prequel-cap bypass
   is the closest analog found.
6. **ADOPT**: modeling Fatigue (genre/topic-level) as a factor visibly separate from Franchise
   popularity in the reception formula, and surfacing both to the player as named, legible inputs —
   this is the strongest real precedent for exactly the kind of transparency the Owner's Rule C needs to
   deliver to avoid the Moviehouse-style "why did that score differently" trust failure. **ADOPT**: an
   IP-holds-multiple-Franchises data shape (dev's stated model), but budget UI/UX effort specifically to
   prevent the confusion The Executive itself could not solve — a visible tree/grouping view of
   IP → Franchise → installments is not optional polish here, it is the fix for a proven, repeated,
   unresolved failure in the closest real comparator. **ADAPT**: per-continuation-type numeric caps (e.g.
   "max prequels per branch") are a reasonable P17 tool per Rule N ("bounded branching... no spaghetti
   graphs"), but must be enforced where the sim state actually lives, not only surfaced as a UI hint.
   **REJECT**: tying loss of licensed-IP rights to repeated commercial/quality failure (Owner Rule E
   already rules this out; noted here only as a structural contrast, not to reopen the decision).

---

## 5. Hollywood Mogul 3 → Hollywood Mogul 4 (HMdesigner, single-developer, since the mid-1990s)

Steam appid 3536760 = Hollywood Mogul 4 (the modern Steam-era entry; earlier entries including Hollywood
Mogul 3 predate Steam and are referenced only via player recollection, labeled accordingly). This is a
**text-based, no-graphics** simulation — the deepest and most explicit sequel/franchise/talent taxonomy
found in the whole batch, run by one person continuously since the 1990s per long-time-player reviews.

### Sequel/franchise/universe taxonomy (shipped, per the game's own Steam store page)
- Store description enumerates, verbatim: **"Set your project in a Universe with other projects. Create
  Franchises. Create Cross-over projects from Franchises or Universes and mix and match roles and talent
  from every project you've already released. Create Traditional sequels, Spin Off sequels, and IP
  sequels."** Source: `raw/store_3536760.json`, field `detailed_description`. Confidence HIGH (verbatim
  shipped store copy); tier DEVELOPER/OFFICIAL. This is the single most complete real-world precedent for
  the Owner's full continuation taxonomy (Rule A) plus bounded-branching-with-crossovers (Rules N/O) —
  three *named, distinct* sequel types (Traditional / Spin-off / IP) shipped in one game, alongside an
  explicit Universe tier above Franchise that supports crossovers mixing talent/roles from any prior
  project in that Universe.
- Same source: **"Follow talent with Stats that increase and decrease. Hire your favorite talent now,
  before a box office smash increases their salary."** — confirms fame/skill-adjacent stats are dynamic
  and market-reactive (a hit visibly and mechanically raises that talent's price for future projects,
  independent of any change in their underlying skill), and that pre-emptively signing undervalued talent
  before a breakout is a legible, rewarded strategy. Confidence HIGH; tier DEVELOPER/OFFICIAL. Direct
  precedent for Owner Rule R (talent salary expectations as an indirect economic consequence of
  Recognition/Momentum, owned by P14, not minted by P17).
- Same source: **"Identify Potential Conflicts between the director you hire and the talent you cast in
  Perfection[ist] rating and Script As Written rating"** and a named stat contrast — **"a talent that has
  a high Sex Appeal rating but a low Humility rating"** whose "Screen Presence is a little lacking" —
  i.e., **Sex Appeal (a fame/appeal proxy) is explicitly modeled as a separate numeric rating from
  Screen Presence/Perfectionist/Script-fidelity ratings (skill/professionalism proxies)**. This is the
  most explicit **fame-modeled-separately-from-acting-skill** mechanic found in the entire research pass
  — more explicit than The Executive's single "popularity" score, because HM4 names multiple
  independent skill-side ratings the appeal-side rating does *not* correlate with. Confidence HIGH
  (verbatim store copy); tier DEVELOPER/OFFICIAL.
- 2026-07-16 "HM4 MAJOR UPDATE" adds **"Complex Sequels (create a sequel from every project in a sequel
  chain)"** — i.e., branching sequel trees where any installment, not just the latest, can spawn a new
  sequel — plus **Talent Friendships** (talent-to-talent relationship tracking) and, for episodic
  content, the ability to **"Kill off characters"** and track "'appears in' for each episode." Source:
  `raw/news_3536760.json`, "HM4 MAJOR UPDATE" and "Hollywood Mogul 4" posts; URLs
  https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1838407329255748 and
  .../1838407329263122. Confidence HIGH; tier DEVELOPER/OFFICIAL.
- "WHAT'S STILL HERE FROM HM3: Choose from more than 100 genres. Include Additional Villains like
  weather, or fire, or insect infestations. Set advertising budgets." — confirms genre/villain/budget
  systems as the legacy baseline carried from Hollywood Mogul 3 into HM4, useful for anchoring what a
  1990s-lineage entry in this genre actually modeled at its core, versus what HM4 added net-new (the
  Universe/Franchise/sequel-type taxonomy above is new-to-HM4, not inherited from HM3, per this same
  changelog framing). Source: `raw/store_3536760.json`. Confidence HIGH; tier DEVELOPER/OFFICIAL.

### Player experience
- Praise for the franchise/universe system by a self-described 3rd-game veteran of the series: "You can
  make movie universes, franchises and limited TV runs... The owner is very active on the forums, and
  discord." — Chandler Bing,
  https://steamcommunity.com/profiles/76561198084705076/recommended/3536760 (recommendationid
  196494755). Confidence HIGH; tier COMMUNITY.
- Corroborating the shipped taxonomy from a player perspective: "there's a lot of new content like
  series, cinematic universes and franchise, different types of sequels, expanded awards" — xabierxym,
  https://steamcommunity.com/profiles/76561198106031827/recommended/3536760 (recommendationid
  193542143). Confidence HIGH; tier COMMUNITY.
- Regression complaint from an HM3 veteran at HM4's initial launch (before the 2026 major update restored
  scope): "As a huge fan of HM3 i am just so disappointed. Very bare bones and theres A LOT of features
  that made the last game great that are just not in this one (bungalos, talent agent deals, etc)... I
  also hate the 30 year cap." — Buckness, negative review,
  https://steamcommunity.com/profiles/76561198044430783/recommended/3536760 (recommendationid
  200432209). Confidence HIGH; tier COMMUNITY. Cross-checked against the patch notes: the "30/40/50/60/75
  year" play-length options and "Studio Bungalows," "Agent/Talent Pitch Meetings" were added back in the
  2026-06 to 2026-07 major update cycle — i.e., **this specific launch-regression complaint was
  subsequently addressed**, a useful data point that a sequel/reboot of a beloved niche entry can lose
  and later win back its veteran base by restoring cut depth.
- Caution on "illusion of depth": "The negative reviews saying this game is shallow are unfortunately
  right, but the game presents an illusion of depth that can be quite impressive still... there isn't
  much to do now except think of ideas for movies and what their stats might look like... there's no
  actual difference between production roles like stunt coordinators or cinematographers other than
  their names." — zevulon, https://steamcommunity.com/profiles/76561198033372248/recommended/3536760
  (recommendationid 199887338). Confidence HIGH; tier COMMUNITY. Important counterweight: a rich *naming*
  taxonomy (Universe/Franchise/three sequel types) does not by itself guarantee mechanically
  differentiated simulation underneath — worth remembering when judging Project: Studio's own object
  model by its vocabulary alone.

### (1)-(6)
1. Decision: which of {Traditional sequel, Spin-off sequel, IP sequel} to make from which prior project
   in a Universe's crossover-eligible pool; whether to sign talent now (cheap) ahead of an expected
   breakout, given stats visibly move over time; whether a Perfectionist-heavy director is worth the
   Script-As-Written friction against a high-Sex-Appeal/low-Humility star.
2. Fun: the sheer combinatorial breadth (Universe → Franchise → 3 sequel types → crossover mix-and-match
   of "roles and talent from every project you've already released") is repeatedly cited by long-time
   fans as the reason the series has no real competitor in its niche.
3. Tedious/exploitable: zevulon's "illusion of depth" critique — a taxonomy this rich can still feel like
   reskinned spreadsheet rows if the underlying simulation doesn't differentiate roles/outcomes; a caution
   for Project: Studio not to over-invest in naming granularity (Universe/Franchise/branch/SubProperty)
   at the expense of each tier actually changing simulated outcomes.
4. Hard-timer optimization: **no cooldown found**; the "Complex Sequels" chain model is topology-based
   (any node in a chain can branch), not time-gated. Consistent with Owner Rule D.
5. Sequel spam: not evidenced as a complaint in the cached corpus — likely mitigated by the game's
   text-only, single-player, self-paced nature (no visible competitive pressure to spam).
6. **ADOPT**: naming and shipping three genuinely distinct sequel/continuation types (here: Traditional /
   Spin-off / IP) rather than one generic "Sequel," which is exactly the Owner's Rule A stance —
   Hollywood Mogul 4 is the strongest existing precedent that players *want* and can track this
   granularity when the game gives them a real Universe/Franchise hierarchy to hang it on. **ADOPT**:
   modeling fame/appeal (Sex Appeal) and skill/professionalism (Screen Presence, Perfectionist, Script As
   Written) as separate, independently-varying ratings on the same talent — directly reusable evidence
   for the task's specific fame-vs-skill question. **ADOPT** the pre-hit-signing dynamic (stats move over
   time; salary follows box office performance, not the other way around) as a real precedent for Owner
   Rule R's "indirect economic consequences" framing. **CAUTION**: do not let the naming taxonomy
   substitute for differentiated simulation underneath (zevulon's critique) — every SubProperty/branch
   the Owner's model creates should change at least one visible outcome, not just a label.

---

## 6. Movies Tycoon (developer credited in-store as an indie team; Early Access 2024 → v2.x 2026)

Steam appid 2659050. Explicit spiritual successor to The Movies (2005); its Franchise feature is the
**newest** shipped mechanic in this entire atlas (2026-07-29), which makes the immediate post-launch
forum criticism unusually fresh and load-bearing.

### Sequel/franchise mechanics (very recently shipped)
- **"Movie Franchises" — free base-game update, 2026-07-29: "Successful movies can now become
  franchises. Create sequels, grow their earning potential, and keep audiences interested enough to
  continue the series."** Source: `raw/news_2659050.json`, "Streaming Wars DLC + Free Update Now
  Available!"; URL
  https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1839676055882280.
  Confidence HIGH; tier DEVELOPER/OFFICIAL. Two points worth isolating: (a) franchise status is explicitly
  **success-gated** ("successful movies can now become franchises" — not every film qualifies), a real
  precedent adjacent to the Owner's Rule B (successful properties start with an audience; unsuccessful
  ones do not); (b) the copy names "keep audiences interested enough to continue" as an explicit design
  goal, i.e. the system is meant to model exactly the Fatigue/Momentum tension Rule C targets.

### Immediate post-launch player criticism (all dated within 6 weeks of the feature shipping — i.e. this
is live, current-state feedback on the newest franchise system studied in this report)
- **Sequel-vs-Franchise distinction is not legible in the shipped UI**, echoing The Executive's identical
  problem in an unrelated codebase: "The current series and franchise structure is really poor right
  now. Please add a pop-up screen where films are properly grouped if you have made a film series. If you
  make a franchise, then it would be great to see which films are part of it. Right now it doesn't feel
  like there is a difference between making a sequel or clicking Franchise; I can[not] see a difference."
  — WyldeGirlUK, 2026-08-10, `raw/mt_search_franchise.html` and `raw/mt_search_sequel.html`. Confidence
  HIGH (direct quote, very recent); tier COMMUNITY. **Two independent games, two independent
  development teams, the same specific complaint** (no legible grouping view distinguishing "sequel" from
  "franchise") — this is no longer an isolated anecdote but a recurring genre-level UX failure Project:
  Studio should treat as a known trap, not a hypothetical one.
- **The exact same "identical inputs, unrelated sequel outcome" trust failure found independently in
  Moviehouse** recurs here, again independently: "I have even made a movie with the same genre, theme
  and sets, same actors and director, and then copied the previous settings and adjusted them according
  to what it shows when the first movie was released, in an effort to improve upon the previous movie
  with the sequel. Instead the needs end up completely different than the first? I [don't] understand
  this system at all." — seevert7225, 2025-07-20, `raw/mt_search_sequel.html`. Confidence HIGH; tier
  COMMUNITY. Confirms this is a **structural, cross-title failure mode of "sequel needs/scoring
  recompute from scratch with no visible link to the predecessor's proven formula,"** not a one-off bug
  in a single codebase — strongest single argument in this report for making P07's sequel-reception
  linkage to its predecessor explicit and player-visible.
- Sequel-list UX debt at scale: "when you get to that stage, you see all the movies that you produced...
  Sequels and clear it up because there's so many... I don't want to spend few minutes scrolling down
  looking for the sequel that I want to make." — rexo_thekillerclown, 2026-01-11,
  `raw/mt_search_sequel.html`. Confidence HIGH; tier COMMUNITY. A pure scaling/UX lesson: once a
  playthrough accumulates dozens of films, "which film am I continuing" needs its own filtered view,
  independent of any Recognition/Momentum/Fatigue design question.
- No settings-copy convenience for sequels: "Is there a way to copy a previous movies setup? I figured it
  would auto copy them when I started doing sequels but it doesn't." — Woody, 2025-07-16,
  `raw/mt_search_sequel.html`. Confidence HIGH; tier COMMUNITY.
- A technical interaction bug at the franchise/distribution boundary: "streaming currently breaks
  franchises though as it counts them as a 0 income item at present... I believe the devs are already
  working on a fix." — Urake, 2026-09-03, `raw/mt_search_franchise.html`. Confidence HIGH (direct quote,
  9 days before this report's date); tier COMMUNITY. A concrete example of a franchise object's revenue
  tracking breaking when it crosses into a different package's domain (distribution channel) — directly
  analogous to the kind of P07/P11/P15 boundary bug the Owner's package-ownership rules (§ PACKAGE
  OWNERSHIP in this ticket's shared context) are designed to prevent architecturally.

### (1)-(6)
1. Decision: whether a given hit is worth converting into a Franchise (success-gated), and, once
   converted, whether/when to spend a production slot on the next installment in that franchise's
   pipeline versus a new standalone film.
2. Fun: framed explicitly by the devs as "keep audiences interested enough to continue the series" —
   i.e., the intended fun is a felt Momentum/Fatigue balancing act, matching the Owner's own framing
   almost verbatim.
3. Tedious/exploitable: no per-franchise grouping view (two separate player requests); no settings-copy
   convenience for sequels; sequel list becomes an unfiltered scroll of every film ever made.
4. Hard-timer optimization: no cooldown found in the cached patch corpus; the feature is brand-new enough
   (6 weeks old) that this may simply be undocumented rather than absent — flagged as an open gap, not a
   confirmed absence.
5. Sequel spam: not directly evidenced as a complaint yet (feature too new), but the missing
   grouping/filter UI is exactly the kind of gap that enables undetected spam at scale.
6. **ADOPT**: gating franchise creation on the predecessor's success (Rule B's "successful properties
   start with an audience" already implies this; Movies Tycoon is a live precedent for shipping it as a
   simple binary gate). **ADOPT as a hard UI requirement, not a nice-to-have**: a dedicated
   franchise/continuation grouping and filter view — this is now confirmed as a failure point in *two*
   independent comparators (this game and The Executive) and Project: Studio should treat "can the player
   see, at a glance, every installment in a StoryProperty/branch" as a P17 UI acceptance criterion, not an
   afterthought. **ADOPT the lesson, reject the opacity**: whatever P07 does when scoring a sequel, it
   must visibly connect to the predecessor's proven formula (seevert7225's complaint, corroborating
   Moviehouse's WildDogsGaming/Lyciana independently) — an unexplained divergence between "I copied
   exactly what worked" and "it scored differently" is now a proven, repeated genre failure, not a
   one-off tuning bug.

---

## 7. Filmmaker Tycoon (2020, small early-access title) — negative-space data point

Steam appid 778010. Included per the task brief; cached evidence is thin because the title stopped
receiving updates after two 2021 patches.

- Full-text scan of the store description and all 8 cached news items (Early Access announcement through
  "Update #02") finds **zero mentions** of sequel, franchise, IP, prequel, reboot, or spin-off mechanics
  of any kind. The description's feature list (studio design, technologies, location scouting, an
  equipment/lens system, a scene-maker, costuming, post-production, "watch your finished films") is a
  single-loop, no-legacy-system movie-maker. Source: `raw/store_778010.json` field
  `detailed_description`; `raw/news_778010.json` (all 8 items, titles enumerated). Confidence HIGH
  (negative finding from a complete, small corpus); tier DEVELOPER/OFFICIAL.
- Independently corroborated by the same Rock Paper Shotgun piece cited in §2, which groups Filmmaker
  Tycoon with Moviehouse as "mostly negative"-status also-rans that are "not, in fact, like The Movies
  beyond the basic premise." Source as in §2. Confidence HIGH; tier CONTEMPORARY PROFESSIONAL SOURCE.
- Reading: this is the cleanest **absence-of-franchise-system** case in the batch. It cannot on its own
  prove that missing a legacy/sequel system *causes* negative reception (Filmmaker Tycoon's broader
  single-loop shallowness is the more likely driver, and Blockbuster Inc./Moviehouse show that *having*
  the promise of such a system without shipping it well doesn't save a title either) — but it is
  consistent with every other data point in this report that a modern entry in this specific genre is now
  expected to have *some* sequel/franchise system, and its total absence is treated by outside press as
  a mark against the game alongside its other gaps.

---

## 8. Movie Studio Tycoon-style mobile titles, and the thin "Cinema Tycoon / Film Tycoon / Show Business" bucket

Coverage here is necessarily lighter than §1-7; flagged explicitly per-item rather than inflated.

- **"Hollywood: Movie Studio Tycoon"** (mobile, iOS App Store id 6747379634, 2025) — app-store marketing
  copy states: **"Launch billion-dollar franchises, sequels and cinematic universes."** A user review
  requests cast continuity as a *missing* feature: "the ability to cast the same people for the sequel."
  Source: WebFetch of https://apps.apple.com/us/app/hollywood-movie-studio-tycoon/id6747379634, retrieved
  2026-09-12. Confidence MEDIUM (single-source app-store page summarized via fetch, not independently
  cross-checked against a second source); tier DEVELOPER/OFFICIAL for the marketing copy, COMMUNITY for
  the review quote. Useful as a current (2025) mobile-market data point that "franchises/sequels/
  cinematic universes" is now baseline marketing language for the genre even at the low end, while actual
  cast-continuity mechanics remain a player *wish list* item rather than confirmed-shipped even here.
- **Movie Studio Tycoon** (All in a Days Play; originally mobile, later ported to Steam as appid 630440)
  — search-engine-summarized store copy describes replaying movie-making history "in any decade between
  the 1930s and 1990s" with a roster of "50+ Directors and 150+ Actors," but **no sequel, franchise, or
  IP system is described anywhere found**; the Steam store page itself returned a region-lock error on
  direct fetch and could not be independently verified beyond the search-engine summary. Confidence LOW
  (could not verify the primary source directly; relying on a secondary engine's paraphrase); tier
  COMMUNITY INFERENCE. **Open gap, not a confirmed absence** — flagged rather than asserted.
- **Movie Studio Boss: The Sequel** (2014 PC/mobile-adjacent title; a literal sequel, in its own title, to
  a 2001 game called Movie Studio Boss) — found only as a store listing and a single forum-search hit in
  this pass; no mechanic detail could be verified in the time available. Confidence LOW; flagged as an
  **open gap**, not analyzed further here.
- **World of Cinema – Movie Tycoon** (Steam appid 344160) — search-engine summary describes 1–4 player
  competitive studio management "for fame, money and awards," with "merchandising, marketing, sabotage,
  poster design," but the Steam store page returned a region-lock error on direct fetch and no
  sequel/franchise mechanic could be confirmed from any secondary source in the time available.
  Confidence LOW; tier COMMUNITY INFERENCE (secondary paraphrase only). **Open gap.**
- **Cinema Theater Tycoon** (Steam appid 3433110) — a theater-*exhibition* management game (you run
  cinemas, 1906 onward), not a film-*production* studio sim; out of scope for sequel/franchise-of-a-film
  mechanics by genre design (there is no "film" object the player authors). Noted only to rule it out
  explicitly rather than silently omit it, since it surfaced in every "Cinema Tycoon" search. Confidence
  HIGH that it is out of scope (store summary is unambiguous about the exhibition-not-production premise);
  tier COMMUNITY INFERENCE (secondary summary, store page not independently fetched).
- No dedicated "Cinema Tycoon" or "Film Tycoon" title distinct from the above was found; these appear to
  be generic descriptors the task brief used for the genre rather than the proper names of shippped,
  separate titles. No "Show Business" branded Hollywood tycoon title (distinct from the above) was located
  in the time available. **Open gap**, explicitly flagged rather than papered over.

### Famous non-actor cameo (music/sports crossover) — explicit open gap
No title in this entire research pass (Software Inc., Moviehouse, Blockbuster Inc., The Executive,
Hollywood Mogul 4, Movies Tycoon, Filmmaker Tycoon, or the mobile/thin-bucket titles above) was found to
model a famous **non-actor** (musician, athlete, TV personality) appearing as a castable cameo. The
closest adjacent evidence is (a) The Executive's popularity-score achievements applying uniformly to
"lead/supporting actor" and "director" roles (all still film-industry roles, not cross-domain celebrities)
and (b) Hollywood Mogul 4's Sex-Appeal-vs-Screen-Presence split, which models fame vs. skill for *actors*
specifically, not a crossover mechanic. **This is a confirmed gap in the comparator set as researched**,
not a finding that no such game exists anywhere — a targeted search for a *music-tycoon or sports-tycoon*
title that separately imports a "famous non-actor" object was out of this ticket's named scope and was
not attempted beyond the generic searches logged above, which returned no on-point result (closest hit:
"Celebrity Tycoon," a Roblox incremental-clicker with no separable fame/skill model). Confidence: the gap
itself is HIGH confidence (thorough search, no result); whether such a game exists elsewhere is UNKNOWN.

---

## 9. Synthesis table — mechanic presence across the batch

| Mechanic | Software Inc. | Moviehouse | Blockbuster Inc. | The Executive | Hollywood Mogul 4 | Movies Tycoon |
|---|---|---|---|---|---|---|
| Named continuation types beyond "sequel" | n/a (product) | prequel, "cinematic universe" (promised) | prequel/reboot/spin-off (promised, unshipped) | sequel/prequel/reboot/spin-off/adaptation (shipped) | Traditional/Spin-off/IP sequel + Universe crossover (shipped) | "Franchise" (shipped 2026-07) |
| Recognition tracked separate from momentary hype | MR per category, separate IP-following vs. company fans (shipped) | not found | not found (unshipped) | popularity score per role; Franchise popularity as named factor | talent Stats "increase and decrease"; Universe/Franchise persistent | franchise "earning potential" (shipped, thin detail) |
| Fatigue/overexposure named separately | not directly named | not found | not found | "Topic fatigue" named separately from Franchise popularity (community-inferred) | not found | design intent stated ("keep audiences interested"), no detail confirmed |
| Rights transfer without recognition transfer | confirmed (community-reported) | n/a | n/a | Sell-IP feature (shipped); no transfer-recognition detail found | n/a | n/a |
| Fame modeled separate from skill | n/a | star rating "makes movies better" (compounds, no cap found) | fame outpaces happiness capacity (shipped, criticized) | popularity score (0-100) independent of script-affinity/skill | Sex Appeal vs. Screen Presence/Perfectionist (explicit, shipped) | not found |
| IP vs. Franchise legible in UI | fans vs. IP-following split is legible (2026-08) | n/a | n/a | **confirmed confusion, unresolved across 4+ threads** | not evidenced as confused (text-UI) | **confirmed confusion, fresh (Aug 2026)** |
| Sequel-input→outcome legibility | not evidenced as broken | **confirmed broken (4 sources)** | n/a (unshipped) | script-affinity-zero bug reported once | not evidenced as broken | **confirmed broken (independently)** |
| Hard cooldown / wait-timer | none found | none found (tech-gated) | n/a | none found (count/condition-gated) | none found (topology-gated) | none found (too new to confirm absence) |
| Licensed/spoofed real-world IP marketplace | n/a | not found | parody costumes only (Deadpool/Wolverine-alike) | 700+ spoofed IPs, 6 media types, condition-based loss (shipped) | not found | not found |

---

## 10. Open gaps (explicit)

- Could not independently verify Steam store pages for Movie Studio Tycoon (630440) and World of Cinema
  (344160) due to region-lock errors on direct WebFetch; relied on secondary search-engine summaries only
  (LOW confidence, flagged in §8).
- Could not confirm whether The Executive's stated "Universe" tier (multiple franchises per IP,
  MCU/DCU-style) actually shipped by any cached patch version (through 1.3.2, 2025-06-15) — the dev
  statement is PRE-RELEASE PROMISE tier, and a contemporaneous player review says the shipped build still
  enforced one-franchise-per-IP. This is a live contradiction in the primary evidence, reported as such
  rather than resolved by guessing.
- Could not confirm or refute Blockbuster Inc.'s reported May 2025 developer abandonment via any primary
  Steam-news post (the cached news corpus ends December 2024); the claim rests on a single player review's
  dated edit reporting a Discord statement, which is a secondhand, unverifiable-in-this-pass source.
- No confirmed example was found, in this batch or via generic web search, of a tycoon game modeling a
  famous **non-actor** (musician/athlete/TV personality) as a castable cameo distinct from acting-industry
  talent; the search for this specific crossover mechanic was not exhaustive (see §8 caveat).
- Hollywood Mogul 3 (the specific 1990s predecessor named in the task brief) has no independently
  fetchable primary source in this pass — all HM3 detail here is secondhand, either (a) HM4's own "WHAT'S
  STILL HERE FROM HM3" changelog framing (DEVELOPER/OFFICIAL, reliable for what carried forward) or (b)
  player recollection inside HM4 reviews (COMMUNITY, reliable only as "this is what longtime fans
  remember," not as verified HM3 mechanic documentation).
- Movies Tycoon's Franchise system is six weeks old as of this report's date (2026-09-12); the "no hard
  cooldown found" and "sequel spam not evidenced" findings for it should be read as "not yet documented"
  rather than "confirmed absent," since the feature is too new for its own community to have produced
  mature critique.
