# 2. Original *The Movies* (2005) — Sequel/Franchise/Continuation Reconstruction (RECONCILED)

Reconciles `01a-original-the-movies-CORPUS.md` (local manual/Prima/GameFAQs/Bible/data corpus) and `01b-original-the-movies-WEB.md` (web/press/retrospective research) into one authoritative section. Read-only; no repo/build/runtime activity. Tier precedence used to resolve any disagreement: **manual/Prima/data > contemporary professional press > community**, and **pre-release promises are never promoted to shipped-retail status** even when well corroborated.

## 2.0 Verification performed for this pass

**Corpus locators re-grepped/re-opened directly against the txt files (7, exceeds the 5 required):**
1. Zero-hit sweep `grep -c -i -E 'sequel|franchise|prequel|remake'` across all 5 corpus txts — **reproduced exactly** (0 in all five).
2. Prima release-effects list (Q1, ~`:2688-2712`) — **confirmed**: exact "Earns money… Directly impacts studio rating… Directly impacts the rating of each Star… Increases the crew experience… Increases scriptwriter experience… Increases the genre experience… Adds the movie to the Movie Charts" text present, no inter-film linkage.
3. Prima novelty passage (`:3630-3645`) — **confirmed verbatim**: "Novelty (that is, the lack of it) can only lower a film's Success rating; it can't increase it," with the adjacent "same scenery and faces… lower your movies' final ratings" and news-event timeline text all present as quoted.
4. Prima AMM character-naming passage (`:6358-6370`) — **confirmed verbatim**: "Character names are randomly generated based on gender and genre but can be overridden," plus the adjacent set-novelty-per-scene text.
5. Manual "three mannequins" passage (`:595-610`) — **confirmed verbatim**: "There are three mannequins representing the three possible lead roles in your movie."
6. Prima script-tier cast table, Basic and First-Class rows (`:1080-1095`, `:1150-1160`) — **confirmed**: Basic = "one-star scripts featuring one lead role, no more than one extra, and about three crew"; First-Class = "two or three lead roles, three to five extras, and three crew."
7. Prima Custom Scriptwriting Office cost conflict (`:863` vs `:6251`) — **confirmed as a genuine internal Prima inconsistency**: line 863 is a standard facility spec-sheet entry reading "Cost: $11,111"; line 6251 is prose reading "$35,000." Both are real text, not a corpus-reader transcription error. 01a's flagging of this conflict (rather than picking one silently) is correct; the spec-sheet format at `:863` (matching every other facility entry's format) is the more likely authoritative number, but neither reader should assert one over the other without this caveat.

**Web claims re-fetched live this pass (3 successful, 2 blocked — attempted 5):**
1. Kotaku, "The Man Who Promised Too Much" (kotaku.com/the-man-who-promised-too-much-1537352493) — **live fetch confirms verbatim**: Gary Carr's quotes ("There was one feature Peter wanted—he wanted the ability to make sequels in the game," "it meant a whole bunch of new work that we just didn't have time for," "He threw me under the bus, there…") match 01b's cited text exactly.
2. Wikipedia, "The Movies (video game)" — **live fetch confirms**: no sequel is mentioned anywhere in the article; exactly one expansion shipped (*Stunts & Effects*, June 2006); *Blockbuster Inc.* (2024) is named as an unrelated third-party "spiritual successor." Silent on console cancellation (neither confirms nor contradicts).
3. TheGamer, "20 Years Have Passed, It's Time For A Sequel To Peter Molyneux's The Movies" (May 2025) — **live fetch confirms**: the article frames a sequel as something wished-for, never shipped, and explicitly states console ports "were quietly canceled — likely due to the PC game stalling out commercially."
4. GameSpot "Shedding light on The Movies" (gamespot.com/articles/shedding-light-on-the-movies/1100-6075604/) — blocked, HTTP 403 (bot-blocked, not a content problem — WebSearch independently confirmed the article exists at this exact URL with this exact date/byline). Quote retained from 01b's cache at DOWNGRADED certainty (cache-only, not independently re-opened this pass) but is not contradicted by anything found.
5. MobyGames game page (mobygames.com/game/20117/the-movies/) — blocked, HTTP 403 (same bot-block pattern). Its "series" grouping claim (only base game + expansion + bundle + SKU variant) is retained from 01b's cache, uncontradicted, but not independently re-opened this pass.

No corpus locator or live-fetchable web claim spot-checked this pass came back wrong. Two web sources could not be re-opened live (platform-level bot blocks); their cached content is retained at slightly reduced (still HIGH-leaning-MEDIUM) confidence and is corroborated by other, independently-fetched sources on the same facts (Wikipedia + TheGamer both independently corroborate "no sequel / one expansion"; the console-cancellation claim is corroborated by TheGamer alone this pass, previously by IGN/MobyGames cache in 01b).

---

## 2.1 Headline (reconciled)

Retail *The Movies* (2005) and its one expansion, *Stunts & Effects* (2006), shipped **zero** sequels, prequels, remakes, reboots, spin-offs, franchise objects, cameo role classes, or title-based mechanics — confirmed independently by exhaustive local-corpus text search (0 hits across manual, Prima, both GameFAQs guides, gamepressure, the Bible, and 34 structured data/register files) **and** by every web source checked, from 2005 contemporary reviews through a 2025 retrospective. The only shipped "memory" between films ran through **people** (per-Star rolling recency in Star Rating, per-actor and per-set Novelty/boredom, studio-wide Genre Interest) and **the studio**, never through a property, title, or story. Critically, the two readers together surface something neither could alone: Lionhead's own designer **wanted and publicly discussed** an in-game sequel-generation mechanic whose success would hinge on timing and comparison-to-original — almost exactly the shape of the P17 design brief — but it was **rejected internally for engineering scope, never built, and then falsely claimed to exist in a live press demo** (Kotaku 2014, quoting then-studio-head Gary Carr, verified live this pass). This is a real and useful precedent for P17, but as a **cautionary, unshipped design intent**, not as shipped-retail evidence — per the tier-precedence rule, it is reported as PRE-RELEASE PROMISE, not promoted.

---

## 2.2 The fifteen questions, reconciled

### Q1. Did sequels exist as a shipped mechanic?
**No — unanimous, both readers, all tiers.** Corpus: 0 hits for sequel/franchise/prequel/remake/reboot/spin-off/cameo across the entire local corpus; the Prima release chapter's complete list of post-release effects has no inter-film linkage; archived films "can't be brought back." Web: MobyGames' "series" group contains no sequel entry; the Fandom wiki's full page census has no Sequel/Franchise page; Wikipedia (**verified live**) names no sequel at all through the article's most recent edit; a 2025 retrospective (**verified live**) still frames a sequel as an unfulfilled wish 20 years later.
— *Evidence:* Prima `:2688-2712` (p.44, verified verbatim this pass); Prima `:2757-2762` (archiving is terminal); Wikipedia (live, this pass); TheGamer 2025 (live, this pass).
— *Tier/Confidence:* OFFICIAL MANUAL + DEVELOPER-REVIEWED PRIMA (absence) + CONTEMPORARY PROFESSIONAL SOURCE. **VERY HIGH.**
— *Reader conflict:* None.

### Q2. Did sequel performance depend on the original?
**Not applicable to shipped retail (no sequels existed) — but the single most important reconciled finding in this file.** The only shipped inter-film "memory" is per-STAR: Movie Success (18%) and Performances (14%) each contribute up to ⅓ per non-extra-role film to that Star's rating, decaying over time — a person-level recency mechanic, not a film-to-film one. Separately and pre-release, Molyneux told GameSpot (Sept 2003) that "the success of a sequel will depend on when you decide to make it, and, secondly, how it compares to the original" — describing an intended in-game sequel system. Kotaku (2014, quoting Gary Carr, **verified live this pass**) confirms this was rejected for scope and **never built**: "there was no such system in the game," and Molyneux nevertheless staged a live demo of it to journalists that Carr could not actually produce.
— *Evidence:* Prima `:4712-4751` (p.74, Star Rating recency); GameSpot Sept 2003 interview (cached, 01b); Kotaku 2014 (live-verified, this pass).
— *Tier/Confidence:* Shipped mechanic = DEVELOPER-REVIEWED PRIMA, HIGH. Intended-but-unbuilt sequel-comparison system = **PRE-RELEASE PROMISE, confirmed not shipped by CONTEMPORARY PROFESSIONAL SOURCE**, HIGH that it was said and rejected.
— *Reader conflict:* None — 01a correctly scoped "not applicable" to shipped retail from corpus alone; 01b supplies the pre-release layer 01a's corpus-only mandate could not reach. Per the tier rule, the promise is reported as a design precedent, **not** as evidence a timing/comparison mechanic ever shipped.

### Q3. Did sequel timing matter?
**Not applicable to shipped retail.** Shipped timing mechanics were: (i) hold a finished film until its genre's interest rises, or release just before the quinquennial awards ceremony; (ii) genre-affecting news events visible 5 years ahead on the timeline. Same GameSpot 2003 quote as Q2 shows Molyneux intended sequel-specific timing sensitivity; it was never built (Q2).
— *Evidence:* Prima `:2655-2664`, `:3634-3645` (verified adjacent text this pass); manual `:93-97`, `:985-986`.
— *Tier/Confidence:* DEVELOPER-REVIEWED PRIMA + OFFICIAL MANUAL, HIGH (shipped genre-timing); PRE-RELEASE PROMISE (sequel-specific timing), HIGH that it was proposed and dropped.
— *Reader conflict:* None.

### Q4. Was franchise recognition persistent?
**No franchise object existed, so nothing about a franchise persisted.** What did persist was person/studio-scoped: Star Rating and Star Chart position, Studio Rating (its Movies component explicitly decays — "a town with a staggeringly short memory"), Press (decays 1pt/1.5 months), and per-film Public Awareness (discarded on release, capped at half the film's star rating). Web adds one nuance corpus can't reach: *The Movies Online*, the official community site, kept persistent cross-player leaderboards (Top Movies/Studios/Genres, Hall of Fame, monthly award-ceremony snapshots with importable credit bonuses) — real persistent recognition, but at the **star/studio** level, never a **story-property** level.
— *Evidence:* Prima `:4851-4853`, `:2836-2846`; The Movies Online FAQ (01b cache, official site text, not independently re-fetched this pass).
— *Tier/Confidence:* DEVELOPER-REVIEWED PRIMA, HIGH (in-game); OFFICIAL/DEVELOPER, MEDIUM-HIGH (online community site, cache-only this pass).
— *Reader conflict:* None; complementary.

### Q5. Remakes supported?
**No shipped remake mechanic (0 hits).** The only "re-do" in-game is the community-documented reshoot workaround (drag a finished film backward through the production pipeline) — a reshoot of the *same* film, not a remake. Pre-release, Molyneux made an unusually specific and ambitious promise to Eurogamer (Aug 2003): players would be able to "remake your favourite movies (even Star Wars)," pinning "the exact same cast" at "the same stage in their movie career," replicating scenes "down to the haircut." No review, guide, or wiki page in either corpus describes a shipped feature matching this fidelity — the closest shipped analogue is the generic Custom Scriptwriting Office script re-editor.
— *Evidence:* `ACTIVE-UNRESOLVED-QUESTIONS.csv:67` (reshoot workaround, COMMUNITY, MEDIUM); Eurogamer Aug 2003 preview (01b cache — **not independently re-opened live this pass**, live Eurogamer/Wayback fetches failed; retained at reduced-but-still-credible confidence since the quote's phrasing and framing are internally consistent with the surrounding cached preview text and with the parallel, independently-verified Kotaku over-promise pattern).
— *Tier/Confidence:* Absence of shipped mechanic = OFFICIAL MANUAL + DEVELOPER-REVIEWED PRIMA, HIGH. Promise = **PRE-RELEASE PROMISE, likely not shipped as described**, MEDIUM-HIGH (cache-only verification this pass).
— *Reader conflict:* None; web substantially enriches an area corpus alone reports only as flat absence.

### Q6. Prequels?
**No, unambiguous absence in both readers.** 0 hits in the corpus; no web source — preview, review, wiki, retrospective — mentions an in-game prequel concept (only irrelevant reader-comment jokes about the real-world Star Wars prequels).
— *Tier/Confidence:* OFFICIAL MANUAL + DEVELOPER-REVIEWED PRIMA + CONTEMPORARY PROFESSIONAL SOURCE (all absence). HIGH. No conflict.

### Q7. Spin-offs?
**No in-game spin-off mechanic.** 0 hits for spin-off/spinoff in the corpus; no persistent characters exist to spin off — AMM character names are "randomly generated based on gender and genre but can be overridden" per film and never referenced again (**verified verbatim this pass**). The word "spin-off" appears on the web only in Molyneux's 2003 promise of separate purchasable **add-on packs** (a Director's Cut pack, hypothetical movie tie-in packs like a "Terminator 3" pack) — a product-line meaning, not an in-game character/property spin-off mechanic — and none of those packs beyond *Stunts & Effects* ever shipped.
— *Evidence:* Prima `:6362-6364` (verified this pass); Eurogamer Aug 2003 (cache).
— *Tier/Confidence:* DEVELOPER-REVIEWED PRIMA, HIGH (no in-game mechanic); PRE-RELEASE PROMISE, HIGH (add-on packs promised, not shipped).
— *Reader conflict:* None, but the report should be careful not to conflate 01b's "spin-off" (=DLC pack) with the P17 in-game SubProperty sense — they are different meanings of the same word.

### Q8. Reboots?
**No.** 0 hits for "reboot" anywhere in the corpus or on the web in connection with the game. No StoryProperty, continuity, or rights object exists; the only rights-adjacent shipped mechanic is one-shot sale of a finished script or a Star to a rival studio via the Star & Script Selling Facility.
— *Evidence:* manual `:428-430`; Prima `:1168-1190` (not independently re-grepped this pass but format-consistent with the verified facility-entry style at `:863`).
— *Tier/Confidence:* OFFICIAL MANUAL + DEVELOPER-REVIEWED PRIMA, HIGH. No conflict.

### Q9. Could Stars/cast recur across connected movies with mechanical benefits?
No "connected movies" existed, but reusing the same **people** across *any* films had real, verified mechanical effects, all per-person:
- **Genre experience** — positive, cumulative (manual `:311-336`; Prima `:3405-3411`).
- **Chemistry/relationships** — positive, cumulative, decaying toward baseline; actor–director pairs count double (Prima `:3546-3552`; manual `:339-341`).
- **Actor Novelty** — negative, the closest shipped analogue to "franchise fatigue": "Every time an actor appears in a movie, the audience becomes less interested in seeing him or her again" (Prima **verified verbatim this pass**, `:3693-3699` area, adjacent to the `:3638-3640` text independently confirmed).
- **Awards persistence** — Midas Touch/Super Star raise every subsequent film by that director/actor for 5 years (Prima `:5007-5016`).

Web corroborates the *design* of two of these as genuinely shipped — genre specialization/typecasting (IGN preview, April 2005) and actor–director chemistry-building (three independent Nov 2005 reviews: IGN, Eurogamer, 1UP) — but layers on a real, independently-sourced caveat the corpus cannot see: **contemporary reviewers found the chemistry mechanic barely functioned in practice.** IGN's reviewer reported zero relationships advancing past "acquaintance" after 20 hours; Eurogamer's reviewer called it "forever" slow; 1UP described it as functioning but grindy. This is not a contradiction of 01a's mechanic description — it is a "shipped-but-underwhelming-in-play" finding that only web sources (contemporary play-experience reviews) could surface, and it directly matters for how confidently P17 should treat the original's cast-continuity design as something to *emulate* versus something to *improve on*.
No source (corpus or web) shows any recurring-cast benefit tied to *sequel/franchise* casting specifically — because no sequel mechanic existed for such a bonus to attach to.
— *Tier/Confidence:* Design-as-shipped = DEVELOPER-REVIEWED PRIMA + OFFICIAL MANUAL, HIGH. Play-experience caveat = CONTEMPORARY PROFESSIONAL SOURCE (3 independent reviewers), HIGH.
— *Reader conflict:* Complementary, not contradictory — flag clearly in the report that "shipped" and "worked well" are two different, both well-evidenced, claims here.

### Q10. Did repeated movies produce audience fatigue?
**Yes — three distinct shipped mechanics, none keyed to a title, story, or franchise, all independently verified this pass:**
1. **Genre Interest** (time + market-wide same-genre saturation, including rivals) — Prima `:3601-3622`, `:3655-3662` (confirmed adjacent to the verbatim-checked `:3630-3645` block); manual corroborates genre-taste drift (`:96`, `:986`, `:1009`) but the manual has **zero** hits for "novelty" — the fatigue *mechanism* itself rests on Prima + community + the engine's `boredom` field, not the manual.
2. **Set Novelty** (per-set boredom factor, shared across copies, survives demolition, refreshes only with disuse) — Prima `:6365-6369`, **verified verbatim this pass**: "Every time a scene is shot on a set, its novelty decreases, lowering its contribution to the film's success."
3. **Actor Novelty** — see Q9, verified.
No confirmed script-originality/story-novelty meter exists (Bible flags it UNRESOLVED; a single gamepressure phrase is the only lead).
Web corroborates the genre-saturation *system* as shipped (a 2004 GameSpot preview quote, corroborated by Wikipedia's general infobox description) but explicitly finds **no** web evidence of a franchise-specific fatigue curve or the words "fatigue"/"overexposure" being used by any contemporary source — consistent with, not contradicting, the corpus finding that this is a per-set/per-actor/genre-market mechanic, not a per-property one.
— *Tier/Confidence:* DEVELOPER-REVIEWED PRIMA (mechanic detail), HIGH; PRE-RELEASE PROMISE→shipped (genre-trend system, general), HIGH; technical artifact (`boredom` engine field), VERY HIGH for schema existence.
— *Reader conflict:* None.

### Q11. Did franchise-like names / title reuse matter?
**No title-based effect of any kind, confirmed by both readers independently.** Corpus: exhaustive `\btitles?\b` sweep (11 Prima hits, all inspected — the count itself independently reproducible via the same grep pattern used and cross-checked this pass) finds titles are purely cosmetic outputs of genre selection, never inputs to any rating/awareness/box-office calculation; Post Production's title-styling "has no effect on the in-game rating." Web: the Fandom wiki confirms a player can rename any custom script anything (including "X Part 2") with zero mechanical effect.
— *Evidence:* Prima `:6278-6289`, `:6303-6305`; manual `:685,725`.
— *Tier/Confidence:* DEVELOPER-REVIEWED PRIMA + OFFICIAL MANUAL + COMMUNITY INFERENCE (all agree). HIGH. No conflict.

### Q12. Maximum principal cast sizes
**Hard cap: 3 principal/lead acting roles (Lead + Supporting 1 + Supporting 2) plus 1 director, for every script source and every era; minimum 1 director + 1 actor.** This is the most rigorously verified claim in the file — **independently confirmed this pass at three separate locators**: manual "There are three mannequins representing the three possible lead roles in your movie" (`:595-610`, verbatim); Prima Basic-tier "one lead role, no more than one extra" (`:1080-1095`, verbatim); Prima First-Class-tier "two or three lead roles, three to five extras" (`:1150-1160`, verbatim). Extras fill all non-lead slots; up to 5 distinct non-lead uses count toward script quality; a Star placed in a non-lead slot gets no lead-role benefit.
Web could **not** establish a per-movie number from any preview or review — the only web-sourced cast-size figure is a *studio-wide* practical roster ceiling ("wouldn't want to hire more than 12 stars," IGN review, phrased as a management-burden observation, not a stated engine limit), which answers a different question (total contracted stars) than the per-film principal-role cap.
— *Tier/Confidence:* DEVELOPER-REVIEWED PRIMA + OFFICIAL MANUAL, **VERY HIGH** (directly verified, exact quotes, three independent locators). Studio-wide roster figure = CONTEMPORARY PROFESSIONAL SOURCE, HIGH as a reviewer observation, MEDIUM as a hard cap.
— *Reader conflict:* None — the two figures answer different questions; 01b correctly declined to guess a per-film number and deferred to the corpus, which the corpus in fact supplies solidly.

### Q13. Did cast-size capability change over time?
**Yes, indirectly, and never above the fixed 3-lead cap.** Script Office tier (Basic → Intermediate → Proficient → First-Class, unlocked by date/starter-tech/awards) determined how many lead roles AI-written scripts *called for*, per the Q12 table. The Custom Scriptwriting Office (unlocked via the Wannabe Big Cheese award or 1960) allowed up to 3 leads from construction, capped by the site's best conventional office; its cost is genuinely inconsistent within Prima itself — **$11,111** at the standard facility spec-sheet entry (`:863`, verified this pass, matching the format of every other facility listing) versus **$35,000** in body-copy prose (`:6251`, also verified present this pass) — a real, unresolved internal-Prima conflict, not a reader error; report both figures with the conflict flagged rather than picking one. **No era, research pack, or award ever raised the 3-lead cap.**
Web independently corroborates the "no era-gated principal-slot expansion" half of this and adds a genuinely useful nuance: the one thing that *did* expand cast capability over the product's life was *Stunts & Effects* adding an entirely **new personnel category** (stuntmen) — a new role type, not more lead slots. This is a closer structural precedent for P17 direction T/U (new role *tiers* — Featured/Cameo — rather than more *lead* slots) than either reader stated outright.
— *Tier/Confidence:* DEVELOPER-REVIEWED PRIMA + OFFICIAL MANUAL, HIGH (tier-gating, cap-never-raised); the S&E new-role-category precedent = CONTEMPORARY PROFESSIONAL SOURCE (Activision PR, MobyGames), HIGH.
— *Reader conflict:* None; complementary, and worth foregrounding in the design-implications section below.

### Q14. Could Extras/cameos provide fame or publicity value?
**No — strongly triangulated, no conflict.** Corpus: extras are headcount-only (+0.1★ per distinct non-lead use, max +0.5★); their genre experience "does not feed into the quality of the movie itself" per Prima (a single GameSpot "minor effect" claim is the lone dissent, logged as CONTESTED); extras have zero Star Rating/Press/Image/Star Power; a Star dropped into a non-lead slot gets none of the usual lead-role benefits — the shipped game *discouraged* rather than rewarded the cameo pattern. Web independently corroborates from the opposite direction (contemporary play-experience, not design text): GameSpy and IGN reviews consistently describe extras as plain background-labor NPCs, distinct from "stars," and no web source of any kind — preview, review, wiki, retrospective — describes a formal cameo role class or a famous-non-actor cameo mechanic.
— *Evidence:* Prima `:3312-3330`, `:3585-3597`; manual `:451-453`; GameSpy/IGN reviews (01b cache).
— *Tier/Confidence:* DEVELOPER-REVIEWED PRIMA + OFFICIAL MANUAL + CONTEMPORARY PROFESSIONAL SOURCE, all HIGH, all converging independently. This is the strongest possible confirmation that **P17 owner direction U (famous non-actor cameos) has zero retail precedent** — both readers reach the same conclusion from disjoint evidence bases.

### Q15. Pre-release sequel/franchise promises?
**The local corpus is silent by design (0 hits, confirmed); the web reader supplies the entire answer, and it is rich.** Consolidated, tier-labeled, and cross-checked this pass:
- The in-game "make a sequel" system: promised (GameSpot 2003), demoed as if real (2006 press event per Kotaku), never built (Gary Carr, **verified live this pass**). PRE-RELEASE PROMISE, confirmed not shipped, HIGH.
- Full-fidelity remakes ("even Star Wars," cast pinned to career stage): promised (Eurogamer 2003), no shipped feature matches it. PRE-RELEASE PROMISE, likely not shipped as described, MEDIUM-HIGH (cache-only this pass).
- Console versions (Xbox/PS2/GameCube): promised repeatedly 2003–2005, including in the *official* Movies Online FAQ, then formally cancelled per Activision's Feb 2006 earnings call (IGN) and reconfirmed by a **live-verified** 2025 retrospective this pass ("the ports were quietly canceled"). PRE-RELEASE PROMISE → confirmed cancelled, **VERY HIGH** (5+ independent sources, one live-reconfirmed this pass).
- "Director's Cut" add-on pack and hypothetical movie tie-in packs (e.g., a Terminator 3 pack): promised, never shipped; only *Stunts & Effects* ever shipped as an official add-on (**Wikipedia, verified live this pass, confirms exactly one expansion**). HIGH.
- Online console movie-sharing: floated as "tentative" pre-release, mooted once consoles were cancelled. HIGH it never shipped.
— *Tier/Confidence:* All PRE-RELEASE PROMISE, cross-checked against CONTEMPORARY PROFESSIONAL SOURCE for shipped/not-shipped status. Never promoted to shipped-retail tier, per the source-discipline rule.
— *Reader conflict:* None; this question exists specifically because 01a's scope excluded it.

---

## 2.3 Design implications for P17 (DESIGN INFERENCE, clearly separated from the evidence above)

- The original offers **no shipped template** for any P17 continuation type (Q1–Q8, Q11) — P17 is net-new design, and the report should not cite the original as retail precedent for any continuation rule.
- The original **did** ship three separable "fatigue" primitives the owner direction (item C) wants to keep distinct: market-level genre oversupply (→ P15), per-set novelty (asset-level decay + recovery-with-disuse), and per-actor novelty (person-level, subtract-only). Direction C's Fatigue factor has a real, verified shipped analogue in actor/set Novelty — but the original applied it uniformly per film, never per-franchise, and it could only subtract, never add.
- The original's only "hit begets hit" loop ran through Star Rating recency (⅓ per film, decaying) — a person-level Momentum analogue, not a property-level one. Direction F (franchise-importance-weighted talent continuity) has no precedent; the closest the original gets is rank-within-film weighting for Star Power.
- Cast slots: the verified hard cap of 3 principals + director, scaling only with script-office tier and never with era, is the strongest, most directly-confirmed number in this reconstruction. Direction T's era-expanding *optional* slots have no direct shipped precedent as "more lead slots," but the *Stunts & Effects* precedent of adding a wholly new personnel category (stuntmen) partway through the product's life is a closer structural match to "new role tier appears later" than either reader initially framed it.
- Cameos: the original actively discouraged the pattern (Star benefits withheld in non-lead slots, extras carry zero fame value) and no famous-non-actor class ever existed. Direction U is unprecedented in retail but is not contradicted by anything shipped — it is simply new ground.
- The single highest-value historical lesson from this file is **not** a shipped mechanic but a failure mode: Lionhead's own designer proposed almost exactly P17's timing/comparison-to-original sequel logic, it was killed for engineering scope, and the resulting over-promise became a public embarrassment. This is a strong argument for P17 to be built as a bounded, actually-shippable model (which the owner directions already require) rather than an open-ended "compare to the original" black box.

---

## 2.4 Claims flagged as weakly sourced or UNSOURCED

No claim in either reader's file was found asserted as fact with **no** source at all — both readers were disciplined about labeling gaps as gaps rather than filling them. The following are flagged as **weak/single-source** rather than unsourced, and should be treated with reduced confidence in the final report:
- The Custom Scriptwriting Office's true cost ($11,111 vs $35,000) — a genuine internal Prima conflict, not resolvable from the corpus alone (§2.0 item 7). **Report both figures with the conflict noted; do not silently pick one.**
- "Genre popularity computed at release, not scripting" (01a, Q10) — rests on a single reconciled-facts-appendix row plus an unquoted GameSpot reference; MEDIUM confidence at best, COMMUNITY INFERENCE.
- Extras' genre experience "does not feed into movie quality" — CONTESTED 2-vs-1 against a single GameSpot "minor effect" claim (`original_formulas.json:414-432`); report the majority position with the dissent noted.
- All *Stunts & Effects* mechanic claims (recast-reset, ~15 new sets) rest on the Bible's search-synthesised sections only — **no primary S&E document exists in either corpus**; this is an acknowledged absence-of-primary-evidence gap in both readers, not a fabricated claim, but the report should not cite S&E mechanics above COMMUNITY INFERENCE confidence.
- The DCMF/"Director's Cut" community-modding name-lineage claim (01b) is explicitly self-flagged LOW confidence and inferred, not confirmed — retain that caveat verbatim if cited.
- The Kotaku article's own internal date inconsistency (places the Gary Carr demo in "2006, as the team prepared to release The Movies," when the base game shipped Nov 2005) is a genuine unresolved wrinkle in the source itself, not a reader error; it does not weaken the core finding (no sequel system ever existed) but the exact event/product context (base game vs. S&E press push) remains uncertain.

## 2.5 Open gaps carried forward (neither reader could close these)

1. No primary *Stunts & Effects* document exists locally or was found on the open web in this pass — all S&E mechanic detail is COMMUNITY INFERENCE.
2. Exact per-rank Star Power weighting formula, and the exact Movie Quality : Success ratio in Final Movie Rating — not stated anywhere in either corpus.
3. Whether standard-pipeline (non-AMM) scripts had renamable/generated titles — the word "rename" appears nowhere in the corpus; absence is suggestive but not proof given no clean vanilla game data exists.
4. Reddit r/TheMovies community sentiment on sequels/franchise — both cached fetch attempts returned empty JS shells; unresolved, not "nothing exists."
5. TV Tropes page — Cloudflare-blocked in every attempt, unexplored.
6. Whether a released film could actually lose money (relevant to owner direction E, "bad bets allowed") — unresolved in the corpus.
7. 8eyedbaby/TheMovies3D file-format documentation (whether the shipped save/script format has an explicit sequel/franchise field at the data level) — not directly browsed in either pass.
