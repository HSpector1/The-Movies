// ── R3-N7-SIM-01 — the read-only Studio Operations Events projection ─────────
//
// The laws under proof, stated once:
//
//   L1  EVERY KIND IS PUBLISHED. All twelve `StudioEventDraft` kinds reach the
//       wire, and every row in the log is published — the casting board's
//       eight-row expiry slice is a casting decision, not this projection's.
//   L2  TIER AND SIGNIFICANCE ARE PROPERTIES OF THE KIND. Tier D -> permanent /
//       'major', Tier W -> windowed / 'standard', so History's four shipped
//       filter chips govern both lists without a fifth chip.
//   L3  NAMES IN THE SENTENCE, IDS IN THE SUBJECT. Every summary resolves its
//       subject through an EXISTING read model; no summary contains the raw id
//       its own subject carries.
//   L4  ABSENCE IS STATED, NEVER FILLED IN. `personId` is null for all twelve
//       kinds; `queueAdmitted` has no subject (its ordinal restarts at 0 when the
//       queue drains); a pre-V15 migrated `queueIntentExpired` renders with no
//       subject at all rather than a guessed one.
//   L5  COVERAGE IS THE ENGINE'S OWN WINDOW. `windowWeeks` is
//       `TUNING.STUDIO_EVENT_WINDOW_WEEKS`; the retained span is the compaction
//       floor; after a compaction past the window the Tier-D rows survive, the
//       Tier-W rows do not, and the coverage sentence stops claiming a span.
//   L6  PURE AND SERVED. Two derivations are byte-identical, the state digest is
//       untouched, and the section validates inside the real projection-45
//       envelope exactly as the client will parse it.
//
// THE FIXTURE IS A REAL CAMPAIGN, not a hand-written log. Nineteen weeks of
// engine output produce all twelve kinds: three pictures through development,
// rehearsal, shooting, wrap, release commitment and premiere; a scenery shop
// built on the lot; a house set struck and a ballroom raised in its place; two
// greenlights queued behind a held Development & Casting slot and one of them
// withdrawn. The ONE hand-made row is the pre-V15 `queueIntentExpired`, which no
// current engine path can produce because the engine always captures a subject.
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'

import { applyActions, queryPlacement, stableStringify, tick, TUNING } from '../src/core/index.js'
import type { GameState, LotCell, StudioEvent } from '../src/core/index.js'
import { compactStudioEvents, TIER_D_STUDIO_EVENT_KINDS } from '../src/core/studioEvents.ts'
import { exportSaveJson } from '../ui/src/engine/adapter.ts'
import { operationsEventsProjection } from '../bridge/operations-events.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION } from '../bridge/protocol.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { BridgeSession } from '../bridge/session.ts'
import { contendedStudio, freePackage } from './_m4Fixtures.js'

const ALL_KINDS = [
  'wrapped',
  'premiere',
  'releaseCommitted',
  'constructionCompleted',
  'setBuilt',
  'setRetired',
  'reservationGranted',
  'reservationReleased',
  'phaseEntered',
  'sceneryArrived',
  'queueAdmitted',
  'queueIntentExpired',
] as const

const digest = (state: GameState): string =>
  createHash('sha256').update(exportSaveJson(state)).digest('hex')

/** The first legal origin for a blueprint, asked of the ONE placement authority. */
function firstLegalOrigin(state: GameState, blueprintId: string): LotCell {
  for (let gy = 0; gy < 32; gy += 1) {
    for (let gx = 0; gx < 32; gx += 1) {
      if (queryPlacement(state, { blueprintId, origin: { gx, gy } }).ok) return { gx, gy }
    }
  }
  throw new Error(`r3n7 fixture: no legal origin for "${blueprintId}" on this lot`)
}

/**
 * One week at the board: answer only the commands the week is actually waiting
 * on, commit anything that is Release Ready, then advance. Nothing here is a
 * shortcut — every line is a public action a player takes.
 */
function playWeek(input: GameState): GameState {
  let state = input
  for (const workflow of state.operations.workflows) {
    const task = workflow.shootingTask
    if (workflow.phase !== 'shooting' || task === null || task.status !== 'unassigned') continue
    const production = state.studio.activeProductions.find(
      (candidate) => candidate.id === workflow.productionId,
    )
    if (production === undefined) continue
    state = applyActions(state, [{
      kind: 'assignShootingDirector',
      productionId: production.id,
      directorId: production.directorId,
    }])
  }
  for (const workflow of state.operations.workflows) {
    const task = workflow.shootingTask
    if (
      task !== null && task.status === 'blocked' &&
      workflow.blocker?.kind === 'scenery-load-in' && workflow.blocker.taskId === task.id
    ) {
      state = applyActions(state, [{ kind: 'clearSceneryLoadIn', productionId: workflow.productionId }])
    }
  }
  for (const workflow of state.operations.workflows) {
    if (workflow.shootingTask?.status !== 'ready') continue
    state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId: workflow.productionId }])
  }
  const releaseReady = state.studio.activeProductions.filter((p) => p.remainingTicks === 1)
  if (releaseReady.length > 0) {
    state = applyActions(
      state,
      releaseReady.map((p) => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })),
    )
  }
  return tick(state, { develop: true })
}

/** The nineteen-week campaign whose ledger carries all twelve kinds. */
function twelveKindStudio(): GameState {
  const fixture = contendedStudio('r3n7-ops-events')
  let state = fixture.state
  // A building that takes eleven weeks, so its completion lands inside the run.
  state = applyActions(state, [{
    kind: 'placeFacility',
    placement: { blueprintId: 'scenery-shop', origin: firstLegalOrigin(state, 'scenery-shop') },
  }])
  // Both Development & Casting rooms are held, so these two greenlights QUEUE.
  for (const projectId of fixture.readyProjectIds.slice(0, 2)) {
    state = applyActions(state, [{
      kind: 'greenlightScriptProject',
      production: freePackage(state, projectId),
    }])
  }
  expect(state.productionQueue.length).toBe(2)
  // …and the studio changes its mind about the second one.
  state = applyActions(state, [{
    kind: 'cancelQueuedIntent',
    ordinal: state.productionQueue[state.productionQueue.length - 1]!.ordinal,
  }])
  for (let week = 0; week < 12 && state.studio.releasedFilms.length < 2; week += 1) {
    state = playWeek(state)
  }
  expect(state.studio.releasedFilms.length).toBeGreaterThanOrEqual(2)
  // The lot changes: a house set comes down and a showpiece goes up in its place.
  state = applyActions(state, [{ kind: 'strikeSet', setId: 'set-0' }])
  state = applyActions(state, [{
    kind: 'commissionSet',
    commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: 'facility-soundstage-07' },
  }])
  for (let week = 0; week < 12; week += 1) state = playWeek(state)
  return state
}

let cached: GameState | null = null
function studio(): GameState {
  cached ??= twelveKindStudio()
  return cached
}

function rowsOfKind(state: GameState, kind: StudioEvent['kind']): StudioEvent[] {
  return state.studioEvents.rows.filter((row) => row.kind === kind)
}

describe('R3-N7-SIM-01 — operationsEventsProjection (projection 32)', () => {
  it('L1 publishes every kind and every row in the log, week-descending', () => {
    const state = studio()
    const projection = operationsEventsProjection(state)

    expect([...new Set(projection.rows.map((row) => row.kind))].sort()).toEqual([...ALL_KINDS].sort())
    // No slice: the casting board's eight-row expiry window is ITS decision.
    expect(projection.rows.length).toBe(state.studioEvents.rows.length)
    expect(projection.rows.length).toBeGreaterThan(8)
    expect(projection.rows.map((row) => row.seq).sort((a, b) => a - b))
      .toEqual(state.studioEvents.rows.map((row) => row.seq).sort((a, b) => a - b))

    for (let index = 1; index < projection.rows.length; index += 1) {
      const previous = projection.rows[index - 1]!
      const current = projection.rows[index]!
      expect(previous.week).toBeGreaterThanOrEqual(current.week)
      if (previous.week === current.week) expect(previous.seq).toBeGreaterThan(current.seq)
    }
    // The calendar label is the authoritative one, not a second formatting.
    expect(projection.rows[0]!.date).toMatch(/^19\d\d · Week \d+$/)
    expect(projection.currentWeek).toBe(state.market.tick)
  })

  it('L2 derives tier and significance from the KIND, and names the permanent kinds', () => {
    const projection = operationsEventsProjection(studio())
    for (const row of projection.rows) {
      const permanent = (TIER_D_STUDIO_EVENT_KINDS as readonly string[]).includes(row.kind)
      expect(row.tier).toBe(permanent ? 'permanent' : 'windowed')
      // The existing four History chips filter both lists; no fifth chip is added.
      expect(row.significance).toBe(permanent ? 'major' : 'standard')
    }
    expect(projection.coverage.permanentKinds).toEqual([...TIER_D_STUDIO_EVENT_KINDS])
    expect(projection.coverage.permanentKinds).toHaveLength(6)
    expect(projection.totals.permanent + projection.totals.windowed).toBe(projection.rows.length)
    expect(projection.totals.permanent)
      .toBe(projection.rows.filter((row) => row.tier === 'permanent').length)
  })

  it('L3 states the resolved name in the sentence and the exact id in the subject', () => {
    const state = studio()
    const projection = operationsEventsProjection(state)
    const row = (kind: StudioEvent['kind']) => projection.rows.find((r) => r.kind === kind)!

    // Titles, building names, set names, facility names and phase words — every
    // one of them from an authority that already owns the word.
    const wrapped = rowsOfKind(state, 'wrapped')[0]!
    const wrappedRow = projection.rows.find((r) => r.seq === wrapped.seq)!
    expect(wrappedRow.summary).toBe('The Northern Archipelago wraps on Soundstage 7, using the Stage 7 House Set.')
    expect(wrappedRow.subject).toEqual({ kind: 'production', id: wrapped.kind === 'wrapped' ? wrapped.productionId : '' })

    expect(row('premiere').summary).toContain('premieres.')
    expect(row('releaseCommitted').summary).toContain('is committed to release.')
    expect(row('constructionCompleted').summary).toBe('Scenery Shop opens on the lot.')
    expect(row('setBuilt').summary).toBe('The Grand Ballroom is standing on Soundstage 7.')
    expect(row('setRetired').summary).toMatch(/^The Stage 7 House Set is struck; \$[\d,]+ returns to the studio\.$/)
    expect(row('reservationGranted').summary).toMatch(/ takes .+ slot \d+\.$/)
    expect(row('reservationReleased').summary).toMatch(/ releases .+ slot \d+\.$/)
    expect(row('phaseEntered').summary).toMatch(/ enters (Development|Pre-production|Rehearsal|Shooting|Post-production|Release Ready)\.$/)
    expect(row('sceneryArrived').summary).toMatch(/^Scenery arrives for .+\.$/)
    expect(row('queueAdmitted').summary).toBe('Greenlight joins the queue.')

    // The engine's own reason sentence is passed through verbatim.
    const expired = rowsOfKind(state, 'queueIntentExpired')[0]!
    const expiredRow = projection.rows.find((r) => r.seq === expired.seq)!
    expect(expired.kind === 'queueIntentExpired' && expiredRow.summary.includes(expired.reason)).toBe(true)
    expect(expiredRow.summary).toContain('The Golden Homecoming')

    // No sentence prints the id its own subject carries.
    for (const published of projection.rows) {
      if (published.subject === null) continue
      expect(published.summary).not.toContain(published.subject.id)
    }

    // Exact ids, and the route triple History already renders.
    const construction = rowsOfKind(state, 'constructionCompleted')[0]!
    const constructionRow = projection.rows.find((r) => r.seq === construction.seq)!
    expect(constructionRow.subject).toEqual({
      kind: 'building',
      id: construction.kind === 'constructionCompleted' ? construction.placementId : '',
    })
    expect(constructionRow.route.buildingId).toBe(`placed-${String(state.placement.facilities[0]!.id)}`)

    const premiere = rowsOfKind(state, 'premiere')[0]!
    const premiereRow = projection.rows.find((r) => r.seq === premiere.seq)!
    const filmId = premiere.kind === 'premiere' ? premiere.filmId : ''
    expect(premiereRow.subject).toEqual({ kind: 'film', id: filmId })
    expect(premiereRow.route.filmId).toBe(filmId)
    expect(state.studio.releasedFilms.some((film) => film.productionId === filmId)).toBe(true)

    const reservation = rowsOfKind(state, 'reservationGranted')[0]!
    const reservationRow = projection.rows.find((r) => r.seq === reservation.seq)!
    expect(reservationRow.subject).toEqual({
      kind: 'resource',
      id: reservation.kind === 'reservationGranted' ? reservation.resourceKey : '',
    })
    expect(reservationRow.subject!.id).toMatch(/^facility-[a-z0-9-]+:\d+$/)
  })

  it('L4 states absence: no personId anywhere, and no guessed queue subject', () => {
    const state = studio()
    const projection = operationsEventsProjection(state)
    // None of the twelve kinds carries a talent id, so the person route is never
    // offered. This is the assertion that catches a future kind that does.
    expect(projection.rows.every((row) => row.route.personId === null)).toBe(true)
    expect(projection.rows.filter((row) => row.kind === 'queueAdmitted').every((row) => row.subject === null)).toBe(true)
    expect(projection.rows.filter((row) => row.kind === 'queueIntentExpired').every((row) => row.subject !== null)).toBe(true)

    // A pre-V15 save recorded no queue subject, and a migrated row must never
    // have one guessed for it — not from the kind, not from the ordinal.
    const migrated: GameState = {
      ...state,
      studioEvents: {
        ...state.studioEvents,
        rows: state.studioEvents.rows.map((row) =>
          row.kind === 'queueIntentExpired' ? { ...row, subjectId: null } : row,
        ),
      },
    }
    const migratedProjection = operationsEventsProjection(migrated)
    const expired = migratedProjection.rows.filter((row) => row.kind === 'queueIntentExpired')
    expect(expired.length).toBeGreaterThan(0)
    for (const row of expired) {
      expect(row.subject).toBeNull()
      expect(row.route).toEqual({ filmId: null, personId: null, buildingId: null })
      // It still says what left the queue and why; it just never says which one.
      expect(row.summary).toMatch(/^Greenlight leaves the queue — .+\.$/)
      expect(row.summary).not.toContain('The Golden Homecoming')
    }
    // Nothing else lost its subject.
    expect(migratedProjection.rows.filter((row) => row.subject === null).length)
      .toBe(projection.rows.filter((row) => row.subject === null).length + expired.length)
  })

  it('L5 publishes the engine window, and a compaction past it changes the honest sentence', () => {
    const state = studio()
    const projection = operationsEventsProjection(state)
    expect(projection.coverage.windowWeeks).toBe(TUNING.STUDIO_EVENT_WINDOW_WEEKS)
    expect(projection.coverage.oldestWindowedWeek)
      .toBe(Math.max(0, state.market.tick - (TUNING.STUDIO_EVENT_WINDOW_WEEKS - 1)))
    expect(projection.totals.windowed).toBeGreaterThan(0)

    // Forty weeks on, by the ENGINE's own compaction of the ENGINE's own log.
    const later = state.market.tick + 40
    const aged: GameState = {
      ...state,
      market: { ...state.market, tick: later },
      studioEvents: compactStudioEvents(state.studioEvents, later),
    }
    const agedProjection = operationsEventsProjection(aged)
    expect(agedProjection.totals.permanent).toBe(projection.totals.permanent)
    expect(agedProjection.totals.windowed).toBe(0)
    expect(agedProjection.rows.every((row) => row.tier === 'permanent')).toBe(true)
    // Nothing windowed is retained, so the client is not handed a span to print.
    expect(agedProjection.coverage.oldestWindowedWeek).toBeNull()
    expect(agedProjection.coverage.windowWeeks).toBe(TUNING.STUDIO_EVENT_WINDOW_WEEKS)
    // `seq` never renumbers, so the surviving rows keep the identities they had.
    expect(agedProjection.rows.map((row) => row.seq))
      .toEqual(projection.rows.filter((row) => row.tier === 'permanent').map((row) => row.seq))
  })

  it('L6 is pure, mutates nothing, and validates inside the served projection-50 envelope', () => {
    const state = studio()
    const before = digest(state)
    expect(stableStringify(operationsEventsProjection(state)))
      .toBe(stableStringify(operationsEventsProjection(state)))
    expect(digest(state)).toBe(before)

    const response = new BridgeSession(state, 'r3n7-operations-events').snapshot()
    expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, response)).not.toThrow()
    expect(response.snapshotVersion).toBe(PROJECTION_VERSION)
    expect(PROJECTION_VERSION).toBe(50)
    const served = response.snapshot.operationsEvents.operationsEvents
    // The served section is the projection itself — no re-derivation on the way out.
    expect(stableStringify(served)).toBe(stableStringify(operationsEventsProjection(state)))
    expect(digest(state)).toBe(before)
  })
})
