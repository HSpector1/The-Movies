# REF-V — exact source excerpts

Repository: `HSpector1/The-Movies`
Commit: `45ca33650074ad5413c39fb9d4a5c04cd6571c3a`
Path: `src/core/hollywoodValidation.ts`
Full source Git blob: `49dc4aad3b899b94cc7e45880922e257e261bf3b`
Full source SHA-256: `0d5b5026d1e3102db1ed8bdfea40396c2bdc35aa6aa90f5a094a9c91bc3f9e52`
Full source bytes: 43304

[Immutable source](https://github.com/HSpector1/The-Movies/blob/45ca33650074ad5413c39fb9d4a5c04cd6571c3a/src/core/hollywoodValidation.ts)

Selected lines only. Historical source; instructions and proposed numbers retain their original authority and are not execution orders.

## Original lines 201–250

```text
    for(const id of productionCompanyTalentIds([p]))claimAssignment(id,p.id)
  }
  for(const p of state.studio.activeProductions)verifyParticipants(p,false)
  for(const a of activeScriptWriterAssignments(state.scriptDevelopment,state.concepts))claimAssignment(a.talentId,`${h.playerStudioId}:${a.projectId}`)
  for (const b of h.businesses) {
    exact(b,['studioId','entryKey','account','standing','operations','development','productions','activeScriptOrdinals','activeRunFilmOrdinals','releaseAuthority','runs','projects','nextDecisionWeek','policy'])
    requireFact(!businesses.has(b.studioId) && studios.get(b.studioId)?.role === 'rival' && studios.get(b.studioId)!.enteredWeek !== null,'duplicate/unknown business'); businesses.add(b.studioId)
    requireFact(b.entryKey === `${b.studioId}:entry`,'entry key mismatch'); integer(b.nextDecisionWeek); standing(b.standing)
    requireFact(b.nextDecisionWeek>=state.market.tick && b.nextDecisionWeek<=Math.max(state.market.tick,studios.get(b.studioId)!.enteredWeek!)+TUNING.HOLLYWOOD_DECISION_WEEKS,'decision boundary differs from actual cadence')
    exact(b.policy,['version','affinities','negativeScale','marketingRatio','reserveWeeks'])
    requireFact(b.policy.version === 1,'unknown policy version'); exact(b.policy.affinities,GENRE_ORDER)
    for (const n of Object.values(b.policy.affinities)) number(n,0,10)
    number(b.policy.negativeScale,.5,2); number(b.policy.marketingRatio,0,1); integer(b.policy.reserveWeeks)
    exact(b.account,['openingBalance','openingBasis','cash','periods']); number(b.account.openingBalance,0); number(b.account.cash)
    requireFact(b.account.openingBasis === 'before-capacity-and-signing','unknown opening basis'); list(b.account.periods)
    requireFact(b.account.periods.length > 0,'missing reconciliation')
    let balance = b.account.openingBalance; let through = studios.get(b.studioId)!.enteredWeek!
    for (const p of b.account.periods) {
      exact(p,['fromWeek','throughWeek','opening','closing','movements']); integer(p.fromWeek); integer(p.throughWeek)
      requireFact(p.fromWeek >= through && p.throughWeek >= p.fromWeek && p.throughWeek <= state.market.tick,'period chronology'); through=p.throughWeek
      number(p.opening); number(p.closing); exact(p.movements,moneyKinds)
      if (technology !== undefined) {
        const inPeriod = (week: number) => week >= p.fromWeek && week <= p.throughWeek
        const access = technology.access.filter(a => a.studioId === b.studioId && a.acquiredWeek !== null && inPeriod(a.acquiredWeek)).reduce((s,a)=>s+a.accessCost,0)
        const adoption = technology.adoptions.filter(a => a.studioId === b.studioId && inPeriod(a.committedWeek)).reduce((s,a)=>s+a.equipmentCost+a.installationCost,0)
        requireFact(p.movements.technologyAdoption === -access-adoption, 'technology adoption movements do not reconcile with receipts')
      }
      for (const [kind,n] of Object.entries(p.movements)) number(n,kind === 'studioRevenue' ? 0 : -Infinity,kind === 'studioRevenue' ? Infinity : 0)
      requireFact(close(balance,p.opening) && close(p.opening+Object.values(p.movements).reduce((a,n)=>a+n,0),p.closing),'unreconciled money')
      balance=p.closing
    }
    requireFact(close(balance,b.account.cash),'cash differs from reconciliation')
    const template = HOLLYWOOD_STARTING_MANIFEST.studios[studios.get(b.studioId)!.row-1]!
    requireFact(b.account.openingBalance === template.capital,'opening balance differs from entry endowment')
    const movements = Object.fromEntries(moneyKinds.map(kind => [kind,b.account.periods.reduce((sum,p)=>sum+p.movements[kind],0)])) as Record<string,number>
    requireFact(close(movements.capacity!, -(TUNING.BASELINE_DEVELOPMENT_CASTING_CAPEX + TUNING.STAGE_STANDARD_CAPEX +
      TUNING.SCENERY_SHOP_CAPEX + TUNING.POST_BUILDING_CAPEX)),'capacity acquisition not paid exactly once')
    const employed = h.employment.filter(e=>e.studioId===b.studioId)
    const employmentForPerson=new Map<string,typeof employed>()
    for(const e of employed){const rows=employmentForPerson.get(e.terms.talentId)??[];rows.push(e);employmentForPerson.set(e.terms.talentId,rows)}
    const scriptById=new Map(b.development.projects.map(p=>[p.id,p]))
    requireFact(scriptById.size===b.development.projects.length,'duplicate screenplay identity')
    const activeProductionById=new Map(b.productions.map(p=>[p.id,p]))
    requireFact(close(movements.signing!, -employed.reduce((sum,e)=>sum+e.terms.signingBonus,0)),'signing bonuses do not reconcile')
    const personWeeks = employed.map(e=>Math.max(0,Math.min(state.market.tick,e.endedWeek ?? e.terms.endWeekExclusive)-e.terms.startWeek))
    requireFact(close(movements.payroll!, -employed.reduce((sum,e,i)=>sum+personWeeks[i]!*weeklySalary(e.terms.annualSalary),0)), 'payroll does not reconcile with employment intervals')
    const elapsed = state.market.tick-studios.get(b.studioId)!.enteredWeek!
    requireFact(close(movements.overhead!, -(elapsed*TUNING.OVERHEAD_BASE+personWeeks.reduce((a,b)=>a+b,0)*TUNING.OVERHEAD_PER_EMPLOYEE)), 'overhead does not reconcile')
    requireFact(close(movements.facilityOpex!, -elapsed*rivalCapacityOpex(b)), 'facility operating costs do not reconcile')
    for(const kind of ['development','production','marketing'] as const) requireFact(close(movements[kind]!, -b.projects.reduce((sum,p)=>sum+p[kind],0)), `${kind} commitments do not reconcile`)
```
