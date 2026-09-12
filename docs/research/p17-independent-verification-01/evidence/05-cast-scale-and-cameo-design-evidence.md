# 05 — Cast-scale expansion over eras and the Celebrity Cameo mechanic: design-evidence dossier

**Task scope:** (1) optional cast-slot expansion over eras (owner direction T) and (2) Cameo as a mechanic (owner direction U). Read-only research; no repo edits, branches, builds, tests or runtime. Repo facts read at the accepted P12 closeout commit `13370d428f0693f3279732f6f4cc360a7fcaa4df` via `git show`. Original-game facts from the corpus text extractions (manual, Prima, community). Web facts labeled by tier.

**Source-line convention (under every major claim):** `source; locator; what it proves; confidence; tier`.

---

## 0. Headline

The engine already separates fame from craft cleanly (fame feeds `starDraw`/`starAttention`; acting skill and persona fit feed `castExecution`/cohesion), and the original 2005 game did the same while pricing star concentration with diminishing per-rank star power and an explicit opportunity cost. Both facts make a bounded Featured/Cameo class cheap to reason about and expensive to spam by construction. Expanding the number of NAMED principal seats, by contrast, is the costly dimension: the three-seat `CastSlot` union is hard-coded in roughly 96 core lines (26 files), 53 non-test UI lines (about 20 files), rival package search (`n!` billing permutations), the frozen `FilmParticipants` record, and the casting-session slate law. The recommended path is therefore: keep the three required principal seats frozen; add optional seats as bounded OPTIONAL ARRAYS (not a widened union); gate seat capacity by era in P13; put the role classes, fame, non-actor professions, cameo fees and availability in P14; put the fame-value/performance-value split in P07 reception (with the awareness term in P08); and reserve ensemble/crossover value for later P17 scope.

---

## 1. Engine facts verified at the closeout commit

| # | Fact | Locator (all at `13370d42…`) |
|---|---|---|
| E1 | `CastSlot = 'lead' \| 'antagonist' \| 'support'` — exactly three principal seats; `CreativeRole = writer\|director\|actor\|craft` (no musician/athlete/TV profession exists) | `src/core/types.ts:18-19` |
| E2 | `FilmConcept.requiredSlots: CastSlot[]`, `roleRequirements: Record<CastSlot, RoleRequirement>`; worldgen and screenplay mint always set all three via `SLOT_ORDER` | `src/core/types.ts:161-162`; `src/core/worldgen.ts:613`; `src/core/screenplay.ts:194`; `src/core/tuning.ts:1712` (`SLOT_ORDER`) |
| E3 | `Talent.fame` = 0..100 "STAR POWER (unchanged; separate from OVR)"; the sim reads ONLY `effectiveSkill`, `roleFit` (persona) and `fame` — never OVR/Fit/EP | `src/core/types.ts:114`; `src/core/talentSummary.ts:6-8` |
| E4 | `CAST_WEIGHT = { lead: 1.0, antagonist: 0.6, support: 0.35 }` | `src/core/tuning.ts:1657` |
| E5 | `starDraw = 100·clamp(Σ CAST_WEIGHT·fame/100 / Σ CAST_WEIGHT)`; opening-only `starDrawOpening` uses Hill-saturated `fameReach(fame) = f/(f+50)`; `starDraw` enters every segment's appeal at weight 0.25 beside craft 0.35, fit 0.25, timeliness 0.15 | `src/core/reception.ts:493-507, 519-540`; `src/core/economy.ts:17-20`; `src/core/tuning.ts:418` (`FAME_REACH_HALF_SAT: 50`) |
| E6 | `castExecution = Σ CAST_WEIGHT·(0.60·effectiveSkill + 0.40·100·roleFit)/Σ CAST_WEIGHT` (acting skill + persona fit, no fame); craft = 0.3 script + 0.25 director + **0.2 castExecution** + 0.15 technical + 0.1 budget + mods | `src/core/reception.ts:233-251, 284-296`; `src/core/talentSummary.ts:304-324` (`castSlotExecution`) |
| E7 | Cohesion centroid over `ROLE_WEIGHT = {writer 1.0, director 1.6, lead 1.4, antagonist 0.8, support 0.5, shape 1.2}` with `SLOT_TRANSFORM` (antagonist reverses intimacy only) | `src/core/tuning.ts:1671-1684`; `src/core/reception.ts:311-371` |
| E8 | `starAttention = mean(lead, antagonist, support fame)/100` (unweighted) → secondary awareness term at `AWARENESS_STAR_WEIGHT 1.2` vs reach weight 7, per-release cap ±6 | `src/core/standing.ts:62-78, 170-174`; `src/core/tuning.ts:108-110` |
| E9 | Salary = `25,000 + 150,000·(OVR/100)² + 600,000·(fame/100)²` — fame already dominates price (fame-100 = $775k; skill-100/fame-0 = $175k) | `src/core/worldgen.ts:161-167`; `src/core/tuning.ts:71-73` |
| E10 | Star Power progression (D-14) uses frozen role-visibility weights `lead 1.0, antagonist 0.7, director 0.55, support 0.45, writer 0.35, craft 0.2`; per-film gain cap +10, loss cap 4; only established stars lose | `src/core/tuning.ts:546-577` |
| E11 | Casting Sessions V1: `CASTING_CANDIDATES_PER_ROLE = 2`, `CASTING_MIN_UNIQUE_CANDIDATES = 3`, `CASTING_SESSION_WEEKS = 1`, one shared facility slot, no fee; slate law requires exactly 2 distinct candidates per slot and ≥3 distinct people overall; results are `Record<CastSlot,[AuditionResult,AuditionResult]>` | `src/core/tuning.ts:1659-1668`; `src/core/castingSessions.ts:40, 121-142, 380-395`; `src/core/types.ts:761-772` |
| E12 | `FilmParticipant` (8 fields) ≈ 257 bytes JSON; `cast` (3) ≈ 808 bytes; whole `participants` ≈ 1,629 bytes; stored on the Production AND frozen on `FilmResult` | measured from `ui/e2e/p11-core-v4/s13-p11-release-ready.save.json` (`/state/studio/activeProductions/0`); `src/core/types.ts:206-222, 238, 259` |
| E13 | Production duration is a flat `PRODUCTION_TICKS = 8`, independent of cast size | `src/core/tuning.ts:57`; `src/core/actions.ts:477` |
| E14 | Rivals (P12) need exactly three idle actors to greenlight (`actors.length===3`) and evaluate `BILLINGS` = all 3! = 6 permutations of lead/antagonist/support (× 6 `SHAPES` when the screenplay is not locked) through the full forecast | `src/core/hollywoodTick.ts:148-154`; `src/core/hollywoodPolicy.ts:10-18, 36-39` |
| E15 | No pairwise relationship/chemistry model exists in core today; roadmap reserves `relationships/promises` for P14 as "Sparse, evidence-linked facts; not a full N² matrix"; `EraConfig` is a frozen leaf P13 must not widen | grep of `src/core` for relationship/chemistry (only comments); roadmap `docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md:241, 255` on `hspector-github/codex/p13-p15-long-range-research-01` |
| E16 | The three-seat set is hard-coded in ~96 non-test core lines across 26 files and 53 non-test UI lines across ~20 files; the Assembly screen renders cast pickers in a `grid grid-3`; the film poster's billing block shows only "Directed by" + "Starring {lead}" and then a full `<dl>` of all participants | `git grep -c antagonist 13370d42 -- src/core` / `-- ui/src` (see §4.3); `ui/src/screens/Assembly.tsx:1324-1349`; `ui/src/components/FilmPoster.tsx:41-48, 119-128, 168-176` |

Source line (whole table): repository at closeout commit; locators above; proves the current casting/reception/persistence law; confidence HIGH; tier SHIPPED RETAIL (project code as accepted).

---

## 2. Film-history data points (cast scale, all-star marketing, billing)

Kept to ten. Historical pattern only; design inference is in §4-5.

1. **Studio-era norm: one or two big names per picture.** "At the time, studios rarely assigned more than two big names to the same script." Star vehicles were built around one contract star; the era's money-makers were two-star pairings (Astaire–Rogers, Gable–Crawford, Powell–Loy).
   Source: The Music Hall, "Classic Hollywood: Grand Hotel" (https://www.themusichall.org/blog/classic-hollywood-grand-hotel/), quoted sentence; Wikipedia "Star vehicle" and "Star system (filmmaking)" for pairings; proves the pre-1932 principal cast norm was 1-2 stars; confidence MEDIUM (secondary popular history, consistent across sources); tier OBSERVED HISTORY.

2. **Grand Hotel (1932) invents the "all-star cast" as an EVENT.** Thalberg: "What if we had an all-star cast check into Grand Hotel? Then it wouldn't 'just' be a movie – it would be an event." Five MGM stars above the title (Garbo, John Barrymore, Crawford, Beery, Lionel Barrymore) plus Stone and Hersholt; advertised as "the greatest cast ever assembled"; budget $750,000, gross $2,594,000, profit ≈ $947,000; Best Picture.
   Source: filmsite.org/grandhotel.html (advertising line, "first major use of a large all-star cast in a non-musical, narrative film"); Wikipedia "Grand Hotel (1932 film)" (cast, budget, gross, profit); EBSCO Research Starters ("first of the vehicles to showcase a studio's top talent… This trend continued during the 1960's and 1970's but later grew too expensive"); proves 5-7 named stars as a marketing device dates from 1932 and was profitable; confidence HIGH; tier OBSERVED HISTORY.

3. **"Cameo" as a marketed device is a 1956 invention.** Mike Todd coined "cameo" for *Around the World in 80 Days* (1956) to distinguish surprise bit parts by major stars from bit parts by unknowns; 44 star appearances, a companion book with a cameo emblem beside each; Best Picture.
   Source: Wikipedia "Mike Todd" and TV Tropes/Tropedia trivia pages for the film (via search summary); proves the cameo-as-publicity concept has a specific historical start and was explicitly about attention rather than performance; confidence MEDIUM-HIGH; tier OBSERVED HISTORY.

4. **The Longest Day (1962): dozens of stars, most in near-cameo roles, at flat fees.** "A large international ensemble cast, many of whom play roles that were essentially cameo appearances"; contemporary marketing counted 42 (some sources 43-48) international stars; "all the other major actors accepted $25,000 as payment" except John Wayne ($250,000); budget $7.75-10M; $30.5M worldwide rentals, then the highest-grossing black-and-white film.
   Source: Wikipedia "The Longest Day (film)" (quoted lines, fees, budget, rentals); Comet Over Hollywood / UCLA Film Archive event page (42-star count); proves large star counts were compatible with low per-name fees when the role was small — the salary-per-name structure, not the name count, controls cost; confidence HIGH on fees/gross, MEDIUM on the exact star count; tier OBSERVED HISTORY.

5. **1970s disaster cycle industrialises the all-star formula.** *Airport* (1970: Lancaster, Martin, Bisset, Kennedy, Hayes) and Irwin Allen's *The Towering Inferno* (1974: McQueen, Newman, Holden, Dunaway, Astaire, Jones, Chamberlain, Wagner…); Inferno cost $14M, earned ≈ $203.3M worldwide, highest-grossing film of 1974, and introduced "staggered but equal" diagonal billing so McQueen and Newman each appear first.
   Source: Wikipedia "The Towering Inferno" (budget, gross, billing quote); CrimeReads "A Brief History of 1970s Disaster Movies" (Airport cast); proves (a) ensemble marketing scaled to 8-10 names, (b) top billing remained a 2-name contest even in a 10-star film; confidence HIGH; tier OBSERVED HISTORY.

6. **Above-the-title billing normally counts two or three names.** "The two or three top-billed actors in a movie will usually be announced prior to the title of the movie; this is referred to as 'above-title billing'… For an actor to receive it, he/she will generally have to be well-established, with box-office drawing power." Major actors doing cameos "may… only [be] noted within the other cast during the end credits."
   Source: Wikipedia "Billing (performing arts)" (quoted); Deseret News 2001 "Name above or below title?" (above-title = "can open a picture"); proves the public-facing "principal" count is 2-3 regardless of cast size, and that cameo credit is deliberately low-visibility; confidence HIGH; tier OBSERVED HISTORY / CONTEMPORARY PROFESSIONAL SOURCE.

7. **Ocean's Eleven (2001): ensembles are paid for with below-rate deals.** "The large ensemble required several stars to accept pay cuts from their usual going rate"; Clooney: "if we all get paid, we can't make the movie, so why don't we all just take a big chunk of the backend, work cheap"; $85M budget → $450.7M gross.
   Source: Wikipedia "Ocean's Eleven"; Moviefone "13 Things You Didn't Know About Ocean's 11"; proves the modern all-star cast is economically feasible only when per-name fees fall below each star's solo rate — i.e., the fee law, not the seat count, is the binding constraint; confidence HIGH; tier OBSERVED HISTORY.

8. **The Avengers (2012): ensemble as CROSSOVER.** Marvel's "first true ensemble crossover" combined six previously separate leads; $207M opening, $623M domestic, $1.519B worldwide.
   Source: Wikipedia "The Avengers (2012 film)"; Forbes (Mendelson, 2022) ten-year retrospective; proves the strongest modern reason for ≥4 principal seats is franchise crossover value, not generic ensemble value — which maps to P17's later crossover scope (direction O); confidence HIGH; tier OBSERVED HISTORY.

9. **Star power moves revenue, not profit.** Elberse (2007, *Journal of Marketing*): stars are worth "approximately $3 million in theatrical revenues" on average; "while big stars have little influence on profitability, they do influence revenue and how it is divided."
   Source: HBS Working Knowledge summary "The Box Office Power of Stars" (https://hbswk.hbs.edu/item/the-box-office-power-of-stars) and the article record (https://www.hbs.edu/faculty/Pages/item.aspx?num=23770), via search summaries (direct fetch returned 403); proves fame value should be modelled as attention/revenue with cost roughly offsetting it — precisely the "indirect economics" rule R; confidence MEDIUM (academic finding, quoted through a summary); tier CONTEMPORARY PROFESSIONAL SOURCE.

10. **Famous non-actors: attention is reliable, craft is not.** *Space Jam* (1996, Michael Jordan lead): $230M on $80M with Rotten Tomatoes 37% — fame filled seats despite reviews. *King Arthur* (2017, David Beckham cameo): press attention ("Is that David Beckham?") but "shows just about enough dramatic range to have played the stone the sword got stuck in" (Telegraph), "a misguided, fist-biter of a performance" (Empire), "the worst thing about" the film (New Statesman) — the cameo was a distraction and the film flopped. *Battleship* (2012, Rihanna): publicity plus "the only real weak spot in the cast"; $65M domestic vs $248M overseas. *The Hangover* (2009, Mike Tyson): "unexpectedly stole the show."
   Source: Wikipedia "Space Jam" (gross, RT); New Statesman 2017 and Al Arabiya/Arab News 2017 (Beckham quotes and director's defence); Hollywood Chicago / CheatSheet on Battleship; SlashFilm on Tyson; proves fame value and performance value are independent and can be opposite-signed in the same appearance, and that audience-fit (Rihanna's fans; Tyson in a comedy) mediates whether the attention converts; confidence HIGH on the facts, MEDIUM on the causal reading; tier OBSERVED HISTORY.

---

## 3. Comparator games

### 3.1 The Movies (2005) — the direct ancestor (developer-reviewed Prima + official manual)

- **Cast size scaled with script tier, not with the calendar.** Basic Script Office: "one-star scripts featuring one lead role, no more than one extra"; two-star: "one or two lead roles"; Proficient: "two lead roles, two to three extras"; First Class: "two or three lead roles, three to five extras"; Custom Scriptwriting Office "can require up to four Stars (one director, one lead actor, and two supporting actors)."
  Source: Prima eGuide extraction `The_Movies_Prima_Official_eGuide.txt:392-397, 1087-1092, 1120-1158`; proves the original treated seat count as a CAPABILITY that grew with studio progression (not a requirement), and capped named acting seats at three; confidence HIGH; tier DEVELOPER-REVIEWED PRIMA.
- **Extras were a separate non-star class affecting only script quality.** "Extras impact movie quality only indirectly through Script Quality. The number of extras in a script can add up to half a star to Script Quality."
  Source: Prima `:603-605`; proves a bounded, low-weight "featured" class already existed with a hard ceiling on its quality contribution; confidence HIGH; tier DEVELOPER-REVIEWED PRIMA.
- **Fame ≠ skill was explicit.** Performance (quality) "is a product of each Star's Mood, genre experience, and suitability for a certain genre"; success "depends in part on its collective Star power"; Star rating is a 9-factor composite — Movie Success 18%, Salary 14%, Performances 14%, Image 10%, Entourage 10%, Trailer 10%, Press 10%, Relationships 7%, Awards — i.e., largely purchasable publicity.
  Source: Prima `:355-372` (performance vs star power), `:4693-4760` and following (nine factors and weights); proves the ancestor separated craft from fame and let fame be bought with salary/entourage/press; confidence HIGH; tier DEVELOPER-REVIEWED PRIMA.
- **Star power had DIMINISHING PER-RANK contribution.** "The highest-rated Star in a film will have the largest proportion of his or her Star rating count toward star power, and each subsequently rated Star contributes a lower percentage of his or her Star rating."
  Source: Prima `:3587-3598`; proves the anti-spam shape "diminishing beyond the top names" is a shipped precedent, not a novelty; confidence HIGH; tier DEVELOPER-REVIEWED PRIMA. (The Mechanics Bible `:1962` restates this for the studio Stars sub-score; SECONDARY, consistent.)
- **Opportunity cost was the intended limiter.** "assigning several high-powered Stars to a single film limits the number of films you can make at once. For example, dropping three top 10 Stars in one movie rather than one each in three simultaneously shooting films will likely result in a successful movie but at the cost of the constant income stream."
  Source: Prima `:369-375`; proves the ancestor relied on scheduling/opportunity cost rather than caps; confidence HIGH; tier DEVELOPER-REVIEWED PRIMA.
- **Pairwise chemistry existed at three-actor scale.** "the level of the relationships between each actor and the director and between each pair of actors adds to the movie's overall chemistry."
  Source: Prima `:360-362`; manual `movies_manual_english.txt:337-339` (Relationships); proves n(n-1)/2 pair effects were tractable only because n ≤ 3 (+director); confidence HIGH; tier DEVELOPER-REVIEWED PRIMA / OFFICIAL MANUAL.
- **No cameo mechanic** exists in any corpus source (zero hits for "cameo" across manual, Prima, both GameFAQs guides, gamepressure).
  Source: grep of the five corpus extractions; proves cameo is new design territory relative to the ancestor; confidence HIGH; tier SHIPPED RETAIL (absence).

### 3.2 Hollywood Animal (Weappy, 2025 Early Access)

- Professionalism-vs-script mismatch DAMAGES quality: "If you cast an actor with a professionalism level of 3 in the protagonist role of a movie with a quality level of 7… the overall quality of the film will almost certainly decrease"; conversely a great actor lifts a weak script "to an extent."
  Source: Outsider Gaming guide (https://outsidergaming.com/hollywood-animal-guide-strategies-how-to-make-money/), quoted; proves a comparator lets under-skilled casting subtract from quality — relevant to "can a poor-acting cameo damage quality"; confidence MEDIUM; tier COMMUNITY INFERENCE (guide, not developer text).
- Stardom is modelled separately from talent and can be arbitrary: "Stardom happens somewhat arbitrarily—an actor is either a rising talent, star, etc., or isn't, regardless of how many high-quality movies they appear in"; a starting actress "trying to push her stardom despite being mediocre talent."
  Source: TV Tropes "Hollywood Animal" page (via search summary; direct fetch 403); proves fame ≠ skill is an accepted comparator premise, and that opaque fame is a criticised failure mode; confidence LOW-MEDIUM; tier COMMUNITY INFERENCE.
- Tier-mixing friction: "The A-lister, naturally, refused to share a frame with such peasantry" (A-lister vs D-lister).
  Source: Game8 Early Access review (https://game8.co/reviews/hollywood-animal/hollywood-animal-review-early-access); proves a relationship/status friction can act as a natural ensemble limiter; confidence MEDIUM; tier CONTEMPORARY PROFESSIONAL SOURCE.

### 3.3 Moviehouse (2023)

- Audiences react to recasting in sequels/reboots (relevant to direction F, not to cameo); reviewers found the talent system shallow ("all 10-12 skills obtained fast").
  Source: GamingTrend, GameLuster, Use a Potion reviews (search summary); proves comparator handles continuity-casting reaction but offers no fame/cameo model worth copying; confidence MEDIUM; tier CONTEMPORARY PROFESSIONAL SOURCE.

### 3.4 Mad Games Tycoon 2 — "legendary" staff

- Legendary employees give a slow "hype" (awareness) bonus independent of output quality; experienced players call them "Newbie Traps" because their cost is disproportionate and publisher ad campaigns substitute for the hype.
  Source: Steam community Hard Mode guide and discussions (search summary); proves that a fame-only bonus that is NOT priced against opportunity cost degenerates into either a trap or an exploit — the exact failure the cameo design must avoid; confidence MEDIUM; tier COMMUNITY INFERENCE.

---

## 4. Part 1 — Cast-slot expansion: cost analysis per shape

### 4.1 Cost dimensions (formulas in Project: Studio terms)

Let `n` = number of named principal seats (3 today) and `f` = number of Featured/Cameo entries (0-2 proposed).

| Dimension | Formula / mechanism | Locator |
|---|---|---|
| Casting workload | audition reads per session = `2·n` (+ `2·f` if cameos audition; recommended: cameos do NOT audition, see §5); minimum distinct people = `n` | E11 |
| Salary cost | each principal adds a full per-production salary `25k + 150k·s² + 600k·f²`; sum enters `committedCost` → ROI → commercialConfidence | E9; `src/core/standing.ts:83-92`; `src/core/hollywoodTick.ts:252` |
| Relationship pairs (future P14) | actors only `n(n-1)/2`; with director `n(n+1)/2`; roadmap requires a sparse graph, not N² | E15 |
| Production duration | none today (flat 8 ticks); any per-seat shoot-week cost would be new P05/P13 law | E13 |
| Screen readability | Assembly: `n` TalentPicker cards in a 3-column grid; slate planner: `2·n` candidate buttons; poster credits `<dl>`: `2 + n + craft` rows; poster billing stays "Starring {lead}" | E16 |
| Save/projection size | +≈257 B per seat per film in `participants` (stored twice: Production and FilmResult) + ≈30 B in `cast` id map + ≈2×70 B per seat in casting results while a session exists | E12 |
| Rival abstraction | rivals need `n` idle actors AND permute billing `n!` ways per candidate package (×6 shapes when unlocked) | E14 |
| Fame publicity | `starDraw` mean over `CAST_WEIGHT`; `starAttention` unweighted mean — both change meaning if the denominator grows | E5, E8 |

Source line: engine locators above; proves each cost has a concrete carrier in code; confidence HIGH; tier SHIPPED RETAIL (project code).

### 4.2 Cost table per candidate shape

Assumptions for the arithmetic: fame-priced example star `s=0.7, f=0.9` → $584,500; mid actor `s=0.6, f=0.5` → $229,000 (E9). Save figures per film use E12. "Union widening" means adding members to `CastSlot`; "array" means an optional bounded `FilmParticipant[]` beside `craft`.

| Shape | Audition reads / min people | Added salary per film (mid actor) | Pairs (actors / +director) | Rival permutations (locked screenplay) | Poster/credit rows | Save Δ per film (both copies) | Type surface touched | Ensemble/crossover value |
|---|---|---|---|---|---|---|---|---|
| **3 (status quo)** | 6 / 3 | — | 3 / 6 | 6 | 6 + craft | — | none | none beyond today |
| **4** (3 + Additional Principal) | 8 / 4 | +$229k (+$585k if a star) | 6 / 10 | 24 (if permuted) | 7 + craft | ≈ +0.6 KB | union widening = every `Record<CastSlot,…>` (~96 core + 53 UI lines); array = ~15 sites | enables a two-lead crossover (two iconic leads + antagonist + support) |
| **5** (3 + 2 Additional) | 10 / 5 | +$458k (+$1.17M stars) | 10 / 15 | 120 | 8 + craft | ≈ +1.2 KB | as above, plus a 5-card grid breaks `grid-3` rhythm (3+2) | Avengers-style 3-lead crossover feasible |
| **6** (3 + 3 Additional) | 12 / 6 | +$687k (+$1.75M stars) | 15 / 21 | 720 | 9 + craft | ≈ +1.8 KB | as above; 6 cards = two full rows; slate planner = 12 buttons | full ensemble; no additional crossover value beyond 5 (direction N bounded branching) |
| **+ Featured/Cameo class (0-2)** | 0 extra reads (no audition; fee-based booking) | cameo fee = fraction of fame-priced salary (P14), e.g. 0.35 × $584.5k ≈ $205k per famous cameo | 0 (excluded from relationship pairs) | 0 (rivals fill greedily, never permute) | +0-2 rows, credited "with"/"and" at the end | ≈ +0.5 KB per cameo | separate optional array `featured?: FilmParticipant[]`; new `FilmParticipantRole` member 'cameo'/'featured' | publicity + crossover cameo hooks (a franchise lead cameoing in a spin-off) |

Source line: arithmetic from E9/E12/E14; proves that seats 5-6 add cost super-linearly (pairs, permutations, screen rows) while seat 4 and the Featured class are near-linear; confidence HIGH on the arithmetic, MEDIUM on the "value" column (design inference); tier DESIGN INFERENCE over SHIPPED RETAIL facts.

Notes on the table:
- Rival permutations are only a cost if the optional seats are permuted. A greedy policy (fill optional seats by fame×fit, never permute them) keeps rivals at 6 permutations for any `n`. `hollywoodTick.ts:148` (`actors.length===3`) must become `≥ 3` with optional-seat fill by policy weight — a P12 policy dimension (register SIM-009 already reserves dormant dimensions).
  Source: E14; CONTEXT.md architecture facts (P12 bounded policy weights); confidence HIGH; tier SHIPPED RETAIL / DESIGN INFERENCE.
- Save size is not the binding constraint: +1.8 KB per film × even 400 films ≈ 0.7 MB against a 296 KB single-production fixture; the 9.58 s Save p95 (CONTEXT.md) is driven by projection breadth, not by participants. The binding constraint is TYPE SURFACE: every `Record<CastSlot,…>` (concept role requirements, ShapeEffects.cast, FilmParticipants.cast, CastingSlate, CastingResults, StandingContext.castFames, ContribKey, ROLE_WEIGHT, SLOT_TRANSFORM, STAR_POWER_ROLE_WEIGHTS) and the migration of Save V19/projection 29.
  Source: E2, E7, E8, E10, E11, E12; confidence HIGH; tier SHIPPED RETAIL.
- Owner direction T says "A two-character drama must remain legal in 1995." Today NO two-character film is legal in any year: all three seats are required (`Assembly.tsx:188` returns null if any of lead/antagonist/support is missing; `assertCastingSlateLaw` demands all three pairs). Read charitably, T means "a small-cast film must remain legal when more seats exist." If the literal two-hander is wanted, that is a separate change to the frozen three-seat law with M0A byte-identity risk and is NOT recommended inside P17.
  Source: `ui/src/screens/Assembly.tsx:188`; `src/core/castingSessions.ts:121-142`; confidence HIGH; tier SHIPPED RETAIL; correction = DESIGN INFERENCE (minimal stress-test of T).

### 4.3 UI surface-area estimate (how three cast members render today)

Command run: `git -C "/Users/bruce/The Movies" grep -n "antagonist" 13370d428f0693f3279732f6f4cc360a7fcaa4df -- ui` → 595 matching lines in total; after excluding `*.test.*`, `*.spec.*` and e2e fixtures: **53 lines in ~20 non-test UI source files**. The concentrated sites:

| File | Lines | What it does |
|---|---|---|
| `ui/src/engine/adapter.ts` | 15 (`:555, 1649, 3151, 3294, 3426, 5645, 5710-5727, 5819-5872, 6578, 6644`) | `CAST_SLOTS` constant, contribution/alignment views, team-role labels, exclusion sets, presentation role mapping |
| `ui/src/screens/Assembly.tsx` | 7 (`:157, 188, 204, 244, 389, 530, 1208`) + picker loop `:1324-1349` | draft shape, legality gate, package journey, `SLOT_TITLES`, three `TalentPicker` cards in `grid grid-3` |
| `ui/src/screens/CastingSlatePlanner.tsx` | 4 (`:14, 23, 29, 126`) | `SLOT_LABEL`, empty/copy slate, 2-candidate tuple build |
| `ui/src/components/FilmPoster.tsx` | 2 (`:15, 45`) | `ROLE_LABEL`, frozen credit order; billing shows "Starring {lead}" only |
| `ui/src/screens/{Autopsy,FilmRecord,CastingRoom,TalentHub}.tsx` | 2/2/1/1 | role labels and credit order |
| `ui/src/lot/**` (`LotCastingReviewPanel.tsx`, `StudioLotScreen.tsx`, `snapshot/{StudioLotSnapshot,auditionPlanning,castingReview,presenceLines,productionCompany}.ts`) | 15 | lot-native casting review, presence lines, role unions in the snapshot contract |
| `ui/src/App.tsx`, `ui/src/engine/careerImpact.ts`, `ui/src/presentation/auditionEvidence.ts`, `ui/src/components/ConceptCard.tsx` | 6 | draft roles, career-impact role labels, evidence slots, concept card labels |

E2E golden manifests (`ui/e2e/p11-core-v{3,4}/manifest.json` 24 each, `p06-visual-oracle-v1` 16, `p05` 9, `lot-native-next-event-v1` 8) and dozens of `.save.json` fixtures also carry the three-seat shape; widening the union would invalidate or require regeneration of those oracles, whereas an additive optional array leaves them byte-identical.

Source line: the grep counts above; proves union widening touches ~20 UI files + ~26 core files + golden fixtures, while an additive array touches only the ~8 files that enumerate participants for display (poster, autopsy, film record, adapter credit builders, career impact); confidence HIGH; tier SHIPPED RETAIL.

### 4.4 Recommended bounded shapes (2-4) with pros/cons

**Shape A — "3 + Featured/Cameo (0-2)" (minimum viable; recommended first checkpoint).** Keep `CastSlot` and all three required seats frozen. Add `featured?: FilmParticipant[]` (bounded 0-2) beside `craft` on `FilmParticipants`, `ShapeEffects`, `GreenlightScriptProjectPayload`; add `'cameo'` (and optionally `'featured'`) to `FilmParticipantRole`. No audition; booked by fee. Pros: near-zero type surface; golden fixtures byte-identical; delivers direction U in full; rivals need no permutation change; poster credits gain an "and {name}" line. Cons: no crossover principal seat; the Additional Principal of direction T is deferred; era gating has only one lever (when Featured becomes available).
Ownership: capacity/era availability P13; role class, fee, availability P14; reception/awareness split P07/P08; segment fit P15.

**Shape B — "3 + 1 Additional Principal + Featured (0-2)".** As A plus one optional `additionalPrincipal?: FilmParticipant` (or a 1-element bounded array) with its own `RoleRequirement` minted at screenplay time only when the era capacity allows, weight `CAST_WEIGHT 0.45` (between antagonist and support), `ROLE_WEIGHT 0.6`, `SLOT_TRANSFORM` = support's, `STAR_POWER_ROLE_WEIGHTS 0.5`. Pros: enables a two-lead crossover (P17 later scope) and a legible "bigger picture" era step; pairs stay at 6/10; rivals fill greedily. Cons: every enumeration site (~8 UI + ~10 core) gains an optional branch; forecast/reception denominators change ONLY when present (byte-identical otherwise — a testable invariant); the Assembly grid becomes 3+1.
Ownership: as A, plus core casting owner for the new seat law and P12 for rival fill policy.

**Shape C — "3 + up to 2 Additional Principals + Featured (0-2)" (owner's full direction T).** Same mechanism as B with a bounded array of ≤2. Pros: three-lead crossovers; ensemble marketing legible ("all-star" flag when ≥4 names above fame threshold). Cons: 5-card Assembly grid (3+2) and 10-button slate planner at phone width; pairs 10/15 (P14 must keep relationships sparse — e.g., only among the three required seats + director); rival permutations must be explicitly disabled for optional seats; save +1.2 KB/film. Recommended only as the LAST era step after A and B have shipped and been reviewed.

**Shape D — "6 named principal slots by widening the `CastSlot` union" — NOT recommended.** Touches ~96 core + 53 UI lines, all `Record<CastSlot,…>` types, casting slate law (12 reads, 6 distinct people minimum), rival billing 720 permutations, e2e golden manifests, Save V19 migration; and the ancestor capped named acting seats at three (§3.1). No gameplay value beyond Shape C.

Source line: §4.1-4.3 facts; proves A and B are cheap and additive while C is bounded-but-costly and D is disproportionate; confidence HIGH on cost, MEDIUM on the value ranking; tier DESIGN INFERENCE.

Era gating (P13, not approved dates): the historical record supports "all-star" principal expansion from the early 1930s (Grand Hotel), the marketed cameo from the mid-1950s (Todd, 1956), and industrialised ensembles from the 1960s-70s (Longest Day, disaster cycle). P13 should expose `castCapacity: { additionalPrincipals: 0|1|2, featured: 0|1|2 }` as an era capability fact consumed by core casting; `EraConfig` itself must not be widened (E15).
Source: §2 items 2-5; roadmap `:241, 248`; confidence MEDIUM; tier OBSERVED HISTORY → DESIGN INFERENCE.

---

## 5. Part 2 — The Cameo mechanic

### 5.1 The proposed transparent split: FAME VALUE vs PERFORMANCE VALUE

The engine already has both halves; the proposal only names them and adds one bounded publicity channel for the Featured/Cameo class.

**FAME VALUE (publicity, opening-weighted, awareness):**
```
famous names = all cast (principals + cameos) sorted by fame desc, rank k = 1..
publicityPool = Σ_k fameReach(fame_k) · CAMEO_RANK_DECAY^(k-1) · segmentFit_k     (CAMEO_RANK_DECAY ≈ 0.5)
```
- Enters ONLY the opening-only term (`starDrawOpening` / `segmentAppealOpening`, reception.ts:500-507, 533-540) and `starAttention` (standing.ts:77-78) — never the linear `starDraw` that shapes legs and the whole-run segment appeal. Rationale: the historical record (§2 items 3, 4, 10; Elberse) shows cameos buy attention and opening, not retention.
- `fameReach` is the existing Hill saturation (`f/(f+50)`), so a fame-90 name is worth 0.643 and a fame-50 name 0.5 — the marginal value of adding fame is already concave.
- With decay 0.5 the pool is bounded by `2 × top name` no matter how many names are added: the 4th famous name adds ≤ 12.5% of the first, the 5th ≤ 6.25%. This is the Prima "each subsequently rated Star contributes a lower percentage" law (§3.1) made explicit.
- `segmentFit_k` (0..1) is the overlap between the person's audience and the film's target segments (see Q6).

**PERFORMANCE VALUE (craft, cohesion):**
```
castExecution = Σ_slot CAST_WEIGHT[slot]·castSlotExecution(...) / Σ CAST_WEIGHT     (unchanged)
with CAST_WEIGHT.cameo = 0.10 (vs support 0.35) applied per cameo when present
```
- Uses the existing `castSlotExecution = 0.6·effectiveSkill(acting) + 0.4·100·roleFit` (talentSummary.ts:304-324) so a famous non-actor is judged by acting skills and persona fit, exactly like a principal, but at a small weight.
- Cameos are EXCLUDED from the cohesion centroid (`ROLE_WEIGHT`) — a two-minute appearance should not move the film's delivered expression; this also keeps `computeContributions` untouched.

Worked example (E6 arithmetic): three principals executing at 70 each → castExecution 70.0. Add a fame-90 non-actor cameo executing at 25 (acting skill ≈ 20, poor role fit) at weight 0.10: `(1.95·70 + 0.10·25)/2.05 = 67.8`; craft falls by `0.2 × 2.2 = 0.44` points; criticMean by ≈ 0.29 (0.65·craft). Opening publicity rises by `fameReach(90)·0.5^(k-1)` where k is the cameo's fame rank in the cast — if it is the most famous name, k = 1 and the film's opening gets the full 0.643 contribution. Both numbers are small, legible, and opposite-signed — which is what the Beckham/Tyson/Rihanna record looks like.

Source line: E5-E8 engine formulas; Prima `:3587-3598`; §2 items 9-10; proves the split reuses existing law and matches both the ancestor and the historical pattern; confidence HIGH on the engine fit, MEDIUM on the tuning constants (starting points, not calibrated); tier DESIGN INFERENCE over SHIPPED RETAIL and DEVELOPER-REVIEWED PRIMA.

### 5.2 The seven questions

**Q1. Should Fame raise initial awareness/publicity?** Yes — and ONLY that. Fame already feeds `starAttention` → audienceAwareness (E8) and the Hill-saturated opening reach (E5). A cameo's fame should join the opening/awareness channel through the rank-decayed `publicityPool`, not the linear `starDraw`. Evidence: Todd's cameos (1956) and Zanuck's near-cameo stars (1962) were opening-event devices; Elberse finds star value in revenue, not profit; Space Jam filled seats despite reviews.
Source: E5, E8; §2 items 3, 4, 9, 10; confidence HIGH; tier SHIPPED RETAIL + OBSERVED HISTORY. Owner: P07 reception (opening term), P08 standing (awareness), P14 (fame source).

**Q2. Should acting skill still determine craft contribution?** Yes, unchanged in kind, small in weight. `castSlotExecution` already reads acting `effectiveSkill` and persona `roleFit`; the cameo enters at `CAST_WEIGHT.cameo = 0.10`. Comparator precedent: Hollywood Animal lets under-skilled casting lower film quality; the ancestor's Performance term was mood + genre experience + suitability (skill, not fame).
Source: E6; §3.1, §3.2; confidence HIGH; tier SHIPPED RETAIL + DEVELOPER-REVIEWED PRIMA + COMMUNITY INFERENCE. Owner: P07 reception; weight constant in core tuning.

**Q3. How small should cameo workload be?** One production week of availability (of the flat 8-tick production, E13), no audition (Casting Sessions V1 stays exactly three-slot), no casting-facility occupancy, no rehearsal. Modelled as a booking with a `busy` window (E14's `busyTalentIds`) rather than a role assignment: the person is unavailable to any other production for that week, which is the scheduling cost in Q7. Historical basis: Longest Day stars worked days for $25,000 flat.
Source: E11, E13, E14; §2 item 4; confidence MEDIUM (design choice); tier DESIGN INFERENCE. Owner: P14 (availability/contract), core casting (no slate change).

**Q4. Should cameo salary depend on Fame?** It already does: `salary = 25k + 150k·s² + 600k·f²` (E9) — fame is the dominant term (a fame-90 non-actor with acting OVR 30 prices at $524,500 per production). A cameo fee should be a FRACTION of that fame-priced salary (`CAMEO_FEE_FRACTION ≈ 0.35` → ≈ $184k for that person), never a flat fee, so publicity is bought at a price that scales with the publicity delivered. P17 changes no salary (rule R); the fee law is P14 contract + P11 cash.
Source: E9; §2 items 4, 7 (flat fees only worked when stars accepted below-rate deals); confidence HIGH on the existing law, MEDIUM on the fraction; tier SHIPPED RETAIL + DESIGN INFERENCE. Owner: P14 (fee law), P11 (cash/committedCost), P07 (none).

**Q5. Can a poor-acting cameo damage quality?** Yes, slightly and legibly: via `CAST_WEIGHT.cameo` in `castExecution` (Q2 example: −0.44 craft, −0.29 critic mean). It should NOT touch cohesion. Optionally a review-note reason ("a distracting celebrity appearance") when `castSlotExecution(cameo) < CAMEO_DISTRACTION_THRESHOLD` — presentation only. Historical: Beckham (panned, film flopped), Rihanna ("only real weak spot"), Tyson (stole the show) — the same device can go either way, which is exactly what a skill-weighted term produces.
Source: E6; §2 item 10; §3.2; confidence HIGH; tier SHIPPED RETAIL + OBSERVED HISTORY. Owner: P07 reception (+ newspaper/autopsy presentation).

**Q6. Should genre/audience fit matter?** Yes, on the FAME side (the craft side already has `roleFit` and genre experience via `effectiveSkill`, talentSummary.ts:265-267). `segmentFit_k` = overlap between the celebrity's audience profile and the film's segment shares (`MarketState.segments`, types.ts:281). For film actors the profile is derived from their released-film segment history; for non-actor professions (musician/athlete/TV personality — a P14 profession the current `CreativeRole` cannot express, E1) P14 supplies a small profession→segment affinity table (e.g., musician → youngAdult 0.8 / adult 0.4 / family 0.3 / prestige 0.1). A pop star cameo in a prestige drama therefore buys little publicity and still risks the Q5 craft hit — the Beckham/King Arthur pattern.
Source: E1, E5 segment loop, E6; §2 item 10; confidence MEDIUM; tier DESIGN INFERENCE. Owner: P14 (profession/audience profile), P15 (segment demand), P07 (the multiplication).

**Q7. How to prevent cameo spam?** By opportunity cost, not caps — three mechanisms in §5.3, plus the structural bound that the Featured class is an array of ≤2 (an era capacity fact, P13), which is a capacity not a rule.
Source: §3.1 (ancestor relied on opportunity cost), §3.4 (fame bonus without cost = trap/exploit); confidence HIGH; tier DEVELOPER-REVIEWED PRIMA + COMMUNITY INFERENCE.

### 5.3 Bounded anti-spam mechanisms (opportunity cost, no arbitrary caps)

1. **Rank-decayed publicity (diminishing beyond the top names).** `publicityPool` with `CAMEO_RANK_DECAY = 0.5`: the pool cannot exceed twice the top name's `fameReach`, and the marginal value of the k-th name is `0.5^(k-1)`. A third famous name adds ≤ 25%, a fourth ≤ 12.5%. Transparent (one exponent), inspectable on the forecast card ("publicity: 3 names, 4th adds +2%"). Precedent: Prima `:3587-3598`.
   Owner: P07 reception (formula), P08 (awareness consumes the same pool), P14 (fame inputs).

2. **Fame-priced fee against a bounded marginal return.** Because fee ∝ `600k·f²` (E9) while return ∝ `fameReach(f)·0.5^(k-1)`, the cost of the k-th cameo is constant in k while its value halves — a second famous cameo is already a losing trade for most films, and the forecast shows it (expected incremental opening vs committed fee, both already computed at greenlight: `forecastSnapshot`, `committedCost`). No rule needed; the ledger is the limiter.
   Owner: P14 (fee law), P11 (committed cost/ROI), P07 (forecast).

3. **Scheduling/availability cost.** A cameo books the person for one week and marks them `busy` for that week (E14 `busyTalentIds`), so a star cameoing in your film cannot lead a rival's (or your other) picture that week; for studio-contracted talent the cameo also consumes a production credit under the contract (P14 contract terms), so cameos compete with real roles for the same scarce star-weeks — the ancestor's "three top-10 Stars in one movie rather than one each in three films" cost (Prima `:369-375`).
   Owner: P14 (availability/contract), P12 (rival scheduling parity — rivals face the same busy law).

4. (Supporting, not primary) **Audience-fit mismatch** (Q6) makes off-segment cameos nearly worthless, and **tier friction** (Hollywood Animal's A-lister refusing to share a frame) can later be a P14 relationship fact — both are optional and should not be first-checkpoint.

Source line: E9, E14, E5; Prima `:369-375, 3587-3598`; §3.4; proves each mechanism is priced by an existing carrier (fame-priced salary, busy set, Hill saturation) rather than a new cap; confidence HIGH on mechanism 1-3 feasibility, MEDIUM on constants; tier DESIGN INFERENCE over SHIPPED RETAIL.

### 5.4 Package ownership matrix (every element)

| Element | Owner | Why |
|---|---|---|
| Era cast capacity (`additionalPrincipals`, `featured` counts by global week) | **P13** | era/technology/production capability; must not widen frozen `EraConfig` (roadmap `:241`) |
| Three required principal seats, casting-session law, Assembly legality, `CAST_WEIGHT` constants | **core casting owner** (frozen; any change is a core charter) | E1, E2, E11 |
| Role classes PRINCIPAL/SUPPORTING/FEATURED/CAMEO as credit categories on the person; fame; non-actor professions (musician/athlete/TV); audience profile; cameo fee law; availability/busy window; contract credit consumption; relationship pairs (sparse) | **P14** | person/contract/relationship/Fame authority (CONTEXT.md package ownership; roadmap `:146, 253-256`) |
| FAME VALUE (opening publicity pool), PERFORMANCE VALUE (`CAST_WEIGHT.cameo` in castExecution), quality damage, review-note reason | **P07** | film reception/outcome |
| `starAttention`/audienceAwareness consumption of the pool | **P08** | Standing owner |
| Segment demand/shares used by `segmentFit` | **P15** | shared market |
| Cash, committedCost, ROI of fees | **P11** | money |
| Rival parity (rivals fill optional seats greedily; same busy law; same fee law) | **P12** | bounded rival policy |
| Ensemble/crossover value of Additional Principals (two franchise leads in one film), cameo of a franchise-associated lead in a spin-off, "legacy cameo" as a continuity-history fact | **P17 (later scope, direction O)** | consumes public franchise-role association; P17 mints no cash, changes no salary (rule R) |
| TV/streaming guest appearances | **P18** | cross-media |

Source line: CONTEXT.md package-ownership paragraph; roadmap `:145-147, 241-256`; confidence HIGH; tier DESIGN INFERENCE anchored to the accepted ownership table.

---

## 6. Minimal stress-test of owner directions T and U

- **T (slots expand over eras; more slots = capacity, not requirement):** structurally sound IF implemented as optional bounded arrays with era capacity from P13, and IF rivals fill optional seats by policy rather than permutation. The one correction: the literal "two-character drama must remain legal" is not true today (three seats required) and should be read as "small-cast films must remain legal"; making `support` optional is a separate core change with byte-identity risk and is out of P17 scope.
  Source: §4.2 note; confidence HIGH; tier SHIPPED RETAIL + DESIGN INFERENCE.
- **U (cameo classes; fame ≠ skill; famous non-actors; prevent spam):** fully supported by the engine's existing fame/skill separation (E3, E5, E6) and by the ancestor (§3.1). The one gap: `CreativeRole` has no non-film profession (E1), so "famous non-actor" needs a P14 profession/audience-profile addition before any cameo checkpoint; the D-9 skill model already lets such a person carry low acting skills and high fame without any type change to `Talent`.
  Source: E1, `src/core/types.ts:44-60` (D-9 24-skill profiles on every talent); confidence HIGH; tier SHIPPED RETAIL.
- **Interaction with F (talent continuity by franchise importance):** a cameo must never count as a "recurring" franchise association of importance (tiny-role oversized effects are explicitly forbidden by F). Recommend P17's `keyRecurringTalentAssociations` read only PRINCIPAL/SUPPORTING credits (plus director/major creative) and treat 'cameo' credits as continuity flavour only ("legacy cameo" milestone, no salary/expectation leverage).
  Source: CONTEXT.md direction F; §5.4; confidence HIGH; tier DESIGN INFERENCE.

---

## 7. Open gaps

- Elberse (2007) was quoted through the HBS Working Knowledge summary; the journal abstract and HBS pages returned 403 — the "$3M per star, little profitability effect" figures are MEDIUM confidence until read from the article.
- Hollywood Animal's exact fame/professionalism mechanics could not be read from developer text (Steam/TV Tropes fetches 403; reviews describe A-list/D-list tiers and professionalism-vs-script-level effects only). Treated as COMMUNITY INFERENCE.
- The exact "42 international stars" count for The Longest Day varies by source (42-48); the Wikipedia article gives fees and gross but not the count.
- No shipped movie-tycoon comparator with an explicit cameo mechanic was found (searches over Movie Studio Tycoon, Movies Tycoon, Moviehouse, Hollywood Animal, MGT2 returned none); the cameo design here rests on engine fit + ancestor precedent + historical pattern, not on a comparator implementation.
- Unity projection (protocol 4 / projection 29) shapes were not inspected at the closeout commit beyond the UI snapshot role unions (`StudioLotSnapshot.ts:391, 827`); the projection-side cost of an optional participant array is assumed additive but unverified.
- All tuning constants proposed (`CAMEO_RANK_DECAY 0.5`, `CAST_WEIGHT.cameo 0.10`, `CAMEO_FEE_FRACTION 0.35`, one-week booking) are starting points for calibration, not owner-approved values; no dates for era capacity are proposed (direction T: "Not approved dates").
