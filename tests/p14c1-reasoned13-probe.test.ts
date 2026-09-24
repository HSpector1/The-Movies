// P14C.1 REASONED-13 PROBE — measurement only, ASSERTS NOTHING about the product.
//
// Record 768 attributed 80 failures. 48 landed as `approved_behavioral_change`, and
// 13 of those carried confidence `reasoned` rather than `measured`, because my own
// read-only rule let the attribution agents RUN test files but never print an
// intermediate value. Current Ops' correction is right: read-only should protect the
// SOURCE, not prevent collecting evidence. No expectation moves on a reasoned
// attribution, so this probe measures the one chain all 13 share.
//
// THE CLAIM UNDER TEST, quoted from the attribution:
//   `person-studio-bc14baf6-r01-4` and `-r01-2`, minted by `enterRival` at week 0 with
//   a drawn age under 30, cross 30 under materialized aging; `isProven`
//   (talentMarket.ts:690) flips; `authorRivalPromise` (:1325) then offers a proven
//   person only APPEARANCE_COUNT instead of the tagged LEAD_OR_SIGNIFICANT_ROLE_COUNT;
//   `promiseCastSlots` returns a different mask; and the seating expectations move.
//
// This file prints the anchors, the stored ages week by week, the exact crossing week,
// and `isProven` either side of it. It asserts nothing and writes no artifact.
//
// STRAY-PROBE DISCIPLINE (record 726): run ALONE by positional filename, never inside a
// suite pass, then archived and removed. One `it` that only prints.
import { it } from 'vitest'
import { tick } from '../src/core/index.js'
import { ageAt } from '../src/core/aging.js'
import type { GameState, TalentProvenanceRow } from '../src/core/types.js'
import { p13aGeneratedStudio } from './helpers/p14b2-fixtures.js'

const SEED = 'seed-b'
const SUBJECTS = ['person-studio-bc14baf6-r01-4', 'person-studio-bc14baf6-r01-2'] as const
const WITNESS_WEEK = 211

/** `isProven`'s exact predicate, copied rather than imported: it is not exported, and a
 * probe that reimplements it wrongly would be worse than no probe. Source of truth is
 * `src/core/talentMarket.ts:690-692`. */
function provenParts(state: GameState, talentId: string) {
  const person = state.talent.find((t) => t.id === talentId)
  if (person === undefined) return null
  return { age: person.age, byAge: person.age >= 30 }
}

function rowOf(state: GameState, personId: string): TalentProvenanceRow | undefined {
  return state.talentProvenance.rows.find((r) => r.personId === personId)
}

it('MEASURES the one chain all 13 reasoned cases share', () => {
  let state = p13aGeneratedStudio(SEED)

  const atEntry = SUBJECTS.map((id) => {
    const row = rowOf(state, id)
    const person = state.talent.find((t) => t.id === id)
    return {
      id,
      presentAtWeek0: person !== undefined,
      storedAgeAtWeek0: person?.age ?? null,
      provenance: row === undefined ? null : {
        kind: row.kind,
        anchorAge: row.kind === 'authored_exact_week' ? row.ageAtEntry : row.ageAtMigration,
        anchorWeek: row.kind === 'authored_exact_week' ? row.entryWeek : row.migrationWeek,
      },
      // The crossing week DERIVED from the anchor, before any ticking, so the measured
      // week below can be checked against the law rather than only reported.
      derivedCrossingWeek: row === undefined ? null : (() => {
        for (let w = 0; w <= 400; w++) if (ageAt(row, w) >= 30) return w
        return null
      })(),
    }
  })

  // Walk to the witness week, recording the exact tick at which each subject's STORED
  // age first reaches 30 — the observable the market actually reads.
  const crossedAt = new Map<string, number | null>(SUBJECTS.map((id) => [id, null]))
  const trace: unknown[] = []
  for (let w = 0; w < WITNESS_WEEK; w++) {
    state = tick(state)
    for (const id of SUBJECTS) {
      const parts = provenParts(state, id)
      if (parts === null) continue
      if (crossedAt.get(id) === null && parts.byAge) {
        crossedAt.set(id, state.market.tick)
        trace.push({ id, crossedAtWeek: state.market.tick, storedAge: parts.age })
      }
    }
  }

  const atWitness = SUBJECTS.map((id) => {
    const parts = provenParts(state, id)
    const row = rowOf(state, id)
    return {
      id,
      week: state.market.tick,
      storedAge: parts?.age ?? null,
      ageOver30: parts?.byAge ?? null,
      lawSaysAge: row === undefined ? null : ageAt(row, state.market.tick),
      // The invariant every emitted state must satisfy; if this is false the probe has
      // found something far more important than the 13 classifications.
      storedAgreesWithLaw: row === undefined || parts === null
        ? null : parts.age === ageAt(row, state.market.tick),
    }
  })

  console.log(JSON.stringify({
    seed: SEED,
    witnessWeek: WITNESS_WEEK,
    atEntry,
    measuredCrossings: trace,
    crossedAt: Object.fromEntries(crossedAt),
    atWitness,
    populationAtWitness: state.talent.length,
    unprovenCapableAtWitness: state.talent.filter((t) => t.age < 30).length,
  }, null, 2))
}, 900_000)
