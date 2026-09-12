# P15 Phase-1 Evidence Report — Comparators: Long-Run Finale, History/Legacy Presentation, Continue-After-End / Endless Mode

**Reader:** independent evidence reader (comparators lane)
**Date:** 2026-09-11
**Scope:** read-only research against (a) the pinned authority docs, (b) accepted TypeScript snapshot `592e926`, (c) local original-game evidence, and (d) web sources for Civilization, Paradox, tycoon, and history/legacy-dossier comparators.
**Nothing was modified in any repository. No player/campaign data was touched.**

Evidence labels used below:
**RETAIL SHIPPED MECHANIC** (manual / Prima / retail walkthrough for *The Movies*), **OFFICIAL COMPARATOR DOC** (publisher manual, patch note, official wiki page or dev diary of another game), **OPEN-SOURCE CODE** (inspected source), **CONTEMPORARY PROFESSIONAL** (press review/article), **COMMUNITY INFERENCE** (forums/wikis/Steam threads), **PRE-RELEASE PROMISE** (previews). Confidence HIGH/MEDIUM/LOW is per claim.

---

## 0. Bottom line

1. Every serious long-run strategy or tycoon game inspected does one of three things at its authored horizon: **stop with a frozen record** (RCT scenario completion, OpenTTD 2050 high score, Civ IV/V/VI/VII victory, Vic3 1936 screen, CK3 1453 screen, EU4 ironman 1821), **continue with the official result frozen and further wins disabled** (Civ IV manual, Civ V manual, Civ VII 1.2.0, RCT/OpenRCT2, Game Dev Tycoon, OpenTTD, Stellaris), or **never end at all** (Banished, Anno sandbox, GearCity, MGT2, Cities: Skylines, FM). No inspected game *re-scores* the official result after continuation; that is a consistent industry norm and matches the P15 package's "frozen finale + separate one-time mode transition" law (P15-PACKAGE §12.4).
2. The original *The Movies* belongs to the second group: Prima p.80 (PDF p.81) says you can play past 2005 but "the game, reward-wise, ends there" and your 85 years are "tallied up in your Lifetime Honor". The original's research catalogue actually runs out earlier (last research-pack natural date 1999 per Prima's research table), so the original already exhibited a ~6-year "post-catalogue" tail before the reward horizon — an unlabelled, undesigned endless tail. **RETAIL SHIPPED MECHANIC, HIGH.**
3. The consistent post-horizon failure modes reported across comparators — tech tree exhausted (Vic3), flavor gone and "until end of game" modifiers lost (EU4), vehicles expire (OpenTTD), no new platforms/stories plus performance lag (Game Dev Tycoon), procedural "random history mode" that is untested and sheds content (GearCity) — are exactly the items the roadmap says an Endless Mode must answer (P13-P15-LONG-RANGE-ROADMAP §21). The comparators **confirm** that "keep ticking" is not a design.
4. The finale-presentation evidence favours: evidence-linked records (Civ VI Timeline; Dwarf Fortress Legends; CK2 Chronicle), multiple archetype-like recognitions rather than one score (Civ VII Legends; OpenTTD title ladder is the counter-example of a score-to-title mapping), loss-aware framing (Civ VII "Make Losing Fun"), and player demand for "where you struggled" graphs, runner-up recognition and replayable chronology (CivFanatics 2025 Civ VII threads). Player criticism when history is absent or removed is sharp and durable (Civ VI no replay; FM26 club history reduction).
5. One reconciliation item for the Owner: the accepted-code Owner ruling of 2026-08-18 (`docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md` §1) already states "no hard calendar game-over" and "simulation continuation beyond [2040] permitted", with "plausible alternate-future progression" allowed; the P13–P15 rulings say post-2040 Endless Mode "remains undecided". These are compatible (permission ≠ design) but the finale package should cite both so a "Finale and stop" option is not read as contradicting the older ruling.

---

## 1. Original *The Movies* — what the retail game did at its horizon

| Claim | Source / locator | Establishes | Confidence |
|---|---|---|---|
| Play continues past 2005; rewards end at the 2005 ceremony; 85 years "tallied up" in a Lifetime Honor | Prima Official eGuide, printed p.80 (PDF p.81), "Lifetime Honors"; plain text `prima.txt` lines 5121-5147 | RETAIL SHIPPED MECHANIC: continue-after-horizon with a one-time tiered tally, no score | HIGH |
| Completing 2005 without all nine Achievement Awards yields nothing; Gold = all nine by 2005 (Starship Bridge 3 set); Platinum = nine plus per-category ceremony win counts (Diner set + bonus credits) | Prima p.80; `lifetime_honors.csv` rows HONOR_* | RETAIL SHIPPED MECHANIC: tiered checklist, not a blended score | HIGH |
| Contradiction: GameFAQs Maxx FAQ says a Lifetime award exists "for running a studio into 2005" as a third tier | `gamefaqs-maxx.txt` lines 652-657; flagged in `lifetime_honors.csv` notes | COMMUNITY INFERENCE conflicting with Prima's explicit "nothing"; Prima controls | MEDIUM (conflict unresolved) |
| In-game "View Tally" button shows the studio's lifetime record of ceremony wins | Prima Awards chapter, `prima.txt` lines 4924-4932 | RETAIL SHIPPED MECHANIC: the original already had a bare lifetime-record surface | HIGH |
| Bronze/Silver/Gold/Platinum icons are Achievement requirement difficulty levels, not Lifetime tiers | `prima.txt` lines 4881-4888 | prevents misreading a four-tier ladder into the finale | HIGH |
| Sandbox mode = "focus on making movies without worrying about competing for awards"; decade choice gated 30 years beyond New Game progress; full asset set requires a 2005 Platinum save | Manual p.4 (`manual.txt` 83-95); Prima p.98 (`prima.txt` 6255-6268) | RETAIL SHIPPED MECHANIC: the original's "endless" was a separate mode, explicitly labelled, with progression stripped | HIGH |
| Last research pack natural unlock 1999 (Late 1990s Costumes); reward horizon 2005; timeline "from present day into the future" | `research_timeline.csv` last rows; Prima p.80; Manual p.5 (`manual.txt` timeline line) | the original shipped an unlabelled post-catalogue tail (1999→2005) and an unlabelled endless tail (2005→∞) with nothing new | HIGH |
| Whether ceremonies keep firing after 2005 | `ACTIVE-UNRESOLVED-QUESTIONS.csv` Q017 | no inspected source establishes it either way | OPEN |
| A "2010 Sports Car" decoration exists in the Prima ornament table | `prima.txt` 2283; `ornament_catalog.csv` | content named past 2005 existed, but no unlock year is given; do not infer post-2005 content law | LOW |

**Reading for P15C:** the original's finale was *a one-time tally at a fixed ceremony, then unlabelled continuation with no new content*. That is the weakest possible version of "frozen result + endless tail". The package's REFUTED verdict on "original finale was one score" holds; the more precise statement is "tiered checklist with a lifetime tally surface".

---

## 2. Civilization — victory, "one more turn", Hall of Fame, timelines

| Game | End / victory behaviour | What is frozen | Continue behaviour | Source | Label / confidence |
|---|---|---|---|---|---|
| Civ IV | Victory = "Game over (but see below)"; exploits "might be recorded on the Civilization IV Hall of Fame screen"; Time Victory at 2050 by highest score | Hall of Fame entry at the moment of victory | "You can continue playing after winning the game, but any further accomplishments will not be recorded on the Hall of Fame screen. It is also impossible to win another victory type after victory or defeat has initially taken place." | Civ IV manual (Steam CDN PDF), pp.104-105 "Effects of Victory / Continuing a Game After Victory" | OFFICIAL COMPARATOR DOC, HIGH |
| Civ V | "If no one has achieved victory, the game ends automatically at the end of 2050"; scores tallied and a victor announced | Hall of Fame placement by score; time-to-victory multiplier; "future techs" count toward score | "You may continue playing the game after this point, but victory will no longer be a factor." | Civ V manual (Steam CDN combined GAK/BNW PDF), pp.118-119 "The End of Time" / "Your Score" | OFFICIAL COMPARATOR DOC, HIGH |
| Civ V (community) | Whether a later Domination win after someone else's victory registers is disputed among players | — | conflicting reports | Steam thread 35220315814288087 (2013-2020) | COMMUNITY INFERENCE, LOW |
| Civ VI | Launched Oct 2016 with no Hall of Fame and no end-of-game map replay; players complained immediately | — | "Just one more turn" exists; players report no further victories trigger | Steam thread 312265672107657080 (2016-10-30); Steam thread 3106901028663059176 (2021-06-07: "first civ game without end of game replay") | COMMUNITY INFERENCE, MEDIUM |
| Civ VI Gathering Storm | Hall of Fame added (main menu > Additional Content) listing victory counts by type, leader stats, and last games | Entry written when the victory cinematic/end screen triggers; saves made after the trigger do not register | continuing after the trigger does not add to HoF | CivFanatics thread 642068 (2019-02-14/15) | COMMUNITY INFERENCE, MEDIUM |
| Civ VI Rise and Fall | Historic Moments: "significant events that happen throughout the history of the game"; each adds Era Score; viewable "at any time in your game by clicking on the History Timeline"; world-first earns more | Timeline is a running, dated record (year, turn, era score) | n/a | Civilopedia (official in-game text mirror) `rise-and-fall/concepts/pride_moments_1` | OFFICIAL COMPARATOR DOC, HIGH |
| Civ VI Future Tech | Repeatable; each completion adds Score Victory points and "+5% Production towards city projects" | — | the authored tree ends in a repeatable stub | Civilopedia `gathering-storm/technologies/tech_future_tech` | OFFICIAL COMPARATOR DOC, HIGH |
| Civ VII at launch (Feb 2025) | End of Modern Age returned players to main menu after Legacy Path progress, no One More Turn, no post-game analysis | — | none | CivFanatics thread 694658 (2025-02-04) | COMMUNITY INFERENCE (with a moderator citing the developer's Feb 27 check-in), MEDIUM |
| Civ VII 1.2.0 (2025-04-22) | "Just One More Turn" at end of Modern Age in single player | the won victory; "all other victories will be disabled"; Age Progress indicator becomes an infinity symbol | can still complete other victory steps for cinematics, "grab Legacy Path achievements", exit via "No More Turns" | civilization.2k.com Update 1.2.0 notes | OFFICIAL COMPARATOR DOC, HIGH |
| Civ VII Legends / Mementos | Cross-campaign meta-progression via Challenges; explicitly "Make Losing Fun"; Mementos are equippable items with gameplay effects (e.g., bonus Gold per Age) | — | — | civilization.2k.com dev diary "Legends & Mementos" | OFFICIAL COMPARATOR DOC, HIGH |
| Civ VII Test of Time update (2026) | Modern Age victories now score-threshold based ("accrue scores that are certain percentages higher than the second-place player's", held five turns); "brand-new endgame celebration will really emphasize the journey of your personalized empire", leader-focused flyovers | — | not described | civilization.2k.com game-guide "Victories" | OFFICIAL COMPARATOR DOC, HIGH |
| Civ VII player demand (2025-05) | Players ask for return of Civ VI-style Hall of Fame stats, badges for complex stats, a designated "Golden Age", runner-up recognition, comparative graphs "where you may have struggled", and a replay map | — | — | CivFanatics thread 698177 | COMMUNITY INFERENCE (player criticism), MEDIUM |

**Correction to a search-engine misattribution:** a widely quoted line ("if you don't quit immediately... the game assumes you intend to play that one game forever") comes from a *Civilization: Beyond Earth* thread (CivFanatics 557989, 2015-11-07), not Civ VI. It should not be cited as Civ VI behaviour.

**Lesson:** the Civ line settled, across four generations and two manuals, on: **(i)** the official record is written once at the victory trigger; **(ii)** continuation is explicitly allowed and explicitly labelled; **(iii)** further *victories* are disabled while *achievements/legacy progress* may still accrue (Civ VII 1.2.0 distinguishes the two); **(iv)** the tree ends in a repeatable, score-bearing stub. The Civ VII 2025 launch without a One More Turn or post-game summary drew immediate criticism and was patched within ten weeks — a strong signal that shipping a finale without a continuation/epilogue path is a product risk.

---

## 3. Paradox — end dates, end screens, continuation, post-timeline content

| Game | End date & screen | Continue? | Post-end content behaviour | Source | Label / confidence |
|---|---|---|---|---|---|
| EU4 | Scenario runs to 1821; monthly score accrual with a modifier rising from −75% (1444) to +406% (1821) | Non-ironman: continue button on the end screen; ironman: "Continuing after the endgame screen is not possible" | Players report "all unique flavor gone" and "until end of game" modifiers lost; achievements past 1821 disputed | eu4.paradoxwikis.com `Score_system`, `Ironman`; Steam thread 1291816569122505484 (2017-05-19) | OFFICIAL wiki MEDIUM-HIGH; community LOW |
| CK3 | End date game rule: "1453" or "No End Date" (both achievement-enabled); at 1453 "a screen pops up... shows you some details on your house and dynasty, and gives you the singular option to return to the main menu" | Only if the rule was set before the campaign; cannot change mid-game | Press claims "no new events will occur" post-1453 (treat as press inference) | ck3.paradoxwikis.com `Game_rules`; TheGamer 2025-02-11 | OFFICIAL wiki HIGH; CONTEMPORARY PROFESSIONAL MEDIUM |
| CK3 Legends (2024) | Legend seeds mainly from a Court Chronicler with high aptitude, also from deeds and dynasty; Heroic/Holy/Legitimizing types; "The story of the legend will be written in various events as the legend is being completed"; tiers Famed/Illustrious/Mythical by geographic spread; grants bonuses | — | — | ck3.paradoxwikis.com `Legends`; Paradox press release 2024-03-04 | OFFICIAL wiki + press release, HIGH |
| CK2 Chronicle | Automatic entries from on_actions (death, birth, imprisonment, wars, marriages, conversions, oddities) | — | — | ck2.paradoxwikis.com `Chronicle` (technical event list) | OFFICIAL wiki, MEDIUM |
| Victoria 3 | Ends 1 Jan 1936 with a stats pop-up; options include Observe and Switch Country | Players continue by "Switch Country" and re-picking their own nation; a Paradox forum bug report titled "Can't continue playing after 1936 in an Ironman Save file" is marked Confirmed (page itself not retrievable) | "no new tech" → overpopulation problems (player report) | Steam thread 3489754484009350692 (2022-11-08); Paradox forum thread 1551010 title | COMMUNITY INFERENCE, MEDIUM |
| Stellaris | "The empire that has the highest score when the Victory Year arrives is declared winner"; victory year configurable or disabled; score = economy, tech, systems, colonies, pops, subjects, federation, crisis kills, relics | "All players may continue the game session normally even after an empire declares victory and the victory is, in practical terms, of little concern." | Tier-5 repeatable technologies, 50,000 base cost, unlimited levels (one repeatable capped at 5), each +5%/+10% increments | stellaris.paradoxwikis.com `Victory`, `Engineering_research` | OFFICIAL wiki, HIGH |
| HOI4 | Default end 1 Jan 1949 unless majors are still at war; an end score screen; continue button reportedly removed at one point and later possible | Players report continuing | — | Steam threads (multiple); hoi4 wiki pages 404/JS-blocked | COMMUNITY INFERENCE, LOW-MEDIUM |

**Lesson:** Paradox freezes a *screen* (stats/rank) rather than a *record*, and the continuation path is either a pre-set game rule (CK3), a UI workaround (Vic3), or a mode restriction (EU4 ironman). The recurring player complaint is not the freeze — it is that continuation is *unlabelled* and *unsupported* (tech exhausted, flavor gone, balance breaks). Stellaris is the cleanest: victory is a declared, low-stakes marker and repeatable techs give the economy something to do.

---

## 4. Tycoons and builders

| Game | Frozen "official result" | Continuation | Post-timeline content behaviour | Mode labelling | Source | Label / confidence |
|---|---|---|---|---|---|---|
| RollerCoaster Tycoon 2 / OpenRCT2 | On objective completion: window, guests applaud, name entry; company value shown under the scenario name. Code: `scenarioCompletedCompanyValue = companyValue` set once (guarded by `kMoney64Undefined`), then `ScenarioRepositoryTryRecordHighscore(...)`; failure sets `kCompanyValueOnFailedObjective` | "you can keep playing the park for as long as you want after you succeed/fail" | n/a (no timeline) | "Have fun!" objective exists in OpenRCT2 as an explicit no-objective mode | OpenRCT2 `src/openrct2/scenario/Scenario.cpp`; Steam thread 535152511374617319 (2015) | OPEN-SOURCE CODE HIGH; community MEDIUM |
| OpenTTD | On 1 Jan of the year after the ending year (default 2050→"2051"), a full-screen newspaper congratulates you and the performance rating is added to the high score chart (top five per difficulty; titles from "Businessman" to "Tycoon of the Century") | "you can still keep playing the savegame for as long as you want after 2050" | "After 2050 vehicles expire, which means they are no longer available"; fix = "Never expire vehicles" setting (freezes max reliability at peak) | Ending year is a setting (PR #7747); issue #8625 (2021) shows the rating UI hardcodes 2050/2051 labels regardless of the setting | wiki.openttd.org `Ending year`, `High score chart`, `FAQ gameplay`; GitHub issue 8625 | OFFICIAL project wiki HIGH; issue MEDIUM |
| Game Dev Tycoon | Score computed at the year cap (25/30/35 years); "Your final score ends at 35 (or whatever you set it to)" | "but you can continue past that point"; reported "no more platform releases or new stories"; lag makes long continuation impractical | authored platform timeline ends; nothing procedural | not separately labelled | Steam thread 864977564075287355 (2013-08-30) | COMMUNITY INFERENCE, MEDIUM |
| GearCity | No final score or ranking at 2020 | "All map files included with the game end in 2020... You can continue playing past that date. The game will switch you to random history mode." | Procedural after the authored map; "not much post-2020 testing, so over time, some things might start disappearing"; design/series end dates ~3000, some content ends ~2100 | implicit mode switch | Steam thread 3190238550300978543, poster Eric.B identified as developer (2022-01-20) | developer statement in community venue, MEDIUM-HIGH |
| Mad Games Tycoon 2 | none | players report play to 2050 and beyond; review-requirement growth stops ~2020; must launch own consoles | authored console timeline ends; player-made consoles fill | sandbox has sliders for random platform popularity/reviews | Steam discussions (multiple) | COMMUNITY INFERENCE, LOW |
| Capitalism Lab | Goal+Score ranking in challenge games; Accomplishments mode records "highest difficulty rating ever won" per product class in `MISSION.DAT` | "allows you to continue to play even after the goal's deadline has been reached" | n/a | goals vs endless are separate setups | capitalismlab.com `Accomplishments`, scripting docs | OFFICIAL developer site, HIGH |
| Frostpunk | Scenarios have defined endpoints | Endless Mode (update 1.3.0, 2018-11-20) is a separate mode with two named flavours: "Serenity" (build at your own pace) and "Endurance" (see how long you survive); cycling storms, random events, an Archives building to "store lore and information" | n/a | explicit named modes | GOG forum copy of the official 1.3.0 note | OFFICIAL COMPARATOR DOC (mirrored), HIGH |
| Two Point Hospital | Per-hospital 1-3 star objectives | Sandbox Mode (patch 1.08, Oct 2018) unlocked after one star in first three hospitals; cash/kudosh/income/disaster toggles | n/a | explicit "Sandbox" | Steam patch thread; press | COMMUNITY/press, MEDIUM |
| Prison Architect | "Valuation" tab; selling the prison converts value × ownership into cash for a new prison; nothing else carries over | new map | n/a | — | prison-architect.fandom `Valuation`, `New Prison` | COMMUNITY wiki, MEDIUM |
| Transport Fever 2 | campaigns with objectives; "Free play" | free play open-ended | 200+ vehicles across 1850–present | "Campaign" vs "Free play" | Steam store page | OFFICIAL store text, MEDIUM |
| Anno 1800 | Sandbox has optional win conditions | "you don't necessarily have to set any conditions and play as long as you like" | n/a | "Campaign" / "Sandbox" | Anno 1800 fandom + press | COMMUNITY, LOW |
| Banished | No win condition mentioned on the official page | open-ended | n/a | none | shiningrocksoftware.com/game | OFFICIAL site (absence), MEDIUM |
| Hollywood Animal (Weappy, EA 2025) | No end year or legacy system on the store page; "loosely divided into three Acts"; Act 1 "spans about twenty in-game years"; full version "plan to cover a longer historical period" | unknown | unknown | unknown | Steam store page | OFFICIAL store text; end behaviour NOT ESTABLISHED |
| Cities: Skylines, SimCity, Software Inc., Football Manager | No inspected source establishes an end condition; all are widely described as open-ended | — | — | — | — | LOW (not researched to a primary source) |

**Lesson:** tycoons converge on **record once, then let the player keep the toy**. Where an authored timeline exists (OpenTTD vehicles, Game Dev Tycoon platforms, GearCity history, MGT2 consoles), the honest options observed are: (a) let content expire and offer a *toggle* that freezes the last era (OpenTTD "never expire"), (b) switch to a *procedural* generator and admit it is less tested (GearCity), or (c) let the *player* supply the missing content (MGT2 consoles). Nobody inspected authors a fake future history.

---

## 5. History / legacy dossiers — what makes a finale feel earned

| Game / feature | Presentation principle it demonstrates | Source | Confidence |
|---|---|---|---|
| Civ VI Timeline / Historic Moments | A dated, always-open chronicle of typed moments with the turn, year and points; "world first" distinguished from "your first" | Civilopedia entry | HIGH |
| Civ VII Legends | Plural paths (Foundation + per-leader), explicit "Make Losing Fun", "no time limit, no expiration date, or FOMO"; BUT Mementos are cross-run gameplay bonuses | official dev diary | HIGH |
| Civ VII Test of Time endgame celebration | The finale should "emphasize the journey of your personalized empire" with a leader through-line and territory flyovers | official game guide | HIGH |
| Civ VII player criticism (2025) | Players want per-game merits, comparative graphs showing struggles, a designated best period, runner-up recognition, and a replayable chronology; they resent narrative that is claimed but not shown | CivFanatics 698177, 694658 | MEDIUM (community) |
| Dwarf Fortress Legends mode | Browse historical figures, sites, artifacts, chronological events by Age, civilizations; "Any noticeable achievement made by the player... is recorded and is viewable in Legends mode"; history can be partly hidden until uncovered | dwarffortresswiki `Legends_mode` | MEDIUM (community wiki of an official feature) |
| CK3 Legends | Interpretation is separable from fact: seeds come from deeds/chronicler, text is written through events during promotion, quality tiers reflect spread not truth | ck3 wiki, press release | HIGH |
| CK2 Chronicle | Entries auto-generated from on_action triggers — a fact log, not prose | ck2 wiki | MEDIUM |
| OpenTTD title ladder | Counter-example: mapping a 0-1000 rating to seven titles ("Businessman"... "Tycoon of the Century") is a single-score ladder dressed as archetypes | OpenTTD wiki `High score chart` | HIGH |
| Football Manager club history | FM24 exposed 100+ years of season-by-season positions per club; FM26 reduced visibility and players immediately complained ("I'VE LOST IT") | Steam/sortitoutsi threads (2025) | MEDIUM (community) |
| NBA 2K25 MyNBA | Era framing: news presentation evolves from newspaper to web 1.0 to social feed by era; up to six teams added/removed per offseason; the official report does *not* document records/history tracking | nba.2k.com courtside report | HIGH for what it says; QUALIFIED for the package's "long-history navigation" reading |
| RimWorld history tab | Not verified (wiki blocked); no claim made | — | none |

**Principles distilled (evidence-backed):**
1. **Records precede prose.** The features players trust (Civ VI Timeline, DF Legends, CK2 Chronicle, FM history) are typed, dated logs. Prose layers (CK3 Legends) are explicitly *promoted interpretations* with their own status tiers.
2. **Show the loss.** Civ VII's only universally praised finale element is loss-awareness; the most-requested missing element is "where you struggled" graphs.
3. **Plural recognitions beat one ladder.** OpenTTD's score-to-title ladder and Civ VII's new second-place-relative score thresholds are the single-score pattern; both read as rankings, not histories.
4. **Never remove history once shown.** FM26's reduction of club history and Civ VI's launch without Hall of Fame/replay produced the sharpest, most persistent criticism found in this pass.
5. **Provenance is the trust mechanism.** DF Legends and Civ VI Timeline link every claim to an event with a date and actor; Civ VII's Legends dev diary is careful to say rewards are earned "purely and only by playing the game".

---

## 6. How comparators separate "Historical" from "Endless"

| Technique | Games | Note |
|---|---|---|
| A named, separate mode chosen at setup | Frostpunk (Endless: Serenity/Endurance), Two Point Hospital (Sandbox), *The Movies* (Sandbox), Anno 1800, Transport Fever 2 (Free play), OpenRCT2 ("Have fun!") | Cleanest labelling; the original game itself used this |
| A pre-campaign game rule for the end date | CK3 (1453 / never), OpenTTD ending year, Stellaris victory year, Game Dev Tycoon 25/30/35 | Frozen result is still written at the horizon; rule decides whether ticks continue |
| In-place continuation with a visible mode marker | Civ VII 1.2.0 (Age Progress becomes an infinity symbol; "No More Turns" exit), Civ IV/V manuals (victory "no longer a factor") | The strongest match to P15's "one explicit mode event"; a persistent visual marker prevents the player mistaking Endless play for scored play |
| UI workaround rather than design | Victoria 3 (Switch Country), EU4 non-ironman continue button | Produces confusion threads within days of launch |
| Post-timeline content policy | OpenTTD "never expire" toggle; Stellaris repeatable techs; Civ Future Tech; GearCity random history mode; MGT2 player consoles | Three honest options: freeze last era (toggle), repeatable stub, procedural with disclaimer |

---

## 7. Check against prior P15 research

| Prior P15 claim | Verdict | Evidence |
|---|---|---|
| Original may continue after 2005; rewards end at the 2005 ceremony (P15-PACKAGE §5.6) | **CONFIRMED** | Prima p.80 (PDF p.81) |
| Gold = nine Achievement Awards; Platinum adds ceremony-win counts, unlocks a set and alternate credits (§5.6) | **CONFIRMED** | Prima p.80; `lifetime_honors.csv` |
| "Original finale was one score" — REFUTED (§6) | **CONFIRMED, sharpened** | Prima's own word is "tallied"; tiers are a checklist; plus an in-game "View Tally" lifetime record surface exists (Prima Awards chapter) that the package does not mention |
| Civ VII Legends/Mementos supports "loss-aware achievements and several valid paths" (§7) | **QUALIFIED** | Loss-aware plurality confirmed; but Mementos are cross-run gameplay bonuses (the very "meta-power reward" the package rejects); Civ VII launched without One More Turn/post-game analysis (patched 1.2.0), and its 2026 Test of Time victories are second-place-relative score thresholds — cite Civ VII only for loss-aware plurality, not for finale structure |
| CK3 "promotes legends from recorded deeds" (§7) | **QUALIFIED** | Seeds come mainly from a Court Chronicler and also from deeds; legend text is written through events during promotion; quality tiers measure spread, not truth. The fact/interpretation split is a sound Project: Studio inference, but CK3 itself is partly authored interactive narrative |
| NBA 2K25 MyNBA shows "persistent historical framing" (§7) | **QUALIFIED** | The official report documents eras, era-appropriate news presentation and expansion/contraction; it does not document records/history tracking |
| Endless Mode options "stop / browse-only epilogue / continue", Owner chooses after finale prototype (§23; ROADMAP §21) | **CONFIRMED as the industry option set**, with one addition | Every inspected comparator is one of the three; comparators add a fourth sub-option the roadmap should name: *continue with a persistent visual mode marker and disabled scored outcomes* (Civ VII 1.2.0), which is distinct from plain "continue" |
| ROADMAP §21 list of what Endless must answer (catalogue supply, entrants, era presentation, market normalization, awards cadence, balance, save compatibility, achievements) | **CONFIRMED by observed failures** | Vic3 tech exhaustion; EU4 flavor/modifier loss; OpenTTD vehicle expiry; GDT platforms/stories/lag; GearCity untested procedural mode; MGT2 stalled review growth |
| P15-PACKAGE §12.4: Endless begins via a separate one-time transition and "does not alter the finale inputs" | **CONFIRMED as best practice** | Civ IV manual (further accomplishments not recorded), OpenRCT2 code (completion value set once), Civ VI GS HoF (written at trigger), OpenTTD (rating recorded at scoring year) |
| Roadmap timeline row "Post-2040: No continuation is assumed" | **QUALIFIED** | Accepted-code Owner ruling 2026-08-18 (`docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md` §1; `00A-OWNER-RULING-TIME-MODEL` "Long-term timeline law") already states "no hard calendar game-over", continuation beyond 2040 "permitted", and "plausible alternate-future progression" allowed; `src/` has no `gameOver`/`maxWeek` (verified by grep of the accepted snapshot). Permission is not design, but a "Finale and stop" choice would need an explicit newer ruling to supersede the earlier one |
| OpenTTD cited as a bounded-history data-model pattern (§8 table) | **CONFIRMED in scope; one caution added** | Not re-verified at file level here; but OpenTTD issue #8625 shows its frozen-result UI hardcodes the 2050/2051 year even when the scoring year is a setting — a concrete "do not hardcode the finale week in presentation" warning |
| "No inspected source establishes rival closure/merger" etc. (§5.5) | out of this lane | not examined |

---

## 8. Lessons table

| # | Lesson | Strongest evidence | Applies to |
|---|---|---|---|
| L1 | Write the official record exactly once, at the trigger; continuation can never mutate it | Civ IV manual p.104-105; OpenRCT2 `Scenario.cpp`; Civ VI GS HoF behaviour | 2040 finale snapshot |
| L2 | Disable *scored outcomes* after the horizon but keep *legacy/achievement progress* possible if the mode continues | Civ VII 1.2.0 ("all other victories disabled", Legacy achievements still earnable) | Endless Sandbox |
| L3 | Mark the mode persistently in the HUD (infinity symbol) and give a named exit ("No More Turns") | Civ VII 1.2.0 | Endless Sandbox |
| L4 | Name the modes; do not rely on a menu workaround | Frostpunk Serenity/Endurance vs Vic3 "Switch Country" confusion | Mode transition |
| L5 | A finale without an epilogue/continue path is a product risk; Civ VII patched one in within ten weeks | CivFanatics 694658; 1.2.0 notes | Owner decision |
| L6 | Post-horizon content needs an explicit policy: freeze last era (toggle), repeatable stub, or procedural with disclaimer | OpenTTD never-expire; Stellaris repeatables; Civ Future Tech; GearCity random history | Endless catalogue |
| L7 | Do not fabricate future history; procedural must be labelled less-tested and non-historical | GearCity developer statement | Endless era presentation |
| L8 | Records first, prose second; interpretation carries its own status | Civ VI Timeline; DF Legends; CK3 Legends tiers | Legacy dossier |
| L9 | Loss-aware framing is the most praised finale element; "where you struggled" graphs the most requested | Civ VII dev diary; CivFanatics 698177 | Legacy dossier |
| L10 | Score-to-title ladders read as a single score even when dressed as archetypes | OpenTTD title ladder; Civ VII Test of Time thresholds | Archetype design |
| L11 | Removing or hiding previously visible history is punished by players | FM26 club history; Civ VI launch | Archive browsability |
| L12 | Never hardcode the horizon year into presentation | OpenTTD issue #8625 | Finale UI |
| L13 | The original's own pattern was "tally at a fixed ceremony, then unlabelled continuation" — the successor must label what the original left implicit | Prima p.80; research table ending 1999 | Both modes |

---

## 9. Recommended presentation principles

### (a) 2040 ceremony + interactive Legacy dossier (multiple non-exclusive archetypes, no single score)

1. **Ceremony = the trigger, dossier = the record.** Freeze `legacyFinaleSnapshot` at the governed week before any presentation runs (matches P15-PACKAGE §12.4 and Annex C.5). The ceremony may celebrate, but it reads from the frozen manifest; it never computes.
2. **Open with the span, then the cards.** Follow Annex M.6: identity and 1920-2040 completeness first, then archetype cards. Each card shows *qualifying* and *contrary* evidence side by side (Civ VII loss-awareness; CivFanatics "where you struggled"). A studio holding zero archetypes must still get a full, dignified dossier — the original's "you get, well, nothing" is the anti-pattern.
3. **Every sentence resolves to a record.** Emulate Civ VI Timeline / DF Legends: each claim links to a dated, typed event with actors (film, person, award, technology, market batch). Prose is a derived layer, never persisted as truth (Annex E.7 already says so).
4. **Use a Timeline lens, not a ranking lens.** Provide a dated chronology with era markers and "studio first" vs "industry first" flags (Civ VI world-first distinction) rather than any ladder. Do not ship a title ladder mapped from a hidden number (OpenTTD counter-example).
5. **Name the best period and the worst period explicitly** ("Golden stretch 1958-1966", "Crisis 1979-1983"), each with evidence. This satisfies the requested "designated Golden Age" without a score.
6. **Show rivals as history, not as a leaderboard.** Runner-up-style recognition (who was closest in each lens) with links to their records answers the Civ VII community request without implying a winner.
7. **Declare incompleteness in the same visual grammar** ("Not recorded before migration week N") — DF Legends hides unrevealed history as a feature; the dossier should treat gaps as first-class content.
8. **Keep the archive browsable forever after** (Annex C.5 "archive-browsable"). FM26 and Civ VI show what happens when history is shown then withdrawn.

### (b) Endless Sandbox after a frozen 2040 result

1. **One explicit, irreversible mode event**, presented on the finale screen with named choices ("End the campaign", "Browse the archive", "Continue in Endless Sandbox"), mirroring CK3's rule/Civ VII's button but chosen *after* the finale, not at setup. Record the choice in the snapshot's `postFinaleMode`.
2. **What is frozen:** the finale manifest, every archetype award, the completeness notices and the dossier presentation version. Nothing in Endless play can add, remove or re-rank an archetype (Civ IV: "further accomplishments will not be recorded"). If Endless play deserves recognition, it gets *its own* dated, clearly-labelled post-2040 record set, never merged into the 2040 dossier.
3. **What continues:** the simulation, the browsable archive, P08 awards ceremonies if the Owner wants them (Stellaris shows continued play is fine when the victory marker is "of little concern"), and any *non-legacy* achievements the Owner authorises (Civ VII 1.2.0 precedent).
4. **Persistent mode marker:** a permanent HUD state ("Endless Sandbox — post-2040 play, legacy frozen 2040-W##") and a named exit, per Civ VII 1.2.0's infinity indicator and "No More Turns".
5. **Era/tech content without authored future history — pick one policy per catalogue and label it:**
   - *Freeze at the last authored era* as the default (OpenTTD "never expire" semantics): no new authored technology, existing methods remain valid, no supersession events. Cheapest, honest, and consistent with the original's own 1999-2005 tail.
   - *Repeatable stub* only for systems that need a sink (Stellaris repeatables / Civ Future Tech): explicitly generic, incremental, and labelled "post-historical"; never given fabricated names or dates.
   - *Procedural future* only if separately authorised, shipped with a GearCity-style disclaimer that it is non-historical and less tested, and never exposed as "history" in the archive.
   The accepted-code ruling's "plausible alternate-future progression" clause permits the third option but does not require it.
6. **Do not let Endless play silently satisfy P13-P15 Owner decisions.** Awards cadence, entrant generation, market normalisation and save compatibility each need a stated post-2040 rule (ROADMAP §21); comparators show each one breaks when left implicit (Vic3 tech, EU4 modifiers, GDT platforms, OpenTTD vehicles).
7. **Label the two histories distinctly in the archive:** "Campaign 1920-2040 (frozen)" and "Sandbox 2040-present (live)"; never interleave them in the same chronology view without a hard visual boundary.

---

## 10. Open uncertainties (this lane)

- Whether *The Movies* ceremonies keep firing after 2005 (Q017) — no inspected source establishes it.
- The internal Prima/GameFAQs conflict over a third "reached 2005" Lifetime tier — Prima's chapter text controls, but the summary passage was not re-read this pass.
- Victoria 3's exact end-screen contents and the ironman continuation rule could not be read from the Paradox forum (browser-validation wall); community reports only.
- HOI4 end-date behaviour is community-sourced; official wiki pages returned 404/JS-blocked.
- Civ VI's Hall of Fame introduction date (Gathering Storm, Feb 2019) rests on community reports; the Fandom page was paywalled (402).
- Hollywood Animal's end year, legacy system and post-Act-3 behaviour are not established by any inspected source; the store page only promises "a longer historical period" in the full version.
- Football Manager, Cities: Skylines, SimCity and Software Inc. were not researched to a primary source; treat their "no end" status as LOW.
- The Civ V manual passage on the Hall of Fame was located by text search; page numbers (118-119) are from the PDF's printed page markers and were not visually confirmed.

---

## 11. Source list (main)

- Prima Official eGuide (local PDF), printed p.79-80 (PDF p.80-81), Awards chapter; `original-text/prima.txt` lines 4878-4935, 5115-5160, 6228-6275.
- *The Movies* manual (local PDF) p.4-5, `original-text/manual.txt` lines 78-96.
- GameFAQs Maxx FAQ, `original-text/gamefaqs-maxx.txt` lines 648-660.
- `THE-MOVIES-2005-ORIGINAL-DATA/lifetime_honors.csv`, `research_timeline.csv`, `ACTIVE-UNRESOLVED-QUESTIONS.csv` (Q017, Q018).
- Accepted snapshot `592e926`: `docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md` §1-2; `docs/c2-planning/00A-OWNER-RULING-TIME-MODEL-2026-08-18.md` "Long-term timeline law"; grep of `src/` for `gameOver|maxWeek` (none); `ui/src/engine/adapter.ts:2610` `SIM_CAP`.
- Authority: P15-PACKAGE §5.6, §6, §7, §12.4, §15.4, §23; P15-BUILDER-ANNEX C.5, D.6, E.6, M.6; P13-P15-OWNER-RULINGS §4.1-4.3; P13-P15-LONG-RANGE-ROADMAP §7, §18, §21.
- Civ IV manual: https://cdn.akamai.steamstatic.com/steam/apps/3900/manuals/manual.pdf pp.104-105.
- Civ V manual: https://cdn.akamai.steamstatic.com/steam/apps/8930/manuals/Civ_V_MAN_EXTENDED_COMBINED_GAK_BNW.pdf pp.116-119.
- Civ VI Civilopedia: https://www.civilopedia.net/en-US/rise-and-fall/concepts/pride_moments_1/ ; https://www.civilopedia.net/en-US/gathering-storm/technologies/tech_future_tech/
- Civ VII: https://civilization.2k.com/civ-vii/game-update-notes/2025-apr-22-patch-1-2-0/ ; https://civilization.2k.com/civ-vii/game-guide/dev-diary/legends-mementos/ ; https://civilization.2k.com/civ-vii/game-guide/gameplay/victories/
- CivFanatics: threads 694658 (2025-02), 698177 (2025-05), 642068 (2019-02), 557989 (Beyond Earth, 2015-11).
- Steam Civ VI threads 312265672107657080 (2016-10-30), 3106901028663059176 (2021-06-07); Civ V thread 35220315814288087.
- EU4: https://eu4.paradoxwikis.com/Score_system ; https://eu4.paradoxwikis.com/Ironman ; Steam thread 1291816569122505484.
- CK3: https://ck3.paradoxwikis.com/Game_rules ; https://ck3.paradoxwikis.com/Legends ; Paradox press release 2024-03-04; TheGamer 2025-02-11.
- CK2: https://ck2.paradoxwikis.com/Chronicle
- Victoria 3: Steam thread 3489754484009350692 (2022-11-08); Paradox forum thread 1551010 (title only).
- Stellaris: https://stellaris.paradoxwikis.com/Victory ; https://stellaris.paradoxwikis.com/Engineering_research
- OpenTTD: https://wiki.openttd.org/en/Archive/Manual/Ending%20year ; https://wiki.openttd.org/en/Manual/High%20score%20chart ; https://wiki.openttd.org/en/Manual/FAQ%20gameplay ; https://github.com/OpenTTD/OpenTTD/issues/8625
- OpenRCT2: https://raw.githubusercontent.com/OpenRCT2/OpenRCT2/develop/src/openrct2/scenario/Scenario.cpp ; Steam RCT2 thread 535152511374617319.
- Game Dev Tycoon: Steam thread 864977564075287355 (2013-08-30).
- GearCity: Steam thread 3190238550300978543 (developer reply 2022-01-20).
- Capitalism Lab: https://www.capitalismlab.com/new-content/accomplishments/
- Frostpunk 1.3.0 notes (GOG forum mirror): https://www.gog.com/forum/frostpunk/update_130_endless_mode
- Dwarf Fortress: https://dwarffortresswiki.org/index.php/Legends_mode
- NBA 2K25 MyNBA: https://nba.2k.com/2k25/courtside-report/mynba/
- Hollywood Animal: https://store.steampowered.com/app/2680550/Hollywood_Animal/
- Transport Fever 2: https://store.steampowered.com/app/1066780/Transport_Fever_2/
- Banished: http://www.shiningrocksoftware.com/game/
- Prison Architect: prison-architect.fandom.com `Valuation`, `New_Prison` (community).
- Football Manager 26 club-history complaints: Steam thread 670600486987108937; sortitoutsi 74748 (community).
