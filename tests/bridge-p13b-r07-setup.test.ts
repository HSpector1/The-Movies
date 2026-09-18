import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { Action, GameState } from '../src/core/types.js'
import { advanceTo } from '../src/harness/p13a/fixtures.js'
import { p13bTwoLabWorld } from '../src/harness/p13b/fixtures.js'
import { operationsStudio, productionPayload, withCash } from './contracts/_contractFixtures.js'
// The engine increment (S5-R07 T1/T2) is landed on this tree (verified
// 2026-09-17: `src/core/productionSetup.ts` exists, exports `SETUP_RECIPES`,
// `setupForecast`, `applySetProductionSetupRecipe`, `validateProductionSetup`;
// `setProductionSetupRecipe` is wired into `applyActions`, actions.ts:3053; the
// five core `tests/p13b-r07-*.test.ts` files run 30/37 green against it, with
// the remaining 7 failures unrelated to this file — see this file's own header
// below). This import therefore does NOT fail module resolution the way the
// core R07 test files' own headers describe for their own (now-stale) starting
// point. The RED source in THIS file is entirely the BRIDGE (projection 37),
// which does not yet publish any of the projection-38 facts below.
import { SETUP_RECIPES, setupForecast } from '../src/core/productionSetup.js'
import { BridgeSession } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID, type ControlEnvelope } from '../bridge/protocol.ts'
import { AVAILABLE_INTENT_KINDS, BRIDGE_SCHEMA, PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'

// P13B-S5-R07-T3 test-author (bridge), 2026-09-17. Authority: brief
// /private/tmp/claude-501/.../scratchpad/r07-bridge-test-brief.md, itself
// derived from the S5-R07 expansion's "Bridge (projection 38, text only)"
// bullet and test 6 in docs/engineering/playability-launch-review/plans/
// P13B-HEADLESS-PLAN.md, plus the landed engine (`src/core/productionSetup.ts`,
// `ProductionWorkflow.setup`/`setProductionSetupRecipe`, history kinds
// `setupAdmitted|setupUnitCredited|setupCompleted|setupRebound`, Save V25).
// Harness idioms copied from tests/bridge-p13b-s5-adoption.test.ts and
// tests/bridge-p13b-s4-office.test.ts (BridgeSession/dispatchRow/`required`
// pattern, stale-revision case, player-safe case) and
// tests/bridge-operations-events.test.ts (the `operationsEvents` served-section
// idiom). Every case dispatches or reads through a real BridgeSession, never a
// mock.
//
// ADJUDICATED ENGINE FACTS (handed down mid-task, binding on this file, and
// overriding anything read in the five core `tests/p13b-r07-*.test.ts` files —
// those files were themselves amended in flight to match, confirmed by
// re-reading tests/p13b-r07-timeline.test.ts's own "AMENDED" note and
// tests/p13b-r07-controls.test.ts's/tests/p13b-r07-gate.test.ts's identical
// notes, all dated 2026-09-17):
//   (1) a recipe is selected DURING rehearsal, BEFORE the gate-week tick
//       (rehearsal weeks 11 / 806 / 3 on the three measured fixtures below);
//       the sweep visit that would have moved 6 -> 5 then stamps admission
//       (admittedWeek 12 / 807 / 4), credits nothing and holds; one unit per
//       later week; Shooting entry 16 / 809 / 5; a production that never
//       selects a recipe keeps today's schedule (no hold). Directly confirmed
//       by running the five core files single-worker on this tree: 30/37 pass,
//       and tests/p13b-r07-timeline.test.ts (the file this one's fixtures are
//       copied from verbatim) is fully green, all 6 cases, under exactly this
//       ordering.
//   (2) `bridge/operations-events.ts`'s `operationsEventsProjection` currently
//       FILTERS the four setup history kinds out of the served
//       `operationsEvents` section (SETUP_EVENT_KINDS, ~line 154-167, comment:
//       "R07-T3 (projection 38) publishes the setup plan and its history
//       deliberately"). T3 must publish them; this file pins that.
//   (3) `bridge/session.ts:123`: `const converted = save.saveVersion !== 23` —
//       a stale literal from before Save V25 (now the CURRENT live version,
//       confirmed: `src/core/save.ts`'s `makeSave` returns `saveVersion: 25`
//       today). Loading a genuine CURRENT (V25) checkpoint back through the
//       bridge therefore wrongly reports "migrated" (`converted: true`) when it
//       should report `false` — pinned below as a RED extra to the brief's own
//       six wire pins, exactly as instructed.
//
// FIELD-NAME PREMISES (flagged, not invented product decisions — projection 38
// does not exist anywhere in this tree yet, so nothing below can be copied from
// an implementation; each interpretation below is named so a real gap between
// this pin and a future implementer's choice is visible, not a silent
// mismatch, mirroring tests/bridge-p13b-s5-adoption.test.ts's own convention):
//   - `StudioProductionOperationsSnapshot` gains a `setup: StudioProductionSetup
//     | null` member — the brief pins this container exactly, and it already
//     exists as an array at `session.snapshot().snapshot.productions
//     .productionOperations` (confirmed live at projection 37).
//   - The brief's "recipe rows" have no pinned container on the wire (unlike
//     Laboratory/Office/Plans, there is no `industryQuery` view named
//     'production' — `StudioIndustryRequest.view` is a CLOSED enum,
//     confirmed by reading bridge/schema/industry-schema.ts, and the brief
//     lists no new view). This file pins them as a new array member,
//     `setupRecipeActions: StudioSetupRecipeAction[]`, on the SAME
//     `StudioProductionOperationsSnapshot` row the `setup` member above lives
//     on (the natural home: the row already scopes "this one production"),
//     with the S4/S5 action-row shape (`id/label/detail/enabled/
//     disabledReason/intent`) PLUS the S4 disclosure pattern the brief names
//     explicitly (`rejections`/`refusal`) directly on the row (there is no
//     separate "quote" concept for a recipe choice the way there is for a
//     priced adoption).
//   - `recipeLabel` = `SETUP_RECIPES.find(r => r.id === recipeId)!.name` (the
//     catalogue's own field is `name`, not `label` — verified by reading
//     src/core/productionSetup.ts directly; a wrong guess here was caught
//     before writing this file).
//   - `nextUnitWeek` = null once `completedWeek !== null`; otherwise the week
//     the NEXT unit can credit, `(lastCreditedWeek ?? admittedWeek) + 1`. Not
//     stated verbatim by the brief; derived from its own words ("weeksRemaining
//     consistent with the forecast") and the engine's own `lastCreditedWeek`/
//     `admittedWeek` fields.
//   - `forecastShootingEntryWeek` = `setupForecast(admittedWeek, requiredUnits)`
//     while `admittedWeek !== null`, else `null` (nothing to forecast before
//     the sweep visit stamps admission — the engine's own record carries
//     `admittedWeek: null` in that window, confirmed by reading
//     `applySetProductionSetupRecipe`).
//   - `weeksRemaining` on a setup-held row = `forecastShootingEntryWeek -
//     currentWeek` (NOT the frozen `production.remainingTicks`, which per the
//     core controls file's own INTERPRETATION 3 stays 6 for the WHOLE hold —
//     publishing that frozen 6 every week would not be "consistent with the
//     forecast" as the brief requires). Flagged as an interpretation, not a
//     hard engine fact.
//   - `statusLabel` "naming the setup wait": exact copy is not specified
//     anywhere (plan, brief, or engine). Pinned leniently — non-empty and
//     case-insensitively mentions "setup" — rather than guessing a sentence.
//   - History rows: `subject = {kind:'production', id: productionId}` (the
//     `StudioOperationsEventSubject.kind` enum already includes 'production';
//     the brief's own route triple has no field for a recipe/stage/Set id
//     simultaneously, so those are read as belonging to the summary sentence's
//     NAMES, per this projection's own "names never ids in the sentence" rule
//     — this file does not assert exact summary copy, only `subject`/`kind`/
//     `week` and that the row exists).
//
// MEASURED, NOT INVENTED: `advanceWeek` intents are gated to the guided First
// Film Journey (bridge/session.ts ~965-1030: every publisher of the
// `advanceWeek` kind lives strictly inside `if (next === null) return
// resolved`, where `next = journey.next` and `journey = snapshot
// .firstFilmJourney`; no unconditional publisher exists anywhere else in
// `availableIntents`). Every one of this file's fixtures is an established,
// multi-picture studio (`operationsStudio`/`p13bTwoLabWorld`) whose journey has
// already concluded, so `advanceWeek` is never offered on them — confirmed by
// reading the code path directly, not by a failed probe. This matches every
// peer P13B-S4/S5 bridge test file exactly: NONE of them ever dispatches
// `advanceWeek` through the bridge either; all of them advance with a direct
// core `tick()` and then read a FRESH `BridgeSession` built from the ticked
// state (tests/bridge-p13b-s4-office.test.ts cases 2/3/8; tests/bridge-p13b-s5
// -adoption.test.ts's `advanceTo`/`runToCompletion`). Requirement 5's "ticking
// through the bridge" below follows that SAME, only-available, already-proven
// idiom — this is a named, evidenced deviation from the brief's literal words
// ("advance-week intents"), not a silent substitution: this file verifies the
// SERVED, schema-checked bridge envelope at every step, but does not exercise
// an `advanceWeek` command round-trip specifically (no fixture in this file can
// reach one).

const STAGE_7 = 'facility-soundstage-07'

function required<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) throw new Error(message)
  return value
}

let commandCounter = 0
function nextCommandId(prefix: string): string {
  return `${prefix}-${String(commandCounter++)}`
}

function control(
  session: BridgeSession,
  commandId: string,
  revision = session.stateRevision,
  sessionId = session.sessionId,
): ControlEnvelope {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId, commandId, expectedStateRevision: revision }
}
function command(
  session: BridgeSession,
  intentId: string,
  commandId: string,
  revision = session.stateRevision,
  sessionId = session.sessionId,
) {
  return {
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId, commandId,
    expectedStateRevision: revision, type: 'submitIntent' as const, payload: { intentId },
  }
}

// ── Wire shapes (the T3 pin; NONE of this exists on the wire at projection 37) ──

type WireProductionSetup = {
  recipeId: string
  recipeLabel: string
  route: 'conventional' | 'lighting'
  creditedUnits: number
  requiredUnits: number
  admittedWeek: number | null
  nextUnitWeek: number | null
  forecastShootingEntryWeek: number | null
  completedWeek: number | null
  adoptionId: string | null
  stageFacilityId: string
  setId: string
  planRevision: number
}
type WireSetupRecipeAction = {
  id: string
  productionId: string
  recipeId: string
  planRevision: number
  label: string
  detail: string
  enabled: boolean
  disabledReason: string | null
  rejections: string[]
  refusal: string | null
  intent: { intentId: string; kind: string } | null
}
type WireProductionOperationsRow = {
  productionId: string
  phase: string
  weeksRemaining: number
  statusLabel: string
  setup: WireProductionSetup | null
  setupRecipeActions: WireSetupRecipeAction[] | undefined
}

function productionRows(session: BridgeSession): WireProductionOperationsRow[] {
  const response = session.snapshot()
  expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, response)).not.toThrow()
  return ((response.snapshot.productions.productionOperations ?? []) as unknown) as WireProductionOperationsRow[]
}
function rowFor(session: BridgeSession, productionId: string): WireProductionOperationsRow {
  return required(
    productionRows(session).find((row) => row.productionId === productionId),
    `productionOperations row for production "${productionId}" absent from ${JSON.stringify(productionRows(session).map((r) => r.productionId))}`,
  )
}

// ── Fixtures (duplicated-not-shared, per repo convention; copied verbatim from
// the now-green tests/p13b-r07-timeline.test.ts, which this file's law
// depends on directly) ──────────────────────────────────────────────────────

function selectRecipe(
  state: GameState,
  productionId: string,
  recipeId: 'ballroom-reveal-lighting-01' | 'ordinary-interior-01',
  expectedPlanRevision = 0,
): GameState {
  return applyActions(state, [
    { kind: 'setProductionSetupRecipe', productionId, recipeId, expectedPlanRevision } as unknown as Action,
  ])
}

/** Measured: rehearsal (bound, STAGE_7) week 11; TODAY's gate-less Shooting entry week 12. */
function conventionalBallroomAtRehearsal(seed: string, offset = 0): GameState {
  let state = withCash(operationsStudio(seed), 30_000_000)
  state = applyActions(state, [{ kind: 'strikeSet', setId: 'set-0' }])
  state = applyActions(state, [
    { kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE_7 } },
  ])
  for (let week = 0; week < TUNING.SET_BUILD_WEEKS_BAND_HIGH; week++) state = tick(state)
  state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state, offset) }])
  state = tick(state)
  state = tick(state)
  state = tick(state)
  return state
}

/** Measured: rehearsal (bound, STAGE_7) week 3; TODAY's gate-less Shooting entry week 4. */
function ordinaryAtRehearsal(seed: string, offset = 0): GameState {
  let state = withCash(operationsStudio(seed), 10_000_000)
  state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state, offset) }])
  state = tick(state)
  state = tick(state)
  state = tick(state)
  return state
}

let lightingBallroomCache: GameState | null = null
/** Measured (tests/p13b-r07-timeline.test.ts): rehearsal (bound STAGE_7) week
 * 806; TODAY's gate-less Shooting entry week 807. Cached — real research ticks
 * to week ~795 are expensive and this file needs the fixture more than once. */
function lightingBallroomAtRehearsal(): GameState {
  if (lightingBallroomCache !== null) return lightingBallroomCache
  function fundTo(state: GameState, target: number): GameState {
    const delta = target - state.studio.cash
    if (delta === 0) return state
    return {
      ...state,
      studio: { ...state.studio, cash: target },
      ledger: [
        ...state.ledger,
        { week: state.market.tick, kind: (delta > 0 ? 'studioRevenue' : 'overhead') as 'studioRevenue' | 'overhead', amount: delta, note: 'bridge-r07 fixture fund' },
      ],
    }
  }
  const { state: world, laboratoryFacilityIds: [, lab2], candidateIds } = p13bTwoLabWorld()
  let state = applyActions(
    world,
    candidateIds
      .slice(0, 4)
      .map((scientistId: string) => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'lighting-control-01' as const })),
  )
  const project = state.technology.projects.find((p) => p.technologyId === 'lighting-control-01')!
  state = applyActions(state, [{ kind: 'beginResearch', projectId: project.id, budgetPerWeek: 40_000 }])
  while (state.technology.projects.find((p) => p.id === project.id)!.status !== 'completed') {
    if (state.market.tick > 900) throw new Error('bridge-r07 fixture: lighting research did not complete before week 900')
    state = advanceTo(state, state.market.tick + 1)
  }
  state = fundTo(state, 5_000_000)
  state = applyActions(state, [{ kind: 'adoptTechnology', technologyId: 'lighting-control-01', stageFacilityId: STAGE_7 } as unknown as Action])
  const adoption = state.technology.adoptions.find((a) => a.technologyId === 'lighting-control-01' && a.stageFacilityId === STAGE_7)!
  while (state.technology.adoptions.find((a) => a.id === adoption.id)!.operationalWeek === null) state = tick(state)
  state = fundTo(state, 30_000_000)
  state = applyActions(state, [{ kind: 'strikeSet', setId: 'set-0' }])
  state = applyActions(state, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE_7 } }])
  for (let week = 0; week < TUNING.SET_BUILD_WEEKS_BAND_HIGH; week++) state = tick(state)
  const byRole = (role: string) => state.talent.filter((t) => t.role === role)
  const roster = [...byRole('writer').slice(0, 1), ...byRole('director').slice(0, 1), ...byRole('actor').slice(0, 3), ...byRole('craft').slice(0, 1)]
  state = applyActions(state, roster.map((t) => ({ kind: 'signContract' as const, talentId: t.id, termWeeks: 208 })))
  state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state) }])
  state = tick(state)
  state = tick(state)
  state = tick(state)
  lightingBallroomCache = state // week 806, rehearsal, bound STAGE_7
  return state
}

// ---------------------------------------------------------------------------

describe('P13B-S5-R07-T3 bridge projection bump (37 -> 38; 42 after the P14A.1-T3 bump)', () => {
  it('PROJECTION_VERSION is 40; schema $id and x-project-studio.projectionVersion move with it', () => {
    expect(PROJECTION_VERSION).toBe(42)
    expect(BRIDGE_SCHEMA.$id).toContain('projection-42')
    expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(42)
  })
  it('AVAILABLE_INTENT_KINDS gains productionSetupAction, distinct from every existing kind', () => {
    expect((AVAILABLE_INTENT_KINDS as readonly string[])).toContain('productionSetupAction')
  })
})

describe('requirement 2: each production snapshot gains setup: StudioProductionSetup | null', () => {
  it('conventional ballroom: null pre-selection; admission at week 12 with 0 credited; a held rehearsal names the setup wait and a weeksRemaining consistent with the forecast; walked week-by-week to Shooting entry 16', () => {
    const rehearsing = conventionalBallroomAtRehearsal('bridge-r07-setup-conventional')
    expect(rehearsing.market.tick).toBe(11)
    const productionId = rehearsing.studio.activeProductions[0]!.id
    expect(rowFor(new BridgeSession(rehearsing, 'bridge-r07-setup-conventional-pre'), productionId).setup).toBeNull()

    let state = tick(selectRecipe(rehearsing, productionId, 'ballroom-reveal-lighting-01'))
    expect(state.market.tick).toBe(12)
    let session = new BridgeSession(state, 'bridge-r07-setup-conventional-admitted')
    let row = rowFor(session, productionId)
    expect(row.phase).toBe('rehearsal')
    let setup = required(row.setup, 'productionOperations row published no setup at admission (projection-38 fact missing)')
    const recipe = required(SETUP_RECIPES.find((r) => r.id === 'ballroom-reveal-lighting-01'), 'ballroom-reveal-lighting-01 absent from SETUP_RECIPES')
    expect(setup.recipeId).toBe('ballroom-reveal-lighting-01')
    expect(setup.recipeLabel).toBe(recipe.name)
    expect(setup.route).toBe('conventional')
    expect(setup.requiredUnits).toBe(4)
    expect(setup.creditedUnits).toBe(0)
    expect(setup.admittedWeek).toBe(12)
    expect(setup.completedWeek).toBeNull()
    expect(setup.adoptionId).toBeNull()
    expect(setup.stageFacilityId).toBe(STAGE_7)
    expect(setup.setId).toBe(state.operations.workflows[0]!.bindings.setId)
    expect(setup.planRevision).toBe(state.operations.workflows[0]!.planRevision)
    expect(setup.nextUnitWeek).toBe(13)
    expect(setup.forecastShootingEntryWeek).toBe(setupForecast(12, 4))
    expect(setup.forecastShootingEntryWeek).toBe(16)
    expect(row.statusLabel.toLowerCase()).toContain('setup')
    expect(row.weeksRemaining).toBe(setup.forecastShootingEntryWeek! - state.market.tick)
    expect(row.weeksRemaining).toBe(4)

    for (let week = 13; week <= 16; week++) {
      state = tick(state)
      session = new BridgeSession(state, `bridge-r07-setup-conventional-w${String(week)}`)
      row = rowFor(session, productionId)
      setup = required(row.setup, `setup missing at week ${String(week)}`)
      expect(state.market.tick).toBe(week)
      expect(setup.creditedUnits).toBe(week - 12)
      if (week < 16) {
        expect(row.phase).toBe('rehearsal')
        expect(setup.completedWeek).toBeNull()
        expect(setup.nextUnitWeek).toBe(week + 1)
        expect(row.weeksRemaining).toBe(16 - week)
      } else {
        expect(row.phase).toBe('shooting')
        expect(setup.completedWeek).toBe(16)
        expect(setup.nextUnitWeek).toBeNull()
        // The engine's own validator allows a COMPLETED record on a
        // non-rehearsal workflow (validateProductionSetup, productionSetup.ts,
        // "an unfinished setup stands on a production that has left rehearsal"
        // is the ONLY thing it refuses) — setup is not nulled at Shooting entry.
      }
    }
  })
})

describe('requirement 3: setup-recipe-<productionId>-<recipeId> rows, offered pre-Shooting with a bound stage whose Set type matches the recipe — PREMISE: published as setupRecipeActions on the same productionOperations row', () => {
  it('the eligible ballroom recipe row is enabled, carries productionId/recipeId/planRevision, intent kind productionSetupAction, no rejections', () => {
    const rehearsing = conventionalBallroomAtRehearsal('bridge-r07-recipe-row-ok')
    const productionId = rehearsing.studio.activeProductions[0]!.id
    const session = new BridgeSession(rehearsing, 'bridge-r07-recipe-row-ok')
    const row = rowFor(session, productionId)
    const rowId = `setup-recipe-${productionId}-ballroom-reveal-lighting-01`
    const action = required(
      row.setupRecipeActions?.find((a) => a.id === rowId),
      `row "${rowId}" absent from ${JSON.stringify(row.setupRecipeActions?.map((a) => a.id) ?? [])}`,
    )
    expect(action.productionId).toBe(productionId)
    expect(action.recipeId).toBe('ballroom-reveal-lighting-01')
    expect(action.planRevision).toBe(rehearsing.operations.workflows[0]!.planRevision)
    expect(action.enabled).toBe(true)
    expect(action.refusal).toBeNull()
    expect(action.rejections).toEqual([])
    expect(action.intent?.kind).toBe('productionSetupAction')
  })

  it('a wrong-Set-type row (ordinary recipe on a ballroom-bound production) is disabled, names its own refusal, and enabled agrees with the refusal', () => {
    const rehearsing = conventionalBallroomAtRehearsal('bridge-r07-recipe-row-wrong-type')
    const productionId = rehearsing.studio.activeProductions[0]!.id
    const session = new BridgeSession(rehearsing, 'bridge-r07-recipe-row-wrong-type')
    const row = rowFor(session, productionId)
    const rowId = `setup-recipe-${productionId}-ordinary-interior-01`
    const action = required(
      row.setupRecipeActions?.find((a) => a.id === rowId),
      `row "${rowId}" absent from ${JSON.stringify(row.setupRecipeActions?.map((a) => a.id) ?? [])}`,
    )
    expect(action.enabled).toBe(false)
    expect(action.refusal).not.toBeNull()
    expect(action.rejections).toContain(action.refusal)
    expect(action.disabledReason).toBe(action.refusal)
  })

  it('rows are absent once the production enters Shooting (legacy path: no recipe ever selected)', () => {
    const rehearsing = conventionalBallroomAtRehearsal('bridge-r07-recipe-row-gone')
    const productionId = rehearsing.studio.activeProductions[0]!.id
    const shooting = tick(rehearsing)
    expect(shooting.operations.workflows[0]!.phase).toBe('shooting')
    const session = new BridgeSession(shooting, 'bridge-r07-recipe-row-gone')
    const row = rowFor(session, productionId)
    expect(row.setupRecipeActions ?? []).toEqual([])
  })
})

describe('requirement 4: committing a recipe row through the bridge', () => {
  it('writes exactly one setup record, advances stateRevision, refuses the same intent at the old revision, and the forecast matches setupForecast once the sweep visit admits it', () => {
    const rehearsing = conventionalBallroomAtRehearsal('bridge-r07-commit')
    const productionId = rehearsing.studio.activeProductions[0]!.id
    const session = new BridgeSession(rehearsing, 'bridge-r07-commit')
    expect(session.gameState.operations.workflows[0]!.setup).toBeNull()

    const rowId = `setup-recipe-${productionId}-ballroom-reveal-lighting-01`
    const before = rowFor(session, productionId)
    const action = required(
      before.setupRecipeActions?.find((a) => a.id === rowId),
      `row "${rowId}" absent from ${JSON.stringify(before.setupRecipeActions?.map((a) => a.id) ?? [])}`,
    )
    const staleRevision = session.stateRevision
    const intentId = required(action.intent, 'no intent on the recipe row').intentId

    const response = session.command(command(session, intentId, nextCommandId('commit-recipe')))
    expect(response.accepted).toBe(true)
    if (!response.accepted) throw new Error(`recipe row commit refused: ${JSON.stringify(response)}`)
    expect(session.stateRevision).not.toBe(staleRevision)

    const workflow = required(
      session.gameState.operations.workflows.find((w) => w.productionId === productionId),
      'no workflow for this production after commit',
    )
    const record = required(workflow.setup, 'core engine wrote no setup record on commit')
    expect(record.recipeId).toBe('ballroom-reveal-lighting-01')
    expect(record.route).toBe('conventional')
    expect(record.requiredUnits).toBe(4)
    expect(record.creditedUnits).toBe(0)
    expect(record.admittedWeek).toBeNull() // not yet the sweep visit — selected DURING rehearsal
    expect(record.stageFacilityId).toBe(STAGE_7)

    const justAfter = required(rowFor(session, productionId).setup, 'no setup published immediately after commit')
    expect(justAfter.admittedWeek).toBeNull()
    expect(justAfter.forecastShootingEntryWeek).toBeNull()
    expect(justAfter.nextUnitWeek).toBeNull()

    const staleResponse = session.command(command(session, intentId, nextCommandId('commit-recipe-stale'), staleRevision))
    expect(staleResponse).toMatchObject({ accepted: false, reasonCode: 'STALE_REVISION' })
    expect(session.gameState.operations.workflows.filter((w) => w.productionId === productionId)).toHaveLength(1)
    expect(required(session.gameState.operations.workflows.find((w) => w.productionId === productionId), 'workflow vanished').setup).not.toBeNull()

    const afterTickSession = new BridgeSession(tick(session.gameState), 'bridge-r07-commit-after-sweep')
    const afterTickSetup = required(rowFor(afterTickSession, productionId).setup, 'no setup published after the sweep visit')
    expect(afterTickSetup.admittedWeek).toBe(12)
    expect(afterTickSetup.forecastShootingEntryWeek).toBe(setupForecast(12, 4))
  })
})

describe('requirement 5: ticking through the bridge credits one unit per week and enters Shooting at the forecast week, on all three measured fixtures; the four setup history kinds appear on the history view', () => {
  it('conventional ballroom: admission 12 -> Shooting entry 16, history rows setupAdmitted/setupUnitCredited x4/setupCompleted, production-scoped', () => {
    const rehearsing = conventionalBallroomAtRehearsal('bridge-r07-tick-conventional')
    const productionId = rehearsing.studio.activeProductions[0]!.id
    let state = tick(selectRecipe(rehearsing, productionId, 'ballroom-reveal-lighting-01'))
    expect(state.market.tick).toBe(12)
    for (let week = 13; week <= 16; week++) state = tick(state)
    expect(state.market.tick).toBe(16)

    const session = new BridgeSession(state, 'bridge-r07-tick-conventional-final')
    const row = rowFor(session, productionId)
    expect(row.phase).toBe('shooting')
    expect(required(row.setup, 'setup missing at Shooting entry').completedWeek).toBe(16)

    const served = session.snapshot()
    const events = required(
      (served.snapshot as unknown as { operationsEvents?: { operationsEvents: { rows: { kind: string; week: number; subject: { kind: string; id: string } | null }[] } } }).operationsEvents,
      'operationsEvents section absent from the served snapshot',
    ).operationsEvents
    const setupKinds = ['setupAdmitted', 'setupUnitCredited', 'setupCompleted'] as const
    const setupRows = events.rows.filter((r) => (setupKinds as readonly string[]).includes(r.kind))
    expect(setupRows.some((r) => r.kind === 'setupAdmitted' && r.week === 12)).toBe(true)
    expect(setupRows.filter((r) => r.kind === 'setupUnitCredited')).toHaveLength(4)
    expect(setupRows.some((r) => r.kind === 'setupCompleted' && r.week === 16)).toBe(true)
    for (const setupRow of setupRows) {
      const subject = required(setupRow.subject, `setup history row (kind ${setupRow.kind}, week ${String(setupRow.week)}) publishes no subject`)
      expect(subject.kind).toBe('production')
      expect(subject.id).toBe(productionId)
    }
  })

  it('lighting ballroom: admission 807 -> Shooting entry 809, route "lighting"', () => {
    const rehearsing = lightingBallroomAtRehearsal()
    expect(rehearsing.market.tick).toBe(806)
    const productionId = rehearsing.studio.activeProductions[0]!.id
    let state = tick(selectRecipe(rehearsing, productionId, 'ballroom-reveal-lighting-01'))
    expect(state.market.tick).toBe(807)
    for (let week = 808; week <= 809; week++) state = tick(state)
    expect(state.market.tick).toBe(809)

    const session = new BridgeSession(state, 'bridge-r07-tick-lighting-final')
    const row = rowFor(session, productionId)
    expect(row.phase).toBe('shooting')
    const setup = required(row.setup, 'setup missing at Shooting entry')
    expect(setup.route).toBe('lighting')
    expect(setup.requiredUnits).toBe(2)
    expect(setup.completedWeek).toBe(809)
  })

  it('ordinary interior: admission 4 -> Shooting entry 5, both routes agree at 1 unit', () => {
    const rehearsing = ordinaryAtRehearsal('bridge-r07-tick-ordinary')
    expect(rehearsing.market.tick).toBe(3)
    const productionId = rehearsing.studio.activeProductions[0]!.id
    let state = tick(selectRecipe(rehearsing, productionId, 'ordinary-interior-01'))
    expect(state.market.tick).toBe(4)
    state = tick(state)
    expect(state.market.tick).toBe(5)

    const session = new BridgeSession(state, 'bridge-r07-tick-ordinary-final')
    const row = rowFor(session, productionId)
    expect(row.phase).toBe('shooting')
    expect(required(row.setup, 'setup missing at Shooting entry').completedWeek).toBe(5)
  })
})

describe('requirement 6: player-safe; a legacy production publishes setup: null with its schedule unchanged', () => {
  it('every productionOperations row belongs to this studio\'s own activeProductions — MEASURED: the engine has no rival production model to leak (operations/placement are single, player-scoped roots, the same fact tests/bridge-p13b-s4-office.test.ts case 7 and tests/bridge-p13b-s5-adoption.test.ts requirement 6 both rely on for their own rival-injection idiom)', () => {
    const rehearsing = conventionalBallroomAtRehearsal('bridge-r07-player-safe')
    const productionId = rehearsing.studio.activeProductions[0]!.id
    const state = tick(selectRecipe(rehearsing, productionId, 'ballroom-reveal-lighting-01'))
    const session = new BridgeSession(state, 'bridge-r07-player-safe')
    const ownIds = new Set(state.studio.activeProductions.map((p) => p.id))
    for (const row of productionRows(session)) expect(ownIds.has(row.productionId)).toBe(true)
    const json = JSON.stringify(session.snapshot())
    // No rival studio identity can appear beside a setup fact this studio built.
    for (const identity of state.hollywood?.identities ?? []) {
      if (identity.studioId === state.hollywood?.playerStudioId) continue
      expect(json.includes(identity.studioId) && json.includes('"setupRecipeActions"')).toBe(false)
    }
  })

  it('legacy timeline byte-identical through the bridge: a production that never selects a recipe publishes setup: null and today\'s exact (unheld) schedule', () => {
    const rehearsing = conventionalBallroomAtRehearsal('bridge-r07-legacy')
    expect(rehearsing.market.tick).toBe(11)
    const productionId = rehearsing.studio.activeProductions[0]!.id
    const shooting = tick(rehearsing) // no recipe ever selected -> unconditional advance, exactly as today
    expect(shooting.market.tick).toBe(12)
    expect(shooting.operations.workflows[0]!.phase).toBe('shooting')
    expect(shooting.studio.activeProductions[0]!.remainingTicks).toBe(5) // the hold never engaged
    const session = new BridgeSession(shooting, 'bridge-r07-legacy')
    const row = rowFor(session, productionId)
    expect(row.setup).toBeNull()
    expect(row.phase).toBe('shooting')
  })
})

describe('extra pin (parent instruction): the bridge\'s save/load "converted" report against the CURRENT save version, not a stale literal 23 (bridge/session.ts:123)', () => {
  it('RED: a genuine CURRENT (live-version) checkpoint saved and reloaded through the SAME bridge session reports converted: false', () => {
    const state = withCash(operationsStudio('bridge-r07-converted-current'), 5_000_000)
    const session = new BridgeSession(state, 'bridge-r07-converted-current')
    const saved = session.save(control(session, nextCommandId('save')))
    expect(saved.accepted).toBe(true)
    if (!saved.accepted) throw new Error(`save refused: ${JSON.stringify(saved)}`)
    const parsedSaveVersion = (JSON.parse(saved.saveJson) as { saveVersion: number }).saveVersion
    expect(parsedSaveVersion).toBe(28) // the CURRENT live version — confirms this is not genuinely a migration

    const loaded = session.load(control(session, nextCommandId('load')))
    expect(loaded.accepted).toBe(true)
    if (!loaded.accepted) throw new Error(`load refused: ${JSON.stringify(loaded)}`)
    // Today `converted = save.saveVersion !== 23`, so a genuine V25 reload
    // wrongly reads `25 !== 23 -> true` ("migrated"). This assertion names that
    // exact gap; it is RED against today's stale literal, not against a missing
    // projection-38 fact.
    expect(loaded.message).toBe('Authoritative TypeScript save loaded.')
  })

  // OMITTED, named rather than forced: a "genuine V24 fixture loaded through
  // the bridge reports converted: true" control case was attempted (construct
  // a `BridgeSession` with the raw V24 fixture bytes as the third constructor
  // argument, then call `.load()`) and produced a HARNESS ERROR, not a product
  // RED: `BridgeRuntimeCheckpointError: checkpoint.savedSaveJson: must be a
  // current V25 save, received V24`, thrown by `validateCanonicalCurrentSave`
  // (bridge/runtime-checkpoint.ts:451-453), which `session.load()` ALWAYS
  // consults via `prepareEntry` -> `createEncodedBridgeRuntimeCheckpoint`,
  // unconditionally, before the load can complete. That validator requires
  // `this.savedJson` to already be an exact, canonical, byte-preserved V25
  // save — REGARDLESS of `converted`'s own logic. MEASURED CONSEQUENCE: through
  // `session.load()`, `this.savedJson` can therefore never legitimately be a
  // pre-V25 envelope, so `converted` (whose whole purpose is to report an
  // ACTUAL migration) can in practice only ever observe `saveVersion === 25`
  // input — meaning `converted` reads `true` on every real `.load()` call
  // today (`25 !== 23`), which is exactly the same bug the RED case above
  // already demonstrates from the other direction. The `save.saveVersion !==
  // 23` comparison in `importSaveJsonCurrent` (bridge/session.ts:123) may
  // therefore be effectively DEAD/unreachable-as-correct code on this path,
  // not merely stale — a second, distinct finding beyond the literal-23 gap,
  // reported rather than worked around with an illegitimate construction.
})
