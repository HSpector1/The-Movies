import { afterEach, describe, expect, it, vi } from 'vitest'
import * as adapter from '../../engine/adapter.ts'
import {
  acknowledgeCastingSessionAction,
  advanceWeek,
  castingSessionsBoard,
  commissionScriptAction,
  foundManagedStudioAction,
  foundingApplicantCards,
  newGame,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  startCastingSessionAction,
} from '../../engine/adapter.ts'
import type {
  CommissionScriptPayload,
  CreativeRole,
  GameState,
  StartCastingSessionPayload,
} from '../../engine/adapter.ts'
import {
  acceptedLotCastingReviewSuccess,
  currentLotCastingReviewContext,
  sameLotCastingReviewAction,
  sameLotCastingReviewContext,
} from './castingReview.ts'
import type {
  LotCastingReviewAction,
  LotCastingReviewContext,
} from './castingReview.ts'

const FOUNDING_COUNTS: Record<CreativeRole, number> = {
  actor: 3,
  director: 1,
  writer: 1,
  craft: 1,
}

const SHAPE = {
  opening: 'slowSetup',
  midpoint: 'reversal',
  ending: 'bittersweet',
} as const

function clone<T>(value: T): T {
  return structuredClone(value)
}

function managedStudio(seed: string, writerCount = FOUNDING_COUNTS.writer): GameState {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const count = role === 'writer' ? writerCount : FOUNDING_COUNTS[role]
    for (const card of cards
      .filter((candidate) => candidate.profile.role === role)
      .slice(0, count)) {
      const signed = signContractAction(state, card.profile.id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(founded.error)
  return founded.next
}

function commissionPayload(state: GameState): CommissionScriptPayload {
  const board = scriptProjectsBoard(state)
  const concept = board.commission.concepts[0]
  const writer = board.commission.writers.find(
    (candidate) => candidate.available && candidate.primaryRole === 'writer',
  ) ?? board.commission.writers.find((candidate) => candidate.available)
  if (concept === undefined || writer === undefined) {
    throw new Error('setup: no legal screenplay commission')
  }
  return {
    conceptId: concept.id,
    writerId: writer.id,
    shape: SHAPE,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.65, 0.15],
        tonalWeight: [-0.65, 0.15],
        kineticEnergy: [-0.65, 0.15],
      },
    },
  }
}

function acceptEveryScriptReview(state: GameState): GameState {
  let next = state
  while (true) {
    const card = scriptProjectsBoard(next).sections.needsReview[0]
    if (card === undefined) return next
    const accept = card.legalActions.find((action) => action.kind === 'acceptScript')
    if (accept === undefined) throw new Error('setup: screenplay cannot be accepted')
    const accepted = runScriptProjectAction(next, accept)
    if (!accepted.ok) throw new Error(accepted.error)
    next = accepted.next
  }
}

function readyStudio(seed: string, writerCount = FOUNDING_COUNTS.writer): GameState {
  const managed = managedStudio(seed, writerCount)
  const commissioned = commissionScriptAction(managed, commissionPayload(managed))
  if (!commissioned.ok) throw new Error(commissioned.error)
  return acceptEveryScriptReview(advanceWeek(commissioned.next).next)
}

function slateFor(state: GameState, projectId?: string): StartCastingSessionPayload {
  const project = castingSessionsBoard(state).sections.readyToPlan.find(
    (candidate) => projectId === undefined || candidate.projectId === projectId,
  )
  if (project === undefined) throw new Error('setup: no Ready project for auditions')
  const ids = project.candidates.lead.map((candidate) => candidate.id)
  if (ids.length < 3) throw new Error('setup: fewer than three audition candidates')
  return {
    projectId: project.projectId,
    slate: {
      lead: [ids[0]!, ids[1]!],
      antagonist: [ids[0]!, ids[1]!],
      support: [ids[0]!, ids[2]!],
    },
  }
}

function reviewStudio(seed: string, writerCount = FOUNDING_COUNTS.writer): GameState {
  const ready = readyStudio(seed, writerCount)
  const started = startCastingSessionAction(ready, slateFor(ready))
  if (!started.ok) throw new Error(started.error)
  return advanceWeek(started.next).next
}

function capacityOnlyReviewStudio(seed: string): GameState {
  let state = reviewStudio(seed, 3)
  const targetWriterId = castingSessionsBoard(state).sections.needsReview[0]!.writer.id
  const otherWriterIds = state.contracts
    .map((contract) => state.talent.find((talent) => talent.id === contract.talentId))
    .filter((talent) => talent?.role === 'writer' && talent.id !== targetWriterId)
    .map((talent) => talent!.id)
  if (otherWriterIds.length !== 2) throw new Error('setup: expected two unassigned writers')
  for (let index = 0; index < 2; index += 1) {
    const commissioned = commissionScriptAction(state, {
      ...commissionPayload(state),
      writerId: otherWriterIds[index]!,
    })
    if (!commissioned.ok) throw new Error(commissioned.error)
    state = commissioned.next
  }
  return state
}

// P04A.3 (Owner ruling) — a lapsed WRITER contract no longer blocks a Ready
// package (a completed screenplay's credit is not new labour), so this fixture
// can no longer reach a blocked package by dropping the writer's contract.
// Dropping a SEAT's studio contract doesn't reliably reach `package-staffing`
// either: `packageAvailability` counts every talent WORLD-WIDE (contracted or
// freelancer-market), so one dropped contract is routinely covered by an
// unrelated freelancer. The deterministic way in — already used for the same
// blocker elsewhere in this suite (`tests/script-read-model.test.ts`,
// "blocks a Ready package before Assembly when its locked writer consumes a
// required role pool") — is to remove the required role from the WORLD
// entirely: reassign every Director-role talent to Actor, so the studio has
// zero available Directors anywhere, contracted or freelance.
function blockedReviewStudio(seed: string): GameState {
  const state = reviewStudio(seed)
  return {
    ...state,
    talent: state.talent.map((talent) =>
      talent.role === 'director' ? { ...talent, role: 'actor' } : talent,
    ),
  }
}

function twoReviewStudio(seed: string): GameState {
  let state = managedStudio(seed, 2)
  const first = commissionScriptAction(state, commissionPayload(state))
  if (!first.ok) throw new Error(first.error)
  state = first.next
  const second = commissionScriptAction(state, commissionPayload(state))
  if (!second.ok) throw new Error(second.error)
  state = acceptEveryScriptReview(advanceWeek(second.next).next)
  const ready = castingSessionsBoard(state).sections.readyToPlan
  if (ready.length !== 2) throw new Error('setup: expected two Ready projects')
  const laterProjectFirst = startCastingSessionAction(state, slateFor(state, ready[1]!.projectId))
  if (!laterProjectFirst.ok) throw new Error(laterProjectFirst.error)
  const earlierProjectSecond = startCastingSessionAction(
    laterProjectFirst.next,
    slateFor(laterProjectFirst.next, ready[0]!.projectId),
  )
  if (!earlierProjectSecond.ok) throw new Error(earlierProjectSecond.error)
  return advanceWeek(earlierProjectSecond.next).next
}

function boardFor(state: GameState) {
  return clone(castingSessionsBoard(state))
}

function mockBoard(board: ReturnType<typeof castingSessionsBoard>): void {
  vi.spyOn(adapter, 'castingSessionsBoard').mockReturnValue(board)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('strict Lot casting review context', () => {
  it('copies all six persisted rows in canonical role order with exact current evidence and sole clear action', () => {
    const state = reviewStudio('lot-casting-review-clear')
    const before = JSON.stringify(state)
    const card = castingSessionsBoard(state).sections.needsReview[0]!
    const context = currentLotCastingReviewContext(state)

    expect(context).not.toBeNull()
    expect(context).toMatchObject({
      kind: 'casting-review',
      sessionId: card.sessionId,
      projectId: card.projectId,
      title: card.title,
      genre: card.genre,
      writer: card.writer,
      consequence: card.consequence,
      packageAvailability: card.packageAvailability,
      blockers: [],
      action: {
        kind: 'acknowledgeCastingSession',
        label: 'Take results to Package',
        opensPackage: true,
      },
    })

    const contradictory = boardFor(state)
    const action = contradictory.sections.needsReview[0]!.legalActions[0]
    if (action?.kind !== 'acknowledgeCastingSession') {
      throw new Error('setup: expected the capacity-only acknowledgement')
    }
    action.label = 'Finish casting review'
    action.opensPackage = false
    mockBoard(contradictory)
    expect(currentLotCastingReviewContext(state)).toBeNull()
    expect(context?.roles.map(({ slot, label }) => [slot, label])).toEqual([
      ['lead', 'Lead'],
      ['antagonist', 'Antagonist'],
      ['support', 'Support'],
    ])
    expect(context?.roles.flatMap((role) => role.evidence)).toHaveLength(6)
    for (const role of context!.roles) {
      expect(role.evidence).toEqual(card.results![role.slot])
      expect(role.evidence).not.toBe(card.results![role.slot])
      expect(role.evidence[0]!.label).toBe('Est.')
      expect(role.evidence[0]!.fit.label).toBe('Fit')
    }
    expect(JSON.stringify(state)).toBe(before)
  })

  it('retains detailed blocked-package truth and the exact Finish action', () => {
    const state = blockedReviewStudio('lot-casting-review-blocked')
    const card = castingSessionsBoard(state).sections.needsReview[0]!
    const context = currentLotCastingReviewContext(state)

    expect(context?.action).toMatchObject({
      kind: 'acknowledgeCastingSession',
      label: 'Finish casting review',
      opensPackage: false,
    })
    expect(context?.packageAvailability.knownGatesClear).toBe(false)
    expect(context?.packageAvailability.blockers).toEqual(card.packageAvailability?.blockers)
    // P04A.3 — `blockedReviewStudio` no longer reaches this state via a lapsed
    // writer contract (a package no longer gates on it); it now removes the
    // world's only Director role entirely, so the block is `package-staffing`.
    expect(context?.packageAvailability.blockers).toEqual([
      expect.objectContaining({
        kind: 'package-staffing',
        headline: expect.any(String),
        detail: expect.any(String),
        remedy: expect.any(String),
      }),
    ])
    expect(context?.blockers).toEqual(
      context?.packageAvailability.blockers.map((blocker) => blocker.headline),
    )
  })

  it('offers the exact Package handoff when capacity alone will queue the greenlight', () => {
    const state = capacityOnlyReviewStudio('lot-casting-review-capacity-handoff')
    const card = castingSessionsBoard(state).sections.needsReview[0]!
    const context = currentLotCastingReviewContext(state)

    expect(scriptProjectsBoard(state).capacity.available).toBe(0)
    expect(adapter.studioDecision(state)).toMatchObject({
      kind: 'castingReview',
      decision: {
        sessionId: card.sessionId,
        projectId: card.projectId,
        title: card.title,
      },
    })
    expect(card).toMatchObject({
      packageAvailability: {
        knownGatesClear: false,
        canSubmitGreenlightIntent: true,
        willQueueGreenlightIntent: true,
        blockers: [expect.objectContaining({ kind: 'facility-capacity' })],
      },
      blockers: ['Development & Casting is full'],
      legalActions: [
        {
          kind: 'acknowledgeCastingSession',
          sessionId: card.sessionId,
          projectId: card.projectId,
          label: 'Take results to Package',
          opensPackage: true,
        },
      ],
    })
    expect(context).not.toBeNull()
    expect(context).toMatchObject({
      sessionId: card.sessionId,
      projectId: card.projectId,
      title: card.title,
      packageAvailability: {
        knownGatesClear: false,
        canSubmitGreenlightIntent: true,
        willQueueGreenlightIntent: true,
        blockers: [expect.objectContaining({ kind: 'facility-capacity' })],
      },
      blockers: ['Development & Casting is full'],
      action: {
        kind: 'acknowledgeCastingSession',
        sessionId: card.sessionId,
        projectId: card.projectId,
        label: 'Take results to Package',
        opensPackage: true,
      },
    })
  })

  it('keeps a current review valid when another completed package has a queued greenlight', () => {
    const state = reviewStudio('lot-casting-review-queued-history')
    const board = boardFor(state)
    const history = clone(board.sections.needsReview[0]!)
    history.projectId = 'script-history-queued'
    history.sessionId = 'casting-history-queued'
    history.status = 'complete'
    history.legalActions = []
    history.blockers = ['Greenlight already queued']
    history.packageAvailability = {
      ...history.packageAvailability!,
      knownGatesClear: false,
      canSubmitGreenlightIntent: false,
      willQueueGreenlightIntent: false,
      blockers: [
        {
          kind: 'greenlight-queued',
          headline: 'Greenlight already queued',
          detail: 'This exact screenplay package already has a greenlight intent waiting.',
          remedy: 'Advance the week or cancel the queued intent.',
        },
      ],
    }
    board.sections.history.push(history)
    mockBoard(board)

    expect(currentLotCastingReviewContext(state)).toMatchObject({
      kind: 'casting-review',
      sessionId: board.sections.needsReview[0]!.sessionId,
      projectId: board.sections.needsReview[0]!.projectId,
    })
  })

  it('requires an exact closed session/project/title target', () => {
    const state = reviewStudio('lot-casting-review-target')
    const exact = currentLotCastingReviewContext(state)!

    expect(currentLotCastingReviewContext(state, {
      sessionId: exact.sessionId,
      projectId: exact.projectId,
      title: exact.title,
    })).toEqual(exact)
    expect(currentLotCastingReviewContext(state, {
      sessionId: `${exact.sessionId}-stale`,
      projectId: exact.projectId,
      title: exact.title,
    })).toBeNull()
    expect(currentLotCastingReviewContext(state, {
      sessionId: exact.sessionId,
      projectId: `${exact.projectId}-stale`,
      title: exact.title,
    })).toBeNull()
    expect(currentLotCastingReviewContext(
      state,
      { sessionId: exact.sessionId, projectId: exact.projectId, title: exact.title, extra: true } as never,
    )).toBeNull()
    const symbol = { sessionId: exact.sessionId, projectId: exact.projectId, title: exact.title }
    Object.defineProperty(symbol, Symbol('hostile'), { value: true })
    expect(currentLotCastingReviewContext(state, symbol)).toBeNull()
  })

  it('uses canonical session order, permits the same title on another project, and rejects reversal', () => {
    const state = twoReviewStudio('lot-casting-review-order')
    const board = boardFor(state)
    expect(board.sections.needsReview.map((card) => [card.sessionId, card.projectId])).toEqual([
      ['casting-0000', 'script-0001'],
      ['casting-0001', 'script-0000'],
    ])
    expect(currentLotCastingReviewContext(state)).toMatchObject({
      sessionId: 'casting-0000',
      projectId: 'script-0001',
    })

    board.sections.needsReview[1]!.title = board.sections.needsReview[0]!.title
    mockBoard(board)
    expect(currentLotCastingReviewContext(state)).toMatchObject({
      sessionId: 'casting-0000',
      projectId: 'script-0001',
    })
    vi.restoreAllMocks()

    const reversed = boardFor(state)
    reversed.sections.needsReview.reverse()
    mockBoard(reversed)
    expect(currentLotCastingReviewContext(state)).toBeNull()
  })

  it('rejects duplicate identities, candidate/result drift, duplicate role talent, and a two-person slate', () => {
    const state = reviewStudio('lot-casting-review-identity')
    const mutations: Array<(board: ReturnType<typeof castingSessionsBoard>) => void> = [
      (board) => board.sections.history.push(clone(board.sections.needsReview[0]!) as never),
      (board) => { board.sections.needsReview[0]!.results!.lead[0]!.name += ' stale' },
      (board) => {
        board.sections.needsReview[0]!.results!.lead[1] = clone(
          board.sections.needsReview[0]!.results!.lead[0]!,
        )
        board.sections.needsReview[0]!.candidates.lead[1] = clone(
          board.sections.needsReview[0]!.candidates.lead[0]!,
        )
      },
      (board) => {
        const card = board.sections.needsReview[0]!
        card.results!.support[1] = clone(card.results!.lead[1]!)
        card.candidates.support[1] = clone(card.candidates.lead[1]!)
      },
    ]
    for (const mutate of mutations) {
      const board = boardFor(state)
      mutate(board)
      mockBoard(board)
      expect(currentLotCastingReviewContext(state)).toBeNull()
      vi.restoreAllMocks()
    }
  })

  it('rejects extra/symbol authority keys and sparse or decorated collections', () => {
    const state = reviewStudio('lot-casting-review-closed-shapes')
    const mutations: Array<(board: ReturnType<typeof castingSessionsBoard>) => void> = [
      (board) => Object.assign(board, { hidden: true }),
      (board) => Object.defineProperty(board.sections, Symbol('hostile'), { value: true }),
      (board) => Object.assign(board.sections.needsReview[0]!, { actualExecution: 99 }),
      (board) => Object.assign(board.sections.needsReview[0]!.writer, { ceiling: 99 }),
      (board) => Object.assign(board.sections.needsReview[0]!.results!.lead[0]!, { actual: 99 }),
      (board) => Object.defineProperty(
        board.sections.needsReview[0]!.results!.lead[0]!.fit,
        Symbol('hidden'),
        { value: true },
      ),
      (board) => Object.assign(board.sections.needsReview[0]!.legalActions[0]!, { retry: true }),
      (board) => Object.assign(
        board.sections.needsReview[0]!.packageAvailability!,
        { winner: 't-act-hidden' },
      ),
      (board) => Object.assign(
        board.sections.needsReview[0]!.packageAvailability!.blockers[0] ?? (() => {
          board.sections.needsReview[0]!.packageAvailability!.blockers.push({
            kind: 'facility-capacity',
            headline: 'Blocked',
            detail: 'Detail',
            remedy: 'Remedy',
          })
          return board.sections.needsReview[0]!.packageAvailability!.blockers[0]!
        })(),
        { hidden: true },
      ),
      (board) => {
        const sparse = new Array(2)
        sparse[0] = board.sections.needsReview[0]!.results!.lead[0]
        board.sections.needsReview[0]!.results!.lead = sparse as never
      },
      (board) => Object.defineProperty(
        board.sections.needsReview[0]!.results!.lead,
        'owner',
        { value: 'UI' },
      ),
    ]
    for (const mutate of mutations) {
      const board = boardFor(state)
      mutate(board)
      mockBoard(board)
      expect(currentLotCastingReviewContext(state)).toBeNull()
      vi.restoreAllMocks()
    }
  })

  it('rejects malformed ranges, package/action disagreement, blocker summaries, and decision drift', () => {
    const state = blockedReviewStudio('lot-casting-review-malformed')
    const mutations: Array<(board: ReturnType<typeof castingSessionsBoard>) => void> = [
      (board) => { board.sections.needsReview[0]!.results!.lead[0]!.low += 1 },
      (board) => { board.sections.needsReview[0]!.results!.lead[0]!.label = 'Actual' as never },
      (board) => { board.sections.needsReview[0]!.results!.lead[0]!.fit.score = Number.NaN },
      (board) => { board.sections.needsReview[0]!.packageAvailability!.knownGatesClear = true },
      (board) => { board.sections.needsReview[0]!.packageAvailability!.canSubmitGreenlightIntent = true },
      (board) => { board.sections.needsReview[0]!.packageAvailability!.willQueueGreenlightIntent = true },
      (board) => {
        const action = board.sections.needsReview[0]!.legalActions[0]
        if (action?.kind === 'acknowledgeCastingSession') action.opensPackage = true
      },
      (board) => { board.sections.needsReview[0]!.blockers = ['Substituted blocker'] },
      (board) => { board.nextDecision!.title += ' stale' },
      (board) => { board.sections.needsReview[0]!.dueWeek = 4 },
    ]
    for (const mutate of mutations) {
      const board = boardFor(state)
      mutate(board)
      mockBoard(board)
      expect(currentLotCastingReviewContext(state)).toBeNull()
      vi.restoreAllMocks()
    }
  })

  it('rejects a nominally clear package when any authoritative availability gate is false', () => {
    const state = reviewStudio('lot-casting-review-contradictory-clear')
    const gates = [
      'writerAvailable',
      'staffingAvailable',
      'productionSlotAvailable',
      'developmentCastingSlotAvailable',
    ] as const
    for (const gate of gates) {
      const board = boardFor(state)
      const availability = board.sections.needsReview[0]!.packageAvailability!
      expect(availability.knownGatesClear).toBe(true)
      expect(availability.blockers).toHaveLength(0)
      availability[gate] = false
      mockBoard(board)
      expect(currentLotCastingReviewContext(state)).toBeNull()
      vi.restoreAllMocks()
    }
  })

  it('requires every blocked availability boolean to agree with its exact blocker kind', () => {
    const state = blockedReviewStudio('lot-casting-review-blocker-gate-coherence')
    // P04A.3 — `blockedReviewStudio` now blocks via `package-staffing` (a lapsed
    // writer contract no longer blocks a package at all: see the fixture's own
    // comment). So the baseline here is `writerAvailable: true`, `staffingAvailable:
    // false`, one `package-staffing` blocker — the mirror image of the old
    // writer-contract baseline. `staffingAvailable` now plays the role
    // `writerAvailable` used to play, and vice versa.
    const mutations: Array<(board: ReturnType<typeof castingSessionsBoard>) => void> = [
      (board) => { board.sections.needsReview[0]!.packageAvailability!.staffingAvailable = true },
      (board) => {
        board.sections.needsReview[0]!.packageAvailability!.blockers[0]!.kind = 'studio-founding'
      },
      (board) => { board.sections.needsReview[0]!.packageAvailability!.writerAvailable = false },
      (board) => {
        const availability = board.sections.needsReview[0]!.packageAvailability!
        availability.staffingAvailable = true
        availability.blockers[0]!.kind = 'writer-contract'
      },
      (board) => {
        board.sections.needsReview[0]!.packageAvailability!.productionSlotAvailable = false
      },
      // C2a-M4 (§11.8 re-base, named successor): the retired
      // `'production-capacity'` mutation is replaced by the one that proves the
      // SUCCESSOR semantic — the two capacity booleans are one physical fact and
      // may never disagree with each other.
      (board) => {
        const availability = board.sections.needsReview[0]!.packageAvailability!
        availability.productionSlotAvailable = false
        availability.developmentCastingSlotAvailable = true
      },
      (board) => {
        board.sections.needsReview[0]!.packageAvailability!
          .developmentCastingSlotAvailable = false
      },
      (board) => {
        const availability = board.sections.needsReview[0]!.packageAvailability!
        availability.staffingAvailable = true
        availability.blockers[0]!.kind = 'facility-capacity'
      },
    ]
    for (const mutate of mutations) {
      const board = boardFor(state)
      mutate(board)
      mockBoard(board)
      expect(currentLotCastingReviewContext(state)).toBeNull()
      vi.restoreAllMocks()
    }
  })

  it('fails neutral outside current managed casting truth and when adapters throw', () => {
    const state = reviewStudio('lot-casting-review-neutral')
    expect(currentLotCastingReviewContext({
      ...state,
      castingSessions: { mode: 'legacy', sessions: [] },
    })).toBeNull()

    vi.spyOn(adapter, 'studioDecision').mockReturnValue(null)
    expect(currentLotCastingReviewContext(state)).toBeNull()
    vi.restoreAllMocks()

    vi.spyOn(adapter, 'castingSessionsBoard').mockImplementation(() => {
      throw new Error('hostile board')
    })
    expect(currentLotCastingReviewContext(state)).toBeNull()
    vi.restoreAllMocks()

    vi.spyOn(adapter, 'studioDecision').mockImplementation(() => {
      throw new Error('hostile decision')
    })
    expect(currentLotCastingReviewContext(state)).toBeNull()
  })
})

describe('Lot casting review closed comparators and successor proof', () => {
  it('compares every action/context field and rejects malformed values against themselves', () => {
    const context = currentLotCastingReviewContext(
      reviewStudio('lot-casting-review-comparison'),
    )!
    expect(sameLotCastingReviewAction(context.action, clone(context.action))).toBe(true)
    expect(sameLotCastingReviewContext(context, clone(context))).toBe(true)

    const changedAction = clone(context.action)
    changedAction.opensPackage = !changedAction.opensPackage
    expect(sameLotCastingReviewAction(context.action, changedAction)).toBe(false)

    const malformedAction = clone(context.action) as LotCastingReviewAction & { extra?: true }
    malformedAction.extra = true
    expect(sameLotCastingReviewAction(malformedAction, malformedAction)).toBe(false)

    const changedContext = clone(context)
    changedContext.roles[2].evidence[1].availabilityLabel += ' stale'
    expect(sameLotCastingReviewContext(context, changedContext)).toBe(false)

    const malformedContext = clone(context) as LotCastingReviewContext & { actual?: number }
    malformedContext.actual = 99
    expect(sameLotCastingReviewContext(malformedContext, malformedContext)).toBe(false)
  })

  it('proves the clear review-to-complete successor and exact Package action', () => {
    const before = reviewStudio('lot-casting-review-clear-success')
    const context = currentLotCastingReviewContext(before)!
    const result = acknowledgeCastingSessionAction(before, context.sessionId)
    if (!result.ok) throw new Error(result.error)

    const success = acceptedLotCastingReviewSuccess(
      context,
      context.action,
      before,
      result.next,
    )
    expect(success).toEqual({
      kind: 'clear',
      sessionId: context.sessionId,
      projectId: context.projectId,
      title: context.title,
      writerName: context.writer.name,
      statusLabel: 'Casting review complete',
      blockers: [],
      openPackageAction: {
        kind: 'openPackage',
        projectId: context.projectId,
        label: 'Open package',
      },
    })
    expect(result.next.market.tick).toBe(before.market.tick)
    expect(result.next.studio.cash).toBe(before.studio.cash)
    expect(result.next.rngState).toBe(before.rngState)
    expect(result.next.ledger).toEqual(before.ledger)
    expect(result.next.castingSessions.sessions[0]!.results).toEqual(
      before.castingSessions.sessions[0]!.results,
    )
  })

  it('proves a capacity-only review successor can open the exact queueable Package', () => {
    const before = capacityOnlyReviewStudio('lot-casting-review-capacity-success')
    const context = currentLotCastingReviewContext(before)!
    const result = acknowledgeCastingSessionAction(before, context.sessionId)
    if (!result.ok) throw new Error(result.error)

    const success = acceptedLotCastingReviewSuccess(
      context,
      context.action,
      before,
      result.next,
    )
    expect(success).toEqual({
      kind: 'clear',
      sessionId: context.sessionId,
      projectId: context.projectId,
      title: context.title,
      writerName: context.writer.name,
      statusLabel: 'Casting review complete',
      blockers: context.packageAvailability.blockers,
      openPackageAction: {
        kind: 'openPackage',
        projectId: context.projectId,
        label: 'Open package',
      },
    })
  })

  it('proves the blocked same-Lot successor with exact persistent blockers', () => {
    const before = blockedReviewStudio('lot-casting-review-blocked-success')
    const context = currentLotCastingReviewContext(before)!
    const result = acknowledgeCastingSessionAction(before, context.sessionId)
    if (!result.ok) throw new Error(result.error)

    const success = acceptedLotCastingReviewSuccess(
      context,
      context.action,
      before,
      result.next,
    )
    expect(success).toMatchObject({
      kind: 'blocked',
      sessionId: context.sessionId,
      projectId: context.projectId,
      statusLabel: 'Casting review complete',
      blockers: context.packageAvailability.blockers,
      openPackageAction: null,
    })
    expect(result.next.castingSessions.sessions[0]).toEqual({
      ...before.castingSessions.sessions[0]!,
      status: 'complete',
    })
  })

  it('rejects stale actions and any successor change beyond the one status field', () => {
    const before = reviewStudio('lot-casting-review-success-hostile')
    const context = currentLotCastingReviewContext(before)!
    const result = acknowledgeCastingSessionAction(before, context.sessionId)
    if (!result.ok) throw new Error(result.error)

    const staleAction = clone(context.action)
    staleAction.sessionId += '-stale'
    expect(acceptedLotCastingReviewSuccess(context, staleAction, before, result.next)).toBeNull()
    const wrongProjectAction = clone(context.action)
    wrongProjectAction.projectId += '-stale'
    expect(
      acceptedLotCastingReviewSuccess(context, wrongProjectAction, before, result.next),
    ).toBeNull()
    expect(acceptedLotCastingReviewSuccess(context, context.action, before, {
      ...result.next,
      studio: { ...result.next.studio, cash: result.next.studio.cash + 1 },
    })).toBeNull()
    expect(acceptedLotCastingReviewSuccess(context, context.action, before, {
      ...result.next,
      castingSessions: {
        ...result.next.castingSessions,
        sessions: result.next.castingSessions.sessions.map((session) =>
          session.id === context.sessionId
            ? {
                ...session,
                results: {
                  ...session.results!,
                  lead: [
                    { ...session.results!.lead[0], estimate: session.results!.lead[0].estimate + 1 },
                    session.results!.lead[1],
                  ],
                },
              }
            : session,
        ),
      },
    })).toBeNull()
  })
})
