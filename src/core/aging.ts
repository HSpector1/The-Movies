// P14C.1 — MATERIALIZED AGING. Age is DERIVED FROM PROVENANCE AND MATERIALIZED,
// never incremented independently. There is no `age++` in this module or anywhere
// else: the stored `Talent.age` is a cache of a computation over provenance and
// `market.tick`, and the save validator is what keeps that cache honest.
//
// The whole law is one formula (record 762 §1):
//
//     age(w) = floor(anchorAge + (w - anchorWeek) / 52)
//
// No stored birth week exists to disagree with it. A person aged 29.75 at their
// anchor week turns 30 thirteen weeks later, because the fraction measures progress
// SINCE the previous birthday and the time remaining is (1 - frac) * 52.
//
// NOTHING HERE DRAWS FROM THE RNG. `src/core/tick.ts:227` deserializes one shared
// stream and re-serializes it, so a single draw taken here would move every
// downstream draw in the world.
//
// STATUS: SCAFFOLD. Every export throws. This file exists so the C.1 RED fails
// because the behaviour is missing, not because a missing named export bound to
// `undefined` and an assertion passed by accident. The writer replaces it.
import type { GameState } from './types.js'

/** One person's origin. See record 762 §2 for the naming hazard: `authored_exact_week`
 * covers every person who ENTERED `state.talent` at a known week with a known exact
 * age, including worldgen's genesis population and rival hires. It is NOT
 * `Talent.authored`, which means player-created. */
export type TalentProvenanceRow =
  | { personId: string; kind: 'authored_exact_week'; ageAtEntry: number; entryWeek: number }
  | { personId: string; kind: 'legacy_age_anchor'; ageAtMigration: number; migrationWeek: number }

/** The new top-level root, on the `stripV31Root` pattern (`src/core/save.ts:8794`).
 * `due` is an ARRAY and never an object keyed by week, because `save.ts:588` sorts
 * object keys lexicographically and `"100"` would precede `"11"`. */
export type TalentProvenanceRoot = {
  boundaryWeek: number
  rows: TalentProvenanceRow[]
  due: { week: number; personIds: string[] }[]
}

const unbuilt = (name: string): never => {
  throw new Error(`aging.${name}: P14C.1 is not implemented yet (scaffold, record 762)`)
}

/** The anchor pair, read through one accessor so the two kinds derive identically. */
export function anchorOf(_row: TalentProvenanceRow): { age: number; week: number } {
  return unbuilt('anchorOf')
}

/** `floor(anchorAge + (week - anchorWeek) / 52)`, and nothing else. */
export function ageAt(_row: TalentProvenanceRow, _week: number): number {
  return unbuilt('ageAt')
}

/** The smallest `w` with `ageAt(row, w) > storedAge`, seeded by `ceil` and then
 * CORRECTED against `ageAt` itself, because a product evaluating to
 * `13.000000000000002` would otherwise leave a stored age stale for a week. */
export function nextBirthdayWeek(_row: TalentProvenanceRow, _storedAge: number): number {
  return unbuilt('nextBirthdayWeek')
}

export function provenanceRowFor(
  _personId: string, _age: number, _week: number, _kind: TalentProvenanceRow['kind'],
): TalentProvenanceRow {
  return unbuilt('provenanceRowFor')
}

export function buildTalentProvenance(
  _people: { id: string; age: number }[], _week: number, _kind: TalentProvenanceRow['kind'],
): TalentProvenanceRoot {
  return unbuilt('buildTalentProvenance')
}

/** Visits only the people `due` at or before `week`. Consumes no RNG, takes no RNG
 * argument, and is idempotent.
 *
 * It takes the week EXPLICITLY rather than reading `state.market.tick`, because the
 * one call site is the tick TAIL beside the clock advance (`src/core/tick.ts:1047-1049`)
 * and at that point the clock has not moved yet. `src/core/tick.ts:408-410` states the
 * rule in its own comment: the clock is the tick's to advance, as its last step.
 *
 * The invariant this produces, and the one the validator checks:
 * on every state the engine emits, `talent[i].age === ageAt(row_i, state.market.tick)`. */
export function materializeAges(_state: GameState, _week: number): GameState {
  return unbuilt('materializeAges')
}

/** What the five append sites call, AT THE APPEND and never at the mint call. */
export function withTalentProvenance(
  _state: GameState, _person: { id: string; age: number },
): GameState {
  return unbuilt('withTalentProvenance')
}
