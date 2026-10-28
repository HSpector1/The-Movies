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
//                             booked work week, and at the continuation's release. CONTROL: another seed's route
//                             exports different bytes after the same first greenlight.
//   W2 (MEASUREMENT, §8)      the same released world then takes the managed operations step, buys and adopts the
//                             synchronized-sound chain on its founding stage and Post, and commissions a season on the
//                             franchise's own story property (the "season on a continuation-linked property" witness;
//                             the case asserts that P16 admits it). Over every advance of the season, film R/M/F (the
//                             franchise root), released film results, Standing, promises, the guest's booking, career
//                             events and first takes are byte-identical to the same world without the season, which ticks
//                             the same weeks. No Awards source exists in the core (campaignLegacy.ts:92, 303), so Awards
//                             cannot move; the case asserts the absence.
//
// Disclosed shortcut, the only one: one P18 fixture cash row (`withCash`, tests/helpers/p18-route.ts) before the
// technology purchase, so the money reconciles. No staff, grant or capacity is spliced.
// Budgets: each heavy build runs in a hook with the budget declared beside it; cases only compare stored results.

import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { nominalShootingWeeks } from '../src/core/cameoBooking.js'
import { assignmentRefusal } from '../src/core/careerLifecycle.js'
import { activeContract, assignmentBlockedTalentIds } from '../src/core/employment.js'
import { storyPropertyId } from '../src/core/rights.js'
import { exportCurrentState, makeSave } from '../src/core/save.js'
import { adoptionChainOperational } from '../src/core/technologyAdoption.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { Action, CreativeRole, GameState } from '../src/core/types.js'
import { adoptExistingSoundChain } from '../src/harness/p13a/fixtures.js'
import { ask, cameoRoute, freeGuest, greenlight, releaseNewest, rootOf, type CameoRoute } from './helpers/p17-cameo-route.js'
import { freshConcept } from './helpers/p17-route.js'
import { attempt, player, request, season, sig, television, withCash, type TvRosterLocal } from './helpers/p18-route.js'

/** bridge-p17-featured-appearances.test.ts:105's seed: its route already reaches a released continuation with a guest. */
const SEED = 'bridge-p17-featured-appearances'
/** The CONTROL seed: p17-cameo-booking.test.ts:29's, whose founded world takes the same first greenlight. */
const OTHER_SEED = 'p17-cameo-booking-01'

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

/** bridge-p17-featured-appearances.test.ts:54-67 `releasedContinuation`, with its intermediate states kept. */
function continuationRun(route: CameoRoute): ContinuationRun {
  const greenlit = applyActions(route.world, [greenlight(route.world, freshConcept(route.world), route.a, route.writer)])
  const parentId = greenlit.studio.activeProductions[greenlit.studio.activeProductions.length - 1]!.id
  let state = releaseNewest(greenlit)
  const staff = new Set([route.writer, route.a.director, route.a.craft, ...route.a.cast, route.b.director, route.b.craft, ...route.b.cast])
  const guest = freeGuest(state, 'actor', staff)
  const workWeek = nominalShootingWeeks(state.market.tick)[0]!
  const commitment = applyActions(state, [{ ...greenlight(state, freshConcept(state), route.b, route.writer, [ask(guest, workWeek)]),
    continuation: { type: 'directSequel', predecessorProductionId: parentId } } as Action])
  const childId = commitment.studio.activeProductions[commitment.studio.activeProductions.length - 1]!.id
  state = commitment
  while (state.market.tick <= workWeek) state = tick(state)
  const worked = state
  return { route, greenlit, commitment, worked, released: releaseNewest(worked), parentId, childId, guestId: guest.id, workWeek }
}

let A: ContinuationRun
beforeAll(() => {
  A = continuationRun(cameoRoute(SEED))
}, 600_000)

describe('S14 W1 — same seed, same actions: byte identity on the P17 continuation route with a featured guest (MEASUREMENT; P17 §6 :106)', () => {
  type Bytes = { commitment: string; worked: string; released: string }
  const bytesOf = (run: ContinuationRun): Bytes => ({ commitment: exportCurrentState(run.commitment), worked: exportCurrentState(run.worked), released: exportCurrentState(run.released) })
  let a: Bytes
  let b: Bytes
  let aGreenlit: string
  let other: { bytes: string } | { premise: string }
  beforeAll(() => {
    a = bytesOf(A)
    aGreenlit = exportCurrentState(A.greenlit)
    b = bytesOf(continuationRun(cameoRoute(SEED)))
    try {
      const route = cameoRoute(OTHER_SEED)
      other = { bytes: exportCurrentState(applyActions(route.world, [greenlight(route.world, freshConcept(route.world), route.a, route.writer)])) }
    } catch (error) {
      // Isolated, never swallowed: the CONTROL case below fails by this name while the identity case still runs.
      other = { premise: error instanceof Error ? error.message : String(error) }
    }
  }, 900_000)

  it('the route is the one the contract names: a released direct sequel whose guest worked the booked week and was credited', () => {
    const booking = rootOf(A.worked)?.bookings.find((x) => x.talentId === A.guestId)
    expect(booking).toMatchObject({ productionId: A.childId, status: 'completed', completedWeek: A.workWeek })
    expect(rootOf(A.released)?.bookings.find((x) => x.talentId === A.guestId)?.careerEvent).not.toBeNull()
    const edge = A.released.franchises?.properties.flatMap((p) => p.installments).find((e) => e.childProductionId === A.childId)
    expect(edge).toMatchObject({ type: 'directSequel', parentProductionId: A.parentId })
  })

  it('exports the same bytes at commitment, after the booked work week and at the continuation\'s release', () => {
    expect(b.commitment === a.commitment, 'commitment bytes').toBe(true)
    expect(b.worked === a.worked, 'bytes after the booked work week').toBe(true)
    expect(b.released === a.released, 'release bytes').toBe(true)
  })

  it('CONTROL: another seed\'s route exports different bytes after the same first greenlight, so the comparison is not vacuous', () => {
    expect(other, `the ${OTHER_SEED} route reached its first greenlight`).toHaveProperty('bytes')
    if (!('bytes' in other)) return
    expect(other.bytes === aGreenlit, `${OTHER_SEED} versus ${SEED}`).toBe(false)
  })
})

describe('S14 W2 — a franchise with a guest and a live season: no film pollution (MEASUREMENT; P18 §8 :119-121)', () => {
  /** Everything §8 forbids the season to touch, as stored: film R/M/F, film results, Standing, promises, the guest's
   * booking, film career events and first takes. */
  const filmSide = (s: GameState): string => sig({
    franchises: s.franchises ?? null, releasedFilms: s.studio.releasedFilms, standing: s.studio.standing, promises: s.promises,
    cameos: s.cameos ?? null, careerEvents: s.careerEvents, firstTakes: s.firstTakes,
  })
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
    let s = applyActions(A.released, [{ kind: 'activateStudioOperations' }])
    s = withCash(s, 30_000_000)
    s = adoptExistingSoundChain(applyActions(s, [{ kind: 'purchaseTechnology', technologyId: 'synchronized-sound' }]))
    const adoption = s.technology.adoptions.find((x) => x.studioId === player(s) && x.technologyId === 'synchronized-sound')
    if (adoption === undefined || adoption.postFacilityId === null) throw new Error('premise: no player sound adoption with a Post facility')
    for (let guard = 0; !adoptionChainOperational(s, s.technology.adoptions.find((x) => x.id === adoption.id)!); guard++) {
      if (guard > 40) throw new Error('premise: the sound chain did not become operational within 40 weeks')
      s = tick(s)
    }
    base = s
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
      withSeason = tick(withSeason)
      without = tick(without)
      rows.push({ week: withSeason.market.tick, withSeason: filmSide(withSeason), without: filmSide(without) })
    }
    withEnd = withSeason
    withoutEnd = without
  }, 300_000)

  it('P16 admits the season on the franchise\'s own story property (continuation-linked), within 72 advances', () => {
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

  it('no Awards source exists for a season to touch, and both worlds still save', () => {
    expect(refusal, 'premise: the commission').toBeUndefined()
    expect(Object.hasOwn(withEnd, 'awards')).toBe(false)
    expect(Object.hasOwn(withoutEnd, 'awards')).toBe(false)
    expect(() => makeSave(withEnd)).not.toThrow()
    expect(() => makeSave(withoutEnd)).not.toThrow()
  })
})
