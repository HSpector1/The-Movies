import { randomUUID } from 'node:crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { BridgeSession, createBridgeInitialState } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID, type ControlEnvelope, type SubmitIntentCommand } from '../bridge/protocol.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import type { CampaignRequest } from '../bridge/schema/bridge-schema.ts'
import {
  DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS as DEFAULT_LIMITS,
  decodeBridgeRuntimeCheckpoint,
  encodeBridgeRuntimeCheckpoint,
  hydrateBridgeRuntimeCheckpoint,
  BridgeRuntimeCheckpointHistoryFullError,
  type BridgeRuntimeCheckpointLimits,
} from '../bridge/runtime-checkpoint.ts'
import {
  initialCampaignLibrary,
  proposeCampaign,
  type CampaignLibrary,
  type CampaignProposal,
} from '../bridge/runtime/campaign-library.ts'
import { createBridgeRuntimeCoordinator, type BridgeRuntimeCoordinator } from '../bridge/runtime/runtime-coordinator.ts'
import type { BridgeCheckpointStore } from '../bridge/runtime/checkpoint-store.ts'

const limits = (change: Partial<BridgeRuntimeCheckpointLimits> = {}) => ({ ...DEFAULT_LIMITS, ...change })
const control = (session: Pick<BridgeSession, 'sessionId' | 'stateRevision'>) => ({
  protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
  commandId: randomUUID(), expectedStateRevision: session.stateRevision,
})
function request(
  library: Pick<CampaignLibrary, 'catalogueRevision' | 'activeCampaignId'>,
  session: Pick<BridgeSession, 'sessionId' | 'stateRevision'>,
  operation: CampaignRequest['operation'], extra: Partial<CampaignRequest> = {},
): CampaignRequest {
  return { ...control(session), type: 'campaign', operation,
    expectedCatalogueRevision: library.catalogueRevision, expectedActiveCampaignId: library.activeCampaignId,
    campaignId: null, label: null, overwriteCampaignId: null,
    confirmDestructive: false, unsavedDisposition: 'requireClean', ...extra }
}
function accepted(proposal: CampaignProposal) {
  if (!('library' in proposal)) throw new Error(proposal.response.message)
  expect(proposal.response.accepted).toBe(true)
  return proposal
}
function namedFixture() {
  const session = new BridgeSession(createBridgeInitialState('prepared-reuse-world-a'))
  const library = initialCampaignLibrary(session, DEFAULT_LIMITS, null)
  return accepted(proposeCampaign(library, session, request(library, session, 'saveAs', { label: 'World A' }), DEFAULT_LIMITS, 'endowed'))
}
function advanceRequest(session: BridgeSession): SubmitIntentCommand {
  const intent = session.snapshot().availableIntents.find(row => row.kind === 'advanceWeek')
  if (!intent) throw new Error('The managed fixture must offer ordinary advanceWeek')
  return { ...control(session), type: 'submitIntent', payload: { intentId: intent.intentId } }
}
function advance(session: BridgeSession) {
  expect(session.command(advanceRequest(session)).accepted).toBe(true)
}

class Store implements BridgeCheckpointStore {
  readonly checkpointPath = '/synthetic/prepared-checkpoint-library.json'
  contents: string | null = null
  fail = false
  writes = 0
  async read() { return this.contents }
  async writeAtomic(text: string) {
    this.writes++
    if (this.fail) throw new Error('injected pre-commit write failure')
    this.contents = text
  }
  async close() {}
}
async function runtimeRequest(runtime: BridgeRuntimeCoordinator, operation: CampaignRequest['operation'], extra: Partial<CampaignRequest> = {}) {
  const view = await runtime.campaignLibrary()
  if (!view) throw new Error('Campaign library missing')
  return request(view, view, operation, extra)
}
async function advanceRuntime(runtime: BridgeRuntimeCoordinator) {
  const snapshot = await runtime.read(session => session.snapshot())
  const intent = snapshot.availableIntents.find(row => row.kind === 'advanceWeek')
  if (!intent) throw new Error('The managed fixture must offer ordinary advanceWeek')
  const result = await runtime.dispatch('command', {
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: snapshot.sessionId,
    commandId: randomUUID(), expectedStateRevision: snapshot.stateRevision,
    type: 'submitIntent', payload: { intentId: intent.intentId },
  })
  expect(result.response.accepted).toBe(true)
}

afterEach(() => vi.restoreAllMocks())

describe('prepared checkpoint representation reuse preserves authority boundaries', () => {
  it.each(['maxCheckpointBytes', 'maxJournalBytes', 'maxJournalEntries'] as const)(
    'intersects session and caller %s allowances, including after a successful export', key => {
      const source = new BridgeSession(createBridgeInitialState('prepared-limit-intersection'))
      expect(source.save(control(source)).accepted).toBe(true)
      const baseline = source.exportRuntimeCheckpointEncoded()
      const hydrated = decodeBridgeRuntimeCheckpoint(baseline.encoded)
      const smaller = key === 'maxCheckpointBytes' ? hydrated.checkpointBytes - 1
        : key === 'maxJournalBytes' ? hydrated.journalBytes - 1 : 0
      const strict = limits({ [key]: smaller })
      const bounded = new BridgeSession(source.gameState, source.sessionId, hydrated.checkpoint.savedSaveJson, {
        revision: source.stateRevision, journal: hydrated.journal, limits: strict,
      })
      // A looser campaign caller cannot bypass the session's own limit.
      expect(() => bounded.exportRuntimeCheckpointEncoded(DEFAULT_LIMITS)).toThrow(/maximum/)
      // A previous successful representation cannot bypass a later caller's tighter limit.
      expect(() => source.exportRuntimeCheckpointEncoded(strict)).toThrow(/maximum/)
      expect(source.exportRuntimeCheckpointEncoded().encoded).toBe(baseline.encoded)
    },
  )

  it('does not retain aliases from exported checkpoints or hydrated state', () => {
    const source = new BridgeSession(createBridgeInitialState('prepared-mutation-isolation'))
    expect(source.save(control(source)).accepted).toBe(true)
    const baseline = source.exportRuntimeCheckpointEncoded().encoded
    const escaped = source.exportRuntimeCheckpointEncoded()
    escaped.checkpoint.journal[0]!.commandId = 'vandalized-journal-entry'
    escaped.checkpoint.currentStateDigest = '0'.repeat(64)
    expect(() => encodeBridgeRuntimeCheckpoint(escaped.checkpoint)).toThrow()
    expect(source.exportRuntimeCheckpointEncoded().encoded).toBe(baseline)
    const hydrated = decodeBridgeRuntimeCheckpoint(baseline)
    hydrated.currentSave.state.market.tick += 1
    const restored = BridgeSession.fromRuntimeCheckpoint(hydrated)
    expect(restored.exportRuntimeCheckpointEncoded().encoded).toBe(baseline)
    expect(source.exportRuntimeCheckpointEncoded().encoded).toBe(baseline)
  })

  it('keeps repeated public encoding and decoding strict after a successful validation', () => {
    const source = new BridgeSession(createBridgeInitialState('prepared-untrusted-boundary'))
    expect(source.save(control(source)).accepted).toBe(true)
    const good = source.exportRuntimeCheckpointEncoded().encoded
    const checkpoint = decodeBridgeRuntimeCheckpoint(good).checkpoint
    expect(encodeBridgeRuntimeCheckpoint(checkpoint)).toBe(good)
    checkpoint.journal[0]!.responseJson = '{}'
    expect(() => encodeBridgeRuntimeCheckpoint(checkpoint)).toThrow()
    const pristine = JSON.parse(good)
    expect(() => hydrateBridgeRuntimeCheckpoint({ ...pristine, unknownField: true })).toThrow()
    expect(() => hydrateBridgeRuntimeCheckpoint({ ...pristine, schemaId: 'sha256:' + '0'.repeat(64) })).toThrow()
    expect(() => hydrateBridgeRuntimeCheckpoint({ ...pristine, currentStateDigest: '0'.repeat(64) })).toThrow()
    expect(() => hydrateBridgeRuntimeCheckpoint({ ...pristine, currentSaveJson: pristine.currentSaveJson + '\n' })).toThrow()
    expect(() => decodeBridgeRuntimeCheckpoint(canonicalJson(pristine))).toThrow(/exactly one LF/)
    expect(() => decodeBridgeRuntimeCheckpoint(good + '\n')).toThrow(/exactly one LF/)
    expect(source.exportRuntimeCheckpointEncoded().encoded).toBe(good)
  })

  it('replaces saved-slot and journal bytes when Save leaves the state revision unchanged', () => {
    const source = new BridgeSession(createBridgeInitialState('prepared-same-revision-save'))
    const before = source.exportRuntimeCheckpointEncoded()
    const firstRequest = control(source)
    const firstReceipt = source.save(firstRequest)
    expect(firstReceipt.accepted).toBe(true)
    const first = source.exportRuntimeCheckpointEncoded()
    expect(first.checkpoint.stateRevision).toBe(before.checkpoint.stateRevision)
    expect(first.checkpoint.currentSaveJson).toBe(before.checkpoint.currentSaveJson)
    expect(before.checkpoint.savedSaveJson).toBeNull()
    expect(first.checkpoint.savedSaveJson).toBe(first.checkpoint.currentSaveJson)
    expect(first.checkpoint.journal).toHaveLength(1)
    expect(first.encoded).not.toBe(before.encoded)
    expect(source.save(control(source)).accepted).toBe(true)
    const second = source.exportRuntimeCheckpointEncoded()
    expect(second.checkpoint.stateRevision).toBe(first.checkpoint.stateRevision)
    expect(second.checkpoint.journal).toHaveLength(2)
    expect(second.encoded).not.toBe(first.encoded)
    expect(first.checkpoint.journal).toHaveLength(1)
    expect(source.save(firstRequest)).toEqual(firstReceipt)
    expect(source.exportRuntimeCheckpointEncoded().encoded).toBe(second.encoded)
  })

  it.each(['save', 'saveAs'] as const)('uses one final %s artifact for its record, response and working checkpoint', operation => {
    const fixture = namedFixture()
    advance(fixture.session)
    const spy = vi.spyOn(BridgeSession.prototype, 'exportRuntimeCheckpointEncoded')
    const result = accepted(proposeCampaign(fixture.library, fixture.session,
      request(fixture.library, fixture.session, operation, operation === 'saveAs' ? { label: 'Copy' } : {}), DEFAULT_LIMITS, 'endowed'))
    expect(spy.mock.contexts.filter(session => session === result.session)).toHaveLength(operation === 'save' ? 0 : 1)
    const active = result.library.records.find(record => record.id === result.library.activeCampaignId)!
    expect(active.checkpointJson).toBe(result.library.workingCheckpointJson)
    const checkpoint = decodeBridgeRuntimeCheckpoint(active.checkpointJson).checkpoint
    expect(result.response.stateDigest).toBe(checkpoint.currentStateDigest)
    expect(checkpoint.journal.some(entry => entry.commandId === result.response.commandId)).toBe(operation === 'save')
  })

  it('does not reuse the saved source stage after dirty save-before-load replaces the prospective world', () => {
    const a = namedFixture(), aId = a.library.activeCampaignId!
    const b = accepted(proposeCampaign(a.library, a.session, request(a.library, a.session, 'newGame', { label: 'Independent B' }), DEFAULT_LIMITS, 'endowed'))
    const bId = b.library.activeCampaignId!, bRecord = b.library.records.find(record => record.id === bId)!
    const loadedA = accepted(proposeCampaign(b.library, b.session, request(b.library, b.session, 'load', { campaignId: aId }), DEFAULT_LIMITS, 'endowed'))
    advance(loadedA.session)
    const dirtyA = loadedA.session.exportRuntimeCheckpoint().currentSaveJson
    const spy = vi.spyOn(BridgeSession.prototype, 'exportRuntimeCheckpointEncoded')
    const result = accepted(proposeCampaign(loadedA.library, loadedA.session,
      request(loadedA.library, loadedA.session, 'load', { campaignId: bId, unsavedDisposition: 'save' }), DEFAULT_LIMITS, 'endowed'))
    expect(spy.mock.contexts.filter(session => session === result.session)).toHaveLength(1)
    const savedA = decodeBridgeRuntimeCheckpoint(result.library.records.find(record => record.id === aId)!.checkpointJson).checkpoint
    const final = decodeBridgeRuntimeCheckpoint(result.library.workingCheckpointJson).checkpoint
    const priorB = decodeBridgeRuntimeCheckpoint(bRecord.checkpointJson).checkpoint
    expect(savedA.currentSaveJson).toBe(dirtyA)
    expect(savedA.savedSaveJson).toBe(dirtyA)
    expect(final.currentSaveJson).toBe(priorB.currentSaveJson)
    expect(final.currentSaveJson).not.toBe(dirtyA)
    expect(result.response.stateDigest).toBe(priorB.currentStateDigest)
    expect(result.library.records.find(record => record.id === bId)!.checkpointJson).toBe(bRecord.checkpointJson)
  })

  it('detaches returned dispatch artifacts from both old and newly committed journal entries', () => {
    const session = new BridgeSession(createBridgeInitialState('dispatch-artifact-isolation'))
    const command = advanceRequest(session), commandReceipt = session.command(command)
    expect(commandReceipt.accepted).toBe(true)
    const save = control(session), dispatched = session.dispatchWithRuntimeCheckpoint('save', save)
    expect(dispatched.response.accepted).toBe(true)
    expect(dispatched.prepared).not.toBeNull()
    const artifact = dispatched.prepared!, canonical = artifact.encoded
    expect(artifact.checkpoint.journal).toHaveLength(2)
    artifact.checkpoint.journal[0]!.commandId = 'corrupted-old-entry'
    artifact.checkpoint.journal[1]!.responseJson = '{}'
    artifact.checkpoint.currentStateDigest = '0'.repeat(64)
    artifact.checkpoint.savedSaveJson = '{}'
    expect(() => encodeBridgeRuntimeCheckpoint(artifact.checkpoint)).toThrow()
    expect(session.exportRuntimeCheckpointEncoded().encoded).toBe(canonical)
    expect(session.command(command)).toEqual(commandReceipt)
    expect(session.save(save)).toEqual(dispatched.response)
    expect(session.dispatchWithRuntimeCheckpoint('save', save)).toEqual({ response: dispatched.response, prepared: null })
    const reused = session.dispatchWithRuntimeCheckpoint('save', { ...save, expectedStateRevision: save.expectedStateRevision + 1 })
    expect(reused.response).toMatchObject({ accepted: false, reasonCode: 'COMMAND_ID_REUSE' })
    expect(reused.prepared).toBeNull()
    expect(session.exportRuntimeCheckpointEncoded().encoded).toBe(canonical)
  })

  it('captures current command/load state and never reuses an artifact after ordinary public changes', () => {
    const session = new BridgeSession(createBridgeInitialState('dispatch-current-poststate'))
    const firstSave = session.dispatchWithRuntimeCheckpoint('save', control(session))
    const firstArtifact = firstSave.prepared!, firstBytes = firstArtifact.encoded
    expect(firstArtifact).not.toBeNull()
    const command = advanceRequest(session), advanced = session.dispatchWithRuntimeCheckpoint('command', command)
    expect(advanced.response.accepted).toBe(true)
    expect(advanced.prepared!.encoded).toBe(session.exportRuntimeCheckpointEncoded().encoded)
    expect(advanced.prepared!.checkpoint.currentStateDigest).toBe(advanced.response.stateDigest)
    expect(advanced.prepared!.checkpoint.stateRevision).toBe(command.expectedStateRevision + 1)
    expect(advanced.prepared!.checkpoint.journal.at(-1)!.route).toBe('command')
    expect(advanced.prepared!.checkpoint.currentSaveJson).not.toBe(firstArtifact.checkpoint.currentSaveJson)
    const load = control(session), loaded = session.dispatchWithRuntimeCheckpoint('load', load)
    expect(loaded.response.accepted).toBe(true)
    expect(loaded.prepared!.encoded).toBe(session.exportRuntimeCheckpointEncoded().encoded)
    expect(loaded.prepared!.checkpoint.currentSaveJson).toBe(firstArtifact.checkpoint.currentSaveJson)
    expect(loaded.prepared!.checkpoint.stateRevision).toBe(load.expectedStateRevision + 1)
    expect(loaded.prepared!.checkpoint.journal.at(-1)!.route).toBe('load')
    expect(session.dispatchWithRuntimeCheckpoint('load', load)).toEqual({ response: loaded.response, prepared: null })
    advance(session)
    expect(session.save(control(session)).accepted).toBe(true)
    const next = session.dispatchWithRuntimeCheckpoint('save', control(session))
    expect(next.response.accepted).toBe(true)
    expect(next.prepared!.encoded).toBe(session.exportRuntimeCheckpointEncoded().encoded)
    expect(next.prepared!.encoded).not.toBe(firstBytes)
    expect(next.prepared!.checkpoint.journal).toHaveLength(6)
    expect(firstArtifact.encoded).toBe(firstBytes)
    expect(firstArtifact.checkpoint.journal).toHaveLength(1)
    expect(session.dispatchWithRuntimeCheckpoint('command', command)).toEqual({ response: advanced.response, prepared: null })
  })

  it.each(['command', 'save', 'load'] as const)('captures a journaled %s refusal and returns null for replay or foreign session', route => {
    const session = new BridgeSession(createBridgeInitialState('dispatch-journaled-refusal'))
    const before = session.exportRuntimeCheckpointEncoded().checkpoint
    const envelope = route === 'command'
      ? { ...control(session), type: 'submitIntent' as const, payload: { intentId: 'not-an-issued-intent' } }
      : { ...control(session), expectedStateRevision: route === 'save' ? session.stateRevision + 1 : session.stateRevision }
    const result = session.dispatchWithRuntimeCheckpoint(route, envelope)
    expect(result.response).toMatchObject({ accepted: false, reasonCode: route === 'command' ? 'INTENT_NOT_AVAILABLE' : route === 'save' ? 'STALE_REVISION' : 'NO_SAVE' })
    expect(result.prepared!.encoded).toBe(session.exportRuntimeCheckpointEncoded().encoded)
    expect(result.prepared!.checkpoint.currentSaveJson).toBe(before.currentSaveJson)
    expect(result.prepared!.checkpoint.stateRevision).toBe(before.stateRevision)
    expect(result.prepared!.checkpoint.journal).toHaveLength(1)
    expect(result.prepared!.checkpoint.journal[0]!.responseJson).toBe(canonicalJson(result.response))
    expect(session.dispatchWithRuntimeCheckpoint(route, envelope)).toEqual({ response: result.response, prepared: null })
    const foreign = session.dispatchWithRuntimeCheckpoint(route, { ...envelope, commandId: randomUUID(), sessionId: randomUUID() })
    expect(foreign.response).toMatchObject({ accepted: false, reasonCode: 'SESSION_MISMATCH' })
    expect(foreign.prepared).toBeNull()
    expect(session.exportRuntimeCheckpointEncoded().encoded).toBe(result.prepared!.encoded)
  })

  it.each(['command', 'save', 'load'] as const)('fails tighter caller bounds before %s authority mutation and permits a clean retry', route => {
    const session = new BridgeSession(createBridgeInitialState('dispatch-caller-limit'))
    expect(session.save(control(session)).accepted).toBe(true)
    advance(session)
    const before = session.exportRuntimeCheckpointEncoded().encoded, snapshot = session.snapshot()
    const envelope = route === 'command' ? advanceRequest(session) : control(session)
    expect(() => session.dispatchWithRuntimeCheckpoint(route, envelope, limits({ maxCheckpointBytes: 1 }))).toThrow(/maximum/)
    expect(session.exportRuntimeCheckpointEncoded().encoded).toBe(before)
    expect(session.snapshot().stateDigest).toBe(snapshot.stateDigest)
    expect(session.stateRevision).toBe(snapshot.stateRevision)
    const retried = session.dispatchWithRuntimeCheckpoint(route, envelope, DEFAULT_LIMITS)
    expect(retried.response.accepted).toBe(true)
    expect(retried.prepared!.encoded).toBe(session.exportRuntimeCheckpointEncoded().encoded)
    expect(retried.prepared!.checkpoint.journal).toHaveLength(3)
    expect(session.dispatchWithRuntimeCheckpoint(route, envelope)).toEqual({ response: retried.response, prepared: null })
  })

  it('discards failed history preparation before a detached rollover creates its own artifact', () => {
    const bounded = limits({ maxJournalEntries: 1 })
    const session = new BridgeSession(createBridgeInitialState('dispatch-history-rollover'), undefined, null, { limits: bounded })
    const first = session.dispatchWithRuntimeCheckpoint('save', control(session)), before = first.prepared!.encoded
    const second = control(session)
    expect(() => session.dispatchWithRuntimeCheckpoint('save', second)).toThrow(BridgeRuntimeCheckpointHistoryFullError)
    expect(session.exportRuntimeCheckpointEncoded().encoded).toBe(before)
    const replacement = session.rolloverRuntime(bounded)
    const result = replacement.dispatchWithRuntimeCheckpoint('save', control(replacement))
    expect(result.response.accepted).toBe(true)
    expect(result.prepared!.encoded).toBe(replacement.exportRuntimeCheckpointEncoded().encoded)
    expect(result.prepared!.checkpoint.sessionId).not.toBe(session.sessionId)
    expect(result.prepared!.checkpoint.currentSaveJson).toBe(first.prepared!.checkpoint.currentSaveJson)
    expect(result.prepared!.checkpoint.savedSaveJson).toBe(first.prepared!.checkpoint.savedSaveJson)
    expect(result.prepared!.checkpoint.stateRevision).toBe(0)
    expect(result.prepared!.checkpoint.journal).toHaveLength(1)
    expect(session.exportRuntimeCheckpointEncoded().encoded).toBe(before)
    expect(replacement.dispatchWithRuntimeCheckpoint('save', second).prepared).toBeNull()
  })

  it.each(['ordinary', 'prepared'] as const)('strictly rejects malformed %s Save requests before changing the saved slot or journal', mode => {
    const session = new BridgeSession(createBridgeInitialState('dispatch-malformed-request'))
    const before = session.exportRuntimeCheckpointEncoded().encoded
    const original = control(session)
    for (const mutation of [{ unexpectedField: true }, { schemaId: 'unknown-schema' }, { protocolVersion: -1 }]) {
      const malformed = { ...original, ...mutation } as unknown as ControlEnvelope
      expect(() => mode === 'ordinary' ? session.save(malformed) : session.dispatchWithRuntimeCheckpoint('save', malformed)).toThrow()
      expect(session.exportRuntimeCheckpointEncoded().encoded).toBe(before)
      expect(session.runtimeJournalSize).toBe(0)
    }
    // Failed validation must not remember this command ID or a prospective saved slot.
    const recovered = session.dispatchWithRuntimeCheckpoint('save', original)
    expect(recovered.response.accepted).toBe(true)
    expect(recovered.prepared!.checkpoint.journal).toHaveLength(1)
    expect(recovered.prepared!.checkpoint.savedSaveJson).toBe(recovered.prepared!.checkpoint.currentSaveJson)
    expect(recovered.prepared!.encoded).toBe(session.exportRuntimeCheckpointEncoded().encoded)
  })

  it('preserves live authority on failed Save and replays the exact successful receipt after later changes and restart', async () => {
    const store = new Store(), fatals: unknown[] = []
    const options = { store, fatal: (error: unknown) => { fatals.push(error) },
      campaigns: { durable: true, regime: 'endowed' as const },
      createFreshSession: () => new BridgeSession(createBridgeInitialState('prepared-failed-write')) }
    let runtime = await createBridgeRuntimeCoordinator(options)
    try {
      expect((await runtime.campaign(await runtimeRequest(runtime, 'saveAs', { label: 'Original' }))).accepted).toBe(true)
      await advanceRuntime(runtime)
      const before = store.contents, view = await runtime.campaignLibrary()
      const save = await runtimeRequest(runtime, 'save')
      store.fail = true
      expect(await runtime.campaign(save)).toMatchObject({ accepted: false, reasonCode: 'STORAGE_UNAVAILABLE' })
      expect(store.contents).toBe(before)
      expect(await runtime.campaignLibrary()).toEqual(view)
      expect(fatals).toEqual([])
      store.fail = false
      const receipt = await runtime.campaign(save)
      expect(receipt.accepted).toBe(true)
      await advanceRuntime(runtime)
      const later = store.contents, writes = store.writes
      expect(await runtime.campaign(save)).toEqual(receipt)
      expect(store.contents).toBe(later)
      expect(store.writes).toBe(writes)
      await runtime.close()
      runtime = await createBridgeRuntimeCoordinator(options)
      const restarted = store.contents, restartedWrites = store.writes
      expect(await runtime.campaign(save)).toEqual(receipt)
      expect(store.contents).toBe(restarted)
      expect(store.writes).toBe(restartedWrites)
      expect(await runtime.campaign({ ...save, confirmDestructive: true })).toMatchObject({ accepted: false, reasonCode: 'COMMAND_ID_REUSE' })
    } finally { await runtime.close() }
  }, 20000)
})
