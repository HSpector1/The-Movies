import { describe, expect, it } from 'vitest'
import type {
  LotPublicityOffer,
  ProductionOperationsState,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'
import { sceneryLoadInContext } from './sceneryLoadIn.ts'

function blockedStage7(
  overrides: Partial<ProductionOperationsState> = {},
): ProductionOperationsState {
  return {
    productionId: 'prod-stage-7',
    title: 'Stage Seven Picture',
    phase: 'shooting',
    phaseLabel: 'Shooting',
    weeksRemaining: 5,
    progress01: 3 / 8,
    locationBuildingId: 'stage-a',
    facilityLabel: 'Soundstage 7 + Scenery Shop',
    directorId: 'director-stage-7',
    directorName: 'Director Seven',
    taskStatus: 'blocked',
    statusLabel: 'Production hold',
    blocker: {
      kind: 'scenery-load-in',
      headline: 'Scenery load-in required',
      detail: 'Scenery must be loaded before the take can be scheduled.',
    },
    attention: 'decision-required',
    currentCommand: {
      kind: 'clearSceneryLoadIn',
      productionId: 'prod-stage-7',
      label: 'Clear scenery load-in',
    },
    ...overrides,
  }
}

function readyStage7(
  overrides: Partial<ProductionOperationsState> = {},
): ProductionOperationsState {
  return {
    ...blockedStage7(),
    taskStatus: 'ready',
    statusLabel: 'Decision required',
    blocker: {
      kind: 'take-scheduling',
      headline: 'Take ready to schedule',
      detail: 'Soundstage 7 is ready.',
    },
    currentCommand: {
      kind: 'scheduleShootingTake',
      productionId: 'prod-stage-7',
      label: 'Schedule Stage Seven Picture shooting take',
    },
    ...overrides,
  }
}

function stage12(
  overrides: Partial<ProductionOperationsState> = {},
): ProductionOperationsState {
  return {
    ...blockedStage7(),
    productionId: 'prod-stage-12',
    title: 'Stage Twelve Picture',
    locationBuildingId: 'stage-b',
    currentCommand: {
      kind: 'clearSceneryLoadIn',
      productionId: 'prod-stage-12',
      label: 'Clear scenery load-in',
    },
    ...overrides,
  }
}

function publicityOffersAtWeek(week: number): LotPublicityOffer[] {
  const available = {
    globalCooldownWeeks: 6,
    available: true,
    availableWeek: week,
    reason: null,
  } as const
  return [
    {
      tier: 'whisper',
      cost: 1_200_000,
      maxLift: 18,
      expectedLift: 0.28125,
      pricePerPoint: 4_266_666.666666667,
      cooldownWeeks: 8,
      ...available,
    },
    {
      tier: 'push',
      cost: 3_600_000,
      maxLift: 30,
      expectedLift: 0.46875,
      pricePerPoint: 7_680_000,
      cooldownWeeks: 12,
      ...available,
    },
    {
      tier: 'blitz',
      cost: 8_000_000,
      maxLift: 42,
      expectedLift: 0.65625,
      pricePerPoint: 12_190_476.19047619,
      cooldownWeeks: 20,
      ...available,
    },
  ]
}

function managedSnapshot(
  productionOperations: ProductionOperationsState[],
): StudioLotSnapshot {
  return {
    studioName: 'Project Studio',
    week: 30,
    cash: 11_160_898.29,
    cashBand: 'flush',
    standing: 'established',
    standingValues: { awareness: 50, prestige: 50, confidence: 50 },
    publicityOffers: publicityOffersAtWeek(30),
    activeProductions: [],
    releasedFilms: [],
    releasePresence: 'none',
    latestReleaseTitle: null,
    people: [],
    buildings: [],
    selectedBuildingId: null,
    sceneSeed: 'scenery-selector',
    operationsMode: 'managed',
    stageAssignmentAuthority: 'engine',
    productionOperations,
  }
}

describe('world-first Scenery & Service exact selector', () => {
  it('returns the exact unique Stage 7 blocked operation without cloning or inference', () => {
    const operation = blockedStage7()

    const selected = sceneryLoadInContext(managedSnapshot([operation]))

    expect(selected).toEqual({ state: 'blocked', operation })
    expect(selected?.operation).toBe(operation)
  })

  it('returns the exact unique Stage 7 ready successor operation', () => {
    const operation = readyStage7()

    const selected = sceneryLoadInContext(managedSnapshot([operation]))

    expect(selected).toEqual({ state: 'ready', operation })
    expect(selected?.operation).toBe(operation)
  })

  it.each([
    ['Stage 12 before Stage 7', [stage12(), blockedStage7()]],
    ['Stage 7 before Stage 12', [blockedStage7(), stage12()]],
  ])('selects Stage 7 by exact location with %s array order', (_name, operations) => {
    const selected = sceneryLoadInContext(managedSnapshot(operations))

    expect(selected?.operation.productionId).toBe('prod-stage-7')
    expect(selected?.state).toBe('blocked')
  })

  it('does not borrow a valid scenery intervention from Stage 12', () => {
    expect(sceneryLoadInContext(managedSnapshot([stage12()]))).toBeNull()
  })

  it('fails closed for zero or duplicate Stage 7 records regardless of their validity or order', () => {
    const valid = blockedStage7()
    const duplicate = readyStage7({
      productionId: 'other-stage-7',
      currentCommand: {
        kind: 'scheduleShootingTake',
        productionId: 'other-stage-7',
        label: 'Schedule other take',
      },
    })
    const malformedDuplicate = blockedStage7({
      productionId: 'malformed-stage-7',
      taskStatus: 'scheduled',
      currentCommand: null,
    })

    expect(sceneryLoadInContext(managedSnapshot([]))).toBeNull()
    expect(sceneryLoadInContext(managedSnapshot([valid, duplicate]))).toBeNull()
    expect(sceneryLoadInContext(managedSnapshot([duplicate, valid]))).toBeNull()
    expect(sceneryLoadInContext(managedSnapshot([valid, malformedDuplicate]))).toBeNull()
  })

  it('requires both managed operations and Engine stage-assignment authority', () => {
    const authoritative = managedSnapshot([blockedStage7()])
    const legacy: StudioLotSnapshot = {
      ...authoritative,
      operationsMode: 'legacy',
      stageAssignmentAuthority: 'presentation',
    }
    const managedPresentation = {
      ...authoritative,
      stageAssignmentAuthority: 'presentation',
    } as unknown as StudioLotSnapshot
    const legacyEngine = {
      ...authoritative,
      operationsMode: 'legacy',
    } as unknown as StudioLotSnapshot

    expect(sceneryLoadInContext(legacy)).toBeNull()
    expect(sceneryLoadInContext(managedPresentation)).toBeNull()
    expect(sceneryLoadInContext(legacyEngine)).toBeNull()
  })

  it.each([
    ['wrong phase', blockedStage7({ phase: 'rehearsal' })],
    ['legacy phase', blockedStage7({ phase: 'legacy' })],
    ['wrong blocked task status', blockedStage7({ taskStatus: 'ready' })],
    ['scheduled task', blockedStage7({ taskStatus: 'scheduled' })],
    ['completed task', blockedStage7({ taskStatus: 'completed' })],
    ['absent task', blockedStage7({ taskStatus: null })],
    ['wrong blocked blocker', blockedStage7({ blocker: readyStage7().blocker })],
    ['facility blocker', blockedStage7({
      blocker: {
        kind: 'facility-capacity',
        headline: 'No capacity',
        detail: 'Soundstage unavailable.',
      },
    })],
    ['absent blocker', blockedStage7({ blocker: null })],
    ['wrong blocked command', blockedStage7({ currentCommand: readyStage7().currentCommand })],
    ['assign command', blockedStage7({
      currentCommand: {
        kind: 'assignShootingDirector',
        productionId: 'prod-stage-7',
        directorId: 'director-stage-7',
        label: 'Call director',
      },
    })],
    ['absent blocked command', blockedStage7({ currentCommand: null })],
    ['mismatched blocked production id', blockedStage7({
      currentCommand: {
        kind: 'clearSceneryLoadIn',
        productionId: 'different-production',
        label: 'Clear scenery load-in',
      },
    })],
    ['wrong ready task status', readyStage7({ taskStatus: 'blocked' })],
    ['wrong ready blocker', readyStage7({ blocker: blockedStage7().blocker })],
    ['absent ready blocker', readyStage7({ blocker: null })],
    ['wrong ready command', readyStage7({ currentCommand: blockedStage7().currentCommand })],
    ['absent ready command', readyStage7({ currentCommand: null })],
    ['mismatched ready production id', readyStage7({
      currentCommand: {
        kind: 'scheduleShootingTake',
        productionId: 'different-production',
        label: 'Schedule take',
      },
    })],
  ])('fails closed for %s', (_name, malformed) => {
    expect(sceneryLoadInContext(managedSnapshot([malformed]))).toBeNull()
  })

  it('does not select by title text, facility label, blocker copy, or first array position', () => {
    const hostileFirst = stage12({
      title: 'Stage Seven Picture',
      facilityLabel: 'Soundstage 7 + Scenery Shop',
    })
    const exact = readyStage7({
      title: 'Different title',
      facilityLabel: 'Renamed presentation label',
      blocker: {
        kind: 'take-scheduling',
        headline: 'Different headline',
        detail: 'Different detail.',
      },
    })

    const selected = sceneryLoadInContext(managedSnapshot([hostileFirst, exact]))

    expect(selected).toEqual({ state: 'ready', operation: exact })
  })

  it('fails closed instead of throwing when a malformed managed snapshot omits operations', () => {
    const malformed = {
      ...managedSnapshot([blockedStage7()]),
      productionOperations: undefined,
    } as unknown as StudioLotSnapshot

    expect(sceneryLoadInContext(malformed)).toBeNull()
  })
})
