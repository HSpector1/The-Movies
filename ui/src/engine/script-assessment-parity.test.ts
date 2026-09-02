import { describe, expect, it } from 'vitest'
import { applyActions } from '../../../src/core/index.ts'
import {
  advanceWeek,
  assessDiscoveryExposure,
  assessExecutionConfidence,
  assessProfitRange,
  autopsyCompare,
  commissionScriptAction,
  explainRelease,
  foundManagedStudioAction,
  foundingApplicantCards,
  greenlightScriptProject,
  marketingEfficiency,
  marketingMenu,
  newGame,
  previewForecast,
  requiredNegative,
  runProductionCommand,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  studioDecision,
} from './adapter.ts'
import type {
  CommissionScriptPayload,
  CreativeRole,
  DraftPackage,
  FilmResult,
  GameState,
} from './adapter.ts'

const FOUNDING_COUNTS: Record<CreativeRole, number> = {
  actor: 3,
  director: 1,
  writer: 1,
  craft: 1,
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

function commissionedProject(state: GameState): GameState {
  const board = scriptProjectsBoard(state)
  const concept = board.commission.concepts[0]!
  const writer = board.commission.writers.find(
    (candidate) => candidate.available && candidate.primaryRole === 'writer',
  )!
  const project: CommissionScriptPayload = {
    conceptId: concept.id,
    writerId: writer.id,
    shape: {
      opening: 'immediateAction',
      midpoint: 'revelation',
      ending: 'bittersweet',
    },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult', 'prestige'],
      ranges: {
        intimacy: [-0.4, 0.6],
        tonalWeight: [0, 0.8],
        kineticEnergy: [-0.7, 0.2],
      },
    },
  }
  const commissioned = commissionScriptAction(state, project)
  if (!commissioned.ok) throw new Error(commissioned.error)
  return commissioned.next
}

function runScriptAction(
  state: GameState,
  kind: 'acceptScript' | 'requestScriptRewrite',
): GameState {
  const action = scriptProjectsBoard(state).sections.needsReview[0]?.legalActions.find(
    (candidate) => candidate.kind === kind,
  )
  if (!action) throw new Error(`setup: no ${kind} action`)
  const result = runScriptProjectAction(state, action)
  if (!result.ok) throw new Error(result.error)
  return result.next
}

function rewrittenReadyStudio(seed: string): GameState {
  let state = commissionedProject(managedStudio(seed))
  state = advanceWeek(state).next
  state = runScriptAction(state, 'requestScriptRewrite')
  state = advanceWeek(state).next
  return runScriptAction(state, 'acceptScript')
}

function packageReadyScript(state: GameState): DraftPackage {
  const ready = scriptProjectsBoard(state).packages[0]!
  const concept = state.concepts.find((candidate) => candidate.id === ready.concept.id)!
  const contracted = new Set(state.contracts.map((contract) => contract.talentId))
  const ids = (role: CreativeRole) =>
    state.talent
      .filter((candidate) => candidate.role === role && contracted.has(candidate.id))
      .map((candidate) => candidate.id)
  const actors = ids('actor')
  return {
    conceptId: ready.concept.id,
    shape: ready.lockedShape,
    promise: ready.lockedPromise,
    writerId: ready.writer.id,
    directorId: ids('director')[0]!,
    craftIds: [ids('craft')[0]!],
    cast: {
      lead: actors[0]!,
      antagonist: actors[1]!,
      support: actors[2]!,
    },
    budget: {
      negative: requiredNegative(concept, ready.lockedShape, state),
      marketing: 0,
    },
  }
}

function releaseManagedProduction(state: GameState): {
  preTick: GameState
  next: GameState
  film: FilmResult
} {
  let current = state
  for (let guard = 0; guard < 40; guard++) {
    const decision = studioDecision(current)
    if (decision?.kind === 'scriptReview') {
      throw new Error('setup: unexpected screenplay review during production')
    }
    if (decision?.kind === 'productionDecision') {
      const command = decision.decision.command
      if (command === null) throw new Error('setup: selected production decision has no command')
      const result = runProductionCommand(current, command)
      if (!result.ok) throw new Error(result.error)
      current = result.next
      continue
    }
    // P06A W1: a Release Ready picture HOLDS until explicitly committed — resolve the
    // decision the instant it appears so this walk still finds a real release.
    if (decision?.kind === 'releaseReview') {
      current = applyActions(current, [
        { kind: 'commitPictureToRelease', productionId: decision.decision.productionId },
      ])
      continue
    }
    const step = advanceWeek(current)
    if (step.released.length > 0) {
      return { preTick: step.preTick, next: step.next, film: step.released[0]! }
    }
    current = step.next
  }
  throw new Error('setup: managed production did not release')
}

describe('managed screenplay assessment parity', () => {
  it('keeps a rewritten Ready preview, locked forecast, and linked autopsy on the persisted assessment', () => {
    const readyState = rewrittenReadyStudio('script-assessment-parity-18')
    const project = readyState.scriptDevelopment.projects[0]!
    expect(project).toMatchObject({ status: 'ready', rewriteCount: 1 })
    expect(project.assessment).not.toBeNull()

    const pkg = packageReadyScript(readyState)
    const projectId = project.id
    const preview = previewForecast(readyState, pkg, projectId)
    const execution = assessExecutionConfidence(readyState, pkg, projectId)
    const profit = assessProfitRange(readyState, pkg, projectId)
    const unlinkedPreview = previewForecast(readyState, pkg)
    const unlinkedExecution = assessExecutionConfidence(readyState, pkg)
    const unlinkedProfit = assessProfitRange(readyState, pkg)

    // A rewrite changes the persisted screenplay assessment. The managed preview
    // must therefore differ from the legacy concept/writer recomputation.
    expect(preview).not.toEqual(unlinkedPreview)
    expect(execution).not.toEqual(unlinkedExecution)
    expect(profit.studioRevenue).not.toEqual(unlinkedProfit.studioRevenue)
    expect(execution.confidenceSources).toContain('strong script')
    expect(unlinkedExecution.confidenceSources).not.toContain('strong script')

    const greenlit = greenlightScriptProject(readyState, projectId, pkg)
    if (!greenlit.ok) throw new Error(greenlit.error)
    const production = greenlit.next.studio.activeProductions[0]!
    expect(preview).toEqual(production.forecastSnapshot)

    const released = releaseManagedProduction(greenlit.next)
    const autopsy = explainRelease(
      released.preTick,
      released.next.studio.standing,
      released.film,
    )
    expect(autopsy.scriptStrength).toBeCloseTo(project.assessment!.actualStrength, 10)
    expect(autopsy.boxOffice.opening).toBeCloseTo(released.film.boxOffice.opening, 6)
    expect(autopsy.boxOffice.total).toBeCloseTo(released.film.boxOffice.total, 6)

    const comparison = autopsyCompare(released.preTick, released.film)
    expect(comparison).not.toBeNull()
    expect(comparison!.assessment.forecastSnapshot).toEqual(preview)
    // The reconstructed perceived assessment consumes the same persisted script
    // strength as Assembly. Market state can move during production, so compare the
    // invariant qualitative/causal reads rather than reasserting greenlight dollars.
    expect(comparison!.assessment.execution.confidenceSources).toEqual(
      expect.arrayContaining(execution.confidenceSources),
    )
    expect(comparison!.assessment.execution.confidenceSources).toContain('strong script')
    expect(comparison!.assessment.profit.confidence).toBe(profit.confidence)
  })

  it('anchors marketing and discovery reads to the rewritten perceived screenplay', () => {
    const readyState = rewrittenReadyStudio('menu-parity-9')
    const project = readyState.scriptDevelopment.projects[0]!
    expect(project).toMatchObject({ status: 'ready', rewriteCount: 1 })
    // RE-BASED at C2a-M3 by owner ruling `00E`.9 — the writer-quality term is out
    // of first-draft assessment with no compensating bonus, so a screenplay's
    // strength is its premise plus the office and nothing else. The predecessor
    // pinned 66.76880218961112 / 64.81101623653322, whose gap between hidden and
    // estimated strength was ENTIRELY the writer's perceived/actual split. The
    // successor keeps the same rewritten project and asserts the same causal
    // reads; only the numbers the removed term produced have moved. Every figure
    // in this test below is re-based from the same run for the same reason.
    expect(project.assessment).toEqual({
      actualStrength: 46.928135897804566,
      perceivedStrength: 46.928135897804566,
    })

    const pkg = packageReadyScript(readyState)
    const menu = marketingMenu(readyState, pkg, project.id)
    expect(menu.capacity).toBeCloseTo(530_181.0452559121, 8)
    expect(menu.levels).toEqual([689_235, 1_272_435, 1_961_670])

    const entryPackage: DraftPackage = {
      ...pkg,
      budget: { ...pkg.budget, marketing: menu.levels[0] },
    }
    const efficiency = marketingEfficiency(readyState, entryPackage, project.id)
    expect(efficiency).toMatchObject({
      capacity: menu.capacity,
      spend: 689_235,
      state: 'Entry campaign',
    })
    expect(efficiency.preMarketingAwareness).toBeCloseTo(0.3844703135776255, 12)
    expect(efficiency.ratio).toBeCloseTo(1.299999323188392, 12)

    const discovery = assessDiscoveryExposure(readyState, entryPackage, project.id)
    expect(discovery).toMatchObject({
      reachSupport: 0.3928275661696548,
      shortfall: 0,
      exposed: false,
      spread: 0,
      bandLow: 1,
      bandHigh: 1,
      threshold: 0.375,
    })

    // The prior unlinked path recomputes legacy concept/writer strength and produces
    // a materially different menu. The managed UI must never fall back to these dollars.
    expect(marketingMenu(readyState, entryPackage).levels).toEqual([
      697_387,
      1_287_483,
      1_984_869,
    ])

    // Only persisted perceived strength crosses these player-facing selectors.
    // Changing the hidden actual assessment cannot move any returned value.
    const hiddenChanged = structuredClone(readyState)
    hiddenChanged.scriptDevelopment.projects[0]!.assessment!.actualStrength = 1
    expect(marketingMenu(hiddenChanged, pkg, project.id)).toEqual(menu)
    expect(marketingEfficiency(hiddenChanged, entryPackage, project.id)).toEqual(efficiency)
    expect(assessDiscoveryExposure(hiddenChanged, entryPackage, project.id)).toEqual(discovery)
  })
})
