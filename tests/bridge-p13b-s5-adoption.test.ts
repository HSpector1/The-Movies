import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { blueprintById, queryFacilityInstallation } from '../src/core/placement.js'
import { technologyEntry } from '../src/core/technologyCatalogue.js'
// technologyAdoption.js is landed (S5 T1-T3, commit cf2a706): this import does
// NOT fail module resolution the way tests/p13b-s5-quotes.test.ts's own import
// does. The RED source in THIS file is entirely the BRIDGE (projection 36),
// which does not yet publish any of the projection-37 facts below — proven at
// each assertion, never by a missing-module import.
import { adoptionQuote, adoptionRejections } from '../src/core/technologyAdoption.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aResearchReady } from '../src/harness/p13a/fixtures.js'
import { p13bTwoLabWorld } from '../src/harness/p13b/fixtures.js'
import { BridgeSession } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { AVAILABLE_INTENT_KINDS, BRIDGE_SCHEMA, PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'

// P13B-S5-T4 independent-test-engineer task (2026-09-17). Authority: brief
// /private/tmp/claude-501/.../scratchpad/s5-bridge-test-brief.md, itself
// derived from the S5 task expansion ("Bridge (projection 37, ...)" bullet and
// test 7) in docs/engineering/playability-launch-review/plans/
// P13B-HEADLESS-PLAN.md. Engine landed at cf2a706 (S5 T1-T3): src/core/
// technologyAdoption.ts (adoptionQuote, adoptionRejections, equipmentAssets),
// technology root v4, Save V24; tests/p13b-s5-*.test.ts are 44/44 and are the
// law + fixture idioms this file copies (soundInventorReady/lightingInventorReady/
// fundTo, duplicated-not-shared by repo convention). The bridge is still
// projection 36 with sound-only `adopt-<stageId>-<postId>` rows
// (bridge/laboratory.ts ~294-304) that carry intent kind `researchAction`
// (bridge/session.ts's resolveLaboratoryIntents, ~1089-1098): NEITHER the
// per-technology row id, nor the `adoptTechnology` intent kind, nor any
// `adoptions[]`/quote wire member exists yet. Harness idioms copied from
// tests/bridge-p13b-s4-office.test.ts (BridgeSession/dispatchRow/required
// pattern, stale-revision case, player-safe case 7) and tests/
// bridge-p13b-s2-labs.test.ts (labResponse/labPage schema-checked pagination
// merge). Every case dispatches or reads through a real BridgeSession, never a
// mock.
//
// FIELD-NAME PREMISES (flagged, not invented product decisions — the brief's
// prose names shapes loosely; where it does not pin an exact JSON key this file
// states the interpretation it tests, so a real gap between this pin and a
// future implementer's choice is visible as a named premise, not a silent
// mismatch):
//   - "technology" (row shape prose) is pinned here as the wire key
//     `technologyId`, matching every other technology-identity field already on
//     this page (`StudioLaboratoryProject.technologyId`).
//   - The brief does not say WHERE the per-row `StudioAdoptionQuote` lives on
//     the wire. This file pins it as a new nullable `quote` member on the
//     existing `StudioLaboratoryAction` row (populated only for `adopt-*`
//     rows), since that is the only existing per-row container on this page
//     and the brief's own `StudioAdoptionQuote` field list has no home
//     anywhere else already on the wire.
//   - `StudioAdoptionRow` is pinned to EXACTLY the fields the brief lists
//     (technologyId, route, committedWeek, operationalWeek, components[],
//     equipmentAssetId, postFacilityId). No `id`/`stageFacilityId` member is
//     asserted (not listed by the brief); rows below are located by
//     `technologyId` alone, which is sufficient given at most one adoption of
//     each technology exists in every fixture at the point it is read.
//   - The brief pins presence-gating on acquired access explicitly for
//     LIGHTING only ("Lighting rows appear only with acquired lighting
//     access"). SOUND's own item says only "keeps P13A parity" (same
//     stage+Post pairing / existing-Post reuse) — today's sound rows are
//     always shown, disabled with a refusal, before access is acquired. This
//     file treats "parity" as retaining THAT pre-access-visible-but-disabled
//     behavior for sound and uses it for the refusal-disclosure case (item 6)
//     — sound is exercised there specifically BECAUSE it is not access-gated
//     for presence the way lighting is pinned to be. If a future implementer
//     instead access-gates sound's presence too, that is a legitimate
//     alternative reading this file did not test; flagged, not silently
//     assumed away.
//   - The plan-queue companion's "same reachable rule as S4's office
//     companions" is pinned here as: hidden when the target stage already
//     carries a placement of that technology's OWN stage blueprint (any
//     status) targeting it, OR a queued/held/started physical plan of that
//     exact blueprint already targets it — the same rule bridge/laboratory.ts
//     already applies to the acoustic/electrical instrument module companions
//     (~248-256), which office.ts's own `reachableStandard` generalizes for a
//     standard hierarchy adoption has none of. No standard-ranking analogue is
//     asserted because adoption has no standard hierarchy.

const SOUND = technologyEntry('synchronized-sound')
const LIGHTING = technologyEntry('lighting-control-01')

function required<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) throw new Error(message)
  return value
}

let requestCounter = 0
let commandCounter = 0
function nextRequestId(prefix: string): string { return `${prefix}-req-${String(requestCounter++)}` }

// ── Fixtures (duplicated-not-shared, mirrors tests/p13b-s5-quotes.test.ts) ──

function begin(state: GameState, technologyId: string, budgetPerWeek: number): GameState {
  const project = state.technology.projects.find(p => p.technologyId === technologyId)!
  return applyActions(state, [{ kind: 'beginResearch', projectId: project.id, budgetPerWeek }])
}
function runToCompletion(state: GameState, technologyId: string, boundWeek: number): GameState {
  let next = state
  while (next.technology.projects.find(p => p.technologyId === technologyId)!.status !== 'completed') {
    if (next.market.tick > boundWeek) throw new Error(`bridge-p13b-s5-adoption fixture: ${technologyId} research did not complete before week ${boundWeek}`)
    next = advanceTo(next, next.market.tick + 1)
  }
  return next
}
/** The reconciled ledger-written cash move every P13B/S5 test file carries its
 * own copy of (see tests/p13b-s5-quotes.test.ts's identical helper) — a bare
 * `studio.cash` override is refused by `tick()`'s construction invariant. */
function fundTo(state: GameState, target: number): GameState {
  const delta = target - state.studio.cash
  return { ...state, studio: { ...state.studio, cash: target },
    ledger: [...state.ledger, { week: state.market.tick, kind: 'overhead', amount: delta, note: 'weekly studio overhead' }] }
}

let soundCache: GameState | null = null
/** Sound inventor-ready: p13aResearchReady() -> begin sound $10k -> run to completion. */
function soundReady(): GameState {
  soundCache ??= runToCompletion(begin(p13aResearchReady(), SOUND.id, 10_000), SOUND.id, 400)
  return soundCache
}

let lightingCache: { state: GameState; lab1: string; lab2: string } | null = null
/** Lighting inventor-ready on a two-Lab world: 4 seats on Lab 2, $40k/week, run to completion. */
function lightingReady(): { state: GameState; lab1: string; lab2: string } {
  if (!lightingCache) {
    const { state: world, laboratoryFacilityIds: [lab1, lab2], candidateIds } = p13bTwoLabWorld()
    let state = applyActions(world, candidateIds.slice(0, 4).map(scientistId =>
      ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: LIGHTING.id })))
    state = begin(state, LIGHTING.id, 40_000)
    lightingCache = { state: runToCompletion(state, LIGHTING.id, 900), lab1, lab2 }
  }
  return lightingCache
}

let combinedCache: GameState | null = null
/** Both technologies inventor-complete on ONE world: sound on Lab 1 (1 seat),
 * lighting on Lab 2 (4 seats) — mirrors tests/p13b-s5-quotes.test.ts's own
 * "first-prototype entitlement" combined fixture, needed here so ONE stage can
 * carry an adoption of one technology while still offering the other. */
function combinedReady(): GameState {
  if (!combinedCache) {
    const { state: world, laboratoryFacilityIds: [lab1, lab2], candidateIds } = p13bTwoLabWorld()
    let state = fundTo(world, 5_000_000)
    state = applyActions(state, [{ kind: 'assignResearchScientist', laboratoryFacilityId: lab1, scientistId: candidateIds[0]!, technologyId: SOUND.id }])
    state = applyActions(state, candidateIds.slice(1, 5).map(scientistId =>
      ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: LIGHTING.id })))
    state = begin(state, SOUND.id, 10_000)
    state = begin(state, LIGHTING.id, 40_000)
    state = runToCompletion(state, SOUND.id, 900)
    state = runToCompletion(state, LIGHTING.id, 900)
    combinedCache = state
  }
  return combinedCache
}

// ── Wire shapes (the S5-T4 pin; NONE of this exists on the wire at projection 36) ──

type WireAdoptionComponent = {
  kind: 'access' | 'equipment' | 'site' | 'installation' | 'capture' | 'post'
  label: string; cost: number; weeks: number | null
  source: 'commercial' | 'first-prototype' | 'later-inventor' | 'existing' | 'physical'
  placementId: number | null; equipmentAssetId: string | null
}
type WireAdoptionQuote = {
  components: WireAdoptionComponent[]; total: number
  reusedPostFacilityId: string | null; reusedEquipmentAssetId: string | null
  rejections: string[]; refusal: string | null
}
type WireAdoptionRow = {
  technologyId: 'synchronized-sound' | 'lighting-control-01'
  route: 'research' | 'purchase'
  committedWeek: number; operationalWeek: number | null
  components: WireAdoptionComponent[]
  equipmentAssetId: string | null; postFacilityId: string | null
}
type WireAction = {
  id: string; label: string; detail: string; enabled: boolean; disabledReason: string | null
  intent: { intentId: string; kind: string } | null
  quote?: WireAdoptionQuote | null
}
type WireLaboratoryPage = {
  buildingId: string; actions: WireAction[]
  adoptions?: WireAdoptionRow[]
}
type WirePlanRow = { planId: string; status: string; workLabel: string; approvedMaximumDebit: number }

// ── Harness helpers (mirrors tests/bridge-p13b-s4-office.test.ts / bridge-p13b-s2-labs.test.ts) ──

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
function labResponse(session: BridgeSession, buildingId: string, requestId: string, page = 0, pageSize = 50): { laboratory: WireLaboratoryPage; pageCount: number; snapshotVersion: number } {
  const response = session.industry({
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'industryQuery', view: 'laboratory',
    targetId: buildingId, page, pageSize, lane: 'audienceAwareness', period: 'all',
    requestId, sessionId: session.sessionId, expectedStateRevision: session.stateRevision,
  } as never) as unknown as Record<string, unknown>
  if (!('laboratory' in response) || response.laboratory === null) throw new Error(`laboratory view rejected for building "${buildingId}" (request ${requestId}): ${JSON.stringify(response).slice(0, 500)}`)
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, response)).toEqual(response)
  return response as unknown as { laboratory: WireLaboratoryPage; pageCount: number; snapshotVersion: number }
}
function labPage(session: BridgeSession, buildingId: string, requestId: string): WireLaboratoryPage {
  const first = labResponse(session, buildingId, `${requestId}-p0`, 0)
  const actions = new Map(first.laboratory.actions.map(a => [a.id, a]))
  for (let page = 1; page < first.pageCount; page++) {
    for (const a of labResponse(session, buildingId, `${requestId}-p${String(page)}`, page).laboratory.actions) actions.set(a.id, a)
  }
  return { ...first.laboratory, actions: [...actions.values()] }
}
function plansResponse(session: BridgeSession, requestId: string, page = 0, pageSize = 50): { rows: WirePlanRow[]; pageCount: number } {
  const response = session.industry({
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'industryQuery', view: 'plans',
    targetId: null, page, pageSize, lane: 'audienceAwareness', period: 'all',
    requestId, sessionId: session.sessionId, expectedStateRevision: session.stateRevision,
  } as never) as unknown as Record<string, unknown>
  if (!('plans' in response) || response.plans === null) throw new Error(`plans view absent (request ${requestId}): ${JSON.stringify(response).slice(0, 500)}`)
  return { rows: (response.plans as { rows: WirePlanRow[] }).rows, pageCount: (response as { pageCount: number }).pageCount }
}
function plansPage(session: BridgeSession, requestId: string): WirePlanRow[] {
  const first = plansResponse(session, `${requestId}-p0`, 0)
  const rows = new Map(first.rows.map(r => [r.planId, r]))
  for (let page = 1; page < first.pageCount; page++) {
    for (const r of plansResponse(session, `${requestId}-p${String(page)}`, page).rows) rows.set(r.planId, r)
  }
  return [...rows.values()]
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

// ---------------------------------------------------------------------------

describe('P13B-S5-T4 bridge adoption wire: projection bump (36 -> 37)', () => {
  it('bumps PROJECTION_VERSION to 37 and its schema $id / x-project-studio.projectionVersion move with it', () => {
    expect(PROJECTION_VERSION).toBe(38)
    expect(BRIDGE_SCHEMA.$id).toContain('projection-38')
    expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(38)
  })
  it('AVAILABLE_INTENT_KINDS gains the adoptTechnology kind, distinct from researchAction/installationAction/physicalPlanAction', () => {
    expect((AVAILABLE_INTENT_KINDS as readonly string[])).toContain('adoptTechnology')
  })
})

describe('requirement 1: laboratory.adoptions[] structured rows and per-row StudioAdoptionQuote', () => {
  it('a committed lighting adoption appears on adoptions[] with technologyId/route/committedWeek/operationalWeek/components/equipmentAssetId/postFacilityId', () => {
    const { state: ready, lab1 } = lightingReady()
    const stageFacilityId = ready.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const committedWeek = ready.market.tick
    const committed = applyActions(ready, [{ kind: 'adoptTechnology', technologyId: LIGHTING.id, stageFacilityId } as never])
    const session = new BridgeSession(committed, 'p13b-s5-adopt-1-row')
    const page = labPage(session, buildingIdOf(committed, lab1), nextRequestId('row'))

    expect(Array.isArray(page.adoptions)).toBe(true)
    const row = required(page.adoptions?.find(a => a.technologyId === LIGHTING.id), `no adoptions[] row for ${LIGHTING.id} (adoptions=${JSON.stringify(page.adoptions)})`)
    expect(row.route).toBe('research') // inventor route: access was granted by completed research
    expect(row.committedWeek).toBe(committedWeek)
    expect(row.operationalWeek).toBeNull() // just committed; physical work has not finished
    expect(row.postFacilityId).toBeNull() // lighting has no Post component
    expect(row.equipmentAssetId).not.toBeNull()
    const engineAdoption = required(committed.technology.adoptions.find(a => a.technologyId === LIGHTING.id), 'no engine adoption row minted')
    expect(row.components).toEqual(engineAdoption.components)
  })

  it('the adopt-lighting-control-01-<stage> action row carries intent.kind "adoptTechnology" and a quote equal to the engine\'s own adoptionQuote (minus its ok flag)', () => {
    const { state: ready, lab1 } = lightingReady()
    const stageFacilityId = ready.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const session = new BridgeSession(ready, 'p13b-s5-adopt-1-quote')
    const page = labPage(session, buildingIdOf(ready, lab1), nextRequestId('quote'))
    const rowId = `adopt-${LIGHTING.id}-${stageFacilityId}`
    const action = required(page.actions.find(a => a.id === rowId), `row "${rowId}" absent from ${JSON.stringify(page.actions.map(a => a.id))}`)
    expect(action.intent?.kind).toBe('adoptTechnology')
    const engineQuote = adoptionQuote(ready, { technologyId: LIGHTING.id, stageFacilityId })
    expect(action.quote).toEqual({
      components: engineQuote.components, total: engineQuote.total,
      reusedPostFacilityId: engineQuote.reusedPostFacilityId, reusedEquipmentAssetId: engineQuote.reusedEquipmentAssetId,
      rejections: engineQuote.rejections, refusal: engineQuote.refusal,
    })
  })
})

describe('requirement 2: lighting rows are access-gated for presence and quote the exact 100,000 first-prototype total', () => {
  it('no adopt-lighting-control-01-* row exists anywhere before lighting access is acquired', () => {
    const world = p13bTwoLabWorld().state // week 780, both labs operational, no lighting access
    const session = new BridgeSession(world, 'p13b-s5-adopt-2-absent')
    const page = labPage(session, anyLabBuildingId(world), nextRequestId('absent'))
    expect(page.actions.some(a => a.id.startsWith(`adopt-${LIGHTING.id}-`))).toBe(false)
  })

  it('once lighting access is acquired (first-prototype route) the row names a compatible stage, no Post, and totals exactly $100,000 (site 50k/2w + installation 50k/2w + equipment $0)', () => {
    const { state: ready, lab1 } = lightingReady()
    const stageFacilityId = ready.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const session = new BridgeSession(ready, 'p13b-s5-adopt-2-present')
    const page = labPage(session, buildingIdOf(ready, lab1), nextRequestId('present'))
    const rowId = `adopt-${LIGHTING.id}-${stageFacilityId}`
    const action = required(page.actions.find(a => a.id === rowId), `row "${rowId}" absent from ${JSON.stringify(page.actions.map(a => a.id))}`)
    expect(action.enabled).toBe(true)
    const quote = required(action.quote, 'no quote on the adopt row')
    expect(quote.refusal).toBeNull()
    expect(quote.components.some(c => c.kind === 'post')).toBe(false)
    const access = quote.components.find(c => c.kind === 'access')!
    const equipment = quote.components.find(c => c.kind === 'equipment')!
    expect(access).toMatchObject({ cost: 0, source: 'existing' })
    expect(equipment).toMatchObject({ cost: 0, source: 'first-prototype' })
    const physical = quote.components.filter(c => c.source === 'physical')
    expect(physical.map(c => c.cost).sort((a, b) => a - b)).toEqual([50_000, 50_000])
    expect(physical.map(c => c.weeks).sort((a, b) => (a ?? 0) - (b ?? 0))).toEqual([2, 2])
    expect(quote.total).toBe(100_000)
  })
})

describe('requirement 3: sound rows keep P13A stage+Post pairing, existing-Post reuse at $0', () => {
  it('a second stage\'s sound row reuses the first stage\'s operational Post: reusedPostFacilityId set, the Post component existing/$0', () => {
    let state = soundReady()
    const stage1 = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const postFacilityId = state.operations.facilities.find(f => f.capability === 'post')!.id
    state = applyActions(state, [{ kind: 'adoptSynchronizedSound', stageFacilityId: stage1, postFacilityId }])
    state = advanceTo(state, state.market.tick + SOUND.deploymentWeeks) // both stage and Post now operational
    const stage2 = state.operations.facilities.find(f => f.capability === 'soundstage' && f.id !== stage1)!.id
    const session = new BridgeSession(state, 'p13b-s5-adopt-3-reuse')
    const page = labPage(session, anyLabBuildingId(state), nextRequestId('reuse'))
    const rowId = `adopt-${SOUND.id}-${stage2}-${postFacilityId}`
    const action = required(page.actions.find(a => a.id === rowId), `row "${rowId}" absent from ${JSON.stringify(page.actions.map(a => a.id))}`)
    const quote = required(action.quote, 'no quote on the adopt row')
    expect(quote.reusedPostFacilityId).toBe(postFacilityId)
    const post = quote.components.find(c => c.kind === 'post')!
    expect(post).toMatchObject({ cost: 0, source: 'existing' })
    expect(quote.components.some(c => c.source === 'physical' && c.kind === 'post')).toBe(false)
  })
})

describe('requirement 4: committing an adopt row through the bridge (engine-truth components, revision advance, stale refusal, row disappears)', () => {
  it('commits exactly one adoption with the wire-quoted components, advances stateRevision, refuses the same intent at the old revision, and the committed stage\'s own row disappears', () => {
    const ready = soundReady()
    const stageFacilityId = ready.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const postFacilityId = ready.operations.facilities.find(f => f.capability === 'post')!.id
    const session = new BridgeSession(ready, 'p13b-s5-adopt-4-commit')
    const rowId = `adopt-${SOUND.id}-${stageFacilityId}-${postFacilityId}`

    const before = labPage(session, anyLabBuildingId(ready), nextRequestId('before'))
    const beforeAction = required(before.actions.find(a => a.id === rowId), `row "${rowId}" absent from ${JSON.stringify(before.actions.map(a => a.id))}`)
    const wireQuote = required(beforeAction.quote, 'no quote on the adopt row')
    const staleRevision = session.stateRevision
    const adoptionsBefore = session.gameState.technology.adoptions.length

    dispatchRow(session, before.actions, rowId)

    expect(session.gameState.technology.adoptions.length).toBe(adoptionsBefore + 1)
    const minted = required(session.gameState.technology.adoptions.find(a => a.technologyId === SOUND.id && a.stageFacilityId === stageFacilityId), 'no minted sound adoption on the committed stage')
    // A pre-commit quote cannot carry commit-minted identities: `adoptionQuote`
    // quotes every physical row with `placementId: null` and the equipment row
    // with `equipmentAssetId: null` (neither the P09 placements nor the
    // equipment asset exist until commit). Compare with those two identity
    // fields projected out on both sides, then prove the commit's own
    // identities are genuine rather than merely absent.
    const withoutMintedIdentity = <T extends { placementId: number | null; equipmentAssetId: string | null }>(components: readonly T[]): T[] =>
      components.map(c => ({ ...c, placementId: null, equipmentAssetId: null }))
    expect(withoutMintedIdentity(minted.components)).toEqual(withoutMintedIdentity(wireQuote.components))
    for (const component of minted.components) {
      if (component.source !== 'physical') continue
      expect(Number.isInteger(component.placementId)).toBe(true)
      expect(component.placementId!).toBeGreaterThan(0)
      expect(session.gameState.placement.facilities.some(p => p.id === component.placementId)).toBe(true)
    }
    const equipmentRow = required(minted.components.find(c => c.kind === 'equipment'), 'no equipment row on the minted adoption')
    expect(equipmentRow.equipmentAssetId).toBe(minted.equipmentAssetId)
    expect(session.gameState.technology.equipment.some(a => a.id === minted.equipmentAssetId && a.holderAdoptionId === minted.id)).toBe(true)
    expect(session.stateRevision).not.toBe(staleRevision)

    const staleResponse = session.command({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'submitIntent',
      commandId: 'stale-adopt', sessionId: session.sessionId,
      expectedStateRevision: staleRevision, payload: { intentId: beforeAction.intent!.intentId },
    })
    expect(staleResponse).toMatchObject({ accepted: false, reasonCode: 'STALE_REVISION' })
    expect(session.gameState.technology.adoptions.length).toBe(adoptionsBefore + 1) // the stale attempt minted nothing

    const after = labPage(session, anyLabBuildingId(session.gameState), nextRequestId('after'))
    expect(after.actions.some(a => a.id === rowId)).toBe(false)
  })
})

describe('per-technology stage rule: a stage with an adoption of one technology still offers the other, never the same one again', () => {
  it('after committing sound on a stage, that stage\'s own sound row is gone but its lighting row is still offered', () => {
    const world = combinedReady()
    const stage1 = world.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const postFacilityId = world.operations.facilities.find(f => f.capability === 'post')!.id
    const session = new BridgeSession(world, 'p13b-s5-adopt-per-tech')
    const buildingId = anyLabBuildingId(world)
    const before = labPage(session, buildingId, nextRequestId('before'))
    dispatchRow(session, before.actions, `adopt-${SOUND.id}-${stage1}-${postFacilityId}`)

    const after = labPage(session, buildingId, nextRequestId('after'))
    expect(after.actions.some(a => a.id === `adopt-${SOUND.id}-${stage1}-${postFacilityId}`)).toBe(false)
    const lightingRow = required(after.actions.find(a => a.id === `adopt-${LIGHTING.id}-${stage1}`), `lighting row for stage "${stage1}" absent after committing sound there: ${JSON.stringify(after.actions.map(a => a.id))}`)
    // P09 allows only one installation per body at a time: sound's own physical
    // chain (site+installation+capture) is now `underConstruction` on stage1, so
    // this row's dry-run commit (bridge/laboratory.ts's `add`) hits the SAME
    // `queryFacilityInstallation` targetEngaged refusal the real commit would.
    // The per-technology rule holds for PRESENCE only — the row stays offered,
    // disabled with the engine's own sentence.
    expect(lightingRow.enabled).toBe(false)
    const engagedRefusal = 'The selected stage or Post cannot begin installation. Finish its current work first.'
    const lightingQuote = required(lightingRow.quote, 'no quote on the lighting row')
    // MEASURED ENGINE GAP (2026-09-17): `adoptionRejections` (src/core/
    // technologyAdoption.ts:87-106) carries no engagement clause, so
    // `adoptionQuote` itself does not yet know this stage is engaged — only the
    // dry-run COMMIT (which reaches `queryFacilityInstallation` directly) does.
    // The three lines below are the RED that names that exact gap: `disabledReason`
    // (from the commit) and `quote.refusal` (from the pre-check) must agree, and
    // do not until `adoptionRejections` gains its own engagement clause. They go
    // green only when the engine changes, never by loosening this assertion.
    expect(lightingRow.disabledReason).toBe(lightingQuote.refusal)
    expect(lightingQuote.refusal).toBe(engagedRefusal)
    expect(lightingQuote.rejections).toContain(engagedRefusal)

    // AMENDED 2026-09-17 (coordinator solvency correction): fund lawfully
    // immediately before building the fresh session, so the only obstacle this
    // row's quote/enabled state can report is the engagement this case tests,
    // never a cash shortfall from the fit-out's own burn (MEASURED, mirrors
    // tests/p13b-s5-quotes.test.ts's own solvency amendment for this exact
    // completion point).
    const completed = fundTo(advanceTo(session.gameState, session.gameState.market.tick + SOUND.deploymentWeeks), 1_000_000)
    const nextSession = new BridgeSession(completed, 'p13b-s5-adopt-per-tech-complete')
    const completePage = labPage(nextSession, anyLabBuildingId(completed), nextRequestId('complete'))
    const completedLightingRow = required(completePage.actions.find(a => a.id === `adopt-${LIGHTING.id}-${stage1}`), `lighting row for stage "${stage1}" absent after sound's fit-out completed: ${JSON.stringify(completePage.actions.map(a => a.id))}`)
    expect(completedLightingRow.enabled).toBe(true)
    expect(required(completedLightingRow.quote, 'no quote on the completed lighting row').refusal).toBeNull()
  })
})

describe('requirement 5: plan-queue-adopt-<technologyId>-<stageFacilityId> companions never mint an adoption and follow the S4 reachable-hide rule', () => {
  it('queues the stage-installation blueprint through queuePhysicalPlan, mints no adoption, and then hides itself once queued (duplicate-queue rule)', () => {
    const { state: ready, lab1 } = lightingReady()
    const stage = ready.operations.facilities.filter(f => f.capability === 'soundstage')[0]!.id
    const session = new BridgeSession(ready, 'p13b-s5-adopt-5-companion')
    const buildingId = buildingIdOf(ready, lab1)
    const rowId = `plan-queue-adopt-${LIGHTING.id}-${stage}`

    const before = labPage(session, buildingId, nextRequestId('before'))
    const companion = required(before.actions.find(a => a.id === rowId), `companion "${rowId}" absent from ${JSON.stringify(before.actions.map(a => a.id))}`)
    expect(companion.intent?.kind).toBe('physicalPlanAction')
    const adoptionsBefore = session.gameState.technology.adoptions.length

    dispatchRow(session, before.actions, rowId)

    expect(session.gameState.technology.adoptions.length).toBe(adoptionsBefore) // never mints an adoption
    const plans = plansPage(session, nextRequestId('plans'))
    const queued = required(plans.find(p => p.workLabel.includes(blueprintById(LIGHTING.stageInstallationId)!.name)), 'no queued plan for the lighting stage blueprint')
    expect(queued.status).toBe('queued')
    const stageQuote = queryFacilityInstallation(ready, { blueprintId: LIGHTING.stageInstallationId, targetFacilityId: stage })
    expect(queued.approvedMaximumDebit).toBe(stageQuote.cost)

    const after = labPage(session, buildingId, nextRequestId('after'))
    expect(after.actions.some(a => a.id === rowId)).toBe(false) // a duplicate queue is now hidden
    const immediate = required(after.actions.find(a => a.id === `adopt-${LIGHTING.id}-${stage}`), 'immediate adopt row absent while only a plan is queued (queueing alone commits nothing)')
    expect(immediate.enabled).toBe(true)
  })
})

describe('requirement 6: refusal disclosure and player-safety on a row whose engine quote is refused', () => {
  it('a sound row before access is acquired publishes the engine\'s own refusal/rejections, agrees with disabledReason, and the underlying action throws that exact text', () => {
    const state = p13aResearchReady() // seat assigned, research never begun/purchased: no sound access
    const stageFacilityId = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const postFacilityId = state.operations.facilities.find(f => f.capability === 'post')!.id
    const own = required(state.hollywood?.playerStudioId, 'no player studio on this state')
    const expectedRejections = adoptionRejections(state, own, { technologyId: SOUND.id, stageFacilityId, postFacilityId })
    const expectedRefusal = expectedRejections[0]!

    const session = new BridgeSession(state, 'p13b-s5-adopt-6-refusal')
    const page = labPage(session, anyLabBuildingId(state), nextRequestId('refusal'))
    const rowId = `adopt-${SOUND.id}-${stageFacilityId}-${postFacilityId}`
    const action = required(page.actions.find(a => a.id === rowId), `row "${rowId}" absent from ${JSON.stringify(page.actions.map(a => a.id))}`)
    expect(action.enabled).toBe(false)
    expect(action.intent).toBeNull()
    expect(action.disabledReason).toBe(expectedRefusal)
    const quote = required(action.quote, 'no quote on the refused adopt row')
    expect(quote.refusal).toBe(expectedRefusal)
    expect(quote.rejections).toEqual(expectedRejections)

    expect(() => applyActions(state, [{ kind: 'adoptSynchronizedSound', stageFacilityId, postFacilityId }]))
      .toThrow(expectedRefusal)

    const rivalStudioId = required(state.hollywood?.identities.find(i => i.studioId !== own), 'no rival studio on this generated world').studioId
    expect(JSON.stringify(page)).not.toContain(rivalStudioId)
  })
})
