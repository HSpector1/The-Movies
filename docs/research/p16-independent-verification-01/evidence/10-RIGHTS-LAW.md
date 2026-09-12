# Dossier 10 — Story Property, Rights, Library: Minimal Model (P16 §2.A/B/C/D/K; P17/P18 consumption)

Evidence agent dossier, phase 1. READ-ONLY research; nothing in any repository was edited, checked out, built or run.
Date: 2026-09-11. Repository evidence is the P12 accepted tree (`p12-accepted/` = commit `13370d42…`) and the
approved P13–P15 docs branch (`p13-docs/` = commit `4734e409`). Path shorthand below: `SCR/` = the scratchpad root.

Evidence-status vocabulary used throughout:
**CURRENT/ACCEPTED CODE** (P12 accepted tree) · **APPROVED DOCUMENTATION** (P12 handoff/contract, P13–P15 roadmap/rulings/packages) ·
**OWNER-SELECTED NEW DIRECTION** (ASSIGNMENT §2) · **FUTURE RECOMMENDATION** (this dossier's inference, §4).
Prior-prose status per finding: CONFIRMED / QUALIFIED / CORRECTED / SUPERSEDED BY OWNER DIRECTION / NEW / N/A.

---

## 1. Scope

Assignment §2.A (Story Property), §2.B (rights granularity), §2.C (library value), §2.D (individual rights/asset sales),
§2.K (selling player assets), and how P17 (continuations/franchises) and P18 (television/cross-media) consume P16 truth.

Questions answered:
1. What did the original *The Movies* actually ship regarding scripts, films after release, sale of scripts/Stars, sequels, libraries?
2. What is the *minimum* real-world rights structure worth modelling (chain of title; underlying rights vs screenplay vs film
   copyright; option/purchase; continuation rights and WGA separated rights; reversion / use-it-or-lose-it; distribution vs
   ownership; media rights; exclusive vs non-exclusive; term licences; libraries sold separately from studios)?
3. How do management games model IP minimally (Game Dev Tycoon, Mad Games Tycoon 2, Software Inc., Hollywood Animal, TEW,
   Football Manager), and what do players find fun or tedious?
4. What does CURRENT/ACCEPTED CODE and APPROVED DOCUMENTATION already fix about identity, so a P16 model attaches cleanly?
5. Recommendation (inference): smallest StoryProperty entity; 4-right bundle + one generic Licence instrument; sold vs
   licensed; permanence; library value without weekly cash (and whether a one-off reissue is safe pre-P18); exploit guards;
   P17/P18 consumption; the right → holder → transferable → licensable → default → consumer table.

Out of scope here (other dossiers): acquisition operating model/transfer bundle (§E–H), corporate history (§I), rival M&A (§J),
healthy/distressed pricing (§L–O), valuation vs book vs price (§N) except where library value feeds it, comparators GearCity/
Capitalism Lab, Paramount decrees (skipped per assignment).

---

## 2. Method & sources consulted

**Repository (read-only, exact commits).** `SCR/p12-accepted/src/core/{types.ts,hollywoodTypes.ts,hollywoodTick.ts,hollywood.ts,
scriptDevelopment.ts,hollywoodValidation.ts}`; `SCR/p12-accepted/docs/engineering/{P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md,
P12A-DECISION-AND-REQUIREMENT-REGISTER.md,P12-TO-P13-PRODUCER-HANDOFF.md}`; `SCR/p12-accepted/docs/HOLLYWOOD-ECOSYSTEM-FUTURE-PROOFING.md`;
`SCR/p13-docs/docs/design/{CODEX-P13-P15-LONG-RANGE-ROADMAP.md,CODEX-P13-P15-OWNER-RULINGS.md,CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md,
CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13.md}`; `SCR/pkg-docs/docs/design/{CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11.md,
CODEX-RECEPTION-BOXOFFICE-PACKAGE-07.md}`.

**Original-game corpus.** `SCR/original-corpus/manual_english.txt` (official manual, SHIPPED RETAIL), `prima_eguide.txt` (Prima,
developer-reviewed), GameFAQs guides by Mark_E_1990 and Maxx (CONTEMPORARY PLAYER), `MECHANICS-BIBLE.md` and
`ORIGINAL-DATA/facility_catalog.csv` (PRIOR PROJECT PROSE — verified, not trusted).

**Web — law/industry (primary or authoritative).** U.S. Copyright Office Circular 14 (fetched PDF, text-extracted locally);
WIPO "From Script to Screen"; WGA West "Understanding Separated Rights"; Copyright Alliance FAQ on exclusive vs non-exclusive
licences; Thoolie chain-of-title and option/purchase guides (practitioner primers); Harvard JSEL (Spider-Man rights);
NBC News/AP + Viacom 8-K (DreamWorks library sale); Wikipedia "Turner Entertainment" (cited article); Disney press release
(Miramax sale); CBR (Star Wars Episode IV distribution); ScreenDaily/IndieWire search summary (Paramount→Disney Marvel
distribution buyout); NoFilmSchool + Deadline search summary (Lucas 1970s sequel/merch retention).

**Web — game comparators.** Mad Games Tycoon 2 Steam store page (official feature text) and two Steam discussions
(player experience); Software Inc. Steam discussion incl. a developer (Coredumping) reply; Greenheart Games forum and Steam
discussions for Game Dev Tycoon (player experience only — official wiki blocked); Hollywood Animal Steam store + search
summaries (player guides; age-gated discussions unreadable); Grey Dog Software TEW 2020 page + search summaries; Football
Manager community/guides via search summaries.

**Failed / degraded fetches (noted, alternates tried once).** `en.wikipedia.org/wiki/Chain_of_title_(film)` 404 (used WIPO +
Thoolie instead); `gamedevtycoon.fandom.com` 402 on three pages (used Greenheart forum + Steam); `deepfocus.law` DNS failure
(used Thoolie option guide); `variety.com` and `deadline.com` redirect to a paywall proxy (used NBC/AP and NoFilmSchool);
`ensigame.com` 503, `octopusoverlords.com` 403, Hollywood Animal Steam discussions age-gated, `guidetofm.com` 403 (Football
Manager clause detail therefore MEDIUM from search summaries only); Wikipedia "Star Wars (film)" fetch truncated before the
Disney section (used CBR). No X-Men reversion-clause primary text found — marked UNVERIFIED.

---

## 3. Findings

Format: **claim** — source · locator · proves · confidence · prior-prose status.

### 3.1 Original *The Movies* (2005) — what shipped

**F1. The original sold *unproduced scripts* (and Stars) to rivals for one-off cash; that is the only IP transaction it shipped.**
Source: official manual · `SCR/original-corpus/manual_english.txt:428-431` — "Star and Script selling – Sometimes you might want to
sell off Stars or scripts to rival studios to make some quick money. Building this facility allows you to do just that. Simply drop
the Star or script you want to sell into the building and you'll be rewarded with cold, hard cash." Corroborated: GameFAQs Mark_E
`:711-713` ("You will be told the estimated selling price when you hover the star/script over the building"), GameFAQs Maxx `:624-627`
("they will be auctioned off to an amount based on their rating"), `ORIGINAL-DATA/facility_catalog.csv:21` ($3,000, SETTLED).
Proves: SHIPPED RETAIL script sale = irreversible liquidation of a pre-production asset at a quoted price; no buyback, no licence,
no reversion, no record of what the rival did with it. · **HIGH** · CONFIRMED (Bible `:489,:574,:1220`).

**F2. A released film earned for a fixed window and then had *no* further economic life; archiving was cosmetic and irreversible.**
Source: Prima · `SCR/original-corpus/prima_eguide.txt:405` — "Films stay 'in release' for a fixed amount of time until they cease
earning."; `:411` — "STEP 6: ARCHIVING A film stays in release until it stops earning money. … Archiving is a way to tidy up your
releases by removing them from view. … Note that once a movie is archived, it can't be brought back." Manual `:136-137` — "When your
movie is no longer making any money, you should archive it in the Production Office facility."
Proves: the original had NO film library value, NO reissue, NO library sale, NO licensing of released films. · **HIGH** · NEW
(the Bible records archiving but never states the economic consequence explicitly).

**F3. No sequel, remake, franchise, licence, rights or library mechanic appears in any inspected retail source.**
Source: `grep -i "sequel|remake|franchise|licen|rights|reissue"` over manual, Prima, three GameFAQs guides — zero gameplay hits (only
legal boilerplate and the "Driving License" scene name). Proves: any StoryProperty/rights/sequel system is successor design and
must never be labelled parity. · **HIGH** (absence in inspected sources, not proof of absence in binaries) · CONFIRMED
(P15 pkg `SCR/p13-docs/docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md:261-262` "REFUTED: co-production, merger,
library/IP ownership transfer, subsidiaries, and labels were verified shipped mechanics"; `:273-281` §5.7).

### 3.2 Real-world rights structure — the minimum worth modelling

**F4. The film is legally a *derivative work*; its copyright covers only the new material and never absorbs the underlying property.**
Source: U.S. Copyright Office Circular 14 (fetched PDF, `pdftotext`) — "A derivative work is a work based on or derived from one or more
already existing works. Common derivative works include … motion picture versions of literary material or plays"; "The copyright in a
derivative work covers only the additions, changes, or other new material appearing for the first time in the work. Protection does
not extend to any preexisting material". Proves: ASSIGNMENT §2.A's split (released film ≠ Story Property) is the real legal
structure, not an invention — two subjects, two owners possible. · **HIGH** · CONFIRMED (OWNER-SELECTED DIRECTION §2.A; APPROVED
DOCUMENTATION `SCR/p12-accepted/docs/engineering/P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md:364-366`).

**F5. Chain of title = the documented sequence of ownership transfers; a gap blocks distribution regardless of quality.**
Source: Thoolie "Film Chain of Title" (https://thoolie.com/guides/film-chain-of-title/) — "Film chain of title is the documented
history of rights ownership for every creative element in your production"; "A gap in the chain — a missing assignment, an unsigned
release, an undocumented rights transfer — can delay or kill a distribution deal regardless of the film's creative quality."
WIPO (https://www.wipo.int/pressroom/en/stories/ip_and_film.html): chain-of-title documentation is "underpinned by copyright law and
contract law". Proves: the game analogue is an **append-only transfer log per property/film**; the current owner is derivable from
the log, and a validator can refuse any transfer whose `from` ≠ current holder. · **HIGH** · CONFIRMED (P12A register INT-011
`SCR/p12-accepted/docs/engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md:200` "dated chain of title resolves").

**F6. Option/purchase: a *temporary exclusive* right to develop, for a term, convertible to purchase; unexercised options revert.**
Source: WIPO — "An option agreement states that the owner of the underlying work … agrees to grant to the producer, for a specified
period, the right to produce a film."; Thoolie option guide (https://thoolie.com/creator_resource/option-and-purchase-agreements-for-film-guide/)
— "An option is not a purchase. It is a temporary, exclusive right granted by the rights holder"; reversion "If the producer fails to
begin principal photography within a defined period after exercise" or on expiry. Proves: the real-world "buy external material"
decision is already a **term-limited exclusive licence with reversion, plus a purchase conversion** — i.e. one instrument shape covers
both option and purchase. · **HIGH** · NEW.

**F7. Continuation rights (sequel/remake/spin-off) and cross-media rights are routinely *separated* from the film and from each other.**
Sources: (a) WGA West (https://www.wga.org/contracts/know-your-rights/understanding-separated-rights) — "Separated Rights are a group
of rights … derived from Copyright, which is a bundle of rights"; the writer keeps publication and "the right to produce a stage
version … after two years following general release … if the Company has not exploited the dramatic stage rights"; "The writer must
be paid not less than WGA minimum for theatrical motion picture sequels"; unproduced material: "the writer has a two-year window
within which to buy back the literary material" after five years. (b) WIPO — the original owner "will endeavor to reserve certain
rights such as publication rights, stage rights, radio rights, rights to characters"; producers seek rights "to have a free hand in
making a sequel". (c) Lucas/Fox 1970s: NoFilmSchool (https://nofilmschool.com/george-lucas-star-wars-rights-gamble) — "he offered
to waive a $500,000 raise in exchange for sequel and merchandising rights." Proves: CONTINUATION and CROSS-MEDIA are the two
facets that real deals actually carve out; territory/window sub-slicing is *not* needed to reproduce the famous decisions.
· **HIGH** (a,b), **MEDIUM** (c, secondary press) · CONFIRMED (OWNER direction §2.B lists exactly these facets).

**F8. "Use it or lose it": a licensed continuation right reverts unless exercised within a window.**
Source: Harvard JSEL (http://journals.law.harvard.edu/jsel/2019/09/spider-man-where-is-home-as-sony-marvel-compete-over-rights/) —
"Marvel sold Sony Pictures an exclusive license to make Spider-Man movies."; "it would lose the license unless it releases a new
Spider-Man movie every 5.75 years."; 2015: Marvel "re-acquire[d] all merchandising rights" and would assist production "in exchange
for 5% gross revenue" while "Sony would retain creative control, marketing and distribution." Proves: (i) a licence of
CONTINUATION separate from the PROPERTY; (ii) reversion on non-use; (iii) merchandising (cross-media) held separately; (iv) the
licence is exclusive yet the property owner keeps everything not granted. X-Men/Fox reversion clause: **UNVERIFIED** (no primary
text found). · **HIGH** for Spider-Man · NEW.

**F9. Distribution is a *service/licence on a film*, separable from film ownership and time-bound.**
Sources: (a) DreamWorks 2006 — NBC News/AP (https://www.nbcnews.com/id/wbna11881441): "a deal that values the library at $900
million"; "The 59 films in the library"; "Viacom will retain ownership of music publishing and certain other rights related to the
library, including sequel and merchandising rights."; "Soros will distribute the library through an exclusive five-year agreement with
Paramount"; "Viacom will have the right to reacquire the library, and Soros and Dune will have the right to sell it to Viacom,
beginning at the end of the fifth year". Viacom 8-K (https://www.sec.gov/Archives/edgar/data/0001339947/000110465906033560/a06-11607_1ex99.htm):
"the Company sold the live-action film library for approximately $900 million … consisting of 59 live-action films released through
September 15, 2005" and "used the proceeds to repay amounts outstanding, principally debt". (b) Marvel/Paramount 2010 — ScreenDaily/
IndieWire search summary: Disney paid Paramount at least $115M for worldwide distribution of *The Avengers* and *Iron Man 3* as a
minimum guarantee against Paramount's 8–9% fee. (c) Star Wars — CBR (https://www.cbr.com/disney-star-wars-episode-iv-rights/):
"Fox maintains a grip on Episode IV, and a portion of revenues from its sales and distribution, in perpetuity"; other films'
rights "previously set to transfer to Disney in 2020". Proves: ONE real transaction simultaneously shows FILM ownership sold,
DISTRIBUTION retained as an exclusive term licence, CONTINUATION + CROSS-MEDIA retained by the seller, and a buy-back clause — the
complete minimal bundle. It also shows a library sale as a *debt-recovery* move (ASSIGNMENT §2.K "recovery mechanism"). · **HIGH**
(a: two primary/authoritative sources), **MEDIUM** (b, c) · NEW.

**F10. Libraries are bought and sold *separately from studios*, as whole lots, and can be flipped years later.**
Sources: (a) Wikipedia "Turner Entertainment" (https://en.wikipedia.org/wiki/Turner_Entertainment) — 25 Mar 1986 Turner bought
MGM "for $1.5 billion"; 26 Aug 1986 "he was forced to sell the MGM name, all of United Artists, and the MGM Culver City studio lot back
to Kerkorian for approximately $300 million after just five months"; "Turner kept the studio's film, television and cartoon library";
the library later included "the US/Canadian/Latin American/Australian distribution rights to the RKO Radio Pictures library" (a
territory-limited distribution right, not ownership). (b) Disney press release (https://thewaltdisneycompany.com/press-releases/disney-completes-sale-of-miramax-films-to-filmyard-holdings-llc/),
3 Dec 2010, $663M: "rights in over 700 film titles … Also included are non-film assets, such as certain books, development projects and
the 'Miramax' name." (search summary: resold to beIN ~$1B in 2016). Proves: library = a distinct sellable asset class; a *brand name*
and *development projects* (unproduced properties) travel as part of the same lot; flips happen on a multi-year horizon, not weeks.
· **HIGH** (a, b press release) / **MEDIUM** (beIN resale) · NEW.

**F11. Exclusive vs non-exclusive is a single boolean with a clear legal meaning.**
Source: Copyright Alliance (https://copyrightalliance.org/faqs/exclusive-vs-nonexclusive-licenses/) — "A copyright exclusive license is
one in which ownership in one or more of the copyright owner's rights is transferred"; "A copyright nonexclusive license occurs when
the owner retains ownership of the copyright and retains the right to license the same right to others."; "An exclusive licensee of
one or more of the exclusive rights is considered to be the owner of those rights." Proves: an exclusive licensee must be treated
as the *holder* of that facet for the term (so P17 must check licence, not just owner); non-exclusive grants can coexist and are only
useful for facets that can be exploited in parallel (cross-media/distribution), not for CONTINUATION (two studios cannot both make
"the" sequel). · **HIGH** · NEW.

**F12. Accounting values a film as its *remaining forecast revenue*, not as perpetual cash.**
Source: ASC 926 summaries (PwC Viewpoint / KPMG / Bloomberg Tax search summary): film costs amortised by "the ratio of current-period
revenue to estimated remaining unrecognized revenue" (individual-film-forecast "ultimates"). Proves: in a world where no distribution/
media system exists (pre-P18), the honest library value of a settled film is *strategic/valuation* only; recording weekly library cash
would be inventing an "ultimate" with no revenue channel behind it. · **MEDIUM** (secondary summaries of the standard) · CONFIRMED
(OWNER direction §2.C "Do not invent perpetual weekly library cash").

### 3.3 Game comparators — how IP is modelled minimally

**F13. Mad Games Tycoon 2: every game belongs to an IP; IPs are merchandised, sold when dormant, bought from rivals; licences are a
separate, purchasable "built-in audience" object.** Source: Steam store page (official)
(https://store.steampowered.com/app/1342330/Mad_Games_Tycoon_2/) — "Every game is a part of a growing IP (Intellectual Property/
Franchise) … Merchandise these IPs for extra income. Sell IPs you have let become dormant or buy popular IPs from other companies.";
"Buy popular licenses from things such as books, toys, movies and sports to give your games a built-in audience."; on acquiring a
competitor: "just take all their IPs and shut them down completely." Player experience (Steam discussion
https://steamcommunity.com/app/1342330/discussions/0/3460471649935880326/, user Kyouko Tsukino): "Any IP being traded needs to have no
games currently being sold"; "It's an entirely RNG-fueled mechanic, where your 5-star IP with dozens of awards may stay in the 'for
sale' status for a decade with no solicitors". Proves: (i) an *IP entity distinct from products*, keyed by identity not title;
(ii) a **rights-in-use lock** (cannot trade while a product is on sale) is an accepted, legible rule; (iii) *licence* (external
material) vs *IP* (owned) is exactly the origin split the Owner wants; (iv) RNG buyers with no visible valuation are the tedium
complaint. · **HIGH** (official text) / **MEDIUM** (player) · NEW.

**F14. Software Inc.: IP sale is a one-time full transfer; the developer admits the IP price formula was a placeholder; players found
"buy a profitable IP cheap" exploits.** Source: Steam discussion (https://steamcommunity.com/app/362620/discussions/0/535151589911006214/):
BrandonBP — "The other company makes a one time offer and you sell your proggy to them. You no longer own it."; Tempest — bought an IP for
2.4M "and earned 5-7M monthly afterward"; OldGamer — "If you buy an orig ip at a low price and make a sequel, you will make more profit
from it as franchises sell well."; Coredumping [developer] — "The calculation for deciding IP price was placeholder, but I rushed it to
release, so it probably doesn't make sense in most cases." Software Inc. also licenses frameworks non-exclusively at a monthly fee the
owner sets (search summary of the game's Trello). Proves: an AI that sells below the asset's own earning value hands the player a
snowball; the AI's ask must be anchored to *its* valuation of the asset (incl. sequel potential). Non-exclusive term licensing at a
flat fee is a known, simple pattern. · **MEDIUM** (player + one developer line) · NEW.

**F15. Game Dev Tycoon: sequels are keyed to a previous game by identity, with a timing rule and an engine-reuse penalty; no IP trading.**
Source: Greenheart forum (https://forum.greenheartgames.com/t/sequels-keeping-aspects-of-the-previous-game/4955, user RedEarth, not
staff): "a sequel just gets a small quality bonus if it's more than 40 weeks past and a penalty if it's less."; Steam discussion
(https://steamcommunity.com/app/239820/discussions/0/864977564210336373/, user Ralek): "releasing sequels on the same engine has a hefty
quality penalty (doesn't apply to expansions)." Official wiki blocked (402). Proves: the smallest possible continuation model is "pick
an earlier work by ID; a cadence rule and a freshness rule shape quality"; ownership is implicit because there is no market. Lesson for
P16: P17 needs only `propertyId` + released-work dates to reproduce this; P16 need not store cadence. · **MEDIUM (community memory)** · NEW.

**F16. Hollywood Animal: scripts are bought outright from a freelance market and can be shelved; sequels are made from a prior *shown*
film, one at a time; adaptations of books/comics/radio were announced as a later Early Access update.** Sources: Outsider Gaming guide
(https://outsidergaming.com/hollywood-animal-guide-strategies-how-to-make-money/) — "if you see such a script for a strangely low price,
just buy it and shelve the script until you are ready to produce it."; Steam discussion search summary ("a film must have been shown to
start a sequel and only 1 sequel can be in production at a time"); developer roadmap search summary (license "books, comics, and radio
shows and adapt them into films" planned as a major EA update). Official store text confirms none of this explicitly. Proves: the
closest genre comparator ships *script purchase* (original parity) and *sequel-from-released-film*, with external adaptation as a
distinct later layer — the same ordering as P16 → P17. · **LOW–MEDIUM** (age-gated primary pages; search summaries) · NEW.

**F17. TEW: no "tape library" mechanic found; ownership is modelled as child companies + broadcaster deals.** Source: Grey Dog TEW 2020
page (https://greydogsoftware.com/title/tew-2020/) — no library/tape/brand-ownership feature text; Grey Dog forum search summary — child
companies with CEO/head booker; company "owned by a Broadcaster or Media Group … will automatically shut down if the owning Broadcaster
or Media Group closes". Proves: nothing for the library model; relevant only to the subsidiary dossier. · **MEDIUM** · NEW.

**F18. Football Manager: a loan is a term-limited exclusive licence of a contract asset with automatic reversion and optional recall;
buy-back and sell-on clauses are standard; a loan with an upfront fee cannot be recalled.** Sources: Sports Interactive community and
sortitoutsi search summaries — "when you loan someone out yourself, you need to include a recall clause in the loan deal"; "any loan
where the club has paid a fee upfront prevents you from recalling the player"; clause primers (danielgeey.com) — buy-back "preset
buy-back price, validity period, and conditions"; sell-on = "a percentage … of any future transfer fee". `guidetofm.com` 403. Proves:
a *single* instrument (term, exclusivity, fee, optional recall/buy-back, automatic reversion) is legible to a mass audience; and
"paid upfront ⇒ no recall" is a natural exploit guard against licensing then snatching back. · **MEDIUM** · NEW.

### 3.4 Project: Studio — what CURRENT/ACCEPTED CODE and APPROVED DOCUMENTATION already fix

**F19. The identity chain is `FilmConcept.id` → `ScriptProject.id` → `Production.id` → released film; a released film's identity IS its
`productionId` for both player and rivals; rival ids are globally unique.** Source: `SCR/p12-accepted/src/core/types.ts:154-163`
(`FilmConcept`), `:680-700` (`ScriptProject{id,conceptId,writerId,…,productionId}`), `:225-239` (`Production{id,conceptId,writerId,…}`),
`:241-265` (`FilmResult{productionId,…,conceptId,directorId,participants?}`), `:291-296` (`Studio.releasedFilms: FilmResult[]`);
`hollywoodTypes.ts:20-46` (`FilmIdentity{filmId,studioId,conceptId,…}`); `hollywoodTick.ts:159` (`${b.studioId}:film:${n}` via
`uniqueIdentity` over `persistedProductionIds`) and `:242` (`filmId:p.id,studioId:b.studioId`). Proves: P16 can key `works: FilmId[]`
as production ids without a new film identity, and `creatorTalentIds` can be read from the film's own `participants`. · **HIGH** ·
CONFIRMED (contract `:358-362`).

**F20. One concept ⇒ at most one screenplay project (managed mode).** Source: `SCR/p12-accepted/src/core/scriptDevelopment.ts:284-288` —
`commission rejected — concept "${payload.conceptId}" already owns a screenplay project`. Rival concepts are minted per studio
(`hollywoodTick.ts:183`). Proves: today `conceptId` is *de facto* 1:1 with a work — tempting as a property key, but APPROVED
DOCUMENTATION forbids treating it as one (F22). A property's second work (sequel/remake) must therefore be a **new** concept/script
whose link to the parent property is a P16/P17 edge, not a shared `conceptId`. · **HIGH** · NEW (structural implication).

**F21. `IndustryFilm.studioId` is the immutable *creating* studio, so ownership cannot live there.** Source: `hollywoodTypes.ts:20-27`;
contract `SCR/p12-accepted/docs/engineering/P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md:358-362` ("the exact original creating studio
for every work"); `HOLLYWOOD-ECOSYSTEM-FUTURE-PROOFING.md:212-213` ("historical records survive a change of owner … because no record
names its owner"). Proves: current ownership must be an **additive root**, never a rewrite of `studioId`. · **HIGH** · QUALIFIED —
the future-proofing sentence "no record names its owner" is true only if `studioId` is read as *creator*; `IndustryFilm` does name a
studio. Reading it as owner would be an error; P16 must add `ownershipEvents`/rights roots (roadmap `:260`).

**F22. Approved documentation already assigns P16 exactly: StoryProperty + Film Library identity, origin-work relationship, chain of
title, rights ownership, rights licensing, restoration/reissue *authority*, dated ownership history, authorized transactions — and
forbids inference/bulk-mint.** Source: contract `:364-375`; P12A register INT-011 `:200`, INT-012 `:201`, SAF-009 `:235`; handoff
`SCR/p12-accepted/docs/engineering/P12-TO-P13-PRODUCER-HANDOFF.md:28`. Roadmap `SCR/p13-docs/docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md:260`
(`ownershipEvents` "P16+ only"), `:693-704` (P16 candidate list), `:715-716` (sequel/franchise/IP strategy deferred). Rulings
`CODEX-P13-P15-OWNER-RULINGS.md:232-234` (§4.2), `:245-262` (§5). Proves: the entity set in §4 below is already the approved
*boundary*; this dossier only shapes its minimum. · **HIGH** · CONFIRMED.

**F23. P17 is contractually an aggregate keyed to an exact P16 `StoryProperty` id and may not mint rights; P18 works "under exact P16
grants" and P16 is "the sole author of the underlying legal right/license, parties, scope/media, territory, term, exclusivity, and
consideration".** Source: contract `:379-392` (P17), `:396-406` (P18, sole-author sentence at `:402`), matrix `:417-419`. Proves: the Licence instrument in §4 must carry at least parties,
scope/media (facet), term, exclusivity, consideration; territory can stay a constant. · **HIGH** · CONFIRMED.

**F24. Finance law (P11) has no net worth, no asset valuation, no depreciation schedule; cash is literal.** Source:
`SCR/pkg-docs/docs/design/CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11.md:266` ("Display as Cash, never 'available cash' or net worth"),
`:313`, `:641` ("not a depreciation schedule or asset valuation"). Proves: any library *valuation* is a new P16 read-model, never a
P11 ledger fact; a sale/licence fee is a P11 ledger entry with a new typed kind. · **HIGH** · CONFIRMED.

**F25. Release is exact-once and keyed to an *active* Production; a reissue cannot reuse the release path.** Source: `types.ts:1525-1537`
(`ReleaseCommitment.productionId` = "Exact active Production id"; row removed atomically when its Production releases); `types.ts:303-318`
(`TheatricalRun` "LOCKED at release … Kept as a HISTORY (never deleted)"); contract `:425` ("exact-once transition and no
duplicate release/result/receipt"). P07 defers "IP/library economics, sequels, home media/streaming" (`CODEX-RECEPTION-BOXOFFICE-PACKAGE-07.md:958`).
Future-proofing `:210-211` says "second revenue episodes are additive". Proves: a reissue is a *new* release kind requiring P07
(result law), P15 (shared-market batch) and P11 (ledger kind) co-authority — not a P16 side feature. · **HIGH** · QUALIFIED (the
handoff gives P16 reissue *authority*; execution needs three other packages — see §4.5).

**F26. P13 already sketches a licence-like instrument for technology (upfront, royalties, term, retained own-use, sale vs licence
distinction) and parks it in P16+ by default.** Source: `SCR/p13-docs/docs/design/CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13.md:823-827`
("licensing itself, its rights object, eligibility, scope, expiry, transferability, price formation, and symmetry are not decided
here"), `:873-876` ("Private use (no agreement), outright rights sale … and supplier licensing remain distinguishable"). Proves: one
generic Licence shape with a `subject.kind` discriminator could serve both story rights and (later) technology rights — a
recommendation, not a decision. · **HIGH** · CONFIRMED (rulings §2.4 keep placement open).

---

## 4. Design implications for P16 — **INFERENCE** (FUTURE RECOMMENDATION unless a finding is cited)

### 4.1 Smallest useful `StoryProperty` (recommended)

```
StoryProperty {
  propertyId: string            // deterministic mint, house precedent = `release-commitment-<productionId>` (F25):
                                //   'property:<originProductionId>' for studio-made material,
                                //   '<studioId>:property:ext:<ordinal>' for externally sourced material. No RNG, no title.
  title: string                 // display; may be renamed (renamedWeek) — never a key
  originalTitle: string         // immutable
  genre: Genre                  // from origin concept / authored
  origin: {
    kind: 'original' | 'authored-start' | 'external'   // 'external' = book/play/life story from the industry source
    originConceptId: string | null                     // provenance only (F20: never a join key for later works)
    originScriptProjectId: string | null
    creatorStudioId: string                            // IMMUTABLE: the studio that greenlit the origin work (F19/F21)
    creatorTalentIds: string[]                         // IMMUTABLE: writer credit(s) of the origin work (F19 participants)
    mintedWeek: number
  }
  works: string[]               // FilmIds (= productionIds, F19), append-only; P17 adds parent/child edges elsewhere
}
```
Ownership is **not** a field on the property; it is derived from the rights ledger (§4.2) so that one mechanism (single-holder
field per right + append-only `ownershipEvents`) serves property, film and licence alike (F5, F21). Status flags are **derived**,
never stored: `unproduced` (works empty), `inUse` (an active production/licence references it), `encumbered` (any live licence),
`dormant` (no active use). Storing them would create a second truth.

**Mint point (recommended: GREENLIGHT).** Mint the property when a Production is created from a ScriptProject: provenance
(`creatorStudioId`, writer ids) is frozen *before* any acquisition can move the production (assignment §2.H), every released film
already has its property when P17 needs it, and a cancelled production leaves a legible "unproduced property" (the WGA reacquisition
case, F7). Alternatives: mint at *release* (fewest objects, but an inherited mid-production film would need its creator recovered
from the transfer log) or at *commission* (one property per script — clutter). Authored-start films (`provenance:'authored-start/v1'`)
are minted once, by exact `filmId`, at P16 migration — explicit-ID minting, not inference (F22). **Owner decision** (§5 Q1).
*'external'* properties are minted at the option/purchase event; no work exists yet.

### 4.2 Smallest rights bundle — four rights, one licence instrument

| # | Right | Subject | Holder cardinality | What it authorises | Justification |
|---|---|---|---|---|---|
| R1 | **PROPERTY** | `propertyId` | exactly one owner (`StudioId` or the external source) | everything not carved out below; sell; grant licences on R3/R4 | F4 (property ≠ film); F13 (IP entity) |
| R2 | **FILM** (library) | `FilmId` | exactly one owner per released work | future distribution/media proceeds (P18), reissue authority (P16, execution deferred), valuation, sale | F9/F10 (libraries sold apart from studios and from sequel rights) |
| R3 | **CONTINUATION** | facet of R1 | property owner by default; *holdable by an exclusive licensee for a term* | propose/produce sequel, prequel, remake, spin-off (consumed by P17) | F7/F8 (the carve-out real deals make; use-it-or-lose-it) |
| R4 | **CROSS-MEDIA** | facet of R1 (property) **and** of R2 (film) | owner by default; licensable exclusive *or* non-exclusive | television/series adaptation (R1 facet), exhibition windows of the film (R2 facet) — **reserved, P18 consumes** | F7 (merch/stage/TV reserved rights), F9 (distribution as term licence), F11 |
| L | **Licence** (instrument) | any of R3/R4 (later: P13L technology) | grantor = holder of the underlying right; one grantee | time-limited grant with `exclusive`, `term`, `consideration`, `reversion` | F6/F8/F9/F18 |

**Rule of separation (keeps it non-clerical):** R1 and R2 are *ownable* and *sellable*; R3 and R4 are *facets* that can only be
**licensed** away, never sold apart from R1/R2. This reproduces every famous structure in §3.2 (DreamWorks: sell R2, keep R1+R3+R4,
grant R4-distribution licence; Sony/Marvel: keep R1, licence R3 exclusively with reversion; Lucas: creator keeps R3+R4) without
territory/window sub-rights.

```
Licence {
  licenceId, subject: { kind:'property'|'film'|'technology(later)', id },
  facet: 'continuation' | 'crossMedia' | 'distribution(P18)',
  grantorStudioId, granteeStudioId,
  exclusive: boolean,                 // F11: exclusive ⇒ grantee is the holder of the facet for the term
  startWeek, termWeeks,               // F6/F9: fixed term; expiry ⇒ automatic reversion
  consideration: { upfront: number; royaltyRate?: number },   // royalty only if a revenue event exists (P18/P13L)
  useItOrLoseIt?: { deadlineWeek: number }                     // F8: reverts early if no qualifying work released/greenlit
  status: 'active' | 'expired' | 'reverted' | 'terminated'
}
```

**Decision matrix — what each right creates and what breaks if dropped**

| Right | Player decisions it creates | If dropped |
|---|---|---|
| R1 PROPERTY | buy/sell a property; option external material; hold vs sell an unproduced property; who may sequel it | no "story property" subject → P17 must infer franchises from films (forbidden, F23); external material impossible |
| R2 FILM | sell the library (or one film) for cash while keeping the property; buy a rival's library for valuation/P18 | library and property collapse: selling the old film also sells sequel rights (contradicts §2.C/§2.D and F9); library value cannot be separated from franchise value |
| R3 CONTINUATION | licence sequel rights for a term (income now, control later); reversion pressure; buy a licence rather than the whole property | every continuation deal becomes a full sale; no use-it-or-lose-it tension; P17 has only "owner" to check |
| R4 CROSS-MEDIA | *none in P16* — reserved so that P16 sales are complete and P18 has a grant surface | P18 would have to re-open every P16 transaction to define what TV rights went where (duplicate authority, F23) |
| L Licence | exclusive vs non-exclusive; term; upfront vs royalty; reversion; recall guard | only outright sales exist → nothing is temporary, no recovery-without-loss, no Sony/Marvel pattern |

### 4.3 What may be licensed vs sold

| Thing | Sold (ownership transfer) | Licensed | Never |
|---|---|---|---|
| R1 PROPERTY (whole) | yes (single transfer event; carries R3/R4 facets not currently licensed out; live licences survive the sale — the buyer takes them encumbered) | no (licensing R1 "whole" is just R3/R4 licences) | — |
| R2 FILM | yes (per FilmId; live R4 licences survive) | no (its facets are) | — |
| R3 CONTINUATION | no | yes, **exclusive only** (F11 — two studios cannot both hold "the" sequel), term + optional use-it-or-lose-it | — |
| R4 CROSS-MEDIA | no | yes, exclusive or non-exclusive (P18 defines exploitation; P16 records the grant) | — |
| Unproduced ScriptProject (original-parity script sale, F1) | **Owner decision** (§5 Q2): if included, it is a sale of the property minted at commission *or* a P12-owned transfer of the ScriptProject | no | — |
| Credits, `creatorStudioId`, `creatorTalentIds`, release history, awards | — | — | never transfer (F21/F22) |
| Brand/label name | (acquisition dossier) | | |

### 4.4 Permanence rules

1. A transfer event writes only `to`, `week`, `consideration`, `transactionId`; it never touches `StoryProperty.origin`,
   `IndustryFilm.studioId`, `FilmResult`, credits, awards or `studioHistory` (F21/F22).
2. A sequel produced after a sale is a **new work** whose `IndustryFilm.studioId` is the *new owner* (the producer of that work) and
   whose P17 parent edge points at the parent `propertyId`; the property's `origin.creatorStudioId` stays the original studio. History
   reads: "Property *Nightfall* (created by Apex 1934) · owned by Spector Pictures since 1951 · *Nightfall Returns* (1953, Spector)".
3. Renaming a property never changes `originalTitle`, `propertyId` or any work title.
4. Reversion/expiry of a licence is an event, not a deletion: the licence row stays with `status:'reverted'|'expired'`.
5. Ownership at any past week is reconstructible from `ownershipEvents` alone (F5) — a Legacy/P15C proof obligation.

### 4.5 Library value without perpetual weekly cash

- **Valuation-only read-model** (P16A): `libraryValue(studio, week)` = Σ over owned R2 films of `f(criticScore, boxOffice.total,
  awards, age decay)` + Σ over owned R1 properties of `g(works count, best work, unproduced?)`; formula-versioned like
  `rankSnapshots` (roadmap `:258`), displayed as "Library (estimated)", never in the P11 ledger (F24), never added to Cash.
  This is the input the valuation dossier (§N) should consume for "film-library value" and "Story Properties" without double
  counting: count R1 once (property) and R2 once (film); a property's *sequel potential* is R1 value, a film's *catalog* value is R2.
- **One-off cash events allowed pre-P18**: (a) sale of R1/R2 (P16B), (b) licence `upfront` on R3 (P16B), (c) licence `upfront` on R4
  **only if** P18 does not exist yet is an Owner call — recommended *no* (granting a facet nobody can exploit invites a fake market).
- **Reissue — NOT safe pre-P18 as a P16 side-feature.** It needs a second release/result episode for a settled `productionId` (F25:
  exact-once release keyed to an active Production; `TheatricalRun` is locked history), a P15 shared-market batch entry, and a P11
  ledger kind; its economics (how much an old film earns re-released) is P07 reception law, not rights law. Recommendation: P16A
  records *reissue authority* (who may authorise a reissue = R2 holder) and nothing else; reissue execution is a P16D or P18
  co-charter with P07/P11/P15. Rationale: a reissue implemented as "R2 holder presses a button and gets cash" would be exactly the
  perpetual library cash the Owner excluded, just chunked.
- **Do not** let library value leak into weekly Standing/awareness; prestige from old films already lives in P08 history.

### 4.6 Exploit guards for asset sales (recommended minimum)

| Guard | Rule | Prevents | Precedent |
|---|---|---|---|
| Single-holder + append-only log | each R1/R2 has one holder field derived from `ownershipEvents`; validator refuses a transfer whose `from` ≠ current holder or whose week < last event | duplicate ownership, replay, "sell twice" | F5 chain of title; F13 |
| Rights-in-use lock | cannot sell R1 or licence R3 exclusively while a production on that property is active *unless* the production transfers in the same transaction or the seller retains a licence for that production; cannot sell R2 while the film's `TheatricalRun.status === 'active'`; cannot sell R1/R2 while an exclusive licence you granted is live unless the buyer takes it encumbered | selling what you are using; orphan productions | F13 (MGT2 "no games currently being sold"); F18 (paid loan ⇒ no recall) |
| Holdback (no flip) | a right acquired by purchase cannot be resold for N weeks (paper hypothesis: 52); a right *created* by the studio has no holdback | week-scale flipping | F10 (real flips are multi-year) |
| AI memory on rebuy | for M weeks after selling an asset, an AI's bid for the same asset ≤ price it received × (1 − haircut); for M weeks after buying, its ask ≥ price paid × (1 + premium) — both visible as "Apex remembers this deal" | ping-pong arbitrage against AI | F14 (Software Inc. placeholder pricing exploit) |
| Buy-back only as a clause | seller may attach an explicit buy-back option (price, window) at sale time — otherwise repurchase is at the buyer's ask | hidden "undo" | F9 (DreamWorks 5-year repurchase right) |
| AI valuation floor | AI never sells below its own valuation of R1 (incl. continuation potential) and R2; never buys above; a rival must have the cash (conservation, P11/P12 rival accounts) | free money from AI; the original's "hover price ⇒ guaranteed cash" (F1) | F14 |
| Use-it-or-lose-it on exclusive R3 licences | optional deadline; revert if no qualifying greenlight | licence squatting to block a rival's sequel | F8 |
| Recovery mode | none of the above is relaxed for a distressed studio; distress changes *price*, not *law* (Rival M&A symmetry) | player-only rescue exploit | assignment §2.J |

### 4.7 How P17 and P18 consume P16

- **P17** reads `StoryProperty.works`, the current holder of R3 for the property (owner, or exclusive licensee in term) and the
  licence's `useItOrLoseIt` deadline. A continuation proposal is *authorised* iff the proposing studio is that holder. P17 stores the
  franchise aggregate (heat, fatigue, cadence — cf. F15) keyed to `propertyId` and adds parent/child edges between FilmIds; it never
  writes a right. Releasing a continuation appends the new FilmId to `works` (a P16 write on P17's request) and mints **no** new property.
- **P18** reads R4 grants (`Licence.facet === 'crossMedia' | 'distribution'`) and R2 holders. A television series based on a property
  requires an R4-property grant (or ownership); exhibiting/licensing an old film requires the R2 holder's R4-film grant. P18 owns the
  workflow and revenue; P16 owns the grant row (F23).

### 4.8 Summary table (requested)

| Right | Who can hold | Transferable (sale)? | Licensable? | Default at film release | What P17 / P18 consume |
|---|---|---|---|---|---|
| R1 PROPERTY | one studio, or external source (book/play author) until purchased | yes, whole; live licences survive | no (its facets are) | minted at greenlight to the greenlighting studio; unchanged at release | P17: identity key + owner fallback for R3; P18: grantor of R4-property |
| R2 FILM | one studio per FilmId | yes, per film or as a library lot | no (its R4 facet is) | releasing studio (= `IndustryFilm.studioId` at that moment) | P18: exhibition/distribution grants; valuation dossier: catalog value |
| R3 CONTINUATION | R1 owner, or one exclusive licensee for a term | never separately | exclusive only, term, optional use-it-or-lose-it | R1 owner | P17: sole authority check for sequel/remake/spin-off |
| R4 CROSS-MEDIA | R1 owner (property facet) / R2 owner (film facet), or licensee(s) | never separately | exclusive or non-exclusive, term | owner; **no grants issued in P16** | P18: every TV/streaming/merch workflow is "under a grant" |
| L Licence | grantor = current holder of the facet | no (a licence is not resold; it expires, reverts or is terminated) | n/a | none exist at release | P17/P18 read `status:'active'` rows only |

---

## 5. Open questions (genuine Owner/charter decisions; none resolved here)

1. **Mint point** for studio-made properties: greenlight (recommended), release, or commission.
2. **Original-parity script sale** (F1): include in P16B as a sale of an unproduced property/ScriptProject, or leave out of P16 entirely
   (it drags a P12-owned development object across studios).
3. **R4 grants before P18**: forbid (recommended) or allow upfront-fee grants with no exploitation.
4. **Reissue**: P16 authority only (recommended) vs a small P16D reissue slice co-chartered with P07/P11/P15.
5. **External material source**: a governed industry source (like P13's supplier) vs authored catalogue vs none in P16A.
6. Holdback N, AI memory M, haircut/premium — paper numbers; whether holdback also applies to rival-to-rival deals.
7. Whether the Licence instrument is shared with the P13L technology-rights slice (F26) or kept story-only.
8. Whether unproduced properties count in library valuation at all (recommended: small, flat, so hoarding options has a cost).

---

## 6. Source table

| # | Source | Type / tier | Locator | Used for |
|---|---|---|---|---|
| S1 | Official PC manual | SHIPPED RETAIL | `SCR/original-corpus/manual_english.txt:136-137, 428-431` | F1, F2 |
| S2 | Prima Official eGuide | PRIMA (developer-reviewed) | `SCR/original-corpus/prima_eguide.txt:405, 411` | F2 |
| S3 | GameFAQs guides (Mark_E_1990; Maxx) | CONTEMPORARY PLAYER | `…Mark_E_1990…txt:643-644, 711-713`; `…Maxx…txt:624-627` | F1 |
| S4 | MECHANICS-BIBLE / facility_catalog.csv | PRIOR PROJECT PROSE | `MECHANICS-BIBLE.md:489,574,1220`; `ORIGINAL-DATA/facility_catalog.csv:21` | F1 status |
| S5 | U.S. Copyright Office Circular 14 | PRIMARY (law) | https://www.copyright.gov/circs/circ14.pdf (fetched, pdftotext) | F4 |
| S6 | WIPO "From Script to Screen" | AUTHORITATIVE | https://www.wipo.int/pressroom/en/stories/ip_and_film.html | F5, F6, F7 |
| S7 | WGA West "Understanding Separated Rights" | PRIMARY (guild) | https://www.wga.org/contracts/know-your-rights/understanding-separated-rights | F7 |
| S8 | Thoolie chain-of-title; option/purchase guides | PRACTITIONER PRIMER | https://thoolie.com/guides/film-chain-of-title/ ; https://thoolie.com/creator_resource/option-and-purchase-agreements-for-film-guide/ | F5, F6 |
| S9 | Harvard JSEL, Spider-Man rights | LAW-SCHOOL JOURNAL | http://journals.law.harvard.edu/jsel/2019/09/spider-man-where-is-home-as-sony-marvel-compete-over-rights/ | F8 |
| S10 | NBC News/AP, Viacom DreamWorks library sale; Viacom 8-K | PRESS + SEC FILING | https://www.nbcnews.com/id/wbna11881441 ; https://www.sec.gov/Archives/edgar/data/0001339947/000110465906033560/a06-11607_1ex99.htm | F9 |
| S11 | ScreenDaily/IndieWire (Paramount→Disney $115M) | PRESS (search summary) | https://www.screendaily.com/distribution/disney-pays-115m-to-distribute-iron-man-3-the-avengers-/5019523.article | F9 |
| S12 | CBR, Star Wars Episode IV rights | PRESS | https://www.cbr.com/disney-star-wars-episode-iv-rights/ | F9 |
| S13 | Wikipedia "Turner Entertainment" (cited) | ENCYCLOPEDIA w/ citations | https://en.wikipedia.org/wiki/Turner_Entertainment | F10 |
| S14 | Disney press release, Miramax sale | PRIMARY (company) | https://thewaltdisneycompany.com/press-releases/disney-completes-sale-of-miramax-films-to-filmyard-holdings-llc/ | F10 |
| S15 | NoFilmSchool; Deadline (Lucas sequel/merch) | PRESS (secondary) | https://nofilmschool.com/george-lucas-star-wars-rights-gamble | F7 |
| S16 | Copyright Alliance FAQ | AUTHORITATIVE (trade) | https://copyrightalliance.org/faqs/exclusive-vs-nonexclusive-licenses/ | F11 |
| S17 | ASC 926 summaries (PwC/KPMG/Bloomberg Tax) | SECONDARY (accounting) | search summary; https://viewpoint.pwc.com/… ; https://kpmg.com/… | F12 |
| S18 | Mad Games Tycoon 2 Steam page; discussions | OFFICIAL + PLAYER | https://store.steampowered.com/app/1342330/ ; https://steamcommunity.com/app/1342330/discussions/0/3460471649935880326/ | F13 |
| S19 | Software Inc. Steam discussion (incl. developer) | PLAYER + DEVELOPER | https://steamcommunity.com/app/362620/discussions/0/535151589911006214/ | F14 |
| S20 | Game Dev Tycoon forum/Steam | PLAYER (community memory) | https://forum.greenheartgames.com/t/sequels-keeping-aspects-of-the-previous-game/4955 ; https://steamcommunity.com/app/239820/discussions/0/864977564210336373/ | F15 |
| S21 | Hollywood Animal store page; guide; search summaries | OFFICIAL + PLAYER (partial) | https://store.steampowered.com/app/2680550/ ; https://outsidergaming.com/hollywood-animal-guide-strategies-how-to-make-money/ | F16 |
| S22 | Grey Dog TEW 2020 page; forum summaries | OFFICIAL + PLAYER | https://greydogsoftware.com/title/tew-2020/ | F17 |
| S23 | Football Manager community/clause primers | PLAYER + PRACTITIONER (search summaries) | https://www.danielgeey.com/done-deal-blog/football-transfers-buy-back-clauses-explained | F18 |
| S24 | P12 accepted code | CURRENT/ACCEPTED CODE | `SCR/p12-accepted/src/core/types.ts`, `hollywoodTypes.ts`, `hollywoodTick.ts`, `scriptDevelopment.ts` (lines in F19–F21, F25) | F19–F21, F25 |
| S25 | P12 consumer contract; P12A register; P12→P13 handoff | APPROVED DOCUMENTATION | `SCR/p12-accepted/docs/engineering/…` (lines in F21–F25) | F21–F25 |
| S26 | P13–P15 roadmap; Owner rulings; P15 package; P13 package | APPROVED DOCUMENTATION | `SCR/p13-docs/docs/design/…` (lines in F3, F22, F26) | F3, F22, F26 |
| S27 | P11, P07 packages | APPROVED DOCUMENTATION (product law) | `SCR/pkg-docs/docs/design/…:266,313,641` ; `…PACKAGE-07.md:958` | F24, F25 |
| S28 | HOLLYWOOD-ECOSYSTEM-FUTURE-PROOFING | APPROVED DOCUMENTATION (long-horizon) | `SCR/p12-accepted/docs/HOLLYWOOD-ECOSYSTEM-FUTURE-PROOFING.md:210-213` | F21, F25 |

Failed sources (see §2): Wikipedia chain-of-title page (404); Game Dev Tycoon fandom wiki (402 ×3); deepfocus.law (DNS); Variety and
Deadline (paywall redirect); ensigame (503); octopusoverlords (403); Hollywood Animal Steam discussions (age gate); guidetofm (403);
Wikipedia "Star Wars (film)" (truncated); no primary text for the Fox/X-Men reversion clause.
