// ── P13B-S6 test 5: same-tick ordering with save/reload ──────────────────────
//
// Requirement-derived from "S6 — Option-B installation cancellation..." task
// expansion, "Tests" item 5, and the "Delegated implementation decisions"
// bullet: "a cancel is an action applied during week w (`applyActions`), so it
// is evaluated before the boundary to w+1 whatever the tick's internal step
// order (today step 1.06 plan admission runs before step 1.6
// `completeDuePlacements`, `tick.ts:428/456`); a cancel at week w never
// refunds a component whose end ≤ w and never pays a component whose start ≥
// w. Save/reload between the action and the boundary changes nothing."
//
// `state = tick(applyActions(state, actions))` is the engine's own documented
// pipeline law (`src/core/tick.ts` ~9-11: "`applyActions` and the §7 forecast
// pipeline are NOT called here [inside tick]"). A cancel therefore always
// executes at the CURRENT `state.market.tick` (the week already arrived,
// before any NEXT boundary runs) — this file exercises the two edges that law
// makes exact: a component whose END lands exactly on the cancel week (must
// read as `completed`, never one week short), a component whose START lands
// exactly on the cancel week (must read as `unstarted`, never one week
// begun), and that persisting the cancelled record through a save/reload
// changes nothing about its later fate.
//
// RED-by-design: see tests/p13b-s6-receipts.test.ts's header for the full
// statement of the process rule this file follows. This file's boundary week
// (elapsed 1) is a NEW data point, deliberately distinct from test 1's own
// elapsed-2/elapsed-3 cases (tests/p13b-s6-receipts.test.ts), so the two files
// complement rather than duplicate each other.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { exportSave, importSave, makeSave } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo } from '../src/harness/p13a/fixtures.js'
import { s6LightingReady } from '../src/harness/p13b/s6-fixtures.js'
// RED-by-design: src/core/installationCancellation.ts does not exist yet.
import { cancellationQuote } from '../src/core/installationCancellation.js'

describe('P13B-S6 same-tick ordering and save/reload (test 5)', () => {
  it('cancelling exactly at elapsed week 1 (of 4): the site component (end=2) is NOT read as completed one week early, and the installation component (start=2) is NOT read as one week begun', () => {
    const { state: committed, stageProjectId } = s6LightingReady()
    const state = advanceTo(committed, committed.market.tick + 1) // elapsed = 1
    const quote = cancellationQuote(state, { projectId: stageProjectId })
    const site = quote.components.find(c => c.label.toLowerCase().includes('site'))!
    const installation = quote.components.find(c => c.label.toLowerCase().includes('installation'))!
    // "never pays a component whose start ≥ w": installation's start (2) ≥ w (1).
    expect(installation.status).toBe('unstarted')
    expect(installation.paid).toBe(0)
    expect(installation.refunded).toBe(50_000)
    // site's end (2) > w (1): must be inProgress, never prematurely completed.
    expect(site.status).toBe('inProgress')
    expect(site.paid).toBe(25_000)
    expect(site.refunded).toBe(25_000)
  })

  it('a cancel applied via applyActions takes effect at the CURRENT week, strictly before the next tick() boundary — cancelling at the last safe week (elapsed 3 of 4) pre-empts what would otherwise complete on the very next tick()', () => {
    const { state: committed, stageProjectId } = s6LightingReady()
    const lastSafeWeek = committed.market.tick + 3 // completesWeek is +4; one tick still short
    const state = advanceTo(committed, lastSafeWeek)
    expect(state.placement.facilities.find(f => f.projectId === stageProjectId)!.status).toBe('underConstruction')

    const cancelled = applyActions(state, [{ kind: 'cancelInstallation', projectId: stageProjectId } as never])
    expect(cancelled.placement.facilities.find(f => f.projectId === stageProjectId)!.status).toBe('cancelled')

    // The tick() that WOULD have completed this placement (arrivalWeek ===
    // completesWeek) must not silently complete a cancelled record.
    const nextTick = tick(cancelled)
    expect(nextTick.placement.facilities.find(f => f.projectId === stageProjectId)!.status).toBe('cancelled')
    expect(nextTick.placement.facilities.find(f => f.projectId === stageProjectId)!.status).not.toBe('operational')
  })

  it('save/reload between the cancel and the next boundary changes nothing: a live copy and a reimported copy of the SAME cancelled state stay byte-identical and neither ever completes', () => {
    const { state: committed, stageProjectId } = s6LightingReady()
    const state = advanceTo(committed, committed.market.tick + 3) // last safe week
    const cancelled: GameState = applyActions(state, [{ kind: 'cancelInstallation', projectId: stageProjectId } as never])

    const json = exportSave(makeSave(cancelled))
    const reimported = (importSave(json) as unknown as { state: GameState }).state
    expect(exportSave(makeSave(reimported))).toBe(json) // pure codec round-trip, byte-identical

    // Advance BOTH the live and the reloaded copy three ticks (past the
    // ORIGINAL completesWeek, which would have arrived on the very first of
    // these three) and confirm they stay identical to each other and never
    // complete.
    let live = cancelled
    let resumed = reimported
    for (let i = 0; i < 3; i++) {
      live = tick(live)
      resumed = tick(resumed)
      expect(exportSave(makeSave(resumed))).toBe(exportSave(makeSave(live)))
      expect(live.placement.facilities.find(f => f.projectId === stageProjectId)!.status).toBe('cancelled')
      expect(resumed.placement.facilities.find(f => f.projectId === stageProjectId)!.status).toBe('cancelled')
    }
  })
})
