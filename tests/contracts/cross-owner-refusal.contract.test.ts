// ── C2a-M0 · THE CROSS-OWNER REFUSAL, PROVEN NON-VACUOUS ────────────────────
//
// CHARTER (r3.2 §3.2): "Billing: the allocation paths are already cross-owner
// aware, so the new fail-closed invariant is DEFENSE-IN-DEPTH plus the extension
// point Sets need. M0 discipline: behaviour-identical on every legal state
// (replay + save byte-identity on the sealed fixture corpus); THE NEW
// CROSS-OWNER REFUSAL PROVEN NON-VACUOUS ON A FORGED FIXTURE."
// §12-M0 gate, verbatim: "the cross-owner refusal proven non-vacuous on a forged
// fixture".
//
// WHY A FORGERY. A refusal that no legal play can reach is untestable from the
// outside and indistinguishable from a refusal that does not exist. The engine
// will not overbook a slot on purpose, so the only way to put two owners on one
// slot is to write it — which is also the only way a pre-fix or hand-edited save
// gets there in the wild. This is the `tests/legacy-parcel-ground.test.ts` idiom
// (§E, "the forgery a pre-fix session could genuinely have written to disk").
//
// EVERY forgery below is a ONE-FIELD edit of a save that VALIDATES, and the test
// proves the legal twin is byte-identical apart from that field. The refusal is
// therefore caused by the collision and nothing else.

import { describe, expect, it } from 'vitest'

import { applyActions, exportSave, importSave, makeSave, stableStringify, tick, validateSaveV16 } from '../../src/core/index.js'
import type { GameState, SaveFileV16 } from '../../src/core/index.js'
import {
  auditionSlate,
  availableConceptId,
  availableWriterId,
  clone,
  commissionPayload,
  greenlightPayload,
  managedStudio,
  withCash,
} from './_contractFixtures.js'

function commission(state: GameState): GameState {
  return applyActions(state, [
    {
      kind: 'commissionScript',
      project: commissionPayload(state, availableConceptId(state), availableWriterId(state)),
    },
  ])
}

/** A picture holding one Development & Casting slot, a screenplay holding the other. */
function productionBesideScreenplay(seed: string): GameState {
  let state = commission(withCash(managedStudio(seed), 50_000_000))
  const first = state.scriptDevelopment.projects[0]!.id
  state = tick(state)
  state = applyActions(state, [{ kind: 'acceptScript', projectId: first }])
  state = applyActions(state, [
    { kind: 'greenlightScriptProject', production: greenlightPayload(state, first) },
  ])
  return commission(state)
}

/** An audition holding one Development & Casting slot, a screenplay holding the other. */
function auditionBesideScreenplay(seed: string): GameState {
  let state = commission(withCash(managedStudio(seed), 50_000_000))
  const first = state.scriptDevelopment.projects[0]!.id
  state = tick(state)
  state = applyActions(state, [{ kind: 'acceptScript', projectId: first }])
  state = applyActions(state, [
    { kind: 'startCastingSession', session: auditionSlate(state, first) },
  ])
  return commission(state)
}

function legalSave(state: GameState): SaveFileV16 {
  const save = makeSave(state)
  expect(validateSaveV16(save)).toBe(save)
  return save
}

/**
 * The whole non-vacuity argument in one helper: the legal save passes and
 * round-trips; the one-field forgery is refused by name at the invariant AND at
 * the load door a player actually reaches; and undoing that one field restores
 * the original BYTES exactly.
 */
function proveRefusal(
  legal: SaveFileV16,
  forge: (save: SaveFileV16) => { restore: (save: SaveFileV16) => void; slotKey: string },
  label: string,
): void {
  const legalJson = exportSave(legal)
  expect(exportSave(importSave(legalJson) as SaveFileV16), `${label}: legal twin round-trips`).toBe(
    legalJson,
  )

  const forged = clone(legal)
  const { restore, slotKey } = forge(forged)
  expect(stableStringify(forged), `${label}: the forgery must actually change something`).not.toBe(
    stableStringify(legal),
  )

  let thrown: unknown = null
  try {
    validateSaveV16(forged)
  } catch (error) {
    thrown = error
  }
  expect(thrown, `${label}: the invariant accepted two owners on ${slotKey}`).toBeInstanceOf(Error)
  const message = (thrown as Error).message
  expect(message, `${label}: the refusal must name the contended slot`).toContain(slotKey)
  expect(message, `${label}: the refusal must be a named overbooking, not a generic crash`).toMatch(
    /overbooked/i,
  )
  // The load path a player actually reaches — never a half-loaded world.
  expect(() => importSave(JSON.stringify(forged)), `${label}: load door`).toThrow()

  // Undo the one field: byte-identical to the legal twin, and legal again.
  restore(forged)
  expect(stableStringify(forged), `${label}: the twin is byte-identical`).toBe(
    stableStringify(legal),
  )
  expect(validateSaveV16(forged as SaveFileV16)).toBe(forged)
}

describe('C2a-M0 · §12-M0 gate — a slot claimed by two owners is REFUSED', () => {
  it('refuses a screenplay forged onto the slot a production holds', () => {
    const state = productionBesideScreenplay('c2a-m0-forge-script-onto-production')
    const reservation = state.operations.workflows[0]!.reservations[0]!
    expect(reservation.capability).toBe('development-casting')
    expect(state.scriptDevelopment.projects.some((project) => project.reservation !== null)).toBe(
      true,
    )

    proveRefusal(
      legalSave(state),
      (save) => {
        const project = save.state.scriptDevelopment.projects.find(
          (candidate) => candidate.reservation !== null,
        )!
        const original = { ...project.reservation! }
        project.reservation!.facilityId = reservation.facilityId
        project.reservation!.slot = reservation.slot
        return {
          slotKey: `${reservation.facilityId}:${String(reservation.slot)}`,
          restore: (twin) => {
            const target = twin.state.scriptDevelopment.projects.find(
              (candidate) => candidate.id === project.id,
            )!
            target.reservation = { ...original }
          },
        }
      },
      'screenplay onto production',
    )
  })

  it('refuses a production forged onto the slot a screenplay holds', () => {
    const state = productionBesideScreenplay('c2a-m0-forge-production-onto-script')
    const project = state.scriptDevelopment.projects.find(
      (candidate) => candidate.reservation !== null,
    )!
    const held = project.reservation!

    proveRefusal(
      legalSave(state),
      (save) => {
        const workflow = save.state.operations.workflows[0]!
        const original = { ...workflow.reservations[0]! }
        workflow.reservations[0]!.facilityId = held.facilityId
        workflow.reservations[0]!.slot = held.slot
        return {
          slotKey: `${held.facilityId}:${String(held.slot)}`,
          restore: (twin) => {
            twin.state.operations.workflows[0]!.reservations[0] = { ...original }
          },
        }
      },
      'production onto screenplay',
    )
  })

  it('refuses an audition forged onto the slot a screenplay holds', () => {
    const state = auditionBesideScreenplay('c2a-m0-forge-casting-onto-script')
    const project = state.scriptDevelopment.projects.find(
      (candidate) => candidate.reservation !== null,
    )!
    const held = project.reservation!
    expect(state.castingSessions.sessions[0]!.reservation).not.toBeNull()

    proveRefusal(
      legalSave(state),
      (save) => {
        const session = save.state.castingSessions.sessions[0]!
        const original = { ...session.reservation! }
        session.reservation!.facilityId = held.facilityId
        session.reservation!.slot = held.slot
        return {
          slotKey: `${held.facilityId}:${String(held.slot)}`,
          restore: (twin) => {
            twin.state.castingSessions.sessions[0]!.reservation = { ...original }
          },
        }
      },
      'audition onto screenplay',
    )
  })
})
