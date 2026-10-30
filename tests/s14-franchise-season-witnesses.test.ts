// ── Sprint 14 slice 1: a franchise with a featured guest, then a live season, in one world ─────────────────────
//
// Authority: P17-CAMEO-CONTRACT.md §6 item 8 (:106, persistence and deterministic replay); P18-FIRST-SEASON-CONTRACT.md
// §8 (:119-121: TV never consumes or updates film Recognition, Momentum or Fatigue, issues no film promise, Awards or
// Standing effect, and TV credits never impersonate film participant rows) and :139 (natural route, ≤ 72 advances from
// commitment; a missing admissible setup is a finding). Owner assignment rules 1-3 (:180-186): reuse the existing
// routes, measure, never force.
//
// The world is the existing P17 route with a featured guest, unchanged: tests/helpers/p17-cameo-route.ts (the headless
// world ticked to 1871, a studio founded there by the historical-control draft, one tick to the 1956 unlock) and the
// released continuation of bridge-p17-featured-appearances.test.ts:54-67 (a parent released, then its direct sequel
// greenlit with one guest in a standard shooting week and released), on that suite's seed, whose premises it already
// meets. Both cases below are MEASUREMENTS or CONTROLS of behaviour the base 0774e16e implements, not REDs.
//
//   W1 (MEASUREMENT, replay)  the route built twice from the seed with the same action list exports the same save bytes
//                             at commitment (the sequel greenlight carrying the booking), after the advances through the
//                             booked work week, and at the continuation's release. CONTROL (FIX-S14-W1 item 1): a clone
//                             of the same route that books the guest in the second nominal shooting week instead keeps
//                             the greenlight bytes and changes the bytes at the same week after the first booked week.
//                             A second seed proves nothing: the seed is in the save envelope (save.ts:6830) and in
//                             state (worldgen.ts:729).
//   W2 (MEASUREMENT, §8)      the same released world then takes the managed operations step, buys and adopts the
//                             synchronized-sound chain on its founding stage and Post, and commissions a season on the
//                             franchise's own story property (the "season on a continuation-linked property" witness;
//                             the case asserts that P16 admits it). Over every advance of the season, film R/M/F (the
//                             franchise root), released film results, Standing, promises, the guest's booking, career
//                             events, first takes and the film-side studioHistory rows (standingChanged,
//                             standingDriftFolded, filmReleased, theatricalRunCompleted, careerMilestone; event ids aside)
//                             are byte-identical to the same world without the season, which ticks the same weeks. No
//                             Awards source exists in the core (campaignLegacy.ts:92, 303); the Awards check is a static
//                             shape premise, not a measurement.
//
// No shortcut (FIX-S14-W2): the W2 setup is fully natural. No cash, staff, grant or capacity is spliced; the studio pays
// for the sound purchase, the adoption and the season from the cash its two releases left. W2's first case prints the
// cash record (the cash at the operations step, the purchase price, the adoption commitment and the admission quote at
// C) as the measurement. s14-r3 measured, with a fixture row still in place, that the natural world passes the quote
// (10,562,272 available against 2,990,340 required); this file now runs that natural world.
// Budgets (FIX-S14-W1): first measurements, s14-r1 at 0cf00e40 ran this file in 31.9 s with three route builds; it now
// builds twice and replays one clone. Declared 300 s top-level and 240 s per describe hook; never to be widened.

import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { nominalShootingWeeks } from '../src/core/cameoBooking.js'
import { assignmentRefusal } from '../src/core/careerLifecycle.js'
import { activeContract, assignmentBlockedTalentIds } from '../src/core/employment.js'
import { storyPropertyId } from '../src/core/rights.js'
import { exportCurrentState, makeSave } from '../src/core/save.js'
import { adoptionChainOperational } from '../src/core/technologyAdoption.js'
import { tick } from '../src/core/tick.js'
import { tvAdmissionQuote } from '../src/core/tvCommission.js'
import { TUNING } from '../src/core/tuning.js'
import type { Action, CreativeRole, GameState } from '../src/core/types.js'
import { adoptExistingSoundChain } from '../src/harness/p13a/fixtures.js'
import { ask, cameoRoute, freeGuest, greenlight, releaseNewest, rootOf, type CameoRoute } from './helpers/p17-cameo-route.js'
import { freshConcept } from './helpers/p17-route.js'
import { attempt, player, request, season, sig, television, type TvRosterLocal } from './helpers/p18-route.js'

/** bridge-p17-featured-appearances.test.ts:105's seed: its route already reaches a released continuation with a guest. */
const SEED = 'bridge-p17-featured-appearances'

type ContinuationRun = {
  route: CameoRoute
  /** The parent's greenlight (the CONTROL comparison point). */
  greenlit: GameState
  /** Commitment: the direct sequel's greenlight carrying the guest's booking. */
  commitment: GameState
  /** After the advances through the booked work week. */
  worked: GameState
  /** The continuation released; its release tick runs the careers step. */
  released: GameState
  parentId: string
  childId: string
  guestId: string
  workWeek: number
}

/** bridge-p17-featured-appearances.test.ts:54-67 `releasedContinuation`, with its intermediate states kept. The CONTROL
 * passes `shootingIndex` 1 (the guest's week is the second nominal shooting week) and `workedTick` (stop the advances at
 * that week instead of just after the booked one); the measured run keeps the defaults. */
function continuationRun(route: CameoRoute, shootingIndex = 0, workedTick?: number): ContinuationRun {
  const greenlit = applyActions(route.world, [greenlight(route.world, freshConcept(route.world), route.a, route.writer)])
  const parentId = greenlit.studio.activeProductions[greenlit.studio.activeProductions.length - 1]!.id
  let state = releaseNewest(greenlit)
  const staff = new Set([route.writer, route.a.director, route.a.craft, ...route.a.cast, route.b.director, route.b.craft, ...route.b.cast])
  const guest = freeGuest(state, 'actor', staff)
  const shooting = nominalShootingWeeks(state.market.tick)
  if (shooting.length <= shootingIndex) throw new Error(`premise: no nominal shooting week ${shootingIndex + 1} after week ${state.market.tick}`)
  const workWeek = shooting[shootingIndex]!
  const commitment = applyActions(state, [{ ...greenlight(state, freshConcept(state), route.b, route.writer, [ask(guest, workWeek)]),
    continuation: { type: 'directSequel', predecessorProductionId: parentId } } as Action])
  const childId = commitment.studio.activeProductions[commitment.studio.activeProductions.length - 1]!.id
  state = commitment
  const stop = workedTick ?? workWeek + 1
  while (state.market.tick < stop) state = tick(state)
  const worked = state
  return { route, greenlit, commitment, worked, released: releaseNewest(worked), parentId, childId, guestId: guest.id, workWeek }
}

let A: ContinuationRun
beforeAll(() => {
  A = continuationRun(cameoRoute(SEED))
}, 300_000)

describe('S14 W1 — same seed, same actions: byte identity on the P17 continuation route with a featured guest (MEASUREMENT; P17 §6 :106)', () => {
  type Bytes = { commitment: string; worked: string; released: string }
  const bytesOf = (run: ContinuationRun): Bytes => ({ commitment: exportCurrentState(run.commitment), worked: exportCurrentState(run.worked), released: exportCurrentState(run.released) })
  let a: Bytes
  let b: Bytes
  let aGreenlit: string
  let control: ContinuationRun
  beforeAll(() => {
    a = bytesOf(A)
    aGreenlit = exportCurrentState(A.greenlit)
    b = bytesOf(continuationRun(cameoRoute(SEED)))
    control = continuationRun(structuredClone(A.route), 1, A.worked.market.tick)
  }, 240_000)

  it('the route is the one the contract names: a released direct sequel whose guest worked the booked week and was credited', () => {
    const booking = rootOf(A.worked)?.bookings.find((x) => x.talentId === A.guestId)
    expect(booking).toMatchObject({ productionId: A.childId, status: 'completed', completedWeek: A.workWeek })
    expect(rootOf(A.released)?.bookings.find((x) => x.talentId === A.guestId)?.careerEvent).toMatchObject({ talentId: A.guestId })
    const edge = A.released.franchises?.properties.flatMap((p) => p.installments).find((e) => e.childProductionId === A.childId)
    expect(edge).toMatchObject({ type: 'directSequel', parentProductionId: A.parentId })
  })

  it('exports the same bytes at commitment, after the booked work week and at the continuation\'s release', () => {
    expect(b.commitment === a.commitment, 'commitment bytes').toBe(true)
    expect(b.worked === a.worked, 'bytes after the booked work week').toBe(true)
    expect(b.released === a.released, 'release bytes').toBe(true)
  })

  it('CONTROL: the guest booked one nominal shooting week later keeps the greenlight bytes and changes the bytes at the same week', () => {
    expect(exportCurrentState(control.greenlit) === aGreenlit, 'greenlight bytes').toBe(true)
    expect(control.workWeek, 'premise: the control books a later week').toBeGreaterThan(A.workWeek)
    expect(control.worked.market.tick).toBe(A.worked.market.tick)
    expect(rootOf(control.worked)?.bookings.find((x) => x.talentId === control.guestId)?.status, 'the control booking is still reserved').toBe('reserved')
    expect(exportCurrentState(control.worked) === a.worked, `bytes at week ${A.worked.market.tick}`).toBe(false)
  })
})

describe('S14 W2 — a franchise with a guest and a live season: no film pollution (MEASUREMENT; P18 §8 :119-121)', () => {
  /** Everything §8 forbids the season to touch, as stored: film R/M/F, film results, Standing, promises, the guest's
   * booking, film career events and first takes. */
  const filmSide = (s: GameState): string => sig({
    franchises: s.franchises ?? null, releasedFilms: s.studio.releasedFilms, standing: s.studio.standing, promises: s.promises,
    cameos: s.cameos ?? null, careerEvents: s.careerEvents, firstTakes: s.firstTakes,
    // FIX-S14-W1 item 4: the film-side history rows, without their event ids (a season row may take an id first).
    history: s.studioHistory.rows.filter((r) => FILM_HISTORY.has(r.kind)).map(({ eventId: _eventId, ...row }) => row),
  })
  const FILM_HISTORY: ReadonlySet<string> = new Set(['standingChanged', 'standingDriftFolded', 'filmReleased', 'theatricalRunCompleted', 'careerMilestone'])
  type CashRecord = { baseCash: number; row: number; purchasePrice: number; adoptionCommitment: number; quoteCash: number; quoteRequired: number; cashWithoutRow: number; naturalPassesQuote: boolean }
  let cashRecord: CashRecord
  let base: GameState
  let propertyId: string
  let refusal: string | undefined
  let rows: { week: number; withSeason: string; without: string }[]
  let withEnd: GameState
  let withoutEnd: GameState

  /** The season's six people from the route's own contracted founders: for each role, the first who is idle, contracted
   * over [C, C + 20) and lifecycle-clear (the admission's own tests, tvCommission.ts admitTvCommission). */
  function seasonRoster(s: GameState, route: CameoRoute): TvRosterLocal {
    const C = s.market.tick
    const until = C + TUNING.TV_FINAL_WEEKS
    const blocked = assignmentBlockedTalentIds(s, C, until)
    const clear = (id: string, role: CreativeRole): boolean => !blocked.has(id) && (activeContract(s, id, C)?.endWeekExclusive ?? 0) >= until
      && assignmentRefusal(s, id, C, role, until) === null
    const pick = (ids: readonly string[], role: CreativeRole, n = 1): string[] => {
      const found = ids.filter((id) => clear(id, role)).slice(0, n)
      if (found.length < n) throw new Error(`premise: the founding roster has ${found.length} of ${n} clear ${role}(s) for a season at week ${C}`)
      return found
    }
    const [lead, antagonist, support] = pick([...route.a.cast, ...route.b.cast], 'actor', 3)
    return { writerId: pick([route.writer], 'writer')[0]!, directorId: pick([route.a.director, route.b.director], 'director')[0]!,
      cast: { lead: lead!, antagonist: antagonist!, support: support! }, craftId: pick([route.a.craft, route.b.craft], 'craft')[0]! }
  }

  beforeAll(() => {
    const activated = applyActions(A.released, [{ kind: 'activateStudioOperations' }])
    const bought = applyActions(activated, [{ kind: 'purchaseTechnology', technologyId: 'synchronized-sound' }])
    let s = adoptExistingSoundChain(bought)
    const purchasePrice = activated.studio.cash - bought.studio.cash
    const adoptionCommitment = bought.studio.cash - s.studio.cash
    const adoption = s.technology.adoptions.find((x) => x.studioId === player(s) && x.technologyId === 'synchronized-sound')
    if (adoption === undefined || adoption.postFacilityId === null) throw new Error('premise: no player sound adoption with a Post facility')
    for (let guard = 0; !adoptionChainOperational(s, s.technology.adoptions.find((x) => x.id === adoption.id)!); guard++) {
      if (guard > 40) throw new Error('premise: the sound chain did not become operational within 40 weeks')
      s = tick(s)
    }
    base = s
    const quote = tvAdmissionQuote(base, base.market.tick)
    // FIX-S14-W2: no fixture row, so `row` is 0 and `cashWithoutRow` is the quote's own cash (fields kept for comparison
    // with the s14-r3 record).
    const row = 0
    cashRecord = { baseCash: activated.studio.cash, row, purchasePrice, adoptionCommitment, quoteCash: quote.cash, quoteRequired: quote.required,
      cashWithoutRow: quote.cash - row, naturalPassesQuote: quote.cash - row >= quote.required }
    const parent = base.studio.releasedFilms.find((f) => f.productionId === A.parentId)
    if (parent === undefined) throw new Error('premise: the parent film is not among the released films')
    propertyId = storyPropertyId(parent.conceptId)
    const commission = request({ roster: seasonRoster(base, A.route), adoptionId: adoption.id, propertyId })
    const committed = attempt(base, commission)
    refusal = committed.error
    rows = []
    if (committed.state === undefined) return
    let withSeason = committed.state
    let without = base
    rows.push({ week: withSeason.market.tick, withSeason: filmSide(withSeason), without: filmSide(without) })
    while (season(withSeason).status === 'live') {
      if (withSeason.market.tick >= season(withSeason).finalWeek) throw new Error(`p18 W2: the season is still live at its final week ${season(withSeason).finalWeek}`)
      withSeason = tick(withSeason)
      without = tick(without)
      rows.push({ week: withSeason.market.tick, withSeason: filmSide(withSeason), without: filmSide(without) })
    }
    withEnd = withSeason
    withoutEnd = without
  }, 240_000)

  it('P16 admits the season on the franchise\'s own story property (continuation-linked) in the natural world, within 72 advances', () => {
    // The measurement, printed on every run: the natural cash at each step of the setup and the admission quote at C.
    console.info(`S14 W2 cash record ${JSON.stringify(cashRecord)}`)
    expect(Object.values(cashRecord).every((v) => typeof v === 'boolean' || Number.isFinite(v)), JSON.stringify(cashRecord)).toBe(true)
    expect(refusal, 'the commission on the continuation-linked property').toBeUndefined()
    const property = base.franchises?.properties.find((p) => p.storyPropertyId === propertyId)
    const edges = property?.installments.map((e) => [e.childProductionId, e.type]) ?? []
    expect(edges).toContainEqual([A.parentId, 'origin'])
    expect(edges).toContainEqual([A.childId, 'directSequel'])
    expect(season(withEnd).propertyId).toBe(propertyId)
    expect(rows.length - 1, 'advances from commitment').toBeLessThanOrEqual(72)
  })

  it('the season really ran: it credited work and moved its own cash, so the comparison is not vacuous', () => {
    expect(refusal, 'premise: the commission').toBeUndefined()
    expect(rows.length).toBeGreaterThan(1)
    expect(season(withEnd).work.creditedUnits).toBeGreaterThan(0)
    expect(television(withoutEnd)).toBeUndefined()
    expect(withEnd.studio.cash).not.toBe(withoutEnd.studio.cash)
  })

  it('every advance: R/M/F, film results, Standing, promises, the guest\'s booking, career events and first takes match the world without the season', () => {
    expect(refusal, 'premise: the commission').toBeUndefined()
    expect(rows.length).toBeGreaterThan(1)
    expect(rows.filter((r) => r.withSeason !== r.without).map((r) => r.week)).toEqual([])
  })

  it('static shape premise, not a measurement: no Awards root exists for a season to touch; both worlds still save', () => {
    expect(refusal, 'premise: the commission').toBeUndefined()
    expect(Object.hasOwn(withEnd, 'awards')).toBe(false)
    expect(Object.hasOwn(withoutEnd, 'awards')).toBe(false)
    expect(() => makeSave(withEnd)).not.toThrow()
    expect(() => makeSave(withoutEnd)).not.toThrow()
  })
})
