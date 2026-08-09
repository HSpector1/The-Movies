// ── D1-B: the stage-assignment defect, reproduced and fixed ───────────────────
// Part 1 REPRODUCES the pre-existing presentation defect against the real engine and the
// real adapter — no hand-built snapshots, so the bug cannot be an artefact of the fixture.
// Part 2 proves the presentation-side resolver fixes it, deterministically, without
// touching GameState, the adapter, or the snapshot schema.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  generateWorld,
  tick,
} from '../../../../src/core/index.ts'
import type { CastSlot, CreativeRole, GameState } from '../../../../src/core/index.ts'
import { studioLotSnapshot } from '../../engine/adapter.ts'
import type { StudioLotSnapshot } from './StudioLotSnapshot.ts'
import { StageAssignment } from './stageAssignment.ts'

// ── engine fixtures (same public surface the other lot tests use) ─────────────
function foundStudioRich(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  const toSign = [...byRole('actor', 6), ...byRole('director', 2), ...byRole('writer', 2), ...byRole('craft', 2)]
  for (const t of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 156 }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}
function rosterIds(s: GameState, role: CreativeRole): string[] {
  return s.contracts
    .map((c) => s.talent.find((t) => t.id === c.talentId)!)
    .filter((t) => t.role === role)
    .map((t) => t.id)
}
function greenlightFilm(s: GameState, conceptIndex: number, slot = 0): GameState {
  const concept = s.concepts[conceptIndex]!
  const actors = rosterIds(s, 'actor')
  const a = slot * 3
  const cast = { lead: actors[a]!, antagonist: actors[a + 1]!, support: actors[a + 2]! } as Record<CastSlot, string>
  return applyActions(s, [
    {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: {
          genre: concept.genre,
          intendedSegments: ['adult'],
          ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
        },
        writerId: rosterIds(s, 'writer')[slot]!,
        directorId: rosterIds(s, 'director')[slot]!,
        cast,
        craftIds: [rosterIds(s, 'craft')[slot]!],
        budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
      },
    },
  ])
}

/**
 * Walk a studio through: film A greenlit, film B greenlit two weeks later, then ticked
 * until A has released and B is still shooting alone. Returns the snapshot at every week
 * so a resolver can be fed the real sequence a player would see.
 */
function twoFilmTimeline(seed: string): { snaps: StudioLotSnapshot[]; filmBId: string } {
  let s = greenlightFilm(foundStudioRich(seed), 0, 0)
  const snaps: StudioLotSnapshot[] = [studioLotSnapshot(s)]
  s = tick(s)
  s = tick(s)
  s = greenlightFilm(s, 1, 1)
  snaps.push(studioLotSnapshot(s))
  const filmBId = studioLotSnapshot(s).activeProductions.find((p) => p.stageId === 'stage-b')!.id
  // tick until only one production remains (film A has released and been spliced out)
  for (let i = 0; i < 20; i++) {
    s = tick(s)
    snaps.push(studioLotSnapshot(s))
    const live = studioLotSnapshot(s).activeProductions
    if (live.length === 1 && live[0]!.id === filmBId) break
  }
  return { snaps, filmBId }
}

const stageOf = (snap: StudioLotSnapshot, id: string) =>
  snap.activeProductions.find((p) => p.id === id)?.stageId
const building = (snap: StudioLotSnapshot, id: string) => snap.buildings.find((b) => b.id === id)!

describe('D1-B — the stage-assignment defect (pre-existing, presentation-side)', () => {
  it('1. REPRODUCED: a surviving production migrates Stage B → Stage A when the other releases', () => {
    const { snaps, filmBId } = twoFilmTimeline('assign-1')

    // while both are shooting, film B is presented on Stage B
    const both = snaps.find((s) => s.activeProductions.length === 2)!
    expect(stageOf(both, filmBId)).toBe('stage-b')

    // after film A releases and the array compacts, the SAME film is now on Stage A
    const alone = snaps.find(
      (s) => s.activeProductions.length === 1 && s.activeProductions[0]!.id === filmBId,
    )!
    expect(stageOf(alone, filmBId)).toBe('stage-a')

    // ...and the buildings follow it: the stage the player was watching goes dark
    expect(building(both, 'stage-b').attention).toBe('active')
    expect(building(alone, 'stage-b').attention).toBe('empty')
    expect(building(alone, 'stage-a').attention).toBe('active')
  })
})

describe('D1-B — StageAssignment fixes it, presentation-side only', () => {
  it('2. a production keeps its stage for its whole presentation lifetime', () => {
    const { snaps, filmBId } = twoFilmTimeline('assign-1')
    const a = new StageAssignment()
    const fixed = snaps.map((s) => a.resolve(s))

    const both = fixed.find((s) => s.activeProductions.length === 2)!
    const alone = fixed.find(
      (s) => s.activeProductions.length === 1 && s.activeProductions[0]!.id === filmBId,
    )!
    expect(stageOf(both, filmBId)).toBe('stage-b')
    expect(stageOf(alone, filmBId)).toBe('stage-b') // ← was 'stage-a' before the fix
  })

  it('3. the buildings follow the corrected assignment (canvas + companion nav agree)', () => {
    const { snaps, filmBId } = twoFilmTimeline('assign-1')
    const a = new StageAssignment()
    const fixed = snaps.map((s) => a.resolve(s))
    const alone = fixed.find(
      (s) => s.activeProductions.length === 1 && s.activeProductions[0]!.id === filmBId,
    )!

    expect(building(alone, 'stage-b').attention).toBe('active')
    expect(building(alone, 'stage-a').attention).toBe('empty')
    // the reason string travelled with the production, it was not re-derived
    expect(building(alone, 'stage-b').attentionReason).toBe(
      snaps
        .find((s) => s.activeProductions.length === 1 && s.activeProductions[0]!.id === filmBId)!
        .buildings.find((b) => b.id === 'stage-a')!.attentionReason,
    )
  })

  it('4. cold start is unchanged: a first production still takes Stage A', () => {
    const { snaps } = twoFilmTimeline('assign-1')
    const first = snaps.find((s) => s.activeProductions.length === 1)!
    const resolved = new StageAssignment().resolve(first)
    expect(resolved.activeProductions[0]!.stageId).toBe('stage-a')
    expect(resolved).toBe(first) // nothing to correct ⇒ same object back
  })

  it('5. deterministic: two independent resolvers over the same sequence agree exactly', () => {
    const { snaps } = twoFilmTimeline('assign-1')
    const x = new StageAssignment()
    const y = new StageAssignment()
    const rx = snaps.map((s) => JSON.stringify(x.resolve(s)))
    const ry = snaps.map((s) => JSON.stringify(y.resolve(s)))
    expect(rx).toEqual(ry)
  })

  it('6. re-resolving the same snapshot is idempotent', () => {
    const { snaps, filmBId } = twoFilmTimeline('assign-1')
    const a = new StageAssignment()
    for (const s of snaps) a.resolve(s)
    const last = snaps[snaps.length - 1]!
    const once = a.resolve(last)
    const twice = a.resolve(last)
    expect(JSON.stringify(twice)).toEqual(JSON.stringify(once))
    expect(stageOf(twice, filmBId)).toBe('stage-b')
  })

  it('7. a freed slot is reused once its production leaves', () => {
    const { snaps, filmBId } = twoFilmTimeline('assign-1')
    const a = new StageAssignment()
    for (const s of snaps) a.resolve(s)
    expect(a.slotFor(filmBId)).toBe('stage-b')

    // an empty lot releases every slot; the next arrival starts from Stage A again
    const empty: StudioLotSnapshot = { ...snaps[0]!, activeProductions: [] }
    a.resolve(empty)
    expect(a.slotFor(filmBId)).toBeUndefined()

    const fresh = a.resolve(snaps.find((s) => s.activeProductions.length === 1)!)
    expect(fresh.activeProductions[0]!.stageId).toBe('stage-a')
  })

  it('8. the snapshot SCHEMA is untouched — same keys, same building count, same ids', () => {
    const { snaps } = twoFilmTimeline('assign-1')
    const a = new StageAssignment()
    for (const s of snaps) {
      const r = a.resolve(s)
      expect(Object.keys(r).sort()).toEqual(Object.keys(s).sort())
      expect(r.buildings).toHaveLength(s.buildings.length)
      expect(r.buildings.map((b) => b.id)).toEqual(s.buildings.map((b) => b.id))
      for (let i = 0; i < r.buildings.length; i++) {
        expect(Object.keys(r.buildings[i]!).sort()).toEqual(Object.keys(s.buildings[i]!).sort())
      }
      expect(r.activeProductions.map((p) => p.id)).toEqual(s.activeProductions.map((p) => p.id))
      for (let i = 0; i < r.activeProductions.length; i++) {
        expect(Object.keys(r.activeProductions[i]!).sort()).toEqual(
          Object.keys(s.activeProductions[i]!).sort(),
        )
      }
    }
  })

  it('9. it never invents or drops a production, and never double-books a stage', () => {
    const { snaps } = twoFilmTimeline('assign-1')
    const a = new StageAssignment()
    for (const s of snaps) {
      const r = a.resolve(s)
      const slots = r.activeProductions.map((p) => p.stageId)
      expect(new Set(slots).size).toBe(slots.length) // no two productions on one stage
      expect(r.activeProductions).toHaveLength(s.activeProductions.length)
    }
  })
})
