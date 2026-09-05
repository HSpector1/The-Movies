// ── C2a-M1 · T9 — THE HEADLINE MATRIX (§8.3, G4) ────────────────────────────
//
// CHARTER (r3.2 §8.3): "T9 covers EVERY phase that holds a reservation
// (development through post × blocker kinds), migrated then played
// byte-identically vs its V13 twin ≥30 weeks."  §14: "G4 the §8.3 migration
// matrix incl. every-held-phase T9."  §12-M1 makes the COMPLETE migrator —
// endowed house-set synthesis included — land in this milestone.
//
// THE TEMPLATE. This suite is the one-version-on form of
// `tests/property-state-v13.test.ts` ("plays a migrated V12 world byte-identically
// to a native V13 world for 30+ weeks"), with one deliberate and stated change.
//
// WHAT "BYTE-IDENTICALLY VS ITS V13 TWIN" CAN MEAN, HONESTLY. The V13 engine is
// not linkable from this tree, so no test can literally run V13 semantics. What
// the V13 twin HAS is a V13 state; what it does NOT have is a single V14 root.
// So the comparison is made where the twin actually lives: the migrated save is
// played forward under the real engine and its V13 PROJECTION is compared, week
// by week, against the same projection of a world that never went through
// migration at all. Every V13-visible byte — cash, ledger, rngState, phases,
// reservations, blockers, shooting tasks, releases — must agree for the whole
// run. The V14 roots are compared separately and by their own law (§8.3's
// grandfather), because the twin has no opinion about them.
//
// A full state-vs-state byte comparison would be FALSE here and is not claimed:
// §8.3 stamps `heldSinceWeek` with the migration week, and §5 has the engine
// append a studio-event ledger the played world accumulated and the loaded one
// did not. Asserting equality there would be asserting something the charter
// says is untrue.
//
// CONTRACT-FIRST: every expectation comes from the charter text via
// `tests/contracts/_v14Contract.ts`. Failures against a pre-engine tree are the
// contract reporting itself, not a regression.

import { beforeAll, describe, expect, it } from 'vitest'

import {
  assertStudioOperationsInvariants,
  generateWorld,
  makeSaveV13,
  migrateToV17,
  validateSave,
  stableStringify,
  tick,
  validateSaveV13,
} from '../src/core/index.js'
import type { GameState } from '../src/core/index.js'
// The M0 single source for the reachable-blocker table (§12-M0's G6 module).
// Imported directly because `index.ts` does not re-export it; the
// `acceptance-corpus.test.ts` precedent for reaching a named core module stands.
import { reachableCapacityBlockerForRemainingTicks } from '../src/core/productionPhases.js'

import {
  buildHeadlineFixtures,
  historicalV13Form,
  CHARTER_GENRES,
  CHARTER_HEADLINE_MATRIX,
  CHARTER_UNREACHABLE_CAPACITY_BLOCKER_TICKS,
  HOUSE_SET_MOUNTS,
  HOUSE_SET_NAMES,
  LEGACY_MIGRATED_NEXT_SET_ID,
  MANAGED_MIGRATED_NEXT_SET_ID,
  projectToV13State,
  requireBindings,
  requireStudioEvents,
  scriptedWeek,
  STUDIO_SET_KEYS,
  T9_RUN_WEEKS,
  v13TwinOf,
  v14RootsOf,
  loadV14SaveModule,
} from './contracts/_v14Contract.js'
import type { HeadlineFixture, V14SaveModule } from './contracts/_v14Contract.js'

const SEED = 'c2a-m1-t9-headline'

let v14: V14SaveModule
let loadFailure: unknown = null
let fixtures: HeadlineFixture[] = []

beforeAll(async () => {
  try {
    v14 = await loadV14SaveModule()
  } catch (error) {
    loadFailure = error
  }
  fixtures = buildHeadlineFixtures(SEED)
})

function requireV14(): V14SaveModule {
  if (loadFailure !== null) throw loadFailure
  return v14
}

function fixtureFor(key: string): HeadlineFixture {
  const found = fixtures.find((entry) => entry.cell.key === key)
  if (found === undefined) throw new Error(`T9: no fixture built for cell ${key}`)
  return found
}

function stateOf(envelope: { state: Record<string, unknown> }): GameState {
  return envelope.state as unknown as GameState
}

// ── (A) the matrix is REAL — every cell legal, every gap unreachable ────────

describe('C2a-M1 · T9 (A) — the headline matrix covers every phase that holds a reservation', () => {
  it('names all five reservation-holding phases and no others', () => {
    const phases = [...new Set(CHARTER_HEADLINE_MATRIX.map((cell) => cell.phase))]
    expect(phases).toEqual([
      'development',
      'preProduction',
      'rehearsal',
      'shooting',
      'postProduction',
    ])
  })

  it('holds a real reservation in every cell', () => {
    for (const { cell, native } of fixtures) {
      const workflow = native.operations.workflows[0]!
      expect(workflow.phase, cell.key).toBe(cell.phase)
      expect(native.studio.activeProductions[0]!.remainingTicks, cell.key).toBe(cell.remainingTicks)
      expect(workflow.reservations.length, `${cell.key} holds no reservation`).toBeGreaterThan(0)
    }
  })

  it('carries the blocker arm the cell names, and the engine agrees it is reachable', () => {
    for (const { cell, native } of fixtures) {
      const blocker = native.operations.workflows[0]!.blocker
      if (cell.blockerKind === 'none') {
        expect(blocker, cell.key).toBeNull()
        continue
      }
      expect(blocker?.kind, cell.key).toBe(cell.blockerKind)
      if (cell.blockerKind === 'facility-capacity' && blocker?.kind === 'facility-capacity') {
        expect(blocker.capability, cell.key).toBe(cell.capability)
        expect(blocker.targetPhase, cell.key).toBe(cell.targetPhase)
        // The charter's table, checked against the ONE engine table that decides it.
        expect(
          reachableCapacityBlockerForRemainingTicks(cell.remainingTicks),
          cell.key,
        ).toEqual({ capability: cell.capability, targetPhase: cell.targetPhase })
      }
      // The forged cells are legal states, not merely plausible ones.
      assertStudioOperationsInvariants(native.operations, native.studio.activeProductions)
    }
  })

  it('proves the two absent capacity cells unreachable rather than merely skipped', () => {
    for (const remainingTicks of CHARTER_UNREACHABLE_CAPACITY_BLOCKER_TICKS) {
      expect(
        reachableCapacityBlockerForRemainingTicks(remainingTicks),
        `remainingTicks ${String(remainingTicks)}`,
      ).toBeNull()
    }
  })

  it('projects a genuine, legal V13 file for every cell', () => {
    for (const { cell, native } of fixtures) {
      const twin = v13TwinOf(native)
      expect(twin.saveVersion, cell.key).toBe(13)
      // v13TwinOf validates; re-stating it here makes the proof visible.
      expect(() => validateSaveV13(twin), cell.key).not.toThrow()
      for (const root of ['sets', 'nextSetId', 'productionQueue', 'originalScreenplays', 'studioEvents']) {
        expect(root in twin.state, `${cell.key} twin must not carry ${root}`).toBe(false)
      }
    }
  })

  // The twin is HAND-PROJECTED (see `_v14Contract.ts`), which is a claim about
  // what a real V13 file looks like. Wherever the engine's own frozen V13 builder
  // will write the same state, that claim is checkable rather than merely
  // reasoned — and it is checked, cell by cell. A builder that refuses is a legal
  // answer for a state carrying V14 authority; a builder that writes something
  // ELSE would mean the whole T9 comparison is against a file that never existed.
  //
  // C2a-M1M2 ADJUDICATION. From §5 the engine appends its own history, so every
  // one of these played cells carries studio-event rows — and the frozen builder
  // refuses ALL nine, which made this corroboration vacuous. The builder is right
  // to refuse (a V13 envelope has no room for a log, and `convertV13ToV14` cannot
  // put invented rows back); that refusal is asserted in its own right by
  // `contracts/v14-boundary-guards.contract.test.ts`, which accepts either arm.
  // So the builder is handed the state the twin actually CLAIMS to be — the same
  // world in the form a V13 file can describe — and corroborates all nine cells
  // instead of none. Neither this assertion nor the guard moved.
  it('agrees byte-for-byte with the frozen V13 builder wherever that builder writes', () => {
    const module = requireV14()
    void module
    let checked = 0
    for (const { cell, native } of fixtures) {
      const historical = historicalV13Form(native)
      // The V13 twin of the historical form and of the played world are the same
      // file: `projectToV13State` deletes the log from both.
      expect(
        stableStringify(v13TwinOf(historical).state),
        `${cell.key}: clearing the log changed the V13 twin`,
      ).toBe(stableStringify(v13TwinOf(native).state))
      let written: { saveVersion: number; state: Record<string, unknown> }
      try {
        written = makeSaveV13(
          historical as unknown as Parameters<typeof makeSaveV13>[0],
        ) as unknown as {
          saveVersion: number
          state: Record<string, unknown>
        }
      } catch (error) {
        expect(
          (error as Error).message,
          `${cell.key}: makeSaveV13 failed for a reason that is not a downgrade refusal`,
        ).toMatch(/cannot downgrade/)
        continue
      }
      expect(stableStringify(written.state), `${cell.key}`).toBe(
        stableStringify(v13TwinOf(native).state),
      )
      checked += 1
    }
    expect(
      checked,
      'the frozen V13 builder refused every cell, so the hand-projected twin was never ' +
        'corroborated by the engine itself',
    ).toBeGreaterThan(0)
  })
})

// ── (B) T9 proper — migrate, then play ≥30 weeks against the twin ───────────

describe('C2a-M1 · T9 (B) — every held phase × blocker kind migrates and plays true', () => {
  for (const cell of CHARTER_HEADLINE_MATRIX) {
    it(`migrates ${cell.key} to V14 without touching one V13-visible byte`, () => {
      const module = requireV14()
      const { native } = fixtureFor(cell.key)
      const twin = v13TwinOf(native)

      const migrated = module.migrateToV14(twin)
      expect(migrated.saveVersion).toBe(14)

      // §8.3: "Derivations are facts, not guesses" — and everything V13 owned
      // crosses untouched.
      expect(stableStringify(projectToV13State(stateOf(migrated)))).toBe(
        stableStringify(twin.state),
      )

      // §8.3: "zero RNG; `rngState` byte-identical".
      expect(stateOf(migrated).rngState).toBe(native.rngState)
      expect(stateOf(migrated).market.tick).toBe(native.market.tick)

      // The two doors agree, and the migrator is idempotent at its own version.
      expect(stableStringify(module.convertV13ToV14(twin))).toBe(stableStringify(migrated))
      expect(stableStringify(module.migrateToV14(migrated))).toBe(stableStringify(migrated))

      // The migrated file is a legal V14 file by the real V14 authority.
      expect(() => module.validateSaveV14(migrated)).not.toThrow()
    })

    it(`plays ${cell.key} byte-identically to its V13 twin for ${String(T9_RUN_WEEKS)} weeks`, () => {
      const module = requireV14()
      const { native } = fixtureFor(cell.key)
      const twin = v13TwinOf(native)

      // P06A: the LIVE engine demands the V16 root — the twin migrates the
      // rest of the way to live before playing. The weekly comparison still
      // projects BOTH sides down to the V13 surface, so the claim under test
      // (V13-visible behavior identical) is exactly what it always was.
      let fromMigrated = migrateToV17(validateSave(module.migrateToV14(twin))).state
      let fromNative = native

      const startWeek = native.market.tick
      const startLedger = native.ledger.length

      for (let week = 1; week <= T9_RUN_WEEKS; week++) {
        fromMigrated = scriptedWeek(fromMigrated)
        fromNative = scriptedWeek(fromNative)

        // The whole V13 surface, every single week — not merely at the end.
        expect(
          stableStringify(projectToV13State(fromMigrated)),
          `${cell.key} diverged from its V13 twin at week ${String(week)}`,
        ).toBe(stableStringify(projectToV13State(fromNative)))

        // §8.3's grandfather, held for the entire run: an in-flight migrated
        // production never acquires a set.
        for (const workflow of fromMigrated.operations.workflows) {
          const bindings = requireBindings(workflow, `${cell.key} week ${String(week)}`)
          expect(bindings.requiresSetBinding).toBe(false)
          expect(bindings.setId).toBeNull()
          expect(bindings.lockedNovelty).toBeNull()
          expect(bindings.lockedUplift).toBeNull()
        }
      }

      // Non-vacuity: the run really did the work the comparison claims.
      expect(fromNative.market.tick).toBe(startWeek + T9_RUN_WEEKS)
      expect(fromMigrated.market.tick).toBe(startWeek + T9_RUN_WEEKS)
      expect(fromNative.ledger.length).toBeGreaterThan(startLedger)
      expect(stableStringify(fromNative)).not.toBe(stableStringify(native))
    })
  }

  it('reaches wrap and release inside the window on the unblocked cells', () => {
    requireV14()
    const { native } = fixtureFor('development/none')
    let played = native
    for (let week = 0; week < T9_RUN_WEEKS; week++) played = scriptedWeek(played)
    expect(
      played.studio.releasedFilms.length,
      'the scripted 30-week run must actually release a picture, or T9 proves nothing',
    ).toBeGreaterThan(native.studio.releasedFilms.length)
  })
})

// ── (C) the endowed-sets derivation (§8.3, §3.1) ────────────────────────────

describe('C2a-M1 · T9 (C) — the endowed house sets are DERIVED, not invented', () => {
  it('gives a managed-mode migrated save exactly the two house sets and nextSetId 2', () => {
    const module = requireV14()
    const { native } = fixtureFor('rehearsal/none')
    expect(native.operations.mode).toBe('managed')

    const migrated = stateOf(module.migrateToV14(v13TwinOf(native)))
    const roots = v14RootsOf(migrated)
    const sets = roots.sets ?? []

    expect(sets).toHaveLength(HOUSE_SET_NAMES.length)
    expect(roots.nextSetId).toBe(MANAGED_MIGRATED_NEXT_SET_ID)
    expect(sets.map((entry) => entry.name)).toEqual([...HOUSE_SET_NAMES])
    expect(sets.map((entry) => entry.mountedOn)).toEqual([...HOUSE_SET_MOUNTS])

    // §8.1: "'set-' + monotonic nextSetId (never rolled back)" — the two
    // synthesised sets consume ordinals 0 and 1 (§8.3).
    expect(sets.map((entry) => entry.id)).toEqual(['set-0', 'set-1'])

    for (const entry of sets) {
      expect(Object.keys(entry).sort()).toEqual([...STUDIO_SET_KEYS].sort())
      expect(entry.status).toBe('standing')
      expect(entry.completesWeek).toBeNull()
      expect(typeof entry.blueprintId).toBe('string')
      expect(typeof entry.setType).toBe('string')
      expect(String(entry.setType).length).toBeGreaterThan(0)
      // §8.1 bounded ranges.
      expect(entry.quality).toBeGreaterThanOrEqual(0)
      expect(entry.quality).toBeLessThanOrEqual(100)
      expect(entry.novelty).toBeGreaterThanOrEqual(0)
      expect(entry.novelty).toBeLessThanOrEqual(1)
      expect(entry.condition).toBeGreaterThanOrEqual(0)
      expect(entry.condition).toBeLessThanOrEqual(100)
      // §8.1: `Readonly<Record<Genre, number>>` — Genre per types.ts:9, six members.
      expect(Object.keys(entry.genreWeights as Record<string, number>).sort()).toEqual(
        [...CHARTER_GENRES].sort(),
      )
      expect(CHARTER_GENRES as readonly string[]).toContain(entry.priorityGenre as string)
    }
  })

  it('gives a legacy migrated save zero sets and nextSetId 0', () => {
    const module = requireV14()
    let legacy: GameState = generateWorld('c2a-m1-t9-legacy')
    for (let week = 0; week < 4; week++) legacy = tick(legacy)
    expect(legacy.operations.mode).toBe('legacy')

    const migrated = stateOf(module.migrateToV14(v13TwinOf(legacy)))
    const roots = v14RootsOf(migrated)

    expect(roots.sets).toEqual([])
    expect(roots.nextSetId).toBe(LEGACY_MIGRATED_NEXT_SET_ID)
  })

  it('leaves the queue and the screenplay root empty for every migrated save (§8.3)', () => {
    const module = requireV14()
    for (const { cell, native } of fixtures) {
      const roots = v14RootsOf(stateOf(module.migrateToV14(v13TwinOf(native))))
      expect(roots.productionQueue, cell.key).toEqual([])
      expect(roots.originalScreenplays, cell.key).toEqual({ nextOrdinal: 0, blueprints: [] })
      const log = requireStudioEvents(
        stateOf(module.migrateToV14(v13TwinOf(native))),
        `migrated ${cell.key}`,
      )
      expect(log.rows, cell.key).toEqual([])
      expect(log.nextSeq, cell.key).toBe(0)
    }
  })
})

// ── (D) the grandfather bindings derivation (§8.3) ──────────────────────────

describe('C2a-M1 · T9 (D) — migrated workflows are grandfathered, by derivation', () => {
  it('derives every bindings field exactly as §8.3 states it', () => {
    const module = requireV14()
    for (const { cell, native } of fixtures) {
      const migrated = stateOf(module.migrateToV14(v13TwinOf(native)))
      expect(migrated.operations.workflows.length, cell.key).toBeGreaterThan(0)

      for (const workflow of migrated.operations.workflows) {
        const bindings = requireBindings(workflow, `migrated ${cell.key}`)
        expect(Object.keys(bindings).sort(), cell.key).toEqual(
          ['requiresSetBinding', 'stageFacilityId', 'setId', 'lockedNovelty', 'lockedUplift', 'heldSinceWeek'].sort(),
        )

        // "requiresSetBinding := false for every migrated workflow (the
        //  grandfather: in-flight productions keep `facility-scenery-shop`
        //  byte-for-byte and never acquire a set)"
        expect(bindings.requiresSetBinding, cell.key).toBe(false)
        expect(bindings.setId, cell.key).toBeNull()
        // "lockedNovelty / lockedUplift := null"
        expect(bindings.lockedNovelty, cell.key).toBeNull()
        expect(bindings.lockedUplift, cell.key).toBeNull()

        // "stageFacilityId := the workflow's live `soundstage` reservation when
        //  present (rehearsal AND shooting — a rehearsal-phase save has no
        //  shootingTask), else null"
        const soundstage = workflow.reservations.find(
          (reservation) => reservation.capability === 'soundstage',
        )
        expect(bindings.stageFacilityId, cell.key).toBe(soundstage?.facilityId ?? null)

        // "heldSinceWeek := the migration week (a recorded migration fact)"
        expect(bindings.heldSinceWeek, cell.key).toBe(migrated.market.tick)
      }
    }
  })

  it('keeps the in-flight scenery reservation byte-for-byte across the boundary', () => {
    const module = requireV14()
    for (const { cell, native } of fixtures) {
      const migrated = stateOf(module.migrateToV14(v13TwinOf(native)))
      expect(
        migrated.operations.workflows.map((workflow) => workflow.reservations),
        cell.key,
      ).toEqual(native.operations.workflows.map((workflow) => workflow.reservations))
    }
  })
})
