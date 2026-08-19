// ── C2a-M5 — STUDIO WEEK THEATER V1 (charter §4.2) ──────────────────────────
//
// Written from the charter and from `presence.ts`'s header law, not from the
// implementation:
//
//   *"New subjects: stages hot/dark, sets mounted/striking, crates for queued
//   work, wrap clearing the stage …"*                                    (§4.2)
//   *"EVERYTHING BELONGS TO A SYSTEM (`00C`.6): visible activity answers 'why is
//   that person/object there?'"*                                          (§4.2)
//   *"Class-A (state projection — true of the settled week, renders identically
//   on load / after a batch / mid-playback)"*                             (§4.2)
//   *"changes zero outcomes and persists nothing, alters no tick step and is
//   called by none, consumes ZERO simulation RNG … an ambiguity WITHHOLDS the
//   affected [subject] with a stated reason."*         (`presence.ts` header law)
//
// The projection is PRESENTATION CANON. Nothing asserted here may be an outcome.

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  BEATS_PER_WEEK,
  applyActions,
  generateWorld,
  stableStringify,
  studioWeekTheater,
  tick,
} from '../src/core/index.js'
import type { GameState, StudioWeekTheater, TheaterBeat } from '../src/core/index.js'
import { advance, withCash } from './contracts/_contractFixtures.js'
import { contendedStudio, freePackageOrNull } from './_m4Fixtures.js'

const THEATER_SOURCE = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), '../src/core/studioWeekTheater.ts'),
  'utf8',
)

const BEAT_VOCABULARY: readonly TheaterBeat[] = [
  'idle',
  'travel',
  'working',
  'waiting',
  'clearing',
]

const SUBJECT_KINDS = [
  'scenery-in-transit',
  'stage-hot',
  'stage-dark',
  'set-mounting',
  'set-struck',
  'wrap-clearing',
  'company-waiting',
  'queue-waiting',
  'construction-progressing',
] as const

/**
 * A studio under real pressure, built ENTIRELY out of legal public actions — no
 * forged capacity anywhere. The M4 contention fixture already holds both
 * Development & Casting slots; this pushes its two remaining Ready screenplays at
 * the front door as well, so four pictures compete for two stages. That is what
 * makes the §4.2 subjects reachable in one walk: stages hot and dark, a wrap
 * clearing a stage, a company waiting for a room, and admitted intents queueing
 * while they hold nothing at all.
 */
function pressuredStudio(seed: string): GameState {
  const contended = contendedStudio(seed)
  let state: GameState = contended.state
  // ONE of the two house sets is struck, which is a real player decision with a
  // real consequence: the picture that wanted that stage waits for a standing set
  // (`set-unavailable`), and the studio commissions a replacement, which goes up
  // over several weeks. Between them they reach `set-struck`, `company-waiting`
  // and `set-mounting` without a forged byte anywhere.
  const struck = state.sets[1]
  if (struck !== undefined) {
    state = applyActions(state, [{ kind: 'strikeSet', setId: struck.id }])
    state = applyActions(state, [
      {
        kind: 'commissionSet',
        commission: { blueprintId: 'set-house-generic', stageFacilityId: struck.mountedOn },
      },
    ])
  }
  // The two remaining Ready screenplays are pushed at the front door. Each one the
  // roster can still staff is ADMITTED (M4's law) and queues holding nothing, which
  // is the `queue-waiting` subject. One the roster cannot staff is simply not
  // offered — a talent law, not a capacity one, and not this file's subject.
  for (const projectId of contended.readyProjectIds) {
    const payload = freePackageOrNull(state, projectId)
    if (payload === null) continue
    state = applyActions(state, [
      { kind: 'greenlightScriptProject', production: payload },
    ])
  }
  return state
}

/** A contended studio walked far enough that several subjects are live at once. */
function walkedStudio(seed: string, weeks: number): GameState[] {
  let state = pressuredStudio(seed)
  const weeksSeen: GameState[] = [state]
  for (let i = 0; i < weeks; i++) {
    // Issue only the shooting commands the week is waiting on — no theater input.
    for (const workflow of state.operations.workflows) {
      if (workflow.phase !== 'shooting' || workflow.shootingTask?.status !== 'unassigned') continue
      const production = state.studio.activeProductions.find(
        (candidate) => candidate.id === workflow.productionId,
      )!
      state = applyActions(state, [
        {
          kind: 'assignShootingDirector',
          productionId: production.id,
          directorId: production.directorId,
        },
        { kind: 'clearSceneryLoadIn', productionId: production.id },
        { kind: 'scheduleShootingTake', productionId: production.id },
      ])
    }
    state = advance(state, 1)
    weeksSeen.push(state)
  }
  return weeksSeen
}

function everySubject(states: readonly GameState[]): StudioWeekTheater['subjects'] {
  return states.flatMap((state) => studioWeekTheater(state).subjects)
}

describe('C2a-M5 §4.2 — the projection is well-formed, always', () => {
  it('gives every subject exactly BEATS_PER_WEEK beats from the closed vocabulary', () => {
    for (const subject of everySubject(walkedStudio('c2a-m5-theater-shape', 14))) {
      expect(subject.beats, `${subject.id} beat count`).toHaveLength(BEATS_PER_WEEK)
      for (const beat of subject.beats) {
        expect(BEAT_VOCABULARY, `${subject.id} beat`).toContain(beat)
      }
      expect(SUBJECT_KINDS, `${subject.id} kind`).toContain(subject.kind)
    }
  })

  it('keeps ids unique inside a week and sorted', () => {
    for (const state of walkedStudio('c2a-m5-theater-ids', 14)) {
      const { subjects } = studioWeekTheater(state)
      const ids = subjects.map((subject) => subject.id)
      expect(new Set(ids).size).toBe(ids.length)
      expect([...ids].sort()).toEqual(ids)
    }
  })

  it('NEVER THROWS — malformed and absent state withhold with a stated reason', () => {
    const cases: unknown[] = [
      null,
      undefined,
      42,
      'not a state',
      {},
      { market: {} },
      { market: { tick: -1 } },
      { market: { tick: 3 } },
      { market: { tick: 3 }, operations: {} },
      { market: { tick: 3 }, operations: { mode: 'managed', facilities: 'no', workflows: [] } },
    ]
    for (const value of cases) {
      const projection = studioWeekTheater(value as GameState)
      expect(projection.subjects).toEqual([])
      expect(projection.withheld.length).toBeGreaterThan(0)
      for (const entry of projection.withheld) {
        expect(entry.reason.length).toBeGreaterThan(0)
      }
    }
  })

  it('says why a LEGACY studio has nothing to watch, rather than pretending', () => {
    const legacy = generateWorld('c2a-m5-theater-legacy')
    expect(legacy.operations.mode).not.toBe('managed')
    const projection = studioWeekTheater(legacy)
    expect(projection.week).toBe(legacy.market.tick)
    expect(projection.subjects).toEqual([])
    expect(projection.withheld).toEqual([
      { subjectId: null, reason: 'studio operations are not managed' },
    ])
  })
})

describe('C2a-M5 §4.2 — the named subjects are all reachable', () => {
  it('shows stages HOT and DARK, and never the same stage as both', () => {
    let sawHot = false
    let sawDark = false
    for (const state of walkedStudio('c2a-m5-theater-stages', 16)) {
      const { subjects } = studioWeekTheater(state)
      const hot = subjects.filter((subject) => subject.kind === 'stage-hot')
      const dark = subjects.filter((subject) => subject.kind === 'stage-dark')
      sawHot ||= hot.length > 0
      sawDark ||= dark.length > 0
      const hotIds = new Set(hot.map((subject) => subject.facilityId))
      for (const subject of dark) expect(hotIds.has(subject.facilityId)).toBe(false)
      // A hot stage names the picture on it and the phase it is in.
      for (const subject of hot) {
        expect(subject.productionId).not.toBeNull()
        expect(['rehearsal', 'shooting']).toContain(subject.phase)
        expect(subject.facilityName).not.toBeNull()
      }
    }
    expect(sawHot, 'a contended studio must occupy a stage').toBe(true)
    expect(sawDark, 'a contended studio must leave a stage dark at some point').toBe(true)
  })

  it('shows WRAP CLEARING THE STAGE, named from the engine’s own Tier-D row', () => {
    let wraps = 0
    for (const state of walkedStudio('c2a-m5-theater-wrap', 16)) {
      for (const subject of studioWeekTheater(state).subjects) {
        if (subject.kind !== 'wrap-clearing') continue
        wraps += 1
        const row = state.studioEvents.rows.find(
          (candidate) =>
            candidate.kind === 'wrapped' &&
            // The ENGINE wrote this row during the advance INTO this week, so it
            // carries `market.tick - 1` once the week has settled (`tick` builds
            // its sink with `currentTick` and then increments the clock).
            candidate.week === state.market.tick - 1 &&
            candidate.productionId === subject.productionId,
        )
        expect(row, 'a wrap subject must have its own Tier-D row').toBeDefined()
        expect(subject.beats).toContain('clearing')
        expect(subject.facilityId).not.toBeNull()
      }
    }
    expect(wraps).toBeGreaterThanOrEqual(1)
  })

  it('shows COMPANIES WAITING with the engine’s own reason, never a guess', () => {
    let waiters = 0
    for (const state of walkedStudio('c2a-m5-theater-waiting', 20)) {
      for (const subject of studioWeekTheater(state).subjects) {
        if (subject.kind !== 'company-waiting') continue
        waiters += 1
        expect(subject.reason).not.toBeNull()
        expect(subject.reason).toMatch(/^awaiting /)
        const workflow = state.operations.workflows.find(
          (candidate) => candidate.productionId === subject.productionId,
        )
        expect(workflow?.blocker).not.toBeNull()
        expect(subject.beats.every((beat) => beat === 'waiting')).toBe(true)
      }
    }
    expect(waiters).toBeGreaterThanOrEqual(1)
  })

  it('shows a BUILDING RISING with the weeks its own clock says are left', () => {
    let state = withCash(contendedStudio('c2a-m5-theater-construction').state, 200_000_000)
    const quote = state.placement.facilities.length
    state = applyActions(state, [
      {
        kind: 'placeFacility',
        placement: { blueprintId: 'scenery-shop', origin: { gx: 0, gy: 9 } },
      },
    ])
    expect(state.placement.facilities.length).toBe(quote + 1)
    const placed = state.placement.facilities[state.placement.facilities.length - 1]!
    const subject = studioWeekTheater(state).subjects.find(
      (candidate) => candidate.id === `construction-progressing:${String(placed.id)}`,
    )
    expect(subject).toBeDefined()
    expect(subject!.weeksRemaining).toBe(placed.completesWeek - state.market.tick)
    expect(subject!.beats).toContain('working')
    // It stops being a subject the week it opens — the projection is of the SETTLED
    // week, and a finished building is not under construction any more.
    let opened = state
    for (let i = 0; i < 20; i++) {
      opened = tick(opened)
      const still = opened.placement.facilities.find((candidate) => candidate.id === placed.id)
      if (still?.status === 'operational') break
    }
    expect(
      studioWeekTheater(opened).subjects.some(
        (candidate) => candidate.id === `construction-progressing:${String(placed.id)}`,
      ),
    ).toBe(false)
  })

  it('reaches EVERY subject the charter names, in one walk of one legal studio', () => {
    const seen = new Set(
      everySubject(walkedStudio('c2a-m5-theater-coverage', 18)).map((subject) => subject.kind),
    )
    // §4.2's own list: stages hot/dark, sets mounted/striking, queued work, wrap
    // clearing the stage, companies waiting. Construction has its own test above
    // (it needs a build committed), and scenery-in-transit has its own file
    // (`c2a-m5-scenery-load-in-layout.test.ts` owns the distance mechanic).
    for (const kind of [
      'stage-hot',
      'stage-dark',
      'set-mounting',
      'set-struck',
      'wrap-clearing',
      'company-waiting',
      'queue-waiting',
    ] as const) {
      expect(seen.has(kind), `§4.2 names "${kind}" — it must be reachable`).toBe(true)
    }
  })

  it('shows a SET GOING UP with the weeks its own clock says are left', () => {
    for (const state of walkedStudio('c2a-m5-theater-mounting', 6)) {
      for (const subject of studioWeekTheater(state).subjects) {
        if (subject.kind !== 'set-mounting') continue
        const set = state.sets.find((candidate) => candidate.id === subject.setId)
        expect(set?.status).toBe('under-construction')
        expect(subject.weeksRemaining).toBe(
          Math.max(0, (set!.completesWeek ?? state.market.tick) - state.market.tick),
        )
        expect(subject.facilityId).toBe(set!.mountedOn)
      }
    }
  })

  it('shows QUEUED WORK that names no picture, because there is none to name', () => {
    let queued = 0
    for (const state of walkedStudio('c2a-m5-theater-queue', 8)) {
      const subjects = studioWeekTheater(state).subjects.filter(
        (subject) => subject.kind === 'queue-waiting',
      )
      expect(subjects).toHaveLength(state.productionQueue.length)
      queued += subjects.length
      for (const subject of subjects) {
        // §5 pin 3: a queue row can never carry a production id.
        expect(subject.productionId).toBeNull()
        expect(subject.reason).not.toBeNull()
        expect(subject.beats.every((beat) => beat === 'waiting')).toBe(true)
      }
    }
    expect(queued).toBeGreaterThanOrEqual(1)
  })
})

describe('C2a-M5 §4.2 — the discipline `presence.ts` set', () => {
  it('is CLASS A: the same settled week reads identically, every time', () => {
    for (const state of walkedStudio('c2a-m5-theater-classa', 12)) {
      const once = stableStringify(studioWeekTheater(state))
      const twice = stableStringify(studioWeekTheater(state))
      expect(twice).toBe(once)
    }
  })

  it('is SAVE-NEUTRAL and OUTCOME-NEUTRAL: reading it changes nothing at all', () => {
    let state = pressuredStudio('c2a-m5-theater-neutral')
    for (let i = 0; i < 6; i++) state = advance(state, 1)
    const before = stableStringify(state)
    const rngBefore = stableStringify(state.rngState)
    for (let i = 0; i < 20; i++) studioWeekTheater(state)
    expect(stableStringify(state)).toBe(before)
    expect(stableStringify(state.rngState)).toBe(rngBefore)
    // And a tick taken after twenty reads is the tick that would have been taken
    // after none: the projection is not in the pipeline.
    const readThenTicked = stableStringify(tick(state))
    const ticked = stableStringify(tick(JSON.parse(before) as GameState))
    expect(readThenTicked).toBe(ticked)
  })

  it('CONSUMES ZERO RNG — not even a derived stream (the module names none)', () => {
    // Presence needs a cosmetic stagger and says so; this one has no reason to draw
    // at all, and the strongest form of that claim is that the code cannot.
    //
    // The needles are ASSEMBLED rather than written out, because `hygiene.test.ts`
    // scans every file under `tests/` for the literal and exempts only itself — a
    // test that proves a file is clean must not make its own directory dirty.
    const forbidden = [
      ['Math', 'random'].join('.'),
      ['Date', 'now'].join('.'),
      'setTimeout',
      "from './rng.js'",
      'rngState',
    ]
    for (const needle of forbidden) {
      expect(THEATER_SOURCE.includes(needle), `studioWeekTheater.ts must not name ${needle}`).toBe(
        false,
      )
    }
  })

  it('is NOT IN THE TICK — no pipeline step calls it', () => {
    const tickSource = readFileSync(
      resolve(dirname(fileURLToPath(import.meta.url)), '../src/core/tick.ts'),
      'utf8',
    )
    expect(tickSource).not.toContain('studioWeekTheater')
  })

  it('WITHHOLDS WITH A REASON rather than guessing (law 17/21)', () => {
    // Two facilities claiming one id is contradictory truth. Neither is named.
    let state = pressuredStudio('c2a-m5-theater-withhold')
    const facility = state.operations.facilities[0]!
    const forged: GameState = {
      ...state,
      operations: {
        ...state.operations,
        facilities: [...state.operations.facilities, { ...facility }],
      },
    }
    const projection = studioWeekTheater(forged)
    expect(
      projection.withheld.some(
        (entry) =>
          entry.subjectId === `facility:${facility.id}` &&
          entry.reason === 'duplicate facility record for this id',
      ),
    ).toBe(true)
    // And nothing carries that facility's name as though it were unambiguous.
    for (const subject of projection.subjects) {
      if (subject.facilityId === facility.id) expect(subject.facilityName).toBeNull()
    }
  })

  it('is DETERMINISTIC across identical runs — same seed, same tracks', () => {
    const run = (): string =>
      stableStringify(walkedStudio('c2a-m5-theater-determinism', 10).map(studioWeekTheater))
    expect(run()).toBe(run())
  })
})
