import { hasOperationalFacilityInstallation } from './facilityEffects.js'
import { occupiedResourceSlots } from './occupancy.js'
import { retargetUnfilmedProduction, type ProductionAllocationPolicy } from './operations.js'
import { commitStudioEvents, StudioEventSink } from './studioEvents.js'
import type { GameState } from './types.js'
import type { ProductionTechnology, StudioTechnology, TechnologyAdoption } from './technologyTypes.js'

function playerId(state: GameState): string | undefined {
  return state.hollywood?.playerStudioId
}

/** The absence of a row is the lawful silent default, including migrated films. */
function selectedTechnology(state: GameState, studioId: string | undefined, productionId: string): ProductionTechnology | undefined {
  return state.technology.productions.find((row) => row.studioId === studioId && row.productionId === productionId)
}

function operationalAdoption(state: GameState, studioId: string, adoptionId: string | null): TechnologyAdoption | null {
  const adoption = state.technology.adoptions.find((row) => row.id === adoptionId && row.studioId === studioId &&
    row.operationalWeek !== null && row.operationalWeek <= state.market.tick)
  if (adoption === undefined) return null
  if (studioId === playerId(state) &&
    (!hasOperationalFacilityInstallation(state, adoption.stageFacilityId, 'synchronized-sound-stage') ||
      !hasOperationalFacilityInstallation(state, adoption.postFacilityId, 'synchronized-sound-post'))) return null
  return adoption
}

/** Uses production/workflow authority, never the compactable event witness. */
export function productionHasBegunFilming(state: GameState, productionId: string, studioId = playerId(state)): boolean {
  const row = selectedTechnology(state, studioId, productionId)
  if (row?.lockedWeek !== null && row !== undefined) return true
  const player = studioId === playerId(state)
  const business = player ? undefined : state.hollywood?.businesses.find((entry) => entry.studioId === studioId)
  const production = (player ? state.studio.activeProductions : business?.productions)?.find((entry) => entry.id === productionId)
  return production !== undefined && production.remainingTicks <= 5
}

/** Truthful thin projection: no timestamp or research history is invented for old films. */
export function productionTechnologyView(state: GameState, productionId: string, studioId = playerId(state)) {
  const row = selectedTechnology(state, studioId, productionId)
  return {
    productionId,
    method: row?.method ?? 'silent',
    adoptionId: row?.adoptionId ?? null,
    locked: productionHasBegunFilming(state, productionId, studioId),
    lockedWeek: row?.lockedWeek ?? null,
  }
}

/**
 * A caller-owned transition collector, like StudioEventSink. It never mutates
 * its input. Read technology() after the allocation pass and persist that root.
 * The callback runs at phase entry, before a shooting task can do any work.
 */
export function createProductionTechnologyPolicy(state: GameState, studioId = playerId(state)): {
  policy: ProductionAllocationPolicy
  technology: () => StudioTechnology
} {
  let next = state.technology
  const selection = (productionId: string) => next.productions.find((row) => row.studioId === studioId && row.productionId === productionId)
  return {
    technology: () => next,
    policy: {
      allowsFacility(productionId, facility) {
        const row = selection(productionId)
        if (row === undefined || row.method === 'silent') return true
        const adoption = operationalAdoption(state, row.studioId, row.adoptionId)
        // A sound selection must never quietly fall back to a different chain.
        if (adoption === null) return facility.capability !== 'soundstage' && facility.capability !== 'post'
        if (facility.capability === 'soundstage') return facility.id === adoption.stageFacilityId
        if (facility.capability === 'post') return facility.id === adoption.postFacilityId
        return true
      },
      beforePhaseEntered(production, phase, reservations, week) {
        if (phase !== 'shooting' || studioId === undefined) return
        const previous = selection(production.id)
        if (previous !== undefined && previous.lockedWeek !== null) return
        if (previous?.method === 'synchronized-dialogue') {
          const adoption = operationalAdoption(state, studioId, previous.adoptionId)
          if (adoption === null || !reservations.some((reservation) => reservation.capability === 'soundstage' && reservation.facilityId === adoption.stageFacilityId)) {
            throw new Error('Filming cannot begin outside the selected operational stage, capture and Post chain.')
          }
        }
        const locked: ProductionTechnology = previous === undefined
          ? { studioId, productionId: production.id, method: 'silent', adoptionId: null, lockedWeek: week }
          : { ...previous, lockedWeek: week }
        next = { ...next, productions: previous === undefined
          ? [...next.productions, locked]
          : next.productions.map((row) => row === previous ? locked : row) }
      },
    },
  }
}

/** Atomic rehearsal retarget, called only after the choice's access checks pass. */
export function retargetProductionTechnologyChoice(state: GameState, productionId: string, adoptionId: string): GameState {
  const studioId = playerId(state)
  if (studioId === undefined) throw new Error('This campaign has no founded player studio.')
  if (productionHasBegunFilming(state, productionId)) throw new Error('This film has entered the filming phase. Technology locks at phase entry, before the first take, and cannot be changed.')
  const adoption = operationalAdoption(state, studioId, adoptionId)
  if (adoption === null) throw new Error('Complete the selected synchronized stage, compatible capture and Post chain first.')
  const production = state.studio.activeProductions.find((entry) => entry.id === productionId)
  if (production === undefined) throw new Error('That production is not active in this campaign.')
  const events = new StudioEventSink(state.market.tick, state.operations.mode === 'managed')
  const occupied = new Set(occupiedResourceSlots(state, { excludeOwner: 'production', excludeOwnerId: productionId }).keys())
  const result = retargetUnfilmedProduction(state.operations, productionId, adoption.stageFacilityId, occupied, events, {
    sets: state.sets,
    genreOf: () => state.concepts.find((concept) => concept.id === production.conceptId)?.genre ?? null,
  }, state.market.tick)
  if (!result.ok) throw new Error(result.reason)
  if (result.operations === state.operations) return state
  return { ...state, operations: result.operations, studioEvents: commitStudioEvents(state.studioEvents, events, state.market.tick) }
}

/** Cancel drops an unfilmed choice; a locked film keeps its permanent loadout. */
export function discardUnfilmedProductionTechnology(state: GameState, productionId: string): StudioTechnology {
  const productions = state.technology.productions.filter((row) => row.studioId !== playerId(state) ||
    row.productionId !== productionId || row.lockedWeek !== null)
  return productions.length === state.technology.productions.length ? state.technology : { ...state.technology, productions }
}

/** Exact selected-chain and first-filming locks are part of current save validation. */
export function assertProductionTechnologyBindings(state: GameState): void {
  for (const production of state.studio.activeProductions) {
    if (state.operations.mode !== 'managed' || playerId(state) === undefined || production.remainingTicks > 5 ||
      production.startTick < state.technology.recordingStartedWeek) continue
    if (selectedTechnology(state, playerId(state), production.id)?.lockedWeek == null) {
      throw new Error('Production technology: a newly filmed production is missing its first-filming lock.')
    }
  }
  for (const row of state.technology.productions) {
    const player = row.studioId === playerId(state)
    const business = player ? undefined : state.hollywood?.businesses.find((entry) => entry.studioId === row.studioId)
    const operations = player ? state.operations : business?.operations
    const production = (player ? state.studio.activeProductions : business?.productions)?.find((entry) => entry.id === row.productionId)
    const workflow = operations?.workflows.find((entry) => entry.productionId === row.productionId)
    if (production !== undefined && row.lockedWeek !== null &&
      (production.remainingTicks > 5 || row.lockedWeek < production.startTick)) {
      throw new Error('Production technology: loadout locked before its first filming phase.')
    }
    if (row.lockedWeek === null && productionHasBegunFilming(state, row.productionId, row.studioId)) {
      throw new Error('Production technology: filming has begun without its selected loadout lock.')
    }
    if (row.method !== 'synchronized-dialogue') continue
    const adoption = operationalAdoption(state, row.studioId, row.adoptionId)
    if (adoption === null) throw new Error('Production technology: selected sound chain is not operational.')
    for (const reservation of workflow?.reservations ?? []) {
      if ((reservation.capability === 'soundstage' && reservation.facilityId !== adoption.stageFacilityId) ||
        (reservation.capability === 'post' && reservation.facilityId !== adoption.postFacilityId)) {
        throw new Error('Production technology: reserved facility differs from the selected sound chain.')
      }
    }
  }
}
