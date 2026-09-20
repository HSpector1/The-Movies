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

export type JointTracePicture = DeepReadonly<Omit<PictureAlternative, 'personRelease'> & {
  kind: 'jointTracePicture'; jointTraceKey: string; personRelease: Boundary | null
  additionalHolds: readonly []; holdReplacements: readonly []
}>
export type JointTraceBackgroundPath = DeepReadonly<{
  kind: 'jointTraceBackground'; jointTraceKey: string; pathKey: string
  issuerId: string; existingPath: boolean; ownerFactRefs: readonly string[]
}>
export type JointTracePath = JointTracePicture | JointTraceBackgroundPath
export type JointOwnerTrace = DeepReadonly<{
  kind: 'jointOwnerTrace'; traceKey: string; ownerFactRefs: readonly string[]
  paths: readonly JointTracePath[]; fixedHoldReplacements: readonly HoldReplacement[]
  additionalHolds: readonly Hold[]
}>
export type JointTraceCoverage = DeepReadonly<{
  claimsAndHolds: 'complete' | 'incomplete'; existingCalendars: 'complete' | 'incomplete'
  allOwnerTraces: 'complete' | 'incomplete'; omissions: readonly string[]
}>
export type JointTraceCapacityInput = DeepReadonly<Omit<CapacityKernelInput, 'alternatives' | 'coverage'> & {
  mode: 'jointOwnerTraces'; traces: readonly JointOwnerTrace[]; coverage: JointTraceCoverage
}>
export type JointTraceWitness = DeepReadonly<{
  traceKey: string; ownerFactRefs: readonly string[]; executedPathKeys: readonly string[]
  effectiveHoldIds: readonly string[]; creditedPictureKeys: readonly string[]
  credits: readonly Credit[]; targetTakeBoundaries: readonly Boundary[]
}>
type ResultWithWitness<W> =
  | Extract<CapacityKernelResult, { status: 'ALREADY_MET' | 'PROVEN_IMPOSSIBLE' | 'UNCERTIFIED' }>
  | (Omit<Extract<CapacityKernelResult, { status: 'CERTIFIED_ACHIEVABLE' }>, 'witness'> & Readonly<{ witness: W }>)
  | (Omit<Extract<CapacityKernelResult, { status: 'PROVEN_FRAGILE' }>, 'countWitness'> & Readonly<{ countWitness: W }>)
export type JointTraceCapacityResult = ResultWithWitness<JointTraceWitness>

type BaseInput = Omit<CapacityKernelInput, 'alternatives' | 'coverage'>
type Picture = Omit<PictureAlternative, 'personRelease'> & Readonly<{ personRelease: Boundary | null }>
type NormalizedInput = BaseInput & {
  domain: { kind: 'optional'; alternatives: readonly PictureAlternative[] }
    | { kind: 'traces'; traces: readonly JointOwnerTrace[] }
  coverage: DomainCoverage
}

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
function alternativeKey(value: Picture): string {
  return JSON.stringify([value.firstTake, value.greenlight, value.personRelease, value.existingPath,
    value.cast, value.additionalHolds, value.holdReplacements, value.staffingWitnessKey,
    value.ownerFactRefs, value.issuerId, value.pathKey, value.key])
}

function normalizeBase(input: BaseInput): BaseInput {
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
  array(input.fixedHolds, 'fixed holds')
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
  return { ...input, now, target: { ...target, mask: targetMask, window: targetWindow }, priorClaims, foreignDebits, fixedHolds }
}

function pictureValue(value: PictureAlternative, now: Boundary, nullable: false): PictureAlternative
function pictureValue(value: Picture, now: Boundary, nullable: true): Picture
function pictureValue(value: Picture, now: Boundary, nullable: boolean): Picture {
  const greenlight = boundary(value.greenlight)
  invariant(nullable || value.personRelease !== null, 'optional picture requires its actual release')
  const personRelease = value.personRelease === null ? null : boundary(value.personRelease)
  const firstTake = value.firstTake === null ? null : boundary(value.firstTake)
  if (personRelease !== null) invariant(compareBoundary(greenlight, personRelease) <= 0, 'release precedes greenlight')
  if (firstTake !== null) invariant(compareBoundary(greenlight, firstTake) <= 0
    && (personRelease === null || compareBoundary(firstTake, personRelease) <= 0) && compareBoundary(now, firstTake) <= 0,
  'take must be a future event inside the actual picture calendar')
  record(value.cast, 'cast')
  for (const slot of SLOTS) string(value.cast[slot], 'cast person')
  invariant(new Set(SLOTS.map(slot => value.cast[slot])).size === 3, 'one person cannot occupy multiple cast seats')
  string(value.staffingWitnessKey, 'staffing witness')
  const ownerFactRefs = factRefs(value.ownerFactRefs)
  return { ...value, greenlight, firstTake, personRelease,
    cast: { lead: value.cast.lead, antagonist: value.cast.antagonist, support: value.cast.support }, ownerFactRefs }
}
function factRefs(value: readonly string[]): readonly string[] {
  array(value, 'owner facts'); invariant(value.length > 0, 'trajectory needs owner facts')
  for (const ref of value) string(ref, 'owner fact')
  return sorted(value, compareText)
}

function normalize(input: CapacityKernelInput): NormalizedInput {
  invariant(!('mode' in input && input.mode === 'jointOwnerTraces') && !('traces' in input)
    && !('kind' in input && (input.kind === 'jointOwnerTrace' || input.kind === 'jointTracePicture' || input.kind === 'jointTraceBackground')),
    'joint traces require the trace entry')
  const base = normalizeBase(input)
  array(input.alternatives, 'alternatives')
  const fixedIds = new Map(base.fixedHolds.map(hold => [hold.holdId, hold]))
  const alternativeIds = new Set<string>(), addedHoldPaths = new Map<string, string>()
  const pathKinds = new Map<string, boolean>()
  const alternatives = keyed(input.alternatives.map(value => {
    record(value, 'alternative'); string(value.key, 'alternative key'); string(value.pathKey, 'path key')
    invariant(!('jointTraceKey' in value) && !('kind' in value &&
      (value.kind === 'jointTracePicture' || value.kind === 'jointTraceBackground' || value.kind === 'jointOwnerTrace')),
    'joint trace paths require the trace entry')
    invariant(!alternativeIds.has(value.key), 'duplicate alternative identity'); alternativeIds.add(value.key)
    invariant(value.issuerId === input.issuerId, 'alternative must belong to local issuer')
    invariant(typeof value.existingPath === 'boolean', 'existing path flag must be boolean')
    invariant(!pathKinds.has(value.pathKey) || pathKinds.get(value.pathKey) === value.existingPath,
      'one path cannot be both existing and hypothetical')
    pathKinds.set(value.pathKey, value.existingPath)
    const picture = pictureValue(value, base.now, false)
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
      greenlight: picture.greenlight, firstTake: picture.firstTake, personRelease: picture.personRelease, cast: picture.cast,
      staffingWitnessKey: value.staffingWitnessKey, ownerFactRefs: picture.ownerFactRefs, additionalHolds, holdReplacements }
  }), alternativeKey)
  record(input.coverage, 'coverage')
  for (const name of ['claimsAndHolds', 'existingAlternatives', 'allAlternatives'] as const) {
    invariant(input.coverage[name] === 'complete' || input.coverage[name] === 'incomplete', 'unknown coverage status')
  }
  array(input.coverage.omissions, 'coverage omissions')
  for (const omission of input.coverage.omissions) string(omission, 'omission')
  return { ...base, domain: { kind: 'optional', alternatives },
    coverage: { ...input.coverage, omissions: sorted(input.coverage.omissions, compareText) } }
}

function tracePathKey(value: JointTracePath): string {
  return value.kind === 'jointTracePicture' ? JSON.stringify([value.kind, alternativeKey(value)])
    : JSON.stringify([value.kind, value.existingPath, value.ownerFactRefs, value.issuerId, value.pathKey])
}
function normalizeTraces(input: JointTraceCapacityInput): NormalizedInput {
  invariant(input.mode === 'jointOwnerTraces' && !('alternatives' in input), 'trace entry requires its exclusive mode')
  const base = normalizeBase(input)
  array(input.traces, 'traces')
  const fixedIds = new Map(base.fixedHolds.map(hold => [hold.holdId, hold]))
  const traceIds = new Set<string>(), pictureIds = new Set<string>(), pathKinds = new Map<string, boolean>()
  const traces = keyed(input.traces.map(value => {
    record(value, 'trace'); invariant(value.kind === 'jointOwnerTrace', 'unknown trace kind')
    string(value.traceKey, 'trace key')
    invariant(!traceIds.has(value.traceKey), 'duplicate trace identity'); traceIds.add(value.traceKey)
    const ownerFactRefs = factRefs(value.ownerFactRefs)
    array(value.paths, 'trace paths'); array(value.additionalHolds, 'trace holds')
    array(value.fixedHoldReplacements, 'trace replacements')
    const pathIds = new Set<string>()
    const paths = keyed(value.paths.map((path): JointTracePath => {
      record(path, 'trace path'); string(path.pathKey, 'path key')
      invariant(path.kind === 'jointTracePicture' || path.kind === 'jointTraceBackground', 'unknown trace path kind')
      invariant(path.jointTraceKey === value.traceKey, 'path must belong to its containing trace')
      invariant(path.issuerId === base.issuerId, 'trace path must belong to local issuer')
      invariant(typeof path.existingPath === 'boolean', 'existing path flag must be boolean')
      invariant(!pathIds.has(path.pathKey), 'one physical path may occur only once per trace'); pathIds.add(path.pathKey)
      invariant(!pathKinds.has(path.pathKey) || pathKinds.get(path.pathKey) === path.existingPath,
        'one path cannot be both existing and hypothetical')
      pathKinds.set(path.pathKey, path.existingPath)
      if (path.kind === 'jointTraceBackground') {
        for (const field of ['key', 'cast', 'staffingWitnessKey', 'greenlight', 'firstTake', 'personRelease',
          'additionalHolds', 'holdReplacements']) invariant(!(field in path), 'background path cannot carry picture fields')
        return { kind: path.kind, jointTraceKey: value.traceKey, pathKey: path.pathKey,
          issuerId: path.issuerId, existingPath: path.existingPath, ownerFactRefs: factRefs(path.ownerFactRefs) }
      }
      string(path.key, 'picture occurrence key')
      invariant(!pictureIds.has(path.key), 'duplicate picture occurrence identity'); pictureIds.add(path.key)
      array(path.additionalHolds, 'picture holds'); array(path.holdReplacements, 'picture replacements')
      invariant(path.additionalHolds.length === 0 && path.holdReplacements.length === 0,
        'trace picture cannot own optional holds or replacements')
      const picture = pictureValue(path, base.now, true)
      return { kind: path.kind, jointTraceKey: value.traceKey, key: picture.key, pathKey: picture.pathKey,
        issuerId: picture.issuerId, existingPath: picture.existingPath, greenlight: picture.greenlight,
        firstTake: picture.firstTake, personRelease: picture.personRelease, cast: picture.cast,
        staffingWitnessKey: picture.staffingWitnessKey, ownerFactRefs: picture.ownerFactRefs,
        additionalHolds: [], holdReplacements: [] }
    }), tracePathKey)
    const addedIds = new Set<string>()
    const additionalHolds = keyed(value.additionalHolds.map(raw => {
      const hold = holdValue(raw)
      invariant(!fixedIds.has(hold.holdId) && !addedIds.has(hold.holdId), 'duplicate trace hold identity')
      invariant(hold.ownerPathKey === null || pathIds.has(hold.ownerPathKey), 'trace hold path must join a certified trajectory')
      addedIds.add(hold.holdId)
      return hold
    }), holdKey)
    const replaced = new Set<string>()
    const fixedHoldReplacements = keyed(value.fixedHoldReplacements.map(raw => {
      record(raw, 'trace replacement'); string(raw.holdId, 'replacement identity')
      invariant(!replaced.has(raw.holdId), 'duplicate trace replacement'); replaced.add(raw.holdId)
      const original = fixedIds.get(raw.holdId), newUntil = boundary(raw.newUntil)
      invariant(original !== undefined && original.replaceableFrom !== null && original.ownerPathKey !== null
        && pathIds.has(original.ownerPathKey), 'trace replacement must join its own certified replaceable trajectory')
      invariant(compareBoundary(original.replaceableFrom, newUntil) <= 0 && compareBoundary(newUntil, original.until) <= 0,
        'replacement changes immutable prefix or extends original hold')
      return { holdId: raw.holdId, newUntil }
    }), replacement => JSON.stringify([replacement.newUntil, replacement.holdId]))
    return { kind: 'jointOwnerTrace' as const, traceKey: value.traceKey, ownerFactRefs, paths,
      additionalHolds, fixedHoldReplacements }
  }), trace => JSON.stringify([trace.paths.map(tracePathKey), trace.fixedHoldReplacements,
    trace.additionalHolds, trace.ownerFactRefs, trace.traceKey]))
  record(input.coverage, 'trace coverage')
  for (const name of ['claimsAndHolds', 'existingCalendars', 'allOwnerTraces'] as const) {
    invariant(input.coverage[name] === 'complete' || input.coverage[name] === 'incomplete', 'unknown trace coverage status')
  }
  invariant(!('existingAlternatives' in input.coverage) && !('allAlternatives' in input.coverage), 'mixed coverage modes')
  array(input.coverage.omissions, 'coverage omissions')
  for (const omission of input.coverage.omissions) string(omission, 'omission')
  return { ...base, domain: { kind: 'traces', traces }, coverage: {
    claimsAndHolds: input.coverage.claimsAndHolds, existingAlternatives: input.coverage.existingCalendars,
    allAlternatives: input.coverage.allOwnerTraces, omissions: sorted(input.coverage.omissions, compareText),
  } }
}

type TraceProof = Pick<JointTraceWitness, 'traceKey' | 'ownerFactRefs' | 'executedPathKeys' | 'effectiveHoldIds'>
type ValidatedTrace = { value: JointOwnerTrace; proof: TraceProof }

/** The whole compulsory ledger is checked once, before any credit probe. */
function validateTraces(input: BaseInput, traces: readonly JointOwnerTrace[], horizon: number, budget: Budget): ValidatedTrace[] {
  const result: ValidatedTrace[] = []
  for (const trace of traces) {
    budget.charge()
    const replacements = new Map<string, Boundary>()
    for (const replacement of trace.fixedHoldReplacements) {
      budget.charge(); replacements.set(replacement.holdId, replacement.newUntil)
    }
    budget.charge(input.fixedHolds.length + trace.additionalHolds.length)
    const ledger: Hold[] = [
      ...input.fixedHolds.map(hold => ({ ...hold, until: replacements.get(hold.holdId) ?? hold.until })),
      ...trace.additionalHolds,
    ]
    for (let index = 0; index < ledger.length; index++) for (let other = 0; other < index; other++) {
      budget.charge(); invariant(!conflicts(ledger[index]!, ledger[other]!), 'compulsory trace ledger conflicts')
    }
    const end: Boundary = { week: horizon, step: 0 }
    for (const path of trace.paths) {
      budget.charge()
      if (path.kind !== 'jointTracePicture' || path.personRelease !== null) continue
      const start = compareBoundary(input.now, path.greenlight) > 0 ? input.now : path.greenlight
      if (compareBoundary(start, end) >= 0) continue
      for (const slot of SLOTS) {
        budget.charge()
        const segments: Hold[] = []
        for (const hold of ledger) {
          budget.charge()
          if (hold.ownerPathKey === path.pathKey && hold.subject.kind === 'person' && hold.subject.personId === path.cast[slot]) {
            segments.push(hold)
          }
        }
        budget.sorting(segments.length)
        const ordered = sorted(segments, (a, b) => compareBoundary(a.from, b.from)
          || compareBoundary(a.until, b.until) || compareText(a.holdId, b.holdId))
        let cursor = start
        for (const hold of ordered) {
          budget.charge()
          if (compareBoundary(cursor, end) >= 0) break
          if (compareBoundary(hold.until, cursor) <= 0) continue
          invariant(compareBoundary(hold.from, cursor) <= 0, 'unknown release occupancy has a gap')
          cursor = hold.until
        }
        invariant(compareBoundary(cursor, end) >= 0, 'unknown release occupancy must cover the effective horizon')
      }
    }
    budget.charge(trace.paths.length + ledger.length + trace.ownerFactRefs.length)
    budget.sorting(ledger.length)
    result.push({ value: trace, proof: { traceKey: trace.traceKey, ownerFactRefs: [...trace.ownerFactRefs],
      executedPathKeys: trace.paths.map(path => path.pathKey), effectiveHoldIds: sorted(ledger.map(hold => hold.holdId), compareText) } })
  }
  return result
}

type Demand = {
  key: DemandKey; personId: string; mask: Mask; window: Window; units: number
}
type Alternative = {
  value: Picture; eligible: readonly (readonly number[])[]; profileIndex: number
}
type Path = { key: string; alternatives: Alternative[] }
type CommonModel = {
  input: NormalizedInput; demands: Demand[]; targetIndex: number
  boundaries: Boundary[]; boundaryIndices: ReadonlyMap<string, number>
}
type Model = CommonModel & { paths: Path[]; suffixPotential: number[][]; traceProof?: TraceProof }
type Domain = { common: CommonModel; models: Model[]; upperPaths: Path[] }
type AssignedCredit = { demand: number; alternative: Alternative; slot: Slot }
type Solution = { profile: number[]; witness: Witness; traceProof?: TraceProof }
type SearchOptions = {
  targetUnits: number; protectedProfile?: readonly number[]
  optimize?: boolean; stopProfile?: readonly number[]; achievable?: boolean; remaining: number
}

function boundaryKey(value: Boundary): string { return JSON.stringify([value.week, value.step]) }

function prepareCommon(input: NormalizedInput, debits: readonly ForeignDebit[], values: readonly Picture[], budget: Budget): CommonModel {
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
  for (const alternative of values) {
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
  return { input, demands, targetIndex, boundaries, boundaryIndices }
}

function prepareModel(common: CommonModel, values: readonly Picture[], budget: Budget, traceProof?: TraceProof): Model {
  const { demands, boundaryIndices } = common
  const byPath = new Map<string, Path>()
  for (const value of values) {
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
    // Optional uncredited alternatives only add constraints, unless they release
    // a suffix. Trace rows omitted from credit search remain in the full proof
    // and their compulsory ledger has already been validated independently.
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
  return { ...common, paths, suffixPotential, ...(traceProof === undefined ? {} : { traceProof }) }
}

function prepareDomain(input: NormalizedInput, debits: readonly ForeignDebit[], traces: readonly ValidatedTrace[], budget: Budget): Domain {
  if (input.domain.kind === 'optional') {
    const common = prepareCommon(input, debits, input.domain.alternatives, budget)
    const model = prepareModel(common, input.domain.alternatives, budget)
    return { common, models: [model], upperPaths: model.paths }
  }
  const pictures: Picture[] = [], branchPictures: Picture[][] = []
  for (const trace of traces) {
    budget.charge()
    const branch: Picture[] = []
    for (const path of trace.value.paths) {
      budget.charge()
      if (path.kind === 'jointTracePicture') { branch.push(path); pictures.push(path) }
    }
    branchPictures.push(branch)
  }
  const common = prepareCommon(input, debits, pictures, budget)
  const models = traces.map((trace, index) => {
    budget.charge(); return prepareModel(common, branchPictures[index]!, budget, trace.proof)
  })
  // A repeated physical path in exclusive traces supplies at most one optimistic
  // event per demand. Its variants remain available for earliest-profile bounds.
  const byPath = new Map<string, Path>()
  for (const model of models) for (const path of model.paths) {
    budget.charge()
    let combined = byPath.get(path.key)
    if (combined === undefined) { combined = { key: path.key, alternatives: [] }; byPath.set(path.key, combined) }
    for (const alternative of path.alternatives) { budget.charge(); combined.alternatives.push(alternative) }
  }
  budget.sorting(byPath.size)
  const upperPaths = keyed([...byPath.values()], path => path.key)
  return { common, models, upperPaths }
}

/** Independent, optimistic per-demand path bounds; attaining ALL entries proves the full profile. */
function priorUpperProfile(model: CommonModel, pathsToBound: readonly Path[], budget: Budget): number[] {
  budget.charge(model.boundaries.length + 1)
  const upper = new Array<number>(model.boundaries.length + 1).fill(0)
  for (let demand = 0; demand < model.targetIndex; demand++) {
    budget.charge(model.boundaries.length + 1)
    const units = model.demands[demand]!.units, buckets = new Array<number>(model.boundaries.length).fill(0)
    let paths = 0
    for (const path of pathsToBound) {
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
    if (model.traceProof !== undefined) return true // Complete compulsory ledger already validated.
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
    if (model.traceProof !== undefined) return true // Credit omission never edits this ledger.
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
        best = { profile: candidate, witness: witness(target),
          ...(model.traceProof === undefined ? {} : { traceProof: model.traceProof }) }
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

/** Search all exclusive branches with the same demands, cuts, profile and budget. */
function searchDomain(domain: Domain, options: SearchOptions, budget: Budget): Solution | null {
  if (domain.common.input.domain.kind === 'optional') return search(domain.models[0]!, options, budget)
  let best: Solution | null = null
  for (const model of domain.models) {
    budget.charge()
    const candidate = search(model, options, budget)
    if (candidate === null) continue
    if (!options.optimize) return candidate
    if (best === null || compareProfile(candidate.profile, best.profile, budget) > 0) best = candidate
    if (options.stopProfile !== undefined && compareProfile(candidate.profile, options.stopProfile, budget) === 0) break
  }
  return best
}

function traceWitness(solution: Solution, budget: Budget): JointTraceWitness {
  const proof = solution.traceProof
  invariant(proof !== undefined, 'trace solution lacks its complete execution proof')
  budget.charge(proof.ownerFactRefs.length + proof.executedPathKeys.length + proof.effectiveHoldIds.length
    + solution.witness.selectedAlternativeKeys.length + solution.witness.credits.length + solution.witness.targetTakeBoundaries.length + 1)
  return { traceKey: proof.traceKey, ownerFactRefs: [...proof.ownerFactRefs], executedPathKeys: [...proof.executedPathKeys],
    effectiveHoldIds: [...proof.effectiveHoldIds], creditedPictureKeys: [...solution.witness.selectedAlternativeKeys],
    credits: solution.witness.credits, targetTakeBoundaries: solution.witness.targetTakeBoundaries }
}

/** Both entries share this single prior/X/B/unoptimized proof orchestration. */
function classifyDomain<W>(domain: Domain, remaining: number, bufferDemand: number, budget: Budget,
  formatWitness: (solution: Solution, budget: Budget) => W): ResultWithWitness<W> {
  const model = domain.common, input = model.input
  const uncertain = (fallback: string): ResultWithWitness<W> => ({ status: 'UNCERTIFIED', reason: 'domainIncomplete',
    omissions: input.coverage.omissions.length > 0 ? [...input.coverage.omissions] : [fallback], workUsed: budget.used })
  const complete = input.coverage.existingAlternatives === 'complete' && input.coverage.allAlternatives === 'complete'
  const impossible = (): ResultWithWitness<W> => ({ status: 'PROVEN_IMPOSSIBLE', scope: 'jointOfferOnly',
    reason: 'completeCountFailure', workUsed: budget.used })
  const upper = priorUpperProfile(model, domain.upperPaths, budget)
  let optimum: readonly number[]
  if (model.demands.slice(0, model.targetIndex).every(demand => demand.units === 0)) {
    optimum = upper // Identically zero, including cuts not observed in an incomplete domain.
  } else {
    const prior = searchDomain(domain, { targetUnits: 0, remaining, optimize: true,
      ...(input.coverage.existingAlternatives === 'complete' ? { stopProfile: upper } : {}) }, budget)
    if (prior === null) return complete ? impossible() : uncertain('prior feasibility is unproved')
    const saturated = input.coverage.existingAlternatives === 'complete' && compareProfile(prior.profile, upper, budget) === 0
    if (!complete && !saturated) return uncertain('full prior optimum is unproved')
    optimum = prior.profile
  }
  const count = searchDomain(domain, { targetUnits: remaining, remaining, protectedProfile: optimum }, budget)
  if (count === null) {
    const joint = searchDomain(domain, { targetUnits: remaining, remaining }, budget)
    if (joint === null) return complete ? impossible() : uncertain('joint count failure has an incomplete domain')
    // A joint witness is not a proof of failed protection in an omitted domain.
    // Neither result may be used as target-specific causal BROKEN evidence.
    if (!complete) return uncertain('protected count failure has an incomplete domain')
    const priorOptimum = publicProfile(optimum, model.boundaries, budget)
    const countWitness = formatWitness(joint, budget)
    return { status: 'PROVEN_FRAGILE', reason: 'priorPathProtection', priorOptimum, countWitness, workUsed: budget.used }
  }
  const achievable = searchDomain(domain, { targetUnits: bufferDemand, remaining, protectedProfile: optimum, achievable: true }, budget)
  if (achievable !== null) {
    const priorOptimum = publicProfile(optimum, model.boundaries, budget)
    const witness = formatWitness(achievable, budget)
    return { status: 'CERTIFIED_ACHIEVABLE', remaining, bufferDemand, priorOptimum, witness, workUsed: budget.used }
  }
  if (!complete) return uncertain('achievable failure has an incomplete domain')
  const priorOptimum = publicProfile(optimum, model.boundaries, budget)
  const countWitness = formatWitness(count, budget)
  return { status: 'PROVEN_FRAGILE', reason: 'achievableProbeFailed', priorOptimum, countWitness, workUsed: budget.used }
}

function runCapacity<I extends BaseInput, W>(raw: I, normalizeInput: (input: I) => NormalizedInput,
  formatWitness: (solution: Solution, budget: Budget) => W): ResultWithWitness<W> {
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
    const input = normalizeInput(raw)
    const remaining = input.target.state === 'bound'
      ? Math.max(0, input.target.count - input.target.actualQualifiedCount) : input.target.count
    if (remaining === 0 && input.domain.kind === 'optional') return { status: 'ALREADY_MET', remaining: 0, workUsed: budget.used }
    const uncertain = (reason: 'domainIncomplete' | 'sizeLimit', fallback: string): ResultWithWitness<W> => ({
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
    let rows: number
    if (input.domain.kind === 'optional') rows = input.domain.alternatives.length
    else {
      rows = input.domain.traces.length
      for (const trace of input.domain.traces) {
        budget.charge()
        if (trace.paths.length > input.limits.alternatives - rows) { rows = input.limits.alternatives + 1; break }
        rows += trace.paths.length
      }
    }
    budget.charge()
    if (input.priorClaims.length + debits.length + 1 > input.limits.claims
      || rows > input.limits.alternatives
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
    const traces = input.domain.kind === 'traces' ? validateTraces(input, input.domain.traces, horizon, budget) : []
    if (remaining === 0) return { status: 'ALREADY_MET', remaining: 0, workUsed: budget.used }
    if (input.coverage.claimsAndHolds !== 'complete') return uncertain('domainIncomplete', 'relevant claims or holds are incomplete')
    budget.phase = 'search'
    return classifyDomain(prepareDomain(input, debits, traces, budget), remaining, bufferDemand, budget, formatWitness)
  } catch (error) {
    if (!(error instanceof WorkLimit)) throw error
    return { status: 'UNCERTIFIED', reason: 'workLimit', workUsed: budget.limit,
      omissions: [`${budget.phase} work limit`] }
  }
}

/** Optional49 entry. No game identity, root, RNG or allocation is written. */
export function searchPromiseCapacity(raw: CapacityKernelInput): CapacityKernelResult {
  return runCapacity(raw, normalize, solution => solution.witness)
}

/** Complete compulsory owner traces, globally protected by the same finite solver. */
export function searchPromiseCapacityTraces(raw: JointTraceCapacityInput): JointTraceCapacityResult {
  return runCapacity(raw, normalizeTraces, traceWitness)
}
