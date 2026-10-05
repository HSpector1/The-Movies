// Authored public engine-migration boundary fixture, not a natural fresh-industry campaign.
import { expect, it } from 'vitest'
import { generateWorld } from '../src/core/worldgen.js'
import { tick } from '../src/core/tick.js'
import { initializeHollywood, rivalWeeklyOperatingCost } from '../src/core/hollywood.js'
import { HOLLYWOOD_STARTING_MANIFEST } from '../src/core/hollywoodStartingData.js'
import { commercialAccessRefusal } from '../src/core/technology.js'
import { equipmentPlan, installationCatalogueCost } from '../src/core/technologyAdoption.js'
import { technologyEntry } from '../src/core/technologyCatalogue.js'
import { ageAt } from '../src/core/aging.js'
import { makeSave, validateSaveV46, stableStringify } from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
const bytes = stableStringify
function admitted(s: GameState): void {
  const before = bytes(s), envelope = makeSave(s)
  expect(validateSaveV46(envelope)).toBe(envelope); expect(bytes(s)).toBe(before)
}
function commitments(s: GameState, id: string) {
  return {
    employment: s.hollywood!.employment.filter(e => e.studioId === id).map(e => e.contractId),
    plans: s.physicalPlans.plans.filter(p => p.studioId === id).map(p => p.id),
    adoptions: s.technology.adoptions.filter(a => a.studioId === id).map(a => [a.id, a.committedWeek]),
    projects: s.technology.projects.filter(p => p.studioId === id).map(p => [p.id, p.startedWeek]),
    seats: s.technology.projects.filter(p => p.studioId === id).flatMap(p => p.seats.map(seat => [p.id, seat.talentId, seat.assignedWeek])),
  }
}
it('B adoption: public migration entry at actual416 funds an ordinary adoption; cutting blocks all new commitments', () => {
  let original = generateWorld('p13a-core-causal-01')
  admitted(original); expect(original.hollywood).toBeNull(); expect(original.founding).toBeNull()
  for (let week = 0; week < 416; week++) {
    const before = bytes(original), next = tick(original)
    expect(bytes(original)).toBe(before)
    expect(next.market.tick).toBe(week + 1); expect(next.hollywood).toBeNull()
    original = next
  }
  admitted(original); expect(original.market.tick).toBe(416); expect(original.founding).toBeNull()
  const old = bytes(original), input = initializeHollywood(original, 'migration')
  expect(bytes(original)).toBe(old); admitted(input)
  expect(input.hollywood).toMatchObject({ origin: 'migration', originWeek: 416 })
  expect(input.market).toEqual(original.market)
  expect(input.ledger).toEqual(original.ledger)
  expect(input.studio).toEqual(original.studio)
  expect(input.hollywood!.films).toHaveLength(0) // no forged historical starter films
  for (const person of input.talent) {
    const provenance = input.talentProvenance.rows.filter(r => r.personId === person.id)
    expect(provenance).toHaveLength(1); expect(person.age).toBe(ageAt(provenance[0]!, 416))
    const prior = original.talent.find(t => t.id === person.id)
    if (prior) expect(person).toEqual(prior)
    else expect(provenance[0]).toMatchObject({ kind: 'authored_exact_week', entryWeek: 416 })
  }
  for (const b of input.hollywood!.businesses) {
    const identity = input.hollywood!.identities.find(r => r.studioId === b.studioId)!
    const authored = HOLLYWOOD_STARTING_MANIFEST.studios[identity.row - 1]!
    expect(identity.enteredWeek).toBe(416); expect(identity.recordedFromWeek).toBe(416)
    expect(b.account.openingBalance).toBe(authored.capital)
    expect(b.account.periods).toHaveLength(1)
    const period = b.account.periods[0]!
    expect(period.fromWeek).toBe(416); expect(period.opening).toBe(authored.capital)
    expect(b.account.cash).toBe(authored.capital + Object.values(period.movements).reduce((n, amount) => n + amount, 0))
    expect(period.movements.capacity).toBeLessThan(0); expect(period.movements.signing).toBeLessThan(0)
    for (const [kind, amount] of Object.entries(period.movements)) if (kind !== 'capacity' && kind !== 'signing') expect(amount).toBe(0)
    expect(b.productions).toHaveLength(0); expect(b.runs).toHaveLength(0)
    expect(b.costCutting).toEqual({ version: 1, since: null })
    for (const e of input.hollywood!.employment.filter(e => e.studioId === b.studioId)) {
      expect(e.reason).toBe('entry'); expect(e.terms.startWeek).toBe(416)
      expect(input.hollywood!.receipts.some(r => r.kind === 'employment' && r.contractId === e.contractId && r.week === 416)).toBe(true)
    }
  }
  const inputBefore = bytes(input), control = tick(input)
  expect(bytes(input)).toBe(inputBefore); admitted(control)
  const b = input.hollywood!.businesses.find(b => control.technology.adoptions.some(a => a.studioId === b.studioId
    && !input.technology.adoptions.some(old => old.id === a.id)))
  const entry = technologyEntry('synchronized-sound')
  const refusalFacts = input.hollywood!.businesses.map(b => ({ studioId: b.studioId,
    commercialRefusal: commercialAccessRefusal(input, b.studioId, entry.id), cash: b.account.cash,
    reserve: rivalWeeklyOperatingCost(b, input.hollywood!, 416) * b.policy.reserveWeeks,
    cost: entry.accessCost + equipmentPlan(input, b.studioId, entry.id).cost + installationCatalogueCost(entry),
    stage: b.operations.facilities.filter(f => f.capability === 'soundstage' || f.capability === 'post').map(f => f.id),
    workflows: b.operations.workflows.map(w => w.productionId) }))
  expect(b, 'UNMET PUBLIC416 ADOPTION PREMISE: ' + JSON.stringify(refusalFacts)).toBeDefined()
  const id = b!.studioId, adopted = control.technology.adoptions.filter(a => a.studioId === id)
  expect(adopted.length).toBeGreaterThan(0)
  expect(adopted.every(a => a.committedWeek === 416 && a.route === 'purchase')).toBe(true)
  const expectedCost = entry.accessCost + entry.commercialEquipmentCost + installationCatalogueCost(entry)
  expect(control.hollywood!.businesses.find(row => row.studioId === id)!.account.periods[0]!.movements.technologyAdoption).toBe(-expectedCost)
  const candidate = structuredClone(input), selected = candidate.hollywood!.businesses.find(row => row.studioId === id)!
  expect(candidate.talentMarket.proposals.some(p => p.issuerStudioId === id)).toBe(false)
  selected.costCutting.since = 416; admitted(candidate)
  const candidateBefore = bytes(candidate), result = tick(candidate)
  admitted(result); expect(bytes(candidate)).toBe(candidateBefore)
  expect(commitments(result, id)).toEqual(commitments(input, id))
  expect(bytes(input)).toBe(inputBefore); expect(bytes(original)).toBe(old)
}, 120_000)
