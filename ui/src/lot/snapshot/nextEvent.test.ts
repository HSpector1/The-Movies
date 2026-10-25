import { afterEach, describe, expect, it, vi } from 'vitest'
import * as adapter from '../../engine/adapter.ts'
import {
  advanceToNextEvent,
  advanceWeek,
  castingSessionsBoard,
  commissionScriptAction,
  commitPictureToReleaseAction,
  foundManagedStudioAction,
  foundingApplicantCards,
  greenlight,
  newGame,
  placeFacilityAction,
  placementQuote,
  requiredNegative,
  runProductionCommand,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  startCastingSessionAction,
  startDevelopmentCastingAnnexAction,
  studioDecision,
  studioLotSnapshot,
  studioPlacement,
} from '../../engine/adapter.ts'
import type {
  CommissionScriptPayload,
  CreativeRole,
  DraftPackage,
  GameState,
  PlacementRequest,
  SimResult,
  StartCastingSessionPayload,
} from '../../engine/adapter.ts'
import { applyActions, generateWorld } from '../../../../src/core/index.ts'
import { foundedRosterIds, newFoundedGame } from '../../test/founding.ts'
import {
  acceptedLotNextEventConstructionCompletion,
  acceptedLotNextEventGuardNeutral,
  acceptedLotNextEventReceipt,
  currentLotNextEventProductionCommand,
  currentLotNextEventReleaseReview,
  lotNextEventNeutralFeedback,
  sameLotNextEventReceipt,
} from './nextEvent.ts'
import type { LotNextEventReceipt } from './nextEvent.ts'
import { lotStageIdentities } from './stageIdentity.ts'
import type { LotStageIdentity } from './StudioLotSnapshot.ts'
import { placedBuildingId } from './StudioLotSnapshot.ts'

afterEach(() => {
  vi.restoreAllMocks()
})

const SHAPE = {
  opening: 'slowSetup',
  midpoint: 'reversal',
  ending: 'bittersweet',
} as const

const FOUNDING_COUNTS: Record<CreativeRole, number> = {
  actor: 3,
  director: 1,
  writer: 1,
  craft: 1,
  scientist: 0,
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
  const writer = board.commission.writers.find((candidate) => candidate.available)!
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

function commissionedStudio(seed: string): GameState {
  const state = managedStudio(seed)
  const result = commissionScriptAction(state, commissionPayload(state))
  if (!result.ok) throw new Error(result.error)
  return result.next
}

function castingReadyStudio(seed: string): GameState {
  let state = commissionedStudio(seed)
  state = advanceWeek(state).next
  const accept = scriptProjectsBoard(state).sections.needsReview[0]!.legalActions.find(
    (action) => action.kind === 'acceptScript',
  )
  if (accept === undefined) throw new Error('setup: screenplay has no accept action')
  const accepted = runScriptProjectAction(state, accept)
  if (!accepted.ok) throw new Error(accepted.error)
  return accepted.next
}

function castingSlate(state: GameState): StartCastingSessionPayload {
  const project = castingSessionsBoard(state).sections.readyToPlan[0]!
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

function legalPackage(state: GameState, slot = 0): DraftPackage {
  const concept = state.concepts[slot]!
  const id = (role: CreativeRole, index: number) => foundedRosterIds(state, role)[index]!
  return {
    conceptId: concept.id,
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
    writerId: id('writer', slot),
    directorId: id('director', slot),
    craftIds: [id('craft', slot)],
    cast: {
      lead: id('actor', slot * 3),
      antagonist: id('actor', slot * 3 + 1),
      support: id('actor', slot * 3 + 2),
    },
    budget: {
      negative: requiredNegative(concept, SHAPE, state),
      marketing: 400_000,
    },
  }
}

function greenlitLegacy(seed: string, count = 1): GameState {
  let state = newFoundedGame(seed)
  for (let slot = 0; slot < count; slot += 1) {
    const result = greenlight(state, legalPackage(state, slot))
    if (!result.ok) throw new Error(result.error)
    state = result.next
  }
  return state
}

function greenlitManaged(seed: string): GameState {
  const managed = managedStudio(seed)
  const legacyDevelopment: GameState = {
    ...managed,
    scriptDevelopment: { mode: 'legacy', projects: [] },
    castingSessions: { mode: 'legacy', sessions: [] },
  }
  const result = greenlight(legacyDevelopment, legalPackage(legacyDevelopment))
  if (!result.ok) throw new Error(result.error)
  return result.next
}

function scriptResult(seed: string): { before: GameState; result: SimResult } {
  const before = commissionedStudio(seed)
  return { before, result: advanceToNextEvent(before) }
}

function productionResult(seed: string): { before: GameState; result: SimResult } {
  const before = greenlitManaged(seed)
  return { before, result: advanceToNextEvent(before) }
}

// P06A W1: a Release Ready picture HOLDS — advanceToNextEvent stops ZERO-WEEK at
// 'releaseReview' before the true (later) 'release' stop. Resolve that decision by
// committing the exact production the engine named, then keep walking, bounded, to
// reach the 'release' stop these fixtures are actually about.
function advanceToRelease(state: GameState): SimResult {
  let current = advanceToNextEvent(state)
  for (let guard = 0; guard < 5 && current.stopReason === 'releaseReview'; guard++) {
    const productionId = current.releaseDecision?.productionId
    if (productionId === undefined) {
      throw new Error('setup: releaseReview stop missing releaseDecision.productionId')
    }
    const committed = applyActions(current.next, [
      { kind: 'commitPictureToRelease', productionId },
    ])
    current = advanceToNextEvent(committed)
  }
  return current
}

function completedRunsResult(
  seed: string,
  count = 1,
): { before: GameState; result: SimResult } {
  const greenlit = greenlitLegacy(seed, count)
  const release = advanceToRelease(greenlit)
  if (release.stopReason !== 'release') throw new Error('setup: expected release')
  const before = release.next
  return { before, result: advanceToNextEvent(before) }
}

function constructionResult(seed: string): { before: GameState; result: SimResult } {
  const managed = managedStudio(seed)
  const state: GameState = {
    ...managed,
    scriptDevelopment: { mode: 'legacy', projects: [] },
    castingSessions: { mode: 'legacy', sessions: [] },
  }
  const started = startDevelopmentCastingAnnexAction(state)
  if (!started.ok) throw new Error(started.error)
  return { before: started.next, result: advanceToNextEvent(started.next) }
}

// ── L-37 (Owner decision 15A) fixtures ───────────────────────────────────────

/** The first LEGAL Build Mode placement on a parcel that is not the legacy Annex pad. */
function firstLegalBuildModeRequest(state: GameState): PlacementRequest {
  const view = studioPlacement(state)
  const blueprint = view.catalog[0]
  if (blueprint === undefined) throw new Error('setup: the placement catalog is empty')
  for (const parcel of view.parcels) {
    if (parcel.id === 'expansion') continue
    for (let gy = parcel.rect.y0; gy <= parcel.rect.y1; gy++) {
      for (let gx = parcel.rect.x0; gx <= parcel.rect.x1; gx++) {
        const request = { blueprintId: blueprint.blueprintId, origin: { gx, gy } }
        if (placementQuote(state, request).ok) return request
      }
    }
  }
  throw new Error('setup: no legal Build Mode placement')
}

function buildModeResult(seed: string): { before: GameState; result: SimResult } {
  const managed = managedStudio(seed)
  const state: GameState = {
    ...managed,
    scriptDevelopment: { mode: 'legacy', projects: [] },
    castingSessions: { mode: 'legacy', sessions: [] },
  }
  const placed = placeFacilityAction(state, firstLegalBuildModeRequest(state))
  if (!placed.ok) throw new Error(placed.error)
  const result = advanceToNextEvent(placed.next)
  if (result.stopReason !== 'constructionCompleted') {
    throw new Error(`setup: expected constructionCompleted, got ${result.stopReason}`)
  }
  return { before: placed.next, result }
}

/** A managed picture walked, command by command, to its Release Ready stop. */
function managedReleaseReviewResult(seed: string): { before: GameState; result: SimResult } {
  let state = greenlitManaged(seed)
  for (let guard = 0; guard < 24; guard += 1) {
    const result = advanceToNextEvent(state)
    if (result.stopReason === 'releaseReview' && result.weeks > 0) return { before: state, result }
    const command = result.productionDecision?.command ?? null
    if (command === null) {
      state = result.next
      continue
    }
    const ran = runProductionCommand(result.next, command)
    if (!ran.ok) throw new Error(`setup: ${ran.error}`)
    state = ran.next
  }
  throw new Error('setup: the managed picture never reached its release review')
}

/**
 * The audit's second symptom (L-37): after acting on an exact receipt the Lot's
 * eligibility gate (`lotNextEventEligibility`, which reads `studioDecision`) must open,
 * and the next sim must actually advance. Production commands that follow at once are
 * run too; each one is the next exact decision, never a stall.
 */
function expectNextSimAllowed(state: GameState): void {
  let current = state
  for (let guard = 0; guard < 4; guard += 1) {
    const pending = studioDecision(current)
    if (pending?.kind !== 'productionDecision' || pending.decision.command === null) break
    const ran = runProductionCommand(current, pending.decision.command)
    if (!ran.ok) throw new Error(ran.error)
    current = ran.next
  }
  expect(studioDecision(current)).toBeNull()
  expect(advanceToNextEvent(current).weeks).toBeGreaterThan(0)
}

describe('strict Lot next-event presentation boundary', () => {
  it('accepts real screenplay, casting, and physical Stage 7 decision projections', () => {
    const script = scriptResult('next-event-receipt-script')
    const scriptReceipt = acceptedLotNextEventReceipt(script.before, script.result)
    expect(script.result.stopReason).toBe('scriptReview')
    expect(scriptReceipt?.target).toEqual({
      kind: 'script',
      projectId: script.result.scriptDecision!.projectId,
      title: script.result.scriptDecision!.title,
      buildingId: 'writers',
    })

    const castingBefore = castingReadyStudio('next-event-receipt-casting')
    const started = startCastingSessionAction(castingBefore, castingSlate(castingBefore))
    if (!started.ok) throw new Error(started.error)
    const castingResult = advanceToNextEvent(started.next)
    const castingReceipt = acceptedLotNextEventReceipt(started.next, castingResult)
    expect(castingResult.stopReason).toBe('castingReview')
    expect(castingReceipt?.target).toEqual({
      kind: 'casting',
      sessionId: castingResult.castingDecision!.sessionId,
      projectId: castingResult.castingDecision!.projectId,
      title: castingResult.castingDecision!.title,
      buildingId: 'casting',
    })

    const production = productionResult('next-event-receipt-stage-7')
    const productionReceipt = acceptedLotNextEventReceipt(production.before, production.result)
    expect(production.result.stopReason).toBe('productionDecision')
    // C2a-M4 (WORLD-M2a's carried spec): ADDITIVE widening of a closed receipt.
    // The Stage-7 assertions above are preserved verbatim; the two new members
    // are the body the picture is on and the engine's OWN name for its facility,
    // which is what lets the rail name a stage the studio BUILT instead of
    // calling everything that is not Soundstage 7 "Soundstage 12".
    expect(productionReceipt?.target).toEqual({
      kind: 'production',
      productionId: production.result.productionDecision!.productionId,
      title: production.result.productionDecision!.title,
      location: 'stage-7',
      buildingId: 'stage-a',
      stageName: 'Soundstage 7',
    })
  })

  it('accepts exact run, cash, renewal, and expiry outcomes without inventing identity', () => {
    const runs = completedRunsResult('next-event-receipt-two-runs', 2)
    const runReceipt = acceptedLotNextEventReceipt(runs.before, runs.result)
    expect(runs.result.stopReason).toBe('runCompleted')
    expect(runReceipt?.completedRuns).toHaveLength(2)
    expect(runReceipt?.target).toEqual({
      kind: 'run-completed',
      runs: runs.result.completedRuns,
      buildingId: 'theater',
    })

    const cashBefore = newFoundedGame('next-event-receipt-cash', 400)
    const cashResult = advanceToNextEvent(cashBefore)
    expect(cashResult.stopReason).toBe('cashNegative')
    expect(acceptedLotNextEventReceipt(cashBefore, cashResult)?.target).toEqual({
      kind: 'cash',
      buildingId: 'admin',
    })

    const contractBefore = newFoundedGame('next-event-receipt-contracts', 52)
    const renewal = advanceToNextEvent(contractBefore)
    expect(renewal.stopReason).toBe('renewalWindow')
    expect(acceptedLotNextEventReceipt(contractBefore, renewal)?.target).toEqual({
      kind: 'contracts',
      change: 'renewal',
      buildingId: null,
    })

    const expiry = advanceToNextEvent(renewal.next)
    expect(expiry.stopReason).toBe('contractExpired')
    expect(acceptedLotNextEventReceipt(renewal.next, expiry)?.target).toEqual({
      kind: 'contracts',
      change: 'expired',
      buildingId: null,
    })
  })

  it('validates Annex completion independently and retains it through primary neutral fallback', () => {
    const construction = constructionResult('next-event-receipt-construction')
    const completion = acceptedLotNextEventConstructionCompletion(
      construction.before,
      construction.result,
    )
    expect(construction.result.stopReason).toBe('constructionCompleted')
    expect(completion).toEqual(construction.result.constructionCompletion)
    expect(acceptedLotNextEventReceipt(construction.before, construction.result)?.target).toEqual({
      kind: 'construction',
      projectId: completion!.projectId,
      facilityId: completion!.facilityId,
      name: completion!.name,
      buildingId: 'expansion',
    })

    const brokenPrimary: SimResult = {
      ...construction.result,
      summary: {
        ...construction.result.summary,
        fromWeek: construction.result.summary.fromWeek + 1,
      },
    }
    expect(acceptedLotNextEventReceipt(construction.before, brokenPrimary)).toBeNull()
    expect(lotNextEventNeutralFeedback(construction.before, brokenPrimary)).toEqual({
      kind: 'next-event-neutral',
      toWeek: construction.result.toWeek,
      cashNow: construction.result.next.studio.cash,
      stopMessage: construction.result.stopMessage,
      constructionCompletion: completion,
    })

    const wrongWeek: SimResult = {
      ...construction.result,
      constructionCompletion: {
        ...construction.result.constructionCompletion!,
        completedWeek: construction.result.toWeek + 1,
      },
    }
    expect(acceptedLotNextEventConstructionCompletion(construction.before, wrongWeek)).toBeNull()
    expect(acceptedLotNextEventReceipt(construction.before, wrongWeek)).toBeNull()
    expect(lotNextEventNeutralFeedback(construction.before, wrongWeek)?.constructionCompletion).toBeNull()

    const unrelatedBefore = managedStudio('next-event-receipt-unrelated-lineage')
    expect(lotNextEventNeutralFeedback(unrelatedBefore, brokenPrimary)).toBeNull()
  })

  it('keeps release and zero-week preflight outside exact receipts and accepts only the 520 guard neutral', () => {
    const releaseBefore = greenlitLegacy('next-event-receipt-release')
    const release = advanceToRelease(releaseBefore)
    expect(release.stopReason).toBe('release')
    expect(acceptedLotNextEventReceipt(releaseBefore, release)).toBeNull()

    const review = scriptResult('next-event-receipt-preflight')
    const preflight = advanceToNextEvent(review.result.next)
    expect(preflight.stopReason).toBe('scriptReview')
    expect(preflight.weeks).toBe(0)
    expect(acceptedLotNextEventReceipt(review.result.next, preflight)).toBeNull()

    const guardBefore = generateWorld('next-event-receipt-guard')
    const guard = advanceToNextEvent(guardBefore)
    expect(guard.stopReason).toBe('limit')
    expect(guard.guardHit).toBe(true)
    expect(guard.preTick).toBe(guardBefore)
    expect(acceptedLotNextEventReceipt(guardBefore, guard)).toBeNull()
    expect(acceptedLotNextEventGuardNeutral(guardBefore, guard)).toEqual({
      kind: 'next-event-neutral',
      toWeek: guard.toWeek,
      cashNow: guard.next.studio.cash,
      stopMessage: guard.stopMessage,
      constructionCompletion: null,
    })

    expect(acceptedLotNextEventGuardNeutral({ ...guardBefore }, guard)).toBeNull()
    expect(acceptedLotNextEventGuardNeutral(guardBefore, {
      ...guard,
      completedRuns: [{ productionId: 'forged', title: 'Forged' }],
    })).toBeNull()
  })

  it('retains finite fractional money exactly but rejects bad provenance, numbers, shapes, and projections', () => {
    const script = scriptResult('next-event-receipt-hostile')
    const fractional: SimResult = {
      ...script.result,
      summary: { ...script.result.summary, payroll: -123.375 },
    }
    expect(
      acceptedLotNextEventReceipt(script.before, fractional)?.summary.payroll,
    ).toBe(-123.375)

    expect(acceptedLotNextEventReceipt(script.before, {
      ...script.result,
      next: { ...script.result.next, seed: 'different-seed' },
    })).toBeNull()
    expect(lotNextEventNeutralFeedback(script.before, {
      ...script.result,
      next: { ...script.result.next, seed: 'different-seed' },
    })).toBeNull()
    expect(lotNextEventNeutralFeedback(script.before, {
      ...script.result,
      next: script.before,
    })).toBeNull()
    expect(lotNextEventNeutralFeedback(script.before, {
      ...script.result,
      weeks: 0,
    })).toBeNull()
    expect(acceptedLotNextEventReceipt(script.before, {
      ...script.result,
      summary: { ...script.result.summary, payroll: Number.NaN },
    })).toBeNull()
    expect(acceptedLotNextEventReceipt(script.before, {
      ...script.result,
      next: {
        ...script.result.next,
        studio: { ...script.result.next.studio, cash: Number.POSITIVE_INFINITY },
      },
    })).toBeNull()

    const scriptProject = script.result.next.scriptDevelopment.projects.find(
      (project) => project.id === script.result.scriptDecision!.projectId,
    )!
    expect(acceptedLotNextEventReceipt(script.before, {
      ...script.result,
      next: {
        ...script.result.next,
        scriptDevelopment: {
          ...script.result.next.scriptDevelopment,
          projects: [
            ...script.result.next.scriptDevelopment.projects,
            structuredClone(scriptProject),
          ],
        },
      },
    })).toBeNull()

    const castingBefore = castingReadyStudio('next-event-receipt-hostile-casting-duplicates')
    const castingStarted = startCastingSessionAction(castingBefore, castingSlate(castingBefore))
    if (!castingStarted.ok) throw new Error(castingStarted.error)
    const castingResult = advanceToNextEvent(castingStarted.next)
    const castingSession = castingResult.next.castingSessions.sessions.find(
      (session) => session.id === castingResult.castingDecision!.sessionId,
    )!
    expect(acceptedLotNextEventReceipt(castingStarted.next, {
      ...castingResult,
      next: {
        ...castingResult.next,
        castingSessions: {
          ...castingResult.next.castingSessions,
          sessions: [
            ...castingResult.next.castingSessions.sessions,
            structuredClone(castingSession),
          ],
        },
      },
    })).toBeNull()

    const extraSummary: SimResult = {
      ...script.result,
      summary: { ...script.result.summary },
    }
    Object.defineProperty(extraSummary.summary, Symbol('hostile-extra'), { value: true })
    expect(acceptedLotNextEventReceipt(script.before, extraSummary)).toBeNull()

    const production = productionResult('next-event-receipt-stale-decision')
    expect(acceptedLotNextEventReceipt(production.before, {
      ...production.result,
      productionDecision: {
        ...production.result.productionDecision!,
        title: 'Stale substituted title',
      },
    })).toBeNull()
    expect(acceptedLotNextEventReceipt(production.before, {
      ...production.result,
      preTick: production.before,
    })).toBeNull()

    const runs = completedRunsResult('next-event-receipt-order-trap', 2)
    expect(acceptedLotNextEventReceipt(runs.before, {
      ...runs.result,
      completedRuns: [...runs.result.completedRuns].reverse(),
    })).toBeNull()
    expect(acceptedLotNextEventReceipt(runs.before, {
      ...runs.result,
      completedRuns: [runs.result.completedRuns[0]!, runs.result.completedRuns[0]!],
    })).toBeNull()

    const throwing = new Proxy(script.result, {
      get(target, property, receiver) {
        if (property === 'next') throw new Error('hostile projection getter')
        return Reflect.get(target, property, receiver)
      },
    })
    expect(acceptedLotNextEventReceipt(script.before, throwing)).toBeNull()
    expect(lotNextEventNeutralFeedback(script.before, throwing)).toBeNull()
  })

  it('compares every closed field and rejects malformed values even against themselves', () => {
    const script = scriptResult('next-event-receipt-comparator')
    const receipt = acceptedLotNextEventReceipt(script.before, script.result)!
    const exactCopy = structuredClone(receipt)
    expect(sameLotNextEventReceipt(receipt, exactCopy)).toBe(true)

    const changedMessage = structuredClone(receipt)
    changedMessage.stopMessage += ' changed'
    expect(sameLotNextEventReceipt(receipt, changedMessage)).toBe(false)

    const extraTarget = structuredClone(receipt)
    Object.defineProperty(extraTarget.target, 'hiddenExtra', { value: true })
    expect(sameLotNextEventReceipt(receipt, extraTarget)).toBe(false)

    const extraNestedSummary = structuredClone(receipt)
    Object.defineProperty(extraNestedSummary.summary, Symbol('extra'), { value: true })
    expect(sameLotNextEventReceipt(extraNestedSummary, extraNestedSummary)).toBe(false)

    const missing = structuredClone(receipt) as unknown as { stopMessage?: string }
    delete missing.stopMessage
    expect(
      sameLotNextEventReceipt(missing as LotNextEventReceipt, missing as LotNextEventReceipt),
    ).toBe(false)

    const construction = constructionResult('next-event-receipt-comparator-completion')
    const completion = construction.result.constructionCompletion!
    const wrongCoeventWeek: LotNextEventReceipt = {
      ...receipt,
      constructionCompletion: { ...completion, completedWeek: receipt.toWeek + 1 },
    }
    expect(sameLotNextEventReceipt(wrongCoeventWeek, wrongCoeventWeek)).toBe(false)
  })
})

describe('L-37 (Owner decision 15A) — exact receipts beyond the founding stages', () => {
  it('gives a production decision on a BUILT stage an exact receipt with its command', () => {
    const production = productionResult('next-event-receipt-built-stage')
    const decision = production.result.productionDecision!
    const command = decision.command
    if (command === null) throw new Error('setup: expected a commanded production decision')
    // The engine cannot be steered onto a third soundstage without a three-picture lot,
    // so the snapshot reports the picture on a body the studio BUILT, with the stage
    // identity the derived vocabulary gives such a body (the L-38 precedent).
    const base = studioLotSnapshot(production.result.next)
    const built: LotStageIdentity = {
      facilityId: 'facility-soundstage-3',
      facilityName: 'Soundstage 3',
      buildingId: placedBuildingId(41),
      origin: 'placed',
      standing: true,
    }
    vi.spyOn(adapter, 'studioLotSnapshot').mockReturnValue({
      ...base,
      stages: [...lotStageIdentities(base), built],
      productionOperations: (base.productionOperations ?? []).map((operation) =>
        operation.productionId === decision.productionId
          ? { ...operation, locationBuildingId: built.buildingId }
          : operation,
      ),
    })

    // Before 15A the operation proof accepted only `stage-a`/`stage-b`: this was null
    // and the rail fell to neutral with no command.
    const receipt = acceptedLotNextEventReceipt(production.before, production.result)
    expect(receipt?.target).toEqual({
      kind: 'production',
      productionId: decision.productionId,
      title: decision.title,
      location: 'stage-12-semantic',
      buildingId: 'placed-41',
      stageName: 'Soundstage 3',
    })
    // …and it carries the action the rail offers as its world action.
    expect(currentLotNextEventProductionCommand(production.result.next, receipt!)).toEqual(command)

    // A body that is not one of this studio's stages still names no place.
    vi.restoreAllMocks()
    vi.spyOn(adapter, 'studioLotSnapshot').mockReturnValue({
      ...base,
      productionOperations: (base.productionOperations ?? []).map((operation) =>
        operation.productionId === decision.productionId
          ? { ...operation, locationBuildingId: placedBuildingId(42) }
          : operation,
      ),
    })
    expect(acceptedLotNextEventReceipt(production.before, production.result)).toBeNull()
    vi.restoreAllMocks()

    const ran = runProductionCommand(production.result.next, command)
    if (!ran.ok) throw new Error(ran.error)
    expectNextSimAllowed(ran.next)
  })

  it('gives every release review its own exact shape, then opens the gate once committed', () => {
    // Legacy studio: the stage is presentation, so the receipt names no body.
    const legacyBefore = greenlitLegacy('next-event-receipt-release-review-legacy')
    const legacy = advanceToNextEvent(legacyBefore)
    expect(legacy.stopReason).toBe('releaseReview')
    expect(legacy.weeks).toBeGreaterThan(0)
    const legacyReceipt = acceptedLotNextEventReceipt(legacyBefore, legacy)
    expect(legacyReceipt?.target).toEqual({
      kind: 'release-review',
      productionId: legacy.releaseDecision!.productionId,
      title: legacy.releaseDecision!.title,
      buildingId: null,
    })
    expect(legacyReceipt?.stopReason).toBe('releaseReview')

    // Managed studio: the body the engine holds a Release Ready picture at.
    const managed = managedReleaseReviewResult('next-event-receipt-release-review-managed')
    const productionId = managed.result.releaseDecision!.productionId
    const row = (studioLotSnapshot(managed.result.next).productionOperations ?? []).find(
      (operation) => operation.productionId === productionId,
    )
    expect(row?.locationBuildingId).not.toBeNull()
    const receipt = acceptedLotNextEventReceipt(managed.before, managed.result)
    expect(receipt?.target).toEqual({
      kind: 'release-review',
      productionId,
      title: managed.result.releaseDecision!.title,
      buildingId: row?.locationBuildingId,
    })
    expect(currentLotNextEventReleaseReview(managed.result.next, receipt!)).toEqual(receipt!.target)

    // The pairing is exact both ways: a release review cannot wear a production target.
    const disguised: LotNextEventReceipt = {
      ...receipt!,
      target: {
        kind: 'production',
        productionId,
        title: managed.result.releaseDecision!.title,
        location: 'stage-7',
        buildingId: 'stage-a',
        stageName: 'Soundstage 7',
      },
    }
    expect(sameLotNextEventReceipt(disguised, disguised)).toBe(false)

    // Committing is the action; the receipt then demotes and the next sim runs.
    const committed = commitPictureToReleaseAction(managed.result.next, productionId)
    if (!committed.ok) throw new Error(committed.error)
    expect(currentLotNextEventReleaseReview(committed.next, receipt!)).toBeNull()
    expectNextSimAllowed(committed.next)
  })

  it('gives a Build Mode completion an exact receipt that names the facility the studio built', () => {
    const built = buildModeResult('next-event-receipt-build-mode')
    const completion = acceptedLotNextEventConstructionCompletion(built.before, built.result)
    // Before 15A this read the legacy Annex parcel only, so it was null here.
    expect(completion).toEqual(built.result.constructionCompletion)
    const placed = studioPlacement(built.result.next).placements.filter(
      (placement) => placement.facilityId === completion!.facilityId,
    )
    expect(placed).toHaveLength(1)
    expect(placed[0]!.parcelId).not.toBe('expansion')
    expect(acceptedLotNextEventReceipt(built.before, built.result)?.target).toEqual({
      kind: 'construction',
      projectId: completion!.projectId,
      facilityId: completion!.facilityId,
      name: completion!.name,
      buildingId: placedBuildingId(placed[0]!.id),
    })

    // The co-event survives a neutral primary, exactly as the Annex's does.
    const brokenPrimary: SimResult = {
      ...built.result,
      summary: { ...built.result.summary, fromWeek: built.result.summary.fromWeek + 1 },
    }
    expect(acceptedLotNextEventReceipt(built.before, brokenPrimary)).toBeNull()
    expect(lotNextEventNeutralFeedback(built.before, brokenPrimary)?.constructionCompletion)
      .toEqual(completion)

    // A completion the placement projection does not show completing is still refused.
    expect(acceptedLotNextEventConstructionCompletion(built.before, {
      ...built.result,
      constructionCompletion: { ...completion!, name: 'A building nobody built' },
    })).toBeNull()

    expectNextSimAllowed(built.result.next)
  })
})

// F40 real accepted cash-stop receipt; retained exact-shape compatibility.
const f40Keys=['rights','estatePurchases','acquisition','diligence'] as const
it('F40 accepts all four actual summary fields and retained old shape while refusing partial mixed and extra receipt fields',()=>{
 const initial=newFoundedGame('next-event-receipt-cash',400),result=advanceToNextEvent(initial)
 expect(result.stopReason).toBe('cashNegative')
 for(const key of f40Keys)expect(Number.isFinite(result.summary[key])).toBe(true)
 const modern=acceptedLotNextEventReceipt(initial,result)
 expect(modern).not.toBeNull()
 for(const key of f40Keys)expect(modern!.summary[key]).toBe(result.summary[key])
 const oldSummary={...result.summary}
 for(const key of f40Keys)delete oldSummary[key]
 const old=acceptedLotNextEventReceipt(initial,{...result,summary:oldSummary})
 expect(old).not.toBeNull()
 for(const key of f40Keys)expect(Object.hasOwn(old!.summary,key)).toBe(false)
 for(const missing of f40Keys) {
  const partial={...result.summary};delete partial[missing]
  expect(acceptedLotNextEventReceipt(initial,{...result,summary:partial})).toBeNull()
 }
 const mixed={...oldSummary,rights:0}
 expect(acceptedLotNextEventReceipt(initial,{...result,summary:mixed})).toBeNull()
 const extra={...result.summary,foreignFinanceKey:0}
 expect(acceptedLotNextEventReceipt(initial,{...result,summary:extra})).toBeNull()
 for(const key of f40Keys) {
  const invalid={...result.summary,[key]:Number.NaN}
  expect(acceptedLotNextEventReceipt(initial,{...result,summary:invalid})).toBeNull()
 }
 const original=result.summary.rights
 modern!.summary.rights=123456
 expect(result.summary.rights).toBe(original) // accepted output is detached, no result mutation.
})
