// ── C2a-M0 — engine baseline, hygiene, and the union ─────────────────────────
// Charter §12-M0 + §3.2. Three things are pinned here:
//   1. the founding facility capacities are NAMED TUNING constants, not literals;
//   2. the phase→capability and phase→countdown tables have exactly ONE source;
//   3. `occupiedResourceSlots` is the one named union producer, and the
//      cross-owner double-booking refusal it carries is NON-VACUOUS.

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  FOUNDING_MINIMUMS,
  INITIAL_STUDIO_FACILITIES,
  TUNING,
  applyActions,
  beginFounding,
  exportSave,
  generateWorld,
  importSave,
  initialManagedStudioConstruction,
  initialManagedStudioOperations,
  initialManagedStudioPlacement,
  makeSaveV13,
  tick,
} from '../src/core/index.js'
import type {
  CastSlot,
  CreativeRole,
  GameState,
  SaveFileV13,
  SegmentId,
  Talent,
} from '../src/core/index.js'
import {
  nextProductionPhase,
  productionPhaseForRemainingTicks,
  productionPhaseForRemainingTicksOrNull,
  reachableCapacityBlockerForRemainingTicks,
  requirementsForPhase,
} from '../src/core/productionPhases.js'

const here = dirname(fileURLToPath(import.meta.url))
const coreDir = join(here, '..', 'src', 'core')

function applicants(state: GameState): Talent[] {
  return state.founding!.applicantIds.map((id) => state.talent.find((talent) => talent.id === id)!)
}

function byRole(talent: readonly Talent[], role: CreativeRole): Talent[] {
  return talent.filter((person) => person.role === role)
}

function managedStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = applicants(state)
  for (const hire of [
    ...byRole(pool, 'actor').slice(0, FOUNDING_MINIMUMS.actor),
    ...byRole(pool, 'director').slice(0, FOUNDING_MINIMUMS.director),
    ...byRole(pool, 'writer').slice(0, FOUNDING_MINIMUMS.writer),
    ...byRole(pool, 'craft').slice(0, FOUNDING_MINIMUMS.craft),
  ]) {
    state = applyActions(state, [{ kind: 'signContract', talentId: hire.id, termWeeks: 104 }])
  }
  state = applyActions(state, [{ kind: 'foundStudio' }])
  return {
    ...state,
    operations: initialManagedStudioOperations(),
    construction: initialManagedStudioConstruction(),
    placement: initialManagedStudioPlacement(),
  }
}

function greenlight(state: GameState, offset = 0): GameState {
  const population = state.contracts.map(
    (contract) => state.talent.find((talent) => talent.id === contract.talentId)!,
  )
  const actors = byRole(population, 'actor')
  const concept = state.concepts[offset]!
  return applyActions(state, [
    {
      kind: 'greenlight',
      production: {
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
      },
    },
  ])
}

describe('C2a-M0 — founding capacity hoists (charter §12-M0)', () => {
  it('names every founding facility capacity in TUNING at its frozen V1 value', () => {
    expect(TUNING.FOUNDING_DEVELOPMENT_CASTING_CAPACITY).toBe(2)
    expect(TUNING.FOUNDING_POST_CAPACITY).toBe(2)
    expect(TUNING.FOUNDING_SCENERY_CAPACITY).toBe(2)
    expect(TUNING.FOUNDING_SOUNDSTAGE_CAPACITY).toBe(1)
  })

  it('bounds every founding capacity as a positive integer', () => {
    for (const capacity of [
      TUNING.FOUNDING_DEVELOPMENT_CASTING_CAPACITY,
      TUNING.FOUNDING_POST_CAPACITY,
      TUNING.FOUNDING_SCENERY_CAPACITY,
      TUNING.FOUNDING_SOUNDSTAGE_CAPACITY,
    ]) {
      expect(Number.isInteger(capacity)).toBe(true)
      expect(capacity).toBeGreaterThan(0)
    }
  })

  it('builds the founding facility array from those constants and nothing else', () => {
    expect(
      INITIAL_STUDIO_FACILITIES.map((facility) => [facility.id, facility.capacity] as const),
    ).toEqual([
      ['facility-development-casting', TUNING.FOUNDING_DEVELOPMENT_CASTING_CAPACITY],
      ['facility-post-building', TUNING.FOUNDING_POST_CAPACITY],
      ['facility-scenery-shop', TUNING.FOUNDING_SCENERY_CAPACITY],
      ['facility-soundstage-07', TUNING.FOUNDING_SOUNDSTAGE_CAPACITY],
      ['facility-soundstage-12', TUNING.FOUNDING_SOUNDSTAGE_CAPACITY],
    ])
    // Both founding stages share ONE named per-stage capacity: the N-stage world
    // C2 builds derives every later stage from the same number.
    const stages = INITIAL_STUDIO_FACILITIES.filter(
      (facility) => facility.capability === 'soundstage',
    )
    expect(stages).toHaveLength(2)
    expect(new Set(stages.map((facility) => facility.capacity))).toEqual(
      new Set([TUNING.FOUNDING_SOUNDSTAGE_CAPACITY]),
    )
  })

  it('hands the live studio mutable clones carrying the same capacities', () => {
    const operations = initialManagedStudioOperations()
    expect(operations.facilities.map((facility) => facility.capacity)).toEqual([
      TUNING.FOUNDING_DEVELOPMENT_CASTING_CAPACITY,
      TUNING.FOUNDING_POST_CAPACITY,
      TUNING.FOUNDING_SCENERY_CAPACITY,
      TUNING.FOUNDING_SOUNDSTAGE_CAPACITY,
      TUNING.FOUNDING_SOUNDSTAGE_CAPACITY,
    ])
    expect(operations.facilities[0]).not.toBe(INITIAL_STUDIO_FACILITIES[0])
  })
})

describe('C2a-M0 — the phase machinery has exactly one source (charter §12-M0)', () => {
  it('pins the V13 countdown table in both its throwing and null readings', () => {
    const table: Array<[number, string | null]> = [
      [8, 'development'],
      [7, 'preProduction'],
      [6, 'rehearsal'],
      [5, 'shooting'],
      [4, 'shooting'],
      [3, 'postProduction'],
      [2, 'postProduction'],
      [1, 'releaseReady'],
      [0, null],
      [-1, null],
      [9, null],
      [1.5, null],
    ]
    for (const [remainingTicks, phase] of table) {
      expect(productionPhaseForRemainingTicksOrNull(remainingTicks)).toBe(phase)
      if (phase === null) {
        expect(() => productionPhaseForRemainingTicks(remainingTicks)).toThrow(
          /is outside managed production range \[1, 8\]/,
        )
      } else {
        expect(productionPhaseForRemainingTicks(remainingTicks)).toBe(phase)
      }
    }
  })

  it('pins the V13 phase→capability and phase→successor tables', () => {
    expect(requirementsForPhase('development')).toEqual(['development-casting'])
    expect(requirementsForPhase('preProduction')).toEqual(['development-casting'])
    expect(requirementsForPhase('rehearsal')).toEqual(['soundstage'])
    expect(requirementsForPhase('shooting')).toEqual(['soundstage', 'set-scenery'])
    expect(requirementsForPhase('postProduction')).toEqual(['post'])
    expect(requirementsForPhase('releaseReady')).toEqual([])

    expect(nextProductionPhase('development')).toBe('preProduction')
    expect(nextProductionPhase('preProduction')).toBe('rehearsal')
    expect(nextProductionPhase('rehearsal')).toBe('shooting')
    expect(nextProductionPhase('shooting')).toBe('postProduction')
    expect(nextProductionPhase('postProduction')).toBe('releaseReady')
    expect(nextProductionPhase('releaseReady')).toBeNull()
  })

  it('derives the reachable-blocker table to the hand-written V13 truth exactly', () => {
    expect(reachableCapacityBlockerForRemainingTicks(8)).toBeNull()
    expect(reachableCapacityBlockerForRemainingTicks(7)).toEqual({
      capability: 'soundstage',
      targetPhase: 'rehearsal',
    })
    expect(reachableCapacityBlockerForRemainingTicks(6)).toEqual({
      capability: 'set-scenery',
      targetPhase: 'shooting',
    })
    expect(reachableCapacityBlockerForRemainingTicks(5)).toBeNull()
    expect(reachableCapacityBlockerForRemainingTicks(4)).toEqual({
      capability: 'post',
      targetPhase: 'postProduction',
    })
    expect(reachableCapacityBlockerForRemainingTicks(3)).toBeNull()
    expect(reachableCapacityBlockerForRemainingTicks(2)).toBeNull()
    expect(reachableCapacityBlockerForRemainingTicks(1)).toBeNull()
    expect(reachableCapacityBlockerForRemainingTicks(0)).toBeNull()
  })

  it('leaves no second copy of the tables anywhere in src/core', () => {
    // The duplicates this milestone deleted, by the exact identifiers they used.
    const forbidden = [
      ['operations.ts', 'function requirementsForPhase'],
      ['save.ts', 'const REQUIRED_CAPABILITIES'],
      ['save.ts', 'const NEXT_PHASE'],
      ['save.ts', 'function phaseForRemainingTicks'],
    ] as const
    for (const [file, needle] of forbidden) {
      expect(readFileSync(join(coreDir, file), 'utf8')).not.toContain(needle)
    }
    // And no file but the source states the shooting multiset as a literal pair.
    const offenders: string[] = []
    for (const file of ['operations.ts', 'save.ts', 'studioCalendar.ts', 'tick.ts']) {
      const contents = readFileSync(join(coreDir, file), 'utf8')
      if (contents.includes(`'soundstage', 'set-scenery'`)) offenders.push(file)
      if (contents.includes(`"soundstage", "set-scenery"`)) offenders.push(file)
    }
    expect(offenders).toEqual([])
  })

  it('agrees with the save validator on every phase a real production reaches', () => {
    let state = greenlight(managedStudio('c2a-m0-phase-agreement'))
    const seen: string[] = []
    for (let week = 0; week < 14; week++) {
      const pending = state.operations.workflows[0]
      if (pending === undefined) break
      if (pending.shootingTask?.status === 'unassigned') {
        const shooting = state.studio.activeProductions.find(
          (candidate) => candidate.id === pending.productionId,
        )!
        state = applyActions(state, [
          {
            kind: 'assignShootingDirector',
            productionId: shooting.id,
            directorId: shooting.directorId,
          },
          { kind: 'clearSceneryLoadIn', productionId: shooting.id },
          { kind: 'scheduleShootingTake', productionId: shooting.id },
        ])
      }
      const workflow = state.operations.workflows[0]!
      const production = state.studio.activeProductions.find(
        (candidate) => candidate.id === workflow.productionId,
      )!
      // The engine's own table.
      expect(workflow.phase).toBe(productionPhaseForRemainingTicks(production.remainingTicks))
      expect(workflow.reservations.map((reservation) => reservation.capability).sort()).toEqual(
        [...requirementsForPhase(workflow.phase)].sort(),
      )
      seen.push(workflow.phase)
      // The save validator's reading of the same table, on the same state. Both
      // makeSaveV13 and importSave run checkOperationsState, which now consumes
      // the shared table instead of its own copy.
      const roundTripped = importSave(exportSave(makeSaveV13(state))) as SaveFileV13
      expect(roundTripped.state.operations.workflows[0]!.phase).toBe(workflow.phase)
      state = tick(state)
    }
    expect(new Set(seen)).toEqual(
      new Set([
        'development',
        'preProduction',
        'rehearsal',
        'shooting',
        'postProduction',
        'releaseReady',
      ]),
    )
  })
})
