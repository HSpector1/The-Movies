# CODEX — ERAS, TECHNOLOGY & STUDIO INNOVATION — PACKAGE 13

**Status:** DECISION-READY RESEARCH CANDIDATE

**Work type:** DOCUMENTATION ONLY

**Authorization:** NO PRODUCTION AUTHORIZATION

**Audit date:** 2026-08-30

**Canonical TypeScript baseline:** `campaign/living-lot-ts` at `7811377cea1c1b9ddca2c17c626879504b23ed4e`

**Research branch:** `codex/p13-p15-long-range-research-01`

**Companion:** [Package 13 Builder Annex](./CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13-BUILDER-ANNEX.md)

**Owner-direction amendment:** 2026-09-10 — see §2A; the durable record is
[Owner rulings §2.4](./CODEX-P13-P15-OWNER-RULINGS.md#24-p13-owner-direction-amendment--2026-09-10).

**Catalogue companion:** [Studio Upgrade and Research Catalogue](./STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md) — what is actually researched and
upgraded, all 58 candidate dispositions, anchored numeric scales, and the Office I→III route.

This report defines a future package boundary. It authorizes no TypeScript, Unity, save, schema,
projection, asset, dependency, tuning, or production change. P05 is active and unsealed; P06 is
provisional. Neither may be treated as settled future architecture.

---
## 1. Status and exact research authority

### 1.1 Authority precedence

The controlling order is: explicit Owner instruction; accepted campaign law; accepted Package
07–12 ownership; accepted implementation lessons; this decision-ready candidate; future
implementation reconnaissance; current code. This report cannot silently overrule an earlier
package inside that package's boundary.

**PROJECT AUTHORITY VERIFIED — the following exact artifacts were read as authority.** Branch names
are discovery routes; `path@commit` is the immutable citation.

| Package / authority | Branch | Exact paths | Exact commit | P13 use |
|---|---|---|---|---|
| P07 Reception / Box Office | `codex/reception-boxoffice-research-07` | `docs/design/CODEX-RECEPTION-BOXOFFICE-PACKAGE-07.md`; `docs/design/CODEX-RECEPTION-BOXOFFICE-PACKAGE-07-BUILDER-ANNEX.md` | `da0312180730bf860b253fdfa6874ef749fd88d9` | reception and theatrical result truth stay P07 |
| P08 Awards / Standing / History | `codex/awards-standing-research-08` | `docs/design/CODEX-AWARDS-STANDING-PACKAGE-08.md`; `docs/design/CODEX-AWARDS-STANDING-PACKAGE-08-BUILDER-ANNEX.md` | `438708c5071097d8e1ddb2f97a3f7b6674b2a65e` | Standing, awards, and historical interpretation stay P08 |
| P09 Studio Growth / Construction | `codex/studio-growth-construction-research-09` | `docs/design/CODEX-STUDIO-GROWTH-CONSTRUCTION-PACKAGE-09.md`; `docs/design/CODEX-STUDIO-GROWTH-CONSTRUCTION-PACKAGE-09-BUILDER-ANNEX.md` | `91ed234cbf6cdc22817b792564dda22a1d7c3576` | placement, construction, facility condition and lot capacity stay P09 |
| P10 Stars / Careers / Staff | `codex/stars-careers-staff-research-10` | `docs/design/CODEX-STARS-CAREERS-STAFF-PACKAGE-10.md`; `docs/design/CODEX-STARS-CAREERS-STAFF-PACKAGE-10-BUILDER-ANNEX.md` | `6a5d41ec233152ecbe8cc3bfc960c31514b6cded` | person identity, profile, current contract and career-event spine stay P10 |
| P11 Finance / Executive UX | `codex/finance-executive-ux-research-11` | `docs/design/CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11.md`; `docs/design/CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11-BUILDER-ANNEX.md` | `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | authoritative cash, ledger, forecasts and executive interpretation stay P11 |
| P12 Rival Studios / Hollywood Ecosystem | `codex/rival-studios-hollywood-ecosystem-research-12` | `docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md`; `docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12-BUILDER-ANNEX.md`; `docs/HOLLYWOOD-ECOSYSTEM-FUTURE-PROOFING.md`; `docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md` | `a0739055c30f80fcf756340d0e0e962865aec6a4` | P12 assigns the shared technology catalogue and era truth to P13; studio identity and conserved rival projects remain P12 |
| P04 implementation lessons | `campaign/living-lot-ts` | `docs/engineering/P04-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md`; `docs/campaigns/LIVING-LOT.md` | `7811377cea1c1b9ddca2c17c626879504b23ed4e` | world-first, exact-ID, no-op, proof and Owner-acceptance laws |
| P05 final launch charter | `codex/p05a-final-refresh-01` | `docs/engineering/CODEX-P05A-IMPLEMENTATION-CHARTER.md`; `docs/engineering/CODEX-P05A-IMPLEMENTATION-RECONNAISSANCE.md` | `b1d506df9ff9c5981f5acc6990daf8a056739901` | launch facts only; implementation remains separate and unsealed |
| P06 provisional launch package | `codex/p06a-launch-package-01` | `docs/engineering/CODEX-P06A-PROVISIONAL-IMPLEMENTATION-CHARTER.md`; `docs/engineering/CODEX-P06A-IMPLEMENTATION-RECONNAISSANCE.md` | `c74cf79037fe9712247898c340834d0379c8b04c` | provisional release/post boundary; no future seam may be presumed final |
| Visual Direction Package | `docs/visual-direction-package-01` | `docs/design/PROJECT-STUDIO-VISUAL-DIRECTION-PACKAGE-01.md`; `docs/design/PROJECT-STUDIO-VISUAL-DIRECTION-PACKAGE-01-BUILDER-ANNEX.md` | `728781dcfdcf32a13d3d3978cdc333b8c9a5e8a7` | lot-dominant presentation and restrained workspace hierarchy |

**CURRENT CODE VERIFIED —** the executable audit in this report is pinned only to
`7811377cea1c1b9ddca2c17c626879504b23ed4e`. Read-only observations from a local P05
implementation checkout at `b44007dc4ac63df991c0788bab72d24bafd3925c` are classified
**UNSEALED FORWARD EVIDENCE** and confer no authority.

### 1.2 External evidence packet

The original-game packet comprises the [official PC manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040),
the developer-reviewed [Prima Official Guide](https://archive.org/details/The_Movies_Prima_Official_eGuide)
and its [searchable OCR](https://archive.org/stream/The_Movies_Prima_Official_eGuide/The_Movies_Prima_Official_eGuide_djvu.txt),
the official [*Stunts & Effects* manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/7910/manuals/The_Movies_Stunts_Effects_Manual.pdf?t=1447351041),
the local mechanics/source/artifact corpus listed below,
plus the contemporary professional [GameSpot walkthrough](https://www.gamespot.com/articles/the-movies-walkthrough/1100-6140049/).
Local compendia route evidence but do not outrank their cited sources.

| Local evidence artifact | Exact path | SHA-256 inspected |
|---|---|---|
| mechanics bible | `/Users/bruce/Desktop/big swing art/THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md` | `1772f518ac125e39dc10012a6f240dddf4a21683e64cc9e9834592499591a768` |
| source register | `/Users/bruce/Desktop/big swing art/THE-MOVIES-2005-SOURCE-REGISTER.md` | `c001668bde8d610badae7ab6dd61068490ed0b96a51b83d9fb64784de61c8918` |
| technical-artifact register | `/Users/bruce/Desktop/big swing art/THE-MOVIES-2005-TECHNICAL-ARTIFACT-REGISTER.md` | `a29608c8f59e982e784d4da1a199ec99ee71f98148c1e6dd9811b515450eb050` |
| recovered research timeline | `/Users/bruce/Desktop/big swing art/THE-MOVIES-2005-ORIGINAL-DATA/research_timeline.csv` | `ebbad65efe21b8d032314a2c5f88a2bb6900c16df5e88c0c6a0b22f5b27e21e4` |
| recovered facility catalogue | `/Users/bruce/Desktop/big swing art/THE-MOVIES-2005-ORIGINAL-DATA/facility_catalog.csv` | `e56d2f44125ddadd9c02bdc2eefb56d19edcb3717fa91679a5468a913eecb528` |

**SOURCE VERIFIED —** hashes identify the exact local bytes inspected; they do not promote a local synthesis above its cited official or contemporary source.

---

## 2. Executive decision

**PRELIMINARY RECOMMENDATION — retain P13 and rename it _Eras, Technology & Studio
Innovation_.** The package begins with a shared industry timeline/catalogue layered over the core
scheduler's authoritative clock and ends when every studio
can encounter, understand, research or wait for or, from commercial release, purchase, adopt, operate, and
historically record a technology under one symmetric law *(purchase route added 2026-09-10; §12.1a)*. Licensing remains an optional successor route requiring a
separate Owner decision and a future technology-rights substrate; it is not assumed package scope.
*(Amended 2026-09-10: the Owner has since expressed the direction in §2A and §16a.4; supplier commercialization
is desired later scope with terms and placement open.)*

The architecture is one versioned global `IndustryTimeline` plus one versioned
`TechnologyCatalogue`, with per-studio `TechnologyAdoption` records that reference stable global
technology IDs. A technology can be historically unavailable to everyone, publicly available,
studio-researched, ready to adopt, adopting, operational, standardized, or obsolete in a particular use.
Global availability and public standardization are not studio progress. An era is a readable
historical context derived from the timeline; it is not a private level owned by a studio.

Research and wait are the unconditional routes, joined from commercial release by a priced purchase route
*(Amended 2026-09-10; §12.1a)*. **REFUTED — licensing is not original-game parity.**
Verified original evidence supports researching ahead or waiting for a natural unlock, not a
studio-to-studio licensing market. If the Owner later authorizes licensing, it enters through a
separately scoped technology-rights/licensing slice after the core adoption law is sealed; P14's
talent-contract package is not its substrate.

Technologies must change concrete capability: recording/playback compatibility, production paths,
facility requirements, set/costume/effect catalogue access, capital and operating cost, reliability,
throughput, or visible world behavior. A generic `+quality` technology is prohibited. Earlier
methods remain usable until an explicit compatibility or public-standard rule says otherwise; the
game never applies a hidden arbitrary “old era” penalty.

P13A should prove one synchronized-sound transition, research/wait, one rival adoption consequence,
and one production/world effect. A concrete Laboratory and persistent Scientist are conditional on
the Owner approving the missing minimal P09/P10-facing roots described in Section 23; they are not
claimed to exist upstream. Licensing is excluded from P13A. The checkpoint must not build the full
catalogue, a general alternate-history engine, or P14/P15.

---

## 2A. Owner-selected product direction — 2026-09-10

**OWNER PRODUCT DIRECTION RECORDED · UPDATED P13/FACILITY PLAN, CURRENT OPS REVIEW REQUIRED · NUMERICAL RULES AND COMMERCIAL TERMS PROVISIONAL · FINAL POST-P12 SOURCE REFRESH REQUIRED · GAMEPLAY IMPLEMENTATION NOT AUTHORIZED.** The durable record of the Owner's choices, the superseded statements and the label definitions is [Owner rulings §2.4](./CODEX-P13-P15-OWNER-RULINGS.md#24-p13-owner-direction-amendment--2026-09-10). This section makes the design a coherent successor of the 2026-08-30 candidate under those choices. Sections 12.1a, 12.6–12.9, 16a and 23a carry the detail; the [Annex §4.2 matrix](./CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13-BUILDER-ANNEX.md#42-owner-direction-analytical-matrix--2026-09-10-candidate) checks the mechanisms on paper; the [facility addendum §6a](./FACILITY-UPGRADES-AND-STUDIO-OVERVIEW-01.md#6a-gap-aware-conversion-and-direct-purchase--2026-09-10-owner-direction) carries the physical side.

The desired experience, as the update assignment summarizes the Owner's fourteen choices rather than as a verbatim Owner quotation: invest in researchers, laboratories and R&D to develop technology early; organize several projects and buildings without constant clicking; benefit from the studio's own inventions while rivals can out-invest or outperform it; buy commercial technology once it is released; modernize intelligently; and perhaps later commercialize an invention. The Owner's own words are quoted in the amendment's source record.

### 2A.1 Six facts that never collapse

| Fact | Owner | Means | Does not mean |
|---|---|---|---|
| Knowledge prerequisites and early-research eligibility | P13 catalogue and timeline | the studio holds the prerequisite knowledge and the technology's early-research window is open | the studio may buy or install anything |
| Research progress and completion | P13 research project | verified accumulated work; completion makes the studio `readyToAdopt` with own-development provenance | commercial availability for anyone else |
| Public commercial availability | P13 `IndustryTimeline` | the fixed commercial-release milestone has passed; compatible upgrades are purchasable by any studio | any studio has installed it; old equipment stops working |
| Physical installation | P09 job through the §12.2a interface | the conversion or purchase job has completed on one exact building or equipment subject | the capability is usable if a distinct training or provider prerequisite remains |
| Operational capability | P13 adoption `operational` | exact providers can supply the capability to productions | a public standard exists |
| Industry standard | P13 `publicStandard` per defined use | catalogue-defined compatibility consequence for new work of that use | mandatory replacement of installed equipment or a penalty on old methods |

### 2A.2 Capability-based delivery under the outcome-first order

**IMPLEMENTATION RECOMMENDATION.** P13A remains the bounded first checkpoint (§26). The single laboratory/person/sound demonstration stays a useful early proof; it does not establish completion of multi-person staffing, budgets, cooperation, parallel projects or queues. Difficult parts are sequenced; none is discarded; no later commercial feature is a prerequisite of the first research experience.

| Tier | Capabilities | Owner decision needed before activation |
|---|---|---|
| **Core** (inside or immediately beside P13A) | early-research window with knowledge prerequisites (§12.1a); named researcher(s) with continuing payroll; per-project R&D budget ceiling with disclosed marginal benefit and bottleneck (§12.6, §16a.1); retained verified work on pause/cancel (§12.8); the technology lock at first actual filming (§12.9); wait-for-commercial-release purchase route (§12.1a) | none beyond the substrate ruling in §23 and Current Ops activation review; numbers are hypotheses |
| **Ready** (next capabilities, no new Owner decision) | staffing to laboratory capacity; cooperation and split across laboratories with diminishing returns (§12.6); persistent plan queues with dependencies and admission policy (§12.7); gap-aware conversion quotes and direct purchase without obsolete intermediates (addendum §6a); forecast windows becoming concrete public dates and replacement disclosure beside purchases (§16a.3); installation cancellation under option B (§12.8); decomposed inventor pricing with prototype credit (§16a.2) | tuning choices only (§23a) |
| **Later** (placement and terms pending) | supplier commercialization agreement, upfront payment, eligible-sale royalties, term and expiry; transfer and co-development entitlement; exclusivity; early supplier launch (§16a.4) | Current Ops placement; Owner terms |

Recommended order after P13A: staffing to capacity and budget ceiling; retained progress and option-B cancellation; plan queues; multi-laboratory cooperation and split; commercial-release purchase, inventor pricing and gap-aware conversion; forecast precision and replacement disclosure; then the later commercialization slice under its own placement. Each capability still requires its post-upstream refresh and separate authorization.

### 2A.3 How this document was amended

Statements superseded by the Owner's direction are listed in [rulings §2.4.2](./CODEX-P13-P15-OWNER-RULINGS.md#242-superseded-and-re-labeled-statements). Inside this document, amended sentences carry the marker *(Amended 2026-09-10)* and point to the governing section. Historical status lines (the 2026-08-30 audit date, the `7811377…` research baseline, "P05 is active") remain historical prose. Evidence labels of §4 keep their meanings; "REFUTED — licensing is not original-game parity" stays a true source fact and no longer excludes the feature.

---

## 3. Package beginning and ending boundary

### 3.1 Begins

P13 begins after P12 supplies stable studio identity, conserved rival business truth, and symmetric
studio participation. It consumes P09 facilities and P10 staff identities without redefining either.
Its first authoritative fact is a global timeline milestone becoming forecastable or available.

### 3.2 Owns

- versioned technology and timeline catalogue definitions;
- global availability, diffusion, standardization, and obsolescence policy;
- per-studio discovery/research/wait/purchase/adoption/operation state *(purchase added 2026-09-10; §12.1a)*, plus a license route only if separately authorized;
- technology prerequisites and concrete capability grants;
- Laboratory research assignments, staffing to laboratory capacity, per-project budgets and persistent plan queues as technology work facts; the concrete Laboratory and Scientist substrate must still be approved before the checkpoint can reference one (§23), but the capability itself is Owner direction rather than a deferral *(Amended 2026-09-10; §§12.6–12.7)*;
- rival adoption under the same public catalogue and rule set;
- typed technology milestones and technology-history summaries;
- compatibility decisions between production methods and current public standards.

### 3.3 Ends

P13 ends after technology consequence is projected into existing production/facility/economy/world
surfaces and recorded. It does not own talent-market negotiation, relationships, retirement, shared
audience demand, ranking, corporate failure, acquisition, or the 2040 finale.

### 3.4 Must not duplicate

| Earlier package truth | P13 consumes | P13 must not duplicate |
|---|---|---|
| P08 | historical event/award/Standing identifiers and interpretation seams | awards, Standing formulas, archive ownership |
| P09 | facility blueprint, placement, construction, operating/condition truth | a second building engine or facility identity |
| P10 | stable people and staff role/profile truth | scientist identity, contracts, careers, development |
| P11 | cash, ledger categories, cost timing and forecast truth | a private research wallet or parallel finance ledger |
| P12 | immutable `studioId`, rival policy/capacity/projects, symmetric studio law | private rival tech trees, rival identity, project spawning |

### 3.5 Produces and hands off

P13 produces stable technology IDs, adoption/status history, capability facts, global milestone
events, and per-studio technology snapshots. P14 may read capability and facility context when a
career event or labor offer needs it; it must not make technology progress. P15 may read adoption,
technology leadership, cost structure, and standards when resolving shared market, corporate fate,
and legacy; it must not rebuild the catalogue or infer adoption from film dates.

---

## 4. Evidence notation

This document uses the required labels literally:

- **SOURCE VERIFIED** — a cited original or external source directly supports the statement.
- **PROJECT AUTHORITY VERIFIED** — an exact Project: Studio authority supports it.
- **CURRENT CODE VERIFIED** — exact accepted code at `7811377…` supports it.
- **COMPARATOR OBSERVED** — a cited commercial product exposes the feature described.
- **OPEN-SOURCE PATTERN** — named code at an exact repository commit exhibits a reusable pattern.
- **INFERENCE** — reasoned synthesis, not a recovered fact.
- **PRELIMINARY RECOMMENDATION** — proposed successor law awaiting Owner authorization.
- **OWNER DECISION REQUIRED** — alternatives remain genuinely open.
- **OPEN QUESTION** — evidence cannot safely settle the fact.
- **REFUTED** — evidence contradicts the claim.

“Verified” never means an undocumented formula was recovered. Community claims are not promoted
without corroboration. No design recommendation is described as original parity unless the original
evidence directly supports it.

---

## 5. Original *The Movies* reconstruction

### 5.1 Laboratory, Scientists, and rooms

**SOURCE VERIFIED —** the original had a buildable Laboratory staffed by Scientists. The manual
describes Scientists as keeping the studio ahead of the pack and identifies four Laboratory areas:
Movie-Making, Cult-Packs, Mainstream Packs, and Stars & Studio. Movie-Making covered sound, color,
and CGI; the other rooms covered sets, props, costumes, facilities, trailers, outfits, and gifts.
The Laboratory is therefore both a workplace and a content-access surface, not an abstract menu
detached from the lot. [Official manual, pp. 16 and 22–23](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040)

**SOURCE VERIFIED —** Prima's developer-reviewed technology chapter says a pack becomes
researchable before its natural unlock; finishing it early grants access immediately. One room can
hold one pack, and packs in the same room can have sequential prerequisites. The recovered
`research_timeline.csv` contains 36 base-game rows with separate research-availability and automatic
unlock years, corroborating an “early advantage, eventual access” structure rather than permanent
denial. [Prima guide](https://archive.org/details/The_Movies_Prima_Official_eGuide)

**SOURCE VERIFIED —** the recovered facility corpus and Prima corroborate a $24,000 Laboratory and
the source packet resolves vanilla staffing as six Scientists across the Laboratory. GameSpot separately
corroborates four Scientists assigned to one research section at a time. A modded artifact's
`scientist=15` value is explicitly rejected as a vanilla value. [Prima guide](https://archive.org/details/The_Movies_Prima_Official_eGuide),
[GameSpot walkthrough, Laboratory section](https://www.gamespot.com/articles/the-movies-walkthrough/1100-6140049/)

### 5.2 Timeline and comparative advantage

**SOURCE VERIFIED —** the game begins with only technology appropriate to the current decade;
Laboratory research exposes technology sooner than rivals, researched items are highlighted on the
timeline, and early access can improve films and competitive position. This is a comparative lead,
not proof of one hidden quality formula or a permanent monopoly. [Official manual, p. 23](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040)

**SOURCE VERIFIED —** recovered rows distinguish availability from auto-unlock. Examples include
Functional Tech researchable in 1929 and auto-unlocked in 1945, Intermediate Tech in 1929/1950,
Quality Tech in 1929/1962, and later technology through Ultimate Tech in 1955/1991. These are guide
tables, not evidence that Project: Studio should reproduce the labels, dates, or numerical benefit.
[Prima guide OCR](https://archive.org/stream/The_Movies_Prima_Official_eGuide/The_Movies_Prima_Official_eGuide_djvu.txt)

**SOURCE VERIFIED —** the inspected sources expose relative research timing and the value of being
ahead of rival studios; they do not establish a separately formulaed “research Standing” channel or
prove that every rival owned a fully simulated clone of the player's tree. The safe parity statement
is comparative timing/advantage, not a new P08 Standing metric or private-tree architecture.
[Official manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040),
[Prima guide](https://archive.org/details/The_Movies_Prima_Official_eGuide)

### 5.3 Sound, color, CGI, sets, costumes, and facilities

**SOURCE VERIFIED —** sound, color, and CGI were named Movie-Making research outcomes; other packs
opened tangible set, prop, costume, and facility content. The manual says early access improves the
ability to make successful films, but it does not expose separate hidden effect sizes. This report
therefore preserves capability and visibility while refusing to invent a screenshot-derived formula.
[Official manual, pp. 22–23](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040)

**SOURCE VERIFIED —** original sets and facilities lived visibly on the lot. Buildings could become
unusable while in disrepair, and distance between sets extended production time and cost. Those
facts make a world-visible technology consequence more faithful than a silent score modifier.
[Official manual, printed pp. 18 and 39](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040)

### 5.4 Expansion-era change

**SOURCE VERIFIED —** the official *Stunts & Effects* manual adds the Stunt School, stunt training,
new awards, camera/production tools, Blue Screen and Miniature City sets, and new sets/props/costume
packs on fixed timeline dates. It does not establish that the expansion replaced the base game's
four-room Laboratory architecture. [Official *Stunts & Effects* manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/7910/manuals/The_Movies_Stunts_Effects_Manual.pdf?t=1447351041)

**INFERENCE —** Project: Studio's catalogue should be extensible by data version so later content
can join the timeline without rewriting old saves. Expansion evidence supports catalogue breadth,
not a separate Stunts tree in P13A.

### 5.5 What did not survive scrutiny

- **REFUTED:** exact original licensing between studios. No inspected shipped source establishes it.
- **REFUTED:** each rival necessarily ran an independently persisted copy of the full player tree.
- **REFUTED:** original parity requires copying the guide's dates or quality effects exactly.
- **OPEN QUESTION:** exact hidden research-speed, quality, and rival-adoption formulas.
- **OPEN QUESTION:** exact base-game mapping conflict between the manual's “Mainstream” wording and
  Prima's Household/Wild West pack labels.
- **OPEN QUESTION:** whether every expansion content row followed base-game research-before-auto-
  unlock law; the expansion manual explicitly describes fixed dates for new content.

### 5.6 Original pain points to avoid

**INFERENCE —** a repeated room-by-room assignment loop can become clerical once research choices
are understood. The successor retains the visible Laboratory, personnel opportunity cost, queue,
and advance planning, while removing routine Scientist shuffling and “click when bar completes”
maintenance. It also refuses the original tendency to collapse technology advantage into a vague
film-quality edge.

---

## 6. Source confidence and contradictions

| Claim | Evidence | Confidence / ruling |
|---|---|---|
| Laboratory, Scientists, four research areas | official manual | **SOURCE VERIFIED — high** |
| early research versus later natural unlock | developer-reviewed Prima + 36-row recovered CSV | **SOURCE VERIFIED — high** |
| exact catalogue dates in recovered table | Prima-derived corpus | **SOURCE VERIFIED — high for guide table; not executable verification** |
| research made the studio comparatively early | manual + Prima | **SOURCE VERIFIED — high** |
| hidden research speed / quality effect | no engine source | **OPEN QUESTION** |
| vanilla staffing | manual/guide synthesis versus explicitly modded artifact | **SOURCE VERIFIED — high for six/four; mod value REFUTED** |
| Mainstream category contents | official manual versus Prima nomenclature | **OPEN QUESTION — preserve both, do not adjudicate** |
| technology endpoint | [GameFAQs JPaterson *Stunts & Effects* FAQ](https://gamefaqs.gamespot.com/pc/932332-the-movies-stunts-and-effects/faqs/43496) says all research is unlocked by 2000 but explicitly assumes the expansion is installed; the recovered Prima-derived timeline's last listed automatic unlock is 1991; the local mechanics bible §24 preserves an unattributed aggregated-web-summary claim that technology “tails off in 2020” | **OPEN QUESTION —** the expansion-context contemporary guide and recovered table are secondary-aligned, but no inspected primary source fixes an exhaustive base-game endpoint. The unattributed 2020 claim is **REFUTED as usable package evidence**; no endpoint becomes package law. |
| expansion fixed-date content | official expansion manual | **SOURCE VERIFIED — high** |
| licensing shipped | no corroborated shipped source | **REFUTED as parity** |

The official manual has highest confidence for player-visible shipped behavior. Prima is unusually
strong secondary evidence because Lionhead staff are credited with reviewing it, but it remains a
guide rather than executable code. The mechanics bible, source register, and CSV/JSON corpus inherit
their underlying source confidence. Modded artifacts establish schema possibilities only where the
register explicitly separates schema from vanilla-value confidence.

---

## 7. Modern comparator atlas

The atlas extracts mechanisms, never branding, trade dress, content, or proprietary formulas.

| Comparator and exact feature | Source | Question answered | Adopt | Reject | Underlying simulation | Placement |
|---|---|---|---|---|---|---|
| **COMPARATOR OBSERVED:** *Civilization VII* transitions all participants between Ages simultaneously; technologies, systems and resources change while selected identity-bearing elements persist | [official Ages diary](https://civilization.2k.com/civ-vii/game-guide/gameplay/ages-explanation/) | global era transition versus per-player progress | **PRELIMINARY RECOMMENDATION:** one public industry horizon with persistent studio identity and bounded carry-forward | **PRELIMINARY RECOMMENDATION:** reject changing studio identity, replacing the whole catalogue/tree, and synchronized mini-game resets | global milestone clock, persistence map, compatibility rules | P13 global timeline; legacy only read later by P15 |
| **COMPARATOR OBSERVED:** *Planet Zoo* Vets use Research Centres and Mechanics use Workshops; those staff also perform operational duties | [official staff guide](https://www.planetzoogame.com/help-centre/player-guides/staff-and-guests) | how staff/facility research becomes tangible | **PRELIMINARY RECOMMENDATION:** visible workplace, named assigned person, real opportunity cost and blocker | **PRELIMINARY RECOMMENDATION:** reject work-zone micromanagement, fatigue/needs chores, and repeated manual reassignment | staff availability, facility reachability/capacity, persistent assignment | P13 |
| **COMPARATOR OBSERVED:** *Planet Zoo* keeps building and infrastructure as spatial management facts | [official building guide](https://www.planetzoogame.com/help-centre/player-guides/building-your-zoo) | how research relates to world state | **PRELIMINARY RECOMMENDATION:** Laboratory status at its world anchor and local access to the research view | **PRELIMINARY RECOMMENDATION:** reject research existing only as a detached HUD tree | existing P09 placement/facility projections plus P13 work state | P09 owns building; P13 owns research |
| **COMPARATOR OBSERVED:** *Anno 1800* population tiers open capabilities and production chains while older tiers remain part of the economy | [official residential-tiers devblog](https://www.anno-union.com/devblog-residential-tiers/) | era change without disconnected mini-games | **PRELIMINARY RECOMMENDATION:** cumulative capability and continuing old-method relevance | **PRELIMINARY RECOMMENDATION:** reject deleting/replacing the old economy at every transition | catalogue prerequisites, capability providers, ongoing demand | P13 |
| **COMPARATOR OBSERVED:** *Anno 1800* working conditions expose productivity consequences in an existing production system | [official working-conditions devblog](https://www.anno-union.com/devblog-working-conditions/) | how a technology consequence becomes legible | **PRELIMINARY RECOMMENDATION:** show which operation, capacity, cost, or reliability fact changes | **PRELIMINARY RECOMMENDATION:** reject anonymous empire-wide `+quality` | typed facility/production effect and explanation | P13 consumes P09/P11 |
| **COMPARATOR OBSERVED:** *Anno 1800: Land of Lions* uses a built Research Institute, Scholars, time, research points and assigned workforce for directed item research and Major Discoveries | [official Scholars and Research devblog](https://www.anno-union.com/devblog-scholars-and-research/) | directed research and personnel opportunity cost | **PRELIMINARY RECOMMENDATION:** queue, persistent staff allocation, targeted outcome, physical landmark | **PRELIMINARY RECOMMENDATION:** reject item reroll economy, frequent reassignment, and late-game system isolation | research work orders, time, capacity, catalogue result | P13 |

### Comparator synthesis

1. **PRELIMINARY RECOMMENDATION:** borrow Civilization's shared transition, not its identity reset.
2. **PRELIMINARY RECOMMENDATION:** borrow Planet Zoo's visible staff/facility causality, not its
   work-zone and needs maintenance.
3. **PRELIMINARY RECOMMENDATION:** borrow Anno's capability-chain visibility and directed research,
   not a loose collection of generic efficiency items.
4. **INFERENCE:** Project: Studio needs a smaller number of consequential transitions than any
   comparator because 6,240 weekly ticks already create a long decision history.

---

## 8. Open-source pattern register

No code or dependency is adopted. All six retained repositories are reference-only in this task;
their licenses are recorded and Project: Studio must independently implement any learned pattern.

| Repository / exact commit / license | Classification | Inspected files and symbols | Recommended pattern | Rejected pattern |
|---|---|---|---|---|
| [OpenTTD `96651d379a94e1aceaa986b7a0c76160bdc308fc`](https://github.com/OpenTTD/OpenTTD/tree/96651d379a94e1aceaa986b7a0c76160bdc308fc), [GPL-2.0](https://github.com/OpenTTD/OpenTTD/blob/96651d379a94e1aceaa986b7a0c76160bdc308fc/COPYING.md) | **ARCHITECTURE REFERENCE; TESTING REFERENCE** | `src/saveload/saveload.h::SaveLoadVersion`; `src/saveload/afterload.cpp::IsSavegameVersionBefore`; `src/core/random_func.hpp::SavedRandomSeeds`, `SaveRandomSeeds`, `RestoreRandomSeeds`; `src/misc/history_type.hpp::HistoryRange` | **OPEN-SOURCE PATTERN:** ordered migration gates, saved simulation RNG, separate bounded history aggregate | GPL code reuse; full historical scan for every view |
| [OpenRCT2 `9279d0659011c8acd42d89c720c46639f3fa53af`](https://github.com/OpenRCT2/OpenRCT2/tree/9279d0659011c8acd42d89c720c46639f3fa53af), [GPL-3.0](https://github.com/OpenRCT2/OpenRCT2/blob/9279d0659011c8acd42d89c720c46639f3fa53af/licence.txt) | **DATA-MODEL REFERENCE; ARCHITECTURE REFERENCE** | `src/openrct2/management/Research.h::ResearchItem`, `ResearchCategory`; `Research.cpp::ResearchUpdate`, `ResearchFinishItem`, `ResearchFix`, `ResearchCalculateExpectedDate`; `src/openrct2/object/ObjectRepository.h::ObjectRepositoryItem::Identifier`, `FindObjectLegacy`; `src/openrct2/park/Legacy.cpp::MapToNewObjectIdentifier`; `GameAction.hpp::Query`, `Execute` | **OPEN-SOURCE PATTERN:** explicit research stages/date, concrete unlocks, stable catalogue aliases, preview/mutate split | shuffled/index identity and copied queue behavior |
| [Unciv `6f5ce0dfb1df109df8c71f3702322dc95b6da322`](https://github.com/yairm210/Unciv/tree/6f5ce0dfb1df109df8c71f3702322dc95b6da322), [MPL-2.0](https://github.com/yairm210/Unciv/blob/6f5ce0dfb1df109df8c71f3702322dc95b6da322/LICENSE) | **DATA-MODEL REFERENCE** | `android/assets/jsons/Civ V - Gods & Kings/Techs.json`, `Eras.json`; `Technology.kt::Technology.prerequisites`; `TechManager.kt::techsToResearch`, `canBeResearched`, `getRequiredTechsToDestination`, `addTechnology`; `docs/Developers/Saved-games-and-transients.md` | **OPEN-SOURCE PATTERN:** catalogue separated from owner's progress, prerequisite reachability, derived transients | private studio catalogues and generic modifier bags |
| [Freeciv `6e3db6f5f7e211023295c912d4c5b6beea84a019`](https://github.com/freeciv/freeciv/tree/6e3db6f5f7e211023295c912d4c5b6beea84a019), [GPL-2.0-or-later](https://github.com/freeciv/freeciv/blob/6e3db6f5f7e211023295c912d4c5b6beea84a019/COPYING) | **DATA-MODEL REFERENCE; ARCHITECTURE REFERENCE** | `data/classic/techs.ruleset` (`format_version`, `req1`, `req2`, `root_req`); `common/research.h::struct research`, `research_invention`, `tech_goal`; `common/research.c::research_update`, `research_goal_step`; `server/savegame/savecompat.c::sg_load_compat`, `sg_load_post_load_compat`; `utility/rand.h::RANDOM_STATE` | **OPEN-SOURCE PATTERN:** independently version catalogue, validate reachability, phase migration, persist RNG | opaque leakage or formula copying |
| [Cataclysm-DDA `d40ce258946d4d33339950683bb8e3b74111996a`](https://github.com/CleverRaven/Cataclysm-DDA/tree/d40ce258946d4d33339950683bb8e3b74111996a), [CC-BY-SA-3.0](https://github.com/CleverRaven/Cataclysm-DDA/blob/d40ce258946d4d33339950683bb8e3b74111996a/LICENSE.txt) | **DATA-MODEL REFERENCE; TESTING REFERENCE** | `doc/JSON/OBSOLETION_AND_MIGRATION.md`; `data/core/mod_migrations.json` | **OPEN-SOURCE PATTERN:** explicit ID aliases/removals and legacy round-trip fixtures | silently remapping an unknown technology to a “close enough” item |
| [OpenRA `32f46cd7b13d104129616c90c8922bf01f059f8c`](https://github.com/OpenRA/OpenRA/tree/32f46cd7b13d104129616c90c8922bf01f059f8c), [GPL-3.0](https://github.com/OpenRA/OpenRA/blob/32f46cd7b13d104129616c90c8922bf01f059f8c/COPYING) | **TESTING REFERENCE** | `OpenRA.Game/Sync.cs::VerifySyncAttribute`, `Sync.Hash`, `RunUnsynced`; `OrderManager.cs::ProcessOrders`, `World.SyncHash`; `SyncReport.cs`; `ReplayRecorder.cs`; `LintBuildablePrerequisites.cs` | **OPEN-SOURCE PATTERN:** ordered replay, prerequisite lint, bounded divergence diagnostics | lockstep architecture copy or repeated whole-save hash per view |

**License ruling:** GPL and CC-BY-SA material is reference-only. MPL direct reuse would still require
explicit Owner approval and attribution. Default law for every entry is pattern learning and
independent implementation; no code was copied.

---

## 9. Current Project: Studio code/seam audit

The table describes the accepted TypeScript baseline, not an imagined post-P05/P06 tree.

| Seam | Exact current evidence | Classification | P13 ruling |
|---|---|---|---|
| current week | `src/core/types.ts::MarketState.tick`; `src/core/worldgen.ts` | **EXISTING** | consume as absolute weekly counter; add a global timeline root rather than overloading it |
| era | `src/core/types.ts::EraConfig` with `soundRequired`, `televisionCompetition`, `censorship`, `costScale` | **INERT PLACEHOLDER** for multi-era use; frozen save leaf | do not widen or repurpose; additive roots only |
| technology/research | no authoritative catalogue, progress, assignment, adoption or standard root | **ADDITIVE ROOT NEEDED** | P13 owns new versioned roots after authorization |
| facilities | `StudioOperations`, `StudioFacility`, placement/construction machinery; nine entries in `src/core/tuning.ts::FACILITY_BLUEPRINTS` on this base, none established here as the P13 Laboratory | **UPSTREAM PACKAGE DEPENDENCY** | P09 owns facility identity/build/condition; P13A needs an explicitly authorized minimal Laboratory blueprint/identity before it may reference one |
| staff | `Talent.id`, role/discipline data, player-relative employment; no accepted Scientist/support-worker identity contract for this use | **UPSTREAM PACKAGE DEPENDENCY** | P10 owns person and contract; the prescribed P13A checkpoint requires an approved stable Scientist identity/provider. An aggregate provider was evaluated but is not an unblocking substitute for the named-person/world proof. |
| rivals / studio identity | absent on accepted baseline; `Studio` is player-only | **UPSTREAM PACKAGE DEPENDENCY** | consume final P12 roots; never invent temporary rival identity |
| market competition | `MarketState.competingSlate` is empty at generation; `src/core/reception.ts` uses `competitionFactor = 1.0` | **DO NOT TOUCH** | P15 market law, not P13 |
| Standing / awards | three-channel `Standing`; no P13 ranking | **DO NOT TOUCH** | P08 owns interpretation and awards |
| economy | `ledger`, cash, facility capex/opex, theatrical runs | **UPSTREAM PACKAGE DEPENDENCY** | P11 owns debit timing/categories and executive display |
| people history | frozen `FilmParticipant` and `TalentCareerEvent` facts | **EXISTING** | technology credit may reference people; do not rewrite careers |
| studio history | `studioEvents`: permanent Tier D plus 26-week Tier W window | **EXISTING but insufficient** | reuse retention doctrine; add technology summaries/events without stuffing chatter into permanent rows |
| save | `src/core/save.ts`, Save V15; V1–V15 migration | **EXISTING** | new roots require next version and honest empty/unknown migration |
| bridge | generated closed snapshot/contract, Projection 11 at launch baseline | **UPSTREAM PACKAGE DEPENDENCY** | add bounded P13 projections only after final upstream refresh |
| long-run measure | `scripts/measure-v14-save-size.mts` through week 520 | **EXISTING but insufficient** | extend to 6,240-week endurance in a future implementation proof |
| P05 WIP | production projection/bridge changes observed read-only at `b44007d…` | **UNSEALED FORWARD EVIDENCE** | no design reconnaissance against those names |
| P06 | provisional release authority and post seams | **FINAL CHANGED-PATH REFRESH REQUIRED** | reconcile only after Owner-accepted P05 and final P06 authority exist |
| Unity | accepted client at `29aea89a706a7f0961f5a460afc5bdb4d38d8395` contains presentation/bridge foundations, not P13 authority | **DO NOT TOUCH** | TypeScript owns all P13 law; Unity eventually presents closed DTOs |

**CURRENT CODE VERIFIED —** `EraConfig` is a frozen leaf validated by prior save versions. Widening it
would reinterpret old bytes and contradict accepted additive-root law. A new catalogue/timeline/
adoption family is required.

---

## 10. Product fantasy

> The studio lot visibly crosses cinema history. The player sees a public breakthrough coming,
> chooses whether to pioneer it or let it mature—and, only if separately approved, license it—then watches that choice change what
> the studio can build and how a film can be made—while rivals make legible choices under the same
> rules.

The fantasy is not “fill a tree.” It is being an innovator, pragmatic adopter, or deliberate
holdout inside one living industry. A Laboratory with named Scientists creates an early advantage;
an equipment upgrade makes a soundstage or post facility visibly ready; an incompatible project has
a precise remedy; the archive later remembers who pioneered, who waited, and what work resulted.

---

## 11. Binding design laws

1. One global catalogue and timeline serve player and rivals; no private cloned trees.
2. `IndustryTimeline` truth, technology availability, studio knowledge, adoption, operation,
   public standardization, and obsolescence are distinct facts.
3. A technology grants or changes concrete capability, compatibility, throughput, reliability,
   facility/content access, cost, or world expression—never generic `+quality`.
4. Every effect names its provider, affected operation, before/after fact, and active reason.
5. Research and wait are unconditional routes; purchase is a third route, legal from commercial release and priced *(Amended 2026-09-10; §12.1a)*. Licensing is an Owner-gated successor route in a separate later slice, never a P13A requirement and never P14 talent-contract scope.
6. A public standard may become universal; private early advantage may not become permanent denial.
7. Earlier methods remain valid until explicit compatibility law changes them.
8. No hidden arbitrary era penalty and no fake historical precision.
9. Research queues and persistent assignments remove routine Scientist reassignment.
10. Staff and facilities remain P10/P09 identities; P13 holds references, not copies.
11. Rival adoption uses the same catalogue, prerequisites, cost classes, visibility, and outcomes.
12. TypeScript owns availability, progress, adoption, effects, RNG, history, and refusal reasons.
13. Unity may present only closed projected truth and cannot calculate research completion or rank.
14. Stable technology IDs survive display-name, content-pack, and catalogue-order changes.
15. Old saves receive honest absence/unknown provenance, never fabricated historical adoption.
16. No view scans the entire century of events; projections are bounded and paged.
17. No tick performs work proportional to full retained history.
18. Notifications describe a decision or material consequence, not routine progress.
19. P13 does not award Standing directly; P08/P15 may later interpret typed history.
20. Every first-checkpoint action must work from the world without a prior dashboard visit.
21. **Entry and operating-state changes preserve technology truth.** A later P15B/P12 entrant receives a P13-owned entry-week standard baseline with no retroactive research, adoption, or first credit. Dormancy/closure requires a typed P13 disposition for every active research/adoption order. P13 never changes P12 operating state, and no cross-package transition commits partially.

### 11a. Additional binding direction and obligation register — 2026-09-10

Laws 1–21 stand. The following continue the numbering and bind future P13 work under the Owner's 2026-09-10 direction. Numbers cited in examples are hypotheses.

22. **Early research is bounded, funded and prerequisite-gated.** A technology becomes researchable at its catalogue-defined early window when the studio holds the knowledge prerequisites. Cash accelerates qualified research; it cannot create missing knowledge, people, facility capability or work.
23. **Commercial release is a fixed public milestone.** At that milestone compatible upgrades become purchasable by every studio at a genuine price; before it, only a studio with its own completed research can deploy, on in-house terms. Release by itself never disables installed equipment.
24. **Payroll, Opex, project spending and installation are separate ledgers.** A budget is a ceiling on usable project spending, never a second wallet, never spent when work cannot use it, and never a substitute for salaries or building Opex.
25. **Concentrating resources has diminishing returns; splitting does not multiply people.** Cooperating laboratories on one project yield less than proportional output; parallel projects each proceed at their own staffed rate. Player and rival use the same function.
26. **Verified work is retained, never multiplied.** Cancel, pause, restart, duplicate command, staff transfer and laboratory change cannot lose or duplicate accumulated research work. A cancelled installation pays for completed work and necessary restoration and recovers only refundable unused commitments.
27. **Own development earns a disclosed price advantage.** A studio with valid invention provenance sees its concession as quote lines against a genuine comparable; research never merely unlocks an unchanged retail purchase, and no installation is free.
28. **Purchases skip obsolete equipment, never necessary work.** A direct purchase needs no obsolete intermediate equipment; conversion effort follows the actual source→target requirement, and known upcoming replacements are disclosed beside the quote.
29. **Plans are instructions, not purchases.** A queued plan creates planned expenditure only; commitment happens at execution inside player-approved authority, with review on material change, no silent substitution and no automatic hiring.
30. **Technology locks at first actual filming.** Productions already filming keep their loadout; productions not yet filming may adopt installed, operational, compatible technology after an explicit recheck.
31. **Provenance is preserved for later commercialization.** P13 records who developed what, when and with whom; rights, agreements, eligible sales, receipts and expiry are later interfaces, never a monopoly over a capability and never a self-purchase royalty.

**Obligation register.** These IDs are new only where an obligation is genuinely new; every earlier requirement, journey, fixture and invariant remains in force. Proof targets are documented, not run.

| ID | Obligation | Proof target |
|---|---|---|
| P13-OD-01 | Early-research window precedes commercial release; knowledge prerequisites gate eligibility; cash cannot bypass prerequisites, people, facility or work | `researchable` before `available` in the timeline fixture; refusal with exact prerequisite; funded project with missing prerequisite accumulates nothing and charges nothing |
| P13-OD-02 | The six facts of §2A.1 stay distinct in state, projections and copy | one fixture where each fact differs from its neighbors; no projection collapses two |
| P13-OD-03 | Named researchers up to laboratory capacity; payroll continues through P11 whether or not a project uses them; no free work, no double charge | seat-count refusal; payroll unchanged by assignment; idle-cost disclosure |
| P13-OD-04 | R&D budget is a per-project ceiling; only usable spend is charged; marginal benefit and bottleneck are shown; mid-project changes apply from the next tick without touching accumulated work | ceiling above saturation charges the saturation amount; ceiling change mid-project changes only future ticks |
| P13-OD-05 | Cooperation across laboratories yields diminishing returns inside the Owner's direction; split projects proceed independently; rivals use the same function | two-laboratory cooperation lands within 1.5–1.75× one laboratory under the fixture; rival fixture identical |
| P13-OD-06 | Retained verified work survives pause/cancel; restart seeds it exactly once; duplicates, transfers and laboratory changes cannot multiply it; retained work never moves across technologies or studios | receipt consumption; duplicate restart idempotent; second restart refused; transfer keeps accumulated work |
| P13-OD-07 (facility view: FUP-021) | Inventor quotes decompose into technology/access, equipment, site adaptation, installation and Opex change; the concession follows valid provenance; prototype equipment is billed once; no negative net; rivals symmetric | inventor/ordinary/prototype columns; pre-release quote shows in-house terms without an invented retail price |
| P13-OD-08 (facility view: FUP-020) | Direct purchase never requires obsolete intermediate equipment; conversion duration and cost derive from the actual source→target descriptor; portable equipment stays a purchase | Stage A/Stage B/camera fixtures; staged route contains no obsolete purchase |
| P13-OD-09 | Forecast windows become concrete public dates near release; known upcoming replacements are disclosed beside relevant quotes from public information only; rival secrets stay secret | quote fixture with announced successor; hidden rival research absent from disclosure |
| P13-OD-10 (facility view: FUP-022) | Persistent plan queues with dependencies, pause, reorder, cancel and waiting reasons; planned, reserved and committed money stay distinct; execution-time revalidation inside authority; material change pauses for review; no automatic hiring | queue fixture across a busy facility; over-authority quote pauses; staffing dependency waits for an employment action |
| P13-OD-11 (facility view: FUP-023) | Installation cancellation under option B shows completed-work, restoration and refundable rows and the resulting usable state before Confirm | option-B fixture with atomic P09/P11/P13 disposition |
| P13-OD-12 | Technology lock at first actual filming; pre-filming adoption rechecks plan, cost, availability and dates; new-film defaults use installed suitable technology while lawful older choices survive | before/after fixtures of §12.9; no retroactive footage change |
| P13-OD-13 | Invention provenance and commercialization interfaces are preserved without a supplier simulation in the core; self-purchases are never eligible sales; no capability monopoly | provenance record at completion; later agreement sketch consumes it; self-sale excluded |
| P13-OD-14 | All state is campaign-specific; Save/Load restores budgets, queues, progress, installations, provenance and any later rights with RNG, never rerolling or sharing across campaigns | mid-project, mid-queue, locked-loadout round trip; second campaign shares nothing |

---

## 12. State model

### 12.1 Global technology lifecycle

```text
catalogued
  -> forecast
  -> available
  -> diffusing (optional observation phase)
      ├─ standard-bound capability -> publicStandard -> mature
      └─ optional capability --------------------------> mature
  -> publicStandard (standard-bound hard/latest transition may bypass diffusing)
  -> mature (optional capability may bypass diffusing)
```

`catalogued` is data existence, not player knowledge. `forecast` exposes an honest bounded window.
`available` permits routes defined by the catalogue. `diffusing` is optional and means observed
adoption exists but the catalogue's maturity/standard predicate has not resolved. A standard-bound
capability can reach `publicStandard`; an optional innovation cannot. `mature` is stable widespread
use and is not synonymous with mandatory. `obsoleteForUse` is a versioned set of overlays on any
otherwise retained technology identity, never a deletion or an ambiguous terminal state.

Every catalogue entry declares which transitions are legal, whether `diffusing` is enabled, whether
it is standard-bound, and its latest-bound behavior. There is no implicit `diffusing → mature` or
`available → publicStandard` edge. At a public-standard event, every studio receives one persistent
standard-disposition fact—`operational`, `conversionRequired`, `inFlightGrace`, or `incompatible`—
even if its current research/adoption state does not change.

### 12.1a Early-research window and commercial release — 2026-09-10 Owner direction

**OWNER-SELECTED PRODUCT DIRECTION:** technology can be developed early through investment; commercial availability follows a fixed, historically informed rollout at which compatible upgrades become purchasable; research has genuine knowledge prerequisites.

**IMPLEMENTATION RECOMMENDATION.** Insert one milestone between `forecast` and `available` in §12.1:

```text
catalogued -> forecast -> researchable -> available (commercial release) -> diffusing | publicStandard | mature
```

- `researchable` opens the early-research window. A studio may `beginResearch` only when the window is open and it holds every knowledge prerequisite (§13 `prerequisiteTechnologyIds`, which are knowledge, not equipment). Cash spent before eligibility buys nothing and is not charged.
- `available` is the commercial-release milestone. From it, compatible upgrades are purchasable by any studio.
- **A third route: `purchase`.** *(Amended 2026-09-10.)* The 2026-08-30 candidate closed the route set at research and wait, with licensing as the only contemplated addition. The Owner's leapfrog direction needs a studio that neither researched nor deliberately waited to buy the current version once it is commercially released, so `purchase` joins `research` and `wait` as a route from `evaluating` to `readyToAdopt`. It is legal only from `available`, it carries a priced technology/access component that the developer's concession reduces (§16a.2), and it obeys every compatibility and facility prerequisite. It adds no second adoption state machine: adoption, work orders, cancellation and history are unchanged. `wait` keeps its distinct meaning as a deliberate declared state with a forecast, and its maturing still reaches `readyToAdopt` without an invented research credit. Route provenance therefore records `research`, `wait` or `purchase`, which is also what an inventor-pricing audit needs.
- **Where the two-route enumeration is superseded.** This addition governs §2's package definition, §3.2's owned-state list, §11 law 5, §12.2's lifecycle diagram, §14's world-first route inspection, §16's consequence classes, §23a, Annex §3.2, §4 `allowedRoutes` and `routeProvenance`, §5.3's route projection, §10's catalogue lint and §16.3's workspace anatomy. Those sections are amended in place where a sentence would otherwise be wrong; elsewhere the enumeration reads as of its date. P13A's own fixture may still prove research and wait only (§26); adding the purchase route to the checkpoint is a scope question for Current Ops, not a silent widening.
- A studio that completes research before `available` reaches `readyToAdopt` with own-development provenance and deploys on in-house terms (§16a.2); it never gains a monopoly, and the public milestone still resolves for everyone on the fixed rollout.
- Public standards and obsolescence keep §12.1 semantics. Commercial release is not a standard and never makes installed equipment unusable.

**NUMERICAL/CONTENT HYPOTHESIS:** each entry declares an early-research bound relative to its commercial-release milestone (a plausible fixture: a window opening several years before release, as the original game's research-availability year preceded its automatic unlock year in §5.1) and a fixed commercial-release week. Exact dates, curves and acceleration limits are tuning proposals. Unlimited alternate history is not promised: the window bounds how early research may begin, and nothing moves the commercial-release milestone earlier except a later-authorized commercialization decision (§16a.4).

**One clock.** The accepted product had no calendar when this rule was written: the absolute weekly counter was the only clock, and its calendar projection is a behavior-neutral view that publishes the current week rather than a date ([accepted TS `7ae36b4…`](https://github.com/HSpector1/The-Movies/blob/7ae36b44d99c505246d17dcc37beba94fa59a18a/src/core/types.ts#L276), `MarketState.tick`; [`studioCalendar.ts`](https://github.com/HSpector1/The-Movies/blob/7ae36b44d99c505246d17dcc37beba94fa59a18a/src/core/studioCalendar.ts)). P13 therefore stores weeks and milestone IDs, presents absolute weeks, and neither creates a second clock nor converts weeks into calendar years itself. When a calendar owner is accepted, P13 consumes it for presentation only. **Status, 2026-09-11:** that owner now exists. The shared calendar is a delivered P12 producer, `campaignDate()` mapping week 0 to 1920 Week 1 under `campaign-calendar-1920-52/v1`, with `market.tick` remaining authoritative ([P12 to P13 producer handoff `13370d4`](https://github.com/HSpector1/The-Movies/blob/13370d428f0693f3279732f6f4cc360a7fcaa4df/docs/engineering/P12-TO-P13-PRODUCER-HANDOFF.md)). This rule is unchanged by that: P13 still stores weeks and milestone IDs, still presents absolute weeks, and consumes the calendar for presentation only. The same handoff records that the calendar does not itself deliver technology, so per-entry commercial-release weeks remain a P13 recommendation rather than something the calendar supplies. Only the published handoff was read here.

Rivals obey the same window, prerequisites, staffing, funding and deployment laws through P12 conserved resources; no invisible catch-up and no guaranteed winner.

### 12.2 Per-studio lifecycle

```text
unaware -> aware -> evaluating
evaluating -> researching -> readyToAdopt
evaluating -> waiting -> readyToAdopt (only when public policy permits)
evaluating -> purchasing -> readyToAdopt (only from commercial release; priced)   // Amended 2026-09-10
readyToAdopt -> adopting -> operational
operational -> supersededForUse[]
```

Cancelled or paused research retains its verified accumulated work; wages, materials and research spending
already spent remain spent *(Amended 2026-09-10 under Owner selection 7A; see §12.8)*. Waiting is a
deliberate state with an estimated commercial-release window, not an idle no-op. If licensing is later
authorized, it supplies evidence that can move a studio to `readyToAdopt`; it does not add a second
adoption state machine and cannot bypass hard facility/compatibility prerequisites.

`readyToAdopt → adopting` creates one persistent `AdoptionWorkOrder`. It owns a stable ID, exact
studio/technology/provider references, required work, accumulated work, blockers, capacity
reservations, quoted and committed P11 consequence references, route provenance, and catalogue/
research/adoption/capability-rule versions. Completion is automatic in the authoritative phase when
all work and guards are satisfied; there is no claim click.

### 12.2a Physical facility conversion interface — 2026-09-10 candidate

**OWNER-REQUESTED PLAN REFINEMENT · UNSCHEDULED · CURRENT OPS REVIEW REQUIRED ·
NEW MECHANICS NOT APPROVED.** The [facility addendum](./FACILITY-UPGRADES-AND-STUDIO-OVERVIEW-01.md)
§§7–8 proposes the missing P09 physical renovation law. This is a targeted interface refinement
for disposition before activation, not a claim that the historical work-order shape is delivered.
P11 acceptance and P12 preparation remain separate; no implementation is authorized.

For a physical conversion, retain `AdoptionWorkOrder` as the P13 adoption episode/coordinator,
but give its physical work component **one P09 job/commit/progress owner**. Required/accumulated
physical work, ground/provider reservations and physical charges in the adoption view reference
that job's truth, not a second P13 countdown or obligation. Typed participant links identify
studio, technology/adoption/work-order, physical subject/providers, P09 job, pinned eligibility/
capability versions and P11 consequence/commit receipts. Genuine nonphysical research/training
remains P13 work; every component declares one owner and distinct costs only for distinct work.

One physical transaction preflights P09 legality/engagements, P13 eligibility and P11 money;
one completion receipt updates physical/provider truth and the eligible P13 capability result
atomically, exactly once. Section 12.4's adoption step consumes linked physical results rather
than advancing that work again. Core still owns phase order and frozen due sets: public-standard
dispositions precede technology completion eligibility, joint-earliest cohorts remain intact,
and cross-package publication waits for the full transaction. No early grant while another real
adoption prerequisite remains incomplete. Research/public availability never installs equipment
freely throughout the estate. Ordinary P09 capacity work need not await all of P13.

Preserve the Annex's queued/active/paused adoption cancellation, immutable receipts and new-ID
restart law. Physical cancellation must reconcile P09 restoration/retained work, P11 cash/Opex
and P13 readiness in one candidate; if a conversion cannot honor this right, stop its activation
and expose the proposed departure for disposition. The addendum's no-voluntary-abort suggestion
applies only to its first ordinary P09 retrofit. Already committed work retains safe completion,
typed hold or cancellation handling through eligibility/standard changes and feature disablement;
§12.5's all-owner studio-transition receipts remain mandatory.

My Buildings and lot selection enter the same exact P09 facility owner. P11 supplies financial
semantics, not another renovation system. Existing highest-only office effects are not deleted by
P13's prohibition on new generic technology quality bonuses. P09's real Builder obligation remains
separate; this interface invents neither staffing nor speed/cost law. A later rival-capacity adapter
must preserve symmetric P13/P12 law and P13A's rival proof, without rival 3D lots or P12 expansion.
All original P13 scope, substrate, save/history, endurance and Owner gates remain in force.

### 12.3 Assignment lifecycle

```text
queued -> active -> paused(blocker) -> active -> completed
                      \-> cancelled
```

An assignment is persistent. The player selects a policy/queue and can leave it running. A Scientist
may be reassigned explicitly, but completion never demands a ritual click or automatic shuffling.
On automatic completion, the assignment releases its Laboratory/person reservation exactly once;
cancel/restart uses an idempotency key and the retained-verified-work law of §12.8 *(Amended 2026-09-10)*.

### 12.4 P13-local same-week subphase ordering

The core scheduler owns the complete week and its phase catalogue. Within its P13 phase band for week
`W`, P13 consumes the scheduler-frozen due set and performs:

1. global timeline transitions ordered by `(effectiveWeek, milestoneId)`;
2. per-studio eligibility/standard-disposition updates ordered by `(studioId, technologyId)`;
3. research work and automatic completions ordered by `researchProjectId`;
4. adoption work, P11 commit revalidation, operational capability materialization, and automatic
   reservation release ordered by `adoptionWorkOrderId`;
5. rival policy decisions for the next legal phase under a dedicated domain/sequence; and
6. stage P13 history/index/summary/attention deltas after P13 writes; the core scheduler publishes
   cross-package projections only after every authoritative weekly phase commits.

Thus a public standard and research completion due in the same week have one answer: the public
transition resolves first; the research can complete afterward but cannot claim a pre-standard
first. When two or more studios cross the same research, operational-adoption, or qualifying-release
threshold in the same authoritative phase/week, they form one joint-earliest cohort; no stable-ID
tie-break creates a fictional sole winner. Stable-ID ordering only orders cohort-member/event commits
and never chooses unequal rules for player/rival.

### 12.5 Later-studio and operating-state participation — future P15B only

At an entrant's effective week, P13 derives the catalogue's then-current global availability and
public standards, writes one `entryWeekBaseline` disposition per relevant standard/capability, and
records `knownSinceWeek = entryWeek`. The entrant receives no pre-entry project, paid cost, credited
Scientist/Laboratory, private research lead, or earliest cohort membership. A duplicate request returns
the same receipt.

For active → dormant/closed requests, P13 preflights every active research project, adoption work
order, provider reservation, and pending P11 disposition under one Owner-approved typed rule
(`paused`, `cancelled_with_receipt`, or `completed_before_transition`). It returns one complete
participant receipt; P12's registry transition cannot commit until that receipt and all other owner
receipts validate in one `GameState` candidate. Failure leaves P13 and P12 unchanged. Re-entry resumes
only explicitly preserved work and never reconstructs dormant-period progress.

### 12.6 Research staffing, R&D budgets and multi-laboratory work — 2026-09-10 Owner direction

**OWNER-SELECTED PRODUCT DIRECTION:** multiple named research employees up to each building's capacity; an R&D budget that materially accelerates development; researchers and laboratories cooperating on one project or splitting across projects; diminishing returns from concentration, about 1.5–1.75× for two maximum-capacity laboratories on one project.

**IMPLEMENTATION RECOMMENDATION.**

- **People.** A researcher is a P10 person in the Scientist role employed by the studio under P12 employer truth. P13 holds assignments only. Each laboratory (a P09 facility) has a seat count; assignments beyond seats are refused with `LAB_AT_CAPACITY`. No daily-needs system, workforce redesign or empire-strength requirement exists.
- **Weekly output.** For one project, weekly output = (sum of assigned researchers' base output) × m(actual spend) × c(n), where m is the budget multiplier, c the concentration factor and n the number of cooperating laboratories. Output and duration differ: 1.6× output turns 16 comparable weeks into about 10, not into 6.4.
- **Budget.** The player sets a per-project weekly ceiling. Actual spend = min(ceiling, usable spend). Usable spend is what the assigned people can turn into work this tick, so it scales with how many researchers are actually on the project; the rest stays in cash and is never charged. A ceiling is therefore a permission, and an empty seat lowers what that permission can buy. The projection shows ceiling, actual spend, the marginal expected benefit of the next tier and the current bottleneck (`RESEARCH_SPEND_UNUSABLE`, `LAB_SEATS_AVAILABLE`, `LAB_AT_CAPACITY`, `TECH_PREREQUISITE_MISSING`). Payroll (P11 salaries) and laboratory Opex (P09/P11) continue whether or not a project uses them; installation is a separate P09/P11 quote. Nothing is charged twice and no work is free.
- **Cooperation and split.** A project lists its participating laboratories. Cooperating laboratories pool output through c(n) with c(1)=1. **The Owner's 1.5–1.75× is the total output of two cooperating laboratories relative to one, not the factor.** Once both laboratories' researcher output has been summed, the factor applied to that sum is 0.75–0.875; applying 1.5–1.75 to the summed output instead would give roughly 3×. The total and the factor keep different names in every projection and test. Independent projects each proceed at their own staffed rate; splitting never multiplies people. A studio runs at most one active project per technology. **Neither concentrating nor splitting is universally better** (Owner direction, 2026-09-11): with no cap on either project, concentrating delivers the first result sooner and the last no later, but where a brief's useful staffing limit or a scarce instrument leaves seats idle, splitting is the only arrangement that uses seats the studio is already paying for. [Catalogue §9.4](./STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md#94-research-allocation-when-concentrating-helps-and-when-splitting-helps) runs seven fixtures across workload, deadline, staffing limit and equipment.
- **Mid-project changes.** Adding or removing researchers, moving them between laboratories, raising or lowering the ceiling or adding a laboratory take effect from the next authoritative tick. Accumulated work is untouched; the estimate range is recomputed; no ramp or penalty law is proposed now, and any later one must be visible.
- **Rivals** allocate researchers, budgets and laboratories under the same function from P12 conserved resources.

**Per-project, not universal.** c(n) is derived from each brief's parallel fraction rather than being one constant: with fraction `p` and `n` cooperating laboratories the total is `1/((1−p)+p/n)` and the factor is that divided by `n`. The Owner's band corresponds to `p` between 0.667 and 0.857. A precision-constrained brief falls below the band and must display that reason rather than a range it cannot deliver. Profiles and worked values are in [catalogue §5.3](./STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md#53-parallel-profiles-and-the-corrected-concentration-law).

**Source support, not a formula.** §5.1 already records six Scientists across the original Laboratory with four assigned to one research section at a time (SOURCE VERIFIED). That evidence supports several named researchers and splitting them across work; it fixes no output rate. §5.1's "one room can hold one pack" describes the 2005 game, not a Project: Studio limit; the equivalent Studio rule is one active project per technology per studio (§12.8).

**NUMERICAL/CONTENT HYPOTHESIS:** base output per researcher, budget tiers and saturation, c(2)=0.8125 (1.625×) and the fixture work quantities are in [Annex §4.2](./CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13-BUILDER-ANNEX.md#42-owner-direction-analytical-matrix--2026-09-10-candidate). Whether the concentration factor should also apply within one large laboratory is a tuning question; the recommendation keeps output linear to seats inside one building.

### 12.7 Persistent plan queues — 2026-09-10 Owner direction

**OWNER-SELECTED PRODUCT DIRECTION:** Sims-like persistent queues for multiple building and conversion plans, multiple research projects, dependencies between them, and coordinated or parallel laboratories, without constant clicking.

**IMPLEMENTATION RECOMMENDATION.**

The accepted product already proves the core of this shape for one gate: its production queue persists typed intents with an ordinal and a queued week, holds nothing at all while queued, debits zero at admission, and revalidates at execution by re-running the same front-door verb ([`productionQueue.ts`](https://github.com/HSpector1/The-Movies/blob/7ae36b44d99c505246d17dcc37beba94fa59a18a/src/core/productionQueue.ts), [`queueAdmission.ts`](https://github.com/HSpector1/The-Movies/blob/7ae36b44d99c505246d17dcc37beba94fa59a18a/src/core/queueAdmission.ts)). The Owner's direction extends that pattern with dependencies, pause, reorder and several independent subjects; reorder and cross-gate plans do not exist today.

- A **plan** is a persistent instruction: kind (research, technology conversion, ordinary construction, equipment purchase), exact target, dependencies (other plans, a research completion, a commercial-release milestone, a facility becoming idle, a staffing level), execution authority (budget ceiling, price ceiling, quote version, chosen options) and state: `planned`, `waiting(reason)`, `ready`, `executing`, `pausedForReview(reason)`, `paused`, `cancelled`, `done`.
- **Money.** Three things stay distinct. **Planned expenditure** is what a plan would cost: shown beside cash on the plan surface, never subtracted from it and never injected into a P11 forecast, because P11's binding law keeps cash literal, admits only scheduled authoritative receipts and obligations into forecasts, and forbids an invented available or reserved balance until a real reservation mechanism is authorized. **Reserved resources** are physical earmarks their own owner models, such as P09 ground or provider capacity; a cash reservation would be a new P11 authority decision, not something P13 may add. An **accepted commitment** exists only when the plan executes through the owner's normal commit (P13 research begin, P09 job commit, P11 commit) and matches P11's `knownCommitment` time class. A queued instruction never silently creates an irrevocable purchase.
- **Execution.** When dependencies are satisfied and resources are available, the plan re-quotes. If the fresh quote and terms fall inside the authority, it commits without a click. Any material change beyond the authority (price, duration, downtime, target, provider, staffing) moves the plan to `pausedForReview` with the delta shown. No silent substitution. A staffing dependency waits for an authorized employment action, which in the accepted product means the ordinary contract-signing verb rather than any construction- or research-specific hire; a plan never hires.
- **Parallelism.** Independent feasible plans execute in parallel. There is no mandatory global serial queue and no weekly reassignment ritual. The player can pause, reorder, cancel and read each waiting reason.
- **"After this film."** A plan that must wait for a busy facility declares its admission policy before approval: `closeAdmission` stops new engagements on that facility so it drains and the plan starts when current holders clear; `openAdmission` allows new work to enter and may starve the plan. The consequence is shown before approval, and no exact start date is claimed while open-ended holds remain.
- **Ownership.** Research plans are P13 work; physical plans execute through the one P09 job of §12.2a and P11 semantics. The plan queue is a coordinator, not a second progress owner.
- **Not a construction capacity queue.** A plan is a waiting instruction, never a global construction slot, a cap on concurrent sites, a Builder allocation or an order imposed on physical work. Accepted P09 law has no construction slot, queue, workforce allocation or speed-up action, defers construction queue and cap, forbids inventing Builder speed, assignments or construction queues before its authoritative Builder extension, and lets every valid committed project proceed concurrently. All of that stands: no Builder payroll, headcount or speed is invented here, and existing construction law is the substrate.
- **Cancellation.** Cancelling an unexecuted plan has no domain effect. Cancelling an executing plan follows the owner's law (§12.8).

### 12.8 Retained work, cancellation and restart accounting — 2026-09-10 Owner direction

**OWNER-SELECTED PRODUCT DIRECTION:** verified research progress survives cancellation and pausing (7A); spent labor and materials remain spent; installation cancellation pays for completed work and necessary restoration and recovers only genuinely refundable unused commitments (10B).

**IMPLEMENTATION RECOMMENDATION.**

- **Research.** Accumulated work belongs to the project, which belongs to (studio, technology). Pause keeps the same project. Cancel writes a receipt with `retainedWork` = accumulated verified work and marks money spent as spent. Restart creates a new project seeded with the receipt's retained work exactly once and marks the receipt consumed; a duplicate restart command is idempotent; a further restart after consumption is refused (`RETAINED_WORK_ALREADY_CONSUMED`). Moving researchers or changing laboratories moves nothing but future output. Retained work can never exceed required work, move to another technology or studio, or exist twice because two projects on one technology in one studio are refused (`RESEARCH_ALREADY_ACTIVE`). This supersedes §12.2's "only if the catalogue explicitly defines it".
- **Installation.** Cancelling an executing physical conversion or purchase produces one atomic P09/P11/P13 disposition: completed work is paid, necessary restoration is charged, refundable unused commitments are recovered under P11's disposition, retained physical work is recorded as a physical fact, and the resulting usable state is shown before Confirm.
- **Option B is a new authored disposition, not the demolition path.** Its amounts must never be computed from the accepted demolition credit, a rounded fraction of a blueprint's capital cost, because that credit answers a different question and is deliberately lossy. Accepted law also offers no free cancel for committed construction: removing an unfinished site is a demolition with that same credit and its completed work written off. Option B therefore needs its own authored components, and aligning ordinary retrofits with it would change accepted behavior, which is a Current Ops decision. The addendum's no-voluntary-abort suggestion stays a recommendation for ordinary P09 work only and is not carried into technology adoption.
- **Save/Load** restores every receipt, retained-work fact and consumption mark; reload cannot re-seed work.

**NUMERICAL/CONTENT HYPOTHESIS:** which components are refundable, the restoration cost basis and any credit of retained physical work toward a restart (Annex §4.2 M5).

### 12.9 Production technology lock at first filming — 2026-09-10 Owner direction

**OWNER-SELECTED PRODUCT DIRECTION:** films currently filming keep their existing technology; films that have not started filming can use new technology.

**IMPLEMENTATION RECOMMENDATION.**

- The authoritative lock is the production's **first actual filming** in the accepted production lifecycle. Creation, development, greenlight, casting and entering the production queue do not lock. The accepted phases run development, pre-production, rehearsal, shooting, post-production, release-ready, derived from the production's remaining ticks ([`productionPhases.ts`](https://github.com/HSpector1/The-Movies/blob/7ae36b44d99c505246d17dcc37beba94fa59a18a/src/core/productionPhases.ts)); rehearsal holds a soundstage but is not filming. **Recommended lock:** entry into the shooting phase, whose accepted witness is the phase-entered event that also mints the shooting take. The alternative is the first authoritative take, which the accepted advance out of the first shooting week requires to be scheduled; that is one week later and would let a production sit in shooting unlocked. There is no dedicated shooting-started event today. **POST-P12 VERIFICATION REQUIRED:** confirm the transition and pick one of the two.
- At that point the production's technology loadout (capabilities, provider IDs, rule versions) becomes immutable. Captured footage, existing results and already-filming loadouts are never retroactively improved. No reshoot system and no post-production replacement system is imported.
- Before first filming, adopting newly installed, operational, compatible technology requires an explicit recheck of the production plan (method compatibility), cost (P11 re-quote), availability (provider operational and not reserved) and dates. Nothing is charged or replanned silently; unavailable hardware cannot be equipped; commercial availability alone is not installed equipment.
- New productions default to installed suitable technology; a deliberate older method remains selectable where compatibility and standard law allow (§11 law 7).
- The public-standard disposition `inFlightGrace` of §12.1 uses the same definition of in-flight; a production that has not begun filming at the standard date is not in-flight.

---

## 13. Data/identity model

### 13.1 Required identities

- `technologyId`: immutable semantic identity, never catalogue index or localized title;
- `catalogueVersion`: exact definition version used when a fact was created;
- `timelineMilestoneId`: immutable public event identity;
- `studioId`: P12 identity, never studio display name;
- `adoptionId`: immutable studio/technology adoption episode identity;
- `researchProjectId`: immutable work order identity;
- `adoptionWorkOrderId`: immutable implementation/conversion work identity;
- `personId`: P10 person identity for each Scientist credit/assignment;
- `facilityId`: P09 Laboratory or affected facility identity;
- `capabilityId`: stable concrete behavior/capability identity;
- `historyEventId`: immutable event identity with a monotonic sequence and exact catalogue,
  timeline-policy, research-rule, adoption-rule, capability-rule, and cost-quote/commit versions
  applicable to that event.

### 13.2 Normalized ownership

The global catalogue owns definitions and prerequisite edges. `IndustryTimeline` owns public
milestones. Each studio owns P13 adoption, research-work, standard-disposition, and
`AdoptionWorkOrder` records keyed to global IDs. Facilities and people own their own state elsewhere;
P13 stores exact foreign references and reservations, never copied condition, role, or employer
truth. Projections join by exact ID; a title, array position, decade, or nearest building can never
stand in for identity.

### 13.3 Catalogue changes

Renaming changes display data, not identity. A split requires an explicit migration mapping and
honest legacy disposition. A removed/merged ID remains resolvable as an archived alias. Unknown
future IDs fail visibly; they are not coerced to “similar” technology.

---

## 14. World-first interaction

The primary route is:

```text
timeline milestone / Laboratory world signal
  -> select exact Laboratory
  -> local research card
  -> inspect one technology and its currently authorized research and wait routes
  -> confirm exact route, cost, duration, prerequisites, and consequence
  -> persistent work appears at the Laboratory
  -> completion/adoption changes the exact affected world body and production decision
```

The Laboratory shows restrained state at management distance: idle, active, paused, breakthrough,
or no valid work. A soundstage conversion is visible on that soundstage, not merely in a badge.
Timeline and research workspace are shortcuts and deep inspection, never prerequisites to world
interaction. The camera moves only on an explicit Locate action.

World presentation must remain honest about abstraction. Decorative Scientist movement may support
legibility but carries no hidden progress. The exact assigned person, facility, project, and affected
capability come from TypeScript state.

---

## 15. Workspace/information architecture

### 15.1 Three coordinated surfaces

1. **Industry Timeline:** public past/forecast milestones, standardization windows, era context.
2. **Studio Innovation:** the studio's active queue, route decisions, adoption, blockers, costs.
3. **Technology Detail:** prerequisite chain, route comparison, concrete capability, compatible
   facilities/productions, rivals' publicly known adoption, provenance and history.

### 15.2 Information order

Every technology detail reads in this order:

1. what becomes possible or changes;
2. current global state and forecast confidence;
3. current studio state;
4. available routes with cost/time/opportunity cost;
5. prerequisites and exact blockers;
6. affected facilities/productions/content;
7. rival/public context;
8. historical record and source/version detail.

The workspace never leads with research points or a decorative tree. Graph view, if retained after
P13A, is an optional topology lens over the same catalogue, with list and timeline equivalents.

---
## 16. Economy and resource consequences

**PRELIMINARY RECOMMENDATION — technology has an auditable life-cycle cost, not a second currency
game.** Research consumes assigned staff/provider time, Laboratory capacity where the concrete route
is authorized, operating cost, and explicit project research spending under a per-project budget ceiling
*(Amended 2026-09-10; §16a.1)*. Adoption can
require facility conversion capex, downtime, training, or increased operating cost. Waiting avoids
early expense but defers the capability and may create later conversion pressure when a public
standard arrives. A future authorized license may add a named one-time or term-bound rights fee; no
such fee or rights object is part of P13A.

P11 remains authoritative for debit timing, ledger kind, forecast inclusion, cash refusal, and
executive summaries. P13 supplies typed causal requests such as `researchProject` or
`facilityConversion`; a future licensed route would require an independently approved
`technologyRightsFee`. Implementation reconnaissance reconciles any request with actual P11 symbols.
There is no “science money,” no hidden maintenance fee, and no free rival adoption.

Concrete consequence classes are:

| Class | Example | Allowed | Prohibited shortcut |
|---|---|---|---|
| capability | record synchronized dialogue | unlocks an explicit production path | `+5 quality` |
| compatibility | sound-capable stage and post chain | names required providers and old-method fallback | hidden era mismatch penalty |
| throughput | conversion changes a named phase duration/capacity | visible before/after duration and cause | global speed percentage |
| reliability | known failure/variance class becomes bounded | typed risk and remedy | undisclosed dice |
| catalogue access | period set/effect/facility blueprint becomes available | stable content IDs and prerequisites | duplicate private content tree |
| cost | equipment/stock/workflow changes capex or opex | ledger-attributed, formula-versioned | anonymous cash drain |
| quoted cost components *(Amended 2026-09-10; §16a.2)* | technology/access, equipment/manufacturing, site adaptation, installation, operating-cost change | each component typed, owned and separately shown, with the own-development concession visible | one undifferentiated capital figure |

**OWNER DECISION REQUIRED —** licensing itself, its rights object, eligibility, scope, expiry,
transferability, price formation, and symmetry are not decided here. P13A excludes it. *(Amended 2026-09-10:
the direction is recorded in §16a.4 as later commercialization scope; those terms remain open.)* If later
authorized, a bounded `P13L — Technology Rights & Licensing` or P16+ charter must define the
substrate; P14 owns talent-market cases, not technology-rights negotiation.

## 16a. Research spending, inventor pricing, purchase quotes and commercialization — 2026-09-10

### 16a.1 Four ledgers, one wallet

**IMPLEMENTATION RECOMMENDATION.** P11 remains the only wallet and owns debit timing and categories. P13 supplies four distinct causal requests, never merged and never duplicated:

| Ledger | Cause | Timing | What it is not |
|---|---|---|---|
| Researcher payroll | P10/P12 employment | continuing salary, unchanged by assignment | a research cost that stops when a project pauses |
| Laboratory Opex | P09 facility | continuing building charge | a project cost |
| Project research spending | the lesser of the P13 budget ceiling and the usable spend | charged per tick only for usable spend | a second wallet, an automatic expenditure, a refundable deposit |
| Installation and equipment | P09 job, P11 quote/commit | quote, commit, Opex onset per accepted placement law | research spending |

The projection shows, per project, the ceiling, this tick's usable spend, the expected marginal benefit of the next tier and the bottleneck that prevents further acceleration. **OPEN QUESTION** 3 of §24 (dedicated categories versus correlation) still applies; the request kinds are `researchSpending`, `facilityConversion` and `equipmentPurchase`.

### 16a.2 Inventor pricing

**OWNER-SELECTED PRODUCT DIRECTION:** a studio that developed a technology and then deploys or buys it receives a meaningful own-development price advantage.

**IMPLEMENTATION RECOMMENDATION.**

- **Provenance.** Completing own research writes an `InventionProvenance` record: technology, studio, contributing project IDs, completion week, whether the research prototype includes usable equipment, and an entitlement class (`ownDevelopment`). Researching public background knowledge, holding a prerequisite or selecting a technology card creates none. Rivals earn provenance under the same rule; independent invention gives each inventor its own entitlement.
- **Quote decomposition.** Every deployment quote lists: technology/access (or own-development concession), equipment/manufacturing, site adaptation/construction (P09), installation (P09), and any distinct Opex change (P11). The inventor's quote shows the concession lines, the final amount and the net benefit. When a genuine comparable exists (after commercial release), the ordinary purchaser's amount is shown beside it; before release, the quote shows in-house deployment terms and states that no retail comparison exists yet, without inventing one.
- **Not free, not double.** Site adaptation and installation are real work and remain payable; the floor of any quote is that real work, so no net is negative. If the research prototype already includes usable equipment, the record says so and the first installation lists equipment at zero; it is never billed again and never counted twice.
- **After commercialization.** If the inventor appoints a supplier (§16a.4), the agreement carries retained own-use rights and the originator purchase benefit as explicit terms; the benefit is protected in the agreement rather than lost when a supplier begins selling. Transfer, co-development and inherited entitlement are later cases.
- **Guardrails.** No ownership of an entire historical technology follows from one invention; no self-purchase produces a royalty; concession rates and eligible components are hypotheses.
- **Not recovered parity.** §5.2's safe parity statement stands: the inspected original evidence supports comparative research *timing*, not a price advantage. Inventor pricing enters as OWNER-SELECTED PRODUCT DIRECTION and must never be described as original-game parity. Historical practice in the real sound transition is a separate SOURCE FACT recorded in the [review hub](./FACILITY-MODERNIZATION-CURRENT-OPS-REVIEW.md#owner-direction-update--2026-09-10); it motivates the mechanism and settles none of its numbers.

**NUMERICAL/CONTENT HYPOTHESIS:** concession of 100% on technology/access and 25% on equipment, full site and installation cost, prototype equipment billed once (Annex §4.2 M4). The component the matrix lists last, `opexChange`, arrives with the rest: the adoption state machine grants `operational` and the new Opex together on required-work completion, so a converted stage's higher weekly charge starts after installation rather than after its site work (recorded 2026-09-11, after the catalogue found its own prose saying otherwise). The matrix flags that the first-installation benefit can approach the research cost; tuning must decide which moves. **The accounting itself is now settled** (Owner direction, 2026-09-11): benefits coexist where they concern different costs, no expense is credited twice, and equipment already produced and paid for is never charged again. Only the rates remain hypothesis. [Catalogue §9.2](./STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md#92-inventor-against-commercial-buyer-whole-life) works the components through at a proposed scale and finds the first-installation benefit real but small beside the department's own fixed cost, which is where any balance lever belongs.

### 16a.3 Purchase quotes, forecasts and replacement disclosure

**OWNER-SELECTED PRODUCT DIRECTION:** direct purchase without obsolete intermediate equipment; gap-aware conversion work; forecast windows becoming concrete public dates near release; known upcoming replacements shown beside purchases.

**IMPLEMENTATION RECOMMENDATION.** The physical side is the facility addendum's §6a and §7a. On the P13 side:

- Every quote compares current and target capability, incremental benefit, cost, downtime, footprint and blockers, and offers direct conversion, staged conversion where a physical step is genuinely separable, build another and wait. No route contains an obsolete purchase.
- The timeline publishes a forecast window for distant developments and an announced public date once a release enters the near-release horizon. Any equipment or conversion quote whose target has a publicly forecast or announced successor shows "Known upcoming replacement: {technology}, {window or date}" beside the price. Only public information is disclosed; secret rival research stays secret, and a predictable commercial launch is never hidden to create an obsolete-purchase surprise.
- **NUMERICAL/CONTENT HYPOTHESIS:** the near-release disclosure horizon (the Owner's illustrative phrase was "within a few months"; the plans recommend a tunable horizon on the order of two quarters and do not claim an approved number).

### 16a.4 Supplier commercialization — LATER COMMERCIALIZATION SCOPE

**OWNER-SELECTED PRODUCT DIRECTION:** commercializing studio-developed technology through a supplier, potentially for an upfront payment and time-limited royalties, is desired. Rates, exclusivity, term, supplier sales behavior and final package placement are not approved. P16+ remains the default placement unless a later Owner ruling places it elsewhere, with Current Ops' activation review preparing that recommendation; this records the expanded vision, not a package number or coding order.

**IMPLEMENTATION RECOMMENDATION, first model.** One specific invention (an `InventionProvenance` for a product or process), one `SupplierCommercializationAgreement` with an industry supplier (a governed industry source, as §23 already recommends before bilateral studio deals), an upfront payment, royalties on eligible sales, a defined term, retained own-use rights and the originator purchase benefit. Private use (no agreement), outright rights sale (one payment, commercialization rights leave, own use retained) and supplier licensing remain distinguishable; discovering a capability confers no monopoly over it.

**Interfaces P13 must preserve** (sketches in Annex §4.3; no supplier simulation in the P13 core and no speculative schema fields): invention provenance (core); a technology-rights record; the supplier agreement; an eligible-sale event whose declared causal basis is a supplier sale to another studio, such as a rival's purchase-route adoption commit; a royalty receipt as P11 income; and agreement expiry. Royalties never come from random weekly cash, rival box office or the originator's own purchases.

**Defaults recommended, terms unresolved:** independent rival invention allowed with its own entitlement; commercial obsolescence ends eligible sales but not the term; non-exclusive supplier right as the default with exclusivity open; a supplier launch may not move the fixed commercial-release milestone earlier unless the Owner decides otherwise; own-use concessions retained. No questionnaire is asked now.

---

## 17. Multi-studio symmetry

**PROJECT AUTHORITY VERIFIED —** P12 owns studio identity, policy, conserved resources, roster, and
projects. P13 adds no rival shell and cannot spawn technology effects without those causes.

Symmetric law means:

- every studio references the same `technologyId` and catalogue definition;
- the same global availability and standardization event reaches all studios;
- research/wait eligibility uses the same prerequisite classes; any later authorized licensing route must join this same law;
- player and rivals pay from authoritative resources under the same cost class;
- adoption occupies real facility/capacity time under the studio's abstraction level;
- a rival film can use a capability only if that rival's adoption is operational;
- public information follows the same disclosure policy; the player does not receive omniscient
  hidden rival progress;
- reason facts identify why a rival adopted, waited, or could not proceed without exposing secret
  RNG or hidden preference numbers;
- research budgets, laboratory seats, concentration returns, retained work, invention provenance and
  plan authority use the same functions for every studio; rival ceilings are funded from P12 conserved
  resources, and no rival receives invisible research catch-up *(Amended 2026-09-10)*.

Rivals may choose through deterministic policy rather than player UI. That is presentation
asymmetry, not simulation-law asymmetry. The player may receive richer forecast tools, but not a
different market rule. A rival cannot receive a silent catch-up technology or ignore a conversion
cost merely to maintain challenge.

---

## 18. Save/migration/RNG/determinism

### 18.1 Save law

Future implementation requires a new save version; frozen V1–V15 shapes remain frozen. New roots are
additive and canonically ordered. `EraConfig` remains untouched. The save persists:

- catalogue and timeline version identifiers, not duplicated display data;
- public milestones already resolved, with exact week and policy version;
- every studio's adoption and active research work;
- every active `AdoptionWorkOrder`, standard disposition, capacity reservation, blocker, accumulated
  work value, and exact P11 quote/commit reference needed to resume honestly;
- exact assigned person/facility IDs;
- accumulated work and blockers needed for continuation;
- material completed/cancelled history or compact summaries;
- simulation RNG state and stable event-sequence allocation.
- scheduler-owned immutable `phaseId`, sparse `phaseOrdinal`, and `phaseOrderVersion` on every new
  P13 history event; P13 cannot remap them when the weekly scheduler catalogue evolves.
- entrant-baseline and operating-state participant receipts when a later Owner-authorized P15B slice
  invokes them; these record only entry-week truth or typed work disposition, never a copied P12 state.
- per-project budget ceilings and participating laboratories, retained-work receipts and consumption
  marks, invention provenance, production loadout locks, plan queues with dependencies/authority/
  admission policy, and, once an authorized later slice models them, rights, agreements, eligible-sale
  events, royalty receipts and expiries. All of it is campaign-specific: Save/Load restores it and never
  rerolls, resets or shares research between independent campaigns *(Amended 2026-09-10)*.

### 18.2 Honest migration

An old save cannot truthfully say which studio researched sound in 1928. Migration creates an
explicit `legacyInitialization` provenance at the load week. The global catalogue resolves the
minimum capabilities required to keep the already-saved world playable; it does not create
retroactive breakthroughs, credits, dates, rival leads, or awards. Released films remain exactly as
saved. If a current production requires a compatibility fact absent from the old schema, migration
uses a named compatibility grant limited to that production and records why.
Legacy events without phase evidence remain `phasePrecision: not_recorded` in a fixed
`legacy_phase_unspecified` bucket. Migration never infers their phase from the current tick order.

### 18.3 Deterministic milestone law

Global windows use the world seed, immutable milestone ID, and formula/policy version. Studio
research completion depends only on persisted inputs and deterministic weekly work. Rival decisions
use studio ID, technology ID, decision sequence, and a dedicated RNG domain. UI preview consumes no
simulation RNG. Reordering catalogue rows, rendering a screen, paging history, or changing locale
cannot change outcomes.

### 18.4 Replay proof

For a fixed initial save and intent sequence, the implementation must reproduce milestone weeks,
assignment progress, adoption choices, costs, facility compatibility, history IDs, and final state.
Diagnostics hash bounded canonical checkpoints, not the entire save on every view.

---

## 19. Long-horizon performance/storage

The authored campaign covers 1920→2040: approximately 6,240 weekly ticks. P13 design assumes the
upper bound from the start.

### 19.1 Bounded work

- milestone resolution inspects only the next unresolved milestone(s), never the full catalogue;
- active research work is indexed by studio and active project, not discovered by history scan;
- capability lookup uses materialized sets/maps keyed by stable ID;
- prerequisite validity is linted at catalogue load and cached as a topological plan;
- each week visits active studio assignments and due milestones only;
- P13 history pages use append-stable `(effectiveWeek, phaseOrdinal, 'P13', p13DomainSequence, eventId)`
  cursors bound to subject, filters, schema/segment generation, requested/applied page size, and
  `asOfP13DomainSequence`; a merged history freezes one high-watermark per source domain and merges by
  `(effectiveWeek, phaseOrdinal, domainId, sourceOrderOrdinal, eventId)`. P13 native rows use their
  own domain sequence; an older P08–P12 domain without one must supply its own versioned metadata-only
  archive-order adapter or be excluded with explicit incompleteness. P13 never mints foreign order;
- current projection reads materialized status plus a bounded recent-reason window;
- summaries update when an event is appended, never by repeatedly reducing the full archive.

### 19.2 Storage budget

**PRELIMINARY RECOMMENDATION —** budget P13's expected 6,240-week incremental persisted contribution at
under 1 MiB for the expected catalogue and studio count, with a 2 MiB hard investigation threshold.
This is a design target, not a measured current fact. A plausible fixture—128 catalogue entries,
ten studios, one current adoption row per studio/technology only where touched, roughly 3,000
material history/summary rows, and no weekly progress events—fits the target with compact IDs and
canonical JSON. Exact bytes must be measured against future schema, not promised from arithmetic.

Do not persist weekly “research progressed” rows. Persist current accumulated work, material state
transitions, and periodic aggregate summaries. Retain irreversible firsts, adoption/standard dates,
credited people/facilities, and consequences permanently. Compact routine pauses/resumes into
bounded reason intervals once no active investigation references them.

### 19.3 Endurance gates

Run two named envelopes. The **expected** fixture uses 10 studios, 128 technologies, at most two
active research/adoption work orders per studio, and roughly 3,000 material events. The **hostile**
fixture uses 32 studios, 512 technologies, eight active work orders per studio, 100,000 material
events, repeated pause/cancel/resume, catalogue aliases, and pages at least 20 times the configured
page size. These are test cardinalities, not promised production content counts.

At weeks 0, 52, 520, 2,080, 4,160, and 6,240, capture save bytes, P13 root bytes, event counts,
projection time, weekly tick percentile, migration time, and replay digest. Reject quadratic trend,
duplicate IDs, orphan prerequisites, capability loss, rival impossible use, or fabricated history.

---

## 20. Accessibility/input

- Every color-coded era/adoption state also has text, icon, and shape.
- Timeline zoom and graph layout never become the only way to inspect or choose a technology.
- List view offers logical grouping, search, filters, prerequisite breadcrumbs, and status text.
- Screen readers receive technology name, global state, studio state, consequence, route, cost,
  duration, prerequisite, and blocker in that order.
- Reduced motion replaces breakthrough animation and world pulses with a static state change.
- Large text reflows cards; essential comparison columns collapse into stacked labeled fields.
- Keyboard and controller expose equivalent direct navigation, confirmation, cancellation, Locate,
  comparison, and history paging.
- Hover-only explanation is prohibited. Focus and tap reveal the same reason.
- Estimated windows use absolute in-game dates as well as relative durations.
- Historical uncertainty is written as a range/qualification, never communicated by color alone.

---

## 21. Attention/notifications

Notifications are event-classified and deduplicated by exact ID:

| Class | Attention | Example |
|---|---|---|
| decision required | interruptive but non-time-advancing | “Synchronized sound can now be researched or watched until public access.” A license route appears only in a later authorized slice. |
| blocker | visible at world anchor and workspace | “Sound research paused: assigned Laboratory is not operational.” |
| material completion | single toast + world change | “Sound recording is ready to adopt.” |
| public standard | timeline bulletin | “Synchronized dialogue is now the public exhibition standard.” |
| rival public adoption | digest unless immediately relevant | “Argent Pictures has announced its first sound production.” |
| routine progress | no notification | weekly work accumulation |

The same event never creates separate noisy notices from timeline, Laboratory, and facility. The
attention service chooses one primary presentation and links to exact context. “No action needed”
events default to the digest. Auto-pause is an explicit player setting, not hidden package law.

---

## 22. Historical record requirements

P13 permanently records:

- public milestone availability, standardization, and per-use obsolescence dates;
- earliest studio research-completion cohort, earliest operational-adoption cohort, and earliest
  qualifying-release-use cohort, each containing one or more studios/releases where the facts actually
  occurred; no singular “first” is manufactured from same-phase ties;
- first technology-rights/license event only if a later authorized slice actually records one;
- each studio's material adoption/abandonment/supersession events;
- exact credited Scientists and Laboratory/facility IDs;
- technology version/policy and consequence facts used at decision time;
- setbacks that materially delayed or cancelled adoption;
- migration provenance and explicit unknown/legacy status;
- typed links to films, facilities, ledger events, and studio history without duplicating their
  authoritative data;
- invention provenance, production loadout locks referenced by film history and, when a later slice
  records them, commercialization agreements, eligible sales, royalty receipts and expiries
  *(Amended 2026-09-10)*.

It does not store prose generated by a UI, weekly progress chatter, speculative forecasts as fact,
or awards/Standing inferred after the event. P08 interprets awards/history; P15 turns the retained
facts into comparative and legacy views. No future rename, studio ownership change, retirement, or
catalogue revision can rewrite the original identity.

---

## 23. Owner decisions

Recommendations are explicit and do not silently become scope.

| Decision | Options | Recommendation | Consequence | Implementation dependency | Blocks P13A? |
|---|---|---|---|---|---|
| transition dates | fixed exact dates; bounded historically anchored windows; fully free alternate history | **PRELIMINARY RECOMMENDATION:** bounded earliest/normal/latest windows, seeded deterministically, with fixed fixture policy in P13A | preserves recognizable cinema history and replay variation without fake precision | timeline catalogue, deterministic event domain, forecast UX | **No**—P13A pins one fixture window and reports that choice |
| research versus licensing | research + wait only; add industry license; add bilateral license | **PRELIMINARY RECOMMENDATION:** seal research/wait first; consider licensing only in a separately authorized P13L/P16+ technology-rights slice and label it successor design | preserves the evidenced core while avoiding an invented rights/price model; a later license requires scope, expiry, transfer, price, disclosure, and rival symmetry | P11 finance, P12 studio identity/resources, new technology-rights substrate; **not P14 talent law** | **No**—licensing is excluded from P13A |
| can technology be skipped? | nothing skippable; optional methods skippable; every technology permanently skippable | **PRELIMINARY RECOMMENDATION:** optional capabilities can be skipped; public standards cannot be ignored once incompatible work is attempted | supports holdout strategy without impossible productions | compatibility map and production decision/refusal | **No**—sound fixture includes one old-method path and one standard gate |
| standards eventually universal | never; catalogue-defined; every technology universal | **PRELIMINARY RECOMMENDATION:** catalogue-defined public standards eventually universal for specified use, never for every optional innovation | prevents permanent denial and makes wait a valid route; can create explicit conversion need | milestone policy and per-use compatibility | **No**—fixture pins synchronized sound as universal for one defined use |
| forecast precision | exact future date; bounded window; hidden | **PRELIMINARY RECOMMENDATION:** bounded visible window with source/confidence | planning without deterministic metagaming or surprise penalties | timeline projection | **No** |
| licensing source | no licensing; governed industry rights source; bilateral studio rights | **PRELIMINARY RECOMMENDATION:** no P13A route; if the Owner later wants it, begin with a governed industry source before bilateral negotiation | avoids pretending a seller, rights inventory, or price exists | new technology-rights charter plus P11/P12; no talent-offer reuse | **No**—deferred |
| Laboratory and Scientist substrate | approve a P13-enabling minimal Laboratory blueprint + stable Scientist person/provider; use an aggregate staffing provider; wait for a future P09/P10 package | **PRELIMINARY RECOMMENDATION:** authorize the minimal concrete Laboratory blueprint/identity through P09's facility law and a stable P10-compatible Scientist identity/provider, with P13 owning only assignments/work orders. Reject aggregate staffing as an unblocking P13A substitute because it cannot prove the prescribed named Scientist, exact opportunity cost, and Laboratory world causality. | preserves world causality and exact credit without inventing upstream facts; waiting postpones the checkpoint honestly | Owner ruling, refreshed P09/P10 interfaces, P12 employer reference, P11 consequence boundary | **Yes**—the complete P13A checkpoint cannot start until the concrete substrate is explicit |
| Scientist opportunity cost | dedicated research-only role; shared staff role; aggregate provider | **PRELIMINARY RECOMMENDATION:** stable person assigned persistently to Laboratory work, without daily needs or routine reassignment; aggregate provider is outside P13A | visible opportunity cost and career credit; depends on the concrete substrate decision above | P10 person/employer, P09 facility, P13 reservation | **Yes** until exact concrete references can be supplied |

### 23a. Owner direction recorded and remaining numeric choices — 2026-09-10

The §23 table stays as history. The rows below record what the Owner's 2026-09-10 direction settled and what remains for Current Ops' activation review. "Blocks P13A?" keeps its original meaning.

| Decision | Direction recorded (OWNER-SELECTED) | Still open (label) | Blocks P13A? |
|---|---|---|---|
| transition dates | bounded early-research windows plus fixed commercial-release milestones | exact windows, dates, curves, acceleration limits (NUMERICAL/CONTENT HYPOTHESIS) | No; P13A pins one fixture |
| research versus licensing | research, wait-then-purchase; supplier commercialization desired later | rates, term, exclusivity, placement (LATER COMMERCIALIZATION SCOPE) | No |
| can technology be skipped? | direct purchase without obsolete equipment; knowledge prerequisites remain | conversion descriptors per family (NUMERICAL/CONTENT HYPOTHESIS) | No |
| forecast precision | window far out, concrete public date near release | disclosure horizon (NUMERICAL/CONTENT HYPOTHESIS) | No |
| Laboratory and Scientist substrate | unchanged: minimal P09 laboratory blueprint and stable P10 Scientist identity, now with seat capacity | as before | **Yes** |
| research staffing and budget | named researchers to capacity; per-project ceiling; diminishing concentration returns | base output, tiers, saturation, c(n) (NUMERICAL/CONTENT HYPOTHESIS) | No; P13A may use one person and a fixture ceiling |
| retained work and cancellation | 7A research; 10B installation | refundable components, restoration basis, restart credit (NUMERICAL/CONTENT HYPOTHESIS) | No |
| queues | persistent plans with dependencies and admission policy | default admission policy (IMPLEMENTATION RECOMMENDATION) | No |
| film lock | first actual filming | accepted production seam (POST-P12 VERIFICATION REQUIRED) | No; needed by P13A.2's compatibility decision |
| inventor pricing | decomposed concession on own-developed technology | concession rates, eligible components, transfer cases (NUMERICAL/CONTENT HYPOTHESIS) | No |

---

## 24. Open questions

1. **OPEN QUESTION:** what exact final P12 studio/adoption policy interface exists after upstream
   implementation and Owner acceptance?
2. **OPEN QUESTION:** which P09 facility type/body/condition symbols survive P05/P06 and later work?
3. **OPEN QUESTION:** does P11 approve dedicated research/adoption ledger categories or a more
   general project-cost correlation?
4. **OPEN QUESTION:** what minimum public evidence exposes rival adoption without omniscience?
5. **OPEN QUESTION:** which sound-era capability best touches the final P05/P06 production path
   without editing unaccepted seams?
6. **OPEN QUESTION:** should Scientist work create a P10 career credit in P13A or only retain an
   assignment/event reference for later interpretation?
7. **OPEN QUESTION:** what catalogue authoring format best supports lint, localization, and aliases
   without becoming runtime code?
8. **OPEN QUESTION:** should multiple Laboratories increase parallelism, reliability, or only
   capacity, subject to P09 lot and P11 cost law? *(Amended 2026-09-10: answered in direction by §12.6,
   cooperation with diminishing returns and parallel projects; the concentration factor stays a tuning choice.)*
9. **OPEN QUESTION:** what public-standard grace period preserves in-flight production honesty?
10. **OPEN QUESTION:** which optional technology families, if any, may become obsolete without a
    successor capability?

None authorizes an assumption. Questions touching P13A become reconnaissance gates; the rest can
remain parked.

---

## 25. Explicit deferrals

P13 explicitly defers:

- the full 1920–2040 technology catalogue and final dates;
- a general alternate-history event-authoring engine;
- patents, espionage, sabotage, standards lobbying, and technology theft; supplier-commercialization
  royalties are desired later scope under §16a.4, not P13A *(Amended 2026-09-10)*;
- bilateral licensing negotiations and talent-agent dealmaking;
- private rival technology trees;
- physical rival Laboratories/lots;
- detailed costume wardrobe, prop inventory, and effect-authoring tools;
- a generic research-point economy or scientist-needs simulation;
- P14 relationships, contracts, poaching, aging, retirement, and career lifecycle;
- P15 genre demand, release overlap, Power Ranking, distress, closure, corporate ownership,
  acquisition, co-production, and legacy interpretation;
- acquisition/merger/library transactions, which are P16+ candidates and not original parity;
- post-2040 technology generation or Endless Mode without Owner decision.

---

## 26. Bounded first implementation checkpoint

### P13A — Synchronized Sound: One Shared Transition

**PRELIMINARY RECOMMENDATION — split the starting proposal into three sealed slices.** Before any
slice, **P13A.0 is an authorization gate, not an implementation wave:** the Owner must choose the
Laboratory/Scientist substrate in Section 23. The report recommends one minimal concrete Laboratory
blueprint/identity and one stable Scientist person/provider, but does not claim P09/P10 already supply
them.

**P13A.1 — Headless shared-transition core** proves one `synchronized-sound` catalogue entry, one
deterministic availability/public-standard fixture, research and wait, persistent research work,
one resumable `AdoptionWorkOrder`, automatic completion/reservation release, one deterministic rival
decision under the same law, save/load, honest migration, replay, and a 6,240-week run. Authorized
foreign facility/person/provider IDs may be fixture references; there is no license route.

**P13A.2 — Upstream consequence integration** binds the sealed core to the approved P09 Laboratory,
P10-compatible Scientist/provider, P11 quote/commit boundary, P12 studio/rival roots, one production
compatibility decision, and one soundstage/facility operational consequence. It reruns the full
endurance proof and may not widen the catalogue.

**P13A.3 — Bounded read side and world route** adds one closed snapshot/page contract, exact world
entry, retained workspace, Laboratory/soundstage expression, mouse/keyboard/controller/large-text
proof, and browser/Unity semantic parity. It adds no simulation outcome law.

P13A excludes licensing, the full tree, arbitrary catalogue authoring UI, multiple technologies,
multiple Laboratories, patents, technology ranking, broad balance, an alternate-history engine,
full-era art change, and any P14/P15 feature. *(Amended 2026-09-10: these exclusions bound the checkpoint,
not the experience; §2A.2 sequences the excluded capabilities after P13A, and the checkpoint may pin one
researcher and a fixture budget ceiling without proving staffing, cooperation, parallel projects or queues.)*

### Stop line

Each slice stops and receives technical/Owner disposition before the next. P13A stops after research
and wait reach truthful outcomes, one rival consequence is visible, sound gates one exact production
decision, the world reflects operational adoption, and all three slice-specific proof pyramids pass.
It does not continue “because the catalogue seam now exists.”

---

## 27. Golden journeys

The following are future acceptance candidates, not current implemented behavior.

1. **Forecast from the world.** In 1928, a timeline cue appears; the player opens it and reads a
   bounded synchronized-sound window, affected capabilities, and no exact hidden roll.
2. **Laboratory-first entry.** The player selects the Laboratory directly and reaches the same
   sound decision without opening the timeline first.
3. **Research route.** A named eligible Scientist and operational Laboratory produce an exact cost,
   expected completion range, opportunity cost, and enabled `Begin research` action.
4. **Persistent assignment.** The player advances several weeks; the same Scientist remains
   assigned and progress continues without manual shuffling.
5. **Research pause.** The Laboratory becomes unavailable; the world body and workspace both say
   research is paused, identify the facility, and name the remedy.
6. **Research resume.** Restoring the Laboratory resumes the same `researchProjectId` without lost
   identity or duplicate cost.
7. **Automatic research completion.** The exact research threshold is reached; TypeScript moves the
   studio to `readyToAdopt`, credits the work once, and releases the Scientist/Laboratory reservation
   without a claim click.
8. **Cancel and restart.** The player cancels one research/adoption work order, sees the catalogue's
   disclosed retained-work/cost disposition, and cannot duplicate a reservation, debit, or event by
   retrying the same intent.
9. **Wait route.** The player chooses wait, sees what remains usable, what future standard matters,
   and the bounded expected access window.
10. **Wait matures.** Public diffusion makes sound adoptable; no fictional earlier research credit
    or Scientist attribution appears.
11. **Old method persists.** Before standardization, the player can make a silent film with the
    existing path and receives no hidden era penalty.
12. **Compatibility gate.** A sound production without operational equipment is blocked with exact
    capability/facility remedy, not a generic “era mismatch.”
13. **Operational adoption.** Conversion completes; the exact soundstage/post provider changes
    visual state and the previously blocked production becomes legal.
14. **Rival adopts first.** A rival with sufficient cause becomes operational first; its public film
    can truthfully advertise sound while the player's cannot.
15. **Rival cannot cheat.** A rival lacking the required resource/capacity waits; no sound film is
    spawned despite challenge pressure.
16. **Public standard arrives.** Every studio receives one standard event; incompatible new work
    has explicit conversion or old-format disposition.
17. **In-flight grace.** A pre-standard silent production follows the catalogue's named grace rule;
    it is not retroactively corrupted.
18. **Save mid-research.** Save/load preserves assignment, accumulated work, predicted range,
    blockers, RNG, and IDs byte-stably.
19. **Legacy save.** A V15 save loaded after P13 has explicit legacy initialization and no invented
    1920s research, rivalry, or award record.
20. **Catalogue rename.** A display-name/localization change preserves the same technology,
    adoption, history links, and replay outcome.
21. **Catalogue alias.** A retired catalogue ID maps through an explicit alias; unknown IDs fail
    visibly rather than becoming synchronized sound.
22. **Prerequisite refusal.** A malformed or unmet prerequisite yields an exact authoring/load or
    player refusal; the project never starts partially.
23. **Notification deduplication.** One breakthrough produces one primary notice even though the
    timeline, Laboratory, and soundstage all update.
24. **Keyboard path.** From lot focus, keyboard users open Laboratory, compare routes, confirm, go
    Back, and Locate without pointer-only information.
25. **Controller path.** Controller users traverse the same comparison and refusal copy with stable
    focus and no accidental time advance.
26. **Reduced-motion path.** A breakthrough uses static cues while preserving identical state and
    acknowledgement.
27. **Rival public knowledge.** The player sees a rival's announced operational adoption and typed
    public reason, but not hidden research progress or policy weights.
28. **Paged history.** The player pages technology history by an append-stable
    `(effectiveWeek, phaseOrdinal, 'P13', p13DomainSequence, eventId)` cursor bound to
    `asOfP13DomainSequence`; later appends do not
    duplicate, invalidate, or reshuffle already-seen rows.
29. **Late entrant after standards.** A studio entering after several standards receives one exact
    entry-week baseline and no retroactive project, expense, pioneer credit, or pre-entry history;
    duplicate activation returns the same receipt.
30. **Dormancy during adoption.** The transition commits only with a complete P13 work-disposition
    receipt inside the all-owner candidate; injected failure leaves provider reservations, P11 facts,
    P13 work, and P12 operating state unchanged.
31. **6,240-week run.** The same seed and intents reproduce milestones/adoptions, stay within budgets,
    retain unique identities, and never perform a quadratic history scan.
32. **Migration round trip.** Export/import/export of migrated state preserves explicit absence,
    exact IDs, catalogue version, and canonical order.
33. **Mouse path.** Pointer users select the exact Laboratory/world cue, inspect every blocker and
    route consequence without hover-only truth, confirm once, Back, and Locate without identity drift.
34. **Large-text path.** At the accepted largest text scale and narrow viewport, route comparisons
    stack into labeled fields, focus order remains logical, and no cost, blocker, consequence, or
    standard date is clipped.
35. **Adoption finance revalidation.** An adoption quote is visible, cash/obligation truth changes
    before commit, and the transaction refuses atomically through P11 without partial work, debit,
    reservation, or capability grant.
36. **Same-week standard.** Public standardization and research completion are due in one week;
    milestone-first ordering is stable across catalogue reordering and cannot award a false early-first.
37. **Phase-catalogue upgrade.** After a page cursor is issued, the scheduler adds a phase under a new
    compatible catalogue version; old same-week event order/cursor continuation remains identical,
    recorded phase facts remain immutable, and legacy unknown-phase rows gain no invented causality.

Journeys 38–47 follow the 2026-09-10 Owner direction (§2A) and remain future acceptance candidates.

38. **Early research inside the window.** Before commercial release, a studio holding the prerequisites
    begins research; a studio lacking one reads the exact missing prerequisite and cannot buy its way past.
39. **Budget ceiling.** The player raises a project's weekly ceiling and reads the marginal benefit, the
    charged usable spend and the bottleneck; a ceiling above saturation leaves the remainder in cash.
40. **Staff to capacity.** Named researchers fill a laboratory's seats; payroll continues; the next
    assignment is refused with the seat count and a remedy.
41. **Cooperate or split.** Two laboratories join one project and finish sooner than one but slower than
    twice; split across two technologies they finish both at the single-laboratory rate.
42. **Cancel, keep, restart.** Research is cancelled; the receipt shows retained work and spent money;
    a restart seeds it once; a duplicate restart returns the same project.
43. **Inventor quote.** The inventor reads a decomposed quote with concessions and net benefit; before
    release it reads in-house terms with no invented retail price; a rival inventor reads the same.
44. **Direct purchase and gap-aware conversion.** At commercial release a studio buys the current version
    without an obsolete intermediate; the older stage's quote shows longer work from its descriptor, a
    staged alternative, build another and wait, and any known upcoming replacement.
45. **Queue after the film.** A conversion is queued behind a shooting film with a price ceiling and an
    admission policy; it waits with its reason, revalidates on wrap and commits inside the ceiling or pauses
    for review; an independent purchase proceeds meanwhile.
46. **Cancel an installation under option B.** The player reads completed-work, restoration and refund rows
    and the resulting usable state before confirming; the disposition applies atomically.
47. **Lock at first filming.** A production not yet filming rechecks plan, cost, availability and dates and
    adopts installed sound; a production already filming keeps its loadout with no retroactive change.

---

## 28. Proof pyramid

| Layer | Required proof | Cannot substitute for |
|---|---|---|
| L0 catalogue lint | unique IDs, acyclic/reachable prerequisites, valid capabilities, valid aliases, stable ordering | simulation proof |
| L1 pure-law unit | state transitions, route legality, completion, standardization, compatibility, reason copy | integrated tick |
| L2 property/invariant | no duplicate IDs, no impossible capability, no hidden RNG, player/rival symmetry | save/migration |
| L3 save/migration | V15 honest initialization, mid-work round trip, unknown-ID refusal, canonical export | runtime/world proof |
| L4 deterministic integration | player/rival route outcomes, economy/facility/production consequence, replay digest | visual proof |
| L5 endurance | 6,240 weeks, storage/time curves, paging, bounded summaries, migration duration | usability |
| L6 bridge contract | closed DTOs, exact IDs, schema version, stale-intent refusal, no Unity formula | HID |
| L7 visual oracle | Laboratory/soundstage states, lot dominance, legible blocker/completion at target viewports | input |
| L8 real HID | mouse, keyboard, controller, focus, Back, Locate, disabled/enabled actions | Owner acceptance |
| L9 Owner journey | Owner performs named P13A routes and rules KEEP/REVISE/REJECT | any automated result |

Every artifact binds exact commits, schema/projection/save versions, seed, fixture, command, hashes,
and clean worktrees. Technical `PASS` is not Owner acceptance.

---

## 29. Hostile-review questions

1. Did P13 widen frozen `EraConfig` or reinterpret a V1–V15 byte?
2. Is there truly one catalogue, or did a rival path clone it under a different name?
3. Can any technology be summarized only as `+quality`?
4. Does licensing appear anywhere as original parity?
5. Can a player or rival use sound without operational adoption and required providers?
6. Do earlier methods disappear without an explicit compatibility transition?
7. Is the era transition a shared public event or an individual studio level-up?
8. Does any route consume hidden RNG in preview, UI, or page order?
9. Can catalogue reorder, localization, or rename change saved identity?
10. Does an old save acquire fabricated research dates, credits, awards, or rival history?
11. Does the Laboratory matter mechanically and visibly, or is it decorative cover for a menu?
12. Must the player routinely reassign Scientists or click completed work?
13. Are costs attributed through P11 truth, or through a shadow research wallet?
14. Did P13 duplicate P09 facility state, P10 people, P08 Standing/history, or P12 rivals?
15. Can Unity calculate completion, availability, capability, ranking, or refusal text?
16. Does a routine weekly tick scan all catalogue/history rows?
17. Can any view hash or project the full century on each refresh?
18. Does P13A secretly include full catalogue, dynamic licensing, or alternate history?
19. Are Owner decisions visibly unresolved where required?
20. Is any P14/P15/P16+ feature smuggled into the checkpoint?

21. Can cash create research work without eligible people, seats or prerequisites, or is unusable
    spend ever charged?
22. Can retained work be seeded twice, moved across technologies or studios, or lost by a staff transfer?
23. Does any purchase route require obsolete intermediate equipment, or any inventor quote go negative
    or omit a real site/installation cost?
24. Can a plan hire, substitute, commit outside its authority, or promise a start date while open-ended
    holds remain?
25. Can a production's loadout change after first filming, or can commercial availability equip
    uninstalled hardware?
26. Does the P13 core contain a supplier simulation, a self-purchase royalty, or a capability monopoly?

Any “yes” to 1–18, 21–26 or hidden scope in 20 is a stop condition until corrected.

---

## 30. Builder handoff

The companion Builder Annex supplies terminology, transitions, non-code interface sketches,
projection shapes, identities, persistence, migration, seams, ownership, waves, fixtures, endurance,
world/UI anatomy, input, refusal language, anti-facade assertions, hostile review, stop/rollback, and
the first-checkpoint report format.

The eventual lead must begin with post-upstream reconnaissance. It must resolve exact P09/P10/P11/
P12 roots, the final P05/P06 changed paths, generated contract versions, save head, facility/world
body registry, and projection builders. Proposed names in the Annex are semantic guidance, not
permission to create those symbols.

**No implementation should begin from this report alone.** Required entry sequence is Owner boundary
approval → upstream acceptance → changed-path refresh → implementation charter → explicit Owner
authorization → isolated worktrees.

---

## 31. POST-UPSTREAM OWNER-ACCEPTED REFRESH REQUIRED

This section is binding.

After P05 and P06 are Owner-accepted—and after P09/P10/P11/P12 implementation authority exists—the
future P13 lead must re-audit only the accepted changed paths and their direct dependencies, then
replace every provisional seam with exact symbols and versions. The refresh must record:

- final TypeScript and Unity branches/SHAs and clean state;
- final save, schema, protocol, projection, generated-consumer and manifest identities;
- final `GameState` roots, studio/person/facility IDs, tick/calendar, ledger and history APIs;
- final P05 production capability/compatibility and P06 post/release seams;
- final P12 rival/studio identity and conserved-resource seams;
- collisions, migration starting version, changed-path ownership and proof commands;
- whether P13A still fits without widening its boundary;
- **POST-P12 VERIFICATION REQUIRED (2026-09-10):** the production lifecycle's first-filming
  transition for the §12.9 lock; the authorized employment action for researchers; P12 conserved-resource seams
  that fund rival research ceilings; P11 quote/commit symbols and refundable-commitment dispositions for §12.8
  and §16a; and the migration starting version, which must come from the accepted save head rather than the
  V15 envelope this report's historical baseline pins.

If any upstream package changes the premise, revise this candidate and return it to the Owner. Do
not fill unknowns with current P05 WIP, P06 provisional names, recalled architecture, or literal
`main`. This report remains **DECISION-READY RESEARCH CANDIDATE**, **DOCUMENTATION ONLY**, and
**NO PRODUCTION AUTHORIZATION** until that refresh and a separate Owner authorization occur.
