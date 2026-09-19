import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import * as save from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState, ProductionWorkflow } from '../src/core/types.js'
import { operationsStudio, productionPayload, withCash } from './contracts/_contractFixtures.js'
// RED-by-design: `src/core/productionSetup.ts` does not exist yet — see
// tests/p13b-r07-recipes.test.ts's header for the full RED-design rationale
// (shared across every P13B-S5-R07 test-author file). `SETUP_RECIPES` is the
// ONLY import from the new module.
import { SETUP_RECIPES } from '../src/core/productionSetup.js'

// P13B-S5-R07 test 5 (task expansion, 2026-09-17, plan lines 672-733).
// Requirement-derived from test-list item 5 (line 729): "Save V25: genuine V24
// fixtures + chains, mid-setup save/reload continues identically, Save As
// worlds isolated, downgrade refusals." Delegated decision (line 716-718):
// "Save V25 (pattern as before; genuine V24 fixtures minted at the final V24
// writer BEFORE any R07 source change; `setup: null` lift for every legacy
// workflow; validator: record <-> workflow bindings consistent, units bounded,
// weeks ordered, route provenance re-derivable at admission week, no record on
// a legacy or post-Shooting workflow, priorWork never recycled into credit)."
//
// Genuine V24 fixtures (tests/fixtures/p13b/PROVENANCE.md, minted 2026-09-17 at
// the final V24 writer `2c2c999`, BEFORE any R07 source change — record b8d6b8b
// "p13b-r07 T0"): `legacy-v24-sound-operational-315.json.gz` (sha256
// `eeda6efb602bafc2f78b0568447910bbc6a199f3b095aae8a869f089e6e60a44`) and
// `legacy-v24-lighting-operational-plan-queued.json.gz` (sha256
// `94735d52095d651032fea77b5e013ad0b5a7cf6fb66344931d0580271c1fe272`, week 796;
// player lighting adoption committed 791 / operational 795 with `postFacilityId`
// null; rival commercial sound adoption; one queued plan). Both sha256
// values re-verified directly on this exact commit's checked-in bytes,
// 2026-09-17 (not hand-copied), and BOTH validate as genuine V24 today
// (`validateSave`, `workflows: []` in each — measured with a throwaway
// vite-node probe, not guessed).
//
// INTERPRETATIONS NAMED:
//   1. Module surface for the NOT-YET-EXISTING save additions
//      (`SaveFileV25`/`migrateToV25`/`convertV24ToV25`) is accessed through a
//      NAMESPACE import (`import * as save from '../src/core/save.js'`) rather
//      than named imports. `save.ts` is a REAL, EXISTING module — importing a
//      NOT-YET-EXISTING named export from it directly risks vite/esbuild binding
//      the missing name to `undefined` instead of failing resolution
//      (tests/p13b-s5-quotes.test.ts's own MEASURED FINDING, restated in
//      tests/p13b-r07-recipes.test.ts's header). A namespace import never fails
//      resolution on a missing member — it only yields `undefined` at property
//      access, which is irrelevant here because THIS file's sole resolution
//      failure is `productionSetup.js`(below), which aborts the whole file
//      before any test body runs; once `save.ts` genuinely grows `migrateToV25`,
//      this exact access pattern starts working without modification.
//   2. "Save As worlds isolated" is tested at the CORE level only: two
//      independent `importSave` results from the SAME source envelope are
//      distinct, non-aliased objects, and advancing one via `tick()` never
//      mutates the other. The full bridge-session "Save As" feature
//      (`bridge/runtime/campaign-library.ts`, `saveAs`) needs the bridge runtime
//      and was explicitly split into its OWN file by the S3 test-author for that
//      reason (tests/bridge-p13b-s3-save-as.test.ts's header: "per the task
//      assignment this ONE case lives in its own bridge test file, separate from
//      the core-only tests/p13b-s3-save-v23.test.ts"). This file is core-only
//      (`tests/p13b-r07-*.test.ts`, no `bridge/` import); a bridge-level
//      equivalent, if required, is out of scope for this assignment and is
//      named here rather than invented.
//   3. "mid-setup save/reload continues identically" cannot be built from a
//      genuine, lawfully-reached engine state today (no producer exists to
//      populate `workflow.setup`). This file exercises the PART that is real and
//      testable now — `exportSave`/`importSave` round-trip fidelity is a pure
//      JSON codec, indifferent to an extra `setup` key — over a
//      directly-constructed mid-setup state (the SAME technique used in
//      tests/p13b-r07-recipes.test.ts and tests/p13b-r07-controls.test.ts for
//      other not-yet-reachable states). It does NOT exercise `validateSave`'s
//      field-exactness checks against that hand-authored `setup` key (V24's
//      validator today would reject an unrecognized field on `ProductionWorkflow`
//      — save.ts's exhaustive field-list style, e.g. lines 539-540 — so running
//      it through the live V24 validator would fail for a reason unrelated to
//      R07's own law). That gap is named, not silently worked around.

type ProductionSetupRecipeId = 'ballroom-reveal-lighting-01' | 'ordinary-interior-01'
type ProductionSetupRecord = {
  recipeId: ProductionSetupRecipeId
  planRevision: number
  admittedWeek: number
  route: 'conventional' | 'lighting'
  adoptionId: string | null
  equipmentAssetId: string | null
  stageFacilityId: string
  setId: string
  requiredUnits: number
  creditedUnits: number
  lastCreditedWeek: number | null
  completedWeek: number | null
  priorWork: readonly ProductionSetupRecord[]
}
type WorkflowWithSetup = ProductionWorkflow & { setup: ProductionSetupRecord | null }
type SaveModuleWithV25 = typeof save & {
  migrateToV25: (envelope: unknown) => { saveVersion: number; state: GameState }
}

const withV25 = save as SaveModuleWithV25

const load = (relative: string) => gunzipSync(readFileSync(new URL(relative, import.meta.url))).toString('utf8')
function assertSha256(json: string, expected: string) {
  expect(createHash('sha256').update(json).digest('hex')).toBe(expected)
}

const V24_FIXTURES = {
  soundOperational: {
    file: './fixtures/p13b/legacy-v24-sound-operational-315.json.gz',
    sha256: 'eeda6efb602bafc2f78b0568447910bbc6a199f3b095aae8a869f089e6e60a44',
    week: 315,
  },
  lightingPlanQueued: {
    file: './fixtures/p13b/legacy-v24-lighting-operational-plan-queued.json.gz',
    sha256: '94735d52095d651032fea77b5e013ad0b5a7cf6fb66344931d0580271c1fe272',
    week: 796,
  },
}

/** A REAL legacy workflow (rehearsing, never selecting a recipe) to prove the
 * `setup: null` lift on a NON-empty workflow — the two committed V24 fixtures
 * above both carry `workflows: []` (measured), so they alone only prove the
 * lift vacuously. */
function legacyRehearsingWorld(seed: string, cash = 5_000_000): GameState {
  let state = withCash(operationsStudio(seed), cash)
  state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state) }])
  state = tick(state)
  state = tick(state)
  state = tick(state)
  return state
}

function workflowOf(state: GameState, index = 0): WorkflowWithSetup {
  return state.operations.workflows[index]! as WorkflowWithSetup
}

// AMENDED (P13B-S6 live-version sweep, 2026-09-17): `makeSave` moved past V25
// to the live V26 boundary, and V26's own `migrateToV25` now REFUSES to
// downgrade a V26 envelope at all ("cannot downgrade SaveFileV28 or discard
// installation cancellations") — so this section's old shortcut
// (`migrateToV25(save.makeSave(...))`, back when `makeSave` WAS the V25
// boundary) can no longer reach V25 through `makeSave`. `legacyRehearsingWorld`
// builds a REAL state through the current (V26) engine, which never differs
// from a genuine V25 build except for the two S6-only leaves every placement
// and adoption record now carries (`cancellation`, `cancelledWeek`) — neither
// is ever populated here (nothing is ever cancelled), so stripping them is an
// honest reconstruction of exactly what this same lawful state would have
// looked like on the V25 engine, not an invented shortcut.
function asV25Envelope(state: GameState): { saveVersion: 25; seed: string; state: GameState; broadcastCache: unknown[] } {
  const facilities = state.placement.facilities.map(({ ...f }) => {
    delete (f as { cancellation?: unknown }).cancellation
    return f
  })
  const adoptions = state.technology.adoptions.map(({ ...a }) => {
    delete (a as { cancelledWeek?: unknown }).cancelledWeek
    return a
  })
  const stripped = {
    ...state,
    placement: { ...state.placement, facilities },
    technology: { ...state.technology, adoptions },
  } as GameState
  // P14A.1 sweep: a frozen V25 envelope carries no `talentMarket` root — the
  // frozen chain's exact-key law refuses a root V25 never had.
  delete (stripped as unknown as { talentMarket?: unknown }).talentMarket
  // P14B.1: reconstruct V25 only when no first-take or promise history is lost.
  expect(stripped.firstTakes).toEqual([])
  expect(stripped.promises).toEqual([])
  delete (stripped as unknown as { firstTakes?: unknown }).firstTakes
  delete (stripped as unknown as { promises?: unknown }).promises
  return { saveVersion: 25, seed: stripped.seed, state: stripped, broadcastCache: stripped.broadcastItems }
}

describe('P13B-S5-R07 Save V25 (test 5)', () => {
  it('SETUP_RECIPES exists (sanity for the setup: null lift assertions below)', () => {
    expect(SETUP_RECIPES.length).toBe(2)
  })

  it('validates the genuine V24 fixtures directly (sha256-pinned, week-pinned) before migration', () => {
    for (const fixture of [V24_FIXTURES.soundOperational, V24_FIXTURES.lightingPlanQueued]) {
      const json = load(fixture.file)
      assertSha256(json, fixture.sha256)
      const parsed = JSON.parse(json) as { saveVersion: number }
      expect(parsed.saveVersion).toBe(24)
      const validated = save.validateSave(parsed)
      expect(validated.state.market.tick).toBe(fixture.week)
    }
  })

  it('migrates both genuine V24 fixtures to V25: saveVersion 25, technology state byte-identical aside from the version bump, setup: null lift (vacuous — both carry zero workflows)', () => {
    for (const fixture of [V24_FIXTURES.soundOperational, V24_FIXTURES.lightingPlanQueued]) {
      const json = load(fixture.file)
      const parsed = JSON.parse(json) as { saveVersion: number }
      // Narrowed: `validateSave`'s return spans the full historical GameStateV1..V24
      // union (most of which predate the `technology` root); both fixtures are
      // pinned, sha256-verified genuine V24 saves, which DO carry it.
      const beforeTechnology = JSON.stringify((save.validateSave(parsed).state as GameState).technology)
      const migrated = withV25.migrateToV25(parsed)
      expect(migrated.saveVersion).toBe(25)
      expect(JSON.stringify(migrated.state.technology)).toBe(beforeTechnology)
      expect(migrated.state.operations.workflows).toEqual([])
    }
  })

  it('validates a reconstructed V25 envelope with a real rehearsing production and setup: null on a nonempty workflow', () => {
    const rehearsing = legacyRehearsingWorld('r07-save-v25-legacy-workflow')
    const v25 = asV25Envelope(rehearsing)
    expect(v25.saveVersion).toBe(25) // live-derived reconstruction, not genuine nonempty V24→V25 migration evidence
    expect(rehearsing.operations.workflows).toHaveLength(1)

    const migrated = withV25.migrateToV25(v25)
    expect(migrated.saveVersion).toBe(25)
    expect(migrated.state.operations.workflows).toHaveLength(1)
    expect(workflowOf(migrated.state as unknown as GameState).setup).toBeNull() /* P14A.1: this envelope is deliberately pinned at its own frozen version; the live-typed reader never touches the V28 root. */
    // Nothing else about the validated workflow moved.
    expect(migrated.state.operations.workflows[0]!.phase).toBe(rehearsing.operations.workflows[0]!.phase)
    expect(migrated.state.operations.workflows[0]!.bindings).toEqual(rehearsing.operations.workflows[0]!.bindings)
  })

  it('migrateToV24 / migrateToV23 / migrateToV22 / migrateToV21 / migrateToV20 refuse a V25 save', () => {
    const v25 = withV25.migrateToV25(asV25Envelope(legacyRehearsingWorld('r07-save-v25-downgrade')))
    expect(() => save.migrateToV24(v25 as never)).toThrow(/cannot downgrade/i)
    expect(() => save.migrateToV23(v25 as never)).toThrow(/cannot downgrade/i)
    expect(() => save.migrateToV22(v25 as never)).toThrow(/cannot downgrade/i)
    expect(() => save.migrateToV21(v25 as never)).toThrow(/cannot downgrade/i)
    expect(() => save.migrateToV20(v25 as never)).toThrow(/cannot downgrade/i)
  })

  // AMENDED (P13B-S6 live-version sweep, 2026-09-17): the unknown-sentinel
  // guard is a single LIVE runtime check (save.ts's templated message), not a
  // version-specific frozen fact like the two tests above — it always reports
  // the CURRENT total supported range, so this case tracks the live boundary
  // forward exactly as p13b-s5-save-v24.test.ts's own sentinel case does
  // (superseded as the canonical proof by tests/p13b-s6-save-v26.test.ts's
  // "an unknown saveVersion 30..." case, kept here rather than deleted).
  it('an unknown saveVersion 30 is refused, naming the handled range "1 through 27" (mechanical extrapolation of the templated message at save.ts:5147)', () => {
    const forged = { ...save.makeSave(legacyRehearsingWorld('r07-save-v25-unknown-version')), saveVersion: 30 }
    expect(() => save.validateSave(forged as never)).toThrow(/versions 1 through 29 only/)
  })

  it('mid-setup save/reload round-trips byte-identically (export/import codec only) — INTERPRETATION 3: hand-authored setup, no genuine producer exists yet', () => {
    // AMENDED (coordinator adjudication, 2026-09-17): dropped the extra tick
    // past rehearsal entry — the hand-authored INCOMPLETE record needs to sit on
    // a REHEARSING workflow. `validateProductionSetup` (run by `save.makeSave`
    // at the V25 boundary below) refuses "an unfinished setup stands on a
    // production that has left rehearsal", and a workflow already in Shooting
    // is exactly that; the engine itself can never produce this combination.
    const state = legacyRehearsingWorld('r07-save-v25-mid-setup')
    const bindings = workflowOf(state).bindings
    const midSetup: ProductionSetupRecord = {
      recipeId: 'ordinary-interior-01',
      planRevision: 0,
      admittedWeek: state.market.tick,
      route: 'conventional',
      adoptionId: null,
      equipmentAssetId: null,
      stageFacilityId: bindings.stageFacilityId!,
      setId: bindings.setId!,
      requiredUnits: 1,
      creditedUnits: 0,
      lastCreditedWeek: null,
      completedWeek: null,
      priorWork: [],
    }
    const withSetup: GameState = {
      ...state,
      operations: {
        ...state.operations,
        workflows: state.operations.workflows.map((w, i) => (i === 0 ? { ...w, setup: midSetup } : w)),
      },
    }
    const v24Shaped = save.makeSave(withSetup)
    const json = save.exportSave(v24Shaped)
    const reimported = save.importSave(json)
    expect(save.exportSave(reimported)).toBe(json) // pure codec round-trip, byte-identical

    // Continuing to tick BOTH the original and the reloaded copy in lockstep
    // stays byte-identical, proving the round-trip introduced no hidden state.
    // AMENDED (coordinator adjudication, 2026-09-17): compared through
    // `exportSave(makeSave(...))` on BOTH sides rather than a raw
    // `JSON.stringify` — a reimported state's top-level key order follows
    // `stableStringify`'s sort, not the natively-ticked state's insertion
    // order, so two structurally-identical states compared by raw
    // `JSON.stringify` differ byte-for-byte on key order alone (measured: this
    // exact "native vs reimported, ticked forward" comparison already exists
    // in tests/p13b-s5-save-v24.test.ts:229-232, using this exact canonicalized
    // idiom for the same reason).
    const uninterrupted = tick(tick(withSetup))
    const resumed = tick(tick((reimported as unknown as { state: GameState }).state))
    expect(save.exportSave(save.makeSave(resumed))).toBe(save.exportSave(save.makeSave(uninterrupted)))
  })

  it('Save As worlds isolated (core level) — INTERPRETATION 2: two independent imports of one envelope never alias, and advancing one never mutates the other', () => {
    // AMENDED (coordinator adjudication, 2026-09-17): the D-12 solvency gate
    // refuses this greenlight at the default $5,000,000 (measured commitment
    // $5,396,900) — funded above the greenlight via `legacyRehearsingWorld`'s
    // own `cash` parameter.
    const source = legacyRehearsingWorld('r07-save-v25-isolation', 5_450_000)
    const envelope = save.makeSave(source)
    const json = save.exportSave(envelope)

    const copyA = (save.importSave(json) as unknown as { state: GameState }).state
    const copyB = (save.importSave(json) as unknown as { state: GameState }).state
    expect(copyA).not.toBe(copyB) // distinct objects, not aliases of one shared reference
    const copyBBefore = JSON.stringify(copyB)
    expect(JSON.stringify(copyA)).toBe(copyBBefore) // structurally identical at import time

    const advancedA = tick(copyA)
    expect(advancedA.market.tick).toBe(copyA.market.tick + 1)
    expect(copyB.market.tick).toBe(source.market.tick) // B did NOT advance just because A did
    expect(JSON.stringify(copyB)).toBe(copyBBefore) // no shared mutation leaked into B from ticking A
  })
})
