// ── P13B-S6 test 3: equipment retained, unheld, reused at $0; entitlement not
// restored ───────────────────────────────────────────────────────────────────
//
// Requirement-derived from "S6 — Option-B installation cancellation..." task
// expansion, "Tests" item 3 and the "Delegated implementation decisions"
// bullet: "an adoption whose physical work is cancelled keeps its asset
// (`holderAdoptionId -> null`, asset unheld); the adoption row gains
// `cancelledWeek`; the first-prototype entitlement is not restored (the asset
// exists and is reused at $0 by S5's unheld-asset rule on restart). Research is
// never refunded; access is never revoked."
//
// RED-by-design: see tests/p13b-s6-receipts.test.ts's header for the full
// statement of the process rule this file follows.
//
// ENGINE CONFLICT NAMED (found by reading the code, not by running it):
// `src/core/technologyAdoption.ts`'s `equipmentPlan` (~148-160, read
// 2026-09-17) computes `unheld` as
//   `owned.find(asset => asset.holderAdoptionId === null &&
//     !state.technology.adoptions.some(a => a.equipmentAssetId === asset.id))`
// — i.e. an asset counts as reusable only when NO adoption anywhere still
// names it. S6's own requirement is that a CANCELLED adoption "keeps its...
// component rows as history" (Audit refinements, adopted at f70221f) — which
// means the cancelled adoption's OWN row keeps `equipmentAssetId` pointing at
// this exact asset forever. Unmodified, `unheld`'s second clause is
// permanently FALSE for that asset (the cancelled adoption itself is the
// adoption still naming it), so `equipmentPlan` would fall through past the
// reuse branch to `entitlementUsed` (true, since the asset's own `source` is
// `'first-prototype'`) and charge the studio `laterInventorEquipmentCost`
// ($225,000 for sound) instead of the required $0 reuse. This file's
// `equipmentPlan` assertions pin the PLAN's controlling requirement; they will
// only go green once `unheld`'s second clause is narrowed to exclude a
// CANCELLED adoption's own historical reference, which is named here for the
// engine increment, not silently assumed away.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { equipmentPlan } from '../src/core/technologyAdoption.js'
import { advanceTo } from '../src/harness/p13a/fixtures.js'
import { s6SoundReady } from '../src/harness/p13b/s6-fixtures.js'
// RED-by-design: src/core/installationCancellation.ts does not exist yet.
import { cancellationQuote } from '../src/core/installationCancellation.js'

describe('P13B-S6 equipment retained, unheld, and reused at $0 (test 3)', () => {
  it('cancelling an adoption\'s remaining physical work unholds its equipment asset, stamps cancelledWeek, and keeps the equipmentAssetId reference as history', () => {
    const { state: committed, adoptionId, stageProjectId, postProjectId } = s6SoundReady()
    const state = advanceTo(committed, committed.market.tick + 3) // week 306; stage in progress, Post in progress
    const before = state.technology.adoptions.find(a => a.id === adoptionId)!
    const assetId = before.equipmentAssetId!
    expect(state.technology.equipment.find(e => e.id === assetId)!.holderAdoptionId).toBe(adoptionId)

    // cancelAdoption cancels every remaining (non-operational) physical component.
    const cancelled = applyActions(state, [{ kind: 'cancelAdoption', adoptionId } as never])
    const after = cancelled.technology.adoptions.find(a => a.id === adoptionId)!
    expect((after as unknown as { cancelledWeek: number | null }).cancelledWeek).toBe(state.market.tick)
    expect(after.equipmentAssetId).toBe(assetId) // retained as history, never cleared

    const asset = cancelled.technology.equipment.find(e => e.id === assetId)!
    expect(asset.holderAdoptionId).toBeNull() // unheld

    // Access is never revoked; research is never refunded.
    const access = cancelled.technology.access.find(a => a.studioId === before.studioId && a.technologyId === 'synchronized-sound')!
    expect(access.acquiredWeek).not.toBeNull()
    expect(asset.source).toBe('first-prototype') // the minted asset's own record is untouched

    // Both remaining physical placements are cancelled; the ledger keeps ONE
    // constructionRefund row per cancelled project (test 2's own law).
    expect(cancelled.placement.facilities.find(f => f.projectId === stageProjectId)!.status).toBe('cancelled')
    expect(cancelled.placement.facilities.find(f => f.projectId === postProjectId)!.status).toBe('cancelled')

    // A quote for either now-cancelled project reports it as already cancelled
    // (test 2's own "once-only" law, restated from this equipment-focused
    // scenario for consistency).
    expect(cancellationQuote(cancelled, { projectId: stageProjectId }).ok).toBe(false)
    expect(cancellationQuote(cancelled, { projectId: postProjectId }).ok).toBe(false)
  })

  it('the unheld asset is reused at $0 by the next quote for the SAME technology (see header ENGINE CONFLICT)', () => {
    const { state: committed, adoptionId } = s6SoundReady()
    const state = advanceTo(committed, committed.market.tick + 3)
    const studioId = state.technology.adoptions.find(a => a.id === adoptionId)!.studioId
    const assetId = state.technology.adoptions.find(a => a.id === adoptionId)!.equipmentAssetId!
    const cancelled = applyActions(state, [{ kind: 'cancelAdoption', adoptionId } as never])

    const plan = equipmentPlan(cancelled, studioId, 'synchronized-sound')
    expect(plan.source).toBe('existing')
    expect(plan.cost).toBe(0)
    expect(plan.reusedEquipmentAssetId).toBe(assetId)
  })

  it('the first-prototype entitlement is NOT restored by cancellation: a hypothetical next quote is never first-prototype again, even though the original adoption never became operational', () => {
    const { state: committed, adoptionId } = s6SoundReady()
    const state = advanceTo(committed, committed.market.tick + 3)
    const studioId = state.technology.adoptions.find(a => a.id === adoptionId)!.studioId
    const cancelled = applyActions(state, [{ kind: 'cancelAdoption', adoptionId } as never])

    // Even setting the asset artificially HELD again (a state `equipmentPlan`
    // could reach if a THIRD adoption existed) never changes the entitlement
    // fact: `entitlementUsed` is keyed on `owned.some(source === 'first-
    // prototype')`, which is true forever once minted (the asset row is never
    // deleted, per S5's own law). This is provable by reading
    // technologyAdoption.ts:154-155 directly and is restated here as the
    // requirement this file pins: a fresh quote for this (studio, technology)
    // is never `first-prototype` again.
    const plan = equipmentPlan(cancelled, studioId, 'synchronized-sound')
    expect(plan.source).not.toBe('first-prototype')

    // The cancellation quote/receipt itself never mentions a research refund:
    // cancelling physical work has no `researchSpend`/`researchPayroll` ledger
    // consequence (research is a wholly separate, never-refunded ledger family).
    const priorResearchTotal = state.ledger.filter(e => e.kind === 'researchSpend' || e.kind === 'researchPayroll').length
    const afterResearchTotal = cancelled.ledger.filter(e => e.kind === 'researchSpend' || e.kind === 'researchPayroll').length
    expect(afterResearchTotal).toBe(priorResearchTotal)
  })
})
