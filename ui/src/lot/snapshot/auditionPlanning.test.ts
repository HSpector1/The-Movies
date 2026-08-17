import { afterEach, describe, expect, it, vi } from 'vitest'
import * as adapter from '../../engine/adapter.ts'
import {
  acknowledgeCastingSessionAction,
  advanceWeek,
  castingSessionsBoard,
  commissionScriptAction,
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  importSaveJson,
  newGame,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  startCastingSessionAction,
} from '../../engine/adapter.ts'
import type {
  CastingSessionsReadModel,
  CommissionScriptPayload,
  CreativeRole,
  GameState,
  StartCastingSessionPayload,
} from '../../engine/adapter.ts'
import {
  acceptedLotAuditionPlanningReceipt,
  currentLotAuditionPlanningContext,
  currentLotAuditionPlanningReceipt,
  lotAuditionPlanningPayload,
  sameLotAuditionPlanningContext,
  sameLotAuditionPlanningReceipt,
  type LotAuditionPlanningContext,
  type LotAuditionPlanningOpenAuthority,
} from './auditionPlanning.ts'

const FOUNDING_COUNTS: Record<CreativeRole, number> = {
  actor: 3,
  director: 1,
  writer: 1,
  craft: 1,
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

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
    shape: {
      opening: 'immediateAction',
      midpoint: 'revelation',
      ending: 'bittersweet',
    },
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

function readyStudio(seed: string): GameState {
  const managed = managedStudio(seed)
  const commissioned = commissionScriptAction(managed, commissionPayload(managed))
  if (!commissioned.ok) throw new Error(commissioned.error)
  const review = advanceWeek(commissioned.next).next
  const accept = scriptProjectsBoard(review).sections.needsReview[0]!.legalActions.find(
    (action) => action.kind === 'acceptScript',
  )
  if (accept === undefined) throw new Error('setup: screenplay cannot be accepted')
  const result = runScriptProjectAction(review, accept)
  if (!result.ok) throw new Error(result.error)
  return result.next
}

/**
 * A studio with a PAST: one camera test already run and acknowledged, and a second
 * screenplay commissioned, drafted and accepted the ordinary way.
 *
 * This is every state a studio is in after its first picture — `castingSessions.sessions`
 * is append-only (castingSessions.ts:315), so the finished session never leaves the books.
 */
function secondPictureStudio(seed: string): GameState {
  const first = readyStudio(seed)
  const started = startCastingSessionAction(first, payloadFor(contextFor(first)))
  if (!started.ok) throw new Error(started.error)
  const reviewing = advanceWeek(started.next).next
  const session = reviewing.castingSessions.sessions[0]!
  if (session.status !== 'review') throw new Error('setup: the camera tests did not finish')
  const acknowledged = acknowledgeCastingSessionAction(reviewing, session.id)
  if (!acknowledged.ok) throw new Error(acknowledged.error)

  const commissioned = commissionScriptAction(
    acknowledged.next,
    commissionPayload(acknowledged.next),
  )
  if (!commissioned.ok) throw new Error(commissioned.error)
  const drafted = advanceWeek(commissioned.next).next
  const accept = scriptProjectsBoard(drafted).sections.needsReview[0]!.legalActions.find(
    (action) => action.kind === 'acceptScript',
  )
  if (accept === undefined) throw new Error('setup: the second screenplay cannot be accepted')
  const accepted = runScriptProjectAction(drafted, accept)
  if (!accepted.ok) throw new Error(accepted.error)
  return accepted.next
}

function authority(state: GameState): LotAuditionPlanningOpenAuthority {
  const screen = { kind: 'lot' }
  const presentation = {}
  return {
    hollywoodEnabled: true,
    origin: 'lot-browse-talent',
    worldInputOwner: true,
    originState: state,
    currentState: state,
    originScreen: screen,
    currentScreen: screen,
    originPresentation: presentation,
    currentPresentation: presentation,
  }
}

function contextFor(state: GameState): LotAuditionPlanningContext {
  const context = currentLotAuditionPlanningContext(authority(state))
  if (context === null) throw new Error('setup: expected audition-planning context')
  return context
}

function payloadFor(context: LotAuditionPlanningContext): StartCastingSessionPayload {
  const ids = context.project.candidates.lead.map((candidate) => candidate.id)
  return {
    projectId: context.project.projectId,
    slate: {
      lead: [ids[0]!, ids[1]!],
      antagonist: [ids[0]!, ids[1]!],
      support: [ids[0]!, ids[2]!],
    },
  }
}

function acceptedPair(seed: string) {
  const before = readyStudio(seed)
  const context = contextFor(before)
  const payload = payloadFor(context)
  const result = startCastingSessionAction(before, payload)
  if (!result.ok) throw new Error(result.error)
  return { before, after: result.next, context, payload }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('current Lot audition-planning context', () => {
  it('accepts only the exact Lot owner and returns the sole closed canonical card and first slot', () => {
    const state = readyStudio('audition-planning-context')
    const board = castingSessionsBoard(state)
    const context = contextFor(state)

    expect(context).toEqual({
      kind: 'audition-planning',
      project: board.sections.readyToPlan[0],
      firstFreeSlot: {
        facilityId: 'facility-development-casting',
        facilityName: 'Development & Casting',
        capability: 'development-casting',
        slot: 0,
      },
      planAction: board.sections.readyToPlan[0]!.legalActions.find(
        (action) => action.kind === 'planAuditions',
      ),
    })
    expect(context.project).not.toBe(board.sections.readyToPlan[0])
    expect(context.project.candidates.lead).not.toBe(board.sections.readyToPlan[0]!.candidates.lead)
    expect(context.project.candidates.lead.map((candidate) => candidate.id)).toEqual(
      context.project.candidates.antagonist.map((candidate) => candidate.id),
    )
    expect(context.project.candidates.lead.map((candidate) => candidate.id)).toEqual(
      [...context.project.candidates.lead.map((candidate) => candidate.id)].sort(),
    )
    expect(context.project.candidates.lead.every((candidate) =>
      candidate.primaryRole === 'actor' && candidate.available && candidate.fit.label === 'Fit',
    )).toBe(true)
  })

  it('fails closed on every origin/world identity drift and outside Hollywood', () => {
    const state = readyStudio('audition-planning-origin')
    const exact = authority(state)
    const changes: LotAuditionPlanningOpenAuthority[] = [
      { ...exact, hollywoodEnabled: false },
      { ...exact, origin: 'other' as 'lot-browse-talent' },
      { ...exact, worldInputOwner: false },
      { ...exact, currentState: clone(state) },
      { ...exact, currentScreen: { kind: 'lot' } },
      { ...exact, currentPresentation: {} },
      { ...exact, currentPresentation: null },
      { ...exact, originScreen: {} },
    ]
    for (const changed of changes) {
      expect(currentLotAuditionPlanningContext(changed)).toBeNull()
    }
    expect(currentLotAuditionPlanningContext({ ...exact, extra: true } as never)).toBeNull()
    const symbolAuthority = { ...exact }
    Object.defineProperty(symbolAuthority, Symbol('hostile'), { value: true, enumerable: true })
    expect(currentLotAuditionPlanningContext(symbolAuthority)).toBeNull()
  })

  it('rejects zero/multiple projects, raw session/history truth, and managed-mode drift', () => {
    const idle = managedStudio('audition-planning-empty')
    expect(currentLotAuditionPlanningContext(authority(idle))).toBeNull()

    const ready = readyStudio('audition-planning-raw-session')
    const context = contextFor(ready)
    const started = startCastingSessionAction(ready, payloadFor(context))
    if (!started.ok) throw new Error(started.error)
    expect(currentLotAuditionPlanningContext(authority(started.next))).toBeNull()

    for (const changed of [
      { ...ready, operations: { ...ready.operations, mode: 'legacy' as const } },
      { ...ready, scriptDevelopment: { ...ready.scriptDevelopment, mode: 'legacy' as const } },
      { ...ready, castingSessions: { ...ready.castingSessions, mode: 'legacy' as const } },
    ]) {
      expect(currentLotAuditionPlanningContext(authority(changed))).toBeNull()
    }
  })

  it('plans the studio’s SECOND picture, with a finished camera test already on the books', () => {
    // THE DEFECT THIS PINS. `sessions` is append-only, so requiring an EMPTY session list
    // made this selector refuse every world a studio is in after its first camera test —
    // the planner worked exactly once per studio, and picture #2 fell through to the
    // full-screen Casting Room from every opener.
    const state = secondPictureStudio('audition-planning-second-picture')
    const board = castingSessionsBoard(state)
    expect(state.castingSessions.sessions).toHaveLength(1)
    expect(state.castingSessions.sessions[0]!.status).toBe('complete')
    expect(board.sections.history).toHaveLength(1)
    expect(board.sections.readyToPlan).toHaveLength(1)

    const context = contextFor(state)
    expect(context.project.projectId).toBe(board.sections.readyToPlan[0]!.projectId)
    expect(context.project.sessionId).toBeNull()
    expect(context.planAction).toEqual({
      kind: 'planAuditions',
      projectId: context.project.projectId,
      label: 'Plan auditions',
    })

    // …and the session it starts is session N, not a second `casting-0000`.
    const payload = payloadFor(context)
    const started = startCastingSessionAction(state, payload)
    if (!started.ok) throw new Error(started.error)
    const receipt = acceptedLotAuditionPlanningReceipt(state, started.next, payload)
    expect(receipt?.sessionId).toBe('casting-0001')
    expect(receipt?.projectId).toBe(context.project.projectId)
    expect(started.next.castingSessions.sessions).toHaveLength(2)
    expect(started.next.castingSessions.sessions[0]).toEqual(state.castingSessions.sessions[0])
    expect(currentLotAuditionPlanningReceipt(started.next, receipt!)).toEqual(receipt)

    // The successor must APPEND. A world that quietly rewrote the studio's earlier session
    // while starting this one is not the action this receipt claims to witness.
    const rewritten = clone(started.next)
    rewritten.castingSessions.sessions[0]!.status = 'review'
    expect(acceptedLotAuditionPlanningReceipt(state, rewritten, payload)).toBeNull()
  })

  it('refuses while any session is still in flight, even one the board files under history', () => {
    const state = secondPictureStudio('audition-planning-second-in-flight')
    expect(currentLotAuditionPlanningContext(authority(state))).not.toBeNull()

    // A session whose screenplay has left `ready` is filed under `history` WHATEVER its
    // status (castingReadModel.ts:423-427), so the sections alone cannot answer "is
    // anything still running" — the raw session record has to.
    const firstProjectId = state.castingSessions.sessions[0]!.projectId
    const inFlight = clone(state)
    inFlight.scriptDevelopment.projects.find(
      (project) => project.id === firstProjectId,
    )!.status = 'inProduction'
    inFlight.castingSessions.sessions[0]!.status = 'auditioning'
    const board = castingSessionsBoard(inFlight)
    expect(board.sections.history).toHaveLength(1)
    expect(board.sections.readyToPlan).toHaveLength(1)
    expect(board.sections.auditioning).toHaveLength(0)
    expect(board.sections.needsReview).toHaveLength(0)
    expect(currentLotAuditionPlanningContext(authority(inFlight))).toBeNull()

    // Its `review` twin makes the board itself refuse to project at all, and the selector
    // fails closed on that rather than passing the throw to the world.
    const owing = clone(inFlight)
    owing.castingSessions.sessions[0]!.status = 'review'
    expect(() => castingSessionsBoard(owing)).toThrow()
    expect(currentLotAuditionPlanningContext(authority(owing))).toBeNull()
  })

  it('rejects malformed, sparse, decorated, contradictory, or throwing complete boards', () => {
    const state = readyStudio('audition-planning-hostile-board')
    const original = clone(castingSessionsBoard(state))
    const hostile: CastingSessionsReadModel[] = []

    const fit = clone(original)
    fit.sections.readyToPlan[0]!.candidates.lead[0]!.fit.score += 1
    hostile.push(fit)
    const duplicate = clone(original)
    duplicate.sections.readyToPlan[0]!.candidates.lead.push(
      clone(duplicate.sections.readyToPlan[0]!.candidates.lead[0]!),
    )
    hostile.push(duplicate)
    const extra = clone(original)
    Object.assign(extra.sections.readyToPlan[0]!.writer, { hidden: true })
    hostile.push(extra)
    const falseFree = clone(original)
    falseFree.capacity.available += 1
    hostile.push(falseFree)
    const two = clone(original)
    two.sections.readyToPlan.push(clone(two.sections.readyToPlan[0]!))
    hostile.push(two)
    const crossedRoles = clone(original)
    crossedRoles.sections.readyToPlan[0]!.candidates.support.pop()
    hostile.push(crossedRoles)

    for (const board of hostile) {
      vi.spyOn(adapter, 'castingSessionsBoard').mockReturnValue(board)
      expect(currentLotAuditionPlanningContext(authority(state))).toBeNull()
      vi.restoreAllMocks()
    }

    const sparse = clone(original)
    delete sparse.sections.readyToPlan[0]!.candidates.lead[0]
    vi.spyOn(adapter, 'castingSessionsBoard').mockReturnValue(sparse)
    expect(currentLotAuditionPlanningContext(authority(state))).toBeNull()
    vi.restoreAllMocks()

    const symbolBoard = clone(original)
    Object.defineProperty(symbolBoard, Symbol('hostile'), { value: true, enumerable: true })
    vi.spyOn(adapter, 'castingSessionsBoard').mockReturnValue(symbolBoard)
    expect(currentLotAuditionPlanningContext(authority(state))).toBeNull()
    vi.restoreAllMocks()

    vi.spyOn(adapter, 'castingSessionsBoard').mockImplementation(() => {
      throw new Error('hostile projection')
    })
    expect(currentLotAuditionPlanningContext(authority(state))).toBeNull()
  })
})

describe('audition-planning payload and context closure', () => {
  it('accepts legal cross-role reuse while rejecting same-role duplicates and fewer than three people', () => {
    const context = contextFor(readyStudio('audition-planning-payload'))
    const payload = payloadFor(context)
    expect(lotAuditionPlanningPayload(context, payload)).toEqual(payload)
    expect(lotAuditionPlanningPayload(context, payload)).not.toBe(payload)

    const sameRole = clone(payload)
    sameRole.slate.support = [sameRole.slate.support[0], sameRole.slate.support[0]]
    expect(lotAuditionPlanningPayload(context, sameRole)).toBeNull()
    const onlyTwo = clone(payload)
    onlyTwo.slate.support = [...onlyTwo.slate.lead]
    expect(lotAuditionPlanningPayload(context, onlyTwo)).toBeNull()
    const substituted = clone(payload)
    substituted.slate.lead[0] = 'talent-not-a-candidate'
    expect(lotAuditionPlanningPayload(context, substituted)).toBeNull()
    expect(lotAuditionPlanningPayload(context, { ...payload, extra: true })).toBeNull()

    const sparse = clone(payload)
    Reflect.deleteProperty(sparse.slate.lead, '0')
    expect(lotAuditionPlanningPayload(context, sparse)).toBeNull()
    const decorated = clone(payload)
    Object.defineProperty(decorated.slate.support, Symbol('hostile'), {
      value: true,
      enumerable: true,
    })
    expect(lotAuditionPlanningPayload(context, decorated)).toBeNull()
  })

  it('compares every closed context field and rejects decorated graphs', () => {
    const context = contextFor(readyStudio('audition-planning-context-compare'))
    expect(sameLotAuditionPlanningContext(context, clone(context))).toBe(true)
    expect(sameLotAuditionPlanningContext(null, null)).toBe(true)
    expect(sameLotAuditionPlanningContext(context, null)).toBe(false)
    expect(sameLotAuditionPlanningContext(
      context,
      { ...clone(context), firstFreeSlot: { ...context.firstFreeSlot, slot: 1 } },
    )).toBe(false)
    const widened = clone(context)
    Object.assign(widened.project.candidates.lead[0]!, { hidden: true })
    expect(sameLotAuditionPlanningContext(widened, clone(widened))).toBe(false)
  })
})

describe('accepted Lot audition-planning receipt', () => {
  it('accepts the exact direct action, canonical reservation, six read order, and current truth', () => {
    const pair = acceptedPair('audition-planning-receipt')
    const receipt = acceptedLotAuditionPlanningReceipt(pair.before, pair.after, pair.payload)
    expect(receipt).toEqual({
      sessionId: 'casting-0000',
      projectId: pair.context.project.projectId,
      title: pair.context.project.title,
      startedWeek: pair.before.market.tick,
      dueWeek: pair.before.market.tick + 1,
      facilityId: pair.context.firstFreeSlot.facilityId,
      facilityName: pair.context.firstFreeSlot.facilityName,
      slot: pair.context.firstFreeSlot.slot,
      reads: [
        { role: 'lead', talentId: pair.payload.slate.lead[0], name: expect.any(String) },
        { role: 'lead', talentId: pair.payload.slate.lead[1], name: expect.any(String) },
        { role: 'antagonist', talentId: pair.payload.slate.antagonist[0], name: expect.any(String) },
        { role: 'antagonist', talentId: pair.payload.slate.antagonist[1], name: expect.any(String) },
        { role: 'support', talentId: pair.payload.slate.support[0], name: expect.any(String) },
        { role: 'support', talentId: pair.payload.slate.support[1], name: expect.any(String) },
      ],
    })
    expect(receipt).not.toBeNull()
    expect(currentLotAuditionPlanningReceipt(pair.after, receipt!)).toEqual(receipt)
    expect(currentLotAuditionPlanningReceipt(pair.after, receipt!)).not.toBe(receipt)
    expect(sameLotAuditionPlanningReceipt(receipt, clone(receipt!))).toBe(true)
    expect(Object.keys(receipt!)).toEqual([
      'sessionId',
      'projectId',
      'title',
      'startedWeek',
      'dueWeek',
      'facilityId',
      'facilityName',
      'slot',
      'reads',
    ])
  })

  it('replays the accepted SaveFileV11 byte-identically without changing any non-Casting root', () => {
    const pair = acceptedPair('audition-planning-save-parity')
    const bytes = exportSaveJson(pair.after)
    const replay = importSaveJson(bytes)
    expect(replay.ok).toBe(true)
    if (!replay.ok) throw new Error(replay.error)
    expect(replay.converted).toBe(false)
    expect(exportSaveJson(replay.state)).toBe(bytes)

    const before = JSON.parse(exportSaveJson(pair.before)) as { state: Record<string, unknown> }
    const after = JSON.parse(bytes) as { state: Record<string, unknown> }
    const { castingSessions: beforeCasting, ...beforeOther } = before.state
    const { castingSessions: afterCasting, ...afterOther } = after.state
    expect(afterOther).toEqual(beforeOther)
    expect(beforeCasting).toEqual({ mode: 'managed', sessions: [] })
    expect((afterCasting as { sessions: unknown[] }).sessions).toHaveLength(1)
  })

  it('rejects same-state, non-casting mutation, noncanonical session/reservation, and substituted slate', () => {
    const pair = acceptedPair('audition-planning-receipt-hostile')
    expect(acceptedLotAuditionPlanningReceipt(pair.before, pair.before, pair.payload)).toBeNull()
    const hostile: GameState[] = [
      { ...pair.after, rngState: `${pair.after.rngState}-other` },
      { ...pair.after, market: { ...pair.after.market, tick: pair.after.market.tick + 1 } },
      { ...pair.after, studio: { ...pair.after.studio, cash: pair.after.studio.cash + 1 } },
      { ...pair.after, construction: { ...pair.after.construction, mode: 'legacy' } },
    ]
    for (const changed of hostile) {
      expect(acceptedLotAuditionPlanningReceipt(pair.before, changed, pair.payload)).toBeNull()
    }
    for (const mutate of [
      (state: GameState) => { state.castingSessions.sessions[0]!.id = 'casting-9000' },
      (state: GameState) => { state.castingSessions.sessions[0]!.dueWeek! += 1 },
      (state: GameState) => { state.castingSessions.sessions[0]!.reservation!.slot += 1 },
      (state: GameState) => { state.castingSessions.sessions[0]!.slate.support[1] = state.castingSessions.sessions[0]!.slate.support[0] },
      (state: GameState) => { Object.assign(state.castingSessions.sessions[0]!, { extra: true }) },
    ]) {
      const changed = clone(pair.after)
      mutate(changed)
      expect(acceptedLotAuditionPlanningReceipt(pair.before, changed, pair.payload)).toBeNull()
    }
  })

  it('accepts a legally duplicated name, and still rejects an unfaithful or decorated receipt', () => {
    const pair = acceptedPair('audition-planning-receipt-ambiguity')

    // RE-PINNED (live defect). This used to assert that a second person sharing a name
    // REJECTS the receipt. Talent names are generated from finite pools, so duplicates are
    // ordinary world content — founding seed `studio-001` yields two actors called "Rex
    // Petrov" — and under the old rule any studio holding a duplicate could never open the
    // retained audition planner at all. Sharing a name is a fact about the world, not
    // evidence of a malformed one, so the legal world is now accepted…
    const ambiguous = clone(pair.before)
    const selected = pair.payload.slate.lead[0]
    const selectedName = ambiguous.talent.find((person) => person.id === selected)!.name
    ambiguous.talent.find((person) => person.id !== selected)!.name = selectedName
    const result = startCastingSessionAction(ambiguous, pair.payload)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(
        acceptedLotAuditionPlanningReceipt(ambiguous, result.next, pair.payload),
      ).not.toBeNull()
    }

    const receipt = acceptedLotAuditionPlanningReceipt(pair.before, pair.after, pair.payload)!

    // …and the half that always mattered is strengthened, not dropped: a read whose NAME
    // is not the name of the person its ID names is still refused. (Its state-side twin —
    // substituting the name into the live roster — is pinned in the next spec.)
    const misnamed = clone(receipt)
    misnamed.reads[0]!.name = `${misnamed.reads[0]!.name} (understudy)`
    expect(currentLotAuditionPlanningReceipt(pair.after, misnamed)).toBeNull()

    const wrongRole = clone(receipt)
    wrongRole.reads[0]!.role = 'support'
    const decorated = clone(receipt)
    Object.assign(decorated.reads[0]!, { winner: true })
    expect(currentLotAuditionPlanningReceipt(pair.after, wrongRole)).toBeNull()
    expect(currentLotAuditionPlanningReceipt(pair.after, decorated)).toBeNull()
    expect(sameLotAuditionPlanningReceipt(decorated, clone(decorated))).toBe(false)
  })

  it('rejects every stale current-state identity and every closed receipt-field substitution', () => {
    const pair = acceptedPair('audition-planning-current-receipt')
    const receipt = acceptedLotAuditionPlanningReceipt(pair.before, pair.after, pair.payload)!
    const changedReceipts = [
      { ...receipt, sessionId: 'casting-9999' },
      { ...receipt, projectId: 'script-9999' },
      { ...receipt, title: `${receipt.title} II` },
      { ...receipt, startedWeek: receipt.startedWeek + 1, dueWeek: receipt.dueWeek + 1 },
      { ...receipt, dueWeek: receipt.dueWeek + 1 },
      { ...receipt, facilityId: 'facility-other' },
      { ...receipt, facilityName: 'Other facility' },
      { ...receipt, slot: receipt.slot + 1 },
    ]
    for (const changed of changedReceipts) {
      expect(currentLotAuditionPlanningReceipt(pair.after, changed)).toBeNull()
      expect(sameLotAuditionPlanningReceipt(receipt, changed)).toBe(false)
    }

    const renamed = clone(pair.after)
    const selectedId = receipt.reads[0]!.talentId
    renamed.talent.find((person) => person.id === selectedId)!.name = 'Substituted name'
    expect(currentLotAuditionPlanningReceipt(renamed, receipt)).toBeNull()

    const removed = clone(pair.after)
    removed.castingSessions.sessions = []
    expect(currentLotAuditionPlanningReceipt(removed, receipt)).toBeNull()

    const later = advanceWeek(pair.after).next
    expect(currentLotAuditionPlanningReceipt(later, receipt)).toBeNull()
  })
})
