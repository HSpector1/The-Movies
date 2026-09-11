import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import { occupiedResourceSlots } from '../src/core/occupancy.js'
import {
  advanceManagedProductions, assertStudioOperationsInvariants, assignShootingDirector,
  clearSceneryLoadIn, scheduleShootingTake,
} from '../src/core/operations.js'
import { completeDuePlacements } from '../src/core/placement.js'
import { applyTechnologyAction, finishTechnologyWeek, validateTechnology } from '../src/core/technology.js'
import {
  assertProductionTechnologyBindings, createProductionTechnologyPolicy, discardUnfilmedProductionTechnology,
  productionHasBegunFilming, productionTechnologyView, retargetProductionTechnologyChoice,
} from '../src/core/technologyProduction.js'
import { commitStudioEvents, StudioEventSink } from '../src/core/studioEvents.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { operationsStudio, productionPayload } from './contracts/_contractFixtures.js'

const SOUND_STAGE = 'facility-soundstage-12'
const SILENT_STAGE = 'facility-soundstage-07'
const POST = 'facility-post-building'

function studio(): GameState {
  return initializeHollywood(operationsStudio('p13a-production-consumer'), 'fresh')
}

/** Isolate the consumer from research; P09 still owns all real physical work. */
function installConsumerFixture(state: GameState): GameState {
  const own = state.hollywood!.playerStudioId
  state = { ...state, technology: { ...state.technology, access: [{ studioId: own,
    technologyId: 'synchronized-sound', route: 'research', chosenWeek: state.market.tick,
    acquiredWeek: state.market.tick, accessCost: 0, researchProjectId: 'consumer-fixture-provenance' }] } }
  state = applyTechnologyAction(state, { kind: 'adoptSynchronizedSound', stageFacilityId: SOUND_STAGE, postFacilityId: POST })
  for (const week of [state.market.tick + 6, state.market.tick + 12]) {
    const completed = completeDuePlacements(state.placement, state.operations, week)
    state = { ...state, market: { ...state.market, tick: week }, placement: completed.placement, operations: completed.operations }
  }
  return finishTechnologyWeek(state)
}

function greenlight(state: GameState, offset = 0): GameState {
  return applyActions(state, [{ kind: 'greenlight', production: productionPayload(state, offset) }])
}

function selectSound(state: GameState, productionId = state.studio.activeProductions[0]!.id): GameState {
  return applyTechnologyAction(state, { kind: 'setProductionTechnology', productionId,
    method: 'synchronized-dialogue', adoptionId: state.technology.adoptions[0]!.id })
}

function advance(state: GameState, extraOccupied: readonly string[] = [], policyEnabled = true): GameState {
  const technology = createProductionTechnologyPolicy(state)
  const events = new StudioEventSink(state.market.tick, true)
  const result = advanceManagedProductions(state.operations, state.studio.activeProductions,
    state.market.tick, new Set(), new Set([...occupiedResourceSlots(state, { owners: ['installation', 'research'] }).keys(), ...extraOccupied]),
    events, { sets: state.sets, genreOf: (productionId) => {
      const production = state.studio.activeProductions.find((entry) => entry.id === productionId)
      return state.concepts.find((concept) => concept.id === production?.conceptId)?.genre ?? null
    } }, policyEnabled ? technology.policy : undefined)
  const next = { ...state, market: { ...state.market, tick: state.market.tick + 1 },
    operations: result.operations, sets: result.sets, studio: { ...state.studio, activeProductions: result.productions },
    technology: technology.technology(), studioEvents: commitStudioEvents(state.studioEvents, events, state.market.tick + 1) }
  assertStudioOperationsInvariants(next.operations, next.studio.activeProductions, { facilityPolicy: 'configured' })
  if (policyEnabled) assertProductionTechnologyBindings(next)
  return next
}

function rehearse(state: GameState): GameState {
  return advance(advance(advance(state)))
}

function completeFirstTake(state: GameState): GameState {
  const production = state.studio.activeProductions[0]!
  let operations = assignShootingDirector(state.operations, production, production.directorId)
  operations = clearSceneryLoadIn(operations, production.id)
  operations = scheduleShootingTake(operations, production.id)
  return advance({ ...state, operations })
}

describe('P13A first-filming technology and exact production chain', () => {
  it('carries the first-filming lock through the complete tick state assembly', () => {
    let state = greenlight(studio())
    for (let week = 0; week < 4; week++) state = tick(state)
    expect(state.operations.workflows[0]!.shootingTask?.status).toBe('unassigned')
    expect(state.technology.productions).toEqual([{ studioId: state.hollywood!.playerStudioId,
      productionId: state.studio.activeProductions[0]!.id, method: 'silent', adoptionId: null, lockedWeek: 3 }])
  })

  it('locks sound at the authoritative Shooting phase entry, before any take is assigned or scheduled', () => {
    let state = rehearse(selectSound(greenlight(installConsumerFixture(studio()))))
    const production = state.studio.activeProductions[0]!
    expect(state.operations.workflows[0]!.bindings.stageFacilityId).toBe(SOUND_STAGE)
    expect(state.technology.productions[0]!.lockedWeek).toBeNull()
    const previousRoot = state.technology
    const lockedWeek = state.market.tick
    state = advance(state)
    expect(state.operations.workflows[0]!.shootingTask?.status).toBe('unassigned')
    expect(state.studio.activeProductions[0]!.remainingTicks).toBe(5)
    expect(state.technology.productions[0]).toMatchObject({ method: 'synchronized-dialogue', lockedWeek })
    expect(previousRoot.productions[0]!.lockedWeek).toBeNull()
    expect(state.studioEvents.rows.find((row) => row.kind === 'phaseEntered' && row.productionId === production.id && row.phase === 'shooting')?.week).toBe(lockedWeek)
    expect(() => applyTechnologyAction(state, { kind: 'setProductionTechnology', productionId: production.id, method: 'silent', adoptionId: null })).toThrow('Filming has begun')
    const held = advance(state)
    expect(held.technology).toBe(state.technology)
  })

  it('leaves the silent route’s allocation, work, costs and sets identical to the accepted route', () => {
    let silent = greenlight(studio())
    let control = silent
    const startingCash = silent.studio.cash
    for (let week = 0; week < 4; week++) {
      silent = advance(silent)
      control = advance(control, [], false)
      expect(silent.operations).toEqual(control.operations)
      expect(silent.studio).toEqual(control.studio)
      expect(silent.sets).toEqual(control.sets)
      expect(silent.ledger).toEqual(control.ledger)
      expect(silent.rngState).toEqual(control.rngState)
    }
    expect(silent.studio.cash).toBe(startingCash)
    expect(silent.technology.adoptions).toEqual([])
    expect(silent.technology.productions).toEqual([{ studioId: silent.hollywood!.playerStudioId,
      productionId: silent.studio.activeProductions[0]!.id, method: 'silent', adoptionId: null, lockedWeek: 3 }])
  })

  it('waits for the selected soundstage while a different stage remains free', () => {
    let state = selectSound(greenlight(installConsumerFixture(studio())))
    state = advance(advance(state))
    state = advance(state, [`${SOUND_STAGE}:0`])
    expect(state.operations.workflows[0]).toMatchObject({ phase: 'preProduction', reservations: [],
      blocker: { kind: 'facility-capacity', capability: 'soundstage', targetPhase: 'rehearsal' } })
    expect(state.technology.productions[0]!.lockedWeek).toBeNull()
    state = advance(state)
    expect(state.operations.workflows[0]!.bindings.stageFacilityId).toBe(SOUND_STAGE)
    expect(state.operations.facilities.some((facility) => facility.id === SILENT_STAGE)).toBe(true)
  })

  it('uses the same selected Post after wrap and cannot substitute an unselected free Post room', () => {
    let state = advance(rehearse(selectSound(greenlight(installConsumerFixture(studio())))))
    state = completeFirstTake(state)
    state = { ...state, operations: { ...state.operations, facilities: [...state.operations.facilities,
      { id: 'a-different-post', name: 'Unselected Post', capability: 'post', capacity: 2 }] } }
    const lock = state.technology.productions[0]
    state = advance(state, [`${POST}:0`, `${POST}:1`])
    expect(state.operations.workflows[0]).toMatchObject({ phase: 'shooting', reservations: [], shootingTask: null,
      blocker: { kind: 'facility-capacity', capability: 'post', targetPhase: 'postProduction' } })
    expect(state.technology.productions[0]).toBe(lock)
    state = advance(state)
    expect(state.operations.workflows[0]!.reservations).toHaveLength(1)
    expect(state.operations.workflows[0]!.reservations[0]!.facilityId).toBe(POST)
  })

  it('atomically retargets an unfilmed rehearsal to the newly selected operational stage and its exact set', () => {
    let state = rehearse(greenlight(installConsumerFixture(studio())))
    const before = state.operations.workflows[0]!
    const beforeRows = state.studioEvents.rows.length
    expect(before.bindings.stageFacilityId).toBe(SILENT_STAGE)
    state = selectSound(state)
    const after = state.operations.workflows[0]!
    expect(after.phase).toBe('rehearsal')
    expect(after.bindings.stageFacilityId).toBe(SOUND_STAGE)
    expect(after.bindings.setId).not.toBe(before.bindings.setId)
    expect(state.sets.find((set) => set.id === after.bindings.setId)?.mountedOn).toBe(SOUND_STAGE)
    expect(state.studioEvents.rows.slice(beforeRows).map((row) => row.kind)).toEqual(['reservationReleased', 'reservationGranted'])
    expect(state.technology.productions[0]!.lockedWeek).toBeNull()
    assertStudioOperationsInvariants(state.operations, state.studio.activeProductions, { facilityPolicy: 'configured' })
    assertProductionTechnologyBindings(state)
  })

  it('refuses a rehearsal change to an occupied stage and preserves both crews and the prior choice', () => {
    let state = installConsumerFixture(studio())
    state = greenlight(greenlight(state), 1)
    state = rehearse(state)
    const targetFilm = state.studio.activeProductions[0]!.id
    const before = JSON.stringify(state)
    expect(() => retargetProductionTechnologyChoice(state, targetFilm, state.technology.adoptions[0]!.id)).toThrow('occupied')
    expect(JSON.stringify(state)).toBe(before)
    expect(state.operations.workflows.map((workflow) => workflow.bindings.stageFacilityId)).toEqual([SILENT_STAGE, SOUND_STAGE])
    expect(state.technology.productions).toEqual([])
  })

  it('refuses a rehearsal change when the selected stage has no usable set', () => {
    let state = rehearse(greenlight(installConsumerFixture(studio())))
    state = { ...state, sets: state.sets.map((set) => set.mountedOn === SOUND_STAGE ? { ...set, status: 'retired' } : set) }
    const before = JSON.stringify(state)
    expect(() => retargetProductionTechnologyChoice(state, state.studio.activeProductions[0]!.id,
      state.technology.adoptions[0]!.id)).toThrow('standing, usable set')
    expect(JSON.stringify(state)).toBe(before)
  })

  it('keeps an already-shooting historical film silent when sound becomes operational, without invented history', () => {
    let state = greenlight(studio())
    for (let week = 0; week < 4; week++) state = advance(state, [], false)
    const productionId = state.studio.activeProductions[0]!.id
    expect(state.operations.workflows[0]!.phase).toBe('shooting')
    expect(state.technology.productions).toEqual([])
    // The migrated campaign starts recording technology at this boundary.
    state = { ...state, technology: { ...state.technology, recordingStartedWeek: state.market.tick } }
    state = installConsumerFixture(state)
    state = advance(state)
    expect(state.technology.adoptions[0]!.operationalWeek).not.toBeNull()
    expect(state.technology.productions).toEqual([])
    expect(productionTechnologyView(state, productionId)).toEqual({ productionId, method: 'silent', adoptionId: null, locked: true, lockedWeek: null })
    expect(() => selectSound(state)).toThrow('Filming has begun')
  })

  it('drops cancelled unfilmed choices but retains a film’s permanent lock after filming starts', () => {
    let state = selectSound(greenlight(installConsumerFixture(studio())))
    const id = state.studio.activeProductions[0]!.id
    expect(discardUnfilmedProductionTechnology(state, id).productions).toEqual([])
    expect(state.technology.productions).toHaveLength(1)
    state = advance(rehearse(state))
    expect(productionHasBegunFilming(state, id)).toBe(true)
    expect(discardUnfilmedProductionTechnology(state, id)).toBe(state.technology)
    const forged = { ...state, technology: { ...state.technology, productions: state.technology.productions.map((row) => ({ ...row, lockedWeek: null })) } }
    expect(() => assertProductionTechnologyBindings(forged)).toThrow('first-filming lock')
  })

  it('validates a cancelled silent film’s retained lock against its permanent production identity', () => {
    let state = advance(rehearse(greenlight(studio())))
    const id = state.studio.activeProductions[0]!.id
    const lock = state.technology.productions[0]!
    expect(() => validateTechnology(state)).not.toThrow()
    state = applyActions(state, [{ kind: 'cancel', productionId: id }])
    expect(state.studio.activeProductions).toEqual([])
    expect(state.technology.productions).toEqual([lock])
    expect(() => validateTechnology(state)).not.toThrow()
  })
})
