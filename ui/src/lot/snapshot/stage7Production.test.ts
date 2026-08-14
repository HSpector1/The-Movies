import { describe, expect, it } from 'vitest'
import type {
  ProductionOperationsState,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'
import {
  sameStage7ProductionDetailContext,
  stage7ProductionDetailContext,
  type Stage7ProductionDetailContext,
} from './stage7Production.ts'

function operation(
  overrides: Partial<ProductionOperationsState> = {},
): ProductionOperationsState {
  return {
    productionId: 'production-stage-7',
    title: 'Nights of the Watchtower',
    phase: 'shooting',
    phaseLabel: 'Shooting',
    weeksRemaining: 4,
    progress01: 0.5,
    locationBuildingId: 'stage-a',
    facilityLabel: 'Soundstage 7',
    directorId: 'director-7',
    directorName: 'Mara Voss',
    leadId: 'lead-7',
    leadName: 'Elias North',
    taskStatus: 'scheduled',
    statusLabel: 'Take scheduled',
    blocker: null,
    attention: 'active',
    currentCommand: null,
    ...overrides,
  }
}

function stage12(
  overrides: Partial<ProductionOperationsState> = {},
): ProductionOperationsState {
  return operation({
    productionId: 'production-stage-12',
    locationBuildingId: 'stage-b',
    title: 'Stage Twelve Picture',
    ...overrides,
  })
}

function snapshot(
  productionOperations: ProductionOperationsState[],
): StudioLotSnapshot {
  return {
    studioName: 'Project Studio',
    week: 30,
    cash: 12_000_000,
    cashBand: 'stable',
    standing: 'established',
    standingValues: { awareness: 40, prestige: 50, confidence: 60 },
    publicityOffers: [],
    annexWork: null,
    activeProductions: [],
    releasedFilms: [],
    releasePresence: 'none',
    latestReleaseTitle: null,
    people: [],
    buildings: [],
    selectedBuildingId: null,
    sceneSeed: 'stage-7-detail-selector',
    operationsMode: 'managed',
    stageAssignmentAuthority: 'engine',
    productionOperations,
  }
}

describe('Stage 7 production detail selector', () => {
  it('returns the original exact managed Engine-owned Rehearsal operation and identity intent', () => {
    const exact = operation({
      phase: 'rehearsal',
      phaseLabel: 'Rehearsal',
      taskStatus: null,
      statusLabel: 'Rehearsing on Soundstage 7',
      attention: 'normal',
    })

    const selected = stage7ProductionDetailContext(snapshot([exact]))

    expect(selected).toEqual({
      operation: exact,
      ownerIntent: {
        productionId: 'production-stage-7',
        locationBuildingId: 'stage-a',
      },
    })
    expect(selected?.operation).toBe(exact)
  })

  it.each([
    operation({
      taskStatus: 'unassigned',
      statusLabel: 'Director required',
      attention: 'decision-required',
      blocker: {
        kind: 'director-dispatch',
        headline: 'Director must report',
        detail: 'The assigned Director has not reached the stage.',
      },
      currentCommand: {
        kind: 'assignShootingDirector',
        productionId: 'production-stage-7',
        directorId: 'director-7',
        label: 'Dispatch Mara Voss',
      },
    }),
    operation({
      taskStatus: 'blocked',
      statusLabel: 'Production hold',
      attention: 'decision-required',
      blocker: {
        kind: 'scenery-load-in',
        headline: 'Scenery load-in required',
        detail: 'The set must be loaded before shooting.',
      },
      currentCommand: {
        kind: 'clearSceneryLoadIn',
        productionId: 'production-stage-7',
        label: 'Clear scenery load-in',
      },
    }),
    operation({
      taskStatus: 'ready',
      statusLabel: 'Take ready',
      attention: 'decision-required',
      blocker: {
        kind: 'take-scheduling',
        headline: 'Take needs scheduling',
        detail: 'The company is ready to shoot.',
      },
      currentCommand: {
        kind: 'scheduleShootingTake',
        productionId: 'production-stage-7',
        label: 'Schedule the shooting take',
      },
    }),
    operation({ taskStatus: 'scheduled', statusLabel: 'Take scheduled' }),
    operation({ taskStatus: 'completed', statusLabel: 'Shooting completed' }),
  ])('accepts every closed Shooting task projection', (exact) => {
    expect(stage7ProductionDetailContext(snapshot([exact]))?.operation).toBe(exact)
  })

  it('is independent of array order and same-title Stage 12 operations', () => {
    const exact = operation()
    const other = stage12({ title: exact.title })

    expect(stage7ProductionDetailContext(snapshot([other, exact]))?.operation).toBe(exact)
    expect(stage7ProductionDetailContext(snapshot([exact, other]))?.operation).toBe(exact)
  })

  it('requires one Stage 7 row and a globally unique production identity', () => {
    const exact = operation()
    const anotherStage7 = operation({ productionId: 'another-stage-7' })
    const duplicateIdAtStage12 = stage12({ productionId: exact.productionId })

    expect(stage7ProductionDetailContext(snapshot([]))).toBeNull()
    expect(stage7ProductionDetailContext(snapshot([stage12()]))).toBeNull()
    expect(stage7ProductionDetailContext(snapshot([exact, anotherStage7]))).toBeNull()
    expect(stage7ProductionDetailContext(snapshot([anotherStage7, exact]))).toBeNull()
    expect(stage7ProductionDetailContext(snapshot([exact, duplicateIdAtStage12]))).toBeNull()
  })

  it('requires managed operations, Engine assignment authority, and an array', () => {
    const authoritative = snapshot([operation()])
    const legacy: StudioLotSnapshot = {
      ...authoritative,
      operationsMode: 'legacy',
      stageAssignmentAuthority: 'presentation',
    }
    const presentation = {
      ...authoritative,
      stageAssignmentAuthority: 'presentation',
    } as unknown as StudioLotSnapshot
    const missing = {
      ...authoritative,
      productionOperations: undefined,
    } as unknown as StudioLotSnapshot

    expect(stage7ProductionDetailContext(legacy)).toBeNull()
    expect(stage7ProductionDetailContext(presentation)).toBeNull()
    expect(stage7ProductionDetailContext(missing)).toBeNull()
  })

  it.each([
    ['empty production id', { productionId: ' ' }],
    ['empty title', { title: '' }],
    ['wrong phase', { phase: 'postProduction' }],
    ['empty phase label', { phaseLabel: '\t' }],
    ['negative countdown', { weeksRemaining: -1 }],
    ['fractional countdown', { weeksRemaining: 1.5 }],
    ['unsafe countdown', { weeksRemaining: Number.MAX_SAFE_INTEGER + 1 }],
    ['non-finite progress', { progress01: Number.POSITIVE_INFINITY }],
    ['NaN progress', { progress01: Number.NaN }],
    ['negative progress', { progress01: -0.01 }],
    ['progress above one', { progress01: 1.01 }],
    ['empty facility label', { facilityLabel: ' ' }],
    ['empty Director id', { directorId: '' }],
    ['empty Director name', { directorName: '\n' }],
    ['invalid task status', { taskStatus: 'waiting' }],
    ['empty status label', { statusLabel: '' }],
    ['invalid attention', { attention: 'urgent' }],
    ['missing blocker field', { blocker: undefined }],
    ['invalid blocker kind', {
      blocker: { kind: 'weather', headline: 'Storm', detail: 'Rain delay.' },
    }],
    ['empty blocker headline', {
      blocker: { kind: 'facility-capacity', headline: ' ', detail: 'Stage held.' },
    }],
    ['empty blocker detail', {
      blocker: { kind: 'facility-capacity', headline: 'Stage held', detail: '' },
    }],
    ['missing command field', { currentCommand: undefined }],
    ['invalid command kind', {
      currentCommand: {
        kind: 'startShooting',
        productionId: 'production-stage-7',
        label: 'Start shooting',
      },
    }],
    ['empty command label', {
      currentCommand: {
        kind: 'clearSceneryLoadIn',
        productionId: 'production-stage-7',
        label: ' ',
      },
    }],
    ['drifted command production', {
      currentCommand: {
        kind: 'clearSceneryLoadIn',
        productionId: 'another-production',
        label: 'Clear scenery load-in',
      },
    }],
    ['drifted assign Director', {
      currentCommand: {
        kind: 'assignShootingDirector',
        productionId: 'production-stage-7',
        directorId: 'another-director',
        label: 'Dispatch Director',
      },
    }],
    ['half-present Lead id', { leadName: undefined }],
    ['half-present Lead name', { leadId: undefined }],
    ['empty Lead id', { leadId: '', leadName: 'Elias North' }],
    ['empty Lead name', { leadId: 'lead-7', leadName: ' ' }],
  ])('fails closed for %s', (_name, overrides) => {
    const malformed = operation(
      overrides as unknown as Partial<ProductionOperationsState>,
    )
    expect(stage7ProductionDetailContext(snapshot([malformed]))).toBeNull()
  })

  it('accepts both a wholly absent Lead and a complete non-empty Lead pair', () => {
    const absent = operation()
    delete absent.leadId
    delete absent.leadName
    const complete = operation()

    expect(stage7ProductionDetailContext(snapshot([absent]))?.operation).toBe(absent)
    expect(stage7ProductionDetailContext(snapshot([complete]))?.operation).toBe(complete)
  })

  it('validates closed blocker and command discriminants without recomputing production legality', () => {
    const structurallyValid = operation({
      phase: 'rehearsal',
      phaseLabel: 'Rehearsal',
      taskStatus: 'completed',
      blocker: {
        kind: 'director-dispatch',
        headline: 'Projected blocker',
        detail: 'Adapter-owned projected detail.',
      },
      currentCommand: {
        kind: 'clearSceneryLoadIn',
        productionId: 'production-stage-7',
        label: 'Projected command',
      },
    })

    expect(stage7ProductionDetailContext(snapshot([structurallyValid]))?.operation)
      .toBe(structurallyValid)
  })

  it('does not mutate the snapshot, operation, blocker, command, or owner identities', () => {
    const exact = operation({
      taskStatus: 'unassigned',
      blocker: Object.freeze({
        kind: 'director-dispatch',
        headline: 'Director required',
        detail: 'The Director must report.',
      }),
      currentCommand: Object.freeze({
        kind: 'assignShootingDirector',
        productionId: 'production-stage-7',
        directorId: 'director-7',
        label: 'Dispatch Director',
      }),
    })
    Object.freeze(exact)
    const authoritative = snapshot([exact])
    Object.freeze(authoritative.productionOperations)
    Object.freeze(authoritative)
    const before = JSON.stringify(authoritative)

    const selected = stage7ProductionDetailContext(authoritative)

    expect(JSON.stringify(authoritative)).toBe(before)
    expect(selected?.operation).toBe(exact)
    expect(selected?.ownerIntent).toEqual({
      productionId: 'production-stage-7',
      locationBuildingId: 'stage-a',
    })
  })
})

describe('Stage 7 rendered-token equality', () => {
  function context(
    overrides: Partial<ProductionOperationsState> = {},
  ): Stage7ProductionDetailContext {
    const exact = operation(overrides)
    return {
      operation: exact,
      ownerIntent: {
        productionId: exact.productionId,
        locationBuildingId: 'stage-a',
      },
    }
  }

  it('accepts field-identical contexts and null only with null', () => {
    expect(sameStage7ProductionDetailContext(context(), context())).toBe(true)
    expect(sameStage7ProductionDetailContext(null, null)).toBe(true)
    expect(sameStage7ProductionDetailContext(context(), null)).toBe(false)
    expect(sameStage7ProductionDetailContext(null, context())).toBe(false)
  })

  it('rejects every independently changed rendered or identity field', () => {
    const base = context({
      taskStatus: 'unassigned',
      attention: 'decision-required',
      blocker: {
        kind: 'director-dispatch',
        headline: 'Director required',
        detail: 'The Director must report.',
      },
      currentCommand: {
        kind: 'assignShootingDirector',
        productionId: 'production-stage-7',
        directorId: 'director-7',
        label: 'Dispatch Director',
      },
    })

    const withOperation = (
      overrides: Partial<ProductionOperationsState>,
    ): Stage7ProductionDetailContext => ({
      ...base,
      operation: { ...base.operation, ...overrides },
    })

    const changed: Stage7ProductionDetailContext[] = [
      { ...base, ownerIntent: { ...base.ownerIntent, productionId: 'other' } },
      {
        ...base,
        ownerIntent: {
          ...base.ownerIntent,
          locationBuildingId: 'stage-b',
        } as unknown as Stage7ProductionDetailContext['ownerIntent'],
      },
      withOperation({ productionId: 'other-production' }),
      withOperation({ locationBuildingId: 'stage-b' }),
      withOperation({ title: 'Another title' }),
      withOperation({ phase: 'rehearsal' }),
      withOperation({ phaseLabel: 'Principal photography' }),
      withOperation({ weeksRemaining: 3 }),
      withOperation({ progress01: 0.625 }),
      withOperation({ facilityLabel: 'Renamed stage' }),
      withOperation({ directorId: 'other-director' }),
      withOperation({ directorName: 'Another Director' }),
      withOperation({ leadId: 'other-lead' }),
      withOperation({ leadName: 'Another Lead' }),
      withOperation({ taskStatus: 'blocked' }),
      withOperation({ statusLabel: 'Another status' }),
      withOperation({ attention: 'warning' }),
      withOperation({
        blocker: {
          kind: 'facility-capacity',
          headline: 'Director required',
          detail: 'The Director must report.',
        },
      }),
      withOperation({
        blocker: {
          kind: 'director-dispatch',
          headline: 'Different headline',
          detail: 'The Director must report.',
        },
      }),
      withOperation({
        blocker: {
          kind: 'director-dispatch',
          headline: 'Director required',
          detail: 'Different detail.',
        },
      }),
      withOperation({ blocker: null }),
      withOperation({
        currentCommand: {
          kind: 'clearSceneryLoadIn',
          productionId: 'production-stage-7',
          label: 'Dispatch Director',
        },
      }),
      withOperation({
        currentCommand: {
          kind: 'assignShootingDirector',
          productionId: 'other-production',
          directorId: 'director-7',
          label: 'Dispatch Director',
        },
      }),
      withOperation({
        currentCommand: {
          kind: 'assignShootingDirector',
          productionId: 'production-stage-7',
          directorId: 'other-director',
          label: 'Dispatch Director',
        },
      }),
      withOperation({
        currentCommand: {
          kind: 'assignShootingDirector',
          productionId: 'production-stage-7',
          directorId: 'director-7',
          label: 'Different label',
        },
      }),
      withOperation({ currentCommand: null }),
    ]

    for (const candidate of changed) {
      expect(sameStage7ProductionDetailContext(base, candidate)).toBe(false)
    }
  })
})
