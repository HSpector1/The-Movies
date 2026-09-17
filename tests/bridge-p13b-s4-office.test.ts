import { describe, expect, it } from 'vitest'
import { blueprintById } from '../src/core/placement.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { p13aLaboratorySlice } from '../src/harness/p13a/fixtures.js'
import { s4BareOfficeStudio } from '../src/harness/p13b/s4-fixtures.js'
import { BridgeSession } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'

// P13B-S4-T3 independent-test-engineer task (2026-09-17): the office-page bridge
// wire (projection 35 -> 36). Requirement-derived strictly from the coordinator's
// FIXED T3 wire contract handed to this task, cross-checked directly against the
// delivered bridge/office.ts, src/core/officeConversion.ts and
// bridge/schema/industry-schema.ts (all read-only here, never edited) and against
// several disposable `vite-node` probe scripts run against the real BridgeSession
// during authoring (never committed; reproduction commands are named inline next
// to every flagged finding below so another engineer can re-run them).
//
// TIMING NOTE (important for the coordinator, mirrors tests/bridge-p13b-s3-plans
// .test.ts's own header): at authoring time `PROJECTION_VERSION` already read 36
// and `bridge/office.ts` already existed, fully wired into bridge/industry.ts and
// bridge/session.ts — the concurrent sim-core specialist had landed the whole of
// T3 BEFORE this file's first run. This is NOT the "RED: projection still 35"
// starting point the task briefing described. The first-run evidence capture is
// therefore an honest same-implementation capture, not a true pre-T3 RED
// baseline. Assertions below are still derived from the contract text alone, not
// copied from bridge/office.ts's output — where a probe surfaced a genuine
// mismatch between the contract's prose and the landed implementation, the
// assertion is still written to the CONTRACT and is flagged "CONTRACT CHECK"
// inline, exactly as tests/bridge-p13b-s3-plans.test.ts's own case 2 does.
//
// TWO CONTRACT CHECK findings were originally raised against cases 2 and 4 (same
// two root causes, reproduced independently in both places). Both were reported
// to the coordinator, who ADJUDICATED them on 2026-09-17 while three concurrent
// sim-core additions to bridge/* landed (see the AMENDMENT NOTE below the
// original findings for the corrected assertions now in force):
//
//  (A) refusal precedence on the SAME blueprint's own row while it is running.
//  `queryFacilityInstallation` (src/core/placement.ts) pushes `alreadyInstalled`
//  (any placement record of this exact blueprint already targets this facility,
//  in ANY status) BEFORE `targetEngaged` (occupancy holders) into `rejections`.
//  So the row for the blueprint that is ITSELF currently under construction
//  reports `refusal: 'alreadyInstalled'`, not `'targetEngaged'` — the engine's
//  own `rejections` array always correctly contained BOTH (confirmed:
//  `tests/p13b-s4-quotes.test.ts`'s own engagement test, lines 124-174, asserts
//  `rejections.toContain('targetEngaged')`, which is true and unaffected by any
//  of this). ADJUDICATED: this is the intended behavior, not a gap. The wire now
//  publishes the engine's own `rejections: string[]` member alongside `refusal`
//  (= `rejections[0]`) so a client never has to guess what the primary refusal
//  hid. Cases 2 and 4 below assert this directly.
//
//  (B) plan-companion hiding was originally scoped to ONE blueprint only, which
//  under-hid a companion whose OWN blueprint was not the one running but whose
//  target standard the body could already reach through what WAS running.
//  ADJUDICATED: refined, not loosened — a companion is now hidden when its own
//  blueprint is committed/planned on the body OR its target standard is <= the
//  body's REACHABLE standard (current standard, every committed-in-any-status
//  conversion's toStandard, and every queued/held/started plan's toStandard —
//  `bridge/office.ts`'s new `reachableStandard`). Case 4 (both companions hidden
//  once the iii plan's conversion commits) now stands as originally written,
//  correctly, under this refined rule; case 4b (below) adds the coordinator's
//  named counter-scenario: a LOWER conversion running immediately leaves a
//  HIGHER companion still offered, because chaining upward stays lawful.
//
//  (C) NEW, not a finding: the immediate `office-convert-*` commit now publishes
//  intent kind `'installationAction'` (bridge/schema/intent-schema.ts) instead of
//  reusing `'researchAction'` — a new, S4-specific kind, distinct from the
//  Laboratory's `instruments-<lab>` row (which genuinely is a TechnologyAction
//  and keeps `'researchAction'`). The plan-queue companions are unaffected and
//  keep `'physicalPlanAction'`. Asserted directly in case 1.
//
//  (D) DISCOVERED AND FIXED, same session: implementing (A)'s amendment first
//  broke a DIFFERENT, still-standing (never amended) piece of the original T3
//  contract — a conversion row querying its OWN blueprint after that blueprint
//  is OPERATIONAL (complete, not running) briefly ALSO read
//  `refusal: 'alreadyInstalled'` instead of the contract's `'standardAlreadyMet'`,
//  because `alreadyInstalled`'s own check (src/core/placement.ts) carries no
//  status filter and the amended `refusalOf` no longer special-cased
//  `standardAlreadyMet` to outrank it. Reported rather than silently absorbed
//  (the original assertions at case 2's "done" section and case 3's "after"
//  section were never weakened, and briefly went RED); sim-core fixed
//  `refusalOf` the same session to special-case a COMPLETED record's own row.
//  Both assertions pass again, unchanged from their first-written form.
//
// Style and helper conventions follow tests/bridge-p13b-s3-plans.test.ts (session
// construction, rawIndustry/dispatchRow/ownHistoryActivities idioms, the
// duplicated-not-shared spendDownTo helper, the "flag, don't silently loosen"
// CONTRACT CHECK convention) and tests/bridge-p13b-s2-labs.test.ts (schema-checked
// per-page response helper, action-list pagination merge). Engine-side numbers
// and fixtures follow tests/p13b-s4-quotes.test.ts, tests/p13b-s4-downtime.test.ts
// and src/harness/p13b/s4-fixtures.ts, all read-only. Every case dispatches
// through a real BridgeSession / session.command(), never a mock.

const money = (value: number): string => '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })

/** The genuine, RECONCILED cash move this repo's bridge test files each carry
 * their own copy of (see tests/bridge-p13b-s3-plans.test.ts's identical helper
 * and tests/p13b-s3-admission.test.ts's original) — a bare `studio.cash`
 * override is refused by `tick()`'s construction cash-ledger invariant. */
function spendDownTo(state: GameState, target: number): GameState {
  const delta = state.studio.cash - target
  return {
    ...state,
    studio: { ...state.studio, cash: target },
    ledger: [...state.ledger, { week: state.market.tick, kind: 'overhead', amount: -delta, note: 'weekly studio overhead' }],
  }
}

function required<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) throw new Error(message)
  return value
}

let requestCounter = 0
let commandCounter = 0
function nextRequestId(prefix: string): string { return `${prefix}-req-${String(requestCounter++)}` }

function officeFacilityIdOf(state: GameState): string {
  return required(state.operations.facilities.find(f => f.capability === 'development-casting'), 'no development-casting facility on this state').id
}

type WireAction = { id: string; label: string; detail: string; enabled: boolean; disabledReason: string | null; intent: { intentId: string; kind: string } | null }
type WireConversionRow = {
  blueprintId: 'office-conversion-ii' | 'office-conversion-iii'; label: string; cost: number; buildWeeks: number
  weeklyOperatingCost: number; fromStandard: string; toStandard: string; standardDuringWork: string; standardAfter: string
  downtimeWeeks: number; available: boolean; rejections: string[]; refusal: string | null; refusalText: string | null
}
type WireOfficePage = {
  facilityId: string; title: string; blueprintId: string | null; standard: string; highestOperationalStandard: string
  offline: boolean; offlineUntilWeek: number | null; capacity: number; baselineWeeklyOperatingCost: number
  conversions: WireConversionRow[]; planIds: string[]; actions: WireAction[]
}
type WirePlanRow = { planId: string; status: string; reason: string | null; workLabel: string; approvedMaximumDebit: number; next: { outcome: string; reason: string | null } | null }

function rawIndustry(session: BridgeSession, view: string, requestId: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return session.industry({
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'industryQuery', view,
    targetId: null, page: 0, pageSize: 50, lane: 'audienceAwareness', period: 'all',
    requestId, sessionId: session.sessionId, expectedStateRevision: session.stateRevision, ...extra,
  } as never) as unknown as Record<string, unknown>
}

/** One raw page of the `office` Industry response, schema-checked. Throws loudly
 * (not silently) if `office` is absent/null. */
function officeResponse(session: BridgeSession, facilityId: string, requestId: string, page = 0, pageSize = 50): { office: WireOfficePage; pageCount: number; snapshotVersion: number } {
  const response = rawIndustry(session, 'office', requestId, { targetId: facilityId, page, pageSize })
  if (!('office' in response) || response.office === null) throw new Error(`office view rejected for facility "${facilityId}" (request ${requestId}): ${JSON.stringify(response).slice(0, 500)}`)
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, response)).toEqual(response)
  return response as unknown as { office: WireOfficePage; pageCount: number; snapshotVersion: number }
}
/** Every office-page action, merged across pages (mirrors tests/bridge-p13b-s3-plans
 * .test.ts's/tests/bridge-p13b-s2-labs.test.ts's `labPage` pagination-merge idiom;
 * at most 4 rows ever exist here, so this is always one page in practice — the
 * merge is defensive, not load-bearing). */
function officePage(session: BridgeSession, facilityId: string, requestId: string): WireOfficePage {
  const first = officeResponse(session, facilityId, `${requestId}-p0`, 0)
  const actions = new Map(first.office.actions.map(a => [a.id, a]))
  for (let page = 1; page < first.pageCount; page++) {
    for (const a of officeResponse(session, facilityId, `${requestId}-p${String(page)}`, page).office.actions) actions.set(a.id, a)
  }
  return { ...first.office, actions: [...actions.values()] }
}

/** One raw page of the `plans` Industry response, schema-checked (reduced to the
 * fields this file asserts). */
function plansResponse(session: BridgeSession, requestId: string, page = 0, pageSize = 50): { rows: WirePlanRow[]; actions: WireAction[]; pageCount: number } {
  const response = rawIndustry(session, 'plans', requestId, { page, pageSize })
  if (!('plans' in response) || response.plans === null) throw new Error(`plans view absent (request ${requestId}): ${JSON.stringify(response).slice(0, 500)}`)
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, response)).toEqual(response)
  const plans = response.plans as { rows: WirePlanRow[]; actions: WireAction[] }
  return { rows: plans.rows, actions: plans.actions, pageCount: (response as { pageCount: number }).pageCount }
}
function plansPage(session: BridgeSession, requestId: string): { rows: WirePlanRow[]; actions: WireAction[] } {
  const first = plansResponse(session, `${requestId}-p0`, 0)
  const rows = new Map(first.rows.map(r => [r.planId, r]))
  const actions = new Map(first.actions.map(a => [a.id, a]))
  for (let page = 1; page < first.pageCount; page++) {
    const next = plansResponse(session, `${requestId}-p${String(page)}`, page)
    for (const r of next.rows) rows.set(r.planId, r)
    for (const a of next.actions) actions.set(a.id, a)
  }
  return { rows: [...rows.values()], actions: [...actions.values()] }
}

/** Dispatches exactly one row id out of an already-fetched actions list through a
 * real submitIntent command. Throws loudly if the row is absent or refused. */
function dispatchRow(session: BridgeSession, actions: readonly WireAction[], rowId: string): void {
  const row = required(actions.find(a => a.id === rowId), `Row "${rowId}" is absent from ${JSON.stringify(actions.map(a => a.id))}.`)
  if (!row.enabled || !row.intent) throw new Error(`Row "${rowId}" is not enabled/available: ${row.disabledReason ?? 'no reason given'}`)
  const response = session.command({
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'submitIntent',
    commandId: `dispatch-${String(commandCounter++)}`, sessionId: session.sessionId,
    expectedStateRevision: session.stateRevision, payload: { intentId: row.intent.intentId },
  })
  if (!response.accepted) throw new Error(`Row "${rowId}" was refused: ${JSON.stringify(response)}`)
}

/** The player studio's own history activities (view: 'history') — same helper as
 * tests/bridge-p13b-s3-plans.test.ts. */
function ownHistoryActivities(session: BridgeSession, requestId: string): { headline: string; detail: string; week: number }[] {
  const own = required(session.gameState.hollywood?.playerStudioId, 'no player studio on this state')
  const response = rawIndustry(session, 'history', requestId, { targetId: own })
  if (!('activities' in response)) throw new Error(`history view rejected: ${JSON.stringify(response)}`)
  return response.activities as { headline: string; detail: string; week: number }[]
}

/** buildingId for the research-laboratory placement (case 1's "office is null on
 * a different view" probe), following tests/bridge-p13b-s3-plans.test.ts's/
 * tests/bridge-p13b-s2-labs.test.ts's identical convention exactly. */
function laboratoryBuildingId(state: GameState): string {
  const laboratoryFacilityId = required(state.operations.facilities.find(f => f.capability === 'laboratory'), 'no laboratory facility on this state').id
  const lab = required(state.placement.facilities.find(p =>
    p.blueprintId === 'research-laboratory' && p.installation === undefined && p.facilityId === laboratoryFacilityId), 'no installed Research Laboratory placement')
  return `placed-${String(lab.id)}`
}

// ---------------------------------------------------------------------------

describe('P13B-S4-T3 office bridge page: projection bump', () => {
  it('bumps PROJECTION_VERSION to the S4-T3 wire contract (36)', () => {
    expect(PROJECTION_VERSION).toBe(40)
  })
})

describe('case 1: the founding office at week 12 — full quote parity on the wire; office null off the laboratory view', () => {
  it('standard I, highest I, offline false, capacity 2, baselineWeeklyOperatingCost 0 (endowed); both conversion rows match the authoritative quote', () => {
    const state = p13aLaboratorySlice() // week 12, one operational Lab, endowed founding Development & Casting office
    const facilityId = officeFacilityIdOf(state)
    const session = new BridgeSession(state, 'p13b-s4-office-1-fresh')

    const response = officeResponse(session, facilityId, nextRequestId('fresh'))
    expect(response.snapshotVersion).toBe(40)
    const office = response.office
    expect(office.facilityId).toBe(facilityId)
    expect(office.standard).toBe('I')
    expect(office.highestOperationalStandard).toBe('I')
    expect(office.offline).toBe(false)
    expect(office.offlineUntilWeek).toBeNull()
    expect(office.capacity).toBe(2)
    expect(office.baselineWeeklyOperatingCost).toBe(0) // the endowed founding office pays no weekly opex

    const ii = required(office.conversions.find(c => c.blueprintId === 'office-conversion-ii'), 'ii conversion row absent')
    expect(ii).toMatchObject({
      cost: TUNING.OFFICE_CONVERSION_II_CAPEX, buildWeeks: TUNING.OFFICE_CONVERSION_II_BUILD_WEEKS,
      weeklyOperatingCost: TUNING.OFFICE_CONVERSION_II_WEEKLY_OPERATING_COST,
      fromStandard: 'I', toStandard: 'II', standardDuringWork: 'I', standardAfter: 'II',
      downtimeWeeks: TUNING.OFFICE_CONVERSION_II_BUILD_WEEKS, available: true, refusal: null,
    })
    const iii = required(office.conversions.find(c => c.blueprintId === 'office-conversion-iii'), 'iii conversion row absent')
    expect(iii).toMatchObject({
      cost: TUNING.OFFICE_CONVERSION_III_FROM_I_CAPEX, buildWeeks: TUNING.OFFICE_CONVERSION_III_FROM_I_BUILD_WEEKS,
      weeklyOperatingCost: TUNING.OFFICE_CONVERSION_III_WEEKLY_OPERATING_COST,
      fromStandard: 'I', toStandard: 'III', standardDuringWork: 'I', standardAfter: 'III',
      downtimeWeeks: TUNING.OFFICE_CONVERSION_III_FROM_I_BUILD_WEEKS, available: true, refusal: null,
    })

    const laboratory = rawIndustry(session, 'laboratory', nextRequestId('fresh-lab'), { targetId: laboratoryBuildingId(state) })
    expect(laboratory.office).toBeNull()
  })

  it('intent kind: both immediate rows publish installationAction; both plan companions publish physicalPlanAction (adjudicated finding C, 2026-09-17)', () => {
    const state = p13aLaboratorySlice()
    const facilityId = officeFacilityIdOf(state)
    const session = new BridgeSession(state, 'p13b-s4-office-1-kinds')
    const office = officePage(session, facilityId, nextRequestId('kinds'))

    const convertII = required(office.actions.find(a => a.id === `office-convert-${facilityId}-ii`), 'ii immediate row absent')
    const convertIII = required(office.actions.find(a => a.id === `office-convert-${facilityId}-iii`), 'iii immediate row absent')
    expect(convertII.intent?.kind).toBe('installationAction')
    expect(convertIII.intent?.kind).toBe('installationAction')

    const queueII = required(office.actions.find(a => a.id === `plan-queue-office-convert-${facilityId}-ii`), 'ii plan companion absent')
    const queueIII = required(office.actions.find(a => a.id === `plan-queue-office-convert-${facilityId}-iii`), 'iii plan companion absent')
    expect(queueII.intent?.kind).toBe('physicalPlanAction')
    expect(queueIII.intent?.kind).toBe('physicalPlanAction')
  })
})

describe('case 2: immediate iii conversion — engagement, reopening, standardAlreadyMet and the exact capex ledger row', () => {
  it('commits, engages the body for 16 weeks, reopens at III, and writes one exact -$1,250,000 constructionCapex ledger row', () => {
    const base = p13aLaboratorySlice()
    const facilityId = officeFacilityIdOf(base)
    const session = new BridgeSession(base, 'p13b-s4-office-2-commit')
    const commitWeek = session.gameState.market.tick

    const before = officePage(session, facilityId, nextRequestId('before'))
    dispatchRow(session, before.actions, `office-convert-${facilityId}-iii`)

    const mid = officePage(session, facilityId, nextRequestId('mid'))
    expect(mid.offline).toBe(true)
    expect(mid.offlineUntilWeek).toBe(commitWeek + TUNING.OFFICE_CONVERSION_III_FROM_I_BUILD_WEEKS)
    expect(mid.capacity).toBe(0)
    expect(mid.standard).toBe('I')
    const midII = required(mid.conversions.find(c => c.blueprintId === 'office-conversion-ii'), 'ii row absent mid-construction')
    expect(midII.available).toBe(false)
    expect(midII.refusal).toBe('targetEngaged')
    expect(midII.rejections).toContain('targetEngaged')
    // ADJUDICATED finding A (coordinator, 2026-09-17 — see this file's header):
    // the row for the blueprint that is ITSELF running reports its own engine
    // precedence, `refusal: 'alreadyInstalled'` — `rejections[0]` — while its
    // `rejections` member still names `targetEngaged` too, so nothing is hidden.
    const midIII = required(mid.conversions.find(c => c.blueprintId === 'office-conversion-iii'), 'iii row absent mid-construction')
    expect(midIII.available).toBe(false)
    expect(midIII.refusal).toBe('alreadyInstalled')
    expect(midIII.rejections).toEqual(expect.arrayContaining(['alreadyInstalled', 'targetEngaged']))
    expect(mid.actions.find(a => a.id === `office-convert-${facilityId}-ii`)?.enabled).toBe(false)
    expect(mid.actions.find(a => a.id === `office-convert-${facilityId}-iii`)?.enabled).toBe(false)

    let ticked = session.gameState
    for (let i = 0; i < TUNING.OFFICE_CONVERSION_III_FROM_I_BUILD_WEEKS; i++) ticked = tick(ticked)
    const after = new BridgeSession(ticked, 'p13b-s4-office-2-after')
    const done = officePage(after, facilityId, nextRequestId('done'))
    expect(done.offline).toBe(false)
    expect(done.capacity).toBe(2)
    expect(done.standard).toBe('III')
    expect(done.highestOperationalStandard).toBe('III')
    expect(required(done.conversions.find(c => c.blueprintId === 'office-conversion-ii'), 'ii row absent after completion').refusal).toBe('standardAlreadyMet')
    // FINDING (D) — discovered while implementing the coordinator's finding-A
    // amendment, reported (not silently absorbed), and FIXED by sim-core the same
    // session (see this file's header): `refusalOf` (bridge/office.ts) now special-
    // cases a COMPLETED conversion's own row to yield to `standardAlreadyMet`,
    // while an UNDER-CONSTRUCTION one still reads `alreadyInstalled` first (finding
    // A, above). This assertion was never weakened across the whole episode —
    // it reads exactly as the original, unamended T3 contract always specified.
    expect(required(done.conversions.find(c => c.blueprintId === 'office-conversion-iii'), 'iii row absent after completion').refusal).toBe('standardAlreadyMet')
    expect(done.actions.every(a => a.enabled === false)).toBe(true) // no convert action enabled

    const capexRow = required(ticked.ledger.find(e => e.kind === 'constructionCapex' && e.amount === -TUNING.OFFICE_CONVERSION_III_FROM_I_CAPEX), 'constructionCapex row for the iii conversion absent')
    expect(capexRow).toMatchObject({ week: commitWeek, kind: 'constructionCapex', amount: -1_250_000, note: 'Development Office III conversion' })
  }, 30_000)
})

describe('case 3: placed office money on the wire', () => {
  it('$5,500 baseline continues through a real weekly charge; II->III quotes $850,000/8 weeks with standardDuringWork I', () => {
    const { state, officeFacilityId } = s4BareOfficeStudio('p13b-s4-office-3')
    let session = new BridgeSession(state, 'p13b-s4-office-3')
    const before = officePage(session, officeFacilityId, nextRequestId('before'))
    expect(before.baselineWeeklyOperatingCost).toBe(5_500)

    dispatchRow(session, before.actions, `office-convert-${officeFacilityId}-ii`)
    let ticked = session.gameState
    for (let i = 0; i < TUNING.OFFICE_CONVERSION_II_BUILD_WEEKS; i++) ticked = tick(ticked)
    session = new BridgeSession(ticked, 'p13b-s4-office-3-after')
    const after = officePage(session, officeFacilityId, nextRequestId('after'))
    expect(after.standard).toBe('II')
    expect(after.baselineWeeklyOperatingCost).toBe(5_500) // the body's own placement opex, unaffected by the conversion
    const ii = required(after.conversions.find(c => c.blueprintId === 'office-conversion-ii'), 'ii row absent')
    // Same finding (D) as case 2's "done" section (see its comment) — fixed.
    expect(ii.refusal).toBe('standardAlreadyMet')
    const iii = required(after.conversions.find(c => c.blueprintId === 'office-conversion-iii'), 'iii row absent')
    expect(iii).toMatchObject({
      cost: TUNING.OFFICE_CONVERSION_III_FROM_II_CAPEX, buildWeeks: TUNING.OFFICE_CONVERSION_III_FROM_II_BUILD_WEEKS,
      fromStandard: 'II', standardDuringWork: 'I', available: true,
    })
  }, 30_000)
})

describe('case 4: plan companions — queue, start, hiding and the immediate-row lockout', () => {
  it('plan-queue-office-convert-iii queues, starts, and offlines the body; the immediate rows lock out while it runs', () => {
    const base = p13aLaboratorySlice()
    const facilityId = officeFacilityIdOf(base)
    const session = new BridgeSession(base, 'p13b-s4-office-4-queue')

    const before = officePage(session, facilityId, nextRequestId('before'))
    dispatchRow(session, before.actions, `plan-queue-office-convert-${facilityId}-iii`)

    const queuedOffice = officePage(session, facilityId, nextRequestId('queued-office'))
    expect(queuedOffice.planIds).toHaveLength(1)
    const planId = queuedOffice.planIds[0]!

    const queuedPlans = plansPage(session, nextRequestId('queued-plans'))
    const queuedRow = required(queuedPlans.rows.find(r => r.planId === planId), 'queued plan row absent on the plans view')
    expect(queuedRow.status).toBe('queued')
    expect(queuedRow.approvedMaximumDebit).toBe(TUNING.OFFICE_CONVERSION_III_FROM_I_CAPEX)
    expect(queuedRow.workLabel).toContain('Development Office III Conversion')

    const ticked = tick(session.gameState)
    const nextSession = new BridgeSession(ticked, 'p13b-s4-office-4-started')
    const startedPlans = plansPage(nextSession, nextRequestId('started-plans'))
    expect(required(startedPlans.rows.find(r => r.planId === planId), 'plan row absent after starting').status).toBe('started')

    const startedOffice = officePage(nextSession, facilityId, nextRequestId('started-office'))
    expect(startedOffice.offline).toBe(true)
    expect(startedOffice.actions.some(a => a.id === `plan-queue-office-convert-${facilityId}-iii`)).toBe(false) // iii companion hidden: committed
    // ADJUDICATED finding B (coordinator, 2026-09-17 — see this file's header):
    // under the refined `reachableStandard` rule, the ii companion is ALSO hidden
    // here — the body's reachable standard is already III (the committed iii
    // conversion), and II <= III — so this stands as originally written.
    expect(startedOffice.actions.some(a => a.id === `plan-queue-office-convert-${facilityId}-ii`)).toBe(false)
    const iiImmediate = required(startedOffice.actions.find(a => a.id === `office-convert-${facilityId}-ii`), 'ii immediate row absent while the plan runs')
    expect(iiImmediate.enabled).toBe(false)
    const iiiImmediate = required(startedOffice.actions.find(a => a.id === `office-convert-${facilityId}-iii`), 'iii immediate row absent while the plan runs')
    expect(iiiImmediate.enabled).toBe(false)
    // The underlying refusal (adjudicated finding A applies again here, on the iii
    // row only — it is the one whose own blueprint is committed):
    const iiRow = required(startedOffice.conversions.find(c => c.blueprintId === 'office-conversion-ii'), 'ii conversion row absent')
    expect(iiRow.refusal).toBe('targetEngaged')
    expect(iiRow.rejections).toContain('targetEngaged')
    const iiiRow = required(startedOffice.conversions.find(c => c.blueprintId === 'office-conversion-iii'), 'iii conversion row absent')
    expect(iiiRow.refusal).toBe('alreadyInstalled')
    expect(iiiRow.rejections).toEqual(expect.arrayContaining(['alreadyInstalled', 'targetEngaged']))
  }, 30_000)
})

describe('case 4b: a LOWER conversion running immediately leaves a HIGHER companion offered (coordinator-named counter-scenario, 2026-09-17)', () => {
  it('while office-convert-ii runs, the iii plan companion is still offered and the ii companion is hidden; queueing iii holds on /targetEngaged/ during the ii work', () => {
    const base = p13aLaboratorySlice()
    const facilityId = officeFacilityIdOf(base)
    const session = new BridgeSession(base, 'p13b-s4-office-4b-lower-running')

    const before = officePage(session, facilityId, nextRequestId('before'))
    dispatchRow(session, before.actions, `office-convert-${facilityId}-ii`)

    const running = officePage(session, facilityId, nextRequestId('running'))
    expect(running.offline).toBe(true) // the ii conversion is under construction
    // ii's own blueprint is now committed on the body: its companion is hidden.
    expect(running.actions.some(a => a.id === `plan-queue-office-convert-${facilityId}-ii`)).toBe(false)
    // iii's target standard (III) is ABOVE the body's reachable standard (II, from
    // the running ii conversion) — chaining upward stays lawful, so iii's
    // companion is STILL offered.
    const queueIII = required(running.actions.find(a => a.id === `plan-queue-office-convert-${facilityId}-iii`), 'iii plan companion absent while a lower conversion runs')
    expect(queueIII.enabled).toBe(true)
    expect(queueIII.intent?.kind).toBe('physicalPlanAction')

    dispatchRow(session, running.actions, `plan-queue-office-convert-${facilityId}-iii`)
    const queuedPlans = plansPage(session, nextRequestId('queued'))
    const iiiPlan = required(queuedPlans.rows.find(r => r.workLabel.includes('Development Office III Conversion')), 'queued iii plan row absent')
    expect(iiiPlan.status).toBe('queued')

    const ticked = tick(session.gameState)
    const nextSession = new BridgeSession(ticked, 'p13b-s4-office-4b-held')
    const afterTick = plansPage(nextSession, nextRequestId('held'))
    const heldRow = required(afterTick.rows.find(r => r.planId === iiiPlan.planId), 'iii plan row absent after the tick')
    // The iii plan's own quote is live-refused (the body is engaged by the running
    // ii work): admission holds on the engine's own refusal name, never silently
    // starts and never (wrongly) treats a live refusal as a cash wait.
    expect(heldRow.status).toBe('held')
    expect(heldRow.reason).toMatch(/targetEngaged/)
  }, 30_000)
})

describe('case 5: insufficient funds', () => {
  it('both rows read insufficientFunds; plan companions still offered; a queued plan reads next.reason "insufficient cash"', () => {
    const base = p13aLaboratorySlice()
    const facilityId = officeFacilityIdOf(base)
    // spendDownTo runs on the state BEFORE the session is created from it (contract text).
    const poor = spendDownTo(base, 100_000) // below both the $500,000 and $1,250,000 ceilings
    const session = new BridgeSession(poor, 'p13b-s4-office-5-poor')

    const office = officePage(session, facilityId, nextRequestId('poor'))
    const ii = required(office.conversions.find(c => c.blueprintId === 'office-conversion-ii'), 'ii row absent')
    expect(ii.available).toBe(false)
    expect(ii.refusal).toBe('insufficientFunds')
    const iii = required(office.conversions.find(c => c.blueprintId === 'office-conversion-iii'), 'iii row absent')
    expect(iii.available).toBe(false)
    expect(iii.refusal).toBe('insufficientFunds')
    const iiImmediate = required(office.actions.find(a => a.id === `office-convert-${facilityId}-ii`), 'ii immediate row absent')
    expect(iiImmediate.enabled).toBe(false)
    expect(iiImmediate.disabledReason).toContain(money(TUNING.OFFICE_CONVERSION_II_CAPEX))
    const iiCompanion = required(office.actions.find(a => a.id === `plan-queue-office-convert-${facilityId}-ii`), 'ii plan companion absent — queueing must still be offered (nothing is reserved)')
    expect(iiCompanion.enabled).toBe(true)

    dispatchRow(session, office.actions, `plan-queue-office-convert-${facilityId}-ii`)
    const queued = plansPage(session, nextRequestId('poor-queued'))
    const planId = required(queued.rows[0], 'no queued plan row').planId

    const ticked = tick(session.gameState)
    const nextSession = new BridgeSession(ticked, 'p13b-s4-office-5-ticked')
    const after = plansPage(nextSession, nextRequestId('poor-after'))
    const row = required(after.rows.find(r => r.planId === planId), 'plan row absent after the tick')
    expect(row.status).toBe('queued') // cash is a WAIT, never persisted as held (engine law)
    expect(row.next?.reason).toMatch(/insufficient cash/i)
  }, 30_000)
})

describe('case 6: stale revision', () => {
  it('an office intent submitted with a stale expectedStateRevision is refused with STALE_REVISION, and that attempt changes nothing', () => {
    const base = p13aLaboratorySlice()
    const facilityId = officeFacilityIdOf(base)
    const session = new BridgeSession(base, 'p13b-s4-office-6-stale')

    const office = officePage(session, facilityId, nextRequestId('stale'))
    const staleRevision = session.stateRevision // captured BEFORE the legitimate dispatch below
    dispatchRow(session, office.actions, `office-convert-${facilityId}-ii`) // a legitimate dispatch; revision now advances past staleRevision
    const afterLegitimateCommit = JSON.stringify(session.gameState)

    // A still-enabled row after the ii commit: the iii PLAN companion (queueing
    // ignores `targetEngaged` — the S3 companion rule — so it survives the ii
    // commit's engagement of the shared body, unlike either immediate row).
    const afterOffice = officePage(session, facilityId, nextRequestId('stale-after'))
    const row = required(afterOffice.actions.find(a => a.id === `plan-queue-office-convert-${facilityId}-iii`), 'iii plan companion absent after the ii commit')
    const response = session.command({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'submitIntent',
      commandId: 'stale-office-convert', sessionId: session.sessionId,
      expectedStateRevision: staleRevision, // one revision behind current
      payload: { intentId: row.intent!.intentId },
    })
    expect(response).toMatchObject({ accepted: false, reasonCode: 'STALE_REVISION' })
    expect(JSON.stringify(session.gameState)).toBe(afterLegitimateCommit) // the stale attempt itself changed nothing
  })
})

describe('case 7: player-safe — no rival facility id ever appears', () => {
  it('a structurally injected rival facility id is refused as INVALID_CONTROL; no rival studio id leaks anywhere in the player\'s own office page', () => {
    // This engine's `state.operations`/`state.placement` roots are PLAYER-SCOPED
    // ONLY (verified by reading src/core/types.ts: `operations: StudioOperations`
    // is a single root, no per-studio index) — there is no genuine "rival
    // Development & Casting facility id" this engine can produce. The structural-
    // injection idiom below (a plausible rival id that resolves to nothing) is the
    // same one tests/bridge-p13b-s3-plans.test.ts's own case 8 and
    // tests/p13b-s3-admission.test.ts's rival-symmetry test use for the identical
    // reason.
    const base = p13aLaboratorySlice()
    const facilityId = officeFacilityIdOf(base)
    const own = required(base.hollywood?.playerStudioId, 'no player studio on this state')
    const rivalStudioId = required(base.hollywood?.identities.find(i => i.studioId !== own), 'no rival studio on this generated world').studioId
    const rivalFacilityId = `${rivalStudioId}:facility:development-casting`

    const session = new BridgeSession(base, 'p13b-s4-office-7-player-safe')
    const rejected = rawIndustry(session, 'office', nextRequestId('rival'), { targetId: rivalFacilityId })
    expect(rejected).toMatchObject({ accepted: false, reasonCode: 'INVALID_CONTROL' })

    const ownOffice = officeResponse(session, facilityId, nextRequestId('own'))
    const json = JSON.stringify(ownOffice)
    expect(json).not.toContain(rivalStudioId)
    expect(json).not.toContain(rivalFacilityId)
  })
})

describe('case 8: history — the existing P09 facility-completed row, no invented "office" kind', () => {
  it('the completed iii conversion writes one Opened: <name> row through the existing facilityCompleted mechanism, never a new kind', () => {
    const base = p13aLaboratorySlice()
    const facilityId = officeFacilityIdOf(base)
    const session = new BridgeSession(base, 'p13b-s4-office-8-history')
    const office = officePage(session, facilityId, nextRequestId('before'))
    dispatchRow(session, office.actions, `office-convert-${facilityId}-iii`)

    let ticked = session.gameState
    for (let i = 0; i < TUNING.OFFICE_CONVERSION_III_FROM_I_BUILD_WEEKS; i++) ticked = tick(ticked)
    const after = new BridgeSession(ticked, 'p13b-s4-office-8-after')

    // Wire level: the SAME view:'history' mechanism every other P09/P13B facility
    // completion already uses. The blueprint's own authored name — read from the
    // catalogue, never hardcoded — is what the headline names.
    const expectedName = required(blueprintById('office-conversion-iii'), 'office-conversion-iii is not a registered blueprint').name
    const history = ownHistoryActivities(after, nextRequestId('history'))
    const opened = required(history.find(a => a.headline === `Opened: ${expectedName}`), `no "Opened: ${expectedName}" history row`)
    expect(opened.headline).toBe('Opened: Development Office III Conversion')

    // Engine level: the row is the EXISTING facilityCompleted kind, never an
    // invented "office"/"officeConversion" kind.
    const rows = ticked.studioHistory.rows.filter(r => r.kind === 'facilityCompleted' && 'blueprintId' in r && r.blueprintId === 'office-conversion-iii')
    expect(rows).toHaveLength(1)
    expect(ticked.studioHistory.rows.some(r => r.kind.toLowerCase().includes('office'))).toBe(false)
  }, 30_000)
})
