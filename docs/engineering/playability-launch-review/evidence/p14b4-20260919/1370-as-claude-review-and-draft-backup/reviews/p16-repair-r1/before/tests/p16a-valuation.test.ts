// ── P16A RED A1: `libraryValuationV1`, a pure as-of end-week read that never creates cash ──
//
// Authority: P16A r3 charter "Four rights and read model" (the valuation paragraph), RED item A1;
// P16 integration contract §3 ("Library valuation is derived display/transaction input only, with
// no periodic cash, Ranking/Standing award or instant reissue"); 1370-AD adoption (provisional
// coefficients $100,000 R2 catalogue / $25,000 R1 option at score 100).
//
// Every expected number below is computed in the test from the fixture's own film facts with the
// charter formula: R2 = round(100000 * score / 100) per released film held at the date; R1 =
// round(25000 * maxQualityThroughDate / 100) per property held at the date, 0 with no linked
// released film by then. Items are rounded once each, then summed.

import { describe, expect, it } from 'vitest'
import * as valuation from '../src/core/propertyValuation.js'
import * as rights from '../src/core/rights.js'
import { importSave, makeSave, migrateToLive, stableStringify, validateSaveV45 } from '../src/core/save.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { detached, genuineV45Envelope, liveFromGenuine } from './helpers/p16-fixtures.js'

type Film = { filmId: string; studioId: string; conceptId: string; score: number; releasedAt: { kind: 'beforeCampaign'; year: number } | { kind: 'campaign'; week: number }; announcedWeek: number | null }

/** The fixture's own film facts, read directly off the roots (never through rights.ts). */
function filmsOf(state: GameState): Film[] {
  const h = state.hollywood!
  return h.films.map((f) => {
    if (f.provenance === 'authored-start/v1') {
      return { filmId: f.filmId, studioId: f.studioId, conceptId: f.conceptId, score: f.criticScore, releasedAt: f.released, announcedWeek: null }
    }
    const cost = h.businesses.find((b) => b.studioId === f.studioId)!.projects.find((p) => p.productionId === f.filmId)!
    return { filmId: f.filmId, studioId: f.studioId, conceptId: f.conceptId, score: f.result.criticScore,
      releasedAt: { kind: 'campaign', week: f.result.releaseTick }, announcedWeek: cost.announcedWeek }
  })
}
const releasedBy = (f: Film, week: number): boolean => f.releasedAt.kind === 'beforeCampaign' || f.releasedAt.week <= week
const createdBy = (f: Film, week: number): boolean => f.releasedAt.kind === 'beforeCampaign' || (f.announcedWeek ?? f.releasedAt.week) <= week
const r2Value = (score: number): number => Math.round((TUNING.RIGHTS_R2_CATALOGUE_VALUE_AT_100 * score) / 100)
const r1Value = (maxScore: number): number => Math.round((TUNING.RIGHTS_R1_OPTION_VALUE_AT_100 * maxScore) / 100)

/** The charter total for `studioId` at `week`, from raw facts: every subject still held by its creator. */
function expectedTotal(state: GameState, studioId: string, week: number): { total: number; r2: number; r1: number } {
  const films = filmsOf(state).filter((f) => f.studioId === studioId)
  let r2 = 0
  for (const f of films) if (releasedBy(f, week)) r2 += r2Value(f.score)
  let r1 = 0
  const byConcept = new Map<string, Film[]>()
  for (const f of films) byConcept.set(f.conceptId, [...(byConcept.get(f.conceptId) ?? []), f])
  for (const group of byConcept.values()) {
    if (!group.some((f) => createdBy(f, week))) continue
    const released = group.filter((f) => releasedBy(f, week))
    r1 += released.length === 0 ? 0 : r1Value(Math.max(...released.map((f) => f.score)))
  }
  return { total: r1 + r2, r2, r1 }
}

function studioIds(state: GameState): { player: string; r01: string; r02: string } {
  const h = state.hollywood!
  return { player: h.playerStudioId, r01: h.identities[1]!.studioId, r02: h.identities[2]!.studioId }
}

describe('P16A valuation: the charter fold over genuine predecessor films', () => {
  it('values every rival library at the save week exactly as the per-item rounded formula sums', () => {
    const state = liveFromGenuine('week53')
    const week = state.market.tick
    for (const identity of state.hollywood!.identities.slice(1, 5)) {
      const expected = expectedTotal(state, identity.studioId, week)
      const result = valuation.libraryValuationV1(state, identity.studioId, week)
      expect(result.kind, identity.studioId).toBe('available')
      if (result.kind !== 'available') return
      expect(result.total).toBe(expected.total)
      expect(result.items.filter((i) => i.subject.right === 'R2').reduce((s, i) => s + i.value, 0)).toBe(expected.r2)
      expect(result.items.filter((i) => i.subject.right === 'R1').reduce((s, i) => s + i.value, 0)).toBe(expected.r1)
      expect(Number.isSafeInteger(result.total)).toBe(true)
      // Stable id order, each item rounded once.
      const ids = result.items.map((i) => (i.subject.right === 'R1' ? `R1:${i.subject.propertyId}` : `R2:${i.subject.filmId}`))
      expect(ids).toEqual([...ids].sort())
      for (const item of result.items) expect(Number.isInteger(item.value)).toBe(true)
    }
  })

  it('an as-of read at week 0 sees only authored-start (beforeCampaign) titles; later weeks fold only films released through that week', () => {
    const state = liveFromGenuine('week53')
    const { r01 } = studioIds(state)
    const films = filmsOf(state).filter((f) => f.studioId === r01)
    const firstLive = Math.min(...films.filter((f) => f.releasedAt.kind === 'campaign').map((f) => (f.releasedAt as { week: number }).week))
    const at0 = valuation.libraryValuationV1(state, r01, 0)
    expect(at0.kind).toBe('available')
    if (at0.kind !== 'available') return
    expect(at0.total).toBe(expectedTotal(state, r01, 0).total)
    expect(at0.items.length).toBe(2 * films.filter((f) => f.releasedAt.kind === 'beforeCampaign').length)
    const before = valuation.libraryValuationV1(state, r01, firstLive - 1)
    const at = valuation.libraryValuationV1(state, r01, firstLive)
    expect(before.kind === 'available' && at.kind === 'available' && at.total > before.total).toBe(true)
    expect(before.kind === 'available' ? before.total : NaN).toBe(expectedTotal(state, r01, firstLive - 1).total)
    expect(at.kind === 'available' ? at.total : NaN).toBe(expectedTotal(state, r01, firstLive).total)
  })

  it('a property whose film is announced but not yet released contributes a zero R1 item and no R2 item', () => {
    const state = liveFromGenuine('week53')
    const films = filmsOf(state).filter((f) => f.releasedAt.kind === 'campaign' && f.announcedWeek !== null)
    const film = films.find((f) => f.announcedWeek! < (f.releasedAt as { week: number }).week)!
    const week = film.announcedWeek!
    const result = valuation.libraryValuationV1(state, film.studioId, week)
    expect(result.kind).toBe('available')
    if (result.kind !== 'available') return
    const propertyId = rights.storyPropertyId(film.conceptId)
    const item = result.items.find((i) => i.subject.right === 'R1' && i.subject.propertyId === propertyId)
    expect(item).toEqual({ subject: { right: 'R1', propertyId }, value: 0 })
    expect(result.items.some((i) => i.subject.right === 'R2' && i.subject.filmId === film.filmId)).toBe(false)
    expect(result.total).toBe(expectedTotal(state, film.studioId, week).total)
  })

  it('refuses a future, negative or fractional asOfWeek, an unknown holder and a world without an industry, each with its typed reason', () => {
    const state = liveFromGenuine('week53')
    const { r01 } = studioIds(state)
    expect(valuation.libraryValuationV1(state, r01, state.market.tick + 1)).toEqual({ kind: 'unavailable', reason: 'futureWeek' })
    expect(valuation.libraryValuationV1(state, r01, -1)).toEqual({ kind: 'unavailable', reason: 'invalidAsOfWeek' })
    expect(valuation.libraryValuationV1(state, r01, 2.5)).toEqual({ kind: 'unavailable', reason: 'invalidAsOfWeek' })
    expect(valuation.libraryValuationV1(state, 'studio-nobody', 1)).toEqual({ kind: 'unavailable', reason: 'unknownHolder' })
    expect(valuation.libraryValuationV1({ ...state, hollywood: null } as GameState, r01, 1)).toEqual({ kind: 'unavailable', reason: 'noIndustry' })
    // A reserved identity that has not entered holds nothing: an empty, available library.
    const r09 = state.hollywood!.identities[9]!.studioId
    expect(valuation.libraryValuationV1(state, r09, state.market.tick)).toEqual({ kind: 'available', holderId: r09, asOfWeek: state.market.tick, total: 0, items: [] })
    // The player in this fresh fixture released nothing.
    const { player } = studioIds(state)
    expect(valuation.libraryValuationV1(state, player, state.market.tick)).toEqual({ kind: 'available', holderId: player, asOfWeek: state.market.tick, total: 0, items: [] })
  })

  it('values a migration-origin player library (routeL6240: twelve pre-origin films) from its released results', () => {
    const state = liveFromGenuine('routeL6240')
    const { player } = studioIds(state)
    const result = valuation.libraryValuationV1(state, player, state.market.tick)
    expect(result.kind).toBe('available')
    if (result.kind !== 'available') return
    const films = state.studio.releasedFilms
    const r2 = films.reduce((s, f) => s + r2Value(f.criticScore), 0)
    const byConcept = new Map<string, number>()
    for (const f of films) byConcept.set(f.conceptId, Math.max(byConcept.get(f.conceptId) ?? 0, f.criticScore))
    const r1 = [...byConcept.values()].reduce((s, m) => s + r1Value(m), 0)
    expect(result.total).toBe(r1 + r2)
    expect(result.items.filter((i) => i.subject.right === 'R1').length).toBe(byConcept.size)
    expect(result.items.filter((i) => i.subject.right === 'R2').length).toBe(films.length)
  })
})

describe('P16A valuation: rounding and the consumer-only score boundary', () => {
  function withScore(state: GameState, filmId: string, score: number): GameState {
    const next = detached(state)
    const film = next.hollywood!.films.find((f) => f.filmId === filmId)!
    if (film.provenance === 'simulation/v1') film.result.criticScore = score
    else film.criticScore = score
    return next
  }

  it('rounds each item once: scores 0, 100, 12.3456 and 0.0005 value exactly 0, 100000, 12346 and 1', () => {
    const base = liveFromGenuine('week53')
    const { r01 } = studioIds(base)
    const live = filmsOf(base).filter((f) => f.studioId === r01 && f.releasedAt.kind === 'campaign')
    expect(live.length).toBeGreaterThanOrEqual(4)
    let state = base
    const scores = [0, 100, 12.3456, 0.0005]
    for (const [i, score] of scores.entries()) state = withScore(state, live[i]!.filmId, score)
    const result = valuation.libraryValuationV1(state, r01, state.market.tick)
    expect(result.kind).toBe('available')
    if (result.kind !== 'available') return
    const values = live.slice(0, 4).map((f) => result.items.find((i) => i.subject.right === 'R2' && i.subject.filmId === f.filmId)!.value)
    expect(values).toEqual([0, 100000, 12346, 1])
    expect(result.total).toBe(expectedTotal(state, r01, state.market.tick).total)
  })

  it('a finite score outside [0,100] returns typed unavailable naming the FilmId, with no clamp, skip, partial total, or state mutation, and title resolution still works', () => {
    const base = liveFromGenuine('week53')
    const { r01 } = studioIds(base)
    const film = filmsOf(base).find((f) => f.studioId === r01 && f.releasedAt.kind === 'campaign')!
    for (const bad of [100.0001, -0.5, 101, 1e9]) {
      const state = withScore(base, film.filmId, bad)
      const before = stableStringify(state)
      const result = valuation.libraryValuationV1(state, r01, state.market.tick)
      expect(result).toEqual({ kind: 'unavailable', reason: 'criticScoreOutsideValuationRange', filmId: film.filmId })
      expect(stableStringify(state)).toBe(before)
      // The subject still resolves: title and creator provenance are not lost.
      expect(rights.currentHolder(state, { right: 'R2', filmId: film.filmId }, state.market.tick)).toEqual({ kind: 'holder', holderId: r01, tradeable: true, archived: false })
      expect(rights.resolveTitles(state).filmTitles.some((t) => t.filmId === film.filmId)).toBe(true)
    }
    // A non-finite score is refused the same way (never priced as zero).
    expect(valuation.libraryValuationV1(withScore(base, film.filmId, Number.NaN), r01, base.market.tick))
      .toEqual({ kind: 'unavailable', reason: 'criticScoreOutsideValuationRange', filmId: film.filmId })
    // An as-of read dated before that film existed is unaffected: the bad score is not in the fold.
    const earlier = valuation.libraryValuationV1(withScore(base, film.filmId, 101), r01, (film.releasedAt as { week: number }).week - 1)
    expect(earlier.kind).toBe('available')
  })

  it('the same refusal applies when the film would enter an R1 maxQualityThroughDate for a property whose R2 holder differs', () => {
    const base = liveFromGenuine('week53')
    const { r01, r02 } = studioIds(base)
    const film = filmsOf(base).find((f) => f.studioId === r01 && f.releasedAt.kind === 'campaign')!
    // Materialize the film's title, then record a structurally valid R2 sale r01 -> r02 at the film's release week.
    const sold = rights.recordTitleEventForTest(
      rights.materializeLegacyTitles(withScore(base, film.filmId, 101), { right: 'R2', filmId: film.filmId }),
      { subject: { right: 'R2', filmId: film.filmId }, priorHolder: r01, newHolder: r02, cause: 'sale',
        date: { kind: 'campaign', week: (film.releasedAt as { week: number }).week }, source: { kind: 'test', ref: 'p16a-valuation' } })
    // r02 now holds the film: pricing it refuses on the score.
    expect(valuation.libraryValuationV1(sold, r02, sold.market.tick)).toEqual({ kind: 'unavailable', reason: 'criticScoreOutsideValuationRange', filmId: film.filmId })
    // r01 still holds the PROPERTY, whose option premium would read that score: refused too, with the same FilmId.
    expect(valuation.libraryValuationV1(sold, r01, sold.market.tick)).toEqual({ kind: 'unavailable', reason: 'criticScoreOutsideValuationRange', filmId: film.filmId })
  })

  it('CONTRACT GAP (P16A): at this base a Save45 predecessor cannot carry a finite out-of-range score once a quarter counts the film; the P16 era adds no new admission gate, and the valuation boundary is proven on the lifted state', () => {
    // P16A r3 A1/A2 assume "a genuine predecessor-valid save containing finite criticScore outside
    // [0,100]". The frozen FILM leaf (v8FilmResult -> v8Number) indeed bounds nothing, but Save45's
    // own `validatePowerRankingArchive` (P15A.2) refuses "critic score is outside 0..100" for a film
    // in a recorded quarter. The narrowest lawful reading: P16 preserves that predecessor law exactly
    // (no new gate, no loosening), and proves its own consumer boundary on the lifted state.
    const envelope = genuineV45Envelope('week53') as { saveVersion: number; state: GameState }
    const h = envelope.state.hollywood!
    const film = h.films.find((f) => f.provenance === 'simulation/v1')!
    if (film.provenance !== 'simulation/v1') return
    film.result.criticScore = 100.5
    for (const event of h.careerEvents) if (event.filmId === film.filmId) event.criticScore = 100.5
    const raw = stableStringify(envelope)
    expect(() => validateSaveV45(JSON.parse(raw))).toThrow(/power ranking: film .* critic score is outside 0\.\.100/)
    expect(() => migrateToLive(importSave(raw))).toThrow(/power ranking: film .* critic score is outside 0\.\.100/)
    // The genuine in-range capture lifts losslessly (proved in p16a-save-v46); its lifted state with the
    // score altered in memory keeps title and creator provenance and refuses only valuation.
    const state = liveFromGenuine('week53')
    const altered = withScore(state, film.filmId, 100.5)
    expect(valuation.libraryValuationV1(altered, film.studioId, altered.market.tick)).toEqual({ kind: 'unavailable', reason: 'criticScoreOutsideValuationRange', filmId: film.filmId })
    expect(rights.currentHolder(altered, { right: 'R2', filmId: film.filmId }, altered.market.tick)).toEqual({ kind: 'holder', holderId: film.studioId, tradeable: true, archived: false })
    expect(rights.resolveTitles(altered).filmTitles.find((t) => t.filmId === film.filmId)!.title).toBe(film.title)
    // Normal [0,100] holders are unaffected, and the P16 save boundary adds no score gate of its own:
    // the lifted in-range state saves and reloads at 46.
    const other = h.identities.slice(1, 5).map((i) => i.studioId).find((id) => id !== film.studioId)!
    expect(valuation.libraryValuationV1(altered, other, altered.market.tick).kind).toBe('available')
    expect(migrateToLive(importSave(stableStringify(makeSave(state)))).saveVersion).toBe(46)
  })
})

describe('P16A valuation: pure, cashless, and identical before/after materialization and reload', () => {
  it('valuation changes no cash, ledger, RNG or root, and an exact materialization of virtual titles changes no result', () => {
    const state = liveFromGenuine('week53')
    const { r01 } = studioIds(state)
    const before = stableStringify(state)
    const first = valuation.libraryValuationV1(state, r01, state.market.tick)
    expect(stableStringify(state)).toBe(before)
    expect(state.rights.properties).toEqual([])
    const film = filmsOf(state).find((f) => f.studioId === r01 && f.releasedAt.kind === 'campaign')!
    let materialized = rights.materializeLegacyTitles(state, { right: 'R2', filmId: film.filmId })
    materialized = rights.materializeLegacyTitles(materialized, { right: 'R1', propertyId: rights.storyPropertyId(film.conceptId) })
    expect(materialized.rights.filmTitles.map((t) => t.filmId)).toEqual([film.filmId])
    expect(materialized.rights.properties.map((p) => p.propertyId)).toEqual([rights.storyPropertyId(film.conceptId)])
    expect(materialized.rights.titleEvents.filter((e) => e.cause === 'genesis')).toHaveLength(2)
    expect(materialized.studio.cash).toBe(state.studio.cash)
    expect(materialized.ledger).toEqual(state.ledger)
    expect(materialized.rngState).toBe(state.rngState)
    const after = valuation.libraryValuationV1(materialized, r01, materialized.market.tick)
    expect(stableStringify(after)).toBe(stableStringify(first))
    // A second materialization of the same subject is a policy no-op: same bytes, no new id.
    expect(stableStringify(rights.materializeLegacyTitles(materialized, { right: 'R2', filmId: film.filmId }))).toBe(stableStringify(materialized))
    // Save/reload at the live era preserves both the records and the read.
    const reloaded = migrateToLive(importSave(stableStringify(makeSave(materialized)))).state as GameState
    expect(stableStringify(valuation.libraryValuationV1(reloaded, r01, reloaded.market.tick))).toBe(stableStringify(first))
    expect(stableStringify(reloaded.rights)).toBe(stableStringify(materialized.rights))
  })

  it('a later structurally valid title-sale event moves the R2 value to the new holder from its date, while R1 stays with the creator', () => {
    const base = liveFromGenuine('week53')
    const { r01, r02 } = studioIds(base)
    const film = filmsOf(base).find((f) => f.studioId === r01 && f.releasedAt.kind === 'campaign')!
    const saleWeek = (film.releasedAt as { week: number }).week + 5
    expect(saleWeek).toBeLessThanOrEqual(base.market.tick)
    const sold = rights.recordTitleEventForTest(rights.materializeLegacyTitles(base, { right: 'R2', filmId: film.filmId }),
      { subject: { right: 'R2', filmId: film.filmId }, priorHolder: r01, newHolder: r02, cause: 'sale',
        date: { kind: 'campaign', week: saleWeek }, source: { kind: 'test', ref: 'p16a-valuation' } })
    const value = r2Value(film.score)
    const r01Before = valuation.libraryValuationV1(sold, r01, saleWeek - 1)
    const r01At = valuation.libraryValuationV1(sold, r01, saleWeek)
    const r02Before = valuation.libraryValuationV1(sold, r02, saleWeek - 1)
    const r02At = valuation.libraryValuationV1(sold, r02, saleWeek)
    for (const r of [r01Before, r01At, r02Before, r02At]) expect(r.kind).toBe('available')
    if (r01Before.kind !== 'available' || r01At.kind !== 'available' || r02Before.kind !== 'available' || r02At.kind !== 'available') return
    expect(r01Before.total - r01At.total).toBe(value)
    expect(r02At.total - r02Before.total).toBe(value)
    expect(r01At.items.some((i) => i.subject.right === 'R1' && i.subject.propertyId === rights.storyPropertyId(film.conceptId))).toBe(true)
    expect(r02At.items.some((i) => i.subject.right === 'R1')).toBe(r02Before.items.some((i) => i.subject.right === 'R1'))
    expect(rights.currentHolder(sold, { right: 'R2', filmId: film.filmId }, saleWeek)).toEqual({ kind: 'holder', holderId: r02, tradeable: true, archived: false })
    expect(rights.currentHolder(sold, { right: 'R2', filmId: film.filmId }, saleWeek - 1)).toEqual({ kind: 'holder', holderId: r01, tradeable: true, archived: false })
  })
})
