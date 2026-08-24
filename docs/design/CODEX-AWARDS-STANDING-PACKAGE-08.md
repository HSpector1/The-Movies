# Project: Studio — Package 08: Awards, Studio Standing & Historical Milestones

**Status:** decision-ready research; documentation only

**Branch:** `codex/awards-standing-research-08`

**Canonical baseline:** `c902a704eb948cc576083d0973c8c23e59937dc1` (`hspector-github/main`, inspected 2026-08-24)

**Package boundary:** begins with the durable film result/history produced by Package 07; ends with award, standing, honor, record, and milestone facts suitable for a later 2040 Legacy finale. The finale and rival studios are out of scope.

**Binding interaction authority:** Package 02 at `f571a1d867b608a4a841773fc78eb6ed11696bb6`.

**Upstream result authority:** Package 07 at `da0312180730bf860b253fdfa6874ef749fd88d9`.

## Evidence notation

- **Verified** — directly supported by an original manual, the Prima guide, recovered data with provenance, or current repository law.
- **Observed** — directly visible in a shipped comparator or its official documentation.
- **Inference** — the most likely interpretation where evidence is incomplete; never presented as authoritative mechanics.
- **Recommendation** — the Project: Studio ruling. It does not describe code that already exists.

The base-game historical reconstruction uses the [official *The Movies* manual, printed pp. 22–23](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040) and the [Prima Official eGuide, PDF pp. 78–82 / printed pp. 77–81](https://archive.org/details/The_Movies_Prima_Official_eGuide). The local recovered corpus was cross-checked rather than treated as self-proving. One important correction results: the Prima screen order starts with **Wannabe Big Cheese**; a conflicting reconciled-fact row that places another certificate first is not adopted.

---

## 1. Executive decision

Project: Studio should treat this package as four related but non-interchangeable systems:

1. **Studio Standing** is the studio's current public/industry reputation. The existing three authoritative channels remain intact: Audience Awareness, Industry Prestige, and Commercial Confidence. There is no invented overall prestige score.
2. **Awards** are periodic, immutable recognition of eligible films and people. They require new TypeScript authority before any ceremony UI may claim a nominee or winner.
3. **Studio Progression** is a separate, future checklist/rank ladder that can unlock opportunities. It must not be smuggled into Standing or called an award.
4. **Studio History** is a sparse, durable chronicle of films, honors, records, careers, facilities, and genuinely significant milestones. It is the foundation a later 2040 Legacy finale consumes.

The central product ruling is:

> **Standing explains where the studio stands now. Honors explain what it achieved. History explains how it got here. None of the three is cash, and none substitutes for the others.**

The original *The Movies* got several high-level ideas right: a five-year awards cadence, a ceremony recap that remained available, durable win tallies, inspectable long-term rank goals, and visible studio consequence. It also made award logic opaque, mixed ceremony recognition with temporary global bonuses, and used progression checklists whose strongest strategy was often external guide knowledge. The modern successor should preserve anticipation and memory, but publish eligibility and consequences before the result.

There is a hard repository boundary. At the inspected baseline:

- Standing's current state and mutation laws exist and are mature; durable source/change history does not.
- Film results, theatrical history, talent career events, permanent studio events, Gazette/Chronicle projections, and a Studio Run Recap exist.
- Award eligibility, seasons, nominations, winners, effects, rank, certificates, and ceremony state do **not** exist.
- Blueprint requirement kinds for `rank`, `certificate`, and `award` are inert future seams which correctly fail closed.

Therefore the bounded next checkpoint is **P08A — Standing & Studio History Spine V1**, not a fake first ceremony. It proves the player-facing reputation and legacy grammar using existing truth, while leaving an exact seam for a later authoritative award campaign. The first ceremony follows only after the Owner chooses an award-field law and cadence.

### Player experience doctrine

- Awards are **non-blocking recognition**, not a weekly chore.
- A result may attract attention, but it never moves the camera or forces a modal.
- Entering a ceremony is explicit. Ignoring it does not change the authoritative outcome.
- Ceremony presentation is skippable; ceremony facts are not.
- A selected film and person link directly to their honors. An honor links back to its film/person.
- A Standing change exposes its authoritative source and driver when a current witness exists; otherwise the UI shows current truth and says the change history is not recorded.
- Long-term history remembers distinctions, not every routine tick.
- Old saves say **Not recorded** rather than inventing retroactive winners.

---

## 2. Original *The Movies* reconstruction

### 2.1 The complete interaction loop

| Behavior | What the player physically did / saw | Source and confidence | Design purpose | Project: Studio ruling |
|---|---|---|---|---|
| Five-year awards | Watched the timeline for a gold trophy; ceremonies began in 1925 and recurred every five years. | Official manual p. 22 and Prima printed p. 77. **Verified, high.** | Gave long campaigns a regular celebratory rhythm. | **ADAPT** — preserve periodic anticipation; cadence needs new authority for a 120-year campaign. |
| Persistent recap | Clicked the Awards icon after the ceremony to reopen the result; the icon remained active. | Manual p. 22. **Verified, high.** | Kept a missed or skipped result recoverable. | **ADOPT** — attention is dismissible; result remains in History. |
| Recent ceremony screen | Saw the most recent winners; hovering an award exposed its general rule and winner-specific facts. | Prima printed p. 77; locally rendered source page visually checked. **Verified, high.** | Connected recognition to a subject and a reason. | **ADAPT** — replace hover dependence with visible drivers and expandable evidence. |
| Lifetime tally | Chose `View Tally` to inspect cumulative wins. | Prima printed p. 77. **Verified, high.** | Turned individual ceremonies into lasting studio history. | **ADOPT** — honor counts and category history remain inspectable. |
| Category rollout | First ceremony offered three categories; one was added at each five-year ceremony through 1975, with the next category announced in advance. | Prima printed p. 77. **Verified, high.** | Made the awards institution evolve with the campaign. | **ADAPT** — era-aware category availability is valuable; exact historical rollout is not Project: Studio law. |
| Temporary bonuses | Each ceremony award activated a five-year bonus; any prior bonus expired at the next ceremony unless the category was won again. Multiple awards could be active. | Manual p. 22 and Prima pp. 77–79. **Verified, high.** | Made recognition mechanically consequential. | **REJECT** as a general rule — universal temporary buffs create snowballing and distort the meaning of honors. Specific future effects require explicit simulation design. |
| Studio Rating award component | Most-recent ceremony awards supplied 14% of Studio Rating, capped at six award wins. | Prima rating material and reconciled formula corpus. **Verified, high.** | Made awards visibly raise institutional prestige. | **ADAPT** — an award may affect a future prestige/progression model, but must not rewrite the current three-channel Standing law. |
| Star Rating award component | Most-recent ceremony awards supplied 7% of a Star's rating, capped at two wins. | Prima rating material and reconciled formula corpus. **Verified, high.** | Made individual honors matter to Star status. | **ADAPT** — honor effects belong in TypeScript and person history; do not automatically map them onto current Star Power. |
| Achievement/rank goals | Opened a second Awards screen showing nine ordered Achievement Awards, the current target enlarged, completed requirements filled, and four difficulty colors. | Prima printed pp. 77–80. **Verified, high.** | Gave the player a long campaign spine and unlock path. | **ADAPT** into a separate Studio Progression surface with published checklist gates. |
| Immediate certificate completion | A certificate completed as soon as all current requirements were met; later certificates remained ordered, and already-met later requirements could complete together once unlocked. | Prima printed pp. 79–81. **Verified, high.** | Preserved directed progression without waiting for a ceremony. | **ADAPT** — rank/checkpoint evaluation is authoritative and event-driven, not ceremony-gated. |
| Unlock rewards | Advancement unlocked facilities/sets; some rewards became available in future Sandbox games. | Manual p. 22 and Prima achievement tables. **Verified, high.** | Turned status into tangible growth. | **LATER** — reuse blueprint requirement seams after a rank authority exists; no meta-game Sandbox unlock in P08A. |
| Lifetime honors | By the 2005 boundary, all nine achievement awards earned a Gold honor; adding exact category-win counts earned Platinum and a special reward/credits sequence. | Prima printed pp. 80–81 and `lifetime_honors.csv`. **Verified, high.** | Produced an end-of-campaign capstone. | **ADAPT** only as precedent for the future 2040 Legacy finale; do not reproduce the 2005 checklist. |

**Source limit:** the reviewed manual and guide verify the timeline trigger, result/tally screens, rules, and progression screens. They do not provide enough primary evidence to specify the exact 3D ceremony blocking, speech timing, camera cuts, or a universal skip path. Those presentation details remain **unverified** and are not imported into the Project: Studio contract.

### 2.2 What Studio Rating meant

The original's Studio Rating was one five-star composite, not a pure awards score. Prima gives the exact weighting:

| Driver | Weight | Player meaning in the original |
|---|---:|---|
| Capital | 24% | current financial scale, scored nonlinearly |
| Movies | 24% | recent movie history |
| Stars | 24% | Star strength/status |
| Lot Prestige | 14% | attractiveness and operation of the physical lot |
| Awards | 14% | recent ceremony wins, capped |

**Verified.** Capital scoring had a floor near $50,000, a ceiling near $1.6 million, and a strongly nonlinear middle. Lot Prestige itself combined attractiveness, maintenance, connectedness, catering, sanitation, ornament, and cleanliness. Studio Rating affected such things as gate interest/applicant pressure and access to stronger talent, while movie contribution decayed over time.

This was legible as a broad fantasy — “a bigger, better, more successful studio earns status” — but weak as decision feedback because the player often needed a guide to know the proportions. It also conflated present health, enduring prestige, physical beauty, and recent honors.

**Ruling:** Project: Studio must not recreate the five-star composite. Current Standing already expresses three precise reputational channels. Financial health remains finance; facility/lot condition remains operations; awards remain honors; a future rank is a progression gate. A top-level Studio Overview may place these side by side without averaging them.

### 2.3 The 13 ceremony categories and their historical bonuses

This table is included because it corrects recovered-data ambiguity and lets future designers understand the original design space without importing it blindly.

| Introduced | Category | Original winner principle | Original five-year bonus | Ruling |
|---:|---|---|---|---|
| 1925 | Highest Charting Star | top charting Star | `Trend Setter`: doubled public genre interest for that studio's releases | **REJECT bonus; ADAPT recognition.** |
| 1925 | Highest Charting Studio | top studio | `Half Price`: Academy paid half Star salary without reducing satisfaction | **REJECT.** It distorts wage economics and compounds success. |
| 1925 | Highest Charting Movie | top movie | `Easy to Please`: relaxed Star mood thresholds | **REJECT.** The effect is unrelated to the achievement. |
| 1930 | Most Prestigious Studio Lot | top lot prestige | `Age of Discovery`: research speed +20% | **ADAPT category later; REJECT generic buff.** |
| 1935 | Highest Climbing Studio | largest gain, tie broken by higher rating | `Party On`: eating/drinking added half as much Addiction | **REJECT.** Recovered CSV copy that says Stress/Boredom is incorrect. |
| 1940 | Most Prolific Star | most film work | `Perfect Fit`: doubled all studio Stars' genre fit | **REJECT.** It makes future fit less legible and rewards volume twice. |
| 1945 | Best Employer | strongest staff welfare/employer result | `Brainwasher`: halved audience boredom from reused sets/actors | **REJECT.** It obscures audience causality. |
| 1950 | Best Direction | best director performance in a qualifying top-ten movie | `Midas Touch`: raised Final Movie Rating of future films by the winner | **ADAPT honor; LATER consequence.** It was not merely “production quality.” |
| 1955 | Highest Charting Newcomer | top eligible newcomer; cannot win twice | `Quick Learner`: 110% experience gain | **ADAPT newcomer identity; LATER effect.** |
| 1960 | Most Prolific Studio | most output | `Free Love`: relationships grew faster | **REJECT bonus; MAYBE LATER record.** |
| 1965 | Best Acting Performance | best acting performance in a qualifying top-ten movie | `Super Star`: raised Final Movie Rating of future films featuring the winner | **ADAPT honor; LATER consequence.** “Super Star” is a base-game bonus, not the Mac edition. |
| 1970 | Highest Climbing Star | largest gain, tie broken by higher rating | `No Worries`: Stress/Boredom declined at half speed | **REJECT bonus; ADAPT improvement recognition.** |
| 1975 | Movie Quality Output | cumulative final movie rating | `On the Radar`: doubled PR/marketing awareness effect | **REJECT bonus; ADAPT body-of-work honor later.** |

The original categories demonstrate a useful mix of film, person, studio, improvement, craft, and lot recognition. They do **not** establish a Project: Studio category list. Several require systems that do not exist (lot prestige, research, addiction, rival charts), and several reward behaviors whose original formula was opaque.

### 2.4 Achievement certificates and progression

The original ordered achievement path was:

1. **Wannabe Big Cheese** — five releases, $500,000 earned, five total movie stars; unlocked Custom Script Office.
2. **Junior Studio Manager** — one two-star Star, movie, and studio; unlocked Rural Forest.
3. **Promising Studio Manager** — $100,000 cash, two award wins, five releases above two stars; unlocked Proficient Script Office.
4. **Respected Studio Head** — three-star Star/movie/studio and 15 releases; unlocked Publicity Office.
5. **Celebrated Studio Head** — $7 million earned, total rating 35, $4 million cash, eight awards; unlocked Urban Wall Section.
6. **Highflying Moviemaker** — five movies above three stars and four-star Star/movie/studio; unlocked First-Class Script Office.
7. **Big Fish** — 25 releases, $15 million earned, total rating 60, $6 million cash; unlocked Palatial Trailer.
8. **Movie Mogul** — five-star Star/movie/studio, 25 awards, five movies above four stars; unlocked Urban Municipal.
9. **Movie-Making Legend** — total rating 150, 50 releases, $35 million earned, $20 million cash, 50 awards; unlocked Suburban School Library.

The official manual says there are nine ranks and that the player starts as **Greenhorn**, while Prima depicts nine achievement certificates after the starting state. Whether Greenhorn is counted as one of the nine is unresolved. Project: Studio must not inherit this nomenclature ambiguity.

**Design reading:** the certificates were good at showing a current long-term objective and bad at mixing cash hoarding, film quality, awards, and building unlocks into a single checklist whose purpose was not always diegetic. The modern translation is a separate, versioned Studio Progression registry. Each rank has a title, durable completion event, exact requirements, and exact unlocks. Requirements can reference authoritative facts, but a rank is not an award and not the arithmetic mean of Standing.

### 2.5 Lifetime honors and the original ending boundary

At the 2005 boundary:

- fewer than all nine achievement awards produced no lifetime honor;
- all nine produced Gold and a persistent set reward;
- all nine plus exact lifetime category-win counts produced Platinum and a special ending treatment.

The required Platinum counts were category-specific, including five acting, five directing, five employer, five highest-charting movie, five highest-charting studio, thirteen lot-prestige, and smaller counts in other categories. This was an explicit long-horizon mastery checklist, not a general measure of legacy.

**Ruling:** useful precedent, wrong implementation contract. The 2040 finale should interpret the studio's actual history, not grade a hidden replication checklist. Package 08 should retain enough durable facts to support multiple legitimate legacy stories.

### 2.6 Recovered-data reconciliation

| Local dataset | Primary provenance checked | Ruling on conflicts |
|---|---|---|
| `award_directory.csv` | Prima printed pp. 77–79; official manual p. 22 | Category order/cadence is supported. Correct `Party On` to reduced Addiction gain from consumption, not Stress/Boredom. Describe `Midas Touch` and `Super Star` as Final Movie Rating effects, not generic production quality. |
| `achievement_certificates.csv` | Prima printed pp. 79–81; rendered page visually inspected | The nine-row order beginning with `Wannabe Big Cheese` is supported. Reject the conflicting appendix/source-conflict claim that gives a different Prima order. |
| `lifetime_honors.csv` | Prima printed pp. 80–81 | Gold/Platinum conditions and exact category counts are supported; post-2005 ceremony continuation remains unresolved. |
| `all_reconciled_facts_appendix.csv` | traced back to manual/Prima rows above | Use as an index, not independent authority. Rows that conflict with the visually verified guide are superseded here. |
| `original_formulas.json` and rating component data | Prima rating chapters / developer-reviewed guide interpretation | Use exact Studio/Star Rating component weights only with guide provenance; do not call them executable Project: Studio truth. |
| `source_conflicts.csv` / `ACTIVE-UNRESOLVED-QUESTIONS.csv` | manual versus Prima comparison | Preserve the Greenhorn/nine-rank counting ambiguity and post-2005 cadence ambiguity; neither affects the Project: Studio contract. |

### 2.7 What was excellent, dated, and weak

**Still excellent**

- Periodic anticipation rather than constant achievement spam.
- A ceremony that recognizes films, people, and studio history together.
- Persistent results and lifetime tallies.
- Inspectable long-term progress.
- Visible connection between success and the physical studio.

**Good principle, dated implementation**

- Five-year cadence: memorable but potentially too sparse across a 120-year authored campaign.
- Ceremony reveal: emotional, but should be optional and skippable.
- Category rollout: strong campaign texture, but must be era-aware and authoritative.
- Achievement ranks: useful direction, but need clean separation from awards and finances.

**Weak even in 2005**

- Winner logic and formula drivers were difficult to discover.
- Several award bonuses were causally unrelated to the recognized achievement.
- Recent awards fed a broad rating without enough in-game explanation.
- Optimizing temporary bonuses could eclipse the honor itself.
- Historical memory was narrower than the story the simulation created.

---

## 3. Stunts & Effects / Superstar findings

### 3.1 Stunts & Effects

**Verified primary behavior, high confidence:** the official [*Stunts & Effects* manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/7910/manuals/The_Movies_Stunts_Effects_Manual.pdf?t=1447351041), printed p.10 under `New Awards`, says unlocking the Stunt School makes new stunt-specific Awards and Achievements available and that winners receive new bonuses. Printed p.4 also says Gold and Platinum Lifetime Achievements are unavailable in the expansion's 1960 Quick Start mode. This proves that the expansion extended the recognition ecosystem; it does **not** identify the added category names, eligibility tests, cadence, winner law, or exact bonuses. Those details remain unverified in the inspected corpus.

The same manual, printed pp.8–10, establishes the evidence behind that extension: castable stunt doubles, stunt difficulty, performer condition/skill, likeness, success/failure, and stunt contribution to movie rating. [Contemporary expansion review coverage](https://www.alteredgamer.com/other-games/13334-review-the-movies-stunts-and-effects-expansion-pack/) corroborates the broader production/person layer but is not needed as mechanical authority.

**Ruling:** **ADOPT** the principle that a newly simulated creative discipline can later earn recognition; **REJECT** copying an award whose criteria/effect cannot be sourced; keep stunt/technical honors **LATER** until TypeScript publishes durable, player-safe stunt/effects facts and exact award law. They are not P08A.

### 3.2 Superstar Edition

The Mac **Superstar Edition** was a bundle of the base game and *Stunts & Effects*, not a third mechanical revision of Awards. The secondary [Macinplay Superstar Edition review](https://macinplay.de/spiele-tests/macintosh-games/the-movies-superstar-edition/) praises the detailed, living studio and its rating/unlock progression, but also describes automation failures and repetitive hands-on maintenance. It is therefore evidence that the complete package preserved both the studio-history fantasy and the original's micromanagement burden; it is not primary evidence for award formulas.

The review's broader lesson matters: a long campaign already asks the player to make films and manage a living lot. Awards should punctuate that work, not add another maintenance queue. Ceremony facts resolve autonomously from authority; the player chooses whether to watch the presentation.

### 3.3 Four-layer historical ruling

| System | Original *The Movies* | Stunts/Superstar-era evidence | Best modern lesson | Project: Studio ruling |
|---|---|---|---|---|
| Ceremony cadence | Five-year event with unlock-era category rollout | Preserved inside a larger, already busy management game | Optional season summary and durable archive | **ADAPT** cadence; **ADOPT** recoverable summary. |
| Awards effect | Five-year buffs plus rating contribution | Official expansion manual adds stunt-specific Awards/Achievements and bonuses, but omits their exact law | Recognition and progression should be separately explained | **REJECT** universal buffs; authorize only sourced, category-specific effects. |
| Career honor | Awards contributed to Star status | Expansion recognizes stunt work, while exact recipients/categories remain unverified | Honors belong on the durable person profile | **ADAPT** into person career history; do not fabricate stunt records. |
| Long campaign | Nine achievements and Gold/Platinum end target | Complete edition exposes repetition when every system demands attention | Sparse high-significance timeline | **ADAPT** into a 1920–2040 history contract. |

---

## 4. Modern comparator findings

Comparators are assigned to subproblems, not treated as genre-wide templates.

| Subproblem | Best comparator | Concrete observed behavior | Project: Studio translation |
|---|---|---|---|
| Long-save history | [Football Manager — Dynamic Manager Timeline](https://www.footballmanager.com/features/dynamic-manager-timeline), “Dynamic Manager Timeline” | Chronological career events; greater visual weight for more important successes and failures; built to restore context in an older save. | Sparse studio timeline with explicit significance and both triumphs and setbacks. Do not copy opaque client-side importance scoring. |
| Distinct reputation dimensions | [Football Manager — Supporter Confidence](https://www.footballmanager.com/features/supporter-confidence), “Supporter Profile” and “Supporter Confidence” | Separates supporter identity/performance judgments from board financial/strategic objectives and exposes category feedback. | Preserve three Standing channels; do not collapse current health, history, cash, and prestige into one badge. |
| Award archive | [OOTP 23 — League Awards](https://manuals.ootpdevelopments.com/index.php?man=ootp23&page=league_awards), “League Awards” | Award-category index; selecting a category opens its historical winner list. | Category → season → subject deep links, with player studio facts only until rivals exist. |
| History portal | [OOTP 23 — History Index](https://manuals.ootpdevelopments.com/index.php?man=ootp23&page=league_history), “History Index” | One season-first portal links players, teams, managers, leaderboards, awards, and accomplishments. | One Studio History workspace links Films, People, Honors, Records, and Milestones; no disconnected archives. |
| Achievement state | [Apple Game Center HIG](https://developer.apple.com/design/human-interface-guidelines/game-center), “Achievements” | Distinguishes locked, in-progress, hidden, and completed achievements with concise cards and optional progress. | Future progression uses explicit available/in-progress/completed/hidden states; in-world history is not platform points. |
| Non-blocking attention | [Apple HIG — Notifications](https://developer.apple.com/design/human-interface-guidelines/notifications/) and [Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts) | Notifications remain discoverable without treating nonactionable information like an interruptive alert. | Awards attention is a persistent pulse/summary route, never a forced modal or camera move. |
| Long lists and controls | [Xbox Accessibility Guideline 112](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/112), implementation guidance | Logical focus order, consistent prompt position, alternate ways to locate complex content. | Category rail, filters/search, persistent Back, controller-complete traversal. |
| Ceremony motion | [Xbox Accessibility Guideline 117](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/117), implementation guidance | Moving/auto-updating presentation can be paused or disabled; camera effects can be reduced. | Skip/summary and reduced-motion ceremony paths are architecture requirements. |

### Comparator synthesis

No comparator solves all of Package 08. The strongest combination is:

- *The Movies* for ceremony fantasy, periodicity, and physical reward;
- Football Manager for multi-channel institutional judgment and a long-save narrative timeline;
- OOTP for category-first durable records and history navigation;
- platform accessibility guidance for non-blocking attention, focus, readable type, and reduced motion.

What Project: Studio must not copy:

- a sports league table without rival studios;
- opaque importance/award calculations performed only in the client;
- dozens of low-value achievement banners;
- platform-wide points or social rankings;
- a mandatory cinematic ceremony for every category.

---

## 5. Adopt / Adapt / Reject matrix

| Pattern | Ruling | Contract |
|---|---|---|
| Periodic ceremony | **ADAPT** | TypeScript owns a versioned award period/cutoff; presentation never infers it from year text. |
| Recoverable ceremony recap | **ADOPT** | Ignoring or skipping a ceremony loses no fact; History remains complete. |
| Film/person/studio categories | **ADOPT principle** | Categories exist only when current authority can prove eligibility and result inputs. |
| Advance announcement of categories/cutoff | **ADOPT** | Eligibility rules and cutoff are inspectable before resolution. |
| Hover-only explanation | **REJECT** | Primary eligibility, result, and consequence appear above the fold; hover can elaborate only. |
| Most-recent ceremony tally | **ADAPT** | Show latest result plus lifetime record, not only one or the other. |
| Five-year universal bonus | **REJECT** | An honor has no implicit buff. Any effect is category-specific, published, and TypeScript-owned. |
| Awards folded into one prestige star rating | **REJECT** | Standing, finances, progression, and history stay separate. |
| Ordered studio rank checklist | **ADAPT** | Future progression root with exact requirements and unlocks; never hidden or ceremony-gated. |
| Manual certificate/archive chores | **REJECT** | Completion and history persistence are automatic. |
| Nominations | **LATER / conditional** | Only after authority stores a real candidate field or an approved threshold model. |
| Fake rival nominees | **REJECT** | No generated competitor names or scores without rival authority. |
| Explicit ceremony entry | **ADOPT** | Attention opens a retained workspace; no automatic camera travel. |
| Skip to summary | **ADOPT** | Skips animation only; does not reroll, suppress, or alter results. |
| Person and film honor sections | **ADOPT** | Same immutable result referenced by profile, Film Chronicle, ceremony, and history. |
| Sparse long-save timeline | **ADOPT** | Permanent identity-bearing events and derivable milestones; no weekly diary. |
| Global/world records without rivals | **REJECT** | Show **studio records**, never “industry #1.” |
| Platform achievements as studio history | **REJECT** | Optional meta achievements remain separate from diegetic honors and progression. |
| Trophy clutter across lot | **REJECT** | One restrained honors acknowledgment first; physical prestige system later. |
| Retroactive award backfill on old saves | **REJECT** | Mark unavailable/not recorded; never synthesize winners. |

---

## 6. Studio Standing doctrine

### 6.1 Current truth

At baseline, `src/core/types.ts` defines exactly three 0–100 channels:

- **Audience Awareness** — how well audiences know the studio. It is the only channel currently connected to box office.
- **Industry Prestige** — critical respect, driven by critic scores; it has no current commercial unlock or purchasing power.
- **Commercial Confidence** — reputation for converting committed film cost into gross while maintaining budget discipline; it is not cash and has no current mechanical benefit.

`src/core/standing.ts::updateStanding` is the sole **release-result** formula for the three channels, not the sole Standing mutation. Current authority has three source families:

1. `src/core/tick.ts` applies release-result updates sequentially in ascending production ID.
2. `src/core/actions.ts::applyPublicity` immediately raises Audience Awareness when an accepted paid publicity action resolves.
3. `src/core/tick.ts` then applies deterministic weekly Awareness drift above its anchor after release/broadcast work.

The current Release Result/Autopsy compares start-of-tick Standing with final post-drift Standing. Therefore its number is a **whole-week studio delta**: it includes every same-week release and the final Awareness drift. It is not a persisted per-film delta and it cannot numerically isolate drift. The current UI correctly warns that several same-week releases share the movement, but a Package 08 inspector must additionally say that Awareness may include weekly settling. `ui/src/engine/adapter.ts::standingChannels` publishes honest channel meanings, and `ui/src/components/common.tsx::StandingBar` provides text, number, meter, and accessible labeling.

### 6.2 Meaning

Standing means **current studio reputation**. Released work moves all three channels; paid publicity and weekly settling also move Audience Awareness. It is not:

- current cash or solvency;
- studio rank;
- award count;
- facility quality;
- an all-time legacy score;
- a promise of financiers, rivals, or unlocks which do not exist.

Do not add a fourth channel called Prestige, Fame, Legacy, or Rank. Do not average the three channels into an authoritative overall number. `lotStandingBand` may continue as presentation dressing only; it must never become a gate or award input merely because it exists.

### 6.3 Player-facing inspector

The Standing inspector must answer five questions in this order:

1. **Where are we now?** Three channel values, each with a name and one-sentence meaning.
2. **What changed?** A source-labeled live before → after witness only when the current accepted action/tick receipt still exists. Otherwise: `Recent change history is not recorded.`
3. **Why?** For publicity, the accepted campaign and immediate lift. For a release week, the whole-week delta, all releasing film drivers, and the disclosure that Awareness also includes weekly settling; never a fabricated numeric per-source allocation.
4. **What does it affect?** Awareness identifies its current box-office connection; Prestige and Confidence explicitly say they are reputational records today.
5. **What can I do?** One grounded response, such as releasing work that reaches an audience, making critically stronger films, or managing committed cost. It is guidance, never a promise of a fixed delta.

#### States

- **Early studio:** after founding but before a release, show the current three channels as an `Early studio profile`. Explain that paid publicity and weekly settling can already move Audience Awareness, while film releases establish the broader public/critical/commercial record. Do not label a post-publicity value as an untouched starting value.
- **Active:** show all channels at equal hierarchy. The currently changed channel may receive a restrained marker, not a “winner” color.
- **Live change available:** show signed text and color-independent arrow only while an exact current action/tick receipt supplies before/after state. Label the source `Publicity action` or `Whole-week update`.
- **History unavailable:** after save/load, reconnect, migration, or loss of the live receipt, show `Recent change history is not recorded.` Never derive historical deltas from present-day films, the publicity ledger, or current Standing.

### 6.4 HUD law

- Once the studio is founded, Standing remains reachable from Administration/Dashboard because Awareness already affects release reach and publicity can change it before the first film.
- Show a compact **Studio Standing** pulse after an accepted publicity action or a release-week update observed by the current client. Routine weekly Awareness settling does not need an attention pulse. The stable HUD may expose one entry icon/label without three miniature meters.
- Clicking opens the Standing inspector; it does not move the camera.
- No award count lives permanently in the HUD.
- An impending/resolved award period is a separate attention badge, not a fourth Standing channel.

---

## 7. Prestige versus financial health

The following concepts must remain separately named and separately sourced:

| Concept | Authority today | Can decline? | Durable history? | UI home |
|---|---|---:|---:|---|
| Cash / operating position | economy/ledger | yes | selected snapshots and film facts | Finance / Run Recap |
| Audience Awareness | Standing | yes | current only; future checkpoints needed | Standing inspector |
| Industry Prestige | Standing | yes | current only; future checkpoints needed | Standing inspector |
| Commercial Confidence | Standing | yes | current only; future checkpoints needed | Standing inspector |
| Star Power | talent fame + career events | yes/no per authority | frozen per-film changes from V5 onward | person profile |
| Film honor | absent today | never removed once won | required | Film Chronicle |
| Person honor | absent today | never removed once won | required | person profile |
| Studio rank | absent today | future rule decision | achieved ranks must persist | Studio Progression |
| Studio legacy | no aggregate authority | not a current score | future finale reads history | Studio History / 2040 finale |

A historic studio may be short of cash. A commercially powerful studio may lack critical prestige. An award winner remains an award winner if current Standing later falls. The interface must permit those stories instead of normalizing them away.

---

## 8. Award eligibility

### 8.1 Current authority finding

There is no current `Award`, `AwardSeason`, category registry, eligibility selector, candidate pool, nomination, winner, effect, or save root. `BlueprintRequirement` already declares award gates, but `blueprintRequirements.ts` deliberately returns them unmet with the honest message “Awards are not part of the game yet.” This seam is to be **left alone** until an award authority ships.

### 8.2 Required future authoritative contract

Every award category definition must publish, in data rather than presentation prose:

| Field | Requirement |
|---|---|
| `categoryId` | stable across saves and presentation revisions |
| display identity | era-safe category name, institution copy, icon token |
| subject kind | film, person, or studio; never inferred from a label |
| valid roles/disciplines | exact eligible role(s), if person-level |
| period/cutoff | exact authoritative release/work window |
| required facts | authoritative fields and missing-data behavior |
| eligibility rule version | immutable reference used by historical outcomes |
| selection law | deterministic comparison/threshold/tie/no-award law owned by TypeScript |
| published explanation | concise player-facing condition and main evaluated drivers |
| consequence | exact immediate effect, if any; `none` is valid |
| availability | campaign/era requirements, if any |

An eligibility record must have one of four explicit states:

- **eligible** — all required facts exist and the subject meets the rule;
- **ineligible** — facts exist and the subject fails a named requirement;
- **not recorded** — the subject predates the required durable fact;
- **unavailable** — the category does not exist in this period/ruleset.

Missing facts never become zero. An old film without frozen participant or assessment history is not quietly judged as a worse film.

### 8.3 Selection without current rivals

Project: Studio cannot truthfully declare “best in the industry” from player-studio data alone. Before a first award implementation, the Owner must choose one of two legitimate models:

1. **Academy threshold model (recommended pre-rivals):** published eligibility and nomination thresholds; a published win threshold; a player candidate that does not clear the win threshold may enter a distinct `award presented elsewhere` result without a named rival, film, person, or score. This copy/state requires explicit Owner review because it implies a wider institution without simulating a rival. The Academy is fictional, the selection is deterministic, and TypeScript owns every outcome.
2. **Defer competitive ceremonies until rivals:** P08A ships Standing/History only; awards arrive when a real field exists.

What is forbidden: Unity rolls, fake named nominees, hidden “house competition,” random flavor winners stored only in UI, or pretending the studio won by being the only candidate.

### 8.4 Candidate categories

Package 08 does not authorize a category list. The first registry should be deliberately small and constrained by facts that already exist when implemented. Plausible future candidates include film, acting, directing, writing, craft, commercial achievement, and a studio body-of-work honor, but each must pass all of these tests:

- the subject and evaluated period are unambiguous;
- the authoritative facts survive save/load;
- the player can inspect the main drivers before resolution;
- the category is distinct from an existing record or milestone;
- the result can be explained without hidden actual quality or invented competition;
- its consequence, if any, is explicit.

---

## 9. Nominations ruling

### Historical finding

The reviewed base-game sources clearly establish ceremony winners, category information, and tallies. They do not establish a robust, separate player-facing nomination phase comparable to modern awards campaigns.

### Project: Studio ruling — **FOLLOW-UP, not required V1**

Nominations create valuable anticipation only if they are durable authority rather than a presentation guess. They require:

- a real candidate field or the approved threshold model;
- a defined nomination cutoff and reveal date;
- immutable nominee records;
- a clear distinction between eligible, nominated, and winner;
- notification grouping that avoids one alert per person/category.

If the threshold model is chosen, nomination attention should be one grouped event: “Two films and three people received award nominations.” The ceremony workspace then filters to player-relevant categories. If nominations are absent, the system proceeds directly from eligibility period to a ceremony result; UI must not fabricate suspense labels.

---

## 10. Ceremony design

### 10.1 Entry and timing

- TypeScript owns period close and results. Presentation never resolves a category.
- One non-blocking attention item appears when a result/nomination batch is available.
- The player can keep managing the lot indefinitely; the result is already durable and cannot expire.
- `Open Ceremony` enters a retained workspace. It does not Focus a building or move the camera.
- Opening the workspace does not advance time and does not invent a second pause law. Because no decision changes the result, auto-pause is unnecessary.
- `Skip to Summary` skips only reveal presentation.

### 10.2 Workspace hierarchy

On a standard desktop viewport, use roughly 76–82% of width and up to 90% of height, retaining a 18–24% lot strip where practical. The current Project: Studio identity and applicant dossier hierarchy govern color, materials, portrait treatment, and typography; do not impose a permanent red-carpet or 1948 aesthetic.

1. **Header:** institution, award period, status (`Results recorded`), primary `Skip to Summary`, persistent `Back`.
2. **Category rail:** only categories relevant to the studio above the fold; all categories in Summary if the authority publishes them. Each row says category, subject, and outcome state.
3. **Reveal/result stage:** category, film/person portrait or film identity, winner/result, one sentence of evidence.
4. **Evidence panel:** eligibility basis, top positive/negative or qualifying drivers, tie/no-winner explanation when relevant.
5. **Consequence panel:** durable honor; exact Standing/Star Power/unlock effect if authority applies one; otherwise “Recognition only.”
6. **Routes:** `Open Film`, `Open Person`, `Open Studio History`. These preserve ceremony route and focused category.

### 10.3 Presentation scale

- **Routine eligible/no result:** summary row only.
- **Nomination:** notable attention and profile/history record if nominations exist.
- **Win:** category reveal with restrained motion and sound.
- **Major win/record:** larger Gazette treatment and optional world acknowledgment.
- **Historic studio first:** Studio History feature card; still no forced camera.

No category reveal runs longer than the player can immediately skip. Reduced motion replaces zooms, wipes, light sweeps, and animated count-ups with a single crossfade or instant state change. All result facts remain textually available.

### 10.4 Back and interruption

- `Escape` closes a tooltip/detail first, then comparison/detail route, then the ceremony workspace.
- Closing returns exact lot camera, selection, time state, route, category, scroll, and input focus per Package 02.
- If a save/reconnect occurs mid-reveal, reopen at the durable summary; never replay as if a winner were newly selected.
- If the relevant person retired or left, the frozen historical person identity remains linkable; `Locate in world` is absent and the profile says retired/unavailable.

---

## 11. Awards as strategy

Awards should be **emergent recognition of decisions the simulation already made**, with partial, honest targetability:

- Before the period, the player may inspect category rules and likely eligible subjects.
- During filmmaking, normal screenplay/casting/production/release decisions remain the way to influence evaluated facts.
- No separate “campaign for award” button exists unless publicity/award campaigning becomes an authoritative future system.
- The UI never guarantees a win from one visible score when uncertainty or competition matters.

### Classification

| Candidate strategy | Ruling | Reason |
|---|---|---|
| Make strong films and performances | **ADOPT** | Core simulation decisions already generate relevant facts. |
| Inspect eligibility and cutoff | **ADOPT** | Makes pursuit intelligible without adding busywork. |
| Choose release timing for eligibility | **LATER** | Current calendar/award-period and release-timing strategy are not yet authoritative. |
| Dedicated awards publicity campaign | **FUTURE DESIGN** | Requires distinct costs, timing, opportunity cost, and effect law. |
| Buy/re-roll nominations | **REJECT** | Undermines history and invites casino behavior. |
| Repeat the same high-stat film formula | **REJECT as a design target** | Categories should recognize different authoritative achievements, but no anti-spam friction is invented in UI. |
| Explicit campaign objective | **LATER** | Appropriate for authored scenarios only after award authority is stable. |

---

## 12. Award consequences

An award result record must distinguish:

1. **Durable honor** — always persists once awarded.
2. **Immediate mechanical effect** — optional, exact, TypeScript-owned, applied once with idempotence.
3. **Presentation significance** — can change visual treatment only; never gameplay.
4. **Future consequence** — not shown as active until modeled.

### Current-system ruling

- Do **not** change the current Standing triple merely because an award exists. A future award rule may publish an explicit Standing delta, but that is a separate Owner/simulation decision.
- Do **not** change `Talent.fame`/Star Power from Unity. If a future acting/directing honor changes Star Power, TypeScript records the exact before/after and cause, ideally through the same career-history family.
- Do **not** activate blueprint `award` or `rank` requirements until the corresponding authoritative record is live and migration-safe.
- Recognition-only awards are valid. The interface should say so rather than inventing a bonus.

Recommended consequence display:

> **Won — Best Direction**
>
> *Night Harbor* · Talia Voss
>
> Durable career honor
>
> **Effect:** Recognition only

or, only when real:

> **Effect applied:** Industry Prestige +2
>
> 47 → 49 · Award rule v1

---

## 13. Person career honors

### Information hierarchy

The person profile gains an **Honors** section only when authority or an explicit empty state exists:

1. total wins and nominations, if nominations are modeled;
2. most significant/recent honor;
3. chronological list: period, category, film, result;
4. exact mechanical career effect, if any;
5. `Open Film` / `Open Ceremony` deep links;
6. immutable “Not recorded before SaveFile/award-system version …” marker for older work.

Awards do not replace the existing `TalentCareerEvent` history. Career events explain how films changed OVR, skills, genre experience, work history, and Star Power. Honors reference the same stable `talentId` and `filmId` and sit alongside that evidence.

### Retired, departed, or missing people

- A retired or departed person remains in history by immutable ID and frozen display identity.
- `Locate in World` is omitted; `Open Profile` opens historical profile mode.
- If a legacy save has an award record but no full current talent object, show the frozen name/role snapshot and “Detailed profile unavailable.”
- Never retarget an honor to a new person who happens to reuse a name.

“Breakthrough,” “legend,” or “career peak” are not freeform flavor labels unless an authoritative classification or presentation-only definition is explicitly published. Plain facts are preferable to invented biographies.

---

## 14. Film honors

Film Chronicle gains an **Honors** block that references the same immutable award outcomes used by the ceremony:

- category;
- period;
- recipient when person-level;
- nominee/winner status if nominations exist;
- exact effect or “Recognition only”;
- link to ceremony summary;
- historical availability status.

The film remains the central object. A person win for work on a film appears in that film's Honors as “Talia Voss — Best Direction,” while the person profile points back to the same outcome ID. No copied, independently editable award arrays may drift between film and person views.

Current `FilmResult` does not freeze every display field: film title is normally recovered through current concept data, while `TalentCareerEvent` does freeze a film-title snapshot. A future award/history root should snapshot the minimal human-readable identity needed to survive retired/missing concepts while retaining stable IDs as authority.

---

## 15. Studio milestones

### 15.1 Milestone test

A studio milestone deserves durable history only if it passes all four tests:

1. it marks a meaningful first, cumulative boundary, record, structural change, or era transition;
2. the fact is authoritative and stable;
3. it would help a returning player understand the studio's story;
4. it does not occur so often that a 120-year timeline becomes a diary.

### 15.2 Policy

| Candidate | Classification | Persistence ruling |
|---|---|---|
| Studio founded | **AUTHORITATIVE AND MEANINGFUL** | needs a durable founding identity/date if not safely fixed by campaign state |
| First release | **AUTHORITATIVE AND MEANINGFUL** | derive from earliest `FilmResult`/permanent `premiere` event |
| First production wrap | **AUTHORITATIVE AND MEANINGFUL** | permanent `wrapped` event already exists |
| First profitable film | **MEANINGFUL where exact** | derive only from authoritative film contribution/accounting; never gross minus guessed overhead |
| First major award | **MEANINGFUL later** | persist award outcome; derive first by period/order |
| 10th / 25th / 50th / 100th release | **MEANINGFUL sparse thresholds** | derive from ordered releases; avoid every-five-film spam |
| New studio record gross/critic result | **NOTABLE, derivable** | record only when needed for an event-time snapshot; otherwise derive from immutable results |
| Soundstage/facility opened | **MEANINGFUL selectively** | current permanent construction event can support major facilities; routine decorations excluded |
| Set built/retired | **ROUTINE HISTORY INPUT** | permanent events already exist; show only first/iconic/filter context, not every set on main timeline |
| Era transition | **FUTURE SYSTEM** | persist only when a governing era authority exists |
| First sound/color/digital film | **FUTURE SYSTEM** | needs real technology/era facts |
| Highest payroll / most films in one year | **RECORD where exact** | derive; do not persist weekly samples |
| “Clicked 1,000 people” | **REJECT** | input telemetry is not studio history |
| Routine weekly profit/Standing movement | **REJECT** | belongs in finance/reputation views, not permanent timeline |

Presentation-only titles such as “A new studio record” may be derived from authoritative comparisons. They must not create unlocks or alter outcomes.

---

## 16. Certificates / achievements

The original certificates combined campaign guidance, rank, unlocks, and completionist goals. Project: Studio should split those purposes:

- **Studio Progression:** in-world, authoritative, ordered rank/checkpoint requirements and unlocks.
- **Studio History milestones:** diegetic facts automatically recorded.
- **Platform achievements:** optional external/meta layer, not authoritative game history.
- **Awards:** judged recognition for a bounded period/category.

### Ruling — **replace with explicit progression + milestones**

Do not reproduce certificate cards as a second achievements checklist. If a future rank uses checklist gates, its card shows:

- current rank and next rank;
- each exact requirement with current/required progress;
- unavailable/not-recorded status;
- exact unlocks;
- no hidden requirement;
- no ceremony dependency unless the requirement genuinely includes an award.

The original's “complete later conditions in advance, then grant simultaneously” is a useful data-law precedent but a poor surprise. Project: Studio should visibly track all non-hidden requirements even if ranks must complete in order.

---

## 17. Records

### 17.1 Allowed record families

- **Film:** highest gross, strongest critic result, strongest audience result where frozen, longest run, highest exact film contribution/profit where defined, most honors.
- **Person:** most studio film credits, most honors, discipline-specific career totals where historical facts exist.
- **Studio:** most releases in an authoritative period, highest recorded Standing channel, largest current lot/facility boundary where exact, longest run of profitable films where exact.

### 17.2 Forbidden claims

- “Best in Hollywood,” “industry #1,” market share, or league rank without rivals/industry authority.
- “Most successful person” from a hidden composite.
- film profit that assigns studio payroll/overhead to a film without accounting authority.
- historical audience values reconstructed from current market segment shares when the original shares were not frozen.
- records derived from missing legacy facts as if zero.

### 17.3 Display law

A record card states **metric, value, subject, date/period, source availability**. Ties show all tied subjects or a published deterministic rule; presentation does not silently pick the first array item. A new record can be a notable event, while the underlying record table remains derivable from immutable facts.

---

## 18. Studio History / timeline

### 18.1 One history, several lenses

The retained **Studio History** workspace is a single portal with:

- **Timeline** — sparse chronological significant events;
- **Films** — durable Film Chronicle records;
- **People** — careers and honors;
- **Honors** — category/period archive;
- **Records** — studio-relative record tables;
- **Progression** — future ranks/checkpoints, clearly separate.

Filters change the view, not the underlying record. A timeline entry deep-links to the exact film, person, facility, award outcome, or Standing checkpoint where available.

### 18.2 What qualifies for the primary timeline

The primary timeline contains:

- founding only after a durable founding identity/date exists;
- selected firsts and sparse release-count thresholds;
- major film outcomes/records from Package 07 significance where published;
- award wins and major nominations where modeled;
- meaningful person career honors/retirements where modeled;
- major facility openings and era transitions where modeled;
- rank advancement;
- historic highs/lows selected by a published presentation significance rule.

It does not contain every release payment, maintenance tick, queue admission, nomination reminder, or UI acknowledgment.

### 18.3 Exact P08A history projection

P08A does not ask Fable to choose a significance taxonomy. Its initial projection is deliberately narrower:

| Existing fact | P08A default Timeline | Other P08A lens | Significance / ordering |
|---|---|---|---|
| `FilmResult` | exactly one `Film released` card per result | full entry in Films | `releaseTick`, then stable `productionId`; ordinary = **Info** |
| matching permanent `premiere` event | no second card; deduplicate against the `FilmResult` by film ID | evidence only | never double-count a release |
| release-count boundaries | attach `First release`, `10th`, `25th`, `50th`, or `100th release` to that film card | Records summary | these five exact boundaries = **Notable**; no other count thresholds |
| `TheatricalRun` | no separate primary card | Film detail and Records | only exact locked run facts; legacy/unavailable state stays labeled |
| permanent `wrapped` event | hidden by default | `Production` timeline filter | **Info**; week then authoritative `seq` |
| permanent `constructionCompleted` event | hidden by default | `Lot` timeline filter, only with a player-readable resolved identity | **Info**; if identity cannot resolve, say detail unavailable rather than show a raw ID |
| permanent `setBuilt` / `setRetired` | hidden by default | `Lot` timeline filter | **Info**; week then `seq` |
| `TalentCareerEvent` | no separate primary card; the film card may say career details exist | People and Film detail | stable event ID; never one timeline card per participant |
| current Standing | header/Standing route only | Standing inspector | not a historical event; no high/low claim |
| Tier-W studio events | excluded | excluded from Studio History | current operational context only; retains existing compaction |
| founding | absent in P08A | absent | current authority has no durable founding event; do not infer one |
| award/rank/era/history classification | absent | absent | systems do not exist |

The exact P08A Records set is also bounded:

- highest opening gross and highest total gross from complete `FilmResult` facts;
- highest critic score from `FilmResult`;
- longest theatrical run only for a non-legacy locked run with trustworthy `totalWeeks`;
- most released-film credits per person using frozen `participants`, with missing legacy participation explicitly excluded/not recorded;
- all ties displayed; no array-first winner;
- no “most successful,” profit record, Standing high, industry rank, audience-history aggregate, or major/historic film classification.

This means every released film is findable in the Timeline and Films lens, but routine wraps, construction, sets, and career rows do not overwhelm the default story. Package 07 may later publish a reviewed film significance classification; P08A must not derive one from critic/gross thresholds on its own.

### 18.4 Derived versus recorded

- Derive facts from immutable film, run, career, construction, and award records when the event time and identity remain exact.
- Record at event time when later mutable/deleted state would lose identity, the occurrence itself is nondeducible, or a gameplay effect is applied.
- Do not duplicate the same truth in multiple writable arrays.
- Sorting is deterministic: period/week, authoritative sequence, stable event ID.
- If two events share a week, they remain separately identified; UI may group them visually.

### 18.5 Return-to-save value

The first screen should answer “What was this studio doing?” within one viewport: current period, current Standing channels, latest three significant events, current record/highlight, and active film pipeline deep link. This borrows the strong return-to-old-save purpose of Football Manager's timeline without retaining every event type.

---

## 19. Significance ladder

Significance is a **presentation classification only** unless TypeScript explicitly publishes a gameplay consequence.

| Level | Treatment | Examples when authoritative | Forbidden behavior |
|---|---|---|---|
| **Info** | quiet History row; no HUD interruption | eligibility fact, routine award loss, tied studio record | toast/modal/audio fanfare |
| **Notable** | grouped HUD/Gazette attention; expanded timeline card | nomination, ordinary win, release-count milestone | camera movement or pause |
| **Major** | prominent ceremony result and Gazette lead; optional lot acknowledgment | major category win, new long-standing record, rank advancement | blocking until watched |
| **Historic** | featured Studio History entry and optional one-time presentation | first major award, exceptional published record, future campaign-defining event | hidden formula, gameplay effect from client classification |

Thresholds/category mappings must be authored or derived from exact facts and testable. Unity may choose animation intensity for a published level but may not promote a result in a way that changes rules or unlocks.

---

## 20. World prestige

### V1 world acknowledgment

The lot should acknowledge institutional history without becoming a trophy field:

- Administration is the natural local owner for Standing and future honor summaries once available.
- A single restrained Administration/Gate attention treatment may indicate **Honors recorded** or **Standing changed**.
- Selecting Administration shows the local summary and routes to the retained Standing/History workspace.
- If Administration is unavailable, the global HUD/attention route remains valid. No new prestige building is invented.
- A major award may temporarily change a marquee/banner token only when driven by an authoritative result and era-appropriate presentation data.

### Later physical systems

- trophy case/award shelf with bounded representative display;
- plaques or named historical markers on meaningful stages;
- player-curated honors display;
- era-appropriate signage and ceremony venue.

These are **LATER**. Never auto-place one object per award. Unity may not infer prestige from the number of props in a room.

---

## 21. HUD / attention

### Standing

- Compact entry only after meaningful reputation exists.
- Change badge groups same-week releases.
- Click opens inspector; no camera change.
- Dismissal/seen state is presentation state outside authoritative `GameState`.

### Awards

- One grouped badge per award period, not per category/person.
- Copy states what happened: `Awards results recorded · 3 studio subjects recognized` or `Nominations recorded` only when authoritative.
- It remains until opened or dismissed; dismissal never deletes history.
- If the player ignores it, time and lot play continue. There is no penalty and no result reroll.

### Milestones

- Info events go directly to History.
- Notable/Major events may enter the Gazette/attention rail once.
- No duplicate toast + modal + newspaper for the same fact. The attention system should choose one primary route and link to the durable record.

---

## 22. 120-year data-retention requirements

### 22.1 Retention law

The 1920–2040 campaign needs bounded, identity-safe history, not an unbounded event diary. The current repository already demonstrates the right split:

- `studioEvents` **Tier D** permanently retains identity-bearing events (`premiere`, `wrapped`, `constructionCompleted`, `setBuilt`, `setRetired`).
- **Tier W** operational chatter is compacted to a deterministic 26-week window.
- `nextSeq` never rewinds and UI seen/consumed state stays outside the authoritative log.

Awards/history should follow the principle, not overload that union blindly. A future additive/versioned legacy root is safer than widening frozen leaves or turning `studioEvents` into a catch-all.

### 22.2 Persist / derive / summarize / discard

| Fact | Treatment | Reason |
|---|---|---|
| Award category/rule version | **Persist reference/version** | historic result must remain interpretable after tuning changes |
| Eligibility outcome for player subjects | **Persist when needed for ceremony/history** | cannot safely recreate after mutable facts/rules change |
| Nominees and winners | **Persist immutable result** | core historic fact |
| Award mechanical effect application | **Persist idempotent witness** | prevents replay/double application |
| Rank/certificate completion | **Persist event** | unlock/progression consequence |
| Current Standing | **Already persisted** | current reputation truth |
| Every weekly Standing sample | **Discard** | high volume and little legacy value |
| Meaningful Standing checkpoint | **Persist sparingly or summarize** | needed for highs/history; rule must be explicit |
| Film totals and top records | **Derive** | FilmResult/theatrical history already holds inputs where complete |
| Film/person honor views | **Derive from outcome IDs** | prevents divergent copies |
| Ceremony animation/reveal cursor | **Discard / presentation state** | no simulation value |
| Alert seen/dismissed | **Presentation state** | two clients must not mutate world truth |
| Full invisible competitor ballot | **Discard unless gameplay needs it** | no legacy value; risks save growth |
| Retired-person identity needed by an honor | **Persist minimal snapshot + stable ID** | profile/history must survive roster changes |

### 22.3 Old-save law

- Migrations add empty award/history roots; they do not synthesize past awards.
- Read models expose `available`, `notRecorded`, `ineligible`, or `unavailable` rather than nullable ambiguity.
- Player copy says exactly when detailed history begins.
- Current films/people may still show safely derivable facts, but no retroactive ceremony occurs.

### 22.4 Performance requirements

- No per-frame traversal of the full 120-year event set in Unity.
- Projected history is revision-keyed/paginated or virtualized at presentation scale.
- Category, film, person, and period indexes are derivable from one authoritative record family.
- The save retains final facts, not screenshots, rendered prose, or animation state.
- IDs remain immutable across retirement, facility removal, save/load, and migration.

---

## 23. Legacy Data Contract

This is a recommendation for the future 2040 finale, not permission to implement that finale.

| Legacy fact | Current status | 2040 treatment |
|---|---|---|
| Founding date / studio identity | campaign starting state exists; durable named founding event needs confirmation | **Needs future durable fact** if identity/date can vary |
| Years operated | safely derivable from founding/time once above is exact | **Derive** |
| Films produced and release chronology | `FilmResult`, theatrical runs, permanent premiere events | **Already persisted / derive** |
| Creative/commercial film records | largely in FilmResult/run/ledger; some legacy fields optional | **Derive with availability state** |
| Audience historical scores | present per result; aggregate historical interpretation has frozen-share caveat | **Use frozen result facts only** |
| Film profit/contribution | current film record/read models where exact | **Derive; never allocate unknown overhead** |
| Person filmography/career changes | `TalentCareerEvent` from V5; participant records optional on older films | **Already persisted with Not recorded state** |
| Person retirement/career end | no complete durable authority identified | **Needs future durable event** |
| Awards/nominations | absent | **Needs future versioned award outcomes** |
| Rank/certificate history | absent | **Needs future progression events** |
| Current Standing | persisted triple | **Already persisted** |
| Standing arc/highs | not reconstructable from current triple alone | **Needs sparse checkpoints or published summary events** |
| Facilities/lot history | current state plus permanent construction/set events | **Partly persisted; extend only for meaningful retired identity** |
| Era transitions/technology firsts | no governing progression authority | **Future durable events** |
| Financial arc | ledgers/recap inputs exist | **Summarize/derive; do not retain every redundant weekly UI point** |
| UI views, camera, dismissed alerts | presentation only | **Discard** |

The future finale should consume this contract as evidence and compose an interpretation. It must not assign a single legacy score retroactively unless a separate, reviewed authoritative model is created.

---

## 24. Rival-system boundary

Rival studios are a legitimate future direction but absent from current authority. Package 08 therefore forbids:

- fabricated rival studio names, films, people, or scores;
- “ranked #1 in Hollywood” language;
- market share, competitor tables, or industry standings derived from the player alone;
- award ceremonies whose apparent field exists only in Unity flavor data.

Future rivals require re-review of:

- category eligibility field and tie laws;
- award cutoff and scheduling;
- studio ranking/market share terminology;
- named nominee disclosure;
- comparative records;
- whether a threshold-era player award history remains comparable to rival-era awards.

Any pre-rival Academy threshold model must store its rule version so later rival-field awards remain historically honest.

---

## 25. REQUIRED NEXT / FOLLOW-UP / LATER / DO NOT DO

### REQUIRED NEXT — P08A: Standing & Studio History Spine V1

Prove one bounded journey using existing authority:

1. The player opens Administration before a first release and sees the current early-studio Standing profile.
2. An accepted publicity action or a release week changes authoritative Standing.
3. The current client may show one source-labeled live change receipt.
4. The player selects Administration or the HUD Standing route.
5. A readable inspector explains all three current channels and, only while the live receipt exists, its exact before/after.
6. A release receipt is explicitly the whole-week delta, shared across all releases and including Awareness settling; it never pretends to be per-film.
7. After save/reconnect the inspector honestly shows current values with `Recent change history is not recorded`.
8. `Open Studio History` enters a retained workspace.
9. The default timeline shows each released film once and only the exact 1/10/25/50/100 release-count markers; production/lot history remains behind filters.
10. Film/person deep links preserve exact identity.
11. Back returns to the exact lot context.
12. Save/reconnect preserves history and never invents an award.

Scope ends before eligibility, ceremony, winner selection, rank unlocks, trophy props, or the 2040 finale.

### FOLLOW-UP

- Authoritative award registry, period, eligibility, outcome root, and migrations after Owner field/cadence decisions.
- First non-blocking ceremony workspace using immutable outcomes.
- Film/person Honors sections driven from the same outcome IDs.
- A durable, source-coded Standing-change witness/checkpoint root if the future Legacy package needs an exact arc rather than current state only. It must distinguish publicity, whole-week releases, and Awareness drift; P08A does not add it.
- Activate blueprint award/rank requirements only with end-to-end authority and fail-closed tests.

### LATER

- Nomination phase.
- Studio Progression/rank ladder and exact unlock campaign.
- Era-aware category rollout.
- Category-specific mechanical effects.
- Physical trophy case/plaques and player-curated honors display.
- Rival studios and a real comparative award field.
- Awards campaigning/publicity.
- Stunt/effects and technology categories when their facts exist.
- 2040 Studio Legacy finale.

### DO NOT DO

- Do not calculate eligibility, winners, Standing, Star Power, unlocks, or records in Unity.
- Do not widen the frozen three-channel `Standing` type with prestige/rank/legacy.
- Do not average cash, awards, facilities, and reputation into one authoritative score.
- Do not create fake competitors or flavor nominees.
- Do not backfill old-save awards.
- Do not store every week or every notification forever.
- Do not make ceremonies blocking, mandatory, or camera-hijacking.
- Do not reproduce the original's temporary universal award buffs.
- Do not treat platform achievements as studio history.
- Do not build the 2040 finale in Package 08.

### Owner decisions genuinely required

No Owner decision blocks **P08A — Standing & Studio History Spine V1**.

Before any award authority or ceremony implementation, two decisions are required:

1. **Pre-rival award field:** approve the recommended deterministic Academy threshold / “awarded elsewhere” model, or defer competitive awards until rival studios exist.
2. **Cadence:** choose the authoritative award period. Recommendation: an annual eligibility/result period with grouped, skippable presentation and a larger five-year historical summary. The original five-year-only cadence is too sparse for person-career recognition, but the repository currently has no award calendar, so this cannot be presentation convention.

An exact Studio Progression rank list, names, gates, and unlocks is a later Owner/content decision; it does not block P08A or the award data foundation.
