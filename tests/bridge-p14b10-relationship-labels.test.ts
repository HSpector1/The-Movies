// Record 1358-C — independent-test-engineer RED for P14B relationship rulings SLICE B, the BRIDGE
// DTO (1347-A §4 "Projection" as SUPERSEDED by 1347-F's Addendum: "Slice B takes projection 57
// once, for `labels` ('Mentor' | 'Professional Rivals') and `romance` together"). Authored on a
// scratch tree (1327-C method) at BASE c614b7e9ed62dcb889118ba1eadb8a2bafa7934a with slice A applied
// (committed `slice-a`), branch wip/headless-program-20260916-ts. Revised as record 1358-C5 (RED r5)
// under 1358-F4: the Mentor gate (item 1), the Partners expiry note (item 2(a)) and the dated
// Rivals evidence (note 9).
//
// AUTHORITY (read in full before use):
//   1347-F Addendum (:62-68): "Slice B takes projection 57 once, for `labels` (`'Mentor' |
//     'Professional Rivals'`) and `romance` together."
//   1347-A §4 (:105): "Disclosure is unchanged: rows exist only for counterparts on the viewer's
//     roster (bridge/relationships.ts :196-209). Evidence cites only released pictures or the
//     viewer's own. No magnitudes appear, and no key named `"relationships":`."
//   1347-A §6 item 8 (:156): "Mentor evidence on rival pictures. Withhold the label until all three
//     pictures are public."
//
// PARENT API DECISION UNDER TEST: bridge: `StudioRelationshipRow` gains
//   `labels: { label: 'Mentor' | 'Professional Rivals'; evidence: string }[]` and
//   `romance: { status: 'partners' | 'ended'; sinceLabel: string; endedLabel: string | null } | null`.
//
// SCOPE NOTE ON "evidence cites only released pictures or the viewer's own" (a finding, not an
// assumption): `recordCastingCompetition` is PLAYER-ONLY (1312-F Amendment 1, restated at
// src/core/relationships.ts :382 "Rivals hold no casting session, so the reachable set is
// player-only") — every REAL `competitions` row is therefore, by construction, always a production
// the viewer's OWN studio ran whenever the viewer IS the player (the only browsing viewer this
// single-player Bridge ever serves). The "released or the viewer's own" carve-out for Rivals is
// consequently never load-bearing for a genuine competitions row; this file tests Rivals disclosure
// (roster-gated row presence) and leaves the "released" half of the clause to the leaf that IS
// load-bearing for it: Mentor, whose director/actor pair CAN be entirely rival-internal (no
// player-only constraint on cohort entry or `firstTakes`), covered below with a REAL fixture: the
// all-released positive, a rival picture not yet public (withheld, 1358-F4 item 1), and the viewer's
// own picture still in production, read in the route's own state before its release (shown, citing
// it; restaged in revision 1358-C6). Romance's DTO
// (`status`/`sinceLabel`/`endedLabel`) names no production id at all — only calendar labels via the
// existing `campaignDate` helper (the same device `asOfLabel` already uses in this file) — so the
// "released pictures" clause has no surface there either. Both omissions are named explicitly here,
// not left silent.
//
// RED MECHANISM: `bridge/relationships.ts` and `bridge/schema/bridge-schema.ts` already exist
// (EXISTING modules) — a missing/unwidened field is a genuine `undefined` VALUE on the returned row,
// never a resolution error, so every leaf below is a value assertion on real function output.
//
// FIXTURE STRATEGY: the Rivals/romance/DTO-shape leaves stage a `RelationshipEdge` directly onto a
// freshly-founded, minimally-advanced world (the `withRoot`/`edges` I3 convention of
// tests/bridge-p14b6-relationship-read-models.test.ts, re-derived here since that file's helpers are
// not exported) with a REAL, signed-contract roster for disclosure (`rosterAt`'s own predicate, re-
// derived the same way that file's — and talentMarket.ts's — private roster helper is re-derived
// everywhere it is needed outside `src/core/`). The Mentor withholding leaves reuse the EXISTING,
// already-vetted `cohortThreeFilms()` fixture (tests/helpers/p14c3-cohort-transition-fixtures.ts,
// the SAME real commissionScript -> greenlightScriptProject -> shoot -> release route slice A's own
// Mentor RED already uses) — a genuine cohort entrant, three genuine RELEASED same-director pictures,
// on the PLAYER's own roster (so disclosure is trivially satisfied and the leaf isolates exactly the
// "public" half of the rule). This fixture is HEAVY (measured by 1348-C5 at 50.8-82.3 s for its first
// caller in a file). The two Mentor leaves keep a 180_000 ms vitest timeout, which cannot stop a
// synchronous body and so is not a budget (1356-F5; 1358-F2 item 4). The budgets are the self-timed
// builds below (1358-F3 item 2): `rosterWorld()` throws a named error past 45,000 ms, and
// `mentorCohort()`, the wrapper both Mentor leaves call, past 240,000 ms.

import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { describe, expect, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { campaignDate } from '../src/core/calendar.js'
import { relationshipBlockFor } from '../bridge/relationships.js'
import { financeUpcoming } from '../bridge/finance-upcoming.js'
import { PROJECTION_VERSION } from '../bridge/schema/bridge-schema.js'
import { currentTier } from '../src/core/relationships.js'
import { mentorEvidence } from '../src/core/relationshipLabels.js'
import * as tickModule from '../src/core/tick.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { advanceTo, fund, player } from './helpers/p14b2-fixtures.js'
import { cohortThreeFilms, COHORT_SUBJECT } from './helpers/p14c3-cohort-transition-fixtures.js'
import type { GameState, RelationshipTier } from '../src/core/types.js'

type RelationshipCompetition = { week: number; productionId: string; slots: string[] }
type RomanceBond = { formedWeek: number; endedWeek: number | null }
type RomanceTrack = { value: number; anchorWeek: number; bonds: RomanceBond[] }
type RawEdge = {
  edgeId: string; a: string; b: string; closeness: number; firstSharedWeek: number; lastEventWeek: number
  sharedProductions: number; sharedSuccesses: number; sharedFailures: number; sharedCancellations: number
  sharedCompetitions: number; peakTier: RelationshipTier; peakTierWeek: number; recent: unknown[]
  competitions: RelationshipCompetition[]; romance: RomanceTrack | null
}
type LabelRow = { label: 'Mentor' | 'Professional Rivals'; evidence: string }
type RomanceRow = { status: 'partners' | 'ended'; sinceLabel: string; endedLabel: string | null } | null
type Row = { counterpartId: string; counterpartName: string; labels: LabelRow[]; romance: RomanceRow }
type Block = { rows: Row[] }
const withRoot = (state: GameState, rows: readonly RawEdge[]): GameState => ({ ...state, relationships: rows } as unknown as GameState)
const blockFor = (state: GameState, talentId: string, viewer: string, week?: number): Block =>
  relationshipBlockFor(state, talentId, viewer, week) as unknown as Block
const row = (week: number, productionId: string, slots: string[]): RelationshipCompetition => ({ week, productionId, slots })

/** A minimal founded, real-roster world: two SIGNED actors (disclosed) and one left unsigned
 * (undisclosed — still an addressable person on `state.talent`, just off this studio's roster).
 * MEMOIZED (the `baseWorld`/`castingCompetitionWorld` house convention): built ONCE per file
 * process and `structuredClone`d out to every caller, so 12 leaves pay the `advanceTo(s, 150)`
 * cost once, not 12 times (measured: an un-memoized first pass of this file took ~275s at ~25-32s
 * per leaf; memoizing brings the whole file under the machine-load "quick" threshold). No leaf
 * mutates the returned `state` in place (every derivation below is a `{ ...state, ... }` spread or
 * `withRoot`, never an in-place write), so sharing the built world across leaves is safe.
 * SELF-TIMED (1358-F3 item 2; 1348-F4 item 3: never keep a limit that cannot fire): no vitest
 * timeout can stop this synchronous build, so the build times itself. 1358-F3 sets the number from
 * 1358-X's measurement of the first caller, 5,704 ms on Node v22.23.2. */
const ROSTER_WORLD_BUDGET_MS = 45_000
let rosterWorldCache: { state: GameState; disclosedX: string; disclosedY: string; undisclosed: string; week: number } | undefined
let rosterWorldOverBudget: Error | undefined // cached, so no later leaf pays an over-budget build again
function rosterWorld(): { state: GameState; disclosedX: string; disclosedY: string; undisclosed: string; week: number } {
  if (rosterWorldOverBudget !== undefined) throw rosterWorldOverBudget
  if (rosterWorldCache !== undefined) return structuredClone(rosterWorldCache)
  const started = performance.now()
  let s = fund(p13aGeneratedStudio())
  const actors = hiringMarketIds(s, s.market.tick).map((id) => s.talent.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => t !== undefined && t.role === 'actor')
  assert.ok(actors.length >= 3, 'route premise: at least three free actors at week 0')
  const [disclosedX, disclosedY, undisclosed] = actors.slice(0, 3).map((t) => t.id) as [string, string, string]
  // termWeeks is clamped to 208 (see below), which still covers the week-150 advance, so the contract
  // is still active (not naturally expired) at the week every leaf reads disclosure at.
  s = applyActions(s, [{ kind: 'signContract', talentId: disclosedX, termWeeks: 1000 }, { kind: 'signContract', talentId: disclosedY, termWeeks: 1000 }])
  // Advanced well past week 0 so every romance leaf's `week - N`-style calendar arithmetic below
  // stays a non-negative, safe integer (campaignDate's own precondition). Bounded at 150 (not
  // further): `signContract`'s termWeeks is clamped to TUNING.CONTRACT_MAX_WEEKS (measured 208)
  // regardless of the requested value — a single contract cannot cover a week-400 advance, and
  // this file does not renew mid-route (unlike tests/helpers/p14c3-cohort-transition-fixtures.ts's
  // multi-renewal `RENEWALS` pattern), so 150 is the chosen, safely-under-208 headroom instead.
  s = advanceTo(s, 150)
  const elapsedMs = performance.now() - started
  if (elapsedMs > ROSTER_WORLD_BUDGET_MS) {
    rosterWorldOverBudget = Object.assign(new Error(`rosterWorld() took ${Math.round(elapsedMs)} ms, over ROSTER_WORLD_BUDGET_MS (${ROSTER_WORLD_BUDGET_MS} ms)`),
      { name: 'RosterWorldBudgetExceeded' })
    throw rosterWorldOverBudget
  }
  const week = s.market.tick
  rosterWorldCache = { state: s, disclosedX, disclosedY, undisclosed, week }
  return structuredClone(rosterWorldCache)
}
function baseEdge(index: number, a: string, b: string, week: number, extra: Partial<RawEdge> = {}): RawEdge {
  const [x, y] = a < b ? [a, b] : [b, a]
  return {
    edgeId: `relationship-edge-${String(index)}`, a: x, b: y, closeness: 65, firstSharedWeek: week, lastEventWeek: week,
    sharedProductions: 1, sharedSuccesses: 0, sharedFailures: 0, sharedCancellations: 0, sharedCompetitions: 0,
    peakTier: 'Friends', peakTierWeek: week, recent: [], competitions: [], romance: null, ...extra,
  }
}

describe('P14B10 T1 — the projection version moves once for slice B (1347-F Addendum)', () => {
  it('PROJECTION_VERSION is 57', () => {
    expect(PROJECTION_VERSION).toBe(57)
  })
})

describe('Professional Rivals — disclosure (row presence is roster-gated, unchanged; the label rides the disclosed row)', () => {
  it('a Rivals-qualifying edge on a DISCLOSED counterpart shows the label, naming evidence text', () => {
    const w = rosterWorld()
    const competitions = [row(w.week - 20, 'prod-riv-1', ['lead']), row(w.week - 10, 'prod-riv-2', ['lead'])]
    const state = withRoot(w.state, [baseEdge(0, w.disclosedX, w.disclosedY, w.week, { sharedCompetitions: 2, competitions })])
    const block = blockFor(state, w.disclosedX, player(w.state), w.week)
    const counterpartRow = block.rows.find((r) => r.counterpartId === w.disclosedY)
    assert.ok(counterpartRow, 'route premise: the disclosed counterpart must produce a row')
    expect(Array.isArray(counterpartRow.labels)).toBe(true)
    expect(counterpartRow.labels).toContainEqual(expect.objectContaining({ label: 'Professional Rivals' }))
    const rivalsLabel = counterpartRow.labels.find((l) => l.label === 'Professional Rivals')!
    expect(typeof rivalsLabel.evidence).toBe('string')
    // 1358-F4 (1358-D note 9; 1347-A:66 "The evidence is the two dated rows"): both rows' dates appear.
    for (const competition of competitions) expect(rivalsLabel.evidence).toContain(campaignDate(competition.week).label)
  })

  it('the IDENTICAL Rivals-qualifying edge on an UNDISCLOSED counterpart produces NO row at all (existing disclosure law, unaffected by labels)', () => {
    const w = rosterWorld()
    const competitions = [row(w.week - 20, 'prod-riv-1', ['lead']), row(w.week - 10, 'prod-riv-2', ['lead'])]
    const state = withRoot(w.state, [baseEdge(0, w.disclosedX, w.undisclosed, w.week, { sharedCompetitions: 2, competitions })])
    const block = blockFor(state, w.disclosedX, player(w.state), w.week)
    expect(block.rows.find((r) => r.counterpartId === w.undisclosed)).toBeUndefined()
  })

  it('a disclosed non-Rivals edge (lead then support, no shared slot) shows no Professional Rivals label', () => {
    const w = rosterWorld()
    const competitions = [row(w.week - 20, 'prod-a', ['lead']), row(w.week - 10, 'prod-b', ['support'])]
    const state = withRoot(w.state, [baseEdge(0, w.disclosedX, w.disclosedY, w.week, { sharedCompetitions: 2, competitions })])
    const block = blockFor(state, w.disclosedX, player(w.state), w.week)
    const counterpartRow = block.rows.find((r) => r.counterpartId === w.disclosedY)
    assert.ok(counterpartRow, 'route premise')
    expect(Array.isArray(counterpartRow.labels)).toBe(true)
    expect(counterpartRow.labels.some((l) => l.label === 'Professional Rivals')).toBe(false)
  })
})

describe('Romance — disclosure and shape (status/sinceLabel/endedLabel via the existing campaignDate device)', () => {
  it('a disclosed OPEN bond reads status "partners", sinceLabel = campaignDate(formedWeek).label, endedLabel null', () => {
    const w = rosterWorld()
    const formedWeek = w.week - 5
    const romance: RomanceTrack = { value: 90, anchorWeek: w.week, bonds: [{ formedWeek, endedWeek: null }] }
    const state = withRoot(w.state, [baseEdge(0, w.disclosedX, w.disclosedY, w.week, { romance })])
    const block = blockFor(state, w.disclosedX, player(w.state), w.week)
    const counterpartRow = block.rows.find((r) => r.counterpartId === w.disclosedY)
    assert.ok(counterpartRow, 'route premise')
    expect(counterpartRow.romance).toEqual({ status: 'partners', sinceLabel: campaignDate(formedWeek).label, endedLabel: null })
  })

  it('a disclosed CLOSED bond reads status "ended", with both sinceLabel and endedLabel set', () => {
    const w = rosterWorld()
    const formedWeek = w.week - 100, endedWeek = w.week - 30
    const romance: RomanceTrack = { value: 20, anchorWeek: endedWeek, bonds: [{ formedWeek, endedWeek }] }
    const state = withRoot(w.state, [baseEdge(0, w.disclosedX, w.disclosedY, w.week, { romance })])
    const block = blockFor(state, w.disclosedX, player(w.state), w.week)
    const counterpartRow = block.rows.find((r) => r.counterpartId === w.disclosedY)
    assert.ok(counterpartRow, 'route premise')
    expect(counterpartRow.romance).toEqual({ status: 'ended', sinceLabel: campaignDate(formedWeek).label, endedLabel: campaignDate(endedWeek).label })
  })

  it('no romance (null track) reads romance: null on the row', () => {
    const w = rosterWorld()
    const state = withRoot(w.state, [baseEdge(0, w.disclosedX, w.disclosedY, w.week)])
    const block = blockFor(state, w.disclosedX, player(w.state), w.week)
    const counterpartRow = block.rows.find((r) => r.counterpartId === w.disclosedY)
    assert.ok(counterpartRow, 'route premise')
    expect(counterpartRow.romance).toBeNull()
  })

  it('a bond on an UNDISCLOSED counterpart produces no row (and so no romance leak) at all', () => {
    const w = rosterWorld()
    const romance: RomanceTrack = { value: 90, anchorWeek: w.week, bonds: [{ formedWeek: w.week - 5, endedWeek: null }] }
    const state = withRoot(w.state, [baseEdge(0, w.disclosedX, w.undisclosed, w.week, { romance })])
    const block = blockFor(state, w.disclosedX, player(w.state), w.week)
    expect(block.rows.find((r) => r.counterpartId === w.undisclosed)).toBeUndefined()
  })
})

describe('No magnitudes, no key named "relationships": (1347-A §4; the landed leak law extended over the two new fields)', () => {
  it('a label row is EXACTLY {label, evidence} — no numeric field slips in', () => {
    const w = rosterWorld()
    const competitions = [row(w.week - 20, 'prod-riv-1', ['lead']), row(w.week - 10, 'prod-riv-2', ['lead'])]
    const state = withRoot(w.state, [baseEdge(0, w.disclosedX, w.disclosedY, w.week, { sharedCompetitions: 2, competitions })])
    const block = blockFor(state, w.disclosedX, player(w.state), w.week)
    const counterpartRow = block.rows.find((r) => r.counterpartId === w.disclosedY)
    assert.ok(counterpartRow, 'route premise')
    const rivalsLabel = counterpartRow.labels.find((l) => l.label === 'Professional Rivals')
    assert.ok(rivalsLabel, 'route premise: this edge is Rivals-qualifying')
    expect(Object.keys(rivalsLabel).sort()).toEqual(['evidence', 'label'])
  })

  it('the serialized block never contains the leak key form "relationships": (the landed law, tests/bridge-p14b5-relationships.test.ts:404-408, extended to the labels/romance fields)', () => {
    const w = rosterWorld()
    const competitions = [row(w.week - 20, 'prod-riv-1', ['lead']), row(w.week - 10, 'prod-riv-2', ['lead'])]
    const romance: RomanceTrack = { value: 90, anchorWeek: w.week, bonds: [{ formedWeek: w.week - 5, endedWeek: null }] }
    const state = withRoot(w.state, [baseEdge(0, w.disclosedX, w.disclosedY, w.week, { sharedCompetitions: 2, competitions, romance })])
    const block = blockFor(state, w.disclosedX, player(w.state), w.week)
    const dto = JSON.stringify(block)
    for (const leak of ['"relationships":', '"closeness":', '"sharedCompetitions":', '"peakTier":', '"value":', '"anchorWeek":']) {
      expect(dto.includes(leak), `leak law broken: DTO contains ${leak}`).toBe(false)
    }
  })
})

/** 1358-F4 item 1, for the rival picture: every release record of the picture removed (its result, every
 * studio history row that names it, its career events and its theatrical run), so no reader finds it released. */
function withoutRelease(state: GameState, productionId: string): GameState {
  const namesPicture = (row: GameState['studioHistory']['rows'][number]): boolean =>
    row.subjects.some((subject) => subject.kind === 'film' && subject.productionId === productionId)
    || ((row.kind === 'filmReleased' || row.kind === 'theatricalRunCompleted') && row.productionId === productionId)
    || (row.kind === 'careerMilestone' && row.filmId === productionId)
  return {
    ...state,
    studio: { ...state.studio, releasedFilms: state.studio.releasedFilms.filter((film) => film.productionId !== productionId) },
    studioHistory: { ...state.studioHistory, rows: state.studioHistory.rows.filter((row) => !namesPicture(row)) },
    careerEvents: state.careerEvents.filter((event) => event.filmId !== productionId),
    theatricalRuns: state.theatricalRuns.filter((run) => run.productionId !== productionId),
  }
}
/** A released picture's concept title, the name the Bridge gives a picture. */
function titleOf(state: GameState, productionId: string): string {
  const film = state.studio.releasedFilms.find((f) => f.productionId === productionId)
  assert.ok(film, `route premise: picture ${productionId} is released`)
  const concept = state.concepts.find((c) => c.id === film.conceptId)
  assert.ok(concept, `route premise: picture ${productionId} names a concept`)
  return concept.title
}

/** SELF-TIMED (1358-F3 item 2; 1348-F4 item 3): the helper memoizes `cohortThreeFilms()` once per file
 * and hands every caller a clone. This wrapper times the first call in this file, the one that
 * builds, and throws a named error past COHORT_THREE_FILMS_BUDGET_MS. 1358-F3 sets the number from
 * 1358-X's measurement of the first Mentor leaf, 40,219 ms on Node v22.23.2. */
const COHORT_THREE_FILMS_BUDGET_MS = 240_000
let cohortTimed = false
let cohortOverBudget: Error | undefined // cached, so the second Mentor leaf fails by the same name
/** 1358-C6 (the coordinator's ruling on 1358-C5's second uncertain item): the route's own input to the tick
 * that releases its third picture, captured from the real tick during the first build. In that state the
 * picture sits in activeProductions with its first take recorded, and nothing records it as released. */
let cohortBeforeThirdRelease: GameState | undefined
function mentorCohort(): ReturnType<typeof cohortThreeFilms> {
  if (cohortOverBudget !== undefined) throw cohortOverBudget
  if (cohortTimed) return cohortThreeFilms()
  const started = performance.now()
  const realTick = tickModule.tick
  const capture = vi.spyOn(tickModule, 'tick').mockImplementation((input, options) => {
    const output = realTick(input, options)
    if (cohortBeforeThirdRelease === undefined && input.studio.releasedFilms.length === 2 && output.studio.releasedFilms.length === 3) {
      cohortBeforeThirdRelease = structuredClone(input)
    }
    return output
  })
  let built: ReturnType<typeof cohortThreeFilms>
  try { built = cohortThreeFilms() } finally { capture.mockRestore() }
  const elapsedMs = performance.now() - started
  cohortTimed = true
  if (elapsedMs > COHORT_THREE_FILMS_BUDGET_MS) {
    cohortOverBudget = Object.assign(new Error(`cohortThreeFilms() took ${Math.round(elapsedMs)} ms, over COHORT_THREE_FILMS_BUDGET_MS (${COHORT_THREE_FILMS_BUDGET_MS} ms)`),
      { name: 'CohortThreeFilmsBudgetExceeded' })
    throw cohortOverBudget
  }
  return built
}

describe('Mentor — the Bridge-level "public" gate (1347-A §6 item 8: "withhold the label until all three pictures are public")', () => {
  it('a genuine cohort entrant with three genuine RELEASED same-director pictures shows the Mentor label on the disclosed pair', () => {
    const { state, team } = mentorCohort()
    const playerId = player(state)
    const week = state.market.tick
    const block = blockFor(state, COHORT_SUBJECT, playerId, week)
    const directorRow = block.rows.find((r) => r.counterpartId === team.directorId)
    assert.ok(directorRow, 'route premise: the director must be disclosed on the player roster')
    expect(directorRow.labels).toContainEqual(expect.objectContaining({ label: 'Mentor' }))
  }, 180_000) // 1356-F5: vitest cannot stop a synchronous body, so this timeout is not a budget

  // 1358-C5 (1358-F4 item 1; 1358-D blocking 1): evidence "cites only released pictures or the viewer's
  // own" (1347-A:105), and §6 item 8 withholds Mentor only for RIVAL pictures until all three are public.
  // r4 withheld Mentor for the viewer's own unreleased picture, where the charter allows Mentor. The withholding
  // leaf now re-attributes that picture to a rival. The next leaf shows Mentor for the viewer's own picture
  // while it is still in production (restaged in 1358-C6 from the route's own state).
  it('the SAME cohort entrant, with ONE of the three pictures a RIVAL picture that is not yet public (first take re-attributed to a rival business, no release fact), withholds Mentor at the Bridge level even though the core derivation is unaffected', () => {
    const { state, team, pictureIds } = mentorCohort()
    const playerId = player(state)
    const week = state.market.tick
    const rivalPicture = pictureIds[2]!
    const rivalStudioId = state.hollywood!.businesses[0]?.studioId
    assert.ok(rivalStudioId, 'route premise: a rival business exists')
    const unreleased = withoutRelease(state, rivalPicture)
    const variant: GameState = { ...unreleased,
      firstTakes: unreleased.firstTakes.map((take) => (take.productionId === rivalPicture ? { ...take, studioId: rivalStudioId } : take)) }
    assert.ok(!variant.hollywood!.films.some((film) => film.filmId === rivalPicture)
      && !variant.hollywood!.receipts.some((receipt) => receipt.kind === 'filmReleased' && receipt.productionId === rivalPicture),
    'route premise: no rival release fact names the picture')
    assert.ok(mentorEvidence(variant, COHORT_SUBJECT)?.directorId === team.directorId, 'route premise: the core derivation still names Mentor')
    const block = blockFor(variant, COHORT_SUBJECT, playerId, week)
    const directorRow = block.rows.find((r) => r.counterpartId === team.directorId)
    assert.ok(directorRow, 'route premise: the director must still be disclosed on the player roster')
    expect(directorRow.labels.some((l) => l.label === 'Mentor')).toBe(false)
  }, 180_000) // 1356-F5: vitest cannot stop a synchronous body, so this timeout is not a budget

  it('the SAME cohort entrant, read in the route\'s own week before its third picture is released (that picture in production, its first take recorded), shows Mentor, and the evidence cites the picture by its production\'s title (1347-A:105)', () => {
    const { team, pictureIds } = mentorCohort()
    assert.ok(cohortBeforeThirdRelease, 'route premise: the first cohortThreeFilms() build captured the state before the third release')
    const state = structuredClone(cohortBeforeThirdRelease)
    const playerId = player(state)
    const week = state.market.tick
    const [first, second, third] = pictureIds as [string, string, string]
    const production = state.studio.activeProductions.find((p) => p.id === third)
    assert.ok(production, 'route premise: the third picture is in production')
    assert.ok(state.firstTakes.some((take) => take.productionId === third && take.studioId === playerId), 'route premise: its first take is recorded, at the viewer\'s own studio')
    assert.ok(!state.studio.releasedFilms.some((film) => film.productionId === third) && !state.theatricalRuns.some((run) => run.productionId === third)
      && !state.studioHistory.rows.some((row) => row.kind === 'filmReleased' && row.productionId === third),
    'route premise: no release, theatrical run or release history row names it')
    const title = state.concepts.find((concept) => concept.id === production.conceptId)?.title // the title the production carries
    assert.ok(title !== undefined, 'route premise: the production names a concept')
    assert.ok(![first, second].some((id) => titleOf(state, id).includes(title)), 'route premise: the third title names that picture alone')
    assert.ok(mentorEvidence(state, COHORT_SUBJECT)?.directorId === team.directorId, 'route premise: the core derivation names Mentor')
    const block = blockFor(state, COHORT_SUBJECT, playerId, week)
    const directorRow = block.rows.find((r) => r.counterpartId === team.directorId)
    assert.ok(directorRow, 'route premise: the director must be disclosed on the player roster')
    const mentor = directorRow.labels.find((l) => l.label === 'Mentor')
    expect(mentor, 'Mentor shows: the unreleased picture is the viewer\'s own').toBeDefined()
    expect(mentor!.evidence).toContain(title)
    for (const id of [first, second]) expect(mentor!.evidence).toContain(titleOf(state, id)) // 1358-F6 ruling 7; 1347-A:65
  }, 180_000) // 1356-F5: vitest cannot stop a synchronous body, so this timeout is not a budget
})

describe('Romance — the contract-expiry note names a Partners counterpart (1347-A:18, :60; 1358-F4 item 2(a))', () => {
  it('financeUpcoming: the expiry row of a person whose partner stays on the roster names that partner, at a friendship tier below Inseparable', () => {
    const w = rosterWorld()
    const funded = fund(w.state) // the file's explicit cash bootstrap, so the signing bonus clears the solvency gate
    const subject = hiringMarketIds(funded, w.week).map((id) => funded.talent.find((t) => t.id === id))
      .filter((t): t is NonNullable<typeof t> => t !== undefined)
      .find((t) => t.role === 'actor' && !funded.careerLifecycle.records.some((r) => r.personId === t.id))
    assert.ok(subject, 'route premise: a free actor with no retirement record is listed at the roster week')
    let state = applyActions(funded, [{ kind: 'signContract', talentId: subject.id, termWeeks: 52 }])
    state = advanceTo(state, w.week + 1) // one week on, the 52-week window reaches the expiry week
    const week = state.market.tick
    const contract = state.contracts.find((c) => c.talentId === subject.id && c.startWeek <= week && week < c.endWeekExclusive)
    assert.ok(contract, 'route premise: the new contract is active')
    const romance: RomanceTrack = { value: 90, anchorWeek: week, bonds: [{ formedWeek: week, endedWeek: null }] }
    const edge = baseEdge(0, subject.id, w.disclosedX, week, { romance })
    state = withRoot(state, [edge])
    expect(currentTier(edge, contract.endWeekExclusive)).toBe('Friends') // premise: the Inseparable sentence cannot apply
    const events = financeUpcoming(state).windows.find((window) => window.windowWeeks === 52)!.rows
    const expiry = events.find((event) => event.id === `expiry:${subject.id}:${String(contract.endWeekExclusive)}`)
    assert.ok(expiry, 'route premise: the 52-week window lists the expiry')
    const partnerName = state.talent.find((t) => t.id === w.disclosedX)!.name
    expect(expiry.detail.includes(partnerName), 'the expiry note names the Partners counterpart').toBe(true)
  })
})
