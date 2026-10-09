/**
 * P14B.4 detached owner adapter, FIRST slice (record 539 §1 adopted law; record
 * 540 RED). Pure and detached: it collects one draft's promise claims, assembles
 * the kernel's joint-trace input over a producer RESULT, digests that input and
 * maps the kernel's proof class. It never runs a producer, never reads cash,
 * RNG or history, and mutates nothing.
 *
 * Still NOT here after the later slices (539 §2 as they left it): no enumerator
 * in this module — the ENUMERATOR slice (record 555; `promiseCapacityEnumerator.ts`)
 * imports it, runs ONE Started plan through `promiseCapacityOwnerReplay.ts`
 * (bills reduced and re-measured at records 583/597) and hands its certificate
 * to the 5-arity `assembleCapacityInput`, while the 4-arity default
 * (`classifyDetachedOffer`) still carries `existingCalendars`/`allOwnerTraces`
 * 'incomplete' with the fixed omission; no live importer (neither this module
 * nor the enumerator is re-exported from index.ts; the live evaluator 4 of
 * record 600 lives in promises.ts); no version stamp or receipt fields
 * (`rulesVersion`/`week` remain absent from `DetachedOfferClassification`); no
 * Save/projection change; no kernel or producer change from this module.
 */
import { fnv1a64 } from './math.js'
import { promiseCastSlots, qualifyingTakes, type PromiseDraft } from './promises.js'
import {
  searchPromiseCapacityTraces,
  type Boundary, type CapacityKernelResult, type FixedHold, type ForeignDebit, type JointOwnerTrace,
  type JointTraceCapacityInput, type JointTraceCapacityResult, type PriorClaim,
} from './promiseCapacityKernel.js'
import type { GameStateV30, ProfessionalPromiseV30, PromiseClassification } from './types.js'

/** Plan :125-126, exact: every UNCERTIFIED kernel result is FRAGILE with this bottleneck. */
export const UNCERTIFIED_BOTTLENECK = 'bounded capacity analysis could not certify this schedule'
/** This slice supplies explicit plans only; the omission is carried on every assembled input. */
export const NO_ENUMERATOR_OMISSION = 'explicit supplied plans only; owner alternatives are not enumerated'
const RIVAL_OMISSION = 'claims are collected for the player studio only; rival policy is not replayed'
const HORIZON_GUARD = 'producer horizon precedes the latest relevant due week; run the producer to claims.horizonEndWeek'
const FRAGILE_BOTTLENECK = {
  achievableProbeFailed: 'the promised count fits, but no schedule keeps a spare picture, existing paths and slack together',
  priorPathProtection: 'the promised count fits only by moving an earlier promise off its existing path',
} as const
const IMPOSSIBLE_BOTTLENECK = {
  completeCountFailure: 'no lawful joint schedule reaches the promised count inside the window',
  certifiedUpperBound: 'a certified upper bound on qualifying pictures is below the promised count',
} as const

export type ClaimSource = Pick<GameStateV30, 'promises' | 'firstTakes' | 'talentMarket' | 'market' | 'hollywood'>
export type CapacityLimits = JointTraceCapacityInput['limits']
export type CollectedClaims = Readonly<{
  issuerId: string
  /** The ONE calendar: `{ market.tick, 0 }`, never the draft's contract start. */
  now: Boundary
  target: JointTraceCapacityInput['target']
  /** Same issuer, ANY beneficiary (plan :94, :258-259); sorted by promiseId. */
  priorClaims: readonly PriorClaim[]
  /** Other issuers, the TARGET person only (plan :95, :262-263); sorted by promiseId. */
  foreignDebits: readonly ForeignDebit[]
  /** Sorted unique: the target person plus every prior claim's person; the producers' `claimPersonIds`. */
  claimPersonIds: readonly string[]
  /** max(target due, prior-claim dues): the span law's latest relevant due-exclusive week. */
  horizonEndWeek: number
  coverage: Readonly<{ claimsAndHolds: 'complete' | 'incomplete'; omissions: readonly string[] }>
  /** Collection tariff `1 + P + A + M×T` (plan :316-318), added to `preparationWork` at assembly. */
  work: number
}>
/** Structural: `ReadyOwnerReplayResult` and `StartedOwnerReplayResult<P>` both satisfy it. */
export type ProducerResult = Readonly<{
  fixedHolds: readonly FixedHold[]
  attempts: readonly (
    | Readonly<{ kind: 'complete'; trace: JointOwnerTrace }>
    | Readonly<{ kind: 'cut'; traceKey: string; reason: string; detail: string }>
  )[]
  preparationWork: number
  omissions: readonly string[]
}>
/** Deliberately NOT a `PromiseFeasibilityReceipt`: no `rulesVersion`, no `week` (D1 open). */
export type DetachedOfferClassification = Readonly<{
  classification: PromiseClassification
  /** null iff REASONABLY_ACHIEVABLE (types.ts:2158-2159 law). */
  bottleneck: string | null
  inputsDigest: string
  kernel: Readonly<{
    status: CapacityKernelResult['status']; reason: string | null; workUsed: number
    omissions: readonly string[]; scope?: 'jointOfferOnly'
  }>
}>

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Promise capacity owners: ${message}`)
}
function compareText(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0 }

/**
 * Membership is B3's `activePromiseReservations` law (promises.ts:274-283: open
 * AND (bound OR attached), self excluded) under the kernel's half-open overlap
 * predicate (`overlapWindow`, kernel :162-165), widened to every beneficiary of
 * the issuing studio and narrowed to other issuers' claims on the target person.
 */
export function collectPromiseClaims(state: ClaimSource, draft: PromiseDraft): CollectedClaims {
  const window = { startWeek: draft.windowStartWeek, dueWeekExclusive: draft.dueWeekExclusive }
  invariant(Number.isSafeInteger(window.startWeek) && Number.isSafeInteger(window.dueWeekExclusive)
    && window.startWeek < window.dueWeekExclusive, 'target window must be a nonempty half-open integer interval')
  invariant(Number.isSafeInteger(draft.predicate.count) && draft.predicate.count >= 1, 'target count must be a positive integer')
  const named = draft.promiseId === undefined ? null : state.promises.find((p) => p.promiseId === draft.promiseId) ?? null
  invariant(draft.promiseId === undefined || named !== null, `target promiseId "${String(draft.promiseId)}" names no minted root`)
  const issuerId = draft.issuerStudioId
  const now: Boundary = { week: state.market.tick, step: 0 }
  let scans = 0 // members whose first takes were scanned: the M of the tariff
  const qualified = (promise: ProfessionalPromiseV30): number => { scans += 1; return qualifyingTakes(state, promise).length }
  const boundRoot = named !== null && named.contractId !== null ? named : null
  const target: JointTraceCapacityInput['target'] = {
    promiseId: draft.promiseId ?? null, personId: draft.beneficiaryPersonId, mask: promiseCastSlots(draft), window,
    state: boundRoot === null ? 'unbound' : 'bound', count: draft.predicate.count,
    actualQualifiedCount: boundRoot === null ? 0 : qualified(boundRoot),
  }
  const takes = state.firstTakes.length
  if (state.hollywood === null || issuerId !== state.hollywood.playerStudioId) {
    return { issuerId, now, target, priorClaims: [], foreignDebits: [], claimPersonIds: [draft.beneficiaryPersonId],
      horizonEndWeek: window.dueWeekExclusive, coverage: { claimsAndHolds: 'incomplete', omissions: [RIVAL_OMISSION] },
      work: 1 + scans * takes }
  }
  const attached = new Set(state.talentMarket.proposals.flatMap((proposal) => proposal.promises))
  const attachedCount = state.talentMarket.proposals.reduce((n, proposal) => n + proposal.promises.length, 0)
  const from = Math.max(now.week, window.startWeek)
  const priorClaims: PriorClaim[] = [], foreignDebits: ForeignDebit[] = []
  for (const promise of state.promises) {
    const member = promise.outcome === null
      && (promise.contractId !== null || attached.has(promise.promiseId))
      && promise.promiseId !== draft.promiseId
      && promise.dueWeekExclusive > from && promise.windowStartWeek < window.dueWeekExclusive
    if (!member) continue
    // Zero demand is excluded exactly (never served, reserves no seat); the kernel would refuse an empty window.
    if (promise.windowStartWeek >= promise.dueWeekExclusive || promise.predicate.count < 1) continue
    const membership: PriorClaim['membership'] = promise.contractId !== null ? 'bound' : 'current'
    const identity = { promiseId: promise.promiseId, issuerId: promise.issuerStudioId, personId: promise.beneficiaryPersonId, membership }
    const sourceWindow = { startWeek: promise.windowStartWeek, dueWeekExclusive: promise.dueWeekExclusive }
    if (promise.issuerStudioId === issuerId) {
      // Bound: fresh evidence (plan :273-275). Current: B3's conservative full-count debit (promises.ts:287).
      const remaining = membership === 'bound' ? Math.max(0, promise.predicate.count - qualified(promise)) : promise.predicate.count
      priorClaims.push({ ...identity, mask: promiseCastSlots(promise), window: sourceWindow, remaining })
    } else if (promise.beneficiaryPersonId === draft.beneficiaryPersonId) {
      foreignDebits.push({ ...identity, sourceWindow, remaining: promise.predicate.count }) // plan :262-263
    }
  }
  priorClaims.sort((a, b) => compareText(a.promiseId, b.promiseId))
  foreignDebits.sort((a, b) => compareText(a.promiseId, b.promiseId))
  const claimPersonIds = [...new Set([draft.beneficiaryPersonId, ...priorClaims.map((claim) => claim.personId)])].sort(compareText)
  const horizonEndWeek = priorClaims.reduce((horizon, claim) => Math.max(horizon, claim.window.dueWeekExclusive), window.dueWeekExclusive)
  return { issuerId, now, target, priorClaims, foreignDebits, claimPersonIds, horizonEndWeek,
    coverage: { claimsAndHolds: 'complete', omissions: [] },
    work: 1 + state.promises.length + attachedCount + scans * takes }
}

/** The enumerator's certificate over calendars and traces (record 555 §1); the kernel's own flag and omission shape. */
export type EnumerationCoverage = Pick<JointTraceCapacityInput['coverage'], 'existingCalendars' | 'allOwnerTraces' | 'omissions'>
/** No enumerator ran: today's coverage byte-for-byte. Deliberately not exported (555 §1). */
const NO_ENUMERATION: EnumerationCoverage = { existingCalendars: 'incomplete', allOwnerTraces: 'incomplete', omissions: [NO_ENUMERATOR_OMISSION] }

/**
 * The first-take test's hand assembly with coverage DERIVED: `claimsAndHolds`
 * complete iff claims complete, every attempt complete and no producer
 * omission; calendars and traces carry the supplied certificate (by default
 * incomplete with the fixed omission). Holds and traces are copied by
 * reference; the producers already clip to the interval. `limits` is
 * re-literalled in the kernel's MAX_LIMITS key order (553-R item 1) so the
 * digest never depends on a caller's literal order.
 */
export function assembleCapacityInput(claims: CollectedClaims, producer: ProducerResult,
  horizonEndWeek: number, limits: CapacityLimits, enumeration: EnumerationCoverage = NO_ENUMERATION): JointTraceCapacityInput {
  const traces: JointOwnerTrace[] = [], cuts: string[] = []
  for (const attempt of producer.attempts) {
    if (attempt.kind === 'complete') traces.push(attempt.trace)
    else cuts.push(`${attempt.reason}: ${attempt.detail}`)
  }
  // The kernel's validateTraces (:511) is an input invariant, not a cap: a complete unknown-release
  // trace must cover the effective horizon, and the target window is never clipped to make it so.
  invariant(traces.length === 0 || horizonEndWeek >= claims.horizonEndWeek, HORIZON_GUARD)
  const complete = claims.coverage.claimsAndHolds === 'complete' && cuts.length === 0 && producer.omissions.length === 0
  const omissions = [...new Set([...claims.coverage.omissions, ...producer.omissions, ...cuts, ...enumeration.omissions])].sort(compareText)
  return {
    mode: 'jointOwnerTraces', now: claims.now, horizonEndWeek, issuerId: claims.issuerId, target: claims.target,
    priorClaims: claims.priorClaims, foreignDebits: claims.foreignDebits, traces, fixedHolds: producer.fixedHolds,
    coverage: { claimsAndHolds: complete ? 'complete' : 'incomplete', existingCalendars: enumeration.existingCalendars,
      allOwnerTraces: enumeration.allOwnerTraces, omissions },
    preparationWork: producer.preparationWork + claims.work,
    limits: { claims: limits.claims, units: limits.units, alternatives: limits.alternatives, work: limits.work, span: limits.span },
  }
}

/** Identity of the question, not of the bill: `preparationWork` is excluded (539-B Q6; the Ready
 * producer's bill walks ledger and history rows, plan :73-76). `kernel.workUsed` carries the bill. */
export function capacityInputsDigest(input: JointTraceCapacityInput): string {
  const { preparationWork: _bill, ...identity } = input
  return fnv1a64(JSON.stringify(identity))
}

export function mapCapacityResult(result: CapacityKernelResult | JointTraceCapacityResult, inputsDigest: string): DetachedOfferClassification {
  const kernel = { status: result.status, reason: 'reason' in result ? result.reason : null, workUsed: result.workUsed,
    omissions: 'omissions' in result ? [...result.omissions] : [] }
  switch (result.status) {
    case 'CERTIFIED_ACHIEVABLE':
    case 'ALREADY_MET': // plan :276-277: met, not a failed probe; the read settles nothing
      return { classification: 'REASONABLY_ACHIEVABLE', bottleneck: null, inputsDigest, kernel }
    case 'PROVEN_FRAGILE':
      return { classification: 'FRAGILE', bottleneck: FRAGILE_BOTTLENECK[result.reason], inputsDigest, kernel }
    case 'PROVEN_IMPOSSIBLE': // the OFFER only; never causal outcome evidence
      return { classification: 'IMPOSSIBLE', bottleneck: IMPOSSIBLE_BOTTLENECK[result.reason], inputsDigest, kernel: { ...kernel, scope: result.scope } }
    case 'UNCERTIFIED':
      return { classification: 'FRAGILE', bottleneck: UNCERTIFIED_BOTTLENECK, inputsDigest, kernel }
  }
}

export function classifyDetachedOffer(claims: CollectedClaims, producer: ProducerResult,
  horizonEndWeek: number, limits: CapacityLimits): DetachedOfferClassification {
  const input = assembleCapacityInput(claims, producer, horizonEndWeek, limits)
  return mapCapacityResult(searchPromiseCapacityTraces(input), capacityInputsDigest(input))
}
