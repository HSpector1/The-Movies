// Sprint 11 Bridge slice A: the read-only P17 franchise view on the real Industry route (projection 65).
// RED at 2c50c9df by assertion: the closed Industry request parser has no `franchises` view there. Every expected value
// is the core's own reader called directly (continuationWorldOf, continuationQuote, recognitionReported, fatigueAt,
// momentumAt, branchBand); the route under test is BridgeSession.industry. The world is P17's real route on landed P16
// rights (tests/helpers/p17-route.ts): a released origin film and the player's greenlit direct sequel.
import { beforeAll, describe, expect, it } from 'vitest'
import { BridgeSession } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID, validateIndustry } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import type { IndustryQuery } from '../bridge/schema/industry-schema.ts'
import { continuationQuote, type ContinuationRequest } from '../src/core/continuation.js'
import { continuationWorldOf } from '../src/core/continuationGreenlight.js'
import { branchBand, fatigueAt, momentumAt, recognitionReported } from '../src/core/continuationSignals.js'
import { storyPropertyId } from '../src/core/rights.js'
import { stableStringify } from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
import { mintRoute } from './helpers/p16-fixtures.js'
import { freshConcept, greenlightAs } from './helpers/p17-route.js'

function query(session: BridgeSession, extra: Partial<IndustryQuery> = {}) {
  const request = { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, requestId: 'p17-franchise-read',
    expectedStateRevision: session.stateRevision, type: 'industryQuery', view: 'franchises', targetId: null, page: 0, pageSize: 50,
    lane: 'recent', period: 'all', ...extra } as IndustryQuery
  const parsed = validateIndustry(request)
  expect(parsed, 'the closed Industry request parser admits the franchises view').toMatchObject({ ok: true })
  if (!parsed.ok) throw new Error('unreachable after the assertion above')
  return session.industry(parsed.request)
}
function page(session: BridgeSession) {
  const result = query(session)
  expect(result).toHaveProperty('franchises')
  if (!('franchises' in result)) throw new Error('unreachable after the assertion above')
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, result)).toEqual(result)
  expect(result.franchises).not.toBeNull()
  return result
}

describe('P17 franchise read model on the Bridge Industry route (projection 65)', () => {
  let origin: string, property: string, released: GameState, state: GameState, sequel: string, player: string
  beforeAll(() => {
    const route = mintRoute('bridge-p17-franchise-read')
    origin = route.productionId
    property = storyPropertyId(route.conceptId)
    released = route.released
    const b = greenlightAs(released, freshConcept(released), { type: 'directSequel', predecessorProductionId: origin })
    state = b.state
    sequel = b.productionId
    player = state.hollywood!.playerStudioId
  })

  it('publishes the property with its typed lineage, Recognition/Fatigue and each continuity\'s Momentum from the core readers', () => {
    const result = page(new BridgeSession(state, 'p17-franchise-lineage'))
    const world = continuationWorldOf(state), week = state.market.tick
    const root = world.franchises.properties.find((p) => p.storyPropertyId === property)!
    expect(result.franchises!.properties.map((p) => p.storyPropertyId)).toEqual([property])
    expect(result.totalRows).toBe(1)
    const row = result.franchises!.properties[0]!
    expect(row).toMatchObject({ storyPropertyId: property, franchiseId: root.franchiseId, mintedWeek: week, subProperties: [] })
    expect(row.installments.map((i) => [i.productionId, i.type, i.parentProductionId])).toEqual([[origin, 'origin', null], [sequel, 'directSequel', origin]])
    expect(row.installments[0]).toMatchObject({ greenlitWeek: null, studioId: null })
    expect(row.installments[0]!.releasedWeek).not.toBeNull()
    expect(row.installments[1]).toMatchObject({ greenlitWeek: week, studioId: player, releasedWeek: null })
    expect(row.recognition).toBe(recognitionReported(root.meter, week))
    expect(row.recognition).toBeGreaterThan(0)
    expect(row.fatigue).toBe(fatigueAt(root.meter, week))
    const main = root.branches[0]!
    expect(row.branches).toEqual([{ branchId: main.branchId, kind: 'main', subPropertyId: null, openedAtWeek: main.openedAtWeek,
      lastReleaseWeek: main.lastReleaseWeek, momentum: momentumAt(main, week), band: branchBand(main, root.meter, week) }])
    expect(row.installments.every((i) => i.branchId === main.branchId)).toBe(true)
  })

  it('lists exactly the continuation choices the core quote admits for the player now, and reboot legality from the same quote', () => {
    const row = page(new BridgeSession(state, 'p17-franchise-choices')).franchises!.properties[0]!
    const world = continuationWorldOf(state)
    const ask = (request: ContinuationRequest) => continuationQuote(world, { studioId: player, productionId: 'p17-franchise-read-expected', request })
    const types = ['directSequel', 'prequel', 'remake', 'reboot'] as const
    const expected = [origin, sequel].flatMap((film) => types.map((type) => ask({ type, predecessorProductionId: film })))
      .flatMap((q) => q.ok ? [{ type: q.type, predecessorProductionId: q.predecessorProductionId, subPropertyId: q.subPropertyId, branchId: q.branchId,
        branchKind: q.branchKind, use: q.use, recognition: q.recognition, momentum: q.momentum, fatigue: q.fatigue,
        inheritedAwareness01: q.inheritedAwareness01, band: q.band }] : [])
    expect(row.choices).toEqual(expected)
    // The released origin may be continued and remade; the locked, unreleased sequel may be continued but never remade.
    expect(row.choices).toContainEqual(expect.objectContaining({ type: 'directSequel', predecessorProductionId: origin, use: 'sequel', branchKind: 'main' }))
    expect(row.choices).toContainEqual(expect.objectContaining({ type: 'remake', predecessorProductionId: origin, use: 'remake' }))
    expect(row.choices).toContainEqual(expect.objectContaining({ type: 'directSequel', predecessorProductionId: sequel }))
    expect(row.choices.some((c) => c.type === 'remake' && c.predecessorProductionId === sequel)).toBe(false)
    const reboot = ask({ type: 'reboot', predecessorProductionId: origin })
    expect(row.rebootLegal).toBe(reboot.ok)
    expect(row.rebootRefusal).toBe(reboot.ok ? null : reboot.reason)
    expect(row.choices.some((c) => c.type === 'reboot')).toBe(reboot.ok)
  })

  it('is read-only and guarded: no state or revision change, detached rows, stale revision and non-null target refused, empty before any continuation', () => {
    const before = stableStringify(state)
    const session = new BridgeSession(state, 'p17-franchise-guarded')
    const checkpoint = session.exportRuntimeCheckpoint()
    const first = page(session)
    first.franchises!.properties[0]!.choices.length = 0
    first.franchises!.properties[0]!.installments[0]!.type = 'reboot'
    const second = page(session)
    expect(second.franchises!.properties[0]!.choices.length).toBeGreaterThan(0)
    expect(second.franchises!.properties[0]!.installments[0]!.type).toBe('origin')
    expect(query(session, { expectedStateRevision: session.stateRevision + 1 })).toMatchObject({ accepted: false, reasonCode: 'STALE_REVISION' })
    expect(query(session, { targetId: property })).toMatchObject({ accepted: false, reasonCode: 'INVALID_CONTROL' })
    const after = session.exportRuntimeCheckpoint()
    expect(after.currentSaveJson).toBe(checkpoint.currentSaveJson)
    expect(after.stateRevision).toBe(checkpoint.stateRevision)
    expect(stableStringify(state)).toBe(before)
    const empty = page(new BridgeSession(released, 'p17-franchise-none'))
    expect(empty.franchises!.properties).toEqual([])
    expect(empty.totalRows).toBe(0)
  })
})
