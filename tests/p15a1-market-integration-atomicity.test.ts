// ── P15A.1 Wave 2 RED r2 (records 1355-C, 1355-C2): all-or-none at the seam, and the factor at both sites ──
//
// Authority: 1355-F3 Blocking 1 (`market-second-subject-failure-commits-nothing`, annex K.1
// `market-second-p07-failure`): a week has two releases that both receive a factor; the first
// subject's reception succeeds and the second refuses inside the seam; tick() throws and the
// input state is byte-identical (serialized comparison, never toEqual). It runs once with the
// player as the failing subject and once with a rival. 1355-A §3.1 item 5 / §7 RED 5 (a batch
// that disagrees with the due set fails the week) and §3.2 (the factor reaches both release
// sites) are exercised here too, because all three need the same lever.
//
// THE LEVER, and why this is its own file: `vi.mock` wraps the REAL Wave 1 `assessBatch` and,
// only when a leaf asks, rewrites one output (a factor outside [0.75, 1], a dropped member, or
// every factor set to 1). The input states are validator-legal (a migrated-week root, the
// held-slate route); the rewritten output is what makes the seam or the witness refuse.
// A module mock is file-wide, so these leaves live apart from the main RED file.
//
// r2 (1355-F4 R3): a second pass-through mock wraps `resolveReception` and logs each release-site
// call (`competitionFactor` set) as it returns or throws. The two-subject leaves assert that the
// first subject's reception RETURNED `pressureFactor(1)` before the 0.5 call threw, so a writer who
// rejects the forced factor at step 2.5, before any reception, fails them: the partial-write point
// stays under test. Both seams require production to call `assessBatch` and `resolveReception`
// through their module exports from outside their own modules (1355-F4, declared).
//
// RED BY DESIGN against 1063ab4f: tick() never calls assessBatch today, so nothing refuses
// and no root exists; each leaf fails on its own requirement.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { pressureFactor } from '../src/core/sharedMarket.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import {
  canon, commitPictures, pairWeek, rowsAt, twinWeek, withEmptyMarketRoot,
} from './helpers/p15a1-market-route.js'

const control = vi.hoisted(() => ({
  force: null as null | { releaseId: string; factor: number },
  drop: null as null | string,
  all: null as null | number,
  receptions: [] as { factor: number; outcome: 'returned' | 'threw' }[],
}))

vi.mock('../src/core/sharedMarket.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/core/sharedMarket.js')>()
  return {
    ...actual,
    assessBatch: (...args: Parameters<typeof actual.assessBatch>) => actual.assessBatch(...args)
      .filter((row) => row.releaseId !== control.drop)
      .map((row) => (control.all !== null ? { ...row, factor: control.all }
        : row.releaseId === control.force?.releaseId ? { ...row, factor: control.force.factor } : row)),
  }
})

vi.mock('../src/core/reception.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/core/reception.js')>()
  return {
    ...actual,
    resolveReception: (...args: Parameters<typeof actual.resolveReception>) => {
      const factor = (args[0] as { competitionFactor?: number }).competitionFactor
      try {
        const result = actual.resolveReception(...args)
        if (factor !== undefined) control.receptions.push({ factor: result.competitionFactor, outcome: 'returned' })
        return result
      } catch (error) {
        if (factor !== undefined) control.receptions.push({ factor, outcome: 'threw' })
        throw error
      }
    },
  }
})

beforeEach(() => {
  control.force = null
  control.drop = null
  control.all = null
  control.receptions.length = 0
})

/** 1355-F4 R3: the refusal is the last release-site call, it carried the forced factor, and an
 * earlier call returned `pressureFactor(1)`: the first subject's reception completed first. */
function expectFirstSubjectReturned(): void {
  const calls = control.receptions
  const threw = calls.findIndex((call) => call.outcome === 'threw')
  expect(threw, 'a release-site reception refused').toBeGreaterThanOrEqual(0)
  expect(threw, 'the refusal ended the week').toBe(calls.length - 1)
  expect(calls[threw]!.factor, 'the refusing call carried the forced factor').toBe(OUT_OF_BOUNDS)
  expect(calls.slice(0, threw).some((call) => call.outcome === 'returned' && call.factor === pressureFactor(1)),
    'pressureFactor(1) returned before the refusal').toBe(true)
}

const MEDIUM = 300_000
/** Below 1 − SHARED_MARKET_FACTOR_MAX_PENALTY: the seam must refuse it (1355-A §3.2). */
const OUT_OF_BOUNDS = 0.5

function pairState(): { state: GameState; week: number; playerRelease: string; rivalRelease: string } {
  const pair = pairWeek()
  return {
    state: commitPictures(withEmptyMarketRoot(pair.pre, pair.week), [pair.picture.productionId]),
    week: pair.week, playerRelease: pair.picture.productionId, rivalRelease: pair.rival.releaseId,
  }
}
function twinState(): { state: GameState; week: number; ids: [string, string] } {
  const twin = twinWeek()
  const ids = twin.twins.map((p) => p.productionId).sort() as [string, string]
  return { state: commitPictures(withEmptyMarketRoot(twin.pre, twin.week), ids), week: twin.week, ids }
}

describe('p15a1 market all-or-none at the seam (1355-F3 Blocking 1)', () => {
  it('market-second-subject-failure-commits-nothing: a rival second subject refuses in the seam; nothing from either subject commits', () => {
    const { state, week, playerRelease, rivalRelease } = pairState()
    const before = canon(state)
    // Premise: unforced, both subjects receive a factor below 1 (P = 1 each).
    const lawful = rowsAt(tick(state), week).filter((row) => row.releaseId === playerRelease || row.releaseId === rivalRelease)
    expect(lawful).toHaveLength(2)
    expect(lawful.every((row) => row.factor < 1)).toBe(true)
    // The player's reception runs first (tick step 3); the rival's runs in the industry step.
    control.force = { releaseId: rivalRelease, factor: OUT_OF_BOUNDS }
    control.receptions.length = 0
    expect(() => tick(state)).toThrow(/factor/i)
    expectFirstSubjectReturned()
    expect(canon(state)).toBe(before)
  }, MEDIUM)

  it('market-second-subject-failure-commits-nothing: a player second subject refuses in the seam; nothing from either subject commits', () => {
    const { state, week, ids } = twinState()
    const before = canon(state)
    const lawful = rowsAt(tick(state), week).filter((row) => ids.includes(row.releaseId))
    expect(lawful).toHaveLength(2)
    expect(lawful.every((row) => row.factor < 1)).toBe(true)
    // Player releases resolve in ascending id order (N5): the higher id is the second subject.
    control.force = { releaseId: ids[1], factor: OUT_OF_BOUNDS }
    control.receptions.length = 0
    expect(() => tick(state)).toThrow(/factor/i)
    expectFirstSubjectReturned()
    expect(canon(state)).toBe(before)
  }, MEDIUM)
})

describe('p15a1 market due-set witness in the live tick (RED 5)', () => {
  it('market-due-set-mismatch-fails-closed: a frozen batch that loses a due rival picture fails the week by name; input unchanged', () => {
    const { state, week, rivalRelease } = pairState()
    const before = canon(state)
    expect(rowsAt(tick(state), week).map((row) => row.releaseId)).toContain(rivalRelease)
    control.drop = rivalRelease
    expect(() => tick(state)).toThrow(rivalRelease)
    expect(canon(state)).toBe(before)
  }, MEDIUM)
})

describe('p15a1 market seam at both release sites (RED 2 live, 1355-A §3.2)', () => {
  it('market-seam-both-call-sites: the batch factor scales the player\'s and the rival\'s opening and total; critic and legs hold', () => {
    const { state, week, playerRelease, rivalRelease } = pairState()
    const pressured = tick(state)
    const rows = rowsAt(pressured, week)
    control.all = 1
    const unpressured = tick(state)
    control.all = null
    const player = (s: GameState) => s.studio.releasedFilms.find((film) => film.productionId === playerRelease)!
    const rival = (s: GameState) => {
      const film = s.hollywood!.films.find((row) => row.filmId === rivalRelease)!
      if (film.provenance !== 'simulation/v1') throw new Error('premise: a live rival film')
      return film.result
    }
    for (const [id, read] of [[playerRelease, player], [rivalRelease, rival]] as const) {
      const factor = rows.find((row) => row.releaseId === id)!.factor
      expect(factor, `${id} premise`).toBeLessThan(1)
      const [a, b] = [read(pressured), read(unpressured)]
      expect(a.criticScore).toBe(b.criticScore)
      expect(a.boxOffice.opening / b.boxOffice.opening).toBeCloseTo(factor, 12)
      expect(a.boxOffice.total / b.boxOffice.total).toBeCloseTo(factor, 12)
      expect(a.boxOffice.total / a.boxOffice.opening).toBeCloseTo(b.boxOffice.total / b.boxOffice.opening, 12)
    }
  }, MEDIUM)
})
