import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { tick } from '../src/core/tick.js'
import { exportSave, importSave, makeSave, migrateToV22, validateSaveV22 } from '../src/core/save.js'
import { playerTechnologyAccess } from '../src/core/technology.js'
import type { TechnologyAccess, TechnologyId } from '../src/core/technologyTypes.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo } from '../src/harness/p13a/fixtures.js'
import { p13bTwoLabWorld } from '../src/harness/p13b/fixtures.js'

// P13B-S2 independent test-engineer regression (Current Ops disposition
// OPS-P13B-R07-DISPOSITION-20260916-01 §5, source-confirmed defect at
// src/core/technology.ts:376-377). `advanceResearchWeek`'s completion grant
// reads two selectors with NO technology identity:
//
//   if (complete && !access.some(a => a.studioId === p.studioId && a.acquiredWeek !== null)) {
//     const pending = access.findIndex(a => a.studioId === p.studioId)
//
// Required law: access identity is the exact (studioId, technologyId) pair.
// Each completed research project grants its OWN technology's access exactly
// once, with exact provenance (route:'research', researchProjectId = that
// project, chosenWeek = that project's startedWeek, acquiredWeek = completion
// week), and never touches another technology's rows. Every `it` below
// asserts that law directly (the literal expected access row), not the
// observed buggy output — so a fix that produces the right law turns these
// green without editing this file.
//
// No production code is touched here. This file is READ-ONLY against
// src/core/technology.ts and everything it imports.

function seatAndBegin(
  state: GameState, technologyId: TechnologyId, lab1: string, lab2: string,
  ids1: readonly string[], ids2: readonly string[], budgetPerWeek: number,
): { state: GameState; projectId: string } {
  let s = state
  if (ids1.length) s = applyActions(s, ids1.map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab1, scientistId, technologyId })))
  if (ids2.length) s = applyActions(s, ids2.map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId })))
  const projectId = s.technology.projects.find(p => p.technologyId === technologyId)!.id
  s = applyActions(s, [{ kind: 'beginResearch', projectId, budgetPerWeek }])
  return { state: s, projectId }
}
function release(state: GameState, projectId: string, ids: readonly string[]): GameState {
  return applyActions(state, ids.map(scientistId => ({ kind: 'releaseResearchSeat' as const, projectId, scientistId })))
}
/** Bounded so a genuine scheduler defect fails fast instead of hanging this slow 2-core host. */
function advanceUntilComplete(state: GameState, projectId: string, maxWeeks = 60): GameState {
  let s = state
  for (let i = 0; i < maxWeeks; i++) {
    if (s.technology.projects.find(p => p.id === projectId)!.completedWeek !== null) return s
    s = tick(s)
  }
  throw new Error(`advanceUntilComplete: "${projectId}" did not complete within ${maxWeeks} weeks`)
}
/** Two full four-seat/four-seat $80,000 projects run back to back: `first` to
 * completion, its seats released, then `second` staffed and run to completion.
 * `afterFirst` is the state at the instant `first` completes (before release),
 * so a caller can snapshot its access row before `second` is ever touched. */
function buildSequential(
  base: GameState, first: TechnologyId, second: TechnologyId, lab1: string, lab2: string, ids: readonly string[],
): { afterFirst: GameState; afterSecond: GameState; firstId: string; secondId: string } {
  const a = seatAndBegin(base, first, lab1, lab2, ids.slice(0, 4), ids.slice(4, 8), 80_000)
  const afterFirst = advanceUntilComplete(a.state, a.projectId)
  const released = release(afterFirst, a.projectId, ids)
  const b = seatAndBegin(released, second, lab1, lab2, ids.slice(0, 4), ids.slice(4, 8), 80_000)
  const afterSecond = advanceUntilComplete(b.state, b.projectId)
  return { afterFirst, afterSecond, firstId: a.projectId, secondId: b.projectId }
}
function ownRow(state: GameState, own: string, technologyId: TechnologyId): TechnologyAccess | undefined {
  return state.technology.access.find(a => a.studioId === own && a.technologyId === technologyId)
}

describe('P13B-S2 access identity: completion grant must key on (studioId, technologyId)', () => {
  let world: ReturnType<typeof p13bTwoLabWorld>
  let lab1: string, lab2: string, own: string, ids: string[]
  let soundThenLight: ReturnType<typeof buildSequential>
  let lightThenSound: ReturnType<typeof buildSequential>

  beforeAll(() => {
    world = p13bTwoLabWorld()
    ;[lab1, lab2] = world.laboratoryFacilityIds
    ids = world.candidateIds
    own = world.state.hollywood!.playerStudioId
    soundThenLight = buildSequential(world.state, 'synchronized-sound', 'lighting-control-01', lab1, lab2, ids)
    lightThenSound = buildSequential(world.state, 'lighting-control-01', 'synchronized-sound', lab1, lab2, ids)
  }, 120_000)

  it('1. sound then lighting: each completed technology grants its own access row with its own provenance', () => {
    const { afterSecond, firstId, secondId } = soundThenLight
    expect(afterSecond.technology.projects.find(p => p.id === firstId)!.completedWeek).toBe(787)
    expect(afterSecond.technology.projects.find(p => p.id === secondId)!.completedWeek).toBe(794)
    const soundRow: TechnologyAccess = { studioId: own, technologyId: 'synchronized-sound', route: 'research', chosenWeek: 780, acquiredWeek: 787, accessCost: 0, researchProjectId: firstId }
    const lightRow: TechnologyAccess = { studioId: own, technologyId: 'lighting-control-01', route: 'research', chosenWeek: 787, acquiredWeek: 794, accessCost: 0, researchProjectId: secondId }
    expect(ownRow(afterSecond, own, 'synchronized-sound')).toEqual(soundRow)
    // RED on the unchanged engine: technology.ts:376's studioId-only selector
    // sees the sound row already acquired and skips the whole grant block, so
    // this row is never created — ownRow(...) reads `undefined` here.
    expect(ownRow(afterSecond, own, 'lighting-control-01')).toEqual(lightRow)
  })

  it('2. lighting then sound (mirror order): each completed technology grants its own access row with its own provenance', () => {
    const { afterSecond, firstId, secondId } = lightThenSound
    expect(afterSecond.technology.projects.find(p => p.id === firstId)!.completedWeek).toBe(787)
    expect(afterSecond.technology.projects.find(p => p.id === secondId)!.completedWeek).toBe(794)
    const lightRow: TechnologyAccess = { studioId: own, technologyId: 'lighting-control-01', route: 'research', chosenWeek: 780, acquiredWeek: 787, accessCost: 0, researchProjectId: firstId }
    const soundRow: TechnologyAccess = { studioId: own, technologyId: 'synchronized-sound', route: 'research', chosenWeek: 787, acquiredWeek: 794, accessCost: 0, researchProjectId: secondId }
    expect(ownRow(afterSecond, own, 'lighting-control-01')).toEqual(lightRow)
    // RED on the unchanged engine: the mirror of case 1 — sound's row is the
    // one missing this time, because it is whichever technology completes
    // SECOND that loses its grant under the studioId-only selector.
    expect(ownRow(afterSecond, own, 'synchronized-sound')).toEqual(soundRow)
  })

  it('3. simultaneous completion: both technologies grant their own row with the same acquiredWeek, independent of project creation order', () => {
    const buildAt790 = (): { state: GameState; soundId: string; lightId: string } => {
      let s = applyActions(world.state, ids.slice(0, 4).map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab1, scientistId, technologyId: 'synchronized-sound' as const })))
      const soundId = s.technology.projects.find(p => p.technologyId === 'synchronized-sound')!.id
      s = applyActions(s, [{ kind: 'beginResearch', projectId: soundId, budgetPerWeek: 40_000 }])
      s = applyActions(s, ids.slice(4, 8).map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'lighting-control-01' as const })))
      const lightId = s.technology.projects.find(p => p.technologyId === 'lighting-control-01')!.id
      s = applyActions(s, [{ kind: 'beginResearch', projectId: lightId, budgetPerWeek: 40_000 }])
      return { state: advanceTo(s, 790), soundId, lightId } // one tick before both complete (confirmed 2026-09-16)
    }
    const expectBothGranted = (state: GameState, soundId: string, lightId: string): void => {
      expect(state.technology.projects.find(p => p.id === soundId)!.completedWeek).toBe(791)
      expect(state.technology.projects.find(p => p.id === lightId)!.completedWeek).toBe(791)
      const soundRow: TechnologyAccess = { studioId: own, technologyId: 'synchronized-sound', route: 'research', chosenWeek: 780, acquiredWeek: 791, accessCost: 0, researchProjectId: soundId }
      const lightRow: TechnologyAccess = { studioId: own, technologyId: 'lighting-control-01', route: 'research', chosenWeek: 780, acquiredWeek: 791, accessCost: 0, researchProjectId: lightId }
      expect(ownRow(state, own, 'synchronized-sound')).toEqual(soundRow)
      expect(ownRow(state, own, 'lighting-control-01')).toEqual(lightRow)
    }

    // Creation order [sound, light]. RED on the unchanged engine: within this
    // ONE tick's advanceResearchWeek, sound (processed first in
    // `state.technology.projects.map`) pushes its row into the shared local
    // `access` array; light (processed second) then sees "some acquired
    // access for this studioId" already true and is skipped — light's row is
    // missing.
    const normal = buildAt790()
    expectBothGranted(tick(normal.state), normal.soundId, normal.lightId)

    // Same scenario, `technology.projects` spread-and-reversed to [light,
    // sound] immediately before the completing tick. `tick` accepts the
    // reversed array without refusal (probed 2026-09-16, vite-node), so this
    // is the array-reversal form the task specifies, not the creation-order
    // fallback. RED on the unchanged engine, mirrored: now light is processed
    // first and keeps its row; sound's row is the one missing — proving the
    // defect is genuinely array-order-dependent, not just "second technology
    // always loses".
    const reversed = buildAt790()
    const reversedState: GameState = { ...reversed.state, technology: { ...reversed.state.technology, projects: [...reversed.state.technology.projects].reverse() } }
    expectBothGranted(tick(reversedState), reversed.soundId, reversed.lightId)
  })

  it('4. unrelated pending access survives: a lighting `wait` row is untouched when sound research completes', () => {
    const withWait = applyActions(world.state, [{ kind: 'waitForTechnology', technologyId: 'lighting-control-01' }])
    const waitRowBefore: TechnologyAccess = { studioId: own, technologyId: 'lighting-control-01', route: 'wait', chosenWeek: 780, acquiredWeek: null, accessCost: 0, researchProjectId: null }
    expect(ownRow(withWait, own, 'lighting-control-01')).toEqual(waitRowBefore)
    const sound = seatAndBegin(withWait, 'synchronized-sound', lab1, lab2, ids.slice(0, 4), ids.slice(4, 8), 80_000)
    const soundDone = advanceUntilComplete(sound.state, sound.projectId)
    expect(soundDone.technology.projects.find(p => p.id === sound.projectId)!.completedWeek).toBe(787)
    // RED on the unchanged engine: `const pending = access.findIndex(a =>
    // a.studioId === p.studioId)` matches the lighting `wait` row (same
    // studioId, ANY technologyId) and `access.splice(pending, 1)` deletes it.
    expect(ownRow(soundDone, own, 'lighting-control-01')).toEqual(waitRowBefore)
    const soundRow: TechnologyAccess = { studioId: own, technologyId: 'synchronized-sound', route: 'research', chosenWeek: 780, acquiredWeek: 787, accessCost: 0, researchProjectId: sound.projectId }
    expect(ownRow(soundDone, own, 'synchronized-sound')).toEqual(soundRow)
  })

  it('5. unrelated completed access survives: completing lighting adds its own row and leaves the sound row byte-identical', () => {
    const { afterFirst, afterSecond, secondId } = soundThenLight
    const soundRowBefore = ownRow(afterFirst, own, 'synchronized-sound')
    expect(soundRowBefore).toBeDefined()
    const lightRow: TechnologyAccess = { studioId: own, technologyId: 'lighting-control-01', route: 'research', chosenWeek: 787, acquiredWeek: 794, accessCost: 0, researchProjectId: secondId }
    // RED on the unchanged engine: identical root cause to case 1 (sound's
    // already-acquired row suppresses lighting's grant entirely).
    expect(ownRow(afterSecond, own, 'lighting-control-01')).toEqual(lightRow)
    const soundRowAfter = ownRow(afterSecond, own, 'synchronized-sound')
    expect(JSON.stringify(soundRowAfter)).toBe(JSON.stringify(soundRowBefore))
  })

  it('6. save/reload and later ticks: exactly two rows, no duplicates, no erasure; validateSaveV22 accepts', () => {
    const { afterSecond, firstId, secondId } = soundThenLight
    const json = exportSave(makeSave(afterSecond))
    const imported = importSave(json)
    const migrated = migrateToV22(imported)
    let state: GameState = migrated.state
    for (let i = 0; i < 10; i++) state = tick(state)
    const soundRows = state.technology.access.filter(a => a.studioId === own && a.technologyId === 'synchronized-sound')
    const lightRows = state.technology.access.filter(a => a.studioId === own && a.technologyId === 'lighting-control-01')
    expect(soundRows).toHaveLength(1)
    // RED on the unchanged engine: the lighting row never existed to begin
    // with (case 1's defect), so it cannot survive a round trip — length is 0.
    expect(lightRows).toHaveLength(1)
    expect(soundRows[0]).toEqual({ studioId: own, technologyId: 'synchronized-sound', route: 'research', chosenWeek: 780, acquiredWeek: 787, accessCost: 0, researchProjectId: firstId })
    expect(lightRows[0]).toEqual({ studioId: own, technologyId: 'lighting-control-01', route: 'research', chosenWeek: 787, acquiredWeek: 794, accessCost: 0, researchProjectId: secondId })
    expect(() => validateSaveV22(makeSave(state))).not.toThrow()
  })

  it('7. idempotence: ticking again after completion never adds a duplicate row for either technology', () => {
    const { afterSecond } = soundThenLight
    const again = tick(afterSecond)
    expect(again.technology.access.filter(a => a.studioId === own && a.technologyId === 'synchronized-sound')).toHaveLength(1)
    // RED on the unchanged engine: this counts 0, not because a duplicate was
    // added, but because the lighting row was never granted in the first
    // place (case 1's defect) — idempotence has nothing to be idempotent OVER.
    expect(again.technology.access.filter(a => a.studioId === own && a.technologyId === 'lighting-control-01')).toHaveLength(1)
    expect(playerTechnologyAccess(again, 'synchronized-sound')).toBe(true)
    expect(playerTechnologyAccess(again, 'lighting-control-01')).toBe(true)
  })

  it('8. retained same-technology law: purchase then same-technology research neither overwrites nor duplicates; a second purchase is refused', () => {
    // Sound's commercialWeek (416) has long passed by week 780, so purchase is
    // lawful here; this is the primary construction the task specifies, not
    // the "unlawful before 936" fallback (that date is lighting's own
    // commercialWeek, not sound's — confirmed via technologyCatalogue.ts).
    const purchased = applyActions(world.state, [{ kind: 'purchaseTechnology', technologyId: 'synchronized-sound' }])
    const purchaseRow: TechnologyAccess = { studioId: own, technologyId: 'synchronized-sound', route: 'purchase', chosenWeek: 780, acquiredWeek: 780, accessCost: 200_000, researchProjectId: null }
    expect(ownRow(purchased, own, 'synchronized-sound')).toEqual(purchaseRow)
    // Retained-law control (passes on the unchanged engine): exact wording at
    // src/core/technology.ts:311.
    expect(() => applyActions(purchased, [{ kind: 'purchaseTechnology', technologyId: 'synchronized-sound' }])).toThrow('This studio already has synchronized-sound access.')
    const sound = seatAndBegin(purchased, 'synchronized-sound', lab1, lab2, ids.slice(0, 4), ids.slice(4, 8), 80_000)
    const soundDone = advanceUntilComplete(sound.state, sound.projectId)
    expect(soundDone.technology.projects.find(p => p.id === sound.projectId)!.completedWeek).toBe(787)
    // Retained-law control (passes on the unchanged engine): the purchase row
    // is the ONLY sound row and is byte-identical to before research ran.
    const soundRows = soundDone.technology.access.filter(a => a.studioId === own && a.technologyId === 'synchronized-sound')
    expect(soundRows).toHaveLength(1)
    expect(soundRows[0]).toEqual(purchaseRow)
  })
})
