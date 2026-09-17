// ── P13B-S6 test 4: restoration — target offline, S4 opex law, own ledger row,
// restoration itself not cancellable ─────────────────────────────────────────
//
// Requirement-derived from "S6 — Option-B installation cancellation..." task
// expansion, "Tests" item 4, and the "Delegated implementation decisions"
// bullet: "if any site-adaptation component had begun, cancellation
// auto-commits a restoration installation on the same target
// (`restoration-sound-stage` $25,000/2w, `restoration-lighting-stage`
// $10,000/1w, `restoration-office`... candidate) that takes the target
// offline like S4's conversions and returns it at completion... The three
// restoration blueprints are authored with `takesTargetOffline: true`... and
// the id family `restoration-*`; a restoration job is refused by
// `cancelInstallation`."
//
// RED-by-design: see tests/p13b-s6-receipts.test.ts's header for the full
// statement of the process rule this file follows. `facilityOffline` is
// imported directly from the REAL, EXISTING `src/core/officeConversion.ts` —
// its own law ("Whether a body is CLOSED right now because a
// `takesTargetOffline` installation is under construction inside it... while
// its own baseline operating cost continues, because the building still
// stands") is capability-agnostic (`placementOffline` keys only on
// `blueprintTakesTargetOffline`, never on `capability`), so it applies to a
// soundstage restoration exactly as it already does to an office conversion —
// this file reuses that established law rather than re-deriving it.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { facilityOffline } from '../src/core/officeConversion.js'
import { advanceTo } from '../src/harness/p13a/fixtures.js'
import { s6LightingReady, s6SoundReady } from '../src/harness/p13b/s6-fixtures.js'
// RED-by-design: src/core/installationCancellation.ts does not exist yet.
import { cancellationQuote, RESTORATION_BLUEPRINTS } from '../src/core/installationCancellation.js'

describe('P13B-S6 restoration: offline, opex, its own ledger row, not itself cancellable (test 4)', () => {
  it('the stage stays ONLINE through its own lighting fit-out (existing law: neither authored blueprint sets takesTargetOffline), then goes offline only once restoration is committed by cancellation', () => {
    const { state: committed, stageProjectId, stageFacilityId } = s6LightingReady()
    expect(facilityOffline(committed, stageFacilityId)).toBe(false) // committing the fit-out itself never closes the stage

    const midway = advanceTo(committed, committed.market.tick + 2) // site just complete
    expect(facilityOffline(midway, stageFacilityId)).toBe(false) // still online mid-fit-out

    const cancelled = applyActions(midway, [{ kind: 'cancelInstallation', projectId: stageProjectId } as never])
    expect(facilityOffline(cancelled, stageFacilityId)).toBe(true) // ONLY restoration closes it

    const restoration = cancelled.placement.facilities.find(f => f.installation?.targetFacilityId === stageFacilityId && f.blueprintId === 'restoration-lighting-stage')!
    expect(restoration.status).toBe('underConstruction')

    // Own ledger row: restoration is paid in full at ITS OWN commit, on ITS OWN
    // constructionProjectId — distinct from the cancelled stage's own project
    // and distinct from the constructionRefund row that project's cancellation wrote.
    const restorationCapex = cancelled.ledger.filter(e => e.kind === 'constructionCapex'
      && (e as unknown as { constructionProjectId: string }).constructionProjectId === restoration.projectId)
    expect(restorationCapex).toHaveLength(1)
    expect(restorationCapex[0]!.amount).toBe(-10_000)
    expect(restoration.projectId).not.toBe(stageProjectId)

    const restorationWeeks = RESTORATION_BLUEPRINTS.find(b => b.id === 'restoration-lighting-stage')!.installationComponents!
      .reduce((sum, c) => sum + c.weeks, 0)
    expect(restorationWeeks).toBe(1)
    const restored = advanceTo(cancelled, cancelled.market.tick + restorationWeeks)
    expect(facilityOffline(restored, stageFacilityId)).toBe(false) // restored online at completion
    expect(restoration && restored.placement.facilities.find(f => f.id === restoration.id)!.status).toBe('operational')
  })

  it('the stage\'s own baseline weekly operating cost keeps being charged through the restoration window (S4 opex law: baseline is unconditional, an increment is the only thing ever suspended)', () => {
    const { state: committed, stageProjectId, stageFacilityId } = s6LightingReady()
    const midway = advanceTo(committed, committed.market.tick + 2)
    const cancelled = applyActions(midway, [{ kind: 'cancelInstallation', projectId: stageProjectId } as never])
    const restorationStart = cancelled.market.tick

    const throughRestoration = advanceTo(cancelled, restorationStart + 1)
    const opexRows = throughRestoration.ledger.filter(e => e.kind === 'facilityOpex' && e.week === restorationStart)
    expect(opexRows.length).toBeGreaterThan(0) // the studio's aggregated facilityOpex row still lands this week
    // The stage itself never left `operational` status — only the INSTALLATION
    // records (fit-out, then restoration) changed status; the base body's own
    // opex law is therefore unaffected by cancellation, exactly as S4 already
    // established for office conversions.
    expect(throughRestoration.operations.facilities.find(f => f.id === stageFacilityId)!.status).toBe('operational')
  })

  it('a restoration job is refused by cancelInstallation (it is the cost of the cancellation, not itself cancellable)', () => {
    const { state: committed, stageProjectId } = s6LightingReady()
    const midway = advanceTo(committed, committed.market.tick + 2)
    const cancelled = applyActions(midway, [{ kind: 'cancelInstallation', projectId: stageProjectId } as never])
    const restorationProjectId = cancelled.placement.facilities.find(f => f.blueprintId === 'restoration-lighting-stage')!.projectId

    const quote = cancellationQuote(cancelled, { projectId: restorationProjectId })
    expect(quote.ok).toBe(false)
    expect(typeof quote.refusal).toBe('string')
    expect(quote.refusal!.length).toBeGreaterThan(0)

    expect(() => applyActions(cancelled, [{ kind: 'cancelInstallation', projectId: restorationProjectId } as never])).toThrow()
  })

  it('nothing to restore if no site work began: a Post fit-out (no `site`-kind component) cancelled unstarted commits no restoration and never goes offline', () => {
    // Reuses the sound Post fact already established in test 1
    // (tests/p13b-s6-receipts.test.ts): a Post fit-out authors ONE `post`-kind
    // component and no `site`-kind component at all, so restoration can never
    // trigger for it regardless of progress. Restated here as this file's own
    // "nothing to restore" case, scoped to what THIS file asserts (offline law).
    const { state, postProjectId, postFacilityId } = s6SoundReady()
    expect(facilityOffline(state, postFacilityId)).toBe(false)
    const cancelled = applyActions(state, [{ kind: 'cancelInstallation', projectId: postProjectId } as never])
    expect(facilityOffline(cancelled, postFacilityId)).toBe(false) // never closed — no restoration was ever needed
    const placement = cancelled.placement.facilities.find(f => f.projectId === postProjectId)!
    expect((placement as unknown as { cancellation: { restorationProjectId: string | null } }).cancellation.restorationProjectId).toBeNull()
  })
})
