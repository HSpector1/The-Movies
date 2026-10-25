// Stabilization 2026-10-24, Owner decisions 9A and 10A on audit finding L-32: the Bridge rows over
// a cancelled technology adoption.
//
// fbb17896 made bridge/laboratory.ts offer the adopt row again on a stage whose adoption was
// cancelled (stage uniqueness keyed on `cancelledWeek === null`) with no Bridge test, and the
// `plan-queue-adopt-*` companion still read the cancelled stage placement as committed work. Both
// rows are read here through a real BridgeSession's Laboratory view, and every decision is
// dispatched through that session.
//
// Route: the first-inventor sound adoption committed at week 303 (`s6SoundReady`, the fixture
// tests/stabilization-l32-adoption-restart.test.ts uses), cancelled in its commit week through its
// own Bridge cancel row (no site work begun, so no restoration holds the stage), then adopted
// again through the re-offered adopt row.
import { beforeAll, describe, expect, it } from 'vitest'
import { adoptionQuote } from '../src/core/technologyAdoption.js'
import type { GameState } from '../src/core/types.js'
import { s6SoundReady } from '../src/harness/p13b/s6-fixtures.js'
import { BridgeSession } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'

type WireAction = {
  id: string; enabled: boolean; disabledReason: string | null
  intent: { intentId: string; kind: string } | null
  quote: { rejections: string[]; refusal: string | null } | null
}
type WireLaboratoryPage = { actions: WireAction[] }

function required<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) throw new Error(message)
  return value
}

let requestCounter = 0
let commandCounter = 0

function labBuildingId(state: GameState): string {
  const lab = required(state.placement.facilities.find(p => p.blueprintId === 'research-laboratory' && p.installation === undefined),
    'no installed Research Laboratory placement on this state')
  return `placed-${String(lab.id)}`
}

function labPage(session: BridgeSession, buildingId: string): WireLaboratoryPage {
  const actions = new Map<string, WireAction>()
  let pageCount = 1
  for (let page = 0; page < pageCount; page++) {
    const response = session.industry({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'industryQuery', view: 'laboratory',
      targetId: buildingId, page, pageSize: 50, lane: 'audienceAwareness', period: 'all',
      requestId: `l32-adopt-row-${String(requestCounter++)}`, sessionId: session.sessionId, expectedStateRevision: session.stateRevision,
    } as never) as unknown as Record<string, unknown>
    if (!('laboratory' in response) || response.laboratory === null) throw new Error(`laboratory view rejected: ${JSON.stringify(response).slice(0, 500)}`)
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, response)).toEqual(response)
    pageCount = response.pageCount as number
    for (const action of (response.laboratory as WireLaboratoryPage).actions) actions.set(action.id, action)
  }
  return { actions: [...actions.values()] }
}

function dispatchRow(session: BridgeSession, page: WireLaboratoryPage, rowId: string): void {
  const row = required(page.actions.find(a => a.id === rowId), `row "${rowId}" absent from ${JSON.stringify(page.actions.map(a => a.id))}`)
  if (!row.enabled || row.intent === null) throw new Error(`row "${rowId}" is not enabled: ${row.disabledReason ?? 'no reason given'}`)
  const response = session.command({
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'submitIntent',
    commandId: `l32-adopt-row-command-${String(commandCounter++)}`, sessionId: session.sessionId,
    expectedStateRevision: session.stateRevision, payload: { intentId: row.intent.intentId },
  })
  if (!response.accepted) throw new Error(`row "${rowId}" was refused: ${JSON.stringify(response)}`)
}

describe('L-32 on the Bridge: a cancelled adoption re-opens its stage on the adopt row and the plan companion', () => {
  // The route runs once; each case reads the captured states and pages and never mutates them.
  let ready: ReturnType<typeof s6SoundReady>
  let cancelledState: GameState, restartedState: GameState
  let live: WireLaboratoryPage, cancelled: WireLaboratoryPage, restarted: WireLaboratoryPage
  let adoptRowId: string, companionRowId: string
  beforeAll(() => {
    ready = s6SoundReady()
    adoptRowId = `adopt-synchronized-sound-${ready.stageFacilityId}-${ready.postFacilityId}`
    companionRowId = `plan-queue-adopt-synchronized-sound-${ready.stageFacilityId}`
    const session = new BridgeSession(ready.state, 'l32-adopt-row')
    const buildingId = labBuildingId(ready.state)
    live = labPage(session, buildingId)
    dispatchRow(session, live, `cancel-adoption-${ready.adoptionId}`)
    cancelledState = session.gameState
    cancelled = labPage(session, buildingId)
    dispatchRow(session, cancelled, adoptRowId)
    restartedState = session.gameState
    restarted = labPage(session, buildingId)
  }, 120_000)

  it('premise: while the first adoption is live, its stage offers neither the adopt row nor the plan companion, and the cancel row is offered', () => {
    expect(live.actions.some(a => a.id === adoptRowId)).toBe(false)
    expect(live.actions.some(a => a.id === companionRowId)).toBe(false)
    expect(live.actions.find(a => a.id === `cancel-adoption-${ready.adoptionId}`)?.intent?.kind).toBe('cancellationAction')
  })

  it('premise: the Bridge cancellation left only a cancelled stage record and a cancelled adoption row on that stage', () => {
    expect(cancelledState.technology.adoptions.find(a => a.id === ready.adoptionId)?.cancelledWeek).toBe(cancelledState.market.tick)
    expect(cancelledState.placement.facilities
      .filter(f => f.installation?.targetFacilityId === ready.stageFacilityId).map(f => [f.blueprintId, f.status]))
      .toEqual([['synchronized-sound-stage', 'cancelled']])
  })

  it('after the cancellation the adopt row is published enabled again on that stage, with the engine quote unrefused', () => {
    const row = required(cancelled.actions.find(a => a.id === adoptRowId), `row "${adoptRowId}" absent after the cancellation: ${JSON.stringify(cancelled.actions.map(a => a.id))}`)
    expect(row.enabled).toBe(true)
    expect(row.disabledReason).toBeNull()
    expect(row.intent?.kind).toBe('adoptTechnology')
    expect(row.quote).toMatchObject({ rejections: [], refusal: null })
    expect(adoptionQuote(cancelledState, { technologyId: 'synchronized-sound', stageFacilityId: ready.stageFacilityId, postFacilityId: ready.postFacilityId }).ok).toBe(true)
  })

  it('after the cancellation the plan companion no longer reads the cancelled stage record as committed: it is published enabled', () => {
    const row = required(cancelled.actions.find(a => a.id === companionRowId), `row "${companionRowId}" absent after the cancellation: ${JSON.stringify(cancelled.actions.map(a => a.id))}`)
    expect(row.enabled).toBe(true)
    expect(row.disabledReason).toBeNull()
    expect(row.intent?.kind).toBe('physicalPlanAction')
  })

  it('the re-offered adopt row restarts as a new adoption, and that live restart withholds both rows on the stage again', () => {
    const restart = required(restartedState.technology.adoptions.find(a => a.stageFacilityId === ready.stageFacilityId && a.cancelledWeek === null),
      'no live restart adoption on the stage after dispatching the re-offered adopt row')
    expect(restart.id).not.toBe(ready.adoptionId)
    expect(restarted.actions.some(a => a.id === adoptRowId)).toBe(false)
    expect(restarted.actions.some(a => a.id === companionRowId)).toBe(false)
  })
})
