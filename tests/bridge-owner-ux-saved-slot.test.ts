// Proposed product location: tests/bridge-owner-ux-saved-slot.test.ts
// Scratch proposal only. Requires root's savedSlot schema integration; not executed.
import { describe, expect, it } from 'vitest'

import { PROTOCOL_VERSION, SCHEMA_ID, type ControlEnvelope } from '../bridge/protocol.ts'
import {
  BridgeSession,
  createBridgeInitialState,
  type CommandResponse,
} from '../bridge/session.ts'
import {
  BridgeRuntimeCheckpointCapacityError,
  DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS,
  decodeBridgeRuntimeCheckpoint,
  encodeBridgeRuntimeCheckpoint,
} from '../bridge/runtime-checkpoint.ts'
import { exportSaveJson } from '../ui/src/engine/adapter.ts'

function control(
  session: BridgeSession,
  commandId: string,
  expectedStateRevision = session.stateRevision,
): ControlEnvelope {
  return {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: session.sessionId,
    commandId,
    expectedStateRevision,
  }
}

function submitKind(session: BridgeSession, kind: string, commandId: string): CommandResponse {
  const intent = session.snapshot().availableIntents.find((candidate) => candidate.kind === kind)
  if (intent === undefined) throw new Error(`Fixture has no published ${kind} intent.`)
  const response = session.command({
    ...control(session, commandId),
    type: 'submitIntent',
    payload: { intentId: intent.intentId },
  })
  expect(response.accepted).toBe(true)
  if (!response.accepted) throw new Error(response.message)
  return response
}

function fixture(name: string): BridgeSession {
  // Existing bridge fixture used by the save/reconnect tests. Later changes below
  // are published engine intents, not direct week or private-state mutations.
  return new BridgeSession(createBridgeInitialState(`owner-ux-slot-${name}`), `slot-${name}`)
}

function commissionAndAdvance(session: BridgeSession): void {
  submitKind(session, 'commissionScreenplay', 'commission')
  submitKind(session, 'advanceWeek', 'advance')
}

function restore(session: BridgeSession): BridgeSession {
  const encoded = encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())
  return BridgeSession.fromRuntimeCheckpoint(decodeBridgeRuntimeCheckpoint(encoded))
}

describe('Owner UX saved-slot metadata', () => {
  it('publishes null for an unsaved runtime and preserves the existing NO_SAVE response', () => {
    const session = BridgeSession.createRuntime()
    const before = exportSaveJson(session.gameState)
    expect(session.snapshot().savedSlot).toBeNull()
    expect(session.load(control(session, 'unsaved-load'))).toMatchObject({
      accepted: false,
      reasonCode: 'NO_SAVE',
    })
    expect(session.snapshot().savedSlot).toBeNull()
    expect(session.exportRuntimeCheckpoint().savedSaveJson).toBeNull()
    expect(exportSaveJson(session.gameState)).toBe(before)
    expect(session.stateRevision).toBe(0)
  })

  it('reports the next saved bytes immediately without changing gameplay revision or digest', () => {
    const session = fixture('same-revision')
    const before = session.snapshot()
    const beforeBytes = exportSaveJson(session.gameState)
    const saved = session.save(control(session, 'save'))
    expect(saved.accepted).toBe(true)
    if (!saved.accepted) throw new Error(saved.message)
    const expected = { studioName: 'PROJECT: STUDIO', gameWeek: before.gameWeek }
    expect(saved.savedSlot).toEqual(expected)
    expect(session.snapshot().savedSlot).toEqual(expected)
    expect(session.snapshot().stateRevision).toBe(before.stateRevision)
    expect(session.snapshot().stateDigest).toBe(before.stateDigest)
    expect(session.snapshot().snapshot).toEqual(before.snapshot)
    expect(saved.saveJson).toBe(beforeBytes)
    expect(session.exportRuntimeCheckpoint().savedSaveJson).toBe(beforeBytes)
    expect(exportSaveJson(session.gameState)).toBe(beforeBytes)
    expect(Object.keys(saved.savedSlot!).sort()).toEqual(['gameWeek', 'studioName'])
  })

  it('retains the saved week while the live game advances, then updates on a same-revision overwrite', () => {
    const session = fixture('overwrite')
    const originalWeek = session.snapshot().gameWeek
    const first = session.save(control(session, 'save-old'))
    if (!first.accepted) throw new Error(first.message)
    commissionAndAdvance(session)
    const current = session.snapshot()
    expect(current.gameWeek).toBe(originalWeek + 1)
    expect(current.savedSlot?.gameWeek).toBe(originalWeek)
    expect(session.exportRuntimeCheckpoint().savedSaveJson).toBe(first.saveJson)

    const second = session.save(control(session, 'save-new'))
    if (!second.accepted) throw new Error(second.message)
    expect(second.savedSlot).toEqual({ studioName: 'PROJECT: STUDIO', gameWeek: originalWeek + 1 })
    expect(session.snapshot().savedSlot).toEqual(second.savedSlot)
    expect(session.stateRevision).toBe(current.stateRevision)
    expect(session.snapshot().stateDigest).toBe(current.stateDigest)
    expect(second.saveJson).not.toBe(first.saveJson)
    expect(session.exportRuntimeCheckpoint().savedSaveJson).toBe(second.saveJson)
  })

  it('replays a historical Save receipt without overwriting the newer slot, including after reconnect', () => {
    const session = fixture('retry')
    const firstControl = control(session, 'save-old')
    const first = session.save(firstControl)
    if (!first.accepted) throw new Error(first.message)
    commissionAndAdvance(session)
    const second = session.save(control(session, 'save-new'))
    if (!second.accepted) throw new Error(second.message)
    const checkpoint = session.exportRuntimeCheckpoint()
    expect(session.save(firstControl)).toEqual(first)
    expect(session.exportRuntimeCheckpoint()).toEqual(checkpoint)
    expect(session.snapshot().savedSlot).toEqual(second.savedSlot)

    const recovered = restore(session)
    expect(recovered.sessionId).toBe(session.sessionId)
    expect(recovered.stateRevision).toBe(session.stateRevision)
    expect(recovered.save(firstControl)).toEqual(first)
    expect(recovered.snapshot().savedSlot).toEqual(second.savedSlot)
    expect(recovered.exportRuntimeCheckpoint().savedSaveJson).toBe(second.saveJson)
    expect(recovered.exportRuntimeCheckpoint().currentSaveJson).toBe(checkpoint.currentSaveJson)
    expect(recovered.exportRuntimeCheckpoint().journal).toEqual(checkpoint.journal)
  })

  it('keeps distinct current and saved slots across reconnect and rollover, then Load restores the saved subject', () => {
    const session = fixture('load')
    const saved = session.save(control(session, 'save'))
    if (!saved.accepted) throw new Error(saved.message)
    commissionAndAdvance(session)
    const checkpoint = session.exportRuntimeCheckpoint()
    expect(checkpoint.currentSaveJson).not.toBe(checkpoint.savedSaveJson)
    const recovered = restore(session)
    expect(recovered.exportRuntimeCheckpoint().currentSaveJson).toBe(checkpoint.currentSaveJson)
    expect(recovered.exportRuntimeCheckpoint().savedSaveJson).toBe(saved.saveJson)
    expect(recovered.snapshot().savedSlot).toEqual(saved.savedSlot)
    expect(recovered.snapshot().gameWeek).toBe(saved.gameWeek + 1)

    const rolled = recovered.rolloverRuntime()
    expect(rolled.sessionId).not.toBe(recovered.sessionId)
    expect(rolled.snapshot().savedSlot).toEqual(saved.savedSlot)
    expect(rolled.exportRuntimeCheckpoint().currentSaveJson).toBe(checkpoint.currentSaveJson)
    expect(rolled.exportRuntimeCheckpoint().savedSaveJson).toBe(saved.saveJson)

    const loadControl = control(recovered, 'load')
    const loaded = recovered.load(loadControl)
    if (!loaded.accepted) throw new Error(loaded.message)
    expect(loaded.savedSlot).toEqual(saved.savedSlot)
    expect(loaded.gameWeek).toBe(saved.gameWeek)
    expect(loaded.stateDigest).toBe(saved.stateDigest)
    expect(exportSaveJson(recovered.gameState)).toBe(saved.saveJson)
    expect(recovered.exportRuntimeCheckpoint().savedSaveJson).toBe(saved.saveJson)
    expect(recovered.load(loadControl)).toEqual(loaded)

    const imported = BridgeSession.fromSaveJson(saved.saveJson, 'slot-imported')
    expect(imported.snapshot().savedSlot).toEqual(saved.savedSlot)
    expect(imported.snapshot().gameWeek).toBe(saved.gameWeek)
  })

  it('does not change slot metadata or durable state after stale or wrong-session Save', () => {
    const session = fixture('refusal')
    const saved = session.save(control(session, 'save'))
    if (!saved.accepted) throw new Error(saved.message)
    commissionAndAdvance(session)
    const before = exportSaveJson(session.gameState)
    const revision = session.stateRevision
    expect(session.save(control(session, 'stale-save', revision - 1))).toMatchObject({
      accepted: false,
      reasonCode: 'STALE_REVISION',
    })
    expect(session.save({ ...control(session, 'foreign-save'), sessionId: 'another-session' })).toMatchObject({
      accepted: false,
      reasonCode: 'SESSION_MISMATCH',
    })
    expect(session.snapshot().savedSlot).toEqual(saved.savedSlot)
    expect(session.exportRuntimeCheckpoint().savedSaveJson).toBe(saved.saveJson)
    expect(exportSaveJson(session.gameState)).toBe(before)
    expect(session.stateRevision).toBe(revision)
  })

  it('does not expose prospective metadata if checkpoint preparation rejects Save', () => {
    const session = new BridgeSession(createBridgeInitialState('owner-ux-slot-capacity'), 'slot-capacity', null, {
      limits: { ...DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS, maxJournalEntries: 0 },
    })
    const before = exportSaveJson(session.gameState)
    expect(() => session.save(control(session, 'save'))).toThrow(BridgeRuntimeCheckpointCapacityError)
    expect(session.snapshot().savedSlot).toBeNull()
    expect(session.exportRuntimeCheckpoint().savedSaveJson).toBeNull()
    expect(session.exportRuntimeCheckpoint().journal).toEqual([])
    expect(exportSaveJson(session.gameState)).toBe(before)
    expect(session.stateRevision).toBe(0)
  })

  it('returns independent metadata objects for polling, accepted receipts, and cached retries', () => {
    const session = fixture('alias')
    const request = control(session, 'save')
    const saved = session.save(request)
    if (!saved.accepted || saved.savedSlot === null) throw new Error('Missing accepted slot metadata.')
    const expected = { ...saved.savedSlot }
    const before = session.exportRuntimeCheckpoint()
    saved.savedSlot.studioName = 'Consumer edit'
    saved.savedSlot.gameWeek = 9999
    const polled = session.snapshot()
    expect(polled.savedSlot).toEqual(expected)
    polled.savedSlot!.gameWeek = 8888
    const replay = session.save(request)
    if (!replay.accepted || replay.savedSlot === null) throw new Error('Missing retry metadata.')
    expect(replay.savedSlot).toEqual(expected)
    replay.savedSlot.studioName = 'Second consumer edit'
    expect(session.snapshot().savedSlot).toEqual(expected)
    expect(session.save(request)).toMatchObject({ savedSlot: expected })
    expect(session.exportRuntimeCheckpoint()).toEqual(before)
  })

  it('does not fabricate metadata when the low-level constructor receives unreadable saved bytes', () => {
    // This is an explicitly malformed constructor-only fixture, not a legitimate
    // hydrated profile. Existing checkpoint validation and Load handling stay unchanged.
    const state = createBridgeInitialState('owner-ux-slot-unreadable')
    const before = exportSaveJson(state)
    const session = new BridgeSession(state, 'slot-unreadable', '{unreadable')
    expect(session.snapshot().savedSlot).toBeNull()
    expect(session.snapshot().savedSlot).toBeNull()
    expect(exportSaveJson(session.gameState)).toBe(before)
    expect(session.stateRevision).toBe(0)
  })
})
