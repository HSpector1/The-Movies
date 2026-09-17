// ── P13B-S6 test 2: once-only refund; restart quoted anew, no cloned work ───
//
// Requirement-derived from "S6 — Option-B installation cancellation..." task
// expansion, "Tests" item 2 and the "Delegated implementation decisions"
// bullet: "a second cancel is refused; a later restart of the same blueprint
// on the same target is a NEW placement quoted anew (no refund credit, no free
// components)." The R07 disposition's own retained rule is cited as the
// authority-by-analogy for restart: "repeated cancel -> restart lawful; no
// cloned work, no refunded research, no repeated entitlement" (physical work,
// by analogy, per the S6 Authority section).
//
// RED-by-design: see tests/p13b-s6-receipts.test.ts's header for the full
// statement of the process rule this file follows (single-cause module
// resolution failure on the not-yet-existing src/core/installationCancellation
// .ts; every other import is a real, existing module).
//
// ENGINE CONFLICT NAMED (found by reading the code, not by running it — the
// whole file cannot execute today): `src/core/occupancy.ts`'s `resourceClaims`
// (~341-368, read 2026-09-17) pushes a PERMANENT body-level claim for ANY
// placement record whose `status !== 'underConstruction'` (the `else` branch
// at ~366-368), which today only ever means "operational" — the established
// law that a COMPLETED installation permanently holds its target for
// demolition purposes. Once `PlacementStatus` gains `'cancelled'`
// (this S6 increment, per the plan's own stated type change), an UNMODIFIED
// `resourceClaims` would treat a CANCELLED placement identically to an
// OPERATIONAL one — a permanent hold — which `queryFacilityInstallation`'s
// `targetEngaged` refusal reads directly. That would refuse EVERY restart the
// plan requires to be lawful. This file's restart assertions pin the PLAN's
// controlling requirement (restart succeeds, quoted at full price); they will
// only go green once `resourceClaims` is taught to treat `'cancelled'` the
// same way it treats "never placed at all" for THIS purpose, which is named
// here for the engine increment, not silently assumed away.

import { describe, expect, it } from 'vitest'
import type { GameState } from '../src/core/types.js'
import { applyActions } from '../src/core/actions.js'
import { commitFacilityInstallation, queryFacilityInstallation } from '../src/core/placement.js'
import { advanceTo } from '../src/harness/p13a/fixtures.js'
import { s6LightingReady } from '../src/harness/p13b/s6-fixtures.js'
// RED-by-design: src/core/installationCancellation.ts does not exist yet.
import { cancellationQuote } from '../src/core/installationCancellation.js'

describe('P13B-S6 once-only refund and quoted-anew restart (test 2)', () => {
  it('a second cancel of the same project is refused; the ledger keeps exactly ONE constructionRefund row', () => {
    const { state: committed, stageProjectId } = s6LightingReady()
    const state = advanceTo(committed, committed.market.tick + 2) // site just complete

    const firstCancel = applyActions(state, [{ kind: 'cancelInstallation', projectId: stageProjectId } as never])
    const refundRowsAfterFirst = firstCancel.ledger.filter(e => e.kind === 'constructionRefund' && (e as unknown as { constructionProjectId: string }).constructionProjectId === stageProjectId)
    expect(refundRowsAfterFirst).toHaveLength(1)

    // A quote against an already-cancelled project is refused, never re-priced.
    const secondQuote = cancellationQuote(firstCancel, { projectId: stageProjectId })
    expect(secondQuote.ok).toBe(false)
    expect(typeof secondQuote.refusal).toBe('string')
    expect(secondQuote.refusal!.length).toBeGreaterThan(0)

    expect(() => applyActions(firstCancel, [{ kind: 'cancelInstallation', projectId: stageProjectId } as never])).toThrow()

    // No second write: the ledger's refund row for this project stays exactly one,
    // at the SAME amount, even after the refused second attempt is attempted.
    let secondAttempt: GameState = firstCancel
    try { secondAttempt = applyActions(firstCancel, [{ kind: 'cancelInstallation', projectId: stageProjectId } as never]) } catch { /* refused, by design */ }
    const refundRowsFinal = secondAttempt.ledger.filter(e => e.kind === 'constructionRefund' && (e as unknown as { constructionProjectId: string }).constructionProjectId === stageProjectId)
    expect(refundRowsFinal).toHaveLength(1)
    expect(refundRowsFinal[0]!.amount).toBe(refundRowsAfterFirst[0]!.amount)
  })

  it('a cancelled adoption is refused a second cancelAdoption the same way', () => {
    const { state: committed, adoptionId } = s6LightingReady()
    const state = advanceTo(committed, committed.market.tick + 2)
    const cancelled = applyActions(state, [{ kind: 'cancelAdoption', adoptionId } as never])
    expect(() => applyActions(cancelled, [{ kind: 'cancelAdoption', adoptionId } as never])).toThrow()
  })

  it('restart on the SAME target after cancellation is a NEW placement, quoted at the FULL price — no refund credit, no free components (see header ENGINE CONFLICT)', () => {
    const { state: committed, stageProjectId, stageFacilityId } = s6LightingReady()
    const state = advanceTo(committed, committed.market.tick + 2) // site paid $50,000 already
    const cancelled = applyActions(state, [{ kind: 'cancelInstallation', projectId: stageProjectId } as never])

    const restartQuote = queryFacilityInstallation(cancelled, { blueprintId: 'lighting-control-stage', targetFacilityId: stageFacilityId })
    expect(restartQuote.ok).toBe(true)
    expect(restartQuote.cost).toBe(100_000) // full site+installation price again, no credit for the $50,000 already paid
    expect(restartQuote.buildWeeks).toBe(4)

    const restarted = commitFacilityInstallation(cancelled, { blueprintId: 'lighting-control-stage', targetFacilityId: stageFacilityId })
    const newPlacement = restarted.placement.facilities.find(f => f.blueprintId === 'lighting-control-stage' && f.projectId !== stageProjectId
      && f.status === 'underConstruction')
    expect(newPlacement).toBeDefined()
    expect(newPlacement!.placedWeek).toBe(cancelled.market.tick)
    const restartCapexRows = restarted.ledger.filter(e => e.kind === 'constructionCapex' && (e as unknown as { constructionProjectId: string }).constructionProjectId === newPlacement!.projectId)
    expect(restartCapexRows).toHaveLength(1)
    expect(restartCapexRows[0]!.amount).toBe(-100_000) // paid in full again — "no cloned work"

    // The ORIGINAL cancelled placement's own receipt is untouched by the restart.
    const original = restarted.placement.facilities.find(f => f.projectId === stageProjectId)!
    expect(original.status).toBe('cancelled')
  })
})
