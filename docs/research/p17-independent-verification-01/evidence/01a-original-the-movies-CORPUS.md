# 01a — What retail *The Movies* (2005) and *Stunts & Effects* (2006) actually did with sequels and related concepts (LOCAL CORPUS ONLY)

Read-only evidence pass, 2026-09-11. No repo, branch, build, test, or runtime was touched. Web research was NOT used for this file (task scope = local corpus only).

**Re-verification pass, 2026-09-12 (second run; the first run was cut off after writing this file).** Every grep count in §0.1 was re-run and reproduced exactly; every Prima, manual, GameFAQs, Bible, ORIGINAL-DATA and TECHNICAL-ARTIFACTS locator cited below was re-opened and checked against the source text. One locator drift was found and corrected (the "Novelty ... can only lower a film's Success rating" sentence is at Prima `:3638-3640`, not `:3625-3626`); two tier-table line ranges were tightened by one line (Basic `:1087-1088`, First-Class `:1154-1156`); three AMM p.99-100 locators were re-pointed to the exact lines (`:6329-6331`, `:6343-6360`, `:6362-6364`, `:6365-6369`); five more Prima locators were re-pointed after a phrase check of every cited range (`:3371-3372` scene repetition, `:3546-3552` actor/director double weight, `:3574-3578` Success→Star ratings, `:6246-6255` + `:881-884` + `:1161-1163` Custom Scriptwriting Office); the Custom Scriptwriting Office cost is now given as $11,111 with the Prima-internal $35,000 conflict noted. Findings added in this pass are marked **[added 09-12]**. The previous run's file is preserved as `01a-original-the-movies-CORPUS.md.bak-prev-run`.

## 0. Corpus, method, and locator conventions

**Corpus read** (all read-only):

| Tier label used below | File | Notes |
|---|---|---|
| OFFICIAL MANUAL | `/private/tmp/claude-501/-Users-bruce/3f469c9d-8c5a-4e57-b351-5828c7e97a45/scratchpad/corpus/movies_manual_english.txt` (extraction of `/Users/bruce/Desktop/Big Swing Art/movies manual_english.pdf`) | Page markers in the text read `The_Movies_FINAL2.qxp ... Page N` and mark the START of page N. Line→page map: 2:p2 52:p4 105:p6 152:p8 214:p10 265:p12 320:p14 389:p16 436:p18 481:p20 536:p22 589:p24 646:p26 702:p28 757:p30 813:p32 865:p34 918:p36 958:p38 1012:p40. Only even pages are marked; the odd page is the second half of each span. |
| DEVELOPER-REVIEWED PRIMA | `.../scratchpad/corpus/The_Movies_Prima_Official_eGuide.txt` (extraction of `The_Movies_Prima_Official_eGuide.pdf`) | Page numbers are FOOTERS (end of page). Even footers on their own line (e.g. `3271: 52`), odd footers right-aligned inline (e.g. `3338: 53`). Footer map used: 8@342 9@418 10@482 11@556 12@634 17@987 18@1054 19@1116 20@1193 21@1262 22@1333 40@2436 41@2507 42@2573 43@2645 44@2725 45@2789 46@2860 47@2929 52@3271 53@3338 54@3396 55@3457 56@3528 57@3600 58@3673 59@3735 60@3805 73@4684 74@4752 75@4815 76@4876 77@4945 78@5020 96@6193 98@6271 99@6337 100@6404. |
| COMMUNITY INFERENCE | `.../corpus/The_Movies_-_FAQ_-_PC_-_By_Maxx_-_GameFAQs.txt` (GameFAQs 45308) | contemporary player FAQ |
| COMMUNITY INFERENCE | `.../corpus/The_Movies_-_Guide_and_Walkthrough_-_PC_-_By_Mark_E_1990_-_GameFAQs.txt` (GameFAQs 41120) | contemporary player guide |
| CONTEMPORARY PROFESSIONAL / COMMUNITY | `.../corpus/The_Movies__Improving_the_Studio_-_gamepressure.com.txt` | only the "Improving the Studio" (Studio Rating) page; 112 lines |
| SECONDARY (community/AI synthesis) | `/Users/bruce/Desktop/Big Swing Art/THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md` | cited only where it adds a claim the primaries do not, and labelled COMMUNITY INFERENCE |
| Structured data (derived from Prima, i.e. DEVELOPER-REVIEWED PRIMA unless a row says otherwise) | `/Users/bruce/Desktop/Big Swing Art/THE-MOVIES-2005-ORIGINAL-DATA/{star_rating_components.csv, movie_rating_pipeline.json, original_formulas.json, all_reconciled_facts_appendix.csv, ACTIVE-UNRESOLVED-QUESTIONS.csv, source_conflicts.csv}` | |
| Technical artifacts (mod .ini schema, engine data — NOT clean vanilla) | `/Users/bruce/Desktop/Big Swing Art/THE-MOVIES-2005-TECHNICAL-ARTIFACTS/{schema_fields.csv, dormant_or_unconfirmed_fields.csv, candidate_vanilla_values.csv, set_definition_schema.csv, social_relationship_schema.csv, vanilla_diff_backlog.csv}` | |

**Important corpus limitation:** the Prima eGuide and the manual are BASE GAME (2005) documents. Nothing in the local corpus is a primary *Stunts & Effects* document; the only S&E material is the Bible's §34/§6.7/§10.17 (search-synthesised, PLAYER DOCUMENTED) and one GameFAQs S&E-context cross-reference. Every S&E claim below is therefore COMMUNITY INFERENCE at best.

### 0.1 The zero-hit confirmation (exact commands and results)

Run from `/private/tmp/claude-501/-Users-bruce/3f469c9d-8c5a-4e57-b351-5828c7e97a45/scratchpad/corpus/`:

```
for f in *.txt; do echo "== $f"; grep -c -i -E 'sequel|franchise|prequel|remake' "$f"; done
== movies_manual_english.txt                                                    0
== The_Movies__Improving_the_Studio_-_gamepressure.com.txt                      0
== The_Movies_-_FAQ_-_PC_-_By_Maxx_-_GameFAQs.txt                               0
== The_Movies_-_Guide_and_Walkthrough_-_PC_-_By_Mark_E_1990_-_GameFAQs.txt      0
== The_Movies_Prima_Official_eGuide.txt                                         0
```
Additional per-file counts (same loop, separate patterns): `reboot` = 0 in all five; `spin-?off` = 0 in all five; `cameo` = 0 in all five; `\bseries\b` = manual 0 / Maxx 0 / Mark_E 1 / Prima 1 / gamepressure 0; `\bPart (II|III|IV|2|3|4)\b` = Prima 1, all others 0; `\b(II|III)\b` = manual 3, Maxx 4, Mark_E 1, Prima 2.

Every non-zero adjacent hit was inspected and is NOT a game mechanic:
- Prima:3661 "after a rival studio churns out a **series** in that genre" = genre-saturation sentence (a run of same-genre releases), not a film series/franchise. (Quoted in §10 below.)
- Prima:63 "Part 2: Real-World Filmmaking" = book section title.
- Prima:6098/6105 "World War II" props; manual:1156/1197/1199 "Pentium III", credits names; Maxx:30/31/59/91 "II. Introduction / III. Controls" = FAQ section numerals; Mark_E:397 "Pentium III"; Mark_E:1062 "the James Bond **series**" = real-world example in a genre description (line 1060-1062), not a mechanic.

Run from `/Users/bruce/Desktop/Big Swing Art/`:
```
grep -c -i -E 'sequel|franchise|prequel|remake|reboot|spin-?off' <file>
THE-MOVIES-2005-ORIGINAL-DATA/all_reconciled_facts_appendix.csv    0
THE-MOVIES-2005-ORIGINAL-DATA/ACTIVE-UNRESOLVED-QUESTIONS.csv       0
THE-MOVIES-2005-ORIGINAL-DATA/source_conflicts.csv                  0
THE-MOVIES-2005-TECHNICAL-ARTIFACTS/*.csv and README.md             0 (all 14 files)
THE-MOVIES-2005-SOURCE-REGISTER.md                                  0
THE-MOVIES-2005-TECHNICAL-ARTIFACT-REGISTER.md                      0
PROJECT-STUDIO-COMPARATIVE-DESIGN-REGISTER.md                       0
RECONCILIATION-CHANGELOG.md                                         0
THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md                         2
```
The two Bible hits: line 1867 "the closest the **franchise** gets to physical training" (= *The Movies* as a product line) and line 3605 "ahead of a literal **remake**" (= Project: Studio remaking the original game). Neither describes an in-game sequel/remake mechanic.

> Source: the commands above; what it proves: the words sequel/franchise/prequel/remake/reboot/spin-off/cameo do not occur as game concepts anywhere in the local corpus (manual, Prima, both GameFAQs, gamepressure, Bible, all structured data); confidence HIGH; tier: OFFICIAL MANUAL + DEVELOPER-REVIEWED PRIMA + COMMUNITY INFERENCE (absence corroborated across all tiers).


### 0.2 Adjacent-concept sweeps **[added 09-12]**

**`\btitles?\b` (case-insensitive) per file:** manual 3 / gamepressure 0 / Maxx 0 / Mark_E 0 / Prima 11. Every hit inspected; none is a title-based game effect:
- Prima `:243` "Reject room (usually the same room as Fire but with a different **title**)" = UI room label; `:2536` "crew and extras will show the movie's **title** on their Staff cards" = display only; `:6278-6281` Movie Title / dice button (quoted in Q11); `:6287` genre "impacts ... randomly generated **titles**"; `:7567-7569` AMM scene-search by keyword in a SCENE's title; `:7635` Post Production "Change a movie's **title** sequence"; `:8003-8006` "receive a **title**: Greenhorn ..." = The Movies Online uploader RANK titles (Greenhorn etc.), not a film title mechanic.
- manual `:685`, `:725` Post Production "Change Titles Style"; `:1153` "Complete product title" = tech-support boilerplate.
> Source: the sweep above; what it proves: no text anywhere in the corpus attaches any effect (recognition, awareness, box office, rating) to a film's title or to reuse of a title; confidence HIGH (absence across all tiers); tier: OFFICIAL MANUAL + DEVELOPER-REVIEWED PRIMA + COMMUNITY INFERENCE.

**`same (faces|scenery|actors|stars|set)|over ?used|overexpos|see (him|her|them) again`:** Prima hits only — `:1302` (Attractiveness ornament "overused very quickly"), `:3633` ("If a set's been overused, its novelty value will ..."), `:3652-3653` (set novelty "shared by every copy of the same set on your lot ... persists even if you tear down an overused set"), `:5005` (Brainwasher "Public boredom with overused sets and actors is cut by half"), `:3612-3619` ("same scenery and faces"), `:3694-3696` ("less interested in seeing him or her again"). All are the Novelty mechanic already covered in Q9(c)/Q10. Manual hits (`:330`, `:895-898`) concern a STAR's own boredom threshold (Mood), not audience boredom.

**`novelty` per file:** manual **0** / gamepressure 0 / Maxx 47 / Mark_E 3 / Prima 28. **Tier consequence:** the audience set-/actor-novelty ("fatigue") mechanic is DEVELOPER-REVIEWED PRIMA corroborated by COMMUNITY (GameFAQs) and by the engine `boredom` field, but is NOT mentioned in the OFFICIAL MANUAL. The manual DOES corroborate genre-interest drift over time (`:96` "changes in public taste"; `:986` "events ... impact on the popularity of movie genres"; `:1009` "their tastes change over time"). Manual `:375` "current genre popularity" is about what is FASHIONABLE for Star costumes, not about box office.

**`THE-MOVIES-2005-TECHNICAL-ARTIFACTS/dormant_or_unconfirmed_fields.csv` (7 rows, TECH-DORMANT-001..007):** the only dormant/unconfirmed engine hooks found in the mod-derived `global.ini`/facility files are a debug "Cinema" facility, an empty `[social]` header, `[karma] AweModifier=0.4`, a `[smoking]` craving block, a `[animal] pooch_*` (dog) lifespan block, `[star] promiscuity_*` + cross-gender cosmetic penalties, and the `gatehouse`="Staff Office" identity question. **No dormant field relates to sequels, franchises, titles, story properties, or cast-slot counts.**
> Source: `dormant_or_unconfirmed_fields.csv:2-8`; grep -c for sequel|franchise|prequel|remake|reboot|spin-off = 0 (§0.1); what it proves: even the unexplained engine hooks give no hint of a dormant continuation system; confidence MEDIUM (mod-derived, not clean vanilla — `vanilla_diff_backlog.csv:2`); tier: technical artifact (COMMUNITY INFERENCE-grade provenance).

**Stunts & Effects scope check (Bible only):** the Bible's S&E sections (`:438`, `:648` Table 4, `:768` ~15 new sets, `:1012-1014` §6.7 recast reset, `:1073` §7.4, `:1405` §10.17, `:1636`, `:1865` physical training, `:2954-3005`) describe a Stuntman role/skill/injury system, new effects sets, a mid-production recast reset, and physical training. None describes sequels, franchises, cast-slot expansion, cameos, or title effects.
> Source: `THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md` section headers listed; confidence MEDIUM (secondary synthesis of reviews/Wikipedia, PLAYER DOCUMENTED); tier: COMMUNITY INFERENCE.

---

## 1. Headline

Retail *The Movies* (2005) had **no sequel, prequel, remake, reboot, spin-off, franchise, or cameo mechanic of any kind**; films were independent, one-shot objects whose only "memory" effects were (a) per-Star rolling recency (Movie Success and Performances factors of Star Rating), (b) per-set and per-actor **Novelty** (audience boredom with reused sets and reused faces), and (c) studio-wide **Genre Interest** (time-driven news events plus industry-wide same-genre oversupply). The corpus contains no evidence that *Stunts & Effects* (2006) added any continuation concept either.

---

## 2. The fifteen questions

### Q1. Did sequels exist as a shipped mechanic?
**No.** Zero occurrences of sequel/franchise/prequel/remake/reboot/spin-off in the manual, Prima, both GameFAQs guides, gamepressure, the Bible, and all structured data (§0.1). The Prima release chapter enumerates every consequence of releasing a film (earns money; impacts studio rating; impacts Star ratings; crew/writer/genre experience; added to Movie Charts) with nothing connecting one film to another.
> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:2690-2710` (p.44 "Upon release ... its myriad effects ... are activated: Earns money ... Directly impacts studio rating ... Directly impacts the rating of each Star ... Increases the crew experience ... Increases scriptwriter experience ... Increases the genre experience of any Stars or extras ... Adds the movie to the Movie Charts"); what it proves: the complete developer-reviewed list of post-release effects has no inter-film linkage; confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA (absence). Corroborated by the manual's own release text (`movies_manual_english.txt:272-283`, p.12) which likewise lists only cost/Star-impact release screens; tier: OFFICIAL MANUAL.

> Source: `THE-MOVIES-2005-ORIGINAL-DATA/movie_rating_pipeline.json:5-161` (five-stage pipeline Script Quality → Production Quality → Movie Quality → Success → Final Movie Rating) and `all_reconciled_facts_appendix.csv` (0 hits); what it proves: the reconstructed rating pipeline has no predecessor-film input; confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA (as encoded in the data set).

Archiving confirms films are terminal objects: "once a movie is archived, it can't be brought back."
> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:2757-2762` (p.45 Step 6 Archiving); what it proves: no post-release re-use of a film object; confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA.

### Q2. Did sequel performance depend on the original?
**Not applicable — no sequels.** The only "prior film → later film" carry-over in the whole corpus is per-STAR, not per-film: each Star's rating carries a decaying memory of the Success and Performance ratings of their recent films, and that Star Rating then feeds the next film's Star Power. There is no film-to-film inheritance.
> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:4712-4751` (p.74 "Movie Success 18% ... For every movie in which the Star had a non-extra role, the movie's Success rating can contribute up to one-third ... Each movie's contribution to this score fades over time"; "Performances 14% ... Each movie can boost this rating by no more than one-third ... decays over time"); what it proves: the game's only inter-film memory is a rolling per-Star recency window; confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA. Encoded in `star_rating_components.csv:2,4`.

### Q3. Did sequel timing matter?
**Not applicable.** The only release-timing mechanics are (i) hold a finished film until its genre's interest rises or until just before a quinquennial awards ceremony, and (ii) news events that boost/depress a genre on a known future date.
> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:2655-2664` (p.44 TIP: "There are several strategic reasons to hold on to finished films ... if the public's interest in a film's genre is at low ebb, it may pay to delay the release until interest rises again. Likewise, several award strategies are based on releasing major films just before the quinquennial award ceremony"); what it proves: timing mattered only for genre-interest and awards, not for continuity; confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA.
> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:3634-3645` (p.58 "future news stories crop up on the timeline ... first appear when they're five years away, and they specify which genres will be affected ... release it just after the news event, it'll perform much better"); confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA. Manual corroborates the timeline's "changes in public taste" (`movies_manual_english.txt:93-97`, p.5; `:985-986`, p.39); tier: OFFICIAL MANUAL.

### Q4. Was franchise recognition persistent?
**No franchise object existed, so nothing persisted.** The nearest persistent "recognition" concepts are all person- or studio-scoped: Star Rating and Star Chart position (Star), Studio Rating/Charts (studio), Public Awareness (per film/script, discarded on release), Press points (per Star, decaying 1 point per 1.5 months).
> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:4851-4853` (p.76 "Press score decays very quickly over time (one point per 1.5 months)"); `:2607-2617` (p.43 public awareness is per-script/film, lost if star rating drops); what it proves: the game's awareness/recognition state is short-lived and never attached to a property or title; confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA.
> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:2836-2846` (p.46 Studio Rating "Movies 24% ... isn't enough in a town with a staggeringly short memory; you have to keep the hits coming. The impact of individual movies decays over time"); what it proves: even studio-level film memory decays; confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA.

### Q5. Remakes supported? — **No** (§0.1; 0 hits). The only "re-do" is the community-documented reshoot workaround (drag a finished film backward through Custom Script Office → Casting → Shoot It), which is a re-shoot of the SAME film, not a remake.
> Source: `ACTIVE-UNRESOLVED-QUESTIONS.csv:67` (Q066 "the reshoot workaround ... and the absence of a dedicated in-game Reshoot command, are confirmed"); confidence MEDIUM; tier: COMMUNITY INFERENCE.

### Q6. Prequels? — **No** (0 hits, §0.1). Tier: absence across OFFICIAL MANUAL / DEVELOPER-REVIEWED PRIMA / COMMUNITY INFERENCE.

### Q7. Spin-offs? — **No** (0 hits for spin-off/spinoff, §0.1). No persistent characters exist to spin off: AMM character names are "randomly generated based on gender and genre but can be overridden" per film, and never referenced again.
> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:6362-6364` (p.100 "Character names are randomly generated based on gender and genre but can be overridden"); what it proves: characters are per-film labels, not persistent entities; confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA.

### Q8. Reboots? — **No** (0 hits, §0.1). No StoryProperty, continuity, or rights object exists anywhere in the corpus. The only "rights"-adjacent mechanic is selling a finished SCRIPT (or a Star) to rival studios for cash via the Star & Script Selling Facility.
> Source: manual; `movies_manual_english.txt:428-430` (p.17 "Star and Script selling – Sometimes you might want to sell off Stars or scripts to rival studios to make some quick money"); Prima `:1168-1190` (p.20 facility entry; market value of a Star by age and rating); what it proves: scripts could change hands as one-shot assets, with no continuing ownership or attribution model; confidence HIGH; tier: OFFICIAL MANUAL + DEVELOPER-REVIEWED PRIMA.

### Q9. Could Stars/cast recur across connected movies with MECHANICAL benefits?
There were no "connected movies", but re-using the same people across ANY movies had these mechanical effects (all per-person, none per-property):

**(a) Genre experience — positive, cumulative.** Every appearance in a genre raises the Star's (and even the extra's) experience in that genre; experience is a sub-factor of Star Performance, which feeds Production Quality.
> Source: manual; `movies_manual_english.txt:311-313` (p.13 "by casting an actor in multiple horror movies, you can increase their skill in that genre"); `:333-336` (p.14 "The more experience in a genre, the better their performance will be in any movie of that genre"); tier: OFFICIAL MANUAL; confidence HIGH.
> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:3405-3411` (p.55 Star Performances = Mood + Experience + Genre Fit); `:3471-3487` (p.56 genre experience built by making movies in the genre and practicing); `:2702` (p.44 release "Increases the genre experience of any Stars or extras who appeared in it"); tier: DEVELOPER-REVIEWED PRIMA; confidence HIGH.
> Encoded: `movie_rating_pipeline.json:80-97` (Production Quality components). Award bonus Quick Learner = 110% experience rate (`Prima:5010-5011`, p.78).

**(b) Chemistry/relationships — positive, cumulative, decaying toward baseline.** Average relationship between all Stars on set feeds Production Quality; actor–director relationships count double; relationships build during REHEARSE/FILM/CASTING contexts per engine schema.
> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:3546-3552` (p.57 "The average of all relationships between Stars affects production quality ... actor/director relationships count double"); tier: DEVELOPER-REVIEWED PRIMA; confidence HIGH. Manual `:339-341` (p.14 "They make better movies if their on-screen chemistry is good"); tier: OFFICIAL MANUAL.
> Source: `THE-MOVIES-2005-TECHNICAL-ARTIFACTS/social_relationship_schema.csv:5` (TECH-SOC-004 "REHEARSE, FILM, CASTING — Relationships also build during rehearsal, filming, and casting itself"); what it proves: working together repeatedly compounds relationship (and therefore chemistry) organically; confidence HIGH for schema existence, values not vanilla; tier: technical artifact (engine schema), treat as SHIPPED RETAIL-adjacent but not value-confirmed.
> Decay: `original_formulas.json:219-223` ("Untended relationships drift TOWARD the 45-55% baseline"); tier: DEVELOPER-REVIEWED PRIMA.

**(c) Actor Novelty — NEGATIVE, cumulative, recovering with rest.** Re-using the same faces lowers a film's Success ("the audience becomes less interested in seeing him or her again"). This is the direct counter-force to cast continuity and the closest thing to "franchise fatigue" that shipped.
> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:3693-3699` (p.59 "Novelty is, however, about more than just scenery; it's also about your actors. Every time an actor appears in a movie, the audience becomes less interested in seeing him or her again. Over time, this can reduce the novelty and, thus, success of your movies. Avoid boring the public with your actors by keeping them in constant rotation and giving them breaks"); what it proves: a shipped, developer-reviewed, per-actor audience-boredom penalty on Success; confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA.
> Corroboration: Prima `:3612-3619` (p.58 "how bored the audience is with your sets and Stars. The more they see the same scenery and faces in your films, the less you'll take in at the till and the lower your movies' final ratings"); Prima `:3638-3640` (p.58 "Novelty (that is, the lack of it) can only lower a film's Success rating; it can't increase it"); Mark_E GameFAQs `:1374-1376` ("Novelty Value - This takes into account the novelty rating of both your stars and sets ... by not using certain stars and sets from time to time"); tier: COMMUNITY INFERENCE corroborating PRIMA. Award bonus Brainwasher halves "public boredom with overused sets and actors" (Prima `:5005-5006`, p.78; `:4539-4541`, p.71).
> NOTE: the Bible does not reproduce the actor-novelty sentence explicitly (its §8.2 table covers set novelty only); `movie_rating_pipeline.json:139` does record "repeated actor appearances". Treat the Prima text as controlling.

**(d) Image / fame** — a Star's Image (Looks+Physique+Fashion) is 10% of Star Rating and is independent of what films they made; there is no "franchise image" or role-association concept. (§3 below.)

**(e) Awards to persons persist as bonuses**: Midas Touch (Best Direction) and Super Star (Best Acting) raise the Final Movie Rating of every subsequent movie by that director/actor for five years.
> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:3426-3430` (p.55) and `:5007-5016` (p.78 "Midas Touch: increases the Final Movie Rating of any movie helmed by the award-winning director"; "Super Star: increases the Final Movie Rating of any movie featuring the award-winning actor"); what it proves: person-attached, time-boxed carry-over bonuses existed; confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA.

**(f) Recasting mid-production (S&E only, community):** changing actors/director after shooting begins restarts the shoot; swapping crew/extras does not.
> Source: Bible `THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md:1012-1014` (§6.7); `ACTIVE-UNRESOLVED-QUESTIONS.csv:53` (Q052, base-game behaviour unknown); confidence LOW-MEDIUM; tier: COMMUNITY INFERENCE.

### Q10. Did repeated movies produce audience fatigue?
**Yes, three distinct shipped fatigue-like mechanics — none keyed to a title, story, or franchise:**

1. **Genre Interest (time + saturation).** Interest per genre waxes/wanes with dated news events and is driven DOWN by the number of same-genre releases by ALL studios (including rivals); rivals have per-studio propensities to release in the currently most popular genre (25–75%).
> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:3601-3622` (p.58 "Genre interest is ruled by two factors: time and saturation"); `:3655-3662` (p.58 "The more movies all studios, including yours, release in a genre, the more tired of the genre the public will get and the more genre interest plummets. Oversaturate the market or release a movie after a rival studio churns out a series in that genre and you may find yourself with a brilliant but underperforming dud"); `:3163-3232` (p.51 rival table, "Releasing Movie in Most Popular Genre" 25/30/18/40/50/60/70/75/75); what it proves: a shipped market-level oversupply penalty; confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA.
> Manual: `movies_manual_english.txt:1007-1009` (p.39 right-click script office to see audience genre feelings; "their tastes change over time"); tier: OFFICIAL MANUAL. Community: Maxx `:2372` ("don't want to over-saturate the market with the same kind of movies"), Mark_E `:1369-1372`; tier: COMMUNITY INFERENCE. Bonus: Trend Setter "doubles genre interest in every genre for all your studio's films" (Prima `:4973-4978`, p.78).
> Timing nuance (community, single source): genre popularity is computed at RELEASE, not at scripting (`all_reconciled_facts_appendix.csv:26,144`; GameSpot); confidence MEDIUM; tier: COMMUNITY INFERENCE.

2. **Set Novelty (per-set "Boredom Factor").** Every scene shot on a set lowers that set's novelty by its Boredom Factor; novelty is shared by all copies of a set type on the lot, survives demolition/rebuild, and refreshes only with disuse. Novelty "can only lower a film's Success rating; it can't increase it."
> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:3623-3672` (p.58) and `:1280-1310` (p.22 Boredom Factor definition: "how much the novelty of your sets declines for every scene in which the set is used ... sets' novelty refreshes with disuse"); `:6365-6369` (p.100 AMM Choose Sets: "Every time a scene is shot on a set, its novelty decreases, lowering its contribution to the film's success"); confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA.
> Engine corroboration: `set_definition_schema.csv:3` (TECH-SET-002 `boredom` = real 0–1 engine field on set definitions); tier: technical artifact; confidence VERY HIGH for schema existence.
> Community refinement: novelty is LOCKED at production start within one movie (`all_reconciled_facts_appendix.csv:24,84,145`); confidence MEDIUM; tier: COMMUNITY INFERENCE. Set novelty values per set in Maxx `:1008-1336`; tier: COMMUNITY INFERENCE.

3. **Actor Novelty** — see Q9(c). Same Success-stage "Novelty Value" factor, applied to faces.

4. **Script-internal scene repetition** (a script-quality penalty, not audience fatigue): "If a scene is used more than once, every repetition reduces quality by one-half."
> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:3371-3372` (p.54); confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA. Encoded `movie_rating_pipeline.json:69-73`.

**No "script novelty" / story-originality meter is confirmed.** A single gamepressure phrase ("increase novelty value without losing their quality score") is recorded as PLAYER DOCUMENTED and the Bible marks "originality" UNRESOLVED.
> Source: Bible `:1145` (§8.2 "Script novelty (independent of quality)" row, gamepressure "Welcome to the Biz" — that page is NOT in the local corpus txt) and `:852`; `ACTIVE-UNRESOLVED-QUESTIONS.csv:52` (Q051 "Whether reusing the same scenes/genre repeatedly (independent of sets/actors) has its own diminishing-returns penalty is not confirmed either way"); confidence LOW; tier: COMMUNITY INFERENCE.

### Q11. Did franchise-like names / title reuse matter?
**No title-based effect of any kind is documented.** Titles are cosmetic:
- AMM: "Enter your own title or press the dice button for a randomly generated title. The title you get is based partially on the genre you've chosen." The genre "impacts ... randomly generated titles" — titles are an OUTPUT of genre, never an input to anything.
> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:6278-6289` (p.99 Movie Title / Genre); what it proves: player-chosen or random titles with no downstream mechanic; confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA.
- Post Production's "Change Titles Style" changes the on-screen title card only, and Post Production "has no effect on the in-game rating of your movies."
> Source: manual `movies_manual_english.txt:685,725` (p.27); Prima `:6303-6305` (p.99 "Post Production ... has no effect on the in-game rating"); `all_reconciled_facts_appendix.csv:54,110`; confidence HIGH; tier: OFFICIAL MANUAL + DEVELOPER-REVIEWED PRIMA.
- Whether standard-pipeline (non-AMM) scripts received generated titles and could be renamed is an OPEN question in the data set ("the word rename appears nowhere in the corpus").
> Source: `ACTIVE-UNRESOLVED-QUESTIONS.csv:72` (Q071); confidence n/a; tier: COMMUNITY INFERENCE (documented gap).
- No title in any screenshot or text carries a numeral/"Part"/"II" (§0.1 greps). Observed titles in the owner's screenshots are stand-alone ("Wake Up And Die Again", "Atomic Ray Versus The Spidrons Of Doom", "The Baggage Boy" — Bible `:701,1205,2742`; tier: DIRECTLY OBSERVED via Bible, COMMUNITY INFERENCE for interpretation).

### Q12. Maximum principal cast sizes
**Hard cap = 3 lead/principal acting roles per film (Lead + Supporting 1 + Supporting 2) plus 1 director; minimum = 1 director + 1 actor.** Extras fill all non-lead roles; up to 5 distinct non-lead-role uses count toward script quality.

| Script tier | Lead roles | Extras | Crew | Source |
|---|---|---|---|---|
| Basic (1★) | 1 | ≤1 | ~3 | Prima `:1087-1088` (p.19) |
| Intermediate (2★) | 1–2 | ≤1 | 3 | Prima `:1110` (p.19) |
| Proficient (3★) | 2 | 2–3 | 3 | Prima `:1137` (p.20) |
| First-Class (4★) | 2–3 | 3–5 | 3 | Prima `:1154-1156` (p.20) |
| Custom/AMM | up to 3 (red/green/blue mannequins) | white mannequins, up to 5 uses count | — | manual `:598-604` (p.25 "three mannequins representing the three possible lead roles"); Prima `:3298-3310` (p.53 "Each lead role, up to three"), `:3312-3330` (p.53 non-lead roles, "maxes out with five different uses"), `:6329-6331` (p.99 "Each film can have up to three leading roles: the lead player and two supporting parts"), `:6343-6360` (p.100 "Lead (red), Supporting 1 (green), Supporting 2 (blue)") |

> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:2517-2520` (p.42 "manually assign a director and up to three actors to roles in the film"); `:387-390` (p.9 "Every movie must include at least two Stars: one director and one actor"); what it proves: 1–3 principals + director is the shipped envelope for ALL script sources; confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA. Manual `:598-604` (p.25) and `:662-663` (p.26 "one of your three main Stars"); tier: OFFICIAL MANUAL. Community corroboration: Maxx `:564-567` ("one lead actor and two supporting actors, bringing the needed star count up to four"), `:901-933`; Mark_E `:1926-1930` ("It will have three main roles"); tier: COMMUNITY INFERENCE.
> Data: `all_reconciled_facts_appendix.csv:20,77,142`; `movie_rating_pipeline.json:42-52`; `ACTIVE-UNRESOLVED-QUESTIONS.csv:15` (Q014, UI sub-slot naming unconfirmed) and `:16` (Q015, extras/crew cap per shoot undocumented).
> A "Stars cast in non-lead roles don't receive any of the usual benefits of playing a lead role, though they do gain experience" rule means a Star CAN occupy an extra slot (the only shipped "cameo-like" slot) but gets no Star-Rating/Star-Power credit for it. Source: Prima `:3325-3330` (p.53); confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA.
> AMM staffing advice: "at least three Stars and a bullpen of half a dozen to a dozen extras" (Prima `:6217-6221`, p.97); tier: DEVELOPER-REVIEWED PRIMA.

### Q13. Did cast-size capability change over time?
**Yes, indirectly and only up to the fixed cap of 3 leads.** The Script Office tier (Basic 1920 → Intermediate 1928–31 Starter Tech → Proficient on Promising Studio Manager award → First-Class on Highflying Moviemaker award) determined how many lead roles and extras AI-written scripts called for (table in Q12). The Custom Scriptwriting Office (Wannabe Big Cheese award OR 1960; cost $11,111 per Prima p.16 `:863-868`, Maxx `:737-740` and `facility_catalog.csv` — Prima p.97 `:6251` says $35,000, an internal Prima inconsistency logged in `source_conflicts.csv:20,35`) allowed up to 3 leads from the moment it was built, but its script-quality ceiling was capped by the best conventional office on the lot. **No era, research pack, or award ever raised the 3-lead cap.**
> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:2440-2470` (p.41 unlock chain for Intermediate/Proficient/First-Class); `:1085-1160` (pp.19-20 per-tier lead/extra counts); `:6246-6255` (p.97 Custom Scriptwriting Facility unlock); `:1161-1163` (p.20 "You can't produce a custom four-star script without a First-Class Script Office"); `:881-884` (p.16 TIP: same ceiling rule); what it proves: cast size scaled with script tier, capped at 3; confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA. Manual `:407-416` (p.17 "As time goes by, you'll be able to build better offices"); tier: OFFICIAL MANUAL.
> Data: `movie_rating_pipeline.json:10-24` (office ceilings; custom-office ceiling CONTESTED vs a forum 5★ claim). Research packs unlock facilities/sets/technology (`research_timeline.csv`; Prima `:3710-3740`, p.59 Technology as a Success factor) but no source ties research to role counts.
> Owner-selected direction T (era-expanding optional slots) therefore has NO retail precedent; the retail precedent is "script tier → role count, hard cap 3". Tier: DESIGN INFERENCE from the above.

### Q14. Could Extras / cameos provide fame or publicity value?
**No.** Extras were headcount-only:
- Extras add to SCRIPT quality by headcount (1/10 star per distinct non-lead-role use, max 5 uses = +½ star). Their genre experience "does not feed into the quality of the movie itself; no one cares how seasoned the extra playing Cop #2 is" (Prima+IGN) — contested only by a single GameSpot "minor effect" claim.
> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:570-608` (p.12); `:3312-3321` (p.53); `all_reconciled_facts_appendix.csv:25,57,58,111`; `original_formulas.json:414-432` (EXTRAS_GENRE_EXPERIENCE_AFFECTS_QUALITY CONTESTED 2-vs-1); confidence HIGH (headcount) / MEDIUM (experience); tier: DEVELOPER-REVIEWED PRIMA. Manual `:451-453` (p.18 "Extras – These people fill in the non-starring roles ... add depth and believability"); tier: OFFICIAL MANUAL. Maxx `:489-500`; tier: COMMUNITY INFERENCE.
- Extras have NO Star Rating, no Press, no Image, no Star Power contribution: Star Power counts "every star in a movie" and Star Rating's Movie Success/Performances count only "non-extra" roles.
> Source: Prima `:3585-3597` (p.57 Star Power); `:4712-4751` (p.74 "non-extra role"); tier: DEVELOPER-REVIEWED PRIMA; confidence HIGH.
- A famous Star dropped into a non-lead (extra) slot "don't receive any of the usual benefits of playing a lead role" — the shipped game actively DISCOURAGED the cameo pattern rather than rewarding it. (Prima `:3325-3330`, p.53.)
- Publicity value in the shipped game attached only to Stars (PR room, photographers) and to films/scripts (PR room, marketing spend) — never to extras or to non-actor celebrities, which do not exist as a class. (§5 below.)
- Extras are the game's "nobody becomes a star" pipeline: they show genre experience/age/personality so the player can promote one to Star (Prima `:580-600`, p.12; Bible §16 `:1832`).
> Owner direction U (famous non-actors cameoing for publicity) therefore has NO retail precedent; tier: DESIGN INFERENCE.

### Q15. Pre-release sequel/franchise promises?
**Nothing in the local corpus.** No PRE-RELEASE material (previews, interviews, press releases) is in the corpus; the Source Register, Bible, and both registers contain zero sequel/franchise mentions (§0.1). This question can only be answered by web research (out of scope for this file).
> Source: `THE-MOVIES-2005-SOURCE-REGISTER.md` (grep -c = 0); confidence HIGH that the LOCAL corpus is silent; tier: n/a (absence). Flagged as an open gap.

---

## 3. Star "fame" / Image / Star Rating decomposition (the original's fame model)

The original had ONE per-Star public-standing number, **Star Rating (0–5 stars)**, plus a separate **Star Chart position** whose formula is unknown. Star Rating = weighted sum of nine factors; engine weights (from a mod's `global.ini` `[star]` block) match Prima's rounded percentages almost exactly.

| Factor | Prima % | Engine raw | Rule | Decay |
|---|---|---|---|---|
| Movie Success | 18 | 0.174 | up to ⅓ per non-extra-role movie ∝ that film's Success; 3 recent hits ≈ max | fades over time |
| Salary | 14 | 0.139 | linear $0–100k, objective; LAGS actual change (Future Influence) | none |
| Performances | 14 | 0.139 | up to ⅓ per non-extra-role movie ∝ Performance rating | decays |
| Image | 10 | 0.104 | ∝ Image bar (Looks+Physique+Fashion; weakest sub-factor amplified; Fashion strongest) | via aging/surgery/fashion |
| Entourage | 10 | 0.104 | 0–6 PAs | none |
| Trailer | 10 | 0.104 | Trailer Prestige (~⅔ tier + ~⅓ ornaments; OCR "68/38" flagged) | none |
| Press | 10 | 0.102 | 0–12 pts; PR session +6 (or +3 if cast in unreleased film); photos per event table | 1 pt / 1.5 months |
| Relationships | 7 | 0.07 | sum over all Stars, weighted by other Star's rating; enemies hurt | drifts to 45–55% baseline |
| Awards | 7 | 0.07 | awards at MOST RECENT ceremony only; 2 = max | resets each ceremony |

> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:4685-4876` (pp.74-76, "How Stars Are Rated ... nine factors" through Awards 7%); what it proves: the complete shipped fame decomposition; confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA.
> Source: `star_rating_components.csv:2-10` and `original_formulas.json:3-19`; tier: DEVELOPER-REVIEWED PRIMA (encoded). Engine corroboration: `schema_fields.csv:9` (TECH-SCHEMA-008 raw weights 0.174/0.139/0.139/0.104/0.104/0.104/0.102/0.07/0.07) and `candidate_vanilla_values.csv:2` (TECH-VANILLA-001 "EXACT CORROBORATION"); tier: technical artifact, LOW modification risk; confidence VERY HIGH.
> Manual summary of the same: `movies_manual_english.txt:306-310` (p.13 "rating is based on their image, talent, salary, trailer, entourage and the quality and success of the movies they've starred in") and `:314-320` (p.13-14 chart position "based not only on their rating ... but also on their exposure to the media and PR and their relationships"); tier: OFFICIAL MANUAL; confidence HIGH.

**What Star Rating did** (Prima p.74 "Star Rating Impact", `:4685-4700`): governs Star Chart rank; sets the Star's standard for salary/entourage/trailer satisfaction; weights other Stars' Relationship scores; "Affects the success of movies in which they appear as it's factored into 'star power'"; raises Studio Rating (Stars 24%, diminishing per in-studio rank — Prima `:2862-2884`, p.47; `original_formulas.json:35`); earns Lifetime/ceremony awards. Tier: DEVELOPER-REVIEWED PRIMA; confidence HIGH.

**Key design fact for P14/P17:** fame in the original was ENTIRELY a Star attribute with a short memory (recency-weighted, fast-decaying press), never a role/character/franchise association. "Image" was cosmetic (looks/physique/fashion), not reputation. Tier: DESIGN INFERENCE from the above.

**Open lead:** `schema_fields.csv:11` (TECH-SCHEMA-010 `[project] starratingboxoffice=0.73 / starratingquality=0.33 / starratingawards=0.0`, sums to 1.06) plausibly governs how one film's outcome feeds a Star's rating; deliberately NOT mapped by the data set; confidence MEDIUM; tier: technical artifact.

---

## 4. How a Star's popularity affected a movie's rating and box office (Star Power)

Pipeline (Prima pp.52-60; `movie_rating_pipeline.json`): Script Quality → Production Quality → **Movie Quality** (pre-release) → **Success** (at release; "dictates how much money your film will earn") → **Final Movie Rating** (Movie Quality "counts for the most"; numeric ratio UNKNOWN — `ACTIVE-UNRESOLVED-QUESTIONS.csv:66` Q065).

**Success factors (all five, per Prima p.57-59):** Star Power, Genre Interest, Novelty Value, Technology, PR & Marketing.
> Source: Prima `:3585-3742`; `all_reconciled_facts_appendix.csv:109`; Bible `:2240`; Mark_E `:1366-1384`. NOTE: `movie_rating_pipeline.json:137-141` lists only THREE Success components (Genre Interest, Novelty, PR & Marketing) and OMITS Star Power and Technology — a gap in that JSON; the Prima text and the Bible/appendix are correct. Confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA.

**Star Power rule:** "Star power represents the total Star ratings of every star in a movie. The larger the cast and the higher rated the Stars, the more star power a movie boasts ... The highest-rated Star in a film will have the largest proportion of his or her Star rating count toward star power, and each subsequently rated Star contributes a lower percentage."
> Source: Prima; `The_Movies_Prima_Official_eGuide.txt:3585-3597` (p.57); what it proves: box-office draw = rank-weighted, diminishing sum of cast Star Ratings (directors included per p.9 "collective Star power"), cast size matters, weights are NOT per-role-type but per-rank-within-film; confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA. Prima p.9 `:365-373` ("The more high-level Stars a movie features, the more successful it will be ... dropping three top 10 Stars in one movie ... will likely result in a successful movie but at the cost of the constant income stream"); tier: DEVELOPER-REVIEWED PRIMA. Community: Mark_E `:1366-1367` ("If more famous stars are in your movie the higher the final movie rating will be"); tier: COMMUNITY INFERENCE.
> Exact weights per rank are NOT given anywhere in the corpus (open gap).

**Money:** "The amount of money a film earns is based entirely on its Success rating ... Films stay 'in release' for a fixed amount of time until they cease earning"; correct PR+marketing makes the money "come in over a shorter time period."
> Source: Prima `:2689-2693` (p.44) and `:2603-2606` (p.43); confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA. Whether a film can actually lose money is UNRESOLVED (`ACTIVE-UNRESOLVED-QUESTIONS.csv:38` Q037).

**Feedback loop:** Success → each non-extra Star's Movie Success (18%) and Performances (14%) factors (⅓ cap per film, decaying) → next film's Star Power. This is the only shipped "hit begets hit" loop and it runs through PEOPLE, not properties.
> Source: Prima `:3574-3578` (p.57 Success determines "The movie's effect on participating Stars' Star ratings"), `:4712-4751` (p.74); confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA.

**Other person-attached film multipliers:** Midas Touch / Super Star (five-year Final Movie Rating bonus per awarded director/actor; Prima `:5007-5016` p.78); Perfect Fit (genre fit ×2), Quick Learner, Brainwasher, Trend Setter, On the Radar (Prima `:4960-5030` pp.78-79). Tier: DEVELOPER-REVIEWED PRIMA; confidence HIGH.

---

## 5. Publicity Office mechanics (the original's "attention" system)

- **Facility:** $44,444; Attractiveness −20; multiples allowed; available 1965 or on the Respected Studio Head Achievement Award; "arguably the secret to the highest levels of studio success"; build 3–4.
> Source: Prima `:990-1010` (p.18); Maxx `:814-825`; confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA (+ COMMUNITY). Engine caveat: the mod-derived blueprint schema shows only date/facility unlock kinds, not achievement tokens (`schema_fields.csv:6` TECH-SCHEMA-005; `vanilla_diff_backlog.csv:5` TECH-DIFF-004) — the achievement gating is Prima's claim only.
- **What can be PRed:** a script (uncast or cast), a finished film, or a Star. Public Awareness is per film/script.
- **Cap:** PR can raise a film's Public Awareness only to ½ of its current star rating (2.5★ film → 25%; 5★ film → 50%); once capped, no more PR until the star rating rises; if the rating DROPS, gained awareness is LOST (restored if the rating recovers).
> Source: Prima `:2576-2618` (p.43); `:3704-3706` (p.59); confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA.
- **Script-stage PR:** total time to fully PR is the same whenever you start, so script PR only helps if scripts are queued (Prima `:2485-2503`, p.41).
- **Star PR split:** a Star in the PR room gains ~+6 Press points (of 12); if cast in an unreleased film, half (+3) goes to the film's Public Awareness (Success) and half to the Star; if not cast, all goes to the Star. PR raises Stress but relieves Boredom (`original_formulas.json:231,251`).
> Source: Prima `:1024-1031` (p.18), `:2621-2636` (p.43), `:4765-4790` (p.75); Maxx `:822-825`; confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA.
- **Photographers:** count ∝ Studio Rating; each returns after a year; Photo-Worthy Events table (+10 intimacy … +2 chatting) with Mood costs; repeats of the same event score nothing until decayed.
> Source: Prima `:4816-4855` (p.76); `original_formulas.json:263-309`; confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA. Manual `:987-988` (p.39 "Dropping your Stars and movies into PR is a great way to build up hype and publicity"); tier: OFFICIAL MANUAL.
- **Marketing spend at release** (Release room becomes Release Budget once a Publicity Office exists): None $0 / Small $50k +25% / Average $100k +50% / Large $150k +75% / Gigantic $200k +100% of REMAINING max Public Awareness. Success rewards (i) total awareness proportional to pre-release star rating and (ii) BALANCE between PR and marketing; overspending "is even worse" than underspending; critics rate the balance ("Superb").
> Source: Prima `:2668-2760` (pp.44-45), `:3706-3735` (p.59); manual `:275-279` (p.12 "Try to match the marketing budget to the quality rating and total filming costs"), `:997-1002` (p.39-40 test-screen in Reviews room first; "No need to hype a probable box office dud"); confidence HIGH; tier: DEVELOPER-REVIEWED PRIMA + OFFICIAL MANUAL.
- **On the Radar** award bonus doubles PR/marketing effect for five years (Prima `:5023-5026`, p.79).
- **Design fact for P17:** public awareness in the original was a per-film, pre-release-only, quality-capped bar — it did NOT persist after release and was never inherited by a later film. Tier: DESIGN INFERENCE from the above.

---

## 6. Data-corpus cross-checks and discrepancies found in this pass

1. `movie_rating_pipeline.json:137-141` omits Star Power and Technology from the Success components (Prima p.57-59 lists five). Recommend correction; the Bible `:2240` and `all_reconciled_facts_appendix.csv:109` already have the correct five.
2. The Bible's §8.2 factor table (`:1144`) documents SET novelty but not ACTOR novelty; Prima p.59 `:3693-3699` states actor novelty explicitly and it is the single most P17-relevant shipped mechanic (cast overexposure). `movie_rating_pipeline.json:139` does capture it.
3. `star_rating_components.csv:7` correctly flags the Trailer 68%/38% OCR issue; the raw Prima text (`:4806-4808`) indeed reads "68 percent ... 38 percent".
4. No clean vanilla data exists in the technical artifacts (`vanilla_diff_backlog.csv:2` TECH-DIFF-001); every engine value cited is from a mod file, with modification risk as annotated.
5. **[added 09-12]** Tier nuance: the OFFICIAL MANUAL contains zero occurrences of "novelty" (§0.2), so the shipped set-/actor-fatigue mechanic rests on DEVELOPER-REVIEWED PRIMA + COMMUNITY + the engine `boredom` field, not on the manual. Genre-interest drift IS manual-corroborated. Label accordingly when the report writer cites "fatigue" as a retail precedent.
6. **[added 09-12]** Locator drift fixed in this pass: Prima "can only lower a film's Success rating" = `:3638-3640` (was cited as `:3625-3626`).

---

## 7. What this means for the P17 direction (DESIGN INFERENCE — clearly labelled)

- The shipped original offers **no template** for sequels/prequels/remakes/reboots/spin-offs, franchise recognition, or title effects (Q1–Q8, Q11). P17 is net-new design; do not cite the original as precedent for any continuation rule.
- The original DID ship the three "fatigue" primitives the owner direction wants to keep separate: (i) market-level genre oversupply (→ P15 crowding), (ii) per-set novelty with a per-asset decay rate and recovery-with-disuse, (iii) per-actor novelty. Direction C's FATIGUE/OVEREXPOSURE factor has a direct shipped analogue in (iii), but the original applied it to ALL films uniformly, not to franchise installments, and it could only subtract, never add (Prima p.58 `:3638-3640`).
- The original's "hit begets hit" carry-over ran through Star Rating recency (⅓ per film, decaying) — a person-level MOMENTUM analogue — not through any property. Direction F (franchise-importance-weighted talent continuity) has no precedent; the original's only role-weighting was rank-within-film for Star Power and the flat "up to 3 leads" cap.
- Cast slots: shipped hard cap of 3 principals + director for every era and script source; principal count scaled with script-office tier (1→1–2→2→2–3), never with era/research. Direction T (era-expanding slots) is unprecedented but consistent with the original's "capacity grows with studio capability, never required" pattern (higher-tier scripts merely TEND to call for more leads).
- Cameos: the original explicitly withheld Star benefits from Stars in non-lead slots and gave extras zero fame/publicity value. Direction U is unprecedented; the only shipped lever that resembles "attention value" is Star-in-PR-room awareness splitting to the film.

---

## 8. Open gaps (could not be established from the local corpus)

1. Any *Stunts & Effects* primary text — the corpus has none; S&E claims are Bible/GameFAQs synthesis only.
2. Pre-release sequel/franchise promises (Q15) — requires web research (previews, Lionhead interviews, Molyneux press).
3. Exact per-rank Star Power weights; exact Movie Quality vs Success ratio in Final Movie Rating (Q065); whether the `[project] starratingboxoffice/quality/awards` block maps to either.
4. Whether standard-pipeline scripts had generated/renamable titles (Q071); whether any title/name-based effect existed in code (no text evidence either way, but no clean vanilla data to prove absence).
5. Whether a scene/genre-reuse penalty independent of set/actor novelty existed (Q051); whether actor novelty had a per-Star "boredom factor" analogous to sets (Prima gives none).
6. Base-game behaviour of mid-production recasting (Q052).
7. Whether a release could lose money (Q037) — relevant to Direction E "bad bets allowed".
