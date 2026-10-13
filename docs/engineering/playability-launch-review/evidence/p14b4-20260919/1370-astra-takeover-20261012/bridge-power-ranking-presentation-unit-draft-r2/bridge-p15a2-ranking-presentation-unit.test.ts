// NONCAMPAIGN viewer fixtures only. Never tick/save/export/commit constructed inputs.
import { describe, expect, it, vi } from 'vitest'
import { industryPage } from '../bridge/industry.js'
import { BRIDGE_SCHEMA, PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.js'
import { parseWireValue } from '../bridge/schema/runtime.js'
import type { IndustryQuery } from '../bridge/schema/industry-schema.js'
import { makeSave, stableStringify } from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
import { campaignDate } from '../src/core/calendar.js'
import { accepted45 } from './helpers/1368-recovery-witnesses.js'

// Test-local digest seam ONLY for explicit NONCAMPAIGN viewer fixtures.
// All projection/index/domain logic remains real; admitted context digest is computed first.
const viewerDigests = vi.hoisted(() => new WeakMap<object, string>())
vi.mock('../bridge/snapshot-build-context.ts', async importOriginal => {
  const actual = await importOriginal<typeof import('../bridge/snapshot-build-context.ts')>()
  return { ...actual, snapshotBuildContextFor: (state: GameState) => {
    const context = actual.snapshotBuildContextFor(state)
    const digest = viewerDigests.get(state)
    return digest === undefined ? context : { ...context, stateDigest: () => digest }
  } }
})
import { snapshotBuildContextFor } from '../bridge/snapshot-build-context.ts'

const canon = (value: unknown) => stableStringify(value)
function admittedContext(): GameState {
  const state = accepted45('research').current.state
  const before = canon(state)
  expect(() => makeSave(state), 'admit borrowed genuine267 context BEFORE viewer construction').not.toThrow()
  expect(canon(state)).toBe(before)
  snapshotBuildContextFor(state).stateDigest() // Real export/reader/digest BEFORE any construction.
  expect(canon(state)).toBe(before)
  return state
}
function query(): IndustryQuery {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: 'unit-viewer',
    requestId: 'unit-read', expectedStateRevision: 0, type: 'industryQuery', view: 'powerRanking',
    targetId: null, page: 0, pageSize: 50, lane: 'industryPrestige', period: 'all' }
}
function project(context: GameState, fixture: GameState) {
  const contextBefore = canon(context), fixtureBefore = canon(fixture)
  viewerDigests.set(fixture, snapshotBuildContextFor(context).stateDigest())
  const output = industryPage(fixture, 'unit-viewer', 0, query())
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, output)).toEqual(output)
  expect(canon(context)).toBe(contextBefore)
  expect(canon(fixture)).toBe(fixtureBefore)
  expect(output.powerRanking, 'actual projection must expose constructed selected row').not.toBeNull()
  const ranking = output.powerRanking!
  const retained = canon(ranking)
  ranking.rows[0]!.name = "consumer-only mutation"
  const reread = industryPage(fixture, "unit-viewer", 0, query())
  expect(canon(reread.powerRanking)).toBe(retained)
  expect(canon(context)).toBe(contextBefore)
  expect(canon(fixture)).toBe(fixtureBefore)
  return reread
}

describe('Power Ranking NONCAMPAIGN presentation units:1356-A166–170', () => {
  it('counted zero-score retained film is nonempty and does not display the empty-film sentence', () => {
    const context = admittedContext()
    const source = context.powerRanking.snapshots.at(-1)!
    expect(source, 'borrowed context needs real recorded quarter').toBeDefined()
    const row = source.rows.find(r => r.countedFilmIds.some(id => context.hollywood!.films.some(f =>
      f.filmId === id && f.studioId === r.studioId && f.provenance === 'simulation/v1' && f.settledWeek !== null)))
    expect(row, 'real retained counted finished rival film prerequisite').toBeDefined()
    if (!row) throw new Error('PREREQUISITE: no genuine retained counted finished rival film')
    const real = context.hollywood!.films.find(f => row.countedFilmIds.includes(f.filmId) &&
      f.studioId === row.studioId && f.provenance === 'simulation/v1' && f.settledWeek !== null)!
    const fixture = structuredClone(context) // Detached state-shaped READ MODEL; NOT campaign/save authority.
    const film = fixture.hollywood!.films.find(f => f.filmId === real.filmId)!
    if (film.provenance !== 'simulation/v1') throw new Error('PREREQUISITE: retained film provenance changed')
    film.result.criticScore = 0
    film.result.boxOffice.total = 0
    const run = fixture.hollywood!.businesses.find(b => b.studioId === row.studioId)!.runs.find(r => r.productionId === film.filmId)
    if (run) run.cumulativeGrossPaid = 0 // Actual Industry index prefers retained run total when present.
    fixture.powerRanking.snapshots = [{ ...structuredClone(source), rows: [
      { ...structuredClone(row), countedFilmIds: [real.filmId], filmsTenths: 0 },
      { ...structuredClone(row), studioId: fixture.hollywood!.playerStudioId, countedFilmIds: [], filmsTenths: 0 },
    ] }]
    const shown = project(context, fixture).powerRanking!
    const counted = shown.rows.find(r => r.studioId === row.studioId)!
    expect(counted.filmsTenths).toBe(0)
    expect(counted.films).toEqual([{ filmId: real.filmId, title: real.title, criticScore: 0, scoreTenths: 0 }])
    expect(counted.filmsLine).toBeNull()
    expect(shown.rows.find(r => r.studioId === fixture.hollywood!.playerStudioId)!.filmsLine).toBe('No finished release in the window.')
    expect(JSON.stringify(counted)).not.toContain('"totalGross"')
  })

  it('available unranked late143 entry displays Ranked from quarter195 with no comparable rank', () => {
    const context = admittedContext(), source = context.powerRanking.snapshots.at(-1)!
    expect(source, 'borrowed context needs real recorded quarter').toBeDefined()
    const row = source.rows.find(r => r.studioId !== context.hollywood!.playerStudioId)!
    expect(row, 'retained rival identity prerequisite').toBeDefined()
    const fixture = structuredClone(context) // NONCAMPAIGN: constructed late-entry viewer context only.
    fixture.hollywood!.identities.find(r => r.studioId === row.studioId)!.enteredWeek = 143
    fixture.powerRanking.snapshots = [{ ...structuredClone(source), week: 156, available: true, windowStartWeek: 104,
      rows: [{ ...structuredClone(row), ranked: false, rank: null, countedFilmIds: [], filmsTenths: 0 }] }]
    const shown = project(context, fixture).powerRanking!, displayed = shown.rows[0]!
    // Independent literal boundary: max(143, origin0)+52=195, already divisible by13.
    // Calendar owner is used only to format that independently chosen week, not to choose it.
    expect(fixture.hollywood!.originWeek).toBe(0)
    expect(shown.available).toBe(true)
    expect(shown.availabilityLine).toBeNull()
    expect(shown.firstRankedLabel).toBeNull()
    expect(displayed).toMatchObject({ ranked: false, rank: null, priorRank: null,
      movement: 'unavailable', movementLabel: 'No comparable prior cohort' })
    expect(displayed.rankLabel).toBe(`Ranked from ${campaignDate(195).label}`)
  })
})
