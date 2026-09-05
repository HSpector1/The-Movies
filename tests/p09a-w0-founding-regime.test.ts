// ── P09 W0 — the founding regime root, the bare-lot property, and the first-film gate ──
//
// Charter P09 §16/§17/§20/§23 laws under test, stated once:
//   R1  `foundingRegime` is persisted, exact, immutable history: a new default
//       world is `endowed`; a world created with the bare-lot option is
//       `bare-lot`; save V18 round-trips it; every V1–V17 save migrates to
//       `endowed` with NO other change; every downgrade is refused; the regime
//       is never inferred from building counts (a bare lot that has built all
//       four capabilities stays `bare-lot`; an endowed lot stays `endowed`).
//   R2  A default world is byte-identical to the pre-P09 world everywhere but
//       the new root (the endowed founding plant, the endowed sets, the
//       authored property are unchanged).
//   R3  The bare-lot property carries ONLY the two civic landmarks, the
//       authored roads and owned ground; activation mints NOTHING: no
//       facility, no set, no workflow, no reservation, no capex, no project.
//   R4  The minimum first-film plant (office, scenery, soundstage, post) is
//       lawfully placeable on the bare lot with road frontage and clearance,
//       and each completes on its committed week and becomes operational.
//   R5  With no capacity, a screenplay commission QUEUES (the first bottleneck
//       is missing Development & Casting capacity) and admits itself the week
//       the office completes — nothing is skipped and nothing is free.
//   R6  THE HARD-STOP GATE: an ordinary minimum-roster bare-lot studio reaches
//       a released picture with real receipts, paying every capex, opex,
//       payroll, overhead, screenplay, set, and production cost from its own
//       cash, which never goes below zero.
//   R7  Save/load mid-construction continues byte-identically; two sites
//       committed for the same week complete together in ascending id order.
import { describe, expect, it } from 'vitest'
import {
  applyActions,
  BARE_LOT_PROPERTY,
  beginFounding,
  contractOffer,
  convertV17ToV18,
  exportSave,
  FOUNDING_MINIMUMS,
  foundingFacilitiesOf,
  generateWorld,
  importSave,
  INITIAL_PROPERTY,
  FOUNDING_OFFICE_REQUIREMENT_REASON,
  foundingPhaseOf,
  assertStudioPlacementInvariants,
  legacyAnnexOffered,
  studioConstructionView,
  studioPlacementView,
  INITIAL_STUDIO_FACILITIES,
  makeSave,
  makeSaveV17,
  migrateToV17,
  migrateToV18,
  nextStudioDecision,
  queryPlacement,
  tick,
  validateSaveV18,
} from '../src/core/index.js'
import type { CreativeRole, GameState, LotCell } from '../src/core/index.js'
import { FACILITY_BLUEPRINTS, TUNING } from '../src/core/tuning.js'
import { freePackage, commissionFor } from './_m4Fixtures.js'

// ── fixtures ────────────────────────────────────────────────────────────────

/** The ordinary player's founding: the exact minimum roster, cheapest legal applicant per role. */
function foundMinimum(state: GameState): GameState {
  let next = beginFounding(state)
  const applicants = next.founding!.applicantIds.map((id) => next.talent.find((t) => t.id === id)!)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const satisfies readonly CreativeRole[]) {
    const pool = applicants
      .filter((t) => t.role === role)
      .map((t) => ({ t, offer: contractOffer(next, t.id, 104) }))
      .sort((a, b) => a.offer.annualSalary - b.offer.annualSalary)
    for (const { t } of pool.slice(0, FOUNDING_MINIMUMS[role])) {
      next = applyActions(next, [{ kind: 'signContract', talentId: t.id, termWeeks: 104 }])
    }
  }
  return applyActions(next, [
    { kind: 'foundStudio' },
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}

const bareLot = (seed: string) => foundMinimum(generateWorld(seed, { regime: 'bare-lot' }))
const endowed = (seed: string) => foundMinimum(generateWorld(seed))

const ORIGINS: Record<string, LotCell> = {
  'development-casting-office': { gx: 1, gy: 5 }, // North-West Yard, fronting the avenue
  'scenery-shop': { gx: 5, gy: 5 }, // same yard, one clear cell east of the office
  'stage-standard': { gx: 16, gy: 3 }, // North Stage Yard, fronting the avenue and the stage road
  'post-building': { gx: 16, gy: 9 }, // East Yard, fronting the avenue
}

function commit(state: GameState, blueprintId: string): GameState {
  const quote = queryPlacement(state, { blueprintId, origin: ORIGINS[blueprintId]! })
  if (!quote.ok) throw new Error(`${blueprintId} at ${JSON.stringify(ORIGINS[blueprintId])}: ${quote.primary} ${JSON.stringify(quote.rejections)}`)
  return applyActions(state, [{ kind: 'placeFacility', placement: { blueprintId, origin: ORIGINS[blueprintId]! } }])
}

/** The ordinary bare-lot plant: the founding office FIRST (P09 §10.3), the rest once it is operational. */
function buildMinimumPlant(state: GameState): GameState {
  let next = commit(state, 'development-casting-office')
  for (let guard = 0; guard < 40 && !next.operations.facilities.some((f) => f.capability === 'development-casting'); guard++) {
    next = tick(next)
  }
  for (const id of Object.keys(ORIGINS)) if (id !== 'development-casting-office') next = commit(next, id)
  return next
}

function driveOps(state: GameState): GameState {
  let next = state
  let decision = nextStudioDecision(next)
  let guard = 0
  while (decision !== null && decision.kind === 'productionOperation' && guard++ < 60) {
    next = applyActions(next, [decision.command])
    decision = nextStudioDecision(next)
  }
  return next
}

// ── R1 / R2 — the root ───────────────────────────────────────────────────────

describe('P09 R1 — the founding regime is persisted, exact, and immutable', () => {
  it('a default world is endowed and a bare-lot world is bare-lot, from creation', () => {
    expect(generateWorld('p09-r1').foundingRegime).toBe('endowed')
    expect(generateWorld('p09-r1', { regime: 'bare-lot' }).foundingRegime).toBe('bare-lot')
    expect(generateWorld('p09-r1', { regime: 'bare-lot' }).property).toEqual(BARE_LOT_PROPERTY)
    expect(generateWorld('p09-r1').property).toEqual(INITIAL_PROPERTY)
  })

  it('V18 round-trips the regime and refuses a forged or missing one', () => {
    for (const regime of ['endowed', 'bare-lot'] as const) {
      const state = regime === 'bare-lot' ? bareLot('p09-r1-rt') : endowed('p09-r1-rt')
      const save = makeSave(state)
      expect(save.saveVersion).toBe(18)
      expect(save.state.foundingRegime).toBe(regime)
      const json = exportSave(save)
      expect(exportSave(importSave(json))).toBe(json)
      expect(migrateToV18(importSave(json)).state.foundingRegime).toBe(regime)
    }
    const save = makeSave(endowed('p09-r1-forge'))
    const raw = JSON.parse(exportSave(save)) as { state: Record<string, unknown> }
    expect(() => validateSaveV18({ ...raw, state: { ...raw.state, foundingRegime: 'sandbox' } })).toThrow(/not a known founding regime/)
    const { foundingRegime: _r, ...missing } = raw.state
    expect(() => validateSaveV18({ ...raw, state: missing })).toThrow(/foundingRegime is missing/)
    // Laundering: an endowed property cannot claim the bare-lot regime, nor the reverse.
    expect(() => validateSaveV18({ ...raw, state: { ...raw.state, foundingRegime: 'bare-lot' } })).toThrow(/cannot carry founding structures/)
    const bare = JSON.parse(exportSave(makeSave(bareLot('p09-r1-forge-b')))) as { state: Record<string, unknown> }
    expect(() => validateSaveV18({ ...bare, state: { ...bare.state, foundingRegime: 'endowed' } })).toThrow(/must carry its founding structures/)
  })

  it('every pre-P09 save migrates to endowed with no other change; downgrades are refused', () => {
    const state = endowed('p09-r1-migrate')
    const v17 = makeSaveV17(state)
    expect(v17.saveVersion).toBe(17)
    expect('foundingRegime' in v17.state).toBe(false)
    const v18 = convertV17ToV18(v17)
    expect(v18.state.foundingRegime).toBe('endowed')
    const { foundingRegime: _r, ...rest } = v18.state
    expect(JSON.parse(JSON.stringify(rest))).toEqual(JSON.parse(JSON.stringify(v17.state)))
    expect(migrateToV18(v17)).toEqual(v18)
    expect(() => migrateToV17(v18)).toThrow(/cannot downgrade SaveFileV18/)
  })

  it('the regime is never inferred from what stands on the lot', () => {
    // A bare lot that has built every capability is still a bare-lot studio.
    let bare = buildMinimumPlant(bareLot('p09-r1-infer'))
    for (let week = 0; week < 17; week++) bare = tick(bare)
    expect(new Set(bare.operations.facilities.map((f) => f.capability))).toEqual(
      new Set(['development-casting', 'set-scenery', 'soundstage', 'post']),
    )
    expect(bare.foundingRegime).toBe('bare-lot')
    expect(makeSave(bare).state.foundingRegime).toBe('bare-lot')
    // An endowed lot stays endowed regardless of what it builds later.
    let rich = endowed('p09-r1-infer')
    rich = applyActions(rich, [{ kind: 'placeFacility', placement: { blueprintId: 'craft-annex', origin: { gx: 0, gy: 9 } } }])
    expect(rich.foundingRegime).toBe('endowed')
  })
})

describe('P09 R2 — the endowed default is the pre-P09 world', () => {
  it('founding plant, endowed sets, and property are exactly what they always were', () => {
    const state = endowed('p09-r2')
    expect(state.operations.facilities).toEqual(INITIAL_STUDIO_FACILITIES.map((f) => ({ ...f })))
    expect(foundingFacilitiesOf(state.property)).toEqual(INITIAL_STUDIO_FACILITIES.map((f) => ({ ...f })))
    expect(state.sets.length).toBe(2)
    expect(state.nextSetId).toBe(2)
    expect(state.property).toEqual(INITIAL_PROPERTY)
  })
})

// ── R3 — the sparse activation ───────────────────────────────────────────────

describe('P09 R3 — bare-lot activation mints nothing', () => {
  it('carries only the two landmarks and empty authoritative operations roots', () => {
    const state = bareLot('p09-r3')
    expect(state.property.structures.map((s) => `${s.id}:${s.role}`)).toEqual(['gate:landmark', 'admin:landmark'])
    expect(foundingFacilitiesOf(state.property)).toEqual([])
    expect(state.operations).toEqual({ mode: 'managed', facilities: [], workflows: [] })
    expect(state.placement.facilities).toEqual([])
    expect(state.sets).toEqual([])
    expect(state.nextSetId).toBe(0)
    expect(state.construction.projects).toEqual([])
    expect(state.scriptDevelopment.projects).toEqual([])
    expect(state.castingSessions.sessions ?? []).toEqual([])
    expect(state.productionQueue).toEqual([])
    expect(state.ledger.filter((row) => row.kind === 'constructionCapex')).toEqual([])
    expect(state.studio.cash).toBe(TUNING.INITIAL_CASH)
    // The history is honest: the founding landmark, nothing else.
    expect(state.studioHistory.rows.map((row) => row.kind)).toEqual(['studioFounded'])
    // The save boundary accepts the sparse studio as a first-class shape.
    expect(() => validateSaveV18(makeSave(state))).not.toThrow()
  })
})

// ── R4 / R7 — placement on the bare lot ──────────────────────────────────────

describe('P09 R4 — the minimum plant fits and completes on its committed weeks', () => {
  it('P09 §10.3: on the sparse lot only the founding office is quotable first; every other row says exactly why', () => {
    let state = bareLot('p09-r4')
    expect(foundingPhaseOf(state)).toBe('office-needed')
    const office = FACILITY_BLUEPRINTS.find((b) => b.id === 'development-casting-office')!
    const officeQuote = queryPlacement(state, { blueprintId: office.id, origin: ORIGINS[office.id]! })
    expect(officeQuote.ok, JSON.stringify(officeQuote.rejections)).toBe(true)
    expect(officeQuote.maxInstances).toBe(1)
    for (const id of Object.keys(ORIGINS)) {
      if (id === office.id) continue
      const quote = queryPlacement(state, { blueprintId: id, origin: ORIGINS[id]! })
      expect(quote.ok).toBe(false)
      expect(quote.primary).toBe('requirementsUnmet')
      expect(quote.unmetRequirements.map((u) => u.reason)).toEqual([FOUNDING_OFFICE_REQUIREMENT_REASON])
      expect(quote.unmetRequirements[0]!.notYetAttainable).toBe(false)
    }
    // The catalogue says the same thing, and tags the office NEEDED NOW.
    const catalog = studioPlacementView(state).catalog
    expect(catalog.filter((row) => row.neededNow).map((row) => row.blueprintId)).toEqual([office.id])
    expect(catalog.filter((row) => row.available).map((row) => row.blueprintId)).toEqual([office.id])
    for (const row of catalog) {
      if (row.blueprintId === office.id) continue
      // The founding gate LEADS; any authored requirement (Office III needs Office II) follows it.
      expect(row.available).toBe(false)
      expect(row.unmet[0]?.reason).toBe(FOUNDING_OFFICE_REQUIREMENT_REASON)
    }
    // Committed but not yet open: a second founding office is refused; the gate holds.
    state = commit(state, office.id)
    expect(foundingPhaseOf(state)).toBe('office-building')
    const second = queryPlacement(state, { blueprintId: office.id, origin: { gx: 16, gy: 9 } })
    expect(second.rejections).toContain('instanceLimit')
    expect(studioPlacementView(state).catalog.find((row) => row.blueprintId === office.id)!.neededNow).toBe(false)
    expect(studioPlacementView(state).catalog.find((row) => row.blueprintId === office.id)!.atInstanceLimit).toBe(true)
    expect(queryPlacement(state, { blueprintId: 'scenery-shop', origin: ORIGINS['scenery-shop']! }).primary).toBe('requirementsUnmet')
    // Operational: the founding phase is satisfied and the wider catalogue uses its real requirements.
    for (let week = 0; week < office.buildWeeks; week++) state = tick(state)
    expect(foundingPhaseOf(state)).toBe('satisfied')
    for (const id of Object.keys(ORIGINS)) {
      if (id === office.id) continue
      const blueprint = FACILITY_BLUEPRINTS.find((b) => b.id === id)!
      const quote = queryPlacement(state, { blueprintId: id, origin: ORIGINS[id]! })
      expect(quote.ok, `${id}: ${quote.primary} ${JSON.stringify(quote.rejections)}`).toBe(true)
      expect(quote.cost).toBe(blueprint.capex)
      expect(quote.buildWeeks).toBe(blueprint.buildWeeks)
      expect(quote.weeklyOperatingCost).toBe(blueprint.weeklyOperatingCost)
      expect(quote.completesOnWeek).toBe(state.market.tick + blueprint.buildWeeks)
      expect(quote.cells.length).toBe(blueprint.footprint.width * blueprint.footprint.depth)
    }
    expect(queryPlacement(state, { blueprintId: office.id, origin: { gx: 16, gy: 9 } }).maxInstances).toBe(office.maxInstances ?? null)
    // The endowed regime never carries the gate.
    expect(foundingPhaseOf(endowed('p09-r4'))).toBe('none')
    expect(studioPlacementView(endowed('p09-r4')).catalog.some((row) => row.neededNow)).toBe(false)
  })

  it('four committed sites complete on their own weeks, become operational, and start paying opex only then', () => {
    let state = bareLot('p09-r4-complete')
    const cashBefore = state.studio.cash
    const ledgerStart = state.ledger.length
    state = buildMinimumPlant(state)
    const capex = Object.keys(ORIGINS).reduce((sum, id) => sum + FACILITY_BLUEPRINTS.find((b) => b.id === id)!.capex, 0)
    const capexRows = state.ledger.slice(ledgerStart).filter((row) => row.kind === 'constructionCapex')
    expect(capexRows.reduce((sum, row) => sum + row.amount, 0)).toBe(-capex)
    // Only the founding office has paid its capex before the others were legal.
    const office = state.placement.facilities.find((f) => f.blueprintId === 'development-casting-office')!
    expect(office.status).toBe('operational')
    expect(office.completesWeek - office.placedWeek).toBe(14)
    expect(state.placement.facilities.filter((f) => f.status === 'underConstruction')).toHaveLength(3)
    expect(state.operations.facilities.map((f) => f.capability)).toEqual(['development-casting'])
    const durations = state.placement.facilities.map((f) => f.completesWeek - f.placedWeek)
    expect(durations).toEqual([14, 11, 16, 14])
    for (const placed of state.placement.facilities) {
      if (placed.id !== office.id) expect(placed.placedWeek).toBe(office.completesWeek)
    }
    for (let week = 0; week < 20; week++) {
      state = tick(state)
      for (const placed of state.placement.facilities) {
        const expectedStatus = state.market.tick >= placed.completesWeek ? 'operational' : 'underConstruction'
        expect(placed.status).toBe(expectedStatus)
      }
    }
    // Operations arrive in completion order: office (14), scenery (+11), post (+14), stage (+16).
    expect(state.operations.facilities.map((f) => f.capability)).toEqual(['development-casting', 'set-scenery', 'post', 'soundstage'])
    const opexRows = state.ledger.filter((row) => row.kind === 'facilityOpex')
    expect(opexRows.length).toBeGreaterThan(0)
    expect(Math.min(...opexRows.map((row) => row.week))).toBe(office.completesWeek) // the first charge lands on the completing advance, never before
    expect(cashBefore - state.studio.cash).toBeGreaterThan(capex) // capex + payroll + overhead + opex, nothing waived
  })

  it('save/load mid-construction continues byte-identically; same-week sites complete together in id order', () => {
    let a = bareLot('p09-r7')
    a = commit(a, 'development-casting-office')
    for (let week = 0; week < 14; week++) a = tick(a) // the founding office opens; the gate lifts
    // A second office is a real blueprint again, and the Post Building is 14 weeks too: the same completion week.
    a = applyActions(a, [{ kind: 'placeFacility', placement: { blueprintId: 'development-casting-office', origin: { gx: 16, gy: 3 } } }])
    a = commit(a, 'post-building')
    for (let week = 0; week < 5; week++) a = tick(a)
    let b = migrateToV18(importSave(exportSave(makeSave(a)))).state
    for (let week = 0; week < 12; week++) {
      a = tick(a)
      b = tick(b)
    }
    expect(exportSave(makeSave(b))).toBe(exportSave(makeSave(a)))
    const completedIds = a.placement.facilities.filter((f) => f.status === 'operational').map((f) => f.id)
    expect(completedIds).toEqual([1, 2, 3])
    expect(a.placement.facilities.slice(1).map((f) => f.completesWeek)).toEqual([28, 28])
    expect(a.operations.facilities.map((f) => f.capability)).toEqual(['development-casting', 'development-casting', 'post'])
  })
})

// ── R5 / R6 — the ordinary first film from the sparse start ──────────────────

describe('P09 R5/R6 — the ordinary bare-lot studio releases a picture on its own money', () => {
  it('a screenplay commission with no capacity queues, and admits itself when the office opens', () => {
    let state = bareLot('p09-r5')
    state = commit(state, 'development-casting-office')
    state = applyActions(state, [{ kind: 'commissionScript', project: commissionFor(state, 0, 0) }])
    expect(state.scriptDevelopment.projects).toEqual([])
    expect(state.productionQueue.map((entry) => entry.kind)).toEqual(['commissionScript'])
    for (let week = 0; week < 13; week++) state = tick(state)
    expect(state.operations.facilities).toEqual([])
    expect(state.productionQueue.map((entry) => entry.kind)).toEqual(['commissionScript'])
    state = tick(state) // week 14: the office completes on its committed week
    expect(state.operations.facilities.map((f) => f.capability)).toEqual(['development-casting'])
    // The queue admits itself no later than the advance after the office opens — never before,
    // and never by skipping the wait.
    if (state.productionQueue.length > 0) state = tick(state)
    expect(state.productionQueue).toEqual([])
    expect(state.scriptDevelopment.projects.length).toBe(1)
    expect(state.market.tick).toBeLessThanOrEqual(15)
  })

  it('HARD-STOP GATE: sparse start → four builds → screenplay → set → picture → release → receipts, cash never below zero', () => {
    let state = bareLot('p09-r6')
    const ledgerStart = state.ledger.length
    // P09 §10.3: the founding office first; the screenplay queues behind its capacity;
    // the rest of the plant is legal (and is built) once the office is operational.
    state = commit(state, 'development-casting-office')
    state = applyActions(state, [{ kind: 'commissionScript', project: commissionFor(state, 0, 0) }])
    let minCash = state.studio.cash
    let productionId: string | null = null
    let setCommissioned = false
    let plantCommitted = false
    let releaseWeek = -1
    for (let week = 0; week < 120; week++) {
      if (!plantCommitted && foundingPhaseOf(state) === 'satisfied') {
        for (const id of Object.keys(ORIGINS)) if (id !== 'development-casting-office') state = commit(state, id)
        plantCommitted = true
      }
      state = driveOps(state)
      // Accept the finished draft and greenlight it from the free roster.
      for (const project of state.scriptDevelopment.projects) {
        if (project.status === 'review') state = applyActions(state, [{ kind: 'acceptScript', projectId: project.id }])
      }
      for (const project of state.scriptDevelopment.projects) {
        if (project.status === 'ready' && productionId === null) {
          state = applyActions(state, [{ kind: 'greenlightScriptProject', production: freePackage(state, project.id) }])
          productionId = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id
        }
      }
      // Mount ONE house set on the built soundstage once scenery capacity exists (existing Set law).
      const stage = state.operations.facilities.find((f) => f.capability === 'soundstage')
      const scenery = state.operations.facilities.find((f) => f.capability === 'set-scenery')
      if (!setCommissioned && stage !== undefined && scenery !== undefined) {
        state = applyActions(state, [{ kind: 'commissionSet', commission: { blueprintId: 'set-house-generic', stageFacilityId: stage.id } }])
        setCommissioned = true
      }
      if (productionId !== null) {
        const production = state.studio.activeProductions.find((p) => p.id === productionId)
        if (production !== undefined && production.remainingTicks === 1 &&
            !state.releaseAuthority.commitments.some((c) => c.productionId === productionId)) {
          state = applyActions(state, [{ kind: 'commitPictureToRelease', productionId }])
        }
      }
      state = tick(state)
      minCash = Math.min(minCash, state.studio.cash)
      if (productionId !== null && releaseWeek < 0 && state.studio.releasedFilms.some((f) => f.productionId === productionId)) releaseWeek = state.market.tick
      if (releaseWeek >= 0 && state.theatricalRuns.find((r) => r.productionId === productionId)?.status === 'completed') break
    }
    expect(productionId, 'a picture was greenlit').not.toBeNull()
    expect(releaseWeek, 'the picture released').toBeGreaterThan(0)
    expect(state.theatricalRuns.find((r) => r.productionId === productionId)?.status).toBe('completed')
    const journey = state.ledger.slice(ledgerStart)
    const kinds = new Set(journey.map((row) => row.kind))
    // Every cost was real and paid from the studio's own cash.
    for (const kind of ['constructionCapex', 'facilityOpex', 'payroll', 'overhead'] as const) expect(kinds.has(kind), kind).toBe(true)
    expect(journey.some((row) => row.amount > 0 && row.kind === 'studioRevenue')).toBe(true)
    expect(journey.some((row) => /fixture|adjust/i.test(row.note ?? ''))).toBe(false)
    expect(minCash).toBeGreaterThan(0)
    // Cash reconciles to INITIAL_CASH + Σ ledger exactly (no hidden money).
    expect(state.studio.cash).toBe(state.ledger.reduce<number>((sum, row) => sum + row.amount, TUNING.INITIAL_CASH))
    // P08 history saw the founding and the release from this sparse start.
    expect(state.studioHistory.rows.some((row) => row.kind === 'studioFounded')).toBe(true)
    expect(state.studioHistory.rows.some((row) => row.kind === 'filmReleased' && row.productionId === productionId)).toBe(true)
    expect(state.foundingRegime).toBe('bare-lot')
    // The seal record: what it cost and when (printed for the checkpoint ledger).
    console.log(`[p09 gate] release week ${releaseWeek}; cash floor ${minCash}; final cash ${state.studio.cash}; weeks ${state.market.tick}`)
  })
})

// ── R8 (found by the W1 bridge test): the legacy Annex shortcut is property-driven ──
describe('P09A W0 R8 — the legacy Annex shortcut exists exactly where its reserved parcel does', () => {
  it('is offered on the endowed lot and NOT on a bare lot, and the read model never throws on either', () => {
    const endowedState = endowed('p09a-w0-r8')
    const bareState = bareLot('p09a-w0-r8')
    expect(legacyAnnexOffered(endowedState.property)).toBe(true)
    expect(legacyAnnexOffered(bareState.property)).toBe(false)
    expect(legacyAnnexOffered(INITIAL_PROPERTY)).toBe(true)
    expect(legacyAnnexOffered(BARE_LOT_PROPERTY)).toBe(false)

    const endowedView = studioConstructionView(endowedState)
    expect(endowedView.parcelId).toBe('expansion')
    expect(endowedView.status).toBe('vacant')

    const bareView = studioConstructionView(bareState)
    expect(bareView.mode).toBe('managed')
    expect(bareView.status).toBe('vacant')
    expect(bareView.parcelId).toBeNull()
    expect(bareView.canStart).toBe(false)
    expect(bareView.consequence).toContain('no reserved Annex parcel')
    // The shortcut action itself is refused loudly on a bare lot — never silently built elsewhere.
    expect(() => applyActions(bareState, [{ kind: 'startDevelopmentCastingAnnex' }])).toThrow(/legacy expansion parcel/)
    expect(bareState.placement.facilities).toHaveLength(0)
  })
})

// ── R9 — reservation-time evidence for a stage that rose AFTER the greenlight ──
describe('P09A W1 R9 — a picture may hold a stage that completed after its greenlight, from the stamped week only', () => {
  it('holds from bindings.heldSinceWeek; a stamp forged before completion is refused', () => {
    let state = commit(bareLot('p09-r9'), 'development-casting-office')
    state = applyActions(state, [{ kind: 'commissionScript', project: commissionFor(state, 0, 0) }])
    let productionId: string | null = null
    let plantCommitted = false
    for (let week = 0; week < 60; week++) {
      if (!plantCommitted && foundingPhaseOf(state) === 'satisfied') {
        for (const id of Object.keys(ORIGINS)) if (id !== 'development-casting-office') state = commit(state, id)
        plantCommitted = true
      }
      state = driveOps(state)
      for (const project of state.scriptDevelopment.projects) {
        if (project.status === 'review') state = applyActions(state, [{ kind: 'acceptScript', projectId: project.id }])
      }
      for (const project of state.scriptDevelopment.projects) {
        if (project.status === 'ready' && productionId === null) {
          state = applyActions(state, [{ kind: 'greenlightScriptProject', production: freePackage(state, project.id) }])
          productionId = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id
        }
      }
      const stage = state.operations.facilities.find((f) => f.capability === 'soundstage')
      const scenery = state.operations.facilities.find((f) => f.capability === 'set-scenery')
      if (stage !== undefined && scenery !== undefined && state.sets.length === 0) {
        state = applyActions(state, [{ kind: 'commissionSet', commission: { blueprintId: 'set-house-generic', stageFacilityId: stage.id } }])
      }
      state = tick(state)
      const workflow = state.operations.workflows.find((w) => w.productionId === productionId)
      if (workflow !== undefined && workflow.bindings.stageFacilityId !== null) break
    }
    const stagePlacement = state.placement.facilities.find((f) => f.blueprintId === 'stage-standard')!
    const workflow = state.operations.workflows.find((w) => w.productionId === productionId)!
    const production = state.studio.activeProductions.find((p) => p.id === productionId)!
    // The picture was greenlit BEFORE the stage completed, and holds it from the stamped week.
    expect(production.startTick).toBeLessThan(stagePlacement.completesWeek)
    expect(workflow.bindings.stageFacilityId).toBe(stagePlacement.facilityId)
    expect(workflow.bindings.heldSinceWeek).not.toBeNull()
    expect(workflow.bindings.heldSinceWeek!).toBeGreaterThanOrEqual(stagePlacement.completesWeek)
    expect(() => assertStudioPlacementInvariants(state)).not.toThrow()
    // A save that claims the stage was held before it stood is refused.
    const forged: GameState = {
      ...state,
      operations: {
        ...state.operations,
        workflows: state.operations.workflows.map((w) =>
          w.productionId === productionId
            ? { ...w, bindings: { ...w.bindings, heldSinceWeek: stagePlacement.completesWeek - 1 } }
            : w,
        ),
      },
    }
    expect(() => assertStudioPlacementInvariants(forged)).toThrow(/cannot reserve Soundstage before Week/)
  })
})
