// ── P13B-S6 test 1: cancellation receipts by exact trace ────────────────────
//
// Requirement-derived from "S6 — Option-B installation cancellation with
// component receipts and restoration" task expansion in
// docs/engineering/playability-launch-review/plans/P13B-HEADLESS-PLAN.md
// ("Tests" item 1 and the "Delegated implementation decisions" it names) and
// its binding "Audit refinements" addendum (adopted at f70221f): component
// progress is DERIVED, never stored — component k spans
// [start_k, start_k + weeks_k) from the placement's own `placedWeek`; at cancel
// week w a component is `completed` (end ≤ w, paid in full), `inProgress`
// (start < w < end; worked = w − start whole weeks; paid = cost·worked/weeks
// rounded toward the studio's favour, remainder refunded) or `unstarted`
// (w ≤ start, refunded in full). The zero-week sound capture package (authored
// third) is paid iff the component authored before it (installation) has
// completed, else refunded. Restoration ($25,000/2w sound, $10,000/1w
// lighting — candidate tuning per the plan) auto-commits only when a `site`
// component had begun.
//
// RED-by-design: `src/core/installationCancellation.ts` does not exist yet (no
// S6 engine increment is landed). `cancellationQuote` and `RESTORATION_BLUEPRINTS`
// are the ONLY imports from that new module, and they are the file's first
// import — the whole file fails at module resolution
// ("Cannot find module '../src/core/installationCancellation.js'") before any
// test body runs, for exactly one cause. Every other import below is from a
// REAL, EXISTING module (`actions.js`, `placement.js`, `officeConversion.js`,
// the p13a/p13b harness) — never a not-yet-existing NAMED export of an
// existing module, which vite/esbuild would silently bind to `undefined`
// instead of failing resolution (the MEASURED FINDING `tests/p13b-s5-quotes
// .test.ts`'s header states and every later P13B test-author file repeats).
//
// INTERPRETATIONS NAMED (the plan gives exemplar names — `cancellationQuote`,
// `componentProgress`, `RESTORATION_BLUEPRINTS` — not full signatures; the
// shapes below are this file's own derivation, modelled on the sibling
// `AdoptionQuote`/`adoptionQuote` pair S5 already shipped):
//   1. `cancellationQuote(state, {projectId}): {ok, refusal, rejections,
//      components: {label, cost, weeks, status, paid, refunded}[], refund,
//      restorationRequired}` — a PRE-COMMIT read, mirroring `adoptionQuote`.
//   2. The COMMITTED `CancellationReceipt` (on `PlacedFacility.cancellation`)
//      is exactly as the plan states verbatim: `{projectId, week, components,
//      refund, restorationProjectId}`.
//   3. The `constructionRefund` ledger row's `amount` is POSITIVE (an inflow),
//      by direct analogy with the ALREADY-ESTABLISHED `facilityDemolitionRefund`
//      convention (`src/core/types.ts` ~1215: "A POSITIVE amount — the only
//      inflow in the construction family — carrying the SAME
//      `constructionProjectId` as the capex row it refunds"). The plan states
//      "amount = Σ refunds" without naming a sign; every other refund/credit
//      ledger kind in this codebase is positive, so this is the only
//      consistent reading, not a guess.
//   4. Actions `cancelInstallation {projectId}` / `cancelAdoption {adoptionId}`
//      are cast `as never` (not yet in the `Action` union), matching the
//      established idiom for a not-yet-existing action kind
//      (`tests/p13b-s5-quotes.test.ts`'s own `adoptTechnology as never` calls).
//
// PREMISE NOT SATISFIED, NAMED (not invented around): the plan's own money
// figures for every authored blueprint divide their cost evenly by their own
// weeks (lighting 50,000/2, sound site 450,000/9, sound installation
// 150,000/3, sound Post 300,000/6, Office II 500,000/4 — every quotient is a
// whole dollar). No lawfully-reached fixture can exercise "rounded toward the
// studio's favour" on a genuine fraction. The one supplementary case below
// tests that clause directly against the pure per-component derivation with a
// hand-authored, non-dividing component — a direct unit test of the pure
// function, not a claim about a reachable game state.
//
// GAP NAMED (not invented around): the plan's own restoration figures are
// "$25k/2 weeks sound, $10k/1 week lighting (candidate tuning)" and a THIRD
// clause, "restoration-office for S4 conversions at the II/III component's own
// site cost share (candidate)" — but `office-conversion-ii`/`-iii`
// (`src/core/tuning.ts` ~1320-1345, read 2026-09-17) author ONE
// `installationComponents` line each ("Office conversion to Development Office
// II/III"), never a separate `site` sub-component with its own cost share to
// take a "share" OF. No authoritative source in this tree pins a
// restoration-office dollar figure or week count. The Office II case below
// asserts only what is derivable without inventing one: that cancellation
// mid-way pays/refunds the SINGLE authored component by elapsed time, that a
// `restoration-office` job is auto-committed and takes the target offline
// (S4's own `takesTargetOffline` law, already proven), and that the office
// comes back online once ITS OWN authored `buildWeeks`/`installationComponents`
// elapse — never a specific figure this file would have to invent.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { facilityOffline } from '../src/core/officeConversion.js'
import { commitFacilityInstallation, queryFacilityInstallation } from '../src/core/placement.js'
import { advanceTo } from '../src/harness/p13a/fixtures.js'
import { s4BareOfficeStudio } from '../src/harness/p13b/s4-fixtures.js'
import { s6LightingReady, s6SoundReady } from '../src/harness/p13b/s6-fixtures.js'
// RED-by-design: src/core/installationCancellation.ts does not exist yet — see
// this file's header. `cancellationQuote` and `RESTORATION_BLUEPRINTS` are the
// ONLY imports from the new module.
import { cancellationQuote, componentProgress, RESTORATION_BLUEPRINTS } from '../src/core/installationCancellation.js'

function noNegativeLine(components: readonly { paid: number; refunded: number }[]): void {
  for (const c of components) {
    expect(c.paid).toBeGreaterThanOrEqual(0)
    expect(c.refunded).toBeGreaterThanOrEqual(0)
  }
}
function totalPaid(components: readonly { paid: number }[]): number {
  return components.reduce((sum, c) => sum + c.paid, 0)
}

describe('P13B-S6 cancellation receipts by exact trace (test 1)', () => {
  it('lighting cancelled exactly when site completes (week 2 of 4): site paid in full, installation refunded in full, restoration committed', () => {
    const { state: committed, stageProjectId, stageFacilityId } = s6LightingReady()
    const committedWeek = committed.market.tick
    const state = advanceTo(committed, committedWeek + 2)

    const quote = cancellationQuote(state, { projectId: stageProjectId })
    expect(quote.ok).toBe(true)
    const site = quote.components.find(c => c.label.toLowerCase().includes('site'))!
    const installation = quote.components.find(c => c.label.toLowerCase().includes('installation'))!
    expect(site.status).toBe('completed')
    expect(site.paid).toBe(50_000)
    expect(site.refunded).toBe(0)
    expect(installation.status).toBe('unstarted') // start_k (2) === w (2): never "one week in progress"
    expect(installation.paid).toBe(0)
    expect(installation.refunded).toBe(50_000)
    expect(totalPaid(quote.components)).toBe(50_000)
    expect(quote.refund).toBe(50_000)
    expect(quote.restorationRequired).toBe(true) // site work HAD begun (and finished)
    noNegativeLine(quote.components)

    const cancelled = applyActions(state, [{ kind: 'cancelInstallation', projectId: stageProjectId } as never])
    const placement = cancelled.placement.facilities.find(f => f.projectId === stageProjectId)!
    expect(placement.status).toBe('cancelled')
    expect((placement as unknown as { cancellation: { refund: number; week: number; restorationProjectId: string | null } }).cancellation)
      .toMatchObject({ week: committedWeek + 2, refund: 50_000 })
    const restorationProjectId = (placement as unknown as { cancellation: { restorationProjectId: string | null } }).cancellation.restorationProjectId
    expect(restorationProjectId).not.toBeNull()

    const refundRows = cancelled.ledger.filter(e => e.kind === 'constructionRefund' && (e as unknown as { constructionProjectId: string }).constructionProjectId === stageProjectId)
    expect(refundRows).toHaveLength(1)
    expect(refundRows[0]!.amount).toBe(50_000) // POSITIVE inflow — see header INTERPRETATION 3
    expect(refundRows[0]!.week).toBe(committedWeek + 2)

    const restoration = cancelled.placement.facilities.find(f => f.projectId === restorationProjectId)!
    expect(restoration.blueprintId).toBe('restoration-lighting-stage')
    expect(restoration.installation?.targetFacilityId).toBe(stageFacilityId)
    expect(restoration.status).toBe('underConstruction')
    const restorationBlueprint = RESTORATION_BLUEPRINTS.find(b => b.id === 'restoration-lighting-stage')!
    expect(restorationBlueprint.capex).toBe(10_000)
    expect(restorationBlueprint.installationComponents?.[0]?.weeks).toBe(1)
    expect(restorationBlueprint.takesTargetOffline).toBe(true)
  })

  it('lighting cancelled during installation (week 1 of 2, elapsed 3 of 4): site paid in full, installation half paid / half refunded', () => {
    const { state: committed, stageProjectId } = s6LightingReady()
    const state = advanceTo(committed, committed.market.tick + 3)
    const quote = cancellationQuote(state, { projectId: stageProjectId })
    const site = quote.components.find(c => c.label.toLowerCase().includes('site'))!
    const installation = quote.components.find(c => c.label.toLowerCase().includes('installation'))!
    expect(site.paid).toBe(50_000)
    expect(site.refunded).toBe(0)
    expect(installation.status).toBe('inProgress')
    expect(installation.paid).toBe(25_000)
    expect(installation.refunded).toBe(25_000)
    expect(totalPaid(quote.components)).toBe(75_000)
    expect(quote.refund).toBe(25_000)
    noNegativeLine(quote.components)
  })

  it('sound stage cancelled during site adaptation (week 3 of 9): site partially paid, installation and the zero-week capture package both refunded in full', () => {
    const { state: committed, stageProjectId } = s6SoundReady()
    const state = advanceTo(committed, committed.market.tick + 3) // week 306
    const quote = cancellationQuote(state, { projectId: stageProjectId })
    const site = quote.components.find(c => c.label.toLowerCase().includes('site'))!
    const installation = quote.components.find(c => c.label.toLowerCase() === 'equipment installation')!
    const capture = quote.components.find(c => c.label.toLowerCase().includes('capture'))!
    expect(site.status).toBe('inProgress')
    expect(site.paid).toBe(150_000)
    expect(site.refunded).toBe(300_000)
    expect(installation.status).toBe('unstarted')
    expect(installation.paid).toBe(0)
    expect(installation.refunded).toBe(150_000)
    // Zero-week capture, authored third: refunded because "Equipment installation"
    // (authored immediately before it) has NOT completed.
    expect(capture.status).toBe('unstarted')
    expect(capture.paid).toBe(0)
    expect(capture.refunded).toBe(75_000)
    expect(totalPaid(quote.components)).toBe(150_000)
    expect(quote.refund).toBe(525_000) // 300,000 + 150,000 + 75,000
    expect(quote.restorationRequired).toBe(true)
    noNegativeLine(quote.components)
  })

  it('sound Post cancelled in the same week it was committed (unstarted): refunded in full, no restoration (no `site` component on a Post fit-out)', () => {
    const { state, postProjectId } = s6SoundReady() // state.market.tick === 303 === the Post's own placedWeek
    const quote = cancellationQuote(state, { projectId: postProjectId })
    expect(quote.components).toHaveLength(1)
    expect(quote.components[0]!.status).toBe('unstarted')
    expect(quote.components[0]!.paid).toBe(0)
    expect(quote.components[0]!.refunded).toBe(300_000)
    expect(quote.refund).toBe(300_000)
    expect(quote.restorationRequired).toBe(false)

    const cancelled = applyActions(state, [{ kind: 'cancelInstallation', projectId: postProjectId } as never])
    const placement = cancelled.placement.facilities.find(f => f.projectId === postProjectId)!
    expect(placement.status).toBe('cancelled')
    expect((placement as unknown as { cancellation: { restorationProjectId: string | null } }).cancellation.restorationProjectId).toBeNull()
  })

  it('S4 Office II cancelled mid-way (week 2 of 4): paid half, refunded half, restoration takes the office offline, and it is restored online once restoration completes — GAP NAMED: no restoration-office dollar/week figure is asserted (see header)', () => {
    const { state: base, officeFacilityId } = s4BareOfficeStudio('p13b-s6-office-ii-cancel')
    const quote0 = queryFacilityInstallation(base, { blueprintId: 'office-conversion-ii', targetFacilityId: officeFacilityId })
    if (!quote0.ok) throw new Error(`fixture refused office-conversion-ii: ${JSON.stringify(quote0.rejections)}`)
    const committed = commitFacilityInstallation(base, { blueprintId: 'office-conversion-ii', targetFacilityId: officeFacilityId })
    const officeProjectId = committed.placement.facilities.find(f => f.blueprintId === 'office-conversion-ii')!.projectId
    expect(facilityOffline(committed, officeFacilityId)).toBe(true) // S4's own law, already proven; restated for the baseline this test cancels from

    const state = advanceTo(committed, committed.market.tick + 2)
    const quote = cancellationQuote(state, { projectId: officeProjectId })
    expect(quote.components).toHaveLength(1)
    expect(quote.components[0]!.status).toBe('inProgress')
    expect(quote.components[0]!.paid).toBe(250_000)
    expect(quote.components[0]!.refunded).toBe(250_000)
    expect(quote.refund).toBe(250_000)

    const cancelled = applyActions(state, [{ kind: 'cancelInstallation', projectId: officeProjectId } as never])
    expect(facilityOffline(cancelled, officeFacilityId)).toBe(true) // never freed mid-restoration
    const restoration = cancelled.placement.facilities.find(f => f.installation?.targetFacilityId === officeFacilityId && f.blueprintId === 'restoration-office')
    expect(restoration).toBeDefined()
    expect(restoration!.status).toBe('underConstruction')
    const restorationBlueprint = RESTORATION_BLUEPRINTS.find(b => b.id === 'restoration-office')!
    expect(restorationBlueprint.takesTargetOffline).toBe(true)
    const restorationWeeks = restorationBlueprint.installationComponents!.reduce((sum, c) => sum + c.weeks, 0)
    const restored = advanceTo(cancelled, cancelled.market.tick + restorationWeeks)
    expect(facilityOffline(restored, officeFacilityId)).toBe(false) // "the office restored online"
  })

  it('INTERPRETATION — componentProgress rounds a partial payment toward the studio\'s favour; direct unit test of the pure derivation since no authored blueprint divides unevenly (see header PREMISE NOT SATISFIED)', () => {
    // Assumed signature: componentProgress(components, elapsedWeeks) -> the
    // per-component derivation the plan names ("component progress is derived,
    // never stored... component k spans [start_k, start_k+weeks_k)"). A
    // hand-authored, non-dividing component: cost 100 over 3 weeks, cancelled
    // 1 week in (100/3 = 33.33...).
    const components = [{ label: 'test-only fractional component', cost: 100, weeks: 3 }]
    const progress = componentProgress(components, 1)
    expect(progress[0]!.paid + progress[0]!.refunded).toBe(100) // receipt sums, whatever the rounding direction
    expect(progress[0]!.paid).toBe(33) // rounded DOWN: the studio pays less, which is the studio's favour
    expect(progress[0]!.refunded).toBe(67)
  })
})
