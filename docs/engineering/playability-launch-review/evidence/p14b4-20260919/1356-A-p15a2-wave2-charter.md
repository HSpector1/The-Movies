<!-- 1356-A: drafted read-only by a charter specialist at HEAD c614b7e9 from the parent's brief; the parent edits and adopts it before review 1356-B. -->

# 1356-A: P15A.2 Wave 2 charter: the quarterly Power Ranking archive, adapter, tick step and Bridge view

Parent proposal at HEAD c614b7e9, source-only; no tests were run. Every `file:line` was read at c614b7e9. Authority:
Owner ruling 2 of [1342-O](1342-O-owner-rulings-p14-p18-approved.txt) (:29-40); 1122-A D2, D3, D4a (:10-12);
[1350-A](1350-A-p15a2-power-ranking-charter.md) §3-§4 as adopted in 1350-F; 1351-F (authored films count in no
lane); 1351-F2 item 4; 1352-A §2 with 1352-F amendment 4 (one fixed-cost definition); 1353-A §3, §5.4, §10; the P15
builder annex at 2a7ff0d9 (C.2 :102-111, D.4 :238-253, D.7 :340-347, E.5 :424-434, G :524-595, M.4 :934-939, O :1028).

## 1. Scope

Wave 2 ships in two slices, so recording starts before the view's projection sweep:

| Slice | Content | Step |
|---|---|---|
| 2a | Root `powerRanking`, the state-to-facts adapter, the shared weekly fixed cost, the tick step, validation, migration | one save step, allocated at execution |
| 2b | One paged `/industry` view `powerRanking` | one projection step, allocated at execution |

Out of scope: web UI and Unity presentation, a later wave with its own design (no `ui/src` file calls `industryQuery`
or `industryPage`; 1342-O :170 keeps Unity deferred); stage values (P15B); a closure cohort (P15B Wave 4); Honors
(P08B); the Legacy dossier (P15C). Studio Charts, Standing and the chart cadence stay unchanged.

## 2. Source facts at c614b7e9

| Fact | Source |
|---|---|
| `tick()` sets `currentTick = state.market.tick` and writes `market.tick: currentTick + 1` into the final state | `tick.ts:197`, `:1077` |
| After that: scheduled rival entry, then `finishHollywoodWeek` (chart), first takes, relationships, then lifecycle intent, promises, talent market and lifecycle settlement as the last expression | `tick.ts:1118-1121`, `:1138-1143`, `:1149-1153`, `:1160` |
| The chart builds on `week%13===0 \|\| h.chart===null`; its first observation is off cadence at `originWeek+1` | `hollywoodTick.ts:456-463`; `hollywoodValidation.ts:588-591` |
| Cash still moves after the chart: talent-market signing bonuses for the player and for rivals | `talentMarket.ts:1034-1041`, `:1073` |
| A release in the tick producing W carries `releaseTick` W−1 (player and rival) | `tick.ts:629`; `hollywoodTick.ts:350`, `:389` |
| Player run: first week paid in the release tick; `completed` when `weekIndex` reaches `totalWeeks`; runs are never deleted; a migrated V3 run is `legacyCompleted`; an unengaged release is paid once with no run | `tick.ts:786-796`, `:667-672`; `types.ts:312-327` |
| Rival run: paid in the release tick too; `settledWeek` is the pre-increment week of the final payment | `hollywoodTick.ts:410-425` |
| Player fixed cost: payroll at the week, overhead and facility opex gated on `economyEngaged && founding === null`; `weeklyBurn` adds research. Rival: payroll + overhead + capacity opex, no research | `employment.ts:238-244`; `economyView.ts:46-57`, `:70-73`; `hollywood.ts:106-111` |
| Cash: player `studio.cash`; rival `account.cash`. `AuthoredFilm` has a year and no tick | `types.ts:304`; `hollywoodTypes.ts:68-73`, `:28-36` |
| `initializeHollywood` sets `originWeek` to the current tick and can run at any week through `beginFounding` (origin `migration` when tick > 0) | `hollywood.ts:158`, `:174`; `employment.ts:568-570` |
| `filmScoreTenths` is module-private; errors never echo a finance value | `powerRanking.ts:86-111` |
| Any change to a `POWER_RANKING_*` value must bump the definition; Wave 1 pins the exact values | `tuning.ts:41-51`; `tests/p15a2-power-ranking.test.ts:194-198` |
| `LIVE_SAVE_VERSION = 43`; V43 added no root; the last new-root step is V40 | `save.ts:6560`; `types.ts:2513-2536`; `worldgen.ts:809`; `save.ts:10538-10564`, `:6174-6178` |
| Bridge: view enum, nullable workspace sections, 1-50 page cap, competition rank, movement words, page notice, projection 56 | `industry-schema.ts:156-157`; `bridge/industry.ts:239-240`, `:90-94`, `:101-104`, `:243`; `bridge-schema.ts:283` |

## 3. The adapter (slice 2a)

One new module, `src/core/powerRankingArchive.ts`, holds the adapter, the fixed cost, the step and the validator.
`powerRankingInput(state)` builds the law's input at W = `state.market.tick`, with no player flag and no RNG.

| Input field | Source |
|---|---|
| `week`, `originWeek`, `baseMarketValue` | W; `hollywood.originWeek`; `market.baseMarketValue` (constant after world generation, 1350-F) |
| `studios` | identities with `enteredWeek !== null && enteredWeek <= W`, the chart's cohort rule (`hollywoodValidation.ts:595`) |
| `studios[].cash` | player `studio.cash`; rival `business.account.cash` |
| `studios[].weeklyFixedCost` | `studioWeeklyFixedCost(state, studioId)`, below |
| player film | each `studio.releasedFilms` row: `filmId = productionId`, `studioId = playerStudioId`, `releaseTick`, `criticScore`, `totalGross = boxOffice.total`, `authoredPreCampaign: false` |
| player `runEndedByWeek` | no run, or run `legacyCompleted`: true; otherwise `run.releaseTick + run.totalWeeks <= W` |
| rival live film | each `simulation/v1` row of `hollywood.films`: `releaseTick`, `criticScore`, `totalGross` from `result`; `runEndedByWeek = settledWeek !== null && settledWeek < W` |
| authored film | `authoredPreCampaign: true`, `releaseTick = (released.year − 1920) × 52` (the Bridge chronology, `bridge/industry.ts:232`), `runEndedByWeek: true`, its own critic score and gross. The law counts it in no lane (1351-F) |
| pre-origin film | a film with `releaseTick < originWeek` that is not authored is not passed |

Both run-end rules say one thing: the last payment week, `releaseTick + totalWeeks − 1`, is before W. The player's
rule uses arithmetic, not `status`, so the validator reaches the same answer years later.

**Pre-origin films.** Only the player of a migration-origin state has them; rival films before origin were never
reconstructed (`bridge/industry.ts:110`). No published window reaches before `originWeek`, so no rank moves, but
unpublished lanes would carry a fact only one side can have: 1351-F's reason for authored films.

**One weekly fixed cost.** `studioWeeklyFixedCost(state, studioId)` is exported once; P15B Wave 2 imports it (1352-A
:37-41). Player: `founding !== null ? 0 : weeklyPayroll + weeklyOverhead + weeklyFacilityOperatingCost`, which equals
`weeklyBurn − weeklyResearchSpend`. Rival: `rivalWeeklyOperatingCost(business, hollywood, W)`. Both are the charge the
next advance makes, with discretionary research excluded. A founding player with positive cash reads Thriving (1350-F).

**Privacy.** Cash and cost leave `src/core` only as the band; adapter errors echo no value (`powerRanking.ts:86-89`).

## 4. The tick step (slice 2a)

`recordPowerRankingQuarter` wraps the last expression of `tick()` (`tick.ts:1160`). When `hollywood !== null` and
`isPowerRankingWeek(W)`, it appends one record and writes nothing else; otherwise it returns the state unchanged.

Why at the end, not beside the chart (1350-A Q3): the band needs the week's final cash and contracts, and the talent
market pays signing bonuses and adds contracts after `finishHollywoodWeek` (`talentMarket.ts:1034-1041`, `:1073`);
lifecycle settlement then ends contracts. By the end, every release of the tick carries W−1 inside [W−52, W), every
run whose last payment fell in the tick reads ended, and rivals entering at W (`tick.ts:1118-1121`) join unranked.

**No off-cadence first observation.** The chart builds at `originWeek+1` so Studio Charts has rows from the first
advance. The ranking has its own "not enough history" state, so a save migrated or founded at week M takes its first
record at the first multiple of 13 above M.

**Order with siblings:** ranking, then the P15B condition step, then the P15C freeze (1353-A :100-102). The ranking
reads no condition state, and the freeze finds the week-6240 record already written.

## 5. Root and persistence (slice 2a)

```text
PowerRankingArchive = { version: 1, recordedFromWeek, snapshots: PowerRankingRecord[] }   // append-only
PowerRankingRecord  = { week, definitionVersion: 'power-ranking/v1', available, windowStartWeek, rows }
PowerRankingRecordRow = { studioId, ranked, rank: number | null, filmsTenths, releases, releasesTenths,
                          countedFilmIds /* ≤ 4 */, band }
```

A record is the law's snapshot minus three row fields: `pointsTenths`, `honors`, `distressStage`. The root is a
top-level `GameState` key (1350-A Q2), because `HollywoodState`'s exact keys run through the whole frozen chain
(`hollywoodValidation.ts:84`) and a top-level key strips in one place.

**Difference from 1350-A §4**, which stored `{studioId, filmIds, filmsTenths, releases, band}`. This record also keeps
`ranked`, `rank` and `releasesTenths`, which the law already returns, so no reader re-implements a v1 rule or reads a
`POWER_RANKING_*` constant, and a later retune cannot change how an old quarter reads. Points stay derived
(`filmsTenths + releasesTenths`); no blended score is stored (annex :253). P15C's `LegacyRankingSnapshotFact {week,
studioId, rank, band}` becomes a direct read.

**Every quarter is recorded**, including the three or four before ranks are available: the band cannot be
backfilled, and P15C's band lens counts quarters per band (1353-A :179-180). Annex C.2's "not persisted weekly"
concerns weekly writes.

**Size and retention.** A fresh campaign writes 480 records per 6,240 weeks (13 to 6240). Ten rows of JSON take about
2.8 KB with four counted films per row and 2.2 KB with two: 1.1-1.4 MB per 6,240 weeks, 2-3% of the 49.6 MB save at
week 8791 (1353-W0 §4). Stable film IDs are most of it (annex D.7 forbids array positions). Nothing is compacted.

**Validation** (`validatePowerRankingArchive`, run by the new `validateSaveV(N)` after the frozen chain):
1. Exact keys at every level; `version` 1; `recordedFromWeek` an integer in `[0, market.tick]`.
2. Cadence: with `hollywood === null`, no records. Otherwise record weeks are exactly the multiples of 13 in
   `(max(recordedFromWeek, originWeek), market.tick]`, ascending: no gap, duplicate, off-cadence or future record.
3. Definition: `power-ranking/v1` is the only member; any other refuses (annex G.3 "unknown future version").
4. Cohort: row IDs are exactly the identities entered by the record's week, each once.
5. Recompute by era: rebuild the input at the record's week from persisted facts, cash and fixed cost set to 0, and
   run the evaluator of the record's definition. Every stored field but `band` must match, row order included; `band`
   must be an enum member, since cash at W is not recoverable. Every input is frozen (critic score and gross at
   release, `settledWeek`, run length, `enteredWeek`, `originWeek`, `baseMarketValue`), and P15C Wave R pins their
   retention.

**Era versioning.** The v1 evaluator is `computePowerRanking` with today's TUNING, which Wave 1 pins by value. A
future v2 lands as a new definition with `effectiveFromWeek` (annex G.4). It keeps a frozen v1 evaluator reachable by
the validator and ships an old-law fixture: a stored v1 record that still validates after the retune.

**Migration.** `convertV(N−1)ToVN` adds `{version: 1, recordedFromWeek: market.tick, snapshots: []}` and records no
past quarter (annex G.2); a second migration is a no-op. `worldgen` seeds `recordedFromWeek: 0` (`worldgen.ts:809`).
`convertVNToV(N−1)` strips an empty archive and refuses a non-empty one by name ("cannot downgrade or discard a
recorded Power Ranking quarter"); a round trip can only claim less history, never more. The rest is the V40 pattern:
`GameStateV(N)`, `migrateToLive` (`save.ts:10138-10140`), a downgrade line per older `migrateToVxx` (as `:7414`), and
frozen builders refusing a non-empty archive (`:6174-6178`).

## 6. The Bridge view (slice 2b)

`view: 'powerRanking'` joins the enum (`industry-schema.ts:156-157`). `targetId` null opens the latest record and
`power-ranking-<W>` an archived one (annex M.4 "prior snapshots"); any other ID refuses: "That Power Ranking quarter
is not in this record." Rows page under the existing 1-50 cap. The response gains a nullable `powerRanking` section,
like `market`, null on other views and while the archive is empty; then the notice reads "Not enough comparable
history for a Power Ranking." and names the first quarter the archive will record.

```text
StudioPowerRankingPage = { snapshotId, priorSnapshotId | null, week, dateLabel, definitionVersion, windowLabel,
  available, availabilityLine | null, firstRankedLabel | null, recordingNotice | null, rankedCount, cohortCount,
  rows: StudioPowerRankingRow[] }
StudioPowerRankingRow = { studioId, name, player, ranked, rank | null, rankLabel, priorRank | null, movement,
  movementLabel, filmsTenths, films: {filmId, title, criticScore, scoreTenths}[] /* ≤ 4 */, filmsLine | null,
  releases, releasesTenths, pointsTenths, pointsLabel, honors: 'notRecorded', band, bandLabel,
  distressStage: 'notRecorded' }
```

Rules and exact copy:
- Page `notice` is the annex M.4 banner: "Power Ranking is recent comparative momentum. Studio Standing and Studio
  History are separate."
- `windowLabel` reads "<from> to <through>" with from `campaignDate(max(0, windowStartWeek))` (the calendar refuses
  negative weeks, `calendar.ts:14-16`) and through `campaignDate(W−1)`.
- Unavailable record: `availabilityLine` is "Not enough comparable history for a Power Ranking." (annex :1028). No
  row has a rank. `firstRankedLabel` names the first multiple of 13 at or after `originWeek + 52`.
- `rankLabel`: "#n of m ranked"; an unranked row in an available record reads "Ranked from <date>", the first
  multiple of 13 at or after `max(enteredWeek, originWeek) + 52`.
- `filmsLine` is "No finished release in the window." exactly when `countedFilmIds` is empty (1351-F2 item 4); a
  counted film scoring 0 shows no sentence.
- `films[]` resolves through the Industry index; `scoreTenths` is the v1 `filmScoreTenths`, exported, not copied.
- `pointsLabel` "x.x of 20 · 2 of 3 lanes recorded (Honors not recorded)" (1350-A :78); `bandLabel` In the red,
  Strained, Stable or Thriving (1350-A :93-96; `financeReport.ts:282`).
- Movement: the prior record (W−13). `unavailable` when there is none or the row is unranked; `new` when the studio
  was unranked there; `unavailable` when the ranked cohorts differ; otherwise up, down or unchanged. Labels reuse the
  Studio Charts words (`bridge/industry.ts:104`). Tied rows keep the law's studioId order.
- `recordingNotice`, when `recordedFromWeek > originWeek`: "Power Ranking recording begins <first record>. Earlier
  quarters are not reconstructed." No row carries cash, a fixed cost, weeks of cover or a gross.
- The Industry notice at `bridge/industry.ts:243` becomes "Public facts only. Standing channels and film measures have
  separate meanings. The quarterly Power Ranking is a separate comparison." Studio Charts is otherwise unchanged.

The projection step regenerates the JSON schema and sweeps pinned values (the 49→50 sweep hit 42 pins in 27 files).

## 7. Distress stage and Honors

No record stores a stage or an honors field, so switching them on rewrites nothing.
- **Stage.** Slice 2b publishes the literal `notRecorded` (no enum member before a writer exists, 1350-A :101). P15B
  Wave 2 persists condition transitions. The P15B wave that first publishes stages on the Bridge (Wave 5 in 1352-A :55,
  unless its Wave 2 charter moves it) widens this field in its own projection step: the stage at a record's week is
  the last transition at or before W, and `notRecorded` before the condition root's `recordedFromWeek`. Rivals get
  the stage text only (1122-A D3; 1352-A :111).
- **Honors** read `notRecorded` until Awards exists; then definition v2 adds the lane and v1 records keep their tag.
  **Closure:** v1 counts every entered studio. P15B Wave 4 charters a closure cohort as a new definition (annex C.2
  "archived studio"), and v1 records keep the v1 cohort.

## 8. RED list

Slice 2a (`tests/p15a2-power-ranking-archive.test.ts`):
1. `rank-adapter-player-films`: the field mapping, with `studioId = playerStudioId`.
2. `rank-adapter-run-end-parity`: same-week player and rival films with equal runs turn ended at the same W; a no-run
   release and a `legacyCompleted` run read ended.
3. `rank-adapter-authored`: `authoredPreCampaign: true`, the chronology tick, no lane moved.
4. `rank-adapter-pre-origin`: on a migration-origin state, a player film before `originWeek` counts in no lane.
5. `rank-fixed-cost-shared`: player = `weeklyBurn − weeklyResearchSpend` after founding, 0 while founding; rival =
   `rivalWeeklyOperatingCost(b, h, W)`; research moves neither.
6. `rank-adapter-owner-swap`: a player and a rival with equal cash, cost and film facts get equal rows.
7. `rank-adapter-no-leak`: probe cash and cost values appear in no archive byte and no thrown message.
8. `rank-step-cadence`: one record per produced W%13===0; none elsewhere, none at `originWeek+1`, none without
   `hollywood`.
9. `rank-step-final-facts`: a signing settled in the tick producing W is in that record's band input; each band equals
   `financialStrengthBand` over the returned state.
10. `rank-step-only-writes-archive`: with the step removed, every other root and the RNG position are byte-identical.
11. `rank-step-entrant`: a rival entering at W is in the W record, unranked.
12. `rank-root-fresh`, `rank-root-migration-empty`: worldgen seeds the root; a genuine Save(N−1) fixture upgrades to
    an empty archive at its own week; a second migration is a no-op.
13. `rank-root-downgrade`: an empty archive strips; a non-empty one refuses by name, frozen builders included.
14. `rank-validate-cadence`, `rank-validate-cohort`, `rank-validate-definition`: one leaf per refusal in §5 items 1-4.
15. `rank-validate-recompute`: each single-field tamper refuses (a lane, `rank`, `ranked`, `releases`, a film outside
    the window, a swapped film, `available`, `windowStartWeek`); another valid band passes; an unknown band refuses.
16. `rank-append-only`, `rank-round-trip`: 520 more ticks leave earlier records byte-identical; save/load keeps them.
17. `rank-bounded-harness`: the memoized natural campaign to 6240 holds 480 records of ≤ 10 rows and ≤ 4 counted
    films, and reports archive bytes and validator time.

Slice 2b (`tests/bridge-p15a2-power-ranking.test.ts`):
18. `rank-view-routes`: latest, `power-ranking-<W>`, an unknown ID refused, the paging cap, the empty archive.
19. `rank-view-unavailable`: the annex line, no rank, `firstRankedLabel`.
20. `rank-view-copy`: banner, rank label, "Ranked from", points label, window label at W=13, recording notice.
21. `rank-view-no-finished-release`: the sentence with no counted film; none for a counted film scoring 0.
22. `rank-view-movement`: prior rank only for an identical ranked cohort; `new`; `unavailable`; ties 1-1-3.
23. `rank-view-no-private-balance`: probe cash and cost values appear in no page; rival rows carry only the band.
24. `rank-view-not-recorded`: `honors` and `distressStage` are `notRecorded` everywhere; the schema admits nothing else.
25. `rank-view-film-explain`: each film is that studio's release in the window; `scoreTenths` equals the v1 score.
26. `rank-view-industry-unchanged`: Studio Charts matches the control except the new notice.
27. `rank-projection-schema`: the generated schema carries the view and section; `PROJECTION_VERSION` is the step.

## 9. Order and dependencies

- Review 1356-B, then adoption 1356-F. Slice 2a RED goes to a test author while the single writer works its queue.
- Slice 2a production waits for Wave 1's closure (1351-L is IN PROGRESS) and for Save43 (shelving) and Save44
  (relationship slice B, 1347-F :58-60) to land, which fixes N. Mint the genuine Save(N−1) fixture at that version's
  last writer before the writer moves; run the live-version sweep after the bump.
- Slice 2b follows 2a with the first projection after slice B's 57 (1347-F :62-67).
- No dependency on P15A.1 Wave 2 or P15B Wave 2; whichever reaches production first takes the next number. P15C wants
  this archive early: `recordedFromWeek` limits every save's 2040 view (1353-A :274-275).

## 10. Questions

**Owner questions: none.**
- Ruling 2 delegates formula, weights and ties; 1102-A :29 classes cadence detail as tuning. Persistence, adapter and
  view shape implement the selected model.
- The view publishes 1122-A's presentation as selected: the band beside every rank, a rival's stage plus band, Honors
  NOT RECORDED. The stage reads `notRecorded` until P15B writes one.
- A rival's quarterly band repeats the D3 disclosure over time, and P15C already adopted that lens (1353-A :179-180).
  No finance number leaves core, so "no private rival balances" holds.
- 1354-Q's open items concern closure and estates (P15B Wave 4, P16). No studio can close before then.

**For review 1356-B:** R1, storing `ranked`, `rank` and `releasesTenths` beyond 1350-A §4's row (§5). R2, recording
pre-eligibility quarters against annex C.2 (§5). R3, pre-origin player films in no lane (§3). R4, the ID
`power-ranking-<W>` against annex D.7's "no week-only identity"; the cadence rule makes it unique and the validator
refuses a duplicate. R5, `studioWeeklyFixedCost` in the new archive module rather than `economyView.ts`, which would
have to import `hollywood.ts` and risk an import cycle.
