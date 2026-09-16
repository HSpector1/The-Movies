// ── P13B-S4 — Direct gap-aware Office conversion: DOWNTIME + STANDARD LAW ────
// (tests 2 and 3)
//
// Requirement-derived from "S4 — Direct gap-aware Office conversion (Ready row 4)
// — task expansion" in docs/engineering/playability-launch-review/plans/
// P13B-HEADLESS-PLAN.md, tests 2 and 3's lists, the "Offline while converting"
// delegated decision, and companion `03-PAPER-ECONOMICS.md`'s "Office gap
// conversion, 52-week matched horizon" numbers as quoted verbatim in the plan
// (the companion file itself is not present in this worktree -- see the final
// report). Written against the contract as if `src/core/officeConversion.ts`
// and the two new `office-conversion-ii`/`office-conversion-iii` blueprints
// already existed -- neither does, so this whole file is RED by design (the
// first import fails at module resolution). See `tests/p13b-s4-quotes.test.ts`'s
// header for the full statement of the recorded process rule this follows.
//
// Generated worlds only; every dated fact used below comes from the live engine.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { BASELINE_DEVELOPMENT_OFFICE_TIER } from '../src/core/facilityEffects.js'
import { commitFacilityInstallation, commitPlacement } from '../src/core/placement.js'
import { blueprintForConcept } from '../src/core/screenplay.js'
import { tick } from '../src/core/tick.js'
// RED-by-design import: src/core/officeConversion.ts does not exist yet.
import { conversionQuote, developmentStandard, facilityOffline, highestOperationalDevelopmentStandard } from '../src/core/officeConversion.js'
import { advanceTo } from '../src/harness/p13a/fixtures.js'
import { s4BareOfficeStudio, s4NextOrigin } from '../src/harness/p13b/s4-fixtures.js'
import { commissionFor } from './_m4Fixtures.js'
import { managedStudio } from './contracts/_contractFixtures.js'

const inWindow = (w: number, weeks: number) => (e: { week: number }) => e.week >= w && e.week < w + weeks

describe('P13B-S4 downtime and money (test 2)', () => {
  it('a queued development intent waits offline (capacity 0, facilityOffline true) and is admitted the boundary after the conversion completes (C2a-M4 queue idiom)', () => {
    let state = managedStudio('p13b-s4-downtime-queue')
    const officeFacilityId = state.operations.facilities.find(f => f.capability === 'development-casting')!.id
    const committedWeek = state.market.tick
    state = commitFacilityInstallation(state, { blueprintId: 'office-conversion-iii', targetFacilityId: officeFacilityId })
    expect(facilityOffline(state, officeFacilityId)).toBe(true)
    expect(state.operations.facilities.find(f => f.id === officeFacilityId)!.capacity).toBe(0)

    const payload = commissionFor(state, 0, 0)
    state = applyActions(state, [{ kind: 'commissionScript', project: payload }])
    expect(state.productionQueue).toHaveLength(1)

    // 16 weeks offline: the intent stays queued THROUGH the completion week
    // itself (admission runs before this tick's P09 completions -- the same
    // ordering `tests/p13b-s3-admission.test.ts`'s "engine-conflict probe B"
    // proves for an installation module).
    for (let week = committedWeek; week < committedWeek + 16; week++) {
      state = tick(state)
      expect(state.productionQueue).toHaveLength(1)
    }
    expect(facilityOffline(state, officeFacilityId)).toBe(false)
    expect(state.operations.facilities.find(f => f.id === officeFacilityId)!.capacity).toBe(2)

    state = tick(state) // the FOLLOWING boundary: the slot is finally free
    expect(state.productionQueue).toEqual([])
    const started = state.scriptDevelopment.projects.find(p => p.conceptId === payload.conceptId)
    expect(started).toMatchObject({ status: 'drafting' })
  })

  it('direct I->III over a 52-week horizon: baseline continues every week, the $4,000 increment starts only once operational, and the ledger sums to document 03\'s $1,680,000', () => {
    const built = s4BareOfficeStudio('p13b-s4-downtime-direct')
    let state = built.state
    const w = state.market.tick
    state = commitFacilityInstallation(state, { blueprintId: 'office-conversion-iii', targetFacilityId: built.officeFacilityId })
    const conversionProjectId = state.placement.facilities.find(
      f => f.blueprintId === 'office-conversion-iii' && f.installation?.targetFacilityId === built.officeFacilityId,
    )!.projectId
    state = advanceTo(state, w + 52)

    const capexRows = state.ledger.filter(e => e.kind === 'constructionCapex' && e.constructionProjectId === conversionProjectId && inWindow(w, 52)(e))
    const opexRows = state.ledger.filter(e => e.kind === 'facilityOpex' && inWindow(w, 52)(e))
    const capexTotal = capexRows.reduce((sum, e) => sum - e.amount, 0)
    const opexTotal = opexRows.reduce((sum, e) => sum - e.amount, 0)

    expect(opexRows).toHaveLength(52) // one aggregated facilityOpex row per week, every week
    expect(capexTotal).toBe(1_250_000)
    // 16 weeks offline (baseline $5,500 only) + 36 weeks operational ($5,500 + $4,000):
    expect(opexTotal).toBe(16 * 5_500 + 36 * (5_500 + 4_000))
    expect(opexTotal).toBe(430_000)
    expect(capexTotal + opexTotal).toBe(1_680_000)
  })

  it('staged I->II then II->III, the second committed at the first\'s completion: the ledger sums to document 03\'s $1,796,000', () => {
    const built = s4BareOfficeStudio('p13b-s4-downtime-staged')
    let state = built.state
    const w = state.market.tick
    state = commitFacilityInstallation(state, { blueprintId: 'office-conversion-ii', targetFacilityId: built.officeFacilityId })
    state = advanceTo(state, w + 4) // I->II completes
    expect(developmentStandard(state, built.officeFacilityId)).toBe('II')
    state = commitFacilityInstallation(state, { blueprintId: 'office-conversion-iii', targetFacilityId: built.officeFacilityId }) // committed the SAME week
    state = advanceTo(state, w + 52)

    const capexTotal = state.ledger
      .filter(e => e.kind === 'constructionCapex' && inWindow(w, 52)(e) && (e.constructionProjectId ?? '').includes('office-conversion'))
      .reduce((sum, e) => sum - e.amount, 0)
    const opexTotal = state.ledger.filter(e => e.kind === 'facilityOpex' && inWindow(w, 52)(e)).reduce((sum, e) => sum - e.amount, 0)

    expect(capexTotal).toBe(1_350_000) // 500,000 (I->II) + 850,000 (II->III)

    // ADJUDICATED 2026-09-17 (coordinator, in response to this file's original
    // "open engine question" finding): $1,796,000 stands as the law. A
    // converting body is OFFLINE for the whole build, and increments are
    // charged only while the body is online AND operational, at its CURRENT
    // standard only -- so the II increment never lands during the II->III
    // work (the body reads II for one instant at week w+4, but the II->III
    // commit takes it straight back offline the SAME week, before any tick
    // ever reads it as a charging, operational II body), and after III
    // completes only the $4,000 III increment charges. Zero weeks of the
    // interim $2,500 II increment is therefore the CORRECT total, not an
    // approximation -- sim-core is expected to implement exactly that.
    expect(opexTotal).toBe(40 * 4_000 + 52 * 5_500)
    expect(opexTotal).toBe(446_000)
    expect(capexTotal + opexTotal).toBe(1_796_000)
  })

  it('a new standalone Development Office III on another plot: no downtime on the old office; the engine\'s lawful total is $1,776,000 (ENG-2 OPEN -- document 03\'s $1,646,000 needs the undisposed no-II-prerequisite product choice)', () => {
    const built = s4BareOfficeStudio('p13b-s4-downtime-standalone')
    let state = built.state
    // Sunk BEFORE the horizon starts (the same "capital sunk outside the
    // horizon" idiom `src/harness/p13b/fixtures.ts`'s `p13bTwoLabWorld`
    // documents): a standalone Development Office III requires an
    // OPERATIONAL Development Office II first (unchanged existing
    // requirement; ENG-2 removal is an open, uncoded product choice).
    const officeIIOrigin = s4NextOrigin(state, 'development-office-2')
    state = commitPlacement(state, { blueprintId: 'development-office-2', origin: officeIIOrigin })
    state = advanceTo(state, state.market.tick + 8)
    expect(state.placement.facilities.some(f => f.blueprintId === 'development-office-2' && f.status === 'operational')).toBe(true)

    const w = state.market.tick
    const officeIIIOrigin = s4NextOrigin(state, 'development-office-3')
    state = commitPlacement(state, { blueprintId: 'development-office-3', origin: officeIIIOrigin })
    state = advanceTo(state, w + 52)

    // The real office never went offline -- this is the standalone route, not a conversion.
    expect(state.operations.facilities.find(f => f.id === built.officeFacilityId)!.capacity).toBe(2)

    const capexTotal = state.ledger.filter(e => e.kind === 'constructionCapex' && inWindow(w, 52)(e)).reduce((sum, e) => sum - e.amount, 0)
    const opexTotal = state.ledger.filter(e => e.kind === 'facilityOpex' && inWindow(w, 52)(e)).reduce((sum, e) => sum - e.amount, 0)

    expect(capexTotal).toBe(1_200_000) // Development Office III's own capex

    // ADJUDICATED 2026-09-17 (coordinator, in response to this file's original
    // "contract conflict" finding): ENG-2 (a standalone III buildable without
    // ever owning an operational II) is an OPEN product choice the plan does
    // not code (plan §S4 delegated decisions: "new-III-without-II prerequisite
    // removal... still require disposition"). Document 03's $1,646,000 for
    // this route presumes ENG-2. The LAWFUL engine route -- the one this test
    // actually builds, asserted above -- requires an OPERATIONAL Development
    // Office II first, and that body is a genuinely owned, operational
    // `PlacedFacility` for the whole 52-week window, so its own $2,500/week is
    // a real charge under the plan's "old separately purchased II/III bodies
    // remain real with their charges" law. This asserts the ENGINE'S LAWFUL
    // TOTAL, decomposed so the $130,000 delta to document 03 (unreachable
    // while ENG-2 stays undisposed) is explicit rather than silently absorbed:
    const oldOfficeBaseline = 52 * 5_500 // 286,000 -- the real office, never offline
    const standaloneIIOpex = 52 * 2_500 // 130,000 -- the sunk, still-operational Office II; the ENG-2-dependent delta
    const standaloneIIIOpex = 40 * 4_000 // 160,000 -- 52 - 12 build weeks operational
    expect(opexTotal).toBe(oldOfficeBaseline + standaloneIIOpex + standaloneIIIOpex)
    expect(opexTotal).toBe(576_000)
    expect(capexTotal + opexTotal).toBe(1_776_000)
    // Document 03's own number, retained ONLY as the named delta -- not
    // asserted against the live ledger, since it is unreachable while ENG-2
    // stays an open, uncoded product choice.
    expect(capexTotal + opexTotal - standaloneIIOpex).toBe(1_646_000)
  })
})

describe('P13B-S4 standard law (test 3)', () => {
  it('a converted III body plus a standalone purchased II body: the ladder is III, and both are independently charged (nothing stacks, nothing is free)', () => {
    let state = managedStudio('p13b-s4-standard-both')
    const officeFacilityId = state.operations.facilities.find(f => f.capability === 'development-casting')!.id
    state = commitFacilityInstallation(state, { blueprintId: 'office-conversion-iii', targetFacilityId: officeFacilityId })
    state = advanceTo(state, state.market.tick + 16)
    expect(developmentStandard(state, officeFacilityId)).toBe('III')

    const officeIIOrigin = s4NextOrigin(state, 'development-office-2')
    state = commitPlacement(state, { blueprintId: 'development-office-2', origin: officeIIOrigin })
    state = advanceTo(state, state.market.tick + 8)
    const standaloneIIId = state.placement.facilities.find(f => f.blueprintId === 'development-office-2')!.facilityId

    expect(highestOperationalDevelopmentStandard(state)).toBe('III')
    // The standalone II body, asked in isolation, is still II -- the ladder is
    // a PRODUCER read (highest wins), never a per-body override.
    expect(developmentStandard(state, standaloneIIId)).toBe('II')
    // capacity:0 effect-only bodies never join the shared registry (existing,
    // non-S4 law -- `facilityEffects.ts`/`completeDuePlacements`).
    expect(state.operations.facilities.some(f => f.id === standaloneIIId)).toBe(false)

    state = tick(state)
    const latestOpex = [...state.ledger].reverse().find(e => e.kind === 'facilityOpex')!
    expect(latestOpex.amount).toBe(-(4_000 + 2_500)) // the III conversion's increment AND the standalone II's own charge, both real
  })

  it('converting the sole II-standard body to III drops the ladder to I during the work, and the quote discloses it', () => {
    let state = managedStudio('p13b-s4-standard-drop')
    const officeFacilityId = state.operations.facilities.find(f => f.capability === 'development-casting')!.id
    state = commitFacilityInstallation(state, { blueprintId: 'office-conversion-ii', targetFacilityId: officeFacilityId })
    state = advanceTo(state, state.market.tick + 4)
    expect(highestOperationalDevelopmentStandard(state)).toBe('II')

    const disclosed = conversionQuote(state, 'office-conversion-iii', officeFacilityId)
    expect(disclosed.standardDuringWork).toBe('I')

    state = commitFacilityInstallation(state, { blueprintId: 'office-conversion-iii', targetFacilityId: officeFacilityId })
    expect(facilityOffline(state, officeFacilityId)).toBe(true)
    expect(highestOperationalDevelopmentStandard(state)).toBe('I') // the sole standard-providing body is offline; nothing else stands
  })

  it('a screenplay minted and assessed before a conversion keeps its officeTierAtMint and assessed strength unchanged after the conversion completes (no retroactive change)', () => {
    let state = managedStudio('p13b-s4-standard-mint')
    const officeFacilityId = state.operations.facilities.find(f => f.capability === 'development-casting')!.id
    const payload = commissionFor(state, 0, 0)
    state = applyActions(state, [{ kind: 'commissionScript', project: payload }])
    state = tick(state) // SCRIPT_DRAFT_WEEKS_POOL === 1: the draft completes and is assessed this tick

    const beforeProject = state.scriptDevelopment.projects.find(p => p.conceptId === payload.conceptId)!
    expect(beforeProject.status).toBe('review')
    const beforeAssessment = beforeProject.assessment
    const beforeBlueprint = blueprintForConcept(state.originalScreenplays, payload.conceptId)!
    expect(beforeBlueprint.officeTierAtMint).toBe(BASELINE_DEVELOPMENT_OFFICE_TIER)

    state = commitFacilityInstallation(state, { blueprintId: 'office-conversion-iii', targetFacilityId: officeFacilityId })
    state = advanceTo(state, state.market.tick + 16)
    expect(developmentStandard(state, officeFacilityId)).toBe('III')

    const afterProject = state.scriptDevelopment.projects.find(p => p.conceptId === payload.conceptId)!
    const afterBlueprint = blueprintForConcept(state.originalScreenplays, payload.conceptId)!
    expect(afterProject.assessment).toEqual(beforeAssessment)
    expect(afterBlueprint.officeTierAtMint).toBe(beforeBlueprint.officeTierAtMint)
  })
})
