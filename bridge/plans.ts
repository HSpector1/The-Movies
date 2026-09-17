/** P13B-S3's private player Plans read side. The engine's plan law is the authority. */
import { applyActions } from '../src/core/actions.js'
import { campaignDate } from '../src/core/calendar.js'
import { cancellationQuote } from '../src/core/installationCancellation.js'
import { blueprintById } from '../src/core/placement.js'
import { planAdmissionView, studioPhysicalPlans, resolvedTargetFacilityId, type PhysicalPlanAction } from '../src/core/physicalPlans.js'
import type { GameState, PhysicalPlan, PhysicalPlanWork, PlanQuoteSnapshot } from '../src/core/types.js'
import { cancellationDetail, cancellationQuoteRow, isCancellationAction, type CancellationAction } from './cancellation.ts'
import type { AvailableIntent } from './protocol.ts'
import type { IndustryPage } from './schema/industry-schema.ts'

type PlansPage = NonNullable<IndustryPage['plans']>
type PlanRow = PlansPage['rows'][number]
type ActionQuoteRow = NonNullable<PlansPage['actions'][number]['quote']>
export type PlanActionSpec = {
  id: string
  /** The plan this row acts on: the page publishes only the rows its own page of plans owns. */
  planId: string
  // P13B-S6: a STARTED plan owns a committed placement, and stopping that placement is
  // not a plan verb — the plan itself is already permanent at admission.
  action: PhysicalPlanAction | CancellationAction
  label: string
  detail: string
  enabled: boolean
  disabledReason: string | null
  /** P13B-S6: the engine's own `cancellationQuote` on a `cancel-*` row; null on every plan verb. */
  quote: ActionQuoteRow | null
}
export type PlanIntent = { spec: PlanActionSpec; option: AvailableIntent }

const money = (value: number) => '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })
const PLAN_ACTION_KINDS: readonly string[] =
  ['queuePhysicalPlan', 'reorderPhysicalPlans', 'cancelPhysicalPlan', 'reviewPhysicalPlan', 'setPhysicalPlanAdmission']
/** A plan verb is not research: the published intent kind says what it actually moves. */
export const isPhysicalPlanAction = (action: { kind: string }): boolean => PLAN_ACTION_KINDS.includes(action.kind)

const STATUS_LABEL = {
  queued: 'Queued', held: 'Held for review', blocked: 'Blocked', started: 'Started', cancelled: 'Cancelled',
} as const
/** A started or cancelled plan has no next admission boundary; nothing is published for one. */
const terminal = (plan: PhysicalPlan): boolean => plan.status === 'started' || plan.status === 'cancelled'

const facilityName = (state: GameState, facilityId: string) =>
  state.operations.facilities.find(f => f.id === facilityId)?.name ?? facilityId

function workLabel(state: GameState, work: PhysicalPlanWork): string {
  const name = blueprintById(work.blueprintId)?.name ?? work.blueprintId
  if (work.kind === 'placement') return `${name} at lot ${String(work.origin.gx)},${String(work.origin.gy)}`
  return 'facilityId' in work.target
    ? `${name} in ${facilityName(state, work.target.facilityId)}`
    : `${name} in the body plan ${work.target.planId} builds`
}

const quoteRow = (quote: PlanQuoteSnapshot): PlanRow['approvedQuote'] => ({
  fingerprint: quote.fingerprint, cost: quote.cost, buildWeeks: quote.buildWeeks,
  weeklyOperatingCost: quote.weeklyOperatingCost,
  components: quote.components.map(c => ({ label: c.label, cost: c.cost, weeks: c.weeks })),
})

/** The old and the new quote side by side, and exactly which component labels moved. */
function reviewDetail(plan: PhysicalPlan): string {
  const approved = plan.approvedQuote, pending = plan.pendingQuote!
  const before = approved.components.map(c => c.label), now = pending.components.map(c => c.label)
  const gone = before.filter(label => !now.includes(label)), added = now.filter(label => !before.includes(label))
  return `Approved ${money(approved.cost)} · ${String(approved.buildWeeks)} build weeks · ${money(approved.weeklyOperatingCost)}/week operating. ` +
    `Current quote ${money(pending.cost)} · ${String(pending.buildWeeks)} build weeks · ${money(pending.weeklyOperatingCost)}/week operating. ` +
    (gone.length === 0 && added.length === 0
      ? 'The component list is unchanged.'
      : `Components changed: ${[...gone.map(l => `removed ${l}`), ...added.map(l => `added ${l}`)].join('; ')}.`) +
    ` Approving sets the ceiling to ${money(pending.cost)}. Nothing is charged until the plan starts at a weekly boundary.`
}

/**
 * Every plan decision this studio can reach, with the ENGINE's own refusal text on
 * the rows it would not accept — the same dry run the Laboratory page uses. Cached
 * per immutable state, exactly as `laboratoryActionSpecs` is.
 */
const quotes = new WeakMap<GameState, readonly PlanActionSpec[]>()
export function planActionSpecs(state: GameState): readonly PlanActionSpec[] {
  const prior = quotes.get(state)
  if (prior) return prior
  const specs: PlanActionSpec[] = []
  const own = state.hollywood?.playerStudioId
  if (own === undefined) { quotes.set(state, specs); return specs }
  function add(id: string, planId: string, action: PhysicalPlanAction | CancellationAction, label: string, detail: string, refusal: string | null = null, quote: ActionQuoteRow | null = null) {
    let disabledReason = refusal
    // P13B-S6: a cancel row is priced and refused by `cancellationQuote` alone (see
    // bridge/laboratory.ts's own note); a second dry run would be a second authority.
    if (disabledReason === null && !isCancellationAction(action)) {
      try {
        const next = applyActions(state, [action])
        if (next === state) throw new Error('This decision is not currently available.')
      } catch (error) { disabledReason = (error as Error).message }
    }
    specs.push({ id, planId, action, label, detail, enabled: disabledReason === null, disabledReason, quote })
  }
  const plans = studioPhysicalPlans(state, own)
  // The engine's own reorder set: a started or cancelled plan is never named in a permutation.
  const movable = plans.filter(plan => !terminal(plan))
  for (const plan of plans) {
    const label = workLabel(state, plan.work)
    if (plan.status === 'queued' || plan.status === 'held' || plan.status === 'blocked') {
      add(`plan-cancel-${plan.id}`, plan.id, { kind: 'cancelPhysicalPlan', planId: plan.id },
        `Cancel plan: ${label}`,
        'Nothing was reserved for this plan, so nothing is refunded or released. Plans that depend on it are blocked here and never count it as completion.')
    }
    // P13B-S6: a STARTED plan's own committed placement. `plan-cancel-<planId>` above is
    // withheld for a started plan and stays withheld — cancelling the PLAN and cancelling
    // the WORK it already committed are different decisions with different money — so this
    // is a separate row on the engine's own project id. The ENGINE decides it exists:
    // `cancellationQuote` refuses a completed record, a cancelled one, a restoration and a
    // whole-body placement (only work inside an existing building can be stopped).
    if (plan.status === 'started' && plan.startedPlacementId !== null) {
      const placed = state.placement.facilities.find(candidate => candidate.id === plan.startedPlacementId)
      const quote = placed === undefined ? null : cancellationQuote(state, { projectId: placed.projectId })
      if (placed !== undefined && quote !== null && quote.ok) {
        const row = cancellationQuoteRow(state, { projectId: placed.projectId })
        add(`cancel-${placed.projectId}`, plan.id, { kind: 'cancelInstallation', projectId: placed.projectId },
          `Cancel committed work: ${label}`,
          cancellationDetail(state, row) +
          ' The plan record itself keeps its admission history; it is already started and is not queued again.',
          quote.refusal, row)
      }
    }
    if (plan.status === 'held' && plan.pendingQuote !== null) {
      add(`plan-review-${plan.id}`, plan.id,
        { kind: 'reviewPhysicalPlan', planId: plan.id, approvedMaximumDebit: plan.pendingQuote.cost },
        'Review changed plan', reviewDetail(plan))
    }
    const other = plan.admission === 'automatic' ? 'reviewChangedQuote' : 'automatic'
    add(`plan-admission-${plan.id}-${other}`, plan.id, { kind: 'setPhysicalPlanAdmission', planId: plan.id, admission: other },
      other === 'automatic' ? 'Admit automatically within the ceiling' : 'Hold a changed quote for review',
      other === 'automatic'
        ? `Start this plan at the next boundary whenever its scope is unchanged and the quote is at or below ${money(plan.approvedMaximumDebit)}. A changed component list still holds.`
        : `Start this plan only while the live quote is exactly the approved one (${money(plan.approvedQuote.cost)}). Any change waits for your review.`)
    const at = movable.indexOf(plan)
    if (at < 0) continue
    const swapped = (index: number) => {
      const order = movable.map(candidate => candidate.id)
      const held = order[at]!
      order[at] = order[index]!
      order[index] = held
      return order
    }
    add(`plan-move-up-${plan.id}`, plan.id, { kind: 'reorderPhysicalPlans', planIds: swapped(Math.max(0, at - 1)) },
      'Move earlier in the admission order',
      at > 0 ? `Admit this plan before ${workLabel(state, movable[at - 1]!.work)}. Reordering reserves nothing and revalidates every dependency.`
        : 'This plan is already the first the studio will admit; there is nothing to move it before.',
      at > 0 ? null : 'This plan is already first in the admission order.')
    add(`plan-move-down-${plan.id}`, plan.id, { kind: 'reorderPhysicalPlans', planIds: swapped(Math.min(movable.length - 1, at + 1)) },
      'Move later in the admission order',
      at < movable.length - 1 ? `Admit this plan after ${workLabel(state, movable[at + 1]!.work)}. Reordering reserves nothing and revalidates every dependency.`
        : 'This plan is already the last the studio will admit; there is nothing to move it after.',
      at < movable.length - 1 ? null : 'This plan is already last in the admission order.')
  }
  quotes.set(state, specs)
  return specs
}

function planRow(state: GameState, plan: PhysicalPlan): PlanRow {
  // `state.market.tick + 1` asks the engine what happens at the NEXT boundary — the
  // same question the tick asks, not "would it start in the week already closed?".
  const next = terminal(plan) ? null : planAdmissionView(state, plan, state.market.tick + 1)
  return {
    planId: plan.id, ordinal: plan.ordinal, status: plan.status, statusLabel: STATUS_LABEL[plan.status],
    reason: plan.reason, queuedWeek: plan.queuedWeek, statusWeek: plan.statusWeek,
    workKind: plan.work.kind, blueprintId: plan.work.blueprintId, workLabel: workLabel(state, plan.work),
    targetFacilityId: resolvedTargetFacilityId(state, plan.work),
    targetPlanId: plan.work.kind === 'installation' && 'planId' in plan.work.target ? plan.work.target.planId : null,
    dependsOn: [...plan.dependsOn],
    approvedMaximumDebit: plan.approvedMaximumDebit, earliestStartWeek: plan.earliestStartWeek,
    admission: plan.admission, approvedQuote: quoteRow(plan.approvedQuote),
    pendingQuote: plan.pendingQuote === null ? null : quoteRow(plan.pendingQuote),
    next: next === null ? null : { outcome: next.outcome, reason: next.reason },
    startedPlacementId: plan.startedPlacementId,
    commitReceipt: plan.commitReceipt === null ? null
      : { week: plan.commitReceipt.week, fingerprint: plan.commitReceipt.fingerprint, cost: plan.commitReceipt.cost },
  }
}

/** The player studio's plans in admission order. Rivals' plans never reach this page. */
export function plansPage(state: GameState, intents: readonly PlanIntent[], page: number, pageSize: number): {
  plans: PlansPage; totalRows: number; pageCount: number
} {
  const own = state.hollywood?.playerStudioId
  if (own === undefined) throw new Error('This campaign has no studio with physical plans.')
  const plans = studioPhysicalPlans(state, own)
  const pageCount = Math.ceil(plans.length / pageSize)
  if (page > 0 && page >= pageCount) throw new Error('That plans page is outside this snapshot. Return to the first page.')
  const shown = plans.slice(page * pageSize, (page + 1) * pageSize)
  const owned = new Set(shown.map(plan => plan.id))
  const enabled = new Map(intents.map(intent => [intent.spec.id, intent.option]))
  return { totalRows: plans.length, pageCount, plans: {
    title: 'Physical plans',
    notice: `Your studio's physical plans in admission order, at ${campaignDate(state.market.tick).label}. ` +
      'A waiting plan reserves nothing: no cash, weekly commitment, capacity or engagement moves until it starts at a weekly boundary, and each plan is quoted again before it starts.',
    rows: shown.map(plan => planRow(state, plan)),
    actions: planActionSpecs(state).filter(spec => owned.has(spec.planId)).map(spec => ({
      id: spec.id, label: spec.label, detail: spec.detail,
      enabled: spec.enabled && enabled.has(spec.id),
      disabledReason: spec.disabledReason ?? (enabled.has(spec.id) ? null : 'Refresh this page to review the current decision.'),
      intent: enabled.get(spec.id) ?? null,
      // P13B-S5/S6: the shared action row's quote. A plan verb never carries one; a
      // P13B-S6 `cancel-*` row carries the engine's own cancellation quote.
      quote: spec.quote,
    })),
  } }
}
