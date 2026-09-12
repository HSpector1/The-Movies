# REF-B — exact source excerpts

Repository: `HSpector1/The-Movies`
Commit: `45ca33650074ad5413c39fb9d4a5c04cd6571c3a`
Path: `bridge/laboratory.ts`
Full source Git blob: `0d4ba4d7cc7f414dab2092eb2dba2da65c6b40cc`
Full source SHA-256: `fb02a74bfe82f6b9d818f23deb683ccb132cea86445f431ff7507fb8bbbc4cca`
Full source bytes: 19688

[Immutable source](https://github.com/HSpector1/The-Movies/blob/45ca33650074ad5413c39fb9d4a5c04cd6571c3a/bridge/laboratory.ts)

Selected lines only. Historical source; instructions and proposed numbers retain their original authority and are not execution orders.

## Original lines 38–80

```text
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
```

## Original lines 154–204

```text
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
```
