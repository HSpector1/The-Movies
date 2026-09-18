// ── P13B-S8 test 2: rival research under the shared law — identical receipts
// for identical inputs, expiry/renewal, player cash/ledger isolation ───────
//
// Requirement-derived from "S8 — Symmetric rival research and finance" scope
// record ("Rival research: the same ResearchProject/seat/receipt law (S1-S2)
// driven by a rival policy... Scientists employed through the shared
// employment law (S1 identity, contracts, expiry); cooperation/splitting as
// the player"), the plan's own "Tests" item 2 ("rival research under the
// shared law (identical receipts for identical inputs vs a player run;
// expiry/renewal)"), and the Audit's S8 LAW items:
//   1. (B6) the research law is generalised IN PLACE per studio through a
//      StudioContext resolver "because the scope requires identical receipts
//      for identical inputs vs a player run".
//   3. (B4/S3) advanceResearchWeek returns entries PARTITIONED by studioId;
//      tick.ts applies only the player's slice to cash/ledger; rival slices
//      are booked per business as researchSpend inside the rival step of
//      advanceHollywoodWeek — "test 2 pins the player's cash/ledger
//      byte-identical with and without rival research" (Coverage addition).
//   8. (S2) staff() gains a scientist role list per the rival policy's open
//      seats; "the same contract length/renewal law; a seat released by
//      contract end through the generalised researchAfterEmploymentRelease."
//
// RED-by-design: `src/core/rivalResearch.ts` does not exist yet.
// `advanceRivalResearchWeek` (this file's own name for "the rival research
// step" — the plan names the step's EXISTENCE and its law, never an export
// identifier) is the import from that new module and is CALLED below, so
// this file fails at module resolution before any test body runs.
//
// PREMISES NAMED:
//   1. Export name `advanceRivalResearchWeek(state, business, project)` is
//      ASSUMED (the plan text never names it); it is assumed to return
//      `{technology, entries, cost}` mirroring the PLAYER
//      `advanceResearchWeek`'s own existing signature in technology.ts,
//      scoped to one rival project for one week.
//   2. "Identical receipts for identical inputs" is tested at the
//      observable weekly `spend` figure: `usableBudgetPerScientist * seats`
//      when the budget ceiling is fully funded (`entry.usableBudgetPerScientist`
//      is a real, exported catalogue fact). The SAME number is obtained
//      through the REAL, existing player-side `researchWeekQuote` for cross-check.
//   3. Expiry/renewal is tested structurally (a lapsed rival Scientist
//      contract with no successor pauses the project), the OUTCOME the
//      player's own private `pausedWithoutEligibleSeats` law already
//      produces ("an active project with no seat left that can work
//      pauses") — asserted on the rival path since that private helper is
//      not itself reachable from a test.
//   4. Rival seat eligibility is resolved through `hollywood.employment`
//      (the StudioContext.employment the Audit names for the rival branch),
//      never `state.contracts` (the player-only root `activeContract` reads
//      today) — this file mints real Scientist Talent rows
//      (`generateScientist`, the same producer `researchCandidates` uses)
//      and real rival employment rows for every rival seat, so a genuine
//      Contract-shaped record backs every seat this file forges.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { researchWeekQuote, advanceResearchWeek } from '../src/core/technology.js'
import { technologyEntry } from '../src/core/technologyCatalogue.js'
import { generateScientist } from '../src/core/worldgen.js'
import { advanceTo, p13aResearchReady } from '../src/harness/p13a/fixtures.js'
import { p13bStaffedProject } from '../src/harness/p13b/fixtures.js'
import type { GameState, Talent } from '../src/core/types.js'
import type { HollywoodState, RivalBusiness } from '../src/core/hollywoodTypes.js'
import type { ResearchProject } from '../src/core/technologyTypes.js'
// RED-by-design: src/core/rivalResearch.ts does not exist yet. This is the
// ONE import from that new module in this file.
import { advanceRivalResearchWeek } from '../src/core/rivalResearch.js'

const SEED = 'p13b-s8-research-01'

function bellwether(state: GameState): { hollywood: HollywoodState; business: RivalBusiness } {
  const hollywood = state.hollywood!
  const identity = hollywood.identities.find(s => s.row === 1)!
  const business = hollywood.businesses.find(b => b.studioId === identity.studioId)!
  return { hollywood, business }
}

/** Mints `count` real Scientist Talent rows (generateScientist — the same producer researchCandidates uses) and real rival employment contracts for them, active [week, week+termWeeks). Returns the updated state and the minted talent ids. */
function forgeRivalScientists(state: GameState, business: RivalBusiness, count: number, week: number, termWeeks = 208): { state: GameState; talentIds: string[] } {
  const scientists: Talent[] = Array.from({ length: count }, (_, i) => generateScientist(state.seed, `${business.studioId}:scientist-forged-${String(i)}`))
  const hollywood = state.hollywood!
  const startOrdinal = hollywood.employment.length
  const employment = [...hollywood.employment, ...scientists.map((s, i) => ({
    contractId: `${business.studioId}:contract:${s.id}:${String(week)}`, studioId: business.studioId,
    terms: { talentId: s.id, annualSalary: s.salary ?? 60_000, signingBonus: 0, startWeek: week, endWeekExclusive: week + termWeeks, termWeeks },
    endedWeek: null, reason: 'entry' as const,
  }))]
  const activeEmploymentOrdinals = [...hollywood.activeEmploymentOrdinals, ...scientists.map((_, i) => startOrdinal + i)]
  const nextState: GameState = { ...state, talent: [...state.talent, ...scientists], hollywood: { ...hollywood, employment, activeEmploymentOrdinals } }
  return { state: nextState, talentIds: scientists.map(s => s.id) }
}

function forgeRivalProject(business: RivalBusiness, technologyId: 'synchronized-sound' | 'lighting-control-01', labId: string, talentIds: string[], budgetPerWeek: number, week: number): ResearchProject {
  return {
    id: `${business.studioId}:research:${technologyId}`, studioId: business.studioId, technologyId,
    laboratoryFacilityId: labId, status: 'active', budgetPerWeek,
    verifiedWork: 0, expenditure: 0, startedWeek: week, completedWeek: null,
    seats: talentIds.map(talentId => ({ talentId, laboratoryFacilityId: labId, assignedWeek: week, releasedWeek: null })),
    weeks: [], legacy: null,
  }
}

describe('P13B-S8 rival research under the shared law: identical receipts, expiry/renewal, player isolation (test 2)', () => {
  it('PRECONDITION (today, pre-S8, real code): advanceResearchWeek aggregates EVERY project\'s spend regardless of studioId — a hand-forged rival project (reusing today\'s ONLY notion of "active contract", state.contracts) is charged exactly as tick.ts would apply it to the PLAYER\'s cash, precisely the B4 defect S8-T2 must partition away', () => {
    const player = p13aResearchReady()
    const { business } = bellwether(player)
    const labId = player.operations.facilities.find(f => f.capability === 'laboratory')!.id
    // Today's eligibility (`eligibleSeatIds` -> `activeContract`) reads ONLY
    // `state.contracts` (player-only) — reusing the player's own already-
    // contracted Scientist is the only way to get a real "active contract"
    // today, and is exactly what demonstrates the absence of any studioId
    // partition in the current engine.
    const playerScientistId = player.talent.find(t => t.role === 'scientist')!.id
    const rivalProject = forgeRivalProject(business, 'synchronized-sound', labId, [playerScientistId], 10_000, player.market.tick)
    const withRivalProject: GameState = { ...player, technology: { ...player.technology, projects: [...player.technology.projects, rivalProject] } }
    const { cost, entries } = advanceResearchWeek(withRivalProject)
    expect(cost).toBeGreaterThan(0) // the rival project earns real spend...
    expect(entries.some(e => e.note === `research:${rivalProject.id}`)).toBe(true)
    // ...and today's tick.ts (technology.ts's own caller, tick.ts:529-531)
    // applies the WHOLE `cost` to `state.studio.cash` with no studioId filter
    // at all — there is no partition today, so this `cost` is exactly what
    // would be wrongly debited from the player for a rival's own research.
  })

  it('identical receipts for identical inputs: the weekly spend for N seats fully funded on technology T is usableBudgetPerScientist*N for BOTH the real player law and the rival step', () => {
    const { state: playerState, projectId } = p13bStaffedProject(p13aResearchReady(), 1, 40_000, 4)
    const project = playerState.technology.projects.find(p => p.id === projectId)!
    const playerQuote = researchWeekQuote(playerState, project)
    const entry = technologyEntry('synchronized-sound')
    expect(playerQuote.spend).toBe(entry.usableBudgetPerScientist * 4) // fully funded at 4 seats

    const { business } = bellwether(playerState)
    const labId = playerState.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const { state: withScientists, talentIds } = forgeRivalScientists(playerState, business, 4, playerState.market.tick)
    const rivalProject = forgeRivalProject(business, 'synchronized-sound', labId, talentIds, 40_000, playerState.market.tick)
    const rivalStep = advanceRivalResearchWeek(withScientists, business, rivalProject)
    const rivalEntry = rivalStep.entries.find(e => e.note === `research:${rivalProject.id}`)
    expect(rivalEntry).toBeDefined()
    expect(-rivalEntry!.amount).toBe(playerQuote.spend) // identical inputs -> identical weekly spend
  })

  it('expiry/renewal: a rival Scientist\'s contract lapsing with no successor pauses the project, the same "no eligible seats" law the player\'s own researchAfterEmploymentRelease produces', () => {
    const player = p13aResearchReady()
    const { business } = bellwether(player)
    const labId = player.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const week = player.market.tick
    // The forged rival contract ends at `week + 1` — genuinely expired by the
    // time the research step is asked about the NEXT boundary.
    const { state: withScientist, talentIds } = forgeRivalScientists(player, business, 1, week, 1)
    const rivalProject = forgeRivalProject(business, 'synchronized-sound', labId, talentIds, 10_000, week)
    const nextWeekState = advanceTo(withScientist, week + 1) // the contract has now lapsed
    const stepAfterExpiry = advanceRivalResearchWeek(nextWeekState, business, rivalProject)
    expect(stepAfterExpiry.technology.projects.find(p => p.id === rivalProject.id)?.status).toBe('paused')
  })

  it('coverage: the player\'s cash and ledger are byte-identical across two states differing only in whether a rival runs active research', () => {
    const base = p13aResearchReady()
    const { business } = bellwether(base)
    const labId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const week = base.market.tick
    const { state: withScientists, talentIds } = forgeRivalScientists(base, business, 2, week)
    const rivalProject = forgeRivalProject(business, 'synchronized-sound', labId, talentIds, 20_000, week)
    // The rival-research variant differs ONLY in a rival-owned project on the
    // shared technology root plus the rival employment/talent it needs to be
    // real — never in `operations`, `placement` or `studio`.
    const withRivalResearch: GameState = { ...withScientists, technology: { ...withScientists.technology, projects: [...withScientists.technology.projects, rivalProject] } }

    const advancedBase = advanceTo(base, week + 3)
    const advancedVariant = advanceTo(applyActions(withRivalResearch, []), week + 3)
    expect(advancedVariant.studio.cash).toBe(advancedBase.studio.cash)
    expect(JSON.stringify(advancedVariant.ledger)).toBe(JSON.stringify(advancedBase.ledger))
  }, 30_000)
})
