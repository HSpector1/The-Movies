/**
 * Detached execution of explicit plans for the WHOLE already-started player
 * slate. No admission enumeration, future-choice completeness or save mutation.
 * Inputs are genuine validated engine records (plain own-string-key containers;
 * opaque generic production fields are copied by reference, never traversed).
 */
import { boundedStableSort } from './boundedStableSort.js'
import { castingWorkDueAt } from './castingSessions.js'
import { propertyOf } from './lot.js'
import {
  advanceManagedProductions, arriveDueScenery, assignShootingDirector,
  clearSceneryLoadIn, productionPhaseForRemainingTicks, scheduleShootingTake,
  type ProductionClockView,
} from './operations.js'
import { productionCompanyTalentIds } from './productionPeople.js'
import { createProductionSetupRouteResolver } from './productionSetup.js'
import {
  committedReleaseIds, pruneReleasedCommitments, releaseCommitmentRefusal,
  withReleaseCommitment,
} from './releaseAuthority.js'
import { sceneryLoadInDecision, type SceneryLoadInFacts } from './sceneryLoadIn.js'
import { scriptProjectWriterIds, scriptWorkDueAt } from './scriptDevelopment.js'
import { depleteSetNoveltyForRelease } from './sets.js'
import { StudioEventSink, type StudioEventDraft } from './studioEvents.js'
import {
  createProductionTechnologyPolicy, type ProductionTechnologyFacts,
} from './technologyProduction.js'
import type {
  Boundary, FixedHold, Hold, HoldReplacement, HoldSubject, JointOwnerTrace,
  JointTracePath,
} from './promiseCapacityKernel.js'
import type {
  CastingSession, FacilityReservation, FilmConcept, GameState, Genre, Production,
  ProductionWorkflow, ScriptProject, StudioOperations, StudioReleaseAuthority,
  StudioSet,
} from './types.js'
import type { StudioTechnology } from './technologyTypes.js'

export type StartedPicture = ProductionClockView &
  Readonly<Pick<Production, 'conceptId' | 'writerId' | 'cast' | 'craftIds'>>
export type StartedOwnerSource<P extends StartedPicture> =
  ProductionTechnologyFacts & SceneryLoadInFacts &
  Readonly<Pick<GameState, 'operations' | 'sets' | 'releaseAuthority' |
    'scriptDevelopment' | 'castingSessions' | 'construction' | 'physicalPlans' |
    'productionQueue' | 'founding' | 'firstTakes'>> & Readonly<{
      hollywood: GameState['hollywood']
      concepts: readonly Pick<FilmConcept, 'id' | 'title' | 'genre'>[]
      studio: Readonly<{ activeProductions: readonly P[] }>
    }>
export type StartedProductionCommand = Readonly<{
  week: number; ordinal: number; productionId: string
  kind: 'assignLockedDirector' | 'clearGrandfatheredScenery' | 'scheduleTake' | 'commitRelease'
}>
export type StartedProductionPlan = Readonly<{
  traceKey: string; commands: readonly StartedProductionCommand[]
}>
export type StartedOwnerReplayInput<P extends StartedPicture> = Readonly<{
  source: StartedOwnerSource<P>; issuerId: string; claimPersonIds: readonly string[]
  plans: readonly StartedProductionPlan[]; horizonEndWeek: number; preparationWork: number
  limits: Readonly<{ work: number; span: number; alternatives: number }>
}>
export type ReplayObservation =
  | Readonly<{ kind: 'command'; at: Boundary; command: StartedProductionCommand }>
  | Readonly<{ kind: 'backgroundCompleted'; at: Boundary; pathKey: string; dueWeek: number;
      owner: 'screenplay' | 'castingSession' }>
  | Readonly<{ kind: 'sweepStarted'; at: Boundary; externalSlotKeys: readonly string[] }>
  | Readonly<{ kind: 'ownerEvent'; at: Boundary; ownerWeek: number; draft: StudioEventDraft }>
  | Readonly<{ kind: 'firstTake'; at: Boundary; productionId: string }>
  | Readonly<{ kind: 'releaseAdmitted'; at: Boundary; productionId: string }>
export type StartedReplayProjection<P extends StartedPicture> = Readonly<{
  week: number; productions: readonly P[]; operations: StudioOperations
  sets: readonly StudioSet[]; technology: StudioTechnology
  releaseAuthority: StudioReleaseAuthority; completedBackgroundPathKeys: readonly string[]
}>
export type StartedReplayAttempt<P extends StartedPicture> =
  | Readonly<{ kind: 'complete'; trace: JointOwnerTrace; projection: StartedReplayProjection<P>;
      provenance: readonly ReplayObservation[] }>
  | Readonly<{ kind: 'cut'; traceKey: string; through: Boundary;
      reason: 'unsupportedContext' | 'rivalPolicyUnsupported' | 'commandRefused' | 'workLimit' | 'sizeLimit';
      detail: string; provenance: readonly ReplayObservation[] }>
export type StartedOwnerReplayResult<P extends StartedPicture> = Readonly<{
  fixedHolds: readonly FixedHold[]; attempts: readonly StartedReplayAttempt<P>[]
  preparationWork: number; omissions: readonly string[]
}>

class WorkLimit extends Error {}
class ContextCut extends Error {
  constructor(readonly reason: 'unsupportedContext' | 'rivalPolicyUnsupported' | 'sizeLimit', detail: string) {
    super(detail)
  }
}
class CommandRefused extends Error {}
function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Started owner replay: ${message}`)
}
function natural(value: number, name: string): void {
  invariant(Number.isSafeInteger(value) && value >= 0, `${name} must be a nonnegative safe integer`)
}
const CEILING = 200001
/**
 * Fixed SOURCE schemas, not caller records. Compute their exact literal costs
 * once at module initialization; no input-dependent discovery/caching occurs.
 * Each use below pays the number BEFORE constructing that record. Nested
 * records/arrays, callbacks and append writes are additional charges.
 */
function literalCost(...keys: readonly string[]): number {
  let result = 1
  for (const key of keys) result += 1 + key.length
  return result
}
const LITERAL = Object.freeze({
  boundary: literalCost('week', 'step'),
  decoration: literalCost('value', 'key'),
  person: literalCost('kind', 'personId'),
  resource: literalCost('kind', 'resourceKey', 'slot'),
  plan: literalCost('traceKey', 'commands'),
  pictureFacts: literalCost('production', 'workflow', 'people', 'genre', 'historicallyFilmed', 'pathKey'),
  backgroundFacts: literalCost('kind', 'row', 'people', 'pathKey'),
  mount: literalCost('set', 'pathKey'),
  hold: literalCost('holdId', 'ownerKey', 'ownerPathKey', 'subject', 'from', 'until'),
  fixedHold: literalCost('holdId', 'ownerKey', 'ownerPathKey', 'subject', 'from', 'until', 'replaceableFrom'),
  prepared: literalCost('pictures', 'backgrounds', 'mounts', 'plans', 'fixed', 'now', 'end', 'factRef'),
  dimensions: literalCost('n', 'f', 'capacity', 'sets', 'external', 'd', 'dp', 'pCopy',
    'workflowCopy', 'taskCopy', 'bindingsCopy', 'operationsCopy', 'setCopy', 'setupCopy',
    'technologyCopy', 'technologyRowCopy', 't', 'adoptions', 'access', 'equipment',
    'placements', 'structures', 'provides', 'cells', 'genreRows', 'genreId', 'allSilent'),
  ledgerRow: literalCost('hold', 'fixed', 'closed'),
  calendar: literalCost('productionId', 'firstTake', 'personRelease'),
  replacement: literalCost('holdId', 'newUntil'),
  wrapped: literalCost('id', 'stage', 'setId'),
  expected: literalCost('path', 'subject'),
  picture: literalCost('kind', 'jointTraceKey', 'key', 'pathKey', 'issuerId', 'existingPath',
    'greenlight', 'firstTake', 'personRelease', 'cast', 'staffingWitnessKey', 'ownerFactRefs',
    'additionalHolds', 'holdReplacements'),
  background: literalCost('kind', 'jointTraceKey', 'pathKey', 'issuerId', 'existingPath', 'ownerFactRefs'),
  trace: literalCost('kind', 'traceKey', 'ownerFactRefs', 'paths', 'fixedHoldReplacements', 'additionalHolds'),
  command: literalCost('kind', 'at', 'command'),
  backgroundCompleted: literalCost('kind', 'at', 'pathKey', 'dueWeek', 'owner'),
  sweepStarted: literalCost('kind', 'at', 'externalSlotKeys'),
  ownerEvent: literalCost('kind', 'at', 'ownerWeek', 'draft'),
  pictureEvent: literalCost('kind', 'at', 'productionId'),
  technologyFacts: literalCost('technology', 'market', 'placement', 'hollywood'),
  technologyCollector: literalCost('technology', 'policy'),
  technologyPolicy: literalCost('allowsFacility', 'beforePhaseEntered'),
  market: literalCost('tick'),
  binding: literalCost('sets', 'genreOf'),
  releaseOwner: literalCost('productions', 'concepts', 'operations', 'releaseAuthority'),
  releaseCommitted: literalCost('kind', 'productionId'),
  commitments: literalCost('commitments'),
  commitment: literalCost('productionId', 'commitmentId', 'committedAtWeek'),
  stampedEvent: literalCost('draft', 'week'),
  sink: literalCost('baseWeek', 'recording', 'drafts'),
  branch: literalCost('week', 'step', 'productions', 'operations', 'sets', 'technology',
    'releaseAuthority', 'completed', 'provenance', 'ledger', 'replacements', 'calendars', 'nextHold'),
  projection: literalCost('week', 'productions', 'operations', 'sets', 'technology',
    'releaseAuthority', 'completedBackgroundPathKeys'),
  complete: literalCost('kind', 'trace', 'projection', 'provenance'),
  cut: literalCost('kind', 'traceKey', 'through', 'reason', 'detail', 'provenance'),
  result: literalCost('fixedHolds', 'attempts', 'preparationWork', 'omissions'),
  contextError: literalCost('reason', 'message'),
  commandError: literalCost('message'),
})
// An appended element reserves capacity(1), invocation(1), reference write(1).
const APPEND = 3
class Work {
  used: number
  constructor(readonly limit: number, initial: number) { this.used = Math.min(limit, initial) }
  pay(units = 1): void {
    if (units > this.limit - this.used) { this.used = this.limit; throw new WorkLimit() }
    this.used += units
  }
  /** Evaluate the receiver BEFORE JavaScript evaluates calculator arguments.
   * Each source call reserves two units per scalar operand-read/operator:
   * 8/16/32/64 cover <=4/8/16/32 nodes respectively. Nested paid calls own
   * their own trees, not this allowance. No callbacks/rest arrays are hidden.
   */
  calc(units: 8 | 16 | 32 | 64): this { this.pay(units); return this }
  /** No rest/temporary array is allocated before payment. All call sites have
   * at most18 operands. Entry/optional-argument guards cost20; each of the k-1
   * saturating adds costs8 BEFORE its subtraction/check/add. Binary
   * callers use add directly, with no optional-argument guards or add(0,a).
   * No early return
   * evades charges for argument expressions (which execute before this call).
   */
  plus(a: number, b: number, c?: number, d?: number, e?: number, f?: number,
    g?: number, h?: number, i?: number, j?: number, k?: number, l?: number,
    m?: number, n?: number, o?: number, p?: number, q?: number, r?: number): number {
    this.pay(20)
    let result = this.add(a, b)
    if (c !== undefined) result = this.add(result, c)
    if (d !== undefined) result = this.add(result, d)
    if (e !== undefined) result = this.add(result, e)
    if (f !== undefined) result = this.add(result, f)
    if (g !== undefined) result = this.add(result, g)
    if (h !== undefined) result = this.add(result, h)
    if (i !== undefined) result = this.add(result, i)
    if (j !== undefined) result = this.add(result, j)
    if (k !== undefined) result = this.add(result, k)
    if (l !== undefined) result = this.add(result, l)
    if (m !== undefined) result = this.add(result, m)
    if (n !== undefined) result = this.add(result, n)
    if (o !== undefined) result = this.add(result, o)
    if (p !== undefined) result = this.add(result, p)
    if (q !== undefined) result = this.add(result, q)
    if (r !== undefined) result = this.add(result, r)
    return result
  }
  /** Exact fixed-binary saturation for nonnegative admitted cost operands. */
  add(a: number, b: number): number {
    this.pay(8)
    return b >= CEILING - a ? CEILING : a + b
  }
  times(a: number, b: number): number {
    this.pay(10)
    if (a === 0 || b === 0) return 0
    return a >= CEILING || b >= CEILING || a > Math.floor(CEILING / b) ? CEILING : a * b
  }
  equality(length: number): number {
    this.pay(4)
    return this.calc(8).add(1, this.calc(8).times(2, length))
  }
  keyBill(count: number, length: number): number {
    this.pay(4)
    return this.calc(8).plus(1, length, this.calc(8).times(count, this.calc(8).equality(length)))
  }
  text(value: string): string { this.pay(1 + value.length); return value }
  equal(a: string, b: string): boolean { this.pay(1 + a.length + b.length); return a === b }
  /** No Object.keys allocation before payment, and no traversal of opaque values. */
  copyCost(value: object): number {
    let cost = 1
    this.pay()
    for (const key in value) {
      this.pay(3 + key.length)
      if (Object.prototype.hasOwnProperty.call(value, key)) cost = this.calc(8).add(cost, 3 + key.length)
    }
    return cost
  }
  token(first: string, second: string | number, third: string | number, fourth?: string | number): string {
    const length = fourth === undefined ? 3 : 4
    // Pay array allocation/capacity AND element writes before the tuple exists.
    // Fixed positional arguments avoid an unprepaid caller tuple/rest array.
    this.pay(6 + 1 + 2 * length)
    const parts = fourth === undefined ? [first, second, third] : [first, second, third, fourth]
    // JSON escaping can produce six output characters per UTF-16 code unit.
    this.pay(8)
    let cost = 3 + 2 * parts.length
    for (const part of parts) {
      this.pay(6) // loop/type dispatch; arithmetic helpers pay their own calls
      cost = this.calc(16).add(cost, typeof part === 'string' ? 2 + this.calc(8).times(7, part.length) : 25)
    }
    this.pay(cost)
    return JSON.stringify(parts)
  }
}

function contextCut(work: Work, reason: ContextCut['reason'], detail: string): never {
  work.pay(8 + LITERAL.contextError + reason.length + detail.length)
  throw new ContextCut(reason, detail)
}
function commandRefused(work: Work, detail: string): never {
  work.pay(8 + LITERAL.commandError + detail.length)
  throw new CommandRefused(detail)
}

/** Scalarization of the actual boundedStableSort body; comparator body prepaid. */
function sortBill(n: number, comparator: number, work: Work): number {
  work.pay(10)
  if (n < 2) return 6 + 2 * n
  let levels = 0, runs = 0
  for (let width = 1; width < n; width *= 2) {
    work.pay(6) // loop/scalar steps; sum pays itself
    levels++
    runs = work.calc(16).add(runs, Math.ceil(n / (2 * width)))
  }
  work.pay(22) // scalar additions/reads/dispatch; every sum/product pays itself
  return work.calc(64).plus(10, work.calc(8).times(3, n), work.calc(8).times(8, levels), work.calc(8).times(19, runs),
    work.calc(32).times(5, work.calc(8).times(n, levels)), work.calc(32).times(8 + comparator, work.calc(8).times(n, levels)))
}
function sorted<T>(values: readonly T[], keyOf: (value: T) => string, work: Work): T[] {
  work.pay(4) // local setup + empty decoration array
  let max = 0
  const rows: { value: T; key: string }[] = []
  for (const value of values) {
    work.pay(6 + LITERAL.decoration + APPEND)
    const key = keyOf(value)
    work.text(key)
    max = Math.max(max, key.length)
    rows.push({ value, key })
  }
  work.pay(8) // comparator-bound argument reads/arithmetic before sortBill
  work.pay(sortBill(rows.length, 6 + 2 * (1 + 2 * max), work))
  const ordered = boundedStableSort(rows, (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
  work.pay(2 + 3 * ordered.length)
  return ordered.map(row => row.value)
}
function find<T>(rows: readonly T[], id: string, keyOf: (row: T) => string, work: Work): T | undefined {
  work.pay(2)
  for (const row of rows) {
    work.pay(2)
    if (work.equal(keyOf(row), id)) return row
  }
  return undefined
}
function uniqueIds<T>(rows: readonly T[], keyOf: (row: T) => string, work: Work): void {
  const ordered = sorted(rows, keyOf, work)
  for (let i = 1; i < ordered.length; i++) {
    work.pay(3)
    invariant(!work.equal(keyOf(ordered[i - 1]!), keyOf(ordered[i]!)), 'duplicate consumed identity')
  }
}

type Background = {
  kind: 'screenplay'; row: ScriptProject; pathKey: string; people: readonly string[]
} | { kind: 'castingSession'; row: CastingSession; pathKey: string; people: readonly string[] }
type PictureFacts<P extends StartedPicture> = {
  production: P; workflow: ProductionWorkflow; pathKey: string; people: readonly string[]
  genre: Genre; historicallyFilmed: boolean
}
type Prepared<P extends StartedPicture> = {
  pictures: readonly PictureFacts<P>[]; backgrounds: readonly Background[]
  mounts: readonly { set: StudioSet; pathKey: string }[]
  plans: readonly StartedProductionPlan[]; fixed: readonly FixedHold[]
  now: Boundary; end: Boundary; factRef: string
}
function company<P extends StartedPicture>(productions: readonly P[], work: Work): readonly string[] {
  // Native Set calls: invocation, string span, all possible equal-key operands.
  let count = 0, chars = 0
  work.pay(3)
  for (const row of productions) {
    work.pay(8 + 1 + 2 * 4) // control + four-element literal array/capacity/writes
    const ids = [row.directorId, row.cast.lead, row.cast.antagonist, row.cast.support]
    for (const id of ids) { work.text(id); count++; chars = work.calc(8).add(chars, id.length) }
    for (const id of row.craftIds) { work.text(id); count++; chars = work.calc(8).add(chars, id.length) }
  }
  work.pay(work.calc(64).plus(5, work.calc(8).times(6, productions.length), work.calc(8).times(4, count), chars,
    work.calc(32).times(count, count + work.calc(8).times(2, chars))))
  const result = productionCompanyTalentIds(productions)
  work.pay(2 + 2 * result.size)
  return [...result]
}
function writers(project: ScriptProject, work: Work): readonly string[] {
  work.pay(8)
  work.text(project.writerId)
  let chars = 0
  for (const id of project.writerIds) { work.pay(2); work.text(id); chars = work.calc(8).add(chars, id.length) }
  work.pay(work.calc(64).plus(10, project.writerIds.length, work.calc(32).times(project.writerIds.length, 2 + project.writerId.length),
    chars))
  return scriptProjectWriterIds(project)
}
function bareKey(facilityId: string, slot: number, work: Work): string {
  work.pay(8 + 2 * facilityId.length + 32)
  return `${facilityId}:${slot}`
}
function reservationSubject<P extends StartedPicture>(source: StartedOwnerSource<P>,
  issuer: string, row: Pick<FacilityReservation, 'facilityId' | 'slot' | 'capability'>, work: Work): HoldSubject {
  work.pay(6)
  const facility = find(source.operations.facilities, row.facilityId, value => value.id, work)
  invariant(facility !== undefined && facility.capability === row.capability,
    'reservation references a foreign facility/capability')
  natural(row.slot, 'reservation slot')
  invariant(row.slot < facility.capacity, 'reservation slot exceeds capacity')
  work.pay(LITERAL.resource)
  return { kind: 'resource', resourceKey: work.token('facility', issuer, row.facilityId), slot: row.slot }
}
function prepare<P extends StartedPicture>(input: StartedOwnerReplayInput<P>, work: Work,
  plansPrepared: (plans: readonly StartedProductionPlan[]) => void): Prepared<P> {
  const { source, issuerId: issuer } = input
  work.pay(24)
  work.text(issuer)
  invariant(issuer.length > 0, 'issuer identity is empty')
  work.pay(2 * LITERAL.boundary)
  const now: Boundary = { week: source.market.tick, step: 0 }
  const end: Boundary = { week: input.horizonEndWeek, step: 0 }
  natural(now.week, 'source week'); natural(end.week, 'horizon')
  invariant(end.week >= now.week, 'horizon precedes source')
  if (end.week - now.week > input.limits.span) contextCut(work, 'sizeLimit', 'replay span exceeds limit')
  if (input.plans.length > input.limits.alternatives ||
      source.studio.activeProductions.length + 1 > input.limits.alternatives) {
    contextCut(work, 'sizeLimit', 'trace/path row limit')
  }
  work.pay(1)
  const rawPlans: StartedProductionPlan[] = []
  for (const plan of input.plans) {
    work.pay(5); work.text(plan.traceKey)
    invariant(plan.traceKey.length > 0, 'empty trace identity')
    work.pay(1)
    const commands: StartedProductionCommand[] = []
    for (const command of plan.commands) {
      work.pay(12); work.text(command.productionId); work.text(command.kind)
      natural(command.week, 'command week'); natural(command.ordinal, 'command ordinal')
      invariant(command.week >= now.week && command.week < end.week, 'command outside replay window')
      invariant(command.kind === 'assignLockedDirector' || command.kind === 'clearGrandfatheredScenery' ||
        command.kind === 'scheduleTake' || command.kind === 'commitRelease', 'unknown replay command')
      invariant(find(source.studio.activeProductions, command.productionId, row => row.id, work) !== undefined,
        'command references an absent original production')
      work.pay(APPEND)
      commands.push(command)
    }
    work.pay(sortBill(commands.length, 12, work))
    const ordered = boundedStableSort(commands, (a, b) => a.week - b.week || a.ordinal - b.ordinal)
    for (let i = 1; i < ordered.length; i++) {
      work.pay(5)
      invariant(ordered[i - 1]!.week !== ordered[i]!.week || ordered[i - 1]!.ordinal !== ordered[i]!.ordinal,
        'duplicate command week/ordinal')
    }
    work.pay(LITERAL.plan + APPEND)
    rawPlans.push({ traceKey: plan.traceKey, commands: ordered })
  }
  const plans = sorted(rawPlans, plan => plan.traceKey, work)
  for (let i = 1; i < plans.length; i++) {
    work.pay(3)
    invariant(!work.equal(plans[i - 1]!.traceKey, plans[i]!.traceKey), 'duplicate trace identity')
  }
  work.pay(9)
  plansPrepared(plans)
  if (source.hollywood === null || source.founding !== null || source.operations.mode !== 'managed') {
    contextCut(work, 'unsupportedContext', 'founded managed player context required')
  }
  if (!work.equal(source.hollywood.playerStudioId, issuer)) {
    contextCut(work, 'rivalPolicyUnsupported', 'rival weekly policy is not replayed')
  }
  if (source.productionQueue.length > 0) contextCut(work, 'unsupportedContext', 'current queue may admit new work')
  for (const row of source.physicalPlans.plans) {
    work.pay(5)
    if (work.equal(row.studioId, issuer) && (row.status === 'queued' || row.status === 'held' || row.status === 'blocked')) {
      contextCut(work, 'unsupportedContext', 'current physical plan may change owner facts')
    }
  }
  for (const row of source.construction.projects) {
    work.pay(3)
    if (row.status === 'building') contextCut(work, 'unsupportedContext', 'active legacy construction')
  }
  for (const row of source.placement.facilities) {
    work.pay(4)
    if (row.status === 'underConstruction') contextCut(work, 'unsupportedContext', 'active placement or installation')
  }
  for (const row of source.sets) {
    work.pay(4)
    if (row.status === 'under-construction') contextCut(work, 'unsupportedContext', 'active Set construction/repair')
  }
  for (const row of source.technology.projects) {
    work.pay(4)
    if (work.equal(row.studioId, issuer) && row.status === 'active') {
      contextCut(work, 'unsupportedContext', 'active player research')
    }
  }
  for (const row of source.technology.adoptions) {
    work.pay(5)
    if (work.equal(row.studioId, issuer) && row.cancelledWeek === null && row.operationalWeek === null) {
      contextCut(work, 'unsupportedContext', 'pending player adoption')
    }
  }
  uniqueIds(source.operations.facilities, row => row.id, work)
  for (const facility of source.operations.facilities) {
    work.pay(5); work.text(facility.capability)
    natural(facility.capacity, 'facility capacity')
  }
  invariant(source.operations.workflows.length === source.studio.activeProductions.length,
    'production/workflow cardinality differs')
  uniqueIds(source.studio.activeProductions, row => row.id, work)
  uniqueIds(source.operations.workflows, row => row.productionId, work)
  work.pay(2)
  const pictures: PictureFacts<P>[] = []
  const relevant: string[] = []
  const addRelevant = (id: string): void => {
    work.pay(3); work.text(id)
    if (find(relevant, id, value => value, work) === undefined) {
      work.pay(APPEND); relevant.push(id)
    }
  }
  for (const id of input.claimPersonIds) addRelevant(id)
  for (const production of source.studio.activeProductions) {
    work.pay(12); work.copyCost(production)
    natural(production.startTick, 'production start'); natural(production.remainingTicks, 'production countdown')
    invariant(production.startTick <= now.week && production.remainingTicks > 0, 'invalid current production clock')
    const workflow = find(source.operations.workflows, production.id, row => row.productionId, work)
    invariant(workflow !== undefined, 'production has no workflow')
    work.pay(8)
    invariant(workflow.phase === productionPhaseForRemainingTicks(production.remainingTicks), 'phase/countdown mismatch')
    invariant(workflow.reservations.length <= 2, 'too many current phase reservations')
    const concept = find(source.concepts, production.conceptId, row => row.id, work)
    invariant(concept !== undefined, 'production concept is absent')
    work.pay(3) // singleton input array + its reference write
    const people = company([production], work)
    for (const id of people) addRelevant(id)
    let historicallyFilmed = production.remainingTicks < 5
    for (const take of source.firstTakes) {
      work.pay(5)
      if (work.equal(take.productionId, production.id) && work.equal(take.studioId, issuer)) historicallyFilmed = true
    }
    work.pay(LITERAL.pictureFacts + APPEND)
    pictures.push({ production, workflow, people, genre: concept.genre, historicallyFilmed,
      pathKey: work.token('production', issuer, production.id) })
  }
  work.pay(1)
  const backgrounds: Background[] = []
  for (const project of source.scriptDevelopment.projects) {
    work.pay(7)
    if (project.status !== 'drafting' && project.status !== 'rewriting') continue
    invariant(source.scriptDevelopment.mode === 'managed' && project.reservation !== null && project.dueWeek !== null,
      'active screenplay lacks managed timing/reservation')
    const people = writers(project, work)
    for (const id of people) addRelevant(id)
    work.pay(LITERAL.backgroundFacts + APPEND)
    backgrounds.push({ kind: 'screenplay', row: project, people,
      pathKey: work.token('screenplay', issuer, project.id) })
  }
  for (const session of source.castingSessions.sessions) {
    work.pay(7)
    if (session.status !== 'auditioning') continue
    invariant(source.castingSessions.mode === 'managed' && session.reservation !== null && session.dueWeek !== null,
      'active audition lacks managed timing/reservation')
    work.pay(LITERAL.backgroundFacts + APPEND + 1)
    backgrounds.push({ kind: 'castingSession', row: session, people: [],
      pathKey: work.token('castingSession', issuer, session.id) })
  }
  // Read actual foreign companies and indexed writer pools, not caller flags.
  for (const business of source.hollywood.businesses) {
    work.pay(4)
    if (work.equal(business.studioId, issuer)) continue
    for (const id of company(business.productions, work)) {
      if (find(relevant, id, value => value, work) !== undefined) {
        contextCut(work, 'unsupportedContext', 'relevant current foreign company')
      }
    }
    for (const ordinal of business.activeScriptOrdinals) {
      work.pay(12)
      const project = business.development.projects[ordinal], costs = business.projects[ordinal]
      invariant(project !== undefined && costs !== undefined, 'missing indexed foreign screenplay')
      const indexedConcept = source.hollywood.concepts[costs.conceptOrdinal]
      invariant(work.equal(costs.scriptProjectId, project.id) && work.equal(costs.conceptId, project.conceptId) &&
        indexedConcept !== undefined && work.equal(indexedConcept.id, project.conceptId), 'foreign screenplay join mismatch')
      if (project.status !== 'drafting' && project.status !== 'rewriting') continue
      for (const id of writers(project, work)) {
        if (find(relevant, id, value => value, work) !== undefined) {
          contextCut(work, 'unsupportedContext', 'relevant current foreign screenplay')
        }
      }
    }
  }
  for (const project of source.technology.projects) {
    work.pay(5)
    if (work.equal(project.studioId, issuer) || project.status !== 'active') continue
    for (const seat of project.seats) {
      work.pay(4)
      if (seat.releasedWeek === null && find(relevant, seat.talentId, id => id, work) !== undefined) {
        contextCut(work, 'unsupportedContext', 'relevant current foreign research seat')
      }
    }
  }
  work.pay(1)
  const mounts: { set: StudioSet; pathKey: string }[] = []
  for (const set of source.sets) {
    work.pay(3)
    if (set.status === 'standing') {
      work.pay(LITERAL.mount + APPEND)
      mounts.push({ set, pathKey: work.token('setMount', issuer, set.id) })
    }
  }
  work.pay(6)
  const rowsPerTrace = 1 + pictures.length + backgrounds.length + mounts.length
  if (rowsPerTrace > input.limits.alternatives || plans.length > Math.floor(input.limits.alternatives / rowsPerTrace)) {
    contextCut(work, 'sizeLimit', 'global trace/path occurrence limit')
  }
  work.pay(1)
  const fixed: FixedHold[] = []
  const hold = (pathKey: string, subject: HoldSubject): void => {
    work.pay(4 + LITERAL.fixedHold + APPEND)
    const subjectId = subject.kind === 'person' ? subject.personId : subject.resourceKey
    fixed.push({ holdId: work.token('fixed', pathKey, fixed.length), ownerKey: issuer, ownerPathKey: pathKey,
      subject, from: now, until: end, replaceableFrom: now })
    work.text(subjectId)
  }
  for (const picture of pictures) {
    work.pay(4)
    for (const personId of picture.people) {
      work.pay(2 + LITERAL.person); hold(picture.pathKey, { kind: 'person', personId })
    }
    for (const reservation of picture.workflow.reservations) {
      invariant(work.equal(reservation.productionId, picture.production.id), 'reservation owner differs')
      hold(picture.pathKey, reservationSubject(source, issuer, reservation, work))
    }
    work.pay(3 + work.calc(32).times(picture.workflow.reservations.length, 42))
    const stage = picture.workflow.reservations.find(row => row.capability === 'soundstage')
    invariant(picture.workflow.bindings.stageFacilityId === (stage?.facilityId ?? null), 'stage binding differs')
    if (stage !== undefined && picture.workflow.bindings.setId !== null) {
      const set = find(source.sets, picture.workflow.bindings.setId, row => row.id, work)
      invariant(set !== undefined && set.status === 'standing' && work.equal(set.mountedOn, stage.facilityId),
        'bound Set is not mounted on occupied stage')
      work.pay(LITERAL.resource)
      hold(picture.pathKey, { kind: 'resource', resourceKey: work.token('set', issuer, set.id), slot: 0 })
    }
  }
  for (const background of backgrounds) {
    work.pay(3)
    for (const personId of background.people) {
      work.pay(2 + LITERAL.person); hold(background.pathKey, { kind: 'person', personId })
    }
    invariant(background.row.reservation !== null, 'active background has no reservation')
    hold(background.pathKey, reservationSubject(source, issuer, background.row.reservation, work))
  }
  for (const mount of mounts) {
    work.pay(2 + LITERAL.resource)
    hold(mount.pathKey, { kind: 'resource', resourceKey: work.token('mount', issuer, mount.set.mountedOn), slot: 0 })
  }
  work.pay(LITERAL.prepared)
  return { pictures, backgrounds, mounts, plans, fixed, now, end,
    factRef: work.token('source', issuer, now.week) }
}

type Dimensions = {
  n: number; f: number; capacity: number; sets: number; external: number
  d: number; dp: number; pCopy: number; workflowCopy: number; taskCopy: number
  bindingsCopy: number; operationsCopy: number; setCopy: number; setupCopy: number
  technologyCopy: number; technologyRowCopy: number; t: number; adoptions: number
  access: number; equipment: number; placements: number; structures: number
  provides: number; cells: number; genreRows: number; genreId: number; allSilent: boolean
}
function dimensions<P extends StartedPicture>(source: StartedOwnerSource<P>, productions: readonly P[],
  operations: StudioOperations, sets: readonly StudioSet[], technology: StudioTechnology,
  external: number, work: Work): Dimensions {
  work.pay(12 + LITERAL.dimensions)
  const d: Dimensions = { n: productions.length, f: operations.facilities.length, capacity: 0,
    sets: sets.length, external, d: 22, dp: 0, pCopy: 0, workflowCopy: 98, taskCopy: 66,
    bindingsCopy: 95, operationsCopy: work.copyCost(operations), setCopy: 137, setupCopy: 0,
    technologyCopy: work.copyCost(technology), technologyRowCopy: 62,
    t: technology.productions.length, adoptions: technology.adoptions.length,
    access: technology.access.length, equipment: technology.equipment.length,
    placements: source.placement.facilities.length, structures: 0, provides: 0,
    cells: 0, genreRows: source.studio.activeProductions.length, genreId: 0, allSilent: true }
  const text = (value: string): void => { work.pay(2); work.text(value); d.d = Math.max(d.d, value.length) }
  const strings = <T extends object>(row: T): void => {
    for (const key in row) {
      work.pay(3 + key.length)
      if (Object.prototype.hasOwnProperty.call(row, key)) {
        const value = row[key]
        if (typeof value === 'string') text(value)
      }
    }
  }
  if (source.hollywood !== null) text(source.hollywood.playerStudioId)
  for (const original of source.studio.activeProductions) {
    work.pay(3); work.text(original.id)
    d.genreId = Math.max(d.genreId, original.id.length)
  }
  for (const row of productions) {
    work.pay(4); text(row.id); text(row.directorId)
    d.dp = Math.max(d.dp, row.id.length)
    d.pCopy = Math.max(d.pCopy, work.copyCost(row))
  }
  for (const row of operations.facilities) {
    work.pay(5); strings(row); natural(row.capacity, 'facility capacity')
    d.capacity = work.calc(8).add(d.capacity, row.capacity)
  }
  for (const row of operations.workflows) {
    work.pay(7); strings(row); strings(row.bindings)
    d.workflowCopy = Math.max(d.workflowCopy, work.copyCost(row))
    d.bindingsCopy = Math.max(d.bindingsCopy, work.copyCost(row.bindings))
    for (const reservation of row.reservations) { work.pay(); strings(reservation) }
    if (row.shootingTask !== null) {
      strings(row.shootingTask); d.taskCopy = Math.max(d.taskCopy, work.copyCost(row.shootingTask))
    }
    if (row.setup !== null && row.setup !== undefined) {
      strings(row.setup); d.setupCopy = Math.max(d.setupCopy, work.copyCost(row.setup))
    }
  }
  for (const row of sets) { work.pay(3); strings(row); d.setCopy = Math.max(d.setCopy, work.copyCost(row)) }
  for (const row of technology.productions) {
    work.pay(3); strings(row); d.technologyRowCopy = Math.max(d.technologyRowCopy, work.copyCost(row))
    if (row.method !== 'silent') d.allSilent = false
  }
  for (const row of technology.adoptions) { work.pay(); strings(row) }
  for (const row of technology.access) { work.pay(); strings(row) }
  for (const row of technology.equipment) { work.pay(); strings(row) }
  work.pay(3)
  const property = propertyOf(source)
  d.structures = property.structures.length
  for (const row of property.structures) {
    work.pay(4)
    d.provides = work.calc(8).add(d.provides, row.providesFacilityIds.length)
    for (const id of row.providesFacilityIds) text(id)
  }
  for (const row of source.placement.facilities) {
    work.pay(5); strings(row)
    d.cells = work.calc(8).add(d.cells, row.cells.length)
    if (row.installation !== null && row.installation !== undefined) strings(row.installation)
  }
  return d
}
function workflowUpdate(d: Dimensions, work: Work): number {
  work.pay(8) // scalar/property reads; nested arithmetic pays itself
  return work.calc(64).plus(d.operationsCopy, 11, 2, d.n, work.calc(32).times(d.n, 2 + work.calc(8).equality(d.dp)))
}
function geometryBill(d: Dimensions, work: Work): number {
  work.pay(32) // scalar reads/locals; all NINE products and nested sums pay themselves
  // sceneryLoadInFor guards/reservation scan/result + TWO real body queries.
  // Body: structure filter/includes, placement filter, cell validation/sum/mean.
  const body = work.calc(64).plus(50, work.calc(8).times(d.structures, 8), work.calc(32).times(d.provides, 2 + work.calc(8).equality(d.d)),
    work.calc(32).times(d.placements, 3 + work.calc(8).equality(d.d)), work.calc(8).times(d.cells, 10), d.structures, d.placements)
  return work.calc(64).plus(130, work.calc(32).times(2, work.calc(8).equality(d.d)), work.calc(8).times(2, body))
}
function arrivalBill(d: Dimensions, operations: StudioOperations, work: Work): number {
  let possible = 0
  work.pay(4)
  for (const workflow of operations.workflows) {
    work.pay(5)
    if (workflow.phase === 'shooting' && workflow.shootingTask?.status === 'blocked' &&
      workflow.blocker?.kind === 'scenery-load-in') possible++
  }
  work.pay(16) // scalar formula reads; nested calculators each charge themselves
  return work.calc(64).plus(18, work.calc(32).times(d.n, 14 + work.calc(32).times(4, work.calc(8).equality(d.d))),
    work.calc(32).times(possible, work.calc(64).plus(geometryBill(d, work), 70, d.workflowCopy, d.taskCopy, workflowUpdate(d, work))))
}
function orderBill(d: Dimensions, work: Work): number {
  work.pay(16) // scalar decoration/comparator arithmetic, excluding paid helpers
  return work.calc(64).plus(4, work.calc(8).times(2, d.n), work.calc(32).times(d.n, 67 + 2 * d.dp),
    sortBill(d.n, 28 + 2 * work.calc(8).equality(d.dp), work))
}
/** 162 exact restricted branch inventory, with measured generic copy footprints. */
function restrictedSweepBill<P extends StartedPicture>(d: Dimensions, productions: readonly P[],
  operations: StudioOperations, week: number, commitments: ReadonlySet<string>, work: Work): number {
  let active = 0, q = 0, t = 0, c = 0, o = 0, r = 0, copies = 0, takeCopies = 0, taskText = 0
  work.pay(18)
  for (const production of productions) {
    work.pay(32) // branch/property/scalar work; copy-bill sums pay themselves
    if (production.startTick >= week) continue
    active++
    const workflow = find(operations.workflows, production.id, row => row.productionId, work)
    invariant(workflow !== undefined, 'workflow disappeared before billing')
    if (production.remainingTicks === 5) {
      q++
      if (workflow.shootingTask !== null) taskText = work.calc(16).add(taskText, 1 + workflow.shootingTask.status.length + 9)
      if (workflow.shootingTask?.status === 'scheduled' && workflow.blocker === null) {
        t++; copies = work.calc(64).plus(copies, d.pCopy, 15)
        takeCopies = work.calc(64).plus(takeCopies, d.workflowCopy, 13, d.taskCopy, 7)
      }
    } else if (production.remainingTicks === 3) {
      c++; copies = work.calc(64).plus(copies, d.pCopy, 15)
    } else {
      o++; work.pay(work.calc(8).keyBill(commitments.size, d.dp))
      if (commitments.has(production.id)) { r++; copies = work.calc(64).plus(copies, d.pCopy, 15) }
    }
  }
  work.pay(192) // at most96 scalar reads/operators, two units each; helpers separate
  const delta = r > 0 ? 1 : 0, visits = work.calc(32).times(d.n, 1 + delta)
  const assoc = work.calc(8).add(work.calc(32).times((4 + delta) * d.n + active + t + c + r + t, work.calc(8).keyBill(d.n, d.dp)),
    work.calc(32).times(o, work.calc(8).keyBill(commitments.size, d.dp)))
  const control = work.calc(64).plus(5, d.n, 3 * (1 + delta) + 1, visits, d.n, 4 * active,
    d.n - active, 3 * q, t, 3 * (c + o), 2 * c, 2 * o, 3 * r, 1)
  return work.calc(64).plus(orderBill(d, work), assoc, work.calc(32).times(active, 1 + work.calc(32).times(d.n, 1 + work.calc(8).equality(d.dp))),
    work.calc(32).times(t + r, workflowUpdate(d, work)), copies, takeCopies,
    work.calc(32).times(active + c, work.calc(8).equality(14)), taskText, work.calc(32).times(1 + r, 15),
    65, work.calc(8).times(6, d.n), work.calc(8).times(4, t), work.calc(8).times(2, r), control, work.calc(8).times(11, r))
}

/** Occupancy + actual filter/policy/sort + capacity loops, not a free-slot forecast. */
function allocationBill(d: Dimensions, wrapOnly: boolean, work: Work, retainedDevelopment = false): number {
  work.pay(192) // at most96 scalar reads/operators, two units each; helpers separate
  // In both narrowed domains own claims are excluded FROM OCCUPANCY. Unlike
  // wrapped Post acquisition, Development still has its original reservation
  // when the eager raw producer runs, so raw claims must include its owner too.
  const other = wrapOnly || retainedDevelopment ? Math.max(0, d.n - 1) : d.n
  const rawOwners = retainedDevelopment ? d.n : other
  const claims = work.calc(8).times(4, rawOwners), occupied = work.calc(8).add(d.external, work.calc(8).times(3, other))
  const text = work.calc(8).equality(d.d), keyLength = work.calc(8).add(d.d, 26), keyConstruction = work.calc(8).add(50, work.calc(8).times(2, d.d))
  // Full raw claim producer including excluded rows, empty research sort and
  // second bound-Set pass. Every two generated key strings is paid per claim.
  const raw = work.calc(64).plus(40, 1 + claims, 2 * d.n, work.calc(32).times(2 * rawOwners, text),
    work.calc(32).times(claims, work.calc(8).add(89, work.calc(8).times(2, keyConstruction))))
  const occupancy = work.calc(64).plus(raw, 4, d.external, work.calc(32).times(claims, 6 + 3 * text),
    work.calc(32).times(occupied, work.calc(8).add(5, work.calc(32).times(3, work.calc(8).keyBill(occupied, keyLength)))))
  // Every facility invokes selection. Sound paths may additionally scan the
  // entire adoption/installation roots. These rows are branch-local, unchanged
  // in cardinality except at most N actual shooting locks during this sweep.
  const selection = work.calc(8).add(17, work.calc(32).times(d.t + (wrapOnly || retainedDevelopment ? 0 : d.n), 1 + 2 * text))
  const adoption = work.calc(64).plus(30, work.calc(32).times(d.adoptions, 8 + 3 * text), work.calc(32).times(2 * d.placements, 8 + 4 * text))
  const callback = work.calc(8).add(selection, adoption)
  const facilitySort = sortBill(d.f, 6 + 2 * text, work)
  // A certified held Development slot takes the retained arm's continue;
  // neither the generic capacity search nor stage+Set composite is reached.
  const slots = retainedDevelopment ? 0 : work.calc(32).times(wrapOnly ? d.capacity : 3 * d.capacity,
    work.calc(64).plus(5, keyConstruction, work.calc(32).times(2, work.calc(8).keyBill(occupied + 2, keyLength))))
  const retention = work.calc(8).add(20, work.calc(32).times(2, work.calc(64).plus(20, work.calc(8).times(2, text), work.calc(32).times(d.f, 2 + text),
    work.calc(8).keyBill(2, 19), keyConstruction, work.calc(8).keyBill(occupied + 2, keyLength))))
  const composite = wrapOnly || retainedDevelopment ? 0 : work.calc(64).plus(20, work.calc(32).times(d.n, work.calc(64).plus(9, text, work.calc(8).times(2, text), work.calc(8).keyBill(d.n, d.d))),
    work.calc(32).times(d.f, work.calc(64).plus(5, text, work.calc(32).times(d.sets, work.calc(64).plus(14, work.calc(8).times(3, text), work.calc(8).keyBill(d.n, d.d))))))
  return work.calc(64).plus(occupancy, 3 + 3 * d.f, work.calc(8).times(d.f, callback), facilitySort, retention,
    work.calc(32).times(wrapOnly ? 1 : 2, work.calc(32).times(d.f, 2 + text)), slots, composite, 140)
}

function sweepBill<P extends StartedPicture>(d: Dimensions, productions: readonly P[],
  operations: StudioOperations, week: number, commitments: ReadonlySet<string>, work: Work): number {
  work.pay(6)
  let restricted = true, wrapOnly = productions.length > 0
  for (const production of productions) {
    work.pay(6)
    if (production.startTick < week && production.remainingTicks !== 5 && production.remainingTicks !== 3 && production.remainingTicks !== 1) restricted = false
    if (production.startTick >= week || production.remainingTicks !== 4) wrapOnly = false
  }
  if (restricted) return restrictedSweepBill(d, productions, operations, week, commitments, work)
  // A BOUND, not an alternate simulation. Inspect actual input facts before
  // selecting it, and still execute the unchanged whole-slate owner below.
  let retainedDevelopment = true, retainedMoves = 0
  work.pay(4)
  for (const production of productions) {
    work.pay(6)
    if (production.startTick >= week) continue
    if (production.remainingTicks !== 8) { retainedDevelopment = false; break }
    const workflow = find(operations.workflows, production.id, row => row.productionId, work)
    invariant(workflow !== undefined, 'workflow disappeared before retained-Development billing')
    work.pay(20)
    const reservation = workflow.reservations[0]
    if (!work.equal(workflow.phase, 'development') || workflow.reservations.length !== 1 ||
        reservation === undefined || !work.equal(reservation.capability, 'development-casting') ||
        workflow.shootingTask !== null || workflow.blocker !== null || workflow.setup != null) {
      retainedDevelopment = false; break
    }
    retainedMoves++
  }
  work.pay(192) // at most96 scalar reads/operators, two units each; helpers separate
  const text = work.calc(8).equality(d.d), pid = work.calc(8).equality(d.dp)
  const keyLength = work.calc(8).add(d.d, 26), keyConstruction = work.calc(8).add(50, work.calc(8).times(2, d.d))
  // Max two reservations per phase. Both transition maps and both includes
  // passes (2x2 each) are billed, with every emitted key and sink wrapper.
  const transition = work.calc(64).plus(30, work.calc(8).times(4, keyConstruction), work.calc(32).times(8, work.calc(8).equality(keyLength)), 160)
  const releasePhase = work.calc(64).plus(80, work.calc(8).times(8, text), d.workflowCopy, d.bindingsCopy, 70)
  const wear = retainedDevelopment ? 0 : work.calc(64).plus(24, work.calc(32).times(d.sets, 5 + 2 * text), d.setCopy, 18)
  const update = workflowUpdate(d, work)
  const enter = work.calc(64).plus(releasePhase, 65, wear, work.calc(32).times(retainedDevelopment ? 1 : 2, transition), work.calc(32).times(retainedDevelopment ? 1 : 3, update),
    allocationBill(d, wrapOnly, work, retainedDevelopment), d.workflowCopy, d.bindingsCopy, d.pCopy, 150)
  // The real phase callback is still invoked; preProduction returns at its
  // first phase guard, before selection/locking/copying any technology root.
  const policyLock = retainedDevelopment ? work.calc(8).add(6, text) : wrapOnly ? 0 : work.calc(64).plus(80, work.calc(32).times(d.t + d.n, 6 + 2 * text),
    work.calc(32).times(d.adoptions, 8 + 3 * text), work.calc(32).times(2 * d.placements, 8 + 4 * text),
    d.technologyCopy, d.technologyRowCopy, 25, 2 * (d.t + d.n))
  const setup = wrapOnly || retainedDevelopment ? 0 : work.calc(64).plus(160, d.setupCopy, d.workflowCopy, update,
    work.calc(32).times(d.access, 8 + 2 * text), work.calc(32).times(d.adoptions, 12 + 3 * text),
    work.calc(32).times(d.equipment, 8 + 3 * text), work.calc(32).times(2 * d.placements, 8 + 4 * text), 140)
  const binding = wrapOnly || retainedDevelopment ? 0 : work.calc(64).plus(d.taskCopy, d.bindingsCopy, 150,
    work.calc(32).times(d.genreRows, 3 + work.calc(8).equality(Math.max(d.dp, d.genreId))))
  // Every active8 retains its own legal slot and succeeds once, with no
  // resource release/restart. One final all-settled round still visits n rows.
  const rounds = retainedDevelopment ? 2 : 2 * d.n + 1, visits = work.calc(8).times(d.n, rounds)
  let attempts = retainedDevelopment ? retainedMoves : visits
  if (wrapOnly) {
    // Tight source domain: only Post acquisition; no Post can release during
    // this sweep. If all policies are actually silent and enough currently
    // unheld Post slots exist, every initial attempt succeeds (no retry).
    let post = 0, heldPost = 0
    work.pay(5)
    for (const facility of operations.facilities) {
      work.pay(4)
      if (facility.capability === 'post') post = work.calc(8).add(post, facility.capacity)
    }
    for (const row of operations.workflows) for (const reservation of row.reservations) {
      work.pay(3)
      if (reservation.capability === 'post') heldPost++
    }
    // No external slots is a sufficient (not necessary) proof for this branch.
    if (d.allSilent && d.external === 0 && post - heldPost >= d.n) attempts = d.n
    else attempts = d.n % 2 === 0 ? work.calc(32).times(d.n / 2, d.n + 3) : work.calc(32).times(d.n, (d.n + 3) / 2)
  }
  const common = work.calc(64).plus(orderBill(d, work), 80, work.calc(32).times(d.n, work.calc(8).keyBill(d.n, d.dp)),
    work.calc(32).times(visits, work.calc(64).plus(25, work.calc(32).times(4, work.calc(8).keyBill(d.n, d.dp)), 1 + work.calc(32).times(d.n, 1 + pid),
      2 * text)), work.calc(32).times(d.n, work.calc(64).plus(d.pCopy, 15, update, d.workflowCopy, d.taskCopy, 100)),
    work.calc(32).times(d.n, work.calc(8).keyBill(commitments.size, d.dp)))
  work.pay(10)
  return work.calc(8).add(common, work.calc(32).times(attempts, work.calc(64).plus(enter, policyLock, setup, binding)))
}

type LedgerRow = { hold: Hold; fixed: boolean; closed: boolean }
type Calendar = { productionId: string; firstTake: Boundary | null; personRelease: Boundary | null }
type Branch<P extends StartedPicture> = {
  week: number; step: number; productions: readonly P[]; operations: StudioOperations
  sets: readonly StudioSet[]; technology: StudioTechnology; releaseAuthority: StudioReleaseAuthority
  completed: string[]; provenance: ReplayObservation[]; ledger: LedgerRow[]
  replacements: HoldReplacement[]; calendars: Calendar[]; nextHold: number
}
function sameSubject(a: HoldSubject, b: HoldSubject, work: Work): boolean {
  work.pay(3)
  if (a.kind === 'person') return b.kind === 'person' && work.equal(a.personId, b.personId)
  return b.kind === 'resource' && a.slot === b.slot && work.equal(a.resourceKey, b.resourceKey)
}
function boundary(branch: { week: number; step: number }, work: Work): Boundary {
  work.pay(5 + LITERAL.boundary)
  branch.step++
  return { week: branch.week, step: branch.step }
}
function closeHold<P extends StartedPicture>(branch: Branch<P>, pathKey: string, subject: HoldSubject,
  at: Boundary, work: Work): void {
  let found: LedgerRow | undefined
  work.pay(3)
  for (const row of branch.ledger) {
    work.pay(4)
    if (!row.closed && row.hold.ownerPathKey !== null && work.equal(row.hold.ownerPathKey, pathKey) &&
      sameSubject(row.hold.subject, subject, work)) {
      invariant(found === undefined, 'multiple live holds for one path/subject')
      found = row
    }
  }
  invariant(found !== undefined, 'owner released a subject it does not hold')
  work.pay(14 + work.copyCost(found.hold))
  found.hold = { ...found.hold, until: at }
  found.closed = true
  if (found.fixed) {
    work.pay(LITERAL.replacement + APPEND)
    branch.replacements.push({ holdId: found.hold.holdId, newUntil: at })
  }
}
function addHold<P extends StartedPicture>(branch: Branch<P>, plan: StartedProductionPlan, issuer: string,
  pathKey: string, subject: HoldSubject, at: Boundary, end: Boundary, work: Work): void {
  for (const row of branch.ledger) {
    work.pay(3)
    invariant(row.closed || !sameSubject(row.hold.subject, subject, work), 'owner granted an occupied subject')
  }
  work.pay(8 + LITERAL.ledgerRow + LITERAL.hold + APPEND)
  branch.ledger.push({ fixed: false, closed: false, hold: {
    holdId: work.token('grant', plan.traceKey, branch.nextHold++, issuer), ownerKey: issuer,
    ownerPathKey: pathKey, subject, from: at, until: end,
  } })
}
function closePath<P extends StartedPicture>(branch: Branch<P>, pathKey: string, at: Boundary,
  peopleOnly: boolean, work: Work): void {
  for (const row of branch.ledger) {
    work.pay(4)
    if (row.closed || row.hold.ownerPathKey === null || !work.equal(row.hold.ownerPathKey, pathKey) ||
      (peopleOnly && row.hold.subject.kind !== 'person')) continue
    work.pay(14 + work.copyCost(row.hold))
    row.hold = { ...row.hold, until: at }; row.closed = true
    if (row.fixed) {
      work.pay(LITERAL.replacement + APPEND)
      branch.replacements.push({ holdId: row.hold.holdId, newUntil: at })
    }
  }
}
function drainEvents<P extends StartedPicture>(input: StartedOwnerReplayInput<P>, prepared: Prepared<P>,
  plan: StartedProductionPlan, branch: Branch<P>, sink: StudioEventSink,
  before: StudioOperations, work: Work): void {
  work.pay(4) // drain invocation/setup + empty wrapped-fact array
  const events = sink.drain()
  const wrapped: { id: string; stage: string; setId: string | null }[] = []
  for (const { draft, week } of events) {
    work.pay(10 + work.copyCost(draft))
    const at = boundary(branch, work)
    work.pay(LITERAL.ownerEvent + APPEND)
    branch.provenance.push({ kind: 'ownerEvent', at, ownerWeek: week, draft })
    if (draft.kind === 'wrapped') {
      work.pay(2 + LITERAL.wrapped + APPEND)
      wrapped.push({ id: draft.productionId, stage: draft.stageFacilityId, setId: draft.setId })
    }
    if (draft.kind !== 'reservationReleased' && draft.kind !== 'reservationGranted') continue
    const picture = find(prepared.pictures, draft.ownerId, row => row.production.id, work)
    invariant(picture !== undefined, 'reservation event has no current picture trajectory')
    const previous = find(before.workflows, draft.ownerId, row => row.productionId, work)
    const current = find(branch.operations.workflows, draft.ownerId, row => row.productionId, work)
    const candidates = draft.kind === 'reservationReleased' ? previous?.reservations : current?.reservations
    invariant(candidates !== undefined, 'reservation event lacks its exact owner snapshot')
    let reservation: FacilityReservation | undefined
    for (const row of candidates) {
      work.pay(3)
      if (work.equal(bareKey(row.facilityId, row.slot, work), draft.resourceKey)) {
        invariant(reservation === undefined, 'duplicate exact reservation event join')
        reservation = row
      }
    }
    invariant(reservation !== undefined, 'reservation event is not backed by an exact reservation')
    const subject = reservationSubject(input.source, input.issuerId, reservation, work)
    if (draft.kind === 'reservationReleased') {
      closeHold(branch, picture.pathKey, subject, at, work)
      if (reservation.capability === 'soundstage' && previous?.bindings.setId !== null && previous !== undefined) {
        const wrap = find(wrapped, draft.ownerId, row => row.id, work)
        invariant(wrap !== undefined && work.equal(wrap.stage, reservation.facilityId) &&
          wrap.setId === previous.bindings.setId, 'stage release has no exact wrapped Set witness')
        if (wrap.setId !== null) {
          work.pay(LITERAL.resource)
          closeHold(branch, picture.pathKey,
            { kind: 'resource', resourceKey: work.token('set', input.issuerId, wrap.setId), slot: 0 }, at, work)
        }
      }
    } else {
      addHold(branch, plan, input.issuerId, picture.pathKey, subject, at, prepared.end, work)
      if (reservation.capability === 'soundstage' && current?.bindings.setId !== null && current !== undefined) {
        work.pay(LITERAL.resource)
        addHold(branch, plan, input.issuerId, picture.pathKey,
          { kind: 'resource', resourceKey: work.token('set', input.issuerId, current.bindings.setId), slot: 0 },
          at, prepared.end, work)
      }
    }
  }
}
function reconcile<P extends StartedPicture>(input: StartedOwnerReplayInput<P>, prepared: Prepared<P>,
  branch: Branch<P>, work: Work): void {
  work.pay(1)
  const expected: { path: string; subject: HoldSubject }[] = []
  work.pay(3)
  for (const workflow of branch.operations.workflows) {
    work.pay(4)
    const picture = find(prepared.pictures, workflow.productionId, row => row.production.id, work)
    invariant(picture !== undefined, 'workflow has no original trajectory')
    let stage = false
    for (const reservation of workflow.reservations) {
      work.pay(4 + LITERAL.expected + APPEND)
      expected.push({ path: picture.pathKey,
        subject: reservationSubject(input.source, input.issuerId, reservation, work) })
      if (reservation.capability === 'soundstage') stage = true
    }
    if (stage && workflow.bindings.setId !== null) {
      work.pay(5 + LITERAL.expected + LITERAL.resource + APPEND)
      expected.push({ path: picture.pathKey,
        subject: { kind: 'resource', resourceKey: work.token('set', input.issuerId, workflow.bindings.setId), slot: 0 } })
    }
  }
  for (const row of branch.ledger) {
    work.pay(4)
    if (row.closed || row.hold.subject.kind !== 'resource' || row.hold.ownerPathKey === null) continue
    const picture = find(prepared.pictures, row.hold.ownerPathKey, value => value.pathKey, work)
    if (picture === undefined) continue
    let matches = 0
    for (const fact of expected) {
      work.pay(3)
      if (work.equal(fact.path, row.hold.ownerPathKey) && sameSubject(fact.subject, row.hold.subject, work)) matches++
    }
    invariant(matches === 1, 'live production resource ledger differs from owner output')
  }
  for (const fact of expected) {
    let matches = 0
    for (const row of branch.ledger) {
      work.pay(4)
      if (!row.closed && row.hold.ownerPathKey !== null && work.equal(row.hold.ownerPathKey, fact.path) &&
        sameSubject(row.hold.subject, fact.subject, work)) matches++
    }
    invariant(matches === 1, 'owner output has an uncertified reservation')
  }
}

function completeTrace<P extends StartedPicture>(input: StartedOwnerReplayInput<P>, prepared: Prepared<P>,
  plan: StartedProductionPlan, branch: Branch<P>, work: Work): JointOwnerTrace {
  work.pay(9) // setup + empty paths array
  const paths: JointTracePath[] = []
  for (const picture of prepared.pictures) {
    work.pay(5)
    const calendar = find(branch.calendars, picture.production.id, row => row.productionId, work)
    invariant(calendar !== undefined, 'picture calendar is missing')
    // Full picture literal, nested boundary, two-reference facts array, two
    // empty arrays, and the append are independent of lookup/token charges.
    work.pay(LITERAL.picture + LITERAL.boundary + 5 + 2 + APPEND)
    paths.push({ kind: 'jointTracePicture', jointTraceKey: plan.traceKey,
      key: work.token('picture', plan.traceKey, picture.production.id), pathKey: picture.pathKey,
      issuerId: input.issuerId, existingPath: true,
      greenlight: { week: picture.production.startTick, step: 0 }, firstTake: calendar.firstTake,
      personRelease: calendar.personRelease, cast: picture.production.cast,
      staffingWitnessKey: work.token('company', input.issuerId, picture.production.id),
      ownerFactRefs: [prepared.factRef, picture.pathKey], additionalHolds: [], holdReplacements: [] })
  }
  for (const background of prepared.backgrounds) {
    work.pay(3 + LITERAL.background + 5 + APPEND)
    paths.push({ kind: 'jointTraceBackground', jointTraceKey: plan.traceKey, pathKey: background.pathKey,
      issuerId: input.issuerId, existingPath: true, ownerFactRefs: [prepared.factRef, background.pathKey] })
  }
  for (const mount of prepared.mounts) {
    work.pay(3 + LITERAL.background + 5 + APPEND)
    paths.push({ kind: 'jointTraceBackground', jointTraceKey: plan.traceKey, pathKey: mount.pathKey,
      issuerId: input.issuerId, existingPath: true, ownerFactRefs: [prepared.factRef, mount.pathKey] })
  }
  work.pay(1)
  const additionalHolds: Hold[] = []
  for (const row of branch.ledger) {
    work.pay(3)
    if (!row.fixed) { work.pay(APPEND); additionalHolds.push(row.hold) }
  }
  work.pay(LITERAL.trace + 5)
  return { kind: 'jointOwnerTrace', traceKey: plan.traceKey,
    ownerFactRefs: [prepared.factRef, work.token('execution', plan.traceKey, prepared.now.week, prepared.end.week)],
    paths: sorted(paths, row => row.pathKey, work),
    fixedHoldReplacements: sorted(branch.replacements, row => row.holdId, work),
    additionalHolds: sorted(additionalHolds, row => row.holdId, work) }
}

function executeCommand<P extends StartedPicture>(input: StartedOwnerReplayInput<P>, prepared: Prepared<P>,
  plan: StartedProductionPlan, branch: Branch<P>, command: StartedProductionCommand, work: Work): void {
  work.pay(8)
  const production = find(branch.productions, command.productionId, row => row.id, work)
  if (production === undefined) commandRefused(work, 'production already released in this branch')
  const d = dimensions(input.source, branch.productions, branch.operations, branch.sets, branch.technology, 0, work)
  const before = branch.operations
  work.pay(5 + LITERAL.sink + 1)
  const sink = new StudioEventSink(branch.week, true)
  work.pay(LITERAL.command + APPEND)
  branch.provenance.push({ kind: 'command', at: boundary(branch, work), command })
  // Lookup, ordered guards/error interpolation, task/blocker/workflow/operations
  // copies and replacement map. Both refusal and success are included.
  work.pay(30) // scalar setup/reads; full nested helper call tree pays itself
  const commandBill = work.calc(64).plus(150, work.calc(8).times(8, d.d), work.calc(32).times(d.n, 3 + work.calc(8).equality(d.dp)),
    d.taskCopy, d.workflowCopy, workflowUpdate(d, work), 90)
  work.pay(10)
  try {
    if (command.kind === 'assignLockedDirector') {
      work.pay(commandBill)
      branch.operations = assignShootingDirector(branch.operations, production, production.directorId)
      work.pay(work.calc(16).add(arrivalBill(d, branch.operations, work), work.calc(32).times(d.n, work.calc(8).equality(d.dp))))
      branch.operations = arriveDueScenery(branch.operations, workflow => workflow.productionId === production.id &&
        sceneryLoadInDecision(input.source, workflow, branch.week).kind === 'arrived-pending', sink)
    } else if (command.kind === 'clearGrandfatheredScenery') {
      const workflow = find(branch.operations.workflows, production.id, row => row.productionId, work)
      invariant(workflow !== undefined, 'command has no workflow')
      work.pay(geometryBill(d, work))
      if (sceneryLoadInDecision(input.source, workflow, branch.week).kind !== 'manual-clear') {
        commandRefused(work, 'only explicitly grandfathered scenery permits manual clear')
      }
      work.pay(commandBill)
      branch.operations = clearSceneryLoadIn(branch.operations, production.id, sink)
    } else if (command.kind === 'scheduleTake') {
      work.pay(commandBill)
      branch.operations = scheduleShootingTake(branch.operations, production.id)
    } else {
      let longestTitle = 0
      work.pay(4)
      for (const concept of input.source.concepts) {
        work.pay(4); work.text(concept.title); work.text(concept.id)
        longestTitle = Math.max(longestTitle, concept.title.length, concept.id.length)
      }
      work.pay(work.calc(64).plus(240 + LITERAL.releaseOwner, work.calc(32).times(3 * d.n + input.source.concepts.length + branch.releaseAuthority.commitments.length,
        4 + work.calc(8).equality(Math.max(d.d, longestTitle))), work.calc(32).times(4, longestTitle + d.d)))
      const reason = releaseCommitmentRefusal({ productions: branch.productions,
        concepts: input.source.concepts, operations: branch.operations, releaseAuthority: branch.releaseAuthority }, production.id)
      if (reason !== null) commandRefused(work, reason)
      const count = branch.releaseAuthority.commitments.length + 1
      work.pay(16) // scalar source-cost setup; nested helpers pay themselves
      // withReleaseCommitment: exact row/root literals; appended input array
      // capacity+writes; mint's prefix/input/output string spans; real sort.
      work.pay(work.calc(64).plus(12 + LITERAL.commitment + LITERAL.commitments, 1 + 2 * count,
        2 * ('release-commitment'.length + 1 + production.id.length),
        sortBill(count, 6 + 2 * work.calc(8).equality(d.dp), work)))
      branch.releaseAuthority = withReleaseCommitment(branch.releaseAuthority, production.id, branch.week)
      work.pay(5 + LITERAL.releaseCommitted + LITERAL.stampedEvent + APPEND)
      sink.append({ kind: 'releaseCommitted', productionId: production.id })
    }
  } catch (error) {
    if (error instanceof WorkLimit || error instanceof ContextCut || error instanceof CommandRefused) throw error
    if (error instanceof Error && error.message.startsWith('applyActions:')) commandRefused(work, error.message)
    throw error
  }
  drainEvents(input, prepared, plan, branch, sink, before, work)
}

function frame<P extends StartedPicture>(input: StartedOwnerReplayInput<P>, prepared: Prepared<P>,
  plan: StartedProductionPlan, branch: Branch<P>, work: Work): void {
  work.pay(7)
  const arrivedWeek = branch.week + 1
  for (const background of prepared.backgrounds) {
    work.pay(4)
    if (find(branch.completed, background.pathKey, id => id, work) !== undefined) continue
    work.pay(16 + background.row.status.length)
    const due = background.kind === 'screenplay'
      ? scriptWorkDueAt(background.row, arrivedWeek) : castingWorkDueAt(background.row, arrivedWeek)
    if (!due) continue
    invariant(background.row.dueWeek !== null, 'due background has no original date')
    const at = boundary(branch, work)
    closePath(branch, background.pathKey, at, false, work)
    work.pay(5 + LITERAL.backgroundCompleted + 2 * APPEND)
    branch.completed.push(background.pathKey)
    branch.provenance.push({ kind: 'backgroundCompleted', at, pathKey: background.pathKey,
      dueWeek: background.row.dueWeek, owner: background.kind })
  }
  work.pay(1)
  const externalKeys: string[] = []
  for (const background of prepared.backgrounds) {
    work.pay(4)
    if (find(branch.completed, background.pathKey, id => id, work) !== undefined) continue
    const reservation = background.row.reservation
    invariant(reservation !== null, 'remaining background reservation disappeared')
    work.pay(APPEND)
    externalKeys.push(bareKey(reservation.facilityId, reservation.slot, work))
  }
  // Active installation/Set work was cut using original roots; completed body
  // destruction claims are NOT scheduler slots. Do not synthesize Review roots.
  const orderedExternal = sorted(externalKeys, id => id, work)
  let externalKeyLength = 0
  for (const key of orderedExternal) { work.pay(2); externalKeyLength = Math.max(externalKeyLength, key.length) }
  work.pay(work.calc(8).add(3, work.calc(32).times(orderedExternal.length, work.calc(8).keyBill(orderedExternal.length, externalKeyLength))))
  const external = new Set(orderedExternal)
  const d = dimensions(input.source, branch.productions, branch.operations, branch.sets,
    branch.technology, external.size, work)
  work.pay(5 + LITERAL.sink + 1)
  const arrivalSink = new StudioEventSink(branch.week, true)
  const beforeArrival = branch.operations
  work.pay(arrivalBill(d, branch.operations, work))
  branch.operations = arriveDueScenery(branch.operations,
    workflow => sceneryLoadInDecision(input.source, workflow, arrivedWeek).kind === 'arrived-pending', arrivalSink)
  drainEvents(input, prepared, plan, branch, arrivalSink, beforeArrival, work)

  // New collectors per branch AND sweep. Full callbacks, actual selected chain,
  // original geometry and real branch technology; no GameState assertion.
  // Exact caller facts AND the owner's returned outer collector/inner policy.
  // Twelve scalar/call steps and four closure allocations are separate.
  work.pay(12 + 4 + LITERAL.technologyCollector + LITERAL.technologyPolicy +
    LITERAL.technologyFacts + LITERAL.market)
  const facts: ProductionTechnologyFacts = { technology: branch.technology, market: { tick: branch.week },
    placement: input.source.placement, hollywood: input.source.hollywood }
  const technology = createProductionTechnologyPolicy(facts, input.issuerId)
  work.pay(15)
  const setup = createProductionSetupRouteResolver(facts)
  let committedLength = 0
  for (const row of branch.releaseAuthority.commitments) {
    work.pay(3); work.text(row.productionId)
    committedLength = Math.max(committedLength, row.productionId.length)
  }
  work.pay(work.calc(8).add(4, work.calc(32).times(branch.releaseAuthority.commitments.length,
    3 + work.calc(8).keyBill(branch.releaseAuthority.commitments.length, committedLength))))
  const committed = committedReleaseIds(branch.releaseAuthority)
  const before = branch.operations
  const bill = sweepBill(d, branch.productions, branch.operations, branch.week, committed, work)
  // Reserve observation, sink, binding/callback literals and complete owner work
  // together: an exhaustion boundary cannot record an unexecuted sweepStarted.
  work.pay(work.calc(64).plus(bill, 15 + LITERAL.sink + 1 + LITERAL.boundary +
    LITERAL.sweepStarted + APPEND + LITERAL.binding, orderedExternal.length))
  const sink = new StudioEventSink(branch.week, true)
  const at: Boundary = { week: branch.week, step: ++branch.step }
  branch.provenance.push({ kind: 'sweepStarted', at, externalSlotKeys: orderedExternal })
  const advanced = advanceManagedProductions(branch.operations, branch.productions, branch.week,
    committed, external, sink, { sets: branch.sets,
      // Lookup is prepaid in the general branch's binding component.
      genreOf: id => prepared.pictures.find(row => row.production.id === id)?.genre ?? null,
    }, technology.policy, setup)
  work.pay(8)
  branch.operations = advanced.operations
  branch.productions = advanced.productions
  branch.sets = advanced.sets
  branch.technology = technology.technology()
  drainEvents(input, prepared, plan, branch, sink, before, work)
  reconcile(input, prepared, branch, work)

  work.pay(1)
  const zeros: string[] = []
  for (const row of branch.productions) {
    work.pay(4)
    if (row.remainingTicks === 0) { work.pay(APPEND); zeros.push(row.id) }
  }
  work.pay(4)
  invariant(zeros.length === advanced.admittedReleaseIds.length, 'release admission/countdown mismatch')
  for (const id of zeros) invariant(find(advanced.admittedReleaseIds, id, value => value, work) !== undefined,
    'zero clock lacks actual release admission')
  uniqueIds(advanced.admittedReleaseIds, id => id, work)
  const released = sorted(advanced.admittedReleaseIds, id => id, work)
  for (const id of released) {
    work.pay(5)
    const picture = find(prepared.pictures, id, row => row.production.id, work)
    const calendar = find(branch.calendars, id, row => row.productionId, work)
    invariant(picture !== undefined && calendar !== undefined && calendar.personRelease === null, 'duplicate or foreign release')
    const releaseAt = boundary(branch, work)
    closePath(branch, picture.pathKey, releaseAt, true, work)
    work.pay(10 + LITERAL.pictureEvent + APPEND)
    calendar.personRelease = releaseAt
    branch.provenance.push({ kind: 'releaseAdmitted', at: releaseAt, productionId: id })
    const workflow = find(before.workflows, id, row => row.productionId, work)
    invariant(workflow !== undefined, 'release has no pre-sweep workflow')
    work.pay(work.calc(64).plus(24, work.calc(32).times(branch.sets.length, 5 + 2 * work.calc(8).equality(d.d)), d.setCopy, 18))
    branch.sets = depleteSetNoveltyForRelease(branch.sets, workflow.bindings.setId)
  }
  work.pay(work.calc(8).add(5, work.calc(32).times(released.length, work.calc(8).keyBill(released.length, d.dp))))
  const releasedSet = new Set(released)
  work.pay(14) // scalar setup; full sum/product/keyBill/equality tree pays itself
  // Root literal(13), filter invocation+array header(2), each callback visit,
  // projection/predicate and worst-case retained capacity/reference write(5).
  work.pay(work.calc(64).plus(5, LITERAL.commitments, 2, work.calc(32).times(branch.releaseAuthority.commitments.length,
    5 + work.calc(8).keyBill(released.length, d.dp))))
  branch.releaseAuthority = pruneReleasedCommitments(branch.releaseAuthority, releasedSet)
  if (released.length > 0) {
    work.pay(work.calc(8).add(2, work.calc(32).times(branch.productions.length, 4 + work.calc(8).keyBill(released.length, d.dp))))
    branch.productions = branch.productions.filter(row => !releasedSet.has(row.id))
  }
  for (const production of advanced.firstTakes) {
    work.pay(7)
    const picture = find(prepared.pictures, production.id, row => row.production.id, work)
    const calendar = find(branch.calendars, production.id, row => row.productionId, work)
    invariant(picture !== undefined && calendar !== undefined && !picture.historicallyFilmed && calendar.firstTake === null,
      'duplicate or historical first take')
    work.pay(12 + LITERAL.boundary + LITERAL.pictureEvent + APPEND)
    const takeAt: Boundary = { week: arrivedWeek, step: 0 }
    calendar.firstTake = takeAt
    branch.provenance.push({ kind: 'firstTake', at: takeAt, productionId: production.id })
  }
  work.pay(3)
  branch.week = arrivedWeek; branch.step = 0
}

/** Never calls tick/actions and never supplies complete choice-domain coverage. */
export function replayStartedProductionPlans<P extends StartedPicture>(
  input: StartedOwnerReplayInput<P>,
): StartedOwnerReplayResult<P> {
  natural(input.preparationWork, 'preparation work')
  natural(input.limits.work, 'work limit'); natural(input.limits.span, 'span limit')
  natural(input.limits.alternatives, 'trace/path limit')
  invariant(input.limits.work <= 200000 && input.limits.span <= 220 && input.limits.alternatives <= 1024,
    'limits may only lower the published caps')
  const work = new Work(input.limits.work, input.preparationWork)
  // The normal outer result and its three initial arrays are reserved before
  // construction. Only the fixed administrative work-limit envelope is exempt.
  try { work.pay(LITERAL.result + 3 + 5) } catch (error) {
    if (!(error instanceof WorkLimit)) throw error
    return { fixedHolds: [], attempts: [], preparationWork: work.limit,
      omissions: ['work limit before replay preparation completed'] }
  }
  const attempts: StartedReplayAttempt<P>[] = [], omissions: string[] = []
  let knownPlans: readonly StartedProductionPlan[] = []
  let prepared: Prepared<P>
  try {
    if (input.preparationWork > input.limits.work) throw new WorkLimit()
    prepared = prepare(input, work, plans => { knownPlans = plans })
  } catch (error) {
    if (error instanceof WorkLimit) return { fixedHolds: [], attempts: [], preparationWork: work.limit,
      omissions: ['work limit before replay preparation completed'] }
    if (error instanceof ContextCut) {
      try {
        for (const plan of knownPlans) {
          work.pay(5 + LITERAL.cut + LITERAL.boundary + 1 + APPEND)
          attempts.push({ kind: 'cut', traceKey: plan.traceKey,
            through: { week: input.source.market.tick, step: 0 }, reason: error.reason,
            detail: error.message, provenance: [] })
        }
        work.pay(1 + 5 + 2) // empty fixedHolds + two-element omissions literal + return control
      } catch (limit) {
        if (!(limit instanceof WorkLimit)) throw limit
        return { fixedHolds: [], attempts, preparationWork: work.limit,
          omissions: [error.reason, 'work limit constructing context cuts'] }
      }
      return { fixedHolds: [], attempts, preparationWork: work.used, omissions: [error.reason, error.message] }
    }
    throw error
  }
  for (const plan of prepared.plans) {
    let branch: Branch<P> | undefined
    try {
      work.pay(12) // scalar construction-bill reads; sums/products pay themselves
      work.pay(work.calc(64).plus(LITERAL.branch, 3, 2, work.calc(32).times(prepared.fixed.length, 3 + LITERAL.ledgerRow),
        2, work.calc(32).times(prepared.pictures.length, 3 + LITERAL.calendar)))
      branch = { week: prepared.now.week, step: 0,
        productions: input.source.studio.activeProductions, operations: input.source.operations,
        sets: input.source.sets, technology: input.source.technology, releaseAuthority: input.source.releaseAuthority,
        completed: [], provenance: [], ledger: prepared.fixed.map(hold => ({ hold, fixed: true, closed: false })),
        replacements: [], calendars: prepared.pictures.map(row => ({ productionId: row.production.id,
          firstTake: null, personRelease: null })), nextHold: 0 }
      let commandIndex = 0
      while (branch.week < prepared.end.week) {
        work.pay(4)
        while (commandIndex < plan.commands.length && plan.commands[commandIndex]!.week === branch.week) {
          work.pay(3)
          executeCommand(input, prepared, plan, branch, plan.commands[commandIndex++]!, work)
        }
        frame(input, prepared, plan, branch, work)
      }
      const trace = completeTrace(input, prepared, plan, branch, work)
      const completedBackgroundPathKeys = sorted(branch.completed, id => id, work)
      work.pay(5 + LITERAL.complete + LITERAL.projection + APPEND)
      attempts.push({ kind: 'complete', trace, projection: { week: branch.week,
        productions: branch.productions, operations: branch.operations, sets: branch.sets,
        technology: branch.technology, releaseAuthority: branch.releaseAuthority, completedBackgroundPathKeys },
        provenance: branch.provenance })
    } catch (error) {
      if (!(error instanceof WorkLimit || error instanceof CommandRefused || error instanceof ContextCut)) throw error
      let reason = error instanceof WorkLimit ? 'workLimit' as const : error instanceof CommandRefused ? 'commandRefused' as const : error.reason
      let detail = error instanceof WorkLimit ? 'shared replay work limit' : error.message
      if (!(error instanceof WorkLimit)) {
        try {
          work.pay(5 + LITERAL.cut + LITERAL.boundary + (branch === undefined ? 1 : 0) + 2 * APPEND)
        } catch (limit) {
          if (!(limit instanceof WorkLimit)) throw limit
          reason = 'workLimit'; detail = 'shared replay work limit'
        }
      }
      attempts.push({ kind: 'cut', traceKey: plan.traceKey,
        through: { week: branch?.week ?? prepared.now.week, step: branch?.step ?? 0 }, reason, detail,
        provenance: branch?.provenance ?? [] })
      omissions.push(reason === 'workLimit' ? 'work limit; remaining plan suffixes unexecuted' : detail)
      if (reason === 'workLimit') break
    }
  }
  return { fixedHolds: prepared.fixed, attempts, preparationWork: work.used, omissions }
}
