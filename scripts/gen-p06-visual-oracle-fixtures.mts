// P06 Visual Oracle V1 — the six canonical scenario fixtures (charter §9,
// modeled EXACTLY on `scripts/gen-p05-visual-oracle-fixtures.mts`).
//
// Run from the repository root:
//   node_modules/.bin/vite-node scripts/gen-p06-visual-oracle-fixtures.mts
//
// Every fixture is a real GameState driven exclusively through public engine
// actions and `tick`, exported through the canonical save seam, then put
// through ONE recorded exact-token ID NORMALIZATION onto the P06 fixture
// ledger (prod-0000 / prod-0001 / prod-0002 and the t-p06-* company/writer
// tokens). The ledger's identities are not mintable through any public seam —
// the engine derives production ids from the greenlight tick and talent ids
// from worldgen/authored streams — so the normalization is the only honest
// bridge, and it is: (a) token-exact with pre-image count assertions and
// target-collision refusal, (b) applied longest-token-first so no id can
// corrupt a suffixed sibling, (c) re-validated through `importSaveJson` and
// the engine's own invariant sweep (every machine assertion below runs on the
// NORMALIZED state), and (d) recorded verbatim in the manifest.
//
// ── WHY SCENES 2 AND 6 DO NOT USE `contendedStudio()` DIRECTLY ──────────────
//
// The brief that commissioned this script described the founding Post
// Building as "the single `post` capability instance … its capacity is 1, so
// two wrapped pictures contend for it." That is not what the engine builds:
// `TUNING.FOUNDING_POST_CAPACITY` is **2**, not 1 (`src/core/tuning.ts`,
// confirmed live and pinned by `tests/c2a-m0-engine-union.test.ts`). A single
// wrapping picture never contends against a lone occupant — Post has room for
// both. Genuine contention requires **two** productions already holding the
// two Post slots before a third tries to wrap in.
//
// Reaching that state deterministically also collides with a second founding
// ceiling nobody sees at the contract level: `HIRING_DRAFT_CRAFT` (3) and
// `HIRING_DRAFT_ACTORS` (11) are hard applicant-pool ceilings baked into
// world generation (`src/core/employment.ts` `DRAFT_ROLES`), not tunable via
// `richFoundedStudio`'s `depth` parameter — a founding can never carry more
// than 3 craft or 11 actors no matter what depth is requested. Scene 6 needs
// FOUR concurrently active productions (two Post occupants, one blocked, one
// parked at Release Ready) — 4 directors × 1 craft × 3 actors = 4 craft / 12
// actors — one craft and one actor over the founding ceiling.
//
// So scenes 2 and 6 do not call `contendedStudio()` (which hard-codes
// `CONTENDED_DEPTH` = 3/3/9/6 and a fixed two-leader greenlight dance that
// cannot produce 3- or 4-way concurrency). They call the SAME lower-level
// primitives `contendedStudio()` itself is built from — `managedStudio`,
// `withCash` (`tests/contracts/_contractFixtures.ts`), `commissionFor`,
// `freePackageOrNull` (`tests/_m4Fixtures.ts`) — at a deeper roster, and where
// the founding applicant ceiling still falls short (scene 6's 4th craft and
// 12th actor) they mint the difference through the public, deterministic,
// RNG-free `createTalent` door (`tests/actions.test.ts` proves it never
// touches `state.rngState`) followed by `signContract`. Every action used is
// public; nothing is faked or hand-assembled — the roster is simply grown
// through the same front door a player uses, one talent further than the
// founding draft alone reaches.
//
// Two extra facilities are placed (a `stage-standard` and a `scenery-shop`,
// the same blueprint P05's own scenario 3 placed) so a third/fourth
// production has an INDEPENDENT stage and scenery slot rather than waiting to
// steal one freed by another picture — which would only reproduce the
// "chained successor always arrives exactly one tick after the window it
// wanted" race the exploration for this script had to prove out by hand.
// `commissionSet` seeds the placed stage with a standing set (mirroring P05
// scenario 3) so a production actually binds to it instead of waiting
// indefinitely for a founding stage's `set-unavailable` allocator branch.
//
// Every scenario also runs its own machine assertions HERE (level 1 of the
// proof pyramid), on the NORMALIZED state, exactly as P05 does.

import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyActions, tick } from '../src/core/index.ts'
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
import { releaseProjection } from '../bridge/release.ts'
import { contendedStudio, freePackage, freePackageOrNull, commissionFor } from '../tests/_m4Fixtures.ts'
import { managedStudio, withCash } from '../tests/contracts/_contractFixtures.ts'

const GENERATOR = 'scripts/gen-p06-visual-oracle-fixtures.mts'
const OUTPUT_DIRECTORY = 'ui/e2e/p06-visual-oracle-v1'
const SEED = 'p06-visual-oracle-v1'

// ── P06 ledger ───────────────────────────────────────────────────────────────
const LEDGER = {
  productionA: 'prod-0000', // the release-ready / committed picture (scenes 3,4,5,6)
  productionB: 'prod-0001', // the second Post occupant / "active" picture (scenes 2,6)
  productionC: 'prod-0002', // the wrapped-and-waiting picture (scenes 2,6)
  postFacility: 'facility-post-building',
  postBuildingId: 'post',
  placedStageFacility: 'facility-stage-1',
  placedSceneryFacility: 'facility-scenery-shop-2',
  writerA: 't-p06-writer-a',
  writerB: 't-p06-writer-b',
  writerC: 't-p06-writer-c',
  companyA: {
    director: 't-p06-director-a',
    lead: 't-p06-lead-a',
    antagonist: 't-p06-antagonist-a',
    support: 't-p06-support-a',
    craft: 't-p06-craft-a',
  },
  companyB: {
    director: 't-p06-director-b',
    lead: 't-p06-lead-b',
    antagonist: 't-p06-antagonist-b',
    support: 't-p06-support-b',
    craft: 't-p06-craft-b',
  },
  companyC: {
    director: 't-p06-director-c',
    lead: 't-p06-lead-c',
    antagonist: 't-p06-antagonist-c',
    support: 't-p06-support-c',
    craft: 't-p06-craft-c',
  },
} as const

// ── helpers (shape copied verbatim from gen-p05-visual-oracle-fixtures.mts) ──

function sha256(bytes: string): string {
  return createHash('sha256').update(bytes, 'utf8').digest('hex')
}

function fail(message: string): never {
  throw new Error(`gen-p06-visual-oracle-fixtures: ${message}`)
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
  if (state.operations.mode !== 'managed') fail('operations not managed')
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

/** Drive shooting decisions for EXACTLY the named productions this week (P05 idiom). */
function driveTakes(state: GameState, productionIds: readonly string[]): GameState {
  let next = state
  for (const id of productionIds) {
    if (next.operations.mode !== 'managed') continue
    const workflow = next.operations.workflows.find((c) => c.productionId === id)
    if (workflow === undefined || workflow.phase !== 'shooting' || workflow.shootingTask === null)
      continue
    const production = next.studio.activeProductions.find((p) => p.id === id)
    if (production === undefined) continue
    if (workflow.shootingTask.status === 'unassigned') {
      next = applyActions(next, [
        { kind: 'assignShootingDirector', productionId: id, directorId: production.directorId },
      ])
    }
    const settled = next.operations.mode === 'managed'
      ? next.operations.workflows.find((c) => c.productionId === id)
      : undefined
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
 * P06 ledger, longest-token-first, with pre-image counts asserted and target
 * collisions refused; the result must re-import cleanly.
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

/** The A/B/C-company renames for one production (director, 3 cast, craft, writer). */
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

function operationsRow(state: GameState, productionId: string) {
  const row = managedSnapshot(state).productionOperations?.find(
    (candidate) => candidate.productionId === productionId,
  )
  if (row === undefined) fail(`no operations row for ${productionId}`)
  return row!
}

/** The `post` building is idle: no workflow anywhere holds a `post` reservation. */
function postIdle(state: GameState): boolean {
  if (state.operations.mode !== 'managed') return true
  return state.operations.workflows.every(
    (workflow) => !workflow.reservations.some((r) => r.capability === 'post'),
  )
}

// ── the shared single-production base walk (scenes 1, 3, 4, 5) ──────────────
//
// contendedStudio founds the lot, greenlights two leaders at tick 2, and
// leaves two accepted screenplays waiting — exactly as in P05. P06A adds ONE
// law P05 predates: Release Ready (remainingTicks === 1) now HOLDS until an
// explicit `commitPictureToRelease` — nothing auto-releases any more. So this
// copy of the P05 `base()` idiom commits each leader the moment it reaches
// Release Ready, which is the ONLY way to reproduce "the leaders clear the
// board" under current law; without it the two leaders sit at Release Ready
// forever and `base()` never reaches `activeProductions.length === 0`.

type Base = { state: GameState; readyProjectIds: readonly string[]; leaderIds: readonly string[] }

function base(seedSuffix: string): Base {
  const { state, readyProjectIds, productionIds } = contendedStudio(`${SEED}-${seedSuffix}`)
  let next = state
  for (let week = 0; week < 20 && next.studio.activeProductions.length > 0; week++) {
    next = driveTakes(next, productionIds)
    for (const id of productionIds) {
      const production = next.studio.activeProductions.find((p) => p.id === id)
      if (production === undefined) continue
      if (production.remainingTicks !== 1) continue
      const already = next.releaseAuthority.commitments.some((c) => c.productionId === id)
      if (already) continue
      next = applyActions(next, [{ kind: 'commitPictureToRelease', productionId: id }])
    }
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

// ── the deep-founding walk (scenes 2, 6) ─────────────────────────────────────
//
// See the file header for why `contendedStudio()` cannot reach this
// concurrency. This is the SAME founding shape (`managedStudio` + `withCash`,
// `commissionFor` + `acceptScript` in dev-casting-capacity-sized pairs,
// `freePackageOrNull` + `greenlightScriptProject`) at a chosen depth, with the
// founding applicant ceiling topped up through `createTalent` + `signContract`
// when the scene needs more than the ceiling provides.

const DEEP_CASH = 300_000_000

function deepFoundedStudio(
  seedSuffix: string,
  depth: { actor: number; writer: number; director: number; craft: number },
  extraCraft: number,
  extraActors: number,
): GameState {
  let state = withCash(managedStudio(`${SEED}-${seedSuffix}`, depth), DEEP_CASH)
  for (let i = 0; i < extraCraft; i++) {
    state = applyActions(state, [
      {
        kind: 'createTalent',
        talent: {
          name: `Extra Craft ${String(i)}`,
          role: 'craft',
          age: 40,
          actual: { warmth: 0, gravity: 0, physicality: 0 },
          potentialTier: 'Steady',
          workEthic: 60,
        },
      },
    ])
    const id = state.talent[state.talent.length - 1]!.id
    state = applyActions(state, [{ kind: 'signContract', talentId: id, termWeeks: 104 }])
  }
  for (let i = 0; i < extraActors; i++) {
    state = applyActions(state, [
      {
        kind: 'createTalent',
        talent: {
          name: `Extra Actor ${String(i)}`,
          role: 'actor',
          age: 35,
          actual: { warmth: 0, gravity: 0, physicality: 0 },
          potentialTier: 'Steady',
          workEthic: 60,
        },
      },
    ])
    const id = state.talent[state.talent.length - 1]!.id
    state = applyActions(state, [{ kind: 'signContract', talentId: id, termWeeks: 104 }])
  }
  return state
}

/**
 * Commission + accept `count` concepts starting at `startIndex`, two at a time
 * (dev-casting capacity = 2). `startIndex` lets a scenario call this more than
 * once without re-claiming a concept/writer index an earlier call already used.
 */
function commissionAndAccept(
  state: GameState,
  count: number,
  startIndex = 0,
): { state: GameState; projectIds: string[] } {
  let next = state
  const alreadyKnown = new Set(next.scriptDevelopment.projects.map((p) => p.id))
  const projectIds: string[] = []
  let index = startIndex
  const endIndex = startIndex + count
  while (index < endIndex) {
    const batch = Math.min(2, endIndex - index)
    for (let i = 0; i < batch; i++) {
      next = applyActions(next, [
        { kind: 'commissionScript', project: commissionFor(next, index + i, index + i) },
      ])
    }
    next = tick(next)
    for (const project of next.scriptDevelopment.projects) {
      if (project.status !== 'review' || alreadyKnown.has(project.id) || projectIds.includes(project.id)) continue
      next = applyActions(next, [{ kind: 'acceptScript', projectId: project.id }])
      projectIds.push(project.id)
    }
    index += batch
  }
  if (projectIds.length !== count) fail(`commissionAndAccept: expected ${count} accepted, got ${projectIds.length}`)
  return { state: next, projectIds }
}

/** Place the one extra stage + one extra scenery shop the contention scenes need. */
function placeContentionFacilities(state: GameState): GameState {
  let next = applyActions(state, [
    { kind: 'placeFacility', placement: { blueprintId: 'stage-standard', origin: { gx: 23, gy: 20 } } },
  ])
  next = applyActions(next, [
    { kind: 'placeFacility', placement: { blueprintId: 'scenery-shop', origin: { gx: 6, gy: 2 } } },
  ])
  return next
}

/** Only assigns/schedules for ids explicitly passed — full manual pacing control. */
function driveRobust(state: GameState, ids: readonly string[]): GameState {
  let next = state
  for (const id of ids) {
    if (next.operations.mode !== 'managed') continue
    const workflow = next.operations.workflows.find((c) => c.productionId === id)
    if (workflow === undefined || workflow.phase !== 'shooting' || workflow.shootingTask === null) continue
    const production = next.studio.activeProductions.find((p) => p.id === id)
    if (production === undefined) continue
    if (workflow.shootingTask.status === 'unassigned') {
      next = applyActions(next, [
        { kind: 'assignShootingDirector', productionId: id, directorId: production.directorId },
      ])
    }
    const settled = next.operations.mode === 'managed'
      ? next.operations.workflows.find((c) => c.productionId === id)
      : undefined
    if (settled?.shootingTask?.status === 'ready') {
      next = applyActions(next, [{ kind: 'scheduleShootingTake', productionId: id }])
    }
  }
  return next
}

function allParkedAtShootingUnassigned(state: GameState, ids: readonly string[]): boolean {
  if (state.operations.mode !== 'managed') return false
  return ids.every((id) => {
    const w = (state.operations.mode === 'managed' ? state.operations.workflows : []).find(
      (c) => c.productionId === id,
    )
    return w?.phase === 'shooting' && w.shootingTask?.status === 'unassigned'
  })
}

function heldSinceWeekOf(state: GameState, id: string): number {
  const w = state.operations.mode === 'managed'
    ? state.operations.workflows.find((c) => c.productionId === id)
    : undefined
  return w?.bindings?.heldSinceWeek ?? 0
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

/** 1 — Idle Post: a picture actively shooting, nothing in any post-family state. */
function scenario1(): ScenarioFixture {
  const assertions: string[] = []
  const { state, readyProjectIds } = base('s1')
  const { state: greenlit, productionId } = greenlightAt(state, readyProjectIds[0]!, 16)
  const at20 = advanceTo(greenlit, 20)
  const driven = driveTakes(at20, [productionId])
  const scheduled = tick(driven)
  const renames: Rename[] = [
    [productionId, LEDGER.productionA],
    ...companyRenames(scheduled, productionId, LEDGER.companyA, LEDGER.writerA),
  ]
  const { state: normalized, record } = normalize(scheduled, renames)

  const workflow = workflowOf(normalized, LEDGER.productionA)
  assertEq(workflow.phase, 'shooting', 's1: production is actively shooting')
  const row = operationsRow(normalized, LEDGER.productionA)
  const POST_FAMILY = new Set([
    'wrapped-waiting-for-post',
    'post-handoff',
    'release-ready',
    'release-committed',
  ])
  const rows = managedSnapshot(normalized).productionOperations ?? []
  for (const r of rows) {
    assertTrue(!POST_FAMILY.has(r.operationalState), `s1: ${r.productionId} not in post-family (${r.operationalState})`)
  }
  assertTrue(!POST_FAMILY.has(row.operationalState), 's1: the shooting picture itself is not post-family')
  assertTrue(postIdle(normalized), 's1: post building idle (no workflow holds a post reservation)')
  assertions.push(
    'no productionOperations row has operationalState in the post family',
    'no workflow anywhere holds a `post` capability reservation',
    `production ${LEDGER.productionA} is actively shooting (phase=shooting)`,
  )
  return {
    scenarioId: 'idle-post',
    week: normalized.market.tick,
    state: normalized,
    normalization: record,
    derivation: [
      'base → greenlight ready screenplay at week 16',
      'advance undriven to week 20, then drive one week (assign + schedule)',
      'normalize onto the ledger (prod-0000 + company + writer)',
    ],
    assertions,
    inMemoryProofAnchors: [],
  }
}

/** 3 — Active Finishing: one picture in postProduction, director+craft at post. */
function activeFinishingWalk(seedSuffix: string, week: number): {
  state: GameState
  productionId: string
} {
  const { state, readyProjectIds } = base(seedSuffix)
  const { state: greenlit, productionId } = greenlightAt(state, readyProjectIds[0]!, 15)
  let next = advanceTo(greenlit, 19, [productionId])
  next = driveTakes(next, [productionId])
  next = tick(next) // shooting task completes (still shooting phase)
  next = tick(next) // wrap → post-handoff, remainingTicks 3
  assertEq(next.market.tick, week, `activeFinishingWalk: expected week ${String(week)}`)
  return { state: next, productionId }
}

function scenario3(): ScenarioFixture {
  const { state: at21, productionId } = activeFinishingWalk('s3', 21)
  const renames: Rename[] = [
    [productionId, LEDGER.productionA],
    ...companyRenames(at21, productionId, LEDGER.companyA, LEDGER.writerA),
  ]
  const { state: normalized, record } = normalize(at21, renames)

  const workflow = workflowOf(normalized, LEDGER.productionA)
  assertEq(workflow.phase, 'postProduction', 's3: postProduction phase')
  const production = productionOf(normalized, LEDGER.productionA)
  assertEq(production.remainingTicks, 3, 's3: remainingTicks 3 (freshly entered Post)')
  const row = operationsRow(normalized, LEDGER.productionA)
  assertEq(row.operationalState, 'post-handoff', 's3: closed state post-handoff')
  const presence = managedSnapshot(normalized).presence?.people ?? []
  const atPost = presence.filter(
    (p) => p.facilityId === LEDGER.postFacility && p.ownerId === LEDGER.productionA,
  )
  const atPostIds = new Set(atPost.map((p) => p.talentId))
  assertEq(atPostIds.size, 2, 's3: exactly Director + craft at post')
  assertTrue(atPostIds.has(LEDGER.companyA.director), 's3: director at post')
  assertTrue(atPostIds.has(LEDGER.companyA.craft), 's3: craft at post')
  for (const member of [LEDGER.companyA.lead, LEDGER.companyA.antagonist, LEDGER.companyA.support]) {
    assertTrue(!atPostIds.has(member), `s3: cast member ${member} released to roster, not at post`)
  }
  assertTrue(!atPostIds.has(LEDGER.writerA), 's3: writer places no body')
  return {
    scenarioId: 'active-finishing',
    week: 21,
    state: normalized,
    normalization: record,
    derivation: [
      'base → greenlight at week 15; drive at week 19 (assign + schedule); one tick completes the take',
      'one more tick: the wrap fires and Post is free, so the wrap hands off IMMEDIATELY (remainingTicks 3)',
      'normalize onto the ledger (prod-0000 + company + writer)',
    ],
    assertions: [
      'workflow phase postProduction, remainingTicks 3',
      'closed state post-handoff',
      'presence: exactly Director + craft at facility-post-building; cast and writer never',
    ],
    inMemoryProofAnchors: [],
  }
}

/** 4 — Release Ready: remainingTicks 1, uncommitted, holds across an extra tick. */
function scenario4(): ScenarioFixture {
  const { state: at21, productionId } = activeFinishingWalk('s4', 21)
  const at23 = advanceTo(at21, 23) // rt 3→2→1 (postProduction releases nothing new)
  const renames: Rename[] = [
    [productionId, LEDGER.productionA],
    ...companyRenames(at23, productionId, LEDGER.companyA, LEDGER.writerA),
  ]
  const { state: normalized, record } = normalize(at23, renames)

  const workflow = workflowOf(normalized, LEDGER.productionA)
  assertEq(workflow.phase, 'releaseReady', 's4: releaseReady phase')
  const production = productionOf(normalized, LEDGER.productionA)
  assertEq(production.remainingTicks, 1, 's4: remainingTicks 1')
  assertEq(normalized.releaseAuthority.commitments.length, 0, 's4: uncommitted (no rows)')
  const row = operationsRow(normalized, LEDGER.productionA)
  assertEq(row.operationalState, 'release-ready', 's4: closed state release-ready')
  const decision = releaseProjection(normalized).decisions.find((d) => d.productionId === LEDGER.productionA)
  if (decision === undefined) fail('s4: no release projection decision row')
  assertEq(decision!.authorityState, 'ready-uncommitted', 's4: projection authorityState ready-uncommitted')
  assertEq(decision!.legalCommit, true, 's4: projection legalCommit true')
  assertEq(decision!.commitmentId, null, 's4: projection commitmentId null')

  // in-memory proof anchor: one more tick HOLDS — still ready, never released.
  const held = tick(normalized)
  assertEq(held.market.tick, normalized.market.tick + 1, 's4-held: week advances')
  assertTrue(held.studio.activeProductions.some((p) => p.id === LEDGER.productionA), 's4-held: still active')
  const heldProduction = productionOf(held, LEDGER.productionA)
  assertEq(heldProduction.remainingTicks, 1, 's4-held: remainingTicks still 1 (holds)')
  assertEq(held.releaseAuthority.commitments.length, 0, 's4-held: still uncommitted')
  assertTrue(
    !held.studio.releasedFilms.some((f) => f.productionId === LEDGER.productionA),
    's4-held: not released',
  )

  return {
    scenarioId: 'release-ready',
    week: 23,
    state: normalized,
    normalization: record,
    derivation: [
      'base → greenlight at week 15; drive+wrap to Post at week 21 (see active-finishing)',
      'advance undriven to week 23 (postProduction 3→2→1, releaseReady entered)',
      'normalize onto the ledger (prod-0000 + company + writer)',
    ],
    assertions: [
      'workflow phase releaseReady, remainingTicks 1',
      'releaseAuthority.commitments empty (uncommitted)',
      'closed state release-ready; projection row authorityState=ready-uncommitted, legalCommit=true, commitmentId=null',
    ],
    inMemoryProofAnchors: [
      'tick(fixture) → remainingTicks stays 1, releaseAuthority stays empty, production remains active and unreleased (the P06A hold law)',
    ],
  }
}

/** 5 — Committed to Release: commitPictureToRelease, no time elapses, one more tick releases it. */
function scenario5(): ScenarioFixture {
  const { state: at21, productionId } = activeFinishingWalk('s5', 21)
  const at23 = advanceTo(at21, 23)
  const beforeCommit = at23.market.tick
  const committed = applyActions(at23, [{ kind: 'commitPictureToRelease', productionId }])
  assertEq(committed.market.tick, beforeCommit, 's5: commit advances no time')
  const renames: Rename[] = [
    [productionId, LEDGER.productionA],
    ...companyRenames(committed, productionId, LEDGER.companyA, LEDGER.writerA),
  ]
  const { state: normalized, record } = normalize(committed, renames)

  assertEq(normalized.releaseAuthority.commitments.length, 1, 's5: exactly one commitment row')
  const commitment = normalized.releaseAuthority.commitments[0]!
  assertEq(commitment.productionId, LEDGER.productionA, 's5: commitment names the exact production')
  assertEq(commitment.commitmentId, `release-commitment-${LEDGER.productionA}`, 's5: deterministic commitment id')
  const row = operationsRow(normalized, LEDGER.productionA)
  assertEq(row.operationalState, 'release-committed', 's5: closed state release-committed')
  const releaseEvent = normalized.studioEvents.rows.find(
    (r) => r.kind === 'releaseCommitted' && (r as { productionId?: string }).productionId === LEDGER.productionA,
  )
  assertTrue(releaseEvent !== undefined, 's5: a releaseCommitted studioEvent exists for the exact production')
  const decision = releaseProjection(normalized).decisions.find((d) => d.productionId === LEDGER.productionA)
  if (decision === undefined) fail('s5: no release projection decision row')
  assertEq(decision!.authorityState, 'committed', 's5: projection authorityState committed')
  assertEq(decision!.legalCommit, false, 's5: projection legalCommit false (already committed)')
  assertEq(decision!.commitmentId, `release-commitment-${LEDGER.productionA}`, 's5: projection carries the exact commitment id')

  // in-memory proof anchor: one more tick releases EXACTLY this picture.
  const released = tick(normalized)
  assertEq(released.market.tick, normalized.market.tick + 1, 's5-after: week advances')
  assertTrue(
    !released.studio.activeProductions.some((p) => p.id === LEDGER.productionA),
    's5-after: no longer active',
  )
  assertTrue(
    released.studio.releasedFilms.some((f) => f.productionId === LEDGER.productionA),
    's5-after: releasedFilms gains exactly this picture',
  )
  assertEq(
    released.releaseAuthority.commitments.length,
    0,
    's5-after: the commitment row is pruned atomically on release',
  )

  return {
    scenarioId: 'committed-to-release',
    week: 23,
    state: normalized,
    normalization: record,
    derivation: [
      'base → greenlight at week 15; drive+wrap to Post at week 21; advance to week 23 (Release Ready)',
      'commitPictureToRelease — persists one commitment row and one releaseCommitted event; no tick',
      'normalize onto the ledger (prod-0000 + company + writer)',
    ],
    assertions: [
      'commit advances no time (market.tick unchanged)',
      'exactly one releaseAuthority row, commitmentId=release-commitment-prod-0000',
      'closed state release-committed; a releaseCommitted studioEvent exists for the exact production',
      'projection row authorityState=committed, legalCommit=false, exact commitmentId',
    ],
    inMemoryProofAnchors: [
      'tick(committed fixture) → releasedFilms gains exactly prod-0000, activeProductions loses it, the commitment row is pruned',
    ],
  }
}

/** 2 — Wrapped, Waiting for Post: two productions fill Post's 2 slots, a third wraps and blocks. */
function scenario2(): ScenarioFixture {
  const depth = { actor: 9, writer: 6, director: 3, craft: 3 } // = CONTENDED_DEPTH; the founding ceiling
  let state = deepFoundedStudio('s2', depth, 0, 0)
  state = placeContentionFacilities(state)
  // Idle a few weeks BEFORE commissioning so every production id this scene
  // mints lands safely clear of the ledger's own prod-0000/0001/0002 targets —
  // greenlighting at tick 1 or 2 here would collide the RAW id with a rename
  // TARGET used later in this same scene (self-inflicted, caught loudly by
  // normalize()'s target-collision refusal; the fix is simply not to be there).
  state = advanceTo(state, 5)

  const { state: withProjects, projectIds } = commissionAndAccept(state, 2)
  state = withProjects

  // occupant 1 + occupant 2, greenlit the SAME week (both founding stages).
  const pkgOcc1 = freePackageOrNull(state, projectIds[0]!)
  if (pkgOcc1 === null) fail('s2: occupant1 package unavailable from the free roster')
  state = applyActions(state, [{ kind: 'greenlightScriptProject', production: pkgOcc1 }])
  const occ1 = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id
  const pkgOcc2 = freePackageOrNull(state, projectIds[1]!)
  if (pkgOcc2 === null) fail('s2: occupant2 package unavailable from the free roster')
  state = applyActions(state, [{ kind: 'greenlightScriptProject', production: pkgOcc2 }])
  const occ2 = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id

  // wait for the placed stage to complete (16wk is the binding constraint), then
  // seed it with a standing set (mirrors P05 scenario 3's commissionSet idiom).
  state = advanceTo(state, 20)
  state = applyActions(state, [
    {
      kind: 'commissionSet',
      commission: { blueprintId: 'set-house-generic', stageFacilityId: LEDGER.placedStageFacility },
    },
  ])
  state = advanceTo(state, 24)

  // a 3rd project + package can only be commissioned/greenlit once occ1/occ2
  // reach rehearsal — dev-casting capacity is 2, so a 3rd concept commissioned
  // any earlier queues rather than throwing (freePackageOrNull checks talent
  // only, never facility capacity).
  const { state: withThirdProject, projectIds: thirdProjectIds } = commissionAndAccept(state, 1, 2)
  state = withThirdProject
  let blockedId: string | null = null
  for (let i = 0; i < 12 && blockedId === null; i++) {
    state = tick(state)
    const w1 = state.operations.mode === 'managed'
      ? state.operations.workflows.find((c) => c.productionId === occ1)
      : undefined
    if (w1?.phase !== 'rehearsal' && w1?.phase !== 'shooting') continue
    const before = state.studio.activeProductions.length
    const pkg3 = freePackageOrNull(state, thirdProjectIds[0]!)
    if (pkg3 === null) continue
    state = applyActions(state, [{ kind: 'greenlightScriptProject', production: pkg3 }])
    if (state.studio.activeProductions.length === before) fail('s2: 3rd greenlight was queued, not admitted')
    blockedId = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id
  }
  if (blockedId === null) fail('s2: could not greenlight the blocked production')
  const trio = [occ1, occ2, blockedId]

  // park all three at shooting/unassigned, then wait out the worst-case
  // scenery transit (SCENERY_LOAD_IN_WEEKS_MAX = 5) before releasing them
  // together, so none straggles into a `scenery-load-in` blocker instead of
  // reaching the wrap-attempt in lockstep.
  for (let i = 0; i < 30 && !allParkedAtShootingUnassigned(state, trio); i++) state = tick(state)
  if (!allParkedAtShootingUnassigned(state, trio)) fail('s2: trio did not reach shooting/unassigned together')
  const targetWeek = Math.max(...trio.map((id) => heldSinceWeekOf(state, id))) + 5
  state = advanceTo(state, targetWeek)
  state = driveRobust(state, trio)

  // drive to the first week the blocked production reads wrapped-waiting-for-post.
  let contentionWeek: number | null = null
  for (let i = 0; i < 6 && contentionWeek === null; i++) {
    state = driveRobust(state, trio)
    state = tick(state)
    const row = operationsRow(state, blockedId)
    if (row.operationalState === 'wrapped-waiting-for-post') contentionWeek = state.market.tick
  }
  if (contentionWeek === null) fail('s2: the trio never produced genuine Post contention')

  const renames: Rename[] = [
    [occ1, LEDGER.productionA],
    [occ2, LEDGER.productionB],
    [blockedId, LEDGER.productionC],
    ...companyRenames(state, occ1, LEDGER.companyA, LEDGER.writerA),
    ...companyRenames(state, occ2, LEDGER.companyB, LEDGER.writerB),
    ...companyRenames(state, blockedId, LEDGER.companyC, LEDGER.writerC),
  ]
  const { state: normalized, record } = normalize(state, renames)

  const workflowC = workflowOf(normalized, LEDGER.productionC)
  assertEq(workflowC.phase, 'shooting', 's2: blocked production phase shooting')
  assertEq(workflowC.reservations.length, 0, 's2: blocked production holds zero reservations')
  assertEq(workflowC.blocker?.kind, 'facility-capacity', 's2: facility-capacity blocker')
  if (workflowC.blocker?.kind === 'facility-capacity') {
    assertEq(workflowC.blocker.capability, 'post', 's2: blocked on capability post')
    assertEq(workflowC.blocker.targetPhase, 'postProduction', 's2: targetPhase postProduction')
  }
  const productionC = productionOf(normalized, LEDGER.productionC)
  assertEq(productionC.remainingTicks, 4, 's2: remainingTicks held at 4')
  const rowC = operationsRow(normalized, LEDGER.productionC)
  assertEq(rowC.operationalState, 'wrapped-waiting-for-post', 's2: closed state wrapped-waiting-for-post')

  const rowA = operationsRow(normalized, LEDGER.productionA)
  const rowB = operationsRow(normalized, LEDGER.productionB)
  assertEq(rowA.operationalState, 'post-handoff', 's2: occupant A holds Post')
  assertEq(rowB.operationalState, 'post-handoff', 's2: occupant B holds Post')
  const workflowA = workflowOf(normalized, LEDGER.productionA)
  const workflowB = workflowOf(normalized, LEDGER.productionB)
  assertTrue(
    workflowA.reservations.some((r) => r.capability === 'post'),
    's2: A holds a post reservation',
  )
  assertTrue(
    workflowB.reservations.some((r) => r.capability === 'post'),
    's2: B holds a post reservation',
  )
  assertTrue(
    workflowA.reservations.find((r) => r.capability === 'post')!.facilityId !==
      workflowB.reservations.find((r) => r.capability === 'post')!.facilityId ||
      workflowA.reservations.find((r) => r.capability === 'post')!.slot !==
        workflowB.reservations.find((r) => r.capability === 'post')!.slot,
    's2: A and B hold DISTINCT post slots — Post is fully occupied, which is why C blocks',
  )

  return {
    scenarioId: 'wrapped-waiting-for-post',
    week: contentionWeek,
    state: normalized,
    normalization: record,
    derivation: [
      'deep-founded studio at CONTENDED_DEPTH (3/3/9/6) — the founding roster ceiling; no createTalent top-up needed',
      'place stage-standard@(23,20) and scenery-shop@(6,2); commission a standing set on the placed stage once it completes (wk20)',
      'greenlight occupant A and occupant B the same week on the two founding stages',
      'once A/B reach rehearsal (dev-casting frees), greenlight C on the placed stage+scenery',
      'park all three at shooting/unassigned; wait out the worst-case scenery transit (5wk); release together',
      'drive to the first week C reads wrapped-waiting-for-post — A and B both already hold Post (2/2 slots)',
      'normalize onto the ledger (prod-0000/0001/0002 + three companies + three writers)',
    ],
    assertions: [
      'C: phase shooting, zero reservations, facility-capacity(post) blocker, remainingTicks held at 4',
      'closed state wrapped-waiting-for-post for C',
      'A and B: closed state post-handoff, each holding a DISTINCT post reservation slot (Post is 2-for-2 full)',
    ],
    inMemoryProofAnchors: [],
  }
}

/** 6 — Multi-Picture Contention: 4 distinct pictures at 4 distinct post-family states. */
function scenario6(): ScenarioFixture {
  // 4 concurrently-active pictures need 4 directors × 1 craft × 3 actors — one
  // craft and one actor over the founding applicant ceiling (HIRING_DRAFT_CRAFT
  // = 3, HIRING_DRAFT_ACTORS = 11). Top up by exactly the shortfall via the
  // public createTalent + signContract doors (see file header).
  const depth = { actor: 12, writer: 8, director: 4, craft: 3 }
  let state = deepFoundedStudio('s6', depth, 1, 1)
  state = placeContentionFacilities(state)
  // See scenario2's identical note: idle clear of tick 0/1/2 before minting
  // any production id, so nothing this scene greenlights can literally equal
  // (or later collide against) the ledger's own prod-0000/0001/0002 targets.
  state = advanceTo(state, 5)

  const { state: withProjects, projectIds } = commissionAndAccept(state, 4)
  state = withProjects

  // R: greenlit ALONE first, on a founding stage; driven to Release Ready and
  // left uncommitted — it wraps and frees its stage/scenery long before the
  // contention trio even starts, so nothing is stolen out from under it.
  const pkgR = freePackageOrNull(state, projectIds[0]!)
  if (pkgR === null) fail('s6: R package unavailable from the free roster')
  state = applyActions(state, [{ kind: 'greenlightScriptProject', production: pkgR }])
  const idR = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id
  for (;;) {
    const p = state.studio.activeProductions.find((x) => x.id === idR)
    if (p === undefined) fail('s6: R vanished before Release Ready')
    if (p.remainingTicks === 1) break
    state = driveRobust(state, [idR])
    state = tick(state)
  }

  // wait for the placed stage to complete, then seed it with a standing set.
  state = advanceTo(state, 20)
  state = applyActions(state, [
    {
      kind: 'commissionSet',
      commission: { blueprintId: 'set-house-generic', stageFacilityId: LEDGER.placedStageFacility },
    },
  ])
  state = advanceTo(state, 24)

  // occupant (active) + occupant (filler, needed only to legitimately fill
  // Post's 2nd slot) — same week, on the two now-free founding stages.
  const pkgActive = freePackageOrNull(state, projectIds[1]!)
  if (pkgActive === null) fail('s6: active-occupant package unavailable')
  state = applyActions(state, [{ kind: 'greenlightScriptProject', production: pkgActive }])
  const idActive = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id
  const pkgFiller = freePackageOrNull(state, projectIds[2]!)
  if (pkgFiller === null) fail('s6: filler-occupant package unavailable')
  state = applyActions(state, [{ kind: 'greenlightScriptProject', production: pkgFiller }])
  const idFiller = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id

  // blocked: greenlit once the active occupant reaches rehearsal (dev-casting frees).
  let idBlocked: string | null = null
  for (let i = 0; i < 12 && idBlocked === null; i++) {
    state = tick(state)
    const wActive = state.operations.mode === 'managed'
      ? state.operations.workflows.find((c) => c.productionId === idActive)
      : undefined
    if (wActive?.phase !== 'rehearsal' && wActive?.phase !== 'shooting') continue
    const before = state.studio.activeProductions.length
    const pkgBlocked = freePackageOrNull(state, projectIds[3]!)
    if (pkgBlocked === null) continue
    state = applyActions(state, [{ kind: 'greenlightScriptProject', production: pkgBlocked }])
    if (state.studio.activeProductions.length === before) fail('s6: blocked greenlight was queued, not admitted')
    idBlocked = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id
  }
  if (idBlocked === null) fail('s6: could not greenlight the blocked production')
  const trio = [idActive, idFiller, idBlocked]

  for (let i = 0; i < 30 && !allParkedAtShootingUnassigned(state, trio); i++) state = tick(state)
  if (!allParkedAtShootingUnassigned(state, trio)) fail('s6: trio did not reach shooting/unassigned together')
  const targetWeek = Math.max(...trio.map((id) => heldSinceWeekOf(state, id))) + 5
  state = advanceTo(state, targetWeek)
  state = driveRobust(state, trio)

  let contentionWeek: number | null = null
  for (let i = 0; i < 6 && contentionWeek === null; i++) {
    state = driveRobust(state, trio)
    state = tick(state)
    const row = operationsRow(state, idBlocked)
    if (row.operationalState === 'wrapped-waiting-for-post') contentionWeek = state.market.tick
  }
  if (contentionWeek === null) fail('s6: the trio never produced genuine Post contention')
  assertEq(
    operationsRow(state, idR).operationalState,
    'release-ready',
    's6: R is still sitting at Release Ready (uncommitted) at the contention week',
  )

  // ── exact-ID isolation, proven on the PRE-normalized walk ────────────────
  const othersBefore = JSON.stringify({
    active: operationsRow(state, idActive),
    blocked: operationsRow(state, idBlocked),
  })
  const committedInMemory = applyActions(state, [{ kind: 'commitPictureToRelease', productionId: idR }])
  const othersAfter = JSON.stringify({
    active: operationsRow(committedInMemory, idActive),
    blocked: operationsRow(committedInMemory, idBlocked),
  })
  assertEq(othersAfter, othersBefore, 's6: committing R leaves the active/blocked rows byte-identical')
  const decisionRForCommit = releaseProjection(state).decisions.find((d) => d.productionId === idR)
  if (decisionRForCommit === undefined) fail('s6: no release projection row for R before commit')
  assertEq(decisionRForCommit!.authorityState, 'ready-uncommitted', 's6: R projection ready-uncommitted pre-commit')
  assertEq(decisionRForCommit!.legalCommit, true, 's6: R projection legalCommit true pre-commit')

  const renames: Rename[] = [
    [idR, LEDGER.productionA],
    [idActive, LEDGER.productionB],
    [idBlocked, LEDGER.productionC],
    ...companyRenames(state, idR, LEDGER.companyA, LEDGER.writerA),
    ...companyRenames(state, idActive, LEDGER.companyB, LEDGER.writerB),
    ...companyRenames(state, idBlocked, LEDGER.companyC, LEDGER.writerC),
  ]
  const { state: normalized, record } = normalize(state, renames)

  const rowA = operationsRow(normalized, LEDGER.productionA)
  const rowB = operationsRow(normalized, LEDGER.productionB)
  const rowC = operationsRow(normalized, LEDGER.productionC)
  assertEq(rowA.operationalState, 'release-ready', 's6: A (exact id) = release-ready')
  assertEq(rowB.operationalState, 'post-handoff', 's6: B (exact id) = post-handoff (active)')
  assertEq(rowC.operationalState, 'wrapped-waiting-for-post', 's6: C (exact id) = wrapped-waiting-for-post')
  const productionC = productionOf(normalized, LEDGER.productionC)
  assertEq(productionC.remainingTicks, 4, 's6: C remainingTicks held at 4')
  assertEq(normalized.releaseAuthority.commitments.length, 0, 's6: A is uncommitted in the saved fixture')
  const decisionA = releaseProjection(normalized).decisions.find((d) => d.productionId === LEDGER.productionA)
  if (decisionA === undefined) fail('s6: no release projection row for A')
  assertEq(decisionA!.authorityState, 'ready-uncommitted', 's6: A projection ready-uncommitted')
  assertEq(decisionA!.legalCommit, true, 's6: A projection legalCommit true')

  // distinct-id sanity: all three exact ids differ, and none is the unrenamed filler.
  assertTrue(
    new Set([LEDGER.productionA, LEDGER.productionB, LEDGER.productionC]).size === 3,
    's6: three distinct exact ids',
  )

  return {
    scenarioId: 'multi-picture-contention',
    week: contentionWeek,
    state: normalized,
    normalization: record,
    derivation: [
      'deep-founded studio (4 directors/3+1 craft/12+... actors — top up craft+actor by exactly the founding ceiling shortfall via createTalent+signContract)',
      'place stage-standard@(23,20) + scenery-shop@(6,2); seed the placed stage with a standing set once it completes',
      'greenlight R alone first; drive to Release Ready and hold uncommitted (wraps + frees its stage/scenery long before the trio starts)',
      'greenlight the active occupant + a filler occupant the same week on the two now-free founding stages',
      'once the active occupant reaches rehearsal, greenlight the blocked production on the placed stage+scenery',
      'park the trio at shooting/unassigned; wait out worst-case scenery transit; release together',
      'drive to the first week the blocked production reads wrapped-waiting-for-post — R still sits at Release Ready throughout',
      'isolation proof (pre-normalization): commitPictureToRelease on R leaves the active/blocked rows byte-identical',
      'normalize onto the ledger (prod-0000/0001/0002 + three companies + three writers; the filler occupant keeps its raw engine id)',
    ],
    assertions: [
      'A (prod-0000): release-ready, uncommitted, projection ready-uncommitted/legalCommit=true',
      'B (prod-0001): post-handoff (active, holding a post reservation)',
      'C (prod-0002): wrapped-waiting-for-post, zero reservations, facility-capacity(post) blocker, remainingTicks held at 4',
      'three distinct exact production ids, each independently verified by its own id',
    ],
    inMemoryProofAnchors: [
      'commitPictureToRelease(A) leaves the B and C operations rows byte-identical (exact-ID isolation)',
    ],
  }
}

// ── emission ─────────────────────────────────────────────────────────────────

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(repoRoot, OUTPUT_DIRECTORY)
mkdirSync(outDir, { recursive: true })

const fixtures: ScenarioFixture[] = [
  scenario1(),
  scenario2(),
  scenario3(),
  scenario4(),
  scenario5(),
  scenario6(),
]

const manifestFixtures = fixtures.map((fixture, index) => {
  const ordinal = index + 1
  const saveJson = exportSaveJson(fixture.state)
  const reimport = importSaveJson(saveJson)
  if (!reimport.ok) fail(`${fixture.scenarioId}: emitted save failed re-import`)
  const checkpoint = createBridgeRuntimeCheckpoint({
    sessionId: `p06-oracle-${fixture.scenarioId}`,
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
      sessionId: `p06-oracle-${fixture.scenarioId}`,
      schemaId: checkpoint.schemaId,
      stateDigest: checkpoint.currentStateDigest,
    },
    derivation: fixture.derivation,
    idNormalization: fixture.normalization,
    machineAssertions: fixture.assertions,
    inMemoryProofAnchors: fixture.inMemoryProofAnchors,
  }
})

const manifest = {
  fixtureId: 'p06-visual-oracle-v1',
  generator: GENERATOR,
  generatorSourceSha256: sha256(readFileSync(join(repoRoot, GENERATOR), 'utf8')),
  seed: SEED,
  ledger: LEDGER,
  normalizationLaw:
    'Exact-token rewrite onto the P06 fixture ledger, longest-token-first, pre-image counts asserted, target collisions refused, re-imported through importSaveJson; every machine assertion runs on the NORMALIZED state. The ledger identities are not mintable through public seams (production ids derive from the greenlight tick, talent ids from worldgen/authored/createTalent streams).',
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

console.log(`[gen-p06-visual-oracle-fixtures] emitted ${manifestFixtures.length} scenarios to ${OUTPUT_DIRECTORY}`)
for (const entry of manifestFixtures) {
  console.log(
    `  s${entry.ordinal} ${entry.scenarioId} week=${entry.week} save=${entry.save.sha256.slice(0, 12)} checkpoint=${entry.checkpoint.sha256.slice(0, 12)}`,
  )
}
