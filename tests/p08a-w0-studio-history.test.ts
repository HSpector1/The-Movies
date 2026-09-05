// ── P08A W0/W1 — Standing & Studio History Spine V1: root, receipts, migration ──
//
// The charter §6/§7/§9/§10 laws under test, stated once:
//   H1  A fresh world carries an EMPTY history recording from week 0; the
//       headless (never-engaged) corpus appends NOTHING (studioHistory.ts pin 5).
//   H2  Founding is a landmark, recorded exactly once at the founding week.
//   H3  Every Standing mutation site produces an exact receipt: release result
//       (site 1), weekly settling (site 2), publicity (site 3) — with frozen
//       before/after/deltas equal to the actual change, exact source ids, the
//       formula identity, and public driver facts consistent with the engine's
//       own arithmetic. A no-op update records nothing.
//   H4  Releases record `filmReleased` (first ever = landmark) and settled runs
//       record `theatricalRunCompleted`; identity is the production id even when
//       titles collide.
//   H5  Routine settling receipts are bounded: after the window they FOLD into one
//       exact per-window summary whose deltas equal the sum of what it replaced;
//       folding is a pure function of the week (same seed ⇒ identical bytes).
//   H6  V16→V17 migration invents nothing: recording begins at the migration week,
//       rows are empty, every other root and the current Standing are unchanged;
//       V17 round-trips byte-identically; every downgrade is refused.
//   H7  A save/load mid-run continues with IDENTICAL history to the unbroken run
//       (exact-once, deterministic order).
//   H8  Forged history (out-of-order ids, pre-boundary rows, lying deltas) is
//       refused at the save boundary.
import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  convertV16ToV17,
  exportSave,
  FOUNDING_MINIMUMS,
  generateWorld,
  HISTORY_ROUTINE_WINDOW_WEEKS,
  historyRecordedAt,
  importSave,
  makeSave,
  makeSaveV16,
  migrateToV13,
  migrateToV14,
  migrateToV15,
  migrateToV16,
  migrateToV17,
  releaseStandingDrivers,
  STANDING_FORMULA_VERSION,
  standingReceipts,
  studioHistoryTimeline,
  tick,
  TUNING,
  updateStanding,
  validateSaveV17,
} from '../src/core/index.js'
import type {
  CastSlot,
  CreativeRole,
  GameState,
  StudioHistoryEvent,
} from '../src/core/index.js'

// ── fixtures (the d12-economy vocabulary, minimally copied) ──────────────────
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
function rosterIds(s: GameState, role: CreativeRole): string[] {
  return s.contracts
    .map((c) => s.talent.find((t) => t.id === c.talentId)!)
    .filter((t) => t.role === role)
    .map((t) => t.id)
}
function greenlightOneFilm(s: GameState, conceptIndex = 0, marketing = 100_000): GameState {
  const concept = s.concepts[conceptIndex]!
  const actors = rosterIds(s, 'actor')
  const cast = { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! } as Record<CastSlot, string>
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
        writerId: rosterIds(s, 'writer')[0]!,
        directorId: rosterIds(s, 'director')[0]!,
        cast,
        craftIds: [rosterIds(s, 'craft')[0]!],
        budget: { negative: concept.baseNegativeCost, marketing },
      },
    },
  ])
}
/** Commit every Release-Ready picture, then tick (P06A hold law). */
function advance(s: GameState, n: number): GameState {
  let out = s
  for (let i = 0; i < n; i++) {
    const ready = out.studio.activeProductions.filter((p) => p.remainingTicks === 1)
    if (ready.length > 0) {
      out = applyActions(
        out,
        ready.map((p) => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })),
      )
    }
    out = tick(out)
  }
  return out
}
/** Advance until the first release lands (the week after PRODUCTION_TICKS). */
function releaseOne(seed: string): { before: GameState; after: GameState } {
  let s = greenlightOneFilm(foundStudio(seed))
  let before = s
  for (let guard = 0; guard < 24 && s.studio.releasedFilms.length === 0; guard++) {
    before = s
    s = advance(s, 1)
  }
  expect(s.studio.releasedFilms.length).toBe(1)
  return { before, after: s }
}
const rowsOf = (s: GameState, kind: StudioHistoryEvent['kind']) =>
  s.studioHistory.rows.filter((r) => r.kind === kind)
const bytes = (s: GameState) => exportSave(makeSave(s))

// ── H1 — fresh and headless ──────────────────────────────────────────────────
describe('P08A H1 — fresh world and the headless corpus', () => {
  it('a generated world records from week 0 with no rows', () => {
    const w = generateWorld('p08-h1')
    expect(w.studioHistory).toEqual({ recordingStartedWeek: 0, nextEventId: 0, rows: [] })
  })
  it('a never-engaged (M0A) world appends NOTHING even when it releases films', () => {
    // The headless corpus greenlights straight from the pool and releases on the
    // legacy path; Standing moves, yet the history gate is the engaged economy.
    let s = generateWorld('p08-h1-headless')
    const actors = s.talent.filter((t) => t.role === 'actor').map((t) => t.id)
    const concept = s.concepts[0]!
    s = applyActions(s, [
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
          writerId: s.talent.find((t) => t.role === 'writer')!.id,
          directorId: s.talent.find((t) => t.role === 'director')!.id,
          cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! },
          craftIds: [],
          budget: { negative: concept.baseNegativeCost, marketing: 0 },
        },
      },
    ])
    s = advance(s, TUNING.PRODUCTION_TICKS + 2)
    expect(s.studio.releasedFilms.length).toBe(1)
    expect(s.economyEngagedEver).toBe(false)
    expect(s.studioHistory.rows).toEqual([])
    expect(s.studioHistory.nextEventId).toBe(0)
  })
})

// ── H2 — founding landmark ───────────────────────────────────────────────────
describe('P08A H2 — founding is a landmark recorded exactly once', () => {
  it('records studioFounded at the founding week with landmark significance', () => {
    const s = foundStudio('p08-h2')
    const rows = rowsOf(s, 'studioFounded')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ eventId: 0, week: 0, kind: 'studioFounded', significance: 'landmark' })
    expect(s.studioHistory.nextEventId).toBe(1)
  })
})

// ── H3/H4 — release receipts and release rows ────────────────────────────────
describe('P08A H3/H4 — the release mutation site records exact receipts and the release fact', () => {
  it('freezes before/after/deltas equal to the actual Standing change, with the source id and drivers', () => {
    const { before, after } = releaseOne('p08-h3-release')
    const film = after.studio.releasedFilms[0]!
    const receipts = rowsOf(after, 'standingChanged').filter(
      (r) => r.kind === 'standingChanged' && r.source.kind === 'releaseResult',
    )
    expect(receipts).toHaveLength(1)
    const r = receipts[0]!
    if (r.kind !== 'standingChanged' || r.source.kind !== 'releaseResult') throw new Error('unreachable')
    expect(r.source.productionId).toBe(film.productionId)
    expect(r.week).toBe(before.market.tick)
    expect(r.formulaVersion).toBe(STANDING_FORMULA_VERSION)
    expect(r.before).toEqual(before.studio.standing)
    expect(r.deltas).toEqual({
      audienceAwareness: r.after.audienceAwareness - r.before.audienceAwareness,
      industryPrestige: r.after.industryPrestige - r.before.industryPrestige,
      commercialConfidence: r.after.commercialConfidence - r.before.commercialConfidence,
    })
    // The release receipt is followed by the (routine) settling receipt in the
    // same tick when awareness sits above the anchor; the FINAL standing equals
    // the last receipt's `after`.
    const last = standingReceipts(after.studioHistory).at(-1)!
    expect(last.after).toEqual(after.studio.standing)
    // Public driver facts are the engine's own arithmetic.
    expect(r.facts.kind).toBe('releaseResult')
    if (r.facts.kind !== 'releaseResult') throw new Error('unreachable')
    expect(r.facts.criticScore).toBe(film.criticScore)
    expect(r.facts.prestigeBenchmark).toBe(TUNING.PRESTIGE_CRITIC_BENCHMARK)
    expect(r.facts.reach01).toBeGreaterThanOrEqual(0)
    expect(r.facts.reach01).toBeLessThanOrEqual(1)
  })
  it('records filmReleased as a LANDMARK for the first film and MAJOR afterwards, by exact id', () => {
    const { after } = releaseOne('p08-h4-first')
    const first = rowsOf(after, 'filmReleased')
    expect(first).toHaveLength(1)
    expect(first[0]).toMatchObject({
      kind: 'filmReleased',
      significance: 'landmark',
      firstRelease: true,
      productionId: after.studio.releasedFilms[0]!.productionId,
      subjects: [{ kind: 'film', productionId: after.studio.releasedFilms[0]!.productionId }],
    })
    // A second picture, same concept → same TITLE, different id → a distinct major row.
    let s = greenlightOneFilm(after, 0)
    s = advance(s, TUNING.PRODUCTION_TICKS + 1)
    const releases = rowsOf(s, 'filmReleased')
    expect(releases).toHaveLength(2)
    expect(releases[1]).toMatchObject({ significance: 'major', firstRelease: false })
    if (releases[0]!.kind !== 'filmReleased' || releases[1]!.kind !== 'filmReleased') throw new Error('unreachable')
    expect(releases[0]!.title).toBe(releases[1]!.title)
    expect(releases[0]!.productionId).not.toBe(releases[1]!.productionId)
  })
  it('records theatricalRunCompleted exactly once when the run settles', () => {
    const { after } = releaseOne('p08-h4-run')
    expect(rowsOf(after, 'theatricalRunCompleted')).toHaveLength(0)
    const settled = advance(after, TUNING.THEATRICAL_WEEKS + 1)
    const done = rowsOf(settled, 'theatricalRunCompleted')
    expect(done).toHaveLength(1)
    expect(done[0]).toMatchObject({
      productionId: after.studio.releasedFilms[0]!.productionId,
      totalWeeks: TUNING.THEATRICAL_WEEKS,
      significance: 'standard',
    })
    expect(rowsOf(advance(settled, 5), 'theatricalRunCompleted')).toHaveLength(1)
  })
  it('release drivers reproduce the exact update (consistency of the frozen facts)', () => {
    // Recompute the three deltas from the public drivers with the engine's own
    // formula shape and compare to updateStanding on the same inputs.
    const before = { audienceAwareness: 40, industryPrestige: 40, commercialConfidence: 50 }
    const s = releaseOne('p08-h3-drivers').after
    const film = s.studio.releasedFilms[0]!
    const ctx = {
      castFames: { lead: 30, antagonist: 20, support: 10 },
      actualNegative: 1_000_000,
      requiredNegative: 900_000,
      baseMarketValue: s.market.baseMarketValue,
      marketing: 100_000,
      salaries: 200_000,
      engaged: true,
    }
    const d = releaseStandingDrivers(film, ctx)
    const after = updateStanding(before, film, { expectedOpening: 0, expectedTotal: 0, expectedCriticScore: 0 }, ctx)
    const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
    const awareness = clamp(
      TUNING.AWARENESS_REACH_WEIGHT * (d.reach01 - d.reachNeutral) + TUNING.AWARENESS_STAR_WEIGHT * d.starAttention01,
      -TUNING.AWARENESS_DELTA_CAP,
      TUNING.AWARENESS_DELTA_CAP,
    )
    const prestige = clamp(
      (d.criticScore - d.prestigeBenchmark) / TUNING.PRESTIGE_CRITIC_SCALE,
      -TUNING.PRESTIGE_DELTA_CAP,
      TUNING.PRESTIGE_DELTA_CAP,
    )
    const confidence = clamp(
      TUNING.CONFIDENCE_ROI_WEIGHT * clamp(d.roi / TUNING.CONFIDENCE_ROI_SCALE, -1, 1) -
        TUNING.CONFIDENCE_DISCIPLINE_WEIGHT * d.budgetOverrun01,
      -TUNING.CONFIDENCE_DELTA_CAP,
      TUNING.CONFIDENCE_DELTA_CAP,
    )
    expect(after.audienceAwareness).toBeCloseTo(clamp(before.audienceAwareness + awareness, 0, 100), 9)
    expect(after.industryPrestige).toBeCloseTo(clamp(before.industryPrestige + prestige, 0, 100), 9)
    expect(after.commercialConfidence).toBeCloseTo(clamp(before.commercialConfidence + confidence, 0, 100), 9)
  })
})

// ── H3 — publicity receipt ───────────────────────────────────────────────────
describe('P08A H3 — the publicity mutation site records an exact receipt', () => {
  it('freezes the lift, cost, tier and the unique ledger source id', () => {
    const s = foundStudio('p08-h3-publicity')
    const before = s.studio.standing
    const bought = applyActions(s, [{ kind: 'publicity', tier: 'whisper' }])
    const receipts = rowsOf(bought, 'standingChanged')
    expect(receipts).toHaveLength(1)
    const r = receipts[0]!
    if (r.kind !== 'standingChanged' || r.source.kind !== 'publicity' || r.facts.kind !== 'publicity') throw new Error('unreachable')
    expect(r.source.tier).toBe('whisper')
    expect(r.source.sourceId).toBe(`publicity-${String(s.market.tick)}-whisper`)
    expect(r.before).toEqual(before)
    expect(r.after).toEqual(bought.studio.standing)
    expect(r.deltas.audienceAwareness).toBeCloseTo(r.facts.lift, 12)
    expect(r.deltas.industryPrestige).toBe(0)
    expect(r.deltas.commercialConfidence).toBe(0)
    expect(r.facts.cost).toBe(TUNING.PUBLICITY_TIERS.whisper.cost)
    expect(r.significance).toBe('standard')
  })
})

// ── H3/H5 — weekly settling and the fold ─────────────────────────────────────
describe('P08A H3/H5 — weekly settling receipts are exact, bounded, and folded deterministically', () => {
  it('records a routine settling receipt only when awareness actually moves, then folds past the window', () => {
    // Lift awareness above the anchor with a campaign, then let it settle.
    let s = applyActions(foundStudio('p08-h5-fold'), [{ kind: 'publicity', tier: 'blitz' }])
    expect(s.studio.standing.audienceAwareness).toBeGreaterThan(TUNING.AWARENESS_DRIFT_ANCHOR)
    const settleWeek = s.market.tick
    s = tick(s)
    const drift = rowsOf(s, 'standingChanged').filter(
      (r) => r.kind === 'standingChanged' && r.source.kind === 'awarenessDrift',
    )
    expect(drift).toHaveLength(1)
    const d = drift[0]!
    if (d.kind !== 'standingChanged' || d.facts.kind !== 'awarenessDrift') throw new Error('unreachable')
    expect(d.week).toBe(settleWeek)
    expect(d.significance).toBe('routine')
    expect(d.facts.anchor).toBe(TUNING.AWARENESS_DRIFT_ANCHOR)
    expect(d.facts.rate).toBe(TUNING.AWARENESS_DRIFT_RATE)
    expect(d.after.audienceAwareness).toBe(s.studio.standing.audienceAwareness)
    // Routine detail never enters the main timeline.
    expect(studioHistoryTimeline(s.studioHistory).some((r) => r.significance === 'routine')).toBe(false)

    // Play well past the window: the oldest bucket of routine rows folds into ONE
    // summary whose deltas equal the sum of what it replaced.
    const window = HISTORY_ROUTINE_WINDOW_WEEKS
    let long = s
    for (let i = 0; i < window * 2 + 5; i++) long = tick(long)
    const folded = rowsOf(long, 'standingDriftFolded')
    expect(folded.length).toBeGreaterThanOrEqual(1)
    const f = folded[0]!
    if (f.kind !== 'standingDriftFolded') throw new Error('unreachable')
    expect(f.weekStart).toBeGreaterThanOrEqual(long.studioHistory.recordingStartedWeek)
    expect(f.weekEnd).toBe(f.week)
    expect(f.count).toBeGreaterThanOrEqual(1)
    expect(f.deltas.audienceAwareness).toBeCloseTo(f.after.audienceAwareness - f.before.audienceAwareness, 9)
    // No surviving routine row is older than the window (bucket law).
    const survivors = rowsOf(long, 'standingChanged').filter((r) => r.significance === 'routine')
    for (const row of survivors) {
      const bucketEnd = Math.floor(row.week / window) * window + window - 1
      expect(bucketEnd).toBeGreaterThan(long.market.tick - window)
    }
    // Deterministic: two runs of the same seed export identical bytes.
    let twin = applyActions(foundStudio('p08-h5-fold'), [{ kind: 'publicity', tier: 'blitz' }])
    for (let i = 0; i < window * 2 + 6; i++) twin = tick(twin)
    expect(bytes(twin)).toBe(bytes(long))
  })
})

// ── H6 — migration honesty ───────────────────────────────────────────────────
describe('P08A H6 — V16→V17 migration invents nothing and every downgrade is refused', () => {
  it('begins recording at the migration week, keeps every other root and the current Standing', () => {
    const { after } = releaseOne('p08-h6-migrate')
    // A V16 envelope of a played world: it carries no history root at all.
    const v16 = makeSaveV16(after)
    expect(v16.saveVersion).toBe(16)
    expect('studioHistory' in v16.state).toBe(false)
    const v17 = convertV16ToV17(v16)
    expect(v17.saveVersion).toBe(17)
    expect(v17.state.studioHistory).toEqual({
      recordingStartedWeek: after.market.tick,
      nextEventId: 0,
      rows: [],
    })
    expect(historyRecordedAt(v17.state.studioHistory, after.market.tick - 1)).toBe(false)
    expect(historyRecordedAt(v17.state.studioHistory, after.market.tick)).toBe(true)
    expect(v17.state.studio.standing).toEqual(after.studio.standing)
    const { studioHistory: _h, ...rest17 } = v17.state
    // JSON-normalized: the migrator's plain-JSON clone folds −0 to 0 exactly as a save does.
    expect(JSON.parse(JSON.stringify(rest17))).toEqual(JSON.parse(JSON.stringify(v16.state)))
    // The live chain reaches the same answer, and V17 round-trips byte-identically.
    expect(migrateToV17(v16)).toEqual(v17)
    const json = exportSave(v17)
    expect(exportSave(importSave(json))).toBe(json)
    // Downgrades are refused, each boundary in its own voice.
    expect(() => migrateToV16(v17)).toThrow(/cannot downgrade SaveFileV17/)
    expect(() => migrateToV15(v17)).toThrow(/cannot downgrade SaveFileV17/)
    expect(() => migrateToV14(v17)).toThrow(/cannot downgrade SaveFileV17/)
    expect(() => migrateToV13(v17)).toThrow(/cannot downgrade SaveFileV17/)
  })
  it('a migrated studio records forward from the boundary and never back-fills', () => {
    const { after } = releaseOne('p08-h6-forward')
    const migrated = migrateToV17(makeSaveV16(after)).state
    // The film released BEFORE the boundary is absent from history (honest absence)…
    expect(rowsOf(migrated, 'filmReleased')).toHaveLength(0)
    // …and a NEW release after the boundary is recorded, as a MAJOR (not the
    // studio's first release — releasedFilms already proves an earlier one).
    let s = greenlightOneFilm(migrated, 1)
    s = advance(s, TUNING.PRODUCTION_TICKS + 1)
    const rows = rowsOf(s, 'filmReleased')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ significance: 'major', firstRelease: false })
    for (const row of s.studioHistory.rows) expect(row.week).toBeGreaterThanOrEqual(migrated.studioHistory.recordingStartedWeek)
  })
})

// ── H7 — exact-once through save/load ────────────────────────────────────────
describe('P08A H7 — save/load mid-run continues with identical history', () => {
  it('reloaded branch equals the unbroken branch byte-for-byte after more releases', () => {
    const { after } = releaseOne('p08-h7-continuity')
    let continuous = greenlightOneFilm(after, 1)
    let reloaded = migrateToV17(importSave(exportSave(makeSave(continuous)))).state
    expect(bytes(reloaded)).toBe(bytes(continuous))
    continuous = advance(continuous, TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS + 2)
    reloaded = advance(reloaded, TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS + 2)
    expect(bytes(reloaded)).toBe(bytes(continuous))
    expect(reloaded.studioHistory).toEqual(continuous.studioHistory)
    // Ids are strictly ascending and unique.
    const ids = continuous.studioHistory.rows.map((r) => r.eventId)
    expect(ids).toEqual([...ids].sort((a, b) => a - b))
    expect(new Set(ids).size).toBe(ids.length)
  })
})

// ── H8 — forged history refused ──────────────────────────────────────────────
describe('P08A H8 — the save boundary refuses forged history', () => {
  const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T
  it('refuses out-of-order ids, pre-boundary rows, lying deltas, and unknown kinds', () => {
    const { after } = releaseOne('p08-h8-forge')
    const legal = makeSave(after)
    expect(validateSaveV17(clone(legal))).toBeTruthy()

    const swapped = clone(legal)
    const rows = [...swapped.state.studioHistory.rows]
    if (rows.length >= 2) {
      const [a, b] = [rows[0]!, rows[1]!]
      rows[0] = b
      rows[1] = a
      ;(swapped.state.studioHistory as unknown as { rows: unknown[] }).rows = rows
      expect(() => validateSaveV17(swapped)).toThrow(/ascending eventId/)
    }

    const early = clone(legal)
    ;(early.state.studioHistory as { recordingStartedWeek: number }).recordingStartedWeek = 10_000
    expect(() => validateSaveV17(early)).toThrow(/recording boundary/)

    const lying = clone(legal)
    const receipt = lying.state.studioHistory.rows.find((r) => r.kind === 'standingChanged')
    if (receipt !== undefined && receipt.kind === 'standingChanged') {
      ;(receipt.deltas as { audienceAwareness: number }).audienceAwareness += 1
      expect(() => validateSaveV17(lying)).toThrow(/after − before/)
    }

    const unknown = clone(legal)
    ;(unknown.state.studioHistory.rows as unknown[]).push({
      eventId: unknown.state.studioHistory.nextEventId,
      week: after.market.tick,
      kind: 'awardWon',
      significance: 'major',
      subjects: [{ kind: 'studio' }],
    })
    ;(unknown.state.studioHistory as { nextEventId: number }).nextEventId += 1
    expect(() => validateSaveV17(unknown)).toThrow(/not a known history kind/)
  })
})
