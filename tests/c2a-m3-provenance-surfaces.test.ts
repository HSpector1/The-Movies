// ── C2a-M3 — the fantasy has to be VISIBLE (charter §3.5, `00F` tycoon floor) ─
//
// "A writer goes to work and eventually hands me a new movie" is not delivered
// by a state root. It is delivered when the player READS "An Original Screenplay
// by Ava Hartwell" on the picture they are about to package, sees the locations
// their script calls for, and finds a remedy where C1 had a dead end.
//
// The `00F` professional tycoon floor binds every string asserted here: filmmaking
// language, no engine ids, no debug strings, and every sentence TRUE.

import { describe, expect, it } from 'vitest'
import {
  ACQUIRED_SCREENPLAY_LABEL,
  FOUNDING_MINIMUMS,
  ORIGINAL_CONCEPT_ID_PREFIX,
  SET_TYPE_LABELS,
  TUNING,
  applyActions,
  beginFounding,
  generateWorld,
  scriptProjectsReadModel,
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
    ...byRole(pool, 'writer').slice(0, FOUNDING_MINIMUMS.writer + 1),
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

function originalPayload(state: GameState, genre: Genre): CommissionOriginalScreenplayPayload {
  return {
    writerId: contractedWriters(state)[0]!.id,
    genre,
    shape: { opening: 'mysteryHook', midpoint: 'revelation', ending: 'ambiguous' },
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

const CONCEPT_ID = `${ORIGINAL_CONCEPT_ID_PREFIX}0000`

describe('C2a-M3 — the no-concepts blocker stops being a dead end', () => {
  it('offers a remedy that an action can actually deliver', () => {
    const state = managedStudio('m3-surface-no-concepts')
    // A studio that has claimed every premise the market offered.
    const exhausted: GameState = { ...state, concepts: [] }
    const board = scriptProjectsReadModel(exhausted)
    const blocker = board.commission.blockers.find((entry: { kind: string }) => entry.kind === 'no-concepts')!

    expect(blocker).toBeDefined()
    expect(blocker.remedy).toMatch(/original screenplay/i)
    // THE PREDECESSOR, named so this test is legible as a replacement: C1 said
    // "Continue with an existing project", which no action could satisfy.
    expect(blocker.remedy).not.toContain('Continue with an existing project')
    // Filmmaking language, and a true sentence.
    expect(blocker.headline).not.toMatch(/concept/i)
    expect(blocker.detail).not.toMatch(/-/)
  })
})

describe('C2a-M3 — provenance is visible', () => {
  it('marks every market premise on the commission board as acquired', () => {
    const state = managedStudio('m3-surface-pool-provenance')
    const board = scriptProjectsReadModel(state)
    expect(board.commission.concepts.length).toBeGreaterThan(0)
    for (const concept of board.commission.concepts) {
      expect(concept.provenance.origin).toBe('pool')
      expect(concept.provenance.label).toBe(ACQUIRED_SCREENPLAY_LABEL)
      expect(concept.provenance.writerId).toBeNull()
      expect(concept.provenance.generatedTitle).toBeNull()
      // A player never reads an engine id.
      expect(concept.provenance.label).not.toContain(concept.id)
    }
  })

  it('credits the writer of an original screenplay by NAME on its package', () => {
    let state = managedStudio('m3-surface-original-provenance')
    const writer = contractedWriters(state)[0]!
    state = applyActions(state, [
      { kind: 'commissionOriginalScreenplay', screenplay: originalPayload(state, 'horror') },
    ])
    while (state.scriptDevelopment.projects[0]!.status === 'drafting') state = tick(state)
    state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0000' }])

    const board = scriptProjectsReadModel(state)
    const packaged = board.packages.find((entry: { projectId: string }) => entry.projectId === 'script-0000')!
    expect(packaged).toBeDefined()
    expect(packaged.concept.provenance.origin).toBe('original')
    expect(packaged.concept.provenance.label).toBe(`An Original Screenplay by ${writer.name}`)
    expect(packaged.concept.provenance.writerId).toBe(writer.id)
    expect(packaged.concept.provenance.generatedTitle).toBe(packaged.concept.title)
    expect(packaged.concept.provenance.renamedWeek).toBeNull()
  })

  it('shows the generated title BEFORE a rename and the player’s title after', () => {
    let state = managedStudio('m3-surface-rename-visible')
    state = applyActions(state, [
      { kind: 'commissionOriginalScreenplay', screenplay: originalPayload(state, 'crime') },
    ])
    while (state.scriptDevelopment.projects[0]!.status === 'drafting') state = tick(state)
    state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0000' }])

    const before = scriptProjectsReadModel(state).packages[0]!
    const generated = before.concept.title
    expect(before.concept.provenance.generatedTitle).toBe(generated)
    expect(before.concept.provenance.renamedWeek).toBeNull()

    state = applyActions(state, [
      { kind: 'renameScreenplay', conceptId: CONCEPT_ID, title: 'House of Cascade' },
    ])
    const after = scriptProjectsReadModel(state).packages[0]!
    expect(after.concept.title).toBe('House of Cascade')
    // The working title survives as provenance — what the writers called it.
    expect(after.concept.provenance.generatedTitle).toBe(generated)
    expect(after.concept.provenance.renamedWeek).toBe(state.market.tick)
    // Its identity did not move an inch.
    expect(after.concept.id).toBe(before.concept.id)
    expect(after.projectId).toBe(before.projectId)
  })
})

describe('C2a-M3 — the package names the locations the screenplay calls for', () => {
  it('publishes the beats’ distinct set types, in words, with owned/unowned truth', () => {
    let state = managedStudio('m3-surface-set-demand')
    state = applyActions(state, [
      { kind: 'commissionOriginalScreenplay', screenplay: originalPayload(state, 'adventure') },
    ])
    while (state.scriptDevelopment.projects[0]!.status === 'drafting') state = tick(state)
    state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0000' }])

    const packaged = scriptProjectsReadModel(state).packages[0]!
    expect(packaged.requiredSets.length).toBeGreaterThanOrEqual(3)
    const seen = new Set<string>()
    for (const required of packaged.requiredSets) {
      expect(seen.has(required.setType)).toBe(false)
      seen.add(required.setType)
      // FILMMAKING WORDS, never the engine id (`00F`).
      expect(required.label).toBe(SET_TYPE_LABELS[required.setType as never])
      expect(required.label).not.toContain('-')
      expect(required.beats.length).toBeGreaterThan(0)
      expect(typeof required.standing).toBe('boolean')
    }
    // The studio's endowed house sets are generic interiors, so an adventure
    // picture asking for a jungle clearing is told the truth: it has none.
    const jungle = packaged.requiredSets.find((row: { setType: string }) => row.setType === 'jungle-clearing')
    expect(jungle?.standing).toBe(false)
  })

  it('gives a MARKET premise the same set demand — one production path', () => {
    let state = managedStudio('m3-surface-pool-demand')
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
    while (state.scriptDevelopment.projects[0]!.status === 'drafting') state = tick(state)
    state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0000' }])
    const packaged = scriptProjectsReadModel(state).packages[0]!
    expect(packaged.requiredSets.length).toBeGreaterThanOrEqual(3)
    expect(packaged.concept.provenance.origin).toBe('pool')
  })
})

describe('C2a-M3 — the week-consequence sentence counts real weeks', () => {
  it('still says ONE WEEK for a market commission, exactly as C1 did', () => {
    let state = managedStudio('m3-surface-consequence-pool')
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
    const card = scriptProjectsReadModel(state).sections.inDevelopment[0]!
    expect(card.consequence).toBe(
      'One week passes while the writer and one Development & Casting slot are occupied; payroll and studio overhead continue.',
    )
  })

  it('counts the real weeks for an original, and never promises one it will not take', () => {
    let state = managedStudio('m3-surface-consequence-original')
    state = applyActions(state, [
      { kind: 'commissionOriginalScreenplay', screenplay: originalPayload(state, 'drama') },
    ])
    const project = state.scriptDevelopment.projects[0]!
    const weeks = project.dueWeek! - project.commissionedWeek
    const card = scriptProjectsReadModel(state).sections.inDevelopment[0]!
    expect(weeks).toBeGreaterThanOrEqual(TUNING.SCRIPT_DRAFT_WEEKS_MIN)
    expect(card.consequence).toContain(
      weeks === 1 ? 'One week passes' : `${['zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'][weeks]} weeks pass`,
    )
    // And the sentence is TRUE: play it out and the screenplay lands that week.
    let played = state
    for (let week = 0; week < weeks; week++) played = tick(played)
    expect(played.scriptDevelopment.projects[0]!.status).toBe('review')
  })
})
