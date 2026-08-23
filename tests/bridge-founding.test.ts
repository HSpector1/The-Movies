import { describe, expect, it } from 'vitest'

import { PROTOCOL_VERSION, SCHEMA_ID, type AvailableIntent } from '../bridge/protocol.ts'
import {
  decodeBridgeRuntimeCheckpoint,
  encodeBridgeRuntimeCheckpoint,
} from '../bridge/runtime-checkpoint.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import { BridgeSession } from '../bridge/session.ts'
import { foundingApplicantRows } from '../ui/src/engine/adapter.ts'

function submit(
  session: BridgeSession,
  option: AvailableIntent,
  commandId: string,
  expectedStateRevision = session.stateRevision,
) {
  return session.command({
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: session.sessionId,
    commandId,
    expectedStateRevision,
    type: 'submitIntent',
    payload: { intentId: option.intentId },
  })
}

function roleOfFirstOffer(session: BridgeSession): string {
  const option = session.snapshot().availableIntents[0]
  if (option === undefined || option.kind !== 'signFoundingContract') {
    throw new Error('Fresh founding state omitted its contract offer.')
  }
  const row = foundingApplicantRows(session.gameState).find(
    (candidate) => option.label.startsWith(`Offer ${candidate.name} `),
  )
  if (row === undefined) throw new Error(`Could not identify founding option ${option.label}.`)
  return row.role
}

describe('Bridge production founding v1', () => {
  it('opens a fresh production runtime on draft-ordered, profession-gated 104-week Actor offers', () => {
    const session = BridgeSession.createRuntime()
    const snapshot = session.snapshot()
    const actorRows = foundingApplicantRows(session.gameState, 'actor')

    expect(session.stateRevision).toBe(0)
    expect(session.gameState.market.tick).toBe(0)
    expect(session.gameState.founding).not.toBeNull()
    expect(session.gameState.contracts).toEqual([])
    expect(snapshot.availableIntents.map((option) => option.kind)).toEqual(
      actorRows.map(() => 'signFoundingContract'),
    )
    expect(snapshot.availableIntents.map((option) => option.label)).toEqual(
      actorRows.map((row) => `Offer ${row.name} a 2-year actor contract`),
    )
    expect(snapshot.availableIntents.every((option) =>
      option.projectId === null &&
      option.castingSessionId === null &&
      option.productionId === null
    )).toBe(true)
    expect(snapshot.availableIntents[0]?.detail).toMatch(
      /Perceived OVR .* potential .* work ethic .* guaranteed salary .* total obligation .* projected founding runway/,
    )
    expect(snapshot.availableIntents.some((option) =>
      option.kind === 'commissionScreenplay' || option.kind === 'startConstruction'
    )).toBe(false)
  })

  it('requires seven authoritative signings before emitting the exact founding action', () => {
    const session = BridgeSession.createRuntime()
    const requiredOfferRoles = [
      'actor',
      'actor',
      'actor',
      'director',
      'writer',
      'craft',
      'actor',
    ]

    for (const [index, expectedRole] of requiredOfferRoles.entries()) {
      expect(roleOfFirstOffer(session)).toBe(expectedRole)
      const before = session.snapshot()
      expect(new Set(before.availableIntents.map((option) => option.kind))).toEqual(
        new Set(['signFoundingContract']),
      )
      const accepted = submit(session, before.availableIntents[0]!, `founding-sign-${String(index + 1)}`)
      expect(accepted).toMatchObject({ accepted: true, stateRevision: index + 1, gameWeek: 0 })
      expect(session.stateRevision).toBe(index + 1)
      expect(session.gameState.contracts).toHaveLength(index + 1)
      expect(session.gameState.contracts.every((contract) => contract.termWeeks === 104)).toBe(true)
      expect(session.gameState.founding).not.toBeNull()
    }

    const ready = session.snapshot()
    expect(session.stateRevision).toBe(7)
    expect(ready.availableIntents).toHaveLength(1)
    expect(ready.availableIntents[0]).toMatchObject({
      kind: 'foundStudio',
      label: 'START A STUDIO',
      projectId: null,
      castingSessionId: null,
      productionId: null,
    })
    expect(ready.availableIntents[0]?.detail).toMatch(
      /Actors 4\/3; Directors 1\/1; Writers 1\/1; Production\/Craft Leads 1\/1/,
    )

    const founded = submit(session, ready.availableIntents[0]!, 'founding-start-studio')
    expect(founded).toMatchObject({ accepted: true, stateRevision: 8, gameWeek: 0 })
    expect(session.gameState.founding).toBeNull()
    expect(session.gameState.contracts).toHaveLength(7)
    expect(session.gameState.operations.mode).toBe('managed')
    expect(session.gameState.scriptDevelopment.mode).toBe('managed')
    expect(session.gameState.castingSessions.mode).toBe('managed')
    expect(session.snapshot().availableIntents.map((option) => option.kind)).toEqual(
      expect.arrayContaining(['commissionScreenplay', 'startConstruction']),
    )
  })

  it('replays an accepted founding offer exactly and rejects stale or consumed choices without mutation', () => {
    const session = BridgeSession.createRuntime()
    const opening = session.snapshot()
    const acceptedEnvelope = {
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: session.sessionId,
      commandId: 'founding-replay',
      expectedStateRevision: 0,
      type: 'submitIntent' as const,
      payload: { intentId: opening.availableIntents[0]!.intentId },
    }
    const accepted = session.command(acceptedEnvelope)
    expect(accepted).toMatchObject({ accepted: true, stateRevision: 1 })

    expect(canonicalJson(session.command(acceptedEnvelope))).toBe(canonicalJson(accepted))
    expect(session.stateRevision).toBe(1)
    expect(session.gameState.contracts).toHaveLength(1)

    const stale = submit(session, opening.availableIntents[1]!, 'founding-stale', 0)
    expect(stale).toMatchObject({ accepted: false, reasonCode: 'STALE_REVISION', stateRevision: 1 })
    const consumed = submit(session, opening.availableIntents[0]!, 'founding-consumed')
    expect(consumed).toMatchObject({
      accepted: false,
      reasonCode: 'INTENT_NOT_AVAILABLE',
      stateRevision: 1,
    })
    expect(session.gameState.contracts).toHaveLength(1)
  })

  it('restores an in-progress founding draft with exact authority and replay continuity', () => {
    const session = BridgeSession.createRuntime()
    const firstOption = session.snapshot().availableIntents[0]!
    const first = submit(session, firstOption, 'founding-before-restart')
    expect(first.accepted).toBe(true)

    const encoded = encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())
    const recovered = BridgeSession.fromRuntimeCheckpoint(decodeBridgeRuntimeCheckpoint(encoded))
    expect(recovered.sessionId).toBe(session.sessionId)
    expect(recovered.stateRevision).toBe(1)
    expect(recovered.gameState.founding).toEqual(session.gameState.founding)
    expect(recovered.gameState.contracts).toEqual(session.gameState.contracts)
    expect(recovered.snapshot().availableIntents).toEqual(session.snapshot().availableIntents)

    const replay = recovered.command({
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: recovered.sessionId,
      commandId: 'founding-before-restart',
      expectedStateRevision: 0,
      type: 'submitIntent',
      payload: { intentId: firstOption.intentId },
    })
    expect(canonicalJson(replay)).toBe(canonicalJson(first))
    expect(recovered.stateRevision).toBe(1)
    expect(recovered.gameState.contracts).toHaveLength(1)
  })
})
