import { describe, expect, it } from 'vitest'
import { generateWorld } from '../../../../src/core/index.ts'
import type { Contract, GameState } from '../../../../src/core/index.ts'
import {
  gateHiringEligibleCards,
  hiringMarketCards,
  studioLotSnapshot,
} from '../../engine/adapter.ts'
import type {
  BuildingState,
  LotGateHiringCandidate,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'
import {
  gateHiringCandidateContext,
  gateHiringMarketContext,
  sameGateHiringCandidateContext,
  type GateHiringCandidateContext,
} from './gateHiring.ts'

const CANDIDATE_FIELDS = [
  'talentId',
  'name',
  'creativeRole',
  'employmentStatus',
  'offerTermWeeks',
] as const

function candidate(
  overrides: Partial<LotGateHiringCandidate> = {},
): LotGateHiringCandidate {
  return {
    talentId: 'talent-a',
    name: 'Ada Vale',
    creativeRole: 'actor',
    employmentStatus: 'freeAgent',
    offerTermWeeks: [52, 104, 156, 208],
    ...overrides,
  }
}

function gateBuilding(
  count: number,
  overrides: Partial<BuildingState> = {},
): BuildingState {
  return {
    id: 'gate',
    available: true,
    attention: count === 0 ? 'empty' : 'active',
    attentionReason:
      count === 0
        ? 'No candidates with current contract terms'
        : `${String(count)} candidate${count === 1 ? '' : 's'} with current contract terms`,
    ...overrides,
  }
}

function snapshot(
  candidates: LotGateHiringCandidate[] = [candidate()],
  overrides: {
    week?: number
    sceneSeed?: string
    buildings?: StudioLotSnapshot['buildings']
    people?: StudioLotSnapshot['people']
    gateHiringMarket?: NonNullable<StudioLotSnapshot['gateHiringMarket']>
  } = {},
): StudioLotSnapshot {
  return {
    studioName: 'PROJECT: STUDIO',
    week: 13,
    cash: 20_000_000,
    cashBand: 'flush',
    standing: 'established',
    standingValues: { awareness: 50, prestige: 50, confidence: 50 },
    publicityOffers: [],
    annexWork: null,
    activeProductions: [],
    releasedFilms: [],
    releasePresence: 'none',
    latestReleaseTitle: null,
    people: [],
    buildings: [gateBuilding(candidates.length)],
    gateHiringMarket: { candidates },
    selectedBuildingId: null,
    sceneSeed: 'gate-selector',
    operationsMode: 'legacy',
    stageAssignmentAuthority: 'presentation',
    productionOperations: [],
    ...overrides,
  }
}

function allContractedState(seed: string): GameState {
  const state = generateWorld(seed)
  const contracts: Contract[] = state.talent.map((talent) => ({
    talentId: talent.id,
    annualSalary: 52_000,
    signingBonus: 0,
    startWeek: 0,
    endWeekExclusive: 52,
    termWeeks: 52,
  }))
  return { ...state, contracts, freeAgents: [] }
}

describe('Gate Hiring adapter authority', () => {
  it('projects only shared-helper eligible canonical cards with exact narrow fields', () => {
    const state = generateWorld('gate-hiring-projection')
    const before = JSON.stringify(state)
    const eligible = gateHiringEligibleCards(state)

    expect(eligible).not.toBeNull()
    const projected = studioLotSnapshot(state)
    expect(projected.gateHiringMarket?.candidates).toEqual(
      eligible!.map((card) => ({
        talentId: card.profile.id,
        name: card.profile.name,
        creativeRole: card.profile.role,
        employmentStatus: 'freeAgent',
        offerTermWeeks: card.employment.offerOptions.map((offer) => offer.termWeeks),
      })),
    )
    expect(
      projected.gateHiringMarket?.candidates.map((entry) => Object.keys(entry)),
    ).toEqual(eligible!.map(() => [...CANDIDATE_FIELDS]))
    expect(JSON.stringify(state)).toBe(before)

    const gate = projected.buildings.find((building) => building.id === 'gate')!
    const count = eligible!.length
    expect(gate).toMatchObject({
      available: true,
      attention: count === 0 ? 'empty' : 'active',
      attentionReason:
        count === 0
          ? 'No candidates with current contract terms'
          : `${String(count)} candidate${count === 1 ? '' : 's'} with current contract terms`,
    })
  })

  it('keeps the known freelancer-overlap/no-offer Hiring row out of Gate truth', () => {
    const state = generateWorld('audit-7')
    const first = hiringMarketCards(state)[0]!

    expect(first.employment.status).toBe('availableFreelancer')
    expect(first.employment.offerOptions).toEqual([])
    expect(gateHiringEligibleCards(state)?.some((card) => card.profile.id === first.profile.id)).toBe(false)
    expect(
      studioLotSnapshot(state).gateHiringMarket?.candidates.some(
        (entry) => entry.talentId === first.profile.id,
      ),
    ).toBe(false)
  })

  it('does not impose an eight-candidate ceiling when stored free agents prepend the sample', () => {
    const generated = generateWorld('gate-more-than-eight')
    const state = {
      ...generated,
      freeAgents: generated.talent.slice(0, 12).map((talent) => talent.id),
    }
    const eligible = gateHiringEligibleCards(state)

    expect(eligible).not.toBeNull()
    expect(eligible!.length).toBeGreaterThan(8)
    expect(studioLotSnapshot(state).gateHiringMarket?.candidates).toHaveLength(eligible!.length)
  })

  it('emits an exact empty market and empty Gate status', () => {
    const projected = studioLotSnapshot(allContractedState('gate-empty-market'))

    expect(projected.gateHiringMarket).toEqual({ candidates: [] })
    expect(projected.buildings.find((building) => building.id === 'gate')).toMatchObject({
      available: true,
      attention: 'empty',
      attentionReason: 'No candidates with current contract terms',
    })
    expect(gateHiringMarketContext(projected)?.candidates).toEqual([])
  })

  it('preserves a valid empty-string SaveFileV11 seed through projection and selection', () => {
    const state = generateWorld('')
    const projected = studioLotSnapshot(state)

    expect(projected.sceneSeed).toBe('')
    expect(gateHiringMarketContext(projected)?.studioSeed).toBe('')
  })

  it('fails closed on a duplicate underlying current talent identity', () => {
    const generated = generateWorld('gate-duplicate-identity')
    const duplicated = generated.talent.slice(0, 12)
    const withFreeAgents = {
      ...generated,
      freeAgents: duplicated.map((talent) => talent.id),
      // More duplicated market identities than the six-row freelancer sample
      // guarantees at least one otherwise-purported freeAgent contract row.
      talent: [...generated.talent, ...duplicated.map((talent) => ({ ...talent }))],
    }

    expect(
      hiringMarketCards(withFreeAgents).filter(
        (card) => card.employment.status === 'freeAgent' && card.employment.offerOptions.length > 0,
      ).length,
    ).toBeGreaterThan(0)
    expect(gateHiringEligibleCards(withFreeAgents)).toBeNull()
    expect(() => studioLotSnapshot(withFreeAgents)).toThrow(
      'studioLotSnapshot: invalid or ambiguous Gate Hiring authority',
    )
  })
})

describe('Gate Hiring strict snapshot selectors', () => {
  it('accepts exact canonical truth, preserves projection order, and requires explicit identity', () => {
    const second = candidate({
      talentId: 'talent-b',
      name: 'Ada Vale',
      creativeRole: 'director',
      offerTermWeeks: [52, 156],
    })
    const projected = snapshot([second, candidate()])
    const market = gateHiringMarketContext(projected)

    expect(market?.candidates).toBe(projected.gateHiringMarket?.candidates)
    expect(market?.candidates.map((entry) => entry.talentId)).toEqual(['talent-b', 'talent-a'])
    expect(gateHiringCandidateContext(projected, '')).toBeNull()
    expect(gateHiringCandidateContext(projected, 'missing')).toBeNull()
    expect(gateHiringCandidateContext(projected, 'talent-a')).toEqual({
      marketWeek: 13,
      candidate: candidate(),
      ownerIntent: {
        talentId: 'talent-a',
        studioSeed: 'gate-selector',
        name: 'Ada Vale',
        creativeRole: 'actor',
      },
    })
  })

  it('rejects missing/malformed projection and invalid seed or week without mutating', () => {
    const exact = snapshot()
    Object.freeze(exact.gateHiringMarket!.candidates[0]!.offerTermWeeks)
    Object.freeze(exact.gateHiringMarket!.candidates[0])
    Object.freeze(exact.gateHiringMarket!.candidates)
    Object.freeze(exact.gateHiringMarket)
    Object.freeze(exact.people)
    Object.freeze(exact.buildings)
    Object.freeze(exact)

    expect(gateHiringMarketContext(exact)).not.toBeNull()
    const missingProjection = { ...snapshot() }
    delete missingProjection.gateHiringMarket
    expect(gateHiringMarketContext(missingProjection)).toBeNull()
    expect(
      gateHiringMarketContext({
        ...snapshot(),
        gateHiringMarket: { candidates: [], unexpected: true } as never,
      }),
    ).toBeNull()
    expect(
      gateHiringMarketContext({ ...snapshot(), sceneSeed: null as unknown as string }),
    ).toBeNull()
    expect(gateHiringMarketContext({ ...snapshot(), week: -1 })).toBeNull()
    expect(gateHiringMarketContext({ ...snapshot(), week: 0.5 })).toBeNull()
    expect(gateHiringMarketContext({ ...snapshot(), week: Number.MAX_SAFE_INTEGER + 1 })).toBeNull()
  })

  it('rejects every missing, duplicate, unavailable, or status-mismatched Gate row', () => {
    const one = candidate()
    const invalid: StudioLotSnapshot[] = [
      snapshot([one], { buildings: [] }),
      snapshot([one], { buildings: [gateBuilding(1), gateBuilding(1)] }),
      snapshot([one], { buildings: [gateBuilding(1, { available: false })] }),
      snapshot([one], { buildings: [gateBuilding(1, { attention: 'empty' })] }),
      snapshot([one], { buildings: [gateBuilding(1, { attentionReason: '2 candidates with current contract terms' })] }),
      snapshot([], { buildings: [gateBuilding(0, { attention: 'active' })] }),
      snapshot([], { buildings: [gateBuilding(0, { attentionReason: 'No candidates' })] }),
    ]

    for (const hostile of invalid) expect(gateHiringMarketContext(hostile)).toBeNull()
  })

  it('rejects malformed/extra candidate fields and every invalid term identity', () => {
    const malformed: unknown[] = [
      { ...candidate(), unexpected: true },
      candidate({ talentId: '' }),
      candidate({ name: '   ' }),
      { ...candidate(), creativeRole: 'producer' },
      { ...candidate(), employmentStatus: 'availableFreelancer' },
      candidate({ offerTermWeeks: [] }),
      candidate({ offerTermWeeks: [0] }),
      candidate({ offerTermWeeks: [52, 52] }),
      candidate({ offerTermWeeks: [104, 52] }),
      candidate({ offerTermWeeks: [52, Number.MAX_SAFE_INTEGER + 1] }),
    ]

    for (const hostile of malformed) {
      expect(
        gateHiringMarketContext(
          snapshot([hostile as LotGateHiringCandidate]),
        ),
      ).toBeNull()
    }
  })

  it('rejects duplicate candidate identity and collision with authoritative Lot people', () => {
    const first = candidate()
    const duplicate = candidate({ name: 'Different display name' })
    expect(gateHiringMarketContext(snapshot([first, duplicate]))).toBeNull()

    expect(
      gateHiringMarketContext(
        snapshot([first], {
          people: [
            {
              id: first.talentId,
              name: first.name,
              role: 'talent',
              authority: 'district-managed',
              productionId: null,
              productionTitle: null,
            },
          ],
        }),
      ),
    ).toBeNull()
  })
})

describe('Gate Hiring rendered-token equality', () => {
  function exactContext(): GateHiringCandidateContext {
    return gateHiringCandidateContext(snapshot(), 'talent-a')!
  }

  it('accepts field-identical contexts and null only with null', () => {
    expect(sameGateHiringCandidateContext(exactContext(), exactContext())).toBe(true)
    expect(sameGateHiringCandidateContext(null, null)).toBe(true)
    expect(sameGateHiringCandidateContext(exactContext(), null)).toBe(false)
    expect(sameGateHiringCandidateContext(null, exactContext())).toBe(false)
  })

  it('rejects every independently changed projected or owner-intent field', () => {
    const base = exactContext()
    const changed: GateHiringCandidateContext[] = [
      { ...base, marketWeek: 14 },
      { ...base, candidate: { ...base.candidate, talentId: 'talent-b' } },
      { ...base, candidate: { ...base.candidate, name: 'Another name' } },
      { ...base, candidate: { ...base.candidate, creativeRole: 'writer' } },
      {
        ...base,
        candidate: {
          ...base.candidate,
          employmentStatus: 'availableFreelancer',
        } as unknown as LotGateHiringCandidate,
      },
      { ...base, candidate: { ...base.candidate, offerTermWeeks: [52, 104, 208] } },
      { ...base, ownerIntent: { ...base.ownerIntent, talentId: 'talent-b' } },
      { ...base, ownerIntent: { ...base.ownerIntent, studioSeed: 'another-studio' } },
      { ...base, ownerIntent: { ...base.ownerIntent, name: 'Another name' } },
      { ...base, ownerIntent: { ...base.ownerIntent, creativeRole: 'writer' } },
    ]

    for (const candidateContext of changed) {
      expect(sameGateHiringCandidateContext(base, candidateContext)).toBe(false)
    }
  })
})
