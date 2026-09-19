/**
 * Detached, finite promise-capacity search. Inputs are owner-certified whole
 * picture alternatives, not forecasts or permission to invent a game action.
 * A result concerns the joint offer only; it is never causal outcome evidence.
 */
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T

export type Slot = 'lead' | 'antagonist' | 'support'
export type Mask = readonly Slot[]
export type Boundary = Readonly<{ week: number; step: number }>
export type Window = Readonly<{ startWeek: number; dueWeekExclusive: number }>
export type HoldSubject =
  | Readonly<{ kind: 'person'; personId: string }>
  | Readonly<{ kind: 'resource'; resourceKey: string; slot: number }>
export type Hold = DeepReadonly<{
  holdId: string; ownerKey: string; ownerPathKey: string | null
  subject: HoldSubject; from: Boundary; until: Boundary
}>
export type FixedHold = Hold & Readonly<{ replaceableFrom: Boundary | null }>
export type HoldReplacement = Readonly<{ holdId: string; newUntil: Boundary }>
export type PriorClaim = DeepReadonly<{
  promiseId: string; issuerId: string; personId: string
  membership: 'bound' | 'current'; mask: Mask; window: Window; remaining: number
}>
export type ForeignDebit = DeepReadonly<{
  promiseId: string; issuerId: string; personId: string
  membership: 'bound' | 'current'; sourceWindow: Window; remaining: number
}>
export type PictureAlternative = DeepReadonly<{
  key: string; pathKey: string; issuerId: string; existingPath: boolean
  greenlight: Boundary; firstTake: Boundary | null; personRelease: Boundary
  cast: Record<Slot, string>; staffingWitnessKey: string
  additionalHolds: readonly Hold[]; holdReplacements: readonly HoldReplacement[]
  ownerFactRefs: readonly string[]
}>
export type DomainCoverage = DeepReadonly<{
  claimsAndHolds: 'complete' | 'incomplete'
  existingAlternatives: 'complete' | 'incomplete'
  allAlternatives: 'complete' | 'incomplete'; omissions: readonly string[]
}>
export type CapacityKernelInput = DeepReadonly<{
  now: Boundary; horizonEndWeek: number; issuerId: string
  target: {
    promiseId: string | null; personId: string; mask: Mask; window: Window
    state: 'unbound' | 'bound'; count: number; actualQualifiedCount: number
  }
  priorClaims: readonly PriorClaim[]; foreignDebits: readonly ForeignDebit[]
  alternatives: readonly PictureAlternative[]; fixedHolds: readonly FixedHold[]
  coverage: DomainCoverage; preparationWork: number
  limits: { claims: number; units: number; alternatives: number; work: number; span: number }
}>
export type DemandKey = readonly ['target'] | readonly ['prior', string]
  | readonly ['foreignDebit', string]
export type Credit = DeepReadonly<{ demandKey: DemandKey; pathKey: string; slot: Slot }>
export type Witness = DeepReadonly<{
  selectedAlternativeKeys: readonly string[]; credits: readonly Credit[]
  targetTakeBoundaries: readonly Boundary[]
}>
export type PriorProfile = DeepReadonly<{
  existingUnits: number
  cumulativeByBoundary: readonly { boundary: Boundary; units: number }[]
}>
export type CapacityKernelResult = DeepReadonly<(
  | { status: 'ALREADY_MET'; remaining: 0 }
  | { status: 'CERTIFIED_ACHIEVABLE'; remaining: number; bufferDemand: number
      priorOptimum: PriorProfile; witness: Witness }
  | { status: 'PROVEN_FRAGILE'; reason: 'achievableProbeFailed' | 'priorPathProtection'
      priorOptimum: PriorProfile; countWitness: Witness }
  | { status: 'PROVEN_IMPOSSIBLE'; scope: 'jointOfferOnly'
      reason: 'completeCountFailure' | 'certifiedUpperBound'; upperBound?: number }
  | { status: 'UNCERTIFIED'; reason: 'domainIncomplete' | 'workLimit' | 'sizeLimit'
      omissions: readonly string[] }
) & { workUsed: number }>

const SLOTS: readonly Slot[] = ['lead', 'antagonist', 'support']
const MAX_LIMITS = { claims: 32, units: 64, alternatives: 1024, work: 200000, span: 220 } as const

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Promise capacity input: ${message}`)
}
function integer(value: unknown, name: string): asserts value is number {
  invariant(typeof value === 'number' && Number.isSafeInteger(value) && value >= 0,
    `${name} must be a nonnegative safe integer`)
}
function record(value: unknown, name: string): asserts value is Record<string, unknown> {
  invariant(value !== null && typeof value === 'object' && !Array.isArray(value), `${name} must be an object`)
}
function string(value: unknown, name: string): asserts value is string {
  invariant(typeof value === 'string' && value.length > 0, `${name} must be a nonempty string`)
}
function array(value: unknown, name: string): asserts value is readonly unknown[] {
  invariant(Array.isArray(value), `${name} must be an array`)
}
function compareBoundary(a: Boundary, b: Boundary): number {
  return a.week < b.week ? -1 : a.week > b.week ? 1 : a.step < b.step ? -1 : a.step > b.step ? 1 : 0
}
function compareText(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0 }
function boundary(value: unknown): Boundary {
  record(value, 'boundary')
  integer(value.week, 'week'); integer(value.step, 'step')
  return { week: value.week, step: value.step }
}
function windowValue(value: unknown): Window {
  record(value, 'window')
  integer(value.startWeek, 'window start'); integer(value.dueWeekExclusive, 'window due')
  invariant(value.startWeek < value.dueWeekExclusive, 'window must be nonempty')
  return { startWeek: value.startWeek, dueWeekExclusive: value.dueWeekExclusive }
}
function maskValue(value: unknown): Mask {
  array(value, 'mask')
  invariant(value.length >= 1 && value.length <= 3 && new Set(value).size === value.length,
    'mask must not repeat slots')
  const result = SLOTS.filter(slot => value.includes(slot))
  invariant(result.length === value.length && result.every((slot, index) => slot === SLOTS[index]),
    'mask must be lead, lead/antagonist, or all three slots')
  return result
}
function membership(value: unknown): asserts value is 'bound' | 'current' {
  invariant(value === 'bound' || value === 'current', 'claim must be bound or current')
}
function overlapWindow(source: Window, now: Boundary, target: Window): boolean {
  return source.dueWeekExclusive > Math.max(now.week, target.startWeek)
    && source.startWeek < target.dueWeekExclusive
}

class WorkLimit extends Error {}
class Budget {
  used: number
  phase: 'normalization' | 'search' = 'normalization'
  constructor(readonly limit: number, preparation: number) {
    this.used = Math.min(preparation, limit)
  }
  charge(units = 1): void {
    if (units > this.limit - this.used) { this.used = this.limit; throw new WorkLimit() }
    this.used += units
  }
  sorting(length: number): void {
    if (length < 2) return
    const factor = 4 * Math.ceil(Math.log2(length))
    if (length > Math.floor((this.limit - this.used) / factor)) {
      this.used = this.limit; throw new WorkLimit()
    }
    this.charge(length * factor)
  }
}

/** Scan before semantic validation/sorting so truncation is permutation neutral. */
function scan(value: unknown, budget: Budget, ancestors = new Set<object>()): void {
  if (value === null || typeof value !== 'object') {
    budget.charge()
    if (typeof value === 'string') budget.charge(value.length)
    return
  }
  budget.charge() // Also bound empty containers and nesting, not just scalar leaves.
  invariant(!ancestors.has(value), 'cyclic input')
  ancestors.add(value)
  if (Array.isArray(value)) {
    budget.charge(value.length)
    budget.sorting(value.length)
    for (const element of value) scan(element, budget, ancestors)
  } else for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) scan((value as Record<string, unknown>)[key], budget, ancestors)
  }
  ancestors.delete(value)
}

/** Bottom-up merge sort: at most n*ceil(log2(n)) comparisons; no engine-sort variability. */
function sorted<T>(values: readonly T[], compare: (a: T, b: T) => number): T[] {
  let source = [...values], destination = new Array<T>(values.length)
  for (let width = 1; width < source.length; width *= 2) {
    for (let start = 0; start < source.length; start += width * 2) {
      const middle = Math.min(start + width, source.length), end = Math.min(start + width * 2, source.length)
      let left = start, right = middle
      for (let out = start; out < end; out++) {
        if (left < middle && (right >= end || compare(source[left]!, source[right]!) <= 0)) {
          destination[out] = source[left++]!
        } else destination[out] = source[right++]!
      }
    }
    const swap = source; source = destination; destination = swap
  }
  return source
}
function keyed<T>(values: readonly T[], key: (value: T) => string): T[] {
  return sorted(values.map(value => ({ value, key: key(value) })), (a, b) => compareText(a.key, b.key)).map(row => row.value)
}
function holdValue(value: unknown): Hold {
  record(value, 'hold')
  string(value.holdId, 'hold id'); string(value.ownerKey, 'hold owner')
  invariant(value.ownerPathKey === null || typeof value.ownerPathKey === 'string' && value.ownerPathKey.length > 0,
    'hold path must be an identity or null')
  record(value.subject, 'hold subject')
  let subject: HoldSubject
  if (value.subject.kind === 'person') {
    string(value.subject.personId, 'held person')
    subject = { kind: 'person', personId: value.subject.personId }
  } else {
    invariant(value.subject.kind === 'resource', 'unknown hold subject')
    string(value.subject.resourceKey, 'resource key'); integer(value.subject.slot, 'resource slot')
    subject = { kind: 'resource', resourceKey: value.subject.resourceKey, slot: value.subject.slot }
  }
  const from = boundary(value.from), until = boundary(value.until)
  invariant(compareBoundary(from, until) <= 0, 'hold interval is reversed')
  return { holdId: value.holdId, ownerKey: value.ownerKey, ownerPathKey: value.ownerPathKey, subject, from, until }
}
function holdKey(hold: Hold): string {
  return JSON.stringify([hold.subject, hold.from, hold.until, hold.ownerKey, hold.ownerPathKey, hold.holdId])
}
function alternativeKey(value: PictureAlternative): string {
  return JSON.stringify([value.firstTake, value.greenlight, value.personRelease, value.existingPath,
    value.cast, value.additionalHolds, value.holdReplacements, value.staffingWitnessKey,
    value.ownerFactRefs, value.issuerId, value.pathKey, value.key])
}

function normalize(input: CapacityKernelInput): CapacityKernelInput {
  const now = boundary(input.now)
  integer(input.horizonEndWeek, 'horizon'); invariant(input.horizonEndWeek >= now.week, 'horizon precedes now')
  string(input.issuerId, 'issuer'); record(input.target, 'target')
  const target = input.target
  invariant(target.promiseId === null || typeof target.promiseId === 'string' && target.promiseId.length > 0,
    'target identity must be a string or null')
  string(target.personId, 'target person'); integer(target.count, 'target count')
  invariant(target.count > 0, 'target count must be positive')
  integer(target.actualQualifiedCount, 'actual qualified count')
  invariant(target.state === 'bound' || target.state === 'unbound', 'unknown target binding')
  const targetWindow = windowValue(target.window), targetMask = maskValue(target.mask)
  array(input.priorClaims, 'prior claims'); array(input.foreignDebits, 'foreign debits')
  array(input.fixedHolds, 'fixed holds'); array(input.alternatives, 'alternatives')
  const sourceIds = new Set<string>()
  const identity = (value: PriorClaim | ForeignDebit): void => {
    record(value, 'claim'); string(value.promiseId, 'promise id'); string(value.issuerId, 'claim issuer')
    string(value.personId, 'claim person'); membership(value.membership); integer(value.remaining, 'remaining count')
    invariant(!sourceIds.has(value.promiseId), 'duplicate prior/debit source identity'); sourceIds.add(value.promiseId)
  }
  const priorClaims = keyed(input.priorClaims.map(value => {
    identity(value)
    invariant(value.issuerId === input.issuerId && value.promiseId !== target.promiseId, 'prior must be local and self excluded')
    const claimWindow = windowValue(value.window)
    invariant(overlapWindow(claimWindow, now, targetWindow), 'prior must overlap the relevant target interval')
    return { ...value, mask: maskValue(value.mask), window: claimWindow }
  }), value => JSON.stringify([value.window, value.mask, value.remaining, value.membership, value.personId, value.issuerId, value.promiseId]))
  const foreignDebits = keyed(input.foreignDebits.map(value => {
    identity(value)
    return { ...value, sourceWindow: windowValue(value.sourceWindow) }
  }), value => JSON.stringify([value.sourceWindow, value.remaining, value.membership, value.personId, value.issuerId, value.promiseId]))
  const fixedIds = new Map<string, FixedHold>()
  const fixedHolds = keyed(input.fixedHolds.map(value => {
    const hold = holdValue(value)
    const replaceableFrom = value.replaceableFrom === null ? null : boundary(value.replaceableFrom)
    if (replaceableFrom !== null) {
      invariant(compareBoundary(hold.from, replaceableFrom) <= 0 && compareBoundary(replaceableFrom, hold.until) <= 0
        && compareBoundary(now, replaceableFrom) <= 0, 'replaceable suffix must preserve the past and immutable prefix')
    }
    invariant(!fixedIds.has(hold.holdId), 'duplicate fixed hold identity')
    const result = { ...hold, replaceableFrom }; fixedIds.set(hold.holdId, result)
    return result
  }), value => JSON.stringify([holdKey(value), value.replaceableFrom]))
  const alternativeIds = new Set<string>(), addedHoldPaths = new Map<string, string>()
  const pathKinds = new Map<string, boolean>()
  const alternatives = keyed(input.alternatives.map(value => {
    record(value, 'alternative'); string(value.key, 'alternative key'); string(value.pathKey, 'path key')
    invariant(!alternativeIds.has(value.key), 'duplicate alternative identity'); alternativeIds.add(value.key)
    invariant(value.issuerId === input.issuerId, 'alternative must belong to local issuer')
    invariant(typeof value.existingPath === 'boolean', 'existing path flag must be boolean')
    invariant(!pathKinds.has(value.pathKey) || pathKinds.get(value.pathKey) === value.existingPath,
      'one path cannot be both existing and hypothetical')
    pathKinds.set(value.pathKey, value.existingPath)
    const greenlight = boundary(value.greenlight), personRelease = boundary(value.personRelease)
    const firstTake = value.firstTake === null ? null : boundary(value.firstTake)
    invariant(compareBoundary(greenlight, personRelease) <= 0, 'release precedes greenlight')
    if (firstTake !== null) invariant(compareBoundary(greenlight, firstTake) <= 0
      && compareBoundary(firstTake, personRelease) <= 0 && compareBoundary(now, firstTake) <= 0,
    'take must be a future event inside the actual picture calendar')
    record(value.cast, 'cast')
    for (const slot of SLOTS) string(value.cast[slot], 'cast person')
    invariant(new Set(SLOTS.map(slot => value.cast[slot])).size === 3, 'one person cannot occupy multiple cast seats')
    string(value.staffingWitnessKey, 'staffing witness'); array(value.ownerFactRefs, 'owner facts')
    invariant(value.ownerFactRefs.length > 0, 'alternative needs owner facts')
    for (const ref of value.ownerFactRefs) string(ref, 'owner fact')
    array(value.additionalHolds, 'additional holds'); array(value.holdReplacements, 'hold replacements')
    const additionalIds = new Set<string>()
    const additionalHolds = keyed(value.additionalHolds.map(raw => {
      const hold = holdValue(raw)
      invariant(!fixedIds.has(hold.holdId) && !additionalIds.has(hold.holdId), 'duplicate additional hold identity')
      invariant(!addedHoldPaths.has(hold.holdId) || addedHoldPaths.get(hold.holdId) === value.pathKey,
        'additional hold identity shared by different paths')
      additionalIds.add(hold.holdId); addedHoldPaths.set(hold.holdId, value.pathKey)
      return hold
    }), holdKey)
    const replaced = new Set<string>()
    const holdReplacements = keyed(value.holdReplacements.map(raw => {
      record(raw, 'hold replacement'); string(raw.holdId, 'replacement identity')
      invariant(!replaced.has(raw.holdId), 'duplicate replacement'); replaced.add(raw.holdId)
      const original = fixedIds.get(raw.holdId), newUntil = boundary(raw.newUntil)
      invariant(original !== undefined && original.replaceableFrom !== null && original.ownerPathKey === value.pathKey,
        'replacement must name this path\'s replaceable fixed hold')
      invariant(compareBoundary(original.replaceableFrom, newUntil) <= 0 && compareBoundary(newUntil, original.until) <= 0,
        'replacement changes immutable prefix or extends original hold')
      return { holdId: raw.holdId, newUntil }
    }), value => JSON.stringify([value.newUntil, value.holdId]))
    return { key: value.key, pathKey: value.pathKey, issuerId: value.issuerId, existingPath: value.existingPath,
      greenlight, firstTake, personRelease, cast: { lead: value.cast.lead, antagonist: value.cast.antagonist, support: value.cast.support },
      staffingWitnessKey: value.staffingWitnessKey, ownerFactRefs: sorted(value.ownerFactRefs, compareText), additionalHolds, holdReplacements }
  }), alternativeKey)
  record(input.coverage, 'coverage')
  for (const name of ['claimsAndHolds', 'existingAlternatives', 'allAlternatives'] as const) {
    invariant(input.coverage[name] === 'complete' || input.coverage[name] === 'incomplete', 'unknown coverage status')
  }
  array(input.coverage.omissions, 'coverage omissions')
  for (const omission of input.coverage.omissions) string(omission, 'omission')
  return { ...input, now, target: { ...target, mask: targetMask, window: targetWindow }, priorClaims, foreignDebits,
    fixedHolds, alternatives, coverage: { ...input.coverage, omissions: sorted(input.coverage.omissions, compareText) } }
}

type Demand = {
  key: DemandKey; personId: string; mask: Mask; window: Window; units: number
}
type Alternative = {
  value: PictureAlternative; eligible: readonly (readonly number[])[]; profileIndex: number
}
type Path = { key: string; alternatives: Alternative[] }
type Model = {
  input: CapacityKernelInput; demands: Demand[]; targetIndex: number
  boundaries: Boundary[]; paths: Path[]; suffixPotential: number[][]
}
type AssignedCredit = { demand: number; alternative: Alternative; slot: Slot }
type Solution = { profile: number[]; witness: Witness }
type SearchOptions = {
  targetUnits: number; protectedProfile?: readonly number[]
  optimize?: boolean; stopProfile?: readonly number[]; achievable?: boolean; remaining: number
}

function boundaryKey(value: Boundary): string { return JSON.stringify([value.week, value.step]) }

function prepare(input: CapacityKernelInput, debits: readonly ForeignDebit[], budget: Budget): Model {
  const demands: Demand[] = []
  for (const claim of input.priorClaims) {
    budget.charge()
    demands.push({ key: ['prior', claim.promiseId], personId: claim.personId, mask: claim.mask,
      window: claim.window, units: claim.remaining })
  }
  for (const debit of debits) {
    budget.charge()
    demands.push({ key: ['foreignDebit', debit.promiseId], personId: debit.personId, mask: SLOTS,
      window: input.target.window, units: debit.remaining })
  }
  const targetIndex = demands.length
  demands.push({ key: ['target'], personId: input.target.personId, mask: input.target.mask,
    window: input.target.window, units: 0 })
  const distinctBoundaries = new Map<string, Boundary>()
  for (const alternative of input.alternatives) {
    budget.charge()
    if (alternative.existingPath && alternative.firstTake !== null) {
      distinctBoundaries.set(boundaryKey(alternative.firstTake), alternative.firstTake)
    }
  }
  budget.sorting(distinctBoundaries.size)
  const boundaries = sorted([...distinctBoundaries.values()], compareBoundary)
  const boundaryIndices = new Map<string, number>()
  for (let index = 0; index < boundaries.length; index++) {
    budget.charge(); boundaryIndices.set(boundaryKey(boundaries[index]!), index)
  }
  const byPath = new Map<string, Path>()
  for (const value of input.alternatives) {
    budget.charge()
    const eligible: number[][] = SLOTS.map(() => [])
    if (value.firstTake !== null) {
      for (let slotIndex = 0; slotIndex < SLOTS.length; slotIndex++) {
        const slot = SLOTS[slotIndex]!
        for (let demandIndex = 0; demandIndex < demands.length; demandIndex++) {
          budget.charge()
          const demand = demands[demandIndex]!
          if (demand.personId === value.cast[slot] && demand.mask.includes(slot)
            && value.firstTake.week >= demand.window.startWeek && value.firstTake.week < demand.window.dueWeekExclusive) {
            eligible[slotIndex]!.push(demandIndex)
          }
        }
      }
    }
    // An uncredited alternative without a replacement only adds constraints.
    // Release-only continuations are retained even though their event is null.
    if (eligible.every(list => list.length === 0) && value.holdReplacements.length === 0) continue
    const alternative: Alternative = { value, eligible,
      profileIndex: value.existingPath && value.firstTake !== null ? boundaryIndices.get(boundaryKey(value.firstTake))! : -1 }
    let path = byPath.get(value.pathKey)
    if (path === undefined) { path = { key: value.pathKey, alternatives: [] }; byPath.set(value.pathKey, path) }
    path.alternatives.push(alternative)
  }
  budget.sorting(byPath.size)
  const paths = keyed([...byPath.values()], path => JSON.stringify([alternativeKey(path.alternatives[0]!.value), path.key]))
  budget.charge((paths.length + 1) * (demands.length + 1))
  const suffixPotential = Array.from({ length: paths.length + 1 }, () => new Array<number>(demands.length).fill(0))
  for (let position = paths.length - 1; position >= 0; position--) {
    const possible = new Set<number>()
    for (const alternative of paths[position]!.alternatives) for (const seats of alternative.eligible) for (const demand of seats) {
      budget.charge(); possible.add(demand)
    }
    for (let demand = 0; demand < demands.length; demand++) {
      budget.charge()
      suffixPotential[position]![demand] = suffixPotential[position + 1]![demand]! + (possible.has(demand) ? 1 : 0)
    }
  }
  return { input, demands, targetIndex, boundaries, paths, suffixPotential }
}

/** Independent, optimistic per-demand path bounds; attaining ALL entries proves the full profile. */
function priorUpperProfile(model: Model, budget: Budget): number[] {
  budget.charge(model.boundaries.length + 1)
  const upper = new Array<number>(model.boundaries.length + 1).fill(0)
  for (let demand = 0; demand < model.targetIndex; demand++) {
    budget.charge(model.boundaries.length + 1)
    const units = model.demands[demand]!.units, buckets = new Array<number>(model.boundaries.length).fill(0)
    let paths = 0
    for (const path of model.paths) {
      budget.charge()
      let earliest = -1
      for (const alternative of path.alternatives) {
        budget.charge()
        if (alternative.profileIndex < 0) continue
        let eligible = false
        for (const seat of alternative.eligible) for (const candidate of seat) {
          budget.charge()
          if (candidate === demand) eligible = true
        }
        if (eligible && (earliest < 0 || alternative.profileIndex < earliest)) earliest = alternative.profileIndex
      }
      if (earliest >= 0) { buckets[earliest] = buckets[earliest]! + 1; paths++ }
    }
    upper[0] = upper[0]! + Math.min(units, paths)
    let cumulative = 0
    for (let index = 0; index < buckets.length; index++) {
      budget.charge(); cumulative += buckets[index]!
      upper[index + 1] = upper[index + 1]! + Math.min(units, cumulative)
    }
  }
  return upper
}
function compareProfile(a: readonly number[], b: readonly number[], budget: Budget): number {
  for (let index = 0; index < a.length; index++) {
    budget.charge()
    if (a[index]! < b[index]!) return -1
    if (a[index]! > b[index]!) return 1
  }
  return 0
}
function publicProfile(vector: readonly number[], boundaries: readonly Boundary[], budget: Budget): PriorProfile {
  budget.charge(boundaries.length + 1)
  return { existingUnits: vector[0]!, cumulativeByBoundary: boundaries.map((point, index) => ({
    boundary: { ...point }, units: vector[index + 1]!,
  })) }
}
function sameSubject(a: HoldSubject, b: HoldSubject): boolean {
  return a.kind === 'person' ? b.kind === 'person' && a.personId === b.personId
    : b.kind === 'resource' && a.resourceKey === b.resourceKey && a.slot === b.slot
}
function conflicts(a: Hold, b: Hold, aUntil: Boundary = a.until, bUntil: Boundary = b.until): boolean {
  return sameSubject(a.subject, b.subject) && compareBoundary(a.from, aUntil) < 0 && compareBoundary(b.from, bUntil) < 0
    && compareBoundary(a.from, bUntil) < 0 && compareBoundary(b.from, aUntil) < 0
}

/**
 * Enumerate whole path choices and actual-seat credits. Re-running with an
 * aggregate profile constraint retains equivalent prior assignments; no first
 * beneficiary or first optimum becomes an implicit permanent allocation.
 */
function search(model: Model, options: SearchOptions, budget: Budget): Solution | null {
  const required = model.demands.map((demand, index) => index === model.targetIndex ? options.targetUnits : demand.units)
  budget.charge(required.length + model.boundaries.length)
  const paid = required.map(() => 0), eventBuckets = new Array<number>(model.boundaries.length).fill(0)
  const selected: Alternative[] = [], additionalHolds: Hold[] = [], credits: AssignedCredit[] = []
  let best: Solution | null = null, stopped = false, existingUnits = 0

  const profile = (): number[] => {
    budget.charge(eventBuckets.length + 1)
    let cumulative = 0
    return [existingUnits, ...eventBuckets.map(value => { cumulative += value; return cumulative })]
  }
  const lawfulAdditionalHolds = (alternative: Alternative): boolean => {
    const fresh = alternative.value.additionalHolds
    for (let index = 0; index < fresh.length; index++) {
      const hold = fresh[index]!
      for (const previous of additionalHolds) {
        budget.charge(); if (conflicts(hold, previous)) return false
      }
      for (let other = 0; other < index; other++) {
        budget.charge(); if (conflicts(hold, fresh[other]!)) return false
      }
      for (const fixed of model.input.fixedHolds) {
        budget.charge()
        // Only the immutable prefix is safe for an early rejection. An as-yet
        // unselected release-only continuation may still shorten the suffix.
        if (conflicts(hold, fixed, hold.until, fixed.replaceableFrom ?? fixed.until)) return false
      }
    }
    return true
  }
  const lawfulLedger = (): boolean => {
    const replacements = new Map<string, Boundary>()
    for (const alternative of selected) for (const replacement of alternative.value.holdReplacements) {
      budget.charge()
      invariant(!replacements.has(replacement.holdId), 'a selected set replaced one hold twice')
      replacements.set(replacement.holdId, replacement.newUntil)
    }
    budget.charge(model.input.fixedHolds.length + additionalHolds.length)
    const ledger = [
      ...model.input.fixedHolds.map(hold => ({ hold, until: replacements.get(hold.holdId) ?? hold.until })),
      ...additionalHolds.map(hold => ({ hold, until: hold.until })),
    ]
    for (let index = 0; index < ledger.length; index++) for (let other = 0; other < index; other++) {
      budget.charge()
      const a = ledger[index]!, b = ledger[other]!
      if (conflicts(a.hold, b.hold, a.until, b.until)) return false
    }
    return true
  }
  const orderedTargetCredits = (): AssignedCredit[] => {
    budget.charge(credits.length)
    const target = credits.filter(credit => credit.demand === model.targetIndex)
    budget.sorting(target.length)
    return sorted(target, (a, b) => compareBoundary(a.alternative.value.firstTake!, b.alternative.value.firstTake!)
      || Number(b.alternative.value.existingPath) - Number(a.alternative.value.existingPath)
      || compareText(a.alternative.value.pathKey, b.alternative.value.pathKey))
  }
  const achievement = (target: readonly AssignedCredit[]): boolean => {
    for (let index = 0; index < options.remaining; index++) {
      budget.charge()
      if (!target[index]!.alternative.value.existingPath) return false
    }
    budget.charge()
    return model.input.target.window.dueWeekExclusive - target[options.remaining - 1]!.alternative.value.firstTake!.week >= 8
  }
  const witness = (target: readonly AssignedCredit[]): Witness => {
    budget.charge(selected.length + credits.length + target.length)
    budget.sorting(credits.length)
    const targetOrder = new Map(target.map((credit, index) => [credit, index]))
    const ordered = sorted(credits, (a, b) => {
      if (a.demand === model.targetIndex && b.demand === model.targetIndex) return targetOrder.get(a)! - targetOrder.get(b)!
      return compareText(JSON.stringify(model.demands[a.demand]!.key), JSON.stringify(model.demands[b.demand]!.key))
        || compareBoundary(a.alternative.value.firstTake!, b.alternative.value.firstTake!)
        || compareText(a.alternative.value.pathKey, b.alternative.value.pathKey) || compareText(a.slot, b.slot)
    })
    return {
      selectedAlternativeKeys: selected.map(alternative => alternative.value.key),
      credits: ordered.map(credit => ({ demandKey: [...model.demands[credit.demand]!.key] as DemandKey,
        pathKey: credit.alternative.value.pathKey, slot: credit.slot })),
      targetTakeBoundaries: target.map(credit => ({ ...credit.alternative.value.firstTake! })),
    }
  }
  const enter = (position: number): boolean => {
    budget.charge()
    let met = true
    for (let demand = 0; demand < required.length; demand++) {
      budget.charge()
      const remainder = required[demand]! - paid[demand]!
      if (remainder > model.suffixPotential[position]![demand]!) return false
      if (remainder !== 0) met = false
    }
    if (met) {
      const candidate = profile()
      if (options.protectedProfile !== undefined && compareProfile(candidate, options.protectedProfile, budget) !== 0) return false
      if (options.optimize && best !== null && compareProfile(candidate, best.profile, budget) <= 0) return false
      const target = orderedTargetCredits()
      if (options.achievable && !achievement(target)) return false
      if (lawfulLedger()) {
        best = { profile: candidate, witness: witness(target) }
        stopped = !options.optimize || options.stopProfile !== undefined && compareProfile(candidate, options.stopProfile, budget) === 0
        // Extra uncredited selections cannot improve this profile. If the ledger
        // failed instead, keep searching: a later continuation may repair it.
        return false
      }
    }
    return position < model.paths.length
  }
  type Branch = { alternative: Alternative; seats: readonly number[] } | null
  function* branches(position: number): Generator<Branch, void, unknown> {
    for (const alternative of model.paths[position]!.alternatives) {
      budget.charge()
      if (!lawfulAdditionalHolds(alternative)) continue
      const choices: number[][] = []
      for (const seat of alternative.eligible) {
        const available: number[] = []
        for (const demand of seat) {
          budget.charge()
          if (paid[demand]! < required[demand]!) available.push(demand)
        }
        available.push(-1) // A real seat need not pay a promise.
        choices.push(available)
      }
      // Distinct cast people imply that a demand can occur in only ONE of
      // these seat lists. Thus one event cannot pay two same-person counters.
      for (const lead of choices[0]!) for (const antagonist of choices[1]!) for (const support of choices[2]!) {
        budget.charge()
        if (lead < 0 && antagonist < 0 && support < 0 && alternative.value.holdReplacements.length === 0) continue
        yield { alternative, seats: [lead, antagonist, support] }
      }
    }
    budget.charge()
    yield null // Choose no alternative for this physical picture path.
  }
  type Frame = {
    position: number; entered: boolean; choices: Generator<Branch, void, unknown> | null
    applied: Branch; oldHoldCount: number; oldCreditCount: number
  }
  const stack: Frame[] = [{ position: 0, entered: false, choices: null, applied: null, oldHoldCount: 0, oldCreditCount: 0 }]
  const leave = (): void => {
    const frame = stack.pop()!
    if (frame.applied === null) return
    budget.charge()
    while (credits.length > frame.oldCreditCount) {
      budget.charge()
      const credit = credits.pop()!
      paid[credit.demand] = paid[credit.demand]! - 1
      if (credit.demand !== model.targetIndex && credit.alternative.profileIndex >= 0) {
        existingUnits--; eventBuckets[credit.alternative.profileIndex] = eventBuckets[credit.alternative.profileIndex]! - 1
      }
    }
    selected.pop(); additionalHolds.length = frame.oldHoldCount
  }
  // Explicit path stack: even an admitted domain of 1024 release alternatives
  // consumes the same governed work counter, not the JavaScript call stack.
  while (stack.length > 0 && !stopped) {
    const frame = stack[stack.length - 1]!
    if (!frame.entered) {
      frame.entered = true
      if (!enter(frame.position)) { if (!stopped) leave(); continue }
      frame.choices = branches(frame.position)
    }
    budget.charge()
    const next = frame.choices!.next()
    if (next.done) { leave(); continue }
    const branch = next.value, oldHoldCount = additionalHolds.length, oldCreditCount = credits.length
    if (branch !== null) {
      selected.push(branch.alternative)
      for (const hold of branch.alternative.value.additionalHolds) { budget.charge(); additionalHolds.push(hold) }
      for (let index = 0; index < SLOTS.length; index++) {
        budget.charge()
        const demand = branch.seats[index]!
        if (demand < 0) continue
        paid[demand] = paid[demand]! + 1
        if (demand !== model.targetIndex && branch.alternative.profileIndex >= 0) {
          existingUnits++; eventBuckets[branch.alternative.profileIndex] = eventBuckets[branch.alternative.profileIndex]! + 1
        }
        credits.push({ demand, alternative: branch.alternative, slot: SLOTS[index]! })
      }
    }
    stack.push({ position: frame.position + 1, entered: false, choices: null, applied: branch, oldHoldCount, oldCreditCount })
  }
  return best
}

/** Pure public entry point. No game identity, root, RNG or allocation is written. */
export function searchPromiseCapacity(raw: CapacityKernelInput): CapacityKernelResult {
  record(raw, 'input'); record(raw.limits, 'limits')
  for (const name of ['claims', 'units', 'alternatives', 'work', 'span'] as const) {
    integer(raw.limits[name], `${name} limit`)
    invariant(raw.limits[name] <= MAX_LIMITS[name], `${name} limit exceeds the governed maximum`)
  }
  integer(raw.preparationWork, 'preparation work')
  const budget = new Budget(raw.limits.work, raw.preparationWork)
  try {
    if (raw.preparationWork >= raw.limits.work) throw new WorkLimit()
    scan(raw, budget)
    const input = normalize(raw)
    const remaining = input.target.state === 'bound'
      ? Math.max(0, input.target.count - input.target.actualQualifiedCount) : input.target.count
    if (remaining === 0) return { status: 'ALREADY_MET', remaining: 0, workUsed: budget.used }
    const uncertain = (reason: 'domainIncomplete' | 'sizeLimit', fallback: string): CapacityKernelResult => ({
      status: 'UNCERTIFIED', reason, omissions: input.coverage.omissions.length > 0 ? [...input.coverage.omissions] : [fallback],
      workUsed: budget.used,
    })
    const debits = input.foreignDebits.filter(debit => {
      budget.charge()
      return debit.issuerId !== input.issuerId && debit.personId === input.target.personId
        && debit.promiseId !== input.target.promiseId && debit.remaining > 0
        && overlapWindow(debit.sourceWindow, input.now, input.target.window)
    })
    let horizon = Math.max(input.horizonEndWeek, input.target.window.dueWeekExclusive)
    for (const prior of input.priorClaims) { budget.charge(); horizon = Math.max(horizon, prior.window.dueWeekExclusive) }
    budget.charge()
    if (input.priorClaims.length + debits.length + 1 > input.limits.claims
      || input.alternatives.length > input.limits.alternatives
      || horizon - input.now.week > input.limits.span || remaining > input.limits.units) {
      return uncertain('sizeLimit', 'bounded capacity size limit')
    }
    // Only bounded small X reaches arithmetic/expansion. In particular MAX_SAFE
    // saved counts never overflow B or produce a loop proportional to the count.
    const bufferDemand = remaining + Math.ceil(remaining / 3)
    let units = bufferDemand
    budget.charge()
    if (units > input.limits.units) return uncertain('sizeLimit', 'bounded capacity unit limit')
    for (const prior of [...input.priorClaims, ...debits]) {
      budget.charge()
      if (prior.remaining > input.limits.units - units) return uncertain('sizeLimit', 'bounded capacity unit limit')
      units += prior.remaining
    }
    if (input.coverage.claimsAndHolds !== 'complete') return uncertain('domainIncomplete', 'relevant claims or holds are incomplete')
    budget.phase = 'search'
    const model = prepare(input, debits, budget)
    const complete = input.coverage.existingAlternatives === 'complete' && input.coverage.allAlternatives === 'complete'
    const impossible = (): CapacityKernelResult => ({ status: 'PROVEN_IMPOSSIBLE', scope: 'jointOfferOnly',
      reason: 'completeCountFailure', workUsed: budget.used })
    const upper = priorUpperProfile(model, budget)
    let optimum: readonly number[]
    if (model.demands.slice(0, model.targetIndex).every(demand => demand.units === 0)) {
      optimum = upper // Identically zero, even if future alternatives are omitted.
    } else {
      const prior = search(model, { targetUnits: 0, remaining, optimize: true,
        ...(input.coverage.existingAlternatives === 'complete' ? { stopProfile: upper } : {}) }, budget)
      if (prior === null) return complete ? impossible() : uncertain('domainIncomplete', 'prior feasibility is unproved')
      const saturated = input.coverage.existingAlternatives === 'complete' && compareProfile(prior.profile, upper, budget) === 0
      if (!complete && !saturated) return uncertain('domainIncomplete', 'full prior optimum is unproved')
      optimum = prior.profile
    }
    const count = search(model, { targetUnits: remaining, remaining, protectedProfile: optimum }, budget)
    if (count === null) {
      const joint = search(model, { targetUnits: remaining, remaining }, budget)
      if (joint === null) return complete ? impossible() : uncertain('domainIncomplete', 'joint count failure has an incomplete domain')
      // An unoptimized witness is not itself proof that no protected assignment
      // exists in an omitted domain. Neither condition can become causal BROKEN.
      if (!complete) return uncertain('domainIncomplete', 'protected count failure has an incomplete domain')
      const priorOptimum = publicProfile(optimum, model.boundaries, budget)
      return { status: 'PROVEN_FRAGILE', reason: 'priorPathProtection', priorOptimum,
        countWitness: joint.witness, workUsed: budget.used }
    }
    const achievable = search(model, { targetUnits: bufferDemand, remaining, protectedProfile: optimum, achievable: true }, budget)
    if (achievable !== null) {
      const priorOptimum = publicProfile(optimum, model.boundaries, budget)
      return { status: 'CERTIFIED_ACHIEVABLE', remaining, bufferDemand, priorOptimum,
        witness: achievable.witness, workUsed: budget.used }
    }
    if (!complete) return uncertain('domainIncomplete', 'achievable failure has an incomplete domain')
    const priorOptimum = publicProfile(optimum, model.boundaries, budget)
    return { status: 'PROVEN_FRAGILE', reason: 'achievableProbeFailed', priorOptimum,
      countWitness: count.witness, workUsed: budget.used }
  } catch (error) {
    if (!(error instanceof WorkLimit)) throw error
    return { status: 'UNCERTIFIED', reason: 'workLimit', workUsed: budget.limit,
      omissions: [`${budget.phase} work limit`] }
  }
}
