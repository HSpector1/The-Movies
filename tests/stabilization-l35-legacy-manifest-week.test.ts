// ── Owner decision 12A (audit L-35, RIVAL-02): the end-of-run Legacy settles only the paid input week ─────────────
// Authority: docs/engineering/audits/2026-10-22-codebase-review/LEDGER.md ("Owner decisions, 2026-10-23", 12A) on
// Owner ruling 1362-O 5.2 ("Do not claim everything settled in that week unless it actually did"). The tick that
// produces closure week C pays input week C − 1, and the ended manifest's exclusive cut stays C + 1. Under
// `campaign-legacy/v3` the adapter settled a player run whose last installment falls at C while the closure record
// listed that run pending. The end-of-run writer now names `campaign-legacy/v4`, whose adapter settles a run only
// through the paid input week; a v3 ended manifest still replays under v3's adapter.
//
// Premise device, as tests/helpers/p15b-live.ts `forgedConditionRoot`: no natural route closes a studio while one of
// its runs is live. The genuine v37 capture at week 35 holds the player's live run (released 34, six weeks, one
// installment paid). Migrated to live, its condition root is forged as if recorded from week 6: every entered studio
// evaluated from 7, the player warned at 10 and in distress since 14 (22 distress weeks at 35), the rivals stable. The
// player is drained below zero by more than the run's unpaid revenue. Every later week is natural ticks: the player
// closes at 39 with the run's last installment (input week 39) unpaid.
import { describe, expect, it } from 'vitest'
import {
  buildLegacyManifest, ENDED_LEGACY_DEFINITION, LEGACY_BOUNDARY_WEEK, LEGACY_DEFINITIONS, legacyFactsFromState,
  MODERN_LEGACY_DEFINITION, type EndedLegacy, type LegacyFacts, type LegacyManifest,
} from '../src/core/campaignLegacy.js'
import { P15_PHASE_ORDER_VERSION, P15_PHASE_TABLES } from '../src/core/p15Phases.js'
import { exportSave, importSave, makeSave, migrateToLive } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { migrated } from './helpers/p14c3-fixtures.js'
import { canon, drainPlayer, raw } from './helpers/p15b-live.js'
import { budgeted, captureAt, FIXTURE_MS, ROUTE_MS } from './helpers/p15c2-legacy.js'
import { validateLiveSave } from './helpers/live-era.js'

const CAPTURE = 'genuine-v37-c3-three-real-releases.json.gz'
const V3 = MODERN_LEGACY_DEFINITION
const V4 = ENDED_LEGACY_DEFINITION
const RECORDED_FROM = 6
const FIRST = 7
const WARNED = 10
const DISTRESSED = 14
const C = 39

const catalogOf = (manifest: LegacyManifest, studioId: string): Record<string, number> =>
  manifest.studios.find((s) => s.studioId === studioId)!.lenses.find((l) => l.lensId === 'catalog')!.counts
const filmsOf = (facts: LegacyFacts, domainId: string) => facts.films.filter((f) => f.domainId === domainId)

type Case = { final: GameState; player: string; runId: string }
let closed: Case | undefined
function closedCase(): Case {
  if (closed !== undefined) return closed
  const input = migrated(CAPTURE)
  const inputBytes = canon(input)
  const h = input.hollywood!
  const player = h.playerStudioId
  expect(input.market.tick, 'premise: the capture week').toBe(35)
  const live = input.theatricalRuns.filter((r) => r.status === 'active')
  expect(live.map((r) => [r.releaseTick, r.totalWeeks, r.weekIndex]), 'premise: one live player run, one installment paid').toEqual([[34, 6, 1]])
  const run = live[0]!
  expect(run.releaseTick + run.totalWeeks - 1, 'premise: its last installment is due at input week C').toBe(C)
  expect(input.studio.activeProductions, 'premise: nothing else releases before C').toEqual([])
  expect((raw(input).p15Sequence as { next: number }).next, 'premise: the migrated capture holds no P15 row').toBe(1)

  const entry = P15_PHASE_TABLES[P15_PHASE_ORDER_VERSION]!.find((e) => e.phaseId === 'p15b.condition')!
  const triple = { phaseId: 'p15b.condition', phaseOrdinal: entry.phaseOrdinal, phaseOrderVersion: P15_PHASE_ORDER_VERSION }
  const week = input.market.tick
  const span = week - FIRST + 1
  const rivals = h.identities.filter((i) => i.role === 'rival' && i.enteredWeek !== null).map((i) => i.studioId)
  const studios = [player, ...rivals].sort().map((studioId) => ({ studioId, firstEvaluatedWeek: FIRST, definitionVersion: 'corporate-condition/v1',
    condition: studioId === player
      ? { stage: 'distress', since: DISTRESSED, week, lowRun: span, negativeRun: span, clearRun: 0, distressWeeks: week - DISTRESSED + 1 }
      : { stage: 'stable', since: FIRST, week, lowRun: 0, negativeRun: 0, clearRun: span, distressWeeks: 0 } }))
  const event = (n: number, at: number, from: string, to: string, causes: { code: string; weeks: number }[]) =>
    ({ eventId: `corporate-event-${n}`, studioId: player, week: at, from, to, causes, definitionVersion: 'corporate-condition/v1', p15DomainSequence: n, ...triple })
  const events = [
    event(1, WARNED, 'stable', 'warning', [{ code: 'LOW_COVER', weeks: WARNED - FIRST + 1 }, { code: 'NEGATIVE_CASH', weeks: WARNED - FIRST + 1 }]),
    event(2, DISTRESSED, 'warning', 'distress', [{ code: 'NEGATIVE_CASH', weeks: DISTRESSED - FIRST + 1 }, { code: 'LOW_COVER', weeks: DISTRESSED - FIRST + 1 }]),
  ]
  const forged = { ...input, corporateCondition: { version: 1, recordedFromWeek: RECORDED_FROM, nextEvent: 3, nextLoan: 1, studios, events, loans: [] },
    p15Sequence: { version: 1, next: 3 } } as unknown as GameState
  const unpaid = run.weeklyGross.slice(run.weekIndex).reduce((sum, gross) => sum + gross, 0) * run.studioShare
  const drained = drainPlayer(forged, Math.ceil(forged.studio.cash + unpaid) + 1)
  expect(() => makeSave(drained), 'premise: the forged root and the drain admit').not.toThrow()

  let state = drained
  while (state.market.tick < C && !state.studioClosure.closures.some((c) => c.studioId === player)) state = tick(state)
  expect(state.studioClosure.closures.find((c) => c.studioId === player)?.closureWeek, 'premise: the measured chronology, never shifted').toBe(C)
  expect(canon(input), 'the capture is not mutated').toBe(inputBytes)
  closed = { final: state, player, runId: run.productionId }
  return closed
}

describe('12A: the end-of-run Legacy reports the paid input week (L-35)', () => {
  it('one-payment-left-at-closure-reads-in-release-as-its-closure-record', budgeted(FIXTURE_MS, () => {
    const { final, player, runId } = closedCase()
    const record = final.studioClosure.closures.find((c) => c.studioId === player)!
    const run = final.theatricalRuns.find((r) => r.productionId === runId)!
    // The closing tick paid input week C − 1; the installment due at input week C is unpaid and recorded pending.
    expect(run).toMatchObject({ status: 'active', weekIndex: run.totalWeeks - 1 })
    expect(run.releaseTick + run.weekIndex - 1, 'the paid input week').toBe(C - 1)
    expect(record.dispositions.filter((d) => d.subjectKind === 'theatricalRun').map((d) => [d.subjectId, d.status])).toEqual([[runId, 'pending']])

    const ended = final.campaignLegacy.endOfRun!
    expect(ended).toMatchObject({ kind: 'endOfRun', definition: V4, boundaryWeek: C + 1, postFinaleMode: null, closureId: record.closureId })
    expect(record.endOfRun).toBe(ended.legacySnapshotId)
    expect(catalogOf(ended, player), 'the manifest agrees with the closure record').toMatchObject({ releases: 3, settled: 2, inReleaseAtBoundary: 1 })

    const v4 = legacyFactsFromState(final, C + 1, V4)
    const v3 = legacyFactsFromState(final, C + 1, V3)
    expect(v4.films.find((f) => f.filmId === runId)).toMatchObject({ status: 'inRun', settledWeek: null, grossSettled: null })
    // The superseded reading claimed it settled in the closing week: the defect the revision closes.
    expect(v3.films.find((f) => f.filmId === runId)).toMatchObject({ status: 'settled', settledWeek: C })
    // The reported week is the paid input week: the player's films read as v3 reads them at a cut just after C − 1,
    // and the revision moves nothing else the adapter reads.
    expect(canon(filmsOf(v4, 'playerFilms'))).toBe(canon(filmsOf(legacyFactsFromState(final, C, V3), 'playerFilms')))
    expect(canon(filmsOf(v4, 'industryFilms'))).toBe(canon(filmsOf(v3, 'industryFilms')))
    expect(canon({ ...v4, films: [] })).toBe(canon({ ...v3, films: [] }))
    // At a cut no later than market.tick, the official freeze's case, the two adapters agree exactly.
    expect(canon(legacyFactsFromState(final, C, V4))).toBe(canon(legacyFactsFromState(final, C, V3)))

    // The closed world saves, validates and reloads unchanged.
    const save = makeSave(final)
    expect(() => validateLiveSave(save)).not.toThrow() // the live reader (Save49 since P16; tests/helpers/live-era.ts)
    expect(canon(importSave(exportSave(save)).state)).toBe(canon(final))
  }), FIXTURE_MS)

  it('a-v3-ended-manifest-replays-unchanged-and-the-definition-selects-the-adapter', budgeted(FIXTURE_MS, () => {
    const { final, player } = closedCase()
    const ended = final.campaignLegacy.endOfRun!
    // The manifest the pre-12A writer published for this closure: v3's adapter and builder at C + 1, the same stamps.
    const old = { ...ended, ...buildLegacyManifest(legacyFactsFromState(final, C + 1, V3), 'endOfRun', V3) } as EndedLegacy
    expect(old.definition).toBe(V3)
    expect(catalogOf(old, player), 'v3 keeps its recorded reading').toMatchObject({ releases: 3, settled: 3, inReleaseAtBoundary: 0 })
    const withEnded = (manifest: EndedLegacy): GameState => ({ ...final, campaignLegacy: { ...final.campaignLegacy, endOfRun: manifest } })
    const published = withEnded(old)
    const bytes = canon(published)
    const save = makeSave(published)
    expect(canon(save.state.campaignLegacy.endOfRun), 'replayed under v3 and kept byte for byte').toBe(canon(old))
    expect(canon(importSave(exportSave(save)).state)).toBe(canon(save.state))
    expect(canon(published)).toBe(bytes)
    // Each law's bytes under the other's name refuse at the replay.
    const relabel = (manifest: EndedLegacy, definition: EndedLegacy['definition']): GameState => withEnded({ ...manifest, definition })
    expect(() => makeSave(relabel(ended, V3))).toThrow(/campaignLegacy\.endOfRun\.\S* must equal the replay under campaign-legacy\/v3/)
    expect(() => makeSave(relabel(old, V4))).toThrow(/campaignLegacy\.endOfRun\.\S* must equal the replay under campaign-legacy\/v4/)
  }), FIXTURE_MS)

  it('v4-is-v3-law-and-domains-under-the-next-adapter-revision', () => {
    expect(canon(LEGACY_DEFINITIONS[V4])).toBe(canon(LEGACY_DEFINITIONS[V3]))
  })

  it('the-official-writer-keeps-v3-and-a-v4-official-refuses', budgeted(ROUTE_MS, () => {
    const capture = captureAt((s) => s.market.tick === LEGACY_BOUNDARY_WEEK - 1, 'stored route L week 6239')
    const at = tick(migrateToLive(capture as never).state as GameState)
    const official = at.campaignLegacy.official!
    expect(official).toMatchObject({ kind: 'official2040', definition: V3, boundaryWeek: LEGACY_BOUNDARY_WEEK })
    expect(() => makeSave(at)).not.toThrow()
    const hostile: GameState = { ...at, campaignLegacy: { ...at.campaignLegacy, official: { ...official, definition: V4 } } }
    expect(() => makeSave(hostile)).toThrow(/campaignLegacy\.official\.definition/)
  }), ROUTE_MS)
})
