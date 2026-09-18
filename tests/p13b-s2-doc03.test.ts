import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { activeContract, weeklySalary } from '../src/core/employment.js'
import { blueprintById } from '../src/core/placement.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { ResearchProject, TechnologyId } from '../src/core/technologyTypes.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo } from '../src/harness/p13a/fixtures.js'
import { p13bTwoLabWorld } from '../src/harness/p13b/fixtures.js'

// P13B-S2 plan test 5 (task expansion, 2026-09-16): document 03's matched
// [780,832) allocation fixture, reproduced through the REAL scheduler (actions +
// tick), not accepted on the document's own word. Companion source:
// docs/engineering/playability-launch-review/../p13b-launch-review/03-PAPER-ECONOMICS.md
// "Allocation: matched 52-week fixture [780,832)" (SHA-verified copy read before
// authoring). The 06-CURRENT-OPS-CORRECTION-AND-DISPOSITION.md Post/stage/lighting
// Opex correction (+$12,000/row) is NOT exercised here — Post, stage and lighting
// deployment operation are S5 scope (physical deployment), not this Laboratory
// research slice.
//
// FINDING (already recorded in CONTINUATION-STATE.md before this file was
// authored): document 03's residual fixture ("52 units already verified... at
// week 780") is UNLAWFUL in the real timeline, because lighting-control-01's own
// `researchableWeek` is 780 (technologyCatalogue.ts) — no lawful receipt can
// exist before research opens, so "52 verified at 780" cannot be reached. The
// two residual routes below instead run the lawful nine-week prehistory the
// document itself describes (eight fully funded four-seat weeks then one
// zero-ceiling four-seat week, 48+4=52 units) starting at 780, landing the same
// 52-verified/12-remaining state at week 789. Every date the document states for
// those two rows is reproduced here at exactly +9 absolute weeks; every
// route-to-route DIFFERENCE (R&D, knowledge deltas) is asserted unchanged from
// the document. This is the recorded finding being reproduced, not a deviation.
//
// Whether the other four people (never touched by the residual prehistory) are
// "hired at 780 or 789" is left to this test's choice by the brief: in this
// generated world every one of the eight named candidates is already recruited
// at week 780 by `p13bTwoLabWorld()` itself (a fixture fact, not a per-route
// choice) — so payroll assertions below reflect all eight being employed from
// 780 in every route, including the residual ones. This is recorded here, not
// silently assumed.

const PROJECT_UNIT = 160_000

function projectUnits(rawA: number, rawB: number): number {
  const [a, b] = rawA >= rawB ? [rawA, rawB] : [rawB, rawA]
  return 8 * a + 5 * b
}

/** Every non-final receipt must hit the exact fixed-point law; only a project's
 * last (completing) receipt may fall short of the natural 8a+5b (or 8a, one
 * Laboratory) value, since the plan states the final week caps UNITS while still
 * charging the full spend. Cumulative units must always round-trip to
 * verifiedWork over PROJECT_UNIT (1/160,000). */
function assertFixedPoint(project: ResearchProject): void {
  let cumulative = 0
  project.weeks.forEach((r, i) => {
    cumulative += r.units
    if (r.labs === null) return // a pre-cooperation legacy receipt: not this law's subject
    const natural = r.labs.length === 1 ? 8 * r.labs[0]!.rawUnits : projectUnits(r.labs[0]!.rawUnits, r.labs[1]!.rawUnits)
    const isLast = i === project.weeks.length - 1 && project.completedWeek !== null
    if (isLast) expect(r.units).toBeLessThanOrEqual(natural)
    else expect(r.units).toBe(natural)
  })
  expect(cumulative).toBe(Math.round(project.verifiedWork * PROJECT_UNIT))
}

/** 8 people over the horizon, minus the person-weeks actually named in a worked
 * receipt within it — the plan's own definition, computed from receipts, not
 * inferred from status. */
function idlePersonWeeks(state: GameState, projectIds: string[], fromWeek: number, throughWeek: number): number {
  const worked = projectIds.reduce((sum, id) => {
    const project = state.technology.projects.find(p => p.id === id)!
    return sum + project.weeks.filter(r => r.week >= fromWeek && r.week < throughWeek).reduce((s, r) => s + r.seatTalentIds.length, 0)
  }, 0)
  return 8 * (throughWeek - fromWeek) - worked
}

function researchSpendInWindow(state: GameState, projectId: string, fromWeek: number, throughWeek: number): number {
  return state.ledger
    .filter(e => e.kind === 'researchSpend' && e.note === `research:${projectId}` && e.week >= fromWeek && e.week < throughWeek)
    .reduce((sum, e) => sum - e.amount, 0)
}

/** Bounded so a genuine scheduler defect (e.g. a zero-output stall) fails fast
 * with a clear message instead of hanging this slow 2-core host. */
function advanceUntilComplete(state: GameState, projectId: string, maxWeeks = 60): GameState {
  let s = state
  for (let i = 0; i < maxWeeks; i++) {
    if (s.technology.projects.find(p => p.id === projectId)!.completedWeek !== null) return s
    s = tick(s)
  }
  const p = s.technology.projects.find(p => p.id === projectId)!
  if (p.completedWeek === null) throw new Error(`advanceUntilComplete: ${projectId} did not complete within ${maxWeeks} weeks (verifiedWork=${p.verifiedWork})`)
  return s
}

describe('P13B-S2 document 03 [780,832) through the real scheduler (test 5)', () => {
  let world: ReturnType<typeof p13bTwoLabWorld>
  let lab1: string, lab2: string

  function seatAndBegin(state: GameState, technologyId: TechnologyId, ids1: string[], ids2: string[], budgetPerWeek: number): { state: GameState; projectId: string } {
    let s = state
    if (ids1.length) s = applyActions(s, ids1.map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab1, scientistId, technologyId })))
    if (ids2.length) s = applyActions(s, ids2.map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId })))
    const projectId = s.technology.projects.find(p => p.technologyId === technologyId && p.studioId === s.hollywood!.playerStudioId)!.id
    s = applyActions(s, [{ kind: 'beginResearch', projectId, budgetPerWeek }])
    return { state: s, projectId }
  }
  function release(state: GameState, projectId: string, ids: string[]): GameState {
    return applyActions(state, ids.map(scientistId => ({ kind: 'releaseResearchSeat' as const, projectId, scientistId })))
  }
  function reseatAndResume(state: GameState, technologyId: TechnologyId, projectId: string, ids1: string[], ids2: string[], budgetPerWeek: number): GameState {
    let s = state
    if (ids1.length) s = applyActions(s, ids1.map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab1, scientistId, technologyId })))
    if (ids2.length) s = applyActions(s, ids2.map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId })))
    s = applyActions(s, [{ kind: 'setResearchBudget', projectId, budgetPerWeek }])
    return applyActions(s, [{ kind: 'resumeResearch', projectId }])
  }
  /** The lawful nine-week prehistory (this file's FINDING): four people on
   * lighting from 780, eight fully funded four-seat weeks (48 units) then one
   * zero-ceiling four-seat week (4 units) = 52 verified at 789. Releases the
   * four seats (auto-pausing the project) so both Laboratories are free for the
   * two branches that follow. Every call gets its own fresh branch of
   * `world.state`, per this file's own "never mutate the shared world" rule. */
  function buildResidualPrehistory(ids4: string[]): { state: GameState; projectId: string } {
    let s = applyActions(world.state, ids4.map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab1, scientistId, technologyId: 'lighting-control-01' as const })))
    const projectId = s.technology.projects.find(p => p.technologyId === 'lighting-control-01' && p.studioId === s.hollywood!.playerStudioId)!.id
    s = applyActions(s, [{ kind: 'beginResearch', projectId, budgetPerWeek: 40_000 }])
    for (let i = 0; i < 8; i++) s = tick(s) // 780..787 worked: eight fully funded four-seat weeks, 48 units
    s = applyActions(s, [{ kind: 'setResearchBudget', projectId, budgetPerWeek: 0 }])
    s = tick(s) // 788 worked: one zero-ceiling four-seat week, 4 units -> 52 total; market.tick now 789
    const prehistory = s.technology.projects.find(p => p.id === projectId)!
    if (prehistory.verifiedWork !== 52 || prehistory.completedWeek !== null || s.market.tick !== 789) {
      throw new Error(`buildResidualPrehistory: did not land at the expected 52 verified / week 789 boundary (verifiedWork=${prehistory.verifiedWork}, completedWeek=${prehistory.completedWeek}, tick=${s.market.tick})`)
    }
    s = release(s, projectId, ids4) // frees Lab 1's seat slots; the project auto-pauses; verifiedWork/expenditure retained
    if (s.technology.projects.find(p => p.id === projectId)!.status !== 'paused') throw new Error('buildResidualPrehistory: did not auto-pause on release of its last eligible seats')
    return { state: s, projectId }
  }

  type Route = { state: GameState; soundId: string; lightId: string }
  let cooperateFull: Route, splitFull: Route, cooperateResidual: Route, splitResidual: Route

  beforeAll(() => {
    world = p13bTwoLabWorld()
    ;[lab1, lab2] = world.laboratoryFacilityIds
    const ids = world.candidateIds

    // ── cooperate sound then light ──────────────────────────────────────────
    {
      const sound = seatAndBegin(world.state, 'synchronized-sound', ids.slice(0, 4), ids.slice(4, 8), 80_000)
      const soundDone = advanceUntilComplete(sound.state, sound.projectId)
      const released = release(soundDone, sound.projectId, ids)
      const light = seatAndBegin(released, 'lighting-control-01', ids.slice(0, 4), ids.slice(4, 8), 80_000)
      const lightDone = advanceUntilComplete(light.state, light.projectId)
      cooperateFull = { state: advanceTo(lightDone, 832), soundId: sound.projectId, lightId: light.projectId }
    }
    // ── split sound and light ───────────────────────────────────────────────
    {
      const sound = seatAndBegin(world.state, 'synchronized-sound', ids.slice(0, 4), [], 40_000)
      const light = seatAndBegin(sound.state, 'lighting-control-01', [], ids.slice(4, 8), 40_000)
      let s = advanceUntilComplete(light.state, sound.projectId)
      s = advanceUntilComplete(s, light.projectId)
      splitFull = { state: advanceTo(s, 832), soundId: sound.projectId, lightId: light.projectId }
    }
    // ── cooperate sound then residual light (+9 shift) ──────────────────────
    {
      const pre = buildResidualPrehistory(ids.slice(0, 4))
      const sound = seatAndBegin(pre.state, 'synchronized-sound', ids.slice(0, 4), ids.slice(4, 8), 80_000)
      const soundDone = advanceUntilComplete(sound.state, sound.projectId)
      const released = release(soundDone, sound.projectId, ids)
      const resumed = reseatAndResume(released, 'lighting-control-01', pre.projectId, ids.slice(0, 4), ids.slice(4, 8), 80_000)
      const lightDone = advanceUntilComplete(resumed, pre.projectId)
      cooperateResidual = { state: advanceTo(lightDone, 841), soundId: sound.projectId, lightId: pre.projectId }
    }
    // ── split sound and residual light (+9 shift) ───────────────────────────
    {
      const pre = buildResidualPrehistory(ids.slice(0, 4))
      const sound = seatAndBegin(pre.state, 'synchronized-sound', [], ids.slice(4, 8), 40_000)
      const resumed = reseatAndResume(sound.state, 'lighting-control-01', pre.projectId, ids.slice(0, 4), [], 40_000)
      let s = advanceUntilComplete(resumed, sound.projectId)
      s = advanceUntilComplete(s, pre.projectId)
      splitResidual = { state: advanceTo(s, 841), soundId: sound.projectId, lightId: pre.projectId }
    }
  }, 180_000)

  it('the paper-arithmetic components this route reconciles against are exactly the production TUNING/blueprint values', () => {
    // NOT a ledger read: the 'overhead' and 'facilityOpex' ledger kinds are each a
    // SINGLE whole-studio row per week (base + ALL contracted employees; every
    // operational placement) — see the FINDING in the cooperate-full block below.
    // These two figures are the document's per-fixture COMPONENTS, computed
    // directly from the same constants the engine itself charges, restricted to
    // exactly our eight people / six research bodies (two Laboratories, four
    // instrument modules).
    expect(TUNING.OVERHEAD_PER_EMPLOYEE * 8 * 52).toBe(624_000)
    const perWeek = blueprintById('research-laboratory')!.weeklyOperatingCost * 2
      + blueprintById('acoustic-instruments')!.weeklyOperatingCost * 2
      + blueprintById('electrical-control-instruments')!.weeklyOperatingCost * 2
    expect(perWeek * 52).toBe(728_000)
  })

  describe('cooperate sound then light', () => {
    it('knowledge (completedWeek) 787 / 794, R&D 1,120,000', () => {
      const { state, soundId, lightId } = cooperateFull
      expect(state.technology.projects.find(p => p.id === soundId)!.completedWeek).toBe(787)
      expect(state.technology.projects.find(p => p.id === lightId)!.completedWeek).toBe(794)
      const rd = researchSpendInWindow(state, soundId, 780, 832) + researchSpendInWindow(state, lightId, 780, 832)
      expect(rd).toBe(1_120_000)
    })

    it('idle person-weeks 304 over [780,832)', () => {
      const { state, soundId, lightId } = cooperateFull
      expect(idlePersonWeeks(state, [soundId, lightId], 780, 832)).toBe(304)
    })

    it('every receipt is fixed-point exact: units === 8a+5b (or 8a) except the last, and Σ units round-trips to verifiedWork', () => {
      const { state, soundId, lightId } = cooperateFull
      assertFixedPoint(state.technology.projects.find(p => p.id === soundId)!)
      assertFixedPoint(state.technology.projects.find(p => p.id === lightId)!)
    })

    it('reconciles salary over [780,832) to 832,000 via the researchPayroll ledger kind (one row/week, exact — all eight Scientists are the only ones in the game)', () => {
      const weeklySalaryTotal = world.candidateIds.reduce((sum, id) => sum + weeklySalary(activeContract(world.state, id)!.annualSalary), 0)
      expect(weeklySalaryTotal * 52).toBe(832_000)
      const rows = cooperateFull.state.ledger.filter(e => e.kind === 'researchPayroll' && e.week >= 780 && e.week < 832)
      expect(rows).toHaveLength(52)
      for (const row of rows) expect(-row.amount).toBe(weeklySalaryTotal)
    })

    it('FINDING: employment overhead and Labs/instruments operating cannot be isolated from the whole-studio overhead/facilityOpex ledger rows', () => {
      // Both 'overhead' (TUNING.OVERHEAD_BASE + TUNING.OVERHEAD_PER_EMPLOYEE *
      // state.contracts.length) and 'facilityOpex' (every operational placement)
      // are written as ONE combined row per week for the WHOLE generated studio,
      // not per-employee or per-facility (src/core/tick.ts:928-962). The
      // generated world (generateWorld + normal operations) carries other
      // employees and placed facilities beyond our eight Scientists and six
      // research bodies, so the real ledger totals are necessarily >= the
      // document's isolated per-fixture components and cannot be asserted EQUAL
      // to them without a studio fixture that has zero other staff/facilities.
      // Recorded here as the honest lower bound this world actually produces.
      const overheadTotal = cooperateFull.state.ledger.filter(e => e.kind === 'overhead' && e.week >= 780 && e.week < 832).reduce((sum, e) => sum - e.amount, 0)
      expect(overheadTotal).toBeGreaterThanOrEqual((TUNING.OVERHEAD_BASE + TUNING.OVERHEAD_PER_EMPLOYEE * 8) * 52)
      const facilityOpexTotal = cooperateFull.state.ledger.filter(e => e.kind === 'facilityOpex' && e.week >= 780 && e.week < 832).reduce((sum, e) => sum - e.amount, 0)
      expect(facilityOpexTotal).toBeGreaterThanOrEqual(728_000)
    })
  })

  describe('split sound and light', () => {
    it('knowledge (completedWeek) 791 / 791, R&D 880,000', () => {
      const { state, soundId, lightId } = splitFull
      expect(state.technology.projects.find(p => p.id === soundId)!.completedWeek).toBe(791)
      expect(state.technology.projects.find(p => p.id === lightId)!.completedWeek).toBe(791)
      const rd = researchSpendInWindow(state, soundId, 780, 832) + researchSpendInWindow(state, lightId, 780, 832)
      expect(rd).toBe(880_000)
    })

    it('idle person-weeks 328 over [780,832)', () => {
      const { state, soundId, lightId } = splitFull
      expect(idlePersonWeeks(state, [soundId, lightId], 780, 832)).toBe(328)
    })

    it('every receipt is fixed-point exact (single Laboratory each: units === 8a)', () => {
      const { state, soundId, lightId } = splitFull
      assertFixedPoint(state.technology.projects.find(p => p.id === soundId)!)
      assertFixedPoint(state.technology.projects.find(p => p.id === lightId)!)
    })
  })

  describe('residual routes (lawful nine-week prehistory, +9 absolute-week shift — see file header FINDING)', () => {
    it('cooperate sound then residual light: knowledge 796 / 798 (document 787/789 +9), R&D over the compared window [789,841) is 720,000', () => {
      const { state, soundId, lightId } = cooperateResidual
      expect(state.technology.projects.find(p => p.id === soundId)!.completedWeek).toBe(796)
      expect(state.technology.projects.find(p => p.id === lightId)!.completedWeek).toBe(798)
      const rd = researchSpendInWindow(state, soundId, 789, 841) + researchSpendInWindow(state, lightId, 789, 841)
      expect(rd).toBe(720_000)
    })

    it('cooperate residual: idle person-weeks 344 over [789,841)', () => {
      const { state, soundId, lightId } = cooperateResidual
      expect(idlePersonWeeks(state, [soundId, lightId], 789, 841)).toBe(344)
    })

    it('cooperate residual: every receipt is fixed-point exact (the light project also carries its nine pre-cooperation prehistory receipts, excluded from the compared-window R&D above but still fixed-point checked here)', () => {
      const { state, soundId, lightId } = cooperateResidual
      assertFixedPoint(state.technology.projects.find(p => p.id === soundId)!)
      assertFixedPoint(state.technology.projects.find(p => p.id === lightId)!)
    })

    it('split sound and residual light: knowledge 800 / 791 (document 791/782 +9), R&D over the compared window [789,841) is 520,000', () => {
      const { state, soundId, lightId } = splitResidual
      expect(state.technology.projects.find(p => p.id === soundId)!.completedWeek).toBe(800)
      expect(state.technology.projects.find(p => p.id === lightId)!.completedWeek).toBe(791)
      const rd = researchSpendInWindow(state, soundId, 789, 841) + researchSpendInWindow(state, lightId, 789, 841)
      expect(rd).toBe(520_000)
    })

    it('split residual: idle person-weeks 364 over [789,841)', () => {
      const { state, soundId, lightId } = splitResidual
      expect(idlePersonWeeks(state, [soundId, lightId], 789, 841)).toBe(364)
    })

    it('split residual: every receipt is fixed-point exact', () => {
      const { state, soundId, lightId } = splitResidual
      assertFixedPoint(state.technology.projects.find(p => p.id === soundId)!)
      assertFixedPoint(state.technology.projects.find(p => p.id === lightId)!)
    })
  })

  describe('cooperate-minus-split R&D differences match the document exactly', () => {
    it('full routes: 1,120,000 − 880,000 = 240,000', () => {
      const cooperateRD = researchSpendInWindow(cooperateFull.state, cooperateFull.soundId, 780, 832) + researchSpendInWindow(cooperateFull.state, cooperateFull.lightId, 780, 832)
      const splitRD = researchSpendInWindow(splitFull.state, splitFull.soundId, 780, 832) + researchSpendInWindow(splitFull.state, splitFull.lightId, 780, 832)
      expect(cooperateRD - splitRD).toBe(240_000)
    })

    it('residual routes: 720,000 − 520,000 = 200,000', () => {
      const cooperateRD = researchSpendInWindow(cooperateResidual.state, cooperateResidual.soundId, 789, 841) + researchSpendInWindow(cooperateResidual.state, cooperateResidual.lightId, 789, 841)
      const splitRD = researchSpendInWindow(splitResidual.state, splitResidual.soundId, 789, 841) + researchSpendInWindow(splitResidual.state, splitResidual.lightId, 789, 841)
      expect(cooperateRD - splitRD).toBe(200_000)
    })
  })
})
