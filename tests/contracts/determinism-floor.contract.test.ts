// ── C2a-M0 · THE DETERMINISM FLOOR ──────────────────────────────────────────
//
// CHARTER (r3.2 §12-M0) gate: "behaviour-identical on every legal state (REPLAY
// + SAVE BYTE-IDENTITY on the sealed fixture corpus)". §15 lists Determinism as
// a standing red-team target; §14's G-list makes byte-identity the currency of
// every later gate (G4, G8, G11, G17).
//
// WHAT THIS FILE IS FOR. M0 rewrites the occupancy traversals every allocation
// decision reads. If the union producer iterates its owners in a different
// order, or de-duplicates into a differently-ordered collection, allocation can
// pick a different-but-equally-legal slot — and NOTHING ELSE IN THE SUITE WOULD
// NOTICE, because both outcomes are legal. Byte-identity is the only assertion
// that catches it.
//
// The run below is deliberately CONTENDED: a picture walking real managed phase
// transitions while screenplay and audition reservations are live in the same
// weeks, on the shared Development & Casting capacity. That is exactly the state
// whose ordering the union producer decides.
//
// This one is expected GREEN at this HEAD. It is the floor M0 must not fall
// through, not a contract waiting to be met.

import { describe, expect, it } from 'vitest'

import {
  applyActions,
  exportSave,
  importSave,
  makeSave,
  tick,
} from '../../src/core/index.js'
import type { GameState, SaveFileV13 } from '../../src/core/index.js'
import {
  auditionSlate,
  availableConceptId,
  availableWriterId,
  commissionPayload,
  greenlightPayload,
  managedStudio,
  withCash,
} from './_contractFixtures.js'

type WeekTrace = {
  week: number
  phase: string | null
  productionSlots: string[]
  screenplaySlots: string[]
  auditionSlots: string[]
}

function slotKey(reservation: { facilityId: string; slot: number }): string {
  return `${reservation.facilityId}:${String(reservation.slot)}`
}

function traceOf(state: GameState): WeekTrace {
  return {
    week: state.market.tick,
    phase: state.operations.workflows[0]?.phase ?? null,
    productionSlots: state.operations.workflows.flatMap((workflow) =>
      workflow.reservations.map(slotKey),
    ),
    screenplaySlots: state.scriptDevelopment.projects
      .filter((project) => project.reservation !== null)
      .map((project) => slotKey(project.reservation!)),
    auditionSlots: state.castingSessions.sessions
      .filter((session) => session.reservation !== null)
      .map((session) => slotKey(session.reservation!)),
  }
}

function commission(state: GameState): GameState {
  return applyActions(state, [
    {
      kind: 'commissionScript',
      project: commissionPayload(state, availableConceptId(state), availableWriterId(state)),
    },
  ])
}

/**
 * ONE action script, run from a fresh world every time. No wall clock, no
 * ambient input, no branch on anything but the state the script itself made.
 */
function scriptedRun(seed: string): { save: SaveFileV13; trace: WeekTrace[] } {
  const trace: WeekTrace[] = []
  let state = withCash(managedStudio(seed), 50_000_000)
  const step = (next: GameState): void => {
    state = next
    trace.push(traceOf(state))
  }

  step(commission(state))
  const first = state.scriptDevelopment.projects[0]!.id
  step(tick(state))
  step(applyActions(state, [{ kind: 'acceptScript', projectId: first }]))
  step(
    applyActions(state, [
      { kind: 'greenlightScriptProject', production: greenlightPayload(state, first) },
    ]),
  )
  // A screenplay drafting alongside the greenlit picture: shared capacity, same week.
  step(commission(state))
  const second = state.scriptDevelopment.projects[1]!.id

  step(tick(state)) // the greenlight week
  step(applyActions(state, [{ kind: 'acceptScript', projectId: second }]))
  step(tick(state)) // development → preProduction
  step(tick(state)) // preProduction → rehearsal (the picture leaves Development & Casting)

  // An audition and a third screenplay take the two slots the picture vacated.
  step(applyActions(state, [{ kind: 'startCastingSession', session: auditionSlate(state, second, 3) }]))
  step(commission(state))

  step(tick(state)) // rehearsal → shooting, with all three owner kinds live behind it
  const productionId = state.studio.activeProductions[0]!.id
  const directorId = state.studio.activeProductions[0]!.directorId
  step(applyActions(state, [{ kind: 'assignShootingDirector', productionId, directorId }]))
  step(applyActions(state, [{ kind: 'clearSceneryLoadIn', productionId }]))
  step(applyActions(state, [{ kind: 'scheduleShootingTake', productionId }]))
  step(tick(state)) // shooting week two
  step(tick(state)) // → postProduction
  step(tick(state))
  step(tick(state)) // → releaseReady

  return { save: makeSave(state), trace }
}

const SEED = 'c2a-m0-determinism-floor'

describe('C2a-M0 · §12-M0 gate — same seed, same actions, same bytes', () => {
  it('exports byte-identically across two fresh runs', () => {
    const left = scriptedRun(SEED)
    const right = scriptedRun(SEED)
    expect(exportSave(right.save)).toBe(exportSave(left.save))
    expect(right.trace).toEqual(left.trace)
  })

  it('round-trips through the load door without moving a byte', () => {
    const { save } = scriptedRun(SEED)
    const json = exportSave(save)
    expect(exportSave(importSave(json) as SaveFileV13)).toBe(json)
    expect(save.state.rngState).toBe((importSave(json) as SaveFileV13).state.rngState)
  })

  it('is non-vacuous: managed phase transitions ran while screenplay AND audition slots were held', () => {
    const { trace } = scriptedRun(SEED)

    const phases = new Set(
      trace.map((week) => week.phase).filter((phase): phase is string => phase !== null),
    )
    expect(
      [...phases].sort(),
      'the run must actually walk the managed countdown',
    ).toEqual(['development', 'postProduction', 'preProduction', 'rehearsal', 'releaseReady', 'shooting'])

    const productionBesideScreenplay = trace.filter(
      (week) => week.productionSlots.length > 0 && week.screenplaySlots.length > 0,
    )
    expect(productionBesideScreenplay.length, 'no week contended production vs screenplay').toBeGreaterThan(0)

    const allThree = trace.filter(
      (week) =>
        week.productionSlots.length > 0 &&
        week.screenplaySlots.length > 0 &&
        week.auditionSlots.length > 0,
    )
    expect(allThree.length, 'no week contended all three reservation owners').toBeGreaterThan(0)

    // A legal state never double-books, so every contended week is real capacity
    // pressure rather than an artefact of the trace.
    for (const week of trace) {
      const keys = [...week.productionSlots, ...week.screenplaySlots, ...week.auditionSlots]
      expect(new Set(keys).size, `week ${String(week.week)} double-books a slot`).toBe(keys.length)
    }
  })
})
