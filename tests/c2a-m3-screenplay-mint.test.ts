// ── C2a-M3 — commissioning an original screenplay (charter §3.5) ─────────────
//
// *A writer goes to work and eventually hands me a new movie.* This suite proves
// the sentence end to end and then proves the four laws that keep it honest:
// the mint is the commit, the appended concept is world-shaped, identity is
// reserved and never re-minted, and the pool's prices are never touched.

import { describe, expect, it } from 'vitest'
import {
  CONCEPT_DISTRIBUTIONS,
  FOUNDING_MINIMUMS,
  ORIGINAL_CONCEPT_ID_PREFIX,
  TUNING,
  applyActions,
  beginFounding,
  blueprintForConcept,
  generateWorld,
  isOriginalScreenplay,
  makeSave,
  mintedNegativeCost,
  persistedConceptIds,
  requiredSetTypes,
  stableStringify,
  tick,
} from '../src/core/index.js'
import type {
  CommissionOriginalScreenplayPayload,
  CreativeRole,
  GameState,
  Genre,
  SegmentId,
  Talent,
} from '../src/core/index.js'

function applicants(state: GameState): Talent[] {
  return state.founding!.applicantIds.map((id) => state.talent.find((t) => t.id === id)!)
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
    state = applyActions(state, [
      { kind: 'signContract', talentId: hire.id, termWeeks: 104 },
    ])
  }
  state = applyActions(state, [{ kind: 'foundStudio' }])
  return applyActions(state, [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
  ])
}

function contractedWriters(state: GameState): Talent[] {
  const contracted = new Set(state.contracts.map((contract) => contract.talentId))
  return state.talent.filter(
    (person) => person.skills.writing !== undefined && contracted.has(person.id),
  )
}

function originalPayload(
  state: GameState,
  genre: Genre = 'crime',
  writerIndex = 0,
): CommissionOriginalScreenplayPayload {
  return {
    writerId: contractedWriters(state)[writerIndex]!.id,
    genre,
    shape: { opening: 'mysteryHook', midpoint: 'reversal', ending: 'bittersweet' },
    promise: {
      genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: {
        intimacy: [-0.4, 0.6],
        tonalWeight: [0, 0.8],
        kineticEnergy: [-0.7, 0.2],
      },
    },
  }
}

describe('C2a-M3 — a writer goes to work and hands the studio a new movie', () => {
  it('mints a concept, a title and a blueprint at COMMISSION-COMMIT, and drafts it', () => {
    const state = managedStudio('m3-mint-happy-path')
    const conceptsBefore = state.concepts.length
    const writerId = originalPayload(state).writerId

    const commissioned = applyActions(state, [
      { kind: 'commissionOriginalScreenplay', screenplay: originalPayload(state) },
    ])

    // THE CONCEPT: appended, namespaced, and carrying the eight world-shaped
    // fields a worldgen premise carries — no more.
    expect(commissioned.concepts).toHaveLength(conceptsBefore + 1)
    const minted = commissioned.concepts.at(-1)!
    expect(minted.id).toBe(`${ORIGINAL_CONCEPT_ID_PREFIX}0000`)
    expect(Object.keys(minted).sort()).toEqual(
      [
        'baseNegativeCost',
        'baselineStrength',
        'genre',
        'id',
        'originalityRaw',
        'requiredSlots',
        'roleRequirements',
        'title',
      ].sort(),
    )
    expect(minted.genre).toBe('crime')
    expect(minted.title.split(' ').length).toBeGreaterThanOrEqual(2)

    // THE BLUEPRINT: the studio-relative half, and the only place it lives.
    const blueprint = blueprintForConcept(commissioned.originalScreenplays, minted.id)!
    expect(blueprint).toBeDefined()
    expect(blueprint.ordinal).toBe(0)
    expect(blueprint.mintedWeek).toBe(commissioned.market.tick)
    expect(blueprint.projectId).toBe('script-0000')
    expect(blueprint.writerId).toBe(writerId)
    expect(blueprint.generatedTitle).toBe(minted.title)
    expect(blueprint.renamedWeek).toBeNull()
    expect(blueprint.beats).toHaveLength(7)
    expect(blueprint.officeTierAtMint).toBe('development-casting-annex')
    expect(commissioned.originalScreenplays.nextOrdinal).toBe(1)

    // THE PROJECT: the existing draft machinery, occupying writer and slot.
    const project = commissioned.scriptDevelopment.projects[0]!
    expect(project.conceptId).toBe(minted.id)
    expect(project.status).toBe('drafting')
    expect(project.writerIds).toEqual([writerId])
    expect(project.reservation).not.toBeNull()
    expect(project.dueWeek! - project.commissionedWeek).toBeGreaterThanOrEqual(
      TUNING.SCRIPT_DRAFT_WEEKS_MIN,
    )
    expect(project.dueWeek! - project.commissionedWeek).toBeLessThanOrEqual(
      TUNING.SCRIPT_DRAFT_WEEKS_MAX,
    )

    // AND IT ARRIVES. Advance to the due week and the screenplay is written.
    let played = commissioned
    for (let week = commissioned.market.tick; week < project.dueWeek!; week++) {
      played = tick(played)
    }
    const written = played.scriptDevelopment.projects[0]!
    expect(written.status).toBe('review')
    expect(written.assessment).not.toBeNull()
    expect(written.reservation).toBeNull()
    // The screenplay the studio wrote is a real, usable premise: its strength is
    // the premise's own, and the assessment is inside the bounded range.
    expect(written.assessment!.actualStrength).toBeGreaterThan(0)
    expect(written.assessment!.actualStrength).toBeLessThanOrEqual(100)
  })

  it('MINTS NOTHING when the commission is refused — no burnt ordinal, no orphan', () => {
    // The mint is the commit: if the Development & Casting slot cannot be
    // granted, the concept never comes into existence. This is the whole
    // cancellation story, and it is why no abandon verb is needed.
    const state = managedStudio('m3-mint-refusal')
    const before = stableStringify(state)

    expect(() =>
      applyActions(state, [
        {
          kind: 'commissionOriginalScreenplay',
          screenplay: { ...originalPayload(state), writerId: 'talent-that-does-not-exist' },
        },
      ]),
    ).toThrow(/commissionOriginalScreenplay/)
    expect(stableStringify(state)).toBe(before)

    // A promise that names a different genre than the screenplay is refused too:
    // the two would disagree at greenlight, and the engine already enforces it.
    const mismatched = originalPayload(state)
    expect(() =>
      applyActions(state, [
        {
          kind: 'commissionOriginalScreenplay',
          screenplay: { ...mismatched, promise: { ...mismatched.promise, genre: 'horror' } },
        },
      ]),
    ).toThrow(/different genre/)
    expect(stableStringify(state)).toBe(before)
  })

  it('never re-mints an id, and reserves against every root that holds one (G17)', () => {
    let state = managedStudio('m3-mint-identity')
    const writers = contractedWriters(state)
    expect(writers.length).toBeGreaterThanOrEqual(1)

    state = applyActions(state, [
      { kind: 'commissionOriginalScreenplay', screenplay: originalPayload(state, 'horror') },
    ])
    const first = state.concepts.at(-1)!.id
    // Finish the first draft so the writer is free to start another.
    while (state.scriptDevelopment.projects[0]!.status === 'drafting') state = tick(state)
    state = applyActions(state, [
      { kind: 'commissionOriginalScreenplay', screenplay: originalPayload(state, 'romance') },
    ])
    const second = state.concepts.at(-1)!.id

    expect(first).toBe(`${ORIGINAL_CONCEPT_ID_PREFIX}0000`)
    expect(second).toBe(`${ORIGINAL_CONCEPT_ID_PREFIX}0001`)
    expect(first).not.toBe(second)
    expect(new Set(state.concepts.map((concept) => concept.id)).size).toBe(state.concepts.length)

    // The reservation sees both, and every pool id besides.
    const reserved = persistedConceptIds(state)
    expect(reserved.has(first)).toBe(true)
    expect(reserved.has(second)).toBe(true)
    for (const concept of state.concepts) expect(reserved.has(concept.id)).toBe(true)
    for (const project of state.scriptDevelopment.projects) {
      expect(reserved.has(project.conceptId)).toBe(true)
    }

    // LEXICOGRAPHIC ORDER: the world's founding premises sort first, the
    // studio's own screenplays follow in the order they were written. That is
    // what lets every shipped `compareId` helper stay untouched.
    const sorted = [...state.concepts.map((c) => c.id)].sort()
    expect(sorted.at(-1)).toBe(second)
    expect(sorted.at(-2)).toBe(first)
    expect(sorted.indexOf('c-00')).toBe(0)
  })

  it('draws latents from the pool’s own distributions and derives the price from strength', () => {
    let state = managedStudio('m3-mint-latents')
    state = applyActions(state, [
      { kind: 'commissionOriginalScreenplay', screenplay: originalPayload(state, 'adventure') },
    ])
    const minted = state.concepts.at(-1)!
    const strengthD = CONCEPT_DISTRIBUTIONS.baselineStrength
    const originalityD = CONCEPT_DISTRIBUTIONS.originalityRaw
    const costD = CONCEPT_DISTRIBUTIONS.baseNegativeCost

    expect(minted.baselineStrength).toBeGreaterThanOrEqual(strengthD.min)
    expect(minted.baselineStrength).toBeLessThanOrEqual(strengthD.max)
    expect(minted.originalityRaw).toBeGreaterThanOrEqual(originalityD.min)
    expect(minted.originalityRaw).toBeLessThanOrEqual(originalityD.max)
    expect(minted.baseNegativeCost).toBeGreaterThanOrEqual(costD.min)
    expect(minted.baseNegativeCost).toBeLessThanOrEqual(costD.max)
    expect(minted.requiredSlots).toEqual(['lead', 'antagonist', 'support'])
    for (const slot of minted.requiredSlots) {
      const requirement = minted.roleRequirements[slot]!
      expect(requirement.tolerance).toBeGreaterThanOrEqual(CONCEPT_DISTRIBUTIONS.roleTolerance.min)
      expect(requirement.tolerance).toBeLessThanOrEqual(CONCEPT_DISTRIBUTIONS.roleTolerance.max)
      for (const axis of [
        requirement.target.warmth,
        requirement.target.gravity,
        requirement.target.physicality,
      ]) {
        expect(axis).toBeGreaterThanOrEqual(CONCEPT_DISTRIBUTIONS.roleTargetAxis.min)
        expect(axis).toBeLessThanOrEqual(CONCEPT_DISTRIBUTIONS.roleTargetAxis.max)
      }
    }

    // THE PRICE IS NOT AN INDEPENDENT DRAW. It is a function of the strength,
    // and this is the assertion that says so.
    expect(minted.baseNegativeCost).toBe(mintedNegativeCost(minted.baselineStrength))
    expect(mintedNegativeCost(strengthD.mean)).toBe(costD.mean)
    expect(mintedNegativeCost(95)).toBeGreaterThan(mintedNegativeCost(60))
    expect(mintedNegativeCost(60)).toBeGreaterThan(mintedNegativeCost(45))
  })

  it('DERIVES A BLUEPRINT FOR A POOL CONCEPT TOO — one production path', () => {
    let state = managedStudio('m3-pool-blueprint')
    const concept = state.concepts[0]!
    state = applyActions(state, [
      {
        kind: 'commissionScript',
        project: {
          conceptId: concept.id,
          writerId: contractedWriters(state)[0]!.id,
          shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'triumph' },
          promise: {
            genre: concept.genre,
            intendedSegments: ['adult'] as SegmentId[],
            ranges: {
              intimacy: [-0.4, 0.6],
              tonalWeight: [0, 0.8],
              kineticEnergy: [-0.7, 0.2],
            },
          },
        },
      },
    ])

    const blueprint = blueprintForConcept(state.originalScreenplays, concept.id)!
    expect(blueprint).toBeDefined()
    expect(isOriginalScreenplay(blueprint)).toBe(false)
    expect(blueprint.ordinal).toBeNull()
    // It was authored by the world, not written here: no generated title, and no
    // mint ordinal was burned.
    expect(blueprint.generatedTitle).toBeNull()
    expect(state.originalScreenplays.nextOrdinal).toBe(0)
    expect(blueprint.beats).toHaveLength(7)
    expect(requiredSetTypes(blueprint.beats).length).toBeGreaterThanOrEqual(3)
    // And the pool clock is untouched: one week, exactly as C1 measured it.
    const project = state.scriptDevelopment.projects[0]!
    expect(project.dueWeek).toBe(project.commissionedWeek + TUNING.SCRIPT_DRAFT_WEEKS_POOL)
  })

  it('NEVER re-prices the pool — correlateConceptCost is a founding-only permutation', () => {
    // THE ONE TRAP (lane 14 §8.9). Re-running the whole-pool rank permutation
    // after an append would rewrite every concept's `baseNegativeCost`, and
    // therefore every in-flight production's `requiredNegative` and realised
    // reception — for films already greenlit against a LOCKED forecast.
    let state = managedStudio('m3-cost-prohibition')
    const pricesBefore = state.concepts.map((concept) => ({
      id: concept.id,
      baseNegativeCost: concept.baseNegativeCost,
      baselineStrength: concept.baselineStrength,
      originalityRaw: concept.originalityRaw,
    }))

    state = applyActions(state, [
      { kind: 'commissionOriginalScreenplay', screenplay: originalPayload(state, 'drama') },
    ])
    while (state.scriptDevelopment.projects[0]!.status === 'drafting') state = tick(state)
    state = applyActions(state, [
      { kind: 'commissionOriginalScreenplay', screenplay: originalPayload(state, 'comedy') },
    ])

    const after = new Map(state.concepts.map((concept) => [concept.id, concept]))
    for (const before of pricesBefore) {
      const now = after.get(before.id)!
      expect(now.baseNegativeCost, before.id).toBe(before.baseNegativeCost)
      expect(now.baselineStrength, before.id).toBe(before.baselineStrength)
      expect(now.originalityRaw, before.id).toBe(before.originalityRaw)
    }
  })

  it('APPENDS ONLY — nothing is removed, reordered, or rewritten', () => {
    let state = managedStudio('m3-append-only')
    const before = state.concepts.map((concept) => stableStringify(concept))
    state = applyActions(state, [
      { kind: 'commissionOriginalScreenplay', screenplay: originalPayload(state, 'horror') },
    ])
    const after = state.concepts.map((concept) => stableStringify(concept))
    expect(after.slice(0, before.length)).toEqual(before)
    expect(after).toHaveLength(before.length + 1)
  })

  it('saves and re-validates a minted world at the V16 boundary', () => {
    let state = managedStudio('m3-mint-save')
    state = applyActions(state, [
      { kind: 'commissionOriginalScreenplay', screenplay: originalPayload(state, 'crime') },
    ])
    const save = makeSave(state)
    expect(save.saveVersion).toBe(18)
    expect(save.state.originalScreenplays.blueprints).toHaveLength(1)
    expect(save.state.concepts.at(-1)!.id).toBe(`${ORIGINAL_CONCEPT_ID_PREFIX}0000`)
  })

})
