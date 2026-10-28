// ── P17 Shape A — cameo bookings on the live GameState ──────────────────────────────────────────────────
//
// Binds the pure law (cameo.ts) to the real owners: the quote and the eligibility matrix read the ONE availability set
// (`busyTalentIds`), the studio-aware employer (`studioEmployerId`), the lifecycle authority (`retirementRecordFor` /
// `lifecycleRefusal`, with an explicit one-week end instead of `assignmentRefusal`'s full production seat) and the
// existing population. Money moves through the player's canonical ledger as `freelancerFee` rows (a direct production
// cost the committed-cost readers already sum). Deterministic and pure; refusals throw before any write.
//
// Rival bookings have no producer at this checkpoint (rival greedy guest selection stays deferred, as in the preserved
// draft): rivals meet the same law as the party whose seats must respect a player's reserved week.

import {
  cameoAttentionDelta,
  cameoFee,
  cameoPublicityDelta,
  cameoRetained,
  cancelReservedBookings,
  completeCameoBooking,
  completedGuestsFor,
  featuredCapacity,
  mintCameoBooking,
  P17_CAMEO_FEE_NOTE,
  P17_CAMEO_REFUND_NOTE,
  reservedGuestWeeks,
  type CameoBookingFacts,
  type CameoBookingRequest,
  type CameoRefund,
} from './cameo.js'
import { lifecycleRefusal, retirementRecordFor } from './careerLifecycle.js'
import { busyTalentIds, economyEngaged } from './employment.js'
import { studioEmployerId } from './hollywood.js'
import { productionPhaseForRemainingTicksOrNull } from './productionPhases.js'
import { resolveShape } from './shape.js'
import { castSlotExecution, roleOVR } from './talentSummary.js'
import { TUNING } from './tuning.js'
import type {
  Action,
  CameoBooking,
  CameoCancelReason,
  CameoRoot,
  CastSlot,
  CreativeRole,
  FilmConcept,
  Promise as FilmPromise,
  FilmShape,
  GameState,
  LedgerEntry,
  Production,
  Segment,
  SegmentId,
  ShapeEffects,
  Talent,
} from './types.js'

// ── the quote (contract §4: fee, retained share, basis, readiness risk, disclosures) ───────────────────────

export type CameoQuote = {
  ok: true
  talentId: string
  name: string
  profession: CreativeRole
  basis: 'employee' | 'freelance'
  greenlightWeek: number
  workWeek: number
  fee: number
  retained: number
  refundable: number
  perceivedActingOVR: number
  fame: number
  nominalShootingWeeks: number[]
  readinessRisk: string
  disclosures: string[]
}
export type CameoQuoteResult = CameoQuote | { ok: false; reason: string }

const money = (n: number): string => `$${Math.round(n).toLocaleString('en-US')}`

/** The weeks a picture greenlit at `greenlightWeek` shoots on the standard schedule. A projection, never a promise:
 * a managed picture shoots only once its work is allocated. */
export function nominalShootingWeeks(greenlightWeek: number): number[] {
  const weeks: number[] = []
  for (let k = 1; k <= TUNING.PRODUCTION_TICKS; k++) {
    if (productionPhaseForRemainingTicksOrNull(TUNING.PRODUCTION_TICKS - (k - 1)) === 'shooting') weeks.push(greenlightWeek + k)
  }
  return weeks
}

/**
 * The player's quote for one existing person and one work week at this week's greenlight. Refuses with the exact
 * reason and never mutates; an unaccepted quote changes nothing. The same function is the greenlight's eligibility
 * law, so a quote and a commit cannot disagree.
 */
export function cameoQuote(state: GameState, args: { talentId: string; workWeek: number }): CameoQuoteResult {
  const week = state.market.tick
  const { workWeek } = args
  const refuse = (reason: string): CameoQuoteResult => ({ ok: false, reason })
  const studioId = state.hollywood?.playerStudioId
  if (studioId === undefined) return refuse('a featured booking needs the living industry (its studio-aware employment law is read there)')
  if (!economyEngaged(state)) return refuse('a featured booking needs the engaged studio economy (its fee and the employment law it reads)')
  if (featuredCapacity(week) === 0) return refuse(`featured/cameo bookings unlock at week ${TUNING.P17_CAMEO_UNLOCK_WEEK} (1956 Week 1); week ${week} has no capability`)
  const talent = state.talent.find((t) => t.id === args.talentId)
  if (talent === undefined) return refuse(`guest ${args.talentId} is not an existing person of this world`)
  // greenlight's has-discipline law: an appearance is acting work, priced and performed on the acting profile
  if (talent.skills.acting === undefined) return refuse(`guest ${talent.id} lacks an acting skill profile`)
  if (!(Number.isInteger(workWeek) && week < workWeek && workWeek <= week + TUNING.PRODUCTION_TICKS)) {
    return refuse(`work week ${String(workWeek)} must satisfy ${week} < workWeek <= ${week + TUNING.PRODUCTION_TICKS}`)
  }
  // The lifecycle authority with an explicit one-week end: the current profession AND any recorded actor episode (an
  // actor who retired into writing takes no new acting job); an announced person may take only work completing at
  // its right boundary by the effective week; a finishing or retired person takes none.
  for (const record of new Set([retirementRecordFor(state, talent.id), retirementRecordFor(state, talent.id, 'actor')])) {
    if (record === undefined || (record.status === 'announced' && workWeek + 1 <= record.effectiveWeek)) continue
    return refuse(lifecycleRefusal(record, `a one-week appearance in week ${workWeek} would not complete before it`))
  }
  const otherWeeks = reservedGuestWeeks(state.cameos, talent.id)
  if (otherWeeks.includes(workWeek)) return refuse(`${talent.id} already holds a guest reservation for week ${workWeek}`)
  // ponytail: the one availability set, read as open-ended; a seat whose picture releases before the work week, or a
  // draft due before it, over-refuses. Read their end weeks if play needs that interval.
  if (busyTalentIds(state).has(talent.id)) return refuse(`${talent.id} holds actual work (a production seat, writing or research assignment) that a week-${workWeek} appearance would overlap`)
  // Studio-aware exclusivity: never another studio's employee, now or in the work week.
  const employerAtWork = studioEmployerId(state, talent.id, workWeek)
  for (const employer of [studioEmployerId(state, talent.id, week), employerAtWork]) {
    if (employer !== null && employer !== studioId) return refuse(`${talent.id} is ${employer}'s employee; another studio's employee takes no appearance`)
  }
  const basis = employerAtWork === studioId ? 'employee' : 'freelance'
  const perceivedActingOVR = roleOVR(talent, 'acting')
  const fee = cameoFee(perceivedActingOVR, talent.fame)
  const retained = cameoRetained(fee)
  const shooting = nominalShootingWeeks(week)
  const readinessRisk =
    `${talent.name} works one week only: week ${workWeek}. The appearance completes only if the picture performs shooting work that week ` +
    `(standard schedule: weeks ${shooting.join(' and ')}; a managed picture shoots only once its work is allocated). ` +
    (shooting.includes(workWeek) ? '' : `Week ${workWeek} is not a standard shooting week, so on the standard schedule the appearance is missed. `) +
    `A missed or cancelled appearance retains ${money(retained)} of the ${money(fee)} fee and refunds ${money(fee - retained)}.`
  const disclosures = otherWeeks.map((w) => `Also reserved for a guest appearance in week ${w}.`)
  if (basis === 'employee') disclosures.push('Booked as an own-employee appearance: if their employment ends before the work week, the booking is cancelled with the standard refund.')
  return {
    ok: true, talentId: talent.id, name: talent.name, profession: talent.role, basis, greenlightWeek: week, workWeek, fee, retained,
    refundable: fee - retained, perceivedActingOVR, fame: talent.fame, nominalShootingWeeks: shooting, readinessRisk, disclosures,
  }
}

// ── the greenlight: refuse atomically, then commit with the production ─────────────────────────────────────

export type CameoInputs = { cameoPublicityDelta?: Record<SegmentId, number>; cameoExecutions?: number[] }
export type CameoPrep = { facts: CameoBookingFacts[]; fees: number; inputs: CameoInputs }

function reject(reason: string): never {
  throw new Error(`applyActions: greenlight rejected — ${reason}`)
}

/** Everything a greenlight needs before it writes: the per-booking law, the frozen facts and fee, and the forecast's
 * locked inputs (the guests' publicity at greenlight fame and their PERCEIVED support-fit execution). */
export function prepareCameoBookings(
  state: GameState,
  requests: readonly CameoBookingRequest[] | undefined,
  ctx: {
    productionId: string
    creditedIds: ReadonlySet<string>
    cast: Record<CastSlot, Talent>
    concept: FilmConcept
    shapeEffects: ShapeEffects
    promise: FilmPromise
    shape: FilmShape
    carriedScreenplay: boolean
  },
): CameoPrep {
  if (requests === undefined || requests.length === 0) return { facts: [], fees: 0, inputs: {} }
  const week = state.market.tick
  const capacity = featuredCapacity(week)
  if (capacity === 0) reject(`featured/cameo bookings unlock at week ${TUNING.P17_CAMEO_UNLOCK_WEEK} (1956 Week 1); week ${week} has no capability`)
  if (requests.length > capacity) reject(`at most ${capacity} guests per production (${requests.length} requested); three principals stay required and no seat is added`)
  // ponytail: an absorbed rival screenplay's greenlight proves its paid rows against a frozen decision
  // (continuedScripts.ts), which a later refund row would break; book guests there once that owner reads refunds.
  if (ctx.carriedScreenplay) reject('a carried screenplay\'s greenlight cannot carry featured bookings at this checkpoint')
  const facts: CameoBookingFacts[] = []
  const guests: Talent[] = []
  for (const request of requests) {
    if (typeof request?.talentId !== 'string' || typeof request.fee !== 'number') reject('a featured booking names a person, one work week and the quoted fee it accepts')
    if (facts.some((f) => f.talentId === request.talentId)) reject(`guest ${request.talentId} is requested twice`)
    if (ctx.creditedIds.has(request.talentId)) reject(`guest ${request.talentId} is already credited on this picture`)
    const quote = cameoQuote(state, request)
    if (!quote.ok) reject(quote.reason)
    if (request.fee !== quote.fee) reject(`stale cameo quote for ${request.talentId}: the fee is now ${money(quote.fee)}, not the accepted ${money(request.fee)}; re-quote before booking`)
    facts.push({
      studioId: state.hollywood!.playerStudioId,
      productionId: ctx.productionId,
      talentId: quote.talentId,
      workWeek: quote.workWeek,
      bookedWeek: week,
      basis: quote.basis,
      profession: quote.profession,
      fee: quote.fee,
      perceivedActingOVR: quote.perceivedActingOVR,
      fame: quote.fame,
    })
    guests.push(state.talent.find((t) => t.id === quote.talentId)!)
  }
  return {
    facts,
    fees: facts.reduce((sum, f) => sum + f.fee, 0),
    inputs: {
      cameoPublicityDelta: cameoPublicityDelta(principalFames(ctx.cast), facts.map((f) => ({ fame: f.fame, profession: f.profession })), state.market.segments),
      // the explicit cameo fit convention: the screenplay's existing SUPPORT requirement, perceived at the forecast
      cameoExecutions: guests.map((g) => castSlotExecution(g, ctx.concept, 'support', ctx.shapeEffects, ctx.promise, 'perceived', ctx.shape)),
    },
  }
}

const principalFames = (cast: Record<CastSlot, Talent>) => [cast.lead, cast.antagonist, cast.support].map((t) => ({ fame: t.fame }))

/** One fee row per booking: charged once at greenlight as a direct production cost. */
export function cameoFeeRows(prep: CameoPrep, week: number): LedgerEntry[] {
  return prep.facts.map((f) => ({ week, kind: 'freelancerFee', amount: -f.fee, talentId: f.talentId, productionId: f.productionId, note: P17_CAMEO_FEE_NOTE }))
}

/** The bookings commit atomically after the main production exists; no booking, no root. */
export function commitCameoBookings(state: GameState, prep: CameoPrep): GameState {
  if (prep.facts.length === 0) return state
  let cameos = state.cameos
  for (const f of prep.facts) cameos = mintCameoBooking(cameos, f)
  return { ...state, cameos }
}

// ── cancellation and settlement (contract §4) ────────────────────────────────────────────────────────────

function refundRows(refunds: readonly CameoRefund[], week: number): LedgerEntry[] {
  return refunds.map((r) => ({ week, kind: 'freelancerFee', amount: r.amount, talentId: r.talentId, productionId: r.productionId, note: P17_CAMEO_REFUND_NOTE }))
}

/** Close every reserved booking matching `where` once, paying each one linked refund into the player's cash and
 * ledger (folded row by row, as the ledger validator folds). Completed work and its earned fee are untouched. */
export function settleCameoCancellation(state: GameState, where: (b: CameoBooking) => boolean, week: number, reason: CameoCancelReason): GameState {
  if (state.cameos === undefined) return state
  const { root, refunds } = cancelReservedBookings(state.cameos, where, week, reason)
  if (refunds.length === 0) return state
  const rows = refundRows(refunds, week)
  let cash = state.studio.cash
  for (const row of rows) cash += row.amount
  return { ...state, cameos: root, studio: { ...state.studio, cash }, ledger: [...state.ledger, ...rows] }
}

/** An own-employee appearance whose employment no longer covers its work week (terminated or transferred) is cancelled
 * with the standard refund, in addition to the ordinary exit accounting. A freelance booking survives employment. */
export function cancelExitedEmployeeBookings(state: GameState, week: number): GameState {
  return settleCameoCancellation(state, (b) => b.basis === 'employee' && studioEmployerId(state, b.talentId, b.workWeek) !== b.studioId, week, 'employmentExit')
}

/** The `cancelCameoBooking` action: one unperformed booking of the player closes once with its linked refund. */
export function applyCancelCameoBooking(state: GameState, action: Extract<Action, { kind: 'cancelCameoBooking' }>): GameState {
  const booking = state.cameos?.bookings.find((b) => b.bookingId === action.bookingId)
  if (booking === undefined) throw new Error(`applyActions: cancelCameoBooking rejected — no booking ${action.bookingId}`)
  if (booking.studioId !== state.hollywood?.playerStudioId) throw new Error(`applyActions: cancelCameoBooking rejected — ${action.bookingId} belongs to ${booking.studioId}`)
  if (booking.status !== 'reserved') {
    throw new Error(`applyActions: cancelCameoBooking rejected — ${action.bookingId} is ${booking.status === 'completed' ? 'completed work and keeps its earned fee' : 'already cancelled'}`)
  }
  return settleCameoCancellation(state, (b) => b.bookingId === action.bookingId, state.market.tick, 'explicit')
}

// ── the tick: one actual week of work, then the release ─────────────────────────────────────────────────

/**
 * Resolve every reserved booking due by `week` against this advance's REAL production work: a shooting-phase advance
 * of its picture (remainingTicks 5→4 or 4→3) in exactly the booked week completes the appearance and freezes the
 * guest's actual support-fit execution. Anything else (not a shooting week, a stalled or unallocated picture, a
 * picture no longer on the slate) cancels with `missedWork`; a picture held by rights loss cancels with `rightsLoss`.
 * Each closure retains the declared charge and pays one linked refund. No phantom work.
 */
export function resolveCameoWeek(
  root: CameoRoot,
  ctx: {
    week: number
    before: readonly Production[]
    after: readonly Production[]
    held: { has(productionId: string): boolean }
    talent: readonly Talent[]
    conceptOf: (production: Production) => FilmConcept
  },
): { root: CameoRoot; rows: LedgerEntry[] } {
  let next = root
  const refunds: CameoRefund[] = []
  for (const b of root.bookings) {
    if (b.status !== 'reserved' || b.workWeek > ctx.week) continue
    const before = ctx.before.find((p) => p.id === b.productionId)
    const after = ctx.after.find((p) => p.id === b.productionId)
    const held = ctx.held.has(b.productionId)
    const shot = !held && b.workWeek === ctx.week && before !== undefined && after !== undefined &&
      productionPhaseForRemainingTicksOrNull(before.remainingTicks) === 'shooting' && after.remainingTicks === before.remainingTicks - 1
    if (shot && after !== undefined) {
      const guest = ctx.talent.find((t) => t.id === b.talentId)
      if (guest === undefined) throw new Error(`tick: cameo booking ${b.bookingId} names unknown talent "${b.talentId}"`)
      next = completeCameoBooking(next, b.bookingId, ctx.week, castSlotExecution(guest, ctx.conceptOf(after), 'support', resolveShape(after.shape), after.promise, 'actual', after.shape))
      continue
    }
    const closed = cancelReservedBookings(next, (x) => x.bookingId === b.bookingId, ctx.week, held ? 'rightsLoss' : 'missedWork')
    next = closed.root
    refunds.push(...closed.refunds)
  }
  return { root: next, rows: refundRows(refunds, ctx.week) }
}

/** The release-time inputs of one picture's COMPLETED guests: publicity at contemporaneous fame (the principals' own
 * source), the frozen actual executions, and the attention delta. Null for a picture with no completed guest. */
export function cameoReleaseInputs(
  root: CameoRoot | undefined,
  productionId: string,
  cast: Record<CastSlot, Talent>,
  talent: readonly Talent[],
  segments: readonly Segment[],
): { inputs: Required<CameoInputs>; attentionDelta: number; guests: { talentId: string }[] } | null {
  const completed = completedGuestsFor(root, productionId)
  if (completed.length === 0) return null
  const guests = completed.map((b) => {
    const guest = talent.find((t) => t.id === b.talentId)
    if (guest === undefined) throw new Error(`tick: completed cameo guest "${b.talentId}" is unknown`)
    return { fame: guest.fame, profession: b.profession }
  })
  const delta = cameoPublicityDelta(principalFames(cast), guests, segments)
  return {
    inputs: { cameoPublicityDelta: delta, cameoExecutions: completed.map((b) => b.completedExecution!) },
    attentionDelta: cameoAttentionDelta(delta, segments),
    guests: completed.map((b) => ({ talentId: b.talentId })),
  }
}
