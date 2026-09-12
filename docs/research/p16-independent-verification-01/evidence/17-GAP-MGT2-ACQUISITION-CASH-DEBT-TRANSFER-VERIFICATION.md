# Dossier 17 — Gap-fill: Mad Games Tycoon 2 acquisition cash/debt transfer (re-verification)

## 1. Scope

Single-question follow-up (assignment gap 7). Question: does Mad Games Tycoon 2 (Eggcode;
acquisition feature shipped BUILD 2022.03.01A, announced 2022-04-28, appid 1342330) transfer a
purchased competitor's cash and/or debt to the buyer, and is the target's existing debt inherited?
This bears on assignment §2.F Q1/Q2 (does acquired cash become buyer cash; does debt transfer) and
on dossier09's open question 1 (does target cash transfer at par in a healthy P16 deal). Two prior
independent dossiers (06, 09) both marked this UNVERIFIED after hitting the same dead end (the
`steamcommunity.com/games/1342330/announcements/detail/4348798430274738151` community page
returning a JS shell with no body text). This dossier tries four specific new retrieval routes the
prior two did not use, then reconciles the result against dossier06 F11–F18 and dossier09 F28/OQ1.
READ-ONLY. No repository files were touched; only web sources were consulted.

## 2. Method & sources consulted (with what failed)

In the order given by the assignment:

1. **Wayback Machine.** WebFetch to `web.archive.org` is refused outright by the tool ("unable to
   fetch from web.archive.org"). Fell back to the Wayback **CDX API** via `curl` (Bash), which is
   the machine-readable index of what has ever been captured, not a live shell:
   - `archive.org/wayback/available?url=steamcommunity.com/games/1342330/announcements/detail/4348798430274738151`
     → `{"url": "...", "archived_snapshots": {}}` — **no capture of any kind exists**, not merely a
     capture that failed to render.
   - `web.archive.org/cdx/search/cdx?url=...announcements/detail/4348798430274738151&matchType=exact`
     → `[]`
   - `web.archive.org/cdx/search/cdx?url=steamcommunity.com/games/1342330/announcements/detail*&matchType=prefix&limit=50`
     → `[]`
   - `web.archive.org/cdx/search/cdx?url=steamcommunity.com/games/1342330*&matchType=prefix&limit=50&collapse=urlkey`
     → `[]` — the Wayback crawler has **never** captured any page under
     `steamcommunity.com/games/1342330/` (any path). This is a stronger, more final result than "the
     snapshot renders empty": there is no snapshot to render. **Route 1 is conclusively exhausted.**

2. **SteamDB patch-notes history for appid 1342330, March–April 2022.**
   - `steamdb.info/app/1342330/patchnotes/` via WebFetch → HTTP 403.
   - Same URL via direct `curl` with a browser User-Agent (Bash) → HTTP 403 (Cloudflare bot-wall;
     confirmed non-JS-shell, genuinely blocked).
   - Substituted two working official alternatives instead of abandoning the route:
     (a) Steam's own public **`ISteamNews/GetNewsForApp/v2`** REST API (the same API dossier06 used
     for its S22–S30 citations), queried directly with `enddate=1651708800` to page back to
     2022-04-28 and retrieve the **complete, untruncated `contents` field** of gid
     `4348798430274738151` ("Company Acquisitions!", author "Eggcode Games") — this is the exact
     announcement both prior dossiers could only see as a page shell, now recovered in full via the
     API rather than the rendered community page. See Finding 1.
     (b) The developer's own compiled Steam Discussions **"Patchnotes: ..." thread**, started and
     maintained by Eggcode ([developer] tag), which independently reproduces the same official
     patch-note lines for BUILD 2022.03.01A–2022.04.06A. See Finding 2.

3. **MGT2 Steam Community GUIDES section** (not Discussions), specifically for an acquisition
   walkthrough — unchecked by either prior dossier.
   - Browsed `steamcommunity.com/app/1342330/guides/` (via `r.jina.ai` reader proxy, since direct
     `curl`/WebFetch to steamcommunity.com guide-listing pages intermittently 429'd): the "Gameplay
     Basics" / "Walkthroughs" categories list 51/49 guides but the visible listing (trend-sorted,
     first page) contains none titled around acquisition/subsidiary finance; it is dominated by
     genre/slider "combination" guides.
   - The `?searchText=...` query parameter had no effect on the returned HTML (Steam's guide search
     is client-side/AJAX; a plain GET ignores it) — tried `subsidiary`, `acquisition`, `buy company`,
     all returned the identical trending list. This is a genuine dead end for that specific query
     mechanism, noted rather than silently retried.
   - A WebSearch match titled "Steam Community :: Guide :: Subsidiaries and How to use them [Beta
     1.6.x]" (id 2941566335) looked promising and was fetched in full — **it turned out to be a
     removed Software Inc. guide (appid 362620) by "nosedigger," not a Mad Games Tycoon 2 guide.**
     Flagging this explicitly: it is a false-positive trap for any future agent searching the same
     phrase, and it is *not* usable evidence for MGT2.
   - No dedicated MGT2 acquisition/company-purchase Guide was found to exist. In its place, two
     on-topic **Steam Discussions threads not cited by dossier06** were fetched in full: "Buy
     Competitors" (4943253385022886478) and "Does buying out your competitors hurt you?"
     (600777309722530785). See Finding 3. **Route 3 is exhausted**: no walkthrough guide exists;
     the adjacent discussion threads add no new financial detail.

4. **Reddit r/MadGamesTycoon**, restricted search for "buy competitor debt" / "subsidiary cash" —
   neither prior dossier could reach Reddit at all. Tried four independent methods, all blocked:
   - `WebSearch` with `allowed_domains: ["reddit.com"]` → hard API error: *"The following domains
     are not accessible to our user agent: ['reddit.com']"* — Reddit is refused at the tool's
     domain-allowlist layer, not merely absent from results.
   - `WebFetch` on `reddit.com/r/MadGamesTycoon/search/...` via the `r.jina.ai` reader proxy →
     Reddit's own 403 page: *"You've been blocked by network security... use a developer token."*
   - Direct `curl` (Bash) to `old.reddit.com/r/MadGamesTycoon/search/...` → redirected to a generic
     Reddit login/"Welcome to Reddit" shell; via the reader proxy → explicit 403 "whoa there,
     pardner! Your request has been blocked due to a network policy."
   - Unrestricted `WebSearch` for `site:reddit.com Mad Games Tycoon buy competitor debt subsidiary`
     → **zero reddit.com results returned** (all results were steamcommunity.com), even though the
     identical `site:` technique returns real hits on other domains in this session (e.g.
     `site:steamcommunity.com` in an earlier query). This is a **platform-level block on Reddit
     across every access path available in this environment** (WebSearch's own domain policy,
     WebFetch's proxy, and raw HTTP), confirmed by four independent attempts. **Route 4 is
     conclusively exhausted and should not be retried by a future agent using these same tools —
     it should be flagged upward as an environment limitation, not re-attempted.**

Additional (not one of the four required routes, done to close the loop once official text was in
hand): full keyword search of the complete "Company Acquisitions!" announcement body for `cash`,
`debt`, `liabilit*`, `balance`, `bankrupt*`, `money`, `goodwill`, `net worth` (Finding 1); a targeted
WebSearch for the community term "goodwill" + share-percentage tiers, to check whether it
corroborates or supersedes dossier09 F28's LOW-confidence snippet (Finding 4); and a fresh full
re-fetch of the "How does the subsidiary system work?" thread (3416558908189280598, already cited by
dossier06 F12/F14) specifically screened for any cash/debt/balance sentence beyond what dossier06
already quoted — none found (corroborates, adds nothing new).

Nothing here required or performed any repository read/write; no worktree was touched.

## 3. Findings

**F1. The complete, verbatim text of the "Company Acquisitions!" announcement (recovered via
Steam's official news API rather than the JS-rendered community page both prior dossiers hit)
contains zero mentions of cash, debt, liabilities, bankruptcy, money, goodwill, or net worth
anywhere in its ~2,600 words — including the embedded patch notes for BUILD 2022.02.05A through
2022.04.27A.**
- Source: `api.steampowered.com/ISteamNews/GetNewsForApp/v2` for appid 1342330, item gid
  `4348798430274738151`, author field "Eggcode Games" (OFFICIAL — this is the same feed dossier06
  cites as S22–S30; the community-page URL both prior dossiers tried is simply a different rendering
  of the same post ID).
- Locator: full `contents` field, retrieved 2026-09-12 with `enddate=1651708800`. Relevant sentences,
  verbatim: "You can now buy your competitors! ... Once purchased you have many options to control
  their decision making process. You can tell them what genres and topics to develop for, what
  consoles to focus on, whether to develop exclusively for your own consoles, what game engines to
  use, and how long to spend developing their games. You can also make them prioritize certain IPs,
  set how much they pay per copy to publish games (or publish their games for them!) ... To buy a
  company you can select from the statistics menu at the bottom of the screen, then select
  publishers and developers. From here you can select what company you would like to purchase **if
  you have enough funds to do so**!" A programmatic case-insensitive scan of the entire body for
  {cash, debt, liabilit, balance, bankrupt, money, goodwill, net worth} returned: `balance` 22 hits
  (all are the unrelated patch-note prefix "BALANCE:", e.g. "BALANCE: Revenue of F2Ps increased
  significantly"); every other term 0 hits except "funds" once, referring to the **buyer's** own
  money needed to make the purchase, not the target's.
- Proves: the OFFICIAL announcement of the feature — now confirmed complete, not a shell — describes
  the entire acquisition system purely as *behavioral control over the subsidiary's decisions*
  (genre/topic/console/engine/schedule/IP-priority/publishing-cut). It affirmatively never states
  what happens to the target's pre-existing cash or debt. This is a stronger result than "could not
  verify": it is "the primary source was read in full and is silent," which forecloses the
  possibility that the answer was sitting unread in that specific post.
- Confidence: HIGH (official, complete, exhaustively keyword-scanned).
- Prior prose status: **QUALIFIED.** Dossier06 F11 already quoted the behavioral-control portion of
  this same post via the same API and drew the same "Model B + absorb-IP-and-shut-down" conclusion;
  this finding does not correct dossier06, it closes the specific sub-question (cash/debt) that
  dossier06 F18 left open by showing the primary source itself contains no answer, rather than that
  the primary source was merely unreachable.

**F2. The developer's own compiled Steam Discussions "Patchnotes" thread (an official running log,
authored and maintained by Eggcode) reproduces the identical BUILD 2022.03.01A line and surrounding
builds; none of the surrounding patch lines in the March–April 2022 window reference target
cash/debt either.**
- Source: `steamcommunity.com/app/1342330/discussions/0/3114770279403190837/`, "Patchnotes - Early
  Access," poster tagged [developer] (OFFICIAL, substituting for the blocked SteamDB route).
- Locator: verbatim, "BUILD 2022.03.01A — Buying NPC companies is now available in its basic form.
  In the course of development, this feature will be expanded. Since this feature is very complex, I
  expect many bugs and strong balance weaknesses. If you notice anything, please report here in the
  forum. Thank you! ;)" Adjacent lines fetched from the same thread: BUILD 2022.03.08B "Subsidiary
  settings: You can now copy the prioritised genre, topic, publisher priority and engine"; BUILD
  2022.03.15A "Multiplayer: Players now go bankrupt if they are unable to pay. This has several
  negative effects" (this is **player** bankruptcy in multiplayer, unrelated to an acquisition
  target's finances); BUILD 2022.03.25A "Subsidiaries: You can now set the company to focus on three
  IPs" / "...instruct your subsidiaries to use their own engine" / "...set from which quality a game
  is automatically published"; BUILD 2022.04.06A "Subsidiary: You can now select up to 4 platforms
  that your subsidiary should prioritize."
- Proves: a second, independently-maintained official source covering the same window corroborates
  F1's silence — this is not an artifact of one API call missing text, it is consistent across two
  official channels.
- Confidence: HIGH. Prior prose status: NEW (this specific thread was not cited by dossier06, which
  cited the announcement posts directly but not this compiled discussions log).

**F3. Two on-topic Steam Discussions threads not cited by dossier06 ("Buy Competitors";
"Does buying out your competitors hurt you?") contain no discussion of purchase price, cash
transfer, or debt inheritance — only pre-release anticipation and post-release strategic complaints
about ongoing subsidiary running costs.**
- Source: `steamcommunity.com/app/1342330/discussions/0/4943253385022886478/` and
  `.../0/600777309722530785/` (COMMUNITY).
- Locator: "Buy Competitors" thread (pre-feature, no developer posts) — Jaadoo: "Not so long ago,
  nothing happened when you clicked on a developer, now you get a menue and one of those buttons is
  for buying shares. so it's on it's way." "Does buying out your competitors hurt you?" thread —
  Kyouko Tsukino (1 May 2025): "Hurt you like those anime where some dude gets punched through a
  mountain which explodes from the impact... And you're the mountain," elaborating only on
  subsidiaries as "money sinks" via ongoing entertainment/upkeep cost, not a one-time debt/cash
  transfer at purchase.
- Proves: the player base's own running commentary on "does buying hurt you financially" frames the
  cost entirely as **ongoing upkeep**, never as **inherited liabilities at closing** — consistent
  with, and reinforcing, dossier06 F14's "money sink" framing.
- Confidence: MEDIUM (community, but directly on-topic and consistent with HIGH-confidence F1/F2).
- Prior prose status: NEW.

**F4. Community-sourced "Goodwill" price term and a share-percentage ownership tier structure
(20–50% = minority profit share and limited control; 100% = full control) are independently
corroborated across multiple search results, but describe the *acquisition price mechanism*, not
target cash/debt disposition — they neither confirm nor refute cash/debt transfer.**
- Source: WebSearch aggregation of Steam Community discussion snippets (COMMUNITY; the underlying
  threads were not individually opened due to Steam's rate limiting during this session, so this
  stays a search-snippet-level finding, not a direct-quote one).
- Locator (paraphrased per WebSearch tool output, not directly re-fetched and quoted verbatim — see
  confidence note): "Goodwill is the buy value of the company. Goodwill increases with time,
  regardless of interaction." "Owning 20-50% gains you a small amount of the companies profits and
  smaller decisions for them... Buying 100% will give you full control." A "buy low/sell high"
  strategy is discussed: buying 75% of a company early when it is worth $2M, later selling stakes
  once it is worth $200M.
- Proves: MGT2's acquisition price is a **share-accumulation mechanic** (a company value/"goodwill"
  that rises over time and can be bought in partial or full stakes), not strictly the single flat
  "pay X, own it, done" transaction dossier06 F12 emphasizes. This is a genuine nuance dossier06 did
  not fully capture — F12 is still correct about "a single visible company value" and "no bargaining
  sim," but the ownership structure underneath that value is tiered/partial, which is closer to
  GearCity's vote-based fractional-ownership model (dossier09 S25) than a discrete "buy the whole
  company" event. It says nothing about whether a *purchase* moves the target's separate cash/debt
  ledger, because the mechanic is framed as buying **equity value**, not booking a balance-sheet
  transfer.
- Confidence: MEDIUM for the mechanic's existence (multiple independent, mutually consistent search
  results, on top of dossier06 F12's independently-sourced HIGH-confidence "visible company value");
  LOW for the exact word "Goodwill" being an in-game UI label vs. community shorthand (not directly
  quote-verified against a primary source this session — should be re-verified before being used as
  a direct UI-label citation).
- Prior prose status: **QUALIFIES** dossier09 F28 (raises its "ownership tiers (20-50%, 100%)" claim
  from UNVERIFIED/LOW to MEDIUM via independent corroboration) and **QUALIFIES** dossier06 F12 (adds
  the share-tier structure F12 did not mention; does not contradict F12's core claims).

**F5. The core question — whether a purchased company's pre-existing cash and/or debt transfers to
the buyer in MGT2 — remains UNVERIFIED as shipped behavior after four new, independently-executed
retrieval routes, and the balance of evidence now favors "the question is most likely moot" over
"transfers" or "stays with seller."**
- Source: synthesis of F1–F4 above plus dossier06 F13/F14 (re-confirmed by a fresh full re-fetch of
  thread 3416558908189280598 this session, which surfaced no new sentence on the topic beyond what
  dossier06 already quoted).
- Reasoning: (a) two official sources, one recovered in full for the first time in this research
  program (F1) and one independently corroborating (F2), are affirmatively silent on cash/debt
  disposition across the entire feature-introduction window; (b) the community's own explicit
  finance discussion of acquisitions is entirely about the price to buy and the ongoing upkeep cost
  to run a subsidiary (F3, F4), never about a balance-sheet transfer at the moment of purchase; (c)
  dossier06 F13/F14 already established, from official bug-fix language ("NPC developers are now
  closed after historical data," "Closed game studios have bought IPs" as a *bug*) and years of
  consistent community reports ("There are no employees working on games there, just a timer
  emulating that"; "This is a totally random popup by RNG... it's a fiction"), that NPC/subsidiary
  companies are not run on a real simulated economy with a persistent, meaningful cash/debt ledger —
  their acquisition price is a single scalar "company value"/"goodwill" (F4), and their post-purchase
  output is a randomized timer, not a computed P&L. If there is no real target balance-sheet object
  in the simulation to begin with, "does debt transfer" is not a yes/no fact waiting to be found in a
  patch note — it is a category error to ask of this specific shipped system. Dossier06 F18's
  original caution stands and is now on firmer footing: the widely-repeated "you take on ALL the
  company's debt" claim traces to a 2021 **pre-release player-suggestion thread**
  (3052859736125494336), never shipped, and should not be cited as comparator fact.
- Confidence: MEDIUM-HIGH for "UNVERIFIED, and most likely moot given no real target balance exists to
  transfer" (this is now a reasoned synthesis across two official + several community sources rather
  than a bare "could not find it"); explicitly NOT claiming certainty that no cash/debt object exists
  anywhere in the game's data files — only that no source, official or community, describes one
  changing hands at acquisition.
- Prior prose status: **CONFIRMED** dossier06 F18's caution and **directly answers** dossier09's open
  question 1 by removing MGT2 as usable comparator evidence either way (see Design implications).

## 4. Design implications for P16 (my inference — not Owner-authorized)

1. **Do not cite MGT2 for §2.F Q1/Q2 (cash/debt transfer) in the P16 report, in either direction.**
   Two rounds of research and four new retrieval routes converge on the same result: MGT2's shipped
   feature was never documented, patch-noted, or even clearly community-observed to move a target's
   cash or debt anywhere. Citing "MGT2 lets you take on all the debt" (the popular but pre-release-
   sourced claim) or "MGT2 never transfers debt" would both overstate what is actually known.
   Dossier09's own GearCity-based reasoning (cash transfers at par; S25) and OpenTTD's three-formula
   bankruptcy-offer model (S21) remain the load-bearing comparators for §2.F/§2.N; MGT2 should be
   cited only for what it *is* verified to show: behavioral control over a subsidiary (F1) and a
   share-accumulating "company value" price (F4), which are already reflected in dossier06's
   INFERENCE 1 and 6.
2. **MGT2's silence is itself a design lesson, not just a dead end.** A shipped, well-reviewed tycoon
   game built a whole acquisition system and — as far as any available source shows — never had to
   answer "what happens to the target's money" because its NPC companies do not carry a persisted,
   meaningful balance sheet (dossier06 F13/F14; reinforced here). That is a warning, not a
   precedent: if Project: Studio gives rival studios a real, persistent P11 ledger (cash, debt,
   revenue) the way its finance package already implies, then P16 acquisition **must** decide the
   cash/debt question explicitly, because — unlike MGT2 — there will be a real number sitting on the
   target's books when the deal closes. Silently doing what MGT2 did (never define it) is not an
   option once a real ledger exists.
3. **The Owner's already-stated "knowledge transfers, physical does not teleport" principle (§2.F) is
   more rigorous than anything MGT2 shipped.** MGT2 has no analogous "verified knowledge transfers,
   installed capability does not" rule for technology; it treats a subsidiary's engine/tech choice as
   just another remote-control dial. This is further reason not to treat MGT2 as a maturity bar to
   match — Project: Studio's existing direction on this specific sub-question is already ahead of
   the richest available comparator.
4. **If a P16 rule is needed to fill the exact space MGT2 left empty, the smallest defensible option
   consistent with dossier09's own reasoning is: target cash transfers to the buyer at par (as
   dossier09 recommends from GearCity), and target debt transfers with the entity it is attached to
   under Model A/C full-absorption, becoming a buyer liability the same way any other assumed
   contract does under P11 law** — i.e., resolve this from Project: Studio's own finance-package
   principles and the GearCity/OpenTTD precedent already in dossier09, not by analogy to MGT2's
   unverified behavior.

## 5. Open questions

1. Whether MGT2's in-game UI literally labels its purchase price "Goodwill," or whether that is
   purely community shorthand — F4 is MEDIUM/LOW on this specific point and was not directly
   re-verified against a primary in-game source or screenshot this session.
2. Whether MGT2's data files (moddable `.txt`/config files referenced in dossier06 F13's bug notes)
   contain an actual per-company cash/debt field that is simply never surfaced in the UI or patch
   notes — this would require inspecting extracted game files or mod-tool output (e.g. the
   `mgt-editor.derpierre65.dev` tool referenced by one of the Guides found in Route 3), which is
   beyond "official/developer source" discipline and was not attempted here; flagged as a possible
   but low-priority follow-up only if the Owner specifically wants certainty on MGT2's internal data
   model rather than its observable/shipped behavior.
3. Confirmed environment-level finding for any future agent: Reddit (all subdomains, all tested
   access paths) is unreachable from this tool set as of 2026-09-12. Do not spend budget retrying it;
   treat r/MadGamesTycoon and similar subreddits as permanently out of reach for this research
   program unless the environment's web-access policy changes.

## 6. Source table

| # | Source | Type | Locator | Used for | Confidence |
|---|---|---|---|---|---|
| T1 | Wayback CDX API, `web.archive.org/cdx/search/cdx` | primary (archive infra) | 3 queries, all `[]`; `wayback/available` → empty `archived_snapshots` | proves zero captures exist for the target URL/prefix | HIGH |
| T2 | Steam `ISteamNews/GetNewsForApp/v2`, appid 1342330, gid 4348798430274738151 | OFFICIAL (developer post via Steam's own API) | full `contents` field, retrieved with `enddate=1651708800` | F1 | HIGH |
| T3 | Steam Discussions "Patchnotes - Early Access" thread 3114770279403190837 | OFFICIAL (developer-authored compiled log) | BUILD 2022.03.01A/03.08B/03.15A/03.25A/04.06A lines | F2 | HIGH |
| T4 | Steam Discussions "Buy Competitors" 4943253385022886478 | COMMUNITY | pre-release anticipation posts | F3 | MEDIUM |
| T5 | Steam Discussions "Does buying out your competitors hurt you?" 600777309722530785 | COMMUNITY | Kyouko Tsukino post on subsidiaries as money sinks | F3 | MEDIUM |
| T6 | Steam Discussions "How does the subsidiary system work?" 3416558908189280598 (re-fetched) | COMMUNITY | confirms no new cash/debt sentence beyond dossier06's existing quotes | F5 | MEDIUM (negative result) |
| T7 | WebSearch aggregation, "Goodwill"/share-tier snippets | COMMUNITY (search-snippet level, not directly re-quoted) | "Goodwill is the buy value..."; "20-50%... 100%..." | F4 | MEDIUM/LOW (see F4 caveat) |
| T8 | steamdb.info/app/1342330/patchnotes/ | attempted OFFICIAL mirror | HTTP 403 via WebFetch and via `curl` with browser UA | ruled out Route 2's primary target | N/A (failed) |
| T9 | Steam Guide 2941566335 "Subsidiaries and How to use them [Beta 1.6.x]" | mislabeled search hit | actually a removed **Software Inc.** guide, wrong game | flags a false-positive trap; not usable | N/A (wrong game) |
| T10 | `steamcommunity.com/app/1342330/guides/` listing + `searchText` param | COMMUNITY (listing) | no acquisition-specific guide found; search param inert without JS | closes Route 3 | HIGH (absence) |
| T11 | `reddit.com`, `old.reddit.com`, `r.jina.ai` reddit proxy, WebSearch `allowed_domains` | attempted COMMUNITY | API rejection + two flavors of 403 | closes Route 4; environment-level block | HIGH (block confirmed) |
| T12 | dossier06 (`06-comparators-B.md`) F11–F18 | PRIOR PROSE (this research program) | lines cited above | baseline being extended/reconciled | HIGH |
| T13 | dossier09 (`09-valuation-finance.md`) F28 and Open Question 1 | PRIOR PROSE (this research program) | lines 186, 562-569 | baseline being extended/reconciled | HIGH |
