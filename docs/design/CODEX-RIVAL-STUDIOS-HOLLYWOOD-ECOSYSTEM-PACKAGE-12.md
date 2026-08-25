# CODEX — RIVAL STUDIOS & THE HOLLYWOOD ECOSYSTEM — PACKAGE 12

**Status:** accepted definitive design research; documentation only; no production authorization

**Audit date:** 2026-08-25

**Canonical baseline:** `main` at `c902a704eb948cc576083d0973c8c23e59937dc1`

**Research branch:** `codex/rival-studios-hollywood-ecosystem-research-12`

**Campaign authority:** the primary authored campaign runs 1920 → 2040 and culminates in the Studio Legacy finale. Endless continuation beyond 2040 is an unapproved future optional-mode decision. All 120-year / approximately 6,240-week endurance requirements remain binding.

**Companion:** [Package 12 Builder Annex](./CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12-BUILDER-ANNEX.md)

This report audits the supplied seed. It does not authorize production implementation, save migration, balance tuning, a new UI route, or work on another campaign branch.

## Evidence labels

Every material ruling uses one of the requested labels:

- **SOURCE VERIFIED** — directly supported by a cited external source, at the confidence stated.
- **PROJECT AUTHORITY VERIFIED** — supported by current Owner/project authority.
- **CURRENT CODE VERIFIED** — observed on the baseline or explicitly named read-only campaign branch.
- **INFERENCE** — a conclusion drawn from verified facts, not itself directly stated by a source.
- **PRELIMINARY RECOMMENDATION** — this package's design recommendation, still requiring implementation recon or normal checkpoint authorization.
- **REFUTED** — contradicted by the evidence.
- **OWNER DECISION REQUIRED** — a genuine product choice remains after the evidence and recommendation.
- **OPEN QUESTION** — the available evidence does not safely answer it.

“Verified” never means “engine formula recovered” unless the report says so. A manual can verify player-visible behavior without revealing implementation; a guide can report an observed rule without proving its weighting.

---

## 1. Executive decision

### Decision

**PROJECT AUTHORITY VERIFIED — Package 12's design boundary is accepted, without authorizing production implementation.** `docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md` authorizes persistent fictional studios, films, multi-studio awards, libraries/IP, dynasties, and acquisitions as possible long-term product directions. Current Owner law fixes the primary authored campaign at 1920 → 2040, culminating in the Studio Legacy finale, and permits rival distress/failure despite the player's no-hard-bankruptcy protection. Endless continuation beyond 2040 remains an unapproved future optional-mode decision; this does not weaken any 120-year / approximately 6,240-week endurance gate.

**PROJECT AUTHORITY VERIFIED — The two Package 12 decisions are resolved as current Owner law.** Every studio has an immutable stable `studioId`; the player chooses the studio display name during founding, and any future supported rename is a dated authoritative event that never changes the ID. P12A may include contract identity, authoritative employer ownership, deterministic initial allocation, one-employer exclusivity, cross-studio career/release credit, and noncompetitive renewal/replacement maintenance. Competitive bidding, poaching, negotiation, relationships, aging/retirement, and deeper labor-market systems remain deferred.

**PROJECT AUTHORITY VERIFIED — The fantasy is alternate fictional Hollywood.** Real cinema history supplies eras and industry weather; studios, people, films, rivalries, and dynasties are fictional. The Success Blueprint's Pillar 11 target and success test are verified: a player should be able to name the rival fought for thirty years and the star lost to it.

**PRELIMINARY RECOMMENDATION — Build rivals at fidelity Level 2: constrained project simulation.** Persist each studio's identity, policy, conserved operating resources, roster, active projects, films, Standing, and durable history. Abstract physical lot traversal and low-level production animation. A released rival film must still have consumed time, capacity, talent, and money and must have traversed an authoritative project lifecycle.

**PRELIMINARY RECOMMENDATION — P12A should prove business truth through shared talent exclusivity, not a fabricated box-office penalty.** The current engine has no active genre-saturation, release-overlap, screen-capacity, or audience-competition law. `MarketState.competingSlate` is empty at world generation and `computeBoxOffice()` hard-codes `competitionFactor = 1.0`. A rival contract that makes one persistent person unavailable to the player is the smallest current shared consequence that can be made honest. Audience and genre effects follow only after a separately authored market law applies identically to player and rivals.

**PRELIMINARY RECOMMENDATION — Defer Power Ranking from P12A.** The three existing Standing channels are persistent reputation state. A Power Ranking is a later, periodic momentum projection over enough comparative public history to justify a formula and typed reason facts. It must not become a casual average, a Unity-calculated score, or sports standings in disguise.

### Ten controlling rulings

1. **PROJECT AUTHORITY VERIFIED:** Hollywood outside the gate and the Package 12 design boundary are accepted; production implementation still requires its normal authorization.
2. **CURRENT CODE VERIFIED:** the player has no persistent `studioId` or `studioName`; the bridge projects the product brand `PROJECT: STUDIO`.
3. **CURRENT CODE VERIFIED:** `beginFounding()` still reprices the shared concept pool through `correlateConceptCost()`; this is a pre-rival infrastructure defect.
4. **CURRENT CODE VERIFIED:** save authority is V14 on canonical `main`, correcting the older V13 scout and seed-era assumptions.
5. **SOURCE VERIFIED:** the original shipped Studio, Star, and Movie Charts and direct comparison with competitors.
6. **SOURCE VERIFIED:** original genre interest responded to output from all studios, but no trustworthy formula, decay duration, or exact AI path has been recovered.
7. **SOURCE VERIFIED:** original research advantage was comparative; `televisionCompetition` remains a Project: Studio field, not original-game evidence.
8. **PRELIMINARY RECOMMENDATION:** rivals may abstract physical operations but never the conserved causes of player-visible competitive outcomes.
9. **PROJECT AUTHORITY VERIFIED:** P12A may include the approved minimum coherent cross-studio labor seam; current player-relative contracts are not sufficient.
10. **PRELIMINARY RECOMMENDATION:** retain durable identities and consequences, derive current views, summarize long-range trends, and discard deliberation/prose/UI state.

### The hard gate

> A rival film cannot appear if authoritative rival state says it could not have been made.

This is stricter and more useful than demanding player-equivalent lot simulation. Exact operational symmetry is unnecessary; causal honesty is mandatory.

---

## 2. Source confidence

### Project and code authority

| Evidence | Class | Confidence | Use in this report |
|---|---|---:|---|
| Package 12 acceptance and governance reconciliation, 2026-08-25 | Current Owner authority | Highest | accepts Package 12 and both decisions; fixes 1920 → 2040 Studio Legacy finale; leaves post-2040 Endless Mode undecided; preserves 6,240-week gates |
| `docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md` | Earlier Owner authority | High within unsuperseded scope | fictional-Hollywood direction, long-term legitimacy, player/rival failure asymmetry; any implication of guaranteed post-2040 continuation is superseded |
| `PROJECT-STUDIO-SUCCESS-BLUEPRINT.md`, Pillar 11 | Project blueprint | High | target fantasy, original parity floor, success test, no difficulty-tax rivals |
| Canonical `main` at `c902a704…` | Executable current code | Highest for current state | GameState V14, identity gap, market inactivity, save/RNG/history seams |
| `campaign/living-lot-ts` at `2ddf080…` | Read-only active campaign branch | High for that branch | verifies that current campaign work has not introduced rival authority, player identity, or market competition |
| Accepted Package 06/07/08/10/11 research branches | Project design record | High within their package boundaries | release, reception, Standing, people/contracts, finance, retention, and deferred seams |
| `docs/HOLLYWOOD-ECOSYSTEM-FUTURE-PROOFING.md` | Owner-accepted architecture scout | High, with dated citations | additive-root discipline and long-horizon hazards; its V13 statement is superseded by current V14 |

### Original *The Movies*

| Source | Source class | Confidence | Important limit |
|---|---|---:|---|
| [Official PC manual](https://cdn.akamai.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1380847876) | Shipped primary documentation | High | player-visible rules, not hidden weights or AI implementation |
| [*The Movies: Prima Official Game Guide*](https://archive.org/details/The_Movies_Prima_Official_eGuide) (Greg Kramer, 2005, ISBN 0-7615-4445-3) | Developer-reviewed / authorized guide | High for documented mechanics | Lionhead's Adrian Moore and Ollie Purkiss are credited with answering questions and reviewing the text; still not executable-code verification |
| [GameSpot walkthrough](https://www.gamespot.com/articles/the-movies-walkthrough/1100-6140049/) | Contemporary professional secondary | Medium-high | author observations include qualified words such as “apparently” and “seems” |
| [Maxx GameFAQs guide](https://gamefaqs.gamespot.com/pc/561567-the-movies/faqs/45308) | Contemporary community secondary | Medium-high when independently matching Prima | corroborates rival table, Studio weights/Capital curve, and talent observations; not executable confirmation |
| [JPaterson GameFAQs guide](https://gamefaqs.gamespot.com/pc/561567-the-movies/faqs/43496) | Contemporary community secondary; base-game route, written assuming *Stunts & Effects* is installed | Medium only when corroborated | useful chart/Awards/research cross-checks; its header does not consistently separate expansion-modified facts |
| [Rival-studio community database pages](https://the-movies-game.fandom.com/wiki/Category%3ARival_Studios) | Tertiary/community | Low-medium | useful only for name/community-memory cross-checking; its arrival windows are materially unreliable |
| [Official *Stunts & Effects* manual](https://cdn.akamai.steamstatic.com/steam/apps/7910/manuals/The_Movies_Stunts_Effects_Manual.pdf?t=1447351041) | Shipped primary documentation | High | verifies expansion additions; silence supports only “no verified change,” not proof of no code change |
| [GameSpot E3 2002 First Look](https://www.gamespot.com/articles/e3-2002-first-look-the-movies/1100-2866856/) | Contemporary professional pre-release secondary | Medium for what the preview reported | verifies that acquisition was reported as intended, never that it was a developer commitment or shipped mechanic |
| `THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md` and `THE-MOVIES-2005-SOURCE-REGISTER.md` | Project research compendium/index | Variable; inherits each underlying source | useful routing and contradiction register, not independent product authority; this pass re-opened promoted sources and corrected stale attributions |

Prima is unusually strong guide evidence because it credits Lionhead staff with answering questions and reviewing the text. It is therefore separated from ordinary secondary guides. It can establish its documented rules and tables at high confidence; it still cannot prove undocumented executable behavior or remove ambiguity in a table whose values require an unstated selection algorithm.

### Comparators

Official developer/publisher pages are high confidence for stated vision or announced features. They do not prove internal architecture. Patch notes are high confidence for the behavior the developer says changed. Steam/Reddit posts are community reports: high confidence that a complaint exists, low confidence that the inferred code architecture is correct. NBA 2K27 material is official planned UX but was pre-release on this report's 2026-08-25 audit date.

### Confidence discipline

- Where the manual and developer-reviewed guide agree, the visible behavior is **SOURCE VERIFIED**. Prima's 24/24/24/14/14 breakdown is verified as the strongest documented shipped law; executable implementation details remain unavailable.
- Where contemporary guides disagree on starting rival count, the report preserves the contradiction.
- Where official patch notes contradict a community claim that rival outputs are wholly random, the absolute claim is **REFUTED**; deeper lifecycle fidelity remains an **OPEN QUESTION**.
- Absence from the *Stunts & Effects* manual is reported as **NO VERIFIED CHANGE**, not proof of no change.

---

## 3. Original *The Movies* rivals reconstruction

### What shipped

**SOURCE VERIFIED — Competitive visibility was a first-class shipped surface.** The official manual's Studio Ranking rosette opened Star, Studio, and Movie Charts; the charts compared the player's studio, Stars, and films with the competition. Manual p.21 documents right-click breakdown/guidance for a Star entry, while GameSpot separately reports hovering the studio name to inspect Studio factors. No inspected source proves an equivalent per-entry inspection interaction for every Studio and Movie row. Stars from all studios appeared in Star Charts.

**SOURCE VERIFIED — Rival output had world consequences beyond a leaderboard.** Prima states that genre interest responded to how much of each genre all studios were releasing. Official and secondary material also establishes comparative technology, rival talent entering the player's hiring queue, deliberate sale of player Stars/scripts to rivals, and multi-studio award categories.

**INFERENCE — The original's strongest lesson is not its composite score.** Its combination of charts, shared taste, comparative research, talent movement, and awards let other studios touch several player systems. Project: Studio should reproduce that connectedness while preserving its newer separation of audience, industry, and commercial truth.

### What this pass did not recover

The following remain **OPEN QUESTION** at engine-law confidence:

- executable studio-ranking implementation details beyond the documented five-factor weights and Capital curve;
- the exact number active at every difficulty/date and whether entry rolls were randomized;
- whether a rival could close or disappear in retail play;
- genre-interest decay duration, saturation curve, and the exact AI-release input path;
- whether research was a fully persisted rival tree or an abstract comparative schedule;
- rival-to-rival transfers, contract-breaking bids, and whether a rival's film output actually depended on the Stars it acquired.

These gaps do not block successor design. They block false claims of exact parity.

---

## 4. Rival studio list, arrival, and genre findings

### Reconstructed named population

The developer-reviewed Prima table on p.51, closely corroborated by Maxx's GameFAQs guide, is the controlling roster evidence. Its values are reproduced as documented policy weights—not silently normalized into independent probabilities.

| Rival studio | Appears | Popular-genre trigger | Action | Comedy | Horror | Romance | Sci-Fi | Strongest fallback bias |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Old Rope Cinema | 1898–1902 | 25 | 30 | 50 | 30 | 20 | 10 | Comedy |
| Maxipack Worldwide | 1898–1902 | 30 | 20 | 40 | 20 | 50 | 30 | Romance |
| Lionear Productions | 1905–1907 | 18 | 20 | 30 | 50 | 30 | 20 | Horror |
| Creamboat Creations | 1916–1920 | 40 | 20 | 10 | 30 | 50 | 40 | Romance |
| Rigormortis Movies | 1928–1932 | 50 | 20 | 30 | 30 | 50 | 40 | Romance |
| Gusset Entertainment | 1937–1941 | 60 | 40 | 20 | 60 | 20 | 30 | Horror |
| Cletus's Shotgun Cinema | 1948–1952 | 70 | 60 | 20 | 30 | 30 | 50 | Action |
| Boney Studios | 1954–1958 | 75 | 40 | 60 | 60 | 50 | 40 | Comedy / Horror tie |
| Booboo & Dingo Films | 1967–1971 | 75 | 70 | 55 | 35 | 40 | 60 | Action |

**SOURCE VERIFIED — Named rivals combined a popular-genre response with stable fallback biases.** Prima describes a first chance to choose the currently most popular genre and otherwise consults the five genre propensities. Those fallback columns total more than 100, so they cannot all be standalone percentage chances. Their exact selector/normalization is an **OPEN QUESTION**. The safe historical claim is weighted personality plus variation, not “Comedy Studio always chooses Comedy.”

**SOURCE VERIFIED — There were nine named AI rivals, not nine or ten.** The ten-slot chart is the player plus nine competitors. The seed's “nine or ten rivals” formulation is **REFUTED**.

**OPEN QUESTION — Exact first-tick population.** Old Rope, Maxipack, and Lionear necessarily predate the 1920 player start. Creamboat's 1916–1920 window makes three pre-existing AI rivals certain and a fourth plausible depending on precise start/arrival law. A guide's “usually only three studios vying” is ambiguous about whether it includes the player. Do not state one exact opening count as engine law.

**SOURCE VERIFIED — Competitors entered within variable windows.** The exact RNG distribution, inclusive endpoints, and arrival tick are not documented.

**REFUTED — The community/Fandom arrival schedule is reliable enough to promote.** It materially conflicts with the developer-reviewed table. Prima's February 1958 Studio Chart already shows Boney, directly disproving the community 1965–1969 date.

**OPEN QUESTION — Closure.** No reliable inspected source establishes retail rival bankruptcy, disappearance, or acquisition.

**SOURCE VERIFIED at developer-reviewed-guide confidence — Prima documents a ten-release/five-year rival benchmark.** Its p.82 wording is collectively phrased (“rivals can only release 10 in five years”); context implies a per-competitor limit, but exact scope and executable enforcement remain unverified. It is useful cadence evidence, not proof of a real cash/capacity/phase pipeline or a successor film-spawn timer.

### Successor ruling

**PRELIMINARY RECOMMENDATION — Keep the principle, not the roster or counts.** Use deterministic seeded entrants, era-compatible curated name components, a bounded active-studio floor/cap, and weighted strategies. Do not reproduce the original names, trademark-adjacent jokes, exact arrival dates, or permanent genre caricatures.

---

## 5. Studio, Star, and Movie Charts

### Studio Charts

**SOURCE VERIFIED — Studio Ranking used one five-factor composite.** The manual names finances, movie quality, Star ratings, and lot prestige; the developer-reviewed Prima guide supplies the complete breakdown, independently matched by Maxx: Capital 24%, Movies 24%, Stars 24%, Lot Prestige 14%, Awards 14%. Layout, maintenance, services, and cleanliness feed Lot Prestige rather than forming extra top-level factors.

**SOURCE VERIFIED — The composite retained different time/roster laws beneath its headline weights.** Prima p.46 says individual Movies-factor contributions decay over time; pp.46–47 say Stars contribute unequally, with diminishing contribution down the roster; and p.51 says Awards counts only the most recent ceremony and reaches its maximum factor score at six awards. Those details are historical reconstruction, not successor recommendations.

**SOURCE VERIFIED — Capital used a diminishing-return curve in the documented guide law.** Prima/Maxx give a $50,000 floor, about a half score near $300,000, and the maximum-rating point at $1.6 million. The Mechanics Bible's alleged GameSpot attribution that “$5 million seems to be the limit” is **NOT RECOVERED / UNSUPPORTED** after checking the live walkthrough, an archived January 2006 page, and exact-phrase search. Separately, $5 million as the documented Capital factor's maximum-rating point is **REFUTED** by Prima/Maxx's $1.6 million law.

**SOURCE VERIFIED — Relative rank and absolute studio level were distinct.** Guides distinguish the one-through-ten chart position from a separate zero-to-five-star Studio level. The original nevertheless used one composite to order the comparative chart.

**SOURCE VERIFIED — The original exposed factors, not merely an unexplained place number.** Manual p.21 establishes right-click breakdown/guidance for Stars; GameSpot establishes hover guidance over the studio name for Studio factors. Equivalent Movie-row inspection is **NOT VERIFIED**. The supported explainability principle matters more than copying the composite.

### Star Charts

**SOURCE VERIFIED — Stars from every studio were charted.** The official manual says chart position was based on more than the visible Star rating, including media/PR and relationship context. Secondary guides expose further factors, but no successor should rebuild their exact composite from guide prose.

### Movie Charts

**SOURCE VERIFIED at developer-reviewed-guide confidence — Movie Charts were not a pure revenue list.** Prima explains that Final Movie Rating determined chart position and weighted Movie Quality strongly; two films with the same success/revenue could rank differently based on quality/execution. This is historically useful but incompatible with Project: Studio's authoritative separation of critic, audience, and business results.

### Successor ruling

**PRELIMINARY RECOMMENDATION — Adopt competitive visibility; reject a universal score.** Studio Charts should offer separate Audience Awareness, Industry Prestige, Commercial Confidence, output, and—later—momentum views. Movie views keep critic, audience, and commercial lanes separate. Talent views distinguish role ability, Star Power/market standing, current momentum, and awards rather than inventing a hidden “best person” score.

---

## 6. Talent defection

### Direction-by-direction audit

| Direction | Finding | Ruling |
|---|---|---|
| Rival Star → player's Stage School queue | Prima p.8 directly documents the queue arrival, calls it attempted defection, and preserves visible career state/expectations; GameSpot independently corroborates periodic arrivals | **SOURCE VERIFIED** |
| Player deliberately sells Star → rival | Official manual describes a facility for selling Stars and scripts to rival studios | **SOURCE VERIFIED** |
| Unhappy player Star → another studio | Official manual p.15 says badly treated Stars may seek another studio and walk off the lot | **SOURCE VERIFIED** |
| Fired player Star → another studio | Prima states a fired Star is immediately hired elsewhere | **SOURCE VERIFIED** at developer-reviewed-guide confidence |
| Rival and player bid under one formal contract law | Not established as an original shipped law | **REFUTED** as historical parity claim; valid successor expansion |

**MATERIAL SOURCE CORRECTION — GameSpot establishes rival-to-player arrival, not the unhappy player-Star departure direction.** The latter is established by the official manual. Selling, firing, unhappiness, and contract-expiry bidding are distinct mechanisms and must not be collapsed into one “poaching” label.

Prima adds that an arriving rival Star retained current Star rating, age, Mood, and genre experience and arrived with salary, trailer, and entourage expectations appropriate to status. Prima pp.45–46 also ties the queue's number and stature of rival Stars to the player's Studio Rating. This is **SOURCE VERIFIED** persistence of visible career state across a move. It does not prove a globally unique executable ID or prove that a rival's film output depended on its roster.

### Successor ruling

**PRELIMINARY RECOMMENDATION — A shared labor market is mandatory; arbitrary theft is forbidden.** One person has one ID and one current employment state. Movement occurs at contract expiry, lawful release, or another future contract mechanism that explicitly permits competing offers. A rival may not teleport a person out of an active guaranteed contract.

P12A can establish employer ownership and availability without building full auctions or poaching. That is enough to prove shared scarcity: the performer used by a rival film is the same person the player cannot simultaneously sign.

---

## 7. Genre saturation

**SOURCE VERIFIED — The original had global genre-interest pressure.** Prima says public interest in genres changes over time and with future events, and explicitly says the amount of each genre currently reaching the market from all studios affects taste. Oversaturation or releasing after a rival has exhausted the audience can produce a weak performer. The guide recommends monitoring rival preferences.

**OPEN QUESTION — Exact law.** No inspected source safely establishes the curve, lookback window, recovery duration, whether every rival release used precisely the same bookkeeping path, or how forecast future events combined with recent output.

**REFUTED for current Project: Studio — A dormant `competingSlate` proves existing saturation authority.** Current world generation sets it to `[]`; `computeBoxOffice()` uses `competitionFactor = 1.0`; market forces, segment shares/tastes, and base value do not evolve through rival output. The field is a placeholder, not a mechanic.

**PRELIMINARY RECOMMENDATION — Defer saturation from P12A.** A future market package may author two distinct laws:

1. **release overlap:** films contest attention during overlapping runs; and
2. **genre fatigue:** recent aggregate exposure changes later appetite.

Both require one TypeScript authority, identical player/rival inputs, bounded lookback or rolling aggregates, and player-facing reasons such as “four major Comedy releases in the last 13 weeks.” Neither may appear first as an invisible rival penalty.

---

## 8. Technology race

**SOURCE VERIFIED — Research lead was comparative in the original.** The official manual says research unlocked sound, color, CGI, facilities, sets, and costumes faster than rivals; early access improved film quality and helped the studio rise above others. Prima similarly describes technology as relative and valuable while ahead of its natural discovery date.

Prima's stronger reconstruction is **SOURCE VERIFIED at developer-reviewed-guide confidence:** research packs had default industry unlock dates; early research could grant access before that date; movie-making advances produced a larger Success benefit while farther ahead; and the relative novelty benefit disappeared when the technology became ordinary. That is comparative adoption timing with a global backstop, not evidence of fully simulated rival laboratories.

**OPEN QUESTION — Rival technology fidelity.** The sources do not reveal whether each rival stored a visible full tree, followed authored unlock schedules, or participated through a smaller comparative abstraction.

**CURRENT CODE VERIFIED — `EraConfig` is global but inert for this purpose.** It contains `soundRequired`, `televisionCompetition`, `censorship`, and `costScale`. World generation uses neutral/static values. There is no rival technology state or competitive research system.

**REFUTED — `televisionCompetition` is proof of original TV rivalry.** It is a Project: Studio field. The historical corpus warning remains correct.

**PRELIMINARY RECOMMENDATION — Package 13 owns the tree and era truth.** Package 12 needs only a future per-studio adoption/investment seam that consumes one global technology catalogue and can expose public milestones. Do not clone the research tree per rival or invent P12A tech leads.

---

## 9. Awards coupling

**SOURCE VERIFIED — The original held an awards ceremony every five years for films, Stars, and studio achievements.** Award bonuses lasted until the next ceremony. Contemporary guide material identifies inherently comparative categories including charting/climbing studio, prolific output, lot prestige, and highest-ranking film/person results.

Prima's base-game directory documents this comparative field:

| First ceremony | Category | Comparative input |
|---:|---|---|
| 1925 | Highest Charting Star | Star Charts |
| 1925 | Highest Charting Studio | Studio Charts |
| 1925 | Highest Charting Movie | Movie Charts |
| 1930 | Most Prestigious Studio Lot | Lot Prestige |
| 1935 | Highest Climbing Studio | chart movement since prior ceremony |
| 1940 | Most Prolific Star | appearances since prior ceremony |
| 1945 | Best Employer | average Star Mood |
| 1950 | Best Direction | director performance in an eligible top-ten movie |
| 1955 | Highest Charting Newcomer | highest-ranked recently hired Star |
| 1960 | Most Prolific Studio | releases since prior ceremony |
| 1965 | Best Acting Performance | acting performance in an eligible top-ten movie |
| 1970 | Highest Climbing Star | Star Chart movement |
| 1975 | Movie Quality Output | sum of Final Movie Ratings in the period |

**MATERIAL CORRECTION — Rival coupling was broader than a few categories with “Studio” in the title.** Rival studios, films, and people supplied essentially the whole comparative field; chart outcomes fed awards, awards contributed 14% of Studio Rating in the documented formula, and temporary bonuses fed later competition.

**SOURCE VERIFIED — The original Studio Rating did not retain lifetime Awards performance.** Prima p.51 says only the most recent ceremony fed the 14% Awards factor, capped at six awards. That rolling rating input is distinct from durable ceremony history; Project: Studio should preserve historical results even when current Standing/momentum no longer weights them.

**SOURCE VERIFIED — *Stunts & Effects* added stunt-specific awards and achievements.** Its manual describes new stunt awards whose bonuses provided an edge over rival studios. It does not establish a redesign of the underlying rival population or chart system.

**PROJECT AUTHORITY VERIFIED — Package 08 owns Awards/Standing.** Package 08 currently has no multi-studio nominee authority and forbids fabricated competitors. Its future evidence contract needs stable studio, film, and person IDs; eligibility facts; public outcome inputs; and durable result references.

**PRELIMINARY RECOMMENDATION — Package 12 supplies eligible entities and history, not ceremony logic.** Rival films and people must be representable in the same nomination pool. Awards writes the result; Package 12 consumes that result for profiles, history, Standing, and future momentum reasons.

---

## 10. Pre-release acquisition distinction

**SOURCE VERIFIED as a contemporary professional pre-release report — [Early GameSpot coverage](https://www.gamespot.com/articles/e3-2002-first-look-the-movies/1100-2866856/) reported acquiring competitors as a possible growth path.** This verifies what the preview reported about 2002 intent; it is not primary evidence of a developer commitment and not evidence of the 2005 retail game.

**REFUTED — Acquisitions were a verified shipped *The Movies* mechanic.** No retail manual, Prima passage inspected for this report, shipped walkthrough, or expansion manual establishes acquisitions. The seed correctly warned against parity laundering.

**PROJECT AUTHORITY VERIFIED — Successor acquisitions are independently legitimate future direction.** That authority comes from the Owner ruling, not historical parity.

**PRELIMINARY RECOMMENDATION — Preserve identity/ownership compatibility only.** Stable studio and film IDs, historical ownership facts, and non-destructive archives must make later mergers, labels, libraries, and co-productions possible. P12A implements none of them.

---

## 11. *Stunts & Effects* / Superstar findings

### Verified changes

**SOURCE VERIFIED — *Stunts & Effects* adds stunt performers, stunt production inputs, stunt-sensitive movie ratings, and stunt-specific competitive Awards and Achievements.** Its 1960 content layer changes what films, Awards, and Achievements can contain.

### No verified change

For rival count/arrival, studio identities, base genre preferences, core Studio/Star/Movie Charts, ordinary talent movement, or the base technology race, the ruling is **NO VERIFIED CHANGE**. The expansion manual says the basic game remains intact and does not document new laws in those areas.

**OPEN QUESTION — Executable differences not documented by the manual.** Silence is not proof that the expansion binary changed nothing internally.

[Feral's June 30, 2009 Mac bundle announcement](https://www.macworld.com/article/198523/superstar-2.html) and the [Application Systems product page](https://www.application-systems.de/themoviessuperstar/) identify “Superstar Edition” as a bundle of the base game, *Stunts & Effects*, bonus soundtrack material, and advertised exclusive costumes/sets. **REFUTED — Superstar Edition introduced a third rival-system revision.** For rivalry it inherits the base-plus-expansion findings.

---

## 12. *Hollywood Animal* lessons

### Official vision

**SOURCE VERIFIED as official vision —** the [October 2024 developer announcement and trailer](https://steamcommunity.com/games/2680550/announcements/detail/4553794655131533958) describe studios with differing ideas about cinema/business contesting talent, viewers, advertising space, and magazine coverage. The [official store page](https://store.steampowered.com/app/2680550/Hollywood_Animal/) presents broad studio strategies, audience taste, technology, talent contracts, and delaying a release to avoid competition.

**SOURCE VERIFIED as developer-stated behavior —** [August 2025 beta notes](https://steamcommunity.com/games/2680550/announcements/detail/617675310979089584) say competitor-film ratings and box office became more dependent on script quality, participating talent, and invested resources. They describe player targeting at contract expiry, an instant blackmail-based poaching exception, and competitors poaching player employees; they do not establish a symmetric contract law. [January 2026 notes](https://steamcommunity.com/ogg/2680550/announcements/detail/529869613052202358) describe broader competitor participation and tuning.

### Anti-pattern audit

**SOURCE VERIFIED only as community report —** players have alleged that competitor films lack an inspectable production lifecycle or use highly abstract generated results in an [October 2025 Steam discussion](https://steamcommunity.com/app/2680550/discussions/0/671725387533851402/) and [November 2025 event comment](https://steamcommunity.com/app/2680550/eventcomments/689741692082946455/). A [May 2026 Reddit report](https://www.reddit.com/r/hollywood_animal_game/comments/1t5wjvt/alliance_only_follows_rules_when_youre_in_it/) alleges visible rule asymmetry. Those perceptions are useful evidence of a trust failure, not proof of the source code.

**REFUTED in absolute form — “Hollywood Animal rival results are wholly unconstrained random rolls.”** Official patch notes explicitly say script, talent, and investment affect results. Whether time, capacity, and finances are conserved through a complete lifecycle remains an **OPEN QUESTION**.

### Translation

**COPY PRINCIPLE:** shared scarcity, recognizable policy, competitor-aware releases, bidirectional talent competition, and outcomes grounded in project inputs.

**DO NOT COPY:** crime, violence, blackmail, sabotage, promotional claims as architectural proof, or any visible rule asymmetry.

**PROJECT: STUDIO TRANSLATION:** a Level-2 project sim makes the causal state testable without rendering rival lots. If a director leaves or funding disappears, dependent rival projects must change.

---

## 13. *Software Inc.* lessons

**SOURCE VERIFIED —** the [official site](https://softwareinc.coredumping.com/) and [Steam page](https://store.steampowered.com/app/362620/Software_Inc/) describe a simulated/randomized market, player-action-shaped history, competitor products and franchises, personnel poaching, deals/patents/stocks, and takeovers. Its [data-modding documentation](https://softwareinc.coredumping.com/wiki/index.php/Data_Modding) describes bounded company types, founding likelihoods, counts, specializations, and product effort/frequency at secondary/version-lag confidence.

**SOURCE VERIFIED as active development, not completed mechanics —** the [June 2026 breaking-overhaul announcement](https://steamcommunity.com/games/362620/announcements/detail/667238910445749820) and [August 2026 work-in-progress update](https://steamcommunity.com/ogg/362620/announcements/detail/672876654794637447) document ongoing plans/progress, including IP-specific followings and in-world product advertising. Exact current tuning and work-in-progress mechanics are not a stable target.

**COPY PRINCIPLE:** persistent firms/products, shared labor, a market that records alternate history, and bounded data-driven entrants.

**DO NOT COPY:** nondeterministic generation, office simulation parity, stock-market detail, hostile takeovers, subsidiaries, or exact probabilities/counts.

**PROJECT: STUDIO TRANSLATION:** stable IDs plus seeded weighted policies can generate coherent companies without a general AI. Preserve IP and ownership seams; defer Studio Empire mechanics.

---

## 14. Sports Power Ranking lessons

**SOURCE VERIFIED as official planned UX —** the official [NBA 2K27 MyNBA Courtside Report](https://youtu.be/GqulFBLQRbg), linked by the dated [2K Newsroom announcement](https://newsroom.2k.com/news/nbar-2k27-mynba-answers-the-community-with-a-back-to-basics-franchise-overhaul-and-modern-cba-rules), describes free-agency recaps containing major signings, league Power Rankings, and remaining high-value talent, followed by a separate offseason winners/losers summary. The announcement also advertises a planned 100-year franchise universe; that supports long-horizon information architecture, not performance or retention claims.

**MATERIAL CORRECTION — NBA 2K27 was not yet released on the audit date.** Early access was scheduled for 2026-08-26 and worldwide launch for 2026-09-04. This is publisher-announced information architecture, not observed shipped behavior.

**OPEN QUESTION — Formula and explainability.** The source does not disclose ranking inputs, movement calculation, reason facts, tie behavior, or cadence outside free agency.

**COPY PRINCIPLE:** compactly answer what changed, who signed or changed teams, and who remains available.

**DO NOT COPY:** standings logic, daily sports cadence, unexplained editorial winners/losers, or an opaque ranking formula.

**PROJECT: STUDIO TRANSLATION:** use a lower-noise Industry Pulse driven by typed material events. Add a Power Ranking only after Project: Studio authors its own meaning and reasons.

---

## 15. Adopt / Adapt / Reject

| Topic | Ruling | Classification | Why |
|---|---|---|---|
| Persistent named rivals | **ADOPT** | **PRELIMINARY RECOMMENDATION** | Core fantasy; original and comparators support recognition/history |
| Shared scarce resources | **ADOPT** | **PRELIMINARY RECOMMENDATION** | Competition needs consequences, beginning with talent exclusivity |
| Original Studio/Star/Movie visibility | **ADOPT** | **SOURCE VERIFIED → recommendation** | Direct comparison made Hollywood legible |
| Single original-style prestige/composite | **REJECT** | **PROJECT AUTHORITY VERIFIED** | P08 has three distinct Standing channels; P07 separates reception/business |
| Original named rival roster/count | **REJECT as target** | **PRELIMINARY RECOMMENDATION** | nine AI are verified historically, but the successor needs its own fiction/scale and the exact first-tick count remains open |
| Genre-biased identity | **ADAPT** | **PRELIMINARY RECOMMENDATION** | Weighted tendency, not permanent class |
| Full rival physical lots | **REJECT for P12A** | **PRELIMINARY RECOMMENDATION** | High cost, little necessary management truth |
| Unconstrained film generator | **REJECT** | **PRELIMINARY RECOMMENDATION** | Fails anti-façade gate |
| Full player-equivalent operational sim | **REJECT as default** | **PRELIMINARY RECOMMENDATION** | Physical pathing/animation is not needed for causal truth |
| Shared audience/genre competition | **ADAPT / LATER** | **CURRENT CODE VERIFIED** | Valuable, but current authority is inert |
| Lawful two-way talent market | **ADOPT, staged** | **PRELIMINARY RECOMMENDATION** | Shared identity first; bidding/poaching later |
| Comparative technology | **ADAPT / P13 seam** | **SOURCE VERIFIED** | One global tree, per-studio adoption/lead state |
| Multi-studio awards | **ADAPT / P08 seam** | **PROJECT AUTHORITY VERIFIED** | Package 12 supplies eligible state; P08 owns ceremony/results |
| Industry Pulse | **ADOPT** | **PRELIMINARY RECOMMENDATION** | Event-driven world context without simulation invention |
| Power Ranking | **DEFER from P12A** | **PRELIMINARY RECOMMENDATION** | Needs enough rival history and an authored TypeScript formula |
| Acquisitions/co-productions | **DEFER** | **PROJECT AUTHORITY VERIFIED** | Stable identity compatibility only |
| Sabotage/crime | **REJECT for core P12** | **PRELIMINARY RECOMMENDATION** | Does not serve the studio-management heart |
| Rival bankruptcy/failure | **ADOPT later** | **PROJECT AUTHORITY VERIFIED** | May create history if caused by conserved state |
| Fictional backfill in old saves | **REJECT** | **PROJECT AUTHORITY VERIFIED** | P08 law: do not invent history that was never simulated |

### Material seed/corpus correction register

| Seed or inherited claim | Final classification | Correction |
|---|---|---|
| original field reached “nine or ten rivals” | **REFUTED** | nine named AI rivals; ten chart entries includes player |
| exact opening rival count is three | **OPEN QUESTION** | three AI studios certainly predate 1920; Creamboat may make four at the boundary |
| community/Fandom arrival schedule | **REFUTED** | Prima/Maxx table controls; February 1958 screenshot already contains Boney |
| genre figures are independent percentages | **REFUTED** | fallback columns exceed 100; treat as relative/unnormalized propensities |
| all-studio genre saturation existed | **SOURCE VERIFIED** | qualitative global law; exact curve/window remains open |
| GameSpot proves both talent directions | **REFUTED** | GameSpot proves rival→player; manual p.15 proves unhappy player→another studio |
| the Bible's `$5m` Capital sentence is recoverable from GameSpot | **NOT RECOVERED / UNSUPPORTED** | live/archived walkthrough and exact-phrase search did not recover it |
| `$5m` is the documented Capital maximum-rating point | **REFUTED** | Prima/Maxx document $1.6m; this ruling is separate from attribution recovery |
| awards coupling was limited to a few Studio categories | **REFUTED** | studios, films, and people fill nearly the entire comparative ceremony |
| original tech race proves peer R&D simulation | **REFUTED** | relative adoption advantage verified; rival labs/budgets/tree are not |
| retail acquisitions shipped | **REFUTED** | only pre-release aspiration found |
| *Stunts & Effects* had no verified award variant | **REFUTED** | official expansion manual explicitly adds competitive stunt awards/achievements |
| Superstar Edition was another rival ruleset | **REFUTED** | it is documented as a base-plus-expansion bundle |
| JPaterson FAQ 43496 is a clean base-only or clean S&E-only source | **REFUTED by corpus provenance audit** | the directly read base-game-route guide says it assumes S&E throughout and does not consistently flag expansion changes |
| current save is V13 | **REFUTED** | canonical `main` is V14 |
| current 30-concept pool still caps the player at 30 films | **REFUTED by current V14** | renewable original screenplay minting removed that old terminal cap; concept identity remains append-only |
| shared concept repricing was fixed by later campaigns | **REFUTED** | `beginFounding()` still mutates the world-level pool on current main and inspected living-lot branches |
| current market is merely shallow competition | **REFUTED** | rival release/genre competition is absent; factor is 1.0 |
| `unavailable` is already rival employment | **REFUTED** | it has no employer identity or contract ownership |
| current Studio Calendar is an industry release calendar | **REFUTED** | it is a read-only player operations outlook and creates no schedule |
| Power Ranking inputs/movement are supported by NBA evidence | **REFUTED** | NBA supports recap packaging only; formula/reasons are Project invention |

---

## 16. Rival ecosystem doctrine

### Truthful abstraction

**PRELIMINARY RECOMMENDATION — Adopt the seed's core law with one refinement:**

> Rivals do not require player-equivalent physical lots. Every player-visible rival consequence must nevertheless be the result of persisted or deterministically derived authoritative rival state, evaluated by the same observable industry law that evaluates the player.

This produces three layers:

1. **Common industry truth.** Studio/person/film identity, employer, ownership, public Standing, market state, technology catalogue, awards results, and release outcomes have one authority.
2. **Constrained rival business truth.** Cash, obligations, capacity, roster, projects, durations, costs, release/result inputs, and distress causes are real but compact.
3. **Abstract private operations.** Rival walkers, room queues, set dressing, janitors, animation, and camera staging need not exist unless a later feature exposes them.

Exact symmetry is not the target. If the player physically routes an actor to a stage while a rival reserves the actor in one business-level project state, that is acceptable. It becomes unacceptable if the rival releases the film after losing the required actor, exceeds its declared capacity, or spends resources it does not possess.

### Seven invariants

1. **One entity, one ID.** A studio, person, film, project, contract, or event is never copied for a different surface.
2. **One shared-law authority.** Unity/browser render projections; they do not calculate rank, availability, saturation, awards, or rival results.
3. **Conservation before drama.** Time, capacity, talent, and money constrain every visible rival release.
4. **Facts before copy.** News stores typed events and renders text; prose is never simulation input.
5. **Determinism before variety.** Seeded policy and bounded mistakes produce variety; wall clock, network calls, `Math.random`, ML, and LLM decisions are forbidden.
6. **Public does not mean omniscient.** The read model enforces disclosure; private strategy, cash, salaries, and unrevealed projects stay private.
7. **History is consequences, not deliberation.** Persist releases, moves, awards, entry/exit, ownership, and material milestones; discard rejected action candidates and weekly debug traces.

### The anti-façade acceptance test

In a controlled same-seed harness, remove one required resource—director, budget, or project-capacity slot—from a rival project before its gate. The project must delay, repackage, cancel, or fail the gate. Restore the resource and prove deterministic recovery. A release with the unchanged date/result is a package-blocking defect.

---

## 17. Rival identity

### Common business identity, asymmetric operations

**CURRENT CODE VERIFIED — `Studio` is a frozen singleton leaf with only cash, Standing, active productions, and released films.** It has no ID or name. Widening it would contaminate the frozen save chain. The browser's `studioName` is `STUDIO_LOT_BRAND`, explicitly substituted because no per-save name exists.

**PRELIMINARY RECOMMENDATION — Add a versioned common business-identity root and retain the existing player operational roots.** Conceptually:

- one studio identity collection includes the player and every rival;
- one role/reference identifies which identity owns the rich player lot;
- rival business state points to the same identity type but uses the constrained operational model;
- charts, awards, films, talent, history, and future ownership consume common IDs.

This is “same entity type” for industry identity, not “same entire simulation object.” Do not widen frozen recursive leaves in place: at minimum `Studio`, `Standing`, `Production`, `TheatricalRun`, `FilmResult`, `Talent`, `Contract`, `FilmConcept`, `FilmParticipants`, `MarketState`/`CompetingRelease`, `FoundingState`, `TalentCareerEvent`, and `EraConfig`. They recur through historical versions and exact-key validators. P12A must not add employer to `Talent` or owner to `Production`/`TheatricalRun`; P12C must not widen today's placeholder `CompetingRelease`.

### Minimum authoritative identity

The exact TypeScript names require implementation recon. The conceptual contract is:

| Fact | Persistence | Notes |
|---|---|---|
| immutable studio ID | durable | allocated against a taken set; never a display name |
| display name / short label | durable current value | uniqueness within a save; rename history only if renaming exists |
| nullable/known founding date, entry week, and history-start week | durable | migration may know entry/recording but not founding; never invent a date |
| active/historical state | durable | active, dormant/closed later; never delete identity |
| deterministic visual identity | durable seed or explicit tokens | logo mark, palette, abbreviated wordmark; presentation data only |
| player/rival role | durable relationship | role may change only if future ownership gameplay explicitly allows it |
| strategy state reference | rival-private | not exposed as raw weights |
| public profile facts | derived projection | Standing, observed tendencies, known roster, films, milestones |

### Names and brands

Use curated, era-compatible fragments or authored pools with seeded composition, phonetic filters, collision checks, and a prohibited/real-studio list. A generated name is persisted once. Do not regenerate it after load, translate it into a new identity, or create endless prose biographies. Character should emerge from output and history.

Logos are compact deterministic presentation identity: a mark family, palette, and wordmark treatment. They must make chart rows, film cards, and Gazette items recognizable. They do not justify storing raster blobs in every save.

### Film ownership and frozen leaves

Current `FilmResult` and `TheatricalRun` are studio-less frozen leaves. The implementation recon should choose an additive ownership/index record or a new common industry film record without duplicating outcome authority. Existing player film ownership is derivable because only the player existed; adding that known association during migration is not fictional backfill. Existing production IDs must never be reformatted because they are cross-reference and RNG keys.

**P12A identity-walker invariant:** every new root that can carry a production/film ID must participate in `persistedProductionIds()`; every new concept/screenplay-bearing root must participate in `persistedConceptIds()`. Allocation must check those complete walkers. A local taken-set test that ignores another persisted root is insufficient and can corrupt cross-references or RNG identity after migration.

---

## 18. Studio strategy model

### Weighted policies, not RPG classes

**PRELIMINARY RECOMMENDATION — Persist bounded policy weights and derive any public label from behavior.** Useful hidden dimensions include:

- genre affinity vector;
- intended production scale and portfolio mix;
- release cadence versus reserve preference;
- commercial, audience, and prestige emphasis;
- talent acquisition/retention aggressiveness;
- technology adoption aggressiveness when Package 13 exists;
- marketing propensity when a shared marketing law exists;
- risk tolerance, cash-reserve target, and willingness to cancel;
- adaptation strength and memory horizon.

“Volume house,” “prestige boutique,” “mass-market major,” “genre specialist,” “talent-driven,” and “technology leader” may be useful design presets or player-facing summaries. They are not permanent enum classes. Two studios can begin from related presets and diverge through seed, roster, resources, and results.

### Observed identity

The profile should say “Known for Drama” only from a typed, disclosed observation rule over a sufficient released-film sample. Until then it can say “Identity still emerging.” Never expose the raw `dramaWeight = 0.74`, and never assert a tendency merely because a generator assigned it.

### Adaptation without convergence

P12A needs only static seeded policy plus bounded decision imperfection. A later wave may add capped adaptation:

- successful genres can move preferences within a limited band;
- repeated misses can change budget/risk/cadence;
- roster strengths can influence packaging;
- a durable identity anchor prevents every studio converging on the same current optimum;
- annual review updates policy state; weekly releases do not thrash it.

The exact learning rates are tuning, not this report's authority.

---

## 19. Decision model

### Smallest believable architecture

Each rival decision window follows a deterministic four-stage pipeline:

1. **Enumerate legal candidates.** Develop a concept, package/greenlight, assign or replace talent, invest, delay/cancel, sign/renew, or hold cash—only where current phase and resources permit.
2. **Evaluate authoritative consequences.** Read that studio's strategy, cash/reserves, capacity, roster, current projects, public/global conditions, and bounded forecasts.
3. **Score with bounded imperfection.** Stable policy weights plus a versioned, studio-specific derived RNG stream create mistakes and variety without changing legality or resources.
4. **Choose with a total order.** Score, deterministic noise, candidate kind, stable entity ID. Never depend on object/hash iteration accident.

There is no ML and no LLM in the simulation loop. The current `OracleAgent` is explicitly omniscient benchmark code and is not rival scaffolding. Its candidate-scoring shape may inspire tests; its information access and optimality may not ship as AI behavior.

### Cadence

| Cadence | Work |
|---|---|
| Every authoritative week | settle costs/revenue, advance active phases, release due resources, check hard gates |
| Event boundary | choose replacement/next action when development, contract, capacity, or release state changes |
| Every 13 weeks | slate/capacity review; produce the natural Industry Pulse comparison window |
| Every 52 weeks | bounded strategy/reserve review and long-horizon summary |

A studio with no decision boundary does not re-score hundreds of candidates every week. Event queues should carry stable IDs and weeks, not closures or generated prose.

### Determinism contract

- New rival/world-entry purposes use versioned derived RNG streams keyed by immutable studio/event ordinals.
- No rival decision advances or perturbs the player's existing persisted RNG stream.
- Candidate generation order is explicit.
- Rank ties, simultaneous offers, closures, and entrants use documented stable tie rules.
- Same save bytes plus same action sequence yield byte-identical authoritative history.

---

## 20. Rival simulation fidelity

### Level ruling

| Level | Description | Ruling |
|---|---|---|
| 0 | names and scores with no causal business state | **REJECT** |
| 1 | generated films conditioned only on studio profile/time | **REJECT**; still façade competition |
| 2 | constrained projects consume talent, cash, capacity, and time; physical work is abstract | **ADOPT** |
| 3 | player-equivalent buildings, walkers, reservations, rooms, and animations | **REJECT as default**; future bespoke use only |

Level 2 must be deep enough to make these statements true:

- a studio cannot start more simultaneous projects than its capacity;
- assigned people cannot work for another studio/project where the shared law forbids it;
- a project cannot pass a phase without duration and required inputs;
- project and marketing spending reduce conserved funds;
- films use authoritative result inputs and become durable history;
- financial distress changes available actions and can eventually cause closure;
- removing a cause changes the consequence.

The full subsystem-by-subsystem fidelity matrix is in the Builder Annex.

---

## 21. Rival film lifecycle

### Minimum honest lifecycle

1. **Development.** A persistent project references a stable concept/screenplay identity, working title, genre, start week, owner, planned scale, and development cost/duration.
2. **Package / greenlight.** Legal talent assignments, budget, expected duration, financing/reserve check, and a capacity slot are frozen or explicitly versioned.
3. **Production.** Weekly time and studio capacity are consumed. Required people remain committed under the same exclusivity law used by the player at the business level.
4. **Post.** Time/cost/capacity settle. Physical editing-room behavior may be abstract.
5. **Ready / release.** P12A may retain current automatic release semantics; strategic release-date choice waits for a real calendar law. A committed public date exists only when authority exists.
6. **Result.** The shared/pure reception and financial laws consume frozen inputs and versioned RNG. Outcome becomes a durable film record.
7. **Archive or cancellation.** Resources release; sunk costs remain; typed reasons persist only if material.

### Required project truth

At minimum a rival project must resolve:

- immutable project/film ID and owner studio ID;
- concept/title/genre identity;
- phase and phase dates;
- assigned writer/director/cast/craft references at the fidelity the result law reads;
- budget and actual spend categories;
- capacity commitment;
- authoritative result-input snapshot;
- public disclosure state;
- cancellation/release outcome.

### Reuse boundary

Current reception/forecast functions are pure enough to reuse when supplied compatible inputs. Current player `Production` is not a suitable universal rival object: it is embedded in a singular `Studio`, assumes player roots and production semantics, and lacks owner identity. A dedicated common business-level film contract with player/rival adapters is safer than forcing rivals through physical player operations.

Current `FilmResult` is a useful outcome vocabulary, not immediately a complete multi-studio record. A common projection should preserve critic, audience, and business separation; freeze release-time archival title/genre/participants; and also resolve the current display title from the live concept because current player Film Chronicle/cards permit post-release retitling. Replacing that with one permanently frozen public title would be a separate product-law change.

**CURRENT CODE VERIFIED — V14's renewable screenplay source is player-singleton infrastructure, not rival-ready reuse.** `originalScreenplays` mints global `concept-orig-NNNN` identities and `MovieBlueprint` provenance is studio-relative. P12A therefore needs a deterministic rival-safe renewable screenplay/provenance source, collision-safe allocation across every concept-bearing root, and complete `persistedConceptIds()` coverage. Otherwise rivals eventually exhaust the initial 30 concepts or incorrectly consume the player's screenplay root.

### Capacity proof

The rival business model needs named capacity units—such as concurrent development and production slots—even if no building exists. Capacity can be increased only through a cost/time action. It may never be an unexplained “films per year” generator. The original guide's reported cap of ten rival films per five-year award period is historical cadence evidence, not permission to bypass capacity.

---

## 22. Talent market

### Current substrate and gap

**CURRENT CODE VERIFIED — Talent already has persistent person IDs and mutable durable career state.** The code comments describe it as an industry population. But `Contract` has neither its own ID nor an employer ID; `employmentStatus()`, `freeAgents`, hiring markets, and roster logic are implicitly player-relative. `unavailable` is a label, not a rival employer.

**CURRENT CODE VERIFIED — The world is not 120-year safe.** World generation creates 60 people: 12 writers, 10 directors, 28 actors, and 10 craft. There is no autonomous entrant, aging, retirement, death, or industry replenishment. Player-authored additions do not constitute a Hollywood labor lifecycle. P12A must solve initial roster size, rival capacity, and the player's protected founding pool as one feasibility problem; if the fixed population cannot satisfy the chosen fixture, add deterministic unique people through the Package 10-compatible seam rather than duplicating identities or silently weakening requirements.

### Future labor law

One person has one authoritative current state:

- available/free agent;
- employed/contracted by the player identity;
- employed/contracted by one rival identity;
- temporarily committed where freelance law permits;
- retired/unavailable/historical under Package 10's future lifecycle.

Employer changes are typed transitions with `fromStudioId`, `toStudioId`, effective week, legal reason, and contract reference where applicable. Do not duplicate a person in a rival roster.

Rival credits must update that same person's authoritative career. Today normal player releases update skills/work history/genre experience and Star Power and append a `TalentCareerEvent`, while validation accepts only film IDs in the player's `releasedFilms`. P12A must add an additive cross-studio career-event/film-ownership seam and apply the same role-appropriate career law to rival credits. Otherwise it must omit claims about coherent public Star Power or career history; the recommended slice includes the seam.

### Legal movement

- Active guaranteed contracts remain exclusive until expiry, lawful release, sale/assignment, or a future explicitly authored break clause.
- Renewal windows and expiry use one law for player and rivals.
- A free agent may receive deterministic offers; choice must depend on disclosed or private authoritative terms, not “AI wins” scripting.
- P12A allocates initial rival rosters and enforces exclusivity while deferring live competing bids.
- P12A nevertheless needs a minimal noncompetitive maintenance law: at expiry, an incumbent rival may make one deterministic, conserved renewal offer; if it fails or is unaffordable, the person becomes free and the rival may make a deterministic single-offer replacement hire at a later decision boundary. There is no head-to-head bid, poaching, or “you lost” message until P12B authors that window.
- Tracked-talent loss can raise **ATTENTION** only when the player had a lawful opportunity or an explicitly followed person; ordinary rival signings remain **INFO**.

### Information

Public: identity, profession, employer, credits, public Star Power/standing, and availability. Market-known: expected salary or contract availability only when a scouting/agent law supplies it. Private: exact hidden abilities, rival terms, internal fit scores, and rival salary budget.

### Dependency

P12A requires at least a minimal Package 10-compatible contract identity/employer seam, cross-studio release crediting, the noncompetitive renewal/replacement law above, and a deterministic fixture/replenishment plan. Full negotiation, career aging, retirement, relationships, and poaching can remain later waves, but a 120-year production architecture cannot assume the initial 60 people or four-year contracts last forever.

---

## 23. Audience and genre competition

### Current ruling

**CURRENT CODE VERIFIED — No current rival market effect is authoritative.** The market contains static segments/tastes/forces/base value; weekly simulation advances only `market.tick`; `competingSlate` has no consumer; box office uses a constant competition factor. “Audience demand” comments in reception describe film-specific delivery/fit, not a mutable genre appetite stock.

### Future shared-law contract

When authorized, market competition should consume a compact release exposure record from both player and rivals:

- film ID/studio ID;
- genre and relevant audience segment fit;
- release week and run/reach scale;
- marketing/reach where authoritative;
- result version.

It may then derive:

- direct opening overlap;
- recent genre exposure/fatigue;
- audience-segment crowding;
- recovery over an explicit bounded window.

Every penalty/bonus must expose typed drivers. “Comedy appetite cooling” is valid only if the read model can enumerate the relevant releases and window. A same-seed A/B harness must suppress one rival release and demonstrate the exact authoritative market and player-film difference with no Unity logic.

### Scope

Audience/genre competition is **LATER than P12A** unless a dedicated market-law prerequisite is authorized and measured first. Talent exclusivity is the P12A shared resource.

---

## 24. Release-calendar competition

**CURRENT CODE VERIFIED — The current Studio Calendar is a player operational projection and explicitly creates no schedule.** Films release automatically when their production countdown reaches zero. There is no chosen theatrical date, screen inventory, distributor capacity, or industry calendar.

**PRELIMINARY RECOMMENDATION — Preserve a future seam, not fake strategy.** A later public release record distinguishes:

- **confirmed:** authoritative announced/committed project and date;
- **unknown/private:** no projection;
- **estimated:** only after TypeScript owns a scouting/forecast system.

Do not add “industry rumor” as copy without a rumor state. Do not label a date good/bad until overlap or saturation law can explain it. P12A may list recent releases and known in-progress films without allowing the player to schedule around them.

---

## 25. Studio Charts

### Purpose

The successor should keep the emotionally direct name **Studio Charts** while refusing the original's one composite. One retained industry workspace can switch lanes:

- **Audience** — Audience Awareness;
- **Industry** — Industry Prestige;
- **Business** — Commercial Confidence;
- **Output** — released-film count over an explicit period;
- **Momentum** — future Power Ranking only;
- **Awards/History** — later, from Package 08.

### Row contract

Default row: logo, lane rank, studio name, lane value/band, trend only when a comparable snapshot exists, and at most one authoritative reason. Click opens the profile. The player row is visually anchored, not privileged in the calculation.

TypeScript supplies the cohort, metric, sorting, tie semantics, snapshot week, and explanation facts. Unity/browser may sort presentation only when that order is explicitly non-authoritative; the default authoritative order arrives from TypeScript.

**CURRENT CODE VERIFIED — `updateStanding()` is pure and its three meanings are reusable, but the caller and weekly Awareness drift are singleton-player logic.** P12A should store one additive `Standing` value set per common studio, initialize the proof cohort to the same current baseline, and apply the same release update/drift law from compatible business-level result context. Rivals then diverge through real releases. If a rival abstraction cannot supply cash/cost/cast/reach context required by a channel, that lane must wait rather than receive a synthetic score.

### Movie and talent views

Movie Charts use separate current/recent critic, audience, opening/total gross, or run lanes. There is no “best movie” average. Contribution/ROI is available for the player's own finance views; it remains absent for rivals unless a later disclosure law makes rival cost and revenue-share facts public. Rival film cards use the Film Chronicle's truthful vocabulary where evidence exists.

Talent Charts are a later Package 10/P12 integration. They must define profession cohort, public measure, current/prior snapshot, and reason facts. Exact ability OVR, potential, Star Power, current momentum, awards, and market rank remain distinct.

---

## 26. Power Rankings

### Decision

**PRELIMINARY RECOMMENDATION — Approve the concept for a later wave; defer it from P12A.** Standing, momentum, and history are different:

| Concept | Meaning | Time behavior |
|---|---|---|
| Standing | persistent Audience/Industry/Commercial reputation state | moves through authoritative channel laws |
| Power Ranking | comparative recent momentum among active studios | periodic snapshot over a stated trailing window |
| History / Legacy | durable accomplishments and peaks | accumulated facts/summaries |

### Future contract

A ranking snapshot must contain:

- cohort and formula version;
- `asOfWeek` and explicit comparison/trailing window;
- current rank;
- previous comparable rank;
- movement or `new` / `re-entered` / `not-comparable`;
- tied-rank semantics and stable display order;
- one to three typed reason facts with source entity IDs.

Conceptual eligible inputs are recent public film outcomes versus expectation, Standing change, award outcomes, commercial/audience/critical streaks, and material roster strength only if an authored public law measures it. A signing cannot become a rank reason merely because it makes a good headline.

### Cadence and retention

Quarterly (13-week) is the recommended starting cadence: weekly is noisy and sports-like; annual is too slow to tell a current industry story. Recompute after the quarter closes, not on every UI render. Persist current and previous comparable snapshots plus annual peak/finish summaries; do not retain 6,240 weekly ranks.

No numeric weights are authorized here. Package implementation research must calibrate and publish the formula before the feature ships. If the formula cannot produce truthful reason facts, the rank stays deferred.

---

## 27. Industry Pulse

### Product form

**PRELIMINARY RECOMMENDATION — Build an event-driven “Hollywood This Period” surface, not a daily news firehose.** It can group:

- major releases and unexpected outcomes;
- material talent moves/availability;
- studio entry, material rise/fall, distress, closure;
- market changes only when shared law exists;
- technology milestones when Package 13 exists;
- awards when Package 08 supplies results;
- known upcoming releases when calendar authority exists.

### Authority and cadence

Persist typed industry facts, materiality, entity IDs, and week. Render headlines from templates at view time. A quarterly digest queries those facts; exceptional events may appear immediately. Routine project phase changes remain on profiles/calendars and do not generate news.

Attention law:

- most rival facts: **INFO**;
- followed talent becomes unavailable or a tracked rival collides with the player: **ATTENTION**;
- a live player offer/release response window: **DECISION**;
- purely rival news: never **BLOCKING**.

The existing typed `StudioEventLog`, broadcast, and Silver Screen Gazette provide good fact/template patterns, but they are player-studio/player-film specific. Add a separate industry event authority; do not overload the lot's event log or persist article prose as truth.

---

## 28. Rival profiles

The compact profile is inspect-only in P12A:

```text
MONARCH PICTURES                         Active · Recorded since Week 0
Power Rank —                            (deferred until authority exists)

Audience Awareness          78
Industry Prestige           91
Commercial Confidence       66

RECENT
The Last Harbor · Drama · critics 84 · audience 76 · gross $…
Signed Elaine Vale · Week …

OBSERVED IDENTITY
Known for Drama and fewer, larger pictures · 8-film sample

NOTABLE PEOPLE
…

[Films] [Talent] [History]
```

Header: name, logo, founded/recorded-since fact, active state. Current: three Standing channels and later Power Ranking. Recent: authoritative films, signings, and material events. Identity: observed tendencies with sample/window. Talent: public roster. History: paged filmography, milestones, awards later, closure/archive state.

Do not expose exact cash, internal strategy weights, unrevealed slate, hidden ability, private salaries, or debugging scores. Do not show “two films in production” unless those projects are public/announced. No diplomacy button exists until diplomacy has authoritative actions.

---

## 29. Awards seam

Package 12 must make these durable references available to Package 08:

- active/historical studio identity and eligibility interval;
- rival film ID, owner studio ID, release week, genre, public outcomes, frozen participant IDs;
- person ID, credited role, employer at relevant week, public career/standing facts;
- film/studio/person eligibility facts for an awards window;
- immutable award-result references written by Package 08;
- history-start boundary so migrated saves never nominate fictional pre-migration work.

Package 08 owns categories, ceremony cadence, nominee scoring, award results, and presentation. Package 12 owns neither a “rival award roll” nor a ceremony simulation. Future Power Ranking may consume an award result only after it exists.

---

## 30. Rival distress and failure

### Causal state

**PROJECT AUTHORITY VERIFIED — Rival failure is allowed even though the player has no mandatory hard-bankruptcy game-over.** The asymmetry serves different roles: the player campaign protects continuity; rivals create a changing industry.

**PRELIMINARY RECOMMENDATION — Derive distress from a compact conserved balance sheet and operating capacity.** Relevant causes include low cash/runway, committed obligations, weak film receipts, costly cancellations, inability to retain a viable roster, and no affordable project path. A random headline cannot set distress.

Conceptual lifecycle—not final enum names:

- operating;
- constrained;
- distressed;
- dormant/restructuring;
- recovered or closed.

Closure releases or resolves talent under contract law, cancels/settles projects, ends future eligibility, and freezes the studio profile as historical. Filmography, people credits, awards, Standing peaks, and ownership history remain. Acquired is a later distinct outcome, never an alias for closed.

### Ecosystem guardrail

Do not let repeated failures empty Hollywood. The recommended full-system envelope is **6–10 active AI rivals**, benchmarked at a hard stress cap of **12**, with deterministic entrants maintaining a minimum of **3 active AI rivals** after the early game. These are design/benchmark bounds, not final balance. P12A uses three rivals and does not need closure.

---

## 31. New studio entry

New studios should be generated from:

- global seed and immutable entrant ordinal;
- authored era-compatible founding windows after calendar authority exists;
- active-population floor/cap;
- curated naming/brand components;
- bounded starting endowments and policy weights;
- available talent and technology/market conditions;
- deterministic total ordering when multiple entrants qualify.

Asymmetry is desirable: some entrants are small, some well-capitalized, some talent-rich. Every endowment is a persisted world-generation fact, not a difficulty top-up. An entrant begins with no fabricated awards or filmography unless a non-1920 scenario explicitly authors prehistory at new-world generation.

The original demonstrates staggered entry but not failure/replacement. Project: Studio's 120-year old-majors/new-challengers arc is a successor expansion, justified by the campaign horizon rather than false parity.

---

## 32. Acquisition and co-production boundaries

### Preserve now

- immutable studio IDs after closure or ownership change;
- immutable film/project/person IDs;
- current owner and original creator as distinguishable relationships when ownership is later introduced;
- dated ownership history rather than destructive reassignment;
- archival profiles and filmographies;
- room for one film to have multiple future ownership/finance shares without changing its identity.

### Do not implement in P12A

- acquisitions, mergers, labels/subsidiaries;
- library valuation/trading;
- co-production negotiation, cost/revenue shares;
- stock/public-company systems;
- franchise/IP competition or licensing;
- diplomacy.

Do not add speculative nullable fields to frozen leaves simply to “future-proof” them. Record the relationships the later implementation must be able to add through new versioned roots.

---

## 33. Fairness and difficulty

### Fair-AI law

> A rival may abstract an operation, but it may not receive an impossible privilege in an observable shared system.

Required parity examples:

- talent exclusivity and contract legality;
- film-result inputs and reception formula version;
- project capacity and elapsed time;
- cash conservation for production, payroll, and marketing;
- market/award/technology rules when those systems exist;
- rank cohort, formula, and tie handling.

Rivals need not pay for cosmetic lot operations the model does not claim they possess. Any intentional handicap—starting endowment, efficiency modifier, information access—must be explicit, bounded, persisted/configured, and described as difficulty design rather than hidden simulation truth.

### Difficulty knobs

Allowed: candidate quality, planning horizon, forecast error, seeded decision noise, risk tolerance, reserve discipline, adaptation speed, and bounded operational efficiency.

Rejected: infinite cash, free talent, films without elapsed phases, instant technology, direct outcome multipliers, player-only market penalties, and hidden rescue top-ups.

Rivals should sometimes overpay, mistime, chase fading demand, cancel, or miss. The mistakes come from bounded policy/noise under constraints, not scripted humiliation or player-targeted sabotage.

---

## 34. Long-horizon performance

### Required scale

- 6,240 authoritative weeks;
- P12A: player plus 3 rivals;
- full recommended envelope: player plus 6–10 active rivals;
- stress harness: 12 active AI rivals;
- P12A: 1–2 concurrent projects per rival (3–6 total), proven against the 60-person role mix and player founding floor;
- full target: typically 2–3 concurrent projects per active rival; stress: 4 each;
- roughly 2,000–3,500 durable rival films across the full campaign, depending on entry/closure/cadence;
- inactive studios retained as compact archives.

### Complexity law

Weekly rival work must be `O(active studios + active projects + due events)`, never `O(all historical films × all historical transactions)`. Ranking, filmography counts, genre exposure, and annual summaries use maintained aggregates or bounded windows. UI queries never run a whole-history scan each frame.

### Provisional measurable budgets

These are **PRELIMINARY RECOMMENDATION** targets for implementation recon, not claims about current measured performance:

| Budget | Target |
|---|---:|
| Isolated rival subsystem, 12 rivals × 6,240 weeks | ≤ 3 seconds on the project's CI/reference machine |
| Incremental rival weekly step, stress fixture | median ≤ 0.5 ms; p95 ≤ 2 ms |
| Active rival business state | ≤ 100 KB uncompressed JSON per rival |
| Average durable historical rival film | ≤ 1.5 KB uncompressed JSON |
| Total P12 incremental save payload | ≤ 8 MB full-target / ≤ 10 MB stress, uncompressed JSON |
| Default Industry summary projection | ≤ 128 KB |
| One rival detail/history response | ≤ 128 KB and ≤ 100 history rows |
| Canonical full-save serialize + digest | p95 ≤ 100 ms full-target / ≤ 200 ms stress |
| Strict validate/import | p95 ≤ 500 ms full-target / ≤ 1 s stress |
| Asynchronous durable write, end-to-end | p95 ≤ 250 ms full-target; no synchronous main-thread step > 50 ms |

**CURRENT CODE VERIFIED — The existing V14 save-size harness provides a useful floor, not a rival projection.** `scripts/measure-v14-save-size.mts` records 715,193 bytes at week 520 for a continuously operating player studio with 114 releases. Its 26-week event policy leaves 30,473 event bytes versus 202,925 bytes in the unwindowed comparison, while durable wrap/premiere history remains. Package 12 should copy that tiering discipline, not extrapolate the exact bytes as a multi-studio budget.

Current code already has multiple full-save amplification paths. Every tick calls `assertStudioPlacementInvariants()`; while evaluating historical facility-opex rows, `expectedWeeklyOperatingCostAt()` rebuilds `demolishedFacilityHistory()` from the whole ledger. The browser `stableStringify`s and rewrites the full save after every authoritative transition. Combined with projected localStorage quota pressure, this makes both CPU and persistence—not merely rival-loop time—horizon blockers. P12 must not “solve” them by pruning authoritative player history: optimize maintained indexes/aggregates, measure serialize/validate/load/write separately, and adopt an appropriate asynchronous storage path before the 120-year ship gate.

### Bridge rule

Do not append every rival project, person, film, ledger row, and event to the existing atomic lot snapshot. Publish bounded chart/pulse summaries at their revision cadence. Fetch profile/history pages on demand with stable cursors and snapshot/version metadata. Unity caches DTOs, never gameplay authority.

Paging alone does not bound current bridge work: canonical projection V4's `snapshotFor()` computes a whole-save SHA-256 through `exportSaveJson`, and `availableIntents()` computes it again. The inspected living-lot branch is projection V9 with founding/treasury/development additions, but still one atomic bundle and no industry query route. P12A must target the merged/latest schema, add a real read/query protocol, and cache each canonical digest/projection per authoritative revision—or prove an equivalent measured mitigation—so a small DTO does not hide `O(full save)` snapshot work.

---

## 35. Save and history retention

### Persist

- studio IDs, identity, brand seed/tokens, entry/founding/history-start/closure facts;
- current rival policy/adaptation state;
- current conserved finance, obligations, capacity, roster/contracts, projects, and technology adoption;
- film/project identity, frozen result inputs needed for audit, released outcomes, credits, ownership;
- material employer transitions, awards later, entry/distress/closure/ownership events;
- deterministic counters/high-water marks and formula/schema versions;
- current/previous Power snapshot when that feature exists.

### Derive

- current chart ordering and most totals;
- filmographies and roster lists from indexed ownership/employment facts;
- observed genre tendencies;
- current records and comparative positions;
- news copy and UI grouping;
- head-to-head comparisons only from real overlap/outcome facts.

### Summarize

- annual rival finance categories and opening/closing balances after the audit window;
- annual output/Standing/strategy state;
- Power Ranking annual peak/finish;
- old market exposure trends after the live bounded window;
- inactive studio archival summary while preserving films and material events.

### Discard

- candidate action lists and rejected choices;
- raw decision scores/noise draws;
- per-frame or per-walker state;
- old routine phase/debug events;
- generated prose, sorting/tab/scroll/focus/seen state;
- every weekly ranking;
- redundant copies of film/person/studio truth.

### Finance retention

Rivals should use a compact conserved account, not a copy of the player's permanent row-by-row weekly ledger. Persist current balance/obligations, material transactions, and annual reconciled category summaries with enough audit information to prove `opening + inflows - outflows = closing`. Never use an unaudited aggregate cash number or hidden top-up.

### Theatrical retention

Current player `TheatricalRun.weeklyGross` is durable. Multiplying full weekly arrays across thousands of rival films is unnecessary. Preserve result totals and material run facts; retain only active-run schedules and summarize completed rival schedules after reconciliation. Do not rewrite current player history in this package.

---

## 36. Old-save behavior

**PROJECT AUTHORITY VERIFIED — Do not backfill fictional history.** The V13→V14 migration already provides the right precedent: new event history starts empty because inventing past events would be false.

### Migration law

At the upgrade week:

- deterministically create the player's immutable business identity;
- associate active productions, scripts/workflows, theatrical runs, results/history, and every existing active contract with that identity only where ownership is derivable from the formerly single-studio world;
- preserve each contract's term/order/payroll exactly and leave `freeAgents` ownerless;
- create a rival cohort from a migration-specific deterministic seed/ordinal;
- set each rival's `historyRecordedFromWeek` to the migration boundary;
- give no rival pre-upgrade films, awards, chart peaks, talent moves, or fake founding story;
- present earlier rival history as “not recorded” or absent, never synthesized;
- preserve every existing production ID and RNG outcome;
- export/import/export byte deterministically under the new save version.

If the save is still in founding, current applicants are player-reserved for migration/allocation purposes and must not also enter a rival roster. A migrated player's founding date is not derivable: after founding, current state retains neither the date nor a safe proxy. Do not substitute migration week, earliest ledger row, or earliest contract. Store it as unknown while retaining `historyRecordedFromWeek`. Whether newly generated rivals are founded at the boundary or have unknown earlier history is a copy/product choice; the data must preserve the distinction rather than claim a false date.

### New worlds

At a standard 1920 new-world start, seed identities/endowments first, solve role-feasible rival capacity/rosters while reserving the authored minimum player founding pool, then build the player's applicants and all hiring/assignment views from the remaining legal population. Current `newGame()` calls `beginFounding(generateWorld(seed))`, and `beginFounding()` samples talent without a rival-owner filter; the implementation must update founding applicants, `signableUniverse`, both hiring markets, `employmentStatus`, `assignableForFilm`, action validators, and the global busy set as one invariant-preserving change.

P12A can persist all of this honestly in campaign-relative `market.tick` weeks. A pre-1920 founded date or any year-labelled UI requires a separate absolute/signed date representation and TypeScript calendar mapping; it cannot be stuffed into a nonnegative `foundedWeek`. A non-1920 scenario may explicitly author prehistory, but the standard start should not spend save/performance budget inventing films the player never observed.

---

## 37. 2040 Legacy data seam

**PROJECT AUTHORITY VERIFIED — The primary authored campaign culminates in the Studio Legacy finale in 2040.** Endless continuation beyond that finale is not current guaranteed product law. The following 1920–2040 facts remain required inputs to the future Legacy implementation:

- longest-lived and greatest rival;
- player and rival peak/final Standing positions;
- durable films, records, awards, and studio milestones;
- founding, entry, dormancy, recovery, closure, acquisition later;
- people who lawfully moved between studios and their credits before/after;
- real release overlaps and head-to-head outcomes after a shared calendar law exists;
- annual Power peaks/finishes after Power Ranking exists;
- ownership/library lineage after Studio Empire exists.

Do not store narrative labels such as “archenemy” or “greatest rivalry” without an authored definition. Legacy prose renders from IDs, dated facts, and versioned summaries. Coexistence alone is not a rivalry; an overlap is not “head-to-head” until the market law defines it.

---

## 38. REQUIRED NEXT / FOLLOW-UP / LATER / DO NOT DO

### Required next — before P12A implementation

1. **Stable player business identity.** Add an immutable ID and an authoritative display-name law through a new save root, not the frozen `Studio` leaf.
2. **Fix concept repricing.** `beginFounding()` must not mutate a shared world concept market on behalf of one studio. Classify this as a **PRE-RIVAL INFRASTRUCTURE DEFECT**.
3. **Global contract/employer ownership.** Add contract identity and generalize the player-relative contract/free-agent model enough to represent free, player, and rival ownership with one person ID.
4. **Rival-safe renewable screenplay authority.** Add collision-safe concept/provenance allocation and register every new concept/film root with the complete identity walkers; do not reuse the singleton player `originalScreenplays` root.
5. **Industry-owned film/career seam.** Preserve current production IDs and frozen leaves while making player/rival outcomes chartable and rival credits advance the same person's durable career.
6. **Long-horizon fixes.** Remove existing historical-scan quadratic behavior without pruning the ledger, address whole-save browser storage, and cache/measure full-save digest/projection work before the 120-year stress gate.
7. **Calendar before dated features, not before P12A truth.** `market.tick` is sufficient for the initial cohort and lifecycle. A TypeScript year mapping becomes mandatory before founded-year labels, era windows, or later entrant scheduling; browser 1948 and Unity 1920 constants are not authority.
8. **Dedicated implementation recon.** Resolve exact new-root shapes, migrations, validators, allocation order, actions, indexes, bridge query/cache protocol, and test fixtures before production code.

### Recommended P12A — HOLLYWOOD EXISTS OUTSIDE THE GATE V1

**Goal:** prove that named rivals are constrained simulated businesses which create persistent, inspectable history.

Authoritative slice:

- one stable player studio identity and three deterministic named rival identities;
- compact rival cash/reserve, capacity, strategy, per-studio Standing, roster ownership, and project state;
- initial shared talent allocation with contract IDs/employer exclusivity, plus deterministic noncompetitive renewal/replacement; no live bidding required;
- rival-safe renewable screenplay/provenance allocation and complete concept/production identity walkers;
- deterministic development → package → production → post → automatic release lifecycle;
- rival result records compatible with critic/audience/business history views and cross-studio person career credit;
- separate-lane Studio Charts, compact Rival Profile, recent Movie view, and typed Industry Pulse;
- deterministic save/load/replay and migration boundary;
- anti-façade removal/restoration test and conserved-finance/capacity tests;
- compact summary/detail bridge boundary.

P12A explicitly excludes:

- audience/genre/release-overlap penalties;
- Power Ranking;
- live poaching/bidding and arbitrary defection;
- awards ceremonies;
- technology race;
- distress/closure/entrants after initial cohort;
- acquisitions, co-productions, franchises, diplomacy, sabotage;
- rival physical lots.

P12A succeeds when the player can identify a rival and say something true about its constrained actions: “Monarch employed Elaine Vale, so I could not sign her; its twelve-week commitment to *The Last Harbor* also prevented illegal double-booking. The film released only after consuming cash, capacity, screenplay, talent, and time, and every profile/chart/history fact still agrees after reload.”

### Follow-up waves

1. **P12B — live labor market:** competitive expiry/renewal windows, competing offers, lawful moves, market information, tracked-talent attention.
2. **P12C — market competition:** shared release calendar, overlap and genre-fatigue laws, explainable player forecast/consequence.
3. **P12D — industry momentum:** calibrated quarterly Power Ranking with typed reasons and annual summaries.
4. **P12E — industry churn:** distress, recovery, closure, replacement entrants, historical archives.
5. **Package integrations:** P08 multi-studio Awards, P13 technology adoption/race, future Legacy and Studio Empire.

### Later

Acquisitions, labels/subsidiaries, co-productions, libraries/IP/franchises, licensing, diplomacy, physical visits, theatrical screen scarcity, advertising-space scarcity, and ownership finance.

### Do not do

- do not spawn rated rival movies on a timer;
- do not give rivals infinite or periodically reset cash;
- do not use the current inert `competingSlate` as proof of a market mechanic;
- do not add a fourth Standing field or widen other frozen leaves;
- do not retro-namespace existing production IDs;
- do not calculate ranks or market consequences in Unity/browser;
- do not persist news prose, candidate scores, or weekly ranks;
- do not expose private rival state through a debug-shaped profile;
- do not fabricate pre-migration Hollywood history;
- do not build rendered rival lots for P12A;
- do not describe acquisitions as shipped historical parity;
- do not use sabotage/crime as the core competitive loop.

### Resolved Owner law

Package 12 and both formerly open decisions are accepted. The following are now current Owner law:

1. **PROJECT AUTHORITY VERIFIED — Studio identity and naming.** Every studio has an immutable stable `studioId`. The player chooses the studio display name during founding. Any future rename, if supported, is a dated authoritative event and never changes the underlying `studioId`.
2. **PROJECT AUTHORITY VERIFIED — Minimum Package 10 labor seam.** P12A may include contract identity, authoritative employer ownership, deterministic initial allocation, one-employer exclusivity, cross-studio career/release credit, and noncompetitive renewal/replacement maintenance. Competitive bidding, poaching, negotiation, relationships, aging/retirement, and deeper labor-market systems remain deferred.

No additional Owner decision is required now on final rival count, Power Ranking formula, closure floor, acquisition, co-production, sabotage, or full talent poaching: this report supplies a bounded recommendation or defers the system until its prerequisite authority exists.

### Later implementation-recon inspection list

The dedicated recon terminal should inspect, without assuming these are final domains:

- `src/core/types.ts`, `worldgen.ts`, `save.ts`, `productionIdentity.ts`, `rng.ts`;
- `employment.ts`, contract actions, expiry/free-agent handling, Package 10 integration;
- `screenplay.ts`, script/casting/project/operations/production queue and capacity roots;
- `reception.ts`, `forecast.ts`, `standing.ts`, `economy.ts`, `economyView.ts`, `theatricalRuns`;
- `studioEvents.ts`, `broadcast.ts`, `newspaper.ts`, Film Chronicle, career events;
- Awards placeholders and Package 08 evidence contracts;
- Era/research placeholders and Package 13 boundary;
- bridge schema/session/projection versioning, paging/query protocol, digest/reconnect;
- browser routes/workspaces/attention and current lot-world integration;
- Unity DTO/cache/projection validation and industry surfaces;
- long-horizon harnesses, save-size/storage path, existing historical-scan hotspots.

This report authorizes none of those code changes.
