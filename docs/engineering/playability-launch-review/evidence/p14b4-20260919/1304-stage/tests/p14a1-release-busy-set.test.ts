// ── P14 task 1304-C: R2 busy-set release refusal (player) + founding-draft refusal ──
//
// STAGED FILE. Import paths below are written for this file's INTENDED destination,
// `tests/p14a1-release-busy-set.test.ts` (one level below repo root, beside every other
// `tests/*.test.ts`), per the allowed-writes filename in the 1304-C task brief. It is
// physically staged at
// docs/engineering/playability-launch-review/evidence/p14b4-20260919/1304-stage/tests/
// and has NOT been executed, type-checked, or moved from there by this author (IMPLEMENT
// mode: staged test source and evidence; no live-tree edit, no execution — see the task's
// explicit prohibition on running vitest/tsc/node on project code while a broad run,
// gate 1302, is in progress in this worktree).
//
// Requirement source (read in full; RED derived from this text, never from current
// production output):
//   - docs/engineering/p14-preparation-8ef5246a/P14-PREPARATION-COMPANION.md §3.4
//     ("Refusal (recommendation R2)"): "the accepted refusal while a screenplay task is
//     active is kept and extended to every busy-set seat: a director, cast member or
//     craft lead seated on an active production (seats are reserved from greenlight
//     through release) cannot be released until release. ... Release during the founding
//     draft is refused."
//   - §3.6: "Two implementation hazards ride with the charge change and are Core: the
//     versioned termination rule for existing saves (§3.4) and the busy-set refusal (R2)."
//   - docs/engineering/playability-launch-review/evidence/p14b4-20260919/
//     1304-A-release-busy-set-proposal.md ("Proposed law"), independently reviewed KEEP
//     (with three amendments unrelated to the engine law) by
//     1304-B-release-busy-set-plan-review.md, adopted verbatim by
//     1304-F-parent-plan-adoption.md: seat set = productionCompanyTalentIds of
//     state.studio.activeProductions (director + every cast seat + every craft id);
//     research seats NOT added; founding predicate = state.founding !== null; credited-
//     only writers are never seated (employment.ts creditedWriterIds: "CREDIT ONLY —
//     never union this into an availability test").
//   - The P14A.1 T2 coordinator ruling this task is the follow-up to:
//     docs/engineering/playability-launch-review/plans/P14-HEADLESS-PLAN.md:1077, "R2
//     DEFERRED (release refused for the busy set / founding; companion recommendation
//     not in A.1's plan text) — recorded for a follow-up."
//
// CURRENT PRODUCTION FACT (verified directly against src/core/actions.ts, HEAD
// 993e6b01): `applyReleaseTalent` (~:2661) refuses exactly two things — no active
// contract, and an active screenplay-writing task. It has NO seat check and NO founding
// check. `applySignContract`'s founding branch (~:2552) appends a real, releasable
// contract while `state.founding !== null`, and `applyReleaseTalent` never reads
// `state.founding` at all. So every "refused" assertion below is RED against unchanged
// production: today's engine lets a still-seated or still-founding-draft release
// through silently. The "release succeeds after the production releases" and "research
// seat still releasable" and "credited writer still releasable" assertions are NOT new
// law — they are already true today and stay true under R2 (companion §3.4 item 2 /
// employment.ts busyTalentIds vs the narrower productionCompanyTalentIds for research;
// employment.ts creditedWriterIds for writers) — they are included because the plan's
// own Tests list names them as paired requirements, and because two independent
// existing tests already exercise the SAME two carve-outs on unchanged production
// (cited at each case below), so this file's own assertions are a second, focused
// witness rather than an invented claim.
//
// House style for the two NEW refusal reasons: every existing `applyReleaseTalent`
// refusal (and every other action's refusal in this file) throws
// `applyActions: releaseTalent rejected — <reason>` — this prefix is pinned (it is a
// whole-codebase convention, not a choice local to this task); the reason CONTENT is
// asserted only by keyword, since the companion states the RULE ("release during the
// founding draft is refused"; "cannot be released until release") but not a literal
// engine-error sentence — inventing one here would silently fill a gap the parent
// implementer should decide. 1304-A item 5's literal remedy sentence
// ("Release after the picture is released, or recast before shooting.") is a BRIDGE-layer
// reason/remedy pair (`ContractRefusal`), asserted in the companion Bridge file instead.
//
// FIXTURE PRECEDENT (reused, not invented): the sign-roster / commission-set /
// greenlight / walk-to-shooting / walk-to-release sequence below is copied in shape from
// three already-landed, presumably-passing fixtures this task was told to read as
// "existing style": tests/helpers/p14c2c-fixtures.ts (`toScheduledTake` — confirms a
// commissioned Set with no optional setup recipe still reaches remainingTicks 5 within
// 40 ticks), tests/p14b1-first-take.test.ts (`buildScheduledPlayerProduction` — the
// assign+schedule sequence at remainingTicks 5), and tests/bridge-p11-finance.test.ts
// (`releaseFilm` — commit-to-release at remainingTicks 1, then tick to
// `studio.releasedFilms`). None of those three files is imported here (this file must
// stand alone); the sequence is re-derived from public actions only, per the task's
// "no synthetic contract editing" instruction.
//
// PREMISES NOT SATISFIED / STOP-RULE NOTES:
//   - No literal Core engine error string is asserted for either new refusal (see house
//     style note above) — only the shared prefix and a content keyword. The parent's
//     implementation is free to choose the exact sentence.
//   - The credited-writer and research-seat cases are NOT new RED causes (see above);
//     they are retained as paired regression witnesses per the plan's own Tests list,
//     and each cites an existing, independent test that already covers the identical
//     claim on unchanged production (tests/p04a2-writer-credit-law.test.ts:845,
//     tests/p13a-research-employment.test.ts:12-34 — see
//     docs/engineering/playability-launch-review/evidence/p14b4-20260919/
//     1304-release-neighbors.json for the full grep).
//   - This file does not exercise the rival mirror (R3) or any persistence/save change —
//     both explicitly out of scope for 1304-A/F's engine law (R2's own text: "No
//     persistence change... because the refusal is a command-time law").

import { describe, expect, it, beforeAll } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import {
  activeProductionCompanyTalentIds,
  beginFounding,
  FOUNDING_MINIMUMS,
  hiringMarketIds,
  terminationCost,
  weeklySalary,
} from '../src/core/employment.js'
import { stableStringify } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import { generateWorld } from '../src/core/worldgen.js'
import { p13aGeneratedStudio, p13aResearchReady } from '../src/harness/p13a/fixtures.js'
import type { CastSlot, CreativeRole, GameState, SegmentId } from '../src/core/types.js'

const STAGE = 'facility-soundstage-07'

// ── shared fixture-building helpers (re-derived from public actions only) ──────────

/** Walk the rotating hiring market forward until a free-agent candidate of `role`
 * appears, then sign them — mirrors signOneOfRole (tests/p14b1-first-take.test.ts) /
 * signOne (tests/p14b1-promises.test.ts): never assumes week-0 presence. */
function signOneOfRole(state: GameState, role: CreativeRole, termWeeks = 208): { state: GameState; id: string } {
  let next = state
  for (let i = 0; i < 60; i++) {
    const candidates = hiringMarketIds(next, next.market.tick)
    const person = candidates.map((id) => next.talent.find((t) => t.id === id)).find((t) => t?.role === role)
    if (person !== undefined) {
      return { state: applyActions(next, [{ kind: 'signContract', talentId: person.id, termWeeks }]), id: person.id }
    }
    next = tick(next)
  }
  throw new Error(`fixture premise failed: no free-agent ${role} found within 60 weeks`)
}

/** A cash bootstrap before any production choice — mirrors fundTo
 * (tests/p14b1-first-take.test.ts), same 30,000,000 headroom. */
function fundTo(state: GameState, target: number): GameState {
  const delta = target - state.studio.cash
  if (delta === 0) return state
  return {
    ...state,
    studio: { ...state.studio, cash: target },
    ledger: [...state.ledger, {
      week: state.market.tick,
      kind: (delta > 0 ? 'studioRevenue' : 'overhead') as 'studioRevenue' | 'overhead',
      amount: delta,
      note: 'test fixture cash bootstrap',
    }],
  }
}

type Team = { writerId: string; directorId: string; leadId: string; antagonistId: string; supportId: string; craftId: string }

function signTeam(seed: string): { state: GameState; team: Team } {
  let state = p13aGeneratedStudio(seed)
  const writer = signOneOfRole(state, 'writer'); state = writer.state
  const director = signOneOfRole(state, 'director'); state = director.state
  const lead = signOneOfRole(state, 'actor'); state = lead.state
  const antagonist = signOneOfRole(state, 'actor'); state = antagonist.state
  const support = signOneOfRole(state, 'actor'); state = support.state
  const craft = signOneOfRole(state, 'craft'); state = craft.state
  return {
    state,
    team: {
      writerId: writer.id, directorId: director.id, leadId: lead.id,
      antagonistId: antagonist.id, supportId: support.id, craftId: craft.id,
    },
  }
}

function greenlightPayload(state: GameState, team: Team) {
  const concept = state.concepts.find((c) =>
    !state.studio.activeProductions.some((p) => p.conceptId === c.id) &&
    !state.studio.releasedFilms.some((f) => f.conceptId === c.id))!
  const cast: Record<CastSlot, string> = { lead: team.leadId, antagonist: team.antagonistId, support: team.supportId }
  return {
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
    writerId: team.writerId, directorId: team.directorId, cast, craftIds: [team.craftId],
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

type ProductionFixture = {
  /** Every seat reserved, remainingTicks 5, shooting task scheduled — the SEATED premise
   * every "refused while active" case below reads from. */
  preReleaseSeated: GameState
  /** The SAME production, walked (through the same public actions a player has: assign
   * director, schedule the take, commit at remainingTicks 1, keep ticking) all the way
   * into `state.studio.releasedFilms` — the "after release" premise. */
  released: GameState
  team: Team
  productionId: string
}

/**
 * ONE production, built once, read at two points. Mirrors (in shape, not by import)
 * tests/helpers/p14c3-genuine-evidence-fixtures.ts `releaseEvidence` and
 * tests/bridge-p11-finance.test.ts `releaseFilm`: assign when unassigned, schedule when
 * ready, commit at remainingTicks 1, keep ticking until released. Bounded guards throw
 * (never loop silently) if a premise this file depends on stops holding.
 */
function buildProductionFixture(seed: string): ProductionFixture {
  const { state: signedState, team } = signTeam(seed)
  let state = fundTo(signedState, 30_000_000)
  const mounted = state.sets.find((s) => s.mountedOn === STAGE && s.status !== 'retired')
  if (mounted !== undefined) state = applyActions(state, [{ kind: 'strikeSet', setId: mounted.id }])
  state = applyActions(state, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE } }])
  for (let week = 0; week < TUNING.SET_BUILD_WEEKS_BAND_HIGH; week++) state = tick(state)

  state = applyActions(state, [{ kind: 'greenlight', production: greenlightPayload(state, team) }])
  const productionId = state.studio.activeProductions.at(-1)!.id

  state = tick(tick(tick(state))) // greenlight tick: skip; Development -> Pre-production; Pre-production -> Rehearsal
  const rehearsal = state.operations.workflows.find((w) => w.productionId === productionId)
  if (rehearsal === undefined || rehearsal.phase !== 'rehearsal') {
    throw new Error(`fixture premise failed: expected rehearsal, got "${String(rehearsal?.phase)}" at week ${String(state.market.tick)}`)
  }

  for (let guard = 0; state.studio.activeProductions.find((p) => p.id === productionId)!.remainingTicks !== 5; guard++) {
    if (guard > 40) throw new Error('fixture premise failed: remainingTicks never reached 5 within 40 weeks')
    state = tick(state)
  }
  state = applyActions(state, [{ kind: 'assignShootingDirector', productionId, directorId: team.directorId }])
  state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId }])
  const scheduled = state.operations.workflows.find((w) => w.productionId === productionId)!
  if (scheduled.shootingTask?.status !== 'scheduled' || scheduled.blocker !== null) {
    throw new Error(`fixture premise failed: shooting task "${String(scheduled.shootingTask?.status)}" / blocker ${JSON.stringify(scheduled.blocker)}`)
  }
  const preReleaseSeated = state

  for (let count = 0; count < 40; count++) {
    const workflow = state.operations.workflows.find((w) => w.productionId === productionId)
    if (workflow?.phase === 'shooting' && workflow.shootingTask?.status === 'unassigned') {
      state = applyActions(state, [{ kind: 'assignShootingDirector', productionId, directorId: team.directorId }])
    }
    if (state.operations.workflows.find((w) => w.productionId === productionId)?.shootingTask?.status === 'ready') {
      state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId }])
    }
    if (state.studio.activeProductions.find((p) => p.id === productionId)?.remainingTicks === 1) {
      state = applyActions(state, [{ kind: 'commitPictureToRelease', productionId }])
    }
    state = tick(state)
    if (state.studio.releasedFilms.some((f) => f.productionId === productionId)) {
      return { preReleaseSeated, released: state, team, productionId }
    }
  }
  throw new Error('fixture premise failed: production did not reach releasedFilms within 40 additional weeks')
}

function foundingRoster(seed: string) {
  let state = beginFounding(generateWorld(seed))
  const applicants = state.founding!.applicantIds.map((id) => state.talent.find((t) => t.id === id)!)
  let firstSignedActorId: string | undefined
  for (const role of ['actor', 'director', 'writer', 'craft'] as const satisfies readonly CreativeRole[]) {
    const pool = applicants.filter((t) => t.role === role)
    for (const t of pool.slice(0, FOUNDING_MINIMUMS[role])) {
      state = applyActions(state, [{ kind: 'signContract', talentId: t.id, termWeeks: 104 }])
      if (role === 'actor' && firstSignedActorId === undefined) firstSignedActorId = t.id
    }
  }
  const duringFounding = state
  const afterFounding = applyActions(state, [{ kind: 'foundStudio' }])
  return { duringFounding, afterFounding, signedActorId: firstSignedActorId! }
}

/** Cash/ledger/contracts/freeAgents/promises/technology reference-identical after a
 * refused call — the task's named "byte-identical" slices, checked individually so a
 * partial mutation (a real regression class distinct from "wrong refusal") is locatable. */
function assertRefusedNoop(state: GameState, talentId: string, matcher: RegExp): void {
  const cashBefore = state.studio.cash
  const ledgerBefore = state.ledger
  const contractsBefore = state.contracts
  const freeAgentsBefore = state.freeAgents
  const promisesBefore = state.promises
  const technologyBefore = state.technology
  expect(() => applyActions(state, [{ kind: 'releaseTalent', talentId }])).toThrow(matcher)
  expect(state.studio.cash).toBe(cashBefore)
  expect(state.ledger).toBe(ledgerBefore)
  expect(state.contracts).toBe(contractsBefore)
  expect(state.freeAgents).toBe(freeAgentsBefore)
  expect(state.promises).toBe(promisesBefore)
  expect(state.technology).toBe(technologyBefore)
}

describe('P14 1304-C RED: R2 busy-set release refusal (player) + founding-draft refusal', () => {
  let fixture: ProductionFixture

  beforeAll(() => {
    fixture = buildProductionFixture('1304c-release-busy-set-01')
  }, 60_000)

  it('PREMISE: every named seat is genuinely reserved before release, and genuinely cleared after', () => {
    const seated = activeProductionCompanyTalentIds(fixture.preReleaseSeated)
    for (const id of [fixture.team.directorId, fixture.team.leadId, fixture.team.antagonistId, fixture.team.supportId, fixture.team.craftId]) {
      expect(seated.has(id), `fixture premise: ${id} must be seated pre-release`).toBe(true)
    }
    // The writer is credited, never seated (Owner ruling §6 / employment.ts creditedWriterIds).
    expect(seated.has(fixture.team.writerId)).toBe(false)
    const clearedAfterRelease = activeProductionCompanyTalentIds(fixture.released)
    for (const id of [fixture.team.directorId, fixture.team.leadId, fixture.team.antagonistId, fixture.team.supportId, fixture.team.craftId]) {
      expect(clearedAfterRelease.has(id), `fixture premise: ${id} must be cleared once the picture has released`).toBe(false)
    }
  })

  describe.each([
    ['director', () => fixture.team.directorId],
    ['lead', () => fixture.team.leadId],
    ['antagonist', () => fixture.team.antagonistId],
    ['support', () => fixture.team.supportId],
    ['craft', () => fixture.team.craftId],
  ] as const)('seated %s of an active player production', (label, getId) => {
    it(`releasing the ${label} is refused while the production is active; cash/ledger/contracts/freeAgents/promises/technology are unchanged`, () => {
      assertRefusedNoop(
        fixture.preReleaseSeated,
        getId(),
        /^applyActions: releaseTalent rejected —.*(seated|active production)/i,
      )
    })
  })

  it('the credited writer of the SAME active production, with no active screenplay task, is releasable — R2 does not widen writer exclusivity (companion §3.4 / Owner ruling §6; corroborated on unchanged production by tests/p04a2-writer-credit-law.test.ts:845)', () => {
    const { preReleaseSeated, team } = fixture
    const cashBefore = preReleaseSeated.studio.cash
    const week = preReleaseSeated.market.tick
    const contract = preReleaseSeated.contracts.find((c) => c.talentId === team.writerId)!
    const expectedCost = terminationCost(contract, week)
    const released = applyActions(preReleaseSeated, [{ kind: 'releaseTalent', talentId: team.writerId }])
    expect(released.contracts.some((c) => c.talentId === team.writerId)).toBe(false)
    expect(released.freeAgents).toContain(team.writerId)
    expect(released.studio.cash).toBe(cashBefore - expectedCost)
    // The production still names them as its writer — credit survives, unaffected by release.
    const production = released.studio.activeProductions.find((p) => p.id === fixture.productionId)!
    expect(production.writerId).toBe(team.writerId)
  })

  it('the SAME director, released after the production has released, succeeds with charge = weekly × min(remaining, 26) (companion §3.2/§3.4: "after the production releases, the same release succeeds")', () => {
    const { released, team } = fixture
    const week = released.market.tick
    const contract = released.contracts.find((c) => c.talentId === team.directorId)
    expect(contract, 'fixture premise: the director must still hold an active contract post-release').toBeDefined()
    const expectedCost = weeklySalary(contract!.annualSalary) * Math.min(contract!.endWeekExclusive - week, TUNING.HIRING_TERMINATION_CAP_WEEKS)
    expect(expectedCost).toBe(terminationCost(contract!, week)) // the accepted law, restated independently
    const cashBefore = released.studio.cash
    const next = applyActions(released, [{ kind: 'releaseTalent', talentId: team.directorId }])
    expect(next.contracts.some((c) => c.talentId === team.directorId)).toBe(false)
    expect(next.freeAgents).toContain(team.directorId)
    expect(next.studio.cash).toBe(cashBefore - expectedCost)
    const row = next.ledger.find((e) => e.kind === 'termination' && e.talentId === team.directorId)
    expect(row?.amount).toBe(-expectedCost)
  })

  it('a person seated only on an active research seat is still releasable, and research releases the seat as today (companion §3.4 item 2: research is deliberately excluded from the busy set; corroborated on unchanged production by tests/p13a-research-employment.test.ts)', () => {
    let state = p13aResearchReady()
    const project = state.technology.projects[0]!
    state = applyActions(state, [{ kind: 'beginResearch', projectId: project.id, budgetPerWeek: 10_000 }])
    state = tick(state)
    const scientistId = state.talent.find((t) => t.role === 'scientist')!.id
    expect(state.technology.projects[0]!.status).toBe('active')
    const contract = state.contracts.find((c) => c.talentId === scientistId)!
    const expectedCost = terminationCost(contract, state.market.tick)
    const released = applyActions(state, [{ kind: 'releaseTalent', talentId: scientistId }])
    expect(released.studio.cash).toBe(state.studio.cash - expectedCost)
    expect(released.contracts.some((c) => c.talentId === scientistId)).toBe(false)
    expect(released.technology.projects[0]!.status).toBe('paused')
  })

  it('founding draft: release is refused while state.founding is non-null, even for a contract genuinely signed from the applicant pool (companion §3.4: "Release during the founding draft is refused"; genuine gap confirmed by 1304-B Q3: applySignContract\'s founding branch, actions.ts:2552-2568, appends a real releasable contract, and applyReleaseTalent never reads state.founding today)', () => {
    const { duringFounding, signedActorId } = foundingRoster('1304c-founding-refusal-01')
    expect(duringFounding.founding).not.toBeNull()
    assertRefusedNoop(
      duringFounding,
      signedActorId,
      /^applyActions: releaseTalent rejected —.*founding/i,
    )
  })

  it('the SAME founding-signed person, released after foundStudio closes the draft, succeeds', () => {
    const { afterFounding, signedActorId } = foundingRoster('1304c-founding-allow-01')
    expect(afterFounding.founding).toBeNull()
    const contract = afterFounding.contracts.find((c) => c.talentId === signedActorId)!
    const expectedCost = terminationCost(contract, afterFounding.market.tick)
    const cashBefore = afterFounding.studio.cash
    const released = applyActions(afterFounding, [{ kind: 'releaseTalent', talentId: signedActorId }])
    expect(released.contracts.some((c) => c.talentId === signedActorId)).toBe(false)
    expect(released.freeAgents).toContain(signedActorId)
    expect(released.studio.cash).toBe(cashBefore - expectedCost)
  })
})
