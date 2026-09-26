// ── P13B-S8 test 5: the S7 non-leak invariant survives genuine rival
// RESEARCH divergence (not merely rival adoption) ──────────────────────────
//
// Requirement-derived from "S8 — Symmetric rival research and finance" scope
// record ("Forecast invariant (S7): rival research never leaks; the
// announcement stays campaign-clock driven"), the plan's "Tests" item 5 ("S7
// non-leak invariant with rival research present"), and the Refinement
// block's own words: "S7 invariant: technologyForecast/technologyAnnouncements
// are unchanged (pure); the industry page publishes rival research NEVER (no
// research rows, no seat counts, no spend) — only technologyAdopted receipts
// (existing) and the campaign-clock announcement; test 5 UPGRADES S7's
// PARTIAL rival-independence to a genuine one (two campaigns differing in
// rival RESEARCH state publish identical forecast/announcement rows)."
//
// tests/p13b-s7-independence.test.ts's own header names EXACTLY the gap this
// file closes: "Player research/employment cannot yet be varied independently
// of the world seed in this engine (no rival research exists — S8)... this
// file is PARTIAL: it exercises rival technology ADOPTION divergence only,
// and names rival RESEARCH/EMPLOYMENT divergence as the S8 gap this file
// does not close." This file builds that exact divergent pair instead
// (rival RESEARCH — a project, seats, employment, researchSpend — never
// rival adoption) and shows the SAME pure-signature independence holds.
//
// RED-by-design: `src/core/rivalResearch.ts` does not exist yet.
// `advanceRivalResearchWeek` is the import from that new module and is
// CALLED below, so this file fails at module resolution before any test
// body runs. `technologyForecast`/`technologyAnnouncements`
// (technologyDisclosure.ts) are REAL and already exist (S7 landed on this
// branch) — this file's sole RED cause is the new S8 module.
//
// PREMISES NAMED: same `advanceRivalResearchWeek(state, business, project)`
// signature premise as tests/p13b-s8-research.test.ts's header (not
// repeated here in full); rival Scientist seats are minted with
// `generateScientist` and real rival employment rows for the same reason
// named there.

import { beforeAll, describe, expect, it } from 'vitest'
import { generateScientist } from '../src/core/worldgen.js'
import { withTalentProvenance } from '../src/core/aging.js'
import { technologyEntry } from '../src/core/technologyCatalogue.js'
import { technologyAnnouncements, technologyForecast } from '../src/core/technologyDisclosure.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import type { GameState, Talent } from '../src/core/types.js'
import type { HollywoodState, RivalBusiness } from '../src/core/hollywoodTypes.js'
import type { ResearchProject } from '../src/core/technologyTypes.js'
// RED-by-design: src/core/rivalResearch.ts does not exist yet. This is the
// ONE import from that new module in this file.
import { advanceRivalResearchWeek } from '../src/core/rivalResearch.js'

const SEED = 'p13b-s8-nonleak-01'

function bellwether(state: GameState): { hollywood: HollywoodState; business: RivalBusiness } {
  const hollywood = state.hollywood!
  const identity = hollywood.identities.find(s => s.row === 1)!
  const business = hollywood.businesses.find(b => b.studioId === identity.studioId)!
  return { hollywood, business }
}

/** Real rival research divergence: a genuinely staffed, actively spending rival lighting-control-01 project on the rival's OWN abstract Laboratory ({capability:'laboratory', capacity:4} — S8 LAW item 9) — never a rival adoption. */
function withRivalResearch(state: GameState): GameState {
  const { business } = bellwether(state)
  const week = state.market.tick
  const labId = `${business.studioId}:lab-0`
  const scientists: Talent[] = Array.from({ length: 2 }, (_, i) => generateScientist(state.seed, `${business.studioId}:scientist-forged-${String(i)}`))
  const hollywood = state.hollywood!
  const startOrdinal = hollywood.employment.length
  const employment = [...hollywood.employment, ...scientists.map(s => ({
    contractId: `${business.studioId}:contract:${s.id}:${String(week)}`, studioId: business.studioId,
    terms: { talentId: s.id, annualSalary: s.salary ?? 60_000, signingBonus: 0, startWeek: week, endWeekExclusive: week + 208, termWeeks: 208 },
    endedWeek: null, reason: 'entry' as const,
  }))]
  const activeEmploymentOrdinals = [...hollywood.activeEmploymentOrdinals, ...scientists.map((_, i) => startOrdinal + i)]
  const businesses = hollywood.businesses.map(b => b.studioId === business.studioId
    ? { ...b, operations: { ...b.operations, facilities: [...b.operations.facilities, { id: labId, name: 'Research Laboratory', capability: 'laboratory' as const, capacity: 4 }] } }
    : b)
  const project: ResearchProject = {
    id: `${business.studioId}:research:lighting-control-01`, studioId: business.studioId, technologyId: 'lighting-control-01',
    laboratoryFacilityId: labId, status: 'active', budgetPerWeek: 20_000,
    verifiedWork: 0, expenditure: 0, startedWeek: week, completedWeek: null,
    seats: scientists.map(s => ({ talentId: s.id, laboratoryFacilityId: labId, assignedWeek: week, releasedWeek: null })),
    weeks: [], legacy: null,
  }
  const withRoster: GameState = {
    ...state,
    // P14C.4: every live person carries a talentProvenance row (V33+ validator
    // condition, C.1) — the forged Scientists are lawful talent (a rival research
    // append), not just research furniture, so each gets one, via the same
    // floor-then-anchor convention the real append site uses (actions.ts's
    // recruitScientist): `state.talent` stores the floored age, `withTalentProvenance`
    // anchors the row on the exact generated age. This is a lawful append, not a
    // rival RESEARCH fact — it changes nothing the precondition test below checks.
    talent: [...state.talent, ...scientists.map(s => ({ ...s, age: Math.floor(s.age) }))],
    hollywood: { ...hollywood, employment, activeEmploymentOrdinals, businesses },
    technology: { ...state.technology, projects: [...state.technology.projects, project] },
  }
  return scientists.reduce((next, s) => withTalentProvenance(next, s), withRoster)
}

describe('P13B-S8 non-leak: forecast/announcements identical across states differing ONLY in rival RESEARCH state (test 5, upgrades S7\'s PARTIAL to genuine)', () => {
  let base: GameState
  let rivalResearchVariant: GameState

  beforeAll(() => {
    base = advanceTo(p13aGeneratedStudio(SEED), 780) // lighting-control-01's own researchableWeek
    rivalResearchVariant = withRivalResearch(base)
  }, 30_000)

  it('precondition: the rival-research variant genuinely differs from the base world in rival RESEARCH facts only, at the identical week', () => {
    expect(rivalResearchVariant.market.tick).toBe(base.market.tick)
    expect(rivalResearchVariant.technology.projects.length).toBeGreaterThan(base.technology.projects.length)
    expect(rivalResearchVariant).not.toEqual(base)
    // Player-owned roots and the shared chart/announcement clock untouched —
    // only rival research facts (technology.projects, hollywood.employment,
    // hollywood.talent) differ. `talent`/`talentProvenance` also differ (the
    // forged Scientists and their provenance rows), but that is the SAME lawful
    // talent append the roster line above already names, not a second, separate
    // "research" fact — a live person always carries a provenance row (C.1), so
    // appending one without the other would be the actual leak.
    expect(rivalResearchVariant.operations).toEqual(base.operations)
    expect(rivalResearchVariant.placement).toEqual(base.placement)
    expect(rivalResearchVariant.technology.access).toEqual(base.technology.access)
    expect(rivalResearchVariant.technology.adoptions).toEqual(base.technology.adoptions)
    expect(rivalResearchVariant.hollywood!.chart).toEqual(base.hollywood!.chart)
  })

  it('the rival research step is real: driving it once advances the forged project\'s verifiedWork/expenditure without touching the player\'s cash', () => {
    const { business } = bellwether(rivalResearchVariant)
    const project = rivalResearchVariant.technology.projects.find(p => p.studioId === business.studioId)!
    const stepped = advanceRivalResearchWeek(rivalResearchVariant, business, project)
    const advancedProject = stepped.technology.projects.find(p => p.id === project.id)!
    expect(advancedProject.expenditure).toBeGreaterThanOrEqual(project.expenditure)
    expect(rivalResearchVariant.studio.cash).toBe(base.studio.cash) // the player's own cash is never touched by a rival's own step
  })

  it('lighting forecast (windowed) is byte-identical across the two research-divergent states at week 780', () => {
    const entry = technologyEntry('lighting-control-01')
    const fromBase = technologyForecast(entry, base.market.tick)
    const fromVariant = technologyForecast(entry, rivalResearchVariant.market.tick)
    expect(fromVariant).toEqual(fromBase)
    expect(JSON.stringify(fromVariant)).toBe(JSON.stringify(fromBase))
  })

  it('technologyAnnouncements(780) is byte-identical (no research row, no seat count, no spend figure — never published) across the two states', () => {
    const fromBase = technologyAnnouncements(base.market.tick)
    const fromVariant = technologyAnnouncements(rivalResearchVariant.market.tick)
    expect(fromVariant).toEqual(fromBase)
  })

  it('advanced independently to week 900 (past the lighting announcement), the rival-research-only divergence persists in the engine roots but forecasts/announcements still publish byte-identical', () => {
    const base900 = advanceTo(base, 900)
    const variant900 = advanceTo(rivalResearchVariant, 900)
    expect(base900.market.tick).toBe(900)
    expect(variant900.market.tick).toBe(900)
    expect(variant900.operations).toEqual(base900.operations)
    expect(variant900.placement).toEqual(base900.placement)

    const entry = technologyEntry('lighting-control-01')
    const forecastFromBase = technologyForecast(entry, base900.market.tick)
    const forecastFromVariant = technologyForecast(entry, variant900.market.tick)
    expect(forecastFromVariant).toEqual(forecastFromBase)
    expect(forecastFromBase).toEqual({ kind: 'exact', commercialWeek: 936, announcedWeek: 884 })

    const announcementsFromBase = technologyAnnouncements(base900.market.tick)
    const announcementsFromVariant = technologyAnnouncements(variant900.market.tick)
    expect(announcementsFromVariant).toEqual(announcementsFromBase)
    expect(announcementsFromBase).toEqual([{ technologyId: 'lighting-control-01', week: 884 }])
  }, 30_000)
})
