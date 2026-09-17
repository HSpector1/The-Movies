// ── P13B-S3 — persistent physical plans, dependencies and admission ──────────
//
// WHAT THIS IS. The studio's ordered, persistent list of PHYSICAL INTENTIONS —
// bodies to place and modules to install — with an approved maximum debit, an
// earliest start, dependencies, and the exact P09 quote that was approved.
//
// THE PINS:
//   1. A QUEUED PLAN RESERVES NOTHING. No cash, weekly burn, capacity,
//      engagement or slot moves when a plan is queued, reordered or cancelled.
//      The only roots a queue verb writes are `physicalPlans` and `studioHistory`.
//   2. ADMISSION IS THE ONLY SPENDER, once per tick, at the admission boundary,
//      in ordinal order, against a cash envelope decremented by each commit —
//      and it calls the SAME P09 commit the front door calls, so an admitted
//      commit and a hand commit in that week are the same placement record and
//      the same ledger row.
//   3. AT MOST ONE COMMIT PER PLAN. `commitReceipt` is written exactly once and
//      never rewritten; a started plan is never re-admitted.
//   4. NOTHING IS INVENTED WHILE WAITING. A plan that cannot start this week is
//      left exactly as it was (its "why" is derived by `planAdmissionView`, not
//      persisted); only a HOLD — a quote the studio never approved, or a live
//      P09 refusal — is written down, with the live quote beside it.
//   5. A CANCELLED PREDECESSOR NEVER COUNTS AS COMPLETION: its dependents are
//      blocked at the cancel, naming it, and never start.
//
// This module is pure: no RNG, no clock, no I/O.

import {
  blueprintById,
  commitFacilityInstallation,
  commitPlacement,
  physicalQuoteFingerprint,
  queryFacilityInstallation,
  queryPlacement,
} from './placement.js'
import { appendStudioHistory, historyDraft, studioHistoryRecording, studioSubject, type StudioHistoryDraft } from './studioHistory.js'
import type {
  Action,
  GameState,
  PhysicalPlan,
  PhysicalPlanAdmission,
  PhysicalPlanWork,
  PlanQuoteSnapshot,
  StudioPhysicalPlans,
} from './types.js'

/** The same comma-grouped money the research reasons use, so two reasons read alike. */
const money = (value: number): string => '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })

/** The empty root a fresh or migrated world carries. Nothing is invented for the past. */
export function initialPhysicalPlans(): StudioPhysicalPlans {
  return { version: 1, nextPlanId: 1, plans: [] }
}

const PLAN_STATUSES = ['queued', 'held', 'blocked', 'started', 'cancelled'] as const
const PLAN_ADMISSIONS: readonly PhysicalPlanAdmission[] = ['reviewChangedQuote', 'automatic']
const PLAN_KEYS = [
  'id', 'studioId', 'ordinal', 'queuedWeek', 'work', 'dependsOn', 'approvedMaximumDebit',
  'earliestStartWeek', 'admission', 'approvedQuote', 'pendingQuote', 'status', 'statusWeek',
  'reason', 'startedPlacementId', 'commitReceipt',
] as const

// ── Quotes and fingerprints ──────────────────────────────────────────────────

/** The declared target, verbatim — the thing the plan is FOR, and what its fingerprint covers. */
function declaredTarget(work: PhysicalPlanWork): string {
  if (work.kind === 'placement') return `${String(work.origin.gx)},${String(work.origin.gy)}`
  return 'facilityId' in work.target ? work.target.facilityId : work.target.planId
}

/**
 * The facility an installation will actually be commissioned against. A plan
 * target names either a facility directly or a PLAN whose own body resolves to
 * one once it has started — `null` until then (nothing is guessed from a name).
 */
export function resolvedTargetFacilityId(state: GameState, work: PhysicalPlanWork): string | null {
  if (work.kind === 'placement') return null
  if ('facilityId' in work.target) return work.target.facilityId
  const predecessor = state.physicalPlans.plans.find((plan) => plan.id === (work.target as { planId: string }).planId)
  if (predecessor === undefined || predecessor.startedPlacementId === null) return null
  return state.placement.facilities.find((placed) => placed.id === predecessor.startedPlacementId)?.facilityId ?? null
}

/**
 * The live scope-and-price snapshot of one plan's work. The fingerprint is taken
 * over the DECLARED target, so resolving `{planId}` to the facility the body
 * minted is not a change of scope and never holds a lawful plan.
 */
export function planQuoteSnapshot(state: GameState, work: PhysicalPlanWork): PlanQuoteSnapshot {
  const quote =
    work.kind === 'installation'
      ? queryFacilityInstallation(state, {
          blueprintId: work.blueprintId,
          targetFacilityId: resolvedTargetFacilityId(state, work) ?? declaredTarget(work),
        })
      : queryPlacement(state, { blueprintId: work.blueprintId, origin: work.origin })
  const snapshot = {
    cost: quote.cost,
    buildWeeks: quote.buildWeeks,
    weeklyOperatingCost: quote.weeklyOperatingCost,
    components: (work.kind === 'installation' ? (quote as { components: readonly { label: string; cost: number; weeks: number }[] }).components : [])
      .map((component) => ({ label: component.label, cost: component.cost, weeks: component.weeks })),
  }
  return {
    fingerprint: physicalQuoteFingerprint({ kind: work.kind, blueprintId: work.blueprintId, target: declaredTarget(work), ...snapshot }),
    ...snapshot,
  }
}

/** The live P09 refusals for one plan's work, in the engine's own order. */
function liveRejections(state: GameState, work: PhysicalPlanWork): readonly string[] {
  if (work.kind === 'placement') {
    return queryPlacement(state, { blueprintId: work.blueprintId, origin: work.origin }).rejections
  }
  const targetFacilityId = resolvedTargetFacilityId(state, work)
  if (targetFacilityId === null) return ['unknownTarget']
  return queryFacilityInstallation(state, { blueprintId: work.blueprintId, targetFacilityId }).rejections
}

// ── The admission decision (ONE function; the tick and the read model share it) ──

export type PlanAdmissionView = {
  /** `admit` commits this week; `wait` changes nothing; `hold` needs the studio. */
  outcome: 'admit' | 'wait' | 'hold'
  /** Why it is not starting, in the engine's words. Null exactly when it starts. */
  reason: string | null
  /** The live quote. A held plan persists this as `pendingQuote`. */
  quote: PlanQuoteSnapshot
}

/**
 * `atWeek` is the week the decision is FOR. The tick passes the arrived week
 * (it evaluates the state at `currentTick + 1`, so the default is exact there);
 * a read model looking at the current week should pass `state.market.tick + 1`
 * to ask "what happens at the next boundary?" rather than "would it start now?".
 */
export function planAdmissionView(state: GameState, plan: PhysicalPlan, atWeek: number = state.market.tick): PlanAdmissionView {
  const quote = planQuoteSnapshot(state, plan.work)
  const wait = (reason: string | null): PlanAdmissionView => ({ outcome: 'wait', reason, quote })
  const hold = (reason: string): PlanAdmissionView => ({ outcome: 'hold', reason, quote })

  if (plan.status === 'started') return wait(null)
  if (plan.status === 'cancelled' || plan.status === 'blocked') return wait(plan.reason)

  // Dependencies first: they are facts about the WORLD, not about this quote.
  for (const dependencyId of plan.dependsOn) {
    const predecessor = state.physicalPlans.plans.find((candidate) => candidate.id === dependencyId)
    if (predecessor === undefined) return wait(`dependency ${dependencyId} is unknown`)
    if (predecessor.status === 'cancelled') return wait(`dependency ${dependencyId} was cancelled`)
    const placement =
      predecessor.startedPlacementId === null
        ? undefined
        : state.placement.facilities.find((placed) => placed.id === predecessor.startedPlacementId)
    // "Operational" is read BEFORE this advance's completions: a predecessor that
    // finishes in week w enables its dependent at w+1's boundary, never within w.
    if (predecessor.status !== 'started' || placement === undefined || placement.status !== 'operational') {
      return wait(`waiting for dependency ${dependencyId}`)
    }
  }
  // The named week must have RUN: admission happens at the boundary that closes a
  // week, so a plan whose earliest start is this arriving week waits for the next
  // one (the same "the week being advanced was still the old week" law step 1.05
  // stands on). A plan queued in week w with no explicit earliest start therefore
  // starts on the very next advance, w → w+1.
  if (plan.earliestStartWeek >= atWeek) return wait(`earliest start ${String(plan.earliestStartWeek)}`)

  // The approved ceiling is an authorization fact and outranks every live refusal:
  // a quote the studio never agreed to pay is not a waiting problem.
  if (quote.cost > plan.approvedMaximumDebit) {
    return hold(`Quote ${money(quote.cost)} exceeds the approved ceiling ${money(plan.approvedMaximumDebit)}.`)
  }
  if (plan.admission === 'reviewChangedQuote') {
    if (quote.fingerprint !== plan.approvedQuote.fingerprint) return hold('quote changed since approval')
  } else {
    // `automatic` forgives a moved fingerprint, never a moved SCOPE: blueprint and
    // target are immutable on the plan, so the component list is what is left to check.
    const before = plan.approvedQuote.components.map((component) => component.label).join('|')
    const now = quote.components.map((component) => component.label).join('|')
    if (before !== now) return hold('quote changed since approval')
  }
  const rejections = liveRejections(state, plan.work)
  const blocking = rejections.filter((rejection) => rejection !== 'insufficientFunds')
  if (blocking.length > 0) return hold(`quote refused: ${blocking.join(', ')}`)
  // Cash is the one refusal that is a WAIT: the envelope refills every week and
  // the studio already approved this price. Never persisted; retried next boundary.
  if (rejections.length > 0) return wait('insufficient cash')
  return { outcome: 'admit', reason: null, quote }
}

// ── Admission at the weekly boundary ─────────────────────────────────────────

function sameQuote(a: PlanQuoteSnapshot | null, b: PlanQuoteSnapshot): boolean {
  return a !== null && a.fingerprint === b.fingerprint && a.cost === b.cost && a.buildWeeks === b.buildWeeks &&
    a.weeklyOperatingCost === b.weeklyOperatingCost && a.components.length === b.components.length &&
    a.components.every((component, index) => component.label === b.components[index]!.label &&
      component.cost === b.components[index]!.cost && component.weeks === b.components[index]!.weeks)
}

function withPlan(state: GameState, updated: PhysicalPlan): GameState {
  return {
    ...state,
    physicalPlans: {
      ...state.physicalPlans,
      plans: state.physicalPlans.plans.map((plan) => (plan.id === updated.id ? updated : plan)),
    },
  }
}

function planHistory(kind: 'planQueued' | 'planStarted' | 'planHeld' | 'planBlocked' | 'planCancelled', week: number, planId: string, reason: string | null): StudioHistoryDraft {
  return historyDraft({ week, kind, subjects: studioSubject(), planId, reason })
}

/**
 * Commit one admitted plan through the P09 front door. The commit functions
 * return the SAME state on any refusal, so a silent no-op is caught here and
 * fails loudly rather than leaving a "started" plan with no building.
 */
function commitPlanWork(state: GameState, plan: PhysicalPlan): { state: GameState; placementId: number } {
  const placementId = state.placement.nextPlacementId
  const committed =
    plan.work.kind === 'placement'
      ? commitPlacement(state, { blueprintId: plan.work.blueprintId, origin: plan.work.origin })
      : commitFacilityInstallation(state, {
          blueprintId: plan.work.blueprintId,
          targetFacilityId: resolvedTargetFacilityId(state, plan.work) ??
            refuse(`admitPhysicalPlans: plan ${plan.id} passed admission with no facility to install into`),
        })
  if (committed.placement.nextPlacementId !== placementId + 1) {
    throw new Error(`admitPhysicalPlans: plan ${plan.id} passed admission and its P09 commit still refused`)
  }
  return { state: committed, placementId }
}

/**
 * THE ADMISSION BOUNDARY (tick step 1.06). `state.market.tick` is the week that
 * has ARRIVED — every commit is stamped with it, exactly as the production queue
 * stamps its own admissions — and the cash envelope threaded through the loop is
 * the studio's real cash, so the second plan of a week sees what the first spent.
 *
 * Rivals: their plan rows are validated by the same law, but this engine has no
 * rival physical-commit authority yet (S8 owns it), so only the player's plans
 * are admitted here. A rival row waits rather than being charged to the player.
 */
export function admitPhysicalPlans(state: GameState): { state: GameState; history: readonly StudioHistoryDraft[] } {
  const own = state.hollywood?.playerStudioId
  if (own === undefined || state.physicalPlans.plans.length === 0) return { state, history: [] }
  const week = state.market.tick
  const pending = state.physicalPlans.plans
    .filter((plan) => plan.studioId === own && (plan.status === 'queued' || plan.status === 'held'))
    .sort((a, b) => a.ordinal - b.ordinal)
  let next = state
  const history: StudioHistoryDraft[] = []
  for (const queued of pending) {
    // Re-read the row: an earlier admission in this same loop may have moved it.
    const plan = next.physicalPlans.plans.find((candidate) => candidate.id === queued.id)!
    const view = planAdmissionView(next, plan)
    if (view.outcome === 'wait') continue
    if (view.outcome === 'hold') {
      // An unchanged hold is not a new fact: leave the row (and the history) alone.
      if (plan.status === 'held' && plan.reason === view.reason && sameQuote(plan.pendingQuote, view.quote)) continue
      next = withPlan(next, { ...plan, status: 'held', statusWeek: week, reason: view.reason, pendingQuote: view.quote })
      history.push(planHistory('planHeld', week, plan.id, view.reason))
      continue
    }
    const committed = commitPlanWork(next, plan)
    next = withPlan(committed.state, {
      ...plan,
      status: 'started',
      statusWeek: week,
      reason: null,
      pendingQuote: null,
      startedPlacementId: committed.placementId,
      commitReceipt: { week, fingerprint: view.quote.fingerprint, cost: view.quote.cost },
    })
    history.push(planHistory('planStarted', week, plan.id, null))
  }
  return { state: next, history }
}

// ── Validation (the save boundary; a forged plan root is never repaired) ─────

export function validatePhysicalPlans(state: GameState): void {
  const fail = (message: string): never => { throw new Error(`Physical plans save: ${message}`) }
  const exact = (value: unknown, keys: readonly string[], what: string) => {
    if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).length !== keys.length || !keys.every((key) => Object.hasOwn(value, key))) {
      fail(`exact keys required for ${what}: ${keys.join(',')}`)
    }
  }
  const integer = (n: unknown, what: string, min = 0): number => {
    if (!Number.isSafeInteger(n) || (n as number) < min) fail(`${what} must be a finite integer no less than ${String(min)}`)
    return n as number
  }
  const text = (s: unknown, what: string): string => {
    if (typeof s !== 'string' || s.length === 0 || s.length > 256) fail(`${what} must be a bounded identity`)
    return s as string
  }
  const root = state.physicalPlans
  exact(root, ['version', 'nextPlanId', 'plans'], 'the physical plans root')
  if (root.version !== 1) fail('unsupported physical plans root version')
  integer(root.nextPlanId, 'nextPlanId', 1)
  if (!Array.isArray(root.plans)) fail('plans must be an array')
  const studios = new Set(state.hollywood?.identities.map((identity) => identity.studioId) ?? [])
  if (root.plans.length > 0 && state.hollywood === null) fail('a physical plan without a studio to own it')

  const quote = (value: unknown, what: string): PlanQuoteSnapshot => {
    exact(value, ['fingerprint', 'cost', 'buildWeeks', 'weeklyOperatingCost', 'components'], what)
    const snapshot = value as PlanQuoteSnapshot
    text(snapshot.fingerprint, `${what}.fingerprint`)
    integer(snapshot.cost, `${what}.cost`)
    integer(snapshot.buildWeeks, `${what}.buildWeeks`)
    integer(snapshot.weeklyOperatingCost, `${what}.weeklyOperatingCost`)
    if (!Array.isArray(snapshot.components)) fail(`${what}.components must be an array`)
    for (const component of snapshot.components) {
      exact(component, ['label', 'cost', 'weeks'], `${what} component`)
      text(component.label, `${what} component label`)
      integer(component.cost, `${what} component cost`)
      integer(component.weeks, `${what} component weeks`)
    }
    return snapshot
  }

  const ids = new Set<string>()
  const ordinals = new Set<string>()
  const startedPlacements = new Set<number>()
  for (const plan of root.plans) {
    exact(plan, PLAN_KEYS, 'a physical plan')
    text(plan.id, 'plan id')
    text(plan.studioId, 'plan studioId')
    if (!studios.has(plan.studioId)) fail(`plan ${plan.id} names a studio this campaign does not have`)
    // Campaign isolation, at the identity itself: a plan id CARRIES its studio, so
    // a row cannot be reassigned to another studio without renaming it.
    if (plan.id !== `${plan.studioId}:plan:${plan.id.slice(plan.id.lastIndexOf(':') + 1)}`) {
      fail(`plan ${plan.id} does not name its own studio`)
    }
    const minted = Number(plan.id.slice(plan.id.lastIndexOf(':') + 1))
    integer(minted, `plan ${plan.id} number`, 1)
    if (minted >= root.nextPlanId) fail(`plan ${plan.id} was minted at or beyond nextPlanId ${String(root.nextPlanId)}`)
    if (ids.has(plan.id)) fail(`duplicate plan id ${plan.id}`)
    ids.add(plan.id)
    integer(plan.ordinal, `plan ${plan.id} ordinal`, 1)
    const ordinalKey = `${plan.studioId}/${String(plan.ordinal)}`
    if (ordinals.has(ordinalKey)) fail(`two plans of one studio share ordinal ${String(plan.ordinal)}`)
    ordinals.add(ordinalKey)
    integer(plan.approvedMaximumDebit, `plan ${plan.id} approved maximum debit`)
    integer(plan.earliestStartWeek, `plan ${plan.id} earliest start week`)
    const queuedWeek = integer(plan.queuedWeek, `plan ${plan.id} queued week`)
    if (queuedWeek > state.market.tick) fail(`plan ${plan.id} was queued in a week that has not happened`)
    // Admission stamps the ARRIVED week and the clock advances to it in the same
    // tick, so at the save boundary no lawful row is ahead of `market.tick`.
    const statusWeek = integer(plan.statusWeek, `plan ${plan.id} status week`)
    if (statusWeek < queuedWeek || statusWeek > state.market.tick) fail(`plan ${plan.id} carries an impossible status week`)
    if (!PLAN_STATUSES.includes(plan.status)) fail(`plan ${plan.id} carries an unsupported status`)
    if (!PLAN_ADMISSIONS.includes(plan.admission)) fail(`plan ${plan.id} carries an unsupported admission mode`)
    if (plan.reason !== null) text(plan.reason, `plan ${plan.id} reason`)
    quote(plan.approvedQuote, `plan ${plan.id} approved quote`)
    if (plan.pendingQuote !== null) quote(plan.pendingQuote, `plan ${plan.id} pending quote`)
    if (plan.status === 'queued' && plan.pendingQuote !== null) fail(`plan ${plan.id} is queued and still carries a pending quote`)
    if (plan.status === 'held' && plan.pendingQuote === null) fail(`plan ${plan.id} is held with no pending quote to review`)

    // Work.
    const work = plan.work
    if ((work as unknown) === null || typeof work !== 'object') fail(`plan ${plan.id} carries no work`)
    const blueprint = blueprintById((work as PhysicalPlanWork).blueprintId)
    if (work.kind === 'placement') {
      exact(work, ['kind', 'blueprintId', 'origin'], `plan ${plan.id} work`)
      exact(work.origin, ['gx', 'gy'], `plan ${plan.id} origin`)
      integer(work.origin.gx, `plan ${plan.id} origin gx`)
      integer(work.origin.gy, `plan ${plan.id} origin gy`)
      if (blueprint === null || blueprint.installationTargetCapability !== undefined) fail(`plan ${plan.id} names a blueprint no body can be placed from`)
    } else if (work.kind === 'installation') {
      exact(work, ['kind', 'blueprintId', 'target'], `plan ${plan.id} work`)
      if (blueprint === null || blueprint.installationTargetCapability === undefined) fail(`plan ${plan.id} names a blueprint no installation can use`)
      if ('facilityId' in work.target) {
        exact(work.target, ['facilityId'], `plan ${plan.id} target`)
        text(work.target.facilityId, `plan ${plan.id} target facility`)
      } else {
        exact(work.target, ['planId'], `plan ${plan.id} target`)
        text(work.target.planId, `plan ${plan.id} target plan`)
        if (!work.target.planId.startsWith(`${plan.studioId}:plan:`)) fail(`plan ${plan.id} targets another studio's plan`)
      }
    } else {
      fail(`plan ${plan.id} carries work of no known kind`)
    }

    // Dependencies: in-studio, existing, never self.
    if (!Array.isArray(plan.dependsOn)) fail(`plan ${plan.id} dependsOn must be an array`)
    const seen = new Set<string>()
    for (const dependencyId of plan.dependsOn) {
      text(dependencyId, `plan ${plan.id} dependency`)
      if (dependencyId === plan.id) fail(`plan ${plan.id} depends on itself — a cycle`)
      if (seen.has(dependencyId)) fail(`plan ${plan.id} names dependency ${dependencyId} twice`)
      seen.add(dependencyId)
      const predecessor = root.plans.find((candidate) => candidate.id === dependencyId)
      if (predecessor === undefined) fail(`plan ${plan.id} depends on an unknown plan ${dependencyId}`)
      if (predecessor!.studioId !== plan.studioId) fail(`plan ${plan.id} depends on another studio's plan`)
    }

    // Started plans name a real building of the same blueprint and target.
    if (plan.status === 'started') {
      if (plan.startedPlacementId === null || plan.commitReceipt === null) fail(`plan ${plan.id} started without a placement and a commit receipt`)
      const placed = state.placement.facilities.find((facility) => facility.id === plan.startedPlacementId)
      if (placed === undefined) fail(`plan ${plan.id} names placement ${String(plan.startedPlacementId)}, which does not exist`)
      if (placed!.blueprintId !== work.blueprintId) fail(`plan ${plan.id} names a placement of another blueprint`)
      if (work.kind === 'installation') {
        const target = resolvedTargetFacilityId(state, work)
        if (placed!.installation?.targetFacilityId !== target) fail(`plan ${plan.id} names a placement installed on another facility`)
      } else if (placed!.origin.gx !== work.origin.gx || placed!.origin.gy !== work.origin.gy) {
        fail(`plan ${plan.id} names a placement standing somewhere else`)
      }
      if (startedPlacements.has(plan.startedPlacementId!)) fail(`two started plans claim one placement ${String(plan.startedPlacementId)} — a duplicate commit receipt`)
      startedPlacements.add(plan.startedPlacementId!)
      exact(plan.commitReceipt, ['week', 'fingerprint', 'cost'], `plan ${plan.id} commit receipt`)
      integer(plan.commitReceipt!.week, `plan ${plan.id} commit week`)
      if (plan.commitReceipt!.week > state.market.tick) fail(`plan ${plan.id} was committed in a week that has not happened`)
      text(plan.commitReceipt!.fingerprint, `plan ${plan.id} commit fingerprint`)
      integer(plan.commitReceipt!.cost, `plan ${plan.id} commit cost`)
    } else if (plan.startedPlacementId !== null || plan.commitReceipt !== null) {
      fail(`plan ${plan.id} has not started and still carries a placement or a commit receipt`)
    }
  }

  // Acyclicity over the whole graph (a forged multi-node cycle is refused here;
  // `queuePhysicalPlan` can only ever reach the self-edge case).
  const byId = new Map(root.plans.map((plan) => [plan.id, plan]))
  const marks = new Map<string, 'visiting' | 'done'>()
  const walk = (id: string): void => {
    const mark = marks.get(id)
    if (mark === 'done') return
    if (mark === 'visiting') fail(`plan ${id} sits on a dependency cycle`)
    marks.set(id, 'visiting')
    for (const dependencyId of byId.get(id)?.dependsOn ?? []) walk(dependencyId)
    marks.set(id, 'done')
  }
  for (const plan of root.plans) walk(plan.id)
}

// ── The five verbs ───────────────────────────────────────────────────────────

function refuse(message: string): never { throw new Error(message) }

function ownStudio(state: GameState): string {
  return state.hollywood?.playerStudioId ?? refuse('Found the studio before planning physical work.')
}

function requirePlan(state: GameState, planId: string): PhysicalPlan {
  return state.physicalPlans.plans.find((plan) => plan.id === planId && plan.studioId === ownStudio(state)) ??
    refuse(`This studio has no physical plan ${planId}.`)
}

function exactActionKeys(action: Record<string, unknown>, keys: readonly string[]): void {
  for (const key of Object.keys(action)) {
    if (!keys.includes(key)) refuse(`${String(action.kind)}: unknown field "${key}".`)
  }
}

function wholeMoney(value: unknown, what: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    refuse(`${what} must be a whole number of dollars, and never negative.`)
  }
  return value as number
}

/** Append a plan history row at the mutation site, under the one recording law. */
function withPlanHistory(state: GameState, drafts: readonly StudioHistoryDraft[]): GameState {
  if (!studioHistoryRecording(state) || drafts.length === 0) return state
  return { ...state, studioHistory: appendStudioHistory(state.studioHistory, drafts, state.market.tick) }
}

function applyQueuePhysicalPlan(state: GameState, action: Action & { kind: 'queuePhysicalPlan' }): GameState {
  exactActionKeys(action as unknown as Record<string, unknown>, ['kind', 'work', 'approvedMaximumDebit', 'dependsOn', 'earliestStartWeek', 'admission'])
  const own = ownStudio(state)
  const week = state.market.tick
  const approvedMaximumDebit = wholeMoney(action.approvedMaximumDebit, 'The approved maximum debit')
  const earliestStartWeek = action.earliestStartWeek === undefined ? week : wholeMoney(action.earliestStartWeek, 'The earliest start week')
  const admission = action.admission ?? 'reviewChangedQuote'
  if (!PLAN_ADMISSIONS.includes(admission)) refuse('That is not an admission mode.')

  // The work, and the ONE structural question a queue may ask: can this ever be built?
  const work = action.work
  if ((work as unknown) === null || typeof work !== 'object') refuse('A physical plan needs work to do.')
  const blueprint = blueprintById(work.blueprintId)
  if (blueprint === null) refuse(`"${String(work.blueprintId)}" is not a building this studio can plan.`)
  const id = `${own}:plan:${String(state.physicalPlans.nextPlanId)}`
  const dependsOn: string[] = []
  const addDependency = (dependencyId: string): void => {
    if (dependsOn.includes(dependencyId)) return
    if (dependencyId === id) refuse('A plan that depends on itself can never start.')
    const predecessor = state.physicalPlans.plans.find((plan) => plan.id === dependencyId)
    if (predecessor === undefined || predecessor.studioId !== own) refuse(`This studio has no physical plan ${dependencyId} — unknown dependency.`)
    if (predecessor!.status === 'cancelled' || predecessor!.status === 'blocked') {
      refuse(`Plan ${dependencyId} was ${predecessor!.status} and can never complete this work.`)
    }
    dependsOn.push(dependencyId)
  }
  for (const dependencyId of action.dependsOn ?? []) {
    if (typeof dependencyId !== 'string') refuse('A dependency is a plan id.')
    addDependency(dependencyId)
  }
  if (work.kind === 'placement') {
    exactActionKeys(work as unknown as Record<string, unknown>, ['kind', 'blueprintId', 'origin'])
    if (blueprint!.installationTargetCapability !== undefined) refuse(`${blueprint!.name} is installed inside a building, not placed on the lot.`)
    const quote = queryPlacement(state, { blueprintId: work.blueprintId, origin: work.origin })
    for (const rejection of ['unknownBlueprint', 'offLot', 'notOwned', 'terrainUnbuildable', 'groundReserved'] as const) {
      if (quote.rejections.includes(rejection)) refuse(`This site can never take ${blueprint!.name}: ${rejection}.`)
    }
  } else if (work.kind === 'installation') {
    exactActionKeys(work as unknown as Record<string, unknown>, ['kind', 'blueprintId', 'target'])
    if (blueprint!.installationTargetCapability === undefined) refuse(`${blueprint!.name} is a building on the lot, not an installation.`)
    if ('planId' in work.target) {
      // An installation on a planned body IS a dependency on that body; say it once.
      addDependency(work.target.planId)
      const predecessor = state.physicalPlans.plans.find((plan) => plan.id === (work.target as { planId: string }).planId)!
      if (predecessor.work.kind !== 'placement') refuse(`Plan ${predecessor.id} builds no body for this installation.`)
      if (blueprintById(predecessor.work.blueprintId)?.capability !== blueprint!.installationTargetCapability) {
        refuse(`${blueprint!.name} cannot be installed in what plan ${predecessor.id} builds.`)
      }
    } else {
      const quote = queryFacilityInstallation(state, { blueprintId: work.blueprintId, targetFacilityId: work.target.facilityId })
      // `standardAlreadyMet` is permanent too (P13B-S4): a body never drops below a standard it holds.
      for (const rejection of ['unknownInstallation', 'unknownTarget', 'incompatibleTarget', 'targetHasNoBody', 'standardAlreadyMet'] as const) {
        if (quote.rejections.includes(rejection)) refuse(`${blueprint!.name} can never be installed there: ${rejection}.`)
      }
    }
  } else {
    refuse('A physical plan is either a placement or an installation.')
  }

  const ordinal = state.physicalPlans.plans
    .filter((plan) => plan.studioId === own)
    .reduce((highest, plan) => Math.max(highest, plan.ordinal), 0) + 1
  const plan: PhysicalPlan = {
    id, studioId: own, ordinal, queuedWeek: week,
    work: work.kind === 'placement'
      ? { kind: 'placement', blueprintId: work.blueprintId, origin: { gx: work.origin.gx, gy: work.origin.gy } }
      : { kind: 'installation', blueprintId: work.blueprintId, target: 'facilityId' in work.target ? { facilityId: work.target.facilityId } : { planId: work.target.planId } },
    dependsOn, approvedMaximumDebit, earliestStartWeek, admission,
    approvedQuote: planQuoteSnapshot(state, work),
    pendingQuote: null, status: 'queued', statusWeek: week, reason: null,
    startedPlacementId: null, commitReceipt: null,
  }
  const queued: GameState = {
    ...state,
    physicalPlans: { ...state.physicalPlans, nextPlanId: state.physicalPlans.nextPlanId + 1, plans: [...state.physicalPlans.plans, plan] },
  }
  return withPlanHistory(queued, [planHistory('planQueued', week, plan.id, null)])
}

function applyReorderPhysicalPlans(state: GameState, action: Action & { kind: 'reorderPhysicalPlans' }): GameState {
  exactActionKeys(action as unknown as Record<string, unknown>, ['kind', 'planIds'])
  const own = ownStudio(state)
  const movable = state.physicalPlans.plans.filter((plan) => plan.studioId === own && plan.status !== 'started' && plan.status !== 'cancelled')
  const requested = action.planIds
  if (!Array.isArray(requested) || requested.length !== movable.length ||
    new Set(requested).size !== requested.length || !requested.every((id) => movable.some((plan) => plan.id === id))) {
    refuse('A reorder names every plan still waiting, exactly once.')
  }
  const order = requested.map((id) => movable.find((plan) => plan.id === id)!)
  // Ordinals are redealt from the SAME set the moved plans already held, so a
  // started or cancelled plan's ordinal can never collide with a reordered one.
  const available = movable.map((plan) => plan.ordinal).sort((a, b) => a - b)
  const position = new Map(order.map((plan, index) => [plan.id, available[index]!]))
  for (let index = 0; index < order.length; index++) {
    const plan = order[index]!
    for (const dependencyId of plan.dependsOn) {
      const dependencyPosition = position.get(dependencyId)
      if (dependencyPosition !== undefined && dependencyPosition > available[index]!) {
        refuse(`Plan ${plan.id} cannot run before its dependency ${dependencyId}.`)
      }
    }
  }
  // Rewrite the array in place: every other studio's row keeps its exact position.
  const queue = [...order]
  const plans = state.physicalPlans.plans.map((plan) =>
    movable.some((candidate) => candidate.id === plan.id)
      ? (() => { const next = queue.shift()!; return { ...next, ordinal: position.get(next.id)! } })()
      : plan,
  )
  return { ...state, physicalPlans: { ...state.physicalPlans, plans } }
}

function applyCancelPhysicalPlan(state: GameState, action: Action & { kind: 'cancelPhysicalPlan' }): GameState {
  exactActionKeys(action as unknown as Record<string, unknown>, ['kind', 'planId'])
  const plan = requirePlan(state, action.planId)
  if (plan.status === 'started' || plan.status === 'cancelled') {
    refuse(`Plan ${plan.id} is already ${plan.status} and cannot be cancelled.`)
  }
  const week = state.market.tick
  const drafts: StudioHistoryDraft[] = [planHistory('planCancelled', week, plan.id, null)]
  // A cancelled predecessor never counts as completion: everything waiting on it
  // (and on THOSE plans) is blocked here, naming what stopped it.
  const blockedBy = new Map<string, string>()
  const stopped = [plan.id]
  const plans = [...state.physicalPlans.plans]
  while (stopped.length > 0) {
    const stoppedId = stopped.shift()!
    for (let index = 0; index < plans.length; index++) {
      const candidate = plans[index]!
      if (candidate.status !== 'queued' && candidate.status !== 'held') continue
      if (!candidate.dependsOn.includes(stoppedId) || blockedBy.has(candidate.id)) continue
      blockedBy.set(candidate.id, stoppedId)
      const reason = `dependency ${stoppedId} was ${stoppedId === plan.id ? 'cancelled' : 'blocked'}`
      plans[index] = { ...candidate, status: 'blocked', statusWeek: week, reason, pendingQuote: null }
      drafts.push(planHistory('planBlocked', week, candidate.id, reason))
      stopped.push(candidate.id)
    }
  }
  const cancelledIndex = plans.findIndex((candidate) => candidate.id === plan.id)
  plans[cancelledIndex] = { ...plan, status: 'cancelled', statusWeek: week, reason: null, pendingQuote: null }
  return withPlanHistory({ ...state, physicalPlans: { ...state.physicalPlans, plans } }, drafts)
}

function applyReviewPhysicalPlan(state: GameState, action: Action & { kind: 'reviewPhysicalPlan' }): GameState {
  exactActionKeys(action as unknown as Record<string, unknown>, ['kind', 'planId', 'approvedMaximumDebit'])
  const plan = requirePlan(state, action.planId)
  if (plan.status !== 'held' || plan.pendingQuote === null) refuse(`Plan ${plan.id} is ${plan.status} and has no changed quote to review.`)
  const approvedMaximumDebit = wholeMoney(action.approvedMaximumDebit, 'The approved maximum debit')
  return withPlan(state, {
    ...plan,
    approvedQuote: plan.pendingQuote!,
    pendingQuote: null,
    approvedMaximumDebit,
    status: 'queued',
    statusWeek: state.market.tick,
    reason: null,
  })
}

function applySetPhysicalPlanAdmission(state: GameState, action: Action & { kind: 'setPhysicalPlanAdmission' }): GameState {
  exactActionKeys(action as unknown as Record<string, unknown>, ['kind', 'planId', 'admission'])
  const plan = requirePlan(state, action.planId)
  if (plan.status === 'started' || plan.status === 'cancelled') refuse(`Plan ${plan.id} is already ${plan.status}.`)
  if (!PLAN_ADMISSIONS.includes(action.admission)) refuse('That is not an admission mode.')
  return withPlan(state, { ...plan, admission: action.admission })
}

export type PhysicalPlanAction = Extract<Action, { kind: 'queuePhysicalPlan' | 'reorderPhysicalPlans' | 'cancelPhysicalPlan' | 'reviewPhysicalPlan' | 'setPhysicalPlanAdmission' }>

export function applyPhysicalPlanAction(state: GameState, action: PhysicalPlanAction): GameState {
  switch (action.kind) {
    case 'queuePhysicalPlan': return applyQueuePhysicalPlan(state, action)
    case 'reorderPhysicalPlans': return applyReorderPhysicalPlans(state, action)
    case 'cancelPhysicalPlan': return applyCancelPhysicalPlan(state, action)
    case 'reviewPhysicalPlan': return applyReviewPhysicalPlan(state, action)
    case 'setPhysicalPlanAdmission': return applySetPhysicalPlanAdmission(state, action)
  }
}

// ── Read helpers (the plans page, S3-T4, renders from these) ────────────────

/** One studio's plans in admission order. */
export function studioPhysicalPlans(state: GameState, studioId: string): readonly PhysicalPlan[] {
  return state.physicalPlans.plans.filter((plan) => plan.studioId === studioId).sort((a, b) => a.ordinal - b.ordinal)
}
