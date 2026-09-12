# Original *The Movies* (2005) — Rival Studios, Competition, Rankings, Arrivals, Closure, Acquisition

**Reader:** independent evidence reader, P15 research review (READ-ONLY)
**Date:** 2026-09-11
**Scope:** reconstruct what the retail 2005 game actually shipped for rival studios, cross-studio competition, Studio Rating / Charts, rival arrival, rival closure, acquisition, talent movement, and cross-studio awards; verify the prior P15 package (`P15-PACKAGE.md` §5–6) claim by claim.

## 0. Source tiers used in this report

| Tag | Meaning | Sources in this pass |
|---|---|---|
| **RETAIL SHIPPED MECHANIC** | established by the official manual and/or the developer-reviewed Prima guide (Lionhead staff credited), corroborated where possible | manual (Sep 2005 print), Prima Official eGuide (Oct/Nov 2005) |
| **PRIMA/MANUAL EVIDENCE** | stated only in one of those two, not independently corroborated | as above |
| **CONTEMPORARY PROFESSIONAL** | retail-era professional review/walkthrough | GameSpot walkthrough (Rorie, 19 Nov 2005), GameSpot review (Davis, 9 Nov 2005) |
| **PRE-RELEASE PROMISE** | preview coverage before the Nov 2005 ship | GameSpot E3 2002 First Look (Parker, May 2002); GameSpot Preview (Park, 23 Feb 2004) |
| **COMMUNITY INFERENCE** | GameFAQs guides, fandom wikis, fan retrospectives | GameFAQs Maxx (2005–08), GameFAQs Mark_E_1990 (2006), gamepressure, the-movies-game.fandom.com, gamicus.fandom.com, forceforgood.co.uk (2012) |
| **TECHNICAL ARTIFACT (MODDED)** | engine `.ini` fields recovered from a mod package, not a clean vanilla install | `THE-MOVIES-2005-TECHNICAL-ARTIFACTS/schema_fields.csv` |
| **DIRECTLY OBSERVED** | screenshot of the running game (Prima page image or Owner-supplied capture) | Prima p.51 Studio Charts screenshot; `Screenshot 2026-08-17 at 11.34.09 AM.png` |

Page conventions: **Prima printed page N = PDF page N+1** (verified: "RIVAL STUDIOS" is printed p.51 = PDF p.52). **Manual printed page** derived from the QuarkXPress slug `Page N` (each slug opens a two-page spread N/N+1; verified against PDF p.3 = printed pp.4–5). Line numbers refer to the scratchpad plain-text extractions.

---

## 1. Genre saturation / competition (what Prima actually says)

### 1.1 Genre Interest section — Prima printed p.58 (PDF 59), `prima.txt` 3603–3667

**RETAIL SHIPPED MECHANIC, confidence HIGH.**

- Prima defines the driver explicitly: "Genre interest is ruled by two factors: time and saturation." (p.58).
- Time = authored future news events on the timeline, visible five years ahead, that raise/lower specific genres on their date (p.58, 3630–3646).
- Saturation is expressly **all-studio**: "The more movies all studios, including yours, release in a genre, the more tired of the genre the public will get and the more genre interest plummets." (p.58, 3656–3658). Consequence: "release a movie after a rival studio churns out a series in that genre and you may find yourself with a brilliant but underperforming dud." (p.58, 3659–3662).
- Cross-reference to rival personalities: "Look at the rival studios' personalities in the 'Studio Rating' chapter to get an idea of which genres they favor..." (p.58, 3665–3667).

### 1.2 Rival Studios section — Prima printed p.51 (PDF 52), `prima.txt` 3151–3195

Restates the same law from the rival side: "a high number of movies released by all studios in a genre actually drives down interest in that genre." and advises using rival genre propensities to "avoid overworked genres before the effects of the rivals' overproduction begin to show." (p.51).

### 1.3 What the sources do NOT establish

| Question | Finding | Tier / confidence |
|---|---|---|
| Exposure window (how long a release depresses genre interest) | **No inspected source establishes a window.** Prima gives no duration, curve, or recovery rate for genre saturation (contrast: set novelty, which Prima says "refreshes with the passage of time" p.58). | HIGH that it is unrecovered |
| Release timing vs. a rival's release (same week/month) | **No inspected source establishes a timing-overlap mechanic.** The only timing advice is relative to authored news events ("release it just after the news event", p.58). | HIGH that it is unrecovered |
| Direct head-to-head box-office competition between films | **No.** Prima's Success factors (p.57–58, 3553–3700) are Star Power, Genre Interest, Novelty, Technology, PR & Marketing; earnings are "based entirely on its Success rating" (p.44, 2689–2691). No screen-count, attendance-split, or rival-film term exists in any inspected source. | HIGH (absence in developer-reviewed factor list) |
| Whether rivals' releases are simulated films with their own quality | Rivals' films appear on the Movie Charts (implied by Best Direction/Acting criteria requiring "top 10 of the Movie Charts", p.78) and rivals win ceremony awards (p.82 "another studio could get the award"). Their internal quality model is not documented. | MEDIUM |

Prima also states a **rival output cap** in the Platinum walkthrough: "rivals can only release 10 in five years" (p.82, 5250–5251) — PRIMA EVIDENCE, developer-reviewed, uncorroborated elsewhere; confidence MEDIUM-HIGH.

**Verdict on P15 §5.2:** CONFIRMED (all-studio saturation, world events, no recovered window/curve). The package's phrase "no trustworthy release-overlap formula beyond genre saturation" is correct and, if anything, understated — no overlap mechanic of any kind is documented.

---

## 2. Studio Rating, Charts, and rank badge

### 2.1 The five weighted components — Prima printed pp.45–47 and 51

**RETAIL SHIPPED MECHANIC (developer-reviewed weights), confidence HIGH.** Verified verbatim in `prima.txt`:

| Component | Weight | Prima page / line | What it measured (Prima) |
|---|---|---|---|
| Capital | 24% | p.46, 2851–2855 | cash in the bank "at any given time"; scale $50,000 (lowest) to $1,600,000 (max); non-linear, midpoint of score at ~$300,000 not $775,000 (p.46, 2792–2812) |
| Movies | 24% | p.46, 2849–2850 | "collective quality of your studio's releases"; Success score adds in proportion; "impact of individual movies decays over time" (p.46, 2838–2843) |
| Stars | 24% | p.46–47, 2850–2856, 2870–2885 | sum of a rank-weighted portion of each Star's rating; top Star in the studio counts most, each lower Star a smaller proportion |
| Lot Prestige | 14% | p.47, 2888–2892 | aesthetic beauty + how well the lot functions; sub-factors Attractiveness 35%, Connectedness 14%, Maintenance 17%, Catering 10%, Sanitation 10%, Ornamentation 10%, Cleanliness 4% (pp.47–51) |
| Awards | 14% | p.51, 3179–3186 | "number of awards your studio has won at the most recent award ceremony"; max score at ≥6 awards |

Prima's own cross-check sentence: "Movies accounts for 24 percent of Studio rating and Lot Prestige for only 14 percent" (p.46, 2841–2843).

Corroboration: GameFAQs Maxx §VII reproduces the identical five weights and the Capital scale (`gamefaqs-maxx.txt` 2197–2244, 2357–2362) — COMMUNITY, but closely derivative of Prima. GameFAQs Mark (`gamefaqs-mark.txt` 1002–1025) names the same five factors with star sub-ratings and no weights. gamepressure names the same five with no weights (`gamepressure-improving.txt`). GameSpot walkthrough (Rorie, Nov 2005) names the same five with no weights and adds an editorial gloss that Awards is "a 'win more' rating" — CONTEMPORARY PROFESSIONAL.

**Technical-artifact corroboration (MODDED, candidate vanilla, confidence MEDIUM):** `THE-MOVIES-2005-TECHNICAL-ARTIFACTS/schema_fields.csv` row `TECH-SCHEMA-007` records a `global.ini [studio]` block `starratingmoneyfactor/reputationfactor/starsfactor/prestigefactor/awardsfactor = 0.239, 0.239, 0.239, 0.144, 0.144`. The register labels this "numerically distinct" from Prima. I disagree: 0.239 rounds to 24% and 0.144 to 14%, exactly the rounding relationship the same register accepts for the `[star]` block (`TECH-SCHEMA-008`, "matches Prima's ... rounded percentages almost exactly"). The factor names differ (money/reputation vs. Capital/Movies) so the name mapping is an inference, but the weight vector is the strongest engine-side corroboration of Prima's Studio Rating weights available. Caveat: source file is from `employeemod` (a modded copy), not a clean vanilla install (see `vanilla_diff_backlog.csv` TECH-DIFF-001).

**Open numeric conflict (unchanged):** `ACTIVE-UNRESOLVED-QUESTIONS.csv` Q010 and `source_conflicts.csv` CONFLICT_050 record a contemporary-walkthrough claim of a ~$5,000,000 Capital ceiling vs. Prima's $1,600,000. Not resolved here.

### 2.2 The Charts and the manual's factor list

**Manual (RETAIL, HIGH):**
- p.6 (`manual.txt` 110–123): the Studio Ranking icon "shows you how you measure up against the competition. Your rank is determined by a number of factors, such as your cash balance, the quality of movies ... the quality of Stars ... how well connected and laid out your studio is and even how clean and tidy you keep the place." — the manual thus does list cash, movie quality, stars, layout/connectedness, and tidiness, i.e. Capital, Movies, Stars, and two Lot Prestige sub-factors. It does **not** mention Awards as a factor.
- p.6 (126–128): "Your Cash Balance contributes toward your ranking in the Charts, so it is advisable to spend wisely."
- p.21 (509–532): the rosette opens "the Star, Studio and Movie charts. These charts show just how your studio, Stars and movies are doing in relation to the competition." Right-clicking an entry gives "a breakdown of what determines their ranking". "Being ranked number one is the ultimate goal of everyone in showbiz."

**Prima (HIGH):** p.46 caption: "The Studio Charts show your studio's ranking in the world and how it's doing in each of the scoring categories." Prima advises reading the per-category scores in the Studio Charts to find weak areas (p.46, 2833–2843).

### 2.3 The rank badge and chart size — DIRECTLY OBSERVED

- Prima p.51 screenshot (PDF 52, rendered at 300 dpi): "Studio Charts", dated **Feb 1958**, "Page 1/1", nine rows: 1st Craemmir Siblings (player, highlighted), 2nd Gusset Entertainment, 3rd Old Rope Cinema, 4th Maxipack Worldwide, 5th Cletus's Shotgun Cinema, 6th Lionear Productions, 7th Creamboat Creations, 8th Rigormortis Movies, 9th Boney Studios. Each row shows an ordinal, a **movement arrow with a number** (previous position), a five-pip star rating, and the studio logo. Booboo & Dingo (Prima window 1967–1971) is absent, consistent with the date.
- Owner-supplied HUD capture `Screenshot 2026-08-17 at 11.34.09 AM.png` (Apr 1935): top-right rosette shows a numeric badge "1" with a row of small stars beneath the cash balance — i.e. rank position plus 0–5 studio star rating.

**Conclusions:** (a) the chart is a positional ordering of every active studio (player + rivals), so at most 10 rows once all nine rivals have arrived — the "ten-slot chart" phrase in P15 is an **inference** from Prima's nine-rival table, not a verbatim source statement, but the 1958 screenshot with nine rows makes it well-founded (MEDIUM-HIGH); (b) rivals carry the same visible 0–5 star Studio Rating as the player (DIRECTLY OBSERVED pips), which is consistent with — but does not prove — the same formula being applied to rivals; (c) the chart records prior position (arrow + number), which is the observable basis for Highest Climbing Studio.

The Bible's flag that a "1–10 numeric rank plus separate 5-star studio level" claim is low-confidence (source register line 94, search-cached GameFAQs snippet) is superseded by direct observation: the badge is chart position; the stars are the studio rating; two different things shown together.

### 2.4 Update cadence

**No inspected source states how often the Studio Charts recomputed.** Prima's Capital wording ("at any given time ... If the amount rises or falls, the scoring of this factor changes", p.46) and the manual's "current ranking" (p.21) imply a continuously-live rating, with award-ceremony snapshots taken "on the date of the ceremony" (p.78). Confidence HIGH that cadence is undocumented; MEDIUM that it was effectively continuous.

**Verdict on P15 §5.1:** CONFIRMED. Weights and pages verified. One qualification: the manual's factor list omits Awards and does not give weights; the weights are Prima-only (developer-reviewed) plus the modded-engine vector.

---

## 3. Rival studio arrivals — the Prima table (printed p.51, PDF 52)

**PRIMA EVIDENCE (developer-reviewed), confidence HIGH for names and windows.** Verified verbatim at `prima.txt` 3195–3208 and by direct page render:

| Studio | Appears | Releasing in most popular genre (%) | Action | Comedy | Horror | Romance | Sci-Fi |
|---|---|---|---|---|---|---|---|
| Old Rope Cinema | 1898–1902 | 25 | 30 | 50 | 30 | 20 | 10 |
| Maxipack Worldwide | 1898–1902 | 30 | 20 | 40 | 20 | 50 | 30 |
| Lionear Productions | 1905–1907 | 18 | 20 | 30 | 50 | 30 | 20 |
| Creamboat Creations | 1916–1920 | 40 | 20 | 10 | 30 | 50 | 40 |
| Rigormortis Movies | 1928–1932 | 50 | 20 | 30 | 30 | 50 | 40 |
| Gusset Entertainment | 1937–1941 | 60 | 40 | 20 | 60 | 20 | 30 |
| Cletus's Shotgun Cinema | 1948–1952 | 70 | 60 | 20 | 30 | 30 | 50 |
| Boney Studios | 1954–1958 | 75 | 40 | 60 | 60 | 50 | 40 |
| Booboo & Dingo Films | 1967–1971 | 75 | 70 | 55 | 35 | 40 | 60 |

Prima's framing text (p.51): "Over the years, more and more studios join the fray"; "Though much of each studio's behavior is random, several things about each studio contribute to what could be termed a 'personality.'"; arrival "can vary over a four-year period"; "The studios that start before 1920 are already well established by the time your studio opens." The semantics of the propensity columns are stated: the third column is the probability of releasing in the current most-popular genre; if not, the remaining columns give per-genre probabilities.

Was entry authored? Yes: names, windows, and personalities are fixed data; the exact year inside each window is random ("vary over a four-year period"). Whether the pre-1920 rivals' windows are back-story only (they are simply present at 1920) is the natural reading. Opening count at 1920: three rivals certain (Old Rope, Maxipack, Lionear) plus Creamboat depending on its 1916–1920 roll — so three or four. No source states the player's own start-of-game rank.

**Community conflict (COMMUNITY INFERENCE, LOW):** the-movies-game.fandom.com "Category: Rival Studios" lists the same nine names but different windows (e.g. Old Rope 1914–1918, Rigormortis 1937–1941, Gusset 1947–1951, Cletus 1957–1961, Boney 1965–1969, Booboo & Dingo 1971–1974; "After 1974 no other studios open"), and says "Old Rope Cinema is one of the four rival studios operating at the start". gamicus.fandom.com says "four rival studios ... six studios are added later ... No more studios open for business after the year 2000" (which would total ten rivals). The Prima p.51 screenshot dated Feb 1958 already shows Boney Studios on the chart, which is consistent with Prima's 1954–1958 and **inconsistent** with the fandom 1965–1969 window; Prima's table therefore controls. The fandom wiki also claims a PA announcement on rival opening — unverified elsewhere; plausible given Prima documents PA announcements for rival-Star arrivals (p.8).

Corroboration: GameFAQs Maxx §VII "Rivals" (`gamefaqs-maxx.txt` 2364–2420) reproduces Prima's names, windows, and percentages exactly.

**Verdict on P15 §5.4 (arrivals):** CONFIRMED — nine named rivals, several pre-1920, later windows through 1971, exact RNG and opening count unresolved.

---

## 4. Rival bankruptcy / failure / closure / disappearance

Systematic search of every retail-tier text for `acqui|take over|buy out|merge|bankrupt|go bust|close down|out of business|fold|shut down|disappear|game over|liquidat|insolv`:

| Source | Result |
|---|---|
| Manual (`manual.txt`) | zero hits. Only economic failure text is the player's own: "Your balance can go into the red but when you're in debt, you won't be able to build new sets..." (p.6, 129–131). |
| Prima (`prima.txt`) | zero relevant hits. "disappear" = fired Stars' cards (p.8); "Take over the top spot" = chart position (p.82); "acquired/acquiring" = genre experience / a facility. Prima's Rival Studios section says studios only ever "join the fray"; the chart "get[s] longer and longer" (p.51 caption). The Platinum walkthrough assumes all rivals persist through 2005. |
| GameSpot walkthrough (Rorie, Nov 2005) | no mention of studios closing, being bought, or merging. |
| GameSpot review (Davis, Nov 2005) | no mention of rival studios at all. |
| *Stunts & Effects* manual (Apr 2006 print, fetched and text-extracted this pass) | one rival mention only: stunt awards give "an extra edge over your rival studios!" (p.10). Nothing on closure/acquisition. |
| GameFAQs Maxx / Mark, gamepressure | zero hits. |
| Fan retrospective (forceforgood.co.uk, 2012) | "the game rarely produces dramatic failures"; long chart domination "until the modern era, at which point, things seemed to get a lot harder" — COMMUNITY; no closure mentioned. |
| the-movies-game.fandom.com / gamicus.fandom.com | "no statements regarding studios closing, going bankrupt, being acquired, merging, or leaving the charts." |
| Local CSV registers | `source_conflicts.csv`, `ACTIVE-UNRESOLVED-QUESTIONS.csv`, `dormant_or_unconfirmed_fields.csv`, `technical_artifact_conflicts.csv`, `vanilla_diff_backlog.csv`: **no row** mentions rival closure, bankruptcy, merger, or acquisition. Bible §"Failure conditions" (line 2864–2866) states no source describes any bankruptcy/closure state in either mode. |

The only place a studio "going bust" appears is the **PRE-RELEASE** GameSpot preview (Park, 23 Feb 2004): the timeline tracks milestones "at least until the studio goes bust." This is a promise about the player's studio, not rivals, and no retail source carries it forward.

**Conclusion:** "**Rival closure NOT reliably verified**" holds — and can be strengthened: every retail-tier source that discusses rivals describes them as only arriving, never leaving; no chart removal, merger, or replacement is documented anywhere, including community wikis. Absence of evidence is not proof of absence, but there is no positive evidence at any tier. Confidence HIGH that no parity claim is available.

**Verdict on P15 §5.5 (closure OPEN QUESTION):** CONFIRMED, with the qualification that the balance of evidence (Prima's "join the fray" framing, the persistent nine-rival Platinum walkthrough, and the community wikis' silence) leans toward rivals being permanent once entered.

---

## 5. Acquisition / merger / buying rivals; Star movement between studios

### 5.1 Acquisition — pre-release only

- **PRE-RELEASE PROMISE (verified this pass, HIGH):** GameSpot "E3 2002: First Look: The Movies" (Sam Parker, May 2002): "Competition from other studios raises the stakes for success, and one way to grow is to acquire your competitors."
- **PRE-RELEASE PROMISE (verified this pass, HIGH):** GameSpot "The Movies Preview" (Andrew Park, 23 Feb 2004): rivals "may even try to steal them [your stars] away from you"; you can respond "by offering bigger, fatter contracts to up-and-coming stars"; timeline runs "until the studio goes bust." No acquisition mention in this 2004 piece.
- **Retail absence (HIGH):** `prima.txt` hits for `acquir|take over|buy` are all non-corporate (genre experience "acquired" p.8; "Take over the top spot" = charts p.82; "acquiring the Cosmetic Surgery facility" p.85; "buy" only for facilities/gifts). Manual: no hits. GameSpot walkthrough: none. S&E manual: none.

**Verdict on P15 §5.5 (acquisition REFUTED as shipped; E3 2002 SOURCE VERIFIED AS PRE-RELEASE):** CONFIRMED. The 2004 preview's "contracts" and "steal them away" language also did not ship as a bidding market (see 5.2); only the mood-driven defection survived.

### 5.2 Star movement between studios — the closest retail "corporate" interaction

All **RETAIL SHIPPED MECHANIC**, confidence HIGH unless noted:

| Interaction | Direction | Source |
|---|---|---|
| Rival Stars appear in the player's Stage School queue, "in numbers and stature proportional to your studio's rating", PA-announced, glowing aura, arriving with rating/age/Mood/genre experience and expecting salary/trailer/entourage to match | rival → player | Prima p.8 (300–323); Prima p.46 "number and stature of rival studios' Stars ... proportional to Studio rating" (2800–2801); GameSpot walkthrough "stars that attempt to join you from a rival studio"; GameFAQs Maxx 609–618 |
| Caption: rival Stars "try to defect to your studio once you have the smell of success" | rival → player | Prima p.8 (314–315) |
| Mistreated player Stars "seek greener pastures at another studio" and "walk right off the lot" | player → rival | Manual p.15 (374–386) |
| Fired Stars "wander off the lot and are immediately hired by other studios" / "march off the lot and join a rival studio" | player → rival | Prima p.8 (279–280); Prima p.20 (1158) |
| Star & Script Selling Facility: "auction the Star off to your competitors", value by rating, drops after age 55; scripts sold to "other studios" by script rating | player → rival (for cash) | Manual p.17 (427–430); Prima p.8 (282–284), p.20–21 (1168–1204) |
| Hired rival Stars "don't reach their proper market value until they've been with your studio for eight years" | — | Prima p.21 (1197–1198), PRIMA EVIDENCE only |
| Retirement: Stars retire and vanish from Star cards (not a transfer) | — | GameFAQs Maxx 620–622; manual p.15 |

Not documented in any retail source: contract bidding, poaching an employed rival Star on demand, buying a rival's Star, in-term contract breaking, or a rival buying a player Star except through the player's own sell action. Whether rivals exchange Stars among themselves is not stated.

**Verdict on P15 §5.3 (talent movement):** CONFIRMED.

### 5.3 Research as rival-relative advantage

Prima p.16 (918–924): early research gives "access to its contents before most of the rival studios" — "most of" implies rivals could also research early. Prima p.85 (5484–5490): "Each pack becomes accessible to every studio simultaneously on its unlock date ... So too will all the rival studios." Manual p.23: research "opens up new technology faster than your rivals". **Verdict on P15 §5.3 (research):** CONFIRMED; the "most of" wording is a small qualification — rivals were not proven to be passive on research.

---

## 6. Awards and cross-studio comparison

**RETAIL SHIPPED MECHANIC, HIGH.** Manual p.22 (536–560): ceremony "Every five years"; awards "for your movies, Stars and studio achievements"; bonuses last five years. Prima pp.77–78 (4899–5020): held "every five years beginning in 1925", awards "handed out in a variety of categories to all studios in the industry"; first ceremony hands out three awards, one new award added per ceremony "through 1975". Award Directory (p.78) — studio-vs-studio categories:

| Award | Introduced | Criterion (cross-studio) | Bonus |
|---|---|---|---|
| Highest Charting Studio | 1925 | studio at the top of the Studio Charts on ceremony date | Half Price |
| Most Prestigious Studio Lot | 1930 | highest Lot Prestige at ceremony | Age of Discovery (+20% research) |
| Highest Climbing Studio | 1935 | biggest Studio Charts leap since last ceremony; tie → higher rating | Party On |
| Best Employer | 1945 | highest average Star Mood since last ceremony | Brainwasher |
| Most Prolific Studio | 1960 | most releases since last ceremony | Free Love |
| Movie Quality Output | 1975 | highest total Final Movie Ratings since last ceremony | On the Radar |

Star/Movie categories (Highest Charting Star/Movie/Newcomer, Most Prolific Star, Best Direction, Best Acting, Highest Climbing Star) are also industry-wide. Prima's Platinum walkthrough (pp.81–83) treats rivals as live award competitors ("Move less and another studio could get the award", "Hopefully none of the rival studios will have risen more than two places"). Rivals were therefore award-winners in their own right — HIGH.

**Achievement Awards (Prima pp.79–80, 5030–5120):** nine sequential certificates (Wannabe Big Cheese → Movie-Making Legend), several requiring a 2/3/4/5-star **Studio rating**; these are self-referential milestones, not rival comparisons. **Lifetime Honors (p.80–81):** the game "reward-wise, ends" at the 2005 ceremony but may be played past it; Gold = all nine Achievement Awards; Platinum = Gold plus prescribed per-category ceremony-win counts (e.g. Most Prestigious Studio Lot ×13, Highest Charting Studio ×5) → Suburban: Diner set + bonus credits. No blended score.

**Verdict on P15 §5.4 (awards) and §5.6 (ending):** CONFIRMED.

---

## 7. Local CSV / register rows touching this topic (exact rows)

| File | Row | Content (paraphrase) |
|---|---|---|
| `ORIGINAL-DATA/source_conflicts.csv` | line 24, `CONFLICT_023` | Studio Rating five-component weighting 24/24/24/14/14, Capital curve $50k→$1.6M, midpoint ~$300k; Prima + 2 GameFAQs; `CONTESTED` label is the file's generic status |
| same | line 50, `CONFLICT_049` | five components with exact weights = 100%; IGN/GameSpot name components without weights (gap, not contradiction) |
| same | line 51, `CONFLICT_050` | Capital ceiling $1.6M (Prima) vs. ~$5M (a GameSpot-tier walkthrough) — genuine unresolved numeric conflict |
| same | line 55, `CONFLICT_054` | photographers/applicants/rival-Star defectors scale with Studio Rating (Prima closes a GameFAQs gap) |
| `ORIGINAL-DATA/ACTIVE-UNRESOLVED-QUESTIONS.csv` | line 11, `Q010` | Capital-component ceiling conflict, ACTIVE, MEDIUM priority |
| `ORIGINAL-DATA/all_reconciled_facts_appendix.csv` | lines 44, 128, 129, 130, 139 | same facts as above (FACT_043, _127, _128, _129 Stars diminishing weighting, _138 downstream scaling) |
| `ORIGINAL-DATA/award_directory.csv` | lines 3, 5, 6, 11 | Highest Charting Studio / Most Prestigious Studio Lot / Highest Climbing Studio / Most Prolific Studio criteria and bonuses (Prima, SETTLED) |
| `ORIGINAL-DATA/facility_catalog.csv` | line 21 | Star & Script Selling Facility $3,000, "sell surplus Stars/scripts to rival studios" (GameFAQs + GameSpot; note the manual p.17 and Prima p.20 also cover it) |
| `TECHNICAL-ARTIFACTS/schema_fields.csv` | line 8, `TECH-SCHEMA-007` | engine `[studio]` weights 0.239/0.239/0.239/0.144/0.144 (see §2.1 — I read this as corroborating Prima, contrary to the register's "numerically distinct" note) |
| `TECHNICAL-ARTIFACTS/dormant_or_unconfirmed_fields.csv` | all 7 rows | **none** touch rivals, studio rating, or bankruptcy (rows cover Cinema facility, [social], [karma], [smoking], [animal], [star] promiscuity, gatehouse) |
| `TECHNICAL-ARTIFACTS/technical_artifact_conflicts.csv`, `vanilla_diff_backlog.csv` | — | no rival/rating/bankruptcy rows |

The Mechanics Bible itself does **not** reproduce Prima's nine-rival table (no hits for the studio names); the P15 package's rival-table claim therefore rests directly on Prima, which is the correct primary.

---

## 8. Current accepted code (592e926) — quick cross-check

`src/core/reception.ts` line 596 comment "competitionFactor ≡ 1.0 (N11)" and line 679 `const competitionFactor = 1.0`: the competition term is an inert constant; no rival studio, shared genre saturation, or ranking exists in `src/`, `bridge/`, or `ui/src/engine/` (grep for rival-studio identifiers returned nothing). This matches the P15 package's "INERT PLACEHOLDER" and "no authoritative rival market" statements (P15 §9 rows). Original-game saturation is therefore entirely un-implemented today.

---

## 9. Consolidated verdicts on the prior P15 package

| P15 claim | Verdict | Note |
|---|---|---|
| Separate Studio/Star/Movie Charts; manual says they show standing vs. competitors and expose factors | CONFIRMED | manual pp.6, 21 |
| Studio Rating weights 24/24/24/14/14 from Prima | CONFIRMED | Prima pp.46–47, 51; plus modded-engine 0.239/0.144 vector |
| Genre interest responded to all studios' releases; world events shift taste; window/curve not recovered | CONFIRMED | Prima p.58, p.51 |
| Early research = temporary advantage; every studio gets the pack at unlock | CONFIRMED, QUALIFIED | Prima p.16 says "most of the rival studios" — rivals may research too |
| Rival Stars enter Stage School; unhappy/fired Stars join rivals; Stars/scripts sold to rivals | CONFIRMED | Prima pp.8, 20–21, 46; manual pp.15, 17 |
| Awards every five years comparing studios, films, people | CONFIRMED | manual p.22; Prima pp.77–78 |
| Nine named rivals in a ten-slot chart; several pre-1920; windows through ~1971 | CONFIRMED, QUALIFIED | "ten-slot" is an inference (9 + player), supported by the p.51 nine-row 1958 screenshot; not verbatim |
| No retail source establishes rival closure/merger/acquisition/replacement | CONFIRMED | zero hits at every tier incl. S&E manual and community wikis |
| GameSpot 2004 "goes bust" = pre-release only | CONFIRMED | Park, 23 Feb 2004; refers to the player's studio |
| E3 2002 First Look: acquiring competitors as growth path = pre-release only | CONFIRMED | Parker, May 2002, exact sentence recovered |
| Acquisition REFUTED as shipped | CONFIRMED | no retail hits |
| Co-production/merger/IP transfer/subsidiaries REFUTED as shipped | CONFIRMED | no retail hits |
| Original may continue after 2005; Gold/Platinum checklist, not a score | CONFIRMED | Prima pp.80–81 |
| *Stunts & Effects* did not redesign rivals | CONFIRMED | S&E manual p.10 only adds stunt awards as "an edge over your rival studios" |
| "Prima printed pp. 8, 45–59, 76–85" citation ranges | CONFIRMED | plus p.16 and p.20–21 (research; selling facility) which the package's range omits |
| Bible/register "1-10 rank badge ... low confidence" | CORRECTED | rank badge = chart position (observed "1" with star row beneath); 5-star pips = Studio Rating; two distinct displays |
| Technical register: `[studio]` weights "numerically distinct" from Prima | CORRECTED (my reading) | 0.239/0.144 are the unrounded 24%/14% weights; names differ, values agree |

---

## 10. Open uncertainties (no inspected source resolves)

1. Genre-saturation exposure window, decay curve, and recovery rate.
2. Whether rivals' releases had simulated quality/Success and how their chart/award standing was computed (same formula assumed, not proven; rivals do display 0–5 star pips).
3. Studio Charts recomputation cadence (continuous vs. periodic).
4. Exact opening rival count at 1920 (three or four, depending on Creamboat's 1916–1920 roll) and the player's starting rank.
5. Whether a rival ever leaves the chart for any reason — no evidence for, none against; Prima's framing implies permanence.
6. Capital ceiling $1.6M (Prima) vs ~$5M (contemporary walkthrough).
7. Whether rivals researched early (Prima's "most of the rival studios") and whether rivals traded Stars among themselves.
8. The fandom wiki's alternative rival windows and PA-announcement claim — community, contradicted by the 1958 screenshot on Boney Studios; treated as unreliable.
9. The 2004 preview's "contracts" bidding language never appears in retail sources; no evidence it shipped in any form beyond mood-driven defection.

---

## 11. Sources (with locators)

- Official manual, *The Movies* (Activision/Lionhead, QuarkXPress 27 Sep 2005; 22 PDF spreads): printed pp.6, 15, 17, 21, 22, 23. Local: `/Users/bruce/Desktop/big swing art/movies manual_english.pdf`; text `scratchpad/original-text/manual.txt` lines 110–131, 374–386, 427–430, 500–532, 536–588. URL: https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf
- Prima Official eGuide (Greg Kramer, Prima 2005; Lionhead-reviewed; 126 PDF pages, printed = PDF−1): pp.8, 16, 20–21, 44–47, 51, 57–58, 77–83, 85. Local PDF and `scratchpad/original-text/prima.txt` lines 268–330, 918–928, 1150–1204, 2689–2712, 2766–2910, 3140–3210, 3553–3700, 4865–5185, 5215–5300, 5484–5490. URL: https://archive.org/details/The_Movies_Prima_Official_eGuide
- *Stunts & Effects* manual (Apr 2006 print, 10 PDF pages), p.10 "New Awards" — fetched this pass, text at `scratchpad/se-manual.txt` line 285. URL: https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/7910/manuals/The_Movies_Stunts_Effects_Manual.pdf
- GameSpot, "E3 2002: First Look: The Movies", Sam Parker, May 2002 (pre-release): https://www.gamespot.com/articles/e3-2002-first-look-the-movies/1100-2866856/
- GameSpot, "The Movies Preview", Andrew Park, 23 Feb 2004 (pre-release): https://www.gamespot.com/articles/the-movies-preview/1100-6089840/
- GameSpot, "The Movies Walkthrough", Mathew Rorie, 19 Nov 2005 (retail): https://www.gamespot.com/articles/the-movies-walkthrough/1100-6140049/
- GameSpot, "The Movies Review", Ryan Davis, 9 Nov 2005 (retail): https://www.gamespot.com/reviews/the-movies-review/1900-6139475/
- GameFAQs FAQ by Maxx (v0.24, 2005–2008), §VII Studio Rating and Rivals: `scratchpad/original-text/gamefaqs-maxx.txt` 2189–2420, 605–625 — https://gamefaqs.gamespot.com/pc/561567-the-movies/faqs/45308
- GameFAQs Guide by Mark_E_1990 (2006), §4.5 and awards list: `gamefaqs-mark.txt` 945–1025 — https://gamefaqs.gamespot.com/pc/561567-the-movies/faqs/41120
- gamepressure, "Improving the Studio" (2005–06): `gamepressure-improving.txt` — https://www.gamepressure.com/themovies/improving-the-studio/z9270
- the-movies-game.fandom.com, Category: Rival Studios and "Old Rope Cinema" (community): https://the-movies-game.fandom.com/wiki/Category:Rival_Studios
- gamicus.fandom.com, "The Movies" (community): https://gamicus.fandom.com/wiki/The_Movies
- forceforgood.co.uk, "The Movies" retrospective (Rik, 8 Dec 2012, community): https://forceforgood.co.uk/strategy/the-movies/
- Local registers: `THE-MOVIES-2005-ORIGINAL-DATA/{source_conflicts,ACTIVE-UNRESOLVED-QUESTIONS,all_reconciled_facts_appendix,award_directory,facility_catalog}.csv`; `THE-MOVIES-2005-TECHNICAL-ARTIFACTS/{schema_fields,dormant_or_unconfirmed_fields,technical_artifact_conflicts,vanilla_diff_backlog}.csv`; `THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md` §23 (lines 2392–2440) and "Failure conditions" (2864–2866); `THE-MOVIES-2005-SOURCE-REGISTER.md` line 94.
- Directly observed: Prima p.51 Studio Charts screenshot (rendered `scratchpad/prima52-charts.png`); `/Users/bruce/Desktop/big swing art/Screenshot 2026-08-17 at 11.34.09 AM.png`.
- Accepted code snapshot 592e926: `scratchpad/accepted-592e926/src/core/reception.ts` lines 596, 679, 702.
