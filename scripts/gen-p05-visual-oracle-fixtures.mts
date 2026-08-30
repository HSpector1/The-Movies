// P05 Visual Oracle V1 — the six canonical scenario fixtures (charter §9).
//
// Run from the repository root:
//   node_modules/.bin/vite-node scripts/gen-p05-visual-oracle-fixtures.mts
//
// Every fixture is a real GameState driven exclusively through public engine
// actions and `tick`, exported through the canonical save seam, then put
// through ONE recorded exact-token ID NORMALIZATION onto the charter §9.1
// fixture ledger (prod-0000 / prod-0001 / prod-0016 and the t-p05-* company).
// The ledger's identities are not mintable through any public seam — the
// engine derives production ids from the greenlight tick and talent ids from
// worldgen/authored streams — so the normalization is the only honest bridge,
// and it is: (a) token-exact with pre-image count assertions and target
// -collision refusal, (b) applied longest-token-first so no id can corrupt a
// suffixed sibling, (c) re-validated through `importSaveJson` and the engine's
// own invariant sweep (every machine assertion below runs on the NORMALIZED
// state), and (d) recorded verbatim in the manifest.
//
// Each scenario also runs its charter machine assertions HERE (level 1 of the
// proof pyramid); the Unity oracle runner re-asserts the projected subset at
// runtime against the same checkpoint bytes.

import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  applyActions,
  sceneryLoadInDecision,
  tick,
} from '../src/core/index.ts'
import type { GameState } from '../src/core/index.ts'
import {
  exportSaveJson,
  importSaveJson,
  studioLotSnapshot,
} from '../ui/src/engine/adapter.ts'
import {
  createBridgeRuntimeCheckpoint,
  encodeBridgeRuntimeCheckpoint,
} from '../bridge/runtime-checkpoint.ts'
import { contendedStudio, freePackage } from '../tests/_m4Fixtures.ts'

const GENERATOR = 'scripts/gen-p05-visual-oracle-fixtures.mts'
const OUTPUT_DIRECTORY = 'ui/e2e/p05-visual-oracle-v1'
const SEED = 'p05-visual-oracle-v1'

// ── charter §9.1 ledger ───────────────────────────────────────────────────────
const LEDGER = {
  productionA: 'prod-0000',
  productionB: 'prod-0001',
  loadInProduction: 'prod-0016',
  stageABuilding: 'stage-a',
  stageAFacility: 'facility-soundstage-07',
  stageBBuilding: 'stage-b',
  stageBFacility: 'facility-soundstage-12',
  setA: 'set-0',
  setB: 'set-1',
  placedStageFacility: 'facility-stage-1',
  placedSceneryFacility: 'facility-scenery-shop-2',
  sceneryResource: 'facility-scenery-shop-2:0',
  writerA: 't-p05-writer-a',
  companyA: {
    director: 't-p05-director-a',
    lead: 't-p05-lead-a',
    antagonist: 't-p05-antagonist-a',
    support: 't-p05-support-a',
    craft: 't-p05-craft-a',
  },
  companyB: {
    director: 't-p05-director-b',
    lead: 't-p05-lead-b',
    antagonist: 't-p05-antagonist-b',
    support: 't-p05-support-b',
    craft: 't-p05-craft-b',
  },
} as const

// ── helpers ──────────────────────────────────────────────────────────────────

function sha256(bytes: string): string {
  return createHash('sha256').update(bytes, 'utf8').digest('hex')
}

function fail(message: string): never {
  throw new Error(`gen-p05-visual-oracle-fixtures: ${message}`)
}

function assertEq<T>(actual: T, expected: T, label: string): void {
  const a = JSON.stringify(actual)
  const b = JSON.stringify(expected)
  if (a !== b) fail(`${label}: expected ${b}, got ${a}`)
}

function assertTrue(condition: boolean, label: string): void {
  if (!condition) fail(label)
}

function workflowOf(state: GameState, productionId: string) {
  const workflow = state.operations.workflows.find(
    (candidate) => candidate.productionId === productionId,
  )
  if (workflow === undefined) fail(`no workflow for ${productionId}`)
  return workflow!
}

function productionOf(state: GameState, productionId: string) {
  const production = state.studio.activeProductions.find(
    (candidate) => candidate.id === productionId,
  )
  if (production === undefined) fail(`no active production ${productionId}`)
  return production!
}

/** Drive shooting decisions for EXACTLY the named productions this week. */
function driveTakes(state: GameState, productionIds: readonly string[]): GameState {
  let next = state
  for (const id of productionIds) {
    const workflow = next.operations.workflows.find((c) => c.productionId === id)
    if (workflow === undefined || workflow.phase !== 'shooting' || workflow.shootingTask === null)
      continue
    const production = productionOf(next, id)
    if (workflow.shootingTask.status === 'unassigned') {
      next = applyActions(next, [
        { kind: 'assignShootingDirector', productionId: id, directorId: production.directorId },
      ])
    }
    const settled = next.operations.workflows.find((c) => c.productionId === id)
    if (settled?.shootingTask?.status === 'ready') {
      next = applyActions(next, [{ kind: 'scheduleShootingTake', productionId: id }])
    }
  }
  return next
}

/** Advance to `targetWeek`, driving only the named productions each week. */
function advanceTo(
  state: GameState,
  targetWeek: number,
  drivenProductionIds: readonly string[] = [],
): GameState {
  let next = state
  while (next.market.tick < targetWeek) {
    next = driveTakes(next, drivenProductionIds)
    next = tick(next)
  }
  if (next.market.tick !== targetWeek) fail(`overshot week ${targetWeek} (at ${next.market.tick})`)
  return next
}

type Rename = readonly [from: string, to: string]

/**
 * THE ONE NORMALIZATION. Exact-token rewrite of the exported save onto the
 * charter ledger, longest-token-first, with pre-image counts asserted and
 * target collisions refused; the result must re-import cleanly.
 */
function normalize(state: GameState, renames: readonly Rename[]): {
  state: GameState
  record: Array<{ from: string; to: string; occurrences: number }>
} {
  const fromSet = new Set(renames.map(([from]) => from))
  const toSet = new Set(renames.map(([, to]) => to))
  if (fromSet.size !== renames.length) fail('duplicate rename source')
  if (toSet.size !== renames.length) fail('duplicate rename target')
  let save = exportSaveJson(state)
  const record: Array<{ from: string; to: string; occurrences: number }> = []
  const ordered = [...renames].sort((a, b) => b[0].length - a[0].length)
  for (const [from, to] of ordered) {
    if (save.includes(to)) fail(`rename target "${to}" already present before rename`)
    const occurrences = save.split(from).length - 1
    if (occurrences === 0) fail(`rename source "${from}" not present`)
    save = save.split(from).join(to)
    record.push({ from, to, occurrences })
  }
  const outcome = importSaveJson(save)
  if (!outcome.ok) fail(`normalized save failed to import: ${outcome.error}`)
  return { state: outcome.state, record }
}

/** The A-company renames for one production (director, 3 cast, craft, writer). */
function companyRenames(
  state: GameState,
  productionId: string,
  target: typeof LEDGER.companyA,
  writerTarget: string | null,
): Rename[] {
  const production = productionOf(state, productionId)
  const cast = production.cast as unknown as Record<'lead' | 'antagonist' | 'support', string>
  for (const slot of ['lead', 'antagonist', 'support'] as const) {
    if (typeof cast[slot] !== 'string' || cast[slot].length === 0)
      fail(`production ${productionId} has no ${slot}`)
  }
  const craft = production.craftIds[0]
  if (craft === undefined) fail(`production ${productionId} has no craft`)
  const renames: Rename[] = [
    [production.directorId, target.director],
    [cast.lead, target.lead],
    [cast.antagonist, target.antagonist],
    [cast.support, target.support],
    [craft, target.craft],
  ]
  if (writerTarget !== null) renames.push([production.writerId, writerTarget])
  const sources = renames.map(([from]) => from)
  if (new Set(sources).size !== sources.length)
    fail(`production ${productionId} company members are not distinct: ${sources.join(', ')}`)
  return renames
}

function managedSnapshot(state: GameState) {
  const snapshot = studioLotSnapshot(state)
  if (snapshot.operationsMode !== 'managed') fail('snapshot not managed')
  return snapshot
}

function stageRow(state: GameState, stageFacilityId: string) {
  const row = managedSnapshot(state).stageProductions?.find(
    (candidate) => candidate.stageFacilityId === stageFacilityId,
  )
  if (row === undefined) fail(`no stage row for ${stageFacilityId}`)
  return row!
}

function operationsRow(state: GameState, productionId: string) {
  const row = managedSnapshot(state).productionOperations?.find(
    (candidate) => candidate.productionId === productionId,
  )
  if (row === undefined) fail(`no operations row for ${productionId}`)
  return row!
}

// ── the shared base walk ─────────────────────────────────────────────────────
//
// contendedStudio founds the lot, greenlights two leaders at tick 2, and
// leaves two accepted screenplays waiting. The leaders are driven through
// their natural wrap (week 7) and release (week 11); the base hands each
// scenario a quiet lot with both stages dark, both sets standing, and two
// greenlight-ready projects.

type Base = { state: GameState; readyProjectIds: readonly string[]; leaderIds: readonly string[] }

function base(seedSuffix: string): Base {
  const { state, readyProjectIds, productionIds } = contendedStudio(`${SEED}-${seedSuffix}`)
  let next = state
  for (let week = 0; week < 16 && next.studio.activeProductions.length > 0; week++) {
    next = driveTakes(next, productionIds)
    next = tick(next)
  }
  assertEq(next.studio.activeProductions.length, 0, 'base: leaders released')
  assertEq(next.studio.releasedFilms.length, 2, 'base: two released films')
  return { state: next, readyProjectIds, leaderIds: productionIds }
}

function greenlightAt(
  baseState: GameState,
  projectId: string,
  week: number,
): { state: GameState; productionId: string } {
  let next = advanceTo(baseState, week)
  next = applyActions(next, [
    { kind: 'greenlightScriptProject', production: freePackage(next, projectId) },
  ])
  const production = next.studio.activeProductions[next.studio.activeProductions.length - 1]!
  return { state: next, productionId: production.id }
}

// ── scenario builders ────────────────────────────────────────────────────────

type ScenarioFixture = {
  scenarioId: string
  week: number
  state: GameState
  normalization: Array<{ from: string; to: string; occurrences: number }>
  derivation: string[]
  assertions: string[]
  inMemoryProofAnchors: string[]
}

/** 1 — Idle Stage: week 20, Stage A valid/selectable, no holder, set-0 standing. */
function scenario1(): ScenarioFixture {
  const assertions: string[] = []
  const { state } = base('s1')
  const at20 = advanceTo(state, 20)
  const rowA = stageRow(at20, LEDGER.stageAFacility)
  assertEq(rowA.presentationState, 'dark', 's1: stage A dark')
  assertEq(rowA.holderProductionId, null, 's1: no holder')
  assertEq(rowA.stageBuildingId, LEDGER.stageABuilding, 's1: exact stage body')
  assertTrue(rowA.wrapReceipt === null, 's1: no current-week wrap receipt')
  const setA = at20.sets.find((set) => set.id === LEDGER.setA)
  assertTrue(setA !== undefined && setA.mountedOn === LEDGER.stageAFacility, 's1: set-0 stands')
  assertEq(managedSnapshot(at20).productionOperations?.length ?? 0, 0, 's1: no active production')
  assertions.push(
    'stage row stage-a: presentationState=dark, holder=null, wrapReceipt=null',
    'set-0 mounted on facility-soundstage-07 without implying occupancy',
    'zero active productions on the board',
  )
  return {
    scenarioId: 'idle-stage',
    week: 20,
    state: at20,
    normalization: [],
    derivation: [
      'contendedStudio → drive both leaders to wrap/release',
      'advance to week 20 with the lot quiet',
    ],
    assertions,
    inMemoryProofAnchors: [],
  }
}

/** 2 — Rehearsal: week 19, prod-0000 owns Stage A + live set-0, company at stage. */
function scenario2(): ScenarioFixture {
  const { state, readyProjectIds } = base('s2')
  const { state: greenlit, productionId } = greenlightAt(state, readyProjectIds[0]!, 16)
  const at19 = advanceTo(greenlit, 19)
  const renames: Rename[] = [
    [productionId, LEDGER.productionA],
    ...companyRenames(at19, productionId, LEDGER.companyA, LEDGER.writerA),
  ]
  const { state: normalized, record } = normalize(at19, renames)

  const workflow = workflowOf(normalized, LEDGER.productionA)
  assertEq(workflow.phase, 'rehearsal', 's2: rehearsal phase')
  assertEq(workflow.bindings.stageFacilityId, LEDGER.stageAFacility, 's2: stage A binding')
  assertEq(workflow.bindings.setId, LEDGER.setA, 's2: live set-0')
  const row = operationsRow(normalized, LEDGER.productionA)
  assertEq(row.operationalState, 'rehearsal-working', 's2: closed state')
  const stage = stageRow(normalized, LEDGER.stageAFacility)
  assertEq(stage.presentationState, 'rehearsal', 's2: stage row rehearsal')
  assertEq(stage.holderProductionId, LEDGER.productionA, 's2: exact holder')
  const presence = managedSnapshot(normalized).presence?.people ?? []
  const atStage = presence.filter(
    (person) =>
      person.facilityId === LEDGER.stageAFacility && person.ownerId === LEDGER.productionA,
  )
  const stageIds = new Set(atStage.map((person) => person.talentId))
  for (const member of [
    LEDGER.companyA.director,
    LEDGER.companyA.lead,
    LEDGER.companyA.antagonist,
    LEDGER.companyA.support,
  ]) {
    assertTrue(stageIds.has(member), `s2: ${member} at stage`)
  }
  assertTrue(!stageIds.has(LEDGER.companyA.craft), 's2: craft off stage')
  assertTrue(!stageIds.has(LEDGER.writerA), 's2: writer places no body')
  return {
    scenarioId: 'rehearsal',
    week: 19,
    state: normalized,
    normalization: record,
    derivation: [
      'base → greenlight ready screenplay at week 16 (stage acquired at rehearsal entry, week 19)',
      'advance undriven to week 19',
      'normalize onto the ledger (prod + company + writer)',
    ],
    assertions: [
      'workflow rehearsal on facility-soundstage-07 with live set-0',
      'closed state rehearsal-working; stage row holder prod-0000, presentationState rehearsal',
      'presence: director/lead/antagonist/support at stage; craft and writer never',
    ],
    inMemoryProofAnchors: [],
  }
}

/** 3 — Scenery Load-In: week 20, prod-0016 blocked in transit 25 / 3 / 2 / 1 from shop-2. */
function scenario3(): ScenarioFixture {
  const { state: founded, readyProjectIds, productionIds } = contendedStudio(`${SEED}-s3`)
  // Placements FIRST (week 2): the stage completes at 18, the shop at 13.
  let next = applyActions(founded, [
    { kind: 'placeFacility', placement: { blueprintId: 'stage-standard', origin: { gx: 23, gy: 20 } } },
  ])
  next = applyActions(next, [
    { kind: 'placeFacility', placement: { blueprintId: 'scenery-shop', origin: { gx: 0, gy: 11 } } },
  ])
  for (let week = 0; week < 16 && next.studio.activeProductions.length > 0; week++) {
    next = driveTakes(next, productionIds)
    next = tick(next)
  }
  assertEq(next.studio.activeProductions.length, 0, 's3: leaders released')
  // Free stage-b's mount so a set can be UNDER WORK there at week 18.
  next = advanceTo(next, 14)
  next = applyActions(next, [{ kind: 'strikeSet', setId: LEDGER.setB }])
  // Greenlight at week 16 mints the ledger's own prod-0016 (id = greenlight
  // tick); the stage is acquired at rehearsal entry (stamped heldSince 18).
  const { state: greenlit, productionId } = greenlightAt(next, readyProjectIds[0]!, 16)
  assertEq(productionId, LEDGER.loadInProduction, 's3: engine mints prod-0016 at tick 16')
  // Week 18: fill BOTH founding scenery slots with sets under work so the
  // shooting-entry allocation (tick 19→20) must reach the placed shop — the
  // charter's exact reserved resource facility-scenery-shop-2:0.
  let at18 = advanceTo(greenlit, 18)
  at18 = applyActions(at18, [
    { kind: 'commissionSet', commission: { blueprintId: 'set-house-generic', stageFacilityId: LEDGER.placedStageFacility } },
  ])
  at18 = applyActions(at18, [
    { kind: 'commissionSet', commission: { blueprintId: 'set-city-street', stageFacilityId: LEDGER.stageBFacility } },
  ])
  // Week 20 (shooting just entered): the Director call is made — assignment
  // settles only DUE scenery, and the transit has 1 week to run, so the take
  // stands BLOCKED in transit exactly as charter scenario 3 frames it.
  let at20 = advanceTo(at18, 20)
  const productionAt20 = productionOf(at20, productionId)
  at20 = applyActions(at20, [
    { kind: 'assignShootingDirector', productionId, directorId: productionAt20.directorId },
  ])
  const renames: Rename[] = [
    ...companyRenames(at20, productionId, LEDGER.companyA, LEDGER.writerA),
  ]
  const { state: normalized, record } = normalize(at20, renames)

  const workflow = workflowOf(normalized, LEDGER.loadInProduction)
  assertEq(workflow.phase, 'shooting', 's3: persisted phase shooting')
  assertEq(workflow.shootingTask?.status, 'blocked', 's3: task blocked')
  assertEq(workflow.blocker?.kind, 'scenery-load-in', 's3: scenery blocker')
  assertEq(workflow.bindings.heldSinceWeek, 18, 's3: held since week 18')
  const scenery = workflow.reservations.find((r) => r.capability === 'set-scenery')
  assertEq(scenery?.facilityId, LEDGER.placedSceneryFacility, 's3: scenery from shop-2')
  assertEq(scenery?.slot, 0, 's3: exact reserved slot 0')
  const decision = sceneryLoadInDecision(normalized, workflow, 20)
  assertEq(decision.kind, 'in-transit', 's3: in transit at week 20')
  if (decision.kind === 'in-transit') {
    assertEq(decision.loadIn.fromFacilityId, LEDGER.placedSceneryFacility, 's3: exact source')
    assertEq(decision.loadIn.distance, 25, 's3: Manhattan distance 25')
    assertEq(decision.loadIn.weeks, 3, 's3: total 3')
    assertEq(decision.loadIn.weeksElapsed, 2, 's3: elapsed 2')
    assertEq(decision.loadIn.weeksRemaining, 1, 's3: remaining 1')
  }
  const row = operationsRow(normalized, LEDGER.loadInProduction)
  assertEq(row.operationalState, 'scenery-in-transit', 's3: closed state LOAD-IN, never Rehearsal')
  assertTrue(row.currentCommand === null, 's3: no manual Clear intent on a current transit')
  const stage = stageRow(normalized, LEDGER.stageAFacility)
  assertEq(stage.presentationState, 'load-in', 's3: stage row load-in')
  const presence = managedSnapshot(normalized).presence?.people ?? []
  assertTrue(
    presence.some(
      (person) =>
        person.talentId === LEDGER.companyA.craft &&
        person.facilityId === LEDGER.placedSceneryFacility,
    ),
    's3: craft at the exact scenery source',
  )
  const centres = { source: { gx: 1, gy: 11 }, destination: { gx: 18, gy: 3 } }
  return {
    scenarioId: 'scenery-load-in',
    week: 20,
    state: normalized,
    normalization: record,
    derivation: [
      'contendedStudio → place stage-standard@(23,20) [operational wk 18 → facility-stage-1/placed-1] and scenery-shop@(0,11) [operational wk 13 → facility-scenery-shop-2/placed-2, centre (1,11)]',
      'drive leaders to release; strike set-1 (frees the stage-b mount)',
      'greenlight at week 16 → the engine mints prod-0016 itself; stage A acquired at rehearsal entry (heldSince 18)',
      'week 18: commission set-house-generic on facility-stage-1 and set-city-street on facility-soundstage-12 — both founding scenery slots held by sets under work',
      'shooting entry (tick 19→20) allocates scenery from facility-scenery-shop-2:0; Director called at week 20 (assignment settles only DUE scenery — the take stands blocked in transit)',
      'normalize the company onto the ledger (production id needs no rename)',
      `centres: source ${JSON.stringify(centres.source)} → destination ${JSON.stringify(centres.destination)}`,
    ],
    assertions: [
      'persisted shooting / task blocked / scenery-load-in blocker / heldSince 18',
      'reserved resource facility-scenery-shop-2:0; source centre (1,11), destination (18,3)',
      'transit math 25 distance / 3 total / 2 elapsed / 1 remaining at week 20',
      'closed state scenery-in-transit (LOAD-IN, never labeled Rehearsal); no manual Clear',
      'craft at the exact scenery source; director/cast stage-bound',
    ],
    inMemoryProofAnchors: [],
  }
}

/** 4 — Blocked / Waiting: week 20, prod-0000 shooting:unassigned, Director locked. */
function scenario4(): ScenarioFixture {
  const { state, readyProjectIds } = base('s4')
  const { state: greenlit, productionId } = greenlightAt(state, readyProjectIds[0]!, 16)
  const at20 = advanceTo(greenlit, 20)
  const renames: Rename[] = [
    [productionId, LEDGER.productionA],
    ...companyRenames(at20, productionId, LEDGER.companyA, LEDGER.writerA),
  ]
  const { state: normalized, record } = normalize(at20, renames)

  const workflow = workflowOf(normalized, LEDGER.productionA)
  assertEq(workflow.phase, 'shooting', 's4: shooting phase')
  assertEq(workflow.shootingTask?.status, 'unassigned', 's4: task unassigned')
  const production = productionOf(normalized, LEDGER.productionA)
  assertEq(production.directorId, LEDGER.companyA.director, 's4: locked Director')
  const row = operationsRow(normalized, LEDGER.productionA)
  assertEq(row.operationalState, 'director-required', 's4: Decision Required')
  assertTrue(row.currentCommand !== null, 's4: exactly one emitted operation')
  assertEq(row.blockerAnatomy === null, false, 's4: blocker anatomy present')
  const stage = stageRow(normalized, LEDGER.stageAFacility)
  assertEq(stage.presentationState, 'blocked', 's4: stage reads blocked, never Shooting')
  assertEq(
    managedSnapshot(normalized).productionOperations?.length,
    1,
    's4: no second operation on the board',
  )
  return {
    scenarioId: 'blocked-waiting',
    week: 20,
    state: normalized,
    normalization: record,
    derivation: [
      'base → greenlight at week 16; advance UNDRIVEN to week 20 (no Director call)',
      'normalize onto the ledger (prod-0000 + company + writer)',
    ],
    assertions: [
      'shooting phase, task unassigned, Director locked t-p05-director-a',
      'closed state director-required with exactly one emitted operation (Call the Director)',
      'stage row blocked — occupied-low, never hot',
    ],
    inMemoryProofAnchors: [],
  }
}

/** 5 — Shooting + the required two-Stage isolation variant. */
function scenario5(): ScenarioFixture {
  const { state, readyProjectIds } = base('s5')
  let next = advanceTo(state, 16)
  next = applyActions(next, [
    { kind: 'greenlightScriptProject', production: freePackage(next, readyProjectIds[0]!) },
  ])
  const productionAId = next.studio.activeProductions[next.studio.activeProductions.length - 1]!.id
  next = applyActions(next, [
    { kind: 'greenlightScriptProject', production: freePackage(next, readyProjectIds[1]!) },
  ])
  const productionBId = next.studio.activeProductions[next.studio.activeProductions.length - 1]!.id
  const at20 = advanceTo(next, 20)

  // ── the isolation anchor, proven on the PRE-normalized walk ──────────────
  const bRowsBefore = JSON.stringify({
    operations: operationsRow(at20, productionBId),
    stage: stageRow(at20, LEDGER.stageBFacility),
  })
  const drivenA = driveTakes(at20, [productionAId])
  const bRowsAfter = JSON.stringify({
    operations: operationsRow(drivenA, productionBId),
    stage: stageRow(drivenA, LEDGER.stageBFacility),
  })
  assertEq(bRowsAfter, bRowsBefore, 's5: driving A leaves B truth byte-identical')

  const renames: Rename[] = [
    [productionAId, LEDGER.productionA],
    [productionBId, LEDGER.productionB],
    ...companyRenames(drivenA, productionAId, LEDGER.companyA, LEDGER.writerA),
    ...companyRenames(drivenA, productionBId, LEDGER.companyB, null),
  ]
  const aMembers = companyRenames(drivenA, productionAId, LEDGER.companyA, null).map(([f]) => f)
  const bMembers = companyRenames(drivenA, productionBId, LEDGER.companyB, null).map(([f]) => f)
  for (const member of aMembers) {
    assertTrue(!bMembers.includes(member), `s5: companies disjoint (${member})`)
  }
  const { state: normalized, record } = normalize(drivenA, renames)

  const workflowA = workflowOf(normalized, LEDGER.productionA)
  assertEq(workflowA.phase, 'shooting', 's5: A shooting')
  assertEq(workflowA.shootingTask?.status, 'scheduled', 's5: A scheduled')
  assertEq(workflowA.bindings.stageFacilityId, LEDGER.stageAFacility, 's5: A on stage A')
  assertEq(workflowA.bindings.setId, LEDGER.setA, 's5: A on set-0')
  const workflowB = workflowOf(normalized, LEDGER.productionB)
  assertEq(workflowB.phase, 'shooting', 's5: B shooting hold')
  assertEq(workflowB.shootingTask?.status, 'unassigned', 's5: B unassigned')
  assertEq(workflowB.bindings.stageFacilityId, LEDGER.stageBFacility, 's5: B on stage B')
  assertEq(workflowB.bindings.setId, LEDGER.setB, 's5: B on set-1')
  const rowA = operationsRow(normalized, LEDGER.productionA)
  assertEq(rowA.operationalState, 'shooting-working', 's5: A hot')
  assertTrue(rowA.currentCommand === null, 's5: no scheduling action remains on A')
  const rowB = operationsRow(normalized, LEDGER.productionB)
  assertEq(rowB.operationalState, 'director-required', 's5: B Decision Required')
  const stageA = stageRow(normalized, LEDGER.stageAFacility)
  assertEq(stageA.presentationState, 'shooting', 's5: stage A row shooting')
  assertEq(stageA.holderProductionId, LEDGER.productionA, 's5: stage A exact holder')
  const stageB = stageRow(normalized, LEDGER.stageBFacility)
  assertEq(stageB.presentationState, 'blocked', 's5: stage B row blocked')
  assertEq(stageB.holderProductionId, LEDGER.productionB, 's5: stage B exact holder')
  const presence = managedSnapshot(normalized).presence?.people ?? []
  const bStagePeople = presence.filter((p) => p.facilityId === LEDGER.stageBFacility)
  for (const person of bStagePeople) {
    assertEq(person.ownerId, LEDGER.productionB, 's5: no A body at stage B')
  }
  assertTrue(
    !presence.some(
      (p) => p.talentId === LEDGER.companyA.craft && p.facilityId === LEDGER.stageAFacility,
    ),
    's5: A craft never at stage',
  )
  return {
    scenarioId: 'shooting',
    week: 20,
    state: normalized,
    normalization: record,
    derivation: [
      'base → greenlight BOTH ready screenplays at week 16 (A binds set-0/stage A; B binds set-1/stage B)',
      'advance undriven to week 20; drive A only (Director call settles due scenery; take scheduled)',
      'normalize onto the ledger (prod-0000 + prod-0001 + both companies + writer)',
    ],
    assertions: [
      'A: shooting scheduled on stage A/set-0, closed state shooting-working, no remaining action',
      'B: shooting unassigned hold on stage B/set-1, closed state director-required',
      'stage rows: A shooting with exact holder; B blocked with exact holder; no cross-stage body',
    ],
    inMemoryProofAnchors: [
      'driving A (assign+schedule) left B operations+stage rows byte-identical (asserted pre-normalization)',
    ],
  }
}

/** 6 — Wrap: fixture at week 20 with the take complete; ONE advance wraps at 21. */
function scenario6(): { fixture: ScenarioFixture; after: GameState } {
  const { state, readyProjectIds } = base('s6')
  const { state: greenlit, productionId } = greenlightAt(state, readyProjectIds[0]!, 15)
  let next = advanceTo(greenlit, 19, [productionId])
  next = driveTakes(next, [productionId]) // assign + schedule at week 19
  const at20 = tick(next) // take completes during 19→20
  const renames: Rename[] = [
    [productionId, LEDGER.productionA],
    ...companyRenames(at20, productionId, LEDGER.companyA, LEDGER.writerA),
  ]
  const { state: normalized, record } = normalize(at20, renames)

  const workflow = workflowOf(normalized, LEDGER.productionA)
  assertEq(workflow.phase, 'shooting', 's6: still shooting at week 20')
  assertEq(workflow.shootingTask?.status, 'completed', 's6: take completed')
  assertEq(normalized.market.tick, 20, 's6: fixture week 20')

  // ── the one transition, proven in memory (never written) ─────────────────
  const after = tick(normalized)
  assertEq(after.market.tick, 21, 's6-after: week 21')
  const wrapRow = after.studioEvents.rows.find(
    (row) => row.kind === 'wrapped' && row.productionId === LEDGER.productionA,
  )
  assertTrue(wrapRow !== undefined && wrapRow.week === 20, 's6-after: wrap receipt week 20')
  const stage = stageRow(after, LEDGER.stageAFacility)
  assertEq(stage.presentationState, 'wrap', 's6-after: stage row wrap cue')
  assertEq(stage.holderProductionId, null, 's6-after: holder released')
  assertTrue(stage.wrapReceipt !== null && stage.wrapReceipt.currentWeek, 's6-after: current-week receipt')
  const rowAfter = operationsRow(after, LEDGER.productionA)
  // With free Post capacity the wrap hands off IMMEDIATELY — Post is next and
  // already under way; there is no P05 operation either way.
  assertEq(rowAfter.operationalState, 'post-handoff', 's6-after: Post handoff, no P05 operation')
  assertTrue(rowAfter.currentCommand === null, 's6-after: no operation')
  const presence = managedSnapshot(after).presence?.people ?? []
  assertTrue(
    !presence.some((p) => p.facilityId === LEDGER.stageAFacility),
    's6-after: authoritative people released from the stage',
  )
  return {
    fixture: {
      scenarioId: 'wrap',
      week: 20,
      state: normalized,
      normalization: record,
      derivation: [
        'base → greenlight at week 15; drive at week 19 (assign + schedule); one tick completes the take at week 20',
        'normalize onto the ledger (prod-0000 + company + writer)',
        'the Wrap transition itself is driven by the oracle runner: ONE advanceWeek intent moves week 20 → 21',
      ],
      assertions: [
        'fixture: shooting/completed at week 20 — the state one lawful advance before Wrap',
      ],
      inMemoryProofAnchors: [
        'tick(fixture) → week 21: wrap event week 20; stage row wrap with current-week receipt and released holder; closed state wrapped-waiting-for-post with no P05 operation; no authoritative person at the stage',
      ],
    },
    after,
  }
}

// ── emission ─────────────────────────────────────────────────────────────────

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(repoRoot, OUTPUT_DIRECTORY)
mkdirSync(outDir, { recursive: true })

const scenario6Result = scenario6()
const fixtures: ScenarioFixture[] = [
  scenario1(),
  scenario2(),
  scenario3(),
  scenario4(),
  scenario5(),
  scenario6Result.fixture,
]

const manifestFixtures = fixtures.map((fixture, index) => {
  const ordinal = index + 1
  const saveJson = exportSaveJson(fixture.state)
  const reimport = importSaveJson(saveJson)
  if (!reimport.ok) fail(`${fixture.scenarioId}: emitted save failed re-import`)
  const checkpoint = createBridgeRuntimeCheckpoint({
    sessionId: `p05-oracle-${fixture.scenarioId}`,
    stateRevision: 0,
    currentSaveJson: saveJson,
    savedSaveJson: null,
    journal: [],
  })
  const checkpointJson = encodeBridgeRuntimeCheckpoint(checkpoint)
  const saveName = `s${ordinal}-${fixture.scenarioId}.save.json`
  const checkpointName = `s${ordinal}-${fixture.scenarioId}.checkpoint.json`
  writeFileSync(join(outDir, saveName), saveJson)
  writeFileSync(join(outDir, checkpointName), checkpointJson)
  return {
    ordinal,
    scenarioId: fixture.scenarioId,
    week: fixture.week,
    save: { file: saveName, byteLength: Buffer.byteLength(saveJson), sha256: sha256(saveJson) },
    checkpoint: {
      file: checkpointName,
      byteLength: Buffer.byteLength(checkpointJson),
      sha256: sha256(checkpointJson),
      sessionId: `p05-oracle-${fixture.scenarioId}`,
      schemaId: checkpoint.schemaId,
      stateDigest: checkpoint.currentStateDigest,
    },
    publicActionDerivation: fixture.derivation,
    idNormalization: fixture.normalization,
    machineAssertions: fixture.assertions,
    inMemoryProofAnchors: fixture.inMemoryProofAnchors,
  }
})

const manifest = {
  fixtureId: 'p05-visual-oracle-v1',
  generator: GENERATOR,
  generatorSourceSha256: sha256(readFileSync(join(repoRoot, GENERATOR), 'utf8')),
  seed: SEED,
  ledger: LEDGER,
  normalizationLaw:
    'Exact-token rewrite onto the charter §9.1 ledger, longest-token-first, pre-image counts asserted, target collisions refused, re-imported through importSaveJson; every machine assertion runs on the NORMALIZED state. The ledger identities are not mintable through public seams (production ids derive from the greenlight tick, talent ids from worldgen/authored streams).',
  fixtures: manifestFixtures,
}
const manifestJson = `${JSON.stringify(manifest, null, 2)}\n`
writeFileSync(join(outDir, 'manifest.json'), manifestJson)

// ── exact-file-set + re-read verification (the house idiom) ──────────────────
const EXPECTED_FILES = [
  'manifest.json',
  ...manifestFixtures.flatMap((entry) => [entry.save.file, entry.checkpoint.file]),
].sort()
const actualFiles = readdirSync(outDir).filter((name) => !name.startsWith('.')).sort()
assertEq(actualFiles, EXPECTED_FILES, 'output directory holds exactly the fixture set')
for (const entry of manifestFixtures) {
  const bytes = readFileSync(join(outDir, entry.save.file), 'utf8')
  assertEq(sha256(bytes), entry.save.sha256, `${entry.save.file} byte identity`)
}

console.log(`[gen-p05-visual-oracle-fixtures] emitted ${manifestFixtures.length} scenarios to ${OUTPUT_DIRECTORY}`)
for (const entry of manifestFixtures) {
  console.log(
    `  s${entry.ordinal} ${entry.scenarioId} week=${entry.week} save=${entry.save.sha256.slice(0, 12)} checkpoint=${entry.checkpoint.sha256.slice(0, 12)}`,
  )
}
