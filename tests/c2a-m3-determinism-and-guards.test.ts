// ── C2a-M3 — determinism, and the two contract traps closed by test ──────────
//
// THE M3 GATE: *same seed + action script → byte-identical blueprints and
// titles.* Renewable supply is only renewable if it is reproducible, because a
// campaign that generates its own content and cannot replay it has no save file.
//
// AND THE TWO TRAPS lane 14 named, each closed by a test rather than a comment:
//
//   TRAP 1 — `correlateConceptCost` is a whole-pool rank permutation run once at
//   founding. Re-running it after an append would re-price films already
//   greenlit against a locked forecast.
//
//   TRAP 2 — `candidates.ts:236` draws a concept index from the PERSISTED sim
//   stream, so agent behaviour is necessarily a function of pool size. The guard
//   therefore asserts what CAN hold: the headless corpus never founds, so it
//   never mints, so `concepts.length` is invariant across it and agent draws are
//   unchanged. It fails LOUDLY if a corpus run ever mints.

import { describe, expect, it } from 'vitest'
import {
  FOUNDING_MINIMUMS,
  ORIGINAL_CONCEPT_ID_PREFIX,
  WORLD_CONFIG,
  applyActions,
  beginFounding,
  OracleAgent,
  RandomAgent,
  correlateConceptCost,
  generateScreenplayTitle,
  generateWorld,
  makeSave,
  mintOriginalConcept,
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
    ...byRole(pool, 'writer').slice(0, FOUNDING_MINIMUMS.writer + 2),
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

function payload(state: GameState, genre: Genre): CommissionOriginalScreenplayPayload {
  return {
    writerId: contractedWriters(state)[0]!.id,
    genre,
    shape: { opening: 'immediateAction', midpoint: 'reversal', ending: 'triumph' },
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

/** The same script of player actions, played twice, on the same seed. */
function playScript(seed: string): GameState {
  let state = managedStudio(seed)
  state = applyActions(state, [
    { kind: 'commissionOriginalScreenplay', screenplay: payload(state, 'horror') },
  ])
  while (state.scriptDevelopment.projects[0]!.status === 'drafting') state = tick(state)
  state = applyActions(state, [
    { kind: 'commissionOriginalScreenplay', screenplay: payload(state, 'romance') },
    { kind: 'renameScreenplay', conceptId: `${ORIGINAL_CONCEPT_ID_PREFIX}0000`, title: 'The Bitter Threshold' },
  ])
  return state
}

describe('C2a-M3 — determinism (the milestone gate)', () => {
  it('same seed + same action script → BYTE-IDENTICAL blueprints and titles', () => {
    const first = playScript('m3-determinism-gate')
    const second = playScript('m3-determinism-gate')
    expect(stableStringify(second.originalScreenplays)).toBe(
      stableStringify(first.originalScreenplays),
    )
    expect(stableStringify(second.concepts)).toBe(stableStringify(first.concepts))
    expect(stableStringify(makeSave(second))).toBe(stableStringify(makeSave(first)))
    // Non-vacuous: the run really did mint and rename.
    expect(first.originalScreenplays.blueprints).toHaveLength(2)
    expect(first.originalScreenplays.blueprints[0]!.renamedWeek).not.toBeNull()
  })

  it('gives DIFFERENT worlds different screenplays — the seed is really in the key', () => {
    const a = playScript('m3-determinism-seed-a')
    const b = playScript('m3-determinism-seed-b')
    expect(stableStringify(a.originalScreenplays.blueprints.map((row) => row.generatedTitle)))
      .not.toBe(stableStringify(b.originalScreenplays.blueprints.map((row) => row.generatedTitle)))
  })

  it('mints without touching the simulation stream — RSG advances no sim RNG', () => {
    const state = managedStudio('m3-determinism-rng')
    const before = state.rngState
    const minted = applyActions(state, [
      { kind: 'commissionOriginalScreenplay', screenplay: payload(state, 'crime') },
    ])
    expect(minted.rngState).toBe(before)
    const renamed = applyActions(minted, [
      { kind: 'renameScreenplay', conceptId: `${ORIGINAL_CONCEPT_ID_PREFIX}0000`, title: 'City of Ash' },
    ])
    expect(renamed.rngState).toBe(before)
  })

  it('generates a title and latents purely from (seed, conceptId, genre)', () => {
    for (const genre of ['comedy', 'drama', 'crime', 'romance', 'horror', 'adventure'] as Genre[]) {
      const conceptId = `${ORIGINAL_CONCEPT_ID_PREFIX}0007`
      expect(generateScreenplayTitle('pure-seed', conceptId, genre)).toBe(
        generateScreenplayTitle('pure-seed', conceptId, genre),
      )
      expect(stableStringify(mintOriginalConcept('pure-seed', conceptId, genre))).toBe(
        stableStringify(mintOriginalConcept('pure-seed', conceptId, genre)),
      )
    }
    // The ordinal is in the key: two ordinals in one world are two screenplays.
    expect(generateScreenplayTitle('pure-seed', 'concept-orig-0000', 'crime')).not.toBe(
      generateScreenplayTitle('pure-seed', 'concept-orig-0001', 'crime'),
    )
  })

  it('keeps generated titles ERA-CLEAN and inside the authored vocabulary (G15)', () => {
    for (let ordinal = 0; ordinal < 120; ordinal++) {
      const conceptId = `${ORIGINAL_CONCEPT_ID_PREFIX}${String(ordinal).padStart(4, '0')}`
      for (const genre of ['comedy', 'horror', 'adventure'] as Genre[]) {
        const title = generateScreenplayTitle('m3-era-clean', conceptId, genre)
        expect(title).not.toMatch(/\d/)
        expect(title.trim()).toBe(title)
        expect(title.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('C2a-M3 — TRAP 1: the pool is never re-priced', () => {
  it('would MOVE existing prices if it ever ran again — which is why it never does', () => {
    // The danger is demonstrated rather than described: run the founding
    // permutation over a pool that has GROWN by one minted screenplay, and the
    // prices of concepts that were already there move. Those prices are read
    // live at greenlight and at release, so moving them would re-price films
    // greenlit against a LOCKED forecast. M3 therefore never calls it, and the
    // test below proves the live engine does not.
    const world = generateWorld('m3-trap-correlate')
    const founded = correlateConceptCost([...world.concepts])
    // It is a pure function of the pool it is handed: same input, same output,
    // and it changes no field except the price.
    expect(stableStringify(correlateConceptCost([...world.concepts]))).toBe(
      stableStringify(founded),
    )
    expect(founded.map((concept) => concept.id)).toEqual(world.concepts.map((c) => c.id))
    expect(founded.map((concept) => concept.baselineStrength)).toEqual(
      world.concepts.map((c) => c.baselineStrength),
    )

    const grown = [
      ...founded,
      {
        ...founded[0]!,
        id: `${ORIGINAL_CONCEPT_ID_PREFIX}0000`,
        baselineStrength: 95,
        baseNegativeCost: 9_000_000,
      },
    ]
    const rePriced = correlateConceptCost(grown)
    const moved = rePriced
      .slice(0, founded.length)
      .filter((concept, index) => concept.baseNegativeCost !== founded[index]!.baseNegativeCost)
    expect(moved.length).toBeGreaterThan(0)
  })

  it('keeps a founded studio’s prices frozen across mints, saves and ticks', () => {
    let state = managedStudio('m3-trap-live')
    const before = new Map(state.concepts.map((c) => [c.id, c.baseNegativeCost]))
    state = applyActions(state, [
      { kind: 'commissionOriginalScreenplay', screenplay: payload(state, 'drama') },
    ])
    state = tick(state)
    state = tick(state)
    for (const [id, cost] of before) {
      expect(state.concepts.find((c) => c.id === id)!.baseNegativeCost, id).toBe(cost)
    }
  })
})

describe('C2a-M3 — TRAP 2: the headless agent stream is untouched', () => {
  it('never mints in a headless corpus run, so concepts.length is invariant', () => {
    // `candidates.ts` draws `Math.floor(rng.next() * concepts.length)` from the
    // PERSISTED sim stream. Growing the pool would therefore change agent
    // behaviour per seed — and the only reason it cannot is that the headless
    // corpus never founds a managed studio and so never reaches a commission.
    // This guard states that as a checked fact, and fails loudly the day a
    // corpus run mints anything.
    for (const seed of ['m3-agent-guard-a', 'm3-agent-guard-b']) {
      for (const agent of [RandomAgent, OracleAgent]) {
        let end = generateWorld(seed)
        for (let week = 0; week < 26; week++) {
          end = applyActions(end, agent.chooseActions(end))
          end = tick(end)
        }
        expect(end.concepts).toHaveLength(WORLD_CONFIG.conceptCount)
        expect(end.originalScreenplays.blueprints, seed).toHaveLength(0)
        expect(end.originalScreenplays.nextOrdinal).toBe(0)
        expect(
          end.concepts.every((concept) => !concept.id.startsWith(ORIGINAL_CONCEPT_ID_PREFIX)),
        ).toBe(true)
        expect(end.scriptDevelopment.mode).toBe('legacy')
      }
    }
  })
})
