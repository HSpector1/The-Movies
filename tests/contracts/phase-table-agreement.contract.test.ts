// ── C2a-M0 · G6 — THE PHASE TABLE IS SINGLE-SOURCED, AND BOTH BOUNDARIES AGREE ─
//
// CHARTER (r3.2 §12-M0): "the phase→capability duplicate tables single-sourced
// with an agreement test (a scaffold pinning the V13 table — M2 replaces it with
// the bindings-aware form)". §14: "G6 phase-table agreement (M0 scaffold → M2
// bindings-aware)".
//
// THE DEFECT THIS FILE EXISTS FOR (lane 06 §1.2, structural pin [CODE]): the
// phase table exists TWICE — once in `src/core/operations.ts` and once as a
// hand-copied duplicate inside the save validator. "Any C2 change to the phase
// set, its durations, or its requirements must land in BOTH or saves fail
// validation. This is the single highest-risk mechanical edit in the lane."
//
// The suite is written against the CHARTER's table, not the engine's: the
// literals live in `_contractFixtures.ts` and every assertion below compares the
// engine to them, or compares the two boundaries to each other THROUGH the
// shared module. An engine that quietly changes both copies in the same wrong
// way still fails here.

import { beforeAll, describe, expect, it } from 'vitest'

import {
  applyActions,
  makeSave,
  productionPhaseForRemainingTicks as operationsPhaseForRemainingTicks,
  stableStringify,
  tick,
  validateSaveV16,
} from '../../src/core/index.js'
import type {
  FacilityReservation,
  GameState,
  ProductionPhase,
  SaveFileV16,
} from '../../src/core/index.js'
import {
  CHARTER_NEXT_PHASE,
  CHARTER_PHASE_REQUIREMENTS,
  CHARTER_PRODUCTION_PHASES,
  CHARTER_TICKS_TO_PHASE,
  clone,
  loadProductionPhases,
  operationsStudio,
  productionPayload,
  strippedSource,
  withCash,
} from './_contractFixtures.js'
import type { ProductionPhasesModule } from './_contractFixtures.js'

type PhaseSnapshot = {
  phase: ProductionPhase
  remainingTicks: number
  state: GameState
}

/**
 * One real picture walked from greenlight to release, snapshotted at every
 * remainingTicks the managed range defines. Every step is an engine action or a
 * `tick`; nothing is hand-shaped.
 */
function phaseWalk(seed: string): PhaseSnapshot[] {
  let state = withCash(operationsStudio(seed), 50_000_000)
  state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state) }])

  const snapshots: PhaseSnapshot[] = []
  const snap = (): void => {
    const production = state.studio.activeProductions[0]!
    const workflow = state.operations.workflows[0]!
    snapshots.push({
      phase: workflow.phase,
      remainingTicks: production.remainingTicks,
      state,
    })
  }

  snap() // development, 8
  state = tick(state) // the greenlight tick does not advance the picture
  state = tick(state)
  snap() // preProduction, 7
  state = tick(state)
  snap() // rehearsal, 6
  state = tick(state)
  snap() // shooting, 5 — the task is minted unassigned

  const productionId = state.studio.activeProductions[0]!.id
  const directorId = state.studio.activeProductions[0]!.directorId
  // P05A W1: due-at-call settles inside the Director call itself.
  state = applyActions(state, [{ kind: 'assignShootingDirector', productionId, directorId }])
  state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId }])
  state = tick(state)
  snap() // shooting, 4
  state = tick(state)
  snap() // postProduction, 3
  state = tick(state)
  snap() // postProduction, 2
  state = tick(state)
  snap() // releaseReady, 1

  return snapshots
}

function saveOf(state: GameState): SaveFileV16 {
  const save = makeSave(state)
  expect(validateSaveV16(save)).toBe(save)
  return save
}

function capabilityMultiset(reservations: readonly FacilityReservation[]): string[] {
  return reservations.map((reservation) => reservation.capability).sort()
}

let phases: ProductionPhasesModule
let loadFailure: unknown = null
let walk: PhaseSnapshot[] = []

beforeAll(async () => {
  try {
    phases = await loadProductionPhases()
  } catch (error) {
    loadFailure = error
  }
  walk = phaseWalk('c2a-m0-phase-walk')
})

function requirePhases(): ProductionPhasesModule {
  if (loadFailure !== null) throw loadFailure
  return phases
}

describe('C2a-M0 · G6 (A) — the shared phase table exists', () => {
  it('exports the three readings §12-M0 has to single-source', () => {
    const module = requirePhases()
    expect(typeof module.productionPhaseForRemainingTicks).toBe('function')
    expect(typeof module.requirementsForPhase).toBe('function')
    expect(typeof module.nextProductionPhase).toBe('function')
  })

  it('pins the V13 phase→capability table exactly as the contract states it', () => {
    const module = requirePhases()
    for (const phase of CHARTER_PRODUCTION_PHASES) {
      expect([...module.requirementsForPhase(phase)], phase).toEqual([
        ...CHARTER_PHASE_REQUIREMENTS[phase],
      ])
    }
  })

  it('pins the V13 next-phase table, including the terminal phase', () => {
    const module = requirePhases()
    for (const phase of CHARTER_PRODUCTION_PHASES) {
      expect(module.nextProductionPhase(phase), phase).toBe(CHARTER_NEXT_PHASE[phase])
    }
  })

  it('pins remainingTicks → phase at every tick 1..8, and refuses 0 and 9', () => {
    const module = requirePhases()
    for (let remainingTicks = 1; remainingTicks <= 8; remainingTicks++) {
      expect(module.productionPhaseForRemainingTicks(remainingTicks), String(remainingTicks)).toBe(
        CHARTER_TICKS_TO_PHASE[remainingTicks],
      )
    }
    expect(() => module.productionPhaseForRemainingTicks(0)).toThrow()
    expect(() => module.productionPhaseForRemainingTicks(9)).toThrow()
  })
})

describe('C2a-M0 · G6 (B) — the operations authority agrees at every tick', () => {
  it('resolves the same phase as the shared module for remainingTicks 1..8', () => {
    const module = requirePhases()
    for (let remainingTicks = 1; remainingTicks <= 8; remainingTicks++) {
      expect(operationsPhaseForRemainingTicks(remainingTicks), String(remainingTicks)).toBe(
        module.productionPhaseForRemainingTicks(remainingTicks),
      )
    }
  })

  it('agrees with the shared module on every phase a real picture actually occupies', () => {
    const module = requirePhases()
    expect(walk.map((snapshot) => snapshot.remainingTicks)).toEqual([8, 7, 6, 5, 4, 3, 2, 1])
    for (const snapshot of walk) {
      const label = `${snapshot.phase}@${String(snapshot.remainingTicks)}`
      expect(module.productionPhaseForRemainingTicks(snapshot.remainingTicks), label).toBe(
        snapshot.phase,
      )
      expect(capabilityMultiset(snapshot.state.operations.workflows[0]!.reservations), label).toEqual(
        [...module.requirementsForPhase(snapshot.phase)].sort(),
      )
    }
    // Non-vacuity: the walk visits every phase the table names.
    expect(new Set(walk.map((snapshot) => snapshot.phase))).toEqual(
      new Set(CHARTER_PRODUCTION_PHASES),
    )
  })
})

describe('C2a-M0 · G6 (C) — the SAVE BOUNDARY agrees, proved by refusal', () => {
  it('refuses a falsified capability multiset, naming the shared module’s own requirement', () => {
    const module = requirePhases()
    for (const snapshot of walk) {
      const legal = saveOf(snapshot.state)
      const before = stableStringify(legal)
      const required = [...module.requirementsForPhase(snapshot.phase)].sort()
      const expectedNaming = required.join(' + ') || 'no facilities'

      const forged = clone(legal)
      const workflow = forged.state.operations.workflows[0]!
      if (workflow.reservations.length > 0) {
        // Drop one held capability: the phase's requirement is no longer met.
        workflow.reservations = workflow.reservations.slice(0, -1)
      } else {
        // releaseReady holds nothing — the falsification is an EXTRA reservation.
        workflow.reservations = [
          {
            productionId: workflow.productionId,
            facilityId: 'facility-post-building',
            capability: 'post',
            slot: 0,
            phase: snapshot.phase,
          },
        ]
      }

      // Substring form on purpose: a required multiset is joined with " + ",
      // which is a quantifier if it is read as a pattern.
      expect(() => validateSaveV16(forged), `${snapshot.phase} forged`).toThrow(
        `must provide exactly ${expectedNaming} for ${snapshot.phase}`,
      )
      // The legal twin is untouched and still passes — the refusal is the
      // collision, not the fixture.
      expect(stableStringify(legal)).toBe(before)
      expect(validateSaveV16(legal)).toBe(legal)
    }
  })

  it('refuses a blocker whose targetPhase is not nextProductionPhase(phase)', () => {
    const module = requirePhases()
    for (const snapshot of walk) {
      const next = module.nextProductionPhase(snapshot.phase)
      const wrongTarget = CHARTER_PRODUCTION_PHASES.find((phase) => phase !== next)!
      const forged = clone(saveOf(snapshot.state))
      const workflow = forged.state.operations.workflows[0]!
      workflow.blocker = {
        kind: 'facility-capacity',
        capability: 'development-casting',
        targetPhase: wrongTarget,
      }
      expect(() => validateSaveV16(forged), `${snapshot.phase} → ${wrongTarget}`).toThrow(
        /blocker\.targetPhase must be the next scheduled phase/,
      )
    }
  })

  it('refuses a blocker capability the shared module does not require of its target phase', () => {
    const module = requirePhases()
    const snapshot = walk.find((entry) => entry.remainingTicks === 7)!
    const next = module.nextProductionPhase(snapshot.phase)!
    const required = new Set(module.requirementsForPhase(next))
    const unrelated = (['development-casting', 'soundstage', 'set-scenery', 'post'] as const).find(
      (capability) => !required.has(capability),
    )!
    const forged = clone(saveOf(snapshot.state))
    forged.state.operations.workflows[0]!.blocker = {
      kind: 'facility-capacity',
      capability: unrelated,
      targetPhase: next,
    }
    expect(() => validateSaveV16(forged)).toThrow(
      /blocker\.capability is not required by its target phase/,
    )
  })
})

describe('C2a-M0 · G6 (D) — no duplicate table survives', () => {
  it('leaves neither boundary holding its own copy of the phase table', () => {
    const operations = strippedSource('src/core/operations.ts')
    const save = strippedSource('src/core/save.ts')

    // The four hand-copied declarations lane 06 §1.2 pins, by name.
    expect(
      /function\s+requirementsForPhase\s*\(/.test(operations),
      'src/core/operations.ts still declares its own requirementsForPhase',
    ).toBe(false)
    expect(
      /function\s+productionPhaseForRemainingTicks\s*\(/.test(operations),
      'src/core/operations.ts still declares its own productionPhaseForRemainingTicks',
    ).toBe(false)
    expect(
      /function\s+phaseForRemainingTicks\s*\(/.test(save),
      'src/core/save.ts still declares its own phaseForRemainingTicks',
    ).toBe(false)
    expect(
      /const\s+REQUIRED_CAPABILITIES\b/.test(save),
      'src/core/save.ts still declares its own REQUIRED_CAPABILITIES table',
    ).toBe(false)
    expect(
      /const\s+NEXT_PHASE\b/.test(save),
      'src/core/save.ts still declares its own NEXT_PHASE table',
    ).toBe(false)

    // Both boundaries read the single source instead.
    for (const [label, source] of [
      ['src/core/operations.ts', operations],
      ['src/core/save.ts', save],
    ] as const) {
      expect(/from\s+['"]\.\/productionPhases\.js['"]/.test(source), label).toBe(true)
    }
  })
})
