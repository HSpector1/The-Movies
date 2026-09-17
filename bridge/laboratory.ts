/** P13A's private player Laboratory read side. Engine actions/quotes remain the authority. */
import { applyActions } from '../src/core/actions.js'
import { campaignDate } from '../src/core/calendar.js'
import { activeContract, economyEngaged, offerForTalent, weeklySalary } from '../src/core/employment.js'
import { weeklyBurn, weeklyOverhead } from '../src/core/economyView.js'
import { hasOperationalFacilityInstallation } from '../src/core/facilityEffects.js'
import { blueprintById, facilityInstallationPhase, queryFacilityInstallation } from '../src/core/placement.js'
import { TUNING } from '../src/core/tuning.js'
import { occupiedSeats, playerTechnologyAccess, PROJECT_UNIT, researchCandidates, researchWeekQuote, SYNCHRONIZED_SOUND, weeklyResearchPayroll, RESEARCH_SCIENTISTS_PER_STUDIO } from '../src/core/technology.js'
import type { ResearchWeekQuote } from '../src/core/technology.js'
import { TECHNOLOGY_CATALOGUE, technologyEntry } from '../src/core/technologyCatalogue.js'
import { replacementDescriptor, technologyForecast } from '../src/core/technologyDisclosure.js'
import { adoptionQuote, equipmentAssets, type AdoptionRequest } from '../src/core/technologyAdoption.js'
import { cancellationQuote } from '../src/core/installationCancellation.js'
import { cancellationDetail, cancellationQuoteRow, isCancellationAction, type CancellationAction } from './cancellation.ts'
import type { ResearchProject, ResearchSeat, ResearchWeekReceipt, TechnologyAction, TechnologyAdoption, TechnologyEquipmentAsset } from '../src/core/technologyTypes.js'
import type { PhysicalPlanAction } from '../src/core/physicalPlans.js'
import type { GameState } from '../src/core/types.js'
import type { AvailableIntent } from './protocol.ts'
import type { IndustryPage } from './schema/industry-schema.ts'

type LaboratoryPage = NonNullable<IndustryPage['laboratory']>
type ActionQuoteRow = NonNullable<LaboratoryPage['actions'][number]['quote']>
type AdoptionRow = LaboratoryPage['adoptions'][number]
type ForecastRow = LaboratoryPage['forecast'][number]
type EquipmentRow = LaboratoryPage['equipment'][number]
export type LaboratoryActionSpec = {
  id: string
  buildingId: string | null
  // P13B-S3: the queue companions put a PLAN verb on this page beside the immediate
  // installation row. Same row shape, same dry run; the engine decides both.
  // P13B-S6: a `cancel-adoption-*` row moves neither research nor a plan — it stops
  // committed physical work, returns capital and can commit a restoration.
  action: TechnologyAction | PhysicalPlanAction | CancellationAction
  label: string
  detail: string
  enabled: boolean
  disabledReason: string | null
  /** P13B-S5/S6: the engine's own quote — `adoptionQuote` on `adopt-*` rows, `cancellationQuote` on `cancel-adoption-*` rows. Null everywhere else. */
  quote: ActionQuoteRow | null
}
export type LaboratoryIntent = { spec: LaboratoryActionSpec; option: AvailableIntent }
const money = (value: number) => '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })
const ordered = <T extends { id: string }>(values: readonly T[]) => [...values].sort((a, b) => a.id.localeCompare(b.id, 'en'))
const quotes = new WeakMap<GameState, readonly LaboratoryActionSpec[]>()

function installationDetail(state: GameState, blueprintId: string, facilityId: string): string {
  const quote = queryFacilityInstallation(state, { blueprintId, targetFacilityId: facilityId })
  return `${quote.components.map(c => `${c.label}: ${money(c.cost)}`).join('; ')}. ` +
    `${quote.buildWeeks} weeks of physical work; ready ${campaignDate(quote.completesOnWeek).label}. ` +
    `${money(quote.weeklyOperatingCost)}/week operating cost after completion; no operating charge during work.`
}

/** Read the employee's current contract, never a quoted replacement offer. */
function scientistEmploymentDetail(state: GameState, scientistId: string): string {
  const contract = activeContract(state, scientistId)
  if (!contract) return '$0/week Scientist payroll; no active employment contract. The Laboratory assignment and verified work remain.'
  const overhead = economyEngaged(state) && state.founding === null ? TUNING.OVERHEAD_PER_EMPLOYEE : 0
  return `${money(weeklySalary(contract.annualSalary))}/week Scientist payroll + ${money(overhead)}/week employment overhead for this Scientist. ` +
    `Contract ends ${campaignDate(contract.endWeekExclusive).label}. These employment costs continue while employed, including while research is paused or complete. Studio base overhead and facilities are separate.`
}

/** Committed body-specific work, not a new installation quote or an aggregate chain clock. */
function committedInstallationLabel(state: GameState, facilityId: string, blueprintId: string): string {
  const name = state.operations.facilities.find(f => f.id === facilityId)?.name ?? facilityId
  const blueprint = blueprintById(blueprintId)
  const job = state.placement.facilities.find(p => p.blueprintId === blueprintId && p.installation?.targetFacilityId === facilityId)
  if (!job) return `${name} · ${blueprint?.name ?? blueprintId}: not installed.`
  const rate = blueprint ? money(blueprint.weeklyOperatingCost) + '/week' : 'Operating cost unavailable'
  return `${name} · ${blueprint?.name ?? blueprintId}: ${facilityInstallationPhase(job, state.market.tick)}. ` +
    (job.status === 'operational'
      ? `Completed ${campaignDate(job.completesWeek).label}; ${rate} operating cost on advances after completion.`
      : `Due ${campaignDate(job.completesWeek).label}; ${rate} operating cost after completion, $0 during installation.`)
}

/** Every player research project this Laboratory body carries: homed here, or holding any seat row here. */
function projectsOnLaboratory(state: GameState, own: string, laboratoryFacilityId: string): ResearchProject[] {
  return ordered(state.technology.projects.filter(p => p.studioId === own &&
    (p.laboratoryFacilityId === laboratoryFacilityId || p.seats.some(s => s.laboratoryFacilityId === laboratoryFacilityId))))
}
/** The project holding this person's one occupied seat, across every brief (engine law: one seat per person). */
/**
 * This page is still the synchronized-sound page (P13B-S5-T4 generalizes it per
 * technology): the sound chain rows it prints are the studio's SOUND adoptions,
 * each of which names its own Post facility. A lighting adoption names none and
 * is not a sound chain.
 */
function soundChains(state: GameState, own: string): (TechnologyAdoption & { postFacilityId: string })[] {
  return state.technology.adoptions.flatMap(a => a.studioId === own && a.technologyId === SYNCHRONIZED_SOUND.id && a.postFacilityId !== null
    ? [{ ...a, postFacilityId: a.postFacilityId }] : [])
}
function seatedProject(state: GameState, own: string, talentId: string): ResearchProject | undefined {
  return state.technology.projects.find(p => p.studioId === own && occupiedSeats(p).some(s => s.talentId === talentId))
}
// P13B-S2: one sentence set per project, so the retained top-level synchronized-sound
// members and every `projects[]` row read identically for the same project.
function progressLabelFor(project: ResearchProject): string {
  return `${project.verifiedWork} of ${technologyEntry(project.technologyId).work} verified units · ${project.status}. Verified work survives cancel and restart.`
}
function bottleneckLabelFor(state: GameState, own: string, project: ResearchProject, quote: ResearchWeekQuote): string {
  if (project.status === 'completed') {
    if (project.technologyId !== SYNCHRONIZED_SOUND.id) return `${technologyEntry(project.technologyId).name} research is complete. Physical installation is the remaining capability gate.`
    const name = (id: string) => state.operations.facilities.find(f => f.id === id)?.name ?? id
    const physical = soundChains(state, own)
    const operational = physical.filter(adoption => adoption.operationalWeek !== null)
    return operational.length > 0
      ? `Research is complete. Synchronized dialogue is ready on ${operational.map(adoption => `${name(adoption.stageFacilityId)} + ${name(adoption.postFacilityId)}`).join('; ')}. Select an operational chain before the production enters the filming phase, when its technology locks before the first take.`
      : physical.length > 0 ? 'Research is complete. The committed physical installation must finish before synchronized dialogue is available.'
        : 'Research is complete. Physical installation is the remaining capability gate.'
  }
  return project.status === 'cancelled' && quote.bottleneck === 'Research is paused. Verified work is retained.'
    ? 'Research is cancelled. Verified work is retained for a later restart.'
    : quote.bottleneck
}
function estimateLabelFor(state: GameState, project: ResearchProject, estimate: ResearchWeekQuote | null): string {
  if (project.status === 'completed') return `Research completed ${campaignDate(project.completedWeek!).label}. No further research project is currently available.`
  return estimate !== null && estimate.remainingWeeks !== null
    ? `${project.status === 'active' ? 'At current funding' : project.status === 'cancelled' ? 'If restarted now' : 'If resumed now'}: ${estimate.remainingWeeks} funded weeks remain; estimated research completion ${campaignDate(state.market.tick + estimate.remainingWeeks).label}. Physical installation follows separately.`
    : `No completion estimate while prerequisites are blocked. Research opens ${campaignDate(technologyEntry(project.technologyId).researchableWeek).label}.`
}
/** The quoted week's cooperation as one plain sentence. Laboratories are named by the same facility id `labs[]` publishes. */
function cooperationLabelFor(quote: ResearchWeekQuote): string {
  const [first, second] = quote.labs
  if (!first) return `No research week is quoted: ${quote.bottleneck}`
  if (!second) return `One Laboratory: ${first.seats} seats, ${money(first.spend)} usable, ${first.rawUnits} raw units/week.`
  return `Two Laboratories: ${first.laboratoryFacilityId} ${first.seats} seats ${money(first.spend)} (${first.rawUnits} raw) + ` +
    `${second.laboratoryFacilityId} ${second.seats} seats ${money(second.spend)} (${second.rawUnits} raw) → ${quote.output} units/week; the second Laboratory counts at 0.625.`
}
/**
 * P13B-S7: the ONE sentence every forecast row states its own provenance with. The engine's
 * `technologyForecast` reads the catalogue entry and the week and nothing else, so this is
 * the whole truth about where the row came from.
 */
const FORECAST_BASIS = 'Public milestone facts from the catalogue; not a rival schedule.'
/**
 * One technology's public availability milestone at this week. A WINDOW row withholds the
 * exact commercial week entirely — it is not public yet — and an EXACT row publishes it
 * with the announcement week that made it public. Neither reads a single rival fact.
 */
const forecastRow = (entry: (typeof TECHNOLOGY_CATALOGUE)[number], week: number): ForecastRow => {
  const forecast = technologyForecast(entry, week)
  return {
    technologyId: entry.id, name: entry.name, kind: forecast.kind,
    windowFromLabel: forecast.kind === 'window' ? campaignDate(forecast.fromWeek).label : null,
    windowToLabel: forecast.kind === 'window' ? campaignDate(forecast.toWeek).label : null,
    exactLabel: forecast.kind === 'exact' ? campaignDate(forecast.commercialWeek).label : null,
    announcedWeek: forecast.kind === 'exact' ? forecast.announcedWeek : null,
    basis: FORECAST_BASIS,
  }
}
/**
 * P13B-S7: what a commercial purchase of this technology replaces — the catalogue's own
 * authored sentence, on the purchase and adopt rows alone. A wait row buys nothing and so
 * replaces nothing, and no other verb moves a technology at all.
 */
function replacementLabelFor(action: LaboratoryActionSpec['action']): { replacementLabel?: string } {
  if (action.kind === 'adoptSynchronizedSound') return { replacementLabel: replacementDescriptor(SYNCHRONIZED_SOUND) }
  if (action.kind === 'adoptTechnology' || action.kind === 'purchaseTechnology') return { replacementLabel: replacementDescriptor(technologyEntry(action.technologyId)) }
  return {}
}
/** One committed adoption as data: the engine's own row, copied so the page owns its output. */
const adoptionRow = (adoption: TechnologyAdoption): AdoptionRow => ({
  technologyId: adoption.technologyId, route: adoption.route,
  committedWeek: adoption.committedWeek, operationalWeek: adoption.operationalWeek,
  components: adoption.components.map(component => ({ ...component })),
  equipmentAssetId: adoption.equipmentAssetId, postFacilityId: adoption.postFacilityId,
  // P13B-S6: the week this adoption's remaining physical work was cancelled; null on a
  // live adoption. Published as its own member, never inferred from a missing chain.
  cancelledWeek: adoption.cancelledWeek,
  // P13B-S7: what this adoption's technology replaced, verbatim from the catalogue.
  replacementLabel: replacementDescriptor(technologyEntry(adoption.technologyId)),
})
/** One equipment set this studio owns. `studioId` is dropped: a private page publishes its own rows alone. */
const equipmentRow = (asset: TechnologyEquipmentAsset): EquipmentRow => ({
  id: asset.id, technologyId: asset.technologyId, acquiredWeek: asset.acquiredWeek,
  source: asset.source, cost: asset.cost, holderAdoptionId: asset.holderAdoptionId,
})
const seatRow = (state: GameState, seat: ResearchSeat) => ({
  talentId: seat.talentId, name: state.talent.find(t => t.id === seat.talentId)?.name ?? seat.talentId,
  laboratoryFacilityId: seat.laboratoryFacilityId, assignedWeek: seat.assignedWeek, releasedWeek: seat.releasedWeek,
  employed: activeContract(state, seat.talentId) !== undefined,
})
/** A stored receipt is copied, never repaired: `labs: null` (a single-pool week written before cooperation) stays null. */
const receiptRow = (receipt: ResearchWeekReceipt) => ({
  week: receipt.week, seatTalentIds: [...receipt.seatTalentIds], spend: receipt.spend, units: receipt.units,
  labs: receipt.labs === null ? null : receipt.labs.map(l => ({ laboratoryFacilityId: l.laboratoryFacilityId, seatTalentIds: [...l.seatTalentIds], spend: l.spend, rawUnits: l.rawUnits })),
})
/** The CURRENT week's quote as data. `units` is the same 1/160,000 numerator a receipt would carry; zero when idle. */
const weeklyRow = (project: ResearchProject | null, quote: ResearchWeekQuote | null) => ({
  ceiling: project?.budgetPerWeek ?? 0, usable: quote?.spend ?? 0, seats: quote?.seats ?? 0, output: quote?.output ?? 0,
  units: Math.round((quote?.output ?? 0) * PROJECT_UNIT),
  labs: (quote?.labs ?? []).map(l => ({ laboratoryFacilityId: l.laboratoryFacilityId, seats: l.seats, spend: l.spend, rawUnits: l.rawUnits })),
})
/** One `projects[]` row: this project's own facts, its seats across every Laboratory it works in, and its own quoted week. */
function laboratoryProjectRow(state: GameState, own: string, project: ResearchProject): LaboratoryPage['projects'][number] {
  const entry = technologyEntry(project.technologyId)
  const quote = researchWeekQuote(state, project)
  const estimate = project.status === 'completed' ? null : researchWeekQuote(state, { ...project, status: 'active' })
  return {
    projectId: project.id, technologyId: project.technologyId, technologyLabel: entry.name, status: project.status,
    homeLaboratoryFacilityId: project.laboratoryFacilityId,
    laboratoryFacilityIds: [...new Set(occupiedSeats(project).map(s => s.laboratoryFacilityId))].sort(),
    verifiedWork: project.verifiedWork, work: entry.work, budgetPerWeek: project.budgetPerWeek,
    progressLabel: progressLabelFor(project), bottleneckLabel: bottleneckLabelFor(state, own, project, quote),
    estimateLabel: estimateLabelFor(state, project, estimate), cooperationLabel: cooperationLabelFor(quote),
    seats: project.seats.map(seat => seatRow(state, seat)), receipts: project.weeks.slice(-8).map(receiptRow),
    weekly: weeklyRow(project, quote),
  }
}

/** Bounded by the player's actual facilities/productions, cached only by immutable campaign state. */
export function laboratoryActionSpecs(state: GameState): readonly LaboratoryActionSpec[] {
  const prior = quotes.get(state)
  if (prior) return prior
  const specs: LaboratoryActionSpec[] = []
  if (!state.technology || !state.hollywood || state.founding !== null || !economyEngaged(state)) return specs
  const own = state.hollywood.playerStudioId
  function add(id: string, action: TechnologyAction | PhysicalPlanAction | CancellationAction, label: string, detail: string, buildingId: string | null = null, refusal: string | null = null, quote: ActionQuoteRow | null = null) {
    let disabledReason = refusal
    // P13B-S6: a cancel row is priced and refused by `cancellationQuote` alone — its
    // caller passes that refusal in, and its detail already states the money. A dry run
    // here would only restate a charge as a negative "charged now" and give the row a
    // second refusal authority the engine never asked for.
    if (disabledReason === null && !isCancellationAction(action)) {
      try {
        const next = applyActions(state, [action])
        if (next === state) throw new Error('This decision is not currently available.')
        const paid = state.studio.cash - next.studio.cash
        detail += ` ${money(paid)} charged now. Cash after this decision: ${money(next.studio.cash)}.`
        // P13B-S5: the same retained sentence for either adoption verb — the row minted by
        // this dry run is the one the prior state does not carry.
        if (action.kind === 'adoptSynchronizedSound' || action.kind === 'adoptTechnology') {
          const before = new Set(state.technology.adoptions.map(a => a.id))
          const adoption = next.technology.adoptions.find(a => a.studioId === own && !before.has(a.id))
          if (adoption) detail += ` Equipment charge: ${money(adoption.equipmentCost)}. ` +
            (adoption.prototypeProjectId !== null ? 'Uses this invention’s first prototype entitlement.' : adoption.route === 'research' ? 'Uses the inventor equipment price; the first prototype entitlement has already been used.' : 'Uses commercially purchased equipment.')
        }
        const payroll = weeklyResearchPayroll(next)
        if (payroll !== weeklyResearchPayroll(state)) detail += ` Scientist payroll becomes ${money(payroll)}/week through the employment contract.`
        if (action.kind === 'recruitScientist') detail +=
          ` This hire also adds ${money(weeklyOverhead(next) - weeklyOverhead(state))}/week in studio employment overhead. ` +
          `Total current weekly commitments rise by ${money(weeklyBurn(next) - weeklyBurn(state))}, ` +
          `from ${money(weeklyBurn(state))} to ${money(weeklyBurn(next))}/week. R&D is separate from these employment costs.`
      } catch (error) { disabledReason = (error as Error).message }
    }
    specs.push({ id, action, label, detail, buildingId, enabled: disabledReason === null, disabledReason, quote })
  }
  // P13B-S2: every catalogue brief a seat can still lawfully be opened for — neither
  // completed nor otherwise acquired by this studio. Seating before the brief's research
  // opens is retained P13A law (the engine accepts the seat; begin/weekly work waits for
  // `researchPrerequisiteRefusal`), so the page publishes what the engine accepts and dates
  // the wait on the row instead of hiding the brief.
  const briefs = TECHNOLOGY_CATALOGUE.filter(entry =>
    !playerTechnologyAccess(state, entry.id) &&
    !state.technology.projects.some(p => p.studioId === own && p.technologyId === entry.id && p.status === 'completed'))
  const labs = state.placement.facilities.filter(p => p.blueprintId === 'research-laboratory' && p.installation === undefined)
  const scientists = ordered(state.talent.filter(t => t.role === 'scientist' && activeContract(state, t.id)))
  for (const lab of labs) {
    const buildingId = `placed-${lab.id}`
    const labProjects = projectsOnLaboratory(state, own, lab.facilityId)
    // One selectable row per named candidate who is free to be employed, while
    // the programme still has room for another Scientist (P13B-S1).
    if (scientists.length < RESEARCH_SCIENTISTS_PER_STUDIO) for (const candidate of researchCandidates(state)) {
        if (activeContract(state, candidate.id)) continue
        const offer = offerForTalent(state.seed, candidate, 208, state.market.tick)
        add(`recruit-${lab.id}-${candidate.id}`, { kind: 'recruitScientist', laboratoryFacilityId: lab.facilityId, scientistId: candidate.id },
          `Employ ${candidate.name} · Scientist`,
          `Offer ${candidate.name} a ${offer.termWeeks}-week contract: ${money(weeklySalary(offer.annualSalary))}/week, ` +
          `${money(offer.signingBonus)} signing bonus. ` +
          (seatedProject(state, own, candidate.id) !== undefined
            ? 'Employment resumes now. The existing Laboratory seat and verified work are retained. '
            : 'Employment begins now; assigning a Laboratory seat is a separate decision. ') +
          `This contract ends ${campaignDate(offer.endWeekExclusive).label}. ` +
          (offer.endWeekExclusive <= SYNCHRONIZED_SOUND.researchableWeek
            ? `${offer.endWeekExclusive < SYNCHRONIZED_SOUND.researchableWeek ? 'It ends before research opens' : 'It expires as research opens'} ${campaignDate(SYNCHRONIZED_SOUND.researchableWeek).label}: payroll starts now, and another contract will be needed before this Scientist can begin research.`
            : state.market.tick < SYNCHRONIZED_SOUND.researchableWeek
              ? `Payroll starts now, while research opens ${campaignDate(SYNCHRONIZED_SOUND.researchableWeek).label}.`
              : ''), buildingId)
    }
    // One row per (employed person, lawful brief). The engine's own seat law — this
    // Laboratory's seat cap, the third-Laboratory refusal and one seat per person across
    // briefs — reaches the row as its refusal text through the dry run in `add`.
    const capacity = state.operations.facilities.find(f => f.id === lab.facilityId)?.capacity ?? 0
    const occupiedHere = state.technology.projects.reduce((n, p) => n + occupiedSeats(p, lab.facilityId).length, 0)
    for (const person of scientists) for (const entry of briefs) {
      if (seatedProject(state, own, person.id)?.technologyId === entry.id) continue
      add(`assign-${lab.id}-${person.id}-${entry.id}`,
        { kind: 'assignResearchScientist', laboratoryFacilityId: lab.facilityId, scientistId: person.id, technologyId: entry.id },
        `Assign ${person.name} · ${entry.name}`,
        `Seat this named Scientist on this Laboratory's ${entry.name.toLowerCase()} project (${occupiedHere} of ${capacity} seats occupied). No R&D is charged until the project runs.` +
        (state.market.tick < entry.researchableWeek ? ` Research opens ${campaignDate(entry.researchableWeek).label}; the seat waits until then.` : ''), buildingId)
    }
    for (const project of labProjects) for (const seat of occupiedSeats(project, lab.facilityId)) {
      const person = state.talent.find(t => t.id === seat.talentId)
      add(`release-${lab.id}-${seat.talentId}`, { kind: 'releaseResearchSeat', projectId: project.id, scientistId: seat.talentId },
        `Release ${person?.name ?? seat.talentId}'s seat`, 'Free this Laboratory seat. Employment, payroll and verified work continue unchanged; the seat history is retained.', buildingId)
    }
    if (!hasOperationalFacilityInstallation(state, lab.facilityId, 'acoustic-instruments')) {
      const quote = queryFacilityInstallation(state, { blueprintId: 'acoustic-instruments', targetFacilityId: lab.facilityId })
      const reason = quote.ok ? null : quote.unmetRequirements.map(r => r.reason).join(' ') ||
        (quote.holders.length ? 'This Laboratory has work or an assignment that must finish before acoustic instrument installation.' :
          quote.rejections.includes('alreadyInstalled') ? 'Acoustic instruments are already being installed in this Laboratory.' :
          quote.rejections.includes('insufficientFunds') ? `Acoustic installation requires ${money(quote.cost)} available cash.` : 'Complete this Laboratory before installing its acoustic instruments.')
      add(`instruments-${lab.id}`, { kind: 'installAcousticInstruments', laboratoryFacilityId: lab.facilityId },
        'Install acoustic instruments', installationDetail(state, 'acoustic-instruments', lab.facilityId), buildingId, reason)
    }
    // P13B-S3: the same two Laboratory modules as PLANS. A queued plan reserves nothing —
    // no cash, capacity or engagement moves — so a Lab that is busy today can still be
    // planned; the engine re-quotes and decides at the weekly admission boundary. The
    // ceiling is the price quoted here, which is what the studio is approving.
    for (const module of [
      { key: 'acoustic', blueprintId: 'acoustic-instruments' },
      { key: 'electrical', blueprintId: 'electrical-control-instruments' },
    ] as const) {
      // Not offered when this module is already HERE or already ON ITS WAY: a committed
      // placement on this Lab in any status (under construction or operational), or a
      // non-terminal plan of this studio already aimed at it. A second row could only ever
      // hold on `targetEngaged` and then refuse as `alreadyInstalled` — a false affordance.
      // Engine law is untouched: queueing a duplicate through the action stays lawful.
      if (state.placement.facilities.some(p => p.blueprintId === module.blueprintId && p.installation?.targetFacilityId === lab.facilityId)) continue
      if (state.physicalPlans.plans.some(plan => plan.studioId === own &&
        (plan.status === 'queued' || plan.status === 'held' || plan.status === 'started') &&
        plan.work.kind === 'installation' && plan.work.blueprintId === module.blueprintId &&
        'facilityId' in plan.work.target && plan.work.target.facilityId === lab.facilityId)) continue
      const quote = queryFacilityInstallation(state, { blueprintId: module.blueprintId, targetFacilityId: lab.facilityId })
      const name = blueprintById(module.blueprintId)?.name ?? module.blueprintId
      add(`plan-queue-${module.key}-${lab.id}`,
        { kind: 'queuePhysicalPlan', work: { kind: 'installation', blueprintId: module.blueprintId, target: { facilityId: lab.facilityId } },
          dependsOn: [], approvedMaximumDebit: quote.cost, admission: 'reviewChangedQuote' },
        `Queue ${name.toLowerCase()} installation`,
        `Add this installation to the studio's physical plans at the quoted ${money(quote.cost)}: ${quote.buildWeeks} weeks of physical work, ` +
        `then ${money(quote.weeklyOperatingCost)}/week operating cost. Nothing is reserved until the plan starts — no cash, capacity or engagement ` +
        `moves while it waits — and the plan is quoted again at each weekly boundary. ${money(quote.cost)} is the approved ceiling; a changed quote is held for your review.`,
        buildingId)
    }
    for (const project of labProjects) if (project.status !== 'completed') {
      const entry = technologyEntry(project.technologyId)
      if (project.status !== 'active') add(`run-${project.id}`, project.startedWeek === null
        ? { kind: 'beginResearch', projectId: project.id, budgetPerWeek: project.budgetPerWeek }
        : { kind: 'resumeResearch', projectId: project.id },
      project.startedWeek === null ? `Begin ${entry.name.toLowerCase()} research` : project.status === 'cancelled' ? `Restart retained ${entry.name.toLowerCase()} research` : `Resume ${entry.name.toLowerCase()} research`,
      `Use the assigned Scientist and the project's ${money(project.budgetPerWeek)}/week budget ceiling. Verified work remains ${project.verifiedWork} of ${entry.work} units. Usable R&D is charged only when time advances.`, buildingId)
      if (project.status === 'active') add(`pause-${project.id}`, { kind: 'pauseResearch', projectId: project.id },
        `Pause ${entry.name.toLowerCase()} research`, 'Stop new R&D spend and retain all verified work. The Scientist remains employed and payroll continues.', buildingId)
      if (project.status !== 'cancelled') add(`cancel-${project.id}`, { kind: 'cancelResearch', projectId: project.id },
        `Cancel ${entry.name.toLowerCase()} · retain verified work`, `Retain ${project.verifiedWork} verified units for a later restart. Prior expenditure is not refunded. The employment contract and payroll continue.`, buildingId)
      // P13B-S2-T6: a fixed preset list, so a row id never depends on the seat count.
      // $60,000 and $80,000 exist because a 4+2 and a 4+4 two-Laboratory project can
      // usefully absorb them (companion §4); a ceiling above the usable amount is quoted
      // but never charged, exactly as the row's own detail says.
      for (const amount of [0, 2_500, 10_000, 40_000, 60_000, 80_000]) add(`budget-${project.id}-${amount}`,
        { kind: 'setResearchBudget', projectId: project.id, budgetPerWeek: amount },
        `Set ${entry.name.toLowerCase()} R&D ceiling: ${money(amount)}/week`,
        `Set this project's weekly ceiling to ${money(amount)}. One Scientist can use at most ${money(entry.usableBudgetPerScientist)}/week; money above that is not charged. Payroll is separate. A $0 ceiling allows baseline research work while active.`, buildingId,
        project.budgetPerWeek === amount ? 'This is already the selected budget ceiling.' : null)
    }
  }
  // P13B-S7: the two access decisions, per catalogue technology (P13A published them for
  // synchronized sound alone). Both rows STATE THE EXACT COMMERCIAL WEEK — the wait row in
  // its own text, the purchase row through the engine's own `commercialAccessRefusal`
  // sentence — so they exist only while that week is PUBLIC, which is exactly while this
  // technology's forecast is exact (S7-T3 ruling). That forecast kind is the WHOLE existence
  // rule: sound's window is degenerate, so its two rows are published at every week exactly as
  // P13A published them, and lighting's appear at its announcement week. Whether either row can
  // be taken is the ENGINE's answer alone, through `add`'s dry run — access already held
  // disables both with the engine's own sentence, and a purchase before the commercial week
  // carries `commercialAccessRefusal`. This page hides no decision it can state a reason for.
  for (const entry of TECHNOLOGY_CATALOGUE) {
    if (technologyForecast(entry, state.market.tick).kind !== 'exact') continue
    const word = entry.id === SYNCHRONIZED_SOUND.id ? 'sound' : entry.name.toLowerCase()
    add(`wait-${entry.id}`, { kind: 'waitForTechnology', technologyId: entry.id },
      `Wait for commercial ${word}`, `Record deliberate waiting for ${campaignDate(entry.commercialWeek).label}. No access payment or capability is granted. Existing research and employment continue unless you pause or cancel them separately.`)
    add(`purchase-${entry.id}`, { kind: 'purchaseTechnology', technologyId: entry.id },
      `Purchase ${entry.id} access`, `Commercial access costs ${money(entry.accessCost)} from ${campaignDate(entry.commercialWeek).label}. This buys knowledge access; select and fund an exact stage${entry.postInstallationId === null ? '' : ', capture and Post'} installation separately before filming with ${word}.`)
  }
  const stages = ordered(state.operations.facilities.filter(f => f.capability === 'soundstage'))
  const posts = ordered(state.operations.facilities.filter(f => f.capability === 'post'))
  // P13B-S5: one adopt row per (technology, compatible stage, and — where the technology HAS a
  // Post component — one exact Post). The stage rule is PER TECHNOLOGY: a stage already carrying
  // an adoption of this technology offers no second row for it, while every other technology is
  // still offered on that same stage. Every row publishes the engine's own `adoptionQuote`
  // verbatim, refused or not, so the row never restates a price the engine owns.
  for (const entry of TECHNOLOGY_CATALOGUE) {
    // Synchronized sound keeps its P13A presence: its row is published from week 0 and disabled
    // with the engine's own refusal until access is acquired, which is how the first sound
    // decision is discoverable at all. A technology with NO Post component has no stage/Post
    // pairing to disclose before then, so it appears only once its access exists.
    if (entry.postInstallationId === null && !playerTechnologyAccess(state, entry.id)) continue
    const word = entry.id === SYNCHRONIZED_SOUND.id ? 'sound' : entry.name.toLowerCase()
    for (const stage of stages) {
      if (state.technology.adoptions.some(a => a.studioId === own && a.technologyId === entry.id && a.stageFacilityId === stage.id)) continue
      for (const post of entry.postInstallationId === null ? [null] : posts) {
        const request: AdoptionRequest = { technologyId: entry.id, stageFacilityId: stage.id, ...(post === null ? {} : { postFacilityId: post.id }) }
        const quote = adoptionQuote(state, request)
        // The retained P13A verb keeps synchronized sound's own adoption identity; every other
        // technology commits through `adoptTechnology`, which is the same law and the same quote.
        const action: TechnologyAction = entry.id === SYNCHRONIZED_SOUND.id && post !== null
          ? { kind: 'adoptSynchronizedSound', stageFacilityId: stage.id, postFacilityId: post.id }
          : { kind: 'adoptTechnology', ...request }
        add(`adopt-${entry.id}-${stage.id}${post === null ? '' : `-${post.id}`}`, action,
          post === null ? `Install ${word}: ${stage.name}` : `Install ${word}: ${stage.name} + ${post.name}`,
          `${stage.name}: ${installationDetail(state, entry.stageInstallationId, stage.id)} ` +
          (post === null ? ''
            : hasOperationalFacilityInstallation(state, post.id, entry.postInstallationId!)
              ? `${post.name}: reuse its operational ${word} Post fit-out. `
              : `${post.name}: ${installationDetail(state, entry.postInstallationId!, post.id)} `) +
          'The quoted payment below includes the applicable equipment entitlement. Films that have entered the filming phase keep their technology, even before the first take.',
          null, null, {
            components: quote.components, total: quote.total, reusedPostFacilityId: quote.reusedPostFacilityId,
            reusedEquipmentAssetId: quote.reusedEquipmentAssetId, rejections: quote.rejections, refusal: quote.refusal,
          })
      }
      // P13B-S3's companion rule on this technology's own STAGE blueprint: the same physical
      // work as a PLAN, at its own quoted price. It mints NO adoption — a plan reserves and
      // commits nothing — so the immediate rows above stay offered beside it. Withheld once that
      // blueprint is already committed on this stage in any status, or already queued, held or
      // started against it, exactly as the Laboratory's instrument module companions are.
      if (state.placement.facilities.some(p => p.blueprintId === entry.stageInstallationId && p.installation?.targetFacilityId === stage.id)) continue
      if (state.physicalPlans.plans.some(plan => plan.studioId === own &&
        (plan.status === 'queued' || plan.status === 'held' || plan.status === 'started') &&
        plan.work.kind === 'installation' && plan.work.blueprintId === entry.stageInstallationId &&
        'facilityId' in plan.work.target && plan.work.target.facilityId === stage.id)) continue
      const stageQuote = queryFacilityInstallation(state, { blueprintId: entry.stageInstallationId, targetFacilityId: stage.id })
      const stageName = blueprintById(entry.stageInstallationId)?.name ?? entry.stageInstallationId
      add(`plan-queue-adopt-${entry.id}-${stage.id}`,
        { kind: 'queuePhysicalPlan', work: { kind: 'installation', blueprintId: entry.stageInstallationId, target: { facilityId: stage.id } },
          dependsOn: [], approvedMaximumDebit: stageQuote.cost, admission: 'reviewChangedQuote' },
        `Queue ${stageName.toLowerCase()} on ${stage.name}`,
        `Add this stage installation to the studio's physical plans at the quoted ${money(stageQuote.cost)}: ${stageQuote.buildWeeks} weeks of physical work, ` +
        `then ${money(stageQuote.weeklyOperatingCost)}/week operating cost. This queues the stage work alone: it commits no ${word} adoption and buys no equipment` +
        (entry.postInstallationId === null ? '' : ', and fits out no Post') +
        `. Nothing is reserved until the plan starts — no cash, capacity or engagement moves while it waits — and the plan is quoted again at each weekly boundary. ` +
        `${money(stageQuote.cost)} is the approved ceiling; a changed quote is held for your review.`)
    }
  }
  // P13B-S6: one cancel row per adoption whose physical work is still running. The
  // ENGINE decides: the row exists exactly while `cancellationQuote` accepts the
  // adoption, which is what makes it absent for an operational, an already-cancelled
  // and a rival adoption without this page re-stating any of those three laws.
  for (const adoption of state.technology.adoptions) {
    if (adoption.studioId !== own) continue
    const quote = cancellationQuote(state, { adoptionId: adoption.id })
    if (!quote.ok) continue
    const entry = technologyEntry(adoption.technologyId)
    const row = cancellationQuoteRow(state, { adoptionId: adoption.id })
    add(`cancel-adoption-${adoption.id}`, { kind: 'cancelAdoption', adoptionId: adoption.id },
      `Cancel ${entry.name.toLowerCase()} installation: ${state.operations.facilities.find(f => f.id === adoption.stageFacilityId)?.name ?? adoption.stageFacilityId}`,
      cancellationDetail(state, row) +
      ' The equipment set this adoption bought is retained and can be reused at no equipment cost by a later adoption of the same technology; the knowledge access is unaffected.',
      null, quote.refusal, row)
  }
  const adoptions = state.technology.adoptions.filter(a => a.studioId === own && a.operationalWeek !== null)
  for (const production of ordered(state.studio.activeProductions)) {
    const loadout = state.technology.productions.find(p => p.studioId === own && p.productionId === production.id)
    const title = state.concepts.find(c => c.id === production.conceptId)?.title ?? production.id
    if (loadout?.method === 'synchronized-dialogue') add(`silent-${production.id}`,
      { kind: 'setProductionTechnology', productionId: production.id, method: 'silent', adoptionId: null },
      `Keep ${title} silent`, 'Choose the lawful silent route before this film enters the filming phase. Its technology locks at phase entry, before the first take.')
    for (const adoption of adoptions) {
      if (loadout?.method === 'synchronized-dialogue' && loadout.adoptionId === adoption.id) continue
      const stage = stages.find(s => s.id === adoption.stageFacilityId), post = posts.find(p => p.id === adoption.postFacilityId)
      add(`sound-${production.id}-${adoption.id}`,
        { kind: 'setProductionTechnology', productionId: production.id, method: 'synchronized-dialogue', adoptionId: adoption.id },
        `Use synchronized dialogue: ${title}`, `Select operational ${stage?.name ?? adoption.stageFacilityId} and ${post?.name ?? adoption.postFacilityId} for this exact production. Technology locks when the film enters the filming phase, before the first take; it cannot change after that.`)
    }
  }
  quotes.set(state, specs)
  return specs
}

export function laboratoryPage(state: GameState, buildingId: string | null, intents: readonly LaboratoryIntent[], page: number, pageSize: number): {
  laboratory: LaboratoryPage; totalRows: number; pageCount: number
} {
  const lab = state.placement.facilities.find(p => `placed-${p.id}` === buildingId && p.blueprintId === 'research-laboratory' && p.installation === undefined)
  if (!lab || !state.hollywood || state.founding !== null || !state.technology) throw new Error('That exact Research Laboratory is absent from this campaign.')
  const own = state.hollywood.playerStudioId
  // P13B-S2: the retained top-level members keep their S1b meaning — the synchronized-sound
  // project homed on this exact body. `projects` below carries every project this body works.
  const project = state.technology.projects.find(p => p.studioId === own && p.technologyId === SYNCHRONIZED_SOUND.id && p.laboratoryFacilityId === lab.facilityId) ?? null
  const seats = project ? occupiedSeats(project) : []
  const seatedPeople = seats.map(seat => state.talent.find(t => t.id === seat.talentId)).filter((t): t is NonNullable<typeof t> => t !== undefined)
  const person = seatedPeople[0] ?? null
  const employedScientist = ordered(state.talent.filter(t => t.role === 'scientist' && activeContract(state, t.id) && !seats.some(seat => seat.talentId === t.id)))[0]
  const capacity = state.operations.facilities.find(f => f.id === lab.facilityId)?.capacity ?? 4
  const seatLine = (t: NonNullable<typeof person>) => `${t.name} · ${activeContract(state, t.id) ? 'employed Scientist' : 'contract no longer active'} · ${scientistEmploymentDetail(state, t.id)}`
  const instrumentsOperational = hasOperationalFacilityInstallation(state, lab.facilityId, 'acoustic-instruments')
  const quote = project ? researchWeekQuote(state, project) : null
  const estimate = project && project.status !== 'completed' ? researchWeekQuote(state, { ...project, status: 'active' }) : null
  const access = state.technology.access.find(a => a.studioId === own && a.technologyId === SYNCHRONIZED_SOUND.id)
  const physical = soundChains(state, own)
  const name = (id: string) => state.operations.facilities.find(f => f.id === id)?.name ?? id
  const actions = laboratoryActionSpecs(state).filter(a => a.buildingId === null || a.buildingId === buildingId)
  const pageCount = Math.ceil(actions.length / pageSize)
  if (page > 0 && page >= pageCount) throw new Error('That Laboratory action page is outside this snapshot. Return to the first page.')
  const enabled = new Map(intents.map(i => [i.spec.id, i.option]))
  return { totalRows: actions.length, pageCount, laboratory: {
    buildingId: buildingId!, title: state.operations.facilities.find(f => f.id === lab.facilityId)?.name ?? 'Research Laboratory',
    statusLabel: lab.status === 'operational' ? 'Laboratory operational' : `Laboratory under construction · opens ${campaignDate(lab.completesWeek).label}`,
    seatLabel: `Seats assigned: ${seats.length} of ${capacity}. ${seats.length === 0 ? 'No seat is occupied.' : `Seated: ${seatedPeople.map(t => t.name).join(', ')}.`} Each employed Scientist can use $${SYNCHRONIZED_SOUND.usableBudgetPerScientist.toLocaleString('en-US')}/week of the ceiling; up to ${RESEARCH_SCIENTISTS_PER_STUDIO} Scientists may be employed.`,
    scientistId: person?.id ?? null,
    scientistLabel: seatedPeople.length ? seatedPeople.map(seatLine).join('\n')
      : employedScientist ? `${employedScientist.name} is employed. Assign this Scientist to a Laboratory seat to create the research project. ${scientistEmploymentDetail(state, employedScientist.id)}`
        : 'No Scientist assigned. Employ a named Scientist, then assign a Laboratory seat.',
    budgetLabel: project ? `${money(project.budgetPerWeek)}/week requested ceiling · ${money(quote?.spend ?? 0)}/week currently usable R&D · ${money(Math.max(0, project.budgetPerWeek - (quote?.spend ?? 0)))}/week of the ceiling is not currently charged · ${money(project.expenditure)} spent on this project. Payroll and employment overhead are separate. A $0 ceiling allows baseline work while active and prerequisites are met.` : 'No research budget is active.',
    bottleneckLabel: project && quote ? bottleneckLabelFor(state, own, project, quote) : instrumentsOperational
      ? 'Acoustic instruments are operational. Assign one Scientist before research can begin.'
      : 'Assign one Scientist and install acoustic instruments before research can begin.',
    estimateLabel: project ? estimateLabelFor(state, project, estimate)
      : `No completion estimate while prerequisites are blocked. Research opens ${campaignDate(SYNCHRONIZED_SOUND.researchableWeek).label}.`,
    progressLabel: project ? progressLabelFor(project) : `${SYNCHRONIZED_SOUND.work} verified units are required for synchronized sound. Research has not begun.`,
    provenanceLabel: project?.completedWeek !== null && project?.completedWeek !== undefined
      ? `${(project.weeks.at(-1)?.seatTalentIds ?? [project.legacy?.scientistId ?? '']).map(id => state.talent.find(t => t.id === id)?.name ?? id).filter(Boolean).join(', ') || 'The seated Scientists'} completed synchronized sound for your studio at ${campaignDate(project.completedWeek).label}. This research record belongs to this campaign.` : 'No completed synchronized-sound invention is recorded for this Laboratory.',
    commercialLabel: access?.acquiredWeek !== null && access?.acquiredWeek !== undefined
      ? `Access acquired by ${access.route} at ${campaignDate(access.acquiredWeek).label}. Access alone does not provide physical sound capability.`
      : `Commercial access ${state.market.tick >= SYNCHRONIZED_SOUND.commercialWeek ? 'is available' : 'opens'} ${campaignDate(SYNCHRONIZED_SOUND.commercialWeek).label} for ${money(SYNCHRONIZED_SOUND.accessCost)}. ${access?.route === 'wait' ? 'Your studio has chosen to wait. ' : ''}Silent films remain lawful.`,
    installationLabel: committedInstallationLabel(state, lab.facilityId, 'acoustic-instruments') + '\n' +
      (physical.length ? physical.map(a => `${name(a.stageFacilityId)} + ${name(a.postFacilityId)} · ${a.operationalWeek === null ? 'chain installation underway' : 'chain operational since ' + campaignDate(a.operationalWeek).label}. ` +
        `Committed installation payment ${money(a.installationCost)}; equipment payment ${money(a.equipmentCost)}.\n` +
        committedInstallationLabel(state, a.stageFacilityId, 'synchronized-sound-stage') + '\n' +
        committedInstallationLabel(state, a.postFacilityId, 'synchronized-sound-post')).join('\n') :
        'No synchronized stage, capture and Post chain is operational. Research or purchase must be followed by an exact physical installation.'),
    actions: actions.slice(page * pageSize, (page + 1) * pageSize).map(a => ({ id: a.id, label: a.label, detail: a.detail,
      enabled: a.enabled && enabled.has(a.id), disabledReason: a.disabledReason ?? (enabled.has(a.id) ? null : 'Refresh this Laboratory to review the current decision.'), intent: enabled.get(a.id) ?? null,
      // P13B-S5/S6: the engine's own quote for an `adopt-*` or `cancel-*` row; null on every
      // other row. Deep-copied either way, so the page owns every array it publishes.
      quote: a.quote === null ? null : structuredClone(a.quote),
      // P13B-S7: present on the purchase and adopt rows alone; omitted, never defaulted, elsewhere.
      ...replacementLabelFor(a.action) })),
    // P13B-S1b: the same engine facts as data. Seat history (released rows included) in stored
    // order, the last eight worked-week receipts ascending, and the CURRENT week's quote.
    seats: (project?.seats ?? []).filter(seat => seat.laboratoryFacilityId === lab.facilityId).map(seat => seatRow(state, seat)),
    // P13B-S2: `units` is the project credit over 1/160,000 (was 1/20,000) and `labs` carries
    // the stored per-Laboratory rows, `null` exactly where the stored receipt has none.
    receipts: (project?.weeks ?? []).slice(-8).map(receiptRow),
    weekly: weeklyRow(project, quote),
    // P13B-S2: every project this body carries, in stable project-id order. The members above
    // remain the synchronized-sound project alone and are superseded by these rows.
    projects: projectsOnLaboratory(state, own, lab.facilityId).map(p => laboratoryProjectRow(state, own, p)),
    // P13B-S5: this studio's own COMMITTED adoptions, in stored order, on every Laboratory
    // page. A rival's adoption is filtered out here and never reaches this private page.
    adoptions: state.technology.adoptions.filter(a => a.studioId === own).map(adoptionRow),
    // P13B-S6: this studio's own equipment sets, in mint order. `holderAdoptionId` is
    // null exactly while no live adoption holds the set — the fact a later adoption's
    // $0 reuse follows from. A rival's asset never reaches this private page.
    equipment: equipmentAssets(state, own).map(equipmentRow),
    // P13B-S7: the public availability milestone of every catalogue technology, in catalogue
    // order, derived from the catalogue and this campaign's week alone. No rival fact reaches
    // it, so two campaigns at the same week publish byte-identical rows.
    forecast: TECHNOLOGY_CATALOGUE.map(entry => forecastRow(entry, state.market.tick)),
  } }
}
