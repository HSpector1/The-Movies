// ── C2a-M2 — sets across the save boundary, and the milestone's own gate ─────
//
// M1 landed the V14 schema and the complete migrator. M2 is the first milestone
// that actually PUTS SOMETHING IN the sets root, so this is where the schema
// stops being a promise:
//
//   * a studio that has built, repaired and struck sets round-trips byte for
//     byte, and plays on identically after a reload;
//   * the V14 boundary refuses the states the sets authority forbids, so a forged
//     file cannot describe a picture filming on scenery that is not standing;
//   * THE §12-M2 GATE, stated by the charter as a gate and therefore asserted as
//     one: a migrated managed V13 save reaches a NEW greenlight — and that new
//     picture binds a set, while the in-flight one it was migrated with never
//     does (§8.3's grandfather).

import { describe, expect, it } from 'vitest'
import {
  FOUNDING_MINIMUMS,
  applyActions,
  beginFounding,
  exportSave,
  generateWorld,
  importSave,
  initialReleaseAuthority,
  makeSave,
  migrateToV14,
  migrateToV16,
  setById,
  setMountedOn,
  stableStringify,
  tick,
  validateSaveV15,
} from '../src/core/index.js'
import type { CastSlot, CreativeRole, GameState, SegmentId, Talent } from '../src/core/index.js'
import { grandfatheredBindings, v13TwinOf } from './contracts/_v14Contract.js'

const STAGE_7 = 'facility-soundstage-07'
const STAGE_12 = 'facility-soundstage-12'

function applicants(state: GameState): Talent[] {
  return state.founding!.applicantIds.map((id) => state.talent.find((talent) => talent.id === id)!)
}

function byRole(talent: readonly Talent[], role: CreativeRole): Talent[] {
  return talent.filter((person) => person.role === role)
}

function foundedStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = applicants(state)
  const hires = [
    ...byRole(pool, 'actor').slice(0, Math.max(FOUNDING_MINIMUMS.actor, 6)),
    ...byRole(pool, 'director').slice(0, Math.max(FOUNDING_MINIMUMS.director, 2)),
    ...byRole(pool, 'writer').slice(0, Math.max(FOUNDING_MINIMUMS.writer, 2)),
    ...byRole(pool, 'craft').slice(0, Math.max(FOUNDING_MINIMUMS.craft, 2)),
  ]
  for (const hire of hires) {
    state = applyActions(state, [{ kind: 'signContract', talentId: hire.id, termWeeks: 104 }])
  }
  return applyActions(state, [{ kind: 'foundStudio' }])
}

function productionPayload(state: GameState, offset = 0) {
  const population = state.contracts.map(
    (contract) => state.talent.find((talent) => talent.id === contract.talentId)!,
  )
  const actors = byRole(population, 'actor')
  const concept = state.concepts[offset]!
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
    writerId: byRole(population, 'writer')[offset]!.id,
    directorId: byRole(population, 'director')[offset]!.id,
    cast: {
      lead: actors[offset * 3]!.id,
      antagonist: actors[offset * 3 + 1]!.id,
      support: actors[offset * 3 + 2]!.id,
    } satisfies Record<CastSlot, string>,
    craftIds: [byRole(population, 'craft')[offset]!.id],
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

function withCash(state: GameState, cash: number): GameState {
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
              note: 'test fixture cash identity adjustment',
            },
          ],
  }
}

function operationsStudio(seed: string): GameState {
  return withCash(applyActions(foundedStudio(seed), [{ kind: 'activateStudioOperations' }]), 60_000_000)
}

function advance(state: GameState, weeks: number): GameState {
  let out = state
  for (let week = 0; week < weeks; week++) out = tick(out)
  return out
}

/** A studio whose sets root has been genuinely lived in. */
function livedInStudio(seed: string): GameState {
  let state = operationsStudio(seed)
  // Strike one house set, build a real one in its place, wear the other.
  state = applyActions(state, [{ kind: 'strikeSet', setId: 'set-1' }])
  state = applyActions(state, [
    {
      kind: 'commissionSet',
      commission: { blueprintId: 'set-courtroom', stageFacilityId: STAGE_12 },
    },
  ])
  state = advance(state, 3)
  state = {
    ...state,
    sets: state.sets.map((set) => (set.id === 'set-0' ? { ...set, condition: 55 } : set)),
  }
  state = applyActions(state, [{ kind: 'repairSet', setId: 'set-0' }])
  return advance(state, 4)
}

describe('C2a-M2 — sets across the save boundary', () => {
  it('round-trips a studio that has built, repaired and struck, byte for byte', () => {
    const state = livedInStudio('m2-save-roundtrip')
    // The fixture really did all three things, or the round trip proves nothing.
    expect(state.sets.map((set) => set.status)).toEqual(['standing', 'retired', 'standing'])
    expect(state.nextSetId).toBe(3)
    expect(state.ledger.some((entry) => entry.kind === 'setCapex')).toBe(true)
    expect(state.ledger.some((entry) => entry.kind === 'setMaintenance')).toBe(true)
    expect(state.ledger.some((entry) => entry.kind === 'setDemolitionRefund')).toBe(true)

    const json = exportSave(makeSave(state))
    const reloaded = migrateToV16(importSave(json)).state
    expect(exportSave(makeSave(reloaded))).toBe(json)
    expect(reloaded.sets).toEqual(state.sets)
    expect(reloaded.nextSetId).toBe(state.nextSetId)
    // …and a reloaded world continues identically to one that never stopped.
    expect(stableStringify(advance(reloaded, 5))).toBe(stableStringify(advance(state, 5)))
  })

  it('refuses, at the V15 boundary, every state the sets authority forbids', () => {
    const state = livedInStudio('m2-save-refusals')
    const envelope = JSON.parse(exportSave(makeSave(state))) as {
      state: { sets: Record<string, unknown>[]; nextSetId: number }
    }
    expect(() => validateSaveV15(envelope)).not.toThrow()

    const forge = (mutate: (sets: Record<string, unknown>[]) => void): unknown => {
      const copy = JSON.parse(JSON.stringify(envelope)) as typeof envelope
      mutate(copy.state.sets)
      return copy
    }

    // Two sets on one stage.
    expect(() =>
      validateSaveV15(
        forge((sets) => {
          sets[2]!.mountedOn = STAGE_7
        }),
      ),
    ).toThrow(/both stand on/)

    // A standing set with no condition — the build/repair discriminator broken.
    expect(() =>
      validateSaveV15(
        forge((sets) => {
          sets[0]!.condition = 0
        }),
      ),
    ).toThrow(/has no condition/)

    // A set under work that no scenery crew is on.
    expect(() =>
      validateSaveV15(
        forge((sets) => {
          sets[0]!.status = 'under-construction'
          sets[0]!.completesWeek = 400
          sets[2]!.status = 'under-construction'
          sets[2]!.completesWeek = 400
          sets[1]!.status = 'under-construction'
          sets[1]!.completesWeek = 400
        }),
      ),
    ).toThrow(/no scenery crew|both stand on/)
  })
})

describe('C2a-M2 — the §12-M2 gate: a migrated managed V13 save reaches a NEW greenlight', () => {
  it('greenlights, binds a set, and shoots — while the picture it migrated with never does', () => {
    // A managed studio with a picture already in flight, written as the V13 file
    // a player would actually have on disk.
    let native = operationsStudio('m2-gate-migrated')
    native = applyActions(native, [
      { kind: 'greenlight', production: productionPayload(native, 0) },
    ])
    native = advance(native, 3)
    expect(native.operations.workflows[0]!.phase).toBe('rehearsal')

    const twin = v13TwinOf(grandfatheredBindings(native))
    const migrated = migrateToV14(twin as unknown as Parameters<typeof migrateToV14>[0]).state

    // §8.3: the endowment is synthesised, and the in-flight picture is
    // GRANDFATHERED — it keeps its scenery-shop reservation and never acquires a
    // set, for the rest of its life.
    expect(migrated.sets).toHaveLength(2)
    expect(migrated.nextSetId).toBe(2)
    const inFlight = migrated.operations.workflows[0]!.productionId
    expect(migrated.operations.workflows[0]!.bindings.requiresSetBinding).toBe(false)

    // THE GATE: the migrated studio greenlights a NEW picture. `migrated` stays
    // pinned at the frozen GameStateV14 shape for the endowment assertions above;
    // only this live boundary call gains P06A's release authority — empty, since
    // nothing in this migrated save was ever a committed release.
    const liveMigrated: GameState = { ...migrated, releaseAuthority: initialReleaseAuthority() }
    let played = applyActions(liveMigrated, [
      { kind: 'greenlight', production: productionPayload(liveMigrated, 1) },
    ])
    const fresh = played.studio.activeProductions.find(
      (production) => production.id !== inFlight,
    )!.id
    const workflowFor = (state: GameState, productionId: string) =>
      state.operations.workflows.find((workflow) => workflow.productionId === productionId)!
    expect(workflowFor(played, fresh).bindings.requiresSetBinding).toBe(true)

    // …and it goes on to stand on a real, named set.
    played = advance(played, 4)
    const bound = workflowFor(played, fresh).bindings
    expect(bound.setId).not.toBeNull()
    const set = setById(played.sets, bound.setId!)!
    expect(set.status).toBe('standing')
    expect(set.mountedOn).toBe(bound.stageFacilityId)
    expect(bound.lockedUplift).toBeGreaterThan(0)

    // The grandfather held the whole way: the migrated picture never bound one.
    const stillInFlight = played.operations.workflows.find(
      (workflow) => workflow.productionId === inFlight,
    )
    if (stillInFlight !== undefined) {
      expect(stillInFlight.bindings.requiresSetBinding).toBe(false)
      expect(stillInFlight.bindings.setId).toBeNull()
    }

    // And the whole thing is a legal V15 file at every step.
    expect(() => validateSaveV15(JSON.parse(exportSave(makeSave(played))))).not.toThrow()
  })

  it('lets a migrated studio BUILD a set on the stage it just cleared', () => {
    const native = operationsStudio('m2-gate-build')
    const migrated = migrateToV14(v13TwinOf(grandfatheredBindings(native)) as unknown as Parameters<typeof migrateToV14>[0]).state
    // `migrated` (frozen GameStateV14) gains P06A's release authority — empty,
    // since nothing in this migrated save was ever a committed release.
    const liveMigrated: GameState = { ...migrated, releaseAuthority: initialReleaseAuthority() }
    let played = applyActions(liveMigrated, [{ kind: 'strikeSet', setId: 'set-1' }])
    expect(setMountedOn(played.sets, STAGE_12)).toBeNull()
    played = applyActions(played, [
      {
        kind: 'commissionSet',
        commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE_12 },
      },
    ])
    played = advance(played, 8)
    const built = setMountedOn(played.sets, STAGE_12)!
    expect(built.name).toBe('Grand Ballroom')
    expect(built.status).toBe('standing')
    expect(played.studioEvents.rows.some((row) => row.kind === 'setBuilt')).toBe(true)
    expect(played.studioEvents.rows.some((row) => row.kind === 'setRetired')).toBe(true)
  })
})
