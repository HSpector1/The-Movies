import { afterEach, describe, expect, it, vi } from 'vitest'
import * as adapter from '../../engine/adapter.ts'
import {
  advanceWeek,
  commissionScriptAction,
  foundManagedStudioAction,
  foundingApplicantCards,
  newGame,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
} from '../../engine/adapter.ts'
import type {
  CommissionScriptPayload,
  CreativeRole,
  GameState,
  ScriptProjectsReadModel,
} from '../../engine/adapter.ts'
import {
  commissionOriginalScreenplayAction,
  renameScreenplayAction,
} from '../../engine/screenplay.ts'
import {
  acceptedLotScriptReviewSuccess,
  currentLotScriptReviewContext,
  sameLotScriptReviewAction,
  sameLotScriptReviewContext,
} from './scriptReview.ts'
import type {
  LotScriptReviewAction,
  LotScriptReviewContext,
} from './scriptReview.ts'

const FOUNDING_COUNTS: Record<CreativeRole, number> = {
  actor: 3,
  director: 1,
  writer: 1,
  craft: 1,
}

const SHAPE = {
  opening: 'immediateAction',
  midpoint: 'revelation',
  ending: 'bittersweet',
} as const

function managedStudio(seed: string): GameState {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const card of cards
      .filter((candidate) => candidate.profile.role === role)
      .slice(0, FOUNDING_COUNTS[role])) {
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
  const concept = board.commission.concepts[0]!
  const writer = board.commission.writers.find(
    (candidate) => candidate.available && candidate.primaryRole === 'writer',
  )!
  return {
    conceptId: concept.id,
    writerId: writer.id,
    shape: SHAPE,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.4, 0.4],
        tonalWeight: [-0.4, 0.4],
        kineticEnergy: [-0.4, 0.4],
      },
    },
  }
}

function firstReviewState(seed = 'lot-script-review-first'): GameState {
  const managed = managedStudio(seed)
  const commissioned = commissionScriptAction(managed, commissionPayload(managed))
  if (!commissioned.ok) throw new Error(commissioned.error)
  return advanceWeek(commissioned.next).next
}

function finalReviewState(seed = 'lot-script-review-final'): GameState {
  const first = firstReviewState(seed)
  const rewrite = scriptProjectsBoard(first).sections.needsReview[0]!.legalActions.find(
    (action) => action.kind === 'requestScriptRewrite',
  )
  if (rewrite === undefined) throw new Error('setup: final rewrite is unavailable')
  const requested = runScriptProjectAction(first, rewrite)
  if (!requested.ok) throw new Error(requested.error)
  return advanceWeek(requested.next).next
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function boardFor(state: GameState): ScriptProjectsReadModel {
  return clone(scriptProjectsBoard(state))
}

function selectedCard(board: ScriptProjectsReadModel) {
  return board.sections.needsReview[0]!
}

function mockBoard(board: ScriptProjectsReadModel): void {
  vi.spyOn(adapter, 'scriptProjectsBoard').mockReturnValue(board)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('current Lot screenplay review context', () => {
  it('copies the exact first-draft card, Est. evidence, writer, consequence, and Core-ordered actions', () => {
    const state = firstReviewState()
    const before = JSON.stringify(state)
    const card = scriptProjectsBoard(state).sections.needsReview[0]!
    const context = currentLotScriptReviewContext(state)

    expect(context).toEqual({
      kind: 'script-review',
      projectId: card.projectId,
      title: card.title,
      writer: card.writer,
      reviewState: 'first-draft',
      assessment: card.assessment,
      consequence: card.consequence,
      blockers: card.blockers,
      legalActions: card.legalActions,
      // C2a-M3 — the context now carries WHERE THE SCREENPLAY CAME FROM (charter
      // §3.5). This fixture commissions a MARKET premise, so the credit is the
      // market line and there is no generated title to keep: the studio bought
      // this story. The original-screenplay arm is pinned in its own case below.
      provenance: {
        origin: 'pool',
        label: 'Acquired from the open script market',
        writerName: null,
        generatedTitle: null,
        renamed: false,
      },
    })
    expect(context?.assessment.label).toBe('Est.')
    expect(context?.legalActions.map((action) => action.kind)).toEqual([
      'acceptScript',
      'requestScriptRewrite',
    ])
    expect(JSON.stringify(state)).toBe(before)
    expect(context?.writer).not.toBe(card.writer)
    expect(context?.assessment).not.toBe(card.assessment)
    expect(context?.assessment.strengths).not.toBe(card.assessment!.strengths)
    expect(context?.legalActions).not.toBe(card.legalActions)
  })

  it('exposes the final-draft review with Accept only and preserves all player-safe assessment arrays', () => {
    const state = finalReviewState()
    const card = scriptProjectsBoard(state).sections.needsReview[0]!
    const context = currentLotScriptReviewContext(state)

    expect(context).not.toBeNull()
    expect(context?.reviewState).toBe('final-draft')
    expect(context?.legalActions).toEqual([
      expect.objectContaining({ kind: 'acceptScript', label: 'Accept final draft' }),
    ])
    expect(context?.assessment).toEqual(card.assessment)
    expect(context?.assessment.strengths).toEqual(card.assessment?.strengths)
    expect(context?.assessment.concerns).toEqual(card.assessment?.concerns)
  })

  it('keeps exact blocker headline, detail, and remedy while withholding an unavailable rewrite', () => {
    const state = firstReviewState('lot-script-review-blocked')
    const project = scriptProjectsBoard(state).sections.needsReview[0]!
    const withoutWriterContract: GameState = {
      ...state,
      contracts: state.contracts.filter(
        (contract) => contract.talentId !== project.writer.id,
      ),
    }
    const card = scriptProjectsBoard(withoutWriterContract).sections.needsReview[0]!
    const context = currentLotScriptReviewContext(withoutWriterContract)

    expect(context?.legalActions.map((action) => action.kind)).toEqual(['acceptScript'])
    expect(context?.blockers).toEqual(card.blockers)
    expect(context?.blockers).toEqual([
      expect.objectContaining({
        kind: 'writer-contract',
        headline: expect.any(String),
        detail: expect.any(String),
        remedy: expect.any(String),
      }),
    ])
  })

  it('requires an optional event target to be a closed exact ID/title pair', () => {
    const state = firstReviewState('lot-script-review-target')
    const exact = currentLotScriptReviewContext(state)!

    expect(currentLotScriptReviewContext(state, {
      projectId: exact.projectId,
      title: exact.title,
    })).toEqual(exact)
    expect(currentLotScriptReviewContext(state, {
      projectId: `${exact.projectId}-stale`,
      title: exact.title,
    })).toBeNull()
    expect(currentLotScriptReviewContext(state, {
      projectId: exact.projectId,
      title: `${exact.title} II`,
    })).toBeNull()
    expect(currentLotScriptReviewContext(
      state,
      { projectId: exact.projectId, title: exact.title, extra: true } as never,
    )).toBeNull()
    const symbolTarget = { projectId: exact.projectId, title: exact.title }
    Object.defineProperty(symbolTarget, Symbol('hostile'), { value: true })
    expect(currentLotScriptReviewContext(state, symbolTarget)).toBeNull()
  })

  it('fails neutrally outside managed/current-script-review truth and when either adapter throws', () => {
    const state = firstReviewState('lot-script-review-neutral')

    const legacy = boardFor(state)
    legacy.mode = 'legacy'
    mockBoard(legacy)
    expect(currentLotScriptReviewContext(state)).toBeNull()
    vi.restoreAllMocks()

    vi.spyOn(adapter, 'studioDecision').mockReturnValue(null)
    expect(currentLotScriptReviewContext(state)).toBeNull()
    vi.restoreAllMocks()

    vi.spyOn(adapter, 'scriptProjectsBoard').mockImplementation(() => {
      throw new Error('hostile projection')
    })
    expect(currentLotScriptReviewContext(state)).toBeNull()
    vi.restoreAllMocks()

    vi.spyOn(adapter, 'studioDecision').mockImplementation(() => {
      throw new Error('hostile decision')
    })
    expect(currentLotScriptReviewContext(state)).toBeNull()
  })

  it('rejects card/decision disagreement instead of first-, last-, or title-matching', () => {
    const state = firstReviewState('lot-script-review-disagreement')
    const board = boardFor(state)
    selectedCard(board).title = `${selectedCard(board).title} (stale)`
    mockBoard(board)
    expect(currentLotScriptReviewContext(state)).toBeNull()
    vi.restoreAllMocks()

    const wrongDecision = clone(adapter.studioDecision(state))!
    if (wrongDecision.kind !== 'scriptReview') throw new Error('setup: expected script review')
    wrongDecision.decision.title = `${wrongDecision.decision.title} (replaced)`
    vi.spyOn(adapter, 'studioDecision').mockReturnValue(wrongDecision)
    expect(currentLotScriptReviewContext(state)).toBeNull()
  })

  it('rejects reversed or duplicate action arrays and decision/card action disagreement', () => {
    const state = firstReviewState('lot-script-review-action-order')
    const reversed = boardFor(state)
    selectedCard(reversed).legalActions.reverse()
    mockBoard(reversed)
    expect(currentLotScriptReviewContext(state)).toBeNull()
    vi.restoreAllMocks()

    const duplicated = boardFor(state)
    const accept = clone(selectedCard(duplicated).legalActions[0]!)
    if (accept.kind !== 'acceptScript') throw new Error('setup: expected Accept first')
    selectedCard(duplicated).legalActions = [accept, clone(accept)]
    duplicated.nextDecision!.legalActions = [clone(accept), clone(accept)]
    mockBoard(duplicated)
    expect(currentLotScriptReviewContext(state)).toBeNull()
    vi.restoreAllMocks()

    const disagreement = boardFor(state)
    disagreement.nextDecision!.legalActions = [
      clone(disagreement.nextDecision!.legalActions[0]!),
    ]
    mockBoard(disagreement)
    expect(currentLotScriptReviewContext(state)).toBeNull()
  })

  it('rejects duplicate project identity across sections but permits a same-title different project', () => {
    const state = firstReviewState('lot-script-review-identity')
    const duplicated = boardFor(state)
    const duplicate = clone(selectedCard(duplicated))
    duplicate.section = 'productionHistory'
    duplicate.status = 'produced'
    duplicate.lifecycleLabel = 'Produced'
    duplicate.productionId = 'production-duplicate'
    duplicate.legalActions = []
    duplicated.sections.productionHistory.push(duplicate)
    mockBoard(duplicated)
    expect(currentLotScriptReviewContext(state)).toBeNull()
    vi.restoreAllMocks()

    const sameTitle = boardFor(state)
    const distinct = clone(selectedCard(sameTitle))
    distinct.projectId = `${distinct.projectId}-distinct`
    distinct.section = 'productionHistory'
    distinct.status = 'produced'
    distinct.lifecycleLabel = 'Produced'
    distinct.productionId = 'production-distinct'
    distinct.legalActions = []
    sameTitle.sections.productionHistory.push(distinct)
    mockBoard(sameTitle)
    expect(currentLotScriptReviewContext(state)?.projectId).toBe(
      selectedCard(sameTitle).projectId,
    )
  })

  it('rejects extra and symbol own keys at every consumed authority-bearing level', () => {
    const state = firstReviewState('lot-script-review-keys')
    const mutations: Array<(board: ScriptProjectsReadModel) => void> = [
      (board) => Object.assign(board, { extra: true }),
      (board) => Object.defineProperty(board, Symbol('hostile'), { value: true }),
      (board) => Object.assign(board.sections, { extra: [] }),
      (board) => Object.defineProperty(board.sections, Symbol('hostile'), { value: true }),
      (board) => Object.assign(selectedCard(board), { extra: true }),
      (board) => Object.defineProperty(selectedCard(board), Symbol('hostile'), { value: true }),
      (board) => Object.assign(selectedCard(board).writer, { actualSkill: 99 }),
      (board) => Object.defineProperty(selectedCard(board).assessment!, Symbol('actual'), { value: 99 }),
      (board) => Object.assign(selectedCard(board).legalActions[0]!, { retry: true }),
      (board) => Object.assign(selectedCard(board).blockers[0] ?? (() => {
        selectedCard(board).blockers.push({
          kind: 'facility-capacity',
          headline: 'Blocked',
          detail: 'Detail',
          remedy: 'Remedy',
        })
        return selectedCard(board).blockers[0]!
      })(), { hidden: true }),
      (board) => Object.assign(board.nextDecision!, { retry: true }),
    ]

    for (const mutate of mutations) {
      const board = boardFor(state)
      mutate(board)
      mockBoard(board)
      expect(currentLotScriptReviewContext(state)).toBeNull()
      vi.restoreAllMocks()
    }

    const decision = clone(adapter.studioDecision(state))! as unknown as Record<PropertyKey, unknown>
    Object.defineProperty(decision, Symbol('hostile'), { value: true })
    vi.spyOn(adapter, 'studioDecision').mockReturnValue(decision as never)
    expect(currentLotScriptReviewContext(state)).toBeNull()
  })

  it('rejects sparse, decorated, and non-array collections rather than repairing them', () => {
    const state = firstReviewState('lot-script-review-arrays')
    const mutations: Array<(board: ScriptProjectsReadModel) => void> = [
      (board) => {
        const sparse = new Array(2)
        sparse[0] = selectedCard(board)
        board.sections.needsReview = sparse
      },
      (board) => Object.defineProperty(board.sections.needsReview, '01', { value: selectedCard(board) }),
      (board) => Object.defineProperty(selectedCard(board).assessment!.strengths, Symbol('hostile'), { value: true }),
      (board) => {
        const sparse = new Array(2)
        sparse[0] = selectedCard(board).assessment!.concerns[0]
        selectedCard(board).assessment!.concerns = sparse
      },
      (board) => Object.defineProperty(selectedCard(board).legalActions, 'owner', { value: 'UI' }),
      (board) => {
        ;(board.sections as unknown) = new Map([['needsReview', board.sections.needsReview]])
      },
    ]

    for (const mutate of mutations) {
      const board = boardFor(state)
      mutate(board)
      mockBoard(board)
      expect(currentLotScriptReviewContext(state)).toBeNull()
      vi.restoreAllMocks()
    }
  })

  it('rejects malformed assessment, optional fields, and blocker records', () => {
    const state = firstReviewState('lot-script-review-malformed')
    const mutations: Array<(board: ScriptProjectsReadModel) => void> = [
      (board) => { selectedCard(board).dueWeek = 1 },
      (board) => { selectedCard(board).weeksUntilDecision = 0 },
      (board) => { selectedCard(board).productionId = '' },
      (board) => { selectedCard(board).assessment!.label = 'Actual' as 'Est.' },
      (board) => { selectedCard(board).assessment!.score = Number.NaN },
      (board) => { selectedCard(board).assessment!.band = 'Certain' as 'Strong' },
      (board) => { selectedCard(board).assessment!.strengths = [''] },
      (board) => {
        selectedCard(board).blockers = [{
          kind: 'facility-capacity',
          headline: '',
          detail: 'Detail',
          remedy: 'Remedy',
        }]
      },
    ]

    for (const mutate of mutations) {
      const board = boardFor(state)
      mutate(board)
      mockBoard(board)
      expect(currentLotScriptReviewContext(state)).toBeNull()
      vi.restoreAllMocks()
    }
  })
})

describe('Lot screenplay review token equality', () => {
  function exactContext(): LotScriptReviewContext {
    return currentLotScriptReviewContext(firstReviewState('lot-script-review-same'))!
  }

  it('compares action tokens by every closed field and rejects decorated tokens', () => {
    const action = exactContext().legalActions[0]!
    expect(sameLotScriptReviewAction(action, clone(action))).toBe(true)
    expect(sameLotScriptReviewAction(null, null)).toBe(true)
    expect(sameLotScriptReviewAction(action, null)).toBe(false)

    for (const changed of [
      { ...action, kind: 'requestScriptRewrite' as const },
      { ...action, projectId: `${action.projectId}-other` },
      { ...action, label: `${action.label}!` },
    ]) {
      expect(sameLotScriptReviewAction(action, changed)).toBe(false)
    }

    const decorated = clone(action) as LotScriptReviewAction & { retry?: boolean }
    decorated.retry = true
    expect(sameLotScriptReviewAction(action, decorated)).toBe(false)
  })

  it('compares every nested context field in order and rejects reversals or hidden authority', () => {
    const context = exactContext()
    expect(sameLotScriptReviewContext(context, clone(context))).toBe(true)
    expect(sameLotScriptReviewContext(null, null)).toBe(true)
    expect(sameLotScriptReviewContext(context, null)).toBe(false)

    const reversed = clone(context)
    reversed.legalActions.reverse()
    expect(sameLotScriptReviewContext(context, reversed)).toBe(false)

    const changedStrength = clone(context)
    changedStrength.assessment.strengths = ['Changed player-safe strength']
    expect(sameLotScriptReviewContext(context, changedStrength)).toBe(false)

    const changedBlocker = clone(context)
    changedBlocker.blockers = [{
      kind: 'facility-capacity',
      headline: 'Blocked',
      detail: 'Exact detail',
      remedy: 'Exact remedy',
    }]
    expect(sameLotScriptReviewContext(context, changedBlocker)).toBe(false)

    const decorated = clone(context) as LotScriptReviewContext & { actualStrength?: number }
    decorated.actualStrength = 99
    expect(sameLotScriptReviewContext(context, decorated)).toBe(false)
  })
})

describe('accepted Lot screenplay review successor proof', () => {
  it('proves the exact ready successor for first- and final-draft acceptance', () => {
    for (const [label, state] of [
      ['first', firstReviewState('lot-script-success-first')],
      ['final', finalReviewState('lot-script-success-final')],
    ] as const) {
      const context = currentLotScriptReviewContext(state)!
      const action = context.legalActions.find((candidate) => candidate.kind === 'acceptScript')!
      const result = runScriptProjectAction(state, action)
      if (!result.ok) throw new Error(result.error)

      expect(acceptedLotScriptReviewSuccess(context, action, state, result.next)).toEqual({
        kind: 'accepted',
        projectId: context.projectId,
        title: context.title,
        writerName: context.writer.name,
        statusLabel: 'Ready to package',
      })
      expect(label).toMatch(/first|final/)
    }
  })

  it('proves the exact writer, due week, facility, and slot for a final rewrite', () => {
    const state = firstReviewState('lot-script-success-rewrite')
    const context = currentLotScriptReviewContext(state)!
    const action = context.legalActions.find(
      (candidate) => candidate.kind === 'requestScriptRewrite',
    )!
    const result = runScriptProjectAction(state, action)
    if (!result.ok) throw new Error(result.error)
    const card = scriptProjectsBoard(result.next).sections.inDevelopment[0]!

    expect(acceptedLotScriptReviewSuccess(context, action, state, result.next)).toEqual({
      kind: 'rewrite',
      projectId: context.projectId,
      title: context.title,
      writerName: context.writer.name,
      dueWeek: card.dueWeek,
      facilityId: 'facility-development-casting',
      facilityName: 'Development & Casting',
      slot: 0,
    })
  })

  it('fails presentation neutrally when successor capacity or project truth is decorated', () => {
    const state = firstReviewState('lot-script-success-hostile')
    const context = currentLotScriptReviewContext(state)!
    const action = context.legalActions.find(
      (candidate) => candidate.kind === 'requestScriptRewrite',
    )!
    const result = runScriptProjectAction(state, action)
    if (!result.ok) throw new Error(result.error)
    const hostile = boardFor(result.next)
    Object.assign(hostile.capacity.facilities[0]!.slots[0]!, { personalLocation: true })
    mockBoard(hostile)

    expect(acceptedLotScriptReviewSuccess(context, action, state, result.next)).toBeNull()
  })

  it('rejects successor copy when an action appears to consume week, cash, or RNG state', () => {
    const state = firstReviewState('lot-script-success-invariants')
    const context = currentLotScriptReviewContext(state)!
    const action = context.legalActions.find((candidate) => candidate.kind === 'acceptScript')!
    const result = runScriptProjectAction(state, action)
    if (!result.ok) throw new Error(result.error)

    const changedWeek = clone(result.next)
    changedWeek.market.tick += 1
    expect(acceptedLotScriptReviewSuccess(context, action, state, changedWeek)).toBeNull()

    const changedCash = clone(result.next)
    changedCash.studio.cash += 1
    expect(acceptedLotScriptReviewSuccess(context, action, state, changedCash)).toBeNull()

    const changedRng = clone(result.next)
    changedRng.rngState = `${changedRng.rngState}:hostile`
    expect(acceptedLotScriptReviewSuccess(context, action, state, changedRng)).toBeNull()
  })

  it('never presents a rewrite from an arbitrary facility or an unproven Annex projection', () => {
    const state = firstReviewState('lot-script-success-facility-authority')
    const context = currentLotScriptReviewContext(state)!
    const action = context.legalActions.find(
      (candidate) => candidate.kind === 'requestScriptRewrite',
    )!
    const result = runScriptProjectAction(state, action)
    if (!result.ok) throw new Error(result.error)
    const priorBoard = boardFor(state)
    const afterBoard = boardFor(result.next)
    const facility = afterBoard.capacity.facilities.find((candidate) =>
      candidate.slots.some((slot) =>
        slot.occupant?.owner === 'script' &&
        slot.occupant.ownerId === context.projectId,
      ),
    )!

    facility.facilityId = 'facility-invented-review-suite'
    facility.facilityName = 'Invented Review Suite'
    vi.spyOn(adapter, 'scriptProjectsBoard').mockImplementation((candidate) =>
      candidate === state ? priorBoard : afterBoard,
    )
    expect(acceptedLotScriptReviewSuccess(context, action, state, result.next)).toBeNull()

    vi.restoreAllMocks()
    const annexClaim = boardFor(result.next)
    const claimed = annexClaim.capacity.facilities.find((candidate) =>
      candidate.slots.some((slot) =>
        slot.occupant?.owner === 'script' &&
        slot.occupant.ownerId === context.projectId,
      ),
    )!
    claimed.facilityId = 'facility-development-casting-annex'
    claimed.facilityName = 'Development & Casting Annex'
    vi.spyOn(adapter, 'scriptProjectsBoard').mockImplementation((candidate) =>
      candidate === state ? priorBoard : annexClaim,
    )
    expect(acceptedLotScriptReviewSuccess(context, action, state, result.next)).toBeNull()
  })

  // ── C2a-M3 — the ORIGINAL arm of the same surface (charter §3.5, §12-M3) ────
  it('names the studio’s own writer on an original, and the working title they gave it', () => {
    const managed = managedStudio('lot-script-review-original')
    const writer = scriptProjectsBoard(managed).commission.writers.find(
      (candidate) => candidate.available && candidate.primaryRole === 'writer',
    )!
    const commissioned = commissionOriginalScreenplayAction(managed, {
      writerId: writer.id,
      genre: 'crime',
      shape: SHAPE,
      promise: {
        genre: 'crime',
        intendedSegments: ['adult'],
        ranges: {
          intimacy: [-0.4, 0.4],
          tonalWeight: [-0.4, 0.4],
          kineticEnergy: [-0.4, 0.4],
        },
      },
    })
    if (!commissioned.ok) throw new Error(commissioned.error)

    // The draft takes as many weeks as the engine says it does — never assumed here.
    let state = commissioned.next
    for (let week = 0; week < 8 && currentLotScriptReviewContext(state) === null; week += 1) {
      state = advanceWeek(state).next
    }
    const context = currentLotScriptReviewContext(state)
    if (context === null) throw new Error('setup: the original draft never came in for review')

    expect(context.provenance).toEqual({
      origin: 'original',
      label: `An Original Screenplay by ${writer.name}`,
      writerName: writer.name,
      generatedTitle: context.title,
      renamed: false,
    })

    // …and a retitled picture keeps the record of what its writers called it.
    const generatedTitle = context.title
    const conceptId = state.scriptDevelopment.projects.at(-1)!.conceptId
    const renamed = renameScreenplayAction(state, conceptId, 'The Long Way Down')
    if (!renamed.ok) throw new Error(renamed.error)
    const after = currentLotScriptReviewContext(renamed.next)!
    expect(after.title).toBe('The Long Way Down')
    expect(after.provenance).toEqual({
      origin: 'original',
      label: `An Original Screenplay by ${writer.name}`,
      writerName: writer.name,
      generatedTitle,
      renamed: true,
    })
    // A rename changes the picture, so a rendered review of the old one is stale.
    expect(sameLotScriptReviewContext(context, after)).toBe(false)
  })
})
