import { describe, expect, it } from 'vitest'
import { BridgeSession } from '../bridge/session.js'
import { castingDraftToEngine, castingProjection } from '../bridge/casting.js'
import type { BridgeCastingDraftPayload } from '../bridge/schema/bridge-schema.js'
import { BRIDGE_SCHEMA, PROTOCOL_VERSION, SCHEMA_ID, validateQuote } from '../bridge/protocol.js'
import { parseWireValue } from '../bridge/schema/runtime.js'
import { scriptProjectsReadModel } from '../src/core/index.js'
import { foundationRecoveryStudio } from './contracts/_foundationRecoveryFixtures.js'

function command(session: BridgeSession, id: string, intentId: string) {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
    sessionId: session.sessionId, commandId: id, expectedStateRevision: session.stateRevision,
    type: 'submitIntent' as const, payload: { intentId } }
}

function emptyDraft(kind: BridgeCastingDraftPayload['kind']): BridgeCastingDraftPayload {
  return { kind, projectId: null, slateLead: null, slateAntagonist: null, slateSupport: null,
    directorId: null, castLead: null, castAntagonist: null, castSupport: null, craftLeadId: null,
    budgetNegative: null, budgetMarketing: null, signTalentId: null, signTermWeeks: null }
}

function hiringQuote(session: BridgeSession, role: 'writer' | 'actor') {
  const market = castingProjection(session.gameState).board!.hiringCandidates
  const candidate = market.find(p => p.role === role && p.offers.some(o => o.signingBonus <= session.gameState.studio.cash))!
  expect(candidate, 'The actual market must contain an affordable eligible hire').toBeDefined()
  const offer = candidate.offers.find(o => o.signingBonus <= session.gameState.studio.cash)!
  const parsed = validateQuote({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
    sessionId: session.sessionId, commandId: 'recover-hire-' + role, expectedStateRevision: session.stateRevision,
    type: 'quoteCasting', draft: { kind: 'signActor', projectId: null,
      slateLead: null, slateAntagonist: null, slateSupport: null, directorId: null,
      castLead: null, castAntagonist: null, castSupport: null, craftLeadId: null,
      budgetNegative: null, budgetMarketing: null, signTalentId: candidate.talentId, signTermWeeks: offer.termWeeks } })
  expect(parsed.ok, JSON.stringify(parsed)).toBe(true)
  if (!parsed.ok) throw new Error('Standalone hiring must pass the actual wire boundary')
  const quote = session.quote(parsed.quote)
  expect(quote.accepted).toBe(true)
  if (!quote.accepted) throw new Error(quote.message)
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse, quote), 'The actual legal fractional-cash response must cross the consumed wire contract').toEqual(quote)
  const consequence = quote.quote
  if (consequence.kind !== 'signContract') throw new Error('Hiring must return its own exact quote kind')
  return { candidate, offer, consequence }
}

describe('AUD-002: legal post-expiry recovery without a Ready screenplay', () => {
  it('keeps ordinary hiring closed throughout the founding draft', () => {
    const session = BridgeSession.createRuntime()
    const state = session.gameState
    const talentId = state.founding!.applicantIds[0]!
    const conversion = castingDraftToEngine(state, {
      ...emptyDraft('signActor'), signTalentId: talentId,
      signTermWeeks: 104,
    })
    expect(conversion).toEqual({ ok: false, error: 'Complete studio founding before opening the talent market.' })
    expect(session.gameState).toBe(state)
    expect(session.snapshot().availableIntents.every(i => i.kind === 'signFoundingContract')).toBe(true)
  })

  it.each(['screenTest', 'greenlightPackage'] as const)('still requires an exact Ready project for %s', kind => {
    expect(castingDraftToEngine(foundationRecoveryStudio(), emptyDraft(kind))).toEqual({
      ok: false, error: 'Choose the exact Ready screenplay before casting or greenlighting.',
    })
  })

  it('generates the reported state by legal actions with no added money', () => {
    const state = foundationRecoveryStudio()
    expect(state.market.tick).toBe(105)
    expect(state.contracts).toHaveLength(0)
    expect(state.studio.cash).toBeGreaterThan(7_000_000)
    expect(castingProjection(state).board!.projects).toHaveLength(0)
    expect(scriptProjectsReadModel(state).commission.canStart).toBe(false)
    expect(state.theatricalRuns.filter(r => r.status === 'active')).toHaveLength(1)
  })

  it.each(['writer', 'actor'] as const)('quotes and commits a current %s without a fabricated project, exactly once', role => {
    const session = new BridgeSession(foundationRecoveryStudio(), 'foundation-hire-' + role)
    const before = session.gameState
    const { candidate, offer, consequence } = hiringQuote(session, role)
    expect(session.gameState).toBe(before)
    expect(consequence.projectId).toBeNull()
    expect(consequence.cashBefore).toBe(Math.round(before.studio.cash))
    expect(consequence.cashAfter).toBe(Math.round(before.studio.cash - offer.signingBonus))
    const request = command(session, 'commit-recovery-hire', consequence.intentId)
    const receipt = session.command(request)
    expect(receipt.accepted).toBe(true)
    expect(session.gameState.studio.cash).toBe(before.studio.cash - offer.signingBonus)
    expect(session.gameState.contracts.map(c => c.talentId)).toEqual([candidate.talentId])
    const after = session.gameState
    expect(session.command(request)).toEqual(receipt)
    expect(session.gameState).toBe(after)
    expect(scriptProjectsReadModel(after).commission.canStart).toBe(true)
    const commission = session.snapshot().availableIntents.find(i => i.kind === 'commissionScreenplay')
    expect(commission, 'A legally writing-capable contracted person must permit commission').toBeDefined()
    expect(session.command(command(session, 'recovery-commission', commission!.intentId)).accepted).toBe(true)
    expect(session.gameState.scriptDevelopment.projects.at(-1)?.writerId).toBe(candidate.talentId)
  })

  it('offers explicit time for theatrical settlement and construction with no screenplay or staff', () => {
    const session = new BridgeSession(foundationRecoveryStudio(), 'foundation-clock')
    const construction = session.snapshot().availableIntents.find(i => i.kind === 'startConstruction')!
    expect(session.command(command(session, 'recovery-annex', construction.intentId)).accepted).toBe(true)
    const before = session.gameState
    const advance = session.snapshot().availableIntents.find(i => i.kind === 'advanceWeek')
    expect(advance, 'Commission guidance must not suppress the legal manual clock').toBeDefined()
    expect(session.command(command(session, 'recovery-week', advance!.intentId)).accepted).toBe(true)
    expect(session.gameState.market.tick).toBe(before.market.tick + 1)
    expect(session.gameState.ledger.slice(before.ledger.length).some(e => e.kind === 'studioRevenue')).toBe(true)
    const completesWeek = session.gameState.placement.facilities[0]!.completesWeek!
    while (session.gameState.market.tick < completesWeek) {
      const intent = session.snapshot().availableIntents.find(i => i.kind === 'advanceWeek')!
      expect(intent).toBeDefined()
      expect(session.command(command(session, 'recovery-week-' + session.stateRevision, intent.intentId)).accepted).toBe(true)
    }
    expect(session.gameState.placement.facilities[0]!.status).toBe('operational')
  })
})
