/** P13A's private player Laboratory read side. Engine actions/quotes remain the authority. */
import { applyActions } from '../src/core/actions.js'
import { campaignDate } from '../src/core/calendar.js'
import { activeContract, economyEngaged, offerForTalent, weeklySalary } from '../src/core/employment.js'
import { weeklyBurn, weeklyOverhead } from '../src/core/economyView.js'
import { hasOperationalFacilityInstallation } from '../src/core/facilityEffects.js'
import { queryFacilityInstallation } from '../src/core/placement.js'
import { researchWeekQuote, SYNCHRONIZED_SOUND, weeklyResearchPayroll } from '../src/core/technology.js'
import type { TechnologyAction } from '../src/core/technologyTypes.js'
import type { GameState } from '../src/core/types.js'
import { generateScientist } from '../src/core/worldgen.js'
import type { AvailableIntent } from './protocol.ts'
import type { IndustryPage } from './schema/industry-schema.ts'

type LaboratoryPage = NonNullable<IndustryPage['laboratory']>
export type LaboratoryActionSpec = {
  id: string
  buildingId: string | null
  action: TechnologyAction
  label: string
  detail: string
  enabled: boolean
  disabledReason: string | null
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

/** Bounded by the player's actual facilities/productions, cached only by immutable campaign state. */
export function laboratoryActionSpecs(state: GameState): readonly LaboratoryActionSpec[] {
  const prior = quotes.get(state)
  if (prior) return prior
  const specs: LaboratoryActionSpec[] = []
  if (!state.technology || !state.hollywood || state.founding !== null || !economyEngaged(state)) return specs
  const own = state.hollywood.playerStudioId
  function add(id: string, action: TechnologyAction, label: string, detail: string, buildingId: string | null = null, refusal: string | null = null) {
    let disabledReason = refusal
    if (disabledReason === null) {
      try {
        const next = applyActions(state, [action])
        if (next === state) throw new Error('This decision is not currently available.')
        const paid = state.studio.cash - next.studio.cash
        detail += ` ${money(paid)} charged now. Cash after this decision: ${money(next.studio.cash)}.`
        if (action.kind === 'adoptSynchronizedSound') {
          const adoption = next.technology.adoptions.find(a => a.studioId === own && a.stageFacilityId === action.stageFacilityId)
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
    specs.push({ id, action, label, detail, buildingId, enabled: disabledReason === null, disabledReason })
  }
  const labs = state.placement.facilities.filter(p => p.blueprintId === 'research-laboratory' && p.installation === undefined)
  const scientists = ordered(state.talent.filter(t => t.role === 'scientist' && activeContract(state, t.id)))
  for (const lab of labs) {
    const buildingId = `placed-${lab.id}`
    const project = state.technology.projects.find(p => p.studioId === own && p.laboratoryFacilityId === lab.facilityId)
    if (scientists.length === 0) {
        const candidate = state.talent.find(person => person.role === 'scientist') ?? generateScientist(state.seed)
        const offer = offerForTalent(state.seed, candidate, 208, state.market.tick)
        add(`recruit-${lab.id}`, { kind: 'recruitScientist', laboratoryFacilityId: lab.facilityId },
          `Employ ${candidate.name} · Scientist`,
          `Offer ${candidate.name} a ${offer.termWeeks}-week contract: ${money(weeklySalary(offer.annualSalary))}/week, ` +
          `${money(offer.signingBonus)} signing bonus. ` +
          (project
            ? 'Employment resumes now. The existing Laboratory assignment and verified work are retained. '
            : 'Employment begins now; assigning the Laboratory seat is a separate decision. ') +
          `This contract ends ${campaignDate(offer.endWeekExclusive).label}. ` +
          (offer.endWeekExclusive <= SYNCHRONIZED_SOUND.researchableWeek
            ? `${offer.endWeekExclusive < SYNCHRONIZED_SOUND.researchableWeek ? 'It ends before research opens' : 'It expires as research opens'} ${campaignDate(SYNCHRONIZED_SOUND.researchableWeek).label}: payroll starts now, and another contract will be needed before this Scientist can begin research.`
            : state.market.tick < SYNCHRONIZED_SOUND.researchableWeek
              ? `Payroll starts now, while research opens ${campaignDate(SYNCHRONIZED_SOUND.researchableWeek).label}.`
              : ''), buildingId)
    }
    if (!project) {
      for (const person of scientists) add(`assign-${lab.id}-${person.id}`,
        { kind: 'assignResearchScientist', laboratoryFacilityId: lab.facilityId, scientistId: person.id },
        `Assign ${person.name}`, `Assign this named Scientist to this Laboratory's synchronized-sound project. No R&D is charged until the project runs.`, buildingId)
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
    if (project && project.status !== 'completed') {
      if (project.status !== 'active') add(`run-${project.id}`, project.startedWeek === null
        ? { kind: 'beginResearch', projectId: project.id, budgetPerWeek: project.budgetPerWeek }
        : { kind: 'resumeResearch', projectId: project.id },
      project.startedWeek === null ? 'Begin synchronized-sound research' : project.status === 'cancelled' ? 'Restart retained research' : 'Resume research',
      `Use the assigned Scientist and the project's ${money(project.budgetPerWeek)}/week budget ceiling. Verified work remains ${project.verifiedWork} of ${SYNCHRONIZED_SOUND.work} units. Usable R&D is charged only when time advances.`, buildingId)
      if (project.status === 'active') add(`pause-${project.id}`, { kind: 'pauseResearch', projectId: project.id },
        'Pause research', 'Stop new R&D spend and retain all verified work. The Scientist remains employed and payroll continues.', buildingId)
      if (project.status !== 'cancelled') add(`cancel-${project.id}`, { kind: 'cancelResearch', projectId: project.id },
        'Cancel project · retain verified work', `Retain ${project.verifiedWork} verified units for a later restart. Prior expenditure is not refunded. The employment contract and payroll continue.`, buildingId)
      for (const amount of [0, 2_500, 10_000, 40_000]) add(`budget-${project.id}-${amount}`,
        { kind: 'setResearchBudget', projectId: project.id, budgetPerWeek: amount },
        `Set R&D ceiling: ${money(amount)}/week`,
        `Set this project's weekly ceiling to ${money(amount)}. One Scientist can use at most ${money(SYNCHRONIZED_SOUND.usableBudgetPerScientist)}/week; money above that is not charged. Payroll is separate. A $0 ceiling allows baseline research work while active.`, buildingId,
        project.budgetPerWeek === amount ? 'This is already the selected budget ceiling.' : null)
    }
  }
  add('wait-synchronized-sound', { kind: 'waitForTechnology', technologyId: SYNCHRONIZED_SOUND.id },
    'Wait for commercial sound', `Record deliberate waiting for ${campaignDate(SYNCHRONIZED_SOUND.commercialWeek).label}. No access payment or capability is granted. Existing research and employment continue unless you pause or cancel them separately.`)
  add('purchase-synchronized-sound', { kind: 'purchaseTechnology', technologyId: SYNCHRONIZED_SOUND.id },
    'Purchase synchronized-sound access', `Commercial access costs ${money(SYNCHRONIZED_SOUND.accessCost)} from ${campaignDate(SYNCHRONIZED_SOUND.commercialWeek).label}. This buys knowledge access; select and fund an exact stage, capture and Post installation separately before filming with sound.`)
  const stages = ordered(state.operations.facilities.filter(f => f.capability === 'soundstage'))
  const posts = ordered(state.operations.facilities.filter(f => f.capability === 'post'))
  for (const stage of stages) for (const post of posts) {
    if (state.technology.adoptions.some(a => a.studioId === own && a.stageFacilityId === stage.id)) continue
    add(`adopt-${stage.id}-${post.id}`, { kind: 'adoptSynchronizedSound', stageFacilityId: stage.id, postFacilityId: post.id },
      `Install sound: ${stage.name} + ${post.name}`,
      `${stage.name}: ${installationDetail(state, 'synchronized-sound-stage', stage.id)} ` +
      (hasOperationalFacilityInstallation(state, post.id, 'synchronized-sound-post') ? `${post.name}: reuse its operational sound Post fit-out. ` :
        `${post.name}: ${installationDetail(state, 'synchronized-sound-post', post.id)} `) +
      'The quoted payment below includes the applicable equipment entitlement. Films that have entered the filming phase keep their technology, even before the first take.')
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
  const project = state.technology.projects.find(p => p.studioId === own && p.laboratoryFacilityId === lab.facilityId)
  const person = project ? state.talent.find(t => t.id === project.scientistId) : null
  const employedScientist = ordered(state.talent.filter(t => t.role === 'scientist' && activeContract(state, t.id)))[0]
  const instrumentsOperational = hasOperationalFacilityInstallation(state, lab.facilityId, 'acoustic-instruments')
  const quote = project ? researchWeekQuote(state, project) : null
  const estimate = project && project.status !== 'completed' ? researchWeekQuote(state, { ...project, status: 'active' }) : null
  const access = state.technology.access.find(a => a.studioId === own && a.technologyId === SYNCHRONIZED_SOUND.id)
  const physical = state.technology.adoptions.filter(a => a.studioId === own)
  const name = (id: string) => state.operations.facilities.find(f => f.id === id)?.name ?? id
  const operational = physical.filter(adoption => adoption.operationalWeek !== null)
  const actions = laboratoryActionSpecs(state).filter(a => a.buildingId === null || a.buildingId === buildingId)
  const pageCount = Math.ceil(actions.length / pageSize)
  if (page > 0 && page >= pageCount) throw new Error('That Laboratory action page is outside this snapshot. Return to the first page.')
  const enabled = new Map(intents.map(i => [i.spec.id, i.option]))
  return { totalRows: actions.length, pageCount, laboratory: {
    buildingId: buildingId!, title: state.operations.facilities.find(f => f.id === lab.facilityId)?.name ?? 'Research Laboratory',
    statusLabel: lab.status === 'operational' ? 'Laboratory operational' : `Laboratory under construction · opens ${campaignDate(lab.completesWeek).label}`,
    seatLabel: `Seats assigned: ${project ? 1 : 0} of ${state.operations.facilities.find(f => f.id === lab.facilityId)?.capacity ?? 4}. This research programme uses one assigned Scientist.`,
    scientistId: person?.id ?? null,
    scientistLabel: person ? `${person.name} · ${activeContract(state, person.id) ? 'employed Scientist' : 'contract no longer active'} · ${money(weeklyResearchPayroll(state))}/week Scientist payroll`
      : employedScientist ? `${employedScientist.name} is employed. Assign this Scientist to the Laboratory seat to create the research project.`
        : 'No Scientist assigned. Employ a named Scientist, then assign this Laboratory seat.',
    budgetLabel: project ? `${money(project.budgetPerWeek)}/week requested ceiling · ${money(quote?.spend ?? 0)}/week currently usable R&D · ${money(project.expenditure)} spent on this project. Payroll is separate.` : 'No research budget is active.',
    bottleneckLabel: project?.status === 'completed'
      ? operational.length > 0
        ? `Research is complete. Synchronized dialogue is ready on ${operational.map(adoption => `${name(adoption.stageFacilityId)} + ${name(adoption.postFacilityId)}`).join('; ')}. Select an operational chain before the production enters the filming phase, when its technology locks before the first take.`
        : physical.length > 0 ? 'Research is complete. The committed physical installation must finish before synchronized dialogue is available.'
          : 'Research is complete. Physical installation is the remaining capability gate.'
      : quote?.bottleneck ?? (instrumentsOperational
        ? 'Acoustic instruments are operational. Assign one Scientist before research can begin.'
        : 'Assign one Scientist and install acoustic instruments before research can begin.'),
    estimateLabel: project?.status === 'completed' ? `Research completed ${campaignDate(project.completedWeek!).label}.` : estimate?.remainingWeeks !== null && estimate?.remainingWeeks !== undefined
      ? `${project?.status === 'active' ? 'At current funding' : 'If resumed now'}: ${estimate.remainingWeeks} funded weeks remain; estimated research completion ${campaignDate(state.market.tick + estimate.remainingWeeks).label}. Physical installation follows separately.`
      : `No completion estimate while prerequisites are blocked. Research opens ${campaignDate(SYNCHRONIZED_SOUND.researchableWeek).label}.`,
    progressLabel: project ? `${project.verifiedWork} of ${SYNCHRONIZED_SOUND.work} verified units · ${project.status}. Verified work survives cancel and restart.` : `${SYNCHRONIZED_SOUND.work} verified units are required for synchronized sound. Research has not begun.`,
    provenanceLabel: project?.completedWeek !== null && project?.completedWeek !== undefined
      ? `${person?.name ?? project.scientistId} completed synchronized sound for your studio at ${campaignDate(project.completedWeek).label}. This research record belongs to this campaign.` : 'No completed synchronized-sound invention is recorded for this Laboratory.',
    commercialLabel: access?.acquiredWeek !== null && access?.acquiredWeek !== undefined
      ? `Access acquired by ${access.route} at ${campaignDate(access.acquiredWeek).label}. Access alone does not provide physical sound capability.`
      : `Commercial access ${state.market.tick >= SYNCHRONIZED_SOUND.commercialWeek ? 'is available' : 'opens'} ${campaignDate(SYNCHRONIZED_SOUND.commercialWeek).label} for ${money(SYNCHRONIZED_SOUND.accessCost)}. ${access?.route === 'wait' ? 'Your studio has chosen to wait. ' : ''}Silent films remain lawful.`,
    installationLabel: physical.length ? physical.map(a => `${name(a.stageFacilityId)} + ${name(a.postFacilityId)} · ${a.operationalWeek === null ? 'installation underway' : 'operational since ' + campaignDate(a.operationalWeek).label}`).join('\n') : 'No synchronized stage, capture and Post chain is operational. Research or purchase must be followed by an exact physical installation.',
    actions: actions.slice(page * pageSize, (page + 1) * pageSize).map(a => ({ id: a.id, label: a.label, detail: a.detail,
      enabled: a.enabled && enabled.has(a.id), disabledReason: a.disabledReason ?? (enabled.has(a.id) ? null : 'Refresh this Laboratory to review the current decision.'), intent: enabled.get(a.id) ?? null })),
  } }
}
