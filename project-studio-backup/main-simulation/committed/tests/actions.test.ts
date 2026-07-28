// PHASE-3 test: §3 applyActions — greenlight / cancel / createTalent.
//
// INDEPENDENCE: every expectation below is derived from the contract
// (docs/build-contract.md rev. 4 §2.6/§3/§10/§7 + docs/rev4-open-questions.md
// M1/M15/M16/D-1) and the settled rulings handed to the test author, NEVER from
// the implementation. No value is copied out of src/core/actions.ts (which is not
// read). Fixtures are built from a seeded generateWorld(seed); expectations are
// recomputed through the PUBLIC surface (computeForecast, resolveShape, salaryCurve,
// TUNING) with independently-assembled inputs.
//
// Seeded RNG only — no ambient/unseeded randomness in this file. All randomness enters via
// generateWorld(seed) and the forecast stream keyed on productionId inside
// computeForecast (a public function).

import { describe, it, expect } from 'vitest'
import {
  applyActions,
  generateWorld,
  computeForecast,
  resolveShape,
  roleOVR,
  salaryCurve,
  ROLE_TO_DISCIPLINE,
  TUNING,
} from '../src/core/index.js'
import type {
  Action,
  AuthoredTalentInput,
  CastSlot,
  FilmConcept,
  FilmShape,
  GameState,
  Production,
  Promise as FilmPromise,
  Talent,
} from '../src/core/index.js'
import type { ForecastContext, ForecastInputs } from '../src/core/forecast.js'

// ── Helpers (test-author-chosen fixture VALUES; contract-derived EXPECTATIONS) ──

// A fixed FilmShape — any legal §4 combination is fine; the value is a test choice.
const SHAPE: FilmShape = { opening: 'mysteryHook', midpoint: 'reversal', ending: 'bittersweet' }

function byRole(state: GameState, role: Talent['role']): Talent[] {
  return state.talent.filter((t) => t.role === role)
}

// Pick a concept + distinct talent BY ROLE, with a promise whose genre matches the
// concept (M4 validation) and craftIds empty (D-4). Returns the greenlight payload
// (Omit<Production,'id'|'startTick'|'remainingTicks'|'forecastSnapshot'>).
function buildGreenlightProduction(
  state: GameState,
  opts: {
    conceptIndex?: number
    writerIndex?: number
    directorIndex?: number
    leadIndex?: number
    antagonistIndex?: number
    supportIndex?: number
    craftIds?: string[]
    shape?: FilmShape
  } = {},
): Omit<Production, 'id' | 'startTick' | 'remainingTicks' | 'forecastSnapshot'> {
  const concept = state.concepts[opts.conceptIndex ?? 0]
  const writers = byRole(state, 'writer')
  const directors = byRole(state, 'director')
  const actors = byRole(state, 'actor')

  const writer = writers[opts.writerIndex ?? 0]
  const director = directors[opts.directorIndex ?? 0]
  const lead = actors[opts.leadIndex ?? 0]
  const antagonist = actors[opts.antagonistIndex ?? 1]
  const support = actors[opts.supportIndex ?? 2]

  const promise: FilmPromise = {
    genre: concept.genre, // M4: promise.genre === concept.genre
    intendedSegments: ['adult'],
    ranges: {
      intimacy: [-0.5, 0.5],
      tonalWeight: [-0.5, 0.5],
      kineticEnergy: [-0.5, 0.5],
    },
  }

  return {
    conceptId: concept.id,
    shape: opts.shape ?? SHAPE,
    promise,
    writerId: writer.id,
    directorId: director.id,
    craftIds: opts.craftIds ?? [],
    cast: {
      lead: lead.id,
      antagonist: antagonist.id,
      support: support.id,
    } as Record<CastSlot, string>,
    budget: { negative: 5_000_000, marketing: 800_000 },
  }
}

function talentById(state: GameState, id: string): Talent {
  const t = state.talent.find((x) => x.id === id)
  if (!t) throw new Error(`test fixture: talent ${id} not in world`)
  return t
}

// Independently assemble the ForecastInputs the §5/§7 pipeline reads at greenlight,
// resolving ids against the SAME state the greenlight sees, and deriving shapeEffects
// via the public resolveShape (§4). This is the contract's assembled input — not a
// copy of anything in actions.ts.
function assembleForecastInputs(
  state: GameState,
  prod: Omit<Production, 'id' | 'startTick' | 'remainingTicks' | 'forecastSnapshot'>,
): ForecastInputs {
  const concept = state.concepts.find((c) => c.id === prod.conceptId) as FilmConcept
  return {
    concept,
    // RULING C: the greenlight-LOCKED raw FilmShape is threaded into the perceived
    // path (forecast). Supplying prod.shape makes this independent recompute match
    // what applyActions computed internally (both use the same locked shape).
    shape: prod.shape,
    shapeEffects: resolveShape(prod.shape),
    promise: prod.promise,
    budget: prod.budget,
    writer: talentById(state, prod.writerId),
    director: talentById(state, prod.directorId),
    cast: {
      lead: talentById(state, prod.cast.lead),
      antagonist: talentById(state, prod.cast.antagonist),
      support: talentById(state, prod.cast.support),
    } as Record<CastSlot, Talent>,
    craftHires: prod.craftIds.map((id) => talentById(state, id)),
    market: state.market,
    standing: state.studio.standing,
    era: state.era,
  }
}

function expectedProdId(tick: number): string {
  return `prod-${String(tick).padStart(4, '0')}`
}

// Σ salaries (D-1 debit): writer + director + lead + antagonist + support (+ craft).
// Read from state.talent DATA — allowed (not implementation logic).
function sumSalaries(
  state: GameState,
  prod: Omit<Production, 'id' | 'startTick' | 'remainingTicks' | 'forecastSnapshot'>,
): number {
  const ids = [
    prod.writerId,
    prod.directorId,
    prod.cast.lead,
    prod.cast.antagonist,
    prod.cast.support,
    ...prod.craftIds,
  ]
  return ids.reduce((acc, id) => acc + talentById(state, id).salary, 0)
}

function greenlight(
  prod: Omit<Production, 'id' | 'startTick' | 'remainingTicks' | 'forecastSnapshot'>,
): Action {
  return { kind: 'greenlight', production: prod }
}

// Copy a state with a bumped market.tick (test-only; used to reach later-tick
// greenlights without running tick(), which is not under test here).
function withTick(state: GameState, tick: number): GameState {
  return { ...state, market: { ...state.market, tick } }
}

// ── GREENLIGHT — happy path ────────────────────────────────────────────────────

describe('applyActions — greenlight happy path', () => {
  it('adds exactly one production with contract-derived id/startTick/remainingTicks', () => {
    const state = generateWorld('gl-happy-1')
    const prod = buildGreenlightProduction(state)
    const result = applyActions(state, [greenlight(prod)])

    // exactly one new production (§3; input had zero active)
    expect(result.studio.activeProductions.length).toBe(1)
    const p = result.studio.activeProductions[0]

    // id = prod-<startTick padStart 4> (settled ruling); startTick = current tick (M1)
    expect(p.id).toBe(expectedProdId(state.market.tick))
    expect(p.id).toBe('prod-0000')
    expect(p.startTick).toBe(state.market.tick)

    // remainingTicks initialized to PRODUCTION_TICKS (B2)
    expect(p.remainingTicks).toBe(TUNING.PRODUCTION_TICKS)

    // the payload's own fields are echoed unchanged
    expect(p.conceptId).toBe(prod.conceptId)
    expect(p.writerId).toBe(prod.writerId)
    expect(p.directorId).toBe(prod.directorId)
    expect(p.cast).toEqual(prod.cast)
    expect(p.craftIds).toEqual(prod.craftIds)
  })

  it('forecastSnapshot is a 4-segment Forecast equal to an independent computeForecast', () => {
    const state = generateWorld('gl-happy-2')
    const prod = buildGreenlightProduction(state)
    const result = applyActions(state, [greenlight(prod)])
    const p = result.studio.activeProductions[0]

    // Forecast shape (§7): four segments (one per SegmentId).
    expect(p.forecastSnapshot.segments.length).toBe(4)

    // Independent recompute via the PUBLIC computeForecast, same assembled inputs
    // and ctx {seed, productionId:id, directorId, releasedFilms, concepts}. The
    // forecast stream is keyed on productionId, so the SAME id reproduces the SAME
    // gaussian offset — a genuine re-derivation, not a copy.
    const inputs = assembleForecastInputs(state, prod)
    const ctx: ForecastContext = {
      seed: state.seed,
      productionId: expectedProdId(state.market.tick),
      directorId: prod.directorId,
      releasedFilms: state.studio.releasedFilms, // empty at worldgen (N3)
      concepts: state.concepts,
    }
    const expected = computeForecast(inputs, ctx)
    expect(p.forecastSnapshot).toEqual(expected)
  })

  it('debits cash by negative + marketing + Σ salaries (D-1 ledger)', () => {
    const state = generateWorld('gl-ledger-1')
    const prod = buildGreenlightProduction(state)
    const salaries = sumSalaries(state, prod)
    const expectedDebit = prod.budget.negative + prod.budget.marketing + salaries

    const result = applyActions(state, [greenlight(prod)])
    expect(result.studio.cash).toBe(state.studio.cash - expectedDebit)
  })

  it('allows cash to go negative with no throw (D-1: no insolvency)', () => {
    const state = generateWorld('gl-ledger-neg')
    // Force a debit larger than cash by inflating the budget past INITIAL_CASH.
    const base = buildGreenlightProduction(state)
    const prod = {
      ...base,
      budget: { negative: state.studio.cash + 10_000_000, marketing: 1_000_000 },
    }
    const salaries = sumSalaries(state, prod)
    const expectedDebit = prod.budget.negative + prod.budget.marketing + salaries
    expect(expectedDebit).toBeGreaterThan(state.studio.cash) // fixture actually goes negative

    let result: GameState | undefined
    expect(() => {
      result = applyActions(state, [greenlight(prod)])
    }).not.toThrow()
    expect(result!.studio.cash).toBe(state.studio.cash - expectedDebit)
    expect(result!.studio.cash).toBeLessThan(0)
  })

  it('does NOT touch state.rngState (greenlight draws from the forecast stream, not sim)', () => {
    const state = generateWorld('gl-rng-1')
    const prod = buildGreenlightProduction(state)
    const result = applyActions(state, [greenlight(prod)])
    // Settled ruling + M9: applyActions must not change rngState.
    expect(result.rngState).toBe(state.rngState)
  })

  it('does not mutate the input state (activeProductions length unchanged)', () => {
    const state = generateWorld('gl-immut-1')
    const before = state.studio.activeProductions.length
    const prod = buildGreenlightProduction(state)
    applyActions(state, [greenlight(prod)])
    expect(state.studio.activeProductions.length).toBe(before)
    expect(state.studio.activeProductions.length).toBe(0)
  })
})

// ── GREENLIGHT — M16 rejections (every one must throw) ──────────────────────────

describe('applyActions — greenlight M16 validation rejections', () => {
  it('unknown conceptId throws', () => {
    const state = generateWorld('gl-rej-concept')
    const prod = { ...buildGreenlightProduction(state), conceptId: 'concept-does-not-exist' }
    expect(() => applyActions(state, [greenlight(prod)])).toThrow()
  })

  it('unknown writerId throws', () => {
    const state = generateWorld('gl-rej-writer')
    const prod = { ...buildGreenlightProduction(state), writerId: 'nope-writer' }
    expect(() => applyActions(state, [greenlight(prod)])).toThrow()
  })

  it('unknown directorId throws', () => {
    const state = generateWorld('gl-rej-director')
    const prod = { ...buildGreenlightProduction(state), directorId: 'nope-director' }
    expect(() => applyActions(state, [greenlight(prod)])).toThrow()
  })

  it('unknown cast (lead) id throws', () => {
    const state = generateWorld('gl-rej-cast')
    const base = buildGreenlightProduction(state)
    const prod = { ...base, cast: { ...base.cast, lead: 'nope-actor' } }
    expect(() => applyActions(state, [greenlight(prod)])).toThrow()
  })

  it('unknown craftId throws', () => {
    const state = generateWorld('gl-rej-craft')
    const prod = { ...buildGreenlightProduction(state), craftIds: ['nope-craft'] }
    expect(() => applyActions(state, [greenlight(prod)])).toThrow()
  })

  // ── D-9 / OQ-1 — cross-discipline eligibility (the owner-required change) ──────
  // The prior M16 role-TYPE check ("writerId must be role 'writer'", etc.) is
  // RELAXED to a has-discipline check: every D-9 talent carries all four skill sets,
  // so any-role-in-any-slot is now LEGAL at the applyActions legality layer (D-9
  // "Cross-discipline eligibility"; acceptance-test list: "an actor with usable
  // writing skills can be legally assigned as writer"). These tests assert the NEW
  // contract — a cross-discipline assignment is accepted, NOT rejected — while the
  // engagement-exclusivity and no-double-cast rejections below are UNCHANGED. Each
  // cross-role talent chosen here is otherwise disjoint from the other slots so the
  // test isolates the discipline relaxation from exclusivity/double-cast.
  it('cross-discipline: writerId may be a director-role talent (legal, does not throw)', () => {
    const state = generateWorld('gl-xdisc-w')
    const director = byRole(state, 'director')[3] // disjoint from the default crew/cast
    const prod = { ...buildGreenlightProduction(state), writerId: director.id }
    expect(() => applyActions(state, [greenlight(prod)])).not.toThrow()
    const result = applyActions(state, [greenlight(prod)])
    expect(result.studio.activeProductions.length).toBe(1)
    expect(result.studio.activeProductions[0].writerId).toBe(director.id)
  })

  it('cross-discipline: directorId may be an actor-role talent (legal, does not throw)', () => {
    const state = generateWorld('gl-xdisc-d')
    // an actor NOT already in the cast slots (indices 0,1,2) — isolates discipline
    // relaxation from the no-double-cast rule.
    const actor = byRole(state, 'actor')[5]
    const prod = { ...buildGreenlightProduction(state), directorId: actor.id }
    expect(() => applyActions(state, [greenlight(prod)])).not.toThrow()
    const result = applyActions(state, [greenlight(prod)])
    expect(result.studio.activeProductions[0].directorId).toBe(actor.id)
  })

  it('cross-discipline: a cast slot may be filled by a writer-role talent (legal)', () => {
    const state = generateWorld('gl-xdisc-cast')
    const writer = byRole(state, 'writer')[1] // distinct from the production's writer[0]
    const base = buildGreenlightProduction(state)
    const prod = { ...base, cast: { ...base.cast, support: writer.id } }
    expect(() => applyActions(state, [greenlight(prod)])).not.toThrow()
    const result = applyActions(state, [greenlight(prod)])
    expect(result.studio.activeProductions[0].cast.support).toBe(writer.id)
  })

  it('cross-discipline: a craftId may be an actor-role talent (legal)', () => {
    const state = generateWorld('gl-xdisc-craft')
    const actor = byRole(state, 'actor')[6] // not in cast slots 0,1,2
    const prod = { ...buildGreenlightProduction(state), craftIds: [actor.id] }
    expect(() => applyActions(state, [greenlight(prod)])).not.toThrow()
    const result = applyActions(state, [greenlight(prod)])
    expect(result.studio.activeProductions[0].craftIds).toEqual([actor.id])
  })

  it('same actor in two cast slots throws (M16: no person fills two slots)', () => {
    const state = generateWorld('gl-rej-dup-slot')
    const base = buildGreenlightProduction(state)
    const prod = { ...base, cast: { ...base.cast, support: base.cast.lead } }
    expect(() => applyActions(state, [greenlight(prod)])).toThrow()
  })

  // ── Within-production single-role uniqueness (SETTLED OWNER RULING) ────────────
  // rev4-open-questions.md: "No simultaneous multi-role credits this milestone (a
  // talent fills exactly one role in one production)." Cross-discipline eligibility
  // (OQ-1) makes any talent legal for any single assignment, but the SAME talent
  // may NOT fill two roles inside ONE production — that would develop, salary, and
  // exclusivity-double-count them. Expectations below are derived from the ruling,
  // not the implementation.
  it('same talent as writerId AND cast.lead in one production throws (single-role uniqueness)', () => {
    const state = generateWorld('gl-rej-multi-role')
    const base = buildGreenlightProduction(state)
    // Put the production's writer into the lead cast slot as well. The other two
    // cast slots stay distinct actors, so the ONLY collision is writer↔lead.
    const prod = { ...base, cast: { ...base.cast, lead: base.writerId } }
    expect(() => applyActions(state, [greenlight(prod)])).toThrow()
  })

  it('cross-discipline single-role: an actor-role talent used ONLY as writerId still succeeds', () => {
    // The ruling forbids DUPLICATION within a production, NOT cross-discipline
    // casting. An actor-role talent assigned to exactly one role (writer here),
    // with a fully distinct director, cast, and no craft, must be accepted.
    const state = generateWorld('gl-xdisc-single-role')
    // An actor NOT occupying any of the default cast slots (indices 0,1,2) or any
    // other assigned role — so this talent appears exactly once (as writerId).
    const actor = byRole(state, 'actor')[7]
    const base = buildGreenlightProduction(state)
    const prod = { ...base, writerId: actor.id }
    // Guard: the chosen actor collides with no other assigned slot.
    expect([prod.directorId, prod.cast.lead, prod.cast.antagonist, prod.cast.support]).not.toContain(
      actor.id,
    )
    expect(() => applyActions(state, [greenlight(prod)])).not.toThrow()
    const result = applyActions(state, [greenlight(prod)])
    expect(result.studio.activeProductions.length).toBe(1)
    expect(result.studio.activeProductions[0].writerId).toBe(actor.id)
  })

  it('a normal all-distinct greenlight still succeeds (no over-rejection)', () => {
    const state = generateWorld('gl-all-distinct')
    const prod = buildGreenlightProduction(state)
    // All five assigned ids are distinct by construction (distinct roles/indices).
    const ids = [prod.writerId, prod.directorId, prod.cast.lead, prod.cast.antagonist, prod.cast.support]
    expect(new Set(ids).size).toBe(ids.length)
    expect(() => applyActions(state, [greenlight(prod)])).not.toThrow()
    const result = applyActions(state, [greenlight(prod)])
    expect(result.studio.activeProductions.length).toBe(1)
  })

  it('promise.genre !== concept.genre throws (M4)', () => {
    const state = generateWorld('gl-rej-genre')
    const base = buildGreenlightProduction(state)
    const concept = state.concepts.find((c) => c.id === base.conceptId) as FilmConcept
    const genres: FilmPromise['genre'][] = [
      'comedy',
      'drama',
      'crime',
      'romance',
      'horror',
      'adventure',
    ]
    const wrongGenre = genres.find((g) => g !== concept.genre) as FilmPromise['genre']
    const prod = { ...base, promise: { ...base.promise, genre: wrongGenre } }
    expect(() => applyActions(state, [greenlight(prod)])).toThrow()
  })

  it('exclusivity: a talent already engaged in an active production throws (M16)', () => {
    const state = generateWorld('gl-rej-exclusive')
    const first = buildGreenlightProduction(state)
    const afterFirst = applyActions(state, [greenlight(first)])
    expect(afterFirst.studio.activeProductions.length).toBe(1)

    // Bump the tick so id differs, then greenlight a DISJOINT-except-writer package
    // reusing the first production's writer. Reuse of an engaged talent must throw.
    const bumped = withTick(afterFirst, afterFirst.market.tick + 1)
    const second = buildGreenlightProduction(bumped, {
      writerIndex: 0, // same writer as `first` (both use writers[0]) → engaged
      directorIndex: 1,
      leadIndex: 3,
      antagonistIndex: 4,
      supportIndex: 5,
    })
    expect(second.writerId).toBe(first.writerId) // fixture reuses the engaged talent
    expect(() => applyActions(bumped, [greenlight(second)])).toThrow()
  })

  it('concurrency: greenlight throws when activeProductions.length === MAX_CONCURRENT_PRODUCTIONS', () => {
    const state = generateWorld('gl-rej-concurrency')

    // Reach 2 active with disjoint talent across manually-incremented ticks.
    const g1 = buildGreenlightProduction(state, {
      writerIndex: 0,
      directorIndex: 0,
      leadIndex: 0,
      antagonistIndex: 1,
      supportIndex: 2,
    })
    const s1 = applyActions(state, [greenlight(g1)])

    const s1b = withTick(s1, s1.market.tick + 1)
    const g2 = buildGreenlightProduction(s1b, {
      conceptIndex: 1,
      writerIndex: 1,
      directorIndex: 1,
      leadIndex: 3,
      antagonistIndex: 4,
      supportIndex: 5,
    })
    const s2 = applyActions(s1b, [greenlight(g2)])
    expect(s2.studio.activeProductions.length).toBe(TUNING.MAX_CONCURRENT_PRODUCTIONS)
    expect(TUNING.MAX_CONCURRENT_PRODUCTIONS).toBe(2)

    // A third greenlight (fully disjoint talent) must be rejected on concurrency.
    const s2b = withTick(s2, s2.market.tick + 1)
    const g3 = buildGreenlightProduction(s2b, {
      conceptIndex: 2,
      writerIndex: 2,
      directorIndex: 2,
      leadIndex: 6,
      antagonistIndex: 7,
      supportIndex: 8,
    })
    expect(() => applyActions(s2b, [greenlight(g3)])).toThrow()
  })

  it('two greenlight actions in one applyActions call throws (≤1 greenlight/tick, B3)', () => {
    const state = generateWorld('gl-rej-two-in-one')
    const g1 = buildGreenlightProduction(state, {
      writerIndex: 0,
      directorIndex: 0,
      leadIndex: 0,
      antagonistIndex: 1,
      supportIndex: 2,
    })
    const g2 = buildGreenlightProduction(state, {
      conceptIndex: 1,
      writerIndex: 1,
      directorIndex: 1,
      leadIndex: 3,
      antagonistIndex: 4,
      supportIndex: 5,
    })
    expect(() => applyActions(state, [greenlight(g1), greenlight(g2)])).toThrow()
  })
})

// ── CANCEL (M15) ────────────────────────────────────────────────────────────────

describe('applyActions — cancel (M15)', () => {
  it('valid cancel removes the active production; cash and standing unchanged', () => {
    const state = generateWorld('cancel-1')
    const prod = buildGreenlightProduction(state)
    const afterGreenlight = applyActions(state, [greenlight(prod)])
    expect(afterGreenlight.studio.activeProductions.length).toBe(1)
    const id = afterGreenlight.studio.activeProductions[0].id

    const cashBefore = afterGreenlight.studio.cash
    const standingBefore = afterGreenlight.studio.standing

    const afterCancel = applyActions(afterGreenlight, [{ kind: 'cancel', productionId: id }])

    // production removed
    expect(afterCancel.studio.activeProductions.some((p) => p.id === id)).toBe(false)
    expect(afterCancel.studio.activeProductions.length).toBe(0)
    // M15: already-committed money stays spent (no refund) → cash UNCHANGED by cancel
    expect(afterCancel.studio.cash).toBe(cashBefore)
    // M15: no standing effect
    expect(afterCancel.studio.standing).toEqual(standingBefore)
  })

  it('cancel of an unknown productionId throws', () => {
    const state = generateWorld('cancel-unknown')
    expect(() =>
      applyActions(state, [{ kind: 'cancel', productionId: 'prod-9999' }]),
    ).toThrow()
  })

  it('cancel of a non-active productionId throws', () => {
    const state = generateWorld('cancel-nonactive')
    // No active productions in a fresh world → any cancel targets a non-active id.
    expect(state.studio.activeProductions.length).toBe(0)
    expect(() =>
      applyActions(state, [{ kind: 'cancel', productionId: expectedProdId(0) }]),
    ).toThrow()
  })
})

// ── CREATETALENT (§10) ────────────────────────────────────────────────────────

describe('applyActions — createTalent (§10 / D-9.14 creation budget)', () => {
  // A minimal, WITHIN-BUDGET authored input (D-9.14). Steady tier (cost 12) +
  // Professional work ethic (60 → cost 30·60/99 ≈ 18.2), no bias, no secondary →
  // total ≈ 30.2 ≤ AUTHORED_BUDGET 100. The player never sets skills/fame.
  const authoredInput = (over: Partial<AuthoredTalentInput>): AuthoredTalentInput => ({
    name: 'Authored One',
    role: 'actor',
    age: 41,
    actual: { warmth: 0.3, gravity: -0.4, physicality: 0.7 },
    potentialTier: 'Steady',
    workEthic: 60,
    ...over,
  })

  it('appends one authored talent; fame/authored/perceived=actual, D-9 skill proxy + derived salary', () => {
    const state = generateWorld('ct-1')
    const before = state.talent.length
    const input = authoredInput({})

    const result = applyActions(state, [{ kind: 'createTalent', talent: input }])

    // exactly one appended
    expect(result.talent.length).toBe(before + 1)
    const t = result.talent[result.talent.length - 1]

    // §10 / D-9.14: fame comes from TUNING (player never sets it)
    expect(t.fame).toBe(TUNING.AUTHORED_START_FAME)
    // §10: temperament perceived = actual at creation
    expect(t.perceived).toEqual(t.actual)
    expect(t.actual).toEqual(input.actual)
    // §10: authored = true
    expect(t.authored).toBe(true)
    // D-9.14: WorkEthic is exactly the chosen number (visible, no jitter)
    expect(t.workEthic).toBe(input.workEthic)
    // D-9.13 step 12 / OQ-5: legacy `skill` = roleOVR on the PRIMARY discipline
    // (perceived), NOT the old flat AUTHORED_START_SKILL scalar.
    const primary = ROLE_TO_DISCIPLINE[input.role]
    expect(t.skill).toBe(roleOVR(t, primary))
    // §10 / B7 / D-9.13: salary = salaryCurve(talent) recomputed through the export
    expect(t.salary).toBe(salaryCurve(t))
    // D-9.14: authored talent is not a superstar — the primary OVR starts low
    // (skills centered on AUTHORED_START_OVR 35), well under the elite tiers.
    expect(t.skill).toBeLessThanOrEqual(70)
    // echoed input fields
    expect(t.role).toBe(input.role)
    expect(t.name).toBe(input.name)
    expect(t.age).toBe(input.age)
  })

  it('does NOT touch state.rngState (createTalent is deterministic, no sim draw)', () => {
    const state = generateWorld('ct-rng')
    const input = authoredInput({ name: 'No RNG', role: 'writer', age: 33, actual: { warmth: 0, gravity: 0, physicality: 0 } })
    const result = applyActions(state, [{ kind: 'createTalent', talent: input }])
    expect(result.rngState).toBe(state.rngState)
  })

  it('age below 18 throws (§10 range 18..70)', () => {
    const state = generateWorld('ct-age-lo')
    const input = authoredInput({ name: 'Too Young', role: 'actor', age: 17, actual: { warmth: 0, gravity: 0, physicality: 0 } })
    expect(() => applyActions(state, [{ kind: 'createTalent', talent: input }])).toThrow()
  })

  it('age above 70 throws (§10 range 18..70)', () => {
    const state = generateWorld('ct-age-hi')
    const input = authoredInput({ name: 'Too Old', role: 'actor', age: 71, actual: { warmth: 0, gravity: 0, physicality: 0 } })
    expect(() => applyActions(state, [{ kind: 'createTalent', talent: input }])).toThrow()
  })

  it('created talent fame/skill come from the engine, not the player (no skill/fame input field)', () => {
    // AuthoredTalentInput has no skill/fame fields, so the player cannot set them;
    // fame = AUTHORED_START_FAME and skill = the derived primary-OVR proxy.
    const state = generateWorld('ct-nofields')
    const input = authoredInput({ name: 'From Tuning', role: 'director', age: 50, actual: { warmth: -0.9, gravity: 0.9, physicality: -0.1 } })
    const result = applyActions(state, [{ kind: 'createTalent', talent: input }])
    const t = result.talent[result.talent.length - 1]
    expect(t.fame).toBe(TUNING.AUTHORED_START_FAME)
    expect(t.skill).toBe(roleOVR(t, ROLE_TO_DISCIPLINE[input.role]))
  })
})

// ── createTalent THEN greenlight casting the new talent, in one call ────────────
// Only attempted because it can be constructed cleanly: createTalent(role 'actor')
// appends the talent, and a subsequent greenlight in the SAME actions array can cast
// it. If the engine applies actions in order, the new talent id is resolvable. This
// is a single greenlight (B3 ≤1/tick respected).

describe('applyActions — createTalent then greenlight (same call)', () => {
  it('a greenlight may cast a talent created earlier in the same actions array', () => {
    const state = generateWorld('ct-then-gl')
    const actual = { warmth: 0.2, gravity: 0.1, physicality: -0.3 }
    const castMe: AuthoredTalentInput = {
      name: 'Cast Me',
      role: 'actor',
      age: 30,
      actual,
      potentialTier: 'Steady',
      workEthic: 60,
    }
    // Deterministic authored id is not a settled ruling, so we discover it by first
    // applying createTalent alone and reading the appended talent's id — then reuse
    // that exact id in the combined call (same seed → same id, deterministic engine).
    const solo = applyActions(state, [{ kind: 'createTalent', talent: castMe }])
    const newTalent = solo.talent[solo.talent.length - 1]

    const base = buildGreenlightProduction(state)
    // Cast the newly-created actor into the lead slot; keep antagonist/support distinct.
    const prod = { ...base, cast: { ...base.cast, lead: newTalent.id } }

    const combined = applyActions(state, [
      { kind: 'createTalent', talent: castMe },
      greenlight(prod),
    ])

    // The new talent exists and the greenlight succeeded casting it.
    expect(combined.talent.some((t) => t.id === newTalent.id)).toBe(true)
    expect(combined.studio.activeProductions.length).toBe(1)
    expect(combined.studio.activeProductions[0].cast.lead).toBe(newTalent.id)
  })
})
