// Proposed installation: tests/bridge-p15a2-power-ranking.test.ts, adopted1356-A §8 items18–27.
// A-only RED draft, never run. Missing view/internal seam is named prerequisite, never missing module collection.
import { describe, expect, it } from 'vitest'
import { BRIDGE_SCHEMA, PROTOCOL_VERSION, SCHEMA_ID, validateIndustry } from '../bridge/protocol.js'
import { parseWireValue } from '../bridge/schema/runtime.js'
import { INDUSTRY_LANES } from '../bridge/schema/industry-schema.js'
import { BridgeSession, authoritativeDigest } from '../bridge/session.js'
import * as industryModule from '../bridge/industry.js'
import { campaignDate } from '../src/core/calendar.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import { generateWorld } from '../src/core/worldgen.js'
import { makeSave } from '../src/core/save.js'
import { powerRankingInput } from '../src/core/powerRankingArchive.js'
import * as rankingLaw from '../src/core/powerRanking.js'
import type { GameState, PowerRankingRecord, PowerRankingRecordRow } from '../src/core/types.js'
import { accepted45 } from './helpers/1368-recovery-witnesses.js'
import { base, canon, closureOf, drainRival, R02, recordOf, ticksTo } from './helpers/p15b-live.js'

type Movement = 'new' | 'unavailable' | 'up' | 'down' | 'unchanged'
type RankRow = {
  studioId: string; name: string; player: boolean; ranked: boolean; rank: number | null; rankLabel: string
  priorRank: number | null; movement: Movement; movementLabel: string; filmsTenths: number
  films: { filmId: string; title: string; criticScore: number; scoreTenths: number }[]; filmsLine: string | null
  releases: number; releasesTenths: number; pointsTenths: number; pointsLabel: string
  honors: 'notRecorded'; band: string; bandLabel: string; distressStage: string
}
type RankPage = {
  snapshotId: string; priorSnapshotId: string | null; week: number; dateLabel: string
  definitionVersion: string; windowLabel: string; available: boolean; availabilityLine: string | null
  firstRankedLabel: string | null; recordingNotice: string | null; rankedCount: number; cohortCount: number; rows: RankRow[]
}
type Wire = { type: 'industryPage'; powerRanking: RankPage | null; notice: string; stateDigest: string
  stateRevision: number; page: number; pageSize: number; pageCount: number; totalRows: number; studios: unknown[] }
const banner = 'Power Ranking is recent comparative momentum. Studio Standing and Studio History are separate.'
const unavailable = 'Not enough comparable history for a Power Ranking.'
const bandLabels: Record<string, string> = { inTheRed: 'In the red', strained: 'Strained', stable: 'Stable', thriving: 'Thriving' }
function admitted(state: GameState, label: string) {
  const before = canon(state); expect(() => makeSave(state), label).not.toThrow(); expect(canon(state)).toBe(before)
}
let cachedRoute: Map<number, GameState> | null = null
function route() {
  if (cachedRoute === null) {
    const origin = base(); admitted(origin, 'admit genuine migrated130 before first tick')
    const at136 = ticksTo(origin, 136).get(136)!; admitted(at136, 'admit real136 before accounting drain')
    const business = at136.hollywood!.businesses.find(b => b.studioId === R02)!
    const prepared = drainRival(at136, R02, Math.ceil(business.account.cash) + 10_000_000)
    admitted(prepared, 'admit constructed accounting input BEFORE closure ticks')
    cachedRoute = ticksTo(prepared, 182)
    for (const week of [143, 156, 169, 182]) admitted(cachedRoute.get(week)!, `admit actual${week}`)
    expect(closureOf(cachedRoute.get(169)!, R02)?.closureWeek).toBe(169)
  }
  return cachedRoute
}
function archived(state: GameState, week: number) {
  const record = state.powerRanking.snapshots.find(r => r.week === week)
  expect(record, `real archive must contain quarter${week}`).toBeDefined()
  if (!record) throw new Error(`PREREQUISITE: no actual quarter${week}`)
  return record
}
function request(session: BridgeSession, extra: Record<string, unknown> = {}) {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
    requestId: 'ranking-read', expectedStateRevision: session.stateRevision, type: 'industryQuery',
    view: 'powerRanking', targetId: null, page: 0, pageSize: 50, lane: 'industryPrestige', period: 'all', ...extra }
}
function ask(session: BridgeSession, extra: Record<string, unknown> = {}) {
  const checked = validateIndustry(request(session, extra))
  expect(checked.ok, `PREREQUISITE RED: canonical powerRanking query unavailable: ${JSON.stringify(checked)}`).toBe(true)
  if (!checked.ok) throw new Error('PREREQUISITE RED: view not admitted; later viewer assertions NOT reached')
  return session.industry(checked.request)
}
function page(session: BridgeSession, extra: Record<string, unknown> = {}): Wire {
  const out = ask(session, extra)
  expect('type' in out ? out.type : null, `PREREQUISITE RED: real ranking dispatch failed: ${JSON.stringify(out)}`).toBe('industryPage')
  if (!('type' in out) || out.type !== 'industryPage') throw new Error('PREREQUISITE RED: ranking dispatch missing; later assertions NOT reached')
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, out)).toEqual(out)
  return out as unknown as Wire
}
function requireRanking(wire: Wire): RankPage {
  expect(wire.powerRanking, 'PREREQUISITE RED: mandated nullable section must contain selected real record').not.toBeNull()
  expect(wire.powerRanking).toBeDefined()
  if (!wire.powerRanking) throw new Error('PREREQUISITE RED: no ranking page; later row assertions NOT reached')
  return wire.powerRanking
}
function whole(session: BridgeSession) { return { state: canon(session.gameState), revision: session.stateRevision } }

// Comparator fixtures ONLY: no campaign/save authority, no fake history, no tick or save admission.
function comparatorRow(studioId: string, rank: number | null): PowerRankingRecordRow {
  return { studioId, rank, ranked: rank !== null, filmsTenths: 0, releases: 0,
    releasesTenths: 0, countedFilmIds: [], band: 'stable' }
}
function comparatorRecord(week: number, rows: PowerRankingRecordRow[], definitionVersion: PowerRankingRecord['definitionVersion'] = 'power-ranking/v1'): PowerRankingRecord {
  return { id: `comparator-quarter-${week}`, week, rows, definitionVersion, available: true, windowStartWeek: week - 52,
    p15DomainSequence: 0, phaseId: 'p15a2.rankingRecord', phaseOrdinal: 2, phaseOrderVersion: 2 }
}
function movement(record: PowerRankingRecord, prior: PowerRankingRecord | null, studioId = 'unit-a') {
  // Parent-approved internal pure seam; no new wire API. Runtime lookup avoids named-import collection failure.
  const api = industryModule as unknown as { powerRankingMovement?: (current: PowerRankingRecord, previous: PowerRankingRecord | null, id: string) => { priorRank: number | null; movement: Movement } }
  expect(typeof api.powerRankingMovement, 'PREREQUISITE RED: internal archive comparator not exported').toBe('function')
  if (!api.powerRankingMovement) throw new Error('PREREQUISITE RED: comparator unavailable; branch assertions NOT reached')
  const before = canon({ record, prior }); const result = api.powerRankingMovement(record, prior, studioId)
  expect(canon({ record, prior })).toBe(before); return result
}

describe('Power Ranking Bridge actual wire: C12/C13, adopted1356-A slice2b', () => {
  it('rank-view-routes: real latest/archive IDs, row paging, exact unknown refusal and pure detached output', () => {
    const state = route().get(182)!, session = new BridgeSession(state, 'rank-routes'), before = whole(session)
    const latestWire = page(session), latest = requireRanking(latestWire)
    expect(latest).toMatchObject({ week: 182, snapshotId: archived(state, 182).id, definitionVersion: 'power-ranking/v2' })
    const old = requireRanking(page(session, { targetId: 'power-ranking-169' }))
    expect(old.week).toBe(169); expect(old.snapshotId).toBe(archived(state, 169).id)
    const first = page(session, { pageSize: 1 }), second = page(session, { pageSize: 1, page: 1 })
    expect(requireRanking(first).rows).toHaveLength(1); expect(requireRanking(second).rows).toHaveLength(1)
    expect(first.totalRows).toBe(latest.cohortCount); expect(first.pageCount).toBe(latest.cohortCount)
    expect(requireRanking(first).rows[0]!.studioId).toBe(latest.rows[0]!.studioId)
    expect(requireRanking(second).rows[0]!.studioId).toBe(latest.rows[1]!.studioId)
    const invalid = ask(session, { targetId: 'power-ranking-170' })
    expect(invalid).toMatchObject({ accepted: false, reasonCode: 'INVALID_CONTROL', message: 'That Power Ranking quarter is not in this record.' })
    expect(ask(session, { page: first.pageCount, pageSize: 1 })).toMatchObject({ accepted: false, reasonCode: 'INVALID_CONTROL' })
    latest.rows[0]!.name = 'consumer mutation'
    expect(requireRanking(page(session)).rows.some(r => r.name === 'consumer mutation')).toBe(false)
    expect(whole(session)).toEqual(before); expect(latestWire.stateDigest).toBe(authoritativeDigest(state))
  })

  it('rank-projection-schema: adopted view/nullable section and existing 1–50 query cap', () => {
    const session = new BridgeSession(route().get(182)!, 'rank-schema')
    page(session) // real view/response prerequisite, not merely handbuilt schema fixture
    for (const pageSize of [1, 50]) expect(validateIndustry(request(session, { pageSize })).ok).toBe(true)
    for (const pageSize of [0, 51, 1.5]) expect(validateIndustry(request(session, { pageSize })).ok).toBe(false)
    for (const badPage of [-1, 0.5]) expect(validateIndustry(request(session, { page: badPage })).ok).toBe(false)
    const other = page(session, { view: 'studios' })
    expect(other.powerRanking).toBeNull()
    const valid = page(session), ranking = requireRanking(valid)
    const badResponse = { ...valid, powerRanking: { ...ranking, rows: ranking.rows.map((r, i) => i === 0 ? { ...r, honors: 'invented-awards' } : r) } }
    expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, badResponse)).toThrow()
    const badStage = { ...valid, powerRanking: { ...ranking, rows: ranking.rows.map((r, i) => i === 0 ? { ...r, distressStage: 'private-countdown' } : r) } }
    expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, badStage)).toThrow()
  })

  it('rank-view-empty and unavailable13: honest first quarter, no ranks, banner/window/first-ranked copy', () => {
    const origin = initializeHollywood(generateWorld('p15a2-bridge-empty-13'), 'fresh')
    admitted(origin, 'admit public fresh-industry genesis before13 ordinary ticks')
    expect(origin.powerRanking.snapshots).toEqual([])
    const empty = page(new BridgeSession(origin, 'rank-empty'))
    expect(empty.powerRanking).toBeNull(); expect(empty.notice).toContain(unavailable)
    expect(empty.notice).toContain(campaignDate(13).label)
    const state = ticksTo(origin, 13).get(13)!; admitted(state, 'admit actual unavailable13 record')
    const wire = page(new BridgeSession(state, 'rank-13')), shown = requireRanking(wire)
    expect(wire.notice).toBe(banner)
    expect(shown).toMatchObject({ week: 13, available: false, availabilityLine: unavailable, rankedCount: 0 })
    expect(shown.windowLabel).toBe(`${campaignDate(0).label} to ${campaignDate(12).label}`)
    expect(shown.firstRankedLabel).toContain(campaignDate(52).label)
    expect(shown.rows.every(r => !r.ranked && r.rank === null && r.priorRank === null && r.movement === 'unavailable')).toBe(true)
    expect(shown.rows.every(r => r.movementLabel === 'No comparable prior cohort')).toBe(true)
  })

  it('rank-view-closure: actual169 inclusion/182 exclusion, frozen historical page and cross-definition movement', () => {
    const state169 = route().get(169)!, state182 = route().get(182)!
    const before = page(new BridgeSession(state169, 'rank-before'), { targetId: 'power-ranking-169' })
    const session = new BridgeSession(state182, 'rank-after')
    const historical = requireRanking(page(session, { targetId: 'power-ranking-169' }))
    const current = requireRanking(page(session))
    expect(historical.definitionVersion).toBe('power-ranking/v1'); expect(historical.rows.some(r => r.studioId === R02)).toBe(true)
    expect(current.definitionVersion).toBe('power-ranking/v2'); expect(current.rows.some(r => r.studioId === R02)).toBe(false)
    expect(current.priorSnapshotId).toBe(archived(state182, 169).id)
    expect(current.rows.every(r => r.movement === 'unavailable' && r.priorRank === null)).toBe(true)
    expect(current.rows.every(r => r.movementLabel === 'No comparable prior cohort')).toBe(true)
    expect(historical).toEqual(requireRanking(before)) // same recorded169 page after actual closure
    expect(canon(archived(state182, 169))).toBe(canon(archived(state169, 169)))
  })

  it('rank-view-archived-stage-band: stage at selected quarter and recorded band, no private finance', () => {
    const state = route().get(182)!, session = new BridgeSession(state, 'rank-privacy'), before = whole(session)
    const wire = page(session, { targetId: 'power-ranking-156' }), shown = requireRanking(wire), source = archived(state, 156)
    expect(recordOf(state, R02)?.condition.stage).toBe('closed')
    expect(recordOf(route().get(156)!, R02)?.condition.stage).toBe('distress')
    expect(shown.rows.find(r => r.studioId === R02)?.distressStage).toBe('distress')
    for (const row of shown.rows) {
      const stored = source.rows.find(r => r.studioId === row.studioId)!
      expect(row.band).toBe(stored.band); expect(row.bandLabel).toBe(bandLabels[stored.band]); expect(row.honors).toBe('notRecorded')
      expect(['notRecorded', 'stable', 'warning', 'distress', 'recovery', 'closed']).toContain(row.distressStage)
    }
    const json = JSON.stringify(wire)
    for (const field of ['cash', 'account', 'weeklyFixedCost', 'weeksOfCover', 'cover', 'closureWeek', 'sinceWeek', 'totalGross', 'openingGross']) expect(json).not.toContain(`"${field}"`)
    expect(whole(session)).toEqual(before)
  })

  it('rank-view-not-recorded: genuine precondition-history quarter has no backfilled stage', () => {
    const state = accepted45('research').current.state
    admitted(state, 'admit accepted actual267 historical research capture and public current migration')
    const record = state.powerRanking.snapshots.at(-1)
    expect(record, 'accepted capture needs actual older quarterly archive').toBeDefined()
    if (!record) throw new Error('PREREQUISITE: accepted267 contains no historical Ranking record')
    expect(record.week).toBeLessThan(state.corporateCondition.recordedFromWeek)
    expect(state.corporateCondition.events).toEqual([])
    const shown = requireRanking(page(new BridgeSession(state, 'rank-no-backfill'), { targetId: `power-ranking-${record.week}` }))
    expect(shown.rows.length).toBeGreaterThan(0)
    expect(shown.rows.every(r => r.distressStage === 'notRecorded' && r.honors === 'notRecorded')).toBe(true)
    expect(shown.rows.map(r => r.band)).toEqual(record.rows.map(r => r.band))
  })

  it('rank-view-copy/film-explain: real record rows, no-finished sentence and actual creator film score', () => {
    const state = route().get(156)!, session = new BridgeSession(state, 'rank-copy'), wire = page(session), shown = requireRanking(wire), source = archived(state, 156)
    expect(wire.notice).toBe(banner); expect(shown.dateLabel).toBe(campaignDate(156).label)
    expect(shown.windowLabel).toBe(`${campaignDate(source.windowStartWeek).label} to ${campaignDate(155).label}`)
    expect(shown.recordingNotice).toBe(`Power Ranking recording begins ${campaignDate(state.powerRanking.snapshots[0]!.week).label}. Earlier quarters are not reconstructed.`)
    expect(shown.rows.map(r => r.studioId)).toEqual(source.rows.map(r => r.studioId))
    expect(shown.rows.some(r => r.films.length === 0), 'real empty-counted-film premise').toBe(true)
    const facts = powerRankingInput(state), prior = archived(state, 143)
    expect(prior.definitionVersion).toBe(source.definitionVersion)
    expect(prior.rows.filter(r => r.ranked).map(r => r.studioId).sort()).toEqual(source.rows.filter(r => r.ranked).map(r => r.studioId).sort())
    expect(shown.priorSnapshotId).toBe(prior.id)
    for (const row of shown.rows) {
      expect({ priorRank: row.priorRank, movement: row.movement }).toEqual(movement(source, prior, row.studioId))
      const expectedMovementLabel = row.movement === 'new' ? 'New to this comparison'
        : row.movement === 'unavailable' ? 'No comparable prior cohort'
        : row.movement === 'unchanged' ? 'No rank change'
        : `${row.movement === 'up' ? 'Up' : 'Down'} ${Math.abs(row.rank! - row.priorRank!)} since ${campaignDate(prior.week).label}`
      expect(row.movementLabel).toBe(expectedMovementLabel)
      const stored = source.rows.find(r => r.studioId === row.studioId)!
      expect(row).toMatchObject({ ranked: stored.ranked, rank: stored.rank, filmsTenths: stored.filmsTenths,
        releases: stored.releases, releasesTenths: stored.releasesTenths, pointsTenths: stored.filmsTenths + stored.releasesTenths })
      if (row.ranked) expect(row.rankLabel).toBe(`#${row.rank} of ${shown.rankedCount} ranked`)
      expect(row.pointsLabel).toBe(`${(row.pointsTenths / 10).toFixed(1)} of 20 · 2 of 3 lanes recorded (Honors not recorded)`)
      expect(row.films.map(f => f.filmId)).toEqual(stored.countedFilmIds)
      expect(row.filmsLine).toBe(stored.countedFilmIds.length === 0 ? 'No finished release in the window.' : null)
      for (const film of row.films) {
        const actual = facts.films.find(f => f.filmId === film.filmId)!
        expect(actual).toBeDefined(); expect(actual.studioId).toBe(row.studioId)
        const rivalTitle = state.hollywood!.films.find(f => f.filmId === film.filmId && f.studioId === row.studioId)?.title
        const playerRelease = state.studio.releasedFilms.find(f => f.productionId === film.filmId)
        const playerTitle = playerRelease ? state.concepts.find(c => c.id === playerRelease.conceptId)?.title : undefined
        const retainedTitle = row.player ? playerTitle : rivalTitle
        expect(retainedTitle, 'actual counted film needs its retained title source').toBeDefined()
        expect(film.title).toBe(retainedTitle)
        expect(actual.releaseTick).toBeGreaterThanOrEqual(source.windowStartWeek); expect(actual.releaseTick).toBeLessThan(156)
        expect(actual.runEndedByWeek).toBe(true); expect(actual.authoredPreCampaign).toBe(false)
        const api = rankingLaw as unknown as { filmScoreTenths?: (film: typeof actual, base: number) => number }
        expect(typeof api.filmScoreTenths, 'PREREQUISITE RED: adopted1356-A shared filmScoreTenths export absent').toBe('function')
        if (!api.filmScoreTenths) throw new Error('PREREQUISITE RED: film explanation score owner not exported')
        expect(film.scoreTenths).toBe(api.filmScoreTenths(actual, state.market.baseMarketValue)); expect(film.criticScore).toBe(actual.criticScore)
      }
    }
    expect(shown.rows.some(r => r.films.length > 0), 'real film-explanation premise must be nonempty').toBe(true)
  })

  it('rank-view-industry-unchanged: Studio Charts unchanged except adopted notice and nullable rank section', () => {
    const state = route().get(156)!, session = new BridgeSession(state, 'rank-charts'), before = whole(session)
    const wire = page(session, { view: 'studios' })
    const chart = state.hollywood!.chart!
    expect(chart, 'real Studio Charts control source must exist').toBeDefined()
    const studios = wire.studios as { studioId: string; lanes: { key: string; value: number; rank: number }[] }[]
    expect(studios.map(r => r.studioId).sort()).toEqual(state.hollywood!.identities.filter(r => r.enteredWeek !== null).map(r => r.studioId).sort())
    expect([...INDUSTRY_LANES]).toEqual(['audienceAwareness', 'industryPrestige', 'commercialConfidence', 'output'])
    for (const studio of studios) {
      expect(studio.lanes.map(lane => lane.key).sort(), 'complete Studio Charts lane membership BEFORE per-lane values').toEqual([...INDUSTRY_LANES].sort())
      const fact = chart.rows.find(r => r.studioId === studio.studioId)!
      expect(fact).toBeDefined()
      for (const lane of studio.lanes) {
        const value = (r: typeof fact) => lane.key === 'output' ? r.output : r.standing[lane.key as keyof typeof r.standing]
        expect(lane.value).toBe(value(fact))
        expect(lane.rank).toBe(1 + chart.rows.filter(r => value(r) > value(fact)).length)
      }
    }
    expect(wire.notice).toBe('Public facts only. Standing channels and film measures have separate meanings. The quarterly Power Ranking is a separate comparison.')
    expect(wire.powerRanking).toBeNull(); expect(whole(session)).toEqual(before)
  })
})

describe('Power Ranking comparator units: constructed source-independent records, no campaign reachability claim', () => {
  const current = () => comparatorRecord(78, [comparatorRow('unit-a', 1), comparatorRow('unit-b', 1), comparatorRow('unit-c', 3)])
  it('rank-view-movement: identical ranked cohort preserves competition ties1–1–3 and normal movement', () => {
    const now = current(), same = comparatorRecord(65, [...now.rows].map(r => ({ ...r })))
    for (const id of ['unit-a', 'unit-b', 'unit-c']) expect(movement(now, same, id)).toEqual({ priorRank: now.rows.find(r => r.studioId === id)!.rank, movement: 'unchanged' })
    const changed = comparatorRecord(65, [comparatorRow('unit-a', 3), comparatorRow('unit-b', 1), comparatorRow('unit-c', 1)])
    expect(movement(now, changed)).toEqual({ priorRank: 3, movement: 'up' })
    expect(movement(now, changed, 'unit-c')).toEqual({ priorRank: 1, movement: 'down' })
  })
  it('cross-definition is unavailable even with identical ranked cohort', () => {
    const now = { ...current(), definitionVersion: 'power-ranking/v2' as const }, prior = comparatorRecord(65, now.rows.map(r => ({ ...r })))
    expect(movement(now, prior)).toEqual({ priorRank: null, movement: 'unavailable' })
  })
  it('absent prior, wrong W−13, current unranked and truly absent prior row are unavailable', () => {
    const now = current()
    expect(movement(now, null)).toEqual({ priorRank: null, movement: 'unavailable' })
    expect(movement(now, comparatorRecord(52, now.rows))).toEqual({ priorRank: null, movement: 'unavailable' })
    const unranked = comparatorRecord(78, [comparatorRow('unit-a', null), comparatorRow('unit-b', 1)])
    expect(movement(unranked, comparatorRecord(65, [comparatorRow('unit-a', 1), comparatorRow('unit-b', 2)]))).toEqual({ priorRank: null, movement: 'unavailable' })
    expect(movement(now, comparatorRecord(65, now.rows.filter(r => r.studioId !== 'unit-a')))).toEqual({ priorRank: null, movement: 'unavailable' })
  })
  it('existing prior-unranked row is new BEFORE differing-ranked-cohort rule; other cohort changes unavailable', () => {
    const now = current(), priorUnranked = comparatorRecord(65, [comparatorRow('unit-a', null), comparatorRow('unit-b', 1), comparatorRow('unit-c', 2)])
    expect(movement(now, priorUnranked)).toEqual({ priorRank: null, movement: 'new' })
    const otherCohort = comparatorRecord(65, [comparatorRow('unit-a', 1), comparatorRow('unit-b', 2), comparatorRow('unit-d', 3)])
    expect(movement(now, otherCohort)).toEqual({ priorRank: null, movement: 'unavailable' })
    expect(movement(now, comparatorRecord(65, [comparatorRow('unit-a', null)], 'power-ranking/v2'))).toEqual({ priorRank: null, movement: 'unavailable' })
  })
})
