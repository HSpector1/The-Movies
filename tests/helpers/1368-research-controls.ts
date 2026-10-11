// Accepted genuine historical inputs; only the original leaf authors synthetic cutting state.
import { expect } from 'vitest'
import { accepted45 } from './1368-recovery-witnesses.js'
import { rivalScientistDemand } from '../../src/core/rivalResearch.js'
import { tick } from '../../src/core/tick.js'
import { makeSave, validateSaveV46, stableStringify } from '../../src/core/save.js'
import type { GameState } from '../../src/core/types.js'
import type { RivalBusiness } from '../../src/core/hollywoodTypes.js'

function admitted(input: GameState): void {
  const before = stableStringify(input), envelope = makeSave(input)
  expect(validateSaveV46(envelope)).toBe(envelope)
  expect(stableStringify(input)).toBe(before)
}
function idle(input: GameState, b: RivalBusiness): boolean {
  return b.costCutting.since === null && b.productions.length === 0 && b.runs.length === 0
    && !input.talentMarket.proposals.some(p => p.issuerStudioId === b.studioId)
}
export function demandBoundary265() {
  const input = accepted45('baseline265').live.state
  expect(input.market.tick).toBe(265); admitted(input)
  const before = stableStringify(input)
  // Whole-input demand is the original pure-policy control. This does not claim
  // this owner still needs Scientists after an earlier owner starts research.
  const owner = input.hollywood!.businesses.find(b => idle(input, b)
    && rivalScientistDemand(input, input.hollywood!, b, input.talent, 265) > 0)
  expect(owner, 'UNMET accepted265 idle whole-input demand premise').toBeDefined()
  expect(stableStringify(input)).toBe(before)
  return { input, id: owner!.studioId }
}
export function activeResearchBoundary267() {
  const input = accepted45('research').live.state
  expect(input.market.tick).toBe(267); admitted(input)
  const before = stableStringify(input), control = tick(input)
  expect(stableStringify(input)).toBe(before); admitted(control)
  expect(control.market.tick).toBe(268)
  const owner = input.hollywood!.businesses.find(b => idle(input, b)
    && input.technology.projects.some(p => p.studioId === b.studioId && p.status === 'active'
      && control.technology.projects.some(n => n.id === p.id && n.status === 'active' && n.verifiedWork > p.verifiedWork)))
  expect(owner, 'UNMET accepted267 idle project progressing at268 premise').toBeDefined()
  return { input, control, id: owner!.studioId }
}
