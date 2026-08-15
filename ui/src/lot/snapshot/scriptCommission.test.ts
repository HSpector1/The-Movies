import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  FOUNDING_MINIMUMS,
  applyActions,
  beginFounding,
  generateWorld,
  type GameState,
} from '../../../../src/core/index.ts'
import * as adapter from '../../engine/adapter.ts'
import {
  commissionScriptAction,
  scriptProjectsBoard,
  type CommissionScriptPayload,
  type ScriptProjectsReadModel,
} from '../../engine/adapter.ts'
import {
  acceptedScreenplayCommissionReceipt,
  currentScreenplayCommissionReceipt,
  sameScreenplayCommissionReceipt,
  type ScreenplayCommissionReceipt,
} from './scriptCommission.ts'

function clone<T>(value: T): T {
  return structuredClone(value)
}

function managedStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const applicants = state.founding!.applicantIds.map(
    (id) => state.talent.find((person) => person.id === id)!,
  )
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const person of applicants
      .filter((candidate) => candidate.role === role)
      .slice(0, FOUNDING_MINIMUMS[role])) {
      state = applyActions(state, [
        { kind: 'signContract', talentId: person.id, termWeeks: 156 },
      ])
    }
  }
  state = applyActions(state, [
    { kind: 'foundStudio' },
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
  ])
  return state
}

function payloadFor(state: GameState): CommissionScriptPayload {
  const board = scriptProjectsBoard(state)
  const concept = board.commission.concepts[0]!
  const writer = board.commission.writers.find((candidate) => candidate.available)!
  return {
    conceptId: concept.id,
    writerId: writer.id,
    shape: {
      opening: 'mysteryHook',
      midpoint: 'revelation',
      ending: 'bittersweet',
    },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult', 'prestige'],
      ranges: {
        intimacy: [-0.5, 0.5],
        tonalWeight: [0, 1],
        kineticEnergy: [-1, 0],
      },
    },
  }
}

function acceptedPair(seed: string): {
  before: GameState
  after: GameState
  payload: CommissionScriptPayload
} {
  const before = managedStudio(seed)
  const payload = payloadFor(before)
  const result = commissionScriptAction(before, payload)
  if (!result.ok) throw new Error(result.error)
  return { before, after: result.next, payload }
}

function expectReceipt(pair: ReturnType<typeof acceptedPair>): ScreenplayCommissionReceipt {
  const receipt = acceptedScreenplayCommissionReceipt(pair.before, pair.after, pair.payload)
  expect(receipt).not.toBeNull()
  return receipt!
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('accepted screenplay commission receipt', () => {
  it('accepts only the exact real action and returns the closed witness identity', () => {
    const pair = acceptedPair('script-commission-receipt-positive')
    const receipt = expectReceipt(pair)
    const concept = pair.before.concepts.find((candidate) => candidate.id === pair.payload.conceptId)!
    const writer = pair.before.talent.find((candidate) => candidate.id === pair.payload.writerId)!

    expect(receipt).toEqual({
      projectId: 'script-0000',
      conceptId: concept.id,
      title: concept.title,
      writerId: writer.id,
      writerName: writer.name,
      commissionedWeek: pair.before.market.tick,
      dueWeek: pair.before.market.tick + 1,
      facilityId: 'facility-development-casting',
      facilityName: 'Development & Casting',
      slot: 0,
    })
    expect(Object.keys(receipt)).toEqual([
      'projectId',
      'conceptId',
      'title',
      'writerId',
      'writerName',
      'commissionedWeek',
      'dueWeek',
      'facilityId',
      'facilityName',
      'slot',
    ])
    expect(currentScreenplayCommissionReceipt(pair.after, receipt)).toEqual(receipt)
    expect(currentScreenplayCommissionReceipt(pair.after, receipt)).not.toBe(receipt)
  })

  it('rejects same-state, studio, tick, RNG, mode, and every non-project mutation', () => {
    const pair = acceptedPair('script-commission-receipt-state')
    expect(acceptedScreenplayCommissionReceipt(pair.before, pair.before, pair.payload)).toBeNull()
    expect(acceptedScreenplayCommissionReceipt(pair.after, pair.after, pair.payload)).toBeNull()

    const hostile: GameState[] = [
      { ...pair.after, seed: `${pair.after.seed}-other` },
      { ...pair.after, rngState: `${pair.after.rngState}-other` },
      { ...pair.after, market: { ...pair.after.market, tick: pair.after.market.tick + 1 } },
      { ...pair.after, operations: { ...pair.after.operations, mode: 'legacy' } },
      { ...pair.after, studio: { ...pair.after.studio, cash: pair.after.studio.cash + 1 } },
    ]
    for (const state of hostile) {
      expect(acceptedScreenplayCommissionReceipt(pair.before, state, pair.payload)).toBeNull()
    }

    const extraRoot = { ...clone(pair.after), unowned: true } as GameState
    expect(acceptedScreenplayCommissionReceipt(pair.before, extraRoot, pair.payload)).toBeNull()
  })

  it('rejects missing, replaced, reordered, duplicate, noncanonical, or changed project facts', () => {
    const pair = acceptedPair('script-commission-receipt-project')
    const mutations: Array<(state: GameState) => void> = [
      (state) => { state.scriptDevelopment.projects = [] },
      (state) => { state.scriptDevelopment.projects.push(clone(state.scriptDevelopment.projects[0]!)) },
      (state) => { state.scriptDevelopment.projects[0]!.id = 'script-9000' },
      (state) => { state.scriptDevelopment.projects[0]!.conceptId = state.concepts[1]!.id },
      (state) => { state.scriptDevelopment.projects[0]!.writerId = state.talent.find((person) => person.role === 'director')!.id },
      (state) => { state.scriptDevelopment.projects[0]!.shape.ending = 'tragic' },
      (state) => { state.scriptDevelopment.projects[0]!.promise.intendedSegments = ['family'] },
      (state) => { state.scriptDevelopment.projects[0]!.rewriteCount = 1 },
      (state) => { state.scriptDevelopment.projects[0]!.dueWeek! += 1 },
      (state) => { state.scriptDevelopment.projects[0]!.productionId = 'prod-impossible' },
      (state) => { Object.assign(state.scriptDevelopment.projects[0]!, { extra: true }) },
    ]
    for (const mutate of mutations) {
      const changed = clone(pair.after)
      mutate(changed)
      expect(acceptedScreenplayCommissionReceipt(pair.before, changed, pair.payload)).toBeNull()
    }
  })

  it('requires the exact deterministic first-free facility slot, not merely a valid free slot', () => {
    const pair = acceptedPair('script-commission-receipt-slot')
    const noncanonical = clone(pair.after)
    noncanonical.scriptDevelopment.projects[0]!.reservation!.slot = 1

    expect(noncanonical.operations.facilities[0]!.capacity).toBe(2)
    expect(acceptedScreenplayCommissionReceipt(pair.before, noncanonical, pair.payload)).toBeNull()
    expectReceipt(pair)
  })

  it('requires the exact explicit payload and rejects malformed or widened payload copies', () => {
    const pair = acceptedPair('script-commission-receipt-payload')
    const otherConcept = { ...pair.payload, conceptId: pair.before.concepts[1]!.id }
    const otherWriter = {
      ...pair.payload,
      writerId: pair.before.talent.find((person) => person.role === 'director')!.id,
    }
    const otherShape = {
      ...pair.payload,
      shape: { ...pair.payload.shape, opening: 'slowSetup' as const },
    }
    const otherPromise: CommissionScriptPayload = {
      ...pair.payload,
      promise: { ...pair.payload.promise, intendedSegments: ['family'] },
    }
    const widened = { ...pair.payload, recommendation: true } as CommissionScriptPayload
    for (const payload of [otherConcept, otherWriter, otherShape, otherPromise, widened]) {
      expect(acceptedScreenplayCommissionReceipt(pair.before, pair.after, payload)).toBeNull()
    }
  })

  it('rejects selected title and writer-name ambiguity instead of substituting by label', () => {
    const titlePair = acceptedPair('script-commission-receipt-title-ambiguity')
    const titleBefore = clone(titlePair.before)
    titleBefore.concepts[1]!.title = titleBefore.concepts.find(
      (concept) => concept.id === titlePair.payload.conceptId,
    )!.title
    const titleResult = commissionScriptAction(titleBefore, titlePair.payload)
    expect(titleResult.ok).toBe(true)
    if (titleResult.ok) {
      expect(
        acceptedScreenplayCommissionReceipt(titleBefore, titleResult.next, titlePair.payload),
      ).toBeNull()
    }

    const writerPair = acceptedPair('script-commission-receipt-writer-ambiguity')
    const writerBefore = clone(writerPair.before)
    const selectedWriter = writerBefore.talent.find(
      (person) => person.id === writerPair.payload.writerId,
    )!
    const anotherPerson = writerBefore.talent.find((person) => person.id !== selectedWriter.id)!
    anotherPerson.name = selectedWriter.name
    const writerResult = commissionScriptAction(writerBefore, writerPair.payload)
    expect(writerResult.ok).toBe(true)
    if (writerResult.ok) {
      expect(
        acceptedScreenplayCommissionReceipt(writerBefore, writerResult.next, writerPair.payload),
      ).toBeNull()
    }
  })

  it('requires an idle, startable canonical before projection and an available projected writer', () => {
    const pair = acceptedPair('script-commission-receipt-before-projection')
    const original = scriptProjectsBoard(pair.before)
    const projections: ScriptProjectsReadModel[] = []

    const active = clone(original)
    active.lotAttention = {
      kind: 'active-work',
      headline: 'Hostile active work',
      detail: 'Not idle.',
    }
    projections.push(active)

    const blocked = clone(original)
    blocked.commission.canStart = false
    projections.push(blocked)

    const unavailable = clone(original)
    unavailable.commission.writers.find(
      (writer) => writer.id === pair.payload.writerId,
    )!.available = false
    projections.push(unavailable)

    const falseFree = clone(original)
    falseFree.capacity.facilities[0]!.slots[0]!.occupant = {
      owner: 'script',
      ownerId: 'hostile-project',
      activity: 'drafting',
      title: 'Hostile title',
      label: 'Hostile label',
    }
    falseFree.capacity.facilities[0]!.occupied = 1
    falseFree.capacity.facilities[0]!.available -= 1
    falseFree.capacity.occupied = 1
    falseFree.capacity.available -= 1
    projections.push(falseFree)

    for (const projection of projections) {
      vi.spyOn(adapter, 'scriptProjectsBoard').mockReturnValue(projection)
      expect(
        acceptedScreenplayCommissionReceipt(pair.before, pair.after, pair.payload),
      ).toBeNull()
      vi.restoreAllMocks()
    }
  })

  it('fails neutral on throwing reads and hostile array/object topology', () => {
    const pair = acceptedPair('script-commission-receipt-hostile')
    const throwing = clone(pair.after) as GameState
    Object.defineProperty(throwing, 'scriptDevelopment', {
      enumerable: true,
      get() {
        throw new Error('hostile getter')
      },
    })
    expect(acceptedScreenplayCommissionReceipt(pair.before, throwing, pair.payload)).toBeNull()

    const sparse = clone(pair.after)
    delete sparse.scriptDevelopment.projects[0]
    expect(acceptedScreenplayCommissionReceipt(pair.before, sparse, pair.payload)).toBeNull()

    const symbolProject = clone(pair.after)
    Object.assign(symbolProject.scriptDevelopment.projects[0]!, {
      [Symbol('hostile')]: true,
    })
    expect(acceptedScreenplayCommissionReceipt(pair.before, symbolProject, pair.payload)).toBeNull()
  })
})

describe('current and same screenplay commission receipt', () => {
  it('compares every closed field and rejects extra or malformed receipt structure', () => {
    const pair = acceptedPair('script-commission-receipt-same')
    const receipt = expectReceipt(pair)
    expect(sameScreenplayCommissionReceipt(receipt, { ...receipt })).toBe(true)
    expect(sameScreenplayCommissionReceipt(null, null)).toBe(true)
    expect(sameScreenplayCommissionReceipt(receipt, null)).toBe(false)

    const changes: ScreenplayCommissionReceipt[] = [
      { ...receipt, projectId: 'script-other' },
      { ...receipt, conceptId: 'concept-other' },
      { ...receipt, title: 'Other title' },
      { ...receipt, writerId: 'writer-other' },
      { ...receipt, writerName: 'Other writer' },
      { ...receipt, commissionedWeek: receipt.commissionedWeek + 1, dueWeek: receipt.dueWeek + 1 },
      { ...receipt, dueWeek: receipt.dueWeek + 1 },
      { ...receipt, facilityId: 'facility-other' },
      { ...receipt, facilityName: 'Other facility' },
      { ...receipt, slot: receipt.slot + 1 },
    ]
    for (const changed of changes) {
      expect(sameScreenplayCommissionReceipt(receipt, changed)).toBe(false)
    }
    const extra = { ...receipt, extra: true } as ScreenplayCommissionReceipt
    expect(sameScreenplayCommissionReceipt(extra, extra)).toBe(false)
  })

  it('revalidates exact current project, names, timing, reservation, and capacity occupancy', () => {
    const pair = acceptedPair('script-commission-receipt-current')
    const receipt = expectReceipt(pair)

    for (const changedReceipt of [
      { ...receipt, title: 'Wrong title' },
      { ...receipt, writerName: 'Wrong writer' },
      { ...receipt, facilityName: 'Wrong facility' },
      { ...receipt, slot: 1 },
    ]) {
      expect(currentScreenplayCommissionReceipt(pair.after, changedReceipt)).toBeNull()
    }

    const changedProject = clone(pair.after)
    changedProject.scriptDevelopment.projects[0]!.shape.opening = 'slowSetup'
    expect(currentScreenplayCommissionReceipt(changedProject, receipt)).toEqual(receipt)

    const noProject = clone(pair.after)
    noProject.scriptDevelopment.projects = []
    expect(currentScreenplayCommissionReceipt(noProject, receipt)).toBeNull()

    const duplicateTitle = clone(pair.after)
    duplicateTitle.concepts[1]!.title = receipt.title
    expect(currentScreenplayCommissionReceipt(duplicateTitle, receipt)).toBeNull()

    const original = scriptProjectsBoard(pair.after)
    const falseOccupancy = clone(original)
    falseOccupancy.capacity.facilities[0]!.slots[0]!.occupant = null
    falseOccupancy.capacity.facilities[0]!.occupied = 0
    falseOccupancy.capacity.facilities[0]!.available = 2
    falseOccupancy.capacity.occupied = 0
    falseOccupancy.capacity.available = 2
    vi.spyOn(adapter, 'scriptProjectsBoard').mockReturnValue(falseOccupancy)
    expect(currentScreenplayCommissionReceipt(pair.after, receipt)).toBeNull()
  })
})
