// ── P13B-S4 — Direct gap-aware Office conversion: QUOTES (test 1) ───────────
//
// Requirement-derived from "S4 — Direct gap-aware Office conversion (Ready row 4)
// — task expansion" in docs/engineering/playability-launch-review/plans/
// P13B-HEADLESS-PLAN.md, test 1's list and the "Delegated implementation
// decisions" / "API the tests assert" sections of the S4 assignment. Written
// against the contract as if `src/core/officeConversion.ts` and the two new
// `tuning.ts` installation blueprints (`office-conversion-ii`,
// `office-conversion-iii`) already existed — none of them do yet, so this whole
// file is RED by design (the very first import fails at module resolution:
// `Cannot find module '../src/core/officeConversion.js'`). This is the SAME
// recorded process rule `tests/p13b-s3-validation.test.ts` documents (a MISSING
// NAMED EXPORT from an EXISTING module binds to `undefined` under this vite/
// vitest transform rather than throwing; a module that does not exist AT ALL
// fails at resolution, before any binding check, which is the clean uniform
// failure this file needs) — every case below imports a REAL binding
// (`conversionQuote`, `developmentStandard`) from the not-yet-existing module,
// never only a type, so nothing here can spuriously pass for the wrong reason.
//
// Generated worlds only; every dated fact used below comes from the live engine.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import {
  FACILITY_INSTALLATION_BLUEPRINT_IDS,
  commitFacilityInstallation,
  queryFacilityInstallation,
  queryPlacement,
} from '../src/core/placement.js'
// RED-by-design import: src/core/officeConversion.ts does not exist yet.
import { conversionQuote, developmentStandard } from '../src/core/officeConversion.js'
import { advanceTo, p13aLaboratorySlice } from '../src/harness/p13a/fixtures.js'
import { s4FirstCleanOrigin } from '../src/harness/p13b/s4-fixtures.js'
import { commissionFor } from './_m4Fixtures.js'
import { managedStudio, withCash } from './contracts/_contractFixtures.js'

function officeIdOf(state: ReturnType<typeof p13aLaboratorySlice>): string {
  return state.operations.facilities.find(f => f.capability === 'development-casting')!.id
}

describe('P13B-S4 quotes (test 1)', () => {
  it('office-conversion-ii and office-conversion-iii are registered installation blueprints', () => {
    expect(FACILITY_INSTALLATION_BLUEPRINT_IDS).toContain('office-conversion-ii')
    expect(FACILITY_INSTALLATION_BLUEPRINT_IDS).toContain('office-conversion-iii')
  })

  it('I->II quotes $500,000 over 4 weeks', () => {
    const state = p13aLaboratorySlice()
    const officeFacilityId = officeIdOf(state)
    expect(developmentStandard(state, officeFacilityId)).toBe('I')
    const quote = queryFacilityInstallation(state, { blueprintId: 'office-conversion-ii', targetFacilityId: officeFacilityId })
    expect(quote.ok).toBe(true)
    expect(quote.cost).toBe(500_000)
    expect(quote.buildWeeks).toBe(4)
  })

  it('I->III quotes $1,250,000 over 16 weeks on a studio that never owned II, naming only the conversion', () => {
    const state = p13aLaboratorySlice()
    const officeFacilityId = officeIdOf(state)
    const quote = queryFacilityInstallation(state, { blueprintId: 'office-conversion-iii', targetFacilityId: officeFacilityId })
    expect(quote.ok).toBe(true)
    expect(quote.cost).toBe(1_250_000)
    expect(quote.buildWeeks).toBe(16)
    // Never a hidden obsolete-II purchase (companion §6): no component prices
    // the $600,000 Development Office II capex, and the disclosed components
    // account for the whole price on their own.
    expect(quote.components.some(c => c.cost === 600_000)).toBe(false)
    expect(quote.components.reduce((sum, c) => sum + c.cost, 0)).toBe(quote.cost)
    const disclosed = conversionQuote(state, 'office-conversion-iii', officeFacilityId)
    expect(disclosed).toMatchObject({ cost: 1_250_000, buildWeeks: 16, fromStandard: 'I', toStandard: 'III' })
  })

  it('II->III quotes $850,000 over 8 weeks on a body already converted to II; the staged sum exceeds the direct price', () => {
    let state = p13aLaboratorySlice()
    const officeFacilityId = officeIdOf(state)
    state = commitFacilityInstallation(state, { blueprintId: 'office-conversion-ii', targetFacilityId: officeFacilityId })
    state = advanceTo(state, state.market.tick + 4)
    expect(developmentStandard(state, officeFacilityId)).toBe('II')
    const quote = queryFacilityInstallation(state, { blueprintId: 'office-conversion-iii', targetFacilityId: officeFacilityId })
    expect(quote.ok).toBe(true)
    expect(quote.cost).toBe(850_000)
    expect(quote.buildWeeks).toBe(8)
    const stagedSum = 500_000 + quote.cost
    expect(stagedSum).toBe(1_350_000)
    expect(stagedSum).toBeGreaterThan(1_250_000) // staged always costs more than a direct I->III
  })

  it('refuses a Laboratory target with incompatibleTarget', () => {
    const state = p13aLaboratorySlice()
    const laboratoryFacilityId = state.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const quote = queryFacilityInstallation(state, { blueprintId: 'office-conversion-ii', targetFacilityId: laboratoryFacilityId })
    expect(quote.ok).toBe(false)
    expect(quote.rejections).toContain('incompatibleTarget')
  })

  it('refuses a body already at III with standardAlreadyMet', () => {
    let state = p13aLaboratorySlice()
    const officeFacilityId = officeIdOf(state)
    state = commitFacilityInstallation(state, { blueprintId: 'office-conversion-iii', targetFacilityId: officeFacilityId })
    state = advanceTo(state, state.market.tick + 16)
    expect(developmentStandard(state, officeFacilityId)).toBe('III')
    const quote = queryFacilityInstallation(state, { blueprintId: 'office-conversion-iii', targetFacilityId: officeFacilityId })
    expect(quote.ok).toBe(false)
    expect(quote.rejections).toContain('standardAlreadyMet')
  })

  it('refuses an occupied slot with targetEngaged (a script commission holding the shared office)', () => {
    const state = managedStudio('p13b-s4-quotes-engaged')
    const officeFacilityId = officeIdOf(state)
    const committed = applyActions(state, [{ kind: 'commissionScript', project: commissionFor(state, 0, 0) }])
    const quote = queryFacilityInstallation(committed, { blueprintId: 'office-conversion-ii', targetFacilityId: officeFacilityId })
    expect(quote.ok).toBe(false)
    expect(quote.rejections).toContain('targetEngaged')
  })

  it('refuses insufficient funds', () => {
    const state = withCash(p13aLaboratorySlice(), 100_000)
    const officeFacilityId = officeIdOf(state)
    const quote = queryFacilityInstallation(state, { blueprintId: 'office-conversion-ii', targetFacilityId: officeFacilityId })
    expect(quote.ok).toBe(false)
    expect(quote.rejections).toContain('insufficientFunds')
  })

  it('BUG (RED, engine gap): a running takesTargetOffline conversion must keep engaging its own body via targetEngaged, independent of registry capacity', () => {
    // Reported 2026-09-17 as a side finding while fixing this file's own
    // targetEngaged fixture premise (evidence PROBE B / 05-red-engagement):
    // a "two conversions on one target" idiom could not demonstrate
    // targetEngaged, because the FIRST conversion's own commit already zeroes
    // the body's registry capacity (`placement.ts` `withConversionDowntime`),
    // and `occupancy.ts`'s `resourceClaims` generates an 'installation' claim
    // by iterating `0..facility.capacity` for an underConstruction
    // installation -- zero capacity means zero claims, so a running
    // conversion never engages its OWN body once it has taken it offline.
    //
    // LAW (coordinator, 2026-09-17): while a `takesTargetOffline` installation
    // is under construction on a body, that body is engaged by the running
    // work for its whole span -- the same `targetEngaged` refusal a Lab
    // module under construction gives a second module, independent of
    // registry capacity.
    let state = p13aLaboratorySlice()
    const officeFacilityId = officeIdOf(state)
    const runningWeek = state.market.tick
    state = commitFacilityInstallation(state, { blueprintId: 'office-conversion-iii', targetFacilityId: officeFacilityId })
    const runningPlacement = state.placement.facilities.find(f => f.installation?.targetFacilityId === officeFacilityId)!
    expect(runningPlacement.status).toBe('underConstruction')

    for (const weekOffset of [0, 1]) {
      const probe = advanceTo(state, runningWeek + weekOffset)
      const iiQuote = queryFacilityInstallation(probe, { blueprintId: 'office-conversion-ii', targetFacilityId: officeFacilityId })
      const iiiQuote = queryFacilityInstallation(probe, { blueprintId: 'office-conversion-iii', targetFacilityId: officeFacilityId })

      expect(iiQuote.ok).toBe(false)
      expect(iiQuote.rejections).toContain('targetEngaged')
      expect(iiQuote.holders).toContainEqual(expect.objectContaining({ kind: 'installation', holderId: runningPlacement.projectId }))
      expect(iiiQuote.ok).toBe(false)
      expect(iiiQuote.rejections).toContain('targetEngaged')
      expect(iiiQuote.holders).toContainEqual(expect.objectContaining({ kind: 'installation', holderId: runningPlacement.projectId }))

      // `commitFacilityInstallation` is documented byte-neutral on a refused
      // request (placement.ts: "a refused or stale request is byte-neutral"
      // -- existing, non-S4 law): it returns the caller's state UNCHANGED
      // rather than throwing, so a refused commit is asserted by reference
      // equality here, not `toThrow`.
      expect(commitFacilityInstallation(probe, { blueprintId: 'office-conversion-ii', targetFacilityId: officeFacilityId })).toBe(probe)
      expect(commitFacilityInstallation(probe, { blueprintId: 'office-conversion-iii', targetFacilityId: officeFacilityId })).toBe(probe)
    }

    state = advanceTo(state, runningWeek + 16)
    expect(developmentStandard(state, officeFacilityId)).toBe('III')
    const iiAfter = queryFacilityInstallation(state, { blueprintId: 'office-conversion-ii', targetFacilityId: officeFacilityId })
    const iiiAfter = queryFacilityInstallation(state, { blueprintId: 'office-conversion-iii', targetFacilityId: officeFacilityId })
    expect(iiAfter.rejections).toContain('standardAlreadyMet')
    expect(iiiAfter.rejections).toContain('standardAlreadyMet')
  })

  it('a standalone Development Office III is still refused without II, wording unchanged (existing, non-S4 law)', () => {
    const state = p13aLaboratorySlice()
    // FIXTURE PREMISE FIX (measured 2026-09-17, evidence PROBE A): `s4NextOrigin`
    // only ever returns a wholly-`ok` origin and cannot serve a case that is
    // precisely ABOUT a requirement refusal -- of the 576 origins on this
    // generated lot, none is `ok:true` for `development-office-3` (it always
    // needs an operational Development Office II first), so the ORIGINAL
    // `s4NextOrigin` call here threw instead of exercising the law. The law
    // itself holds verbatim at a real, geometrically clean origin.
    const origin = s4FirstCleanOrigin(state, 'development-office-3')
    const quote = queryPlacement(state, { blueprintId: 'development-office-3', origin })
    expect(quote.ok).toBe(false)
    expect(quote.rejections).toContain('requirementsUnmet')
    expect(quote.unmetRequirements[0]!.reason).toBe('Requires an operational Development Office II.')
  })
})
