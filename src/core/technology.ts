import { activeContract, busyTalentIds, canAfford, economyEngaged, weeklySalary } from './employment.js'
import { hasOperationalFacilityInstallation } from './facilityEffects.js'
import { commitFacilityInstallation, queryFacilityInstallation } from './placement.js'
import { campaignDate } from './calendar.js'
import { productionHasBegunFilming, retargetProductionTechnologyChoice, assertProductionTechnologyBindings } from './technologyProduction.js'
import { generateScientist } from './worldgen.js'
import type { GameState, GameStateV20, LedgerEntry, Talent } from './types.js'
import type { ResearchProject, ResearchProjectV1, ResearchSeat, StudioTechnology, StudioTechnologyV1, TechnologyAction, TechnologyAdoption, TechnologyId } from './technologyTypes.js'

/** Candidate S1-A tuning; the campaign clock and P09 completion clock remain authoritative. */
export const SYNCHRONIZED_SOUND = Object.freeze({
  id: 'synchronized-sound' as const, name: 'Synchronized sound', researchableWeek: 260,
  commercialWeek: 416, work: 64, usableBudgetPerScientist: 10_000,
  baseWeeklyOutput: 1, saturatedWeeklyOutput: 1.5, accessCost: 200_000,
  commercialEquipmentCost: 300_000, laterInventorEquipmentCost: 225_000,
  deploymentWeeks: 12,
})
/** Provisional P13B tuning (companion §4: two Labs × four seats). Not Owner-approved balance. */
export const RESEARCH_SCIENTISTS_PER_STUDIO = 8
/** A whole budget dollar earns exactly 1/20,000 of a work unit; all work is kept as that integer numerator. */
const WORK_UNIT = 20_000
const money = (value: number) => '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })

export function initialTechnology(week: number): StudioTechnology {
  return {version: 2, recordingStartedWeek: week, projects: [], access: [], adoptions: [], productions: []}
}
/** The frozen P13A root that a genuine V20 save carries; V19→V20 migration still mints it. */
export function initialTechnologyV1(week: number): StudioTechnologyV1 {
  return {version: 1, recordingStartedWeek: week, projects: [], access: [], adoptions: [], productions: []}
}
/**
 * Governed V20→V21 lift: the one Scientist becomes one seat opened at the migration
 * week; started work becomes an immutable legacy prefix proved by the V20 validator;
 * receipts begin empty. No person, charge, date or completion is invented.
 */
export function liftTechnologyV1(root: StudioTechnologyV1, week: number): StudioTechnology {
  return {...root, version: 2, projects: root.projects.map(({scientistId, ...project}) => ({...project,
    seats: [{talentId: scientistId, laboratoryFacilityId: project.laboratoryFacilityId, assignedWeek: week, releasedWeek: null}],
    weeks: [],
    legacy: project.startedWeek === null ? null : {scientistId, throughWeek: week, verifiedWork: project.verifiedWork, expenditure: project.expenditure}}))}
}

function playerStudioId(state: GameState): string {
  if (!state.hollywood || state.founding !== null || !economyEngaged(state)) {
    throw new Error('Found your studio before opening the Research Laboratory.')
  }
  return state.hollywood.playerStudioId
}
function knownTechnology(id: string): asserts id is TechnologyId {
  if (id !== SYNCHRONIZED_SOUND.id) throw new Error('That technology is not in this catalogue.')
}
export function technologyAccess(state: Pick<GameState, 'technology'>, studioId: string, id: string): boolean {
  if (id !== SYNCHRONIZED_SOUND.id) return false
  return state.technology?.access.some(a => a.studioId === studioId && a.technologyId === id && a.acquiredWeek !== null) ?? false
}
export function playerTechnologyAccess(state: GameState, id: string): boolean {
  return !!state.hollywood && technologyAccess(state, state.hollywood.playerStudioId, id)
}
export function commercialAccessRefusal(state: GameState, studioId: string): string | null {
  if (!state.hollywood?.identities.some(s=>s.studioId===studioId && s.enteredWeek!==null)) return 'That studio has not entered this campaign.'
  if (technologyAccess(state,studioId,SYNCHRONIZED_SOUND.id)) return 'This studio already has synchronized-sound access.'
  if (state.market.tick < SYNCHRONIZED_SOUND.commercialWeek) return `Commercial purchase opens ${campaignDate(SYNCHRONIZED_SOUND.commercialWeek).label}.`
  return null
}

/** Deterministic named recruitment pool: purpose-seeded people, no world RNG draw, existing identities reused (Otto stays first). */
export function researchCandidates(state: Pick<GameState, 'seed' | 'talent'>): Talent[] {
  return Array.from({length: RESEARCH_SCIENTISTS_PER_STUDIO}, (_, index) => {
    const id = `t-sci-${String(index).padStart(2, '0')}`
    return state.talent.find(t => t.id === id) ?? generateScientist(state.seed, id)
  })
}
/** Seats currently held (not released), optionally within one Laboratory. */
export function occupiedSeats(project: ResearchProject, laboratoryFacilityId?: string): ResearchSeat[] {
  return project.seats.filter(s => s.releasedWeek === null && (laboratoryFacilityId === undefined || s.laboratoryFacilityId === laboratoryFacilityId))
}
/** Seats that can work over [week, week+1): held by an employed Scientist. Expired or released seats earn and charge nothing. */
export function eligibleSeatIds(state: GameState, project: ResearchProject, week = state.market.tick): string[] {
  return occupiedSeats(project)
    .filter(s => state.talent.find(t => t.id === s.talentId)?.role === 'scientist' && activeContract(state, s.talentId, week) !== undefined)
    .map(s => s.talentId)
}

function laboratoryRefusal(state: GameState, project: Pick<ResearchProject, 'laboratoryFacilityId'>): string | null {
  const lab = state.operations.facilities.find(f => f.id === project.laboratoryFacilityId && f.capability === 'laboratory')
  if (!lab || lab.capacity < 1) return 'Complete the assigned Research Laboratory first.'
  if (state.placement.facilities.some(p => p.installation?.targetFacilityId === lab.id && p.status === 'underConstruction')) return 'Wait for the Laboratory instrument installation to finish.'
  if (!hasOperationalFacilityInstallation(state, lab.id, 'acoustic-instruments')) return 'Install acoustic instruments in this Laboratory.'
  return null
}
export function researchPrerequisiteRefusal(state: GameState, project: ResearchProject): string | null {
  if (state.market.tick < SYNCHRONIZED_SOUND.researchableWeek) return `Research opens ${campaignDate(SYNCHRONIZED_SOUND.researchableWeek).label}.`
  const physical = laboratoryRefusal(state, project); if (physical) return physical
  if (eligibleSeatIds(state, project).length === 0) return 'Employ and assign a named Scientist.'
  return null
}
export type ResearchWeekQuote = {spend: number; output: number; remainingWeeks: number | null; bottleneck: string; seats: number; seatTalentIds: string[]}
/** Paper formula (P13B document 03): n eligible seats, spend = min(ceiling, 10,000·n), output = n + spend/20,000. */
export function researchWeekQuote(state: GameState, project: ResearchProject): ResearchWeekQuote {
  const refusal = researchPrerequisiteRefusal(state, project)
  const idle = {spend: 0, output: 0, remainingWeeks: null, seats: 0, seatTalentIds: [] as string[]}
  if (project.status !== 'active' || refusal) return {...idle, bottleneck: refusal ?? 'Research is paused. Verified work is retained.'}
  const seatTalentIds = eligibleSeatIds(state, project)
  const seats = seatTalentIds.length
  const usable = SYNCHRONIZED_SOUND.usableBudgetPerScientist * seats
  const spend = Math.min(project.budgetPerWeek, usable)
  if (!canAfford(state, spend).ok) return {...idle, bottleneck: 'Insufficient cash for this week’s usable research budget.'}
  const output = seats + spend / WORK_UNIT
  const who = seats === 1 ? 'One assigned Scientist' : `${seats} assigned Scientists`
  const withWhom = seats === 1 ? 'this Scientist' : `these ${seats} Scientists`
  return {spend, output, seats, seatTalentIds, remainingWeeks: Math.ceil((SYNCHRONIZED_SOUND.work - project.verifiedWork) / output),
    bottleneck: spend >= usable
      ? `${who}: ${money(usable)}/week is usable. A higher budget adds no work and is not charged.`
      : `The research budget limits acceleration. ${money(usable)}/week reaches ${seats * 1.5} work units with ${withWhom}.`}
}
export function weeklyResearchSpend(state: GameState): number {
  if (!economyEngaged(state) || state.founding !== null) return 0
  return (state.technology?.projects ?? []).reduce((sum, p) => sum + researchWeekQuote(state, p).spend, 0)
}
export function weeklyResearchPayroll(state: GameState, week = state.market.tick): number {
  const scientists = new Set(state.talent.filter(t => t.role === 'scientist').map(t => t.id))
  return state.contracts.reduce((sum, c) => sum + (scientists.has(c.talentId) && c.startWeek <= week && week < c.endWeekExclusive ? weeklySalary(c.annualSalary) : 0), 0)
}

function charge(state: GameState, amount: number, note: string): GameState {
  if (amount === 0) return state
  if (!canAfford(state, amount).ok) throw new Error('There is not enough cash for this technology commitment.')
  const row: LedgerEntry = {week: state.market.tick, kind: 'technologyAdoption', amount: -amount, note}
  return {...state, studio: {...state.studio, cash: state.studio.cash - amount}, ledger: [...state.ledger, row]}
}
function changeProject(state: GameState, projectId: string, change: (project: ResearchProject) => ResearchProject): GameState {
  const own = playerStudioId(state)
  const project = state.technology.projects.find(p => p.id === projectId && p.studioId === own)
  if (!project) throw new Error('That research project is absent from this campaign.')
  return {...state, technology: {...state.technology, projects: state.technology.projects.map(p => p === project ? change(p) : p)}}
}
function budget(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0 || value > 1_000_000) throw new Error('Choose a whole-dollar research budget from $0 to $1,000,000 per week.')
  return value
}
/** An active project with no seat left that can work pauses; verified work and seats are retained. */
function pausedWithoutEligibleSeats(state: GameState, project: ResearchProject): ResearchProject {
  return project.status === 'active' && eligibleSeatIds(state, project).length === 0 ? {...project, status: 'paused'} : project
}
/** Early release of an employee: the same pause law, evaluated on the state without that contract. */
export function researchAfterEmploymentRelease(state: GameState, talentId: string): StudioTechnology {
  const without = {...state, contracts: state.contracts.filter(c => c.talentId !== talentId)}
  const projects = state.technology.projects.map(p => pausedWithoutEligibleSeats(without, p))
  return projects.every((p, i) => p === state.technology.projects[i]) ? state.technology : {...state.technology, projects}
}

/** The same eligibility and compatibility law applies to the player and abstract rival plant. */
export function adoptionRefusal(state: GameState, studioId: string, stageId: string, postId: string): string | null {
  const identity = state.hollywood?.identities.find(s => s.studioId === studioId && s.enteredWeek !== null)
  if (!identity) return 'That studio has not entered this campaign.'
  if (!technologyAccess(state, studioId, SYNCHRONIZED_SOUND.id)) return 'Complete synchronized-sound research or purchase access after commercial release.'
  const operations = identity.role === 'player' ? state.operations : state.hollywood!.businesses.find(b => b.studioId === studioId)?.operations
  if (!operations?.facilities.some(f => f.id === stageId && f.capability === 'soundstage')) return 'Select an exact compatible soundstage.'
  if (!operations.facilities.some(f => f.id === postId && f.capability === 'post')) return 'Select an exact Post facility.'
  if (state.technology.adoptions.some(a => a.studioId === studioId && a.stageFacilityId === stageId)) return 'This stage already has a synchronized-sound adoption commitment.'
  return null
}

export function applyTechnologyAction(state: GameState, action: Exclude<TechnologyAction, {kind:'recruitScientist'}>): GameState {
  const own = playerStudioId(state)
  if (action.kind === 'installAcousticInstruments') {
    const request = {blueprintId:'acoustic-instruments',targetFacilityId:action.laboratoryFacilityId}
    const quote = queryFacilityInstallation(state,request)
    if (!quote.ok) throw new Error(quote.unmetRequirements[0]?.reason ?? 'This Laboratory cannot begin instrument installation. Finish its current work and check available funds.')
    return commitFacilityInstallation(state,request)
  }
  if (action.kind === 'assignResearchScientist') {
    const lab = state.operations.facilities.find(f => f.id === action.laboratoryFacilityId && f.capability === 'laboratory')
    if (!lab) throw new Error('Complete this Research Laboratory before assigning its seats.')
    if (state.talent.find(t => t.id === action.scientistId)?.role !== 'scientist' || !activeContract(state, action.scientistId)) throw new Error('Employ this Scientist before assigning a Laboratory seat.')
    if (state.technology.projects.some(p => occupiedSeats(p).some(s => s.talentId === action.scientistId))) throw new Error('This Scientist already holds a Laboratory seat.')
    if (busyTalentIds(state).has(action.scientistId)) throw new Error('This Scientist already has an active assignment.')
    const existing = state.technology.projects.find(p => p.studioId === own && p.technologyId === SYNCHRONIZED_SOUND.id)
    if (existing?.status === 'completed') throw new Error('Synchronized-sound research is complete; its seats accept no further assignment.')
    if (existing && existing.laboratoryFacilityId !== lab.id) throw new Error(`This project is staffed at ${state.operations.facilities.find(f => f.id === existing.laboratoryFacilityId)?.name ?? existing.laboratoryFacilityId}. Seats on a second Laboratory arrive with P13B multiple-Lab allocation.`)
    if (existing && occupiedSeats(existing, lab.id).length >= lab.capacity) throw new Error(`This Laboratory's ${lab.capacity} seats are occupied. Release a seat or review another lawful Laboratory.`)
    const seat: ResearchSeat = {talentId: action.scientistId, laboratoryFacilityId: lab.id, assignedWeek: state.market.tick, releasedWeek: null}
    if (existing) return changeProject(state, existing.id, p => ({...p, seats: [...p.seats, seat]}))
    const project: ResearchProject = {id: `${own}:research:${SYNCHRONIZED_SOUND.id}`, studioId: own, technologyId: SYNCHRONIZED_SOUND.id,
      laboratoryFacilityId: lab.id, status: 'paused', budgetPerWeek: 10_000,
      verifiedWork: 0, expenditure: 0, startedWeek: null, completedWeek: null, seats: [seat], weeks: [], legacy: null}
    return {...state, technology: {...state.technology, projects: [...state.technology.projects, project]}}
  }
  if (action.kind === 'releaseResearchSeat') return changeProject(state, action.projectId, p => {
    const seat = occupiedSeats(p).find(s => s.talentId === action.scientistId)
    if (!seat) throw new Error('This person has no occupied seat on this project.')
    const released = {...p, seats: p.seats.map(s => s === seat ? {...s, releasedWeek: state.market.tick} : s)}
    return pausedWithoutEligibleSeats(state, released)
  })
  if (action.kind === 'beginResearch' || action.kind === 'resumeResearch') return changeProject(state, action.projectId, p => {
    if (p.status === 'completed' || p.status === 'active') throw new Error('This project is already active or complete.')
    const reason = researchPrerequisiteRefusal(state, p); if (reason) throw new Error(reason)
    return {...p, status: 'active', budgetPerWeek: action.kind === 'beginResearch' ? budget(action.budgetPerWeek) : p.budgetPerWeek,
      startedWeek: p.startedWeek ?? state.market.tick}
  })
  if (action.kind === 'setResearchBudget') return changeProject(state, action.projectId, p => {
    if (p.status === 'completed') throw new Error('Completed research has no active budget.')
    return {...p, budgetPerWeek: budget(action.budgetPerWeek)}
  })
  if (action.kind === 'pauseResearch' || action.kind === 'cancelResearch') return changeProject(state, action.projectId, p => {
    if (p.status === 'completed' || p.status === 'cancelled' && action.kind === 'cancelResearch') throw new Error('This research project is already closed.')
    return {...p, status: action.kind === 'pauseResearch' ? 'paused' : 'cancelled'}
  })
  if (action.kind === 'waitForTechnology' || action.kind === 'purchaseTechnology') {
    knownTechnology(action.technologyId)
    if (technologyAccess(state, own, action.technologyId)) throw new Error('This studio already has synchronized-sound access.')
    if (action.kind === 'purchaseTechnology') {const refusal=commercialAccessRefusal(state,own);if(refusal)throw new Error(refusal)}
    const purchase = action.kind === 'purchaseTechnology'
    const prior = state.technology.access.find(a => a.studioId === own && a.technologyId === action.technologyId)
    if (!purchase && prior?.route === 'wait') throw new Error('This studio is already waiting for commercial release.')
    const paid = purchase ? charge(state, SYNCHRONIZED_SOUND.accessCost, `technology-access:${own}:${action.technologyId}`) : state
    return {...paid, technology: {...paid.technology, access: [...paid.technology.access.filter(a => a !== prior), {
      studioId: own, technologyId: action.technologyId, route: purchase ? 'purchase' : 'wait', chosenWeek: state.market.tick,
      acquiredWeek: purchase ? state.market.tick : null, accessCost: purchase ? SYNCHRONIZED_SOUND.accessCost : 0, researchProjectId: null}]}}
  }
  if (action.kind === 'adoptSynchronizedSound') {
    const refusal = adoptionRefusal(state, own, action.stageFacilityId, action.postFacilityId)
    if (refusal) throw new Error(refusal)
    const access = state.technology.access.find(a => a.studioId === own && a.acquiredWeek !== null)!
    const inventor = access.route === 'research'
    const prototypeUsed = state.technology.adoptions.some(a => a.studioId === own && a.prototypeProjectId !== null)
    const equipmentCost = inventor ? prototypeUsed ? SYNCHRONIZED_SOUND.laterInventorEquipmentCost : 0 : SYNCHRONIZED_SOUND.commercialEquipmentCost
    const id = `${own}:sound-adoption:${state.technology.adoptions.filter(a => a.studioId === own).length}`
    const stageQuote = queryFacilityInstallation(state, {blueprintId:'synchronized-sound-stage', targetFacilityId:action.stageFacilityId})
    const postAlready = hasOperationalFacilityInstallation(state, action.postFacilityId, 'synchronized-sound-post')
    const postQuote = postAlready ? null : queryFacilityInstallation(state, {blueprintId:'synchronized-sound-post', targetFacilityId:action.postFacilityId})
    if (!stageQuote.ok || postQuote && !postQuote.ok) throw new Error('The selected stage or Post cannot begin installation. Finish its current work first.')
    if (!canAfford(state, equipmentCost + stageQuote.cost + (postQuote?.cost ?? 0)).ok) throw new Error('There is not enough cash for the complete stage, capture and Post installation commitment.')
    let next = charge(state, equipmentCost, `technology-equipment:${id}`)
    const before = new Set(next.placement.facilities.map(p => p.projectId))
    next = commitFacilityInstallation(next, {blueprintId:'synchronized-sound-stage', targetFacilityId:action.stageFacilityId})
    if (!postAlready) next = commitFacilityInstallation(next, {blueprintId:'synchronized-sound-post', targetFacilityId:action.postFacilityId})
    const row: TechnologyAdoption = {id, studioId:own, technologyId:SYNCHRONIZED_SOUND.id,
      stageFacilityId:action.stageFacilityId, postFacilityId:action.postFacilityId, route:inventor?'research':'purchase',
      committedWeek:state.market.tick, operationalWeek:null, equipmentCost,
      installationCost:stageQuote.cost + (postQuote?.cost ?? 0),
      physicalProjectIds:next.placement.facilities.filter(p => !before.has(p.projectId)).map(p => p.projectId),
      prototypeProjectId:inventor && !prototypeUsed ? access.researchProjectId : null}
    return {...next, technology:{...next.technology, adoptions:[...next.technology.adoptions,row]}}
  }
  if (action.kind === 'setProductionTechnology') {
    const p = state.studio.activeProductions.find(p => p.id === action.productionId)
    if (!p) throw new Error('That production is not active in this campaign.')
    const previous = state.technology.productions.find(r => r.productionId === p.id && r.studioId === own)
    if (productionHasBegunFilming(state, p.id)) throw new Error('This film has entered the filming phase. Technology locks at phase entry, before the first take, and cannot be changed.')
    const adoption = state.technology.adoptions.find(a => a.id === action.adoptionId && a.studioId === own && a.operationalWeek !== null)
    if (action.method === 'synchronized-dialogue' && !adoption) throw new Error('Complete the selected synchronized stage, compatible capture and Post chain first.')
    if (action.method === 'silent' && action.adoptionId !== null) throw new Error('A silent production does not select a sound installation.')
    const selected = action.method === 'synchronized-dialogue' ? retargetProductionTechnologyChoice(state,p.id,action.adoptionId!) : state
    return {...selected, technology:{...selected.technology, productions:[...selected.technology.productions.filter(r => r !== previous),
      {studioId:own, productionId:p.id, method:action.method, adoptionId:action.adoptionId, lockedWeek:null}]}}
  }
  const impossible: never = action
  throw new Error(`Unknown technology action: ${JSON.stringify(impossible)}`)
}

/** Beginning-of-week research inputs; availability is stamped at the next boundary. One receipt per worked project week. */
export function advanceResearchWeek(state: GameState): {technology: StudioTechnology; entries: LedgerEntry[]; cost: number} {
  const entries: LedgerEntry[] = [], access = [...state.technology.access]
  const nextWeek = state.market.tick + 1
  const projects = state.technology.projects.map(p => {
    const quote = researchWeekQuote(state, p)
    const staffedNextWeek = eligibleSeatIds(state, p, nextWeek).length > 0
    if (quote.output === 0) return p.status === 'active' && !staffedNextWeek ? {...p, status: 'paused' as const} : p
    if (quote.spend > 0) entries.push({week:state.market.tick, kind:'researchSpend', amount:-quote.spend, note:`research:${p.id}`})
    const before = Math.round(p.verifiedWork * WORK_UNIT)
    const units = Math.min(quote.seats * WORK_UNIT + quote.spend, SYNCHRONIZED_SOUND.work * WORK_UNIT - before)
    const verifiedWork = (before + units) / WORK_UNIT
    const complete = verifiedWork >= SYNCHRONIZED_SOUND.work
    if (complete && !access.some(a => a.studioId === p.studioId && a.acquiredWeek !== null)) {
      const pending = access.findIndex(a => a.studioId === p.studioId)
      if (pending >= 0) access.splice(pending, 1)
      access.push({studioId:p.studioId, technologyId:p.technologyId, route:'research', chosenWeek:p.startedWeek!,
        acquiredWeek:nextWeek, accessCost:0, researchProjectId:p.id})
    }
    return {...p, verifiedWork, expenditure:p.expenditure+quote.spend,
      weeks: [...p.weeks, {week: state.market.tick, seatTalentIds: quote.seatTalentIds, spend: quote.spend, units}],
      status:complete?'completed' as const:!staffedNextWeek?'paused' as const:p.status,
      completedWeek:complete?nextWeek:null}
  })
  return {technology:{...state.technology,projects,access}, entries, cost:entries.reduce((sum,e)=>sum-e.amount,0)}
}

/** Capability follows P09's completed physical facts; research alone cannot grant it. */
export function finishTechnologyWeek(state: GameState): GameState {
  const adoptions = state.technology.adoptions.map(a => {
    if (a.operationalWeek !== null) return a
    const player = a.studioId === state.hollywood?.playerStudioId
    const complete = player
      ? hasOperationalFacilityInstallation(state,a.stageFacilityId,'synchronized-sound-stage') && hasOperationalFacilityInstallation(state,a.postFacilityId,'synchronized-sound-post')
      : state.market.tick >= a.committedWeek + SYNCHRONIZED_SOUND.deploymentWeeks
    return complete ? {...a,operationalWeek:state.market.tick} : a
  })
  const newRival = adoptions.filter(a=>a.studioId!==state.hollywood?.playerStudioId && a.operationalWeek!==null && state.technology.adoptions.find(old=>old.id===a.id)?.operationalWeek===null)
  const hollywood = !state.hollywood || newRival.length===0 ? state.hollywood : {...state.hollywood,
    receipts:[...state.hollywood.receipts,...newRival.map((a,i)=>({eventId:`industry-event-${state.hollywood!.nextReceipt+i}`,week:a.operationalWeek!,studioId:a.studioId,kind:'technologyAdopted' as const,adoptionId:a.id}))],
    nextReceipt:state.hollywood.nextReceipt+newRival.length}
  return {...state,hollywood,technology:{...state.technology,adoptions}}
}

type Validator = {
  fail: (message: string) => never
  exact: (value: unknown, keys: readonly string[]) => void
  integer: (n: number, min?: number, max?: number) => void
  text: (s: string) => void
  week: (n: number) => void
  studio: (id: string) => void
  own: string | undefined
}
function validator(state: GameState | GameStateV20): Validator {
  const fail = (message: string): never => { throw new Error(`Technology save: ${message}`) }
  const exact = (value: unknown, keys: readonly string[]) => {
    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== keys.length || !keys.every(k => Object.hasOwn(value,k))) fail(`exact keys required: ${keys.join(',')}`)
  }
  const integer = (n: number, min = 0, max = Number.MAX_SAFE_INTEGER) => {if (!Number.isSafeInteger(n) || n < min || n > max) fail('bounded integer required')}
  const text = (s: string) => {if (typeof s !== 'string' || !s.length || s.length > 256) fail('bounded identity required')}
  const week = (n: number) => integer(n,state.technology.recordingStartedWeek,state.market.tick)
  const studios = new Set(state.hollywood?.identities.filter(s => s.enteredWeek !== null).map(s => s.studioId) ?? [])
  const studio = (id: string) => {text(id);if (!studios.has(id)) fail('unknown or reserved studio')}
  return {fail, exact, integer, text, week, studio, own: state.hollywood?.playerStudioId}
}
/** Root shape, access, adoptions, loadouts, adoption ledger and payroll: identical law for v1 and v2 roots. */
function validateSharedTechnology(state: GameState | GameStateV20, v: Validator, projectIds: Set<string>, completedProjects: Map<string, number>): void {
  const {fail, exact, integer, text, week, studio, own} = v
  const root = state.technology
  const full = state as GameState
  const accesses = new Set<string>()
  for (const a of root.access) {
    exact(a,['studioId','technologyId','route','chosenWeek','acquiredWeek','accessCost','researchProjectId'])
    studio(a.studioId);knownTechnology(a.technologyId);week(a.chosenWeek);integer(a.accessCost)
    if (accesses.has(a.studioId)) fail('duplicate technology access');accesses.add(a.studioId)
    if (!['wait','research','purchase'].includes(a.route)) fail('unknown access route')
    if (a.acquiredWeek !== null) {week(a.acquiredWeek); if (a.acquiredWeek < a.chosenWeek) fail('access before choice')}
    if (a.route === 'wait') {if (a.acquiredWeek !== null || a.accessCost !== 0 || a.researchProjectId !== null) fail('waiting granted unpurchased capability')}
    if (a.route === 'research') {
      const completedWeek = a.researchProjectId === null ? undefined : completedProjects.get(`${a.studioId}/${a.researchProjectId}`)
      if (completedWeek === undefined || completedWeek !== a.acquiredWeek || a.accessCost !== 0) fail('invented invention provenance')
    }
    if (a.route === 'purchase' && (a.acquiredWeek === null || a.acquiredWeek < 416 || a.accessCost !== 200_000 || a.researchProjectId !== null)) fail('invalid commercial access')
  }
  const stages = new Set<string>(), adoptionIds = new Set<string>(), prototypes = new Set<string>()
  if(root.adoptions.filter(a=>a.studioId!==own).length>1) fail('Core permits one rival commercial adoption consequence')
  for (const a of root.adoptions) {
    exact(a,['id','studioId','technologyId','stageFacilityId','postFacilityId','route','committedWeek','operationalWeek','equipmentCost','installationCost','physicalProjectIds','prototypeProjectId'])
    studio(a.studioId);knownTechnology(a.technologyId);text(a.id);week(a.committedWeek);integer(a.equipmentCost);integer(a.installationCost)
    if (!['research','purchase'].includes(a.route) || !technologyAccess(state,a.studioId,a.technologyId)) fail('adoption without lawful access')
    const access=root.access.find(access=>access.studioId===a.studioId && access.technologyId===a.technologyId)!
    if(access.acquiredWeek===null || access.acquiredWeek>a.committedWeek || access.route!==a.route) fail('adoption precedes or misrepresents acquired access')
    const stageKey = `${a.studioId}/${a.stageFacilityId}`
    if (stages.has(stageKey) || adoptionIds.has(a.id)) fail('duplicate adoption');stages.add(stageKey);adoptionIds.add(a.id)
    const operations = a.studioId === own ? state.operations : state.hollywood!.businesses.find(b => b.studioId === a.studioId)?.operations
    if (!operations?.facilities.some(f => f.id === a.stageFacilityId && f.capability === 'soundstage') || !operations.facilities.some(f => f.id === a.postFacilityId && f.capability === 'post')) fail('adoption has no exact compatible chain')
    if (!Array.isArray(a.physicalProjectIds) || new Set(a.physicalProjectIds).size !== a.physicalProjectIds.length) fail('invalid physical project references')
    if (a.studioId === own) {
      const jobs = a.physicalProjectIds.map(id => state.placement.facilities.find(p => p.projectId === id))
      if (jobs.length < 1 || jobs.length > 2 || jobs.some(p => !p?.installation)) fail('missing P09 physical owner')
      if (!jobs.some(p => p?.blueprintId === 'synchronized-sound-stage' && p.installation?.targetFacilityId === a.stageFacilityId)) fail('stage job mismatch')
      if(jobs.some(p=>p!.placedWeek!==a.committedWeek || !(p!.blueprintId==='synchronized-sound-stage'&&p!.installation!.targetFacilityId===a.stageFacilityId || p!.blueprintId==='synchronized-sound-post'&&p!.installation!.targetFacilityId===a.postFacilityId))) fail('physical job time or target differs from adoption')
      const post=state.placement.facilities.find(p=>p.blueprintId==='synchronized-sound-post'&&p.installation?.targetFacilityId===a.postFacilityId)
      if(!post || !a.physicalProjectIds.includes(post.projectId) && (post.status!=='operational'||post.completesWeek>a.committedWeek)) fail('adoption lacks its compatible Post commitment')
      const completesWeek=Math.max(...jobs.map(p=>p!.completesWeek),post!.completesWeek)
      if(a.operationalWeek!==null && a.operationalWeek!==completesWeek || a.operationalWeek===null && completesWeek<=state.market.tick) fail('operational receipt differs from exact physical completion')
      const capex = state.ledger.filter(e => e.kind === 'constructionCapex' && a.physicalProjectIds.includes(e.constructionProjectId)).reduce((s,e)=>s-e.amount,0)
      if (capex !== a.installationCost) fail('physical commitment does not reconcile')
      if (a.operationalWeek !== null && (!hasOperationalFacilityInstallation(full,a.stageFacilityId,'synchronized-sound-stage') || !hasOperationalFacilityInstallation(full,a.postFacilityId,'synchronized-sound-post'))) fail('capability before physical completion')
    } else if (a.physicalProjectIds.length || a.route !== 'purchase' || a.equipmentCost !== 300_000 || a.installationCost !== 975_000 || a.committedWeek < 416) fail('rival has fabricated physical or research authority')
    if (a.operationalWeek !== null) {week(a.operationalWeek);if (a.operationalWeek < a.committedWeek + 12) fail('installation finished early')}
    if (a.prototypeProjectId !== null) {
      const completedWeek = completedProjects.get(`${a.studioId}/${a.prototypeProjectId}`)
      if (prototypes.has(a.prototypeProjectId) || a.equipmentCost !== 0 || completedWeek === undefined || completedWeek > a.committedWeek) fail('prototype charged or credited twice')
      prototypes.add(a.prototypeProjectId)
    } else if (a.equipmentCost !== (a.route === 'research' ? 225_000 : 300_000)) fail('equipment charge mismatch')
  }
  // This invocation still validates every original loadout; the save validator
  // still checks the original Hollywood root. Index only historical membership:
  // scanning the whole history for each loadout makes that P13 check quadratic.
  // Exact identity pairs and a local lifetime keep Save As copies independent;
  // no validated state or membership survives this call.
  const historicalFilmsByStudio = new Map<string, Set<string>>()
  for (const film of state.hollywood?.films ?? []) {
    let studioFilms = historicalFilmsByStudio.get(film.studioId)
    if (studioFilms === undefined) {
      studioFilms = new Set<string>()
      historicalFilmsByStudio.set(film.studioId, studioFilms)
    }
    studioFilms.add(film.filmId)
  }
  const films = new Set<string>()
  for (const p of root.productions) {
    exact(p,['studioId','productionId','method','adoptionId','lockedWeek']);studio(p.studioId);text(p.productionId)
    const key = `${p.studioId}/${p.productionId}`;if (films.has(key)) fail('duplicate filming loadout');films.add(key)
    const business = state.hollywood?.businesses.find(b => b.studioId === p.studioId)
    const exists = p.studioId === own
      ? state.studio.activeProductions.some(f => f.id === p.productionId) || state.studio.releasedFilms.some(f => f.productionId === p.productionId) || p.lockedWeek !== null && state.ledger.some(e => e.productionId === p.productionId)
      : business?.productions.some(f => f.id === p.productionId) || historicalFilmsByStudio.get(p.studioId)?.has(p.productionId)
    if (!exists) fail('unknown production loadout')
    if (p.lockedWeek !== null) week(p.lockedWeek)
    if (p.method === 'silent') {if (p.adoptionId !== null) fail('silent film has sound adoption')}
    else if (p.method === 'synchronized-dialogue') {
      const a = root.adoptions.find(a => a.id === p.adoptionId && a.studioId === p.studioId && a.operationalWeek !== null)
      if (!a || p.lockedWeek !== null && a.operationalWeek! > p.lockedWeek) fail('sound film precedes operational capability')
    } else fail('unknown production method')
  }
  const payrollWeeks=new Set<number>()
  const scientists=new Set(state.talent.filter(t=>t.role==='scientist').map(t=>t.id))
  const scientistEmployment=(state.hollywood?.employment ?? []).filter(c=>c.studioId===own && scientists.has(c.terms.talentId))
  const payrollOwed=new Map<number,number>()
  for(const interval of scientistEmployment) {
    const through=Math.min(state.market.tick,interval.terms.endWeekExclusive,interval.endedWeek ?? state.market.tick)
    for(let chargedWeek=Math.max(root.recordingStartedWeek,interval.terms.startWeek);chargedWeek<through;chargedWeek++) payrollOwed.set(chargedWeek,(payrollOwed.get(chargedWeek)??0)+weeklySalary(interval.terms.annualSalary))
  }
  for (const e of state.ledger) {
    if (e.kind === 'technologyAdoption') {
      week(e.week);integer(-e.amount,1)
      const access = root.access.find(a => a.studioId === own && e.note === `technology-access:${own}:${a.technologyId}` && e.amount === -a.accessCost && e.week === a.acquiredWeek)
      const adoption = root.adoptions.find(a => a.studioId === own && e.note === `technology-equipment:${a.id}` && e.amount === -a.equipmentCost && e.week === a.committedWeek)
      if (!access && !adoption) fail('orphan adoption expense')
    } else if (e.kind === 'researchPayroll') {
      week(e.week);integer(-e.amount,1)
      if (e.note !== 'weekly research payroll' || payrollWeeks.has(e.week)) fail('invalid or repeated research payroll')
      payrollWeeks.add(e.week)
      const owed=payrollOwed.get(e.week)??0
      if(-e.amount!==owed)fail('research payroll differs from historical employment')
    }
  }
  if(payrollWeeks.size!==payrollOwed.size) fail('missing research payroll for historical Scientist employment')
  for (const a of root.access.filter(a => a.studioId === own && a.accessCost > 0)) {
    if (state.ledger.filter(e => e.kind === 'technologyAdoption' && e.note === `technology-access:${own}:${a.technologyId}` && e.amount === -a.accessCost && e.week === a.acquiredWeek).length !== 1) fail('access not paid exactly once')
  }
  for (const a of root.adoptions.filter(a => a.studioId === own && a.equipmentCost > 0)) {
    if (state.ledger.filter(e => e.kind === 'technologyAdoption' && e.note === `technology-equipment:${a.id}` && e.amount === -a.equipmentCost && e.week === a.committedWeek).length !== 1) fail('equipment not paid exactly once')
  }
  if (projectIds.size !== root.projects.length) fail('duplicate research identity')
  assertProductionTechnologyBindings(full)
}
function validateRootShape(state: GameState | GameStateV20, v: Validator, version: 1 | 2): void {
  const {fail, exact, integer} = v
  const root = state.technology
  exact(root,['version','recordingStartedWeek','projects','access','adoptions','productions'])
  if (root.version !== version) fail('unknown version')
  integer(root.recordingStartedWeek,0,state.market.tick)
  for (const rows of [root.projects,root.access,root.adoptions,root.productions]) if (!Array.isArray(rows)) fail('array required')
  if (state.studioHistory.rows.some(r=>r.kind==='technologyMilestone' && r.week<=root.recordingStartedWeek)) fail('invented technology history before recording began')
  if ((!state.hollywood || state.founding !== null) && [root.projects,root.access,root.adoptions,root.productions].some(a => a.length)) fail('unfounded or non-player corpus cannot hold technology authority')
}

/** Exact, campaign-local P13B boundary for the v2 root. It never repairs or invents a receipt. */
export function validateTechnology(state: GameState): void {
  const v = validator(state)
  const {fail, exact, integer, text, week, studio, own} = v
  validateRootShape(state, v, 2)
  const root = state.technology
  const WORK = SYNCHRONIZED_SOUND.work * WORK_UNIT
  const ids = new Set<string>(), technologies = new Set<string>(), seatHolders = new Set<string>()
  const completed = new Map<string, number>()
  const employment = (state.hollywood?.employment ?? []).filter(c => c.studioId === own)
  const employedThatWeek = (talentId: string, at: number) => employment.some(c => c.terms.talentId === talentId &&
    c.terms.startWeek <= at && at < c.terms.endWeekExclusive && (c.endedWeek === null || at < c.endedWeek))
  const chargedWeeks = new Set<string>()
  for (const p of root.projects) {
    exact(p,['id','studioId','technologyId','laboratoryFacilityId','status','budgetPerWeek','verifiedWork','expenditure','startedWeek','completedWeek','seats','weeks','legacy'])
    knownTechnology(p.technologyId);studio(p.studioId);text(p.id)
    if (p.studioId !== own || p.id !== `${own}:research:${p.technologyId}` || ids.has(p.id)) fail('invalid research ownership or identity')
    ids.add(p.id)
    if (technologies.has(p.technologyId)) fail('one research project per studio and technology');technologies.add(p.technologyId)
    budget(p.budgetPerWeek);integer(p.expenditure)
    if (!Number.isFinite(p.verifiedWork) || p.verifiedWork < 0 || p.verifiedWork > SYNCHRONIZED_SOUND.work) fail('invalid verified work')
    const verifiedWorkUnits = Math.round(p.verifiedWork * WORK_UNIT)
    if (p.verifiedWork !== verifiedWorkUnits / WORK_UNIT) fail('verified work is not a whole-dollar research unit')
    if (!['active','paused','cancelled','completed'].includes(p.status)) fail('unknown research status')
    const lab = state.operations.facilities.find(f => f.id === p.laboratoryFacilityId && f.capability === 'laboratory')
    if (!lab) fail('unknown Laboratory')
    if (!Array.isArray(p.seats) || !Array.isArray(p.weeks)) fail('array required')
    const occupiedByLab = new Map<string, number>()
    for (const s of p.seats) {
      exact(s,['talentId','laboratoryFacilityId','assignedWeek','releasedWeek']);text(s.talentId)
      if (state.talent.find(t => t.id === s.talentId)?.role !== 'scientist') fail('unknown Scientist')
      if (s.laboratoryFacilityId !== p.laboratoryFacilityId) fail('seat outside the project Laboratory')
      week(s.assignedWeek)
      if (s.releasedWeek !== null) {week(s.releasedWeek);if (s.releasedWeek < s.assignedWeek) fail('seat released before assignment')}
      else {
        if (seatHolders.has(s.talentId)) fail('double assigned Scientist');seatHolders.add(s.talentId)
        occupiedByLab.set(s.laboratoryFacilityId,(occupiedByLab.get(s.laboratoryFacilityId) ?? 0)+1)
      }
    }
    for (const [labId,count] of occupiedByLab) if (count > (state.operations.facilities.find(f => f.id === labId)?.capacity ?? 0)) fail('Laboratory seats exceed capacity')
    if (p.startedWeek !== null) {week(p.startedWeek); if (p.startedWeek < SYNCHRONIZED_SOUND.researchableWeek) fail('research before eligibility')}
    else if (p.verifiedWork !== 0 || p.expenditure !== 0 || p.status === 'active' || p.status === 'completed' || p.weeks.length || p.legacy !== null) fail('invented research before start')
    if (p.completedWeek !== null) {week(p.completedWeek);if (p.startedWeek === null || p.completedWeek <= p.startedWeek || p.verifiedWork !== SYNCHRONIZED_SOUND.work || p.status !== 'completed') fail('invalid completion')}
    else if (p.verifiedWork === SYNCHRONIZED_SOUND.work || p.status === 'completed') fail('missing research completion receipt')
    if (p.completedWeek !== null) completed.set(`${p.studioId}/${p.id}`, p.completedWeek)
    if (p.startedWeek !== null && verifiedWorkUnits > ((p.completedWeek ?? state.market.tick) - p.startedWeek) * lab!.capacity * 30_000) fail('verified work exceeds elapsed capacity of the Laboratory seats')
    let units = 0, spend = 0, receiptsFrom = p.startedWeek
    if (p.legacy !== null) {
      exact(p.legacy,['scientistId','throughWeek','verifiedWork','expenditure']);text(p.legacy.scientistId);integer(p.legacy.expenditure)
      if (state.talent.find(t => t.id === p.legacy.scientistId)?.role !== 'scientist') fail('unknown legacy Scientist')
      if (p.startedWeek === null) fail('legacy prefix without a start')
      week(p.legacy.throughWeek);if (p.legacy.throughWeek < p.startedWeek) fail('legacy prefix precedes its start')
      units = Math.round(p.legacy.verifiedWork * WORK_UNIT)
      if (!Number.isFinite(p.legacy.verifiedWork) || p.legacy.verifiedWork < 0 || p.legacy.verifiedWork !== units / WORK_UNIT || units > WORK) fail('invalid legacy verified work')
      const elapsed = Math.min(p.completedWeek ?? p.legacy.throughWeek, p.legacy.throughWeek) - p.startedWeek
      if (units > elapsed * 30_000) fail('legacy work exceeds one Scientist elapsed capacity')
      if (units > elapsed * WORK_UNIT + p.legacy.expenditure) fail('legacy research acceleration was not paid')
      spend = p.legacy.expenditure
      receiptsFrom = p.legacy.throughWeek
    }
    if (p.weeks.length > 65) fail('research receipts exceed the bounded history')
    let last = -1
    for (const [index, r] of p.weeks.entries()) {
      exact(r,['week','seatTalentIds','spend','units']);week(r.week);integer(r.spend);integer(r.units,1)
      if (receiptsFrom === null || r.week < receiptsFrom || r.week <= last || p.completedWeek !== null && r.week >= p.completedWeek) fail('research receipt outside its worked interval')
      last = r.week
      if (!Array.isArray(r.seatTalentIds) || r.seatTalentIds.length < 1 || new Set(r.seatTalentIds).size !== r.seatTalentIds.length) fail('research receipt without distinct seats')
      for (const talentId of r.seatTalentIds) {
        if (!p.seats.some(s => s.talentId === talentId && s.assignedWeek <= r.week && (s.releasedWeek === null || s.releasedWeek > r.week))) fail('research receipt names an unseated person')
        if (!employedThatWeek(talentId, r.week)) fail('research receipt names an unemployed Scientist')
      }
      if (r.spend > SYNCHRONIZED_SOUND.usableBudgetPerScientist * r.seatTalentIds.length) fail('research charge exceeds its usable seats')
      const earned = r.seatTalentIds.length * WORK_UNIT + r.spend
      const final = index === p.weeks.length - 1 && p.completedWeek !== null
      if (final ? r.units > earned || units + r.units !== WORK : r.units !== earned) fail('research receipt units do not match its seats and charge')
      units += r.units;spend += r.spend
      if (units > WORK) fail('research receipts exceed the required work')
    }
    if (units !== verifiedWorkUnits) fail('verified work does not reconcile with its receipts')
    if (spend !== p.expenditure) fail('research expenditure does not reconcile with its receipts')
    const paid = state.ledger.filter(e => e.kind === 'researchSpend' && e.note === `research:${p.id}`).reduce((sum,e) => sum-e.amount,0)
    if (paid !== p.expenditure) fail('research expenditure does not reconcile')
    if (p.status === 'active' && researchPrerequisiteRefusal(state,p)) fail('active research lacks its assigned person or physical prerequisites')
  }
  for (const e of state.ledger) {
    if (e.kind !== 'researchSpend') continue
    week(e.week);integer(-e.amount,1)
    const p = root.projects.find(p => e.note === `research:${p.id}`)
    if (!p || p.startedWeek === null || e.week < p.startedWeek || p.completedWeek !== null && e.week >= p.completedWeek) fail('orphan research expense')
    const key = `${p.id}/${e.week}`
    if (chargedWeeks.has(key)) fail('repeated research charge for one project week');chargedWeeks.add(key)
    if (e.week < (p.legacy?.throughWeek ?? p.startedWeek)) {if (-e.amount > SYNCHRONIZED_SOUND.usableBudgetPerScientist) fail('legacy research charge exceeds one Scientist')}
    else if (p.weeks.find(r => r.week === e.week)?.spend !== -e.amount) fail('research charge without its receipt')
  }
  validateSharedTechnology(state, v, ids, completed)
}

/** Frozen P13A validator for a genuine V20 root (single Scientist). Retained verbatim in law; never widened. */
export function validateTechnologyV1(state: GameStateV20): void {
  const v = validator(state)
  const {fail, exact, integer, text, week, studio, own} = v
  validateRootShape(state, v, 1)
  const root = state.technology
  if (root.projects.length > 1) fail('Core permits one Scientist research assignment')
  const ids = new Set<string>()
  const completed = new Map<string, number>()
  const researchWeeks=new Set<number>()
  const refusalV1 = (p: ResearchProjectV1): string | null => {
    const full = state as unknown as GameState
    if (state.market.tick < SYNCHRONIZED_SOUND.researchableWeek) return 'research not yet open'
    const physical = laboratoryRefusal(full, p); if (physical) return physical
    const person = state.talent.find(t => t.id === p.scientistId)
    if (person?.role !== 'scientist' || !activeContract(full, p.scientistId)) return 'Employ and assign a named Scientist.'
    return null
  }
  for (const p of root.projects) {
    exact(p,['id','studioId','technologyId','laboratoryFacilityId','scientistId','status','budgetPerWeek','verifiedWork','expenditure','startedWeek','completedWeek'])
    knownTechnology(p.technologyId);studio(p.studioId);text(p.id)
    if (p.studioId !== own || p.id !== `${own}:research:synchronized-sound` || ids.has(p.id)) fail('invalid research ownership or identity')
    ids.add(p.id);budget(p.budgetPerWeek);integer(p.expenditure)
    if (!Number.isFinite(p.verifiedWork) || p.verifiedWork < 0 || p.verifiedWork > 64) fail('invalid verified work')
    const verifiedWorkUnits = Math.round(p.verifiedWork * 20_000)
    if (p.verifiedWork !== verifiedWorkUnits / 20_000) fail('verified work is not a whole-dollar research unit')
    if (!['active','paused','cancelled','completed'].includes(p.status)) fail('unknown research status')
    if (!state.operations.facilities.some(f => f.id === p.laboratoryFacilityId && f.capability === 'laboratory')) fail('unknown Laboratory')
    if (state.talent.find(t => t.id === p.scientistId)?.role !== 'scientist') fail('unknown Scientist')
    if (p.startedWeek !== null) {week(p.startedWeek); if (p.startedWeek < 260) fail('research before eligibility')}
    else if (p.verifiedWork !== 0 || p.expenditure !== 0 || p.status === 'active' || p.status === 'completed') fail('invented research before start')
    if (p.completedWeek !== null) {week(p.completedWeek);if (p.startedWeek === null || p.completedWeek <= p.startedWeek || p.verifiedWork !== 64 || p.status !== 'completed') fail('invalid completion')}
    else if (p.verifiedWork === 64 || p.status === 'completed') fail('missing research completion receipt')
    if (p.completedWeek !== null) completed.set(`${p.studioId}/${p.id}`, p.completedWeek)
    if (p.startedWeek!==null && verifiedWorkUnits > ((p.completedWeek ?? state.market.tick)-p.startedWeek)*30_000) fail('verified work exceeds one Scientist elapsed capacity')
    if (p.startedWeek!==null && verifiedWorkUnits > ((p.completedWeek ?? state.market.tick)-p.startedWeek)*20_000+p.expenditure) fail('verified research acceleration was not paid')
    const spent = state.ledger.filter(e => e.kind === 'researchSpend' && e.note === `research:${p.id}`).reduce((sum,e) => sum-e.amount,0)
    if (spent !== p.expenditure) fail('research expenditure does not reconcile')
    if (p.status === 'active' && refusalV1(p)) fail('active research lacks its assigned person or physical prerequisites')
    if (p.status === 'active' && root.projects.some(other => other !== p && other.scientistId === p.scientistId && other.status === 'active')) fail('double assigned Scientist')
  }
  for (const e of state.ledger) {
    if (e.kind !== 'researchSpend') continue
    week(e.week);integer(-e.amount,1,10_000)
    if(researchWeeks.has(e.week))fail('repeated research charge for one Scientist week');researchWeeks.add(e.week)
    if (!root.projects.some(p => e.note === `research:${p.id}` && p.startedWeek !== null && e.week >= p.startedWeek && (p.completedWeek === null || e.week < p.completedWeek))) fail('orphan research expense')
  }
  validateSharedTechnology(state, v, ids, completed)
}
