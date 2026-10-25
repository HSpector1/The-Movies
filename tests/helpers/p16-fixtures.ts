import { migrateToV48, validateSaveV45, stableStringify } from '../../src/core/save.js'
// ── P16 fixtures: genuine Save45 predecessors and one live hollywood route ─────
//
// Not a test file (vitest collects only tests/**/*.test.ts). Shared by the P16A/B/C REDs.
//
// Genuine inputs are read-only predecessor captures already in the repository:
//   * `week53`  — tests/fixtures/p14/genuine-v45-recovery-predecessors-1363/p13a-week-53.save45.json.gz
//                 (fresh origin, 4 entered rivals, 8 authored-start films, 20 simulated rival films,
//                 no player film).
//   * `week247` — tests/fixtures/p14/genuine-v45-binding-cash-1363/genuine-v45-binding-cash-count12.json.gz
//                 (same seed at week 247, 51 simulated rival films).
//   * `routeL6240` — tests/fixtures/p15/p15c2-frozen-v2-save45/route-l-week-6240.save45.json.gz
//                 (migration origin, 12 released player films, 5 simulated rival films).
// Nothing here edits a capture: every state is parsed fresh per call.
//
// The live route builds a fresh hollywood world and drives ONE player greenlight with the
// legacy `greenlight` action (the P15A.1 market route's own staffing rule), holds the picture to
// its ready week, commits it to release and ticks once more. Seeded RNG only.

import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { applyActions } from '../../src/core/actions.js'
import { assignmentRefusal } from '../../src/core/careerLifecycle.js'
import { beginFounding, FOUNDING_MINIMUMS } from '../../src/core/employment.js'
import { withCash } from '../contracts/_contractFixtures.js'
import { CONTENDED_DEPTH, commissionFor, freePackage } from '../_m4Fixtures.js'
import { MARKETING_BUDGET_LEVELS } from '../../src/core/grid.js'
import { initializeHollywood, studioEmployerId } from '../../src/core/hollywood.js'
import { importSave, migrateToLive } from '../../src/core/save.js'
import { resolveShape } from '../../src/core/shape.js'
import { tick } from '../../src/core/tick.js'
import { TUNING } from '../../src/core/tuning.js'
import { generateWorld } from '../../src/core/worldgen.js'
import type { FilmConcept, FilmShape, GameState } from '../../src/core/types.js'
import type { ConditionStage } from '../../src/core/corporateCondition.js'
import type { CorporateConditionReaders } from '../../src/core/rightsFinance.js'
import type { EstateHandoff } from '../../src/core/estate.js'

const FIXTURES = {
  week53: '../fixtures/p14/genuine-v45-recovery-predecessors-1363/p13a-week-53.save45.json.gz',
  week247: '../fixtures/p14/genuine-v45-binding-cash-1363/genuine-v45-binding-cash-count12.json.gz',
  routeL6240: '../fixtures/p15/p15c2-frozen-v2-save45/route-l-week-6240.save45.json.gz',
} as const
export type GenuineName = keyof typeof FIXTURES

/** The raw JSON text of a genuine Save45 capture. */
export function genuineV45Raw(name: GenuineName): string {
  return gunzipSync(readFileSync(new URL(FIXTURES[name], import.meta.url))).toString('utf8')
}

/** The genuine capture parsed, untouched (saveVersion 45). */
export function genuineV45Envelope(name: GenuineName): Record<string, unknown> {
  return JSON.parse(genuineV45Raw(name)) as Record<string, unknown>
}

/** Actual Save48 predecessor derived by the public chain from the unchanged genuine Save45 capture.
 * This is a migrated predecessor, not a genuine historical Save48 capture. */
export function genuinePredecessorEnvelope(name: GenuineName) {
  const own = validateSaveV45(genuineV45Envelope(name)), before = stableStringify(own)
  const predecessor = migrateToV48(own)
  if (stableStringify(own) !== before) throw new Error('P16 predecessor migration mutated its genuine input')
  return predecessor
}

/** The genuine capture imported through the public reader and lifted to the live era. */
export function liveFromGenuine(name: GenuineName): GameState {
  return migrateToLive(importSave(genuineV45Raw(name))).state as GameState
}

export const detached = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

// ── the live route ───────────────────────────────────────────────────────────

const SHAPE: FilmShape = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' }

function pickStaff(state: GameState, role: 'writer' | 'director' | 'actor', count: number, used: Set<string>): string[] {
  const out: string[] = []
  for (const person of [...state.talent].reverse()) {
    if (out.length === count) break
    if (person.role !== role || used.has(person.id) || studioEmployerId(state, person.id) !== null) continue
    if (role !== 'writer' && assignmentRefusal(state, person.id, state.market.tick, role) !== null) continue
    out.push(person.id)
    used.add(person.id)
  }
  if (out.length !== count) throw new Error(`route premise: seed ${state.seed} lacks ${count} free ${role}(s)`)
  return out
}

export function greenlightPayload(state: GameState, concept: FilmConcept, used = new Set<string>()) {
  const [writerId] = pickStaff(state, 'writer', 1, used)
  const [directorId] = pickStaff(state, 'director', 1, used)
  const [lead, antagonist, support] = pickStaff(state, 'actor', 3, used)
  return {
    conceptId: concept.id,
    shape: SHAPE,
    promise: { genre: concept.genre, intendedSegments: ['adult' as const],
      ranges: { intimacy: [-1, 1] as [number, number], tonalWeight: [-1, 1] as [number, number], kineticEnergy: [-1, 1] as [number, number] } },
    writerId: writerId!,
    directorId: directorId!,
    craftIds: [] as string[],
    cast: { lead: lead!, antagonist: antagonist!, support: support! },
    budget: {
      negative: concept.baseNegativeCost * resolveShape(SHAPE).budgetDemandMultiplier * state.era.costScale,
      marketing: MARKETING_BUDGET_LEVELS[0],
    },
  }
}

export const P16_ROUTE_SEED = 'p16a-mint-route-01'

/** A fresh hollywood world at week 0 (four entered rivals, eight authored-start films). */
export function freshHollywoodWorld(seed = P16_ROUTE_SEED): GameState {
  return initializeHollywood(generateWorld(seed), 'fresh')
}

export type MintRoute = {
  start: GameState
  /** The state right after the accepted greenlight, before any tick. */
  greenlit: GameState
  productionId: string
  conceptId: string
  /** The state at the ready week, after `commitPictureToRelease`, before the releasing tick. */
  committed: GameState
  /** The state after the releasing tick. */
  released: GameState
}

/** One player greenlight, held to its ready week, committed and released. */
export function mintRoute(seed = P16_ROUTE_SEED): MintRoute {
  const start = freshHollywoodWorld(seed)
  const concept = start.concepts[0]!
  const greenlit = applyActions(start, [{ kind: 'greenlight', production: greenlightPayload(start, concept) }])
  const production = greenlit.studio.activeProductions[greenlit.studio.activeProductions.length - 1]!
  // The picture reaches `remainingTicks 1` (Release Ready) after PRODUCTION_TICKS natural ticks and
  // holds there (P06A) until committed; the next tick releases it.
  let state = greenlit
  for (let i = 0; i < TUNING.PRODUCTION_TICKS; i++) state = tick(state)
  const committed = applyActions(state, [{ kind: 'commitPictureToRelease', productionId: production.id }])
  const released = tick(committed)
  return { start, greenlit, productionId: production.id, conceptId: concept.id, committed, released }
}

// ── P16B/C: hand-built P15B condition readers ────────────────────────────────
//
// The shipped binding (`rightsFinance.corporateConditionReaders`) is UNBOUND at base 6510c971 and fails
// closed; these readers stand in for P15B's `conditionRecord`/`outstandingLoan` with the record shapes
// P15B persists (`{ condition: { stage } }`, a loan record or undefined). Pure, no state read.

/** Every studio evaluated; `stages` overrides the default stage; `loans` names the studios with one outstanding. */
export function readersWith(stages: Record<string, ConditionStage> = {}, loans: readonly string[] = [], defaultStage: ConditionStage = 'stable'): CorporateConditionReaders {
  return {
    conditionRecord: (_state, studioId) => ({ condition: { stage: stages[studioId] ?? defaultStage } }),
    outstandingLoan: (_state, studioId) => (loans.includes(studioId) ? { loanId: `loan-${studioId}` } : undefined),
  }
}
/** Only the named studios have an evaluated record; everyone else is unevaluated (refused). */
export function readersOnly(stages: Record<string, ConditionStage>, loans: readonly string[] = []): CorporateConditionReaders {
  return {
    conditionRecord: (_state, studioId) => (Object.hasOwn(stages, studioId) ? { condition: { stage: stages[studioId]! } } : undefined),
    outstandingLoan: (_state, studioId) => (loans.includes(studioId) ? { loanId: `loan-${studioId}` } : undefined),
  }
}
/** Every studio stable with no loan: the first-slice "permitted" world. */
export const STABLE: CorporateConditionReaders = readersWith()

// ── r2: founded managed studios WITH the industry open ────────────────────────
//
// `tests/contracts/_contractFixtures.ts` founds through `beginFoundingHistoricalControl` (no industry, so no rights);
// these found through the REAL `beginFounding`, which opens the industry, then follow `managedStudio` /
// `contendedStudio` (tests/_m4Fixtures.ts) step for step.

export function industryManagedStudio(seed: string, depth: Partial<Record<'actor' | 'director' | 'writer' | 'craft', number>> = CONTENDED_DEPTH): GameState {
  let state = beginFounding(generateWorld(seed))
  const applicants = state.founding!.applicantIds.map((id) => state.talent.find((person) => person.id === id)!)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const count = Math.max(depth[role] ?? 0, FOUNDING_MINIMUMS[role])
    for (const person of applicants.filter((t) => t.role === role).slice(0, count)) {
      state = applyActions(state, [{ kind: 'signContract', talentId: person.id, termWeeks: 104 }])
    }
  }
  state = applyActions(state, [{ kind: 'foundStudio' }])
  state = applyActions(state, [{ kind: 'activateStudioOperations' }, { kind: 'activateScriptDevelopment' }, { kind: 'activateCastingSessions' }])
  return withCash(state, 200_000_000)
}

/** Both Development & Casting slots held by two greenlit pictures, two Ready screenplays left (the `contendedStudio` shape). */
export function industryContendedStudio(seed: string): { state: GameState; readyProjectIds: string[]; productionIds: string[] } {
  let state = industryManagedStudio(seed)
  const projectIds: string[] = []
  for (const pair of [[0, 1], [2, 3]]) {
    for (const index of pair) state = applyActions(state, [{ kind: 'commissionScript', project: commissionFor(state, index, index) }])
    state = tick(state)
    for (const project of state.scriptDevelopment.projects) {
      if (project.status !== 'review') continue
      state = applyActions(state, [{ kind: 'acceptScript', projectId: project.id }])
      projectIds.push(project.id)
    }
  }
  const productionIds: string[] = []
  for (const projectId of projectIds.slice(0, 2)) {
    state = applyActions(state, [{ kind: 'greenlightScriptProject', production: freePackage(state, projectId) }])
    productionIds.push(state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id)
  }
  return { state, readyProjectIds: projectIds.slice(2), productionIds }
}

// ── P16C r2: a complete estate handoff from raw facts ─────────────────────────
//
// The handoff names every right the closed studio held at closure exactly once: in a lot, or pending with a
// reason. Encumbrances are read off the raw roots here (runs, productions, licences), never through rights.ts.

type Subject = { right: 'R1'; propertyId: string } | { right: 'R2'; filmId: string }
const keyOf = (s: Subject): string => (s.right === 'R1' ? `R1:${s.propertyId}` : `R2:${s.filmId}`)

/** Every subject `studioId` holds at `week` with no transfer recorded: its films and their properties, plus in-flight productions' properties. */
export function heldSubjectsFromFacts(state: GameState, studioId: string): Subject[] {
  const h = state.hollywood!
  const out = new Map<string, Subject>()
  const add = (s: Subject) => out.set(keyOf(s), s)
  const prop = (conceptId: string): Subject => ({ right: 'R1', propertyId: `story-property:${conceptId}` })
  if (studioId === h.playerStudioId) {
    for (const f of state.studio.releasedFilms) { add({ right: 'R2', filmId: f.productionId }); add(prop(f.conceptId)) }
    for (const p of state.studio.activeProductions) add(prop(p.conceptId))
  } else {
    for (const f of h.films) if (f.studioId === studioId) { add({ right: 'R2', filmId: f.filmId }); add(prop(f.conceptId)) }
    for (const p of h.businesses.find((b) => b.studioId === studioId)?.productions ?? []) add(prop(p.conceptId))
  }
  return [...out.values()].sort((a, b) => (keyOf(a) < keyOf(b) ? -1 : 1))
}

/** The active-run / active-production encumbrance of one subject, from the raw roots. */
export function blockingEncumbranceFromFacts(state: GameState, s: Subject): 'activeRun' | 'activeProduction' | null {
  const h = state.hollywood!
  if (s.right === 'R2') {
    const running = state.theatricalRuns.some((r) => r.productionId === s.filmId && r.status === 'active') || h.businesses.some((b) => b.runs.some((r) => r.productionId === s.filmId))
    return running ? 'activeRun' : null
  }
  const conceptId = s.propertyId.slice('story-property:'.length)
  const busy = state.studio.activeProductions.some((p) => p.conceptId === conceptId) || h.businesses.some((b) => b.productions.some((p) => p.conceptId === conceptId))
  return busy ? 'activeProduction' : null
}

/** Live licence references on a subject at `week`, sorted. */
export function licenceRefsFromFacts(state: GameState, subjects: readonly Subject[], week: number): string[] {
  const keys = new Set(subjects.map(keyOf))
  return state.rights.licences.filter((l) => keys.has(keyOf(l.subject)) && week < l.endWeekExclusive).map((l) => `licence:${l.id}`).sort()
}

/** A complete r2 handoff: the given lots (encumbrances filled from facts), every other held subject pending with its reason. */
export function estateHandoffFor(state: GameState, studioId: string, week: number, lots: { lotId: string; subjects: Subject[]; minimumBid: number }[],
  claimIds: string[] = []): EstateHandoff {
  const inLots = new Set(lots.flatMap((l) => l.subjects.map(keyOf)))
  const pending = heldSubjectsFromFacts(state, studioId).filter((s) => !inLots.has(keyOf(s)))
    .map((subject) => ({ subject, reason: blockingEncumbranceFromFacts(state, subject) ?? ('notOffered' as const) }))
  return {
    version: 2, closureId: `closure-${studioId}-${week}`, estateId: `estate-${studioId}-${week}`, studioId, closureWeek: week, opensWeek: week,
    closesWeek: week + TUNING.ESTATE_WINDOW_WEEKS,
    lots: lots.map((l) => ({ ...l, encumbrances: licenceRefsFromFacts(state, l.subjects, week) })),
    pending,
    claimsContext: { priorityVersion: 'closure/v1', claimIds },
    cashReconciliation: { terminalCash: 0, loanRemainder: 0 },
  }
}
