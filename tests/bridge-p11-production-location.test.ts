import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BridgeSession } from '../bridge/session.ts'
import { loadBridgeRuntimeCheckpoint, SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS } from '../bridge/runtime-checkpoint.ts'
import { castingProjection } from '../bridge/casting.ts'
import { PROTOCOL_VERSION, SCHEMA_ID, BRIDGE_SCHEMA } from '../bridge/protocol.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { applyActions, stableStringify, tick } from '../src/core/index.ts'
import { studioLotSnapshot } from '../ui/src/engine/adapter.ts'
import { contendedStudio } from './_m4Fixtures.ts'
import type { BridgeCastingDraftPayload } from '../bridge/schema/bridge-schema.ts'

function fixture(id: string) {
  return BridgeSession.fromRuntimeCheckpoint(loadBridgeRuntimeCheckpoint(readFileSync(
    new URL(`../ui/e2e/p11-core-v3/${id}.checkpoint.json`, import.meta.url), 'utf8')).hydrated).gameState
}
function references(state: ReturnType<typeof fixture>) {
  const before = stableStringify(state), snapshot = studioLotSnapshot(state)
  const ids = new Set(snapshot.property!.buildings.map(b => b.id))
  for (const row of snapshot.productionOperations ?? []) {
    if (row.locationBuildingId === null) {
      expect(row.worksiteResolution).toBe('none')
      expect(row.primaryWorkTarget).toBeNull()
      expect(row.ownedWorksites).toEqual([])
    } else expect(ids.has(row.locationBuildingId)).toBe(true)
    for (const target of [...row.ownedWorksites ?? [], ...row.locateTargets ?? [], ...row.primaryWorkTarget ? [row.primaryWorkTarget] : []]) {
      if (target.buildingId !== null) expect(ids.has(target.buildingId)).toBe(true)
    }
  }
  expect(stableStringify(state)).toBe(before)
  return snapshot.productionOperations!
}
describe('P11 exact production property locations', () => {
  it('accepts authentic26 and projects a real immediate Greenlight at the reserved placed office', () => {
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get('sha256:2b339a6a8b3e5add0726b7eaac9ce8746e235d8b6111a6816f890ff56afdffd1')).toBe('projection-v26')
    const state = fixture('s10-p11-ready-package'), session = new BridgeSession(state, 'p11-location-regression')
    const p = castingProjection(state).board!.projects.find(p => p.projectId === 'script-0001')!
    const actors = p.leadCandidates.filter(c => c.available)
    const draft: BridgeCastingDraftPayload = { kind: 'greenlightPackage', projectId: p.projectId,
      slateLead: null, slateAntagonist: null, slateSupport: null, signTalentId: null, signTermWeeks: null,
      directorId: p.directorCandidates.find(c => c.available)!.talentId, craftLeadId: p.craftCandidates.find(c => c.available)!.talentId,
      castLead: actors[0]!.talentId, castAntagonist: actors[1]!.talentId, castSupport: actors[2]!.talentId,
      budgetNegative: p.negativeOptions[0]!.amount, budgetMarketing: p.marketingOptions[0]!.amount }
    const envelope = { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, expectedStateRevision: 0 }
    const quote = session.quote({ ...envelope, commandId: 'location-quote', type: 'quoteCasting', draft })
    if (!quote.accepted) throw Error(quote.message)
    const response = session.command({ ...envelope, commandId: 'location-greenlight', type: 'submitIntent', payload: { intentId: quote.quote.intentId } })
    expect(response.accepted).toBe(true)
    expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeAcceptedCommandResponse, response)).not.toThrow()
    expect(session.gameState.studio.cash).toBe(quote.quote.financial!.cashAfter)
    const [row] = references(session.gameState)
    expect(row).toMatchObject({ locationBuildingId: 'placed-1', primaryWorkTarget: { buildingId: 'placed-1' } })
    expect(row!.locateTargets!.map(t => t.buildingId)).toContain('placed-1')
    let next = session.gameState
    for (let i = 0; i < 8 && next.operations.workflows[0]!.phase === 'development'; i++) next = tick(next)
    expect(next.operations.workflows[0]!.phase).toBe('preProduction')
    expect(references(next)[0]!.locationBuildingId).toBe('placed-1')
  })
  it('uses the real placed Post reservation, then no guessed site for ready or committed release', () => {
    const post = fixture('s12-p11-post-production')
    expect(references(post)[0]).toMatchObject({ phase: 'postProduction', locationBuildingId: 'placed-4', primaryWorkTarget: { buildingId: 'placed-4' } })
    const ready = fixture('s13-p11-release-ready')
    expect(references(ready)[0]).toMatchObject({ phase: 'releaseReady', locationBuildingId: null, worksiteResolution: 'none' })
    const committed = applyActions(ready, [{ kind: 'commitPictureToRelease', productionId: ready.studio.activeProductions[0]!.id }])
    expect(committed.releaseAuthority.commitments).toHaveLength(1)
    expect(references(committed)[0]).toMatchObject({ operationalState: 'release-committed', locationBuildingId: null, worksiteResolution: 'none' })
  })
  it('preserves actual authored endowed phase-home addresses', () => {
    let { state } = contendedStudio('p11-location-endowed')
    const first = references(state)
    expect(first.every(r => r.locationBuildingId === 'casting' || r.locationBuildingId === 'writers')).toBe(true)
    state = tick(state)
    references(state)
  })
})
