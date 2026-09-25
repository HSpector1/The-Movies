# 793 — P14C.4 API contract (the RED and the sole writer both work from this; amended only by a later record)

Final after review 782-A2 (REFINE, acted on in 782 §8). It pins names, shapes, placement and order so the RED fails on
missing BEHAVIOUR, never on a missing export. Behaviour is 782 as amended by §6 and §7. The parent ships a
SCAFFOLD after the T0 corpus (790/791, published at `95b981eb`): every new export throws
`not implemented (P14C.4)`, `generateIndustryTalent` throws when handed an age, and the types and tuning
land in it. The scaffold does NOT move `GameState`, `LiveSaveFile`, `LIVE_SAVE_VERSION` or `initialCareerLifecycle`;
the writer does.

## 1. Tuning (`src/core/tuning.ts`, all PROVISIONAL TUNING)

```ts
COHORT_ACCEPTED_POPULATION: { actor: 40, director: 14, writer: 16, craft: 14 }, // 792: fresh-founding composition
COHORT_MAX_PER_REQUEST: 32,                                                   // companion §6.5 hard maximum
COHORT_ENTRANT_AGE: { mean: 24, sd: 3, lo: 20, hi: 32 },                       // 782 R5
COHORT_YOUTH_BELOW_AGE: 30,                                                   // 782 §7.1 floor; the same 30 `isProven` reads
COHORT_REQUEST_WEEKS: 52,                                                     // 782 R2 cadence
```

## 2. Types (`src/core/types.ts`)

```ts
export type CohortReceipt = {
  week: number                                   // w % 52 === 0, w > 0
  talentCountBefore: number                      // state.talent.length when the request was computed
  requested: Record<FilmCreativeRole, number>    // after the clip; sums to personIds.length
  clipped: number                                // requested before the clip minus after, >= 0
  personIds: string[]                            // = state.talent.slice(talentCountBefore, +n).map(id)
}
// CareerLifecycleRoot keeps its name and its V34 shape (no rename; fewer sites move)
export type CareerLifecycleRootV35 = CareerLifecycleRoot & { cohorts: readonly CohortReceipt[] }
export type GameStateV35 = Omit<GameStateV34, 'careerLifecycle'> & { careerLifecycle: CareerLifecycleRootV35 }
export type GameState = GameStateV35   // the WRITER moves this
```
`GameStateV34` keeps `CareerLifecycleRoot`, so the frozen V34 chain never learns the new key.
`initialCareerLifecycle` returns `CareerLifecycleRootV35` once the writer lands (§5).

## 3. The mint primitive (`src/core/worldgen.ts`, 782-A amendment 1)

`generateIndustryTalent(seed, id, role, name?, age?)`. `age`, when given, is the EXACT (fractional) entrant
age, and it replaces the drawn `talent-age` value BEFORE `buildCeilings` and `buildGenreExperience` read it.
The `talent-age` stream is still drawn exactly once per person in the same order, so every existing caller
(no `age`) is byte-identical. Scientists keep their own path; C.4 never mints one.

## 4. Module surface (`src/core/careerLifecycle.ts`, pure, no module state)

| export | contract |
| --- | --- |
| `isCohortWeek(week)` | `week > 0 && week % COHORT_REQUEST_WEEKS === 0` |
| `cohortRequest(state, week)` | `{ requested, clipped, talentCountBefore }` per 782 §7.1 from `state` AS GIVEN (the caller passes the post-settlement state). Throws if a prefix person lacks a provenance row |
| `cohortEntrantAge(seed, personId)` | `stream(seed, 'worldgen', 'p14c4-cohort-age/v1:' + personId).truncatedNormal(24, 3, 20, 32)`, exact |
| `advanceCareerLifecycleWeek(state, birthdays)` | unchanged signature. Order becomes: 1 settlement, 2 intent, 3 **cohort** iff `isCohortWeek(w)` (and still nothing at all when `hollywood === null`) |

The cohort step at week `w`: compute `cohortRequest` on the post-intent state. For each film profession in the
order actor, director, writer, craft, and `n` from 0 up to `requested[p]`:
`id = uniqueIdentity('person-cohort-' + w + '-' + p + '-' + n, every id in state.talent)` (`hollywood.ts:27`);
`exact = cohortEntrantAge(state.seed, id)`; `person = { ...generateIndustryTalent(state.seed, id, p, undefined, exact), age: Math.floor(exact) }`;
append to `state.talent`; `withTalentProvenance(state, { id, age: exact })` anchors it at `w`; push `id` onto
`state.freeAgents`. Then append ONE receipt, including when every count is 0. No RNG outside those
per-person streams; `rngState` is untouched.

Identity note: ids are minted in profession order, so the request's `personIds` are that order too.

Idempotence (C.2a's A6b calls the step twice directly): the cohort step does nothing when a receipt for week
`w` already exists. The step's early "nothing changed" return must not skip the cohort.

## 5. Save V35 (`src/core/save.ts`, the C.2a pattern one step on)

- `LIVE_SAVE_VERSION = 35`; `LiveSaveFile = SaveFileV35`; `migrateToLive` → `migrateToV35`.
- `validateSaveV35`: exact keys on the root (`boundaryWeek,cohorts,records`) and on each receipt; the 782 §7.4
  re-derivation per receipt; strictly increasing cohort weeks; then hand V34 the state with `cohorts` REMOVED
  from inside the root (`stripV35Cohorts`).
- `initialCareerLifecycle(week)` becomes the LIVE opener `{ boundaryWeek: week, records: [], cohorts: [] }`
  (worldgen and the live lift call it). The FROZEN `convertV33ToV34` stops calling it and writes the V34 literal
  `{ boundaryWeek, records: [] }` (794 S7).
- `convertV34ToV35` adds `cohorts: []`. `convertV35ToV34` is lossless iff `cohorts` is empty; otherwise it is
  refused as a DOWNGRADE before envelope validation, naming the first receipt's week.
- Every `=== 34` guard and conversion arm gains its `35` sibling (776 generalisation: enumerate root-strip and
  version-dispatch lists, never find them by value).

## 6. Consumers

None changes behaviour: entrants flow through `state.talent`, `state.freeAgents` and provenance, which every
listing, the market and rival staffing already read. Record 782 §5's tests pin that they appear (a free
agent is listed first by `hiringMarketIds`). Projection 50 is expected to stay unmoved; the writer measures
`git status generated/`.

## 7. What the RED must not assume

It must not assume completeness validation (782 §7.4 excludes it), a Scientist cohort, era-dependent ages
(782 R5), or any change to C.2a's intent rule for entrants. An entrant cannot announce idle until its
provenance anchor is 104 weeks old (773 D3a).

## 8. Facts from T0 (790/791) and review 782-A2 that the RED and writer must hold

- `state.talent` stayed append-only and order-preserving across every measured continuation
  (`appendOnlyFromSave.prefixMatches` on all six worlds).
- `hiringMarketIds` is NOT gated on `hollywood === null` (a null-hollywood world lists 8 rows). That is
  pre-existing and is not C.4's to change; C.4 adds no cohort there, because the lifecycle step returns first.
- A solvent rival's `staff()` scans `state.talent`, so it may hire an entrant on the next tick. That is
  lawful; tests pin that the entrant is hireable, not that it stays free (782 §8.5).
- `state.freeAgents` is never pruned: the deep-deficit world holds 40 retired ids among 43 free agents. C.4
  pushes entrants onto it and invents no pruning.
- Natural clip: `genuine-v34-c4-deep-deficit` (week 2600, 6 active) requests 78 before the clip at its first
  cohort week, so the clip and its receipt are tested on a genuine world, not an authored one.

## 9. Amendment for 782 §9 (after demonstration run 1 FAILED, record 799)

- `deriveCohortRequest`: `young_p` is true iff some active prefix person of `p` has
  `ageAt(row, week + TUNING.COHORT_REQUEST_WEEKS) < TUNING.COHORT_YOUTH_BELOW_AGE`. The live step and the
  validator share it, as before.
- `TUNING.COHORT_ENTRANT_AGE.hi`: 32 → **29**. `cohortEntrantAge` is unchanged otherwise. The validator's
  entrant age bound becomes [20, 29].
- Nothing else moves: names, receipt shape, order, idempotence and the save.
