import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { FINANCE_CATEGORIES } from '../src/core/financeReport.js'
import { adoptionQuote } from '../src/core/technologyAdoption.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aLaboratorySlice } from '../src/harness/p13a/fixtures.js'
import { s4BareOfficeStudio } from '../src/harness/p13b/s4-fixtures.js'
import { s6LightingReady, s6SoundReady } from '../src/harness/p13b/s6-fixtures.js'
// RED-by-design (see header): src/core/installationCancellation.ts IS landed
// (S6-T1/T2). This file's RED source is entirely the BRIDGE at projection 38,
// which does not yet publish any of the projection-39 facts pinned below —
// proven at each assertion, never by a missing-module import (the pattern
// tests/bridge-p13b-s5-adoption.test.ts's own header states).
import { cancellationQuote, RESTORATION_BLUEPRINTS, restorationBlueprintIdFor } from '../src/core/installationCancellation.js'
import { BridgeSession } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { AVAILABLE_INTENT_KINDS, BRIDGE_SCHEMA, PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'

// P13B-S6-T3 independent-test-engineer task (2026-09-17). Authority: the S6 task
// expansion "Bridge (projection next, text only)" bullet and test 8 in
// docs/engineering/playability-launch-review/plans/P13B-HEADLESS-PLAN.md, plus
// the parent's dispatch message naming the exact wire pins (row ids, intent
// kind, StudioCancellationQuote fields, adoptions[].cancelledWeek, the finance
// category line, the three enumeration(['underConstruction','operational'])
// sites and PlacedFacilityView's own two-value exemption). Engine landed at
// 055a907 (S6-T1/T2): src/core/installationCancellation.ts (cancellationQuote,
// componentProgress, RESTORATION_BLUEPRINTS), actions cancelInstallation/
// cancelAdoption, PlacementStatus 'cancelled' + cancellation receipt,
// adoption.cancelledWeek, constructionRefund ledger kind, Save V26. Bridge is
// still projection 38: no cancel-* row, no cancellationAction intent kind, no
// adoptions[].cancelledWeek, no equipment reuse disclosure, no
// constructionRefund finance category surfacing, no three-value status on
// StudioFinanceFacility. Harness idioms copied from
// tests/bridge-p13b-s5-adoption.test.ts (labResponse/labPage/dispatchRow/
// stale-revision pattern) and tests/bridge-p13b-s4-office.test.ts
// (officeResponse/officePage/stale-revision/player-safe case 7 idiom) and
// tests/p13b-s3-admission.test.ts (the proven p13aLaboratorySlice() ->
// queue acoustic-instruments -> tick() -> 'started' recipe, reused verbatim
// for the Plans-page case since a Lab MODULE installation is the simplest
// reachable "started plan's placement" this repo already proves reaches
// 'started' in one tick). Every case dispatches or reads through a real
// BridgeSession, never a mock.
//
// INTERPRETATIONS NAMED (this file's own derivation; not full signatures from
// any authoritative source, flagged exactly as tests/bridge-p13b-s5-adoption
// .test.ts's own "FIELD-NAME PREMISES" section does):
//   1. `StudioCancellationQuote` is pinned as EXACTLY the field list the
//      dispatch message states: `{components: {label,cost,weeks,status,paid,
//      refunded,kind}[], refund, restoration: {blueprintId,cost,weeks}|null,
//      rejections, refusal}` (no `ok`, no `projectIds` — mirrors how
//      `WireAdoptionQuote` already drops the engine's own `ok` flag). It is
//      pinned as a new nullable `quote` member on the existing action row,
//      the SAME container `WireAdoptionQuote` already uses on `adopt-*` rows
//      (no second container exists anywhere on these three pages).
//   2. Per-component `kind` (`'access'|'equipment'|'site'|'installation'|
//      'capture'|'post'`, the SAME six-value taxonomy `WireAdoptionComponent`
//      already uses) is NOT a field the engine's own `CancellationComponent`
//      carries (`src/core/types.ts`'s `CancellationReceipt.components` is
//      `{label,cost,weeks,status,paid,refunded}` only, confirmed by reading
//      the type). This file derives the expected `kind` from the blueprint's
//      OWN authored label text via the same substring technique
//      tests/p13b-s6-receipts.test.ts's own assertions already use
//      (`label.toLowerCase().includes('site'|'installation'|'capture')`),
//      extended with `'post'` for the Sound Post fit-out's own label
//      ("Sound-capable Post fit-out"). GAP NAMED: neither
//      `office-conversion-ii`'s nor `office-conversion-iii`'s single
//      authored component label ("Office conversion to Development Office
//      II/III") matches any of the six values — no authoritative source
//      names one — so the Office case below asserts label/cost/weeks/status/
//      paid/refunded ONLY and does not assert `kind` for that one line.
//   3. `equipment[]` — a NEW top-level member on `StudioLaboratoryPage`,
//      beside the existing `adoptions[]`, publishing this studio's own
//      `TechnologyEquipmentAsset` rows as `{id,technologyId,acquiredWeek,
//      source,cost,holderAdoptionId}` (drops `studioId`, the SAME
//      convention `adoptionRow` already applies). NO existing wire member
//      publishes `state.technology.equipment` today (confirmed: `grep
//      holderAdoptionId bridge/*.ts` finds no producer) — the "asset
//      published unheld" requirement in the dispatch message has no home on
//      the wire yet at all. This file pins its own placement as the most
//      natural one, names it explicitly, and treats this as a genuine new
//      wire member the implementer may reasonably place elsewhere.
//   4. `cancel-<projectId>` rows: Laboratory publishes ONE row per
//      CANCELLABLE ADOPTION (`cancel-adoption-<adoptionId>`, using
//      `cancelAdoption` — the dispatch message's own example), never a
//      per-project row on that page; Office and Plans each publish
//      `cancel-<projectId>` (using `cancelInstallation`) for the ONE running
//      installation each page itself owns (an Office conversion; a started
//      plan's own placement). This mirrors the dispatch message's own
//      per-surface breakdown verbatim.
//
// GAP NAMED (not invented around, per the same convention
// tests/p13b-s6-receipts.test.ts's header already uses for the Office
// restoration dollar figure): `src/core/installationCancellation.ts`'s
// `applyCancellation` never calls `events.append(...)` — confirmed by reading
// the whole function — so `state.studioEvents` (the R3-N7 `operationsEvents`
// source) carries NO row for the cancellation act itself, on ANY save
// version, regardless of bridge/projection work. Satisfying "history rows for
// cancellation... on operationsEvents" for the CANCEL ACT needs an
// ENGINE-level `StudioEventDraft` emission this landed increment does not
// add — outside a bridge-only T3's authority to add. The restoration JOB's
// own COMPLETION, by contrast, already runs through the existing generic
// `completeDuePlacements`/`constructionCompleted` mechanism
// (`src/core/tick.ts` ~465-470, blueprint-agnostic), so THAT half of item 6
// is tested as a "no invented kind" regression guard (S4's own case-8
// precedent) rather than as a fresh RED. Both facts are asserted below,
// separately, and named again at the point of assertion.

let requestCounter = 0
let commandCounter = 0
function nextRequestId(prefix: string): string { return `${prefix}-req-${String(requestCounter++)}` }

function required<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) throw new Error(message)
  return value
}

// ── Wire shapes (the S6-T3 pin; NONE of this exists at projection 38) ───────

type WireCancellationComponent = {
  kind?: string | null; label: string; cost: number; weeks: number
  status: 'completed' | 'inProgress' | 'unstarted'; paid: number; refunded: number
}
type WireCancellationQuote = {
  components: WireCancellationComponent[]; refund: number
  restoration: { blueprintId: string; cost: number; weeks: number } | null
  rejections: string[]; refusal: string | null
}
type WireAction = {
  id: string; label: string; detail: string; enabled: boolean; disabledReason: string | null
  intent: { intentId: string; kind: string } | null
  quote?: (Record<string, unknown> & { restoration?: unknown }) | null
}
type WireAdoptionRow = {
  technologyId: string; route: string; committedWeek: number; operationalWeek: number | null
  components: unknown[]; equipmentAssetId: string | null; postFacilityId: string | null
  cancelledWeek?: number | null
}
type WireEquipmentRow = { id: string; technologyId: string; acquiredWeek: number; source: string; cost: number; holderAdoptionId: string | null }
type WireLaboratoryPage = {
  buildingId: string; actions: WireAction[]; adoptions?: WireAdoptionRow[]; equipment?: WireEquipmentRow[]
}
type WireOfficePage = {
  facilityId: string; offline: boolean; offlineUntilWeek: number | null; actions: WireAction[]
}
type WirePlanRow = { planId: string; status: string; startedPlacementId: number | null }
type WirePlansPage = { rows: WirePlanRow[]; actions: WireAction[] }

// ── Harness helpers (mirrors tests/bridge-p13b-s5-adoption.test.ts /
// tests/bridge-p13b-s4-office.test.ts) ───────────────────────────────────────

function buildingIdOf(state: GameState, laboratoryFacilityId: string): string {
  const lab = required(state.placement.facilities.find(p =>
    p.blueprintId === 'research-laboratory' && p.installation === undefined && p.facilityId === laboratoryFacilityId),
  `No installed Research Laboratory placement carries facility "${laboratoryFacilityId}".`)
  return `placed-${String(lab.id)}`
}
function anyLabBuildingId(state: GameState): string {
  const laboratoryFacilityId = required(state.operations.facilities.find(f => f.capability === 'laboratory'), 'no laboratory facility on this state').id
  return buildingIdOf(state, laboratoryFacilityId)
}
function officeFacilityIdOf(state: GameState): string {
  return required(state.operations.facilities.find(f => f.capability === 'development-casting'), 'no development-casting facility on this state').id
}

function labResponse(session: BridgeSession, buildingId: string, requestId: string, page = 0, pageSize = 50): { laboratory: WireLaboratoryPage; pageCount: number } {
  const response = session.industry({
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'industryQuery', view: 'laboratory',
    targetId: buildingId, page, pageSize, lane: 'audienceAwareness', period: 'all',
    requestId, sessionId: session.sessionId, expectedStateRevision: session.stateRevision,
  } as never) as unknown as Record<string, unknown>
  if (!('laboratory' in response) || response.laboratory === null) throw new Error(`laboratory view rejected for building "${buildingId}" (request ${requestId}): ${JSON.stringify(response).slice(0, 500)}`)
  return response as unknown as { laboratory: WireLaboratoryPage; pageCount: number }
}
function labPage(session: BridgeSession, buildingId: string, requestId: string): WireLaboratoryPage {
  const first = labResponse(session, buildingId, `${requestId}-p0`, 0)
  const actions = new Map(first.laboratory.actions.map(a => [a.id, a]))
  for (let page = 1; page < first.pageCount; page++) {
    for (const a of labResponse(session, buildingId, `${requestId}-p${String(page)}`, page).laboratory.actions) actions.set(a.id, a)
  }
  return { ...first.laboratory, actions: [...actions.values()] }
}
function officeResponse(session: BridgeSession, facilityId: string, requestId: string, page = 0, pageSize = 50): { office: WireOfficePage; pageCount: number } {
  const response = session.industry({
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'industryQuery', view: 'office',
    targetId: facilityId, page, pageSize, lane: 'audienceAwareness', period: 'all',
    requestId, sessionId: session.sessionId, expectedStateRevision: session.stateRevision,
  } as never) as unknown as Record<string, unknown>
  if (!('office' in response) || response.office === null) throw new Error(`office view rejected for facility "${facilityId}" (request ${requestId}): ${JSON.stringify(response).slice(0, 500)}`)
  return response as unknown as { office: WireOfficePage; pageCount: number }
}
function officePage(session: BridgeSession, facilityId: string, requestId: string): WireOfficePage {
  const first = officeResponse(session, facilityId, `${requestId}-p0`, 0)
  const actions = new Map(first.office.actions.map(a => [a.id, a]))
  for (let page = 1; page < first.pageCount; page++) {
    for (const a of officeResponse(session, facilityId, `${requestId}-p${String(page)}`, page).office.actions) actions.set(a.id, a)
  }
  return { ...first.office, actions: [...actions.values()] }
}
function plansResponse(session: BridgeSession, requestId: string, page = 0, pageSize = 50): { plans: WirePlansPage; pageCount: number } {
  const response = session.industry({
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'industryQuery', view: 'plans',
    targetId: null, page, pageSize, lane: 'audienceAwareness', period: 'all',
    requestId, sessionId: session.sessionId, expectedStateRevision: session.stateRevision,
  } as never) as unknown as Record<string, unknown>
  if (!('plans' in response) || response.plans === null) throw new Error(`plans view absent (request ${requestId}): ${JSON.stringify(response).slice(0, 500)}`)
  return response as unknown as { plans: WirePlansPage; pageCount: number }
}
function plansPage(session: BridgeSession, requestId: string): WirePlansPage {
  const first = plansResponse(session, `${requestId}-p0`, 0)
  const rows = new Map(first.plans.rows.map(r => [r.planId, r]))
  const actions = new Map(first.plans.actions.map(a => [a.id, a]))
  for (let page = 1; page < first.pageCount; page++) {
    const next = plansResponse(session, `${requestId}-p${String(page)}`, page)
    for (const r of next.plans.rows) rows.set(r.planId, r)
    for (const a of next.plans.actions) actions.set(a.id, a)
  }
  return { rows: [...rows.values()], actions: [...actions.values()] }
}
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

/** INTERPRETATION 2 (see header): derives the expected wire `kind` from the
 * blueprint's own authored label text. Throws (never guesses) for a label this
 * file has no authoritative mapping for — the Office case below never calls it. */
function expectedComponentKind(label: string): string {
  const l = label.toLowerCase()
  if (l.includes('site')) return 'site'
  if (l.includes('capture')) return 'capture'
  if (l.includes('post')) return 'post'
  if (l.includes('installation')) return 'installation'
  throw new Error(`expectedComponentKind: no interpretation named for label "${label}" (see header GAP)`)
}

/** The `{blueprintId,cost,weeks}|null` a `StudioCancellationQuote` should carry for
 * ONE placement, derived the SAME way the engine's own `restorationOwed` does
 * (component[0]'s status !== 'unstarted' => the blueprint's own restoration
 * mapping), read from `RESTORATION_BLUEPRINTS` — never invented figures. */
function expectedRestorationFor(placedBlueprintId: string, components: readonly { status: string }[]): { blueprintId: string; cost: number; weeks: number } | null {
  if (components[0] === undefined || components[0].status === 'unstarted') return null
  const restorationId = restorationBlueprintIdFor(placedBlueprintId)
  if (restorationId === null) return null
  const blueprint = required(RESTORATION_BLUEPRINTS.find(b => b.id === restorationId), `no RESTORATION_BLUEPRINTS entry "${restorationId}"`)
  const weeks = (blueprint.installationComponents ?? []).reduce((sum, c) => sum + c.weeks, 0)
  return { blueprintId: blueprint.id, cost: blueprint.capex, weeks }
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

describe('P13B-S6-T3 item 1: projection version bump (38 -> 39; 46 after the P14B.2 bump) and the cancellationAction intent kind', () => {
  it('bumps PROJECTION_VERSION to 41 and its schema $id / x-project-studio.projectionVersion move with it', () => {
    expect(PROJECTION_VERSION).toBe(47)
    expect(BRIDGE_SCHEMA.$id).toContain('projection-47')
    expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(47)
  })
  it('AVAILABLE_INTENT_KINDS gains cancellationAction, distinct from researchAction/installationAction/physicalPlanAction/adoptTechnology', () => {
    const kinds = AVAILABLE_INTENT_KINDS as readonly string[]
    expect(kinds).toContain('cancellationAction')
    expect(kinds.filter(k => k === 'cancellationAction')).toHaveLength(1)
  })
})

describe('P13B-S6-T3 item 2/3/4: Laboratory cancel-adoption row (lighting) — quote verbatim, commit through the bridge, stale refusal, adoption/equipment wire facts', () => {
  it('the full lighting journey: row present with the engine quote, commit through the bridge, exact money trace, stale refusal, row disappears, adoption+equipment facts, reused-at-$0 on a second stage', () => {
    const { state: committed, adoptionId, stageProjectId, stageFacilityId } = s6LightingReady()
    const state = advanceTo(committed, committed.market.tick + 2) // site just complete (matches the engine's own exact-trace case)
    const labBuildingId = anyLabBuildingId(state)

    const engineQuote = cancellationQuote(state, { adoptionId })
    expect(engineQuote.ok).toBe(true)

    const session = new BridgeSession(state, 'p13b-s6-lighting-1')
    const before = labPage(session, labBuildingId, nextRequestId('before'))
    const rowId = `cancel-adoption-${adoptionId}`
    const row = required(before.actions.find(a => a.id === rowId), `row "${rowId}" absent from ${JSON.stringify(before.actions.map(a => a.id))}`)
    expect(row.intent?.kind).toBe('cancellationAction')
    expect(row.enabled).toBe(engineQuote.ok)

    // The quote read verbatim (INTERPRETATION 1/2/4 — see header).
    const quote = row.quote as unknown as WireCancellationQuote
    expect(quote.components).toHaveLength(engineQuote.components.length)
    for (let i = 0; i < engineQuote.components.length; i++) {
      const engineComponent = engineQuote.components[i]!
      const wireComponent = quote.components[i]!
      expect(wireComponent.label).toBe(engineComponent.label)
      expect(wireComponent.cost).toBe(engineComponent.cost)
      expect(wireComponent.weeks).toBe(engineComponent.weeks)
      expect(wireComponent.status).toBe(engineComponent.status)
      expect(wireComponent.paid).toBe(engineComponent.paid)
      expect(wireComponent.refunded).toBe(engineComponent.refunded)
      expect(wireComponent.kind).toBe(expectedComponentKind(engineComponent.label))
    }
    expect(quote.refund).toBe(engineQuote.refund)
    expect(quote.refund).toBe(50_000) // the engine's own exact-trace figure (tests/p13b-s6-receipts.test.ts)
    expect(quote.rejections).toEqual(engineQuote.rejections)
    expect(quote.refusal).toBe(engineQuote.refusal)
    const stagePlaced = required(state.placement.facilities.find(f => f.projectId === stageProjectId), 'stage placement absent')
    expect(quote.restoration).toEqual(expectedRestorationFor(stagePlaced.blueprintId, engineQuote.components))
    expect(quote.restoration).toEqual({ blueprintId: 'restoration-lighting-stage', cost: 10_000, weeks: 1 })

    // Commit through the bridge (item 3): exactly one receipt + one constructionRefund
    // row, stateRevision advances, refused at the OLD revision (STALE_REVISION).
    const staleRevision = session.stateRevision
    const staleIntentId = row.intent!.intentId
    dispatchRow(session, before.actions, rowId)
    expect(session.stateRevision).not.toBe(staleRevision)
    const afterCommit = JSON.stringify(session.gameState)
    const refundRows = session.gameState.ledger.filter(e => e.kind === 'constructionRefund' && (e as unknown as { constructionProjectId: string }).constructionProjectId === stageProjectId)
    expect(refundRows).toHaveLength(1)
    expect(refundRows[0]!.amount).toBe(50_000)
    const placedAfter = required(session.gameState.placement.facilities.find(f => f.projectId === stageProjectId), 'stage placement absent after cancel')
    expect(placedAfter.status).toBe('cancelled')

    const staleResponse = session.command({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'submitIntent',
      commandId: 'stale-cancel-adoption', sessionId: session.sessionId,
      expectedStateRevision: staleRevision, payload: { intentId: staleIntentId },
    })
    expect(staleResponse).toMatchObject({ accepted: false, reasonCode: 'STALE_REVISION' })
    expect(JSON.stringify(session.gameState)).toBe(afterCommit) // the stale attempt changed nothing

    // A second cancel row is absent (item 2/3): the adoption is already cancelled.
    const after = labPage(session, labBuildingId, nextRequestId('after'))
    expect(after.actions.some(a => a.id === rowId)).toBe(false)

    // Adoption row after cancellation (item 4): cancelledWeek, equipmentAssetId
    // retained, restated on the wire.
    const adoptionRow = required(after.adoptions?.find(a => a.technologyId === 'lighting-control-01'), `no adoptions[] row for lighting-control-01 (adoptions=${JSON.stringify(after.adoptions)})`)
    expect(adoptionRow.cancelledWeek).toBe(state.market.tick)
    const engineAdoption = required(session.gameState.technology.adoptions.find(a => a.id === adoptionId), 'engine adoption row absent')
    expect(adoptionRow.equipmentAssetId).toBe(engineAdoption.equipmentAssetId)
    const assetId = required(engineAdoption.equipmentAssetId, 'no equipment asset id on this adoption')

    // Equipment asset published unheld (INTERPRETATION 3 — a NEW wire member; see header).
    const equipmentRow = required(after.equipment?.find(e => e.id === assetId), `no equipment[] row for asset "${assetId}" (equipment=${JSON.stringify(after.equipment)})`)
    expect(equipmentRow.holderAdoptionId).toBeNull()
    expect(equipmentRow.technologyId).toBe('lighting-control-01')

    // Reused at $0 on the next adopt row for the SAME technology on ANOTHER stage.
    const secondStage = required(session.gameState.operations.facilities.find(f => f.capability === 'soundstage' && f.id !== stageFacilityId), 'no second founding soundstage on this generated lot')
    const secondRowId = `adopt-lighting-control-01-${secondStage.id}`
    const secondRow = required(after.actions.find(a => a.id === secondRowId), `row "${secondRowId}" absent from ${JSON.stringify(after.actions.map(a => a.id))}`)
    const secondQuote = secondRow.quote as { reusedEquipmentAssetId?: string | null; total?: number } | null | undefined
    const engineSecondQuote = adoptionQuote(session.gameState, { technologyId: 'lighting-control-01', stageFacilityId: secondStage.id })
    expect(secondQuote?.reusedEquipmentAssetId).toBe(assetId)
    expect(engineSecondQuote.reusedEquipmentAssetId).toBe(assetId) // engine-side cross-check (already landed, S6-T1/T2)
    expect(secondQuote?.total).toBe(engineSecondQuote.total)

    // Rows are absent for a cancelled placement/adoption directly (item 2 tail).
    expect(cancellationQuote(session.gameState, { projectId: stageProjectId }).ok).toBe(false)
  })

  it('no cancel-adoption row exists for an OPERATIONAL adoption (item 2: "rows absent for operational... placements")', () => {
    const { state: committed, stageProjectId, adoptionId } = s6LightingReady()
    const operational = advanceTo(committed, committed.market.tick + 4) // site 2w + installation 2w
    expect(operational.placement.facilities.find(f => f.projectId === stageProjectId)!.status).toBe('operational')
    const session = new BridgeSession(operational, 'p13b-s6-lighting-operational')
    const page = labPage(session, anyLabBuildingId(operational), nextRequestId('operational'))
    expect(page.actions.some(a => a.id === `cancel-adoption-${adoptionId}`)).toBe(false)
  })
})

describe('P13B-S6-T3 item 2/3: Office cancel-<projectId> row — quote verbatim, commit through the bridge, offline/offlineUntilWeek, restoration never cancellable', () => {
  it('the full Office II journey: row present with the engine quote, commit through the bridge, offline until the restoration completes, restoration itself never gets a cancel row', () => {
    const base0 = s4BareOfficeStudio('p13b-s6-office-1').state
    const facilityId = officeFacilityIdOf(base0)
    const session0 = new BridgeSession(base0, 'p13b-s6-office-1')
    const before0 = officePage(session0, facilityId, nextRequestId('commit'))
    dispatchRow(session0, before0.actions, `office-convert-${facilityId}-ii`)
    const officeProjectId = required(session0.gameState.placement.facilities.find(f => f.blueprintId === 'office-conversion-ii'), 'no office-conversion-ii placement after commit').projectId

    let ticked = session0.gameState
    for (let i = 0; i < 2; i++) ticked = tick(ticked) // week 2 of 4 — mid-way, matches the engine's own exact-trace case
    expect(ticked.placement.facilities.find(f => f.projectId === officeProjectId)!.status).toBe('underConstruction')

    const engineQuote = cancellationQuote(ticked, { projectId: officeProjectId })
    expect(engineQuote.ok).toBe(true)
    expect(engineQuote.refund).toBe(250_000) // the engine's own exact-trace figure

    const session = new BridgeSession(ticked, 'p13b-s6-office-1-cancel')
    const office = officePage(session, facilityId, nextRequestId('cancel-row'))
    const rowId = `cancel-${officeProjectId}`
    const row = required(office.actions.find(a => a.id === rowId), `row "${rowId}" absent from ${JSON.stringify(office.actions.map(a => a.id))}`)
    expect(row.intent?.kind).toBe('cancellationAction')
    const quote = row.quote as unknown as WireCancellationQuote
    expect(quote.components).toHaveLength(1)
    expect(quote.components[0]!.status).toBe('inProgress')
    expect(quote.components[0]!.paid).toBe(250_000)
    expect(quote.components[0]!.refunded).toBe(250_000)
    // GAP NAMED (INTERPRETATION 2 in the header): office-conversion-ii's single
    // authored label matches none of the six `kind` values; `kind` is not
    // asserted for this line.
    expect(quote.refund).toBe(250_000)
    expect(quote.restoration).toEqual({ blueprintId: 'restoration-office', cost: RESTORATION_BLUEPRINTS.find(b => b.id === 'restoration-office')!.capex,
      weeks: RESTORATION_BLUEPRINTS.find(b => b.id === 'restoration-office')!.installationComponents!.reduce((sum, c) => sum + c.weeks, 0) })

    const staleRevision = session.stateRevision
    const staleIntentId = row.intent!.intentId
    dispatchRow(session, office.actions, rowId)
    expect(session.stateRevision).not.toBe(staleRevision)
    const refundRows = session.gameState.ledger.filter(e => e.kind === 'constructionRefund' && (e as unknown as { constructionProjectId: string }).constructionProjectId === officeProjectId)
    expect(refundRows).toHaveLength(1)
    expect(refundRows[0]!.amount).toBe(250_000)

    const staleResponse = session.command({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'submitIntent',
      commandId: 'stale-office-cancel', sessionId: session.sessionId,
      expectedStateRevision: staleRevision, payload: { intentId: staleIntentId },
    })
    expect(staleResponse).toMatchObject({ accepted: false, reasonCode: 'STALE_REVISION' })

    // Office page publishes the restoration as offline until its week (item 3).
    const afterCancel = officePage(session, facilityId, nextRequestId('after-cancel'))
    expect(afterCancel.actions.some(a => a.id === rowId)).toBe(false) // second cancel row absent
    expect(afterCancel.offline).toBe(true)
    const restoration = required(session.gameState.placement.facilities.find(f => f.blueprintId === 'restoration-office' && f.installation?.targetFacilityId === facilityId), 'no restoration-office placement after cancel')
    expect(afterCancel.offlineUntilWeek).toBe(restoration.completesWeek)

    // Restoration itself is refused by cancelInstallation and never gets a
    // cancel row anywhere on this page (item 2: "rows absent for... restoration placements").
    expect(afterCancel.actions.some(a => a.id === `cancel-${restoration.projectId}`)).toBe(false)
    expect(cancellationQuote(session.gameState, { projectId: restoration.projectId }).ok).toBe(false)

    let restored = session.gameState
    for (let i = 0; i < restoration.completesWeek - restored.market.tick; i++) restored = tick(restored)
    const restoredSession = new BridgeSession(restored, 'p13b-s6-office-1-restored')
    const restoredPage = officePage(restoredSession, facilityId, nextRequestId('restored'))
    expect(restoredPage.offline).toBe(false)
  })
})

describe('P13B-S6-T3 item 2: Plans page cancel-<projectId> row for a started plan\'s own placement', () => {
  it('a Lab module installed through a queued plan (the proven p13aLaboratorySlice -> queue -> tick -> \'started\' recipe) gets a cancel-<projectId> row on the Plans page, distinct from the terminal plan-cancel-<planId> row', () => {
    const base = p13aLaboratorySlice() // week 12, one Lab placed, no instruments
    const laboratoryFacilityId = required(base.operations.facilities.find(f => f.capability === 'laboratory'), 'no laboratory facility').id
    // The row id's own suffix is the PLACEMENT's numeric id (`lab.id` in
    // bridge/laboratory.ts's `plan-queue-${module.key}-${lab.id}`), never the
    // facility id string `buildingIdOf` resolves from.
    const labPlacementId = required(base.placement.facilities.find(p =>
      p.blueprintId === 'research-laboratory' && p.installation === undefined && p.facilityId === laboratoryFacilityId), 'no installed Research Laboratory placement').id
    const session0 = new BridgeSession(base, 'p13b-s6-plans-1')
    const lab = labPage(session0, buildingIdOf(base, laboratoryFacilityId), nextRequestId('queue'))
    dispatchRow(session0, lab.actions, `plan-queue-acoustic-${labPlacementId}`)
    const queuedPlanId = required(ownPlans(session0.gameState)[0], 'no plan queued').id
    expect(session0.gameState.physicalPlans.plans.find(p => p.id === queuedPlanId)!.status).toBe('queued')

    const ticked = tick(session0.gameState) // admission boundary: week 12 -> 13
    const plan = required(ticked.physicalPlans.plans.find(p => p.id === queuedPlanId), 'plan disappeared after admission')
    expect(plan.status).toBe('started')
    const startedPlacementId = required(plan.startedPlacementId, 'no startedPlacementId on the admitted plan')
    const projectId = required(ticked.placement.facilities.find(f => f.id === startedPlacementId), 'no placement for the started plan').projectId

    const engineQuote = cancellationQuote(ticked, { projectId })
    expect(engineQuote.ok).toBe(true)

    const session = new BridgeSession(ticked, 'p13b-s6-plans-1-read')
    const plans = plansPage(session, nextRequestId('cancel-row'))
    const rowId = `cancel-${projectId}`
    const row = required(plans.actions.find(a => a.id === rowId), `row "${rowId}" absent from ${JSON.stringify(plans.actions.map(a => a.id))}`)
    expect(row.intent?.kind).toBe('cancellationAction')
    const quote = row.quote as unknown as WireCancellationQuote
    expect(quote.refund).toBe(engineQuote.refund)
    expect(quote.components).toHaveLength(engineQuote.components.length)

    // Distinct from the EXISTING `plan-cancel-<planId>` row, which is offered
    // only for queued/held/blocked plans (bridge/plans.ts's own `terminal()`
    // guard, unchanged by S6) — a STARTED plan offers none of it today.
    expect(plans.actions.some(a => a.id === `plan-cancel-${queuedPlanId}`)).toBe(false)
  })
})

describe('P13B-S6-T3 item 5: finance category line for the refund week; the prior week\'s capex unchanged', () => {
  it('the constructionRefund category appears only in the week the refund landed; week 303\'s capex category is byte-identical before and after', () => {
    const { state: committed, stageProjectId, adoptionId } = s6SoundReady() // committed week 303
    expect(committed.market.tick).toBe(303)
    const before313 = advanceTo(committed, 313)

    const beforeSession = new BridgeSession(before313, 'p13b-s6-finance-before')
    const beforeSnapshot = beforeSession.snapshot()
    const window13Before = required(beforeSnapshot.snapshot.finance.finance.history.windows.find((w: { windowWeeks: number }) => w.windowWeeks === 13), 'no 13-week finance window')
    const week303Before = required(window13Before.points.find((p: { fromWeek: number }) => p.fromWeek === 303), 'no week-303 point before cancellation')
    const capexBefore = required(week303Before.categories.find((c: { kind: string }) => c.kind === 'constructionCapex'), 'no constructionCapex category at week 303 before cancellation')

    const session = new BridgeSession(before313, 'p13b-s6-finance-cancel')
    const lab = labPage(session, anyLabBuildingId(before313), nextRequestId('cancel'))
    dispatchRow(session, lab.actions, `cancel-adoption-${adoptionId}`)
    expect(session.gameState.market.tick).toBe(313)
    const refundRows = session.gameState.ledger.filter(e => e.kind === 'constructionRefund' && (e as unknown as { constructionProjectId: string }).constructionProjectId === stageProjectId)
    expect(refundRows).toHaveLength(1)
    expect(refundRows[0]!.amount).toBe(175_000) // the engine's own exact-trace figure (tests/p13b-s6-finance.test.ts)

    // Advance one more tick so week 313 (the cancel week) becomes a "completed"
    // week `financeHistory` will surface a point for.
    const ticked = tick(session.gameState)
    const afterSession = new BridgeSession(ticked, 'p13b-s6-finance-after')
    const afterSnapshot = afterSession.snapshot()
    const window13After = required(afterSnapshot.snapshot.finance.finance.history.windows.find((w: { windowWeeks: number }) => w.windowWeeks === 13), 'no 13-week finance window after')

    const week303After = required(window13After.points.find((p: { fromWeek: number }) => p.fromWeek === 303), 'no week-303 point after cancellation')
    expect(week303After.categories.find((c: { kind: string }) => c.kind === 'constructionCapex')).toEqual(capexBefore) // prior-week capex unchanged

    const week313 = required(window13After.points.find((p: { fromWeek: number }) => p.fromWeek === 313), 'no week-313 point after cancellation')
    const refundCategory = required(week313.categories.find((c: { kind: string }) => c.kind === 'constructionRefund'), 'no constructionRefund category at week 313')
    expect(refundCategory.amount).toBe(175_000)
    expect(refundCategory.entryCount).toBe(1)
    expect(refundCategory.label).toBe(FINANCE_CATEGORIES.constructionRefund)
    expect(refundCategory.label).toBe('Cancelled installation capital returned')
  })

  it('StudioFinanceFacility.status widens to accept \'cancelled\' — the schema round-trip on a snapshot carrying a cancelled installation', () => {
    const { state: committed, adoptionId } = s6LightingReady()
    const state = advanceTo(committed, committed.market.tick + 2)
    const cancelled = applyActions(state, [{ kind: 'cancelAdoption', adoptionId } as never])
    const session = new BridgeSession(cancelled, 'p13b-s6-finance-status')
    const snapshot = session.snapshot()
    const facilities = (snapshot.snapshot.finance.finance as { facilities: { status: string }[] }).facilities
    expect(facilities.some(f => f.status === 'cancelled')).toBe(true)
    // The schema round-trip: a snapshot carrying a genuinely 'cancelled' facility
    // must validate against the wire schema, which today enumerates only
    // ['underConstruction','operational'] at this exact site.
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, snapshot)).toEqual(snapshot)
  })
})

describe('P13B-S6-T3 item 6: history rows for cancellation/restoration on operationsEvents; player-safe; legacy cancellation:null unchanged', () => {
  it('a restoration\'s own completion reuses the EXISTING constructionCompleted kind — no invented "cancellation"/"restoration" kind (S4 case-8 precedent)', () => {
    const { state: committed, adoptionId } = s6LightingReady()
    const state = advanceTo(committed, committed.market.tick + 2)
    const cancelled = applyActions(state, [{ kind: 'cancelAdoption', adoptionId } as never])
    const restoration = required(cancelled.placement.facilities.find(f => f.blueprintId === 'restoration-lighting-stage'), 'no restoration placement after cancel')

    let ticked = cancelled
    for (let i = 0; i < restoration.completesWeek - ticked.market.tick; i++) ticked = tick(ticked)
    const session = new BridgeSession(ticked, 'p13b-s6-history-restoration')
    const snapshot = session.snapshot()
    const rows = (snapshot.snapshot.operationsEvents as { operationsEvents: { rows: { kind: string; subject: { kind: string; id: string } | null }[] } }).operationsEvents.rows
    const restorationRow = rows.find(r => r.kind === 'constructionCompleted' && r.subject?.id === String(restoration.id))
    expect(restorationRow).toBeDefined()
    expect(rows.some(r => r.kind.toLowerCase().includes('cancel') || r.kind.toLowerCase().includes('restor'))).toBe(false)
  })

  // COORDINATOR ADJUDICATION (2026-09-17, plan authority, commit f246963's
  // report): the cancellation-ACT operationsEvents row is OUT OF S6 SCOPE.
  // The plan's S6 expansion defines a cancellation's history as the retained
  // placement record with its receipt (the record stays in
  // `placement.facilities` with `status: 'cancelled'`); its bridge bullet asks
  // for cancel rows, restoration rows and the finance refund line only. No
  // engine studio event is added in S6 — the natural sibling, a
  // `facilityCancelled` history kind beside `facilityDemolished`, widens the
  // frozen history validators and is recorded OPEN in the plan for
  // owner/companion input. Converted from a real `it` (originally titled 'GAP
  // NAMED (see header): the cancellation ACT itself writes no operationsEvents
  // row today — this is an engine-level gap (installationCancellation.ts never
  // calls events.append), not a bridge-only fact') to `it.todo` per that
  // adjudication; its former body pinned `afterRows.length` growing and a
  // 'cancel'-mentioning summary after `cancelAdoption`, against
  // `session.snapshot().snapshot.operationsEvents.operationsEvents.rows`.
  it.todo('GAP NAMED (see header): the cancellation ACT itself writes no operationsEvents row today — this is an engine-level gap (installationCancellation.ts never calls events.append), not a bridge-only fact — OUT OF S6 SCOPE: no engine emission; plan S6-T3 adjudication (1), OPEN facilityCancelled history kind')

  it('player-safe: an already-naturally-existing rival adoption never appears in this studio\'s own adoptions[]/equipment[]/cancel rows', () => {
    // `state.technology.adoptions`/`state.technology.equipment` ARE multi-studio
    // capable roots (each row carries its own `studioId`), unlike
    // `state.placement`/`state.operations` (single-owner, per
    // tests/bridge-p13b-s4-office.test.ts's own case-7 finding). MEASURED
    // (2026-09-17, this exact fixture): `s6LightingReady()`'s generated world
    // already carries a genuine, naturally-purchased rival commercial sound
    // adoption (`adoptions[0].studioId !== own`, from the rival business's own
    // `considerRivalSoundPurchase` law) — a REAL rival row this test reads
    // directly, never hand-injected (avoiding the live validator's "at most one
    // non-player adoption" / matching-access clauses a synthetic clone would
    // otherwise have to satisfy separately).
    const { state: committed } = s6LightingReady()
    const own = required(committed.hollywood?.playerStudioId, 'no player studio')
    const rivalAdoption = required(committed.technology.adoptions.find(a => a.studioId !== own), 'no naturally-occurring rival adoption on this generated world')
    const rivalAsset = required(committed.technology.equipment.find(e => e.id === rivalAdoption.equipmentAssetId), 'no equipment asset for the rival adoption')
    const rivalStudioId = rivalAdoption.studioId

    const session = new BridgeSession(committed, 'p13b-s6-player-safe')
    const page = labPage(session, anyLabBuildingId(committed), nextRequestId('player-safe'))
    expect(page.adoptions?.some(a => (a as unknown as { id?: string }).id === rivalAdoption.id)).not.toBe(true)
    expect(page.equipment?.some(e => e.id === rivalAsset.id)).toBe(false)
    expect(page.actions.some(a => a.id === `cancel-adoption-${rivalAdoption.id}`)).toBe(false)
    const json = JSON.stringify(page)
    expect(json).not.toContain(rivalStudioId)
  })

  it('legacy behaviour unchanged: a live, never-cancelled adoption publishes cancelledWeek: null on the wire once the field exists', () => {
    const { state: committed } = s6SoundReady()
    const session = new BridgeSession(committed, 'p13b-s6-legacy-null')
    const page = labPage(session, anyLabBuildingId(committed), nextRequestId('legacy'))
    const row = required(page.adoptions?.find(a => a.technologyId === 'synchronized-sound'), 'no adoptions[] row for synchronized-sound')
    expect(Object.hasOwn(row, 'cancelledWeek')).toBe(true) // the field itself must be published, not merely absent-and-defaulted
    expect(row.cancelledWeek).toBeNull()
  })
})
