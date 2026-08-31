# Project: Studio — P13–P15 Long-Range Roadmap

**Status:** DECISION-READY RESEARCH CANDIDATE

**Mode:** DOCUMENTATION ONLY

**Authorization:** NO PRODUCTION AUTHORIZATION

**Research date:** 2026-08-30

**Campaign horizon:** 1920–2040, approximately 6,240 weekly ticks

**Implementation state:** NOT STARTED

This roadmap defines the recommended sequence and ownership boundaries for Packages 13, 14, and 15. It does not approve any package for implementation, change a schema, alter a DTO, authorize Unity work, or resolve an Owner decision by implication.

---

## 1. Executive ruling

The provisional sequence is coherent only after one material scope correction.

| Package | Recommended final name | Core fantasy | Boundary ruling |
|---|---|---|---|
| P13 | **Eras, Technology & Studio Innovation** | Build a studio that can see, pursue, adopt, and physically express cinema's changing capabilities while every rival inhabits the same historical world. | One global catalogue and industry timeline; per-studio adoption. Technology changes capabilities and compatibility, never a generic score. |
| P14 | **Talent Market, Relationships & Career Lifecycle** | Build careers and creative partnerships in a shared labor market where offers, trust, work, aging, and retirement leave durable evidence. | Extend P10's immutable person/contract/career spine. Split into market, relationship, and lifecycle slices. |
| P15 | **Corporate Hollywood, Shared Market & Studio Legacy** | Compete for one audience, survive an evolving studio ecosystem, and reach 2040 with an evidence-backed account of what this studio became. | Keep shared market, bounded corporate fate, and finale as governed slices. Move acquisitions, mergers, co-productions, and ownership transactions to P16+. |

**PRELIMINARY RECOMMENDATION:** retain the order P13 → P14 → P15. Over the core scheduler's absolute
week, P13 creates shared era/timeline/milestone interpretation and technology truth that influence
production and later comparative history. P14 then makes people genuinely portable between the
studios P12 establishes. P15 can finally simulate a shared market and interpret the resulting complete
history without inventing rivals, careers, technology, awards, or finance after the fact.

**OWNER DECISION REQUIRED:** approve or revise these names, boundaries, and the P16+ deferral before any implementation charter is prepared.

---

## 2. Exact research authority

### 2.1 Current accepted repositories

| Authority | Branch | Commit | Use in this roadmap |
|---|---|---|---|
| TypeScript campaign | `campaign/living-lot-ts` | `7811377cea1c1b9ddca2c17c626879504b23ed4e` | Current accepted implementation authority and base of this documentation branch. |
| Unity campaign | `campaign/living-lot-client` | `29aea89a706a7f0961f5a460afc5bdb4d38d8395` | Read-only accepted client authority. No Unity work was opened, run, or changed for this package. |
| Documentation branch | `codex/p13-p15-long-range-research-01` | based initially on `7811377cea1c1b9ddca2c17c626879504b23ed4e` | Exactly seven Markdown outputs only. |

Literal `main` is not current implementation authority.

### 2.2 Package and campaign authorities read

| Authority | Branch | Commit | Exact paths |
|---|---|---|---|
| P07 Reception / Box Office | `codex/reception-boxoffice-research-07` | `da0312180730bf860b253fdfa6874ef749fd88d9` | `docs/design/CODEX-RECEPTION-BOXOFFICE-PACKAGE-07.md`; `docs/design/CODEX-RECEPTION-BOXOFFICE-PACKAGE-07-BUILDER-ANNEX.md` |
| P08 Awards / Standing / History | `codex/awards-standing-research-08` | `438708c5071097d8e1ddb2f97a3f7b6674b2a65e` | `docs/design/CODEX-AWARDS-STANDING-PACKAGE-08.md`; `docs/design/CODEX-AWARDS-STANDING-PACKAGE-08-BUILDER-ANNEX.md` |
| P09 Studio Growth / Construction | `codex/studio-growth-construction-research-09` | `91ed234cbf6cdc22817b792564dda22a1d7c3576` | `docs/design/CODEX-STUDIO-GROWTH-CONSTRUCTION-PACKAGE-09.md`; `docs/design/CODEX-STUDIO-GROWTH-CONSTRUCTION-PACKAGE-09-BUILDER-ANNEX.md` |
| P10 Stars / Careers / Staff | `codex/stars-careers-staff-research-10` | `6a5d41ec233152ecbe8cc3bfc960c31514b6cded` | `docs/design/CODEX-STARS-CAREERS-STAFF-PACKAGE-10.md`; `docs/design/CODEX-STARS-CAREERS-STAFF-PACKAGE-10-BUILDER-ANNEX.md` |
| P11 Finance / Executive UX | `codex/finance-executive-ux-research-11` | `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | `docs/design/CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11.md`; `docs/design/CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11-BUILDER-ANNEX.md` |
| P12 Rival Studios / Hollywood Ecosystem | `codex/rival-studios-hollywood-ecosystem-research-12` | `a0739055c30f80fcf756340d0e0e962865aec6a4` | `docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md`; `docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12-BUILDER-ANNEX.md` |
| P04 lessons | `campaign/living-lot-ts` | `7811377cea1c1b9ddca2c17c626879504b23ed4e` | `docs/engineering/P04-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md` |
| Campaign ledger | `campaign/living-lot-ts` | `7811377cea1c1b9ddca2c17c626879504b23ed4e` | `docs/campaigns/LIVING-LOT.md` |
| P05 final charter | `codex/p05a-final-refresh-01` | `b1d506df9ff9c5981f5acc6990daf8a056739901` | `docs/engineering/CODEX-P05A-IMPLEMENTATION-CHARTER.md`; `docs/engineering/CODEX-P05A-IMPLEMENTATION-RECONNAISSANCE.md` |
| P06 provisional launch | `codex/p06a-launch-package-01` | `c74cf79037fe9712247898c340834d0379c8b04c` | `docs/engineering/CODEX-P06A-PROVISIONAL-IMPLEMENTATION-CHARTER.md`; `docs/engineering/CODEX-P06A-IMPLEMENTATION-RECONNAISSANCE.md` |
| Visual Direction Package | `docs/visual-direction-package-01` | `728781dcfdcf32a13d3d3978cdc333b8c9a5e8a7` | `docs/design/PROJECT-STUDIO-VISUAL-DIRECTION-PACKAGE-01.md`; `docs/design/PROJECT-STUDIO-VISUAL-DIRECTION-PACKAGE-01-BUILDER-ANNEX.md` |
| Long-horizon laws | present at P12 governance commit | `a0739055c30f80fcf756340d0e0e962865aec6a4` | `docs/HOLLYWOOD-ECOSYSTEM-FUTURE-PROOFING.md`; `docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md` |

**PROJECT AUTHORITY VERIFIED:** earlier package product laws remain binding even where their code reconnaissance used an older campaign snapshot.

**POST-UPSTREAM OWNER-ACCEPTED REFRESH REQUIRED:** no future builder may treat a path in these documents as final until P05 and P06 are Owner-accepted and the changed-path audit is rerun.

### 2.3 P05 forward evidence boundary

The active P05 TypeScript branch is mutable. During this research it was observed advancing on `wip/p05a-production-shooting-01-ts`; it is **UNSEALED FORWARD EVIDENCE**, not design or implementation authority. Its moving tip must not be frozen into P13–P15 reconnaissance. The accepted P05 charter at `b1d506d...` supplies boundaries; the accepted campaign at `7811377...` supplies current code truth.

### 2.4 Original-game sources

**SOURCE VERIFIED:** primary reconstruction uses the [official PC manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040), [official *Stunts & Effects* manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/7910/manuals/The_Movies_Stunts_Effects_Manual.pdf?t=1447351041), and the developer-reviewed [Prima Official eGuide](https://archive.org/details/The_Movies_Prima_Official_eGuide) with its [full OCR](https://archive.org/stream/The_Movies_Prima_Official_eGuide/The_Movies_Prima_Official_eGuide_djvu.txt). The contemporary [GameSpot retail walkthrough](https://www.gamespot.com/articles/the-movies-walkthrough/1100-6140049/) is corroboration. Pre-release coverage is explicitly separated from shipped evidence.

The local reconstructed corpus is outside Git and therefore has no project branch/commit authority. Its hashes and exact paths are recorded in each package report. Modified artifacts may expose data shapes but do not establish vanilla values.

### 2.5 Evidence notation

The seven reports use only these evidence labels:

- `SOURCE VERIFIED`
- `PROJECT AUTHORITY VERIFIED`
- `CURRENT CODE VERIFIED`
- `COMPARATOR OBSERVED`
- `OPEN-SOURCE PATTERN`
- `INFERENCE`
- `PRELIMINARY RECOMMENDATION`
- `OWNER DECISION REQUIRED`
- `OPEN QUESTION`
- `REFUTED`

Recommendation is not parity. Comparator observation is not product law. A deferred possibility is not approved scope.

---

## 3. Why this sequence is correct

### 3.1 P13 first: establish one shared industry timeline over the core clock

P12 assigns the global technology catalogue/tree and era truth to P13. Without that authority, P14 cannot safely reason about profession demand, career opportunity, or capability obsolescence across 120 years, and P15 cannot interpret innovation or period-specific market change.

**SOURCE VERIFIED:** original-game research granted the player access before a later natural unlock and could create a rival-relative lead. The inspected sources do not prove a persisted shared catalogue for every rival. **INFERENCE:** one catalogue with studio-relative adoption is the smallest symmetric successor architecture consistent with that evidence. **PRELIMINARY RECOMMENDATION:** reject routine Scientist reassignment because the clerical-grind judgment is an inference, not an original-game parity claim.

### 3.2 P14 second: make people portable before the market judges studios

P10 already owns person identity, profile, current contract, perceived professional data, and credited-work career history. P12 supplies the rival employers. P14 can therefore add contested offers, relationships, and life phases without inventing a second roster or placing employer-relative facts on the person definition.

P15 must not simulate corporate movement or legacy while employer transitions erase people. P12 owns the transition and interval facts; P14 proves that its chooser references those transitions without changing `PersonId`, and adds retirement/alumni preservation before P15 interprets careers.

### 3.3 P15 third: compare completed participants and interpret actual history

Shared-market pressure only becomes fair when player and rivals release through conserved projects under the same law. A credible finale only becomes possible after releases, awards, careers, finance, rivals, technology, and market outcomes are all durable.

P15 therefore consumes earlier truth. It does not recreate it under a new “legacy” label.

---

## 4. Cross-package dependency graph

```text
P07 release / run / film economics ───────────────────────────────┐
P08 Standing / awards / history ────────────────────────────────┐ │
P09 facilities / construction ───────┐                          │ │
P10 person / profile / contract / career ──► P14 ──────────────┤ │
P11 cash / ledger / obligations ─────┬─────► P13               │ │
                                     ├─────► P14               │ │
P12 rivals / StudioId / projects ────┼─────► P13 ───────┐      │ │
                                     └─────► P14 ───────┼──────┴─┼──► P15
P13 era / catalogue / adoption ─────────────────────────┘        │
P14 market / relationship / lifecycle ───────────────────────────┘

P15C 2040 interpretation consumes all durable facts above.
No arrow authorizes the downstream package to duplicate its source.
```

### 4.1 Authority-preservation matrix

| Package | CONSUMES | OWNS | PRODUCES | MUST NOT DUPLICATE | HANDOFF |
|---|---|---|---|---|---|
| P13 | P09 facilities; P10 staff identity; P11 finance grammar; P12 studios; core scheduler global week/phase | industry era/timeline/milestone interpretation, technology catalogue, public-standard/disposition state, per-studio research/wait/adoption and resumable work orders | capability availability, adoption events, compatibility/cost consequences, public innovation milestones | core clock/phase catalogue; `EraConfig`; construction law; people profiles; finance calculations; rival projects; technology-rights law | technology/capability facts to P14; innovation and standard history to P15; licensing only to a later Owner-authorized P13L/P16+ slice |
| P14 | core scheduler absolute week/phase; P10 person/profile/contract/career; P11 quotes/obligations; P12 employer/exclusivity/interval/studio/rival truth; P13 era/timeline/capabilities | competitive cases/proposals, intermediary/knowledge state, chooser receipts/orchestration, typed promises/trust, sparse relationship graph, life phase/retirement/alumni | decision events referencing one P10 contract and P12 employer transition, collaboration evidence, retired-but-preserved identities | core global week; P10 terms/profile/development; P12 current employer/index/intervals/transitions; rival studio identity; finance ledger; P13 era/milestones | portable decision/relationship/lifecycle facts plus P12 employer references and alumni truth to P15 |
| P15 | P07 release/result boundary; P08 awards/Standing/history; P10/P14 people; P11 finance; P12 studio registry/projects/releases/disclosure/roster/employer/exclusivity/interval/operating-state receipts; P13 innovation | if re-homing is approved: P12C-derived exposure/batch/assessment law, P12D-derived comparative snapshots, P12E-derived corporate-condition/remedy assessment, participant-manifest orchestration, and entrant/registry-transition requests; 2040 legacy projection | atomic symmetric market assessments, typed rank reasons, condition/eligibility/request events and complete owner receipt manifests if approved, multi-archetype finale | P12 registry, `StudioId` minting, active/dormant/closed state, roster/employer/exclusivity/interval truth, entrant initialization and canonical entry/closure events; release schedules/disclosure/economics; awards; Standing; career truth; ledger; rival pipeline; technology; ownership transactions | 2040 finale; P16+ ownership events/transactions only if later authorized |

---

## 5. Overlap audit with P08, P10, P11, and P12

### 5.1 P08 remains awards, Standing, and history authority

P08 owns Audience Awareness, Industry Prestige, Commercial Confidence, award outcomes, honors, and history lenses. P15's Power Ranking is periodic comparative momentum. P15C's Legacy is a derived interpretation. Neither is a fourth Standing channel, a rewritten awards system, or a duplicate history store.

Historical gaps remain “Not recorded.” P15 may never manufacture old nominees, winners, innovation events, rival releases, or founder events to make a finale look complete.

### 5.2 P10 remains people and credited-career authority

P14 extends the same stable `Talent.id`/future `PersonId`; it does not remint people on employer change. Current contracts and released-film career events remain P10 facts. P12 owns employer identity, indexes, intervals, transitions, migration anchors, and the employer-history recording boundary. P14 adds dated proposal/chooser, relationship, and lifecycle facts and references P12 employer facts. Hidden ceilings, actual skill truth, RNG keys, and exact potential remain outside Unity projections.

### 5.3 P11 remains finance authority

Research facilities, licenses, agency fees, compensation, distress, and ownership consequences must post through P11 vocabulary and TypeScript calculations. Cash is literal. Known obligations remain beside Cash, not secretly subtracted. Negative cash is currently recoverable and does not mean bankruptcy.

P15B cannot infer debt, valuation, insolvency, or an acquisition price from the present ledger. P11's incomplete runway selectors cannot become distress authority without an accepted behavior-neutral read-model repair.

### 5.4 P12 remains rival and studio identity authority

P12 establishes a Level-2 conserved rival business simulation, immutable `StudioId`, and the sole durable active/dormant/closed registry, not physical rival lots. P13 attaches adoption to those studios. P14 attaches competitive cases/decision receipts and references P12 employer history. P15 attaches market outcomes plus condition/remedy assessments and idempotent registry-transition requests; only P12 commits operating-state, entry, or closure events. None creates another studio registry.

The Owner's present spine explicitly proposes **P12B live labor market → P14A**, **P12C shared
market → P15A**, **P12D Power Ranking → P15A.2**, and **P12E corporate continuity → P15B**. This is
package-placement re-homing, not silent duplication. P12A remains authoritative for StudioId,
employer/exclusivity/intervals, rival agency, conserved projects/releases, scheduling, and public
disclosure. Within the re-homed P12B surface, P14 owns cases/proposals/chooser receipts only. Within
the re-homed P12C/D/E surfaces, P15 owns exposures/assessments/rank and condition/eligibility/
orchestration facts only. Each re-homing requires the Owner's boundary approval; rejection returns that deferred slice to
P12 follow-up.

The physical-rival-lot temptation remains rejected until player value is proven.

---

## 6. Package boundaries and internal slices

### 6.1 P13 boundary

P13 begins when a global industry capability becomes knowable or available. It ends when every studio's relationship to that capability—unknown, visible, researching, waiting, ready, adopting, operational, standardized/disposed, superseded—is deterministic, persistent, economically legible, and visible in production or the lot. Licensing is a separately Owner-gated successor route outside P13A, not an assumed state.

P13 does not own careers, bidding, shared audience demand, corporate transactions, awards, or the finale.

### 6.2 P14 boundary

P14 begins when a stable person participates in a contested labor market or acquires a durable relationship/lifecycle fact. It ends when the same identity can move between employers, form work-derived relationships, age, retire, and remain historically queryable.

Recommended slices:

- **P14A.1/.2/.3 — Contested Talent Market:** expiry-only proposals and scheduled chooser transaction; then bounded read side; then world/client proposal route. P10/P12—not P14—own contract/employer mutation.
- **P14B — Collaboration, Promises & Trust:** typed promises, shared-work relationship evidence, mentorship and rivalry, no social click loop.
- **P14C — Career Lifecycle & Alumni:** birth/age derivation, life phase, P10-authored development context as a read-only input, entrants, and alumni preservation. Retirement settlement waits for clear obligations or atomically commits P14 outcome + P10 person/assignment/contract + P11 obligation-or-none + P12 roster/employer/exclusivity/interval receipts; P14 authors no development focus or progress.
- **P14D — Advanced Labor & Contract Mobility:** explicit P16+ parking label only, not P14 completion scope; possible in-term approaches, negotiated release, buyout/compensation, contract break, and tampering require a separate Owner charter and cannot enter P14B/C.

### 6.3 P15 boundary

P15 begins when multiple conserved studios compete through shared audience or corporate-state law. It ends at an evidence-backed 2040 interpretation.

Recommended slices:

- **P15A — Shared Market:** genre demand, saturation/decay, atomic same-week release batches, P12-known releases, and typed reasons; Power Ranking follows only after comparative history exists. Screens/exhibition are excluded and require separate research.
- **P15B — Corporate Fate:** if authorized, the same pre-terminal player/rival warning, distress and recovery gates, equivalent remedy capabilities, and later-entrant eligibility orchestration. P12 remains the sole active/dormant/closed registry and entrant initializer; accepted P12 law permits rival failure without mandatory player hard-bankruptcy, so exact rival closure and any player terminal ending are separate policy decisions.
- **P15C — Studio Legacy:** 2040 finale with multiple valid archetypes and direct provenance.

**PRELIMINARY RECOMMENDATION:** acquisitions, mergers, co-productions, labels/subsidiaries, library/IP ownership transfer, and valuation belong in P16+, not P15B.

---

## 7. 1920–2040 campaign timeline

This is a systems roadmap, not a claim that every date below is already product law.

| Period | Global world truth | Studio-relative truth | Durable record |
|---|---|---|---|
| 1920–1927 | Foundational silent-era capabilities; authored studios enter according to P12 policy. | Studios establish facilities, people, and production methods. | Founding, first contracts, first films; “not recorded” for migrated gaps. |
| 1928–1939 | Laboratory/research becomes historically relevant; sound and early production technologies enter availability windows. | Research or wait; adopt compatible methods and facilities. A license exists only if a later Owner-authorized technology-rights slice ships. | Catalogue version, availability, adoption path, first-use film/facility. |
| 1940–1959 | Capability catalogue broadens; global events may alter demand independently of adoption. | Studios differentiate through timing and production choices, not private eras. | Public standardization and studio firsts. |
| 1960–1979 | Expansion-era stunt/effects content may enter if product scope later approves it; later rival entrants remain P12/P15 policy. | Career specialties and technology-dependent roles can matter. | Entrant, adoption, collaboration, injury/readiness only if separately authorized. |
| 1980–1999 | Digital sound, effects, and CGI windows become candidate catalogue facts. | Old methods remain valid unless an explicit compatibility state changes. | Supersession, continued legacy-method use, innovation milestones. |
| 2000–2019 | Successor campaign continues beyond the original's reward horizon. | Mature labor and market systems create alternate studio trajectories. | Alumni, transfers, dormancy/recoveries and closure only if separately approved, periodic summaries. |
| 2020–2039 | Late-campaign innovation and market states remain data-driven; no special disconnected mini-game. | Player and rivals continue under symmetric laws. | Bounded pages and annual summaries; no whole-history weekly scans. |
| 2040 | Finale trigger at an exact governed week. | No forced single winner or blended score. | Several evidence-backed legacy archetypes, setbacks, recoveries, and unresolved gaps. |
| Post-2040 | **OWNER DECISION REQUIRED:** stop, epilogue-only browsing, or Endless Mode. | No continuation is assumed. | If approved, a one-time mode-transition event; no identity reset. |

Historical dates belong in a versioned catalogue with confidence/provenance. Alternate history changes studio adoption inside bounded windows; it does not pretend history happened on fabricated exact dates.

---

## 8. Additive GameState-root strategy

**PROJECT AUTHORITY VERIFIED:** `EraConfig` is a frozen leaf. P13 must not widen it. `Standing`, `Studio`, `Talent`, existing contract rows, released results, and prior save shapes retain their accepted ownership.

The future shape should remain conceptual until an implementation charter re-audits current code. The recommended additive roots are:

| Root concept | Earliest owner | Why it is additive |
|---|---|---|
| core `schedulerHistoryContract` catalogue reference + per-event phase facts + source-owner archive-order adapter contract | authoritative core scheduler/shared history contract, pre-P13 prerequisite | This is governed infrastructure, not an eighth product package or P13-owned clock. The catalogue remains external/versioned metadata; each new event persists its phase witness. The pre-P13 gate seals the adapter interface and honest-exclusion law, not every legacy domain index; an implemented owner adapter remains beside its source domain. No P13–P15 product root duplicates it. |
| `industryTimeline` | P13 | Era/public-milestone interpretation consumes the core scheduler's global week and cannot fit the frozen `EraConfig`; P13 does not own or replace absolute time. |
| `technologyCatalogueRef` plus content version | P13 | Definitions belong to governed data; saves record the version/compatibility witness, not cloned definitions. |
| `studioTechnology` keyed by `StudioId` + `TechnologyId` | P13 | Adoption is studio-relative and must not live on shared definitions. |
| `technologyPrograms` / adoption work orders | P13 | Active research/wait/adoption work has identity, provider references, blockers, reservations, progress, versions, and P11 receipts. No P13A license object. |
| `industryStudios` | P12 prerequisite | One immutable studio registry; P13–P15 attach facts by ID. |
| `talentOffers` / `negotiations` | P14 | Offers are durable finite state, not temporary UI state. |
| P12 `employerHistory`/active-employer index (foreign) plus P14 market-decision/archive indexes | P12 / P14 | P12 remains sole employer/interval authority; P14 adds cases and exact references, never a mirror. |
| `relationships` / `promises` | P14 | Sparse, evidence-linked facts; not a full N² matrix. |
| `careerLifecycle` | P14 | Birth/life phase/retirement state without deleting people. |
| `sharedMarket` / frozen release batches | P15 | Global demand, same-week assessments, and exposure decay are not `Standing`, a film result, or a copy of P12 schedules. |
| `rankSnapshots` | P15 | Periodic formula-versioned comparisons, not weekly derived history. |
| `corporateConditionAssessment` / transition-request receipts / participant manifest | P15 | Warning/distress/recovery, equivalent remedy capabilities, entrant eligibility, and one P13/P10/P11/P12/P14 initialization/settlement manifest can be additive after Owner approval. Every variable-size participant uses a true fixed bounded receipt or a request/source/rules-bound affected-set count/root/chain-digest manifest with immutable chunks of at most 100. P12's participant covers registry, projects, capacity, roster, current-employer, exclusivity, and intervals. P12 remains the sole operating-state/employer authority and commits only when every participant validates. |
| `ownershipEvents` / ownership relations | P16+ only | Acquisition, merger, library/IP transfer, co-production rights, and ownership transactions never enter a P15 root. |
| `legacyProjectionState` | P15 | Only minimal trigger/version/cache metadata; canonical facts stay in their owner roots. |

Names are interface-level sketches, not authorized TypeScript identifiers.

---

## 9. Immutable-ID strategy

The following identities never change because an employer, owner, status, name, or era changes:

| Identity | Rule |
|---|---|
| `StudioId` | Mint once. Rename, distress, closure, acquisition, or re-entry appends events; none remints the studio. |
| `PersonId` | Reuse the P10 identity. Employer transfer, retirement, alumni status, or later staff role cannot copy/remint/delete it. |
| `FilmId` / `productionId` | Preserve P07/P10 identity from concept/production/release through every market, award, ownership, and legacy view. |
| `TechnologyId` | Stable catalogue key. Renames use aliases/migration maps; removed definitions get an explicit tombstone reason. |
| `FacilityId`, `SetId`, `ContractId`, `OfferId`, `RelationshipId`, `PromiseId`, `MarketEventId`, `CorporateEventId` | Stable IDs prevent replay duplication and keep projections referentially honest. |

Display names are labels. Every name change is a dated event. UI routes and histories carry exact IDs, never infer identity from title, name, array position, or current employer.

Cross-studio uniqueness is checked at load, mutation, replay, and endurance gates. Duplicate IDs fail visibly; repair must be versioned and deterministic, never random reminting during load.

---

## 10. Save-version and migration sequence

### 10.1 Sequencing law

One package owns one explicit save-version step at a time. No P14 root may land in a P13 migration, and no P15 root may be pre-created as a misleading “empty future slot.”

1. Freeze the upstream accepted save/projection/schema identity after P05/P06.
2. Before P13 product roots, seal the core scheduler/history contract: immutable phase catalogue
   reference, per-event phase witness format, fixed legacy unknown-phase policy, and the source-owner
   archive-order **adapter contract** plus honest-exclusion behavior. This governed infrastructure
   gate has its own validator/migration witness and changes no product ownership; if it is absent,
   P13A.0 stops. It does **not** require P08–P12 adapter instances to be built before P13A.
3. P13 adds global timeline/catalogue reference/adoption roots with a versioned old-save migration.
4. Seal and Owner-accept P13; verify replay and 6,240-week proof.
5. P14 adds competitive-case/proposal/decision, relationship, and lifecycle roots; it references P12 employer intervals and migrates without inventing old offers, relationships, transfers, promises, or retirement events.
6. Seal and Owner-accept P14.
7. After the Owner approves P12C re-homing, P15A adds shared-market/batch/assessment roots. P15A.2 ranking and P15B condition/remedy/eligibility-orchestration roots each receive later explicit versions rather than pre-created empty slots. A P15B version also defines one idempotent participant manifest: P13 entry-baseline/work disposition, P10 people/contracts, P11 finance, P12 registry/projects/capacity/roster/current-employer/exclusivity/intervals, and P14 market/lifecycle/commitments. Each variable-size owner proves exact-once completeness through a hard-bounded fixed receipt or affected-set count/root/ordered-chain digest plus immutable chunks of at most 100; an opaque receipt reference is insufficient. P12 registry/employer versions remain authoritative and no transition commits until the whole candidate validates. The finale consumes facts but does not backfill them.
8. P16+, if authorized, adds ownership transactions separately.

Each accepted P08–P12 source-owner archive adapter is implemented and sealed only before the first
merged view that actually includes that source (for example, a P14A.2 career view or P15C legacy
view). Until then, the source is omitted with an explicit incomplete-history reason. P13A uses only
its native P13 history and therefore cannot become a cross-package legacy-index migration project.

### 10.2 Old-save honesty

- Catalogue definitions may be reconstructed from a recorded compatible catalogue version; historic studio adoption may not.
- A migrated studio begins with an explicit baseline such as `statusAtMigration: publicStandard` only for capabilities objectively universal at the migration week. It gets no invented early-research credit.
- Existing people keep IDs and current employment. Pre-P14 offers, relationships, promises, transfers, birth evidence, and retirement history are `notRecorded` unless an accepted current fact proves a minimal baseline.
- Existing releases keep frozen P07 results. P15 market pressure never recomputes their box office.
- Rank history begins after P15 activation. P08/P15 histories say “Not recorded” before that boundary.
- No migration runs twice; witnesses are idempotent and round-trip tested.

### 10.3 Catalogue change migration

A catalogue version change must classify each ID as unchanged, renamed through a stable alias, rules-changed with an explicit compatibility version, superseded, or removed with an honest tombstone. Silent ID reuse is forbidden.

---

## 11. Deterministic time, RNG, and replay

### 11.0 Shared phase-order authority

The accepted core weekly scheduler—not P13, P14, P15, a history view, or Unity—owns one immutable,
versioned `AuthoritativePhaseOrderCatalogue`. Each semantic `phaseId` receives a stable sparse
`phaseOrdinal`; an ordinal already used by a committed event can never be reassigned or reordered.
Later catalogue versions may add a phase only in a reserved gap or at a legal boundary and must retain
all prior mappings. Every new material event persists `phaseId`, `phaseOrdinal`, and
`phaseOrderVersion` as event-time facts. Migration and compaction preserve them byte-for-byte.

An older P07–P12 event that never recorded phase precision is indexed as
`legacy_phase_unspecified` with `phasePrecision: not_recorded` under a fixed legacy mapping. No
migration writes a guessed current-rule phase into that event. Same-week rows in that bucket use
`domainId`, domain-local sequence, and event ID only for stable presentation order; the UI may not
describe that order as causality.

The authoritative sequence for a week must be explicit and versioned. The cross-package candidate is:

1. accept/revalidate commands and freeze all due sets from the committed pre-week revision;
2. resolve P13 global milestones first, then per-studio standard dispositions, research completion,
   adoption work, capability materialization, and exact reservation release;
3. resolve P14 expiry-only chooser transactions through P10/P11/P12; clients never settle them;
4. decay already-active P15 exposures due before the week's release boundary and freeze the resulting
   pre-batch market revision;
5. freeze the complete P12 eligible release batch for the week; calculate every P15 assessment from
   that same pre-batch snapshot plus other batch members with self-exclusion, before activating any;
6. assemble one off-state candidate containing every assessment, every P07-owned prospective result/
   input receipt and history reference, every exposure, and one batch idempotency receipt; validate the
   whole candidate and commit once, or commit none if any subject fails;
7. resolve relationship/career/lifecycle consequences from typed committed facts;
8. resolve approved warning/distress/recovery conditions and equivalent remedies under the same pre-terminal player/rival guards; for a due dormancy/entry/re-entry/closure request, freeze one source revision, collect exact P13/P10/P11/P12/P14 participant receipts, validate one off-state candidate, and let P12 commit its registry receipt only with the whole manifest; otherwise commit none;
9. append durable events and update bounded periodic aggregates; and
10. publish snapshots/pages only after authoritative writes commit.

The final order is an implementation decision, but it must be one order for player and rivals.

RNG law:

- stable streams are keyed by system version + stable subject IDs + governed time bucket;
- simulation RNG is saved/replayable and isolated from presentation RNG;
- adding a new view cannot consume simulation entropy;
- global event ordering never depends on object enumeration or UI order;
- deterministic systems avoid RNG entirely when rules can decide;
- no repeated full-save hash is computed per view or per week;
- checkpoint digests and bounded divergence summaries are sufficient.

The [OpenTTD migration/RNG pattern](https://github.com/OpenTTD/OpenTTD/tree/96651d379a94e1aceaa986b7a0c76160bdc308fc) and [OpenRA replay/sync diagnostics](https://github.com/OpenRA/OpenRA/tree/32f46cd7b13d104129616c90c8922bf01f059f8c) are **OPEN-SOURCE PATTERN** references only. Both are GPL; no code is copied.

---

## 12. Event and historical-record retention

### 12.1 Three retention classes

| Class | Examples | Retention |
|---|---|---|
| Identity/material facts | founding, rename, film release, award outcome, P12 employer transfer, retirement, technology first adoption, recovery/dormancy and closure only if approved | Permanent, immutable, paged. |
| Finite active workflow | research task, offer, negotiation, promise, distress remedy window | Active rows plus permanent terminal summary/event; terminal working detail may compact after its audit window. |
| Periodic aggregate | monthly demand, quarterly ranking, annual finance/market summary | Fixed cadence; recent detail plus durable annual summaries where appropriate. Never per-view recomputation across 120 years. |

Existing `careerEvents` and Tier-D `studioEvents` remain authoritative for the facts they already own. New packages should prefer typed domain events over a universal unbounded event dump.

### 12.2 Projection law

- Summary views read maintained aggregates or indexed slices.
- New P13–P15 events use a native monotonic domain-local sequence. A source package may never mint or
  reinterpret another package's order. Accepted P08–P12 facts that lack a native immutable sequence
  require an **upstream source-owner-authored archive-order adapter/index**: metadata-only,
  idempotently versioned, bound to the exact source revision/persisted order/stable event ID and a
  monotonic `sourceOrderOrdinal`. It cannot rewrite the event, invent chronology, or turn array order
  into causal prose. If the owning package/history contract cannot supply a stable adapter, that domain
  is excluded from the merge with an explicit incomplete-history reason.
- Detail views page by append-stable domain cursor `(effectiveWeek, phaseOrdinal, domainId,
  sourceOrderOrdinal, eventId)`. For P13–P15 native rows, `sourceOrderOrdinal` is that domain's own
  sequence. For adapted P08–P12 rows, it is the source-owner archive ordinal.
- Every new row carries the scheduler-owned `phaseId`, immutable `phaseOrdinal`, and
  `phaseOrderVersion`. A page (hard maximum 100 rows) carries those exact row witnesses plus one
  bounded phase-lineage reference (`oldestVersion`, `newestVersion`, `lineageDigest`); it never returns
  an unbounded version list. Compaction cannot apply the current scheduler map to an older event. Legacy rows expose `phasePrecision:
  not_recorded` and the fixed noncausal legacy bucket.
- A single-domain page declares `asOfWeek`, its native sequence or owner-authored archive-order
  high-watermark, snapshot revision, subject/filter/
  sort, requested/applied page size (default 25, hard maximum 100), schema/segment generation, formula/
  data version, `nextCursor`, and incomplete-history state. A merged P08–P15 view freezes, per domain,
  `sourceRevision`, `orderingKind` (`native_sequence` or `owner_archive_adapter`), `orderingVersion`,
  `sourceOrderHighWatermark`, recorded-from/completeness, and one phase-lineage reference. The domain
  manifest has a hard maximum of 16 entries; a digest mismatch refuses instead of truncating. It uses
  the same merge tuple. Later appends do not
  invalidate/reorder a bound page; incompatible schema/compaction expiry is explicit.
- Relationship projections request one person or one pair, never all pairs.
- Market views request bounded time buckets, never scan every release on every render.
- The finale runs once from maintained aggregates and durable indexes, caches only a versioned
  derivation, and freezes at most 16 domain revision/order/high-watermark/phase-lineage entries plus only the evidence IDs
  actually cited: at most 8 archetypes, 12 qualifying and 12 contrary refs per archetype, and 12 lens
  summaries. It never stores every historical ID.
- Rebuilding a cache produces byte-equivalent semantic output from the same save.

---

## 13. Century-scale storage and performance envelope

These estimates are planning envelopes, not measured implementation results.

### 13.1 Expected integrated 120-year fixture

Assumptions: 16 studios, up to 20,000 released films, 5,000 people created over the campaign, 500
technology definitions, at most 500 simultaneously public/active release records, and 250,000
material cross-package rows. There are no per-week person, relationship, research-progress, or
zero-change market snapshots.

| New P13–P15 data | Planning basis | Raw JSON planning estimate |
|---|---:|---:|
| P13 catalogue refs, current adoption/work orders, material innovation events | bounded current rows + material transitions | 0.5–2 MiB |
| P14 cases/proposals/decision receipts, lifecycle facts, sparse relationship/promise summaries | roughly 40,000–100,000 variable records | 12–40 MiB |
| P15 batches/assessments/exposures/monthly summaries and later approved rank/status facts | roughly 25,000–75,000 variable records | 8–30 MiB |
| Cursors, indexes, version/provenance/taken-set metadata | encoding-dependent overhead | 5–20 MiB |
| **Incremental P13–P15 planning range** | not an acceptance budget | **25–92 MiB raw JSON** |

These ranges are arithmetic risk indicators, not measured promises. Existing film, career, ledger,
facility, and award data are outside the incremental estimate and must be measured together using the
actual accepted encoding. Browser local-storage assumptions are unsafe. A future charter must set a
target-specific budget before implementation; breach refuses visibly, never resets/truncates.

### 13.2 Hostile fixture

Use 64 studios, 100,000 films, 20,000 people, 1,000 catalogue entries, 4,000 simultaneously
public/active releases, a 512-release same-week batch, 1,000,000 material/history rows, 6,240 weeks,
high offer/retirement/entrant/dormancy churn, and repeated save/load/migration. Closure churn is absent
unless a later terminal slice is authorized. A 250–500 MiB raw planning alarm band triggers design
review; it is not an acceptance target. The purpose is to expose slopes and failure posture before
content locks.

### 13.3 Complexity gates

- No O(total history) work on an ordinary weekly tick.
- No O(people²) relationship pass; update only pairs touched by the week's facts.
- No O(studios × full film history) shared-market calculation; consume bounded scheduled releases and maintained genre state.
- No O(batch²) same-week comparison; build genre/window aggregates once and subtract the subject.
- No O(batch²) identity storage: persist one exact-count/root/chain-digest member manifest with chunks
  of at most 100 and let each assessment reference its batch/aggregate digest plus bounded top reasons.
- No full-save hashing for view refresh.
- No unbounded DTO arrays.
- No array-position identity.
- No rebuild of century aggregates per screen open.
- Paging cost is proportional to page size plus indexed lookup, not total history.
- Save-size, load-time, tick-time, projection-time, allocation, and page-time slopes are recorded at 25%, 50%, 75%, and 100% horizon.

---

## 14. Endurance proof

Every package must pass a common proof pyramid before it can hand off.

### Level 1 — pure state laws

- state transition tables are exhaustive;
- illegal transitions refuse with typed reasons;
- IDs never duplicate or remint;
- P10 term changes invalidate stale review/submission tokens;
- adoption and public standard are distinct;
- retired/closed identities remain queryable.

### Level 2 — deterministic fixtures

- same seed + commands + catalogue yields the same digest and event order;
- save/load at every workflow state preserves legal actions;
- migration is idempotent;
- replay cannot duplicate completion, proposal decision, release-batch assessment, P12 transfer, retirement, rank, or finale events;
- player and rival consequences match for identical facts under P13/P14/P15A symmetric laws and
  P15B pre-terminal guards/remedies. A separately Owner-approved P15B terminal path is tested against
  its explicit asymmetry policy and complete participant manifest; it is never mislabeled as terminal
  player/rival parity.

### Level 3 — cross-package integration

- P13 capabilities gate future production without rewriting past films;
- the P12 employer transition selected by P14 preserves P10/P08 credits and P11 ledger references;
- P15 market consumes P07 releases without mutating frozen run schedules;
- P15C resolves every claim to canonical P07–P15 IDs.

### Level 4 — 6,240-week endurance

- uninterrupted run;
- scheduled save/load cycles;
- old-version migration at early, middle, and late weeks;
- duplicate command injection;
- alternative object iteration order;
- high churn in studios/people/offers/releases;
- bounded page/projection timing;
- no quadratic growth;
- final invariant/digest comparison and bounded divergence report.

### Level 5 — world/client truth

- TypeScript supplies all legality, numbers, reasons, rank, and finale evidence;
- Unity renders exact IDs and refuses stale commands;
- world route and workspace agree;
- no facade can claim research, negotiation, market consequence, or legacy without an authoritative state transition behind it.

---

## 15. Bounded first checkpoints

All three checkpoints first require the accepted scheduler/history contract to publish its immutable
phase catalogue (`phaseId`, sparse `phaseOrdinal`, `phaseOrderVersion`) and fixed legacy unknown-phase
policy. This is shared infrastructure, not P13/P14/P15-owned product scope; if it is absent, the slice
stops at reconnaissance rather than inventing a local order.

### 15.1 P13A — one shared sound transition

**Split after a blocking authorization gate.** First, the Owner authorizes a minimal P09-governed
Laboratory plus stable P10-compatible Scientist/provider (recommended) or waits for a later upstream
package. An aggregate provider does not unblock this prescribed named-person/world checkpoint. Then P13A.1 proves one headless `synchronized-sound` catalogue item,
availability/standard fixture, research/wait, resumable adoption work, one rival decision,
save/migration/replay and 6,240 weeks. P13A.2 binds exact P09/P10/P11/P12 and one production
consequence. P13A.3 adds bounded projections and the world/client route. Licensing is excluded.

Exclude the full catalogue, generic quality, full alternate-history windows, multiple labs, scientist reassignment loops, awards, and market demand.

### 15.2 P14A — one contested expiry

**Split the starting proposal.** P14A.1 proves one person's expiry window, one player proposal, one
rival proposal, one informational intermediary route, P10-authored term references, and one
deterministic scheduled chooser transaction through P10/P11/P12. P14A.2 proves bounded comparison/
history pages and explicit unknowns. P14A.3 proves the world/client proposal route. Clients submit,
revise, or withdraw; no client accepts or settles the person. Every slice runs 6,240 weeks.

Exclude in-term poaching, contract breaking, compensation, promises, relationships, aging, decline, retirement, and a large talent market.

### 15.3 P15A.1 — one symmetric shared-market consequence

**Split the starting proposal.** Prove one player release and one rival release in the same governed
week/genre, one P12-source-revision-bound release batch, one pre-batch exposure snapshot, calculation
of both self-excluded assessments before either activation, one formula-versioned pressure/decay law,
the same consequence path for both, and typed reasons from known facts. ID/owner/order swaps must not
change normalized results.

Exclude Power Ranking, screens/exhibition without exception, distress, entrants, closure, acquisition, co-production, and finale.

### 15.4 P15A.2 — first comparative ranking

Only after P15A.1 produces enough real comparative history, prove a formula-versioned periodic Power Ranking with typed reasons and direct separation from Standing. It is not part of P15A.1's acceptance gate.

---

## 16. P13 → P14 handoff

P13 hands P14:

- the core scheduler's authoritative week by foreign reference plus P13-owned era/milestone presentation facts;
- stable `TechnologyId` and capability availability;
- each studio's adoption state and dated adoption events;
- visible profession/facility prerequisites;
- production compatibility rules that may create career opportunities;
- a future P15B-facing entry-week baseline/work-disposition receipt contract; P13 never changes P12
  operating state or awards a late entrant retroactive research/firsts; and
- no hidden research score or cloned rival tree.

P14 may use those facts to explain labor demand or specialties. It may not change technology state through hiring, encode technology inside a person, or make relationships a hidden research multiplier.

---

## 17. P14 → P15 handoff

P14 hands P15:

- stable people across every employer;
- P10 contract references and exact current-employer/interval truth from P12;
- durable proposal/decision outcomes plus exact references to P12 employer transitions;
- work-derived collaboration and relationship evidence;
- typed promises/trust outcomes;
- birth/life-phase/retirement/alumni truth with incomplete-history flags;
- bounded career pages and aggregates; and
- a future P15B-facing participant-disposition receipt for open cases, proposals, promises, and
  commitments; P14 never changes P12 operating state or deletes those facts implicitly.

P15 may compare and interpret these facts. It may not invent a “studio talent score,” delete retirees, or transfer a person's identity when corporate ownership changes.

---

## 18. P15 → 2040 finale

The finale is a projection over canonical facts, not a new scoring simulation.

Candidate nonexclusive archetypes include:

- artistic voice;
- audience institution;
- commercial engine;
- technology pioneer;
- talent foundry;
- resilient survivor;
- awards dynasty;
- genre specialist or reinvention studio.

That is the complete first authored definition set: eight archetypes maximum. A required separate
released-film catalog/body-of-work lens pages the studio's actual P07/P10/P12 film/release/result IDs;
it is not an archetype, legal library/IP ownership, chain of title, or ownership transfer. Those legal
rights remain P16+.

Every awarded archetype must show qualifying evidence and contrary context. A studio can hold several, one, or none. Setbacks and recoveries are part of the record. There is no hidden overall score, winner, letter grade, or fabricated “greatest film.”

The finale must identify:

- the exact 2040 trigger week and finale formula/data version;
- all source IDs used by each card or sentence;
- incomplete-history gaps;
- whether the run continued from a migrated save;
- active rivals and historically important inactive rivals;
- films, careers, awards, technology, finance, and market facts without recomputation;
- the Owner's post-finale mode decision.

---

## 19. Owner decision matrix

`Blocks first checkpoint` means blocks the specific bounded proof, not the eventual slice.

### 19.1 P13 decisions

| Decision | Options | PRELIMINARY RECOMMENDATION | Consequence / dependency | Blocks P13A? |
|---|---|---|---|---|
| Historical dates | fixed exact dates; bounded historical windows; fully dynamic | bounded windows with authored earliest/normal/latest policy | Needs versioned timeline and deterministic transition law; avoids fake precision while keeping historical shape | No—P13A can use one fixed fixture policy, but the production catalogue waits |
| Research vs licensing | research/wait only; add industry license; add bilateral rights market | seal research/wait first; licensing only in a later Owner-authorized P13L/P16+ technology-rights slice, clearly successor design | Requires rights identity, scope, expiry, price, transfer/disclosure and rival symmetry; P14 talent law is not the substrate | No—excluded from P13A |
| Can technology be skipped? | never; optional capability; standards mandatory | optional capabilities may be skipped; public standards eventually apply | Compatibility UI must distinguish optional, required, and standardized | No for one fixture if all three states are explicit |
| Universal standards | never; fixed dates; diffusion threshold + latest bound | eventual public standard with authored latest bound | Requires global milestone state distinct from studio adoption | No—the bounded fixture explicitly and non-authoritatively pins synchronized sound as a standard for one defined use; production catalogue policy still requires Owner approval |
| Laboratory/Scientist substrate | minimal concrete P09/P10-compatible roots; aggregate provider; wait for upstream package | authorize the minimal concrete Laboratory plus stable Scientist/provider, with P13 owning only work/reservations; aggregate staffing does not satisfy P13A's named-person/world proof | Avoids pretending current roots exist while preserving world causality and exact credit | **Yes for complete P13A** |

### 19.2 P14 decisions

| Decision | Options | PRELIMINARY RECOMMENDATION | Consequence / dependency | Blocks P14A? |
|---|---|---|---|---|
| P12B deferred-slice placement | keep competitive labor market in later P12B; re-home to P14A; split cases from chooser orchestration | re-home competitive cases/proposals/intermediary/knowledge/chooser receipts to P14A while P12 retains employer identity/exclusivity/index/interval/transition authority | Requires Owner boundary ruling and exact P10/P11/P12 transaction interfaces; rejection returns it to P12 follow-up | **Yes** |
| Contract break/compensation | forbidden; mutual release only; buyout/breach | no unilateral in-term poach in P14A–C; any mutual release/buyout belongs only to separately chartered P14D/P16+ | P10/P11 contract and ledger plus P12 employer/exclusivity/interval changes | No; blocks P14D/P16+ only |
| Poaching scope | free agents only; expiry approach; in-term | free agency + renewal-window competition first; park in-term scope in P14D/P16+ | Requires P12 rival needs and symmetric eligibility | P14A needs expiry competition; B/C cannot add in-term policy |
| Promises/trust | none; contract-only; broader typed promises | typed, measurable, deadline/evidence-based promises in P14B | Adds promise state/history and visible excusing facts | No |
| Retirement | hard age; intent window; authored role/tenure/career context; no retirement | transparent bounded intent/window plus wait-until-clear P14/P10/P11/P12 atomic settlement; typed deferral, never deletion or silent break; negotiated early settlement remains P14D/P16+ | Needs birth/age evidence, P10 assignment/contract, P11 obligation-or-none, P12 roster/employer/exclusivity/interval, and alumni projection | No for P14A; blocks P14C retirement slice |
| Relationship scope | production pairs only; workplace graph; full social sim | sparse work-derived collaboration graph | Event refs and bounded pair updates; no needs/social spam | No |
| Agency power | directory only; representative; gatekeeper | transparent representative/search service, never absolute gatekeeper | Fees, consent, scope, expiry, failure reasons | P14A needs one intermediary policy |
| Offer visibility | full rival terms; bounded/partial lawful knowledge; hidden offers | bounded lawful knowledge with explicit unknown fields and no fabricated rival maximum | Requires knowledge provenance, disclosure rules, and comparison DTO | **Yes** |
| Settlement timing | atomic expiry decision; future-dated reservation; immediate transfer | atomic decision at exact expiry; defer reservation and reject immediate transfer in P14A | Avoids a P14 future-employer root and preserves P10/P12 current authority until boundary | **Yes** |
| Chooser law | fully published score; deterministic ordered descriptors/bands + typed reasons; RNG | deterministic ordered descriptors/bands and typed top reasons, no P14A RNG | Requires versioned person-choice receipt and stable tie law | **Yes** |
| Career decline | no P14-authored decline; P10-owned role-specific visible change; hidden age curve | no P14-authored decline initially; future joint P10/P14C Owner decision only | P14 may show lifecycle context but cannot mutate P10 skill/development | No |
| Century-scale talent supply | fixed finite census; deterministic era-aware cohorts; random emergency generation | deterministic era-aware P14C cohort requests with an immutable body/digest, schedule/worldgen/rules versions, and hard maximum 32 people; P10 atomically mints/registers each `PersonId` and P14 persists exact one-to-one registration mappings in paged receipts; reject emergency generation | Prevents depletion across 6,240 weeks without P14 stealing identity authority, partial cohorts, reminting people, nondeterministic emergency generation, or an unbounded lifetime ledger | No—P14A uses a fixed fixture; **blocks P14C cohort slice** |
| Multi-case portfolio scarcity | bounded binding holds and visible issuer priority; opaque ID/iteration order; single-case-only market | prove one case in P14A.1; before expansion use P11/P12 holds, scheduler admission ordinals, unique visible studio priorities, and a hard maximum 32 submitted offers per studio/decision phase; reject opaque order | Keeps the checkpoint small while preventing `PersonId` or worker timing from deciding scarce commitments; depends on a P11 obligation-hold receipt, P12 capacity-admission receipt, and P14 proposal-version/review law | No for P14A.1; **blocks multi-case expansion** |

### 19.3 P15 decisions

| Decision | Options | PRELIMINARY RECOMMENDATION | Consequence / dependency | Blocks P15A.1? |
|---|---|---|---|---|
| P12 deferred-slice placement | retain P12C/D/E; re-home to P15A/A.2/B; split differently | re-home P12C→P15A, P12D→P15A.2, P12E condition/eligibility/orchestration→P15B while retaining P12 registry/operating state/entrant initialization/projects/releases/disclosure/events | Makes current spine coherent without duplicating P12A | **Yes for P12C placement** |
| Acquisition | disallow; P15; P16+ | defer to P16+ | Requires valuation, ownership, contracts, IP/library transfer, immutable history; not original parity | No |
| Rival closure | never; dormancy; staged rival closure under P12's allowed-failure law | equivalent pre-terminal guards/remedies; exact staged rival closure only in an Owner-approved P15B terminal slice with P12 registry settlement, archive, and active-rival-floor proof | Does not require a symmetric player game-over; immutable IDs/history remain | No for P15A.1; exact policy blocks rival-closure slice |
| Player closure | protected campaign; optional recoverable ending; mandatory hard game-over | preserve P12's no-mandatory-hard-bankruptcy law; any player terminal ending is a separate Owner decision | Terminal eligibility is explicitly asymmetric even though pre-terminal guards/remedies remain equivalent | No for P15A.1; blocks only player-terminal slice |
| Later entrants / active-rival floor | no entrants; fixed arrivals; deterministic authored-window eligibility responding to floor/cap | deterministic bounded P15B eligibility with P12's minimum three active AI rivals; P15 requests and coordinates, P12 mints/commits, and one P13/P10/P11/P12/P14 participant manifest initializes entry-week facts | Prevents an empty century without a second registry, partial activation, omitted technology baseline, or fabricated pre-entry research/history | No for P15A.1; **blocks entrant slice** |
| Co-production | disallow; P15; P16+ | defer to P16+ | Requires project authority, revenue/cost/credit/rights splits | No |
| Power Ranking cadence | monthly; quarterly; annual/event | quarterly candidate, only after real comparative data | Versioned formula/reasons and P08 separation | No; belongs P15A.2 |
| Power Ranking definition | commercial-only; three visible equal-point lanes; opaque/weighted composite | Owner-gated candidate: trailing 52 weeks, at most four P07 frozen film outcomes, P08 actual honors, P12 disclosed delivery, each a public 0–10 lane; unweighted 0–30 sum and dense ties | Requires exact source selectors/bands/version; excludes Standing, cash/valuation, private slate, and client math | No for P15A.1; **blocks P15A.2** |
| Shared-market envelope | genre only; genre+overlap; full screens/attention | prove genre+release-window pressure first; screens/exhibition require separate research and cannot enter P15A.1 | Must preserve P07 frozen runs and use one atomic P12 release batch | Exact first formula yes; screen model no |
| 2040 finale | one outcome; ranked ending; multi-archetype interpretation | multi-archetype, evidence-linked, loss-aware interpretation | Requires all earlier durable facts and incomplete-history language | No |
| Endless Mode | stop; browse-only epilogue; continue | Owner chooses after finale prototype; no assumption | Requires post-2040 timeline/content/support policy | No |

---

## 20. P16+ parking lot

The following are not hidden P15 scope:

### P16 candidate — Studio Empire & Ownership Transactions

- acquisition;
- merger;
- labels and subsidiaries;
- ownership stakes;
- studio valuation;
- library/IP ownership transfer;
- contract assumption and consent;
- debt/investor/equity integration if separately approved;
- antitrust or regulatory policy only if explicitly designed;
- ownership-aware legacy presentation.

### Other deferred candidates

- **P14D / Advanced Labor & Contract Mobility:** in-term approaches, negotiated releases, buyouts,
  compensation, contract breaking, and tampering; exact future package number remains an Owner decision,
  but it is P16+ parking and cannot enter P14B/C;
- separately governed P13L/P16+ technology rights: licensing source, patents, scope, term, royalties,
  transfer/disclosure, compatibility, and rival-symmetric pricing; never P14 talent-offer reuse;
- co-productions and split finance/credits/rights;
- distribution territories and exhibitors;
- home media, television, streaming, and later revenue channels;
- sequel/franchise/IP strategy;
- physical rival lots;
- sabotage, which remains rejected as default competition;
- mortality, illness, family, and daily human-needs simulation;
- full stunt/injury/condition system;
- international labor or multi-market regulatory simulation;
- cross-campaign meta progression;
- post-2040 content generation.

Every parked item needs a new Owner decision and research boundary. None is approved merely because its identity seam is future-proofed now.

---

## 21. Post-2040 Endless Mode decision

**OWNER DECISION REQUIRED.** The roadmap supports three honest choices:

1. **Finale and stop:** the authoritative campaign ends at 2040; history remains browsable.
2. **Finale plus epilogue browser:** no more simulation ticks, but films, people, awards, and legacy evidence remain explorable.
3. **Endless Mode:** the finale occurs once and the simulation continues under a separately versioned post-2040 policy.

If Endless Mode is approved, it must answer catalogue supply, entrant/retirement generation, era presentation, market normalization, awards cadence, balance support, save compatibility, and whether new achievements exist. “Keep ticking” is not a complete design. No P13–P15 document assumes option 3.

---

## 22. Relative scope and risk

| Slice | Relative scope | Primary risk | Why the bound matters |
|---|---|---|---|
| P13A.1 | Small–medium | frozen-leaf migration, ordering and resumable work identity | One headless technology proves global vs studio-relative state without upstream/UI breadth |
| P13A.2 | Medium | P09/P10/P11/P12 and production integration | One consequence proves real causality without expanding the catalogue |
| P13A.3 | Small–medium | bounded projection/world truth | Client proof cannot hide a simulation gap |
| P13 full | Large | catalogue governance, cross-production compatibility, long-history migration | Content breadth can obscure architecture defects |
| P14A.1 | Medium | P10/P11/P12 atomic expiry transaction | One contested expiry proves exact identity and authority ownership |
| P14A.2 | Small–medium | partial knowledge and append-stable paging | Read-side proof adds no outcome law |
| P14A.3 | Small–medium | world/client intent authority | Proposal UX cannot become settlement authority |
| P14B | Large | sparse causal relationship graph without grind or hidden bonuses | Must resist full social-sim scope |
| P14C | Large | age provenance, old-save honesty, all-owner retirement settlement without deletion | Lifecycle touches every career/profile/employer/obligation view |
| P14D / P16+ advanced mobility | Very large / high risk | contract break, compensation, tampering, P10/P11/P12 settlement and legal/disclosure law | Explicitly parked; cannot be smuggled into relationships or retirement |
| P15A.1 | Medium | symmetric release ordering and frozen P07 result boundary | One market consequence isolates fairness and explanation |
| P15A.2 | Medium | ranking accidentally duplicates Standing or rewards noise | Requires prior comparative history |
| P15B | Very large / high risk | finance completeness, failure experience, project conservation | Must not be bundled with acquisition transactions |
| P15C | Medium–large | fabricated history or one-score reduction | Provenance and incomplete-history behavior are the product |
| P16 ownership transactions | Very large / very high risk | identity, valuation, rights, contracts, finance, migration | Separate package is mandatory if authorized |

---

## 23. Exact reasons not to implement now

1. P05 is active and unsealed. Current paths and projection seams can still move.
2. P06 is provisional and explicitly requires a post-P05 Owner-accepted refresh.
3. P12's rival foundations are design authority, not accepted implementation roots.
4. P13–P15 contain unresolved Owner choices that change state models, not cosmetic tuning.
5. A global timeline and catalogue must be validated against frozen save leaves before code is authorized.
6. P14 cannot safely land before immutable cross-studio employer identity exists.
7. P15 market symmetry requires real conserved rival releases, not fabricated comparison rows.
8. Corporate distress cannot use present negative cash or incomplete runway selectors as bankruptcy truth.
9. Acquisition is successor invention and would expand scope across finance, contracts, IP, and identity.
10. The current save/storage mechanism has not proved the combined 6,240-week envelope.
11. The client bridge has not been designed for bounded paged P13–P15 projections.
12. Owner playtest history in P04 proves machine-green work is not Owner acceptance.

---

## 24. Long-range validation contract

Before any package implementation begins, its refreshed charter must prove:

- exact accepted TypeScript and Unity SHAs;
- current save/projection/protocol identities;
- exact changed paths after all upstream Owner-accepted work;
- one authoritative owner for every new fact;
- no widening of frozen leaves;
- no production or client formula duplication;
- no hidden data in DTOs;
- domain-local sequence ownership, frozen per-domain high-watermark manifests for merged pages, and
  explicit requested/applied page caps;
- a P15B all-owner transition manifest with P13/P10/P11/P12/P14 receipts, fixed-size bounds or
  affected-set count/root/ordered-chain digests plus chunks of at most 100 for every variable owner,
  and atomic failure fixtures;
- migration and rollback plan;
- immutable scheduler phase IDs/ordinals/versions, legacy phase-precision handling, and a proof that a
  later phase-catalogue version cannot reorder old same-week rows;
- for every legacy source included by that checkpoint's merged view, an exact P08–P12 source-owner
  archive-order adapter where native sequence is absent, including idempotent migration/index proof;
  sources not yet adapted remain excluded with an explicit incomplete-domain fallback;
- 6,240-week fixture and measured storage/performance budgets;
- clean source/license register, with all open-source references independently implemented;
- world-first route and accessible workspace behavior;
- hostile review focused on unsupported parity, duplication, asymmetry, identity loss, history fabrication, and oversized checkpoints;
- Owner playtest after technical acceptance.

### 24.1 Executed adversarial review record

This research candidate was reviewed from fresh read-only lanes. Findings were not discarded or
shopped between reviewers.

| Lane / reviewer | Material challenge | Correction applied | Final disposition |
|---|---|---|---|
| P13 — Hilbert | original-parity confidence, catalogue/clock boundary, and checkpoint containment | primary-source labels retained; core scheduler clock separated from P13 timeline; concrete Laboratory/Scientist and research/wait-only proof bounded | **ACCEPT** |
| P14 — Dirac, with targeted second pass | lower-confidence GameSpot label; unbounded cohort/disposition receipts; incomplete history DTO; opaque same-phase `PersonId` scarcity; ownership wording | evidence downgraded; 32-person digest-bound cohorts; count/root/chain chunk manifests; complete bounded page request/response; Owner-gated admission/portfolio law; P10/P12 ownership restored | **ACCEPT** |
| P15 — fresh P15 reviewer | paging tuple/lineage; missing rank candidate; film catalog vs legal IP; incomplete variable-owner manifests; archetype overflow; accepted terminal asymmetry wording | exact merge contract; explicit Owner-gated three-lane ranking; released-film body-of-work lens; bounded P13/P10/P11/P12/P14 exact-set proofs; exactly eight authored archetypes; pre-terminal symmetry separated from terminal policy | **ACCEPT** |
| Cross-package — Carver | P10/P12 employer truth, core-clock ownership, archive-adapter timing, P15 closure ownership, P14 retirement, DTO bounds, P16 leakage | ownership/handoff matrix corrected; adapters deferred until first consuming merge; all-owner atomic manifests; explicit bounds; legal ownership remains P16+ | **ACCEPT** |
| Original-source confidence — Hooke | unsupported parity, source-class ambiguity, acquisition/pre-release claims, local-artifact provenance | five source/label corrections, exact hashes, pre-release-only wording, acquisition explicitly refuted as shipped parity | **ACCEPT** |
| Architecture / long horizon — Godel plus fresh final endurance pass | phase-order evolution, legacy ordering, migration sequencing, participant completeness, and quadratic per-assessment co-batch ID persistence | immutable append-time phase witnesses; owner adapters/honest exclusion; sequential additive migrations; bounded exact-set manifests; one O(batch) chunked member manifest plus bounded assessment refs and 512-release slope/corruption fixtures | **ACCEPT** |

Final mechanical validation covers exactly seven Markdown files; 31 required main sections in each
package; 37/31/29 golden journeys; balanced fences; consistent tables/headings; no unresolved
placeholders; 22 exact authority paths at their commits; 13 matching local artifact hashes; eight
unique pinned open-source repositories with licenses/symbols; and 43 unique external URLs. Direct
requests returned 35 successful responses; eight publisher/CDN anti-bot responses were separately
resolved to indexed canonical pages rather than treated as missing sources.

---

## 25. Final disposition

The three-package spine is recommended with the following binding candidate boundary:

```text
P13: one shared industry timeline and technology catalogue
     + per-studio research/adoption
     + concrete capability/world consequences

P14: one immutable person identity
     + transparent shared labor market
     + work-derived relationships
     + lifecycle and alumni preservation

P15: one symmetric audience market
     + only bounded, Owner-authorized corporate fate
     + evidence-backed 2040 legacy

P16+: ownership transactions, co-productions, acquisitions, mergers, library/IP transfer
```

**PRELIMINARY RECOMMENDATION:** Owner approves or revises this boundary before any P13 implementation reconnaissance. The next authorized action from this document is review, not implementation.

**POST-UPSTREAM OWNER-ACCEPTED REFRESH REQUIRED.**

---

## 26. Owner approval — 2026-08-31

**OWNER APPROVED ROADMAP — DOCUMENTATION / PRODUCT-DIRECTION AUTHORITY ONLY.** The Owner approved
this P13–P15 package spine at research commit
`2a7ff0d973391f9433d19ec2cb7f6c5582d1e44f`. The durable ruling is recorded in
`docs/design/CODEX-P13-P15-OWNER-RULINGS.md`. This approval section supersedes the preliminary
status and Owner-decision-required wording above; it does not silently resolve any decision that
the ruling keeps open.

- **P13 — Eras, Technology & Studio Innovation:** one global catalogue and shared industry
  timeline, studio-relative research/adoption, concrete consequences, symmetric rival use,
  eventual public standardization, and the bounded synchronized-sound P13A proof.
- **P14 — Talent Market, Relationships & Career Lifecycle:** P10 person/contract/career authority,
  P12 employer/studio authority, immutable `PersonId`, proposal-before-resolution, one-employer
  exclusivity, transparent terms, work-derived relationships, preserved alumni history, and the
  bounded free/expiring-professional P14A proof.
- **P15 — Corporate Hollywood, Shared Market & Studio Legacy:** a frozen-batch symmetric market
  with exact self-exclusion and pressure/decay, Power Ranking separate from Standing, P12 retaining
  canonical operating-state ownership, P15 distress/closure/later-entry behavior, and an actual-
  history, nonexclusive-archetype 2040 legacy with no overall score. P15A remains market-only.

Licensing, patents, royalties, technology-rights transfers, advanced mobility/buyouts, corporate
ownership transactions, co-productions, library/IP transfers, and every other item in the approved
P16+ parking lot remain deferred. The exact historical and standardization windows, technology
skip/acceleration rules, deeper contract/agency/relationship/lifecycle laws, shared-market and Power
Ranking formulas, closure/later-entry policy, finale presentation, and post-2040 mode remain open
Owner decisions. Endless Mode is undecided.

The **Corporate Hollywood** title grants no acquisition, merger, stake, subsidiary, co-production,
or library/IP-transfer authority. This approval authorizes no implementation, Unity work, schema,
DTO, save, dependency, or implementation-branch change. Every package still requires its normal
post-upstream changed-path refresh, implementation reconnaissance against then-current authority,
and separate Owner implementation approval before coding.
