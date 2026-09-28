# 1313-A: expansion of the 1312 ready slice — casting-competition drivers and the Inseparable expiry note

Parent draft, source-only, at HEAD 8b5bcd40, under [1312-F](1312-F-parent-relationship-adoption.md). It fixes the
mint seam, the persisted shape, the save step and the tests. No product rule beyond 1312-F is chosen here; every
number is a named hypothesis in the house style of `src/core/relationships.ts`.

## 1. Law

- **`castingCompetitionLost` (−).** When a player greenlight admits a production whose script project has a
  complete casting session, then for each cast slot whose seated person is one of that slot's two auditioned
  candidates (`CastingSlate`, `src/core/types.ts:879`), one driver on the pair (seated person, other candidate).
  A slot filled from outside its slate mints nothing for that slot. `delta = −RELATIONSHIP_COMPETITION_DELTA`
  (hypothesis 3: between the cancel driver 2 and the failure driver 5), passed through `driverGain` (Q2 open,
  identity today). `ref` = the production id, the ref every landed driver uses; idempotent by (edge, kind, ref).
- **`repeatedCompetition` (− small, capped).** On the same write, when the pair's exact competition counter after
  the increment is n ≥ 2: `delta = −min(n − 1, RELATIONSHIP_COMPETITION_REPEAT_CAP)` (hypothesis 2), the mirror of
  the landed `repeatedCollaboration` accelerator.
- **Edges.** A competition may create a pair's first edge (two strangers who auditioned for one slot): `newEdge`
  gains a first-driver-kind branch with `sharedProductions: 0`, `firstSharedWeek` = the greenlight week. No landed
  invariant requires `sharedProductions ≥ 1`; the release/cancel drivers already guard on `take.week ≥
  firstSharedWeek`, which still holds for a later shared take.
- **Tier rule.** Unchanged (`RELATIONSHIP_RULES_VERSION` stays 1): Enemies and Nemeses still need a conflict
  record (D-1312-1 open), so a pair driven below 31 reads Strained. Competition alone reaches Strained after two
  competitions from the baseline (50 − 3 = 47, then 47 − 3 − 1 = 43 < 45).
- **Seam.** Synchronously in `applyGreenlightScriptProjectNow` (`src/core/actions.ts:2392-2399`), right after its
  `applyGreenlight` call admits the production: every managed greenlight reaches it, direct
  (`applyGreenlightScriptProject`, `:2333`, `:2379`) or queue-admitted (`:1794`). One pure helper
  `recordCastingCompetition(state, studioId, production, projectId)` in `relationships.ts`, on the
  `recordCancelledAfterFirstTake` precedent (`actions.ts:592-599`), finds the session with
  `castingSessionForProject`; the header check that the session is complete is `requireGreenlightHeader`
  (`src/core/productionAdmission.ts:98-148`). An unmanaged greenlight has no script project or session and mints
  nothing. No RNG, no reservation, no charge.
- **Symmetry.** Rivals hold no casting session; no rival edge is minted (1312-F amendment 1).
- **Copy.** `DRIVER_COPY` gains the two kinds ("competed for the same role", "competed again"); `pairChemistry`
  reasons are free strings on the Bridge (`bridge/relationships.ts:221,256`), so no DTO changes.

## 2. The Inseparable expiry note

`financeUpcoming` (`bridge/finance-upcoming.ts`) appends to the existing `contractExpiry` row's `detail` one
sentence per Inseparable counterpart on the player's roster at the expiry week, in roster order, e.g. "Mae Dunn
works here and is Inseparable with them; letting the contract lapse separates them." The tier is read with the
landed `tiersOnRoster`/`currentTier` at the row's week. `detail` is existing free text, so the projection does not
move. Partners joins this sentence when the romance track lands.

## 3. Persistence: Save42

- `RelationshipDriverKind` and `RELATIONSHIP_DRIVER_KINDS` gain the two kinds; `RelationshipEdge` gains
  `sharedCompetitions` (exact, never compacted; `sharedCompetitions ≥ 0`).
- `validateRelationshipsRoot(state, era)`: era 31 (default, every frozen reader) keeps today's keys and five kinds;
  era 42 requires `sharedCompetitions` and admits the seven kinds.
- `validateSaveV42` validates its own relationships root at era 42, then hands the frozen V41 chain the root
  projected to era 31: `sharedCompetitions` dropped and the two new kinds removed from each `recent`. The V31
  checks that remain (counters, weeks, cap, catalogue) hold on the projection by construction. No era flag is
  threaded through V19–V41.
- `convertV41ToV42` adds `sharedCompetitions: 0` to every edge; nothing else. `convertV42ToV41` validates first and
  refuses by name when any edge has `sharedCompetitions > 0` or holds a new-kind driver; otherwise it drops the
  zero counter. A `saveVersion === 42` arm joins every `migrateToVk`; dispatcher, `LIVE_SAVE_VERSION`, `makeSave`,
  `migrateToLive`, types and exports follow the Save41 step exactly.
- Genuine outgoing Save41 inputs are minted at the last Save41 writer, before the writer moves, from routes that
  carry real relationship edges and a completed player casting session.

## 4. Tests (RED first, test-author)

1. A generated world driven through a real casting session and greenlight: one `castingCompetitionLost` driver per
   slot whose holder came from its slate, on the right pair, with `ref` = production id; none for an off-slate slot;
   `sharedCompetitions` counts; the second competition of a pair adds `repeatedCompetition`; `rngState` unchanged;
   the edge reaches Strained and never Enemies; a queue-admitted greenlight mints the same.
2. No rival edge carries either kind across a bounded natural run.
3. The expiry row's `detail` names an Inseparable roster counterpart and says nothing for a lower tier.
4. Save42: fresh V42 validates; genuine V41 migrates by adding zero counters only; every frozen reader admits its
   own version; 42→41 lossless without competitions and refused by name after one; forged counters or a new kind
   under a V41 envelope are refused.

## 5. Order and ownership

After the 1309 sweep and broad rerun: 1313-B review of this draft; the Save41 outgoing producer (parent draft,
independent review, one recorded run); RED staging (test-author) and review; parent production; GREEN; a Save42
pin sweep folded into one reviewed patch. Unity/native and Owner access stay deferred.
