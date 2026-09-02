// ── C2a-M1 · CONTRACT-FIRST V14 FIXTURES ────────────────────────────────────
//
// SOURCE OF TRUTH: `CAMPAIGN-2-SETS-THROUGHPUT-CHARTER.md` r3.2 — §5 (the event
// model), §8.1 (the V14 row schemas), §8.2 (architecture guardrails), §8.3
// (migration rules), §12-M1 (the milestone), §14 (G3/G4). Every literal below is
// transcribed FROM THE CHARTER, never read off the implementation: OPUS-ENGINE-M1
// is writing that implementation concurrently, and a test that copies it proves
// only that the engine agrees with itself.
//
// A suite that consumes this module and FAILS against the pre-engine tree is
// reporting the contract, not a regression. M1 is what makes it green.
//
// TSC DISCIPLINE (the `_contractFixtures.ts` precedent, extended): the V14 save
// surface does not exist yet, so a STATIC import of `migrateToV14` would break
// `tsc --noEmit` for the WHOLE repository and block every other lane's commit
// gate over a file none of them own. The V14 surface is therefore reached through
// a deferred specifier + a runtime export check that fails LOUDLY AND BY NAME.
// The V13-and-older surface is imported statically, because it is real today.
//
// INTEGRATOR: once `src/core/save.ts` exports the V14 four, convert
// `loadV14SaveModule` to a static import and delete the loader.

import {
  applyActions,
  generateWorld,
  stableStringify,
  tick,
  TUNING,
  validateSaveV13,
} from '../../src/core/index.js'
import type {
  FacilityCapability,
  GameState,
  Genre,
  ProductionPhase,
} from '../../src/core/index.js'

import { clone, operationsStudio, productionPayload, withCash } from './_contractFixtures.js'

// ── §8.1 — the V14 schema, pinned as charter literals ───────────────────────

/** The four new V14 roots plus the set counter (§8.1 "V14 state additions"). */
export const V14_STATE_ROOTS = [
  'sets',
  'nextSetId',
  'productionQueue',
  'originalScreenplays',
  'studioEvents',
] as const

/** §8.3: the three new ledger kinds that get their own boundary legs. */
export const V14_LEDGER_KINDS = ['setCapex', 'setMaintenance', 'setDemolitionRefund'] as const

/** §8.1 `WorkflowBindings` — the widened persisted `ProductionWorkflow` leaf. */
export const WORKFLOW_BINDINGS_KEYS = [
  'requiresSetBinding',
  'stageFacilityId',
  'setId',
  'lockedNovelty',
  'lockedUplift',
  'heldSinceWeek',
] as const

/** §8.1 `StudioSet`. */
export const STUDIO_SET_KEYS = [
  'id',
  'name',
  'blueprintId',
  'mountedOn',
  'setType',
  'status',
  'completesWeek',
  'quality',
  'novelty',
  'condition',
  'genreWeights',
  'priorityGenre',
] as const

/** `Genre` per `types.ts:9` — the six members `genreWeights` must carry (§8.1). */
export const CHARTER_GENRES = [
  'comedy',
  'drama',
  'crime',
  'romance',
  'horror',
  'adventure',
] as const satisfies readonly Genre[]

/**
 * §8.1 `StudioEvent` — the EXACT own-key list of every row arm. §5.1 forbids a
 * `seen`/`consumed` field ever; asserting the exact key set is the only form of
 * that prohibition a later maintainer cannot quietly widen.
 */
export const STUDIO_EVENT_ROW_KEYS: Readonly<Record<string, readonly string[]>> = {
  wrapped: ['seq', 'week', 'kind', 'productionId', 'stageFacilityId', 'setId'],
  premiere: ['seq', 'week', 'kind', 'filmId'],
  constructionCompleted: ['seq', 'week', 'kind', 'placementId'],
  setBuilt: ['seq', 'week', 'kind', 'setId'],
  setRetired: ['seq', 'week', 'kind', 'setId', 'refund'],
  reservationGranted: ['seq', 'week', 'kind', 'ownerId', 'resourceKey'],
  reservationReleased: ['seq', 'week', 'kind', 'ownerId', 'resourceKey'],
  phaseEntered: ['seq', 'week', 'kind', 'productionId', 'phase'],
  sceneryArrived: ['seq', 'week', 'kind', 'productionId'],
  queueAdmitted: ['seq', 'week', 'kind', 'entryKind', 'ordinal'],
  queueIntentExpired: ['seq', 'week', 'kind', 'entryKind', 'ordinal', 'reason'],
}

/** §5.3 — "Tier D is the identity-bearing tier", permanent. */
export const TIER_D_EVENT_KINDS = [
  'premiere',
  'wrapped',
  'releaseCommitted', // P06A (charter W1): the permanent commitment witness
  'constructionCompleted',
  'setBuilt',
  'setRetired',
] as const

/** §5.3 — Tier W, windowed by `STUDIO_EVENT_WINDOW_WEEKS`. */
export const TIER_W_EVENT_KINDS = [
  'reservationGranted',
  'reservationReleased',
  'queueAdmitted',
  'queueIntentExpired',
  'phaseEntered',
  'sceneryArrived',
] as const

/** The two forbidden cursor fields (§5.1/§5.4: the cursor lives OUTSIDE GameState). */
export const FORBIDDEN_EVENT_ROW_KEYS = ['seen', 'consumed'] as const

// ── §3.1 / §8.3 — the founding endowment ────────────────────────────────────

/** §3.1 "The founding endowment: TWO generic house sets". */
export const HOUSE_SET_NAMES = ['Stage 7 House Set', 'Stage 12 House Set'] as const
/** The two founding soundstages the house sets are mounted on (`operations.ts`). */
export const HOUSE_SET_MOUNTS = ['facility-soundstage-07', 'facility-soundstage-12'] as const
/** §8.3: "`nextSetId` := 2 for managed-mode saves … 0 for legacy". */
export const MANAGED_MIGRATED_NEXT_SET_ID = 2
export const LEGACY_MIGRATED_NEXT_SET_ID = 0

// ── §8.3 T9 — the headline matrix, pinned as charter literals ───────────────

export type HeadlineBlockerKind = 'none' | 'facility-capacity' | 'scenery-load-in'

export type HeadlineCell = {
  readonly key: string
  readonly phase: ProductionPhase
  readonly remainingTicks: number
  readonly blockerKind: HeadlineBlockerKind
  /** Present only for the `facility-capacity` arm. */
  readonly capability?: FacilityCapability
  /** Present only for the `facility-capacity` arm. */
  readonly targetPhase?: ProductionPhase
}

/**
 * §8.3: "T9 covers EVERY phase that holds a reservation (development through
 * post × blocker kinds)". The blocker column is bounded by the REACHABLE-BLOCKER
 * TABLE the V13 engine already enforces (`operations.ts` capacity-blocker
 * invariant + `productionPhases.ts:124`):
 *
 *   phase           rt  null  facility-capacity              scenery-load-in
 *   development      8   ✓    ✗ (preProduction needs nothing this phase lacks)
 *   preProduction    7   ✓    ✓ soundstage → rehearsal        ✗
 *   rehearsal        6   ✓    ✓ set-scenery → shooting        ✗
 *   shooting         5   ✓    ✗ (same phase next week)        ✓ (task blocked)
 *   shooting         4   ✓    ✓ post → postProduction         ✗
 *   postProduction   3   ✓    ✗ (releaseReady requires none)  ✗
 *
 * The two ✗ cells that a naive matrix would generate — development ×
 * facility-capacity and postProduction × facility-capacity — are asserted
 * UNREACHABLE rather than skipped, so "we could not build it" can never be
 * mistaken for "the engine allows it".
 */
export const CHARTER_HEADLINE_MATRIX: readonly HeadlineCell[] = [
  { key: 'development/none', phase: 'development', remainingTicks: 8, blockerKind: 'none' },
  { key: 'preProduction/none', phase: 'preProduction', remainingTicks: 7, blockerKind: 'none' },
  {
    key: 'preProduction/facility-capacity',
    phase: 'preProduction',
    remainingTicks: 7,
    blockerKind: 'facility-capacity',
    capability: 'soundstage',
    targetPhase: 'rehearsal',
  },
  { key: 'rehearsal/none', phase: 'rehearsal', remainingTicks: 6, blockerKind: 'none' },
  {
    key: 'rehearsal/facility-capacity',
    phase: 'rehearsal',
    remainingTicks: 6,
    blockerKind: 'facility-capacity',
    capability: 'set-scenery',
    targetPhase: 'shooting',
  },
  { key: 'shooting/none', phase: 'shooting', remainingTicks: 5, blockerKind: 'none' },
  {
    key: 'shooting/scenery-load-in',
    phase: 'shooting',
    remainingTicks: 5,
    blockerKind: 'scenery-load-in',
  },
  {
    key: 'shooting/facility-capacity',
    phase: 'shooting',
    remainingTicks: 4,
    blockerKind: 'facility-capacity',
    capability: 'post',
    targetPhase: 'postProduction',
  },
  { key: 'postProduction/none', phase: 'postProduction', remainingTicks: 3, blockerKind: 'none' },
]

/** The remainingTicks at which the V13 engine can produce NO capacity blocker. */
export const CHARTER_UNREACHABLE_CAPACITY_BLOCKER_TICKS = [8, 5, 3, 2, 1] as const

// ── the deferred V14 save surface ───────────────────────────────────────────

export type V13Envelope = {
  saveVersion: 13
  seed: string
  state: Record<string, unknown>
  broadcastCache: unknown
}

export type V14Envelope = {
  saveVersion: 14
  seed: string
  state: Record<string, unknown>
  broadcastCache: unknown
}

export type V14SaveModule = {
  readonly validateSaveV14: (save: unknown) => V14Envelope
  readonly makeSaveV14: (state: GameState) => V14Envelope
  readonly convertV13ToV14: (v13: unknown) => V14Envelope
  readonly migrateToV14: (save: unknown) => V14Envelope
}

/**
 * The four V14 save functions §8 requires ("the COMPLETE schema AND the complete
 * migrator land at M1"), named by the V11/V12/V13 convention the file already
 * ships. Nothing else is demanded: inventing a symbol the charter never names
 * would be this lane legislating the engine's surface (00E.20 — INVENT LAST).
 */
const REQUIRED_V14_EXPORTS = [
  'validateSaveV14',
  'makeSaveV14',
  'convertV13ToV14',
  'migrateToV14',
] as const

// Held in a variable ON PURPOSE — see the TSC DISCIPLINE note at the top.
const CORE_MODULE_SPECIFIER = '../../src/core/index.js'

let cachedV14Module: V14SaveModule | null = null

export async function loadV14SaveModule(): Promise<V14SaveModule> {
  if (cachedV14Module !== null) return cachedV14Module
  const loaded = (await import(/* @vite-ignore */ CORE_MODULE_SPECIFIER)) as Record<string, unknown>
  const missing = REQUIRED_V14_EXPORTS.filter((name) => typeof loaded[name] !== 'function')
  if (missing.length > 0) {
    throw new Error(
      `C2a-M1 (§8/§8.1/§8.3) contract not met: src/core does not export ${missing.join(', ')}. ` +
        'SaveFileV14 — the complete schema, validator and migrator — lands at M1; ' +
        'until it does there is no V14 boundary for these suites to hold to account.',
    )
  }
  cachedV14Module = loaded as unknown as V14SaveModule
  return cachedV14Module
}

/** §5.3 `STUDIO_EVENT_WINDOW_WEEKS`, read from TUNING (the constants law). */
export function studioEventWindowWeeks(): number {
  const value = (TUNING as unknown as Record<string, unknown>).STUDIO_EVENT_WINDOW_WEEKS
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new Error(
      'C2a-M1 (§5.3) contract not met: TUNING.STUDIO_EVENT_WINDOW_WEEKS is not a positive ' +
        'integer. The Tier-W retention window is a named constant, not a literal at the ' +
        'compaction site.',
    )
  }
  return value
}

// ── reading the V14 roots off a state without breaking tsc ──────────────────

export type StudioEventRow = Record<string, unknown> & {
  seq: number
  week: number
  kind: string
}

export type StudioEventLogShape = {
  nextSeq: number
  rows: readonly StudioEventRow[]
}

export type WorkflowBindingsShape = {
  requiresSetBinding: boolean
  stageFacilityId: string | null
  setId: string | null
  lockedNovelty: number | null
  lockedUplift: number | null
  heldSinceWeek: number | null
}

export type V14Roots = {
  sets?: readonly Record<string, unknown>[]
  nextSetId?: number
  productionQueue?: readonly Record<string, unknown>[]
  originalScreenplays?: { nextOrdinal: number; blueprints: readonly Record<string, unknown>[] }
  studioEvents?: StudioEventLogShape
}

/** A typed keyhole onto the V14 roots that keeps `tsc --noEmit` green pre-engine. */
export function v14RootsOf(state: object): V14Roots {
  return state as unknown as V14Roots
}

export function requireStudioEvents(state: object, where: string): StudioEventLogShape {
  const log = v14RootsOf(state).studioEvents
  if (log === undefined || typeof log !== 'object' || log === null) {
    throw new Error(
      `C2a-M1 (§5) contract not met at ${where}: state.studioEvents does not exist. ` +
        'The persisted, engine-appended studio event ledger is a new V14 root.',
    )
  }
  if (typeof log.nextSeq !== 'number' || !Array.isArray(log.rows)) {
    throw new Error(
      `C2a-M1 (§8.1) contract not met at ${where}: state.studioEvents must be ` +
        '{ nextSeq: number; rows: readonly StudioEvent[] }.',
    )
  }
  return log
}

export function bindingsOf(workflow: object): WorkflowBindingsShape | undefined {
  return (workflow as unknown as { bindings?: WorkflowBindingsShape }).bindings
}

export function requireBindings(workflow: object, where: string): WorkflowBindingsShape {
  const bindings = bindingsOf(workflow)
  if (bindings === undefined || bindings === null || typeof bindings !== 'object') {
    throw new Error(
      `C2a-M1 (§8.1) contract not met at ${where}: the persisted ProductionWorkflow ` +
        'does not carry the widened `bindings` leaf.',
    )
  }
  return bindings
}

export function isTierD(kind: string): boolean {
  return (TIER_D_EVENT_KINDS as readonly string[]).includes(kind)
}

export function isTierW(kind: string): boolean {
  return (TIER_W_EVENT_KINDS as readonly string[]).includes(kind)
}

/** A stable identity for one appended row — `seq` is never reissued (§5.3). */
export function rowIdentity(row: StudioEventRow): string {
  return stableStringify(row)
}

// ── the V13 twin ────────────────────────────────────────────────────────────
//
// A real V13 file predates C2 and therefore simply HAS NONE of the V14 keys.
// `makeSaveV13` cannot build one from a V14 state — §8.3 makes the pre-V14
// boundary REFUSE `bindings` and the `set-unavailable` arm, which is the point —
// so the twin is projected here and then proved to be a genuine, legal V13 file
// by `validateSaveV13`. That validation IS the non-vacuity proof: if the
// projection were not a real V13 save, nothing downstream would mean anything.

/** Strip every V14 addition from a JSON clone of a live state. */
export function projectToV13State(state: GameState): Record<string, unknown> {
  const raw = clone(state) as unknown as Record<string, unknown>
  for (const root of V14_STATE_ROOTS) delete raw[root]
  // P06A (charter W1): the V16 root is version-younger than everything this
  // twin models — a genuine V13 file never carried it, so the twin must not.
  delete raw.releaseAuthority

  const operations = raw.operations as Record<string, unknown> | undefined
  if (operations !== undefined && Array.isArray(operations.workflows)) {
    operations.workflows = operations.workflows.map((entry) => {
      const workflow = { ...(entry as Record<string, unknown>) }
      delete workflow.bindings
      return workflow
    })
  }

  const scriptDevelopment = raw.scriptDevelopment as Record<string, unknown> | undefined
  if (scriptDevelopment !== undefined && Array.isArray(scriptDevelopment.projects)) {
    scriptDevelopment.projects = scriptDevelopment.projects.map((entry) => {
      const project = { ...(entry as Record<string, unknown>) }
      delete project.writerIds
      return project
    })
  }

  return raw
}

/**
 * The V13 twin envelope. Deliberately FORGED (hand-projected) and then validated
 * by the real V13 authority — the `_contractFixtures.ts` carve-out.
 */
export function v13TwinOf(state: GameState): V13Envelope {
  const projected = projectToV13State(state)
  const twin: V13Envelope = {
    saveVersion: 13,
    seed: projected.seed as string,
    state: projected,
    // `makeSaveV13` mirrors the state's own aired items into the envelope; the
    // same reference keeps `checkEnvelope` true by construction.
    broadcastCache: projected.broadcastItems,
  }
  try {
    validateSaveV13(twin)
  } catch (error) {
    throw new Error(
      'C2a-M1 (§8.3, the widened-leaf boundary rule) contract not met: a GENUINE V13 save — ' +
        'one carrying no `bindings` leaf, no `set-unavailable` arm and none of the four new ' +
        'roots, which is what every pre-C2 file on a player\'s disk looks like — was refused ' +
        'at the V13 boundary. §8.3: "the workflow exact-key list and the blocker validator ' +
        'become version-aware — pre-V14 boundaries still REFUSE `bindings` and the ' +
        '`set-unavailable` arm; V14 requires them." REFUSING a bindings leaf is only half ' +
        'the rule: a V13 file that HAS none must still load, or every save on disk is ' +
        'unreadable and there is nothing left for the migrator to migrate. The refusal was: ' +
        (error as Error).message,
    )
  }
  return twin
}

/** No T9 fixture may carry V14 authority: it would make the twin a fiction. */
export function assertNoV14AuthorityInFixture(state: GameState, where: string): void {
  const ledger = (state as unknown as { ledger: readonly { kind: string }[] }).ledger
  for (const entry of ledger) {
    if ((V14_LEDGER_KINDS as readonly string[]).includes(entry.kind)) {
      throw new Error(`${where}: fixture carries a V14 ledger kind ${JSON.stringify(entry.kind)}`)
    }
  }
  for (const workflow of state.operations.workflows) {
    if (workflow.blocker !== null && (workflow.blocker.kind as string) === 'set-unavailable') {
      throw new Error(`${where}: fixture carries the V14 set-unavailable blocker arm`)
    }
    // C2a-M2. A SET BINDING is V14 authority too, and it is the kind a fixture
    // acquires by accident rather than on purpose: from M2 a live greenlight
    // mints `requiresSetBinding: true` and the picture binds a set at rehearsal.
    // A T9 fixture must describe a world a V13 FILE COULD DESCRIBE, and a V13
    // file cannot describe any of this — which is precisely why §8.3 grandfathers
    // every migrated workflow. Checked here so the grandfathering below is proved
    // rather than assumed.
    const bindings = workflow.bindings as
      | { requiresSetBinding?: unknown; setId?: unknown; lockedNovelty?: unknown; lockedUplift?: unknown }
      | undefined
    if (
      bindings !== undefined &&
      (bindings.requiresSetBinding === true ||
        (bindings.setId ?? null) !== null ||
        (bindings.lockedNovelty ?? null) !== null ||
        (bindings.lockedUplift ?? null) !== null)
    ) {
      throw new Error(`${where}: fixture carries an authoritative V14 set binding`)
    }
  }
}

/**
 * The V13-DESCRIBABLE form of a live world: every workflow carries the exact
 * bindings leaf `convertV13ToV14` synthesises, and nothing else.
 *
 * WHY T9 NEEDS THIS FROM C2a-M2 ONWARD. T9 asks whether a migrated V13 file plays
 * identically to the native world it came from. A V13 file cannot carry
 * `requiresSetBinding`, so §8.3 rules that every migrated workflow is
 * GRANDFATHERED — false marker, no set, ever. From M2 a natively greenlit picture
 * carries the marker and binds a set, so the two sides would describe DIFFERENT
 * worlds and the comparison would be measuring the grandfather instead of the
 * migration.
 *
 * `stageFacilityId` and `heldSinceWeek` are deliberately LEFT ALONE: both are
 * derived from the live soundstage reservation, both are what the migrator
 * reconstructs, and neither is authority a V13 file lacks.
 */
export function grandfatheredBindings(state: GameState): GameState {
  return {
    ...state,
    operations: {
      ...state.operations,
      workflows: state.operations.workflows.map((workflow) => ({
        ...workflow,
        bindings: {
          ...workflow.bindings,
          requiresSetBinding: false,
          setId: null,
          lockedNovelty: null,
          lockedUplift: null,
        },
      })),
    },
  }
}

/**
 * The form a real SaveFileV13 on a player's disk can ACTUALLY describe: grandfathered
 * bindings, and no studio event log at all.
 *
 * `grandfatheredBindings` handles the workflow leaf; this handles the other half. From
 * C2a-M1 the engine appends its own history (§5), so every played managed studio carries
 * rows a V13 envelope has no room for — and `assertFrozenBuilderCanProjectV14State`
 * rightly refuses to write one, because `convertV13ToV14` gives a migrated world an EMPTY
 * history and inventing rows would be manufacturing history.
 *
 * That refusal is correct and is asserted in its own right by
 * `v14-boundary-guards.contract.test.ts`. It is also what makes the frozen builder useless
 * as a CORROBORATOR of the hand-projected T9 twin unless it is handed the state the twin
 * actually claims to be. This is that state: the same world with the one root a V13 file
 * cannot hold cleared, exactly as `tests/production-operations-save-v8.test.ts` does with
 * its `historicalWorld` helper.
 *
 * Deliberately NOT used to build the T9 fixtures themselves — the played world keeps its
 * real history, and T9 (B) compares V13 PROJECTIONS, from which the log is absent on both
 * sides anyway.
 */
export function historicalV13Form(state: GameState): GameState {
  return {
    ...grandfatheredBindings(state),
    studioEvents: { nextSeq: 0, rows: [] },
  }
}

// ── building the T9 fixtures ────────────────────────────────────────────────

export type HeadlineFixture = {
  readonly cell: HeadlineCell
  /** The live state, in the target phase, carrying the target blocker. */
  readonly native: GameState
}

type WorkflowBlocker = GameState['operations']['workflows'][number]['blocker']

function withBlocker(state: GameState, blocker: WorkflowBlocker): GameState {
  return {
    ...state,
    operations: {
      ...state.operations,
      workflows: state.operations.workflows.map((workflow) => ({ ...workflow, blocker })),
    },
  }
}

/**
 * One real picture walked from greenlight to post-production through engine
 * actions and `tick` only. The three `facility-capacity` cells are the ONLY
 * hand-shaped states, and each is proved legal by `validateSaveV13` before use:
 * the real allocator produces them under contention, which T9 does not need to
 * stage in order to test the migrator.
 */
export function buildHeadlineFixtures(seed: string): HeadlineFixture[] {
  let state = withCash(operationsStudio(seed), 50_000_000)
  state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state) }])

  const atDevelopment = state
  state = tick(state) // the greenlight tick does not advance the picture
  state = tick(state)
  const atPreProduction = state
  state = tick(state)
  const atRehearsal = state
  state = tick(state)
  const atShootingUnassigned = state

  const productionId = state.studio.activeProductions[0]!.id
  const directorId = state.studio.activeProductions[0]!.directorId
  // P05A W1: on a current (non-grandfathered) workflow the Director call now
  // settles a due-at-call trip inside its own transaction, so the blocked
  // scenery state this matrix needs is built on the GRANDFATHERED arm — the
  // exact provenance every T9 fixture is converted to before use anyway, and
  // the only provenance whose load-in remains a click.
  const atShootingBlocked = applyActions(grandfatheredBindings(atShootingUnassigned), [
    { kind: 'assignShootingDirector', productionId, directorId },
  ])
  let taken = applyActions(atShootingBlocked, [{ kind: 'clearSceneryLoadIn', productionId }])
  taken = applyActions(taken, [{ kind: 'scheduleShootingTake', productionId }])
  taken = tick(taken)
  const atShootingCompleted = taken
  const atPostProduction = tick(taken)

  const byKey: Record<string, GameState> = {
    'development/none': atDevelopment,
    'preProduction/none': atPreProduction,
    'preProduction/facility-capacity': withBlocker(atPreProduction, {
      kind: 'facility-capacity',
      capability: 'soundstage',
      targetPhase: 'rehearsal',
    }),
    'rehearsal/none': atRehearsal,
    'rehearsal/facility-capacity': withBlocker(atRehearsal, {
      kind: 'facility-capacity',
      capability: 'set-scenery',
      targetPhase: 'shooting',
    }),
    'shooting/none': atShootingUnassigned,
    'shooting/scenery-load-in': atShootingBlocked,
    'shooting/facility-capacity': withBlocker(atShootingCompleted, {
      kind: 'facility-capacity',
      capability: 'post',
      targetPhase: 'postProduction',
    }),
    'postProduction/none': atPostProduction,
  }

  return CHARTER_HEADLINE_MATRIX.map((cell) => {
    const built = byKey[cell.key]
    if (built === undefined) throw new Error(`T9 fixture builder has no state for ${cell.key}`)
    // The native side is put into the V13-describable form its own migrated twin
    // will have (§8.3's grandfather) BEFORE the guard runs, so the guard proves
    // the fixture carries no V14 authority rather than the fixture assuming it.
    const native = grandfatheredBindings(built)
    assertNoV14AuthorityInFixture(native, `T9 fixture ${cell.key}`)
    return { cell, native }
  })
}

// ── the scripted 30-week run ────────────────────────────────────────────────

/**
 * A deterministic scripted operator, applied IDENTICALLY to both sides of every
 * T9 comparison. It reads only V13-visible state, so it can never smuggle a V14
 * root into the decision — and if the two sides ever diverge, the script itself
 * diverges and the comparison fails loudly rather than quietly agreeing.
 *
 * Without it the picture parks forever at Shooting on an unassigned take and the
 * 30 weeks prove nothing; with it the run really reaches wrap and release.
 */
export function scriptedWeek(state: GameState): GameState {
  let out = state
  for (const workflow of out.operations.workflows) {
    const productionId = workflow.productionId
    const production = out.studio.activeProductions.find((entry) => entry.id === productionId)
    if (production === undefined) continue
    const task = workflow.shootingTask
    if (workflow.phase === 'shooting' && task !== null) {
      if (task.status === 'unassigned' && workflow.blocker === null) {
        out = applyActions(out, [
          { kind: 'assignShootingDirector', productionId, directorId: production.directorId },
        ])
      }
    }
  }
  for (const workflow of out.operations.workflows) {
    if (workflow.blocker !== null && workflow.blocker.kind === 'scenery-load-in') {
      out = applyActions(out, [{ kind: 'clearSceneryLoadIn', productionId: workflow.productionId }])
    }
  }
  for (const workflow of out.operations.workflows) {
    if (workflow.shootingTask !== null && workflow.shootingTask.status === 'ready') {
      out = applyActions(out, [
        { kind: 'scheduleShootingTake', productionId: workflow.productionId },
      ])
    }
  }
  // P06A (charter W1): the scripted player resolves the release decision the
  // way a real one does — commit every uncommitted Release Ready picture
  // before the advance. Applied symmetrically to both sides of every parity
  // run; the commitment row and its event live entirely ABOVE the V13 surface
  // (`projectToV13State` strips both), so V13-visible parity is untouched.
  {
    const committed = new Set(out.releaseAuthority.commitments.map((r) => r.productionId))
    const ready = out.studio.activeProductions.filter(
      (production) => production.remainingTicks === 1 && !committed.has(production.id),
    )
    if (ready.length > 0) {
      out = applyActions(
        out,
        ready.map((production) => ({
          kind: 'commitPictureToRelease' as const,
          productionId: production.id,
        })),
      )
    }
  }
  return tick(out)
}

/** §8.3: "played byte-identically vs its V13 twin ≥30 weeks". */
export const T9_RUN_WEEKS = 30

export function runScriptedWeeks(state: GameState, weeks: number): GameState {
  let out = state
  for (let week = 0; week < weeks; week++) out = scriptedWeek(out)
  return out
}

// ── the boundary-guard surface (§8 / §8.3) ──────────────────────────────────

/**
 * Every save version the format has ever had. §8: "the five hand-enumerated
 * `migrateToVn` downgrade refusals get a parameterized every-migrator ×
 * every-higher-version test" — the parameterization needs both axes stated as
 * data, not as eleven hand-written cases that can each be forgotten separately.
 */
export const CHARTER_SAVE_VERSIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const

/** The versions that HAVE a `migrateToVn`. V1–V3 are reached only by conversion. */
export const CHARTER_MIGRATOR_VERSIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const

export type SaveEnvelope = { saveVersion: number; state: Record<string, unknown> } & Record<
  string,
  unknown
>

export type SaveModule = Record<string, unknown>

/**
 * The whole `src/core` surface behind the same deferred specifier the V14 four
 * use, so a suite can reach `makeSaveVn`/`migrateToVn` by NAME without a static
 * import of a symbol another lane may still be moving. See TSC DISCIPLINE above.
 */
export async function loadCoreModule(): Promise<SaveModule> {
  return (await import(/* @vite-ignore */ CORE_MODULE_SPECIFIER)) as SaveModule
}

export function requireFunction(module: SaveModule, name: string, why: string): (...args: never[]) => unknown {
  const value = module[name]
  if (typeof value !== 'function') {
    throw new Error(`C2a-M1 contract not met: src/core does not export ${name} — ${why}`)
  }
  return value as (...args: never[]) => unknown
}

/**
 * The §5 event-model surface, by name. `compactStudioEvents` is the ONE symbol
 * that lets the retention law (§5.3 "compacted as a pure function of
 * `market.tick`; `nextSeq` never rewinds") be exercised before the M1 producers
 * are wired: with no producer there are no rows, and a law with no subject is a
 * law nothing checks.
 */
export type StudioEventsModule = {
  readonly compactStudioEvents: (log: StudioEventLogShape, week: number) => StudioEventLogShape
  readonly emptyStudioEventLog: () => StudioEventLogShape
  readonly isTierDStudioEventKind: (kind: string) => boolean
}

export async function loadStudioEventsModule(): Promise<StudioEventsModule> {
  const module = await loadCoreModule()
  const why =
    'the §5 studio event ledger — its retention window, its tiers, and its ' +
    'never-rewinding sequence — is a C2a-M1 deliverable.'
  requireFunction(module, 'compactStudioEvents', why)
  requireFunction(module, 'emptyStudioEventLog', why)
  requireFunction(module, 'isTierDStudioEventKind', why)
  return module as unknown as StudioEventsModule
}

/**
 * Retag a live V14 save as V13 and strip every V14 addition, so ONE forged fact
 * can then be put back and the boundary asked about exactly that fact. Without
 * the stripping every leg would be answered by whichever violation the validator
 * happened to reach first, and "the guard fired" would not mean "this guard
 * fired".
 */
export function forgedV13From(v14: { state: Record<string, unknown> }): V13Envelope {
  const state = clone(v14.state)
  for (const root of V14_STATE_ROOTS) delete state[root]

  const operations = state.operations as Record<string, unknown> | undefined
  if (operations !== undefined && Array.isArray(operations.workflows)) {
    operations.workflows = operations.workflows.map((entry) => {
      const workflow = { ...(entry as Record<string, unknown>) }
      delete workflow.bindings
      return workflow
    })
  }
  const scriptDevelopment = state.scriptDevelopment as Record<string, unknown> | undefined
  if (scriptDevelopment !== undefined && Array.isArray(scriptDevelopment.projects)) {
    scriptDevelopment.projects = scriptDevelopment.projects.map((entry) => {
      const project = { ...(entry as Record<string, unknown>) }
      delete project.writerIds
      return project
    })
  }

  return {
    saveVersion: 13,
    seed: state.seed as string,
    state,
    broadcastCache: state.broadcastItems,
  }
}

// ── §5 — sample rows, transcribed from the §8.1 `StudioEvent` union ──────────

export const CHARTER_STUDIO_EVENT_KINDS = [
  ...TIER_D_EVENT_KINDS,
  ...TIER_W_EVENT_KINDS,
] as const

/**
 * One legal row per kind, built from the charter's own payload lists. These are
 * FORGED — no producer exists at M1 phase 0 — and they exist to make the §5 laws
 * non-vacuous at the one authority that already holds them: the V14 save
 * boundary. A forged row that the boundary ACCEPTS proves the shape is legal; the
 * same row with one field added or moved proves the refusal is real.
 */
export function charterStudioEventRow(
  kind: string,
  seq: number,
  week: number,
): StudioEventRow {
  const base = { seq, week, kind }
  switch (kind) {
    case 'wrapped':
      return { ...base, productionId: 'production-0001', stageFacilityId: 'facility-soundstage-07', setId: null }
    case 'premiere':
      return { ...base, filmId: 'film-0001' }
    case 'constructionCompleted':
      return { ...base, placementId: 'placement-0001' }
    case 'setBuilt':
      return { ...base, setId: 'set-0' }
    case 'setRetired':
      return { ...base, setId: 'set-0', refund: 1000 }
    case 'reservationGranted':
    case 'reservationReleased':
      return { ...base, ownerId: 'production-0001', resourceKey: 'facility-soundstage-07:0' }
    case 'phaseEntered':
      return { ...base, productionId: 'production-0001', phase: 'shooting' }
    case 'sceneryArrived':
      return { ...base, productionId: 'production-0001' }
    case 'queueAdmitted':
      return { ...base, entryKind: 'commissionScript', ordinal: 0 }
    case 'queueIntentExpired':
      return { ...base, entryKind: 'commissionScript', ordinal: 0, reason: 'stale-payload' }
    default:
      throw new Error(`C2a-M1 (§8.1): no charter row shape for studio event kind ${kind}`)
  }
}

/** A world that never activates Studio Operations — §5.5's legacy/headless path. */
export function legacyWorld(seed: string, weeks: number): GameState {
  let state = generateWorld(seed)
  for (let week = 0; week < weeks; week++) state = tick(state)
  return state
}

/** §5.5's "a seeded year". The retention window is 26 weeks, so a year clears it twice. */
export const LEGACY_YEAR_WEEKS = 52
