// ── Gate D1: studioLotSnapshot selector tests ────────────────────────────────
// Independent tests that the presentation snapshot is a faithful, deterministic,
// non-mutating projection of the authoritative D-12 GameState — and invents nothing
// (no fabricated decision-required, no theatrical payment data). State is built with
// the engine's public surface exactly as the core tests do.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
  tick,
  TUNING,
} from '../../../src/core/index.ts'
import type { CastSlot, CreativeRole, GameState } from '../../../src/core/index.ts'
import {
  exportSaveJson,
  financeCard,
  importSaveJson,
  selectActiveProductions,
  selectCash,
  selectStanding,
  studioLotSnapshot,
  STUDIO_LOT_BRAND,
} from '../engine/adapter.ts'

// ── engine-level fixtures (mirroring tests/d12-economy.test.ts) ───────────────
function foundStudio(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  const toSign = [
    ...byRole('actor', FOUNDING_MINIMUMS.actor),
    ...byRole('director', FOUNDING_MINIMUMS.director),
    ...byRole('writer', FOUNDING_MINIMUMS.writer),
    ...byRole('craft', FOUNDING_MINIMUMS.craft),
  ]
  for (const t of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 156 }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}
// A richer roster with disjoint talent for two concurrent productions (engine enforces
// talent exclusivity, M16): 6 actors, 2 directors, 2 writers, 2 crafts.
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
// `slot` selects a disjoint block of talent (3 actors + 1 each of writer/director/craft)
// so two concurrent films never share a person (engine exclusivity). slot 0 works with
// the minimum roster; slot 1 needs foundStudioRich.
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
function advance(s: GameState, n: number): GameState {
  let out = s
  for (let i = 0; i < n; i++) out = tick(out)
  return out
}
const stage = (snap: ReturnType<typeof studioLotSnapshot>, id: string) => snap.buildings.find((b) => b.id === id)!

describe('studioLotSnapshot — authoritative, deterministic, invents nothing', () => {
  it('1. a fresh founded studio produces a valid snapshot (all nine buildings)', () => {
    const s = foundStudio('lot-1')
    const snap = studioLotSnapshot(s)
    expect(snap.studioName).toBe(STUDIO_LOT_BRAND)
    expect(snap.week).toBe(s.market.tick)
    expect(snap.buildings).toHaveLength(9)
    expect(snap.sceneSeed).toBe(s.seed)
    expect(snap.activeProductions).toHaveLength(0)
    expect(snap.releasePresence).toBe('none')
  })

  it('2. an imported SaveFileV4 yields the same week / cash / standing', () => {
    const s = advance(greenlightFilm(foundStudio('lot-2'), 0), 3)
    const round = importSaveJson(exportSaveJson(s))
    expect(round.ok).toBe(true)
    if (!round.ok) return
    const a = studioLotSnapshot(s)
    const b = studioLotSnapshot(round.state)
    expect(b.week).toBe(a.week)
    expect(b.cash).toBe(a.cash)
    expect(b.standingValues).toEqual(a.standingValues)
  })

  it('3. lot cash equals the authoritative cash / finance read model (not recomputed)', () => {
    const s = advance(greenlightFilm(foundStudio('lot-3'), 0), 2)
    const snap = studioLotSnapshot(s)
    expect(snap.cash).toBe(selectCash(s))
    expect(snap.cash).toBe(financeCard(s).cash)
  })

  it('4. lot standing equals the authoritative standing read model', () => {
    const s = foundStudio('lot-4')
    const snap = studioLotSnapshot(s)
    const st = selectStanding(s)
    expect(snap.standingValues.awareness).toBe(st.audienceAwareness)
    expect(snap.standingValues.prestige).toBe(st.industryPrestige)
    expect(snap.standingValues.confidence).toBe(st.commercialConfidence)
  })

  it('5. zero productions renders two EMPTY stages', () => {
    const snap = studioLotSnapshot(foundStudio('lot-5'))
    expect(snap.activeProductions).toHaveLength(0)
    expect(stage(snap, 'stage-a').attention).toBe('empty')
    expect(stage(snap, 'stage-b').attention).toBe('empty')
  })

  it('6. one production occupies exactly one stage', () => {
    const snap = studioLotSnapshot(greenlightFilm(foundStudio('lot-6'), 0))
    expect(snap.activeProductions).toHaveLength(1)
    expect(snap.activeProductions[0]!.stageId).toBe('stage-a')
    expect(stage(snap, 'stage-a').attention).toBe('active')
    expect(stage(snap, 'stage-b').attention).toBe('empty')
  })

  it('7. two productions occupy Stage A and Stage B independently', () => {
    let s = foundStudioRich('lot-7')
    s = greenlightFilm(s, 0, 0)
    s = greenlightFilm(s, 1, 1)
    const snap = studioLotSnapshot(s)
    expect(snap.activeProductions).toHaveLength(2)
    const a = snap.activeProductions.find((p) => p.stageId === 'stage-a')!
    const b = snap.activeProductions.find((p) => p.stageId === 'stage-b')!
    expect(a).toBeTruthy()
    expect(b).toBeTruthy()
    expect(a.id).not.toBe(b.id)
    expect(stage(snap, 'stage-a').attention).toBe('active')
    expect(stage(snap, 'stage-b').attention).toBe('active')
  })

  it('8. progress + weeks-remaining come from the authoritative production projection', () => {
    const s = advance(greenlightFilm(foundStudio('lot-8'), 0), 3)
    const prod = selectActiveProductions(s)[0]!
    const card = studioLotSnapshot(s).activeProductions[0]!
    expect(card.weeksRemaining).toBe(prod.remainingTicks)
    expect(card.progress01).toBeCloseTo((TUNING.PRODUCTION_TICKS - prod.remainingTicks) / TUNING.PRODUCTION_TICKS, 10)
    expect(card.stageState).toBe('filming')
  })

  it('9. attention is derived from a read model; no production is ever decision-required in D1', () => {
    const s = greenlightFilm(foundStudio('lot-9'), 0)
    const snap = studioLotSnapshot(s)
    // The one authoritative attention (Administration warning) is derived from the finance
    // read model — it appears iff cash + runway indicate financial pressure.
    const fin = financeCard(s)
    const expectWarn =
      s.studio.cash <= 0 || (fin.runway.weeks !== null && !fin.runway.infinite && fin.runway.weeks <= 8)
    expect(stage(snap, 'admin').attention === 'warning').toBe(expectWarn)
    // D1 never fabricates decision-required / ready-for-release for a production.
    for (const b of snap.buildings) expect(b.attention).not.toBe('decision-required')
    for (const p of snap.activeProductions) expect(p.stageState).not.toBe('decision-required')
  })

  it('10. the selector is deterministic (same state → identical snapshot; same seed → identical)', () => {
    const s = advance(greenlightFilm(foundStudio('lot-10'), 0), 2)
    expect(JSON.stringify(studioLotSnapshot(s))).toBe(JSON.stringify(studioLotSnapshot(s)))
    expect(JSON.stringify(studioLotSnapshot(foundStudio('same-seed')))).toBe(
      JSON.stringify(studioLotSnapshot(foundStudio('same-seed'))),
    )
  })

  it('11. the selector does not mutate state', () => {
    const s = greenlightFilm(foundStudio('lot-11'), 0)
    const before = JSON.stringify(s)
    studioLotSnapshot(s)
    expect(JSON.stringify(s)).toBe(before)
  })

  it('12. no financial value is independently recomputed (cash is the read-model value)', () => {
    const s = advance(greenlightFilm(foundStudio('lot-12'), 0), 4)
    const snap = studioLotSnapshot(s)
    // Identity, not approximate — the snapshot forwards the authoritative number.
    expect(snap.cash).toBe(financeCard(s).cash)
    expect(snap.cash).toBe(s.studio.cash)
  })

  it('13. the Expansion Pad carries no engine capability or bonus — only a future cue', () => {
    const snap = studioLotSnapshot(foundStudio('lot-13'))
    const exp = stage(snap, 'expansion')
    expect(exp.attention).toBe('future')
    expect(exp.available).toBe(true)
    expect(exp.attentionReason?.toLowerCase()).toContain('future')
    // The building state has no numeric/capability fields (structural — keys are display-only).
    expect(Object.keys(exp).sort()).toEqual(['attention', 'attentionReason', 'available', 'id'])
  })

  it('14. release presence does not invent theatrical payment data', () => {
    const s = advance(greenlightFilm(foundStudio('lot-14'), 0), TUNING.PRODUCTION_TICKS + 1)
    const snap = studioLotSnapshot(s)
    expect(s.studio.releasedFilms.length).toBeGreaterThan(0)
    expect(['released', 'now-showing']).toContain(snap.releasePresence)
    // ReleasedCard exposes ONLY display facts — no payment count / revenue / capacity.
    for (const card of snap.releasedFilms) {
      expect(Object.keys(card).sort()).toEqual(['id', 'reception', 'title', 'weeksAgo'])
    }
    // 'now-showing' is grounded in the authoritative active-run count, not invented.
    const nowShowing = financeCard(s).activeRuns > 0
    expect(snap.releasePresence === 'now-showing').toBe(nowShowing)
  })
})
