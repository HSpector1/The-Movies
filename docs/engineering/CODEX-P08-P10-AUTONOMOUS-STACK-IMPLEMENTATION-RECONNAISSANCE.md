# Project: Studio — P08–P10 Autonomous Stack Launch Implementation Reconnaissance

> **REVISION 05 — CURRENT OPS TARGETED CORRECTION APPLIED.** This document preserves the useful detail of the earlier `foundation-marathon` draft but is now governed by the accepted closeout base and the full-scope traceability/ready-extension laws. P06 and P07 are **OWNER ACCEPTED — KEEP — CLOSED**. The only pending Owner acceptance is for new P08–P10 work. The former name is a draft alias; `docs/p08-p10-autonomous-stack-launch-01` is canonical.
>
> **Private Unity boundary:** the accepted Unity identity is known (`c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`), but the connected Future Ops environment could not inspect that private source tree. **SOURCE INSPECTION NOT AVAILABLE TO FUTURE OPS — REQUIRES CODING-AGENT READ-ONLY PREFLIGHT.**


**Status:** PROVISIONAL — CURRENT OPS CHANGED-PATH REFRESH REQUIRED
**Mode:** documentation only
**Implementation authorization:** NONE
**TypeScript baseline inspected:** `campaign/living-lot-ts@2753e18ba8fb5f65b936c22cde9531646fecc6cd`
**Unity accepted baseline:** `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`; private source ownership requires coding-agent read-only preflight

## 1. Executive finding

The three-package core-and-ready-extension stack is architecturally plausible because most underlying simulation truth already exists:

- P08A can build durable Standing/history authority without inventing awards.
- P09 can reuse mature property, placement, construction, facility, Set, operations, clock, and accounting law instead of creating a second building simulator.
- P10A can project existing Talent, contract, assignment, presence, perceived-skill, Star Power, and career-event truth instead of creating a new people simulation.

The highest risks are not missing core mechanics. They are:

1. widening old save leaf shapes instead of adding safe new roots/versions;
2. allowing P09’s Founding Flip to strand the first-film journey;
3. duplicating history across `StudioEventLog`, a new P08 history root, FilmResult, and career events;
4. building three independent UI languages rather than one coherent lot shell;
5. carrying three packages without human testing and then losing rollback/debug boundaries.

## 2. Current TypeScript facts verified at the P07 technical tip

### 2.1 Save and root shape

- `GameState = GameStateV16`.
- V16 adds `releaseAuthority` over the V15/V14/V13 lineage.
- `Standing` remains a frozen three-field shape:
  - `audienceAwareness`;
  - `industryPrestige`;
  - `commercialConfidence`.
- `StudioEventLog` already exists with monotonic `nextSeq` and permanent/windowed event arms.
- Current permanent events include `wrapped`, `premiere`, `releaseCommitted`, `constructionCompleted`, `setBuilt`, and `setRetired`.
- `StudioEvent` is shared by older save versions and has already required version-aware leaf discipline. Casual widening would be high risk.
- `PropertyState`, `StudioPlacement`, Sets, production queue, original screenplays, and current facility identities are already persisted.

### 2.2 Standing

`src/core/standing.ts::updateStanding` is the authoritative three-channel release-result mutation. It deliberately keeps the channels causally separate:

- Awareness: reach + star attention;
- Prestige: critic result;
- Commercial Confidence: profitability and budget discipline.

Other mutation families include publicity and weekly awareness settling. P08 must inventory every mutation site; a history system that records only `updateStanding` would be incomplete.

### 2.3 P07 result handoff

P07’s new consumer contract is additive Projection 15 / Protocol 4 / Save V16. The TypeScript changed paths include:

- `src/core/receptionVerdict.ts`;
- `src/core/newspaper.ts`;
- `src/core/studioRunRecap.ts`;
- `ui/src/engine/adapter.ts`;
- `ui/src/lot/snapshot/StudioLotSnapshot.ts`;
- `bridge/schema/bridge-schema.ts`;
- `bridge/session.ts`;
- generated Unity DTO/manifest files;
- result fixtures and focused tests.

P08 must consume the canonical P07 verdict and result view. It must not introduce another critic/audience/business vocabulary.

## 3. P08A reconnaissance

### 3.1 Product authority to preserve

Existing design:

- `codex/awards-standing-research-08@438708c5071097d8e1ddb2f97a3f7b6674b2a65e`
- `docs/design/CODEX-AWARDS-STANDING-PACKAGE-08.md`
- `docs/design/CODEX-AWARDS-STANDING-PACKAGE-08-BUILDER-ANNEX.md`

Preserve:

- Standing, Honors, History, and Progression are distinct;
- P08A precedes awards;
- no composite Studio Rating;
- history is sparse and exact-ID based;
- old saves say `Not recorded`;
- non-blocking world-first entry.

### 3.2 Recommended persisted authority

Prefer a new additive root such as:

```text
StudioHistoryState
  recordingStartedWeek
  nextSeq
  rows[]
  schemaVersion / formulaVersion where needed
```

A conceptual row should contain:

```text
StudioHistoryEvent
  eventId
  week
  kind
  significance
  sourceOwnerDomain
  sourceReceiptIds[]
  subjects[]
  frozenFacts
```

Reasons to prefer a new root:

- `StudioEvent` is a closed shared union across older save versions;
- P08 needs stable historical semantics and provenance, not every operational event;
- presentation seen/read state must remain separate;
- long-horizon retention can be governed independently.

Current Ops may instead evolve `StudioEventLog` only if it proves every old validator, migration, union, and consumer remains sound. Convenience is not sufficient.

### 3.3 Standing-change receipt requirement

P08A must map every authoritative Standing mutation:

- release result;
- paid publicity;
- weekly awareness drift/settling;
- any founding or other current action that changes Standing;
- future sources only through typed extensions.

A change receipt should freeze:

- before/after values;
- channel deltas;
- source kind;
- exact source IDs;
- formula/version identity;
- public driver facts;
- effective week.

Do not back-calculate old causes from current Standing.

### 3.4 History significance

Separate source facts from timeline significance.

Recommended classes:

- `landmark` — permanent defining event;
- `major` — durable material event;
- `standard` — retained but visually lighter;
- `operational` — source may remain elsewhere but does not enter the main Chronicle.

P08 owns the deterministic significance mapping. It may not alter the source event.

### 3.5 Likely current TypeScript paths

Reuse/inspect:

- `src/core/types.ts`;
- `src/core/standing.ts`;
- `src/core/tick.ts`;
- `src/core/actions.ts`;
- `src/core/publicity.ts`;
- `src/core/studioEvents.ts` or current event helpers;
- `src/core/save.ts`;
- `src/core/index.ts`;
- `ui/src/engine/adapter.ts`;
- `bridge/schema/bridge-schema.ts`;
- `bridge/session.ts`;
- generated consumer files.

Add only after exact current inspection.

### 3.6 Unity product route

Likely world owner: Administration or another already-authoritative institutional building. Current Ops must inspect the private Unity scene/presenter and select one existing owner. Do not invent an Archive building solely to host P08A.

Expected presentation:

- local building card;
- retained Standing/History workspace;
- Overview, Standing, Timeline, Films, People;
- Honors/Progression absent or explicitly future, not fake empty gameplay;
- exact film/person/facility deep links;
- `No current location` for historical subjects;
- Back restores filter, selected item, scroll, focus, and lot context.

### 3.7 P08 likely version effect

- Save bump: likely, because truthful history requires a persisted additive root.
- Projection bump: likely.
- Protocol bump: not inherently required for additive projection fields; follow current contract law.
- Schema ID: changes whenever projection/schema changes.

Do not assign numeric versions in planning; use the next accepted version at implementation.

## 4. P09 foundation reconnaissance

### 4.1 Product authority to preserve

Existing design:

- `codex/studio-growth-construction-research-09@91ed234cbf6cdc22817b792564dda22a1d7c3576`
- `docs/design/CODEX-STUDIO-GROWTH-CONSTRUCTION-PACKAGE-09.md`
- Builder Annex on the same branch.

Preserve:

- Founding Flip;
- `INITIAL_PROPERTY` as immutable migration history;
- separate bare-lot template;
- need → catalog → preview → explain → commit → watch → operate;
- TypeScript authority for legality/cost/time/capability;
- N-site presentation;
- no routine maintenance chores;
- Stage, Set, and Production remain separate.

The old document’s `SaveFileV15` references are historical planning artifacts. The live project is V16 before P08 and will likely be later after P08. Current Ops must renumber by actual accepted lineage without changing the law.

### 4.2 Required program scope

The old P09A “build one Development & Casting Office” slice was explicitly non-sealing. For this three-package marathon, P09 must reach a **self-contained technical foundation**:

1. new bare-lot regime;
2. founding activation with no hidden plant;
3. Development & Casting construction;
4. screenplay work may proceed while later plant rises;
5. Scenery capability;
6. at least one Soundstage;
7. legal Set commissioning/mount;
8. Post capability;
9. full first film through P07 result;
10. endowed/migrated saves unchanged.

This does not require every future blueprint or construction feature.

### 4.3 Existing mature systems to reuse

Inspect and extend, do not replace:

- `src/core/lot.ts` and `PropertyState`;
- `src/core/placement.ts` and `PlacementQuote`;
- facility blueprint/catalog modules;
- construction completion in `tick.ts`;
- facility engagements;
- Sets (`sets.ts`);
- operations/workflows;
- Development/Casting capacity;
- release pipeline;
- ledger/economy;
- save migrations and exact-key validators.

The current `PlacementQuote` already carries:

- blueprint ID;
- exact origin/cells;
- parcel;
- cost/opex/build weeks/completion week;
- capability/capacity delta;
- rejection list/primary reason;
- unmet requirements;
- instance count/limit.

The bridge/UI should carry that authority rather than reconstruct legality from Unity colliders.

### 4.4 Likely new authority

- immutable `foundingRegime` or equivalent additive root;
- separate `BARE_LOT_PROPERTY` authored fixture;
- generic placement quote/commit bridge commands;
- possibly additional blueprint availability needed for the minimum first-film chain;
- no Builder identity unless separately authorized.

### 4.5 P08 integration

P09 should publish exact facts. P08 decides whether/how they appear in Studio History.

Likely material history sources:

- founding completed;
- first facility committed;
- first facility completed;
- first Development/Casting capacity;
- first Soundstage/Post/Scenery capability;
- first bare-lot film release.

Do not duplicate the construction ledger inside P08.

### 4.6 Unity presentation

The existing P07/P06 lot shell now includes left People, right movie rail, and top status band. P09 should add Build without erasing that anatomy.

Required presentation:

- world Build entry and vacant-parcel entry;
- readable catalog;
- exact footprint ghost;
- valid/invalid geometry plus text reason;
- clear financial/capacity consequence;
- commit/cancel;
- persistent N-site construction body;
- completion without camera hijack;
- direct operation of completed facility.

### 4.7 P09 likely version effect

- Save bump: likely due founding regime/sparse-start history.
- Projection bump: likely due property/catalog/quote/site fields.
- Protocol bump: only if command semantics cannot remain additive under protocol 4.

## 5. P10A reconnaissance

### 5.1 Product authority to preserve

Existing design:

- `codex/stars-careers-staff-research-10@6a5d41ec233152ecbe8cc3bfc960c31514b6cded`
- product design and Builder Annex.

Preserve:

- person = stable identity;
- profession, OVR, Star Power, potential, contract, and history are separate;
- public/perceived truth only;
- work-derived development;
- routine needs absent/autonomous;
- exact current work and availability;
- history survives employment;
- decorative people remain decorative;
- P10A adds information/navigation, not a new people simulation.

### 5.2 Existing authoritative facts

Current TypeScript already owns:

- four Talent professions;
- stable Talent IDs;
- perceived/actual skill boundary;
- discipline OVR;
- estimated potential range;
- work ethic;
- per-discipline genre experience;
- Star Power (`fame` internally);
- contracts, salary, term, guarantee, renewal/release legality;
- employment states;
- active assignment/conflict;
- presence;
- frozen FilmResult participants;
- `TalentCareerEvent` history.

### 5.3 Recommended P10A implementation

Create one player-safe projection containing only authorized public facts. Unity must not receive hidden actual skills/ceilings merely to simplify display.

Expected surfaces:

- compact world person inspector;
- retained Profile;
- Roster;
- grouped contract/shortage attention;
- exact Profile ↔ Roster ↔ World routes;
- film/result/history deep links;
- honest legacy-history notices.

### 5.4 P08/P09 integration

- P08 supplies History and future Honors placement.
- P09 supplies current facility/body contexts and the new lot shell.
- P10 must not create profiles for P09 presentation-only site workers.
- Historical person links must remain available even if no body is currently present.

### 5.5 Likely version effect

- Save bump: preferably none for P10A.
- Projection bump: likely.
- Schema/consumer regeneration: required.

If implementation proposes new persisted career facts, stop and prove why existing `TalentCareerEvent`, FilmResult participants, contracts, and current state are insufficient.

## 6. Shared lot-shell convergence

The three packages must feel like one game.

Preserve the Owner’s stated target anatomy:

- left edge: authoritative people;
- right edge: active screenplay/movie/Production/results rail;
- top band: time/speed/cash;
- lot remains dominant;
- buildings provide world-native entrances;
- deep workspaces retain/restore context.

Program-specific integration:

- P08 Administration card opens Standing/History.
- P09 Build entry and parcel preview coexist with the rails rather than replacing them.
- P10 left People strip and selected-person inspector become the normal profile route.
- no package introduces a new global white-card dashboard as its primary experience.

## 7. High-collision paths

One lead owns collision-prone files at a time.

Likely shared TypeScript paths:

- `src/core/types.ts`;
- `src/core/save.ts`;
- `src/core/tick.ts`;
- `src/core/actions.ts`;
- `src/core/index.ts`;
- `ui/src/engine/adapter.ts`;
- `bridge/schema/bridge-schema.ts`;
- `bridge/session.ts`;
- generated Unity contract/manifest.

Likely shared Unity paths:

- bridge client/snapshot application;
- lot scene host;
- retained-workspace host;
- top/left/right HUD composition;
- element-map publisher;
- menu/back/focus coordinator;
- generated DTO consumer.

Package-specific implementation may use subagents only on disjoint files or read-only review lanes. No multiple writers in one checkout.

## 8. Recommended branch topology

Preferred:

```text
P07 campaign pair
  → wip/p08-p10-autonomous-stack-01-{ts,client}
      checkpoint P08 technical SHA
      checkpoint P09 technical SHA
      checkpoint P10 technical SHA
```

Advantages:

- one linear ancestry;
- no cherry-pick/merge ambiguity;
- later package directly consumes earlier code;
- campaign remains at P07 until final acceptance;
- rollback to each exact checkpoint is trivial.

Alternative per-package branches are acceptable only when they form a strict fast-forward parent chain and Current Ops records every parent/child relationship.

## 9. Test and evidence implications

Each package needs its own focused proof plus a cumulative full floor.

### P08 fixtures

- initial current Standing with no recorded history;
- release-driven three-channel change;
- publicity change;
- old save / recording start;
- same-title films;
- historical person/facility with no current location.

### P09 fixtures

- endowed migrated save;
- sparse new save;
- valid/invalid placement;
- multiple simultaneous sites;
- construction completion;
- minimum bare-lot first-film route;
- save/load mid-construction;
- same-week completions.

### P10 fixtures

- contracted person working;
- available person;
- engaged freelancer;
- unavailable/off-lot person;
- same-name people;
- legacy person with partial history;
- career event and exact film deep link;
- grouped contract attention.

### Cumulative final fixtures

- bare-lot to first film to P07 result to P08 history;
- person selected from that film and opened through P10;
- save/load/reconnect;
- both current and historical identities;
- endowed old-save regression.

## 10. 120-year performance checks

Before final technical seal measure:

- history rows and serialized bytes over 6,240 weeks;
- Standing receipt growth;
- property/placement lookup complexity;
- thousands of film/person/history links;
- profile/roster projection cost over large talent populations;
- no repeated full-ledger scan per row;
- no quadratic history projection;
- no pruning of authoritative financial/film/career history as a performance shortcut.

## 11. Open items for Current Ops

Accepted identities are resolved. The coding-agent read-only preflight must verify or enumerate:

```text
ACCEPTED_UNITY_SHA = c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6
ACCEPTED_PLAYER_SHA256 = c3372eb566304a14e599811d3e9872759c134aa703a150e17a25cc02e92ef813
FINAL_P07_CHANGED_PATHS_UNITY = ENUMERATE LOCALLY
FINAL_P07_TS_REMOTE_EQUALITY = VERIFIED AT CLOSEOUT
FINAL_P07_UNITY_REMOTE_EQUALITY = VERIFY LOCALLY
CURRENT_UNITY_LOT_HOST_PATHS
CURRENT_UNITY_ADMINISTRATION_OWNER
CURRENT_UNITY_BUILD/PREVIEW_SEAMS
CURRENT_UNITY_PERSON_PROFILE_SEAMS
```

Current Ops must confirm the recommended campaign freeze through the P08–P10 Owner test.

## 12. Reconnaissance verdict

No architecture finding prevents the autonomous stack. The program is **provisionally buildable** when current private-Unity paths/owners, local remote equality, and exact next save/projection versions are reconciled. Accepted identities themselves are already known.

Do not restart broad P08/P09/P10 research. Perform changed-path-only code reconciliation, then execute the mapped core and dependency-ready extension scope.

**CODING-AGENT ACCEPTED-BASE CHANGED-PATH AND PRIVATE-UNITY PREFLIGHT REQUIRED**

## Revision 02 full-scope control

This document is subordinate to and completed by:

- `docs/operations/P08-P10-FULL-SCOPE-TRACEABILITY-MATRIX.md` — 115 mapped requirements, zero unmapped;
- `docs/operations/P08-P10-DEFERRED-NOT-DROPPED-REGISTER.md` — every lawful deferral with owner/dependency/refresh trigger;
- `docs/operations/P08-P10-MAXIMAL-AUTONOMOUS-WAVE-PLAN.md` — core floors plus dependency-ready extension ladders;
- `docs/operations/P08-P10-SAVE-SCHEMA-PROJECTION-AND-MIGRATION-PLAN.md` — accepted V16/15 baseline and provisional package chain;
- `docs/operations/P08-P10-AUTONOMOUS-STACK-OWNER-DECISION-DOCKET.md` — decisions separated into Owner, Current Ops, engineering, private-source, and later categories.

A core checkpoint does not terminate the package automatically. The coding lead continues only through rows classified `IMPLEMENT AS READY EXTENSION` whose exact activation gate passes. Conditional, Owner-blocked, dependency-blocked, deferred, and rejected rows are not implementation authority.
