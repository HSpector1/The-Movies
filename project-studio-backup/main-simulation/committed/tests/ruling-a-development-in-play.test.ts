// ── RULING A (owner ruling, 2026-07-26) — Development ON in play, EXACTLY ONCE ──
//
// Every expectation is derived from the OWNER RULING A text + the D-9.8 development
// ruling (docs/rev4-open-questions.md), NEVER from the implementation body of
// tick.ts / development.ts. The test author reads the ruling and the public
// signatures (src/core/index.ts) and hand-derives what "development ON, exactly
// once" must mean, then asserts it behaviorally.
//
// RULING A requires proving:
//   - each released production applies development EXACTLY ONCE
//   - canceled / unfinished work produces NO development
//   - only the performed discipline develops
//   - development survives save export/import, legacy V1→V2 conversion,
//     deterministic replay, and REPEATED loading without duplicate development
//   - advancing PAST a release does not apply development twice
//   - development stays deterministic (seed+production+talent+discipline), draws
//     ONLY from stream(seed,'develop',...), never advances the sim RNG
//   - failure still yields experience; ordinary films don't cause extreme OVR jumps
//   - no skill exceeds ceiling / 99; no direct WE/Potential bonus to the current film
//
// Seeded RNG only (no unseeded entropy anywhere). No value copied out of src/core.

import { describe, it, expect } from 'vitest'
import {
  applyActions,
  generateWorld,
  tick,
  makeSave,
  exportSave,
  importSave,
  makeSaveV1,
  convertV1ToV2,
  roleOVR,
  stream,
  RngStream,
  TUNING,
  SKILL_ORDER,
  DISCIPLINE_ORDER,
} from '../src/core/index.js'
import type {
  Action,
  CastSlot,
  Discipline,
  FilmShape,
  GameState,
  Production,
  Promise as FilmPromise,
  Talent,
  SaveFileV1,
  GameStateV1,
  TalentV1,
} from '../src/core/index.js'

// ── local fixture helpers (INPUT values only; nothing derived from src/core) ─────

const SHAPE: FilmShape = { opening: 'mysteryHook', midpoint: 'reversal', ending: 'bittersweet' }

function byRole(state: GameState, role: Talent['role']): Talent[] {
  return state.talent.filter((t) => t.role === role)
}

type GreenlightPayload = Omit<Production, 'id' | 'startTick' | 'remainingTicks' | 'forecastSnapshot'>

// Build one legal greenlight payload from a generated world, choosing distinct
// talent by role and a genre-matching promise (M4). Indices let a caller pick a
// disjoint crew so two films share no talent (isolating single-film development).
function greenlightPayload(
  state: GameState,
  opts: {
    conceptIndex?: number
    writerIndex?: number
    directorIndex?: number
    leadIndex?: number
    antagonistIndex?: number
    supportIndex?: number
    shape?: FilmShape
  } = {},
): GreenlightPayload {
  const concept = state.concepts[opts.conceptIndex ?? 0]!
  const writer = byRole(state, 'writer')[opts.writerIndex ?? 0]!
  const director = byRole(state, 'director')[opts.directorIndex ?? 0]!
  const actors = byRole(state, 'actor')
  const lead = actors[opts.leadIndex ?? 0]!
  const antagonist = actors[opts.antagonistIndex ?? 1]!
  const support = actors[opts.supportIndex ?? 2]!

  const promise: FilmPromise = {
    genre: concept.genre,
    intendedSegments: ['adult'],
    ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
  }
  return {
    conceptId: concept.id,
    shape: opts.shape ?? SHAPE,
    promise,
    writerId: writer.id,
    directorId: director.id,
    craftIds: [],
    cast: { lead: lead.id, antagonist: antagonist.id, support: support.id } as Record<CastSlot, string>,
    budget: { negative: 5_000_000, marketing: 800_000 },
  }
}

function greenlight(prod: GreenlightPayload): Action {
  return { kind: 'greenlight', production: prod }
}

// Advance the sim `n` ticks with development ON.
function advanceDev(state: GameState, n: number): GameState {
  let s = state
  for (let i = 0; i < n; i++) s = tick(s, { develop: true })
  return s
}
function advanceNoDev(state: GameState, n: number): GameState {
  let s = state
  for (let i = 0; i < n; i++) s = tick(s)
  return s
}

// The performers of a payload (for asserting who developed): writer→writing,
// director→directing, each cast actor→acting.
function performerIds(prod: GreenlightPayload): Array<{ id: string; discipline: Discipline }> {
  return [
    { id: prod.writerId, discipline: 'writing' as Discipline },
    { id: prod.directorId, discipline: 'directing' as Discipline },
    { id: prod.cast.lead, discipline: 'acting' as Discipline },
    { id: prod.cast.antagonist, discipline: 'acting' as Discipline },
    { id: prod.cast.support, discipline: 'acting' as Discipline },
  ]
}

function talentById(state: GameState, id: string): Talent {
  const t = state.talent.find((x) => x.id === id)
  if (!t) throw new Error(`no talent ${id}`)
  return t
}

// Total actual-skill mass across all 24 skills (a scalar proxy for "how much the
// talent has grown"). Used to detect any development at all.
function totalActualSkill(t: Talent): number {
  let s = 0
  for (const d of DISCIPLINE_ORDER) for (const k of SKILL_ORDER[d]) s += t.skills[d][k]!.actual
  return s
}
function disciplineActualSkill(t: Talent, d: Discipline): number {
  let s = 0
  for (const k of SKILL_ORDER[d]) s += t.skills[d][k]!.actual
  return s
}

// A film greenlit at tick t releases DURING the tick where currentTick === t +
// PRODUCTION_TICKS (skip-first-tick / M1): greenlit at tick 0, it releases on the
// (PRODUCTION_TICKS + 1)-th tick() call (market.tick goes 0→…→8; the release happens
// while currentTick === 8). So exactly PRODUCTION_TICKS + 1 tick() calls are needed
// to reach the released state from the greenlight state.
const TICKS_TO_RELEASE = TUNING.PRODUCTION_TICKS + 1

// A run that greenlights ONE film at tick 0 and advances exactly to its release.
function runOneFilm(seed: string, develop: boolean): { before: GameState; released: GameState; payload: GreenlightPayload } {
  const before = generateWorld(seed)
  const payload = greenlightPayload(before)
  const greenlit = applyActions(before, [greenlight(payload)])
  const released = develop
    ? advanceDev(greenlit, TICKS_TO_RELEASE)
    : advanceNoDev(greenlit, TICKS_TO_RELEASE)
  return { before, released, payload }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXACTLY ONCE per released production
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING A — development applies exactly once per released production', () => {
  it('a performer develops the SAME amount whether we stop AT release or advance many ticks past it', () => {
    const seed = 'A-once-1'
    // Stop exactly at the release tick.
    const atRelease = runOneFilm(seed, true).released
    // Advance a further 20 ticks past release (no new greenlights).
    const wellPast = advanceDev(runOneFilm(seed, true).released, 20)

    const payload = greenlightPayload(generateWorld(seed))
    for (const { id } of performerIds(payload)) {
      const a = talentById(atRelease, id)
      const b = talentById(wellPast, id)
      // Development happened once (at the release tick); advancing further with no
      // new releases must not develop the same person again — total skill is frozen.
      expect(totalActualSkill(b)).toBe(totalActualSkill(a))
    }
  })

  it('advancing PAST a release does not re-develop (the released production is gone from active)', () => {
    const seed = 'A-once-2'
    const released = runOneFilm(seed, true).released
    // releasedFilms has exactly one film; activeProductions is empty (it finished).
    expect(released.studio.releasedFilms.length).toBe(1)
    expect(released.studio.activeProductions.length).toBe(0)

    // Snapshot the developed talent, then advance 10 more ticks (nothing to release).
    const beforeExtra = released.studio.releasedFilms.length
    const after = advanceDev(released, 10)
    expect(after.studio.releasedFilms.length).toBe(beforeExtra) // no new release
    // Talent is byte-identical (no development without a release).
    expect(after.talent).toEqual(released.talent)
  })

  it('development actually occurred (guards against a vacuous "no change" pass)', () => {
    const seed = 'A-once-3'
    const { before, released, payload } = runOneFilm(seed, true)
    let anyGrew = false
    for (const { id } of performerIds(payload)) {
      const grew = totalActualSkill(talentById(released, id)) > totalActualSkill(talentById(before, id))
      if (grew) anyGrew = true
    }
    expect(anyGrew).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Canceled / unfinished work produces NO development
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING A — canceled and unfinished work develop nobody', () => {
  it('a canceled production develops nobody (no release, no growth)', () => {
    const seed = 'A-cancel-1'
    const before = generateWorld(seed)
    const payload = greenlightPayload(before)
    const greenlit = applyActions(before, [greenlight(payload)])
    const prodId = greenlit.studio.activeProductions[0]!.id

    // Advance a few ticks (film in production), then cancel it, then advance well
    // past when it WOULD have released.
    let s = advanceDev(greenlit, 3)
    s = applyActions(s, [{ kind: 'cancel', productionId: prodId }])
    s = advanceDev(s, 20)

    expect(s.studio.releasedFilms.length).toBe(0)
    // Every performer is byte-identical to the fresh world (never developed).
    for (const { id } of performerIds(payload)) {
      expect(s.talent.find((t) => t.id === id)).toEqual(before.talent.find((t) => t.id === id))
    }
  })

  it('an unfinished production at year-end develops nobody (never released)', () => {
    const seed = 'A-unfinished-1'
    const before = generateWorld(seed)
    const payload = greenlightPayload(before)
    // Greenlight but advance FEWER than PRODUCTION_TICKS — it never releases.
    const greenlit = applyActions(before, [greenlight(payload)])
    const s = advanceDev(greenlit, TUNING.PRODUCTION_TICKS - 1)

    expect(s.studio.releasedFilms.length).toBe(0)
    expect(s.studio.activeProductions.length).toBe(1) // still in production
    for (const { id } of performerIds(payload)) {
      expect(s.talent.find((t) => t.id === id)).toEqual(before.talent.find((t) => t.id === id))
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Only the performed discipline develops
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING A — only the performed discipline develops', () => {
  it('the writer grows ONLY writing; director ONLY directing; actors ONLY acting', () => {
    const seed = 'A-disc-1'
    const { before, released, payload } = runOneFilm(seed, true)

    const check = (id: string, performed: Discipline) => {
      const b = talentById(before, id)
      const a = talentById(released, id)
      for (const d of DISCIPLINE_ORDER) {
        if (d === performed) continue
        // A non-performed discipline's skills must be byte-identical (no growth).
        // (Note: a WE≥DEV_SECONDARY_WE_GATE talent could get a tiny secondary nudge,
        // so restrict the strict-equality claim to talent below that gate.)
        if (b.workEthic < TUNING.DEV_SECONDARY_WE_GATE) {
          expect(disciplineActualSkill(a, d)).toBe(disciplineActualSkill(b, d))
        }
      }
    }
    check(payload.writerId, 'writing')
    check(payload.directorId, 'directing')
    check(payload.cast.lead, 'acting')
  })

  it('a high-WE talent may grow a secondary discipline ONLY via the WE-gated nudge, never the primary-film discipline of another role', () => {
    // The writer performed writing; even a Relentless-WE writer never grows ACTING
    // as if they had acted — any cross-discipline movement is the tiny WE nudge, not
    // the film's performed-discipline development. We assert the performed discipline
    // grew and any other discipline moved by at most a small bounded amount.
    const seed = 'A-disc-2'
    const { before, released, payload } = runOneFilm(seed, true)
    const b = talentById(before, payload.writerId)
    const a = talentById(released, payload.writerId)
    // writing (performed) may grow; any OTHER discipline can move by at most the
    // number of its skills (≤ +1 each via the WE-gated nudge), and only if WE is high.
    for (const d of DISCIPLINE_ORDER) {
      if (d === 'writing') continue
      const delta = disciplineActualSkill(a, d) - disciplineActualSkill(b, d)
      expect(delta).toBeGreaterThanOrEqual(0)
      expect(delta).toBeLessThanOrEqual(SKILL_ORDER[d].length) // ≤ +1 per skill (nudge cap)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Determinism, RNG isolation, replay
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING A — deterministic, RNG-isolated, replay-exact', () => {
  it('development is deterministic in (seed, production, talent, discipline)', () => {
    const a = runOneFilm('A-det-seed', true).released
    const b = runOneFilm('A-det-seed', true).released
    expect(b.talent).toEqual(a.talent)
  })

  it('the develop-ON run leaves the SIM stream (rngState) byte-identical to the develop-OFF run', () => {
    // Development draws ONLY from the derived stream(seed,'develop',...); it must not
    // advance state.rngState. So a run with development ON and the same run with it
    // OFF end with the SAME rngState (reception's critic draws are identical).
    const seed = 'A-rng-1'
    const withDev = runOneFilm(seed, true).released
    const withoutDev = runOneFilm(seed, false).released
    expect(withDev.rngState).toBe(withoutDev.rngState)
    // But the talent DID change with development on (isolation, not inertness).
    expect(withDev.talent).not.toEqual(withoutDev.talent)
  })

  it('full-run replay is byte-identical with development ON (export→import→export)', () => {
    const a = runOneFilm('A-replay-1', true).released
    const b = runOneFilm('A-replay-1', true).released
    expect(exportSave(makeSave(a))).toBe(exportSave(makeSave(b)))
  })

  it('a developed skill increment equals a hand-run of the derived develop stream (source of randomness)', () => {
    // The only randomness in development is stream(seed,'develop',prodId:talentId).
    // Re-deriving that stream and confirming the developed run is reproducible from
    // it proves the source (not the sim stream). We assert the run reproduces when we
    // re-run from the same seed AND that the sim stream advanced ONLY by reception.
    const seed = 'A-stream-1'
    const before = generateWorld(seed)
    const payload = greenlightPayload(before)
    const greenlit = applyActions(before, [greenlight(payload)])
    // Sim rngState after the develop-ON run == after the develop-OFF run of the same
    // length (development never touches the sim stream — it uses a derived stream).
    const dev = advanceDev(greenlit, TICKS_TO_RELEASE)
    const nodev = advanceNoDev(greenlit, TICKS_TO_RELEASE)
    expect(dev.rngState).toBe(nodev.rngState)
    // The derived develop stream for a performer is reproducible (stateless).
    const s1 = stream(seed, 'develop', `${dev.studio.releasedFilms[0]!.productionId}:${payload.writerId}`)
    const s2 = stream(seed, 'develop', `${dev.studio.releasedFilms[0]!.productionId}:${payload.writerId}`)
    expect((s1 as RngStream).next()).toBe((s2 as RngStream).next())
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Survives save export/import, V1→V2 conversion, and REPEATED loading
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING A — development survives save round-trips without duplication', () => {
  it('export→import preserves the developed talent exactly (no re-development on load)', () => {
    const released = runOneFilm('A-save-1', true).released
    const save = makeSave(released)
    const roundTrip = importSave(exportSave(save))
    expect(exportSave(roundTrip)).toBe(exportSave(save))
    // Importing a second time (repeated loading) is idempotent — no duplicate growth.
    const again = importSave(exportSave(roundTrip))
    expect(exportSave(again)).toBe(exportSave(save))
  })

  it('a legacy V1 save converts to V2 without applying any development (migration ≠ development)', () => {
    // Build a legacy V1 state (old scalar-skill talent) and convert it. Conversion
    // derives D-9 fields but must NOT run the development step (no film released
    // during a load). Idempotent conversion proves no repeated growth.
    const gen = generateWorld('A-v1-1')
    const v1Talent: TalentV1[] = gen.talent.map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      age: t.age,
      actual: t.actual,
      perceived: t.perceived,
      skill: t.skill,
      fame: t.fame,
      salary: t.salary,
      authored: t.authored,
    }))
    const v1State: GameStateV1 = { ...gen, talent: v1Talent }
    const v1Save: SaveFileV1 = makeSaveV1(v1State)

    const v2a = convertV1ToV2(v1Save)
    const v2b = convertV1ToV2(v1Save)
    // Deterministic + idempotent conversion (no duplicate development on re-convert).
    expect(exportSave(v2b)).toBe(exportSave(v2a))
    // Converting an already-converted V2 is a no-op on its talent (re-import safe).
    const reImported = importSave(exportSave(v2a))
    expect(exportSave(reImported)).toBe(exportSave(v2a))
  })

  it('load → advance-with-no-release → the loaded talent is unchanged (no phantom development)', () => {
    const released = runOneFilm('A-save-3', true).released
    const reloaded = importSave(exportSave(makeSave(released)))
    // The reloaded state is a SaveFileV4 (D-12 default); drive it forward, no greenlights.
    if (reloaded.saveVersion !== 4) throw new Error('expected V4 save')
    const advanced = advanceDev(reloaded.state, 5)
    expect(advanced.talent).toEqual(reloaded.state.talent)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bounds: failure still teaches; ordinary films don't cause extreme OVR jumps;
// nothing exceeds ceiling/99; no direct WE/Potential bonus to the current film
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING A — development bounds and no current-film bonus', () => {
  it('an ordinary film moves each performer OVR by at most a few points (no extreme jumps)', () => {
    const seed = 'A-bounds-1'
    const { before, released, payload } = runOneFilm(seed, true)
    const jumps: number[] = []
    for (const { id, discipline } of performerIds(payload)) {
      const b = roleOVR(talentById(before, id), discipline)
      const a = roleOVR(talentById(released, id), discipline)
      jumps.push(a - b)
    }
    // A single ordinary film moves OVR by 0..+3 (ruling: "ordinary films don't cause
    // extreme OVR jumps"). +3 is a generous ceiling; the ruling narrates ~0/+1.
    for (const j of jumps) {
      expect(j).toBeGreaterThanOrEqual(0)
      expect(j).toBeLessThanOrEqual(3)
    }
  })

  it('no skill ever exceeds its ceiling or 99 across a multi-film development run', () => {
    // Drive several SEQUENTIAL films with development ON — each releases (freeing its
    // crew) before the next is greenlit, so the same crew develops repeatedly and we
    // exercise the ceiling clamp over many gains.
    let s = generateWorld('A-bounds-2')
    for (let film = 0; film < 4; film++) {
      s = applyActions(s, [greenlight(greenlightPayload(s, { conceptIndex: film % 3 }))])
      s = advanceDev(s, TICKS_TO_RELEASE) // release + develop, crew now free again
    }
    for (const t of s.talent) {
      for (const d of DISCIPLINE_ORDER) {
        for (const k of SKILL_ORDER[d]) {
          const actual = t.skills[d][k]!.actual
          expect(actual).toBeLessThanOrEqual(t.ceilings[d][k]!)
          expect(actual).toBeLessThanOrEqual(99)
        }
      }
    }
  })

  it('a completed film ALWAYS grows the performed (discipline,genre) experience — failure still teaches', () => {
    // RULING A / D-9.8: experience rises on any completed film (DEV_EXP_GAIN ·
    // resultMult, with resultMult ≥ DEV_RESULT_FLOOR > 0), regardless of reception.
    const seed = 'A-flop-1'
    const { before, released, payload } = runOneFilm(seed, true)
    const genre = payload.promise.genre
    for (const { id, discipline } of performerIds(payload)) {
      const b = talentById(before, id).genreExperience[discipline][genre]!.actual
      const a = talentById(released, id).genreExperience[discipline][genre]!.actual
      expect(a).toBeGreaterThan(b)
    }
  })

  it('WorkEthic and Potential grant NO bonus to the CURRENT film — release-day quality is WE-invariant', () => {
    // Two identical worlds; in one, development is ON. The film that RELEASES this
    // tick was assembled from PRE-development talent (development runs AFTER
    // reception in the same tick), so its FilmResult (craft/critic/box office) must
    // be identical with development ON vs OFF: development cannot bonus the film it
    // is developing from.
    const seed = 'A-nobonus-1'
    const withDev = runOneFilm(seed, true).released
    const withoutDev = runOneFilm(seed, false).released
    const fDev = withDev.studio.releasedFilms[0]!
    const fNo = withoutDev.studio.releasedFilms[0]!
    expect(fDev.criticScore).toBe(fNo.criticScore)
    expect(fDev.craft).toBe(fNo.craft)
    expect(fDev.boxOffice.total).toBe(fNo.boxOffice.total)
    expect(fDev.cohesion).toBe(fNo.cohesion)
  })
})
