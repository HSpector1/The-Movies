// ── C2a-M0 · STICKY RESERVATIONS — NOBODY TELEPORTS ─────────────────────────
//
// CHARTER (r3.2 §3.2, last bullet), verbatim:
//
//   "Sticky reservations (lane 2's R-1): retention becomes sticky for ALL
//    capabilities — a contract-conformance repair
//    (DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md:500 'no reservation migration')."
//
// §10 tables it as an inherited seam: "R-1 reservation migration | Sticky
// reservations (§3.2) | The Annex contract clause holds; NOBODY TELEPORTS."
//
// THE DEFECT (lane 2, S4 / R-1): retention is soundstage-only. A picture sitting
// on the Annex at Development migrates to `facility-development-casting` slot 0
// at Pre-production whenever that lower-id slot frees, because allocation is
// first-fit ascending-by-facility-id and the workflow's own slot is excluded
// from the occupancy set. The lot renders the two facilities as DIFFERENT
// PHYSICAL PLACES, so under owner law 8 this is a person visibly teleporting
// between buildings for no authoritative reason.
//
// THE FRAME (`DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md:243-244, :494-495, :500):
//   "Development-to-Pre-production RETAINS THE PRODUCTION'S EXISTING SLOT";
//   "no reservation migration";
//   "existing reservations never move merely because another facility
//    became available."
//
// The setup below is lane 2's, built for real: an Annex standing and operational,
// a picture pushed onto it because both base slots were taken, and then the base
// slots freeing in the same week the picture transitions. EXPECTED CONTRACT-FIRST
// STATE: red until M0's sticky retention lands.

import { describe, expect, it } from 'vitest'

import {
  applyActions,
  commitPlacement,
  scriptProjectsReadModel,
  tick,
} from '../../src/core/index.js'
import type { GameState } from '../../src/core/index.js'
import { DEVELOPMENT_CASTING_ANNEX_BLUEPRINT } from '../../src/core/tuning.js'
import {
  advance,
  availableConceptId,
  commissionPayload,
  greenlightPayload,
  managedStudio,
  withCash,
} from './_contractFixtures.js'

const BASE_FACILITY = 'facility-development-casting'
const ANNEX_FACILITY = 'facility-development-casting-annex'
/** The `expansion` parcel — the ground the Annex contract reserves for itself. */
const ANNEX_ORIGIN = { gx: 7, gy: 15 }

function writerExcluding(state: GameState, excluded: ReadonlySet<string>): string {
  const writer = scriptProjectsReadModel(state).commission.writers.find(
    (candidate) => candidate.available && !excluded.has(candidate.id),
  )
  if (writer === undefined) throw new Error('sticky-retention fixture: no free writer left')
  return writer.id
}

function commissionExcluding(state: GameState, excluded: ReadonlySet<string>): GameState {
  return applyActions(state, [
    {
      kind: 'commissionScript',
      project: commissionPayload(state, availableConceptId(state), writerExcluding(state, excluded)),
    },
  ])
}

/** A managed studio whose Development & Casting Annex is built and operational. */
function studioWithAnnex(seed: string): GameState {
  const placed = commitPlacement(withCash(managedStudio(seed), 80_000_000), {
    blueprintId: DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.id,
    origin: ANNEX_ORIGIN,
  })
  expect(placed.placement.facilities, 'the Annex must actually be placed').toHaveLength(1)
  const operational = advance(placed, DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks)
  const annex = operational.operations.facilities.find((facility) => facility.id === ANNEX_FACILITY)
  expect(annex, 'the Annex must be operational before the edge can be reached').toBeDefined()
  expect(annex!.capacity).toBe(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.capacity)
  return operational
}

describe('C2a-M0 · §3.2 / R-1 — a Development & Casting reservation never migrates', () => {
  it('keeps a picture on the Annex when a lower-id base slot frees under it', () => {
    let state = studioWithAnnex('c2a-m0-sticky-annex')

    // The picture's own screenplay, accepted so it can be greenlit.
    state = commissionExcluding(state, new Set())
    const picture = state.scriptDevelopment.projects[0]!
    const pictureWriter = picture.writerId
    state = tick(state)
    state = applyActions(state, [{ kind: 'acceptScript', projectId: picture.id }])

    // Both BASE slots are taken by other screenplays, so the only free
    // Development & Casting slot left for the greenlight is the Annex.
    const spoken = new Set([pictureWriter])
    state = commissionExcluding(state, spoken)
    spoken.add(state.scriptDevelopment.projects[1]!.writerId)
    state = commissionExcluding(state, spoken)

    const drafting = state.scriptDevelopment.projects.filter(
      (project) => project.reservation !== null,
    )
    expect(drafting, 'both base slots must be spoken for').toHaveLength(2)
    for (const project of drafting) {
      expect(project.reservation!.facilityId).toBe(BASE_FACILITY)
    }

    state = applyActions(state, [
      { kind: 'greenlightScriptProject', production: greenlightPayload(state, picture.id) },
    ])
    const held = state.operations.workflows[0]!.reservations[0]!
    expect(state.operations.workflows[0]!.phase).toBe('development')
    expect(held.capability).toBe('development-casting')
    // THE EDGE: the picture is physically at the Annex, not the base building.
    expect(held.facilityId, 'the greenlight must land on the Annex for this edge').toBe(
      ANNEX_FACILITY,
    )
    const heldSlot = held.slot

    // The week the base slots free. The picture does not advance on its own
    // greenlight tick, so nothing has transitioned yet.
    state = tick(state)
    expect(
      state.scriptDevelopment.projects.filter((project) => project.reservation !== null),
      'both base slots must be free when the transition runs',
    ).toHaveLength(0)
    expect(state.operations.workflows[0]!.phase).toBe('development')
    expect(state.operations.workflows[0]!.reservations[0]!.facilityId).toBe(ANNEX_FACILITY)

    // Development → Pre-production, with `facility-development-casting` slot 0
    // sitting empty and lexically first.
    state = tick(state)
    const after = state.operations.workflows[0]!
    expect(after.phase).toBe('preProduction')
    expect(
      after.reservations[0]!.facilityId,
      'DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md:500 — "no reservation migration": ' +
        'Development→Pre-production must retain the production\'s EXISTING slot, not ' +
        'first-fit onto a lower-id facility that happened to free. Nobody teleports.',
    ).toBe(ANNEX_FACILITY)
    expect(after.reservations[0]!.slot).toBe(heldSlot)
  })

  it('still retains the physical soundstage across rehearsal → shooting', () => {
    // The half of the retention law that already held. The sticky repair widens
    // retention to every capability; it must not narrow this one.
    let state = studioWithAnnex('c2a-m0-sticky-soundstage')
    state = commissionExcluding(state, new Set())
    const picture = state.scriptDevelopment.projects[0]!
    state = tick(state)
    state = applyActions(state, [{ kind: 'acceptScript', projectId: picture.id }])
    state = applyActions(state, [
      { kind: 'greenlightScriptProject', production: greenlightPayload(state, picture.id) },
    ])

    state = advance(state, 4) // greenlight tick, → preProduction, → rehearsal, → shooting
    // Walk back one transition: capture the stage held AT rehearsal.
    let rehearsal = studioWithAnnex('c2a-m0-sticky-soundstage')
    rehearsal = commissionExcluding(rehearsal, new Set())
    const twin = rehearsal.scriptDevelopment.projects[0]!
    rehearsal = tick(rehearsal)
    rehearsal = applyActions(rehearsal, [{ kind: 'acceptScript', projectId: twin.id }])
    rehearsal = applyActions(rehearsal, [
      { kind: 'greenlightScriptProject', production: greenlightPayload(rehearsal, twin.id) },
    ])
    rehearsal = advance(rehearsal, 3)
    expect(rehearsal.operations.workflows[0]!.phase).toBe('rehearsal')
    const stage = rehearsal.operations.workflows[0]!.reservations[0]!

    const shooting = state.operations.workflows[0]!
    expect(shooting.phase).toBe('shooting')
    const retained = shooting.reservations.find(
      (reservation) => reservation.capability === 'soundstage',
    )!
    expect(retained.facilityId).toBe(stage.facilityId)
    expect(retained.slot).toBe(stage.slot)
    expect(shooting.shootingTask!.soundstageFacilityId).toBe(stage.facilityId)
  })
})
