import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { createBridgeRuntimeCoordinator, type BridgeRuntimeCoordinator } from '../bridge/runtime/runtime-coordinator.ts'
import type { BridgeCheckpointStore } from '../bridge/runtime/checkpoint-store.ts'
import { decodeCampaignStorage } from '../bridge/runtime/campaign-storage-codec.ts'
import { BridgeSession } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import type { CampaignRequest } from '../bridge/schema/bridge-schema.ts'
import type { CampaignLibrary } from '../bridge/runtime/campaign-library.ts'
import { DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS } from '../bridge/runtime-checkpoint.ts'
import { applyActions, importSave, migrateToV30 } from '../src/core/index.js'
import type { GameState } from '../src/core/types.js'
import { p13aLaboratorySlice } from '../src/harness/p13a/fixtures.js'

// P13B-S3 plan test 7 (task expansion, 2026-09-16), A11 half: "a campaign-library
// Save As copy keeps the same plan ids and advances independently (A11:
// complete-state comparison, the inactive copy does not advance)". Driving
// `saveAs` needs the bridge session (`bridge/runtime/campaign-library.ts`), so
// per the task assignment this ONE case lives in its own bridge test file,
// separate from the core-only tests/p13b-s3-save-v23.test.ts. Pattern copied
// from tests/bridge-p12-campaign-library.test.ts's own `Store`/`options`/
// `request`/`library`/`working`/`state`/`advance` helpers, adapted from
// `migrateToV22` to `migrateToV23`. RED by design — `queuePhysicalPlan` and
// `migrateToV23` do not exist yet, so the source-state build below throws
// before any bridge dispatch runs.
//
// Note: `tsconfig.json` excludes `tests/bridge*.test.ts` from the project's
// strict `tsc` set (same as every other bridge test file already does), so
// this file's RED signal, run via vitest only, is a runtime one, not a
// typecheck one — recorded here so that distinction is not lost in the report.

class Store implements BridgeCheckpointStore {
  checkpointPath = '/synthetic/p13b-s3-save-as.json'
  fail = false
  closed = false
  constructor(public contents: string | null = null) {}
  async read() { return this.contents }
  async writeAtomic(text: string) { if (this.fail) throw new Error('injected pre-commit write failure'); this.contents = text }
  async close() { this.closed = true }
}

function options(store: Store, source: GameState) {
  return {
    store, fatal: (e: unknown) => { throw e }, campaigns: { durable: true, regime: 'endowed' as const },
    createFreshSession: () => new BridgeSession(source),
  }
}

async function request(runtime: BridgeRuntimeCoordinator, operation: CampaignRequest['operation'], extra: Partial<CampaignRequest> = {}): Promise<CampaignRequest> {
  const library = (await runtime.campaignLibrary())!
  return {
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'campaign', commandId: randomUUID(), sessionId: library.sessionId,
    expectedStateRevision: library.stateRevision, expectedCatalogueRevision: library.catalogueRevision, expectedActiveCampaignId: library.activeCampaignId,
    operation, campaignId: null, label: null, overwriteCampaignId: null, confirmDestructive: false, unsavedDisposition: 'requireClean', ...extra,
  }
}

function library(store: Store): CampaignLibrary {
  return decodeCampaignStorage(JSON.parse(store.contents!), DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS.maxCheckpointBytes, 32) as CampaignLibrary
}
function working(store: Store) { return JSON.parse(library(store).workingCheckpointJson) }
function state(store: Store): GameState { return migrateToV30(importSave(working(store).currentSaveJson)).state }

async function advance(runtime: BridgeRuntimeCoordinator) {
  const snapshot = await runtime.read(s => s.snapshot())
  const option = snapshot.availableIntents.find(i => i.kind === 'advanceWeek')!
  expect(option).toBeTruthy()
  const result = await runtime.dispatch('command', {
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: snapshot.sessionId,
    commandId: randomUUID(), expectedStateRevision: snapshot.stateRevision, type: 'submitIntent', payload: { intentId: option.intentId },
  })
  expect(result.response.accepted).toBe(true)
}

describe('P13B-S3 Save As (test 7, A11)', () => {
  it('a Save As copy keeps the same plan ids and advances independently; the inactive original never advances (complete-state comparison)', async () => {
    let source = p13aLaboratorySlice()
    const laboratoryFacilityId = source.operations.facilities.find(f => f.capability === 'laboratory')!.id
    source = applyActions(source, [{
      kind: 'queuePhysicalPlan',
      work: { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } },
      approvedMaximumDebit: 350_000,
    } as never])

    const store = new Store()
    const runtime = await createBridgeRuntimeCoordinator(options(store, source))
    try {
      const savedOriginal = await runtime.campaign(await request(runtime, 'saveAs', { label: 'Original' }))
      expect(savedOriginal.accepted).toBe(true)
      const originalId = library(store).activeCampaignId!
      const first = state(store)
      // P13B-S8 sweep: the plan root is shared by every studio, and a rival now
      // admits its own Laboratory plans onto it. The Save As claim under test is
      // about THIS studio's plan identities.
      const own = first.hollywood!.playerStudioId
      const ownPlanIds = (s: typeof first): string[] =>
        s.physicalPlans.plans.filter((p: { studioId: string }) => p.studioId === own).map((p: { id: string }) => p.id)
      const originalPlanIds = ownPlanIds(first)
      expect(originalPlanIds).toHaveLength(1)

      // A Save As copy of the now-active "Original" record.
      const savedCopy = await runtime.campaign(await request(runtime, 'saveAs', { label: 'Active copy' }))
      expect(savedCopy.accepted).toBe(true)
      expect(ownPlanIds(state(store))).toEqual(originalPlanIds) // same plan ids, preserved exactly

      await advance(runtime) // only the ACTIVE copy advances
      expect(state(store).market.tick).toBeGreaterThan(first.market.tick)

      // `unsavedDisposition: 'requireClean'` refuses `load` while the active
      // copy carries the just-advanced, unsaved week (probe 2, 2026-09-16:
      // "Save or discard current progress before leaving this campaign, or
      // cancel."). Save the active copy's own progress first, exactly as a
      // player choosing "Save" before switching campaigns would.
      const snap = await runtime.read(s => s.snapshot())
      const saved = await runtime.dispatch('save', {
        protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: snap.sessionId,
        commandId: randomUUID(), expectedStateRevision: snap.stateRevision,
      })
      expect(saved.response.accepted).toBe(true)

      // Reload the INACTIVE original: complete-state comparison against its own
      // pre-advance snapshot — it must be untouched, byte for byte.
      const loaded = await runtime.campaign(await request(runtime, 'load', { campaignId: originalId }))
      expect(loaded.accepted).toBe(true)
      expect(state(store)).toEqual(first)
    } finally {
      await runtime.close()
    }
  }, 20_000)
})
