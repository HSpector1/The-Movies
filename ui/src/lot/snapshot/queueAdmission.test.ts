import { describe, expect, it } from 'vitest'
import { applyActions, stableStringify } from '../../../../src/core/index.ts'
import type { GameState } from '../../../../src/core/index.ts'
import {
  contendedGreenlightStudio,
  contendedStudio,
  freePackage,
  nextCommissionOrNull,
} from '../../../../tests/_m4Fixtures.ts'
import {
  acceptedQueuedGreenlightReceipt,
  acceptedQueuedOriginalCommissionReceipt,
  acceptedQueuedScreenplayCommissionReceipt,
} from './queueAdmission.ts'

describe('retained Lot queue-admission receipts', () => {
  it('proves one exact pool commission queue successor without claiming a project or commitment', () => {
    const { state } = contendedStudio('lot-queue-receipt-commission')
    const payload = nextCommissionOrNull(state)
    if (payload === null) throw new Error('setup: expected a legal queued commission')
    const after = applyActions(state, [{ kind: 'commissionScript', project: payload }])

    expect(acceptedQueuedScreenplayCommissionReceipt(state, after, payload)).toEqual({
      kind: 'screenplay-commission-queued',
      ordinal: 0,
      queuedWeek: state.market.tick,
      subject: {
        kind: 'market',
        conceptId: payload.conceptId,
        title: state.concepts.find((concept) => concept.id === payload.conceptId)!.title,
      },
    })
    expect(after.scriptDevelopment.projects).toEqual(state.scriptDevelopment.projects)
    expect(after.studio.cash).toBe(state.studio.cash)
    expect(after.ledger).toEqual(state.ledger)
  })

  it('proves an original request without minting or presenting a screenplay identity', () => {
    const { state } = contendedStudio('lot-queue-receipt-original')
    const candidate = nextCommissionOrNull(state)
    if (candidate === null) throw new Error('setup: expected a free writer')
    const payload = {
      writerId: candidate.writerId,
      genre: candidate.promise.genre,
      shape: candidate.shape,
      promise: candidate.promise,
    }
    const after = applyActions(state, [
      { kind: 'commissionOriginalScreenplay', screenplay: payload },
    ])

    expect(acceptedQueuedOriginalCommissionReceipt(state, after, payload)).toEqual({
      kind: 'screenplay-commission-queued',
      ordinal: 0,
      queuedWeek: state.market.tick,
      subject: { kind: 'original', writerId: payload.writerId },
    })
    expect(after.concepts).toEqual(state.concepts)
    expect(after.originalScreenplays).toEqual(state.originalScreenplays)
    expect(after.scriptDevelopment.projects).toEqual(state.scriptDevelopment.projects)
  })

  it('proves one exact greenlight queue successor while carrying project, never production, identity', () => {
    const fixture = contendedGreenlightStudio('lot-queue-receipt-greenlight')
    const payload = freePackage(fixture.state, fixture.targetProjectId)
    const after = applyActions(fixture.state, [
      { kind: 'greenlightScriptProject', production: payload },
    ])
    const project = fixture.state.scriptDevelopment.projects.find(
      (candidate) => candidate.id === fixture.targetProjectId,
    )!

    expect(
      acceptedQueuedGreenlightReceipt(
        fixture.state,
        after,
        fixture.targetProjectId,
      ),
    ).toEqual({
      kind: 'greenlight-queued',
      ordinal: 0,
      queuedWeek: fixture.state.market.tick,
      scriptProjectId: fixture.targetProjectId,
      title: fixture.state.concepts.find((concept) => concept.id === project.conceptId)!.title,
    })
    expect(after.studio.activeProductions).toEqual(fixture.state.studio.activeProductions)
    expect(after.operations.workflows).toEqual(fixture.state.operations.workflows)
    expect(after.studio.cash).toBe(fixture.state.studio.cash)
  })

  it('fails neutral for stale, duplicate, mismatched, malformed, and partial commission claims', () => {
    const { state } = contendedStudio('lot-queue-receipt-commission-neutral')
    const payload = nextCommissionOrNull(state)
    if (payload === null) throw new Error('setup: expected a legal queued commission')
    const after = applyActions(state, [{ kind: 'commissionScript', project: payload }])
    const otherPayload = { ...payload, conceptId: state.concepts.at(-1)!.id }
    const duplicate = {
      ...after,
      productionQueue: [
        ...after.productionQueue,
        { ...after.productionQueue[0]!, ordinal: 1 },
      ],
    }
    const partial = {
      ...after,
      studioEvents: state.studioEvents,
    }

    expect(acceptedQueuedScreenplayCommissionReceipt(state, state, payload)).toBeNull()
    expect(acceptedQueuedScreenplayCommissionReceipt(after, after, payload)).toBeNull()
    expect(acceptedQueuedScreenplayCommissionReceipt(state, after, otherPayload)).toBeNull()
    expect(acceptedQueuedScreenplayCommissionReceipt(state, duplicate, payload)).toBeNull()
    expect(acceptedQueuedScreenplayCommissionReceipt(state, partial, payload)).toBeNull()
    expect(
      acceptedQueuedScreenplayCommissionReceipt(null as unknown as GameState, after, payload),
    ).toBeNull()
    expect(stableStringify(state)).not.toBe(stableStringify(after))
  })

  it('fails neutral for the wrong project and malformed or tampered greenlight successors', () => {
    const fixture = contendedGreenlightStudio('lot-queue-receipt-greenlight-neutral')
    const payload = freePackage(fixture.state, fixture.targetProjectId)
    const after = applyActions(fixture.state, [
      { kind: 'greenlightScriptProject', production: payload },
    ])
    const tampered = {
      ...after,
      studio: { ...after.studio, cash: after.studio.cash - 1 },
    }
    const malformed = {
      ...after,
      productionQueue: [
        { ...after.productionQueue[0]!, scriptProjectId: null },
      ],
    }

    expect(
      acceptedQueuedGreenlightReceipt(fixture.state, fixture.state, fixture.targetProjectId),
    ).toBeNull()
    expect(
      acceptedQueuedGreenlightReceipt(fixture.state, after, fixture.readyProjectIds[1]!),
    ).toBeNull()
    expect(
      acceptedQueuedGreenlightReceipt(fixture.state, tampered, fixture.targetProjectId),
    ).toBeNull()
    expect(
      acceptedQueuedGreenlightReceipt(
        fixture.state,
        malformed as unknown as GameState,
        fixture.targetProjectId,
      ),
    ).toBeNull()
    expect(
      acceptedQueuedGreenlightReceipt(
        null as unknown as GameState,
        after,
        fixture.targetProjectId,
      ),
    ).toBeNull()
  })
})
