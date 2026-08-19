// ── C2a-M0 · CONTRACT-FIRST FIXTURES ────────────────────────────────────────
//
// These suites are written from the CHARTER TEXT
// (`CAMPAIGN-2-SETS-THROUGHPUT-CHARTER.md` r3.2 §3.2 / §12-M0 / §14) and the
// planning lanes it binds — NEVER from the implementation. A suite in this
// directory that fails against the pre-engine tree is reporting the contract,
// not a regression: M0 is what makes it green.
//
// Everything below drives a REAL GameState through real engine actions and
// `tick`. Nothing is hand-shaped except the deliberately FORGED saves, which
// exist to prove a refusal is non-vacuous.

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
  scriptProjectsReadModel,
  tick,
} from '../../src/core/index.js'
import type {
  CastSlot,
  CommissionScriptPayload,
  CreativeRole,
  FacilityCapability,
  GameState,
  GreenlightScriptProjectPayload,
  ProductionPhase,
  SegmentId,
  StartCastingSessionPayload,
  Talent,
} from '../../src/core/index.js'

const here = dirname(fileURLToPath(import.meta.url))
export const repoRoot = join(here, '..', '..')

// ── the charter's V13 phase table, pinned as literals ───────────────────────
//
// Transcribed from `docs/c2-planning/06-production-phases-consumption.md` §1.3
// (the per-phase table) and `docs/PRODUCTION-OPERATIONS-V1-CONTRACT.md`. §12-M0
// calls this "a scaffold pinning the V13 table — M2 replaces it with the
// bindings-aware form". It is stated here so the agreement test compares the
// engine against the CONTRACT, not against itself.

export const CHARTER_PRODUCTION_PHASES = [
  'development',
  'preProduction',
  'rehearsal',
  'shooting',
  'postProduction',
  'releaseReady',
] as const satisfies readonly ProductionPhase[]

export const CHARTER_PHASE_REQUIREMENTS: Readonly<
  Record<ProductionPhase, readonly FacilityCapability[]>
> = {
  development: ['development-casting'],
  preProduction: ['development-casting'],
  rehearsal: ['soundstage'],
  shooting: ['soundstage', 'set-scenery'],
  postProduction: ['post'],
  releaseReady: [],
}

export const CHARTER_NEXT_PHASE: Readonly<Record<ProductionPhase, ProductionPhase | null>> = {
  development: 'preProduction',
  preProduction: 'rehearsal',
  rehearsal: 'shooting',
  shooting: 'postProduction',
  postProduction: 'releaseReady',
  releaseReady: null,
}

/** remainingTicks → phase, the full managed range [1, 8]. */
export const CHARTER_TICKS_TO_PHASE: Readonly<Record<number, ProductionPhase>> = {
  8: 'development',
  7: 'preProduction',
  6: 'rehearsal',
  5: 'shooting',
  4: 'shooting',
  3: 'postProduction',
  2: 'postProduction',
  1: 'releaseReady',
}

// ── the shared module §12-M0 creates ────────────────────────────────────────
//
// CONTRACT-FIRST IMPORT. §12-M0: "the phase→capability duplicate tables
// single-sourced with an agreement test". The single source is
// `src/core/productionPhases.ts`. It does not exist at this HEAD.
//
// The specifier is held in a variable ON PURPOSE: a static import of a module
// that has not landed yet breaks `tsc --noEmit` for the WHOLE repository, which
// would block every other lane's commit gate over a file none of them own. A
// deferred specifier keeps the type gate honest for everyone while this suite
// still FAILS LOUDLY, by name, until the module exists.
//
// INTEGRATOR: once `src/core/productionPhases.ts` lands, convert this to a
// static `import` and delete `loadProductionPhases`.
const PRODUCTION_PHASES_MODULE = '../../src/core/productionPhases.js'

export type ProductionPhasesModule = {
  readonly productionPhaseForRemainingTicks: (remainingTicks: number) => ProductionPhase
  readonly requirementsForPhase: (phase: ProductionPhase) => readonly FacilityCapability[]
  readonly nextProductionPhase: (phase: ProductionPhase) => ProductionPhase | null
}

// Only the three readings the charter itself names are REQUIRED. §12-M0 asks for
// "the phase→capability duplicate tables single-sourced": the phase LIST is
// pinned here as charter text (`CHARTER_PRODUCTION_PHASES`) rather than demanded
// as a new export, because inventing a symbol the charter never names would be
// this lane legislating the engine's surface (00E.20 — INVENT LAST).
const REQUIRED_MODULE_EXPORTS = [
  'productionPhaseForRemainingTicks',
  'requirementsForPhase',
  'nextProductionPhase',
] as const

export async function loadProductionPhases(): Promise<ProductionPhasesModule> {
  if (!existsSync(join(repoRoot, 'src', 'core', 'productionPhases.ts'))) {
    throw new Error(
      'C2a-M0 (§12-M0) contract not met: src/core/productionPhases.ts does not exist. ' +
        'The phase→capability tables are still duplicated between operations.ts and ' +
        'the save validator; there is nothing for the agreement test to agree with.',
    )
  }
  const loaded = (await import(/* @vite-ignore */ PRODUCTION_PHASES_MODULE)) as Record<
    string,
    unknown
  >
  const missing = REQUIRED_MODULE_EXPORTS.filter((name) => typeof loaded[name] !== 'function')
  if (missing.length > 0) {
    throw new Error(
      `C2a-M0 (§12-M0) contract not met: src/core/productionPhases.ts must export ${missing.join(', ')}`,
    )
  }
  return loaded as unknown as ProductionPhasesModule
}

// ── source scanning (the hygiene-test idiom, with comments stripped) ────────

/**
 * A core source file with block and line comments removed, so a scan asserting
 * a symbol is GONE cannot be satisfied — or falsified — by prose about it.
 * The `[^:]` guard keeps `https://` out of the line-comment rule.
 */
export function strippedSource(repoRelativePath: string): string {
  const raw = readFileSync(join(repoRoot, repoRelativePath), 'utf8')
  return raw.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}

// ── real studios ────────────────────────────────────────────────────────────

export function byRole(talent: readonly Talent[], role: CreativeRole): Talent[] {
  return talent.filter((person) => person.role === role)
}

export function contractedByRole(state: GameState, role: CreativeRole): Talent[] {
  const contracted = new Set(state.contracts.map((contract) => contract.talentId))
  return state.talent.filter((person) => person.role === role && contracted.has(person.id))
}

/**
 * A founded studio with enough roster depth to package and shoot a picture.
 *
 * `depth` widens the roster for a fixture that needs more bodies than one or two
 * pictures — C2a-M4's contention fixtures need three actors nobody has locked.
 * Omitted, every count is exactly what it has always been.
 */
export function richFoundedStudio(
  seed: string,
  depth: Partial<Record<CreativeRole, number>> = {},
): GameState {
  let state = beginFounding(generateWorld(seed))
  const applicants = state.founding!.applicantIds.map(
    (id) => state.talent.find((person) => person.id === id)!,
  )
  const counts: Record<CreativeRole, number> = {
    actor: Math.max(depth.actor ?? 0, 6, FOUNDING_MINIMUMS.actor),
    director: Math.max(depth.director ?? 0, 2, FOUNDING_MINIMUMS.director),
    writer: Math.max(depth.writer ?? 0, 4, FOUNDING_MINIMUMS.writer),
    craft: Math.max(depth.craft ?? 0, 2, FOUNDING_MINIMUMS.craft),
  }
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const person of byRole(applicants, role).slice(0, counts[role])) {
      state = applyActions(state, [{ kind: 'signContract', talentId: person.id, termWeeks: 104 }])
    }
  }
  return applyActions(state, [{ kind: 'foundStudio' }])
}

/** Studio Operations only — the plain `greenlight` door, script development legacy. */
export function operationsStudio(seed: string): GameState {
  return applyActions(richFoundedStudio(seed), [{ kind: 'activateStudioOperations' }])
}

/** All three Development & Casting owners managed (the `first-film-journey` idiom). */
export function managedStudio(
  seed: string,
  depth: Partial<Record<CreativeRole, number>> = {},
): GameState {
  return applyActions(richFoundedStudio(seed, depth), [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}

/** Cash adjustment that keeps the cash/ledger reconciliation true. */
export function withCash(state: GameState, cash: number): GameState {
  const delta = cash - state.studio.cash
  return {
    ...state,
    studio: { ...state.studio, cash },
    ledger:
      delta === 0
        ? state.ledger
        : [
            ...state.ledger,
            {
              week: state.market.tick,
              kind: delta > 0 ? ('studioRevenue' as const) : ('overhead' as const),
              amount: delta,
              note: 'contract fixture cash identity adjustment',
            },
          ],
  }
}

export function advance(state: GameState, weeks: number): GameState {
  let out = state
  for (let week = 0; week < weeks; week++) out = tick(out)
  return out
}

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

// ── action payloads ─────────────────────────────────────────────────────────

/** The plain `greenlight` payload (no screenplay project), for phase-walk work. */
export function productionPayload(state: GameState, offset = 0) {
  const concept = state.concepts[offset]!
  const actors = contractedByRole(state, 'actor')
  return {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: {
        intimacy: [-0.5, 0.5] as [number, number],
        tonalWeight: [-0.5, 0.5] as [number, number],
        kineticEnergy: [-0.5, 0.5] as [number, number],
      },
    },
    writerId: contractedByRole(state, 'writer')[offset]!.id,
    directorId: contractedByRole(state, 'director')[offset]!.id,
    cast: {
      lead: actors[offset * 3]!.id,
      antagonist: actors[offset * 3 + 1]!.id,
      support: actors[offset * 3 + 2]!.id,
    } satisfies Record<CastSlot, string>,
    craftIds: [contractedByRole(state, 'craft')[offset]!.id],
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

/** The first writer the Writers Room read model reports as available. */
export function availableWriterId(state: GameState): string {
  const writer = scriptProjectsReadModel(state).commission.writers.find(
    (candidate) => candidate.available,
  )
  if (writer === undefined) throw new Error('contract fixture: no writer is available to commission')
  return writer.id
}

/** The first concept the Writers Room read model still offers. */
export function availableConceptId(state: GameState): string {
  const concept = scriptProjectsReadModel(state).commission.concepts[0]
  if (concept === undefined) throw new Error('contract fixture: no concept is available to commission')
  return concept.id
}

export function commissionPayload(
  state: GameState,
  conceptId: string,
  writerId: string,
): CommissionScriptPayload {
  const concept = state.concepts.find((entry) => entry.id === conceptId)!
  return {
    conceptId,
    writerId,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult', 'prestige'] as SegmentId[],
      ranges: {
        intimacy: [-0.4, 0.6],
        tonalWeight: [0, 0.8],
        kineticEnergy: [-0.7, 0.2],
      },
    },
  }
}

/**
 * `offset` skips actors already engaged elsewhere — a candidate busy on an
 * active production is refused by the slate eligibility law.
 */
export function auditionSlate(
  state: GameState,
  projectId: string,
  offset = 0,
): StartCastingSessionPayload {
  const actors = contractedByRole(state, 'actor').slice(offset)
  return {
    projectId,
    slate: {
      lead: [actors[0]!.id, actors[1]!.id],
      antagonist: [actors[0]!.id, actors[2]!.id],
      support: [actors[1]!.id, actors[2]!.id],
    },
  }
}

export function greenlightPayload(
  state: GameState,
  projectId: string,
): GreenlightScriptProjectPayload {
  const project = state.scriptDevelopment.projects.find((entry) => entry.id === projectId)!
  const concept = state.concepts.find((entry) => entry.id === project.conceptId)!
  const actors = contractedByRole(state, 'actor').filter(
    (person) => person.id !== project.writerId,
  )
  return {
    projectId,
    directorId: contractedByRole(state, 'director').find(
      (person) => person.id !== project.writerId,
    )!.id,
    craftIds: [
      contractedByRole(state, 'craft').find((person) => person.id !== project.writerId)!.id,
    ],
    cast: {
      lead: actors[0]!.id,
      antagonist: actors[1]!.id,
      support: actors[2]!.id,
    } satisfies Record<CastSlot, string>,
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}
