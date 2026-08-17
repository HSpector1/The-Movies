// First Film Journey V1 — the guided-picture projection.
//
// Every assertion below drives a REAL GameState through the real engine actions
// and tick. Nothing is hand-shaped: the chain is exactly the one a player walks.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
  nextStudioDecision,
  scriptProjectsReadModel,
  stableStringify,
  tick,
} from '../src/core/index.js'
import { firstFilmJourney } from '../src/core/firstFilmJourney.js'
import type { FirstFilmJourneyView } from '../src/core/firstFilmJourney.js'
import type {
  CastSlot,
  CommissionScriptPayload,
  CreativeRole,
  GameState,
  GreenlightScriptProjectPayload,
  SegmentId,
  StartCastingSessionPayload,
  Talent,
} from '../src/core/index.js'

// An internal identifier is `<domain>-<digits>`. Player copy must never carry one.
const INTERNAL_ID = /\b(?:script|casting|prod|production|facility|talent|concept|film)-\d+/i

function byRole(talent: readonly Talent[], role: CreativeRole): Talent[] {
  return talent.filter((person) => person.role === role)
}

function contractedByRole(state: GameState, role: CreativeRole): Talent[] {
  const contracted = new Set(state.contracts.map((contract) => contract.talentId))
  return state.talent.filter((person) => person.role === role && contracted.has(person.id))
}

/** A founded studio with enough roster depth to package and shoot a picture. */
function richFoundedStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const applicants = state.founding!.applicantIds.map(
    (id) => state.talent.find((person) => person.id === id)!,
  )
  const counts: Record<CreativeRole, number> = {
    actor: Math.max(6, FOUNDING_MINIMUMS.actor),
    director: Math.max(2, FOUNDING_MINIMUMS.director),
    writer: Math.max(3, FOUNDING_MINIMUMS.writer),
    craft: Math.max(2, FOUNDING_MINIMUMS.craft),
  }
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const person of byRole(applicants, role).slice(0, counts[role])) {
      state = applyActions(state, [{ kind: 'signContract', talentId: person.id, termWeeks: 104 }])
    }
  }
  return applyActions(state, [{ kind: 'foundStudio' }])
}

function managedStudio(seed: string): GameState {
  return applyActions(richFoundedStudio(seed), [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}

function commissionPayload(
  state: GameState,
  conceptIndex: number,
  writerId: string,
): CommissionScriptPayload {
  const concept = state.concepts[conceptIndex]!
  return {
    conceptId: concept.id,
    writerId,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult', 'prestige'] as SegmentId[],
      ranges: {
        intimacy: [-0.4, 0.6],
        tonalWeight: [0, 0.8],
        kineticEnergy: [-0.7, 0.2],
      },
    },
  }
}

function auditionSlate(state: GameState, projectId: string): StartCastingSessionPayload {
  const actors = contractedByRole(state, 'actor')
  return {
    projectId,
    slate: {
      lead: [actors[0]!.id, actors[1]!.id],
      antagonist: [actors[0]!.id, actors[2]!.id],
      support: [actors[1]!.id, actors[2]!.id],
    },
  }
}

function greenlightPayload(
  state: GameState,
  projectId: string,
): GreenlightScriptProjectPayload {
  const project = state.scriptDevelopment.projects.find((entry) => entry.id === projectId)!
  const concept = state.concepts.find((entry) => entry.id === project.conceptId)!
  const actors = contractedByRole(state, 'actor').filter(
    (person) => person.id !== project.writerId,
  )
  return {
    projectId,
    directorId: contractedByRole(state, 'director').find(
      (person) => person.id !== project.writerId,
    )!.id,
    craftIds: [
      contractedByRole(state, 'craft').find((person) => person.id !== project.writerId)!.id,
    ],
    cast: {
      lead: actors[0]!.id,
      antagonist: actors[1]!.id,
      support: actors[2]!.id,
    } satisfies Record<CastSlot, string>,
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

function copyStrings(view: FirstFilmJourneyView): string[] {
  return [
    view.headline,
    view.detail,
    view.next?.label ?? null,
    view.waiting?.reason ?? null,
    view.blocked?.reason ?? null,
  ].filter((value): value is string => value !== null)
}

describe('First Film Journey V1 — the guided chain', () => {
  it('walks fresh → commissioned → review → accepted → auditions → package → production', () => {
    const seen: FirstFilmJourneyView[] = []
    let state = managedStudio('journey-chain')

    // ── fresh studio: no picture at all ────────────────────────────────────
    const fresh = firstFilmJourney(state)
    seen.push(fresh)
    expect(fresh).toMatchObject({
      stage: 'no-picture',
      pictureTitle: null,
      ordinal: 1,
      waiting: null,
      blocked: null,
    })
    expect(fresh.next).toEqual({
      kind: 'commission',
      label: 'Commission a screenplay at Development',
      site: 'development',
    })

    // ── commissioned: the writer is drafting, the player waits ─────────────
    const writerId = scriptProjectsReadModel(state).commission.writers.find(
      (candidate) => candidate.available,
    )!.id
    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state, 0, writerId) },
    ])
    const project = state.scriptDevelopment.projects[0]!
    const title = state.concepts[0]!.title
    const writerName = state.talent.find((person) => person.id === writerId)!.name

    const drafting = firstFilmJourney(state)
    seen.push(drafting)
    expect(drafting).toMatchObject({
      stage: 'drafting',
      pictureTitle: title,
      ordinal: 1,
      headline: 'Screenplay — drafting',
      blocked: null,
    })
    expect(drafting.detail).toBe(`Writer: ${writerName} · Due Week ${String(project.dueWeek!)}`)
    // ONE quiet line: the reason names what is being waited on AND the one thing the
    // player can do about it, so no surface has to append a second near-identical
    // "Waiting — advance the week" underneath it.
    expect(drafting.waiting).toEqual({
      untilWeek: project.dueWeek,
      reason: `The draft is due Week ${String(project.dueWeek!)} — advance the week.`,
    })
    expect(drafting.next).toMatchObject({ kind: 'advance-week', site: null })
    expect(drafting.next!.label).toContain('advance the week')

    // ── the draft lands: a review decision at Development ──────────────────
    state = tick(state)
    const review = firstFilmJourney(state)
    seen.push(review)
    expect(review).toMatchObject({
      stage: 'script-review',
      pictureTitle: title,
      headline: 'Script review ready',
      waiting: null,
      blocked: null,
    })
    expect(review.next).toEqual({
      kind: 'script-review',
      label: 'Review the screenplay at Development',
      site: 'development',
    })

    // ── accepted: first-run guidance leads with auditions ──────────────────
    state = applyActions(state, [{ kind: 'acceptScript', projectId: project.id }])
    const accepted = firstFilmJourney(state)
    seen.push(accepted)
    expect(accepted).toMatchObject({
      stage: 'ready-to-package',
      pictureTitle: title,
      headline: 'Screenplay accepted',
      waiting: null,
      blocked: null,
    })
    expect(accepted.next).toEqual({
      kind: 'plan-auditions',
      label: 'Plan auditions at Casting',
      site: 'casting',
    })
    // The detail names ONLY the step this state actually offers. It used to advertise
    // "…or go straight to the picture's package" — a route the world does not carry here
    // (Casting's own verb opens the audition planner, and the package is reachable only by
    // the deep path), so the sentence sent a first-time player looking for a control that
    // is not on any surface at this stage.
    expect(accepted.detail).toBe(
      `Writer: ${writerName} · Auditions show you who can carry the picture`,
    )
    expect(accepted.detail).not.toContain('package')

    // ── auditions running: waiting on the camera tests ─────────────────────
    state = applyActions(state, [
      { kind: 'startCastingSession', session: auditionSlate(state, project.id) },
    ])
    const session = state.castingSessions.sessions[0]!
    const auditioning = firstFilmJourney(state)
    seen.push(auditioning)
    expect(auditioning).toMatchObject({
      stage: 'auditioning',
      pictureTitle: title,
      headline: 'Auditions underway',
      blocked: null,
    })
    expect(auditioning.waiting).toEqual({
      untilWeek: session.dueWeek,
      reason: `The camera tests finish in Week ${String(session.dueWeek!)} — advance the week.`,
    })
    expect(auditioning.next).toMatchObject({ kind: 'advance-week', site: null })

    // ── results in: an audition review decision at Casting ─────────────────
    state = tick(state)
    expect(state.castingSessions.sessions[0]!.status).toBe('review')
    const auditionReview = firstFilmJourney(state)
    seen.push(auditionReview)
    expect(auditionReview).toMatchObject({
      stage: 'audition-review',
      pictureTitle: title,
      headline: 'Audition results ready',
      waiting: null,
      blocked: null,
    })
    expect(auditionReview.next).toEqual({
      kind: 'audition-review',
      label: 'Review audition results at Casting',
      site: 'casting',
    })
    // The detail leads with the RESULTS, not with the picture's writer: on this state the
    // decision in front of the player is who can carry the picture, and the count comes
    // from the session's own stored reads (two per slot).
    const reads = Object.values(state.castingSessions.sessions[0]!.results!).flat().length
    expect(reads).toBe(6)
    expect(auditionReview.detail).toBe(
      `The camera tests are in — ${String(reads)} reads are waiting at Casting`,
    )
    expect(auditionReview.detail).not.toContain('Writer')

    // ── acknowledged: the package is now the recommended step ──────────────
    state = applyActions(state, [
      { kind: 'acknowledgeCastingSession', sessionId: session.id },
    ])
    const packageable = firstFilmJourney(state)
    seen.push(packageable)
    expect(packageable).toMatchObject({
      stage: 'ready-to-package',
      pictureTitle: title,
      waiting: null,
      blocked: null,
    })
    expect(packageable.next).toEqual({
      kind: 'open-package',
      label: "Assemble the picture's package at Casting",
      site: 'casting',
    })

    // ── greenlit: the picture is a production, waiting on the schedule ─────
    state = applyActions(state, [
      { kind: 'greenlightScriptProject', production: greenlightPayload(state, project.id) },
    ])
    const production = state.studio.activeProductions[0]!
    const greenlit = firstFilmJourney(state)
    seen.push(greenlit)
    expect(greenlit).toMatchObject({
      stage: 'in-production',
      pictureTitle: title,
      ordinal: 1,
      headline: 'In development',
      blocked: null,
    })
    // A picture does not advance during its own greenlight tick (tick.ts:37), so
    // the week it lands is one past the naive remaining-weeks count.
    const predictedRelease = state.market.tick + production.remainingTicks + 1
    expect(greenlit.waiting).toEqual({
      untilWeek: predictedRelease,
      reason:
        `Development continues. The picture is due in Week ${String(predictedRelease)}` +
        ' — advance the week.',
    })
    expect(greenlit.next).toMatchObject({ kind: 'advance-week', site: null })

    // ── shooting: the world stops on a production command ──────────────────
    for (let guard = 0; guard < 8; guard++) {
      const workflow = state.operations.workflows.find(
        (candidate) => candidate.productionId === production.id,
      )
      if (workflow?.phase === 'shooting') break
      state = tick(state)
    }
    expect(
      state.operations.workflows.find((w) => w.productionId === production.id)?.phase,
    ).toBe('shooting')

    const commanded = firstFilmJourney(state)
    seen.push(commanded)
    const directorName = state.talent.find(
      (person) => person.id === production.directorId,
    )!.name
    expect(commanded).toMatchObject({
      stage: 'in-production',
      pictureTitle: title,
      headline: 'Shooting',
      waiting: null,
    })
    expect(commanded.blocked).toEqual({
      reason: `${directorName} has not been called to the soundstage.`,
    })
    expect(commanded.next).toEqual({
      kind: 'resolve-production',
      label: `Call ${directorName} to the soundstage`,
      site: 'stage',
    })

    // ── resolved: every pending command answered, the week resumes ─────────
    for (let guard = 0; guard < 6; guard++) {
      const decision = nextStudioDecision(state)
      if (decision === null || decision.kind !== 'productionOperation') break
      const blocked = firstFilmJourney(state)
      seen.push(blocked)
      expect(blocked.blocked).not.toBeNull()
      expect(blocked.next).toMatchObject({ kind: 'resolve-production', site: 'stage' })
      state = applyActions(state, [decision.command])
    }
    const resolved = firstFilmJourney(state)
    seen.push(resolved)
    expect(resolved).toMatchObject({ stage: 'in-production', blocked: null })
    expect(resolved.waiting).not.toBeNull()
    expect(resolved.next).toMatchObject({ kind: 'advance-week', site: null })
    // The promised week never drifts as the picture moves through its phases.
    expect(resolved.waiting!.untilWeek).toBe(predictedRelease)

    // ── every string on the whole chain is plain player copy ───────────────
    for (const view of seen) {
      for (const copy of copyStrings(view)) {
        expect(copy.length).toBeGreaterThan(0)
        expect(copy).not.toMatch(INTERNAL_ID)
      }
      expect(view.next).not.toBeNull()
      // Every stage the player is not merely waiting through offers a real,
      // imperative destination — never "advance the week".
      if (view.waiting === null) {
        expect(view.next!.kind).not.toBe('advance-week')
        expect(view.next!.site).not.toBeNull()
      } else {
        expect(view.next!.kind).toBe('advance-week')
        expect(view.next!.site).toBeNull()
        // Every waiting line stands on its own: it says what is being waited on and
        // what to do about it, so a surface renders exactly one of them.
        expect(view.waiting!.reason).toMatch(/ — advance the week\.$/)
      }
    }
  })

  it('counts the released picture and points at the next screenplay', () => {
    let state = managedStudio('journey-release')
    const writerId = scriptProjectsReadModel(state).commission.writers.find(
      (candidate) => candidate.available,
    )!.id
    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state, 0, writerId) },
    ])
    state = tick(state)
    state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0000' }])
    state = applyActions(state, [
      { kind: 'greenlightScriptProject', production: greenlightPayload(state, 'script-0000') },
    ])
    const releasedTitle = state.concepts[0]!.title
    const promisedWeek = firstFilmJourney(state).waiting!.untilWeek

    for (let guard = 0; guard < 24 && state.studio.activeProductions.length > 0; guard++) {
      const decision = nextStudioDecision(state)
      if (decision !== null && decision.kind === 'productionOperation') {
        state = applyActions(state, [decision.command])
        continue
      }
      state = tick(state)
    }
    expect(state.studio.activeProductions).toHaveLength(0)
    expect(state.studio.releasedFilms).toHaveLength(1)
    // The week the journey promised is the week the finished picture is in hand.
    expect(state.market.tick).toBe(promisedWeek)

    const released = firstFilmJourney(state)
    expect(released).toMatchObject({
      stage: 'released',
      pictureTitle: releasedTitle,
      // The studio's SECOND picture is the one being guided now.
      ordinal: 2,
      headline: 'In release',
      waiting: null,
    })
    expect(released.next).toEqual({
      kind: 'commission',
      label: 'Commission a screenplay at Development',
      site: 'development',
    })
    for (const copy of copyStrings(released)) expect(copy).not.toMatch(INTERNAL_ID)
  })

  it('names the outermost blocker instead of pretending a commission is legal', () => {
    const founding = beginFounding(generateWorld('journey-founding'))
    const view = firstFilmJourney(founding)
    expect(view).toMatchObject({ stage: 'no-picture', pictureTitle: null, ordinal: 1 })
    expect(view.next?.kind).toBe('commission')
    expect(view.blocked?.reason).toContain('Finish founding the studio')

    const legacy = generateWorld('journey-legacy')
    const legacyView = firstFilmJourney(legacy)
    expect(legacyView.stage).toBe('no-picture')
    expect(legacyView.blocked).not.toBeNull()
    for (const copy of copyStrings(legacyView)) expect(copy).not.toMatch(INTERNAL_ID)
  })

  it('is deterministic, pure, and consumes no RNG', () => {
    let state = managedStudio('journey-purity')
    const writerId = scriptProjectsReadModel(state).commission.writers.find(
      (candidate) => candidate.available,
    )!.id
    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state, 0, writerId) },
    ])
    state = tick(state)
    state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0000' }])

    const before = stableStringify(state)
    const rngBefore = state.rngState
    const talentBefore = state.talent
    const projectsBefore = state.scriptDevelopment.projects

    const first = firstFilmJourney(state)
    const second = firstFilmJourney(state)
    expect(second).toEqual(first)

    expect(stableStringify(state)).toBe(before)
    expect(state.rngState).toBe(rngBefore)
    expect(state.talent).toBe(talentBefore)
    expect(state.scriptDevelopment.projects).toBe(projectsBefore)

    // A structurally identical but independently constructed state agrees.
    const cloned = structuredClone(state)
    expect(firstFilmJourney(cloned)).toEqual(first)

    // Mutating the returned view can never reach state.
    first.headline = 'mutated'
    if (first.next !== null) first.next.label = 'mutated'
    expect(stableStringify(state)).toBe(before)
    expect(firstFilmJourney(state).headline).toBe('Screenplay accepted')
  })
})

describe('Script Projects V1 read-model corrections', () => {
  it('offers the best writing estimate first, with a canonical tie-break', () => {
    const state = managedStudio('journey-writer-order')
    const writers = scriptProjectsReadModel(state).commission.writers
    expect(writers.length).toBeGreaterThan(1)

    const scores = writers.map((writer) => writer.writingEstimate.score)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
    expect(scores[0]).toBe(Math.max(...scores))
    for (let index = 1; index < writers.length; index++) {
      const previous = writers[index - 1]!
      const current = writers[index]!
      if (previous.writingEstimate.score === current.writingEstimate.score) {
        expect(previous.id < current.id).toBe(true)
      }
    }

    // Order is independent of input array identity/order.
    const shuffled = structuredClone(state)
    shuffled.talent.reverse()
    expect(scriptProjectsReadModel(shuffled).commission.writers.map((w) => w.id)).toEqual(
      writers.map((w) => w.id),
    )
  })

  it('stops calling the Writers Room idle while a picture develops in that facility', () => {
    let state = managedStudio('journey-idle-contradiction')
    const writerId = scriptProjectsReadModel(state).commission.writers.find(
      (candidate) => candidate.available,
    )!.id
    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state, 0, writerId) },
    ])
    state = tick(state)
    state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0000' }])
    state = applyActions(state, [
      { kind: 'greenlightScriptProject', production: greenlightPayload(state, 'script-0000') },
    ])
    const title = state.concepts[0]!.title

    const board = scriptProjectsReadModel(state)
    expect(board.sections.inDevelopment).toHaveLength(0)
    expect(board.sections.needsReview).toHaveLength(0)
    expect(board.sections.readyToPackage).toHaveLength(0)
    expect(board.capacity.available).toBeGreaterThan(0)
    expect(
      board.capacity.facilities.some((facility) =>
        facility.slots.some((slot) => slot.occupant?.owner === 'production'),
      ),
    ).toBe(true)

    // The screenplay system's own state is unchanged — every gate keyed to
    // `kind` keeps its exact meaning — but the copy no longer contradicts the
    // picture occupying the building.
    expect(board.lotAttention.kind).toBe('idle')
    expect(board.lotAttention.headline).not.toBe('Writers Room idle')
    expect(board.lotAttention.headline).toContain(title)
    expect(board.lotAttention.detail).toContain(title)
    expect(board.commission.canStart).toBe(true)

    // With nothing at all in the facility the original idle line still stands.
    const empty = managedStudio('journey-idle-empty')
    expect(scriptProjectsReadModel(empty).lotAttention).toEqual({
      kind: 'idle',
      headline: 'Writers Room idle',
      detail: 'No screenplay currently needs attention.',
    })
  })
})
