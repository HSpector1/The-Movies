import { describe, expect, it } from 'vitest'
import { validateAbsorbedProductionStops } from '../src/core/absorbedWork.js'
import { productionPhaseForRemainingTicks } from '../src/core/operations.js'
import type { GameState } from '../src/core/types.js'
import type { RivalBusiness } from '../src/core/hollywoodTypes.js'
import type { AbsorptionRecord } from '../src/core/rights.js'

// Constructed validator boundary. The genuine drafting171 file separately proves save/reload/replay.
function boundary() {
  const business = {
    studioId: 'target',
    productions: [{ id: 'film', conceptId: 'concept', writerId: 'writer', directorId: 'director', craftIds: [],
      cast: { lead: 'actor-z', antagonist: 'actor-a', support: 'actor-support' }, startTick: 10, remainingTicks: 8 }],
    development: { projects: [{ id: 'script', status: 'inProduction', productionId: 'film', conceptId: 'concept' }] },
    projects: [{ scriptProjectId: 'script', productionId: 'film', conceptId: 'concept', announcedWeek: 10 }],
  } as unknown as RivalBusiness
  const transaction = {
    targetId: 'target', week: 11, continuedProductions: [],
    contracts: [
      { talentId: 'actor-z', sourceContractId: 'contract-z', buyerContractId: null },
      { talentId: 'actor-a', sourceContractId: 'contract-a', buyerContractId: null },
      { talentId: 'writer', sourceContractId: 'contract-writer', buyerContractId: 'buyer-writer' },
    ],
    stoppedProductions: [{ productionId: 'film', scriptProjectId: 'script', remainingTicks: 8,
      phase: productionPhaseForRemainingTicks(8), reason: 'missingParticipants', blockedCapability: null,
      missingParticipants: ['actor-z', 'actor-a'] }],
  } as unknown as AbsorptionRecord
  const state = { hollywood: { employment: ['z', 'a'].map(id => ({ contractId: `contract-${id}`,
    studioId: 'target', terms: { talentId: `actor-${id}` }, endedWeek: 11 })) } } as unknown as GameState
  return { state, business, transaction }
}

describe('P16 stopped participant membership survives canonical cast-key ordering', () => {
  it('accepts reordered cast keys without changing any source or transaction bytes', () => {
    const b = boundary()
    expect(() => validateAbsorbedProductionStops(b.state, b.business, b.transaction)).not.toThrow()
    b.business.productions[0]!.cast = { antagonist: 'actor-a', lead: 'actor-z', support: 'actor-support' }
    const before = JSON.stringify(b)
    expect(() => validateAbsorbedProductionStops(b.state, b.business, b.transaction)).not.toThrow()
    expect(JSON.stringify(b)).toBe(before)
  })

  for (const [label, ids] of [
    ['omitted participant', ['actor-z']],
    ['duplicate participant', ['actor-z', 'actor-z']],
    ['retained participant substituted', ['actor-z', 'writer']],
    ['invented participant', ['actor-z', 'stranger']],
  ] as const) {
    it(`still refuses ${label} without mutation`, () => {
      const b = boundary()
      b.transaction.stoppedProductions[0]!.missingParticipants = [...ids]
      const before = JSON.stringify(b)
      expect(() => validateAbsorbedProductionStops(b.state, b.business, b.transaction))
        .toThrow(/absorption work: (missing-participant cancellation differs|invented missing participant)/)
      expect(JSON.stringify(b)).toBe(before)
    })
  }
})
