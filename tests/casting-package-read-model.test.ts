import { describe, expect, it } from 'vitest'
import {
  applyActions,
  assignmentProjectCost,
  castingPackageReadModel,
  economyEngaged,
  expectedPerformance,
  freelancerFee,
  freelancerMarketIds,
  generateWorld,
  isContracted,
  marketingLevelsFor,
  NEGATIVE_BUDGET_MULTIPLIERS,
  projectFit,
  requiredNegative,
  resolveShape,
  roleOVR,
  scriptProjectsReadModel,
  tick,
} from '../src/core/index.js'
import type { CastSlot, GameState } from '../src/core/index.js'
import {
  auditionSlate,
  availableConceptId,
  availableWriterId,
  commissionPayload,
  contractedByRole,
  managedStudio,
} from './contracts/_contractFixtures.js'

// ── shared fixtures ──────────────────────────────────────────────────────────

/** One Ready screenplay, staffed and packaged the way existing core tests do. */
function readyStudio(seed: string): { state: GameState; projectId: string } {
  let state = managedStudio(seed)
  const conceptId = availableConceptId(state)
  const writerId = availableWriterId(state)
  state = applyActions(state, [
    { kind: 'commissionScript', project: commissionPayload(state, conceptId, writerId) },
  ])
  state = tick(state)
  const project = state.scriptDevelopment.projects.find((p) => p.conceptId === conceptId)!
  state = applyActions(state, [{ kind: 'acceptScript', projectId: project.id }])
  return { state, projectId: project.id }
}

/**
 * Two Ready screenplays and a contended actor: project A's lead/antagonist
 * evidence is captured while the tested actor (actors[0]) is still free, then
 * project B is greenlit reusing that exact actor (plus two untested actors) —
 * so project A (still Ready, never greenlit) keeps its evidence for a candidate
 * who is now busy on a DIFFERENT production. Mirrors the "preserves evidence
 * when availability changes" fixture in tests/casting-sessions-actions.test.ts.
 */
function buildContendedFixture(seed: string): {
  state: GameState
  projectAId: string
  actorIds: string[]
} {
  let state = managedStudio(seed, { actor: 6, director: 2, craft: 2, writer: 2 })
  const actors = contractedByRole(state, 'actor')
  const directors = contractedByRole(state, 'director')
  const crafts = contractedByRole(state, 'craft')
  const writers = contractedByRole(state, 'writer')
  const actorIds = actors.map((a) => a.id)

  const conceptA = state.concepts[0]!
  const conceptB = state.concepts[1]!

  state = applyActions(state, [
    { kind: 'commissionScript', project: commissionPayload(state, conceptA.id, writers[0]!.id) },
  ])
  state = tick(state)
  const projectA = state.scriptDevelopment.projects.find((p) => p.conceptId === conceptA.id)!
  state = applyActions(state, [{ kind: 'acceptScript', projectId: projectA.id }])

  state = applyActions(state, [
    { kind: 'commissionScript', project: commissionPayload(state, conceptB.id, writers[1]!.id) },
  ])
  state = tick(state)
  const projectB = state.scriptDevelopment.projects.find((p) => p.conceptId === conceptB.id)!
  state = applyActions(state, [{ kind: 'acceptScript', projectId: projectB.id }])

  // Audition project A with actors[0..2]. actors[3]/[4] stay free for now.
  state = applyActions(state, [
    { kind: 'startCastingSession', session: auditionSlate(state, projectA.id, 0) },
  ])
  state = tick(state)
  const sessionA = state.castingSessions.sessions.find((s) => s.projectId === projectA.id)!
  state = applyActions(state, [{ kind: 'acknowledgeCastingSession', sessionId: sessionA.id }])

  // Greenlight project B reusing actors[0] (tested for A's lead+antagonist) plus
  // two untested actors — this makes actors[0]/[3]/[4] busy on a DIFFERENT picture.
  state = applyActions(state, [
    {
      kind: 'greenlightScriptProject',
      production: {
        projectId: projectB.id,
        directorId: directors[0]!.id,
        craftIds: [crafts[0]!.id],
        cast: {
          lead: actors[0]!.id,
          antagonist: actors[3]!.id,
          support: actors[4]!.id,
        } satisfies Record<CastSlot, string>,
        budget: { negative: conceptB.baseNegativeCost, marketing: 0 },
      },
    },
  ])

  return { state, projectAId: projectA.id, actorIds }
}

function findPool(view: ReturnType<typeof castingPackageReadModel>, projectId: string, role: string) {
  const project = view.projects.find((p) => p.projectId === projectId)!
  return project.pools.find((p) => p.role === role)!
}

// ── (a) closed projection ────────────────────────────────────────────────────

describe('castingPackageReadModel — closed projection', () => {
  it('never leaks actual/persona/temperament/teamDirection/rngState/seed/ceiling', () => {
    const { state } = buildContendedFixture('cpr-closed-projection')
    const view = castingPackageReadModel(state)
    const serialized = JSON.stringify(view)
    for (const banned of [
      /\bactual\b/i,
      /\bpersona\b/i,
      /\btemperament\b/i,
      /teamDirection/i,
      /\brngState\b/i,
      /\bseed\b/i,
      /\bceiling\b/i,
    ]) {
      expect(serialized).not.toMatch(banned)
    }
  })
})

// ── (b) ovr/fit/ep parity ────────────────────────────────────────────────────

describe('castingPackageReadModel — candidate summaries mirror talentSummary directly', () => {
  it('director/lead candidates equal direct roleOVR/projectFit/expectedPerformance calls', () => {
    const { state, projectId } = readyStudio('cpr-parity')
    const view = castingPackageReadModel(state)
    const pkg = scriptProjectsReadModel(state).packages.find((p) => p.projectId === projectId)!
    const concept = state.concepts.find((c) => c.id === pkg.concept.id)!
    const shapeEffects = resolveShape(pkg.lockedShape)

    const directorPool = findPool(view, projectId, 'director')
    expect(directorPool.candidates.length).toBeGreaterThan(0)
    for (const candidate of directorPool.candidates) {
      const talent = state.talent.find((t) => t.id === candidate.talentId)!
      expect(candidate.ovr).toBe(roleOVR(talent, 'directing'))
      expect(candidate.fit).toBe(
        projectFit(talent, 'directing', concept, undefined, shapeEffects, pkg.lockedPromise, pkg.lockedShape),
      )
      expect(candidate.ep).toEqual(
        expectedPerformance(talent, 'directing', concept, undefined, shapeEffects, pkg.lockedPromise, pkg.lockedShape),
      )
    }

    const leadPool = findPool(view, projectId, 'lead')
    expect(leadPool.candidates.length).toBeGreaterThan(0)
    for (const candidate of leadPool.candidates) {
      const talent = state.talent.find((t) => t.id === candidate.talentId)!
      expect(candidate.ovr).toBe(roleOVR(talent, 'acting'))
      expect(candidate.fit).toBe(
        projectFit(talent, 'acting', concept, 'lead', shapeEffects, pkg.lockedPromise, pkg.lockedShape),
      )
      expect(candidate.ep).toEqual(
        expectedPerformance(talent, 'acting', concept, 'lead', shapeEffects, pkg.lockedPromise, pkg.lockedShape),
      )
    }
  })
})

// ── (c) pool legality ────────────────────────────────────────────────────────

describe('castingPackageReadModel — pool legality', () => {
  it('every candidate sits in the pool matching their PRIMARY role', () => {
    const { state, projectId } = readyStudio('cpr-primary-role')
    const view = castingPackageReadModel(state)
    const project = view.projects.find((p) => p.projectId === projectId)!
    const expectedPrimary: Record<string, string> = {
      director: 'director',
      lead: 'actor',
      antagonist: 'actor',
      support: 'actor',
      craftLead: 'craft',
    }
    for (const pool of project.pools) {
      for (const candidate of pool.candidates) {
        const talent = state.talent.find((t) => t.id === candidate.talentId)!
        expect(talent.role).toBe(expectedPrimary[pool.role])
      }
    }
  })

  it('the locked screenplay writer never appears in any of their own project pools', () => {
    const { state, projectId } = readyStudio('cpr-locked-writer')
    const view = castingPackageReadModel(state)
    const project = view.projects.find((p) => p.projectId === projectId)!
    for (const pool of project.pools) {
      expect(pool.candidates.some((c) => c.talentId === project.writerId)).toBe(false)
    }
  })

  it('busy talent stays VISIBLE as unavailable rows with a return week; evidence rides along when it exists', () => {
    const { state, projectAId, actorIds } = buildContendedFixture('cpr-busy-pool-legality')
    const view = castingPackageReadModel(state)
    const project = view.projects.find((p) => p.projectId === projectAId)!

    const leadPool = project.pools.find((p) => p.role === 'lead')!
    const antagonistPool = project.pools.find((p) => p.role === 'antagonist')!
    const supportPool = project.pools.find((p) => p.role === 'support')!

    // P05A.3 §12 overturned the old exclusion law: actors[3]/[4] became busy on
    // project B and were NEVER tested for project A — before P05A.3 they were
    // omitted entirely, and the Owner could not see WHO was coming back WHEN.
    // Now every busy same-role actor is a visible row: unavailable, no
    // evidence, and carrying the authoritative return week.
    const busyUntested = [actorIds[3]!, actorIds[4]!]
    for (const pool of [leadPool, antagonistPool, supportPool]) {
      for (const id of busyUntested) {
        const row = pool.candidates.find((c) => c.talentId === id)
        expect(row, `busy actor ${id} must be a visible row in ${pool.role}`).toBeDefined()
        expect(row!.available).toBe(false)
        expect(row!.evidence).toBeNull()
        expect(row!.returnWeek).not.toBeNull()
      }
    }

    // actors[0] became busy on project B too, but WAS tested (lead + antagonist)
    // for project A — evidence keeps them visible, marked unavailable.
    const testedBusyId = actorIds[0]!
    const leadCandidate = leadPool.candidates.find((c) => c.talentId === testedBusyId)
    expect(leadCandidate).toBeDefined()
    expect(leadCandidate!.available).toBe(false)
    expect(leadCandidate!.availabilityLabel).toMatch(/currently assigned/i)
    expect(leadCandidate!.evidence).not.toBeNull()

    const antagonistCandidate = antagonistPool.candidates.find((c) => c.talentId === testedBusyId)
    expect(antagonistCandidate).toBeDefined()
    expect(antagonistCandidate!.available).toBe(false)
    expect(antagonistCandidate!.evidence).not.toBeNull()

    // actors[1]/[2] were tested but never made busy — they remain available.
    const stillFreeId = actorIds[1]!
    const stillFreeCandidate =
      leadPool.candidates.find((c) => c.talentId === stillFreeId) ??
      supportPool.candidates.find((c) => c.talentId === stillFreeId)
    expect(stillFreeCandidate).toBeDefined()
    expect(stillFreeCandidate!.available).toBe(true)
  })
})

// ── (d) cost parity ──────────────────────────────────────────────────────────

describe('castingPackageReadModel — cost parity', () => {
  it('assignmentProjectCost: contracted -> 0, freelancer -> fee, disengaged -> salary', () => {
    const disengaged = generateWorld('cpr-cost-disengaged')
    expect(economyEngaged(disengaged)).toBe(false)
    const someone = disengaged.talent[0]!
    expect(assignmentProjectCost(disengaged, someone.id)).toBe(someone.salary)

    const engaged = managedStudio('cpr-cost-engaged')
    expect(economyEngaged(engaged)).toBe(true)
    const contractedActor = contractedByRole(engaged, 'actor')[0]!
    expect(assignmentProjectCost(engaged, contractedActor.id)).toBe(0)
    expect(isContracted(engaged, contractedActor.id)).toBe(true)

    const marketId = freelancerMarketIds(engaged)[0]
    expect(marketId).toBeDefined()
    const marketTalent = engaged.talent.find((t) => t.id === marketId)!
    expect(assignmentProjectCost(engaged, marketId!)).toBe(freelancerFee(engaged, marketTalent))
  })

  it('every read-model candidate\'s projectCostAmount equals assignmentProjectCost, with the matching label', () => {
    const { state, projectId } = readyStudio('cpr-cost-parity-readmodel')
    const view = castingPackageReadModel(state)
    const project = view.projects.find((p) => p.projectId === projectId)!
    for (const pool of project.pools) {
      for (const candidate of pool.candidates) {
        expect(candidate.projectCostAmount).toBe(assignmentProjectCost(state, candidate.talentId))
        if (candidate.contractBadge === 'studio') {
          expect(candidate.projectCostAmount).toBe(0)
          expect(candidate.projectCostLabel).toBe('On studio payroll')
        } else {
          const talent = state.talent.find((t) => t.id === candidate.talentId)!
          expect(candidate.projectCostAmount).toBe(freelancerFee(state, talent))
        }
      }
    }
  })
})

// ── (e) menu parity ──────────────────────────────────────────────────────────

describe('castingPackageReadModel — menu parity', () => {
  it('negativeOptions mirrors NEGATIVE_BUDGET_MULTIPLIERS x requiredNegative; marketingOptions mirrors marketingLevelsFor', () => {
    const { state, projectId } = readyStudio('cpr-menu-parity')
    const view = castingPackageReadModel(state)
    const project = view.projects.find((p) => p.projectId === projectId)!
    const pkg = scriptProjectsReadModel(state).packages.find((p) => p.projectId === projectId)!
    const concept = state.concepts.find((c) => c.id === pkg.concept.id)!

    const reqNeg = requiredNegative(concept, pkg.lockedShape, state)
    const expectedNegative = NEGATIVE_BUDGET_MULTIPLIERS.map((m) => Math.round(m * reqNeg))
    expect(project.negativeOptions.map((o) => o.amount)).toEqual(expectedNegative)
    for (const option of project.negativeOptions) {
      expect(option.label.length).toBeGreaterThan(0)
    }

    const expectedMarketing = marketingLevelsFor(state, null)
    expect(project.marketingOptions.map((o) => o.amount)).toEqual([...expectedMarketing])
    for (const option of project.marketingOptions) {
      expect(option.label.length).toBeGreaterThan(0)
    }
  })
})

// ── (f) signal caps ──────────────────────────────────────────────────────────

describe('castingPackageReadModel — public signal caps', () => {
  it('every candidate carries <=2 positive, <=1 concern, <=1 action, all non-empty text', () => {
    const { state, projectId } = readyStudio('cpr-signal-caps')
    const view = castingPackageReadModel(state)
    const project = view.projects.find((p) => p.projectId === projectId)!
    let sawAnySignal = false
    for (const pool of project.pools) {
      for (const candidate of pool.candidates) {
        const positives = candidate.signals.filter((s) => s.kind === 'positive')
        const concerns = candidate.signals.filter((s) => s.kind === 'concern')
        const actions = candidate.signals.filter((s) => s.kind === 'action')
        expect(positives.length).toBeLessThanOrEqual(2)
        expect(concerns.length).toBeLessThanOrEqual(1)
        expect(actions.length).toBeLessThanOrEqual(1)
        for (const signal of candidate.signals) {
          expect(signal.text.length).toBeGreaterThan(0)
          sawAnySignal = sawAnySignal || true
        }
      }
    }
    expect(sawAnySignal).toBe(true)
  })
})

// ── (g) evidence persists across availability changes ───────────────────────

describe('castingPackageReadModel — evidence persistence', () => {
  it('a tested candidate who becomes busy keeps evidence, available=false, and a reason', () => {
    const { state, projectAId, actorIds } = buildContendedFixture('cpr-evidence-persistence')
    const view = castingPackageReadModel(state)
    const leadPool = findPool(view, projectAId, 'lead')
    const candidate = leadPool.candidates.find((c) => c.talentId === actorIds[0]!)!
    expect(candidate).toBeDefined()
    expect(candidate.evidence).not.toBeNull()
    expect(candidate.evidence!.slot).toBe('lead')
    expect(candidate.evidence!.sessionId.length).toBeGreaterThan(0)
    expect(candidate.available).toBe(false)
    expect(candidate.availabilityLabel.length).toBeGreaterThan(0)
  })
})

// ── (h) determinism ──────────────────────────────────────────────────────────

describe('castingPackageReadModel — determinism', () => {
  it('two calls on the same state produce deep-equal output', () => {
    const { state } = buildContendedFixture('cpr-determinism')
    const first = castingPackageReadModel(state)
    const second = castingPackageReadModel(state)
    expect(second).toEqual(first)
  })
})
