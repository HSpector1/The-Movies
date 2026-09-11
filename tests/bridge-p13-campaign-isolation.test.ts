import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { BridgeSession } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import type { CampaignRequest } from '../bridge/schema/bridge-schema.ts'
import type { IndustryQuery } from '../bridge/schema/industry-schema.ts'
import { loadCampaignLibrary, type CampaignLibrary } from '../bridge/runtime/campaign-library.ts'
import type { BridgeCheckpointStore } from '../bridge/runtime/checkpoint-store.ts'
import { createBridgeRuntimeCoordinator, type BridgeRuntimeCoordinator } from '../bridge/runtime/runtime-coordinator.ts'
import { DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS, type BridgeRuntimeCheckpointLimits } from '../bridge/runtime-checkpoint.ts'
import { applyActions } from '../src/core/actions.js'
import { importSave, migrateToV20 } from '../src/core/save.js'
import { advanceTo, p13aResearchReady } from '../src/harness/p13a/fixtures.js'

class MemoryStore implements BridgeCheckpointStore {
  readonly checkpointPath = '/generated-test-only/p13a-campaign-isolation.json'
  contents: string | null = null
  async read() { return this.contents }
  async writeAtomic(text: string) { this.contents = text }
  async close() {}
}
function library(store: MemoryStore): CampaignLibrary {
  return loadCampaignLibrary(store.contents!, DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS).library
}
function state(store: MemoryStore) {
  return migrateToV20(importSave(JSON.parse(library(store).workingCheckpointJson).currentSaveJson)).state
}
async function request(runtime: BridgeRuntimeCoordinator, operation: CampaignRequest['operation'], extra: Partial<CampaignRequest> = {}): Promise<CampaignRequest> {
  const current = (await runtime.campaignLibrary())!
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'campaign', commandId: randomUUID(),
    sessionId: current.sessionId, expectedStateRevision: current.stateRevision, expectedCatalogueRevision: current.catalogueRevision,
    expectedActiveCampaignId: current.activeCampaignId, operation, campaignId: null, label: null, overwriteCampaignId: null,
    confirmDestructive: false, unsavedDisposition: 'requireClean', ...extra }
}
async function advance(runtime: BridgeRuntimeCoordinator) {
  const snapshot = await runtime.read(session => session.snapshot())
  const intent = snapshot.availableIntents.find(option => option.kind === 'advanceWeek')!
  expect(intent).toBeDefined()
  return runtime.dispatch('command', { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'submitIntent',
    commandId: randomUUID(), sessionId: snapshot.sessionId, expectedStateRevision: snapshot.stateRevision,
    payload: { intentId: intent.intentId } })
}

describe('P13A research authority across named campaign operations', () => {
  it('Save As branches real research, inactive and renamed campaigns stay frozen, and a new campaign receives none of their authority', async () => {
    const ready = p13aResearchReady()
    const source = advanceTo(applyActions(ready, [{ kind: 'beginResearch', projectId: ready.technology.projects[0]!.id, budgetPerWeek: 10_000 }]), 263)
    const store = new MemoryStore()
    const options = { store, fatal: (error: unknown) => { throw error }, campaigns: { durable: true, regime: 'endowed' as const },
      createFreshSession: (limits: BridgeRuntimeCheckpointLimits) => new BridgeSession(source, undefined, null, { limits }) }
    let runtime = await createBridgeRuntimeCoordinator(options)
    try {
      expect((await runtime.campaign(await request(runtime, 'saveAs', { label: 'Research original' }))).accepted).toBe(true)
      const originalId = library(store).activeCampaignId!
      const originalBytes = library(store).records.find(record => record.id === originalId)!.checkpointJson
      const originalSession = (await runtime.campaignLibrary())!.sessionId
      expect((await advance(runtime)).response.accepted).toBe(true)
      expect(state(store).technology.projects[0]!.verifiedWork).toBe(6)
      expect((await runtime.campaign(await request(runtime, 'saveAs', { label: 'Research copy' }))).accepted).toBe(true)
      const copyId = library(store).activeCampaignId!
      expect(copyId).not.toBe(originalId)
      expect((await runtime.campaignLibrary())!.sessionId).not.toBe(originalSession)
      expect(library(store).records.find(record => record.id === originalId)!.checkpointJson).toBe(originalBytes)
      expect(state(store).technology.projects[0]).toMatchObject({ id: source.technology.projects[0]!.id, scientistId: source.technology.projects[0]!.scientistId })

      const current = (await runtime.campaignLibrary())!
      const query: IndustryQuery = { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'industryQuery',
        requestId: 'copy-laboratory', sessionId: current.sessionId, expectedStateRevision: current.stateRevision,
        view: 'laboratory', targetId: 'placed-1', page: 0, pageSize: 50, lane: 'audienceAwareness', period: 'all' }
      const page = await runtime.read(session => session.industry(query))
      if (!('laboratory' in page) || !page.laboratory) throw new Error('Copy Laboratory absent')
      const pause = page.laboratory.actions.find(action => action.id.startsWith('pause-'))!
      expect(pause.enabled).toBe(true)
      expect((await runtime.dispatch('command', { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'submitIntent',
        commandId: 'pause-copy', sessionId: current.sessionId, expectedStateRevision: current.stateRevision,
        payload: { intentId: pause.intent!.intentId } })).response.accepted).toBe(true)
      expect((await runtime.campaign(await request(runtime, 'save'))).accepted).toBe(true)
      const copyBytes = library(store).records.find(record => record.id === copyId)!.checkpointJson
      const workingBeforeRename = library(store).workingCheckpointJson
      expect((await runtime.campaign(await request(runtime, 'rename', { campaignId: originalId, label: 'Original retained' }))).accepted).toBe(true)
      expect(library(store).workingCheckpointJson).toBe(workingBeforeRename)
      expect(library(store).records.find(record => record.id === originalId)!.checkpointJson).toBe(originalBytes)

      expect((await runtime.campaign(await request(runtime, 'load', { campaignId: originalId }))).accepted).toBe(true)
      expect(state(store).technology.projects[0]).toMatchObject({ status: 'active', verifiedWork: 4.5, expenditure: 30_000 })
      expect(state(store).contracts).toEqual(source.contracts)
      expect((await advance(runtime)).response.accepted).toBe(true)
      expect(state(store).technology.projects[0]).toMatchObject({ status: 'active', verifiedWork: 6, expenditure: 40_000 })
      expect(library(store).records.find(record => record.id === copyId)!.checkpointJson).toBe(copyBytes)
      expect((await runtime.campaign(await request(runtime, 'save'))).accepted).toBe(true)

      expect((await runtime.campaign(await request(runtime, 'newGame', { label: 'Independent new studio' }))).accepted).toBe(true)
      const fresh = state(store)
      expect(fresh.seed).not.toBe(source.seed)
      expect(fresh.hollywood!.worldId).not.toBe(source.hollywood!.worldId)
      expect(fresh.technology).toMatchObject({ projects: [], access: [], adoptions: [], productions: [] })
      expect(fresh.talent.some(person => person.role === 'scientist')).toBe(false)
      expect(library(store).records.find(record => record.id === copyId)!.checkpointJson).toBe(copyBytes)
      expect((await runtime.campaign(await request(runtime, 'load', { campaignId: copyId }))).accepted).toBe(true)
      expect(state(store).technology.projects[0]).toMatchObject({ status: 'paused', verifiedWork: 6, expenditure: 40_000 })
      await runtime.close()
      runtime = await createBridgeRuntimeCoordinator(options)
      expect(library(store).activeCampaignId).toBe(copyId)
      expect(state(store).technology.projects[0]).toMatchObject({ status: 'paused', verifiedWork: 6, expenditure: 40_000 })
      expect(library(store).records.find(record => record.id === originalId)!.label).toBe('Original retained')
      expect(library(store).records.find(record => record.id === copyId)!.checkpointJson).toBe(copyBytes)
    } finally { await runtime.close() }
  }, 60_000)
})
