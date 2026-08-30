import { createHash } from 'node:crypto'

import { beforeEach, describe, expect, it } from 'vitest'

import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import {
  BridgeSession,
  authoritativeDigest,
  availableIntents,
  createManagedBridgeState,
} from '../bridge/session.ts'
import {
  resetSnapshotBuildDiagnostics,
  snapshotBuildContextFor,
  snapshotBuildDiagnostics,
} from '../bridge/snapshot-build-context.ts'
import {
  exportSaveJson,
  newGame,
  studioLotSnapshot,
} from '../ui/src/engine/adapter.ts'
import type { GameState } from '../ui/src/engine/adapter.ts'

const SEED = 'w0-snapshot-build-context'

function pickIntent(envelope: { availableIntents: readonly { kind: string; intentId: string }[] }) {
  return envelope.availableIntents.find((intent) => intent.kind !== 'startConstruction') ??
    envelope.availableIntents[0]
}

function withoutTimings(envelope: unknown): unknown {
  const clone = JSON.parse(JSON.stringify(envelope)) as Record<string, unknown>
  delete clone['metrics']
  delete clone['processingMs']
  return clone
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

/** Recursively vandalize every string leaf so any retained alias would be visible. */
function vandalize(value: unknown): void {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index++) {
      if (typeof value[index] === 'string') value[index] = 'VANDALIZED'
      else vandalize(value[index])
    }
    return
  }
  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>
    for (const key of Object.keys(record)) {
      if (typeof record[key] === 'string') record[key] = 'VANDALIZED'
      else vandalize(record[key])
    }
  }
}

describe('W0 snapshot build context — fact equivalence', () => {
  it('serves byte-identical save JSON and digest to the underlying pure functions', () => {
    const state = createManagedBridgeState(SEED)
    const context = snapshotBuildContextFor(state)
    const directJson = exportSaveJson(state)
    expect(context.saveJson()).toBe(directJson)
    expect(context.stateDigest()).toBe(
      createHash('sha256').update(directJson).digest('hex'),
    )
    expect(authoritativeDigest(state)).toBe(context.stateDigest())
  })

  it('serves the same lot selector facts as a direct selector call', () => {
    const state = createManagedBridgeState(SEED)
    const context = snapshotBuildContextFor(state)
    expect(JSON.stringify(context.lotSnapshot())).toBe(
      JSON.stringify(studioLotSnapshot(state)),
    )
  })

  it('returns one stable context per state object and distinct contexts per state', () => {
    const state = createManagedBridgeState(SEED)
    const other = createManagedBridgeState(SEED)
    expect(snapshotBuildContextFor(state)).toBe(snapshotBuildContextFor(state))
    expect(snapshotBuildContextFor(state)).not.toBe(snapshotBuildContextFor(other))
  })
})

describe('W0 snapshot build context — once-per-state computation', () => {
  let state: GameState

  beforeEach(() => {
    state = createManagedBridgeState(SEED)
    resetSnapshotBuildDiagnostics()
  })

  it('computes each heavy fact at most once across repeated snapshot polls', () => {
    const session = new BridgeSession(state)
    session.snapshot()
    session.snapshot()
    session.snapshot()
    expect(snapshotBuildDiagnostics.saveJsonComputes).toBe(1)
    expect(snapshotBuildDiagnostics.digestComputes).toBe(1)
    expect(snapshotBuildDiagnostics.lotSnapshotComputes).toBe(1)
    expect(snapshotBuildDiagnostics.developmentComputes).toBe(1)
    expect(snapshotBuildDiagnostics.castingComputes).toBe(1)
  })

  it('computes founding-state facts at most once across repeated founding polls', () => {
    const foundingState = newGame(SEED)
    resetSnapshotBuildDiagnostics()
    const session = new BridgeSession(foundingState)
    session.snapshot()
    session.snapshot()
    expect(snapshotBuildDiagnostics.saveJsonComputes).toBe(1)
    expect(snapshotBuildDiagnostics.digestComputes).toBe(1)
  })

  it('recomputes facts exactly once for the successor state after an accepted command', () => {
    const session = new BridgeSession(state)
    const first = session.snapshot()
    const advance = pickIntent(first)
    expect(advance).toBeDefined()
    resetSnapshotBuildDiagnostics()
    const response = session.command({
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: session.sessionId,
      commandId: 'w0-accept-1',
      expectedStateRevision: first.stateRevision,
      type: 'submitIntent',
      payload: { intentId: advance!.intentId },
    })
    expect(response.accepted).toBe(true)
    // The successor state is a new object: exactly one fresh computation of
    // each fact family that the accepted-command path consumes.
    expect(snapshotBuildDiagnostics.saveJsonComputes).toBe(1)
    expect(snapshotBuildDiagnostics.digestComputes).toBe(1)
    expect(snapshotBuildDiagnostics.lotSnapshotComputes).toBe(1)
    resetSnapshotBuildDiagnostics()
    session.snapshot()
    expect(snapshotBuildDiagnostics.saveJsonComputes).toBe(0)
    expect(snapshotBuildDiagnostics.digestComputes).toBe(0)
    expect(snapshotBuildDiagnostics.lotSnapshotComputes).toBe(0)
  })

  it('folds the save route to one canonical export for digest, payload, and journal', () => {
    const session = new BridgeSession(state)
    session.snapshot()
    resetSnapshotBuildDiagnostics()
    const saved = session.save({
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: session.sessionId,
      commandId: 'w0-save-1',
      expectedStateRevision: session.stateRevision,
    })
    expect(saved.accepted).toBe(true)
    expect(snapshotBuildDiagnostics.saveJsonComputes).toBe(0)
  })
})

describe('W0 snapshot build context — envelope isolation and determinism', () => {
  it('serves envelopes that never alias a later poll: vandalizing one leaves the next byte-identical', () => {
    const state = createManagedBridgeState(SEED)
    const session = new BridgeSession(state)
    const first = session.snapshot()
    const pristine = deepClone(withoutTimings(first))
    vandalize(first)
    const second = session.snapshot()
    expect(withoutTimings(second)).toEqual(pristine)
  })

  it('keeps command legality intact after a served envelope is vandalized', () => {
    const state = createManagedBridgeState(SEED)
    const session = new BridgeSession(state)
    const first = session.snapshot()
    const pristine = deepClone(first)
    vandalize(first)
    const advance = pickIntent(pristine)
    expect(advance).toBeDefined()
    const response = session.command({
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: session.sessionId,
      commandId: 'w0-vandal-command',
      expectedStateRevision: pristine.stateRevision,
      type: 'submitIntent',
      payload: { intentId: advance!.intentId },
    })
    expect(response.accepted).toBe(true)
  })

  it('produces identical envelopes for identical states and session identity', () => {
    const left = new BridgeSession(createManagedBridgeState(SEED), 'w0-fixed-session')
    const right = new BridgeSession(createManagedBridgeState(SEED), 'w0-fixed-session')
    expect(withoutTimings(left.snapshot())).toEqual(withoutTimings(right.snapshot()))
  })

  it('keeps intent identity stable between the memoized digest and a fresh resolution', () => {
    const state = createManagedBridgeState(SEED)
    const session = new BridgeSession(state)
    const served = session.snapshot().availableIntents.map((intent) => intent.intentId)
    const resolved = availableIntents(state).map((intent) => intent.intentId)
    expect(served).toEqual(resolved)
  })

  it('restores loaded-state facts freshly and exactly on load', () => {
    const state = createManagedBridgeState(SEED)
    const session = new BridgeSession(state)
    const first = session.snapshot()
    const saved = session.save({
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: session.sessionId,
      commandId: 'w0-load-save',
      expectedStateRevision: first.stateRevision,
    })
    expect(saved.accepted).toBe(true)
    const advance = pickIntent(first)
    const commanded = session.command({
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: session.sessionId,
      commandId: 'w0-load-advance',
      expectedStateRevision: session.stateRevision,
      type: 'submitIntent',
      payload: { intentId: advance!.intentId },
    })
    expect(commanded.accepted).toBe(true)
    const loaded = session.load({
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: session.sessionId,
      commandId: 'w0-load-load',
      expectedStateRevision: session.stateRevision,
    })
    expect(loaded.accepted).toBe(true)
    if (!loaded.accepted) throw new Error('unreachable')
    expect(loaded.stateDigest).toBe(first.stateDigest)
    expect(loaded.gameWeek).toBe(first.gameWeek)
  })
})
