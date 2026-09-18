import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { planQuoteSnapshot } from '../src/core/physicalPlans.js'
import { exportSave, makeSave } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState, PhysicalPlan } from '../src/core/types.js'
import { p13aLaboratorySlice } from '../src/harness/p13a/fixtures.js'
import { nextLaboratoryOrigin } from '../src/harness/p13b/fixtures.js'
import { s3ForgeAndReimport } from '../src/harness/p13b/s3-fixtures.js'
import { BridgeSession } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'

// P13B-S3-T4 test-author task (2026-09-16): the plans-page bridge wire (projection
// 34 -> 35). Requirement-derived from the coordinator's fixed T4 wire contract for
// this task. Style and helper conventions follow tests/bridge-p13b-s2-labs.test.ts
// (session/query construction, buildingId/rowLabId resolution, schema-conformance
// check, dispatch-through-a-real-intent pattern), tests/bridge-p13b-s3-save-as.test.ts
// (BridgeSession.fromSaveJson / migrateToV23 "session from a save" idiom),
// tests/p13b-s3-admission.test.ts (spendDownTo, admission reasons) and
// tests/p13b-s3-dependencies.test.ts test 4 (forged-fingerprint held-plan idiom via
// s3ForgeAndReimport). Every case dispatches through a real BridgeSession/
// session.command(), never a mock.
//
// TIMING NOTE (important for the coordinator): at authoring time this repository's
// working tree already carried an UNCOMMITTED, in-progress S3-T4 implementation
// (bridge/plans.ts new, bridge/laboratory.ts, bridge/industry.ts, bridge/session.ts,
// bridge/history.ts and the bridge schema files all modified, PROJECTION_VERSION
// already 35) — the concurrent sim-core specialist had landed the bulk of T4 BEFORE
// this file's first run, not after. This is NOT the "RED: projection still 34"
// starting point the task briefing described. Both requested evidence files were
// still produced as instructed, but the first ("red") capture is honestly a
// same-implementation capture, not a true pre-T4 RED baseline — recorded here so
// that timing gap is never silently lost. Assertions below are derived from the
// coordinator's contract text, not copied from bridge/plans.ts's output; where
// reading bridge/plans.ts / bridge/laboratory.ts / bridge/history.ts (all read-only,
// never edited by this file) surfaced an apparent mismatch between the contract's
// prose and the landed implementation, that is called out inline and is a reportable
// finding, not silently smoothed over.

type PlanWork =
  | { kind: 'placement'; blueprintId: string; origin: { gx: number; gy: number } }
  | { kind: 'installation'; blueprintId: string; target: { facilityId: string } | { planId: string } }

const ACOUSTIC_COST = TUNING.ACOUSTIC_INSTRUMENTS_CAPEX // 350,000
const ELECTRICAL_COST = TUNING.ELECTRICAL_CONTROL_INSTRUMENTS_CAPEX // 350,000
const money = (value: number): string => '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })

function queuePlan(
  state: GameState,
  work: PlanWork,
  approvedMaximumDebit: number,
  extra: { dependsOn?: string[]; earliestStartWeek?: number; admission?: 'reviewChangedQuote' | 'automatic' } = {},
): GameState {
  return applyActions(state, [{ kind: 'queuePhysicalPlan', work, approvedMaximumDebit, ...extra } as never])
}

/** A genuine, RECONCILED cash move — see tests/p13b-s3-admission.test.ts's own
 * `spendDownTo` for the full rationale (a bare `studio.cash` override is refused by
 * `tick()`'s construction cash-ledger invariant). Duplicated locally: this file owns
 * no shared harness edits, and every other bridge test file duplicates its own
 * small per-file helpers rather than importing across test files. */
function spendDownTo(state: GameState, target: number): GameState {
  const delta = state.studio.cash - target
  return {
    ...state,
    studio: { ...state.studio, cash: target },
    ledger: [...state.ledger, { week: state.market.tick, kind: 'overhead', amount: -delta, note: 'weekly studio overhead' }],
  }
}

/** Reads a value out of a possibly-null/undefined slot, or throws a diagnostic error
 * naming what was expected — never a bare `!`, so a genuine absence is a loud,
 * informative test failure instead of a silent runtime crash. */
function required<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) throw new Error(message)
  return value
}

let requestCounter = 0
let commandCounter = 0
function nextRequestId(prefix: string): string { return `${prefix}-req-${String(requestCounter++)}` }

/** The short id every Laboratory row id (`instruments-<id>`, `plan-queue-*-<id>`) is
 * built from — the research-laboratory PLACEMENT's own `.id`, NOT `laboratoryFacilityId`
 * (see tests/bridge-p13b-s2-labs.test.ts's header note; confirmed again directly
 * against bridge/laboratory.ts at authoring time: `instruments-${lab.id}` and the new
 * `plan-queue-${module.key}-${lab.id}` companions share the identical convention). */
function placementLabOf(state: GameState, laboratoryFacilityId: string) {
  const lab = state.placement.facilities.find(p =>
    p.blueprintId === 'research-laboratory' && p.installation === undefined && p.facilityId === laboratoryFacilityId)
  if (!lab) throw new Error(`No installed Research Laboratory placement carries facility "${laboratoryFacilityId}".`)
  return lab
}
function rowLabId(state: GameState, laboratoryFacilityId: string): string {
  return String(placementLabOf(state, laboratoryFacilityId).id)
}
function buildingIdOf(state: GameState, laboratoryFacilityId: string): string {
  return `placed-${rowLabId(state, laboratoryFacilityId)}`
}

type WireAction = { id: string; label: string; detail: string; enabled: boolean; disabledReason: string | null; intent: { intentId: string; kind: string } | null }

function rawIndustry(session: BridgeSession, view: string, requestId: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return session.industry({
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'industryQuery', view,
    targetId: null, page: 0, pageSize: 50, lane: 'audienceAwareness', period: 'all',
    requestId, sessionId: session.sessionId, expectedStateRevision: session.stateRevision, ...extra,
  } as never) as unknown as Record<string, unknown>
}

/** One raw page of the Laboratory Industry response, schema-checked. */
function labResponse(session: BridgeSession, buildingId: string, requestId: string, page = 0, pageSize = 50) {
  const response = rawIndustry(session, 'laboratory', requestId, { targetId: buildingId, page, pageSize })
  if (!('laboratory' in response) || response.laboratory === null) throw new Error(`Laboratory query rejected for building "${buildingId}" (request ${requestId}): ${JSON.stringify(response)}`)
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, response)).toEqual(response)
  return response as unknown as { laboratory: { actions: WireAction[] }; pageCount: number; plans: unknown }
}
function labPage(session: BridgeSession, buildingId: string, requestId: string): { actions: WireAction[] } {
  const first = labResponse(session, buildingId, `${requestId}-p0`, 0)
  const actions = [...first.laboratory.actions]
  for (let page = 1; page < first.pageCount; page++) actions.push(...labResponse(session, buildingId, `${requestId}-p${String(page)}`, page).laboratory.actions)
  return { actions }
}

type WirePlanRow = {
  planId: string; ordinal: number; status: string; statusLabel: string; reason: string | null
  queuedWeek: number; statusWeek: number; workKind: string; blueprintId: string; workLabel: string
  targetFacilityId: string | null; targetPlanId: string | null; dependsOn: string[]
  approvedMaximumDebit: number; earliestStartWeek: number; admission: string
  approvedQuote: { fingerprint: string; cost: number; buildWeeks: number; weeklyOperatingCost: number; components: { label: string; cost: number; weeks: number }[] }
  pendingQuote: WirePlanRow['approvedQuote'] | null
  next: { outcome: string; reason: string | null } | null
  startedPlacementId: number | null
  commitReceipt: { week: number; fingerprint: string; cost: number } | null
}

/** One raw page of the `plans` Industry response, schema-checked. Throws loudly (not
 * silently) if `plans` is absent — that absence IS the pre-T4 RED signal for this
 * whole helper's callers. */
function plansResponse(session: BridgeSession, requestId: string, page = 0, pageSize = 50) {
  const response = rawIndustry(session, 'plans', requestId, { page, pageSize })
  if (!('plans' in response) || response.plans === null) throw new Error(`plans view absent (request ${requestId}, snapshotVersion ${String(response.snapshotVersion)}, title ${JSON.stringify(response.title)}): ${JSON.stringify(response).slice(0, 500)}`)
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, response)).toEqual(response)
  return response as unknown as { plans: { title: string; notice: string; rows: WirePlanRow[]; actions: WireAction[] }; pageCount: number; snapshotVersion: number }
}
/** Every plans-page row and action, merged across pages (bridge/plans.ts pages BOTH
 * rows and actions together off the same slice — unlike the Laboratory page, which
 * pages only `actions`; merging both defensively covers either convention). */
function plansPage(session: BridgeSession, requestId: string): { title: string; notice: string; rows: WirePlanRow[]; actions: WireAction[] } {
  const first = plansResponse(session, `${requestId}-p0`, 0)
  const rows = new Map(first.plans.rows.map(r => [r.planId, r]))
  const actions = new Map(first.plans.actions.map(a => [a.id, a]))
  for (let page = 1; page < first.pageCount; page++) {
    const next = plansResponse(session, `${requestId}-p${String(page)}`, page)
    for (const r of next.plans.rows) rows.set(r.planId, r)
    for (const a of next.plans.actions) actions.set(a.id, a)
  }
  return { ...first.plans, rows: [...rows.values()].sort((a, b) => a.ordinal - b.ordinal), actions: [...actions.values()] }
}

/** Dispatches exactly one row id out of an already-fetched actions list through a
 * real submitIntent command. Throws loudly if the row is absent or refused. */
function dispatchRow(session: BridgeSession, actions: readonly WireAction[], rowId: string): void {
  const row = actions.find(a => a.id === rowId)
  if (!row) throw new Error(`Row "${rowId}" is absent from ${JSON.stringify(actions.map(a => a.id))}.`)
  if (!row.enabled || !row.intent) throw new Error(`Row "${rowId}" is not enabled/available: ${row.disabledReason ?? 'no reason given'}`)
  const response = session.command({
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'submitIntent',
    commandId: `dispatch-${String(commandCounter++)}`, sessionId: session.sessionId,
    expectedStateRevision: session.stateRevision, payload: { intentId: row.intent.intentId },
  })
  if (!response.accepted) throw new Error(`Row "${rowId}" was refused: ${JSON.stringify(response)}`)
}

/** The player studio's own history activities (the existing `view: 'history'`
 * industry query, which is what bridge/history.ts's `historyProjection` feeds —
 * the exact "existing studio-history mechanism" tests/p13b-s3-admission.test.ts's
 * own history-row case (test 6) names at the core level). */
function ownHistoryActivities(session: BridgeSession, requestId: string): { headline: string; detail: string; week: number }[] {
  const own = required(session.gameState.hollywood?.playerStudioId, 'no player studio on this state')
  const response = rawIndustry(session, 'history', requestId, { targetId: own })
  if (!('activities' in response)) throw new Error(`history view rejected: ${JSON.stringify(response)}`)
  return response.activities as { headline: string; detail: string; week: number }[]
}

// ---------------------------------------------------------------------------

/**
 * P13B-S8 sweep: the physical-plan root is shared by every studio (`PhysicalPlan
 * .studioId`), and a rival now admits its own Laboratory plans onto it. Every
 * positional read below means THE PLAYER's own plans, in its own order.
 */
function ownPlans<T extends { studioId: string }>(state: { physicalPlans: { plans: readonly T[] }; hollywood: { playerStudioId: string } | null }): readonly T[] {
  return state.physicalPlans.plans.filter(plan => plan.studioId === state.hollywood!.playerStudioId)
}

describe('P13B-S3-T4 plans bridge page: projection bump', () => {
  it('bumps PROJECTION_VERSION to the S3-T4 wire contract (35; 38 after the S5-R07-T3 bump)', () => {
    expect(PROJECTION_VERSION).toBe(42)
  })
})

describe('case 1: a fresh studio publishes an empty plans page; plans is null off the plans view', () => {
  it('snapshotVersion 36; rows and actions are both empty arrays on a fresh studio; laboratory view carries plans: null', () => {
    const state = p13aLaboratorySlice() // week 12, one operational Lab, no research, no plans queued
    const laboratoryFacilityId = state.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const buildingId = buildingIdOf(state, laboratoryFacilityId)
    const session = new BridgeSession(state, 'p13b-s3-plans-1-fresh')

    const plans = plansResponse(session, nextRequestId('fresh'))
    expect(plans.snapshotVersion).toBe(42)
    expect(plans.plans.rows).toEqual([])
    expect(plans.plans.actions).toEqual([])

    const lab = rawIndustry(session, 'laboratory', nextRequestId('fresh-lab'), { targetId: buildingId })
    expect(lab.plans).toBeNull()
  })
})

describe('case 2: the Laboratory-page acoustic companion queues, admits and appears on the plans page', () => {
  it('plan-queue-acoustic-<lab> exists beside instruments-<lab> naming the cost/build-weeks/no-reservation facts; dispatching it queues a full row on the plans view; one bridge advance starts it, writing planQueued/planStarted history; the acoustic companion then disappears while electrical still offers', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const rl = rowLabId(base, laboratoryFacilityId)
    const buildingId = buildingIdOf(base, laboratoryFacilityId)
    const session = new BridgeSession(base, 'p13b-s3-plans-2-queue')

    const lab = labPage(session, buildingId, nextRequestId('lab'))
    expect(lab.actions.some(a => a.id === `instruments-${rl}`)).toBe(true)
    const queueRow = required(lab.actions.find(a => a.id === `plan-queue-acoustic-${rl}`), `plan-queue-acoustic-${rl} row absent`)
    expect(queueRow.enabled).toBe(true)
    expect(queueRow.intent?.kind).toBe('physicalPlanAction')
    const quote = planQuoteSnapshot(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } })
    expect(queueRow.detail).toContain(money(ACOUSTIC_COST))
    expect(queueRow.detail).toContain(String(TUNING.ACOUSTIC_INSTRUMENTS_BUILD_WEEKS))
    expect(queueRow.detail).toMatch(/nothing is reserved/i)

    dispatchRow(session, lab.actions, `plan-queue-acoustic-${rl}`)

    const queued = plansPage(session, nextRequestId('after-queue'))
    expect(queued.rows).toHaveLength(1)
    const queuedRow = queued.rows[0]!
    expect(queuedRow.status).toBe('queued')
    expect(queuedRow.workKind).toBe('installation')
    expect(queuedRow.blueprintId).toBe('acoustic-instruments')
    expect(queuedRow.targetFacilityId).toBe(laboratoryFacilityId)
    expect(queuedRow.approvedMaximumDebit).toBe(quote.cost)
    expect(queuedRow.approvedQuote.cost).toBe(quote.cost)
    expect(queuedRow.next).toEqual({ outcome: 'admit', reason: null })
    expect(queuedRow.commitReceipt).toBeNull()
    expect(queuedRow.queuedWeek).toBe(12)
    const planId = queuedRow.planId

    // One bridge advance: the SAME pattern tests/bridge-p13b-s2-labs.test.ts's case 3
    // uses (`tick(session.gameState)` then a fresh `BridgeSession` over the ticked
    // state) — the established idiom for "through the bridge" in this file's own
    // reference tests, since BridgeSession itself carries no separate advance-week
    // command (that lives one layer up, in the runtime coordinator).
    const ticked = tick(session.gameState)
    const nextSession = new BridgeSession(ticked, 'p13b-s3-plans-2-ticked')
    const started = plansPage(nextSession, nextRequestId('after-tick'))
    const startedRow = required(started.rows.find(r => r.planId === planId), 'plan row absent after the tick')
    expect(startedRow.status).toBe('started')
    expect(startedRow.commitReceipt).toEqual({ week: 13, fingerprint: startedRow.commitReceipt!.fingerprint, cost: ACOUSTIC_COST })
    expect(startedRow.startedPlacementId).not.toBeNull()
    expect(startedRow.next).toBeNull()

    const history = ownHistoryActivities(nextSession, nextRequestId('history'))
    const queuedHistory = required(history.find(a => a.headline === 'Plan queued'), 'no "Plan queued" history row')
    expect(queuedHistory.detail).toContain(`plan ${planId}`)
    const startedHistory = required(history.find(a => a.headline === 'Plan started'), 'no "Plan started" history row')
    expect(startedHistory.detail).toContain(`plan ${planId}`)

    // CONTRACT CHECK (flagged, may be a real finding — see this file's header note):
    // the coordinator's T4 contract states the acoustic companion "is no longer
    // offered (module installing)" once the plan has started. Reading
    // bridge/laboratory.ts directly shows its gate is `hasOperationalFacilityInstallation`,
    // which is true only once the module is OPERATIONAL (build complete), not merely
    // "installing"/under construction — and `queuePhysicalPlan` itself has no
    // `targetEngaged` refusal at queue time (only admission checks that), so a SECOND
    // acoustic plan may still be legally queueable here. This assertion is written to
    // the CONTRACT text, not to that reading, so a failure here is a genuine
    // requirement-vs-implementation gap to report, not a test to quietly loosen.
    const afterStart = labPage(nextSession, buildingId, nextRequestId('after-start-lab'))
    const acousticCompanion = afterStart.actions.find(a => a.id === `plan-queue-acoustic-${rl}`)
    expect(acousticCompanion === undefined || acousticCompanion.enabled === false).toBe(true)
    const electricalCompanion = required(afterStart.actions.find(a => a.id === `plan-queue-electrical-${rl}`), `plan-queue-electrical-${rl} row absent while acoustic installs`)
    expect(electricalCompanion.enabled).toBe(true)
  }, 30_000)
})

describe('case 3: the envelope hold (insufficient cash) and the changed-quote hold (forged fingerprint)', () => {
  it('a queued electrical plan with cash spent below its cost stays queued after an advance, with next.reason === "insufficient cash"', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const rl = rowLabId(base, laboratoryFacilityId)
    const buildingId = buildingIdOf(base, laboratoryFacilityId)
    // spendDownTo runs on the state BEFORE the session is created from it (contract text).
    const poor = spendDownTo(base, 300_000) // below the $350,000 electrical ceiling
    const session = new BridgeSession(poor, 'p13b-s3-plans-3a-poor')

    const lab = labPage(session, buildingId, nextRequestId('poor-lab'))
    dispatchRow(session, lab.actions, `plan-queue-electrical-${rl}`)
    const queued = plansPage(session, nextRequestId('poor-queued'))
    expect(queued.rows).toHaveLength(1)
    const planId = queued.rows[0]!.planId

    const ticked = tick(session.gameState)
    const nextSession = new BridgeSession(ticked, 'p13b-s3-plans-3a-ticked')
    const after = plansPage(nextSession, nextRequestId('poor-after'))
    const row = required(after.rows.find(r => r.planId === planId), 'electrical plan row absent after the tick')
    expect(row.status).toBe('queued') // cash is a WAIT, never persisted as held (engine law)
    expect(row.next).not.toBeNull()
    expect(row.next!.reason).toMatch(/insufficient cash/i)
  }, 30_000)

  it('a forged approvedQuote.fingerprint holds at the next boundary; plan-review-<planId> names the approved/pending figures; dispatching it re-queues with the pending fingerprint promoted, then it starts', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const queued = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST)
    const forged = s3ForgeAndReimport(queued, parsed => {
      const s = parsed.state as { physicalPlans: { plans: { studioId: string; approvedQuote: { fingerprint: string } }[] }; hollywood: { playerStudioId: string } | null }
      ownPlans(s)[0]!.approvedQuote.fingerprint = `${ownPlans(s)[0]!.approvedQuote.fingerprint}-forged-drift`
    })
    const heldState = tick(forged)
    const planId = ownPlans(heldState)[0]!.id
    expect(ownPlans(heldState)[0]!.status).toBe('held') // engine-level sanity, matches tests/p13b-s3-dependencies.test.ts test 4

    const session = new BridgeSession(heldState, 'p13b-s3-plans-3b-held')
    const plans = plansPage(session, nextRequestId('held'))
    const row = required(plans.rows.find(r => r.planId === planId), 'held plan row absent')
    expect(row.status).toBe('held')
    expect(row.pendingQuote).not.toBeNull()
    expect(row.reason).toMatch(/quote changed/i)

    const reviewRow = required(plans.actions.find(a => a.id === `plan-review-${planId}`), `plan-review-${planId} row absent`)
    expect(reviewRow.label).toBe('Review changed plan')
    expect(reviewRow.intent?.kind).toBe('physicalPlanAction')
    // The forge changes ONLY the fingerprint, so approved and pending numerically
    // coincide here — the review detail is checked for BOTH labeled figures, not for
    // an actual difference (a genuine content diff needs a world fact to actually
    // move, which this constant-tuning deterministic engine cannot organically do —
    // the same documented scope limit src/harness/p13b/s3-fixtures.ts's own header
    // records for this forging idiom).
    expect(reviewRow.detail).toContain(`Approved ${money(ACOUSTIC_COST)}`)
    expect(reviewRow.detail).toContain(`Current quote ${money(ACOUSTIC_COST)}`)

    dispatchRow(session, plans.actions, `plan-review-${planId}`)
    const reviewed = plansPage(session, nextRequestId('reviewed'))
    const reviewedRow = required(reviewed.rows.find(r => r.planId === planId), 'plan row absent after review')
    expect(reviewedRow.status).toBe('queued')
    expect(reviewedRow.approvedQuote.fingerprint).toBe(row.pendingQuote!.fingerprint)
    expect(reviewedRow.pendingQuote).toBeNull()

    const ticked = tick(session.gameState)
    const nextSession = new BridgeSession(ticked, 'p13b-s3-plans-3b-ticked')
    const started = plansPage(nextSession, nextRequestId('reviewed-started'))
    expect(required(started.rows.find(r => r.planId === planId), 'plan row absent after starting').status).toBe('started')
  })
})

describe('case 4: cancel blocks its dependent; a started plan has no cancel row', () => {
  it('cancelling the predecessor cancels it and blocks the dependent, naming it, with matching history rows; the cancel row disappears; an independently STARTED plan carries no cancel row at all', () => {
    let state = p13aLaboratorySlice()
    const laboratoryFacilityId = state.operations.facilities.find(f => f.capability === 'laboratory')!.id
    // A third, independent plan that WILL be admitted (a fresh Lab body — no
    // dependency, no target conflict with the two below) so this case can also prove
    // a started plan carries no cancel row, per the contract's own closing clause.
    state = queuePlan(state, { kind: 'placement', blueprintId: 'research-laboratory', origin: nextLaboratoryOrigin(state) }, TUNING.RESEARCH_LABORATORY_CAPEX)
    const startedPlanId = ownPlans(state)[0]!.id
    state = tick(state)
    expect(ownPlans(state)[0]!.status).toBe('started') // engine-level sanity

    // The dependency chain: bridge/laboratory.ts's Laboratory companions never set
    // dependsOn (contract text), so both plans are built through applyActions on the
    // seed state, then the session is loaded from a save of that state.
    state = queuePlan(state, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST)
    const firstId = ownPlans(state)[1]!.id
    state = queuePlan(state, { kind: 'installation', blueprintId: 'electrical-control-instruments', target: { facilityId: laboratoryFacilityId } }, ELECTRICAL_COST, { dependsOn: [firstId] })
    const secondId = ownPlans(state)[2]!.id

    const session = BridgeSession.fromSaveJson(exportSave(makeSave(state)), 'p13b-s3-plans-4-cancel')
    const before = plansPage(session, nextRequestId('before-cancel'))
    expect(required(before.rows.find(r => r.planId === firstId), 'first plan row absent').status).toBe('queued')
    const dependentBefore = required(before.rows.find(r => r.planId === secondId), 'second plan row absent')
    expect(dependentBefore.status).toBe('queued')
    expect(dependentBefore.dependsOn).toEqual([firstId])
    expect(before.actions.some(a => a.id === `plan-cancel-${startedPlanId}`)).toBe(false) // no cancel row on a started plan

    dispatchRow(session, before.actions, `plan-cancel-${firstId}`)
    const after = plansPage(session, nextRequestId('after-cancel'))
    expect(required(after.rows.find(r => r.planId === firstId), 'first plan row absent after cancel').status).toBe('cancelled')
    const dependentAfter = required(after.rows.find(r => r.planId === secondId), 'second plan row absent after cancel')
    expect(dependentAfter.status).toBe('blocked')
    expect(dependentAfter.reason).toContain(firstId)
    expect(after.actions.some(a => a.id === `plan-cancel-${firstId}`)).toBe(false)
    expect(after.actions.some(a => a.id === `plan-cancel-${startedPlanId}`)).toBe(false)

    const history = ownHistoryActivities(session, nextRequestId('history'))
    const cancelledHistory = required(history.find(a => a.headline === 'Plan cancelled'), 'no "Plan cancelled" history row')
    expect(cancelledHistory.detail).toContain(`plan ${firstId}`)
    const blockedHistory = required(history.find(a => a.headline === 'Plan blocked'), 'no "Plan blocked" history row')
    expect(blockedHistory.detail).toContain(`plan ${secondId}`)
    expect(blockedHistory.detail).toContain(firstId) // the reason names the predecessor
  }, 30_000)
})

describe('case 5: reorder', () => {
  it('three independent queued plans: move-down swaps ordinals 1<->2 on the wire; move-up is disabled at the top and move-down at the bottom', () => {
    let state = p13aLaboratorySlice()
    const laboratoryFacilityId = state.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const origin = nextLaboratoryOrigin(state) // computed once, before any queueing — queueing never touches placement/ground
    state = queuePlan(state, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST)
    const planA = ownPlans(state)[0]!.id
    state = queuePlan(state, { kind: 'installation', blueprintId: 'electrical-control-instruments', target: { facilityId: laboratoryFacilityId } }, ELECTRICAL_COST)
    const planB = ownPlans(state)[1]!.id
    state = queuePlan(state, { kind: 'placement', blueprintId: 'research-laboratory', origin }, TUNING.RESEARCH_LABORATORY_CAPEX)
    const planC = ownPlans(state)[2]!.id

    const session = new BridgeSession(state, 'p13b-s3-plans-5-reorder')
    const before = plansPage(session, nextRequestId('before-reorder'))
    expect(before.rows.map(r => r.planId)).toEqual([planA, planB, planC])
    expect(before.rows.map(r => r.ordinal)).toEqual([1, 2, 3])
    expect(required(before.actions.find(a => a.id === `plan-move-up-${planA}`), 'move-up row absent for the top plan').enabled).toBe(false)
    expect(required(before.actions.find(a => a.id === `plan-move-down-${planC}`), 'move-down row absent for the bottom plan').enabled).toBe(false)

    dispatchRow(session, before.actions, `plan-move-down-${planA}`)
    const after = plansPage(session, nextRequestId('after-reorder'))
    const byId = new Map(after.rows.map(r => [r.planId, r]))
    expect(byId.get(planB)!.ordinal).toBe(1)
    expect(byId.get(planA)!.ordinal).toBe(2)
    expect(after.rows.map(r => r.planId)).toEqual([planB, planA, planC])
  })

  it('a dependent immediately following its predecessor cannot move up: disabled with the engine\'s own "before its dependency" text', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    let state = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST)
    const predecessorId = ownPlans(state)[0]!.id
    state = queuePlan(state, { kind: 'installation', blueprintId: 'electrical-control-instruments', target: { facilityId: laboratoryFacilityId } }, ELECTRICAL_COST, { dependsOn: [predecessorId] })
    const dependentId = ownPlans(state)[1]!.id

    const session = new BridgeSession(state, 'p13b-s3-plans-5b-dependency')
    const plans = plansPage(session, nextRequestId('dependency'))
    const moveUp = required(plans.actions.find(a => a.id === `plan-move-up-${dependentId}`), `plan-move-up-${dependentId} row absent`)
    expect(moveUp.enabled).toBe(false)
    expect(moveUp.disabledReason).toMatch(/before its dependency/i)
  })
})

describe('case 6: admission mode toggle', () => {
  it('the mode NOT currently set is the only admission action offered; dispatching it flips the row\'s admission', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const state = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST)
    const planId = ownPlans(state)[0]!.id
    expect(ownPlans(state)[0]!.admission).toBe('reviewChangedQuote') // the queuePhysicalPlan default

    const session = new BridgeSession(state, 'p13b-s3-plans-6-admission')
    const before = plansPage(session, nextRequestId('before-admission'))
    expect(before.actions.some(a => a.id === `plan-admission-${planId}-reviewChangedQuote`)).toBe(false) // already the current mode
    const toAutomatic = required(before.actions.find(a => a.id === `plan-admission-${planId}-automatic`), `plan-admission-${planId}-automatic row absent`)
    expect(toAutomatic.enabled).toBe(true)
    expect(toAutomatic.intent?.kind).toBe('physicalPlanAction')

    dispatchRow(session, before.actions, `plan-admission-${planId}-automatic`)
    const after = plansPage(session, nextRequestId('after-admission'))
    const row = required(after.rows.find(r => r.planId === planId), 'plan row absent after the admission flip')
    expect(row.admission).toBe('automatic')
    expect(after.actions.some(a => a.id === `plan-admission-${planId}-automatic`)).toBe(false)
    expect(after.actions.some(a => a.id === `plan-admission-${planId}-reviewChangedQuote`)).toBe(true)
  })
})

describe('case 7: stale revision', () => {
  it('a plans intent submitted with a stale expectedStateRevision is refused with STALE_REVISION, and that specific attempt changes nothing', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const rl = rowLabId(base, laboratoryFacilityId)
    const buildingId = buildingIdOf(base, laboratoryFacilityId)
    const session = new BridgeSession(base, 'p13b-s3-plans-7-stale')

    const lab = labPage(session, buildingId, nextRequestId('stale-lab'))
    const staleRevision = session.stateRevision
    dispatchRow(session, lab.actions, `plan-queue-acoustic-${rl}`) // a legitimate dispatch; revision now advances past staleRevision
    const afterLegitimateQueue = JSON.stringify(session.gameState)

    const plans = plansPage(session, nextRequestId('stale-plans'))
    const cancelRow = required(plans.actions.find(a => a.id.startsWith('plan-cancel-')), 'no cancel row to attempt staleness against')
    const response = session.command({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'submitIntent',
      commandId: 'stale-plan-cancel', sessionId: session.sessionId,
      expectedStateRevision: staleRevision, // one revision behind current
      payload: { intentId: cancelRow.intent!.intentId },
    })
    expect(response).toMatchObject({ accepted: false, reasonCode: 'STALE_REVISION' })
    expect(JSON.stringify(session.gameState)).toBe(afterLegitimateQueue) // the stale attempt itself changed nothing
  })
})

describe('case 8: player-safe — no rival plan, planId or facility ever appears', () => {
  it('a genuine rival physical plan never appears on the player plans view, in no action id, and its studio id leaks nowhere in the page', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const queued = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST)
    const own = queued.hollywood!.playerStudioId
    const rivalStudioId = queued.hollywood!.identities.find(i => i.studioId !== own)!.studioId
    const ownPlan = ownPlans(queued)[0]!
    // P13B-S8 ENGINE FACT (c609e0a, `admitRivalPlans` in `src/core/rivalResearch.ts`):
    // the earlier premise here ("this engine has no public action path that grows a
    // genuine rival physical plan") is FALSIFIED — a rival now genuinely admits its
    // own Laboratory plan every natural week, minted from the RIVAL's OWN id
    // sequence (`${studioId}:plan:${ordinal}`), never touching the player's
    // `nextPlanId`. This fixture (`p13aLaboratorySlice`, week 12) already carries
    // one such real rival plan per entered rival — use it directly instead of
    // forging a row (a forged `${rivalStudioId}:plan:1` now DUPLICATES this genuine
    // plan's id and `validateSaveV28` refuses it inside `stateDigest()`: "Physical
    // plans save: duplicate plan id studio-aca408ec-r01:plan:1").
    const rivalPlan: PhysicalPlan = required(queued.physicalPlans.plans.find(p => p.studioId === rivalStudioId),
      'no genuine rival plan on this fixture — the S8 admission premise this case now rests on has changed again')

    const session = new BridgeSession(queued, 'p13b-s3-plans-8-player-safe')
    const plans = plansPage(session, nextRequestId('player-safe'))
    expect(plans.rows).toHaveLength(1)
    expect(plans.rows[0]!.planId).toBe(ownPlan.id)
    expect(plans.actions.some(a => a.id.includes(rivalPlan.id))).toBe(false)
    const json = JSON.stringify(plans)
    expect(json).not.toContain(rivalStudioId)
  })
})
