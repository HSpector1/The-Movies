// ── P13B-S4 — Direct gap-aware Office conversion: VALIDATION (test 5) ───────
//
// Requirement-derived from "S4 — Direct gap-aware Office conversion (Ready row 4)
// — task expansion" in docs/engineering/playability-launch-review/plans/
// P13B-HEADLESS-PLAN.md, test 5's list ("Conservation, determinism, save/reload
// (V23 unchanged...), validator refusals for forged conversion facts..., campaign
// isolation") and the "API the tests assert" section's three forged-refusal
// message patterns. Written against the contract as if
// `src/core/officeConversion.ts` and the two new `office-conversion-ii`/
// `office-conversion-iii` blueprints already existed -- neither does, so this
// whole file is RED by design (the first import fails at module resolution).
// See `tests/p13b-s4-quotes.test.ts`'s header for the full statement of the
// recorded process rule this follows.
//
// FORGE-AND-REFUSE, not organic gameplay, for the three refusal cases -- the
// SAME idiom `tests/p13b-s3-validation.test.ts` establishes and
// `src/harness/p13b/s3-fixtures.ts`'s `s3ForgeAndReimport` implements (reused
// directly here, never edited): round-trip a REAL, lawfully-reached state
// through its own exported save JSON, injecting a hand-authored
// `PlacedFacility`-shaped conversion record on the PARSED envelope before
// re-import. Nothing in this engine can yet produce a genuine conversion
// placement at all, so a forged record anchored to REAL facility/property facts
// (never an invented parcel or origin) is the honest way to exercise a validator
// that does not exist yet either.

import { describe, expect, it } from 'vitest'
import { rivalStartingFacilities } from '../src/core/hollywood.js'
import { commitFacilityInstallation, queryFacilityInstallation } from '../src/core/placement.js'
import { exportSave, importSave, makeSave } from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
// RED-by-design import: src/core/officeConversion.ts does not exist yet.
import { developmentStandard } from '../src/core/officeConversion.js'
import { advanceTo, p13aLaboratorySlice } from '../src/harness/p13a/fixtures.js'
import { s3ForgeAndReimport } from '../src/harness/p13b/s3-fixtures.js'

function officeIdOf(state: GameState): string {
  return state.operations.facilities.find(f => f.capability === 'development-casting')!.id
}

describe('P13B-S4 conservation, determinism, save/reload (test 5)', () => {
  it('conservation: the conversion\'s constructionCapex equals the committed quote, and cash reconciles exactly against the ledger', () => {
    const base = p13aLaboratorySlice()
    const officeFacilityId = officeIdOf(base)
    const quote = queryFacilityInstallation(base, { blueprintId: 'office-conversion-ii', targetFacilityId: officeFacilityId })
    let state = commitFacilityInstallation(base, { blueprintId: 'office-conversion-ii', targetFacilityId: officeFacilityId })
    state = advanceTo(state, state.market.tick + 20)

    const newLedgerRows = state.ledger.slice(base.ledger.length)
    const capexRows = newLedgerRows.filter(e => e.kind === 'constructionCapex' && (e.note ?? '').toLowerCase().includes('office'))
    expect(capexRows.reduce((sum, e) => sum - e.amount, 0)).toBe(quote.cost)
    expect(state.studio.cash).toBe(base.studio.cash + newLedgerRows.reduce((sum, e) => sum + e.amount, 0))
  })

  it('determinism: the same actions from the same seed produce a byte-identical exportSave', () => {
    const run = (): GameState => {
      const base = p13aLaboratorySlice()
      const officeFacilityId = officeIdOf(base)
      const state = commitFacilityInstallation(base, { blueprintId: 'office-conversion-iii', targetFacilityId: officeFacilityId })
      return advanceTo(state, state.market.tick + 20)
    }
    expect(exportSave(makeSave(run()))).toBe(exportSave(makeSave(run())))
  })

  it('save/reload mid-conversion continues identically (Save V23 unchanged -- a conversion is a normal placement record)', () => {
    const base = p13aLaboratorySlice()
    const officeFacilityId = officeIdOf(base)
    let live = commitFacilityInstallation(base, { blueprintId: 'office-conversion-iii', targetFacilityId: officeFacilityId })
    live = advanceTo(live, live.market.tick + 6) // still under construction (16-week build)
    const reloaded = (importSave(exportSave(makeSave(live))) as unknown as { state: GameState }).state

    const liveFinished = advanceTo(live, live.market.tick + 10)
    const reloadedFinished = advanceTo(reloaded, reloaded.market.tick + 10)
    expect(exportSave(makeSave(reloadedFinished))).toBe(exportSave(makeSave(liveFinished)))
    expect(developmentStandard(reloadedFinished, officeFacilityId)).toBe('III')
  })
})

describe('P13B-S4 validator refusals for forged conversion facts (test 5)', () => {
  const base = p13aLaboratorySlice()
  const officeFacilityId = officeIdOf(base)
  const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
  // Anchored to the REAL founding-office property structure -- never an
  // invented parcel or origin (the same discipline
  // `tests/p13b-s3-validation.test.ts`'s baseline uses for its acoustic
  // placement anchor).
  const officeStructure = base.property.structures.find(s => s.providesFacilityIds.includes(officeFacilityId))!

  function injectConversion(parsed: Record<string, unknown>, suffix: string, overrides: Record<string, unknown> = {}): void {
    const state = parsed.state as Record<string, unknown>
    const placement = state.placement as Record<string, unknown>
    const facilities = placement.facilities as Record<string, unknown>[]
    const nextId = placement.nextPlacementId as number
    facilities.push({
      id: nextId,
      blueprintId: 'office-conversion-ii',
      parcelId: officeStructure.id,
      origin: { ...officeStructure.origin },
      cells: [],
      facilityId: `facility-office-conversion-forged-${suffix}`,
      projectId: `installation-office-conversion-forged-${suffix}`,
      status: 'operational',
      placedWeek: base.market.tick,
      completesWeek: base.market.tick + 4,
      installation: { targetFacilityId: officeFacilityId },
      ...overrides,
    })
    placement.nextPlacementId = nextId + 1
  }

  it('(a) rejects a conversion whose target is not a development body', () => {
    expect(() =>
      s3ForgeAndReimport(base, parsed => injectConversion(parsed, 'a', { installation: { targetFacilityId: laboratoryFacilityId } })),
    ).toThrow(/development body/)
  })

  it('(b) rejects two operational conversions of the same standard on one body', () => {
    expect(() =>
      s3ForgeAndReimport(base, parsed => {
        injectConversion(parsed, 'a')
        injectConversion(parsed, 'b')
      }),
    ).toThrow(/duplicate conversion|same standard/)
  })

  it('(c) rejects a conversion whose target has no body', () => {
    expect(() =>
      s3ForgeAndReimport(base, parsed => injectConversion(parsed, 'a', { installation: { targetFacilityId: 'facility-does-not-exist' } })),
    ).toThrow(/no body|missing body/)
  })
})

describe('P13B-S4 campaign isolation (test 5)', () => {
  it('a rival studio\'s facility can never be a conversion target from the player\'s actions', () => {
    const state = p13aLaboratorySlice()
    const rivalStudioId = state.hollywood!.identities.find(i => i.role === 'rival')!.studioId
    const rivalOfficeId = rivalStartingFacilities(rivalStudioId).find(f => f.capability === 'development-casting')!.id
    const quote = queryFacilityInstallation(state, { blueprintId: 'office-conversion-ii', targetFacilityId: rivalOfficeId })
    expect(quote.ok).toBe(false)
    // A rival facility id is never a member of the player's own operations
    // registry -- `RivalBusiness.operations.facilities` (hollywood.ts) is a
    // wholly separate object graph this query never reads -- so the refusal
    // it gives is the structural one: the target does not exist as far as the
    // player's own actions are concerned.
    expect(quote.rejections).toContain('unknownTarget')
  })
})
