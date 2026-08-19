// ── §13 agents (RandomAgent + OracleAgent) — INDEPENDENT contract-derived tests ──
//
// SOURCE OF TRUTH: build-contract.md rev. 4 §13 + NORMATIVE docs/rev4-open-questions.md
// + the PM's settled rulings. Every expectation is derived from the contract, NOT from
// agents.ts / candidates.ts (their bodies are NEVER read). Import ONLY the public surface.
//
// Contract basis:
//   §13          — both agents draw from the SAME generated candidate set (B18).
//                  RandomAgent = uniform over candidates. OracleAgent = expected value,
//                  variance excluded, explicitly omniscient.
//   ruling #3    — Oracle = deterministic omniscient noise-free expected-profit argmax,
//                  ties by ascending candidate index (first-seen max).
//   ruling #4    — both agents greenlight iff activeProductions.length < 2.
//   D-1          — profit(film) = boxOffice.total − negative − marketing − Σ salaries
//                  (writer, director, cast). Oracle EV = expected profit (currency).
//   B16          — expected pipeline: §5 with sampled terms removed ⇒ the deterministic
//                  segment centers of forecastCenters feed §5.5 (computeBoxOffice).
//   M9           — RandomAgent draws from stream(seed,'agent',tick); the forecast stream
//                  is separate; the sim stream (state.rngState) is untouched by agents.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  computeBoxOffice,
  forecastCenters,
  generateCandidates,
  generateWorld,
  MARKETING_BUDGET_LEVELS,
  OracleAgent,
  packageReceptionInputs,
  RandomAgent,
  resolveShape,
  RngStream,
  stableStringify,
  stream,
  TUNING,
} from '../src/core/index.js'
import type {
  Action,
  Agent,
  CandidatePackage,
  CastSlot,
  GameState,
  Production,
  Talent,
} from '../src/core/index.js'

// ── helpers ──────────────────────────────────────────────────────────────────

function talentById(state: GameState, id: string): Talent {
  const t = state.talent.find((x) => x.id === id)
  if (!t) throw new Error(`talent not found: ${id}`)
  return t
}

// D-1 salaries: sum the per-production salary (§2.2) of writer + director + 3 cast.
// craft is [] in M0A (D-4), so no craft salary. Read the stored .salary (§2.2 says the
// field IS "per production"), never recompute.
function salarySum(state: GameState, pkg: CandidatePackage): number {
  return (
    talentById(state, pkg.writerId).salary +
    talentById(state, pkg.directorId).salary +
    talentById(state, pkg.cast.lead).salary +
    talentById(state, pkg.cast.antagonist).salary +
    talentById(state, pkg.cast.support).salary
  )
}

// Oracle expected profit for a package via the PUBLIC omniscient pipeline (B16 + D-1):
//   expectedTotal = §5.5 box office over the DETERMINISTIC forecast centers.
//   profit = expectedTotal − negative − marketing − Σ salaries.
function expectedProfit(state: GameState, pkg: CandidatePackage): number {
  const inputs = packageReceptionInputs(state, pkg)
  const centers = forecastCenters(inputs).centers
  const box = computeBoxOffice(
    centers,
    state.market.segments,
    state.market.baseMarketValue,
    state.studio.standing,
    pkg.promise,
    pkg.budget,
    resolveShape(pkg.shape),
  )
  return box.total - pkg.budget.negative - pkg.budget.marketing - salarySum(state, pkg)
}

// Does an emitted greenlight action correspond to a package in the candidate set?
// Match by the identifying fields (conceptId + writer + director + cast + budget).
function matchesSomeCandidate(
  prod: Omit<Production, 'id' | 'startTick' | 'remainingTicks' | 'forecastSnapshot'>,
  pkgs: CandidatePackage[],
): boolean {
  return pkgs.some(
    (p) =>
      p.conceptId === prod.conceptId &&
      p.writerId === prod.writerId &&
      p.directorId === prod.directorId &&
      p.cast.lead === prod.cast.lead &&
      p.cast.antagonist === prod.cast.antagonist &&
      p.cast.support === prod.cast.support &&
      p.budget.negative === prod.budget.negative &&
      p.budget.marketing === prod.budget.marketing,
  )
}

// Identifying content of a package OR a greenlight production (both share these fields).
type PkgLike = {
  conceptId: string
  writerId: string
  directorId: string
  cast: Record<CastSlot, string>
  budget: { negative: number; marketing: number }
  shape: CandidatePackage['shape']
  promise: CandidatePackage['promise']
}
function packageKey(p: PkgLike): string {
  return stableStringify({
    conceptId: p.conceptId,
    writerId: p.writerId,
    directorId: p.directorId,
    cast: p.cast,
    budget: p.budget,
    shape: p.shape,
    promise: p.promise,
  })
}

function greenlightProd(
  a: Action,
): Omit<Production, 'id' | 'startTick' | 'remainingTicks' | 'forecastSnapshot'> {
  if (a.kind !== 'greenlight') throw new Error(`expected greenlight, got ${a.kind}`)
  return a.production
}

// ── §13 both agents: exactly one greenlight from the shared grid (ruling #4) ─────

// C2a-M4 (§11.8, re-based-not-retired): this live precondition consumed the
// deleted cap. It is re-based onto `AGENT_MAX_SLATE` — the agents' own policy
// bound — with the assertion unchanged.
describe('§13 both agents greenlight from the shared candidate grid when active < 2', () => {
  for (const [name, agent] of [
    ['RandomAgent', RandomAgent],
    ['OracleAgent', OracleAgent],
  ] as const) {
    it(`${name}: returns exactly one greenlight whose production is a package in generateCandidates(state,tick)`, () => {
      const state = generateWorld(`agent-one-${name}`)
      expect(state.studio.activeProductions.length).toBeLessThan(TUNING.AGENT_MAX_SLATE)
      const actions = agent.chooseActions(state)
      expect(actions).toHaveLength(1)
      expect(actions[0].kind).toBe('greenlight')

      const pkgs = generateCandidates(state, state.market.tick)
      expect(matchesSomeCandidate(greenlightProd(actions[0]), pkgs)).toBe(true)
    })
  }
})

// ── §13/ruling #4 both agents pass at their policy slate bound ───────────────
//
// C2a-M4 RETIREMENT WITH ITS NAMED SUCCESSOR (charter §11.8 item 8): the subject
// of the predecessor — "the engine refuses the third picture" — is deleted with
// the cap (owner law 1). The successor is the same fixture and the same
// assertion about the thing that still exists: both AGENTS stop at
// `AGENT_MAX_SLATE`, which is a policy bound and never a game law. This is
// exactly what holds the sealed M0A corpus byte-identical across the deletion.

describe('§13 both agents return [] when active === AGENT_MAX_SLATE (2)', () => {
  const SHAPE = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const

  // Reach 2 active by applying two greenlights on manually tick-incremented states,
  // with DISJOINT talent (M16 exclusivity). We construct the greenlights directly from
  // the world's talent — this does NOT read agent/candidate internals.
  function fill2Active(seed: string): GameState {
    const world = generateWorld(seed)
    const shapeEffects = resolveShape(SHAPE)
    const writers = world.talent.filter((t) => t.role === 'writer')
    const directors = world.talent.filter((t) => t.role === 'director')
    const actors = world.talent.filter((t) => t.role === 'actor')

    function mkProd(i: number): Omit<
      Production,
      'id' | 'startTick' | 'remainingTicks' | 'forecastSnapshot'
    > {
      const concept = world.concepts[i]
      const requiredNegative =
        concept.baseNegativeCost * shapeEffects.budgetDemandMultiplier * world.era.costScale
      return {
        conceptId: concept.id,
        shape: SHAPE,
        promise: {
          genre: concept.genre,
          intendedSegments: ['adult'],
          ranges: { intimacy: [-1, 1], tonalWeight: [-1, 1], kineticEnergy: [-1, 1] },
        },
        writerId: writers[i].id,
        directorId: directors[i].id,
        craftIds: [],
        cast: {
          lead: actors[i * 3].id,
          antagonist: actors[i * 3 + 1].id,
          support: actors[i * 3 + 2].id,
        } as Record<CastSlot, string>,
        budget: { negative: requiredNegative, marketing: MARKETING_BUDGET_LEVELS[0] },
      }
    }

    let s = applyActions(world, [{ kind: 'greenlight', production: mkProd(0) }])
    // At most one greenlight per tick (B3); advance a manual tick between them by hand.
    // We only need two active productions to exist; apply the second greenlight after a
    // fresh tick so the clock advances (startTick differs). tick() is public.
    s = { ...s, market: { ...s.market, tick: s.market.tick + 1 } }
    s = applyActions(s, [{ kind: 'greenlight', production: mkProd(1) }])
    return s
  }

  for (const [name, agent] of [
    ['RandomAgent', RandomAgent],
    ['OracleAgent', OracleAgent],
  ] as const) {
    it(`${name}: returns [] at 2 active`, () => {
      const s = fill2Active(`agent-full-${name}`)
      expect(s.studio.activeProductions).toHaveLength(TUNING.AGENT_MAX_SLATE)
      expect(TUNING.AGENT_MAX_SLATE).toBe(2)
      expect(agent.chooseActions(s)).toEqual([])
    })
  }
})

// ── RandomAgent determinism + index derivation (M9) ──────────────────────────

describe('§13 RandomAgent — deterministic uniform draw from stream(seed,agent,tick)', () => {
  it('same state ⇒ same choice; chosen index = floor(stream(seed,agent,tick).next()*500)', () => {
    const state = generateWorld('agent-rand-idx-1')
    const agent = RandomAgent

    const a1 = agent.chooseActions(state)
    const a2 = agent.chooseActions(state)
    expect(stableStringify(a1)).toBe(stableStringify(a2)) // deterministic

    // Recompute the uniform index via the PUBLIC stream (M9: 'agent' purpose, keyed on
    // tick). B18 says both agents receive the identical 500 from generateCandidates.
    const pkgs = generateCandidates(state, state.market.tick)
    const idx = Math.floor(
      stream(state.seed, 'agent', state.market.tick).next() *
        pkgs.length,
    )
    const chosen = greenlightProd(a1[0])
    expect(matchesSomeCandidate(chosen, [pkgs[idx]])).toBe(true)
  })
})

// ── OracleAgent correctness: argmax expected profit, ties by ascending index ─────

describe('§13 OracleAgent — deterministic argmax over expected profit (ruling #3 / D-1)', () => {
  it('chooses the package with max expected profit; ties broken by ascending candidate index', () => {
    const state = generateWorld('agent-oracle-argmax-1')
    const pkgs = generateCandidates(state, state.market.tick)

    // Recompute expected profit for ALL 500 via the PUBLIC omniscient pipeline; take
    // the FIRST-SEEN max (ascending index tie-break) — this is what ruling #3 pins.
    let bestIdx = 0
    let bestProfit = expectedProfit(state, pkgs[0])
    for (let i = 1; i < pkgs.length; i++) {
      const p = expectedProfit(state, pkgs[i])
      if (p > bestProfit) {
        bestProfit = p
        bestIdx = i
      }
    }

    const agent = OracleAgent
    const actions = agent.chooseActions(state)
    expect(actions).toHaveLength(1)
    const chosen = greenlightProd(actions[0])
    // The Oracle's choice must equal the independently-computed argmax package —
    // full identifying content (concept + talent + cast + budget + shape + promise).
    expect(packageKey(chosen)).toBe(packageKey(pkgs[bestIdx]))
  })
})

// ── Oracle ignores the sim stream (isolation) ────────────────────────────────

describe('§13/M9 OracleAgent scoring is sim-stream independent', () => {
  it('Oracle picks the SAME package when only state.rngState differs', () => {
    const base = generateWorld('agent-oracle-iso-1')
    const agent = OracleAgent
    const before = greenlightProd(agent.chooseActions(base)[0])

    // Mutate rngState to a DIFFERENT valid serialized RngStream state (advance a fresh
    // stream a few steps, serialize). Oracle scoring (B16 deterministic pipeline) must
    // not read the sim stream, so the choice is unchanged.
    const s2 = RngStream.fromSeed('a-different-serialized-state')
    for (let i = 0; i < 7; i++) s2.next()
    const perturbed: GameState = { ...base, rngState: s2.serialize() }
    expect(perturbed.rngState).not.toBe(base.rngState)

    const after = greenlightProd(agent.chooseActions(perturbed)[0])
    expect(packageKey(after)).toBe(packageKey(before))
  })

  it('the candidate SET is unchanged when only state.rngState differs', () => {
    const base = generateWorld('agent-oracle-iso-2')
    const s2 = RngStream.fromSeed('another-serialized-state')
    for (let i = 0; i < 3; i++) s2.next()
    const perturbed: GameState = { ...base, rngState: s2.serialize() }
    expect(stableStringify(generateCandidates(perturbed, 0))).toBe(
      stableStringify(generateCandidates(base, 0)),
    )
  })
})

// ── No sim-stream perturbation: agents/candidates don't mutate state.rngState ────

describe('§13/M9 agents and candidate generation leave state.rngState frozen', () => {
  it('chooseActions and generateCandidates do not mutate state.rngState', () => {
    const state = generateWorld('agent-purity-1')
    const before = state.rngState
    RandomAgent.chooseActions(state)
    OracleAgent.chooseActions(state)
    generateCandidates(state, state.market.tick)
    expect(state.rngState).toBe(before)
  })
})

// Load-bearing type reference (keeps the Agent import honest).
const _agentGuard: (a: Agent, s: GameState) => Action[] = (a, s) => a.chooseActions(s)
void _agentGuard
