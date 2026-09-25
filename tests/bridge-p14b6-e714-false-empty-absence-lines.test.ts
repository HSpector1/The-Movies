// P14B.6 E714 — "no recorded relationship" must not be published as "never worked
// together". Independent RED (record 714-T) + CONTROL, authored against the accepted B.6
// predecessor (`tests/bridge-p14b6-relationship-read-models.test.ts`, 24/24 green) and this
// slice's own D2 file (`tests/bridge-p14b6-d2-withheld-employment-claim.test.ts`), whose
// layout conventions this file follows. This file writes tests and fixtures only; it does
// not touch `bridge/relationships.ts`, `bridge/people.ts` or any other production source.
// Requirement: docs/engineering/playability-launch-review/evidence/p14b4-20260919/
// 714-T-false-empty-red-brief.md. The disclosure constraint that bounds Case 2 is SETTLED at
// .../710-shared-work-disclosure-finding.md and is NOT re-derived here. The production change
// this pins is briefed separately at .../715-W-... — not landed by this file.
//
// THE DEFECT. `bridge/relationships.ts` publishes two absence sentences that fire on the
// absence of a RELATIONSHIP EDGE while claiming the absence of SHARED WORK:
//     :50  QUIET_LINE          = 'No shared work recorded yet.'   (relationshipBlockFor)
//     :58  NO_SHARED_WORK_LINE = 'No shared work yet.'            (castingChemistryRows)
// A WRITER or CRAFT contributor shares a released picture and never receives an edge
// (`seatPairs`, src/core/relationships.ts :214-222, covers only director/lead/antagonist/
// support), so both sentences overclaim on that pair.
//
// FOUR CASES (the brief's own numbering) plus the record-710 disclosure check:
//   Case 1 (CONTROL, green before and after) — an existing edge with an OFF-ROSTER
//     counterpart keeps the preserved sentence 'Other working ties here are with people you
//     do not employ.'
//   Case 2 (RED) — viewer-commissioned shared work, zero edges, no disclosable counterpart:
//     'Shared credits on your pictures. No working relationship on record.'
//   Case 3 (RED) — neither an edge nor viewer-commissioned shared work:
//     'No shared work on your pictures yet.'
//   Case 4 (RED + CONTROL) — the sibling site `castingChemistryRows`: a shared-picture,
//     no-edge pair reads 'They share a credit. Nothing is recorded about how it went.'; a
//     neither pair in the SAME seating still reads 'No shared work yet.'
//   Disclosure check — a subject whose only shared work belongs to ANOTHER studio must not
//     earn Case 2's sentence (the leak record 710 ruled out).
//
// HOW CASE 2/3's WORLD IS REACHED (the route hint, offered not mandated, taken as written).
// `releasedWriterWorld` founds a studio through the NATIVE `beginFounding` (never the
// historical-analysis control — `state.hollywood` must be REAL so `rosterAt`'s employer-
// interval predicate has genuine work to do), signs the FOUNDING_MINIMUMS roster (1 writer,
// 1 director, 3 actors, 1 craft) on the shortest legal term (52 weeks, `Contract.termWeeks`'s
// own floor), greenlights one picture with that roster, drives it to release through
// `nextStudioDecision` (the same decision-driven driver `tests/p06a-w1-release-authority.
// test.ts`'s `foundedToReleaseReady` already exercises on a NATIVE founding), then advances
// past every signed contract's natural, unrenewed lapse. The writer is never a `seatPairs`
// seat (so zero edges, by the engine's own law) and the credit survives in
// `state.studio.releasedFilms` after every co-participant's contract has ended and left the
// roster (`rosterAt`'s strict `endedWeek` boundary) — reachable without hand-shaping a state.

import assert from 'node:assert/strict'
import { describe, expect, it } from 'vitest'

import { applyActions, beginFounding, generateWorld, nextStudioDecision, tick } from '../src/core/index.js'
import { RELATIONSHIP_TIERS } from '../src/core/relationships.js'
import { LIVE_SAVE_VERSION, makeSave, validateSaveV35 } from '../src/core/save.js'
import type { CreativeRole, GameState, RelationshipDriver, RelationshipTier, SegmentId } from '../src/core/types.js'
import { peopleProjection } from '../bridge/people.ts'
import { castingChemistryRows, sharedPictureCount, type ChemistrySeats } from '../bridge/relationships.ts'
import { player, retentionFixture } from './helpers/p14b2-fixtures.js'

// ── the pinned copy (existing + this brief's four new sentences) ────────────────────────────
const CASE1_WITHHELD_LINE = 'Other working ties here are with people you do not employ.'
const CURRENT_QUIET_LINE = 'No shared work recorded yet.'
const CASE2_LINE = 'Shared credits on your pictures. No working relationship on record.'
const CASE3_LINE = 'No shared work on your pictures yet.'
const CURRENT_NO_SHARED_WORK_LINE = 'No shared work yet.'
const CASE4_LINE = 'They share a credit. Nothing is recorded about how it went.'
// Every OTHER sentence `bridge/relationships.ts` can emit today (:48-66), so the new lines'
// distinctness from EVERY existing one is CHECKED, not assumed (the accepted suite's own
// :525 precedent).
const EXISTING_LINES = [
  'Working ties with people on your roster.',
  CASE1_WITHHELD_LINE,
  CURRENT_QUIET_LINE,
  'No studio roster on record, so working ties are not shown.',
  CURRENT_NO_SHARED_WORK_LINE,
  'They have not worked well together.',
  'They have worked together before.',
  'They have worked well together.',
  'One pair in this seating has a history of not working well together.',
  'Working ties with people on your roster. Other working ties here are with people you do not employ.',
]

// ── local instruments (nothing here is imported by, or imports from, another test file) ─────
type Edge = {
  edgeId: string; a: string; b: string; closeness: number; firstSharedWeek: number; lastEventWeek: number
  sharedProductions: number; sharedSuccesses: number; sharedFailures: number; sharedCancellations: number
  peakTier: RelationshipTier; peakTierWeek: number; recent: RelationshipDriver[]
}
const edges = (state: GameState): readonly Edge[] => (state as unknown as { relationships?: readonly Edge[] }).relationships ?? []
const withRoot = (state: GameState, rows: readonly Edge[]): GameState => ({ ...state, relationships: rows } as unknown as GameState)
/** Validator-admitted: the staged root round-trips through makeSave/validateSaveV31, so this
 *  is a shape the real save format can hold — never a hand-minted state the engine cannot
 *  produce (the D2 file's `admitted()`, restated). */
function admitted(state: GameState, label: string): GameState {
  const save = makeSave(state)
  expect(save.saveVersion).toBe(LIVE_SAVE_VERSION)
  validateSaveV35(JSON.parse(JSON.stringify(save)))
  expect(label.length).toBeGreaterThan(0)
  return save.state as GameState
}
/** The published block, read off the SAME carrier a real bridge consumer reads
 *  (`BridgePersonProfileSnapshot.collaborators`), never a direct call with a hand-invented
 *  `viewerStudioId` — production itself resolves that id as `state.hollywood?.playerStudioId
 *  ?? ''` (the D2 file's `collaboratorsOf()`, restated exactly). */
const collaboratorsOf = (state: GameState, talentId: string): { line: string; rows: readonly unknown[] } => {
  const profile = peopleProjection(state).profiles.find((p) => p.talentId === talentId)
  assert.ok(profile, `premise: no published profile for ${talentId}`)
  return (profile as unknown as { collaborators: { line: string; rows: readonly unknown[] } }).collaborators
}
/** The landed roster-at-W predicate, re-expressed from `bridge/relationships.ts` :84-91
 *  (restated, not re-decided — that helper is private). */
function rosterAt(state: GameState, studioId: string, subject: string, week: number): Set<string> {
  const roster = new Set<string>()
  for (const row of state.hollywood?.employment ?? []) {
    if (row.studioId !== studioId || row.terms.talentId === subject) continue
    if (row.terms.startWeek < week && (row.endedWeek === null || week < row.endedWeek)) roster.add(row.terms.talentId)
  }
  return roster
}
/** True iff `id` appears on NO recorded take (any studio) and NO released film's captured
 *  participants — "never credited anywhere", the Case 3 "neither" premise. */
function neverCredited(state: GameState, id: string): boolean {
  const inTakes = state.firstTakes.some((t) => [t.directorId, t.cast.lead, t.cast.antagonist, t.cast.support].includes(id))
  const inReleases = state.studio.releasedFilms.some((f) => {
    const p = f.participants
    if (p === undefined) return false
    return [p.writer.talentId, p.director.talentId, p.cast.lead.talentId, p.cast.antagonist.talentId,
      p.cast.support.talentId, ...p.craft.map((c) => c.talentId)].includes(id)
  })
  return !inTakes && !inReleases
}

// ── W1 — the accepted suite's own real player take (reused, never rebuilt) ──────────────────
let w1Cache: GameState | undefined
function w1(): GameState {
  if (w1Cache === undefined) w1Cache = retentionFixture().outcomes as unknown as GameState
  return w1Cache
}
/** W1's four seated roles, DERIVED from the fixture's own recorded productionId — never a
 *  copied literal. */
function w1Seats(state: GameState): ChemistrySeats {
  const productionId = retentionFixture().productionId
  const take = state.firstTakes.find((t) => t.productionId === productionId)
  assert.ok(take, 'premise: the retentionFixture production has a recorded first take')
  return { directorId: take.directorId, lead: take.cast.lead, antagonist: take.cast.antagonist, support: take.cast.support }
}

// ── the Case 2/3 world: a NATIVE-founded studio, one released picture, every co-participant's
// contract naturally lapsed and unrenewed ────────────────────────────────────────────────────
const WRITER_WORLD_TERM_WEEKS = 52 // `Contract.termWeeks`'s own floor (src/core/types.ts :354)

type WriterWorld = { state: GameState; writerId: string; directorId: string; castIds: readonly string[]; craftId: string }

function releasedWriterWorld(seed: string): WriterWorld {
  let state = beginFounding(generateWorld(seed))
  expect(state.hollywood).not.toBeNull() // NATIVE founding: rosterAt's employer-interval law has real work to do
  const applicants = state.founding!.applicantIds.map((id) => state.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole) => applicants.filter((t) => t.role === role)
  const writer = byRole('writer')[0]!
  const director = byRole('director')[0]!
  const actors = byRole('actor').slice(0, 3)
  assert.ok(actors.length === 3, 'premise: at least three actor applicants are drafted')
  const craft = byRole('craft')[0]!
  for (const person of [writer, director, ...actors, craft]) {
    state = applyActions(state, [{ kind: 'signContract', talentId: person.id, termWeeks: WRITER_WORLD_TERM_WEEKS }])
  }
  state = applyActions(state, [{ kind: 'foundStudio' }])
  state = applyActions(state, [{ kind: 'activateStudioOperations' }])

  const concept = state.concepts[0]!
  const production = {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: {
        intimacy: [-0.5, 0.5] as [number, number],
        tonalWeight: [-0.5, 0.5] as [number, number],
        kineticEnergy: [-0.5, 0.5] as [number, number],
      },
    },
    writerId: writer.id,
    directorId: director.id,
    cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id },
    craftIds: [craft.id],
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
  state = applyActions(state, [{ kind: 'greenlight', production }])
  const productionId = state.studio.activeProductions[0]!.id

  // Drive to `releaseReady` (tick 1) the way a player does: apply exactly the production-
  // operation decisions the engine publishes, then advance — the `foundedToReleaseReady`
  // device of `tests/p06a-w1-release-authority.test.ts` :145-157, already exercised there on a
  // NATIVE founding (its default `historical=false`), restated here.
  for (let week = 0; week < 24; week++) {
    for (let guard = 0; guard < 8; guard++) {
      const decision = nextStudioDecision(state)
      if (decision === null || decision.kind !== 'productionOperation') break
      state = applyActions(state, [decision.command])
    }
    if (state.studio.activeProductions.find((p) => p.id === productionId)?.remainingTicks === 1) break
    state = tick(state)
  }
  if (state.studio.activeProductions.find((p) => p.id === productionId)?.remainingTicks !== 1) {
    throw new Error('releasedWriterWorld: never reached releaseReady in 24 weeks')
  }
  state = applyActions(state, [{ kind: 'commitPictureToRelease', productionId }])
  state = tick(state)
  const film = state.studio.releasedFilms.find((f) => f.productionId === productionId)
  assert.ok(film, 'premise: the greenlit picture reached release')
  assert.ok(film.participants, "premise: economyEngaged captured this film's participants")
  expect(film.participants.writer.talentId).toBe(writer.id)

  // Advance past every signed contract's natural, UNRENEWED end, so every co-participant is
  // off the viewer's roster at the target week while the credit survives in `releasedFilms` —
  // the brief's own route (`rosterAt`'s strict `endedWeek` boundary), never a hand-shaped state.
  while (state.market.tick <= WRITER_WORLD_TERM_WEEKS) state = tick(state)
  for (const id of [director.id, ...actors.map((a) => a.id), craft.id, writer.id]) {
    const row = state.hollywood!.employment.find((e) => e.studioId === player(state) && e.terms.talentId === id)
    assert.ok(row, `premise: ${id} holds a player employment row`)
    expect(row.endedWeek).not.toBeNull()
    expect(state.market.tick).toBeGreaterThanOrEqual(row.endedWeek!)
  }

  return { state, writerId: writer.id, directorId: director.id, castIds: actors.map((a) => a.id), craftId: craft.id }
}

let writerWorldCache: WriterWorld | undefined
function writerWorld(): WriterWorld {
  if (writerWorldCache === undefined) writerWorldCache = releasedWriterWorld('p14b6-e714-case2')
  return writerWorldCache
}

// ── the Case 4 world: the pre-V31 "resumed campaign" shape (firstTakes populated,
// relationships wiped to an empty root — the accepted suite's own family-6 S3 device, restated),
// plus a "neither" pair FOUND (never hand-picked) on the engine's own roster ──────────────────
type Case4World = { rows: ReturnType<typeof castingChemistryRows> }
let case4WorldCache: Case4World | undefined
function case4World(): Case4World {
  if (case4WorldCache !== undefined) return case4WorldCache
  const base = w1()
  const week = base.market.tick
  const seatsBase = w1Seats(base)
  const resumed = admitted(withRoot(base, []), 'case4-resumed-shape')
  expect(edges(resumed)).toEqual([])
  expect(sharedPictureCount(resumed, seatsBase.directorId, seatsBase.lead)).toBeGreaterThan(0)

  const excluded = new Set(Object.values(seatsBase))
  let neitherPair: readonly [string, string] | undefined
  outer: for (const x of resumed.talent) {
    if (excluded.has(x.id)) continue
    for (const y of resumed.talent) {
      if (y.id === x.id || excluded.has(y.id)) continue
      if (sharedPictureCount(resumed, x.id, y.id) === 0) { neitherPair = [x.id, y.id]; break outer }
    }
  }
  assert.ok(neitherPair, 'premise: two talents sharing no picture exist on this world')

  const seats: ChemistrySeats = {
    directorId: seatsBase.directorId, lead: seatsBase.lead,
    antagonist: neitherPair[0], support: neitherPair[1],
  }
  return case4WorldCache = { rows: castingChemistryRows(resumed, seats, week) }
}

// ═════════════════════════════════════════════════════════════════════════════════════════════
describe('714-T — "no recorded relationship" must not be published as "never worked together"', () => {
  it('Case 1 (CONTROL, must stay GREEN before AND after the fix): an existing edge with an OFF-ROSTER counterpart keeps the preserved sentence', () => {
    const state = w1()
    const week = state.market.tick
    const viewer = player(state)
    const roster = rosterAt(state, viewer, '', week)
    const hidden = edges(state).find((e) => !roster.has(e.a) && !roster.has(e.b))
    assert.ok(hidden, 'premise: a rival-internal edge exists on the standard seed')
    const block = collaboratorsOf(state, hidden.a)
    expect(block.rows).toEqual([])
    expect(block.line).toBe(CASE1_WITHHELD_LINE)
    expect(block.line).not.toBe(CASE2_LINE)
    expect(block.line).not.toBe(CASE3_LINE)
  }, 300_000)

  it("Case 2 (RED, must FAIL today): viewer-commissioned shared work, zero edges, no disclosable counterpart — 'No shared work recorded yet.' is false here", () => {
    const { state, writerId, directorId } = writerWorld()
    // PREMISES.
    expect(sharedPictureCount(state, writerId, directorId)).toBeGreaterThan(0) // viewer-commissioned shared work
    expect(edges(state).some((e) => e.a === writerId || e.b === writerId)).toBe(false) // zero edges: never a seatPairs seat
    const block = collaboratorsOf(state, writerId)
    expect(block.rows).toEqual([]) // no disclosable counterpart: every co-participant's contract has lapsed
    expect(block.line).not.toBe(CURRENT_QUIET_LINE)
    expect(block.line).toBe(CASE2_LINE)
  }, 300_000)

  it("Case 3 (RED, must FAIL today): neither an edge nor viewer-commissioned shared work — the corrected copy must not overclaim absence", () => {
    const { state } = writerWorld()
    const candidate = state.talent.find((t) => t.role !== 'scientist'
      && neverCredited(state, t.id)
      && !edges(state).some((e) => e.a === t.id || e.b === t.id))
    assert.ok(candidate, 'premise: an uncredited, edgeless talent exists on this world')
    const block = collaboratorsOf(state, candidate.id)
    expect(block.rows).toEqual([])
    expect(block.line).not.toBe(CURRENT_QUIET_LINE)
    expect(block.line).toBe(CASE3_LINE)
  }, 300_000)

  it("Case 4 (RED, must FAIL today): the sibling site castingChemistryRows — a shared-picture no-edge pair reads the corrected line, not the existing one", () => {
    const { rows } = case4World()
    const sharedRow = rows.find((r) => r.seatA === 'director' && r.seatB === 'lead')
    assert.ok(sharedRow, 'premise: the director-lead row is published')
    expect(sharedRow.tierLabel).toBeNull() // no edge (wiped)
    expect(sharedRow.line).not.toBe(CURRENT_NO_SHARED_WORK_LINE)
    expect(sharedRow.line).toBe(CASE4_LINE)
  }, 300_000)

  it('Case 4 (CONTROL, must stay GREEN before AND after the fix): a neither pair in the SAME seating keeps the existing sentence', () => {
    const { rows } = case4World()
    const neitherRow = rows.find((r) => r.seatA === 'antagonist' && r.seatB === 'support')
    assert.ok(neitherRow, 'premise: the antagonist-support row is published')
    expect(neitherRow.tierLabel).toBeNull() // still no edge
    expect(neitherRow.line).toBe(CURRENT_NO_SHARED_WORK_LINE) // unchanged, before and after
    expect(neitherRow.line).not.toBe(CASE4_LINE)
  }, 300_000)

  it("the disclosure check (record 710): a subject whose ONLY shared work belongs to ANOTHER studio does not earn Case 2's sentence", () => {
    const state = w1()
    const viewer = player(state)
    // Trivial on this fixture (only a first take is reached, never a release), but CHECKED,
    // never assumed: the player has commissioned no released picture at all here, so nothing
    // this subject shares can be viewer-entitled through `state.studio.releasedFilms`.
    expect(state.studio.releasedFilms).toEqual([])
    const rivalTake = state.firstTakes.find((t) => t.studioId !== viewer)
    assert.ok(rivalTake, 'premise: a rival first take exists on the standard seed')
    const subject = rivalTake.directorId
    const counterpart = rivalTake.cast.lead
    const subjectTakes = state.firstTakes.filter((t) =>
      [t.directorId, t.cast.lead, t.cast.antagonist, t.cast.support].includes(subject))
    expect(subjectTakes.every((t) => t.studioId !== viewer)).toBe(true) // never a viewer-commissioned credit
    // Zero edges (the S3 wipe device), so the ONLY possible trigger left is shared-work existence.
    const wiped = admitted(withRoot(state, []), 'disclosure-check')
    expect(edges(wiped)).toEqual([])
    // The risk is non-vacuous: the UNFILTERED count really does see this rival-internal pair.
    expect(sharedPictureCount(wiped, subject, counterpart)).toBeGreaterThan(0)
    const block = collaboratorsOf(wiped, subject)
    expect(block.line).not.toBe(CASE2_LINE)
    // The Owner's third case ("neither") is defined by viewer ENTITLEMENT, not by what exists in
    // the world: this subject's only shared work is rival-internal, so there is nothing here the
    // viewer may be told about, and it belongs in Case 3. Premise checked, not assumed: only when
    // `rows` is genuinely empty does the block fall to the shared-work-absence branch at all — a
    // non-empty `rows` would mean ROSTER_LINE fires instead, and Case 3's copy would be the wrong
    // expectation.
    expect(block.rows).toEqual([])
    expect(block.line).toBe(CASE3_LINE)
  }, 300_000)

  it('every new sentence differs from every existing one (the :525 precedent), and none carries a digit or a tier name', () => {
    const fresh = [CASE2_LINE, CASE3_LINE, CASE4_LINE]
    for (const line of fresh) {
      for (const existing of EXISTING_LINES) expect(line).not.toBe(existing)
      expect(line).not.toMatch(/\d/)
      for (const tier of RELATIONSHIP_TIERS) expect(line).not.toContain(tier)
    }
    expect(new Set(fresh).size).toBe(fresh.length)
  })
})
