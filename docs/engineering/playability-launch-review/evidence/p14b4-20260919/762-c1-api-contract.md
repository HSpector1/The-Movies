# 762 — the P14C.1 API contract, pinned before the RED and the writer start

Both specialists work from this file. It exists so the RED and the implementation cannot disagree
about a name, a field or an ordering, and so the RED fails because the behaviour is missing rather
than because an import resolved to `undefined`.

Source of law: expansion `758` as amended by its §9 (audit 759-C) and §10 (the Owner directive of
2026-09-24). Where this file and the expansion differ, this file is the later decision and says so.

## 1. The derivation, one formula

```
age(w) = floor(anchorAge + (w - anchorWeek) / 52)
```

There is no stored birth week to disagree with it. Every other quantity derives from it.

The Owner's case: `29.75 + 13/52 = 30.0`, floor 30, at exactly `anchorWeek + 13`. The corpus fixture
`genuine-v32-authored` carries that person and its provenance carries the predicted week, committed
at `ace2773a` before this contract existed.

## 2. State

A new top-level `GameState` root, `talentProvenance`, on the `stripV31Root` pattern
(`src/core/save.ts:8794`).

```ts
export type TalentProvenanceRow =
  | { personId: string; kind: 'authored_exact_week'; ageAtEntry: number; entryWeek: number }
  | { personId: string; kind: 'legacy_age_anchor'; ageAtMigration: number; migrationWeek: number }

export type TalentProvenanceRoot = {
  boundaryWeek: number                                  // market.tick when the root was created
  rows: TalentProvenanceRow[]                           // exactly one per state.talent id
  due: { week: number; personIds: string[] }[]          // ASCENDING by week, the visit list
}
```

**A naming hazard, recorded rather than renamed.** `authored_exact_week` is the companion's own kind
name and is kept, so this slice deviates from the specification in no name. It covers every person
who ENTERED `state.talent` at a known week with a known exact age, which includes worldgen's genesis
population and rival hires. It is **not** `Talent.authored`, which in this codebase means
player-created. A reader who conflates the two will misread the root.

**`due` is an ARRAY, never an object keyed by week.** `src/core/save.ts:588` sorts object keys
lexicographically, so `"100"` would precede `"11"` (759-C amendment 14).

**`due` is a cache and the validator keeps it honest.** It is fully recomputable from `rows` and
`market.tick`, and the validator recomputes it and refuses a mismatch. A cache in a save file that
nothing reconciles is the truth-loss class A8 closed; this one is reconciled.

## 3. `src/core/aging.ts`, the new module

```ts
export function anchorOf(row: TalentProvenanceRow): { age: number; week: number }
export function ageAt(row: TalentProvenanceRow, week: number): number
export function nextBirthdayWeek(row: TalentProvenanceRow, storedAge: number): number
export function provenanceRowFor(personId: string, age: number, week: number): TalentProvenanceRow
export function buildTalentProvenance(
  people: { id: string; age: number }[], week: number, kind: TalentProvenanceRow['kind'],
): TalentProvenanceRoot
export function materializeAges(state: GameState): GameState
export function withTalentProvenance(state: GameState, person: { id: string; age: number }): GameState
```

**`ageAt`** is the formula in §1 and nothing else.

**`nextBirthdayWeek`** returns the smallest `w` with `ageAt(row, w) > storedAge`. It SEEDS with
`anchorWeek + ceil((storedAge + 1 - anchorAge) * 52)` and then steps by at most one in each direction
until `ageAt(row, w - 1) === storedAge` and `ageAt(row, w) === storedAge + 1`. The correction is not
decoration: a neighbouring anchor whose product evaluates to `13.000000000000002` would ceil to 14
and leave a stored age stale for a week, with every reader including `isProven` reading the stale
value. **Successive birthdays are recomputed from the anchor, never by adding 52.**

**`materializeAges(state)`** visits only the people in `due` whose week is `state.market.tick` or
earlier, writes `ageAt(row, tick)` onto each, and rebuilds their `due` entries. **It consumes no RNG
and takes no RNG argument.** It is idempotent: calling it twice on the same state returns an equal
state.

**`withTalentProvenance`** is what the five append sites call. It appends one row and inserts the
person into `due`.

## 4. The five append sites, each writing provenance AT THE APPEND

`worldgen.ts:544` · `hollywood.ts:223` (`enterRival`) · `hollywoodTick.ts:142` (`staff()` supply) ·
`actions.ts:826` (`withCreatedTalent`) · `actions.ts:2842` (`recruitScientist`).

Never at the mint call. `hollywoodTick.ts:136-142` mints at `:138`, checks affordability at `:141`
and `continue`s, so provenance written inside a shared mint primitive records one dead row per
unaffordable rival hire per week, forever, in a save validated on every load (759-C amendment 3).

## 5. Ordering inside the tick

`materializeAges` runs after `market.tick` advances and **before any consumer of `talent.age` runs in
that week**. The binding consequence: a person whose birthday falls in week `w` is already the new
age when week `w`'s talent market reads `isProven`.

## 6. Save V33

`LIVE_SAVE_VERSION = 33`. `SaveFileV33`, `GameStateV33`, `validateSaveV33`, `convertV32ToV33`,
`convertV33ToV32`, `migrateToV33`, `stripV33Root`, and the `save.saveVersion === 33` arm on every
`migrateToVn`. `makeSave` stamps 33.

**`validateTalentProvenanceRoot` checks five things:**

1. exactly one row per `state.talent` id, and no row naming a person who is not there
2. `talent[i].age === ageAt(row_i, market.tick)` for every person, which is what keeps the
   materialized age honest against its provenance
3. `due` equals the recomputation from `rows` and the stored ages, exactly, including order
4. `boundaryWeek <= market.tick`, and every anchor week `<= market.tick`
5. no anchor week earlier than `boundaryWeek` for a `legacy_age_anchor` row

**`convertV32ToV33`** sets `boundaryWeek = state.market.tick`, writes one `legacy_age_anchor` per
person with `ageAtMigration` holding **the original float, unrounded**, then FLOORS each
`talent[i].age`. That first flooring is Trap 1's value-shape change and it is the migration's
visible cost.

**`convertV33ToV32` is permitted exactly when `market.tick === boundaryWeek` and every row is
`legacy_age_anchor`**, and refused otherwise. Under that predicate it restores each
`ageAtMigration` into `talent[i].age` and strips the root, which recovers the exact V32 bytes.

Directive 3 makes the test explicit: **matching the older file shape is insufficient.** The RED
asserts the round trip `V32 bytes -> V33 -> V32 bytes` is **byte-identical** on every corpus fixture,
and that a world ticked one week past the boundary is REFUSED rather than silently approximated.

## 7. Bridge

No projection bump. No wire shape moves and `apparentAge` is withheld, per 759-C amendment 6's
confirmation of the expansion's hypothesis. `bridge/runtime-checkpoint.ts:461,476-477,479-481` still
hard-codes V32 and moves to 33. `StudioPersonProfileSnapshot.age` stays declared `number` even though
it becomes integer-valued, because tightening it would mint a new schema identity and force a bump
this slice does not need (759-C §5).

## 8. What C.1 does not build

`apparentAge` is a declared seam with no adjustment mechanism. No retirement, no announcement, no
extension, no profession transition, no alumni, no cohort scheduler, no age-driven decay.

**Disclosed:** C.1 ships aging without retirement, so the endurance horizon produces working
150-year-olds. Both consumers floor (`ageFactor` at 0.85 from 56, `ageRunwayMult` at 0.35 from 60),
so nothing breaks numerically. §6.2 owns the fix; C.1 owns the disclosure.

---

## 9. Two contract assumptions verified against source, and one narrowed

**`due` must be an array: CONFIRMED.** `src/core/save.ts:589` is `Object.keys(obj).sort()`, a
lexicographic sort in the serializer itself, so an object keyed by week really would order `"100"`
before `"11"`.

**The `enterRival` append site is narrower than record 760 described, and the writer needs the
narrower reading.** `src/core/hollywood.ts:223` (`talent.push(person)`) sits inside `if (!person)`,
reached only when no reusable free agent exists, and the `Math.max(28, …)` raise at `:221` sits
inside a further `if (authored)`, where that flag means "built from a scripted rival template" and is
NOT `Talent.authored`. Consequences for §4:

- A rival hire that REUSES an existing person appends nothing and must write NO provenance row.
  Writing one per hire would violate condition 1 on the second hire of the same person.
- Provenance must capture the age as it is AT THE APPEND, after any raise, not as drawn.
- `enterRival` pushes into a LOCAL `talent` array copy and commits it later. The provenance write
  must follow the same commit, not a separate path that can diverge from it.
