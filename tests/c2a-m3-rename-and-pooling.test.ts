// ── C2a-M3 — rename, and the bounded writer pool (charter §3.5, `00E`.9) ─────
//
// TWO VERBS AND ONE DELIBERATE NON-BEHAVIOUR.
//
// RENAME writes the ONE stored display title and nothing else. The proof that
// matters is negative: identity, deterministic keys, the blueprint's generated
// title, and the two frozen-history surfaces are all unchanged afterwards.
//
// THE FROZEN TWO ARE ASSERTED FROZEN, ON PURPOSE. `TalentCareerEvent.filmTitle`
// and `BroadcastItem.template` copy the title forward at release and keep it
// forever. A career record names the film as it was called when the person made
// it; a press clipping is a clipping. Lane 14 §4.3-B predicted a playtester would
// file this as a bug, so it is a contract behaviour with a test, not an accident.

import { describe, expect, it } from 'vitest'
import {
  FOUNDING_MINIMUMS,
  ORIGINAL_CONCEPT_ID_PREFIX,
  TUNING,
  applyActions,
  beginFounding,
  blueprintForConcept,
  generateWorld,
  makeSave,
  scriptProjectWriterIds,
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

function managedStudio(seed: string, extraWriters = 0): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = applicants(state)
  for (const hire of [
    ...byRole(pool, 'actor').slice(0, FOUNDING_MINIMUMS.actor),
    ...byRole(pool, 'director').slice(0, FOUNDING_MINIMUMS.director),
    ...byRole(pool, 'writer').slice(0, FOUNDING_MINIMUMS.writer + extraWriters),
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
  genre: Genre = 'drama',
  writerIndex = 0,
): CommissionOriginalScreenplayPayload {
  return {
    writerId: contractedWriters(state)[writerIndex]!.id,
    genre,
    shape: { opening: 'slowSetup', midpoint: 'escalation', ending: 'bittersweet' },
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

function commissionedOriginal(seed: string): GameState {
  const state = managedStudio(seed)
  return applyActions(state, [
    { kind: 'commissionOriginalScreenplay', screenplay: originalPayload(state) },
  ])
}

const CONCEPT_ID = `${ORIGINAL_CONCEPT_ID_PREFIX}0000`

describe('C2a-M3 — renaming a screenplay', () => {
  it('writes the display title and NOTHING else', () => {
    const state = commissionedOriginal('m3-rename-basics')
    const before = state.concepts.find((concept) => concept.id === CONCEPT_ID)!
    const generated = before.title

    const renamed = applyActions(state, [
      { kind: 'renameScreenplay', conceptId: CONCEPT_ID, title: 'The Quiet Ledger' },
    ])
    const after = renamed.concepts.find((concept) => concept.id === CONCEPT_ID)!

    expect(after.title).toBe('The Quiet Ledger')
    // IDENTITY AND EVERY DETERMINISTIC KEY, UNTOUCHED.
    expect(after.id).toBe(before.id)
    expect(after.genre).toBe(before.genre)
    expect(after.baselineStrength).toBe(before.baselineStrength)
    expect(after.originalityRaw).toBe(before.originalityRaw)
    expect(after.baseNegativeCost).toBe(before.baseNegativeCost)
    expect(after.roleRequirements).toEqual(before.roleRequirements)
    expect(after.requiredSlots).toEqual(before.requiredSlots)
    // The project still names the same concept; no re-linking happened.
    expect(renamed.scriptDevelopment.projects[0]!.conceptId).toBe(CONCEPT_ID)
    expect(renamed.rngState).toBe(state.rngState)

    // THE BLUEPRINT REMEMBERS WHAT THE WRITERS CALLED IT.
    const blueprint = blueprintForConcept(renamed.originalScreenplays, CONCEPT_ID)!
    expect(blueprint.generatedTitle).toBe(generated)
    expect(blueprint.renamedWeek).toBe(renamed.market.tick)
    expect(blueprint.ordinal).toBe(0)
    expect(blueprint.beats).toEqual(
      blueprintForConcept(state.originalScreenplays, CONCEPT_ID)!.beats,
    )
  })

  it('reaches every live surface, because there is only one stored title', () => {
    const state = commissionedOriginal('m3-rename-surfaces')
    const generated = state.concepts.find((concept) => concept.id === CONCEPT_ID)!.title
    const renamed = applyActions(state, [
      { kind: 'renameScreenplay', conceptId: CONCEPT_ID, title: 'Nights of the Verdict' },
    ])
    const serialised = stableStringify(renamed)
    // The old title survives NOWHERE in live state, which is the whole proof
    // that no surface cached a copy of it.
    expect(serialised).not.toContain(`"title":"${generated}"`)
    expect(serialised).toContain('Nights of the Verdict')
    // Except in the blueprint's provenance, where it is supposed to survive.
    expect(blueprintForConcept(renamed.originalScreenplays, CONCEPT_ID)!.generatedTitle).toBe(
      generated,
    )
  })

  it('refuses a pool premise, an empty title, an over-long one, and control characters', () => {
    const state = commissionedOriginal('m3-rename-refusals')
    const before = stableStringify(state)
    const poolConcept = state.concepts[0]!.id

    // V1 SCOPE: generated screenplays only. A market premise keeps the name it
    // came with.
    expect(() =>
      applyActions(state, [
        { kind: 'renameScreenplay', conceptId: poolConcept, title: 'Renamed Pool Premise' },
      ]),
    ).toThrow(/screenplay this studio wrote/)
    expect(() =>
      applyActions(state, [
        { kind: 'renameScreenplay', conceptId: CONCEPT_ID, title: '   ' },
      ]),
    ).toThrow(/needs a title/)
    expect(() =>
      applyActions(state, [
        {
          kind: 'renameScreenplay',
          conceptId: CONCEPT_ID,
          title: 'x'.repeat(TUNING.SCREENPLAY_TITLE_MAX_LENGTH + 1),
        },
      ]),
    ).toThrow(/at most/)
    expect(() =>
      applyActions(state, [
        { kind: 'renameScreenplay', conceptId: CONCEPT_ID, title: 'BadTitle' },
      ]),
    ).toThrow(/control characters/)
    expect(() =>
      applyActions(state, [
        { kind: 'renameScreenplay', conceptId: 'concept-orig-9999', title: 'Ghost' },
      ]),
    ).toThrow(/screenplay this studio wrote/)
    expect(stableStringify(state)).toBe(before)
  })

  it('trims, and can be done more than once', () => {
    let state = commissionedOriginal('m3-rename-twice')
    state = applyActions(state, [
      { kind: 'renameScreenplay', conceptId: CONCEPT_ID, title: '  The First Choice  ' },
    ])
    expect(state.concepts.find((concept) => concept.id === CONCEPT_ID)!.title).toBe(
      'The First Choice',
    )
    const firstWeek = blueprintForConcept(state.originalScreenplays, CONCEPT_ID)!.renamedWeek
    state = tick(state)
    state = applyActions(state, [
      { kind: 'renameScreenplay', conceptId: CONCEPT_ID, title: 'The Second Choice' },
    ])
    expect(state.concepts.find((concept) => concept.id === CONCEPT_ID)!.title).toBe(
      'The Second Choice',
    )
    expect(blueprintForConcept(state.originalScreenplays, CONCEPT_ID)!.renamedWeek).toBeGreaterThan(
      firstWeek!,
    )
    // Still saveable: the invariant is "never renamed ⇒ still the generated
    // title", not "the title never changes".
    expect(makeSave(state).saveVersion).toBe(14)
  })

  it('leaves the TWO frozen-history surfaces frozen, BY DESIGN', () => {
    // Built as a direct state assertion rather than a full playthrough: what is
    // under test is that a rename does not reach into records that copied the
    // title forward, and those records are pure data.
    const state = commissionedOriginal('m3-rename-frozen-history')
    const generated = state.concepts.find((concept) => concept.id === CONCEPT_ID)!.title
    const withHistory: GameState = {
      ...state,
      careerEvents: [
        {
          eventId: 'prod-0001:t-wri-00',
          talentId: 't-wri-00',
          filmId: 'prod-0001',
          filmTitle: generated,
          releaseWeek: state.market.tick,
          genre: 'drama',
          role: 'writer',
          billingWeight: 1,
          discipline: 'writing',
          ovrBefore: 50,
          ovrAfter: 50,
          skillsBefore: {},
          skillsAfter: {},
          skillDeltas: {},
          genreExpBefore: 0,
          genreExpAfter: 1,
          workHistoryBefore: 0,
          workHistoryAfter: 1,
          starPowerBefore: 10,
          starPowerAfter: 10,
          starPowerDelta: 0,
          realizedOpening: 0,
          realizedTotal: 0,
          audienceScore: 50,
          criticScore: 50,
          forecastComparator: 1,
          reasonCodes: ['noMeaningfulCareerChange'],
        },
      ]
    }
    const renamed = applyActions(withHistory, [
      { kind: 'renameScreenplay', conceptId: CONCEPT_ID, title: 'A Study in Cascade' },
    ])

    expect(renamed.concepts.find((concept) => concept.id === CONCEPT_ID)!.title).toBe(
      'A Study in Cascade',
    )
    // THE CAREER RECORD STILL NAMES THE FILM AS IT WAS CALLED AT THE TIME.
    expect(renamed.careerEvents[0]!.filmTitle).toBe(generated)
    expect(renamed.careerEvents).toEqual(withHistory.careerEvents)
  })
})

describe('C2a-M3 — the bounded writer pool (00E.9)', () => {
  it('adds a hand, shortens the draft, and never moves the due week into the past', () => {
    let state = managedStudio('m3-pool-speed', 2)
    const writers = contractedWriters(state)
    expect(writers.length).toBeGreaterThanOrEqual(2)
    state = applyActions(state, [
      { kind: 'commissionOriginalScreenplay', screenplay: originalPayload(state, 'adventure') },
    ])
    const solo = state.scriptDevelopment.projects[0]!
    const soloDue = solo.dueWeek!

    const pooled = applyActions(state, [
      { kind: 'assignScreenplayWriter', projectId: 'script-0000', writerId: writers[1]!.id },
    ])
    const project = pooled.scriptDevelopment.projects[0]!
    expect(scriptProjectWriterIds(project)).toEqual([writers[0]!.id, writers[1]!.id])
    expect(project.writerId).toBe(writers[0]!.id)
    expect(project.dueWeek!).toBeLessThanOrEqual(soloDue)
    expect(project.dueWeek!).toBeGreaterThan(pooled.market.tick)
    // Attribution is untouched: the blueprint still credits who was commissioned.
    expect(blueprintForConcept(pooled.originalScreenplays, CONCEPT_ID)!.writerId).toBe(
      writers[0]!.id,
    )
  })

  it('makes a pooled writer BUSY everywhere at once', () => {
    let state = managedStudio('m3-pool-busy', 2)
    const writers = contractedWriters(state)
    state = applyActions(state, [
      { kind: 'commissionOriginalScreenplay', screenplay: originalPayload(state, 'comedy') },
    ])
    state = applyActions(state, [
      { kind: 'assignScreenplayWriter', projectId: 'script-0000', writerId: writers[1]!.id },
    ])
    // A pooled writer cannot be commissioned onto a second screenplay…
    expect(() =>
      applyActions(state, [
        {
          kind: 'commissionOriginalScreenplay',
          screenplay: originalPayload(state, 'horror', 1),
        },
      ]),
    ).toThrow(/already has an active assignment/)
    // …nor joined to another project, nor added to this one twice.
    expect(() =>
      applyActions(state, [
        { kind: 'assignScreenplayWriter', projectId: 'script-0000', writerId: writers[1]!.id },
      ]),
    ).toThrow(/already has an active assignment/)
  })

  it('refuses the sixth writer — the corpus cap is five', () => {
    let state = managedStudio('m3-pool-cap', 6)
    const writers = contractedWriters(state)
    // Asserted, never skipped: a guard that returned early here would make the
    // cap proof pass by not running.
    expect(writers.length).toBeGreaterThan(TUNING.SCRIPT_DRAFT_MAX_WRITERS)
    state = applyActions(state, [
      { kind: 'commissionOriginalScreenplay', screenplay: originalPayload(state, 'crime') },
    ])
    for (let i = 1; i < TUNING.SCRIPT_DRAFT_MAX_WRITERS; i++) {
      state = applyActions(state, [
        { kind: 'assignScreenplayWriter', projectId: 'script-0000', writerId: writers[i]!.id },
      ])
    }
    expect(scriptProjectWriterIds(state.scriptDevelopment.projects[0]!)).toHaveLength(
      TUNING.SCRIPT_DRAFT_MAX_WRITERS,
    )
    expect(() =>
      applyActions(state, [
        {
          kind: 'assignScreenplayWriter',
          projectId: 'script-0000',
          writerId: writers[TUNING.SCRIPT_DRAFT_MAX_WRITERS]!.id,
        },
      ]),
    ).toThrow(/maximum of 5 writers/)
    expect(makeSave(state).saveVersion).toBe(14)
  })

  it('is refused on a screenplay that is not being drafted', () => {
    let state = managedStudio('m3-pool-status', 2)
    const writers = contractedWriters(state)
    state = applyActions(state, [
      { kind: 'commissionOriginalScreenplay', screenplay: originalPayload(state, 'romance') },
    ])
    while (state.scriptDevelopment.projects[0]!.status === 'drafting') state = tick(state)
    expect(state.scriptDevelopment.projects[0]!.status).toBe('review')
    expect(() =>
      applyActions(state, [
        { kind: 'assignScreenplayWriter', projectId: 'script-0000', writerId: writers[1]!.id },
      ]),
    ).toThrow(/not being drafted/)
  })
})
