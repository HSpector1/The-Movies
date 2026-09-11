import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { generateWorld } from '../src/core/worldgen.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import { commitPlacement } from '../src/core/placement.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { laboratoryActionSpecs } from '../bridge/laboratory.ts'
import { industryPage } from '../bridge/industry.ts'
import { BridgeSession } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import type { IndustryQuery } from '../bridge/schema/industry-schema.ts'

function laboratory(): GameState {
  const generated = generateWorld('p13-bridge-generated-laboratory')
  let state = initializeHollywood(applyActions({ ...generated, economyEngagedEver: true }, [{ kind: 'activateStudioOperations' }]), 'fresh')
  state = commitPlacement(state, { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } })
  for (let week = 0; week < 12; week++) state = tick(state)
  return state
}
const query = (extra: Partial<IndustryQuery> = {}): IndustryQuery => ({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
  type: 'industryQuery', view: 'laboratory', targetId: 'placed-1', page: 0, pageSize: 12,
  lane: 'audienceAwareness', period: 'all', requestId: 'lab-read', sessionId: 'lab-test', expectedStateRevision: 0, ...extra })

describe('P13A Laboratory bridge', () => {
  it('publishes one exact Laboratory with named employment and truthful early-release refusal', () => {
    const state = laboratory()
    const before = JSON.stringify(state)
    const session = new BridgeSession(state, 'lab-test')
    const page = session.industry(query())
    expect('laboratory' in page).toBe(true)
    if (!('laboratory' in page) || !page.laboratory) throw new Error('Laboratory page absent')
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, page)).toEqual(page)
    expect(page.laboratory.buildingId).toBe('placed-1')
    expect(page.laboratory.seatLabel).toContain('0 of 4')
    const recruit = page.laboratory.actions.find(a => a.id === 'recruit-1')!
    expect(recruit.enabled).toBe(true)
    expect(recruit.detail).toContain('208-week contract')
    expect(recruit.detail).toContain('$2,000/week')
    expect(recruit.detail).toContain('This contract ends 1924 · Week 13')
    expect(recruit.detail).toContain('It ends before research opens 1925 · Week 1')
    expect(recruit.detail).toContain('payroll starts now')
    expect(page.laboratory.seatLabel).not.toContain('P13A')
    expect(recruit.intent?.kind).toBe('researchAction')
    const purchase = page.laboratory.actions.find(a => a.id === 'purchase-synchronized-sound')!
    expect(purchase.enabled).toBe(false)
    expect(purchase.disabledReason).toContain('1928 · Week 1')
    expect(purchase.intent).toBeNull()
    expect(JSON.stringify(state)).toBe(before)
  })

  it('rejects wrong building, stale revision and Save As session while keeping output detached', () => {
    const state = laboratory(), session = new BridgeSession(state, 'lab-test')
    expect(session.industry(query({ targetId: 'Research Laboratory' }))).toMatchObject({ accepted: false, reasonCode: 'INVALID_CONTROL' })
    expect(session.industry(query({ expectedStateRevision: 1 }))).toMatchObject({ accepted: false, reasonCode: 'STALE_REVISION' })
    expect(session.industry(query({ sessionId: 'save-as-copy' }))).toMatchObject({ accepted: false, reasonCode: 'SESSION_MISMATCH' })
    const page = session.industry(query())
    if (!('laboratory' in page) || !page.laboratory) throw new Error('Laboratory page absent')
    page.laboratory.scientistLabel = 'A mutated consumer copy'
    const fresh = session.industry(query())
    if (!('laboratory' in fresh) || !fresh.laboratory) throw new Error('Laboratory page absent')
    expect(fresh.laboratory.scientistLabel).not.toBe('A mutated consumer copy')
  })

  it('pages decisions without exposing private Laboratory data in public Industry pages', () => {
    const state = laboratory(), session = new BridgeSession(state, 'lab-test')
    const first = session.industry(query({ pageSize: 2 }))
    if (!('laboratory' in first) || !first.laboratory) throw new Error('Laboratory page absent')
    expect(first.laboratory.actions).toHaveLength(2)
    const next = session.industry(query({ pageSize: 2, page: 1 }))
    if (!('laboratory' in next) || !next.laboratory) throw new Error('Laboratory page absent')
    expect(next.laboratory.actions[0]!.id).not.toBe(first.laboratory.actions[0]!.id)
    expect(session.industry(query({ pageSize: 2, page: 999 }))).toMatchObject({ accepted: false })
    const publicPage = industryPage(state, 'lab-test', 0, query({ view: 'studios', targetId: null }))
    expect(publicPage.laboratory).toBeNull()
    expect(JSON.stringify(publicPage)).not.toContain('scientistLabel')
  })

  it('does not let read-side preflights spend money or invent employment/research history', () => {
    const state = laboratory(), before = JSON.stringify(state)
    const specs = laboratoryActionSpecs(state)
    expect(specs.some(s => s.action.kind === 'installAcousticInstruments' && s.enabled)).toBe(true)
    expect(specs.some(s => s.action.kind === 'recruitScientist' && s.enabled)).toBe(true)
    expect(JSON.stringify(state)).toBe(before)
    expect(state.technology.projects).toHaveLength(0)
    expect(state.talent.some(t => t.role === 'scientist')).toBe(false)
  })

  it('commits the exact named hire once, rejects its stale sibling intent, then assigns the employed Scientist', () => {
    const session = new BridgeSession(laboratory(), 'lab-test')
    const page = session.industry(query())
    if (!('laboratory' in page) || !page.laboratory) throw new Error('Laboratory page absent')
    const recruit = page.laboratory.actions.find(a => a.id === 'recruit-1')!
    const instruments = page.laboratory.actions.find(a => a.id === 'instruments-1')!
    const command = { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'submitIntent' as const,
      commandId: 'hire-once', sessionId: session.sessionId, expectedStateRevision: 0, payload: { intentId: recruit.intent!.intentId } }
    expect(session.command(command).accepted).toBe(true)
    const cash = session.gameState.studio.cash
    expect(session.command(command).accepted).toBe(true)
    expect(session.gameState.studio.cash).toBe(cash)
    expect(session.gameState.talent.filter(t => t.role === 'scientist')).toHaveLength(1)
    expect(session.command({ ...command, commandId: 'stale-instruments', expectedStateRevision: session.stateRevision,
      payload: { intentId: instruments.intent!.intentId } })).toMatchObject({ accepted: false, reasonCode: 'INTENT_NOT_AVAILABLE' })
    const current = session.industry(query({ expectedStateRevision: session.stateRevision }))
    if (!('laboratory' in current) || !current.laboratory) throw new Error('Laboratory page absent')
    const assign = current.laboratory.actions.find(a => a.id.startsWith('assign-'))!
    expect(assign.enabled).toBe(true)
    expect(session.command({ ...command, commandId: 'assign-scientist', expectedStateRevision: session.stateRevision,
      payload: { intentId: assign.intent!.intentId } }).accepted).toBe(true)
    expect(session.gameState.technology.projects[0]).toMatchObject({ status: 'paused', verifiedWork: 0, expenditure: 0 })
  })

  it('shows rival sound only from the actual operational receipt, without exposing private finances', () => {
    let state = initializeHollywood(generateWorld('p13-public-commercial-adoption'), 'fresh')
    while (state.market.tick < 417) state = tick(state)
    const pending = state.technology.adoptions.find(a => a.studioId !== state.hollywood!.playerStudioId)
    expect(pending).toBeDefined()
    expect(pending!.operationalWeek).toBeNull()
    const studioQuery = query({ view: 'studio', targetId: pending!.studioId, lane: 'recent' })
    const before = industryPage(state, 'lab-test', 0, studioQuery)
    expect(before.tendencies.some(t => t.label === 'Observed sound adoption')).toBe(false)
    while (state.market.tick < 428) state = tick(state)
    const receipt = state.hollywood!.receipts.find(r => r.kind === 'technologyAdopted' && r.adoptionId === pending!.id)
    expect(receipt).toMatchObject({ week: 428, studioId: pending!.studioId })
    const after = industryPage(state, 'lab-test', 0, studioQuery)
    const observed = after.tendencies.find(t => t.label === 'Observed sound adoption')!
    expect(observed.detail).toContain('1928 · Week 13')
    expect(observed.detail).toContain('commercial purchase')
    expect(observed.basis).toContain('not a strategy forecast')
    const pulse = industryPage(state, 'lab-test', 0, query({ view: 'pulse', targetId: null, pageSize: 50 }))
    expect(pulse.activities.some(a => a.eventId === receipt!.eventId && a.headline.includes('operational synchronized sound'))).toBe(true)
    for (const page of [after, pulse]) {
      expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, page)).toEqual(page)
      const json = JSON.stringify(page)
      for (const privateField of ['equipmentCost', 'accessCost', 'account', 'annualSalary', 'researchSpend', 'negativeScale'])
        expect(json).not.toContain('"' + privateField + '"')
    }
  }, 30_000)
})
