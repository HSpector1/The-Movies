// ── P17 Shape A — bounded cameo / featured-appearance law (pure) ───────────────────────────────────────
//
// Authority: 1367-stage/p17-prep/P17-CAMEO-CONTRACT.md, adopted as versioned PROVISIONAL rules (§2 capability and
// profile table; §3 publicity delta, performance weight, credits; §4 quote, one-week work, fee, cancellation; §5
// persistence). Three principals stay required (`additionalPrincipals` is always 0); at most two guests per film, each
// an EXISTING person of the world (no new celebrity population); guests live in their own lazy root (`cameos`), never
// inside the frozen `FilmParticipants` leaf, the cast seats or the production company.
//
// Pure: no RNG, no I/O, no state reads. The state binding (eligibility, greenlight, tick, cancellation) lives in
// cameoBooking.ts; the save validator below is standalone so continuationSave.ts can import it without a cycle.

import { fameReach } from './economy.js'
import { clamp } from './math.js'
import { TUNING } from './tuning.js'
import type { CameoBooking, CameoCancelReason, CameoCareerEvent, CameoRoot, CreativeRole, FilmParticipants, LedgerEntry, Segment, SegmentId } from './types.js'

export const P17_CAMEO_RULE_VERSION = 'p17-cameo/v1' as const
/** The capability (1956 unlock, at most two guests) and the profession profile table a quote is evaluated under
 * (contract §5 "quote rule/capability/profile versions"). A retune of either is a new version. */
export const P17_CAMEO_CAPABILITY_VERSION = 'p17-cameo-capability/v1' as const
export const P17_CAMEO_PROFILE_VERSION = 'p17-cameo-profile/v1' as const
export const P17_CAMEO_FEE_NOTE = 'P17 cameo appearance fee (one-week featured booking)'
export const P17_CAMEO_REFUND_NOTE = 'P17 cameo booking refund (fee less the retained reservation charge)'

/** The accepted quote: the person, the one work week, and the quoted fee and basis, each refused at commit if changed. */
export type CameoBookingRequest = { talentId: string; workWeek: number; fee: number; basis: 'employee' | 'freelance' }

// ── §2 capability and profile ─────────────────────────────────────────────────
/** Featured capacity at a week: none before the 1956 unlock, two from it on. */
export function featuredCapacity(week: number): number {
  return week >= TUNING.P17_CAMEO_UNLOCK_WEEK ? TUNING.P17_CAMEO_MAX_GUESTS : 0
}

export function cameoProfileAffinity(profession: CreativeRole, segmentId: SegmentId): number {
  return TUNING.P17_CAMEO_PROFILE[profession][segmentId]
}

// ── §4 price ──────────────────────────────────────────────────────────────────
/** fee = round(0.35·(SALARY_BASE + SALARY_SKILL_COEF·(ovr/100)² + SALARY_FAME_COEF·(fame/100)²)); one rounding,
 * strictly positive. A newly authored cameo fee, not `salaryCurve` (contract §4). */
export function cameoFee(perceivedActingOVR: number, fame: number): number {
  const ovr = clamp(perceivedActingOVR, 0, 100) / 100
  const f = clamp(fame, 0, 100) / 100
  return Math.round(TUNING.P17_CAMEO_FEE_FRACTION * (TUNING.SALARY_BASE + TUNING.SALARY_SKILL_COEF * ovr * ovr + TUNING.SALARY_FAME_COEF * f * f))
}

/** The nonrefundable reservation charge, round(fee·0.25); `fee − retained` refunds until completed work. */
export function cameoRetained(fee: number): number {
  return Math.round(fee * TUNING.P17_CAMEO_CANCEL_RETAINED_FRACTION)
}

// ── §3 publicity ──────────────────────────────────────────────────────────────
export type PublicityGuest = { fame: number; profession: CreativeRole }

function pool(names: readonly { fame: number; affinity: number }[]): number {
  let p = 0
  names.forEach((n, rank) => {
    p += fameReach(n.fame) * Math.pow(TUNING.P17_CAMEO_RANK_DECAY, rank) * n.affinity
  })
  return p
}

/**
 * delta(segment) = (P_all − P_principals) / 2, P = Σ f/(f+50)·0.5^rank·affinity over names ranked by fame descending;
 * ties keep principal seat order, then committed guest order. Principals carry affinity 1. A famous off-segment guest
 * can displace better-fit names and give a negative delta; it is returned as it is.
 */
export function cameoPublicityDelta(principals: readonly { fame: number }[], guests: readonly PublicityGuest[], segments: readonly Segment[]): Record<SegmentId, number> {
  const out = {} as Record<SegmentId, number>
  const byFame = (a: { fame: number; order: number }, b: { fame: number; order: number }) => (b.fame - a.fame) || (a.order - b.order)
  for (const seg of segments) {
    const base = principals.map((p, i) => ({ fame: p.fame, affinity: 1, order: i }))
    const all = [...base, ...guests.map((g, i) => ({ fame: g.fame, affinity: cameoProfileAffinity(g.profession, seg.id), order: principals.length + i }))]
    out[seg.id] = guests.length === 0 ? 0 : (pool([...all].sort(byFame)) - pool([...base].sort(byFame))) / TUNING.P17_CAMEO_POOL_NORMALIZER
  }
  return out
}

/** The segment-share-weighted delta added once to the existing principal-only star attention (standing.ts). */
export function cameoAttentionDelta(delta: Record<SegmentId, number>, segments: readonly Segment[]): number {
  let d = 0
  for (const seg of segments) d += seg.share * delta[seg.id]
  return d
}

// ── §4/§5 booking lifecycle (the root is absent until its first booking and never empties) ──────────────────
export type CameoBookingFacts = Pick<CameoBooking, 'studioId' | 'productionId' | 'talentId' | 'workWeek' | 'bookedWeek' | 'basis' | 'profession' | 'fee'> & {
  perceivedActingOVR: number
  fame: number
}

export function mintCameoBooking(root: CameoRoot | undefined, f: CameoBookingFacts): CameoRoot {
  const base = root ?? { version: 1 as const, nextOrdinal: 1, bookings: [] }
  const booking: CameoBooking = {
    bookingId: `cameo-${base.nextOrdinal}`,
    studioId: f.studioId,
    productionId: f.productionId,
    talentId: f.talentId,
    workWeek: f.workWeek,
    bookedWeek: f.bookedWeek,
    basis: f.basis,
    profession: f.profession,
    fee: f.fee,
    retained: cameoRetained(f.fee),
    quote: { perceivedActingOVR: f.perceivedActingOVR, fame: f.fame, ruleVersion: P17_CAMEO_RULE_VERSION, capabilityVersion: P17_CAMEO_CAPABILITY_VERSION, profileVersion: P17_CAMEO_PROFILE_VERSION },
    status: 'reserved',
    completedWeek: null,
    completedExecution: null,
    cancelledWeek: null,
    cancelReason: null,
    refund: null,
    releasedWeek: null,
    careerEvent: null,
  }
  return { ...base, nextOrdinal: base.nextOrdinal + 1, bookings: [...base.bookings, booking] }
}

export type CameoRefund = { bookingId: string; talentId: string; productionId: string; amount: number }

/** Close every RESERVED booking matching `where` once, each with its one linked refund of fee − retained. Completed
 * and cancelled bookings are never touched. The same root object comes back when nothing matched. */
export function cancelReservedBookings(root: CameoRoot, where: (b: CameoBooking) => boolean, week: number, reason: CameoCancelReason): { root: CameoRoot; refunds: CameoRefund[] } {
  const refunds: CameoRefund[] = []
  const bookings = root.bookings.map((b) => {
    if (b.status !== 'reserved' || !where(b)) return b
    const refund = b.fee - b.retained
    refunds.push({ bookingId: b.bookingId, talentId: b.talentId, productionId: b.productionId, amount: refund })
    return { ...b, status: 'cancelled' as const, cancelledWeek: week, cancelReason: reason, refund }
  })
  return refunds.length === 0 ? { root, refunds } : { root: { ...root, bookings }, refunds }
}

/** Completed work: the booked week performed real shooting work; the guest's actual execution is frozen with it. */
export function completeCameoBooking(root: CameoRoot, bookingId: string, week: number, execution: number): CameoRoot {
  return { ...root, bookings: root.bookings.map((b) => (b.bookingId === bookingId ? { ...b, status: 'completed' as const, completedWeek: week, completedExecution: execution } : b)) }
}

export function completedGuestsFor(root: CameoRoot | undefined, productionId: string): CameoBooking[] {
  return (root?.bookings ?? []).filter((b) => b.productionId === productionId && b.status === 'completed')
}

/** Guests holding a RESERVED appearance inside `[fromWeek, untilWeekExclusive)`: the obligation a new assignment over
 * that interval may not consume. A production or research seat is open-ended (the default bound); writing passes its
 * own due week, so an unrelated reserved week stays usable. Hiring and markets never read this. */
export function reservedCameoTalentIds(root: CameoRoot | undefined, fromWeek: number, untilWeekExclusive = Number.POSITIVE_INFINITY): Set<string> {
  const ids = new Set<string>()
  for (const b of root?.bookings ?? []) if (b.status === 'reserved' && b.workWeek >= fromWeek && b.workWeek < untilWeekExclusive) ids.add(b.talentId)
  return ids
}

/** The person's reserved appearance weeks, ascending: what a quote and a new employer are told (contract §4). */
export function reservedGuestWeeks(root: CameoRoot | undefined, talentId: string): number[] {
  return (root?.bookings ?? []).filter((b) => b.status === 'reserved' && b.talentId === talentId).map((b) => b.workWeek).sort((a, b) => a - b)
}

/** The release credits every completed appearance on the picture once; unperformed work earns nothing. */
export function releaseCameoBookings(root: CameoRoot, productionId: string, week: number): CameoRoot {
  if (!root.bookings.some((b) => b.productionId === productionId && b.status === 'completed' && b.releasedWeek === null)) return root
  return { ...root, bookings: root.bookings.map((b) => (b.productionId === productionId && b.status === 'completed' && b.releasedWeek === null ? { ...b, releasedWeek: week } : b)) }
}

/** The career pipeline's one cameo record per released guest lands on its booking, once (eventId `${filmId}:${talentId}`). */
export function attachCameoCareerEvents(root: CameoRoot, events: readonly CameoCareerEvent[]): CameoRoot {
  if (events.length === 0) return root
  const byKey = new Map(events.map((e) => [`${e.filmId}:${e.talentId}`, e]))
  const bookings = root.bookings.map((b) => {
    const key = `${b.productionId}:${b.talentId}`
    const event = b.status === 'completed' ? byKey.get(key) : undefined
    if (event === undefined) return b
    if (b.careerEvent !== null) throw new Error(`cameo: ${b.bookingId} already carries its release career credit`)
    if (b.releasedWeek !== event.releaseWeek) throw new Error(`cameo: ${b.bookingId} career credit week ${event.releaseWeek} is not its release week ${String(b.releasedWeek)}`)
    byKey.delete(key)
    return { ...b, careerEvent: event }
  })
  if (byKey.size > 0) throw new Error(`cameo: career credit names no completed booking: ${[...byKey.keys()].join(', ')}`)
  return { ...root, bookings }
}

// ── §5 the save validator — leaf-exact, exact-joined, loud ─────────────────────────────────────────────────

/** What the rest of the (already validated) save tells the cameo root. */
export type CameoValidationContext = {
  talentIds: ReadonlySet<string>
  productionIds: ReadonlySet<string>
  /** `market.tick` of the save. */
  week: number
  /** The player's industry studio id: the only studio with a booking producer at this checkpoint. */
  playerStudioId: string
  engaged: boolean
  /** The player's in-flight productions (id → greenlight week). */
  activeStartTick: ReadonlyMap<string, number>
  /** The player library's release week of a film; undefined until released. */
  releaseWeekOf: (productionId: string) => number | undefined
  participantsOf: (productionId: string) => FilmParticipants | undefined
  /** Films the player's frozen career-event list already credits (the careers step ran at their release). */
  careerCreditedFilmIds: ReadonlySet<string>
  ledger: readonly LedgerEntry[]
  /** The frozen V8 career-event leaf (save.ts), applied to a cameo record with its role read as `support`. */
  careerEventLeaf: (value: unknown, label: string) => void
}

type Rec = Record<string, unknown>
function fail(label: string, message: string): never {
  throw new Error(`${label}: ${message}`)
}
function rec(v: unknown, label: string): Rec {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) fail(label, 'object required')
  return v as Rec
}
function exactKeys(v: Rec, keys: readonly string[], label: string): void {
  const have = Object.keys(v).sort().join(',')
  const want = [...keys].sort().join(',')
  if (have !== want) fail(label, `expected exactly keys [${want}] but found [${have}]`)
}
function num(v: unknown, label: string, opts: { int?: boolean; min?: number; max?: number } = {}): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) fail(label, 'finite number required')
  if (opts.int && !Number.isInteger(v)) fail(label, 'integer required')
  if (opts.min !== undefined && v < opts.min) fail(label, `must be at least ${opts.min}`)
  if (opts.max !== undefined && v > opts.max) fail(label, `must be at most ${opts.max}`)
  return v
}
function numOrNull(v: unknown, label: string, opts: { int?: boolean; min?: number; max?: number } = {}): number | null {
  return v === null ? null : num(v, label, opts)
}
function str(v: unknown, label: string): string {
  if (typeof v !== 'string' || v.length === 0) fail(label, 'non-empty string required')
  return v
}
function enumOf<T extends string>(v: unknown, values: readonly T[], label: string): T {
  if (typeof v !== 'string' || !(values as readonly string[]).includes(v)) fail(label, `must be one of ${values.join('|')}`)
  return v as T
}

const BOOKING_KEYS = ['bookingId', 'studioId', 'productionId', 'talentId', 'workWeek', 'bookedWeek', 'basis', 'profession', 'fee', 'retained', 'quote', 'status', 'completedWeek', 'completedExecution', 'cancelledWeek', 'cancelReason', 'refund', 'releasedWeek', 'careerEvent'] as const
const STATUSES = ['reserved', 'completed', 'cancelled'] as const
const BASES = ['employee', 'freelance'] as const
const PROFESSIONS = ['writer', 'director', 'actor', 'craft', 'scientist'] as const
const CANCEL_REASONS = ['explicit', 'missedWork', 'productionCancelled', 'employmentExit', 'rightsLoss'] as const
type Facts = { id: string; productionId: string; talentId: string; bookedWeek: number; fee: number; status: (typeof STATUSES)[number]; cancelledWeek: number | null; refund: number | null; label: string }

/** The root, when present: every booking one the producers of this checkpoint write, joined to the people, the
 * player's productions and films, the career list and the ledger (one fee row each, one refund row per cancellation). */
export function validateCameoRoot(raw: unknown, label: string, ctx: CameoValidationContext): asserts raw is CameoRoot {
  const root = rec(raw, label)
  exactKeys(root, ['version', 'nextOrdinal', 'bookings'], label)
  if (root.version !== 1) fail(label, 'version must be 1')
  if (!Array.isArray(root.bookings)) fail(`${label}.bookings`, 'array required')
  const bookings = root.bookings as unknown[]
  if (bookings.length === 0) fail(label, 'an empty cameo root is written as absence (bookings are never deleted)')
  if (!ctx.engaged) fail(label, 'a booking needs the engaged studio economy that charged its fee')
  if (num(root.nextOrdinal, `${label}.nextOrdinal`, { int: true }) !== bookings.length + 1) fail(`${label}.nextOrdinal`, `nextOrdinal ${String(root.nextOrdinal)} is not one past the ${bookings.length} minted bookings`)
  const facts: Facts[] = []
  const liveWeeks = new Set<string>()
  bookings.forEach((b, i) => {
    const bl = `${label}.bookings[${i}]`
    const booking = rec(b, bl)
    exactKeys(booking, BOOKING_KEYS, bl)
    const id = str(booking.bookingId, `${bl}.bookingId`)
    if (id !== `cameo-${i + 1}`) fail(bl, `bookingId ${id} is not the ordinal-minted cameo-${i + 1}`)
    if (str(booking.studioId, `${bl}.studioId`) !== ctx.playerStudioId) fail(bl, `studio ${String(booking.studioId)} is not the player studio; no other studio has a booking route at this checkpoint`)
    const talentId = str(booking.talentId, `${bl}.talentId`)
    if (!ctx.talentIds.has(talentId)) fail(bl, `talentId ${talentId} is not a known person`)
    const productionId = str(booking.productionId, `${bl}.productionId`)
    if (!ctx.productionIds.has(productionId)) fail(bl, `productionId ${productionId} is not a persisted production`)
    const bookedWeek = num(booking.bookedWeek, `${bl}.bookedWeek`, { int: true, min: TUNING.P17_CAMEO_UNLOCK_WEEK, max: ctx.week })
    const workWeek = num(booking.workWeek, `${bl}.workWeek`, { int: true })
    if (!(bookedWeek < workWeek && workWeek <= bookedWeek + TUNING.PRODUCTION_TICKS)) fail(bl, `work week ${workWeek} must satisfy ${bookedWeek} < workWeek <= ${bookedWeek + TUNING.PRODUCTION_TICKS}`)
    const basis = enumOf(booking.basis, BASES, `${bl}.basis`)
    enumOf(booking.profession, PROFESSIONS, `${bl}.profession`)
    const quote = rec(booking.quote, `${bl}.quote`)
    exactKeys(quote, ['perceivedActingOVR', 'fame', 'ruleVersion', 'capabilityVersion', 'profileVersion'], `${bl}.quote`)
    const ovr = num(quote.perceivedActingOVR, `${bl}.quote.perceivedActingOVR`, { min: 0, max: 100 })
    const fame = num(quote.fame, `${bl}.quote.fame`, { min: 0, max: 100 })
    if (quote.ruleVersion !== P17_CAMEO_RULE_VERSION || quote.capabilityVersion !== P17_CAMEO_CAPABILITY_VERSION || quote.profileVersion !== P17_CAMEO_PROFILE_VERSION) {
      fail(`${bl}.quote`, `the quote freezes ${P17_CAMEO_RULE_VERSION}, ${P17_CAMEO_CAPABILITY_VERSION} and ${P17_CAMEO_PROFILE_VERSION}`)
    }
    const fee = num(booking.fee, `${bl}.fee`, { int: true, min: 1 })
    if (fee !== cameoFee(ovr, fame)) fail(bl, `fee ${fee} is not the frozen quote's fee ${cameoFee(ovr, fame)}`)
    const retained = num(booking.retained, `${bl}.retained`, { int: true, min: 0 })
    if (retained !== cameoRetained(fee)) fail(bl, `retained ${retained} is not the declared charge ${cameoRetained(fee)} of fee ${fee}`)
    const status = enumOf(booking.status, STATUSES, `${bl}.status`)
    const completedWeek = numOrNull(booking.completedWeek, `${bl}.completedWeek`, { int: true })
    const completedExecution = numOrNull(booking.completedExecution, `${bl}.completedExecution`, { min: 0 })
    const cancelledWeek = numOrNull(booking.cancelledWeek, `${bl}.cancelledWeek`, { int: true, max: ctx.week })
    const cancelReason = booking.cancelReason === null ? null : enumOf(booking.cancelReason, CANCEL_REASONS, `${bl}.cancelReason`)
    const refund = numOrNull(booking.refund, `${bl}.refund`, { int: true, min: 0 })
    const releasedWeek = numOrNull(booking.releasedWeek, `${bl}.releasedWeek`, { int: true })
    const careerEvent = booking.careerEvent
    if (status !== 'cancelled') {
      const key = `${talentId}@${workWeek}`
      if (liveWeeks.has(key)) fail(bl, `${talentId} holds two live appearances in week ${workWeek}`)
      liveWeeks.add(key)
    }
    if (status === 'reserved') {
      if (completedWeek !== null || completedExecution !== null || cancelledWeek !== null || cancelReason !== null || refund !== null || releasedWeek !== null || careerEvent !== null) fail(bl, 'a reserved booking carries no completion, cancellation, release or credit fact')
      if (workWeek < ctx.week) fail(bl, `a reserved booking for week ${workWeek} would have resolved before week ${ctx.week}`)
      if (ctx.activeStartTick.get(productionId) !== bookedWeek) fail(bl, `a reserved booking names ${productionId}, which is not the player's in-flight picture greenlit at week ${bookedWeek}`)
    } else if (status === 'completed') {
      if (completedWeek !== workWeek || completedExecution === null) fail(bl, 'completed work records its week and frozen execution')
      if (workWeek >= ctx.week) fail(bl, `work in week ${workWeek} cannot have completed before week ${ctx.week}`)
      if (cancelledWeek !== null || cancelReason !== null || refund !== null) fail(bl, 'completed work carries no cancellation fact')
      const actual = ctx.releaseWeekOf(productionId) ?? null
      if (releasedWeek !== actual) fail(bl, `releasedWeek ${String(releasedWeek)} is not ${productionId}'s release week ${String(actual)}`)
      if (careerEvent !== null && releasedWeek === null) fail(bl, 'a cameo career credit exists only once its picture has released')
      if (careerEvent === null && releasedWeek !== null && ctx.careerCreditedFilmIds.has(productionId)) fail(bl, `the released appearance on ${productionId} lacks its cameo career credit`)
      if (careerEvent !== null) {
        const el = `${bl}.careerEvent`
        const event = rec(careerEvent, el)
        if (event.role !== 'cameo' || event.discipline !== 'acting' || event.billingWeight !== TUNING.P17_CAMEO_VISIBILITY_WEIGHT) fail(el, 'a cameo credit is an acting record with role cameo at the cameo visibility weight')
        if (event.eventId !== `${productionId}:${talentId}` || event.talentId !== talentId || event.filmId !== productionId || event.releaseWeek !== releasedWeek) fail(el, 'the credit names its booking\'s person, film and release week')
        ctx.careerEventLeaf({ ...event, role: 'support' }, el)
      }
    } else {
      if (cancelledWeek === null || cancelReason === null || refund !== fee - retained) fail(bl, 'a cancelled booking records its week, reason and the one refund of fee − retained')
      if (completedWeek !== null || completedExecution !== null || releasedWeek !== null || careerEvent !== null) fail(bl, 'a cancelled booking carries no completion, release or credit fact')
      if (cancelReason === 'missedWork' || cancelReason === 'rightsLoss') {
        if (cancelledWeek !== workWeek) fail(bl, `a ${cancelReason} closure happens in the work week ${workWeek}`)
      } else if (!(bookedWeek <= cancelledWeek && cancelledWeek <= workWeek)) {
        fail(bl, `an ${cancelReason} cancellation happens between the booking week ${bookedWeek} and the work week ${workWeek}`)
      }
      if (cancelReason === 'employmentExit' && basis !== 'employee') fail(bl, 'only an own-employee appearance closes on employment exit')
    }
    facts.push({ id, productionId, talentId, bookedWeek, fee, status, cancelledWeek, refund, label: bl })
  })
  // per production: booked once, at its greenlight; at most two distinct guests, none credited on the picture
  const byProduction = new Map<string, Facts[]>()
  for (const f of facts) byProduction.set(f.productionId, [...(byProduction.get(f.productionId) ?? []), f])
  for (const [productionId, group] of byProduction) {
    if (group.length > TUNING.P17_CAMEO_MAX_GUESTS) fail(group[TUNING.P17_CAMEO_MAX_GUESTS]!.label, `production ${productionId} carries ${group.length} guests; at most ${TUNING.P17_CAMEO_MAX_GUESTS} are ever booked`)
    if (new Set(group.map((f) => f.talentId)).size !== group.length) fail(group[1]!.label, `the same guest is booked twice on ${productionId}`)
    if (new Set(group.map((f) => f.bookedWeek)).size !== 1) fail(group[1]!.label, `every guest on ${productionId} is booked at its one greenlight`)
    const p = ctx.participantsOf(productionId)
    if (p !== undefined) {
      const credited = new Set([p.writer.talentId, p.director.talentId, p.cast.lead.talentId, p.cast.antagonist.talentId, p.cast.support.talentId, ...p.craft.map((c) => c.talentId)])
      for (const f of group) if (credited.has(f.talentId)) fail(f.label, `guest ${f.talentId} is credited on ${productionId}`)
    }
  }
  // ledger: one fee row per booking, one refund row per cancellation, and no other cameo row
  const fees = ctx.ledger.filter((e) => e.note === P17_CAMEO_FEE_NOTE)
  const refunds = ctx.ledger.filter((e) => e.note === P17_CAMEO_REFUND_NOTE)
  const take = (rows: LedgerEntry[], want: { week: number; amount: number; talentId: string; productionId: string }): boolean => {
    const at = rows.findIndex((e) => e.kind === 'freelancerFee' && e.week === want.week && e.amount === want.amount && e.talentId === want.talentId && e.productionId === want.productionId)
    if (at < 0) return false
    rows.splice(at, 1)
    return true
  }
  for (const f of facts) {
    if (!take(fees, { week: f.bookedWeek, amount: -f.fee, talentId: f.talentId, productionId: f.productionId })) fail(f.label, `booking ${f.id} has no fee ledger row (charged −${f.fee} in week ${f.bookedWeek})`)
    if (f.status === 'cancelled' && !take(refunds, { week: f.cancelledWeek!, amount: f.refund!, talentId: f.talentId, productionId: f.productionId })) fail(f.label, `cancelled booking ${f.id} has no refund ledger row (+${String(f.refund)} in week ${String(f.cancelledWeek)})`)
  }
  if (fees.length > 0) fail(label, `${fees.length} cameo fee ledger row(s) name no booking`)
  if (refunds.length > 0) fail(label, `${refunds.length} cameo refund ledger row(s) name no cancelled booking`)
}
