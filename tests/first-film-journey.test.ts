// First Film Journey V1 — the guided-picture projection.
//
// Every assertion below drives a REAL GameState through the real engine actions
// and tick. Nothing is hand-shaped: the chain is exactly the one a player walks.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  castingSessionsReadModel,
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
import {
  contendedGreenlightStudio,
  contendedStudio,
  freePackage,
  freeSlate,
} from './_m4Fixtures.js'

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

/** Exact real roster for the package-blocker proof: no spare studio director. */
function packageBlockedStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const applicants = state.founding!.applicantIds.map(
    (id) => state.talent.find((person) => person.id === id)!,
  )
  const counts: Record<CreativeRole, number> = {
    actor: 3,
    director: 1,
    writer: 3,
    craft: 1,
  }
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const selected = byRole(applicants, role).slice(0, counts[role])
    if (selected.length !== counts[role]) {
      throw new Error(`package-blocked fixture lacks ${role} applicants`)
    }
    for (const person of selected) {
      state = applyActions(state, [
        { kind: 'signContract', talentId: person.id, termWeeks: 104 },
      ])
    }
  }
  state = applyActions(state, [{ kind: 'foundStudio' }])
  return applyActions(state, [
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
  const occupied = new Set(
    state.studio.activeProductions.flatMap((production) => [
      production.writerId,
      production.directorId,
      production.cast.lead,
      production.cast.antagonist,
      production.cast.support,
      ...production.craftIds,
    ]),
  )
  const actors = contractedByRole(state, 'actor').filter(
    (person) => person.id !== project.writerId && !occupied.has(person.id),
  )
  return {
    projectId,
    directorId: contractedByRole(state, 'director').find(
      (person) => person.id !== project.writerId && !occupied.has(person.id),
    )!.id,
    craftIds: [
      contractedByRole(state, 'craft').find(
        (person) => person.id !== project.writerId && !occupied.has(person.id),
      )!.id,
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
    view.whatHappened,
    view.whyItMatters,
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
      scriptProjectId: null,
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
      beat: 'screenplay-writing',
      headline: 'SCREENPLAY IN PROGRESS',
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
      beat: 'screenplay-review',
      headline: 'SCREENPLAY READY',
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
      beat: 'screenplay-ready',
      headline: 'SCREENPLAY ACCEPTED',
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
      beat: 'auditions-running',
      headline: 'CAMERA TESTS UNDERWAY',
      blocked: null,
    })
    expect(auditioning.whyItMatters).toBe(
      // P05A.2: the old line claimed "Role Fit updates for this screenplay" —
      // false; projectFit never reads audition evidence. The card now states
      // only what the engine records.
      'The casting sheet keeps the observed estimate and range for each read. The tests assign no role and change no one — the evidence informs your choice alongside Fit, Star Power, availability, and cost.',
    )
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
      beat: 'auditions-ready',
      headline: 'AUDITION RESULTS READY',
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
      beat: 'auditions-reviewed',
      headline: 'AUDITIONS REVIEWED',
      waiting: null,
      blocked: null,
    })
    expect(packageable.next).toEqual({
      kind: 'open-package',
      label: "Assemble the picture's package at Casting",
      site: 'casting',
    })
    for (const scriptBacked of [
      drafting,
      review,
      accepted,
      auditioning,
      auditionReview,
      packageable,
    ]) {
      expect(scriptBacked.scriptProjectId).toBe(project.id)
    }

    // ── greenlit: the picture is a production, waiting on the schedule ─────
    state = applyActions(state, [
      { kind: 'greenlightScriptProject', production: greenlightPayload(state, project.id) },
    ])
    const production = state.studio.activeProductions[0]!
    const greenlit = firstFilmJourney(state)
    seen.push(greenlit)
    expect(greenlit).toMatchObject({
      stage: 'in-production',
      scriptProjectId: project.id,
      pictureTitle: title,
      ordinal: 1,
      beat: 'greenlit',
      headline: 'PICTURE GREENLIT',
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
    let calmLoadInSeen = false
    for (let guard = 0; guard < 8; guard++) {
      const workflow = state.operations.workflows.find(
        (candidate) => candidate.productionId === production.id,
      )
      if (workflow?.phase === 'rehearsal') {
        // P05A W1: Rehearsal is company/stage preparation — `LOAD-IN` is
        // reserved for the exact Shooting scenery transit (Package 05 §8). The
        // wire beat stays `load-in` until W2's governed schema bump adds the
        // exact `rehearsal` member; the player-facing copy is corrected now.
        const rehearsing = firstFilmJourney(state)
        expect(rehearsing).toMatchObject({
          // P05A W2: the exact rehearsal beat shipped with projection v12.
          beat: 'rehearsal',
          headline: 'REHEARSAL',
          blocked: null,
        })
        expect(rehearsing.waiting?.reason).toContain('Rehearsal continues.')
        expect(rehearsing.waiting?.reason).not.toContain('load-in')
        calmLoadInSeen = true
      }
      if (workflow?.phase === 'shooting') break
      state = tick(state)
    }
    expect(calmLoadInSeen).toBe(true)
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
      beat: 'shooting',
      // W7 hostile F6: while the Director call stands, the card must not
      // claim the phase's happy milestone — the headline names the decision.
      headline: 'DIRECTOR CALL REQUIRED',
      whatHappened: 'The company holds its stage; principal photography has not started.',
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
    let sceneryStepsSeen = 0
    for (let guard = 0; guard < 6; guard++) {
      const decision = nextStudioDecision(state)
      if (decision === null || decision.kind !== 'productionOperation') break
      const blocked = firstFilmJourney(state)
      seen.push(blocked)
      expect(blocked.blocked).not.toBeNull()
      expect(blocked.next).toMatchObject({ kind: 'resolve-production' })
      if (decision.command.kind === 'clearSceneryLoadIn') {
        // P05A W1 (review finding F4): unreachable on the founding lot — the
        // Director call settles the due-at-call trip in its own transaction.
        // Reaching here means the settlement law regressed; fail loudly. The
        // grandfathered clear journey (LOAD-IN BLOCKED, reserved-facility
        // naming) is pinned in tests/p05a-w1-scenery-truth.test.ts.
        throw new Error(
          'founding-lot walk saw a manual scenery clear — due-at-call settlement regressed',
        )
      } else {
        expect(blocked.next!.site).toBe('stage')
      }
      state = applyActions(state, [decision.command])
    }
    // P05A W1: on the founding lot the derived trip is already due at the
    // Director call, and the call's own transaction settles it — the scenery
    // step is no longer a player decision anywhere in this walk. The arrival
    // still happened, exactly once, in the studio's own history.
    expect(sceneryStepsSeen).toBe(0)
    expect(
      state.studioEvents.rows.filter(
        (row) => row.kind === 'sceneryArrived' && row.productionId === production.id,
      ),
    ).toHaveLength(1)
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

  it('counts the released picture and routes an unavailable next screenplay honestly', () => {
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
    const releasedProductionId = state.scriptDevelopment.projects[0]!.productionId!
    const releasedTitle = state.concepts[0]!.title
    const promisedWeek = firstFilmJourney(state).waiting!.untilWeek
    const witnessedProductionBeats = new Set<string>()

    for (let guard = 0; guard < 24 && state.studio.activeProductions.length > 0; guard++) {
      witnessedProductionBeats.add(firstFilmJourney(state).beat)
      const decision = nextStudioDecision(state)
      if (decision !== null && decision.kind === 'productionOperation') {
        state = applyActions(state, [decision.command])
        continue
      }
      // P06A (charter W1): Release Ready now HOLDS until an explicit commit — the
      // journey names this as its own decision tier (`releaseReview`) precisely
      // because it carries no resolvable command. Honor it the same way a real
      // player would before advancing the week.
      if (decision !== null && decision.kind === 'releaseReview') {
        state = applyActions(state, [
          { kind: 'commitPictureToRelease', productionId: decision.productionId },
        ])
        continue
      }
      state = tick(state)
    }
    expect(state.studio.activeProductions).toHaveLength(0)
    expect(state.studio.releasedFilms).toHaveLength(1)
    // The week the journey promised is the week the finished picture is in hand.
    expect(state.market.tick).toBe(promisedWeek)
    expect([...witnessedProductionBeats]).toEqual(expect.arrayContaining([
      'greenlit',
      'pre-production',
      // P05A W2: rehearsal has its own beat; the founding lot never shows
      // 'load-in' (due-at-call settles inside the Director call).
      'rehearsal',
      'shooting',
      'post-production',
      'release-ready',
    ]))

    const released = firstFilmJourney(state)
    expect(released).toMatchObject({
      stage: 'released',
      productionId: releasedProductionId,
      scriptProjectId: 'script-0000',
      pictureTitle: releasedTitle,
      // This remains the studio's first commissioned picture; the card's identity
      // does not jump to PICTURE 2 merely because its next action begins that picture.
      ordinal: 1,
      beat: 'released',
      headline: 'PICTURE RELEASED',
      waiting: null,
    })
    expect(released.next).toEqual({
      kind: 'commission',
      label: 'Commission a screenplay at Development',
      site: 'development',
    })
    for (const copy of copyStrings(released)) expect(copy).not.toMatch(INTERNAL_ID)

    for (const writer of scriptProjectsReadModel(state).commission.writers) {
      state = applyActions(state, [{ kind: 'releaseTalent', talentId: writer.id }])
    }
    expect(scriptProjectsReadModel(state).commission.canStart).toBe(false)

    const blockedReleased = firstFilmJourney(state)
    expect(blockedReleased).toMatchObject({
      stage: 'released',
      pictureTitle: releasedTitle,
      blocked: { reason: expect.stringContaining('No contracted writer is available') },
    })
    expect(blockedReleased.next).toEqual({
      kind: 'commission',
      label: 'Review the screenplay blocker at Development',
      site: 'development',
    })
    expect(blockedReleased.next?.label).not.toContain('Commission a screenplay')
    expect(blockedReleased.whyItMatters).toContain('cannot start')
    expect(blockedReleased.whyItMatters).not.toContain('Development is free')
  })

  it('keeps a concurrent second picture visible until a real production decision takes priority', () => {
    let state = managedStudio('journey-concurrent-second')
    const writers = scriptProjectsReadModel(state).commission.writers
      .filter((writer) => writer.available && writer.primaryRole === 'writer')
      .slice(0, 2)
    expect(writers).toHaveLength(2)

    state = applyActions(state, [
      {
        kind: 'commissionScript',
        project: commissionPayload(state, 0, writers[0]!.id),
      },
      {
        kind: 'commissionScript',
        project: commissionPayload(state, 1, writers[1]!.id),
      },
    ])
    const firstProject = state.scriptDevelopment.projects[0]!
    const secondProject = state.scriptDevelopment.projects[1]!

    for (let guard = 0; guard < 12; guard++) {
      const reviews = state.scriptDevelopment.projects.filter(
        (project) => project.status === 'review',
      )
      if (reviews.length > 0) {
        state = applyActions(
          state,
          reviews.map((project) => ({ kind: 'acceptScript' as const, projectId: project.id })),
        )
      }
      if (state.scriptDevelopment.projects.every((project) => project.status === 'ready')) break
      state = tick(state)
    }
    expect(state.scriptDevelopment.projects.map((project) => project.status)).toEqual([
      'ready',
      'ready',
    ])

    state = applyActions(state, [
      {
        kind: 'greenlightScriptProject',
        production: greenlightPayload(state, firstProject.id),
      },
    ])
    const firstProductionId = state.scriptDevelopment.projects[0]!.productionId!
    expect(nextStudioDecision(state)).toBeNull()

    // The older production is calm, so the accepted screenplay that still needs
    // player work remains the journey. Its ordinal comes from commissioning identity,
    // not from the number of releases (which is still zero).
    expect(firstFilmJourney(state)).toMatchObject({
      stage: 'ready-to-package',
      beat: 'screenplay-ready',
      productionId: null,
      scriptProjectId: secondProject.id,
      ordinal: 2,
      blocked: null,
      next: { kind: 'plan-auditions', site: 'casting' },
    })

    let productionDecision = nextStudioDecision(state)
    for (let guard = 0; guard < 12 && productionDecision === null; guard++) {
      state = tick(state)
      productionDecision = nextStudioDecision(state)
    }
    expect(productionDecision).toMatchObject({
      kind: 'productionOperation',
      productionId: firstProductionId,
    })

    // A decision that stops the studio still wins over the newer screenplay.
    expect(firstFilmJourney(state)).toMatchObject({
      stage: 'in-production',
      productionId: firstProductionId,
      scriptProjectId: firstProject.id,
      ordinal: 1,
      blocked: { reason: expect.any(String) },
      next: { kind: 'resolve-production' },
    })

    // Clear the production's currently published commands, then greenlight Picture 2
    // while Picture 1 is still active. With no decision or screenplay left in hand, the
    // newest production is the persistent calm fallback.
    for (let guard = 0; guard < 8; guard++) {
      const decision = nextStudioDecision(state)
      if (decision === null) break
      expect(decision.kind).toBe('productionOperation')
      if (decision.kind !== 'productionOperation') break
      state = applyActions(state, [decision.command])
    }
    expect(nextStudioDecision(state)).toBeNull()
    expect(state.studio.activeProductions.some((production) => production.id === firstProductionId))
      .toBe(true)

    state = applyActions(state, [
      {
        kind: 'greenlightScriptProject',
        production: greenlightPayload(state, secondProject.id),
      },
    ])
    const secondProductionId = state.scriptDevelopment.projects[1]!.productionId!
    expect(secondProductionId).not.toBe(firstProductionId)
    expect(state.studio.activeProductions).toHaveLength(2)
    expect(firstFilmJourney(state)).toMatchObject({
      stage: 'in-production',
      productionId: secondProductionId,
      scriptProjectId: secondProject.id,
      ordinal: 2,
      blocked: null,
    })
  })

  it('routes a blocked package through queueable auditions before package assembly', () => {
    let state = packageBlockedStudio('journey-blocked-2')
    const soleDirector = contractedByRole(state, 'director')[0]!
    const directorAsWriter = scriptProjectsReadModel(state).commission.writers.find(
      (writer) => writer.id === soleDirector.id && writer.available,
    )
    expect(directorAsWriter).toBeDefined()

    state = applyActions(state, [
      {
        kind: 'commissionScript',
        project: commissionPayload(state, 0, directorAsWriter!.id),
      },
    ])
    for (let guard = 0; guard < 8; guard++) {
      const project = state.scriptDevelopment.projects[0]!
      if (project.status === 'review') break
      state = tick(state)
    }
    const target = state.scriptDevelopment.projects[0]!
    expect(target.status).toBe('review')
    state = applyActions(state, [{ kind: 'acceptScript', projectId: target.id }])

    const writers = scriptProjectsReadModel(state).commission.writers
      .filter((writer) => writer.available && writer.primaryRole === 'writer')
      .slice(0, 2)
    expect(writers).toHaveLength(2)

    // Two real screenplay commissions fill both shared Development & Casting slots.
    // The target's sole studio director is also its credited writer, so Package cannot
    // use that person as its director; this seed's week-one freelancer market has none.
    // No state is hand-shaped for either condition.
    state = applyActions(state, [
      {
        kind: 'commissionScript',
        project: commissionPayload(state, 1, writers[0]!.id),
      },
      {
        kind: 'commissionScript',
        project: commissionPayload(state, 2, writers[1]!.id),
      },
    ])

    const board = scriptProjectsReadModel(state)
    const packageView = board.packages.find((entry) => entry.projectId === target.id)!
    const castingView = castingSessionsReadModel(state).sections.readyToPlan.find(
      (entry) => entry.projectId === target.id,
    )!
    expect(packageView.openAction).toBeNull()
    expect(castingView.legalActions.some((action) => action.kind === 'planAuditions')).toBe(true)

    const blocked = firstFilmJourney(state)
    expect(blocked).toMatchObject({
      stage: 'ready-to-package',
      productionId: null,
      scriptProjectId: target.id,
      ordinal: 1,
      blocked: null,
      next: {
        kind: 'plan-auditions',
        label: 'Plan auditions at Casting',
        site: 'casting',
      },
    })
    expect(blocked.next?.label).not.toContain('Assemble')
  })

  it('reports exact queued auditions as waiting work and advances instead of offering them twice', () => {
    const contended = contendedStudio('journey-queued-auditions')
    const targetProjectId = contended.readyProjectIds[0]!
    const state = applyActions(contended.state, [
      {
        kind: 'startCastingSession',
        session: freeSlate(contended.state, targetProjectId),
      },
    ])

    expect(state.productionQueue).toMatchObject([
      { kind: 'startCastingSession', payload: { projectId: targetProjectId } },
    ])
    expect(state.castingSessions.sessions.some(
      (session) => session.projectId === targetProjectId,
    )).toBe(false)
    const waiting = firstFilmJourney(state)
    expect(waiting).toMatchObject({
      stage: 'ready-to-package',
      beat: 'screenplay-ready',
      productionId: null,
      scriptProjectId: targetProjectId,
      headline: 'AUDITIONS QUEUED',
      blocked: null,
      next: { kind: 'advance-week', site: null },
      waiting: { untilWeek: null, reason: expect.stringMatching(/camera-test request.*revalidated.*advance the week/i) },
    })
    expect(waiting.whatHappened).toMatch(/joined the Development & Casting queue/i)
    expect(waiting.whyItMatters).toMatch(/No camera test has started.*no actor is reserved/i)
    for (const copy of copyStrings(waiting)) expect(copy).not.toMatch(INTERNAL_ID)
  })

  it('keeps a queued greenlight pre-production and preserves another project journey', () => {
    const contended = contendedGreenlightStudio('journey-queued-greenlight')
    const queuedState = applyActions(contended.state, [
      {
        kind: 'greenlightScriptProject',
        production: freePackage(contended.state, contended.targetProjectId),
      },
    ])

    expect(queuedState.productionQueue).toMatchObject([
      {
        kind: 'greenlightScriptProject',
        scriptProjectId: contended.targetProjectId,
      },
    ])
    expect(queuedState.scriptDevelopment.projects.find(
      (project) => project.id === contended.targetProjectId,
    )).toMatchObject({ status: 'ready', productionId: null })
    const waiting = firstFilmJourney(queuedState)
    expect(waiting).toMatchObject({
      stage: 'ready-to-package',
      beat: 'auditions-reviewed',
      productionId: null,
      scriptProjectId: contended.targetProjectId,
      headline: 'GREENLIGHT QUEUED',
      blocked: null,
      next: { kind: 'advance-week', site: null },
      waiting: { untilWeek: null, reason: expect.stringMatching(/revalidated for greenlight.*advance the week/i) },
    })
    expect(waiting.whyItMatters).toMatch(/not greenlit yet.*No production identity/i)

    const otherTarget = contended.readyProjectIds.find(
      (projectId) => projectId !== contended.targetProjectId,
    )!
    const otherQueued = applyActions(contended.state, [
      {
        kind: 'startCastingSession',
        session: freeSlate(contended.state, otherTarget),
      },
    ])
    const unaffected = firstFilmJourney(otherQueued)
    expect(unaffected).toMatchObject({
      scriptProjectId: contended.targetProjectId,
      beat: 'auditions-reviewed',
      waiting: null,
      next: { kind: 'open-package', site: 'casting' },
    })
  })

  it('routes a blocked fresh/no-picture journey without promising a commission', () => {
    const founding = beginFounding(generateWorld('journey-founding'))
    const view = firstFilmJourney(founding)
    expect(view).toMatchObject({
      stage: 'no-picture',
      scriptProjectId: null,
      pictureTitle: null,
      ordinal: 1,
    })
    expect(view.next).toEqual({
      kind: 'commission',
      label: 'Review the screenplay blocker at Development',
      site: 'development',
    })
    expect(view.next?.label).not.toContain('Commission a screenplay')
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
    expect(firstFilmJourney(state).headline).toBe('SCREENPLAY ACCEPTED')
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
