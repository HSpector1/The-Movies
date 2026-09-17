import { activeContract, busyTalentIds, canAfford, economyEngaged, weeklySalary } from './employment.js'
import { hasOperationalFacilityInstallation } from './facilityEffects.js'
import { commitFacilityInstallation, queryFacilityInstallation } from './placement.js'
import { campaignDate } from './calendar.js'
import { productionHasBegunFilming, retargetProductionTechnologyChoice, assertProductionTechnologyBindings } from './technologyProduction.js'
import { generateScientist } from './worldgen.js'
import { isTechnologyId, technologyEntry } from './technologyCatalogue.js'
import {
  adoptionChainOperational, adoptionComponents, adoptionPhysicalComplete, adoptionQuote, adoptionRejections, aggregatedAdoptionComponents,
  componentTotal, equipmentPlan, installationCatalogueCost, mintEquipmentAsset, resolvedPostFacilityId,
  type AdoptionRequest,
  installationRefusalSentence,
  INSTALLATION_CASH_REFUSAL,
} from './technologyAdoption.js'
import type { GameState, GameStateV20, GameStateV21, GameStateV23, LedgerEntry, Talent } from './types.js'
import type { ResearchLabContribution, ResearchProject, ResearchProjectV1, ResearchSeat, StudioTechnology, StudioTechnologyV1, StudioTechnologyV2, StudioTechnologyV3, TechnologyAction, TechnologyAdoption, TechnologyAdoptionComponent, TechnologyEquipmentAsset, TechnologyId } from './technologyTypes.js'

/**
 * The synchronized-sound parameters, retained as a named export for P13A consumers.
 * The catalogue entry is the authority; this adds only the two output constants no
 * other technology reads. Per-PROJECT engine reads use `technologyEntry(...)`.
 */
export const SYNCHRONIZED_SOUND = Object.freeze({
  ...technologyEntry('synchronized-sound'), baseWeeklyOutput: 1, saturatedWeeklyOutput: 1.5,
})
/** Provisional P13B tuning (companion §4: two Labs × four seats). Not Owner-approved balance. */
export const RESEARCH_SCIENTISTS_PER_STUDIO = 8
/** A whole budget dollar earns exactly 1/20,000 of a Laboratory's own raw output; every raw output is that integer numerator. */
const WORK_UNIT = 20_000
/**
 * P13B-S2: project credit is kept over 1/160,000 (WORK_UNIT × 8) so the cooperation
 * rule `a + 0.625·b` — the larger Laboratory's raw output in full, the second at
 * five eighths — is exact in integers. One Laboratory alone still earns 8 × its raw.
 * Exported read-only: the read side divides a quoted `output` by it to publish the
 * same integer numerator a stored receipt carries. No engine behaviour reads it twice.
 */
export const PROJECT_UNIT = WORK_UNIT * 8
const [FIRST_LAB_FACTOR, SECOND_LAB_FACTOR] = [8, 5]
const money = (value: number) => '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })
/** Small counts are spelled out in player-facing refusals ("four seats", "eight Scientists"). */
export const spelled = (n: number): string => ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][n] ?? String(n)

export function initialTechnology(week: number): StudioTechnology {
  return {version: 4, recordingStartedWeek: week, cooperationFromWeek: week, projects: [], access: [], adoptions: [], productions: [], equipment: [], nextEquipmentId: 0}
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
export function liftTechnologyV1(root: StudioTechnologyV1, week: number): StudioTechnologyV2 {
  return {...root, version: 2, projects: root.projects.map(({scientistId, ...project}) => ({...project,
    seats: [{talentId: scientistId, laboratoryFacilityId: project.laboratoryFacilityId, assignedWeek: week, releasedWeek: null}],
    weeks: [],
    legacy: project.startedWeek === null ? null : {scientistId, throughWeek: week, verifiedWork: project.verifiedWork, expenditure: project.expenditure}}))}
}
/**
 * Governed V21→V22 lift: cooperation begins at the migration week, so every stored
 * receipt keeps the law it was written under. Each project-credit numerator is
 * rebased ×8 (1/20,000 → 1/160,000, the same verified work); a receipt whose seats
 * all sat in one Laboratory that week gains that one known row; a receipt whose
 * seats spanned two Laboratories keeps `labs: null`, because the split that earned
 * it was never recorded and cannot be recovered. Everything else is unchanged.
 */
export function liftTechnologyV2(root: StudioTechnologyV2, week: number): StudioTechnologyV3 {
  return {...root, version: 3, cooperationFromWeek: week, projects: root.projects.map(project => ({...project,
    weeks: project.weeks.map(receipt => {
      const labs = new Set(receipt.seatTalentIds.map(talentId =>
        project.seats.find(s => s.talentId === talentId && s.assignedWeek <= receipt.week && (s.releasedWeek === null || s.releasedWeek > receipt.week))?.laboratoryFacilityId))
      const [only] = [...labs]
      return {...receipt, units: receipt.units * FIRST_LAB_FACTOR,
        labs: labs.size === 1 && only !== undefined
          ? [{laboratoryFacilityId: only, seatTalentIds: [...receipt.seatTalentIds], spend: receipt.spend, rawUnits: receipt.units}]
          : null}
    })}))}
}

/**
 * Governed V23→V24 lift: each adoption gains its component rows and exactly one
 * held equipment asset, derived from facts the save already carries. The
 * equipment route is read from the retained `prototypeProjectId`, `route` and
 * `equipmentCost`; each entry in `physicalProjectIds` becomes ONE aggregated
 * installation row carrying that placement's own capex and its own elapsed
 * weeks; an adoption with no placements of its own (abstract rival plant) keeps
 * one aggregated row with no placement. Nothing else moves.
 */
export function liftTechnologyV3(root: StudioTechnologyV3, state: Pick<GameState, 'placement' | 'ledger'>): StudioTechnology {
  const equipment: TechnologyEquipmentAsset[] = []
  const adoptions = root.adoptions.map((a, index) => {
    const entry = technologyEntry(a.technologyId)
    const source: TechnologyEquipmentAsset['source'] = a.prototypeProjectId !== null && a.equipmentCost === 0
      ? 'first-prototype' : a.route === 'research' ? 'later-inventor' : 'commercial'
    const asset = mintEquipmentAsset(index, a.studioId, a.technologyId, a.committedWeek, source, a.equipmentCost, a.id)
    equipment.push(asset)
    const aggregated = aggregatedAdoptionComponents(entry, {source, cost: a.equipmentCost}, a.installationCost, asset.id)
    const components: TechnologyAdoptionComponent[] = a.physicalProjectIds.length === 0 ? aggregated
      : [...aggregated.filter(c => c.source !== 'physical'), ...a.physicalProjectIds.map(projectId => {
        const placed = state.placement.facilities.find(p => p.projectId === projectId)
        return {kind: 'installation' as const, label: `${entry.name} installation`,
          cost: state.ledger.filter(e => e.kind === 'constructionCapex' && e.constructionProjectId === projectId).reduce((sum, e) => sum - e.amount, 0),
          weeks: placed === undefined ? null : placed.completesWeek - placed.placedWeek,
          source: 'physical' as const, placementId: placed?.id ?? null, equipmentAssetId: null}
      })]
    // The FROZEN V24 adoption shape is the live one MINUS S6's `cancelledWeek`:
    // this lift writes a V24 root, and the governed V25→V26 conversion is what adds
    // that leaf. The cast is the projection boundary, not a type convenience.
    return {...a, components, equipmentAssetId: asset.id} as unknown as TechnologyAdoption
  })
  return {...root, version: 4, adoptions, equipment, nextEquipmentId: equipment.length}
}

function playerStudioId(state: GameState): string {
  if (!state.hollywood || state.founding !== null || !economyEngaged(state)) {
    throw new Error('Found your studio before opening the Research Laboratory.')
  }
  return state.hollywood.playerStudioId
}
function knownTechnology(id: string): asserts id is TechnologyId {
  if (!isTechnologyId(id)) throw new Error('That technology is not in this catalogue.')
}
export function technologyAccess(state: {technology?: Pick<StudioTechnology, 'access'>}, studioId: string, id: string): boolean {
  if (!isTechnologyId(id)) return false
  return state.technology?.access.some(a => a.studioId === studioId && a.technologyId === id && a.acquiredWeek !== null) ?? false
}
export function playerTechnologyAccess(state: GameState, id: string): boolean {
  return !!state.hollywood && technologyAccess(state, state.hollywood.playerStudioId, id)
}
export function commercialAccessRefusal(state: GameState, studioId: string, technologyId: TechnologyId = SYNCHRONIZED_SOUND.id): string | null {
  const entry = technologyEntry(technologyId)
  if (!state.hollywood?.identities.some(s=>s.studioId===studioId && s.enteredWeek!==null)) return 'That studio has not entered this campaign.'
  if (technologyAccess(state,studioId,entry.id)) return `This studio already has ${entry.id} access.`
  if (state.market.tick < entry.commercialWeek) return `Commercial purchase opens ${campaignDate(entry.commercialWeek).label}.`
  return null
}

/** Deterministic named recruitment pool: purpose-seeded people, no world RNG draw, existing identities reused (Otto stays first). */
export function researchCandidates(state: Pick<GameState, 'seed' | 'talent'>): Talent[] {
  return Array.from({length: RESEARCH_SCIENTISTS_PER_STUDIO}, (_, index) => {
    const id = `t-sci-${String(index).padStart(2, '0')}`
    return state.talent.find(t => t.id === id) ?? generateScientist(state.seed, id)
  })
}
/** The seat-bearing part of a project: enough for every eligibility read, and the shape a frozen root still satisfies. */
type SeatedProject = Pick<ResearchProject, 'laboratoryFacilityId' | 'technologyId' | 'seats'>
/** Seats currently held (not released), optionally within one Laboratory. */
export function occupiedSeats(project: Pick<ResearchProject, 'seats'>, laboratoryFacilityId?: string): ResearchSeat[] {
  return project.seats.filter(s => s.releasedWeek === null && (laboratoryFacilityId === undefined || s.laboratoryFacilityId === laboratoryFacilityId))
}
/** Seats that can work over [week, week+1): held by an employed Scientist. Expired or released seats earn and charge nothing. */
export function eligibleSeatIds(state: GameState, project: Pick<ResearchProject, 'seats'>, week = state.market.tick): string[] {
  return occupiedSeats(project)
    .filter(s => state.talent.find(t => t.id === s.talentId)?.role === 'scientist' && activeContract(state, s.talentId, week) !== undefined)
    .map(s => s.talentId)
}

/**
 * P13B-S2: begin/resume/weekly eligibility needs this technology's discipline module
 * operational in EVERY Laboratory that carries an occupied seat of the project.
 * Seating itself never asks (retained P13A law); a project with no occupied seat is
 * judged at its home Laboratory, exactly as the single-Lab slice did.
 */
function laboratoryRefusal(state: GameState, project: Omit<SeatedProject, 'seats'> & {seats?: readonly ResearchSeat[]}): string | null {
  const entry = technologyEntry(project.technologyId)
  const labIds = new Set((project.seats ?? []).filter(s => s.releasedWeek === null).map(s => s.laboratoryFacilityId))
  if (labIds.size === 0) labIds.add(project.laboratoryFacilityId)
  for (const labId of labIds) {
    const lab = state.operations.facilities.find(f => f.id === labId && f.capability === 'laboratory')
    if (!lab || lab.capacity < 1) return 'Complete the assigned Research Laboratory first.'
    if (state.placement.facilities.some(p => p.installation?.targetFacilityId === lab.id && p.status === 'underConstruction')) return 'Wait for the Laboratory instrument installation to finish.'
    if (!hasOperationalFacilityInstallation(state, lab.id, entry.instrumentBlueprintId)) return `Install ${entry.instrumentBlueprintId.replace(/-/g, ' ')} in this Laboratory.`
  }
  return null
}
export function researchPrerequisiteRefusal(state: GameState, project: SeatedProject): string | null {
  const entry = technologyEntry(project.technologyId)
  if (state.market.tick < entry.researchableWeek) return `Research opens ${campaignDate(entry.researchableWeek).label}.`
  const physical = laboratoryRefusal(state, project); if (physical) return physical
  if (eligibleSeatIds(state, project).length === 0) return 'Employ and assign a named Scientist.'
  return null
}

/** One Laboratory's part of a quoted week: its own seats, its share of the funding and its raw output over 1/20,000. */
export type ResearchLabShare = ResearchLabContribution & {seats: number}
/** Named seats grouped by their own Laboratory, in ascending stable Lab id order; seat order inside a Lab is the project's own. */
function seatsByLaboratory(seats: readonly ResearchSeat[], seatTalentIds: readonly string[]): {laboratoryFacilityId: string; seatTalentIds: string[]}[] {
  const groups = new Map<string, string[]>()
  for (const talentId of seatTalentIds) {
    const seat = seats.find(s => s.talentId === talentId && s.releasedWeek === null)
    if (!seat) throw new Error(`No occupied Laboratory seat holds "${talentId}" on this project.`)
    const group = groups.get(seat.laboratoryFacilityId)
    if (group) group.push(talentId); else groups.set(seat.laboratoryFacilityId, [talentId])
  }
  return [...groups.keys()].sort().map(laboratoryFacilityId => ({laboratoryFacilityId, seatTalentIds: groups.get(laboratoryFacilityId)!}))
}
/**
 * Proportional per-Laboratory funding (companion §4): `floor(spend · n_L / n_total)`
 * with the whole-dollar remainder — always fewer dollars than there are Laboratories
 * — going one each to the lowest stable Lab ids. Raw output is S1's own formula.
 * `byLab` must already be in ascending stable Lab id order.
 */
function fundingSplit(byLab: readonly {laboratoryFacilityId: string; seatTalentIds: string[]}[], spend: number): ResearchLabShare[] {
  const total = byLab.reduce((n, lab) => n + lab.seatTalentIds.length, 0)
  const shares = byLab.map(lab => ({laboratoryFacilityId: lab.laboratoryFacilityId, seats: lab.seatTalentIds.length,
    seatTalentIds: lab.seatTalentIds, spend: total === 0 ? 0 : Math.floor(spend * lab.seatTalentIds.length / total), rawUnits: 0}))
  let remainder = spend - shares.reduce((sum, lab) => sum + lab.spend, 0)
  for (const share of shares) if (remainder > 0) {share.spend += 1; remainder -= 1}
  for (const share of shares) share.rawUnits = share.seats * WORK_UNIT + share.spend
  return shares
}
/** Project credit for one week over PROJECT_UNIT: the larger Laboratory's raw output in full, the second at five eighths. */
function cooperationUnits(labs: readonly Pick<ResearchLabShare, 'laboratoryFacilityId' | 'rawUnits'>[]): number {
  const ordered = [...labs].sort((a, b) => b.rawUnits - a.rawUnits || (a.laboratoryFacilityId < b.laboratoryFacilityId ? -1 : 1))
  return FIRST_LAB_FACTOR * (ordered[0]?.rawUnits ?? 0) + SECOND_LAB_FACTOR * (ordered[1]?.rawUnits ?? 0)
}

export type ResearchWeekQuote = {spend: number; output: number; remainingWeeks: number | null; bottleneck: string; seats: number; seatTalentIds: string[]; labs: ResearchLabShare[]}
/**
 * Paper formula (P13B document 03 / companion §4): n eligible seats across at most
 * two Laboratories, spend = min(ceiling, 10,000·n) split proportionally, each
 * Laboratory's raw output n_L·20,000 + spend_L, and the project credit
 * 8·raw_a + 5·raw_b over 160,000 — one Laboratory alone keeps S1's n + spend/20,000.
 */
export function researchWeekQuote(state: GameState, project: ResearchProject): ResearchWeekQuote {
  const entry = technologyEntry(project.technologyId)
  const refusal = researchPrerequisiteRefusal(state, project)
  const idle = {spend: 0, output: 0, remainingWeeks: null, seats: 0, seatTalentIds: [] as string[], labs: [] as ResearchLabShare[]}
  if (project.status !== 'active' || refusal) return {...idle, bottleneck: refusal ?? 'Research is paused. Verified work is retained.'}
  const seatTalentIds = eligibleSeatIds(state, project)
  const seats = seatTalentIds.length
  const usable = entry.usableBudgetPerScientist * seats
  const spend = Math.min(project.budgetPerWeek, usable)
  if (!canAfford(state, spend).ok) return {...idle, bottleneck: 'Insufficient cash for this week’s usable research budget.'}
  const byLab = seatsByLaboratory(project.seats, seatTalentIds)
  const labs = fundingSplit(byLab, spend)
  const units = cooperationUnits(labs)
  const remaining = entry.work * PROJECT_UNIT - Math.round(project.verifiedWork * PROJECT_UNIT)
  const who = seats === 1 ? 'One assigned Scientist' : `${seats} assigned Scientists`
  const withWhom = seats === 1 ? 'this Scientist' : `these ${seats} Scientists`
  return {spend, output: units / PROJECT_UNIT, seats, seatTalentIds, labs, remainingWeeks: Math.ceil(remaining / units),
    bottleneck: spend >= usable
      ? `${who}: ${money(usable)}/week is usable. A higher budget adds no work and is not charged.`
      : `The research budget limits acceleration. ${money(usable)}/week reaches ${cooperationUnits(fundingSplit(byLab, usable)) / PROJECT_UNIT} work units with ${withWhom}.`}
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

/**
 * The same eligibility and compatibility law applies to the player and abstract
 * rival plant. Retained P13A signature: synchronized sound, by its own name. The
 * per-technology law lives in `adoptionRejections`; this returns its primary reason.
 */
export function adoptionRefusal(state: GameState, studioId: string, stageId: string, postId: string | null): string | null {
  return adoptionRejections(state, studioId, {technologyId: SYNCHRONIZED_SOUND.id, stageFacilityId: stageId,
    ...(postId === null ? {} : {postFacilityId: postId})})[0] ?? null
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
    // An omitted brief is the P13A single-brief intent and means synchronized sound.
    const technologyId = action.technologyId ?? SYNCHRONIZED_SOUND.id
    const entry = technologyEntry(technologyId)
    const existing = state.technology.projects.find(p => p.studioId === own && p.technologyId === technologyId)
    if (existing?.status === 'completed') throw new Error(`${entry.name} research is complete; its seats accept no further assignment.`)
    if (existing) {
      const staffedLabs = new Set(occupiedSeats(existing).map(s => s.laboratoryFacilityId))
      if (!staffedLabs.has(lab.id) && staffedLabs.size >= 2) throw new Error(`This project already works in two Laboratories. A third Laboratory is refused; release its seats there first.`)
    }
    // The four-seat cap belongs to the Laboratory, not to one brief: every
    // project's occupied seats on this body count against it.
    if (state.technology.projects.reduce((n, p) => n + occupiedSeats(p, lab.id).length, 0) >= lab.capacity) throw new Error(`This Laboratory's ${spelled(lab.capacity)} seats are occupied. Release a seat or review another lawful Laboratory.`)
    const seat: ResearchSeat = {talentId: action.scientistId, laboratoryFacilityId: lab.id, assignedWeek: state.market.tick, releasedWeek: null}
    if (existing) return changeProject(state, existing.id, p => ({...p, seats: [...p.seats, seat]}))
    const project: ResearchProject = {id: `${own}:research:${technologyId}`, studioId: own, technologyId,
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
    const entry = technologyEntry(action.technologyId)
    if (technologyAccess(state, own, action.technologyId)) throw new Error(`This studio already has ${entry.id} access.`)
    if (action.kind === 'purchaseTechnology') {const refusal=commercialAccessRefusal(state,own,entry.id);if(refusal)throw new Error(refusal)}
    const purchase = action.kind === 'purchaseTechnology'
    const prior = state.technology.access.find(a => a.studioId === own && a.technologyId === action.technologyId)
    if (!purchase && prior?.route === 'wait') throw new Error('This studio is already waiting for commercial release.')
    const paid = purchase ? charge(state, entry.accessCost, `technology-access:${own}:${action.technologyId}`) : state
    return {...paid, technology: {...paid.technology, access: [...paid.technology.access.filter(a => a !== prior), {
      studioId: own, technologyId: action.technologyId, route: purchase ? 'purchase' : 'wait', chosenWeek: state.market.tick,
      acquiredWeek: purchase ? state.market.tick : null, accessCost: purchase ? entry.accessCost : 0, researchProjectId: null}]}}
  }
  // P13A's named sound intent and P13B-S5's per-technology intent are ONE commit:
  // the alias means `adoptTechnology` for synchronized sound, keeps its own
  // adoption identity so no P13A receipt moves, and obeys exactly the same law.
  if (action.kind === 'adoptSynchronizedSound' || action.kind === 'adoptTechnology') {
    const technologyId = action.kind === 'adoptSynchronizedSound' ? SYNCHRONIZED_SOUND.id : action.technologyId
    knownTechnology(technologyId)
    const entry = technologyEntry(technologyId)
    const request: AdoptionRequest = {technologyId, stageFacilityId: action.stageFacilityId,
      ...(action.postFacilityId === undefined ? {} : {postFacilityId: action.postFacilityId})}
    const quote = adoptionQuote(state, request)
    if (!quote.ok) throw new Error(quote.refusal!)
    const access = state.technology.access.find(a => a.studioId === own && a.technologyId === technologyId && a.acquiredWeek !== null)!
    const inventor = access.route === 'research'
    const equipment = equipmentPlan(state, own, technologyId)
    const postFacilityId = resolvedPostFacilityId(state, own, request)
    const postAlready = entry.postInstallationId !== null && postFacilityId !== null &&
      hasOperationalFacilityInstallation(state, postFacilityId, entry.postInstallationId)
    const newPost = entry.postInstallationId !== null && postFacilityId !== null && !postAlready
    const id = action.kind === 'adoptSynchronizedSound'
      ? `${own}:sound-adoption:${state.technology.adoptions.filter(a => a.studioId === own).length}`
      : `${own}:${technologyId}:adoption:${state.technology.adoptions.filter(a => a.studioId === own).length}`
    const stageQuote = queryFacilityInstallation(state, {blueprintId: entry.stageInstallationId, targetFacilityId: action.stageFacilityId})
    const postQuote = newPost ? queryFacilityInstallation(state, {blueprintId: entry.postInstallationId!, targetFacilityId: postFacilityId!}) : null
    const installationRefusal = installationRefusalSentence([stageQuote, postQuote])
    if (installationRefusal !== null) throw new Error(installationRefusal)
    if (!canAfford(state, quote.total).ok) throw new Error(INSTALLATION_CASH_REFUSAL)
    let next = charge(state, equipment.cost, `technology-equipment:${id}`)
    const before = new Set(next.placement.facilities.map(p => p.projectId))
    next = commitFacilityInstallation(next, {blueprintId: entry.stageInstallationId, targetFacilityId: action.stageFacilityId})
    if (newPost) next = commitFacilityInstallation(next, {blueprintId: entry.postInstallationId!, targetFacilityId: postFacilityId!})
    const committed = next.placement.facilities.filter(p => !before.has(p.projectId))
    const stagePlacement = committed.find(p => p.blueprintId === entry.stageInstallationId)
    const postPlacement = committed.find(p => p.blueprintId === entry.postInstallationId)
    // The quote priced authored P09 components; the committed placements must be
    // the same work at the same price, or the commitment is not what was quoted.
    const {components: quoted} = adoptionComponents(state, own, request, {
      ...(stagePlacement === undefined ? {} : {stage: stagePlacement.id}),
      ...(postPlacement === undefined ? {} : {post: postPlacement.id})})
    const physical = quoted.filter(c => c.source === 'physical')
    const installationCost = componentTotal(physical)
    if (installationCost !== stageQuote.cost + (postQuote?.cost ?? 0)) throw new Error('This installation quote differs from its authored physical components.')
    const asset = equipment.source === 'existing' || equipment.reusedEquipmentAssetId !== null ? null
      : mintEquipmentAsset(next.technology.nextEquipmentId, own, technologyId, state.market.tick, equipment.source, equipment.cost, id)
    const equipmentAssetId = asset?.id ?? equipment.reusedEquipmentAssetId!
    const components = quoted.map(c => c.kind === 'equipment' ? {...c, equipmentAssetId} : c)
    const row: TechnologyAdoption = {id, studioId: own, technologyId,
      stageFacilityId: action.stageFacilityId, postFacilityId, route: inventor ? 'research' : 'purchase',
      committedWeek: state.market.tick, operationalWeek: null, cancelledWeek: null, equipmentCost: equipment.cost, installationCost,
      physicalProjectIds: committed.map(p => p.projectId),
      prototypeProjectId: equipment.source === 'first-prototype' ? access.researchProjectId : null,
      components, equipmentAssetId}
    return {...next, technology: {...next.technology, adoptions: [...next.technology.adoptions, row],
      equipment: asset === null
        ? next.technology.equipment.map(e => e.id === equipmentAssetId ? {...e, holderAdoptionId: id} : e)
        : [...next.technology.equipment, asset],
      nextEquipmentId: asset === null ? next.technology.nextEquipmentId : next.technology.nextEquipmentId + 1}}
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
    const work = technologyEntry(p.technologyId).work
    const quote = researchWeekQuote(state, p)
    const staffedNextWeek = eligibleSeatIds(state, p, nextWeek).length > 0
    if (quote.output === 0) return p.status === 'active' && !staffedNextWeek ? {...p, status: 'paused' as const} : p
    if (quote.spend > 0) entries.push({week:state.market.tick, kind:'researchSpend', amount:-quote.spend, note:`research:${p.id}`})
    const before = Math.round(p.verifiedWork * PROJECT_UNIT)
    const units = Math.min(cooperationUnits(quote.labs), work * PROJECT_UNIT - before)
    const verifiedWork = (before + units) / PROJECT_UNIT
    const complete = verifiedWork >= work
    // Access identity is the exact (studio, technology) pair: completion grants only
    // THIS technology, is skipped only when THIS technology is already acquired, and
    // replaces only THIS technology's pending row. One project exists per pair, so
    // the grant never depends on the order of `projects`.
    if (complete && !access.some(a => a.studioId === p.studioId && a.technologyId === p.technologyId && a.acquiredWeek !== null)) {
      const pending = access.findIndex(a => a.studioId === p.studioId && a.technologyId === p.technologyId)
      if (pending >= 0) access.splice(pending, 1)
      access.push({studioId:p.studioId, technologyId:p.technologyId, route:'research', chosenWeek:p.startedWeek!,
        acquiredWeek:nextWeek, accessCost:0, researchProjectId:p.id})
    }
    return {...p, verifiedWork, expenditure:p.expenditure+quote.spend,
      weeks: [...p.weeks, {week: state.market.tick, seatTalentIds: quote.seatTalentIds, spend: quote.spend, units,
        labs: quote.labs.map(({laboratoryFacilityId, seatTalentIds, spend, rawUnits}) => ({laboratoryFacilityId, seatTalentIds, spend, rawUnits}))}],
      status:complete?'completed' as const:!staffedNextWeek?'paused' as const:p.status,
      completedWeek:complete?nextWeek:null}
  })
  return {technology:{...state.technology,projects,access}, entries, cost:entries.reduce((sum,e)=>sum-e.amount,0)}
}

/**
 * Capability follows P09's completed physical facts; research alone cannot grant
 * it. Per technology (P13B-S5): the player's adoption is operational when every
 * `physical` component's placement is operational and every `existing`
 * component's facility is; abstract rival plant keeps its deployment clock.
 */
export function finishTechnologyWeek(state: GameState): GameState {
  const adoptions = state.technology.adoptions.map(a => {
    if (a.operationalWeek !== null) return a
    // P13B-S6: a cancelled adoption is skipped for good. The player's own is already
    // incomplete by its placements, but a rival's deployment is a CLOCK — without
    // this it would quietly go operational on work that was stopped.
    if ((a.cancelledWeek ?? null) !== null) return a
    const player = a.studioId === state.hollywood?.playerStudioId
    const complete = player
      ? adoptionPhysicalComplete(state, a)
      : state.market.tick >= a.committedWeek + technologyEntry(a.technologyId).deploymentWeeks
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
/** Every root the technology validators read: the live v4 state and its three frozen predecessors. */
type TechnologyBearingState = GameState | GameStateV20 | GameStateV21 | GameStateV23
function validator(state: TechnologyBearingState): Validator {
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
/**
 * Root shape, access, adoptions, loadouts, adoption ledger and payroll: identical
 * law for every root. The root is READ through the live shape and every v4-only
 * fact is gated on the stored version, so an older root is never taught a newer
 * one and never silently tolerates one.
 */
function validateSharedTechnology(state: TechnologyBearingState, v: Validator, projectIds: Set<string>, completedProjects: Map<string, number>): void {
  const {fail, exact, integer, text, week, studio, own} = v
  const root = state.technology as StudioTechnology
  const full = state as GameState
  const accesses = new Set<string>()
  for (const a of root.access) {
    exact(a,['studioId','technologyId','route','chosenWeek','acquiredWeek','accessCost','researchProjectId'])
    studio(a.studioId);knownTechnology(a.technologyId);week(a.chosenWeek);integer(a.accessCost)
    const accessKey = `${a.studioId}/${a.technologyId}`
    if (accesses.has(accessKey)) fail('duplicate technology access');accesses.add(accessKey)
    if (!['wait','research','purchase'].includes(a.route)) fail('unknown access route')
    if (a.acquiredWeek !== null) {week(a.acquiredWeek); if (a.acquiredWeek < a.chosenWeek) fail('access before choice')}
    if (a.route === 'wait') {if (a.acquiredWeek !== null || a.accessCost !== 0 || a.researchProjectId !== null) fail('waiting granted unpurchased capability')}
    if (a.route === 'research') {
      const completedWeek = a.researchProjectId === null ? undefined : completedProjects.get(`${a.studioId}/${a.researchProjectId}`)
      if (completedWeek === undefined || completedWeek !== a.acquiredWeek || a.accessCost !== 0) fail('invented invention provenance')
    }
    const entry = technologyEntry(a.technologyId)
    if (a.route === 'purchase' && (a.acquiredWeek === null || a.acquiredWeek < entry.commercialWeek || a.accessCost !== entry.accessCost || a.researchProjectId !== null)) fail('invalid commercial access')
  }
  const stages = new Set<string>(), adoptionIds = new Set<string>(), prototypes = new Set<string>(), heldAssets = new Set<string>()
  const v4 = (root.version as number) === 4
  if(root.adoptions.filter(a=>a.studioId!==own).length>1) fail('Core permits one rival commercial adoption consequence')
  for (const a of root.adoptions) {
    // P13B-S6: the live V26 row carries `cancelledWeek`; the frozen V25 chain reads the same root after
    // `validateSaveV26` strips it, so the live validator accepts both shapes and validates the leaf when present.
    const withCancellation = v4 && Object.hasOwn(a, 'cancelledWeek')
    exact(a, v4
      ? ['id','studioId','technologyId','stageFacilityId','postFacilityId','route','committedWeek','operationalWeek','equipmentCost','installationCost','physicalProjectIds','prototypeProjectId','components','equipmentAssetId', ...(withCancellation ? ['cancelledWeek'] : [])]
      : ['id','studioId','technologyId','stageFacilityId','postFacilityId','route','committedWeek','operationalWeek','equipmentCost','installationCost','physicalProjectIds','prototypeProjectId'])
    if (withCancellation) {
      const cancelledWeek = (a as unknown as {cancelledWeek: unknown}).cancelledWeek
      if (cancelledWeek !== null) {
        if (typeof cancelledWeek !== 'number') fail('cancelledWeek must be a week or null')
        const cancelled = cancelledWeek as number
        week(cancelled)
        if (cancelled < a.committedWeek) fail('adoption cancelled before it was committed')
        if (a.operationalWeek !== null) fail('a cancelled adoption cannot be operational')
      }
    }
    studio(a.studioId);knownTechnology(a.technologyId);text(a.id);week(a.committedWeek);integer(a.equipmentCost);integer(a.installationCost)
    const entry = technologyEntry(a.technologyId)
    if (!['research','purchase'].includes(a.route) || !technologyAccess(state,a.studioId,a.technologyId)) fail('adoption without lawful access')
    const access=root.access.find(access=>access.studioId===a.studioId && access.technologyId===a.technologyId)!
    if(access.acquiredWeek===null || access.acquiredWeek>a.committedWeek || access.route!==a.route) fail('adoption precedes or misrepresents acquired access')
    // Per technology (P13B-S5): one adoption per (studio, technology, stage). A
    // lighting fit-out and a sound conversion are different work on one stage.
    const stageKey = `${a.studioId}/${a.technologyId}/${a.stageFacilityId}`
    if (stages.has(stageKey) || adoptionIds.has(a.id)) fail('duplicate adoption');stages.add(stageKey);adoptionIds.add(a.id)
    const operations = a.studioId === own ? state.operations : state.hollywood!.businesses.find(b => b.studioId === a.studioId)?.operations
    if (!operations?.facilities.some(f => f.id === a.stageFacilityId && f.capability === 'soundstage')) fail('adoption has no exact compatible chain')
    if (entry.postInstallationId === null) {
      if (a.postFacilityId !== null) fail('adoption names a Post facility for a technology with no Post component')
    } else if (a.postFacilityId === null || !operations!.facilities.some(f => f.id === a.postFacilityId && f.capability === 'post')) fail('adoption has no exact compatible chain')
    if (!Array.isArray(a.physicalProjectIds) || new Set(a.physicalProjectIds).size !== a.physicalProjectIds.length) fail('invalid physical project references')
    if (a.studioId === own) {
      const jobs = a.physicalProjectIds.map(id => state.placement.facilities.find(p => p.projectId === id))
      if (jobs.length < 1 || jobs.length > 2 || jobs.some(p => !p?.installation)) fail('missing P09 physical owner')
      if (!jobs.some(p => p?.blueprintId === entry.stageInstallationId && p.installation?.targetFacilityId === a.stageFacilityId)) fail('stage job mismatch')
      if(jobs.some(p=>p!.placedWeek!==a.committedWeek || !(p!.blueprintId===entry.stageInstallationId&&p!.installation!.targetFacilityId===a.stageFacilityId || p!.blueprintId===entry.postInstallationId&&p!.installation!.targetFacilityId===a.postFacilityId))) fail('physical job time or its stage or Post target differs from adoption')
      const post=entry.postInstallationId===null ? undefined : state.placement.facilities.find(p=>p.blueprintId===entry.postInstallationId&&p.installation?.targetFacilityId===a.postFacilityId)
      if(entry.postInstallationId!==null && (!post || !a.physicalProjectIds.includes(post.projectId) && (post.status!=='operational'||post.completesWeek>a.committedWeek))) fail('adoption lacks its compatible Post commitment')
      const completesWeek=Math.max(...jobs.map(p=>p!.completesWeek),...(post ? [post.completesWeek] : []))
      // P13B-S6: an adoption with CANCELLED physical work is exempt from this clause
      // and from nothing else. Its committed completion week goes on passing while
      // the work stays stopped, so demanding an operational receipt for it would make
      // a lawful cancelled campaign unsavable. The cancelled record itself is read
      // here (rather than the adoption's own `cancelledWeek`) because the frozen V24
      // delegation strips that leaf, and both must reach the same verdict.
      const cancelledWork = jobs.some(p=>p!.status==='cancelled') || post?.status==='cancelled'
      if(cancelledWork && a.operationalWeek!==null) fail('capability on cancelled physical work')
      if(!cancelledWork && (a.operationalWeek!==null && a.operationalWeek!==completesWeek || a.operationalWeek===null && completesWeek<=state.market.tick)) fail('operational receipt differs from exact physical completion')
      const capex = state.ledger.filter(e => e.kind === 'constructionCapex' && a.physicalProjectIds.includes(e.constructionProjectId)).reduce((s,e)=>s-e.amount,0)
      if (capex !== a.installationCost) fail('physical commitment does not reconcile')
      if (a.operationalWeek !== null && !adoptionChainOperational(full, a as TechnologyAdoption)) fail('capability before physical completion')
    } else if (a.physicalProjectIds.length || a.route !== 'purchase' || a.equipmentCost !== entry.commercialEquipmentCost || a.installationCost !== installationCatalogueCost(entry) || a.committedWeek < entry.commercialWeek) fail('rival has fabricated physical or research authority')
    let equipmentSource = ''
    if (v4) {
      const row = a as TechnologyAdoption
      if (!Array.isArray(row.components) || row.components.length === 0) fail('adoption without its component rows')
      let physicalSum = 0, equipmentRows = 0, accessRows = 0
      for (const c of row.components) {
        exact(c,['kind','label','cost','weeks','source','placementId','equipmentAssetId']);text(c.label)
        if (!['access','equipment','site','installation','capture','post'].includes(c.kind)) fail('unknown adoption component kind')
        if (!['commercial','first-prototype','later-inventor','existing','physical'].includes(c.source)) fail('unknown adoption component source')
        if (!Number.isSafeInteger(c.cost) || c.cost < 0) fail('negative or invalid adoption component cost')
        if (c.weeks !== null) integer(c.weeks)
        if (c.kind === 'post' && entry.postInstallationId === null) fail('adoption carries a Post component for a technology with no Post')
        if (c.source === 'physical') physicalSum += c.cost
        if (c.kind === 'access') {accessRows++;if (c.cost !== 0) fail('adoption charges for access it acquired before committing')}
        if (c.kind === 'equipment') {
          equipmentRows++;equipmentSource = c.source
          if (c.equipmentAssetId !== row.equipmentAssetId) fail('adoption equipment component names a different equipment asset')
          if (c.cost !== a.equipmentCost) fail('adoption components do not reconcile with the retained equipment commitment')
        }
        if (c.source === 'physical' && a.studioId === own) {
          const placed = state.placement.facilities.find(p => p.id === c.placementId)
          if (!placed?.installation) fail('adoption component names no committed stage or Post placement')
          const target = placed!.blueprintId === entry.stageInstallationId ? a.stageFacilityId
            : placed!.blueprintId === entry.postInstallationId ? a.postFacilityId : null
          if (target === null || placed!.installation!.targetFacilityId !== target) fail('adoption component names a placement outside its own stage or Post')
          if (!a.physicalProjectIds.includes(placed!.projectId)) fail('adoption component names work outside its retained physical commitment')
        } else if (c.source === 'physical' && c.placementId !== null) fail('adoption component names a placement this studio does not own')
        if (c.source === 'existing' && c.kind === 'post' && !(a.postFacilityId !== null && entry.postInstallationId !== null &&
          hasOperationalFacilityInstallation(full,a.postFacilityId,entry.postInstallationId))) fail('adoption reuses a Post fit-out that is not operational')
      }
      if (equipmentRows !== 1) fail('adoption needs exactly one equipment component')
      if (accessRows !== 1) fail('adoption needs exactly one access component')
      if (physicalSum !== a.installationCost) fail('adoption components do not sum to the retained installation commitment')
      if (row.equipmentAssetId === null) fail('adoption without its equipment asset')
      const asset = root.equipment.find(e => e.id === row.equipmentAssetId)
      if (!asset || asset.studioId !== a.studioId || asset.technologyId !== a.technologyId) fail('adoption names an unknown equipment asset')
      // P13B-S6: an adoption whose physical work was cancelled LETS GO of its asset
      // (so a restart reuses it at $0) while keeping the reference as history, so a
      // null holder is lawful for it — and only for it.
      const cancelled = a.studioId === own && a.physicalProjectIds.some(id =>
        state.placement.facilities.some(p => p.projectId === id && p.status === 'cancelled'))
      if (asset!.holderAdoptionId !== a.id && !(cancelled && asset!.holderAdoptionId === null) || heldAssets.has(asset!.id)) fail('equipment asset is held by another adoption')
      if (asset!.holderAdoptionId !== null) heldAssets.add(asset!.id)
    }
    if (a.operationalWeek !== null) {week(a.operationalWeek);if (a.operationalWeek < a.committedWeek + entry.deploymentWeeks) fail('installation finished early')}
    if (a.prototypeProjectId !== null) {
      const completedWeek = completedProjects.get(`${a.studioId}/${a.prototypeProjectId}`)
      if (prototypes.has(a.prototypeProjectId) || a.equipmentCost !== 0 || completedWeek === undefined || completedWeek > a.committedWeek) fail('prototype charged or credited twice')
      prototypes.add(a.prototypeProjectId)
    } else if (a.equipmentCost !== (v4
      ? equipmentSource === 'existing' ? 0 : equipmentSource === 'later-inventor' ? entry.laterInventorEquipmentCost : entry.commercialEquipmentCost
      : a.route === 'research' ? entry.laterInventorEquipmentCost : entry.commercialEquipmentCost)) fail('equipment charge mismatch')
    if (v4 && equipmentSource !== 'existing' && (equipmentSource === 'commercial') !== (a.route === 'purchase')) fail('equipment route differs from the adoption route')
  }
  if (v4) {
    integer(root.nextEquipmentId)
    const assetIds = new Set<string>(), prototypeAssets = new Set<string>()
    for (const e of root.equipment) {
      exact(e,['id','studioId','technologyId','acquiredWeek','source','cost','holderAdoptionId'])
      studio(e.studioId);knownTechnology(e.technologyId);text(e.id);week(e.acquiredWeek);integer(e.cost)
      if (assetIds.has(e.id)) fail('duplicate equipment asset identity');assetIds.add(e.id)
      const prefix = `${e.studioId}:equipment:`
      const index = e.id.startsWith(prefix) ? Number(e.id.slice(prefix.length)) : Number.NaN
      if (!Number.isSafeInteger(index) || index < 0 || index >= root.nextEquipmentId) fail('invalid equipment asset identity')
      const entry = technologyEntry(e.technologyId)
      if (!['first-prototype','later-inventor','commercial'].includes(e.source)) fail('unknown equipment asset source')
      if (e.cost !== (e.source === 'first-prototype' ? 0 : e.source === 'later-inventor' ? entry.laterInventorEquipmentCost : entry.commercialEquipmentCost)) fail('equipment asset cost differs from its acquisition route')
      if (e.source === 'first-prototype') {
        const key = `${e.studioId}/${e.technologyId}`
        if (prototypeAssets.has(key)) fail('a second first-prototype equipment asset for one research project');prototypeAssets.add(key)
      }
      if (e.holderAdoptionId !== null) {
        const holder = root.adoptions.find(a => a.id === e.holderAdoptionId)
        if (!holder || holder.equipmentAssetId !== e.id || holder.studioId !== e.studioId || holder.technologyId !== e.technologyId) fail('equipment asset names a holder that does not hold it')
      }
    }
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
function validateRootShape(state: TechnologyBearingState, v: Validator, version: 1 | 2 | 3 | 4): void {
  const {fail, exact, integer} = v
  const root = state.technology as StudioTechnology
  exact(root, version === 4
    ? ['version','recordingStartedWeek','cooperationFromWeek','projects','access','adoptions','productions','equipment','nextEquipmentId']
    : version === 3
    ? ['version','recordingStartedWeek','cooperationFromWeek','projects','access','adoptions','productions']
    : ['version','recordingStartedWeek','projects','access','adoptions','productions'])
  if ((root.version as number) !== version) fail('unknown version')
  integer(root.recordingStartedWeek,0,state.market.tick)
  // The week the cooperation law took effect: minted at founding, or stamped at the
  // V21→V22 migration. A real, never future-dated week; it is deliberately not tied
  // to recordingStartedWeek, so a forged recording boundary keeps its own refusal.
  if (version >= 3) integer(root.cooperationFromWeek,0,state.market.tick)
  for (const rows of [root.projects,root.access,root.adoptions,root.productions]) if (!Array.isArray(rows)) fail('array required')
  if (state.studioHistory.rows.some(r=>r.kind==='technologyMilestone' && r.week<=root.recordingStartedWeek)) fail('invented technology history before recording began')
  if ((!state.hollywood || state.founding !== null) && [root.projects,root.access,root.adoptions,root.productions].some(a => a.length)) fail('unfounded or non-player corpus cannot hold technology authority')
}

/** Exact, campaign-local P13B boundary for the live v4 root. It never repairs or invents a receipt. */
export function validateTechnology(state: GameState): void {
  validateTechnologyRoot(state, 4)
}
/**
 * Frozen P13B-S3 validator for a genuine V23 (and V22) root — technology root v3:
 * no component rows, no equipment assets, a Post facility on every adoption. It
 * reads the SAME law as the live root with every v4-only fact gated off by the
 * stored version, so a v3 save is never asked for a fact it could not carry.
 */
export function validateTechnologyV3(state: GameStateV23): void {
  validateTechnologyRoot(state as unknown as GameState, 3)
}
function validateTechnologyRoot(state: GameState, version: 3 | 4): void {
  const v = validator(state)
  const {fail, exact, integer, text, week, studio, own} = v
  validateRootShape(state, v, version)
  const root = state.technology as StudioTechnology
  const ids = new Set<string>(), technologies = new Set<string>(), seatHolders = new Set<string>()
  const occupiedByLab = new Map<string, number>()
  const completed = new Map<string, number>()
  const employment = (state.hollywood?.employment ?? []).filter(c => c.studioId === own)
  const employedThatWeek = (talentId: string, at: number) => employment.some(c => c.terms.talentId === talentId &&
    c.terms.startWeek <= at && at < c.terms.endWeekExclusive && (c.endedWeek === null || at < c.endedWeek))
  // A repeated charge for one project week is a duplicated payment, not a
  // reconciliation gap: name it before any per-project receipt arithmetic can
  // read the same forged row as an expenditure mismatch.
  const chargedWeeks = new Set<string>()
  for (const e of state.ledger) {
    if (e.kind !== 'researchSpend') continue
    const key = `${e.note}/${e.week}`
    if (chargedWeeks.has(key)) fail('repeated research charge for one project week');chargedWeeks.add(key)
  }
  for (const p of root.projects) {
    exact(p,['id','studioId','technologyId','laboratoryFacilityId','status','budgetPerWeek','verifiedWork','expenditure','startedWeek','completedWeek','seats','weeks','legacy'])
    knownTechnology(p.technologyId);studio(p.studioId);text(p.id)
    const entry = technologyEntry(p.technologyId)
    const WORK = entry.work * PROJECT_UNIT
    if (p.studioId !== own || p.id !== `${own}:research:${p.technologyId}` || ids.has(p.id)) fail('invalid research ownership or identity')
    ids.add(p.id)
    if (technologies.has(p.technologyId)) fail('one research project per studio and technology');technologies.add(p.technologyId)
    budget(p.budgetPerWeek);integer(p.expenditure)
    if (!Number.isFinite(p.verifiedWork) || p.verifiedWork < 0 || p.verifiedWork > entry.work) fail('invalid verified work')
    const verifiedWorkUnits = Math.round(p.verifiedWork * PROJECT_UNIT)
    if (p.verifiedWork !== verifiedWorkUnits / PROJECT_UNIT) fail('verified work is not a whole-dollar research unit')
    if (!['active','paused','cancelled','completed'].includes(p.status)) fail('unknown research status')
    const lab = state.operations.facilities.find(f => f.id === p.laboratoryFacilityId && f.capability === 'laboratory')
    if (!lab) fail('unknown Laboratory')
    if (!Array.isArray(p.seats) || !Array.isArray(p.weeks)) fail('array required')
    const seatLabs = new Set<string>(), staffedLabs = new Set<string>()
    for (const s of p.seats) {
      exact(s,['talentId','laboratoryFacilityId','assignedWeek','releasedWeek']);text(s.talentId)
      if (state.talent.find(t => t.id === s.talentId)?.role !== 'scientist') fail('unknown Scientist')
      if (!state.operations.facilities.some(f => f.id === s.laboratoryFacilityId && f.capability === 'laboratory')) fail('seat outside a Laboratory of this studio')
      seatLabs.add(s.laboratoryFacilityId)
      week(s.assignedWeek)
      if (s.releasedWeek !== null) {week(s.releasedWeek);if (s.releasedWeek < s.assignedWeek) fail('seat released before assignment')}
      else {
        if (seatHolders.has(s.talentId)) fail('double assigned Scientist');seatHolders.add(s.talentId)
        staffedLabs.add(s.laboratoryFacilityId)
        occupiedByLab.set(s.laboratoryFacilityId,(occupiedByLab.get(s.laboratoryFacilityId) ?? 0)+1)
      }
    }
    if (staffedLabs.size > 2) fail('research project staffs more than two Laboratories')
    if (p.startedWeek !== null) {week(p.startedWeek); if (p.startedWeek < entry.researchableWeek) fail('research before eligibility')}
    else if (p.verifiedWork !== 0 || p.expenditure !== 0 || p.status === 'active' || p.status === 'completed' || p.weeks.length || p.legacy !== null) fail('invented research before start')
    if (p.completedWeek !== null) {week(p.completedWeek);if (p.startedWeek === null || p.completedWeek <= p.startedWeek || p.verifiedWork !== entry.work || p.status !== 'completed') fail('invalid completion')}
    else if (p.verifiedWork === entry.work || p.status === 'completed') fail('missing research completion receipt')
    if (p.completedWeek !== null) completed.set(`${p.studioId}/${p.id}`, p.completedWeek)
    // Elapsed capacity is bounded by every Laboratory this project's seats ever named, not only its home body.
    const seatCapacity = [...seatLabs].reduce((sum,labId) => sum + (state.operations.facilities.find(f => f.id === labId)?.capacity ?? 0), 0) || lab!.capacity
    if (p.startedWeek !== null && verifiedWorkUnits > ((p.completedWeek ?? state.market.tick) - p.startedWeek) * seatCapacity * 240_000) fail('verified work exceeds elapsed capacity of the Laboratory seats')
    let units = 0, spend = 0, receiptsFrom = p.startedWeek
    const legacy = p.legacy
    if (legacy !== null) {
      exact(legacy,['scientistId','throughWeek','verifiedWork','expenditure']);text(legacy.scientistId);integer(legacy.expenditure)
      if (state.talent.find(t => t.id === legacy.scientistId)?.role !== 'scientist') fail('unknown legacy Scientist')
      const startedWeek = p.startedWeek ?? fail('legacy prefix without a start')
      week(legacy.throughWeek);if (legacy.throughWeek < startedWeek) fail('legacy prefix precedes its start')
      units = Math.round(legacy.verifiedWork * PROJECT_UNIT)
      if (!Number.isFinite(legacy.verifiedWork) || legacy.verifiedWork < 0 || legacy.verifiedWork !== units / PROJECT_UNIT || units > WORK) fail('invalid legacy verified work')
      const elapsed = Math.min(p.completedWeek ?? legacy.throughWeek, legacy.throughWeek) - startedWeek
      if (units > elapsed * 240_000) fail('legacy work exceeds one Scientist elapsed capacity')
      if (units > FIRST_LAB_FACTOR * (elapsed * WORK_UNIT + legacy.expenditure)) fail('legacy research acceleration was not paid')
      spend = legacy.expenditure
      receiptsFrom = legacy.throughWeek
    }
    if (p.weeks.length > 65) fail('research receipts exceed the bounded history')
    let last = -1
    for (const [index, r] of p.weeks.entries()) {
      exact(r,['week','seatTalentIds','spend','units','labs']);week(r.week);integer(r.spend);integer(r.units,1)
      if (receiptsFrom === null || r.week < receiptsFrom || r.week <= last || p.completedWeek !== null && r.week >= p.completedWeek) fail('research receipt outside its worked interval')
      last = r.week
      if (!Array.isArray(r.seatTalentIds) || r.seatTalentIds.length < 1 || new Set(r.seatTalentIds).size !== r.seatTalentIds.length) fail('research receipt without distinct seats')
      for (const talentId of r.seatTalentIds) {
        if (!p.seats.some(s => s.talentId === talentId && s.assignedWeek <= r.week && (s.releasedWeek === null || s.releasedWeek > r.week))) fail('research receipt names an unseated person')
        if (!employedThatWeek(talentId, r.week)) fail('research receipt names an unemployed Scientist')
      }
      if (r.spend > entry.usableBudgetPerScientist * r.seatTalentIds.length) fail('research charge exceeds its usable seats')
      const final = index === p.weeks.length - 1 && p.completedWeek !== null
      const labs = r.labs
      if (labs !== null) {
        if (!Array.isArray(labs) || labs.length < 1 || labs.length > 2) fail('research receipt names more than two Laboratories')
        const rowSeats: string[] = []
        for (const [labIndex, l] of labs.entries()) {
          exact(l,['laboratoryFacilityId','seatTalentIds','spend','rawUnits']);text(l.laboratoryFacilityId);integer(l.spend);integer(l.rawUnits,1)
          if (labIndex > 0 && labs[labIndex-1]!.laboratoryFacilityId >= l.laboratoryFacilityId) fail('per-Laboratory research rows are not in ascending Laboratory order')
          if (!Array.isArray(l.seatTalentIds) || l.seatTalentIds.length < 1) fail('per-Laboratory research row without its seats')
          for (const talentId of l.seatTalentIds) {
            if (!r.seatTalentIds.includes(talentId)) fail('per-Laboratory research row names a person outside this receipt')
            if (!p.seats.some(s => s.talentId === talentId && s.laboratoryFacilityId === l.laboratoryFacilityId && s.assignedWeek <= r.week && (s.releasedWeek === null || s.releasedWeek > r.week))) fail('receipt names a Laboratory without a seat')
            rowSeats.push(talentId)
          }
          if (l.spend > entry.usableBudgetPerScientist * l.seatTalentIds.length) fail('per-Laboratory research charge exceeds its usable seats')
        }
        if (new Set(rowSeats).size !== rowSeats.length || rowSeats.length !== r.seatTalentIds.length) fail('per-Laboratory research rows do not account for exactly this receipt\u2019s seats')
        if (labs.reduce((sum,l) => sum + l.spend, 0) !== r.spend) fail('per-Laboratory research charges do not sum to the receipt')
      }
      if (r.week >= root.cooperationFromWeek) {
        const rows = labs ?? fail('single-pool receipt after cooperation began')
        const split = fundingSplit(rows.map(l => ({laboratoryFacilityId: l.laboratoryFacilityId, seatTalentIds: l.seatTalentIds})), r.spend)
        if (rows.some((l,labIndex) => split[labIndex]!.spend !== l.spend)) fail('per-Lab research split does not match the funding rule')
        if (rows.some((l,labIndex) => split[labIndex]!.rawUnits !== l.rawUnits)) fail('per-Laboratory raw research output does not match its seats and charge')
        const earned = cooperationUnits(rows)
        if (final ? r.units > earned || units + r.units !== WORK : r.units !== earned) fail('research credit does not match the cooperation rule')
      } else {
        // Written before cooperation began: one pool over 1/20,000, rebased \u00d78 by the
        // governed lift, which names the one Laboratory when every seat sat there and
        // leaves `labs` absent when they did not. A split is never fabricated here.
        if (labs !== null && (labs.length !== 1 || labs[0]!.spend !== r.spend || labs[0]!.rawUnits * FIRST_LAB_FACTOR !== r.units)) fail('single-pool receipt carries a per-Laboratory split it never earned')
        const earned = FIRST_LAB_FACTOR * (r.seatTalentIds.length * WORK_UNIT + r.spend)
        if (final ? r.units > earned || units + r.units !== WORK : r.units !== earned) fail('research receipt units do not match its seats and charge')
      }
      units += r.units;spend += r.spend
      if (units > WORK) fail('research receipts exceed the required work')
    }
    if (units !== verifiedWorkUnits) fail('verified work does not reconcile with its receipts')
    if (spend !== p.expenditure) fail('research expenditure does not reconcile with its receipts')
    const paid = state.ledger.filter(e => e.kind === 'researchSpend' && e.note === `research:${p.id}`).reduce((sum,e) => sum-e.amount,0)
    if (paid !== p.expenditure) fail('research expenditure does not reconcile')
    if (p.status === 'active' && researchPrerequisiteRefusal(state,p)) fail('active research lacks its assigned person or physical prerequisites')
  }
  for (const [labId,count] of occupiedByLab) if (count > (state.operations.facilities.find(f => f.id === labId)?.capacity ?? 0)) fail('Laboratory seats exceed capacity')
  for (const e of state.ledger) {
    if (e.kind !== 'researchSpend') continue
    week(e.week);integer(-e.amount,1)
    const p = root.projects.find(p => e.note === `research:${p.id}`) ?? fail('orphan research expense')
    const startedWeek = p.startedWeek ?? fail('orphan research expense')
    if (e.week < startedWeek || p.completedWeek !== null && e.week >= p.completedWeek) fail('orphan research expense')
    if (e.week < (p.legacy?.throughWeek ?? startedWeek)) {if (-e.amount > technologyEntry(p.technologyId).usableBudgetPerScientist) fail('legacy research charge exceeds one Scientist')}
    else if (p.weeks.find(r => r.week === e.week)?.spend !== -e.amount) fail('research charge without its receipt')
  }
  // Access identity is the exact (studio, technology) pair. A completed project
  // holds its own grant at its own completion week — or the purchased row the
  // studio already owned for that technology, which research never overwrites.
  // The shared law forbids a second row for the same pair.
  for (const p of root.projects) {
    if (p.completedWeek === null) continue
    const granted = root.access.find(a => a.studioId === p.studioId && a.technologyId === p.technologyId)
    if (!granted || (granted.route === 'research'
      ? granted.researchProjectId !== p.id || granted.acquiredWeek !== p.completedWeek
      : granted.route !== 'purchase')) fail('completed research without its access grant')
  }
  validateSharedTechnology(state, v, ids, completed)
}

/**
 * Frozen P13B-S1 validator for a genuine V21 root (single-pool receipts over
 * 1/20,000, seats across at most two Laboratories). Retained verbatim in law;
 * never widened. The live v3 law lives in `validateTechnology` above.
 */
export function validateTechnologyV2(state: GameStateV21): void {
  const full = state as unknown as GameState
  const v = validator(state)
  const {fail, exact, integer, text, week, studio, own} = v
  validateRootShape(state, v, 2)
  const root = state.technology
  const ids = new Set<string>(), technologies = new Set<string>(), seatHolders = new Set<string>()
  const occupiedByLab = new Map<string, number>()
  const completed = new Map<string, number>()
  const employment = (state.hollywood?.employment ?? []).filter(c => c.studioId === own)
  const employedThatWeek = (talentId: string, at: number) => employment.some(c => c.terms.talentId === talentId &&
    c.terms.startWeek <= at && at < c.terms.endWeekExclusive && (c.endedWeek === null || at < c.endedWeek))
  // A repeated charge for one project week is a duplicated payment, not a
  // reconciliation gap: name it before any per-project receipt arithmetic can
  // read the same forged row as an expenditure mismatch.
  const chargedWeeks = new Set<string>()
  for (const e of state.ledger) {
    if (e.kind !== 'researchSpend') continue
    const key = `${e.note}/${e.week}`
    if (chargedWeeks.has(key)) fail('repeated research charge for one project week');chargedWeeks.add(key)
  }
  for (const p of root.projects) {
    exact(p,['id','studioId','technologyId','laboratoryFacilityId','status','budgetPerWeek','verifiedWork','expenditure','startedWeek','completedWeek','seats','weeks','legacy'])
    knownTechnology(p.technologyId);studio(p.studioId);text(p.id)
    const entry = technologyEntry(p.technologyId)
    const WORK = entry.work * WORK_UNIT
    if (p.studioId !== own || p.id !== `${own}:research:${p.technologyId}` || ids.has(p.id)) fail('invalid research ownership or identity')
    ids.add(p.id)
    if (technologies.has(p.technologyId)) fail('one research project per studio and technology');technologies.add(p.technologyId)
    budget(p.budgetPerWeek);integer(p.expenditure)
    if (!Number.isFinite(p.verifiedWork) || p.verifiedWork < 0 || p.verifiedWork > entry.work) fail('invalid verified work')
    const verifiedWorkUnits = Math.round(p.verifiedWork * WORK_UNIT)
    if (p.verifiedWork !== verifiedWorkUnits / WORK_UNIT) fail('verified work is not a whole-dollar research unit')
    if (!['active','paused','cancelled','completed'].includes(p.status)) fail('unknown research status')
    const lab = state.operations.facilities.find(f => f.id === p.laboratoryFacilityId && f.capability === 'laboratory')
    if (!lab) fail('unknown Laboratory')
    if (!Array.isArray(p.seats) || !Array.isArray(p.weeks)) fail('array required')
    const seatLabs = new Set<string>(), staffedLabs = new Set<string>()
    for (const s of p.seats) {
      exact(s,['talentId','laboratoryFacilityId','assignedWeek','releasedWeek']);text(s.talentId)
      if (state.talent.find(t => t.id === s.talentId)?.role !== 'scientist') fail('unknown Scientist')
      if (!state.operations.facilities.some(f => f.id === s.laboratoryFacilityId && f.capability === 'laboratory')) fail('seat outside a Laboratory of this studio')
      seatLabs.add(s.laboratoryFacilityId)
      week(s.assignedWeek)
      if (s.releasedWeek !== null) {week(s.releasedWeek);if (s.releasedWeek < s.assignedWeek) fail('seat released before assignment')}
      else {
        if (seatHolders.has(s.talentId)) fail('double assigned Scientist');seatHolders.add(s.talentId)
        staffedLabs.add(s.laboratoryFacilityId)
        occupiedByLab.set(s.laboratoryFacilityId,(occupiedByLab.get(s.laboratoryFacilityId) ?? 0)+1)
      }
    }
    if (staffedLabs.size > 2) fail('research project staffs more than two Laboratories')
    if (p.startedWeek !== null) {week(p.startedWeek); if (p.startedWeek < entry.researchableWeek) fail('research before eligibility')}
    else if (p.verifiedWork !== 0 || p.expenditure !== 0 || p.status === 'active' || p.status === 'completed' || p.weeks.length || p.legacy !== null) fail('invented research before start')
    if (p.completedWeek !== null) {week(p.completedWeek);if (p.startedWeek === null || p.completedWeek <= p.startedWeek || p.verifiedWork !== entry.work || p.status !== 'completed') fail('invalid completion')}
    else if (p.verifiedWork === entry.work || p.status === 'completed') fail('missing research completion receipt')
    if (p.completedWeek !== null) completed.set(`${p.studioId}/${p.id}`, p.completedWeek)
    // Elapsed capacity is bounded by every Laboratory this project's seats ever named, not only its home body.
    const seatCapacity = [...seatLabs].reduce((sum,labId) => sum + (state.operations.facilities.find(f => f.id === labId)?.capacity ?? 0), 0) || lab!.capacity
    if (p.startedWeek !== null && verifiedWorkUnits > ((p.completedWeek ?? state.market.tick) - p.startedWeek) * seatCapacity * 30_000) fail('verified work exceeds elapsed capacity of the Laboratory seats')
    let units = 0, spend = 0, receiptsFrom = p.startedWeek
    const legacy = p.legacy
    if (legacy !== null) {
      exact(legacy,['scientistId','throughWeek','verifiedWork','expenditure']);text(legacy.scientistId);integer(legacy.expenditure)
      if (state.talent.find(t => t.id === legacy.scientistId)?.role !== 'scientist') fail('unknown legacy Scientist')
      const startedWeek = p.startedWeek ?? fail('legacy prefix without a start')
      week(legacy.throughWeek);if (legacy.throughWeek < startedWeek) fail('legacy prefix precedes its start')
      units = Math.round(legacy.verifiedWork * WORK_UNIT)
      if (!Number.isFinite(legacy.verifiedWork) || legacy.verifiedWork < 0 || legacy.verifiedWork !== units / WORK_UNIT || units > WORK) fail('invalid legacy verified work')
      const elapsed = Math.min(p.completedWeek ?? legacy.throughWeek, legacy.throughWeek) - startedWeek
      if (units > elapsed * 30_000) fail('legacy work exceeds one Scientist elapsed capacity')
      if (units > elapsed * WORK_UNIT + legacy.expenditure) fail('legacy research acceleration was not paid')
      spend = legacy.expenditure
      receiptsFrom = legacy.throughWeek
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
      if (r.spend > entry.usableBudgetPerScientist * r.seatTalentIds.length) fail('research charge exceeds its usable seats')
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
    if (p.status === 'active' && researchPrerequisiteRefusal(full,p)) fail('active research lacks its assigned person or physical prerequisites')
  }
  for (const [labId,count] of occupiedByLab) if (count > (state.operations.facilities.find(f => f.id === labId)?.capacity ?? 0)) fail('Laboratory seats exceed capacity')
  for (const e of state.ledger) {
    if (e.kind !== 'researchSpend') continue
    week(e.week);integer(-e.amount,1)
    const p = root.projects.find(p => e.note === `research:${p.id}`) ?? fail('orphan research expense')
    const startedWeek = p.startedWeek ?? fail('orphan research expense')
    if (e.week < startedWeek || p.completedWeek !== null && e.week >= p.completedWeek) fail('orphan research expense')
    if (e.week < (p.legacy?.throughWeek ?? startedWeek)) {if (-e.amount > technologyEntry(p.technologyId).usableBudgetPerScientist) fail('legacy research charge exceeds one Scientist')}
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
