import { describe, expect, it } from 'vitest'
import {
  FOUNDING_MINIMUMS,
  TUNING,
  applyActions,
  beginFounding,
  generateWorld,
  tick,
  type CastSlot,
  type CommissionScriptPayload,
  type CreativeRole,
  type GameState,
  type GreenlightScriptProjectPayload,
  type SegmentId,
} from '../../../../src/core/index.ts'
import { studioLotSnapshot } from '../../engine/adapter.ts'
import type {
  LotPersonState,
  ProductionOperationsState,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'
import {
  acceptedGreenlightFormationReceipt,
  initialProductionFormationContext,
  productionFormationContext,
  sameGreenlightFormationReceipt,
  type GreenlightFormationReceipt,
} from './productionFormation.ts'

function foundStudio(seed: string, rich = false): GameState {
  let state = beginFounding(generateWorld(seed))
  const applicants = state.founding!.applicantIds.map(
    (id) => state.talent.find((person) => person.id === id)!,
  )
  const richCounts: Record<CreativeRole, number> = {
    actor: 6,
    director: 2,
    writer: 2,
    craft: 2,
  }
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const person of applicants
      .filter((candidate) => candidate.role === role)
      .slice(0, rich ? richCounts[role] : FOUNDING_MINIMUMS[role])) {
      state = applyActions(state, [
        { kind: 'signContract', talentId: person.id, termWeeks: 156 },
      ])
    }
  }
  return applyActions(state, [{ kind: 'foundStudio' }])
}

function contractedIds(state: GameState, role: CreativeRole): string[] {
  const contracted = new Set(state.contracts.map((contract) => contract.talentId))
  return state.talent
    .filter((person) => person.role === role && contracted.has(person.id))
    .map((person) => person.id)
}

function directPayload(state: GameState, conceptIndex = 0, slot = 0) {
  const concept = state.concepts[conceptIndex]!
  const actors = contractedIds(state, 'actor')
  const actorOffset = slot * 3
  return {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: {
        intimacy: [-0.5, 0.5] as [number, number],
        tonalWeight: [-0.5, 0.5] as [number, number],
        kineticEnergy: [-0.5, 0.5] as [number, number],
      },
    },
    writerId: contractedIds(state, 'writer')[slot]!,
    directorId: contractedIds(state, 'director')[slot]!,
    craftIds: [contractedIds(state, 'craft')[slot]!],
    cast: {
      lead: actors[actorOffset]!,
      antagonist: actors[actorOffset + 1]!,
      support: actors[actorOffset + 2]!,
    } satisfies Record<CastSlot, string>,
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

function managedDirectPair(seed: string): { before: GameState; after: GameState } {
  const before = applyActions(foundStudio(seed), [{ kind: 'activateStudioOperations' }])
  const after = applyActions(before, [{ kind: 'greenlight', production: directPayload(before) }])
  return { before, after }
}

function managedScriptPair(seed: string): { before: GameState; after: GameState } {
  let state = applyActions(foundStudio(seed), [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
  ])
  const concept = state.concepts[0]!
  const project: CommissionScriptPayload = {
    conceptId: concept.id,
    writerId: contractedIds(state, 'writer')[0]!,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.5, 0.5],
        tonalWeight: [-0.5, 0.5],
        kineticEnergy: [-0.5, 0.5],
      },
    },
  }
  state = applyActions(state, [{ kind: 'commissionScript', project }])
  state = tick(state)
  state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0000' }])
  const before = state
  const actors = contractedIds(before, 'actor')
  const production: GreenlightScriptProjectPayload = {
    projectId: 'script-0000',
    directorId: contractedIds(before, 'director')[0]!,
    craftIds: [contractedIds(before, 'craft')[0]!],
    cast: {
      lead: actors[0]!,
      antagonist: actors[1]!,
      support: actors[2]!,
    },
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
  const after = applyActions(before, [{ kind: 'greenlightScriptProject', production }])
  return { before, after }
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

describe('accepted greenlight formation receipt', () => {
  it('accepts a real managed Ready-screenplay action and preserves only event identity', () => {
    const { before, after } = managedScriptPair('formation-receipt-script')
    const receipt = acceptedGreenlightFormationReceipt(before, after)
    const production = after.studio.activeProductions[0]!

    expect(receipt).toEqual({
      productionId: production.id,
      directorId: production.directorId,
      leadId: production.cast.lead,
      greenlightWeek: before.market.tick,
      scriptProjectId: 'script-0000',
    })
    expect(Object.keys(receipt!)).toEqual([
      'productionId',
      'directorId',
      'leadId',
      'greenlightWeek',
      'scriptProjectId',
    ])
  })

  it('accepts managed direct-greenlight compatibility only with unchanged legacy scripts', () => {
    const pair = managedDirectPair('formation-receipt-direct')
    expect(acceptedGreenlightFormationReceipt(pair.before, pair.after)?.scriptProjectId).toBeNull()

    const managedBefore = clone(pair.before)
    const managedAfter = clone(pair.after)
    managedBefore.scriptDevelopment.mode = 'managed'
    managedAfter.scriptDevelopment.mode = 'managed'
    expect(acceptedGreenlightFormationReceipt(managedBefore, managedAfter)).toBeNull()

    const legacyBefore = foundStudio('formation-receipt-legacy')
    const legacyAfter = applyActions(legacyBefore, [
      { kind: 'greenlight', production: directPayload(legacyBefore) },
    ])
    expect(acceptedGreenlightFormationReceipt(legacyBefore, legacyAfter)).toBeNull()
  })

  it('rejects identity/time/RNG drift and same-object or zero-addition transitions', () => {
    const pair = managedDirectPair('formation-receipt-root')
    expect(acceptedGreenlightFormationReceipt(pair.before, pair.before)).toBeNull()
    expect(acceptedGreenlightFormationReceipt(pair.after, pair.after)).toBeNull()

    for (const changed of [
      { ...pair.after, seed: 'another-seed' },
      { ...pair.after, rngState: `${pair.after.rngState}-changed` },
      { ...pair.after, market: { ...pair.after.market, tick: pair.after.market.tick + 1 } },
    ]) {
      expect(acceptedGreenlightFormationReceipt(pair.before, changed)).toBeNull()
    }
  })

  it('rejects malformed, duplicate, missing, or changed production identity without guessing', () => {
    const pair = managedDirectPair('formation-receipt-productions')
    const changedId = clone(pair.after)
    changedId.studio.activeProductions[0]!.id = ''
    const badCountdown = clone(pair.after)
    badCountdown.studio.activeProductions[0]!.remainingTicks = TUNING.PRODUCTION_TICKS - 1
    const samePerson = clone(pair.after)
    samePerson.studio.activeProductions[0]!.cast.lead =
      samePerson.studio.activeProductions[0]!.directorId
    const duplicateTalent = clone(pair.after)
    const director = duplicateTalent.talent.find(
      (person) => person.id === duplicateTalent.studio.activeProductions[0]!.directorId,
    )!
    duplicateTalent.talent.push(clone(director))

    for (const hostile of [changedId, badCountdown, samePerson, duplicateTalent]) {
      expect(acceptedGreenlightFormationReceipt(pair.before, hostile)).toBeNull()
    }
  })

  it('rejects hostile production/workflow array topology before selecting an added identity', () => {
    let before = applyActions(foundStudio('formation-receipt-hostile-arrays', true), [
      { kind: 'activateStudioOperations' },
    ])
    before = applyActions(before, [
      { kind: 'greenlight', production: directPayload(before, 0, 0) },
    ])
    const after = applyActions(before, [
      { kind: 'greenlight', production: directPayload(before, 1, 1) },
    ])
    const priorProductionId = before.studio.activeProductions[0]!.id
    const priorWorkflowId = before.operations.workflows[0]!.productionId

    const hostileArrays: Array<{
      label: string
      mutate(state: GameState): void
      proveTopology(state: GameState): void
    }> = [
      {
        label: 'duplicate production IDs',
        mutate: (state) => {
          state.studio.activeProductions[1]!.id = priorProductionId
        },
        proveTopology: (state) => {
          const ids = state.studio.activeProductions.map((production) => production.id)
          expect(new Set(ids).size).toBeLessThan(ids.length)
        },
      },
      {
        label: 'duplicate workflow production IDs',
        mutate: (state) => {
          state.operations.workflows[1]!.productionId = priorWorkflowId
        },
        proveTopology: (state) => {
          const ids = state.operations.workflows.map((workflow) => workflow.productionId)
          expect(new Set(ids).size).toBeLessThan(ids.length)
        },
      },
      {
        label: 'removed prior production row plus multiple production additions',
        mutate: (state) => {
          state.studio.activeProductions[0]!.id = `${priorProductionId}-replacement`
        },
        proveTopology: (state) => {
          const prior = new Set(before.studio.activeProductions.map((production) => production.id))
          const ids = state.studio.activeProductions.map((production) => production.id)
          expect(ids).not.toContain(priorProductionId)
          expect(ids.filter((id) => !prior.has(id))).toHaveLength(2)
        },
      },
      {
        label: 'removed prior workflow row plus multiple workflow additions',
        mutate: (state) => {
          state.operations.workflows[0]!.productionId = `${priorWorkflowId}-replacement`
        },
        proveTopology: (state) => {
          const prior = new Set(before.operations.workflows.map((workflow) => workflow.productionId))
          const ids = state.operations.workflows.map((workflow) => workflow.productionId)
          expect(ids).not.toContain(priorWorkflowId)
          expect(ids.filter((id) => !prior.has(id))).toHaveLength(2)
        },
      },
    ]

    expect(acceptedGreenlightFormationReceipt(before, after)).not.toBeNull()
    for (const hostile of hostileArrays) {
      const changed = clone(after)
      hostile.mutate(changed)
      hostile.proveTopology(changed)
      expect(
        acceptedGreenlightFormationReceipt(before, changed),
        hostile.label,
      ).toBeNull()
    }
  })

  it('selects a same-title same-week collision suffix by set difference and preserves prior rows', () => {
    let before = applyActions(foundStudio('formation-receipt-same-week', true), [
      { kind: 'activateStudioOperations' },
    ])
    before = applyActions(before, [
      { kind: 'greenlight', production: directPayload(before, 0, 0) },
    ])
    const after = applyActions(before, [
      { kind: 'greenlight', production: directPayload(before, 0, 1) },
    ])
    const receipt = acceptedGreenlightFormationReceipt(before, after)

    expect(before.studio.activeProductions[0]!.conceptId)
      .toBe(after.studio.activeProductions[1]!.conceptId)
    expect(before.studio.activeProductions[0]!.startTick)
      .toBe(after.studio.activeProductions[1]!.startTick)
    expect(receipt?.productionId).toBe('prod-0000-1')

    const changedPriorProduction = clone(after)
    changedPriorProduction.studio.activeProductions[0]!.remainingTicks -= 1
    expect(
      acceptedGreenlightFormationReceipt(before, changedPriorProduction),
    ).toBeNull()

    const changedPriorWorkflow = clone(after)
    changedPriorWorkflow.operations.workflows[0]!.phase = 'preProduction'
    expect(
      acceptedGreenlightFormationReceipt(before, changedPriorWorkflow),
    ).toBeNull()
  })

  it('rejects workflow, reservation, facility, and ledger drift field-exactly', () => {
    const pair = managedDirectPair('formation-receipt-authority')
    const wrongPhase = clone(pair.after)
    wrongPhase.operations.workflows[0]!.phase = 'preProduction'
    const extraReservation = clone(pair.after)
    extraReservation.operations.workflows[0]!.reservations.push(
      clone(extraReservation.operations.workflows[0]!.reservations[0]!),
    )
    const wrongFacility = clone(pair.after)
    wrongFacility.operations.workflows[0]!.reservations[0]!.facilityId = 'missing'
    const changedFacility = clone(pair.after)
    changedFacility.operations.facilities[0]!.capacity += 1
    const wrongLedgerKind = clone(pair.after)
    wrongLedgerKind.ledger[0]!.kind = 'payroll'
    const wrongLedgerProduction = clone(pair.after)
    wrongLedgerProduction.ledger[0]!.productionId = 'another-production'

    for (const hostile of [
      wrongPhase,
      extraReservation,
      wrongFacility,
      changedFacility,
      wrongLedgerKind,
      wrongLedgerProduction,
    ]) {
      expect(acceptedGreenlightFormationReceipt(pair.before, hostile)).toBeNull()
    }
  })

  it('rejects missing, ambiguous, or unexpectedly changed screenplay linkage', () => {
    const pair = managedScriptPair('formation-receipt-script-hostile')
    const unchanged = clone(pair.after)
    unchanged.scriptDevelopment.projects[0] = clone(pair.before.scriptDevelopment.projects[0]!)
    const wrongId = clone(pair.after)
    wrongId.scriptDevelopment.projects[0]!.productionId = 'another-production'
    const extraChange = clone(pair.after)
    extraChange.scriptDevelopment.projects[0]!.rewriteCount = 1

    for (const hostile of [unchanged, wrongId, extraChange]) {
      expect(acceptedGreenlightFormationReceipt(pair.before, hostile)).toBeNull()
    }
  })

  it('compares every receipt field and null only with null', () => {
    const pair = managedDirectPair('formation-receipt-equality')
    const receipt = acceptedGreenlightFormationReceipt(pair.before, pair.after)!
    expect(sameGreenlightFormationReceipt(receipt, { ...receipt })).toBe(true)
    expect(sameGreenlightFormationReceipt(null, null)).toBe(true)
    expect(sameGreenlightFormationReceipt(receipt, null)).toBe(false)

    const changed: GreenlightFormationReceipt[] = [
      { ...receipt, productionId: 'other' },
      { ...receipt, directorId: 'other' },
      { ...receipt, leadId: 'other' },
      { ...receipt, greenlightWeek: receipt.greenlightWeek + 1 },
      { ...receipt, scriptProjectId: 'script-other' },
    ]
    for (const other of changed) expect(sameGreenlightFormationReceipt(receipt, other)).toBe(false)
  })
})

describe('strict production formation snapshot context', () => {
  type ManagedSnapshot = Extract<StudioLotSnapshot, { operationsMode: 'managed' }>

  function exact(): {
    receipt: GreenlightFormationReceipt
    snapshot: ManagedSnapshot
  } {
    const pair = managedScriptPair('formation-context')
    return {
      receipt: acceptedGreenlightFormationReceipt(pair.before, pair.after)!,
      snapshot: studioLotSnapshot(pair.after) as ManagedSnapshot,
    }
  }

  it('joins the exact current operation, Director, and Lead and applies the initial-only gate', () => {
    const { receipt, snapshot } = exact()
    const context = productionFormationContext(snapshot, receipt)

    expect(context).not.toBeNull()
    expect(context?.operation.productionId).toBe(receipt.productionId)
    expect(context?.director).toMatchObject({
      id: receipt.directorId,
      role: 'director',
      authority: 'active-production',
      productionId: receipt.productionId,
    })
    expect(context?.lead).toMatchObject({
      id: receipt.leadId,
      role: 'talent',
      authority: 'active-production',
      productionId: receipt.productionId,
    })
    expect(context?.receipt).toBe(receipt)
    expect(initialProductionFormationContext(snapshot, receipt)).toEqual(context)
  })

  it('allows fresh mounted later-phase truth but not through the initial gate', () => {
    const { receipt, snapshot } = exact()
    const operation = snapshot.productionOperations[0]!
    const laterOperation: ProductionOperationsState = {
      ...operation,
      phase: 'preProduction',
      phaseLabel: 'Pre-production',
      weeksRemaining: 7,
      progress01: 0.125,
      statusLabel: 'Preparing production',
    }
    const later = {
      ...snapshot,
      week: snapshot.week + 2,
      productionOperations: [laterOperation],
    }
    expect(productionFormationContext(later, receipt)?.operation).toBe(laterOperation)
    expect(initialProductionFormationContext(later, receipt)).toBeNull()
  })

  it('fails neutral for legacy authority, duplicate operation IDs, and malformed closed shapes', () => {
    const { receipt, snapshot } = exact()
    const operation = snapshot.productionOperations[0]!
    const hostile: StudioLotSnapshot[] = [
      {
        ...snapshot,
        operationsMode: 'legacy',
        stageAssignmentAuthority: 'presentation',
      },
      { ...snapshot, productionOperations: [operation, clone(operation)] },
      {
        ...snapshot,
        productionOperations: [{ ...operation, title: ' ' }],
      },
      {
        ...snapshot,
        productionOperations: [{ ...operation, progress01: Number.NaN }],
      },
      {
        ...snapshot,
        productionOperations: [{ ...operation, facilityLabel: '' }],
      },
      {
        ...snapshot,
        productionOperations: [
          { ...operation, leadId: undefined } as unknown as ProductionOperationsState,
        ],
      },
    ]
    for (const value of hostile) expect(productionFormationContext(value, receipt)).toBeNull()
  })

  it('fails neutral for duplicate, same-person, stale, wrong-role, or cross-production people', () => {
    const { receipt, snapshot } = exact()
    const director = snapshot.people.find((person) => person.id === receipt.directorId)!
    const lead = snapshot.people.find((person) => person.id === receipt.leadId)!
    const replacements: LotPersonState[][] = [
      [...snapshot.people, clone(director)],
      snapshot.people.map((person) =>
        person.id === receipt.directorId ? { ...person, name: 'Stale name' } : person,
      ),
      snapshot.people.map((person) =>
        person.id === receipt.leadId ? { ...person, role: 'director' } : person,
      ),
      snapshot.people.map((person) =>
        person.id === receipt.leadId ? { ...person, productionId: 'another-production' } : person,
      ),
      snapshot.people.filter((person) => person !== lead),
    ]
    for (const people of replacements) {
      expect(productionFormationContext({ ...snapshot, people }, receipt)).toBeNull()
    }

    expect(
      productionFormationContext(snapshot, { ...receipt, leadId: receipt.directorId }),
    ).toBeNull()
  })

  it('fails neutral instead of throwing for null or malformed unrelated people rows', () => {
    const { receipt, snapshot } = exact()
    const hostilePeople: LotPersonState[][] = [
      [...snapshot.people, null as unknown as LotPersonState],
      [
        ...snapshot.people,
        {
          id: 'unrelated-malformed-person',
          name: '',
          role: 'talent',
          authority: 'studio-roster',
          productionId: null,
          productionTitle: null,
        },
      ],
      snapshot.people.map((person) =>
        person.id === receipt.directorId
          ? { ...person, authority: 'not-an-authority' } as unknown as LotPersonState
          : person,
      ),
    ]

    for (const people of hostilePeople) {
      expect(() => productionFormationContext({ ...snapshot, people }, receipt)).not.toThrow()
      expect(productionFormationContext({ ...snapshot, people }, receipt)).toBeNull()
    }
  })

  it('never uses scene seed as studio identity and rejects wrong initial week/countdown', () => {
    const { receipt, snapshot } = exact()
    expect(
      productionFormationContext({ ...snapshot, sceneSeed: 'same-or-different-is-cosmetic' }, receipt),
    ).not.toBeNull()
    expect(
      initialProductionFormationContext({ ...snapshot, week: snapshot.week + 1 }, receipt),
    ).toBeNull()
    expect(
      initialProductionFormationContext(
        {
          ...snapshot,
          productionOperations: [
            { ...snapshot.productionOperations[0]!, weeksRemaining: TUNING.PRODUCTION_TICKS - 1 },
          ],
        },
        receipt,
      ),
    ).toBeNull()
  })
})
