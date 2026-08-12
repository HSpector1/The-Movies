// ── D-17A/T10 (UI half) — the adapter's ECONOMIC regime is the persisted fact ───
// Phase E made `economyEngaged(state)` a persisted, monotonic gameplay fact and repointed the
// core's own regime reads to it. This test pins the UI half: after the engagement cliff (the
// last contract expires / everyone is released) every ECONOMIC read-model in the adapter must
// still report the engaged regime, while the ROSTER/ASSIGNMENT surfaces must still answer the
// different question they were always asking ("is anyone employed right now?").
//
// Regression guard for the R2 defect: the pre-D-17A adapter read `employmentEngaged` for both,
// so an empty roster silently re-scaled the forecast, the marketing capacity, and the autopsy.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  economyEngaged,
  employmentEngaged,
  generateWorld,
} from '../../../src/core/index.ts'
import type { CastSlot, CreativeRole, GameState } from '../../../src/core/index.ts'
import { marketingEfficiency, previewForecast, studioPool, isEmploymentEngaged } from './adapter.ts'
import type { DraftPackage } from './adapter.ts'

function foundEngaged(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const need: Record<CreativeRole, number> = { writer: 1, director: 1, actor: 3, craft: 1 }
  for (const role of ['actor', 'director', 'writer', 'craft'] as CreativeRole[]) {
    for (const t of pool.filter((x) => x.role === role).slice(0, need[role])) {
      s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 208 }])
    }
  }
  return applyActions(s, [{ kind: 'foundStudio' }])
}

function packageFor(state: GameState): DraftPackage {
  const concept = [...state.concepts].sort((a, b) => a.baseNegativeCost - b.baseNegativeCost)[0]!
  const byRole = (r: CreativeRole) => state.talent.filter((t) => t.role === r)
  const actors = byRole('actor')
  return {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.5, 0.5],
        tonalWeight: [-0.5, 0.5],
        kineticEnergy: [-0.5, 0.5],
      },
    },
    writerId: byRole('writer')[0]!.id,
    directorId: byRole('director')[0]!.id,
    craftIds: [byRole('craft')[0]!.id],
    cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id } as Record<CastSlot, string>,
    budget: { negative: concept.baseNegativeCost, marketing: 400_000 },
  }
}

describe('D-17A/T10 — adapter economic regime survives the engagement cliff', () => {
  it('the persisted fact stays true when every contract is gone, and employment-right-now does not', () => {
    const s = foundEngaged('regime-1')
    const postCliff: GameState = { ...s, contracts: [] }
    expect(economyEngaged(s)).toBe(true)
    expect(economyEngaged(postCliff)).toBe(true) // persisted, monotonic
    expect(employmentEngaged(postCliff)).toBe(false) // nobody employed right now
    expect(isEmploymentEngaged(postCliff)).toBe(false) // the roster-surface selector agrees
  })

  it('marketingEfficiency + previewForecast stay on the ENGAGED path after the cliff', () => {
    const s = foundEngaged('regime-2')
    const pkg = packageFor(s)
    const postCliff: GameState = { ...s, contracts: [] }

    expect(marketingEfficiency(s, pkg).engaged).toBe(true)
    expect(marketingEfficiency(postCliff, pkg).engaged).toBe(true)
    // The engaged economy path applies the P2 gross scale; an accidental disengage reads
    // materially HIGHER, so equality here is the real proof the regime did not flip.
    expect(previewForecast(postCliff, pkg).expectedTotal).toBeCloseTo(
      previewForecast(s, pkg).expectedTotal,
      6,
    )
  })

  it('the roster/assignment surfaces still read employment-right-now (deliberately unchanged)', () => {
    const s = foundEngaged('regime-3')
    const postCliff: GameState = { ...s, contracts: [] }
    // With a contracted roster the writer pool is the studio's own signed writers.
    expect(studioPool(s, 'writer').length).toBe(1)
    // With nobody employed it falls back to the open global pool — the D-11.11 legacy path.
    expect(studioPool(postCliff, 'writer').length).toBeGreaterThan(1)
  })
})
