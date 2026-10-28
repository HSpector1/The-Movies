// P18 Sprint 13 slice B: the limited-series season on the real Bridge (projection 68).
// RED at d174d667 by assertion: there the closed quote parser has no `quoteTvCommission` type, the closed Industry parser
// has no `television` view and the snapshot offers no `cancelTvSeason` or `settleTvObligations` intent, so each case's
// first assertion on those fails. Every figure and refusal is the core's (tvCommissionPreview, the television root and
// the core actions); the expected numbers are spelled from the adopted contract (tests/helpers/p18-route.ts FIGURES).
//
// The world is the P18 route (seasonRoute, about 440 real ticks), built ONCE at collection like the core's P18 suites;
// the commissioned and first-unit worlds come from the core action and `tick`. The one disclosed device is `withCash`
// (P14B.2's cash set, one ledger row so the money reconciles), which sets the cash a settle or closure case needs.
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { closuresOf } from './helpers/p17-cameo-route.js'
import { BRIDGE_SCHEMA, PROTOCOL_VERSION, SCHEMA_ID, validateIndustry, validateQuote } from '../bridge/protocol.ts'
import { BridgeSession } from '../bridge/session.ts'
import type { IndustryQuery } from '../bridge/schema/industry-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { FIGURES, agreement, attempt, request, season, seasonRoute, television, tickUntil, withCash, type CommissionLocal } from './helpers/p18-route.js'

const route = seasonRoute()
const C = route.state.market.tick
const accepted = attempt(route.state, request(route))
if (accepted.error !== undefined) throw new Error(`premise: the lawful commission is accepted: ${accepted.error}`)
const live = accepted.state
const seasonId = season(live).seasonId
const firstUnit = tickUntil(live, (s) => season(s).work.creditedUnits >= 1, 4, 'the first credited unit')
// FIX-S13B-1 item 5: cancelled at 50,000 cash (190,000 owed, closureId null), then cash set to −1 (the disclosed device)
// and ordinary ticks until the condition law actually closes the studio; the obligation stays recorded (ACCEPTANCE OPEN).
// Built at collection like the route (about 35 ticks).
const closedNow = (s: GameState): boolean => closuresOf(s).some((x) => x.studioId === s.hollywood!.playerStudioId)
const closedWithOwed = (() => {
  let state = withCash(applyActions(withCash(firstUnit, 50_000), [{ kind: 'cancelTvSeason', seasonId }]), -1)
  for (let guard = 0; guard < 60 && !closedNow(state); guard++) state = tick(state)
  return state
})()

function quoteSeason(session: BridgeSession, commandId: string, draft: CommissionLocal) {
  const parsed = validateQuote({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId,
    expectedStateRevision: session.stateRevision, type: 'quoteTvCommission', draft })
  expect(parsed, 'the closed quote parser admits quoteTvCommission').toMatchObject({ ok: true })
  if (!parsed.ok) throw new Error('unreachable after the assertion above')
  const response = session.quote(parsed.quote)
  expect(response).toMatchObject({ accepted: true })
  if (!response.accepted || response.quote.kind !== 'commissionTvSeason') throw new Error('unreachable after the assertion above')
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse, response)).toEqual(response)
  return response.quote
}

function televisionPage(session: BridgeSession) {
  const parsed = validateIndustry({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, requestId: 'p18-television',
    expectedStateRevision: session.stateRevision, type: 'industryQuery', view: 'television', targetId: null, page: 0, pageSize: 50, lane: 'recent', period: 'all' } as IndustryQuery)
  expect(parsed, 'the closed Industry parser admits the television view').toMatchObject({ ok: true })
  if (!parsed.ok) throw new Error('unreachable after the assertion above')
  const result = session.industry(parsed.request)
  expect(result).toHaveProperty('television')
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, result)).toEqual(result)
  const page = (result as { television: unknown }).television as { series: Array<Record<string, unknown>>; seasons: Array<Record<string, unknown> & {
    cancelIntent: { intentId: string; kind: string } | null; settleIntent: { intentId: string; kind: string } | null }> }
  return page
}

const command = (session: BridgeSession, commandId: string, intentId: string) => session.command({ protocolVersion: PROTOCOL_VERSION,
  schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId, expectedStateRevision: session.stateRevision, type: 'submitIntent', payload: { intentId } })
const offered = (session: BridgeSession, kind: string) => session.snapshot().availableIntents.filter((intent) => intent.kind === kind)

describe('P18 Sprint 13 slice B — the season on the Bridge (projection 68)', () => {
  it('quotes the core admission for a lawful commission and commits it through the minted intent, exactly as the core action does', () => {
    const session = new BridgeSession(route.state, 'p18-season-quote')
    const quote = quoteSeason(session, 'p18-season-quote-1', request(route))
    expect(quote).toMatchObject({ ok: true, refusalReason: null, startsNow: true, queues: false, commitWeek: C,
      commissionerLicenceConsideration: 0, distributionLicenceEndWeekExclusive: C + FIGURES.finalWeeks + FIGURES.distributionWeeks })
    expect(quote.terms).toEqual({ fee: FIGURES.fee, advance: FIGURES.advance,
      milestones: { scripts: FIGURES.scripts, pictureLock: FIGURES.pictureLock, delivery: FIGURES.delivery }, unitSpend: FIGURES.unitSpend,
      dueWeek: C + FIGURES.dueWeeks, finalWeek: C + FIGURES.finalWeeks, lateDeductionPerWeek: 12_000, lateDeductionMax: 48_000,
      cancellationCharge: 120_000, distributionWeeks: FIGURES.distributionWeeks })
    const q = quote.quote
    expect(q).toMatchObject({ weeks: FIGURES.quoteWeeks, cash: route.state.studio.cash, floor: FIGURES.floor, provision: FIGURES.provision, ok: true })
    expect(q.required).toBe(q.floor + q.payroll + q.overhead + q.facilityOpex + q.loanInstallments + q.provision)
    expect(command(session, 'p18-season-commit', quote.intentId)).toMatchObject({ accepted: true })
    expect(television(session.gameState)).toEqual(television(live))
    expect(session.gameState.studio.cash).toBe(live.studio.cash)
  })

  it('refuses by the core\'s own sentence at the quote, registers no commit and leaves the state untouched', () => {
    const session = new BridgeSession(route.state, 'p18-season-refusals')
    const untitled = quoteSeason(session, 'p18-untitled', request(route, { seriesTitle: '   ' }))
    expect(untitled).toMatchObject({ ok: false, startsNow: false, refusalReason: 'a new series needs a non-empty title' })
    const doubled = quoteSeason(session, 'p18-doubled', request(route, { roster: { ...route.roster, directorId: route.roster.writerId } }))
    expect(doubled).toMatchObject({ ok: false, refusalReason: 'the six roster people must be distinct' })
    expect(command(session, 'p18-refused-commit', untitled.intentId)).toMatchObject({ accepted: false })
    expect(session.gameState).toBe(route.state)
    const second = quoteSeason(new BridgeSession(live, 'p18-second'), 'p18-second-quote', request(route))
    expect(second).toMatchObject({ ok: false, refusalReason: `one active season per studio: "${seasonId}" is live` })
  })

  it('the television view reads the live season, its next milestone and the settlement a cancellation would take now', () => {
    const page = televisionPage(new BridgeSession(firstUnit, 'p18-view'))
    expect(page.series).toEqual([expect.objectContaining({ title: 'The Long Night', propertyId: route.propertyId, seasonIds: [seasonId] })])
    expect(page.seasons).toHaveLength(1)
    const row = page.seasons[0]!
    expect(row).toMatchObject({ seasonId, status: 'live', block: 'scripts', creditedUnits: 1, totalUnits: 12, commitWeek: C,
      dueWeek: C + FIGURES.dueWeeks, finalWeek: C + FIGURES.finalWeeks, deliveredWeek: null, cancellation: null,
      nextMilestone: { kind: 'scripts', afterUnit: 3, amount: FIGURES.scripts },
      agreement: { earned: 0, received: FIGURES.advance, unearnedAdvance: FIGURES.advance, settlement: null, outstanding: 0 },
      cancelPreview: { refundDue: FIGURES.advance, refundPaidNow: FIGURES.advance, chargeDue: 120_000, chargePaidNow: 120_000, owedAfter: 0 },
      settlePreview: null, settleIntent: null })
    expect(row.cancelIntent).toMatchObject({ kind: 'cancelTvSeason' })
  })

  it('cancels through the cancelTvSeason intent: the refund, then the charge, and the row turns terminal', () => {
    const session = new BridgeSession(firstUnit, 'p18-cancel')
    const cancel = offered(session, 'cancelTvSeason')
    expect(cancel).toHaveLength(1)
    const cashBefore = session.gameState.studio.cash
    expect(command(session, 'p18-cancel-commit', cancel[0]!.intentId)).toMatchObject({ accepted: true })
    expect(agreement(session.gameState).settlement).toEqual({ week: firstUnit.market.tick, refundDue: FIGURES.advance, refundPaid: FIGURES.advance,
      chargeDue: 120_000, chargePaid: 120_000, closureId: null })
    expect(session.gameState.studio.cash).toBe(cashBefore - FIGURES.advance - 120_000)
    expect(offered(session, 'cancelTvSeason')).toEqual([])
    expect(offered(session, 'settleTvObligations')).toEqual([])
    expect(televisionPage(session).seasons[0]).toMatchObject({ status: 'cancelled', cancellation: { week: firstUnit.market.tick, cause: 'producer' },
      nextMilestone: null, cancelPreview: null, settlePreview: null, cancelIntent: null, settleIntent: null, agreement: { outstanding: 0 } })
  })

  it('settles a part-paid cancellation through settleTvObligations, the refund before the charge, only from cash held', () => {
    // Cancelled at 50,000 cash: U0 = 120,000 is part-paid, K = 120,000 unpaid, 190,000 owed and no cash left.
    const owed = applyActions(withCash(firstUnit, 50_000), [{ kind: 'cancelTvSeason', seasonId }])
    expect(agreement(owed).settlement).toMatchObject({ refundPaid: 50_000, chargePaid: 0 })
    const broke = new BridgeSession(owed, 'p18-settle-broke')
    expect(offered(broke, 'settleTvObligations'), 'no cash, no settle verb').toEqual([])
    expect(televisionPage(broke).seasons[0]).toMatchObject({ settlePreview: { outstanding: 190_000, payableNow: 0 }, settleIntent: null })
    const session = new BridgeSession(withCash(owed, 100_000), 'p18-settle')
    const settle = offered(session, 'settleTvObligations')
    expect(settle).toHaveLength(1)
    expect(televisionPage(session).seasons[0]!.settleIntent).toMatchObject({ intentId: settle[0]!.intentId, kind: 'settleTvObligations' })
    expect(command(session, 'p18-settle-1', settle[0]!.intentId)).toMatchObject({ accepted: true })
    expect(agreement(session.gameState).settlement).toMatchObject({ refundPaid: FIGURES.advance, chargePaid: 30_000 })
    expect(session.gameState.studio.cash).toBe(0)
    const rest = new BridgeSession(withCash(session.gameState, 1_000_000), 'p18-settle-rest')
    const last = offered(rest, 'settleTvObligations')
    expect(last).toHaveLength(1)
    expect(command(rest, 'p18-settle-2', last[0]!.intentId)).toMatchObject({ accepted: true })
    expect(agreement(rest.gameState).settlement).toMatchObject({ refundPaid: FIGURES.advance, chargePaid: 120_000 })
    expect(rest.gameState.studio.cash).toBe(1_000_000 - 90_000)
    expect(offered(rest, 'settleTvObligations')).toEqual([])
  })

  it('a closed player with obligations owed from before its closure gets no settle verb on the snapshot or the television page (FIX-S13B-1 item 5)', () => {
    const state = closedWithOwed
    expect(closedNow(state), 'premise: the condition law closes the drained studio').toBe(true)
    expect(agreement(state).settlement).toMatchObject({ refundPaid: 50_000, chargePaid: 0, closureId: null })
    // FIX-S13B-2 item 2: with 100,000 of cash the payable amount alone would offer a settle verb, so only the closed-player
    // rule withholds it (at −1 the zero payable amount withheld it already and the case proved nothing).
    const session = new BridgeSession(withCash(state, 100_000), 'p18-closed')
    expect(offered(session, 'settleTvObligations')).toEqual([])
    expect(televisionPage(session).seasons[0]).toMatchObject({ status: 'cancelled', agreement: { outstanding: 190_000 }, settlePreview: null, settleIntent: null })
  })
})
