/** P17 Shape A (projection 66): featured appearances on the Bridge. Every fee, basis, refusal and booking fact is the
 * core's own (cameoQuote and the `cameos` root); the cancel verb is the core `cancelCameoBooking` action. Nothing here
 * books: a booking rides the greenlight package (bridge/casting.ts), which the core books atomically at greenlight. */
import { featuredCapacity } from '../src/core/cameo.js'
import { cameoQuote, nominalShootingWeeks, type CameoQuote } from '../src/core/cameoBooking.js'
import { TUNING } from '../src/core/tuning.js'
import type { Action, CameoBooking, GameState } from '../src/core/types.js'
import type { AvailableIntent } from './protocol.ts'
import type { FeaturedAppearancesPage } from './schema/industry-schema.ts'

export type CameoCancelSpec = { bookingId: string; productionId: string; label: string; detail: string; action: Extract<Action, { kind: 'cancelCameoBooking' }> }
export type CameoIntent = { spec: CameoCancelSpec; option: AvailableIntent }

const money = (n: number): string => `$${Math.round(n).toLocaleString('en-US')}`
const nameOf = (state: GameState, talentId: string): string => state.talent.find((t) => t.id === talentId)?.name ?? talentId

function playerBookings(state: GameState): CameoBooking[] {
  const player = state.hollywood?.playerStudioId
  return player === undefined ? [] : (state.cameos?.bookings ?? []).filter((b) => b.studioId === player)
}

function productionTitle(state: GameState, productionId: string): string {
  const conceptId = state.studio.activeProductions.find((p) => p.id === productionId)?.conceptId
    ?? state.studio.releasedFilms.find((f) => f.productionId === productionId)?.conceptId
  return state.concepts.find((c) => c.id === conceptId)?.title ?? productionId
}

/** One cancel verb per unperformed booking of the player's own; the core action revalidates it at commit. */
export function cameoCancelSpecs(state: GameState): CameoCancelSpec[] {
  return playerBookings(state).filter((b) => b.status === 'reserved').map((b) => ({
    bookingId: b.bookingId,
    productionId: b.productionId,
    label: `Cancel ${nameOf(state, b.talentId)}'s guest appearance (week ${b.workWeek})`,
    detail: `Refunds ${money(b.fee - b.retained)} of the ${money(b.fee)} fee; the ${money(b.retained)} reservation charge is retained.`,
    action: { kind: 'cancelCameoBooking', bookingId: b.bookingId },
  }))
}

export function featuredAppearancesPage(
  state: GameState, targetId: string | null, page: number, pageSize: number, intents: readonly CameoIntent[],
): { featuredAppearances: FeaturedAppearancesPage; totalRows: number; pageCount: number } {
  if (targetId !== null) throw new Error('The featured-appearance list requires a null targetId.')
  if (state.hollywood === null) throw new Error('Featured appearances require an established player studio.')
  const week = state.market.tick
  const shooting = nominalShootingWeeks(week)
  const workWeeks = Array.from({ length: TUNING.PRODUCTION_TICKS }, (_, index) => week + 1 + index)
  const pageCount = Math.ceil(state.talent.length / pageSize)
  if (page > 0 && page >= pageCount) throw new Error('That featured-appearance page is outside this record.')
  // ponytail: every person in world order, quoted for each lawful work week on the requested page only (≤ 50 × 8 quotes);
  // add an eligibility sort when a page of refusals gets in the player's way.
  const guests = state.talent.slice(page * pageSize, (page + 1) * pageSize).map((t) => {
    const quotes = workWeeks.map((workWeek) => cameoQuote(state, { talentId: t.id, workWeek }))
    const lawful = quotes.find((q): q is CameoQuote => q.ok)
    return {
      talentId: t.id, name: t.name, profession: t.role, fame: t.fame,
      fee: lawful?.fee ?? null, retained: lawful?.retained ?? null, refundable: lawful?.refundable ?? null,
      weeks: quotes.map((q, index) => {
        const workWeek = workWeeks[index]!, standardShooting = shooting.includes(workWeek)
        return q.ok
          ? { workWeek, standardShooting, ok: true, basis: q.basis, refusal: null, readinessRisk: q.readinessRisk, disclosures: [...q.disclosures] }
          : { workWeek, standardShooting, ok: false, basis: null, refusal: q.reason, readinessRisk: null, disclosures: [] }
      }),
    }
  })
  const options = new Map(intents.map((intent) => [intent.spec.bookingId, intent.option]))
  const bookings = playerBookings(state).map((b) => ({
    bookingId: b.bookingId, productionId: b.productionId, productionTitle: productionTitle(state, b.productionId),
    talentId: b.talentId, name: nameOf(state, b.talentId), profession: b.profession, basis: b.basis, workWeek: b.workWeek,
    bookedWeek: b.bookedWeek, fee: b.fee, retained: b.retained, status: b.status, completedWeek: b.completedWeek,
    cancelledWeek: b.cancelledWeek, cancelReason: b.cancelReason, refund: b.refund, releasedWeek: b.releasedWeek,
    starPowerDelta: b.careerEvent?.starPowerDelta ?? null,
    cancelIntent: options.get(b.bookingId) ?? null,
  }))
  const capacity = featuredCapacity(week)
  return { totalRows: state.talent.length, pageCount, featuredAppearances: {
    title: 'Featured appearances',
    notice: `Each fee, basis and refusal is the engine's quote for a greenlight this week. A picture books at most ${capacity} guest(s), `
      + 'carried on its greenlight package; a guest works one week only and an unperformed booking refunds all but its retained charge.',
    greenlightWeek: week, capacity, nominalShootingWeeks: shooting, guests, bookings,
  } }
}
