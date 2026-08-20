import { describe, expect, it } from 'vitest'

import { exportSaveJson } from '../ui/src/engine/adapter.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import {
  decodeBridgeRuntimeCheckpoint,
  encodeBridgeRuntimeCheckpoint,
} from '../bridge/runtime-checkpoint.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import { BridgeSession, selectJourneyIntent } from '../bridge/session.ts'

function command(
  session: BridgeSession,
  commandId: string,
  expectedStateRevision = session.stateRevision,
) {
  const snapshot = session.snapshot()
  const intent = selectJourneyIntent(
    snapshot.availableIntents.filter((candidate) => candidate.kind !== 'startConstruction'),
    snapshot.snapshot.journeyNotices.firstFilmJourney,
  )
  if (intent === undefined) throw new Error('Runtime checkpoint fixture has no journey intent.')
  return {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: session.sessionId,
    commandId,
    expectedStateRevision,
    type: 'submitIntent' as const,
    payload: { intentId: intent.intentId },
  }
}

function control(session: BridgeSession, commandId: string, expectedStateRevision = session.stateRevision) {
  return {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: session.sessionId,
    commandId,
    expectedStateRevision,
  }
}

function restore(session: BridgeSession): BridgeSession {
  const encoded = encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())
  const hydrated = decodeBridgeRuntimeCheckpoint(encoded)
  expect(encodeBridgeRuntimeCheckpoint(hydrated.checkpoint)).toBe(encoded)
  return BridgeSession.fromRuntimeCheckpoint(hydrated)
}

describe('BridgeSession runtime checkpoint recovery', () => {
  it('restores untouched V14 authority bytes, logical identity, revision, and digest', () => {
    const session = new BridgeSession(undefined, 'runtime-checkpoint-initial')
    const before = session.snapshot()
    const saveJson = exportSaveJson(session.gameState)

    const recovered = restore(session)

    expect(recovered.sessionId).toBe(session.sessionId)
    expect(recovered.stateRevision).toBe(session.stateRevision)
    expect(recovered.snapshot().stateDigest).toBe(before.stateDigest)
    expect(exportSaveJson(recovered.gameState)).toBe(saveJson)
    expect(recovered.exportRuntimeCheckpoint().journal).toEqual([])
  })

  it('replays an accepted command byte-for-byte after checkpoint restoration', () => {
    const session = new BridgeSession(undefined, 'runtime-checkpoint-command')
    const envelope = command(session, 'durable-command')
    const first = session.command(envelope)
    expect(first.accepted).toBe(true)
    const stateAfter = exportSaveJson(session.gameState)
    const revisionAfter = session.stateRevision

    const recovered = restore(session)
    const replayed = recovered.command(envelope)

    expect(canonicalJson(replayed)).toBe(canonicalJson(first))
    expect(recovered.stateRevision).toBe(revisionAfter)
    expect(exportSaveJson(recovered.gameState)).toBe(stateAfter)
  })

  it('preserves exact command, save, and load history after later mutations and restart', () => {
    const session = new BridgeSession(undefined, 'runtime-checkpoint-controls')
    const saveEnvelope = control(session, 'durable-save')
    const saved = session.save(saveEnvelope)
    expect(saved.accepted).toBe(true)

    const commandEnvelope = command(session, 'durable-mutation')
    const mutated = session.command(commandEnvelope)
    expect(mutated.accepted).toBe(true)

    const loadEnvelope = control(session, 'durable-load')
    const loaded = session.load(loadEnvelope)
    expect(loaded.accepted).toBe(true)
    const authorityAfterLoad = exportSaveJson(session.gameState)
    const revisionAfterLoad = session.stateRevision

    const recovered = restore(session)
    expect(canonicalJson(recovered.save(saveEnvelope))).toBe(canonicalJson(saved))
    expect(canonicalJson(recovered.command(commandEnvelope))).toBe(canonicalJson(mutated))
    expect(canonicalJson(recovered.load(loadEnvelope))).toBe(canonicalJson(loaded))
    expect(recovered.stateRevision).toBe(revisionAfterLoad)
    expect(exportSaveJson(recovered.gameState)).toBe(authorityAfterLoad)

    const reusedAcrossRoutes = recovered.save({
      ...control(recovered, commandEnvelope.commandId),
      commandId: commandEnvelope.commandId,
    })
    expect(reusedAcrossRoutes).toMatchObject({
      accepted: false,
      reasonCode: 'COMMAND_ID_REUSE',
    })
    expect(recovered.stateRevision).toBe(revisionAfterLoad)
    expect(exportSaveJson(recovered.gameState)).toBe(authorityAfterLoad)
  })

  it('does not silently evict historical command ids at the old 256-entry boundary', () => {
    const session = new BridgeSession(undefined, 'runtime-checkpoint-no-eviction')
    const firstEnvelope = control(session, 'missing-save-000')
    const first = session.load(firstEnvelope)
    expect(first).toMatchObject({ accepted: false, reasonCode: 'NO_SAVE' })

    for (let index = 1; index < 300; index++) {
      const result = session.load(control(session, `missing-save-${String(index).padStart(3, '0')}`))
      expect(result).toMatchObject({ accepted: false, reasonCode: 'NO_SAVE' })
    }

    expect(session.exportRuntimeCheckpoint().journal).toHaveLength(300)
    const recovered = restore(session)
    expect(canonicalJson(recovered.load(firstEnvelope))).toBe(canonicalJson(first))
    expect(recovered.exportRuntimeCheckpoint().journal).toHaveLength(300)
    expect(recovered.stateRevision).toBe(0)
  })
})
