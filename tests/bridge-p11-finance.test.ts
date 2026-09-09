import { describe, expect, it } from 'vitest'
import { financeProjection } from '../bridge/finance.ts'
import { peopleProjection } from '../bridge/people.ts'
import { BRIDGE_SCHEMA, PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { BridgeSession } from '../bridge/session.ts'
import {
  activeContract, applyActions, beginFounding, contractOffer, FOUNDING_MINIMUMS,
  freelancerMarketIds, generateWorld, guaranteedComp, hiringMarketIds, makeSaveV10,
  migrateToV18, queryPlacement, stableStringify, tick, weeklyBurn, weeklySalary,
} from '../src/core/index.js'
import type { CastSlot, GameState, LotCell, SegmentId } from '../src/core/index.js'
import { filmResultView } from '../ui/src/engine/adapter.ts'

function founded(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const applicants = state.founding!.applicantIds.map(id => state.talent.find(t => t.id === id)!)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const pool = applicants.filter(t => t.role === role)
      .sort((a, b) => contractOffer(state, a.id, 208).annualSalary - contractOffer(state, b.id, 208).annualSalary)
    for (const talent of pool.slice(0, FOUNDING_MINIMUMS[role])) {
      state = applyActions(state, [{ kind: 'signContract', talentId: talent.id, termWeeks: 208 }])
    }
  }
  return applyActions(state, [{ kind: 'foundStudio' }])
}

function releaseFilm(state: GameState, conceptIndex = 0, withFreelancer = false): GameState {
  const byRole = (role: string) => (state.contracts.length > 0
    ? state.contracts.map(c => state.talent.find(t => t.id === c.talentId)!) : state.talent).filter(t => t.role === role)
  const concept = state.concepts[conceptIndex]!
  const actors = byRole('actor')
  const freelanceActor = withFreelancer
    ? freelancerMarketIds(state).map(id => state.talent.find(t => t.id === id)!).find(t => t.role === 'actor') : undefined
  if (withFreelancer) expect(freelanceActor).toBeDefined()
  state = applyActions(state, [{ kind: 'greenlight', production: {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: concept.genre, intendedSegments: ['adult'] as SegmentId[],
      ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
    writerId: byRole('writer')[0]!.id, directorId: byRole('director')[0]!.id,
    cast: { lead: freelanceActor?.id ?? actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id } as Record<CastSlot, string>,
    craftIds: [byRole('craft')[0]!.id], budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
  } }])
  const id = state.studio.activeProductions.at(-1)!.id
  for (let week = 0; week < 30; week++) {
    if (state.studio.activeProductions.find(p => p.id === id)?.remainingTicks === 1) {
      state = applyActions(state, [{ kind: 'commitPictureToRelease', productionId: id }])
    }
    state = tick(state)
    if (state.studio.releasedFilms.some(f => f.productionId === id)) return state
  }
  throw new Error('The real film did not release within its bounded engine journey')
}

function firstLegalOrigin(state: GameState, blueprintId: string): LotCell {
  for (let gy = 0; gy < 30; gy++) for (let gx = 0; gx < 40; gx++) {
    if (queryPlacement(state, { blueprintId, origin: { gx, gy } }).ok) return { gx, gy }
  }
  throw new Error(`No legal site for ${blueprintId}`)
}

function quotePlacement(session: BridgeSession, commandId: string, blueprintId: string, origin: LotCell) {
  const response = session.quote({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
    sessionId: session.sessionId, expectedStateRevision: session.stateRevision, commandId,
    type: 'quotePlacement', draft: { verb: 'build', blueprintId, origin } })
  if (!response.accepted) throw new Error(response.message)
  return response
}

function submit(session: BridgeSession, commandId: string, intentId: string, revision = session.stateRevision) {
  return session.command({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
    sessionId: session.sessionId, expectedStateRevision: revision, commandId,
    type: 'submitIntent', payload: { intentId } })
}

function expectSameGameAndSave(session: BridgeSession, before: ReturnType<BridgeSession['exportRuntimeCheckpoint']>): void {
  const after = session.exportRuntimeCheckpoint()
  // Refused commands are journaled by existing session law. Gameplay and the
  // independently saved slot must remain byte-identical; neither is the journal.
  expect(after.currentSaveJson === before.currentSaveJson, 'current save bytes changed').toBe(true)
  expect(after.savedSaveJson === before.savedSaveJson, 'saved slot bytes changed').toBe(true)
  expect(after.currentStateDigest).toBe(before.currentStateDigest)
  expect(after.savedStateDigest).toBe(before.savedStateDigest)
  expect(after.stateRevision).toBe(before.stateRevision)
}

describe('P11 construction financial consequence over the real bridge', () => {
  for (const blueprintId of ['development-casting-annex', 'development-office-2']) {
    it(`${blueprintId}: retains pennies, charges once now and introduces Opex only after completion`, () => {
      let state = releaseFilm(founded(`p11-consequence-${blueprintId}`))
      expect(Number.isInteger(state.studio.cash)).toBe(false) // actual fractional theatrical receipt, not edited cash
      state = applyActions(state, [{ kind: 'activateStudioOperations' }])
      const session = new BridgeSession(state, `p11-consequence-${blueprintId}`)
      const before = stableStringify(session.exportRuntimeCheckpoint())
      const beforeState = stableStringify(state)
      const origin = firstLegalOrigin(state, blueprintId)
      const quoted = quotePlacement(session, 'quote-before', blueprintId, origin)
      const quote = quoted.quote
      expect(quote.ok).toBe(true)
      expect(quote.financial).not.toBeNull()
      const financial = quote.financial!
      expect(financial.cashBefore).toBe(state.studio.cash)
      expect(financial.cashAfter).toBe(state.studio.cash - quote.cost)
      expect(financial.immediateCashChange).toBe(-quote.cost)
      expect(financial.weeklyOperatingCostBefore).toBe(weeklyBurn(state))
      expect(financial.weeklyOperatingCostAfter).toBe(financial.weeklyOperatingCostBefore)
      expect(financial.weeklyPayrollChange).toBe(0)
      expect(financial.guaranteesAfter).toBe(financial.guaranteesBefore)
      expect(financial.laterBeginsWeek).toBe(quote.completesOnWeek)
      expect(financial.laterOperatingCost).toBe(financial.weeklyOperatingCostAfter + quote.weeklyOperatingCost)
      expect(financial.laterNetWeeklyCashflow).toBe(financial.netWeeklyCashflowAfter - quote.weeklyOperatingCost)
      expect(financial.laterBasis).toContain('holding other costs, receipts and post-purchase cash fixed')
      expect(financial.laterBasis).toContain(`Week ${quote.completesOnWeek} → ${quote.completesOnWeek + 1}`)
      expect(financial.laterBasis).toContain('not a forecast')
      if (blueprintId === 'development-office-2') {
        expect(quote.capacityDelta).toBe(0)
        expect(quote.weeklyOperatingCost).toBe(2_500)
      }
      expect(stableStringify(session.exportRuntimeCheckpoint())).toBe(before)
      expect(session.gameState).toBe(state)
      expect(stableStringify(state)).toBe(beforeState) // includes RNG and all persisted roots
      expect(session.runtimeJournalSize).toBe(0)
      expect(quotePlacement(session, 'quote-repeat', blueprintId, origin).quote.financial).toEqual(financial)
      const accepted = submit(session, 'build', quote.intentId)
      expect(accepted.accepted).toBe(true)
      expect(session.gameState.studio.cash).toBe(financial.cashAfter)
      expect(session.gameState.ledger.slice(state.ledger.length)).toHaveLength(1)
      expect(session.gameState.ledger.at(-1)).toMatchObject({ kind: 'constructionCapex', amount: financial.immediateCashChange })
      expect(weeklyBurn(session.gameState)).toBe(financial.weeklyOperatingCostAfter)
      const afterCommit = stableStringify(session.exportRuntimeCheckpoint())
      expect(stableStringify(submit(session, 'build', quote.intentId, 0)) === stableStringify(accepted),
        'idempotent replay changed the wire response').toBe(true)
      expect(stableStringify(session.exportRuntimeCheckpoint()) === afterCommit, 'idempotent replay changed checkpoint bytes').toBe(true)
      const beforeRefusal = session.exportRuntimeCheckpoint()
      expect(submit(session, 'duplicate-build', quote.intentId).accepted).toBe(false)
      expectSameGameAndSave(session, beforeRefusal)
      expect(session.runtimeJournalSize).toBe(beforeRefusal.journal.length + 1)
      const placedId = state.placement.nextPlacementId
      state = session.gameState
      while (state.market.tick < quote.completesOnWeek) {
        const next = tick(state)
        expect(next.ledger.slice(state.ledger.length).filter(e => e.kind === 'facilityOpex')).toEqual([])
        state = next
      }
      expect(state.placement.facilities.find(p => p.id === placedId)?.status).toBe('operational')
      expect(weeklyBurn(state)).toBe(financial.laterOperatingCost)
      const next = tick(state)
      expect(next.ledger.slice(state.ledger.length).find(e => e.kind === 'facilityOpex'))
        .toMatchObject({ week: quote.completesOnWeek, amount: -quote.weeklyOperatingCost })
      const report = financeProjection(state, peopleProjection(state))
      const facility = report.facilities.find(p => p.placementId === placedId)!
      expect(facility.buildingId).toBe(`placed-${placedId}`)
      expect(facility.chargedNextAdvance).toBe(quote.weeklyOperatingCost)
    })
  }

  it('gives illegal placement no financial successor and refuses a stale legal financial preview', () => {
    const state = applyActions(founded('p11-consequence-refusal'), [{ kind: 'activateStudioOperations' }])
    const session = new BridgeSession(state, 'p11-consequence-refusal')
    const offLot = quotePlacement(session, 'off-lot', 'development-office-2', { gx: 500, gy: 500 })
    expect(offLot.quote.ok).toBe(false)
    expect(offLot.quote.financial).toBeNull()
    const legal = quotePlacement(session, 'legal-old', 'development-office-2', firstLegalOrigin(state, 'development-office-2'))
    const revision = session.stateRevision
    expect(submit(session, 'build-now', legal.quote.intentId).accepted).toBe(true)
    const before = session.exportRuntimeCheckpoint()
    const stale = submit(session, 'stale-build', legal.quote.intentId, revision)
    expect(stale).toMatchObject({ accepted: false, reasonCode: 'STALE_REVISION' })
    expectSameGameAndSave(session, before)
  })
})

describe('P11 current people, obligations and film economics owners', () => {
  it('publishes only current contracts, with guarantees beside literal Cash and exact payroll', () => {
    const state = founded('p11-finance-employees')
    const before = stableStringify(state)
    const people = peopleProjection(state)
    const finance = financeProjection(state, people)
    const employees = state.contracts.filter(c => activeContract(state, c.talentId) !== undefined)
    expect(finance.employees.map(e => e.talentId).sort()).toEqual(employees.map(c => c.talentId).sort())
    expect(hiringMarketIds(state).length).toBeGreaterThan(0)
    expect(finance.employees.every(e => !hiringMarketIds(state).includes(e.talentId))).toBe(true)
    expect(finance.weeklyPayroll).toBe(employees.reduce((sum, c) => sum + weeklySalary(c.annualSalary), 0))
    expect(finance.employees.reduce((sum, e) => sum + e.chargedNextAdvance, 0)).toBe(finance.weeklyPayroll)
    expect(finance.guaranteedPayrollRemaining).toBe(employees.reduce((sum, c) => sum + guaranteedComp(c, state.market.tick), 0))
    expect(finance.guaranteedPayrollRemaining).toBeGreaterThan(0)
    expect(finance.cash).toBe(state.studio.cash)
    expect(finance.obligationsBasis).toContain('not subtracted from Cash')
    const session = new BridgeSession(state, 'p11-employee-wire')
    const snapshot = session.snapshot()
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, snapshot)).toEqual(snapshot)
    expect(snapshot.snapshot.finance.finance).toEqual(finance)
    expect(stableStringify(state)).toBe(before)
    const releasedId = employees[0]!.talentId
    const released = applyActions(state, [{ kind: 'releaseTalent', talentId: releasedId }])
    const after = financeProjection(released, peopleProjection(released))
    expect(after.employees.some(e => e.talentId === releasedId)).toBe(false)
    expect(after.cash).toBe(released.studio.cash)
    expect(after.guaranteedPayrollRemaining).toBeLessThan(finance.guaranteedPayrollRemaining)
  })

  it('keeps same-title films independent, preserves every P07 business amount and excludes studio costs', () => {
    let state = founded('p11-finance-same-title')
    const title = state.concepts[0]!.title
    state = { ...state, concepts: state.concepts.map((c, i) => i === 1 ? { ...c, title } : c) }
    state = releaseFilm(state)
    const firstId = state.studio.releasedFilms[0]!.productionId
    while (state.theatricalRuns.find(r => r.productionId === firstId)!.status === 'active') state = tick(state)
    state = releaseFilm(state, 1, true)
    const before = stableStringify(state)
    const p07Before = state.studio.releasedFilms.map(f => filmResultView(state, f).business)
    const report = financeProjection(state, peopleProjection(state))
    expect(report.films.filter(f => f.title === title)).toHaveLength(2)
    expect(new Set(report.films.map(f => f.productionId)).size).toBe(2)
    expect(report.films.find(f => f.productionId === firstId)?.status).toBe('settled')
    expect(report.films.filter(f => f.status === 'releasing')).toHaveLength(1)
    for (const film of state.studio.releasedFilms) {
      const business = filmResultView(state, film).business
      const row = report.films.find(f => f.productionId === film.productionId)!
      expect(row.theatricalGross).toBe(business.boxOfficeGrossTotal)
      expect(row.studioRevenueReceived).toBe(business.studioRevenuePaidToDate)
      expect(row.studioRevenueTotal).toBe(business.studioRevenueTotal)
      expect(row.directCommitment).toBe(business.committedCost)
      expect(row.contribution).toBe(business.contribution)
      expect(row.productionAndMarketing! + row.freelancerFees!).toBe(row.directCommitment)
      expect(row.contributionLabel).toBe(business.projected ? 'Projected Film Contribution' : 'Final Film Contribution')
      expect(row.basis).toContain('Excludes studio payroll, overhead, facility costs, capital and publicity')
      expect(row.basis).toContain('not studio net profit')
      expect(business.resultLabel).toMatch(/^(Projected )?(Profit|Loss|Break-even)$/i)
    }
    const reversed = { ...state, studio: { ...state.studio, releasedFilms: [...state.studio.releasedFilms].reverse() },
      theatricalRuns: [...state.theatricalRuns].reverse() }
    const reordered = financeProjection(reversed, peopleProjection(reversed))
    for (const row of report.films) expect(reordered.films.find(f => f.productionId === row.productionId)).toEqual(row)
    const renamedTitle = 'An Authoritative New Title'
    const renamed = { ...state, concepts: state.concepts.map(c => c.id === state.studio.releasedFilms[0]!.conceptId ? { ...c, title: renamedTitle } : c) }
    expect(financeProjection(renamed, peopleProjection(renamed)).films.find(f => f.productionId === firstId)!.title).toBe(renamedTitle)
    expect(state.studio.releasedFilms.map(f => filmResultView(state, f).business)).toEqual(p07Before)
    expect(stableStringify(state)).toBe(before)
  })

  it('marks genuinely missing legacy direct commitments unavailable without rewriting P07', () => {
    const state = releaseFilm(founded('p11-finance-legacy'), 0, true)
    const film = state.studio.releasedFilms[0]!
    const legacy = makeSaveV10(state)
    legacy.state.ledger = legacy.state.ledger.filter(e => e.productionId !== film.productionId || !['production', 'freelancerFee'].includes(e.kind))
    const migrated = migrateToV18(legacy).state
    expect(migrated.cashLedgerCheckpoint).toBeDefined()
    const p07Before = filmResultView(migrated, film).business
    const row = financeProjection(migrated, peopleProjection(migrated)).films.find(f => f.productionId === film.productionId)!
    expect(row.directCommitment).toBeNull()
    expect(row.productionAndMarketing).toBeNull()
    expect(row.freelancerFees).toBeNull()
    expect(row.contribution).toBeNull()
    expect(row.basis).toContain('not recorded')
    expect(row.studioRevenueReceived).toBe(p07Before.studioRevenuePaidToDate)
    expect(filmResultView(migrated, film).business).toEqual(p07Before)
  })

  it('does not turn a retained legacy freelancer receipt into a complete film budget', () => {
    const state = releaseFilm(founded('p11-finance-partial-legacy'), 0, true)
    const film = state.studio.releasedFilms[0]!
    const legacy = makeSaveV10(state)
    legacy.state.ledger = legacy.state.ledger.filter(e => e.productionId !== film.productionId || e.kind !== 'production')
    const migrated = migrateToV18(legacy).state
    expect(migrated.ledger.some(e => e.productionId === film.productionId && e.kind === 'freelancerFee')).toBe(true)
    expect(migrated.ledger.some(e => e.productionId === film.productionId && e.kind === 'production')).toBe(false)
    const row = financeProjection(migrated, peopleProjection(migrated)).films.find(f => f.productionId === film.productionId)!
    expect(row.productionAndMarketing).toBeNull()
    expect(row.directCommitment).toBeNull()
    expect(row.contribution).toBeNull()
    expect(row.freelancerFees).toBe(-migrated.ledger.filter(e => e.productionId === film.productionId && e.kind === 'freelancerFee').reduce((sum, e) => sum + e.amount, 0))
  })

  it('discloses legacy bundled production spending without inventing a historic budget split', () => {
    const state = releaseFilm(generateWorld('p11-finance-legacy-bundled'))
    const film = state.studio.releasedFilms[0]!
    const commitment = state.ledger.find(e => e.kind === 'production' && e.productionId === film.productionId)!
    expect(commitment.note).toBe('negative + marketing + salaries (D-1)')
    const migrated = migrateToV18(makeSaveV10(state)).state
    const business = filmResultView(migrated, film).business
    const row = financeProjection(migrated, peopleProjection(migrated)).films.find(f => f.productionId === film.productionId)!
    expect(row.directCommitment).toBe(-commitment.amount)
    expect(row.directCommitment).toBe(business.committedCost)
    expect(row.productionAndMarketing).toBe(-commitment.amount)
    expect(row.basis).toContain('Older production entries may bundle talent fees into production spending')
    expect(row.freelancerFees === 0).toBe(true) // JSON normalizes an empty signed sum's -0 to 0
    expect(row.contribution).toBe(business.contribution)
    expect(row).not.toHaveProperty('negativeCost')
    expect(row).not.toHaveProperty('marketingCost')
  })
})
