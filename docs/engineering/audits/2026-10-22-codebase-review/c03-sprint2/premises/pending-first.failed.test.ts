// STATIC-UNRUN candidate replacement for original p16-r2-authority.test.ts:83.
// Existing pre162 capture; real staffing, greenlight/cancel, paid sequel licence, remake and ticks.
// Deliberate spending policy: the second film spends floor(available cash) as its production budget.
// No cash/history edits, invented closure, injected condition reader, P17 caller or timeout override.
// The inherited original48 R04 capture's disclosed transaction-fixture provenance still applies.
import { expect, it } from 'vitest'
import { actualEstatePrior } from './helpers/p16-actual-estate.js'
import { signRole } from './helpers/stabilization-staffing.js'
import { applyActions } from '../src/core/actions.js'
import { acceptOffer, makeOffer, offerRefusal } from '../src/core/assetSale.js'
import { blockingEncumbrance, permissionFor } from '../src/core/licence.js'
import { conditionRecord } from '../src/core/corporateConditionLive.js'
import { currentHolder, storyPropertyId } from '../src/core/rights.js'
import { makeSave, stableStringify, exportCurrentState, importSave, migrateToLive } from '../src/core/save.js'
import { resolveShape } from '../src/core/shape.js'
import { tick } from '../src/core/tick.js'
import type { Action, FilmShape } from '../src/core/types.js'

const R01 = 'studio-aca408ec-r01'
const SHAPE: FilmShape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' }
const SEQUEL = { use: 'sequel' as const }, REMAKE = { use: 'remake' as const }

it('a paid sequel licence survives actual player closure while its original owner’s held remake makes the title pending', () => {
  const prior = actualEstatePrior(), original = stableStringify(prior)
  let state = prior
  const player = state.hollywood!.playerStudioId, week = state.market.tick
  expect(week).toBe(162)
  expect(state.scriptDevelopment.mode).toBe('legacy')
  expect(state.studio.activeProductions).toEqual([])
  expect(state.studio.releasedFilms).toEqual([])
  const used = new Set<string>()
  const writer = signRole(state, 'writer', 1, used); state = writer.state
  const director = signRole(state, 'director', 1, used); state = director.state
  const actors = signRole(state, 'actor', 3, used); state = actors.state
  const craft = signRole(state, 'craft', 1, used); state = craft.state
  const concept = state.concepts[0]!
  const greenlight: Action & { kind: 'greenlight' } = { kind: 'greenlight', production: {
    conceptId: concept.id, shape: SHAPE,
    promise: { genre: concept.genre, intendedSegments: ['adult'],
      ranges: { intimacy: [-1, 1], tonalWeight: [-1, 1], kineticEnergy: [-1, 1] } },
    writerId: writer.ids[0]!, directorId: director.ids[0]!, craftIds: [craft.ids[0]!],
    cast: { lead: actors.ids[0]!, antagonist: actors.ids[1]!, support: actors.ids[2]! },
    budget: { negative: concept.baseNegativeCost * resolveShape(SHAPE).budgetDemandMultiplier * state.era.costScale, marketing: 0 },
  } }
  const firstCash = state.studio.cash
  state = applyActions(state, [greenlight])
  const cancelledId = state.studio.activeProductions.at(-1)!.id
  expect(state.studio.cash).toBe(firstCash - greenlight.production.budget.negative)
  const paidOnce = state.studio.cash
  state = applyActions(state, [{ kind: 'cancel', productionId: cancelledId }])
  expect(state.studio.cash).toBe(paidOnce)
  const subject = { right: 'R1' as const, propertyId: storyPropertyId(concept.id) }
  expect(blockingEncumbrance(state, subject)).toBeNull()
  expect(currentHolder(state, subject, week)).toMatchObject({ holderId: player, tradeable: true })
  makeSave(state)

  // R01 is the buyer/payer/licensee. The player is the seller/payee/grantor and keeps R1.
  const request = { offerorId: R01, counterpartyId: player, direction: 'buy' as const, price: 1_000,
    instrument: { kind: 'licence' as const, right: 'R3' as const, subject, scope: SEQUEL,
      exclusive: true, startWeek: week, endWeekExclusive: week + 104 } }
  expect(offerRefusal(state, request, week)).toBeNull()
  const beforeGrant = state.studio.cash
  const buyerCash = state.hollywood!.businesses.find(b => b.studioId === R01)!.account.cash
  const offered = makeOffer(state, request, week)
  state = acceptOffer(offered.state, offered.offer.id, player, week)
  const licence = state.rights.licences.find(l => l.grantorId === player && l.granteeId === R01 && l.subject.right === 'R1' && l.subject.propertyId === subject.propertyId)!
  expect(licence).toBeDefined()
  expect(state.rights.transactions.find(t => t.id === licence.transactionId)).toMatchObject({
    kind: 'licenceGrant', payerId: R01, payeeId: player, amount: 1_000, licenceId: licence.id,
  })
  expect(state.studio.cash).toBe(beforeGrant + 1_000)
  expect(state.hollywood!.businesses.find(b => b.studioId === R01)!.account.cash).toBe(buyerCash - 1_000)
  const licensed = { kind: 'permitted', via: 'licence', licenceId: licence.id }
  expect(permissionFor(state, R01, subject, 'R3', SEQUEL, week)).toEqual(licensed)
  expect(permissionFor(state, player, subject, 'R3', REMAKE, week)).toEqual({ kind: 'permitted', via: 'title', licenceId: null })
  makeSave(state)

  // All required company seats have real contracts, so the unchanged greenlight owes no freelancer fees.
  // This one declared policy spends the available whole dollars; no price/seed/clock search follows.
  const available = state.studio.cash, filmBudget = Math.floor(available)
  expect(filmBudget).toBeGreaterThan(0)
  const beforeProductionRows = state.ledger.length
  state = applyActions(state, [{ ...greenlight, production: { ...greenlight.production,
    budget: { negative: filmBudget, marketing: 0 } } }])
  const productionId = state.studio.activeProductions.at(-1)!.id
  expect(productionId).not.toBe(cancelledId)
  expect(state.studio.cash).toBe(available - filmBudget)
  expect(state.studio.cash).toBeGreaterThanOrEqual(0)
  expect(state.studio.cash).toBeLessThan(1)
  expect(state.ledger.slice(beforeProductionRows)).toEqual([
    { week, kind: 'production', amount: -filmBudget, productionId, note: 'negative + marketing' },
  ])
  expect(blockingEncumbrance(state, subject)).toBe('activeProduction')
  expect(permissionFor(state, R01, subject, 'R3', SEQUEL, week)).toEqual(licensed)
  makeSave(state)

  // P06A holds the uncommitted picture at remainingTicks1. Payroll/overhead can therefore cause
  // a genuine player closure while this production remains active; the player takes no loan.
  const expectedClosure = week + 33
  for (let i = 0; i < 33; i++) state = tick(state)
  const closure = state.studioClosure.closures.find(c => c.studioId === player)!
  expect(state.market.tick).toBe(expectedClosure)
  expect(closure).toBeDefined()
  expect(closure.closureWeek).toBe(expectedClosure)
  expect(conditionRecord(state, player)?.condition.stage).toBe('closed')
  expect(state.corporateCondition.loans.filter(l => l.studioId === player)).toEqual([])
  expect(state.studio.activeProductions.find(p => p.id === productionId)).toMatchObject({ conceptId: concept.id, remainingTicks: 1 })
  expect(state.studio.releasedFilms).toEqual([])
  expect(state.releaseAuthority.commitments).toEqual([])
  expect(closure.dispositions).toEqual(expect.arrayContaining([
    expect.objectContaining({ subjectKind: 'production', subjectId: productionId, status: 'applied' }),
  ]))
  const estate = state.rights.estates.find(e => e.closureId === closure.closureId)!
  expect(estate).toBeDefined()
  expect(estate.pending).toContainEqual({ subject, reason: 'activeProduction', status: 'pending' })
  expect(estate.lots.flatMap(l => l.subjects)).not.toContainEqual(subject)
  expect(permissionFor(state, R01, subject, 'R3', SEQUEL, expectedClosure)).toEqual(licensed)
  expect(currentHolder(state, subject, expectedClosure)).toEqual({ kind: 'holder', holderId: player,
    tradeable: false, archived: false, estate: { estateId: estate.estateId, lotId: null } })
  makeSave(state)
  const saved = exportCurrentState(state)
  expect(exportCurrentState(migrateToLive(importSave(saved)).state)).toBe(saved)
  expect(stableStringify(prior)).toBe(original)
})
