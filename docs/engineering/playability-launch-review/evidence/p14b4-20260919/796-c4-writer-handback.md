# 796: P14C.4 writer handback (sim-core, sole production writer)

Role: the sim-core contract (`.claude/agents/sim-core.md`) run through a general-purpose agent, because
project roles are not registered in this session (disclosed by the parent). No delegation, no installs,
no Git writes (read-only `git` plus one `git archive HEAD src` into the session scratchpad for a byte
comparison). I did not open `/Users/zacheryspector/The-Movies-c4-red-scaffold` or any `tests/p14c4-*` file.

## 1. Result

**DONE**, subject to the test-side sweep (794 S9 to S14 and the three test strip lists of 794 §3), which the
test author owns. Every source typecheck is clean. Every remaining type error and every focused-suite
failure sits in `tests/`: an unswept version literal, a `validateSaveV34` call on what `makeSave` now
stamps, or a hand-built live state whose lifecycle root lacks `cohorts` (section 5). One C.2a assertion
changes under the swept root, as 794 §4 predicted (section 5, forecast).

Source identity: HEAD `381ef969834c1cae1c813b7a71e4fd2ee5a8d265`, which is the scaffold `bd27de93` plus
two parent commits (`37dd5d2b`, `381ef969`) that touch only `docs/`. HEAD moved twice while I worked; `src/`
never did. Tested working diff: `git diff HEAD -- src bridge ui scripts | shasum -a 256` =
`e008062fdf0dc816f06ca868c6e21052db48e9f894baced410c0ca3ef9eed1cf`, 6 files, +394/−78. Node v20.20.2.
`git status --porcelain generated/` is empty. `PROJECTION_VERSION` stays 50.

## 2. Changed paths

| path | change |
| --- | --- |
| `src/core/worldgen.ts` | `generateTalent` takes an optional exact age that replaces the drawn `talent-age` value before `buildCeilings` and `buildGenreExperience`; `generateIndustryTalent` passes it through; the scaffold throw is gone; a Scientist handed an age throws |
| `src/core/careerLifecycle.ts` | `initialCareerLifecycle` is the live V35 opener; step 3 (cohort) after settlement and intent; `isCohortWeek`, `cohortRequest`, `cohortEntrantAge`; shared `deriveCohortRequest` and `COHORT_PROFESSIONS` |
| `src/core/types.ts` | `GameState = GameStateV35` |
| `src/core/save.ts` | `LIVE_SAVE_VERSION = 35`, `LiveSaveFile = SaveFileV35`, union, dispatch, `makeSave`; `validateSaveV35`, `stripV35Cohorts`, `convertV34ToV35`, `convertV35ToV34`, `migrateToV35`, `migrateToLive`; 18 downgrade guards and 10 conversion arms gain their `35` siblings; frozen `convertV33ToV34` writes the V34 literal |
| `src/core/index.ts` | scaffold comments replaced; no new barrel names (793's surface was already exported) |
| `src/harness/roster-wall/historical-control.ts` | the hash strip refuses a root holding cohort receipts; the lift follows the live opener |

`bridge/`, `ui/` and `scripts/` needed no change: every live route already reads `LIVE_SAVE_VERSION`,
`LiveSaveFile` or `migrateToLive`, and typecheck found no literal live root in them.

## 3. Checklist against 793

1. **§3 mint primitive.** The `talent-age` stream is drawn once per person in the same order; the override
   replaces only the value used. Measured against HEAD's own `src` (extracted with `git archive`): 1,200
   `generateIndustryTalent` calls (3 seeds × 5 roles × 40 ids, with and without a name) and
   `generateWorld(seed).talent` for 3 seeds are byte-identical. With an age, only `age`, `ceilings` and
   `genreExperience` differ from the no-age draw.
2. **§4 step.** Order: 1 settlement, 2 intent, 3 cohort iff `isCohortWeek(w)`. `hollywood === null` still
   returns the same object before anything. The "nothing changed" branch now builds `settled` and falls
   through to step 3. Idempotent: a receipt for `w` already present returns the state unchanged. Entrants:
   `uniqueIdentity('person-cohort-' + w + '-' + p + '-' + n, every talent id)`, exact age from
   `cohortEntrantAge`, stored age floored, pushed onto `talent` and `freeAgents`, then
   `withTalentProvenance(next, { id, age: exact })`. One contiguous block in profession order, one receipt
   per request week, including an empty one. `rngState` is untouched.
3. **Anchor week verified.** At the tail `advanceTalentMarketWeek(advanceCareerLifecycleWeek(…))`, the
   state carries `market.tick = currentTick + 1` (`tick.ts:1074`), so `withTalentProvenance` anchors at `w`.
   Measured: every entrant row in the probes has `entryWeek === w`.
4. **`cohortRequest`.** Prefix = `state.talent` as given; active = no `retired` record with
   `retiredWeek <= w`; young = `ageAt(row, w) < 30`; `request_p = max(accepted_p − active_p, young_p ? 0 : 1)`;
   clip 32 in profession order; `clipped` = wanted minus allotted. A prefix person without a provenance row
   throws naming the id.
5. **§5 Save V35.** `validateSaveV35` checks the envelope, exact root keys (`boundaryWeek,cohorts,records`),
   each receipt's exact keys and `requested`'s exact keys, then per receipt: a cohort week, strictly after
   the previous, not after `tick`; its block after the previous block and inside `talent`; `requested`
   summing to `personIds.length`; each entrant's id at its index, profession by block position, an
   `authored_exact_week` row at `w` with entry age in [20, 32]; then the request and the clip re-derived by
   the same `deriveCohortRequest` the live step uses. Then it hands V34 the state with `cohorts` removed from
   inside the root, wrapping V34's refusal as `validateSaveV35: frozen V34 state is invalid — …`.
   `convertV35ToV34` refuses a non-empty `cohorts` before envelope validation, naming the first receipt's
   week. `migrateToV34` gains the `35` arm; `migrateToLive` routes through `migrateToV35`.
6. **Value sweep (794 S1 to S8).** `saveVersion === 35` now appears 29 times: 18 downgrade guards, 10
   conversion arms (`migrateToV26` to `migrateToV31`, `migrateToV32`, `migrateToV33`, `migrateToV34`, the
   `validateSave` dispatch), and `migrateToV35`'s own validate arm. The dispatch message reads "1 through 35".

## 4. Delegated details I settled (none changes 782 or 793 behaviour)

- **Missing receipts throw at the point of need.** The step throws `careerLifecycle: the Save V35 cohort
  receipts are missing …` only when it reaches a cohort week with a root lacking `cohorts`. Off a cohort week
  the step never reads the receipts and substitutes nothing. The C.2a precedent throws on every tick for a
  missing root; I did not, because the step needs the receipts only at a cohort week. The cost: a V34-shaped
  state ticks up to 51 weeks before it throws. One line moves the check to every tick if the parent prefers.
- **One derivation, two callers.** `deriveCohortRequest(prefix, records, rows, week)` serves the live step and
  the validator, so they cannot disagree. Youth reads `ageAt(row, w)`; 793 says "materialized age". The two
  are equal at the step by V33 condition 2. An independent derivation from stored ages and current record
  status agreed on all 24 receipts it checked (four genuine worlds, 320 weeks each).
- **Validator order follows 793 literally**: V35 checks first, V34 second. It reuses `v34Record` and `v33Row`
  to parse what it reads, so a malformed record or row is refused under their own prefixes. A consequence:
  a mutated record on a save that holds receipts can surface as a V35 re-derivation mismatch before V34
  names the record. Attribution is imperfect in that case; the save is still refused.
- **Checks beyond §7.4's letter, one line each:** a receipt's block may not start inside the previous block
  (782 R9's "unique across cohorts", stated directly), and `requested` must sum to `personIds.length`.
  The validator does not recompute each entrant's exact age from `cohortEntrantAge`; §7.4 asks only for [20, 32].
- **Provenance row check covers every prefix person**, Scientists included. V33 requires the same row.
- **Scientist with an age throws** in `generateIndustryTalent` instead of silently dropping the age.
- **Import cycle.** `careerLifecycle.ts` now imports `worldgen.ts` and `hollywood.ts`, both of which import it.
  My first draft computed `COHORT_REQUESTED_KEYS` at `save.ts` top level from `COHORT_PROFESSIONS` and crashed
  on load (`COHORT_PROFESSIONS is not iterable`); it is now the literal `'actor,craft,director,writer'`.
  Measured after the fix: each of the 96 `src/core` modules loads as the first entry of a fresh `vite-node`.
- **Surface.** `deriveCohortRequest` and `COHORT_PROFESSIONS` are exported from `careerLifecycle.ts` for
  `save.ts`; neither enters the barrel. `validateCohortReceipts` is module-private.
- **Historical strip.** `historicalHashState` refuses a root holding cohort receipts; a root with no
  `cohorts` key holds none to discard.

## 5. Commands (all on the tested diff above)

| command | exit | runtime | result |
| --- | --- | --- | --- |
| `npm run typecheck` | 2 | 36 s | 64 error lines in 13 files, all under `tests/`; 0 in `src/`. The script stops at its first `tsc`, so I ran its second half alone: |
| `./node_modules/.bin/tsc -p ui/tsconfig.json --noEmit` | 0 | 50 s | clean |
| `npm run typecheck:bridge` | 2 | 27 s | 8 error lines in 4 `tests/bridge-*` files; 0 in `src/` or `bridge/` |
| `npm run check:bridge-contract` | 0 | 2 s | schema, C# DTOs and manifest verified unchanged |
| `npm run check:bridge-contract:fixtures` | 0 | 2 s | union fixtures verified unchanged |
| `git status --porcelain generated/` | 0 | <1 s | empty |

Type error files (root): `p14c2a-consumers` 23, `p14c2a-core-lifecycle` 21, `p14c2a-save-and-settlement` 6,
`p14b4-material-evidence-core` 5, and one each in `contracts/cross-owner-refusal.contract`,
`contracts/determinism-floor.contract`, `contracts/phase-table-agreement.contract`, `legacy-parcel-ground`,
`p14b1-first-take`, `p14b1-t4-regressions`, `p14b3-reservations`, `p14b5-save-v31`, `save`. Bridge:
`bridge-p14b4-cast-class` 4, `bridge-p06-checkpoint-recovery` 2, `bridge-p14b2-trust` 1,
`bridge-p14b7-promise-waiver` 1. Kinds: TS2379 ×42, TS2345 ×22, TS2322 ×5, TS2375 ×3. Seven (the five
TS2322 and two TS2345) are `makeSave`'s `SaveFileV35` meeting a `SaveFileV34` annotation or parameter. The
other 65 are a `GameStateV34` or hand-built state lacking `cohorts` where `GameState` is required.

### Focused suites, one file each, `node_modules/.bin/vitest run <file> --minWorkers=1 --maxWorkers=1`

| file | exit | runtime | result | class |
| --- | --- | --- | --- | --- |
| `tests/p14c2a-core-lifecycle.test.ts` | 1 | 11 s | 8 failed, 5 passed | all (a) |
| `tests/p14c2a-consumers.test.ts` | 1 | 10 s | 2 failed, 15 passed | all (a) |
| `tests/p14c2a-save-and-settlement.test.ts` | 1 | 10 s | 7 failed, 3 passed | all (a) |
| `tests/worldgen.test.ts` | 0 | 10 s | 25 passed | n/a |
| `tests/p14c1-materialized-aging.test.ts` | 1 | 14 s | 5 failed, 41 passed | all (a) |
| `tests/p12-starting-world.test.ts` | 0 | 9 s | 3 passed | n/a |

(a) = unswept test-side literal or root; (b) = behaviour change or defect.

- C.2a, 17: 12 throw `the Save V35 cohort receipts are missing`. Each ticks a state built by
  `withSyntheticCareerLifecycle` / `initialSyntheticRoot` (`tests/helpers/p14c2a-fixtures.ts:76-82`, a V34
  root literal) across a cohort week (for example 832 in A1). Four hand-built roots meet `validateSaveV35`'s
  exact-key check (G1, G3, G4, G5). One is `expect(LIVE_SAVE_VERSION).toBe(34)`.
- Aging, 5: `validateSaveV34` applied to `makeSave`'s V35 (weeks 12 and 13), a tamper test reading the
  resulting "expected version 34" message, a hand-built live state without `cohorts`, and
  `LIVE_SAVE_VERSION` `toBe(34)`. The `enterRival` provenance test, which re-derives each rival hire through
  `generateIndustryTalent`, passes.

**Forecast (scratchpad copies, not `tests/`).** I copied the three C.2a files and their two helpers into the
session scratchpad and changed only the helper root (`cohorts: []` in `withSyntheticCareerLifecycle` and
`initialSyntheticRoot`). Results: core-lifecycle 13/13, consumers 17/17, save-and-settlement 4 of 10 passing.
Five of its six failures are the version-literal and V34-validator lines above. The sixth is a **(b)**,
inside 794 §4's admissible class: E1 asserts `talent.map(id)` equal before and after week 52. At week 52 the
synthetic actor retirement drops active actors to 39 (6 of them under 30), and the cohort appends `person-cohort-52-actor-0`
(receipt `{week 52, talentCountBefore 84, actor 1}`). The prefix is unchanged; E1's "nothing reordered or
deleted" intent holds, and its equality assertion needs a prefix comparison.

### Probes (session scratchpad, not committed)

- Six genuine V34 worlds (790/791), each `migrateToLive` then 110 weeks: every world opens `cohorts: []`,
  and V35 back to V34 on the empty root reproduces the original V34 export byte for byte. Receipts land
  exactly at cohort weeks and nowhere else. Every entrant is contiguous and carries an
  `authored_exact_week` row at `w` equal to `cohortEntrantAge`, with stored age its floor. Every entrant sits
  in `freeAgents` and in `hiringMarketIds`. `rngState` never moves. `makeSave` validates every 26 weeks.
  Null-hollywood: no receipt, no entrant. Downgrades with receipts refused: `convertV35ToV34`,
  `migrateToV34`, `migrateToV33`, `migrateToV26`, `migrateToV20`.
- Deep deficit (week 2600): first cohort at 2652 requests 78 before the clip, allots actor 32 and clips 46,
  matching 793 §8. The second (2704) allots 5/13/14/0 and clips 14.
- Mid-year: save at 130, reload, continue both to 320: `exportSave` byte-equal; receipts at 156, 208, 260, 312.
- A6b: the step twice at week 104 on the migrated cohort-week world returns the same object the second
  time. A V34-shaped root throws at a cohort week. A null-hollywood state returns itself.
- Validator: eleven mutations refused, each with its own message (extra root key, missing `cohorts`, extra
  receipt key, requested +1, clipped −1, off-cadence week, `talentCountBefore` +1, swapped ids, duplicate
  receipt, entrant row week −1, receipt after tick).
- Fresh `p13aGeneratedStudio` to week 1600 in 9.8 s (validated every 200 weeks): 30 receipts, talent 84 → 152,
  active writer 16 / director 13 / actor 39 / craft 14, each profession with someone under 30, listing 79.
  Under C.2a alone, 779 measured 63 of 84 retired by the same week.

## 6. Where 793/782 were ambiguous or disagreed with source

1. 793 §2 types `personIds` as `string[]`; the scaffold's `types.ts` has `readonly string[]`. Kept the scaffold.
2. "Materialized age" (793/782 §7.1) versus `ageAt(row, w)` (782 §7.4): equal at the step; one function reads
   `ageAt` for both (section 4).
3. 793 does not say what the step does with a root lacking `cohorts`. Resolved as a loud throw at a cohort week
   (section 4).
4. 793 §5 lists V35 checks "then" V34; the re-derivation reads records, talent and provenance that V34 has not
   yet validated. Kept the literal order and reused V34/V33 parsers (section 4).
5. 793 §4 names `cohortRequest` with an explicit `week` while the step reads `state.market.tick`; the step
   passes `state.market.tick`, so they cannot diverge.
6. The prompt's HEAD `bd27de93` moved twice during the session (docs only).

## 7. Open risks

1. **Blast radius (794 §4).** Every hollywood world that reaches week 52 changes `talent`, `freeAgents`, the
   hiring listing and rival staffing picks from that week on. E1 is the one measured case in the C.2a files;
   the matched pass will find the rest.
2. **Validator cost.** Per save, O(receipts × (talent + rows + records)). At week 1600 that is 30 receipts over
   about 150 people; 6,240 weeks gives about 120 receipts. Not benchmarked at the endurance horizon.
3. **`freeAgents` grows.** Unsigned entrants join 40 retired ids in the deep-deficit world; C.4 invents no
   pruning (793 §8).
4. **The demonstration (782 §7.5) is not run here.** It is the parent's acceptance step.
5. **Missing receipts throw late** (section 4, first item).

## 8. Next action

The test author sweeps `tests/` (794 S9 to S14, the three test strip lists of 794 §3, and E1's prefix
comparison). The parent then runs the independent RED against this diff, the focused suites, the matched
full pass, and the 782 §7.5 demonstration on seeds `p14c4-demo-01/02/03`. I have not run the RED.
