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
// AMENDED (coordinator, plan authority, 2026-09-18, engine landed at
// `c609e0a`): the T1 RED-first version of this file asserted the PRE-S8 gap
// and carried two fixture defects the landed increment now exposes:
//   - `p13bStaffedProject(p13aResearchReady(), ...)` re-recruited `t-sci-00`,
//     already employed by `p13aResearchReady()` — the harness's own doc
//     comment names an `entry`-shaped state (`p13aResearchEntry()`) as its
//     input, never a `ready`-shaped one.
//   - Every rival `ResearchProject` this file forges must name a Laboratory
//     from the RIVAL's own `business.operations.facilities` (the per-studio
//     `StudioContext` the landed law resolves through), never the PLAYER's
//     `state.operations.facilities` — reusing the player's Lab id silently
//     made every rival project's `researchPrerequisiteRefusal` fail on "no
//     Laboratory" regardless of employment, which happened not to surface as
//     a wrong PASS only because the (also broken) renewal fixture below left
//     the pause outcome coincidentally right.
//   - The 1-week forged contract fell inside the shared 12-week renewal
//     window (`TUNING.HIRING_RENEWAL_WINDOW_WEEKS`); `staff()`'s renewal law
//     renewed it before the "expiry" case ever observed a lapse. Split into
//     two cases per the ruling: a genuine RENEWAL (ample cash, real tick,
//     stays active) and a genuine EXPIRY (cash too low to afford the
//     renewal's signing bonus + reserve, so `staff()` skips it and the
//     contract lapses at its own end).
// Every case below is rebuilt against the landed `src/core/rivalResearch.ts`
// and `technology.ts`'s exported `StudioContext`/`studioContext`; every
// asserted REQUIREMENT (identical receipts for identical inputs; the player's
// cash/ledger isolation; expiry pauses; renewal keeps active) is unchanged
// from the plan's own words.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { advanceResearchWeek, researchWeekQuote, studioContext } from '../src/core/technology.js'
import { technologyEntry } from '../src/core/technologyCatalogue.js'
import { generateScientist } from '../src/core/worldgen.js'
import { advanceTo, p13aResearchEntry } from '../src/harness/p13a/fixtures.js'
import { p13bStaffedProject } from '../src/harness/p13b/fixtures.js'
import type { GameState, Talent } from '../src/core/types.js'
import type { HollywoodState, IndustryReceipt, RivalBusiness } from '../src/core/hollywoodTypes.js'
import type { ResearchProject } from '../src/core/technologyTypes.js'
// The rival research step this file names `advanceRivalResearchWeek`
// (the plan never fixes an export identifier for it — see the historical
// premise this file carried at T1) — landed, re-exported from
// src/core/rivalResearch.ts. Called directly in the expiry case below.
import { advanceRivalResearchWeek } from '../src/core/rivalResearch.js'

function bellwether(state: GameState): { hollywood: HollywoodState; business: RivalBusiness } {
  const hollywood = state.hollywood!
  const identity = hollywood.identities.find(s => s.row === 1)!
  const business = hollywood.businesses.find(b => b.studioId === identity.studioId)!
  return { hollywood, business }
}

/** Genuinely reduces one rival's cash (and its current period's closing/movements), the same forging technique tests/p13b-s7-independence.test.ts already relies on for a rival-only fact. */
function withRivalCash(state: GameState, studioId: string, cash: number): GameState {
  const hollywood = structuredClone(state.hollywood)!
  hollywood.businesses = hollywood.businesses.map(b => {
    if (b.studioId !== studioId) return b
    const periods = [...b.account.periods]
    const last = { ...periods[periods.length - 1]! }
    const delta = cash - b.account.cash
    last.movements = { ...last.movements, capacity: last.movements.capacity + delta }
    last.closing = cash
    periods[periods.length - 1] = last
    return { ...b, account: { ...b.account, cash, periods } }
  })
  return { ...state, hollywood }
}

/** Gives one rival business its own abstract Laboratory ({capability:'laboratory', capacity:4} — S8 LAW item 9) with an operational instrument receipt for `technologyId`, resolved through the RIVAL's own StudioContext (never the player's `state.operations`). */
function withRivalLaboratory(state: GameState, business: RivalBusiness, technologyId: 'synchronized-sound' | 'lighting-control-01'): { state: GameState; labId: string } {
  const week = state.market.tick
  const labId = `${business.studioId}:laboratory:0`
  const hollywood = state.hollywood!
  const businesses = hollywood.businesses.map(b => b.studioId === business.studioId
    ? { ...b, operations: { ...b.operations, facilities: [...b.operations.facilities, { id: labId, name: 'Research Laboratory', capability: 'laboratory' as const, capacity: 4 }] } }
    : b)
  const receipt: IndustryReceipt = { eventId: `industry-event-${String(hollywood.nextReceipt)}`, week, studioId: business.studioId, kind: 'instrumentOperational', facilityId: labId, technologyId }
  const receipts = [...hollywood.receipts, receipt]
  return { state: { ...state, hollywood: { ...hollywood, businesses, receipts, nextReceipt: hollywood.nextReceipt + 1 } }, labId }
}

/** Mints `count` real Scientist Talent rows (generateScientist — the same producer researchCandidates uses) and real rival employment contracts for them, active [week, week+termWeeks). Returns the updated state and the minted talent ids. */
function forgeRivalScientists(state: GameState, business: RivalBusiness, count: number, week: number, termWeeks = 208): { state: GameState; talentIds: string[] } {
  const scientists: Talent[] = Array.from({ length: count }, (_, index) => generateScientist(state.seed, `${business.studioId}:scientist-forged-${String(index)}`))
  const hollywood = state.hollywood!
  const startOrdinal = hollywood.employment.length
  const employment = [...hollywood.employment, ...scientists.map(s => ({
    contractId: `${business.studioId}:contract:${s.id}:${String(week)}`, studioId: business.studioId,
    terms: { talentId: s.id, annualSalary: s.salary ?? 60_000, signingBonus: 0, startWeek: week, endWeekExclusive: week + termWeeks, termWeeks },
    endedWeek: null, reason: 'entry' as const,
  }))]
  const activeEmploymentOrdinals = [...hollywood.activeEmploymentOrdinals, ...scientists.map((_, index) => startOrdinal + index)]
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
  it('player-only partition (S8 LAW item 3): advanceResearchWeek returns ONLY the player\'s slice — a rival-owned project contributes nothing to the player\'s cost/entries and is returned untouched', () => {
    const player = p13aResearchEntry()
    const { business } = bellwether(player)
    const { state: withLab, labId } = withRivalLaboratory(player, business, 'synchronized-sound')
    const { state: withScientist, talentIds } = forgeRivalScientists(withLab, business, 1, player.market.tick)
    const rivalProject = forgeRivalProject(business, 'synchronized-sound', labId, talentIds, 10_000, player.market.tick)
    const withRivalProject: GameState = { ...withScientist, technology: { ...withScientist.technology, projects: [...withScientist.technology.projects, rivalProject] } }

    const playerOnly = advanceResearchWeek(player)
    const withRival = advanceResearchWeek(withRivalProject)
    expect(withRival.cost).toBe(playerOnly.cost) // the rival project contributes NOTHING to the player's bill
    expect(withRival.entries.length).toBe(playerOnly.entries.length)
    expect(withRival.entries.some(e => e.note === `research:${rivalProject.id}`)).toBe(false)
    // advanceResearchWeek never advances a non-player project — returned exactly as given.
    expect(withRival.technology.projects.find(p => p.id === rivalProject.id)).toEqual(rivalProject)
  })

  it('identical receipts for identical inputs: the weekly spend for N seats fully funded on technology T is usableBudgetPerScientist*N for BOTH the real player law and the rival, through the SAME researchWeekQuote', () => {
    const { state: playerState, projectId } = p13bStaffedProject(p13aResearchEntry(), 1, 40_000, 4)
    const project = playerState.technology.projects.find(p => p.id === projectId)!
    const playerQuote = researchWeekQuote(playerState, project)
    const entry = technologyEntry('synchronized-sound')
    expect(playerQuote.spend).toBe(entry.usableBudgetPerScientist * 4) // fully funded at 4 seats

    const { business } = bellwether(playerState)
    const { state: withLab, labId } = withRivalLaboratory(playerState, business, 'synchronized-sound')
    const { state: withScientists, talentIds } = forgeRivalScientists(withLab, business, 4, playerState.market.tick)
    const rivalProject = forgeRivalProject(business, 'synchronized-sound', labId, talentIds, 40_000, playerState.market.tick)
    const withRivalProject: GameState = { ...withScientists, technology: { ...withScientists.technology, projects: [...withScientists.technology.projects, rivalProject] } }
    const rivalQuote = researchWeekQuote(withRivalProject, rivalProject)
    expect(rivalQuote.spend).toBe(playerQuote.spend) // identical inputs -> identical weekly spend, through the SAME function
    expect(rivalQuote.output).toBe(playerQuote.output)
  })

  it('renewal (positive case): a rival Scientist\'s contract renews inside the shared 12-week window when cash is ample — the seat, and the project, stay active', () => {
    const base = p13aResearchEntry()
    const { business } = bellwether(base)
    const week = base.market.tick
    const { state: withLab, labId } = withRivalLaboratory(base, business, 'synchronized-sound')
    const { state: withScientist, talentIds } = forgeRivalScientists(withLab, business, 1, week, 1) // termWeeks=1: falls inside the renewal window at week+1
    const talentId = talentIds[0]!
    const rivalProject = forgeRivalProject(business, 'synchronized-sound', labId, talentIds, 10_000, week)
    const withProject: GameState = { ...withScientist, technology: { ...withScientist.technology, projects: [...withScientist.technology.projects, rivalProject] } }

    const nextWeekState = advanceTo(withProject, week + 1) // real tick; ample rival cash — staff() renews
    const renewedRow = nextWeekState.hollywood!.employment.filter(e => e.terms.talentId === talentId).at(-1)!
    expect(renewedRow.reason).toBe('renewal')
    expect(renewedRow.terms.endWeekExclusive).toBeGreaterThan(week + 1) // a fresh full-length term, not the forged 1-week one
    expect(studioContext(nextWeekState, business.studioId).employed(talentId, week + 1)).toBe(true)
    expect(nextWeekState.technology.projects.find(p => p.id === rivalProject.id)?.status).not.toBe('paused')
  }, 30_000)

  it('expiry (negative case): when the rival cannot afford the renewal\'s signing bonus + reserve, the contract lapses at its own end — the seat becomes ineligible, and the project pauses (the same "no eligible seats" law the player\'s own researchAfterEmploymentRelease produces)', () => {
    const base = p13aResearchEntry()
    const { business } = bellwether(base)
    const week = base.market.tick
    const { state: withLab, labId } = withRivalLaboratory(base, business, 'synchronized-sound')
    const { state: withScientist, talentIds } = forgeRivalScientists(withLab, business, 1, week, 1) // termWeeks=1
    const talentId = talentIds[0]!
    const rivalProject = forgeRivalProject(business, 'synchronized-sound', labId, talentIds, 10_000, week)
    const withProject: GameState = { ...withScientist, technology: { ...withScientist.technology, projects: [...withScientist.technology.projects, rivalProject] } }
    // Too little cash for ANY signing bonus plus reserve: staff()'s renewal offer is refused on affordability.
    const poor = withRivalCash(withProject, business.studioId, 1)

    const nextWeekState = advanceTo(poor, week + 1) // real tick; renewal refused on cash — the contract simply expires
    expect(studioContext(nextWeekState, business.studioId).employed(talentId, week + 1)).toBe(false)
    const lapsedProject = nextWeekState.technology.projects.find(p => p.id === rivalProject.id)!
    expect(lapsedProject.status).toBe('paused')
    // Direct confirmation through the exported rival research step itself, not only the emergent tick outcome.
    const directStep = advanceRivalResearchWeek(nextWeekState, business, lapsedProject)
    expect(directStep.technology.projects.find(p => p.id === rivalProject.id)?.status).toBe('paused')
  }, 30_000)

  it('coverage: the player\'s cash and ledger are byte-identical across two states differing only in whether a rival runs active research', () => {
    const base = p13aResearchEntry()
    const { business } = bellwether(base)
    const week = base.market.tick
    const { state: withLab, labId } = withRivalLaboratory(base, business, 'synchronized-sound')
    const { state: withScientists, talentIds } = forgeRivalScientists(withLab, business, 2, week)
    const rivalProject = forgeRivalProject(business, 'synchronized-sound', labId, talentIds, 20_000, week)
    // The rival-research variant differs ONLY in a rival-owned project on the
    // shared technology root plus the rival Laboratory/employment/talent it
    // needs to be real — never in `operations`, `placement` or `studio`.
    const withRivalResearch: GameState = { ...withScientists, technology: { ...withScientists.technology, projects: [...withScientists.technology.projects, rivalProject] } }

    const advancedBase = advanceTo(base, week + 3)
    const advancedVariant = advanceTo(applyActions(withRivalResearch, []), week + 3)
    expect(advancedVariant.studio.cash).toBe(advancedBase.studio.cash)
    expect(JSON.stringify(advancedVariant.ledger)).toBe(JSON.stringify(advancedBase.ledger))
  }, 30_000)
})
