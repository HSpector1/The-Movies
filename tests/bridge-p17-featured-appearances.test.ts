// Sprint 11 Bridge slice B: featured appearances and continuation outcomes on the real Bridge (projection 66).
// RED at 2b1a5b4b by assertion: there the closed Industry parser has no `featuredAppearances` view, the closed quote parser
// has no `cameos` member on the casting draft, the intent vocabulary has no `cancelFeaturedBooking` and the franchise
// installment carries no `outcome`/`guests`; each case's first assertion on those fails. Every fee, basis, refusal and
// record is the core's (cameoQuote, the `cameos` root, the franchise root, the public film result).
//
// The world is the cameo route (tests/helpers/p17-cameo-route.ts): the headless world ticked to 1871, a studio founded
// there and one tick to the 1956 unlock (1872), built ONCE at collection like the core's cameo suites (no hook carries
// it; no timeout set). Two branches leave it: the Bridge branch takes the adapter's managed activation (Studio Operations,
// then screenplay development, then casting: the order `foundManagedStudioAction` applies and the core requires) so the
// real greenlight package can carry a guest; the outcome branch releases a parent and then a continuation with a guest by
// the core's legacy greenlight, and the Bridge reads the records. A refused premise throws `premise: …` by name.
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { cameoRetained, P17_CAMEO_FEE_NOTE } from '../src/core/cameo.js'
import { nominalShootingWeeks } from '../src/core/cameoBooking.js'
import { retirementRecordFor } from '../src/core/careerLifecycle.js'
import { busyTalentIds } from '../src/core/employment.js'
import { studioEmployerId } from '../src/core/hollywood.js'
import { tick } from '../src/core/tick.js'
import type { Action, GameState } from '../src/core/types.js'
import { castingProjection } from '../bridge/casting.ts'
import { BRIDGE_SCHEMA, PROTOCOL_VERSION, SCHEMA_ID, validateIndustry, validateQuote } from '../bridge/protocol.ts'
import { BridgeSession } from '../bridge/session.ts'
import type { BridgeCameoBookingRequest, BridgeCastingDraftPayload } from '../bridge/schema/bridge-schema.ts'
import type { IndustryQuery } from '../bridge/schema/industry-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { commissionFor } from './_m4Fixtures.js'
import { ask, cameoRoute, expectedFee, freeGuest, greenlight, releaseNewest, rootOf, type CameoRoute } from './helpers/p17-cameo-route.js'
import { freshConcept } from './helpers/p17-route.js'

const PAGE = 50

/** The cameo world with managed Studio Operations, screenplay development and casting active and one Ready screenplay
 * (the real package door). Fix 2: activateScriptDevelopment refuses unless managed Studio Operations is active, so the
 * three activations run in the adapter's order on the founded, engaged 1872 world (empty production slate). */
function bridgeReady(route: CameoRoute): { state: GameState; projectId: string } {
  let state: GameState
  try {
    state = applyActions(route.world, [{ kind: 'activateStudioOperations' }, { kind: 'activateScriptDevelopment' }, { kind: 'activateCastingSessions' }])
  } catch (e) {
    throw new Error(`premise: the founded 1872 cameo world takes the managed activation (operations, screenplays, casting): ${(e as Error).message}`)
  }
  // The commission takes the first concept no picture used and no title founded (freshConcept), never a bare index 0.
  state = applyActions(state, [{ kind: 'commissionScript', project: commissionFor(state, state.concepts.indexOf(freshConcept(state)), 0) }])
  const projectId = state.scriptDevelopment.projects[0]!.id
  for (let guard = 0; guard < 12 && state.scriptDevelopment.projects[0]!.status !== 'review'; guard++) state = tick(state)
  if (state.scriptDevelopment.projects[0]!.status !== 'review') throw new Error('premise: the commissioned screenplay never reached review')
  state = applyActions(state, [{ kind: 'acceptScript', projectId }])
  return { state, projectId }
}

/** A parent released, then its direct sequel greenlit with one guest in a standard shooting week and released. */
function releasedContinuation(route: CameoRoute) {
  let state = applyActions(route.world, [greenlight(route.world, freshConcept(route.world), route.a, route.writer)])
  const parentId = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id
  state = releaseNewest(state)
  const staff = new Set([route.writer, route.a.director, route.a.craft, ...route.a.cast, route.b.director, route.b.craft, ...route.b.cast])
  const guest = freeGuest(state, 'actor', staff)
  const workWeek = nominalShootingWeeks(state.market.tick)[0]!
  state = applyActions(state, [{ ...greenlight(state, freshConcept(state), route.b, route.writer, [ask(guest, workWeek)]),
    continuation: { type: 'directSequel', predecessorProductionId: parentId } } as Action])
  const childId = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id
  state = releaseNewest(state)
  return { state, parentId, childId, guest, workWeek }
}

function greenlightDraftFor(state: GameState, projectId: string, exclude: ReadonlySet<string>): BridgeCastingDraftPayload {
  const view = castingProjection(state).board!.projects.find((p) => p.projectId === projectId)!
  const free = <T extends { talentId: string; available: boolean }>(pool: readonly T[]) => pool.filter((c) => c.available && !exclude.has(c.talentId))
  const actors = free(view.leadCandidates)
  if (actors.length < 3 || free(view.directorCandidates).length === 0 || free(view.craftCandidates).length === 0) {
    throw new Error(`premise: project ${projectId} lacks an available package outside the guest`)
  }
  return {
    kind: 'greenlightPackage', projectId, slateLead: null, slateAntagonist: null, slateSupport: null,
    directorId: free(view.directorCandidates)[0]!.talentId, castLead: actors[0]!.talentId, castAntagonist: actors[1]!.talentId,
    castSupport: actors[2]!.talentId, craftLeadId: free(view.craftCandidates)[0]!.talentId,
    budgetNegative: view.negativeOptions[0]!.amount, budgetMarketing: view.marketingOptions[0]!.amount, signTalentId: null, signTermWeeks: null,
  }
}

function industry(session: BridgeSession, view: 'featuredAppearances' | 'franchises', page = 0) {
  const parsed = validateIndustry({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, requestId: `p17-${view}`,
    expectedStateRevision: session.stateRevision, type: 'industryQuery', view, targetId: null, page, pageSize: PAGE, lane: 'recent', period: 'all' } as IndustryQuery)
  expect(parsed, `the closed Industry parser admits the ${view} view`).toMatchObject({ ok: true })
  if (!parsed.ok) throw new Error('unreachable after the assertion above')
  const result = session.industry(parsed.request)
  expect(result).toHaveProperty(view)
  if (!(view in result)) throw new Error('unreachable after the assertion above')
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, result)).toEqual(result)
  return result as Extract<typeof result, { type: 'industryPage' }>
}
function quote(session: BridgeSession, commandId: string, draft: unknown) {
  const parsed = validateQuote({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId,
    expectedStateRevision: session.stateRevision, type: 'quoteCasting', draft })
  expect(parsed, 'the closed quote parser admits the cameos member').toMatchObject({ ok: true })
  if (!parsed.ok || parsed.quote.type !== 'quoteCasting') throw new Error('unreachable after the assertion above')
  return session.quote(parsed.quote)
}
const command = (session: BridgeSession, commandId: string, intentId: string) => session.command({ protocolVersion: PROTOCOL_VERSION,
  schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId, expectedStateRevision: session.stateRevision, type: 'submitIntent', payload: { intentId } })

describe('P17 featured appearances and continuation outcomes on the Bridge (projection 66)', () => {
  const route = cameoRoute('bridge-p17-featured-appearances')
  const ready = bridgeReady(route)
  const guest = freeGuest(ready.state, 'actor', new Set())
  const workWeek = nominalShootingWeeks(ready.state.market.tick)[0]!
  const request: BridgeCameoBookingRequest = { talentId: guest.id, workWeek, fee: expectedFee(guest), basis: 'freelance' }
  const draft = { ...greenlightDraftFor(ready.state, ready.projectId, new Set([guest.id])), cameos: [request] }
  // Fix 1 (review S2): the outcome branch's two releases run here at collection, like the core's cameo suites, never
  // inside a case under the default per-case budget.
  const released = releasedContinuation(route)

  /** Quote and commit the package with the guest; returns the session after the booking. */
  function booked(sessionId: string) {
    const session = new BridgeSession(ready.state, sessionId)
    const quoted = quote(session, `${sessionId}-quote`, draft)
    expect(quoted).toMatchObject({ accepted: true })
    if (!quoted.accepted) throw new Error('unreachable after the assertion above')
    expect(command(session, `${sessionId}-commit`, quoted.quote.intentId)).toMatchObject({ accepted: true })
    const booking = rootOf(session.gameState)?.bookings.find((b) => b.talentId === guest.id)
    expect(booking).toMatchObject({ status: 'reserved', workWeek, fee: request.fee, basis: 'freelance' })
    return { session, quoted, booking: booking! }
  }

  it('lists every person with the core quote for each lawful work week: the real fee, basis, cap and refusals by name', () => {
    const week = ready.state.market.tick
    const index = ready.state.talent.findIndex((t) => t.id === guest.id)
    const result = industry(new BridgeSession(ready.state, 'p17-guests'), 'featuredAppearances', Math.floor(index / PAGE))
    const page = result.featuredAppearances!
    expect(page).toMatchObject({ greenlightWeek: week, capacity: 2, nominalShootingWeeks: nominalShootingWeeks(week), bookings: [] })
    expect(result.totalRows).toBe(ready.state.talent.length)
    const row = page.guests.find((g) => g.talentId === guest.id)!
    expect(row).toMatchObject({ name: guest.name, profession: 'actor', fame: guest.fame, fee: expectedFee(guest),
      retained: cameoRetained(expectedFee(guest)), refundable: expectedFee(guest) - cameoRetained(expectedFee(guest)) })
    expect(row.weeks.map((w) => w.workWeek)).toEqual(Array.from({ length: 8 }, (_, i) => week + 1 + i))
    expect(row.weeks.find((w) => w.workWeek === workWeek)).toMatchObject({ ok: true, basis: 'freelance', standardShooting: true, refusal: null })
    // Another studio's employee is refused by the core's own sentence, on every page it lands on. Fix 1 (review S1):
    // cameoQuote reads the lifecycle authority, reservations and actual work BEFORE the employer, so the rival is picked
    // the way freeGuest picks (no actual work, no retirement record) and the employer refusal is the one that fires. The
    // employer at the greenlight week alone refuses every work week (cameoQuote checks it before the work-week employer).
    const player = ready.state.hollywood!.playerStudioId
    const busy = busyTalentIds(ready.state)
    const rival = ready.state.talent.find((t) => {
      const employer = studioEmployerId(ready.state, t.id)
      return employer !== null && employer !== player && !busy.has(t.id)
        && retirementRecordFor(ready.state, t.id) === undefined && retirementRecordFor(ready.state, t.id, 'actor') === undefined
    })
    if (rival === undefined) throw new Error('premise: no free, unretired rival employee exists at the unlock week')
    const rivalIndex = ready.state.talent.findIndex((t) => t.id === rival.id)
    const rivalRow = industry(new BridgeSession(ready.state, 'p17-guests-rival'), 'featuredAppearances', Math.floor(rivalIndex / PAGE))
      .featuredAppearances!.guests.find((g) => g.talentId === rival.id)!
    expect(rivalRow.fee).toBeNull()
    expect(rivalRow.weeks.every((w) => !w.ok && w.refusal !== null && w.refusal.includes('another studio\'s employee takes no appearance'))).toBe(true)
  })

  it('quotes the guest\'s booking terms on the greenlight package and commits the booking through the greenlight action', () => {
    const { session, quoted, booking } = booked('p17-guest-book')
    if (!quoted.accepted || quoted.quote.kind !== 'greenlightPicture') throw new Error('expected a greenlight quote')
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse, quoted)).toEqual(quoted)
    expect(quoted.quote.continuation).toBeNull()
    expect(quoted.quote.featuredGuests).toEqual([expect.objectContaining({ talentId: guest.id, name: guest.name, profession: 'actor',
      basis: 'freelance', workWeek, standardShootingWeek: true, fee: request.fee, retained: cameoRetained(request.fee), refundable: request.fee - cameoRetained(request.fee) })])
    const production = session.gameState.studio.activeProductions[session.gameState.studio.activeProductions.length - 1]!
    expect(booking.productionId).toBe(production.id)
    expect(session.gameState.ledger.filter((row) => row.note?.startsWith(P17_CAMEO_FEE_NOTE))).toHaveLength(1)
    const bookings = industry(session, 'featuredAppearances').featuredAppearances!.bookings
    expect(bookings).toEqual([expect.objectContaining({ bookingId: booking.bookingId, productionId: production.id, talentId: guest.id,
      basis: 'freelance', workWeek, fee: request.fee, retained: booking.retained, status: 'reserved', refund: null })])
    expect(bookings[0]!.cancelIntent).toMatchObject({ kind: 'cancelFeaturedBooking', productionId: production.id })
  })

  it('refuses a stale basis and a stale fee by the core\'s own name at the quote and leaves the state untouched', () => {
    const session = new BridgeSession(ready.state, 'p17-guest-stale-basis')
    const stale = quote(session, 'stale-basis', { ...draft, cameos: [{ ...request, basis: 'employee' }] })
    expect(stale).toMatchObject({ accepted: false, reasonCode: 'ENGINE_REJECTED' })
    if (stale.accepted) throw new Error('unreachable after the assertion above')
    expect(stale.message).toContain(`stale cameo quote for ${guest.id}: the basis is now freelance, not the accepted employee; re-quote before booking`)
    const staleFee = quote(session, 'stale-fee', { ...draft, cameos: [{ ...request, fee: request.fee + 1 }] })
    expect(staleFee).toMatchObject({ accepted: false, reasonCode: 'ENGINE_REJECTED' })
    if (staleFee.accepted) throw new Error('unreachable after the assertion above')
    expect(staleFee.message).toContain(`stale cameo quote for ${guest.id}`)
    expect(session.gameState).toBe(ready.state)
  })

  it('cancels an unperformed booking through the cancelFeaturedBooking intent: one refund of fee less the retained charge', () => {
    const { session, booking } = booked('p17-guest-cancel')
    const offered = session.snapshot().availableIntents.filter((intent) => intent.kind === 'cancelFeaturedBooking')
    expect(offered).toHaveLength(1)
    const cashBefore = session.gameState.studio.cash
    expect(command(session, 'cancel-guest', offered[0]!.intentId)).toMatchObject({ accepted: true })
    const cancelled = rootOf(session.gameState)!.bookings.find((b) => b.bookingId === booking.bookingId)!
    expect(cancelled).toMatchObject({ status: 'cancelled', cancelReason: 'explicit', refund: booking.fee - booking.retained })
    expect(session.gameState.studio.cash).toBe(cashBefore + booking.fee - booking.retained)
    expect(session.snapshot().availableIntents.some((intent) => intent.kind === 'cancelFeaturedBooking')).toBe(false)
    expect(industry(session, 'featuredAppearances').featuredAppearances!.bookings).toEqual([expect.objectContaining({
      bookingId: booking.bookingId, status: 'cancelled', cancelReason: 'explicit', refund: booking.fee - booking.retained, cancelIntent: null })])
  })

  it('reads a released continuation\'s lineage edge, recorded release outcome and credited guest from the core records', () => {
    const outcome = released
    const booking = rootOf(outcome.state)!.bookings.find((b) => b.productionId === outcome.childId)!
    expect(booking).toMatchObject({ talentId: outcome.guest.id, status: 'completed' })
    expect(booking.careerEvent).not.toBeNull()
    const session = new BridgeSession(outcome.state, 'p17-outcomes')
    const property = industry(session, 'franchises').franchises!.properties.find((p) => p.installments.some((i) => i.productionId === outcome.childId))!
    expect(property.installments.map((i) => [i.productionId, i.type, i.parentProductionId])).toEqual([[outcome.parentId, 'origin', null], [outcome.childId, 'directSequel', outcome.parentId]])
    const film = outcome.state.studio.releasedFilms.find((f) => f.productionId === outcome.childId)!
    const root = (outcome.state as GameState & { franchises: { properties: { storyPropertyId: string; meter: { peakInstallmentId: string | null } }[] } }).franchises
      .properties.find((p) => p.storyPropertyId === property.storyPropertyId)!
    const child = property.installments[1]!
    // Fix 1 (review B1): the gross is the Industry film row's measure. The child released this week, so its theatrical
    // run is active and has paid less than the whole-run total fixed at release (the premise that tells the two apart).
    const run = outcome.state.theatricalRuns.find((r) => r.productionId === outcome.childId)!
    expect(run.status).toBe('active')
    expect(run.cumulativeGrossPaid).toBeLessThan(film.boxOffice.total)
    // Fix 3 (re-review S-A1): the player's film carries its locked forecast, so the published figure is that forecast,
    // never the null a rival's film gets (a null forecast here would hide the difference between the two branches).
    expect(film.forecast?.expectedTotal, 'premise: the player\'s released film carries its locked forecast').toEqual(expect.any(Number))
    expect(child.outcome).toEqual({ releasedWeek: film.releaseTick, criticScore: film.criticScore, openingGross: film.boxOffice.opening,
      totalGross: run.cumulativeGrossPaid, expectedTotal: film.forecast?.expectedTotal, propertyPeak: root.meter.peakInstallmentId === outcome.childId, activeAgain: false })
    // Both installments show the figures the Industry film row shows for the same film, active run or settled.
    for (const installment of property.installments) {
      const parsed = validateIndustry({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, requestId: `p17-film-${installment.productionId}`,
        expectedStateRevision: session.stateRevision, type: 'industryQuery', view: 'film', targetId: installment.productionId, page: 0, pageSize: PAGE, lane: 'recent', period: 'all' } as IndustryQuery)
      expect(parsed).toMatchObject({ ok: true })
      if (!parsed.ok) throw new Error('unreachable after the assertion above')
      const result = session.industry(parsed.request)
      expect(result).toMatchObject({ type: 'industryPage' })
      const row = (result as Extract<typeof result, { type: 'industryPage' }>).films[0]!
      expect(installment.outcome).toMatchObject({ openingGross: row.openingGross, totalGross: row.totalGross, criticScore: row.criticScore })
    }
    const event = booking.careerEvent as { starPowerBefore: number; starPowerAfter: number; starPowerDelta: number }
    expect(child.guests).toEqual([{ bookingId: booking.bookingId, talentId: outcome.guest.id, name: outcome.guest.name, workWeek: outcome.workWeek,
      fee: booking.fee, starPowerBefore: event.starPowerBefore, starPowerAfter: event.starPowerAfter, starPowerDelta: event.starPowerDelta }])
    expect(property.installments[0]!.outcome).not.toBeNull()
    expect(property.installments[0]!.guests).toEqual([])
    const credited = industry(session, 'featuredAppearances').featuredAppearances!.bookings.find((b) => b.bookingId === booking.bookingId)!
    expect(credited).toMatchObject({ status: 'completed', releasedWeek: film.releaseTick, starPowerDelta: event.starPowerDelta, cancelIntent: null })
  })
})
