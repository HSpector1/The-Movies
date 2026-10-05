// Strict selector over the independently measured low-market public-migration input.
// The original B leaf retains its five restriction assertions and synthetic-since control.
import { expect } from 'vitest'
import { lowMarketResearch277, researchCommitments } from './1368-lowmarket-research-boundary.js'

export function lowMarketResearchControl(kind: 'replacement' | 'project' | 'seat') {
  // The shared builder validates actual paid operations and returns independent clones.
  const { input, control } = lowMarketResearch277()
  expect(input.market.tick).toBe(277); expect(control.market.tick).toBe(278)
  const owner = input.hollywood!.businesses.find(b => {
    if (b.costCutting.since !== null || b.productions.length || b.runs.length
      || input.talentMarket.proposals.some(p => p.issuerStudioId === b.studioId)) return false
    const before = researchCommitments(input, b.studioId), after = researchCommitments(control, b.studioId)
    if (kind === 'replacement') return after.employment.slice(before.employment.length).some(e => e.reason === 'replacement')
    if (kind === 'project') return after.projects.length > before.projects.length
    return after.seats.length > before.seats.length
  })
  expect(owner, `UNMET LOWMARKET277 PREMISE: idle null-since ${kind} positive under actual unchanged quotes; no fallback`).toBeDefined()
  return { input, control, id: owner!.studioId }
}
