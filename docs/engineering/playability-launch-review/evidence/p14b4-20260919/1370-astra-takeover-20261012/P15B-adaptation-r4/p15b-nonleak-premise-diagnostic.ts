// Bounded diagnostic of the unchanged non-leak fixture's premises; no acceptance claim.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { performance } from 'node:perf_hooks'
import { generateScientist } from '/Users/zacheryspector/studio-specialists/p15b/src/core/worldgen.ts'
import { withTalentProvenance } from '/Users/zacheryspector/studio-specialists/p15b/src/core/aging.ts'
import { p13aGeneratedStudio } from '/Users/zacheryspector/studio-specialists/p15b/src/harness/p13a/fixtures.ts'
import { tick } from '/Users/zacheryspector/studio-specialists/p15b/src/core/tick.ts'
import { makeSave, stableStringify } from '/Users/zacheryspector/studio-specialists/p15b/src/core/save.ts'
import { closedWeekOf } from '/Users/zacheryspector/studio-specialists/p15b/src/core/operatingState.ts'
import type { GameState, Talent } from '/Users/zacheryspector/studio-specialists/p15b/src/core/types.ts'
import type { HollywoodState, RivalBusiness } from '/Users/zacheryspector/studio-specialists/p15b/src/core/hollywoodTypes.ts'
import type { ResearchProject } from '/Users/zacheryspector/studio-specialists/p15b/src/core/technologyTypes.ts'
const digest = (value: string) => createHash('sha256').update(value).digest('hex')
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


const fixturePath = '/Users/zacheryspector/studio-specialists/p15b/tests/p13b-s8-nonleak.test.ts'
const expectedFixtureHash = 'dbf0996d9d925d9f3019d68fe3dda14874b52cdaed4a1e724e6f6d419706ae5c'
if (digest(readFileSync(fixturePath, 'utf8')) !== expectedFixtureHash) throw new Error('Fixture source changed')
const output = process.env.P15B_NONLEAK_DIAGNOSTIC_OUTPUT
if (!output) throw new Error('Exact fresh diagnostic output path required')
const SEED = 'p13b-s8-nonleak-01'
const baseStarted = performance.now()
let base = p13aGeneratedStudio(SEED)
while (base.market.tick < 780) {
  base = tick(base)
  if (base.market.tick % 130 === 0) console.log(JSON.stringify({ progressWeek: base.market.tick }))
}
const variant = withRivalResearch(base)
const baseElapsedMs = performance.now() - baseStarted
if (baseElapsedMs > 30_000) throw new Error(`Original beforeAll 30000 ms premise budget exceeded: ${baseElapsedMs}`)
const h = base.hollywood!
function admission(state: GameState) {
  const before = digest(stableStringify(state))
  let error: string | null = null
  try { makeSave(state) } catch (e) { error = e instanceof Error ? e.message : String(e) }
  const after = digest(stableStringify(state))
  if (before !== after) throw new Error('Admission mutated its input')
  return { admitted: error === null, error, beforeSHA256: before, afterSHA256: after }
}
const baseAdmission = admission(base), variantAdmission = admission(variant)
const target = bellwether(base).business.studioId
const closed = closedWeekOf(base)
const observation = {
  kind: 'non-leak original fixture premise diagnostic; not gameplay acceptance', seed: SEED, week: base.market.tick,
  baseElapsedMs, originalBeforeAllBudgetMs: 30_000, fixtureSHA256: expectedFixtureHash, exactHelperSHA256: 'eaf5042a9146722bdf6115cea1440369ab467206852c1ac382eba85d6f033aee',
  originalRow1StudioId: target, originalActualClosure: base.studioClosure.closures.find(c => c.studioId === target) ?? null,
  originalCondition: base.corporateCondition.studios.find(r => r.studioId === target) ?? null,
  baseAdmission, variantAdmission,
  businesses: h.businesses.map(b => ({ studioId: b.studioId,
    row: h.identities.find(i => i.studioId === b.studioId)?.row,
    actualClosedWeek: closed.get(b.studioId) ?? null,
    cash: b.account.cash, costCuttingSince: b.costCutting.since,
    laboratories: b.operations.facilities.filter(f => f.capability === 'laboratory').map(f => ({ id: f.id, capacity: f.capacity })),
    activeScientistIds: h.activeEmploymentOrdinals.map(i => h.employment[i]!).filter(e => e.studioId === b.studioId && base.talent.find(t => t.id === e.terms.talentId)?.role === 'scientist').map(e => e.terms.talentId),
    laboratoryReceiptKinds: h.receipts.filter(r => r.studioId === b.studioId && /laboratory/i.test(r.kind)).map(r => ({ eventId: r.eventId, week: r.week, kind: r.kind })),
    researchProjects: base.technology.projects.filter(p => p.studioId === b.studioId).map(p => ({ id: p.id, status: p.status, startedWeek: p.startedWeek, verifiedWork: p.verifiedWork, expenditure: p.expenditure }))
  })),
  followup: null as null | { baseStopWeek: number; variantStopWeek: number; error: string | null },
}
// Admission precedes any downstream-tick defect claim. No tick of an unadmitted variant.
if (baseAdmission.admitted && variantAdmission.admitted) {
  let a = base, b = variant, error: string | null = null
  try {
    while (a.market.tick < 900) a = tick(a)
    while (b.market.tick < 900) b = tick(b)
  } catch (e) { error = e instanceof Error ? e.message : String(e) }
  observation.followup = { baseStopWeek: a.market.tick, variantStopWeek: b.market.tick, error }
}
writeFileSync(output, JSON.stringify(observation, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ complete: true, seed: SEED, originalRow1StudioId: target,
  actualClosedWeek: closed.get(target) ?? null, baseAdmission: baseAdmission.admitted,
  variantAdmission: variantAdmission.admitted, firstVariantError: variantAdmission.error,
  operatingBusinesses: observation.businesses.filter(b => b.actualClosedWeek === null).length }))
