import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  contractOffer,
  generateWorld,
} from '../src/core/index.js'
import type {
  Contract,
  ContractOffer,
  CreativeRole,
  GameState,
} from '../src/core/index.js'
import {
  applyRenewalPolicy,
  createRenewalPolicyMemory,
  planRenewals,
  selectAffordableRoleCoverage,
} from '../src/harness/roster-wall/renewal.js'
import type { RenewalCandidate } from '../src/harness/roster-wall/renewal.js'

function candidate(id: string, role: CreativeRole, signingBonus: number): RenewalCandidate {
  const contract: Contract = {
    talentId: id,
    annualSalary: 520_000,
    signingBonus: 100_000,
    startWeek: 0,
    endWeekExclusive: 208,
    termWeeks: 208,
  }
  const offer: ContractOffer = {
    talentId: id,
    annualSalary: 520_000,
    signingBonus,
    termWeeks: 208,
    startWeek: 196,
    endWeekExclusive: 404,
  }
  return { contractKey: `${id}:0:208`, talentId: id, role, contract, offer }
}

function foundedRenewalFixture(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  if (state.founding === null) throw new Error('fixture founding draft missing')
  const applicantIds = new Set(state.founding.applicantIds)
  const roles: CreativeRole[] = ['actor', 'actor', 'actor', 'director', 'writer', 'craft']
  for (const role of roles) {
    const person = state.talent
      .filter((talent) => applicantIds.has(talent.id) && talent.role === role)
      .filter((talent) => !state.contracts.some((contract) => contract.talentId === talent.id))
      .sort((a, b) => {
        const aBonus = contractOffer(state, a.id, 208).signingBonus
        const bBonus = contractOffer(state, b.id, 208).signingBonus
        return aBonus - bBonus || a.id.localeCompare(b.id)
      })[0]
    if (person === undefined) throw new Error(`fixture has no ${role}`)
    state = applyActions(state, [
      { kind: 'signContract', talentId: person.id, termWeeks: 208 },
    ])
  }
  state = applyActions(state, [{ kind: 'foundStudio' }])
  return {
    ...state,
    market: { ...state.market, tick: 196 },
    studio: { ...state.studio, cash: 100_000_000 },
  }
}

describe('Week-208 roster-wall renewal policy', () => {
  it('selects the exact affordable founding-role subset before an extra headcount', () => {
    const candidates = [
      candidate('actor-a', 'actor', 10),
      candidate('actor-b', 'actor', 10),
      candidate('actor-c', 'actor', 10),
      candidate('actor-extra', 'actor', 100),
      candidate('director-a', 'director', 20),
      candidate('writer-a', 'writer', 20),
      candidate('craft-a', 'craft', 20),
    ]

    const below = selectAffordableRoleCoverage(candidates, 89)
    expect(below.completeFoundingMinimums).toBe(false)
    expect(below.headcount).toBe(5)
    expect(below.totalSigningBonus).toBeLessThanOrEqual(89)

    const exact = selectAffordableRoleCoverage(candidates, 90)
    expect(exact).toMatchObject({
      completeFoundingMinimums: true,
      rolesMeetingMinimum: 4,
      rolesCovered: 4,
      headcount: 6,
      totalSigningBonus: 90,
    })
    expect(exact.selectedTalentIds).not.toContain('actor-extra')
  })

  it('falls back from an impossible complete minimum to roles covered, then headcount and cost', () => {
    const candidates = [
      candidate('actor-expensive', 'actor', 40),
      candidate('actor-cheap', 'actor', 10),
      candidate('director-a', 'director', 20),
      candidate('writer-a', 'writer', 20),
      candidate('craft-a', 'craft', 20),
    ]

    const selection = selectAffordableRoleCoverage(candidates, 70)
    expect(selection.completeFoundingMinimums).toBe(false)
    expect(selection.rolesCovered).toBe(4)
    expect(selection.headcount).toBe(4)
    expect(selection.totalSigningBonus).toBe(70)
    expect(selection.selectedTalentIds).toEqual([
      'actor-cheap',
      'craft-a',
      'director-a',
      'writer-a',
    ])
  })

  it('keeps C1, C2, C4 and C5 ordering/timing semantics distinct', () => {
    const state = foundedRenewalFixture('roster-wall-planning')
    const memory = createRenewalPolicyMemory(196)

    const current = planRenewals(state, 'C1-current-retry-all', memory).plans
    expect(current).toHaveLength(6)
    expect(current.map((plan) => plan.talentId)).toEqual(
      [...current.map((plan) => plan.talentId)].sort(),
    )

    const cheapest = planRenewals(state, 'C2-cheapest-bonus-first', memory).plans
    expect(cheapest.map((plan) => plan.offer.signingBonus)).toEqual(
      [...cheapest.map((plan) => plan.offer.signingBonus)].sort((a, b) => a - b),
    )

    expect(planRenewals(state, 'C4-last-legal-role-first', memory).plans).toEqual([])

    const spread = planRenewals(state, 'C5-spread-role-first', memory)
    expect(spread.plans).toHaveLength(1)
    const schedules = Object.values(spread.memory.scheduleByContractKey)
      .map((schedule) => schedule.targetWeek)
      .sort((a, b) => a - b)
    expect(schedules).toEqual([196, 198, 200, 202, 204, 206])
  })

  it('uses mixed legal terms in stable role-selected order', () => {
    const state = foundedRenewalFixture('roster-wall-mixed')
    const step = planRenewals(
      state,
      'C6-mixed-term-role-first',
      createRenewalPolicyMemory(196),
    )

    expect(step.plans.map((plan) => plan.selectedTerm)).toEqual([52, 104, 156, 208, 52, 104])
    expect(new Set(Object.values(step.memory.mixedTermByTalentId))).toEqual(
      new Set([52, 104, 156, 208]),
    )
  })

  it('preserves the frozen C3 priority when mixed-term prices differ', () => {
    const baseline = foundedRenewalFixture('roster-wall-mixed-priority')
    const bonuses = baseline.contracts.map(
      (contract) => contractOffer(baseline, contract.talentId, 208).signingBonus,
    )
    const cashBoundaries = new Set<number>([0])
    for (let mask = 1; mask < 2 ** bonuses.length; mask++) {
      let total = 0
      for (let index = 0; index < bonuses.length; index++) {
        if ((mask & 2 ** index) !== 0) total += bonuses[index]!
      }
      cashBoundaries.add(total)
      cashBoundaries.add(Math.max(0, total - 1))
    }

    for (const cash of [...cashBoundaries].sort((a, b) => a - b)) {
      const state = { ...baseline, studio: { ...baseline.studio, cash } }
      const c3 = planRenewals(
        state,
        'C3-role-coverage-first',
        createRenewalPolicyMemory(196),
      ).plans
      const c6 = planRenewals(
        state,
        'C6-mixed-term-role-first',
        createRenewalPolicyMemory(196),
      ).plans
      expect(c6.map((plan) => plan.talentId), `cash ${String(cash)}`).toEqual(
        c3.map((plan) => plan.talentId),
      )
      expect(
        c6.map((plan) => plan.selectedForAffordableRoleSet),
        `cash ${String(cash)}`,
      ).toEqual(c3.map((plan) => plan.selectedForAffordableRoleSet))
    }
  })

  it('charges exactly one bonus and consumes no RNG for every accepted renewal', () => {
    const state = foundedRenewalFixture('roster-wall-public-action')
    const step = applyRenewalPolicy(
      state,
      'C1-current-retry-all',
      createRenewalPolicyMemory(196),
    )

    expect(step.intents).toHaveLength(6)
    expect(step.intents.every((intent) => intent.accepted)).toBe(true)
    expect(step.intents.every((intent) => intent.rngBefore === intent.rngAfter)).toBe(true)
    expect(step.intents.every((intent) => intent.signingBonusLedgerEntry?.kind === 'signingBonus')).toBe(
      true,
    )
    expect(step.state.ledger.length - state.ledger.length).toBe(6)
  })
})
