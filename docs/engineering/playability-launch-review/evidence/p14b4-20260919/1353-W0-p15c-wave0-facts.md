<!-- 1353-W0: P15C Wave 0 source reconnaissance by a read-only general-purpose specialist at HEAD 8e8a4e56 (re-checked at 95cdd695, docs-only moves); saved verbatim by the parent -->

# P15C Wave 0 facts: 2040 ceremony, Legacy dossier, post-2040 sandbox

Read-only recon. Branch `wip/headless-program-20260916-ts`. Brief HEAD `8e8a4e56`; HEAD moved to `95cdd695` during
the pass. `git diff --stat 8e8a4e56 95cdd695 -- src bridge ui` is empty (six docs files only), so every source
citation below holds at both. Nothing under tests/fixtures, ui/e2e, ui/public or Owner saves was read.
"pkg" = `git show 2a7ff0d9:docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md`; "annex" = its
BUILDER-ANNEX at the same commit; "roadmap" = `git show 2a7ff0d9:docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md`.

## 0. Authority in force

| Source | What it fixes for P15C |
|---|---|
| 1342-O ruling 5 (`evidence/p14b4-20260919/1342-O-owner-rulings-p14-p18-approved.txt:63-67`) | Build the 2040 ceremony and interactive Legacy dossier from recorded history and its completeness limits. Freeze the official Legacy boundary at 2040. Invent no achievements |
| 1342-O ruling 6 (`:69-75`) | Endless sandbox after the finale under the ordinary simulation, failure risk included. The 2040 snapshot stays unchanged and later history stays distinct. No immortality, no rewrite |
| 1342-O ruling 2 (`:29-40`) | Quarterly Power Ranking; Honors NOT RECORDED until Awards exists; no invented Honors, no private rival balances |
| 1342-O ruling 3 (`:42-55`) | Player can fail; the player gets "a recoverable end-of-run/history record". P15 owns distress and closure |
| 1342-O ruling 4 (`:57-61`) | No minimum studio count, no replacement rivals |
| Approval record | `1342-O-owner-rulings-p14-p18.md:1-24`: Owner approved all twelve on 2026-09-29. The .txt header still reads "DRAFT" (`:3-5`); the .md record is the approval |
| 1122-A D2/D3/D4a (`1122-A-p15-owner-presentation-decisions.md:8-12`) | Financial band beside the creative rank; rival public distress stage plus band; Honors lane NOT RECORDED until Awards |
| CODEX-P13-P15-OWNER-RULINGS §4.1 (`docs/engineering/p14-preparation-8ef5246a/CODEX-P13-P15-OWNER-RULINGS.md:295-301`) | 2040 finale from actual durable history; "exactly the final documented nonexclusive legacy-archetype model"; no single overall score |
| Same, §4.3 (`:312-317`) | Says finale presentation and post-2040 mode are open and Endless is undecided. Superseded by 1342-O rulings 5/6 (1342-O md table rows 5, 6) |
| Same, §5 (`:337`) | "post-2040 generated content" is parked P16+. Ruling 6 does not lift that |
| Horizon ruling (`docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md:16-30`) | "There is no hard calendar game-over"; continuation past 2040 permitted |
| Archetype set (roadmap §18, lines 605-625) | The eight candidates: artistic voice, audience institution, commercial engine, technology pioneer, talent foundry, resilient survivor, awards dynasty, genre specialist or reinvention studio. "Complete first authored definition set: eight archetypes maximum". Plus a separate released-film catalog lens (not an archetype) |
| Research only, not authority | `git show c5b52b4d:docs/research/p15-independent-verification-01/RECONCILIATION-02.md` §5.1 step 4 (l.250: a bankrupt studio's dossier opens early through the same P15C reducer), §5.2 (l.256-262), §7.4 (l.376: engine-level frozen boundary, separate post-2040 record set, freeze era at last authored era by default). Row 17 (l.126) says roadmap §21's Endless checklist survives |

Package parts that bind P15C: pkg §3.2 (owns "the evidence-backed 2040 Legacy interpretation and finale
presentation"), §3.4, §3.6, §11 laws 2/4/7/13/15, §12.4 lifecycle, §13.1 `legacyFinaleSnapshot`, §13.2
`LegacySnapshotId` immutable, §15.4, §18.4 ("opening the finale [is] save-neutral"), §19, §20, §21 (DECISION
tier: "2040 post-finale choice"), §22, §24 Q10-Q12; annex C.5, D.6, E.6, E.7, G.1 (persist manifest and
archetypes; derive prose), G.2 step 4, M.6, O (`legacyEvidenceIncomplete`, `finaleModeUndecided`), J "Future
separate charters: P15C finale".

## 1. Calendar and what happens at 2040

- `campaignDate(w)`: `year = 1920 + floor(w/52)`, `weekOfYear = 1 + w%52` (`src/core/calendar.ts:13-21`); policy
  `campaign-calendar-1920-52/v1` (`:2`). Week 0 = 1920 · Week 1.
- **First week of 2040 = absolute week 6240** (120×52). **Last week of 2039 = 6239** (2039 · Week 52). Weeks
  0-6239 are the "approximately 6,240 weeks" of pkg §19.
- 6240 % 13 = 0, so week 6240 is a quarterly boundary. The Studio Charts snapshot is taken on the produced week
  when `week%13===0` (`src/core/hollywoodTick.ts:408-415`). The staged Power Ranking uses the same rule
  (`1351-stage/1351-p15a2-production.patch`, `isPowerRankingWeek: week % 13 === 0`; charter
  `1350-A-p15a2-power-ranking-charter.md:60`), so the week-6240 ranking window `[6188, 6240)` is calendar 2039.
- Today, reaching 2040 does nothing. NOT FOUND: any campaign-end, max-week, clamp, stop, `gameOver` or "campaign
  complete" symbol in `src/core`, `bridge`, `ui/src` (greps for 6240/6239/2040/2039 hit only comments and the
  endurance harness).
  - `tick()` (`src/core/tick.ts:194`) advances `newTick = currentTick + 1` (`:1005`) with no upper bound.
  - The only calendar validation is `campaignDate(state.market.tick)` in the Hollywood validator
    (`src/core/hollywoodValidation.ts:74`): nonnegative safe integer only.
  - UI loop: `SIM_CAP = 520` (`ui/src/engine/adapter.ts:2632`) is a per-invocation safety guard (`:2982`,
    copy at `:3118-3119`), not a calendar stop (Horizon ruling `:28-30`).
  - Stop ladder `SimStopReason` (`adapter.ts:2567-2586`) has no calendar reason. The switch has a compile-time
    `never` guard (`:3120-3125`), so a finale stop must be added there explicitly.
  - Living-turn auto-pause class (`ui/src/lot/livingTurn.ts:97-104`): release, three reviews, releaseReview,
    cashNegative. No finale.
  - Bridge: `advanceWeek` publishes unless a studio decision is pending (`bridge/session.ts:1007-1070`).
- Last authored weeks: rival arrivals end at 2548 (1969) (`calendar.ts:3`). The technology catalogue has two
  entries, the latest milestone at week 988 (1939) (`src/core/technologyCatalogue.ts`, entries `lighting-control-01`
  and `synchronized-sound`). Screenplay supply is renewable and calendar-free (`src/core/screenplay.ts:7-12`;
  `src/core/rng.ts:60-61`). Annual cohorts continue (`careerLifecycle.cohorts`, `src/core/types.ts:2391-2400`).
  So the ordinary simulation already runs past 2040. The endurance harness pins weeks 0/3120/6240
  (`bridge/testing/c3-active-endurance-contract.ts:12`), and an R05 measurement exists at week 8791
  (`bridge/runtime-checkpoint.ts:218-219`).

## 2. Recorded-history sources a dossier could cite

Retention legend: **complete** = append-only, no pruning found; **bounded** = windowed or capped.

| Domain | Root (file:line) | Studio scope | ID | Retention / long-horizon |
|---|---|---|---|---|
| Player released films | `state.studio.releasedFilms: FilmResult[]` (`types.ts:253-276`, append `tick.ts:648`) | player | `productionId` | complete; whole array copied each tick (`tick.ts:534`). `participants`/`forecast` optional, absent on M0A/legacy films (`types.ts:269-275`) |
| Rival + authored films | `hollywood.films: IndustryFilm[]` (`hollywoodTypes.ts:28-46`; live push `hollywoodTick.ts:343-349`; authored `hollywood.ts:263`) | rivals (authored pre-1920 plus live) | `filmId` (= productionId for live) | complete. `provenance: 'authored-start/v1' \| 'simulation/v1'`. Array copied whenever a rival run is active (`hollywoodTick.ts:366`). Player films are not in this root; `bridge/industry.ts:74` merges them as `'player-record'` |
| Reception / reviews | inside `FilmResult`: `criticScore`, `criticMean/Sigma`, `segmentScores`, `reviewVariance`, `boxOffice{opening,total}` (`types.ts:253-264`); audience via `filmAudienceScore` (`bridge/industry.ts:74`) | both | film ID | complete (frozen per film) |
| Weekly box office | player `theatricalRuns[].weeklyGross` (`types.ts:316-328`) | player | `productionId` | complete; completed runs kept with status (`types.ts:315`); array copied each tick (`tick.ts:543`) |
| | rival `business.runs` | rivals | `productionId` | **dropped at settlement** (`hollywoodTick.ts:376-378`); only `studioRevenueReceived` and `settledWeek` survive on the film (`:374`) |
| Charts | `hollywood.chart`, `previousChart` (`hollywoodTypes.ts:128, 146-147`) | all entered studios: standing copy + output | week | **bounded to 2 snapshots**; no quarterly chart history |
| Standing history | player `studioHistory` `standingChanged` / `standingDriftFolded` (`types.ts:1809-1840`) | player only | `eventId` (monotonic number) | complete for milestones; routine drift folded after 52 weeks (`studioHistory.ts:45`) |
| | rival `IndustryReceipt kind:'filmReleased' {before, after}` (`hollywoodTypes.ts:113`, append `hollywoodTick.ts:355`) | rivals | `industry-event-N` | per release only; rival awareness drift has no receipt (`hollywoodTick.ts:379-380`) |
| Player studio history | `studioHistory {recordingStartedWeek, nextEventId, rows}` (`types.ts:1874-1881`); kinds `studioFounded`, `technologyMilestone`, `filmReleased`, `theatricalRunCompleted`, `facility*`, `plan*`, `careerMilestone` (`types.ts:1809-1870`) | player (engaged economy only, `studioHistory.ts` pin 5) | numeric `eventId` | complete except routine fold. `careerMilestone` is typed and validated (`save.ts:5315`) but has no producer (NOT FOUND in `src/core`) |
| Studio events | `studioEvents` (`studioEvents.ts:24-31`) | player (managed ops) | `seq` | Tier D permanent; Tier W windowed at 26 weeks (`tuning.ts:696`, `studioEvents.ts:231-239`) |
| Industry receipts | `hollywood.receipts: IndustryReceipt[]` (`hollywoodTypes.ts:108-124`) kinds: `studioEntered`, `employment` (reasons entry/renewal/replacement/expiry/termination/player-contract/existing-player-contract), `filmAnnounced` (rivals only, `1350-A:39`), `filmReleased`, `filmSettled`, `technologyAdopted`, `laboratoryCommitted`, `laboratoryOperational`, `instrumentOperational`, `researchSeatAssigned`, `researchCompleted` | mostly rivals; employment covers player contracts too | `industry-event-${n}` (`hollywoodTick.ts:43-45`) | complete; every append copies the whole array (`hollywoodTick.ts:44`, `rivalResearch.ts:78`) |
| Player cash ledger | `state.ledger` (`types.ts:380-413`) | player | row position; no row ID | complete, "never pruned" (`studioEvents.ts:43-44`). Full weekly cash timeline and peak/low are derivable (`studioRunRecap.ts:677-686`) |
| Rival finance | `business.account.periods: RivalFinancePeriod[]` (`hollywoodTypes.ts:61-73`) | rivals | `fromWeek` | complete, one period per calendar year (`hollywood.ts:41-52`); opening/closing and movements only, no intra-year peak |
| Careers / credits | player `careerEvents: TalentCareerEvent[]` (`types.ts:2547-2572`); rival `hollywood.careerEvents` (six per live film, `hollywoodValidation.ts:430-435`); `IndustryFilm.credits`; `FilmResult.participants` | both | `${filmId}:${talentId}` | complete |
| Employment intervals | `hollywood.employment` with `endedWeek` (`hollywoodTypes.ts:74-80`) | both | `contractId` | complete |
| Lifecycle / profession | `careerLifecycle` records, cohorts, `professionChanges`, `industryRetirements` (`types.ts:2378-2398, 2468-2471`); `talentProvenance` (`types.ts:2326-2345`) | industry-wide | personId / record | complete; boundary weeks recorded |
| Talent market | `talentMarket.receipts` (`types.ts:2087-2118`) | both (`studioId`) | `eventId` | no pruning found |
| Promises | `promises` with `issuerStudioId`, `outcome`, `outcomeWeek`, `evidenceRefs` (`types.ts:2179-2202`) | both | `promiseId` | retained after outcome |
| First takes | `firstTakes` + `firstTakeSubjects` (`types.ts:2135`; `firstTakeSubjects.ts:39-45`) | both | `eventId` | append-only |
| Relationships | `relationships: RelationshipEdge[]` (`types.ts:2264-2281`) | person pairs | `edgeId` | counters plus `peakTier/peakTierWeek`; driver log capped at 8 (`relationships.ts:107-109, 202`). No event history; the competitions log is planned for Save44 slice B (`1347-B-relationship-charter-review.md:29`) |
| Technology | `technology.{projects, access, adoptions, productions, equipment}` (`technologyTypes.ts:130-141`); per-week research receipts `ResearchProject.weeks` (`:26-52`); player `technologyMilestone` history rows (`technologyMilestones.ts:26-32`); rival research receipts | both | adoptionId / projectId / equipment id | complete |
| Awards / Honors | none. `blueprintRequirements.ts:68` "Awards are not part of the game yet."; `bridge/lifecycle.ts:85` and `bridge/industry.ts:248` "honors are not recorded"; history records `recordsAvailable: false` (`bridge/history.ts:497-498`) | none | NOT FOUND | none |
| Power Ranking archive | not in source; staged `src/core/powerRanking.ts` (`1351-stage/1351-p15a2-production.patch`) and proposed root `powerRanking {version, recordedFromWeek, snapshots[]}` (`1350-A:125-128`) | all | snapshot week | proposed complete (~480 snapshots per century, `1350-A:127`) |
| Market assessments | not in source; staged `src/core/sharedMarket.ts` (`1346-stage/1346-p15a1-production.patch`) | all | releaseId | root arrives with P15A.1 Wave 2 |
| Studio operating state | `StudioIdentity` has `eligibleWeek`, `enteredWeek`, `recordedFromWeek`, no status (`hollywoodTypes.ts:6-17`); exactly 10 identities (`hollywoodValidation.ts:93`) | all | `studioId` | NOT FOUND: no active/dormant/closed field |
| Newspaper | `broadcastItems` append-only, copied each tick (`tick.ts:858`) | player | item | no pruning found |
| Run recap | `studioRunRecap(state)` (`studioRunRecap.ts:558`) | player | derived | not persisted; full scans on every call (`:1-18`) |

Completeness boundaries that already exist: `studioHistory.recordingStartedWeek` (`studioHistory.ts:51-61`),
`hollywood.origin/originWeek` and per-studio `recordedFromWeek` (`hollywoodTypes.ts:16, 133-134`; migration
notice `bridge/industry.ts:110`), `technology.recordingStartedWeek/cooperationFromWeek`
(`technologyTypes.ts:132-133`), `talentProvenance.boundaryWeek`, `careerLifecycle.boundaryWeek`,
`firstTakeSubjects.cutoverOrdinal`, legacy run `economyModelVersion: 0` (`types.ts:326`).

## 3. Existing end-of-run / summary / legacy structures

- grep over `src/core`, `bridge`, `ui/src` (tests excluded): `dossier` 0, `finale` 0, `legacySnapshot` 0,
  `studioLegacy` 0, `hallOfFame` 0, `bestOf/allTime` 0, `epilogue` 0, `campaignComplete/gameOver` 0.
  `ceremony`, `endless`, `sandbox`, `lifetime`, `archive` hits are unrelated (UI formation ceremonies, the
  title word "The Endless" at `src/core/data/screenplay.ts:266`, storage "sandbox" comments). `Legacy` (784
  hits) means legacy saves or pre-D-12 paths, never a Legacy dossier.
- Existing summaries:
  - `studioRunRecap` (D-15), player only, derived, not persisted (`studioRunRecap.ts:1-18, 325-341`). It has
    inflection points (peak/lowest cash, best/worst contribution; capped at 7, `:76, 228-245`), warnings and
    `evidenceLimitations`. Screen: `ui/src/screens/StudioRunRecap.tsx:245`; mounted at `ui/src/App.tsx:418,
    4577, 4828-4834`.
  - `periodSummary` (`src/core/economyView.ts:510-529`) feeds WeeklySummary (`ui/src/App.tsx:402-403, 4792`).
  - `historyProjection` (`bridge/history.ts:113-172`): player Standing receipts, timeline, films, people.
- No lifetime/best-of records exist: `recordsNotice: 'Records need a complete comparison universe; none is
  claimed yet.'` (`bridge/history.ts:498`).
- pkg §9 (at 7811377): "no ... 2040 finale model". Still true at HEAD.

## 4. Storage and performance

Measured facts in code and docs (no fixture decompressed):
- `bridge/runtime-checkpoint.ts:218-224`: "R05 week8791 measured an exact Save receipt of 49.6 MB and a 133.5 MB
  single-save outer1"; `maxCheckpointBytes` 192 MiB, journal 512 entries / 64 MiB; "This capacity rebaseline does
  not satisfy the original save-growth target."
- `docs/engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md:181` (PERF-009): Hollywood root 37,829,874 B and film
  mean 3,146.43 B exceed targets (film ≤1.5 KB, save ≤8 MB / ≤10 MB stress); full-nine serialize+digest p95
  199.5 ms missed its 100 ms target.
- Campaign library: 256 MiB encoded, 32 records (`bridge/runtime/campaign-library.ts:15-16`); 1 GiB decoded
  (`bridge/runtime/campaign-storage-codec.ts:7`); request body ≤2 MB (`bridge/server.ts:123`).

Caps on history arrays: Tier-W studio events 26 weeks; routine Standing fold 52 weeks; relationship `recent` 8;
chart 2 snapshots. Everything else in §2 is unbounded append.

O(history) work already on hot paths (relevant to pkg §11 law 12 and §19):
- per tick: whole-array copies of `releasedFilms` (`tick.ts:534`), `theatricalRuns` (`:543`), `broadcastItems`
  (`:858`), `hollywood.films` when a rival run is active (`hollywoodTick.ts:366`); every receipt append copies
  `receipts` (`hollywoodTick.ts:44`);
- per snapshot: the full player history projection rides in every bundle (`bridge/session.ts:1536`;
  `bridge/history.ts:172`, sorts all rows `studioHistory.ts:382-383`);
- per state revision: the industry index is rebuilt once per `GameState` object (`bridge/industry.ts:46-47`).

pkg §19 and §22 limits on a frozen snapshot: finale "uses bounded indexes and one frozen manifest, not repeated
whole-save scans"; "no full-history bridge snapshot is appended to the living-lot bundle"; pages default 25,
hard max 100; manifest ≤16 domains, ≤8 archetypes, ≤12 qualifying + ≤12 contrary refs per archetype, ≤12 lens
summaries, only evidence IDs actually used, never every history ID; generated prose is derived, never persisted
(annex G.1). The current industry query caps pageSize at 50 (`bridge/industry.ts:239-240`), not 100.

## 5. Persistence facts

- `LIVE_SAVE_VERSION = 42` (`src/core/save.ts:6553`); `makeSave` stamps V42 (`:6557-6563`); `GameState =
  GameStateV42` (`src/core/types.ts:2297`).
- `migrateToLive` → `migrateToV42` (`save.ts:10089-10091`).
- Latest validator `validateSaveV42` (`save.ts:10565-10574`) validates its own widened root at era 42, then hands
  the frozen V41 chain the root projected to era 31. `convertV41ToV42` (`:10578`), lossless-or-refuse
  `convertV42ToV41` (`:10587`), `migrateToV42` (`:10595`).
- Bridge `PROJECTION_VERSION = 56` (`bridge/schema/bridge-schema.ts:283`); `SNAPSHOT_VERSION = PROJECTION_VERSION`
  (`bridge/protocol.ts:34`).
- Most recent **new-root** bump is V40 `firstTakeSubjects`. Pattern:
  1. root type added to `GameStateV40` (`types.ts:2513`); fresh worlds seed it (`worldgen.ts:809`);
  2. own exact-key validator module (`src/core/firstTakeSubjects.ts:39-45`);
  3. `validateSaveV40` via the shared chain (`save.ts:10489-10491`, `proveProfessionSave` `:10382-10396`);
  4. `convertV39ToV40` adds the empty root with an explicit cutover boundary, no backfill (`:10493-10498`);
  5. `convertV40ToV39` refuses a non-empty root by name, otherwise strips it (`:10500-10509`);
  6. `migrateToV40` chain (`:10511-10516`) and an `if (saveVersion === N)` downgrade line in every older
     `migrateToVxx` (e.g. `:10111-10113` in `migrateToV20`);
  7. frozen builders learn to strip it (`assertFrozenBuilderRetainsHollywood`, `save.ts:6167-6171`).
- Allocated order (charter `1350-A:129-131`): Save43 rival shelving, Save44 + projection 57 relationship slice B,
  then P15A.1 Wave 2 (expected Save45), then P15A.2 Wave 2 (expected Save46). P15B, if it adds roots, comes before
  or around P15C. **P15C expects Save ≥47 and projection ≥58**, allocated from live values at production.

## 6. Surfaces for a ceremony and dossier

- Bridge paged query: POST `/industry` (`bridge/server.ts:136`), `industryPage` (`bridge/industry.ts:238`), views
  `studios, studio, films, film, person, pulse, history, roster, project, employment, laboratory, plans, office,
  market, alumni` (`bridge/schema/industry-schema.ts:156-157`); pageSize 1-50. A dossier fits as a new view.
- Snapshot sections via `snapshotBuildContextFor` lazy facts (`bridge/snapshot-build-context.ts:130-160`) and the
  bundle at `bridge/session.ts:1518-1541`. Adding the dossier here would break pkg §19.
- Decision/intent path: `availableIntents` and `advanceWeek` gating (`bridge/session.ts:995-1070`); intent enum
  `bridge/schema/intent-schema.ts:7`.
- Web UI patterns: `LotRetainedWorkspace` (`ui/src/lot/LotRetainedWorkspace.tsx:47`), StudioRunRecap screen
  (above), WeeklySummary (`ui/src/screens/WeeklySummary.tsx`), FilmRecord "ARCHIVE" (`ui/src/screens/FilmRecord.tsx:74`),
  formation ceremony routing (`ui/src/App.tsx:2591-2620`), living-turn PAUSE class (`livingTurn.ts:92-104`).
- Unity presentation is outside this repo (NOT FOUND here); 1342-O `:170` keeps Unity/native deferred.

## 7. Dependencies on P15A.2 and P15B

- Package: rank snapshots and market peaks enter Legacy "only after those systems exist"; corporate transitions
  and settlements "only if P15B is approved" (pkg §22). Lenses include rivals, finance, market,
  setbacks/recoveries (pkg §15.4; annex M.6 items 3-5).
- P15A.2 → P15C: the charter names the dossier as the reason the quarterly archive must persist, because the band
  cannot be backfilled (`1350-A:125`). Each staged row carries `rank`, `filmsTenths`, `releasesTenths`,
  `countedFilmIds`, `band`, `honors: 'notRecorded'`, `distressStage: 'notRecorded'`
  (`1351-stage/1351-p15a2-production.patch`, `PowerRankingRow`). The archive `recordedFromWeek` is the migration
  week with no backfill (`1350-A:128`). The Legacy dossier is out of P15A.2 scope (`1350-A:29`).
- P15B → P15C (not chartered in the repo; no 1352+ record found): distress stage, warnings, recoveries, closures
  (pkg §13.1 `corporateConditionAssessments`/`Events`; P12 owns active/dormant/closed state, absent in code).
  Ruling 3 requires a "recoverable end-of-run/history record" for a failed player; RECONCILIATION-02 §5.1
  (research) proposes the same P15C reducer with an early trigger. With ruling 4, the 2040 cohort may hold fewer
  than ten operating studios.
- P08B Awards: absent. The "awards dynasty" archetype (roadmap §18) and the awards lens have no source.

## Facts that constrain the charter

1. Week 6240 is 2040 · Week 1; week 6239 is the last week of 2039. Week 6240 is also a chart and Power Ranking quarter boundary whose window is exactly 2039.
2. Nothing in the engine, bridge or web UI stops or flags 2040 today. The finale needs a new stop reason (the `never` guard at `adapter.ts:3120-3125` forces it), a bridge decision/intent and a living-turn pause entry.
3. The ordinary simulation already runs past 2040 (renewable screenplays, annual cohorts, measured to week 8791), so ruling 6 needs a mode fact, not new content. Post-2040 generated content remains parked in P16+.
4. No Awards or Honors exist anywhere; `recordsAvailable` is false. The awards lens and the "awards dynasty" archetype must read NOT RECORDED.
5. Player history (`studioHistory`, ledger, runs, career events) is far richer than rival history. Rivals lack Standing drift receipts, post-settlement weekly gross and chart history beyond two snapshots.
6. Quarterly comparative history exists only once the P15A.2 archive ships, and only from its `recordedFromWeek`. A campaign migrated late gets a partial ranking lens.
7. No studio operating state (active/dormant/closed) or distress record exists until P15B. Resilience, setback and recovery lenses depend on P15B.
8. The pkg §18.1/E.7 phase-order catalogue (`phaseId`/`phaseOrdinal`/`phaseOrderVersion`) does not exist in code or in the staged P15A.1/A.2 patches.
9. The manifest must be bounded (≤16 domains, ≤8 archetypes, ≤12+12 refs each, ≤12 lens summaries) and persisted. Prose is derived. Opening the finale is save-neutral.
10. The dossier must be a paged query (the `/industry` view pattern), never a snapshot section. The snapshot already carries full player history on every bundle.
11. The save is already 49.6 MB at week 8791, and several per-tick paths copy whole history arrays. Any finale build must scan once through indexes, not per view.
12. Save ≥47 and projection ≥58 are expected. The V40 `firstTakeSubjects` bump is the template for a new root, including refuse-on-downgrade when non-empty.

## Gaps the charter must decide

1. The exact freeze week: 6240 (start of 2040, after 2039 completes) or end of 2040. pkg §24 Q10 is open.
2. Films in production or still in theatrical run at the freeze: included, excluded, or listed as incomplete. Late-2039 grosses are unsettled at 6240.
3. Which of the eight roadmap archetypes ship in v1, their qualifying and contrary rules, and how an archetype with no source (awards dynasty) is shown. Owner approved the model, not the rules.
4. Whether rival studios get dossiers, or only the player's dossier with rivals as a comparison lens.
5. Ceremony form: a DECISION-tier stop (pkg §21) with a mandatory acknowledgment, or a notification. Also whether "stop" or "browse-only" stays offered beside the Endless continuation.
6. The post-2040 mode fact: its root/field, its one-time transition event, and how post-2040 history is marked "distinct" (ruling 6). Is it a separate record set or a boundary week on existing roots?
7. The early-trigger path for a player bankrupt before 2040 (ruling 3 "recoverable end-of-run/history record"): P15C reducer, P15B record, or both. It needs a P15B interface.
8. Ordering and provenance: adopt the pkg phase-order and domain-sequence law, or use existing per-root counters (`nextEventId`, `nextReceipt`, array lengths) as the source revision and high-watermark.
9. Page size: package 25/100 or the current industry cap of 50.
10. Completeness wording for migrated saves and late-recorded domains (pkg §24 Q11), reusing the existing boundary fields listed in §2.
11. Endless checklist items (roadmap §21: catalogue supply, era presentation, market normalization, awards cadence, whether new achievements exist). Decide which are satisfied by "ordinary simulation" and which are deferred.
12. Sequencing against P15B: whether P15C Wave 1 (pure reducer over the current roots, with P15B lenses NOT RECORDED) may land before P15B is chartered.
