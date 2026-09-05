// ── P08A W2 — the Standing & Studio History projection / exact wire contract ──
//
// The §12 laws under test, stated once:
//   P1  The projection is PURE presentation: deriving it twice is byte-identical
//       and the state digest is untouched (no RNG, no mutation).
//   P2  It rides the projection bundle as its own section and validates against
//       the canonical schema (projection 16), so the exact Unity consumer can
//       parse every field with no hidden data present anywhere in the payload.
//   P3  Exact routes: a film row/receipt carries the immutable productionId and
//       says whether a durable P07 result exists; released films have no lot
//       location; a person row carries the talent id and captured credits only.
//   P4  Honesty: a migrated world says what was not recorded, lists every durable
//       film with `historyRecorded=false` for pre-boundary releases, and never
//       invents a row; a native world carries no notice.
//   P5  Provenance reconciles: each channel's `recordedChange` equals the sum of
//       every recorded receipt delta (folded summaries included).
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
  makeSaveV16,
  migrateToV18,
  stableStringify,
  tick,
  TUNING,
} from '../src/core/index.js'
import type { CastSlot, CreativeRole, GameState } from '../src/core/index.js'
import { exportSaveJson, studioLotSnapshot } from '../ui/src/engine/adapter.ts'
import { developmentProjection } from '../bridge/development.ts'
import { castingProjection } from '../bridge/casting.ts'
import { releaseProjection } from '../bridge/release.ts'
import { historyProjection } from '../bridge/history.ts'
import { projectStudioProjectionBundle } from '../bridge/schema/runtime.ts'

function foundStudio(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  for (const t of [
    ...byRole('actor', FOUNDING_MINIMUMS.actor),
    ...byRole('director', FOUNDING_MINIMUMS.director),
    ...byRole('writer', FOUNDING_MINIMUMS.writer),
    ...byRole('craft', FOUNDING_MINIMUMS.craft),
  ]) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 156 }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}
function rosterIds(s: GameState, role: CreativeRole): string[] {
  return s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!).filter((t) => t.role === role).map((t) => t.id)
}
function greenlightOneFilm(s: GameState, conceptIndex = 0): GameState {
  const concept = s.concepts[conceptIndex]!
  const actors = rosterIds(s, 'actor')
  return applyActions(s, [{
    kind: 'greenlight',
    production: {
      conceptId: concept.id,
      shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
      promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
      writerId: rosterIds(s, 'writer')[0]!,
      directorId: rosterIds(s, 'director')[0]!,
      cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! } as Record<CastSlot, string>,
      craftIds: [rosterIds(s, 'craft')[0]!],
      budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
    },
  }])
}
function advance(s: GameState, n: number): GameState {
  let out = s
  for (let i = 0; i < n; i++) {
    const ready = out.studio.activeProductions.filter((p) => p.remainingTicks === 1)
    if (ready.length > 0) out = applyActions(out, ready.map((p) => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })))
    out = tick(out)
  }
  return out
}
function releasedStudio(seed: string): GameState {
  let s = greenlightOneFilm(foundStudio(seed))
  for (let guard = 0; guard < 24 && s.studio.releasedFilms.length === 0; guard++) s = advance(s, 1)
  expect(s.studio.releasedFilms.length).toBe(1)
  return advance(applyActions(s, [{ kind: 'publicity', tier: 'whisper' }]), 2)
}
const digest = (s: GameState) => createHash('sha256').update(exportSaveJson(s)).digest('hex')
function bundleOf(state: GameState) {
  return projectStudioProjectionBundle({
    ...studioLotSnapshot(state),
    development: developmentProjection(state),
    casting: castingProjection(state),
    release: releaseProjection(state),
    history: historyProjection(state),
  })
}

describe('P08A W2 — P1 purity and P2 exact wire contract', () => {
  it('derives byte-identically twice, mutates nothing, and validates as the history bundle section', () => {
    const state = releasedStudio('p08-w2-pure')
    const before = digest(state)
    const a = stableStringify(historyProjection(state))
    const b = stableStringify(historyProjection(state))
    expect(a).toBe(b)
    expect(digest(state)).toBe(before)
    const bundle = bundleOf(state)
    expect(bundle.history.history.currentWeek).toBe(state.market.tick)
    expect(bundle.history.history.standing.channels.map((c) => c.key)).toEqual([
      'audienceAwareness', 'industryPrestige', 'commercialConfidence',
    ])
    // No hidden talent data can cross the bridge inside this section.
    const wire = JSON.stringify(bundle.history)
    for (const forbidden of ['"ceilings"', '"actual"', '"rngState"', '"devRate"', '"skills"']) {
      expect(wire.includes(forbidden), forbidden).toBe(false)
    }
  })
})

describe('P08A W2 — P3 exact routes and P5 provenance', () => {
  it('links receipts and rows to the exact production id, marks result availability, and reconciles channels', () => {
    const state = releasedStudio('p08-w2-routes')
    const film = state.studio.releasedFilms[0]!
    const h = historyProjection(state)
    // A release receipt names the exact film and its durable result route.
    const release = h.standing.receipts.find((r) => r.sourceKind === 'releaseResult')!
    expect(release.sourceId).toBe(film.productionId)
    expect(release.filmId).toBe(film.productionId)
    expect(release.reasonLines.length).toBe(3)
    expect(release.formulaVersion).toMatch(/^standing\//)
    // The publicity receipt names its ledger identity and carries no film route.
    const publicity = h.standing.receipts.find((r) => r.sourceKind === 'publicity')!
    expect(publicity.sourceId).toMatch(/^publicity-\d+-whisper$/)
    expect(publicity.filmId).toBeNull()
    // Timeline: the first release is a landmark whose subject is the exact film with NO lot location.
    const landmark = h.timeline.find((e) => e.kind === 'filmReleased')!
    expect(landmark.significance).toBe('landmark')
    expect(landmark.subjectKind).toBe('film')
    expect(landmark.subjectId).toBe(film.productionId)
    expect(landmark.subjectLocation).toBe('none')
    expect(landmark.filmId).toBe(film.productionId)
    expect(landmark.buildingId).toBeNull()
    // Routine settling never enters the timeline; it lives in the receipts.
    expect(h.timeline.some((e) => e.significance === 'routine')).toBe(false)
    expect(h.standing.receipts.some((r) => r.sourceKind === 'awarenessDrift')).toBe(true)
    // Films: every durable P07 record, recorded, with a result route and its event ids.
    expect(h.films).toHaveLength(1)
    expect(h.films[0]).toMatchObject({ productionId: film.productionId, historyRecorded: true, resultAvailable: true })
    expect(h.films[0]!.historyEventIds.length).toBeGreaterThanOrEqual(2)
    // People: captured participants only (an engaged greenlight captures them), exact ids.
    expect(h.people.length).toBeGreaterThanOrEqual(6)
    for (const person of h.people) {
      expect(state.talent.some((t) => t.id === person.talentId)).toBe(true)
      expect(person.credits.every((c) => c.productionId === film.productionId)).toBe(true)
      expect(person.present).toBe(true)
    }
    // P5: recordedChange is exactly the sum of every receipt delta per channel.
    for (const channel of h.standing.channels) {
      const sum = h.standing.receipts.reduce((a, r) => a + r.deltas[channel.key], 0)
      expect(channel.recordedChange).toBeCloseTo(sum, 9)
      expect(channel.value).toBe(state.studio.standing[channel.key])
    }
    expect(h.notRecordedNotice).toBeNull()
    expect(h.recordsAvailable).toBe(false)
  })
})

describe('P08A W2 — P4 honesty for migrated worlds', () => {
  it('says what was not recorded, lists pre-boundary films as unrecorded, and invents no row', () => {
    const played = releasedStudio('p08-w2-migrated')
    const migrated = migrateToV18(makeSaveV16(played)).state
    const h = historyProjection(migrated)
    expect(h.recordingStartedWeek).toBe(played.market.tick)
    expect(h.notRecordedNotice).toBe(
      `Detailed Standing/history changes were not recorded before Week ${String(played.market.tick)}.`,
    )
    expect(h.timeline).toEqual([])
    expect(h.standing.receipts).toEqual([])
    expect(h.films).toHaveLength(1)
    expect(h.films[0]).toMatchObject({ historyRecorded: false, resultAvailable: true, historyEventIds: [] })
    for (const channel of h.standing.channels) expect(channel.recordedChange).toBe(0)
    // Still a valid bundle section on the wire.
    expect(() => bundleOf(migrated)).not.toThrow()
  })
  it('keeps same-title films distinct by id in every row', () => {
    let s = releasedStudio('p08-w2-twins')
    s = greenlightOneFilm(s, 0)
    for (let guard = 0; guard < 24 && s.studio.releasedFilms.length < 2; guard++) s = advance(s, 1)
    const h = historyProjection(s)
    const ids = new Set(h.films.map((f) => f.productionId))
    expect(ids.size).toBe(2)
    expect(h.films[0]!.title).toBe(h.films[1]!.title)
    const releases = h.timeline.filter((e) => e.kind === 'filmReleased')
    expect(new Set(releases.map((e) => e.subjectId)).size).toBe(2)
    expect(TUNING.PRODUCTION_TICKS).toBeGreaterThan(0)
  })
})
