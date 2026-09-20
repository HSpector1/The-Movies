/**
 * P14B.4 detached owner adapter, ENUMERATOR slice (record 555 §1 adopted law as
 * refined by 555-B; record 558 RED). Pure and detached: it charges its own
 * tariff, runs ONE Started plan (`commands: []`) to `claims.horizonEndWeek`,
 * and certifies the joint-trace domain from two owner facts:
 *
 *  - the fresh-take floor: no picture the issuer has not started at source-now
 *    can record a first take before `now + FRESH_TAKE_OFFSET` (admission sets
 *    `remainingTicks = PRODUCTION_TICKS`, the admission-week sweep skips, one
 *    decrement per week, the take fires only in the first Shooting week and is
 *    stamped with the produced week; queue admissions land a week later);
 *  - the started-domain conditions, per issuer picture: (a′) an issuer-matched
 *    first take is recorded or the countdown is past the first Shooting week;
 *    (b) the take is scheduled with no blocker (the next sweep fires it and no
 *    lawful command reverts it); (c) its floor is at or beyond the horizon.
 *
 * NOT in this slice (555 §2): no Ready-producer run (option β), no enumerator
 * of staffing, commissions or the stock door, no command-timing alternatives
 * for an unforced started picture (named omission instead), no live importer
 * (not index-exported), no version stamp or receipt fields, no Save/projection,
 * kernel, producer, cap or tariff change.
 */
import { searchPromiseCapacityTraces } from './promiseCapacityKernel.js'
import { replayStartedProductionPlans } from './promiseCapacityOwnerReplay.js'
import {
  assembleCapacityInput, capacityInputsDigest, collectPromiseClaims, mapCapacityResult,
  type CapacityLimits, type CollectedClaims, type DetachedOfferClassification, type EnumerationCoverage, type ProducerResult,
} from './promiseCapacityOwners.js'
import type { PromiseDraft } from './promises.js'
import { productionPhaseForRemainingTicksOrNull } from './productionPhases.js'
import { TUNING } from './tuning.js'
import type { GameState, Production } from './types.js'

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Promise capacity enumerator: ${message}`)
}

/** The first Shooting count: the highest countdown the phase owner puts in 'shooting' (productionPhases :36-45).
 * The take branch itself is operations :1680's `remainingTicks === 5`; the RED's natural-chain case is the link. */
const FIRST_SHOOTING_TICKS = ((): number => {
  for (let remaining = TUNING.PRODUCTION_TICKS; remaining >= 1; remaining--) {
    if (productionPhaseForRemainingTicksOrNull(remaining) === 'shooting') return remaining
  }
  throw new Error('Promise capacity enumerator: the phase owner has no shooting week')
})()
/** Skip at the admission week (1) + decrements down to the first Shooting count + the take sweep (1). */
export const FRESH_TAKE_OFFSET: number = 1 + (TUNING.PRODUCTION_TICKS - FIRST_SHOOTING_TICKS) + 1
/** 555 §1 exact wording. Drafting/review scripts and the stock door are fresh admissions too (555-B Q2/Q3). */
export const FRESH_ADMISSION_OMISSION =
  'any picture not started at source-now (Ready staffing alternatives, scripts in drafting/review, stock door, commissions) is not enumerated beyond the fresh-take floor'
/** The replay's own cut label (replay :2686-2687), applied to the enumerator's tariff. */
const ENUMERATOR_WORK_CUT = 'work limit before enumeration completed'
const STARTED_TRACE_KEY = 'enumerator:started'
const NOT_ENUMERATED: EnumerationCoverage = { existingCalendars: 'incomplete', allOwnerTraces: 'incomplete', omissions: [] }
const startedOmission = (productionId: string): string =>
  `started picture ${productionId}: lawful command timings and facility acquisition are not enumerated`

export type EnumeratedDomain = Readonly<{
  /** The ONE Started run: traces, fixed holds, cumulative bill (the tariff transferred in), producer omissions. */
  producer: ProducerResult
  /** The certificate over that run; both flags gated by the floor (555-B Q4). */
  enumeration: EnumerationCoverage
  floors: Readonly<{ freshTakeWeek: number }>
  /** The enumerator's own tariff `1 + N + W + N×T` (558), already inside `producer.preparationWork`. */
  work: number
}>

/**
 * Earliest week a started picture can record its first take, from the owners:
 * `now + (startTick >= now ? 1 : 0) + (remainingTicks − first Shooting count) + 1`.
 * Past the first Shooting week no NEW first take can be recorded (operations
 * :1680 is the sole take branch; replay :690), so the minimum over that empty
 * set is +Infinity, which makes condition (c) hold for every horizon.
 */
export function earliestStartedTakeWeek(now: number, picture: Pick<Production, 'startTick' | 'remainingTicks'>): number {
  invariant(Number.isSafeInteger(now) && Number.isSafeInteger(picture.startTick) && Number.isSafeInteger(picture.remainingTicks),
    'week and countdown must be safe integers')
  if (picture.remainingTicks < FIRST_SHOOTING_TICKS) return Number.POSITIVE_INFINITY
  return now + (picture.startTick >= now ? 1 : 0) + (picture.remainingTicks - FIRST_SHOOTING_TICKS) + 1
}

export function enumerateOwnerTraces(state: GameState, claims: CollectedClaims, limits: CapacityLimits): EnumeratedDomain {
  const now = state.market.tick
  invariant(claims.now.week === now && claims.now.step === 0, 'claims were collected on another calendar week')
  const floors = { freshTakeWeek: now + FRESH_TAKE_OFFSET }
  // (1) Rival issuer or absent industry: the rival omission is already on the claims; nothing is scanned, no producer runs.
  if (claims.coverage.claimsAndHolds !== 'complete') {
    return { producer: { fixedHolds: [], attempts: [], preparationWork: 1, omissions: [] }, enumeration: NOT_ENUMERATED, floors, work: 1 }
  }
  const pictures = state.studio.activeProductions, workflows = state.operations.workflows, takes = state.firstTakes
  // (2) The tariff, charged and saturated BEFORE any run (plan :316-318): the workflow index, then per picture one take scan.
  const work = 1 + pictures.length + workflows.length + pictures.length * takes.length
  if (work > limits.work) {
    return { producer: { fixedHolds: [], attempts: [], preparationWork: limits.work, omissions: [ENUMERATOR_WORK_CUT] },
      enumeration: NOT_ENUMERATED, floors, work }
  }
  const workflowById = new Map(workflows.map((row) => [row.productionId, row] as const))
  const omissions: string[] = []
  for (const picture of pictures) {
    const filmed = picture.remainingTicks < FIRST_SHOOTING_TICKS
      || takes.some((take) => take.productionId === picture.id && take.studioId === claims.issuerId)
    const workflow = workflowById.get(picture.id)
    const forced = workflow !== undefined && workflow.blocker === null && workflow.shootingTask?.status === 'scheduled'
    const bounded = earliestStartedTakeWeek(now, picture) >= claims.horizonEndWeek
    if (!(filmed || forced || bounded)) omissions.push(startedOmission(picture.id))
  }
  if (claims.horizonEndWeek > floors.freshTakeWeek) omissions.push(FRESH_ADMISSION_OMISSION)
  // (3) ONE Started run, always to claims.horizonEndWeek, seeded with the tariff; producer limits picked from the caller's.
  const producer = replayStartedProductionPlans<Production>({
    source: state, issuerId: claims.issuerId, claimPersonIds: claims.claimPersonIds,
    plans: [{ traceKey: STARTED_TRACE_KEY, commands: [] }], horizonEndWeek: claims.horizonEndWeek, preparationWork: work,
    limits: { work: limits.work, span: limits.span, alternatives: limits.alternatives },
  })
  // (4) The certificate. Never complete on a cut, a producer omission, an unforced started picture or a horizon past the floor.
  const complete = producer.attempts.length > 0 && producer.attempts.every((attempt) => attempt.kind === 'complete')
    && producer.omissions.length === 0 && omissions.length === 0
  const flag = complete ? 'complete' : 'incomplete'
  return { producer, enumeration: { existingCalendars: flag, allOwnerTraces: flag, omissions: [...new Set(omissions)].sort() }, floors, work }
}

/** collect → enumerate → assemble (5 args; `claims.work` added once there) → search → map. */
export function classifyEnumeratedOffer(state: GameState, draft: PromiseDraft, limits: CapacityLimits): DetachedOfferClassification {
  const claims = collectPromiseClaims(state, draft)
  const domain = enumerateOwnerTraces(state, claims, limits)
  const input = assembleCapacityInput(claims, domain.producer, claims.horizonEndWeek, limits, domain.enumeration)
  return mapCapacityResult(searchPromiseCapacityTraces(input), capacityInputsDigest(input))
}
