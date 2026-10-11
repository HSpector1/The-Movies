// Additive A8 follow-up to the reviewed Part A RED suite. No synthetic state or cash.
import { describe, expect, it, vi } from 'vitest'
import { tick, TUNING } from '../src/core/index.js'
import * as policyModule from '../src/core/hollywoodPolicy.js'
import { computeForecast } from '../src/core/forecast.js'
import { resolveShape } from '../src/core/shape.js'
import { marketingCapacityForInputs, marketingMenuFromCapacity } from '../src/core/marketingMenu.js'
import { isOpportunityPredicate } from '../src/core/opportunityPromises.js'
import { exportSave, importSave, makeSave, stableStringify, validateSaveV46 } from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
import { A8_ORDINAL, A8_SCRIPT, A8_STUDIO, a8Raw, a8Sha, loadA8, a8AccountInRecovery } from './p14d2-a8-fixture.js'
import type { A8Candidate } from './p14d2-a8-fixture.js'

type Args = Parameters<typeof policyModule.chooseIndustryPackage>
const business = (state: GameState) => state.hollywood!.businesses.find(b => b.studioId === A8_STUDIO)!

// Same independent enumeration used by A1/A2 and the accepted capture producer.
// Real planning/menu/forecast inputs, explicit permutations; no search output defines viability.
function enumerate([input, policy, options]: Args): A8Candidate[] {
  const planning = policyModule.perceivedPlanningInputs(input)
  const actors = [planning.cast.lead, planning.cast.antagonist, planning.cast.support]
  const rows: A8Candidate[] = []
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 3; c++) {
    if (a === b || a === c || b === c) continue
    const inp = { ...planning, shapeEffects: resolveShape(planning.shape), cast: { lead: actors[a]!, antagonist: actors[b]!, support: actors[c]! } }
    const required = inp.concept.baseNegativeCost * inp.shapeEffects.budgetDemandMultiplier * inp.era.costScale
    for (const scale of TUNING.HOLLYWOOD_NEGATIVE_CHOICES) {
      const negative = Math.round(required * scale * policy.negativeScale)
      const base = { ...inp, budget: { negative, marketing: 0 } }
      for (const marketing of marketingMenuFromCapacity(marketingCapacityForInputs(base, true))) {
        const f = computeForecast({ ...base, budget: { negative, marketing } }, {
          seed: options.seed, productionId: options.key, directorId: inp.director.id,
          releasedFilms: [], concepts: [inp.concept],
        }, true, true)
        const contribution = f.expectedTotal * TUNING.STUDIO_RENTAL_BLENDED - negative - marketing
        const preference = Math.abs(marketing / Math.max(negative, 1) - policy.marketingRatio) * TUNING.HOLLYWOOD_POLICY_PREFERENCE_COST
        rows.push({ billing: [a, b, c], negative, marketing, cost: negative + marketing, contribution, preference, viable: contribution > preference })
      }
    }
  }
  return rows
}

function premise() {
  const loaded = loadA8(), b = business(loaded.state), facts = loaded.provenance.facts
  expect(loaded.state.market.tick).toBe(247)
  expect(loaded.state.market.tick).toBeGreaterThanOrEqual(b.nextDecisionWeek)
  expect(b.productions).toHaveLength(0)
  expect(b.activeScriptOrdinals).toEqual([21, 22])
  expect(b.development.projects[A8_ORDINAL]!.id).toBe(A8_SCRIPT)
  expect(b.development.projects[A8_ORDINAL]!.status).toBe('ready')
  expect(b.screenplayShelving.rejections.find(r => r.ordinal === A8_ORDINAL)).toEqual({ ordinal: 21, count: 12 })
  expect(b.screenplayShelving.shelved.some(r => r.ordinal === A8_ORDINAL)).toBe(false)
  expect(loaded.state.promises.some(p => p.outcome === null && p.issuerStudioId === A8_STUDIO
    && isOpportunityPredicate(p.predicate) && p.predicate.kind === 'projectOpportunity' && p.predicate.scriptProjectId === A8_SCRIPT)).toBe(false)
  expect(TUNING.HOLLYWOOD_SHELVE_AFTER_REJECTIONS).toBe(13)
  expect(TUNING.HOLLYWOOD_SHELVED_RETRY_WEEKS).toBe(26)
  expect(TUNING.HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS).toBe(13)
  expect(facts).toMatchObject({ week: 247, afterWeek: 248, studioId: A8_STUDIO, scriptId: A8_SCRIPT, ordinal: 21,
    countBefore: 12, countAfter: 12, oldOutcome: 'cashBlocked', candidateOutcome: 'economicRejection',
    actualSeatableTeamReachedChooser: true, allCashFreeViable: 0 })
  expect(b.account).toEqual(a8AccountInRecovery(facts.accountBefore))
  expect(b.screenplayShelving).toEqual(facts.shelvingBefore)
  expect(facts.shelvingAfter).toEqual(facts.shelvingBefore)
  expect(facts.appendedIndustryReceipts).toEqual([])
  expect(facts.rawBefore).toEqual({ bytes: 1339547, sha256: a8Sha(loaded.raw) })
  expect(facts.rawAfter).toEqual({ bytes: 1340208, sha256: '71a1c0c8d042b0135fd7e9af6aa229d271fffa1cc1bcc64fab9065ee0ca83648' })
  return loaded
}

describe('1363 Part A A8 — genuine pre-amendment count12', () => {
  it('A8 prerequisite: pinned public V45 input, real refused chooser and independent hopeless candidates remain valid', () => {
    const { state, raw, provenance } = premise(), stateBytes = stableStringify(state)
    const original = policyModule.chooseIndustryPackage, calls: Args[] = []
    const observer = vi.spyOn(policyModule, 'chooseIndustryPackage').mockImplementation((...args) => {
      const result = original(...args)
      if (args[2].key === `${A8_STUDIO}:package:${A8_SCRIPT}` && args[2].lockScreenplay) {
        calls.push(structuredClone(args))
        expect(result).toBeNull()
      }
      return result
    })
    let observed: GameState
    try { observed = tick(state) } finally { observer.mockRestore() }
    expect(calls, 'real complete-team chooser reached exactly once; no supplied policy inputs').toHaveLength(1)
    const args = calls[0]!, before = stableStringify(args)
    expect(a8Sha(before)).toBe(provenance.facts.decisionInputSha256)
    const candidates = enumerate(args)
    expect(candidates).toEqual(provenance.facts.candidates)
    expect(candidates).toHaveLength(54)
    expect(candidates.filter(r => r.viable)).toHaveLength(0)
    expect(candidates.filter(r => r.cost <= args[2].cashAvailable)).toHaveLength(48)
    expect(candidates.filter(r => r.cost > args[2].cashAvailable)).toHaveLength(6)
    expect(policyModule.searchIndustryPackages(...args)).toEqual({ choice: null, ...provenance.facts.searchCounts })
    expect(stableStringify(args)).toBe(before)
    validateSaveV46(makeSave(observed))
    expect(tick(state), 'transparent observer cannot change the actual tick').toEqual(observed)
    expect(stableStringify(state)).toBe(stateBytes)
    expect(a8Raw()).toBe(raw)
  }, 30_000)

  it('A8 intended RED: one actual tick shelves the genuine count12 screenplay with exact receipt, retry and hold; historical cost and cash remain factual', () => {
    const { state, raw, provenance } = premise(), before = business(state), stateBytes = stableStringify(state)
    const after = tick(state), later = business(after)
    // Valid input and valid resulting save are prerequisites, never the intended RED.
    const saved = makeSave(after)
    validateSaveV46(saved)
    const afterBytes = stableStringify(after), savedRaw = exportSave(saved)
    expect(exportSave(importSave(savedRaw))).toBe(savedRaw)
    expect(stableStringify(after)).toBe(afterBytes)
    expect(stableStringify(state)).toBe(stateBytes)
    expect(a8Raw()).toBe(raw)
    expect(after.market.tick).toBe(248)
    // Old source leaves count12 active. This is the first intended behavioral failure.
    expect(later.screenplayShelving.shelved.find(r => r.ordinal === A8_ORDINAL)).toEqual({ ordinal: 21, week: 247, retryWeek: 273 })
    expect(later.screenplayShelving.rejections.some(r => r.ordinal === A8_ORDINAL)).toBe(false)
    expect(later.activeScriptOrdinals).not.toContain(A8_ORDINAL)
    expect(later.screenplayShelving.commissionHoldUntilWeek).toBe(260)
    expect(after.hollywood!.receipts.slice(0, state.hollywood!.receipts.length)).toEqual(state.hollywood!.receipts)
    const receipts = after.hollywood!.receipts.slice(state.hollywood!.receipts.length)
    expect(receipts.filter(r => r.studioId === A8_STUDIO)).toEqual([{
      eventId: `industry-event-${state.hollywood!.nextReceipt}`, week: 247, studioId: A8_STUDIO,
      kind: 'screenplayShelved', scriptProjectId: A8_SCRIPT, conceptId: before.projects[A8_ORDINAL]!.conceptId, rejections: 13,
    }])
    expect(later.productions).toHaveLength(0)
    expect(after.hollywood!.employment).toEqual(state.hollywood!.employment)
    expect(after.hollywood!.careerEvents).toEqual(state.hollywood!.careerEvents)
    expect(after.hollywood!.films).toEqual(state.hollywood!.films)
    expect(after.firstTakes).toEqual(state.firstTakes)
    expect(later.development).toEqual(before.development)
    expect(later.projects).toEqual(before.projects)
    expect(later.account).toEqual(a8AccountInRecovery(provenance.facts.accountAfter))
    expect(later.account.periods.slice(0, -1)).toEqual(before.account.periods.slice(0, -1))
    expect(later.account.cash).toBe(before.account.cash - 116524) // Genuine ordinary weekly charge, no shelving charge/refund.
    expect(after.rngState).toBe(provenance.facts.rngAfter)
    expect(state.rngState).toBe(provenance.facts.rngBefore)
    expect(a8Raw()).toBe(raw)
  }, 30_000)
})
